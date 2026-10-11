"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import type { Bilingual, Language } from "../lib/types";

type Theme = "light" | "dark";

type Ctx = {
  lang: Language;
  setLang: (l: Language) => void;
  theme: Theme;
  toggleTheme: () => void;
  /** Translate a bilingual string. */
  t: (s: Bilingual) => string;
};

const AppContext = createContext<Ctx | null>(null);

const read = (key: string) => {
  try {
    return localStorage.getItem(key);
  } catch {
    return null;
  }
};
const write = (key: string, value: string) => {
  try {
    localStorage.setItem(key, value);
  } catch {
    /* storage may be unavailable (private mode); preferences just won't persist */
  }
};

export function Providers({ children }: { children: React.ReactNode }) {
  const [lang, setLangState] = useState<Language>("en");
  // null until the saved theme is read, so we never overwrite the pre-paint script.
  const [theme, setTheme] = useState<Theme | null>(null);

  useEffect(() => {
    const savedLang = read("algo-atlas-lang");
    const queryLang = new URLSearchParams(window.location.search).get("lang");
    const initial = queryLang === "vi" || queryLang === "en" ? queryLang : savedLang === "vi" ? "vi" : null;
    // Restore saved preferences after hydration; the server always renders English/light.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    if (initial) setLangState(initial);
    const savedTheme = read("algo-atlas-theme");
    const prefersDark = window.matchMedia?.("(prefers-color-scheme: dark)").matches;
    setTheme(savedTheme === "dark" || savedTheme === "light" ? savedTheme : prefersDark ? "dark" : "light");
  }, []);

  useEffect(() => {
    document.documentElement.lang = lang;
  }, [lang]);

  useEffect(() => {
    if (theme) document.documentElement.dataset.theme = theme;
  }, [theme]);

  const setLang = useCallback((l: Language) => {
    setLangState(l);
    write("algo-atlas-lang", l);
  }, []);

  const toggleTheme = useCallback(() => {
    setTheme((prev) => {
      const next = (prev ?? document.documentElement.dataset.theme) === "dark" ? "light" : "dark";
      write("algo-atlas-theme", next);
      return next;
    });
  }, []);

  const value = useMemo<Ctx>(() => ({ lang, setLang, theme: theme ?? "light", toggleTheme, t: (s) => s[lang] }), [lang, setLang, theme, toggleTheme]);
  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error("useApp must be used inside <Providers>");
  return ctx;
}
