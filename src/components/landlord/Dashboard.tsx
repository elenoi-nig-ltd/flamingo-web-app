'use client';

import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { 
  FaHome, 
  FaCheckCircle, 
  FaPlus, 
  FaBars, 
  FaEye, 
  FaMapMarkerAlt, 
  FaSyncAlt,
  FaExclamationTriangle 
} from 'react-icons/fa';
import { useAuth } from '@/hooks/useAuth';
import { useRealEstates } from '@/hooks/useRealEstates';
import { useRouter } from 'next/navigation';
import Header from '../Header';
import LandlordSidebar from './LandlordSidebar';

interface User {
  id: string;
  name: string;
  email: string;
  role?: string;
}

interface UseAuthReturn {
  user: User | null;
  logout: () => void;
  loading?: boolean;
  error?: string | null;
}

const LandlordDashboard: React.FC = () => {
  const { user, logout }: UseAuthReturn = useAuth();
  const {
    realEstates,
    loading,
    error,
    createLoading,
    createError,
    verifiedPropertiesCount,
    pendingPropertiesCount,
    totalPropertiesCount,
    refreshData,
  } = useRealEstates({ fetchMode: 'landlord', enableFilters: false });

  const router = useRouter();
  const [sidebarOpen, setSidebarOpen] = useState<boolean>(false);
  const [refreshing, setRefreshing] = useState<boolean>(false);
  const sidebarRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const isScrolling = useRef<boolean>(false);

  // Redirect if not a landlord
  useEffect(() => {
    if (user && user.role !== 'landlord') {
      router.push('/'); // or appropriate redirect based on role
    }
  }, [user, router]);

  const toggleSidebar = (): void => {
    setSidebarOpen(!sidebarOpen);
  };

  const handleCardClick = (route: string): void => {
    router.push(route);
  };

  const handleRefresh = async (): Promise<void> => {
    setRefreshing(true);
    try {
      await refreshData();
    } finally {
      setRefreshing(false);
    }
  };

  // Synchronized scrolling effect
  useEffect(() => {
    const sidebarElement = sidebarRef.current;
    const contentElement = contentRef.current;

    if (!sidebarElement || !contentElement) return;

    const handleSidebarScroll = (event: Event) => {
      if (isScrolling.current) return;
      isScrolling.current = true;

      const target = event.target as HTMLDivElement;
      const scrollPercentage = target.scrollTop / (target.scrollHeight - target.clientHeight);
      
      if (contentElement) {
        const contentScrollTop = scrollPercentage * (contentElement.scrollHeight - contentElement.clientHeight);
        contentElement.scrollTop = contentScrollTop;
      }

      requestAnimationFrame(() => {
        isScrolling.current = false;
      });
    };

    const handleContentScroll = (event: Event) => {
      if (isScrolling.current) return;
      isScrolling.current = true;

      const target = event.target as HTMLDivElement;
      const scrollPercentage = target.scrollTop / (target.scrollHeight - target.clientHeight);
      
      if (sidebarElement) {
        const sidebarScrollTop = scrollPercentage * (sidebarElement.scrollHeight - sidebarElement.clientHeight);
        sidebarElement.scrollTop = sidebarScrollTop;
      }

      requestAnimationFrame(() => {
        isScrolling.current = false;
      });
    };

    sidebarElement.addEventListener('scroll', handleSidebarScroll);
    contentElement.addEventListener('scroll', handleContentScroll);

    return () => {
      sidebarElement.removeEventListener('scroll', handleSidebarScroll);
      contentElement.removeEventListener('scroll', handleContentScroll);
    };
  }, []);

  // Show loading if user is not loaded yet or not a landlord
  if (!user || user.role !== 'landlord') {
    return (
      <div className="min-h-screen pt-24 bg-gray-100 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-24 bg-gray-100 dark:bg-gray-900 font-sans">
      <Header />

      <div className="flex min-h-[calc(100vh-64px)]">
        {/* Desktop Sidebar - Fixed with invisible scroll area */}
        <div 
          ref={sidebarRef}
          className="hidden md:block w-64 fixed top-16 left-0 h-[calc(100vh-64px)] z-30 overflow-y-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]"
        >
          <LandlordSidebar isOpen={true} onClose={() => {}} isDesktop={true} />
        </div>

        {/* Mobile Sidebar - Fullscreen overlay */}
        <div className={`md:hidden fixed inset-0 z-40 ${sidebarOpen ? 'block' : 'hidden'}`}>
          <LandlordSidebar
            isOpen={sidebarOpen}
            onClose={() => setSidebarOpen(false)}
            isDesktop={false}
          />
        </div>

        {/* Main Content with visible scrolling */}
        <div 
          ref={contentRef}
          className="flex-1 md:ml-64 min-w-0 transition-all duration-300 overflow-y-auto h-[calc(100vh-64px)]"
        >
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8 }}
            className="container mx-auto px-6 py-8"
          >
            {/* Header with mobile menu toggle */}
            <div className="flex justify-between items-center mb-8">
              <div className="flex items-center">
                <button
                  onClick={toggleSidebar}
                  className="p-2 text-gray-700 dark:text-gray-300 hover:text-orange-600 mr-3 md:hidden"
                  aria-label="Toggle sidebar"
                >
                  <FaBars className="text-xl" />
                </button>
                <div>
                  <h1 className="text-3xl font-bold text-gray-800 dark:text-white">Landlord Dashboard</h1>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                    Welcome back, {user.name}!
                  </p>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={handleRefresh}
                  disabled={refreshing || loading}
                  className="p-2 text-gray-600 dark:text-gray-400 hover:text-orange-600 transition-colors disabled:opacity-50"
                  title="Refresh properties"
                >
                  <FaSyncAlt className={`text-lg ${refreshing ? 'animate-spin' : ''}`} />
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={logout}
                  className="px-4 py-2 bg-gradient-to-r from-orange-500 to-amber-500 text-white rounded-full font-semibold shadow-lg hover:from-orange-600 hover:to-amber-600 transition-all duration-300"
                >
                  Logout
                </motion.button>
              </div>
            </div>

            {/* Error Alert */}
            {error && (
              <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-6 p-4 bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-800 rounded-lg flex items-center"
              >
                <FaExclamationTriangle className="text-red-500 dark:text-red-400 mr-3" />
                <div className="flex-1">
                  <p className="text-red-700 dark:text-red-300 font-medium">Failed to load properties</p>
                  <p className="text-red-600 dark:text-red-400 text-sm mt-1">{error}</p>
                </div>
                <button
                  onClick={handleRefresh}
                  className="ml-4 px-3 py-1 bg-red-100 dark:bg-red-900/50 text-red-700 dark:text-red-300 rounded hover:bg-red-200 dark:hover:bg-red-800 transition-colors text-sm"
                >
                  Retry
                </button>
              </motion.div>
            )}

            {/* Create Error Alert */}
            {createError && (
              <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-6 p-4 bg-orange-50 dark:bg-orange-950/20 border border-orange-200 dark:border-orange-800 rounded-lg flex items-center"
              >
                <FaExclamationTriangle className="text-orange-500 mr-3" />
                <div className="flex-1">
                  <p className="text-orange-700 dark:text-orange-300 font-medium">Property creation failed</p>
                  <p className="text-orange-600 dark:text-orange-400 text-sm mt-1">{createError}</p>
                </div>
              </motion.div>
            )}

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
              <motion.div
                whileHover={{ scale: 1.05, y: -5 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => handleCardClick('/landlord/properties')}
                className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg flex items-center space-x-4 cursor-pointer transform transition-all duration-200 hover:shadow-xl"
              >
                <div className="bg-green-100 dark:bg-green-900/20 p-3 rounded-full">
                  <FaHome className="text-2xl text-green-600 dark:text-green-400" />
                </div>
                <div>
                  <h3 className="text-2xl font-bold text-gray-800 dark:text-white">
                    {loading ? '...' : (totalPropertiesCount || realEstates.length)}
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400 text-sm">Listed Properties</p>
                </div>
              </motion.div>

              <motion.div
                whileHover={{ scale: 1.05, y: -5 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => handleCardClick('/landlord/verify')}
                className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg flex items-center space-x-4 cursor-pointer transform transition-all duration-200 hover:shadow-xl"
              >
                <div className="bg-green-100 dark:bg-green-900/20 p-3 rounded-full">
                  <FaCheckCircle className="text-2xl text-green-600 dark:text-green-400" />
                </div>
                <div>
                  <h3 className="text-2xl font-bold text-gray-800 dark:text-white">
                    {loading ? '...' : (verifiedPropertiesCount || realEstates.filter((estate) => estate.verified).length)}
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400 text-sm">Verified Properties</p>
                </div>
              </motion.div>

              <motion.div
                whileHover={{ scale: 1.05, y: -5 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => handleCardClick('/landlord/add-properties')}
                className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg flex items-center space-x-4 cursor-pointer transform transition-all duration-200 hover:shadow-xl"
              >
                <div className="bg-orange-100 dark:bg-orange-900/20 p-3 rounded-full">
                  <FaPlus className="text-2xl text-orange-500" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-gray-800 dark:text-white">Add Property</h3>
                  <p className="text-gray-600 dark:text-gray-400 text-sm">List a new property</p>
                </div>
              </motion.div>

              <motion.div
                whileHover={{ scale: 1.05, y: -5 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => handleCardClick('/landlord/properties')}
                className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg flex items-center space-x-4 cursor-pointer transform transition-all duration-200 hover:shadow-xl"
              >
                <div className="bg-blue-100 dark:bg-blue-900/20 p-3 rounded-full">
                  <FaEye className="text-2xl text-blue-600 dark:text-blue-400" />
                </div>
                <div>
                  <h3 className="text-2xl font-bold text-gray-800 dark:text-white">
                    {loading ? '...' : (pendingPropertiesCount || realEstates.filter((estate) => !estate.verified).length)}
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400 text-sm">Pending Review</p>
                </div>
              </motion.div>
            </div>

            {/* Properties Section */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-semibold text-gray-700 dark:text-gray-300">Your Properties</h2>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => handleCardClick('/landlord/add-properties')}
                  className="px-4 py-2 bg-gradient-to-r from-orange-500 to-amber-500 text-white rounded-lg font-semibold shadow hover:from-orange-600 hover:to-amber-600 transition-all duration-300 flex items-center space-x-2"
                  disabled={createLoading}
                >
                  <FaPlus />
                  <span>{createLoading ? 'Adding...' : 'Add New Property'}</span>
                </motion.button>
              </div>

              {loading ? (
                <div className="flex justify-center items-center py-12">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500"></div>
                  <p className="ml-4 text-gray-600 dark:text-gray-400">Loading your properties...</p>
                </div>
              ) : error ? (
                <div className="text-center py-12">
                  <FaExclamationTriangle className="text-6xl text-red-300 dark:text-red-500 mx-auto mb-4" />
                  <h3 className="text-xl font-semibold text-red-600 dark:text-red-400 mb-2">Failed to Load Properties</h3>
                  <p className="text-red-500 dark:text-red-400 text-lg mb-6">{error}</p>
                  <div className="flex justify-center space-x-4">
                    <button
                      onClick={handleRefresh}
                      disabled={refreshing}
                      className="px-6 py-2 bg-gradient-to-r from-orange-500 to-amber-500 text-white rounded-lg hover:from-orange-600 hover:to-amber-600 transition-all duration-300 disabled:opacity-50"
                    >
                      {refreshing ? 'Retrying...' : 'Try Again'}
                    </button>
                    <button
                      onClick={() => router.push('/landlord/add-properties')}
                      className="px-6 py-2 bg-gray-500 dark:bg-gray-600 text-white rounded-lg hover:bg-gray-600 dark:hover:bg-gray-500 transition-colors"
                    >
                      Add Property Instead
                    </button>
                  </div>
                </div>
              ) : realEstates.length === 0 ? (
                <div className="text-center py-12">
                  <FaHome className="text-6xl text-gray-300 dark:text-gray-500 mx-auto mb-4" />
                  <h3 className="text-xl font-semibold text-gray-600 dark:text-gray-400 mb-2">No Properties Listed</h3>
                  <p className="text-gray-500 dark:text-gray-500 mb-6">Start by adding your first property to get started with your landlord journey</p>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => handleCardClick('/landlord/add-properties')}
                    className="px-6 py-3 bg-gradient-to-r from-orange-500 to-amber-500 text-white rounded-lg font-semibold shadow-lg hover:from-orange-600 hover:to-amber-600 transition-all duration-300"
                    disabled={createLoading}
                  >
                    {createLoading ? 'Loading...' : 'Add Your First Property'}
                  </motion.button>
                </div>
              ) : (
                <>
                  {/* Properties Summary */}
                  <div className="mb-6 p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                    <div className="flex items-center justify-between text-sm text-gray-600 dark:text-gray-400">
                      <span>
                        Showing {realEstates.length} propert{realEstates.length === 1 ? 'y' : 'ies'}
                      </span>
                      <div className="flex space-x-4">
                        <span className="text-green-600 dark:text-green-400">
                          {verifiedPropertiesCount || realEstates.filter(estate => estate.verified).length} verified
                        </span>
                        <span className="text-orange-600 dark:text-orange-400">
                          {pendingPropertiesCount || realEstates.filter(estate => !estate.verified).length} pending
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Properties Grid */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    {realEstates.map((estate, index: number) => (
                      <motion.div
                        key={estate.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5, delay: Math.min(index * 0.1, 1) }}
                        whileHover={{ y: -5, scale: 1.02 }}
                        className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden cursor-pointer transform transition-all duration-200 hover:shadow-xl border border-gray-200 dark:border-gray-700"
                        onClick={() => router.push(`/landlord/edit-properties/${estate.id}`)}
                      >
                        <div className="relative">
                          <img
                            src={estate.images[0] || '/placeholder.jpg'}
                            alt={estate.title}
                            className="w-full h-48 object-cover"
                            onError={(e: React.SyntheticEvent<HTMLImageElement, Event>) => {
                              const target = e.target as HTMLImageElement;
                              target.src = '/placeholder.jpg';
                            }}
                          />
                          <div
                            className={`absolute top-3 right-3 px-3 py-1 rounded-full text-xs font-semibold ${
                              estate.verified
                                ? 'bg-green-100 dark:bg-green-900/20 text-green-800 dark:text-green-200 border border-green-200 dark:border-green-800'
                                : 'bg-orange-100 dark:bg-orange-900/20 text-orange-800 dark:text-orange-200 border border-orange-200 dark:border-orange-800'
                            }`}
                          >
                            {estate.verified ? 'Verified' : 'Pending'}
                          </div>
                          {estate.propertyType && (
                            <div className="absolute top-3 left-3 px-2 py-1 bg-black bg-opacity-70 text-white text-xs rounded">
                              {estate.propertyType.charAt(0).toUpperCase() + estate.propertyType.slice(1)}
                            </div>
                          )}
                        </div>
                        <div className="p-4">
                          <div className="flex justify-between items-start mb-2">
                            <h3 className="text-lg font-bold text-gray-800 dark:text-white">₦{estate.price.toLocaleString()}</h3>
                            <span className="text-sm text-gray-500 dark:text-gray-400">#{estate.id.slice(-6)}</span>
                          </div>
                          <p className="text-gray-700 dark:text-gray-300 font-medium mb-2 truncate" title={estate.title}>
                            {estate.title}
                          </p>
                          <div className="flex items-center text-sm text-gray-500 dark:text-gray-400 mb-2">
                            <FaMapMarkerAlt className="mr-1 flex-shrink-0" />
                            <span className="truncate" title={estate.address}>
                              {estate.address || 'Address not specified'}
                            </span>
                          </div>
                          <p className="text-sm text-gray-500 dark:text-gray-500 mb-3">
                            {estate.bedrooms} bed{estate.bedrooms !== 1 ? 's' : ''} • {estate.bathrooms} bath{estate.bathrooms !== 1 ? 's' : ''} • {estate.area.toLocaleString()} sq ft
                          </p>
                          <div className="flex justify-between items-center">
                            <span className="text-xs text-gray-400 dark:text-gray-500">
                              {estate.propertyType || 'Property'} • {estate.verified ? 'Live' : 'Under review'}
                            </span>
                            <motion.button
                              whileHover={{ scale: 1.1 }}
                              whileTap={{ scale: 0.9 }}
                              onClick={(e: React.MouseEvent<HTMLButtonElement>) => {
                                e.stopPropagation();
                                router.push(`/landlord/edit-properties/${estate.id}`);
                              }}
                              className="text-orange-500 dark:text-orange-400 hover:text-orange-700 dark:hover:text-orange-300 text-sm font-medium transition-colors"
                            >
                              Edit
                            </motion.button>
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </>
              )}
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default LandlordDashboard;