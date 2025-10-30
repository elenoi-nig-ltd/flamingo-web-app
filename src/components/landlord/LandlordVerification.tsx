'use client'

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FaFileUpload, FaCheckCircle, FaExclamationCircle } from 'react-icons/fa';
import { useLandlord } from '@/hooks/useLandlord';
import { useAuth } from '@/hooks/useAuth';
import { useRouter } from 'next/navigation';
import Header from '../Header';
// import LandlordSidebar from './LandlordSidebar';

const LandlordVerification = () => {
  const { verificationStatus, loading, error, setError, submitVerification } = useLandlord();
  const { user } = useAuth();
  const router = useRouter();
  const [formData, setFormData] = useState({
    fullName: '',
    photo: null as File | null,
    photoUrl: '',
    homeAddress: '',
    phoneNumber: '',
    phoneNumber2: '',
    email: '',
  });
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);

  // Initialize form with existing verification data
  useEffect(() => {
    if (verificationStatus) {
      setFormData({
        fullName: verificationStatus.fullName || '',
        photo: null,
        photoUrl: verificationStatus.photoUrl || '',
        homeAddress: verificationStatus.homeAddress || '',
        phoneNumber: verificationStatus.phoneNumber || '',
        phoneNumber2: verificationStatus.phoneNumber2 || '',
        email: verificationStatus.email || '',
      });
      setPhotoPreview(verificationStatus.photoUrl || null);
    }
  }, [verificationStatus]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setFormData({ ...formData, photo: file });
      setPhotoPreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!formData.fullName || !formData.homeAddress || !formData.phoneNumber || !formData.email) {
      setError('Please fill in all required fields');
      return;
    }

    if (!formData.photo && !formData.photoUrl) {
      setError('Please select a photo');
      return;
    }

    try {
      await submitVerification({
        fullName: formData.fullName,
        photo: formData.photo || new File([], 'placeholder'), // Fallback for updates with existing photoUrl
        homeAddress: formData.homeAddress,
        phoneNumber: formData.phoneNumber,
        phoneNumber2: formData.phoneNumber2,
        email: formData.email,
      });
      if (photoPreview) {
        URL.revokeObjectURL(photoPreview);
        setPhotoPreview(null);
      }
      router.push('/landlord/profile');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 font-sans flex">
      {/* <LandlordSidebar /> */}
      <div className="flex-1">
        <Header />
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="container mx-auto px-6 py-16 flex justify-center"
        >
          <div className="w-full max-w-md bg-white p-8 rounded-lg shadow-lg">
            <h2 className="text-2xl font-bold text-gray-800 mb-6 text-center">Landlord Verification</h2>

            {verificationStatus?.status === 'verified' && (
              <div className="text-green-500 mb-4 text-center flex items-center justify-center">
                <FaCheckCircle className="mr-2" /> Verified
              </div>
            )}
            {verificationStatus?.status === 'rejected' && (
              <div className="text-red-500 mb-4 text-center flex items-center justify-center">
                <FaExclamationCircle className="mr-2" /> Rejected: {verificationStatus.rejectionReason}
              </div>
            )}
            {verificationStatus?.status === 'pending' && (
              <div className="text-yellow-500 mb-4 text-center flex items-center justify-center">
                <FaExclamationCircle className="mr-2" /> Verification Pending
              </div>
            )}
            {error && <p className="text-red-500 mb-4 text-center">{error}</p>}

            {(verificationStatus?.status === 'not_submitted' || verificationStatus?.status === 'rejected') && (
              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <label className="block text-gray-700 mb-2">Full Name</label>
                  <input
                    type="text"
                    name="fullName"
                    value={formData.fullName}
                    onChange={handleInputChange}
                    className="w-full p-3 border rounded focus:outline-none focus:ring-2 focus:ring-orange-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-gray-700 mb-2">Photo</label>
                  <div className="relative">
                    <FaFileUpload className="absolute top-3 left-3 text-green-600" />
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleFileChange}
                      className="w-full pl-10 p-3 border rounded focus:outline-none focus:ring-2 focus:ring-orange-500"
                    />
                  </div>
                  {photoPreview && (
                    <img
                      src={photoPreview}
                      alt="Photo Preview"
                      className="mt-4 w-32 h-32 object-cover rounded"
                    />
                  )}
                </div>
                <div>
                  <label className="block text-gray-700 mb-2">Home Address</label>
                  <input
                    type="text"
                    name="homeAddress"
                    value={formData.homeAddress}
                    onChange={handleInputChange}
                    className="w-full p-3 border rounded focus:outline-none focus:ring-2 focus:ring-orange-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-gray-700 mb-2">Phone Number</label>
                  <input
                    type="tel"
                    name="phoneNumber"
                    value={formData.phoneNumber}
                    onChange={handleInputChange}
                    className="w-full p-3 border rounded focus:outline-none focus:ring-2 focus:ring-orange-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-gray-700 mb-2">Secondary Phone Number (Optional)</label>
                  <input
                    type="tel"
                    name="phoneNumber2"
                    value={formData.phoneNumber2}
                    onChange={handleInputChange}
                    className="w-full p-3 border rounded focus:outline-none focus:ring-2 focus:ring-orange-500"
                  />
                </div>
                <div>
                  <label className="block text-gray-700 mb-2">Email</label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    className="w-full p-3 border rounded focus:outline-none focus:ring-2 focus:ring-orange-500"
                    required
                  />
                </div>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  type="submit"
                  disabled={loading}
                  className="w-full py-3 bg-orange-500 text-white rounded-full font-semibold shadow-lg disabled:opacity-50"
                >
                  {loading ? 'Submitting...' : 'Submit Verification'}
                </motion.button>
              </form>
            )}
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default LandlordVerification;