import Link from 'next/link';
import { MARKETPLACE_CATEGORIES } from '@/config/marketplace';
import { buildCategoryPath } from '@/config/urls';
import { getCategoryIcon } from '@/config/categoryIcons';

/**
 * "Browse Categories" — the nine marketplace categories (spec §3, §9).
 *
 * Server-rendered: these are plain links, so every category hub is reachable
 * from the homepage HTML without JavaScript.
 *
 * Nine across only from `xl`. At `lg` the container is ~960px, which left each
 * tile roughly 92px wide and wrapped "Home & Furniture" onto three lines; the
 * spec's single-row layout needs the extra width to hold.
 */
export default function CategoryGrid() {
  return (
    <ul className="grid grid-cols-3 gap-2.5 sm:grid-cols-5 xl:grid-cols-9">
      {MARKETPLACE_CATEGORIES.map((category) => {
        const Icon = getCategoryIcon(category.slug);
        return (
          <li key={category.slug}>
            <Link
              href={buildCategoryPath(category.slug)}
              className="flex h-full flex-col items-center gap-2.5 rounded-2xl border border-[#f0e6d0] bg-[#f5f3eb] px-2 py-4 text-center transition-colors hover:border-[#f58c55] hover:bg-white focus:outline-none focus-visible:ring-2 focus-visible:ring-[#f58c55] focus-visible:ring-offset-2 dark:border-gray-700 dark:bg-gray-800 dark:hover:border-[#f7a16b] dark:hover:bg-gray-700 dark:focus-visible:ring-offset-gray-900"
            >
              {/*
                A tinted disc rather than a white circle with a drop shadow.
                The shadow-on-everything look is the generic default, and at
                this tile size the shadow was the loudest thing on the page.
              */}
              <span className="flex h-10 w-10 items-center justify-center rounded-full bg-[#f58c55]/10 text-[#e2703a] dark:bg-[#f58c55]/20 dark:text-[#f7a16b]">
                <Icon className="h-5 w-5" />
              </span>
              <span className="text-xs font-semibold leading-tight text-gray-800 dark:text-gray-200">
                {category.name}
              </span>
            </Link>
          </li>
        );
      })}
    </ul>
  );
}
