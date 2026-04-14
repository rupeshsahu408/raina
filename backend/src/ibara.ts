import express from "express";
import crypto from "crypto";
import dns from "dns";
import { promisify } from "util";
import { IbaraSite } from "./models/IbaraSite";
import { IbaraBot } from "./models/IbaraBot";
import { callNvidiaChatCompletions, type ChatMessage } from "./ai/nvidiaClient";
import { connectMongo } from "./db";

const resolveTxt = promisify(dns.resolveTxt);

export const ibaraRouter = express.Router();

function normalizeDomain(raw: string): string {
  let d = raw.trim().toLowerCase();
  d = d.replace(/^https?:\/\//i, "");
  d = d.replace(/\/.*$/, "");
  d = d.trim();
  return d;
}

async function verifyDnsTxtRecord(domain: string, token: string): Promise<boolean> {
  try {
    const records = await resolveTxt(domain);
    for (const record of records) {
      const val = Array.isArray(record) ? record.join("") : record;
      if (val === `ibara-verify=${token}`) return true;
    }
    return false;
  } catch {
    return false;
  }
}

function buildIbaraBotSystemPrompt(bot: {
  businessName: string;
  businessType: string;
  location: string;
  workingHours: string;
  services: string;
  knowledgeBase: string;
  tone: string;
  language: string;
}): string {
  const toneInstr =
    bot.tone === "professional"
      ? "Always respond in a professional, formal, and helpful manner."
      : "Respond in a warm, friendly, and conversational tone.";

  const langInstr =
    bot.language === "hindi"
      ? "Always reply in Hindi language."
      : bot.language === "hinglish"
      ? "Reply in Hinglish (a natural mix of Hindi and English)."
      : "Always reply in English.";

  return `You are a helpful AI assistant for ${bot.businessName || "this business"}.

Business Details:
- Business Name: ${bot.businessName || "N/A"}
- Business Type: ${bot.businessType || "N/A"}
- Location: ${bot.location || "N/A"}
- Working Hours: ${bot.workingHours || "N/A"}
- Services / Products: ${bot.services || "N/A"}

Knowledge Base:
${bot.knowledgeBase || "No specific knowledge base provided."}

Instructions:
- ${toneInstr}
- ${langInstr}
- Only answer questions relevant to the business. For unrelated questions, politely redirect the user.
- Keep responses concise and helpful.
- If asked about working hours, location, or services, answer from the details above.
- If you don't know the answer, say so honestly and suggest the user contact the business directly.`;
}

// POST /api/ibara/sites — register a new site
ibaraRouter.post("/sites", async (req, res) => {
  const { userId, websiteUrl } = req.body || {};
  if (!userId || !websiteUrl) {
    return res.status(400).json({ error: "userId and websiteUrl are required" });
  }

  const domain = normalizeDomain(websiteUrl);
  if (!domain || domain.length < 3) {
    return res.status(400).json({ error: "Invalid website URL" });
  }

  try {
    await connectMongo();
    const existing = await IbaraSite.findOne({ userId, domain });
    if (existing) {
      return res.json({ site: existing });
    }

    const token = crypto.randomBytes(16).toString("hex");
    const site = await IbaraSite.create({
      userId,
      domain,
      verificationToken: token,
      verificationStatus: "pending",
    });

    return res.status(201).json({ site });
  } catch (err: any) {
    if (err.code === 11000) {
      try {
        const existing = await IbaraSite.findOne({ userId, domain });
        return res.json({ site: existing });
      } catch (e2) {
        console.error("[ibara] duplicate fallback error:", e2);
        return res.status(500).json({ error: "Failed to create site" });
      }
    }
    console.error("[ibara] create site error:", err);
    return res.status(500).json({ error: "Failed to create site. Please try again." });
  }
});

// GET /api/ibara/sites — list user's sites
ibaraRouter.get("/sites", async (req, res) => {
  const { userId } = req.query;
  if (!userId) return res.status(400).json({ error: "userId is required" });

  try {
    await connectMongo();
    const sites = await IbaraSite.find({ userId }).sort({ createdAt: -1 });
    return res.json({ sites });
  } catch (err) {
    console.error("[ibara] list sites error:", err);
    return res.status(500).json({ error: "Failed to fetch sites" });
  }
});

// POST /api/ibara/sites/:siteId/verify — verify DNS
ibaraRouter.post("/sites/:siteId/verify", async (req, res) => {
  const { siteId } = req.params;
  const { userId } = req.body || {};

  if (!userId) return res.status(400).json({ error: "userId is required" });

  try {
    await connectMongo();
    const site = await IbaraSite.findOne({ _id: siteId, userId });
    if (!site) return res.status(404).json({ error: "Site not found" });

    if (site.verificationStatus === "verified") {
      return res.json({ verified: true, site });
    }

    const verified = await verifyDnsTxtRecord(site.domain, site.verificationToken);

    if (verified) {
      site.verificationStatus = "verified";
      site.verifiedAt = new Date();
      await site.save();
      return res.json({ verified: true, site });
    } else {
      site.verificationStatus = "pending";
      await site.save();
      return res.json({
        verified: false,
        site,
        message: "DNS record not found yet. Please check your DNS settings and try again in a few minutes.",
      });
    }
  } catch (err) {
    console.error("[ibara] verify error:", err);
    return res.status(500).json({ error: "Verification failed" });
  }
});

// GET /api/ibara/sites/:siteId/bot — get bot config
ibaraRouter.get("/sites/:siteId/bot", async (req, res) => {
  const { siteId } = req.params;

  try {
    await connectMongo();
    const bot = await IbaraBot.findOne({ siteId });
    return res.json({ bot: bot || null });
  } catch (err) {
    console.error("[ibara] get bot error:", err);
    return res.status(500).json({ error: "Failed to fetch bot config" });
  }
});

// POST /api/ibara/sites/:siteId/bot — save bot config
ibaraRouter.post("/sites/:siteId/bot", async (req, res) => {
  const { siteId } = req.params;
  const {
    userId,
    businessName,
    businessType,
    location,
    workingHours,
    services,
    knowledgeBase,
    tone,
    language,
    isActive,
  } = req.body || {};

  if (!userId) return res.status(400).json({ error: "userId is required" });

  try {
    await connectMongo();
    const site = await IbaraSite.findOne({ _id: siteId, userId });
    if (!site) return res.status(404).json({ error: "Site not found" });

    const bot = await IbaraBot.findOneAndUpdate(
      { siteId, userId },
      {
        siteId,
        userId,
        businessName: businessName ?? "",
        businessType: businessType ?? "",
        location: location ?? "",
        workingHours: workingHours ?? "",
        services: services ?? "",
        knowledgeBase: knowledgeBase ?? "",
        tone: tone ?? "professional",
        language: language ?? "english",
        isActive: isActive ?? false,
      },
      { upsert: true, new: true }
    );

    return res.json({ bot });
  } catch (err) {
    console.error("[ibara] save bot error:", err);
    return res.status(500).json({ error: "Failed to save bot config" });
  }
});

// POST /api/ibara/sites/:siteId/chat — chat with the configured bot
ibaraRouter.post("/sites/:siteId/chat", async (req, res) => {
  const { siteId } = req.params;
  const { message, history } = req.body || {};

  if (!message?.trim()) return res.status(400).json({ error: "message is required" });

  try {
    await connectMongo();
    const bot = await IbaraBot.findOne({ siteId });
    if (!bot) {
      return res.status(404).json({ error: "Bot not configured for this site" });
    }

    const apiKey = process.env.NVIDIA_API_KEY;
    if (!apiKey) {
      return res.status(500).json({ error: "AI service not configured" });
    }

    const systemPrompt = buildIbaraBotSystemPrompt(bot);

    const pastMessages: ChatMessage[] = Array.isArray(history)
      ? history.slice(-10).map((m: any) => ({
          role: m.role === "assistant" ? "assistant" : "user",
          content: String(m.content || ""),
        }))
      : [];

    const messages: ChatMessage[] = [
      { role: "system", content: systemPrompt },
      ...pastMessages,
      { role: "user", content: message.trim() },
    ];

    const reply = await callNvidiaChatCompletions({
      apiKey,
      messages,
      model: "openai/gpt-oss-20b",
      max_tokens: 512,
      temperature: 0.7,
    });

    return res.json({ reply });
  } catch (err) {
    console.error("[ibara] chat error:", err);
    return res.status(500).json({ error: "Chat failed. Please try again." });
  }
});
