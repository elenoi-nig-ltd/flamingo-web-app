
'use client';

import { useRouter } from 'next/navigation';
import { FaUser, FaBox, FaSignOutAlt, FaShoppingCart, FaChartBar , FaWarehouse, FaCreditCard, FaHome, FaNetworkWired, FaBullhorn, FaEnvelope, FaTags, FaBell, FaCalendarCheck, FaAd } from 'react-icons/fa';
import { FaCog } from 'react-icons/fa';
import { ImSpoonKnife } from 'react-icons/im';
import { motion, AnimatePresence } from 'framer-motion';
import { useSidebar } from './SidebarContext';
import { useAuth } from '@/hooks/useAuth';
import { useState, useEffect } from 'react';

export default function Sidebar() {
  const { isOpen, toggleSidebar } = useSidebar();
  const { logout } = useAuth();
  const router = useRouter();
  const [isMobile, setIsMobile] = useState<boolean>(false);

  const menuItems = [
    { name: 'Dashboard', icon: <FaChartBar  />, path: '/admin/dashboard', active: true },
    { name: 'Food', icon: <ImSpoonKnife />, path: '/admin/dashboard/products', active: true },
    { name: 'Home Items', icon: <FaHome />, path: '/admin/dashboard/home-items', active: true },
    { name: 'Categories', icon: <FaTags />, path: '/admin/dashboard/categories', active: true },
    { name: 'Orders', icon: <FaShoppingCart />, path: '/admin/dashboard/orders', active: true },
    { name: 'Inventory', icon: <FaWarehouse />, path: '/admin/dashboard/inventory', active: true },
    { name: 'Payments', icon: <FaCreditCard />, path: '/admin/payments', active: false },
    { name: 'Real Estate', icon: <FaHome />, path: '/admin/dashboard/real-estates', active: true },
    { name: 'Bookings', icon: <FaCalendarCheck />, path: '/admin/dashboard/bookings', active: true },
    { name: 'Advertisements', icon: <FaAd />, path: '/admin/dashboard/advertisements', active: true },
    { name: 'Internet Packages', icon: <FaNetworkWired />, path: '/admin/dashboard/internet', active: true },
    { name: 'Notifications', icon: <FaBell />, path: '/admin/dashboard/notifications', active: true },
    { name: 'Marquee Messages', icon: <FaBullhorn />, path: '/admin/dashboard/marquee', active: true },
    { name: 'Promotions', icon: <FaBullhorn />, path: '/admin/promotions', active: false },
    { name: 'Messages', icon: <FaEnvelope />, path: '/admin/messages', active: false },
  ];
 

  const handleNavigation = (path: string, active: boolean) => {
    if (active) {
      router.push(path);
      if (isMobile) {
        toggleSidebar();
      }
    }
  };

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 1024);
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return (
    <>
      <AnimatePresence>
        {isMobile && isOpen && (
          <motion.div
            className="fixed inset-0 bg-black/50 dark:bg-black/60 z-40 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={toggleSidebar}
          />
        )}
      </AnimatePresence>

      <motion.div
        className={`h-screen fixed left-0 top-0 z-50 ${
          isOpen
            ? 'bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm border-r border-gray-200/50 dark:border-gray-700/50'
            : isMobile
            ? 'bg-transparent dark:bg-transparent'
            : 'bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm border-r border-gray-200/50 dark:border-gray-700/50'
        }`}
        initial={{ width: 256 }}
        animate={{ 
          width: isOpen ? 256 : (isMobile ? 0 : 256),
          x: isMobile && !isOpen ? -256 : 0
        }}
        transition={{ duration: 0.3, ease: 'easeInOut' }}
      >
        <div className="flex flex-col h-full">
          <div className="p-4 flex items-center justify-between">
            <AnimatePresence>
              {isOpen && (
                <motion.h2
                  className="text-2xl font-bold bg-gradient-to-r from-[#f58c55] to-[#f47a45] bg-clip-text text-transparent"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.2 }}
                >
                  Flamingo Admin
                </motion.h2>
              )}
            </AnimatePresence>
            {isMobile && (
              <button
                onClick={toggleSidebar}
                className="text-[#f58c55] dark:text-[#f7a16b] hover:text-[#f47a45] dark:hover:text-[#f58c55] p-2"
              >
                <svg
                  className="w-6 h-6"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d={isOpen ? 'M6 18L18 6M6 6l12 12' : 'M4 6h16M4 12h16M4 18h16'}
                  />
                </svg>
              </button>
            )}
          </div>
          <nav className="flex-1 overflow-y-auto">
            <ul className="space-y-2 p-4">
              {menuItems.map((item) => (
                <motion.li
                  key={item.name}
                  whileHover={{ scale: item.active ? 1.05 : 1 }}
                  whileTap={{ scale: item.active ? 0.95 : 1 }}
                  className={`flex items-center p-3 rounded-xl cursor-pointer transition-all duration-300 ${
                    item.active
                      ? 'bg-gradient-to-r from-[#f58c55]/10 to-[#f47a45]/10 dark:from-[#f7a16b]/10 dark:to-[#f58c55]/10 hover:from-[#f58c55]/20 hover:to-[#f47a45]/20 dark:hover:from-[#f7a16b]/20 dark:hover:to-[#f58c55]/20'
                      : 'opacity-50 cursor-not-allowed'
                  }`}
                  onClick={() => handleNavigation(item.path, item.active)}
                >
                  <span className="text-xl mr-3 text-[#f58c55] dark:text-[#f7a16b]">{item.icon}</span>
                  <AnimatePresence>
                    {isOpen && (
                      <motion.span
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -10 }}
                        transition={{ duration: 0.2 }}
                        className="text-gray-800 dark:text-gray-200"
                      >
                        {item.name}
                      </motion.span>
                    )}
                  </AnimatePresence>
                </motion.li>
              ))}
            </ul>
          </nav>
          <div className="p-4 border-t border-gray-200/50 dark:border-gray-700/50">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="flex items-center p-3 w-full rounded-xl bg-gradient-to-r from-[#f58c55]/10 to-[#f47a45]/10 dark:from-[#f7a16b]/10 dark:to-[#f58c55]/10 hover:from-[#f58c55]/20 hover:to-[#f47a45]/20 dark:hover:from-[#f7a16b]/20 dark:hover:to-[#f58c55]/20 text-[#f58c55] dark:text-[#f7a16b] transition-all duration-300"
              onClick={() => {
                logout();
                if (isMobile) {
                  toggleSidebar();
                }
              }}
            >
              <FaSignOutAlt className="text-xl mr-3" />
              <AnimatePresence>
                {isOpen && (
                  <motion.span
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -10 }}
                    transition={{ duration: 0.2 }}
                    className="text-gray-800 dark:text-gray-200"
                  >
                    Logout
                  </motion.span>
                )}
              </AnimatePresence>
            </motion.button>
          </div>
        </div>
      </motion.div>
    </>
  );
}
