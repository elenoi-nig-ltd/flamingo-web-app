/**
 * Server-side property data access.
 *
 * These functions run on the server (App Router server components, sitemap,
 * generateMetadata) so that public marketplace pages are server-rendered and
 * fully crawlable (spec §8 + §11). They talk to the same NestJS endpoints the
 * client hooks use, but never touch localStorage/auth — only the public routes.
 *
 * Resilience: every function catches network/parse errors and returns a safe
 * empty value instead of throwing, so a backend hiccup degrades gracefully to
 * an empty state rather than a hard crash (spec §8).
 *
 * Every request is also bounded by FETCH_TIMEOUT_MS. The API is hosted on a
 * platform that suspends idle instances, so an un-timed request can otherwise
 * hang for well over a minute on a cold start — which is a function timeout on
 * Vercel and a broken first paint (spec §11). Failing fast degrades to the same
 * empty state instead.
 */

import { BASEURL } from '@/config/api/contants';
import { type MinnaArea } from '@/config/marketplace';
import {
  resolvePropertyAreaSlug,
  resolvePropertyCategorySlug,
} from '@/config/urls';

export interface PropertyContact {
  name?: string;
  phone?: string;
  email?: string;
}

/** Normalised property shape used by all server-rendered marketplace pages. */
export interface Property {
  id: string;
  title: string;
  description: string;
  price: number;
  address: string;
  propertyType: string;
  bedrooms: number;
  bathrooms: number;
  area: number;
  images: string[];
  totalRooms?: number;
  roomsBooked?: number;
  roomsAvailable?: number;
  amenities: string[];
  contactInfo?: PropertyContact;
  landlordId: string;
  verified: boolean;
  isBooked: boolean;
  availability: boolean;
  bookingStatus?: string | null;
  createdAt?: string;
  updatedAt?: string;
  // Forward-compatible structured fields.
  listingType?: string;
  areaName?: string;
  verificationLevels?: ('phone' | 'seller' | 'property')[];
  status?: string;
  expiresAt?: string;
  parking?: boolean;
  water?: boolean;
  furnished?: boolean;
  // Derived on the server for convenience.
  areaSlug: string;
  categorySlug: string;
}

/** How long (seconds) Next.js may cache the fetched public data. */
const REVALIDATE_SECONDS = 300;

/**
 * How long (ms) a backend request may take before it is aborted.
 *
 * Kept well under the 10s serverless budget so a cold backend can never stall a
 * render past the platform limit. A warm request answers in well under a second,
 * so this only ever trips on a genuinely unhealthy backend.
 */
const FETCH_TIMEOUT_MS = 8000;

/**
 * Request options shared by every backend read: JSON, cached, and bounded.
 *
 * A fresh signal is created per call on purpose — `AbortSignal.timeout()`
 * starts counting down the moment it is created, so a shared instance would be
 * permanently aborted a few seconds after the module first loads.
 */
function readOptions(): RequestInit & { next: { revalidate: number } } {
  return {
    headers: { Accept: 'application/json' },
    next: { revalidate: REVALIDATE_SECONDS },
    signal: AbortSignal.timeout(FETCH_TIMEOUT_MS),
  };
}

/** Log a failed read, naming a timeout explicitly so logs point at the cause. */
function logFetchFailure(what: string, err: unknown): void {
  // Read `name` structurally rather than via `instanceof Error`: the abort
  // reason is a DOMException, whose prototype chain varies between runtimes.
  const name = (err as { name?: string } | null | undefined)?.name;
  const reason =
    name === 'TimeoutError' || name === 'AbortError'
      ? `no response within ${FETCH_TIMEOUT_MS}ms`
      : err;
  console.error(`[properties] ${what} — ${String(reason)}`);
}

function toStringId(raw: any): string {
  return (raw?._id || raw?.id || '').toString();
}

/** Map a raw backend record into our normalised Property. */
export function normalizeProperty(raw: any): Property {
  const id = toStringId(raw);
  const propertyType = (raw?.propertyType || '').toString();
  const isLodge = propertyType.toLowerCase() === 'lodge';

  const roomsAvailable =
    typeof raw?.roomsAvailable === 'number' ? raw.roomsAvailable : undefined;

  // Prefer explicit backend booking signals; fall back to schema's isAvailable.
  const isBooked =
    isLodge && typeof roomsAvailable === 'number'
      ? roomsAvailable <= 0
      : raw?.isBooked === true ||
        raw?.bookingStatus === 'confirmed' ||
        raw?.bookingStatus === 'completed' ||
        raw?.availability === false ||
        raw?.isAvailable === false;

  const availability =
    isLodge && typeof roomsAvailable === 'number'
      ? roomsAvailable > 0
      : !isBooked;

  const partial: Omit<Property, 'areaSlug' | 'categorySlug'> = {
    id,
    title: raw?.title || 'Untitled Property',
    description: raw?.description || '',
    price: Number(raw?.price) || 0,
    address: raw?.address || '',
    propertyType,
    bedrooms: Number(raw?.bedrooms) || 0,
    bathrooms: Number(raw?.bathrooms) || 0,
    area: Number(raw?.area) || 0,
    images: Array.isArray(raw?.images) ? raw.images.filter(Boolean) : [],
    totalRooms:
      typeof raw?.totalRooms === 'number' ? raw.totalRooms : undefined,
    roomsBooked:
      typeof raw?.roomsBooked === 'number' ? raw.roomsBooked : undefined,
    roomsAvailable,
    amenities: Array.isArray(raw?.amenities) ? raw.amenities : [],
    contactInfo: raw?.contactInfo || undefined,
    landlordId: (raw?.landlordId || '').toString(),
    verified: Boolean(raw?.verified),
    isBooked,
    availability,
    bookingStatus: raw?.bookingStatus ?? null,
    createdAt: raw?.createdAt,
    updatedAt: raw?.updatedAt,
    listingType: raw?.listingType,
    areaName: typeof raw?.areaName === 'string' ? raw.areaName : undefined,
    verificationLevels: Array.isArray(raw?.verificationLevels) ? raw.verificationLevels : undefined,
    status: raw?.status || 'active',
    expiresAt: raw?.expiresAt,
    parking: Boolean(raw?.parking),
    water: Boolean(raw?.water),
    furnished: Boolean(raw?.furnished),
  };

  return {
    ...partial,
    areaSlug: resolvePropertyAreaSlug(partial),
    categorySlug: resolvePropertyCategorySlug(partial),
  };
}

/** Fetch all public properties (server-side, cached). */
export async function getPublicProperties(): Promise<Property[]> {
  try {
    const res = await fetch(`${BASEURL}/real-estates/public`, readOptions());
    if (!res.ok) {
      console.error(
        `[properties] /real-estates/public returned ${res.status} ${res.statusText}`,
      );
      return [];
    }
    const data = await res.json();
    if (!Array.isArray(data)) return [];
    return data.map(normalizeProperty).filter((p) => p.id);
  } catch (err) {
    logFetchFailure('Failed to fetch public properties', err);
    return [];
  }
}

/** Fetch a single public property by id (server-side, cached). */
export async function getPublicProperty(
  id: string,
): Promise<Property | null> {
  if (!id) return null;
  try {
    const res = await fetch(
      `${BASEURL}/real-estates/public/${id}`,
      readOptions(),
    );
    if (!res.ok) {
      if (res.status !== 404) {
        console.error(
          `[properties] /real-estates/public/${id} returned ${res.status}`,
        );
      }
      return null;
    }
    const data = await res.json();
    if (!data || (!data._id && !data.id)) return null;
    return normalizeProperty(data);
  } catch (err) {
    logFetchFailure(`Failed to fetch property ${id}`, err);
    return null;
  }
}

/**
 * Properties located within a given Minna area.
 *
 * Compares the slug `normalizeProperty` already resolved rather than resolving
 * again — the previous version re-passed the numeric `area` field into the
 * resolver, which threw and emptied the area hub pages.
 */
export function filterPropertiesByArea(
  properties: Property[],
  area: MinnaArea,
): Property[] {
  return properties.filter((p) => p.areaSlug === area.slug);
}
