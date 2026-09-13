import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { translate, type Lang, type Translate } from "../i18n";

export type Theme = "light" | "dark";

// ค่าที่ผู้ใช้เลือกเองจะเก็บใน localStorage — ถ้ายังไม่เคยเลือกธีม จะตามการตั้งค่าของ OS
const LANG_KEY = "lang";
const THEME_KEY = "theme";

function readStored(key: string): string | null {
  try {
    return localStorage.getItem(key);
  } catch {
    return null;
  }
}

function store(key: string, value: string) {
  try {
    localStorage.setItem(key, value);
  } catch {
    // storage ใช้ไม่ได้ (เช่น private mode) — เก็บไว้ใน state อย่างเดียว
  }
}

function initialLang(): Lang {
  return readStored(LANG_KEY) === "en" ? "en" : "th";
}

function initialTheme(): Theme {
  const stored = readStored(THEME_KEY);
  if (stored === "light" || stored === "dark") return stored;
  return window.matchMedia?.("(prefers-color-scheme: dark)").matches ? "dark" : "light";
}

interface PreferencesValue {
  lang: Lang;
  setLang: (lang: Lang) => void;
  theme: Theme;
  setTheme: (theme: Theme) => void;
  toggleTheme: () => void;
  t: Translate;
  /** BCP 47 locale for toLocaleDateString etc. */
  locale: string;
}

const PreferencesContext = createContext<PreferencesValue | null>(null);

export function PreferencesProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<Lang>(initialLang);
  const [theme, setThemeState] = useState<Theme>(initialTheme);

  useEffect(() => {
    document.documentElement.lang = lang;
  }, [lang]);

  // ธีมอยู่บน <html data-theme> ให้ stylesheet ของทุกหน้าใช้ :root[data-theme="dark"] ได้
  // หน้า login ไม่ได้รับผล เพราะธีมของมันผูกกับ .auth-page[data-theme] ของตัวเอง
  useEffect(() => {
    document.documentElement.dataset.theme = theme;
  }, [theme]);

  const setLang = useCallback((next: Lang) => {
    setLangState(next);
    store(LANG_KEY, next);
  }, []);

  const setTheme = useCallback((next: Theme) => {
    setThemeState(next);
    store(THEME_KEY, next);
  }, []);

  const t = useCallback<Translate>((key, vars) => translate(lang, key, vars), [lang]);

  const value = useMemo<PreferencesValue>(
    () => ({
      lang,
      setLang,
      theme,
      setTheme,
      toggleTheme: () => setTheme(theme === "dark" ? "light" : "dark"),
      t,
      locale: lang === "th" ? "th-TH" : "en-GB",
    }),
    [lang, setLang, theme, setTheme, t]
  );

  return <PreferencesContext.Provider value={value}>{children}</PreferencesContext.Provider>;
}

export function usePreferences(): PreferencesValue {
  const ctx = useContext(PreferencesContext);
  if (!ctx) throw new Error("usePreferences must be used inside <PreferencesProvider>");
  return ctx;
}
