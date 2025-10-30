"use client";

import React from 'react';

interface SkeletonLoaderProps {
  variant?: 'line' | 'card' | 'image' | 'category' | 'property' | 'search';
  width?: string;
  height?: string;
  count?: number;
  className?: string;
  animate?: boolean;
}

const SkeletonLoader: React.FC<SkeletonLoaderProps> = ({
  variant = 'line',
  width = '100%',
  height = 'auto',
  count = 1,
  className = '',
  animate = true,
}) => {
  const baseClasses = `bg-gray-200 dark:bg-gray-700 ${animate ? 'animate-pulse' : ''} rounded-md ${className}`;

  const renderSkeleton = () => {
    const skeletons = Array.from({ length: count }, (_, index) => {
      switch (variant) {
        case 'line':
          return (
            <div
              key={index}
              className={`${baseClasses} h-4 w-${width === '100%' ? 'full' : width}`}
              style={{ height }}
            />
          );

        case 'card':
          return (
            <div
              key={index}
              className={`${baseClasses} w-full h-52 md:h-64`}
            >
              <div className="w-full h-3/4 rounded-t-md bg-gray-300 dark:bg-gray-600" />
              <div className="p-4 space-y-2">
                <div className="h-4 w-4/5 bg-gray-300 dark:bg-gray-600" />
                <div className="h-3 w-3/5 bg-gray-300 dark:bg-gray-600" />
              </div>
            </div>
          );

        case 'image':
          return (
            <div
              key={index}
              className={`${baseClasses} w-full h-48 md:h-64`}
              style={{ width, height }}
            />
          );

        case 'category':
          return (
            <div
              key={index}
              className={`${baseClasses} w-full h-16 flex items-center p-4 gap-3`}
            >
              <div className="w-10 h-10 rounded bg-gray-300 dark:bg-gray-600" />
              <div className="h-4 w-24 bg-gray-300 dark:bg-gray-600" />
            </div>
          );

        case 'property':
          return (
            <div
              key={index}
              className={`${baseClasses} w-full h-80 rounded-xl overflow-hidden`}
            >
              <div className="w-full h-48 bg-gray-300 dark:bg-gray-600" />
              <div className="p-4 space-y-3">
                <div className="h-5 w-full bg-gray-300 dark:bg-gray-600" />
                <div className="h-4 w-3/4 bg-gray-300 dark:bg-gray-600" />
                <div className="flex gap-4">
                  <div className="h-3 w-10 bg-gray-300 dark:bg-gray-600" />
                  <div className="h-3 w-10 bg-gray-300 dark:bg-gray-600" />
                </div>
              </div>
            </div>
          );

        case 'search':
          return (
            <div
              key={index}
              className={`${baseClasses} w-full h-12 rounded-lg`}
            />
          );

        default:
          return <div key={index} className={baseClasses} style={{ width, height }} />;
      }
    });

    return skeletons;
  };

  return <>{renderSkeleton()}</>;
};

export default SkeletonLoader;