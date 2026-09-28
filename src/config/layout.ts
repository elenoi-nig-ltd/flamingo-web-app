/**
 * Shared page-shell geometry.
 *
 * The header and the page bodies did not agree on a container. The header used
 * Tailwind's `container`, which is a full-breakpoint-width box (1536px at a
 * 1536px viewport), while the marketplace pages used `max-w-7xl` (1280px). The
 * result was that at a 1536px viewport the logo sat at x=24 and the homepage
 * content at x=160 — 136px apart, so nothing lined up down the left edge.
 *
 * One token, used by both, is the fix. Adopt it anywhere a page shell is built
 * rather than repeating a max-width.
 *
 * `max-w-[1240px]` with 32px gutters leaves 1176px of content, which is the
 * measure the approved homepage mockup uses.
 */
export const CONTAINER = 'mx-auto w-full max-w-[1240px] px-4 md:px-6 lg:px-8';
