'use client';

import { useState, useRef, useEffect } from 'react';
import { 
  FaBars, 
  FaSearch, 
  FaBell, 
  FaUser, 
  FaSignOutAlt, 
  FaCog,
  FaChevronDown,
  FaTimes
} from 'react-icons/fa';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '@/hooks/useAuth';
import { useSidebar } from './admin/SidebarContext';
import { TopbarSkeleton } from './ui/SkeletonLoader';

const Topbar = () => {
  const { user, logout, loading } = useAuth();
  const { toggleSidebar } = useSidebar();
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const [showProfileDropdown, setShowProfileDropdown] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [notifications] = useState([
    { id: 1, message: 'New order received', time: '2 min ago', unread: true },
    { id: 2, message: 'Product inventory low', time: '1 hour ago', unread: true },
    { id: 3, message: 'User registration pending', time: '3 hours ago', unread: false },
    { id: 4, message: 'Payment processed successfully', time: '5 hours ago', unread: false },
  ]);
  
  const profileDropdownRef = useRef<HTMLDivElement>(null);
  const notificationDropdownRef = useRef<HTMLDivElement>(null);
  
  const unreadCount = notifications.filter(n => n.unread).length;

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (profileDropdownRef.current && !profileDropdownRef.current.contains(event.target as Node)) {
        setShowProfileDropdown(false);
      }
      if (notificationDropdownRef.current && !notificationDropdownRef.current.contains(event.target as Node)) {
        setShowNotifications(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Searching for:', searchQuery);
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(word => word.charAt(0))
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  if (loading) {
    return <TopbarSkeleton />;
  }

  return (
    <div className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm border-b border-gray-200/50 dark:border-gray-700/50 px-4 lg:px-6 py-4 z-50 relative"> {/* Increased z-index */}
      <div className="flex items-center justify-between">
        {/* Left Section: Hamburger + Welcome Message */}
        <div className="flex items-center space-x-4">
          <button
            onClick={toggleSidebar}
            className="p-2 text-[#f58c55] dark:text-[#f7a16b] hover:bg-gradient-to-r hover:from-[#f58c55]/10 hover:to-[#f47a45]/10 dark:hover:from-[#f7a16b]/10 dark:hover:to-[#f58c55]/10 rounded-xl transition-all duration-300 lg:hidden"
          >
            <FaBars className="text-xl" />
          </button>
          
          <div className="hidden md:block">
            <h1 className="text-xl font-semibold bg-gradient-to-r from-[#f58c55] to-[#f47a45] bg-clip-text text-transparent">
              Welcome back, {user?.name || 'Admin'}!
            </h1>
            <p className="text-sm text-gray-600 dark:text-gray-300">
              {new Date().toLocaleDateString('en-US', { 
                weekday: 'long', 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric' 
              })}
            </p>
          </div>
        </div>

        {/* Right Section: Search + Notifications + Profile */}
        <div className="flex items-center space-x-4">
          {/* Search Bar */}
          <form onSubmit={handleSearch} className="relative hidden sm:block">
            <motion.div
              className={`relative ${isSearchFocused ? 'w-80' : 'w-64'} transition-all duration-300`}
            >
              <input
                type="text"
                placeholder="Search..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onFocus={() => setIsSearchFocused(true)}
                onBlur={() => setIsSearchFocused(false)}
                className="w-full pl-10 pr-10 py-2 bg-white/50 dark:bg-gray-700/50 backdrop-blur-sm border border-gray-200/50 dark:border-gray-600/50 rounded-xl text-gray-900 dark:text-gray-200 placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#f58c55]/50 dark:focus:ring-[#f7a16b]/50 focus:border-transparent transition-all duration-300"
              />
              <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-gray-300" />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-gray-300 hover:text-gray-600 dark:hover:text-gray-200"
                >
                  <FaTimes />
                </button>
              )}
            </motion.div>
          </form>

          {/* Mobile Search Button */}
          <button className="p-2 text-[#f58c55] dark:text-[#f7a16b] hover:bg-gradient-to-r hover:from-[#f58c55]/10 hover:to-[#f47a45]/10 dark:hover:from-[#f7a16b]/10 dark:hover:to-[#f58c55]/10 rounded-xl transition-all duration-300 sm:hidden">
            <FaSearch className="text-lg" />
          </button>

          {/* Notifications */}
          <div className="relative" ref={notificationDropdownRef}>
            <button
              onClick={() => setShowNotifications(!showNotifications)}
              className="relative p-2 text-[#f58c55] dark:text-[#f7a16b] hover:bg-gradient-to-r hover:from-[#f58c55]/10 hover:to-[#f47a45]/10 dark:hover:from-[#f7a16b]/10 dark:hover:to-[#f58c55]/10 rounded-xl transition-all duration-300"
            >
              <FaBell className="text-lg" />
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-500 dark:bg-red-600 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                  {unreadCount}
                </span>
              )}
            </button>

            <AnimatePresence>
              {showNotifications && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="absolute right-0 mt-2 w-80 bg-white/95 dark:bg-gray-800/95 backdrop-blur-sm rounded-xl shadow-xl border border-gray-200/50 dark:border-gray-700/50 z-60" // Increased z-index and opacity
                >
                  <div className="p-4 border-b border-gray-200/50 dark:border-gray-700/50">
                    <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200">Notifications</h3>
                  </div>
                  <div className="max-h-64 overflow-y-auto">
                    {notifications.map((notification) => (
                      <div
                        key={notification.id}
                        className={`p-4 border-b border-gray-200/50 dark:border-gray-700/50 hover:bg-gradient-to-r hover:from-[#f58c55]/5 hover:to-[#f47a45]/5 dark:hover:from-[#f7a16b]/5 dark:hover:to-[#f58c55]/5 cursor-pointer transition-all duration-300 ${
                          notification.unread ? 'bg-blue-50/50 dark:bg-blue-900/20' : ''
                        }`}
                      >
                        <div className="flex items-start space-x-3">
                          <div className={`w-2 h-2 rounded-full mt-2 ${
                            notification.unread ? 'bg-blue-500 dark:bg-blue-400' : 'bg-gray-300 dark:bg-gray-600'
                          }`} />
                          <div className="flex-1">
                            <p className="text-sm text-gray-800 dark:text-gray-200">{notification.message}</p>
                            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">{notification.time}</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="p-3 border-t border-gray-200/50 dark:border-gray-700/50">
                    <button className="w-full text-sm text-center text-[#f58c55] dark:text-[#f7a16b] hover:text-[#f47a45] dark:hover:text-[#f58c55] font-medium">
                      View all notifications
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Profile Dropdown - Fixed z-index issues */}
          <div className="relative" ref={profileDropdownRef}>
            <button
              onClick={() => setShowProfileDropdown(!showProfileDropdown)}
              className="flex items-center space-x-2 p-2 text-[#f58c55] dark:text-[#f7a16b] hover:bg-gradient-to-r hover:from-[#f58c55]/10 hover:to-[#f47a45]/10 dark:hover:from-[#f7a16b]/10 dark:hover:to-[#f58c55]/10 rounded-xl transition-all duration-300"
            >
              <div className="w-8 h-8 bg-gradient-to-r from-[#f58c55] to-[#f47a45] dark:from-[#f7a16b] dark:to-[#f58c55] rounded-full flex items-center justify-center text-white text-sm font-medium">
                {user?.name ? getInitials(user.name) : 'A'}
              </div>
              <div className="hidden md:block text-left">
                <p className="text-sm font-medium text-gray-800 dark:text-gray-200">{user?.name || 'Admin'}</p>
                <p className="text-xs text-gray-500 dark:text-gray-400 capitalize">{user?.role || 'Administrator'}</p>
              </div>
              <FaChevronDown className={`text-sm transition-transform ${showProfileDropdown ? 'rotate-180' : ''}`} />
            </button>

            <AnimatePresence>
              {showProfileDropdown && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="absolute right-0 mt-2 w-56 bg-white/95 dark:bg-gray-800/95 backdrop-blur-sm rounded-xl shadow-xl border border-gray-200/50 dark:border-gray-700/50 z-60" // Increased z-index and opacity
                  style={{ 
                    position: 'fixed', // Use fixed positioning to break out of container
                    top: 'calc(100% + 8px)', // Position below the button
                    right: '16px' // Align with the right edge
                  }}
                >
                  <div className="p-4 border-b border-gray-200/50 dark:border-gray-700/50">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-gradient-to-r from-[#f58c55] to-[#f47a45] dark:from-[#f7a16b] dark:to-[#f58c55] rounded-full flex items-center justify-center text-white font-medium">
                        {user?.name ? getInitials(user.name) : 'A'}
                      </div>
                      <div>
                        <p className="font-medium text-gray-800 dark:text-gray-200">{user?.name || 'Admin'}</p>
                        <p className="text-sm text-gray-500 dark:text-gray-400">{user?.email || 'admin@example.com'}</p>
                        <p className="text-xs text-gray-400 dark:text-gray-500 capitalize">{user?.role || 'Administrator'}</p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="py-2">
                    <button className="w-full px-4 py-2 text-left text-sm text-gray-800 dark:text-gray-200 hover:bg-gradient-to-r hover:from-[#f58c55]/10 hover:to-[#f47a45]/10 dark:hover:from-[#f7a16b]/10 dark:hover:to-[#f58c55]/10 flex items-center space-x-3 transition-all duration-300">
                      <FaUser className="text-gray-400 dark:text-gray-300" />
                      <span>My Profile</span>
                    </button>
                    <button className="w-full px-4 py-2 text-left text-sm text-gray-800 dark:text-gray-200 hover:bg-gradient-to-r hover:from-[#f58c55]/10 hover:to-[#f47a45]/10 dark:hover:from-[#f7a16b]/10 dark:hover:to-[#f58c55]/10 flex items-center space-x-3 transition-all duration-300">
                      <FaCog className="text-gray-400 dark:text-gray-300" />
                      <span>Settings</span>
                    </button>
                  </div>
                  
                  <div className="border-t border-gray-200/50 dark:border-gray-700/50 py-2">
                    <button
                      onClick={logout}
                      className="w-full px-4 py-2 text-left text-sm text-red-600 dark:text-red-400 hover:bg-red-50/50 dark:hover:bg-red-900/20 flex items-center space-x-3 transition-all duration-300"
                    >
                      <FaSignOutAlt className="text-red-500 dark:text-red-400" />
                      <span>Sign out</span>
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Topbar;