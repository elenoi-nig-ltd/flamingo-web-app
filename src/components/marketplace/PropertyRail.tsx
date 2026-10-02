import { PackageOpen } from "lucide-react";
import type { Property } from "@/lib/properties";
import PropertyCard from "./PropertyCard";
import SectionHeading from "./SectionHeading";

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
        <ul className="flex snap-x snap-proximity gap-4 overflow-x-auto pb-4 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          {properties.map((property) => (
            <li
              key={property.id}
              className="w-[240px] shrink-0 snap-start sm:w-[280px]"
            >
              <PropertyCard property={property} />
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
