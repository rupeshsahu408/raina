"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const cors_1 = __importDefault(require("cors"));
const dotenv_1 = __importDefault(require("dotenv"));
const express_1 = __importDefault(require("express"));
const firebase_admin_1 = __importDefault(require("firebase-admin"));
const crypto_1 = __importDefault(require("crypto"));
const cookie_parser_1 = __importDefault(require("cookie-parser"));
const multer_1 = __importDefault(require("multer"));
const form_data_1 = __importDefault(require("form-data"));
const db_1 = require("./db");
const prompts_1 = require("./ai/prompts");
const nvidiaClient_1 = require("./ai/nvidiaClient");
const UserProfile_1 = require("./models/UserProfile");
const ConversationMessage_1 = require("./models/ConversationMessage");
const Conversation_1 = require("./models/Conversation");
dotenv_1.default.config();
const app = (0, express_1.default)();
app.use((0, cookie_parser_1.default)());
let firebaseReady = false;
function parseServiceAccountJson(raw) {
    let parsed;
    try {
        parsed = JSON.parse(raw);
    }
    catch {
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
    if (firebaseReady)
        return;
    if (firebase_admin_1.default.apps.length) {
        firebaseReady = true;
        return;
    }
    const serviceAccountJson = process.env.FIREBASE_SERVICE_ACCOUNT_JSON ||
        process.env.FIREBASE_ADMIN_SERVICE_ACCOUNT_JSON;
    const serviceAccountPath = process.env.FIREBASE_SERVICE_ACCOUNT_PATH ||
        process.env.FIREBASE_ADMIN_SERVICE_ACCOUNT_PATH;
    const appName = process.env.FIREBASE_ADMIN_APP_NAME;
    if (serviceAccountJson) {
        const parsed = parseServiceAccountJson(serviceAccountJson);
        firebase_admin_1.default.initializeApp({
            credential: firebase_admin_1.default.credential.cert(parsed),
        }, appName);
        firebaseReady = true;
        return;
    }
    if (serviceAccountPath) {
        // eslint-disable-next-line @typescript-eslint/no-var-requires
        const fs = require("fs");
        const parsed = JSON.parse(fs.readFileSync(serviceAccountPath, "utf8"));
        firebase_admin_1.default.initializeApp({
            credential: firebase_admin_1.default.credential.cert(parsed),
        }, appName);
        firebaseReady = true;
        return;
    }
    if (process.env.GOOGLE_APPLICATION_CREDENTIALS) {
        firebase_admin_1.default.initializeApp({
            credential: firebase_admin_1.default.credential.applicationDefault(),
        }, appName);
        firebaseReady = true;
        return;
    }
    throw new Error("Firebase Admin credentials not configured. Set one of: FIREBASE_SERVICE_ACCOUNT_JSON, FIREBASE_SERVICE_ACCOUNT_PATH, or GOOGLE_APPLICATION_CREDENTIALS.");
}
async function requireFirebaseAuth(req, res, next) {
    try {
        initFirebaseAdmin();
    }
    catch (e) {
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
        const decoded = await firebase_admin_1.default.auth().verifyIdToken(token);
        req.user = { uid: decoded.uid, email: decoded.email };
        return next();
    }
    catch {
        return res.status(401).json({ error: "Invalid or expired token" });
    }
}
const isProduction = process.env.NODE_ENV === "production";
function buildCorsOrigin() {
    const raw = process.env.CORS_ORIGIN;
    if (!raw) {
        if (isProduction) {
            console.warn("[cors] CORS_ORIGIN not set in production — all origins allowed. Set CORS_ORIGIN to your Vercel URL.");
            return true;
        }
        return ["http://localhost:3000", "http://localhost:5000"];
    }
    if (raw === "*" || raw === "true")
        return true;
    const origins = raw.split(",").map((s) => s.trim()).filter(Boolean);
    return origins.length === 1 ? origins[0] : origins;
}
const corsOrigin = buildCorsOrigin();
app.use((0, cors_1.default)({
    origin: corsOrigin,
    credentials: true,
}));
app.use(express_1.default.json({ limit: "1mb" }));
app.get("/health", (_req, res) => {
    res.json({ ok: true, service: "evara-backend" });
});
app.get("/api/health", (_req, res) => {
    res.status(200).send("OK");
});
// ── Voice transcription via NVIDIA Whisper ─────────────────────────────────
const audioUpload = (0, multer_1.default)({ storage: multer_1.default.memoryStorage(), limits: { fileSize: 10 * 1024 * 1024 } });
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
        const form = new form_data_1.default();
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
            body: form.getBuffer(),
        });
        if (!nvidiaRes.ok) {
            const errText = await nvidiaRes.text().catch(() => "");
            console.error("[transcribe] NVIDIA error:", nvidiaRes.status, errText);
            res.status(502).json({ error: `Transcription service error (${nvidiaRes.status})` });
            return;
        }
        const data = await nvidiaRes.json();
        const transcript = data?.text ?? data?.transcript ?? "";
        res.json({ transcript });
    }
    catch (err) {
        console.error("[transcribe] error:", err);
        res.status(500).json({ error: "Transcription failed" });
    }
});
function detectMood(text) {
    const t = text.toLowerCase();
    if (/(anxious|anxiety|worried|panic|nervous|scared)/.test(t))
        return "anxious";
    if (/(sad|down|cry|hurt|empty|hopeless)/.test(t))
        return "sad";
    if (/(angry|mad|furious|rage|irritated)/.test(t))
        return "angry";
    if (/(lonely|alone|isolated)/.test(t))
        return "lonely";
    if (/(overwhelmed|stress|stressed|burnt out|burnout)/.test(t))
        return "overwhelmed";
    return null;
}
function buildCompanionReply(args) {
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
const demoSessions = new Map();
function getPersonality(input) {
    return input === "Loa" ? "Loa" : "Simi";
}
function normalizeMode(input) {
    if (input === "web")
        return "web";
    if (input === "education")
        return "education";
    if (input === "study")
        return "study";
    if (input === "thinking")
        return "thinking";
    if (input === "business")
        return "business";
    return "personal";
}
function extractModeFromHashtag(text) {
    const lower = text.toLowerCase();
    if (/(^|\s)#(web|websearch|web-search)\b/.test(lower))
        return "web";
    if (/(^|\s)#(education|learn|learning)\b/.test(lower))
        return "education";
    if (/(^|\s)#(study|revision|exam)\b/.test(lower))
        return "study";
    if (/(^|\s)#(thinking|logic|reasoning)\b/.test(lower))
        return "thinking";
    if (/(^|\s)#(business|startup|money)\b/.test(lower))
        return "business";
    if (/(^|\s)#(personal|chat|friend)\b/.test(lower))
        return "personal";
    return null;
}
function stripModeHashtags(text) {
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
function inferModeFromMessage(text) {
    const lower = text.toLowerCase();
    if (/(latest|today|current|abhi|aaj|update|news|recent|202[0-9]|price now|live)/.test(lower)) {
        return "web";
    }
    if (/(business|startup|revenue|profit|sales|marketing|roi|client|pricing|funding)/.test(lower)) {
        return "business";
    }
    if (/(explain|samjhao|samjha|definition|concept|difference|what is|why does|how does)/.test(lower)) {
        return "education";
    }
    if (/(notes|revision|mcq|short answer|direct answer|exam prep|memorize|ratta|test me)/.test(lower)) {
        return "study";
    }
    if (/(step by step|debug|solve this|approach|strategy|break it down|reason|tradeoff|algorithm)/.test(lower)) {
        return "thinking";
    }
    return "personal";
}
function shouldAutoUseWebSearch(text) {
    return /(latest|today|current|aaj|abhi|update|news|live|price now|new policy|last date|deadline)/i.test(text);
}
function normalizeConversationId(input) {
    const raw = (input || "").trim();
    if (!raw)
        return "default";
    return raw.slice(0, 120);
}
async function runWebSearch(query) {
    const serperKey = process.env.SERPER_API_KEY;
    if (!serperKey)
        return null;
    const resp = await fetch("https://google.serper.dev/search", {
        method: "POST",
        headers: {
            "X-API-KEY": serperKey,
            "Content-Type": "application/json",
        },
        body: JSON.stringify({ q: query, gl: "in", hl: "en" }),
    });
    if (!resp.ok)
        return null;
    const data = await resp.json().catch(() => null);
    const organic = Array.isArray(data?.organic) ? data.organic.slice(0, 7) : [];
    if (!organic.length)
        return [];
    return organic.map((item, idx) => ({
        rank: idx + 1,
        title: String(item?.title ?? "Untitled"),
        snippet: String(item?.snippet ?? ""),
        link: String(item?.link ?? ""),
    }));
}
function getDayKey(now = new Date()) {
    return `${now.getUTCFullYear()}-${String(now.getUTCMonth() + 1).padStart(2, "0")}-${String(now.getUTCDate()).padStart(2, "0")}`;
}
function toUniqueLimited(values, limit = 8) {
    return Array.from(new Set(values.map((v) => v.trim()).filter(Boolean))).slice(0, limit);
}
function extractMemorySignals(text) {
    const t = text.trim();
    const lower = t.toLowerCase();
    const goals = [];
    const habits = [];
    const repeatedTopics = [];
    if (/(goal|plan to|want to|i will|i need to|aim to)/.test(lower)) {
        goals.push(t);
    }
    if (/(daily|every day|habit|routine|usually|often|consistently)/.test(lower)) {
        habits.push(t);
    }
    if (/(study|exam|business|startup|money|stress|anxiety|relationship|career|fitness|health)/.test(lower)) {
        repeatedTopics.push(/(study|exam)/.test(lower)
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
                                : "general");
    }
    return { goals, habits, repeatedTopics };
}
function normalizeTopic(text) {
    const lower = text.toLowerCase();
    if (/(coding|programming|developer|software)/.test(lower))
        return "coding";
    if (/(study|exam|college|school)/.test(lower))
        return "study";
    if (/(business|startup|money|marketing|sales)/.test(lower))
        return "business";
    if (/(fitness|gym|health|workout)/.test(lower))
        return "health/fitness";
    if (/(relationship|dating|love)/.test(lower))
        return "relationships";
    if (/(stress|anxiety|overwhelm|panic)/.test(lower))
        return "stress/anxiety";
    if (/(career|job|interview)/.test(lower))
        return "career";
    return "general";
}
function extractAutoLearningSignals(text) {
    const trimmed = text.trim();
    const lower = trimmed.toLowerCase();
    const interests = [];
    const goals = [];
    const habits = [];
    const repeatedTopics = [];
    const likeMatch = trimmed.match(/(?:i like|i love|i enjoy|mujhe|mujhe bahut pasand hai|pasand hai)\s+([a-zA-Z][a-zA-Z0-9\s'-]{1,40})/i);
    if (likeMatch?.[1]) {
        interests.push(likeMatch[1].split(/[,.!?]/)[0].trim().toLowerCase());
    }
    const goalMatch = trimmed.match(/(?:i want to|i wanna|i need to|my goal is|mujhe|mujhe .* karna hai|goal)\s+([a-zA-Z][a-zA-Z0-9\s'-]{2,70})/i);
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
function normalizeLearnedName(raw) {
    if (!raw)
        return null;
    const t = raw.replace(/\s+/g, " ").trim();
    if (t.length < 2 || t.length > 60)
        return null;
    return t;
}
/** Extract a name the user introduces about themselves (not questions). */
function extractNameIntroFromText(text) {
    const trimmed = text.trim();
    if (!trimmed)
        return null;
    const nameToken = String.raw `([\p{L}][\p{L}\s'-]{0,50})`;
    const patterns = [
        new RegExp(`(?:my name is|i am|i'm|i’m|mera naam|mera name)\\s+${nameToken}(?:\\s+hai)?`, "iu"),
        new RegExp(`\\bmera\\s+naam\\s+hai\\s+${nameToken}\\b`, "iu"),
        new RegExp(`\\bnaam\\s+(?:hai|he)\\s+${nameToken}\\b`, "iu"),
        new RegExp(`\\b(?:call me|this is)\\s+${nameToken}\\b`, "iu"),
        new RegExp(`\\b(?:main|mai)\\s+hoon\\s+${nameToken}\\b`, "iu"),
    ];
    for (const re of patterns) {
        const m = trimmed.match(re);
        if (m?.[1]) {
            const part = m[1]
                .split(/\s+(?:and|or|aur|but)\s+/i)[0]
                ?.split(/[,.!?]/)[0]
                ?.trim() ?? "";
            const n = normalizeLearnedName(part);
            if (n)
                return n;
        }
    }
    return null;
}
function extractProfileSignals(text) {
    const trimmed = text.trim();
    const lower = trimmed.toLowerCase();
    let name = extractNameIntroFromText(trimmed);
    let language = null;
    if (/(hindi bolo|hindi me|in hindi|हिंदी में|हिंदी बोलो|\bhindi\b)/.test(lower)) {
        language = "hindi";
    }
    else if (/(english me|in english|english bolo|\benglish\b)/.test(lower)) {
        language = "english";
    }
    else if (/(hinglish me|in hinglish|hinglish bolo|\bhinglish\b)/.test(lower)) {
        language = "hinglish";
    }
    let occupation = null;
    const occupationMatch = trimmed.match(/(?:i am|i'm|main|mai|mein)\s+(?:a|an)?\s*(doctor|engineer|teacher|student|designer|developer|lawyer|nurse|manager|founder|entrepreneur|businessman|businesswoman)\b/i);
    if (occupationMatch?.[1]) {
        occupation = occupationMatch[1].toLowerCase();
    }
    return { name, language, occupation };
}
function isAskingOwnName(text) {
    const t = text.toLowerCase().replace(/\s+/g, " ").trim();
    if (extractNameIntroFromText(text))
        return false;
    return (/\bwhat is my name\b/.test(t) ||
        /\bwhat'?s my name\b/.test(t) ||
        /\bmera (kya )?(naam|name) (hai|h|he)\b/.test(t) ||
        /\bmera (naam|name) kya (hai|h|he)\b/.test(t) ||
        /\bmera (naam|name) kya\b/.test(t) ||
        /^(mera naam|mera name)\??$/.test(t));
}
function isAskingOwnRole(text) {
    const t = text.toLowerCase();
    return (/\bwhat am i\b/.test(t) ||
        /\bwho am i\b/.test(t) ||
        /\bmera (profession|kaam|role)\b/.test(t) ||
        /\bmain kya hoon\b/.test(t));
}
function inferNameFromConversationThread(turns) {
    const userMsgs = [...turns].filter((m) => m.role === "user").reverse();
    for (const m of userMsgs) {
        if (isAskingOwnName(m.content))
            continue;
        const n = extractNameIntroFromText(m.content);
        if (n)
            return n;
    }
    return null;
}
function inferOccupationFromConversationThread(turns) {
    const re = /(?:i am|i'm|main|mai|mein)\s+(?:a|an)?\s*(doctor|engineer|teacher|student|designer|developer|lawyer|nurse|manager|founder|entrepreneur|businessman|businesswoman)\b/i;
    for (const m of [...turns].filter((u) => u.role === "user").reverse()) {
        const occ = m.content.match(re)?.[1]?.toLowerCase();
        if (occ)
            return occ;
    }
    return null;
}
function compactText(value, max = 140) {
    const oneLine = value.replace(/\s+/g, " ").trim();
    if (oneLine.length <= max)
        return oneLine;
    return `${oneLine.slice(0, max - 1)}…`;
}
function makeConversationTitleFromMessage(message) {
    return compactText(message.replace(/\s+/g, " ").trim(), 60) || "New Chat";
}
function mergePreferences(existing, language) {
    const withoutLanguage = existing.filter((p) => !p.toLowerCase().startsWith("language:"));
    if (!language)
        return withoutLanguage;
    return toUniqueLimited([...withoutLanguage, `language:${language}`], 12);
}
function mergeOccupationPreference(existing, occupation) {
    const withoutOccupation = existing.filter((p) => !p.toLowerCase().startsWith("occupation:"));
    if (!occupation)
        return withoutOccupation;
    return toUniqueLimited([...withoutOccupation, `occupation:${occupation}`], 12);
}
function getSessionId(req, res) {
    const existing = req.cookies?.demo_session;
    if (typeof existing === "string" && existing.trim())
        return existing;
    const id = crypto_1.default.randomUUID();
    res.cookie("demo_session", id, {
        httpOnly: false,
        sameSite: "lax",
        maxAge: 1000 * 60 * 30,
    });
    return id;
}
app.post("/v1/demo-chat", (req, res) => {
    const { message, personality } = (req.body || {});
    if (!message?.trim()) {
        return res.status(400).json({ error: "message is required" });
    }
    const resolvedPersonality = getPersonality(personality);
    const sessionId = getSessionId(req, res);
    const now = Date.now();
    const existing = demoSessions.get(sessionId);
    const session = existing && now - existing.updatedAt < 1000 * 60 * 30
        ? existing
        : { repliesUsed: 0, messages: [], updatedAt: now };
    if (!existing || session !== existing)
        demoSessions.set(sessionId, session);
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
        if (!nvidiaKey)
            return fallback;
        const systemPrompt = (0, prompts_1.buildSystemPrompt)(resolvedPersonality, "Demo user");
        const nvidiaMessages = [
            { role: "system", content: systemPrompt },
            ...session.messages.slice(-10),
        ];
        const reply = await (0, nvidiaClient_1.callNvidiaChatCompletions)({
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
app.get("/v1/profile", requireFirebaseAuth, async (req, res) => {
    try {
        await (0, db_1.connectMongo)();
        const profile = await UserProfile_1.UserProfile.findOne({ uid: req.user?.uid }).lean();
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
    }
    catch {
        return res
            .status(500)
            .json({ error: "MongoDB not configured or unavailable." });
    }
});
app.put("/v1/profile", requireFirebaseAuth, async (req, res) => {
    try {
        await (0, db_1.connectMongo)();
        const uid = req.user?.uid;
        if (!uid)
            return res.status(401).json({ error: "Unauthorized" });
        const { name, photoUrl, bio, selectedPersonality, preferences, mood, languagePreference, interests, goals, habits, about, personalization, memorySettings, privacy, notifications, } = (req.body || {});
        const update = {};
        if (typeof name === "string")
            update.name = name;
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
            update.preferences = toUniqueLimited(preferences.filter((p) => typeof p === "string"), 20);
        }
        if (typeof mood === "string") {
            update.mood = mood;
        }
        if (languagePreference === null ||
            languagePreference === "hindi" ||
            languagePreference === "english" ||
            languagePreference === "hinglish") {
            update.languagePreference = languagePreference;
        }
        if (Array.isArray(interests)) {
            update.interests = toUniqueLimited(interests.filter((x) => typeof x === "string"), 20);
        }
        if (Array.isArray(goals)) {
            update.goals = toUniqueLimited(goals.filter((x) => typeof x === "string"), 20);
        }
        if (Array.isArray(habits)) {
            update.habits = toUniqueLimited(habits.filter((x) => typeof x === "string"), 20);
        }
        if (about && typeof about === "object") {
            update.about = {
                nickname: typeof about.nickname === "string" || about.nickname === null
                    ? about.nickname
                    : undefined,
                occupation: typeof about.occupation === "string" || about.occupation === null
                    ? about.occupation
                    : undefined,
                moreAboutYou: typeof about.moreAboutYou === "string" || about.moreAboutYou === null
                    ? about.moreAboutYou
                    : undefined,
            };
        }
        if (personalization && typeof personalization === "object") {
            update.personalization = {
                theme: personalization.theme === "light" ||
                    personalization.theme === "dark" ||
                    personalization.theme === "auto"
                    ? personalization.theme
                    : undefined,
                accentColor: typeof personalization.accentColor === "string" ||
                    personalization.accentColor === null
                    ? personalization.accentColor
                    : undefined,
                fontSize: personalization.fontSize === "small" ||
                    personalization.fontSize === "medium" ||
                    personalization.fontSize === "large"
                    ? personalization.fontSize
                    : undefined,
                bubbleStyle: personalization.bubbleStyle === "rounded" ||
                    personalization.bubbleStyle === "sharp"
                    ? personalization.bubbleStyle
                    : undefined,
                backgroundStyle: personalization.backgroundStyle === "gradient" ||
                    personalization.backgroundStyle === "image"
                    ? personalization.backgroundStyle
                    : undefined,
                typingSpeed: personalization.typingSpeed === "slow" ||
                    personalization.typingSpeed === "normal" ||
                    personalization.typingSpeed === "fast"
                    ? personalization.typingSpeed
                    : undefined,
            };
        }
        if (memorySettings && typeof memorySettings === "object") {
            update.memorySettings = {
                allowMemory: typeof memorySettings.allowMemory === "boolean"
                    ? memorySettings.allowMemory
                    : undefined,
                referenceChatHistory: typeof memorySettings.referenceChatHistory === "boolean"
                    ? memorySettings.referenceChatHistory
                    : undefined,
            };
        }
        if (privacy && typeof privacy === "object") {
            update.privacy = {
                incognitoChatMode: typeof privacy.incognitoChatMode === "boolean"
                    ? privacy.incognitoChatMode
                    : undefined,
            };
        }
        if (notifications && typeof notifications === "object") {
            update.notifications = {
                enabled: typeof notifications.enabled === "boolean"
                    ? notifications.enabled
                    : undefined,
            };
        }
        const profile = await UserProfile_1.UserProfile.findOneAndUpdate({ uid }, { $set: update }, { upsert: true, new: true }).lean();
        return res.json({ ok: true, profile });
    }
    catch {
        return res
            .status(500)
            .json({ error: "MongoDB not configured or unavailable." });
    }
});
app.post("/v1/memory/clear", requireFirebaseAuth, async (req, res) => {
    try {
        await (0, db_1.connectMongo)();
        const uid = req.user?.uid;
        if (!uid)
            return res.status(401).json({ error: "Unauthorized" });
        await ConversationMessage_1.ConversationMessage.deleteMany({ uid });
        await UserProfile_1.UserProfile.findOneAndUpdate({ uid }, {
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
        }, { upsert: true });
        return res.json({ ok: true });
    }
    catch {
        return res.status(500).json({ error: "Could not clear memory." });
    }
});
app.get("/v1/conversations", requireFirebaseAuth, async (req, res) => {
    try {
        await (0, db_1.connectMongo)();
        const uid = req.user?.uid;
        if (!uid)
            return res.status(401).json({ error: "Unauthorized" });
        const q = typeof req.query.q === "string" ? req.query.q.trim().slice(0, 80) : "";
        const filter = { uid };
        if (q) {
            filter.$text = { $search: q };
        }
        let rows = await Conversation_1.Conversation.find(filter)
            .sort({ pinned: -1, updatedAt: -1 })
            .limit(60)
            .lean();
        if (rows.length === 0 && !q) {
            const grouped = await ConversationMessage_1.ConversationMessage.aggregate([
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
            }));
        }
        return res.json({
            conversations: rows.map((r) => ({
                conversationId: String(r.conversationId),
                title: String(r.title || "New Chat"),
                preview: String(r.preview || ""),
                pinned: Boolean(r.pinned),
                lastMessageAt: r.updatedAt ?? r.createdAt ?? new Date(),
            })),
        });
    }
    catch (err) {
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
        await (0, db_1.connectMongo)();
        const uid = req.user?.uid;
        if (!uid)
            return res.status(401).json({ error: "Unauthorized" });
        const rawId = typeof req.params.conversationId === "string" ? req.params.conversationId : "";
        const resolvedConversationId = normalizeConversationId(rawId);
        const { title, pinned } = (req.body || {});
        const update = {};
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
        const doc = await Conversation_1.Conversation.findOneAndUpdate({ uid, conversationId: resolvedConversationId }, { $set: update, $setOnInsert: { title: "New Chat", preview: "", pinned: false } }, { upsert: true, new: true }).lean();
        return res.json({ ok: true, conversation: doc });
    }
    catch {
        return res.status(500).json({ error: "Could not update conversation." });
    }
});
app.delete("/v1/conversations/:conversationId", requireFirebaseAuth, async (req, res) => {
    try {
        await (0, db_1.connectMongo)();
        const uid = req.user?.uid;
        if (!uid)
            return res.status(401).json({ error: "Unauthorized" });
        const rawId = typeof req.params.conversationId === "string" ? req.params.conversationId : "";
        const resolvedConversationId = normalizeConversationId(rawId);
        await Conversation_1.Conversation.deleteOne({ uid, conversationId: resolvedConversationId });
        await ConversationMessage_1.ConversationMessage.deleteMany({ uid, conversationId: resolvedConversationId });
        return res.json({ ok: true });
    }
    catch {
        return res.status(500).json({ error: "Could not delete conversation." });
    }
});
app.delete("/v1/conversations", requireFirebaseAuth, async (req, res) => {
    try {
        await (0, db_1.connectMongo)();
        const uid = req.user?.uid;
        if (!uid)
            return res.status(401).json({ error: "Unauthorized" });
        await Conversation_1.Conversation.deleteMany({ uid });
        await ConversationMessage_1.ConversationMessage.deleteMany({ uid });
        return res.json({ ok: true });
    }
    catch {
        return res.status(500).json({ error: "Could not delete chats." });
    }
});
app.post("/v1/account/clear-all-data", requireFirebaseAuth, async (req, res) => {
    try {
        await (0, db_1.connectMongo)();
        const uid = req.user?.uid;
        if (!uid)
            return res.status(401).json({ error: "Unauthorized" });
        await Conversation_1.Conversation.deleteMany({ uid });
        await ConversationMessage_1.ConversationMessage.deleteMany({ uid });
        await UserProfile_1.UserProfile.deleteOne({ uid });
        return res.json({ ok: true });
    }
    catch {
        return res.status(500).json({ error: "Could not clear account data." });
    }
});
app.post("/v1/auth/logout-all-devices", requireFirebaseAuth, async (req, res) => {
    try {
        const uid = req.user?.uid;
        if (!uid)
            return res.status(401).json({ error: "Unauthorized" });
        await firebase_admin_1.default.auth().revokeRefreshTokens(uid);
        return res.json({ ok: true });
    }
    catch {
        return res.status(500).json({ error: "Could not logout from all devices." });
    }
});
app.get("/v1/export", requireFirebaseAuth, async (req, res) => {
    try {
        await (0, db_1.connectMongo)();
        const uid = req.user?.uid;
        if (!uid)
            return res.status(401).json({ error: "Unauthorized" });
        const conversations = await Conversation_1.Conversation.find({ uid }).sort({ updatedAt: -1 }).lean();
        const result = await Promise.all(conversations.map(async (conv) => {
            const messages = await ConversationMessage_1.ConversationMessage.find({ uid, conversationId: conv.conversationId })
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
        }));
        return res.json({ exportedAt: new Date().toISOString(), conversations: result });
    }
    catch {
        return res.status(500).json({ error: "Could not export data." });
    }
});
app.get("/v1/conversations/:conversationId/messages", requireFirebaseAuth, async (req, res) => {
    try {
        await (0, db_1.connectMongo)();
        const uid = req.user?.uid;
        if (!uid)
            return res.status(401).json({ error: "Unauthorized" });
        const rawId = typeof req.params.conversationId === "string" ? req.params.conversationId : "";
        const resolvedConversationId = normalizeConversationId(rawId);
        const limitRaw = typeof req.query.limit === "string" ? Number(req.query.limit) : 80;
        const limit = Number.isFinite(limitRaw)
            ? Math.max(1, Math.min(120, limitRaw))
            : 80;
        const docs = await ConversationMessage_1.ConversationMessage.find({
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
    }
    catch (err) {
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
        await (0, db_1.connectMongo)();
        const uid = req.user?.uid;
        if (!uid)
            return res.status(401).json({ error: "Unauthorized" });
        const { message, personality, mode, conversationId } = (req.body || {});
        if (!message?.trim()) {
            return res.status(400).json({ error: "message is required" });
        }
        const cleanedMessage = stripModeHashtags(message.trim()) || message.trim();
        const hashMode = extractModeFromHashtag(message);
        const requestedMode = normalizeMode(mode);
        const inferredMode = inferModeFromMessage(cleanedMessage);
        const autoWeb = shouldAutoUseWebSearch(cleanedMessage);
        const resolvedMode = hashMode ??
            (requestedMode !== "personal" && inferredMode === "personal"
                ? requestedMode
                : inferredMode !== requestedMode
                    ? inferredMode
                    : requestedMode);
        const effectiveMode = autoWeb ? "web" : resolvedMode;
        const profile = await UserProfile_1.UserProfile.findOne({ uid }).lean();
        const allowMemory = profile?.memorySettings?.allowMemory !== false;
        const referenceChatHistory = profile?.memorySettings?.referenceChatHistory !== false;
        const resolvedPersonality = personality === "Simi" || personality === "Loa"
            ? personality
            : profile?.selectedPersonality || "Simi";
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
        const normalizedUsage = currentUsage.dayKey === todayKey
            ? currentUsage
            : { dayKey: todayKey, messagesToday: 0, webSearchesToday: 0 };
        if (normalizedUsage.messagesToday >= dailyMessageLimit) {
            return res.status(429).json({
                error: "Daily message limit reached.",
                usage: { messagesLeft: 0, webSearchLeft: Math.max(0, dailyWebSearchLimit - normalizedUsage.webSearchesToday) },
            });
        }
        if (effectiveMode === "web" &&
            normalizedUsage.webSearchesToday >= dailyWebSearchLimit) {
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
        let sources = [];
        const isIncognito = profile?.privacy?.incognitoChatMode === true;
        // Save current user message first (so fetch includes latest turn) unless incognito.
        let savedUserMessage;
        if (!isIncognito) {
            const saved = await ConversationMessage_1.ConversationMessage.create({
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
            const existingConversation = await Conversation_1.Conversation.findOne({
                uid,
                conversationId: resolvedConversationId,
            })
                .select({ manualTitle: 1, title: 1 })
                .lean();
            const shouldAutoTitle = !existingConversation?.manualTitle;
            await Conversation_1.Conversation.findOneAndUpdate({ uid, conversationId: resolvedConversationId }, {
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
            }, { upsert: true, new: true });
        }
        // Fetch recent turns in correct order: oldest -> newest.
        const shortTerm = !isIncognito && referenceChatHistory
            ? await ConversationMessage_1.ConversationMessage.aggregate([
                { $match: { uid, conversationId: resolvedConversationId } },
                { $sort: { createdAt: -1 } },
                { $limit: SHORT_TERM_CONTEXT_LIMIT },
                { $sort: { createdAt: 1 } },
                { $project: { role: 1, content: 1, createdAt: 1 } },
            ])
            : [];
        // Pull recent user messages from older chats for cross-chat continuity.
        const pastUserMessages = !isIncognito && referenceChatHistory
            ? await ConversationMessage_1.ConversationMessage.find({
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
        const inferredOccupationFromHistory = inferOccupationFromConversationThread(shortTerm);
        const knownOccupation = profileSignals.occupation ??
            (profile?.preferences ?? [])
                .find((p) => p.toLowerCase().startsWith("occupation:"))
                ?.split(":")[1]
                ?.trim() ??
            inferredOccupationFromHistory ??
            null;
        const knownName = profileSignals.name ?? profile?.name ?? inferredNameFromHistory ?? null;
        const resolvedDisplayName = knownName ?? profile?.name ?? null;
        if (!isIncognito &&
            allowMemory &&
            resolvedDisplayName &&
            resolvedDisplayName !== profile?.name) {
            await UserProfile_1.UserProfile.updateOne({ uid }, {
                $set: {
                    name: resolvedDisplayName,
                    "about.nickname": resolvedDisplayName,
                },
            }).catch(() => {
                /* non-fatal: final profile patch still runs */
            });
        }
        if (isAskingOwnName(cleanedMessage)) {
            const prefs = mergeOccupationPreference(mergePreferences(profile?.preferences ?? [], profileSignals.language), profileSignals.occupation);
            const preferredLanguage = (profileSignals.language ??
                profile?.languagePreference ??
                prefs
                    .find((p) => p.toLowerCase().startsWith("language:"))
                    ?.split(":")[1]
                    ?.trim()) || "auto";
            if (knownName) {
                reply =
                    preferredLanguage === "hindi" || /mera|naam|hindi/i.test(cleanedMessage)
                        ? `Aapka naam ${knownName} hai.`
                        : `Your name is ${knownName}.`;
            }
        }
        if (isAskingOwnRole(cleanedMessage) && knownOccupation) {
            const preferredLanguage = (profileSignals.language ??
                profile?.languagePreference ??
                (profile?.preferences ?? [])
                    .find((p) => p.toLowerCase().startsWith("language:"))
                    ?.split(":")[1]
                    ?.trim()) || "auto";
            reply =
                preferredLanguage === "hindi" || /mera|main|kya|hindi/i.test(cleanedMessage)
                    ? `Aap ${knownOccupation} ho.`
                    : `You are a ${knownOccupation}.`;
        }
        if (nvidiaKey) {
            const existingPreferences = profile?.preferences ?? [];
            const mergedPreferences = mergeOccupationPreference(mergePreferences(existingPreferences, profileSignals.language), profileSignals.occupation);
            const mergedInterests = toUniqueLimited([...(profile?.interests ?? []), ...autoSignals.interests], 12);
            const mergedGoals = toUniqueLimited([...(profile?.goals ?? []), ...autoSignals.goals], 12);
            const mergedHabits = toUniqueLimited([...(profile?.habits ?? []), ...autoSignals.habits], 12);
            const preferredLanguage = (profileSignals.language ??
                profile?.languagePreference ??
                mergedPreferences
                    .find((p) => p.toLowerCase().startsWith("language:"))
                    ?.split(":")[1]
                    ?.trim()) || "auto";
            const ms = profile?.memorySummary;
            const memorySummaryBlock = allowMemory && ms
                ? `\nLong-term memory summary (use naturally when relevant):\n- Goals/themes: ${(ms.goals ?? []).slice(0, 10).join("; ") || "None"}\n- Habits: ${(ms.habits ?? []).slice(0, 10).join("; ") || "None"}\n- Repeated topics: ${(ms.repeatedTopics ?? []).slice(0, 12).join(", ") || "None"}`
                : "";
            const userProfileText = `Name: ${profile?.about?.nickname ?? knownName ?? "Unknown"}\nMood: ${profile?.mood ?? "Unknown"}\nAbout: ${profile?.about?.moreAboutYou ?? profile?.bio ?? "None"}\nOccupation: ${profile?.about?.occupation ?? knownOccupation ?? "Unknown"}\nPreferred language: ${preferredLanguage}\nInterests: ${mergedInterests.join(", ") || "None"}\nGoals: ${mergedGoals.join(", ") || "None"}\nHabits: ${mergedHabits.join(", ") || "None"}\nPreferences: ${mergedPreferences.join(", ") || "None"}\nSelected personality: ${resolvedPersonality}${memorySummaryBlock}`;
            let systemPrompt = (0, prompts_1.buildSystemPrompt)(resolvedPersonality, userProfileText);
            systemPrompt += `\nMode instruction:\n${(0, prompts_1.buildModePrompt)(effectiveMode)}\n`;
            systemPrompt +=
                "\nContinuity rules: Keep context from previous turns in the same chat. If user asks to speak in a language, continue in that language until user changes it. If user has shared their name, remember and use it naturally.";
            if (knownName) {
                systemPrompt += `\nUser name on file (from memory): ${knownName}. Use it naturally; do not claim you forgot it if it appears here or in recent messages.\n`;
            }
            if (hashMode || inferredMode !== requestedMode || autoWeb) {
                systemPrompt += `\nAuto mode intelligence (internal): Requested mode = ${requestedMode}; Hashtag mode = ${hashMode ?? "none"}; Inferred mode = ${inferredMode}; Effective mode = ${effectiveMode}. Follow effective mode silently.`;
            }
            if (allowMemory && pastMemoryLines.length) {
                systemPrompt += `\nPast chat memory (use only if relevant):\n${pastMemoryLines.join("\n")}\n`;
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
                    .map((r) => ({
                    title: r.title,
                    link: r.link,
                }))
                    .slice(0, 7);
                const resultText = results
                    .map((r) => `${r.rank}. ${r.title}\nSnippet: ${r.snippet}\nLink: ${r.link}`)
                    .join("\n\n");
                systemPrompt += `\nYou are an AI assistant. Use the following real-time search results to answer accurately:\n\n${resultText}\n\nNow answer the user's question clearly, factually, and in detail. Include relevant links if useful.\n`;
            }
            const nvidiaMessages = [
                { role: "system", content: systemPrompt },
                ...shortTerm.map((m) => ({
                    role: (m.role === "user" ? "user" : "assistant"),
                    content: m.content,
                })),
            ];
            try {
                const ai = await (0, nvidiaClient_1.callNvidiaChatCompletions)({
                    apiKey: nvidiaKey,
                    messages: nvidiaMessages,
                    max_tokens: 2000,
                    temperature: 0.72,
                    top_p: 0.9,
                });
                if (ai) {
                    reply = ai;
                }
            }
            catch {
                reply = fallback;
            }
        }
        // Update long-term memory fields
        const profilePatch = {
            selectedPersonality: resolvedPersonality,
            name: (knownName ?? profile?.name) ?? null,
            languagePreference: profileSignals.language ??
                (profile?.languagePreference ?? null),
            mood: mood ?? profile?.mood ?? null,
            preferences: mergeOccupationPreference(mergePreferences(profile?.preferences ?? [], profileSignals.language), profileSignals.occupation),
            usage: {
                dayKey: todayKey,
                messagesToday: normalizedUsage.messagesToday + 1,
                webSearchesToday: normalizedUsage.webSearchesToday + (effectiveMode === "web" ? 1 : 0),
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
            profilePatch.interests = toUniqueLimited([...(profile?.interests ?? []), ...autoSignals.interests], 12);
            profilePatch.goals = toUniqueLimited([...(profile?.goals ?? []), ...autoSignals.goals], 12);
            profilePatch.habits = toUniqueLimited([...(profile?.habits ?? []), ...autoSignals.habits], 12);
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
        await UserProfile_1.UserProfile.findOneAndUpdate({ uid }, {
            $set: profilePatch,
        }, { upsert: true });
        // Store AI reply
        if (!isIncognito) {
            await ConversationMessage_1.ConversationMessage.create({
                uid,
                conversationId: resolvedConversationId,
                role: "ai",
                content: reply,
                personality: resolvedPersonality,
                mode: effectiveMode,
            });
            await Conversation_1.Conversation.updateOne({ uid, conversationId: resolvedConversationId }, { $set: { preview: reply, updatedAt: new Date() } });
        }
        // In Phase 1 we return reply; shortTerm is available for future prompt building.
        return res.json({
            reply,
            mode: effectiveMode,
            conversationId: resolvedConversationId,
            memory: { shortTermSize: shortTerm.length },
            usage: {
                messagesLeft: Math.max(0, dailyMessageLimit - (normalizedUsage.messagesToday + 1)),
                webSearchLeft: Math.max(0, dailyWebSearchLimit -
                    (normalizedUsage.webSearchesToday + (effectiveMode === "web" ? 1 : 0))),
            },
            sources,
        });
    }
    catch {
        return res
            .status(500)
            .json({ error: "MongoDB not configured or unavailable." });
    }
});
app.post("/v1/bihar-ai/chat", requireFirebaseAuth, async (req, res) => {
    try {
        await (0, db_1.connectMongo)();
        const uid = req.user?.uid;
        if (!uid)
            return res.status(401).json({ error: "Unauthorized" });
        const { message, category, district, webSearch, conversationId, categoryAuto: categoryAutoRaw, } = (req.body || {});
        if (!message?.trim()) {
            return res.status(400).json({ error: "message is required" });
        }
        const messageTrimmed = message.trim();
        const categoryAutoExplicit = typeof categoryAutoRaw === "boolean" ? categoryAutoRaw : undefined;
        const categoryAuto = categoryAutoExplicit === true ||
            (categoryAutoExplicit !== false &&
                (typeof category === "string" && category.trim().toLowerCase() === "auto"));
        let resolvedCategory;
        let categoriesDetected = [];
        if (categoryAuto) {
            categoriesDetected = (0, prompts_1.detectBiharCategoriesFromMessage)(messageTrimmed);
            resolvedCategory = (0, prompts_1.resolvePrimaryBiharCategory)(categoriesDetected);
        }
        else {
            const c = (0, prompts_1.normalizeBiharCategory)(category);
            if (!c) {
                return res.status(400).json({
                    error: "Invalid category. Expected one of: education, news, politics, culture, student_help, jobs, agriculture — or use categoryAuto with category \"auto\".",
                });
            }
            resolvedCategory = c;
        }
        const districtRaw = typeof district === "string" && district.trim()
            ? district.trim().toLowerCase().replace(/\s+/g, "_")
            : "all";
        const webFromToggle = Boolean(webSearch);
        const webFromKeywords = (0, prompts_1.suggestBiharWebFromMessage)(messageTrimmed);
        const effectiveWeb = webFromToggle || webFromKeywords;
        const webAutoBoost = !webFromToggle && webFromKeywords;
        const resolvedConversationId = normalizeConversationId(conversationId);
        const profile = await UserProfile_1.UserProfile.findOne({ uid }).lean();
        const allowMemory = profile?.memorySettings?.allowMemory !== false;
        const referenceChatHistory = profile?.memorySettings?.referenceChatHistory !== false;
        const isIncognito = profile?.privacy?.incognitoChatMode === true;
        const todayKey = getDayKey();
        const dailyMessageLimit = Number(process.env.DAILY_MESSAGE_LIMIT || "120");
        const dailyWebSearchLimit = Number(process.env.DAILY_WEB_SEARCH_LIMIT || "25");
        const currentUsage = profile?.usage ?? {
            dayKey: todayKey,
            messagesToday: 0,
            webSearchesToday: 0,
        };
        const normalizedUsage = currentUsage.dayKey === todayKey
            ? currentUsage
            : { dayKey: todayKey, messagesToday: 0, webSearchesToday: 0 };
        if (normalizedUsage.messagesToday >= dailyMessageLimit) {
            return res.status(429).json({
                error: "Daily message limit reached.",
                usage: {
                    messagesLeft: 0,
                    webSearchLeft: Math.max(0, dailyWebSearchLimit - normalizedUsage.webSearchesToday),
                },
            });
        }
        if (effectiveWeb && normalizedUsage.webSearchesToday >= dailyWebSearchLimit) {
            return res.status(429).json({
                error: "Daily web search limit reached.",
                usage: {
                    messagesLeft: Math.max(0, dailyMessageLimit - normalizedUsage.messagesToday),
                    webSearchLeft: 0,
                },
            });
        }
        const resolvedPersonality = profile?.selectedPersonality === "Loa" ? "Loa" : "Simi";
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
        let sources = [];
        let savedUserMessage;
        if (!isIncognito) {
            const saved = await ConversationMessage_1.ConversationMessage.create({
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
            const existingConversation = await Conversation_1.Conversation.findOne({
                uid,
                conversationId: resolvedConversationId,
            })
                .select({ manualTitle: 1, title: 1 })
                .lean();
            const shouldAutoTitle = !existingConversation?.manualTitle;
            await Conversation_1.Conversation.findOneAndUpdate({ uid, conversationId: resolvedConversationId }, {
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
            }, { upsert: true, new: true });
        }
        const shortTerm = !isIncognito && referenceChatHistory
            ? await ConversationMessage_1.ConversationMessage.aggregate([
                { $match: { uid, conversationId: resolvedConversationId } },
                { $sort: { createdAt: -1 } },
                { $limit: SHORT_TERM_CONTEXT_LIMIT },
                { $sort: { createdAt: 1 } },
                { $project: { role: 1, content: 1, createdAt: 1 } },
            ])
            : [];
        const pastUserMessages = !isIncognito && referenceChatHistory && allowMemory
            ? await ConversationMessage_1.ConversationMessage.find({
                uid,
                role: "user",
                conversationId: { $ne: resolvedConversationId },
            })
                .sort({ createdAt: -1 })
                .limit(CROSS_CHAT_MEMORY_FETCH_LIMIT)
                .select({ content: 1, createdAt: 1, _id: 0 })
                .lean()
            : [];
        const pastMemoryLines = !isIncognito && referenceChatHistory && allowMemory
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
            const preferredLanguage = (profile?.languagePreference ??
                mergedPreferences
                    .find((p) => p.toLowerCase().startsWith("language:"))
                    ?.split(":")[1]
                    ?.trim()) || "auto";
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
            let systemPrompt = (0, prompts_1.buildBiharSystemPrompt)({
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
                            messagesLeft: Math.max(0, dailyMessageLimit - normalizedUsage.messagesToday),
                            webSearchLeft: Math.max(0, dailyWebSearchLimit - normalizedUsage.webSearchesToday),
                        },
                    });
                }
                sources = results
                    .map((r) => ({
                    title: r.title,
                    link: r.link,
                }))
                    .slice(0, 7);
                const resultText = results
                    .map((r) => `${r.rank}. ${r.title}\nSnippet: ${r.snippet}\nLink: ${r.link}`)
                    .join("\n\n");
                systemPrompt += `\nUse the following search results to answer accurately:\n\n${resultText}\n`;
            }
            const nvidiaMessages = [
                { role: "system", content: systemPrompt },
                ...shortTerm.map((m) => ({
                    role: (m.role === "user" ? "user" : "assistant"),
                    content: m.content,
                })),
            ];
            try {
                const ai = await (0, nvidiaClient_1.callNvidiaChatCompletions)({
                    apiKey: nvidiaKey,
                    messages: nvidiaMessages,
                    max_tokens: 1800,
                    temperature: 0.68,
                    top_p: 0.88,
                });
                if (ai)
                    reply = ai;
            }
            catch {
                reply = buildCompanionReply({
                    message,
                    personality: resolvedPersonality,
                    name,
                });
            }
        }
        await UserProfile_1.UserProfile.findOneAndUpdate({ uid }, {
            $set: {
                usage: {
                    dayKey: todayKey,
                    messagesToday: normalizedUsage.messagesToday + 1,
                    webSearchesToday: normalizedUsage.webSearchesToday + (effectiveWeb ? 1 : 0),
                },
            },
        }, { upsert: true });
        if (!isIncognito) {
            await ConversationMessage_1.ConversationMessage.create({
                uid,
                conversationId: resolvedConversationId,
                role: "ai",
                content: reply,
                personality: resolvedPersonality,
                mode: storageMode,
            });
            await Conversation_1.Conversation.updateOne({ uid, conversationId: resolvedConversationId }, { $set: { preview: reply, updatedAt: new Date() } });
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
                messagesLeft: Math.max(0, dailyMessageLimit - (normalizedUsage.messagesToday + 1)),
                webSearchLeft: Math.max(0, dailyWebSearchLimit -
                    (normalizedUsage.webSearchesToday + (effectiveWeb ? 1 : 0))),
            },
            sources,
        });
    }
    catch {
        return res
            .status(500)
            .json({ error: "MongoDB not configured or unavailable." });
    }
});
const port = Number(process.env.PORT || 8080);
const server = app.listen(port, () => {
    console.log(`[evara-backend] listening on port ${port}`);
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
