'use client'

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { useParams, useRouter } from 'next/navigation';
import { useRealEstates } from '@/hooks/useRealEstates';
import Header from '@/components/Header';

const DisclaimerModal = ({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed mt-20 inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 dark:bg-gray-900/80">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-md mx-4 p-6 border border-gray-200 dark:border-gray-700">
        <div className="flex items-center mb-4">
          <div className="w-8 h-8 bg-orange-50 dark:bg-orange-900/50 rounded-full flex items-center justify-center mr-3">
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
            className="px-6 py-2 bg-gradient-to-r from-orange-500 to-amber-500 text-white rounded-lg hover:from-orange-600 hover:to-amber-600 transition-all duration-200 dark:from-orange-600 dark:to-amber-600 dark:hover:from-orange-700 dark:hover:to-amber-700"
          >
            I Understand
          </button>
        </div>
      </div>
    </div>
  );
};

export const PropertyDetails = () => {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;
  const { propertyDetails, detailsLoading, detailsError, fetchPropertyDetails } = useRealEstates();
  const [activeImage, setActiveImage] = useState(0);
  const [showDisclaimer, setShowDisclaimer] = useState(false);

  useEffect(() => {
    if (id) {
      fetchPropertyDetails(id);
    }
  }, [id, fetchPropertyDetails]);

  // Show disclaimer modal on component mount
  useEffect(() => {
    const hasSeenDisclaimer = sessionStorage.getItem('hasSeenPropertyDisclaimer');
    if (!hasSeenDisclaimer) {
      setShowDisclaimer(true);
    }
  }, []);

  const handleCloseDisclaimer = () => {
    setShowDisclaimer(false);
    sessionStorage.setItem('hasSeenPropertyDisclaimer', 'true');
  };

  if (detailsLoading) {
    return (
      <div className="min-h-screen bg-gray-100 dark:bg-gray-900 font-sans">
        <Header />
        <div className="container mx-auto px-6 py-10">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-1/3 mb-4"></div>
            <div className="h-64 bg-gray-200 dark:bg-gray-700 rounded mb-4"></div>
            <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-1/2 mb-2"></div>
            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4 mb-4"></div>
            <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-1/3 mb-2"></div>
            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-2/3 mb-4"></div>
          </div>
        </div>
      </div>
    );
  }

  if (detailsError) {
    return (
      <div className="min-h-screen bg-[#f8f5e6] dark:bg-gray-900 font-sans">
        <Header />
        <div className="container mx-auto px-6 py-10">
          <div className="text-red-500 dark:text-red-400 text-center">{detailsError}</div>
          <button 
            onClick={() => router.push('/real-estates')}
            className="mt-4 bg-green-700 dark:bg-green-600 text-white px-4 py-2 rounded hover:bg-green-800 dark:hover:bg-green-700 transition"
          >
            Back to Properties
          </button>
        </div>
      </div>
    );
  }

  if (!propertyDetails) {
    return (
      <div className="min-h-screen bg-[#f8f5e6] dark:bg-gray-900 font-sans">
        <Header />
        <div className="container mx-auto px-6 py-10">
          <div className="text-center text-gray-700 dark:text-gray-300">Property not found</div>
          <button 
            onClick={() => router.push('/real-estates')}
            className="mt-4 bg-green-700 dark:bg-green-600 text-white px-4 py-2 rounded hover:bg-green-800 dark:hover:bg-green-700 transition"
          >
            Back to Properties
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f8f5e6] dark:bg-gray-900 font-sans">
      <Header />
      {/* <DisclaimerModal isOpen={showDisclaimer} onClose={handleCloseDisclaimer} /> */}
      
      <div className="container mx-auto px-6 py-10">
        <div className="flex justify-between items-center mb-6">
          <button 
            onClick={() => router.push('/real-estates')}
            className="text-green-700 dark:text-green-400 hover:text-green-800 dark:hover:text-green-300 flex items-center transition"
          >
            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Back to Properties
          </button>
          <button
            onClick={() => setShowDisclaimer(true)}
            className="text-sm text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 underline"
          >
            Safety Notice
          </button>
        </div>
        
        <h1 className="text-3xl font-bold text-gray-800 dark:text-white mb-2">{propertyDetails.title}</h1>
        <p className="text-gray-600 dark:text-gray-300 mb-6">{propertyDetails.address}</p>
        
        {/* Image Gallery */}
        <div className="mb-8">
          <div className="relative h-96 w-full mb-4 rounded-lg overflow-hidden">
            <Image
              src={'/placeholder.jpg'}
              // src={propertyDetails.images[activeImage] || '/placeholder.jpg'}
              alt={propertyDetails.title}
              fill
              className="object-cover"
              priority
            />
          </div>
          
          {propertyDetails.images.length > 1 && (
            <div className="grid grid-cols-4 gap-2">
              {propertyDetails.images.map((image, index) => (
                <div 
                  key={index} 
                  className={`relative h-24 cursor-pointer rounded-md overflow-hidden ${
                    activeImage === index 
                      ? 'ring-2 ring-green-600 dark:ring-green-400' 
                      : 'ring-1 ring-gray-200 dark:ring-gray-700'
                  }`}
                  onClick={() => setActiveImage(index)}
                >
                  <Image
                    src={image || '/placeholder.jpg'}
                    alt={`${propertyDetails.title} - Image ${index + 1}`}
                    fill
                    className="object-cover"
                  />
                </div>
              ))}
            </div>
          )}
        </div>
        
        {/* Property Details */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="md:col-span-2">
            <h2 className="text-xl font-semibold text-gray-700 dark:text-gray-200 mb-4">Description</h2>
            <p className="text-gray-600 dark:text-gray-300 mb-6">{propertyDetails.description}</p>
            
            <h2 className="text-xl font-semibold text-gray-700 dark:text-gray-200 mb-4">Details</h2>
            <div className="grid grid-cols-2 gap-4 mb-6">
              <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
                <p className="text-gray-600 dark:text-gray-300">
                  <span className="font-semibold">Property Type:</span> {propertyDetails.propertyType}
                </p>
              </div>
              <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
                <p className="text-gray-600 dark:text-gray-300">
                  <span className="font-semibold">Bedrooms:</span> {propertyDetails.bedrooms}
                </p>
              </div>
              <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
                <p className="text-gray-600 dark:text-gray-300">
                  <span className="font-semibold">Bathrooms:</span> {propertyDetails.bathrooms}
                </p>
              </div>
              <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
                <p className="text-gray-600 dark:text-gray-300">
                  <span className="font-semibold">Area:</span> {propertyDetails.area} sq ft
                </p>
              </div>
              {propertyDetails.yearBuilt && (
                <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
                  <p className="text-gray-600 dark:text-gray-300">
                    <span className="font-semibold">Year Built:</span> {propertyDetails.yearBuilt}
                  </p>
                </div>
              )}
            </div>
            
            {propertyDetails.amenities && propertyDetails.amenities.length > 0 && (
              <>
                <h2 className="text-xl font-semibold text-gray-700 dark:text-gray-200 mb-4">Amenities</h2>
                <div className="flex flex-wrap gap-2 mb-6">
                  {propertyDetails.amenities.map((amenity, index) => (
                    <span 
                      key={index} 
                      className="bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300 text-sm px-3 py-1 rounded-full border border-green-200 dark:border-green-800"
                    >
                      {amenity}
                    </span>
                  ))}
                </div>
              </>
            )}
            
            <h2 className="text-xl font-semibold text-gray-700 dark:text-gray-200 mb-4">Address</h2>
            <p className="text-gray-600 dark:text-gray-300 mb-6">{propertyDetails.address}</p>
          </div>
          
          <div className="md:col-span-1">
            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow sticky top-6 border border-gray-200 dark:border-gray-700">
              <h3 className="text-2xl font-bold text-gray-800 dark:text-white mb-4">
                ₦{propertyDetails.price.toLocaleString()} /year
              </h3>
              
              {/* <button className="w-full bg-green-700 dark:bg-green-600 text-white py-3 rounded-lg font-semibold mb-4 hover:bg-green-800 dark:hover:bg-green-700 transition">
                Contact Agent
              </button>
              
              <button className="w-full border border-green-700 dark:border-green-600 text-green-700 dark:text-green-400 py-3 rounded-lg font-semibold hover:bg-green-50 dark:hover:bg-green-900/30 transition">
                Schedule Tour
              </button>
              
              {propertyDetails.contactInfo && (
                <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
                  <h4 className="font-semibold text-gray-700 dark:text-gray-200 mb-3">Contact Information</h4>
                  <p className="text-gray-600 dark:text-gray-300">{propertyDetails.contactInfo.name}</p>
                  <p className="text-gray-600 dark:text-gray-300">{propertyDetails.contactInfo.phone}</p>
                  <p className="text-gray-600 dark:text-gray-300">{propertyDetails.contactInfo.email}</p>
                </div>
              )} */}
              
              <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
                <h4 className="font-semibold text-gray-700 dark:text-gray-200 mb-2">Share this property</h4>
                <div className="flex space-x-3">
                  <button className="text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 transition">
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                    </svg>
                  </button>
                  <button className="text-blue-400 dark:text-blue-300 hover:text-blue-600 dark:hover:text-blue-200 transition">
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723 10.027 10.027 0 01-3.127 1.195 4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.937 4.937 0 004.604 3.417 9.868 9.868 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.054 0 13.999-7.496 13.999-13.986 0-.209 0-.42-.015-.63a9.936 9.936 0 002.46-2.548l-.047-.02z" />
                    </svg>
                  </button>
                  <button className="text-red-600 dark:text-red-400 hover:text-red-800 dark:hover:text-red-300 transition">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PropertyDetails;