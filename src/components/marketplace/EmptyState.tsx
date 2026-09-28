import React from 'react';
import Link from 'next/link';
import { SearchX, PlusCircle } from 'lucide-react';

/**
 * Friendly empty state for marketplace hub pages when no listings match
 * (spec §8 — degrade gracefully instead of showing a broken/empty grid).
 */
export default function EmptyState({
  title = 'No listings yet',
  message = 'There are no listings here right now. Check back soon or be the first to post one.',
  ctaLabel = 'List your property',
  ctaHref = '/landlord/home',
}: {
  title?: string;
  message?: string;
  ctaLabel?: string;
  ctaHref?: string;
}) {
  return (
    <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-[#f0e6d0] bg-[#f5f3eb] px-6 py-16 text-center dark:border-gray-700 dark:bg-gray-800">
      <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-[#f89b64]/20 text-[#f47a45]">
        <SearchX className="h-8 w-8" />
      </div>
      <h3 className="mb-2 text-lg font-semibold text-gray-800 dark:text-gray-100">
        {title}
      </h3>
      <p className="mb-6 max-w-md text-sm text-gray-600 dark:text-gray-400">
        {message}
      </p>
      <Link
        href={ctaHref}
        className="inline-flex items-center gap-2 rounded-lg bg-[#f58c55] px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-[#f47a45]"
      >
        <PlusCircle className="h-4 w-4" />
        {ctaLabel}
      </Link>
    </div>
  );
}
