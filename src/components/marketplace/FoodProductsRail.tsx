'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { ShoppingBag, ArrowRight, Check } from 'lucide-react';
import axios from 'axios';
import { BASEURL } from '@/config/api/contants';
import { useCart } from '@/contexts/CartContext';
import SectionHeading from './SectionHeading';
import { formatNaira } from '@/lib/format';

interface Category {
  _id: string;
  name: string;
}

interface FoodProduct {
  _id: string;
  name: string;
  description: string;
  price: number;
  category: string | Category;
  images?: string[];
}

/**
 * Horizontally scrollable food-products rail on the marketplace homepage.
 * Finds the food category dynamically, fetches its products, and renders
 * snap cards. Adds directly to cart on button click.
 */
export default function FoodProductsRail() {
  const [products, setProducts] = useState<FoodProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const { addToCart } = useCart();
  const [addedIds, setAddedIds] = useState<Set<string>>(new Set());

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const catRes = await axios.get<Category[]>(`${BASEURL}/categories`);
        const categories: Category[] = Array.isArray(catRes.data) ? catRes.data : [];

        const foodCat = categories.find((c) =>
          /food|snack|drink|beverage|meal|dining/i.test(c.name),
        );

        if (!foodCat || cancelled) { setLoading(false); return; }

        const prodRes = await axios.get<FoodProduct[]>(`${BASEURL}/products`, {
          params: { category: foodCat._id, limit: 12 },
        });
        const data: FoodProduct[] = Array.isArray(prodRes.data) ? prodRes.data : [];

        if (!cancelled) setProducts(data.slice(0, 12));
      } catch (e) {
        console.error('[FoodProductsRail]', e);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, []);

  const handleAddToCart = (product: FoodProduct) => {
    const categoryName =
      typeof product.category === 'string' ? 'food' : product.category?.name;
    addToCart({
      id: product._id,
      name: product.name,
      image: product.images?.[0] || '',
      price: product.price,
      category: categoryName ?? 'food',
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
          title="Order Food & Drinks"
          subtitle="Fresh meals, fast food and drinks delivered around Minna."
          href="/food"
          hrefLabel="Order now"
        />
        <div className="-mx-4 flex gap-4 overflow-x-auto px-4 pb-4">
          {[...Array(5)].map((_, i) => (
            <div
              key={i}
              className="w-[220px] shrink-0 animate-pulse rounded-2xl border border-amber-100 bg-[#fffbf4] p-4 shadow-sm dark:border-gray-700 dark:bg-gray-700/50"
            >
              <div className="h-40 w-full rounded-xl bg-amber-100 dark:bg-gray-600" />
              <div className="mt-4 h-3 w-1/3 rounded bg-amber-100 dark:bg-gray-600" />
              <div className="mt-2 h-4 w-3/4 rounded bg-amber-100 dark:bg-gray-600" />
              <div className="mt-1.5 h-3 w-full rounded bg-amber-100 dark:bg-gray-600" />
              <div className="mt-4 flex items-center justify-between">
                <div className="h-5 w-16 rounded bg-amber-100 dark:bg-gray-600" />
                <div className="h-8 w-20 rounded-lg bg-amber-100 dark:bg-gray-600" />
              </div>
            </div>
          ))}
        </div>
      </section>
    );
  }

  /* ── No food products yet → render nothing ────────────────────── */
  if (products.length === 0) return null;

  return (
    <section>
      <SectionHeading
        title="Order Food & Drinks"
        subtitle="Fresh meals, fast food and drinks delivered around Minna."
        href="/food"
        hrefLabel="Order now"
      />

      <ul className="flex snap-x snap-proximity gap-4 overflow-x-auto pb-4 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        {products.map((product) => {
          const image = product.images?.[0] || '/assets/images/categories/food.png';
          const categoryName =
            typeof product.category === 'string' ? undefined : product.category?.name;
          const added = addedIds.has(product._id);

          return (
            <li key={product._id} className="w-[180px] shrink-0 snap-start sm:w-[220px]">
              {/* Light mode: very light amber tint — dark mode: dark card */}
              <div className="group flex h-full flex-col justify-between overflow-hidden rounded-2xl border border-amber-100 bg-[#fffbf4] shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-xl dark:border-gray-700 dark:bg-gray-800">
                {/* Image */}
                <div className="relative h-40 w-full overflow-hidden bg-amber-50 dark:bg-gray-700">
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
                  {categoryName && (
                    <span className="text-[10px] font-semibold uppercase tracking-wider text-[#f47a45]">
                      {categoryName}
                    </span>
                  )}
                  <h3 className="mt-0.5 line-clamp-1 text-sm font-bold text-gray-900 group-hover:text-[#f47a45] dark:text-gray-100">
                    {product.name}
                  </h3>
                  <p className="mt-1 line-clamp-2 text-xs leading-relaxed text-gray-500 dark:text-gray-400">
                    {product.description}
                  </p>

                  <div className="mt-3 flex items-center justify-between border-t border-amber-100 pt-3 dark:border-gray-600">
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
                        <><ShoppingBag className="h-3 w-3" /> Order</>
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
            href="/food"
            className="flex h-full flex-col items-center justify-center gap-3 rounded-2xl border border-dashed border-amber-300/60 bg-[#fffbf4] p-4 text-center transition-colors hover:border-[#f58c55] hover:bg-white dark:bg-gray-700/40 dark:hover:bg-gray-700"
          >
            <span className="flex h-10 w-10 items-center justify-center rounded-full bg-[#f58c55]/10 dark:bg-[#f58c55]/20">
              <ArrowRight className="h-5 w-5 text-[#f47a45]" />
            </span>
            <span className="text-xs font-semibold text-gray-700 dark:text-gray-300">
              See full menu
            </span>
          </Link>
        </li>
      </ul>
    </section>
  );
}
