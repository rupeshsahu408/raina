import express from "express";
import crypto from "crypto";
import dns from "dns";
import http from "http";
import https from "https";
import { promisify } from "util";
import { IbaraSite } from "./models/IbaraSite";
import { IbaraBot } from "./models/IbaraBot";
import { callNvidiaChatCompletions, type ChatMessage } from "./ai/nvidiaClient";
import { connectMongo } from "./db";

const WIDGET_CDN = "https://www.plyndrox.app/ibara-widget.js";
const API_BASE = "https://raina-1.onrender.com";

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
  const userId = req.query.userId as string | undefined;
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
      { upsert: true, returnDocument: "after" }
    );

    return res.json({ bot });
  } catch (err) {
    console.error("[ibara] save bot error:", err);
    return res.status(500).json({ error: "Failed to save bot config" });
  }
});

// POST /api/ibara/detect-platform — detect what platform a URL is running on
ibaraRouter.post("/detect-platform", async (req, res) => {
  const { url } = req.body || {};
  if (!url) return res.status(400).json({ error: "url is required" });

  const domain = normalizeDomain(url);
  const baseUrl = `https://${domain}`;

  const fetchUrl = (u: string): Promise<string> =>
    new Promise((resolve) => {
      const mod = u.startsWith("https") ? https : http;
      const req = mod.get(u, { headers: { "User-Agent": "Mozilla/5.0" }, timeout: 8000 } as any, (r) => {
        let body = "";
        r.setEncoding("utf8");
        r.on("data", (c: string) => { body += c; if (body.length > 50000) r.destroy(); });
        r.on("end", () => resolve(body));
        r.on("error", () => resolve(""));
      });
      req.on("error", () => resolve(""));
      req.on("timeout", () => { req.destroy(); resolve(""); });
    });

  try {
    const [wpJsonResp, homeBody] = await Promise.all([
      fetchUrl(`${baseUrl}/wp-json/`),
      fetchUrl(baseUrl),
    ]);

    let platform = "unknown";
    let details: Record<string, any> = {};

    if (wpJsonResp.includes('"namespaces"') || wpJsonResp.includes('"name"')) {
      platform = "wordpress";
      try {
        const parsed = JSON.parse(wpJsonResp);
        details.siteName = parsed.name || domain;
        details.wpVersion = parsed.generator?.replace("https://wordpress.org/?v=", "") || "";
        details.apiUrl = `${baseUrl}/wp-json/wp/v2/`;
      } catch {}
    } else if (homeBody.includes("Shopify.theme") || homeBody.includes("cdn.shopify.com")) {
      platform = "shopify";
    } else if (homeBody.includes("X-Wix-Published-Version") || homeBody.includes("wix.com")) {
      platform = "wix";
    } else if (homeBody.includes("squarespace") || homeBody.includes("Squarespace")) {
      platform = "squarespace";
    } else if (homeBody.includes("webflow") || homeBody.includes("Webflow")) {
      platform = "webflow";
    } else if (homeBody.includes("</body>") || homeBody.includes("</html>")) {
      platform = "html";
    }

    const hasIbaraWidget = homeBody.includes("ibara-widget.js");

    return res.json({ platform, details, hasIbaraWidget, domain });
  } catch (err) {
    console.error("[ibara] detect-platform error:", err);
    return res.json({ platform: "unknown", details: {}, hasIbaraWidget: false, domain });
  }
});

// GET /api/ibara/sites/:siteId/connection — get connection info
ibaraRouter.get("/sites/:siteId/connection", async (req, res) => {
  const { siteId } = req.params;
  try {
    await connectMongo();
    const site = await IbaraSite.findById(siteId);
    if (!site) return res.status(404).json({ error: "Site not found" });
    return res.json({
      connectionMethod: site.connectionMethod || null,
      connectionStatus: site.connectionStatus || "not_connected",
      connectionVerifiedAt: site.connectionVerifiedAt || null,
      detectedPlatform: site.detectedPlatform || "unknown",
    });
  } catch (err) {
    console.error("[ibara] get connection error:", err);
    return res.status(500).json({ error: "Failed to fetch connection info" });
  }
});

// POST /api/ibara/sites/:siteId/connection — save connection method
ibaraRouter.post("/sites/:siteId/connection", async (req, res) => {
  const { siteId } = req.params;
  const { userId, connectionMethod, connectionStatus, detectedPlatform } = req.body || {};
  if (!userId) return res.status(400).json({ error: "userId is required" });

  try {
    await connectMongo();
    const site = await IbaraSite.findOne({ _id: siteId, userId });
    if (!site) return res.status(404).json({ error: "Site not found" });

    if (connectionMethod) site.connectionMethod = connectionMethod;
    if (connectionStatus) site.connectionStatus = connectionStatus;
    if (detectedPlatform) site.detectedPlatform = detectedPlatform;
    if (connectionStatus === "connected") site.connectionVerifiedAt = new Date();

    await site.save();
    return res.json({ site });
  } catch (err) {
    console.error("[ibara] save connection error:", err);
    return res.status(500).json({ error: "Failed to save connection info" });
  }
});

// POST /api/ibara/sites/:siteId/verify-connection — check if widget is live on the site
ibaraRouter.post("/sites/:siteId/verify-connection", async (req, res) => {
  const { siteId } = req.params;
  const { userId } = req.body || {};
  if (!userId) return res.status(400).json({ error: "userId is required" });

  try {
    await connectMongo();
    const site = await IbaraSite.findOne({ _id: siteId, userId });
    if (!site) return res.status(404).json({ error: "Site not found" });

    const baseUrl = `https://${site.domain}`;
    const fetchUrl = (u: string): Promise<string> =>
      new Promise((resolve) => {
        const mod = u.startsWith("https") ? https : http;
        const req = mod.get(u, { headers: { "User-Agent": "Mozilla/5.0" }, timeout: 10000 } as any, (r) => {
          let body = "";
          r.setEncoding("utf8");
          r.on("data", (c: string) => { body += c; if (body.length > 100000) r.destroy(); });
          r.on("end", () => resolve(body));
          r.on("error", () => resolve(""));
        });
        req.on("error", () => resolve(""));
        req.on("timeout", () => { req.destroy(); resolve(""); });
      });

    const body = await fetchUrl(baseUrl);
    const isLive = body.includes("ibara-widget.js") && body.includes(siteId);

    if (isLive) {
      site.connectionStatus = "connected";
      site.connectionVerifiedAt = new Date();
      await site.save();
    }

    return res.json({ isLive, site });
  } catch (err) {
    console.error("[ibara] verify-connection error:", err);
    return res.status(500).json({ error: "Verification failed" });
  }
});

// GET /api/ibara/sites/:siteId/generate-plugin — generate WordPress plugin PHP content
ibaraRouter.get("/sites/:siteId/generate-plugin", async (req, res) => {
  const { siteId } = req.params;

  try {
    await connectMongo();
    const site = await IbaraSite.findById(siteId);
    if (!site) return res.status(404).json({ error: "Site not found" });

    const pluginContent = `<?php
/**
 * Plugin Name: Ibara AI Chatbot
 * Plugin URI: https://www.plyndrox.app/ibara
 * Description: Adds the Ibara AI chatbot to your website automatically. No coding required.
 * Version: 1.0.0
 * Author: Ibara AI
 * Author URI: https://www.plyndrox.app
 * License: GPL2
 */

if ( ! defined( 'ABSPATH' ) ) exit;

define( 'IBARA_SITE_ID', '${siteId}' );
define( 'IBARA_API_BASE', '${API_BASE}' );
define( 'IBARA_WIDGET_URL', '${WIDGET_CDN}' );

function ibara_enqueue_widget() {
    echo '\\n<script src="' . IBARA_WIDGET_URL . '" data-site-id="' . IBARA_SITE_ID . '" data-api-base="' . IBARA_API_BASE . '" async defer></script>\\n';
}
add_action( 'wp_footer', 'ibara_enqueue_widget' );

function ibara_activation_notice() {
    echo '<div class="notice notice-success is-dismissible"><p><strong>Ibara AI Chatbot</strong> is now active on your website!</p></div>';
}
register_activation_hook( __FILE__, function() {
    set_transient( 'ibara_activated', true, 5 );
});
add_action( 'admin_notices', function() {
    if ( get_transient( 'ibara_activated' ) ) {
        ibara_activation_notice();
        delete_transient( 'ibara_activated' );
    }
});
`;

    res.setHeader("Content-Type", "application/octet-stream");
    res.setHeader("Content-Disposition", `attachment; filename="ibara-ai-chatbot.php"`);
    return res.send(pluginContent);
  } catch (err) {
    console.error("[ibara] generate-plugin error:", err);
    return res.status(500).json({ error: "Failed to generate plugin" });
  }
});

// GET /api/ibara/sites/:siteId/generate-installer — generate PHP installer for non-WP sites
ibaraRouter.get("/sites/:siteId/generate-installer", async (req, res) => {
  const { siteId } = req.params;

  try {
    await connectMongo();
    const site = await IbaraSite.findById(siteId);
    if (!site) return res.status(404).json({ error: "Site not found" });

    const installerContent = `<?php
/**
 * Ibara AI - One-Time Website Connector
 * 
 * Instructions:
 * 1. Upload this file to your website's root folder (same folder as index.php or index.html)
 * 2. Visit: https://${site.domain}/ibara-connect.php
 * 3. Click "Install Chatbot"
 * 4. Delete this file after installation
 */

define('IBARA_SITE_ID', '${siteId}');
define('IBARA_API_BASE', '${API_BASE}');
define('IBARA_WIDGET_URL', '${WIDGET_CDN}');
define('IBARA_DOMAIN', '${site.domain}');
define('IBARA_SCRIPT_TAG', '<script src="' . IBARA_WIDGET_URL . '" data-site-id="' . IBARA_SITE_ID . '" data-api-base="' . IBARA_API_BASE . '" async defer></script>');

$message = '';
$success = false;
$alreadyInstalled = false;

if ($_SERVER['REQUEST_METHOD'] === 'POST' && isset($_POST['install'])) {
    $targetFiles = ['index.php', 'index.html', 'index.htm', 'default.html', 'default.php', 'home.php', 'home.html'];
    $installed = false;
    
    foreach ($targetFiles as $file) {
        $path = dirname(__FILE__) . DIRECTORY_SEPARATOR . $file;
        if (file_exists($path) && is_readable($path)) {
            $content = file_get_contents($path);
            if ($content === false) continue;
            
            if (strpos($content, 'ibara-widget.js') !== false) {
                $alreadyInstalled = true;
                $success = true;
                $message = "Ibara AI chatbot is already installed in <strong>" . htmlspecialchars($file) . "</strong>.";
                break;
            }
            
            if (strpos($content, '</body>') !== false && is_writable($path)) {
                $newContent = str_replace('</body>', IBARA_SCRIPT_TAG . "\\n</body>", $content);
                if (file_put_contents($path, $newContent) !== false) {
                    $installed = true;
                    $success = true;
                    $message = "Ibara AI chatbot successfully installed in <strong>" . htmlspecialchars($file) . "</strong>! You can now delete this file.";
                    break;
                }
            }
        }
    }
    
    if (!$installed && !$alreadyInstalled) {
        $message = "Could not auto-install. Please add this script manually before </body> in your HTML: <br><code>" . htmlspecialchars(IBARA_SCRIPT_TAG) . "</code>";
    }
}
?>
<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>Ibara AI Installer</title>
<style>
  body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; background: #05050F; color: #fff; display: flex; align-items: center; justify-content: center; min-height: 100vh; margin: 0; }
  .card { background: rgba(255,255,255,0.04); border: 1px solid rgba(255,255,255,0.1); border-radius: 20px; padding: 40px; max-width: 500px; width: 90%; text-align: center; }
  .logo { width: 60px; height: 60px; background: linear-gradient(135deg, #7c3aed, #06b6d4); border-radius: 16px; display: flex; align-items: center; justify-content: center; margin: 0 auto 20px; font-size: 28px; }
  h1 { font-size: 22px; margin: 0 0 8px; }
  p { color: rgba(255,255,255,0.5); font-size: 14px; line-height: 1.6; margin: 0 0 24px; }
  .btn { background: linear-gradient(135deg, #7c3aed, #06b6d4); color: #fff; border: none; border-radius: 12px; padding: 14px 32px; font-size: 15px; font-weight: 600; cursor: pointer; width: 100%; }
  .success { background: rgba(34,197,94,0.1); border: 1px solid rgba(34,197,94,0.3); border-radius: 12px; padding: 16px; color: #86efac; font-size: 14px; margin-top: 16px; }
  .error { background: rgba(239,68,68,0.1); border: 1px solid rgba(239,68,68,0.3); border-radius: 12px; padding: 16px; color: #fca5a5; font-size: 14px; margin-top: 16px; }
  .site { background: rgba(255,255,255,0.05); border-radius: 8px; padding: 8px 14px; font-family: monospace; font-size: 13px; color: #a78bfa; margin-bottom: 24px; }
</style>
</head>
<body>
<div class="card">
  <div class="logo">🤖</div>
  <h1>Ibara AI Installer</h1>
  <div class="site"><?= htmlspecialchars(IBARA_DOMAIN) ?></div>
  <p>Click the button below to automatically add the Ibara AI chatbot to your website. This is a one-time process — no coding required.</p>
  <?php if ($message): ?>
    <div class="<?= $success ? 'success' : 'error' ?>"><?= $message ?></div>
  <?php endif; ?>
  <?php if (!$success): ?>
  <form method="POST">
    <button type="submit" name="install" value="1" class="btn">Install Chatbot Now</button>
  </form>
  <?php endif; ?>
</div>
</body>
</html>
`;

    res.setHeader("Content-Type", "application/octet-stream");
    res.setHeader("Content-Disposition", `attachment; filename="ibara-connect.php"`);
    return res.send(installerContent);
  } catch (err) {
    console.error("[ibara] generate-installer error:", err);
    return res.status(500).json({ error: "Failed to generate installer" });
  }
});

// POST /api/ibara/sites/:siteId/wordpress-connect — connect via WP Application Password
ibaraRouter.post("/sites/:siteId/wordpress-connect", async (req, res) => {
  const { siteId } = req.params;
  const { userId, wpUrl, wpUsername, wpAppPassword } = req.body || {};
  if (!userId || !wpUrl || !wpUsername || !wpAppPassword) {
    return res.status(400).json({ error: "wpUrl, wpUsername, and wpAppPassword are required" });
  }

  try {
    await connectMongo();
    const site = await IbaraSite.findOne({ _id: siteId, userId });
    if (!site) return res.status(404).json({ error: "Site not found" });

    const cleanUrl = wpUrl.trim().replace(/\/$/, "");
    const credentials = Buffer.from(`${wpUsername}:${wpAppPassword}`).toString("base64");

    const scriptTag = `<script src="${WIDGET_CDN}" data-site-id="${siteId}" data-api-base="${API_BASE}" async defer></script>`;

    const payload = JSON.stringify({
      title: "ibara-ai-script",
      content: scriptTag,
      status: "private",
      slug: "ibara-ai-widget-script",
    });

    const wpResult = await new Promise<{ success: boolean; message: string }>((resolve) => {
      const url = new URL(`${cleanUrl}/wp-json/wp/v2/posts`);
      const options = {
        hostname: url.hostname,
        port: url.port || (url.protocol === "https:" ? 443 : 80),
        path: url.pathname,
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Basic ${credentials}`,
          "Content-Length": Buffer.byteLength(payload),
        },
        timeout: 15000,
      };

      const mod = url.protocol === "https:" ? https : http;
      const req = mod.request(options, (r) => {
        let body = "";
        r.on("data", (c) => { body += c; });
        r.on("end", () => {
          if (r.statusCode && r.statusCode >= 200 && r.statusCode < 300) {
            resolve({ success: true, message: "WordPress connected successfully" });
          } else if (r.statusCode === 401) {
            resolve({ success: false, message: "Invalid credentials. Please check your username and application password." });
          } else if (r.statusCode === 403) {
            resolve({ success: false, message: "Insufficient permissions. Please use an admin account." });
          } else {
            resolve({ success: false, message: `WordPress API responded with status ${r.statusCode}. Please check your WP URL.` });
          }
        });
        r.on("error", () => resolve({ success: false, message: "Could not reach your WordPress site." }));
      });
      req.on("error", () => resolve({ success: false, message: "Could not connect to WordPress." }));
      req.on("timeout", () => { req.destroy(); resolve({ success: false, message: "Connection timed out." }); });
      req.write(payload);
      req.end();
    });

    if (wpResult.success) {
      site.connectionMethod = "wordpress";
      site.connectionStatus = "pending";
      site.detectedPlatform = "wordpress";
      await site.save();
    }

    return res.json({ success: wpResult.success, message: wpResult.message });
  } catch (err) {
    console.error("[ibara] wordpress-connect error:", err);
    return res.status(500).json({ error: "Failed to connect to WordPress" });
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
