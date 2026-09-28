/**
 * URL + slug helpers for the Minna marketplace.
 *
 * Listing URL scheme (spec §5):
 *   /minna/<area>/<category>/<slugified-title>-<id>
 * e.g.
 *   /minna/gidan-kwano/houses-for-rent/3-bedroom-bungalow-gidan-kwano-18452
 *
 * The trailing numeric/hex id segment is the source of truth — the human
 * slug in front of it is purely for readability + SEO and can change without
 * breaking the link (we canonicalise back to the id).
 */

import {
  CITY,
  MINNA_AREAS,
  resolveAreaFromAddress,
  type MarketplaceSubcategory,
} from './marketplace';

/** Convert arbitrary text into a URL-safe slug. */
export function slugify(input: string): string {
  return (input || '')
    .toString()
    .toLowerCase()
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '') // strip accents
    .replace(/[^a-z0-9]+/g, '-') // non-alphanumerics -> hyphen
    .replace(/^-+|-+$/g, '') // trim leading/trailing hyphens
    .replace(/-{2,}/g, '-'); // collapse repeats
}

/**
 * A Mongo ObjectId is 24 hex chars. We accept that, or any trailing
 * alphanumeric run, as the id portion of a listing slug.
 */
export function extractIdFromSlug(slugWithId: string): string | null {
  if (!slugWithId) return null;
  // Prefer a 24-char hex ObjectId at the end.
  const objectId = slugWithId.match(/([a-f0-9]{24})$/i);
  if (objectId) return objectId[1];
  // Fall back to the last hyphen-delimited segment.
  const parts = slugWithId.split('-');
  const last = parts[parts.length - 1];
  return last || null;
}

/** Build the readable slug (without id) from a listing title. */
export function buildListingSlug(title: string): string {
  const base = slugify(title);
  return base || 'listing';
}

interface ListingLike {
  id?: string;
  _id?: string;
  title?: string;
  address?: string;
  propertyType?: string;
  /**
   * Structured Minna area NAME (e.g. "Gidan Kwano"), if the backend ever adds
   * one.
   *
   * Deliberately NOT called `area`: the real-estate model already uses `area`
   * for the numeric floor size in square metres. Reusing that key for an area
   * name is what caused `resolvePropertyAreaSlug` to pass a number into
   * `resolveAreaFromAddress`, throw, and silently empty every listing page.
   * See spec §4 — when the backend adds structured location fields they must
   * not be named `area`.
   */
  areaName?: string;
  city?: string;
  state?: string;
  listingType?: string;
}

/**
 * Choose the best category subpath for a property listing.
 * Land -> land-for-sale, lodge/student -> student-accommodation,
 * everything else defaults to houses-for-rent (the primary use-case in §6).
 */
export function resolvePropertyCategorySlug(listing: ListingLike): string {
  const type = (listing.propertyType || '').toLowerCase();
  const intent = (listing.listingType || '').toLowerCase();

  if (type === 'land') return 'land-for-sale';
  if (intent === 'sale') {
    return type === 'land' ? 'land-for-sale' : 'houses-for-sale';
  }
  if (type === 'lodge') return 'student-accommodation';
  return 'houses-for-rent';
}

/** Resolve which Minna area slug a listing belongs to (defaults to gidan-kwano). */
export function resolvePropertyAreaSlug(listing: ListingLike): string {
  // Only `areaName` is consulted — never `listing.area`, which on the live model
  // is a number (square metres) and used to throw here.
  const area = resolveAreaFromAddress(listing.address, listing.areaName);
  return area?.slug ?? 'gidan-kwano';
}

/**
 * The canonical, permanent, crawlable URL for a property listing (spec §5).
 */
export function buildPropertyListingPath(listing: ListingLike): string {
  const id = listing.id || listing._id || '';
  const areaSlug = resolvePropertyAreaSlug(listing);
  const categorySlug = resolvePropertyCategorySlug(listing);
  const titleSlug = buildListingSlug(listing.title || 'property');
  return `/${CITY.slug}/${areaSlug}/${categorySlug}/${titleSlug}-${id}`;
}

/** Location + category hub paths (spec §4). */
export function buildCityPath(): string {
  return `/${CITY.slug}`;
}

export function buildCategoryPath(categorySlug: string): string {
  return `/${CITY.slug}/${categorySlug}`;
}

export function buildAreaPath(areaSlug: string): string {
  return `/${CITY.slug}/${areaSlug}`;
}

export function buildAreaCategoryPath(
  areaSlug: string,
  categorySlug: string,
): string {
  return `/${CITY.slug}/${areaSlug}/${categorySlug}`;
}

/** Is this slug a known Minna area? Used by the catch-all router. */
export function isAreaSlug(slug: string): boolean {
  return MINNA_AREAS.some((a) => a.slug === slug);
}

/** Does a listing match a subcategory's intent + property types? */
export function listingMatchesSubcategory(
  listing: ListingLike,
  sub: MarketplaceSubcategory,
): boolean {
  const type = (listing.propertyType || '').toLowerCase();
  if (sub.propertyTypes && sub.propertyTypes.length > 0) {
    return sub.propertyTypes.includes(type);
  }
  return true;
}
