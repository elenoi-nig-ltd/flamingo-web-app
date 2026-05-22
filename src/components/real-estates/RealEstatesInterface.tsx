'use client'

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useRealEstates } from '@/hooks/useRealEstates';
import Header from '../Header';
import { motion } from 'framer-motion';

enum PropertyType {
  APARTMENT = 'apartment',
  LODGE = 'lodge',
  HOUSE = 'house',
  CONDO = 'condo',
  TOWNHOUSE = 'townhouse',
  LAND = 'land',
}

const Skeleton = ({ className }: { className?: string }) => (
  <div
    className={`bg-gray-200 dark:bg-gray-700 animate-pulse rounded ${className}`}
  />
);

const DisclaimerModal = ({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 dark:bg-gray-900/50">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-md mx-4 p-6">
        <div className="flex items-center mb-4">
          <div className="w-8 h-8 bg-orange-50 dark:bg-orange-900 rounded-full flex items-center justify-center mr-3">
            <span className="text-orange-600 dark:text-orange-400 text-xl font-bold">!</span>
          </div>
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">Important Safety Notice</h2>
        </div>
        
        <div className="mb-6 space-y-3">
          <p className="text-gray-700 dark:text-gray-300">
            <strong>Warning:</strong> Please exercise caution when dealing with property listings.
          </p>
          
          <ul className="text-gray-700 dark:text-gray-300 space-y-2 text-sm">
            <li className="flex items-start">
              <span className="text-orange-500 dark:text-orange-400 mr-2">•</span>
              <span>Never make payments without physically visiting and confirming the property exists</span>
            </li>
            <li className="flex items-start">
              <span className="text-orange-500 dark:text-orange-400 mr-2">•</span>
              <span>Always verify the identity and credentials of property owners/agents</span>
            </li>
            <li className="flex items-start">
              <span className="text-orange-500 dark:text-orange-400 mr-2">•</span>
              <span>Request proper documentation and legal papers before any transaction</span>
            </li>
            <li className="flex items-start">
              <span className="text-orange-500 dark:text-orange-400 mr-2">•</span>
              <span>Be wary of deals that seem too good to be true</span>
            </li>
            <li className="flex items-start">
              <span className="text-orange-500 dark:text-orange-400 mr-2">•</span>
              <span>Consider involving a real estate professional or lawyer for major transactions</span>
            </li>
          </ul>
          
          <p className="text-gray-700 dark:text-gray-300 text-sm">
            Flourish Real Estate is not responsible for fraudulent listings. Always conduct proper due diligence.
          </p>
        </div>
        
        <div className="flex justify-center">
          <button
            onClick={onClose}
            className="px-6 py-2 bg-gradient-to-r from-orange-500 to-amber-500 text-white rounded-lg hover:from-orange-600 hover:to-amber-600 transition-all duration-200"
          >
            I Understand
          </button>
        </div>
      </div>
    </div>
  );
};

const RealEstates = () => {
  const router = useRouter();
  const [showDisclaimer, setShowDisclaimer] = useState(false);
  
  const {
    realEstates,
    loading,
    error,
    priceRange,
    setPriceRange,
    propertyType,
    setPropertyType,
    bedrooms,
    setBedrooms,
    bathrooms,
    setBathrooms,
    sortBy,
    setSortBy,
  } = useRealEstates({ fetchMode: 'public', enableFilters: true });

  // Show disclaimer modal on component mount
  useEffect(() => {
    // Check if user has seen the disclaimer in this session
    const hasSeenDisclaimer = sessionStorage.getItem('hasSeenPropertyDisclaimer');
    if (!hasSeenDisclaimer) {
      setShowDisclaimer(true);
    }
  }, []);

  const handleCloseDisclaimer = () => {
    setShowDisclaimer(false);
    // Remember that user has seen the disclaimer for this session
    sessionStorage.setItem('hasSeenPropertyDisclaimer', 'true');
  };

  const handlePriceChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setPriceRange((prev) => ({ ...prev, [name]: parseInt(value) || 0 }));
  };

  const handleFilterChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    if (name === 'propertyType') setPropertyType(value);
    if (name === 'bedrooms') setBedrooms(value);
    if (name === 'bathrooms') setBathrooms(value);
  };

  const handlePropertyClick = (id: string) => {
    router.push(`/real-estates/${id}`);
  };

  const [proceeding, setProceeding] = useState<{ open: boolean; id?: string } | null>(null);
  const handleProceedToBook = (id: string) => {
    setProceeding({ open: true, id });
    setTimeout(() => {
      setProceeding({ open: false });
      router.push(`/real-estates/${id}/book`);
    }, 900);
  };

  const propertyTypeOptions = [
    { value: '', label: 'All' },
    { value: PropertyType.APARTMENT, label: 'Apartment' },
    { value: PropertyType.LODGE, label: 'Lodge' },
    { value: PropertyType.HOUSE, label: 'House' },
    { value: PropertyType.CONDO, label: 'Condo' },
    { value: PropertyType.TOWNHOUSE, label: 'Townhouse' },
    { value: PropertyType.LAND, label: 'Land' },
  ];

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 dark:bg-gray-900 font-sans">
        <Skeleton className="h-16 bg-gray-800 dark:bg-gray-700" />

        <div className="container mx-auto px-6 py-10">
          <Skeleton className="h-8 w-64 mb-6" />

          <div className="flex flex-col md:flex-row gap-6">
            <div className="w-full md:w-1/4 bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
              <div className="space-y-6">
                <div className="space-y-2">
                  <Skeleton className="h-10 w-full" />
                  <Skeleton className="h-10 w-full" />
                </div>
                <Skeleton className="h-5 w-20" />
                <div>
                  <Skeleton className="h-5 w-24 mb-2" />
                  <div className="flex space-x-2">
                    <Skeleton className="h-10 w-1/2" />
                    <Skeleton className="h-10 w-1/2" />
                  </div>
                </div>
                <div>
                  <Skeleton className="h-5 w-32 mb-2" />
                  <div className="space-y-2">
                    {Array(7).fill(0).map((_, i) => (
                      <Skeleton key={i} className="h-5 w-28" />
                    ))}
                  </div>
                </div>
                <div>
                  <Skeleton className="h-5 w-24 mb-2" />
                  <Skeleton className="h-10 w-full" />
                </div>
                <div>
                  <Skeleton className="h-5 w-24 mb-2" />
                  <div className="flex space-x-2">
                    <Skeleton className="h-10 w-1/3" />
                    <Skeleton className="h-10 w-1/3" />
                    <Skeleton className="h-10 w-1/3" />
                  </div>
                </div>
              </div>
            </div>

            <div className="w-full md:w-3/4">
              <div className="flex justify-between items-center mb-6">
                <Skeleton className="h-5 w-20" />
                <Skeleton className="h-10 w-32" />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {Array(6).fill(0).map((_, i) => (
                  <div key={i} className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden">
                    <Skeleton className="w-full h-48" />
                    <div className="p-4 space-y-2">
                      <Skeleton className="h-6 w-32" />
                      <Skeleton className="h-5 w-48" />
                      <Skeleton className="h-4 w-64" />
                      <div className="flex justify-end">
                        <Skeleton className="h-5 w-5" />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) return <div className="text-center py-10 text-orange-500 dark:text-orange-400">{error}</div>;

  return (
    <div className="min-h-screen bg-[#f8f5e6] dark:bg-gray-900 font-sans">
      <Header />
      {/* <DisclaimerModal isOpen={showDisclaimer} onClose={handleCloseDisclaimer} /> */}
      
      <div className="container mx-auto px-6 py-10 max-w-7xl">
        {proceeding?.open && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
            <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ type: 'spring', stiffness: 200 }} className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-6 border border-[#f0e6d0] dark:border-gray-700">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-gradient-to-r from-orange-500 to-amber-500 animate-pulse"></div>
                <p className="text-gray-800 dark:text-gray-200 font-semibold">Proceeding to book this apartment...</p>
              </div>
            </motion.div>
          </div>
        )}
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-gray-800 dark:text-gray-200" style={{ fontFamily: 'Parisienne, cursive' }}>Properties</h1>
          <button
            onClick={() => setShowDisclaimer(true)}
            className="text-sm text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 underline"
          >
            Safety Notice
          </button>
        </div>
        
        <div className="flex flex-col md:flex-row gap-6">
          <div className="w-full md:w-1/4 bg-[#f5f3eb] dark:bg-gray-800 p-6 rounded-lg shadow border border-[#f0e6d0] dark:border-gray-700">
            <div className="space-y-6">
              <div>
                <button className="w-full py-2 rounded mb-2 bg-gradient-to-r from-orange-500 to-amber-500 text-white hover:from-orange-600 hover:to-amber-600 transition-all duration-200">
                  Buy
                </button>
                <button className="w-full py-2 rounded bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors">
                  Rent
                </button>
              </div>
              <p className="text-gray-600 dark:text-gray-400">{realEstates.length} results</p>
              <div>
                <label className="block text-gray-700 dark:text-gray-300 mb-2">Price Range (₦)</label>
                <div className="flex space-x-2">
                  <input
                    type="number"
                    name="min"
                    value={priceRange.min || ''}
                    onChange={handlePriceChange}
                    placeholder="Min Price"
                    min="0"
                    className="w-1/2 p-2 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-[#f7a16b] focus:border-[#f7a16b]"
                  />
                  <input
                    type="number"
                    name="max"
                    value={priceRange.max || ''}
                    onChange={handlePriceChange}
                    placeholder="Max Price"
                    min="0"
                    className="w-1/2 p-2 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-[#f7a16b] focus:border-[#f7a16b]"
                  />
                </div>
              </div>
              <div>
                <label className="block text-gray-700 dark:text-gray-300 mb-2">Real estate type</label>
                <div className="space-y-2">
                  {propertyTypeOptions.map((option) => (
                    <label key={option.value} className="flex items-center">
                      <input
                        type="radio"
                        name="propertyType"
                        value={option.value}
                        checked={propertyType === option.value}
                        onChange={handleFilterChange}
                        className="mr-2 text-[#f58c55] focus:ring-[#f58c55]"
                      />
                      <span className="text-gray-700 dark:text-gray-300">{option.label}</span>
                    </label>
                  ))}
                </div>
              </div>
              <div>
                <label className="block text-gray-700 dark:text-gray-300 mb-2">Bedrooms</label>
                <select
                  name="bedrooms"
                  value={bedrooms}
                  onChange={handleFilterChange}
                  className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-[#f7a16b] focus:border-[#f7a16b]"
                >
                  <option value="">Any</option>
                  <option value="1">1</option>
                  <option value="2">2</option>
                  <option value="3">3</option>
                  <option value="4">4 and more</option>
                </select>
              </div>
              <div>
                <label className="block text-gray-700 dark:text-gray-300 mb-2">Bathroom</label>
                <div className="flex space-x-2">
                  <button
                    className={`w-1/3 py-2 rounded ${bathrooms === '' ? 'bg-gradient-to-r from-orange-500 to-amber-500 text-white' : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300'} hover:from-orange-600 hover:to-amber-600 transition-all duration-200`}
                    onClick={() => setBathrooms('')}
                  >
                    Any
                  </button>
                  <button
                    className={`w-1/3 py-2 rounded ${bathrooms === 'combined' ? 'bg-gradient-to-r from-orange-500 to-amber-500 text-white' : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300'} hover:from-orange-600 hover:to-amber-600 transition-all duration-200`}
                    onClick={() => setBathrooms('combined')}
                  >
                    Combined
                  </button>
                  <button
                    className={`w-1/3 py-2 rounded ${bathrooms === 'separate' ? 'bg-gradient-to-r from-orange-500 to-amber-500 text-white' : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300'} hover:from-orange-600 hover:to-amber-600 transition-all duration-200`}
                    onClick={() => setBathrooms('separate')}
                  >
                    Separate
                  </button>
                </div>
              </div>
            </div>
          </div>

          <div className="w-full md:w-3/4">
            <div className="flex justify-between items-center mb-6">
              <span className="text-gray-700 dark:text-gray-300 font-medium">Properties</span>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="p-2 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-[#f7a16b] focus:border-[#f7a16b]"
              >
                <option value="price">Sort by Price</option>
                <option value="area">Sort by Area</option>
              </select>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {realEstates.map((estate) => (
                <div 
                  key={estate.id} 
                  className="bg-white dark:bg-gray-800 rounded-2xl shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden border border-[#f0e6d0] dark:border-gray-700"
                >
                  <div 
                    className="cursor-pointer"
                    onClick={() => handlePropertyClick(estate.id)}
                  >
                    <div className="relative w-full h-48 bg-gray-100 dark:bg-gray-700">
                      <Image
                        src={estate.images[0] || '/assets/images/placeholder.png'}
                        alt={estate.title}
                        fill
                        className="object-cover"
                      />
                      {/* Price Badge */}
                      <div className="absolute top-3 left-3 bg-[#f47a45] text-white px-3 py-1 rounded-full text-sm font-semibold">
                        ₦{estate.price.toLocaleString()}
                      </div>
                    </div>
                    <div className="p-4">
                      <h3 className="text-lg font-bold text-gray-800 dark:text-gray-200 mb-1 line-clamp-2">{estate.title}</h3>
                      <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">{estate.area} sq ft • {estate.bedrooms} beds • {estate.bathrooms} baths</p>
                      {estate.propertyType === 'lodge' && (
                        <div className="mt-2 flex items-center text-sm font-medium text-amber-700 dark:text-amber-500 bg-amber-50 dark:bg-amber-900/20 px-2.5 py-1 rounded-lg w-fit">
                          <span className="mr-1.5">🏨</span>
                          {estate.roomsBooked ?? 0} rooms booked
                        </div>
                      )}
                      <div className="mt-3 flex gap-2">
                        <button
                          onClick={(e) => { e.stopPropagation(); handlePropertyClick(estate.id); }}
                          className="flex-1 px-3 py-2 text-sm font-semibold border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition"
                        >
                          View Details
                        </button>
                        <button
                          onClick={(e) => { e.stopPropagation(); handleProceedToBook(estate.id); }}
                          disabled={estate.isBooked === true || estate.availability === false || estate.bookingStatus === 'booked'}
                          className="flex-1 px-3 py-2 text-xs md:text-sm font-semibold text-white transition hover:opacity-90 shadow disabled:opacity-50 disabled:cursor-not-allowed"
                          style={{ backgroundColor: '#f58c55' }}
                        >
                          {estate.isBooked === true || estate.availability === false || estate.bookingStatus === 'booked' ? 'Booked' : '📋 Book Now'}
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RealEstates;