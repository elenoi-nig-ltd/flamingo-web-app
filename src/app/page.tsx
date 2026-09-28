import type { Metadata } from 'next';
import MarketplaceHome from '@/components/marketplace/MarketplaceHome';
import JsonLd from '@/components/seo/JsonLd';
import { getPublicProperties } from '@/lib/properties';
import { itemListSchema } from '@/lib/structured-data';
import { SITE_URL, SITE_NAME, SITE_DESCRIPTION, SITE_OG_IMAGE, SITE_TAGLINE } from '@/config/site';

/**
 * Homepage (spec §1, §2, §3, §9).
 *
 * Server component: the listings are fetched on the server so the property
 * rails, category links and area links are all present in the initial HTML
 * rather than appearing only after a client-side fetch (spec §8).
 *
 * Revalidated every 5 minutes so the page is served statically and stays fast
 * (spec §11). `getPublicProperties()` degrades to an empty list on any network
 * or parse failure, so a backend hiccup renders empty rails rather than
 * breaking the homepage.
 */
export const revalidate = 300;

export const metadata: Metadata = {
  title:
    'Flamingo - Online Marketplace in Minna | Buy, Sell, Rent & Find Services',
  description: SITE_DESCRIPTION,
  alternates: { canonical: '/' },
  openGraph: {
    type: 'website',
    locale: 'en_NG',
    url: SITE_URL,
    siteName: SITE_NAME,
    title: 'Flamingo - Online Marketplace in Minna',
    description: SITE_DESCRIPTION,
    images: [
      {
        url: SITE_OG_IMAGE,
        width: 1200,
        height: 630,
        alt: `Flamingo — ${SITE_TAGLINE}`,
      },
    ],
  },
};

export default async function Home() {
  const properties = await getPublicProperties();

  return (
    <>
      <JsonLd data={itemListSchema(properties)} />
      <MarketplaceHome properties={properties} />
    </>
  );
}
