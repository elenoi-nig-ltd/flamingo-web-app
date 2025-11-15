'use client';

import { useState, useEffect, useRef } from 'react';
import { useHomeItems } from '@/hooks/useHomeItems';
import { useHomeItemCategories } from '@/hooks/useHomeItemCategories';
import { useAuth } from '@/hooks/useAuth';
import { motion, AnimatePresence } from 'framer-motion';
import { FaBox, FaPlus, FaEdit, FaTrash, FaSpinner, FaTimes } from 'react-icons/fa';
import { DashboardSkeleton } from '../ui/SkeletonLoader';
import axios from 'axios';
import Link from 'next/link';

interface HomeItemCategory {
  _id: string;
  name: string;
  description?: string;
}

interface HomeItem {
  _id: string;
  name: string;
  description: string;
  price: number;
  category: HomeItemCategory;
  stock: number;
  images: string[];
}

interface HomeItemFormData {
  name: string;
  description: string;
  price: number;
  category: string;
  stock: number;
  images: string[];
}

interface HomeItemApiPayload {
  name: string;
  description: string;
  price: number;
  category: string;
  stock: number;
  images: string[];
}

interface CategoryFormData {
  name: string;
  description: string;
}

interface FormErrors {
  name?: string;
  description?: string;
  price?: string;
  category?: string;
  stock?: string;
  images?: string;
  general?: string;
}

interface CategoryFormErrors {
  name?: string;
  description?: string;
  general?: string;
}

const HomeItemManagement = () => {
  const { user, loading: authLoading } = useAuth();
  const { products: homeItems, loading: homeItemsLoading, error: homeItemsError, createHomeItem, updateHomeItem, deleteHomeItem } = useHomeItems();
  const { categories, loading: categoriesLoading, error: categoriesError, createCategory, deleteCategory } = useHomeItemCategories();
  const [isEditing, setIsEditing] = useState<boolean>(false);
  const [currentHomeItemId, setCurrentHomeItemId] = useState<string | null>(null);
  const [homeItemFormData, setHomeItemFormData] = useState<HomeItemFormData>({
    name: '',
    description: '',
    price: 0,
    category: '',
    stock: 0,
    images: [],
  });
  const [categoryFormData, setCategoryFormData] = useState<CategoryFormData>({
    name: '',
    description: '',
  });
  const [imageUploading, setImageUploading] = useState<boolean>(false);
  const [homeItemFormErrors, setHomeItemFormErrors] = useState<FormErrors>({});
  const [categoryFormErrors, setCategoryFormErrors] = useState<CategoryFormErrors>({});
  const [showDeleteModal, setShowDeleteModal] = useState<boolean>(false);
  const [homeItemToDelete, setHomeItemToDelete] = useState<string | null>(null);
  const [categoryToDelete, setCategoryToDelete] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    console.log('Categories:', categories.map(cat => ({ id: cat._id, name: cat.name })));
    console.log('Selected category ID:', homeItemFormData.category);
  }, [categories, homeItemFormData.category]);

  useEffect(() => {
    if (categories.length > 0 && !homeItemFormData.category && !isEditing) {
      setHomeItemFormData(prev => ({ ...prev, category: categories[0]._id }));
    }
  }, [categories, isEditing]);

  const validateHomeItemForm = () => {
    const errors: FormErrors = {};
    if (!homeItemFormData.name.trim()) errors.name = 'Name is required';
    if (!homeItemFormData.category) {
      errors.category = 'Category is required';
    } else if (!/^[0-9a-fA-F]{24}$/.test(homeItemFormData.category)) {
      errors.category = 'Selected category is invalid';
    }
    if (!homeItemFormData.description.trim()) errors.description = 'Description is required';
    if (homeItemFormData.price <= 0) errors.price = 'Price must be greater than 0';
    if (homeItemFormData.stock < 0) errors.stock = 'Stock cannot be negative';
    setHomeItemFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const validateCategoryForm = () => {
    const errors: CategoryFormErrors = {};
    if (!categoryFormData.name.trim()) errors.name = 'Name is required';
    setCategoryFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleHomeItemInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setHomeItemFormData((prev) => ({ ...prev, [name]: name === 'price' || name === 'stock' ? Number(value) : value }));
    setHomeItemFormErrors((prev) => ({ ...prev, [name]: undefined }));
  };

  const handleCategoryInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setCategoryFormData((prev) => ({ ...prev, [name]: value }));
    setCategoryFormErrors((prev) => ({ ...prev, [name]: undefined }));
  };

  const handleImageUpload = async (files: FileList) => {
    if (!files || files.length === 0) return;
    console.log('Files for image upload:', files);

    setImageUploading(true);
    try {
      const uploadedUrls: string[] = [];
      for (const file of Array.from(files)) {
        const formData = new FormData();
        formData.append('file', file);
        formData.append('upload_preset', process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET || '');

        if (!process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME || !process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET) {
          throw new Error('Cloudinary configuration is missing');
        }

        const response = await axios.post(
          `https://api.cloudinary.com/v1_1/${process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME}/image/upload`,
          formData,
          {
            headers: {
              'Content-Type': 'multipart/form-data',
            },
          }
        );
        console.log('Response for image upload:', response);

        if (response.data.secure_url) {
          uploadedUrls.push(response.data.secure_url);
        } else {
          throw new Error('No secure URL returned from Cloudinary');
        }
      }
      setHomeItemFormData((prev) => ({ ...prev, images: [...prev.images, ...uploadedUrls] }));
      setHomeItemFormErrors((prev) => ({ ...prev, images: undefined }));
    } catch (err) {
      console.error('Image upload failed:', err);
      setHomeItemFormErrors((prev) => ({
        ...prev,
        images: err instanceof Error ? err.message : 'Failed to upload image(s)',
      }));
    } finally {
      setImageUploading(false);
    }
  };

  const handleRemoveImage = (index: number) => {
    setHomeItemFormData((prev) => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index),
    }));
    setHomeItemFormErrors((prev) => ({ ...prev, images: undefined }));
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    const files = e.dataTransfer.files;
    if (files.length > 0) {
      handleImageUpload(files);
    }
  };

  const handleFileInputClick = () => {
    fileInputRef.current?.click();
  };

  const handleHomeItemSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || user.role !== 'admin') {
      setHomeItemFormErrors((prev) => ({ ...prev, general: 'Admin access required. Please log in.' }));
      return;
    }

    if (!validateHomeItemForm()) return;

    const homeItemData: HomeItemApiPayload = {
      name: homeItemFormData.name,
      description: homeItemFormData.description,
      price: homeItemFormData.price,
      category: homeItemFormData.category,
      stock: homeItemFormData.stock,
      images: homeItemFormData.images,
    };
    console.log('Submitting home item:', JSON.stringify(homeItemData, null, 2));

    try {
      if (isEditing && currentHomeItemId) {
        await updateHomeItem(currentHomeItemId, homeItemData);
      } else {
        await createHomeItem(homeItemData);
      }
      setHomeItemFormData({ name: '', description: '', price: 0, category: '', stock: 0, images: [] });
      setIsEditing(false);
      setCurrentHomeItemId(null);
      setHomeItemFormErrors({});
    } catch (err: any) {
      console.error('Submit error:', err);
      setHomeItemFormErrors((prev) => ({
        ...prev,
        general: err.message || 'Failed to save home item',
      }));
    }
  };

  const handleCategorySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || user.role !== 'admin') {
      setCategoryFormErrors((prev) => ({ ...prev, general: 'Admin access required. Please log in.' }));
      return;
    }

    if (!validateCategoryForm()) return;

    try {
      await createCategory({
        name: categoryFormData.name,
        description: categoryFormData.description,
      });
      setCategoryFormData({ name: '', description: '' });
      setCategoryFormErrors({});
    } catch (err: any) {
      setCategoryFormErrors((prev) => ({
        ...prev,
        general: err.message || 'Failed to create category',
      }));
    }
  };

  const handleEditHomeItem = (homeItem: HomeItem) => {
    setIsEditing(true);
    setCurrentHomeItemId(homeItem._id);
    setHomeItemFormData({
      name: homeItem.name,
      description: homeItem.description,
      price: homeItem.price,
      category: homeItem.category._id,
      stock: homeItem.stock,
      images: homeItem.images,
    });
    setHomeItemFormErrors({});
  };

  const handleDeleteHomeItemClick = (id: string) => {
    setHomeItemToDelete(id);
    setShowDeleteModal(true);
  };

  const handleDeleteCategoryClick = (id: string) => {
    setCategoryToDelete(id);
    setShowDeleteModal(true);
  };

  const handleDeleteConfirm = async () => {
    if (homeItemToDelete) {
      try {
        await deleteHomeItem(homeItemToDelete);
      } catch (err: any) {
        setHomeItemFormErrors((prev) => ({ ...prev, general: err.message || 'Failed to delete home item' }));
      }
    } else if (categoryToDelete) {
      try {
        await deleteCategory(categoryToDelete);
      } catch (err: any) {
        setCategoryFormErrors((prev) => ({ ...prev, general: err.message || 'Failed to delete category' }));
      }
    }
    setShowDeleteModal(false);
    setHomeItemToDelete(null);
    setCategoryToDelete(null);
  };

  const handleDeleteCancel = () => {
    setShowDeleteModal(false);
    setHomeItemToDelete(null);
    setCategoryToDelete(null);
  };

  if (authLoading || homeItemsLoading || categoriesLoading) {
    return <DashboardSkeleton />;
  }

  if (homeItemsError || categoriesError) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50/50 dark:bg-gray-900/50">
        <p className="text-red-600 dark:text-red-400 font-semibold">
          {homeItemsError || 'Error fetching home items'}
          {categoriesError ? `; ${categoriesError}` : ''}
        </p>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50/50 dark:bg-gray-900/50">
        <p className="text-red-600 dark:text-red-400 font-semibold">
          Please <Link href="/admin/login" className="text-[#f58c55] dark:text-[#f7a16b] underline">log in</Link> to access admin features.
        </p>
      </div>
    );
  }

  if (user.role !== 'admin') {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50/50 dark:bg-gray-900/50">
        <p className="text-red-600 dark:text-red-400 font-semibold">Admin access required</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 bg-gray-50/50 dark:bg-gray-900/50 min-h-screen">
      <motion.h1
        className="text-4xl font-bold bg-gradient-to-r from-[#f58c55] to-[#f47a45] dark:from-[#f7a16b] dark:to-[#f58c55] bg-clip-text text-transparent mb-8 text-center"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        Home Item Management
      </motion.h1>

      {/* Category Management Section */}
      <motion.div
        className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm p-8 rounded-xl shadow-lg mb-10 w-full border border-gray-200/50 dark:border-gray-700/50"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
      >
        <h2 className="text-2xl font-semibold text-gray-800 dark:text-gray-200 mb-6">Add New Category</h2>
        <form onSubmit={handleCategorySubmit} className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label htmlFor="categoryName" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Category Name
            </label>
            <input
              type="text"
              id="categoryName"
              name="name"
              value={categoryFormData.name}
              onChange={handleCategoryInputChange}
              className={`w-full p-3 bg-white/50 dark:bg-gray-700/50 backdrop-blur-sm border rounded-xl focus:outline-none focus:ring-2 focus:ring-[#f58c55]/50 dark:focus:ring-[#f7a16b]/50 transition-all duration-300 text-gray-900 dark:text-gray-200 placeholder-gray-500 dark:placeholder-gray-400 ${
                categoryFormErrors.name ? 'border-red-500 dark:border-red-400' : 'border-gray-200/50 dark:border-gray-600/50'
              }`}
              required
              aria-invalid={categoryFormErrors.name ? 'true' : 'false'}
              aria-describedby={categoryFormErrors.name ? 'categoryName-error' : undefined}
            />
            {categoryFormErrors.name && (
              <p id="categoryName-error" className="text-red-500 dark:text-red-400 text-sm mt-1">
                {categoryFormErrors.name}
              </p>
            )}
          </div>
          <div className="md:col-span-2">
            <label htmlFor="categoryDescription" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Description
            </label>
            <textarea
              id="categoryDescription"
              name="description"
              value={categoryFormData.description}
              onChange={handleCategoryInputChange}
              className={`w-full p-3 bg-white/50 dark:bg-gray-700/50 backdrop-blur-sm border rounded-xl focus:outline-none focus:ring-2 focus:ring-[#f58c55]/50 dark:focus:ring-[#f7a16b]/50 transition-all duration-300 resize-y h-32 text-gray-900 dark:text-gray-200 placeholder-gray-500 dark:placeholder-gray-400 ${
                categoryFormErrors.description ? 'border-red-500 dark:border-red-400' : 'border-gray-200/50 dark:border-gray-600/50'
              }`}
              aria-invalid={categoryFormErrors.description ? 'true' : 'false'}
              aria-describedby={categoryFormErrors.description ? 'categoryDescription-error' : undefined}
            />
            {categoryFormErrors.description && (
              <p id="categoryDescription-error" className="text-red-500 dark:text-red-400 text-sm mt-1">
                {categoryFormErrors.description}
              </p>
            )}
          </div>
          {categoryFormErrors.general && (
            <p className="md:col-span-2 text-red-500 dark:text-red-400 text-sm mt-4">
              {categoryFormErrors.general}
              {categoryFormErrors.general.includes('Unauthorized') && (
                <span>
                  {' '}
                  <Link href="/admin/login" className="text-[#f58c55] dark:text-[#f7a16b] underline">Log in</Link>
                </span>
              )}
            </p>
          )}
          <motion.button
            type="submit"
            className="md:col-span-2 bg-gradient-to-r from-[#f58c55] to-[#f47a45] dark:from-[#f7a16b] dark:to-[#f58c55] text-white p-3 rounded-xl hover:from-[#f47a45] hover:to-[#f58c55] dark:hover:from-[#f58c55] dark:hover:to-[#f7a16b] transition-all duration-300 flex items-center justify-center space-x-2 disabled:bg-gray-400 disabled:cursor-not-allowed"
            whileHover={{ scale: user && user.role === 'admin' ? 1.05 : 1 }}
            whileTap={{ scale: user && user.role === 'admin' ? 0.95 : 1 }}
            disabled={!user || user.role !== 'admin'}
          >
            <span>Add Category</span>
            <FaPlus />
          </motion.button>
        </form>
      </motion.div>

      {/* Category List Section */}
      <motion.div
        className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm p-8 rounded-xl shadow-lg mb-10 w-full border border-gray-200/50 dark:border-gray-700/50"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.4 }}
      >
        <h2 className="text-2xl font-semibold text-gray-800 dark:text-gray-200 mb-6">Category List</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b bg-gray-50/50 dark:bg-gray-700/50">
                <th className="py-3 px-4 text-left text-gray-800 dark:text-gray-200 font-semibold">Name</th>
                <th className="py-3 px-4 text-left text-gray-800 dark:text-gray-200 font-semibold">Description</th>
                <th className="py-3 px-4 text-left text-gray-800 dark:text-gray-200 font-semibold">Actions</th>
              </tr>
            </thead>
            <tbody>
              {categories && categories.length > 0 ? (
                categories.map((category) => (
                  <tr key={category._id} className="border-b border-gray-200/50 dark:border-gray-700/50 hover:bg-gradient-to-r hover:from-[#f58c55]/5 hover:to-[#f47a45]/5 dark:hover:from-[#f7a16b]/5 dark:hover:to-[#f58c55]/5 transition-all duration-300">
                    <td className="py-3 px-4 font-medium text-gray-800 dark:text-gray-200">{category.name}</td>
                    <td className="py-3 px-4 text-gray-700 dark:text-gray-300">{category.description || 'No description'}</td>
                    <td className="py-3 px-4 flex space-x-3">
                      <motion.button
                        onClick={() => handleDeleteCategoryClick(category._id)}
                        className="text-red-600 dark:text-red-400 hover:text-red-800 dark:hover:text-red-300 disabled:text-gray-400 disabled:cursor-not-allowed"
                        whileHover={{ scale: user && user.role === 'admin' ? 1.1 : 1 }}
                        whileTap={{ scale: user && user.role === 'admin' ? 0.9 : 1 }}
                        disabled={!user || user.role !== 'admin'}
                        aria-label={`Delete ${category.name}`}
                      >
                        <FaTrash size={18} />
                      </motion.button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={3} className="py-4 text-center text-gray-500 dark:text-gray-400">
                    {categoriesLoading ? 'Loading categories...' : 'No categories found'}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </motion.div>

      {/* Home Item Form */}
      <motion.div
        className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm p-8 rounded-xl shadow-lg mb-10 w-full border border-gray-200/50 dark:border-gray-700/50"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.6 }}
      >
        <h2 className="text-2xl font-semibold text-gray-800 dark:text-gray-200 mb-6">
          {isEditing ? 'Edit Home Item' : 'Add New Home Item'}
        </h2>
        <form onSubmit={handleHomeItemSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Home Item Name
            </label>
            <input
              type="text"
              id="name"
              name="name"
              value={homeItemFormData.name}
              onChange={handleHomeItemInputChange}
              className={`w-full p-3 bg-white/50 dark:bg-gray-700/50 backdrop-blur-sm border rounded-xl focus:outline-none focus:ring-2 focus:ring-[#f58c55]/50 dark:focus:ring-[#f7a16b]/50 transition-all duration-300 text-gray-900 dark:text-gray-200 placeholder-gray-500 dark:placeholder-gray-400 ${
                homeItemFormErrors.name ? 'border-red-500 dark:border-red-400' : 'border-gray-200/50 dark:border-gray-600/50'
              }`}
              required
              aria-invalid={homeItemFormErrors.name ? 'true' : 'false'}
              aria-describedby={homeItemFormErrors.name ? 'name-error' : undefined}
            />
            {homeItemFormErrors.name && (
              <p id="name-error" className="text-red-500 dark:text-red-400 text-sm mt-1">
                {homeItemFormErrors.name}
              </p>
            )}
          </div>
          <div>
            <label htmlFor="category" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Category
            </label>
            <select
              id="category"
              name="category"
              value={homeItemFormData.category}
              onChange={handleHomeItemInputChange}
              className={`w-full p-3 bg-white/50 dark:bg-gray-700/50 backdrop-blur-sm border rounded-xl focus:outline-none focus:ring-2 focus:ring-[#f58c55]/50 dark:focus:ring-[#f7a16b]/50 transition-all duration-300 text-gray-900 dark:text-gray-200 ${
                homeItemFormErrors.category ? 'border-red-500 dark:border-red-400' : 'border-gray-200/50 dark:border-gray-600/50'
              }`}
              required
              aria-invalid={homeItemFormErrors.category ? 'true' : 'false'}
              aria-describedby={homeItemFormErrors.category ? 'category-error' : undefined}
            >
              <option value="" className="text-gray-900 dark:text-gray-200">Select a category</option>
              {categories.map((category) => (
                <option key={category._id} value={category._id} className="text-gray-900 dark:text-gray-200">
                  {category.name}
                </option>
              ))}
            </select>
            {homeItemFormErrors.category && (
              <p id="category-error" className="text-red-500 dark:text-red-400 text-sm mt-1">
                {homeItemFormErrors.category}
              </p>
            )}
          </div>
          <div>
            <label htmlFor="price" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Price (₦)
            </label>
            <input
              type="number"
              id="price"
              name="price"
              value={homeItemFormData.price}
              onChange={handleHomeItemInputChange}
              className={`w-full p-3 bg-white/50 dark:bg-gray-700/50 backdrop-blur-sm border rounded-xl focus:outline-none focus:ring-2 focus:ring-[#f58c55]/50 dark:focus:ring-[#f7a16b]/50 transition-all duration-300 text-gray-900 dark:text-gray-200 placeholder-gray-500 dark:placeholder-gray-400 ${
                homeItemFormErrors.price ? 'border-red-500 dark:border-red-400' : 'border-gray-200/50 dark:border-gray-600/50'
              }`}
              required
              min="0"
              step="0.01"
              aria-invalid={homeItemFormErrors.price ? 'true' : 'false'}
              aria-describedby={homeItemFormErrors.price ? 'price-error' : undefined}
            />
            {homeItemFormErrors.price && (
              <p id="price-error" className="text-red-500 dark:text-red-400 text-sm mt-1">
                {homeItemFormErrors.price}
              </p>
            )}
          </div>
          <div>
            <label htmlFor="stock" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Stock
            </label>
            <input
              type="number"
              id="stock"
              name="stock"
              value={homeItemFormData.stock}
              onChange={handleHomeItemInputChange}
              className={`w-full p-3 bg-white/50 dark:bg-gray-700/50 backdrop-blur-sm border rounded-xl focus:outline-none focus:ring-2 focus:ring-[#f58c55]/50 dark:focus:ring-[#f7a16b]/50 transition-all duration-300 text-gray-900 dark:text-gray-200 placeholder-gray-500 dark:placeholder-gray-400 ${
                homeItemFormErrors.stock ? 'border-red-500 dark:border-red-400' : 'border-gray-200/50 dark:border-gray-600/50'
              }`}
              required
              min="0"
              aria-invalid={homeItemFormErrors.stock ? 'true' : 'false'}
              aria-describedby={homeItemFormErrors.stock ? 'stock-error' : undefined}
            />
            {homeItemFormErrors.stock && (
              <p id="stock-error" className="text-red-500 dark:text-red-400 text-sm mt-1">
                {homeItemFormErrors.stock}
              </p>
            )}
          </div>
          <div className="md:col-span-2">
            <label htmlFor="description" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Description
            </label>
            <textarea
              id="description"
              name="description"
              value={homeItemFormData.description}
              onChange={handleHomeItemInputChange}
              className={`w-full p-3 bg-white/50 dark:bg-gray-700/50 backdrop-blur-sm border rounded-xl focus:outline-none focus:ring-2 focus:ring-[#f58c55]/50 dark:focus:ring-[#f7a16b]/50 transition-all duration-300 resize-y h-32 text-gray-900 dark:text-gray-200 placeholder-gray-500 dark:placeholder-gray-400 ${
                homeItemFormErrors.description ? 'border-red-500 dark:border-red-400' : 'border-gray-200/50 dark:border-gray-600/50'
              }`}
              required
              aria-invalid={homeItemFormErrors.description ? 'true' : 'false'}
              aria-describedby={homeItemFormErrors.description ? 'description-error' : undefined}
            />
            {homeItemFormErrors.description && (
              <p id="description-error" className="text-red-500 dark:text-red-400 text-sm mt-1">
                {homeItemFormErrors.description}
              </p>
            )}
          </div>
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Upload Images
            </label>
            <div
              className={`w-full p-6 bg-white/50 dark:bg-gray-700/50 backdrop-blur-sm border rounded-xl text-center transition-all duration-300 ${
                isDragging
                  ? 'border-[#f58c55] dark:border-[#f7a16b] border-2'
                  : homeItemFormErrors.images
                  ? 'border-red-500 dark:border-red-400'
                  : 'border-gray-200/50 dark:border-gray-600/50'
              }`}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              onClick={handleFileInputClick}
            >
              <input
                type="file"
                id="images"
                accept="image/*"
                multiple
                onChange={(e) => handleImageUpload(e.target.files!)}
                className="hidden"
                disabled={imageUploading}
                ref={fileInputRef}
              />
              <p className="text-gray-600 dark:text-gray-300">
                {imageUploading
                  ? 'Uploading...'
                  : isDragging
                  ? 'Drop images here'
                  : 'Drag and drop images here or click to upload'}
              </p>
              {imageUploading && <FaSpinner className="animate-spin text-[#f58c55] dark:text-[#f7a16b] mt-2" />}
            </div>
            {homeItemFormErrors.images && (
              <p className="text-red-500 dark:text-red-400 text-sm mt-1">{homeItemFormErrors.images}</p>
            )}
            {homeItemFormData.images.length > 0 && (
              <div className="mt-4 flex flex-wrap gap-4">
                {homeItemFormData.images.map((image, index) => (
                  <div key={index} className="relative">
                    <img
                      src={image}
                      alt={`Home item preview ${index + 1}`}
                      className="h-24 w-24 object-cover rounded-lg shadow-sm"
                    />
                    <button
                      type="button"
                      onClick={() => handleRemoveImage(index)}
                      className="absolute -top-2 -right-2 bg-red-500 dark:bg-red-600 text-white rounded-full p-1 hover:bg-red-600 dark:hover:bg-red-700 transition-all duration-300"
                      aria-label={`Remove image ${index + 1}`}
                    >
                      <FaTimes size={12} />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
          {homeItemFormErrors.general && (
            <p className="md:col-span-2 text-red-500 dark:text-red-400 text-sm mt-4">
              {homeItemFormErrors.general}
              {homeItemFormErrors.general.includes('Unauthorized') && (
                <span>
                  {' '}
                  <Link href="/admin/login" className="text-[#f58c55] dark:text-[#f7a16b] underline">Log in</Link>
                </span>
              )}
            </p>
          )}
          <motion.button
            type="submit"
            className="md:col-span-2 bg-gradient-to-r from-[#f58c55] to-[#f47a45] dark:from-[#f7a16b] dark:to-[#f58c55] text-white p-3 rounded-xl hover:from-[#f47a45] hover:to-[#f58c55] dark:hover:from-[#f58c55] dark:hover:to-[#f7a16b] transition-all duration-300 flex items-center justify-center space-x-2 disabled:bg-gray-400 disabled:cursor-not-allowed"
            whileHover={{ scale: user && user.role === 'admin' && homeItemFormData.category ? 1.05 : 1 }}
            whileTap={{ scale: user && user.role === 'admin' && homeItemFormData.category ? 0.95 : 1 }}
            disabled={imageUploading || !user || user.role !== 'admin' || !homeItemFormData.category || !/^[0-9a-fA-F]{24}$/.test(homeItemFormData.category)}
            aria-label={isEditing ? 'Update Home Item' : 'Add Home Item'}
          >
            <span>{isEditing ? 'Update Home Item' : 'Add Home Item'}</span>
            {!isEditing && <FaPlus />}
          </motion.button>
        </form>
      </motion.div>

      {/* Home Item List */}
      <motion.div
        className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm p-8 rounded-xl shadow-lg w-full border border-gray-200/50 dark:border-gray-700/50"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.8 }}
      >
        <h2 className="text-2xl font-semibold text-gray-800 dark:text-gray-200 mb-6">Home Item List</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b bg-gray-50/50 dark:bg-gray-700/50">
                <th className="py-3 px-4 text-left text-gray-800 dark:text-gray-200 font-semibold">Image</th>
                <th className="py-3 px-4 text-left text-gray-800 dark:text-gray-200 font-semibold">Name</th>
                <th className="py-3 px-4 text-left text-gray-800 dark:text-gray-200 font-semibold">Category</th>
                <th className="py-3 px-4 text-left text-gray-800 dark:text-gray-200 font-semibold">Price</th>
                <th className="py-3 px-4 text-left text-gray-800 dark:text-gray-200 font-semibold">Stock</th>
                <th className="py-3 px-4 text-left text-gray-800 dark:text-gray-200 font-semibold">Actions</th>
              </tr>
            </thead>
            <tbody>
              {homeItems && homeItems.length > 0 ? (
                homeItems.map((homeItem) => (
                  <tr key={homeItem._id} className="border-b border-gray-200/50 dark:border-gray-700/50 hover:bg-gradient-to-r hover:from-[#f58c55]/5 hover:to-[#f47a45]/5 dark:hover:from-[#f7a16b]/5 dark:hover:to-[#f58c55]/5 transition-all duration-300">
                    <td className="py-3 px-4">
                      {homeItem.images && homeItem.images[0] ? (
                        <img
                          src={homeItem.images[0]}
                          alt={homeItem.name}
                          className="h-12 w-12 object-cover rounded-md"
                        />
                      ) : (
                        <FaBox className="text-gray-400 dark:text-gray-300" />
                      )}
                    </td>
                    <td className="py-3 px-4 font-medium text-gray-800 dark:text-gray-200">{homeItem.name}</td>
                    <td className="py-3 px-4 text-gray-700 dark:text-gray-300">{homeItem.category?.name || 'Uncategorized'}</td>
                    <td className="py-3 px-4 text-gray-700 dark:text-gray-300">₦{homeItem.price.toFixed(2)}</td>
                    <td className="py-3 px-4 text-gray-700 dark:text-gray-300">{homeItem.stock}</td>
                    <td className="py-3 px-4 flex space-x-3">
                      <motion.button
                        onClick={() => handleEditHomeItem(homeItem)}
                        className="text-[#f58c55] dark:text-[#f7a16b] hover:text-[#f47a45] dark:hover:text-[#f58c55] disabled:text-gray-400 disabled:cursor-not-allowed"
                        whileHover={{ scale: user && user.role === 'admin' ? 1.1 : 1 }}
                        whileTap={{ scale: user && user.role === 'admin' ? 0.9 : 1 }}
                        disabled={!user || user.role !== 'admin'}
                        aria-label={`Edit ${homeItem.name}`}
                      >
                        <FaEdit size={18} />
                      </motion.button>
                      <motion.button
                        onClick={() => handleDeleteHomeItemClick(homeItem._id)}
                        className="text-red-600 dark:text-red-400 hover:text-red-800 dark:hover:text-red-300 disabled:text-gray-400 disabled:cursor-not-allowed"
                        whileHover={{ scale: user && user.role === 'admin' ? 1.1 : 1 }}
                        whileTap={{ scale: user && user.role === 'admin' ? 0.9 : 1 }}
                        disabled={!user || user.role !== 'admin'}
                        aria-label={`Delete ${homeItem.name}`}
                      >
                        <FaTrash size={18} />
                      </motion.button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} className="py-4 text-center text-gray-500 dark:text-gray-400">
                    {homeItemsLoading ? 'Loading home items...' : 'No home items found'}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
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
                Are you sure you want to delete this {homeItemToDelete ? 'home item' : 'category'}? This action cannot be undone.
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
  );
};

export default HomeItemManagement;