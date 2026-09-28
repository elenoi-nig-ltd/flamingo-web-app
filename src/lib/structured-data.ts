/**
 * Schema.org structured-data builders (spec §11).
 *
 * We emit JSON-LD for Organization, WebSite, BreadcrumbList and per-listing
 * Product/Residence + Offer. Keeping the builders here (pure functions) means
 * server components can compute the object and render it via <JsonLd/>.
 */

import {
  SITE_URL,
  SITE_NAME,
  SITE_BRAND,
  SITE_DESCRIPTION,
  SITE_LEGAL_NAME,
  SITE_LOCATION,
  SITE_CONTACT,
  SITE_SOCIALS,
  SITE_OG_IMAGE,
  absoluteUrl,
} from '@/config/site';
import type { Property } from '@/lib/properties';
import { buildPropertyListingPath } from '@/config/urls';

export function organizationSchema() {
  return {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: SITE_BRAND,
    legalName: SITE_LEGAL_NAME,
    url: SITE_URL,
    logo: absoluteUrl('/assets/icons/logo.png'),
    image: absoluteUrl(SITE_OG_IMAGE),
    description: SITE_DESCRIPTION,
    email: SITE_CONTACT.email,
    telephone: SITE_CONTACT.phone,
    address: {
      '@type': 'PostalAddress',
      streetAddress: SITE_CONTACT.addressLine,
      addressLocality: SITE_LOCATION.city,
      addressRegion: SITE_LOCATION.state,
      addressCountry: SITE_LOCATION.countryCode,
    },
    areaServed: {
      '@type': 'City',
      name: SITE_LOCATION.city,
    },
    sameAs: [SITE_SOCIALS.instagram, SITE_SOCIALS.facebook, SITE_SOCIALS.tiktok],
  };
}

export function websiteSchema() {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: SITE_NAME,
    url: SITE_URL,
    description: SITE_DESCRIPTION,
    potentialAction: {
      '@type': 'SearchAction',
      target: {
        '@type': 'EntryPoint',
        urlTemplate: `${SITE_URL}/search?q={search_term_string}`,
      },
      'query-input': 'required name=search_term_string',
    },
  };
}

export interface BreadcrumbItem {
  name: string;
  path: string;
}

export function breadcrumbSchema(items: BreadcrumbItem[]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      item: absoluteUrl(item.path),
    })),
  };
}

/**
 * Product + Offer + place for a property listing.
 * We use Product (broadly understood by search engines) with an Offer, and
 * embed the area via `areaServed`. Avoids implying any transaction guarantee.
 */
export function propertyListingSchema(property: Property) {
  const url = absoluteUrl(buildPropertyListingPath(property));
  const images = property.images.map((img) =>
    img.startsWith('http') ? img : absoluteUrl(img),
  );

  return {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: property.title,
    description: property.description || property.title,
    image: images.length > 0 ? images : [absoluteUrl(SITE_OG_IMAGE)],
    url,
    category: property.categorySlug,
    sku: property.id,
    offers: {
      '@type': 'Offer',
      price: property.price,
      priceCurrency: 'NGN',
      availability: property.isBooked
        ? 'https://schema.org/OutOfStock'
        : 'https://schema.org/InStock',
      url,
      areaServed: {
        '@type': 'City',
        name: SITE_LOCATION.city,
      },
    },
    additionalProperty: [
      property.bedrooms
        ? { '@type': 'PropertyValue', name: 'Bedrooms', value: property.bedrooms }
        : null,
      property.bathrooms
        ? {
            '@type': 'PropertyValue',
            name: 'Bathrooms',
            value: property.bathrooms,
          }
        : null,
      property.area
        ? { '@type': 'PropertyValue', name: 'Area', value: `${property.area} sqft` }
        : null,
    ].filter(Boolean),
  };
}

/** ItemList of listings for a category/area hub page. */
export function itemListSchema(properties: Property[]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    numberOfItems: properties.length,
    itemListElement: properties.slice(0, 30).map((property, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      url: absoluteUrl(buildPropertyListingPath(property)),
      name: property.title,
    })),
  };
}
