"use client";

import { CSSProperties, useState } from "react";
import { Theme, useTheme } from "@/components/ThemeProvider";

type ThemeOption = {
  id: Theme;
  name: string;
  description: string;
  swatches: string[];
};

const THEMES: ThemeOption[] = [
  {
    id: "white",
    name: "White Mode",
    description: "Clean default theme using rgb(255, 255, 255).",
    swatches: ["#ffffff", "#f8fafc", "#7c3aed"],
  },
  {
    id: "dark",
    name: "Dark Mode",
    description: "Low-light interface for night usage.",
    swatches: ["#0f172a", "#111827", "#a78bfa"],
  },
  {
    id: "green",
    name: "Green Mode",
    description: "Fresh green surfaces for a calmer brand feel.",
    swatches: ["#f0fdf4", "#dcfce7", "#16a34a"],
  },
  {
    id: "reading",
    name: "Reading Mode",
    description: "Warm eye-comfort background for longer sessions.",
    swatches: ["#fff8ed", "#f8ecd7", "#b7791f"],
  },
  {
    id: "ocean",
    name: "Ocean Mode",
    description: "Soft blue theme for focused productivity.",
    swatches: ["#eff6ff", "#dbeafe", "#2563eb"],
  },
  {
    id: "rose",
    name: "Rose Mode",
    description: "Gentle rose theme for a warmer product mood.",
    swatches: ["#fff1f2", "#ffe4e6", "#e11d48"],
  },
  {
    id: "auto",
    name: "System Auto",
    description: "Matches the device light or dark preference.",
    swatches: ["#ffffff", "#0f172a", "#7c3aed"],
  },
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

export function ThemeSettingsPanel() {
  const { theme, setTheme } = useTheme();
  const [open, setOpen] = useState(false);

  return (
    <div className="theme-panel fixed bottom-5 right-5 z-[80]">
      {open && (
        <div className="mb-3 w-[min(calc(100vw-2.5rem),24rem)] overflow-hidden rounded-3xl border border-[var(--border)] bg-[var(--surface)] shadow-2xl shadow-black/20">
          <div className="border-b border-[var(--border)] px-5 py-4">
            <p className="text-sm font-black tracking-tight text-[var(--foreground)]">Theme settings</p>
            <p className="mt-1 text-xs leading-5 text-[var(--text-secondary)]">Choose a frontend theme. Your choice is saved on this device.</p>
          </div>
          <div className="max-h-[62vh] space-y-2 overflow-y-auto p-3">
            {THEMES.map((option) => {
              const active = theme === option.id || (theme === "light" && option.id === "white");
              return (
                <button
                  key={option.id}
                  type="button"
                  onClick={() => setTheme(option.id)}
                  className={[
                    "theme-panel-option flex w-full items-center gap-3 rounded-2xl border p-3 text-left transition",
                    active
                      ? "theme-panel-option-active border-[var(--accent)]"
                      : "border-[var(--border)] bg-[var(--background)] hover:border-[var(--accent)]",
                  ].join(" ")}
                >
                  <span className="flex shrink-0 overflow-hidden rounded-full border border-[var(--border)]">
                    {option.swatches.map((color) => (
                      <span key={color} className="theme-panel-swatch h-8 w-4" style={{ "--swatch": color } as CSSProperties} />
                    ))}
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block text-sm font-bold text-[var(--foreground)]">{option.name}</span>
                    <span className="mt-0.5 block text-xs leading-5 text-[var(--text-secondary)]">{option.description}</span>
                  </span>
                  {active && <span className="theme-panel-active-badge rounded-full px-2 py-1 text-[10px] font-bold uppercase tracking-[0.12em]">Active</span>}
                </button>
              );
            })}
          </div>
        </div>
      )}
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        className="theme-panel-trigger ml-auto flex h-12 w-12 items-center justify-center rounded-full border border-[var(--border)] text-[var(--foreground)] shadow-xl shadow-black/15 transition hover:-translate-y-0.5 hover:border-[var(--accent)]"
        aria-expanded={open}
        aria-label="Open theme settings"
      >
        <PaletteIcon className="h-5 w-5" />
      </button>
    </div>
  );
}