"use client";

import { useEffect, useMemo, useRef, useState } from "react";

type Tab = "calculator" | "timer" | "notes";

const NOTES_STORAGE_KEY = "plyndrox_payables_notes_v1";
const TIMER_STORAGE_KEY = "plyndrox_payables_timer_v1";

function CalculatorIcon(p: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...p}>
      <rect x="4" y="2" width="16" height="20" rx="2" />
      <line x1="8" y1="6" x2="16" y2="6" />
      <line x1="8" y1="14" x2="8" y2="14" />
      <line x1="12" y1="14" x2="12" y2="14" />
      <line x1="16" y1="14" x2="16" y2="14" />
      <line x1="8" y1="18" x2="8" y2="18" />
      <line x1="12" y1="18" x2="12" y2="18" />
      <line x1="16" y1="18" x2="16" y2="18" />
    </svg>
  );
}
function TimerIcon(p: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...p}>
      <line x1="10" y1="2" x2="14" y2="2" />
      <line x1="12" y1="14" x2="15" y2="11" />
      <circle cx="12" cy="14" r="8" />
    </svg>
  );
}
function NotesIcon(p: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...p}>
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
      <polyline points="14 2 14 8 20 8" />
      <line x1="8" y1="13" x2="16" y2="13" />
      <line x1="8" y1="17" x2="14" y2="17" />
    </svg>
  );
}
function ToolsIcon(p: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...p}>
      <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z" />
    </svg>
  );
}
function XIcon(p: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...p}>
      <line x1="18" y1="6" x2="6" y2="18" />
      <line x1="6" y1="6" x2="18" y2="18" />
    </svg>
  );
}

/* ─── Calculator ─── */
function CalculatorPanel() {
  const [expr, setExpr] = useState("");
  const [result, setResult] = useState<string>("0");

  const compute = (input: string) => {
    if (!input.trim()) return "0";
    if (!/^[0-9+\-*/().%\s]*$/.test(input)) return "Err";
    try {
      // eslint-disable-next-line no-new-func
      const val = Function(`"use strict"; return (${input.replace(/×/g, "*").replace(/÷/g, "/")});`)();
      if (typeof val !== "number" || !isFinite(val)) return "Err";
      return String(Math.round(val * 1e10) / 1e10);
    } catch {
      return "Err";
    }
  };

  const onKey = (k: string) => {
    if (k === "C") { setExpr(""); setResult("0"); return; }
    if (k === "⌫") { const next = expr.slice(0, -1); setExpr(next); setResult(compute(next)); return; }
    if (k === "=") { setExpr(result === "Err" ? expr : result); return; }
    const next = expr + k;
    setExpr(next);
    setResult(compute(next));
  };

  const keys = [
    "C", "⌫", "%", "÷",
    "7", "8", "9", "×",
    "4", "5", "6", "-",
    "1", "2", "3", "+",
    "0", ".", "(", ")",
  ];

  return (
    <div className="flex flex-col gap-3">
      <div className="rounded-xl bg-gray-900 px-4 py-3 text-right">
        <div className="truncate text-xs text-gray-400 min-h-[16px]">{expr || "\u00A0"}</div>
        <div className="truncate text-2xl font-black text-white">{result}</div>
      </div>
      <div className="grid grid-cols-4 gap-2">
        {keys.map((k) => {
          const isOp = ["÷", "×", "-", "+", "%"].includes(k);
          const isAction = ["C", "⌫"].includes(k);
          return (
            <button
              key={k}
              onClick={() => onKey(k)}
              className={`rounded-xl py-3 text-base font-bold transition active:scale-95 ${
                isAction
                  ? "bg-rose-50 text-rose-600 hover:bg-rose-100"
                  : isOp
                  ? "bg-indigo-50 text-indigo-700 hover:bg-indigo-100"
                  : "bg-gray-100 text-gray-900 hover:bg-gray-200"
              }`}
            >
              {k}
            </button>
          );
        })}
        <button
          onClick={() => onKey("=")}
          className="col-span-4 rounded-xl bg-indigo-600 py-3 text-base font-black text-white hover:bg-indigo-700 active:scale-95"
        >
          =
        </button>
      </div>
    </div>
  );
}

/* ─── Timer (Stopwatch + Countdown) ─── */
function TimerPanel() {
  const [mode, setMode] = useState<"stopwatch" | "countdown">("stopwatch");
  const [running, setRunning] = useState(false);
  const [elapsedMs, setElapsedMs] = useState(0);

  // countdown setup
  const [mins, setMins] = useState(5);
  const [secs, setSecs] = useState(0);
  const [remainingMs, setRemainingMs] = useState(0);

  const startedAt = useRef<number | null>(null);
  const baseElapsed = useRef(0);
  const baseRemaining = useRef(0);

  useEffect(() => {
    if (!running) return;
    const id = setInterval(() => {
      const now = Date.now();
      const start = startedAt.current ?? now;
      const dt = now - start;
      if (mode === "stopwatch") {
        setElapsedMs(baseElapsed.current + dt);
      } else {
        const left = Math.max(0, baseRemaining.current - dt);
        setRemainingMs(left);
        if (left <= 0) {
          setRunning(false);
          try {
            // brief beep using Web Audio
            const Ctx = (window as unknown as { AudioContext?: typeof AudioContext; webkitAudioContext?: typeof AudioContext }).AudioContext
              || (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
            if (Ctx) {
              const ctx = new Ctx();
              const o = ctx.createOscillator();
              const g = ctx.createGain();
              o.frequency.value = 880;
              o.connect(g); g.connect(ctx.destination);
              g.gain.setValueAtTime(0.001, ctx.currentTime);
              g.gain.exponentialRampToValueAtTime(0.3, ctx.currentTime + 0.01);
              g.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.6);
              o.start(); o.stop(ctx.currentTime + 0.65);
            }
          } catch {}
        }
      }
    }, 100);
    return () => clearInterval(id);
  }, [running, mode]);

  // Persist & restore minimal state
  useEffect(() => {
    try {
      const raw = localStorage.getItem(TIMER_STORAGE_KEY);
      if (raw) {
        const v = JSON.parse(raw);
        if (typeof v.mins === "number") setMins(v.mins);
        if (typeof v.secs === "number") setSecs(v.secs);
      }
    } catch {}
  }, []);
  useEffect(() => {
    try { localStorage.setItem(TIMER_STORAGE_KEY, JSON.stringify({ mins, secs })); } catch {}
  }, [mins, secs]);

  const start = () => {
    if (mode === "countdown" && remainingMs <= 0) {
      baseRemaining.current = (mins * 60 + secs) * 1000;
      setRemainingMs(baseRemaining.current);
    } else {
      baseElapsed.current = elapsedMs;
      baseRemaining.current = remainingMs;
    }
    startedAt.current = Date.now();
    setRunning(true);
  };
  const pause = () => {
    setRunning(false);
    baseElapsed.current = elapsedMs;
    baseRemaining.current = remainingMs;
  };
  const reset = () => {
    setRunning(false);
    setElapsedMs(0);
    setRemainingMs(0);
    baseElapsed.current = 0;
    baseRemaining.current = 0;
  };

  const display = mode === "stopwatch" ? elapsedMs : remainingMs;
  const m = Math.floor(display / 60000);
  const s = Math.floor((display % 60000) / 1000);
  const cs = Math.floor((display % 1000) / 10);

  return (
    <div className="flex flex-col gap-4">
      <div className="grid grid-cols-2 gap-2 rounded-xl bg-gray-100 p-1">
        {(["stopwatch", "countdown"] as const).map((m2) => (
          <button
            key={m2}
            onClick={() => { setMode(m2); reset(); }}
            className={`rounded-lg py-2 text-sm font-bold capitalize transition ${
              mode === m2 ? "bg-white text-indigo-700 shadow-sm" : "text-gray-500"
            }`}
          >
            {m2}
          </button>
        ))}
      </div>

      <div className="rounded-2xl bg-gradient-to-br from-indigo-600 to-violet-600 px-6 py-8 text-center">
        <div className="font-mono text-5xl font-black tabular-nums text-white">
          {String(m).padStart(2, "0")}:{String(s).padStart(2, "0")}
          <span className="text-2xl text-white/70">.{String(cs).padStart(2, "0")}</span>
        </div>
      </div>

      {mode === "countdown" && !running && (
        <div className="grid grid-cols-2 gap-2">
          <label className="rounded-xl border border-gray-200 px-3 py-2">
            <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400">Minutes</span>
            <input
              type="number" min={0} max={999} value={mins}
              onChange={(e) => setMins(Math.max(0, Math.min(999, Number(e.target.value) || 0)))}
              className="w-full bg-transparent text-lg font-bold text-gray-900 outline-none"
            />
          </label>
          <label className="rounded-xl border border-gray-200 px-3 py-2">
            <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400">Seconds</span>
            <input
              type="number" min={0} max={59} value={secs}
              onChange={(e) => setSecs(Math.max(0, Math.min(59, Number(e.target.value) || 0)))}
              className="w-full bg-transparent text-lg font-bold text-gray-900 outline-none"
            />
          </label>
        </div>
      )}

      <div className="flex gap-2">
        {!running ? (
          <button onClick={start} className="flex-1 rounded-xl bg-emerald-600 py-3 text-sm font-black text-white hover:bg-emerald-700 active:scale-95">
            Start
          </button>
        ) : (
          <button onClick={pause} className="flex-1 rounded-xl bg-amber-500 py-3 text-sm font-black text-white hover:bg-amber-600 active:scale-95">
            Pause
          </button>
        )}
        <button onClick={reset} className="flex-1 rounded-xl border border-gray-200 bg-white py-3 text-sm font-black text-gray-700 hover:bg-gray-50 active:scale-95">
          Reset
        </button>
      </div>
    </div>
  );
}

/* ─── Notes ─── */
function NotesPanel() {
  const [text, setText] = useState("");
  const [saved, setSaved] = useState(false);
  const initialized = useRef(false);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(NOTES_STORAGE_KEY);
      if (raw) setText(raw);
    } catch {}
    initialized.current = true;
  }, []);

  useEffect(() => {
    if (!initialized.current) return;
    try { localStorage.setItem(NOTES_STORAGE_KEY, text); } catch {}
    setSaved(true);
    const t = setTimeout(() => setSaved(false), 800);
    return () => clearTimeout(t);
  }, [text]);

  const charCount = text.length;
  const wordCount = useMemo(() => text.trim() ? text.trim().split(/\s+/).length : 0, [text]);

  return (
    <div className="flex flex-col gap-3">
      <textarea
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder="Quick notes — vendor reminders, payment refs, follow-ups… auto-saved on this device."
        className="min-h-[220px] w-full resize-y rounded-xl border border-gray-200 bg-white p-3 text-sm leading-relaxed text-gray-800 outline-none focus:border-indigo-300 focus:ring-2 focus:ring-indigo-100"
      />
      <div className="flex items-center justify-between text-[11px] font-semibold text-gray-400">
        <span>{wordCount} words • {charCount} chars</span>
        <span className={`transition ${saved ? "text-emerald-600" : "opacity-0"}`}>Saved ✓</span>
      </div>
      <div className="flex gap-2">
        <button
          onClick={() => {
            if (navigator.clipboard) navigator.clipboard.writeText(text);
          }}
          className="flex-1 rounded-xl border border-gray-200 bg-white py-2.5 text-xs font-bold text-gray-700 hover:bg-gray-50"
        >
          Copy
        </button>
        <button
          onClick={() => { if (confirm("Clear all notes?")) setText(""); }}
          className="flex-1 rounded-xl border border-rose-200 bg-rose-50 py-2.5 text-xs font-bold text-rose-700 hover:bg-rose-100"
        >
          Clear
        </button>
      </div>
    </div>
  );
}

/* ─── Floating launcher + sheet ─── */
export default function PayablesTools() {
  const [open, setOpen] = useState(false);
  const [tab, setTab] = useState<Tab>("calculator");

  // Esc to close
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") setOpen(false); };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  return (
    <>
      {/* Floating launcher */}
      <button
        onClick={() => setOpen(true)}
        aria-label="Open tools"
        className="fixed bottom-20 right-4 z-40 flex h-12 w-12 items-center justify-center rounded-full bg-indigo-600 text-white shadow-xl shadow-indigo-600/30 transition hover:bg-indigo-700 active:scale-95 md:bottom-6 md:right-6 md:h-14 md:w-14"
      >
        <ToolsIcon className="h-5 w-5 md:h-6 md:w-6" />
      </button>

      {/* Sheet */}
      {open && (
        <div className="fixed inset-0 z-[60]">
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setOpen(false)} />
          <div className="absolute inset-x-0 bottom-0 max-h-[88vh] overflow-hidden rounded-t-3xl bg-white shadow-2xl md:inset-x-auto md:bottom-6 md:right-6 md:top-auto md:w-[400px] md:rounded-3xl">
            {/* Drag handle (mobile) */}
            <div className="flex justify-center pt-2 md:hidden">
              <div className="h-1 w-10 rounded-full bg-gray-200" />
            </div>

            {/* Header */}
            <div className="flex items-center justify-between border-b border-gray-100 px-4 py-3">
              <h3 className="text-sm font-black text-gray-900">Quick Tools</h3>
              <button onClick={() => setOpen(false)} className="rounded-lg p-1.5 text-gray-400 hover:bg-gray-100 hover:text-gray-700">
                <XIcon className="h-4 w-4" />
              </button>
            </div>

            {/* Tabs */}
            <div className="grid grid-cols-3 gap-1 border-b border-gray-100 bg-gray-50 p-2">
              {([
                { k: "calculator" as const, label: "Calculator", Icon: CalculatorIcon },
                { k: "timer" as const,      label: "Timer",      Icon: TimerIcon },
                { k: "notes" as const,      label: "Notes",      Icon: NotesIcon },
              ]).map(({ k, label, Icon }) => (
                <button
                  key={k}
                  onClick={() => setTab(k)}
                  className={`flex flex-col items-center gap-1 rounded-lg py-2 text-[11px] font-bold transition ${
                    tab === k ? "bg-white text-indigo-700 shadow-sm" : "text-gray-500 hover:text-gray-700"
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  {label}
                </button>
              ))}
            </div>

            {/* Body */}
            <div className="overflow-y-auto px-4 py-4" style={{ maxHeight: "calc(88vh - 130px)" }}>
              {tab === "calculator" && <CalculatorPanel />}
              {tab === "timer" && <TimerPanel />}
              {tab === "notes" && <NotesPanel />}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
