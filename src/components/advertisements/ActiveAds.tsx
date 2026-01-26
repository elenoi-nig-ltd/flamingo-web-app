'use client';

import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Image from 'next/image';
import axios from 'axios';
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
  location: string; // Ad location type
  className?: string;
}

export default function ActiveAds({ location, className = '' }: ActiveAdsProps) {
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
      }, 5000); // Rotate every 5 seconds

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
    window.open(ad.targetUrl, '_blank', 'noopener,noreferrer');
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
        className={`bg-gray-200 dark:bg-gray-700 animate-pulse rounded-xl ${className}`}
        style={{ minHeight: '200px' }}
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

  const currentAd = visibleAds[currentAdIndex % visibleAds.length];

  return (
    <div className={`relative overflow-hidden rounded-xl shadow-lg ${className}`}>
      <AnimatePresence mode="wait">
        <motion.div
          key={currentAdIndex}
          initial={{ opacity: 0, x: 100 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -100 }}
          transition={{ duration: 0.5 }}
          onClick={() => handleAdClick(currentAd)}
          className="relative cursor-pointer group"
        >
          {/* Ad Image */}
          <div className="relative w-full h-48 sm:h-56 md:h-64 lg:h-80">
            <Image
              src={currentAd.imageUrl}
              alt={currentAd.title}
              fill
              className="object-cover"
              priority
            />
            {/* Overlay on hover */}
            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-all duration-300" />
          </div>

          {/* Ad Info */}
          <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 dark:from-gray-900/95 to-transparent p-3 sm:p-4 md:p-6">
            <div className="flex items-center justify-between gap-2">
              <div className="flex-1 min-w-0">
                <h3 className="text-white dark:text-white text-base sm:text-lg md:text-xl font-bold mb-1 truncate">
                  {currentAd.title}
                </h3>
                <p className="text-white/90 dark:text-gray-200 text-xs sm:text-sm line-clamp-2 mb-1 md:mb-2">
                  {currentAd.description}
                </p>
                <p className="text-white/70 dark:text-gray-400 text-xs">
                  by {currentAd.companyName}
                </p>
              </div>
              <div className="flex-shrink-0 hidden sm:block">
                <div className="bg-[#f58c55] text-white px-3 md:px-4 py-2 rounded-lg font-semibold text-xs md:text-sm group-hover:bg-[#e67e4a] transition-colors whitespace-nowrap">
                  Learn More →
                </div>
              </div>
            </div>
          </div>

          {/* Ad Indicator */}
          <div className="absolute top-2 md:top-4 right-2 md:right-4 bg-black/50 text-white text-xs px-2 md:px-3 py-1 rounded-full backdrop-blur-sm">
            Sponsored
          </div>

          {/* Cancel Button */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              handleDismissAd(currentAd._id);
            }}
            className="absolute top-2 md:top-4 left-2 md:left-4 bg-black/60 hover:bg-black/80 text-white p-2 rounded-full backdrop-blur-sm transition-all duration-200 hover:scale-110"
            title="Dismiss this ad"
          >
            <FaTimes size={14} className="sm:w-4 sm:h-4" />
          </button>
        </motion.div>
      </AnimatePresence>

      {/* Navigation Dots */}
      {ads.length > 1 && (
        <div className="absolute bottom-14 sm:bottom-16 md:bottom-20 left-1/2 transform -translate-x-1/2 flex space-x-2">
          {visibleAds.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentAdIndex(index)}
              className={`w-2 h-2 rounded-full transition-all ${
                index === (currentAdIndex % visibleAds.length)
                  ? 'bg-white w-4 sm:w-6'
                  : 'bg-white/50 hover:bg-white/75'
              }`}
            />
          ))}
        </div>
      )}
    </div>
  );
}
