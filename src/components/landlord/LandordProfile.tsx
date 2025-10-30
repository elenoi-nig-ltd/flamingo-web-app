'use client'

import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { FaUser, FaEdit, FaSave, FaTimes, FaFileImage, FaBars } from 'react-icons/fa';
import { useAuth } from '@/hooks/useAuth';
import { useLandlord } from '@/hooks/useLandlord';
import { useRouter } from 'next/navigation';
import Header from '../Header';
import LandlordSidebar from './LandlordSidebar';
import { uploadMultipleImagesToCloudinary } from '@/utils/cloudinary';

const LandlordProfile = () => {
  const { user, logout } = useAuth();
  const { verificationStatus, loading, error, submitVerification, checkVerificationStatus } = useLandlord();
  const router = useRouter();
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    fullName: '',
    photo: null as File | null,
    homeAddress: '',
    phoneNumber: '',
    phoneNumber2: '',
    email: '',
  });
  const [photoUrl, setPhotoUrl] = useState<string>(''); // Separate state for photoUrl
  const [formError, setFormError] = useState<string | null>(null);
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isDesktop, setIsDesktop] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Detect screen size for responsive sidebar
  useEffect(() => {
    const handleResize = () => {
      setIsDesktop(window.innerWidth >= 768);
      if (window.innerWidth >= 768) {
        setIsSidebarOpen(true);
      } else {
        setIsSidebarOpen(false);
      }
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Initialize form with verification data
  useEffect(() => {
    if (verificationStatus) {
      setFormData({
        fullName: verificationStatus.fullName || '',
        photo: null,
        homeAddress: verificationStatus.homeAddress || '',
        phoneNumber: verificationStatus.phoneNumber || '',
        phoneNumber2: verificationStatus.phoneNumber2 || '',
        email: verificationStatus.email || '',
      });
      setPhotoUrl(verificationStatus.photoUrl || '');
    }
  }, [verificationStatus]);

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  // Handle input changes
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // Handle file input change
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    if (file && file.type.startsWith('image/')) {
      setFormData((prev) => ({ ...prev, photo: file }));
      const fileUrl = URL.createObjectURL(file);
      setPreviewImage(fileUrl);
    }
  };

  // Handle drag-and-drop
  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file && file.type.startsWith('image/')) {
      setFormData((prev) => ({ ...prev, photo: file }));
      const fileUrl = URL.createObjectURL(file);
      setPreviewImage(fileUrl);
    }
  };

  const handleClick = () => {
    fileInputRef.current?.click();
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    if (!formData.fullName || !formData.homeAddress || !formData.phoneNumber || !formData.email) {
      setFormError('Please fill in all required fields');
      return;
    }

    if (!formData.photo && !photoUrl) {
      setFormError('Please upload a profile photo');
      return;
    }

    try {
      let newPhotoUrl = photoUrl;
      if (formData.photo) {
        const uploadResponse = await uploadMultipleImagesToCloudinary([formData.photo]);
        newPhotoUrl = uploadResponse[0].secure_url;
      }

      // Submit only the expected properties
      await submitVerification({
        fullName: formData.fullName,
        photo: formData.photo || new File([], ''), // Use empty file if photoUrl exists
        homeAddress: formData.homeAddress,
        phoneNumber: formData.phoneNumber,
        phoneNumber2: formData.phoneNumber2,
        email: formData.email,
      });

      setPhotoUrl(newPhotoUrl); // Update photoUrl after successful upload
      setIsEditing(false);
      setPreviewImage(null);
      if (previewImage) {
        URL.revokeObjectURL(previewImage);
      }
      await checkVerificationStatus();
    } catch (err) {
      setFormError(err instanceof Error ? err.message : 'Failed to update profile');
    }
  };

  // Check if editing is allowed
  const canEdit = verificationStatus?.status !== 'verified';

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900 font-sans transition-colors duration-300">
      <Header />
      <div className="flex pt-16">
        <LandlordSidebar
          isOpen={isSidebarOpen}
          onClose={() => setIsSidebarOpen(false)}
          isDesktop={isDesktop}
        />

        <main
          className={`flex-1 transition-all duration-300 ${
            isDesktop ? 'ml-0' : isSidebarOpen ? 'ml-64' : 'ml-0'
          } w-full min-h-[calc(100vh-64px)]`}
        >
          {!isDesktop && (
            <button
              onClick={toggleSidebar}
              className="m-4 text-white rounded-full transition-colors"
              aria-label={isSidebarOpen ? 'Close menu' : 'Open menu'}
            >
              {isSidebarOpen ? <FaTimes className="text-lg" /> : <FaBars className="text-lg" />}
            </button>
          )}

          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="w-full px-4 sm:px-6 py-6"
          >
            <div className="w-full bg-white dark:bg-gray-800 p-4 sm:p-8 rounded-lg shadow-lg">
              <div className="flex justify-between items-center mb-8">
                <h1 className="text-3xl font-bold text-gray-800 dark:text-gray-100">Landlord Profile</h1>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={logout}
                  className="px-4 py-2 bg-orange-500 dark:bg-orange-600 text-white rounded-full font-semibold shadow-lg"
                >
                  Logout
                </motion.button>
              </div>

              {loading ? (
                <div className="text-gray-600 dark:text-gray-300">Loading...</div>
              ) : error || formError ? (
                <p className="text-red-500 dark:text-red-400 mb-4">{error || formError}</p>
              ) : !verificationStatus ? (
                <p className="text-gray-600 dark:text-gray-300">No profile data available.</p>
              ) : (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5 }}
                  className="space-y-6 w-full"
                >
                  <div className="flex items-center space-x-4 mb-6">
                    <FaUser className="text-4xl text-green-600 dark:text-green-400" />
                    <h2 className="text-2xl font-semibold text-gray-700 dark:text-gray-100">Profile Details</h2>
                  </div>

                  {isEditing && canEdit ? (
                    <form onSubmit={handleSubmit} className="space-y-6 w-full">
                      <div className="relative w-full">
                        <label className="block text-gray-700 dark:text-gray-300 font-medium">Full Name</label>
                        <input
                          type="text"
                          name="fullName"
                          value={formData.fullName}
                          onChange={handleInputChange}
                          className="w-full p-3 border rounded focus:outline-none focus:ring-2 focus:ring-orange-500 dark:bg-gray-700 dark:text-gray-100 dark:border-gray-600"
                          required
                        />
                      </div>
                      <div className="relative w-full">
                        <label className="block text-gray-700 dark:text-gray-300 font-medium">Profile Photo</label>
                        {(photoUrl || previewImage) && (
                          <img
                            src={previewImage || photoUrl}
                            alt="Profile"
                            className="w-32 h-32 object-cover rounded-lg mb-2 border dark:border-gray-600"
                          />
                        )}
                        <div
                          className={`w-full p-6 border-2 border-dashed rounded-lg text-center cursor-pointer transition-colors
                            ${isDragging
                              ? 'border-orange-500 bg-orange-50 dark:bg-orange-900/20'
                              : 'border-gray-300 dark:border-gray-600 hover:border-orange-400 dark:hover:border-orange-500'
                            }`}
                          onDragOver={handleDragOver}
                          onDragLeave={handleDragLeave}
                          onDrop={handleDrop}
                          onClick={handleClick}
                        >
                          <FaFileImage className="mx-auto text-2xl text-green-600 dark:text-green-400 mb-2" />
                          <p className="text-gray-600 dark:text-gray-300">
                            {isDragging ? 'Drop image here' : 'Drag & drop image here or click to select'}
                          </p>
                          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                            (Only image files are accepted)
                          </p>
                          <input
                            type="file"
                            accept="image/*"
                            onChange={handleFileChange}
                            className="hidden"
                            ref={fileInputRef}
                          />
                        </div>
                      </div>
                      <div className="relative w-full">
                        <label className="block text-gray-700 dark:text-gray-300 font-medium">Home Address</label>
                        <input
                          type="text"
                          name="homeAddress"
                          value={formData.homeAddress}
                          onChange={handleInputChange}
                          className="w-full p-3 border rounded focus:outline-none focus:ring-2 focus:ring-orange-500 dark:bg-gray-700 dark:text-gray-100 dark:border-gray-600"
                          required
                        />
                      </div>
                      <div className="relative w-full">
                        <label className="block text-gray-700 dark:text-gray-300 font-medium">Phone Number</label>
                        <input
                          type="tel"
                          name="phoneNumber"
                          value={formData.phoneNumber}
                          onChange={handleInputChange}
                          className="w-full p-3 border rounded focus:outline-none focus:ring-2 focus:ring-orange-500 dark:bg-gray-700 dark:text-gray-100 dark:border-gray-600"
                          required
                        />
                      </div>
                      <div className="relative w-full">
                        <label className="block text-gray-700 dark:text-gray-300 font-medium">Secondary Phone Number (Optional)</label>
                        <input
                          type="tel"
                          name="phoneNumber2"
                          value={formData.phoneNumber2}
                          onChange={handleInputChange}
                          className="w-full p-3 border rounded focus:outline-none focus:ring-2 focus:ring-orange-500 dark:bg-gray-700 dark:text-gray-100 dark:border-gray-600"
                        />
                      </div>
                      <div className="relative w-full">
                        <label className="block text-gray-700 dark:text-gray-300 font-medium">Email</label>
                        <input
                          type="email"
                          name="email"
                          value={formData.email}
                          onChange={handleInputChange}
                          className="w-full p-3 border rounded focus:outline-none focus:ring-2 focus:ring-orange-500 dark:bg-gray-700 dark:text-gray-100 dark:border-gray-600"
                          required
                        />
                      </div>
                      <div className="flex space-x-4">
                        <motion.button
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          type="submit"
                          className="px-4 py-2 bg-green-600 dark:bg-green-500 text-white rounded-full font-semibold shadow-lg flex items-center"
                        >
                          <FaSave className="mr-2" /> Save
                        </motion.button>
                        <motion.button
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          type="button"
                          onClick={() => {
                            setIsEditing(false);
                            if (previewImage) {
                              URL.revokeObjectURL(previewImage);
                              setPreviewImage(null);
                            }
                          }}
                          className="px-4 py-2 bg-gray-500 dark:bg-gray-600 text-white rounded-full font-semibold shadow-lg flex items-center"
                        >
                          <FaTimes className="mr-2" /> Cancel
                        </motion.button>
                      </div>
                    </form>
                  ) : (
                    <div className="space-y-6">
                      <div>
                        <label className="block text-gray-700 dark:text-gray-300 font-medium">Full Name</label>
                        <p className="text-gray-600 dark:text-gray-300">{verificationStatus.fullName}</p>
                      </div>
                      <div>
                        <label className="block text-gray-700 dark:text-gray-300 font-medium">Profile Photo</label>
                        {photoUrl ? (
                          <img
                            src={photoUrl}
                            alt="Profile"
                            className="w-32 h-32 object-cover rounded-lg border dark:border-gray-600"
                          />
                        ) : (
                          <p className="text-gray-600 dark:text-gray-300">No photo uploaded</p>
                        )}
                      </div>
                      <div>
                        <label className="block text-gray-700 dark:text-gray-300 font-medium">Home Address</label>
                        <p className="text-gray-600 dark:text-gray-300">{verificationStatus.homeAddress}</p>
                      </div>
                      <div>
                        <label className="block text-gray-700 dark:text-gray-300 font-medium">Phone Number</label>
                        <p className="text-gray-600 dark:text-gray-300">{verificationStatus.phoneNumber}</p>
                      </div>
                      <div>
                        <label className="block text-gray-700 dark:text-gray-300 font-medium">Secondary Phone Number</label>
                        <p className="text-gray-600 dark:text-gray-300">{verificationStatus.phoneNumber2 || 'Not provided'}</p>
                      </div>
                      <div>
                        <label className="block text-gray-700 dark:text-gray-300 font-medium">Email</label>
                        <p className="text-gray-600 dark:text-gray-300">{verificationStatus.email}</p>
                      </div>
                      <div>
                        <label className="block text-gray-700 dark:text-gray-300 font-medium">Verification Status</label>
                        <p
                          className={`text-sm ${
                            verificationStatus.status === 'verified'
                              ? 'text-green-600 dark:text-green-400'
                              : verificationStatus.status === 'rejected'
                              ? 'text-red-500 dark:text-red-400'
                              : 'text-orange-500 dark:text-orange-400'
                          }`}
                        >
                          {verificationStatus.status.charAt(0).toUpperCase() + verificationStatus.status.slice(1)}
                          {verificationStatus.rejectionReason && (
                            <span className="block text-sm text-red-500 dark:text-red-400">
                              Reason: {verificationStatus.rejectionReason}
                            </span>
                          )}
                        </p>
                      </div>
                      {canEdit && (
                        <motion.button
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={() => setIsEditing(true)}
                          className="px-4 py-2 bg-orange-500 dark:bg-orange-600 text-white rounded-full font-semibold shadow-lg flex items-center"
                        >
                          <FaEdit className="mr-2" /> Edit Profile
                        </motion.button>
                      )}
                    </div>
                  )}
                </motion.div>
              )}
            </div>
          </motion.div>
        </main>
      </div>
    </div>
  );
};

export default LandlordProfile;