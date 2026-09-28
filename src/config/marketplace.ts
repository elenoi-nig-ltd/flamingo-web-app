/**
 * Marketplace taxonomy: categories and Minna location architecture.
 *
 * This is the single source of truth for:
 *  - Homepage "Browse Categories" (spec §3)
 *  - Indexable location/category paths like /minna/gidan-kwano/houses-for-rent
 *    (spec §4)
 *  - Breadcrumbs, canonical URLs, sitemap generation (spec §11)
 *
 * The backend real-estate model currently only stores a free-text `address`,
 * so `matchers` below let us map a listing to an area/category by inspecting
 * its address + propertyType. If the backend later adds structured
 * `state/city/area` fields, prefer those (see resolveListingLocation()).
 */

export interface MarketplaceSubcategory {
  slug: string;
  name: string;
  /** propertyType values (backend enum) that belong to this subcategory. */
  propertyTypes?: string[];
  /** listingType intent, used for rent vs sale filtering. */
  intent?: 'rent' | 'sale' | 'any';
}

export interface MarketplaceCategory {
  slug: string;
  name: string;
  /** Short human description used in metadata + hub pages. */
  description: string;
  /** Emoji/icon hint for lightweight rendering without image assets. */
  icon: string;
  examples: string[];
  subcategories: MarketplaceSubcategory[];
  /** True when this category is backed by real inventory today. */
  live?: boolean;
}

export const MARKETPLACE_CATEGORIES: MarketplaceCategory[] = [
  {
    slug: 'properties',
    name: 'Property',
    description:
      'Houses for rent, land, shops, houses for sale and student accommodation around Minna.',
    icon: '🏠',
    examples: [
      'Houses for Rent',
      'Land',
      'Shops',
      'Houses for Sale',
      'Student Accommodation',
    ],
    live: true,
    subcategories: [
      {
        slug: 'houses-for-rent',
        name: 'Houses for Rent',
        intent: 'rent',
        propertyTypes: ['apartment', 'house', 'condo', 'townhouse', 'lodge'],
      },
      {
        slug: 'houses-for-sale',
        name: 'Houses for Sale',
        intent: 'sale',
        propertyTypes: ['house', 'condo', 'townhouse'],
      },
      {
        slug: 'land-for-sale',
        name: 'Land for Sale',
        intent: 'sale',
        propertyTypes: ['land'],
      },
      {
        slug: 'student-accommodation',
        name: 'Student Accommodation',
        intent: 'rent',
        propertyTypes: ['lodge', 'apartment'],
      },
      { slug: 'shops', name: 'Shops', intent: 'any', propertyTypes: [] },
    ],
  },
  {
    slug: 'vehicles',
    name: 'Vehicles',
    description: 'Cars, motorcycles, tricycles and spare parts in Minna.',
    icon: '🚗',
    examples: ['Cars', 'Motorcycles', 'Tricycles', 'Spare Parts'],
    subcategories: [
      { slug: 'cars', name: 'Cars' },
      { slug: 'motorcycles', name: 'Motorcycles' },
      { slug: 'tricycles', name: 'Tricycles' },
      { slug: 'spare-parts', name: 'Spare Parts' },
    ],
  },
  {
    slug: 'phones',
    name: 'Phones & Tablets',
    description: 'Phones, tablets and accessories in Minna.',
    icon: '📱',
    examples: ['Phones', 'Tablets', 'Accessories'],
    subcategories: [
      { slug: 'phones', name: 'Phones' },
      { slug: 'tablets', name: 'Tablets' },
      { slug: 'accessories', name: 'Accessories' },
    ],
  },
  {
    slug: 'electronics',
    name: 'Electronics',
    description: 'Laptops, TVs, appliances and audio equipment in Minna.',
    icon: '💻',
    examples: ['Laptops', 'TVs', 'Appliances', 'Audio'],
    subcategories: [
      { slug: 'laptops', name: 'Laptops' },
      { slug: 'tvs', name: 'TVs' },
      { slug: 'appliances', name: 'Appliances' },
      { slug: 'audio', name: 'Audio' },
    ],
  },
  {
    slug: 'furniture',
    name: 'Home & Furniture',
    description: 'Furniture, kitchen and household items in Minna.',
    icon: '🛋️',
    examples: ['Furniture', 'Kitchen', 'Household Items'],
    live: true,
    subcategories: [
      { slug: 'furniture', name: 'Furniture' },
      { slug: 'kitchen', name: 'Kitchen' },
      { slug: 'household-items', name: 'Household Items' },
    ],
  },
  {
    slug: 'jobs',
    name: 'Jobs',
    description: 'Vacancies, part-time roles and student jobs in Minna.',
    icon: '💼',
    examples: ['Vacancies', 'Part-Time', 'Student Jobs'],
    subcategories: [
      { slug: 'vacancies', name: 'Vacancies' },
      { slug: 'part-time', name: 'Part-Time' },
      { slug: 'student-jobs', name: 'Student Jobs' },
    ],
  },
  {
    slug: 'services',
    name: 'Services',
    description: 'Artisans, repairs and professional services in Minna.',
    icon: '🛠️',
    examples: ['Artisans', 'Repairs', 'Professional Services'],
    subcategories: [
      { slug: 'artisans', name: 'Artisans' },
      { slug: 'repairs', name: 'Repairs' },
      { slug: 'professional-services', name: 'Professional Services' },
    ],
  },
  {
    slug: 'food',
    name: 'Food & Drinks',
    description: 'Restaurants, meals and groceries in Minna.',
    icon: '🍔',
    examples: ['Restaurants', 'Meals', 'Groceries'],
    live: true,
    subcategories: [
      { slug: 'restaurants', name: 'Restaurants' },
      { slug: 'meals', name: 'Meals' },
      { slug: 'groceries', name: 'Groceries' },
    ],
  },
  {
    slug: 'internet',
    name: 'Internet',
    description: 'Home, mobile and business internet services in Minna.',
    icon: '🌐',
    examples: ['Home Internet', 'Mobile Internet', 'Business Internet'],
    live: true,
    subcategories: [
      { slug: 'home-internet', name: 'Home Internet' },
      { slug: 'mobile-internet', name: 'Mobile Internet' },
      { slug: 'business-internet', name: 'Business Internet' },
    ],
  },
];

/**
 * Direct-category shortcuts used for the recommended indexable paths in §4
 * (e.g. /minna/houses-for-rent maps to properties > houses-for-rent).
 * These flatten a subcategory to a top-level Minna path.
 */
export interface CategoryPathAlias {
  slug: string;
  name: string;
  parentCategory: string;
  subcategory?: string;
}

export const CATEGORY_PATH_ALIASES: CategoryPathAlias[] = [
  { slug: 'properties', name: 'Property', parentCategory: 'properties' },
  {
    slug: 'houses-for-rent',
    name: 'Houses for Rent',
    parentCategory: 'properties',
    subcategory: 'houses-for-rent',
  },
  {
    slug: 'houses-for-sale',
    name: 'Houses for Sale',
    parentCategory: 'properties',
    subcategory: 'houses-for-sale',
  },
  {
    slug: 'land-for-sale',
    name: 'Land for Sale',
    parentCategory: 'properties',
    subcategory: 'land-for-sale',
  },
  {
    slug: 'student-accommodation',
    name: 'Student Accommodation',
    parentCategory: 'properties',
    subcategory: 'student-accommodation',
  },
  { slug: 'cars', name: 'Cars', parentCategory: 'vehicles', subcategory: 'cars' },
  { slug: 'phones', name: 'Phones', parentCategory: 'phones', subcategory: 'phones' },
  {
    slug: 'furniture',
    name: 'Furniture',
    parentCategory: 'furniture',
    subcategory: 'furniture',
  },
];

/* ------------------------------------------------------------------ *
 * LOCATION ARCHITECTURE — State > City > Area (spec §4)
 * ------------------------------------------------------------------ */

export interface MinnaArea {
  slug: string;
  name: string;
  description: string;
  /** Lowercase keywords used to match a listing's free-text address. */
  matchers: string[];
  /** Featured on the homepage "Explore Minna" hub. */
  featured?: boolean;
}

export const STATE = { slug: 'niger-state', name: 'Niger State' } as const;
export const CITY = { slug: 'minna', name: 'Minna' } as const;

export const MINNA_AREAS: MinnaArea[] = [
  {
    slug: 'gidan-kwano',
    name: 'Gidan Kwano',
    description:
      'Home of FUT Minna\u2019s main campus \u2014 the busiest student and rental hub in Minna.',
    matchers: ['gidan kwano', 'gidankwano', 'fut', 'futminna', 'talba', 'kff'],
    featured: true,
  },
  {
    slug: 'bosso',
    name: 'Bosso',
    description:
      'Bosso hosts FUT Minna\u2019s Bosso campus and a large student population.',
    matchers: ['bosso'],
    featured: true,
  },
  {
    slug: 'tunga',
    name: 'Tunga',
    description: 'A central, well-serviced residential neighbourhood in Minna.',
    matchers: ['tunga'],
    featured: true,
  },
  {
    slug: 'kpakungu',
    name: 'Kpakungu',
    description: 'A busy, affordable area on the south-western edge of Minna.',
    matchers: ['kpakungu'],
    featured: true,
  },
  {
    slug: 'chanchaga',
    name: 'Chanchaga',
    description: 'One of Minna\u2019s established central districts.',
    matchers: ['chanchaga'],
    featured: true,
  },
  {
    slug: 'maitumbi',
    name: 'Maitumbi',
    description: 'A growing residential area in the north of Minna.',
    matchers: ['maitumbi'],
    featured: true,
  },
  {
    slug: 'sauka-kahuta',
    name: 'Sauka Kahuta',
    description: 'A central residential area close to Minna town.',
    matchers: ['sauka', 'kahuta'],
  },
  {
    slug: 'shango',
    name: 'Shango',
    description: 'A developing area on the outskirts of Minna.',
    matchers: ['shango'],
  },
  {
    slug: 'dutsen-kura',
    name: 'Dutsen Kura',
    description: 'A popular residential neighbourhood in Minna.',
    matchers: ['dutsen kura', 'dutsen-kura', 'dutsenkura'],
  },
];

/* ------------------------------------------------------------------ *
 * LOOKUP HELPERS
 * ------------------------------------------------------------------ */

export function getCategoryBySlug(
  slug: string,
): MarketplaceCategory | undefined {
  return MARKETPLACE_CATEGORIES.find((c) => c.slug === slug);
}

export function getAreaBySlug(slug: string): MinnaArea | undefined {
  return MINNA_AREAS.find((a) => a.slug === slug);
}

export function getCategoryAlias(slug: string): CategoryPathAlias | undefined {
  return CATEGORY_PATH_ALIASES.find((a) => a.slug === slug);
}

/**
 * Category slugs priced as a recurring *annual* rent rather than a sale price.
 *
 * Student accommodation belongs here: lodges on the live data are quoted per
 * year ("#350000/year"), but the card and detail views only appended "/yr" for
 * 'houses-for-rent'. Every lodge therefore displayed a bare figure that read as
 * a purchase price.
 */
const ANNUAL_RENT_CATEGORIES = new Set([
  'houses-for-rent',
  'student-accommodation',
]);

/** Is this category's price a per-year rent? Drives the "/yr" suffix. */
export function isAnnualRentCategory(slug: string): boolean {
  return ANNUAL_RENT_CATEGORIES.has(slug);
}

export function getFeaturedAreas(): MinnaArea[] {
  return MINNA_AREAS.filter((a) => a.featured);
}

/**
 * Given a listing's free-text address (and optional structured fields the
 * backend may add later), resolve the Minna area it belongs to.
 * Returns undefined when nothing matches.
 */
export function resolveAreaFromAddress(
  address?: string | null,
  structuredArea?: string | null,
): MinnaArea | undefined {
  // Guard the type at runtime, not just in the signature. Callers passed the
  // real-estate model's numeric `area` (square metres) here, which threw
  // `toLowerCase is not a function` inside normalizeProperty — that exception
  // was swallowed by the caller's catch and turned every server-rendered
  // listing page into an empty result set. A non-string can only be a
  // mistake, so treat it as absent rather than take down the render.
  if (typeof structuredArea === 'string' && structuredArea.trim()) {
    const normalized = structuredArea.trim().toLowerCase();
    const bySlug = getAreaBySlug(normalized.replace(/\s+/g, '-'));
    if (bySlug) return bySlug;
    const byName = MINNA_AREAS.find((a) => a.name.toLowerCase() === normalized);
    if (byName) return byName;
  }

  if (typeof address !== 'string' || !address) return undefined;
  const normalized = address.toLowerCase();
  return MINNA_AREAS.find((area) =>
    area.matchers.some((m) => normalized.includes(m)),
  );
}
