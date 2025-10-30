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

interface FoodProduct {
  _id: string;
  name: string;
  category: string;
  images: string[];
  price: number;
  description: string;
  inStock?: boolean;
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

  // Filter products based on category and search query
  useEffect(() => {
    let filtered = products;

    // Apply category filtering
    if (selectedCategoryId && selectedCategoryId !== 'All') {
      // Filter by category ID
      filtered = filtered.filter(product => product.category === selectedCategoryId);
    } else if (selectedCategory && selectedCategory !== 'All') {
      // Fallback: filter by category name if ID not available
      const category = categories.find(cat => cat.name === selectedCategory);
      if (category) {
        filtered = filtered.filter(product => product.category === category._id);
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

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 p-6">
      {filteredProducts.map((product) => {
        const productCategory = categories.find(cat => cat._id === product.category);
        const categoryName = productCategory ? productCategory.name : 'Unknown Category';

        return (
          <motion.div
            key={product._id}
            className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-300"
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
                  onClick={() => onAddToCart({
                    id: product._id,
                    name: product.name,
                    image: product.images && product.images.length > 0 ? product.images[0] : '/assets/images/placeholder-food.jpg',
                    price: product.price
                  })}
                  className="bg-[#f58c55] hover:bg-[#f47a45] text-white px-4 py-2 rounded-lg transition-colors flex items-center space-x-2"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <FaShoppingCart />
                  <span>Order</span>
                </motion.button>
              </div>
            </div>
          </motion.div>
        );
      })}
    </div>
  );
};

export default ProductGrid;