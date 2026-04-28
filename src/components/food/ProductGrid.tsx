'use client';

import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { FaShoppingCart } from 'react-icons/fa';
import { useCategories } from '@/hooks/useCategories';

interface ProductGridProps {
  products: FoodProduct[];
  selectedCategory: string;
  selectedCategoryId?: string | null;
  searchQuery: string;
  onAddToCart: (product: { id: string; name: string; image: string; price: number }) => void;
}

/* ---------- Card-level toast (appears inside the card) ---------- */
const CardToast: React.FC<{ message: string; onClose: () => void }> = ({
  message,
  onClose,
}) => {
  useEffect(() => {
    const timer = setTimeout(onClose, 2000);
    return () => clearTimeout(timer);
  }, [onClose]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 10 }}
      className="absolute inset-x-0 bottom-0 bg-green-600 text-white text-xs py-1 px-2 rounded-t-md text-center"
    >
      {message}
    </motion.div>
  );
};
/* ---------------------------------------------------------------- */

interface FoodProduct {
  _id: string;
  name: string;
  category: string | { _id: string; name: string; description: string }; // Can be ID or populated object
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
  const [filteredProducts, setFilteredProducts] = useState<FoodProduct[]>([]);
  
  /* ---- Per-card toast state (mobile + web) ---- */
  const [cardToast, setCardToast] = useState<{ id: string; message: string } | null>(null);
  /* -------------------------------------------- */

  // Filter products based on category and search query
  useEffect(() => {
    let filtered = products;

    // Apply category filtering
    if (selectedCategoryId && selectedCategoryId !== 'All') {
      // Filter by category ID - handle both populated and unpopulated category
      filtered = filtered.filter(product => {
        const categoryId = typeof product.category === 'string' 
          ? product.category 
          : product.category._id;
        return categoryId === selectedCategoryId;
      });
    } else if (selectedCategory && selectedCategory !== 'All') {
      // Fallback: filter by category name if ID not available
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

    // Apply search query filtering
    if (searchQuery && searchQuery.trim() !== '') {
      filtered = filtered.filter(product =>
        product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        product.description.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    setFilteredProducts(filtered);
  }, [products, selectedCategory, selectedCategoryId, searchQuery, categories]);

  const selectedCategoryName = selectedCategory === 'All'
    ? 'All Categories'
    : categories.find(cat => cat._id === selectedCategoryId)?.name || selectedCategory || 'Selected Category';

  // Show loading skeleton while products are being fetched
  if (products.length === 0 && !searchQuery) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 p-6">
        {[...Array(8)].map((_, index) => (
          <div key={index} className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden animate-pulse">
            <div className="w-full h-48 bg-gray-300 dark:bg-gray-600"></div>
            <div className="p-4 space-y-3">
              <div className="h-4 bg-gray-300 dark:bg-gray-600 rounded w-3/4"></div>
              <div className="h-3 bg-gray-300 dark:bg-gray-600 rounded w-full"></div>
              <div className="h-3 bg-gray-300 dark:bg-gray-600 rounded w-2/3"></div>
              <div className="flex items-center justify-between pt-2">
                <div className="h-6 bg-gray-300 dark:bg-gray-600 rounded w-1/3"></div>
                <div className="h-8 bg-gray-300 dark:bg-gray-600 rounded w-20"></div>
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  // Show message if no products found
  if (filteredProducts.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="inline-flex items-center justify-center w-16 h-16 bg-gray-200 dark:bg-gray-700 rounded-full mb-4">
          <FaShoppingCart className="text-3xl text-gray-400 dark:text-gray-500" />
        </div>
        <p className="text-gray-500 dark:text-gray-400 text-lg font-medium mb-2">
          No products found in {selectedCategoryName}
        </p>
        {searchQuery && (
          <p className="text-gray-400 dark:text-gray-500 text-sm">
            Try adjusting your search terms.
          </p>
        )}
        {selectedCategory !== 'All' && !searchQuery && (
          <p className="text-gray-400 dark:text-gray-500 text-sm">
            Try selecting a different category.
          </p>
        )}
      </div>
    );
  }

  const handleAddToCart = (e: React.MouseEvent, product: FoodProduct) => {
    e.stopPropagation();

    // Global toast (desktop)
    onAddToCart({
      id: product._id,
      name: product.name,
      image: product.images && product.images.length > 0 ? product.images[0] : '/assets/images/placeholder-food.jpg',
      price: product.price
    });

    // Card-level toast (mobile + web)
    setCardToast({ id: product._id, message: 'Food added to orders' });
    setTimeout(() => setCardToast(null), 2200);
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 p-6">
      {filteredProducts.map((product) => {
        // Handle both populated category object and category ID string
        const categoryName = typeof product.category === 'string'
          ? categories.find(cat => cat._id === product.category)?.name || 'Uncategorized'
          : product.category?.name || 'Uncategorized';

        return (
          <motion.div
            key={product._id}
            className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-300 relative"
            whileHover={{ y: -5 }}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            <div className="relative">
              <img
                src={product.images && product.images.length > 0 ? product.images[0] : '/assets/images/placeholder-food.jpg'}
                alt={product.name}
                className="w-full h-48 object-cover"
                loading="lazy"
                onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  target.src = '/assets/images/placeholder-food.jpg';
                }}
              />
              <div className="absolute top-2 right-2 bg-[#f58c55] text-white px-2 py-1 rounded-full text-sm font-semibold">
                ₦{product.price.toLocaleString()}
              </div>
              {product.isAvailable === false && (
                <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
                  <span className="bg-red-600 text-white px-3 py-1 rounded-full text-sm font-bold uppercase tracking-wider">
                    Unavailable
                  </span>
                </div>
              )}
            </div>

            <div className="p-4">
              <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-2">{product.name}</h3>
              <p className="text-gray-500 dark:text-gray-400 text-xs mb-1">{categoryName}</p>
              <p className="text-gray-600 dark:text-gray-300 text-sm mb-3 line-clamp-2">{product.description}</p>
              <div className="flex items-center justify-between">
                <span className="text-[#f58c55] font-bold text-lg">
                  ₦{product.price.toLocaleString()}
                </span>
                <motion.button
                  onClick={(e) => product.isAvailable !== false && handleAddToCart(e, product)}
                  className={`px-4 py-2 rounded-lg transition-colors flex items-center space-x-2 ${
                    product.isAvailable !== false
                      ? 'bg-[#f58c55] hover:bg-[#f47a45] text-white'
                      : 'bg-gray-400 cursor-not-allowed text-gray-200'
                  }`}
                  whileHover={product.isAvailable !== false ? { scale: 1.05 } : {}}
                  whileTap={product.isAvailable !== false ? { scale: 0.95 } : {}}
                  disabled={product.isAvailable === false}
                >
                  <FaShoppingCart />
                  <span>{product.isAvailable !== false ? 'Order' : 'Unavailable'}</span>
                </motion.button>
              </div>

              {/* ---------- Card toast (mobile + web) ---------- */}
              <div className="relative h-6 mt-2">
                {cardToast?.id === product._id && (
                  <CardToast
                    message={cardToast.message}
                    onClose={() => setCardToast(null)}
                  />
                )}
              </div>
              {/* ------------------------------------------------ */}
            </div>
          </motion.div>
        );
      })}
    </div>
  );
};

export default ProductGrid;