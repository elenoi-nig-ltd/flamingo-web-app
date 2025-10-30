'use client';

import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { FaHome, FaFileImage, FaBars, FaTimes } from 'react-icons/fa';
import { useRealEstates } from '@/hooks/useRealEstates';
import { useAuth } from '@/hooks/useAuth';
import { useRouter, useParams } from 'next/navigation';
import Header from '../Header';
import LandlordSidebar from './LandlordSidebar';
import { uploadMultipleImagesToCloudinary } from '@/utils/cloudinary';

const EditProperty = () => {
  const { fetchPropertyDetails, updateRealEstate, updateLoading, updateError } = useRealEstates();
  const { user } = useAuth();
  const router = useRouter();
  const params = useParams();
  const propertyId = params.id as string;
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    price: 0,
    address: '',
    propertyType: '',
    bedrooms: 0,
    bathrooms: 0,
    area: 0,
    images: [] as File[],
  });
  const [previewImages, setPreviewImages] = useState<string[]>([]);
  const [existingImages, setExistingImages] = useState<string[]>([]);
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

  // Fetch property details on mount
  useEffect(() => {
    if (propertyId) {
      fetchPropertyDetails(propertyId).then((property) => {
        if (property) {
          setFormData({
            title: property.title,
            description: property.description,
            price: property.price,
            address: property.address,
            propertyType: property.propertyType,
            bedrooms: property.bedrooms,
            bathrooms: property.bathrooms,
            area: property.area,
            images: [],
          });
          setExistingImages(property.images || []);
        }
      });
    }
  }, [propertyId, fetchPropertyDetails]);

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleFiles = (files: FileList) => {
    const validFiles = Array.from(files).filter(file => file.type.startsWith('image/'));
    if (validFiles.length === 0) return;

    const fileUrls = validFiles.map((file) => URL.createObjectURL(file));
    setFormData({ ...formData, images: [...formData.images, ...validFiles] });
    setPreviewImages([...previewImages, ...fileUrls]);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      handleFiles(e.target.files);
    }
  };

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
    if (e.dataTransfer.files) {
      handleFiles(e.dataTransfer.files);
    }
  };

  const handleClick = () => {
    fileInputRef.current?.click();
  };

  const removeExistingImage = (index: number) => {
    setExistingImages((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const payload = {
        title: formData.title,
        description: formData.description,
        price: Number(formData.price),
        address: formData.address,
        propertyType: formData.propertyType,
        bedrooms: Number(formData.bedrooms),
        bathrooms: Number(formData.bathrooms),
        area: Number(formData.area),
        images: [...existingImages], // Include existing images
      };

      if (formData.images.length > 0) {
        try {
          const uploadResponses = await uploadMultipleImagesToCloudinary(formData.images);
          payload.images = [...payload.images, ...uploadResponses.map(response => response.secure_url)];
        } catch (uploadError) {
          console.error('Image upload failed:', uploadError);
        }
      }

      const success = await updateRealEstate(propertyId, payload);
      if (success) {
        previewImages.forEach((url) => URL.revokeObjectURL(url));
        router.push('/landlord/dashboard');
      }
    } catch (error) {
      console.error('Form submission failed:', error);
    }
  };

  if (!user || user.role !== 'landlord') {
    return <div className="text-center py-10 dark:text-gray-100">Only landlords can edit properties</div>;
  }

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
              <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-100 mb-6 text-center">
                Edit Property
              </h2>
              {updateError && (
                <p className="text-red-500 dark:text-red-400 mb-4 text-center">{updateError}</p>
              )}
              <form onSubmit={handleSubmit} className="space-y-6 w-full">
                <div className="relative w-full">
                  <FaHome className="absolute top-3 left-3 text-green-600 dark:text-green-400" />
                  <input
                    type="text"
                    name="title"
                    value={formData.title}
                    onChange={handleChange}
                    placeholder="Property Title"
                    className="w-full pl-10 p-3 border rounded focus:outline-none focus:ring-2 focus:ring-orange-500 dark:bg-gray-700 dark:text-gray-100 dark:border-gray-600"
                    required
                  />
                </div>
                <div className="w-full">
                  <textarea
                    name="description"
                    value={formData.description}
                    onChange={handleChange}
                    placeholder="Description"
                    className="w-full p-3 border rounded focus:outline-none focus:ring-2 focus:ring-orange-500 dark:bg-gray-700 dark:text-gray-100 dark:border-gray-600"
                    rows={4}
                    required
                  />
                </div>
                <div className="relative w-full">
                  <input
                    type="number"
                    name="price"
                    value={formData.price || ''}
                    onChange={handleChange}
                    placeholder="Price (₦)"
                    className="w-full pl-3 p-3 border rounded focus:outline-none focus:ring-2 focus:ring-orange-500 dark:bg-gray-700 dark:text-gray-100 dark:border-gray-600"
                    required
                  />
                </div>
                <div className="relative w-full">
                  <input
                    type="text"
                    name="address"
                    value={formData.address}
                    onChange={handleChange}
                    placeholder="Address"
                    className="w-full pl-3 p-3 border rounded focus:outline-none focus:ring-2 focus:ring-orange-500 dark:bg-gray-700 dark:text-gray-100 dark:border-gray-600"
                    required
                  />
                </div>
                <div className="w-full">
                  <select
                    name="propertyType"
                    value={formData.propertyType}
                    onChange={handleChange}
                    className="w-full p-3 border rounded focus:outline-none focus:ring-2 focus:ring-orange-500 dark:bg-gray-700 dark:text-gray-100 dark:border-gray-600"
                    required
                  >
                    <option value="" className="text-gray-500 dark:text-gray-400">
                      Select Property Type
                    </option>
                    <option value="apartment">Apartment</option>
                    <option value="lodge">Lodge</option>
                    <option value="house">House</option>
                    <option value="condo">Condo</option>
                    <option value="townhouse">Townhouse</option>
                    <option value="land">Land</option>
                  </select>
                </div>
                <div className="flex flex-col sm:flex-row sm:space-x-4 space-y-4 sm:space-y-0 w-full">
                  <input
                    type="number"
                    name="bedrooms"
                    value={formData.bedrooms || ''}
                    onChange={handleChange}
                    placeholder="Bedrooms"
                    className="w-full sm:w-1/2 p-3 border rounded focus:outline-none focus:ring-2 focus:ring-orange-500 dark:bg-gray-700 dark:text-gray-100 dark:border-gray-600"
                    required
                  />
                  <input
                    type="number"
                    name="bathrooms"
                    value={formData.bathrooms || ''}
                    onChange={handleChange}
                    placeholder="Bathrooms"
                    className="w-full sm:w-1/2 p-3 border rounded focus:outline-none focus:ring-2 focus:ring-orange-500 dark:bg-gray-700 dark:text-gray-100 dark:border-gray-600"
                    required
                  />
                </div>
                <div className="relative w-full">
                  <input
                    type="number"
                    name="area"
                    value={formData.area || ''}
                    onChange={handleChange}
                    placeholder="Area (sq ft)"
                    className="w-full p-3 border rounded focus:outline-none focus:ring-2 focus:ring-orange-500 dark:bg-gray-700 dark:text-gray-100 dark:border-gray-600"
                    required
                  />
                </div>
                <div className="relative w-full">
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
                      {isDragging
                        ? 'Drop images here'
                        : 'Drag & drop images here or click to select'}
                    </p>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                      (Only image files are accepted)
                    </p>
                    <input
                      type="file"
                      multiple
                      accept="image/*"
                      onChange={handleFileChange}
                      className="hidden"
                      ref={fileInputRef}
                    />
                  </div>
                </div>
                {existingImages.length > 0 && (
                  <div className="mt-4 w-full">
                    <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-100">
                      Existing Images
                    </h3>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 mt-2">
                      {existingImages.map((url, index) => (
                        <div key={index} className="relative">
                          <img
                            src={url}
                            alt={`Existing ${index + 1}`}
                            className="w-full h-24 object-cover rounded border dark:border-gray-600"
                          />
                          <button
                            type="button"
                            onClick={() => removeExistingImage(index)}
                            className="absolute top-1 right-1 bg-red-500 dark:bg-red-600 text-white rounded-full p-1"
                          >
                            X
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                {previewImages.length > 0 && (
                  <div className="mt-4 w-full">
                    <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-100">
                      New Image Previews
                    </h3>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 mt-2">
                      {previewImages.map((url, index) => (
                        <img
                          key={index}
                          src={url}
                          alt={`Preview ${index + 1}`}
                          className="w-full h-24 object-cover rounded border dark:border-gray-600"
                        />
                      ))}
                    </div>
                  </div>
                )}
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  type="submit"
                  disabled={updateLoading}
                  className="w-full py-3 bg-orange-500 dark:bg-orange-600 text-white rounded-full font-semibold shadow-lg disabled:opacity-50 dark:disabled:opacity-50"
                >
                  {updateLoading ? 'Updating...' : 'Update Property'}
                </motion.button>
              </form>
            </div>
          </motion.div>
        </main>
      </div>
    </div>
  );
};

export default EditProperty;