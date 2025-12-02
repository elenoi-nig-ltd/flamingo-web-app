"use client";
import React, { useState, useEffect, useMemo, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { PlusCircle, ChevronRight, Search, X } from 'lucide-react';
import Head from 'next/head';
import Image from 'next/image';
import SkeletonLoader from '@/components/SkeletonLoader';
import { usePublicCategories, usePublicProducts } from '@/hooks/usePublic';
import { useRealEstates } from '@/hooks/useRealEstates';
import { useHomeItemCategories } from '@/hooks/useHomeItemCategories';
import axios from 'axios';
import { BASEURL } from '@/config/api/contants';

/* -----------------------------------------------------------------
   NEW HOOK – useHomeItems (public fetch only)
   ----------------------------------------------------------------- */
interface HomeItem {
  _id: string;
  name: string;
  description?: string;
  price: number;
  images?: string[];
  category?: { _id: string; name: string };
}
interface UseHomeItemsReturn {
  homeItems: HomeItem[];
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}
const useHomeItems = (): UseHomeItemsReturn => {
  const [homeItems, setHomeItems] = useState<HomeItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const fetchHomeItems = async () => {
    setLoading(true);
    try {
      const response = await axios.get(`${BASEURL}/home-items`);
      const data = Array.isArray(response.data) ? response.data : [];
      setHomeItems(data);
      setError(null);
    } catch (err: any) {
      console.error('Error fetching home items:', err);
      setError(err.response?.data?.message || err.message || 'Failed to fetch home items');
      setHomeItems([]);
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => {
    fetchHomeItems();
  }, []);
  return { homeItems, loading, error, refetch: fetchHomeItems };
};

/* -----------------------------------------------------------------
   MAIN COMPONENT
   ----------------------------------------------------------------- */
interface Category {
  _id: string;
  name: string;
  description: string;
  createdAt?: string;
  updatedAt?: string;
}
interface Product {
  _id: string;
  name: string;
  description: string;
  price: number;
  category: string | Category;
  stock: number;
  images?: string[];
}
interface RealEstate {
  id: string;
  _id?: string;
  title: string;
  price: number;
  amount?: number;
  address: string;
  location?: string;
  images?: string[];
  image?: string[];
  bedrooms?: number;
  bathrooms?: number;
  description?: string;
}

// === DISCOUNT MARQUEE ===
const DiscountMarquee = () => {
  const text = "* 10% discount on all items this December *";
  return (
    <div className="bg-gradient-to-r from-orange-500 to-amber-500 mt-20 via-orange-600 to-red-700 text-white overflow-hidden py-3 shadow-md">
      <div className="flex">
        <div className="animate-marquee-inline flex whitespace-nowrap">
          <span className="mx-8 text-lg font-bold tracking-wide">{text}</span>
          <span className="mx-8 text-lg font-bold tracking-wide">{text}</span>
          <span className="mx-8 text-lg font-bold tracking-wide">{text}</span>
          <span className="mx-8 text-lg font-bold tracking-wide">{text}</span>
        </div>
      </div>
    </div>
  );
};

// === ROTATING WORDS ===
const RotatingWords = () => {
  const words = ['Food','Internet', 'Appliances', 'Household items', 'Housing', 'Fast Delivery'];
  const [index, setIndex] = useState(0);
  const [showFinal, setShowFinal] = useState(false);
  const [isVisible, setIsVisible] = useState(true);
 
  useEffect(() => {
    if (index < words.length) {
      const fadeOut = setTimeout(() => setIsVisible(false), 800);
      const changeWord = setTimeout(() => {
        setIndex(index + 1);
        setIsVisible(true);
      }, 1000);
      return () => { clearTimeout(fadeOut); clearTimeout(changeWord); };
    } else if (index === words.length && !showFinal) {
      const fadeOut = setTimeout(() => setIsVisible(false), 800);
      const showFinalMsg = setTimeout(() => { setShowFinal(true); setIsVisible(true); }, 1000);
      return () => { clearTimeout(fadeOut); clearTimeout(showFinalMsg); };
    } else if (showFinal) {
      const fadeOut = setTimeout(() => setIsVisible(false), 2800);
      const reset = setTimeout(() => { setIndex(0); setShowFinal(false); setIsVisible(true); }, 3000);
      return () => { clearTimeout(fadeOut); clearTimeout(reset); };
    }
  }, [index, showFinal]);
 
  return (
    <div className="mt-6 text-center">
      <div style={{ opacity: isVisible ? 1 : 0, transition: 'opacity 0.4s ease-in-out', minHeight: '60px' }}>
        {index < words.length ? (
          <p className="text-xl md:text-2xl font-bold text-white">
            Nigeria's No.1 Student Platform for{' '}
            <span className="inline-block min-w-[220px] text-left text-yellow-300">
              {words[index]}
            </span>
          </p>
        ) : showFinal ? (
          <p className="text-2xl md:text-3xl font-bold text-amber-300">
            An atmosphere of good feelings
          </p>
        ) : null}
      </div>
    </div>
  );
};

export default function LandingPage() {
  const router = useRouter();
  // Existing hooks
  const { fetchCategories, loading: categoriesLoading } = usePublicCategories();
  const { getProductsByCategory, fetchProducts } = usePublicProducts();
  const { realEstates, loading: realEstatesLoading, error: realEstatesError } = useRealEstates({ fetchMode: 'public' });
  const { categories: homeItemCategories, loading: homeItemCategoriesLoading } = useHomeItemCategories();
  // NEW: Home items
  const { homeItems, loading: homeItemsLoading } = useHomeItems();
  const [dynamicCategories, setDynamicCategories] = useState<Category[]>([]);
  const [hoveredCategory, setHoveredCategory] = useState<string | null>(null);
  const [categoryProducts, setCategoryProducts] = useState<Record<string, Product[]>>({});
  const [loadingProducts, setLoadingProducts] = useState<Record<string, boolean>>({});
  const [allProducts, setAllProducts] = useState<Product[]>([]);
  // Search state
  const [searchQuery, setSearchQuery] = useState('');
  const [searchOpen, setSearchOpen] = useState(false);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const categoryIconMap: Record<string, string> = {
    'Furnitures': '/assets/images/categories/furniture.png',
    'Furniture': '/assets/images/categories/furniture.png',
    'Beddings': '/assets/images/categories/beddings.png',
    'Bedding': '/assets/images/categories/beddings.png',
    'Utensils': '/assets/images/categories/utensils.png',
    'Snacks': '/assets/images/categories/snacks.png',
    'Snack': '/assets/images/categories/snacks.png',
    'Drinks': '/assets/images/categories/drinks.png',
    'Drink': '/assets/images/categories/drinks.png',
    'Beverages': '/assets/images/categories/drinks.png',
    'Mattress': '/assets/images/categories/mattress.png',
    'Mattresses': '/assets/images/categories/mattress.png',
    'Vehicles': '/assets/images/categories/vehicles.png',
    'Vehicle': '/assets/images/categories/vehicles.png',
    'Content Creation': '/assets/images/categories/content.png',
    'Content': '/assets/images/categories/content.png',
    'Food': '/assets/images/categories/food.png',
    'Foods': '/assets/images/categories/food.png',
    'Office Chairs': '/assets/images/categories/office.png',
    'Office': '/assets/images/categories/office.png',
  };

  /* --------------------------------------------------------------
     DATA FETCHING
     -------------------------------------------------------------- */
  useEffect(() => {
    const loadCategories = async () => {
      try {
        const response = await fetchCategories();
        setDynamicCategories(response.categories);
      } catch (err) { console.error('Failed to fetch categories:', err); }
    };
    loadCategories();
  }, []);
  useEffect(() => {
    const loadAllProducts = async () => {
      try {
        const response = await fetchProducts({ limit: 1000 });
        setAllProducts(response.products);
      } catch (err) { console.error('Failed to fetch all products:', err); }
    };
    loadAllProducts();
  }, []);

  /* --------------------------------------------------------------
     CATEGORY HOVER LOGIC (unchanged)
     -------------------------------------------------------------- */
  const handleCategoryHover = async (categoryId: string) => {
    setHoveredCategory(categoryId);
    if (categoryProducts[categoryId]) return;
    setLoadingProducts(prev => ({ ...prev, [categoryId]: true }));
    try {
      const response = await getProductsByCategory(categoryId, { limit: 8 });
      let products = response.products || [];
      const filteredProducts = products.filter(product => {
        const productCategoryId = typeof product.category === 'string'
          ? product.category
          : product.category._id;
        return productCategoryId === categoryId;
      });
      setCategoryProducts(prev => ({
        ...prev,
        [categoryId]: filteredProducts.length > 0
          ? filteredProducts.slice(0, 8)
          : allProducts.filter(p => {
              const id = typeof p.category === 'string' ? p.category : p.category._id;
              return id === categoryId;
            }).slice(0, 8)
      }));
    } catch (err) {
      console.error('Failed to fetch products:', err);
    } finally {
      setLoadingProducts(prev => ({ ...prev, [categoryId]: false }));
    }
  };
  const getProductCategoryId = (product: Product): string => {
    return typeof product.category === 'string' ? product.category : product.category._id;
  };
  const getCategoryIcon = (categoryName: string): string => {
    if (categoryIconMap[categoryName]) return categoryIconMap[categoryName];
    const normalizedName = categoryName.toLowerCase();
    for (const [key, value] of Object.entries(categoryIconMap)) {
      if (key.toLowerCase() === normalizedName) return value;
    }
    return '/assets/images/categories/furniture.png';
  };
  const getCategoryIconForHomeItems = (categoryName: string): string | null => {
    if (categoryIconMap[categoryName]) return categoryIconMap[categoryName];
    const normalizedName = categoryName.toLowerCase();
    for (const [key, value] of Object.entries(categoryIconMap)) {
      if (key.toLowerCase() === normalizedName || normalizedName.includes(key.toLowerCase())) {
        return value;
      }
    }
    return null;
  };
  const cards = [
    { icon: '/assets/images/card/food-order.png', label: 'Order Food', route: '/food' },
    { icon: '/assets/images/card/household.png', label: 'Household Items', route: '/home-items' },
    { icon: '/assets/images/card/properties.png', label: 'Properties', route: '/real-estates' },
    { icon: '/assets/images/card/internet.png', label: 'Internet', route: '/internet' },
  ];
  const handleCardClick = (route: string) => router.push(route);
  const handleCategoryClick = (categoryId: string) => router.push(`/food?category=${categoryId}`);
  const handleProductClick = (productId: string, productName: string) => {
    const slug = productName.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
    router.push(`/${slug}/${productId}`);
  };
  const handleRealEstateClick = (realEstateId: string, title: string) => router.push(`/real-estates/${realEstateId}`);
  const handleHomeItemCategoryClick = (categoryId: string) => router.push(`/home-items?category=${categoryId}`);
  // NEW: Home item & property navigation
  const handleHomeItemClick = (itemId: string) => {
    router.push(`/home-items/${itemId}`);
  };

  /* --------------------------------------------------------------
     SEARCH INDEX – now includes Home Items + Properties
     -------------------------------------------------------------- */
  const searchableItems = useMemo(() => {
    const items: {
      id: string;
      name: string;
      type: 'category' | 'product' | 'homeItem' | 'property';
      price?: number;
      image?: string;
      subtitle?: string;
    }[] = [];
    // Categories
    dynamicCategories.forEach(cat => {
      items.push({ id: cat._id, name: cat.name, type: 'category' });
    });
    // Products
    allProducts.forEach(p => {
      items.push({
        id: p._id,
        name: p.name,
        type: 'product',
        price: p.price,
        image: p.images?.[0],
      });
    });
    // Home Items
    homeItems.forEach(item => {
      items.push({
        id: item._id,
        name: item.name,
        type: 'homeItem',
        price: item.price,
        image: item.images?.[0],
      });
    });
    // Properties (Real Estates)
    realEstates.forEach(estate => {
      const id = estate.id ;
      if (!id) return;
      const title = estate.title || 'Untitled Property';
      const address = estate.address || '';
      const price = estate.price || 0;
      const image = (estate.images?.[0] ) || '/assets/images/placeholder.png';
      items.push({
        id,
        name: title,
        type: 'property',
        price,
        image,
        subtitle: address,
      });
    });
    return items;
  }, [dynamicCategories, allProducts, homeItems, realEstates]);

  const filteredResults = useMemo(() => {
    if (!searchQuery.trim()) return [];
    const q = searchQuery.toLowerCase();
    return searchableItems
      .filter(i =>
        i.name.toLowerCase().includes(q) ||
        (i.subtitle && i.subtitle.toLowerCase().includes(q))
      )
      .slice(0, 12);
  }, [searchQuery, searchableItems]);

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (searchInputRef.current && !searchInputRef.current.contains(e.target as Node)) {
        setSearchOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <>
      <Head>
        <link href="https://fonts.googleapis.com/css2?family=Parisienne&display=swap" rel="stylesheet" />
        {/* Critical viewport fix for mobile */}
        <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no" />
      </Head>

      <DiscountMarquee />

      {/* GLOBAL FIX: Prevent any horizontal scroll / drag on mobile */}
      <div className="min-h-screen bg-[#f8f5e6] dark:bg-gray-900 transition-colors duration-300 overflow-x-hidden">
        {/* WELCOME SECTION */}
        <section className="w-full bg-gradient-to-r from-[#f89b64] dark:from-gray-800 to-[#f47a45] dark:to-gray-700 text-white dark:text-gray-200 text-center py-12 md:py-16 rounded-b-[50px] shadow-lg dark:shadow-gray-900 transition-all duration-300">
          <div className="container mx-auto px-4">
            <h1 className="text-5xl md:text-7xl font-bold mb-2" style={{ fontFamily: 'Parisienne, cursive' }}>
              Welcome to Flamingo
            </h1>
            <RotatingWords />
            <p className="text-lg md:text-xl font-semibold mt-8 tracking-wide">
              What do you want to buy?
            </p>
            <div className="flex flex-col md:flex-row justify-center gap-4 px-4 mt-6">
              {categoriesLoading ? (
                <>
                  <SkeletonLoader variant="search" className="w-full md:w-48" animate={true} />
                  <SkeletonLoader variant="search" className="w-full md:w-72" animate={true} />
                </>
              ) : (
                <>
                  <select className="px-5 py-3 rounded-lg bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-[#f7a16b] dark:focus:ring-orange-400 w-full md:w-48 font-medium transition border border-gray-300 dark:border-gray-600">
                    <option>All Nigeria...</option>
                  </select>
                  {/* LIVE SEARCH BAR */}
                  <div className="relative w-full md:w-72" ref={searchInputRef}>
                    <div className="flex items-center gap-2 bg-white dark:bg-gray-800 rounded-lg border border-gray-300 dark:border-gray-600 focus-within:ring-2 focus-within:ring-[#f7a16b] dark:focus-within:ring-orange-400 transition">
                      <Search className="ml-3 w-5 h-5 text-gray-500" />
                      <input
                        type="text"
                        value={searchQuery}
                        onChange={e => setSearchQuery(e.target.value)}
                        onFocus={() => setSearchOpen(true)}
                        placeholder="I am looking for..."
                        className="flex-1 px-3 py-3 bg-transparent text-gray-800 dark:text-gray-200 placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none"
                      />
                      {searchQuery && (
                        <button
                          onClick={() => { setSearchQuery(''); setSearchOpen(false); }}
                          className="mr-3 text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
                        >
                          <X className="w-5 h-5" />
                        </button>
                      )}
                    </div>
                    {/* RESULTS DROPDOWN */}
                    {searchOpen && filteredResults.length > 0 && (
                      <div
                        className="absolute left-0 right-0 mt-2 bg-white dark:bg-gray-800 rounded-lg shadow-xl border border-gray-200 dark:border-gray-700 max-h-96 overflow-y-auto z-50"
                        onMouseDown={e => e.preventDefault()}
                      >
                        {filteredResults.map((item) => (
                          <div
                            key={item.id}
                            onClick={() => {
                              if (item.type === 'product') {
                                handleProductClick(item.id, item.name);
                              } else if (item.type === 'category') {
                                handleCategoryClick(item.id);
                              } else if (item.type === 'homeItem') {
                                handleHomeItemClick(item.id);
                              } else if (item.type === 'property') {
                                handleRealEstateClick(item.id, item.name);
                              }
                              setSearchQuery('');
                              setSearchOpen(false);
                            }}
                            className="flex items-center gap-3 p-3 hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer transition"
                          >
                            {item.image ? (
                              <div className="w-10 h-10 relative flex-shrink-0">
                                <Image
                                  src={item.image}
                                  alt={item.name}
                                  width={40}
                                  height={40}
                                  className="object-cover rounded"
                                />
                              </div>
                            ) : (
                              <div className="w-10 h-10 bg-gradient-to-br from-[#f89b64] to-[#f47a45] rounded flex items-center justify-center text-white font-bold">
                                {item.name[0]}
                              </div>
                            )}
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-medium text-gray-800 dark:text-gray-200 truncate">
                                {item.name}
                              </p>
                              {item.subtitle && (
                                <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                                  {item.subtitle}
                                </p>
                              )}
                              {item.price !== undefined && (
                                <p className="text-xs text-[#f47a45] dark:text-[#f7a16b] font-bold">
                                  ₦{item.price.toLocaleString()}
                                </p>
                              )}
                              <p className="text-xs text-gray-500 dark:text-gray-400">
                                {item.type === 'property' ? 'Property' :
                                 item.type === 'homeItem' ? 'Home Item' :
                                 item.type === 'product' ? 'Product' : 'Category'}
                              </p>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                    {/* NO RESULTS */}
                    {searchOpen && searchQuery && filteredResults.length === 0 && (
                      <div className="absolute left-0 right-0 mt-2 p-4 bg-white dark:bg-gray-800 rounded-lg shadow-xl border border-gray-200 dark:border-gray-700 text-center text-gray-600 dark:text-gray-400">
                        No items found
                      </div>
                    )}
                  </div>
                </>
              )}
            </div>
          </div>
        </section>

        {/* MAIN CONTENT */}
        <div className="container  mx-auto px-4 md:px-6 lg:px-8 pt-10 max-w-7xl">
          <div className="flex flex-col lg:flex-row gap-6">
            {/* Sidebar */}
            <aside className="hidden lg:block w-1/4 bg-[#f58c55] dark:bg-gray-800 text-white p-6 rounded-tl-[40px] rounded-bl-[40px] shadow-lg transition-colors duration-300 relative">
              <h2 className="text-3xl font-bold mb-6" style={{ fontFamily: 'Parisienne, cursive' }}>Categories</h2>
              <div className="space-y-3">
                {categoriesLoading ? (
                  Array.from({ length: 8 }).map((_, i) => (
                    <SkeletonLoader key={`cat-skel-${i}`} variant="category" className="w-full" />
                  ))
                ) : dynamicCategories.length > 0 ? (
                  dynamicCategories.map((cat) => (
                    <div
                      key={cat._id}
                      className="relative"
                      onMouseEnter={() => handleCategoryHover(cat._id)}
                      onMouseLeave={() => setHoveredCategory(null)}
                    >
                      <div
                        className="flex items-center justify-between gap-3 p-4 hover:bg-[#f7a16b] dark:hover:bg-gray-700 rounded-xl cursor-pointer transition-all duration-300 hover:scale-105"
                        onClick={() => handleCategoryClick(cat._id)}
                      >
                        <span className="text-lg font-bold text-white tracking-tight">{cat.name}</span>
                        <ChevronRight className="w-4 h-4 text-white opacity-70" />
                      </div>
                      {hoveredCategory === cat._id && (
                        <div
                          className="absolute left-full top-0 ml-2 w-80 bg-white dark:bg-gray-800 rounded-lg shadow-2xl p-4 z-50 border border-gray-200 dark:border-gray-600"
                          onMouseEnter={() => setHoveredCategory(cat._id)}
                          onMouseLeave={() => setHoveredCategory(null)}
                        >
                          {loadingProducts[cat._id] ? (
                            <div className="space-y-3">
                              <SkeletonLoader variant="line" height="20px" width="60%" />
                              <SkeletonLoader variant="line" height="14px" width="80%" className="mt-2" />
                              {Array.from({ length: 6 }).map((_, i) => (
                                <div key={i} className="flex items-center gap-3 p-2">
                                  <SkeletonLoader variant="image" width="48px" height="48px" />
                                  <div className="flex-1 space-y-1">
                                    <SkeletonLoader variant="line" height="14px" width="80%" />
                                    <SkeletonLoader variant="line" height="12px" width="40%" />
                                  </div>
                                </div>
                              ))}
                            </div>
                          ) : (
                            <>
                              <div className="mb-3 pb-3 border-b border-gray-200 dark:border-gray-600">
                                <h3 className="text-lg font-bold text-gray-800 dark:text-gray-200">{cat.name}</h3>
                                <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                                  {cat.description || 'Browse products in this category'}
                                </p>
                              </div>
                              {categoryProducts[cat._id]?.length > 0 ? (
                                <div className="space-y-2 max-h-96 overflow-y-auto">
                                  {categoryProducts[cat._id].map((product) => {
                                    if (getProductCategoryId(product) !== cat._id) return null;
                                    return (
                                      <div
                                        key={product._id}
                                        className="flex items-center gap-3 p-2 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-lg cursor-pointer transition-all"
                                        onClick={() => handleProductClick(product._id, product.name)}
                                      >
                                        {product.images?.[0] && (
                                          <div className="w-12 h-12 relative flex-shrink-0">
                                            <Image src={product.images[0]} alt={product.name} width={48} height={48} className="object-cover rounded" />
                                          </div>
                                        )}
                                        <div className="flex-1 min-w-0">
                                          <p className="text-sm font-semibold text-gray-800 dark:text-gray-200 truncate">{product.name}</p>
                                          <p className="text-xs text-[#f47a45] dark:text-[#f7a16b] font-bold">₦{product.price.toLocaleString()}</p>
                                        </div>
                                      </div>
                                    );
                                  })}
                                  <button
                                    onClick={() => handleCategoryClick(cat._id)}
                                    className="w-full mt-2 py-2 text-sm font-semibold text-[#f47a45] dark:text-[#f7a16b] hover:bg-gray-50 dark:hover:bg-gray-700 rounded-lg transition-all"
                                  >
                                    View All in {cat.name}
                                  </button>
                                </div>
                              ) : (
                                <p className="text-center py-6 text-gray-600 dark:text-gray-400 text-sm">No products available</p>
                              )}
                            </>
                          )}
                        </div>
                      )}
                    </div>
                  ))
                ) : (
                  <p className="text-center py-4 text-white">No categories available</p>
                )}
              </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 bg-[#f8f5e6] dark:bg-gray-900">
              {/* Cards */}
              <section className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 py-8 justify-items-center">
                {categoriesLoading ? (
                  Array.from({ length: 5 }).map((_, i) => (
                    <SkeletonLoader key={`card-skel-${i}`} variant="card" className="w-full max-w-[208px] h-52" />
                  ))
                ) : (
                  <>
                    {cards.map((card, i) => (
                      <div
                        key={i}
                        className="w-full max-w-[208px] h-52 bg-[#f5f3eb] dark:bg-gray-800 rounded-2xl shadow-md hover:shadow-xl transition-all duration-300 hover:scale-105 flex flex-col items-center justify-center gap-5 border border-[#f0e6d0] dark:border-gray-600 cursor-pointer"
                        onClick={() => handleCardClick(card.route)}
                      >
                        <div className="w-28 h-28 relative">
                          <Image src={card.icon} alt={card.label} width={112} height={112} className="object-contain" />
                        </div>
                        <span className="text-gray-800 dark:text-gray-200 text-lg font-semibold text-center px-4">
                          {card.label}
                        </span>
                      </div>
                    ))}
                    <div
                      className="w-full max-w-[208px] h-52 bg-[#f5f3eb] dark:bg-gray-800 rounded-2xl shadow-md hover:shadow-xl transition-all duration-300 hover:scale-105 flex flex-col items-center justify-center gap-5 border border-[#f0e6d0] dark:border-gray-600 cursor-pointer"
                      onClick={() => handleCardClick('/post-ads')}
                    >
                      <PlusCircle className="text-[#f47a45] dark:text-[#f7a16b] w-20 h-20" />
                      <span className="text-gray-800 dark:text-gray-200 text-lg font-semibold px-4">
                        Post Ads
                      </span>
                    </div>
                  </>
                )}
              </section>

              {/* Mobile Categories */}
              <aside className="lg:hidden">
                <div className="grid grid-cols-2 gap-6 py-8">
                  {homeItemCategoriesLoading ? (
                    Array.from({ length: 10 }).map((_, i) => (
                      <SkeletonLoader key={`mob-cat-${i}`} variant="category" className="w-full h-20" />
                    ))
                  ) : homeItemCategories.length > 0 ? (
                    homeItemCategories.map((cat) => {
                      const icon = getCategoryIconForHomeItems(cat.name);
                      return (
                        <div
                          key={cat._id}
                          className="flex items-center gap-4 p-5 rounded-xl shadow-md hover:shadow-lg transition-all duration-300 hover:scale-105 bg-[#f5f3eb] dark:bg-gray-800 border border-[#f0e6d0] dark:border-gray-700 cursor-pointer"
                          onClick={() => handleHomeItemCategoryClick(cat._id)}
                        >
                          {icon ? (
                            <div className="w-10 h-10 relative flex-shrink-0">
                              <Image src={icon} alt={cat.name} width={40} height={40} className="object-contain" />
                            </div>
                          ) : (
                            <div className="w-10 h-10 bg-gradient-to-br from-[#f89b64] to-[#f47a45] rounded-lg flex items-center justify-center">
                              <span className="text-white font-bold text-lg">{cat.name[0]}</span>
                            </div>
                          )}
                          <span className="text-base font-bold text-gray-800 dark:text-gray-200 tracking-tight line-clamp-2">
                            {cat.name}
                          </span>
                        </div>
                      );
                    })
                  ) : (
                    <div className="col-span-2 text-center py-8">
                      <p className="text-gray-600 dark:text-gray-400">No categories available</p>
                    </div>
                  )}
                </div>
              </aside>

              {/* Properties */}
              <section className="py-8">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-200" style={{ fontFamily: 'Parisienne, cursive' }}>
                    Properties
                  </h2>
                </div>
                {realEstatesLoading ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {Array.from({ length: 8 }).map((_, i) => (
                      <SkeletonLoader key={`prop-${i}`} variant="property" className="w-full" />
                    ))}
                  </div>
                ) : realEstatesError ? (
                  <p className="text-center text-red-500">Network error. Try again later.</p>
                ) : realEstates && realEstates.length > 0 ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {(realEstates as RealEstate[]).slice(0, 8).map((estate) => {
                      const id = estate.id || estate._id || `estate-${Math.random()}`;
                      const title = estate.title || 'Untitled';
                      const price = estate.price || estate.amount || 0;
                      const address = estate.address || estate.location || 'No address';
                      const images = estate.images || estate.image || [];
                      const mainImage = images[0] || '/assets/images/placeholder.png';
                      return (
                        <div
                          key={id}
                          className="bg-white dark:bg-gray-800 rounded-xl shadow-md hover:shadow-xl transition-all duration-300 hover:scale-[1.02] overflow-hidden border border-gray-200 dark:border-gray-700 cursor-pointer"
                          onClick={() => handleRealEstateClick(id, title)}
                        >
                          <div className="w-full h-48 relative bg-gray-100 dark:bg-gray-700">
                            <Image src={mainImage} alt={title} fill className="object-cover" onError={(e) => { e.currentTarget.src = '/assets/images/placeholder.png'; }} />
                            <div className="absolute top-3 left-3 bg-[#f47a45] text-white px-3 py-1 rounded-full text-sm font-semibold">
                              ₦{price.toLocaleString()}
                            </div>
                          </div>
                          <div className="p-4">
                            <h3 className="text-lg font-bold text-gray-800 dark:text-gray-200 mb-2 line-clamp-2">{title}</h3>
                            <div className="flex items-center text-gray-600 dark:text-gray-400 text-sm mb-2">
                              <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                              </svg>
                              <span className="line-clamp-1">{address}</span>
                            </div>
                            {(estate.bedrooms || estate.bathrooms) && (
                              <div className="flex items-center gap-4 text-sm text-gray-600 dark:text-gray-400 mt-3 pt-3 border-t border-gray-100 dark:border-gray-700">
                                {estate.bedrooms && (
                                  <span className="flex items-center">
                                    <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                                    </svg>
                                    {estate.bedrooms} bed{estate.bedrooms !== 1 ? 's' : ''}
                                  </span>
                                )}
                                {estate.bathrooms && (
                                  <span className="flex items-center">
                                    <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                    </svg>
                                    {estate.bathrooms} bath{estate.bathrooms !== 1 ? 's' : ''}
                                  </span>
                                )}
                              </div>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="text-center py-12 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700">
                    <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-2">No Properties Available</h3>
                    <p className="text-gray-600 dark:text-gray-400 text-sm mb-4">Check back later</p>
                    <button
                      onClick={() => handleCardClick('/real-estates')}
                      className="px-6 py-2 bg-[#f47a45] hover:bg-[#f58c55] text-white rounded-lg font-semibold transition-colors"
                    >
                      Browse All Properties
                    </button>
                  </div>
                )}
              </section>
            </main>
          </div>
        </div>
      </div>

      {/* GLOBAL STYLES – ONLY FIXES ADDED */}
      <style jsx global>{`
        html, body, #__next {
          overflow-x: hidden !important;
          width: 100% !important;
          position: relative !important;
        }
        * { -webkit-overflow-scrolling: touch; }
        .animate-marquee-inline {
          animation: marquee-inline 25s linear infinite;
        }
        @keyframes marquee-inline {
          0% { transform: translateX(0%); }
          100% { transform: translateX(-50%); }
        }
        .line-clamp-1 { overflow: hidden; display: -webkit-box; -webkit-box-orient: vertical; -webkit-line-clamp: 1; }
        .line-clamp-2 { overflow: hidden; display: -webkit-box; -webkit-box-orient: vertical; -webkit-line-clamp: 2; }
      `}</style>
    </>
  );
}