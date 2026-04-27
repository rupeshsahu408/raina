import cors from "cors";
import dotenv from "dotenv";
import express from "express";
import admin from "firebase-admin";
import crypto from "crypto";
import cookieParser from "cookie-parser";
import multer from "multer";
import FormData from "form-data";
import { ibaraRouter } from "./ibara";
import { inboxRouter, inboxPublicRouter } from "./inbox";
import { recruitRouter, recruitPublicRouter } from "./recruit";
import { trackingPublicRouter, trackingAdminRouter } from "./tracking";
import { ledgerRouter } from "./ledger";
import { payablesPublicRouter, payablesRouter, startPayablesAutoScan } from "./payables";
import { connectMongo } from "./db";
import {
  buildBiharSystemPrompt,
  detectBiharCategoriesFromMessage,
  buildModePrompt,
  buildSystemPrompt,
  normalizeBiharCategory,
  resolvePrimaryBiharCategory,
  suggestBiharWebFromMessage,
  type BiharCategory,
  type ChatMode,
  type Personality,
} from "./ai/prompts";
import { callNvidiaChatCompletions, type ChatMessage } from "./ai/nvidiaClient";
import { UserProfile } from "./models/UserProfile";
import { ConversationMessage } from "./models/ConversationMessage";
import { Conversation } from "./models/Conversation";
import { WhatsAppBusinessProfile } from "./models/WhatsAppBusinessProfile";
import { WhatsAppChatLog } from "./models/WhatsAppChatLog";
import { WhatsAppCredential } from "./models/WhatsAppCredential";

dotenv.config();

const app = express();

app.use(cookieParser());

let firebaseReady = false;
function parseServiceAccountJson(raw: string) {
  let parsed: any;
  try {
    parsed = JSON.parse(raw);
  } catch {
    const normalized = raw
      .trim()
      .replace(/^\s*['"]/, "")
      .replace(/['"]\s*$/, "")
      .replace(/\\"/g, '"');
    parsed = JSON.parse(normalized);
  }
  if (parsed && typeof parsed.private_key === "string") {
    parsed.private_key = parsed.private_key.replace(/\\n/g, "\n");
  }
  return parsed;
}

function initFirebaseAdmin() {
  if (firebaseReady) return;
  if (admin.apps.length) {
    firebaseReady = true;
    return;
  }

  const serviceAccountJson =
    process.env.FIREBASE_SERVICE_ACCOUNT_JSON ||
    process.env.FIREBASE_ADMIN_SERVICE_ACCOUNT_JSON;

  const serviceAccountPath =
    process.env.FIREBASE_SERVICE_ACCOUNT_PATH ||
    process.env.FIREBASE_ADMIN_SERVICE_ACCOUNT_PATH;

  const appName = process.env.FIREBASE_ADMIN_APP_NAME;

  if (serviceAccountJson) {
    const parsed = parseServiceAccountJson(serviceAccountJson);
    admin.initializeApp(
      {
        credential: admin.credential.cert(parsed),
      },
      appName
    );
    firebaseReady = true;
    return;
  }

  if (serviceAccountPath) {
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const fs = require("fs");
    const parsed = JSON.parse(fs.readFileSync(serviceAccountPath, "utf8"));
    admin.initializeApp(
      {
        credential: admin.credential.cert(parsed),
      },
      appName
    );
    firebaseReady = true;
    return;
  }

  if (process.env.GOOGLE_APPLICATION_CREDENTIALS) {
    admin.initializeApp(
      {
        credential: admin.credential.applicationDefault(),
      },
      appName
    );
    firebaseReady = true;
    return;
  }

  throw new Error(
    "Firebase Admin credentials not configured. Set one of: FIREBASE_SERVICE_ACCOUNT_JSON, FIREBASE_SERVICE_ACCOUNT_PATH, or GOOGLE_APPLICATION_CREDENTIALS."
  );
}

async function requireFirebaseAuth(
  req: express.Request,
  res: express.Response,
  next: express.NextFunction
) {
  try {
    initFirebaseAdmin();
  } catch (e) {
    // eslint-disable-next-line no-console
    console.error("[auth] firebase init failed:", e);
    return res
      .status(500)
      .json({ error: "Server auth not configured (Firebase Admin missing)" });
  }

  const authHeader = req.header("Authorization");
  if (!authHeader?.startsWith("Bearer ")) {
    return res.status(401).json({ error: "Missing Bearer token" });
  }

  const token = authHeader.slice("Bearer ".length);
  try {
    const decoded = await admin.auth().verifyIdToken(token);
    req.user = { uid: decoded.uid, email: decoded.email };
    return next();
  } catch {
    return res.status(401).json({ error: "Invalid or expired token" });
  }
}

const isProduction = process.env.NODE_ENV === "production";

function buildCorsOrigin(): string | string[] | boolean {
  const defaultOrigins = [
    "https://www.plyndrox.app",
    "https://plyndrox.app",
    "http://localhost:3000",
    "http://localhost:5000",
  ];
  const raw = process.env.CORS_ORIGIN;
  if (!raw) {
    if (isProduction) {
      console.warn(
        "[cors] CORS_ORIGIN not set in production — using Plyndrox and local development origins."
      );
      return defaultOrigins;
    }
    return defaultOrigins;
  }
  if (raw === "*" || raw === "true") return true;
  const origins = Array.from(
    new Set([...raw.split(",").map((s) => s.trim()).filter(Boolean), ...defaultOrigins])
  );
  return origins.length === 1 ? origins[0] : origins;
}

const corsOrigin = buildCorsOrigin();
const publicSubmissionAttempts = new Map<string, { count: number; resetAt: number }>();

function escapeHtml(value: unknown): string {
  return String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

function isValidEmail(value: unknown): value is string {
  return typeof value === "string" && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim());
}

function checkPublicSubmissionLimit(req: express.Request): boolean {
  const key = req.ip || req.socket.remoteAddress || "unknown";
  const now = Date.now();
  const current = publicSubmissionAttempts.get(key);
  if (!current || current.resetAt < now) {
    publicSubmissionAttempts.set(key, { count: 1, resetAt: now + 60 * 60 * 1000 });
    return true;
  }
  if (current.count >= 8) return false;
  current.count += 1;
  return true;
}

app.use(
  cors({
    origin: corsOrigin,
    credentials: true,
  })
);

app.use(express.json({ limit: "2mb" }));

app.use("/api/ibara", ibaraRouter);
app.use("/ledger", requireFirebaseAuth, ledgerRouter);
app.use("/inbox", inboxPublicRouter);
app.use("/inbox", requireFirebaseAuth, inboxRouter);
app.use("/recruit-public", recruitPublicRouter);
app.use("/recruit", requireFirebaseAuth, recruitRouter);
app.use("/track", trackingPublicRouter);
app.use("/admin/tracking", requireFirebaseAuth, trackingAdminRouter);
app.use("/payables", payablesPublicRouter);
app.use("/payables", requireFirebaseAuth, payablesRouter);

app.get("/health", (_req, res) => {
  res.json({ ok: true, service: "evara-backend" });
});

app.get("/api/health", (_req, res) => {
  res.status(200).send("OK");
});

app.post("/support/submit", async (req, res) => {
  try {
    if (!checkPublicSubmissionLimit(req)) {
      return res.status(429).json({ error: "Too many submissions. Please try again later." });
    }

    const {
      type,
      name,
      email,
      title,
      message,
      productArea,
      category,
      page,
      errorKind,
      severity,
      steps,
      expected,
      actual,
      browserInfo,
      currentUrl,
    } = req.body as Record<string, string>;

    const submissionType = type === "report" ? "report" : type === "feedback" ? "feedback" : "";
    if (!submissionType) {
      return res.status(400).json({ error: "Submission type is required." });
    }
    if (!isValidEmail(email)) {
      return res.status(400).json({ error: "A valid email address is required." });
    }
    if (!title?.trim() || !message?.trim()) {
      return res.status(400).json({ error: "Title and details are required." });
    }
    if (title.length > 140 || message.length > 4000) {
      return res.status(400).json({ error: "Please keep your submission shorter." });
    }
    if (submissionType === "report" && (!page?.trim() || !errorKind?.trim())) {
      return res.status(400).json({ error: "Page and error type are required for reports." });
    }

    const smtpUser = process.env.SMTP_USER ?? "";
    const smtpPass = process.env.SMTP_PASS ?? "";
    const smtpHost = process.env.SMTP_HOST ?? "smtp.gmail.com";
    const ownerEmail = process.env.OWNER_EMAIL || process.env.SUPPORT_EMAIL || smtpUser;

    if (!smtpUser || !smtpPass || !ownerEmail) {
      return res.status(500).json({ error: "Email service is not configured." });
    }

    const nodemailer = await import("nodemailer");
    const transporter = nodemailer.createTransport({
      host: smtpHost,
      port: Number(process.env.SMTP_PORT || 465),
      secure: (process.env.SMTP_SECURE || "true") !== "false",
      auth: { user: smtpUser, pass: smtpPass },
    });

    const submittedAt = new Date().toLocaleString("en-IN", {
      timeZone: "Asia/Kolkata",
      dateStyle: "full",
      timeStyle: "short",
    });
    const label = submissionType === "report" ? "Error Report" : "Product Feedback";
    const accent = submissionType === "report" ? "#ef4444" : "#4f46e5";
    const safeName = escapeHtml(name || "Anonymous user");
    const safeEmail = escapeHtml(email.trim());
    const fields = [
      ["Name", safeName],
      ["Email", safeEmail],
      ["Product area", escapeHtml(productArea || "Not specified")],
      ["Category", escapeHtml(category || "Not specified")],
      ["Page", escapeHtml(page || "Not specified")],
      ["Error type", escapeHtml(errorKind || "Not specified")],
      ["Severity", escapeHtml(severity || "Not specified")],
      ["Current URL", escapeHtml(currentUrl || "Not captured")],
      ["Browser/device", escapeHtml(browserInfo || "Not captured")],
    ];

    const html = `<!DOCTYPE html><html><head><meta charset="utf-8"><style>
body{font-family:Inter,Segoe UI,Arial,sans-serif;background:#f8fafc;margin:0;padding:0;color:#111827;}
.wrap{max-width:680px;margin:28px auto;background:#fff;border:1px solid #e5e7eb;border-radius:22px;overflow:hidden;box-shadow:0 18px 50px rgba(15,23,42,.08);}
.head{background:linear-gradient(135deg,${accent},#111827);padding:30px;color:#fff;}
.badge{display:inline-block;border:1px solid rgba(255,255,255,.28);background:rgba(255,255,255,.14);border-radius:999px;padding:6px 12px;font-size:11px;font-weight:800;letter-spacing:.08em;text-transform:uppercase;}
h1{margin:14px 0 6px;font-size:24px;line-height:1.2;}
.time{margin:0;color:rgba(255,255,255,.78);font-size:13px;}
.body{padding:28px 30px;}
.grid{display:grid;grid-template-columns:1fr 1fr;gap:12px;margin-bottom:20px;}
.field{border:1px solid #e5e7eb;background:#f9fafb;border-radius:14px;padding:12px;}
.label{font-size:10px;font-weight:900;letter-spacing:.12em;text-transform:uppercase;color:#6b7280;margin-bottom:5px;}
.value{font-size:14px;font-weight:700;color:#111827;word-break:break-word;}
.block{margin-top:16px;border:1px solid #e5e7eb;border-radius:16px;padding:16px;background:#fff;}
.text{white-space:pre-wrap;font-size:15px;line-height:1.65;color:#374151;}
.footer{padding:18px 30px;border-top:1px solid #e5e7eb;background:#f9fafb;font-size:12px;color:#6b7280;}
@media(max-width:640px){.grid{grid-template-columns:1fr}.wrap{margin:0;border-radius:0}}
</style></head><body><div class="wrap">
<div class="head"><span class="badge">New ${label}</span><h1>${escapeHtml(title)}</h1><p class="time">Submitted ${submittedAt} IST from plyndrox.app</p></div>
<div class="body">
<div class="grid">${fields.map(([labelText, value]) => `<div class="field"><div class="label">${labelText}</div><div class="value">${value}</div></div>`).join("")}</div>
<div class="block"><div class="label">User details</div><div class="text">${escapeHtml(message)}</div></div>
${steps ? `<div class="block"><div class="label">Steps to reproduce</div><div class="text">${escapeHtml(steps)}</div></div>` : ""}
${expected || actual ? `<div class="block"><div class="label">Expected vs actual</div><div class="text"><strong>Expected:</strong> ${escapeHtml(expected || "Not provided")}<br><br><strong>Actual:</strong> ${escapeHtml(actual || "Not provided")}</div></div>` : ""}
</div><div class="footer">Reply directly to this email to contact ${safeName}.</div></div></body></html>`;

    await transporter.sendMail({
      from: `"Plyndrox ${label}" <${smtpUser}>`,
      to: ownerEmail,
      subject: `[${label}] ${title.trim()} — ${email.trim()}`,
      html,
      replyTo: email.trim(),
    });

    return res.json({ success: true, message: "Thanks. Your submission was sent successfully." });
  } catch (err) {
    console.error("[support] submission failed:", err);
    return res.status(500).json({ error: "Failed to send your submission. Please try again." });
  }
});

// ── Voice transcription via NVIDIA Whisper ─────────────────────────────────
const audioUpload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 10 * 1024 * 1024 } });

app.post("/v1/transcribe", audioUpload.single("audio"), async (req, res) => {
  try {
    if (!req.file) {
      res.status(400).json({ error: "No audio file provided" });
      return;
    }
    const apiKey = process.env.NVIDIA_API_KEY;
    if (!apiKey) {
      res.status(500).json({ error: "NVIDIA_API_KEY not configured" });
      return;
    }

    const form = new FormData();
    form.append("file", req.file.buffer, {
      filename: "audio.webm",
      contentType: req.file.mimetype || "audio/webm",
    });
    form.append("model", "nvidia/canary-1b");

    const nvidiaRes = await fetch("https://ai.api.nvidia.com/v1/audio/transcriptions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        ...form.getHeaders(),
      },
      body: form.getBuffer() as unknown as BodyInit,
    });

    if (!nvidiaRes.ok) {
      const errText = await nvidiaRes.text().catch(() => "");
      console.error("[transcribe] NVIDIA error:", nvidiaRes.status, errText);
      res.status(502).json({ error: `Transcription service error (${nvidiaRes.status})` });
      return;
    }

    const data: any = await nvidiaRes.json();
    const transcript: string = data?.text ?? data?.transcript ?? "";
    res.json({ transcript });
  } catch (err) {
    console.error("[transcribe] error:", err);
    res.status(500).json({ error: "Transcription failed" });
  }
});

function detectMood(text: string) {
  const t = text.toLowerCase();
  if (/(anxious|anxiety|worried|panic|nervous|scared)/.test(t)) return "anxious";
  if (/(sad|down|cry|hurt|empty|hopeless)/.test(t)) return "sad";
  if (/(angry|mad|furious|rage|irritated)/.test(t)) return "angry";
  if (/(lonely|alone|isolated)/.test(t)) return "lonely";
  if (/(overwhelmed|stress|stressed|burnt out|burnout)/.test(t))
    return "overwhelmed";
  return null;
}

function buildCompanionReply(args: {
  message: string;
  personality: string;
  name?: string | null;
}) {
  const { message, personality, name } = args;
  const mood = detectMood(message);

  const prefix = name ? ` ${name}` : "";

  if (personality === "Loa") {
    switch (mood) {
      case "anxious":
        return `arey ${name ?? "yaar"}, tension mat le. 4 deep breaths lete hain, phir bata sabse zyada kis baat ka stress hai?`;
      case "sad":
        return `oof${prefix}, ye heavy lag raha hai. bata na sabse zyada kis cheez ne hit kiya?`;
      case "angry":
        return `gussa valid hai${prefix}. kya hua exact? kis baat pe itna trigger hua?`;
      case "lonely":
        return `samajh raha hu${prefix}, lonely feel hona tough hota hai. kisi ko miss kar rahe ho ya bas koi samajh nahi raha?`;
      case "overwhelmed":
        return `jab sab ek saath aata hai na, dimag hang ho jata hai. chalo 10 min ka ek chhota step choose karte hain?`;
      default:
        return `haan bolo${prefix}, kya scene chal raha hai? pehle kis part pe focus karein?`;
    }
  }

  // Simi
  switch (mood) {
    case "anxious":
      return `main hoon na${prefix}. pehle 4 sec inhale, 6 sec exhale. fir araam se bata dimag me kya chal raha hai.`;
    case "sad":
      return `arey${prefix}, ye sunke bura laga. kya hua aaj? bata, saath me dekhte hain.`;
    case "angry":
      return `gussa aana normal hai${prefix}. trigger kya tha?`;
    case "lonely":
      return `akela mat feel karo${prefix}, main yahin hu. kisi ko miss kar rahe ho ya disconnected feel ho raha hai?`;
    case "overwhelmed":
      return `kaafi overload lag raha hai${prefix}. ek chhota step choose karein? sabse pehle kya handle karna hai?`;
    default:
      return `haan bolo${prefix}, kya hua?`;
  }
}

const MAX_DEMO_REPLIES = 4;
const SHORT_TERM_CONTEXT_LIMIT = 20;
const CROSS_CHAT_MEMORY_FETCH_LIMIT = 40;
const CROSS_CHAT_MEMORY_INCLUDE_LIMIT = 10;
type DemoSession = {
  repliesUsed: number;
  messages: ChatMessage[];
  updatedAt: number;
};

const demoSessions = new Map<string, DemoSession>();

function getPersonality(input?: string): Personality {
  return input === "Loa" ? "Loa" : "Simi";
}

function normalizeMode(input?: string): ChatMode {
  if (input === "web") return "web";
  if (input === "education") return "education";
  if (input === "study") return "study";
  if (input === "thinking") return "thinking";
  if (input === "business") return "business";
  return "personal";
}

function extractModeFromHashtag(text: string): ChatMode | null {
  const lower = text.toLowerCase();
  if (/(^|\s)#(web|websearch|web-search)\b/.test(lower)) return "web";
  if (/(^|\s)#(education|learn|learning)\b/.test(lower)) return "education";
  if (/(^|\s)#(study|revision|exam)\b/.test(lower)) return "study";
  if (/(^|\s)#(thinking|logic|reasoning)\b/.test(lower)) return "thinking";
  if (/(^|\s)#(business|startup|money)\b/.test(lower)) return "business";
  if (/(^|\s)#(personal|chat|friend)\b/.test(lower)) return "personal";
  return null;
}

function stripModeHashtags(text: string): string {
  return text
    .replace(/(^|\s)#(web|websearch|web-search)\b/gi, " ")
    .replace(/(^|\s)#(education|learn|learning)\b/gi, " ")
    .replace(/(^|\s)#(study|revision|exam)\b/gi, " ")
    .replace(/(^|\s)#(thinking|logic|reasoning)\b/gi, " ")
    .replace(/(^|\s)#(business|startup|money)\b/gi, " ")
    .replace(/(^|\s)#(personal|chat|friend)\b/gi, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function inferModeFromMessage(text: string): ChatMode {
  const lower = text.toLowerCase();

  if (
    /(latest|today|current|abhi|aaj|update|news|recent|202[0-9]|price now|live)/.test(
      lower
    )
  ) {
    return "web";
  }
  if (
    /(business|startup|revenue|profit|sales|marketing|roi|client|pricing|funding)/.test(
      lower
    )
  ) {
    return "business";
  }
  if (
    /(explain|samjhao|samjha|definition|concept|difference|what is|why does|how does)/.test(
      lower
    )
  ) {
    return "education";
  }
  if (
    /(notes|revision|mcq|short answer|direct answer|exam prep|memorize|ratta|test me)/.test(
      lower
    )
  ) {
    return "study";
  }
  if (
    /(step by step|debug|solve this|approach|strategy|break it down|reason|tradeoff|algorithm)/.test(
      lower
    )
  ) {
    return "thinking";
  }
  return "personal";
}

function shouldAutoUseWebSearch(text: string): boolean {
  return /(latest|today|current|aaj|abhi|update|news|live|price now|new policy|last date|deadline)/i.test(
    text
  );
}

function normalizeConversationId(input?: string) {
  const raw = (input || "").trim();
  if (!raw) return "default";
  return raw.slice(0, 120);
}

async function runWebSearch(query: string) {
  const serperKey = process.env.SERPER_API_KEY;
  if (!serperKey) return null;

  const resp = await fetch("https://google.serper.dev/search", {
    method: "POST",
    headers: {
      "X-API-KEY": serperKey,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ q: query, gl: "in", hl: "en" }),
  });

  if (!resp.ok) return null;
  const data: any = await resp.json().catch(() => null);
  const organic = Array.isArray(data?.organic) ? data.organic.slice(0, 7) : [];
  if (!organic.length) return [];

  return organic.map((item: any, idx: number) => ({
    rank: idx + 1,
    title: String(item?.title ?? "Untitled"),
    snippet: String(item?.snippet ?? ""),
    link: String(item?.link ?? ""),
  }));
}

function getDayKey(now = new Date()) {
  return `${now.getUTCFullYear()}-${String(now.getUTCMonth() + 1).padStart(
    2,
    "0"
  )}-${String(now.getUTCDate()).padStart(2, "0")}`;
}

function toUniqueLimited(values: string[], limit = 8) {
  return Array.from(new Set(values.map((v) => v.trim()).filter(Boolean))).slice(
    0,
    limit
  );
}

function extractMemorySignals(text: string) {
  const t = text.trim();
  const lower = t.toLowerCase();
  const goals: string[] = [];
  const habits: string[] = [];
  const repeatedTopics: string[] = [];

  if (/(goal|plan to|want to|i will|i need to|aim to)/.test(lower)) {
    goals.push(t);
  }
  if (/(daily|every day|habit|routine|usually|often|consistently)/.test(lower)) {
    habits.push(t);
  }
  if (
    /(study|exam|business|startup|money|stress|anxiety|relationship|career|fitness|health)/.test(
      lower
    )
  ) {
    repeatedTopics.push(
      /(study|exam)/.test(lower)
        ? "study"
        : /(business|startup|money)/.test(lower)
          ? "business"
          : /(stress|anxiety)/.test(lower)
            ? "stress/anxiety"
            : /(relationship)/.test(lower)
              ? "relationships"
              : /(career)/.test(lower)
                ? "career"
                : /(fitness|health)/.test(lower)
                  ? "health/fitness"
                  : "general"
    );
  }

  return { goals, habits, repeatedTopics };
}

function normalizeTopic(text: string) {
  const lower = text.toLowerCase();
  if (/(coding|programming|developer|software)/.test(lower)) return "coding";
  if (/(study|exam|college|school)/.test(lower)) return "study";
  if (/(business|startup|money|marketing|sales)/.test(lower)) return "business";
  if (/(fitness|gym|health|workout)/.test(lower)) return "health/fitness";
  if (/(relationship|dating|love)/.test(lower)) return "relationships";
  if (/(stress|anxiety|overwhelm|panic)/.test(lower)) return "stress/anxiety";
  if (/(career|job|interview)/.test(lower)) return "career";
  return "general";
}

function extractAutoLearningSignals(text: string) {
  const trimmed = text.trim();
  const lower = trimmed.toLowerCase();
  const interests: string[] = [];
  const goals: string[] = [];
  const habits: string[] = [];
  const repeatedTopics: string[] = [];

  const likeMatch = trimmed.match(
    /(?:i like|i love|i enjoy|mujhe|mujhe bahut pasand hai|pasand hai)\s+([a-zA-Z][a-zA-Z0-9\s'-]{1,40})/i
  );
  if (likeMatch?.[1]) {
    interests.push(likeMatch[1].split(/[,.!?]/)[0].trim().toLowerCase());
  }

  const goalMatch = trimmed.match(
    /(?:i want to|i wanna|i need to|my goal is|mujhe|mujhe .* karna hai|goal)\s+([a-zA-Z][a-zA-Z0-9\s'-]{2,70})/i
  );
  if (goalMatch?.[1] && /(want|goal|karna hai|need to|wanna)/i.test(lower)) {
    goals.push(goalMatch[1].split(/[.?!]/)[0].trim());
  }

  if (/(daily|every day|habit|routine|usually|often|consistently|roz|har din)/.test(lower)) {
    habits.push(trimmed.split(/[.?!]/)[0].trim());
  }

  const topic = normalizeTopic(trimmed);
  if (topic !== "general") {
    repeatedTopics.push(topic);
  }

  return {
    interests: toUniqueLimited(interests, 10),
    goals: toUniqueLimited(goals, 10),
    habits: toUniqueLimited(habits, 10),
    repeatedTopics: toUniqueLimited(repeatedTopics, 10),
  };
}

function normalizeLearnedName(raw: string | null | undefined): string | null {
  if (!raw) return null;
  const t = raw.replace(/\s+/g, " ").trim();
  if (t.length < 2 || t.length > 60) return null;
  return t;
}

/** Extract a name the user introduces about themselves (not questions). */
function extractNameIntroFromText(text: string): string | null {
  const trimmed = text.trim();
  if (!trimmed) return null;
  const nameToken = String.raw`([\p{L}][\p{L}\s'-]{0,50})`;
  const patterns: RegExp[] = [
    new RegExp(
      `(?:my name is|i am|i'm|i’m|mera naam|mera name)\\s+${nameToken}(?:\\s+hai)?`,
      "iu"
    ),
    new RegExp(`\\bmera\\s+naam\\s+hai\\s+${nameToken}\\b`, "iu"),
    new RegExp(`\\bnaam\\s+(?:hai|he)\\s+${nameToken}\\b`, "iu"),
    new RegExp(`\\b(?:call me|this is)\\s+${nameToken}\\b`, "iu"),
    new RegExp(`\\b(?:main|mai)\\s+hoon\\s+${nameToken}\\b`, "iu"),
  ];
  for (const re of patterns) {
    const m = trimmed.match(re);
    if (m?.[1]) {
      const part =
        m[1]
          .split(/\s+(?:and|or|aur|but)\s+/i)[0]
          ?.split(/[,.!?]/)[0]
          ?.trim() ?? "";
      const n = normalizeLearnedName(part);
      if (n) return n;
    }
  }
  return null;
}

function extractProfileSignals(text: string) {
  const trimmed = text.trim();
  const lower = trimmed.toLowerCase();

  let name: string | null = extractNameIntroFromText(trimmed);

  let language: "hindi" | "english" | "hinglish" | null = null;
  if (/(hindi bolo|hindi me|in hindi|हिंदी में|हिंदी बोलो|\bhindi\b)/.test(lower)) {
    language = "hindi";
  } else if (/(english me|in english|english bolo|\benglish\b)/.test(lower)) {
    language = "english";
  } else if (/(hinglish me|in hinglish|hinglish bolo|\bhinglish\b)/.test(lower)) {
    language = "hinglish";
  }

  let occupation: string | null = null;
  const occupationMatch = trimmed.match(
    /(?:i am|i'm|main|mai|mein)\s+(?:a|an)?\s*(doctor|engineer|teacher|student|designer|developer|lawyer|nurse|manager|founder|entrepreneur|businessman|businesswoman)\b/i
  );
  if (occupationMatch?.[1]) {
    occupation = occupationMatch[1].toLowerCase();
  }

  return { name, language, occupation };
}

function isAskingOwnName(text: string) {
  const t = text.toLowerCase().replace(/\s+/g, " ").trim();
  if (extractNameIntroFromText(text)) return false;
  return (
    /\bwhat is my name\b/.test(t) ||
    /\bwhat'?s my name\b/.test(t) ||
    /\bmera (kya )?(naam|name) (hai|h|he)\b/.test(t) ||
    /\bmera (naam|name) kya (hai|h|he)\b/.test(t) ||
    /\bmera (naam|name) kya\b/.test(t) ||
    /^(mera naam|mera name)\??$/.test(t)
  );
}

function isAskingOwnRole(text: string) {
  const t = text.toLowerCase();
  return (
    /\bwhat am i\b/.test(t) ||
    /\bwho am i\b/.test(t) ||
    /\bmera (profession|kaam|role)\b/.test(t) ||
    /\bmain kya hoon\b/.test(t)
  );
}

function inferNameFromConversationThread(
  turns: Array<{ role: "user" | "ai"; content: string }>
): string | null {
  const userMsgs = [...turns].filter((m) => m.role === "user").reverse();
  for (const m of userMsgs) {
    if (isAskingOwnName(m.content)) continue;
    const n = extractNameIntroFromText(m.content);
    if (n) return n;
  }
  return null;
}

function inferOccupationFromConversationThread(
  turns: Array<{ role: "user" | "ai"; content: string }>
): string | null {
  const re =
    /(?:i am|i'm|main|mai|mein)\s+(?:a|an)?\s*(doctor|engineer|teacher|student|designer|developer|lawyer|nurse|manager|founder|entrepreneur|businessman|businesswoman)\b/i;
  for (const m of [...turns].filter((u) => u.role === "user").reverse()) {
    const occ = m.content.match(re)?.[1]?.toLowerCase();
    if (occ) return occ;
  }
  return null;
}

function compactText(value: string, max = 140) {
  const oneLine = value.replace(/\s+/g, " ").trim();
  if (oneLine.length <= max) return oneLine;
  return `${oneLine.slice(0, max - 1)}…`;
}

function makeConversationTitleFromMessage(message: string) {
  return compactText(message.replace(/\s+/g, " ").trim(), 60) || "New Chat";
}

function mergePreferences(existing: string[], language: string | null) {
  const withoutLanguage = existing.filter(
    (p) => !p.toLowerCase().startsWith("language:")
  );
  if (!language) return withoutLanguage;
  return toUniqueLimited([...withoutLanguage, `language:${language}`], 12);
}

function mergeOccupationPreference(existing: string[], occupation: string | null) {
  const withoutOccupation = existing.filter(
    (p) => !p.toLowerCase().startsWith("occupation:")
  );
  if (!occupation) return withoutOccupation;
  return toUniqueLimited([...withoutOccupation, `occupation:${occupation}`], 12);
}

function getSessionId(req: express.Request, res: express.Response) {
  const existing = req.cookies?.demo_session;
  if (typeof existing === "string" && existing.trim()) return existing;

  const id = crypto.randomUUID();
  res.cookie("demo_session", id, {
    httpOnly: false,
    sameSite: "lax",
    maxAge: 1000 * 60 * 30,
  });
  return id;
}

app.post("/v1/demo-chat", (req, res) => {
  const { message, personality } = (req.body || {}) as {
    message?: string;
    personality?: string;
  };

  if (!message?.trim()) {
    return res.status(400).json({ error: "message is required" });
  }

  const resolvedPersonality = getPersonality(personality);
  const sessionId = getSessionId(req, res);

  const now = Date.now();
  const existing = demoSessions.get(sessionId);
  const session: DemoSession =
    existing && now - existing.updatedAt < 1000 * 60 * 30
      ? existing
      : { repliesUsed: 0, messages: [], updatedAt: now };

  if (!existing || session !== existing) demoSessions.set(sessionId, session);

  if (session.repliesUsed >= MAX_DEMO_REPLIES) {
    return res.status(429).json({ error: "demo limit reached" });
  }

  session.messages.push({ role: "user", content: message.trim() });

  const nvidiaKey = process.env.NVIDIA_API_KEY;
  const fallback = buildCompanionReply({
    message,
    personality: resolvedPersonality,
    name: null,
  });

  const replyPromise = (async () => {
    if (!nvidiaKey) return fallback;

    const systemPrompt = buildSystemPrompt(resolvedPersonality, "Demo user");
    const nvidiaMessages: ChatMessage[] = [
      { role: "system", content: systemPrompt },
      ...session.messages.slice(-10),
    ];

    const reply = await callNvidiaChatCompletions({
      apiKey: nvidiaKey,
      messages: nvidiaMessages,
      temperature: 0.72,
      max_tokens: 720,
    });

    return reply || fallback;
  })();

  return replyPromise
    .then((reply) => {
      session.messages.push({ role: "assistant", content: reply });
      session.repliesUsed += 1;
      session.updatedAt = now;

      // Keep memory small
      if (session.messages.length > 20) {
        session.messages = session.messages.slice(-20);
      }

      return res.json({ reply });
    })
    .catch(() => {
      // Still progress the demo session.
      session.messages.push({ role: "assistant", content: fallback });
      session.repliesUsed += 1;
      session.updatedAt = now;
      return res.json({ reply: fallback });
    });
});

// ── Plyndrox Site Assistant ───────────────────────────────────────────────────

const PLYNDROX_ASSISTANT_SYSTEM_PROMPT = `You are Plyndrox — the official AI assistant embedded on the Plyndrox website (https://www.plyndrox.app). Your job is to help visitors understand the platform, navigate it, and get the most out of every feature. You speak like a knowledgeable, friendly team member — warm, clear, and never robotic.

## What is Plyndrox?
Plyndrox is a free AI platform with 7 distinct AI workspaces, all free forever, for individuals and businesses worldwide. It supports Hindi, English, and Hinglish.

## The 7 AI Workspaces

### 1. Personal AI (Plyndrox AI) — /chat
An emotionally intelligent personal companion with two personalities:
- **Simi**: gentle, empathetic, warm — for emotional support and daily life.
- **Loa**: real-talk, direct, motivating — for tough conversations and accountability.
It remembers your context, supports you through work, study, stress, relationships, and everything in between. Available 24/7. Free forever. No sign-up required to try.

### 2. Bihar AI — /bihar-ai
An AI built specifically for Bihar (India) with 130 million people in mind. Covers local news, education resources, job listings, government schemes, culture, politics, and Bihari language support. Speaks in Bhojpuri, Hindi, and English.

### 3. Business AI Suite — /business-ai
A hub for two business automation tools:
- **Plyndrox WhatsApp AI** (/whatsapp-ai): Train a custom WhatsApp chatbot on your business info. Handles customer queries, product questions, and orders 24/7. No coding needed.
- **Plyndrox Web AI / Ibara** (/ibara): An embeddable website chatbot that speaks for your business automatically.

### 4. Inbox AI — /inbox
Connect your Gmail account. The AI reads every email, labels it by intent (inquiry, complaint, order, etc.), writes smart replies in your tone, and can set auto-reply rules. Zero email stress.

### 5. Payable AI — /payables
AI-powered Accounts Payable automation for small businesses:
- Upload invoices (PDF/image) or connect Gmail to auto-fetch invoice emails.
- AI extracts every field: vendor, amount, GSTIN, due date, bank details.
- Routes invoices for approval, tracks payment status, generates reports.
- Features: Dashboard, Invoice Detail, Payment Scheduler, Cash Flow Forecast, Vendor Intelligence, Email Invoice Inbox, Supplier Upload Link, Accounting Exports (Tally, Zoho, QuickBooks).
- Team roles: owner, admin, approver, viewer.

### 6. Recruit AI — /recruit
End-to-end AI hiring pipeline:
- Post jobs and receive applications.
- AI scores every resume automatically.
- Sends smart assessments to candidates.
- Surfaces the best matches so you can interview fewer people and hire right.
- Public job listings available at /recruit-public.

### 7. Smart Ledger — /ledger
Built for grain traders and small business owners who use manual ledgers (satti):
- Photograph your register — AI reads Hindi and English handwriting.
- Groups entries by commodity with rate × quantity = amount.
- Generates full analytics: commodity distribution, price ranges.
- Export to CSV, PDF, WhatsApp share.
- Session history saved automatically.
- Supports Bhojpuri/Hindi commodity names and quantity units.

## Pricing
Everything is FREE. No credit card. No subscription. No trial period. No hidden fees. Free forever for individuals and businesses.

## How to Get Started
1. Visit https://www.plyndrox.app
2. Click "Get Started" or go directly to any workspace.
3. Most features work without sign-up. For personalized features (memory, saved history, team access), create a free account at /signup or log in at /login.
4. Firebase Auth is used — you can sign up with email/password or Google.

## Navigation Guide
- Home/Landing: /
- Login: /login | Sign Up: /signup
- Personal AI: /chat
- Bihar AI: /bihar-ai
- Business AI: /business-ai → WhatsApp AI: /whatsapp-ai, Web AI: /ibara
- Inbox AI: /inbox
- Payable AI: /payables (Dashboard: /payables/dashboard, Upload: /payables/upload, Payments: /payables/payments, Analyze: /payables/analyze, Scheduler: /payables/scheduler)
- Recruit AI: /recruit (Public listings: /recruit-public)
- Smart Ledger: /ledger (Dashboard: /ledger/dashboard)
- About: /about | Features: /features | Blog: /blog | Partners: /partners | Contact: /contact
- Legal: /privacy-policy, /terms, /cookies, /disclaimer

## Languages Supported
Hindi, English, Hinglish (mix of Hindi and English), and Bhojpuri (for Bihar AI and Smart Ledger).

## Technical Info (for technical users)
- Frontend: Next.js PWA deployed on Vercel at https://www.plyndrox.app
- Backend: Express.js API deployed on Render at https://raina-1.onrender.com
- Auth: Firebase Authentication
- Database: MongoDB Atlas
- AI: NVIDIA AI models (Nemotron 70B and others)
- Works as a Progressive Web App (PWA) — installable on mobile like a native app.
- Mobile-first design, works on 3G.

## Your Behavior
- Answer questions about what the platform does and how to use any feature.
- If someone reports a problem, acknowledge it, give troubleshooting steps, and suggest contacting support at /contact.
- If someone asks how to navigate to something, give them the exact URL path.
- You can generate structured reports or summaries if asked (e.g., "summarize what Plyndrox offers for businesses").
- Keep responses concise but complete. Use bullet points for lists. Avoid jargon.
- Always be helpful, friendly, and direct.
- If you don't know something specific about the user's account or data, say so honestly and suggest they log in or contact support.
- You support Hindi and Hinglish — respond in the language the user writes in.`;

const assistantSessions = new Map<string, { messages: ChatMessage[]; updatedAt: number }>();

app.post("/assistant", (req, res) => {
  const { message, history } = (req.body || {}) as {
    message?: string;
    history?: Array<{ role: string; content: string }>;
  };

  if (!message?.trim()) {
    return res.status(400).json({ error: "message is required" });
  }

  const nvidiaKey = process.env.NVIDIA_API_KEY;

  const sessionId = getSessionId(req, res);
  const now = Date.now();
  const existing = assistantSessions.get(sessionId);
  const session =
    existing && now - existing.updatedAt < 1000 * 60 * 60
      ? existing
      : { messages: [] as ChatMessage[], updatedAt: now };
  if (!existing || session !== existing) assistantSessions.set(sessionId, session);

  const userMsg = message.trim();

  const contextMessages: ChatMessage[] = Array.isArray(history)
    ? history
        .filter((m) => m.role === "user" || m.role === "assistant")
        .slice(-16)
        .map((m) => ({ role: m.role as "user" | "assistant", content: m.content }))
    : session.messages.slice(-16);

  contextMessages.push({ role: "user", content: userMsg });

  const fallbackReply =
    "I'm Plyndrox, your guide to the platform! I can help you understand any of our 7 AI workspaces — Personal AI, Bihar AI, Business AI, Inbox AI, Payable AI, Recruit AI, and Smart Ledger. What would you like to know?";

  const replyPromise = (async () => {
    if (!nvidiaKey) return fallbackReply;
    const nvidiaMessages: ChatMessage[] = [
      { role: "system", content: PLYNDROX_ASSISTANT_SYSTEM_PROMPT },
      ...contextMessages,
    ];
    const reply = await callNvidiaChatCompletions({
      apiKey: nvidiaKey,
      messages: nvidiaMessages,
      temperature: 0.65,
      max_tokens: 600,
    });
    return reply || fallbackReply;
  })();

  return replyPromise
    .then((reply) => {
      session.messages.push({ role: "user", content: userMsg });
      session.messages.push({ role: "assistant", content: reply });
      session.updatedAt = Date.now();
      if (session.messages.length > 30) session.messages = session.messages.slice(-30);
      return res.json({ reply });
    })
    .catch(() => res.json({ reply: fallbackReply }));
});

// ── Translation AI ─────────────────────────────────────────────────────────

const TRANSLATE_SYSTEM_PROMPT = `You are Plyndrox Translate, a world-class human translator and language tutor.

YOUR JOB:
1. SILENTLY auto-correct any spelling mistakes, typos, missing letters, or grammar errors in the user's input. NEVER mention the corrections — just understand what the user actually meant.
   - Example: if user types "apl" you understand "apple". If they type "kya hal hain" you understand "kya haal hai".
2. Translate the corrected text into the requested target language NATURALLY — like a fluent native speaker would say it, not a literal word-for-word translation.
3. Preserve the original tone (casual stays casual, formal stays formal, emotional stays emotional).
4. If the input is already in the target language, gently rephrase it more naturally instead of refusing.
5. Use proper script for the target language (Devanagari for Hindi, Arabic script for Arabic, kanji/hiragana for Japanese, etc.).

OUTPUT FORMAT — respond with ONLY this JSON object, nothing else, no markdown fences:
{"translation": "...the natural translation here..."}

If the user has set mode to "simplify", instead respond with:
{"explanation": "...a simple, easy-to-understand explanation of the original text in the target language, as if explaining to a 10-year-old..."}

Never add commentary, never explain your corrections, never wrap in markdown. Just the JSON.`;

app.post("/translate", async (req, res) => {
  const { text, targetLanguage, mode } = (req.body || {}) as {
    text?: string;
    targetLanguage?: string;
    mode?: "translate" | "simplify";
  };

  if (!text?.trim() || !targetLanguage?.trim()) {
    return res.status(400).json({ error: "text and targetLanguage are required" });
  }

  const nvidiaKey = process.env.NVIDIA_API_KEY;
  const isSimplify = mode === "simplify";

  const userInstruction = isSimplify
    ? `Target language: ${targetLanguage}\nMode: SIMPLIFY\n\nOriginal text:\n"""${text.trim()}"""\n\nFirst silently fix any typos. Then explain this in the simplest possible way in ${targetLanguage}, as if to a 10-year-old. Respond as JSON {"explanation": "..."}.`
    : `Target language: ${targetLanguage}\nMode: TRANSLATE\n\nText to translate:\n"""${text.trim()}"""\n\nFirst silently fix any typos. Then translate naturally into ${targetLanguage}. Respond as JSON {"translation": "..."}.`;

  if (!nvidiaKey) {
    return res.json({
      translation: isSimplify ? null : `[${targetLanguage}] ${text.trim()}`,
      explanation: isSimplify ? `[${targetLanguage} explanation] ${text.trim()}` : null,
      error: "AI key not configured",
    });
  }

  try {
    const reply = await callNvidiaChatCompletions({
      apiKey: nvidiaKey,
      messages: [
        { role: "system", content: TRANSLATE_SYSTEM_PROMPT },
        { role: "user", content: userInstruction },
      ],
      temperature: 0.4,
      max_tokens: 800,
    });

    let translation: string | null = null;
    let explanation: string | null = null;

    if (reply) {
      const cleaned = reply.trim().replace(/^```(?:json)?\s*/i, "").replace(/\s*```$/, "");
      try {
        const parsed = JSON.parse(cleaned);
        translation = typeof parsed.translation === "string" ? parsed.translation : null;
        explanation = typeof parsed.explanation === "string" ? parsed.explanation : null;
      } catch {
        if (isSimplify) explanation = cleaned;
        else translation = cleaned;
      }
    }

    return res.json({ translation, explanation });
  } catch (err) {
    console.error("[translate] error:", err);
    return res.status(502).json({ error: "Translation service temporarily unavailable" });
  }
});

// ─────────────────────────────────────────────────────────────────────────────

type WhatsAppBusinessConfig = {
  businessName: string;
  businessType: string;
  workingHours: string;
  location: string;
  services: string;
  knowledgeBook: string;
  tone: "friendly" | "professional";
  languageMode: "auto" | "english" | "hindi" | "hinglish";
  autoReplyEnabled: boolean;
};

type WhatsAppLogItem = {
  id: string;
  from: string;
  customerName?: string | null;
  customerMessage: string;
  aiReply: string;
  language?: string | null;
  createdAt: string;
};

const whatsappLogs: WhatsAppLogItem[] = [];
const DEFAULT_WHATSAPP_BUSINESS_ID = process.env.EVARA_WHATSAPP_BUSINESS_ID || "default-business";
const WHATSAPP_CALLBACK_URL =
  process.env.WHATSAPP_CALLBACK_URL ||
  "https://raina-1.onrender.com/v1/whatsapp/webhook";

let whatsappBusinessConfig: WhatsAppBusinessConfig = {
  businessName: process.env.EVARA_BUSINESS_NAME || "Evara Business",
  businessType: process.env.EVARA_BUSINESS_TYPE || "Indian business",
  workingHours: process.env.EVARA_BUSINESS_HOURS || "Business hours not provided",
  location: process.env.EVARA_BUSINESS_LOCATION || "India",
  services: process.env.EVARA_BUSINESS_SERVICES || "Customer support, bookings, product information",
  knowledgeBook:
    process.env.EVARA_BUSINESS_KNOWLEDGE_BOOK ||
    "Answer customer questions briefly and politely using the available business information. If something is not known, ask a short follow-up question or tell the customer the team will confirm.",
  tone:
    process.env.EVARA_BUSINESS_TONE === "friendly" ? "friendly" : "professional",
  languageMode:
    process.env.EVARA_BUSINESS_LANGUAGE_MODE === "english" ||
    process.env.EVARA_BUSINESS_LANGUAGE_MODE === "hindi" ||
    process.env.EVARA_BUSINESS_LANGUAGE_MODE === "hinglish"
      ? process.env.EVARA_BUSINESS_LANGUAGE_MODE
      : "auto",
  autoReplyEnabled: process.env.EVARA_WHATSAPP_AUTO_REPLY !== "false",
};

function sanitizeBusinessConfig(input: Partial<WhatsAppBusinessConfig>): WhatsAppBusinessConfig {
  const tone = input.tone === "friendly" ? "friendly" : "professional";
  const languageMode =
    input.languageMode === "english" ||
    input.languageMode === "hindi" ||
    input.languageMode === "hinglish"
      ? input.languageMode
      : "auto";

  return {
    businessName: String(input.businessName || "").trim().slice(0, 120) || "Business",
    businessType: String(input.businessType || "").trim().slice(0, 120) || "Business",
    workingHours: String(input.workingHours || "").trim().slice(0, 180),
    location: String(input.location || "").trim().slice(0, 180),
    services: String(input.services || "").trim().slice(0, 2500),
    knowledgeBook: String(input.knowledgeBook || "").trim().slice(0, 12000),
    tone,
    languageMode,
    autoReplyEnabled: input.autoReplyEnabled !== false,
  };
}

function sanitizeBusinessId(input: unknown) {
  const raw = String(input || "").trim().toLowerCase();
  const safe = raw.replace(/[^a-z0-9_-]/g, "").slice(0, 80);
  return safe || DEFAULT_WHATSAPP_BUSINESS_ID;
}

function configToProfileUpdate(config: WhatsAppBusinessConfig) {
  return {
    businessName: config.businessName,
    businessType: config.businessType,
    workingHours: config.workingHours,
    location: config.location,
    services: config.services,
    knowledgeBook: config.knowledgeBook,
    tone: config.tone,
    languageMode: config.languageMode,
    autoReplyEnabled: config.autoReplyEnabled,
  };
}

function profileToBusinessConfig(profile: any): WhatsAppBusinessConfig {
  return sanitizeBusinessConfig({
    businessName: profile?.businessName,
    businessType: profile?.businessType,
    workingHours: profile?.workingHours,
    location: profile?.location,
    services: profile?.services,
    knowledgeBook: profile?.knowledgeBook,
    tone: profile?.tone,
    languageMode: profile?.languageMode,
    autoReplyEnabled: profile?.autoReplyEnabled,
  });
}

async function loadBusinessProfileConfig(businessId: string) {
  await connectMongo();
  const profile = await WhatsAppBusinessProfile.findOne({ businessId }).lean();
  if (!profile) return whatsappBusinessConfig;
  return profileToBusinessConfig(profile);
}

async function saveBusinessProfileConfig(businessId: string, config: WhatsAppBusinessConfig) {
  await connectMongo();
  await WhatsAppBusinessProfile.findOneAndUpdate(
    { businessId },
    { $set: configToProfileUpdate(config) },
    { upsert: true, returnDocument: "after", setDefaultsOnInsert: true }
  );
}

async function createWhatsAppLog(args: {
  businessId: string;
  from: string;
  customerName?: string | null;
  customerMessage: string;
  aiReply: string;
  language: string;
  source: "preview" | "whatsapp";
  deliveryStatus?: "sent" | "failed" | "pending";
  deliveryError?: string | null;
  whatsappMessageId?: string | null;
}) {
  await connectMongo();
  return WhatsAppChatLog.create(args);
}

type ResolvedWhatsAppCredentials = {
  apiToken: string;
  phoneNumberId: string;
  verifyToken: string;
  source: "env" | "database";
};

function getCredentialEncryptionKey() {
  const raw =
    process.env.WHATSAPP_CREDENTIALS_SECRET ||
    process.env.ENCRYPTION_KEY ||
    process.env.MONGODB_URI ||
    process.env.NVIDIA_API_KEY;
  if (!raw) {
    throw new Error(
      "Credential encryption key missing. Set WHATSAPP_CREDENTIALS_SECRET or MONGODB_URI."
    );
  }
  return crypto.createHash("sha256").update(raw).digest();
}

function encryptCredential(value: string) {
  const iv = crypto.randomBytes(12);
  const cipher = crypto.createCipheriv("aes-256-gcm", getCredentialEncryptionKey(), iv);
  const encrypted = Buffer.concat([cipher.update(value, "utf8"), cipher.final()]);
  const tag = cipher.getAuthTag();
  return `v1:${iv.toString("base64")}:${tag.toString("base64")}:${encrypted.toString("base64")}`;
}

function decryptCredential(value: string) {
  const [version, ivRaw, tagRaw, encryptedRaw] = value.split(":");
  if (version !== "v1" || !ivRaw || !tagRaw || !encryptedRaw) {
    throw new Error("Invalid encrypted credential format");
  }
  const decipher = crypto.createDecipheriv(
    "aes-256-gcm",
    getCredentialEncryptionKey(),
    Buffer.from(ivRaw, "base64")
  );
  decipher.setAuthTag(Buffer.from(tagRaw, "base64"));
  const decrypted = Buffer.concat([
    decipher.update(Buffer.from(encryptedRaw, "base64")),
    decipher.final(),
  ]);
  return decrypted.toString("utf8");
}

function getEnvWhatsAppCredentials(): ResolvedWhatsAppCredentials | null {
  const apiToken = process.env.WHATSAPP_CLOUD_API_TOKEN;
  const phoneNumberId = process.env.WHATSAPP_PHONE_NUMBER_ID;
  const verifyToken = process.env.WHATSAPP_VERIFY_TOKEN;
  if (!apiToken || !phoneNumberId || !verifyToken) return null;
  return { apiToken, phoneNumberId, verifyToken, source: "env" };
}

async function getStoredWhatsAppCredentials(
  businessId: string
): Promise<ResolvedWhatsAppCredentials | null> {
  await connectMongo();
  const record = await WhatsAppCredential.findOne({ businessId }).lean();
  if (!record) return null;
  return {
    apiToken: decryptCredential(record.apiTokenEncrypted),
    phoneNumberId: record.phoneNumberId,
    verifyToken: decryptCredential(record.verifyTokenEncrypted),
    source: "database",
  };
}

async function resolveWhatsAppCredentials(
  businessId: string
): Promise<ResolvedWhatsAppCredentials | null> {
  const stored = await getStoredWhatsAppCredentials(businessId).catch(() => null);
  if (stored) return stored;
  return getEnvWhatsAppCredentials();
}

async function getWhatsAppCredentialStatus(businessId: string) {
  const envCredentials = getEnvWhatsAppCredentials();
  let stored: any = null;
  try {
    await connectMongo();
    stored = await WhatsAppCredential.findOne({ businessId }).lean();
  } catch {}

  const hasDatabaseCredentials = Boolean(stored);
  const hasEnvCredentials = Boolean(envCredentials);
  return {
    whatsappApiToken: hasDatabaseCredentials || Boolean(envCredentials?.apiToken),
    whatsappPhoneNumberId: hasDatabaseCredentials || Boolean(envCredentials?.phoneNumberId),
    whatsappVerifyToken: hasDatabaseCredentials || Boolean(envCredentials?.verifyToken),
    credentialSource: hasDatabaseCredentials ? "database" : hasEnvCredentials ? "env" : "none",
    connected: Boolean(stored?.connected || hasEnvCredentials),
    callbackUrl: WHATSAPP_CALLBACK_URL,
    lastTestAt: stored?.lastTestAt || null,
    lastError: stored?.lastError || null,
    tokenLast4: stored?.tokenLast4 || null,
    oauthReady: true,
  };
}

async function testWhatsAppGraphCredentials(credentials: ResolvedWhatsAppCredentials) {
  const response = await fetch(
    `https://graph.facebook.com/v20.0/${credentials.phoneNumberId}?fields=id,display_phone_number,verified_name`,
    {
      method: "GET",
      headers: {
        Authorization: `Bearer ${credentials.apiToken}`,
      },
    }
  );

  const text = await response.text().catch(() => "");
  let data: any = null;
  try {
    data = text ? JSON.parse(text) : null;
  } catch {
    data = null;
  }

  if (!response.ok) {
    const message =
      data?.error?.message ||
      data?.error?.error_user_msg ||
      text ||
      `WhatsApp API returned ${response.status}`;
    throw new Error(String(message).slice(0, 500));
  }

  return {
    id: String(data?.id || credentials.phoneNumberId),
    displayPhoneNumber: data?.display_phone_number || null,
    verifiedName: data?.verified_name || null,
  };
}

function detectCustomerLanguage(text: string, mode: WhatsAppBusinessConfig["languageMode"]) {
  if (mode === "english") return "English";
  if (mode === "hindi") return "Hindi";
  if (mode === "hinglish") return "Hinglish";
  if (/[\u0900-\u097F]/.test(text)) return "Hindi";
  if (/(kya|hai|nahi|kaise|kitna|price|delivery|bata|chahiye|karna|hoga)/i.test(text)) {
    return "Hinglish";
  }
  return "English";
}

function buildWhatsAppFallbackReply(config: WhatsAppBusinessConfig, customerMessage: string) {
  const language = detectCustomerLanguage(customerMessage, config.languageMode);
  const name = config.businessName || "our business";
  if (language === "Hindi") {
    return `Namaste! ${name} se contact karne ke liye dhanyavaad. Hum aapki query dekh rahe hain. Kripya apni requirement thodi detail mein bata dijiye.`;
  }
  if (language === "Hinglish") {
    return `Namaste! ${name} ko message karne ke liye thanks. Aapki query mil gayi hai. Please thoda detail bata dijiye, hum help karte hain.`;
  }
  return `Hello! Thanks for contacting ${name}. We received your message and can help with details, availability, pricing, or booking. Could you share a little more?`;
}

function buildWhatsAppSystemPrompt(config: WhatsAppBusinessConfig, customerMessage: string) {
  const language = detectCustomerLanguage(customerMessage, config.languageMode);
  return [
    "You are an AI WhatsApp business assistant for Indian customers.",
    "Reply naturally, briefly, and professionally. Keep most replies under 70 words.",
    "Use the same language as the customer when language mode is auto. Support Hindi, English, Hinglish, and Indian regional-language style when detected.",
    "Never invent exact pricing, policies, or availability if not present in the business knowledge. Ask one short follow-up question when needed.",
    `Tone: ${config.tone}.`,
    `Detected/selected language: ${language}.`,
    "",
    "Business details:",
    `Name: ${config.businessName}`,
    `Type: ${config.businessType}`,
    `Working hours: ${config.workingHours || "Not provided"}`,
    `Location: ${config.location || "Not provided"}`,
    `Services/products: ${config.services || "Not provided"}`,
    "",
    "Business Knowledge Book:",
    config.knowledgeBook || "No extra knowledge provided.",
  ].join("\n");
}

async function generateWhatsAppBusinessReply(config: WhatsAppBusinessConfig, customerMessage: string) {
  const fallback = buildWhatsAppFallbackReply(config, customerMessage);
  const apiKey = process.env.NVIDIA_API_KEY;
  if (!apiKey) return fallback;

  const reply = await callNvidiaChatCompletions({
    apiKey,
    messages: [
      { role: "system", content: buildWhatsAppSystemPrompt(config, customerMessage) },
      { role: "user", content: customerMessage },
    ],
    temperature: 0.45,
    max_tokens: 260,
  });

  return reply || fallback;
}

async function sendWhatsAppText(
  to: string,
  body: string,
  businessId = DEFAULT_WHATSAPP_BUSINESS_ID
): Promise<{ messageId: string | null }> {
  const credentials = await resolveWhatsAppCredentials(businessId);
  if (!credentials) {
    throw new Error("WhatsApp credentials not configured");
  }

  const response = await fetch(`https://graph.facebook.com/v20.0/${credentials.phoneNumberId}/messages`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${credentials.apiToken}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      messaging_product: "whatsapp",
      to,
      type: "text",
      text: { preview_url: false, body },
    }),
  });

  const text = await response.text().catch(() => "");
  let data: any = null;
  try {
    data = text ? JSON.parse(text) : null;
  } catch {
    data = null;
  }

  if (!response.ok) {
    const detail =
      data?.error?.message || data?.error?.error_user_msg || text || response.statusText;
    throw new Error(`WhatsApp send failed (${response.status}): ${detail}`);
  }

  const messageId = data?.messages?.[0]?.id || null;
  return { messageId };
}

app.get("/v1/whatsapp/status", async (req, res) => {
  const businessId = sanitizeBusinessId(req.query.businessId);
  const credentialStatus = await getWhatsAppCredentialStatus(businessId);
  res.json({
    ...credentialStatus,
    aiApiKey: Boolean(process.env.NVIDIA_API_KEY),
    autoReplyEnabled: whatsappBusinessConfig.autoReplyEnabled,
  });
});

app.post("/v1/whatsapp/credentials", async (req, res) => {
  const businessId = sanitizeBusinessId(req.body?.businessId);
  const apiToken = String(req.body?.apiToken || "").trim();
  const phoneNumberId = String(req.body?.phoneNumberId || "").trim();
  const verifyToken = String(req.body?.verifyToken || "").trim();

  if (!apiToken || !phoneNumberId || !verifyToken) {
    return res.status(400).json({ error: "apiToken, phoneNumberId, and verifyToken are required" });
  }

  if (!/^EA[A-Za-z0-9]+/.test(apiToken) || phoneNumberId.length < 6 || verifyToken.length < 8) {
    return res.status(400).json({ error: "Credentials format looks invalid" });
  }

  try {
    await connectMongo();
    await WhatsAppCredential.findOneAndUpdate(
      { businessId },
      {
        $set: {
          apiTokenEncrypted: encryptCredential(apiToken),
          phoneNumberId,
          verifyTokenEncrypted: encryptCredential(verifyToken),
          tokenLast4: apiToken.slice(-4),
          connected: false,
          lastError: null,
          provider: "manual",
        },
      },
      { upsert: true, returnDocument: "after", setDefaultsOnInsert: true }
    );

    const status = await getWhatsAppCredentialStatus(businessId);
    return res.json({ ok: true, status });
  } catch (err) {
    console.error("[whatsapp] credential save failed:", err);
    return res.status(500).json({ error: "Could not securely store WhatsApp credentials" });
  }
});

app.post("/v1/whatsapp/test-connection", async (req, res) => {
  const businessId = sanitizeBusinessId(req.body?.businessId);
  try {
    const credentials = await resolveWhatsAppCredentials(businessId);
    if (!credentials) {
      return res.status(400).json({ ok: false, error: "WhatsApp credentials are not configured" });
    }

    const details = await testWhatsAppGraphCredentials(credentials);
    try {
      await connectMongo();
      await WhatsAppCredential.findOneAndUpdate(
        { businessId },
        { $set: { connected: true, lastTestAt: new Date(), lastError: null } }
      );
    } catch {}

    return res.json({
      ok: true,
      connected: true,
      message: "WhatsApp Cloud API credentials are valid",
      details,
      status: await getWhatsAppCredentialStatus(businessId),
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "WhatsApp connection test failed";
    try {
      await connectMongo();
      await WhatsAppCredential.findOneAndUpdate(
        { businessId },
        { $set: { connected: false, lastTestAt: new Date(), lastError: message.slice(0, 500) } }
      );
    } catch {}

    return res.status(400).json({
      ok: false,
      connected: false,
      error: message,
      status: await getWhatsAppCredentialStatus(businessId),
    });
  }
});

// ── Meta Embedded Signup (1-click WhatsApp connect) ───────────────────────
// Frontend opens FB.login() with config_id; on success it sends us the
// short-lived `code`. We exchange it for a long-lived business token, find
// the WABA + phone number, register the phone, save credentials, and
// subscribe our app to the WABA's webhooks.

const META_GRAPH_VERSION = process.env.META_GRAPH_VERSION || "v20.0";

app.get("/v1/whatsapp/embedded-signup/config", (_req, res) => {
  res.json({
    appId: process.env.META_APP_ID || process.env.NEXT_PUBLIC_META_APP_ID || null,
    configId:
      process.env.META_EMBEDDED_SIGNUP_CONFIG_ID ||
      process.env.NEXT_PUBLIC_META_EMBEDDED_SIGNUP_CONFIG_ID ||
      null,
    graphVersion: META_GRAPH_VERSION,
    callbackUrl: WHATSAPP_CALLBACK_URL,
    ready: Boolean(
      (process.env.META_APP_ID || process.env.NEXT_PUBLIC_META_APP_ID) &&
        process.env.META_APP_SECRET &&
        (process.env.META_EMBEDDED_SIGNUP_CONFIG_ID ||
          process.env.NEXT_PUBLIC_META_EMBEDDED_SIGNUP_CONFIG_ID)
    ),
  });
});

async function metaGraphGet(path: string, accessToken: string) {
  const url = `https://graph.facebook.com/${META_GRAPH_VERSION}/${path}${
    path.includes("?") ? "&" : "?"
  }access_token=${encodeURIComponent(accessToken)}`;
  const resp = await fetch(url);
  const text = await resp.text().catch(() => "");
  let data: any = null;
  try {
    data = text ? JSON.parse(text) : null;
  } catch {
    data = null;
  }
  if (!resp.ok) {
    const msg =
      data?.error?.message ||
      data?.error?.error_user_msg ||
      text ||
      `Graph ${resp.status}`;
    throw new Error(String(msg).slice(0, 500));
  }
  return data;
}

async function metaGraphPost(path: string, accessToken: string, body: any) {
  const resp = await fetch(
    `https://graph.facebook.com/${META_GRAPH_VERSION}/${path}`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    }
  );
  const text = await resp.text().catch(() => "");
  let data: any = null;
  try {
    data = text ? JSON.parse(text) : null;
  } catch {
    data = null;
  }
  if (!resp.ok) {
    const msg =
      data?.error?.message ||
      data?.error?.error_user_msg ||
      text ||
      `Graph ${resp.status}`;
    throw new Error(String(msg).slice(0, 500));
  }
  return data;
}

app.post("/v1/whatsapp/embedded-signup/exchange", async (req, res) => {
  const businessId = sanitizeBusinessId(req.body?.businessId);
  const code = String(req.body?.code || "").trim();
  // These come back in the FB.login response on the frontend
  const wabaIdHint = String(req.body?.wabaId || "").trim();
  const phoneNumberIdHint = String(req.body?.phoneNumberId || "").trim();

  const appId = process.env.META_APP_ID || process.env.NEXT_PUBLIC_META_APP_ID;
  const appSecret = process.env.META_APP_SECRET;

  if (!appId || !appSecret) {
    return res.status(500).json({
      error:
        "Server is missing META_APP_ID / META_APP_SECRET. Set them in environment and retry.",
    });
  }
  if (!code) {
    return res.status(400).json({ error: "Missing signup code from Facebook" });
  }

  try {
    // 1) Exchange short-lived code for long-lived business system-user token.
    //    Embedded Signup REQUIRES an explicit empty redirect_uri to match the
    //    one FB.login used internally; otherwise Meta returns
    //    "Error validating verification code".
    const tokenResp = await fetch(
      `https://graph.facebook.com/${META_GRAPH_VERSION}/oauth/access_token?` +
        `client_id=${encodeURIComponent(appId)}` +
        `&client_secret=${encodeURIComponent(appSecret)}` +
        `&redirect_uri=` +
        `&code=${encodeURIComponent(code)}`
    );
    const tokenText = await tokenResp.text().catch(() => "");
    let tokenJson: any = null;
    try {
      tokenJson = tokenText ? JSON.parse(tokenText) : null;
    } catch {
      tokenJson = null;
    }
    if (!tokenResp.ok || !tokenJson?.access_token) {
      const msg =
        tokenJson?.error?.message ||
        tokenJson?.error?.error_user_msg ||
        tokenText ||
        "Could not exchange code for access token";
      return res.status(400).json({ error: String(msg).slice(0, 500) });
    }
    const accessToken: string = tokenJson.access_token;

    // 2) Discover the WhatsApp Business Account ID (WABA) if not provided
    let wabaId = wabaIdHint;
    if (!wabaId) {
      const debug = await metaGraphGet(
        `debug_token?input_token=${encodeURIComponent(accessToken)}`,
        accessToken
      ).catch(() => null);
      const scopes: string[] = debug?.data?.granular_scopes || [];
      // Try to read WABA from granular scopes target_ids
      for (const s of scopes as any[]) {
        if (
          s?.scope === "whatsapp_business_management" &&
          Array.isArray(s.target_ids) &&
          s.target_ids.length
        ) {
          wabaId = String(s.target_ids[0]);
          break;
        }
      }
    }
    if (!wabaId) {
      return res.status(400).json({
        error:
          "Could not determine WhatsApp Business Account ID. Make sure the user completed the embedded signup flow.",
      });
    }

    // 3) Find a phone number on this WABA
    let phoneNumberId = phoneNumberIdHint;
    let displayPhoneNumber: string | null = null;
    let verifiedName: string | null = null;
    if (!phoneNumberId) {
      const phones = await metaGraphGet(
        `${wabaId}/phone_numbers?fields=id,display_phone_number,verified_name,quality_rating`,
        accessToken
      );
      const list: any[] = Array.isArray(phones?.data) ? phones.data : [];
      if (!list.length) {
        return res.status(400).json({
          error:
            "No phone numbers found on this WhatsApp Business Account. Add a phone number in Meta dashboard and try again.",
        });
      }
      phoneNumberId = String(list[0].id);
      displayPhoneNumber = list[0].display_phone_number || null;
      verifiedName = list[0].verified_name || null;
    } else {
      const info = await metaGraphGet(
        `${phoneNumberId}?fields=id,display_phone_number,verified_name`,
        accessToken
      ).catch(() => null);
      displayPhoneNumber = info?.display_phone_number || null;
      verifiedName = info?.verified_name || null;
    }

    // 4) Register the phone number on the Cloud API (idempotent)
    //    pin must be a 6-digit number; we generate one and store it
    const sixDigitPin = String(Math.floor(100000 + Math.random() * 900000));
    await metaGraphPost(`${phoneNumberId}/register`, accessToken, {
      messaging_product: "whatsapp",
      pin: sixDigitPin,
    }).catch((err) => {
      // Already-registered error is fine; surface anything else but don't block save
      const msg = err instanceof Error ? err.message : String(err);
      if (!/already.*register/i.test(msg)) {
        console.warn("[whatsapp] phone register warning:", msg);
      }
    });

    // 5) Subscribe our app to the WABA's webhooks
    await metaGraphPost(
      `${wabaId}/subscribed_apps`,
      accessToken,
      {}
    ).catch((err) => {
      console.warn(
        "[whatsapp] subscribed_apps warning:",
        err instanceof Error ? err.message : err
      );
    });

    // 6) Generate a verify token for our /v1/whatsapp/webhook handshake
    const verifyToken = crypto.randomBytes(24).toString("hex");

    // 7) Save credentials (encrypted)
    await connectMongo();
    await WhatsAppCredential.findOneAndUpdate(
      { businessId },
      {
        $set: {
          apiTokenEncrypted: encryptCredential(accessToken),
          phoneNumberId,
          verifyTokenEncrypted: encryptCredential(verifyToken),
          tokenLast4: accessToken.slice(-4),
          connected: true,
          lastTestAt: new Date(),
          lastError: null,
          provider: "oauth-ready",
        },
      },
      { upsert: true, returnDocument: "after", setDefaultsOnInsert: true }
    );

    // 8) Mirror display info into business profile so dashboard shows it
    try {
      const current = await loadBusinessProfileConfig(businessId);
      if (!current.businessName && verifiedName) {
        const merged = sanitizeBusinessConfig({
          ...current,
          businessName: verifiedName,
        });
        await saveBusinessProfileConfig(businessId, merged);
      }
    } catch {}

    return res.json({
      ok: true,
      connected: true,
      wabaId,
      phoneNumberId,
      displayPhoneNumber,
      verifiedName,
      webhookCallbackUrl: WHATSAPP_CALLBACK_URL,
      verifyToken, // shown once to the user; stored encrypted server-side
      registrationPin: sixDigitPin,
      message:
        "WhatsApp connected. AI replies will start working as soon as Meta delivers the first message to your webhook.",
      status: await getWhatsAppCredentialStatus(businessId),
    });
  } catch (err) {
    const message =
      err instanceof Error ? err.message : "Embedded Signup exchange failed";
    console.error("[whatsapp] embedded signup exchange failed:", message);
    return res.status(400).json({ ok: false, error: message });
  }
});

// ── Connection Health (quality, tier, webhook delivery, alerts) ───────────

const TIER_LIMITS: Record<string, number> = {
  TIER_50: 50,
  TIER_250: 250,
  TIER_1K: 1_000,
  TIER_10K: 10_000,
  TIER_100K: 100_000,
  TIER_UNLIMITED: -1,
};

const QUALITY_RANK: Record<string, number> = {
  GREEN: 3,
  YELLOW: 2,
  RED: 1,
  UNKNOWN: 0,
};

function tierLabel(tier: string | null | undefined): string {
  if (!tier) return "Unknown";
  const map: Record<string, string> = {
    TIER_50: "50 / day",
    TIER_250: "250 / day",
    TIER_1K: "1,000 / day",
    TIER_10K: "10,000 / day",
    TIER_100K: "100,000 / day",
    TIER_UNLIMITED: "Unlimited",
  };
  return map[tier] || tier;
}

app.get("/v1/whatsapp/health", async (req, res) => {
  const businessId = sanitizeBusinessId(req.query.businessId);

  try {
    await connectMongo();
    const credRecord = await WhatsAppCredential.findOne({ businessId });
    const credentials = await resolveWhatsAppCredentials(businessId).catch(
      () => null
    );

    // ─── Webhook delivery from last 100 messages
    const recent = await WhatsAppChatLog.find({
      businessId,
      source: "whatsapp",
    })
      .sort({ createdAt: -1 })
      .limit(100)
      .lean()
      .catch(() => [] as any[]);

    const last100 = {
      total: recent.length,
      sent: recent.filter((r) => r.deliveryStatus === "sent").length,
      failed: recent.filter((r) => r.deliveryStatus === "failed").length,
      pending: recent.filter(
        (r) => !r.deliveryStatus || r.deliveryStatus === "pending"
      ).length,
      successRate: 0,
      recentErrors: recent
        .filter((r) => r.deliveryStatus === "failed" && r.deliveryError)
        .slice(0, 5)
        .map((r) => ({
          at: r.createdAt,
          error: r.deliveryError,
          to: r.from,
        })),
    };
    const decided = last100.sent + last100.failed;
    last100.successRate = decided
      ? Math.round((last100.sent / decided) * 1000) / 10
      : recent.length === 0
      ? 100
      : 0;

    const lastInbound = recent[0]?.createdAt || null;
    const lastSent = recent.find((r) => r.deliveryStatus === "sent");

    // ─── Live data from Meta Graph (best-effort)
    let liveNumber: any = null;
    let liveError: string | null = null;
    if (credentials) {
      try {
        liveNumber = await metaGraphGet(
          `${credentials.phoneNumberId}?fields=id,display_phone_number,verified_name,quality_rating,messaging_limit_tier,name_status,code_verification_status,throughput,platform_type,is_official_business_account`,
          credentials.apiToken
        );
      } catch (err) {
        liveError = err instanceof Error ? err.message : String(err);
      }
    }

    const qualityRating = (liveNumber?.quality_rating as string) || null;
    const messagingTier = (liveNumber?.messaging_limit_tier as string) || null;

    // ─── Detect drops vs previous snapshot
    const alerts: Array<{
      severity: "info" | "warning" | "critical";
      title: string;
      message: string;
      action?: string;
    }> = [];

    if (!credentials) {
      alerts.push({
        severity: "critical",
        title: "Not connected",
        message:
          "WhatsApp is not connected for this workspace yet. Connect it from the Setup tab.",
        action: "Go to Setup",
      });
    }

    if (qualityRating === "RED") {
      alerts.push({
        severity: "critical",
        title: "Quality is RED",
        message:
          "Meta has marked your number as low quality. New messaging may be blocked. Reduce template sends, fix opt-in, and stop messages users mark as spam.",
      });
    } else if (qualityRating === "YELLOW") {
      alerts.push({
        severity: "warning",
        title: "Quality dropped to YELLOW",
        message:
          "Your number's quality is at risk. Audit recent broadcasts and slow down outbound to non-opted-in users.",
      });
    }

    const previousRating = credRecord?.lastQualityRating || null;
    if (
      previousRating &&
      qualityRating &&
      QUALITY_RANK[qualityRating] < QUALITY_RANK[previousRating]
    ) {
      alerts.push({
        severity: "warning",
        title: `Quality dropped: ${previousRating} → ${qualityRating}`,
        message:
          "Meta lowered your quality rating since the last check. Investigate recent campaigns.",
      });
    }

    if (last100.total >= 10 && last100.successRate < 90) {
      alerts.push({
        severity: "warning",
        title: `Webhook delivery low (${last100.successRate}%)`,
        message:
          "Several recent replies failed to send. Check token validity, phone registration, and Meta error messages below.",
      });
    }

    if (
      liveNumber?.code_verification_status &&
      liveNumber.code_verification_status !== "VERIFIED"
    ) {
      alerts.push({
        severity: "info",
        title: "Phone not verified",
        message: `code_verification_status is ${liveNumber.code_verification_status}. Re-verify to keep messaging working.`,
      });
    }

    if (liveError) {
      alerts.push({
        severity: "warning",
        title: "Could not fetch live status from Meta",
        message: liveError,
      });
    }

    // ─── Persist snapshot for next-time comparison
    if (credRecord && (qualityRating || messagingTier)) {
      const history = Array.isArray(credRecord.qualityHistory)
        ? credRecord.qualityHistory
        : [];
      history.unshift({
        at: new Date(),
        qualityRating,
        messagingTier,
      });
      while (history.length > 30) history.pop();
      credRecord.qualityHistory = history;
      credRecord.lastQualityRating = qualityRating;
      credRecord.lastMessagingTier = messagingTier;
      credRecord.lastHealthCheckAt = new Date();
      await credRecord.save().catch(() => undefined);
    }

    return res.json({
      businessId,
      checkedAt: new Date().toISOString(),
      connection: {
        connected: Boolean(credRecord?.connected || credentials),
        provider: credRecord?.provider || (credentials ? "env" : null),
        displayPhoneNumber:
          liveNumber?.display_phone_number || null,
        verifiedName: liveNumber?.verified_name || null,
        phoneNumberId: credentials?.phoneNumberId || null,
        lastTestAt: credRecord?.lastTestAt || null,
        lastError: credRecord?.lastError || null,
        tokenLast4: credRecord?.tokenLast4 || null,
      },
      number: {
        qualityRating,
        previousQualityRating: previousRating,
        messagingTier,
        messagingTierLabel: tierLabel(messagingTier),
        messagingTierLimit: messagingTier ? TIER_LIMITS[messagingTier] : null,
        nameStatus: liveNumber?.name_status || null,
        codeVerificationStatus: liveNumber?.code_verification_status || null,
        throughputLevel: liveNumber?.throughput?.level || null,
        platformType: liveNumber?.platform_type || null,
        isOfficialBusinessAccount: Boolean(
          liveNumber?.is_official_business_account
        ),
      },
      webhook: {
        callbackUrl: WHATSAPP_CALLBACK_URL,
        lastInboundAt: lastInbound,
        lastSuccessfulSendAt: lastSent?.createdAt || null,
        last100,
      },
      qualityHistory: (credRecord?.qualityHistory || []).slice(0, 14),
      alerts,
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Health check failed";
    console.error("[whatsapp] health check failed:", message);
    return res.status(500).json({ error: message });
  }
});

app.get("/v1/whatsapp/config", async (req, res) => {
  const businessId = sanitizeBusinessId(req.query.businessId);
  try {
    const config = await loadBusinessProfileConfig(businessId);
    res.json({ businessId, config, persisted: true });
  } catch {
    res.json({ businessId, config: whatsappBusinessConfig, persisted: false });
  }
});

app.put("/v1/whatsapp/config", async (req, res) => {
  const businessId = sanitizeBusinessId(req.body?.businessId);
  whatsappBusinessConfig = sanitizeBusinessConfig(req.body || {});
  try {
    await saveBusinessProfileConfig(businessId, whatsappBusinessConfig);
    res.json({ ok: true, businessId, config: whatsappBusinessConfig, persisted: true });
  } catch {
    res.json({ ok: true, businessId, config: whatsappBusinessConfig, persisted: false });
  }
});

app.get("/v1/whatsapp/logs", async (req, res) => {
  const businessId = sanitizeBusinessId(req.query.businessId);
  try {
    await connectMongo();
    const logs = await WhatsAppChatLog.find({ businessId })
      .sort({ createdAt: -1 })
      .limit(50)
      .lean();
    res.json({
      businessId,
      persisted: true,
      logs: logs.map((log) => ({
        id: String(log._id),
        from: log.from,
        customerName: log.customerName || "Customer",
        customerMessage: log.customerMessage,
        aiReply: log.aiReply,
        language: log.language || "Auto",
        createdAt: log.createdAt,
      })),
    });
  } catch {
    res.json({ businessId, persisted: false, logs: whatsappLogs.slice(0, 50) });
  }
});

app.post("/v1/whatsapp/preview-reply", async (req, res) => {
  const businessId = sanitizeBusinessId(req.body?.businessId);
  const customerMessage = String(req.body?.customerMessage || "").trim();
  if (!customerMessage) {
    return res.status(400).json({ error: "customerMessage is required" });
  }

  const config = sanitizeBusinessConfig(req.body || whatsappBusinessConfig);
  try {
    const reply = await generateWhatsAppBusinessReply(config, customerMessage);
    const language = detectCustomerLanguage(customerMessage, config.languageMode);
    try {
      await createWhatsAppLog({
        businessId,
        from: "preview",
        customerName: "Preview customer",
        customerMessage,
        aiReply: reply,
        language,
        source: "preview",
      });
    } catch {}
    res.json({
      reply,
      language,
      usedAi: Boolean(process.env.NVIDIA_API_KEY),
    });
  } catch {
    const language = detectCustomerLanguage(customerMessage, config.languageMode);
    res.json({
      reply: buildWhatsAppFallbackReply(config, customerMessage),
      language,
      usedAi: false,
    });
  }
});

app.get("/v1/whatsapp/webhook", async (req, res) => {
  const mode = req.query["hub.mode"];
  const token = req.query["hub.verify_token"];
  const challenge = req.query["hub.challenge"];
  const credentials = await resolveWhatsAppCredentials(DEFAULT_WHATSAPP_BUSINESS_ID).catch(() => null);
  const storedVerifyTokens = await (async () => {
    try {
      await connectMongo();
      const records = await WhatsAppCredential.find({}).select("verifyTokenEncrypted").limit(50).lean();
      return records
        .map((record) => decryptCredential(record.verifyTokenEncrypted))
        .filter(Boolean);
    } catch {
      return [];
    }
  })();
  const validTokens = [
    process.env.WHATSAPP_VERIFY_TOKEN,
    credentials?.verifyToken,
    "evara_ai_secure_2026",
    ...storedVerifyTokens,
  ].filter(Boolean);

  if (mode === "subscribe" && validTokens.includes(String(token || ""))) {
    return res.status(200).send(String(challenge || ""));
  }
  return res.sendStatus(403);
});

app.post("/v1/whatsapp/webhook", async (req, res) => {
  res.sendStatus(200);

  if (!whatsappBusinessConfig.autoReplyEnabled) return;

  try {
    const businessId = sanitizeBusinessId(process.env.EVARA_WHATSAPP_BUSINESS_ID);
    const activeConfig = await loadBusinessProfileConfig(businessId).catch(() => whatsappBusinessConfig);
    if (!activeConfig.autoReplyEnabled) return;

    const entries = Array.isArray(req.body?.entry) ? req.body.entry : [];
    for (const entry of entries) {
      const changes = Array.isArray(entry?.changes) ? entry.changes : [];
      for (const change of changes) {
        const messages = Array.isArray(change?.value?.messages) ? change.value.messages : [];
        for (const message of messages) {
          const from = String(message?.from || "");
          const text = String(message?.text?.body || "").trim();
          if (!from || !text) continue;

          const reply = await generateWhatsAppBusinessReply(activeConfig, text);
          const language = detectCustomerLanguage(text, activeConfig.languageMode);
          whatsappLogs.unshift({
            id: crypto.randomUUID(),
            from,
            customerName: from,
            customerMessage: text,
            aiReply: reply,
            language,
            createdAt: new Date().toISOString(),
          });
          if (whatsappLogs.length > 100) whatsappLogs.pop();

          const logDoc = await createWhatsAppLog({
            businessId,
            from,
            customerName: from,
            customerMessage: text,
            aiReply: reply,
            language,
            source: "whatsapp",
            deliveryStatus: "pending",
          }).catch(() => null);

          try {
            const send = await sendWhatsAppText(from, reply, businessId);
            if (logDoc?._id) {
              await WhatsAppChatLog.updateOne(
                { _id: logDoc._id },
                {
                  $set: {
                    deliveryStatus: "sent",
                    whatsappMessageId: send.messageId,
                    deliveryError: null,
                  },
                }
              ).catch(() => undefined);
            }
          } catch (sendErr) {
            const errMsg =
              sendErr instanceof Error ? sendErr.message : String(sendErr);
            console.error("[whatsapp] send failed:", errMsg);
            if (logDoc?._id) {
              await WhatsAppChatLog.updateOne(
                { _id: logDoc._id },
                {
                  $set: {
                    deliveryStatus: "failed",
                    deliveryError: errMsg.slice(0, 500),
                  },
                }
              ).catch(() => undefined);
            }
          }
        }
      }
    }
  } catch (err) {
    console.error("[whatsapp] webhook processing failed:", err);
  }
});

app.get("/v1/profile", requireFirebaseAuth, async (req, res) => {
  try {
    await connectMongo();
    const profile = await UserProfile.findOne({ uid: req.user?.uid }).lean();

    if (!profile) {
      return res.json({
        uid: req.user?.uid,
        name: null,
        photoUrl: null,
        bio: null,
        languagePreference: null,
        mood: null,
        preferences: [],
        interests: [],
        goals: [],
        habits: [],
        about: { nickname: null, occupation: null, moreAboutYou: null },
        personalization: {
          theme: "auto",
          accentColor: "#7c3aed",
          fontSize: "medium",
          bubbleStyle: "rounded",
          backgroundStyle: "gradient",
          typingSpeed: "normal",
        },
        memorySettings: { allowMemory: true, referenceChatHistory: true },
        selectedPersonality: "Simi",
      });
    }

    return res.json({
      uid: profile.uid,
      name: profile.name ?? null,
      photoUrl: profile.photoUrl ?? null,
      bio: profile.bio ?? null,
      languagePreference: profile.languagePreference ?? null,
      mood: profile.mood ?? null,
      preferences: profile.preferences ?? [],
      interests: profile.interests ?? [],
      goals: profile.goals ?? [],
      habits: profile.habits ?? [],
      about: profile.about ?? {
        nickname: null,
        occupation: null,
        moreAboutYou: null,
      },
      personalization: profile.personalization ?? {
        theme: "auto",
        accentColor: "#7c3aed",
        fontSize: "medium",
        bubbleStyle: "rounded",
        backgroundStyle: "gradient",
        typingSpeed: "normal",
      },
      memorySettings: profile.memorySettings ?? {
        allowMemory: true,
        referenceChatHistory: true,
      },
      privacy: profile.privacy ?? { incognitoChatMode: false },
      notifications: profile.notifications ?? { enabled: true },
      selectedPersonality: profile.selectedPersonality ?? "Simi",
      memorySummary: profile.memorySummary ?? {
        goals: [],
        habits: [],
        repeatedTopics: [],
        lastUpdatedAt: null,
      },
    });
  } catch {
    return res
      .status(500)
      .json({ error: "MongoDB not configured or unavailable." });
  }
});

app.put("/v1/profile", requireFirebaseAuth, async (req, res) => {
  try {
    await connectMongo();
    const uid = req.user?.uid;
    if (!uid) return res.status(401).json({ error: "Unauthorized" });

    const {
      name,
      photoUrl,
      bio,
      selectedPersonality,
      preferences,
      mood,
      languagePreference,
      interests,
      goals,
      habits,
      about,
      personalization,
      memorySettings,
      privacy,
      notifications,
    } = (req.body || {}) as {
      name?: string;
      photoUrl?: string | null;
      bio?: string | null;
      selectedPersonality?: "Simi" | "Loa" | string;
      preferences?: string[];
      mood?: string;
      languagePreference?: "hindi" | "english" | "hinglish" | null;
      interests?: string[];
      goals?: string[];
      habits?: string[];
      about?: {
        nickname?: string | null;
        occupation?: string | null;
        moreAboutYou?: string | null;
      };
      personalization?: {
        theme?: "light" | "dark" | "auto";
        accentColor?: string | null;
        fontSize?: "small" | "medium" | "large";
        bubbleStyle?: "rounded" | "sharp";
        backgroundStyle?: "gradient" | "image";
        typingSpeed?: "slow" | "normal" | "fast";
      };
      memorySettings?: {
        allowMemory?: boolean;
        referenceChatHistory?: boolean;
      };
      privacy?: {
        incognitoChatMode?: boolean;
      };
      notifications?: {
        enabled?: boolean;
      };
    };

    const update: Partial<{
      name: string;
      photoUrl: string | null;
      bio: string | null;
      selectedPersonality: "Simi" | "Loa";
      preferences: string[];
      mood: string;
      languagePreference: "hindi" | "english" | "hinglish" | null;
      interests: string[];
      goals: string[];
      habits: string[];
      about: {
        nickname?: string | null;
        occupation?: string | null;
        moreAboutYou?: string | null;
      };
      personalization: {
        theme?: "light" | "dark" | "auto";
        accentColor?: string | null;
        fontSize?: "small" | "medium" | "large";
        bubbleStyle?: "rounded" | "sharp";
        backgroundStyle?: "gradient" | "image";
        typingSpeed?: "slow" | "normal" | "fast";
      };
      memorySettings: {
        allowMemory?: boolean;
        referenceChatHistory?: boolean;
      };
      privacy: {
        incognitoChatMode?: boolean;
      };
      notifications: {
        enabled?: boolean;
      };
    }> = {};

    if (typeof name === "string") update.name = name;
    if (typeof photoUrl === "string" || photoUrl === null) {
      update.photoUrl = photoUrl;
    }
    if (typeof bio === "string" || bio === null) {
      update.bio = bio;
    }
    if (selectedPersonality === "Simi" || selectedPersonality === "Loa") {
      update.selectedPersonality = selectedPersonality;
    }
    if (Array.isArray(preferences)) {
      update.preferences = toUniqueLimited(
        preferences.filter((p): p is string => typeof p === "string"),
        20
      );
    }
    if (typeof mood === "string") {
      update.mood = mood;
    }
    if (
      languagePreference === null ||
      languagePreference === "hindi" ||
      languagePreference === "english" ||
      languagePreference === "hinglish"
    ) {
      update.languagePreference = languagePreference;
    }
    if (Array.isArray(interests)) {
      update.interests = toUniqueLimited(
        interests.filter((x): x is string => typeof x === "string"),
        20
      );
    }
    if (Array.isArray(goals)) {
      update.goals = toUniqueLimited(
        goals.filter((x): x is string => typeof x === "string"),
        20
      );
    }
    if (Array.isArray(habits)) {
      update.habits = toUniqueLimited(
        habits.filter((x): x is string => typeof x === "string"),
        20
      );
    }
    if (about && typeof about === "object") {
      update.about = {
        nickname:
          typeof about.nickname === "string" || about.nickname === null
            ? about.nickname
            : undefined,
        occupation:
          typeof about.occupation === "string" || about.occupation === null
            ? about.occupation
            : undefined,
        moreAboutYou:
          typeof about.moreAboutYou === "string" || about.moreAboutYou === null
            ? about.moreAboutYou
            : undefined,
      };
    }
    if (personalization && typeof personalization === "object") {
      update.personalization = {
        theme:
          personalization.theme === "light" ||
          personalization.theme === "dark" ||
          personalization.theme === "auto"
            ? personalization.theme
            : undefined,
        accentColor:
          typeof personalization.accentColor === "string" ||
          personalization.accentColor === null
            ? personalization.accentColor
            : undefined,
        fontSize:
          personalization.fontSize === "small" ||
          personalization.fontSize === "medium" ||
          personalization.fontSize === "large"
            ? personalization.fontSize
            : undefined,
        bubbleStyle:
          personalization.bubbleStyle === "rounded" ||
          personalization.bubbleStyle === "sharp"
            ? personalization.bubbleStyle
            : undefined,
        backgroundStyle:
          personalization.backgroundStyle === "gradient" ||
          personalization.backgroundStyle === "image"
            ? personalization.backgroundStyle
            : undefined,
        typingSpeed:
          personalization.typingSpeed === "slow" ||
          personalization.typingSpeed === "normal" ||
          personalization.typingSpeed === "fast"
            ? personalization.typingSpeed
            : undefined,
      };
    }
    if (memorySettings && typeof memorySettings === "object") {
      update.memorySettings = {
        allowMemory:
          typeof memorySettings.allowMemory === "boolean"
            ? memorySettings.allowMemory
            : undefined,
        referenceChatHistory:
          typeof memorySettings.referenceChatHistory === "boolean"
            ? memorySettings.referenceChatHistory
            : undefined,
      };
    }
    if (privacy && typeof privacy === "object") {
      update.privacy = {
        incognitoChatMode:
          typeof privacy.incognitoChatMode === "boolean"
            ? privacy.incognitoChatMode
            : undefined,
      };
    }
    if (notifications && typeof notifications === "object") {
      update.notifications = {
        enabled:
          typeof notifications.enabled === "boolean"
            ? notifications.enabled
            : undefined,
      };
    }

    const profile = await UserProfile.findOneAndUpdate(
      { uid },
      { $set: update },
      { upsert: true, returnDocument: "after" }
    ).lean();

    return res.json({ ok: true, profile });
  } catch {
    return res
      .status(500)
      .json({ error: "MongoDB not configured or unavailable." });
  }
});

app.post("/v1/memory/clear", requireFirebaseAuth, async (req, res) => {
  try {
    await connectMongo();
    const uid = req.user?.uid;
    if (!uid) return res.status(401).json({ error: "Unauthorized" });

    await ConversationMessage.deleteMany({ uid });
    await UserProfile.findOneAndUpdate(
      { uid },
      {
        $set: {
          languagePreference: null,
          interests: [],
          goals: [],
          habits: [],
          memorySummary: {
            goals: [],
            habits: [],
            repeatedTopics: [],
            lastUpdatedAt: new Date(),
          },
        },
      },
      { upsert: true }
    );

    return res.json({ ok: true });
  } catch {
    return res.status(500).json({ error: "Could not clear memory." });
  }
});

app.get("/v1/conversations", requireFirebaseAuth, async (req, res) => {
  try {
    await connectMongo();
    const uid = req.user?.uid;
    if (!uid) return res.status(401).json({ error: "Unauthorized" });
    const q =
      typeof req.query.q === "string" ? req.query.q.trim().slice(0, 80) : "";
    const filter: Record<string, unknown> = { uid };
    if (q) {
      filter.$text = { $search: q };
    }

    let rows = await Conversation.find(filter)
      .sort({ pinned: -1, updatedAt: -1 })
      .limit(60)
      .lean();

    if (rows.length === 0 && !q) {
      const grouped = await ConversationMessage.aggregate<{
        _id: string;
        lastMessageAt: Date;
        preview: string;
      }>([
        { $match: { uid } },
        { $sort: { createdAt: -1 } },
        {
          $group: {
            _id: "$conversationId",
            lastMessageAt: { $first: "$createdAt" },
            preview: { $first: "$content" },
          },
        },
        { $sort: { lastMessageAt: -1 } },
        { $limit: 40 },
      ]);
      rows = grouped.map((g) => ({
        uid,
        conversationId: g._id,
        title: makeConversationTitleFromMessage(g.preview),
        preview: g.preview,
        pinned: false,
        createdAt: g.lastMessageAt,
        updatedAt: g.lastMessageAt,
      })) as any;
    }

    return res.json({
      conversations: rows.map((r: any) => ({
        conversationId: String(r.conversationId),
        title: String(r.title || "New Chat"),
        preview: String(r.preview || ""),
        pinned: Boolean(r.pinned),
        lastMessageAt: r.updatedAt ?? r.createdAt ?? new Date(),
      })),
    });
  } catch (err) {
    const detail = err instanceof Error ? err.message : String(err);
    // eslint-disable-next-line no-console
    console.error("[GET /v1/conversations]", detail);
    return res.status(500).json({
      error: "Could not fetch conversations.",
      detail,
    });
  }
});

app.patch("/v1/conversations/:conversationId", requireFirebaseAuth, async (req, res) => {
  try {
    await connectMongo();
    const uid = req.user?.uid;
    if (!uid) return res.status(401).json({ error: "Unauthorized" });
    const rawId = typeof req.params.conversationId === "string" ? req.params.conversationId : "";
    const resolvedConversationId = normalizeConversationId(rawId);
    const { title, pinned } = (req.body || {}) as { title?: string; pinned?: boolean };

    const update: Record<string, unknown> = {};
    if (typeof title === "string") {
      update.title = makeConversationTitleFromMessage(title);
      update.manualTitle = true;
    }
    if (typeof pinned === "boolean") {
      update.pinned = pinned;
    }
    if (Object.keys(update).length === 0) {
      return res.status(400).json({ error: "No valid fields to update." });
    }

    const doc = await Conversation.findOneAndUpdate(
      { uid, conversationId: resolvedConversationId },
      { $set: update, $setOnInsert: { title: "New Chat", preview: "", pinned: false } },
      { upsert: true, returnDocument: "after" }
    ).lean();

    return res.json({ ok: true, conversation: doc });
  } catch {
    return res.status(500).json({ error: "Could not update conversation." });
  }
});

app.delete("/v1/conversations/:conversationId", requireFirebaseAuth, async (req, res) => {
  try {
    await connectMongo();
    const uid = req.user?.uid;
    if (!uid) return res.status(401).json({ error: "Unauthorized" });
    const rawId = typeof req.params.conversationId === "string" ? req.params.conversationId : "";
    const resolvedConversationId = normalizeConversationId(rawId);

    await Conversation.deleteOne({ uid, conversationId: resolvedConversationId });
    await ConversationMessage.deleteMany({ uid, conversationId: resolvedConversationId });
    return res.json({ ok: true });
  } catch {
    return res.status(500).json({ error: "Could not delete conversation." });
  }
});

app.delete("/v1/conversations", requireFirebaseAuth, async (req, res) => {
  try {
    await connectMongo();
    const uid = req.user?.uid;
    if (!uid) return res.status(401).json({ error: "Unauthorized" });

    await Conversation.deleteMany({ uid });
    await ConversationMessage.deleteMany({ uid });
    return res.json({ ok: true });
  } catch {
    return res.status(500).json({ error: "Could not delete chats." });
  }
});

app.post("/v1/account/clear-all-data", requireFirebaseAuth, async (req, res) => {
  try {
    await connectMongo();
    const uid = req.user?.uid;
    if (!uid) return res.status(401).json({ error: "Unauthorized" });

    await Conversation.deleteMany({ uid });
    await ConversationMessage.deleteMany({ uid });
    await UserProfile.deleteOne({ uid });
    return res.json({ ok: true });
  } catch {
    return res.status(500).json({ error: "Could not clear account data." });
  }
});

app.post("/v1/auth/logout-all-devices", requireFirebaseAuth, async (req, res) => {
  try {
    const uid = req.user?.uid;
    if (!uid) return res.status(401).json({ error: "Unauthorized" });
    await admin.auth().revokeRefreshTokens(uid);
    return res.json({ ok: true });
  } catch {
    return res.status(500).json({ error: "Could not logout from all devices." });
  }
});

app.get("/v1/export", requireFirebaseAuth, async (req, res) => {
  try {
    await connectMongo();
    const uid = req.user?.uid;
    if (!uid) return res.status(401).json({ error: "Unauthorized" });
    const conversations = await Conversation.find({ uid }).sort({ updatedAt: -1 }).lean();
    const result = await Promise.all(
      conversations.map(async (conv) => {
        const messages = await ConversationMessage.find({ uid, conversationId: conv.conversationId })
          .sort({ createdAt: 1 })
          .lean();
        return {
          conversationId: conv.conversationId,
          title: conv.title,
          pinned: conv.pinned,
          createdAt: conv.createdAt,
          updatedAt: conv.updatedAt,
          messages: messages.map((m) => ({
            role: m.role,
            content: m.content,
            createdAt: m.createdAt,
          })),
        };
      })
    );
    return res.json({ exportedAt: new Date().toISOString(), conversations: result });
  } catch {
    return res.status(500).json({ error: "Could not export data." });
  }
});

app.get("/v1/conversations/:conversationId/messages", requireFirebaseAuth, async (req, res) => {
  try {
    await connectMongo();
    const uid = req.user?.uid;
    if (!uid) return res.status(401).json({ error: "Unauthorized" });

    const rawId = typeof req.params.conversationId === "string" ? req.params.conversationId : "";
    const resolvedConversationId = normalizeConversationId(rawId);
    const limitRaw =
      typeof req.query.limit === "string" ? Number(req.query.limit) : 80;
    const limit = Number.isFinite(limitRaw)
      ? Math.max(1, Math.min(120, limitRaw))
      : 80;

    const docs = await ConversationMessage.find({
      uid,
      conversationId: resolvedConversationId,
    })
      .sort({ createdAt: 1 })
      .limit(limit)
      .lean();

    return res.json({
      conversationId: resolvedConversationId,
      messages: docs.map((d) => ({
        id: String(d._id),
        role: d.role === "user" ? "user" : "ai",
        content: d.content,
        createdAt: d.createdAt,
      })),
    });
  } catch (err) {
    const detail = err instanceof Error ? err.message : String(err);
    // eslint-disable-next-line no-console
    console.error("[GET /v1/conversations/:id/messages]", detail);
    return res.status(500).json({
      error: "Could not fetch conversation messages.",
      detail,
    });
  }
});

app.post("/v1/chat", requireFirebaseAuth, async (req, res) => {
  try {
    await connectMongo();

    const uid = req.user?.uid;
    if (!uid) return res.status(401).json({ error: "Unauthorized" });

    const { message, personality, mode, conversationId } = (req.body || {}) as {
      message?: string;
      personality?: "Simi" | "Loa" | string;
      mode?:
        | "personal"
        | "education"
        | "web"
        | "study"
        | "thinking"
        | "business"
        | string;
      conversationId?: string;
    };

    if (!message?.trim()) {
      return res.status(400).json({ error: "message is required" });
    }

    const cleanedMessage = stripModeHashtags(message.trim()) || message.trim();
    const hashMode = extractModeFromHashtag(message);
    const requestedMode = normalizeMode(mode);
    const inferredMode = inferModeFromMessage(cleanedMessage);
    const autoWeb = shouldAutoUseWebSearch(cleanedMessage);
    const resolvedMode =
      hashMode ??
      (requestedMode !== "personal" && inferredMode === "personal"
        ? requestedMode
        : inferredMode !== requestedMode
          ? inferredMode
          : requestedMode);
    const effectiveMode = autoWeb ? "web" : resolvedMode;

    const profile = await UserProfile.findOne({ uid }).lean();
    const allowMemory = profile?.memorySettings?.allowMemory !== false;
    const referenceChatHistory = profile?.memorySettings?.referenceChatHistory !== false;
    const resolvedPersonality =
      personality === "Simi" || personality === "Loa"
        ? personality
        : (profile?.selectedPersonality as "Simi" | "Loa" | undefined) || "Simi";
    const resolvedConversationId = normalizeConversationId(conversationId);

    const mood = detectMood(cleanedMessage);
    const memorySignals = extractMemorySignals(cleanedMessage);
    const autoSignals = extractAutoLearningSignals(cleanedMessage);
    const profileSignals = extractProfileSignals(cleanedMessage);
    const todayKey = getDayKey();
    const dailyMessageLimit = Number(process.env.DAILY_MESSAGE_LIMIT || "120");
    const dailyWebSearchLimit = Number(process.env.DAILY_WEB_SEARCH_LIMIT || "25");
    const currentUsage = profile?.usage ?? {
      dayKey: todayKey,
      messagesToday: 0,
      webSearchesToday: 0,
    };
    const normalizedUsage =
      currentUsage.dayKey === todayKey
        ? currentUsage
        : { dayKey: todayKey, messagesToday: 0, webSearchesToday: 0 };

    if (normalizedUsage.messagesToday >= dailyMessageLimit) {
      return res.status(429).json({
        error: "Daily message limit reached.",
        usage: { messagesLeft: 0, webSearchLeft: Math.max(0, dailyWebSearchLimit - normalizedUsage.webSearchesToday) },
      });
    }
    if (
      effectiveMode === "web" &&
      normalizedUsage.webSearchesToday >= dailyWebSearchLimit
    ) {
      return res.status(429).json({
        error: "Daily web search limit reached.",
        usage: { messagesLeft: Math.max(0, dailyMessageLimit - normalizedUsage.messagesToday), webSearchLeft: 0 },
      });
    }

    const name = profile?.name ?? null;
    const fallback = buildCompanionReply({
      message: cleanedMessage,
      personality: resolvedPersonality,
      name,
    });

    const nvidiaKey = process.env.NVIDIA_API_KEY;
    let reply = fallback;

    let sources: Array<{ title: string; link: string }> = [];

    const isIncognito = profile?.privacy?.incognitoChatMode === true;

    // Save current user message first (so fetch includes latest turn) unless incognito.
    let savedUserMessage:
      | {
          _id: unknown;
          conversationId: string;
          role: string;
        }
      | undefined;
    if (!isIncognito) {
      const saved = await ConversationMessage.create({
        uid,
        conversationId: resolvedConversationId,
        role: "user",
        content: cleanedMessage,
        personality: resolvedPersonality,
        mode: effectiveMode,
      });
      savedUserMessage = {
        _id: saved._id,
        conversationId: saved.conversationId,
        role: saved.role,
      };
      const existingConversation = await Conversation.findOne({
        uid,
        conversationId: resolvedConversationId,
      })
        .select({ manualTitle: 1, title: 1 })
        .lean();
      const shouldAutoTitle = !existingConversation?.manualTitle;
      await Conversation.findOneAndUpdate(
        { uid, conversationId: resolvedConversationId },
        {
          $set: {
            preview: cleanedMessage.trim(),
            updatedAt: new Date(),
            ...(shouldAutoTitle
              ? { title: makeConversationTitleFromMessage(cleanedMessage) }
              : {}),
          },
          $setOnInsert: {
            pinned: false,
            manualTitle: false,
            createdAt: new Date(),
          },
        },
        { upsert: true, returnDocument: "after" }
      );
    }
    // Fetch recent turns in correct order: oldest -> newest.
    const shortTerm = !isIncognito && referenceChatHistory
      ? await ConversationMessage.aggregate<{
          role: "user" | "ai";
          content: string;
          createdAt: Date;
        }>([
          { $match: { uid, conversationId: resolvedConversationId } },
          { $sort: { createdAt: -1 } },
          { $limit: SHORT_TERM_CONTEXT_LIMIT },
          { $sort: { createdAt: 1 } },
          { $project: { role: 1, content: 1, createdAt: 1 } },
        ])
      : [];
    // Pull recent user messages from older chats for cross-chat continuity.
    const pastUserMessages = !isIncognito && referenceChatHistory
      ? await ConversationMessage.find({
          uid,
          role: "user",
          conversationId: { $ne: resolvedConversationId },
        })
          .sort({ createdAt: -1 })
          .limit(CROSS_CHAT_MEMORY_FETCH_LIMIT)
          .select({ content: 1, createdAt: 1, _id: 0 })
          .lean()
      : [];
    const pastMemoryLines = !isIncognito && referenceChatHistory
      ? pastUserMessages
          .reverse()
          .slice(-CROSS_CHAT_MEMORY_INCLUDE_LIMIT)
          .map((m) => `- ${compactText(String(m.content || ""))}`)
          .filter((line) => line !== "-")
      : [];

    const inferredNameFromHistory = inferNameFromConversationThread(shortTerm);
    const inferredOccupationFromHistory =
      inferOccupationFromConversationThread(shortTerm);
    const knownOccupation =
      profileSignals.occupation ??
      (profile?.preferences ?? [])
        .find((p) => p.toLowerCase().startsWith("occupation:"))
        ?.split(":")[1]
        ?.trim() ??
      inferredOccupationFromHistory ??
      null;
    const knownName =
      profileSignals.name ?? profile?.name ?? inferredNameFromHistory ?? null;

    const resolvedDisplayName = knownName ?? profile?.name ?? null;
    if (
      !isIncognito &&
      allowMemory &&
      resolvedDisplayName &&
      resolvedDisplayName !== profile?.name
    ) {
      await UserProfile.updateOne(
        { uid },
        {
          $set: {
            name: resolvedDisplayName,
            "about.nickname": resolvedDisplayName,
          },
        }
      ).catch(() => {
        /* non-fatal: final profile patch still runs */
      });
    }

    if (isAskingOwnName(cleanedMessage)) {
      const prefs = mergeOccupationPreference(
        mergePreferences(profile?.preferences ?? [], profileSignals.language),
        profileSignals.occupation
      );
      const preferredLanguage =
        (
          profileSignals.language ??
          profile?.languagePreference ??
          prefs
            .find((p) => p.toLowerCase().startsWith("language:"))
            ?.split(":")[1]
            ?.trim()
        ) || "auto";
      if (knownName) {
        reply =
          preferredLanguage === "hindi" || /mera|naam|hindi/i.test(cleanedMessage)
            ? `Aapka naam ${knownName} hai.`
            : `Your name is ${knownName}.`;
      }
    }

    if (isAskingOwnRole(cleanedMessage) && knownOccupation) {
      const preferredLanguage =
        (
          profileSignals.language ??
          profile?.languagePreference ??
          (profile?.preferences ?? [])
            .find((p) => p.toLowerCase().startsWith("language:"))
            ?.split(":")[1]
            ?.trim()
        ) || "auto";
      reply =
        preferredLanguage === "hindi" || /mera|main|kya|hindi/i.test(cleanedMessage)
          ? `Aap ${knownOccupation} ho.`
          : `You are a ${knownOccupation}.`;
    }

    if (nvidiaKey) {
      const existingPreferences = profile?.preferences ?? [];
      const mergedPreferences = mergeOccupationPreference(
        mergePreferences(existingPreferences, profileSignals.language),
        profileSignals.occupation
      );
      const mergedInterests = toUniqueLimited(
        [...(profile?.interests ?? []), ...autoSignals.interests],
        12
      );
      const mergedGoals = toUniqueLimited(
        [...(profile?.goals ?? []), ...autoSignals.goals],
        12
      );
      const mergedHabits = toUniqueLimited(
        [...(profile?.habits ?? []), ...autoSignals.habits],
        12
      );
      const preferredLanguage =
        (
          profileSignals.language ??
          profile?.languagePreference ??
          mergedPreferences
            .find((p) => p.toLowerCase().startsWith("language:"))
            ?.split(":")[1]
            ?.trim()
        ) || "auto";

      const ms = profile?.memorySummary;
      const memorySummaryBlock =
        allowMemory && ms
          ? `\nLong-term memory summary (use naturally when relevant):\n- Goals/themes: ${
              (ms.goals ?? []).slice(0, 10).join("; ") || "None"
            }\n- Habits: ${(ms.habits ?? []).slice(0, 10).join("; ") || "None"}\n- Repeated topics: ${
              (ms.repeatedTopics ?? []).slice(0, 12).join(", ") || "None"
            }`
          : "";

      const userProfileText = `Name: ${
        profile?.about?.nickname ?? knownName ?? "Unknown"
      }\nMood: ${
        profile?.mood ?? "Unknown"
      }\nAbout: ${
        profile?.about?.moreAboutYou ?? profile?.bio ?? "None"
      }\nOccupation: ${
        profile?.about?.occupation ?? knownOccupation ?? "Unknown"
      }\nPreferred language: ${preferredLanguage}\nInterests: ${
        mergedInterests.join(", ") || "None"
      }\nGoals: ${
        mergedGoals.join(", ") || "None"
      }\nHabits: ${
        mergedHabits.join(", ") || "None"
      }\nPreferences: ${
        mergedPreferences.join(", ") || "None"
      }\nSelected personality: ${resolvedPersonality}${memorySummaryBlock}`;

      let systemPrompt = buildSystemPrompt(
        resolvedPersonality as Personality,
        userProfileText
      );
      systemPrompt += `\nMode instruction:\n${buildModePrompt(effectiveMode)}\n`;
      systemPrompt +=
        "\nContinuity rules: Keep context from previous turns in the same chat. If user asks to speak in a language, continue in that language until user changes it. If user has shared their name, remember and use it naturally.";
      if (knownName) {
        systemPrompt += `\nUser name on file (from memory): ${knownName}. Use it naturally; do not claim you forgot it if it appears here or in recent messages.\n`;
      }
      if (hashMode || inferredMode !== requestedMode || autoWeb) {
        systemPrompt += `\nAuto mode intelligence (internal): Requested mode = ${requestedMode}; Hashtag mode = ${hashMode ?? "none"}; Inferred mode = ${inferredMode}; Effective mode = ${effectiveMode}. Follow effective mode silently.`;
      }
      if (allowMemory && pastMemoryLines.length) {
        systemPrompt += `\nPast chat memory (use only if relevant):\n${pastMemoryLines.join(
          "\n"
        )}\n`;
      }

      if (effectiveMode === "web") {
        const results = await runWebSearch(cleanedMessage.trim());
        if (results === null || results.length === 0) {
          return res.json({
            reply: "I couldn't find the latest information.",
            mode: effectiveMode,
            sources: [],
          });
        }
        sources = results
          .map((r: { title: string; link: string }) => ({
            title: r.title,
            link: r.link,
          }))
          .slice(0, 7);

        const resultText = results
          .map(
            (r: { rank: number; title: string; snippet: string; link: string }) =>
              `${r.rank}. ${r.title}\nSnippet: ${r.snippet}\nLink: ${r.link}`
          )
          .join("\n\n");

        systemPrompt += `\nYou are an AI assistant. Use the following real-time search results to answer accurately:\n\n${resultText}\n\nNow answer the user's question clearly, factually, and in detail. Include relevant links if useful.\n`;
      }

      const nvidiaMessages: ChatMessage[] = [
        { role: "system", content: systemPrompt },
        ...shortTerm.map<ChatMessage>((m) => ({
          role: (m.role === "user" ? "user" : "assistant") as ChatMessage["role"],
          content: m.content,
        })),
      ];

      try {
        const ai = await callNvidiaChatCompletions({
          apiKey: nvidiaKey,
          messages: nvidiaMessages,
          max_tokens: 2000,
          temperature: 0.72,
          top_p: 0.9,
        });
        if (ai) {
          reply = ai;
        }
      } catch {
        reply = fallback;
      }
    }

    // Update long-term memory fields
    const profilePatch: Record<string, unknown> = {
      selectedPersonality: resolvedPersonality,
      name: (knownName ?? profile?.name) ?? null,
      languagePreference:
        (profileSignals.language as "hindi" | "english" | "hinglish" | null) ??
        (profile?.languagePreference ?? null),
      mood: mood ?? profile?.mood ?? null,
      preferences: mergeOccupationPreference(
        mergePreferences(profile?.preferences ?? [], profileSignals.language),
        profileSignals.occupation
      ),
      usage: {
        dayKey: todayKey,
        messagesToday: normalizedUsage.messagesToday + 1,
        webSearchesToday:
          normalizedUsage.webSearchesToday + (effectiveMode === "web" ? 1 : 0),
      },
    };
    if (resolvedDisplayName) {
      profilePatch.about = {
        nickname: resolvedDisplayName,
        occupation: profile?.about?.occupation ?? null,
        moreAboutYou: profile?.about?.moreAboutYou ?? null,
      };
    }
    if (!isIncognito && allowMemory) {
      profilePatch.interests = toUniqueLimited(
        [...(profile?.interests ?? []), ...autoSignals.interests],
        12
      );
      profilePatch.goals = toUniqueLimited(
        [...(profile?.goals ?? []), ...autoSignals.goals],
        12
      );
      profilePatch.habits = toUniqueLimited(
        [...(profile?.habits ?? []), ...autoSignals.habits],
        12
      );
      profilePatch.memorySummary = {
        goals: toUniqueLimited([
          ...(profile?.memorySummary?.goals ?? []),
          ...memorySignals.goals,
        ]),
        habits: toUniqueLimited([
          ...(profile?.memorySummary?.habits ?? []),
          ...memorySignals.habits,
        ]),
        repeatedTopics: toUniqueLimited([
          ...(profile?.memorySummary?.repeatedTopics ?? []),
          ...memorySignals.repeatedTopics,
          ...autoSignals.repeatedTopics,
        ]),
        lastUpdatedAt: new Date(),
      };
    }

    await UserProfile.findOneAndUpdate(
      { uid },
      {
        $set: profilePatch,
      },
      { upsert: true }
    );

    // Store AI reply
    if (!isIncognito) {
      await ConversationMessage.create({
        uid,
        conversationId: resolvedConversationId,
        role: "ai",
        content: reply,
        personality: resolvedPersonality,
        mode: effectiveMode,
      });
      await Conversation.updateOne(
        { uid, conversationId: resolvedConversationId },
        { $set: { preview: reply, updatedAt: new Date() } }
      );
    }

    // In Phase 1 we return reply; shortTerm is available for future prompt building.
    return res.json({
      reply,
      mode: effectiveMode,
      conversationId: resolvedConversationId,
      memory: { shortTermSize: shortTerm.length },
      usage: {
        messagesLeft: Math.max(0, dailyMessageLimit - (normalizedUsage.messagesToday + 1)),
        webSearchLeft: Math.max(
          0,
          dailyWebSearchLimit -
            (normalizedUsage.webSearchesToday + (effectiveMode === "web" ? 1 : 0))
        ),
      },
      sources,
    });
  } catch {
    return res
      .status(500)
      .json({ error: "MongoDB not configured or unavailable." });
  }
});

app.post("/v1/bihar-ai/chat", requireFirebaseAuth, async (req, res) => {
  try {
    await connectMongo();

    const uid = req.user?.uid;
    if (!uid) return res.status(401).json({ error: "Unauthorized" });

    const {
      message,
      category,
      district,
      webSearch,
      conversationId,
      categoryAuto: categoryAutoRaw,
    } = (req.body || {}) as {
      message?: string;
      category?: string;
      district?: string;
      webSearch?: boolean;
      conversationId?: string;
      /** When true (default), category is detected from the message; user-selected category is ignored. */
      categoryAuto?: boolean;
    };

    if (!message?.trim()) {
      return res.status(400).json({ error: "message is required" });
    }

    const messageTrimmed = message.trim();
    const categoryAutoExplicit =
      typeof categoryAutoRaw === "boolean" ? categoryAutoRaw : undefined;
    const categoryAuto =
      categoryAutoExplicit === true ||
      (categoryAutoExplicit !== false &&
        (typeof category === "string" && category.trim().toLowerCase() === "auto"));

    let resolvedCategory: BiharCategory;
    let categoriesDetected: BiharCategory[] = [];
    if (categoryAuto) {
      categoriesDetected = detectBiharCategoriesFromMessage(messageTrimmed);
      resolvedCategory = resolvePrimaryBiharCategory(categoriesDetected);
    } else {
      const c = normalizeBiharCategory(category);
      if (!c) {
        return res.status(400).json({
          error:
            "Invalid category. Expected one of: education, news, politics, culture, student_help, jobs, agriculture — or use categoryAuto with category \"auto\".",
        });
      }
      resolvedCategory = c;
    }

    const districtRaw =
      typeof district === "string" && district.trim()
        ? district.trim().toLowerCase().replace(/\s+/g, "_")
        : "all";

    const webFromToggle = Boolean(webSearch);
    const webFromKeywords = suggestBiharWebFromMessage(messageTrimmed);
    const effectiveWeb = webFromToggle || webFromKeywords;
    const webAutoBoost = !webFromToggle && webFromKeywords;
    const resolvedConversationId = normalizeConversationId(conversationId);

    const profile = await UserProfile.findOne({ uid }).lean();
    const allowMemory = profile?.memorySettings?.allowMemory !== false;
    const referenceChatHistory =
      profile?.memorySettings?.referenceChatHistory !== false;
    const isIncognito = profile?.privacy?.incognitoChatMode === true;

    const todayKey = getDayKey();
    const dailyMessageLimit = Number(process.env.DAILY_MESSAGE_LIMIT || "120");
    const dailyWebSearchLimit = Number(
      process.env.DAILY_WEB_SEARCH_LIMIT || "25"
    );
    const currentUsage = profile?.usage ?? {
      dayKey: todayKey,
      messagesToday: 0,
      webSearchesToday: 0,
    };
    const normalizedUsage =
      currentUsage.dayKey === todayKey
        ? currentUsage
        : { dayKey: todayKey, messagesToday: 0, webSearchesToday: 0 };

    if (normalizedUsage.messagesToday >= dailyMessageLimit) {
      return res.status(429).json({
        error: "Daily message limit reached.",
        usage: {
          messagesLeft: 0,
          webSearchLeft: Math.max(
            0,
            dailyWebSearchLimit - normalizedUsage.webSearchesToday
          ),
        },
      });
    }
    if (effectiveWeb && normalizedUsage.webSearchesToday >= dailyWebSearchLimit) {
      return res.status(429).json({
        error: "Daily web search limit reached.",
        usage: {
          messagesLeft: Math.max(
            0,
            dailyMessageLimit - normalizedUsage.messagesToday
          ),
          webSearchLeft: 0,
        },
      });
    }

    const resolvedPersonality: Personality =
      profile?.selectedPersonality === "Loa" ? "Loa" : "Simi";
    const storageMode = effectiveWeb
      ? `bihar-web:${resolvedCategory}`
      : `bihar:${resolvedCategory}`;

    const name = profile?.name ?? null;
    let reply = buildCompanionReply({
      message,
      personality: resolvedPersonality,
      name,
    });

    const nvidiaKey = process.env.NVIDIA_API_KEY;
    let sources: Array<{ title: string; link: string }> = [];

    let savedUserMessage:
      | {
          _id: unknown;
          conversationId: string;
          role: string;
        }
      | undefined;

    if (!isIncognito) {
      const saved = await ConversationMessage.create({
        uid,
        conversationId: resolvedConversationId,
        role: "user",
        content: message,
        personality: resolvedPersonality,
        mode: storageMode,
      });
      savedUserMessage = {
        _id: saved._id,
        conversationId: saved.conversationId,
        role: saved.role,
      };
      const existingConversation = await Conversation.findOne({
        uid,
        conversationId: resolvedConversationId,
      })
        .select({ manualTitle: 1, title: 1 })
        .lean();
      const shouldAutoTitle = !existingConversation?.manualTitle;
      await Conversation.findOneAndUpdate(
        { uid, conversationId: resolvedConversationId },
        {
          $set: {
            preview: message.trim(),
            updatedAt: new Date(),
            ...(shouldAutoTitle
              ? { title: makeConversationTitleFromMessage(message) }
              : {}),
          },
          $setOnInsert: {
            pinned: false,
            manualTitle: false,
            createdAt: new Date(),
          },
        },
        { upsert: true, returnDocument: "after" }
      );
    }

    const shortTerm =
      !isIncognito && referenceChatHistory
        ? await ConversationMessage.aggregate<{
            role: "user" | "ai";
            content: string;
            createdAt: Date;
          }>([
            { $match: { uid, conversationId: resolvedConversationId } },
            { $sort: { createdAt: -1 } },
            { $limit: SHORT_TERM_CONTEXT_LIMIT },
            { $sort: { createdAt: 1 } },
            { $project: { role: 1, content: 1, createdAt: 1 } },
          ])
        : [];

    const pastUserMessages =
      !isIncognito && referenceChatHistory && allowMemory
        ? await ConversationMessage.find({
            uid,
            role: "user",
            conversationId: { $ne: resolvedConversationId },
          })
            .sort({ createdAt: -1 })
            .limit(CROSS_CHAT_MEMORY_FETCH_LIMIT)
            .select({ content: 1, createdAt: 1, _id: 0 })
            .lean()
        : [];
    const pastMemoryLines =
      !isIncognito && referenceChatHistory && allowMemory
        ? pastUserMessages
            .reverse()
            .slice(-CROSS_CHAT_MEMORY_INCLUDE_LIMIT)
            .map((m) => `- ${compactText(String(m.content || ""))}`)
            .filter((line) => line !== "-")
        : [];

    if (nvidiaKey) {
      const mergedPreferences = profile?.preferences ?? [];
      const mergedInterests = toUniqueLimited(profile?.interests ?? [], 12);
      const mergedGoals = toUniqueLimited(profile?.goals ?? [], 12);
      const mergedHabits = toUniqueLimited(profile?.habits ?? [], 12);
      const preferredLanguage =
        (
          profile?.languagePreference ??
          mergedPreferences
            .find((p) => p.toLowerCase().startsWith("language:"))
            ?.split(":")[1]
            ?.trim()
        ) || "auto";

      const userProfileText = `Name: ${profile?.about?.nickname ?? profile?.name ?? "Unknown"}
Preferred language: ${preferredLanguage}
Interests: ${mergedInterests.join(", ") || "None"}
Goals: ${mergedGoals.join(", ") || "None"}
Habits: ${mergedHabits.join(", ") || "None"}
Preferences: ${mergedPreferences.join(", ") || "None"}
Bihar AI session category: ${resolvedCategory}
Bihar district filter: ${districtRaw}
Category mode: ${categoryAuto ? "auto" : "user-locked"}`;

      const hybridList = categoryAuto
        ? categoriesDetected.length > 0
          ? categoriesDetected
          : [resolvedCategory]
        : [resolvedCategory];

      let systemPrompt = buildBiharSystemPrompt({
        category: resolvedCategory,
        district: districtRaw,
        userProfileText,
        webSearchEnabled: effectiveWeb,
        crossChatMemoryLines: pastMemoryLines,
        categorySource: categoryAuto ? "auto" : "user",
        hybridCategories: hybridList,
        webBoostedByKeywords: webAutoBoost,
      });

      if (effectiveWeb) {
        const results = await runWebSearch(messageTrimmed);
        if (results === null || results.length === 0) {
          return res.json({
            reply: "I couldn't find the latest information.",
            category: resolvedCategory,
            categoriesDetected,
            categoryAuto,
            district: districtRaw,
            webSearch: true,
            webSearchEffective: true,
            webAutoBoost,
            conversationId: resolvedConversationId,
            sources: [],
            usage: {
              messagesLeft: Math.max(
                0,
                dailyMessageLimit - normalizedUsage.messagesToday
              ),
              webSearchLeft: Math.max(
                0,
                dailyWebSearchLimit - normalizedUsage.webSearchesToday
              ),
            },
          });
        }
        sources = results
          .map((r: { title: string; link: string }) => ({
            title: r.title,
            link: r.link,
          }))
          .slice(0, 7);

        const resultText = results
          .map(
            (r: {
              rank: number;
              title: string;
              snippet: string;
              link: string;
            }) =>
              `${r.rank}. ${r.title}\nSnippet: ${r.snippet}\nLink: ${r.link}`
          )
          .join("\n\n");

        systemPrompt += `\nUse the following search results to answer accurately:\n\n${resultText}\n`;
      }

      const nvidiaMessages: ChatMessage[] = [
        { role: "system", content: systemPrompt },
        ...shortTerm.map<ChatMessage>((m) => ({
          role: (m.role === "user" ? "user" : "assistant") as ChatMessage["role"],
          content: m.content,
        })),
      ];

      try {
        const ai = await callNvidiaChatCompletions({
          apiKey: nvidiaKey,
          messages: nvidiaMessages,
          max_tokens: 1800,
          temperature: 0.68,
          top_p: 0.88,
        });
        if (ai) reply = ai;
      } catch {
        reply = buildCompanionReply({
          message,
          personality: resolvedPersonality,
          name,
        });
      }
    }

    await UserProfile.findOneAndUpdate(
      { uid },
      {
        $set: {
          usage: {
            dayKey: todayKey,
            messagesToday: normalizedUsage.messagesToday + 1,
            webSearchesToday:
              normalizedUsage.webSearchesToday + (effectiveWeb ? 1 : 0),
          },
        },
      },
      { upsert: true }
    );

    if (!isIncognito) {
      await ConversationMessage.create({
        uid,
        conversationId: resolvedConversationId,
        role: "ai",
        content: reply,
        personality: resolvedPersonality,
        mode: storageMode,
      });
      await Conversation.updateOne(
        { uid, conversationId: resolvedConversationId },
        { $set: { preview: reply, updatedAt: new Date() } }
      );
    }

    return res.json({
      reply,
      category: resolvedCategory,
      categoriesDetected,
      categoryAuto,
      district: districtRaw,
      webSearch: webFromToggle,
      webSearchEffective: effectiveWeb,
      webAutoBoost,
      conversationId: resolvedConversationId,
      memory: { shortTermSize: shortTerm.length },
      usage: {
        messagesLeft: Math.max(
          0,
          dailyMessageLimit - (normalizedUsage.messagesToday + 1)
        ),
        webSearchLeft: Math.max(
          0,
          dailyWebSearchLimit -
            (normalizedUsage.webSearchesToday + (effectiveWeb ? 1 : 0))
        ),
      },
      sources,
    });
  } catch {
    return res
      .status(500)
      .json({ error: "MongoDB not configured or unavailable." });
  }
});

const port = Number(process.env.PORT || 8080);

const server = app.listen(port, () => {
  console.log(`[evara-backend] listening on port ${port}`);
  startPayablesAutoScan(2 * 60 * 60 * 1000).catch((err) =>
    console.warn("[payables-autoscan] failed to start:", err instanceof Error ? err.message : err)
  );
});

server.on("error", (err) => {
  console.error("[evara-backend] failed to start:", err);
  process.exit(1);
});

process.on("SIGTERM", () => {
  server.close(() => {
    console.log("[evara-backend] graceful shutdown complete");
    process.exit(0);
  });
});

