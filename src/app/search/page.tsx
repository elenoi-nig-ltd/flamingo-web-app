import type { Metadata } from 'next';
import Link from 'next/link';
import { getPublicProperties } from '@/lib/properties';
import { absoluteUrl, SITE_NAME } from '@/config/site';
import { CITY, MARKETPLACE_CATEGORIES, getFeaturedAreas } from '@/config/marketplace';
import { buildCategoryPath, buildAreaPath } from '@/config/urls';
import Breadcrumbs from '@/components/marketplace/Breadcrumbs';
import PropertyListingView from '@/components/marketplace/PropertyListingView';

interface PageProps {
  searchParams: Promise<{ q?: string }>;
}

export async function generateMetadata({
  searchParams,
}: PageProps): Promise<Metadata> {
  const { q } = await searchParams;
  const query = (q || '').trim();
  const title = query
    ? `Search results for “${query}” in Minna | ${SITE_NAME}`
    : `Search the Minna marketplace | ${SITE_NAME}`;
  return {
    title,
    description: query
      ? `Marketplace results for “${query}” around Minna, Niger State on Flamingo.`
      : 'Search houses, cars, phones, furniture and services around Minna on Flamingo.',
    // Search result pages should not be indexed to avoid low-value duplicates.
    robots: { index: false, follow: true },
  };
}

export default async function SearchPage({ searchParams }: PageProps) {
  const { q } = await searchParams;
  const query = (q || '').trim();
  const properties = await getPublicProperties();
  const featuredAreas = getFeaturedAreas();

  const crumbs = [
    { name: 'Home', path: '/' },
    { name: 'Search', path: '/search' },
  ];

  return (
    <main className="min-h-screen bg-[#f8f5e6] dark:bg-gray-900">
      <section className="bg-white pt-24 pb-6 dark:bg-gray-800">
        <div className="container mx-auto max-w-7xl px-4">
          <Breadcrumbs items={crumbs} className="mb-4" />
          <h1 className="text-2xl font-bold text-gray-800 md:text-3xl dark:text-gray-100">
            {query ? `Results for “${query}”` : 'Search the Minna marketplace'}
          </h1>
          <p className="mt-1 text-gray-600 dark:text-gray-400">
            Search across property listings around {CITY.name}. Try a category
            or an area below.
          </p>

          {/* Helpful category/area shortcuts */}
          <div className="mt-4 flex flex-wrap gap-2">
            {MARKETPLACE_CATEGORIES.slice(0, 6).map((category) => (
              <Link
                key={category.slug}
                href={buildCategoryPath(category.slug)}
                className="rounded-full border border-[#f0e6d0] bg-[#f5f3eb] px-3 py-1.5 text-sm text-gray-700 transition hover:border-[#f47a45] hover:text-[#f47a45] dark:border-gray-700 dark:bg-gray-700 dark:text-gray-300"
              >
                {category.icon} {category.name}
              </Link>
            ))}
            {featuredAreas.slice(0, 4).map((area) => (
              <Link
                key={area.slug}
                href={buildAreaPath(area.slug)}
                className="rounded-full border border-[#f0e6d0] bg-[#f5f3eb] px-3 py-1.5 text-sm text-gray-700 transition hover:border-[#f47a45] hover:text-[#f47a45] dark:border-gray-700 dark:bg-gray-700 dark:text-gray-300"
              >
                📍 {area.name}
              </Link>
            ))}
          </div>
        </div>
      </section>

      <div className="container mx-auto max-w-7xl px-4 py-8">
        <PropertyListingView
          properties={properties}
          initialQuery={query}
          emptyTitle={query ? `No results for “${query}”` : 'Nothing here yet'}
          emptyMessage="Try a different keyword, clear your filters, or browse a category."
        />
      </div>
    </main>
  );
}
