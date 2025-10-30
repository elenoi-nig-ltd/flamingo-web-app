'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FaTrash, FaMinus, FaPlus, FaUser, FaPhone, FaEnvelope, FaTimes } from 'react-icons/fa';
import { usePayments } from '@/hooks/usePayments';
import { useOrders } from '@/hooks/useOrders';
import { useAuth } from '@/hooks/useAuth';

interface CartItem {
  id: string;
  name: string;
  image: string;
  price: number;
  quantity: number;
}

interface CartProps {
  isOpen: boolean;
  items: CartItem[];
  totalPrice: number;
  onClose: () => void;
  onUpdateQuantity: (id: string, quantity: number) => void;
  onRemoveItem: (id: string) => void;
  onClearCart?: () => void;
  orderType?: 'food' | 'home-items';
}

// Safe error display component
const SafeErrorDisplay = ({ error }: { error: any }) => {
  if (!error) return null;

  let displayText = 'An error occurred';

  if (typeof error === 'string') {
    displayText = error;
  } else if (error instanceof Error) {
    displayText = error.message;
  } else if (typeof error === 'object' && error !== null) {
    if (error.message) {
      if (Array.isArray(error.message.message)) {
        displayText = error.message.message.join(', ');
      } else if (typeof error.message.message === 'string') {
        displayText = error.message.message;
      } else if (error.message.error) {
        displayText = error.message.error;
      } else {
        displayText = error.message;
      }
    } else if (error.error) {
      displayText = error.error;
    } else {
      try {
        displayText = JSON.stringify(error);
      } catch {
        displayText = 'An unknown error occurred';
      }
    }
  }

  return (
    <p className="text-red-600 text-sm mb-4">{displayText}</p>
  );
};

// Error Modal component
const ErrorModal = ({ message, onClose }: { message: string; onClose: () => void }) => (
  <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 dark:bg-gray-900/50">
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      className="bg-white dark:bg-gray-800 rounded-lg shadow-xl p-6 w-full max-w-md mx-4"
    >
      <div className="text-center mb-6">
        <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Error</h3>
        <p className="text-gray-600 dark:text-gray-400">{message}</p>
      </div>
      <button
        onClick={onClose}
        className="w-full px-4 py-2 bg-[#f58c55] hover:bg-[#f47a45] text-white rounded-lg transition-all duration-300"
      >
        Close
      </button>
    </motion.div>
  </div>
);

const Cart = ({ isOpen, items, totalPrice, onClose, onUpdateQuantity, onRemoveItem, onClearCart, orderType = 'food' }: CartProps) => {
  const [showCustomerForm, setShowCustomerForm] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [customerInfo, setCustomerInfo] = useState({
    name: '',
    email: '',
    phone: '',
  });
  const { initiatePayment, loading: paymentLoading, error: paymentError } = usePayments();
  const { createOrder, loading: orderLoading, error: orderError } = useOrders();
  const { user } = useAuth();

  useEffect(() => {
    if (orderError || paymentError) {
      console.log('Order Error Debug:', { orderError, type: typeof orderError });
      console.log('Payment Error Debug:', { paymentError, type: typeof paymentError });
    }
  }, [orderError, paymentError]);

  const handleQuantityChange = (id: string, newQuantity: number) => {
    if (newQuantity >= 1) {
      onUpdateQuantity(id, newQuantity);
    } else if (newQuantity === 0) {
      onRemoveItem(id);
    }
  };

  const handleCheckout = () => {
    setShowCustomerForm(true);
  };

  const handleCustomerSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!customerInfo.name || !customerInfo.email || !customerInfo.phone) {
      setErrorMessage('Please fill in all fields');
      return;
    }

    setIsLoading(true);

    try {
      const orderData = {
        items: items.map((item) => ({
          product: item.id,
          name: item.name, // Include product name
          quantity: item.quantity,
        })),
        totalAmount: totalPrice,
        status: 'pending' as const,
      };

      console.log('Creating order:', orderData);
      const order = await createOrder(orderData);
      
      if (!order) {
        throw new Error('Failed to create order - no order returned');
      }

      console.log('Order created successfully:', order);

      const paymentData = {
        orderId: order._id,
        email: customerInfo.email,
        amount: totalPrice,
        currency: 'NGN',
      };

      console.log('Initiating payment:', paymentData);
      const paymentResult = await initiatePayment(paymentData);
      
      if (!paymentResult) {
        throw new Error('Failed to initiate payment - no payment result returned');
      }

      console.log('Payment initiated successfully:', paymentResult);

      // Store order data in both sessionStorage AND localStorage as backup
      const pendingOrder = {
        orderId: order._id,
        items: orderData.items,
        totalAmount: totalPrice,
        status: 'pending',
        tx_ref: paymentResult.transactionId,
        customerInfo,
        orderType,
        redirectUrl: orderType === 'home-items' ? '/home-items' : '/food',
      };

      // Try both storage methods
      try {
        sessionStorage.setItem('pendingOrder', JSON.stringify(pendingOrder));
        localStorage.setItem('pendingOrder', JSON.stringify(pendingOrder));
        // Also store with tx_ref as key for easy lookup
        localStorage.setItem(`order_${paymentResult.transactionId}`, JSON.stringify(pendingOrder));
        console.log('Pending order stored in storage:', pendingOrder);
      } catch (storageError) {
        console.error('Failed to store pending order:', storageError);
      }

      // Redirect with the payment URL
      window.location.href = paymentResult.paymentUrl;
    } catch (error) {
      console.error('Checkout error details:', error);
      
      let errorMessage = 'An error occurred during checkout';
      
      if (error instanceof Error) {
        errorMessage = error.message;
      } else if (typeof error === 'string') {
        errorMessage = error;
      } else if (typeof error === 'object' && error !== null) {
        const errorObj = error as any;
        if (errorObj.message) {
          if (Array.isArray(errorObj.message.message)) {
            errorMessage = errorObj.message.message.join(', ');
          } else if (typeof errorObj.message.message === 'string') {
            errorMessage = errorObj.message.message;
          } else if (errorObj.message.error) {
            errorMessage = errorObj.message.error;
          } else {
            errorMessage = errorObj.message;
          }
        } else if (errorObj.error) {
          errorMessage = errorObj.error;
        } else {
          try {
            errorMessage = JSON.stringify(error);
          } catch {
            errorMessage = 'An unknown error occurred';
          }
        }
      }
      
      setErrorMessage(`Checkout failed: ${errorMessage}`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setCustomerInfo((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const clearCart = () => {
    if (onClearCart) {
      onClearCart();
    } else {
      items.forEach((item) => onRemoveItem(item.id));
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 dark:bg-gray-900/50 z-50"
            onClick={onClose}
          />
          
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'tween', duration: 0.3 }}
            className="fixed right-0 top-0 h-screen w-full max-w-md bg-white dark:bg-gray-900 text-gray-900 dark:text-white z-50 shadow-2xl flex flex-col"
          >
            <div className="flex-shrink-0 flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
              <h2 className="text-xl font-bold">Your Cart</h2>
              <button
                onClick={onClose}
                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
              >
                <FaTimes size={20} />
              </button>
            </div>

            <div className="flex-1 flex flex-col min-h-0">
              {items.length === 0 ? (
                <div className="flex-1 flex items-center justify-center p-6">
                  <div className="text-center">
                    <div className="w-24 h-24 mx-auto mb-4 bg-gray-200 dark:bg-gray-700 rounded-full flex items-center justify-center">
                      <svg className="w-12 h-12 text-gray-500 dark:text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4m0 0L7 13m0 0l-2.5 5M7 13l2.5 5m6-5v6a2 2 0 01-2 2H9a2 2 0 01-2-2v-6m6 0V9a2 2 0 00-2-2H9a2 2 0 00-2 2v4.01" />
                      </svg>
                    </div>
                    <p className="text-gray-600 dark:text-gray-400 text-lg mb-2">Your cart is empty</p>
                    <p className="text-gray-500 dark:text-gray-500 text-sm mb-4">Add some delicious food to get started!</p>
                    <button
                      onClick={onClose}
                      className="bg-[#f58c55] hover:bg-[#f47a45] text-white px-6 py-2 rounded-lg transition-all duration-300"
                    >
                      Browse Menu
                    </button>
                  </div>
                </div>
              ) : (
                <>
                  <div className="flex-1 overflow-y-auto p-6 space-y-4 min-h-0">
                    {items.map((item) => (
                      <motion.div
                        key={item.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="flex items-center space-x-4 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg"
                      >
                        <div className="w-16 h-16 rounded-lg overflow-hidden flex-shrink-0">
                          <img
                            src={item.image}
                            alt={item.name}
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className="font-semibold text-gray-900 dark:text-white mb-1 truncate">{item.name}</h3>
                          <p className="text-gray-600 dark:text-gray-400 text-sm">₦{item.price.toLocaleString()}</p>
                        </div>
                        <div className="bg-[#f58c55]/10 dark:bg-[#f58c55]/20 rounded-lg p-2 flex items-center space-x-2 flex-shrink-0">
                          <button
                            onClick={() => handleQuantityChange(item.id, item.quantity - 1)}
                            className="w-6 h-6 flex items-center justify-center text-[#f58c55] hover:text-[#f47a45] transition-colors"
                          >
                            <FaMinus className="text-xs" />
                          </button>
                          <span className="text-gray-900 dark:text-white font-semibold min-w-[20px] text-center">
                            {item.quantity}
                          </span>
                          <button
                            onClick={() => handleQuantityChange(item.id, item.quantity + 1)}
                            className="w-6 h-6 flex items-center justify-center text-[#f58c55] hover:text-[#f47a45] transition-colors"
                          >
                            <FaPlus className="text-xs" />
                          </button>
                        </div>
                        <div className="text-right flex-shrink-0 ml-2">
                          <p className="font-bold text-gray-900 dark:text-white text-sm">₦{(item.price * item.quantity).toLocaleString()}</p>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                  <div className="flex-shrink-0 p-6 border-t border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900">
                    <div className="flex justify-between items-center mb-4">
                      <span className="text-gray-600 dark:text-gray-400">Items: {items.length}</span>
                      <button
                        onClick={clearCart}
                        className="flex items-center space-x-2 text-[#f58c55] dark:text-[#f7a16b] hover:text-[#f47a45] transition-colors text-sm"
                      >
                        <FaTrash className="text-xs" />
                        <span>Clear Cart</span>
                      </button>
                    </div>
                    <div className="bg-[#f58c55]/10 dark:bg-[#f58c55]/20 rounded-lg p-4 mb-4">
                      <div className="text-center">
                        <p className="text-[#f58c55] dark:text-[#f7a16b] font-bold text-xl">
                          Total: ₦{totalPrice.toLocaleString()}
                        </p>
                      </div>
                    </div>
                    <SafeErrorDisplay error={orderError || paymentError} />
                    <button
                      onClick={handleCheckout}
                      disabled={isLoading || orderLoading || paymentLoading}
                      className={`w-full py-3 px-6 rounded-lg font-semibold transition-all duration-300 ${
                        isLoading || orderLoading || paymentLoading
                          ? 'bg-gray-400 dark:bg-gray-600 text-gray-200 dark:text-gray-400 cursor-not-allowed'
                          : 'bg-[#f58c55] hover:bg-[#f47a45] text-white'
                      }`}
                    >
                      {isLoading || orderLoading || paymentLoading ? 'Processing...' : 'Proceed to Checkout'}
                    </button>
                  </div>
                </>
              )}

              {showCustomerForm && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 dark:bg-gray-900/50">
                  <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="bg-white dark:bg-gray-800 rounded-lg shadow-xl p-6 w-full max-w-md mx-4"
                  >
                    <div className="text-center mb-6">
                      <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                        Customer Information
                      </h3>
                      <p className="text-gray-600 dark:text-gray-400">
                        Please provide your details to continue with payment
                      </p>
                    </div>
                    <form onSubmit={handleCustomerSubmit} className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          <FaUser className="inline mr-2 text-[#f58c55]" />
                          Full Name
                        </label>
                        <input
                          type="text"
                          name="name"
                          value={customerInfo.name}
                          onChange={handleInputChange}
                          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-[#f58c55] focus:border-[#f58c55]"
                          placeholder="Enter your full name"
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          <FaEnvelope className="inline mr-2 text-[#f58c55]" />
                          Email Address
                        </label>
                        <input
                          type="email"
                          name="email"
                          value={customerInfo.email}
                          onChange={handleInputChange}
                          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-[#f58c55] focus:border-[#f58c55]"
                          placeholder="Enter your email"
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          <FaPhone className="inline mr-2 text-[#f58c55]" />
                          Phone Number
                        </label>
                        <input
                          type="tel"
                          name="phone"
                          value={customerInfo.phone}
                          onChange={handleInputChange}
                          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-[#f58c55] focus:border-[#f58c55]"
                          placeholder="Enter your phone number"
                          required
                        />
                      </div>
 rescues
                      <SafeErrorDisplay error={orderError || paymentError} />
                      <div className="flex gap-3 pt-4">
                        <button
                          type="button"
                          onClick={() => {
                            setShowCustomerForm(false);
                            setCustomerInfo({ name: '', email: '', phone: '' });
                          }}
                          className="flex-1 px-4 py-2 bg-gray-300 dark:bg-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-400 dark:hover:bg-gray-500 transition-colors"
                        >
                          Cancel
                        </button>
                        <button
                          type="submit"
                          disabled={isLoading || orderLoading || paymentLoading}
                          className={`flex-1 px-4 py-2 rounded-lg transition-all duration-300 ${
                            isLoading || orderLoading || paymentLoading
                              ? 'bg-gray-400 dark:bg-gray-600 text-gray-200 dark:text-gray-400 cursor-not-allowed'
                              : 'bg-[#f58c55] hover:bg-[#f47a45] text-white'
                          }`}
                        >
                          {isLoading || orderLoading || paymentLoading ? 'Processing...' : 'Continue to Payment'}
                        </button>
                      </div>
                    </form>
                  </motion.div>
                </div>
              )}

              {errorMessage && (
                <ErrorModal
                  message={errorMessage}
                  onClose={() => setErrorMessage(null)}
                />
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default Cart;