"use client";

import React, { createContext, useContext, useEffect, useState, useMemo } from "react";
import { Language, Translations, translations } from "@/translations/dictionary";

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  toggleLanguage: () => void;
  t: Translations;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  // Default to "es", with local storage retrieval on mount
  const [language, setLanguageState] = useState<Language>("es");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    try {
      const stored = localStorage.getItem("scentlabs_language") as Language | null;
      if (stored && (stored === "es" || stored === "en")) {
        setLanguageState(stored);
      } else {
        // Check browser language preference
        const navLang = navigator.language.toLowerCase();
        if (navLang.startsWith("en")) {
          setLanguageState("en");
        }
      }
    } catch {
      // Ignore storage errors in restricted contexts
    }
    setMounted(true);
  }, []);

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    try {
      localStorage.setItem("scentlabs_language", lang);
      document.documentElement.lang = lang;
    } catch {
      // Ignore storage errors
    }
  };

  const toggleLanguage = () => {
    const nextLang = language === "es" ? "en" : "es";
    setLanguage(nextLang);
  };

  useEffect(() => {
    if (mounted) {
      document.documentElement.lang = language;
    }
  }, [language, mounted]);

  const currentTranslations = useMemo(() => {
    return translations[language] || translations.es;
  }, [language]);

  const value = useMemo(
    () => ({
      language,
      setLanguage,
      toggleLanguage,
      t: currentTranslations,
    }),
    [language, currentTranslations]
  );

  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>;
}

export function useLanguage(): LanguageContextType {
  const context = useContext(LanguageContext);
  if (!context) {
    // Fallback if accessed outside provider during prerender
    return {
      language: "es",
      setLanguage: () => {},
      toggleLanguage: () => {},
      t: translations.es,
    };
  }
  return context;
}
