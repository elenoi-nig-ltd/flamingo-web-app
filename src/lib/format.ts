/**
 * Small formatting helpers shared across server-rendered marketplace pages.
 * Kept dependency-free so they can run on the server.
 */

/** Format a number as Nigerian Naira, e.g. ₦450,000. */
export function formatNaira(amount: number | null | undefined): string {
  const value = Number(amount) || 0;
  return `₦${value.toLocaleString('en-NG')}`;
}

/** Format an ISO date as e.g. "15 Jan 2026". */
export function formatDate(iso?: string | null): string {
  if (!iso) return '';
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return '';
  return date.toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
}

/** Human relative time, e.g. "3 days ago", "2 months ago". */
export function timeAgo(iso?: string | null): string {
  if (!iso) return '';
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return '';
  const seconds = Math.floor((Date.now() - date.getTime()) / 1000);
  if (seconds < 60) return 'just now';
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes} minute${minutes === 1 ? '' : 's'} ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours} hour${hours === 1 ? '' : 's'} ago`;
  const days = Math.floor(hours / 24);
  if (days < 30) return `${days} day${days === 1 ? '' : 's'} ago`;
  const months = Math.floor(days / 30);
  if (months < 12) return `${months} month${months === 1 ? '' : 's'} ago`;
  const years = Math.floor(months / 12);
  return `${years} year${years === 1 ? '' : 's'} ago`;
}

/** Title-case a property type for display, e.g. "townhouse" -> "Townhouse". */
export function titleCase(value?: string | null): string {
  if (!value) return '';
  return value
    .replace(/[-_]+/g, ' ')
    .replace(/\b\w/g, (c) => c.toUpperCase());
}
