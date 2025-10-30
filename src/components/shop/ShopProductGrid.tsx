'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { FaShoppingCart } from 'react-icons/fa';

export interface ShopProduct {
  _id: string;
  name: string;
  images: string[];
  price: number;
  description: string;
  stock?: number;
  category: string; // id
}

interface ShopProductGridProps<T extends ShopProduct> {
  products: T[];
  selectedCategoryId?: string | null;
  searchQuery?: string;
  onAddToCart: (product: { id: string; name: string; image: string; price: number }) => void;
  emptyMessage?: string;
}

const ShopProductGrid = <T extends ShopProduct>({
  products,
  selectedCategoryId,
  searchQuery = '',
  onAddToCart,
  emptyMessage = 'No products found.'
}: ShopProductGridProps<T>) => {
  const filtered = React.useMemo(() => {
    let list = products;
    if (selectedCategoryId) {
      list = list.filter(p => p.category === selectedCategoryId);
    }
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      list = list.filter(p => p.name.toLowerCase().includes(q) || p.description.toLowerCase().includes(q));
    }
    return list;
  }, [products, selectedCategoryId, searchQuery]);

  if (!filtered.length) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-500 text-lg">{emptyMessage}</p>
        {searchQuery && <p className="text-gray-400">Try adjusting your search terms.</p>}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 p-6">
      {filtered.map((product) => (
        <motion.div
          key={product._id}
          className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-300"
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
            <div className="absolute top-2 right-2 bg-pink-600 text-white px-2 py-1 rounded-full text-sm font-semibold">
              ₦{(product.price || 0).toLocaleString()}
            </div>
          </div>

          <div className="p-4">
            <h3 className="text-lg font-semibold text-gray-800 mb-2">{product.name}</h3>
            <p className="text-gray-600 text-sm mb-3 line-clamp-2">{product.description}</p>
            <div className="flex items-center justify-between">
              <span className="text-pink-600 font-bold text-lg">₦{(product.price || 0).toLocaleString()}</span>
              <motion.button
                onClick={() => onAddToCart({ id: product._id, name: product.name, image: product.images?.[0], price: product.price })}
                className="bg-pink-600 text-white px-4 py-2 rounded-lg hover:bg-pink-700 transition-colors flex items-center space-x-2"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <FaShoppingCart />
                <span>Add</span>
              </motion.button>
            </div>
          </div>
        </motion.div>
      ))}
    </div>
  );
};

export default ShopProductGrid;

