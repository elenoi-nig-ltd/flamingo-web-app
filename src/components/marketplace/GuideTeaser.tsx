import Link from 'next/link';
import { GUIDE_ARTICLES } from '@/config/guides';

/**
 * "Minna Marketplace Guide" teaser (spec §9, §10).
 *
 * Server-rendered links into the information centre so the guide hub and its
 * articles are crawlable from the homepage. The "all guides" link lives in the
 * section heading alongside every other section's link, rather than below the
 * cards where it was the only one of its kind.
 */
export default function GuideTeaser() {
  const articles = GUIDE_ARTICLES.slice(0, 3);

  return (
    <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {articles.map((article) => (
        <li key={article.slug}>
          <Link
            href={`/minna-guide/${article.slug}`}
            className="flex h-full flex-col rounded-2xl border border-[#f0e6d0] bg-white p-5 transition-colors hover:border-[#f58c55] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#f58c55] focus-visible:ring-offset-2 dark:border-gray-700 dark:bg-gray-800 dark:hover:border-[#f7a16b] dark:focus-visible:ring-offset-gray-900"
          >
            <h3 className="text-base font-semibold leading-snug text-gray-900 dark:text-gray-100">
              {article.title}
            </h3>
            <p className="mt-2 flex-1 text-sm leading-relaxed text-gray-600 dark:text-gray-400">
              {article.description}
            </p>
            <span className="mt-4 text-xs font-medium text-gray-500 dark:text-gray-400">
              {article.readMinutes} min read
            </span>
          </Link>
        </li>
      ))}
    </ul>
  );
}
