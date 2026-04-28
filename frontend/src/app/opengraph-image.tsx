import { ImageResponse } from "next/og";

export const runtime = "edge";

export const alt = "Plyndrox AI — Every AI Tool You Need. Free for Everyone.";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function OpengraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "flex-start",
          justifyContent: "space-between",
          background:
            "radial-gradient(ellipse at top left, #1f1147 0%, #09090b 55%, #000 100%)",
          padding: "72px 80px",
          fontFamily: "system-ui, -apple-system, Segoe UI, sans-serif",
          color: "#f8fafc",
          position: "relative",
        }}
      >
        <div
          style={{
            position: "absolute",
            top: -200,
            right: -200,
            width: 600,
            height: 600,
            borderRadius: "100%",
            background:
              "radial-gradient(circle, rgba(168,85,247,0.45) 0%, rgba(168,85,247,0) 70%)",
            display: "flex",
          }}
        />
        <div
          style={{
            position: "absolute",
            bottom: -160,
            left: -160,
            width: 520,
            height: 520,
            borderRadius: "100%",
            background:
              "radial-gradient(circle, rgba(56,189,248,0.35) 0%, rgba(56,189,248,0) 70%)",
            display: "flex",
          }}
        />
        <div style={{ display: "flex", alignItems: "center", gap: 18 }}>
          <div
            style={{
              width: 72,
              height: 72,
              borderRadius: 18,
              background: "#fff",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "#09090b",
              fontSize: 40,
              fontWeight: 800,
            }}
          >
            P
          </div>
          <div
            style={{
              fontSize: 36,
              fontWeight: 700,
              letterSpacing: "-0.02em",
            }}
          >
            Plyndrox AI
          </div>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 24, maxWidth: 980 }}>
          <div
            style={{
              fontSize: 76,
              fontWeight: 800,
              lineHeight: 1.05,
              letterSpacing: "-0.03em",
            }}
          >
            Every AI tool you need.
            <br />
            <span style={{ color: "#a78bfa" }}>Free for everyone.</span>
          </div>
          <div
            style={{
              fontSize: 30,
              color: "rgba(248,250,252,0.72)",
              lineHeight: 1.3,
              maxWidth: 980,
            }}
          >
            Personal AI · WhatsApp AI · Email Intelligence · Invoice Automation ·
            AI Hiring · Regional AI · Smart Ledger
          </div>
        </div>

        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            width: "100%",
            fontSize: 22,
            color: "rgba(248,250,252,0.55)",
          }}
        >
          <div style={{ display: "flex" }}>plyndrox.app</div>
          <div
            style={{
              display: "flex",
              padding: "10px 20px",
              borderRadius: 999,
              background: "rgba(255,255,255,0.08)",
              border: "1px solid rgba(255,255,255,0.18)",
              color: "#f8fafc",
              fontWeight: 600,
            }}
          >
            7 AI workspaces · 1 platform
          </div>
        </div>
      </div>
    ),
    { ...size }
  );
}
