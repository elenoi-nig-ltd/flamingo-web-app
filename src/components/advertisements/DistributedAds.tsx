'use client';

import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Image from 'next/image';
import axios from 'axios';
import { BASEURL } from '@/config/api/contants';
import { FaTimes } from 'react-icons/fa';

interface Advertisement {
  _id: string;
  title: string;
  description: string;
  imageUrl: string;
  targetUrl: string;
  companyName: string;
}

interface DistributedAdsProps {
  location: string;
  position: number; // Which ad to show (0, 1, 2, etc.)
  className?: string;
}

export default function DistributedAds({ location, position, className = '' }: DistributedAdsProps) {
  const [ad, setAd] = useState<Advertisement | null>(null);
  const [loading, setLoading] = useState(true);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    fetchAd();
  }, [location, position]);

  const fetchAd = async () => {
    try {
      const response = await axios.get(
        `${BASEURL}/advertisements/active/${location}`
      );
      const ads = response.data;
      if (ads && ads.length > position) {
        setAd(ads[position]);
      }
    } catch (err) {
      console.error(`Failed to fetch ad for ${location}:`, err);
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

  const handleDismiss = () => {
    setDismissed(true);
  };

  useEffect(() => {
    if (ad) {
      trackImpression(ad._id);
    }
  }, [ad]);

  if (loading || !ad || dismissed) {
    return null;
  }

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        transition={{ duration: 0.3 }}
        className={`relative overflow-hidden rounded-xl shadow-lg ${className}`}
      >
        <div
          onClick={() => handleAdClick(ad)}
          className="relative cursor-pointer group"
        >
          {/* Ad Image */}
          <div className="relative w-full h-48 sm:h-56 md:h-64">
            <Image
              src={ad.imageUrl}
              alt={ad.title}
              fill
              className="object-cover"
              priority
            />
            {/* Overlay on hover */}
            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-all duration-300" />
          </div>

          {/* Ad Info */}
          <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 dark:from-gray-900/95 to-transparent p-4">
            <div className="flex items-center justify-between gap-2">
              <div className="flex-1 min-w-0">
                <h3 className="text-white text-base md:text-lg font-bold mb-1 truncate">
                  {ad.title}
                </h3>
                <p className="text-white/90 text-xs md:text-sm line-clamp-2 mb-1">
                  {ad.description}
                </p>
                <p className="text-white/70 text-xs">
                  by {ad.companyName}
                </p>
              </div>
              <div className="flex-shrink-0">
                <div className="bg-[#f58c55] text-white px-3 py-2 rounded-lg font-semibold text-xs md:text-sm group-hover:bg-[#e67e4a] transition-colors whitespace-nowrap">
                  Learn More →
                </div>
              </div>
            </div>
          </div>

          {/* Ad Indicator */}
          <div className="absolute top-2 right-2 bg-black/50 text-white text-xs px-2 py-1 rounded-full backdrop-blur-sm">
            Sponsored
          </div>

          {/* Cancel Button */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              handleDismiss();
            }}
            className="absolute top-2 left-2 bg-black/60 hover:bg-black/80 text-white p-2 rounded-full backdrop-blur-sm transition-all duration-200 hover:scale-110"
            title="Dismiss this ad"
          >
            <FaTimes size={14} />
          </button>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
