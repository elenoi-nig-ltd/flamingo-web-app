'use client';

import { useRef, useState } from 'react';
import { useOrders } from '@/hooks/useOrders';
import { useProducts } from '@/hooks/useProducts';
import { useAuth } from '@/hooks/useAuth';
import { motion, AnimatePresence } from 'framer-motion';
import { FaBox, FaPlus, FaEdit, FaTrash, FaSpinner, FaEye } from 'react-icons/fa';
import { DashboardSkeleton } from '../ui/SkeletonLoader';
import OrderDetails from './OrderDetails';
import Link from 'next/link';

interface OrderItem {
  product: string;
  quantity: number;
}

interface OrderFormData {
  items: OrderItem[];
  totalAmount: number;
  status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled' | 'expired';
}

interface FormErrors {
  items?: string;
  totalAmount?: string;
  status?: string;
  general?: string;
}

const OrdersManagement = () => {
  const { user, loading: authLoading } = useAuth();
  const { orders, loading: ordersLoading, error: ordersError, createOrder, updateOrder, deleteOrder } = useOrders();
  const { products, loading: productsLoading, error: productsError } = useProducts();
  const [isEditing, setIsEditing] = useState<boolean>(false);
  const [currentOrderId, setCurrentOrderId] = useState<string | null>(null);
  const [formData, setFormData] = useState<OrderFormData>({
    items: [{ product: '', quantity: 1 }],
    totalAmount: 0,
    status: 'pending',
  });
  const [formErrors, setFormErrors] = useState<FormErrors>({});
  const [showDeleteModal, setShowDeleteModal] = useState<boolean>(false);
  const [orderToDelete, setOrderToDelete] = useState<string | null>(null);
  const [selectedOrder, setSelectedOrder] = useState<any>(null);
  const [showOrderDetails, setShowOrderDetails] = useState<boolean>(false);
  const orderFormRef = useRef<HTMLDivElement>(null);
  const statusInputRef = useRef<HTMLSelectElement>(null);

  const validateForm = () => {
    const errors: FormErrors = {};
    if (!isEditing) {
      if (formData.items.length === 0 || formData.items.some((item) => !item.product || item.quantity <= 0)) {
        errors.items = 'At least one valid item with positive quantity is required';
      }
      if (formData.totalAmount <= 0) errors.totalAmount = 'Total amount must be greater than 0';
    }
    if (!['pending', 'processing', 'shipped', 'delivered', 'cancelled', 'expired'].includes(formData.status)) {
      errors.status = 'Invalid status';
    }
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: name === 'totalAmount' ? Number(value) : value }));
    setFormErrors((prev) => ({ ...prev, [name]: undefined }));
  };

  const handleItemChange = (index: number, field: keyof OrderItem, value: string | number) => {
    const newItems = [...formData.items];
    newItems[index] = { ...newItems[index], [field]: field === 'quantity' ? Number(value) : value };
    setFormData((prev) => ({ ...prev, items: newItems }));
    setFormErrors((prev) => ({ ...prev, items: undefined }));
  };

  const addItem = () => {
    setFormData((prev) => ({ ...prev, items: [...prev.items, { product: '', quantity: 1 }] }));
  };

  const removeItem = (index: number) => {
    setFormData((prev) => ({ ...prev, items: prev.items.filter((_, i) => i !== index) }));
    setFormErrors((prev) => ({ ...prev, items: undefined }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || user.role !== 'admin') {
      setFormErrors((prev) => ({ ...prev, general: 'Admin access required. Please log in.' }));
      return;
    }

    if (!validateForm()) return;

    const orderData = {
      items: formData.items,
      totalAmount: formData.totalAmount,
      status: formData.status,
    };

    try {
      if (isEditing && currentOrderId) {
        await updateOrder(currentOrderId, { status: formData.status });
      } else {
        await createOrder(orderData);
      }
      setFormData({ items: [{ product: '', quantity: 1 }], totalAmount: 0, status: 'pending' });
      setIsEditing(false);
      setCurrentOrderId(null);
      setFormErrors({});
    } catch (err) {
      setFormErrors((prev) => ({ ...prev, general: 'Failed to save order' }));
    }
  };

  const handleEdit = (order: { _id: string; items: { product: { _id: string; name: string } | null; quantity: number }[]; totalAmount: number; status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled' | 'expired' }) => {
    setIsEditing(true);
    setCurrentOrderId(order._id);
    setFormData({
      items: order.items.map((item) => ({
        product: item.product?._id || '',
        quantity: item.quantity,
      })),
      totalAmount: order.totalAmount,
      status: order.status,
    });
    setFormErrors({});
    requestAnimationFrame(() => {
      orderFormRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      statusInputRef.current?.focus({ preventScroll: true });
    });
  };

  const handleDeleteClick = (id: string) => {
    setOrderToDelete(id);
    setShowDeleteModal(true);
  };

  const handleDeleteConfirm = async () => {
    if (orderToDelete) {
      try {
        await deleteOrder(orderToDelete);
      } catch (err) {
        setFormErrors((prev) => ({ ...prev, general: 'Failed to delete order' }));
      }
    }
    setShowDeleteModal(false);
    setOrderToDelete(null);
  };

  const handleDeleteCancel = () => {
    setShowDeleteModal(false);
    setOrderToDelete(null);
  };

  if (authLoading || ordersLoading || productsLoading) {
    return <DashboardSkeleton />;
  }

  if (ordersError || productsError) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50/50 dark:bg-gray-900/50">
        <p className="text-red-600 dark:text-red-400 font-semibold">
          {ordersError || productsError}
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
        Orders Management
      </motion.h1>

      {/* Order Form */}
      <motion.div
        ref={orderFormRef}
        className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm p-8 rounded-xl shadow-lg mb-10 w-full border border-gray-200/50 dark:border-gray-700/50"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
      >
        <h2 className="text-2xl font-semibold text-gray-800 dark:text-gray-200 mb-6">
          {isEditing ? 'Edit Order' : 'Add New Order'}
        </h2>
        <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label htmlFor="totalAmount" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Total Amount (₦)
            </label>
            <input
              type="number"
              id="totalAmount"
              name="totalAmount"
              value={formData.totalAmount}
              onChange={handleInputChange}
              className={`w-full p-3 bg-white/50 dark:bg-gray-700/50 backdrop-blur-sm border rounded-xl focus:outline-none focus:ring-2 focus:ring-[#f58c55]/50 dark:focus:ring-[#f7a16b]/50 transition-all duration-300 text-gray-900 dark:text-gray-200 placeholder-gray-500 dark:placeholder-gray-400 ${
                formErrors.totalAmount ? 'border-red-500 dark:border-red-400' : 'border-gray-200/50 dark:border-gray-600/50'
              }`}
              required
              disabled={isEditing}
              min="0"
              step="0.01"
              aria-invalid={formErrors.totalAmount ? 'true' : 'false'}
              aria-describedby={formErrors.totalAmount ? 'totalAmount-error' : undefined}
            />
            {formErrors.totalAmount && (
              <p id="totalAmount-error" className="text-red-500 dark:text-red-400 text-sm mt-1">
                {formErrors.totalAmount}
              </p>
            )}
          </div>
          <div>
            <label htmlFor="status" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Status
            </label>
            <select
              ref={statusInputRef}
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
              <option value="pending" className="text-gray-900 dark:text-gray-200">Pending</option>
              <option value="processing" className="text-gray-900 dark:text-gray-200">Processing</option>
              <option value="shipped" className="text-gray-900 dark:text-gray-200">Shipped</option>
              <option value="delivered" className="text-gray-900 dark:text-gray-200">Delivered</option>
              <option value="cancelled" className="text-gray-900 dark:text-gray-200">Cancelled</option>
              <option value="expired" className="text-gray-900 dark:text-gray-200">Expired</option>
            </select>
            {formErrors.status && (
              <p id="status-error" className="text-red-500 dark:text-red-400 text-sm mt-1">
                {formErrors.status}
              </p>
            )}
          </div>
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Order Items</label>
            {formData.items.map((item, index) => (
              <div key={index} className="flex items-center space-x-4 mb-4">
                <select
                  name="product"
                  value={item.product}
                  onChange={(e) => handleItemChange(index, 'product', e.target.value)}
                  className={`flex-1 p-3 bg-white/50 dark:bg-gray-700/50 backdrop-blur-sm border rounded-xl focus:outline-none focus:ring-2 focus:ring-[#f58c55]/50 dark:focus:ring-[#f7a16b]/50 transition-all duration-300 text-gray-900 dark:text-gray-200 ${
                    formErrors.items ? 'border-red-500 dark:border-red-400' : 'border-gray-200/50 dark:border-gray-600/50'
                  }`}
                  disabled={isEditing}
                  required
                >
                  <option value="" className="text-gray-900 dark:text-gray-200">Select a product</option>
                  {products.map((product) => (
                    <option key={product._id} value={product._id} className="text-gray-900 dark:text-gray-200">
                      {product.name}
                    </option>
                  ))}
                </select>
                <input
                  type="number"
                  name="quantity"
                  value={item.quantity}
                  onChange={(e) => handleItemChange(index, 'quantity', e.target.value)}
                  className={`w-24 p-3 bg-white/50 dark:bg-gray-700/50 backdrop-blur-sm border rounded-xl focus:outline-none focus:ring-2 focus:ring-[#f58c55]/50 dark:focus:ring-[#f7a16b]/50 transition-all duration-300 text-gray-900 dark:text-gray-200 placeholder-gray-500 dark:placeholder-gray-400 ${
                    formErrors.items ? 'border-red-500 dark:border-red-400' : 'border-gray-200/50 dark:border-gray-600/50'
                  }`}
                  disabled={isEditing}
                  min="1"
                  required
                />
                {!isEditing && (
                  <motion.button
                    type="button"
                    onClick={() => removeItem(index)}
                    className="text-red-600 dark:text-red-400 hover:text-red-800 dark:hover:text-red-300"
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    aria-label={`Remove item ${index + 1}`}
                  >
                    <FaTrash size={18} />
                  </motion.button>
                )}
              </div>
            ))}
            {formErrors.items && (
              <p className="text-red-500 dark:text-red-400 text-sm mt-1">{formErrors.items}</p>
            )}
            {!isEditing && (
              <motion.button
                type="button"
                onClick={addItem}
                className="mt-2 text-[#f58c55] dark:text-[#f7a16b] hover:text-[#f47a45] dark:hover:text-[#f58c55] flex items-center space-x-2"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <FaPlus />
                <span>Add Item</span>
              </motion.button>
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
            <span>{isEditing ? 'Update Order' : 'Add Order'}</span>
            {!isEditing && <FaPlus />}
          </motion.button>
        </form>
      </motion.div>

      {/* Orders Table */}
      <motion.div
        className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm p-8 rounded-xl shadow-lg w-full border border-gray-200/50 dark:border-gray-700/50"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.4 }}
      >
        <h2 className="text-2xl font-semibold text-gray-800 dark:text-gray-200 mb-6">Order List</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b bg-gray-50/50 dark:bg-gray-700/50">
                <th className="py-3 px-3 text-left text-gray-800 dark:text-gray-200 font-semibold text-xs">Order ID</th>
                <th className="py-3 px-3 text-left text-gray-800 dark:text-gray-200 font-semibold text-xs">Date</th>
                <th className="py-3 px-3 text-left text-gray-800 dark:text-gray-200 font-semibold text-xs">Items</th>
                <th className="py-3 px-3 text-left text-gray-800 dark:text-gray-200 font-semibold text-xs">Total</th>
                <th className="py-3 px-3 text-left text-gray-800 dark:text-gray-200 font-semibold text-xs">Delivery</th>
                <th className="py-3 px-3 text-left text-gray-800 dark:text-gray-200 font-semibold text-xs max-w-[120px]">Address</th>
                <th className="py-3 px-3 text-left text-gray-800 dark:text-gray-200 font-semibold text-xs">Status</th>
                <th className="py-3 px-3 text-left text-gray-800 dark:text-gray-200 font-semibold text-xs">Actions</th>
              </tr>
            </thead>
            <tbody>
              {orders && orders.length > 0 ? (
                orders.map((order) => (
                  <tr
                    key={order._id}
                    className="border-b border-gray-200/50 dark:border-gray-700/50 hover:bg-gradient-to-r hover:from-[#f58c55]/5 hover:to-[#f47a45]/5 dark:hover:from-[#f7a16b]/5 dark:hover:to-[#f58c55]/5 transition-all duration-300"
                  >
                    <td className="py-3 px-3 font-medium text-gray-800 dark:text-gray-200 text-xs truncate max-w-[100px]" title={order._id}>{order._id.slice(0, 8)}...</td>
                    <td className="py-3 px-3 text-gray-700 dark:text-gray-300">
                      <div className="text-xs">
                        <div className="font-medium">{new Date(order.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</div>
                        <div className="text-xs text-gray-500 dark:text-gray-400">{new Date(order.createdAt).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}</div>
                      </div>
                    </td>
                    <td className="py-3 px-3 text-gray-700 dark:text-gray-300">
                      <div className="text-xs">
                        {order.items.length === 1 ? (
                          <div>
                            {order.items[0].product ? (
                              <span>
                                <span className="font-medium">{order.items[0].product.name}</span>
                                <span className="text-gray-500 dark:text-gray-400"> ×{order.items[0].quantity}</span>
                              </span>
                            ) : (
                              <span className="text-gray-500 dark:text-gray-400">Unknown ×{order.items[0].quantity}</span>
                            )}
                          </div>
                        ) : (
                          <div>
                            <span className="font-medium">{order.items.length} items</span>
                            <button
                              onClick={() => {
                                setSelectedOrder(order);
                                setShowOrderDetails(true);
                              }}
                              className="ml-1 text-[#f58c55] dark:text-[#f7a16b] hover:underline"
                            >
                              (view)
                            </button>
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="py-3 px-3 text-gray-700 dark:text-gray-300 text-xs font-medium">₦{order.totalAmount.toFixed(0)}</td>
                    <td className="py-3 px-3 text-gray-700 dark:text-gray-300">
                      <span className={`px-2 py-1 rounded-full text-[10px] font-medium ${
                        order.deliveryOption === 'delivery' 
                          ? 'bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200' 
                          : 'bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200'
                      }`}>
                        {order.deliveryOption === 'delivery' ? 'Delivery' : 'Pickup'}
                      </span>
                    </td>
                    <td className="py-3 px-3 text-gray-700 dark:text-gray-300">
                      {order.deliveryOption === 'delivery' && order.deliveryAddress ? (
                        <div className="text-xs max-w-[120px] truncate" title={order.deliveryAddress}>
                          {order.deliveryAddress}
                        </div>
                      ) : (
                        <span className="text-gray-400 dark:text-gray-500 text-xs">—</span>
                      )}
                    </td>
                    <td className="py-3 px-3">
                      <span className={`px-2 py-1 rounded-full text-[10px] font-medium ${
                        order.status === 'delivered' ? 'bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200' :
                        order.status === 'cancelled' ? 'bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200' :
                        order.status === 'shipped' ? 'bg-purple-100 dark:bg-purple-900 text-purple-800 dark:text-purple-200' :
                        order.status === 'processing' ? 'bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200' :
                        'bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-200'
                      }`}>
                        {order.status}
                      </span>
                    </td>
                    <td className="py-3 px-3">
                      <div className="flex items-center space-x-2">
                      <motion.button
                        onClick={() => {
                          setSelectedOrder(order);
                          setShowOrderDetails(true);
                        }}
                        className="text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300"
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        aria-label={`View order ${order._id}`}
                        title="View Details"
                      >
                        <FaEye size={16} />
                      </motion.button>
                      <motion.button
                        onClick={() => handleEdit(order)}
                        className="text-[#f58c55] dark:text-[#f7a16b] hover:text-[#f47a45] dark:hover:text-[#f58c55] disabled:text-gray-400 disabled:cursor-not-allowed"
                        whileHover={{ scale: user && user.role === 'admin' ? 1.1 : 1 }}
                        whileTap={{ scale: user && user.role === 'admin' ? 0.9 : 1 }}
                        disabled={!user || user.role !== 'admin'}
                        aria-label={`Edit order ${order._id}`}
                        title="Edit Order"
                      >
                        <FaEdit size={16} />
                      </motion.button>
                      <motion.button
                        onClick={() => handleDeleteClick(order._id)}
                        className="text-red-600 dark:text-red-400 hover:text-red-800 dark:hover:text-red-300 disabled:text-gray-400 disabled:cursor-not-allowed"
                        whileHover={{ scale: user && user.role === 'admin' ? 1.1 : 1 }}
                        whileTap={{ scale: user && user.role === 'admin' ? 0.9 : 1 }}
                        disabled={!user || user.role !== 'admin'}
                        aria-label={`Delete order ${order._id}`}
                        title="Delete Order"
                      >
                        <FaTrash size={16} />
                      </motion.button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={8} className="py-4 text-center text-gray-500 dark:text-gray-400">
                    {ordersLoading ? 'Loading orders...' : 'No orders found'}
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
                Are you sure you want to delete this order? This action cannot be undone.
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

      {/* Order Details Modal */}
      <OrderDetails
        order={selectedOrder}
        isOpen={showOrderDetails}
        onClose={() => {
          setShowOrderDetails(false);
          setSelectedOrder(null);
        }}
      />
    </div>
  );
};

export default OrdersManagement;
