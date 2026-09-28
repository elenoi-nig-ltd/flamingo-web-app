import React from 'react';
import { ShieldCheck, Phone, BadgeCheck, Home } from 'lucide-react';

/**
 * Flamingo Verified badge definitions (spec §7).
 *
 * IMPORTANT: these badges must never imply a transaction guarantee. Each one
 * has an explicit, honest definition shown in the tooltip / legend:
 *
 *  - Phone Verified   : phone number confirmed.
 *  - Seller Verified  : identity/business information checked.
 *  - Property Verified: property existence + basic listing information
 *                       physically confirmed by the relevant Flamingo/Flourish
 *                       process.
 */

export type VerificationLevel = 'phone' | 'seller' | 'property';

interface VerificationMeta {
  label: string;
  short: string;
  description: string;
  Icon: React.ComponentType<{ className?: string }>;
  className: string;
}

export const VERIFICATION_LEVELS: Record<VerificationLevel, VerificationMeta> = {
  phone: {
    label: 'Phone Verified',
    short: 'Phone',
    description: 'Phone number confirmed.',
    Icon: Phone,
    className:
      'bg-sky-50 text-sky-700 border-sky-200 dark:bg-sky-900/30 dark:text-sky-300 dark:border-sky-800',
  },
  seller: {
    label: 'Seller Verified',
    short: 'Seller',
    description: 'Identity or business information checked.',
    Icon: BadgeCheck,
    className:
      'bg-indigo-50 text-indigo-700 border-indigo-200 dark:bg-indigo-900/30 dark:text-indigo-300 dark:border-indigo-800',
  },
  property: {
    label: 'Property Verified',
    short: 'Property',
    description:
      'Property existence and basic listing information physically confirmed by the relevant Flamingo/Flourish process.',
    Icon: Home,
    className:
      'bg-green-50 text-green-700 border-green-200 dark:bg-green-900/30 dark:text-green-300 dark:border-green-800',
  },
};

/**
 * Derive the set of verification levels a listing qualifies for.
 * The backend currently exposes a single boolean `verified`, which maps to
 * Property Verified for properties. When the backend later adds explicit
 * levels, prefer them.
 */
export function deriveVerificationLevels(input: {
  verified?: boolean;
  levels?: VerificationLevel[];
}): VerificationLevel[] {
  if (Array.isArray(input.levels) && input.levels.length > 0) {
    return input.levels;
  }
  return input.verified ? ['property'] : [];
}

export default function VerifiedBadge({
  level,
  showLabel = true,
  title,
}: {
  level: VerificationLevel;
  showLabel?: boolean;
  title?: string;
}) {
  const meta = VERIFICATION_LEVELS[level];
  const { Icon } = meta;
  return (
    <span
      title={title ?? meta.description}
      className={`inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-xs font-semibold ${meta.className}`}
    >
      <Icon className="h-3.5 w-3.5" />
      {showLabel ? meta.label : meta.short}
    </span>
  );
}

/** A small row of badges for a listing card. */
export function VerifiedBadgeRow({
  levels,
  max = 2,
}: {
  levels: VerificationLevel[];
  max?: number;
}) {
  if (levels.length === 0) return null;
  const shown = levels.slice(0, max);
  const remaining = levels.length - shown.length;
  return (
    <div className="flex flex-wrap items-center gap-1.5">
      {shown.map((level) => (
        <VerifiedBadge key={level} level={level} />
      ))}
      {remaining > 0 && (
        <span className="inline-flex items-center gap-1 rounded-full border border-gray-200 bg-gray-50 px-2 py-0.5 text-xs font-semibold text-gray-600 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300">
          <ShieldCheck className="h-3.5 w-3.5" />+{remaining}
        </span>
      )}
    </div>
  );
}

/** Legend explaining each badge (use on hub/listing pages for transparency). */
export function VerificationLegend() {
  return (
    <div className="grid gap-3 sm:grid-cols-3">
      {(
        Object.keys(VERIFICATION_LEVELS) as VerificationLevel[]
      ).map((level) => {
        const meta = VERIFICATION_LEVELS[level];
        const { Icon } = meta;
        return (
          <div
            key={level}
            className="flex items-start gap-3 rounded-xl border border-[#f0e6d0] bg-[#f5f3eb] p-4 dark:border-gray-700 dark:bg-gray-800"
          >
            <span
              className={`mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full border ${meta.className}`}
            >
              <Icon className="h-4 w-4" />
            </span>
            <div>
              <p className="text-sm font-semibold text-gray-800 dark:text-gray-100">
                {meta.label}
              </p>
              <p className="text-xs text-gray-600 dark:text-gray-400">
                {meta.description}
              </p>
            </div>
          </div>
        );
      })}
    </div>
  );
}
