import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { CITY, STATE, getCategoryBySlug } from '@/config/marketplace';
import {
  buildCategoryPath,
  buildAreaPath,
  buildAreaCategoryPath,
  buildPropertyListingPath,
  listingMatchesSubcategory,
} from '@/config/urls';
import {
  getPublicProperties,
  getPublicProperty,
  filterPropertiesByArea,
  type Property,
} from '@/lib/properties';
import {
  resolveMinnaRoute,
  type CategoryHint,
} from '@/lib/minna-routing';
import { absoluteUrl, SITE_LOCATION } from '@/config/site';
import { formatNaira, titleCase } from '@/lib/format';
import Breadcrumbs from '@/components/marketplace/Breadcrumbs';
import PropertyListingView from '@/components/marketplace/PropertyListingView';
import ListingDetailView from '@/components/marketplace/ListingDetailView';
import FoodInterface from '@/components/food/FoodInterface';
import JsonLd from '@/components/seo/JsonLd';
import {
  breadcrumbSchema,
  itemListSchema,
  propertyListingSchema,
  type BreadcrumbItem,
} from '@/lib/structured-data';

export const revalidate = 300;

interface PageProps {
  params: Promise<{ slug: string[] }>;
}

/* ------------------------------------------------------------------ *
 * Helpers to select properties for a category/area combination.
 * ------------------------------------------------------------------ */

function propertiesForCategory(
  all: Property[],
  category: CategoryHint,
): Property[] {
  // Only the "properties" family maps to real inventory today.
  const isPropertyFamily =
    category.slug === 'properties' ||
    category.parentSlug === 'properties' ||
    ['houses-for-rent', 'houses-for-sale', 'land-for-sale', 'student-accommodation', 'shops'].includes(
      category.slug,
    );
  if (!isPropertyFamily) return [];

  // A specific subcategory alias filters by property type/intent.
  const parent = getCategoryBySlug('properties');
  const sub = parent?.subcategories.find(
    (s) => s.slug === (category.subcategorySlug || category.slug),
  );
  if (sub) {
    return all.filter((p) => listingMatchesSubcategory(p, sub));
  }
  return all;
}

/* ------------------------------------------------------------------ *
 * generateMetadata — per-route titles, descriptions, canonical (§4, §5, §11)
 * ------------------------------------------------------------------ */

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const route = resolveMinnaRoute(slug);

  if (route.kind === 'not-found') {
    return { title: 'Not found' };
  }

  if (route.kind === 'category') {
    const path = buildCategoryPath(route.category.slug);
    const title = `${route.category.name} in ${CITY.name} | Flamingo`;
    return {
      title,
      description: route.category.description,
      alternates: { canonical: path },
      openGraph: { title, description: route.category.description, url: absoluteUrl(path) },
    };
  }

  if (route.kind === 'area') {
    const path = buildAreaPath(route.area.slug);
    const title = `${route.area.name}, ${CITY.name} — Property & Listings | Flamingo`;
    const description = `Browse listings in ${route.area.name}, ${CITY.name}. ${route.area.description}`;
    return {
      title,
      description,
      alternates: { canonical: path },
      openGraph: { title, description, url: absoluteUrl(path) },
    };
  }

  if (route.kind === 'area-category') {
    const path = buildAreaCategoryPath(route.area.slug, route.category.slug);
    const title = `${route.category.name} in ${route.area.name}, ${CITY.name} | Flamingo`;
    const description = `Find ${route.category.name.toLowerCase()} in ${route.area.name}, ${CITY.name}. ${route.area.description}`;
    return {
      title,
      description,
      alternates: { canonical: path },
      openGraph: { title, description, url: absoluteUrl(path) },
    };
  }

  // listing
  const property = await getPublicProperty(route.id);
  if (!property) return { title: 'Listing not found' };
  const path = buildPropertyListingPath(property);
  const title = `${property.title} | Flamingo`;
  const description =
    property.description?.slice(0, 155) ||
    `${titleCase(property.propertyType)} in ${property.address || CITY.name} for ${formatNaira(property.price)}.`;
  const image = property.images?.[0];
  return {
    title,
    description,
    alternates: { canonical: path },
    openGraph: {
      type: 'website',
      title,
      description,
      url: absoluteUrl(path),
      images: image ? [{ url: image, alt: property.title }] : undefined,
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: image ? [image] : undefined,
    },
  };
}

/* ------------------------------------------------------------------ *
 * Page
 * ------------------------------------------------------------------ */

export default async function MinnaCatchAllPage({ params }: PageProps) {
  const { slug } = await params;
  const route = resolveMinnaRoute(slug);

  if (route.kind === 'not-found') notFound();

  /* ---- Category hub -------------------------------------------------- */
  if (route.kind === 'category') {
    const all = await getPublicProperties();
    const properties = propertiesForCategory(all, route.category);
    const crumbs: BreadcrumbItem[] = [
      { name: 'Home', path: '/' },
      { name: CITY.name, path: `/${CITY.slug}` },
      { name: route.category.name, path: buildCategoryPath(route.category.slug) },
    ];
    return (
      <HubShell
        title={`${route.category.name} in ${CITY.name}`}
        subtitle={route.category.description}
        crumbs={crumbs}
        properties={properties}
        listable={properties.length > 0 || isPropertyFamily(route.category)}
        category={route.category}
      />
    );
  }

  /* ---- Area hub ------------------------------------------------------ */
  if (route.kind === 'area') {
    const all = await getPublicProperties();
    const properties = filterPropertiesByArea(all, route.area);
    const crumbs: BreadcrumbItem[] = [
      { name: 'Home', path: '/' },
      { name: CITY.name, path: `/${CITY.slug}` },
      { name: route.area.name, path: buildAreaPath(route.area.slug) },
    ];
    return (
      <HubShell
        title={`${route.area.name}, ${CITY.name}`}
        subtitle={route.area.description}
        crumbs={crumbs}
        properties={properties}
        listable
        area={route.area.slug}
      />
    );
  }

  /* ---- Area + category hub ------------------------------------------ */
  if (route.kind === 'area-category') {
    const all = await getPublicProperties();
    const byArea = filterPropertiesByArea(all, route.area);
    const properties = propertiesForCategory(byArea, route.category);
    const crumbs: BreadcrumbItem[] = [
      { name: 'Home', path: '/' },
      { name: CITY.name, path: `/${CITY.slug}` },
      { name: route.area.name, path: buildAreaPath(route.area.slug) },
      {
        name: route.category.name,
        path: buildAreaCategoryPath(route.area.slug, route.category.slug),
      },
    ];
    return (
      <HubShell
        title={`${route.category.name} in ${route.area.name}, ${CITY.name}`}
        subtitle={`${route.category.name} available in ${route.area.name}. ${route.area.description}`}
        crumbs={crumbs}
        properties={properties}
        listable
      />
    );
  }

  /* ---- Individual listing (§5) -------------------------------------- */
  const property = await getPublicProperty(route.id);
  if (!property) notFound();

  const canonicalPath = buildPropertyListingPath(property);
  const category = getCategoryBySlug('properties');
  const sub = category?.subcategories.find((s) => s.slug === property.categorySlug);
  const crumbs: BreadcrumbItem[] = [
    { name: 'Home', path: '/' },
    { name: CITY.name, path: `/${CITY.slug}` },
    { name: route.area.name, path: buildAreaPath(route.area.slug) },
    {
      name: sub?.name ?? titleCase(property.categorySlug),
      path: buildAreaCategoryPath(route.area.slug, property.categorySlug),
    },
    { name: property.title, path: canonicalPath },
  ];

  return (
    <main className="min-h-screen bg-[#f8f5e6] dark:bg-gray-900">
      <JsonLd
        data={[breadcrumbSchema(crumbs), propertyListingSchema(property)]}
      />
      <section className="bg-white pt-24 pb-6 dark:bg-gray-800">
        <div className="container mx-auto max-w-7xl px-4">
          <Breadcrumbs items={crumbs} className="mb-4" />
          <h1 className="text-2xl font-bold text-gray-800 md:text-3xl dark:text-gray-100">
            {property.title}
          </h1>
        </div>
      </section>
      <div className="container mx-auto max-w-7xl px-4 py-8">
        <ListingDetailView property={property} />
      </div>
    </main>
  );
}

/* ------------------------------------------------------------------ *
 * Shared hub shell for category/area/area+category pages.
 * ------------------------------------------------------------------ */

function isPropertyFamily(category: CategoryHint): boolean {
  return (
    category.slug === 'properties' ||
    category.parentSlug === 'properties' ||
    ['houses-for-rent', 'houses-for-sale', 'land-for-sale', 'student-accommodation', 'shops'].includes(
      category.slug,
    )
  );
}

function HubShell({
  title,
  subtitle,
  crumbs,
  properties,
  listable,
  category,
  area,
}: {
  title: string;
  subtitle: string;
  crumbs: BreadcrumbItem[];
  properties: Property[];
  listable: boolean;
  category?: CategoryHint;
  area?: string;
}) {
  const isFoodCategory = category?.slug === 'food' || category?.parentSlug === 'food';
  const showComingSoon = category && !isPropertyFamily(category) && !isFoodCategory;

  return (
    <main className="min-h-screen bg-[#f8f5e6] dark:bg-gray-900">
      <JsonLd data={[breadcrumbSchema(crumbs), itemListSchema(properties)]} />

      {isFoodCategory ? (
        <FoodInterface />
      ) : (
        <>
          <section className="bg-gradient-to-r from-[#f89b64] to-[#f47a45] pt-28 pb-10 text-white dark:from-gray-800 dark:to-gray-700">
            <div className="container mx-auto max-w-7xl px-4">
              <Breadcrumbs items={crumbs} className="mb-4 text-white/80" />
              <h1 className="text-3xl font-bold md:text-4xl">{title}</h1>
              <p className="mt-2 max-w-2xl text-white/90">{subtitle}</p>
            </div>
          </section>

          <div className="container mx-auto max-w-7xl px-4 py-8">
            {showComingSoon ? (
              <ComingSoon title={title} />
            ) : (
              <PropertyListingView
                properties={properties}
                emptyTitle={`No listings in ${title} yet`}
                emptyMessage="We’re actively adding genuine Minna listings here. Check back soon, or list your property."
              />
            )}
          </div>
        </>
      )}
    </main>
  );
}

function ComingSoon({ title }: { title: string }) {
  return (
    <div className="rounded-2xl border border-dashed border-[#f0e6d0] bg-[#f5f3eb] p-10 text-center dark:border-gray-700 dark:bg-gray-800">
      <h2 className="text-xl font-bold text-gray-800 dark:text-gray-100">
        {title} is coming soon
      </h2>
      <p className="mx-auto mt-2 max-w-lg text-gray-600 dark:text-gray-400">
        This category is being rolled out across {CITY.name}, {STATE.name}.
        Property listings are live now — explore houses for rent, land and
        student accommodation while we expand.
      </p>
      <Link
        href={buildCategoryPath('properties')}
        className="mt-5 inline-block rounded-lg bg-[#f58c55] px-6 py-2.5 font-semibold text-white transition hover:bg-[#f47a45]"
      >
        Browse property in {CITY.name}
      </Link>
    </div>
  );
}
