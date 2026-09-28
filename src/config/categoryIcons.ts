import type { ComponentType } from 'react';
import {
  Building2,
  Car,
  Smartphone,
  Laptop,
  Sofa,
  Briefcase,
  Wrench,
  UtensilsCrossed,
  Wifi,
} from 'lucide-react';

/**
 * Real icon per marketplace category (spec §3).
 *
 * Kept separate from `config/marketplace.ts` so that purely server-side
 * consumers (sitemap, robots, routing) never pull the icon set into their
 * bundle just to read a slug list.
 *
 * The prop type mirrors `VerifiedBadge.tsx` rather than importing lucide's
 * `LucideIcon`, so we depend only on the icon components themselves.
 */
export type CategoryIcon = ComponentType<{ className?: string }>;

export const CATEGORY_ICONS: Record<string, CategoryIcon> = {
  properties: Building2,
  vehicles: Car,
  phones: Smartphone,
  electronics: Laptop,
  furniture: Sofa,
  jobs: Briefcase,
  services: Wrench,
  food: UtensilsCrossed,
  internet: Wifi,
};

export function getCategoryIcon(slug: string): CategoryIcon {
  return CATEGORY_ICONS[slug] ?? Building2;
}
