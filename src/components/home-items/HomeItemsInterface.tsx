'use client';

import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { FaSearch, FaBars, FaTimes, FaShoppingCart } from 'react-icons/fa';
import HomeItemsSidebar from './HomeItemsSidebar';
import HomeItemsProductGrid from './HomeItemsProductGrid';
import Cart from '../food/Cart';
import { useCart } from '@/hooks/useCart';
import Toast from '@/components/ui/Toast';
import Header from '../Header';

interface HomeItemsInterfaceProps {
  // Add any props if needed
}

const HomeItemsInterface: React.FC<HomeItemsInterfaceProps> = () => {
  const searchParams = useSearchParams();
  const categoryIdFromUrl = searchParams.get('category');
  
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedCategoryId, setSelectedCategoryId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
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
  
  const {
    cartItems,
    addToCart,
    removeFromCart,
    updateQuantity,
    clearCart,
    totalItems,
    totalPrice
  } = useCart();

  // Update selected category when URL parameter changes
  useEffect(() => {
    if (categoryIdFromUrl) {
      setSelectedCategoryId(categoryIdFromUrl);
      // selectedCategory name will be updated by the sidebar component
    } else {
      setSelectedCategoryId(null);
      setSelectedCategory('All');
    }
  }, [categoryIdFromUrl]);

  const handleCategorySelect = (category: string, categoryId?: string) => {
    setSelectedCategory(category);
    setSelectedCategoryId(categoryId || null);
  };

  const handleAddToCart = (product: { id: string; name: string; image: string; price: number }) => {
    addToCart(product);
    setToast({
      message: `${product.name} added to cart!`,
      type: 'success',
      isVisible: true
    });
  };

  const handleRemoveFromCart = (productId: string) => {
    const item = cartItems.find(item => item.id === productId);
    removeFromCart(productId);
    if (item) {
      setToast({
        message: `${item.name} removed from cart`,
        type: 'info',
        isVisible: true
      });
    }
  };

  const handleUpdateQuantity = (productId: string, quantity: number) => {
    const item = cartItems.find(item => item.id === productId);
    updateQuantity(productId, quantity);
    if (item && quantity > 0) {
      setToast({
        message: `${item.name} quantity updated to ${quantity}`,
        type: 'info',
        isVisible: true
      });
    }
  };

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  const toggleCart = () => {
    setIsCartOpen(!isCartOpen);
  };

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyPress = (event: KeyboardEvent) => {
      // Ctrl/Cmd + K to focus search
      if ((event.ctrlKey || event.metaKey) && event.key === 'k') {
        event.preventDefault();
        const searchInput = document.querySelector('input[placeholder="Search for home items..."]') as HTMLInputElement;
        if (searchInput) {
          searchInput.focus();
        }
      }
      
      // Escape to close cart/sidebar
      if (event.key === 'Escape') {
        if (isCartOpen) {
          setIsCartOpen(false);
        }
        if (isSidebarOpen) {
          setIsSidebarOpen(false);
        }
      }
      
      // Ctrl/Cmd + B to toggle cart
      if ((event.ctrlKey || event.metaKey) && event.key === 'b') {
        event.preventDefault();
        setIsCartOpen(!isCartOpen);
      }
    };

    document.addEventListener('keydown', handleKeyPress);
    return () => document.removeEventListener('keydown', handleKeyPress);
  }, [isCartOpen, isSidebarOpen]);

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900">
      {/* Header */}
      <Header />
      
      {/* Main Content */}
      <div className="flex relative pt-24">
        {/* Sidebar - Transparent on mobile, black on desktop */}
        <div className={`fixed inset-y-0 left-0 z-40 w-64 ${isSidebarOpen ? 'bg-transparent' : 'bg-gray-900 dark:bg-gray-800'} transform ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'} lg:bg-gray-900 dark:lg:bg-gray-800 lg:translate-x-0 transition-transform duration-300 ease-in-out`}>
          <HomeItemsSidebar
            isOpen={isSidebarOpen}
            selectedCategory={selectedCategory}
            selectedCategoryId={selectedCategoryId}
            onCategorySelect={handleCategorySelect}
            onClose={() => setIsSidebarOpen(false)}
          />
        </div>
        
        {/* Overlay for mobile */}
        {isSidebarOpen && (
          <div 
            className="fixed inset-0 z-30 lg:hidden bg-black/50 dark:bg-gray-900/50"
            onClick={() => setIsSidebarOpen(false)}
          />
        )}

        {/* Main Content Area */}
        <div className="flex-1 lg:ml-64">
          {/* Top Navigation Bar */}
          <div className="w-full px-4 sm:px-6 lg:px-8 mb-6">
            <div className="flex items-center justify-between">
              {/* Mobile menu button - Left */}
              <button
                onClick={toggleSidebar}
                className="lg:hidden p-2 rounded-md text-gray-700 dark:text-gray-300 hover:text-white dark:hover:text-gray-100 hover:bg-gray-800 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-white dark:focus:ring-gray-900"
              >
                {isSidebarOpen ? <FaTimes size={20} /> : <FaBars size={20} />}
              </button>

              {/* Search Bar - Center */}
              <div className="flex-1 max-w-2xl mx-4">
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <FaSearch className="h-4 w-4 text-gray-400 dark:text-gray-500" />
                  </div>
                  <input
                    type="text"
                    placeholder="Search for home items..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="block w-full pl-10 pr-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 dark:text-gray-100 text-sm"
                  />
                  <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
                    <kbd className="hidden sm:inline-flex items-center px-2 py-1 bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400 text-xs rounded border dark:border-gray-600">
                      ⌘K
                    </kbd>
                  </div>
                </div>
              </div>

              {/* Cart Button - Right */}
              <button
                onClick={toggleCart}
                className="relative flex items-center px-4 py-2 rounded-md bg-[#f58c55] text-white hover:bg-green-500 focus:outline-none focus:ring-2 focus:ring-[#f58c55] focus:ring-offset-2 dark:focus:ring-offset-gray-900 transition-colors"
              >
                <FaShoppingCart size={16} className="mr-2" />
                <span>Cart</span>
                {totalItems > 0 && (
                  <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full h-6 w-6 flex items-center justify-center">
                    {totalItems}
                  </span>
                )}
              </button>
            </div>
          </div>

          {/* Product Grid */}
          <div className="px-4 sm:px-6 lg:px-8">
            <HomeItemsProductGrid
              selectedCategory={selectedCategory}
              selectedCategoryId={selectedCategoryId}
              searchQuery={searchQuery}
              onAddToCart={handleAddToCart}
            />
          </div>
        </div>
      </div>

      {/* Cart Sidebar */}
      <Cart
        isOpen={isCartOpen}
        items={cartItems}
        totalPrice={totalPrice}
        onClose={() => setIsCartOpen(false)}
        onRemoveItem={handleRemoveFromCart}
        onUpdateQuantity={handleUpdateQuantity}
        onClearCart={clearCart}
      />
      
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

export default HomeItemsInterface;