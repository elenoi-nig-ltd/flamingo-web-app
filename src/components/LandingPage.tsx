"use client";

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { PlusCircle, ChevronRight } from 'lucide-react';
import Head from 'next/head';
import Image from 'next/image';
import SkeletonLoader from '@/components/SkeletonLoader';
import { usePublicCategories, usePublicProducts } from '@/hooks/usePublic';
import { useRealEstates } from '@/hooks/useRealEstates';
import { useHomeItemCategories } from '@/hooks/useHomeItemCategories';

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

export default function LandingPage() {
  const router = useRouter();
  const { fetchCategories, loading: categoriesLoading } = usePublicCategories();
  const { getProductsByCategory, fetchProducts } = usePublicProducts();
  const { realEstates, loading: realEstatesLoading, error: realEstatesError } = useRealEstates({ fetchMode: 'public' });
  const { categories: homeItemCategories, loading: homeItemCategoriesLoading } = useHomeItemCategories();
  
  const [dynamicCategories, setDynamicCategories] = useState<Category[]>([]);
  const [hoveredCategory, setHoveredCategory] = useState<string | null>(null);
  const [categoryProducts, setCategoryProducts] = useState<Record<string, Product[]>>({});
  const [loadingProducts, setLoadingProducts] = useState<Record<string, boolean>>({});
  const [allProducts, setAllProducts] = useState<Product[]>([]);

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

  useEffect(() => {
    const loadCategories = async () => {
      try {
        const response = await fetchCategories();
        setDynamicCategories(response.categories);
      } catch (err) {
        console.error('Failed to fetch categories:', err);
      }
    };
    loadCategories();
  }, []);

  useEffect(() => {
    const loadAllProducts = async () => {
      try {
        const response = await fetchProducts({ limit: 1000 });
        setAllProducts(response.products);
      } catch (err) {
        console.error('Failed to fetch all products:', err);
      }
    };
    loadAllProducts();
  }, []);

  const handleCategoryHover = async (categoryId: string) => {
    setHoveredCategory(categoryId);
    
    if (categoryProducts[categoryId]) {
      return;
    }

    setLoadingProducts(prev => ({ ...prev, [categoryId]: true }));
    
    try {
      console.log('Fetching products for category:', categoryId);
      const response = await getProductsByCategory(categoryId, { limit: 8 });
      console.log('Products response:', response);
      
      let products = response.products || [];
      
      const filteredProducts = products.filter(product => {
        const productCategoryId = typeof product.category === 'string' 
          ? product.category 
          : product.category._id;
        return productCategoryId === categoryId;
      });
      
      console.log(`Filtered ${filteredProducts.length} products for category ${categoryId}`);
      
      if (filteredProducts.length === 0) {
        console.log('No products from API after filtering, trying client-side filtering');
        const clientSideProducts = allProducts.filter(product => {
          const productCategoryId = typeof product.category === 'string' 
            ? product.category 
            : product.category._id;
          return productCategoryId === categoryId;
        }).slice(0, 8);
        
        setCategoryProducts(prev => ({
          ...prev,
          [categoryId]: clientSideProducts
        }));
      } else {
        setCategoryProducts(prev => ({
          ...prev,
          [categoryId]: filteredProducts.slice(0, 8)
        }));
      }
    } catch (err) {
      console.error('Failed to fetch products for category:', err);
      
      const filteredProducts = allProducts.filter(product => {
        const productCategoryId = typeof product.category === 'string' 
          ? product.category 
          : product.category._id;
        return productCategoryId === categoryId;
      }).slice(0, 8);
      
      console.log(`Fallback filtered ${filteredProducts.length} products for category ${categoryId}`);
      
      setCategoryProducts(prev => ({
        ...prev,
        [categoryId]: filteredProducts
      }));
    } finally {
      setLoadingProducts(prev => ({ ...prev, [categoryId]: false }));
    }
  };

  const getProductCategoryId = (product: Product): string => {
    return typeof product.category === 'string' 
      ? product.category 
      : product.category._id;
  };

  const getCategoryIcon = (categoryName: string): string => {
    if (categoryIconMap[categoryName]) {
      return categoryIconMap[categoryName];
    }
    
    const normalizedName = categoryName.toLowerCase();
    for (const [key, value] of Object.entries(categoryIconMap)) {
      if (key.toLowerCase() === normalizedName) {
        return value;
      }
    }
    
    return '/assets/images/categories/furniture.png';
  };

  const getCategoryIconForHomeItems = (categoryName: string): string | null => {
    // Direct match
    if (categoryIconMap[categoryName]) {
      return categoryIconMap[categoryName];
    }
    
    // Case-insensitive match
    const normalizedName = categoryName.toLowerCase();
    for (const [key, value] of Object.entries(categoryIconMap)) {
      if (key.toLowerCase() === normalizedName) {
        return value;
      }
    }
    
    // Partial match (e.g., "Furniture Sets" matches "Furniture")
    for (const [key, value] of Object.entries(categoryIconMap)) {
      if (normalizedName.includes(key.toLowerCase()) || key.toLowerCase().includes(normalizedName)) {
        return value;
      }
    }
    
    return null; // No match found
  };

  const cards = [
    { 
      icon: '/assets/images/card/food-order.png', 
      label: 'Order Food',
      route: '/food'
    },
    { 
      icon: '/assets/images/card/household.png', 
      label: 'Household Items',
      route: '/home-items'
    },
    { 
      icon: '/assets/images/card/properties.png', 
      label: 'Properties',
      route: '/real-estates'
    },
    { 
      icon: '/assets/images/card/internet.png', 
      label: 'Internet',
      route: '/internet'
    },
  ];

  const handleCardClick = (route: string) => {
    router.push(route);
  };

  const handleCategoryClick = (categoryId: string) => {
    router.push(`/food?category=${categoryId}`);
  };

  const handleProductClick = (productId: string, productName: string) => {
    const slug = productName
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');
    router.push(`/${slug}/${productId}`);
  };

  const handleRealEstateClick = (realEstateId: string, title: string) => {
    router.push(`/real-estates/${realEstateId}`);
  };

  const handleHomeItemCategoryClick = (categoryId: string) => {
    router.push(`/home-items?category=${categoryId}`);
  };

  return (
    <>
      <Head>
        <link
          href="https://fonts.googleapis.com/css2?family=Parisienne&display=swap"
          rel="stylesheet"
        />
      </Head>
      <div className="min-h-screen mt-20 bg-[#f8f5e6] dark:bg-gray-900 transition-colors duration-300">
        {/* Welcome Section */}
        <section className="w-full bg-gradient-to-r from-[#f89b64] dark:from-gray-800 to-[#f47a45] dark:to-gray-700 text-white dark:text-gray-200 text-center py-12 md:py-16 rounded-b-[50px] shadow-lg dark:shadow-gray-900 transition-all duration-300">
          <div className="container mx-auto px-4">
            <h1 className="text-4xl md:text-6xl font-bold mb-6">
              Welcome to Flamingo
            </h1>
            <p className="text-lg md:text-xl font-semibold mb-8 tracking-wide">
              What do you want to buy?
            </p>
            <div className="flex flex-col md:flex-row justify-center gap-4 px-4 animate-in fade-in-0 slide-in-from-top-2 duration-300">
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
                  <input
                    type="text"
                    placeholder="I am looking for..."
                    className="px-5 py-3 rounded-lg bg-white dark:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-[#f7a16b] dark:focus:ring-orange-400 text-gray-800 dark:text-gray-200 w-full md:w-72 font-medium transition border border-gray-300 dark:border-gray-600 placeholder-gray-500 dark:placeholder-gray-400"
                  />
                </>
              )}
            </div>
          </div>
        </section>

        {/* Main Content Area */}
        <div className="container bg-[#f8f5e6] mx-auto px-4 md:px-6 lg:px-8 pt-10">
          <div className="flex flex-col lg:flex-row gap-6">
            {/* Sidebar - Web View with Dynamic Categories */}
            <aside className="hidden lg:block w-1/4 bg-[#f58c55] dark:bg-gray-800 text-white p-6 rounded-tl-[40px] rounded-bl-[40px] shadow-lg transition-colors duration-300 relative">
              <h2 className="text-3xl font-bold mb-6" style={{ fontFamily: 'Parisienne, cursive' }}>
                Categories
              </h2>
              <div className="space-y-3">
                {categoriesLoading ? (
                  <>
                    {Array.from({ length: 8 }).map((_, index) => (
                      <SkeletonLoader 
                        key={`cat-skeleton-${index}`}
                        variant="category" 
                        className="w-full"
                      />
                    ))}
                  </>
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
                        <div className="flex items-center gap-3">
                          <span className="text-lg font-bold text-white tracking-tight">{cat.name}</span>
                        </div>
                        <ChevronRight className="w-4 h-4 text-white opacity-70" />
                      </div>

                      {hoveredCategory === cat._id && (
                        <div 
                          className="absolute left-full top-0 ml-2 w-80 bg-white dark:bg-gray-800 rounded-lg shadow-2xl p-4 z-50 border border-gray-200 dark:border-gray-600"
                          onMouseEnter={() => setHoveredCategory(cat._id)}
                          onMouseLeave={() => setHoveredCategory(null)}
                        >
                          {loadingProducts[cat._id] ? (
                            <div className="mb-3 pb-3 border-b border-gray-200 dark:border-gray-600">
                              <SkeletonLoader variant="line" height="20px" width="60%" />
                              <SkeletonLoader variant="line" height="14px" width="80%" className="mt-2" />
                              <div className="space-y-3 max-h-96 overflow-y-auto">
                                {Array.from({ length: 6 }).map((_, index) => (
                                  <div key={`hover-product-skeleton-${index}`} className="flex items-center gap-3 p-2">
                                    <SkeletonLoader variant="image" width="48px" height="48px" />
                                    <div className="flex-1 space-y-1">
                                      <SkeletonLoader variant="line" height="14px" width="80%" />
                                      <SkeletonLoader variant="line" height="12px" width="40%" />
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </div>
                          ) : (
                            <>
                              <div className="mb-3 pb-3 border-b border-gray-200 dark:border-gray-600">
                                <h3 className="text-lg font-bold text-gray-800 dark:text-gray-200">
                                  {cat.name}
                                </h3>
                                <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                                  {cat.description || 'Browse products in this category'}
                                </p>
                              </div>

                              {categoryProducts[cat._id] && categoryProducts[cat._id].length > 0 ? (
                                <div className="space-y-2 max-h-96 overflow-y-auto">
                                  {categoryProducts[cat._id].map((product) => {
                                    const productCategoryId = getProductCategoryId(product);
                                    if (productCategoryId !== cat._id) {
                                      return null;
                                    }
                                    
                                    return (
                                      <div
                                        key={product._id}
                                        className="flex items-center gap-3 p-2 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-lg cursor-pointer transition-all"
                                        onClick={() => handleProductClick(product._id, product.name)}
                                      >
                                        {product.images && product.images.length > 0 && (
                                          <div className="w-12 h-12 relative flex-shrink-0">
                                            <Image
                                              src={product.images[0]}
                                              alt={product.name}
                                              width={48}
                                              height={48}
                                              className="object-cover rounded"
                                            />
                                          </div>
                                        )}
                                        <div className="flex-1 min-w-0">
                                          <p className="text-sm font-semibold text-gray-800 dark:text-gray-200 truncate">
                                            {product.name}
                                          </p>
                                          <p className="text-xs text-[#f47a45] dark:text-[#f7a16b] font-bold">
                                            ₦{product.price.toLocaleString()}
                                          </p>
                                        </div>
                                      </div>
                                    );
                                  }).filter(Boolean)}
                                  
                                  <button
                                    onClick={() => handleCategoryClick(cat._id)}
                                    className="w-full mt-2 py-2 text-sm font-semibold text-[#f47a45] dark:text-[#f7a16b] hover:bg-gray-50 dark:hover:bg-gray-700 rounded-lg transition-all"
                                  >
                                    View All in {cat.name} →
                                  </button>
                                </div>
                              ) : (
                                <div className="text-center py-6">
                                  <p className="text-gray-600 dark:text-gray-400 text-sm">No products available in this category</p>
                                </div>
                              )}
                            </>
                          )}
                        </div>
                      )}
                    </div>
                  ))
                ) : (
                  <div className="text-center py-4">
                    <p className="text-white">No categories available</p>
                  </div>
                )}
              </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 bg-[#f8f5e6]">
              {/* Cards Section */}
              <section className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 py-8">
                {categoriesLoading ? (
                  <>
                    {Array.from({ length: 5 }).map((_, index) => (
                      <SkeletonLoader 
                        key={`card-skeleton-${index}`}
                        variant="card"
                        className="w-full h-52"
                      />
                    ))}
                  </>
                ) : (
                  <>
                    {cards.map((card, index) => (
                      <div
                        key={index}
                        className="w-52 h-52 bg-[#f5f3eb] dark:bg-gray-800 rounded-2xl shadow-md hover:shadow-xl transition-all duration-300 hover:scale-105 flex flex-col items-center justify-center gap-5 border border-[#f0e6d0] dark:border-gray-600 cursor-pointer dark:text-gray-200"
                        onClick={() => handleCardClick(card.route)}
                      >
                        <div className="w-28 h-28 relative">
                          <Image 
                            src={card.icon} 
                            alt={card.label}
                            width={112}
                            height={112}
                            className="object-contain"
                          />
                        </div>
                        <span className="text-gray-800 dark:text-gray-200 text-lg font-semibold text-center">{card.label}</span>
                      </div>
                    ))}
                    <div 
                      className="w-52 h-52 bg-[#f5f3eb] dark:bg-gray-800 rounded-2xl shadow-md hover:shadow-xl transition-all duration-300 hover:scale-105 flex flex-col items-center justify-center gap-5 border border-[#f0e6d0] dark:border-gray-600 cursor-pointer"
                      onClick={() => handleCardClick('/post-ads')}
                    >
                      <PlusCircle className="text-[#f47a45] dark:text-[#f7a16b] w-20 h-20" />
                      <span className="text-gray-800 dark:text-gray-200 text-lg font-semibold">Post Ads</span>
                    </div>
                  </>
                )}
              </section>

              {/* Sidebar - Categories on Mobile (Dynamic from Home Items) */}
              <aside className="lg:hidden">
                <div className="grid grid-cols-2 gap-6 py-8">
                  {homeItemCategoriesLoading ? (
                    <>
                      {Array.from({ length: 10 }).map((_, index) => (
                        <SkeletonLoader 
                          key={`mobile-cat-skeleton-${index}`}
                          variant="category" 
                          className="w-full h-20"
                        />
                      ))}
                    </>
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
                              <Image 
                                src={icon} 
                                alt={cat.name}
                                width={40}
                                height={40}
                                className="object-contain"
                              />
                            </div>
                          ) : (
                            <div className="w-10 h-10 flex-shrink-0 bg-gradient-to-br from-[#f89b64] to-[#f47a45] rounded-lg flex items-center justify-center">
                              <span className="text-white font-bold text-lg">
                                {cat.name.charAt(0).toUpperCase()}
                              </span>
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

              {/* Trending Properties Section */}
              <section className="py-8">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-200" style={{ fontFamily: 'Parisienne, cursive' }}>
                    Properties
                  </h2>
                  {realEstatesLoading && (
                    <SkeletonLoader 
                      variant="line" 
                      width="20%" 
                      height="24px"
                    />
                  )}
                </div>
                {realEstatesLoading ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {Array.from({ length: 8 }).map((_, index) => (
                      <SkeletonLoader 
                        key={`property-skeleton-${index}`}
                        variant="property"
                        className="w-full"
                      />
                    ))}
                  </div>
                ) : realEstatesError ? (
                  <div className="text-center py-6">
                    <p className="text-red-500 dark:text-red-400 text-sm">Network error. Please try again later</p>
                  </div>
                ) : realEstates && realEstates.length > 0 ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {(realEstates as RealEstate[]).slice(0, 8).map((realEstate) => {
                      const id = realEstate.id || realEstate._id || `estate-${Math.random()}`;
                      const title = realEstate.title || 'Untitled Property';
                      const price = realEstate.price || realEstate.amount || 0;
                      const address = realEstate.address || realEstate.location || 'Address not specified';
                      const images = realEstate.images || realEstate.image || [];
                      const mainImage = images.length > 0 ? images[0] : '/assets/images/placeholder.png';

                      return (
                        <div
                          key={id}
                          className="bg-white dark:bg-gray-800 rounded-xl shadow-md hover:shadow-xl transition-all duration-300 hover:scale-[1.02] overflow-hidden border border-gray-200 dark:border-gray-700 cursor-pointer"
                          onClick={() => handleRealEstateClick(id, title)}
                        >
                          <div className="w-full h-48 relative bg-gray-100 dark:bg-gray-700">
                            <Image 
                              src={mainImage}
                              alt={title}
                              fill
                              className="object-cover"
                              onError={(e) => {
                                e.currentTarget.src = '/assets/images/placeholder.png';
                              }}
                            />
                            <div className="absolute top-3 left-3 bg-[#f47a45] text-white px-3 py-1 rounded-full text-sm font-semibold">
                              ₦{price.toLocaleString()}
                            </div>
                          </div>
                          
                          <div className="p-4">
                            <h3 className="text-lg font-bold text-gray-800 dark:text-gray-200 mb-2 line-clamp-2">
                              {title}
                            </h3>
                            
                            <div className="flex items-center text-gray-600 dark:text-gray-400 text-sm mb-2">
                              <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                              </svg>
                              <span className="line-clamp-1">{address}</span>
                            </div>

                            {(realEstate.bedrooms || realEstate.bathrooms) && (
                              <div className="flex items-center gap-4 text-sm text-gray-600 dark:text-gray-400 mt-3 pt-3 border-t border-gray-100 dark:border-gray-700">
                                {realEstate.bedrooms && (
                                  <span className="flex items-center">
                                    <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                                    </svg>
                                    {realEstate.bedrooms} bed{realEstate.bedrooms !== 1 ? 's' : ''}
                                  </span>
                                )}
                                {realEstate.bathrooms && (
                                  <span className="flex items-center">
                                    <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                    </svg>
                                    {realEstate.bathrooms} bath{realEstate.bathrooms !== 1 ? 's' : ''}
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
                    <div className="w-24 h-24 mx-auto mb-4 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center">
                      <svg className="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                      </svg>
                    </div>
                    <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-2">No Properties Available</h3>
                    <p className="text-gray-600 dark:text-gray-400 text-sm mb-4">Check back later for new property listings</p>
                    <button
                      onClick={() => handleCardClick('/real-estates')}
                      className="px-6 py-2 bg-[#f47a45] hover:bg-[#f58c55] text-white rounded-lg font-semibold transition-colors duration-300"
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

      <style jsx global>{`
        .line-clamp-1 {
          overflow: hidden;
          display: -webkit-box;
          -webkit-box-orient: vertical;
          -webkit-line-clamp: 1;
        }
        .line-clamp-2 {
          overflow: hidden;
          display: -webkit-box;
          -webkit-box-orient: vertical;
          -webkit-line-clamp: 2;
        }
        @keyframes shimmer {
          0% { background-position: -200% 0; }
          100% { background-position: 200% 0; }
        }
        .animate-pulse {
          animation: shimmer 1.5s infinite;
          background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%);
          background-size: 200% 100%;
        }
      `}</style>
    </>
  );
}