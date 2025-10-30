'use client';

import { useState } from 'react';
import { useInventory } from '@/hooks/useInventory';
import { useProducts } from '@/hooks/useProducts';
import { useAuth } from '@/hooks/useAuth';
import { motion, AnimatePresence } from 'framer-motion';
import { FaBox, FaPlus, FaEdit, FaTrash, FaSpinner } from 'react-icons/fa';
import { DashboardSkeleton } from '../ui/SkeletonLoader';
import Link from 'next/link';

interface InventoryFormData {
  product: string;
  quantity: number;
  status: 'in_stock' | 'low_stock' | 'out_of_stock';
}

interface FormErrors {
  product?: string;
  quantity?: string;
  status?: string;
  general?: string;
}

const InventoryManagement = () => {
  const { user, loading: authLoading } = useAuth();
  const { inventory, loading: inventoryLoading, error: inventoryError, createInventory, updateInventory, deleteInventory } = useInventory();
  const { products, loading: productsLoading, error: productsError } = useProducts();
  const [isEditing, setIsEditing] = useState<boolean>(false);
  const [currentInventoryId, setCurrentInventoryId] = useState<string | null>(null);
  const [formData, setFormData] = useState<InventoryFormData>({
    product: '',
    quantity: 0,
    status: 'in_stock',
  });
  const [formErrors, setFormErrors] = useState<FormErrors>({});
  const [showDeleteModal, setShowDeleteModal] = useState<boolean>(false);
  const [inventoryToDelete, setInventoryToDelete] = useState<string | null>(null);

  const validateForm = () => {
    const errors: FormErrors = {};
    if (!formData.product) errors.product = 'Product is required';
    if (formData.quantity < 0) errors.quantity = 'Quantity cannot be negative';
    if (!['in_stock', 'low_stock', 'out_of_stock'].includes(formData.status)) {
      errors.status = 'Invalid status';
    }
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: name === 'quantity' ? Number(value) : value }));
    setFormErrors((prev) => ({ ...prev, [name]: undefined }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || user.role !== 'admin') {
      setFormErrors((prev) => ({ ...prev, general: 'Admin access required. Please log in.' }));
      return;
    }

    if (!validateForm()) return;

    const inventoryData = {
      product: formData.product,
      quantity: formData.quantity,
      status: formData.status,
    };

    try {
      if (isEditing && currentInventoryId) {
        await updateInventory(currentInventoryId, inventoryData);
      } else {
        await createInventory(inventoryData);
      }
      setFormData({ product: '', quantity: 0, status: 'in_stock' });
      setIsEditing(false);
      setCurrentInventoryId(null);
      setFormErrors({});
    } catch (err) {
      setFormErrors((prev) => ({ ...prev, general: 'Failed to save inventory' }));
    }
  };

  const handleEdit = (item: { _id: string; product: { _id: string; name: string } | null; quantity: number; status: 'in_stock' | 'low_stock' | 'out_of_stock' }) => {
    setIsEditing(true);
    setCurrentInventoryId(item._id);
    setFormData({
      product: item.product?._id || '',
      quantity: item.quantity,
      status: item.status,
    });
    setFormErrors({});
  };

  const handleDeleteClick = (id: string) => {
    setInventoryToDelete(id);
    setShowDeleteModal(true);
  };

  const handleDeleteConfirm = async () => {
    if (inventoryToDelete) {
      try {
        await deleteInventory(inventoryToDelete);
      } catch (err) {
        setFormErrors((prev) => ({ ...prev, general: 'Failed to delete inventory' }));
      }
    }
    setShowDeleteModal(false);
    setInventoryToDelete(null);
  };

  const handleDeleteCancel = () => {
    setShowDeleteModal(false);
    setInventoryToDelete(null);
  };

  if (authLoading || inventoryLoading || productsLoading) {
    return <DashboardSkeleton />;
  }

  if (inventoryError || productsError) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50/50 dark:bg-gray-900/50">
        <p className="text-red-600 dark:text-red-400 font-semibold">
          {inventoryError || productsError}
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
        Inventory Management
      </motion.h1>

      {/* Inventory Form */}
      <motion.div
        className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm p-8 rounded-xl shadow-lg mb-10 w-full border border-gray-200/50 dark:border-gray-700/50"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
      >
        <h2 className="text-2xl font-semibold text-gray-800 dark:text-gray-200 mb-6">
          {isEditing ? 'Edit Inventory' : 'Add New Inventory'}
        </h2>
        <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label htmlFor="product" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Product
            </label>
            <select
              id="product"
              name="product"
              value={formData.product}
              onChange={handleInputChange}
              className={`w-full p-3 bg-white/50 dark:bg-gray-700/50 backdrop-blur-sm border rounded-xl focus:outline-none focus:ring-2 focus:ring-[#f58c55]/50 dark:focus:ring-[#f7a16b]/50 transition-all duration-300 text-gray-900 dark:text-gray-200 ${
                formErrors.product ? 'border-red-500 dark:border-red-400' : 'border-gray-200/50 dark:border-gray-600/50'
              }`}
              required
              aria-invalid={formErrors.product ? 'true' : 'false'}
              aria-describedby={formErrors.product ? 'product-error' : undefined}
            >
              <option value="" className="text-gray-900 dark:text-gray-200">Select a product</option>
              {products.map((product) => (
                <option key={product._id} value={product._id} className="text-gray-900 dark:text-gray-200">
                  {product.name}
                </option>
              ))}
            </select>
            {formErrors.product && (
              <p id="product-error" className="text-red-500 dark:text-red-400 text-sm mt-1">
                {formErrors.product}
              </p>
            )}
          </div>
          <div>
            <label htmlFor="quantity" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Quantity
            </label>
            <input
              type="number"
              id="quantity"
              name="quantity"
              value={formData.quantity}
              onChange={handleInputChange}
              className={`w-full p-3 bg-white/50 dark:bg-gray-700/50 backdrop-blur-sm border rounded-xl focus:outline-none focus:ring-2 focus:ring-[#f58c55]/50 dark:focus:ring-[#f7a16b]/50 transition-all duration-300 text-gray-900 dark:text-gray-200 placeholder-gray-500 dark:placeholder-gray-400 ${
                formErrors.quantity ? 'border-red-500 dark:border-red-400' : 'border-gray-200/50 dark:border-gray-600/50'
              }`}
              required
              min="0"
              aria-invalid={formErrors.quantity ? 'true' : 'false'}
              aria-describedby={formErrors.quantity ? 'quantity-error' : undefined}
            />
            {formErrors.quantity && (
              <p id="quantity-error" className="text-red-500 dark:text-red-400 text-sm mt-1">
                {formErrors.quantity}
              </p>
            )}
          </div>
          <div>
            <label htmlFor="status" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Status
            </label>
            <select
              id="status"
              name="status"
              value={formData.status}
              onChange={handleInputChange}
              className={`w-full p-3 bg-white/50 dark:bg-gray-700/50 backdrop-blur-sm border rounded-xl focus:outline-none focus:ring-2 focus:ring-[#f58c55]/50 dark:focus:ring-[#f7a16b]/50 transition-all duration-300 text-gray-900 dark:text-gray-200 ${
                formErrors.status ? 'border-red-500 dark:border-red-400' : 'border-gray-200/50 dark:border-gray-600/50'
              }`}
              required
              aria-invalid={formErrors.status ? 'true' : 'false'}
              aria-describedby={formErrors.status ? 'status-error' : undefined}
            >
              <option value="" className="text-gray-900 dark:text-gray-200">Select status</option>
              <option value="in_stock" className="text-gray-900 dark:text-gray-200">In Stock</option>
              <option value="low_stock" className="text-gray-900 dark:text-gray-200">Low Stock</option>
              <option value="out_of_stock" className="text-gray-900 dark:text-gray-200">Out of Stock</option>
            </select>
            {formErrors.status && (
              <p id="status-error" className="text-red-500 dark:text-red-400 text-sm mt-1">
                {formErrors.status}
              </p>
            )}
          </div>
          {formErrors.general && (
            <p className="md:col-span-2 text-red-500 dark:text-red-400 text-sm mt-4">
              {formErrors.general}
              {formErrors.general.includes('Unauthorized') && (
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
            <span>{isEditing ? 'Update Inventory' : 'Add Inventory'}</span>
            {!isEditing && <FaPlus />}
          </motion.button>
        </form>
      </motion.div>

      {/* Inventory Table */}
      <motion.div
        className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm p-8 rounded-xl shadow-lg w-full border border-gray-200/50 dark:border-gray-700/50"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.4 }}
      >
        <h2 className="text-2xl font-semibold text-gray-800 dark:text-gray-200 mb-6">Inventory List</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b bg-gray-50/50 dark:bg-gray-700/50">
                <th className="py-3 px-4 text-left text-gray-800 dark:text-gray-200 font-semibold">Product</th>
                <th className="py-3 px-4 text-left text-gray-800 dark:text-gray-200 font-semibold">Quantity</th>
                <th className="py-3 px-4 text-left text-gray-800 dark:text-gray-200 font-semibold">Status</th>
                <th className="py-3 px-4 text-left text-gray-800 dark:text-gray-200 font-semibold">Last Updated</th>
                <th className="py-3 px-4 text-left text-gray-800 dark:text-gray-200 font-semibold">Actions</th>
              </tr>
            </thead>
            <tbody>
              {inventory && inventory.length > 0 ? (
                inventory.map((item) => (
                  <tr
                    key={item._id}
                    className="border-b border-gray-200/50 dark:border-gray-700/50 hover:bg-gradient-to-r hover:from-[#f58c55]/5 hover:to-[#f47a45]/5 dark:hover:from-[#f7a16b]/5 dark:hover:to-[#f58c55]/5 transition-all duration-300"
                  >
                    <td className="py-3 px-4 font-medium text-gray-800 dark:text-gray-200">
                      {item.product?.name || 'Unknown Product'}
                    </td>
                    <td className="py-3 px-4 text-gray-700 dark:text-gray-300">{item.quantity}</td>
                    <td className="py-3 px-4 text-gray-700 dark:text-gray-300">{item.status.replace('_', ' ')}</td>
                    <td className="py-3 px-4 text-gray-700 dark:text-gray-300">
                      {new Date(item.lastUpdated).toLocaleDateString()}
                    </td>
                    <td className="py-3 px-4 flex space-x-3">
                      <motion.button
                        onClick={() => handleEdit(item)}
                        className="text-[#f58c55] dark:text-[#f7a16b] hover:text-[#f47a45] dark:hover:text-[#f58c55] disabled:text-gray-400 disabled:cursor-not-allowed"
                        whileHover={{ scale: user && user.role === 'admin' ? 1.1 : 1 }}
                        whileTap={{ scale: user && user.role === 'admin' ? 0.9 : 1 }}
                        disabled={!user || user.role !== 'admin'}
                        aria-label={`Edit inventory for ${item.product?.name || 'Unknown Product'}`}
                      >
                        <FaEdit size={18} />
                      </motion.button>
                      <motion.button
                        onClick={() => handleDeleteClick(item._id)}
                        className="text-red-600 dark:text-red-400 hover:text-red-800 dark:hover:text-red-300 disabled:text-gray-400 disabled:cursor-not-allowed"
                        whileHover={{ scale: user && user.role === 'admin' ? 1.1 : 1 }}
                        whileTap={{ scale: user && user.role === 'admin' ? 0.9 : 1 }}
                        disabled={!user || user.role !== 'admin'}
                        aria-label={`Delete inventory for ${item.product?.name || 'Unknown Product'}`}
                      >
                        <FaTrash size={18} />
                      </motion.button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={5} className="py-4 text-center text-gray-500 dark:text-gray-400">
                    {inventoryLoading ? 'Loading inventory...' : 'No inventory found'}
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
                Are you sure you want to delete this inventory item? This action cannot be undone.
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

export default InventoryManagement;