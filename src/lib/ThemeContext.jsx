import React, { createContext, useContext, useEffect, useState, useCallback } from "react";

const STORAGE_KEY = "hs-theme";
const ThemeContext = createContext(null);

function getInitialTheme() {
  if (typeof window === "undefined") return "light";
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored === "light" || stored === "dark") return stored;
  } catch (e) {}
  return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
}

export function ThemeProvider({ children }) {
  const [theme, setTheme] = useState(getInitialTheme);

  useEffect(() => {
    document.documentElement.classList.toggle("dark", theme === "dark");
    try {
      localStorage.setItem(STORAGE_KEY, theme);
    } catch (e) {}
  }, [theme]);

  const toggle = useCallback(() => {
    const next = theme === "dark" ? "light" : "dark";
    const apply = () => {
      document.documentElement.classList.toggle("dark", next === "dark");
      setTheme(next);
    };
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (document.startViewTransition && !reduceMotion) {
      document.startViewTransition(apply);
    } else {
      apply();
    }
  }, [theme]);

  return (
    <ThemeContext.Provider value={{ theme, toggle }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const ctx = useContext(ThemeContext);
  if (!ctx) return { theme: "light", toggle: () => {} };
  return ctx;
}