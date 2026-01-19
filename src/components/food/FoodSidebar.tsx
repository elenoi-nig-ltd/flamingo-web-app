'use client';

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FaTimes, FaSpinner } from 'react-icons/fa';

interface Category {
  _id: string;
  name: string;
  description: string;
}

interface FoodSidebarProps {
  isOpen: boolean;
  selectedCategory: string;
  selectedCategoryId: string | null;
  onCategorySelect: (category: string, categoryId?: string) => void;
  onClose: () => void;
  categories: Category[];
}

const FoodSidebar: React.FC<FoodSidebarProps> = ({
  isOpen,
  selectedCategory,
  selectedCategoryId,
  onCategorySelect,
  onClose,
  categories,
}) => {

  const handleCategorySelect = (category: string, categoryId?: string) => {
    console.log('Sidebar - Category selected:', category, 'ID:', categoryId);
    onCategorySelect(category, categoryId);
  };

  return (
    <>
      {/* Mobile Sidebar */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ x: -256 }}
            animate={{ x: 0 }}
            exit={{ x: -256 }}
            transition={{ duration: 0.3 }}
            className="fixed left-0 top-20 h-[calc(100vh-5rem)] w-64 bg-gradient-to-b from-[#f58c55] to-[#f58c55]/80 text-white z-50 lg:hidden shadow-lg flex flex-col"
          >
            <div className="flex-shrink-0 flex items-center justify-between p-4 border-b border-white/20 bg-[#f58c55]/90 backdrop-blur-sm">
              <h2 className="text-xl font-bold tracking-tight">Food & Snacks</h2>
              <button
                onClick={onClose}
                className="p-2 text-white hover:text-white/80 transition-colors duration-200 rounded"
                aria-label="Close sidebar"
              >
                <FaTimes size={20} />
              </button>
            </div>
            <nav className="flex-1 overflow-y-auto p-3 min-h-0">
              <ul className="space-y-2">
                <li>
                  <button
                    onClick={() => handleCategorySelect('All')}
                    className={`w-full text-left px-4 py-3 rounded-lg transition-all duration-200 font-medium ${
                      selectedCategory === 'All' && !selectedCategoryId
                        ? 'bg-white/20 text-white shadow-md'
                        : 'hover:bg-white/10 hover:text-white text-white/90'
                    }`}
                  >
                    All
                  </button>
                </li>
                {categories.map((category) => (
                  <li key={category._id}>
                    <button
                      onClick={() => handleCategorySelect(category.name, category._id)}
                      className={`w-full text-left px-4 py-3 rounded-lg transition-all duration-200 font-medium ${
                        selectedCategory === category.name || selectedCategoryId === category._id
                          ? 'bg-white/20 text-white shadow-md'
                          : 'hover:bg-white/10 hover:text-white text-white/90'
                      }`}
                    >
                      {category.name}
                    </button>
                  </li>
                ))}
              </ul>
            </nav>
            <div className="flex-shrink-0 p-4 border-t border-white/20 bg-[#f58c55]/90 backdrop-blur-sm">
              <p className="text-sm text-white/80 text-center">
                {categories.length} Categories Available
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Desktop Sidebar */}
      <div className="hidden lg:flex lg:flex-col fixed left-0 top-20 w-64 bg-gradient-to-b from-[#f58c55] to-[#f58c55]/80 text-white h-[calc(100vh-5rem)] z-30 shadow-lg">
        <div className="flex-shrink-0 p-4 border-b border-white/20 bg-[#f58c55]/90 backdrop-blur-sm">
          <h2 className="text-xl font-bold tracking-tight">Food & Snacks</h2>
        </div>
        <nav className="flex-1 overflow-y-auto p-3 min-h-0">
          <ul className="space-y-2">
            <li>
              <button
                onClick={() => handleCategorySelect('All')}
                className={`w-full text-left px-4 py-3 rounded-lg transition-all duration-200 font-medium ${
                  selectedCategory === 'All' && !selectedCategoryId
                    ? 'bg-white/20 text-white shadow-md'
                    : 'hover:bg-white/10 hover:text-white text-white/90'
                }`}
              >
                All
              </button>
            </li>
            {categories.map((category) => (
              <li key={category._id}>
                <button
                  onClick={() => handleCategorySelect(category.name, category._id)}
                  className={`w-full text-left px-4 py-3 rounded-lg transition-all duration-200 font-medium ${
                    selectedCategory === category.name || selectedCategoryId === category._id
                      ? 'bg-white/20 text-white shadow-md'
                      : 'hover:bg-white/10 hover:text-white text-white/90'
                  }`}
                >
                  {category.name}
                </button>
              </li>
            ))}
          </ul>
        </nav>
        <div className="flex-shrink-0 p-4 border-t border-white/20 bg-[#f58c55]/90 backdrop-blur-sm">
          <p className="text-sm text-white/80 text-center">
            {categories.length} Categories Available
          </p>
        </div>
      </div>
    </>
  );
};

export default FoodSidebar;