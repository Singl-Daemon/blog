"use client";

import {
  FluentProvider,
  webLightTheme,
  webDarkTheme,
  type Theme,
} from "@fluentui/react-components";

const miSansFont =
  "'MiSans VF', 'MiSans', 'Segoe UI Variable', 'Segoe UI', system-ui, -apple-system, sans-serif";

const lightTheme: Theme = { ...webLightTheme, fontFamilyBase: miSansFont };
const darkTheme: Theme = { ...webDarkTheme, fontFamilyBase: miSansFont };
import React, { useState, useEffect, createContext, useContext } from "react";

type ThemeContextType = {
  theme: "light" | "dark";
  toggleTheme: () => void;
  setTheme: (t: "light" | "dark") => void;
  resetTheme: () => void; // clear override, follow system again
  isOverride: boolean;   // true when user has manually chosen a theme
};

export const ThemeContext = createContext<ThemeContextType>({
  theme: "light",
  toggleTheme: () => {},
  setTheme: () => {},
  resetTheme: () => {},
  isOverride: false,
});

export const useTheme = () => useContext(ThemeContext);

const THEME_KEY = "blog-theme-override";

export default function Providers({ children }: { children: React.ReactNode }) {
  const [mounted, setMounted] = useState(false);
  const [themeName, setThemeName] = useState<"light" | "dark">("light");
  const [isOverride, setIsOverride] = useState(false);

  useEffect(() => {
    const override = localStorage.getItem(THEME_KEY) as "light" | "dark" | null;
    const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
    setThemeName(override ?? (mediaQuery.matches ? "dark" : "light"));
    setIsOverride(!!override);
    setMounted(true);

    const handler = (e: MediaQueryListEvent) => {
      // Only follow system if no user override
      if (!localStorage.getItem(THEME_KEY)) {
        setThemeName(e.matches ? "dark" : "light");
      }
    };
    mediaQuery.addEventListener("change", handler);
    return () => mediaQuery.removeEventListener("change", handler);
  }, []);

  const toggleTheme = () => {
    setThemeName((prev) => {
      const next = prev === "light" ? "dark" : "light";
      localStorage.setItem(THEME_KEY, next);
      setIsOverride(true);
      return next;
    });
  };

  const setTheme = (t: "light" | "dark") => {
    localStorage.setItem(THEME_KEY, t);
    setIsOverride(true);
    setThemeName(t);
  };

  const resetTheme = () => {
    localStorage.removeItem(THEME_KEY);
    setIsOverride(false);
    const dark = window.matchMedia("(prefers-color-scheme: dark)").matches;
    setThemeName(dark ? "dark" : "light");
  };

  useEffect(() => {
    if (mounted) {
      document.documentElement.setAttribute("data-theme", themeName);
      document.documentElement.style.colorScheme = themeName;
    }
  }, [themeName, mounted]);

  const themeToApply = themeName === "dark" ? darkTheme : lightTheme;

  return (
    <ThemeContext.Provider value={{ theme: themeName, toggleTheme, setTheme, resetTheme, isOverride }}>
      <FluentProvider
        theme={themeToApply}
        style={{
          minHeight: "100vh",
          background: "transparent",
          display: "flex",
          flexDirection: "column",
        }}
      >
        {children}
      </FluentProvider>
    </ThemeContext.Provider>
  );
}
