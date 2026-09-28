'use client';

import { useEffect, useState } from 'react';
import { Moon, Sun } from 'lucide-react';
import { useTheme } from '@/contexts/ThemeContext';

/**
 * Header control that flips between the light and dark themes.
 *
 * The icon is only rendered once mounted. `ThemeProvider` reads the live theme
 * off <html>, which the server cannot know, so rendering the icon during SSR
 * would make the server's markup (always light) disagree with the client's and
 * trip a hydration mismatch. The placeholder keeps the button the same size so
 * nothing shifts when the real icon appears.
 *
 * Styled for the header bar with a `dark:` twin: the bar is white in light mode
 * and `gray-900` in dark, so the icon has to flip with it or it disappears into
 * one of the two.
 */
export default function ThemeToggle() {
  const { theme, toggleTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  // `mounted &&` gates the label as well as the icon. Without it the server
  // renders "Switch to dark theme" while a dark-mode client's first render says
  // "Switch to light theme", and React reports an aria-label hydration
  // mismatch. Server and first client render now always agree.
  const isDark = mounted && theme === 'dark';
  const label = isDark ? 'Switch to light theme' : 'Switch to dark theme';

  return (
    <button
      type="button"
      onClick={toggleTheme}
      aria-label={label}
      title={label}
      className="flex h-9 w-9 items-center justify-center rounded-full text-gray-700 transition-colors hover:bg-[#f8f5e6] hover:text-[#e2703a] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#f58c55] focus-visible:ring-offset-2 focus-visible:ring-offset-white dark:text-gray-200 dark:hover:bg-white/10 dark:hover:text-white dark:focus-visible:ring-offset-gray-900"
    >
      {mounted ? (
        isDark ? (
          <Sun size={20} aria-hidden="true" />
        ) : (
          <Moon size={20} aria-hidden="true" />
        )
      ) : (
        <span className="block h-5 w-5" aria-hidden="true" />
      )}
    </button>
  );
}
