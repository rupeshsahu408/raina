import express from "express";
import multer from "multer";
import { connectMongo } from "./db";
import { LedgerSession } from "./models/LedgerSession";

export const ledgerRouter = express.Router();

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 15 * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    if (file.mimetype.startsWith("image/")) cb(null, true);
    else cb(new Error("Only image files are supported."));
  },
});

const VISION_KEY = process.env.GOOGLE_VISION_API_KEY || "";
const GEMINI_KEY = process.env.GEMINI_API_KEY || "";

function getUid(req: express.Request): string {
  return (req as any).user?.uid ?? "";
}

async function runGoogleVisionOCR(imageBase64: string): Promise<string> {
  const url = `https://vision.googleapis.com/v1/images:annotate?key=${VISION_KEY}`;
  const body = {
    requests: [
      {
        image: { content: imageBase64 },
        features: [{ type: "DOCUMENT_TEXT_DETECTION" }],
      },
    ],
  };
  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Google Vision error: ${err}`);
  }
  const data: any = await res.json();
  const text: string =
    data?.responses?.[0]?.fullTextAnnotation?.text ||
    data?.responses?.[0]?.textAnnotations?.[0]?.description ||
    "";
  return text.trim();
}

async function runGeminiStructure(rawText: string): Promise<any> {
  const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${GEMINI_KEY}`;

  const prompt = `You are an expert accounting assistant specializing in Indian grain trader records (सट्टी / satti).

A handwritten satti record has been scanned and OCR-extracted. The raw extracted text is below. It may contain:
- Hindi commodity names (गेहू, चावल, सरसों, मक्का, दाल, etc.) or English (Gehu, Chawal, Sarson, Maize, Dal, etc.)
- Numbers in English (24, 25) or Hindi numerals (२४, २५)
- Rate per quintal, quantity in quintals or kg, and sometimes a calculated total
- Multiple entries, possibly mixed formatting

Your task is to parse this into clean structured JSON. Rules:
1. Convert Hindi numerals to English (२४ → 24)
2. Normalize commodity names to a clean display form (keep the original language but capitalize properly)
3. For each entry extract: commodity, rate (per quintal, as number), quantity (as number, assume quintals unless kg explicitly mentioned), unit ("qtl" or "kg"), amount (rate × quantity, calculate if missing)
4. If a field is unclear, make your best guess and set "uncertain": true for that entry
5. Group entries by commodity (case-insensitive, treat हिंदी and English names for same grain as same group)
6. Calculate per-group: totalQuantity, totalAmount, rates array, minRate, maxRate, avgRate, priceDistribution (% of qty at each price point)
7. Calculate overall: totalQuantity, totalAmount, commodityCount

Respond ONLY with valid JSON, no explanation, no markdown code blocks. Use this exact structure:
{
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
      "entries": [array of entry ids],
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
}

Raw OCR text to parse:
---
${rawText}
---`;

  const body = {
    contents: [{ parts: [{ text: prompt }] }],
    generationConfig: {
      temperature: 0.1,
      maxOutputTokens: 4096,
    },
  };

  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Gemini error: ${err}`);
  }

  const data: any = await res.json();
  const rawJson: string =
    data?.candidates?.[0]?.content?.parts?.[0]?.text || "{}";

  const cleaned = rawJson
    .replace(/^```json\s*/i, "")
    .replace(/^```\s*/i, "")
    .replace(/\s*```$/i, "")
    .trim();

  try {
    return JSON.parse(cleaned);
  } catch {
    return {
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
    };
  }
}

/* ── Upload & Process ── */
ledgerRouter.post(
  "/upload",
  upload.single("satti"),
  async (req: express.Request, res: express.Response): Promise<void> => {
    try {
      const uid = getUid(req);
      if (!uid) {
        res.status(401).json({ error: "Unauthorized" });
        return;
      }

      if (!req.file) {
        res.status(400).json({ error: "No image file provided." });
        return;
      }

      if (!VISION_KEY) {
        res.status(500).json({ error: "Google Vision API key not configured." });
        return;
      }
      if (!GEMINI_KEY) {
        res.status(500).json({ error: "Gemini API key not configured." });
        return;
      }

      const imageBase64 = req.file.buffer.toString("base64");

      let rawText = "";
      try {
        rawText = await runGoogleVisionOCR(imageBase64);
      } catch (err: any) {
        res.status(502).json({ error: `OCR failed: ${err.message}` });
        return;
      }

      if (!rawText || rawText.trim().length < 3) {
        res.status(422).json({
          error: "No text could be extracted from the image. Please use a clearer photo with good lighting.",
        });
        return;
      }

      let structured: any = {};
      try {
        structured = await runGeminiStructure(rawText);
      } catch (err: any) {
        res.status(502).json({ error: `AI analysis failed: ${err.message}` });
        return;
      }

      const meta = {
        processedAt: new Date().toISOString(),
        fileSizeKb: Math.round(req.file.size / 1024),
        mimeType: req.file.mimetype,
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
