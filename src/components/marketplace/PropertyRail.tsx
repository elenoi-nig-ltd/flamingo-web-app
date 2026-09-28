import { PackageOpen } from "lucide-react";
import type { Property } from "@/lib/properties";
import PropertyCard from "./PropertyCard";
import SectionHeading from "./SectionHeading";

/**
 * A marketplace product rail (spec §9).
 *
 * Storefront pattern: a section heading with a "see all" link and a
 * horizontally scrolling row of listing cards. Listings render through the
 * shared server-side `PropertyCard`, so every card links to that listing's
 * permanent `/minna/...` URL and is present in the server HTML.
 *
 * Vertical spacing is owned by the page container's `gap`, not by this section,
 * so every section shares one rhythm.
 */
export default function PropertyRail({
  title,
  subtitle,
  properties,
  href,
  hrefLabel = "See all",
  emptyMessage,
}: {
  title: string;
  subtitle?: string;
  properties: Property[];
  href?: string;
  hrefLabel?: string;
  emptyMessage: string;
}) {
  const isEmpty = properties.length === 0;

  return (
    <section>
      {/*
        The subtitle is dropped when the rail is empty: three lines describing
        listings that do not exist is a lot of nothing, and with thin inventory
        it was most of the page. The heading stays in the server HTML either way,
        which is what §9 needs.
      */}
      <SectionHeading
        title={title}
        subtitle={isEmpty ? undefined : subtitle}
        href={href}
        hrefLabel={hrefLabel}
      />

      {isEmpty ? (
        <p className="flex flex-wrap items-center gap-2 rounded-xl border border-dashed border-[#e6dcc4] bg-[#f5f3eb] px-4 py-3 text-sm text-gray-600 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-400">
          <PackageOpen
            className="h-4 w-4 shrink-0 text-[#c9bda3] dark:text-gray-500"
            aria-hidden="true"
          />
          {emptyMessage}
        </p>
      ) : (
        <ul className="-mx-4 flex snap-x snap-mandatory gap-4 overflow-x-auto px-4 pb-2">
          {properties.map((property) => (
            <li
              key={property.id}
              className="w-[260px] shrink-0 snap-start sm:w-[280px] mb-4"
            >
              <PropertyCard property={property} />
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
