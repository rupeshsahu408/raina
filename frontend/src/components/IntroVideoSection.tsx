"use client";

import { useEffect, useRef, useState } from "react";

const WIDTH = 1280;
const HEIGHT = 720;
const DURATION = 36;

const scenes = [
  { end: 5.5, title: "Plyndrox AI", subtitle: "Intelligence built for life and work", accent: "#6366f1" },
  { end: 11.5, title: "Personal companion", subtitle: "Daily support, memory, web search, study help, and calm conversation", accent: "#8b5cf6" },
  { end: 17.5, title: "Business automation", subtitle: "WhatsApp, web agents, email intelligence, leads, and clean customer handoffs", accent: "#10b981" },
  { end: 23.5, title: "Finance workflows", subtitle: "Invoices, approvals, payment scheduling, exports, and supplier portals", accent: "#0ea5e9" },
  { end: 29.5, title: "Hiring and ledgers", subtitle: "Recruiting pipelines, candidate screening, smart accounting, and reports", accent: "#f59e0b" },
  { end: 36, title: "One focused platform", subtitle: "Seven AI workspaces, mobile-first design, human-in-loop control", accent: "#ec4899" },
];

const products = [
  ["Personal AI", "#6366f1"],
  ["Bihar AI", "#f97316"],
  ["Business AI", "#10b981"],
  ["Inbox AI", "#f43f5e"],
  ["Payable AI", "#0ea5e9"],
  ["Recruit AI", "#9333ea"],
  ["Smart Ledger", "#f59e0b"],
];

function ease(t: number) {
  return 1 - Math.pow(1 - Math.max(0, Math.min(1, t)), 3);
}

function lerp(a: number, b: number, t: number) {
  return a + (b - a) * t;
}

function roundedRect(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number) {
  const radius = Math.min(r, w / 2, h / 2);
  ctx.beginPath();
  ctx.moveTo(x + radius, y);
  ctx.arcTo(x + w, y, x + w, y + h, radius);
  ctx.arcTo(x + w, y + h, x, y + h, radius);
  ctx.arcTo(x, y + h, x, y, radius);
  ctx.arcTo(x, y, x + w, y, radius);
  ctx.closePath();
}

function drawText(ctx: CanvasRenderingContext2D, text: string, x: number, y: number, maxWidth: number, lineHeight: number) {
  const words = text.split(" ");
  let line = "";
  const lines: string[] = [];
  for (const word of words) {
    const test = line ? `${line} ${word}` : word;
    if (ctx.measureText(test).width > maxWidth && line) {
      lines.push(line);
      line = word;
    } else {
      line = test;
    }
  }
  lines.push(line);
  lines.forEach((item, index) => ctx.fillText(item, x, y + index * lineHeight));
}

function drawFrame(ctx: CanvasRenderingContext2D, seconds: number) {
  const t = seconds % DURATION;
  const sceneIndex = scenes.findIndex((scene) => t < scene.end);
  const safeSceneIndex = sceneIndex === -1 ? scenes.length - 1 : sceneIndex;
  const scene = scenes[safeSceneIndex];
  const sceneStart = safeSceneIndex === 0 ? 0 : scenes[safeSceneIndex - 1].end;
  const local = (t - sceneStart) / (scene.end - sceneStart);
  const inEase = ease(local);
  const pulse = Math.sin(t * 1.4) * 0.5 + 0.5;

  const gradient = ctx.createLinearGradient(0, 0, WIDTH, HEIGHT);
  gradient.addColorStop(0, "#050816");
  gradient.addColorStop(0.5, "#111827");
  gradient.addColorStop(1, "#18112f");
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, WIDTH, HEIGHT);

  for (let i = 0; i < 34; i++) {
    const x = ((i * 127 + t * 18) % (WIDTH + 120)) - 60;
    const y = (i * 71 + Math.sin(t * 0.8 + i) * 22) % HEIGHT;
    ctx.globalAlpha = 0.08 + (i % 4) * 0.025;
    ctx.fillStyle = i % 2 ? scene.accent : "#ffffff";
    ctx.beginPath();
    ctx.arc(x, y, 2 + (i % 5), 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.globalAlpha = 1;

  const glow = ctx.createRadialGradient(lerp(180, 980, pulse), lerp(120, 520, 1 - pulse), 30, lerp(180, 980, pulse), lerp(120, 520, 1 - pulse), 430);
  glow.addColorStop(0, `${scene.accent}66`);
  glow.addColorStop(1, "rgba(0,0,0,0)");
  ctx.fillStyle = glow;
  ctx.fillRect(0, 0, WIDTH, HEIGHT);

  ctx.save();
  ctx.translate(860 + Math.sin(t * 0.35) * 18, 350 + Math.cos(t * 0.3) * 14);
  ctx.rotate(-0.08 + Math.sin(t * 0.2) * 0.025);
  ctx.shadowColor = "rgba(0,0,0,0.45)";
  ctx.shadowBlur = 36;
  roundedRect(ctx, -245, -168, 490, 336, 30);
  ctx.fillStyle = "rgba(255,255,255,0.10)";
  ctx.fill();
  ctx.strokeStyle = "rgba(255,255,255,0.22)";
  ctx.lineWidth = 2;
  ctx.stroke();
  ctx.shadowBlur = 0;
  ctx.fillStyle = "rgba(255,255,255,0.82)";
  ctx.font = "700 20px Inter, Arial, sans-serif";
  ctx.fillText("Plyndrox command center", -205, -115);
  for (let i = 0; i < 4; i++) {
    const y = -65 + i * 62;
    roundedRect(ctx, -205, y, 410, 42, 14);
    ctx.fillStyle = "rgba(255,255,255,0.10)";
    ctx.fill();
    ctx.fillStyle = products[(i + safeSceneIndex) % products.length][1];
    roundedRect(ctx, -190, y + 12, 120 + Math.sin(t + i) * 24, 10, 5);
    ctx.fill();
    ctx.fillStyle = "rgba(255,255,255,0.46)";
    roundedRect(ctx, -190, y + 27, 230, 6, 3);
    ctx.fill();
  }
  ctx.restore();

  products.forEach(([name, color], index) => {
    const angle = t * 0.28 + index * ((Math.PI * 2) / products.length);
    const radius = 170 + Math.sin(t * 0.5 + index) * 12;
    const x = 928 + Math.cos(angle) * radius;
    const y = 350 + Math.sin(angle) * radius * 0.62;
    ctx.globalAlpha = 0.82;
    roundedRect(ctx, x - 58, y - 18, 116, 36, 18);
    ctx.fillStyle = `${color}33`;
    ctx.fill();
    ctx.strokeStyle = `${color}88`;
    ctx.stroke();
    ctx.fillStyle = "#ffffff";
    ctx.font = "700 12px Inter, Arial, sans-serif";
    ctx.textAlign = "center";
    ctx.fillText(name, x, y + 4);
  });
  ctx.globalAlpha = 1;
  ctx.textAlign = "left";

  const titleY = lerp(342, 278, inEase);
  ctx.fillStyle = "#ffffff";
  ctx.font = "900 72px Inter, Arial, sans-serif";
  ctx.letterSpacing = "-2px";
  ctx.fillText(scene.title, 92, titleY);
  ctx.font = "500 30px Inter, Arial, sans-serif";
  ctx.fillStyle = "rgba(255,255,255,0.74)";
  drawText(ctx, scene.subtitle, 96, titleY + 58, 560, 40);

  ctx.font = "800 17px Inter, Arial, sans-serif";
  ctx.fillStyle = scene.accent;
  roundedRect(ctx, 94, 154, 250, 42, 21);
  ctx.fillStyle = `${scene.accent}2b`;
  ctx.fill();
  ctx.strokeStyle = `${scene.accent}66`;
  ctx.stroke();
  ctx.fillStyle = "#ffffff";
  ctx.fillText("36-second product intro", 122, 181);

  ctx.strokeStyle = `${scene.accent}cc`;
  ctx.lineWidth = 5;
  ctx.beginPath();
  ctx.moveTo(96, 520);
  ctx.lineTo(96 + 460 * ((t % DURATION) / DURATION), 520);
  ctx.stroke();
  ctx.fillStyle = "rgba(255,255,255,0.46)";
  ctx.font = "600 15px Inter, Arial, sans-serif";
  ctx.fillText("Personal • Regional • Business • Email • Finance • Hiring • Ledger", 96, 560);

  if (safeSceneIndex === scenes.length - 1) {
    ctx.globalAlpha = ease(local);
    ctx.fillStyle = "#ffffff";
    ctx.font = "900 38px Inter, Arial, sans-serif";
    ctx.fillText("Fast-loading. Frontend-only. Downloadable.", 96, 628);
    ctx.globalAlpha = 1;
  }
}

export function IntroVideoSection() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [isRecording, setIsRecording] = useState(false);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    let frame = 0;
    const start = performance.now();
    const render = (now: number) => {
      drawFrame(ctx, (now - start) / 1000);
      frame = requestAnimationFrame(render);
    };
    frame = requestAnimationFrame(render);
    return () => cancelAnimationFrame(frame);
  }, []);

  async function downloadVideo() {
    const canvas = canvasRef.current;
    if (!canvas || isRecording || !("MediaRecorder" in window)) return;
    setIsRecording(true);
    const stream = canvas.captureStream(30);
    const chunks: BlobPart[] = [];
    const mimeType = MediaRecorder.isTypeSupported("video/webm;codecs=vp9") ? "video/webm;codecs=vp9" : "video/webm";
    const recorder = new MediaRecorder(stream, { mimeType, videoBitsPerSecond: 2200000 });
    recorder.ondataavailable = (event) => {
      if (event.data.size) chunks.push(event.data);
    };
    recorder.onstop = () => {
      const blob = new Blob(chunks, { type: "video/webm" });
      const url = URL.createObjectURL(blob);
      const anchor = document.createElement("a");
      anchor.href = url;
      anchor.download = "plyndrox-ai-intro-video.webm";
      anchor.click();
      URL.revokeObjectURL(url);
      setIsRecording(false);
    };
    recorder.start();
    window.setTimeout(() => recorder.stop(), DURATION * 1000);
  }

  return (
    <section className="relative overflow-hidden border-t border-zinc-900 bg-zinc-950 py-24">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(99,102,241,0.22),transparent_35%),radial-gradient(circle_at_bottom_right,rgba(236,72,153,0.16),transparent_38%)]" />
      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mb-12 flex flex-col justify-between gap-6 md:flex-row md:items-end">
          <div>
            <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-indigo-500/30 bg-indigo-500/10 px-3 py-1 text-xs font-semibold text-indigo-300">
              <span className="h-2 w-2 rounded-full bg-indigo-400" />
              Intro video
            </div>
            <h2 className="text-3xl font-extrabold tracking-tight text-white sm:text-4xl">See Plyndrox in 36 seconds</h2>
            <p className="mt-4 max-w-2xl text-sm leading-6 text-zinc-400 sm:text-base">
              A lightweight visual overview of the Plyndrox AI suite, designed to load fast on the landing page and run entirely in the browser.
            </p>
          </div>
          <button
            type="button"
            onClick={downloadVideo}
            disabled={isRecording}
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-white px-5 py-3 text-sm font-bold text-zinc-950 shadow-lg shadow-indigo-950/20 transition hover:-translate-y-0.5 hover:bg-indigo-50 disabled:cursor-wait disabled:opacity-70"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /><polyline points="7 10 12 15 17 10" /><line x1="12" x2="12" y1="15" y2="3" /></svg>
            {isRecording ? "Preparing download..." : "Download video"}
          </button>
        </div>
        <div className="relative mx-auto max-w-5xl overflow-hidden rounded-3xl border border-white/10 bg-zinc-900 shadow-2xl shadow-black/40">
          <canvas ref={canvasRef} width={WIDTH} height={HEIGHT} className="block aspect-video h-auto w-full" aria-label="Plyndrox AI intro advertisement video" />
          {isRecording && (
            <div className="absolute inset-x-4 bottom-4 rounded-2xl border border-white/10 bg-black/60 px-4 py-3 text-center text-sm font-semibold text-white backdrop-blur-md">
              Recording the full 36-second video for download. Please keep this tab open.
            </div>
          )}
        </div>
      </div>
    </section>
  );
}