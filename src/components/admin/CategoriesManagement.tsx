
'use client';

import { useState } from 'react';
import { useCategories } from '@/hooks/useCategories';
import { useAuth } from '@/hooks/useAuth';
import { motion, AnimatePresence } from 'framer-motion';
import { FaPlus, FaEdit, FaTrash, FaSpinner, FaTimes } from 'react-icons/fa';
import { DashboardSkeleton } from '../ui/SkeletonLoader';

interface CategoryFormData {
  name: string;
  description: string;
}

interface FormErrors {
  name?: string;
  description?: string;
  general?: string;
}

const CategoryManagement = () => {
  const { user, loading: authLoading } = useAuth();
  const { categories, loading: categoriesLoading, error: categoriesError, createCategory, updateCategory, deleteCategory } = useCategories();
  const [isEditing, setIsEditing] = useState<boolean>(false);
  const [currentCategoryId, setCurrentCategoryId] = useState<string | null>(null);
  const [formData, setFormData] = useState<CategoryFormData>({
    name: '',
    description: '',
  });
  const [formErrors, setFormErrors] = useState<FormErrors>({});
  const [showDeleteModal, setShowDeleteModal] = useState<boolean>(false);
  const [categoryToDelete, setCategoryToDelete] = useState<string | null>(null);

  const validateForm = () => {
    const errors: FormErrors = {};
    if (!formData.name.trim()) errors.name = 'Name is required';
    if (!formData.description.trim()) errors.description = 'Description is required';
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setFormErrors((prev) => ({ ...prev, [name]: undefined }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || user.role !== 'admin') return;

    if (!validateForm()) return;

    const categoryData = {
      name: formData.name,
      description: formData.description,
    };

    try {
      if (isEditing && currentCategoryId) {
        await updateCategory(currentCategoryId, categoryData);
      } else {
        await createCategory(categoryData);
      }
      setFormData({ name: '', description: '' });
      setIsEditing(false);
      setCurrentCategoryId(null);
      setFormErrors({});
    } catch (err) {
      setFormErrors((prev) => ({ ...prev, general: err instanceof Error ? err.message : 'Failed to save category' }));
    }
  };

  const handleEdit = (category: CategoryFormData & { _id: string }) => {
    setIsEditing(true);
    setCurrentCategoryId(category._id);
    setFormData({
      name: category.name,
      description: category.description,
    });
    setFormErrors({});
  };

  const handleDeleteClick = (id: string) => {
    setCategoryToDelete(id);
    setShowDeleteModal(true);
  };

  const handleDeleteConfirm = async () => {
    if (categoryToDelete) {
      try {
        await deleteCategory(categoryToDelete);
      } catch (err) {
        setFormErrors((prev) => ({ ...prev, general: err instanceof Error ? err.message : 'Failed to delete category' }));
      }
    }
    setShowDeleteModal(false);
    setCategoryToDelete(null);
  };

  const handleDeleteCancel = () => {
    setShowDeleteModal(false);
    setCategoryToDelete(null);
  };

  if (authLoading || categoriesLoading) {
    return <DashboardSkeleton />;
  }

  if (categoriesError) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50/50 dark:bg-gray-900/50">
        <p className="text-red-600 dark:text-red-400 font-semibold">{categoriesError}</p>
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
        Category Management
      </motion.h1>

      {/* Category Form */}
      <motion.div
        className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm p-8 rounded-xl shadow-lg mb-10 w-full border border-gray-200/50 dark:border-gray-700/50"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
      >
        <h2 className="text-2xl font-semibold text-gray-800 dark:text-gray-200 mb-6">
          {isEditing ? 'Edit Category' : 'Add New Category'}
        </h2>
        <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Category Name
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
          {formErrors.general && (
            <p className="md:col-span-2 text-red-500 dark:text-red-400 text-sm mt-4">{formErrors.general}</p>
          )}
          <motion.button
            type="submit"
            className="md:col-span-2 bg-gradient-to-r from-[#f58c55] to-[#f47a45] dark:from-[#f7a16b] dark:to-[#f58c55] text-white p-3 rounded-xl hover:from-[#f47a45] hover:to-[#f58c55] dark:hover:from-[#f58c55] dark:hover:to-[#f7a16b] transition-all duration-300 flex items-center justify-center space-x-2"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <span>{isEditing ? 'Update Category' : 'Add Category'}</span>
            {!isEditing && <FaPlus />}
          </motion.button>
        </form>
      </motion.div>

      {/* Category Table */}
      <motion.div
        className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm p-8 rounded-xl shadow-lg w-full border border-gray-200/50 dark:border-gray-700/50"
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
              {categories.map((category) => (
                <tr key={category._id} className="border-b border-gray-200/50 dark:border-gray-700/50 hover:bg-gradient-to-r hover:from-[#f58c55]/5 hover:to-[#f47a45]/5 dark:hover:from-[#f7a16b]/5 dark:hover:to-[#f58c55]/5 transition-all duration-300">
                  <td className="py-3 px-4 font-medium text-gray-800 dark:text-gray-200">{category.name}</td>
                  <td className="py-3 px-4 text-gray-700 dark:text-gray-300">{category.description}</td>
                  <td className="py-3 px-4 flex space-x-3">
                    <motion.button
                      onClick={() => handleEdit(category)}
                      className="text-[#f58c55] dark:text-[#f7a16b] hover:text-[#f47a45] dark:hover:text-[#f58c55]"
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      aria-label={`Edit ${category.name}`}
                    >
                      <FaEdit size={18} />
                    </motion.button>
                    <motion.button
                      onClick={() => handleDeleteClick(category._id)}
                      className="text-red-600 dark:text-red-400 hover:text-red-800 dark:hover:text-red-300"
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      aria-label={`Delete ${category.name}`}
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
                Are you sure you want to delete this category? This action cannot be undone.
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

export default CategoryManagement;
