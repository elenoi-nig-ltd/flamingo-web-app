import Link from 'next/link';
import type { Property } from '@/lib/properties';
import { CONTAINER } from '@/config/layout';
import CategoryGrid from './CategoryGrid';
import AreaGrid from './AreaGrid';
import GuideTeaser from './GuideTeaser';
import Hero from './Hero';
import PropertyRail from './PropertyRail';
import SectionHeading from './SectionHeading';
import FeaturedServices from './FeaturedServices';
import FeaturedProductsRail from './FeaturedProductsRail';
import FoodProductsRail from './FoodProductsRail';

/**
 * The marketplace homepage (spec §1, §2, §3, §9).
 *
 * Server component: every heading, category link, area link and listing link
 * below is rendered into the initial HTML, which is the point of the spec.
 *
 * Section order:
 *   1. Hero
 *   2. Browse Categories
 *   3. Featured Home Items rail  (shows first when products exist; renders null otherwise)
 *   4. Food & Drinks rail        (shows first when home items are empty)
 *   5-8. Property rails
 *   9. Explore Minna
 *   10. Marketplace Services CTA (moved to bottom — it reads as a CTA, not content)
 *   11. Sell something
 *   12. Minna Marketplace Guide
 */
export default function MarketplaceHome({
  properties,
}: {
  properties: Property[];
}) {
  const housesForRent = properties.filter(
    (property) => property.categorySlug === 'houses-for-rent',
  );
  const aroundGidanKwano = properties.filter(
    (property) => property.areaSlug === 'gidan-kwano',
  );
  const recentlyAdded = [...properties]
    .sort(
      (a, b) =>
        new Date(b.createdAt ?? 0).getTime() -
        new Date(a.createdAt ?? 0).getTime(),
    )
    .slice(0, 8);
  const verified = properties.filter((property) => property.verified);

  return (
    <>
      {/*
        §9: hero — the promise, the search control and the product collage.
        Self-contained in `Hero.tsx`.
      */}
      <Hero />

      {/*
        One rhythm for the whole page: the container owns the vertical spacing
        via `gap`, so no section carries its own padding and they cannot drift
        apart.
      */}
      <div className={`${CONTAINER} mt-8 flex flex-col gap-8 sm:gap-10`}>
        {/* 2. Browse Categories */}
        <section>
          <SectionHeading title="Browse categories" />
          <CategoryGrid />
        </section>

        {/*
          3. Featured Home Items — horizontally scrollable snap rail.
          Returns null when empty so the food rail naturally floats up to
          the top position (no empty box, no flash of nothing).
        */}
        <FoodProductsRail />

        {/*
          4. Home Essentials — sits below food.
        */}
        <FeaturedProductsRail />

        {/* 5-8. Property rails */}
        <PropertyRail
          title="Houses for rent in Minna"
          subtitle="Rentals around Gidan Kwano, Bosso and the rest of Minna."
          properties={housesForRent}
          href="/minna/houses-for-rent"
          emptyMessage="No houses for rent are listed yet."
        />

        <PropertyRail
          title="Popular around Gidan Kwano"
          subtitle="The busiest rental market in Minna, around FUT's main campus."
          properties={aroundGidanKwano}
          href="/minna/gidan-kwano"
          emptyMessage="Nothing listed around Gidan Kwano yet."
        />

        <PropertyRail
          title="Recently added"
          subtitle="The latest listings across Minna."
          properties={recentlyAdded}
          href="/minna/properties"
          emptyMessage="No listings have been added yet."
        />

        <PropertyRail
          title="Verified listings"
          subtitle="Listings whose property details were physically confirmed."
          properties={verified}
          emptyMessage="No verified listings yet."
        />

        {/* 9. Explore Minna */}
        <section>
          <SectionHeading title="Explore Minna" href="/minna" hrefLabel="All areas" />
          <AreaGrid />
        </section>

        {/*
          10. Marketplace Services & Essentials — moved to the bottom.
          This section reads as a set of CTAs ("Explore Food", "Explore Campus WiFi"…)
          rather than as product content, so it belongs after the browsable inventory,
          not immediately below the category chips.
        */}
        <FeaturedServices />

        {/* 11. Sell something */}
        <section>
          <div className="flex flex-col items-center gap-4 rounded-2xl border border-[#f0e6d0] bg-[#f5f3eb] px-6 py-8 text-center sm:flex-row sm:justify-between sm:text-left dark:border-gray-700 dark:bg-gray-800">
            <div>
              <h2 className="text-xl font-bold tracking-tight text-gray-900 sm:text-2xl dark:text-gray-100">
                Selling something?
              </h2>
              <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
                Reach buyers around Minna.
              </p>
            </div>
            <Link
              href="/landlord/add-properties"
              className="inline-flex shrink-0 items-center gap-2 rounded-full bg-[#f58c55] px-6 py-3 text-sm font-bold text-white transition-colors hover:bg-[#f47a45] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#f58c55] focus-visible:ring-offset-2 dark:focus-visible:ring-offset-gray-900"
            >
              Post an ad
            </Link>
          </div>
        </section>

        {/* 12. Minna Marketplace Guide */}
        <section>
          <SectionHeading
            title="Minna marketplace guide"
            href="/minna-guide"
            hrefLabel="All guides"
          />
          <GuideTeaser />
        </section>
      </div>
    </>
  );
}
