import React, { useEffect } from 'react';
import { motion } from 'framer-motion';
import { FaBed, FaBath, FaRulerCombined, FaPhone, FaEnvelope } from 'react-icons/fa';
import { useRealEstates } from '@/hooks/useRealEstates';
import { useRouter } from 'next/router';
import Header from '../Header';

const PropertyDetails = () => {
  const { fetchPropertyDetails, propertyDetails, detailsLoading, detailsError } = useRealEstates();
  const router = useRouter();
  const { id } = router.query;

  useEffect(() => {
    if (id) {
      fetchPropertyDetails(id as string);
    }
  }, [id, fetchPropertyDetails]);

  if (detailsLoading) {
    return <div className="min-h-screen bg-gray-100 flex items-center justify-center">Loading...</div>;
  }

  if (detailsError || !propertyDetails) {
    return <div className="min-h-screen bg-gray-100 flex items-center justify-center text-red-500">{detailsError || 'Property not found'}</div>;
  }

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
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="mt-6 px-6 py-3 bg-orange-500 text-white rounded-full font-semibold shadow-lg"
              onClick={() => window.location.href = `mailto:${propertyDetails.contactInfo?.email}`}
            >
              Contact Agent
            </motion.button>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default PropertyDetails;