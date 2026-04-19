"use client";

import { useEffect, useRef, useState } from "react";
import { useCookiePreferences, type CookiePreferences } from "@/hooks/useCookiePreferences";

interface Props {
  open: boolean;
  onClose: () => void;
}

function Toggle({
  checked,
  onChange,
  disabled,
  accent,
}: {
  checked: boolean;
  onChange: (v: boolean) => void;
  disabled?: boolean;
  accent?: "violet" | "emerald";
}) {
  const color = accent === "emerald" ? "bg-emerald-500" : "bg-violet-500";
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      disabled={disabled}
      onClick={() => !disabled && onChange(!checked)}
      className={[
        "relative inline-flex h-5 w-9 shrink-0 cursor-pointer items-center rounded-full border-2 border-transparent transition-colors duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-violet-500 focus-visible:ring-offset-2 focus-visible:ring-offset-[#161616]",
        checked ? color : "bg-zinc-700",
        disabled ? "cursor-not-allowed opacity-60" : "",
      ].join(" ")}
    >
      <span
        className={[
          "inline-block h-4 w-4 rounded-full bg-white shadow-md ring-0 transition-transform duration-200",
          checked ? "translate-x-4" : "translate-x-0",
        ].join(" ")}
      />
    </button>
  );
}

function Toast({ visible, onDone }: { visible: boolean; onDone: () => void }) {
  useEffect(() => {
    if (!visible) return;
    const t = setTimeout(onDone, 2800);
    return () => clearTimeout(t);
  }, [visible, onDone]);

  return (
    <div
      aria-live="polite"
      className={[
        "pointer-events-none fixed bottom-8 left-1/2 z-[999] -translate-x-1/2 transition-all duration-300",
        visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-3",
      ].join(" ")}
    >
      <div className="flex items-center gap-2.5 rounded-2xl border border-emerald-500/30 bg-emerald-950/90 px-4 py-2.5 text-[13px] text-emerald-300 shadow-xl backdrop-blur-md">
        <svg width="14" height="14" viewBox="0 0 14 14" fill="none" className="shrink-0">
          <path d="M2 7l3.5 3.5L12 3" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
        Preferences saved
      </div>
    </div>
  );
}

export function CookiePreferencesModal({ open, onClose }: Props) {
  const { prefs, save, acceptAll, rejectAll } = useCookiePreferences();
  const [draft, setDraft] = useState<CookiePreferences>(prefs);
  const [toast, setToast] = useState(false);
  const overlayRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (open) setDraft(prefs);
  }, [open, prefs]);

  useEffect(() => {
    if (!open) return;
    const handler = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [open, onClose]);

  const handleSave = () => {
    save(draft);
    setToast(true);
    onClose();
  };

  const handleAcceptAll = () => {
    acceptAll();
    setToast(true);
    onClose();
  };

  const handleRejectAll = () => {
    rejectAll();
    setToast(true);
    onClose();
  };

  return (
    <>
      <Toast visible={toast} onDone={() => setToast(false)} />

      {/* Backdrop */}
      <div
        ref={overlayRef}
        aria-hidden={!open}
        onClick={onClose}
        className={[
          "fixed inset-0 z-[200] bg-white/70 backdrop-blur-sm transition-opacity duration-200",
          open ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none",
        ].join(" ")}
      />

      {/* Modal */}
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Cookie Preferences"
        className={[
          "fixed inset-0 z-[201] flex items-center justify-center p-4 transition-all duration-200",
          open ? "pointer-events-auto" : "pointer-events-none",
        ].join(" ")}
      >
        <div
          onClick={(e) => e.stopPropagation()}
          className={[
            "w-full max-w-md overflow-hidden rounded-3xl border border-white/[0.09] bg-[#161616] shadow-2xl transition-all duration-200",
            open ? "opacity-100 scale-100 translate-y-0" : "opacity-0 scale-95 translate-y-4",
          ].join(" ")}
        >
          {/* Header */}
          <div className="flex items-start justify-between border-b border-white/[0.06] px-6 py-5">
            <div>
              <h2 className="text-base font-semibold text-[#1d2226]">Cookie Preferences</h2>
              <p className="mt-1 text-[12px] leading-relaxed text-gray-400">
                Evara uses cookies to improve your experience. You can choose which types of cookies you allow below. Essential cookies are always required for the site to work.
              </p>
            </div>
            <button
              onClick={onClose}
              className="ml-4 mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-xl border border-white/[0.06] text-gray-400 transition hover:border-gray-200 hover:text-gray-600"
              aria-label="Close"
            >
              <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                <path d="M1 1l10 10M11 1L1 11" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
              </svg>
            </button>
          </div>

          {/* Cookie rows */}
          <div className="divide-y divide-white/[0.04] px-6">
            {/* Essential */}
            <div className="flex items-start justify-between gap-4 py-4">
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <span className="text-[13px] font-medium text-[#1d2226]">Essential Cookies</span>
                  <span className="rounded-full bg-zinc-800 px-2 py-0.5 text-[10px] font-medium text-gray-400">Always on</span>
                </div>
                <p className="mt-0.5 text-[11px] leading-relaxed text-zinc-600">
                  Required for core functions like authentication, security, and session management. Cannot be disabled.
                </p>
              </div>
              <Toggle checked={true} onChange={() => {}} disabled accent="emerald" />
            </div>

            {/* Analytics */}
            <div className="flex items-start justify-between gap-4 py-4">
              <div className="min-w-0">
                <span className="text-[13px] font-medium text-[#1d2226]">Analytics Cookies</span>
                <p className="mt-0.5 text-[11px] leading-relaxed text-zinc-600">
                  Help us understand how you use Evara so we can improve performance, features, and reliability.
                </p>
              </div>
              <Toggle
                checked={draft.analytics}
                onChange={(v) => setDraft((d) => ({ ...d, analytics: v }))}
                accent="violet"
              />
            </div>

            {/* Marketing */}
            <div className="flex items-start justify-between gap-4 py-4">
              <div className="min-w-0">
                <span className="text-[13px] font-medium text-[#1d2226]">Marketing Cookies</span>
                <p className="mt-0.5 text-[11px] leading-relaxed text-zinc-600">
                  Used to personalise content and measure the effectiveness of campaigns shown to you.
                </p>
              </div>
              <Toggle
                checked={draft.marketing}
                onChange={(v) => setDraft((d) => ({ ...d, marketing: v }))}
                accent="violet"
              />
            </div>
          </div>

          {/* Privacy note */}
          <div className="px-6 pb-4">
            <p className="text-[11px] text-zinc-700">
              Learn more in our{" "}
              <a
                href="/privacy"
                className="text-violet-500 underline underline-offset-2 hover:text-violet-400 transition-colors"
                onClick={onClose}
              >
                Privacy Policy
              </a>
              .
            </p>
          </div>

          {/* Actions */}
          <div className="flex flex-col gap-2 border-t border-white/[0.06] p-4 sm:flex-row sm:items-center sm:justify-between">
            <button
              type="button"
              onClick={handleRejectAll}
              className="rounded-xl border border-white/[0.08] px-4 py-2 text-[12px] font-medium text-gray-500 transition hover:border-white/[0.14] hover:text-[#1d2226]"
            >
              Reject All
            </button>
            <div className="flex flex-col gap-2 sm:flex-row">
              <button
                type="button"
                onClick={handleSave}
                className="rounded-xl border border-violet-500/40 px-4 py-2 text-[12px] font-medium text-violet-300 transition hover:border-violet-500/70 hover:bg-violet-500/10"
              >
                Save Preferences
              </button>
              <button
                type="button"
                onClick={handleAcceptAll}
                className="rounded-xl bg-violet-600 px-4 py-2 text-[12px] font-medium text-white shadow-lg transition hover:bg-violet-500"
              >
                Accept All
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
