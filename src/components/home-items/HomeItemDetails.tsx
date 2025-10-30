'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FaShoppingCart, FaArrowLeft, FaHeart, FaShare, FaPlus, FaMinus, FaCheckCircle } from 'react-icons/fa';
import { useParams, useRouter } from 'next/navigation';
import { useHomeItems } from '@/hooks/useHomeItems';
import { useCart } from '@/hooks/useCart';
import Toast from '@/components/ui/Toast';
import Cart from '@/components/food/Cart'; // Import the Cart component

interface HomeItem {
  _id: string;
  name: string;
  description: string;
  price: number;
  category: { _id: string; name: string };
  stock: number;
  images: string[];
  specifications?: Record<string, string>;
}

interface HomeItemDetailProps {
  productId: string;
}

const HomeItemDetail = ({ productId }: HomeItemDetailProps) => {
  const router = useRouter();
  const { products, loading, error } = useHomeItems();
  const {
    cartItems,
    addToCart,
    removeFromCart,
    updateQuantity,
    clearCart,
    totalItems,
    totalPrice
  } = useCart();
  
  const [product, setProduct] = useState<HomeItem | null>(null);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [isFavorite, setIsFavorite] = useState(false);
  const [showAddedNotification, setShowAddedNotification] = useState(false);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [toast, setToast] = useState<{
    message: string;
    type: 'success' | 'error' | 'info';
    isVisible: boolean;
  }>({
    message: '',
    type: 'info',
    isVisible: false
  });

  // Find current product in cart to show current quantity
  const cartItem = cartItems.find(item => item.id === productId);

  useEffect(() => {
    if (products.length > 0 && productId) {
      const foundProduct = products.find(p => p._id === productId);
      setProduct(foundProduct || null);
    }
  }, [products, productId]);

  const showToast = (message: string, type: 'success' | 'error' | 'info' = 'info') => {
    setToast({
      message,
      type,
      isVisible: true
    });
  };

  const handleAddToCart = () => {
    if (product) {
      addToCart({ 
        id: product._id, 
        name: product.name, 
        image: product.images[0] || '/assets/images/placeholder-home-item.jpg', 
        price: product.price 
      });
      
      showToast(`${product.name} added to cart!`, 'success');
      setShowAddedNotification(true);
      setTimeout(() => setShowAddedNotification(false), 3000);
    }
  };

  const handleUpdateQuantity = (newQuantity: number) => {
    if (product && newQuantity >= 0) {
      if (newQuantity === 0) {
        removeFromCart(product._id);
        showToast(`${product.name} removed from cart`, 'info');
      } else {
        updateQuantity(product._id, newQuantity);
        showToast(`${product.name} quantity updated to ${newQuantity}`, 'info');
      }
    }
  };

  const handleIncrement = () => {
    if (product) {
      const newQuantity = (cartItem?.quantity || 0) + 1;
      if (newQuantity > product.stock) {
        showToast(`Only ${product.stock} items available in stock`, 'error');
        return;
      }
      handleUpdateQuantity(newQuantity);
    }
  };

  const handleDecrement = () => {
    if (product) {
      const newQuantity = (cartItem?.quantity || 0) - 1;
      handleUpdateQuantity(newQuantity);
    }
  };

  const handleBuyNow = () => {
    if (!product) return;

    // Add to cart first if not already there
    if (!cartItem) {
      addToCart({ 
        id: product._id, 
        name: product.name, 
        image: product.images[0] || '/assets/images/placeholder-home-item.jpg', 
        price: product.price 
      });
    }

    // Open cart instead of redirecting to checkout
    setIsCartOpen(true);
  };

  const handleBack = () => {
    router.back();
  };

  const handleShare = async () => {
    if (navigator.share && product) {
      try {
        await navigator.share({
          title: product.name,
          text: product.description,
          url: window.location.href,
        });
      } catch (error) {
        console.log('Error sharing:', error);
      }
    } else {
      // Fallback: copy to clipboard
      navigator.clipboard.writeText(window.location.href);
      showToast('Link copied to clipboard!', 'success');
    }
  };

  // Cart handlers
  const handleRemoveFromCart = (productId: string) => {
    const item = cartItems.find(item => item.id === productId);
    removeFromCart(productId);
    if (item) {
      showToast(`${item.name} removed from cart`, 'info');
    }
  };

  const handleUpdateCartQuantity = (productId: string, quantity: number) => {
    const item = cartItems.find(item => item.id === productId);
    updateQuantity(productId, quantity);
    if (item && quantity > 0) {
      showToast(`${item.name} quantity updated to ${quantity}`, 'info');
    }
  };

  const handleClearCart = () => {
    clearCart();
    showToast('Cart cleared', 'info');
  };

  if (loading) {
    return (
      <div className="min-h-screen mt-20 bg-gray-50 dark:bg-gray-900 p-6">
        <div className="max-w-7xl mx-auto">
          {/* Loading skeleton */}
          <div className="animate-pulse">
            <div className="h-6 w-24 bg-gray-300 dark:bg-gray-600 rounded mb-6"></div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Image loading */}
              <div className="space-y-4">
                <div className="w-full h-96 bg-gray-300 dark:bg-gray-600 rounded-lg"></div>
                <div className="flex gap-2">
                  {[...Array(4)].map((_, index) => (
                    <div key={index} className="w-20 h-20 bg-gray-300 dark:bg-gray-600 rounded"></div>
                  ))}
                </div>
              </div>
              {/* Content loading */}
              <div className="space-y-4">
                <div className="h-8 bg-gray-300 dark:bg-gray-600 rounded w-3/4"></div>
                <div className="h-6 bg-gray-300 dark:bg-gray-600 rounded w-1/4"></div>
                <div className="space-y-2">
                  <div className="h-4 bg-gray-300 dark:bg-gray-600 rounded w-full"></div>
                  <div className="h-4 bg-gray-300 dark:bg-gray-600 rounded w-5/6"></div>
                  <div className="h-4 bg-gray-300 dark:bg-gray-600 rounded w-4/6"></div>
                </div>
                <div className="h-12 bg-gray-300 dark:bg-gray-600 rounded w-1/2"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="min-h-screen mt-20 bg-gray-50 dark:bg-gray-900 flex items-center justify-center p-6">
        <div className="text-center">
          <motion.button
            onClick={handleBack}
            className="bg-[#f58c55] hover:bg-[#f47a45] text-white px-6 py-3 rounded-lg transition-colors flex items-center space-x-2 mb-4 mx-auto"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <FaArrowLeft />
            <span>Go Back</span>
          </motion.button>
          <p className="text-red-500 text-lg mb-4">
            {error ? 'Network error. Please try again later' : 'Product not found'}
          </p>
        </div>
      </div>
    );
  }

  const productImages = product.images && product.images.length > 0 
    ? product.images 
    : ['/assets/images/placeholder-home-item.jpg'];

  const currentCartQuantity = cartItem?.quantity || 0;
  const canAddMore = currentCartQuantity < product.stock;

  return (
    <div className="min-h-screen mt-20 bg-gray-50 dark:bg-gray-900 p-6">
      {/* Success Notification */}
      {showAddedNotification && (
        <div className="fixed top-24 right-4 z-50 bg-green-500 text-white px-6 py-4 rounded-lg shadow-2xl flex items-center gap-3 animate-slide-in">
          <FaCheckCircle className="w-6 h-6" />
          <div>
            <p className="font-bold">Added to Cart!</p>
            <p className="text-sm">Item added successfully</p>
          </div>
        </div>
      )}

      {/* Cart Component */}
      <Cart
        isOpen={isCartOpen}
        items={cartItems}
        totalPrice={totalPrice}
        onClose={() => setIsCartOpen(false)}
        onUpdateQuantity={handleUpdateCartQuantity}
        onRemoveItem={handleRemoveFromCart}
        onClearCart={handleClearCart}
        orderType="home-items"
      />

      <div className="max-w-7xl mx-auto">
        {/* Back button and Cart */}
        <div className="flex items-center justify-between mb-6">
          <motion.button
            onClick={handleBack}
            className="bg-white dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-800 dark:text-white px-4 py-2 rounded-lg transition-colors flex items-center space-x-2 shadow-md"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <FaArrowLeft />
            <span>Back to Products</span>
          </motion.button>

          {/* View Cart Button */}
          <motion.button
            onClick={() => setIsCartOpen(true)}
            className="relative flex items-center gap-2 px-4 py-2 bg-[#f58c55] hover:bg-[#f47a45] text-white rounded-lg font-medium transition-all hover:scale-105"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <FaShoppingCart />
            <span className="hidden sm:inline">View Orders</span>
            {totalItems > 0 && (
              <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs font-bold rounded-full w-6 h-6 flex items-center justify-center">
                {totalItems}
              </span>
            )}
          </motion.button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Image Gallery */}
          <div className="space-y-4">
            {/* Main Image */}
            <motion.div
              className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden relative"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5 }}
            >
              <img
                src={productImages[selectedImageIndex]}
                alt={product.name}
                className="w-full h-96 object-cover"
                onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  target.src = '/assets/images/placeholder-home-item.jpg';
                }}
              />
              {product.stock === 0 && (
                <div className="absolute inset-0 bg-black/50 flex items-center justify-center rounded-lg">
                  <span className="bg-red-500 text-white px-6 py-2 rounded-full font-bold text-lg">
                    Out of Stock
                  </span>
                </div>
              )}
            </motion.div>

            {/* Image Thumbnails */}
            {productImages.length > 1 && (
              <div className="flex gap-2 overflow-x-auto pb-2">
                {productImages.map((image, index) => (
                  <motion.button
                    key={index}
                    onClick={() => setSelectedImageIndex(index)}
                    className={`flex-shrink-0 w-20 h-20 rounded-lg border-2 transition-all ${
                      selectedImageIndex === index 
                        ? 'border-[#f58c55]' 
                        : 'border-gray-300 dark:border-gray-600 hover:border-[#f58c55]/50'
                    }`}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <img
                      src={image}
                      alt={`${product.name} thumbnail ${index + 1}`}
                      className="w-full h-full object-cover rounded-lg"
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        target.src = '/assets/images/placeholder-home-item.jpg';
                      }}
                    />
                  </motion.button>
                ))}
              </div>
            )}
          </div>

          {/* Product Details */}
          <motion.div
            className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            {/* Header */}
            <div className="flex justify-between items-start mb-4">
              <div>
                <h1 className="text-3xl font-bold text-gray-800 dark:text-white mb-2">
                  {product.name}
                </h1>
                <div className="flex items-center space-x-4 mb-4">
                  <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                    product.stock > 0 
                      ? 'bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200'
                      : 'bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200'
                  }`}>
                    {product.stock > 0 ? `In Stock (${product.stock} available)` : 'Out of Stock'}
                  </span>
                  <span className="text-gray-600 dark:text-gray-400 text-sm">
                    Category: {product.category.name}
                  </span>
                </div>
              </div>
              
              {/* Action Buttons */}
              <div className="flex space-x-2">
                <motion.button
                  onClick={() => setIsFavorite(!isFavorite)}
                  className={`p-3 rounded-full transition-colors ${
                    isFavorite 
                      ? 'bg-red-100 dark:bg-red-900 text-red-600 dark:text-red-400' 
                      : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-600'
                  }`}
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                >
                  <FaHeart />
                </motion.button>
                <motion.button
                  onClick={handleShare}
                  className="bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-600 p-3 rounded-full transition-colors"
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                >
                  <FaShare />
                </motion.button>
              </div>
            </div>

            {/* Price */}
            <div className="mb-6 bg-gradient-to-r from-[#f89b64]/20 to-[#f47a45]/20 dark:from-gray-800 dark:to-gray-700 p-6 rounded-2xl">
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Price</p>
              <p className="text-4xl md:text-5xl font-bold text-[#f47a45] dark:text-[#f7a16b]">
                ₦{product.price.toLocaleString()}
              </p>
            </div>

            {/* Description */}
            <div className="mb-6">
              <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-3">
                Description
              </h3>
              <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
                {product.description}
              </p>
            </div>

            {/* Specifications */}
            {product.specifications && Object.keys(product.specifications).length > 0 && (
              <div className="mb-6">
                <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-3">
                  Specifications
                </h3>
                <div className="space-y-2">
                  {Object.entries(product.specifications).map(([key, value]) => (
                    <div key={key} className="flex justify-between border-b border-gray-200 dark:border-gray-600 pb-2">
                      <span className="text-gray-600 dark:text-gray-400 font-medium">{key}:</span>
                      <span className="text-gray-800 dark:text-white">{value}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Cart Controls */}
            <div className="space-y-4">
              {/* Current Cart Quantity Display */}
              {currentCartQuantity > 0 && (
                <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-3 flex items-center gap-2">
                  <FaCheckCircle className="text-blue-600 dark:text-blue-400" />
                  <span className="text-blue-800 dark:text-blue-300 text-sm font-medium">
                    {currentCartQuantity} item{currentCartQuantity > 1 ? 's' : ''} in cart • 
                    Total: <strong>₦{(product.price * currentCartQuantity).toLocaleString()}</strong>
                  </span>
                </div>
              )}

              {/* Quantity Controls */}
              {currentCartQuantity > 0 && (
                <div className="flex items-center space-x-4">
                  <span className="text-gray-800 dark:text-white font-medium">Quantity in cart:</span>
                  <div className="flex items-center space-x-3">
                    <motion.button
                      onClick={handleDecrement}
                      className="w-10 h-10 rounded-full bg-gray-100 dark:bg-gray-700 flex items-center justify-center text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                    >
                      <FaMinus size={12} />
                    </motion.button>
                    
                    <span className="w-12 text-center text-lg font-semibold text-gray-800 dark:text-white">
                      {currentCartQuantity}
                    </span>
                    
                    <motion.button
                      onClick={handleIncrement}
                      className="w-10 h-10 rounded-full bg-gray-100 dark:bg-gray-700 flex items-center justify-center text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      disabled={!canAddMore}
                    >
                      <FaPlus size={12} />
                    </motion.button>
                  </div>
                  
                  {!canAddMore && (
                    <span className="text-sm text-red-500 dark:text-red-400">
                      Max stock reached
                    </span>
                  )}
                </div>
              )}

              {/* Action Buttons */}
              <div className="space-y-3">
                <div className="flex flex-col sm:flex-row gap-4">
                  {/* Order Button (Add to Cart) */}
                  <motion.button
                    onClick={currentCartQuantity > 0 ? handleIncrement : handleAddToCart}
                    disabled={product.stock === 0 || (currentCartQuantity > 0 && !canAddMore)}
                    className={`flex-1 flex items-center justify-center gap-2 px-6 py-4 rounded-xl font-bold transition-all ${
                      product.stock === 0 || (currentCartQuantity > 0 && !canAddMore)
                        ? 'bg-gray-400 dark:bg-gray-600 text-gray-200 cursor-not-allowed'
                        : 'bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-200 border-2 border-[#f47a45] dark:border-[#f7a16b] hover:bg-[#f47a45]/10 dark:hover:bg-[#f7a16b]/10'
                    }`}
                    whileHover={product.stock > 0 && (currentCartQuantity === 0 || canAddMore) ? { scale: 1.02 } : {}}
                    whileTap={product.stock > 0 && (currentCartQuantity === 0 || canAddMore) ? { scale: 0.98 } : {}}
                  >
                    <FaShoppingCart />
                    {currentCartQuantity > 0 ? 'Add More' : 'Order'}
                  </motion.button>

                  {/* Pay Button (Open Cart) */}
                  <motion.button
                    onClick={handleBuyNow}
                    disabled={product.stock === 0}
                    className="flex-1 px-6 py-4 bg-gradient-to-r from-[#f89b64] to-[#f47a45] dark:from-[#f7a16b] dark:to-[#f47a45] text-white rounded-xl font-bold hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    Pay
                  </motion.button>
                </div>
              </div>

              {/* Stock Warning */}
              {product.stock < 10 && product.stock > 0 && (
                <p className="text-orange-600 dark:text-orange-400 text-sm text-center">
                  Only {product.stock} left in stock!
                </p>
              )}
            </div>
          </motion.div>
        </div>

        {/* Related Products Section */}
        <motion.div
          className="mt-12"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
        >
          <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-6">
            You May Also Like
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {products
              .filter(p => p._id !== product._id && p.category._id === product.category._id)
              .slice(0, 4)
              .map(relatedProduct => (
                <motion.div
                  key={relatedProduct._id}
                  className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-300 cursor-pointer"
                  whileHover={{ y: -5 }}
                  onClick={() => router.push(`/home-items/${relatedProduct._id}`)}
                >
                  <img
                    src={relatedProduct.images[0] || '/assets/images/placeholder-home-item.jpg'}
                    alt={relatedProduct.name}
                    className="w-full h-48 object-cover"
                  />
                  <div className="p-4">
                    <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-2">
                      {relatedProduct.name}
                    </h3>
                    <p className="text-[#f58c55] font-bold text-lg">
                      ₦{relatedProduct.price.toLocaleString()}
                    </p>
                  </div>
                </motion.div>
              ))}
          </div>
        </motion.div>
      </div>

      {/* Toast Notifications */}
      <Toast
        message={toast.message}
        type={toast.type}
        isVisible={toast.isVisible}
        onClose={() => setToast(prev => ({ ...prev, isVisible: false }))}
      />
    </div>
  );
};

export default HomeItemDetail;