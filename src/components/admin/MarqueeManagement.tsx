'use client';

import { useState, useEffect } from 'react';
import { useMarquee } from '@/hooks/useMarquee';
import { useAuth } from '@/hooks/useAuth';
import { motion, AnimatePresence } from 'framer-motion';
import { FaPlus, FaEdit, FaTrash, FaSpinner, FaTimes, FaToggleOn, FaToggleOff } from 'react-icons/fa';
import { DashboardSkeleton } from '../ui/SkeletonLoader';

interface Marquee {
  _id: string;
  text: string;
  isActive: boolean;
  order: number;
  createdAt?: string;
  updatedAt?: string;
}

interface MarqueeFormData {
  text: string;
  isActive: boolean;
  order: number;
}

interface FormErrors {
  text?: string;
  general?: string;
}

const MarqueeManagement = () => {
  const { user, loading: authLoading } = useAuth();
  const { marquees, loading: marqueesLoading, error: marqueesError, createMarquee, updateMarquee, deleteMarquee, refetchMarquees } = useMarquee();
  const [isEditing, setIsEditing] = useState<boolean>(false);
  const [currentMarqueeId, setCurrentMarqueeId] = useState<string | null>(null);
  const [formData, setFormData] = useState<MarqueeFormData>({
    text: '',
    isActive: true,
    order: 0,
  });
  const [formErrors, setFormErrors] = useState<FormErrors>({});
  const [showDeleteModal, setShowDeleteModal] = useState<boolean>(false);
  const [marqueeToDelete, setMarqueeToDelete] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState<boolean>(false);

  useEffect(() => {
    if (user && ['admin', 'staff', 'super_admin'].includes(user.role)) {
      refetchMarquees();
    }
  }, [user]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (formErrors[name as keyof FormErrors]) {
      setFormErrors((prev) => ({ ...prev, [name]: undefined }));
    }
  };

  const handleNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: parseInt(value) || 0 }));
  };

  const handleToggleActive = () => {
    setFormData((prev) => ({ ...prev, isActive: !prev.isActive }));
  };

  const validateForm = (): boolean => {
    const errors: FormErrors = {};
    
    if (!formData.text.trim()) {
      errors.text = 'Marquee text is required';
    } else if (formData.text.length > 500) {
      errors.text = 'Text must be less than 500 characters';
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setSubmitting(true);
    setFormErrors({});

    try {
      if (isEditing && currentMarqueeId) {
        await updateMarquee(currentMarqueeId, formData);
      } else {
        await createMarquee(formData);
      }
      
      resetForm();
      await refetchMarquees();
    } catch (err: any) {
      console.error('Error submitting marquee:', err);
      setFormErrors({ general: err.message || 'Failed to save marquee' });
    } finally {
      setSubmitting(false);
    }
  };

  const resetForm = () => {
    setFormData({
      text: '',
      isActive: true,
      order: 0,
    });
    setIsEditing(false);
    setCurrentMarqueeId(null);
    setFormErrors({});
  };

  const handleEdit = (marquee: Marquee) => {
    setFormData({
      text: marquee.text,
      isActive: marquee.isActive,
      order: marquee.order,
    });
    setCurrentMarqueeId(marquee._id);
    setIsEditing(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDelete = (id: string) => {
    setMarqueeToDelete(id);
    setShowDeleteModal(true);
  };

  const confirmDelete = async () => {
    if (!marqueeToDelete) return;

    try {
      await deleteMarquee(marqueeToDelete);
      setShowDeleteModal(false);
      setMarqueeToDelete(null);
      await refetchMarquees();
    } catch (err: any) {
      console.error('Error deleting marquee:', err);
      alert('Failed to delete marquee: ' + err.message);
    }
  };

  const handleQuickToggle = async (marquee: Marquee) => {
    try {
      await updateMarquee(marquee._id, {
        text: marquee.text,
        isActive: !marquee.isActive,
        order: marquee.order,
      });
      await refetchMarquees();
    } catch (err: any) {
      console.error('Error toggling marquee status:', err);
      alert('Failed to toggle marquee status: ' + err.message);
    }
  };

  if (authLoading || marqueesLoading) {
    return <DashboardSkeleton />;
  }

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Authentication Required</h2>
          <p className="text-gray-600">Please log in to access the marquee management panel.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Marquee Management</h1>
          <p className="text-gray-600">Manage marquee messages displayed on the landing page</p>
        </div>

        {/* Form Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-lg shadow-md p-6 mb-8"
        >
          <h2 className="text-xl font-semibold text-gray-800 mb-4">
            {isEditing ? 'Edit Marquee' : 'Create New Marquee'}
          </h2>
          
          <form onSubmit={handleSubmit} className="space-y-4">
            {formErrors.general && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
                {formErrors.general}
              </div>
            )}

            {/* Text Input */}
            <div>
              <label htmlFor="text" className="block text-sm font-medium text-gray-700 mb-1">
                Marquee Text *
              </label>
              <textarea
                id="text"
                name="text"
                value={formData.text}
                onChange={handleInputChange}
                rows={3}
                className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 ${
                  formErrors.text ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="Enter the marquee text to display..."
              />
              {formErrors.text && (
                <p className="mt-1 text-sm text-red-600">{formErrors.text}</p>
              )}
            </div>

            {/* Active Toggle */}
            <div className="flex items-center space-x-4">
              <label htmlFor="isActive" className="text-sm font-medium text-gray-700">
                Active Status
              </label>
              <button
                type="button"
                onClick={handleToggleActive}
                className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-colors ${
                  formData.isActive
                    ? 'bg-green-100 text-green-700'
                    : 'bg-gray-100 text-gray-700'
                }`}
              >
                {formData.isActive ? (
                  <>
                    <FaToggleOn className="text-xl" />
                    <span>Active</span>
                  </>
                ) : (
                  <>
                    <FaToggleOff className="text-xl" />
                    <span>Inactive</span>
                  </>
                )}
              </button>
            </div>

            {/* Order */}
            <div>
              <label htmlFor="order" className="block text-sm font-medium text-gray-700 mb-1">
                Display Order
              </label>
              <input
                type="number"
                id="order"
                name="order"
                value={formData.order}
                onChange={handleNumberChange}
                min={0}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                placeholder="0"
              />
              <p className="mt-1 text-sm text-gray-500">Lower numbers display first</p>
            </div>

            {/* Buttons */}
            <div className="flex space-x-3 pt-4">
              <button
                type="submit"
                disabled={submitting}
                className="flex items-center justify-center px-6 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {submitting ? (
                  <>
                    <FaSpinner className="animate-spin mr-2" />
                    {isEditing ? 'Updating...' : 'Creating...'}
                  </>
                ) : (
                  <>
                    {isEditing ? <FaEdit className="mr-2" /> : <FaPlus className="mr-2" />}
                    {isEditing ? 'Update Marquee' : 'Create Marquee'}
                  </>
                )}
              </button>
              
              {isEditing && (
                <button
                  type="button"
                  onClick={resetForm}
                  className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
              )}
            </div>
          </form>
        </motion.div>

        {/* Marquees List */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">
            Existing Marquees ({marquees.length})
          </h2>

          {marqueesError && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-4">
              {marqueesError}
            </div>
          )}

          {marquees.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-500 mb-4">No marquees created yet</p>
              <p className="text-sm text-gray-400">Create your first marquee message above</p>
            </div>
          ) : (
            <div className="space-y-4">
              {marquees
                .sort((a, b) => a.order - b.order)
                .map((marquee) => (
                  <motion.div
                    key={marquee._id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
                  >
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <div className="flex items-center space-x-3 mb-2">
                          <button
                            onClick={() => handleQuickToggle(marquee)}
                            className={`text-2xl transition-colors ${
                              marquee.isActive ? 'text-green-500 hover:text-green-600' : 'text-gray-400 hover:text-gray-500'
                            }`}
                            title={marquee.isActive ? 'Click to deactivate' : 'Click to activate'}
                          >
                            {marquee.isActive ? <FaToggleOn /> : <FaToggleOff />}
                          </button>
                          <span className={`px-2 py-1 rounded text-xs font-medium ${
                            marquee.isActive ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                          }`}>
                            {marquee.isActive ? 'Active' : 'Inactive'}
                          </span>
                          <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded text-xs font-medium">
                            Order: {marquee.order}
                          </span>
                        </div>
                        <p className="text-gray-800 text-lg">{marquee.text}</p>
                        {marquee.updatedAt && (
                          <p className="text-sm text-gray-500 mt-2">
                            Last updated: {new Date(marquee.updatedAt).toLocaleString()}
                          </p>
                        )}
                      </div>
                      
                      <div className="flex space-x-2 ml-4">
                        <button
                          onClick={() => handleEdit(marquee)}
                          className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                          title="Edit"
                        >
                          <FaEdit />
                        </button>
                        <button
                          onClick={() => handleDelete(marquee._id)}
                          className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                          title="Delete"
                        >
                          <FaTrash />
                        </button>
                      </div>
                    </div>
                  </motion.div>
                ))}
            </div>
          )}
        </div>

        {/* Delete Confirmation Modal */}
        <AnimatePresence>
          {showDeleteModal && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
              onClick={() => setShowDeleteModal(false)}
            >
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                className="bg-white rounded-lg p-6 max-w-md w-full"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-xl font-bold text-gray-900">Confirm Delete</h3>
                  <button
                    onClick={() => setShowDeleteModal(false)}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <FaTimes />
                  </button>
                </div>
                <p className="text-gray-600 mb-6">
                  Are you sure you want to delete this marquee? This action cannot be undone.
                </p>
                <div className="flex space-x-3">
                  <button
                    onClick={confirmDelete}
                    className="flex-1 bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600 transition-colors"
                  >
                    Delete
                  </button>
                  <button
                    onClick={() => setShowDeleteModal(false)}
                    className="flex-1 border border-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default MarqueeManagement;
