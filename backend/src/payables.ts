import express from "express";
import multer from "multer";
import { google } from "googleapis";
import { connectMongo } from "./db";
import { Invoice, InvoiceFlag } from "./models/Invoice";
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

/* ─── AI Extraction ─── */

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

/* ─── Phase 2: Intelligence Engine ─── */

async function analyzeInvoice(invoiceId: string, uid: string): Promise<void> {
  try {
    await connectMongo();
    const invoice = await Invoice.findOne({ _id: invoiceId, uid }) as any;
    if (!invoice) return;

    const flags: InvoiceFlag[] = [];

    // 1. Missing critical fields
    const missing: string[] = [];
    if (!invoice.vendor) missing.push("vendor name");
    if (!invoice.total) missing.push("total amount");
    if (!invoice.dueDate) missing.push("due date");
    if (!invoice.invoiceNumber) missing.push("invoice number");
    if (missing.length > 0) {
      flags.push({
        type: "missing_fields",
        severity: missing.includes("total amount") ? "warning" : "info",
        message: `Could not extract: ${missing.join(", ")}. Please review and fill in manually.`,
      });
    }

    // 2. Duplicate detection — same vendor + invoiceNumber for this user
    if (invoice.vendor && invoice.invoiceNumber) {
      const duplicate = await Invoice.findOne({
        uid,
        vendor: invoice.vendor,
        invoiceNumber: invoice.invoiceNumber,
        _id: { $ne: invoice._id },
      }).lean();

      if (duplicate) {
        flags.push({
          type: "duplicate",
          severity: "critical",
          message: `Possible duplicate: An invoice from "${invoice.vendor}" with number #${invoice.invoiceNumber} already exists. Please verify before approving.`,
          relatedInvoiceId: (duplicate as any)._id.toString(),
        });
      }
    }

    // 3. Vendor verification — is this vendor new?
    if (invoice.vendor) {
      const previousCount = await Invoice.countDocuments({
        uid,
        vendor: invoice.vendor,
        _id: { $ne: invoice._id },
      });

      if (previousCount === 0) {
        invoice.isNewVendor = true;
        flags.push({
          type: "new_vendor",
          severity: "info",
          message: `"${invoice.vendor}" is a new vendor — this is their first invoice in your system. Verify their identity before approving.`,
        });
      } else {
        invoice.isNewVendor = false;
      }

      // 4. Amount anomaly detection — compare to vendor's historical average
      if (invoice.total && previousCount >= 2) {
        const vendorStats = await Invoice.aggregate([
          {
            $match: {
              uid,
              vendor: invoice.vendor,
              _id: { $ne: invoice._id },
              total: { $exists: true, $gt: 0 },
            },
          },
          {
            $group: {
              _id: null,
              avgTotal: { $avg: "$total" },
              maxTotal: { $max: "$total" },
              count: { $sum: 1 },
            },
          },
        ]);

        if (vendorStats.length > 0) {
          const { avgTotal, maxTotal } = vendorStats[0];
          const threshold = Math.max(avgTotal * 2.5, maxTotal * 1.5);
          if (invoice.total > threshold) {
            const pctOver = Math.round(((invoice.total - avgTotal) / avgTotal) * 100);
            flags.push({
              type: "amount_anomaly",
              severity: "warning",
              message: `This invoice total (${invoice.currency ?? ""}${invoice.total.toLocaleString()}) is ${pctOver}% higher than the average for "${invoice.vendor}" (avg: ${invoice.currency ?? ""}${Math.round(avgTotal).toLocaleString()}). Verify before approving.`,
            });
          }
        }
      }

      // 5. Overdue risk — due in less than 3 days
      if (invoice.dueDate && !["approved", "rejected", "paid"].includes(invoice.status)) {
        const daysUntil = Math.ceil(
          (new Date(invoice.dueDate).getTime() - Date.now()) / 86400000
        );
        if (daysUntil <= 3 && daysUntil >= 0) {
          flags.push({
            type: "overdue_risk",
            severity: daysUntil === 0 ? "critical" : "warning",
            message: daysUntil === 0
              ? `This invoice is due today! Approve and process payment immediately.`
              : `This invoice is due in ${daysUntil} day${daysUntil !== 1 ? "s" : ""}. Approve it soon to avoid late payment.`,
          });
        } else if (daysUntil < 0) {
          flags.push({
            type: "overdue_risk",
            severity: "critical",
            message: `This invoice was due ${Math.abs(daysUntil)} day${Math.abs(daysUntil) !== 1 ? "s" : ""} ago and has not been paid. Take action immediately.`,
          });
        }
      }
    }

    invoice.flags = flags;
    invoice.analysedAt = new Date();

    // Auto-promote to pending_approval if extracted and has no critical flags
    if (invoice.status === "extracted") {
      const hasCritical = flags.some((f) => f.severity === "critical");
      invoice.status = hasCritical ? "extracted" : "pending_approval";
    }

    await invoice.save();
  } catch (err) {
    console.error("[payables] analyzeInvoice error:", err);
  }
}

/* ─── Routes ─── */

/* Upload */
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
        // Phase 2: Run intelligence analysis
        await analyzeInvoice(invoice._id.toString(), uid);
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

/* Fetch Gmail */
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
          // Phase 2: Run intelligence analysis
          await analyzeInvoice(invoice._id.toString(), uid);
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

/* List invoices with search */
payablesRouter.get("/invoices", async (req, res) => {
  try {
    const uid = req.headers["x-uid"] as string;
    if (!uid) return res.status(401).json({ error: "Unauthorized" });

    await connectMongo();

    const { status, page = "1", limit = "20", q, flagged } = req.query;
    const filter: Record<string, unknown> = { uid };

    if (status && status !== "all") filter.status = status;

    if (flagged === "true") {
      filter["flags.0"] = { $exists: true };
    }

    if (q && typeof q === "string" && q.trim()) {
      const regex = new RegExp(q.trim(), "i");
      filter.$or = [
        { vendor: regex },
        { invoiceNumber: regex },
        { vendorEmail: regex },
      ];
    }

    const pageNum = Math.max(1, parseInt(page as string, 10));
    const limitNum = Math.min(50, parseInt(limit as string, 10));
    const skip = (pageNum - 1) * limitNum;

    const [invoices, total] = await Promise.all([
      Invoice.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limitNum).lean(),
      Invoice.countDocuments(filter),
    ]);

    res.json({ invoices, total, page: pageNum, totalPages: Math.ceil(total / limitNum) });
  } catch (err) {
    console.error("Payables list error:", err);
    res.status(500).json({ error: "Failed to fetch invoices" });
  }
});

/* Stats */
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
          paidCount: { $sum: { $cond: [{ $eq: ["$status", "paid"] }, 1, 0] } },
          processingCount: {
            $sum: { $cond: [{ $in: ["$status", ["processing", "extracted"]] }, 1, 0] },
          },
          flaggedCount: {
            $sum: { $cond: [{ $gt: [{ $size: { $ifNull: ["$flags", []] } }, 0] }, 1, 0] },
          },
          pendingAmount: {
            $sum: { $cond: [{ $eq: ["$status", "pending_approval"] }, { $ifNull: ["$total", 0] }, 0] },
          },
          approvedAmount: {
            $sum: { $cond: [{ $eq: ["$status", "approved"] }, { $ifNull: ["$total", 0] }, 0] },
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
        paidCount: 0,
        processingCount: 0,
        flaggedCount: 0,
        pendingAmount: 0,
        approvedAmount: 0,
      }
    );
  } catch (err) {
    console.error("Payables stats error:", err);
    res.status(500).json({ error: "Failed to fetch stats" });
  }
});

/* Get single invoice */
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

/* Update invoice */
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

    if (req.body.status === "approved") (invoice as any).approvedAt = new Date();
    if (req.body.status === "rejected") {
      (invoice as any).rejectedAt = new Date();
      if (req.body.rejectionReason) (invoice as any).rejectionReason = req.body.rejectionReason;
    }
    if (req.body.status === "paid") (invoice as any).paidAt = new Date();

    await invoice.save();
    res.json(invoice);
  } catch (err) {
    console.error("Payables patch error:", err);
    res.status(500).json({ error: "Failed to update invoice" });
  }
});

/* Delete invoice */
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

/* Approve */
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

/* Reject */
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

/* Mark as Paid */
payablesRouter.post("/invoices/:id/paid", async (req, res) => {
  try {
    const uid = req.headers["x-uid"] as string;
    if (!uid) return res.status(401).json({ error: "Unauthorized" });

    await connectMongo();
    const invoice = await Invoice.findOne({ _id: req.params.id, uid });
    if (!invoice) return res.status(404).json({ error: "Invoice not found" });

    (invoice as any).status = "paid";
    (invoice as any).paidAt = new Date();
    if (req.body.paymentAmount) (invoice as any).paymentAmount = req.body.paymentAmount;
    await invoice.save();
    res.json(invoice);
  } catch (err) {
    res.status(500).json({ error: "Failed to mark as paid" });
  }
});

/* Re-analyze invoice (on demand) */
payablesRouter.post("/invoices/:id/analyze", async (req, res) => {
  try {
    const uid = req.headers["x-uid"] as string;
    if (!uid) return res.status(401).json({ error: "Unauthorized" });

    await connectMongo();
    const invoice = await Invoice.findOne({ _id: req.params.id, uid });
    if (!invoice) return res.status(404).json({ error: "Invoice not found" });

    await analyzeInvoice(req.params.id, uid);
    const updated = await Invoice.findOne({ _id: req.params.id, uid }).lean();
    res.json(updated);
  } catch (err) {
    res.status(500).json({ error: "Failed to analyze invoice" });
  }
});

/* ─── Vendor Directory ─── */

payablesRouter.get("/vendors", async (req, res) => {
  try {
    const uid = req.headers["x-uid"] as string;
    if (!uid) return res.status(401).json({ error: "Unauthorized" });

    await connectMongo();

    const vendors = await Invoice.aggregate([
      { $match: { uid, vendor: { $exists: true, $ne: null, $ne: "" } } },
      {
        $group: {
          _id: "$vendor",
          vendor: { $first: "$vendor" },
          vendorEmail: { $first: "$vendorEmail" },
          invoiceCount: { $sum: 1 },
          totalSpend: { $sum: { $ifNull: ["$total", 0] } },
          avgInvoice: { $avg: { $ifNull: ["$total", 0] } },
          lastInvoiceDate: { $max: "$createdAt" },
          approvedCount: { $sum: { $cond: [{ $eq: ["$status", "approved"] }, 1, 0] } },
          paidCount: { $sum: { $cond: [{ $eq: ["$status", "paid"] }, 1, 0] } },
          pendingCount: {
            $sum: {
              $cond: [{ $in: ["$status", ["extracted", "pending_approval"]] }, 1, 0],
            },
          },
          currencies: { $addToSet: "$currency" },
          isNewVendor: { $first: "$isNewVendor" },
        },
      },
      { $sort: { totalSpend: -1 } },
    ]);

    res.json({ vendors });
  } catch (err) {
    console.error("Payables vendors error:", err);
    res.status(500).json({ error: "Failed to fetch vendors" });
  }
});

/* Vendor detail — invoices for one vendor */
payablesRouter.get("/vendors/:vendorName/invoices", async (req, res) => {
  try {
    const uid = req.headers["x-uid"] as string;
    if (!uid) return res.status(401).json({ error: "Unauthorized" });

    await connectMongo();

    const vendorName = decodeURIComponent(req.params.vendorName);
    const invoices = await Invoice.find({ uid, vendor: vendorName })
      .sort({ createdAt: -1 })
      .lean();

    res.json({ invoices });
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch vendor invoices" });
  }
});

/* Gmail connection status */
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

/* Flagged invoices summary */
payablesRouter.get("/flags", async (req, res) => {
  try {
    const uid = req.headers["x-uid"] as string;
    if (!uid) return res.status(401).json({ error: "Unauthorized" });

    await connectMongo();

    const flagged = await Invoice.find({
      uid,
      "flags.0": { $exists: true },
      status: { $nin: ["rejected", "paid"] },
    })
      .sort({ createdAt: -1 })
      .select("vendor invoiceNumber total currency status flags dueDate createdAt")
      .lean();

    res.json({ flagged });
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch flags" });
  }
});
