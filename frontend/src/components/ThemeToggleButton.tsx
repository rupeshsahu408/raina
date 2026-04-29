"use client";

import { CSSProperties, useRef, useEffect, useState } from "react";
import { Theme, useTheme } from "@/components/ThemeProvider";

type ThemeOption = {
  id: Theme;
  name: string;
  swatches: string[];
};

const THEMES: ThemeOption[] = [
  { id: "white", name: "White", swatches: ["#ffffff", "#f8fafc", "#7c3aed"] },
  { id: "dark", name: "Dark", swatches: ["#0f172a", "#111827", "#a78bfa"] },
  { id: "green", name: "Green", swatches: ["#f0fdf4", "#dcfce7", "#16a34a"] },
  { id: "reading", name: "Reading", swatches: ["#fff8ed", "#f8ecd7", "#b7791f"] },
  { id: "ocean", name: "Ocean", swatches: ["#eff6ff", "#dbeafe", "#2563eb"] },
  { id: "rose", name: "Rose", swatches: ["#fff1f2", "#ffe4e6", "#e11d48"] },
  { id: "auto", name: "Auto", swatches: ["#ffffff", "#0f172a", "#7c3aed"] },
];

function PaletteIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <circle cx="13.5" cy="6.5" r=".5" fill="currentColor" />
      <circle cx="17.5" cy="10.5" r=".5" fill="currentColor" />
      <circle cx="8.5" cy="7.5" r=".5" fill="currentColor" />
      <circle cx="6.5" cy="12.5" r=".5" fill="currentColor" />
      <path d="M12 22a10 10 0 1 1 10-10c0 1.9-1.55 3.45-3.45 3.45h-1.74a2.2 2.2 0 0 0-1.55 3.76l.28.27A1.48 1.48 0 0 1 14.5 22H12Z" />
    </svg>
  );
}

export function ThemeToggleButton() {
  const { theme, setTheme } = useTheme();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    if (open) document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [open]);

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="flex h-11 w-11 items-center justify-center rounded-xl border border-[var(--border)] bg-[var(--surface)] text-[var(--foreground)] shadow-sm transition hover:border-[var(--accent)] hover:text-[var(--accent)]"
        aria-expanded={open}
        aria-label="Change theme"
        title="Change theme"
      >
        <PaletteIcon className="h-4 w-4" />
      </button>

      {open && (
        <div className="absolute right-0 top-full mt-2 w-64 overflow-hidden rounded-2xl border border-[var(--border)] bg-[var(--surface)] shadow-2xl shadow-black/20 z-[100]">
          <div className="border-b border-[var(--border)] px-4 py-3">
            <p className="text-xs font-bold text-[var(--foreground)]">Theme</p>
            <p className="text-[10px] text-[var(--text-muted)] mt-0.5">Choose your display style</p>
          </div>
          <div className="p-2 space-y-1">
            {THEMES.map((option) => {
              const active = theme === option.id || (theme === "light" && option.id === "white");
              return (
                <button
                  key={option.id}
                  type="button"
                  onClick={() => { setTheme(option.id); setOpen(false); }}
                  className={[
                    "flex w-full items-center gap-3 rounded-xl px-3 py-2 text-left transition",
                    active
                      ? "bg-[var(--accent)] text-white"
                      : "hover:bg-[var(--surface-muted)] text-[var(--foreground)]",
                  ].join(" ")}
                >
                  <span className="flex shrink-0 overflow-hidden rounded-full border border-[var(--border)]">
                    {option.swatches.map((color) => (
                      <span key={color} className="h-5 w-3 block" style={{ backgroundColor: color } as CSSProperties} />
                    ))}
                  </span>
                  <span className="text-sm font-medium">{option.name}</span>
                  {active && <span className="ml-auto text-[10px] font-bold uppercase tracking-wide opacity-80">On</span>}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
