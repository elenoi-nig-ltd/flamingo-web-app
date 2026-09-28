import React from 'react';
import Link from 'next/link';
import { ChevronRight } from 'lucide-react';
import type { BreadcrumbItem } from '@/lib/structured-data';

/**
 * Accessible, server-rendered breadcrumb trail (spec §11).
 * Pair with breadcrumbSchema() + <JsonLd/> for structured data.
 */
export default function Breadcrumbs({
  items,
  className = '',
}: {
  items: BreadcrumbItem[];
  className?: string;
}) {
  if (!items || items.length === 0) return null;
  return (
    <nav
      aria-label="Breadcrumb"
      className={`flex flex-wrap items-center gap-1 text-sm text-gray-600 dark:text-gray-400 ${className}`}
    >
      {items.map((item, index) => {
        const isLast = index === items.length - 1;
        return (
          <React.Fragment key={item.path}>
            {isLast ? (
              <span
                aria-current="page"
                className="truncate font-medium text-gray-800 dark:text-gray-200"
              >
                {item.name}
              </span>
            ) : (
              <Link
                href={item.path}
                className="hover:text-[#f47a45] hover:underline dark:hover:text-[#f7a16b]"
              >
                {item.name}
              </Link>
            )}
            {!isLast && (
              <ChevronRight className="h-3.5 w-3.5 shrink-0 text-gray-400" />
            )}
          </React.Fragment>
        );
      })}
    </nav>
  );
}
