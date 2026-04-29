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
        <div style={{ display: "flex", alignItems: "center", gap: 20 }}>
          <div
            style={{
              width: 96,
              height: 96,
              borderRadius: 24,
              background:
                "linear-gradient(135deg, #0A0815 0%, #1A1140 55%, #2A0E4A 100%)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              position: "relative",
              boxShadow: "0 12px 48px rgba(124,58,237,0.45)",
              border: "1px solid rgba(167,139,250,0.28)",
              overflow: "hidden",
            }}
          >
            <div
              style={{
                position: "absolute",
                width: 28,
                height: 64,
                borderRadius: "50%",
                top: 8,
                left: 28,
                background:
                  "linear-gradient(180deg, #FFE3F3 0%, #F472B6 45%, #9D174D 100%)",
                transform: "rotate(-30deg)",
                display: "flex",
              }}
            />
            <div
              style={{
                position: "absolute",
                width: 28,
                height: 64,
                borderRadius: "50%",
                top: 24,
                left: 40,
                background:
                  "linear-gradient(180deg, #CFFAFE 0%, #22D3EE 45%, #1E3A8A 100%)",
                transform: "rotate(90deg)",
                display: "flex",
              }}
            />
            <div
              style={{
                position: "absolute",
                width: 28,
                height: 64,
                borderRadius: "50%",
                top: 32,
                left: 28,
                background:
                  "linear-gradient(180deg, #EDE9FE 0%, #A78BFA 45%, #4C1D95 100%)",
                transform: "rotate(210deg)",
                display: "flex",
              }}
            />
            <div
              style={{
                position: "absolute",
                width: 22,
                height: 22,
                borderRadius: "100%",
                top: 37,
                left: 37,
                background: "#FFFFFF",
                boxShadow: "0 0 24px rgba(255,255,255,0.85)",
                display: "flex",
              }}
            />
          </div>
          <div
            style={{
              fontSize: 40,
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
