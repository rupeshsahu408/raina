import express from "express";
import multer from "multer";
import { google } from "googleapis";
import { connectMongo } from "./db";
import { InboxToken } from "./models/InboxToken";
import { FollowUp } from "./models/FollowUp";
import { callNvidiaChatCompletions } from "./ai/nvidiaClient";

const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 25 * 1024 * 1024 } });

export const inboxRouter = express.Router();
export const inboxPublicRouter = express.Router();

const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID ?? "";
const GOOGLE_CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET ?? "";
const GOOGLE_REDIRECT_URI = process.env.GOOGLE_REDIRECT_URI ?? "https://raina-1.onrender.com/inbox/callback";
const NVIDIA_API_KEY = process.env.NVIDIA_API_KEY ?? "";

function makeOAuth2Client() {
  return new google.auth.OAuth2(GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET, GOOGLE_REDIRECT_URI);
}

async function getAuthenticatedClient(uid: string) {
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

function decodeBase64UrlToBuffer(str: string): Buffer {
  let base64 = str.replace(/-/g, "+").replace(/_/g, "/");
  const padding = base64.length % 4;
  if (padding) base64 += "=".repeat(4 - padding);
  return Buffer.from(base64, "base64");
}

function decodeBase64Url(str: string): string {
  try {
    return decodeBase64UrlToBuffer(str).toString("utf-8");
  } catch {
    return "";
  }
}

function extractHeader(headers: any[], name: string): string {
  return headers?.find((h: any) => h.name.toLowerCase() === name.toLowerCase())?.value ?? "";
}

function stripHtmlTags(html: string): string {
  return html
    .replace(/<style[\s\S]*?<\/style>/gi, " ")
    .replace(/<script[\s\S]*?<\/script>/gi, " ")
    .replace(/<br\s*\/?>/gi, "\n")
    .replace(/<\/p>|<\/div>|<\/li>|<\/tr>/gi, "\n")
    .replace(/<[^>]+>/g, " ")
    .replace(/\n\s+/g, "\n")
    .replace(/[ \t]+/g, " ")
    .replace(/\n{3,}/g, "\n\n")
    .trim()
    .slice(0, 8000);
}

function normalizePlainTextEmail(text: string): string {
  return text
    .replace(/\r\n?/g, "\n")
    .replace(/={12,}/g, "\n\n---\n\n")
    .replace(/[ \t]{2,}/g, " ")
    .replace(/([.!?])\s+(This message was sent|If you don't want|To help keep|Follow the link|Community Support|You can unsubscribe)/gi, "$1\n\n$2")
    .replace(/\s+(Hi\s+[^,\n]+,)/i, "\n\n$1")
    .replace(/\s+(Thanks,\s*[^\n]+)$/i, "\n\n$1")
    .replace(/\n{3,}/g, "\n\n")
    .trim()
    .slice(0, 12000);
}

function normalizeContentId(value: string): string {
  return value.trim().replace(/^</, "").replace(/>$/, "").replace(/^cid:/i, "").toLowerCase();
}

async function getPartText(gmail: any, messageId: string, part: any): Promise<string> {
  if (part.body?.data) return decodeBase64Url(part.body.data);
  if (!part.body?.attachmentId) return "";
  try {
    const attachment = await gmail.users.messages.attachments.get({
      userId: "me",
      messageId,
      id: part.body.attachmentId,
    });
    return attachment.data.data ? decodeBase64Url(attachment.data.data) : "";
  } catch {
    return "";
  }
}

async function getPartBase64(gmail: any, messageId: string, part: any): Promise<string> {
  try {
    if (part.body?.data) return decodeBase64UrlToBuffer(part.body.data).toString("base64");
    if (!part.body?.attachmentId) return "";
    const attachment = await gmail.users.messages.attachments.get({
      userId: "me",
      messageId,
      id: part.body.attachmentId,
    });
    return attachment.data.data ? decodeBase64UrlToBuffer(attachment.data.data).toString("base64") : "";
  } catch {
    return "";
  }
}

async function extractMessageContent(payload: any, gmail: any, messageId: string): Promise<{ html: string; text: string }> {
  const htmlParts: string[] = [];
  const textParts: string[] = [];
  const inlineImages: Record<string, { mimeType: string; data: string }> = {};

  async function walk(part: any): Promise<void> {
    if (!part) return;
    const mimeType = String(part.mimeType ?? "").toLowerCase();
    const headers = part.headers ?? [];
    const contentId = extractHeader(headers, "Content-ID");
    const disposition = extractHeader(headers, "Content-Disposition").toLowerCase();

    if (mimeType === "text/html") {
      const html = await getPartText(gmail, messageId, part);
      if (html) htmlParts.push(html);
    } else if (mimeType === "text/plain") {
      const text = await getPartText(gmail, messageId, part);
      if (text) textParts.push(text);
    } else if (contentId && mimeType.startsWith("image/") && (!disposition || disposition.includes("inline"))) {
      const data = await getPartBase64(gmail, messageId, part);
      if (data) inlineImages[normalizeContentId(contentId)] = { mimeType, data };
    }

    if (Array.isArray(part.parts)) {
      for (const child of part.parts) {
        await walk(child);
      }
    }
  }

  await walk(payload);

  let html = htmlParts.join("<hr>");
  for (const [cid, image] of Object.entries(inlineImages)) {
    const escapedCid = cid.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    html = html.replace(new RegExp(`cid:${escapedCid}`, "gi"), `data:${image.mimeType};base64,${image.data}`);
  }

  const text = normalizePlainTextEmail(textParts.join("\n\n").trim() || stripHtmlTags(html));
  return { html, text };
}

type IntentLabel = "Lead" | "Support" | "Payment" | "Meeting" | "Spam" | "FYI";
type PriorityCategory = "Urgent" | "High-Value Lead" | "Payment" | "Support Issue" | "Risk Detected" | "Needs Reply" | "Low Priority";
type RiskLevel = "High" | "Medium" | "Low";

interface PrioritySignal {
  priorityCategory: PriorityCategory;
  priorityScore: number;
  priorityReason: string;
  suggestedAction: string;
  riskLevel: RiskLevel;
  bestTone: string;
}

interface ActionPlan {
  summary: string;
  intent: string;
  priority: string;
  recommendedAction: string;
  risk: string;
  bestTone: string;
  suggestedNextStep: string;
  source: "ai" | "rules";
}

function detectIntent(subject: string, snippet: string): IntentLabel {
  const text = `${subject} ${snippet}`.toLowerCase();
  if (/invoice|payment|due|amount|bill|pay now|overdue/i.test(text)) return "Payment";
  if (/meeting|schedule|call|zoom|google meet|calendar|appointment/i.test(text)) return "Meeting";
  if (/issue|bug|problem|error|broken|not working|support|help|urgent/i.test(text)) return "Support";
  if (/pricing|quote|proposal|interested|demo|trial|offer|discount|buy|purchase/i.test(text)) return "Lead";
  if (/unsubscribe|newsletter|promotion|sale|% off|deal|offer/i.test(text)) return "Spam";
  return "FYI";
}

function inferPriority(subject: string, snippet: string, intent: IntentLabel, isUnread = false): PrioritySignal {
  const text = `${subject} ${snippet}`.toLowerCase();
  let signal: PrioritySignal;
  if (/refund|cancel|cancellation|angry|upset|legal|lawsuit|chargeback|security|breach|escalat|complaint|failed|blocked/i.test(text)) {
    signal = {
      priorityCategory: "Risk Detected",
      priorityScore: 96,
      priorityReason: "Potential escalation, financial, or trust risk detected.",
      suggestedAction: "Open now and respond with a clear resolution path.",
      riskLevel: "High",
      bestTone: "Empathetic + decisive",
    };
  } else if (/urgent|asap|immediately|today|deadline|final notice|overdue|last chance|time sensitive/i.test(text)) {
    signal = {
      priorityCategory: "Urgent",
      priorityScore: 92,
      priorityReason: "Time-sensitive wording suggests this needs attention today.",
      suggestedAction: "Reply or archive after deciding the next step.",
      riskLevel: "High",
      bestTone: "Direct + professional",
    };
  } else if (intent === "Lead") {
    signal = {
      priorityCategory: "High-Value Lead",
      priorityScore: 86,
      priorityReason: "Buying intent or pricing interest was detected.",
      suggestedAction: "Reply quickly with pricing, a qualifying question, or a call option.",
      riskLevel: "Medium",
      bestTone: "Helpful + sales-focused",
    };
  } else if (intent === "Payment") {
    signal = {
      priorityCategory: "Payment",
      priorityScore: 82,
      priorityReason: "Payment, invoice, or billing language was detected.",
      suggestedAction: "Confirm status, share payment details, or resolve the billing question.",
      riskLevel: "Medium",
      bestTone: "Clear + concise",
    };
  } else if (intent === "Support") {
    signal = {
      priorityCategory: "Support Issue",
      priorityScore: 78,
      priorityReason: "The sender appears to need help with a problem or issue.",
      suggestedAction: "Acknowledge the issue and give the next troubleshooting step.",
      riskLevel: "Medium",
      bestTone: "Empathetic + practical",
    };
  } else if (intent === "Meeting" || /\?|reply|respond|confirm|let me know|thoughts|available|can you|could you|please/i.test(text)) {
    signal = {
      priorityCategory: "Needs Reply",
      priorityScore: 70,
      priorityReason: "The message likely expects a response or decision.",
      suggestedAction: "Send a short reply or confirm the requested detail.",
      riskLevel: "Low",
      bestTone: "Professional + brief",
    };
  } else if (intent === "Spam") {
    signal = {
      priorityCategory: "Low Priority",
      priorityScore: 18,
      priorityReason: "Promotional or low-value language was detected.",
      suggestedAction: "Review later, unsubscribe, archive, or ignore.",
      riskLevel: "Low",
      bestTone: "No reply needed",
    };
  } else {
    signal = {
      priorityCategory: "Low Priority",
      priorityScore: 38,
      priorityReason: "No strong action signal was detected.",
      suggestedAction: "Review after higher-priority conversations.",
      riskLevel: "Low",
      bestTone: "Neutral",
    };
  }
  return { ...signal, priorityScore: Math.min(100, signal.priorityScore + (isUnread ? 4 : 0)) };
}

function compactText(value: string, max = 220): string {
  const cleaned = value.replace(/\s+/g, " ").trim();
  return cleaned.length > max ? `${cleaned.slice(0, max - 1)}…` : cleaned;
}

function heuristicActionPlan(args: {
  subject: string;
  thread: string;
  snippet?: string;
  intent?: IntentLabel;
  priorityCategory?: PriorityCategory;
  prioritySignal?: PrioritySignal;
}): ActionPlan {
  const intent = args.intent ?? detectIntent(args.subject, args.snippet || args.thread.slice(0, 500));
  const signal = args.prioritySignal ?? inferPriority(args.subject, args.snippet || args.thread.slice(0, 500), intent);
  const summaryBase = compactText(args.thread || args.snippet || args.subject, 170);
  const priority = signal.priorityScore >= 85 ? "High" : signal.priorityScore >= 60 ? "Medium" : "Low";
  return {
    summary: summaryBase || `Conversation about ${args.subject}.`,
    intent,
    priority,
    recommendedAction: signal.suggestedAction,
    risk: signal.riskLevel === "High" ? signal.priorityReason : signal.riskLevel === "Medium" ? "If delayed, this may slow down a business or customer outcome." : "Low immediate risk.",
    bestTone: signal.bestTone,
    suggestedNextStep: signal.priorityCategory === "Low Priority" ? "Archive or review later after high-priority mail." : "Open a reply draft and handle this before lower-priority messages.",
    source: "rules",
  };
}

function parseActionPlanJson(raw: string): Omit<ActionPlan, "source"> | null {
  try {
    const match = raw.match(/\{[\s\S]*\}/);
    if (!match) return null;
    const parsed = JSON.parse(match[0]);
    const required = ["summary", "intent", "priority", "recommendedAction", "risk", "bestTone", "suggestedNextStep"];
    if (!required.every(key => typeof parsed[key] === "string" && parsed[key].trim())) return null;
    return {
      summary: parsed.summary.trim(),
      intent: parsed.intent.trim(),
      priority: parsed.priority.trim(),
      recommendedAction: parsed.recommendedAction.trim(),
      risk: parsed.risk.trim(),
      bestTone: parsed.bestTone.trim(),
      suggestedNextStep: parsed.suggestedNextStep.trim(),
    };
  } catch {
    return null;
  }
}

async function generateActionPlan(args: {
  subject: string;
  thread: string;
  from?: string;
  snippet?: string;
  intent?: IntentLabel;
  priorityCategory?: PriorityCategory;
}): Promise<ActionPlan> {
  const intent = args.intent ?? detectIntent(args.subject, args.snippet || args.thread.slice(0, 500));
  const prioritySignal = inferPriority(args.subject, args.snippet || args.thread.slice(0, 500), intent);
  const fallback = heuristicActionPlan({ ...args, intent, prioritySignal });
  if (!NVIDIA_API_KEY) return fallback;
  try {
    const result = await callNvidiaChatCompletions({
      apiKey: NVIDIA_API_KEY,
      messages: [
        {
          role: "system",
          content: "You are Plyndrox, an executive Gmail command-center assistant. Analyze the latest email thread and return ONLY valid JSON with these string keys: summary, intent, priority, recommendedAction, risk, bestTone, suggestedNextStep. Be specific, concise, and action-oriented. priority must be High, Medium, or Low.",
        },
        {
          role: "user",
          content: `Subject: ${args.subject}\nFrom: ${args.from ?? "Unknown"}\nDetected intent: ${intent}\nDetected priority category: ${prioritySignal.priorityCategory}\n\nThread:\n${args.thread.slice(0, 7000)}`,
        },
      ],
      max_tokens: 420,
      temperature: 0.25,
    });
    const parsed = parseActionPlanJson(result);
    if (!parsed) return fallback;
    return { ...parsed, source: "ai" };
  } catch {
    return fallback;
  }
}

async function summarizeEmail(subject: string, body: string): Promise<string> {
  if (!NVIDIA_API_KEY) return "AI summary unavailable.";
  const trimmed = body.slice(0, 1500);
  try {
    const result = await callNvidiaChatCompletions({
      apiKey: NVIDIA_API_KEY,
      messages: [
        {
          role: "system",
          content: "You are an email assistant. Given an email subject and body, write a single concise sentence (max 15 words) summarizing what the sender wants or is saying. No filler, no quotes, be direct.",
        },
        { role: "user", content: `Subject: ${subject}\n\nBody:\n${trimmed}` },
      ],
      max_tokens: 60,
      temperature: 0.3,
    });
    return result.trim().replace(/^["']|["']$/g, "");
  } catch {
    return "Unable to generate summary.";
  }
}

async function generateReply(args: {
  subject: string;
  thread: string;
  tone: string;
  instruction?: string;
}): Promise<string> {
  if (!NVIDIA_API_KEY) throw new Error("AI not configured.");
  const toneInstructions: Record<string, string> = {
    formal: "Write in a formal, professional tone. Use proper salutations and sign-off.",
    casual: "Write in a casual, friendly tone. Keep it relaxed and natural.",
    sales: "Write in a persuasive sales tone. Highlight value, create a gentle sense of urgency, and end with a clear call to action.",
    empathetic: "Write in a warm, empathetic tone. Acknowledge the sender's situation first, then respond helpfully.",
    short: "Write a very short reply — 2-4 sentences maximum. Get straight to the point.",
  };
  const toneKey = args.tone.toLowerCase();
  const toneGuide = toneInstructions[toneKey] ?? toneInstructions.formal;

  const messages = [
    {
      role: "system" as const,
      content: `You are a professional email assistant. ${toneGuide}${args.instruction ? ` Additional instruction: ${args.instruction}` : ""} Write ONLY the email body. Do not include subject line. Use appropriate greeting and sign-off.`,
    },
    {
      role: "user" as const,
      content: `Email thread:\n\nSubject: ${args.subject}\n\n${args.thread}\n\nWrite a reply to the latest message.`,
    },
  ];

  return callNvidiaChatCompletions({
    apiKey: NVIDIA_API_KEY,
    messages,
    max_tokens: 500,
    temperature: 0.7,
  });
}

// ─── Routes ────────────────────────────────────────────────────────────────

// GET /inbox/auth-url
inboxRouter.get("/auth-url", async (req, res) => {
  const uid = (req as any).user?.uid;
  if (!uid) return res.status(401).json({ error: "Unauthorized" });
  if (!GOOGLE_CLIENT_ID || !GOOGLE_CLIENT_SECRET) {
    return res.status(503).json({ error: "Google OAuth not configured. Set GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET." });
  }
  const oauth2 = makeOAuth2Client();
  const url = oauth2.generateAuthUrl({
    access_type: "offline",
    prompt: "consent",
    scope: [
      "https://www.googleapis.com/auth/gmail.modify",
      "https://www.googleapis.com/auth/gmail.send",
      "https://www.googleapis.com/auth/userinfo.email",
    ],
    state: uid,
  });
  return res.json({ url });
});

// GET /inbox/callback  (no auth middleware — Google redirects here directly)
inboxPublicRouter.get("/callback", async (req, res) => {
  const { code, state: uid } = req.query as { code?: string; state?: string };
  if (!code || !uid) {
    return res.redirect(`${process.env.FRONTEND_URL ?? "https://www.plyndrox.app"}/inbox/connect?error=missing_params`);
  }
  try {
    const oauth2 = makeOAuth2Client();
    const { tokens } = await oauth2.getToken(code);
    oauth2.setCredentials(tokens);
    const oauth2info = google.oauth2({ version: "v2", auth: oauth2 });
    const { data } = await oauth2info.userinfo.get();
    const email = data.email ?? "";
    await connectMongo();
    await InboxToken.findOneAndUpdate(
      { uid },
      {
        uid,
        email,
        accessToken: tokens.access_token ?? "",
        refreshToken: tokens.refresh_token ?? "",
        expiresAt: tokens.expiry_date ?? Date.now() + 3600_000,
      },
      { upsert: true, new: true }
    );
    return res.redirect(`${process.env.FRONTEND_URL ?? "https://www.plyndrox.app"}/inbox/dashboard`);
  } catch (err: any) {
    console.error("[inbox/callback]", err);
    return res.redirect(`${process.env.FRONTEND_URL ?? "https://www.plyndrox.app"}/inbox/connect?error=oauth_failed`);
  }
});

// GET /inbox/status
inboxRouter.get("/status", async (req, res) => {
  const uid = (req as any).user?.uid;
  if (!uid) return res.status(401).json({ error: "Unauthorized" });
  await connectMongo();
  const record = await InboxToken.findOne({ uid });
  if (!record) return res.json({ connected: false });
  return res.json({ connected: true, email: record.email });
});

const FOLDER_CONFIG: Record<string, { labelIds?: string[]; q?: string }> = {
  inbox:    { labelIds: ["INBOX"], q: "in:inbox -category:promotions -category:social" },
  sent:     { labelIds: ["SENT"] },
  spam:     { labelIds: ["SPAM"] },
  trash:    { labelIds: ["TRASH"] },
  drafts:   { labelIds: ["DRAFT"] },
  starred:  { labelIds: ["STARRED"] },
  archive:  { q: "-in:inbox -in:spam -in:trash -in:sent -in:draft" },
  all:      { q: "-in:spam -in:trash" },
};

// GET /inbox/messages?maxResults=20&pageToken=xxx&folder=inbox
inboxRouter.get("/messages", async (req, res) => {
  const uid = (req as any).user?.uid;
  if (!uid) return res.status(401).json({ error: "Unauthorized" });
  const maxResults = Math.min(Number(req.query.maxResults ?? 25), 50);
  const pageToken = req.query.pageToken as string | undefined;
  const folder = (req.query.folder as string) || "inbox";
  const folderCfg = FOLDER_CONFIG[folder] ?? FOLDER_CONFIG.inbox;
  try {
    const auth = await getAuthenticatedClient(uid);
    const gmail = google.gmail({ version: "v1", auth });
    const listRes = await gmail.users.messages.list({
      userId: "me",
      maxResults,
      pageToken,
      ...(folderCfg.labelIds ? { labelIds: folderCfg.labelIds } : {}),
      ...(folderCfg.q ? { q: folderCfg.q } : {}),
    });
    const messageIds = listRes.data.messages ?? [];
    const threads: Record<string, any> = {};
    const messages = await Promise.all(
      messageIds.slice(0, maxResults).map(async (m) => {
        try {
          const msg = await gmail.users.messages.get({
            userId: "me",
            id: m.id!,
            format: "metadata",
            metadataHeaders: ["From", "Subject", "Date"],
          });
          const headers = msg.data.payload?.headers ?? [];
          const subject = extractHeader(headers, "Subject") || "(no subject)";
          const from = extractHeader(headers, "From");
          const date = extractHeader(headers, "Date");
          const snippet = msg.data.snippet ?? "";
          const threadId = msg.data.threadId ?? m.id!;
          const labelIds = msg.data.labelIds ?? [];
          const isUnread = labelIds.includes("UNREAD");
          const isStarred = labelIds.includes("STARRED");
          const intent = detectIntent(subject, snippet);
          const priority = inferPriority(subject, snippet, intent, isUnread);
          return {
            id: m.id,
            threadId,
            subject,
            from,
            date,
            snippet,
            summary: snippet.slice(0, 120),
            intent,
            priorityCategory: priority.priorityCategory,
            priorityScore: priority.priorityScore,
            priorityReason: priority.priorityReason,
            suggestedAction: priority.suggestedAction,
            riskLevel: priority.riskLevel,
            bestTone: priority.bestTone,
            isUnread,
            isStarred,
          };
        } catch {
          return null;
        }
      })
    );
    const filtered = messages.filter(Boolean);
    return res.json({
      messages: filtered,
      nextPageToken: listRes.data.nextPageToken ?? null,
    });
  } catch (err: any) {
    console.error("[inbox/messages]", err.message);
    return res.status(500).json({ error: err.message });
  }
});

// GET /inbox/thread/:threadId
inboxRouter.get("/thread/:threadId", async (req, res) => {
  const uid = (req as any).user?.uid;
  if (!uid) return res.status(401).json({ error: "Unauthorized" });
  const { threadId } = req.params;
  try {
    const auth = await getAuthenticatedClient(uid);
    const gmail = google.gmail({ version: "v1", auth });
    const threadRes = await gmail.users.threads.get({ userId: "me", id: threadId, format: "full" });
    const threadMessages = await Promise.all((threadRes.data.messages ?? []).map(async (msg) => {
      const headers = msg.payload?.headers ?? [];
      const subject = extractHeader(headers, "Subject") || "(no subject)";
      const from = extractHeader(headers, "From");
      const to = extractHeader(headers, "To");
      const cc = extractHeader(headers, "Cc");
      const date = extractHeader(headers, "Date");
      const content = await extractMessageContent(msg.payload, gmail, msg.id!);
      const body = content.text || (msg.snippet ?? "");
      return { id: msg.id, subject, from, to, cc, date, body, bodyText: body, bodyHtml: content.html };
    }));
    return res.json({ messages: threadMessages });
  } catch (err: any) {
    console.error("[inbox/thread]", err.message);
    return res.status(500).json({ error: err.message });
  }
});

// POST /inbox/action-plan
inboxRouter.post("/action-plan", express.json(), async (req, res) => {
  const uid = (req as any).user?.uid;
  if (!uid) return res.status(401).json({ error: "Unauthorized" });
  const { subject, thread, from, snippet, intent, priorityCategory } = req.body ?? {};
  if (!subject || !thread) return res.status(400).json({ error: "subject and thread are required" });
  const safeIntent: IntentLabel | undefined = ["Lead", "Support", "Payment", "Meeting", "Spam", "FYI"].includes(intent) ? intent : undefined;
  const safePriority: PriorityCategory | undefined = ["Urgent", "High-Value Lead", "Payment", "Support Issue", "Risk Detected", "Needs Reply", "Low Priority"].includes(priorityCategory) ? priorityCategory : undefined;
  try {
    const actionPlan = await generateActionPlan({
      subject: String(subject),
      thread: String(thread),
      from: from ? String(from) : undefined,
      snippet: snippet ? String(snippet) : undefined,
      intent: safeIntent,
      priorityCategory: safePriority,
    });
    return res.json({ actionPlan });
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
});

// POST /inbox/reply/generate
inboxRouter.post("/reply/generate", express.json(), async (req, res) => {
  const uid = (req as any).user?.uid;
  if (!uid) return res.status(401).json({ error: "Unauthorized" });
  const { subject, thread, tone = "formal", instruction } = req.body ?? {};
  if (!subject || !thread) return res.status(400).json({ error: "subject and thread are required" });
  try {
    const reply = await generateReply({ subject, thread, tone, instruction });
    return res.json({ reply });
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
});

// ── Email send helpers ────────────────────────────────────────────────────────

function htmlToPlain(html: string): string {
  return html
    .replace(/<br\s*\/?>/gi, "\n")
    .replace(/<\/p>/gi, "\n").replace(/<\/div>/gi, "\n")
    .replace(/<\/li>/gi, "\n").replace(/<\/h[1-6]>/gi, "\n\n")
    .replace(/<hr[^>]*>/gi, "\n---\n")
    .replace(/<[^>]+>/g, "")
    .replace(/&nbsp;/g, " ").replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<").replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"').replace(/&#039;|&#39;/g, "'")
    .replace(/\n{3,}/g, "\n\n").trim();
}

/** Encode subject per RFC 2047 if it contains non-ASCII characters */
function encodeSubject(s: string): string {
  return /[^\x20-\x7E]/.test(s)
    ? `=?UTF-8?B?${Buffer.from(s, "utf8").toString("base64")}?=`
    : s;
}

/** Fold base64 into 76-char lines as required by MIME spec */
function foldBase64(b64: string): string {
  return (b64.match(/.{1,76}/g) ?? [b64]).join("\r\n");
}

interface EmailAttachment {
  filename: string;
  contentType: string;
  data: Buffer;
}

/**
 * Build a complete RFC-2822 / MIME email that Gmail API can send.
 * When attachments are present, wraps content in multipart/mixed.
 * Otherwise uses multipart/alternative for plain-text + HTML.
 */
function buildEmail(opts: {
  to: string; cc?: string; bcc?: string; subject: string;
  bodyHtml: string; inReplyTo?: string;
  attachments?: EmailAttachment[];
}): string {
  const { to, cc, bcc, subject, bodyHtml, inReplyTo, attachments = [] } = opts;

  const isHtml = /<[a-zA-Z][^>]*>/.test(bodyHtml);

  const fullHtml = isHtml
    ? `<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width,initial-scale=1">
  <style>
    body { font-family: Arial, Helvetica, sans-serif; font-size: 14px; line-height: 1.6; color: #202124; margin: 0; padding: 16px 20px; }
    a { color: #1a73e8; text-decoration: none; }
    a:hover { text-decoration: underline; }
    blockquote { margin: 8px 0 8px 12px; padding-left: 12px; border-left: 3px solid #dadce0; color: #5f6368; }
    pre { background: #f5f5f5; border-radius: 6px; padding: 10px 14px; font-family: 'Courier New', monospace; font-size: 13px; white-space: pre-wrap; word-break: break-word; }
    code { background: #f1f3f4; padding: 2px 5px; border-radius: 3px; font-family: 'Courier New', monospace; font-size: 13px; }
    img { max-width: 100%; height: auto; display: block; }
    h1 { font-size: 1.6em; font-weight: 700; margin: 12px 0 6px; }
    h2 { font-size: 1.3em; font-weight: 700; margin: 10px 0 5px; }
    h3 { font-size: 1.1em; font-weight: 700; margin: 8px 0 4px; }
    ul { list-style: disc; padding-left: 1.5em; margin: 6px 0; }
    ol { list-style: decimal; padding-left: 1.5em; margin: 6px 0; }
    li { margin-bottom: 3px; }
    hr { border: 0; border-top: 1px solid #e8eaed; margin: 14px 0; }
    table { border-collapse: collapse; }
    td, th { padding: 6px 12px; border: 1px solid #e8eaed; }
  </style>
</head>
<body>${bodyHtml}</body>
</html>`
    : `<!DOCTYPE html><html><head><meta charset="UTF-8"></head><body><div style="font-family:Arial,sans-serif;font-size:14px;line-height:1.6;color:#202124;white-space:pre-wrap">${bodyHtml}</div></body></html>`;

  const plainText = htmlToPlain(bodyHtml);

  const plainB64 = foldBase64(Buffer.from(plainText, "utf8").toString("base64"));
  const htmlB64  = foldBase64(Buffer.from(fullHtml, "utf8").toString("base64"));

  const altBoundary = `plyndrox_alt_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`;

  const altPart = [
    `Content-Type: multipart/alternative; boundary="${altBoundary}"`,
    ``,
    `--${altBoundary}`,
    `Content-Type: text/plain; charset="UTF-8"`,
    `Content-Transfer-Encoding: base64`,
    ``,
    plainB64,
    ``,
    `--${altBoundary}`,
    `Content-Type: text/html; charset="UTF-8"`,
    `Content-Transfer-Encoding: base64`,
    ``,
    htmlB64,
    ``,
    `--${altBoundary}--`,
  ].join("\r\n");

  let bodySection: string;
  let topContentType: string;

  if (attachments.length > 0) {
    const mixedBoundary = `plyndrox_mix_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`;
    topContentType = `multipart/mixed; boundary="${mixedBoundary}"`;

    const attachmentParts = attachments.map(att => {
      const attB64 = foldBase64(att.data.toString("base64"));
      const safeName = encodeSubject(att.filename);
      return [
        `--${mixedBoundary}`,
        `Content-Type: ${att.contentType}; name="${safeName}"`,
        `Content-Transfer-Encoding: base64`,
        `Content-Disposition: attachment; filename="${safeName}"`,
        ``,
        attB64,
      ].join("\r\n");
    }).join("\r\n\r\n");

    bodySection = [
      `--${mixedBoundary}`,
      altPart,
      ``,
      attachmentParts,
      ``,
      `--${mixedBoundary}--`,
    ].join("\r\n");
  } else {
    topContentType = `multipart/alternative; boundary="${altBoundary}"`;
    bodySection = [
      `--${altBoundary}`,
      `Content-Type: text/plain; charset="UTF-8"`,
      `Content-Transfer-Encoding: base64`,
      ``,
      plainB64,
      ``,
      `--${altBoundary}`,
      `Content-Type: text/html; charset="UTF-8"`,
      `Content-Transfer-Encoding: base64`,
      ``,
      htmlB64,
      ``,
      `--${altBoundary}--`,
    ].join("\r\n");
  }

  const headers = [
    `To: ${to}`,
    cc  ? `Cc: ${cc}`  : "",
    bcc ? `Bcc: ${bcc}` : "",
    `Subject: ${encodeSubject(subject)}`,
    `MIME-Version: 1.0`,
    `Content-Type: ${topContentType}`,
    inReplyTo ? `In-Reply-To: <${inReplyTo}>` : "",
    inReplyTo ? `References: <${inReplyTo}>` : "",
  ].filter(Boolean).join("\r\n");

  return `${headers}\r\n\r\n${bodySection}`;
}

// POST /inbox/reply/send
inboxRouter.post("/reply/send", upload.array("attachments", 20), async (req, res) => {
  const uid = (req as any).user?.uid;
  if (!uid) return res.status(401).json({ error: "Unauthorized" });

  const body = req.body ?? {};
  const to        = body.to        ?? "";
  const cc        = body.cc        ?? "";
  const bcc       = body.bcc       ?? "";
  const subject   = body.subject   ?? "";
  const bodyHtml  = body.body      ?? "";
  const threadId  = body.threadId  ?? "";
  const inReplyTo = body.inReplyTo ?? "";

  const toStr      = (typeof to      === "string" ? to      : "").trim();
  const bodyStr    = (typeof bodyHtml === "string" ? bodyHtml : "").trim();
  const subjectStr = (typeof subject === "string" ? subject : "").trim() || "(no subject)";
  const ccStr      = (typeof cc      === "string" ? cc      : "").trim();
  const bccStr     = (typeof bcc     === "string" ? bcc     : "").trim();

  if (!toStr)   return res.status(400).json({ error: "At least one recipient (To) is required." });
  if (!bodyStr) return res.status(400).json({ error: "Message body cannot be empty." });

  const uploadedFiles = (req.files as Express.Multer.File[]) ?? [];
  const attachments: EmailAttachment[] = uploadedFiles.map(f => ({
    filename: f.originalname,
    contentType: f.mimetype || "application/octet-stream",
    data: f.buffer,
  }));

  try {
    const auth  = await getAuthenticatedClient(uid);
    const gmail = google.gmail({ version: "v1", auth });

    const isThreadReply = Boolean(threadId || inReplyTo);
    const finalSubject  = isThreadReply && !subjectStr.startsWith("Re:")
      ? `Re: ${subjectStr}` : subjectStr;

    const mimeMessage = buildEmail({
      to: toStr,
      cc:  ccStr  || undefined,
      bcc: bccStr || undefined,
      subject: finalSubject,
      bodyHtml: bodyStr,
      inReplyTo: inReplyTo ? String(inReplyTo) : undefined,
      attachments,
    });

    const raw = Buffer.from(mimeMessage, "utf8").toString("base64url");

    await gmail.users.messages.send({
      userId: "me",
      requestBody: threadId ? { raw, threadId: String(threadId) } : { raw },
    });

    return res.json({ success: true });
  } catch (err: any) {
    console.error("[inbox/reply/send]", err.message);
    return res.status(500).json({ error: err.message });
  }
});

// POST /inbox/trash/:messageId  — move to trash
inboxRouter.post("/trash/:messageId", express.json(), async (req, res) => {
  const uid = (req as any).user?.uid;
  if (!uid) return res.status(401).json({ error: "Unauthorized" });
  const { messageId } = req.params;
  try {
    const auth = await getAuthenticatedClient(uid);
    const gmail = google.gmail({ version: "v1", auth });
    await gmail.users.messages.trash({ userId: "me", id: messageId });
    return res.json({ success: true });
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
});

// POST /inbox/archive/:messageId  — remove from inbox (archive)
inboxRouter.post("/archive/:messageId", express.json(), async (req, res) => {
  const uid = (req as any).user?.uid;
  if (!uid) return res.status(401).json({ error: "Unauthorized" });
  const { messageId } = req.params;
  try {
    const auth = await getAuthenticatedClient(uid);
    const gmail = google.gmail({ version: "v1", auth });
    await gmail.users.messages.modify({
      userId: "me",
      id: messageId,
      requestBody: { removeLabelIds: ["INBOX"] },
    });
    return res.json({ success: true });
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
});

// POST /inbox/star/:messageId  — toggle star
inboxRouter.post("/star/:messageId", express.json(), async (req, res) => {
  const uid = (req as any).user?.uid;
  if (!uid) return res.status(401).json({ error: "Unauthorized" });
  const { messageId } = req.params;
  const { starred } = req.body ?? {};
  try {
    const auth = await getAuthenticatedClient(uid);
    const gmail = google.gmail({ version: "v1", auth });
    await gmail.users.messages.modify({
      userId: "me",
      id: messageId,
      requestBody: starred
        ? { addLabelIds: ["STARRED"] }
        : { removeLabelIds: ["STARRED"] },
    });
    return res.json({ success: true, starred });
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
});

// DELETE /inbox/disconnect
inboxRouter.delete("/disconnect", async (req, res) => {
  const uid = (req as any).user?.uid;
  if (!uid) return res.status(401).json({ error: "Unauthorized" });
  await connectMongo();
  await InboxToken.deleteOne({ uid });
  return res.json({ success: true });
});

// ─── Follow-Up System ────────────────────────────────────────────────────────

interface FollowUpDetection {
  needsFollowUp: boolean;
  reason: string;
  suggestedLabel: string;
  suggestedDaysFromNow: number;
}

function parseFollowUpJson(raw: string): FollowUpDetection | null {
  try {
    const match = raw.match(/\{[\s\S]*\}/);
    if (!match) return null;
    const parsed = JSON.parse(match[0]);
    if (typeof parsed.needsFollowUp !== "boolean") return null;
    if (typeof parsed.reason !== "string") return null;
    if (typeof parsed.suggestedDaysFromNow !== "number") return null;
    return {
      needsFollowUp: parsed.needsFollowUp,
      reason: String(parsed.reason).trim(),
      suggestedLabel: String(parsed.suggestedLabel ?? "").trim(),
      suggestedDaysFromNow: Math.max(0, Math.min(30, Number(parsed.suggestedDaysFromNow))),
    };
  } catch {
    return null;
  }
}

function heuristicFollowUp(subject: string, thread: string, intent: string): FollowUpDetection {
  const text = `${subject} ${thread.slice(0, 1000)}`.toLowerCase();
  const isSent = /i sent|we sent|as discussed|following up|attached|please find|proposal|quote|pricing|invoice sent/i.test(text);
  const isNoReply = !/thank you|thanks for|reply|respond|i will|we will|got it|received|noted/i.test(thread.slice(-1200));
  const needsFollowUp = isSent || (intent === "Lead" && isNoReply) || (intent === "Payment" && isNoReply);
  const days = intent === "Urgent" ? 1 : intent === "Lead" || intent === "Payment" ? 2 : 3;
  return {
    needsFollowUp,
    reason: needsFollowUp
      ? isSent
        ? "You sent information but haven't received a reply yet."
        : `This ${intent.toLowerCase()} conversation may need a follow-up.`
      : "No immediate follow-up action detected.",
    suggestedLabel: days === 1 ? "Tomorrow morning" : days === 2 ? "In 2 days" : "In 3 days",
    suggestedDaysFromNow: needsFollowUp ? days : 3,
  };
}

async function detectFollowUpNeed(args: {
  subject: string;
  thread: string;
  intent?: string;
}): Promise<FollowUpDetection> {
  const intent = args.intent ?? "FYI";
  const fallback = heuristicFollowUp(args.subject, args.thread, intent);
  if (!NVIDIA_API_KEY) return fallback;
  try {
    const result = await callNvidiaChatCompletions({
      apiKey: NVIDIA_API_KEY,
      messages: [
        {
          role: "system",
          content: `You are an email follow-up detector. Analyze this email thread and return ONLY valid JSON with these keys:
- needsFollowUp (boolean): true if the user should follow up (e.g., they sent info/proposal/pricing but got no reply, or a lead/payment needs chasing)
- reason (string): specific reason why follow-up is needed (max 20 words, direct)
- suggestedLabel (string): human-readable suggested time like "Monday 10 AM" or "In 2 days"
- suggestedDaysFromNow (number): how many business days from now (1-7)
Be strict: only set needsFollowUp=true if there is a clear unresolved action.`,
        },
        {
          role: "user",
          content: `Subject: ${args.subject}\nDetected intent: ${intent}\n\nThread:\n${args.thread.slice(0, 5000)}`,
        },
      ],
      max_tokens: 180,
      temperature: 0.2,
    });
    const parsed = parseFollowUpJson(result);
    return parsed ?? fallback;
  } catch {
    return fallback;
  }
}

// POST /inbox/followup/detect
inboxRouter.post("/followup/detect", express.json(), async (req, res) => {
  const uid = (req as any).user?.uid;
  if (!uid) return res.status(401).json({ error: "Unauthorized" });
  const { subject, thread, intent } = req.body ?? {};
  if (!subject || !thread) return res.status(400).json({ error: "subject and thread are required" });
  try {
    const detection = await detectFollowUpNeed({
      subject: String(subject),
      thread: String(thread),
      intent: intent ? String(intent) : undefined,
    });
    return res.json({ detection });
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
});

// GET /inbox/followups  — list all follow-ups for the user
inboxRouter.get("/followups", async (req, res) => {
  const uid = (req as any).user?.uid;
  if (!uid) return res.status(401).json({ error: "Unauthorized" });
  const status = req.query.status as string | undefined;
  await connectMongo();
  const query: any = { uid };
  if (status) query.status = status;
  const items = await FollowUp.find(query).sort({ scheduledAt: 1 }).lean();
  return res.json({ followUps: items });
});

// POST /inbox/followups  — create a follow-up reminder
inboxRouter.post("/followups", express.json(), async (req, res) => {
  const uid = (req as any).user?.uid;
  if (!uid) return res.status(401).json({ error: "Unauthorized" });
  const { messageId, threadId, subject, from, scheduledAt, reason } = req.body ?? {};
  if (!messageId || !threadId || !subject || !scheduledAt || !reason) {
    return res.status(400).json({ error: "messageId, threadId, subject, scheduledAt, and reason are required" });
  }
  await connectMongo();
  const existing = await FollowUp.findOne({ uid, messageId, status: "pending" });
  if (existing) {
    existing.scheduledAt = Number(scheduledAt);
    existing.reason = String(reason);
    await existing.save();
    return res.json({ followUp: existing.toObject() });
  }
  const followUp = await FollowUp.create({
    uid,
    messageId: String(messageId),
    threadId: String(threadId),
    subject: String(subject),
    from: String(from ?? ""),
    scheduledAt: Number(scheduledAt),
    reason: String(reason),
    status: "pending",
  });
  return res.status(201).json({ followUp: followUp.toObject() });
});

// PATCH /inbox/followups/:id  — update status or reschedule
inboxRouter.patch("/followups/:id", express.json(), async (req, res) => {
  const uid = (req as any).user?.uid;
  if (!uid) return res.status(401).json({ error: "Unauthorized" });
  const { id } = req.params;
  const { status, scheduledAt } = req.body ?? {};
  await connectMongo();
  const item = await FollowUp.findOne({ _id: id, uid });
  if (!item) return res.status(404).json({ error: "Follow-up not found" });
  if (status && ["pending", "completed", "dismissed"].includes(status)) item.status = status;
  if (scheduledAt) item.scheduledAt = Number(scheduledAt);
  await item.save();
  return res.json({ followUp: item.toObject() });
});

// DELETE /inbox/followups/:id
inboxRouter.delete("/followups/:id", async (req, res) => {
  const uid = (req as any).user?.uid;
  if (!uid) return res.status(401).json({ error: "Unauthorized" });
  const { id } = req.params;
  await connectMongo();
  await FollowUp.deleteOne({ _id: id, uid });
  return res.json({ success: true });
});
