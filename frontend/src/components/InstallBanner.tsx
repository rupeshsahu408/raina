"use client";

import { useEffect, useState } from "react";
import Image from "next/image";

type BeforeInstallPromptEvent = Event & {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
};

type NavigatorWithStandalone = Navigator & { standalone?: boolean };

const DISMISS_KEY = "plyndrox_install_banner_dismissed";
const DISMISS_DAYS = 7;

export function InstallBanner() {
  const [visible, setVisible] = useState(false);
  const [animateIn, setAnimateIn] = useState(false);
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [showIosGuide, setShowIosGuide] = useState(false);
  const [isIos, setIsIos] = useState(false);
  const [installing, setInstalling] = useState(false);

  useEffect(() => {
    const isStandalone =
      window.matchMedia("(display-mode: standalone)").matches ||
      Boolean((navigator as NavigatorWithStandalone).standalone);

    if (isStandalone) return;

    const dismissed = localStorage.getItem(DISMISS_KEY);
    if (dismissed) {
      const ts = parseInt(dismissed, 10);
      if (Date.now() - ts < DISMISS_DAYS * 86400 * 1000) return;
    }

    const ua = navigator.userAgent;
    const mobile = /iPhone|iPad|iPod|Android/i.test(ua);
    if (!mobile) return;

    const ios = /iPhone|iPad|iPod/i.test(ua);
    setIsIos(ios);

    if (!ios) {
      const onBeforeInstall = (e: Event) => {
        e.preventDefault();
        setDeferredPrompt(e as BeforeInstallPromptEvent);
        setTimeout(() => {
          setVisible(true);
          requestAnimationFrame(() => setAnimateIn(true));
        }, 2500);
      };
      window.addEventListener("beforeinstallprompt", onBeforeInstall);
      return () => window.removeEventListener("beforeinstallprompt", onBeforeInstall);
    } else {
      setTimeout(() => {
        setVisible(true);
        requestAnimationFrame(() => setAnimateIn(true));
      }, 2500);
    }
  }, []);

  const dismiss = () => {
    setAnimateIn(false);
    setTimeout(() => setVisible(false), 400);
    localStorage.setItem(DISMISS_KEY, Date.now().toString());
  };

  const handleInstall = async () => {
    if (isIos) {
      setShowIosGuide(true);
      return;
    }
    if (!deferredPrompt) return;
    setInstalling(true);
    try {
      await deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      if (outcome === "accepted") {
        dismiss();
      }
    } finally {
      setInstalling(false);
      setDeferredPrompt(null);
    }
  };

  if (!visible) return null;

  return (
    <>
      <div
        style={{
          position: "fixed",
          bottom: 0,
          left: 0,
          right: 0,
          zIndex: 9000,
          padding: "0 12px 12px",
          transform: animateIn ? "translateY(0)" : "translateY(110%)",
          transition: "transform 0.4s cubic-bezier(0.34, 1.56, 0.64, 1)",
          pointerEvents: "none",
        }}
      >
        <div
          style={{
            background: "linear-gradient(135deg, #17132f 0%, #1e1b4b 50%, #09090b 100%)",
            border: "1px solid rgba(139,92,246,0.25)",
            borderRadius: 20,
            padding: "14px 16px",
            display: "flex",
            alignItems: "center",
            gap: 14,
            boxShadow: "0 8px 40px rgba(0,0,0,0.6), 0 0 0 1px rgba(255,255,255,0.06) inset",
            pointerEvents: "auto",
          }}
        >
          <Image
            src="/icons/plyndrox-192.png"
            alt=""
            width={52}
            height={52}
            style={{ borderRadius: 13, flexShrink: 0 }}
          />

          <div style={{ flex: 1, minWidth: 0 }}>
            <p style={{ color: "#f8fafc", fontSize: 14, fontWeight: 700, margin: 0, letterSpacing: -0.3 }}>
              Install Plyndrox AI
            </p>
            <p style={{ color: "rgba(255,255,255,0.5)", fontSize: 12, margin: "2px 0 0", lineHeight: 1.4 }}>
              Add to home screen for the full app experience
            </p>
          </div>

          <button
            onClick={handleInstall}
            disabled={installing}
            style={{
              background: "linear-gradient(135deg, #6d28d9, #8b5cf6)",
              color: "#fff",
              border: "none",
              borderRadius: 12,
              padding: "9px 16px",
              fontSize: 13,
              fontWeight: 600,
              cursor: "pointer",
              flexShrink: 0,
              opacity: installing ? 0.7 : 1,
              transition: "opacity 0.2s",
              letterSpacing: 0.1,
            }}
          >
            {installing ? "…" : "Install"}
          </button>

          <button
            onClick={dismiss}
            aria-label="Dismiss"
            style={{
              background: "rgba(255,255,255,0.07)",
              border: "none",
              borderRadius: 10,
              width: 30,
              height: 30,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              cursor: "pointer",
              flexShrink: 0,
              color: "rgba(255,255,255,0.5)",
              fontSize: 16,
            }}
          >
            ✕
          </button>
        </div>
      </div>

      {showIosGuide && (
        <div
          onClick={() => setShowIosGuide(false)}
          style={{
            position: "fixed",
            inset: 0,
            zIndex: 9100,
            background: "rgba(0,0,0,0.6)",
            backdropFilter: "blur(4px)",
            display: "flex",
            alignItems: "flex-end",
            padding: "0 12px 20px",
          }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              width: "100%",
              maxWidth: 480,
              margin: "0 auto",
              background: "linear-gradient(135deg, #17132f, #1e1b4b)",
              border: "1px solid rgba(139,92,246,0.3)",
              borderRadius: 24,
              padding: 24,
              boxShadow: "0 -4px 40px rgba(0,0,0,0.5)",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 20 }}>
              <Image
                src="/icons/plyndrox-192.png"
                alt=""
                width={48}
                height={48}
                style={{ borderRadius: 12, flexShrink: 0 }}
              />
              <div>
                <p style={{ color: "#f8fafc", fontSize: 16, fontWeight: 700, margin: 0 }}>
                  Install Plyndrox AI
                </p>
                <p style={{ color: "rgba(255,255,255,0.45)", fontSize: 13, margin: "2px 0 0" }}>
                  Add to your iOS Home Screen
                </p>
              </div>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              {[
                { step: "1", icon: "⬆️", text: "Tap the Share button in Safari" },
                { step: "2", icon: "➕", text: 'Scroll down and tap "Add to Home Screen"' },
                { step: "3", icon: "✅", text: 'Tap "Add" — Plyndrox opens as a full app' },
              ].map(({ step, icon, text }) => (
                <div
                  key={step}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 14,
                    background: "rgba(255,255,255,0.05)",
                    borderRadius: 14,
                    padding: "12px 14px",
                  }}
                >
                  <span style={{ fontSize: 22, flexShrink: 0 }}>{icon}</span>
                  <span style={{ color: "rgba(255,255,255,0.8)", fontSize: 14, lineHeight: 1.4 }}>
                    {text}
                  </span>
                </div>
              ))}
            </div>

            <button
              onClick={() => { setShowIosGuide(false); dismiss(); }}
              style={{
                marginTop: 20,
                width: "100%",
                background: "rgba(255,255,255,0.08)",
                border: "1px solid rgba(255,255,255,0.1)",
                color: "rgba(255,255,255,0.6)",
                borderRadius: 14,
                padding: "12px 0",
                fontSize: 14,
                cursor: "pointer",
                fontWeight: 500,
              }}
            >
              Got it
            </button>
          </div>
        </div>
      )}
    </>
  );
}
