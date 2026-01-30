
'use client';

import React, { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { useRealEstates } from '@/hooks/useRealEstates';
import { uploadMultipleImagesToCloudinary, CloudinaryUploadResponse } from '@/utils/cloudinary';
import { motion, AnimatePresence } from 'framer-motion';
import { FaSpinner, FaTimes, FaArrowLeft, FaArrowRight } from 'react-icons/fa';

interface RealEstate {
  id: string;
  title: string;
  description: string;
  price: number;
  address: string;
  propertyType: string;
  bedrooms: number;
  bathrooms: number;
  area: number;
  images: string[];
  totalRooms?: number;
  roomsBooked?: number;
  roomsAvailable?: number;
}

const EstateManagement = () => {
  const { user, loading: authLoading } = useAuth();
  const {
    realEstates,
    loading,
    error,
    createRealEstate,
    createLoading,
    createError,
    updateRealEstate,
    updateLoading,
    updateError,
    deleteRealEstate,
    deleteLoading,
    deleteError,
  } = useRealEstates();
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [editingEstate, setEditingEstate] = useState<RealEstate | null>(null);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    price: '',
    address: '',
    propertyType: '',
    bedrooms: '',
    bathrooms: '',
    area: '',
    totalRooms: '',
    images: [] as File[],
  });
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);
  const [cloudinaryPublicIds, setCloudinaryPublicIds] = useState<string[]>([]);
  const [uploadLoading, setUploadLoading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [showDeleteModal, setShowDeleteModal] = useState<string | null>(null);
  const [carouselIndex, setCarouselIndex] = useState<{ [key: string]: number }>({});

  // Redirect non-admin users
  if (authLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50/50 dark:bg-gray-900/50">
        <p className="text-gray-600 dark:text-gray-300">Loading...</p>
      </div>
    );
  }

  if (!user || user.role !== 'admin') {
    router.push('/admin/login');
    return null;
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setUploadError(null);
  };

  const handleImageChange = (files: File[]) => {
    const validFiles = files.filter((file) => file.type.startsWith('image/'));
    if (validFiles.length !== files.length) {
      setUploadError('Only image files are allowed');
    }
    setFormData((prev) => ({ ...prev, images: [...prev.images, ...validFiles] }));
    const previews = validFiles.map((file) => URL.createObjectURL(file));
    setImagePreviews((prev) => [...prev, ...previews]);
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files ? Array.from(e.target.files) : [];
    handleImageChange(files);
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    const files = Array.from(e.dataTransfer.files);
    handleImageChange(files);
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragEnter = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleClick = () => {
    fileInputRef.current?.click();
  };

  const removeImage = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index),
    }));
    setImagePreviews((prev) => prev.filter((_, i) => i !== index));
    setCloudinaryPublicIds((prev) => prev.filter((_, i) => i !== index));
  };

  const handleEdit = (estate: RealEstate) => {
    setEditingEstate(estate);
    setFormData({
      title: estate.title,
      description: estate.description,
      price: estate.price.toString(),
      address: estate.address,
      propertyType: estate.propertyType,
      bedrooms: estate.bedrooms.toString(),
      bathrooms: estate.bathrooms.toString(),
      area: estate.area.toString(),
      totalRooms: estate.totalRooms?.toString() || '',
      images: [],
    });
    setImagePreviews(estate.images);
    setCloudinaryPublicIds([]); // Reset for new uploads
    setSuccessMessage(null);
    setUploadError(null);
  };

  const handleCancelEdit = () => {
    setEditingEstate(null);
    setFormData({
      title: '',
      description: '',
      price: '',
      address: '',
      propertyType: '',
      bedrooms: '',
      bathrooms: '',
      area: '',
      totalRooms: '',
      images: [],
    });
    setImagePreviews([]);
    setCloudinaryPublicIds([]);
    setSuccessMessage(null);
    setUploadError(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSuccessMessage(null);
    setUploadError(null);

    if (!formData.title || !formData.description || !formData.price || !formData.address || !formData.propertyType || !formData.area) {
      setUploadError('Please fill in all required fields');
      return;
    }

    const price = parseFloat(formData.price);
    const bedrooms = parseInt(formData.bedrooms) || 0;
    const bathrooms = parseInt(formData.bathrooms) || 0;
    const area = parseInt(formData.area) || 0;
    const totalRooms = formData.propertyType === 'lodge' ? parseInt(formData.totalRooms) || 0 : undefined;

    if (isNaN(price) || price <= 0) {
      setUploadError('Price must be a valid number greater than 0');
      return;
    }
    if (isNaN(area) || area <= 0) {
      setUploadError('Area must be a valid number greater than 0');
      return;
    }
    if (formData.propertyType === 'lodge' && (!totalRooms || totalRooms < 1)) {
      setUploadError('Total rooms must be at least 1 for lodges');
      return;
    }

    setUploadLoading(true);

    let imageUrls: string[] = editingEstate ? [...editingEstate.images] : [];
    let publicIds: string[] = [...cloudinaryPublicIds];

    if (formData.images.length > 0) {
      try {
        const uploadOptions = {
          uploadPreset: process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET,
          folder: 'real-estates',
        };
        const uploadResponses: CloudinaryUploadResponse[] = await uploadMultipleImagesToCloudinary(formData.images, uploadOptions);
        imageUrls = [...imageUrls, ...uploadResponses.map((response) => response.secure_url)];
        publicIds = [...publicIds, ...uploadResponses.map((response) => response.public_id)];
        setCloudinaryPublicIds(publicIds);
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Failed to upload images';
        setUploadError(errorMessage);
        setUploadLoading(false);
        return;
      }
    }

    const payload = {
      title: formData.title,
      description: formData.description,
      price,
      address: formData.address,
      propertyType: formData.propertyType,
      bedrooms,
      bathrooms,
      area,
      totalRooms: formData.propertyType === 'lodge' ? totalRooms : undefined,
      images: imageUrls,
    };

    let success;
    try {
      if (editingEstate) {
        success = await updateRealEstate(editingEstate.id, payload);
      } else {
        success = await createRealEstate(payload);
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to save real estate listing';
      setUploadError(errorMessage);
      setUploadLoading(false);
      return;
    }

    setUploadLoading(false);

    if (success) {
      setSuccessMessage(editingEstate ? 'Real estate listing updated successfully!' : 'Real estate listing created successfully!');
      setEditingEstate(null);
      setFormData({
        title: '',
        description: '',
        price: '',
        address: '',
        propertyType: '',
        bedrooms: '',
        bathrooms: '',
        area: '',
        totalRooms: '',
        images: [],
      });
      setImagePreviews([]);
      setCloudinaryPublicIds([]);
    }
  };

  const handleDeleteClick = (id: string) => {
    setShowDeleteModal(id);
  };

  const handleDeleteConfirm = async () => {
    if (showDeleteModal) {
      const success = await deleteRealEstate(showDeleteModal);
      if (success) {
        setSuccessMessage('Real estate listing deleted successfully!');
      }
      setShowDeleteModal(null);
    }
  };

  const handleDeleteCancel = () => {
    setShowDeleteModal(null);
  };

  const handleCarouselPrev = (estateId: string) => {
    setCarouselIndex((prev) => ({
      ...prev,
      [estateId]: Math.max((prev[estateId] || 0) - 1, 0),
    }));
  };

  const handleCarouselNext = (estateId: string, imageCount: number) => {
    setCarouselIndex((prev) => ({
      ...prev,
      [estateId]: Math.min((prev[estateId] || 0) + 1, imageCount - 1),
    }));
  };

  return (
    <div className="min-h-screen bg-gray-50/50 dark:bg-gray-900/50 font-sans">
      <div className="container mx-auto px-6 py-10">
        <motion.div
          className="flex justify-between items-center mb-6"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <h1 className="text-2xl font-semibold bg-gradient-to-r from-[#f58c55] to-[#f47a45] dark:from-[#f7a16b] dark:to-[#f58c55] bg-clip-text text-transparent">
            Estate Management
          </h1>
          <motion.button
            onClick={() => router.push('/admin/dashboard/verifications')}
            className="py-2 px-4 bg-gradient-to-r from-[#f58c55] to-[#f47a45] dark:from-[#f7a16b] dark:to-[#f58c55] text-white rounded-xl hover:from-[#f47a45] hover:to-[#f58c55] dark:hover:from-[#f58c55] dark:hover:to-[#f7a16b] transition-all duration-300"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            Manage Landlord Verifications
          </motion.button>
        </motion.div>

        {/* Create/Edit Form */}
        <motion.div
          className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm p-6 rounded-xl shadow-lg mb-8 border border-gray-200/50 dark:border-gray-700/50"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-200 mb-4">
            {editingEstate ? 'Edit Real Estate Listing' : 'Create New Real Estate Listing'}
          </h2>
          {createError && <div className="text-red-500 dark:text-red-400 mb-4">{createError}</div>}
          {updateError && <div className="text-red-500 dark:text-red-400 mb-4">{updateError}</div>}
          {uploadError && <div className="text-red-500 dark:text-red-400 mb-4">{uploadError}</div>}
          {successMessage && <div className="text-green-500 dark:text-green-400 mb-4">{successMessage}</div>}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Title</label>
              <input
                type="text"
                name="title"
                value={formData.title}
                onChange={handleInputChange}
                className="w-full p-3 bg-white/50 dark:bg-gray-700/50 backdrop-blur-sm border rounded-xl focus:outline-none focus:ring-2 focus:ring-[#f58c55]/50 dark:focus:ring-[#f7a16b]/50 transition-all duration-300 text-gray-900 dark:text-gray-200 placeholder-gray-500 dark:placeholder-gray-400 border-gray-200/50 dark:border-gray-600/50"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Description</label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                className="w-full p-3 bg-white/50 dark:bg-gray-700/50 backdrop-blur-sm border rounded-xl focus:outline-none focus:ring-2 focus:ring-[#f58c55]/50 dark:focus:ring-[#f7a16b]/50 transition-all duration-300 resize-y h-32 text-gray-900 dark:text-gray-200 placeholder-gray-500 dark:placeholder-gray-400 border-gray-200/50 dark:border-gray-600/50"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Price (₦)</label>
              <input
                type="number"
                name="price"
                value={formData.price}
                onChange={handleInputChange}
                className="w-full p-3 bg-white/50 dark:bg-gray-700/50 backdrop-blur-sm border rounded-xl focus:outline-none focus:ring-2 focus:ring-[#f58c55]/50 dark:focus:ring-[#f7a16b]/50 transition-all duration-300 text-gray-900 dark:text-gray-200 placeholder-gray-500 dark:placeholder-gray-400 border-gray-200/50 dark:border-gray-600/50"
                required
                min="0"
                step="0.01"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Address</label>
              <input
                type="text"
                name="address"
                value={formData.address}
                onChange={handleInputChange}
                className="w-full p-3 bg-white/50 dark:bg-gray-700/50 backdrop-blur-sm border rounded-xl focus:outline-none focus:ring-2 focus:ring-[#f58c55]/50 dark:focus:ring-[#f7a16b]/50 transition-all duration-300 text-gray-900 dark:text-gray-200 placeholder-gray-500 dark:placeholder-gray-400 border-gray-200/50 dark:border-gray-600/50"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Property Type</label>
              <select
                name="propertyType"
                value={formData.propertyType}
                onChange={handleInputChange}
                className="w-full p-3 bg-white/50 dark:bg-gray-700/50 backdrop-blur-sm border rounded-xl focus:outline-none focus:ring-2 focus:ring-[#f58c55]/50 dark:focus:ring-[#f7a16b]/50 transition-all duration-300 text-gray-900 dark:text-gray-200 border-gray-200/50 dark:border-gray-600/50"
                required
              >
                <option value="" className="text-gray-900 dark:text-gray-200">Select Type</option>
                <option value="apartment" className="text-gray-900 dark:text-gray-200">Apartment</option>
                <option value="lodge" className="text-gray-900 dark:text-gray-200">Lodge</option>
                <option value="house" className="text-gray-900 dark:text-gray-200">House</option>
                <option value="condo" className="text-gray-900 dark:text-gray-200">Condo</option>
                <option value="townhouse" className="text-gray-900 dark:text-gray-200">Townhouse</option>
                <option value="land" className="text-gray-900 dark:text-gray-200">Land</option>
              </select>
            </div>
            {formData.propertyType === 'lodge' && (
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Total Rooms Available</label>
                <input
                  type="number"
                  name="totalRooms"
                  value={formData.totalRooms}
                  onChange={handleInputChange}
                  className="w-full p-3 bg-white/50 dark:bg-gray-700/50 backdrop-blur-sm border rounded-xl focus:outline-none focus:ring-2 focus:ring-[#f58c55]/50 dark:focus:ring-[#f7a16b]/50 transition-all duration-300 text-gray-900 dark:text-gray-200 placeholder-gray-500 dark:placeholder-gray-400 border-gray-200/50 dark:border-gray-600/50"
                  min="1"
                  required
                />
              </div>
            )}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Bedrooms</label>
              <input
                type="number"
                name="bedrooms"
                value={formData.bedrooms}
                onChange={handleInputChange}
                className="w-full p-3 bg-white/50 dark:bg-gray-700/50 backdrop-blur-sm border rounded-xl focus:outline-none focus:ring-2 focus:ring-[#f58c55]/50 dark:focus:ring-[#f7a16b]/50 transition-all duration-300 text-gray-900 dark:text-gray-200 placeholder-gray-500 dark:placeholder-gray-400 border-gray-200/50 dark:border-gray-600/50"
                min="0"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Bathrooms</label>
              <input
                type="number"
                name="bathrooms"
                value={formData.bathrooms}
                onChange={handleInputChange}
                className="w-full p-3 bg-white/50 dark:bg-gray-700/50 backdrop-blur-sm border rounded-xl focus:outline-none focus:ring-2 focus:ring-[#f58c55]/50 dark:focus:ring-[#f7a16b]/50 transition-all duration-300 text-gray-900 dark:text-gray-200 placeholder-gray-500 dark:placeholder-gray-400 border-gray-200/50 dark:border-gray-600/50"
                min="0"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Area (sq ft)</label>
              <input
                type="number"
                name="area"
                value={formData.area}
                onChange={handleInputChange}
                className="w-full p-3 bg-white/50 dark:bg-gray-700/50 backdrop-blur-sm border rounded-xl focus:outline-none focus:ring-2 focus:ring-[#f58c55]/50 dark:focus:ring-[#f7a16b]/50 transition-all duration-300 text-gray-900 dark:text-gray-200 placeholder-gray-500 dark:placeholder-gray-400 border-gray-200/50 dark:border-gray-600/50"
                min="0"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Images</label>
              <div
                className={`w-full p-6 bg-white/50 dark:bg-gray-700/50 backdrop-blur-sm border rounded-xl text-center transition-all duration-300 ${
                  isDragging
                    ? 'border-[#f58c55] dark:border-[#f7a16b] border-2'
                    : uploadError
                    ? 'border-red-500 dark:border-red-400'
                    : 'border-gray-200/50 dark:border-gray-600/50'
                }`}
                onDragOver={handleDragOver}
                onDragEnter={handleDragEnter}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                onClick={handleClick}
              >
                <input
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={handleFileInputChange}
                  className="hidden"
                  ref={fileInputRef}
                  disabled={uploadLoading}
                />
                <p className="text-gray-600 dark:text-gray-300">
                  {uploadLoading
                    ? 'Uploading...'
                    : isDragging
                    ? 'Drop images here'
                    : editingEstate
                    ? 'Drag and drop new images to add, or click to select'
                    : 'Drag and drop images here, or click to select'}
                </p>
                {uploadLoading && <FaSpinner className="animate-spin text-[#f58c55] dark:text-[#f7a16b] mt-2" />}
              </div>
              {imagePreviews.length > 0 && (
                <div className="mt-4">
                  <p className="text-gray-700 dark:text-gray-300 mb-2">Image Previews:</p>
                  <div className="grid grid-cols-2 gap-4">
                    {imagePreviews.map((preview, index) => (
                      <div key={index} className="relative">
                        <img
                          src={preview}
                          alt={`Preview ${index + 1}`}
                          className="w-full h-32 object-cover rounded-lg shadow-sm"
                        />
                        <button
                          type="button"
                          onClick={() => removeImage(index)}
                          className="absolute -top-2 -right-2 bg-red-500 dark:bg-red-600 text-white rounded-full p-1 hover:bg-red-600 dark:hover:bg-red-700 transition-all duration-300"
                          aria-label={`Remove image ${index + 1}`}
                        >
                          <FaTimes size={12} />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
            <div className="flex space-x-4">
              <motion.button
                type="submit"
                disabled={createLoading || updateLoading || uploadLoading}
                className={`w-full py-3 bg-gradient-to-r from-[#f58c55] to-[#f47a45] dark:from-[#f7a16b] dark:to-[#f58c55] text-white rounded-xl hover:from-[#f47a45] hover:to-[#f58c55] dark:hover:from-[#f58c55] dark:hover:to-[#f7a16b] transition-all duration-300 disabled:bg-gray-400 disabled:cursor-not-allowed`}
                whileHover={{ scale: createLoading || updateLoading || uploadLoading ? 1 : 1.05 }}
                whileTap={{ scale: createLoading || updateLoading || uploadLoading ? 1 : 0.95 }}
              >
                {createLoading || updateLoading || uploadLoading
                  ? 'Processing...'
                  : editingEstate
                  ? 'Update Listing'
                  : 'Create Listing'}
              </motion.button>
              {editingEstate && (
                <motion.button
                  type="button"
                  onClick={handleCancelEdit}
                  className="w-full py-3 bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 rounded-xl hover:bg-gray-300 dark:hover:bg-gray-600 transition-all duration-300"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  Cancel
                </motion.button>
              )}
            </div>
          </form>
        </motion.div>

        {/* Estate List with Carousel */}
        <motion.div
          className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm p-6 rounded-xl shadow-lg border border-gray-200/50 dark:border-gray-700/50"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
        >
          <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-200 mb-4">All Real Estate Listings</h2>
          {loading && <div className="text-center py-4 text-gray-600 dark:text-gray-300">Loading listings...</div>}
          {error && <div className="text-red-500 dark:text-red-400 mb-4">{error}</div>}
          {deleteError && <div className="text-red-500 dark:text-red-400 mb-4">{deleteError}</div>}
          {!loading && realEstates.length === 0 && (
            <div className="text-center py-4 text-gray-500 dark:text-gray-400">No listings found.</div>
          )}
          {!loading && realEstates.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {realEstates.map((estate) => (
                <div
                  key={estate.id}
                  className="border border-gray-200/50 dark:border-gray-700/50 rounded-xl p-4 hover:bg-gradient-to-r hover:from-[#f58c55]/5 hover:to-[#f47a45]/5 dark:hover:from-[#f7a16b]/5 dark:hover:to-[#f58c55]/5 transition-all duration-300"
                >
                  <div className="relative">
                    {estate.images.length > 0 ? (
                      <div className="relative w-full h-48">
                        <img
                          src={estate.images[carouselIndex[estate.id] || 0]}
                          alt={`${estate.title} - Image ${carouselIndex[estate.id] || 0 + 1}`}
                          className="w-full h-full object-cover rounded-lg"
                        />
                        {estate.images.length > 1 && (
                          <>
                            <button
                              onClick={() => handleCarouselPrev(estate.id)}
                              className="absolute left-2 top-1/2 transform -translate-y-1/2 bg-gray-800/50 dark:bg-gray-900/50 text-white p-2 rounded-full hover:bg-gray-800/70 dark:hover:bg-gray-900/70 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                              disabled={(carouselIndex[estate.id] || 0) === 0}
                            >
                              <FaArrowLeft size={16} />
                            </button>
                            <button
                              onClick={() => handleCarouselNext(estate.id, estate.images.length)}
                              className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-gray-800/50 dark:bg-gray-900/50 text-white p-2 rounded-full hover:bg-gray-800/70 dark:hover:bg-gray-900/70 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                              disabled={(carouselIndex[estate.id] || 0) === estate.images.length - 1}
                            >
                              <FaArrowRight size={16} />
                            </button>
                          </>
                        )}
                      </div>
                    ) : (
                      <div className="w-full h-48 bg-gray-200/50 dark:bg-gray-700/50 flex items-center justify-center rounded-lg">
                        <span className="text-gray-500 dark:text-gray-400">No images</span>
                      </div>
                    )}
                  </div>
                  <h3 className="text-lg font-semibold mt-2 text-gray-800 dark:text-gray-200">{estate.title}</h3>
                  <p className="text-gray-600 dark:text-gray-300">{estate.description}</p>
                  <p className="text-gray-600 dark:text-gray-300">Price: ₦{estate.price.toLocaleString()}</p>
                  <p className="text-gray-600 dark:text-gray-300">Address: {estate.address}</p>
                  <p className="text-gray-600 dark:text-gray-300">Type: {estate.propertyType}</p>
                  <p className="text-gray-600 dark:text-gray-300">
                    Bedrooms: {estate.bedrooms} • Bathrooms: {estate.bathrooms} • Area: {estate.area} sq ft
                  </p>
                  {estate.propertyType === 'lodge' && (
                    <p className="text-gray-600 dark:text-gray-300">
                      Rooms: {estate.roomsBooked ?? 0} booked • {estate.roomsAvailable ?? 0} available • {estate.totalRooms ?? 0} total
                    </p>
                  )}
                  <div className="flex space-x-2 mt-4">
                    <motion.button
                      onClick={() => handleEdit(estate)}
                      className="flex-1 py-2 text-[#f58c55] dark:text-[#f7a16b] hover:text-[#f47a45] dark:hover:text-[#f58c55] rounded-xl transition-all duration-300 disabled:text-gray-400 disabled:cursor-not-allowed"
                      whileHover={{ scale: deleteLoading ? 1 : 1.05 }}
                      whileTap={{ scale: deleteLoading ? 1 : 0.95 }}
                      disabled={deleteLoading}
                    >
                      Edit
                    </motion.button>
                    <motion.button
                      onClick={() => handleDeleteClick(estate.id)}
                      className="flex-1 py-2 text-red-600 dark:text-red-400 hover:text-red-800 dark:hover:text-red-300 rounded-xl transition-all duration-300 disabled:text-gray-400 disabled:cursor-not-allowed"
                      whileHover={{ scale: deleteLoading ? 1 : 1.05 }}
                      whileTap={{ scale: deleteLoading ? 1 : 0.95 }}
                      disabled={deleteLoading}
                    >
                      {deleteLoading ? 'Deleting...' : 'Delete'}
                    </motion.button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </motion.div>

        {/* Delete Confirmation Modal */}
        <AnimatePresence>
          {showDeleteModal && (
            <motion.div
              className="fixed inset-0 bg-black/50 dark:bg-black/60 backdrop-blur-sm flex items-center justify-center z-50"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
            >
              <motion.div
                className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm rounded-xl p-6 w-full max-w-md shadow-2xl border border-gray-200/50 dark:border-gray-700/50"
                initial={{ scale: 0.7, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.7, opacity: 0 }}
                transition={{ duration: 0.3 }}
              >
                <h3 className="text-2xl font-semibold text-gray-800 dark:text-gray-200 mb-4">
                  Confirm Deletion
                </h3>
                <p className="text-gray-700 dark:text-gray-300 mb-6">
                  Are you sure you want to delete this real estate listing? This action cannot be undone.
                </p>
                <div className="flex justify-end space-x-4">
                  <motion.button
                    onClick={handleDeleteCancel}
                    className="px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 rounded-xl hover:bg-gray-300 dark:hover:bg-gray-600 transition-all duration-300"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    Cancel
                  </motion.button>
                  <motion.button
                    onClick={handleDeleteConfirm}
                    className="px-4 py-2 bg-red-600 dark:bg-red-700 text-white rounded-xl hover:bg-red-700 dark:hover:bg-red-600 transition-all duration-300"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    Delete
                  </motion.button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default EstateManagement;
