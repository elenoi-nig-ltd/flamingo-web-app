'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { FaTimes, FaBox, FaCalendar, FaMoneyBillWave, FaTruck, FaMapMarkerAlt, FaInfoCircle } from 'react-icons/fa';

interface OrderItem {
  product: {
    _id: string;
    name: string;
    price?: number;
  } | null;
  quantity: number;
}

interface Order {
  _id: string;
  items: OrderItem[];
  totalAmount: number;
  status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
  createdAt: string;
  updatedAt?: string;
  deliveryOption?: 'pickup' | 'delivery';
  deliveryAddress?: string;
  subtotal?: number;
  deliveryFee?: number;
  vatAmount?: number;
}

interface OrderDetailsProps {
  order: Order | null;
  isOpen: boolean;
  onClose: () => void;
}

const OrderDetails: React.FC<OrderDetailsProps> = ({ order, isOpen, onClose }) => {
  if (!order) return null;

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-200';
      case 'processing':
        return 'bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200';
      case 'shipped':
        return 'bg-purple-100 dark:bg-purple-900 text-purple-800 dark:text-purple-200';
      case 'delivered':
        return 'bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200';
      case 'cancelled':
        return 'bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200';
      default:
        return 'bg-gray-100 dark:bg-gray-900 text-gray-800 dark:text-gray-200';
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="fixed inset-0 bg-black/50 dark:bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
        >
          <motion.div
            className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl w-full max-w-3xl max-h-[90vh] overflow-y-auto"
            initial={{ scale: 0.8, opacity: 0, y: 50 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.8, opacity: 0, y: 50 }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="sticky top-0 bg-gradient-to-r from-[#f58c55] to-[#f47a45] dark:from-[#f7a16b] dark:to-[#f58c55] p-6 rounded-t-xl flex justify-between items-center">
              <div>
                <h2 className="text-2xl font-bold text-white mb-1">Order Details</h2>
                <p className="text-white/90 text-sm">Order ID: {order._id}</p>
              </div>
              <button
                onClick={onClose}
                className="text-white hover:bg-white/20 p-2 rounded-full transition-all duration-300"
              >
                <FaTimes size={24} />
              </button>
            </div>

            {/* Content */}
            <div className="p-6 space-y-6">
              {/* Order Information */}
              <div className="grid md:grid-cols-2 gap-4">
                <div className="bg-gray-50 dark:bg-gray-700/50 p-4 rounded-lg">
                  <div className="flex items-center space-x-2 mb-2">
                    <FaCalendar className="text-[#f58c55] dark:text-[#f7a16b]" />
                    <h3 className="font-semibold text-gray-800 dark:text-gray-200">Order Date</h3>
                  </div>
                  <p className="text-gray-700 dark:text-gray-300">
                    {new Date(order.createdAt).toLocaleDateString('en-US', {
                      weekday: 'long',
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                    })}
                  </p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    {new Date(order.createdAt).toLocaleTimeString()}
                  </p>
                </div>

                <div className="bg-gray-50 dark:bg-gray-700/50 p-4 rounded-lg">
                  <div className="flex items-center space-x-2 mb-2">
                    <FaInfoCircle className="text-[#f58c55] dark:text-[#f7a16b]" />
                    <h3 className="font-semibold text-gray-800 dark:text-gray-200">Order Status</h3>
                  </div>
                  <span className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(order.status)}`}>
                    {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                  </span>
                </div>

                {order.deliveryOption && (
                  <div className="bg-gray-50 dark:bg-gray-700/50 p-4 rounded-lg">
                    <div className="flex items-center space-x-2 mb-2">
                      <FaTruck className="text-[#f58c55] dark:text-[#f7a16b]" />
                      <h3 className="font-semibold text-gray-800 dark:text-gray-200">Delivery Method</h3>
                    </div>
                    <span className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${
                      order.deliveryOption === 'delivery'
                        ? 'bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200'
                        : 'bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200'
                    }`}>
                      {order.deliveryOption === 'delivery' ? 'Delivery' : 'Pickup'}
                    </span>
                  </div>
                )}

                {order.deliveryOption === 'delivery' && order.deliveryAddress && (
                  <div className="bg-gray-50 dark:bg-gray-700/50 p-4 rounded-lg">
                    <div className="flex items-center space-x-2 mb-2">
                      <FaMapMarkerAlt className="text-[#f58c55] dark:text-[#f7a16b]" />
                      <h3 className="font-semibold text-gray-800 dark:text-gray-200">Delivery Address</h3>
                    </div>
                    <p className="text-gray-700 dark:text-gray-300 text-sm">{order.deliveryAddress}</p>
                  </div>
                )}
              </div>

              {/* Order Items */}
              <div>
                <div className="flex items-center space-x-2 mb-4">
                  <FaBox className="text-[#f58c55] dark:text-[#f7a16b]" />
                  <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200">Order Items</h3>
                </div>
                <div className="border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden">
                  <table className="w-full">
                    <thead className="bg-gray-50 dark:bg-gray-700/50">
                      <tr>
                        <th className="py-3 px-4 text-left text-sm font-semibold text-gray-800 dark:text-gray-200">Product</th>
                        <th className="py-3 px-4 text-center text-sm font-semibold text-gray-800 dark:text-gray-200">Quantity</th>
                        <th className="py-3 px-4 text-right text-sm font-semibold text-gray-800 dark:text-gray-200">Price</th>
                        <th className="py-3 px-4 text-right text-sm font-semibold text-gray-800 dark:text-gray-200">Subtotal</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                      {order.items.map((item, idx) => (
                        <tr key={idx} className="hover:bg-gray-50 dark:hover:bg-gray-700/30 transition-colors">
                          <td className="py-3 px-4 text-gray-800 dark:text-gray-200">
                            {item.product ? item.product.name : 'Unknown Product'}
                          </td>
                          <td className="py-3 px-4 text-center text-gray-700 dark:text-gray-300">
                            {item.quantity}
                          </td>
                          <td className="py-3 px-4 text-right text-gray-700 dark:text-gray-300">
                            {item.product?.price ? `₦${item.product.price.toFixed(2)}` : 'N/A'}
                          </td>
                          <td className="py-3 px-4 text-right font-medium text-gray-800 dark:text-gray-200">
                            {item.product?.price ? `₦${(item.product.price * item.quantity).toFixed(2)}` : 'N/A'}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Order Summary */}
              <div className="bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-700/30 dark:to-gray-800/30 p-6 rounded-lg">
                <div className="flex items-center space-x-2 mb-4">
                  <FaMoneyBillWave className="text-[#f58c55] dark:text-[#f7a16b]" />
                  <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200">Order Summary</h3>
                </div>
                <div className="space-y-2">
                  {order.subtotal !== undefined && (
                    <div className="flex justify-between text-gray-700 dark:text-gray-300">
                      <span>Subtotal:</span>
                      <span>₦{order.subtotal.toFixed(2)}</span>
                    </div>
                  )}
                  {order.deliveryFee !== undefined && (
                    <div className="flex justify-between text-gray-700 dark:text-gray-300">
                      <span>Delivery Fee:</span>
                      <span>₦{order.deliveryFee.toFixed(2)}</span>
                    </div>
                  )}
                  {order.vatAmount !== undefined && order.vatAmount > 0 && (
                    <div className="flex justify-between text-gray-700 dark:text-gray-300">
                      <span>VAT (7.5%):</span>
                      <span>₦{order.vatAmount.toFixed(2)}</span>
                    </div>
                  )}
                  <div className="border-t border-gray-300 dark:border-gray-600 pt-2 mt-2">
                    <div className="flex justify-between text-lg font-bold text-gray-900 dark:text-gray-100">
                      <span>Total Amount:</span>
                      <span className="text-[#f58c55] dark:text-[#f7a16b]">₦{order.totalAmount.toFixed(2)}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Updated Date */}
              {order.updatedAt && order.updatedAt !== order.createdAt && (
                <div className="text-sm text-gray-500 dark:text-gray-400 text-center">
                  Last updated: {new Date(order.updatedAt).toLocaleString()}
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="border-t border-gray-200 dark:border-gray-700 p-4 flex justify-end">
              <motion.button
                onClick={onClose}
                className="px-6 py-2 bg-gradient-to-r from-[#f58c55] to-[#f47a45] dark:from-[#f7a16b] dark:to-[#f58c55] text-white rounded-lg hover:from-[#f47a45] hover:to-[#f58c55] dark:hover:from-[#f58c55] dark:hover:to-[#f7a16b] transition-all duration-300"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                Close
              </motion.button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default OrderDetails;
