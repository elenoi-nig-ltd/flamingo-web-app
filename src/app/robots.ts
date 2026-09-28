import type { MetadataRoute } from 'next';
import { SITE_URL } from '@/config/site';

/**
 * robots.txt (spec §11): allow crawling of public marketplace/category/listing
 * pages while excluding private dashboards and transactional/callback routes.
 */
export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: [
          '/admin/',
          '/landlord/',
          '/api/',
          '/cart',
          '/my-ads',
          '/payment/',
          '/bookings/confirmation',
          '/reset-password',
          '/forgot-password',
          '/voucher',
          '/*?*sort=',
        ],
      },
    ],
    sitemap: `${SITE_URL}/sitemap.xml`,
    host: SITE_URL,
  };
}
