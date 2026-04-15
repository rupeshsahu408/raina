import express from "express";
import { google } from "googleapis";
import { connectMongo } from "./db";
import { InboxToken } from "./models/InboxToken";
import { callNvidiaChatCompletions } from "./ai/nvidiaClient";

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

function detectIntent(subject: string, snippet: string): IntentLabel {
  const text = `${subject} ${snippet}`.toLowerCase();
  if (/invoice|payment|due|amount|bill|pay now|overdue/i.test(text)) return "Payment";
  if (/meeting|schedule|call|zoom|google meet|calendar|appointment/i.test(text)) return "Meeting";
  if (/issue|bug|problem|error|broken|not working|support|help|urgent/i.test(text)) return "Support";
  if (/pricing|quote|proposal|interested|demo|trial|offer|discount|buy|purchase/i.test(text)) return "Lead";
  if (/unsubscribe|newsletter|promotion|sale|% off|deal|offer/i.test(text)) return "Spam";
  return "FYI";
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
      "https://www.googleapis.com/auth/gmail.readonly",
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
          return {
            id: m.id,
            threadId,
            subject,
            from,
            date,
            snippet,
            summary: snippet.slice(0, 120),
            intent,
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

/**
 * Build a complete RFC-2822 / MIME email that Gmail API can send.
 * Uses multipart/alternative so recipients get both plain-text and HTML.
 */
function buildEmail(opts: {
  to: string; cc?: string; bcc?: string; subject: string;
  bodyHtml: string; inReplyTo?: string;
}): string {
  const { to, cc, bcc, subject, bodyHtml, inReplyTo } = opts;

  const isHtml = /<[a-zA-Z][^>]*>/.test(bodyHtml);

  // Wrap body in a properly styled HTML document
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

  // Base64-encode each MIME part (safest, most compatible encoding)
  const plainB64 = foldBase64(Buffer.from(plainText, "utf8").toString("base64"));
  const htmlB64  = foldBase64(Buffer.from(fullHtml, "utf8").toString("base64"));

  const boundary = `plyndrox_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`;

  const headers = [
    `To: ${to}`,
    cc  ? `Cc: ${cc}`  : "",
    bcc ? `Bcc: ${bcc}` : "",
    `Subject: ${encodeSubject(subject)}`,
    `MIME-Version: 1.0`,
    `Content-Type: multipart/alternative; boundary="${boundary}"`,
    inReplyTo ? `In-Reply-To: <${inReplyTo}>` : "",
    inReplyTo ? `References: <${inReplyTo}>` : "",
  ].filter(Boolean).join("\r\n");

  const body = [
    `--${boundary}`,
    `Content-Type: text/plain; charset="UTF-8"`,
    `Content-Transfer-Encoding: base64`,
    ``,
    plainB64,
    ``,
    `--${boundary}`,
    `Content-Type: text/html; charset="UTF-8"`,
    `Content-Transfer-Encoding: base64`,
    ``,
    htmlB64,
    ``,
    `--${boundary}--`,
  ].join("\r\n");

  return `${headers}\r\n\r\n${body}`;
}

// POST /inbox/reply/send
inboxRouter.post("/reply/send", express.json(), async (req, res) => {
  const uid = (req as any).user?.uid;
  if (!uid) return res.status(401).json({ error: "Unauthorized" });

  const { to, cc, bcc, subject, body, threadId, inReplyTo } = req.body ?? {};

  const toStr      = (typeof to      === "string" ? to      : "").trim();
  const bodyStr    = (typeof body    === "string" ? body    : "").trim();
  const subjectStr = (typeof subject === "string" ? subject : "").trim() || "(no subject)";
  const ccStr      = (typeof cc      === "string" ? cc      : "").trim();
  const bccStr     = (typeof bcc     === "string" ? bcc     : "").trim();

  if (!toStr)   return res.status(400).json({ error: "At least one recipient (To) is required." });
  if (!bodyStr) return res.status(400).json({ error: "Message body cannot be empty." });

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
    });

    // The Gmail API raw field must be base64url of the full RFC-2822 message
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
