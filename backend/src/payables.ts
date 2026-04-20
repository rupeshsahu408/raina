import express from "express";
import multer from "multer";
import mongoose, { Schema } from "mongoose";
import { randomUUID } from "crypto";
import { google } from "googleapis";
import { connectMongo } from "./db";
import { Invoice, InvoiceFlag } from "./models/Invoice";
import { InboxToken } from "./models/InboxToken";
import { UserProfile } from "./models/UserProfile";
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
        role: { type: String, enum: ["owner", "admin", "approver", "member"], default: "member" },
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

function makeOAuth2Client() {
  return new google.auth.OAuth2(GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET, GOOGLE_REDIRECT_URI);
}

function getActor(req: express.Request, res: express.Response) {
  const authUid = (req as any).user?.uid as string | undefined;
  const authEmail = (req as any).user?.email as string | undefined;
  const headerUid = req.headers["x-uid"] as string | undefined;
  const uid = authUid || headerUid;
  if (!uid) {
    res.status(401).json({ error: "Unauthorized" });
    return null;
  }
  if (authUid && headerUid && authUid !== headerUid) {
    res.status(403).json({ error: "Authenticated user does not match requested workspace" });
    return null;
  }
  return { uid, email: authEmail };
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

async function extractInvoiceDataFromImage(imageBase64: string, mimeType: string): Promise<Record<string, unknown>> {
  const prompt = `You are an expert accounts payable AI. Extract all invoice data from this document and return ONLY a valid JSON object with these exact fields (use null for missing fields):
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
      model: mimeType.startsWith("image/") ? "meta/llama-3.2-11b-vision-instruct" : "nvidia/llama-3.1-nemotron-70b-instruct",
      messages: [{ role: "user", content: `${prompt}\n\n[DOCUMENT DATA:${mimeType}:base64]${imageBase64}` }],
      max_tokens: 1500,
    });
    const jsonMatch = response.match(/\{[\s\S]*\}/);
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
    const jsonMatch = response.match(/\{[\s\S]*\}/);
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
    if (!invoice.dueDate) missing.push("due date");
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
        flags.push({
          type: "new_vendor",
          severity: "info",
          message: `"${invoice.vendor}" is a new vendor — this is their first invoice in your system. Verify their identity before approving.`,
        });
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

payablesRouter.get("/company", async (req, res) => {
  const actor = getActor(req, res);
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
  const actor = getActor(req, res);
  if (!actor) return;
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
  const actor = getActor(req, res);
  if (!actor) return;
  await connectMongo();
  const members = await PayablesTeamMember.find({ uid: actor.uid }).sort({ role: 1, createdAt: -1 }).lean();
  res.json({ members });
});

payablesRouter.post("/team", async (req, res) => {
  const actor = getActor(req, res);
  if (!actor) return;
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
        role: ["admin", "approver", "member"].includes(req.body.role) ? req.body.role : "member",
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
  const actor = getActor(req, res);
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
  const actor = getActor(req, res);
  if (!actor) return;
  await connectMongo();
  const update: Record<string, unknown> = {};
  if (["admin", "approver", "member"].includes(req.body.role)) update.role = req.body.role;
  if (["pending", "active", "disabled"].includes(req.body.status)) update.status = req.body.status;
  if (typeof req.body.name === "string") update.name = req.body.name.trim();
  const member = await PayablesTeamMember.findOneAndUpdate({ _id: req.params.id, uid: actor.uid, role: { $ne: "owner" } }, update, { new: true });
  if (!member) return res.status(404).json({ error: "Team member not found" });
  await audit(actor.uid, undefined, "team_member_updated", actor, { memberId: req.params.id, update });
  res.json(member);
});

payablesRouter.delete("/team/:id", async (req, res) => {
  const actor = getActor(req, res);
  if (!actor) return;
  await connectMongo();
  await PayablesTeamMember.deleteOne({ _id: req.params.id, uid: actor.uid, role: { $ne: "owner" } });
  await audit(actor.uid, undefined, "team_member_removed", actor, { memberId: req.params.id });
  res.json({ success: true });
});

payablesRouter.get("/approval-rules", async (req, res) => {
  const actor = getActor(req, res);
  if (!actor) return;
  await connectMongo();
  const rules = await PayablesApprovalRule.find({ uid: actor.uid }).sort({ minAmount: 1 }).lean();
  res.json({ rules });
});

payablesRouter.post("/approval-rules", async (req, res) => {
  const actor = getActor(req, res);
  if (!actor) return;
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
  const actor = getActor(req, res);
  if (!actor) return;
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
  const actor = getActor(req, res);
  if (!actor) return;
  await connectMongo();
  await PayablesApprovalRule.deleteOne({ _id: req.params.id, uid: actor.uid });
  await audit(actor.uid, undefined, "approval_rule_deleted", actor, { ruleId: req.params.id });
  res.json({ success: true });
});

payablesRouter.get("/notifications", async (req, res) => {
  const actor = getActor(req, res);
  if (!actor) return;
  await connectMongo();
  const notifications = await PayablesNotification.find({ uid: actor.uid }).sort({ createdAt: -1 }).limit(50).lean();
  const unreadCount = await PayablesNotification.countDocuments({ uid: actor.uid, readAt: { $exists: false } });
  res.json({ notifications, unreadCount });
});

payablesRouter.post("/notifications/mark-read", async (req, res) => {
  const actor = getActor(req, res);
  if (!actor) return;
  await connectMongo();
  await PayablesNotification.updateMany({ uid: actor.uid, readAt: { $exists: false } }, { $set: { readAt: new Date() } });
  res.json({ success: true });
});

payablesRouter.post("/upload", upload.single("invoice"), async (req, res) => {
  const actor = getActor(req, res);
  if (!actor) return;
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
        const extracted = await extractInvoiceDataFromImage(invoice.originalFileData, req.file!.mimetype);
        applyExtracted(invoice, extracted);
        invoice.status = "extracted";
        await invoice.save();
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
  const actor = getActor(req, res);
  if (!actor) return;
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
          const extracted = attachmentData ? await extractInvoiceDataFromImage(attachmentData, attachmentMime) : await extractInvoiceDataFromText(rawText);
          applyExtracted(invoice, extracted);
          invoice.status = "extracted";
          await invoice.save();
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
  const actor = getActor(req, res);
  if (!actor) return;
  try {
    const ids = Array.isArray(req.body.ids) ? req.body.ids : [];
    const action = req.body.action;
    if (!ids.length || !["approve", "reject", "paid", "delete", "analyze"].includes(action)) return res.status(400).json({ error: "Select invoices and a valid action" });
    await connectMongo();
    let updated = 0;
    if (action === "delete") {
      const result = await Invoice.deleteMany({ uid: actor.uid, _id: { $in: ids } });
      updated = result.deletedCount ?? 0;
    } else {
      const invoices = await Invoice.find({ uid: actor.uid, _id: { $in: ids } });
      for (const invoice of invoices as any[]) {
        if (action === "approve") { invoice.status = "approved"; invoice.approvedAt = new Date(); invoice.approvedBy = actor.email ?? actor.uid; }
        if (action === "reject") { invoice.status = "rejected"; invoice.rejectedAt = new Date(); invoice.rejectionReason = req.body.reason ?? "Bulk rejected"; }
        if (action === "paid") { invoice.status = "paid"; invoice.paidAt = new Date(); invoice.paymentAmount = invoice.total; }
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
  const actor = getActor(req, res);
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
  const actor = getActor(req, res);
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
  const actor = getActor(req, res);
  if (!actor) return;
  await connectMongo();
  const invoice = (await Invoice.findOne({ _id: req.params.id, uid: actor.uid }).select("originalFileData originalMimeType originalFileName")) as any;
  if (!invoice?.originalFileData) return res.status(404).json({ error: "Document not found" });
  res.setHeader("Content-Type", invoice.originalMimeType || "application/octet-stream");
  res.setHeader("Content-Disposition", `inline; filename="${encodeURIComponent(invoice.originalFileName || "invoice")}"`);
  res.send(Buffer.from(invoice.originalFileData, "base64"));
});

payablesRouter.get("/invoices/:id", async (req, res) => {
  const actor = getActor(req, res);
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
  const actor = getActor(req, res);
  if (!actor) return;
  try {
    await connectMongo();
    const invoice = await Invoice.findOne({ _id: req.params.id, uid: actor.uid });
    if (!invoice) return res.status(404).json({ error: "Invoice not found" });
    const allowed = ["vendor", "vendorEmail", "invoiceNumber", "invoiceDate", "dueDate", "currency", "subtotal", "tax", "total", "lineItems", "notes", "status", "assignedApproverEmail", "assignedApproverName"];
    for (const key of allowed) if (req.body[key] !== undefined) (invoice as any)[key] = req.body[key];
    if (req.body.status === "approved") { (invoice as any).approvedAt = new Date(); (invoice as any).approvedBy = actor.email ?? actor.uid; }
    if (req.body.status === "rejected") { (invoice as any).rejectedAt = new Date(); if (req.body.rejectionReason) (invoice as any).rejectionReason = req.body.rejectionReason; }
    if (req.body.status === "paid") (invoice as any).paidAt = new Date();
    await invoice.save();
    await audit(actor.uid, req.params.id, "invoice_updated", actor, { fields: Object.keys(req.body ?? {}) });
    res.json(sanitizeInvoice(invoice));
  } catch (err) {
    console.error("Payables patch error:", err);
    res.status(500).json({ error: "Failed to update invoice" });
  }
});

payablesRouter.delete("/invoices/:id", async (req, res) => {
  const actor = getActor(req, res);
  if (!actor) return;
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
  const actor = getActor(req, res);
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
  const actor = getActor(req, res);
  if (!actor) return;
  try {
    await connectMongo();
    const invoice = await Invoice.findOne({ _id: req.params.id, uid: actor.uid });
    if (!invoice) return res.status(404).json({ error: "Invoice not found" });
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
  const actor = getActor(req, res);
  if (!actor) return;
  try {
    await connectMongo();
    const invoice = await Invoice.findOne({ _id: req.params.id, uid: actor.uid });
    if (!invoice) return res.status(404).json({ error: "Invoice not found" });
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
  const actor = getActor(req, res);
  if (!actor) return;
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
  const actor = getActor(req, res);
  if (!actor) return;
  try {
    await connectMongo();
    const invoice = await Invoice.findOne({ _id: req.params.id, uid: actor.uid });
    if (!invoice) return res.status(404).json({ error: "Invoice not found" });
    await analyzeInvoice(req.params.id, actor.uid);
    await audit(actor.uid, req.params.id, "invoice_analyzed", actor);
    const updated = await Invoice.findOne({ _id: req.params.id, uid: actor.uid }).lean();
    res.json(sanitizeInvoice(updated));
  } catch {
    res.status(500).json({ error: "Failed to analyze invoice" });
  }
});

payablesRouter.get("/vendors", async (req, res) => {
  const actor = getActor(req, res);
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
  const actor = getActor(req, res);
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
  const actor = getActor(req, res);
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
  const actor = getActor(req, res);
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
