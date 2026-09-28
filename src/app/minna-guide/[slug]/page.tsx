import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { Clock, ArrowLeft } from 'lucide-react';
import { GUIDE_ARTICLES, getGuideBySlug } from '@/config/guides';
import { CITY } from '@/config/marketplace';
import { absoluteUrl, SITE_NAME, SITE_URL } from '@/config/site';
import { formatDate } from '@/lib/format';
import Breadcrumbs from '@/components/marketplace/Breadcrumbs';
import JsonLd from '@/components/seo/JsonLd';
import { breadcrumbSchema } from '@/lib/structured-data';

interface PageProps {
  params: Promise<{ slug: string }>;
}

export function generateStaticParams() {
  return GUIDE_ARTICLES.map((article) => ({ slug: article.slug }));
}

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const article = getGuideBySlug(slug);
  if (!article) return { title: 'Guide not found', robots: { index: false } };
  return {
    title: article.seoTitle || article.title,
    description: article.description,
    alternates: { canonical: `/minna-guide/${article.slug}` },
    openGraph: {
      type: 'article',
      title: article.seoTitle || article.title,
      description: article.description,
      url: absoluteUrl(`/minna-guide/${article.slug}`),
      publishedTime: article.updated,
      modifiedTime: article.updated,
      tags: article.tags,
    },
  };
}

export default async function GuideArticlePage({ params }: PageProps) {
  const { slug } = await params;
  const article = getGuideBySlug(slug);
  if (!article) notFound();

  const crumbs = [
    { name: 'Home', path: '/' },
    { name: 'Minna Guide', path: '/minna-guide' },
    { name: article.title, path: `/minna-guide/${article.slug}` },
  ];

  const articleSchema = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: article.title,
    description: article.description,
    datePublished: article.updated,
    dateModified: article.updated,
    author: { '@type': 'Organization', name: SITE_NAME, url: SITE_URL },
    publisher: { '@type': 'Organization', name: SITE_NAME, url: SITE_URL },
    mainEntityOfPage: absoluteUrl(`/minna-guide/${article.slug}`),
    keywords: article.tags.join(', '),
  };

  // Related guides (excluding the current one).
  const related = GUIDE_ARTICLES.filter((a) => a.slug !== article.slug).slice(
    0,
    3,
  );

  return (
    <main className="min-h-screen bg-[#f8f5e6] dark:bg-gray-900">
      <JsonLd data={[breadcrumbSchema(crumbs), articleSchema]} />

      <article className="pt-24 pb-12">
        <div className="container mx-auto max-w-3xl px-4">
          <Breadcrumbs items={crumbs} className="mb-4" />
          <Link
            href="/minna-guide"
            className="mb-4 inline-flex items-center gap-1 text-sm font-medium text-[#f47a45] hover:underline"
          >
            <ArrowLeft className="h-4 w-4" /> All guides
          </Link>

          <h1 className="text-3xl font-bold leading-tight text-gray-900 md:text-4xl dark:text-gray-100">
            {article.title}
          </h1>

          <div className="mt-3 flex flex-wrap items-center gap-4 text-sm text-gray-500 dark:text-gray-400">
            <span>Updated {formatDate(article.updated)}</span>
            <span className="flex items-center gap-1">
              <Clock className="h-4 w-4" />
              {article.readMinutes} min read
            </span>
          </div>

          <p className="mt-6 border-l-4 border-[#f58c55] bg-white py-3 pl-4 text-lg text-gray-700 dark:bg-gray-800 dark:text-gray-300">
            {article.description}
          </p>

          <div className="prose prose-lg mt-8 max-w-none dark:prose-invert">
            {article.body.map((block, index) => {
              if (block.type === 'h2') {
                return (
                  <h2
                    key={index}
                    className="mt-8 mb-3 text-2xl font-bold text-gray-900 dark:text-gray-100"
                  >
                    {block.text}
                  </h2>
                );
              }
              if (block.type === 'ul') {
                return (
                  <ul key={index} className="my-4 space-y-2 pl-1">
                    {block.items?.map((item, i) => (
                      <li
                        key={i}
                        className="flex items-start gap-2 text-gray-700 dark:text-gray-300"
                      >
                        <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-[#f47a45]" />
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                );
              }
              return (
                <p
                  key={index}
                  className="my-4 leading-relaxed text-gray-700 dark:text-gray-300"
                >
                  {block.text}
                </p>
              );
            })}
          </div>

          {/* CTA */}
          <div className="mt-10 rounded-2xl bg-gradient-to-r from-[#f89b64] to-[#f47a45] p-6 text-center text-white">
            <h2 className="text-xl font-bold">
              Browse {CITY.name} listings on Flamingo
            </h2>
            <p className="mt-1 text-white/90">
              Find houses for rent, land and services around Minna.
            </p>
            <Link
              href={`/${CITY.slug}`}
              className="mt-4 inline-block rounded-lg bg-white px-6 py-2.5 font-semibold text-[#f47a45] transition hover:bg-white/90"
            >
              Explore {CITY.name}
            </Link>
          </div>

          {/* Related */}
          {related.length > 0 && (
            <section className="mt-12">
              <h2 className="mb-4 text-xl font-bold text-gray-900 dark:text-gray-100">
                Related guides
              </h2>
              <div className="grid gap-4 sm:grid-cols-3">
                {related.map((rel) => (
                  <Link
                    key={rel.slug}
                    href={`/minna-guide/${rel.slug}`}
                    className="rounded-xl border border-[#f0e6d0] bg-white p-4 text-sm font-medium text-gray-700 transition hover:border-[#f47a45] hover:text-[#f47a45] dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300"
                  >
                    {rel.title}
                  </Link>
                ))}
              </div>
            </section>
          )}
        </div>
      </article>
    </main>
  );
}
