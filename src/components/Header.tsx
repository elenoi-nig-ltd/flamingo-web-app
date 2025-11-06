'use client';

import React, { useState, useEffect } from 'react';
import { FaChevronDown } from 'react-icons/fa';
import Image from 'next/image';
import { usePublicCategories } from '@/hooks/usePublic';
import { useHomeItemCategories } from '@/hooks/useHomeItemCategories';

interface Category {
  _id: string;
  name: string;
  description: string;
  createdAt?: string;
  updatedAt?: string;
}

const Header = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { fetchCategories, loading: foodLoading, error: foodError } = usePublicCategories();
  const { categories: homeItemCategories, loading: homeItemsLoading, error: homeItemsError } = useHomeItemCategories();
  const [foodCategories, setFoodCategories] = useState<Category[]>([]);

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
      { name: 'Admin Login', href: '/admin/login' },
    ],
  };

  return (
    <header className="fixed top-0 left-0 right-0 bg-white dark:bg-gray-900 shadow-sm py-4 px-6 z-[9999] isolate"> {/* Explicitly highest z-index and isolate for stacking context */}
      <div className="container mx-auto flex justify-between items-center">
       <button
        onClick={() => window.location.href = '/'}
        className="focus:outline-none focus-visible:ring-2 focus-visible:ring-pink-500 rounded-md"
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
        <nav className="hidden md:flex space-x-6">
          <Dropdown title="Home" href="/" items={menuItems.home} />
          <Dropdown title="Food & Drinks" items={menuItems.foodDrinks} loading={foodLoading} />
          <Dropdown title="Home Items" items={menuItems.homeItems} loading={homeItemsLoading} />
          <Dropdown title="Internet" items={menuItems.internet} />
          <Dropdown title="Real Estates" items={menuItems.realEstates} />
          <Dropdown title="Explore Flamingo" items={menuItems.signupPlanning} dark />
        </nav>

        {/* Mobile Toggle */}
        <button
          className="md:hidden text-gray-700 dark:text-gray-300"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-6 w-6"
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

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden mt-4 space-y-4 bg-white dark:bg-gray-900 relative z-[10000]"> {/* Even higher z-index for mobile menu */}
          <MobileDropdown title="Home" href="/" items={menuItems.home} />
          <MobileDropdown title="Food & Drinks" items={menuItems.foodDrinks} loading={foodLoading} />
          <MobileDropdown title="Home Items" items={menuItems.homeItems} loading={homeItemsLoading} />
          <MobileDropdown title="Internet" items={menuItems.internet} />
          <MobileDropdown title="Real Estates" items={menuItems.realEstates} />
          <MobileDropdown title="Explore Flamingo" items={menuItems.signupPlanning} />
        </div>
      )}
    </header>
  );
};

// Desktop Dropdown Component
const Dropdown = ({
  title,
  items,
  href,
  dark = false,
  loading = false,
}: {
  title: string;
  items: { name: string; href: string }[];
  href?: string;
  dark?: boolean;
  loading?: boolean;
}) => (
  <div className={`group relative ${dark ? 'bg-black dark:bg-gray-800 rounded' : ''}`}>
    <a
      href={href || '#'}
      className={`flex items-center p-2 ${dark ? 'text-white' : 'text-black dark:text-white'} hover:text-[#f47c5b]`}
    >
      {title}
      {items.length > 0 && (
        <FaChevronDown className="ml-1 text-xs opacity-70 group-hover:opacity-100 transition-opacity" />
      )}
    </a>
    {items.length > 0 && (
      <div className="absolute left-0 mt-2 w-48 bg-white dark:bg-gray-800 rounded-md shadow-lg py-1 z-[10000] opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 border border-gray-200 dark:border-gray-600"> {/* Explicit z-index for dropdown */}
        {loading ? (
          <div className="px-4 py-2 text-gray-700 dark:text-gray-300">Loading...</div>
        ) : (
          items.map((item, index) => (
            <a
              key={index}
              href={item.href}
              className="block px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-pink-50 dark:hover:bg-gray-700 hover:text-pink-600 transition-colors duration-150"
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
  loading = false,
}: {
  title: string;
  items: { name: string; href: string }[];
  href?: string;
  loading?: boolean;
}) => {
  const [open, setOpen] = useState(false);
  return (
    <div className="px-4">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex justify-between items-center text-black dark:text-white font-medium py-2"
      >
        <a href={href || '#'} className="flex-1 text-left">
          {title}
        </a>
        {items.length > 0 && (
          <FaChevronDown className={`ml-2 text-xs transition-transform ${open ? 'rotate-180' : ''}`} />
        )}
      </button>
      {open && items.length > 0 && (
        <div className="mt-1 ml-4 space-y-2 z-[10000]"> {/* Explicit z-index for mobile submenus */}
          {loading ? (
            <div className="text-sm text-gray-700 dark:text-gray-300">Loading...</div>
          ) : (
            items.map((item, index) => (
              <a key={index} href={item.href} className="block text-sm text-gray-700 dark:text-gray-300 py-1">
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