"use client";

import { createContext, useContext, useEffect, useLayoutEffect, useState } from "react";

type Theme = "dark" | "light" | "auto";

const STORAGE_KEY = "evara_theme";

interface ThemeContextValue {
  theme: Theme;
  setTheme: (t: Theme) => void;
}

const ThemeContext = createContext<ThemeContextValue>({
  theme: "dark",
  setTheme: () => {},
});

function resolveTheme(theme: Theme): "dark" | "light" {
  if (theme === "auto") {
    return typeof window !== "undefined" && window.matchMedia("(prefers-color-scheme: dark)").matches
      ? "dark"
      : "light";
  }
  return theme;
}

function applyTheme(theme: Theme) {
  const resolved = resolveTheme(theme);
  document.documentElement.setAttribute("data-theme", resolved);
}

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setThemeState] = useState<Theme>("dark");

  useLayoutEffect(() => {
    const stored = (localStorage.getItem(STORAGE_KEY) as Theme) ?? "dark";
    setThemeState(stored);
    applyTheme(stored);

    const handler = (e: Event) => {
      const t = (e as CustomEvent<Theme>).detail;
      setThemeState(t);
      applyTheme(t);
    };
    window.addEventListener("evara-theme-change", handler);

    const mq = window.matchMedia("(prefers-color-scheme: dark)");
    const mqHandler = () => {
      const current = (localStorage.getItem(STORAGE_KEY) as Theme) ?? "dark";
      if (current === "auto") applyTheme("auto");
    };
    mq.addEventListener("change", mqHandler);

    return () => {
      window.removeEventListener("evara-theme-change", handler);
      mq.removeEventListener("change", mqHandler);
    };
  }, []);

  function setTheme(t: Theme) {
    setThemeState(t);
    localStorage.setItem(STORAGE_KEY, t);
    applyTheme(t);
    window.dispatchEvent(new CustomEvent<Theme>("evara-theme-change", { detail: t }));
  }

  return (
    <ThemeContext.Provider value={{ theme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  return useContext(ThemeContext);
}

export function applyThemeFromStorage() {
  try {
    const stored = (localStorage.getItem(STORAGE_KEY) as Theme) ?? "dark";
    const resolved = resolveTheme(stored);
    document.documentElement.setAttribute("data-theme", resolved);
  } catch {}
}
