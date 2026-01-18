'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FaShoppingCart, FaStar } from 'react-icons/fa';
import { usePublicProducts } from '@/hooks/usePublicProducts';
import SkeletonLoader from '@/components/ui/SkeletonLoader';
import { useCategories } from '@/hooks/useCategories';

interface ProductGridProps {
  selectedCategory: string;
  searchQuery: string;
  onAddToCart: (product: { id: string; name: string; image: string; price: number }) => void;
}

const ProductGrid: React.FC<ProductGridProps> = ({
  selectedCategory,
  searchQuery,
  onAddToCart
}) => {
  const { categories } = useCategories();
  const { products, loading, error } = usePublicProducts();
  const [filteredProducts, setFilteredProducts] = useState<any[]>([]);

  // Filter products based on category and search query
  useEffect(() => {
    if (!products) return;

    let filtered = products;
    // Filter by category (map name to id like food grid)
    if (selectedCategory && selectedCategory !== 'All') {
      const category = categories.find(cat => cat.name === selectedCategory);
      if (category) {
        filtered = products.filter(product => product.category === category._id);
      }
    }

    // Filter by search query
    if (searchQuery) {
      filtered = filtered.filter(product =>
        product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        product.description.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    setFilteredProducts(filtered);
  }, [products, selectedCategory, searchQuery]);

  // Mock home items data for demonstration
  const mockHomeItems = [
    {
      _id: '1',
      name: 'Modern Coffee Table',
      description: 'Elegant wooden coffee table with clean lines',
      price: 299.99,
      category: 'Furniture',
      stock: 15,
      images: ['/assets/images/placeholder-food.jpg'], // Using placeholder for now
      rating: 4.5,
      reviews: 23
    },
    {
      _id: '2',
      name: 'Kitchen Mixer',
      description: 'Professional stand mixer for all your baking needs',
      price: 199.99,
      category: 'Kitchen & Dining',
      stock: 8,
      images: ['/assets/images/placeholder-food.jpg'],
      rating: 4.8,
      reviews: 45
    },
    {
      _id: '3',
      name: 'Bathroom Mirror',
      description: 'LED illuminated bathroom mirror with storage',
      price: 149.99,
      category: 'Bathroom',
      stock: 12,
      images: ['/assets/images/placeholder-food.jpg'],
      rating: 4.3,
      reviews: 18
    },
    {
      _id: '4',
      name: 'Bedside Lamp',
      description: 'Touch-controlled bedside lamp with USB port',
      price: 79.99,
      category: 'Lighting',
      stock: 25,
      images: ['/assets/images/placeholder-food.jpg'],
      rating: 4.6,
      reviews: 31
    },
    {
      _id: '5',
      name: 'Wall Art Canvas',
      description: 'Abstract geometric wall art for modern homes',
      price: 89.99,
      category: 'Home Decor',
      stock: 20,
      images: ['/assets/images/placeholder-food.jpg'],
      rating: 4.4,
      reviews: 27
    },
    {
      _id: '6',
      name: 'Dining Chair Set',
      description: 'Set of 4 comfortable dining chairs',
      price: 399.99,
      category: 'Kitchen & Dining',
      stock: 6,
      images: ['/assets/images/placeholder-food.jpg'],
      rating: 4.7,
      reviews: 52
    }
  ];

  // Use mock data if no products are loaded
  const displayProducts = products && products.length > 0 ? filteredProducts : mockHomeItems;

  if (loading) {
    return (
      <div className="p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {[...Array(8)].map((_, i) => (
            <SkeletonLoader key={i} />
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 text-center">
        <div className="text-red-500 mb-4">Error loading products: {error}</div>
        <div className="text-gray-600">Showing sample home items instead</div>
      </div>
    );
  }

  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-800 mb-2">
          {selectedCategory === 'All' ? 'All Home Items' : selectedCategory}
        </h2>
        <p className="text-gray-600">
          {displayProducts.length} items found
          {searchQuery && ` for "${searchQuery}"`}
        </p>
      </div>

      {/* Products Grid */}
      {displayProducts.length === 0 ? (
        <div className="text-center py-12">
          <div className="text-gray-500 text-lg mb-2">No items found</div>
          <div className="text-gray-400">Try adjusting your search or category selection</div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {displayProducts.map((product, index) => (
            <motion.div
              key={product._id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-300"
            >
              {/* Product Image */}
              <div className="relative">
                <img
                  // src={product.images && product.images.length > 0 ? product.images[0] : '/assets/images/placeholder-food.jpg'}
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

              {/* Product Info */}
              <div className="p-4">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-semibold text-gray-800 text-sm line-clamp-2">
                    {product.name}
                  </h3>
                </div>
                
                <p className="text-gray-600 text-xs mb-3 line-clamp-2">
                  {product.description}
                </p>

                {/* Rating */}
                <div className="flex items-center mb-3">
                  <div className="flex items-center">
                    {[...Array(5)].map((_, i) => (
                      <FaStar
                        key={i}
                        className={`${
                          i < Math.floor(product.rating || 0)
                            ? 'text-yellow-400'
                            : 'text-gray-300'
                        }`}
                        size={12}
                      />
                    ))}
                  </div>
                  <span className="text-xs text-gray-500 ml-2">
                    ({product.reviews || 0})
                  </span>
                </div>

                {/* Price and Add to Cart */}
                <div className="flex items-center justify-between">
                  <span className="text-pink-600 font-bold text-lg">₦{(product.price || 0).toLocaleString()}</span>
                  <button
                    onClick={() => onAddToCart({
                      id: product._id,
                      name: product.name,
                      image: product.images?.[0] || '/assets/images/placeholder-food.jpg',
                      price: product.price || 0
                    })}
                    className="bg-pink-600 text-white px-4 py-2 rounded-lg hover:bg-pink-700 transition-colors flex items-center space-x-2"
                    disabled={!product.stock || product.stock <= 0}
                  >
                    <FaShoppingCart size={16} />
                    <span>Add</span>
                  </button>
                </div>

                {/* Stock Status */}
                {typeof product.stock === 'number' && (
                  <div className="mt-2 text-xs text-gray-500">
                    {product.stock > 0 ? (
                      <span className="text-green-600">In Stock ({product.stock})</span>
                    ) : (
                      <span className="text-red-600">Out of Stock</span>
                    )}
                  </div>
                )}
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ProductGrid;
