import express from "express";
import sharp from "sharp";
import { connectMongo } from "./db";
import { LedgerSession } from "./models/LedgerSession";
import { callNvidiaChatCompletions } from "./ai/nvidiaClient";

export const ledgerRouter = express.Router();

const NVIDIA_KEY = process.env.NVIDIA_API_KEY || "";

function getUid(req: express.Request): string {
  return (req as any).user?.uid ?? "";
}

type BusinessCommodityTotal = {
  key: string;
  name: string;
  totalQuantity: number;
  totalAmount: number;
  entryCount: number;
};

type BusinessBucket = {
  key: string;
  label: string;
  sessionCount: number;
  totalEntries: number;
  totalQuantity: number;
  totalAmount: number;
  commodities: Record<string, BusinessCommodityTotal>;
};

function normalizeCommodityKey(value: string) {
  return (value || "unknown").toLowerCase().trim().replace(/\s+/g, "_");
}

function createBusinessBucket(key: string, label: string): BusinessBucket {
  return {
    key,
    label,
    sessionCount: 0,
    totalEntries: 0,
    totalQuantity: 0,
    totalAmount: 0,
    commodities: {},
  };
}

function addCommodityToBucket(bucket: BusinessBucket, name: string, quantity: number, amount: number, entryCount = 0) {
  const displayName = name || "Unknown";
  const key = normalizeCommodityKey(displayName);
  if (!bucket.commodities[key]) {
    bucket.commodities[key] = {
      key,
      name: displayName,
      totalQuantity: 0,
      totalAmount: 0,
      entryCount: 0,
    };
  }
  bucket.commodities[key].totalQuantity += Number(quantity) || 0;
  bucket.commodities[key].totalAmount += Number(amount) || 0;
  bucket.commodities[key].entryCount += Number(entryCount) || 0;
}

function addBucketToBucket(target: BusinessBucket, source: BusinessBucket) {
  target.sessionCount += source.sessionCount;
  target.totalEntries += source.totalEntries;
  target.totalQuantity += source.totalQuantity;
  target.totalAmount += source.totalAmount;
  for (const commodity of Object.values(source.commodities)) {
    addCommodityToBucket(target, commodity.name, commodity.totalQuantity, commodity.totalAmount, commodity.entryCount);
  }
}

function finalizeBusinessBucket(bucket: BusinessBucket) {
  return {
    key: bucket.key,
    label: bucket.label,
    sessionCount: bucket.sessionCount,
    totalEntries: Math.round(bucket.totalEntries * 100) / 100,
    totalQuantity: Math.round(bucket.totalQuantity * 100) / 100,
    totalAmount: Math.round(bucket.totalAmount * 100) / 100,
    commodities: Object.values(bucket.commodities)
      .map((commodity) => ({
        ...commodity,
        totalQuantity: Math.round(commodity.totalQuantity * 100) / 100,
        totalAmount: Math.round(commodity.totalAmount * 100) / 100,
      }))
      .sort((a, b) => b.totalAmount - a.totalAmount),
  };
}

const SATTI_PROMPT = `You are an expert accounting assistant specializing in Indian grain trader records (सट्टी / satti).

You are given an image of a handwritten satti record. Your task is TWO steps in ONE response:

STEP 1 — OCR: Read all text visible in the image carefully. Extract every piece of text, including Hindi/Devanagari text, numbers (English or Hindi numerals like २४, २५), commodity names, rates, quantities, and totals.

STEP 2 — STRUCTURE: Parse the extracted data into clean structured JSON. The image may contain:
- Hindi commodity names (गेहू, चावल, सरसों, मक्का, दाल, etc.) or English (Gehu, Chawal, Sarson, Maize, Dal, etc.)
- Numbers in English (24, 25) or Hindi numerals (२४, २५)
- Rate per quintal, quantity in quintals or kg, and sometimes a calculated total
- Multiple entries, possibly mixed formatting

Rules:
1. Convert Hindi numerals to English (२४ → 24)
2. Normalize commodity names to a clean display form (keep the original language but capitalize properly)
3. For each entry extract: commodity, rate (per quintal, as number), quantity (as number, assume quintals unless kg explicitly mentioned), unit ("qtl" or "kg"), amount (rate × quantity, calculate if missing)
4. If a field is unclear, make your best guess and set "uncertain": true for that entry
5. Group entries by commodity (case-insensitive, treat हिंदी and English names for same grain as same group)
6. Calculate per-group: totalQuantity, totalAmount, minRate, maxRate, avgRate, priceDistribution (% of qty at each price point)
7. Calculate overall: totalQuantity, totalAmount, commodityCount

Respond ONLY with valid JSON, no explanation, no markdown code blocks. Use this exact structure:
{
  "rawText": "all text extracted from the image, as-is",
  "entries": [
    {
      "id": 1,
      "commodity": "string",
      "commodityKey": "lowercase_normalized_key",
      "rate": number,
      "quantity": number,
      "unit": "qtl",
      "amount": number,
      "uncertain": false,
      "rawLine": "original text for this entry"
    }
  ],
  "grouped": {
    "COMMODITY_KEY": {
      "displayName": "string",
      "entries": [1],
      "totalQuantity": number,
      "totalAmount": number,
      "minRate": number,
      "maxRate": number,
      "avgRate": number,
      "priceDistribution": [
        { "rate": number, "quantity": number, "percentage": number }
      ]
    }
  },
  "summary": {
    "totalEntries": number,
    "totalQuantity": number,
    "totalAmount": number,
    "commodityCount": number,
    "topCommodity": "string",
    "processingNote": "any important notes about parsing quality"
  }
}`;

function parseAIResponse(raw: string): { rawText: string; structured: any } {
  // Strip markdown code fences if present
  let cleaned = raw
    .replace(/^```json\s*/i, "")
    .replace(/^```\s*/i, "")
    .replace(/\s*```$/i, "")
    .trim();

  // If still not valid JSON at the top level, try to extract the first {...} block
  if (!cleaned.startsWith("{")) {
    const jsonMatch = cleaned.match(/\{[\s\S]*\}/);
    if (jsonMatch) cleaned = jsonMatch[0];
  }

  try {
    const parsed = JSON.parse(cleaned);
    const rawText = parsed.rawText || "";
    const entries = parsed.entries || [];
    const grouped = parsed.grouped || {};
    const summary = parsed.summary || {};

    // If the model returned entries/grouped data but no rawText, synthesize rawText from entries
    const effectiveRawText =
      rawText ||
      (entries.length > 0
        ? entries.map((e: any) => e.rawLine || `${e.commodity} ${e.rate} ${e.quantity}`).join("\n")
        : "");

    return {
      rawText: effectiveRawText,
      structured: { entries, grouped, summary },
    };
  } catch {
    // JSON parsing failed — the model may have returned a plain-text explanation.
    // Treat the raw text as the rawText so downstream checks can use it.
    console.error("[ledger] parseAIResponse: JSON parse failed, raw response:", raw.slice(0, 500));
    return {
      rawText: raw.trim().slice(0, 500), // keep the raw model output for debugging
      structured: {
        entries: [],
        grouped: {},
        summary: {
          totalEntries: 0,
          totalQuantity: 0,
          totalAmount: 0,
          commodityCount: 0,
          topCommodity: "",
          processingNote: "Could not parse satti data. Please try a clearer photo.",
        },
        parseError: true,
      },
    };
  }
}

async function runNvidiaOCRAndStructure(imageBase64: string, mimeType: string): Promise<{ rawText: string; structured: any }> {
  const body = {
    model: "meta/llama-3.2-11b-vision-instruct",
    messages: [
      {
        role: "user",
        content: [
          // Image first — required ordering for some vision models
          {
            type: "image_url",
            image_url: { url: `data:${mimeType};base64,${imageBase64}` },
          },
          { type: "text", text: SATTI_PROMPT },
        ],
      },
    ],
    temperature: 0.1,
    max_tokens: 4096,
  };

  const res = await fetch("https://integrate.api.nvidia.com/v1/chat/completions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${NVIDIA_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`NVIDIA API error: ${err}`);
  }

  const data: any = await res.json();
  const rawJson: string = data?.choices?.[0]?.message?.content || "{}";
  console.log(`[ledger/nvidia] response (first 400 chars): ${rawJson.slice(0, 400)}`);
  return parseAIResponse(rawJson);
}

const SATTI_TEXT_PROMPT = `You are an expert accounting assistant for Indian grain traders.

Parse the following handwritten satti record (typed out by the user) into clean structured JSON.

The input may contain:
- Hindi commodity names (गेहू, चावल, सरसों, मक्का, दाल, etc.) or English (Gehu, Chawal, Sarson, Maize, Dal, etc.)
- Numbers in English (24) or Hindi numerals (२४)
- Rate per quintal, quantity in quintals or kg, and sometimes a calculated total
- Multiple entries, possibly freeform

Rules:
1. Convert Hindi numerals to English (२४ → 24)
2. Normalize commodity names to a clean display form
3. For each entry extract: commodity, rate (per quintal, as number), quantity (as number, assume quintals unless kg explicitly mentioned), unit ("qtl" or "kg"), amount (rate × quantity, calculate if missing)
4. If a field is unclear, make your best guess and set "uncertain": true for that entry
5. Group entries by commodity (case-insensitive; Hindi and English names for the same grain are the same group)
6. Calculate per-group: totalQuantity, totalAmount, minRate, maxRate, avgRate, priceDistribution (% of qty at each price point)
7. Calculate overall: totalQuantity, totalAmount, commodityCount

Respond ONLY with valid JSON. No explanation. No markdown. Use this exact structure:
{
  "rawText": "<echo back the user's input verbatim>",
  "entries": [
    { "id": 1, "commodity": "string", "commodityKey": "lowercase_key", "rate": 0, "quantity": 0, "unit": "qtl", "amount": 0, "uncertain": false, "rawLine": "original line" }
  ],
  "grouped": {
    "COMMODITY_KEY": {
      "displayName": "string", "entries": [1], "totalQuantity": 0, "totalAmount": 0,
      "minRate": 0, "maxRate": 0, "avgRate": 0,
      "priceDistribution": [{ "rate": 0, "quantity": 0, "percentage": 0 }]
    }
  },
  "summary": {
    "totalEntries": 0, "totalQuantity": 0, "totalAmount": 0,
    "commodityCount": 0, "topCommodity": "string", "processingNote": "string"
  }
}

Input satti text:
`;

async function runNvidiaTextStructure(sattiText: string): Promise<{ rawText: string; structured: any }> {
  const rawJson = await callNvidiaChatCompletions({
    apiKey: NVIDIA_KEY,
    model: "meta/llama-3.1-8b-instruct",
    messages: [{ role: "user", content: SATTI_TEXT_PROMPT + sattiText }],
    temperature: 0.1,
    max_tokens: 4096,
  });
  return parseAIResponse(rawJson);
}

/* ── Text entry & Process ── */
ledgerRouter.post(
  "/text",
  express.json(),
  async (req: express.Request, res: express.Response): Promise<void> => {
    try {
      const uid = getUid(req);
      if (!uid) { res.status(401).json({ error: "Unauthorized" }); return; }

      if (!NVIDIA_KEY) { res.status(500).json({ error: "NVIDIA API key not configured." }); return; }

      const sattiText: string = (req.body?.text || "").trim();
      if (!sattiText || sattiText.length < 5) {
        res.status(400).json({ error: "Please enter at least one satti entry." });
        return;
      }
      if (sattiText.length > 5000) {
        res.status(400).json({ error: "Text too long. Keep it under 5000 characters." });
        return;
      }

      let rawText = "";
      let structured: any = {};
      try {
        const result = await runNvidiaTextStructure(sattiText);
        rawText = result.rawText || sattiText;
        structured = result.structured;
      } catch (err: any) {
        res.status(502).json({ error: `AI processing failed: ${err.message}` });
        return;
      }

      const meta = {
        processedAt: new Date().toISOString(),
        fileSizeKb: 0,
        mimeType: "text/plain",
        source: "manual",
      };

      let sessionId: string | undefined;
      try {
        await connectMongo();
        const saved = await LedgerSession.create({
          uid, rawText,
          entries: structured.entries || [],
          grouped: structured.grouped || {},
          summary: structured.summary || {},
          meta,
        });
        sessionId = String(saved._id);
      } catch (err) {
        console.error("[ledger/text] MongoDB save failed:", err);
      }

      res.json({ success: true, sessionId, rawText, ...structured, meta });
    } catch (err: any) {
      console.error("[ledger/text]", err);
      res.status(500).json({ error: err.message || "Unexpected error." });
    }
  }
);

/* ── Upload & Process ── */
ledgerRouter.post(
  "/upload",
  express.json({ limit: "10mb" }),
  async (req: express.Request, res: express.Response): Promise<void> => {
    try {
      const uid = getUid(req);
      if (!uid) {
        res.status(401).json({ error: "Unauthorized" });
        return;
      }

      if (!NVIDIA_KEY) {
        res.status(500).json({ error: "NVIDIA API key not configured." });
        return;
      }

      // Accept base64 image from JSON body (avoids multipart binary corruption through proxies)
      const { image: imageBase64Input, mimeType: inputMime } = req.body || {};

      if (!imageBase64Input || typeof imageBase64Input !== "string") {
        res.status(400).json({ error: "No image provided." });
        return;
      }

      // Decode the base64 to a buffer so sharp can re-encode it cleanly
      const rawBuf = Buffer.from(imageBase64Input, "base64");

      if (!rawBuf || rawBuf.length < 10) {
        res.status(400).json({ error: "Uploaded image is empty or too small." });
        return;
      }

      console.log(`[ledger/upload] received base64 image: ${rawBuf.length}B (mime hint: ${inputMime})`);

      // Re-encode with sharp: outputs a clean JPEG optimised for OCR.
      // Keep resolution high (≤1280px) and quality high (90) to preserve text detail.
      // Adaptively reduce quality if the output exceeds NVIDIA's ~130 KB raw limit.
      let imageBase64: string;
      const mimeType = "image/jpeg";
      try {
        const sharpPipeline = sharp(rawBuf)
          .rotate()                        // auto-rotate from EXIF
          .resize({ width: 1280, height: 1280, fit: "inside", withoutEnlargement: true });

        let processed: Buffer | null = null;
        for (const quality of [90, 82, 72, 60]) {
          const candidate = await sharpPipeline.clone().jpeg({ quality, progressive: false }).toBuffer();
          processed = candidate;
          if (candidate.length <= 130 * 1024) break; // fits within NVIDIA's safe zone
        }
        imageBase64 = processed!.toString("base64");
        console.log(`[ledger/upload] sharp re-encoded: ${rawBuf.length}B → ${processed!.length}B (base64 ${imageBase64.length} chars)`);
      } catch (sharpErr: any) {
        console.error("[ledger/upload] sharp failed, using client-provided base64 directly:", sharpErr.message);
        // Fallback: use the client-provided base64 directly (already JPEG from canvas)
        imageBase64 = imageBase64Input;
        console.log(`[ledger/upload] fallback to client base64: ${imageBase64.length} chars`);
      }

      let rawText = "";
      let structured: any = {};
      try {
        const result = await runNvidiaOCRAndStructure(imageBase64, mimeType);
        rawText = result.rawText;
        structured = result.structured;
      } catch (err: any) {
        const msg: string = err.message || "";
        res.status(502).json({ error: `AI processing failed: ${msg}` });
        return;
      }

      // Accept the result if we have either readable text OR structured entries.
      // Only reject if the AI found absolutely nothing and no entries were parsed.
      const hasEntries = Array.isArray(structured.entries) && structured.entries.length > 0;
      const hasText = rawText && rawText.trim().length >= 3;
      if (!hasText && !hasEntries) {
        console.error("[ledger/upload] NVIDIA returned no usable data. rawText:", rawText?.slice(0, 200));
        res.status(422).json({
          error: "The AI could not extract any data from this image. Please ensure the satti is clearly visible, well-lit, and not blurry.",
        });
        return;
      }

      const meta = {
        processedAt: new Date().toISOString(),
        fileSizeKb: Math.round(rawBuf.length / 1024),
        mimeType: "image/jpeg",
      };

      /* Save session to MongoDB */
      let sessionId: string | undefined;
      try {
        await connectMongo();
        const saved = await LedgerSession.create({
          uid,
          rawText,
          entries: structured.entries || [],
          grouped: structured.grouped || {},
          summary: structured.summary || {},
          meta,
        });
        sessionId = String(saved._id);
      } catch (err) {
        console.error("[ledger/upload] MongoDB save failed:", err);
      }

      res.json({
        success: true,
        sessionId,
        rawText,
        ...structured,
        meta,
      });
    } catch (err: any) {
      console.error("[ledger/upload]", err);
      res.status(500).json({ error: err.message || "Unexpected error." });
    }
  }
);

/* ── List sessions ── */
ledgerRouter.get("/sessions", async (req: express.Request, res: express.Response): Promise<void> => {
  try {
    const uid = getUid(req);
    if (!uid) { res.status(401).json({ error: "Unauthorized" }); return; }

    await connectMongo();

    const { q, from, to } = req.query as { q?: string; from?: string; to?: string };

    const filter: Record<string, any> = { uid };
    if (from || to) {
      filter.createdAt = {};
      if (from) filter.createdAt.$gte = new Date(from);
      if (to) filter.createdAt.$lte = new Date(to + "T23:59:59.999Z");
    }

    let sessions = await LedgerSession.find(filter)
      .select("_id summary meta createdAt")
      .sort({ createdAt: -1 })
      .limit(100)
      .lean();

    /* Client-side commodity search */
    if (q) {
      const lower = q.toLowerCase();
      sessions = sessions.filter((s) =>
        (s.summary?.topCommodity || "").toLowerCase().includes(lower)
      );
    }

    res.json({ sessions });
  } catch (err: any) {
    console.error("[ledger/sessions GET]", err);
    res.status(500).json({ error: err.message || "Unexpected error." });
  }
});

ledgerRouter.get("/business-summary", async (req: express.Request, res: express.Response): Promise<void> => {
  try {
    const uid = getUid(req);
    if (!uid) { res.status(401).json({ error: "Unauthorized" }); return; }

    await connectMongo();

    const sessions = await LedgerSession.find({ uid })
      .select("_id grouped summary createdAt")
      .sort({ createdAt: -1 })
      .lean();

    const dailyMap: Record<string, BusinessBucket> = {};
    const monthlyMap: Record<string, BusinessBucket> = {};
    const yearlyMap: Record<string, BusinessBucket> = {};

    for (const session of sessions) {
      const createdAt = new Date(session.createdAt);
      const dayKey = createdAt.toISOString().slice(0, 10);
      const dayLabel = createdAt.toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });
      if (!dailyMap[dayKey]) dailyMap[dayKey] = createBusinessBucket(dayKey, dayLabel);

      const dayBucket = dailyMap[dayKey];
      dayBucket.sessionCount += 1;

      const grouped = session.grouped && typeof session.grouped === "object" ? session.grouped : {};
      const groupedValues = Object.entries(grouped);

      if (groupedValues.length > 0) {
        for (const [key, value] of groupedValues) {
          const group: any = value || {};
          const name = group.displayName || key;
          const quantity = Number(group.totalQuantity ?? group.totalQty ?? 0) || 0;
          const amount = Number(group.totalAmount ?? group.totalAmt ?? 0) || 0;
          const entryCount = Array.isArray(group.entries) ? group.entries.length : 0;
          addCommodityToBucket(dayBucket, name, quantity, amount, entryCount);
        }
      } else {
        addCommodityToBucket(
          dayBucket,
          session.summary?.topCommodity || "Uncategorized",
          Number(session.summary?.totalQuantity) || 0,
          Number(session.summary?.totalAmount) || 0,
          Number(session.summary?.totalEntries) || 0
        );
      }

      dayBucket.totalEntries += Number(session.summary?.totalEntries) || 0;
      dayBucket.totalQuantity += Number(session.summary?.totalQuantity) || 0;
      dayBucket.totalAmount += Number(session.summary?.totalAmount) || 0;
    }

    for (const day of Object.values(dailyMap)) {
      const monthKey = day.key.slice(0, 7);
      const monthDate = new Date(`${monthKey}-01T00:00:00.000Z`);
      const monthLabel = monthDate.toLocaleDateString("en-IN", { month: "long", year: "numeric" });
      if (!monthlyMap[monthKey]) monthlyMap[monthKey] = createBusinessBucket(monthKey, monthLabel);
      addBucketToBucket(monthlyMap[monthKey], day);
    }

    for (const month of Object.values(monthlyMap)) {
      const yearKey = month.key.slice(0, 4);
      if (!yearlyMap[yearKey]) yearlyMap[yearKey] = createBusinessBucket(yearKey, yearKey);
      addBucketToBucket(yearlyMap[yearKey], month);
    }

    res.json({
      daily: Object.values(dailyMap).sort((a, b) => b.key.localeCompare(a.key)).map(finalizeBusinessBucket),
      monthly: Object.values(monthlyMap).sort((a, b) => b.key.localeCompare(a.key)).map(finalizeBusinessBucket),
      yearly: Object.values(yearlyMap).sort((a, b) => b.key.localeCompare(a.key)).map(finalizeBusinessBucket),
    });
  } catch (err: any) {
    console.error("[ledger/business-summary GET]", err);
    res.status(500).json({ error: err.message || "Unexpected error." });
  }
});

/* ── Get single session ── */
ledgerRouter.get("/sessions/:id", async (req: express.Request, res: express.Response): Promise<void> => {
  try {
    const uid = getUid(req);
    if (!uid) { res.status(401).json({ error: "Unauthorized" }); return; }

    await connectMongo();

    const session = await LedgerSession.findOne({ _id: req.params.id, uid }).lean();
    if (!session) { res.status(404).json({ error: "Session not found." }); return; }

    res.json({
      sessionId: String(session._id),
      rawText: session.rawText,
      entries: session.entries,
      grouped: session.grouped,
      summary: session.summary,
      meta: session.meta,
    });
  } catch (err: any) {
    console.error("[ledger/sessions/:id GET]", err);
    res.status(500).json({ error: err.message || "Unexpected error." });
  }
});

/* ── Delete session ── */
ledgerRouter.delete("/sessions/:id", async (req: express.Request, res: express.Response): Promise<void> => {
  try {
    const uid = getUid(req);
    if (!uid) { res.status(401).json({ error: "Unauthorized" }); return; }

    await connectMongo();

    const deleted = await LedgerSession.findOneAndDelete({ _id: req.params.id, uid });
    if (!deleted) { res.status(404).json({ error: "Session not found." }); return; }

    res.json({ success: true });
  } catch (err: any) {
    console.error("[ledger/sessions/:id DELETE]", err);
    res.status(500).json({ error: err.message || "Unexpected error." });
  }
});

/* ── Rebuild grouped & summary from a combined entries array ── */
function rebuildGroupedAndSummary(allEntries: any[]): { grouped: Record<string, any>; summary: any } {
  const grouped: Record<string, any> = {};

  for (const entry of allEntries) {
    const key = (entry.commodityKey || entry.commodity || "unknown").toLowerCase().replace(/\s+/g, "_");
    if (!grouped[key]) {
      grouped[key] = {
        displayName: entry.commodity || key,
        entries: [],
        totalQuantity: 0,
        totalAmount: 0,
        _rateQtyPairs: [] as { rate: number; qty: number }[],
      };
    }
    grouped[key].entries.push(entry.id);
    grouped[key].totalQuantity += Number(entry.quantity) || 0;
    grouped[key].totalAmount += Number(entry.amount) || 0;
    grouped[key]._rateQtyPairs.push({ rate: Number(entry.rate) || 0, qty: Number(entry.quantity) || 0 });
  }

  for (const key of Object.keys(grouped)) {
    const g = grouped[key];
    const rates = g._rateQtyPairs.map((p: any) => p.rate).filter((r: number) => r > 0);
    g.minRate = rates.length > 0 ? Math.min(...rates) : 0;
    g.maxRate = rates.length > 0 ? Math.max(...rates) : 0;
    g.avgRate = g.totalQuantity > 0 ? Math.round(g.totalAmount / g.totalQuantity) : 0;

    const rateMap: Record<number, number> = {};
    for (const p of g._rateQtyPairs) {
      rateMap[p.rate] = (rateMap[p.rate] || 0) + p.qty;
    }
    g.priceDistribution = Object.entries(rateMap).map(([rate, qty]) => ({
      rate: Number(rate),
      quantity: qty,
      percentage: g.totalQuantity > 0 ? Math.round(((qty as number) / g.totalQuantity) * 100) : 0,
    }));

    delete g._rateQtyPairs;
  }

  const totalQuantity = allEntries.reduce((s, e) => s + (Number(e.quantity) || 0), 0);
  const totalAmount = allEntries.reduce((s, e) => s + (Number(e.amount) || 0), 0);
  const topCommodityKey = Object.keys(grouped).sort(
    (a, b) => grouped[b].totalAmount - grouped[a].totalAmount
  )[0] || "";

  const summary = {
    totalEntries: allEntries.length,
    totalQuantity,
    totalAmount,
    commodityCount: Object.keys(grouped).length,
    topCommodity: grouped[topCommodityKey]?.displayName || "",
    processingNote: `Merged data from multiple uploads.`,
  };

  return { grouped, summary };
}

/* ── Append more data to an existing session ── */
ledgerRouter.post(
  "/sessions/:id/append",
  express.json({ limit: "10mb" }),
  async (req: express.Request, res: express.Response): Promise<void> => {
    try {
      const uid = getUid(req);
      if (!uid) { res.status(401).json({ error: "Unauthorized" }); return; }

      if (!NVIDIA_KEY) { res.status(500).json({ error: "NVIDIA API key not configured." }); return; }

      await connectMongo();
      const session = await LedgerSession.findOne({ _id: req.params.id, uid });
      if (!session) { res.status(404).json({ error: "Session not found." }); return; }

      const { image: imageBase64Input, mimeType: inputMime } = req.body || {};
      if (!imageBase64Input || typeof imageBase64Input !== "string") {
        res.status(400).json({ error: "No image provided." });
        return;
      }

      const rawBuf = Buffer.from(imageBase64Input, "base64");
      if (!rawBuf || rawBuf.length < 10) {
        res.status(400).json({ error: "Uploaded image is empty or too small." });
        return;
      }

      console.log(`[ledger/append] received base64 image: ${rawBuf.length}B (mime: ${inputMime})`);

      let imageBase64: string;
      try {
        const pipeline = sharp(rawBuf).rotate().resize({ width: 1280, height: 1280, fit: "inside", withoutEnlargement: true });
        let processed: Buffer | null = null;
        for (const quality of [90, 82, 72, 60]) {
          const candidate = await pipeline.clone().jpeg({ quality, progressive: false }).toBuffer();
          processed = candidate;
          if (candidate.length <= 130 * 1024) break;
        }
        imageBase64 = processed!.toString("base64");
      } catch {
        imageBase64 = imageBase64Input;
      }

      let newRawText = "";
      let newStructured: any = {};
      try {
        const result = await runNvidiaOCRAndStructure(imageBase64, "image/jpeg");
        newRawText = result.rawText;
        newStructured = result.structured;
      } catch (err: any) {
        res.status(502).json({ error: `AI processing failed: ${err.message}` });
        return;
      }

      const hasEntries = Array.isArray(newStructured.entries) && newStructured.entries.length > 0;
      const hasText = newRawText && newRawText.trim().length >= 3;
      if (!hasText && !hasEntries) {
        res.status(422).json({
          error: "The AI could not extract any data from this image. Please ensure the satti is clearly visible, well-lit, and not blurry.",
        });
        return;
      }

      const existingEntries: any[] = session.entries || [];
      const maxId = existingEntries.reduce((m, e) => Math.max(m, Number(e.id) || 0), 0);
      const newEntries: any[] = (newStructured.entries || []).map((e: any, i: number) => ({
        ...e,
        id: maxId + i + 1,
      }));

      const allEntries = [...existingEntries, ...newEntries];
      const { grouped, summary } = rebuildGroupedAndSummary(allEntries);

      const mergedRawText = [session.rawText, newRawText].filter(Boolean).join("\n\n---\n\n");

      session.entries = allEntries;
      session.grouped = grouped;
      session.summary = summary;
      session.rawText = mergedRawText;
      await session.save();

      console.log(`[ledger/append] session ${req.params.id}: ${existingEntries.length} + ${newEntries.length} = ${allEntries.length} entries`);

      res.json({
        success: true,
        sessionId: String(session._id),
        rawText: mergedRawText,
        entries: allEntries,
        grouped,
        summary,
        meta: session.meta,
        appendedCount: newEntries.length,
      });
    } catch (err: any) {
      console.error("[ledger/sessions/:id/append]", err);
      res.status(500).json({ error: err.message || "Unexpected error." });
    }
  }
);
