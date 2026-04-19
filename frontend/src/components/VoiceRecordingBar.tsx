"use client";

import { useEffect, useRef } from "react";

interface VoiceRecordingBarProps {
  analyserRef: React.MutableRefObject<AnalyserNode | null>;
  isTranscribing?: boolean;
  onCancel: () => void;
  onConfirm: () => void;
  accent?: "violet" | "amber";
}

export function VoiceRecordingBar({
  analyserRef,
  isTranscribing = false,
  onCancel,
  onConfirm,
  accent = "violet",
}: VoiceRecordingBarProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const rafRef = useRef<number>(0);
  const historyRef = useRef<number[]>([]);
  const MAX_HISTORY = 80;

  const confirmColor = accent === "violet" ? "#8b5cf6" : "#f59e0b";

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const draw = () => {
      rafRef.current = requestAnimationFrame(draw);

      const W = canvas.offsetWidth || 300;
      const H = canvas.height;
      canvas.width = W;
      ctx.clearRect(0, 0, W, H);

      const analyser = analyserRef.current;
      let currentLevel = 0;

      if (analyser) {
        const freqData = new Uint8Array(analyser.frequencyBinCount);
        analyser.getByteFrequencyData(freqData);
        const slice = freqData.slice(0, Math.floor(freqData.length * 0.6));
        const sum = slice.reduce((a, b) => a + b, 0);
        currentLevel = sum / slice.length / 255;
      }

      historyRef.current.push(currentLevel);
      if (historyRef.current.length > MAX_HISTORY) {
        historyRef.current.shift();
      }

      const barCount = historyRef.current.length;
      const barW = Math.max(2, (W - 80) / MAX_HISTORY - 1.5);
      const startX = 8;

      for (let i = 0; i < barCount; i++) {
        const val = historyRef.current[i];
        const age = barCount - i;
        const isRecent = age <= 20;

        if (!isRecent || val < 0.02) {
          const dotR = 1.5;
          const x = startX + (i / MAX_HISTORY) * (W - 80);
          const y = H / 2;
          ctx.beginPath();
          ctx.arc(x, y, dotR, 0, Math.PI * 2);
          ctx.fillStyle = "rgba(255,255,255,0.25)";
          ctx.fill();
        } else {
          const minH = 4;
          const maxH = H * 0.85;
          const barH = minH + val * (maxH - minH);
          const x = startX + (i / MAX_HISTORY) * (W - 80);
          const y = (H - barH) / 2;
          const alpha = 0.5 + val * 0.5;

          ctx.beginPath();
          if (ctx.roundRect) {
            ctx.roundRect(x, y, barW, barH, 1.5);
          } else {
            ctx.rect(x, y, barW, barH);
          }
          ctx.fillStyle = `rgba(255,255,255,${alpha})`;
          ctx.fill();
        }
      }
    };

    draw();
    return () => cancelAnimationFrame(rafRef.current);
  }, [analyserRef]);

  return (
    <div className="flex items-center gap-2 rounded-2xl border border-white/[0.09] bg-[#1a1a1a] px-3 py-3 shadow-xl">
      <canvas
        ref={canvasRef}
        height={44}
        className="flex-1 min-w-0"
        style={{ display: "block" }}
      />

      <div className="flex items-center gap-1.5 shrink-0 pl-2 border-l border-white/[0.08]">
        <button
          type="button"
          onClick={onCancel}
          disabled={isTranscribing}
          title="Cancel"
          className="flex h-8 w-8 items-center justify-center rounded-full border border-white/[0.1] text-gray-500 transition hover:border-white/20 hover:text-[#1d2226] disabled:opacity-40"
        >
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none">
            <path d="M18 6 6 18M6 6l12 12" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" />
          </svg>
        </button>

        <button
          type="button"
          onClick={onConfirm}
          disabled={isTranscribing}
          title={isTranscribing ? "Transcribing…" : "Done"}
          className="flex h-8 w-8 items-center justify-center rounded-full transition disabled:opacity-60"
          style={{ backgroundColor: confirmColor }}
        >
          {isTranscribing ? (
            <svg className="animate-spin" width="14" height="14" viewBox="0 0 24 24" fill="none">
              <circle cx="12" cy="12" r="10" stroke="white" strokeWidth="3" strokeDasharray="31.4" strokeDashoffset="10" strokeLinecap="round" />
            </svg>
          ) : (
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none">
              <path d="M20 6L9 17l-5-5" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          )}
        </button>
      </div>
    </div>
  );
}
