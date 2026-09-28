'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  Phone,
  MessageCircle,
  CalendarCheck,
  Heart,
  Flag,
  Bed,
  Bath,
  Square,
  MapPin,
  Check,
  Share2,
} from 'lucide-react';
import type { Property } from '@/lib/properties';
import { formatNaira, formatDate, titleCase } from '@/lib/format';
import {
  VerifiedBadgeRow,
  VerificationLegend,
  deriveVerificationLevels,
} from './VerifiedBadge';
import { SITE_CONTACT } from '@/config/site';
import { isAnnualRentCategory } from '@/config/marketplace';

/**
 * Interactive listing detail view (spec §5 + §6).
 * Server component fetches + renders the content for SEO; this island adds the
 * gallery interaction and the detail-page actions:
 *   Call Advertiser | WhatsApp | Book Inspection | Save Property | Report Listing
 */
export default function ListingDetailView({
  property,
}: {
  property: Property;
}) {
  const router = useRouter();
  const [activeImage, setActiveImage] = useState(0);
  const [saved, setSaved] = useState(false);
  const [reportOpen, setReportOpen] = useState(false);
  const [copied, setCopied] = useState(false);

  const images =
    property.images.length > 0
      ? property.images
      : ['/assets/images/placeholder.png'];
  const verificationLevels = deriveVerificationLevels({
    verified: property.verified,
  });

  const phone = property.contactInfo?.phone || SITE_CONTACT.phone;
  const whatsappNumber = (property.contactInfo?.phone || SITE_CONTACT.phone)
    .replace(/[^0-9]/g, '')
    .replace(/^0/, '234');

  const whatsappText = encodeURIComponent(
    `Hi, I'm interested in "${property.title}" (${formatNaira(
      property.price,
    )}) listed on Flamingo. Is it still available?`,
  );

  const handleShare = async () => {
    const url = window.location.href;
    try {
      if (navigator.share) {
        await navigator.share({ title: property.title, url });
        return;
      }
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      /* user cancelled — ignore */
    }
  };

  return (
    <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
      {/* Gallery + description */}
      <div className="lg:col-span-2">
        <div className="relative mb-3 h-72 w-full overflow-hidden rounded-2xl bg-gray-100 md:h-96 dark:bg-gray-700">
          <Image
            src={images[activeImage]}
            alt={`${property.title} — image ${activeImage + 1}`}
            fill
            className="object-cover"
            priority
            sizes="(max-width: 1024px) 100vw, 66vw"
          />
          {property.isBooked && (
            <div className="absolute left-4 top-4 rounded-lg bg-red-600 px-3 py-1.5 text-sm font-bold text-white shadow-lg">
              Booked
            </div>
          )}
        </div>

        {images.length > 1 && (
          <div className="grid grid-cols-5 gap-2">
            {images.map((image, index) => (
              <button
                key={index}
                onClick={() => setActiveImage(index)}
                className={`relative h-16 overflow-hidden rounded-lg md:h-20 ${
                  activeImage === index
                    ? 'ring-2 ring-[#f47a45]'
                    : 'ring-1 ring-gray-200 dark:ring-gray-700'
                }`}
              >
                <Image
                  src={image}
                  alt={`${property.title} thumbnail ${index + 1}`}
                  fill
                  className="object-cover"
                  sizes="20vw"
                />
              </button>
            ))}
          </div>
        )}

        {/* Specifications */}
        <section className="mt-8">
          <h2 className="mb-4 text-xl font-bold text-gray-800 dark:text-gray-100">
            Specifications
          </h2>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
            <SpecItem label="Type" value={titleCase(property.propertyType)} />
            {property.bedrooms > 0 && (
              <SpecItem
                label="Bedrooms"
                value={String(property.bedrooms)}
                Icon={Bed}
              />
            )}
            {property.bathrooms > 0 && (
              <SpecItem
                label="Bathrooms"
                value={String(property.bathrooms)}
                Icon={Bath}
              />
            )}
            {property.area > 0 && (
              <SpecItem
                label="Area"
                value={`${property.area.toLocaleString()} sqft`}
                Icon={Square}
              />
            )}
            {property.propertyType.toLowerCase() === 'lodge' &&
              typeof property.roomsAvailable === 'number' && (
                <SpecItem
                  label="Rooms available"
                  value={`${property.roomsAvailable}/${property.totalRooms ?? 0}`}
                />
              )}
            {property.createdAt && (
              <SpecItem label="Date posted" value={formatDate(property.createdAt)} />
            )}
          </div>
        </section>

        {/* Description */}
        <section className="mt-8">
          <h2 className="mb-3 text-xl font-bold text-gray-800 dark:text-gray-100">
            Description
          </h2>
          <p className="whitespace-pre-line leading-relaxed text-gray-700 dark:text-gray-300">
            {property.description || 'No description provided for this listing.'}
          </p>
        </section>

        {/* Amenities */}
        {property.amenities.length > 0 && (
          <section className="mt-8">
            <h2 className="mb-3 text-xl font-bold text-gray-800 dark:text-gray-100">
              Amenities
            </h2>
            <div className="flex flex-wrap gap-2">
              {property.amenities.map((amenity) => (
                <span
                  key={amenity}
                  className="inline-flex items-center gap-1 rounded-full border border-green-200 bg-green-50 px-3 py-1 text-sm text-green-800 dark:border-green-800 dark:bg-green-900/30 dark:text-green-300"
                >
                  <Check className="h-3.5 w-3.5" />
                  {amenity}
                </span>
              ))}
            </div>
          </section>
        )}

        {/* Verification transparency (never implies transaction guarantee) */}
        <section className="mt-8">
          <h2 className="mb-3 text-xl font-bold text-gray-800 dark:text-gray-100">
            About Flamingo Verified
          </h2>
          <VerificationLegend />
        </section>
      </div>

      {/* Sticky action rail */}
      <div className="lg:col-span-1">
        <div className="sticky top-24 space-y-4 rounded-2xl border border-[#f0e6d0] bg-white p-6 shadow-sm dark:border-gray-700 dark:bg-gray-800">
          <div>
            <p className="text-3xl font-bold text-gray-900 dark:text-gray-100">
              {formatNaira(property.price)}
              {isAnnualRentCategory(property.categorySlug) && (
                <span className="text-base font-medium text-gray-500 dark:text-gray-400">
                  {' '}
                  /year
                </span>
              )}
            </p>
            <div className="mt-1 flex items-center gap-1 text-sm text-gray-600 dark:text-gray-400">
              <MapPin className="h-4 w-4 text-[#f47a45]" />
              {property.address || 'Minna, Niger State'}
            </div>
          </div>

          {verificationLevels.length > 0 && (
            <VerifiedBadgeRow levels={verificationLevels} />
          )}

          <div
            className={`rounded-lg border p-3 text-center text-sm font-semibold ${
              property.isBooked
                ? 'border-red-200 bg-red-50 text-red-700 dark:border-red-800 dark:bg-red-900/30 dark:text-red-300'
                : 'border-green-200 bg-green-50 text-green-700 dark:border-green-800 dark:bg-green-900/30 dark:text-green-300'
            }`}
          >
            {property.isBooked ? 'Currently booked' : 'Available now'}
          </div>

          {/* Actions */}
          <div className="space-y-2">
            <a
              href={`tel:${phone}`}
              className="flex w-full items-center justify-center gap-2 rounded-lg bg-[#f58c55] py-3 font-semibold text-white transition hover:bg-[#f47a45]"
            >
              <Phone className="h-4 w-4" />
              Call Advertiser
            </a>
            <a
              href={`https://wa.me/${whatsappNumber}?text=${whatsappText}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex w-full items-center justify-center gap-2 rounded-lg bg-green-600 py-3 font-semibold text-white transition hover:bg-green-700"
            >
              <MessageCircle className="h-4 w-4" />
              WhatsApp
            </a>
            <button
              disabled={property.isBooked}
              onClick={() => router.push(`/real-estates/${property.id}/book`)}
              className="flex w-full items-center justify-center gap-2 rounded-lg border-2 border-[#f58c55] py-2.5 font-semibold text-[#f47a45] transition hover:bg-[#f58c55]/10 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <CalendarCheck className="h-4 w-4" />
              {property.isBooked ? 'Not available' : 'Book Inspection'}
            </button>

            <div className="flex gap-2">
              <button
                onClick={() => setSaved((v) => !v)}
                className={`flex flex-1 items-center justify-center gap-2 rounded-lg border py-2.5 text-sm font-semibold transition ${
                  saved
                    ? 'border-red-300 bg-red-50 text-red-600 dark:border-red-700 dark:bg-red-900/30'
                    : 'border-gray-300 text-gray-700 hover:bg-gray-50 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700'
                }`}
              >
                <Heart
                  className={`h-4 w-4 ${saved ? 'fill-red-500 text-red-500' : ''}`}
                />
                {saved ? 'Saved' : 'Save'}
              </button>
              <button
                onClick={handleShare}
                className="flex flex-1 items-center justify-center gap-2 rounded-lg border border-gray-300 py-2.5 text-sm font-semibold text-gray-700 transition hover:bg-gray-50 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700"
              >
                <Share2 className="h-4 w-4" />
                {copied ? 'Copied!' : 'Share'}
              </button>
            </div>

            <button
              onClick={() => setReportOpen(true)}
              className="flex w-full items-center justify-center gap-2 py-2 text-sm font-medium text-gray-500 transition hover:text-red-500"
            >
              <Flag className="h-4 w-4" />
              Report Listing
            </button>
          </div>

          {property.contactInfo?.name && (
            <div className="border-t border-gray-200 pt-4 text-sm dark:border-gray-700">
              <p className="font-semibold text-gray-700 dark:text-gray-200">
                {property.contactInfo.name}
              </p>
              <p className="text-gray-500 dark:text-gray-400">Advertiser</p>
            </div>
          )}
        </div>

        <p className="px-2 text-center text-xs text-gray-500 dark:text-gray-400">
          Never pay before physically inspecting a property. Flamingo verifies
          listing details but does not guarantee any transaction.
        </p>
      </div>

      {/* Report modal */}
      {reportOpen && (
        <ReportModal
          title={property.title}
          onClose={() => setReportOpen(false)}
        />
      )}
    </div>
  );
}

function SpecItem({
  label,
  value,
  Icon,
}: {
  label: string;
  value: string;
  Icon?: React.ComponentType<{ className?: string }>;
}) {
  return (
    <div className="rounded-xl border border-[#f0e6d0] bg-[#f5f3eb] p-3 dark:border-gray-700 dark:bg-gray-800">
      <p className="flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400">
        {Icon && <Icon className="h-3.5 w-3.5 text-[#f47a45]" />}
        {label}
      </p>
      <p className="mt-0.5 font-semibold text-gray-800 dark:text-gray-100">
        {value}
      </p>
    </div>
  );
}

function ReportModal({
  title,
  onClose,
}: {
  title: string;
  onClose: () => void;
}) {
  const [submitted, setSubmitted] = useState(false);
  const reasons = [
    'This listing looks fake or is a scam',
    'The property is no longer available',
    'Wrong price or misleading information',
    'Duplicate listing',
    'Other',
  ];

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
      onClick={onClose}
    >
      <div
        className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl dark:bg-gray-800"
        onClick={(e) => e.stopPropagation()}
      >
        {submitted ? (
          <div className="text-center">
            <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-green-100 text-green-600 dark:bg-green-900/30">
              <Check className="h-6 w-6" />
            </div>
            <h3 className="text-lg font-bold text-gray-800 dark:text-gray-100">
              Thanks for reporting
            </h3>
            <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
              Our team will review this listing.
            </p>
            <button
              onClick={onClose}
              className="mt-4 rounded-lg bg-[#f58c55] px-5 py-2 font-semibold text-white hover:bg-[#f47a45]"
            >
              Close
            </button>
          </div>
        ) : (
          <>
            <h3 className="mb-1 text-lg font-bold text-gray-800 dark:text-gray-100">
              Report listing
            </h3>
            <p className="mb-4 line-clamp-1 text-sm text-gray-500 dark:text-gray-400">
              {title}
            </p>
            <div className="space-y-2">
              {reasons.map((reason) => (
                <button
                  key={reason}
                  onClick={() => setSubmitted(true)}
                  className="w-full rounded-lg border border-gray-200 px-4 py-2.5 text-left text-sm text-gray-700 transition hover:border-[#f47a45] hover:bg-[#f58c55]/5 dark:border-gray-700 dark:text-gray-300"
                >
                  {reason}
                </button>
              ))}
            </div>
            <button
              onClick={onClose}
              className="mt-4 w-full py-2 text-sm font-medium text-gray-500 hover:text-gray-700"
            >
              Cancel
            </button>
          </>
        )}
      </div>
    </div>
  );
}
