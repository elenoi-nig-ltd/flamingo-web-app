'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { FaCheck } from 'react-icons/fa';
import { AD_LOCATIONS, AD_DURATIONS, calculateAdPrice } from '@/config/adPricing';

interface AdPlanSelectorProps {
  selectedLocation: string;
  selectedDuration: number;
  onLocationSelect: (location: string) => void;
  onDurationSelect: (duration: number) => void;
}

export default function AdPlanSelector({
  selectedLocation,
  selectedDuration,
  onLocationSelect,
  onDurationSelect,
}: AdPlanSelectorProps) {
  const totalPrice = calculateAdPrice(selectedLocation, selectedDuration);
  const pricePerDay = totalPrice / selectedDuration;

  return (
    <div className="space-y-8">
      {/* Location Selection */}
      <div>
        <h3 className="text-2xl font-bold mb-4 text-gray-800 dark:text-white">
          Select Ad Placement
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {Object.values(AD_LOCATIONS).map((location) => {
            const isSelected = selectedLocation === location.id;
            const estimatedPrice = calculateAdPrice(location.id, 30); // 1 month estimate

            return (
              <motion.div
                key={location.id}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => onLocationSelect(location.id)}
                className={`relative p-6 rounded-xl cursor-pointer transition-all ${
                  isSelected
                    ? 'bg-gradient-to-br from-[#f58c55] to-[#ff6b35] text-white shadow-xl'
                    : 'bg-white dark:bg-gray-800 border-2 border-gray-200 dark:border-gray-700 hover:border-[#f58c55] text-gray-800 dark:text-gray-200'
                }`}
              >
                {isSelected && (
                  <div className="absolute top-3 right-3">
                    <FaCheck className="text-white text-xl" />
                  </div>
                )}

                <div className="text-4xl mb-3">{location.icon}</div>
                <h4 className="text-lg font-bold mb-2">{location.name}</h4>
                <p
                  className={`text-sm mb-4 ${
                    isSelected ? 'text-white/90' : 'text-gray-600 dark:text-gray-400'
                  }`}
                >
                  {location.description}
                </p>

                <div className={`mt-4 pt-4 border-t ${
                  isSelected ? 'border-white/20' : 'border-gray-200 dark:border-gray-700'
                }`}>
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">
                      ₦{location.basePrice}/day
                    </span>
                    <span className="text-xs">
                      ~₦{estimatedPrice.toLocaleString()}/mo
                    </span>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>

      {/* Duration Selection */}
      <div>
        <h3 className="text-2xl font-bold mb-4 text-gray-800 dark:text-white">
          Select Campaign Duration
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          {AD_DURATIONS.map((duration) => {
            const isSelected = selectedDuration === duration.days;
            const price = calculateAdPrice(selectedLocation, duration.days);

            return (
              <motion.div
                key={duration.days}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => onDurationSelect(duration.days)}
                className={`relative p-4 rounded-lg cursor-pointer text-center transition-all ${
                  isSelected
                    ? 'bg-[#f58c55] text-white shadow-lg'
                    : 'bg-white dark:bg-gray-800 border-2 border-gray-200 dark:border-gray-700 hover:border-[#f58c55] dark:text-gray-200'
                }`}
              >
                {duration.discount > 0 && (
                  <div className="absolute -top-2 -right-2 bg-green-500 text-white text-xs font-bold px-2 py-1 rounded-full">
                    Save {(duration.discount * 100).toFixed(0)}%
                  </div>
                )}

                {isSelected && (
                  <div className="absolute top-2 left-2">
                    <FaCheck className="text-white" />
                  </div>
                )}

                <div className="text-2xl font-bold mb-1">{duration.label}</div>
                <div className="text-sm opacity-90">
                  ₦{price.toLocaleString()}
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>

      {/* Price Summary */}
      {selectedLocation && selectedDuration && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-gray-800 dark:to-gray-900 p-6 rounded-xl"
        >
          <h4 className="text-xl font-bold mb-4 text-gray-800 dark:text-white">
            Campaign Summary
          </h4>
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-gray-600 dark:text-gray-400">Selected Placement:</span>
              <span className="font-semibold text-gray-800 dark:text-white">
                {
                  Object.values(AD_LOCATIONS).find(
                    (loc) => loc.id === selectedLocation
                  )?.name
                }
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600 dark:text-gray-400">Duration:</span>
              <span className="font-semibold text-gray-800 dark:text-white">
                {
                  AD_DURATIONS.find((d) => d.days === selectedDuration)
                    ?.label
                }
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600 dark:text-gray-400">Price per Day:</span>
              <span className="font-semibold text-gray-800 dark:text-white">
                ₦{pricePerDay.toFixed(2)}
              </span>
            </div>
            <div className="pt-3 border-t border-gray-300 dark:border-gray-700 flex justify-between items-center">
              <span className="text-lg font-bold text-gray-800 dark:text-white">
                Total Price:
              </span>
              <span className="text-2xl font-bold text-[#f58c55]">
                ₦{totalPrice.toLocaleString()}
              </span>
            </div>
          </div>
        </motion.div>
      )}
    </div>
  );
}
