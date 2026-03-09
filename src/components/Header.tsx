'use client';

import React, { useState, useEffect } from 'react';
import { FaChevronDown, FaShoppingCart } from 'react-icons/fa';
import Image from 'next/image';
import { usePublicCategories } from '@/hooks/usePublic';
import { useHomeItemCategories } from '@/hooks/useHomeItemCategories';
import { useCart } from '@/hooks/useCart';
import Link from 'next/link';

interface Category {
  _id: string;
  name: string;
  description: string;
  createdAt?: string;
  updatedAt?: string;
}

const Header = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const { fetchCategories, loading: foodLoading, error: foodError } = usePublicCategories();
  const { categories: homeItemCategories, loading: homeItemsLoading, error: homeItemsError } = useHomeItemCategories();
  const [foodCategories, setFoodCategories] = useState<Category[]>([]);
  const { totalItems } = useCart();

  // Handle scroll effect
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Fetch categories on component mount
  useEffect(() => {
    const loadCategories = async () => {
      try {
        const response = await fetchCategories();
        setFoodCategories(response.categories);
      } catch (err) {
        console.error('Failed to fetch food categories:', err);
      }
    };
    loadCategories();
  }, []);

  const menuItems = {
    home: [],
    foodDrinks: foodCategories.map(category => ({
      name: category.name,
      href: `/food?category=${category._id}`
    })),
    homeItems: homeItemCategories.map(category => ({
      name: category.name,
      href: `/home-items?category=${category._id}`,
    })),
    internet: [
      { name: 'Home Internet', href: '/internet' },
      { name: 'Mobile Plans', href: '/internet' },
      { name: 'Business Solutions', href: '/internet' },
    ],
    realEstates: [
      { name: 'Residential', href: '/real-estates' },
      { name: 'Commercial', href: '/real-estates' },
      { name: 'Vacation Homes', href: '/real-estates' },
      { name: 'Landlord', href: '/landlord/home' },
    ],
    signupPlanning: [
      { name: 'Events', href: '#' },
      { name: 'Consultation', href: '#' },
      { name: 'Packages', href: '#' },
  
    ],
  };

  return (
    <header 
      className={`fixed top-0 left-0 right-0 bg-white/95 dark:bg-gray-900/95 backdrop-blur-md shadow-sm py-4 px-6 z-[9998] isolate transition-all duration-300 ${
        scrolled ? 'shadow-lg py-3' : ''
      }`}
    >
      <div className="container mx-auto flex justify-between items-center">
        <button
          onClick={() => window.location.href = '/'}
          className="focus:outline-none focus-visible:ring-2 focus-visible:ring-pink-500 rounded-md transform hover:scale-105 transition-transform duration-200"
          aria-label="Go to homepage"
        >
          <Image
            src={'/assets/icons/logo.png'}
            alt="Flamingo Logo"
            width={160}
            height={60}
            className="h-12 w-auto cursor-pointer"
          />
        </button>

        {/* Desktop nav */}
        <nav className="hidden md:flex space-x-6 items-center">
          <Dropdown title="Home" href="/" items={menuItems.home} />
          <Dropdown title="Food & Drinks" items={menuItems.foodDrinks} loading={foodLoading} />
          <Dropdown title="Home Items" items={menuItems.homeItems} loading={homeItemsLoading} />
          <Dropdown title="Internet" items={menuItems.internet} />
          <Dropdown title="Real Estates" items={menuItems.realEstates} />
          <Dropdown title="Explore Flamingo" items={menuItems.signupPlanning} dark gradient />
          
          {/* Cart Icon Desktop */}
          <Link href="/cart" className="relative p-2 text-gray-700 dark:text-gray-300 hover:text-[#f58c55] transition-colors">
            <FaShoppingCart size={22} />
            {totalItems > 0 && (
              <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] font-bold rounded-full h-5 w-5 flex items-center justify-center shadow-lg border-2 border-white dark:border-gray-900">
                {totalItems}
              </span>
            )}
          </Link>
        </nav>

        {/* Mobile Toggle & Cart */}
        <div className="flex items-center space-x-4 md:hidden">
          <Link href="/cart" className="relative p-2 text-gray-700 dark:text-gray-300 hover:text-orange-500 transition-colors">
            <FaShoppingCart size={20} />
            {totalItems > 0 && (
              <span className="absolute top-0 right-0 bg-red-500 text-white text-[9px] font-bold rounded-full h-4 w-4 flex items-center justify-center border-2 border-white dark:border-gray-900">
                {totalItems}
              </span>
            )}
          </Link>
          <button
            className="text-gray-700 dark:text-gray-300 hover:text-pink-500 transition-colors duration-200"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-6 w-6 transform transition-transform duration-200"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              {mobileMenuOpen ? (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              )}
            </svg>
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden mt-4 space-y-4 bg-white dark:bg-gray-900 relative z-[10000] animate-fadeIn">
          <MobileDropdown title="Home" href="/" items={menuItems.home} />
          <MobileDropdown title="Food & Drinks" items={menuItems.foodDrinks} loading={foodLoading} />
          <MobileDropdown title="Home Items" items={menuItems.homeItems} loading={homeItemsLoading} />
          <MobileDropdown title="Internet" items={menuItems.internet} />
          <MobileDropdown title="Real Estates" items={menuItems.realEstates} />
          <MobileDropdown title="Explore Flamingo" items={menuItems.signupPlanning} gradient />
        </div>
      )}

      <style jsx>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(-10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-fadeIn {
          animation: fadeIn 0.3s ease-out;
        }
      `}</style>
    </header>
  );
};

// Desktop Dropdown Component
const Dropdown = ({
  title,
  items,
  href,
  dark = false,
  gradient = false,
  loading = false,
}: {
  title: string;
  items: { name: string; href: string }[];
  href?: string;
  dark?: boolean;
  gradient?: boolean;
  loading?: boolean;
}) => (
  <div className={`group relative ${gradient ? 'rounded-lg shadow-md hover:shadow-lg transition-shadow duration-300' : ''}`} style={gradient ? { backgroundColor: '#f58c55' } : {}}>
    <a
      href={href || '#'}
      className={`flex items-center px-4 py-2 rounded-lg font-medium transition-all duration-200 ${
        gradient
          ? 'text-white hover:shadow-xl transform hover:scale-105'
          : 'text-black dark:text-white hover:text-[#f47c5b] relative after:absolute after:bottom-0 after:left-0 after:w-0 after:h-0.5 after:bg-gradient-to-r after:from-orange-500 after:to-amber-500 after:transition-all after:duration-300 hover:after:w-full'
      }`}
    >
      {title}
      {items.length > 0 && (
        <FaChevronDown className={`ml-1 text-xs transition-all duration-200 ${
          gradient ? 'opacity-90' : 'opacity-70 group-hover:opacity-100 group-hover:translate-y-0.5'
        }`} />
      )}
    </a>
    {items.length > 0 && (
      <div className="absolute left-0 mt-2 w-48 bg-white dark:bg-gray-800 rounded-lg shadow-xl py-2 z-[10000] opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 border border-gray-100 dark:border-gray-700 transform scale-95 group-hover:scale-100">
        {loading ? (
          <div className="px-4 py-2 text-gray-700 dark:text-gray-300 animate-pulse">Loading...</div>
        ) : (
          items.map((item, index) => (
            <a
              key={index}
              href={item.href}
              className="block px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gradient-to-r hover:from-orange-50 hover:to-amber-50 dark:hover:from-gray-700 dark:hover:to-gray-600 hover:text-orange-600 dark:hover:text-amber-400 transition-all duration-150 rounded-md mx-1 transform hover:translate-x-1"
            >
              {item.name}
            </a>
          ))
        )}
      </div>
    )}
  </div>
);

// Mobile Dropdown Component
const MobileDropdown = ({
  title,
  items,
  href,
  gradient = false,
  loading = false,
}: {
  title: string;
  items: { name: string; href: string }[];
  href?: string;
  gradient?: boolean;
  loading?: boolean;
}) => {
  const [open, setOpen] = useState(false);
  return (
    <div className={`px-4 ${gradient ? 'rounded-lg py-2 mx-2 shadow-md' : ''}`} style={gradient ? { backgroundColor: '#f58c55' } : {}}>
      <button
        onClick={() => setOpen(!open)}
        className={`w-full flex justify-between items-center font-medium py-2 transition-colors duration-200 ${
          gradient ? 'text-white' : 'text-black dark:text-white hover:text-orange-500'
        }`}
      >
        <a href={href || '#'} className="flex-1 text-left">
          {title}
        </a>
        {items.length > 0 && (
          <FaChevronDown className={`ml-2 text-xs transition-transform duration-300 ${open ? 'rotate-180' : ''}`} />
        )}
      </button>
      {open && items.length > 0 && (
        <div className={`mt-1 ml-4 space-y-2 z-[10000] animate-fadeIn ${gradient ? 'bg-white/10 rounded-md p-2' : ''}`}>
          {loading ? (
            <div className={`text-sm py-1 animate-pulse ${gradient ? 'text-white' : 'text-gray-700 dark:text-gray-300'}`}>
              Loading...
            </div>
          ) : (
            items.map((item, index) => (
              <a 
                key={index} 
                href={item.href} 
                className={`block text-sm py-1 transition-all duration-200 hover:translate-x-2 ${
                  gradient 
                    ? 'text-white hover:text-gray-100' 
                    : 'text-gray-700 dark:text-gray-300 hover:text-orange-500'
                }`}
              >
                {item.name}
              </a>
            ))
          )}
        </div>
      )}
    </div>
  );
};

export default Header;