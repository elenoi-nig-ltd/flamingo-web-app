import type { Metadata } from 'next';
import Link from 'next/link';
import { MapPin, ArrowRight } from 'lucide-react';
import {
  CITY,
  STATE,
  MARKETPLACE_CATEGORIES,
  MINNA_AREAS,
  getFeaturedAreas,
} from '@/config/marketplace';
import {
  buildCategoryPath,
  buildAreaPath,
  buildAreaCategoryPath,
} from '@/config/urls';
import { getPublicProperties } from '@/lib/properties';
import { absoluteUrl, SITE_LOCATION } from '@/config/site';
import Breadcrumbs from '@/components/marketplace/Breadcrumbs';
import PropertyCard, {
  PropertyGrid,
} from '@/components/marketplace/PropertyCard';
import EmptyState from '@/components/marketplace/EmptyState';
import JsonLd from '@/components/seo/JsonLd';
import { breadcrumbSchema, itemListSchema } from '@/lib/structured-data';

export const revalidate = 300;

export const metadata: Metadata = {
  title: 'Minna Marketplace — Buy, Sell, Rent & Find Services in Minna',
  description:
    'Explore the Minna marketplace on Flamingo. Browse houses for rent, land for sale, cars, phones, electronics, furniture and services across Gidan Kwano, Bosso, Tunga and all of Minna, Niger State.',
  alternates: { canonical: `/${CITY.slug}` },
  openGraph: {
    title: 'Minna Marketplace — Everything Minna. One Marketplace.',
    description:
      'Browse houses for rent, land, cars, phones and services across Minna, Niger State on Flamingo.',
    url: absoluteUrl(`/${CITY.slug}`),
  },
};

export default async function MinnaHubPage() {
  const properties = await getPublicProperties();
  const featured = properties.slice(0, 8);
  const featuredAreas = getFeaturedAreas();

  const crumbs = [
    { name: 'Home', path: '/' },
    { name: CITY.name, path: `/${CITY.slug}` },
  ];

  return (
    <main className="min-h-screen bg-[#f8f5e6] dark:bg-gray-900">
      <JsonLd
        data={[breadcrumbSchema(crumbs), itemListSchema(featured)]}
      />

      {/* Hero */}
      <section className="bg-gradient-to-r from-[#f89b64] to-[#f47a45] pt-28 pb-12 text-white dark:from-gray-800 dark:to-gray-700">
        <div className="container mx-auto max-w-7xl px-4">
          <Breadcrumbs items={crumbs} className="mb-4 text-white/80" />
          <h1 className="text-3xl font-bold md:text-4xl">
            Everything in {CITY.name}. One Marketplace.
          </h1>
          <p className="mt-2 max-w-2xl text-white/90">
            Discover products, property and services across {CITY.name},{' '}
            {STATE.name}. Browse by category or explore a specific area like
            Gidan Kwano, Bosso and Tunga.
          </p>
        </div>
      </section>

      <div className="container mx-auto max-w-7xl px-4 py-10">
        {/* Categories */}
        <section aria-labelledby="browse-categories">
          <h2
            id="browse-categories"
            className="mb-5 text-2xl font-bold text-gray-800 dark:text-gray-100"
          >
            Browse categories in {CITY.name}
          </h2>
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
            {MARKETPLACE_CATEGORIES.map((category) => (
              <Link
                key={category.slug}
                href={buildCategoryPath(category.slug)}
                className="group flex flex-col gap-2 rounded-2xl border border-[#f0e6d0] bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-lg dark:border-gray-700 dark:bg-gray-800"
              >
                <span className="text-3xl" aria-hidden>
                  {category.icon}
                </span>
                <span className="font-semibold text-gray-800 dark:text-gray-100">
                  {category.name}
                </span>
                <span className="line-clamp-2 text-xs text-gray-500 dark:text-gray-400">
                  {category.examples.join(' · ')}
                </span>
              </Link>
            ))}
          </div>
        </section>

        {/* Explore areas */}
        <section aria-labelledby="explore-areas" className="mt-12">
          <h2
            id="explore-areas"
            className="mb-5 text-2xl font-bold text-gray-800 dark:text-gray-100"
          >
            Explore areas in {CITY.name}
          </h2>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {MINNA_AREAS.map((area) => (
              <Link
                key={area.slug}
                href={buildAreaPath(area.slug)}
                className="group flex items-start justify-between gap-3 rounded-2xl border border-[#f0e6d0] bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-lg dark:border-gray-700 dark:bg-gray-800"
              >
                <div className="flex items-start gap-3">
                  <MapPin className="mt-0.5 h-5 w-5 shrink-0 text-[#f47a45]" />
                  <div>
                    <p className="font-semibold text-gray-800 dark:text-gray-100">
                      {area.name}
                    </p>
                    <p className="line-clamp-2 text-xs text-gray-500 dark:text-gray-400">
                      {area.description}
                    </p>
                  </div>
                </div>
                <ArrowRight className="h-4 w-4 shrink-0 text-gray-400 transition group-hover:translate-x-1 group-hover:text-[#f47a45]" />
              </Link>
            ))}
          </div>
        </section>

        {/* Popular houses for rent by featured area */}
        <section className="mt-12">
          <div className="mb-5 flex flex-wrap items-center gap-3">
            <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-100">
              Houses for rent by area
            </h2>
          </div>
          <div className="flex flex-wrap gap-2">
            {featuredAreas.map((area) => (
              <Link
                key={area.slug}
                href={buildAreaCategoryPath(area.slug, 'houses-for-rent')}
                className="rounded-full border border-[#f0e6d0] bg-white px-4 py-2 text-sm font-medium text-gray-700 transition hover:border-[#f47a45] hover:text-[#f47a45] dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300"
              >
                Houses for Rent in {area.name}
              </Link>
            ))}
          </div>
        </section>

        {/* Recently added listings */}
        <section className="mt-12">
          <div className="mb-5 flex items-center justify-between">
            <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-100">
              Recently added in {CITY.name}
            </h2>
            <Link
              href={buildCategoryPath('properties')}
              className="text-sm font-semibold text-[#f47a45] hover:underline"
            >
              View all
            </Link>
          </div>
          {featured.length > 0 ? (
            <PropertyGrid>
              {featured.map((property, index) => (
                <PropertyCard
                  key={property.id}
                  property={property}
                  priority={index < 4}
                />
              ))}
            </PropertyGrid>
          ) : (
            <EmptyState
              title="No listings in Minna yet"
              message="We’re adding genuine Gidan Kwano and Minna listings. Check back shortly, or list your own property."
            />
          )}
        </section>
      </div>
    </main>
  );
}
