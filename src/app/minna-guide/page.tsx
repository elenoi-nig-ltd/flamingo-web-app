import type { Metadata } from 'next';
import Link from 'next/link';
import { BookOpen, ArrowRight } from 'lucide-react';
import { GUIDE_ARTICLES } from '@/config/guides';
import { CITY } from '@/config/marketplace';
import { absoluteUrl, SITE_URL } from '@/config/site';
import Breadcrumbs from '@/components/marketplace/Breadcrumbs';
import JsonLd from '@/components/seo/JsonLd';
import { breadcrumbSchema } from '@/lib/structured-data';

export const metadata: Metadata = {
  title: 'Minna Marketplace Guide — Renting, Land & Living in Minna',
  description:
    'Practical, locally-grounded guides to living and trading in Minna: houses for rent in Gidan Kwano, rental costs, best areas, student accommodation around FUT Minna, land buying and buying safely online.',
  alternates: { canonical: '/minna-guide' },
  openGraph: {
    title: 'Minna Marketplace Guide | Flamingo',
    description:
      'Locally-grounded guides to renting, land and living in Minna, Niger State.',
    url: absoluteUrl('/minna-guide'),
  },
};

export default function MinnaGuidePage() {
  const crumbs = [
    { name: 'Home', path: '/' },
    { name: 'Minna Guide', path: '/minna-guide' },
  ];

  const itemList = {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    numberOfItems: GUIDE_ARTICLES.length,
    itemListElement: GUIDE_ARTICLES.map((article, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      url: `${SITE_URL}/minna-guide/${article.slug}`,
      name: article.title,
    })),
  };

  return (
    <main className="min-h-screen bg-[#f8f5e6] dark:bg-gray-900">
      <JsonLd data={[breadcrumbSchema(crumbs), itemList]} />

      <section className="bg-gradient-to-r from-[#f89b64] to-[#f47a45] pt-28 pb-12 text-white dark:from-gray-800 dark:to-gray-700">
        <div className="container mx-auto max-w-7xl px-4">
          <Breadcrumbs items={crumbs} className="mb-4 text-white/80" />
          <h1 className="flex items-center gap-3 text-3xl font-bold md:text-4xl">
            <BookOpen className="h-8 w-8" />
            Minna Marketplace Guide
          </h1>
          <p className="mt-2 max-w-3xl text-white/90">
            Practical, locally-grounded guides to renting, buying land, finding
            student accommodation and trading safely in {CITY.name}, Niger
            State — written from real marketplace observations, not generic
            filler.
          </p>
        </div>
      </section>

      <div className="container mx-auto max-w-5xl px-4 py-10">
        <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
          {GUIDE_ARTICLES.map((article, index) => (
            <article
              key={article.slug}
              className="group flex flex-col justify-between rounded-2xl border border-[#f0e6d0] bg-white p-6 shadow-sm transition hover:-translate-y-0.5 hover:shadow-lg dark:border-gray-700 dark:bg-gray-800"
            >
              <div>
                <div className="mb-2 flex items-center gap-2 text-xs font-semibold text-[#f47a45]">
                  <span className="flex h-6 w-6 items-center justify-center rounded-full bg-[#f89b64]/20">
                    {index + 1}
                  </span>
                  <span>{article.readMinutes} min read</span>
                </div>
                <h2 className="text-lg font-bold text-gray-800 group-hover:text-[#f47a45] dark:text-gray-100">
                  <Link href={`/minna-guide/${article.slug}`}>
                    {article.title}
                  </Link>
                </h2>
                <p className="mt-2 line-clamp-3 text-sm text-gray-600 dark:text-gray-400">
                  {article.description}
                </p>
              </div>
              <Link
                href={`/minna-guide/${article.slug}`}
                className="mt-4 inline-flex items-center gap-1 text-sm font-semibold text-[#f47a45] hover:underline"
              >
                Read guide
                <ArrowRight className="h-4 w-4 transition group-hover:translate-x-1" />
              </Link>
            </article>
          ))}
        </div>
      </div>
    </main>
  );
}
