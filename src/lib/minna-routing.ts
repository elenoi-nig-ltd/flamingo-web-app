/**
 * Resolver for the /minna/[...slug] catch-all (spec §4 + §5).
 *
 * A single catch-all handles every Minna path so there are no Next.js route
 * collisions. It resolves the slug array into one of:
 *
 *   /minna/<category>                         -> category hub
 *   /minna/<area>                             -> area hub
 *   /minna/<area>/<category>                  -> area + category hub
 *   /minna/<area>/<category>/<title>-<id>     -> individual listing (§5)
 *
 * Returns a discriminated union so callers can render + build metadata safely.
 */

import {
  getAreaBySlug,
  getCategoryBySlug,
  getCategoryAlias,
  type MinnaArea,
  type MarketplaceCategory,
  type CategoryPathAlias,
} from '@/config/marketplace';
import { extractIdFromSlug } from '@/config/urls';

export type MinnaRoute =
  | { kind: 'category'; category: MarketplaceCategory | CategoryHint }
  | { kind: 'area'; area: MinnaArea }
  | {
      kind: 'area-category';
      area: MinnaArea;
      category: MarketplaceCategory | CategoryHint;
    }
  | { kind: 'listing'; area: MinnaArea; categorySlug: string; id: string }
  | { kind: 'not-found' };

/**
 * A lightweight category descriptor. Category *aliases* (e.g. houses-for-rent)
 * are not full MarketplaceCategory objects, so we normalise both into a hint.
 */
export interface CategoryHint {
  slug: string;
  name: string;
  description: string;
  /** parent category slug, when this is a subcategory alias */
  parentSlug?: string;
  subcategorySlug?: string;
}

function toCategoryHint(
  category?: MarketplaceCategory,
  alias?: CategoryPathAlias,
): CategoryHint | undefined {
  if (category) {
    return {
      slug: category.slug,
      name: category.name,
      description: category.description,
    };
  }
  if (alias) {
    const parent = getCategoryBySlug(alias.parentCategory);
    return {
      slug: alias.slug,
      name: alias.name,
      description: parent
        ? `${alias.name} in Minna — part of ${parent.name}.`
        : `${alias.name} in Minna.`,
      parentSlug: alias.parentCategory,
      subcategorySlug: alias.subcategory,
    };
  }
  return undefined;
}

/** Resolve a category slug to a hint (handles both full categories + aliases). */
export function resolveCategorySlug(slug: string): CategoryHint | undefined {
  const category = getCategoryBySlug(slug);
  if (category) return toCategoryHint(category);
  const alias = getCategoryAlias(slug);
  if (alias) return toCategoryHint(undefined, alias);
  return undefined;
}

export function resolveMinnaRoute(slug: string[]): MinnaRoute {
  if (!slug || slug.length === 0) return { kind: 'not-found' };

  // --- 1 segment: category OR area ---------------------------------------
  if (slug.length === 1) {
    const [first] = slug;
    const category = resolveCategorySlug(first);
    if (category) return { kind: 'category', category };
    const area = getAreaBySlug(first);
    if (area) return { kind: 'area', area };
    return { kind: 'not-found' };
  }

  // --- 2 segments: area + category ---------------------------------------
  if (slug.length === 2) {
    const [first, second] = slug;
    const area = getAreaBySlug(first);
    const category = resolveCategorySlug(second);
    if (area && category) {
      return { kind: 'area-category', area, category };
    }
    return { kind: 'not-found' };
  }

  // --- 3 segments: individual listing ------------------------------------
  if (slug.length === 3) {
    const [areaSlug, categorySlug, listingSlug] = slug;
    const area = getAreaBySlug(areaSlug);
    const id = extractIdFromSlug(listingSlug);
    if (area && id) {
      return { kind: 'listing', area, categorySlug, id };
    }
    return { kind: 'not-found' };
  }

  return { kind: 'not-found' };
}
