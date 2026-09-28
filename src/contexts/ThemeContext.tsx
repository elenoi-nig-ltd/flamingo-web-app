'use client';

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from 'react';
import { THEME_STORAGE_KEY, type Theme } from '@/config/theme';

interface ThemeContextType {
  theme: Theme;
  toggleTheme: () => void;
  setTheme: (theme: Theme) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

/**
 * Read back whatever `themeInitScript` already applied to <html>.
 *
 * The script runs before paint, so by the time this renders the correct class
 * is already on the element. Starting from that value rather than a hardcoded
 * 'light' is what stops the first effect from undoing the script's work and
 * flashing the wrong theme.
 */
function readAppliedTheme(): Theme {
  if (typeof document === 'undefined') return 'light';
  return document.documentElement.classList.contains('dark') ? 'dark' : 'light';
}

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setThemeState] = useState<Theme>(readAppliedTheme);

  // Apply the class. This only matters for changes made in-app; the initial
  // value is already on <html> courtesy of the init script.
  useEffect(() => {
    document.documentElement.classList.toggle('dark', theme === 'dark');
  }, [theme]);

  // Follow the OS, but only until the visitor makes an explicit choice. Once
  // they have, their choice wins and we stop listening — otherwise the OS would
  // silently override a deliberate preference.
  useEffect(() => {
    try {
      if (localStorage.getItem(THEME_STORAGE_KEY)) return;
    } catch {
      /* Storage unavailable; fall through and track the OS for this session. */
    }

    const media = window.matchMedia('(prefers-color-scheme: dark)');
    const sync = (event: MediaQueryListEvent) =>
      setThemeState(event.matches ? 'dark' : 'light');

    media.addEventListener('change', sync);
    return () => media.removeEventListener('change', sync);
  }, []);

  const setTheme = useCallback((next: Theme) => {
    try {
      localStorage.setItem(THEME_STORAGE_KEY, next);
    } catch {
      /* Storage unavailable; the choice still applies for this session. */
    }
    setThemeState(next);
  }, []);

  const toggleTheme = useCallback(() => {
    setThemeState((previous) => {
      const next: Theme = previous === 'dark' ? 'light' : 'dark';
      try {
        localStorage.setItem(THEME_STORAGE_KEY, next);
      } catch {
        /* Storage unavailable; the choice still applies for this session. */
      }
      return next;
    });
  }, []);

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}
