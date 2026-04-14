"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import type { Platform } from "@/lib/platformSession";
import { PLATFORM_META, getPlatformRedirectPath } from "@/lib/platformSession";

const ALL_PLATFORMS: Platform[] = ["evara", "whatsapp-ai", "ibara"];

function GridIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="3" width="7" height="7" rx="1" />
      <rect x="14" y="3" width="7" height="7" rx="1" />
      <rect x="3" y="14" width="7" height="7" rx="1" />
      <rect x="14" y="14" width="7" height="7" rx="1" />
    </svg>
  );
}

function XIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
      <path d="M18 6 6 18" /><path d="m6 6 12 12" />
    </svg>
  );
}

function ArrowIcon() {
  return (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M5 12h14" /><path d="m12 5 7 7-7 7" />
    </svg>
  );
}

interface PlatformSwitcherProps {
  current: Platform;
}

export function PlatformSwitcher({ current }: PlatformSwitcherProps) {
  const [open, setOpen] = useState(false);
  const router = useRouter();

  const others = ALL_PLATFORMS.filter((p) => p !== current);
  const currentMeta = PLATFORM_META[current];

  function go(platform: Platform) {
    setOpen(false);
    router.push(getPlatformRedirectPath(platform));
  }

  return (
    <div className="fixed bottom-5 right-5 z-50 flex flex-col items-end gap-2">
      {open && (
        <div className="mb-1 w-60 overflow-hidden rounded-2xl border border-white/10 bg-[#0d0b15]/95 shadow-2xl shadow-black/60 backdrop-blur-2xl">
          <div className="border-b border-white/8 px-4 py-3">
            <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-zinc-500">Switch platform</p>
            <div className={`mt-1 flex items-center gap-2 rounded-xl ${currentMeta.bg} ${currentMeta.border} border px-2.5 py-1.5`}>
              <span className={`text-xs font-bold ${currentMeta.color}`}>{currentMeta.label}</span>
              <span className="ml-auto text-[9px] font-semibold uppercase tracking-widest text-zinc-600">current</span>
            </div>
          </div>

          <div className="p-2">
            {others.map((p) => {
              const meta = PLATFORM_META[p];
              return (
                <button
                  key={p}
                  onClick={() => go(p)}
                  className="group flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left transition hover:bg-white/5"
                >
                  <div className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ${meta.bg} ${meta.border} border`}>
                    <span className={`text-[10px] font-black ${meta.color}`}>
                      {p === "evara" ? "E" : p === "whatsapp-ai" ? "W" : "I"}
                    </span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-bold text-white">{meta.label}</p>
                    <p className="text-[10px] text-zinc-500">{meta.description}</p>
                  </div>
                  <ArrowIcon />
                </button>
              );
            })}

            <div className="mt-1 border-t border-white/8 pt-1">
              <button
                onClick={() => { setOpen(false); router.push("/business-ai"); }}
                className="flex w-full items-center gap-2 rounded-xl px-3 py-2 text-left transition hover:bg-white/5"
              >
                <span className="text-[10px] text-zinc-500">View all platforms</span>
              </button>
            </div>
          </div>
        </div>
      )}

      <button
        onClick={() => setOpen((v) => !v)}
        className={`flex h-11 w-11 items-center justify-center rounded-2xl border shadow-xl shadow-black/40 transition hover:scale-105 ${
          open
            ? "border-white/20 bg-white/10 text-white"
            : "border-white/10 bg-[#0d0b15]/90 text-zinc-400 hover:text-white backdrop-blur-xl"
        }`}
        title="Switch platform"
      >
        {open ? <XIcon /> : <GridIcon />}
      </button>
    </div>
  );
}
