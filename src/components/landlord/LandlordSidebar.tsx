'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { FaHome, FaPlus, FaCheckCircle, FaUser, FaTimes } from 'react-icons/fa';
import { useRouter, usePathname } from 'next/navigation';
import { IconType } from 'react-icons';

interface MenuItem {
  icon: IconType;
  label: string;
  href: string;
  active: boolean;
}

interface LandlordSidebarProps {
  isOpen: boolean;
  onClose: () => void;
  isDesktop: boolean;
}

const LandlordSidebar: React.FC<LandlordSidebarProps> = ({ isOpen, onClose, isDesktop }) => {
  const router = useRouter();
  const pathname = usePathname();

  const menuItems: MenuItem[] = [
    {
      icon: FaHome,
      label: 'Dashboard',
      href: '/landlord/dashboard',
      active: pathname === '/landlord/dashboard',
    },
    {
      icon: FaHome,
      label: 'List Properties',
      href: '/landlord/properties',
      active: pathname === '/landlord/properties',
    },
    {
      icon: FaPlus,
      label: 'Add Property',
      href: '/landlord/add-properties',
      active: pathname === '/landlord/add-properties',
    },
    {
      icon: FaCheckCircle,
      label: 'Verify Properties',
      href: '/landlord/verify',
      active: pathname === '/landlord/verify',
    },
    {
      icon: FaUser,
      label: 'Profile',
      href: '/landlord/profile',
      active: pathname === '/landlord/profile',
    },
  ];

  const handleNavigation = (href: string): void => {
    router.push(href);
    onClose(); // Close sidebar on mobile after navigation
  };

  return (
    <>
      {/* Mobile Overlay */}
      {isOpen && !isDesktop && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/50 dark:bg-gray-900/50 z-40 md:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <motion.div
        initial={{ x: isDesktop ? 0 : -300 }}
        animate={{ x: isOpen || isDesktop ? 0 : -300 }}
        transition={{ duration: 0.3, ease: 'easeInOut' }}
        className={`fixed left-0 top-0 h-full w-64 bg-white dark:bg-gray-900 shadow-lg z-50 md:relative md:translate-x-0 md:shadow-none border-r border-gray-200 dark:border-gray-700 ${
          isDesktop ? 'overflow-y-auto' : ''
        }`}
      >
        {/* Close button for mobile */}
        {!isDesktop && (
          <div className="flex justify-between items-center p-4 border-b border-gray-200 dark:border-gray-700 md:hidden">
            <h2 className="text-lg font-bold text-gray-800 dark:text-white">Menu</h2>
            <button
              onClick={onClose}
              className="p-2 text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200"
            >
              <FaTimes />
            </button>
          </div>
        )}

        {/* Navigation Menu */}
        <nav className={isDesktop ? "mt-16" : "mt-4"}>
          <ul className="space-y-2 px-4">
            {menuItems.map((item: MenuItem, index: number) => {
              const IconComponent = item.icon;
              return (
                <li key={index}>
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => handleNavigation(item.href)}
                    className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg text-left transition-all duration-200 ${
                      item.active
                        ? 'bg-orange-100 dark:bg-orange-900/20 text-orange-600 dark:text-orange-400 border-r-4 border-orange-600 dark:border-orange-400'
                        : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-orange-600 dark:hover:text-orange-400'
                    }`}
                  >
                    <IconComponent className="text-lg" />
                    <span className="font-medium">{item.label}</span>
                  </motion.button>
                </li>
              );
            })}
          </ul>
        </nav>

        {/* Footer */}
        <div className="absolute bottom-4 left-4 right-4">
          <div className="text-xs text-gray-500 dark:text-gray-400 text-center">
            Landlord Portal v1.0
          </div>
        </div>
      </motion.div>
    </>
  );
};

export default LandlordSidebar;