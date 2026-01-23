'use client';

import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useRealEstates } from '@/hooks/useRealEstates';
import { useBookings } from '@/hooks/useBookings';
import Header from '@/components/Header';
import BookingForm from '@/components/real-estates/BookingForm';

const BookPropertyPage = () => {
  const params = useParams();
  const router = useRouter();
  const propertyId = params.id as string;
  const { fetchPropertyDetails, propertyDetails } = useRealEstates();
  const { checkAvailability, availability, loading } = useBookings();
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    if (propertyId) {
      Promise.all([
        fetchPropertyDetails(propertyId),
        checkAvailability(propertyId)
      ]).then(() => {
        setIsReady(true);
      });
    }
  }, [propertyId]);

  if (!isReady || loading) {
    return (
      <div className="min-h-screen bg-gray-100 dark:bg-gray-900">
        <Header />
        <div className="flex items-center justify-center py-20">
          <div className="text-center">
            <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-orange-500 mx-auto mb-4"></div>
            <p className="text-gray-600 dark:text-gray-400">Loading property details...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!availability?.available) {
    return (
      <div className="min-h-screen bg-gray-100 dark:bg-gray-900">
        <Header />
        <div className="flex items-center justify-center py-20">
          <div className="text-center max-w-md mx-auto px-6">
            <div className="text-red-500 text-6xl mb-4">🔒</div>
            <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-4">
              Property Not Available
            </h2>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              This property is currently booked. Please check back later or browse other available properties.
            </p>
            <button
              onClick={() => router.push('/real-estates')}
              className="px-6 py-3 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition"
            >
              Browse Properties
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900">
      <Header />
      <div className="container mx-auto px-6 py-12">
        <div className="mb-6">
          <button
            onClick={() => router.push(`/real-estates/${propertyId}`)}
            className="text-orange-500 hover:text-orange-600 flex items-center"
          >
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Back to Property Details
          </button>
        </div>
        
        <BookingForm
          propertyId={propertyId}
          onSuccess={(booking) => {
            router.push(`/bookings/confirmation?reference=${booking.bookingReference}`);
          }}
          onCancel={() => router.push(`/real-estates/${propertyId}`)}
        />
      </div>
    </div>
  );
};

export default BookPropertyPage;
