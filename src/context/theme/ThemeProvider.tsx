"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { App as AntdApp, ConfigProvider, theme as antdTheme } from "antd";
import thTH from "antd/locale/th_TH";
import { AntdBridge } from "@/lib/antd-static";

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
    <ThemeContext.Provider value={{ mode, toggle }}>
      <ConfigProvider
        locale={thTH}
        theme={{
          algorithm:
            mode === "dark"
              ? antdTheme.darkAlgorithm
              : antdTheme.defaultAlgorithm,
          token: {
            colorPrimary: "#6366f1",
            borderRadius: 8,
            fontFamily:
              "'Inter', 'Noto Sans Thai', -apple-system, BlinkMacSystemFont, sans-serif",
          },
        }}
      >
        {/* antd App provides context for message/modal/notification APIs */}
        <AntdApp>
          <AntdBridge />
          {children}
        </AntdApp>
      </ConfigProvider>
    </ThemeContext.Provider>
  );
}

export const useTheme = () => useContext(ThemeContext);
