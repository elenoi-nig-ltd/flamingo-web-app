'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { ShoppingBag, ArrowRight, Check } from 'lucide-react';
import { useHomeItems } from '@/hooks/useHomeItems';
import { useCart } from '@/contexts/CartContext';
import SectionHeading from './SectionHeading';
import { formatNaira } from '@/lib/format';

/**
 * Horizontally scrollable home-items rail on the marketplace homepage.
 * Returns null (invisibly) when the shop is empty so the food rail floats up.
 */
export default function FeaturedProductsRail() {
  const { products, loading } = useHomeItems();
  const { addToCart } = useCart();
  const [addedIds, setAddedIds] = useState<Set<string>>(new Set());

  const featured = products.slice(0, 12);

  const handleAddToCart = (product: (typeof featured)[number]) => {
    addToCart({
      id: product._id,
      name: product.name,
      image: product.images?.[0] || '',
      price: product.price,
      category: product.category?.name,
    });
    setAddedIds((prev) => new Set(prev).add(product._id));
    setTimeout(() => {
      setAddedIds((prev) => {
        const next = new Set(prev);
        next.delete(product._id);
        return next;
      });
    }, 1500);
  };

  /* ── Loading skeleton ─────────────────────────────────────────── */
  if (loading) {
    return (
      <section>
        <SectionHeading
          title="Trending Home Essentials & Appliances"
          subtitle="Popular products available for instant order in Minna."
          href="/home-items"
          hrefLabel="View shop"
        />
        <div className="-mx-4 flex gap-4 overflow-x-auto px-4 pb-4">
          {[...Array(5)].map((_, i) => (
            <div
              key={i}
              className="w-[220px] shrink-0 animate-pulse rounded-2xl border border-gray-100 bg-[#f5f3eb] p-4 shadow-sm dark:border-gray-700 dark:bg-gray-700/50"
            >
              <div className="h-40 w-full rounded-xl bg-gray-200 dark:bg-gray-600" />
              <div className="mt-4 h-3 w-1/3 rounded bg-gray-200 dark:bg-gray-600" />
              <div className="mt-2 h-4 w-3/4 rounded bg-gray-200 dark:bg-gray-600" />
              <div className="mt-1.5 h-3 w-full rounded bg-gray-200 dark:bg-gray-600" />
              <div className="mt-4 flex items-center justify-between">
                <div className="h-5 w-16 rounded bg-gray-200 dark:bg-gray-600" />
                <div className="h-8 w-20 rounded-lg bg-gray-200 dark:bg-gray-600" />
              </div>
            </div>
          ))}
        </div>
      </section>
    );
  }

  /* ── No products → render nothing so food floats up ──────────── */
  if (featured.length === 0) return null;

  return (
    <section>
      <SectionHeading
        title="Trending Home Essentials & Appliances"
        subtitle="Popular products available for instant order in Minna."
        href="/home-items"
        hrefLabel="View shop"
      />

      <ul className="flex snap-x snap-proximity gap-4 overflow-x-auto pb-4 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        {featured.map((product) => {
          const image = product.images?.[0] || '/assets/images/placeholder-home-item.jpg';
          const added = addedIds.has(product._id);

          return (
            <li key={product._id} className="w-[180px] shrink-0 snap-start sm:w-[220px]">
              {/* Light mode: warm cream tint — dark mode: dark card */}
              <div className="group flex h-full flex-col justify-between overflow-hidden rounded-2xl border border-[#ede8da] bg-[#faf7f0] shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-xl dark:border-gray-700 dark:bg-gray-800">
                {/* Image */}
                <div className="relative h-40 w-full overflow-hidden bg-[#f0ebe0] dark:bg-gray-700">
                  <Image
                    src={image}
                    alt={product.name}
                    fill
                    className="object-cover transition-transform duration-500 group-hover:scale-105"
                    sizes="220px"
                  />
                  <div className="absolute right-2.5 top-2.5 rounded-full bg-[#f47a45] px-2.5 py-1 text-xs font-bold text-white shadow-md">
                    {formatNaira(product.price)}
                  </div>
                </div>

                {/* Info */}
                <div className="flex flex-1 flex-col p-3.5">
                  {product.category?.name && (
                    <span className="text-[10px] font-semibold uppercase tracking-wider text-[#f47a45]">
                      {product.category.name}
                    </span>
                  )}
                  <h3 className="mt-0.5 line-clamp-1 text-sm font-bold text-gray-900 group-hover:text-[#f47a45] dark:text-gray-100">
                    {product.name}
                  </h3>
                  <p className="mt-1 line-clamp-2 text-xs leading-relaxed text-gray-500 dark:text-gray-400">
                    {product.description}
                  </p>

                  <div className="mt-3 flex items-center justify-between border-t border-[#ede8da] pt-3 dark:border-gray-600">
                    <span className="text-sm font-extrabold text-[#f47a45]">
                      {formatNaira(product.price)}
                    </span>
                    <button
                      onClick={() => handleAddToCart(product)}
                      className={`inline-flex items-center gap-1 rounded-lg px-3 py-1.5 text-xs font-bold text-white transition-all duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#f58c55] ${
                        added
                          ? 'bg-green-500'
                          : 'bg-[#f58c55] hover:bg-[#f47a45]'
                      }`}
                    >
                      {added ? (
                        <><Check className="h-3 w-3" /> Added</>
                      ) : (
                        <><ShoppingBag className="h-3 w-3" /> Buy</>
                      )}
                    </button>
                  </div>
                </div>
              </div>
            </li>
          );
        })}

        {/* See-all card */}
        <li className="w-[160px] shrink-0 snap-start">
          <Link
            href="/home-items"
            className="flex h-full flex-col items-center justify-center gap-3 rounded-2xl border border-dashed border-[#f58c55]/50 bg-[#faf7f0] p-4 text-center transition-colors hover:border-[#f58c55] hover:bg-white dark:bg-gray-700/40 dark:hover:bg-gray-700"
          >
            <span className="flex h-10 w-10 items-center justify-center rounded-full bg-[#f58c55]/10 dark:bg-[#f58c55]/20">
              <ArrowRight className="h-5 w-5 text-[#f47a45]" />
            </span>
            <span className="text-xs font-semibold text-gray-700 dark:text-gray-300">
              See all home items
            </span>
          </Link>
        </li>
      </ul>
    </section>
  );
}
