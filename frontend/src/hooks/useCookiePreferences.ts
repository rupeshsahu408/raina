"use client";

import { useEffect, useState } from "react";

export type CookiePreferences = {
  analytics: boolean;
  marketing: boolean;
};

const STORAGE_KEY = "evara_cookie_prefs";

function load(): CookiePreferences | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as Partial<CookiePreferences>;
    return {
      analytics: parsed.analytics ?? false,
      marketing: parsed.marketing ?? false,
    };
  } catch {
    return null;
  }
}

function persist(prefs: CookiePreferences) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(prefs));
  } catch { /* ignore */ }
}

export function useCookiePreferences() {
  const [prefs, setPrefs] = useState<CookiePreferences>({
    analytics: false,
    marketing: false,
  });
  const [resolved, setResolved] = useState(false);

  useEffect(() => {
    const saved = load();
    if (saved) setPrefs(saved);
    setResolved(true);
  }, []);

  useEffect(() => {
    if (!resolved) return;

    if (prefs.analytics) {
      // analytics scripts would be injected here
    } else {
      // analytics scripts would be removed here
    }

    if (prefs.marketing) {
      // marketing scripts would be injected here
    } else {
      // marketing scripts would be removed here
    }
  }, [prefs, resolved]);

  const save = (next: CookiePreferences) => {
    setPrefs(next);
    persist(next);
  };

  const acceptAll = () => save({ analytics: true, marketing: true });
  const rejectAll = () => save({ analytics: false, marketing: false });

  return { prefs, save, acceptAll, rejectAll, resolved };
}
