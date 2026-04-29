
'use client';

import { useState, useRef } from 'react';
import { useProducts } from '@/hooks/useProducts';
import { useCategories } from '@/hooks/useCategories';
import { useAuth } from '@/hooks/useAuth';
import { motion, AnimatePresence } from 'framer-motion';
import { FaBox, FaPlus, FaEdit, FaTrash, FaSpinner, FaTimes } from 'react-icons/fa';
import { DashboardSkeleton } from '@/components/ui/SkeletonLoader';
import { uploadImageToCloudinary, CloudinaryError } from '@/utils/cloudinary';

interface Category {
  _id: string;
  name: string;
}

interface Product {
  _id: string;
  name: string;
  description: string;
  price: number;
  category: string | Category | null;
  stock: number;
  images: string[];
  isAvailable?: boolean;
}

interface ProductFormData {
  name: string;
  description: string;
  price: number;
  category: string;
  stock: number;
  images: string[];
  isAvailable: boolean;
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

const ProductManagement = () => {
  const { user, loading: authLoading } = useAuth();
  const { products, loading: productsLoading, error: productsError, createProduct, updateProduct, deleteProduct } = useProducts();
  const { categories, loading: categoriesLoading, error: categoriesError } = useCategories();
  const [isEditing, setIsEditing] = useState<boolean>(false);
  const [currentProductId, setCurrentProductId] = useState<string | null>(null);
  const [formData, setFormData] = useState<ProductFormData>({
    name: '',
    description: '',
    price: 0,
    category: '',
    stock: 0,
    images: [],
    isAvailable: true,
  });
  const [imageUploading, setImageUploading] = useState<boolean>(false);
  const [formErrors, setFormErrors] = useState<FormErrors>({});
  const [showDeleteModal, setShowDeleteModal] = useState<boolean>(false);
  const [productToDelete, setProductToDelete] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const getCategoryName = (category: string | Category | null): string => {
    if (!category) return 'No Category';
    if (typeof category === 'string') {
      const foundCategory = categories.find((cat) => cat._id === category);
      return foundCategory ? foundCategory.name : 'No Category';
    }
    return category.name || 'No Category';
  };

  const validateForm = () => {
    const errors: FormErrors = {};
    if (!formData.name.trim()) errors.name = 'Name is required';
    if (!formData.category) errors.category = 'Category is required';
    if (!formData.description.trim()) errors.description = 'Description is required';
    if (formData.price <= 0) errors.price = 'Price must be greater than 0';
    if (formData.stock < 0) errors.stock = 'Stock cannot be negative';
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    const val = type === 'checkbox' ? (e.target as HTMLInputElement).checked : value;
    setFormData((prev) => ({ ...prev, [name]: name === 'price' || name === 'stock' ? Number(value) : val }));
    setFormErrors((prev) => ({ ...prev, [name]: undefined }));
  };

  const handleImageUpload = async (files: FileList) => {
    if (!files || files.length === 0) return;

    setImageUploading(true);
    try {
      const uploadedUrls: string[] = [];
      for (const file of Array.from(files)) {
        const response = await uploadImageToCloudinary(file, { folder: 'products' });
        uploadedUrls.push(response.secure_url);
      }
      setFormData((prev) => ({ ...prev, images: [...prev.images, ...uploadedUrls] }));
      setFormErrors((prev) => ({ ...prev, images: undefined }));
    } catch (err) {
      console.error('Image upload failed:', err);
      let errorMessage = 'Failed to upload image(s)';
      if (err instanceof CloudinaryError) {
        errorMessage = err.message;
      } else if (err instanceof Error) {
        errorMessage = err.message;
      }
      setFormErrors((prev) => ({ ...prev, images: errorMessage }));
    } finally {
      setImageUploading(false);
    }
  };

  const handleRemoveImage = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index),
    }));
    setFormErrors((prev) => ({ ...prev, images: undefined }));
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || user.role !== 'admin') return;

    if (!validateForm()) return;

    const productData = {
      name: formData.name,
      description: formData.description,
      price: formData.price,
      category: formData.category,
      stock: formData.stock,
      images: formData.images,
      isAvailable: formData.isAvailable,
    };

    try {
      if (isEditing && currentProductId) {
        await updateProduct(currentProductId, productData);
      } else {
        await createProduct(productData);
      }
      setFormData({ name: '', description: '', price: 0, category: '', stock: 0, images: [], isAvailable: true });
      setIsEditing(false);
      setCurrentProductId(null);
      setFormErrors({});
    } catch (err) {
      setFormErrors((prev) => ({ ...prev, general: 'Failed to save product' }));
    }
  };

  const handleEdit = (product: Product) => {
    setIsEditing(true);
    setCurrentProductId(product._id);
    setFormData({
      name: product.name,
      description: product.description,
      price: product.price,
      category: typeof product.category === 'string' ? product.category : product.category?._id || '',
      stock: product.stock,
      images: product.images,
      isAvailable: product.isAvailable ?? true,
    });
    setFormErrors({});
  };

  const handleDeleteClick = (id: string) => {
    setProductToDelete(id);
    setShowDeleteModal(true);
  };

  const handleDeleteConfirm = async () => {
    if (productToDelete) {
      try {
        await deleteProduct(productToDelete);
      } catch (err) {
        setFormErrors((prev) => ({ ...prev, general: 'Failed to delete product' }));
      }
    }
    setShowDeleteModal(false);
    setProductToDelete(null);
  };

  const handleDeleteCancel = () => {
    setShowDeleteModal(false);
    setProductToDelete(null);
  };

  if (authLoading || productsLoading || categoriesLoading) {
    return <DashboardSkeleton />;
  }

  if (productsError || categoriesError) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50/50 dark:bg-gray-900/50">
        <p className="text-red-600 dark:text-red-400 font-semibold">{productsError || categoriesError}</p>
      </div>
    );
  }

  if (!user || user.role !== 'admin') {
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
        Food Section
      </motion.h1>

      {/* Product Form */}
      <motion.div
        className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm p-8 rounded-xl shadow-lg mb-10 w-full border border-gray-200/50 dark:border-gray-700/50"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
      >
        <h2 className="text-2xl font-semibold text-gray-800 dark:text-gray-200 mb-6">
          {isEditing ? 'Edit Food' : 'Add Food'}
        </h2>
        <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Food Name
            </label>
            <input
              type="text"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleInputChange}
              className={`w-full p-3 bg-white/50 dark:bg-gray-700/50 backdrop-blur-sm border rounded-xl focus:outline-none focus:ring-2 focus:ring-[#f58c55]/50 dark:focus:ring-[#f7a16b]/50 transition-all duration-300 text-gray-900 dark:text-gray-200 placeholder-gray-500 dark:placeholder-gray-400 ${
                formErrors.name ? 'border-red-500 dark:border-red-400' : 'border-gray-200/50 dark:border-gray-600/50'
              }`}
              required
              aria-invalid={formErrors.name ? 'true' : 'false'}
              aria-describedby={formErrors.name ? 'name-error' : undefined}
            />
            {formErrors.name && (
              <p id="name-error" className="text-red-500 dark:text-red-400 text-sm mt-1">
                {formErrors.name}
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
              value={formData.category}
              onChange={handleInputChange}
              className={`w-full p-3 bg-white/50 dark:bg-gray-700/50 backdrop-blur-sm border rounded-xl focus:outline-none focus:ring-2 focus:ring-[#f58c55]/50 dark:focus:ring-[#f7a16b]/50 transition-all duration-300 text-gray-900 dark:text-gray-200 ${
                formErrors.category ? 'border-red-500 dark:border-red-400' : 'border-gray-200/50 dark:border-gray-600/50'
              }`}
              required
              aria-invalid={formErrors.category ? 'true' : 'false'}
              aria-describedby={formErrors.category ? 'category-error' : undefined}
            >
              <option value="" className="text-gray-900 dark:text-gray-200">Select a category</option>
              {categories.map((category) => (
                <option key={category._id} value={category._id} className="text-gray-900 dark:text-gray-200">
                  {category.name}
                </option>
              ))}
            </select>
            {formErrors.category && (
              <p id="category-error" className="text-red-500 dark:text-red-400 text-sm mt-1">
                {formErrors.category}
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
              value={formData.price}
              onChange={handleInputChange}
              className={`w-full p-3 bg-white/50 dark:bg-gray-700/50 backdrop-blur-sm border rounded-xl focus:outline-none focus:ring-2 focus:ring-[#f58c55]/50 dark:focus:ring-[#f7a16b]/50 transition-all duration-300 text-gray-900 dark:text-gray-200 placeholder-gray-500 dark:placeholder-gray-400 ${
                formErrors.price ? 'border-red-500 dark:border-red-400' : 'border-gray-200/50 dark:border-gray-600/50'
              }`}
              required
              min="0"
              step="0.01"
              aria-invalid={formErrors.price ? 'true' : 'false'}
              aria-describedby={formErrors.price ? 'price-error' : undefined}
            />
            {formErrors.price && (
              <p id="price-error" className="text-red-500 dark:text-red-400 text-sm mt-1">
                {formErrors.price}
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
              value={formData.stock}
              onChange={handleInputChange}
              className={`w-full p-3 bg-white/50 dark:bg-gray-700/50 backdrop-blur-sm border rounded-xl focus:outline-none focus:ring-2 focus:ring-[#f58c55]/50 dark:focus:ring-[#f7a16b]/50 transition-all duration-300 text-gray-900 dark:text-gray-200 placeholder-gray-500 dark:placeholder-gray-400 ${
                formErrors.stock ? 'border-red-500 dark:border-red-400' : 'border-gray-200/50 dark:border-gray-600/50'
              }`}
              required
              min="0"
              aria-invalid={formErrors.stock ? 'true' : 'false'}
              aria-describedby={formErrors.stock ? 'stock-error' : undefined}
            />
            {formErrors.stock && (
              <p id="stock-error" className="text-red-500 dark:text-red-400 text-sm mt-1">
                {formErrors.stock}
              </p>
            )}
          </div>
          <div className="flex items-center space-x-3 p-3 bg-white/50 dark:bg-gray-700/50 backdrop-blur-sm border border-gray-200/50 dark:border-gray-600/50 rounded-xl">
            <input
              type="checkbox"
              id="isAvailable"
              name="isAvailable"
              checked={formData.isAvailable}
              onChange={handleInputChange}
              className="w-5 h-5 accent-[#f58c55] focus:ring-[#f58c55] border-gray-300 rounded transition-all duration-300"
            />
            <label htmlFor="isAvailable" className="text-sm font-medium text-gray-700 dark:text-gray-300 cursor-pointer">
              Available for Sale
            </label>
          </div>
          <div className="md:col-span-2">
            <label htmlFor="description" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Description
            </label>
            <textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              className={`w-full p-3 bg-white/50 dark:bg-gray-700/50 backdrop-blur-sm border rounded-xl focus:outline-none focus:ring-2 focus:ring-[#f58c55]/50 dark:focus:ring-[#f7a16b]/50 transition-all duration-300 resize-y h-32 text-gray-900 dark:text-gray-200 placeholder-gray-500 dark:placeholder-gray-400 ${
                formErrors.description ? 'border-red-500 dark:border-red-400' : 'border-gray-200/50 dark:border-gray-600/50'
              }`}
              required
              aria-invalid={formErrors.description ? 'true' : 'false'}
              aria-describedby={formErrors.description ? 'description-error' : undefined}
            />
            {formErrors.description && (
              <p id="description-error" className="text-red-500 dark:text-red-400 text-sm mt-1">
                {formErrors.description}
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
                  : formErrors.images
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
            {formErrors.images && (
              <p className="text-red-500 dark:text-red-400 text-sm mt-1">{formErrors.images}</p>
            )}
            {formData.images.length > 0 && (
              <div className="mt-4 flex flex-wrap gap-4">
                {formData.images.map((image, index) => (
                  <div key={index} className="relative">
                    <img
                      src={image}
                      alt={`Product preview ${index + 1}`}
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
          {formErrors.general && (
            <p className="md:col-span-2 text-red-500 dark:text-red-400 text-sm mt-4">{formErrors.general}</p>
          )}
          <motion.button
            type="submit"
            className="md:col-span-2 bg-gradient-to-r from-[#f58c55] to-[#f47a45] dark:from-[#f7a16b] dark:to-[#f58c55] text-white p-3 rounded-xl hover:from-[#f47a45] hover:to-[#f58c55] dark:hover:from-[#f58c55] dark:hover:to-[#f7a16b] transition-all duration-300 flex items-center justify-center space-x-2"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            disabled={imageUploading}
          >
            <span>{isEditing ? 'Update Food' : 'Add Food'}</span>
            {!isEditing && <FaPlus />}
          </motion.button>
        </form>
      </motion.div>

      {/* Product Table */}
      <motion.div
        className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm p-8 rounded-xl shadow-lg w-full border border-gray-200/50 dark:border-gray-700/50"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.4 }}
      >
        <h2 className="text-2xl font-semibold text-gray-800 dark:text-gray-200 mb-6">Product List</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b bg-gray-50/50 dark:bg-gray-700/50">
                <th className="py-3 px-4 text-left text-gray-800 dark:text-gray-200 font-semibold">Image</th>
                <th className="py-3 px-4 text-left text-gray-800 dark:text-gray-200 font-semibold">Name</th>
                <th className="py-3 px-4 text-left text-gray-800 dark:text-gray-200 font-semibold">Category</th>
                <th className="py-3 px-4 text-left text-gray-800 dark:text-gray-200 font-semibold">Price</th>
                <th className="py-3 px-4 text-left text-gray-800 dark:text-gray-200 font-semibold">Stock</th>
                <th className="py-3 px-4 text-left text-gray-800 dark:text-gray-200 font-semibold">Status</th>
                <th className="py-3 px-4 text-left text-gray-800 dark:text-gray-200 font-semibold">Actions</th>
              </tr>
            </thead>
            <tbody>
              {products.map((product) => (
                <tr key={product._id} className="border-b border-gray-200/50 dark:border-gray-700/50 hover:bg-gradient-to-r hover:from-[#f58c55]/5 hover:to-[#f47a45]/5 dark:hover:from-[#f7a16b]/5 dark:hover:to-[#f58c55]/5 transition-all duration-300">
                  <td className="py-3 px-4">
                    {product.images[0] ? (
                      <img
                        src={product.images[0]}
                        alt={product.name}
                        className="h-12 w-12 object-cover rounded-md"
                      />
                    ) : (
                      <FaBox className="text-gray-400 dark:text-gray-300" />
                    )}
                  </td>
                  <td className="py-3 px-4 font-medium text-gray-800 dark:text-gray-200">{product.name}</td>
                  <td className="py-3 px-4 text-gray-700 dark:text-gray-300">{getCategoryName(product.category)}</td>
                  <td className="py-3 px-4 text-gray-700 dark:text-gray-300">₦{product.price.toFixed(2)}</td>
                  <td className="py-3 px-4 text-gray-700 dark:text-gray-300">{product.stock}</td>
                  <td className="py-3 px-4 text-gray-700 dark:text-gray-300">
                    <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                      product.isAvailable !== false
                        ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'
                        : 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400'
                    }`}>
                      {product.isAvailable !== false ? 'Available' : 'Unavailable'}
                    </span>
                  </td>
                  <td className="py-3 px-4 flex space-x-3">
                    <motion.button
                      onClick={() => handleEdit(product)}
                      className="text-[#f58c55] dark:text-[#f7a16b] hover:text-[#f47a45] dark:hover:text-[#f58c55]"
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      aria-label={`Edit ${product.name}`}
                    >
                      <FaEdit size={18} />
                    </motion.button>
                    <motion.button
                      onClick={() => handleDeleteClick(product._id)}
                      className="text-red-600 dark:text-red-400 hover:text-red-800 dark:hover:text-red-300"
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      aria-label={`Delete ${product.name}`}
                    >
                      <FaTrash size={18} />
                    </motion.button>
                  </td>
                </tr>
              ))}
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
                Are you sure you want to delete this product? This action cannot be undone.
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

export default ProductManagement;
