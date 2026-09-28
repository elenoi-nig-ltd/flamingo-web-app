/**
 * Client-side filtering + sorting for property hub pages (spec §6).
 * Server components pass the full list down; this hook applies the
 * URL-independent, in-memory filters the user toggles.
 */
import { useMemo, useState } from 'react';
import type { Property } from '@/lib/properties';

export type SortKey = 'newest' | 'price-asc' | 'price-desc' | 'area-desc';
export type IntentFilter = 'all' | 'rent' | 'sale';

export interface PropertyFilterState {
  query: string;
  intent: IntentFilter;
  minPrice: number | '';
  maxPrice: number | '';
  bedrooms: number | '';
  propertyType: string;
  verifiedOnly: boolean;
  availableOnly: boolean;
  sort: SortKey;
}

export const DEFAULT_FILTERS: PropertyFilterState = {
  query: '',
  intent: 'all',
  minPrice: '',
  maxPrice: '',
  bedrooms: '',
  propertyType: '',
  verifiedOnly: false,
  availableOnly: false,
  sort: 'newest',
};

function intentOf(property: Property): 'rent' | 'sale' {
  // Land + explicit sale category => sale; everything else defaults to rent.
  if (
    property.categorySlug === 'houses-for-sale' ||
    property.categorySlug === 'land-for-sale' ||
    property.propertyType.toLowerCase() === 'land' ||
    (property.listingType || '').toLowerCase() === 'sale'
  ) {
    return 'sale';
  }
  return 'rent';
}

export function usePropertyFilters(
  properties: Property[],
  initial?: Partial<PropertyFilterState>,
) {
  const [filters, setFilters] = useState<PropertyFilterState>({
    ...DEFAULT_FILTERS,
    ...initial,
  });

  const filtered = useMemo(() => {
    let result = [...properties];

    if (filters.query.trim()) {
      const q = filters.query.trim().toLowerCase();
      result = result.filter(
        (p) =>
          p.title.toLowerCase().includes(q) ||
          p.address.toLowerCase().includes(q) ||
          p.description.toLowerCase().includes(q),
      );
    }
    if (filters.intent !== 'all') {
      result = result.filter((p) => intentOf(p) === filters.intent);
    }
    if (filters.minPrice !== '') {
      result = result.filter((p) => p.price >= Number(filters.minPrice));
    }
    if (filters.maxPrice !== '') {
      result = result.filter((p) => p.price <= Number(filters.maxPrice));
    }
    if (filters.bedrooms !== '') {
      const beds = Number(filters.bedrooms);
      result = result.filter((p) =>
        beds >= 4 ? p.bedrooms >= 4 : p.bedrooms === beds,
      );
    }
    if (filters.propertyType) {
      result = result.filter(
        (p) =>
          p.propertyType.toLowerCase() === filters.propertyType.toLowerCase(),
      );
    }
    if (filters.verifiedOnly) {
      result = result.filter((p) => p.verified);
    }
    if (filters.availableOnly) {
      result = result.filter((p) => !p.isBooked);
    }

    result.sort((a, b) => {
      switch (filters.sort) {
        case 'price-asc':
          return a.price - b.price;
        case 'price-desc':
          return b.price - a.price;
        case 'area-desc':
          return b.area - a.area;
        case 'newest':
        default: {
          const at = a.createdAt ? new Date(a.createdAt).getTime() : 0;
          const bt = b.createdAt ? new Date(b.createdAt).getTime() : 0;
          return bt - at;
        }
      }
    });

    return result;
  }, [properties, filters]);

  const resetFilters = () => setFilters(DEFAULT_FILTERS);

  return { filters, setFilters, filtered, resetFilters };
}
