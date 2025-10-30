'use client';

import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { FaShoppingCart } from 'react-icons/fa';
import { useRouter } from 'next/navigation';
import { useHomeItemCategories } from '@/hooks/useHomeItemCategories';
import { useHomeItems } from '@/hooks/useHomeItems';

interface HomeItem {
  _id: string;
  name: string;
  description: string;
  price: number;
  category: { _id: string; name: string };
  stock: number;
  images: string[];
}

interface HomeItemsProductGridProps {
  selectedCategory: string;
  selectedCategoryId?: string | null;
  searchQuery: string;
  onAddToCart: (product: { id: string; name: string; image: string; price: number }) => void;
}

const HomeItemsProductGrid = ({ selectedCategory, selectedCategoryId, searchQuery, onAddToCart }: HomeItemsProductGridProps) => {
  const router = useRouter();
  const { categories } = useHomeItemCategories();
  const { products, loading, error } = useHomeItems();
  const [filteredProducts, setFilteredProducts] = useState<HomeItem[]>([]);
  const [selectedImages, setSelectedImages] = useState<{ [key: string]: number }>({});

  useEffect(() => {
    if (products.length > 0) {
      let filtered = products;
      
      if (selectedCategoryId) {
        filtered = products.filter(product => product.category._id === selectedCategoryId);
      } else if (selectedCategory !== 'All') {
        const category = categories.find(cat => cat.name === selectedCategory);
        if (category) {
          filtered = products.filter(product => product.category._id === category._id);
        }
      }
      
      if (searchQuery) {
        filtered = filtered.filter(product => 
          product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          product.description.toLowerCase().includes(searchQuery.toLowerCase())
        );
      }
      
      setFilteredProducts(filtered);
    }
  }, [products, selectedCategory, selectedCategoryId, searchQuery, categories]);

  const handleImageSelect = (productId: string, index: number) => {
    setSelectedImages(prev => ({ ...prev, [productId]: index }));
  };

  const handleProductClick = (productId: string) => {
    router.push(`/home-items/${productId}`);
  };

  const handleAddToCart = (e: React.MouseEvent, product: HomeItem) => {
    e.stopPropagation();
    onAddToCart({ 
      id: product._id, 
      name: product.name, 
      image: product.images[0], 
      price: product.price 
    });
  };

  if (loading) {
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

  if (error) {
    return (
      <div className="text-center py-8">
        <p className="text-red-500">Network error. Please try again later</p>
      </div>
    );
  }

  const displayProducts = filteredProducts.length > 0 ? filteredProducts : (selectedCategoryId || selectedCategory !== 'All' ? [] : products);

  if (displayProducts.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-500 dark:text-gray-400 text-lg">No home items found.</p>
        {searchQuery && <p className="text-gray-400 dark:text-gray-500">Try adjusting your search terms.</p>}
        {(selectedCategory !== 'All' || selectedCategoryId) && <p className="text-gray-400 dark:text-gray-500">Try selecting a different category.</p>}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 p-6">
      {displayProducts.map((product) => {
        const currentImageIndex = selectedImages[product._id] || 0;
        const productImages = product.images && product.images.length > 0 
          ? product.images 
          : ['/assets/images/placeholder-home-item.jpg'];

        return (
          <motion.div
            key={product._id}
            className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-300 cursor-pointer"
            whileHover={{ y: -5 }}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            onClick={() => handleProductClick(product._id)}
          >
            <div className="relative">
              <img
                src={productImages[currentImageIndex]}
                alt={product.name}
                className="w-full h-48 object-cover"
                loading="lazy"
                onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  target.src = '/assets/images/placeholder-home-item.jpg';
                }}
              />
              <div className="absolute top-2 right-2 bg-[#f58c55] text-white px-2 py-1 rounded-full text-sm font-semibold">
                ₦{product.price.toLocaleString()}
              </div>
              
              {/* Image thumbnails */}
              {productImages.length > 1 && (
                <div className="absolute bottom-2 left-2 right-2 flex gap-1 justify-center">
                  {productImages.map((_, index) => (
                    <button
                      key={index}
                      onClick={(e) => {
                        e.stopPropagation();
                        handleImageSelect(product._id, index);
                      }}
                      className={`w-2 h-2 rounded-full transition-all ${
                        currentImageIndex === index 
                          ? 'bg-[#f58c55] w-6' 
                          : 'bg-white/60 hover:bg-white/80'
                      }`}
                      aria-label={`View image ${index + 1}`}
                    />
                  ))}
                </div>
              )}
            </div>
            
            <div className="p-4">
              <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-2">{product.name}</h3>
              <p className="text-gray-600 dark:text-gray-300 text-sm mb-3 line-clamp-2">{product.description}</p>
              
              {/* Multiple image previews */}
              {productImages.length > 1 && (
                <div className="flex gap-2 mb-3 overflow-x-auto pb-2">
                  {productImages.slice(0, 4).map((image, index) => (
                    <button
                      key={index}
                      onClick={(e) => {
                        e.stopPropagation();
                        handleImageSelect(product._id, index);
                      }}
                      className={`flex-shrink-0 w-12 h-12 rounded border-2 transition-all ${
                        currentImageIndex === index 
                          ? 'border-[#f58c55]' 
                          : 'border-gray-300 dark:border-gray-600 hover:border-[#f58c55]/50'
                      }`}
                    >
                      <img
                        src={image}
                        alt={`${product.name} thumbnail ${index + 1}`}
                        className="w-full h-full object-cover rounded"
                        onError={(e) => {
                          const target = e.target as HTMLImageElement;
                          target.src = '/assets/images/placeholder-home-item.jpg';
                        }}
                      />
                    </button>
                  ))}
                  {productImages.length > 4 && (
                    <div className="flex-shrink-0 w-12 h-12 rounded border-2 border-gray-300 dark:border-gray-600 flex items-center justify-center bg-gray-100 dark:bg-gray-700">
                      <span className="text-xs text-gray-600 dark:text-gray-400">+{productImages.length - 4}</span>
                    </div>
                  )}
                </div>
              )}
              
              <div className="flex items-center justify-between">
                <span className="text-[#f58c55] font-bold text-lg">
                  ₦{product.price.toLocaleString()}
                </span>
                <motion.button
                  onClick={(e) => handleAddToCart(e, product)}
                  className="bg-[#f58c55] hover:bg-[#f47a45] text-white px-4 py-2 rounded-lg transition-colors flex items-center space-x-2"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <FaShoppingCart />
                  <span>Buy</span>
                </motion.button>
              </div>
            </div>
          </motion.div>
        );
      })}
    </div>
  );
};

export default HomeItemsProductGrid;