'use client';

import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FaTimes, FaBullhorn, FaImage, FaCheck, FaChartLine } from 'react-icons/fa';

interface AdsFeatureAnnouncementProps {
  onDismiss?: () => void;
}

export default function AdsFeatureAnnouncement({ onDismiss }: AdsFeatureAnnouncementProps) {
  const [show, setShow] = useState(false);

  useEffect(() => {
    // Check if user has seen this announcement
    const hasSeenAnnouncement = localStorage.getItem('ads-feature-announcement-seen');
    if (!hasSeenAnnouncement) {
      // Show after 2 seconds for better UX
      const timer = setTimeout(() => {
        setShow(true);
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, []);

  const handleDismiss = () => {
    setShow(false);
    localStorage.setItem('ads-feature-announcement-seen', 'true');
    onDismiss?.();
  };

  const features = [
    {
      icon: FaBullhorn,
      title: 'Reach More Customers',
      description: 'Promote your products and services to thousands of users',
    },
    {
      icon: FaImage,
      title: 'Easy Ad Creation',
      description: 'Simple form with drag-and-drop image uploads',
    },
    {
      icon: FaCheck,
      title: 'Strategic Placement',
      description: 'Choose where your ads appear across the platform',
    },
    {
      icon: FaChartLine,
      title: 'Track Performance',
      description: 'Monitor impressions and clicks in real-time',
    },
  ];

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
          className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 pt-20 md:pt-4"
          onClick={handleDismiss}
        >
          <motion.div
            initial={{ scale: 0.8, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.8, opacity: 0, y: 20 }}
            transition={{ duration: 0.4, type: 'spring', stiffness: 100 }}
            className="relative bg-white dark:bg-gray-900 rounded-2xl shadow-2xl max-w-2xl w-full max-h-[85vh] overflow-y-auto mt-16 md:mt-8"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header with gradient background */}
            <div className="relative bg-gradient-to-r from-[#f58c55] to-[#e67e4a] p-8 text-white overflow-hidden">
              {/* Animated background elements */}
              <div className="absolute inset-0 overflow-hidden">
                <motion.div
                  className="absolute w-40 h-40 bg-white/10 rounded-full"
                  style={{ top: -50, right: -50 }}
                  animate={{ y: [0, 20, 0] }}
                  transition={{ duration: 4, repeat: Infinity }}
                />
                <motion.div
                  className="absolute w-32 h-32 bg-white/10 rounded-full"
                  style={{ bottom: -30, left: -30 }}
                  animate={{ y: [0, -20, 0] }}
                  transition={{ duration: 5, repeat: Infinity }}
                />
              </div>

              {/* Close button */}
              <button
                onClick={handleDismiss}
                className="absolute top-4 right-4 bg-white/20 hover:bg-white/30 text-white p-2 rounded-full transition-all duration-200 hover:scale-110 z-10"
              >
                <FaTimes size={20} />
              </button>

              {/* Content */}
              <div className="relative z-5">
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.2, duration: 0.5, type: 'spring' }}
                  className="mb-4"
                >
                  <FaBullhorn size={40} />
                </motion.div>
                <h2 className="text-3xl font-bold mb-2">Introducing Advertisements! 🎉</h2>
                <p className="text-lg text-white/90">
                  Grow your business with our brand new advertising platform
                </p>
              </div>
            </div>

            {/* Features Grid */}
            <div className="p-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                {features.map((feature, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.1 * (index + 1), duration: 0.4 }}
                    className="flex gap-4 p-4 rounded-lg bg-gray-50 dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                  >
                    <div className="flex-shrink-0">
                      <div className="flex items-center justify-center h-12 w-12 rounded-lg bg-[#f58c55] text-white">
                        <feature.icon size={24} />
                      </div>
                    </div>
                    <div>
                      <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-1">
                        {feature.title}
                      </h3>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        {feature.description}
                      </p>
                    </div>
                  </motion.div>
                ))}
              </div>

              {/* Benefits section */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.6, duration: 0.4 }}
                className="bg-blue-50 dark:bg-blue-900/20 border-l-4 border-blue-500 p-4 rounded mb-8"
              >
                <h4 className="font-semibold text-gray-900 dark:text-white mb-2">Why Advertise With Us?</h4>
                <ul className="text-sm text-gray-700 dark:text-gray-300 space-y-2">
                  <li className="flex items-center">
                    <span className="w-2 h-2 bg-blue-500 rounded-full mr-3"></span>
                    Get seen by thousands of active users
                  </li>
                  <li className="flex items-center">
                    <span className="w-2 h-2 bg-blue-500 rounded-full mr-3"></span>
                    Affordable pricing with flexible durations
                  </li>
                  <li className="flex items-center">
                    <span className="w-2 h-2 bg-blue-500 rounded-full mr-3"></span>
                    Real-time analytics and performance tracking
                  </li>
                  <li className="flex items-center">
                    <span className="w-2 h-2 bg-blue-500 rounded-full mr-3"></span>
                    Quick approval and instant visibility
                  </li>
                </ul>
              </motion.div>

              {/* CTA Button */}
              <motion.button
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.7, duration: 0.4 }}
                onClick={() => {
                  const adLink = document.querySelector('a[href*="create-ad"]') as HTMLAnchorElement;
                  if (adLink) {
                    adLink.click();
                  }
                  handleDismiss();
                }}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="w-full bg-gradient-to-r from-[#f58c55] to-[#e67e4a] hover:from-[#e67e4a] hover:to-[#d67139] text-white font-bold py-3 px-6 rounded-lg transition-all duration-200 flex items-center justify-center gap-2 mb-4"
              >
                Start Creating Ads
                <span className="text-lg">→</span>
              </motion.button>

              {/* Dismiss option */}
              <motion.button
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.8, duration: 0.4 }}
                onClick={handleDismiss}
                className="w-full text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white font-medium py-2 transition-colors"
              >
                Maybe Later
              </motion.button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
