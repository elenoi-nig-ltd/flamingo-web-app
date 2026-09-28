import type { Metadata } from 'next';
import PropertyDetails from '@/components/real-estates/PropertyDetails';
import { getPublicProperty } from '@/lib/properties';
import { buildPropertyListingPath } from '@/config/urls';
import { absoluteUrl } from '@/config/site';
import { formatNaira, titleCase } from '@/lib/format';

interface PageProps {
  params: Promise<{ id: string }>;
}

/**
 * Legacy listing URL (/real-estates/<id>).
 *
 * The permanent, SEO-canonical URL for a listing is the Minna path
 * (/minna/<area>/<category>/<slug>-<id>) — see spec §5. This route keeps
 * working for existing links but points its canonical at the permanent URL
 * to avoid duplicate content (spec §11).
 */
export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { id } = await params;
  const property = await getPublicProperty(id);
  if (!property) {
    return { title: 'Property not found', robots: { index: false, follow: false } };
  }

  const canonical = buildPropertyListingPath(property);
  const title = `${property.title} | Flamingo`;
  const description =
    property.description?.slice(0, 155) ||
    `${titleCase(property.propertyType)} in ${
      property.address || 'Minna'
    } for ${formatNaira(property.price)}.`;
  const image = property.images?.[0];

  return {
    title,
    description,
    alternates: { canonical },
    openGraph: {
      title,
      description,
      url: absoluteUrl(canonical),
      images: image ? [{ url: image, alt: property.title }] : undefined,
    },
  };
}

export default function Page() {
  return <PropertyDetails />;
}
