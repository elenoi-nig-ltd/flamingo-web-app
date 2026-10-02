'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { FaShoppingCart } from 'react-icons/fa';
import { ShoppingBag, Check } from 'lucide-react';
import { useCategories } from '@/hooks/useCategories';
import { formatNaira } from '@/lib/format';

interface ProductGridProps {
  products: FoodProduct[];
  selectedCategory: string;
  selectedCategoryId?: string | null;
  searchQuery: string;
  onAddToCart: (product: { id: string; name: string; image: string; price: number }) => void;
}

interface FoodProduct {
  _id: string;
  name: string;
  category: string | { _id: string; name: string; description: string };
  images: string[];
  price: number;
  description: string;
  inStock?: boolean;
  isAvailable?: boolean;
}

const ProductGrid: React.FC<ProductGridProps> = ({
  products,
  selectedCategory,
  selectedCategoryId,
  searchQuery,
  onAddToCart,
}) => {
  const { categories } = useCategories();
  const [addedIds, setAddedIds] = useState<Set<string>>(new Set());

  // Filter products based on category and search query
  const filteredProducts = React.useMemo(() => {
    let filtered = products;

    if (selectedCategoryId && selectedCategoryId !== 'All') {
      filtered = filtered.filter(product => {
        const categoryId = typeof product.category === 'string' 
          ? product.category 
          : product.category._id;
        return categoryId === selectedCategoryId;
      });
    } else if (selectedCategory && selectedCategory !== 'All') {
      const category = categories.find(cat => cat.name === selectedCategory);
      if (category) {
        filtered = filtered.filter(product => {
          const categoryId = typeof product.category === 'string' 
            ? product.category 
            : product.category._id;
          return categoryId === category._id;
        });
      }
    }

    if (searchQuery && searchQuery.trim() !== '') {
      filtered = filtered.filter(product =>
        product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        product.description.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    return filtered;
  }, [products, selectedCategory, selectedCategoryId, searchQuery, categories]);

  const selectedCategoryName = selectedCategory === 'All'
    ? 'All Categories'
    : categories.find(cat => cat._id === selectedCategoryId)?.name || selectedCategory || 'Selected Category';

  if (products.length === 0 && !searchQuery) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 p-6">
        {[...Array(8)].map((_, index) => (
          <div key={index} className="rounded-2xl border border-amber-100 bg-[#fffbf4] p-4 shadow-sm animate-pulse dark:border-gray-700 dark:bg-gray-800">
            <div className="w-full h-40 bg-amber-100 dark:bg-gray-700 rounded-xl"></div>
            <div className="p-2 space-y-3 mt-2">
              <div className="h-4 bg-amber-100 dark:bg-gray-700 rounded w-3/4"></div>
              <div className="h-3 bg-amber-100 dark:bg-gray-700 rounded w-full"></div>
              <div className="h-3 bg-amber-100 dark:bg-gray-700 rounded w-2/3"></div>
              <div className="flex items-center justify-between pt-2">
                <div className="h-5 bg-amber-100 dark:bg-gray-700 rounded w-1/3"></div>
                <div className="h-8 bg-amber-100 dark:bg-gray-700 rounded w-20"></div>
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (filteredProducts.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="inline-flex items-center justify-center w-16 h-16 bg-amber-100 dark:bg-gray-700 rounded-full mb-4">
          <FaShoppingCart className="text-3xl text-amber-500 dark:text-gray-400" />
        </div>
        <p className="text-gray-700 dark:text-gray-300 text-lg font-semibold mb-2">
          No products found in {selectedCategoryName}
        </p>
        {searchQuery ? (
          <p className="text-gray-500 dark:text-gray-400 text-sm">
            Try adjusting your search terms.
          </p>
        ) : (
          <p className="text-gray-500 dark:text-gray-400 text-sm">
            Try selecting a different category.
          </p>
        )}
      </div>
    );
  }

  const handleAddToCart = (e: React.MouseEvent, product: FoodProduct) => {
    e.stopPropagation();

    onAddToCart({
      id: product._id,
      name: product.name,
      image: product.images && product.images.length > 0 ? product.images[0] : '/assets/images/placeholder-food.jpg',
      price: product.price
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

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 p-6">
      {filteredProducts.map((product) => {
        const categoryName = typeof product.category === 'string'
          ? categories.find(cat => cat._id === product.category)?.name
          : product.category?.name;

        const image = product.images && product.images.length > 0 ? product.images[0] : '/assets/images/placeholder-food.jpg';
        const added = addedIds.has(product._id);
        const isAvailable = product.isAvailable !== false;

        return (
          <motion.div
            key={product._id}
            className="group flex flex-col justify-between overflow-hidden rounded-2xl border border-amber-100 bg-[#fffbf4] shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-xl dark:border-gray-700 dark:bg-gray-800"
            whileHover={{ y: -4 }}
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.2 }}
          >
            {/* Image section */}
            <div className="relative h-44 w-full overflow-hidden bg-amber-50 dark:bg-gray-700">
              <img
                src={image}
                alt={product.name}
                className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                loading="lazy"
                onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  target.src = '/assets/images/placeholder-food.jpg';
                }}
              />
              <div className="absolute right-2.5 top-2.5 rounded-full bg-[#f47a45] px-2.5 py-1 text-xs font-bold text-white shadow-md">
                {formatNaira(product.price)}
              </div>
              {!isAvailable && (
                <div className="absolute inset-0 bg-black/60 flex items-center justify-center backdrop-blur-[1px]">
                  <span className="bg-red-600 text-white px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider shadow">
                    Unavailable
                  </span>
                </div>
              )}
            </div>

            {/* Info section */}
            <div className="flex flex-1 flex-col p-4">
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

              <div className="mt-4 flex items-center justify-between border-t border-amber-100/80 pt-3 dark:border-gray-700/60">
                <span className="text-sm font-extrabold text-[#f47a45]">
                  {formatNaira(product.price)}
                </span>
                <button
                  onClick={(e) => isAvailable && handleAddToCart(e, product)}
                  disabled={!isAvailable}
                  className={`inline-flex items-center gap-1.5 rounded-lg px-3.5 py-1.5 text-xs font-bold text-white transition-all duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#f58c55] ${
                    !isAvailable
                      ? 'bg-gray-400 cursor-not-allowed opacity-70'
                      : added
                      ? 'bg-green-500'
                      : 'bg-[#f58c55] hover:bg-[#f47a45]'
                  }`}
                >
                  {added ? (
                    <><Check className="h-3.5 w-3.5" /> Added</>
                  ) : (
                    <><ShoppingBag className="h-3.5 w-3.5" /> Order</>
                  )}
                </button>
              </div>
            </div>
          </motion.div>
        );
      })}
    </div>
  );
};

export default ProductGrid;