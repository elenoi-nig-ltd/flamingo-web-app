'use client';

import React from 'react';
import { SlidersHorizontal, X, Search } from 'lucide-react';
import type { Property } from '@/lib/properties';
import PropertyCard, { PropertyGrid } from './PropertyCard';
import EmptyState from './EmptyState';
import {
  usePropertyFilters,
  type SortKey,
  type IntentFilter,
} from '@/hooks/usePropertyFilters';

const PROPERTY_TYPES = [
  'apartment',
  'house',
  'lodge',
  'condo',
  'townhouse',
  'land',
];

/**
 * Filterable, client-side property grid used by category/area hub pages
 * (spec §6). Receives server-fetched, server-rendered data as props — the
 * initial HTML already contains the listings for SEO; filtering is a
 * progressive enhancement on top.
 */
export default function PropertyListingView({
  properties,
  emptyTitle,
  emptyMessage,
  initialQuery = '',
}: {
  properties: Property[];
  emptyTitle?: string;
  emptyMessage?: string;
  initialQuery?: string;
}) {
  const { filters, setFilters, filtered, resetFilters } =
    usePropertyFilters(properties, { query: initialQuery });
  const [open, setOpen] = React.useState(false);

  const update = <K extends keyof typeof filters>(
    key: K,
    value: (typeof filters)[K],
  ) => setFilters((prev) => ({ ...prev, [key]: value }));

  const activeCount = [
    filters.intent !== 'all',
    filters.minPrice !== '',
    filters.maxPrice !== '',
    filters.bedrooms !== '',
    filters.propertyType !== '',
    filters.verifiedOnly,
    filters.availableOnly,
  ].filter(Boolean).length;
  return (
    <div className="flex flex-col gap-6 lg:flex-row">
      {/* Filter sidebar */}
      <aside
        className={`${
          open ? 'block' : 'hidden'
        } w-full shrink-0 lg:block lg:w-72`}
      >
        <div className="sticky top-24 space-y-5 rounded-2xl border border-[#f0e6d0] bg-[#f5f3eb] p-5 dark:border-gray-700 dark:bg-gray-800">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-gray-800 dark:text-gray-100">
              Filters
            </h3>
            {activeCount > 0 && (
              <button
                onClick={resetFilters}
                className="text-xs font-semibold text-[#f47a45] hover:underline"
              >
                Clear all
              </button>
            )}
          </div>

          {/* Rent / Sale */}
          <div>
            <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-300">
              Listing type
            </label>
            <div className="grid grid-cols-3 gap-1.5">
              {(['all', 'rent', 'sale'] as IntentFilter[]).map((intent) => (
                <button
                  key={intent}
                  onClick={() => update('intent', intent)}
                  className={`rounded-lg py-1.5 text-sm font-medium capitalize transition ${
                    filters.intent === intent
                      ? 'bg-[#f58c55] text-white'
                      : 'bg-white text-gray-700 dark:bg-gray-700 dark:text-gray-300'
                  }`}
                >
                  {intent}
                </button>
              ))}
            </div>
          </div>

          {/* Price range */}
          <div>
            <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-300">
              Price range (₦)
            </label>
            <div className="flex gap-2">
              <input
                type="number"
                min={0}
                value={filters.minPrice}
                onChange={(e) =>
                  update(
                    'minPrice',
                    e.target.value === '' ? '' : Number(e.target.value),
                  )
                }
                placeholder="Min"
                className="w-1/2 rounded-lg border border-gray-300 bg-white p-2 text-sm text-gray-900 focus:border-[#f7a16b] focus:ring-[#f7a16b] dark:border-gray-600 dark:bg-gray-700 dark:text-white"
              />
              <input
                type="number"
                min={0}
                value={filters.maxPrice}
                onChange={(e) =>
                  update(
                    'maxPrice',
                    e.target.value === '' ? '' : Number(e.target.value),
                  )
                }
                placeholder="Max"
                className="w-1/2 rounded-lg border border-gray-300 bg-white p-2 text-sm text-gray-900 focus:border-[#f7a16b] focus:ring-[#f7a16b] dark:border-gray-600 dark:bg-gray-700 dark:text-white"
              />
            </div>
          </div>

          {/* Bedrooms */}
          <div>
            <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-300">
              Bedrooms
            </label>
            <div className="flex flex-wrap gap-1.5">
              {['', 1, 2, 3, 4].map((b) => (
                <button
                  key={String(b)}
                  onClick={() => update('bedrooms', b as number | '')}
                  className={`rounded-lg px-3 py-1.5 text-sm font-medium transition ${
                    filters.bedrooms === b
                      ? 'bg-[#f58c55] text-white'
                      : 'bg-white text-gray-700 dark:bg-gray-700 dark:text-gray-300'
                  }`}
                >
                  {b === '' ? 'Any' : b === 4 ? '4+' : b}
                </button>
              ))}
            </div>
          </div>

          {/* Property type */}
          <div>
            <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-300">
              Property type
            </label>
            <select
              value={filters.propertyType}
              onChange={(e) => update('propertyType', e.target.value)}
              className="w-full rounded-lg border border-gray-300 bg-white p-2 text-sm capitalize text-gray-900 focus:border-[#f7a16b] focus:ring-[#f7a16b] dark:border-gray-600 dark:bg-gray-700 dark:text-white"
            >
              <option value="">All types</option>
              {PROPERTY_TYPES.map((t) => (
                <option key={t} value={t} className="capitalize">
                  {t}
                </option>
              ))}
            </select>
          </div>

          {/* Toggles */}
          <div className="space-y-2">
            <label className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300">
              <input
                type="checkbox"
                checked={filters.verifiedOnly}
                onChange={(e) => update('verifiedOnly', e.target.checked)}
                className="rounded text-[#f58c55] focus:ring-[#f58c55]"
              />
              Verified only
            </label>
            <label className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300">
              <input
                type="checkbox"
                checked={filters.availableOnly}
                onChange={(e) => update('availableOnly', e.target.checked)}
                className="rounded text-[#f58c55] focus:ring-[#f58c55]"
              />
              Available only
            </label>
          </div>
        </div>
      </aside>

      {/* Results */}
      <div className="flex-1">
        <div className="relative mb-4">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
          <input
            type="search"
            value={filters.query}
            onChange={(e) => update('query', e.target.value)}
            placeholder="Search this list — e.g. bungalow, Talba Road..."
            aria-label="Search listings"
            className="w-full rounded-lg border border-gray-300 bg-white py-2.5 pl-9 pr-3 text-sm text-gray-900 placeholder-gray-400 focus:border-[#f7a16b] focus:ring-[#f7a16b] dark:border-gray-600 dark:bg-gray-700 dark:text-white"
          />
        </div>
        <div className="mb-5 flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setOpen((v) => !v)}
              className="flex items-center gap-2 rounded-lg border border-[#f0e6d0] bg-white px-3 py-2 text-sm font-medium text-gray-700 lg:hidden dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300"
            >
              {open ? (
                <X className="h-4 w-4" />
              ) : (
                <SlidersHorizontal className="h-4 w-4" />
              )}
              Filters
              {activeCount > 0 && (
                <span className="rounded-full bg-[#f58c55] px-1.5 text-xs text-white">
                  {activeCount}
                </span>
              )}
            </button>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              {filtered.length} listing{filtered.length === 1 ? '' : 's'}
            </p>
          </div>

          <select
            value={filters.sort}
            onChange={(e) => update('sort', e.target.value as SortKey)}
            className="rounded-lg border border-gray-300 bg-white p-2 text-sm text-gray-900 focus:border-[#f7a16b] focus:ring-[#f7a16b] dark:border-gray-600 dark:bg-gray-700 dark:text-white"
          >
            <option value="newest">Newest</option>
            <option value="price-asc">Price: Low to High</option>
            <option value="price-desc">Price: High to Low</option>
            <option value="area-desc">Largest area</option>
          </select>
        </div>

        {filtered.length > 0 ? (
          <PropertyGrid>
            {filtered.map((property, index) => (
              <PropertyCard
                key={property.id}
                property={property}
                priority={index < 4}
              />
            ))}
          </PropertyGrid>
        ) : (
          <EmptyState
            title={emptyTitle ?? 'No matching listings'}
            message={
              emptyMessage ??
              'Try widening your filters, or check back soon — we add genuine Minna listings regularly.'
            }
          />
        )}
      </div>
    </div>
  );
}
