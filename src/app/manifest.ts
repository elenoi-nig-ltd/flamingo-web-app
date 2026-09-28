import type { MetadataRoute } from 'next';
import { SITE_NAME, SITE_BRAND, SITE_DESCRIPTION } from '@/config/site';

/** Web app manifest (spec §11 performance/mobile-first). */
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: `${SITE_BRAND} — Online Marketplace in Minna`,
    short_name: SITE_NAME,
    description: SITE_DESCRIPTION,
    start_url: '/',
    display: 'standalone',
    background_color: '#f8f5e6',
    theme_color: '#f58c55',
    icons: [
      {
        src: '/assets/icons/logo.png',
        sizes: 'any',
        type: 'image/png',
      },
    ],
  };
}
