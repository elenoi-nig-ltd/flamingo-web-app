'use client';

import React, { useState, useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { FaSearch, FaBars, FaTimes, FaShoppingCart } from 'react-icons/fa';
import FoodSidebar from './FoodSidebar';
import ProductGrid from './ProductGrid';
import Cart from './Cart';
import { useCart } from '@/hooks/useCart';
import Toast from '@/components/ui/Toast';
import Header from '../Header';
import axios from 'axios';
import { BASEURL } from '@/config/api/contants';

interface FoodInterfaceProps {
  // Add any props if needed
}

interface Product {
  _id: string;
  name: string;
  description: string;
  price: number;
  images: string[];
  category: string | { _id: string; name: string; description: string }; // Can be ID or populated object
  inStock: boolean;
}

interface Category {
  _id: string;
  name: string;
  description: string;
}

const FoodInterface: React.FC<FoodInterfaceProps> = () => {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [selectedCategoryId, setSelectedCategoryId] = useState<string | null>(searchParams.get('category'));
  const [selectedCategoryName, setSelectedCategoryName] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
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

  // Update selectedCategoryId when searchParams change
  useEffect(() => {
    const currentId = searchParams.get('category');
    setSelectedCategoryId(currentId);
  }, [searchParams]);

  // Fetch categories
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await axios.get(`${BASEURL}/categories`);
        const categoriesData = response.data.categories || response.data;
        setCategories(categoriesData);
      } catch (err) {
        console.error('Error fetching categories:', err);
        setError('Failed to fetch categories');
      }
    };

    fetchCategories();
  }, []);

  // Update selected category name based on ID
  useEffect(() => {
    if (selectedCategoryId && categories.length > 0) {
      const category = categories.find(cat => cat._id === selectedCategoryId);
      if (category) {
        setSelectedCategoryName(category.name);
      } else {
        setSelectedCategoryName('All');
        setSelectedCategoryId(null);
      }
    } else {
      setSelectedCategoryName('All');
      setSelectedCategoryId(null);
    }
  }, [selectedCategoryId, categories]);

  // Fetch products based on selected category
  useEffect(() => {
    const fetchProductsData = async () => {
      try {
        setLoading(true);
        setError(null);

        let productsData;

        if (selectedCategoryId && selectedCategoryId !== 'All') {
          // Fetch products by category
          console.log('Fetching products for category:', selectedCategoryId);
          const response = await axios.get(`${BASEURL}/products`, {
            params: {
              category: selectedCategoryId,
            },
          });
          productsData = response.data.products || response.data;
          console.log('Products by category:', productsData);
        } else {
          // Fetch all products
          console.log('Fetching all products');
          const response = await axios.get(`${BASEURL}/products`);
          productsData = response.data.products || response.data;
          console.log('All products:', productsData);
        }

        setProducts(productsData || []);
        
      } catch (err: any) {
        console.error('Error fetching products:', err);
        const errorMessage = err.response?.data?.message || err.message || 'Failed to fetch products';
        setError(errorMessage);
        setToast({
          message: 'Failed to load products',
          type: 'error',
          isVisible: true
        });
      } finally {
        setLoading(false);
      }
    };

    fetchProductsData();
  }, [selectedCategoryId]);

  const handleCategorySelect = (categoryName: string, categoryId?: string) => {
    console.log('Category selected:', categoryName, 'ID:', categoryId);
    setSelectedCategoryName(categoryName);
    setSelectedCategoryId(categoryId || null);
    
    // Navigate to food page with category filter
    if (categoryId) {
      router.push(`/food?category=${categoryId}`);
    } else {
      router.push('/food');
    }
    
    // Close sidebar on mobile after selection
    if (window.innerWidth < 1024) {
      setIsSidebarOpen(false);
    }
  };

  const handleAddToCart = (product: { id: string; name: string; image: string; price: number }) => {
    addToCart(product);
    setToast({
      message: 'Food ordered',
      type: 'success',
      isVisible: true
    });
  };

  const handleRemoveFromCart = (productId: string) => {
    const item = cartItems.find(item => item.id === productId);
    removeFromCart(productId);
    if (item) {
      setToast({
        message: `${item.name} removed from the order`,
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
        const searchInput = document.querySelector('input[placeholder="Search for food..."]') as HTMLInputElement;
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

  const handleOrderSuccess = () => {
    setToast({
      message: '🎉 Congratulations! You\'ve received a free bottle of water with your order!',
      type: 'success',
      isVisible: true
    });
  };

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900">
      {/* Header */}
      <Header />
      
      {/* Main Content */}
      <div className="flex relative pt-24">
        {/* Sidebar */}
        <div className={`fixed inset-y-0 left-0 z-40 w-64 bg-black dark:bg-gray-800 transform ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0 transition-transform duration-300 ease-in-out`}>
          <FoodSidebar
            isOpen={isSidebarOpen}
            selectedCategory={selectedCategoryName}
            selectedCategoryId={selectedCategoryId}
            onCategorySelect={handleCategorySelect}
            onClose={() => setIsSidebarOpen(false)}
            categories={categories}
          />
        </div>
        
        {/* Overlay for mobile */}
        {isSidebarOpen && (
          <div 
            className="fixed inset-0 z-30 lg:hidden bg-black/50 dark:bg-black/70"
            onClick={() => setIsSidebarOpen(false)}
          />
        )}

        {/* Main Content Area */}
        <div className="flex-1 lg:ml-64">
          {/* Top Navigation Bar */}
          <div className="w-full px-4 sm:px-6 lg:px-8 mb-6">
            <div className="flex items-center justify-between">
              {/* Mobile menu button */}
              <button
                onClick={toggleSidebar}
                className="lg:hidden p-2 rounded-md text-gray-700 dark:text-gray-300 hover:text-white dark:hover:text-gray-100 hover:bg-gray-800 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-white dark:focus:ring-gray-300"
              >
                {isSidebarOpen ? <FaTimes size={20} /> : <FaBars size={20} />}
              </button>

              {/* Search Bar */}
              <div className="flex-1 max-w-2xl mx-4">
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <FaSearch className="h-4 w-4 text-gray-400 dark:text-gray-500" />
                  </div>
                  <input
                    type="text"
                    placeholder="Search for food..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="block w-full pl-10 pr-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 text-sm dark:text-gray-100"
                  />
                  <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
                    <kbd className="hidden sm:inline-flex items-center px-2 py-1 bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400 text-xs rounded border dark:border-gray-600">
                      ⌘K
                    </kbd>
                  </div>
                </div>
              </div>

              {/* Cart Button */}
              <button
                onClick={toggleCart}
                className="relative flex items-center px-4 py-2 rounded-md bg-[#f58c55] text-white hover:bg-green-500 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2 dark:focus:ring-offset-gray-900 transition-colors"
              >
                <FaShoppingCart size={16} className="mr-2" />
                <span>Orders</span>
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
            {loading ? (
              <div className="flex justify-center items-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500"></div>
              </div>
            ) : error ? (
              <div className="text-center py-12 bg-red-50 dark:bg-red-900/20 rounded-lg">
                <p className="text-red-600 dark:text-red-500">Network error. Please, try again later</p>
                <button
                  onClick={() => window.location.reload()}
                  className="mt-4 bg-orange-500 text-white px-4 py-2 rounded hover:bg-orange-600"
                >
                  Try Again
                </button>
              </div>
            ) : (
              <ProductGrid
                products={products}
                selectedCategory={selectedCategoryName}
                selectedCategoryId={selectedCategoryId}
                searchQuery={searchQuery}
                onAddToCart={handleAddToCart}
              />
            )}
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
        onOrderSuccess={handleOrderSuccess}
      />

      {/* Success test button */}
      {/* {process.env.NODE_ENV === 'development' && (
        <button
          onClick={handleOrderSuccess}
          className="fixed bottom-4 left-4 bg-blue-500 text-white px-4 py-2 rounded text-sm z-40"
        >
          Test Free Water Alert
        </button>
      )} */}
      
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

export default FoodInterface;