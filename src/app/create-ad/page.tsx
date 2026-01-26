'use client';

import React from 'react';
import { motion } from 'framer-motion';
import AdForm from '@/components/advertisements/AdForm';
import { FaBullhorn } from 'react-icons/fa';

export default function CreateAdPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-blue-50 dark:from-gray-950 dark:via-gray-900 dark:to-gray-950 py-12">
      <div className="max-w-7xl mx-auto px-4">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <div className="flex items-center justify-center mb-4">
            <div className="w-16 h-16 bg-gradient-to-br from-[#f58c55] to-[#ff6b35] rounded-full flex items-center justify-center">
              <FaBullhorn className="text-3xl text-white" />
            </div>
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-gray-800 dark:text-white mb-4">
            Promote Your Brand
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
            Reach thousands of potential customers with strategic ad placements across our platform
          </p>
        </motion.div>

        {/* Ad Form */}
        <AdForm />

        {/* Benefits Section */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="mt-16 bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8"
        >
          <h3 className="text-2xl font-bold text-gray-800 dark:text-white mb-6 text-center">
            Why Advertise With Us?
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="text-4xl mb-3">🎯</div>
              <h4 className="font-bold text-lg mb-2 dark:text-white">Targeted Audience</h4>
              <p className="text-gray-600 dark:text-gray-400 text-sm">
                Reach users actively looking for products and services
              </p>
            </div>
            <div className="text-center">
              <div className="text-4xl mb-3">📈</div>
              <h4 className="font-bold text-lg mb-2 dark:text-white">Real-Time Analytics</h4>
              <p className="text-gray-600 dark:text-gray-400 text-sm">
                Track impressions and clicks to measure campaign performance
              </p>
            </div>
            <div className="text-center">
              <div className="text-4xl mb-3">💰</div>
              <h4 className="font-bold text-lg mb-2 dark:text-white">Flexible Pricing</h4>
              <p className="text-gray-600 dark:text-gray-400 text-sm">
                Choose plans that fit your budget with volume discounts
              </p>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
