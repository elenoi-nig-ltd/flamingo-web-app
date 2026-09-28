import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Bed, Bath, Square, MapPin, Car, Droplets, Clock } from 'lucide-react';
import type { Property } from '@/lib/properties';
import { buildPropertyListingPath } from '@/config/urls';
import { isAnnualRentCategory } from '@/config/marketplace';
import { formatNaira, timeAgo, titleCase } from '@/lib/format';
import { VerifiedBadgeRow, deriveVerificationLevels } from './VerifiedBadge';

/**
 * Shared, server-renderable property listing card (spec §6).
 * Renders price, precise area, bedrooms, bathrooms, parking, water/borehole,
 * verification status and date posted, and links to the permanent listing URL.
 */
export default function PropertyCard({
  property,
  priority = false,
}: {
  property: Property;
  priority?: boolean;
}) {
  const href = buildPropertyListingPath(property);
  const image = property.images?.[0] || '/assets/images/placeholder.png';
  const isBooked = property.isBooked;
  const verificationLevels = deriveVerificationLevels({
    verified: property.verified,
  });

  const hasParking = property.amenities?.some((a) =>
    /park|garage|car/i.test(a),
  );
  const hasWater = property.amenities?.some((a) =>
    /water|borehole|well/i.test(a),
  );

  return (
    <div className="group relative overflow-hidden rounded-2xl border border-[#f0e6d0] bg-white shadow-sm transition-all duration-300 hover:-translate-y-0.5 hover:shadow-xl dark:border-gray-700 dark:bg-gray-800">
      <Link
        href={href}
        className="block focus:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-[#f58c55]"
        aria-label={property.title}
      >
        <div className="relative h-48 w-full bg-gray-100 dark:bg-gray-700">
          <Image
            src={image}
            alt={`${property.title} — ${titleCase(property.propertyType)} in ${
              property.address || 'Minna'
            }`}
            fill
            className={`object-cover transition-transform duration-500 group-hover:scale-105 ${
              isBooked ? 'opacity-80' : ''
            }`}
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 25vw"
            priority={priority}
          />
          {/* Price tag */}
          <div
            className={`absolute left-3 top-3 rounded-full px-3 py-1.5 text-sm font-bold shadow-lg ${
              isBooked
                ? 'bg-gray-700 text-gray-200'
                : 'bg-[#f47a45] text-white'
            }`}
          >
            {formatNaira(property.price)}
            {isAnnualRentCategory(property.categorySlug) && (
              <span className="ml-1 text-xs font-medium opacity-90">/yr</span>
            )}
          </div>
          {/* Status pill */}
          <div className="absolute right-3 top-3">
            <span
              className={`rounded-full border px-2 py-1 text-xs font-bold ${
                isBooked
                  ? 'border-red-200 bg-red-100 text-red-600 dark:border-red-800 dark:bg-red-900/40 dark:text-red-300'
                  : 'border-green-200 bg-green-100 text-green-700 dark:border-green-800 dark:bg-green-900/40 dark:text-green-300'
              }`}
            >
              {isBooked ? 'BOOKED' : 'AVAILABLE'}
            </span>
          </div>
        </div>
      </Link>

      <div className="p-4">
        <Link
          href={href}
          className="rounded-md focus:outline-none focus-visible:ring-2 focus-visible:ring-[#f58c55] focus-visible:ring-offset-2 dark:focus-visible:ring-offset-gray-800"
        >
          <h3 className="line-clamp-1 text-lg font-bold text-gray-900 hover:text-[#f47a45] dark:text-gray-100">
            {property.title}
          </h3>
        </Link>

        <div className="mt-1 flex items-center gap-1 text-sm text-gray-600 dark:text-gray-400">
          <MapPin className="h-3.5 w-3.5 shrink-0 text-[#f47a45]" />
          <span className="line-clamp-1">
            {property.address || 'Minna, Niger State'}
          </span>
        </div>

        {/* Feature row */}
        <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-gray-700 dark:text-gray-300">
          {property.bedrooms > 0 && (
            <span className="flex items-center gap-1">
              <Bed className="h-4 w-4 text-[#f47a45]" />
              {property.bedrooms}
            </span>
          )}
          {property.bathrooms > 0 && (
            <span className="flex items-center gap-1">
              <Bath className="h-4 w-4 text-[#f47a45]" />
              {property.bathrooms}
            </span>
          )}
          {property.area > 0 && (
            <span className="flex items-center gap-1">
              <Square className="h-4 w-4 text-[#f47a45]" />
              {property.area.toLocaleString()} sqft
            </span>
          )}
          {hasParking && (
            <span className="flex items-center gap-1" title="Parking available">
              <Car className="h-4 w-4 text-[#f47a45]" />
            </span>
          )}
          {hasWater && (
            <span
              className="flex items-center gap-1"
              title="Water / borehole available"
            >
              <Droplets className="h-4 w-4 text-[#f47a45]" />
            </span>
          )}
        </div>

        {/* Verification + date posted */}
        <div className="mt-3 flex items-center justify-between gap-2">
          <VerifiedBadgeRow levels={verificationLevels} />
          {property.createdAt && (
            <span className="flex items-center gap-1 whitespace-nowrap text-xs text-gray-500 dark:text-gray-400">
              <Clock className="h-3 w-3" />
              {timeAgo(property.createdAt)}
            </span>
          )}
        </div>

        <Link
          href={href}
          className={`mt-4 block w-full rounded-lg py-2 text-center text-sm font-semibold transition focus:outline-none focus-visible:ring-2 focus-visible:ring-[#f58c55] focus-visible:ring-offset-2 dark:focus-visible:ring-offset-gray-800 ${
            isBooked
              ? 'bg-gray-100 text-gray-500 dark:bg-gray-700 dark:text-gray-400'
              : 'bg-[#f58c55] text-white hover:bg-[#f47a45]'
          }`}
        >
          {isBooked ? 'View listing' : 'View details'}
        </Link>
      </div>
    </div>
  );
}

/** Lightweight grid wrapper for consistency across pages. */
export function PropertyGrid({ children }: { children: React.ReactNode }) {
  return (
    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      {children}
    </div>
  );
}
