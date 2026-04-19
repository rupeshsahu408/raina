import express from "express";
import multer from "multer";
import { connectMongo } from "./db";
import { LedgerSession } from "./models/LedgerSession";

export const ledgerRouter = express.Router();

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 }, // 10 MB — keeps base64 well under Gemini's 20 MB inline limit
  fileFilter: (_req, file, cb) => {
    if (file.mimetype.startsWith("image/")) cb(null, true);
    else cb(new Error("Only image files are supported."));
  },
});

const GEMINI_KEY = process.env.GEMINI_API_KEY || "";

function getUid(req: express.Request): string {
  return (req as any).user?.uid ?? "";
}

async function runGeminiOCRAndStructure(imageBase64: string, mimeType: string): Promise<{ rawText: string; structured: any }> {
  const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${GEMINI_KEY}`;

  const prompt = `You are an expert accounting assistant specializing in Indian grain trader records (सट्टी / satti).

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
6. Calculate per-group: totalQuantity, totalAmount, rates array, minRate, maxRate, avgRate, priceDistribution (% of qty at each price point)
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
}`;

  const body = {
    contents: [
      {
        parts: [
          { text: prompt },
          {
            inline_data: {
              mime_type: mimeType,
              data: imageBase64,
            },
          },
        ],
      },
    ],
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
    const parsed = JSON.parse(cleaned);
    return {
      rawText: parsed.rawText || "",
      structured: {
        entries: parsed.entries || [],
        grouped: parsed.grouped || {},
        summary: parsed.summary || {},
      },
    };
  } catch {
    return {
      rawText: "",
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

      if (!GEMINI_KEY) {
        res.status(500).json({ error: "Gemini API key not configured." });
        return;
      }

      // Reject HEIC/HEIF — Gemini inline_data does not support these formats
      const rawMime = req.file.mimetype.toLowerCase();
      if (rawMime === "image/heic" || rawMime === "image/heif") {
        res.status(415).json({
          error: "HEIC/HEIF images are not supported. Please convert your photo to JPEG or PNG before uploading (most phones let you share as JPEG).",
        });
        return;
      }

      // Validate image buffer has valid magic bytes
      const buf = req.file.buffer;
      const isJpeg = buf[0] === 0xff && buf[1] === 0xd8 && buf[2] === 0xff;
      const isPng  = buf[0] === 0x89 && buf[1] === 0x50 && buf[2] === 0x4e && buf[3] === 0x47;
      const isWebp = buf.slice(0, 4).toString("ascii") === "RIFF" && buf.slice(8, 12).toString("ascii") === "WEBP";
      const isGif  = buf.slice(0, 6).toString("ascii").startsWith("GIF");

      if (!isJpeg && !isPng && !isWebp && !isGif) {
        res.status(400).json({
          error: "Unrecognized image format. Please upload a JPEG, PNG, or WebP photo of your satti.",
        });
        return;
      }

      // Determine correct MIME type from actual magic bytes (overrides browser-reported type)
      let mimeType = "image/jpeg";
      if (isPng)  mimeType = "image/png";
      if (isWebp) mimeType = "image/webp";
      if (isGif)  mimeType = "image/gif";

      const imageBase64 = buf.toString("base64");

      let rawText = "";
      let structured: any = {};
      try {
        const result = await runGeminiOCRAndStructure(imageBase64, mimeType);
        rawText = result.rawText;
        structured = result.structured;
      } catch (err: any) {
        const msg: string = err.message || "";
        if (msg.includes("Unable to process input image")) {
          res.status(422).json({
            error: "The image could not be read. Please take a clearer photo with good lighting, or try a JPEG/PNG format.",
          });
        } else {
          res.status(502).json({ error: `AI processing failed: ${msg}` });
        }
        return;
      }

      if (!rawText || rawText.trim().length < 3) {
        res.status(422).json({
          error: "No text could be extracted from the image. Please use a clearer photo with good lighting.",
        });
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
