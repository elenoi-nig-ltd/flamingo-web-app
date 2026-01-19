'use client';

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FaTrash, FaMinus, FaPlus, FaUser, FaPhone, FaEnvelope, FaTimes, FaStore, FaTruck, FaDownload } from 'react-icons/fa';
import { usePayments } from '@/hooks/usePayments';
import { useOrders } from '@/hooks/useOrders';
import { useAuth } from '@/hooks/useAuth';
import { toPng } from 'html-to-image';

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
    const errorObj = error as any;
    if (errorObj.message) {
      if (Array.isArray(errorObj.message.message)) {
        displayText = errorObj.message.message.join(', ');
      } else if (typeof errorObj.message.message === 'string') {
        displayText = errorObj.message.message;
      } else if (errorObj.message.error) {
        displayText = errorObj.message.error;
      } else {
        displayText = errorObj.message;
      }
    } else if (errorObj.error) {
      displayText = errorObj.error;
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
    address: '',
  });
  const [deliveryOption, setDeliveryOption] = useState<'pickup' | 'delivery'>('pickup');
  const [deliveryLocation, setDeliveryLocation] = useState<string>('gidan-kwano');
  const [isDownloading, setIsDownloading] = useState(false);
  const cartContainerRef = useRef<HTMLDivElement>(null);

  // Delivery locations with prices
  const deliveryLocations = [
    { value: 'gidan-kwano', label: 'Gidan Kwano/Dama', price: 600 },
    { value: 'gidan-mangoro', label: 'Gidan Mangoro', price: 800 },
    { value: 'albishiri', label: 'Albishiri/Kpakungu axis', price: 1200 },
    { value: 'bosso', label: 'Bosso', price: 2000 },
    { value: 'minna-town', label: 'Minna (Town)', price: 2000 },
  ];
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

  // Calculate subtotal (sum of all items)
  const subtotal = items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  
  // Calculate delivery fee based on selected location
  const deliveryFee = deliveryOption === 'delivery' 
    ? deliveryLocations.find(loc => loc.value === deliveryLocation)?.price || 600
    : 0;
  
  // Calculate total (subtotal + delivery fee)
  const totalWithFees = subtotal + deliveryFee;

  const handleCustomerSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!customerInfo.name || !customerInfo.email || !customerInfo.phone) {
      setErrorMessage('Please fill in all fields');
      return;
    }

    if (deliveryOption === 'delivery' && !customerInfo.address) {
      setErrorMessage('Please enter your delivery address');
      return;
    }

    setIsLoading(true);

    try {
      const orderData = {
        items: items.map((item) => ({
          product: item.id,
          name: item.name,
          quantity: item.quantity,
        })),
        totalAmount: totalWithFees,
        subtotal: subtotal,
        deliveryFee: deliveryFee,
        deliveryOption: deliveryOption,
        deliveryLocation: deliveryOption === 'delivery' ? deliveryLocations.find(loc => loc.value === deliveryLocation)?.label : undefined,
        deliveryAddress: deliveryOption === 'delivery' ? customerInfo.address : undefined,
        customerName: customerInfo.name,
        customerEmail: customerInfo.email,
        customerPhone: customerInfo.phone,
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
        amount: totalWithFees,
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
        totalAmount: totalWithFees,
        subtotal: subtotal,
        deliveryFee: deliveryFee,
        deliveryOption: deliveryOption,
        deliveryLocation: deliveryOption === 'delivery' ? deliveryLocations.find(loc => loc.value === deliveryLocation)?.label : undefined,
        deliveryAddress: deliveryOption === 'delivery' ? customerInfo.address : undefined,
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

  const handleDownloadCartAsImage = async () => {
    if (items.length === 0) {
      setErrorMessage('Cart is empty. Add items before downloading.');
      return;
    }
    
    setIsDownloading(true);
    setErrorMessage(null);
    
    try {
      // Create a temporary container for the cart snapshot
      const tempContainer = document.createElement('div');
      tempContainer.style.cssText = `
        position: fixed;
        top: 20px;
        left: 50%;
        transform: translateX(-50%);
        width: 400px;
        background: white;
        border-radius: 12px;
        box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
        z-index: 99999;
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
        color: #1f2937;
        overflow: hidden;
      `;
      
      // Build the complete cart UI for download (exact replica)
      tempContainer.innerHTML = `
        <!-- Header -->
        <div style="padding: 24px; border-bottom: 1px solid #e5e7eb; background: linear-gradient(135deg, #f58c55, #f47a45); color: white;">
          <div style="display: flex; justify-content: space-between; align-items: center;">
            <h2 style="font-size: 24px; font-weight: bold;">Your Cart</h2>
            <div style="color: rgba(255, 255, 255, 0.9); font-size: 14px;">Flamingo Cart Summary</div>
          </div>
          <div style="margin-top: 12px; font-size: 12px; color: rgba(255, 255, 255, 0.8);">
            ${new Date().toLocaleDateString('en-US', { 
              year: 'numeric', 
              month: 'long', 
              day: 'numeric',
              hour: '2-digit',
              minute: '2-digit'
            })}
          </div>
        </div>
        
        <!-- Cart Items Section -->
        <div style="padding: 24px; max-height: none; overflow: visible;">
          <div style="margin-bottom: 20px;">
            <h3 style="font-size: 16px; font-weight: 600; color: #374151; margin-bottom: 16px; padding-bottom: 8px; border-bottom: 1px solid #e5e7eb;">
              Items in Cart (${items.length})
            </h3>
            ${items.map(item => `
              <div style="display: flex; align-items: center; padding: 16px; background: #f9fafb; border-radius: 8px; margin-bottom: 12px; border: 1px solid #e5e7eb;">
                <div style="width: 64px; height: 64px; border-radius: 8px; overflow: hidden; flex-shrink: 0; margin-right: 16px;">
                  <img src="${item.image}" alt="${item.name}" style="width: 100%; height: 100%; object-fit: cover;" crossOrigin="anonymous" />
                </div>
                <div style="flex: 1; min-width: 0;">
                  <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 8px;">
                    <h4 style="font-weight: 600; color: #111827; font-size: 14px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; margin-right: 12px;">${item.name}</h4>
                    <div style="font-weight: 700; color: #111827; font-size: 14px; flex-shrink: 0;">₦${(item.price * item.quantity).toLocaleString()}</div>
                  </div>
                  <div style="display: flex; justify-content: space-between; align-items: center;">
                    <div style="display: flex; align-items: center; background: rgba(245, 140, 85, 0.1); border-radius: 6px; padding: 4px 8px;">
                      <span style="color: #f58c55; margin: 0 8px; font-weight: 600; font-size: 14px;">${item.quantity}</span>
                    </div>
                    <div style="color: #6b7280; font-size: 13px;">₦${item.price.toLocaleString()} each</div>
                  </div>
                </div>
              </div>
            `).join('')}
          </div>
          
          <!-- Delivery Option -->
          <div style="margin-bottom: 24px;">
            <h3 style="font-size: 16px; font-weight: 600; color: #374151; margin-bottom: 12px;">Select Delivery Option</h3>
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 12px; margin-bottom: 16px;">
              <div style="padding: 16px; background: ${deliveryOption === 'pickup' ? '#f58c55' : '#f9fafb'}; border: 1px solid ${deliveryOption === 'pickup' ? '#f58c55' : '#e5e7eb'}; border-radius: 8px; text-align: center; color: ${deliveryOption === 'pickup' ? 'white' : '#374151'};">
                <div style="font-weight: 600; margin-bottom: 4px;">Pickup</div>
                <div style="font-size: 12px; opacity: 0.9;">At store</div>
              </div>
              <div style="padding: 16px; background: ${deliveryOption === 'delivery' ? '#f58c55' : '#f9fafb'}; border: 1px solid ${deliveryOption === 'delivery' ? '#f58c55' : '#e5e7eb'}; border-radius: 8px; text-align: center; color: ${deliveryOption === 'delivery' ? 'white' : '#374151'};">
                <div style="font-weight: 600; margin-bottom: 4px;">Delivery</div>
                <div style="font-size: 12px; opacity: 0.9;">+₦600</div>
              </div>
            </div>
            <div style="display: flex; align-items: center; padding: 12px; background: ${deliveryOption === 'pickup' ? '#f0f9ff' : '#f0fdf4'}; border-radius: 8px; border: 1px solid ${deliveryOption === 'pickup' ? '#bae6fd' : '#bbf7d0'};">
              <div style="width: 32px; height: 32px; border-radius: 50%; background: ${deliveryOption === 'pickup' ? '#0ea5e9' : '#10b981'}; display: flex; align-items: center; justify-content: center; margin-right: 12px; flex-shrink: 0;">
                <span style="color: white; font-size: 14px;">${deliveryOption === 'pickup' ? '🏪' : '🚚'}</span>
              </div>
              <div style="flex: 1;">
                <div style="font-weight: 600; color: #374151; margin-bottom: 2px;">
                  ${deliveryOption === 'pickup' ? 'Pickup at Store' : 'Home Delivery'}
                </div>
                <div style="font-size: 13px; color: #6b7280;">
                  ${deliveryOption === 'pickup' ? 'Collect your order from our store' : 'Delivered to your address (+₦600)'}
                </div>
              </div>
            </div>
          </div>
          
          <!-- Cart Actions -->
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 24px; padding: 16px; background: #f8fafc; border-radius: 8px; border: 1px solid #e2e8f0;">
            <div style="color: #64748b; font-size: 14px;">
              <strong>${items.length}</strong> item${items.length !== 1 ? 's' : ''} in cart
            </div>
            <div style="display: flex; align-items: center; color: #f58c55; font-size: 14px; font-weight: 500;">
              <span style="margin-right: 6px;">🗑️</span>
              Clear Cart
            </div>
          </div>
          
          <!-- Price Breakdown -->
          <div style="background: #f8fafc; border-radius: 8px; padding: 20px; border: 1px solid #e2e8f0; margin-bottom: 24px;">
            <h3 style="font-size: 16px; font-weight: 600; color: #374151; margin-bottom: 16px; padding-bottom: 8px; border-bottom: 1px solid #e2e8f0;">Order Summary</h3>
            
            <div style="margin-bottom: 16px;">
              <div style="display: flex; justify-content: space-between; margin-bottom: 8px;">
                <span style="color: #64748b; font-size: 14px;">Subtotal (${items.length} items):</span>
                <span style="font-weight: 500; color: #374151;">₦${subtotal.toLocaleString()}</span>
              </div>
              <div style="display: flex; justify-content: space-between; margin-bottom: 8px;">
                <span style="color: #64748b; font-size: 14px;">Delivery Fee:</span>
                <span style="font-weight: 500; color: #374151;">${deliveryFee > 0 ? `₦${deliveryFee.toLocaleString()}` : 'Free'}</span>
              </div>
            </div>
            
            <div style="border-top: 2px solid #e2e8f0; padding-top: 16px; margin-top: 8px;">
              <div style="display: flex; justify-content: space-between; align-items: center;">
                <span style="font-size: 18px; font-weight: 700; color: #111827;">Total Amount:</span>
                <span style="font-size: 24px; font-weight: 800; color: #f58c55;">₦${totalWithFees.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
              </div>
            </div>
          </div>
          
          <!-- Total Display -->
          <div style="background: rgba(245, 140, 85, 0.1); border-radius: 8px; padding: 16px; margin-bottom: 24px; text-align: center; border: 1px solid rgba(245, 140, 85, 0.2);">
            <div style="font-size: 20px; font-weight: 800; color: #f58c55; margin-bottom: 4px;">
              Total: ₦${totalWithFees.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </div>
            <div style="font-size: 13px; color: #6b7280;">
              ${deliveryOption === 'pickup' ? 'Pickup at store' : 'Delivery to your address'}
            </div>
          </div>
          
          <!-- Buttons Section -->
          <div style="margin-top: 24px; display: flex; flex-direction: column; gap: 12px;">
            <div style="display: flex; gap: 12px;">
              <div style="flex: 1; background: linear-gradient(135deg, #8b5cf6, #7c3aed); color: white; padding: 12px; border-radius: 8px; text-align: center; font-weight: 600; font-size: 14px; display: flex; align-items: center; justify-content: center; gap: 8px;">
                <span>📥</span>
                <span>Download Summary</span>
              </div>
              <div style="flex: 1; background: #f58c55; color: white; padding: 12px; border-radius: 8px; text-align: center; font-weight: 600; font-size: 14px;">
                Proceed to Checkout
              </div>
            </div>
          </div>
          
          <!-- Footer -->
          <div style="margin-top: 32px; padding-top: 16px; border-top: 1px solid #e5e7eb; text-align: center;">
            <div style="color: #6b7280; font-size: 12px; margin-bottom: 4px;">Flamingo Cart Summary</div>
            <div style="color: #9ca3af; font-size: 10px;">
              Generated on ${new Date().toLocaleDateString()} at ${new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </div>
            <div style="color: #9ca3af; font-size: 9px; margin-top: 8px;">
              Order ID: FLM-${Date.now().toString().slice(-8)}
            </div>
          </div>
        </div>
      `;
      
      document.body.appendChild(tempContainer);
      
      // Wait for images to load
      const images = tempContainer.querySelectorAll('img');
      const imagePromises = Array.from(images).map(img => {
        if (img.complete) return Promise.resolve();
        return new Promise((resolve, reject) => {
          img.onload = resolve;
          img.onerror = resolve; // Resolve even if image fails to load
        });
      });
      
      await Promise.all(imagePromises);
      
      // Force a small delay to ensure all content is rendered
      await new Promise(resolve => setTimeout(resolve, 200));
      
      // Capture the container
      const dataUrl = await toPng(tempContainer, {
        backgroundColor: '#ffffff',
        quality: 1.0,
        pixelRatio: 2,
        cacheBust: true,
        width: tempContainer.scrollWidth,
        height: tempContainer.scrollHeight + 20, // Add extra padding
        style: {
          width: tempContainer.scrollWidth + 'px',
          height: tempContainer.scrollHeight + 20 + 'px',
        },
      });
      
      // Clean up
      document.body.removeChild(tempContainer);
      
      // Create download link
      const link = document.createElement('a');
      const timestamp = new Date().toISOString().split('T')[0];
      const time = new Date().toTimeString().split(' ')[0].replace(/:/g, '-');
      link.href = dataUrl;
      link.download = `flamingo-cart-summary-${timestamp}-${time}.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
    } catch (error) {
      console.error('Error downloading cart as image:', error);
      setErrorMessage('Failed to download cart summary. Please try again.');
    } finally {
      setIsDownloading(false);
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
            ref={cartContainerRef}
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'tween', duration: 0.3 }}
            className="fixed right-0 top-0 h-screen w-full max-w-md bg-white dark:bg-gray-900 text-gray-900 dark:text-white z-50 shadow-2xl flex flex-col"
            data-cart-container
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
                  <div className="flex-1 overflow-y-auto">
                    <div className="p-6 space-y-4">
                      {/* Cart Items Display */}
                      <div className="mb-4">
                        <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">Items in Cart</h3>
                      </div>
                      {items.map((item) => (
                        <motion.div
                          key={item.id}
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          className="flex items-center space-x-4 p-4 rounded-lg bg-gray-50 dark:bg-gray-800/50"
                          data-cart-item
                        >
                          <div className="w-16 h-16 rounded-lg overflow-hidden flex-shrink-0">
                            <img
                              src={item.image}
                              alt={item.name}
                              className="w-full h-full object-cover"
                              crossOrigin="anonymous"
                            />
                          </div>
                          <div className="flex-1 min-w-0">
                            <h3 className="font-semibold text-gray-900 dark:text-white mb-1 truncate">{item.name}</h3>
                            <p className="text-sm text-gray-600 dark:text-gray-400">₦{item.price.toLocaleString()}</p>
                          </div>
                          <div className="bg-[#f58c55]/10 dark:bg-[#f58c55]/20 rounded-lg p-2 flex items-center space-x-2 flex-shrink-0">
                            <button
                              onClick={() => handleQuantityChange(item.id, item.quantity - 1)}
                              className="w-6 h-6 flex items-center justify-center transition-colors text-[#f58c55] dark:text-[#f7a16b] hover:text-[#f47a45]"
                            >
                              <FaMinus className="text-xs" />
                            </button>
                            <span className="font-semibold text-gray-900 dark:text-white min-w-[20px] text-center">
                              {item.quantity}
                            </span>
                            <button
                              onClick={() => handleQuantityChange(item.id, item.quantity + 1)}
                              className="w-6 h-6 flex items-center justify-center transition-colors text-[#f58c55] dark:text-[#f7a16b] hover:text-[#f47a45]"
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
                  </div>
                  <div className="flex-shrink-0 p-6 border-t border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900">
                    {/* Delivery/Pickup Selection */}
                    <div className="mb-4">
                      <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">Select Delivery Option</h3>
                      <div className="grid grid-cols-2 gap-3">
                        <button
                          type="button"
                          onClick={() => setDeliveryOption('pickup')}
                          className={`flex items-center justify-center space-x-2 py-3 px-4 rounded-lg border transition-all duration-300 ${
                            deliveryOption === 'pickup'
                              ? 'bg-[#f58c55] border-[#f58c55] text-white'
                              : 'bg-gray-100 dark:bg-gray-800 border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
                          }`}
                        >
                          <FaStore />
                          <span>Pickup</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => setDeliveryOption('delivery')}
                          className={`flex items-center justify-center space-x-2 py-3 px-4 rounded-lg border transition-all duration-300 ${
                            deliveryOption === 'delivery'
                              ? 'bg-[#f58c55] border-[#f58c55] text-white'
                              : 'bg-gray-100 dark:bg-gray-800 border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
                          }`}
                        >
                          <FaTruck />
                          <span>Delivery</span>
                        </button>
                      </div>
                      
                      {/* Location Dropdown - Only shown when delivery is selected */}
                      {deliveryOption === 'delivery' && (
                        <div className="mt-3">
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            Select Delivery Location
                          </label>
                          <select
                            value={deliveryLocation}
                            onChange={(e) => setDeliveryLocation(e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-[#f58c55] focus:border-[#f58c55]"
                          >
                            {deliveryLocations.map((location) => (
                              <option key={location.value} value={location.value}>
                                {location.label} - ₦{location.price.toLocaleString()}
                              </option>
                            ))}
                          </select>
                          <div className="mt-2 p-2 bg-amber-50 dark:bg-amber-900/20 rounded-lg border border-amber-200 dark:border-amber-800">
                            <p className="text-xs text-amber-700 dark:text-amber-300">
                              💡 <span className="font-semibold">Tip:</span> Please select the location closest to your delivery address for accurate pricing.
                            </p>
                          </div>
                        </div>
                      )}
                    </div>

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

                    {/* Price Breakdown */}
                    <div className="space-y-2 mb-4">
                      <div className="flex justify-between text-gray-600 dark:text-gray-400">
                        <span>Subtotal:</span>
                        <span>₦{subtotal.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between text-gray-600 dark:text-gray-400">
                        <span>Delivery Fee:</span>
                        <span>{deliveryFee > 0 ? `+₦${deliveryFee.toLocaleString()}` : 'Free'}</span>
                      </div>
                      <div className="border-t border-gray-300 dark:border-gray-700 pt-2 mt-2">
                        <div className="flex justify-between font-bold text-gray-900 dark:text-white">
                          <span>Total:</span>
                          <span>₦{totalWithFees.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                        </div>
                      </div>
                    </div>

                    <div className="bg-[#f58c55]/10 dark:bg-[#f58c55]/20 rounded-lg p-4 mb-4">
                      <div className="text-center">
                        <p className="text-[#f58c55] dark:text-[#f7a16b] font-bold text-xl">
                          Total: ₦{totalWithFees.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </p>
                        <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                          {deliveryOption === 'pickup' ? 'Pickup at store' : 'Delivery to your address'}
                        </p>
                      </div>
                    </div>
                    
                    <SafeErrorDisplay error={orderError || paymentError} />
                    
                    {/* Download Cart Summary Button */}
                    <div className="relative mb-3">
                      <button
                        onClick={handleDownloadCartAsImage}
                        disabled={isDownloading || items.length === 0}
                        className={`w-full py-3 px-6 rounded-lg font-semibold transition-all duration-300 flex items-center justify-center space-x-2 ${
                          isDownloading || items.length === 0
                            ? 'bg-gray-300 dark:bg-gray-600 text-gray-500 dark:text-gray-400 cursor-not-allowed'
                            : 'bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700 text-white hover:shadow-lg'
                        }`}
                        title={items.length === 0 ? 'Cart is empty' : 'Download cart summary as image'}
                      >
                        {isDownloading ? (
                          <>
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                            <span>Processing...</span>
                          </>
                        ) : (
                          <>
                            <FaDownload />
                            <span>Download Cart Summary</span>
                          </>
                        )}
                      </button>
                      {items.length === 0 && (
                        <div className="absolute -top-8 left-0 right-0 text-center">
                          <p className="text-xs text-gray-500 bg-white dark:bg-gray-800 px-2 py-1 rounded">Cart must have items to download</p>
                        </div>
                      )}
                    </div>

                    <button
                      onClick={handleCheckout}
                      disabled={isLoading || orderLoading || paymentLoading || items.length === 0}
                      className={`w-full py-3 px-6 rounded-lg font-semibold transition-all duration-300 ${
                        isLoading || orderLoading || paymentLoading || items.length === 0
                          ? 'bg-gray-400 dark:bg-gray-600 text-gray-200 dark:text-gray-400 cursor-not-allowed'
                          : 'bg-[#f58c55] hover:bg-[#f47a45] text-white hover:shadow-lg'
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
                      <div className="mt-2 p-2 bg-gray-100 dark:bg-gray-700 rounded">
                        <p className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                          {deliveryOption === 'pickup' ? 'Pickup Order' : 'Delivery Order'}
                        </p>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          Total: ₦{totalWithFees.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </p>
                      </div>
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
                      {deliveryOption === 'delivery' && (
                        <>
                          <div className="p-3 bg-[#f58c55]/10 dark:bg-[#f58c55]/20 rounded-lg border border-[#f58c55]/30">
                            <div className="flex items-start space-x-2">
                              <span className="text-[#f58c55] text-lg mt-0.5">📍</span>
                              <div>
                                <p className="text-sm font-semibold text-gray-800 dark:text-gray-200 mb-1">
                                  Confirm Your Delivery Location
                                </p>
                                <p className="text-sm text-gray-700 dark:text-gray-300">
                                  <span className="font-semibold">{deliveryLocations.find(loc => loc.value === deliveryLocation)?.label}</span> - ₦{deliveryFee.toLocaleString()}
                                </p>
                                <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                                  Make sure this location is close to your address below.
                                </p>
                              </div>
                            </div>
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                              <FaTruck className="inline mr-2 text-[#f58c55]" />
                              Delivery Address
                            </label>
                            <textarea
                              name="address"
                              value={customerInfo.address}
                              onChange={(e) => setCustomerInfo(prev => ({ ...prev, address: e.target.value }))}
                              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-[#f58c55] focus:border-[#f58c55] resize-none"
                              placeholder="Enter your delivery address"
                              rows={3}
                              required
                            />
                          </div>
                          <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                            <p className="text-sm text-blue-700 dark:text-blue-300">
                              <span className="font-semibold">Note:</span> ₦{deliveryFee.toLocaleString()} delivery fee to {deliveryLocations.find(loc => loc.value === deliveryLocation)?.label} is included in your total.
                            </p>
                          </div>
                        </>
                      )}
                      <SafeErrorDisplay error={orderError || paymentError} />
                      <div className="flex gap-3 pt-4">
                        <button
                          type="button"
                          onClick={() => {
                            setShowCustomerForm(false);
                            setCustomerInfo({ name: '', email: '', phone: '', address: '' });
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