'use client';

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FaTrash, FaMinus, FaPlus, FaUser, FaPhone, FaEnvelope, FaTimes, FaStore, FaTruck, FaDownload, FaShoppingBasket, FaCreditCard, FaReceipt } from 'react-icons/fa';
import { usePayments } from '@/hooks/usePayments';
import { useOrders } from '@/hooks/useOrders';
import { useAuth } from '@/hooks/useAuth';
import { toPng } from 'html-to-image';
import DistributedAds from '@/components/advertisements/DistributedAds';

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
  onOrderSuccess?: () => void;
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

const Cart = ({ isOpen, items, totalPrice, onClose, onUpdateQuantity, onRemoveItem, onClearCart, onOrderSuccess, orderType = 'food' }: CartProps) => {
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

      // Trigger the success callback to show free water alert
      if (onOrderSuccess) {
        onOrderSuccess();
      }

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
            <div className="shrink-0 flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
              <div className="flex items-center space-x-2">
                <FaShoppingBasket className="text-[#f58c55] text-xl" />
                <h2 className="text-xl font-bold">Your Cart</h2>
              </div>
              <div className="flex items-center space-x-2">
                <button
                  onClick={clearCart}
                  className="p-2 hover:bg-red-50 dark:hover:bg-red-900/20 text-red-500 rounded-lg transition-colors"
                  title="Clear Cart"
                >
                  <FaTrash className="text-sm" />
                </button>
                <button
                  onClick={onClose}
                  className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
                >
                  <FaTimes size={20} />
                </button>
              </div>
            </div>

            <div className="flex-1 flex flex-col min-h-0">
              {items.length === 0 ? (
                <div className="flex-1 flex flex-col items-center justify-center p-6 space-y-6">
                  <div className="text-center">
                    <div className="w-24 h-24 mx-auto mb-4 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center">
                      <FaShoppingBasket className="w-12 h-12 text-gray-400" />
                    </div>
                    <p className="text-gray-600 dark:text-gray-400 text-lg mb-2 font-medium">Your cart is empty</p>
                    <p className="text-gray-500 dark:text-gray-500 text-sm mb-6">Add some delicious food to get started!</p>
                    <button
                      onClick={onClose}
                      className="bg-[#f58c55] hover:bg-[#f47a45] text-white px-8 py-3 rounded-xl font-bold transition-all duration-300 shadow-lg shadow-[#f58c55]/20"
                    >
                      Browse Menu
                    </button>
                  </div>
                  
                  {/* Ad in empty state */}
                  <div className="w-full max-w-sm mt-8">
                    <DistributedAds location="checkout_page" position={0} />
                  </div>
                </div>
              ) : (
                <>
                  <div className="flex-1 overflow-y-auto custom-scrollbar">
                    <div className="p-6 space-y-4">
                      <div className="flex items-center justify-between mb-2">
                        <h3 className="text-sm font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Items in Cart</h3>
                        <span className="text-xs bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded-full text-gray-600 dark:text-gray-400 font-medium">
                          {items.length} {items.length === 1 ? 'Item' : 'Items'}
                        </span>
                      </div>
                      
                      {items.map((item) => (
                        <motion.div
                          key={item.id}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          className="flex items-center space-x-4 p-4 rounded-2xl bg-gray-50 dark:bg-gray-800/40 border border-gray-100 dark:border-gray-700/50"
                          data-cart-item
                        >
                          <div className="w-16 h-16 rounded-xl overflow-hidden shrink-0 shadow-sm">
                            <img
                              src={item.image}
                              alt={item.name}
                              className="w-full h-full object-cover"
                              crossOrigin="anonymous"
                            />
                          </div>
                          <div className="flex-1 min-w-0">
                            <h3 className="font-bold text-gray-900 dark:text-white mb-0.5 truncate">{item.name}</h3>
                            <p className="text-sm font-semibold text-[#f58c55]">₦{item.price.toLocaleString()}</p>
                          </div>
                          <div className="bg-white dark:bg-gray-800 rounded-xl p-1.5 flex items-center space-x-3 shadow-sm border border-gray-100 dark:border-gray-700">
                            <button
                              onClick={() => handleQuantityChange(item.id, item.quantity - 1)}
                              className="w-7 h-7 flex items-center justify-center transition-colors text-gray-500 hover:text-[#f58c55] hover:bg-orange-50 dark:hover:bg-orange-900/20 rounded-lg"
                            >
                              <FaMinus className="text-[10px]" />
                            </button>
                            <span className="font-bold text-gray-900 dark:text-white min-w-4.5 text-center text-sm">
                              {item.quantity}
                            </span>
                            <button
                              onClick={() => handleQuantityChange(item.id, item.quantity + 1)}
                              className="w-7 h-7 flex items-center justify-center transition-colors text-gray-500 hover:text-[#f58c55] hover:bg-orange-50 dark:hover:bg-orange-900/20 rounded-lg"
                            >
                              <FaPlus className="text-[10px]" />
                            </button>
                          </div>
                        </motion.div>
                      ))}

                      {/* Ad in scrollable area */}
                      <div className="py-4">
                        <DistributedAds location="checkout_page" position={0} className="rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700" />
                      </div>
                    </div>
                  </div>

                  <div className="shrink-0 p-6 border-t border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-900 shadow-[0_-10px_40px_rgba(0,0,0,0.02)]">
                    {/* Delivery/Pickup Selection */}
                    <div className="mb-6">
                      <div className="flex items-center justify-between mb-4">
                        <h3 className="text-sm font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Service Mode</h3>
                        <span className="text-xs text-[#f58c55] font-bold">
                          {deliveryOption === 'delivery' ? 'Home Delivery' : 'Store Pickup'}
                        </span>
                      </div>
                      <div className="grid grid-cols-2 gap-3">
                        <button
                          type="button"
                          onClick={() => setDeliveryOption('pickup')}
                          className={`flex items-center justify-center space-x-2 py-3 px-4 rounded-xl border transition-all duration-300 font-bold text-sm ${
                            deliveryOption === 'pickup'
                              ? 'bg-[#f58c55] border-[#f58c55] text-white shadow-lg shadow-[#f58c55]/20'
                              : 'bg-gray-50 dark:bg-gray-800/50 border-gray-100 dark:border-gray-700 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'
                          }`}
                        >
                          <FaStore className={deliveryOption === 'pickup' ? 'animate-bounce' : ''} />
                          <span>Pickup</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => setDeliveryOption('delivery')}
                          className={`flex items-center justify-center space-x-2 py-3 px-4 rounded-xl border transition-all duration-300 font-bold text-sm ${
                            deliveryOption === 'delivery'
                              ? 'bg-[#f58c55] border-[#f58c55] text-white shadow-lg shadow-[#f58c55]/20'
                              : 'bg-gray-50 dark:bg-gray-800/50 border-gray-100 dark:border-gray-700 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'
                          }`}
                        >
                          <FaTruck className={deliveryOption === 'delivery' ? 'animate-bounce' : ''} />
                          <span>Delivery</span>
                        </button>
                      </div>
                      
                      {deliveryOption === 'delivery' && (
                        <motion.div 
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: 'auto' }}
                          className="mt-4 space-y-3"
                        >
                          <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                            Delivery Location
                          </label>
                          <select
                            value={deliveryLocation}
                            onChange={(e) => setDeliveryLocation(e.target.value)}
                            className="w-full px-4 py-3 border border-gray-200 dark:border-gray-700 rounded-xl bg-gray-50 dark:bg-gray-800/50 text-gray-900 dark:text-white focus:ring-2 focus:ring-[#f58c55] focus:border-[#f58c55] outline-none transition-all font-medium text-sm"
                          >
                            {deliveryLocations.map((location) => (
                              <option key={location.value} value={location.value}>
                                {location.label} (+₦{location.price.toLocaleString()})
                              </option>
                            ))}
                          </select>
                        </motion.div>
                      )}
                    </div>

                    {/* Order Summary */}
                    <div className="bg-gray-50 dark:bg-gray-800/40 rounded-2xl p-4 mb-6 border border-gray-100 dark:border-gray-700/50">
                      <div className="flex items-center space-x-2 mb-3">
                        <FaReceipt className="text-[#f58c55] text-xs" />
                        <h3 className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Order Summary</h3>
                      </div>
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm text-gray-600 dark:text-gray-400 font-medium">
                          <span>Subtotal</span>
                          <span>₦{subtotal.toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between text-sm text-gray-600 dark:text-gray-400 font-medium">
                          <span>Delivery Fee</span>
                          <span>{deliveryFee > 0 ? `₦${deliveryFee.toLocaleString()}` : 'Free'}</span>
                        </div>
                        <div className="pt-2 mt-2 border-t border-gray-200 dark:border-gray-700 flex justify-between items-center">
                          <span className="font-bold text-gray-900 dark:text-white">Total</span>
                          <span className="font-extrabold text-[#f58c55] text-lg">₦{totalWithFees.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                        </div>
                      </div>
                    </div>
                    
                    <SafeErrorDisplay error={orderError || paymentError} />
                    
                    <div className="grid grid-cols-5 gap-3">
                      <button
                        onClick={handleDownloadCartAsImage}
                        disabled={isDownloading || items.length === 0}
                        className="col-span-1 flex items-center justify-center p-4 rounded-xl bg-purple-50 dark:bg-purple-900/20 text-purple-600 dark:text-purple-400 hover:bg-purple-100 transition-all disabled:opacity-50"
                        title="Download Summary"
                      >
                        {isDownloading ? <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current"></div> : <FaDownload />}
                      </button>
                      
                      <button
                        onClick={handleCheckout}
                        disabled={isLoading || orderLoading || paymentLoading || items.length === 0}
                        className="col-span-4 flex items-center justify-center space-x-3 bg-[#f58c55] hover:bg-[#f47a45] text-white p-4 rounded-xl font-bold transition-all shadow-lg shadow-[#f58c55]/20 disabled:opacity-50 disabled:grayscale"
                      >
                        <FaCreditCard className="text-sm" />
                        <span>{isLoading || orderLoading || paymentLoading ? 'Processing...' : `Checkout • ₦${totalWithFees.toLocaleString(undefined, { minimumFractionDigits: 0 })}`}</span>
                      </button>
                    </div>
                  </div>
                </>
              )}

              {showCustomerForm && (
                <div className="fixed inset-0 z-100000 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
                  <motion.div
                    initial={{ opacity: 0, scale: 0.9, y: 20 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    className="bg-white dark:bg-gray-800 rounded-3xl shadow-2xl p-8 w-full max-w-md border border-gray-100 dark:border-gray-700"
                  >
                    <div className="text-center mb-8">
                      <div className="w-16 h-16 bg-[#f58c55]/10 rounded-2xl flex items-center justify-center mx-auto mb-4">
                        <FaUser className="text-[#f58c55] text-2xl" />
                      </div>
                      <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                        Delivery Details
                      </h3>
                      <p className="text-gray-500 dark:text-gray-400 text-sm">
                        Almost there! Just a few details to complete your order.
                      </p>
                    </div>

                    <form onSubmit={handleCustomerSubmit} className="space-y-5">
                      <div className="space-y-2">
                        <label className="text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest ml-1">Full Name</label>
                        <div className="relative">
                          <FaUser className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 text-sm" />
                          <input
                            type="text"
                            name="name"
                            value={customerInfo.name}
                            onChange={handleInputChange}
                            className="w-full pl-11 pr-4 py-3.5 border border-gray-200 dark:border-gray-700 rounded-2xl bg-gray-50 dark:bg-gray-900/50 text-gray-900 dark:text-white focus:ring-2 focus:ring-[#f58c55] outline-none transition-all font-medium"
                            placeholder="John Doe"
                            required
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <label className="text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest ml-1">Email</label>
                          <div className="relative">
                            <FaEnvelope className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 text-sm" />
                            <input
                              type="email"
                              name="email"
                              value={customerInfo.email}
                              onChange={handleInputChange}
                              className="w-full pl-11 pr-4 py-3.5 border border-gray-200 dark:border-gray-700 rounded-2xl bg-gray-50 dark:bg-gray-900/50 text-gray-900 dark:text-white focus:ring-2 focus:ring-[#f58c55] outline-none transition-all font-medium"
                              placeholder="john@example.com"
                              required
                            />
                          </div>
                        </div>
                        <div className="space-y-2">
                          <label className="text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest ml-1">Phone</label>
                          <div className="relative">
                            <FaPhone className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 text-sm" />
                            <input
                              type="tel"
                              name="phone"
                              value={customerInfo.phone}
                              onChange={handleInputChange}
                              className="w-full pl-11 pr-4 py-3.5 border border-gray-200 dark:border-gray-700 rounded-2xl bg-gray-50 dark:bg-gray-900/50 text-gray-900 dark:text-white focus:ring-2 focus:ring-[#f58c55] outline-none transition-all font-medium"
                              placeholder="08012345678"
                              required
                            />
                          </div>
                        </div>
                      </div>

                      {deliveryOption === 'delivery' && (
                        <div className="space-y-2">
                          <label className="text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest ml-1">Delivery Address</label>
                          <div className="relative">
                            <FaTruck className="absolute left-4 top-4 text-gray-400 text-sm" />
                            <textarea
                              name="address"
                              value={customerInfo.address}
                              onChange={(e) => setCustomerInfo(prev => ({ ...prev, address: e.target.value }))}
                              className="w-full pl-11 pr-4 py-3.5 border border-gray-200 dark:border-gray-700 rounded-2xl bg-gray-50 dark:bg-gray-900/50 text-gray-900 dark:text-white focus:ring-2 focus:ring-[#f58c55] outline-none transition-all font-medium resize-none min-h-25"
                              placeholder="Your full house address..."
                              required
                            />
                          </div>
                        </div>
                      )}

                      <div className="flex gap-3 pt-4">
                        <button
                          type="button"
                          onClick={() => setShowCustomerForm(false)}
                          className="flex-1 px-4 py-4 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 rounded-2xl font-bold hover:bg-gray-200 transition-colors"
                        >
                          Back
                        </button>
                        <button
                          type="submit"
                          disabled={isLoading || orderLoading || paymentLoading}
                          className="flex-2 bg-[#f58c55] hover:bg-[#f47a45] text-white px-4 py-4 rounded-2xl font-bold transition-all shadow-lg shadow-[#f58c55]/20 disabled:opacity-50"
                        >
                          {isLoading || orderLoading || paymentLoading ? 'Processing...' : 'Pay Now'}
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