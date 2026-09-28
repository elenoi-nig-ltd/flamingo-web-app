import Link from 'next/link';
import { MapPin } from 'lucide-react';
import { MINNA_AREAS } from '@/config/marketplace';
import { buildAreaPath } from '@/config/urls';

/**
 * "Explore Minna" — the area architecture as a chip row (spec §4, §9).
 *
 * Server-rendered so every area hub is crawlable from the homepage.
 */
export default function AreaGrid() {
  return (
    <ul className="flex flex-wrap gap-2.5">
      {MINNA_AREAS.map((area) => (
        <li key={area.slug}>
          <Link
            href={buildAreaPath(area.slug)}
            className="inline-flex items-center gap-1.5 rounded-full border border-[#f0e6d0] bg-white px-4 py-2 text-sm font-medium text-gray-700 transition-colors hover:border-[#f58c55] hover:text-[#f47a45] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#f58c55] focus-visible:ring-offset-2 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300 dark:hover:border-[#f7a16b] dark:hover:text-[#f7a16b]"
          >
            <MapPin className="h-3.5 w-3.5 text-[#f47a45] dark:text-[#f7a16b]" />
            {area.name}
          </Link>
        </li>
      ))}
      {/* The city hub lists every area and category, so it covers anywhere
          that is not one of the named areas above. */}
      <li>
        <Link
          href="/minna"
          className="inline-flex items-center gap-1.5 rounded-full border border-[#f58c55] bg-[#f58c55] px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-[#f47a45] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#f58c55] focus-visible:ring-offset-2"
        >
          Other areas
        </Link>
      </li>
    </ul>
  );
}
