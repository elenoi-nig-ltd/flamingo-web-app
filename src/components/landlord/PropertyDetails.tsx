import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { FaBed, FaBath, FaRulerCombined, FaPhone, FaEnvelope, FaCalendar } from 'react-icons/fa';
import { useRealEstates } from '@/hooks/useRealEstates';
import { useBookings } from '@/hooks/useBookings';
import { useRouter } from 'next/router';
import Header from '../Header';
import BookingForm from '../real-estates/BookingForm';

const PropertyDetails = () => {
  const { fetchPropertyDetails, propertyDetails, detailsLoading, detailsError } = useRealEstates();
  const { checkAvailability, availability } = useBookings();
  const router = useRouter();
  const { id } = router.query;
  const [showBookingForm, setShowBookingForm] = useState(false);

  useEffect(() => {
    if (id) {
      fetchPropertyDetails(id as string);
      checkAvailability(id as string);
    }
  }, [id, fetchPropertyDetails, checkAvailability]);

  const handleBookNowClick = () => {
    setShowBookingForm(true);
  };

  const handleBookingSuccess = (booking: any) => {
    router.push(`/bookings/confirmation?reference=${booking.bookingReference}`);
  };

  if (showBookingForm && id) {
    return (
      <div className="min-h-screen bg-gray-100">
        <Header />
        <div className="container mx-auto px-6 py-16">
          <BookingForm 
            propertyId={id as string}
            onSuccess={handleBookingSuccess}
            onCancel={() => setShowBookingForm(false)}
          />
        </div>
      </div>
    );
  }

  if (detailsLoading) {
    return <div className="min-h-screen bg-gray-100 flex items-center justify-center">Loading...</div>;
  }

  if (detailsError || !propertyDetails) {
    return <div className="min-h-screen bg-gray-100 flex items-center justify-center text-red-500">{detailsError || 'Property not found'}</div>;
  }

  const isAvailable = availability?.available ?? true;

  return (
    <div className="min-h-screen bg-gray-100 font-sans">
      <Header />
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.8 }}
        className="container mx-auto px-6 py-16"
      >
        <div className="bg-white rounded-lg shadow-lg overflow-hidden">
          <img
            src={propertyDetails.images[0] || '/placeholder.jpg'}
            alt={propertyDetails.title}
            className="w-full h-96 object-cover"
          />
          <div className="p-8">
            {/* Availability Badge */}
            <div className="mb-4">
              {isAvailable ? (
                <span className="inline-block px-4 py-2 bg-green-100 text-green-800 rounded-full text-sm font-semibold">
                  ✓ Available for Booking
                </span>
              ) : (
                <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg">
                  <p className="font-semibold">⚠️ Currently Booked</p>
                  {availability?.booking && (
                    <p className="text-sm mt-1">
                      This property is reserved until {new Date(availability.booking.expiryDate).toLocaleDateString()}
                    </p>
                  )}
                </div>
              )}
            </div>

            <h1 className="text-3xl font-bold text-gray-800 mb-4">{propertyDetails.title}</h1>
            <p className="text-2xl text-orange-500 mb-4">₦{propertyDetails.price.toLocaleString()}</p>
            <p className="text-gray-600 mb-6">{propertyDetails.description}</p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              <div className="flex items-center">
                <FaBed className="text-green-600 mr-2" />
                <span>{propertyDetails.bedrooms} Bedrooms</span>
              </div>
              <div className="flex items-center">
                <FaBath className="text-green-600 mr-2" />
                <span>{propertyDetails.bathrooms} Bathrooms</span>
              </div>
              <div className="flex items-center">
                <FaRulerCombined className="text-green-600 mr-2" />
                <span>{propertyDetails.area} sq ft</span>
              </div>
            </div>
            <p className="text-gray-600 mb-4"><strong>Address:</strong> {propertyDetails.address}</p>
            <p className="text-gray-600 mb-4"><strong>Type:</strong> {propertyDetails.propertyType}</p>
            {propertyDetails.amenities && (
              <p className="text-gray-600 mb-4"><strong>Amenities:</strong> {propertyDetails.amenities.join(', ')}</p>
            )}
            <div className="mt-6">
              <h3 className="text-xl font-semibold text-gray-800 mb-2">Contact Information</h3>
              <div className="flex items-center space-x-4">
                <FaPhone className="text-green-600" />
                <span>{propertyDetails.contactInfo?.phone}</span>
              </div>
              <div className="flex items-center space-x-4">
                <FaEnvelope className="text-green-600" />
                <span>{propertyDetails.contactInfo?.email}</span>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="mt-6 flex flex-wrap gap-4">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="px-6 py-3 bg-orange-500 text-white rounded-full font-semibold shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
                onClick={() => window.location.href = `mailto:${propertyDetails.contactInfo?.email}`}
              >
                Contact Agent
              </motion.button>

              {isAvailable && (
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="px-6 py-3 bg-gradient-to-r from-green-500 to-emerald-500 text-white rounded-full font-semibold shadow-lg flex items-center"
                  onClick={handleBookNowClick}
                >
                  <FaCalendar className="mr-2" />
                  Book Now
                </motion.button>
              )}
            </div>

            {/* Booking Information */}
            {isAvailable && (
              <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <h4 className="font-semibold text-blue-800 mb-2">📋 Booking Process:</h4>
                <ul className="text-sm text-blue-700 space-y-1 list-disc list-inside">
                  <li>Click "Book Now" to reserve this property</li>
                  <li>Fill in your personal details and upload a verification photo</li>
                  <li>Your booking will be valid for 7 days</li>
                  <li>Visit our office to complete payment within the booking period</li>
                  <li>Bring your booking form and original ID for verification</li>
                </ul>
              </div>
            )}
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default PropertyDetails;