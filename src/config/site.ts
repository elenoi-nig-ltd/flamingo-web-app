/**
 * Central site configuration.
 *
 * Everything that needs an absolute URL (canonical tags, Open Graph images,
 * the XML sitemap, robots.txt, JSON-LD) reads from here so we only ever set
 * the deployed domain in one place.
 *
 * Set NEXT_PUBLIC_SITE_URL in the environment for production, e.g.
 *   NEXT_PUBLIC_SITE_URL=https://flamingo.com.ng
 */

const rawSiteUrl =
  process.env.NEXT_PUBLIC_SITE_URL?.trim() || 'https://flamingo.com.ng';

// Normalise: strip any trailing slash so we can safely concatenate paths.
export const SITE_URL = rawSiteUrl.replace(/\/+$/, '');

export const SITE_NAME = 'Flamingo';
export const SITE_BRAND = 'Flamingo Marketplace';

/**
 * Brand tagline. Must stay in step with the homepage H1 in
 * `components/marketplace/Hero.tsx` — this string is what appears in Open
 * Graph alt text and the /minna page title, so drift between the two means the
 * site says one thing on the page and another when it is shared.
 */
export const SITE_TAGLINE = 'Everything around Minna. In one marketplace.';

export const SITE_DESCRIPTION =
  'Buy, sell and discover products and services in Minna on Flamingo. Find houses for rent, land, cars, phones, electronics, furniture, food, internet services and more around Gidan Kwano, Bosso and Minna.';

/** Primary geographic focus used across metadata and structured data. */
export const SITE_LOCATION = {
  city: 'Minna',
  state: 'Niger State',
  country: 'Nigeria',
  countryCode: 'NG',
  // FUT Minna / Gidan Kwano approximate coordinates.
  latitude: 9.5322,
  longitude: 6.4585,
} as const;

export const SITE_CONTACT = {
  phone: '+2348026968067',
  whatsapp: '2348026968067',
  email: 'hello@flamingo.com.ng',
  addressLine: 'Opposite FUT Main Campus, Gidan Kwano',
} as const;

export const SITE_SOCIALS = {
  instagram: 'https://www.instagram.com/Flamingo_GK',
  facebook: 'https://www.facebook.com/profile.php?id=61579342001391',
  tiktok: 'https://www.tiktok.com/@Flamingo_GK',
} as const;

/** Default Open Graph image (1200x630 recommended). */
export const SITE_OG_IMAGE = '/assets/og/flamingo-og.png';

/** Legal entity that operates the marketplace. */
export const SITE_LEGAL_NAME = 'Elenoi Nig Limited';

/** Absolute URL helper — always returns a fully-qualified URL. */
export function absoluteUrl(path = '/'): string {
  if (/^https?:\/\//i.test(path)) return path;
  const suffix = path.startsWith('/') ? path : `/${path}`;
  return `${SITE_URL}${suffix}`;
}
