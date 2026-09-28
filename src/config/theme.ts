/**
 * Theme wiring shared by the pre-paint init script and `ThemeProvider`.
 *
 * Dark mode is a `.dark` class on <html>, consumed by the `dark:` variant
 * declared in `globals.css`. This module exists so the blocking script in
 * `layout.tsx` and the React provider cannot disagree about the storage key or
 * the rules for choosing a theme.
 */

export type Theme = 'light' | 'dark';

/** Where the visitor's explicit choice is remembered. */
export const THEME_STORAGE_KEY = 'theme';

/**
 * Applies the theme before first paint.
 *
 * This runs as a blocking inline script in <head>. It has to be inline and
 * synchronous: `ThemeProvider` can only apply a class in an effect, which is
 * after the browser has painted, and on a dark-preferring machine that shows a
 * white flash on every navigation. Kept dependency-free and failure-tolerant —
 * if storage is blocked (private mode, disabled cookies) the OS preference
 * still wins rather than throwing and leaving the page unstyled.
 */
export const themeInitScript = `
(function () {
  try {
    var stored = localStorage.getItem(${JSON.stringify(THEME_STORAGE_KEY)});
    var prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    var dark = stored ? stored === 'dark' : prefersDark;
    document.documentElement.classList.toggle('dark', dark);
  } catch (e) {
    /* Storage unavailable — fall through and leave the light default. */
  }
})();
`.trim();
