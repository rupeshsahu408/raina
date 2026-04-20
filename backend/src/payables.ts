import express from "express";
import multer from "multer";
import { google } from "googleapis";
import { connectMongo } from "./db";
import { Invoice } from "./models/Invoice";
import { InboxToken } from "./models/InboxToken";
import { callNvidiaChatCompletions } from "./ai/nvidiaClient";

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 20 * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    const allowed = ["image/jpeg", "image/png", "image/webp", "application/pdf"];
    cb(null, allowed.includes(file.mimetype));
  },
});

export const payablesRouter = express.Router();

const NVIDIA_API_KEY = process.env.NVIDIA_API_KEY ?? "";
const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID ?? "";
const GOOGLE_CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET ?? "";
const GOOGLE_REDIRECT_URI =
  process.env.GOOGLE_REDIRECT_URI ?? "https://raina-1.onrender.com/inbox/callback";

function makeOAuth2Client() {
  return new google.auth.OAuth2(GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET, GOOGLE_REDIRECT_URI);
}

async function getGmailClient(uid: string) {
  await connectMongo();
  const record = await InboxToken.findOne({ uid });
  if (!record) throw new Error("No Gmail connection found.");
  const oauth2 = makeOAuth2Client();
  oauth2.setCredentials({
    access_token: record.accessToken,
    refresh_token: record.refreshToken,
    expiry_date: record.expiresAt,
  });
  const { credentials } = await oauth2.refreshAccessToken();
  if (credentials.access_token && credentials.access_token !== record.accessToken) {
    record.accessToken = credentials.access_token;
    if (credentials.expiry_date) record.expiresAt = credentials.expiry_date;
    await record.save();
  }
  oauth2.setCredentials(credentials);
  return oauth2;
}

async function extractInvoiceDataFromImage(
  imageBase64: string,
  mimeType: string
): Promise<Record<string, unknown>> {
  const prompt = `You are an expert accounts payable AI. Extract all invoice data from this image and return ONLY a valid JSON object with these exact fields (use null for missing fields):
{
  "vendor": "string - company name",
  "vendorEmail": "string - vendor email if present",
  "invoiceNumber": "string",
  "invoiceDate": "string - ISO date YYYY-MM-DD",
  "dueDate": "string - ISO date YYYY-MM-DD",
  "currency": "string - 3-letter code like USD, INR, EUR",
  "subtotal": number,
  "tax": number,
  "total": number,
  "lineItems": [{"description": "string", "quantity": number, "unitPrice": number, "amount": number}],
  "notes": "string - any payment terms or notes",
  "confidence": number between 0 and 1
}
Return ONLY the JSON. No markdown. No explanation.`;

  try {
    const response = await callNvidiaChatCompletions({
      apiKey: NVIDIA_API_KEY,
      model: "meta/llama-3.2-11b-vision-instruct",
      messages: [
        {
          role: "user",
          content: `${prompt}\n\n[IMAGE DATA:${mimeType}:base64]${imageBase64}`,
        },
      ],
      max_tokens: 1500,
    });

    const text = response?.choices?.[0]?.message?.content ?? "";
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) return {};
    return JSON.parse(jsonMatch[0]);
  } catch {
    return {};
  }
}

async function extractInvoiceDataFromText(text: string): Promise<Record<string, unknown>> {
  try {
    const response = await callNvidiaChatCompletions({
      apiKey: NVIDIA_API_KEY,
      model: "nvidia/llama-3.1-nemotron-70b-instruct",
      messages: [
        {
          role: "user",
          content: `You are an expert accounts payable AI. Extract all invoice data from this email/text and return ONLY a valid JSON object with these exact fields (use null for missing fields):
{
  "vendor": "string - company/sender name",
  "vendorEmail": "string - sender email",
  "invoiceNumber": "string",
  "invoiceDate": "string - ISO date YYYY-MM-DD",
  "dueDate": "string - ISO date YYYY-MM-DD",
  "currency": "string - 3-letter code like USD, INR, EUR",
  "subtotal": number,
  "tax": number,
  "total": number,
  "lineItems": [{"description": "string", "quantity": number, "unitPrice": number, "amount": number}],
  "notes": "string - any payment terms or notes",
  "confidence": number between 0 and 1
}

EMAIL/TEXT TO EXTRACT FROM:
${text.slice(0, 4000)}

Return ONLY the JSON. No markdown. No explanation.`,
        },
      ],
      max_tokens: 1000,
    });
    const content = response?.choices?.[0]?.message?.content ?? "";
    const jsonMatch = content.match(/\{[\s\S]*\}/);
    if (!jsonMatch) return {};
    return JSON.parse(jsonMatch[0]);
  } catch {
    return {};
  }
}

function applyExtracted(invoice: InstanceType<typeof Invoice>, data: Record<string, unknown>) {
  if (data.vendor) (invoice as any).vendor = data.vendor;
  if (data.vendorEmail) (invoice as any).vendorEmail = data.vendorEmail;
  if (data.invoiceNumber) (invoice as any).invoiceNumber = data.invoiceNumber;
  if (data.invoiceDate) (invoice as any).invoiceDate = data.invoiceDate;
  if (data.dueDate) (invoice as any).dueDate = data.dueDate;
  if (data.currency) (invoice as any).currency = data.currency;
  if (typeof data.subtotal === "number") (invoice as any).subtotal = data.subtotal;
  if (typeof data.tax === "number") (invoice as any).tax = data.tax;
  if (typeof data.total === "number") (invoice as any).total = data.total;
  if (Array.isArray(data.lineItems)) (invoice as any).lineItems = data.lineItems;
  if (data.notes) (invoice as any).notes = data.notes;
  if (typeof data.confidence === "number") (invoice as any).confidence = data.confidence;
}

payablesRouter.post("/upload", upload.single("invoice"), async (req, res) => {
  try {
    const uid = req.headers["x-uid"] as string;
    if (!uid) return res.status(401).json({ error: "Unauthorized" });
    if (!req.file) return res.status(400).json({ error: "No file provided" });

    await connectMongo();

    const invoice = new Invoice({
      uid,
      source: "upload",
      status: "processing",
      originalFileName: req.file.originalname,
    }) as any;
    await invoice.save();

    setImmediate(async () => {
      try {
        const base64 = req.file!.buffer.toString("base64");
        const extracted = await extractInvoiceDataFromImage(base64, req.file!.mimetype);
        applyExtracted(invoice, extracted);
        invoice.status = "extracted";
        await invoice.save();
      } catch {
        invoice.status = "extracted";
        await invoice.save();
      }
    });

    res.json({ success: true, invoiceId: invoice._id });
  } catch (err) {
    console.error("Payables upload error:", err);
    res.status(500).json({ error: "Upload failed" });
  }
});

payablesRouter.post("/fetch-gmail", async (req, res) => {
  try {
    const uid = req.headers["x-uid"] as string;
    if (!uid) return res.status(401).json({ error: "Unauthorized" });

    await connectMongo();

    let auth: Awaited<ReturnType<typeof getGmailClient>>;
    try {
      auth = await getGmailClient(uid);
    } catch {
      return res.status(400).json({ error: "Gmail not connected. Please connect your Gmail first." });
    }

    const gmail = google.gmail({ version: "v1", auth });

    const listRes = await gmail.users.messages.list({
      userId: "me",
      q: 'subject:(invoice OR "payment due" OR "bill" OR receipt) has:attachment -in:sent newer_than:30d',
      maxResults: 20,
    });

    const messages = listRes.data.messages ?? [];
    if (!messages.length) {
      return res.json({ success: true, fetched: 0, message: "No invoice emails found in the last 30 days." });
    }

    let fetched = 0;

    for (const msg of messages) {
      if (!msg.id) continue;
      const existing = await Invoice.findOne({ uid, gmailMessageId: msg.id });
      if (existing) continue;

      const full = await gmail.users.messages.get({ userId: "me", id: msg.id, format: "full" });
      const payload = full.data.payload;
      if (!payload) continue;

      const headers = payload.headers ?? [];
      const subject = headers.find((h) => h.name === "Subject")?.value ?? "";
      const from = headers.find((h) => h.name === "From")?.value ?? "";

      let bodyText = "";
      function extractText(parts: typeof payload.parts) {
        if (!parts) return;
        for (const part of parts) {
          if (part.mimeType === "text/plain" && part.body?.data) {
            bodyText += Buffer.from(
              part.body.data.replace(/-/g, "+").replace(/_/g, "/"),
              "base64"
            ).toString("utf-8");
          }
          if (part.parts) extractText(part.parts);
        }
      }
      if (payload.body?.data) {
        bodyText = Buffer.from(
          payload.body.data.replace(/-/g, "+").replace(/_/g, "/"),
          "base64"
        ).toString("utf-8");
      }
      extractText(payload.parts);

      const rawText = `Subject: ${subject}\nFrom: ${from}\n\n${bodyText}`;

      const invoice = new Invoice({
        uid,
        source: "gmail",
        status: "processing",
        gmailMessageId: msg.id,
        rawText,
      }) as any;
      await invoice.save();
      fetched++;

      setImmediate(async () => {
        try {
          const extracted = await extractInvoiceDataFromText(rawText);
          applyExtracted(invoice, extracted);
          invoice.status = "extracted";
          await invoice.save();
        } catch {
          invoice.status = "extracted";
          await invoice.save();
        }
      });
    }

    res.json({ success: true, fetched });
  } catch (err) {
    console.error("Payables Gmail fetch error:", err);
    res.status(500).json({ error: "Failed to fetch invoices from Gmail" });
  }
});

payablesRouter.get("/invoices", async (req, res) => {
  try {
    const uid = req.headers["x-uid"] as string;
    if (!uid) return res.status(401).json({ error: "Unauthorized" });

    await connectMongo();

    const { status, page = "1", limit = "20" } = req.query;
    const filter: Record<string, unknown> = { uid };
    if (status && status !== "all") filter.status = status;

    const pageNum = Math.max(1, parseInt(page as string, 10));
    const limitNum = Math.min(50, parseInt(limit as string, 10));
    const skip = (pageNum - 1) * limitNum;

    const [invoices, total] = await Promise.all([
      Invoice.find(filter)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limitNum)
        .lean(),
      Invoice.countDocuments(filter),
    ]);

    res.json({ invoices, total, page: pageNum, totalPages: Math.ceil(total / limitNum) });
  } catch (err) {
    console.error("Payables list error:", err);
    res.status(500).json({ error: "Failed to fetch invoices" });
  }
});

payablesRouter.get("/invoices/stats", async (req, res) => {
  try {
    const uid = req.headers["x-uid"] as string;
    if (!uid) return res.status(401).json({ error: "Unauthorized" });

    await connectMongo();

    const [stats] = await Invoice.aggregate([
      { $match: { uid } },
      {
        $group: {
          _id: null,
          total: { $sum: 1 },
          totalAmount: { $sum: "$total" },
          pendingCount: { $sum: { $cond: [{ $eq: ["$status", "pending_approval"] }, 1, 0] } },
          approvedCount: { $sum: { $cond: [{ $eq: ["$status", "approved"] }, 1, 0] } },
          processingCount: { $sum: { $cond: [{ $in: ["$status", ["processing", "extracted"]] }, 1, 0] } },
          pendingAmount: {
            $sum: {
              $cond: [{ $eq: ["$status", "pending_approval"] }, { $ifNull: ["$total", 0] }, 0],
            },
          },
          approvedAmount: {
            $sum: {
              $cond: [{ $eq: ["$status", "approved"] }, { $ifNull: ["$total", 0] }, 0],
            },
          },
        },
      },
    ]);

    res.json(
      stats ?? {
        total: 0,
        totalAmount: 0,
        pendingCount: 0,
        approvedCount: 0,
        processingCount: 0,
        pendingAmount: 0,
        approvedAmount: 0,
      }
    );
  } catch (err) {
    console.error("Payables stats error:", err);
    res.status(500).json({ error: "Failed to fetch stats" });
  }
});

payablesRouter.get("/invoices/:id", async (req, res) => {
  try {
    const uid = req.headers["x-uid"] as string;
    if (!uid) return res.status(401).json({ error: "Unauthorized" });

    await connectMongo();
    const invoice = await Invoice.findOne({ _id: req.params.id, uid }).lean();
    if (!invoice) return res.status(404).json({ error: "Invoice not found" });

    res.json(invoice);
  } catch (err) {
    console.error("Payables get invoice error:", err);
    res.status(500).json({ error: "Failed to fetch invoice" });
  }
});

payablesRouter.patch("/invoices/:id", async (req, res) => {
  try {
    const uid = req.headers["x-uid"] as string;
    if (!uid) return res.status(401).json({ error: "Unauthorized" });

    await connectMongo();
    const invoice = await Invoice.findOne({ _id: req.params.id, uid });
    if (!invoice) return res.status(404).json({ error: "Invoice not found" });

    const allowed = [
      "vendor","vendorEmail","invoiceNumber","invoiceDate","dueDate","currency",
      "subtotal","tax","total","lineItems","notes","status",
    ];
    for (const key of allowed) {
      if (req.body[key] !== undefined) (invoice as any)[key] = req.body[key];
    }

    if (req.body.status === "approved") {
      (invoice as any).approvedAt = new Date();
    }
    if (req.body.status === "rejected") {
      (invoice as any).rejectedAt = new Date();
      if (req.body.rejectionReason) (invoice as any).rejectionReason = req.body.rejectionReason;
    }

    await invoice.save();
    res.json(invoice);
  } catch (err) {
    console.error("Payables patch error:", err);
    res.status(500).json({ error: "Failed to update invoice" });
  }
});

payablesRouter.delete("/invoices/:id", async (req, res) => {
  try {
    const uid = req.headers["x-uid"] as string;
    if (!uid) return res.status(401).json({ error: "Unauthorized" });

    await connectMongo();
    await Invoice.deleteOne({ _id: req.params.id, uid });
    res.json({ success: true });
  } catch (err) {
    console.error("Payables delete error:", err);
    res.status(500).json({ error: "Failed to delete invoice" });
  }
});

payablesRouter.post("/invoices/:id/approve", async (req, res) => {
  try {
    const uid = req.headers["x-uid"] as string;
    if (!uid) return res.status(401).json({ error: "Unauthorized" });

    await connectMongo();
    const invoice = await Invoice.findOne({ _id: req.params.id, uid });
    if (!invoice) return res.status(404).json({ error: "Invoice not found" });

    (invoice as any).status = "approved";
    (invoice as any).approvedAt = new Date();
    await invoice.save();
    res.json(invoice);
  } catch (err) {
    console.error("Payables approve error:", err);
    res.status(500).json({ error: "Failed to approve invoice" });
  }
});

payablesRouter.post("/invoices/:id/reject", async (req, res) => {
  try {
    const uid = req.headers["x-uid"] as string;
    if (!uid) return res.status(401).json({ error: "Unauthorized" });

    await connectMongo();
    const invoice = await Invoice.findOne({ _id: req.params.id, uid });
    if (!invoice) return res.status(404).json({ error: "Invoice not found" });

    (invoice as any).status = "rejected";
    (invoice as any).rejectedAt = new Date();
    (invoice as any).rejectionReason = req.body.reason ?? "";
    await invoice.save();
    res.json(invoice);
  } catch (err) {
    console.error("Payables reject error:", err);
    res.status(500).json({ error: "Failed to reject invoice" });
  }
});

payablesRouter.get("/gmail/status", async (req, res) => {
  try {
    const uid = req.headers["x-uid"] as string;
    if (!uid) return res.status(401).json({ error: "Unauthorized" });
    await connectMongo();
    const token = await InboxToken.findOne({ uid });
    res.json({ connected: !!token, email: token ? (token as any).email : null });
  } catch {
    res.json({ connected: false, email: null });
  }
});
