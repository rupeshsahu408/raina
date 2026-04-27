"use client";

import { useEffect, useMemo, useState } from "react";

type NavigatorWithStandalone = Navigator & {
  standalone?: boolean;
};

type BeforeInstallPromptEvent = Event & {
  prompt: () => Promise<void>;
  userChoice: Promise<unknown>;
};

type InstallPromptProps = {
  label?: string;
  className?: string;
};

export function InstallPrompt({
  label = "Get App",
  className = "",
}: InstallPromptProps) {
  const [deferredPrompt, setDeferredPrompt] =
    useState<BeforeInstallPromptEvent | null>(
    null
  );
  const [showGuide, setShowGuide] = useState(false);
  const [isStandalone, setIsStandalone] = useState(false);

  const isIos = useMemo(() => {
    if (typeof navigator === "undefined") return false;
    return /iPad|iPhone|iPod/i.test(navigator.userAgent);
  }, []);
  const isAndroid = useMemo(() => {
    if (typeof navigator === "undefined") return false;
    return /Android/i.test(navigator.userAgent);
  }, []);

  useEffect(() => {
    const mediaQuery = window.matchMedia("(display-mode: standalone)");

    const update = () => {
      const navStandalone = Boolean((navigator as NavigatorWithStandalone).standalone);
      setIsStandalone(mediaQuery.matches || navStandalone);
    };

    update();
    mediaQuery.addEventListener("change", update);

    const onBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      const evt = e as BeforeInstallPromptEvent;
      setDeferredPrompt(evt);
    };

    window.addEventListener("beforeinstallprompt", onBeforeInstallPrompt);
    return () => {
      mediaQuery.removeEventListener("change", update);
      window.removeEventListener("beforeinstallprompt", onBeforeInstallPrompt);
    };
  }, []);

  if (isStandalone) return null;

  const showManualGuide = isIos || isAndroid;

  return (
    <>
      {deferredPrompt ? (
        <button
          type="button"
          className={`rounded-2xl bg-gradient-to-r from-pink-400 via-purple-500 to-sky-400 px-4 py-2 text-xs font-semibold text-black shadow-lg shadow-purple-500/20 transition hover:scale-[1.02] ${className}`.trim()}
          onClick={async () => {
            try {
              // Keep original event context to avoid "Illegal invocation".
              await deferredPrompt.prompt();
              await deferredPrompt.userChoice;
            } finally {
              setDeferredPrompt(null);
            }
          }}
        >
          {label}
        </button>
      ) : showManualGuide ? (
        <button
          type="button"
          className={`rounded-2xl border border-zinc-700 bg-gray-50/70 px-4 py-2 text-xs font-semibold text-[#1d2226] transition hover:border-zinc-500 hover:bg-gray-50 ${className}`.trim()}
          onClick={() => setShowGuide(true)}
        >
          {label}
        </button>
      ) : null}

      {showGuide ? (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 flex items-end bg-white/70 p-4 sm:items-center sm:justify-center"
          onClick={() => setShowGuide(false)}
        >
          <div
            className="w-full max-w-md rounded-3xl border border-zinc-800 bg-gray-50 p-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-sm font-semibold text-zinc-50">
                  Install Plyndrox AI
                </p>
                <p className="mt-1 text-xs text-gray-500">
                  {isIos
                    ? "Use Safari to add Plyndrox to your Home Screen."
                    : "Install directly from Chrome to get the app-like experience."}
                </p>
              </div>
              <button
                type="button"
                className="rounded-xl border border-zinc-800 px-3 py-1 text-xs text-gray-600"
                onClick={() => setShowGuide(false)}
              >
                Close
              </button>
            </div>

            {isIos ? (
              <ol className="mt-4 space-y-2 rounded-2xl bg-gray-50/60 p-3 text-xs text-[#1d2226]">
                <li>1. Open this website in <b>Safari</b>.</li>
                <li>2. Tap the <b>Share</b> icon.</li>
                <li>3. Select <b>Add to Home Screen</b>.</li>
                <li>4. Tap <b>Add</b> and launch Plyndrox from your home screen.</li>
              </ol>
            ) : (
              <ol className="mt-4 space-y-2 rounded-2xl bg-gray-50/60 p-3 text-xs text-[#1d2226]">
                <li>1. Open this website in <b>Chrome</b>.</li>
                <li>2. Tap menu <b>(⋮)</b>.</li>
                <li>3. Tap <b>Install app</b> or <b>Add to Home screen</b>.</li>
                <li>4. Launch Plyndrox from your app drawer/home screen.</li>
              </ol>
            )}

            <div className="mt-3 rounded-2xl border border-zinc-800 bg-white/30 p-3 text-[11px] text-gray-500">
              After installation, Plyndrox opens in standalone full-screen style
              (no browser bar) for a real app feel😊 .
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}

