import type { MetadataRoute } from 'next';
import { SITE_URL } from '@/config/site';
import {
  CITY,
  MARKETPLACE_CATEGORIES,
  MINNA_AREAS,
  CATEGORY_PATH_ALIASES,
} from '@/config/marketplace';
import {
  buildAreaPath,
  buildCategoryPath,
  buildAreaCategoryPath,
  buildPropertyListingPath,
} from '@/config/urls';
import { getPublicProperties } from '@/lib/properties';
import { GUIDE_ARTICLES } from '@/config/guides';

/**
 * XML sitemap — automatically reflects marketplace structure + live listings
 * (spec §11). Next.js serves this at /sitemap.xml and re-generates it on the
 * configured revalidation interval.
 */
export const revalidate = 3600; // rebuild hourly

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const now = new Date();

  // Static, high-value marketing/marketplace pages.
  const staticPaths = [
    '/',
    '/real-estates',
    '/food',
    '/home-items',
    '/internet',
    '/minna-guide',
    '/terms',
    '/policy',
    '/cookies',
    '/cancellation',
  ];

  const staticEntries: MetadataRoute.Sitemap = staticPaths.map((path) => ({
    url: `${SITE_URL}${path}`,
    lastModified: now,
    changeFrequency: path === '/' ? 'daily' : 'weekly',
    priority: path === '/' ? 1 : 0.7,
  }));

  // City hub.
  const cityEntry: MetadataRoute.Sitemap = [
    {
      url: `${SITE_URL}/${CITY.slug}`,
      lastModified: now,
      changeFrequency: 'daily',
      priority: 0.9,
    },
  ];

  // Top-level category + alias paths (/minna/houses-for-rent, etc).
  const categorySlugs = new Set<string>();
  MARKETPLACE_CATEGORIES.forEach((c) => categorySlugs.add(c.slug));
  CATEGORY_PATH_ALIASES.forEach((a) => categorySlugs.add(a.slug));

  const categoryEntries: MetadataRoute.Sitemap = Array.from(categorySlugs).map(
    (slug) => ({
      url: `${SITE_URL}${buildCategoryPath(slug)}`,
      lastModified: now,
      changeFrequency: 'daily',
      priority: 0.8,
    }),
  );

  // Area hubs (/minna/gidan-kwano).
  const areaEntries: MetadataRoute.Sitemap = MINNA_AREAS.map((area) => ({
    url: `${SITE_URL}${buildAreaPath(area.slug)}`,
    lastModified: now,
    changeFrequency: 'daily',
    priority: 0.7,
  }));

  // Area + category combos for the most important property categories (§4).
  const areaCategorySlugs = [
    'houses-for-rent',
    'houses-for-sale',
    'land-for-sale',
    'student-accommodation',
  ];
  const areaCategoryEntries: MetadataRoute.Sitemap = [];
  for (const area of MINNA_AREAS) {
    for (const catSlug of areaCategorySlugs) {
      areaCategoryEntries.push({
        url: `${SITE_URL}${buildAreaCategoryPath(area.slug, catSlug)}`,
        lastModified: now,
        changeFrequency: 'daily',
        priority: 0.7,
      });
    }
  }

  // Guide articles (§10).
  const guideEntries: MetadataRoute.Sitemap = GUIDE_ARTICLES.map((article) => ({
    url: `${SITE_URL}/minna-guide/${article.slug}`,
    lastModified: now,
    changeFrequency: 'monthly',
    priority: 0.6,
  }));

  // Every live listing gets its own permanent URL (spec §5 + §11).
  let listingEntries: MetadataRoute.Sitemap = [];
  try {
    const properties = await getPublicProperties();
    listingEntries = properties.map((property) => ({
      url: `${SITE_URL}${buildPropertyListingPath(property)}`,
      lastModified: property.updatedAt ? new Date(property.updatedAt) : now,
      changeFrequency: 'weekly',
      priority: 0.6,
    }));
  } catch {
    listingEntries = [];
  }

  return [
    ...staticEntries,
    ...cityEntry,
    ...categoryEntries,
    ...areaEntries,
    ...areaCategoryEntries,
    ...guideEntries,
    ...listingEntries,
  ];
}
