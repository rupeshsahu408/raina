import express from "express";
import multer from "multer";
import { google } from "googleapis";
import { connectMongo } from "./db";
import { InboxToken } from "./models/InboxToken";
import { FollowUp } from "./models/FollowUp";
import { WaitingReply } from "./models/WaitingReply";
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
type LeadScore = "Hot" | "Warm" | "Cold";
type BuyingIntent = "High" | "Medium" | "Low";

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

interface LeadIntelligence {
  isLead: boolean;
  leadScore: LeadScore;
  buyingIntent: BuyingIntent;
  opportunitySummary: string;
  suggestedAction: string;
  replyStrategy: string;
  replyDraft: string;
  confidence: number;
  reason: string;
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

function senderDisplayName(from: string): string {
  const match = from.match(/^(.*?)\s*<(.+?)>$/);
  const name = (match ? match[1] : from).trim().replace(/^["']|["']$/g, "");
  if (name.includes("@") && !match) return name.split("@")[0] || name;
  return name || "there";
}

function senderEmailAddress(from: string): string {
  const match = from.match(/<(.+?)>/);
  return (match ? match[1] : from).trim().replace(/^["']|["']$/g, "");
}

function sanitizeLeadScore(value: unknown): LeadScore {
  return value === "Hot" || value === "Warm" || value === "Cold" ? value : "Cold";
}

function sanitizeBuyingIntent(value: unknown): BuyingIntent {
  return value === "High" || value === "Medium" || value === "Low" ? value : "Low";
}

function heuristicLeadIntelligence(args: {
  subject: string;
  snippet: string;
  thread?: string;
  from: string;
  intent?: IntentLabel;
  priorityScore?: number;
}): LeadIntelligence {
  const text = `${args.subject} ${args.snippet} ${args.thread ?? ""}`.toLowerCase();
  const highSignals = /(ready to buy|buy now|purchase|sign up|subscribe|pricing|price|quote|proposal|demo|book a call|schedule a call|how much|cost|budget|contract|invoice|interested in|move forward|start today)/i;
  const mediumSignals = /(interested|learn more|details|plan|package|service|availability|consultation|call|meeting|trial|options|tell me more|send info)/i;
  const coldSignals = /(newsletter|unsubscribe|promotion|discount|sale|webinar|update|fyi|press release)/i;
  const high = highSignals.test(text);
  const medium = mediumSignals.test(text);
  const low = coldSignals.test(text);
  const isLead = args.intent === "Lead" || high || medium || (args.priorityScore ?? 0) >= 80;
  const buyingIntent: BuyingIntent = high ? "High" : medium ? "Medium" : "Low";
  const leadScore: LeadScore = high ? "Hot" : medium || (args.priorityScore ?? 0) >= 70 ? "Warm" : "Cold";
  const person = senderDisplayName(args.from);
  const summary = compactText(args.snippet || args.thread || args.subject, 150) || `${person} may be exploring your offer.`;
  const suggestedAction =
    leadScore === "Hot"
      ? "Reply immediately and offer a clear next step, ideally a call or purchase path."
      : leadScore === "Warm"
      ? "Send useful details, answer the main question, and ask one qualifying question."
      : "Nurture lightly for now and avoid pushing for a close too early.";
  const replyStrategy =
    leadScore === "Hot"
      ? "Be fast, specific, and conversion-focused. Confirm their need, remove friction, and propose a concrete call time or next step."
      : leadScore === "Warm"
      ? "Be helpful and consultative. Share the most relevant information and invite them to continue the conversation."
      : "Keep the tone educational. Build trust, share value, and leave the door open.";
  const replyDraft =
    leadScore === "Hot"
      ? `Hi ${person},\n\nThanks for reaching out. Based on what you mentioned, this looks like something we can help with. I can share the right details and also walk you through the best next step.\n\nWould you like to schedule a quick call today or tomorrow so we can move this forward?`
      : leadScore === "Warm"
      ? `Hi ${person},\n\nThanks for your message. I’d be happy to share more details and help you understand the best option for your needs.\n\nCould you tell me a little more about what you’re trying to achieve so I can point you in the right direction?`
      : `Hi ${person},\n\nThanks for reaching out. I’m happy to share more context and answer any questions whenever you’re ready.\n\nHere’s the best place to start: let me know what you’re exploring, and I’ll guide you from there.`;
  return {
    isLead: isLead && !low,
    leadScore,
    buyingIntent,
    opportunitySummary: summary,
    suggestedAction,
    replyStrategy,
    replyDraft,
    confidence: high ? 92 : medium ? 74 : isLead ? 58 : 24,
    reason: high ? "Strong purchase, pricing, demo, or proposal language detected." : medium ? "Discovery or product-interest language detected." : isLead ? "Business opportunity signal detected." : "No clear revenue opportunity detected.",
    source: "rules",
  };
}

function parseLeadJson(raw: string): Omit<LeadIntelligence, "source"> | null {
  try {
    const match = raw.match(/\{[\s\S]*\}/);
    if (!match) return null;
    const parsed = JSON.parse(match[0]);
    if (typeof parsed.isLead !== "boolean") return null;
    const required = ["opportunitySummary", "suggestedAction", "replyStrategy", "replyDraft", "reason"];
    if (!required.every(key => typeof parsed[key] === "string" && parsed[key].trim())) return null;
    return {
      isLead: parsed.isLead,
      leadScore: sanitizeLeadScore(parsed.leadScore),
      buyingIntent: sanitizeBuyingIntent(parsed.buyingIntent),
      opportunitySummary: String(parsed.opportunitySummary).trim(),
      suggestedAction: String(parsed.suggestedAction).trim(),
      replyStrategy: String(parsed.replyStrategy).trim(),
      replyDraft: String(parsed.replyDraft).trim(),
      confidence: Math.max(0, Math.min(100, Number(parsed.confidence ?? 60))),
      reason: String(parsed.reason).trim(),
    };
  } catch {
    return null;
  }
}

async function generateLeadIntelligence(args: {
  subject: string;
  snippet: string;
  thread: string;
  from: string;
  intent?: IntentLabel;
  priorityScore?: number;
}): Promise<LeadIntelligence> {
  const fallback = heuristicLeadIntelligence(args);
  if (!fallback.isLead || !NVIDIA_API_KEY) return fallback;
  try {
    const result = await callNvidiaChatCompletions({
      apiKey: NVIDIA_API_KEY,
      messages: [
        {
          role: "system",
          content: "You are Plyndrox Lead Intelligence, an AI sales inbox analyst. Analyze an email thread and return ONLY valid JSON with keys: isLead boolean, leadScore Hot|Warm|Cold, buyingIntent High|Medium|Low, opportunitySummary string max 2 lines, suggestedAction string, replyStrategy string, replyDraft string, confidence number 0-100, reason string. Mark isLead true only when the sender shows possible revenue opportunity, sales interest, pricing interest, partnership potential, demo interest, service inquiry, or buying/discovery intent. The replyDraft must be ready to send, professional, concise, and must not include a subject line.",
        },
        {
          role: "user",
          content: `From: ${args.from}\nSubject: ${args.subject}\nDetected intent: ${args.intent ?? "Unknown"}\nSnippet: ${args.snippet}\n\nThread:\n${args.thread.slice(0, 6000)}`,
        },
      ],
      max_tokens: 650,
      temperature: 0.25,
    });
    const parsed = parseLeadJson(result);
    return parsed ? { ...parsed, source: "ai" } : fallback;
  } catch {
    return fallback;
  }
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
  inbox:      { labelIds: ["INBOX"] },
  primary:    { labelIds: ["INBOX"], q: "-category:promotions -category:social -category:updates -category:forums" },
  updates:    { labelIds: ["INBOX", "CATEGORY_UPDATES"] },
  promotions: { labelIds: ["INBOX", "CATEGORY_PROMOTIONS"] },
  social:     { labelIds: ["INBOX", "CATEGORY_SOCIAL"] },
  sent:       { labelIds: ["SENT"] },
  spam:       { labelIds: ["SPAM"] },
  trash:      { labelIds: ["TRASH"] },
  drafts:     { labelIds: ["DRAFT"] },
  starred:    { labelIds: ["STARRED"] },
  archive:    { q: "-in:inbox -in:spam -in:trash -in:sent -in:draft" },
  all:        { q: "-in:spam -in:trash" },
};

function detectGmailCategory(labelIds: string[]): "primary" | "promotions" | "social" | "updates" | "forums" {
  if (labelIds.includes("CATEGORY_PROMOTIONS")) return "promotions";
  if (labelIds.includes("CATEGORY_SOCIAL")) return "social";
  if (labelIds.includes("CATEGORY_UPDATES")) return "updates";
  if (labelIds.includes("CATEGORY_FORUMS")) return "forums";
  return "primary";
}

// GET /inbox/messages?maxResults=20&pageToken=xxx&folder=inbox
inboxRouter.get("/messages", async (req, res) => {
  const uid = (req as any).user?.uid;
  if (!uid) return res.status(401).json({ error: "Unauthorized" });
  const maxResults = Math.min(Number(req.query.maxResults ?? 50), 100);
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
          const gmailCategory = detectGmailCategory(labelIds);
          const aiRescued = (gmailCategory === "promotions" || gmailCategory === "social") && priority.priorityScore >= 70;
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
            gmailCategory,
            aiRescued,
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

async function handleLeadIntelligence(req: express.Request, res: express.Response) {
  const uid = (req as any).user?.uid;
  if (!uid) return res.status(401).json({ error: "Unauthorized" });
  const maxResults = Math.min(Number(req.query.maxResults ?? 40), 80);
  const scoreFilter = String(req.query.score ?? "all").toLowerCase();
  try {
    const auth = await getAuthenticatedClient(uid);
    const gmail = google.gmail({ version: "v1", auth });
    const listRes = await gmail.users.messages.list({
      userId: "me",
      maxResults,
      q: "-in:spam -in:trash newer_than:180d",
    });
    const messageIds = listRes.data.messages ?? [];
    const seenThreads = new Set<string>();
    const metadata = await Promise.all(
      messageIds.map(async (m) => {
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
          if (seenThreads.has(threadId)) return null;
          seenThreads.add(threadId);
          const intent = detectIntent(subject, snippet);
          const priority = inferPriority(subject, snippet, intent, labelIds.includes("UNREAD"));
          const initial = heuristicLeadIntelligence({
            subject,
            snippet,
            from,
            intent,
            priorityScore: priority.priorityScore,
          });
          return {
            id: m.id!,
            threadId,
            subject,
            from,
            date,
            snippet,
            intent,
            priority,
            initial,
            isUnread: labelIds.includes("UNREAD"),
          };
        } catch {
          return null;
        }
      })
    );

    const candidates = metadata
      .filter((item): item is NonNullable<typeof item> => Boolean(item?.initial.isLead))
      .sort((a, b) => (b.initial.confidence || 0) - (a.initial.confidence || 0))
      .slice(0, 20);

    const enriched = await Promise.all(
      candidates.map(async (candidate, index) => {
        let intelligence = candidate.initial;
        if (index < 8) {
          try {
            const threadRes = await gmail.users.threads.get({ userId: "me", id: candidate.threadId, format: "full" });
            const threadParts = await Promise.all((threadRes.data.messages ?? []).map(async (msg) => {
              const headers = msg.payload?.headers ?? [];
              const from = extractHeader(headers, "From");
              const date = extractHeader(headers, "Date");
              const content = await extractMessageContent(msg.payload, gmail, msg.id!);
              return `From: ${from}\nDate: ${date}\n${content.text || msg.snippet || ""}`;
            }));
            intelligence = await generateLeadIntelligence({
              subject: candidate.subject,
              snippet: candidate.snippet,
              thread: threadParts.join("\n\n---\n\n"),
              from: candidate.from,
              intent: candidate.intent,
              priorityScore: candidate.priority.priorityScore,
            });
          } catch {
            intelligence = candidate.initial;
          }
        }
        if (!intelligence.isLead) return null;
        return {
          id: candidate.id,
          threadId: candidate.threadId,
          subject: candidate.subject,
          from: candidate.from,
          name: senderDisplayName(candidate.from),
          email: senderEmailAddress(candidate.from),
          date: candidate.date,
          snippet: candidate.snippet,
          isUnread: candidate.isUnread,
          priorityScore: candidate.priority.priorityScore,
          leadScore: intelligence.leadScore,
          buyingIntent: intelligence.buyingIntent,
          opportunitySummary: intelligence.opportunitySummary,
          suggestedAction: intelligence.suggestedAction,
          replyStrategy: intelligence.replyStrategy,
          replyDraft: intelligence.replyDraft,
          confidence: intelligence.confidence,
          reason: intelligence.reason,
          source: intelligence.source,
        };
      })
    );

    const leadRank: Record<LeadScore, number> = { Hot: 0, Warm: 1, Cold: 2 };
    const leads = enriched
      .filter(Boolean)
      .filter((lead: any) => scoreFilter === "all" || String(lead.leadScore).toLowerCase() === scoreFilter)
      .sort((a: any, b: any) => leadRank[a.leadScore as LeadScore] - leadRank[b.leadScore as LeadScore] || (b.confidence ?? 0) - (a.confidence ?? 0));
    return res.json({
      leads,
      pipeline: {
        generatedAt: new Date().toISOString(),
        scanned: messageIds.length,
        candidates: candidates.length,
        analyzedWithAi: leads.filter((lead: any) => lead.source === "ai").length,
        counts: {
          total: leads.length,
          hot: leads.filter((lead: any) => lead.leadScore === "Hot").length,
          warm: leads.filter((lead: any) => lead.leadScore === "Warm").length,
          cold: leads.filter((lead: any) => lead.leadScore === "Cold").length,
          highIntent: leads.filter((lead: any) => lead.buyingIntent === "High").length,
        },
      },
    });
  } catch (err: any) {
    console.error("[inbox/leads]", err.message);
    return res.status(500).json({ error: err.message });
  }
}

inboxRouter.get("/leads", handleLeadIntelligence);
inboxRouter.get("/lead-intelligence", handleLeadIntelligence);

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

// POST /inbox/mark-read/:messageId  — remove UNREAD label (mark as read)
inboxRouter.post("/mark-read/:messageId", express.json(), async (req, res) => {
  const uid = (req as any).user?.uid;
  if (!uid) return res.status(401).json({ error: "Unauthorized" });
  const { messageId } = req.params;
  try {
    const auth = await getAuthenticatedClient(uid);
    const gmail = google.gmail({ version: "v1", auth });
    await gmail.users.messages.modify({
      userId: "me",
      id: messageId,
      requestBody: { removeLabelIds: ["UNREAD"] },
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

  const record = await InboxToken.findOne({ uid });
  if (record) {
    try {
      const oauth2 = makeOAuth2Client();
      oauth2.setCredentials({
        access_token: record.accessToken,
        refresh_token: record.refreshToken ?? undefined,
      });
      await oauth2.revokeCredentials();
    } catch {
      // Revocation best-effort — continue cleanup even if Google rejects
    }
    await InboxToken.deleteOne({ uid });
  }

  // Wipe all user data tied to the old Gmail account
  try { await FollowUp.deleteMany({ uid }); } catch {}
  try { await WaitingReply.deleteMany({ uid }); } catch {}

  return res.json({ success: true });
});

// ─── Follow-Up System ────────────────────────────────────────────────────────

type FollowUpIntent = "Sales" | "Support" | "General";
type FollowUpConfidence = "low" | "medium" | "high";
type FollowUpTag = "Urgent" | "Sales" | "Waiting" | "General";

interface FollowUpDetection {
  needsFollowUp: boolean;
  reason: string;
  suggestedLabel: string;
  suggestedDaysFromNow: number;
  intent: FollowUpIntent;
  confidence: FollowUpConfidence;
  tag: FollowUpTag;
}

function parseFollowUpJson(raw: string): FollowUpDetection | null {
  try {
    const match = raw.match(/\{[\s\S]*\}/);
    if (!match) return null;
    const parsed = JSON.parse(match[0]);
    if (typeof parsed.needsFollowUp !== "boolean") return null;
    if (typeof parsed.reason !== "string") return null;
    if (typeof parsed.suggestedDaysFromNow !== "number") return null;
    const validIntents: FollowUpIntent[] = ["Sales", "Support", "General"];
    const validConf: FollowUpConfidence[] = ["low", "medium", "high"];
    const validTags: FollowUpTag[] = ["Urgent", "Sales", "Waiting", "General"];
    return {
      needsFollowUp: parsed.needsFollowUp,
      reason: String(parsed.reason).trim(),
      suggestedLabel: String(parsed.suggestedLabel ?? "").trim(),
      suggestedDaysFromNow: Math.max(0, Math.min(30, Number(parsed.suggestedDaysFromNow))),
      intent: validIntents.includes(parsed.intent) ? parsed.intent : "General",
      confidence: validConf.includes(parsed.confidence) ? parsed.confidence : "medium",
      tag: validTags.includes(parsed.tag) ? parsed.tag : "General",
    };
  } catch {
    return null;
  }
}

function heuristicFollowUp(subject: string, thread: string, emailIntent: string): FollowUpDetection {
  const text = `${subject} ${thread.slice(0, 1000)}`.toLowerCase();
  const isSent = /i sent|we sent|as discussed|following up|attached|please find|proposal|quote|pricing|invoice sent/i.test(text);
  const isNoReply = !/thank you|thanks for|reply|respond|i will|we will|got it|received|noted/i.test(thread.slice(-1200));
  const needsFollowUp = isSent || (emailIntent === "Lead" && isNoReply) || (emailIntent === "Payment" && isNoReply);
  const days = emailIntent === "Urgent" ? 1 : emailIntent === "Lead" || emailIntent === "Payment" ? 2 : 3;
  const intent: FollowUpIntent = emailIntent === "Lead" || emailIntent === "Payment" ? "Sales" : emailIntent === "Support" ? "Support" : "General";
  const tag: FollowUpTag = days === 1 ? "Urgent" : intent === "Sales" ? "Sales" : "Waiting";
  return {
    needsFollowUp,
    reason: needsFollowUp
      ? isSent
        ? "You sent information but haven't received a reply yet."
        : `This ${emailIntent.toLowerCase()} conversation may need a follow-up.`
      : "No immediate follow-up action detected.",
    suggestedLabel: days === 1 ? "Tomorrow morning" : days === 2 ? "In 2 days" : "In 3 days",
    suggestedDaysFromNow: needsFollowUp ? days : 3,
    intent,
    confidence: needsFollowUp ? "medium" : "low",
    tag: needsFollowUp ? tag : "General",
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
          content: `You are an expert email follow-up detector. Analyze this email thread and return ONLY valid JSON with exactly these keys:
- needsFollowUp (boolean): true if the sender should follow up (proposal sent, no reply, lead/payment pending, action requested but unacknowledged)
- reason (string): specific, direct reason why follow-up is needed (max 20 words)
- suggestedLabel (string): human-readable time like "Tomorrow morning", "In 2 days", "Monday 10 AM"
- suggestedDaysFromNow (number): business days from now (1–7)
- intent ("Sales"|"Support"|"General"): classify the conversation type
- confidence ("low"|"medium"|"high"): how confident you are a follow-up is actually needed
- tag ("Urgent"|"Sales"|"Waiting"|"General"): single most relevant tag
Be strict: only needsFollowUp=true if there is a clear unresolved action needing a response.`,
        },
        {
          role: "user",
          content: `Subject: ${args.subject}\nDetected intent: ${intent}\n\nThread:\n${args.thread.slice(0, 5000)}`,
        },
      ],
      max_tokens: 220,
      temperature: 0.2,
    });
    const parsed = parseFollowUpJson(result);
    return parsed ?? fallback;
  } catch {
    return fallback;
  }
}

async function generateFollowUpDraft(args: {
  subject: string;
  thread: string;
  from: string;
  intent: FollowUpIntent;
}): Promise<{ subject: string; body: string }> {
  const senderName = args.from.match(/^(.*?)\s*</)?.[1]?.trim() || args.from;
  const toneGuide =
    args.intent === "Sales"
      ? "polite, confident, and persuasive — remind them of the value and create a soft sense of urgency"
      : args.intent === "Support"
      ? "empathetic, understanding, and helpful — show you care about their issue being resolved"
      : "neutral, professional, and concise — keep it brief and direct";

  const fallback = {
    subject: `Re: ${args.subject}`,
    body: `Hi ${senderName},\n\nI wanted to follow up on my previous email regarding "${args.subject}". I haven't heard back and wanted to check if you had any questions or if there's anything I can help with.\n\nLooking forward to your response.\n\nBest regards`,
  };

  if (!NVIDIA_API_KEY) return fallback;

  try {
    const result = await callNvidiaChatCompletions({
      apiKey: NVIDIA_API_KEY,
      messages: [
        {
          role: "system",
          content: `You are a professional email writer. Write a follow-up email that is ${toneGuide}. Return ONLY valid JSON with keys "subject" (string) and "body" (string). The body should be 3–5 sentences maximum, friendly, and end without a sign-off (the user will add their name). Do not include any greeting in the subject.`,
        },
        {
          role: "user",
          content: `Original subject: "${args.subject}"\nContact: ${args.from}\nIntent: ${args.intent}\n\nOriginal thread (for context):\n${args.thread.slice(0, 3000)}\n\nWrite a follow-up email.`,
        },
      ],
      max_tokens: 350,
      temperature: 0.5,
    });
    const match = result.match(/\{[\s\S]*\}/);
    if (match) {
      const parsed = JSON.parse(match[0]);
      if (typeof parsed.subject === "string" && typeof parsed.body === "string") {
        return { subject: parsed.subject.trim(), body: parsed.body.trim() };
      }
    }
    return fallback;
  } catch {
    return fallback;
  }
}

// POST /inbox/followup/detect
inboxRouter.post("/followup/detect", express.json(), async (req, res) => {
  const uid = (req as any).user?.uid;
  if (!uid) return res.status(401).json({ error: "Unauthorized" });
  const { subject, thread, intent, threadId } = req.body ?? {};
  if (!subject || !thread) return res.status(400).json({ error: "subject and thread are required" });
  try {
    await connectMongo();
    if (threadId) {
      const dismissed = await FollowUp.findOne({ uid, threadId, status: "dismissed" });
      if (dismissed) {
        return res.json({
          detection: {
            needsFollowUp: false,
            reason: "You previously dismissed a follow-up for this thread.",
            suggestedLabel: "",
            suggestedDaysFromNow: 0,
            intent: dismissed.intent ?? "General",
            confidence: "low" as const,
            tag: "General" as const,
            alreadyDismissed: true,
          },
        });
      }
    }
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
  const { messageId, threadId, subject, from, scheduledAt, reason, intent, confidence, tag } = req.body ?? {};
  if (!messageId || !threadId || !subject || !scheduledAt || !reason) {
    return res.status(400).json({ error: "messageId, threadId, subject, scheduledAt, and reason are required" });
  }
  await connectMongo();
  // Don't re-create if this thread was dismissed
  const dismissed = await FollowUp.findOne({ uid, threadId, status: "dismissed" });
  if (dismissed) return res.status(409).json({ error: "Follow-up was previously dismissed for this thread." });

  const existing = await FollowUp.findOne({ uid, threadId, status: "pending" });
  if (existing) {
    existing.scheduledAt = Number(scheduledAt);
    existing.reason = String(reason);
    if (intent) existing.intent = intent;
    if (confidence) existing.confidence = confidence;
    if (tag) existing.tag = tag;
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
    intent: ["Sales", "Support", "General"].includes(intent) ? intent : "General",
    confidence: ["low", "medium", "high"].includes(confidence) ? confidence : "medium",
    tag: ["Urgent", "Sales", "Waiting", "General"].includes(tag) ? tag : "General",
    status: "pending",
  });
  return res.status(201).json({ followUp: followUp.toObject() });
});

// POST /inbox/followup/auto-complete — auto-complete follow-up when reply received
inboxRouter.post("/followup/auto-complete", express.json(), async (req, res) => {
  const uid = (req as any).user?.uid;
  if (!uid) return res.status(401).json({ error: "Unauthorized" });
  const { threadId } = req.body ?? {};
  if (!threadId) return res.status(400).json({ error: "threadId is required" });
  await connectMongo();
  const item = await FollowUp.findOne({ uid, threadId, status: "pending" });
  if (!item) return res.json({ completed: false });
  item.status = "completed";
  await item.save();
  return res.json({ completed: true, followUp: item.toObject() });
});

// POST /inbox/followup/generate-draft — generate AI follow-up draft
inboxRouter.post("/followup/generate-draft", express.json(), async (req, res) => {
  const uid = (req as any).user?.uid;
  if (!uid) return res.status(401).json({ error: "Unauthorized" });
  const { subject, thread, from, intent } = req.body ?? {};
  if (!subject) return res.status(400).json({ error: "subject is required" });
  try {
    const validIntents: FollowUpIntent[] = ["Sales", "Support", "General"];
    const resolvedIntent: FollowUpIntent = validIntents.includes(intent) ? intent : "General";
    const draft = await generateFollowUpDraft({
      subject: String(subject),
      thread: String(thread ?? ""),
      from: String(from ?? ""),
      intent: resolvedIntent,
    });
    return res.json({ draft });
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
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

// POST /inbox/mission-brief
function buildFallbackBrief(emails: Array<{ priorityCategory: string }>): string {
  const urgent = emails.filter(e => ["Urgent", "Risk Detected"].includes(e.priorityCategory)).length;
  const leads = emails.filter(e => e.priorityCategory === "High-Value Lead").length;
  const payments = emails.filter(e => e.priorityCategory === "Payment").length;
  const needsReply = emails.filter(e => e.priorityCategory === "Needs Reply").length;
  const support = emails.filter(e => e.priorityCategory === "Support Issue").length;
  const parts: string[] = [];
  if (urgent) parts.push(`${urgent} urgent item${urgent > 1 ? "s" : ""} need your immediate attention`);
  if (leads) parts.push(`${leads} high-value lead${leads > 1 ? "s" : ""} waiting for a response`);
  if (payments) parts.push(`${payments} payment email${payments > 1 ? "s" : ""} to review`);
  if (support) parts.push(`${support} support issue${support > 1 ? "s" : ""} that may need escalation`);
  if (needsReply) parts.push(`${needsReply} conversation${needsReply > 1 ? "s" : ""} expecting a reply`);
  if (!parts.length) return "Your inbox looks clean today. Review any pending emails and archive what you can to stay at inbox zero.";
  return `You have ${parts.join(", ")}. Start with the highest-priority items to maximise your impact today.`;
}

inboxRouter.post("/mission-brief", express.json(), async (req, res) => {
  const uid = (req as any).user?.uid;
  if (!uid) return res.status(401).json({ error: "Unauthorized" });
  const { emails } = req.body as {
    emails?: Array<{ subject: string; from: string; priorityCategory: string; snippet: string }>;
  };
  if (!emails?.length) return res.json({ brief: "No emails found. Refresh your inbox and try again." });
  const fallback = buildFallbackBrief(emails);
  if (!NVIDIA_API_KEY) return res.json({ brief: fallback });
  try {
    const summary = emails.slice(0, 15).map(e => {
      const sender = e.from.split("<")[0].trim() || e.from;
      return `• [${e.priorityCategory}] ${sender}: "${e.subject}"`;
    }).join("\n");
    const result = await callNvidiaChatCompletions({
      apiKey: NVIDIA_API_KEY,
      messages: [
        {
          role: "system",
          content: "You are Plyndrox, a smart executive email assistant. Given the user's inbox highlights, write a concise 2-3 sentence daily mission briefing. Be direct, specific, and action-oriented. Sound like a sharp chief of staff briefing their executive. Do not use bullet points — write in flowing prose. Do not start with 'I' or repeat 'you have'.",
        },
        {
          role: "user",
          content: `Today's inbox highlights:\n${summary}\n\nWrite a 2-3 sentence mission briefing covering what matters most and what to do first.`,
        },
      ],
      max_tokens: 160,
      temperature: 0.45,
    });
    return res.json({ brief: result.trim().replace(/^["']|["']$/g, "") });
  } catch {
    return res.json({ brief: fallback });
  }
});

// ─── Waiting-for-Reply Tracker ────────────────────────────────────────────────

function waitingUrgency(sentAt: number): "normal" | "follow-up" | "high" {
  const days = (Date.now() - sentAt) / 86_400_000;
  if (days >= 7) return "high";
  if (days >= 3) return "follow-up";
  return "normal";
}

function daysWaiting(sentAt: number): number {
  return Math.floor((Date.now() - sentAt) / 86_400_000);
}

// GET /inbox/waiting-replies
inboxRouter.get("/waiting-replies", async (req, res) => {
  const uid = (req as any).user?.uid;
  if (!uid) return res.status(401).json({ error: "Unauthorized" });
  await connectMongo();
  const items = await WaitingReply.find({ uid, status: "active" })
    .sort({ sentAt: -1 })
    .limit(50)
    .lean();

  // Auto-resolve any items where Gmail thread has a reply — check up to 8 oldest items
  const toCheck = items.filter(i => (Date.now() - i.sentAt) > 3_600_000).slice(0, 8);
  if (toCheck.length > 0) {
    try {
      const auth = await getAuthenticatedClient(uid);
      const gmail = google.gmail({ version: "v1", auth });
      const userProfile = await gmail.users.getProfile({ userId: "me" });
      const userEmail = (userProfile.data.emailAddress ?? "").toLowerCase();
      await Promise.allSettled(
        toCheck.map(async item => {
          try {
            const thread = await gmail.users.threads.get({ userId: "me", id: item.threadId, format: "metadata", metadataHeaders: ["From"] });
            const msgs = thread.data.messages ?? [];
            if (msgs.length < 2) return;
            const latestMsg = msgs[msgs.length - 1];
            const fromHeader = latestMsg.payload?.headers?.find(h => h.name?.toLowerCase() === "from")?.value ?? "";
            const fromEmail = (fromHeader.match(/<(.+?)>/) ?? [, fromHeader])[1]?.toLowerCase() ?? "";
            if (fromEmail && fromEmail !== userEmail) {
              await WaitingReply.findByIdAndUpdate(item._id, { status: "resolved", resolvedAt: Date.now() });
            }
          } catch {}
        })
      );
    } catch {}
  }

  const active = await WaitingReply.find({ uid, status: "active" }).sort({ sentAt: -1 }).limit(50).lean();
  return res.json({
    items: active.map(i => ({
      _id: i._id,
      threadId: i.threadId,
      subject: i.subject,
      to: i.to,
      toName: i.toName,
      sentAt: i.sentAt,
      daysWaiting: daysWaiting(i.sentAt),
      urgency: waitingUrgency(i.sentAt),
    })),
  });
});

// POST /inbox/waiting-replies
inboxRouter.post("/waiting-replies", express.json(), async (req, res) => {
  const uid = (req as any).user?.uid;
  if (!uid) return res.status(401).json({ error: "Unauthorized" });
  const { threadId, subject, to, toName, sentAt } = req.body as {
    threadId?: string; subject?: string; to?: string; toName?: string; sentAt?: number;
  };
  if (!to || !subject) return res.status(400).json({ error: "Missing to or subject" });
  await connectMongo();
  const id = threadId || `compose-${uid}-${Date.now()}`;
  const item = await WaitingReply.findOneAndUpdate(
    { uid, threadId: id },
    { $setOnInsert: { uid, threadId: id, subject, to, toName: toName ?? "", sentAt: sentAt ?? Date.now(), status: "active" } },
    { upsert: true, new: true, setDefaultsOnInsert: true }
  );
  return res.json({ item });
});

// POST /inbox/waiting-replies/:id/resolve
inboxRouter.post("/waiting-replies/:id/resolve", async (req, res) => {
  const uid = (req as any).user?.uid;
  if (!uid) return res.status(401).json({ error: "Unauthorized" });
  await connectMongo();
  await WaitingReply.findOneAndUpdate({ _id: req.params.id, uid }, { status: "resolved", resolvedAt: Date.now() });
  return res.json({ success: true });
});

// DELETE /inbox/waiting-replies/:id
inboxRouter.delete("/waiting-replies/:id", async (req, res) => {
  const uid = (req as any).user?.uid;
  if (!uid) return res.status(401).json({ error: "Unauthorized" });
  await connectMongo();
  await WaitingReply.deleteOne({ _id: req.params.id, uid });
  return res.json({ success: true });
});

// GET /inbox/daily-briefing  — Daily AI Briefing (categories + focus message)
inboxRouter.get("/daily-briefing", async (req, res) => {
  const uid = (req as any).user?.uid;
  if (!uid) return res.status(401).json({ error: "Unauthorized" });

  type EmailPreview = { id: string; subject: string; from: string; snippet: string; isUnread: boolean };

  try {
    const auth = await getAuthenticatedClient(uid);
    const gmail = google.gmail({ version: "v1", auth });

    const listRes = await gmail.users.messages.list({
      userId: "me",
      labelIds: ["INBOX"],
      maxResults: 60,
    });

    const messages = listRes.data.messages ?? [];
    const allEmails: EmailPreview[] = [];

    for (const msg of messages.slice(0, 45)) {
      try {
        const detail = await gmail.users.messages.get({
          userId: "me",
          id: msg.id!,
          format: "metadata",
          metadataHeaders: ["Subject", "From", "Date"],
        });
        const headers = detail.data.payload?.headers ?? [];
        const labelIds = detail.data.labelIds ?? [];
        allEmails.push({
          id: msg.id!,
          subject: String(headers.find((h: any) => h.name === "Subject")?.value ?? "(no subject)").slice(0, 80),
          from: String(headers.find((h: any) => h.name === "From")?.value ?? "").replace(/<.*>/, "").trim(),
          snippet: String(detail.data.snippet ?? "").slice(0, 120),
          isUnread: labelIds.includes("UNREAD"),
        });
      } catch {}
    }

    const urgent: EmailPreview[] = [];
    const leads: EmailPreview[] = [];
    const payments: EmailPreview[] = [];
    const followups: EmailPreview[] = [];
    const ignore: EmailPreview[] = [];

    for (const email of allEmails) {
      const text = `${email.subject} ${email.snippet}`.toLowerCase();
      if (/refund|cancel(?:lation)?|angry|upset|legal|lawsuit|chargeback|breach|escalat|complaint|blocked|urgent|asap|immediately|today|deadline|final notice|overdue|last chance|time.?sensitive/i.test(text)) {
        urgent.push(email);
      } else if (/invoice|payment|due|amount|bill|pay now|balance|receipt/i.test(text)) {
        payments.push(email);
      } else if (/pricing|price|quote|proposal|interested|demo|trial|buy|purchase|book.?a.?call|want to connect|partnership|collaboration/i.test(text)) {
        leads.push(email);
      } else if (/following.?up|checking in|any update|did you (get|see|receive)|haven.?t heard|just wanted to|quick question|circling back|bumping/i.test(text)) {
        followups.push(email);
      } else if (/unsubscribe|newsletter|promotion|sale|% off|deal|offer|notification|alert|digest|weekly|monthly|no.?reply/i.test(text)) {
        ignore.push(email);
      } else if (email.isUnread) {
        followups.push(email);
      } else {
        ignore.push(email);
      }
    }

    const hour = new Date().getHours();
    const greeting = hour < 12 ? "Good Morning" : hour < 17 ? "Good Afternoon" : "Good Evening";

    let focusMessage = "";
    const buildFocus = () => {
      const parts: string[] = [];
      if (urgent.length) parts.push(`reply to ${urgent.length} urgent email${urgent.length > 1 ? "s" : ""}`);
      if (leads.length) parts.push(`close ${leads.length} lead${leads.length > 1 ? "s" : ""}`);
      if (payments.length) parts.push(`resolve ${payments.length} payment${payments.length > 1 ? "s" : ""}`);
      if (followups.length && parts.length < 2) parts.push(`follow up with ${followups.length} contact${followups.length > 1 ? "s" : ""}`);
      if (!parts.length) return "Your inbox is clean. Stay proactive and maintain inbox zero today.";
      return `Focus today: ${parts.slice(0, 2).join(", then ")}.`;
    };

    if (NVIDIA_API_KEY && allEmails.length > 0) {
      try {
        const summary = `Urgent: ${urgent.length}, Leads: ${leads.length}, Payments: ${payments.length}, Follow-ups: ${followups.length}, Ignore: ${ignore.length}. Total emails: ${allEmails.length}.`;
        const result = await callNvidiaChatCompletions({
          apiKey: NVIDIA_API_KEY,
          messages: [
            {
              role: "system",
              content: "You are Plyndrox AI, a sharp personal inbox assistant. Based on the inbox summary, write ONE short punchy action sentence (max 14 words) telling the user what to focus on first today. Be specific and direct. No filler words.",
            },
            { role: "user", content: summary },
          ],
          max_tokens: 55,
          temperature: 0.3,
        });
        focusMessage = result.trim().replace(/^["']|["']$/g, "").replace(/\.$/, "") + ".";
      } catch {
        focusMessage = buildFocus();
      }
    } else {
      focusMessage = buildFocus();
    }

    const preview = (arr: EmailPreview[]) =>
      arr.slice(0, 4).map(e => ({ id: e.id, subject: e.subject, from: e.from || "Unknown", snippet: e.snippet, isUnread: e.isUnread }));

    return res.json({
      date: new Date().toISOString().slice(0, 10),
      greeting,
      categories: {
        urgent:   { count: urgent.length,   preview: preview(urgent) },
        leads:    { count: leads.length,     preview: preview(leads) },
        payments: { count: payments.length,  preview: preview(payments) },
        followups:{ count: followups.length, preview: preview(followups) },
        ignore:   { count: ignore.length,    preview: preview(ignore) },
      },
      totalEmails: allEmails.length,
      focusMessage,
      generatedAt: new Date().toISOString(),
    });
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
});

// GET /inbox/health-score  — Inbox Health Score & Daily Briefing
inboxRouter.get("/health-score", async (req, res) => {
  const uid = (req as any).user?.uid;
  if (!uid) return res.status(401).json({ error: "Unauthorized" });

  try {
    await connectMongo();

    const followUps = await FollowUp.find({ uid, status: "pending" }).lean();
    const overdueFollowUps = followUps.filter((f: any) => f.scheduledAt < Date.now());

    const waitingRepliesAll = await WaitingReply.find({ uid, status: "active" }).lean();
    const overdueWaiting = waitingRepliesAll.filter((w: any) => {
      const daysWaiting = (Date.now() - (w.sentAt ?? 0)) / 86400000;
      return daysWaiting >= 2;
    });

    let urgentCount = 0;
    let paymentCount = 0;
    let leadCount = 0;
    let unreadTotal = 0;

    try {
      const auth = await getAuthenticatedClient(uid);
      const gmail = google.gmail({ version: "v1", auth });
      const response = await gmail.users.messages.list({
        userId: "me",
        labelIds: ["INBOX", "UNREAD"],
        maxResults: 40,
      });
      const messages = response.data.messages ?? [];
      for (const msg of messages.slice(0, 25)) {
        try {
          const detail = await gmail.users.messages.get({
            userId: "me",
            id: msg.id!,
            format: "metadata",
            metadataHeaders: ["Subject", "From"],
          });
          const headers = detail.data.payload?.headers ?? [];
          const subject = headers.find((h: any) => h.name === "Subject")?.value ?? "";
          const snippet = detail.data.snippet ?? "";
          const text = `${subject} ${snippet}`;
          if (/urgent|asap|immediately|today|deadline|final notice|overdue|last chance|time.sensitive/i.test(text)) urgentCount++;
          if (/invoice|payment|due|amount|bill|pay now|overdue/i.test(text)) paymentCount++;
          if (/pricing|quote|proposal|interested|demo|trial|buy|purchase|book a call/i.test(text)) leadCount++;
          unreadTotal++;
        } catch {}
      }
    } catch {}

    let score = 100;
    const issues: Array<{
      type: string;
      label: string;
      count: number;
      deduction: number;
      action: string;
      href: string;
      severity: "high" | "medium" | "low";
    }> = [];

    if (urgentCount > 0) {
      const deduction = Math.min(urgentCount * 8, 32);
      score -= deduction;
      issues.push({ type: "urgent", label: "Urgent emails need reply", count: urgentCount, deduction, action: "Reply now", href: "/inbox/dashboard", severity: "high" });
    }
    if (overdueFollowUps.length > 0) {
      const deduction = Math.min(overdueFollowUps.length * 6, 24);
      score -= deduction;
      issues.push({ type: "followup", label: "Follow-ups are overdue", count: overdueFollowUps.length, deduction, action: "View follow-ups", href: "/inbox/followups", severity: "high" });
    }
    if (overdueWaiting.length > 0) {
      const deduction = Math.min(overdueWaiting.length * 5, 20);
      score -= deduction;
      issues.push({ type: "waiting", label: "Waiting for reply (2+ days)", count: overdueWaiting.length, deduction, action: "Send reminder", href: "/inbox/dashboard", severity: "medium" });
    }
    if (paymentCount > 0) {
      const deduction = Math.min(paymentCount * 8, 16);
      score -= deduction;
      issues.push({ type: "payment", label: "Payment emails unresolved", count: paymentCount, deduction, action: "Review payments", href: "/inbox/dashboard", severity: "high" });
    }
    if (leadCount > 0) {
      const deduction = Math.min(leadCount * 3, 9);
      score -= deduction;
      issues.push({ type: "lead", label: "Sales leads awaiting response", count: leadCount, deduction, action: "View leads", href: "/inbox/leads", severity: "medium" });
    }
    const generalUnread = Math.max(0, unreadTotal - urgentCount - paymentCount - leadCount);
    if (generalUnread > 0) {
      const deduction = Math.min(generalUnread * 2, 10);
      score -= deduction;
      issues.push({ type: "unread", label: "Unread messages need attention", count: generalUnread, deduction, action: "Clear inbox", href: "/inbox/dashboard", severity: "low" });
    }

    score = Math.max(0, Math.round(score));

    const grade =
      score >= 90 ? "Excellent" :
      score >= 75 ? "Good" :
      score >= 60 ? "Fair" :
      score >= 40 ? "Needs Attention" : "Critical";

    const gradeColor =
      score >= 90 ? "emerald" :
      score >= 75 ? "blue" :
      score >= 60 ? "amber" : "red";

    const hour = new Date().getHours();
    const greeting = hour < 12 ? "Good Morning" : hour < 17 ? "Good Afternoon" : "Good Evening";

    const priorities: string[] = [];
    if (urgentCount > 0) priorities.push(`Reply to ${urgentCount} urgent email${urgentCount > 1 ? "s" : ""}`);
    if (overdueFollowUps.length > 0) priorities.push(`Follow up with ${overdueFollowUps.length} overdue contact${overdueFollowUps.length > 1 ? "s" : ""}`);
    if (paymentCount > 0) priorities.push(`Resolve ${paymentCount} payment email${paymentCount > 1 ? "s" : ""}`);
    if (overdueWaiting.length > 0 && priorities.length < 3) priorities.push(`Chase ${overdueWaiting.length} awaited repl${overdueWaiting.length > 1 ? "ies" : "y"}`);
    if (leadCount > 0 && priorities.length < 3) priorities.push(`Respond to ${leadCount} sales lead${leadCount > 1 ? "s" : ""}`);
    if (generalUnread > 0 && priorities.length < 3) priorities.push(`Clear ${generalUnread} unread message${generalUnread > 1 ? "s" : ""}`);

    return res.json({
      score,
      grade,
      gradeColor,
      issues,
      briefing: {
        greeting,
        priorities: priorities.slice(0, 3),
        message: issues.length === 0
          ? "Your inbox is in great shape today. Keep it up!"
          : "Complete these to bring your score to 100.",
      },
      metrics: {
        urgentCount,
        overdueFollowUps: overdueFollowUps.length,
        totalFollowUps: followUps.length,
        overdueWaiting: overdueWaiting.length,
        totalWaiting: waitingRepliesAll.length,
        paymentCount,
        leadCount,
        unreadCount: unreadTotal,
      },
      generatedAt: new Date().toISOString(),
    });
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
});

// GET /inbox/explore/overview — category counts for the Ideas explorer
inboxRouter.get("/explore/overview", async (req, res) => {
  const uid = (req as any).user?.uid;
  if (!uid) return res.status(401).json({ error: "Unauthorized" });
  try {
    const auth = await getAuthenticatedClient(uid);
    const gmail = google.gmail({ version: "v1", auth });

    async function countCategory(cfg: { labelIds?: string[]; q?: string }): Promise<number> {
      try {
        const r = await gmail.users.messages.list({
          userId: "me",
          maxResults: 1,
          ...(cfg.labelIds ? { labelIds: cfg.labelIds } : {}),
          ...(cfg.q ? { q: cfg.q } : {}),
        });
        return r.data.resultSizeEstimate ?? 0;
      } catch { return 0; }
    }

    async function countUnread(cfg: { labelIds?: string[]; q?: string }): Promise<number> {
      try {
        const baseQ = cfg.q ? `${cfg.q} is:unread` : "is:unread";
        const r = await gmail.users.messages.list({
          userId: "me",
          maxResults: 1,
          ...(cfg.labelIds ? { labelIds: [...(cfg.labelIds), "UNREAD"] } : {}),
          ...(cfg.q ? { q: baseQ } : (!cfg.labelIds ? { q: baseQ } : {})),
        });
        return r.data.resultSizeEstimate ?? 0;
      } catch { return 0; }
    }

    // Fetch all counts in parallel
    const [
      primaryCount, primaryUnread,
      updatesCount, updatesUnread,
      promotionsCount, promotionsUnread,
      socialCount, socialUnread,
      sentCount,
      draftsCount,
      archiveCount,
      spamCount,
      trashCount,
      starredCount,
      allCount,
    ] = await Promise.all([
      countCategory({ labelIds: ["INBOX"], q: "-category:promotions -category:social -category:updates -category:forums" }),
      countUnread({ labelIds: ["INBOX"], q: "-category:promotions -category:social -category:updates -category:forums" }),
      countCategory({ labelIds: ["INBOX", "CATEGORY_UPDATES"] }),
      countUnread({ labelIds: ["INBOX", "CATEGORY_UPDATES"] }),
      countCategory({ labelIds: ["INBOX", "CATEGORY_PROMOTIONS"] }),
      countUnread({ labelIds: ["INBOX", "CATEGORY_PROMOTIONS"] }),
      countCategory({ labelIds: ["INBOX", "CATEGORY_SOCIAL"] }),
      countUnread({ labelIds: ["INBOX", "CATEGORY_SOCIAL"] }),
      countCategory({ labelIds: ["SENT"] }),
      countCategory({ labelIds: ["DRAFT"] }),
      countCategory({ q: "-in:inbox -in:spam -in:trash -in:sent -in:draft" }),
      countCategory({ labelIds: ["SPAM"] }),
      countCategory({ labelIds: ["TRASH"] }),
      countCategory({ labelIds: ["STARRED"] }),
      countCategory({ q: "-in:spam -in:trash" }),
    ]);

    // Fetch a small batch to compute Hot/Warm/Cold lead classification
    let hotCount = 0; let warmCount = 0; let coldCount = 0;
    try {
      const leadRes = await gmail.users.messages.list({
        userId: "me", maxResults: 100,
        labelIds: ["INBOX"],
        q: "-category:promotions -category:social",
      });
      const leadIds = leadRes.data.messages ?? [];
      const leadMessages = (await Promise.all(
        leadIds.slice(0, 50).map(async (m) => {
          try {
            const msg = await gmail.users.messages.get({ userId: "me", id: m.id!, format: "metadata", metadataHeaders: ["From", "Subject", "Date"] });
            const headers = msg.data.payload?.headers ?? [];
            const subject = extractHeader(headers, "Subject") || "";
            const snippet = msg.data.snippet ?? "";
            const labelIds2 = msg.data.labelIds ?? [];
            const isUnread = labelIds2.includes("UNREAD");
            const intent = detectIntent(subject, snippet);
            const priority = inferPriority(subject, snippet, intent, isUnread);
            const dateStr = extractHeader(headers, "Date");
            const daysOld = dateStr ? Math.floor((Date.now() - new Date(dateStr).getTime()) / 86400000) : 99;
            return { intent, priorityCategory: priority.priorityCategory, isUnread, daysOld };
          } catch { return null; }
        })
      )).filter(Boolean) as any[];
      for (const m of leadMessages) {
        const isLead = m.intent === "Lead" || m.priorityCategory === "High-Value Lead";
        if (!isLead) continue;
        if (m.priorityCategory === "High-Value Lead" && m.daysOld <= 7) hotCount++;
        else if (m.daysOld <= 21) warmCount++;
        else coldCount++;
      }
    } catch {}

    // Waiting for reply count from follow-up tracking
    let waitingCount = 0;
    try {
      await connectMongo();
      waitingCount = await FollowUp.countDocuments({ uid, status: "pending" });
    } catch {}

    return res.json({
      total: allCount,
      categories: {
        primary:    { count: primaryCount,    unread: primaryUnread },
        updates:    { count: updatesCount,    unread: updatesUnread },
        promotions: { count: promotionsCount, unread: promotionsUnread },
        social:     { count: socialCount,     unread: socialUnread },
        sent:       { count: sentCount,       unread: 0 },
        drafts:     { count: draftsCount,     unread: 0 },
        archive:    { count: archiveCount,    unread: 0 },
        spam:       { count: spamCount,       unread: 0 },
        trash:      { count: trashCount,      unread: 0 },
        starred:    { count: starredCount,    unread: 0 },
        waiting:    { count: waitingCount,    unread: 0 },
        hot:        { count: hotCount,        unread: hotCount },
        warm:       { count: warmCount,       unread: 0 },
        cold:       { count: coldCount,       unread: 0 },
      },
    });
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
});

// GET /inbox/analyze — comprehensive Gmail analytics
inboxRouter.get("/analyze", async (req, res) => {
  const uid = (req as any).user?.uid;
  if (!uid) return res.status(401).json({ error: "Unauthorized" });

  const days = Math.min(Number(req.query.days ?? 30), 90);
  const maxMessages = 200;

  try {
    const auth = await getAuthenticatedClient(uid);
    const gmail = google.gmail({ version: "v1", auth });

    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - days);
    const afterTimestamp = Math.floor(cutoffDate.getTime() / 1000);

    const listRes = await gmail.users.messages.list({
      userId: "me",
      maxResults: maxMessages,
      q: `after:${afterTimestamp}`,
    });
    const messageIds = listRes.data.messages ?? [];

    const messages = (await Promise.all(
      messageIds.map(async (m) => {
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
          const labelIds = msg.data.labelIds ?? [];
          const isUnread = labelIds.includes("UNREAD");
          const isStarred = labelIds.includes("STARRED");
          const isSent = labelIds.includes("SENT");
          const intent = detectIntent(subject, snippet);
          const priority = inferPriority(subject, snippet, intent, isUnread);
          const gmailCategory = detectGmailCategory(labelIds);
          const aiRescued = (gmailCategory === "promotions" || gmailCategory === "social") && priority.priorityScore >= 70;
          const parsedDate = date ? new Date(date) : new Date();
          const emailAddress = senderEmailAddress(from);
          const domain = emailAddress.includes("@") ? emailAddress.split("@")[1].toLowerCase() : "unknown";
          return {
            id: m.id,
            subject,
            from,
            emailAddress,
            domain,
            date,
            parsedDate,
            snippet,
            intent,
            priorityCategory: priority.priorityCategory,
            priorityScore: priority.priorityScore,
            riskLevel: priority.riskLevel,
            isUnread,
            isStarred,
            isSent,
            gmailCategory,
            aiRescued,
          };
        } catch {
          return null;
        }
      })
    )).filter(Boolean) as any[];

    const received = messages.filter((m) => !m.isSent);
    const sent = messages.filter((m) => m.isSent);
    const totalEmails = received.length;
    const unreadCount = received.filter((m) => m.isUnread).length;
    const starredCount = messages.filter((m) => m.isStarred).length;
    const aiRescuedCount = received.filter((m) => m.aiRescued).length;
    const avgPriorityScore = totalEmails > 0 ? Math.round(received.reduce((s: number, m: any) => s + m.priorityScore, 0) / totalEmails) : 0;

    const intentCounts: Record<string, number> = { Lead: 0, Support: 0, Payment: 0, Meeting: 0, Spam: 0, FYI: 0 };
    for (const m of received) intentCounts[m.intent] = (intentCounts[m.intent] ?? 0) + 1;

    const priorityCounts: Record<string, number> = {};
    for (const m of received) priorityCounts[m.priorityCategory] = (priorityCounts[m.priorityCategory] ?? 0) + 1;

    const riskCounts = { High: 0, Medium: 0, Low: 0 };
    for (const m of received) riskCounts[m.riskLevel as keyof typeof riskCounts]++;

    const gmailCategoryCounts: Record<string, number> = {};
    for (const m of received) gmailCategoryCounts[m.gmailCategory] = (gmailCategoryCounts[m.gmailCategory] ?? 0) + 1;

    const senderMap: Record<string, { name: string; email: string; count: number; domain: string; intents: Record<string, number> }> = {};
    for (const m of received) {
      const key = m.emailAddress.toLowerCase();
      if (!senderMap[key]) senderMap[key] = { name: senderDisplayName(m.from), email: m.emailAddress, count: 0, domain: m.domain, intents: {} };
      senderMap[key].count++;
      senderMap[key].intents[m.intent] = (senderMap[key].intents[m.intent] ?? 0) + 1;
    }
    const topSenders = Object.values(senderMap).sort((a, b) => b.count - a.count).slice(0, 10);

    const domainMap: Record<string, number> = {};
    for (const m of received) domainMap[m.domain] = (domainMap[m.domain] ?? 0) + 1;
    const topDomains = Object.entries(domainMap).sort((a, b) => b[1] - a[1]).slice(0, 8).map(([domain, count]) => ({ domain, count }));

    const volumeByDay: Record<string, { received: number; sent: number }> = {};
    for (let i = 0; i < days; i++) {
      const d = new Date();
      d.setDate(d.getDate() - (days - 1 - i));
      const key = d.toISOString().slice(0, 10);
      volumeByDay[key] = { received: 0, sent: 0 };
    }
    for (const m of received) {
      const key = m.parsedDate.toISOString().slice(0, 10);
      if (volumeByDay[key]) volumeByDay[key].received++;
    }
    for (const m of sent) {
      const key = m.parsedDate.toISOString().slice(0, 10);
      if (volumeByDay[key]) volumeByDay[key].sent++;
    }
    const volumeTrend = Object.entries(volumeByDay).map(([date, counts]) => ({ date, ...counts }));

    const activityByHour = Array.from({ length: 24 }, (_, h) => ({ hour: h, count: 0 }));
    const activityByDow = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => ({ day, count: 0 }));
    for (const m of received) {
      const h = m.parsedDate.getHours();
      const d = m.parsedDate.getDay();
      activityByHour[h].count++;
      activityByDow[d].count++;
    }

    const peakHour = activityByHour.reduce((a: any, b: any) => (b.count > a.count ? b : a), { hour: 0, count: 0 });
    const peakDow = activityByDow.reduce((a: any, b: any) => (b.count > a.count ? b : a), { day: "Mon", count: 0 });
    const leadCount = intentCounts.Lead;
    const readRate = totalEmails > 0 ? Math.round(((totalEmails - unreadCount) / totalEmails) * 100) : 0;
    const avgPerDay = days > 0 ? Math.round((totalEmails / days) * 10) / 10 : 0;

    // Thread count (unique threadIds)
    const threadIdSet = new Set(received.map((m: any) => m.id));
    const threadCount = threadIdSet.size;

    // Previous period comparison
    const prevCutoff = new Date(cutoffDate);
    prevCutoff.setDate(prevCutoff.getDate() - days);
    const prevTimestamp = Math.floor(prevCutoff.getTime() / 1000);
    let prevPeriodCount = 0;
    try {
      const prevList = await gmail.users.messages.list({
        userId: "me",
        maxResults: 200,
        q: `after:${prevTimestamp} before:${afterTimestamp}`,
        labelIds: ["INBOX"],
      });
      prevPeriodCount = (prevList.data.messages ?? []).length;
    } catch { prevPeriodCount = 0; }
    const volumeChange = prevPeriodCount > 0 ? Math.round(((totalEmails - prevPeriodCount) / prevPeriodCount) * 100) : 0;

    // Subject keyword extraction
    const stopWords = new Set(["re","fwd","fw","the","a","an","is","in","it","of","to","and","for","on","with","your","you","we","our","i","this","that","from","be","have","has","at","by","as","are","was","will","can","do","or","if","my","me","us","hi","hey","hello","dear","thanks","thank"]);
    const wordFreq: Record<string, number> = {};
    for (const m of received) {
      const words = m.subject.toLowerCase().replace(/[^a-z0-9\s]/g, " ").split(/\s+/).filter((w: string) => w.length > 2 && !stopWords.has(w));
      for (const w of words) wordFreq[w] = (wordFreq[w] ?? 0) + 1;
    }
    const keywords = Object.entries(wordFreq).sort((a, b) => b[1] - a[1]).slice(0, 30).map(([word, count]) => ({ word, count }));

    // Sender relationship scoring
    const scoredSenders = topSenders.map((s: any) => {
      const intentValues: Record<string, number> = { Lead: 10, Payment: 9, Support: 7, Meeting: 6, FYI: 3, Spam: 0 };
      const topIntent = Object.entries(s.intents).sort((a: any, b: any) => b[1] - a[1])[0]?.[0] ?? "FYI";
      const intentScore = intentValues[topIntent] ?? 3;
      const freqScore = Math.min(s.count * 2, 20);
      const totalScore = Math.min(100, intentScore * 5 + freqScore + (s.count > 5 ? 10 : 0));
      const relationship = totalScore >= 70 ? "Hot" : totalScore >= 40 ? "Warm" : "Cold";
      return { ...s, relationshipScore: totalScore, relationship, topIntent };
    });

    // Unsubscribe candidates: high volume + low-priority intents
    const unsubscribeCandidates = Object.values(senderMap)
      .filter((s: any) => {
        const topIntent = Object.entries(s.intents).sort((a: any, b: any) => b[1] - a[1])[0]?.[0] ?? "FYI";
        return s.count >= 2 && (topIntent === "Spam" || topIntent === "FYI") && !["Lead","Payment","Support","Meeting"].some(i => (s.intents[i] ?? 0) > 0);
      })
      .sort((a: any, b: any) => b.count - a.count)
      .slice(0, 8)
      .map((s: any) => ({ name: senderDisplayName(s.name || s.email), email: s.email, count: s.count, domain: s.domain }));

    // Response rate: % of received threads that have a sent reply (approximate)
    const receivedThreadIds = new Set(received.map((m: any) => m.id));
    const sentThreadIds = new Set(sent.map((m: any) => m.id));
    const repliedCount = [...receivedThreadIds].filter((id) => sentThreadIds.has(id)).length;
    const responseRate = totalEmails > 0 ? Math.round((sent.length / Math.max(totalEmails, 1)) * 100) : 0;

    // Inbox score composite (0-100)
    let inboxScore = 50;
    inboxScore += Math.min(readRate * 0.2, 20);
    inboxScore -= Math.min(riskCounts.High * 3, 15);
    inboxScore += Math.min(aiRescuedCount * 2, 10);
    inboxScore += leadCount > 0 ? 5 : 0;
    inboxScore -= unreadCount > 50 ? 10 : unreadCount > 20 ? 5 : 0;
    inboxScore = Math.max(0, Math.min(100, Math.round(inboxScore)));

    // Reading time estimate (avg 250 wpm, ~15 words per snippet)
    const estimatedReadingMins = Math.ceil((totalEmails * 15) / 250);

    // Inbox zero days prediction
    const dailyCapacity = 10;
    const inboxZeroDays = unreadCount > 0 ? Math.ceil(unreadCount / dailyCapacity) : 0;

    // Weekly volume (for multi-week view)
    const weeklyVolume: Record<string, { received: number; sent: number }> = {};
    for (const m of received) {
      const d = new Date(m.parsedDate);
      const weekStart = new Date(d);
      weekStart.setDate(d.getDate() - d.getDay());
      const wk = weekStart.toISOString().slice(0, 10);
      if (!weeklyVolume[wk]) weeklyVolume[wk] = { received: 0, sent: 0 };
      weeklyVolume[wk].received++;
    }
    for (const m of sent) {
      const d = new Date(m.parsedDate);
      const weekStart = new Date(d);
      weekStart.setDate(d.getDate() - d.getDay());
      const wk = weekStart.toISOString().slice(0, 10);
      if (!weeklyVolume[wk]) weeklyVolume[wk] = { received: 0, sent: 0 };
      weeklyVolume[wk].sent++;
    }
    const weeklyTrend = Object.entries(weeklyVolume).sort((a, b) => a[0].localeCompare(b[0])).map(([week, c]) => ({ week, ...c }));

    // 7×24 heatmap grid
    const weeklyHeatmap = Array.from({ length: 7 }, (_, dow) =>
      Array.from({ length: 24 }, (_, hour) => ({ dow, hour, count: 0 }))
    );
    for (const m of received) {
      const dow = m.parsedDate.getDay();
      const hour = m.parsedDate.getHours();
      weeklyHeatmap[dow][hour].count++;
    }
    const flatHeatmap = weeklyHeatmap.flat();

    const insights: string[] = [];
    if (riskCounts.High > 0) insights.push(`⚡ You have ${riskCounts.High} high-risk email${riskCounts.High > 1 ? "s" : ""} that need immediate attention.`);
    if (leadCount > 0) insights.push(`🎯 ${leadCount} potential lead${leadCount > 1 ? "s" : ""} detected — reply quickly to maximize conversion.`);
    if (unreadCount > 20) insights.push(`📬 Your unread count is ${unreadCount}. At 10 emails/day you can reach Inbox Zero in ${inboxZeroDays} days.`);
    if (aiRescuedCount > 0) insights.push(`🤖 AI rescued ${aiRescuedCount} important email${aiRescuedCount > 1 ? "s" : ""} from promotions or social folders.`);
    if (peakHour.count > 0) insights.push(`🕐 Your busiest email hour is ${peakHour.hour}:00–${peakHour.hour + 1}:00. Block this time for focused replies.`);
    if (peakDow.count > 0) insights.push(`📅 ${peakDow.day} is your heaviest day — consider batch-processing email then.`);
    if (intentCounts.Support > 5) insights.push(`🛠️ ${intentCounts.Support} support emails detected. Templates or an FAQ could save hours each week.`);
    if (intentCounts.Payment > 0) insights.push(`💳 ${intentCounts.Payment} payment email${intentCounts.Payment > 1 ? "s" : ""} — verify none are overdue to avoid friction.`);
    if (readRate < 50) insights.push(`👀 Only ${readRate}% of your inbox is read. AI triage is helping surface what matters.`);
    if (topSenders.length > 0) insights.push(`📨 Top sender: ${topSenders[0].name || topSenders[0].email} (${topSenders[0].count} emails).`);
    if (unsubscribeCandidates.length > 0) insights.push(`🔇 ${unsubscribeCandidates.length} low-value sender${unsubscribeCandidates.length > 1 ? "s" : ""} are generating noise. Unsubscribing could cut inbox load significantly.`);
    if (volumeChange > 20) insights.push(`📈 Email volume is up ${volumeChange}% vs the previous ${days}-day period.`);
    if (volumeChange < -20) insights.push(`📉 Email volume is down ${Math.abs(volumeChange)}% vs the previous period — great progress.`);
    if (estimatedReadingMins > 60) insights.push(`⏱️ These ${totalEmails} emails represent ~${estimatedReadingMins} min of reading. Use summaries to save time.`);

    return res.json({
      period: { days, from: cutoffDate.toISOString(), to: new Date().toISOString() },
      summary: {
        totalEmails, sentCount: sent.length, unreadCount, starredCount, aiRescuedCount,
        avgPriorityScore, readRate, leadCount, avgPerDay, threadCount,
        prevPeriodCount, volumeChange, responseRate, inboxScore,
        estimatedReadingMins, inboxZeroDays,
      },
      intentBreakdown: intentCounts,
      priorityBreakdown: priorityCounts,
      riskBreakdown: riskCounts,
      gmailCategories: gmailCategoryCounts,
      volumeTrend,
      weeklyTrend,
      activityByHour,
      activityByDow,
      flatHeatmap,
      topSenders: scoredSenders,
      topDomains,
      keywords,
      unsubscribeCandidates,
      insights,
      generatedAt: new Date().toISOString(),
    });
  } catch (err: any) {
    console.error("[inbox/analyze]", err.message);
    return res.status(500).json({ error: err.message });
  }
});

// POST /inbox/waiting-replies/draft  — generate AI follow-up message
inboxRouter.post("/waiting-replies/draft", express.json(), async (req, res) => {
  const uid = (req as any).user?.uid;
  if (!uid) return res.status(401).json({ error: "Unauthorized" });
  const { to, toName, subject, daysWaiting: days } = req.body as {
    to?: string; toName?: string; subject?: string; daysWaiting?: number;
  };
  if (!to || !subject) return res.status(400).json({ error: "Missing to or subject" });
  const name = toName || to.split("@")[0];
  const fallback = `Hi ${name},\n\nI wanted to follow up on my previous message regarding "${subject}". I just wanted to make sure it didn't get lost — happy to provide any additional info if needed.\n\nLooking forward to hearing from you.\n\nBest regards`;
  if (!NVIDIA_API_KEY) return res.json({ draft: fallback });
  try {
    const result = await callNvidiaChatCompletions({
      apiKey: NVIDIA_API_KEY,
      messages: [
        {
          role: "system",
          content: "You are a professional email assistant. Write a short, polite, non-pushy follow-up email. Keep it to 3-4 sentences. Do not use placeholders like [Your Name] — just write the body ending with 'Best regards'. No subject line needed.",
        },
        {
          role: "user",
          content: `Write a follow-up email to ${name} (${to}) about the email subject "${subject}". They haven't replied in ${days ?? 3} day(s). Be warm and professional, not desperate.`,
        },
      ],
      max_tokens: 180,
      temperature: 0.4,
    });
    return res.json({ draft: result.trim().replace(/^["']|["']$/g, "") });
  } catch {
    return res.json({ draft: fallback });
  }
});
