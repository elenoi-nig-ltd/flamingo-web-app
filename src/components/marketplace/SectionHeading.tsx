import Link from 'next/link';
import { ArrowRight } from 'lucide-react';

/**
 * The shared section heading for every homepage section (spec §9).
 *
 * Extracted so the nine sections cannot drift apart: one type scale, one
 * spacing rhythm, and one place where a "see all" link lives. Previously the
 * rails carried a heading + subtitle + link while the other sections carried a
 * bare heading, and the guide's link sat underneath its cards instead of in the
 * header row, so the page read as several different designs stacked up.
 *
 * The link is rendered whenever `href` is given — including for empty rails.
 * The hub page is still the right destination, and keeping it constant avoids
 * the heading row changing height as inventory comes and goes.
 */
export default function SectionHeading({
  title,
  subtitle,
  href,
  hrefLabel = 'See all',
}: {
  title: string;
  subtitle?: string;
  href?: string;
  hrefLabel?: string;
}) {
  return (
    <div className="mb-4 flex items-end justify-between gap-4">
      <div className="min-w-0">
        <h2 className="text-xl font-bold tracking-tight text-gray-900 sm:text-2xl dark:text-gray-100">
          {title}
        </h2>
        {subtitle && (
          <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
            {subtitle}
          </p>
        )}
      </div>
      {href && (
        <Link
          href={href}
          className="inline-flex shrink-0 items-center gap-1.5 rounded-md text-sm font-semibold text-[#f47a45] transition-colors hover:text-[#f58c55] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#f58c55] focus-visible:ring-offset-2 dark:text-[#f7a16b] dark:focus-visible:ring-offset-gray-900"
        >
          {hrefLabel}
          <ArrowRight className="h-4 w-4" aria-hidden="true" />
        </Link>
      )}
    </div>
  );
}
