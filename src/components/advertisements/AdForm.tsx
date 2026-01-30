'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FaArrowLeft, FaArrowRight, FaCheck, FaImage, FaGlobe, FaBriefcase, FaSpinner, FaCloudUploadAlt } from 'react-icons/fa';
import AdPlanSelector from './AdPlanSelector';
import { calculateAdPrice } from '@/config/adPricing';
import { BASEURL } from '@/config/api/contants';
import { uploadImageToCloudinary, CloudinaryError } from '@/utils/cloudinary';
import axios from 'axios';
import Image from 'next/image';

interface AdFormData {
  title: string;
  description: string;
  imageUrl: string;
  targetUrl: string;
  companyName: string;
  contactEmail: string;
  contactPhone: string;
  location: string;
  duration: number;
}

const STEPS = [
  { id: 1, title: 'Ad Details', icon: <FaBriefcase /> },
  { id: 2, title: 'Select Plan', icon: <FaGlobe /> },
  { id: 3, title: 'Preview & Submit', icon: <FaCheck /> },
];

export default function AdForm() {
  const [currentStep, setCurrentStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [adReference, setAdReference] = useState('');
  const [imageUploading, setImageUploading] = useState(false);
  const [imageUploadError, setImageUploadError] = useState('');

  const [formData, setFormData] = useState<AdFormData>({
    title: '',
    description: '',
    imageUrl: '',
    targetUrl: '',
    companyName: '',
    contactEmail: '',
    contactPhone: '',
    location: 'landing_page_hero',
    duration: 30,
  });

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      setImageUploadError('Please select a valid image file');
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      setImageUploadError('Image size must be less than 5MB');
      return;
    }

    setImageUploading(true);
    setImageUploadError('');

    try {
      const response = await uploadImageToCloudinary(file, {
        folder: 'flamingo-advertisements',
      });
      setFormData((prev) => ({ ...prev, imageUrl: response.secure_url }));
      setImageUploadError('');
    } catch (err) {
      const errorMessage = err instanceof CloudinaryError ? err.message : 'Failed to upload image';
      setImageUploadError(errorMessage);
      console.error('Image upload error:', err);
    } finally {
      setImageUploading(false);
      // Reset file input
      if (e.target) e.target.value = '';
    }
  };

  const handleNext = () => {
    if (currentStep < 3) {
      setCurrentStep((prev) => prev + 1);
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep((prev) => prev - 1);
    }
  };

  const handleSubmit = async () => {
    setLoading(true);
    setError('');

    try {
      const token = localStorage.getItem('token');
      const totalPrice = calculateAdPrice(formData.location, formData.duration);
      const pricePerDay = totalPrice / formData.duration;

      const headers: any = {
        'Content-Type': 'application/json',
      };
      
      if (token) {
        headers.Authorization = `Bearer ${token}`;
      }

      const response = await axios.post(
        `${BASEURL}/advertisements/create`,
        {
          ...formData,
          totalPrice,
          pricePerDay,
        },
        { headers }
      );

      if (response.data.success) {
        setSuccess(true);
        setAdReference(response.data.advertisement.adReference);
      }
    } catch (err: any) {
      // Extract error message safely
      let errorMessage = 'Failed to create advertisement. Please try again.';
      
      console.error('Advertisement creation error:', err);
      console.error('Error response:', err.response?.data);
      
      if (err.response?.data) {
        if (typeof err.response.data.message === 'string') {
          errorMessage = err.response.data.message;
        } else if (err.response.data.error) {
          errorMessage = err.response.data.error;
        } else if (typeof err.response.data === 'string') {
          errorMessage = err.response.data;
        }
      } else if (err.message) {
        errorMessage = err.message;
      }
      
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const isStep1Valid = () => {
    return (
      formData.title.trim().length >= 5 &&
      formData.description.trim().length >= 20 &&
      formData.imageUrl.trim() &&
      formData.targetUrl.trim() &&
      formData.companyName.trim() &&
      formData.contactEmail.trim() &&
      formData.contactPhone.trim()
    );
  };

  const isStep2Valid = () => {
    return formData.location && formData.duration > 0;
  };

  if (success) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="max-w-2xl mx-auto text-center py-12"
      >
        <div className="bg-white dark:bg-gray-800 p-8 rounded-2xl shadow-xl">
          <div className="w-20 h-20 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mx-auto mb-6">
            <FaCheck className="text-4xl text-green-500" />
          </div>
          <h2 className="text-3xl font-bold text-gray-800 dark:text-white mb-4">
            Advertisement Submitted!
          </h2>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            Your advertisement has been successfully submitted for review.
          </p>
          <div className="bg-blue-50 dark:bg-blue-900/30 p-4 rounded-lg mb-6">
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">Reference Number:</p>
            <p className="text-2xl font-bold text-[#f58c55]">{adReference}</p>
          </div>
          <div className="space-y-3 text-left bg-gray-50 dark:bg-gray-700/50 p-4 rounded-lg">
            <p className="text-sm text-gray-700 dark:text-gray-300">
              ✅ Your ad will be reviewed by our admin team
            </p>
            <p className="text-sm text-gray-700 dark:text-gray-300">
              🕒 Once approved, you can pay via Paystack to activate your ad
            </p>
            <p className="text-sm text-gray-700 dark:text-gray-300">
              🚀 Once payment is confirmed, your ad will go live
            </p>
          </div>
          <button
            onClick={() => (window.location.href = '/my-ads')}
            className="mt-4 bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-200 px-6 py-2 rounded-lg border border-gray-200 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors"
          >
            Go to My Ads
          </button>
          <button
            onClick={() => window.location.reload()}
            className="mt-6 bg-[#f58c55] text-white px-8 py-3 rounded-lg hover:bg-[#e67e4a] transition-colors"
          >
            Create Another Ad
          </button>
        </div>
      </motion.div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      {/* Progress Steps */}
      <div className="mb-8">
        <div className="flex items-center justify-center space-x-4">
          {STEPS.map((step, index) => (
            <React.Fragment key={step.id}>
              <div className="flex items-center">
                <motion.div
                  animate={{
                    scale: currentStep === step.id ? 1.1 : 1,
                  }}
                  className={`flex items-center justify-center w-12 h-12 rounded-full transition-colors ${
                    currentStep >= step.id
                      ? 'bg-[#f58c55] text-white'
                      : 'bg-gray-200 text-gray-500'
                  }`}
                >
                  {step.icon}
                </motion.div>
                <div className="ml-3 hidden md:block">
                  <p className="text-sm font-semibold text-gray-800 dark:text-white">
                    {step.title}
                  </p>
                </div>
              </div>
              {index < STEPS.length - 1 && (
                <div
                  className={`h-1 w-16 transition-colors ${
                    currentStep > step.id ? 'bg-[#f58c55]' : 'bg-gray-200'
                  }`}
                />
              )}
            </React.Fragment>
          ))}
        </div>
      </div>

      {/* Form Content */}
      <AnimatePresence mode="wait">
        <motion.div
          key={currentStep}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          className="bg-white dark:bg-gray-800 p-8 rounded-2xl shadow-xl"
        >
          {/* Step 1: Ad Details */}
          {currentStep === 1 && (
            <div className="space-y-6">
              <h2 className="text-3xl font-bold text-gray-800 dark:text-white mb-6">
                Tell Us About Your Ad
              </h2>

              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                  Ad Title *
                </label>
                <input
                  type="text"
                  name="title"
                  value={formData.title}
                  onChange={handleInputChange}
                  placeholder="e.g., Summer Sale - 50% Off All Products"
                  className="w-full px-4 py-3 rounded-lg border-2 border-gray-200 dark:border-gray-700 dark:bg-gray-700 dark:text-white focus:border-[#f58c55] focus:ring-2 focus:ring-[#f58c55]/20 transition-all outline-none"
                  maxLength={100}
                />
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  {formData.title.length}/100 characters (minimum 5)
                </p>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                  Description *
                </label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  placeholder="Describe your advertisement campaign"
                  rows={4}
                  className="w-full px-4 py-3 rounded-lg border-2 border-gray-200 dark:border-gray-700 dark:bg-gray-700 dark:text-white focus:border-[#f58c55] focus:ring-2 focus:ring-[#f58c55]/20 transition-all outline-none resize-none"
                  maxLength={500}
                />
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  {formData.description.length}/500 characters (minimum 20)
                </p>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                  Ad Image *
                </label>
                <div className="space-y-2">
                  <div className="relative">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageUpload}
                      disabled={imageUploading}
                      className="hidden"
                      id="image-upload"
                    />
                    <label
                      htmlFor="image-upload"
                      className={`flex items-center justify-center w-full px-4 py-8 rounded-lg border-2 border-dashed transition-all cursor-pointer ${
                        imageUploading
                          ? 'border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-700/30'
                          : 'border-gray-300 dark:border-gray-600 hover:border-[#f58c55] hover:bg-orange-50 dark:hover:bg-gray-700/50'
                      }`}
                    >
                      <div className="text-center">
                        {imageUploading ? (
                          <>
                            <FaSpinner className="text-3xl text-[#f58c55] animate-spin mx-auto mb-2" />
                            <p className="text-sm text-gray-600 dark:text-gray-400">Uploading...</p>
                          </>
                        ) : (
                          <>
                            <FaCloudUploadAlt className="text-4xl text-gray-400 dark:text-gray-500 mx-auto mb-2" />
                            <p className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                              Click to upload or drag and drop
                            </p>
                            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                              PNG, JPG, GIF up to 5MB (recommended 1200x628px)
                            </p>
                          </>
                        )}
                      </div>
                    </label>
                  </div>
                  
                  {imageUploadError && (
                    <p className="text-sm text-red-600 dark:text-red-400">{imageUploadError}</p>
                  )}
                  
                  {formData.imageUrl && (
                    <div className="relative w-full h-40 rounded-lg overflow-hidden border-2 border-green-300 dark:border-green-700">
                      <Image
                        src={formData.imageUrl}
                        alt="Ad Preview"
                        fill
                        className="object-cover"
                      />
                      <div className="absolute top-2 right-2 bg-green-500 text-white px-3 py-1 rounded-full text-xs font-semibold flex items-center space-x-1">
                        <FaCheck className="text-sm" />
                        <span>Uploaded</span>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                  Target URL *
                </label>
                <input
                  type="url"
                  name="targetUrl"
                  value={formData.targetUrl}
                  onChange={handleInputChange}
                  placeholder="https://yourwebsite.com"
                  className="w-full px-4 py-3 rounded-lg border-2 border-gray-200 dark:border-gray-700 dark:bg-gray-700 dark:text-white focus:border-[#f58c55] focus:ring-2 focus:ring-[#f58c55]/20 transition-all outline-none"
                />
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  Where users will be redirected when they click your ad
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                    Company Name *
                  </label>
                  <input
                    type="text"
                    name="companyName"
                    value={formData.companyName}
                    onChange={handleInputChange}
                    placeholder="Your Company"
                    className="w-full px-4 py-3 rounded-lg border-2 border-gray-200 dark:border-gray-700 dark:bg-gray-700 dark:text-white focus:border-[#f58c55] focus:ring-2 focus:ring-[#f58c55]/20 transition-all outline-none"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                    Contact Email *
                  </label>
                  <input
                    type="email"
                    name="contactEmail"
                    value={formData.contactEmail}
                    onChange={handleInputChange}
                    placeholder="contact@company.com"
                    className="w-full px-4 py-3 rounded-lg border-2 border-gray-200 dark:border-gray-700 dark:bg-gray-700 dark:text-white focus:border-[#f58c55] focus:ring-2 focus:ring-[#f58c55]/20 transition-all outline-none"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                    Phone Number *
                  </label>
                  <input
                    type="tel"
                    name="contactPhone"
                    value={formData.contactPhone}
                    onChange={handleInputChange}
                    placeholder="+234 123 456 7890"
                    className="w-full px-4 py-3 rounded-lg border-2 border-gray-200 dark:border-gray-700 dark:bg-gray-700 dark:text-white focus:border-[#f58c55] focus:ring-2 focus:ring-[#f58c55]/20 transition-all outline-none"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Step 2: Plan Selection */}
          {currentStep === 2 && (
            <AdPlanSelector
              selectedLocation={formData.location}
              selectedDuration={formData.duration}
              onLocationSelect={(location) =>
                setFormData((prev) => ({ ...prev, location }))
              }
              onDurationSelect={(duration) =>
                setFormData((prev) => ({ ...prev, duration }))
              }
            />
          )}

          {/* Step 3: Preview & Submit */}
          {currentStep === 3 && (
            <div className="space-y-6">
              <h2 className="text-3xl font-bold text-gray-800 dark:text-white mb-6">
                Review Your Advertisement
              </h2>

              {/* Ad Preview */}
              <div className="border-2 border-gray-200 dark:border-gray-700 rounded-xl p-6 bg-gray-50 dark:bg-gray-700/50">
                <h3 className="text-lg font-bold dark:text-white mb-4">Ad Preview</h3>
                <div className="bg-white dark:bg-gray-800 rounded-lg overflow-hidden shadow-md">
                  {formData.imageUrl && (
                    <div className="relative w-full h-64">
                      <Image
                        src={formData.imageUrl}
                        alt={formData.title}
                        fill
                        className="object-cover"
                      />
                    </div>
                  )}
                  <div className="p-4">
                    <h4 className="text-xl font-bold text-gray-800 dark:text-white mb-2">
                      {formData.title}
                    </h4>
                    <p className="text-gray-600 dark:text-gray-400 text-sm mb-3">
                      {formData.description}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-500">
                      {formData.companyName}
                    </p>
                  </div>
                </div>
              </div>

              {/* Campaign Details */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-blue-50 dark:bg-blue-900/30 p-4 rounded-lg">
                  <p className="text-sm text-gray-600 dark:text-gray-400">Total Cost</p>
                  <p className="text-2xl font-bold text-[#f58c55]">
                    ₦
                    {calculateAdPrice(
                      formData.location,
                      formData.duration
                    ).toLocaleString()}
                  </p>
                </div>
                <div className="bg-green-50 dark:bg-green-900/30 p-4 rounded-lg">
                  <p className="text-sm text-gray-600 dark:text-gray-400">Campaign Duration</p>
                  <p className="text-2xl font-bold text-gray-800 dark:text-white">
                    {formData.duration} days
                  </p>
                </div>
              </div>

              {error && (
                <div className="bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 p-4 rounded-lg">
                  {typeof error === 'string' ? error : 'An error occurred'}
                </div>
              )}
            </div>
          )}

          {/* Navigation Buttons */}
          <div className="flex justify-between mt-8">
            <button
              onClick={handleBack}
              disabled={currentStep === 1}
              className={`flex items-center space-x-2 px-6 py-3 rounded-lg transition-colors ${
                currentStep === 1
                  ? 'bg-gray-200 dark:bg-gray-700 text-gray-400 dark:text-gray-500 cursor-not-allowed'
                  : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600'
              }`}
            >
              <FaArrowLeft />
              <span>Back</span>
            </button>

            {currentStep < 3 ? (
              <button
                onClick={handleNext}
                disabled={
                  (currentStep === 1 && !isStep1Valid()) ||
                  (currentStep === 2 && !isStep2Valid())
                }
                className={`flex items-center space-x-2 px-6 py-3 rounded-lg transition-colors ${
                  (currentStep === 1 && !isStep1Valid()) ||
                  (currentStep === 2 && !isStep2Valid())
                    ? 'bg-gray-300 dark:bg-gray-700 text-gray-500 dark:text-gray-400 cursor-not-allowed'
                    : 'bg-[#f58c55] text-white hover:bg-[#e67e4a]'
                }`}
              >
                <span>Next</span>
                <FaArrowRight />
              </button>
            ) : (
              <button
                onClick={handleSubmit}
                disabled={loading}
                className="flex items-center space-x-2 px-8 py-3 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <>
                    <span className="animate-spin">⏳</span>
                    <span>Submitting...</span>
                  </>
                ) : (
                  <>
                    <FaCheck />
                    <span>Submit Advertisement</span>
                  </>
                )}
              </button>
            )}
          </div>
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
