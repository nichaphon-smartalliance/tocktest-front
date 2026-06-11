"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { Toast, I18nProvider } from "@heroui/react";

type ThemeMode = "light" | "dark";

interface ThemeContextValue {
  mode: ThemeMode;
  toggle: () => void;
}

const ThemeContext = createContext<ThemeContextValue>({
  mode: "light",
  toggle: () => {},
});

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [mode, setMode] = useState<ThemeMode>("light");

  useEffect(() => {
    const saved = (localStorage.getItem("tocktest-theme") as ThemeMode) || "light";
    setMode(saved);
    document.documentElement.setAttribute("data-theme", saved);
  }, []);

  const toggle = () => {
    const next: ThemeMode = mode === "light" ? "dark" : "light";
    setMode(next);
    localStorage.setItem("tocktest-theme", next);
    document.documentElement.setAttribute("data-theme", next);
  };

  return (
    <I18nProvider locale="th-TH">
      <ThemeContext.Provider value={{ mode, toggle }}>
        {children}
        <Toast.Provider placement="top end" />
      </ThemeContext.Provider>
    </I18nProvider>
  );
}

export const useTheme = () => useContext(ThemeContext);
