'use client';

import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Image from 'next/image';
import axios from 'axios';
import { useRouter } from 'next/navigation';
import { BASEURL } from '@/config/api/contants';
import { FaEye, FaMousePointer, FaTimes } from 'react-icons/fa';

interface Advertisement {
  _id: string;
  title: string;
  description: string;
  imageUrl: string;
  targetUrl: string;
  companyName: string;
}

interface ActiveAdsProps {
  location: string; 
  className?: string;
  viewMode?: 'carousel' | 'grid'; 
}

export default function ActiveAds({ location, className = '', viewMode = 'grid' }: ActiveAdsProps) {
  const router = useRouter();
  const [ads, setAds] = useState<Advertisement[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentAdIndex, setCurrentAdIndex] = useState(0);
  const [dismissedAds, setDismissedAds] = useState<Set<string>>(new Set());

  useEffect(() => {
    fetchActiveAds();
  }, [location]);

  useEffect(() => {
    if (ads.length > 1) {
      const interval = setInterval(() => {
        setCurrentAdIndex((prev) => (prev + 1) % ads.length);
      }, 5000); 

      return () => clearInterval(interval);
    }
  }, [ads]);

  const fetchActiveAds = async () => {
    try {
      const response = await axios.get(
        `${BASEURL}/advertisements/active/${location}`
      );
      console.log(`[ActiveAds] Fetched ads for ${location}:`, response.data);
      setAds(response.data);
    } catch (err) {
      console.error(`[ActiveAds] Failed to fetch active ads for ${location}:`, err);
      setAds([]);
    } finally {
      setLoading(false);
    }
  };

  const trackImpression = async (adId: string) => {
    try {
      await axios.post(`${BASEURL}/advertisements/${adId}/impression`);
    } catch (err) {
      console.error('Failed to track impression:', err);
    }
  };

  const trackClick = async (adId: string) => {
    try {
      await axios.post(`${BASEURL}/advertisements/${adId}/click`);
    } catch (err) {
      console.error('Failed to track click:', err);
    }
  };

  const handleAdClick = (ad: Advertisement) => {
    trackClick(ad._id);
    router.push(`/ads/${ad._id}`);
  };

  const handleDismissAd = (adId: string) => {
    const newDismissed = new Set(dismissedAds);
    newDismissed.add(adId);
    setDismissedAds(newDismissed);
    
    // Move to next ad if available
    if (ads.length > 1) {
      setCurrentAdIndex((prev) => (prev + 1) % ads.length);
    }
  };

  useEffect(() => {
    if (ads.length > 0 && ads[currentAdIndex]) {
      trackImpression(ads[currentAdIndex]._id);
    }
  }, [currentAdIndex, ads]);

  if (loading) {
    return (
      <div
        className={`bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-700 dark:to-gray-800 animate-pulse rounded-xl ${className}`}
        style={{ minHeight: '300px' }}
      />
    );
  }

  if (ads.length === 0) {
    return null;
  }

  // Filter out dismissed ads
  const visibleAds = ads.filter((ad) => !dismissedAds.has(ad._id));
  
  if (visibleAds.length === 0) {
    return null;
  }

  // Render grid view for multiple ads
  if (viewMode === 'grid' && visibleAds.length > 1) {
    return (
      <div className={`grid grid-cols-1 md:grid-cols-2 gap-6 ${className}`}>
        {visibleAds.map((ad, index) => (
          <motion.div
            key={ad._id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: index * 0.1 }}
            onClick={() => handleAdClick(ad)}
            className="relative cursor-pointer group rounded-xl overflow-hidden shadow-lg hover:shadow-xl transition-shadow"
          >
            {/* Ad Container - Full visibility */}
            <div className="relative w-full bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-900 p-4 md:p-6 min-h-[280px] flex flex-col justify-between">
              {/* Ad Image - Show full image */}
              <div className="relative w-full h-48 mb-4 flex items-center justify-center bg-white/50 dark:bg-gray-700/50 backdrop-blur-sm rounded-lg overflow-hidden">
                <Image
                  src={ad.imageUrl}
                  alt={ad.title}
                  fill
                  className="object-contain p-2"
                  priority
                  onError={(e) => {
                    const img = e.target as HTMLImageElement;
                    img.src = '/assets/placeholder-ad.png';
                  }}
                />
              </div>

              {/* Ad Info */}
              <div className="flex flex-col gap-3">
                <div>
                  <h3 className="text-gray-800 dark:text-white text-lg font-bold line-clamp-2 mb-1">
                    {ad.title}
                  </h3>
                  <p className="text-gray-600 dark:text-gray-300 text-sm line-clamp-2 mb-2">
                    {ad.description}
                  </p>
                  <p className="text-gray-500 dark:text-gray-400 text-xs">
                    by {ad.companyName}
                  </p>
                </div>
                <div className="flex items-center gap-2 mt-2">
                  <div className="bg-[#f58c55] text-white px-4 py-2 rounded-lg font-semibold text-sm group-hover:bg-[#e67e4a] transition-colors flex-1 text-center">
                    Learn More →
                  </div>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDismissAd(ad._id);
                    }}
                    className="bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-600 dark:text-gray-300 p-2 rounded-lg transition-all"
                    title="Dismiss this ad"
                  >
                    <FaTimes size={16} />
                  </button>
                </div>
              </div>

              {/* Sponsored Badge */}
              <div className="absolute top-3 right-3 bg-[#f58c55]/90 text-white text-xs px-3 py-1 rounded-full font-semibold backdrop-blur-sm">
                Sponsored
              </div>

              {/* Overlay on hover */}
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-all duration-300 rounded-xl" />
            </div>
          </motion.div>
        ))}
      </div>
    );
  }

  // Carousel view for single ad or when viewMode is carousel
  const displayAd = visibleAds[currentAdIndex % visibleAds.length];

  return (
    <div className={`relative overflow-hidden rounded-xl shadow-lg ${className}`}>
      <AnimatePresence mode="wait">
        <motion.div
          key={currentAdIndex}
          initial={{ opacity: 0, x: 100 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -100 }}
          transition={{ duration: 0.5 }}
          onClick={() => handleAdClick(displayAd)}
          className="relative cursor-pointer group"
        >
          {/* Ad Container - Full image visibility */}
          <div className="relative w-full bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-900 p-6 md:p-8 min-h-[350px] md:min-h-[400px] flex flex-col justify-between">
            {/* Ad Image - Show full image without cropping */}
            <div className="relative w-full h-64 md:h-72 mb-6 flex items-center justify-center bg-white/60 dark:bg-gray-700/60 backdrop-blur-sm rounded-lg overflow-hidden border border-gray-200 dark:border-gray-600">
              <Image
                src={displayAd.imageUrl}
                alt={displayAd.title}
                fill
                className="object-contain p-4"
                priority
                onError={(e) => {
                  const img = e.target as HTMLImageElement;
                  img.src = '/assets/placeholder-ad.png';
                }}
              />
            </div>

            {/* Ad Info */}
            <div className="flex flex-col gap-4">
              <div>
                <h3 className="text-gray-800 dark:text-white text-xl md:text-2xl font-bold mb-2 line-clamp-2">
                  {displayAd.title}
                </h3>
                <p className="text-gray-600 dark:text-gray-300 text-sm md:text-base line-clamp-3 mb-2">
                  {displayAd.description}
                </p>
                <p className="text-gray-500 dark:text-gray-400 text-sm">
                  by {displayAd.companyName}
                </p>
              </div>

              {/* CTA Button */}
              <div className="flex items-center gap-3 pt-2">
                <div className="bg-[#f58c55] text-white px-6 py-3 rounded-lg font-semibold text-base group-hover:bg-[#e67e4a] transition-colors flex-1 text-center">
                  Learn More →
                </div>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDismissAd(displayAd._id);
                  }}
                  className="bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-600 dark:text-gray-300 p-3 rounded-lg transition-all"
                  title="Dismiss this ad"
                >
                  <FaTimes size={18} />
                </button>
              </div>
            </div>

            {/* Sponsored Badge */}
            <div className="absolute top-4 right-4 bg-[#f58c55]/90 text-white text-xs md:text-sm px-3 md:px-4 py-1 md:py-2 rounded-full font-semibold backdrop-blur-sm">
              Sponsored
            </div>

            {/* Dismiss Button (Top Left) */}
            <button
              onClick={(e) => {
                e.stopPropagation();
                handleDismissAd(displayAd._id);
              }}
              className="absolute top-4 left-4 bg-black/60 hover:bg-black/80 text-white p-2 rounded-full backdrop-blur-sm transition-all duration-200 hover:scale-110"
              title="Dismiss this ad"
            >
              <FaTimes size={16} />
            </button>

            {/* Overlay on hover */}
            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/5 transition-all duration-300 rounded-xl pointer-events-none" />
          </div>
        </motion.div>
      </AnimatePresence>

      {/* Navigation Dots */}
      {visibleAds.length > 1 && (
        <div className="absolute bottom-6 md:bottom-8 left-1/2 transform -translate-x-1/2 flex space-x-2 bg-black/30 backdrop-blur-sm px-4 py-2 rounded-full">
          {visibleAds.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentAdIndex(index)}
              className={`w-2 h-2 rounded-full transition-all ${
                index === (currentAdIndex % visibleAds.length)
                  ? 'bg-white w-6 md:w-8'
                  : 'bg-white/50 hover:bg-white/75'
              }`}
              aria-label={`Go to ad ${index + 1}`}
            />
          ))}
        </div>
      )}
    </div>
  );
}
