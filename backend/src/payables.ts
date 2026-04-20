import express from "express";
import multer from "multer";
import mongoose, { Schema } from "mongoose";
import { createHmac, randomUUID } from "crypto";
import { google } from "googleapis";
import { connectMongo } from "./db";
import { Invoice, InvoiceFlag } from "./models/Invoice";
import { InboxToken } from "./models/InboxToken";
import { UserProfile } from "./models/UserProfile";
import { callNvidiaChatCompletions } from "./ai/nvidiaClient";
import * as pdfParseModule from "pdf-parse";
const pdfParse = (pdfParseModule as any).default ?? pdfParseModule;

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 20 * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    const allowed = ["image/jpeg", "image/png", "image/webp", "application/pdf"];
    cb(null, allowed.includes(file.mimetype));
  },
});

export const payablesRouter = express.Router();
export const payablesPublicRouter = express.Router();

const NVIDIA_API_KEY = process.env.NVIDIA_API_KEY ?? "";
const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID ?? "";
const GOOGLE_CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET ?? "";
const GOOGLE_REDIRECT_URI =
  process.env.GOOGLE_REDIRECT_URI ?? "https://raina-1.onrender.com/inbox/callback";
const OAUTH_STATE_SECRET = process.env.OAUTH_STATE_SECRET || GOOGLE_CLIENT_SECRET || "payables-dev-oauth-state";

const PayablesCompanyProfile =
  mongoose.models.PayablesCompanyProfile ||
  mongoose.model(
    "PayablesCompanyProfile",
    new Schema(
      {
        uid: { type: String, required: true, unique: true, index: true },
        companyName: { type: String, required: true },
        industry: String,
        monthlyInvoices: String,
        onboarded: { type: Boolean, default: true },
        gmailAutoImportEnabled: { type: Boolean, default: true },
        notificationEmail: String,
      },
      { timestamps: true }
    )
  );

const PayablesTeamMember =
  mongoose.models.PayablesTeamMember ||
  mongoose.model(
    "PayablesTeamMember",
    new Schema(
      {
        uid: { type: String, required: true, index: true },
        email: { type: String, required: true },
        name: String,
        role: { type: String, enum: ["owner", "admin", "approver", "member", "viewer"], default: "viewer" },
        status: { type: String, enum: ["pending", "active", "disabled"], default: "pending" },
        inviteToken: { type: String, index: true },
        invitedBy: String,
        acceptedAt: Date,
      },
      { timestamps: true }
    )
  );

const PayablesApprovalRule =
  mongoose.models.PayablesApprovalRule ||
  mongoose.model(
    "PayablesApprovalRule",
    new Schema(
      {
        uid: { type: String, required: true, index: true },
        name: { type: String, required: true },
        minAmount: { type: Number, default: 0 },
        maxAmount: Number,
        currency: String,
        approverEmail: { type: String, required: true },
        approverName: String,
        active: { type: Boolean, default: true },
      },
      { timestamps: true }
    )
  );

const PayablesAuditLog =
  mongoose.models.PayablesAuditLog ||
  mongoose.model(
    "PayablesAuditLog",
    new Schema(
      {
        uid: { type: String, required: true, index: true },
        invoiceId: { type: String, index: true },
        action: { type: String, required: true },
        actorUid: String,
        actorEmail: String,
        details: Schema.Types.Mixed,
      },
      { timestamps: true }
    )
  );

const PayablesNotification =
  mongoose.models.PayablesNotification ||
  mongoose.model(
    "PayablesNotification",
    new Schema(
      {
        uid: { type: String, required: true, index: true },
        invoiceId: String,
        key: { type: String, index: true },
        type: { type: String, required: true },
        title: { type: String, required: true },
        message: { type: String, required: true },
        severity: { type: String, enum: ["info", "warning", "critical", "success"], default: "info" },
        readAt: Date,
      },
      { timestamps: true }
    )
  );

const PayablesAccountingConnection =
  mongoose.models.PayablesAccountingConnection ||
  mongoose.model(
    "PayablesAccountingConnection",
    new Schema(
      {
        uid: { type: String, required: true, index: true },
        provider: { type: String, enum: ["quickbooks", "xero"], required: true },
        status: { type: String, enum: ["not_connected", "export_ready", "connected"], default: "not_connected" },
        externalCompanyName: String,
        lastSyncAt: Date,
        lastSyncCount: Number,
        lastSyncMode: String,
        settings: Schema.Types.Mixed,
      },
      { timestamps: true }
    )
  );

function makeOAuth2Client() {
  return new google.auth.OAuth2(GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET, GOOGLE_REDIRECT_URI);
}

function signOAuthState(payload: Record<string, unknown>) {
  const body = Buffer.from(JSON.stringify(payload), "utf8").toString("base64url");
  const sig = createHmac("sha256", OAUTH_STATE_SECRET).update(body).digest("base64url");
  return `payables:${body}.${sig}`;
}

async function getActor(req: express.Request, res: express.Response) {
  const authUid = (req as any).user?.uid as string | undefined;
  const authEmail = ((req as any).user?.email as string | undefined)?.toLowerCase();
  const requestedWorkspace = ((req.headers["x-payables-workspace-uid"] as string | undefined) || (req.headers["x-uid"] as string | undefined) || authUid || "").trim();
  if (!authUid || !requestedWorkspace) {
    res.status(401).json({ error: "Unauthorized" });
    return null;
  }
  if (requestedWorkspace === authUid) {
    return { uid: requestedWorkspace, actorUid: authUid, email: authEmail, role: "owner", memberStatus: "active" };
  }
  await connectMongo();
  const member = await PayablesTeamMember.findOne({ uid: requestedWorkspace, email: authEmail, status: "active" }).lean();
  if (!member) {
    res.status(403).json({ error: "You do not have access to this Payables workspace" });
    return null;
  }
  return { uid: requestedWorkspace, actorUid: authUid, email: authEmail, role: (member as any).role ?? "member", memberStatus: (member as any).status ?? "active" };
}

function canManageWorkspace(actor: { role?: string }) {
  return ["owner", "admin"].includes(actor.role ?? "");
}

function canApproveInvoice(actor: { role?: string; email?: string }, invoice: any) {
  if (["owner", "admin"].includes(actor.role ?? "")) return true;
  if ((actor.role ?? "") !== "approver") return false;
  if (!invoice.assignedApproverEmail) return true;
  return !!actor.email && String(invoice.assignedApproverEmail).toLowerCase() === actor.email.toLowerCase();
}

function ensureManageWorkspace(actor: { role?: string }, res: express.Response) {
  if (canManageWorkspace(actor)) return true;
  res.status(403).json({ error: "Only workspace admins can perform this action" });
  return false;
}

function ensureCanApprove(actor: { role?: string; email?: string }, invoice: any, res: express.Response) {
  if (canApproveInvoice(actor, invoice)) return true;
  res.status(403).json({ error: "Only an admin or assigned approver can perform this action" });
  return false;
}

function sanitizeInvoice(invoice: any) {
  const obj = typeof invoice?.toObject === "function" ? invoice.toObject() : { ...invoice };
  obj.hasDocument = !!obj.originalFileData;
  delete obj.originalFileData;
  return obj;
}

async function audit(uid: string, invoiceId: string | undefined, action: string, actor: { uid: string; email?: string }, details?: Record<string, unknown>) {
  await PayablesAuditLog.create({ uid, invoiceId, action, actorUid: actor.uid, actorEmail: actor.email, details });
}

function buildSimpleEmail(to: string, subject: string, bodyHtml: string) {
  return [
    `To: ${to}`,
    `Subject: ${subject.replace(/\r?\n/g, " ")}`,
    "MIME-Version: 1.0",
    "Content-Type: text/html; charset=UTF-8",
    "",
    bodyHtml,
  ].join("\r\n");
}

async function sendPayablesEmail(uid: string, input: { to?: string; title: string; message: string; invoiceId?: string }) {
  try {
    const [company, profile] = await Promise.all([
      PayablesCompanyProfile.findOne({ uid }).lean(),
      UserProfile.findOne({ uid }).lean(),
    ]);
    const to = input.to || (company as any)?.notificationEmail || (profile as any)?.email;
    if (!to) return;
    const invoiceUrl = input.invoiceId ? `${process.env.FRONTEND_URL ?? "https://www.plyndrox.app"}/payables/invoice/${input.invoiceId}` : `${process.env.FRONTEND_URL ?? "https://www.plyndrox.app"}/payables/dashboard`;
    const auth = await getGmailClient(uid);
    const gmail = google.gmail({ version: "v1", auth });
    const body = `<div style="font-family:Arial,sans-serif;line-height:1.5;color:#1d2226"><h2>${input.title}</h2><p>${input.message}</p><p><a href="${invoiceUrl}" style="display:inline-block;background:#7c3aed;color:#fff;padding:10px 16px;border-radius:999px;text-decoration:none;font-weight:700">Open in Payables AI</a></p></div>`;
    const raw = Buffer.from(buildSimpleEmail(to, `Payables AI: ${input.title}`, body), "utf8").toString("base64url");
    await gmail.users.messages.send({ userId: "me", requestBody: { raw } });
  } catch (err) {
    console.warn("[payables] email notification skipped:", err instanceof Error ? err.message : err);
  }
}

async function notify(uid: string, input: { invoiceId?: string; key: string; type: string; title: string; message: string; severity?: string; emailTo?: string }) {
  const existing = await PayablesNotification.findOne({ uid, key: input.key }).lean();
  if (existing) return;
  await PayablesNotification.create({ uid, ...input });
  await sendPayablesEmail(uid, { to: input.emailTo, title: input.title, message: input.message, invoiceId: input.invoiceId });
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

const INVOICE_EXTRACTION_PROMPT = `You are an expert accounts payable AI. Extract all invoice data from this document and return ONLY a valid JSON object with these exact fields (use null for missing fields):
{
  "vendor": "string — the SUPPLIER/SELLER company name (the one who issued this invoice and is receiving payment). This is usually at the TOP of the invoice, in a header or 'From:' section.",
  "vendorEmail": "string — supplier/seller email address",
  "vendorAddress": "string — supplier/seller full address",
  "supplierGstin": "string — GSTIN of the supplier/seller (e.g. 27AABCT1332L1ZN)",
  "buyerName": "string — the BUYER/CLIENT company name in the 'Bill To' or 'Billed To' section. This is the company PAYING the invoice, NOT the vendor.",
  "buyerEmail": "string — buyer email if present",
  "buyerAddress": "string — buyer full address",
  "buyerGstin": "string — GSTIN of the buyer (e.g. 09AABCI2231K1ZP)",
  "invoiceNumber": "string — invoice number, may be labelled Invoice No., Invoice #, Inv No., Bill No., etc.",
  "poNumber": "string — Purchase Order number, may be labelled PO No., PO Number, Purchase Order, etc.",
  "invoiceDate": "string — ISO date YYYY-MM-DD",
  "dueDate": "string — ISO date YYYY-MM-DD",
  "currency": "string — 3-letter ISO code like USD, INR, EUR",
  "subtotal": number,
  "tax": number,
  "discount": number,
  "total": number,
  "lineItems": [
    {
      "description": "string",
      "hsnCode": "string — HSN/SAC code for this line item",
      "quantity": number,
      "unitPrice": number,
      "gstPercent": number,
      "amount": number
    }
  ],
  "notes": "string — payment terms, conditions, or any notes",
  "bankDetails": {
    "bankName": "string",
    "accountNumber": "string",
    "ifscCode": "string",
    "accountHolderName": "string",
    "accountType": "string"
  },
  "confidence": number between 0 and 1
}
CRITICAL RULES — Vendor vs Buyer:
- The VENDOR (supplier) is the company that SENT the invoice and is RECEIVING payment. It is usually displayed prominently at the TOP of the invoice with a logo, address, and GSTIN.
- The BUYER (client) is the company that RECEIVES the invoice and MAKES payment. It appears in the "Bill To" / "Billed To" section.
- NEVER put the "Bill To" company name in the vendor field. They are always different companies.
- Example: If the invoice header says "TechSupply Co." and "Bill To: InvoFlow Technologies Pvt. Ltd.", then vendor="TechSupply Co." and buyerName="InvoFlow Technologies Pvt. Ltd."
Currency rules:
- Return ISO 4217 codes only.
- Use INR for ₹, Rs, Rs., INR, rupee, rupees, or amounts labelled "(Rs.)".
- Use USD for $, US$, dollar, dollars; EUR for €, euro; GBP for £, pound; AED for dirham; SGD for S$; AUD/CAD only when explicitly shown.
- Never default to USD. If the document does not show a currency, return null.
Amount rules:
- Return numeric values only — remove currency symbols and commas including Indian grouping (e.g. 1,74,500.00 → 174500).
- Prefer "Total Due", "Grand Total", or "Amount Due" for the total field.
- GST/IGST/CGST/SGST amounts should be summed into the tax field.
- Extract GST % per line item into gstPercent as a number (e.g. 18% → 18).
Return ONLY the JSON object. No markdown, no code blocks, no explanation.`;

function extractJsonFromResponse(response: string): Record<string, unknown> | null {
  const cleaned = response.trim();
  const match = cleaned.match(/\{[\s\S]*\}/);
  if (!match) return null;
  try {
    return JSON.parse(match[0]);
  } catch {
    const repaired = match[0]
      .replace(/,\s*\}/g, "}")
      .replace(/,\s*\]/g, "]")
      .replace(/([{,]\s*)(\w+)(\s*:)/g, '$1"$2"$3');
    try {
      return JSON.parse(repaired);
    } catch {
      return null;
    }
  }
}

async function extractInvoiceDataFromImage(imageBase64: string, mimeType: string): Promise<Record<string, unknown>> {
  try {
    if (mimeType === "application/pdf") {
      const pdfBuffer = Buffer.from(imageBase64, "base64");
      let pdfText = "";
      try {
        const pdfData = await pdfParse(pdfBuffer);
        pdfText = pdfData.text?.trim() ?? "";
      } catch (pdfErr) {
        console.warn("[payables] pdf-parse failed:", pdfErr instanceof Error ? pdfErr.message : pdfErr);
      }
      if (!pdfText || pdfText.length < 30) {
        console.warn("[payables] PDF text extraction returned insufficient text, falling back to base64 text approach");
        pdfText = "";
      }
      const content = pdfText
        ? `${INVOICE_EXTRACTION_PROMPT}\n\nINVOICE TEXT CONTENT:\n${pdfText.slice(0, 6000)}`
        : `${INVOICE_EXTRACTION_PROMPT}\n\n[This PDF could not be parsed as text. Do your best to extract invoice fields from context.]`;
      const response = await callNvidiaChatCompletions({
        apiKey: NVIDIA_API_KEY,
        model: "nvidia/llama-3.1-nemotron-70b-instruct",
        messages: [{ role: "user", content }],
        temperature: 0.1,
        max_tokens: 2000,
      });
      const parsed = extractJsonFromResponse(response);
      if (!parsed) return {};
      return normalizeExtractedData(parsed, `${response}\n${pdfText}`);
    }

    const response = await callNvidiaChatCompletions({
      apiKey: NVIDIA_API_KEY,
      model: "meta/llama-3.2-90b-vision-instruct",
      messages: [{
        role: "user",
        content: [
          { type: "text", text: INVOICE_EXTRACTION_PROMPT },
          { type: "image_url", image_url: { url: `data:${mimeType};base64,${imageBase64}` } },
        ],
      }],
      temperature: 0.1,
      max_tokens: 2000,
    });
    const parsed = extractJsonFromResponse(response);
    if (!parsed) return {};
    return normalizeExtractedData(parsed, response);
  } catch (err) {
    console.error("[payables] extractInvoiceDataFromImage error:", err instanceof Error ? err.message : err);
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
          content: `${INVOICE_EXTRACTION_PROMPT}\n\nEMAIL/TEXT TO EXTRACT FROM:\n${text.slice(0, 6000)}`,
        },
      ],
      temperature: 0.1,
      max_tokens: 2000,
    });
    const parsed = extractJsonFromResponse(response);
    if (!parsed) return {};
    return normalizeExtractedData(parsed, `${response}\n${text}`);
  } catch (err) {
    console.error("[payables] extractInvoiceDataFromText error:", err instanceof Error ? err.message : err);
    return {};
  }
}

function parseAmount(value: unknown) {
  if (typeof value === "number" && Number.isFinite(value)) return value;
  if (typeof value !== "string") return undefined;
  const cleaned = value.replace(/[^\d.-]/g, "");
  if (!cleaned || cleaned === "-" || cleaned === ".") return undefined;
  const parsed = Number(cleaned);
  return Number.isFinite(parsed) ? parsed : undefined;
}

function normalizeCurrency(value: unknown, context = "") {
  const raw = String(value ?? "").trim();
  const text = `${raw} ${context}`.toLowerCase();
  const upper = raw.toUpperCase();
  const validCodes = new Set(["INR", "USD", "EUR", "GBP", "AED", "SGD", "AUD", "CAD", "JPY", "CNY"]);
  if (validCodes.has(upper)) return upper;
  if (/[₹]|(?:^|[^a-z])rs\.?(?:[^a-z]|$)|\binr\b|\brupees?\b|\bamount\s*\(rs\.?\)/i.test(text)) return "INR";
  if (/€|\beur\b|\beuros?\b/i.test(text)) return "EUR";
  if (/£|\bgbp\b|\bpounds?\b/i.test(text)) return "GBP";
  if (/\baed\b|\bdirhams?\b/i.test(text)) return "AED";
  if (/\bsgd\b|s\$/i.test(text)) return "SGD";
  if (/\baud\b/i.test(text)) return "AUD";
  if (/\bcad\b/i.test(text)) return "CAD";
  if (/\busd\b|us\$|\$\s*\d|\bdollars?\b/i.test(text)) return "USD";
  return undefined;
}

function normalizeDateValue(value: unknown) {
  if (!value) return undefined;
  if (typeof value !== "string") return undefined;
  const trimmed = value.trim();
  if (/^\d{4}-\d{2}-\d{2}$/.test(trimmed)) return trimmed;
  const parsed = new Date(trimmed);
  if (Number.isNaN(parsed.getTime())) return trimmed;
  return parsed.toISOString().slice(0, 10);
}

function normalizeExtractedData(data: Record<string, unknown>, context = "") {
  const normalized: Record<string, unknown> = { ...data };
  const combinedContext = `${context}\n${JSON.stringify(data)}`;
  const currency = normalizeCurrency(data.currency, combinedContext);
  if (currency) normalized.currency = currency;
  else delete normalized.currency;
  for (const key of ["subtotal", "tax", "total", "discount"]) {
    const amount = parseAmount(data[key]);
    if (amount !== undefined) normalized[key] = amount;
  }
  normalized.invoiceDate = normalizeDateValue(data.invoiceDate);
  normalized.dueDate = normalizeDateValue(data.dueDate);
  if (Array.isArray(data.lineItems)) {
    normalized.lineItems = data.lineItems.map((item) => {
      const row = typeof item === "object" && item !== null ? item as Record<string, unknown> : {};
      const gstPct = parseAmount(row.gstPercent);
      return {
        description: String(row.description ?? "").trim(),
        hsnCode: row.hsnCode ? String(row.hsnCode).trim() : undefined,
        quantity: parseAmount(row.quantity),
        unitPrice: parseAmount(row.unitPrice),
        gstPercent: gstPct !== undefined ? Math.max(0, Math.min(100, gstPct)) : undefined,
        amount: parseAmount(row.amount),
      };
    }).filter((item) => item.description || item.amount !== undefined);
  }
  if (data.bankDetails && typeof data.bankDetails === "object") {
    const bd = data.bankDetails as Record<string, unknown>;
    normalized.bankDetails = {
      bankName: bd.bankName ? String(bd.bankName).trim() : undefined,
      accountNumber: bd.accountNumber ? String(bd.accountNumber).trim() : undefined,
      ifscCode: bd.ifscCode ? String(bd.ifscCode).trim().toUpperCase() : undefined,
      accountHolderName: bd.accountHolderName ? String(bd.accountHolderName).trim() : undefined,
      accountType: bd.accountType ? String(bd.accountType).trim() : undefined,
    };
  }
  const confidence = parseAmount(data.confidence);
  if (confidence !== undefined) normalized.confidence = Math.max(0, Math.min(1, confidence > 1 ? confidence / 100 : confidence));
  return normalized;
}

function applyExtracted(invoice: InstanceType<typeof Invoice>, data: Record<string, unknown>) {
  data = normalizeExtractedData(data);
  if (data.vendor) (invoice as any).vendor = data.vendor;
  if (data.vendorEmail) (invoice as any).vendorEmail = data.vendorEmail;
  if (data.vendorAddress) (invoice as any).vendorAddress = data.vendorAddress;
  if (data.supplierGstin) (invoice as any).supplierGstin = data.supplierGstin;
  if (data.buyerName) (invoice as any).buyerName = data.buyerName;
  if (data.buyerEmail) (invoice as any).buyerEmail = data.buyerEmail;
  if (data.buyerAddress) (invoice as any).buyerAddress = data.buyerAddress;
  if (data.buyerGstin) (invoice as any).buyerGstin = data.buyerGstin;
  if (data.invoiceNumber) (invoice as any).invoiceNumber = data.invoiceNumber;
  if (data.poNumber) (invoice as any).poNumber = data.poNumber;
  if (data.invoiceDate) (invoice as any).invoiceDate = data.invoiceDate;
  if (data.dueDate) (invoice as any).dueDate = data.dueDate;
  if (data.currency) (invoice as any).currency = data.currency;
  if (typeof data.subtotal === "number") (invoice as any).subtotal = data.subtotal;
  if (typeof data.tax === "number") (invoice as any).tax = data.tax;
  if (typeof data.total === "number") (invoice as any).total = data.total;
  if (typeof data.discount === "number") (invoice as any).discount = data.discount;
  if (Array.isArray(data.lineItems)) (invoice as any).lineItems = data.lineItems;
  if (data.notes) (invoice as any).notes = data.notes;
  if (data.bankDetails && typeof data.bankDetails === "object") (invoice as any).bankDetails = data.bankDetails;
  if (typeof data.confidence === "number") (invoice as any).confidence = data.confidence;
}

async function extractAndApplyInvoice(invoice: any) {
  let extracted: Record<string, unknown> = {};
  if (invoice.originalFileData && invoice.originalMimeType) {
    extracted = await extractInvoiceDataFromImage(invoice.originalFileData, invoice.originalMimeType);
  } else if (invoice.rawText) {
    extracted = await extractInvoiceDataFromText(invoice.rawText);
  }
  applyExtracted(invoice, extracted);
  invoice.status = "extracted";
  await invoice.save();
  return extracted;
}

async function applyApprovalRules(invoice: any, uid: string) {
  if (!invoice.total) return;
  const rules = await PayablesApprovalRule.find({ uid, active: true }).sort({ minAmount: -1 }).lean();
  const rule = rules.find((r: any) => {
    if (r.currency && invoice.currency && r.currency !== invoice.currency) return false;
    if (invoice.total < (r.minAmount ?? 0)) return false;
    if (typeof r.maxAmount === "number" && invoice.total > r.maxAmount) return false;
    return true;
  }) as any;
  if (!rule) return;
  invoice.approvalRuleId = rule._id.toString();
  invoice.approvalRuleName = rule.name;
  invoice.assignedApproverEmail = rule.approverEmail;
  invoice.assignedApproverName = rule.approverName;
  await notify(uid, {
    invoiceId: invoice._id.toString(),
    key: `assigned:${invoice._id.toString()}:${rule._id.toString()}`,
    type: "approval_assignment",
    title: "Invoice assigned for approval",
    message: `${invoice.vendor ?? "An invoice"} for ${invoice.currency ?? ""}${invoice.total?.toLocaleString?.() ?? invoice.total} matched rule ${rule.name} and was assigned to ${rule.approverEmail}.`,
    severity: "info",
    emailTo: rule.approverEmail,
  });
}

async function analyzeInvoice(invoiceId: string, uid: string): Promise<void> {
  try {
    await connectMongo();
    const invoice = (await Invoice.findOne({ _id: invoiceId, uid })) as any;
    if (!invoice) return;

    const flags: InvoiceFlag[] = [];
    const missing: string[] = [];
    if (!invoice.vendor) missing.push("vendor name");
    if (!invoice.total) missing.push("total amount");
    if (!invoice.invoiceNumber) missing.push("invoice number");
    if (missing.length > 0) {
      flags.push({
        type: "missing_fields",
        severity: missing.includes("total amount") ? "warning" : "info",
        message: `Could not extract: ${missing.join(", ")}. Please review and fill in manually.`,
      });
    }

    if (invoice.vendor && invoice.invoiceNumber) {
      const duplicate = await Invoice.findOne({ uid, vendor: invoice.vendor, invoiceNumber: invoice.invoiceNumber, _id: { $ne: invoice._id } }).lean();
      if (duplicate) {
        flags.push({
          type: "duplicate",
          severity: "critical",
          message: `Possible duplicate: An invoice from "${invoice.vendor}" with number #${invoice.invoiceNumber} already exists. Please verify before approving.`,
          relatedInvoiceId: (duplicate as any)._id.toString(),
        });
      }
    }

    if (invoice.vendor) {
      const previousCount = await Invoice.countDocuments({ uid, vendor: invoice.vendor, _id: { $ne: invoice._id } });
      if (previousCount === 0) {
        invoice.isNewVendor = true;
      } else {
        invoice.isNewVendor = false;
      }

      if (invoice.total && previousCount >= 2) {
        const vendorStats = await Invoice.aggregate([
          { $match: { uid, vendor: invoice.vendor, _id: { $ne: invoice._id }, total: { $exists: true, $gt: 0 } } },
          { $group: { _id: null, avgTotal: { $avg: "$total" }, maxTotal: { $max: "$total" }, count: { $sum: 1 } } },
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

      if (invoice.dueDate && !["approved", "rejected", "paid"].includes(invoice.status)) {
        const daysUntil = Math.ceil((new Date(invoice.dueDate).getTime() - Date.now()) / 86400000);
        if (daysUntil <= 3 && daysUntil >= 0) {
          flags.push({
            type: "overdue_risk",
            severity: daysUntil === 0 ? "critical" : "warning",
            message: daysUntil === 0 ? "This invoice is due today! Approve and process payment immediately." : `This invoice is due in ${daysUntil} day${daysUntil !== 1 ? "s" : ""}. Approve it soon to avoid late payment.`,
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
    if (invoice.status === "extracted") {
      const hasCritical = flags.some((f) => f.severity === "critical");
      invoice.status = hasCritical ? "extracted" : "pending_approval";
    }
    await applyApprovalRules(invoice, uid);
    await invoice.save();

    for (const flag of flags.filter((f) => f.severity !== "info")) {
      await notify(uid, {
        invoiceId,
        key: `flag:${invoiceId}:${flag.type}`,
        type: "invoice_flag",
        title: flag.severity === "critical" ? "Critical invoice issue" : "Invoice needs review",
        message: flag.message,
        severity: flag.severity,
      });
    }
  } catch (err) {
    console.error("[payables] analyzeInvoice error:", err);
  }
}

function decodeGmailData(data?: string | null) {
  if (!data) return "";
  return Buffer.from(data.replace(/-/g, "+").replace(/_/g, "/"), "base64").toString("utf-8");
}

function collectParts(payload: any, parts: any[] = []) {
  if (!payload) return parts;
  parts.push(payload);
  for (const p of payload.parts ?? []) collectParts(p, parts);
  return parts;
}

function invoiceAmount(invoice: any) {
  return Number(invoice.total ?? invoice.paymentAmount ?? 0) || 0;
}

function daysFromNow(date?: string | Date) {
  if (!date) return null;
  return Math.ceil((new Date(date).getTime() - Date.now()) / 86400000);
}

function paymentUrgency(invoice: any) {
  const days = daysFromNow(invoice.dueDate);
  if (days == null) return "unscheduled";
  if (days < 0) return "overdue";
  if (days <= 3) return "due_soon";
  if (days <= 14) return "upcoming";
  return "later";
}

function earlyPaymentDiscount(invoice: any) {
  const text = [invoice.notes, invoice.rawText].filter(Boolean).join(" ").toLowerCase();
  const amount = invoiceAmount(invoice);
  const match = text.match(/(\d+(?:\.\d+)?)\s*%[^.]{0,40}(?:early|within|days|net)/i) || text.match(/(\d+(?:\.\d+)?)\s*\/\s*10/);
  if (!match || !amount) return null;
  const percent = Math.min(Number(match[1]), 50);
  if (!percent) return null;
  const estimatedSavings = Math.round((amount * percent) / 100);
  return { percent, estimatedSavings, message: "Possible " + percent + "% early-payment discount detected. Estimated savings: " + (invoice.currency ?? "USD") + " " + estimatedSavings.toLocaleString() + "." };
}

function startOfDay(date = new Date()) {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}

function addDays(date: Date, days: number) {
  const next = new Date(date);
  next.setDate(next.getDate() + days);
  return next;
}

function summarizeInvoices(invoices: any[]) {
  return invoices.reduce((sum, inv) => sum + invoiceAmount(inv), 0);
}

function csvEscape(value: unknown) {
  const str = String(value ?? "");
  return /[",\n]/.test(str) ? '"' + str.replace(/"/g, '""') + '"' : str;
}

payablesRouter.get("/company", async (req, res) => {
  const actor = await getActor(req, res);
  if (!actor) return;
  try {
    await connectMongo();
    const profile = await PayablesCompanyProfile.findOne({ uid: actor.uid }).lean();
    res.json(profile ?? { uid: actor.uid, onboarded: false, companyName: "", industry: "", monthlyInvoices: "", gmailAutoImportEnabled: true });
  } catch {
    res.status(500).json({ error: "Failed to fetch company profile" });
  }
});

payablesRouter.put("/company", async (req, res) => {
  const actor = await getActor(req, res);
  if (!actor) return;
  if (!ensureManageWorkspace(actor, res)) return;
  try {
    const companyName = String(req.body.companyName ?? "").trim();
    if (!companyName) return res.status(400).json({ error: "Company name is required" });
    await connectMongo();
    const profile = await PayablesCompanyProfile.findOneAndUpdate(
      { uid: actor.uid },
      {
        uid: actor.uid,
        companyName,
        industry: String(req.body.industry ?? "").trim(),
        monthlyInvoices: String(req.body.monthlyInvoices ?? "").trim(),
        onboarded: true,
        gmailAutoImportEnabled: req.body.gmailAutoImportEnabled !== false,
        notificationEmail: String(req.body.notificationEmail ?? actor.email ?? "").trim(),
      },
      { upsert: true, new: true }
    );
    await PayablesTeamMember.updateOne(
      { uid: actor.uid, email: actor.email ?? actor.uid, role: "owner" },
      { $setOnInsert: { uid: actor.uid, email: actor.email ?? actor.uid, name: companyName, role: "owner", status: "active" } },
      { upsert: true }
    );
    await audit(actor.uid, undefined, "company_profile_saved", actor, { companyName });
    res.json(profile);
  } catch {
    res.status(500).json({ error: "Failed to save company profile" });
  }
});

payablesRouter.get("/team", async (req, res) => {
  const actor = await getActor(req, res);
  if (!actor) return;
  await connectMongo();
  const members = await PayablesTeamMember.find({ uid: actor.uid }).sort({ role: 1, createdAt: -1 }).lean();
  res.json({ members });
});

payablesRouter.post("/team", async (req, res) => {
  const actor = await getActor(req, res);
  if (!actor) return;
  if (!ensureManageWorkspace(actor, res)) return;
  try {
    const email = String(req.body.email ?? "").trim().toLowerCase();
    if (!email || !email.includes("@")) return res.status(400).json({ error: "Valid email is required" });
    await connectMongo();
    const member = await PayablesTeamMember.findOneAndUpdate(
      { uid: actor.uid, email },
      {
        uid: actor.uid,
        email,
        name: String(req.body.name ?? "").trim(),
        role: ["admin", "approver", "viewer", "member"].includes(req.body.role) ? (req.body.role === "member" ? "viewer" : req.body.role) : "viewer",
        status: "pending",
        inviteToken: randomUUID(),
        invitedBy: actor.email ?? actor.uid,
      },
      { upsert: true, new: true }
    );
    await audit(actor.uid, undefined, "team_member_invited", actor, { email, role: (member as any).role });
    res.json({ member, inviteUrl: `${process.env.FRONTEND_URL ?? "https://www.plyndrox.app"}/payables/team?invite=${(member as any).inviteToken}` });
  } catch {
    res.status(500).json({ error: "Failed to invite team member" });
  }
});

payablesRouter.post("/team/accept", async (req, res) => {
  const actor = await getActor(req, res);
  if (!actor) return;
  try {
    const token = String(req.body.token ?? "").trim();
    if (!token) return res.status(400).json({ error: "Invite token is required" });
    await connectMongo();
    const member = await PayablesTeamMember.findOne({ inviteToken: token });
    if (!member) return res.status(404).json({ error: "Invite not found" });
    if (actor.email && (member as any).email && actor.email.toLowerCase() !== (member as any).email.toLowerCase()) {
      return res.status(403).json({ error: "This invite belongs to a different email address" });
    }
    (member as any).status = "active";
    (member as any).acceptedAt = new Date();
    await member.save();
    await audit((member as any).uid, undefined, "team_member_accepted", actor, { email: (member as any).email });
    res.json({ success: true, workspaceUid: (member as any).uid, member });
  } catch {
    res.status(500).json({ error: "Failed to accept invite" });
  }
});

payablesRouter.patch("/team/:id", async (req, res) => {
  const actor = await getActor(req, res);
  if (!actor) return;
  if (!ensureManageWorkspace(actor, res)) return;
  await connectMongo();
  const update: Record<string, unknown> = {};
  if (["admin", "approver", "viewer", "member"].includes(req.body.role)) update.role = req.body.role === "member" ? "viewer" : req.body.role;
  if (["pending", "active", "disabled"].includes(req.body.status)) update.status = req.body.status;
  if (typeof req.body.name === "string") update.name = req.body.name.trim();
  const member = await PayablesTeamMember.findOneAndUpdate({ _id: req.params.id, uid: actor.uid, role: { $ne: "owner" } }, update, { new: true });
  if (!member) return res.status(404).json({ error: "Team member not found" });
  await audit(actor.uid, undefined, "team_member_updated", actor, { memberId: req.params.id, update });
  res.json(member);
});

payablesRouter.delete("/team/:id", async (req, res) => {
  const actor = await getActor(req, res);
  if (!actor) return;
  if (!ensureManageWorkspace(actor, res)) return;
  await connectMongo();
  await PayablesTeamMember.deleteOne({ _id: req.params.id, uid: actor.uid, role: { $ne: "owner" } });
  await audit(actor.uid, undefined, "team_member_removed", actor, { memberId: req.params.id });
  res.json({ success: true });
});

payablesRouter.get("/approval-rules", async (req, res) => {
  const actor = await getActor(req, res);
  if (!actor) return;
  await connectMongo();
  const rules = await PayablesApprovalRule.find({ uid: actor.uid }).sort({ minAmount: 1 }).lean();
  res.json({ rules });
});

payablesRouter.post("/approval-rules", async (req, res) => {
  const actor = await getActor(req, res);
  if (!actor) return;
  if (!ensureManageWorkspace(actor, res)) return;
  try {
    const name = String(req.body.name ?? "").trim();
    const approverEmail = String(req.body.approverEmail ?? "").trim().toLowerCase();
    if (!name || !approverEmail.includes("@")) return res.status(400).json({ error: "Rule name and approver email are required" });
    await connectMongo();
    const rule = await PayablesApprovalRule.create({
      uid: actor.uid,
      name,
      minAmount: Number(req.body.minAmount ?? 0),
      maxAmount: req.body.maxAmount === "" || req.body.maxAmount == null ? undefined : Number(req.body.maxAmount),
      currency: String(req.body.currency ?? "").trim().toUpperCase(),
      approverEmail,
      approverName: String(req.body.approverName ?? "").trim(),
      active: req.body.active !== false,
    });
    await audit(actor.uid, undefined, "approval_rule_created", actor, { ruleId: rule._id.toString(), name });
    res.json(rule);
  } catch {
    res.status(500).json({ error: "Failed to create approval rule" });
  }
});

payablesRouter.patch("/approval-rules/:id", async (req, res) => {
  const actor = await getActor(req, res);
  if (!actor) return;
  if (!ensureManageWorkspace(actor, res)) return;
  await connectMongo();
  const allowed = ["name", "minAmount", "maxAmount", "currency", "approverEmail", "approverName", "active"];
  const update: Record<string, unknown> = {};
  for (const key of allowed) if (Object.prototype.hasOwnProperty.call(req.body, key)) update[key] = req.body[key];
  const rule = await PayablesApprovalRule.findOneAndUpdate({ _id: req.params.id, uid: actor.uid }, update, { new: true });
  if (!rule) return res.status(404).json({ error: "Approval rule not found" });
  await audit(actor.uid, undefined, "approval_rule_updated", actor, { ruleId: req.params.id });
  res.json(rule);
});

payablesRouter.delete("/approval-rules/:id", async (req, res) => {
  const actor = await getActor(req, res);
  if (!actor) return;
  if (!ensureManageWorkspace(actor, res)) return;
  await connectMongo();
  await PayablesApprovalRule.deleteOne({ _id: req.params.id, uid: actor.uid });
  await audit(actor.uid, undefined, "approval_rule_deleted", actor, { ruleId: req.params.id });
  res.json({ success: true });
});

payablesRouter.get("/gmail/auth-url", async (req, res) => {
  const actor = await getActor(req, res);
  if (!actor) return;
  if (!ensureManageWorkspace(actor, res)) return;
  if (!GOOGLE_CLIENT_ID || !GOOGLE_CLIENT_SECRET) {
    return res.status(503).json({ error: "Google OAuth is not configured on the server." });
  }
  const returnTo = typeof req.query.returnTo === "string" && req.query.returnTo.startsWith("/payables")
    ? req.query.returnTo
    : "/payables/onboarding?gmail=connected";
  const state = signOAuthState({
    workspaceUid: actor.uid,
    actorUid: actor.actorUid,
    product: "payables",
    returnTo,
    nonce: randomUUID(),
    createdAt: Date.now(),
  });
  const oauth2 = makeOAuth2Client();
  const url = oauth2.generateAuthUrl({
    access_type: "offline",
    prompt: "consent",
    scope: [
      "https://www.googleapis.com/auth/gmail.modify",
      "https://www.googleapis.com/auth/gmail.send",
      "https://www.googleapis.com/auth/userinfo.email",
    ],
    state,
  });
  res.json({ url });
});

payablesRouter.delete("/gmail/disconnect", async (req, res) => {
  const actor = await getActor(req, res);
  if (!actor) return;
  if (!ensureManageWorkspace(actor, res)) return;
  await connectMongo();
  await InboxToken.deleteOne({ uid: actor.uid });
  await audit(actor.uid, undefined, "gmail_disconnected", actor);
  res.json({ success: true });
});

payablesRouter.get("/notifications", async (req, res) => {
  const actor = await getActor(req, res);
  if (!actor) return;
  await connectMongo();
  const notifications = await PayablesNotification.find({ uid: actor.uid }).sort({ createdAt: -1 }).limit(50).lean();
  const unreadCount = await PayablesNotification.countDocuments({ uid: actor.uid, readAt: { $exists: false } });
  res.json({ notifications, unreadCount });
});

payablesRouter.post("/notifications/mark-read", async (req, res) => {
  const actor = await getActor(req, res);
  if (!actor) return;
  await connectMongo();
  await PayablesNotification.updateMany({ uid: actor.uid, readAt: { $exists: false } }, { $set: { readAt: new Date() } });
  res.json({ success: true });
});

payablesRouter.post("/upload", upload.single("invoice"), async (req, res) => {
  const actor = await getActor(req, res);
  if (!actor) return;
  if (!ensureManageWorkspace(actor, res)) return;
  try {
    if (!req.file) return res.status(400).json({ error: "No file provided" });
    await connectMongo();
    const invoice = new Invoice({
      uid: actor.uid,
      source: "upload",
      status: "processing",
      originalFileName: req.file.originalname,
      originalMimeType: req.file.mimetype,
      originalFileData: req.file.buffer.toString("base64"),
    }) as any;
    await invoice.save();
    await audit(actor.uid, invoice._id.toString(), "invoice_uploaded", actor, { fileName: req.file.originalname });
    await notify(actor.uid, { invoiceId: invoice._id.toString(), key: `new:${invoice._id.toString()}`, type: "new_invoice", title: "New invoice uploaded", message: `${req.file.originalname} was uploaded and AI extraction has started.`, severity: "info" });

    setImmediate(async () => {
      try {
        await extractAndApplyInvoice(invoice);
        await analyzeInvoice(invoice._id.toString(), actor.uid);
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
  const actor = await getActor(req, res);
  if (!actor) return;
  if (!ensureManageWorkspace(actor, res)) return;
  try {
    await connectMongo();
    let auth: Awaited<ReturnType<typeof getGmailClient>>;
    try {
      auth = await getGmailClient(actor.uid);
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
    if (!messages.length) return res.json({ success: true, fetched: 0, message: "No invoice emails found in the last 30 days." });
    let fetched = 0;

    for (const msg of messages) {
      if (!msg.id) continue;
      const existing = await Invoice.findOne({ uid: actor.uid, gmailMessageId: msg.id });
      if (existing) continue;
      const full = await gmail.users.messages.get({ userId: "me", id: msg.id, format: "full" });
      const payload = full.data.payload;
      if (!payload) continue;
      const headers = payload.headers ?? [];
      const subject = headers.find((h) => h.name === "Subject")?.value ?? "";
      const from = headers.find((h) => h.name === "From")?.value ?? "";
      const parts = collectParts(payload);
      let bodyText = "";
      for (const part of parts) if (part.mimeType === "text/plain" && part.body?.data) bodyText += decodeGmailData(part.body.data);
      if (!bodyText && payload.body?.data) bodyText = decodeGmailData(payload.body.data);

      let attachmentData = "";
      let attachmentMime = "";
      let attachmentName = "";
      const attachmentPart = parts.find((part) => ["application/pdf", "image/jpeg", "image/png", "image/webp"].includes(part.mimeType) && (part.body?.attachmentId || part.body?.data));
      if (attachmentPart) {
        attachmentMime = attachmentPart.mimeType;
        attachmentName = attachmentPart.filename || `${subject || "gmail-invoice"}`;
        if (attachmentPart.body?.data) attachmentData = attachmentPart.body.data.replace(/-/g, "+").replace(/_/g, "/");
        else if (attachmentPart.body?.attachmentId) {
          const attachment = await gmail.users.messages.attachments.get({ userId: "me", messageId: msg.id, id: attachmentPart.body.attachmentId });
          attachmentData = (attachment.data.data ?? "").replace(/-/g, "+").replace(/_/g, "/");
        }
      }

      const rawText = `Subject: ${subject}\nFrom: ${from}\n\n${bodyText}`;
      const invoice = new Invoice({
        uid: actor.uid,
        source: "gmail",
        status: "processing",
        gmailMessageId: msg.id,
        rawText,
        originalFileName: attachmentName || subject || "Gmail invoice",
        originalMimeType: attachmentMime || undefined,
        originalFileData: attachmentData || undefined,
      }) as any;
      await invoice.save();
      await audit(actor.uid, invoice._id.toString(), "gmail_invoice_imported", actor, { subject, from });
      await notify(actor.uid, { invoiceId: invoice._id.toString(), key: `new:${invoice._id.toString()}`, type: "new_invoice", title: "New Gmail invoice imported", message: `${subject || "A Gmail invoice"} was imported from ${from || "Gmail"} and AI extraction has started.`, severity: "info" });
      fetched++;

      setImmediate(async () => {
        try {
          await extractAndApplyInvoice(invoice);
          await analyzeInvoice(invoice._id.toString(), actor.uid);
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

payablesRouter.post("/invoices/bulk-action", async (req, res) => {
  const actor = await getActor(req, res);
  if (!actor) return;
  try {
    const ids = Array.isArray(req.body.ids) ? req.body.ids : [];
    const action = req.body.action;
    if (!ids.length || !["approve", "reject", "paid", "delete", "analyze"].includes(action)) return res.status(400).json({ error: "Select invoices and a valid action" });
    if (["paid", "delete"].includes(action) && !ensureManageWorkspace(actor, res)) return;
    await connectMongo();
    let updated = 0;
    if (action === "delete") {
      const result = await Invoice.deleteMany({ uid: actor.uid, _id: { $in: ids } });
      updated = result.deletedCount ?? 0;
    } else {
      const invoices = await Invoice.find({ uid: actor.uid, _id: { $in: ids } });
      for (const invoice of invoices as any[]) {
        if (["approve", "reject"].includes(action) && !canApproveInvoice(actor, invoice)) continue;
        if (action === "approve") { invoice.status = "approved"; invoice.approvedAt = new Date(); invoice.approvedBy = actor.email ?? actor.uid; }
        if (action === "reject") { invoice.status = "rejected"; invoice.rejectedAt = new Date(); invoice.rejectionReason = req.body.reason ?? "Bulk rejected"; }
        if (action === "paid") { invoice.status = "paid"; invoice.paidAt = new Date(); invoice.paymentAmount = invoice.total; }
        if (action === "analyze") await extractAndApplyInvoice(invoice);
        await invoice.save();
        if (action === "analyze") await analyzeInvoice(invoice._id.toString(), actor.uid);
        await audit(actor.uid, invoice._id.toString(), `bulk_${action}`, actor, { reason: req.body.reason });
        updated++;
      }
    }
    await notify(actor.uid, { key: `bulk:${action}:${Date.now()}`, type: "bulk_action", title: "Bulk action completed", message: `${updated} invoice${updated !== 1 ? "s" : ""} updated.`, severity: "success" });
    res.json({ success: true, updated });
  } catch {
    res.status(500).json({ error: "Bulk action failed" });
  }
});

payablesRouter.get("/invoices", async (req, res) => {
  const actor = await getActor(req, res);
  if (!actor) return;
  try {
    await connectMongo();
    const { status, page = "1", limit = "20", q, flagged } = req.query;
    const filter: Record<string, unknown> = { uid: actor.uid };
    if (status && status !== "all") filter.status = status;
    if (flagged === "true") filter["flags.0"] = { $exists: true };
    if (q && typeof q === "string" && q.trim()) {
      const regex = new RegExp(q.trim(), "i");
      filter.$or = [{ vendor: regex }, { invoiceNumber: regex }, { vendorEmail: regex }];
    }
    const pageNum = Math.max(1, parseInt(page as string, 10));
    const limitNum = Math.min(50, parseInt(limit as string, 10));
    const skip = (pageNum - 1) * limitNum;
    const [invoices, total] = await Promise.all([
      Invoice.find(filter).select("-originalFileData").sort({ createdAt: -1 }).skip(skip).limit(limitNum).lean(),
      Invoice.countDocuments(filter),
    ]);
    res.json({ invoices, total, page: pageNum, totalPages: Math.ceil(total / limitNum) });
  } catch (err) {
    console.error("Payables list error:", err);
    res.status(500).json({ error: "Failed to fetch invoices" });
  }
});

payablesRouter.get("/invoices/stats", async (req, res) => {
  const actor = await getActor(req, res);
  if (!actor) return;
  try {
    await connectMongo();
    const [stats] = await Invoice.aggregate([
      { $match: { uid: actor.uid } },
      {
        $group: {
          _id: null,
          total: { $sum: 1 },
          totalAmount: { $sum: "$total" },
          pendingCount: { $sum: { $cond: [{ $eq: ["$status", "pending_approval"] }, 1, 0] } },
          approvedCount: { $sum: { $cond: [{ $eq: ["$status", "approved"] }, 1, 0] } },
          paidCount: { $sum: { $cond: [{ $eq: ["$status", "paid"] }, 1, 0] } },
          processingCount: { $sum: { $cond: [{ $in: ["$status", ["processing", "extracted"]] }, 1, 0] } },
          flaggedCount: { $sum: { $cond: [{ $gt: [{ $size: { $ifNull: ["$flags", []] } }, 0] }, 1, 0] } },
          pendingAmount: { $sum: { $cond: [{ $eq: ["$status", "pending_approval"] }, { $ifNull: ["$total", 0] }, 0] } },
          approvedAmount: { $sum: { $cond: [{ $eq: ["$status", "approved"] }, { $ifNull: ["$total", 0] }, 0] } },
        },
      },
    ]);
    res.json(stats ?? { total: 0, totalAmount: 0, pendingCount: 0, approvedCount: 0, paidCount: 0, processingCount: 0, flaggedCount: 0, pendingAmount: 0, approvedAmount: 0 });
  } catch (err) {
    console.error("Payables stats error:", err);
    res.status(500).json({ error: "Failed to fetch stats" });
  }
});

payablesRouter.get("/invoices/:id/document", async (req, res) => {
  const actor = await getActor(req, res);
  if (!actor) return;
  await connectMongo();
  const invoice = (await Invoice.findOne({ _id: req.params.id, uid: actor.uid }).select("originalFileData originalMimeType originalFileName")) as any;
  if (!invoice?.originalFileData) return res.status(404).json({ error: "Document not found" });
  res.setHeader("Content-Type", invoice.originalMimeType || "application/octet-stream");
  res.setHeader("Content-Disposition", `inline; filename="${encodeURIComponent(invoice.originalFileName || "invoice")}"`);
  res.send(Buffer.from(invoice.originalFileData, "base64"));
});

payablesRouter.get("/invoices/:id", async (req, res) => {
  const actor = await getActor(req, res);
  if (!actor) return;
  try {
    await connectMongo();
    const invoice = await Invoice.findOne({ _id: req.params.id, uid: actor.uid }).lean();
    if (!invoice) return res.status(404).json({ error: "Invoice not found" });
    const auditLogs = await PayablesAuditLog.find({ uid: actor.uid, invoiceId: req.params.id }).sort({ createdAt: -1 }).limit(50).lean();
    res.json({ ...sanitizeInvoice(invoice), auditLogs });
  } catch (err) {
    console.error("Payables get invoice error:", err);
    res.status(500).json({ error: "Failed to fetch invoice" });
  }
});

payablesRouter.patch("/invoices/:id", async (req, res) => {
  const actor = await getActor(req, res);
  if (!actor) return;
  try {
    await connectMongo();
    const invoice = await Invoice.findOne({ _id: req.params.id, uid: actor.uid });
    if (!invoice) return res.status(404).json({ error: "Invoice not found" });
    if (req.body.status === "approved" || req.body.status === "rejected") { if (!ensureCanApprove(actor, invoice, res)) return; }
    else if (req.body.status === "paid") { if (!ensureManageWorkspace(actor, res)) return; }
    else if (!canManageWorkspace(actor) && (actor.role ?? "") !== "approver") return res.status(403).json({ error: "Only admins and approvers can edit invoices" });
    const body = normalizeExtractedData(req.body ?? {}, JSON.stringify(req.body ?? {}));
    const allowed = [
      "vendor", "vendorEmail", "vendorAddress", "supplierGstin",
      "buyerName", "buyerEmail", "buyerAddress", "buyerGstin",
      "invoiceNumber", "poNumber", "invoiceDate", "dueDate",
      "currency", "subtotal", "tax", "discount", "total",
      "lineItems", "notes", "bankDetails",
      "status", "assignedApproverEmail", "assignedApproverName",
    ];
    for (const key of allowed) if (body[key] !== undefined) (invoice as any)[key] = body[key];
    if (body.status === "approved") { (invoice as any).approvedAt = new Date(); (invoice as any).approvedBy = actor.email ?? actor.uid; }
    if (body.status === "rejected") { (invoice as any).rejectedAt = new Date(); if (req.body.rejectionReason) (invoice as any).rejectionReason = req.body.rejectionReason; }
    if (body.status === "paid") (invoice as any).paidAt = new Date();
    await invoice.save();
    await audit(actor.uid, req.params.id, "invoice_updated", actor, { fields: Object.keys(req.body ?? {}) });
    res.json(sanitizeInvoice(invoice));
  } catch (err) {
    console.error("Payables patch error:", err);
    res.status(500).json({ error: "Failed to update invoice" });
  }
});

payablesRouter.delete("/invoices/:id", async (req, res) => {
  const actor = await getActor(req, res);
  if (!actor) return;
  if (!ensureManageWorkspace(actor, res)) return;
  try {
    await connectMongo();
    await Invoice.deleteOne({ _id: req.params.id, uid: actor.uid });
    await audit(actor.uid, req.params.id, "invoice_deleted", actor);
    res.json({ success: true });
  } catch (err) {
    console.error("Payables delete error:", err);
    res.status(500).json({ error: "Failed to delete invoice" });
  }
});

payablesRouter.post("/invoices/:id/comments", async (req, res) => {
  const actor = await getActor(req, res);
  if (!actor) return;
  const body = String(req.body.body ?? "").trim();
  if (!body) return res.status(400).json({ error: "Comment is required" });
  await connectMongo();
  const comment = { id: randomUUID(), body, authorUid: actor.uid, authorEmail: actor.email, createdAt: new Date() };
  const invoice = await Invoice.findOneAndUpdate({ _id: req.params.id, uid: actor.uid }, { $push: { comments: comment } }, { new: true }).lean();
  if (!invoice) return res.status(404).json({ error: "Invoice not found" });
  await audit(actor.uid, req.params.id, "comment_added", actor, { body });
  res.json(sanitizeInvoice(invoice));
});

payablesRouter.post("/invoices/:id/approve", async (req, res) => {
  const actor = await getActor(req, res);
  if (!actor) return;
  try {
    await connectMongo();
    const invoice = await Invoice.findOne({ _id: req.params.id, uid: actor.uid });
    if (!invoice) return res.status(404).json({ error: "Invoice not found" });
    if (!ensureCanApprove(actor, invoice, res)) return;
    (invoice as any).status = "approved";
    (invoice as any).approvedAt = new Date();
    (invoice as any).approvedBy = actor.email ?? actor.uid;
    await invoice.save();
    await audit(actor.uid, req.params.id, "invoice_approved", actor);
    await notify(actor.uid, { invoiceId: req.params.id, key: `approved:${req.params.id}`, type: "status", title: "Invoice approved", message: `${(invoice as any).vendor ?? "Invoice"} was approved.`, severity: "success" });
    res.json(sanitizeInvoice(invoice));
  } catch (err) {
    console.error("Payables approve error:", err);
    res.status(500).json({ error: "Failed to approve invoice" });
  }
});

payablesRouter.post("/invoices/:id/reject", async (req, res) => {
  const actor = await getActor(req, res);
  if (!actor) return;
  try {
    await connectMongo();
    const invoice = await Invoice.findOne({ _id: req.params.id, uid: actor.uid });
    if (!invoice) return res.status(404).json({ error: "Invoice not found" });
    if (!ensureCanApprove(actor, invoice, res)) return;
    (invoice as any).status = "rejected";
    (invoice as any).rejectedAt = new Date();
    (invoice as any).rejectionReason = req.body.reason ?? "";
    await invoice.save();
    await audit(actor.uid, req.params.id, "invoice_rejected", actor, { reason: req.body.reason ?? "" });
    await notify(actor.uid, { invoiceId: req.params.id, key: `rejected:${req.params.id}`, type: "status", title: "Invoice rejected", message: `${(invoice as any).vendor ?? "Invoice"} was rejected.`, severity: "warning" });
    res.json(sanitizeInvoice(invoice));
  } catch (err) {
    console.error("Payables reject error:", err);
    res.status(500).json({ error: "Failed to reject invoice" });
  }
});

payablesRouter.post("/invoices/:id/paid", async (req, res) => {
  const actor = await getActor(req, res);
  if (!actor) return;
  if (!ensureManageWorkspace(actor, res)) return;
  try {
    await connectMongo();
    const invoice = await Invoice.findOne({ _id: req.params.id, uid: actor.uid });
    if (!invoice) return res.status(404).json({ error: "Invoice not found" });
    (invoice as any).status = "paid";
    (invoice as any).paidAt = new Date();
    if (req.body.paymentAmount) (invoice as any).paymentAmount = req.body.paymentAmount;
    await invoice.save();
    await audit(actor.uid, req.params.id, "invoice_paid", actor, { paymentAmount: req.body.paymentAmount });
    await notify(actor.uid, { invoiceId: req.params.id, key: `paid:${req.params.id}`, type: "status", title: "Payment recorded", message: `${(invoice as any).vendor ?? "Invoice"} was marked as paid.`, severity: "success" });
    res.json(sanitizeInvoice(invoice));
  } catch {
    res.status(500).json({ error: "Failed to mark as paid" });
  }
});

payablesRouter.post("/invoices/:id/analyze", async (req, res) => {
  const actor = await getActor(req, res);
  if (!actor) return;
  try {
    await connectMongo();
    const invoice = await Invoice.findOne({ _id: req.params.id, uid: actor.uid });
    if (!invoice) return res.status(404).json({ error: "Invoice not found" });
    await extractAndApplyInvoice(invoice);
    await analyzeInvoice(req.params.id, actor.uid);
    await audit(actor.uid, req.params.id, "invoice_analyzed", actor);
    const updated = await Invoice.findOne({ _id: req.params.id, uid: actor.uid }).lean();
    res.json(sanitizeInvoice(updated));
  } catch {
    res.status(500).json({ error: "Failed to analyze invoice" });
  }
});

  payablesRouter.get("/payment-queue", async (req, res) => {
    const actor = await getActor(req, res);
    if (!actor) return;
    try {
      await connectMongo();
      const invoices = await Invoice.find({ uid: actor.uid, status: { $in: ["approved", "pending_approval", "extracted"] } })
        .select("-originalFileData")
        .sort({ dueDate: 1, total: -1 })
        .lean();
      const queue = invoices.map((invoice: any) => ({ ...invoice, daysUntilDue: daysFromNow(invoice.dueDate), urgency: paymentUrgency(invoice), discountAlert: earlyPaymentDiscount(invoice) }));
      const approved = queue.filter((invoice: any) => invoice.status === "approved");
      const discounts = queue.filter((invoice: any) => invoice.discountAlert);
      res.json({ queue, summary: { totalQueued: queue.length, approvedReady: approved.length, approvedAmount: summarizeInvoices(approved), discountOpportunities: discounts.length, estimatedSavings: discounts.reduce((sum: number, inv: any) => sum + (inv.discountAlert?.estimatedSavings ?? 0), 0) } });
    } catch (err) {
      console.error("Payables payment queue error:", err);
      res.status(500).json({ error: "Failed to fetch payment queue" });
    }
  });

  payablesRouter.get("/cash-forecast", async (req, res) => {
    const actor = await getActor(req, res);
    if (!actor) return;
    try {
      await connectMongo();
      const invoices = await Invoice.find({ uid: actor.uid, status: { $nin: ["paid", "rejected"] }, dueDate: { $exists: true, $nin: [null, ""] } })
        .select("-originalFileData")
        .lean();
      const today = startOfDay();
      const in7 = addDays(today, 7);
      const in30 = addDays(today, 30);
      const in60 = addDays(today, 60);
      const bucket = (from: Date | null, to: Date | null) => invoices.filter((invoice: any) => {
        const due = new Date(invoice.dueDate);
        if (from && due < from) return false;
        if (to && due > to) return false;
        return true;
      });
      const overdue = invoices.filter((invoice: any) => new Date(invoice.dueDate) < today);
      const thisWeek = bucket(today, in7);
      const thisMonth = bucket(today, in30);
      const nextMonth = bucket(addDays(in30, 1), in60);
      const later = bucket(addDays(in60, 1), null);
      res.json({
        generatedAt: new Date().toISOString(),
        buckets: {
          overdue: { count: overdue.length, amount: summarizeInvoices(overdue), invoices: overdue },
          thisWeek: { count: thisWeek.length, amount: summarizeInvoices(thisWeek), invoices: thisWeek },
          thisMonth: { count: thisMonth.length, amount: summarizeInvoices(thisMonth), invoices: thisMonth },
          nextMonth: { count: nextMonth.length, amount: summarizeInvoices(nextMonth), invoices: nextMonth },
          later: { count: later.length, amount: summarizeInvoices(later), invoices: later },
        },
      });
    } catch (err) {
      console.error("Payables forecast error:", err);
      res.status(500).json({ error: "Failed to build cash forecast" });
    }
  });

  payablesRouter.get("/spend-analytics", async (req, res) => {
    const actor = await getActor(req, res);
    if (!actor) return;
    try {
      await connectMongo();
      const [byVendor, byMonth, byStatus] = await Promise.all([
        Invoice.aggregate([{ $match: { uid: actor.uid, total: { $gt: 0 } } }, { $group: { _id: "$vendor", vendor: { $first: "$vendor" }, amount: { $sum: "$total" }, count: { $sum: 1 } } }, { $sort: { amount: -1 } }, { $limit: 12 }]),
        Invoice.aggregate([{ $match: { uid: actor.uid, total: { $gt: 0 } } }, { $group: { _id: { $substr: ["$invoiceDate", 0, 7] }, amount: { $sum: "$total" }, count: { $sum: 1 } } }, { $sort: { _id: 1 } }]),
        Invoice.aggregate([{ $match: { uid: actor.uid } }, { $group: { _id: "$status", amount: { $sum: { $ifNull: ["$total", 0] } }, count: { $sum: 1 } } }, { $sort: { count: -1 } }]),
      ]);
      res.json({ byVendor, byMonth, byStatus });
    } catch (err) {
      console.error("Payables analytics error:", err);
      res.status(500).json({ error: "Failed to fetch spend analytics" });
    }
  });

  payablesRouter.get("/accounting/status", async (req, res) => {
    const actor = await getActor(req, res);
    if (!actor) return;
    await connectMongo();
    const records = await PayablesAccountingConnection.find({ uid: actor.uid }).lean();
    const providers = ["quickbooks", "xero"].map((provider) => records.find((record: any) => record.provider === provider) ?? { provider, status: "not_connected" });
    res.json({ providers });
  });

  payablesRouter.post("/accounting/connect", async (req, res) => {
    const actor = await getActor(req, res);
    if (!actor) return;
    if (!ensureManageWorkspace(actor, res)) return;
    const provider = String(req.body.provider ?? "").toLowerCase();
    if (!["quickbooks", "xero"].includes(provider)) return res.status(400).json({ error: "Provider must be quickbooks or xero" });
    await connectMongo();
    const hasOAuthConfig = provider === "quickbooks" ? !!(process.env.QUICKBOOKS_CLIENT_ID && process.env.QUICKBOOKS_CLIENT_SECRET) : !!(process.env.XERO_CLIENT_ID && process.env.XERO_CLIENT_SECRET);
    const connection = await PayablesAccountingConnection.findOneAndUpdate(
      { uid: actor.uid, provider },
      { uid: actor.uid, provider, status: hasOAuthConfig ? "connected" : "export_ready", externalCompanyName: String(req.body.externalCompanyName ?? "").trim(), settings: { configuredBy: actor.email ?? actor.actorUid, configuredAt: new Date().toISOString(), mode: hasOAuthConfig ? "oauth_configured" : "export_ready" } },
      { upsert: true, new: true }
    );
    await audit(actor.uid, undefined, "accounting_connection_updated", actor, { provider, status: (connection as any).status });
    res.json({ connection, oauthConfigured: hasOAuthConfig });
  });

  payablesRouter.post("/accounting/sync", async (req, res) => {
    const actor = await getActor(req, res);
    if (!actor) return;
    if (!ensureManageWorkspace(actor, res)) return;
    const provider = String(req.body.provider ?? "").toLowerCase();
    if (!["quickbooks", "xero"].includes(provider)) return res.status(400).json({ error: "Provider must be quickbooks or xero" });
    await connectMongo();
    const invoices = await Invoice.find({ uid: actor.uid, status: { $in: ["approved", "paid"] } }).select("-originalFileData").lean();
    const connection = await PayablesAccountingConnection.findOneAndUpdate(
      { uid: actor.uid, provider },
      { uid: actor.uid, provider, status: "export_ready", lastSyncAt: new Date(), lastSyncCount: invoices.length, lastSyncMode: "export_ready" },
      { upsert: true, new: true }
    );
    await audit(actor.uid, undefined, "accounting_sync_prepared", actor, { provider, invoiceCount: invoices.length });
    res.json({ success: true, provider, mode: (connection as any).lastSyncMode, syncedCount: invoices.length, invoices });
  });

  payablesRouter.get("/reports/summary.csv", async (req, res) => {
    const actor = await getActor(req, res);
    if (!actor) return;
    await connectMongo();
    const invoices = await Invoice.find({ uid: actor.uid }).select("-originalFileData").sort({ dueDate: 1 }).lean();
    const rows = [["Vendor", "Invoice Number", "Status", "Due Date", "Currency", "Total", "Source"], ...invoices.map((invoice: any) => [invoice.vendor, invoice.invoiceNumber, invoice.status, invoice.dueDate, invoice.currency, invoice.total, invoice.source])];
    res.setHeader("Content-Type", "text/csv; charset=utf-8");
    res.setHeader("Content-Disposition", "attachment; filename=payables-report.csv");
    res.send(rows.map((row) => row.map(csvEscape).join(",")).join("\n"));
  });

  payablesRouter.get("/reports/summary", async (req, res) => {
    const actor = await getActor(req, res);
    if (!actor) return;
    await connectMongo();
    const invoices = await Invoice.find({ uid: actor.uid }).select("-originalFileData").sort({ dueDate: 1 }).lean();
    res.json({ invoices, totals: { count: invoices.length, amount: summarizeInvoices(invoices as any[]) } });
  });
  
payablesRouter.get("/vendors", async (req, res) => {
  const actor = await getActor(req, res);
  if (!actor) return;
  try {
    await connectMongo();
    const vendors = await Invoice.aggregate([
      { $match: { uid: actor.uid, vendor: { $exists: true, $nin: [null, ""] } } },
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
          pendingCount: { $sum: { $cond: [{ $in: ["$status", ["extracted", "pending_approval"]] }, 1, 0] } },
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

payablesRouter.get("/vendors/:vendorName/invoices", async (req, res) => {
  const actor = await getActor(req, res);
  if (!actor) return;
  try {
    await connectMongo();
    const vendorName = decodeURIComponent(req.params.vendorName);
    const invoices = await Invoice.find({ uid: actor.uid, vendor: vendorName }).select("-originalFileData").sort({ createdAt: -1 }).lean();
    res.json({ invoices });
  } catch {
    res.status(500).json({ error: "Failed to fetch vendor invoices" });
  }
});

payablesRouter.get("/gmail/status", async (req, res) => {
  const actor = await getActor(req, res);
  if (!actor) return;
  try {
    await connectMongo();
    const token = await InboxToken.findOne({ uid: actor.uid });
    res.json({ connected: !!token, email: token ? (token as any).email : null });
  } catch {
    res.json({ connected: false, email: null });
  }
});

payablesRouter.get("/flags", async (req, res) => {
  const actor = await getActor(req, res);
  if (!actor) return;
  try {
    await connectMongo();
    const flagged = await Invoice.find({ uid: actor.uid, "flags.0": { $exists: true }, status: { $nin: ["rejected", "paid"] } })
      .sort({ createdAt: -1 })
      .select("vendor invoiceNumber total currency status flags dueDate createdAt")
      .lean();
    res.json({ flagged });
  } catch {
    res.status(500).json({ error: "Failed to fetch flags" });
  }
});
