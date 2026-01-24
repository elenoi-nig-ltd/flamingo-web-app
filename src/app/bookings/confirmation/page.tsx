'use client';

import React, { useEffect, useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { useBookings, Booking } from '@/hooks/useBookings';
import { useRealEstates } from '@/hooks/useRealEstates';
import BookingConfirmation from '@/components/real-estates/BookingConfirmation';
import Header from '@/components/Header';

const BookingConfirmationContent = () => {
  const searchParams = useSearchParams();
  const reference = searchParams.get('reference');
  
  const { getBookingByReference, currentBooking, loading, error } = useBookings();
  const { fetchPropertyDetails, propertyDetails } = useRealEstates();
  const [booking, setBooking] = useState<Booking | null>(null);

  useEffect(() => {
    if (reference) {
      loadBooking(reference);
    }
  }, [reference]);

  const loadBooking = async (ref: string) => {
    const bookingData = await getBookingByReference(ref);
    if (!bookingData) return;

    setBooking(bookingData);

    // Some responses embed property as an object; normalize to the id string to avoid [object Object] requests
    const propertyId = typeof bookingData.propertyId === 'string'
      ? bookingData.propertyId
      : (bookingData as any)?.propertyId?._id || (bookingData as any)?.propertyId?.id || '';

    if (propertyId) {
      try {
        await fetchPropertyDetails(propertyId);
      } catch (err) {
        console.error('Failed to fetch property details for booking', err);
      }
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 dark:bg-gray-900">
        <Header />
        <div className="flex items-center justify-center py-20">
          <div className="text-center">
            <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-orange-500 mx-auto mb-4"></div>
            <p className="text-gray-600 dark:text-gray-400">Loading booking details...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error || !booking) {
    return (
      <div className="min-h-screen bg-gray-100 dark:bg-gray-900">
        <Header />
        <div className="flex items-center justify-center py-20">
          <div className="text-center">
            <div className="text-red-500 text-6xl mb-4">⚠️</div>
            <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-4">
              Booking Not Found
            </h2>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              {error || 'The booking reference you provided could not be found.'}
            </p>
            <button
              onClick={() => window.location.href = '/real-estates'}
              className="px-6 py-3 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors"
            >
              Back to Properties
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900">
      <Header />
      <BookingConfirmation booking={booking} propertyDetails={propertyDetails} />
    </div>
  );
};

const BookingConfirmationPage = () => {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-gray-100 dark:bg-gray-900">
          <Header />
          <div className="flex items-center justify-center py-20">
            <div className="text-center">
              <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-orange-500 mx-auto mb-4"></div>
              <p className="text-gray-600 dark:text-gray-400">Loading booking details...</p>
            </div>
          </div>
        </div>
      }
    >
      <BookingConfirmationContent />
    </Suspense>
  );
};

export default BookingConfirmationPage;
