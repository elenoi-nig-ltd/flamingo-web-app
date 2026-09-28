import type { Metadata } from 'next';
import RealEstates from '@/components/real-estates/RealEstatesInterface';
import { absoluteUrl } from '@/config/site';

/**
 * NOTE: The rendered UI is intentionally the existing client component —
 * this server wrapper only adds SEO metadata. Listing behaviour (client fetch,
 * filters, booking entry) is unchanged to avoid regressions in production.
 */
export const metadata: Metadata = {
  title:
    'Property in Minna — Houses for Rent, Land & Houses for Sale | Flamingo',
  description:
    'Browse houses for rent, land for sale, shops and student accommodation in Minna, Niger State. Filter by price, bedrooms, property type and area on Flamingo.',
  alternates: { canonical: '/real-estates' },
  openGraph: {
    title: 'Property in Minna — Houses for Rent, Land & Houses for Sale',
    description:
      'Browse houses for rent, land for sale and student accommodation in Minna on Flamingo.',
    url: absoluteUrl('/real-estates'),
  },
};

const Page = () => {
  return <RealEstates />;
};

export default Page;
