'use client';

import React, { useEffect } from 'react';
import { FaTimes } from 'react-icons/fa';
import { useHomeItemCategories } from '@/hooks/useHomeItemCategories';

interface HomeItemsSidebarProps {
  isOpen: boolean;
  selectedCategory: string;
  selectedCategoryId: string | null;
  onCategorySelect: (category: string, categoryId?: string) => void;
  onClose: () => void;
}

const HomeItemsSidebar: React.FC<HomeItemsSidebarProps> = ({
  isOpen,
  selectedCategory,
  selectedCategoryId,
  onCategorySelect,
  onClose
}) => {
  const { categories, loading, error } = useHomeItemCategories();

  useEffect(() => {
    if (selectedCategoryId && categories.length > 0) {
      const category = categories.find(cat => cat._id === selectedCategoryId);
      if (category) {
        onCategorySelect(category.name, category._id);
      }
    }
  }, [selectedCategoryId, categories, onCategorySelect]);

  const handleCategoryClick = (categoryName: string, categoryId?: string) => {
    onCategorySelect(categoryName, categoryId);
    onClose();
  };

  return (
    <div
      className={`fixed lg:sticky top-20 lg:top-20 h-[calc(100vh-5rem)] lg:h-[calc(100vh-5rem)] w-64 bg-gradient-to-b from-[#f58c55] to-[#f58c55]/80 text-white transform transition-transform duration-300 ease-in-out ${
        isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
      } z-30 shadow-lg flex flex-col`} 
    >
      {/* Header */}
      <div className="flex-shrink-0 flex items-center justify-between p-4 border-b border-white/20 bg-[#f58c55]/90 backdrop-blur-sm">
        <h2 className="text-xl font-bold tracking-tight">Categories</h2>
        <button
          onClick={onClose}
          className="lg:hidden text-white hover:text-white/80 transition-colors duration-200"
          aria-label="Close sidebar"
        >
          <FaTimes size={20} />
        </button>
      </div>

      {/* Categories List */}
      <div className="flex-1 overflow-y-auto p-3 min-h-0">
        {loading ? (
          <div className="space-y-3">
            {[...Array(6)].map((_, index) => (
              <div key={index} className="h-10 bg-white/20 rounded-lg animate-pulse"></div>
            ))}
          </div>
        ) : error ? (
          <div className="p-4 text-center text-red-200">
            <p>Error loading categories</p>
          </div>
        ) : (
          <ul className="space-y-2">
            {/* All Category */}
            <li>
              <button
                onClick={() => handleCategoryClick('All')}
                className={`w-full text-left px-4 py-3 rounded-lg transition-all duration-200 font-medium ${
                  selectedCategory === 'All' && !selectedCategoryId
                    ? 'bg-white/20 text-white shadow-md'
                    : 'hover:bg-white/10 hover:text-white text-white/90'
                }`}
              >
                All Items
              </button>
            </li>

            {/* Dynamic Categories */}
            {categories.map((category) => (
              <li key={category._id}>
                <button
                  onClick={() => handleCategoryClick(category.name, category._id)}
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
        )}
      </div>

      {/* Footer */}
      <div className="flex-shrink-0 p-4 border-t border-white/20 bg-[#f58c55]/90 backdrop-blur-sm">
        <p className="text-sm text-white/80 text-center">
          {categories.length} Categories Available
        </p>
      </div>
    </div>
  );
};

export default HomeItemsSidebar;