"use client";

import {
  FluentProvider,
  type Theme,
  webDarkTheme,
  webLightTheme,
} from "@fluentui/react-components";
import {
  createContext,
  type ReactNode,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { flushSync } from "react-dom";

const miSansFont =
  "'MiSans VF', 'MiSans', 'Segoe UI Variable', 'Segoe UI', system-ui, -apple-system, sans-serif";
const monoFont =
  "'Cascadia Code Variable', 'Cascadia Code', 'Cascadia Mono', ui-monospace, Consolas, monospace";

const lightTheme: Theme = {
  ...webLightTheme,
  fontFamilyBase: miSansFont,
  fontFamilyMonospace: monoFont,
};
const darkTheme: Theme = {
  ...webDarkTheme,
  fontFamilyBase: miSansFont,
  fontFamilyMonospace: monoFont,
};

type ThemeContextType = {
  theme: "light" | "dark";
  toggleTheme: () => void;
  setTheme: (t: "light" | "dark") => void;
  resetTheme: () => void; // clear override, follow system again
  isOverride: boolean; // true when user has manually chosen a theme
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

function applyDocumentTheme(themeName: "light" | "dark") {
  document.documentElement.setAttribute("data-theme", themeName);
  document.documentElement.style.colorScheme = themeName;
}

function withThemeTransition(update: () => void) {
  document.activeViewTransition?.skipTransition();
  if (typeof document.startViewTransition !== "function") {
    update();
    return;
  }

  const run = () => {
    flushSync(update);
  };

  const start = document.startViewTransition.bind(document) as (
    cb: (() => void) | { update: () => void; types?: string[] },
  ) => unknown;

  if (CSS.supports("selector(:active-view-transition-type(theme))")) {
    start({ update: run, types: ["theme"] });
    return;
  }
  start(run);
}

export default function Providers({ children }: { children: ReactNode }) {
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
      if (localStorage.getItem(THEME_KEY)) return;
      const next = e.matches ? "dark" : "light";
      withThemeTransition(() => {
        setThemeName(next);
        applyDocumentTheme(next);
      });
    };
    mediaQuery.addEventListener("change", handler);
    return () => mediaQuery.removeEventListener("change", handler);
  }, []);

  const toggleTheme = useCallback(() => {
    const next = themeName === "light" ? "dark" : "light";
    localStorage.setItem(THEME_KEY, next);
    withThemeTransition(() => {
      setIsOverride(true);
      setThemeName(next);
      applyDocumentTheme(next);
    });
  }, [themeName]);

  const setTheme = useCallback((t: "light" | "dark") => {
    localStorage.setItem(THEME_KEY, t);
    withThemeTransition(() => {
      setIsOverride(true);
      setThemeName(t);
      applyDocumentTheme(t);
    });
  }, []);

  const resetTheme = useCallback(() => {
    localStorage.removeItem(THEME_KEY);
    const dark = window.matchMedia("(prefers-color-scheme: dark)").matches;
    const next = dark ? "dark" : "light";
    withThemeTransition(() => {
      setIsOverride(false);
      setThemeName(next);
      applyDocumentTheme(next);
    });
  }, []);

  useEffect(() => {
    if (mounted) applyDocumentTheme(themeName);
  }, [themeName, mounted]);

  const themeToApply = themeName === "dark" ? darkTheme : lightTheme;
  const themeValue = useMemo(
    () => ({
      theme: themeName,
      toggleTheme,
      setTheme,
      resetTheme,
      isOverride,
    }),
    [themeName, toggleTheme, setTheme, resetTheme, isOverride],
  );

  return (
    <ThemeContext.Provider value={themeValue}>
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
