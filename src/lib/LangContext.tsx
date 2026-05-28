"use client";

import React, { createContext, useContext, useState, useCallback, type ReactNode } from "react";
import type { Lang } from "./dictionary";

const LangContext = createContext<{
  lang: Lang;
  toggleLang: () => void;
  setLang: (l: Lang) => void;
}>({ lang: "id", toggleLang: () => {}, setLang: () => {} });

export function LangProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<Lang>("id");
  const toggleLang = useCallback(() => {
    setLangState((prev) => (prev === "id" ? "en" : "id"));
  }, []);
  const setLang = useCallback((l: Lang) => setLangState(l), []);

  return (
    <LangContext.Provider value={{ lang, toggleLang, setLang }}>
      {children}
    </LangContext.Provider>
  );
}

export function useLang() {
  return useContext(LangContext);
}
