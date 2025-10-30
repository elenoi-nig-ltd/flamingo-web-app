// components/ui/SkeletonLoader.tsx
'use client';

import { motion } from 'framer-motion';

interface SkeletonProps {
  className?: string;
  variant?: 'rectangular' | 'circular' | 'text' | 'rounded';
  width?: string | number;
  height?: string | number;
  animation?: 'pulse' | 'wave' | 'none';
}

const Skeleton = ({ 
  className = '', 
  variant = 'rectangular', 
  width = '100%', 
  height = '20px',
  animation = 'pulse'
}: SkeletonProps) => {
  const getVariantClasses = () => {
    switch (variant) {
      case 'circular':
        return 'rounded-full';
      case 'text':
        return 'rounded';
      case 'rounded':
        return 'rounded-lg';
      default:
        return '';
    }
  };

  const getAnimationClasses = () => {
    switch (animation) {
      case 'wave':
        return 'animate-wave';
      case 'pulse':
        return 'animate-pulse';
      default:
        return '';
    }
  };

  const style = {
    width: typeof width === 'number' ? `${width}px` : width,
    height: typeof height === 'number' ? `${height}px` : height,
  };

  return (
    <div
      className={`bg-gray-300 ${getVariantClasses()} ${getAnimationClasses()} ${className}`}
      style={style}
    />
  );
};

// Dashboard-specific skeleton loaders
export const DashboardCardSkeleton = () => {
  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <div className="flex items-center justify-between">
        <div className="space-y-2">
          <Skeleton width="60px" height="16px" variant="text" />
          <Skeleton width="80px" height="32px" variant="text" />
        </div>
        <Skeleton width="48px" height="48px" variant="circular" />
      </div>
    </div>
  );
};

export const TableSkeleton = ({ rows = 5 }: { rows?: number }) => {
  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <Skeleton width="200px" height="24px" variant="text" className="mb-4" />
      <div className="space-y-3">
        {/* Table Header */}
        <div className="flex space-x-4 border-b pb-2">
          <Skeleton width="80px" height="16px" variant="text" />
          <Skeleton width="120px" height="16px" variant="text" />
          <Skeleton width="80px" height="16px" variant="text" />
          <Skeleton width="80px" height="16px" variant="text" />
        </div>
        {/* Table Rows */}
        {Array.from({ length: rows }).map((_, index) => (
          <div key={index} className="flex space-x-4 py-2">
            <Skeleton width="80px" height="16px" variant="text" />
            <Skeleton width="120px" height="16px" variant="text" />
            <Skeleton width="80px" height="16px" variant="text" />
            <Skeleton width="60px" height="20px" variant="rounded" />
          </div>
        ))}
      </div>
    </div>
  );
};

export const ChartSkeleton = () => {
  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <Skeleton width="180px" height="24px" variant="text" className="mb-4" />
      <div className="h-[300px] bg-gray-200 rounded-lg flex items-end justify-around p-4">
        {Array.from({ length: 12 }).map((_, index) => (
          <motion.div
            key={index}
            className="bg-gray-300 rounded-t"
            style={{
              height: `${Math.random() * 200 + 50}px`,
              width: '20px',
            }}
            initial={{ height: 0 }}
            animate={{ height: `${Math.random() * 200 + 50}px` }}
            transition={{ duration: 1, delay: index * 0.1 }}
          />
        ))}
      </div>
    </div>
  );
};

export const DashboardSkeleton = () => {
  return (
    <div className="flex flex-col p-6 animate-pulse">
      {/* Title Skeleton */}
      <Skeleton width="300px" height="36px" variant="text" className="mb-6" />

      {/* Analytics Cards Skeleton */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-8">
        {Array.from({ length: 4 }).map((_, index) => (
          <DashboardCardSkeleton key={index} />
        ))}
      </div>

      {/* Charts and Tables Skeleton */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <ChartSkeleton />
        <TableSkeleton rows={4} />
      </div>
    </div>
  );
};

export const TopbarSkeleton = () => {
  return (
    <div className="bg-white shadow-sm border-b border-gray-200 px-4 lg:px-6 py-4">
      <div className="flex items-center justify-between">
        {/* Left Section */}
        <div className="flex items-center space-x-4">
          <Skeleton width="40px" height="40px" variant="rounded" className="lg:hidden" />
          <div className="hidden md:block space-y-2">
            <Skeleton width="250px" height="24px" variant="text" />
            <Skeleton width="200px" height="16px" variant="text" />
          </div>
        </div>

        {/* Right Section */}
        <div className="flex items-center space-x-4">
          <Skeleton width="256px" height="40px" variant="rounded" className="hidden sm:block" />
          <Skeleton width="40px" height="40px" variant="circular" className="sm:hidden" />
          <Skeleton width="40px" height="40px" variant="circular" />
          <div className="flex items-center space-x-2">
            <Skeleton width="32px" height="32px" variant="circular" />
            <div className="hidden md:block space-y-1">
              <Skeleton width="100px" height="14px" variant="text" />
              <Skeleton width="80px" height="12px" variant="text" />
            </div>
            <Skeleton width="16px" height="16px" variant="circular" />
          </div>
        </div>
      </div>
    </div>
  );
};

export const SidebarSkeleton = () => {
  return (
    <div className="bg-black text-orange-400 h-screen fixed left-0 top-0 w-64">
      <div className="flex flex-col h-full">
        <div className="p-4">
          <Skeleton width="180px" height="32px" variant="text" className="bg-gray-700" />
        </div>
        <nav className="flex-1 overflow-y-auto">
          <ul className="space-y-2 p-4">
            {Array.from({ length: 9 }).map((_, index) => (
              <li key={index} className="flex items-center p-2 space-x-3">
                <Skeleton width="24px" height="24px" variant="rounded" className="bg-gray-700" />
                <Skeleton width="120px" height="16px" variant="text" className="bg-gray-700" />
              </li>
            ))}
          </ul>
        </nav>
        <div className="p-4 border-t border-orange-900/20">
          <div className="flex items-center p-2 space-x-3">
            <Skeleton width="24px" height="24px" variant="rounded" className="bg-gray-700" />
            <Skeleton width="80px" height="16px" variant="text" className="bg-gray-700" />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Skeleton;