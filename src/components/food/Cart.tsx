'use client';

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FaTrash, FaMinus, FaPlus, FaUser, FaPhone, FaEnvelope, FaTimes, FaStore, FaTruck, FaDownload, FaShoppingBasket, FaCreditCard, FaReceipt } from 'react-icons/fa';
import { ShoppingBag, ArrowRight, ShieldCheck, Sparkles, Truck, Store, X, Trash2 } from 'lucide-react';
import { usePayments } from '@/hooks/usePayments';
import { useOrders } from '@/hooks/useOrders';
import { useAuth } from '@/hooks/useAuth';
import { toPng } from 'html-to-image';
import DistributedAds from '@/components/advertisements/DistributedAds';
import { getErrorMessage, NIGERIAN_PHONE_MESSAGE, NIGERIAN_PHONE_PATTERN } from '@/utils/checkout';
import { formatNaira } from '@/lib/format';

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

  const displayText = getErrorMessage(error, 'An error occurred');

  return (
    <div className="p-3 bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 rounded-xl text-red-600 dark:text-red-300 text-xs font-medium mb-4">
      {displayText}
    </div>
  );
};

const Cart = ({ isOpen, items, totalPrice, onClose, onUpdateQuantity, onRemoveItem, onClearCart, onOrderSuccess, orderType = 'food' }: CartProps) => {
  const [showCustomerForm, setShowCustomerForm] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [phoneError, setPhoneError] = useState<string | null>(null);
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
    { value: 'gidan-kwano', label: 'Gidan Kwano / Dama', price: 600 },
    { value: 'gidan-mangoro', label: 'Gidan Mangoro', price: 800 },
    { value: 'albishiri', label: 'Albishiri / Kpakungu axis', price: 1200 },
    { value: 'bosso', label: 'Bosso Campus & Axis', price: 2000 },
    { value: 'minna-town', label: 'Minna Town', price: 2000 },
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

    if (!customerInfo.name.trim() || !customerInfo.email.trim() || !customerInfo.phone.trim()) {
      setErrorMessage('Please fill in all fields');
      return;
    }

    if (!NIGERIAN_PHONE_PATTERN.test(customerInfo.phone.trim())) {
      setPhoneError(NIGERIAN_PHONE_MESSAGE);
      setErrorMessage(NIGERIAN_PHONE_MESSAGE);
      return;
    }

    if (deliveryOption === 'delivery' && !customerInfo.address.trim()) {
      setErrorMessage('Please enter your delivery address');
      return;
    }

    setIsLoading(true);

    try {
      const orderPayload = {
        items: items.map((item) => ({
          product: item.id,
          productType: (item as any).productType || (orderType === 'home-items' ? 'goods' : 'food'),
          quantity: item.quantity,
        })),
        deliveryOption,
        deliveryZoneId: deliveryOption === 'delivery' ? (deliveryLocation === 'gidan-kwano' ? 'gidan_kwano_dama' : deliveryLocation === 'gidan-mangoro' ? 'gidan_mangoro' : deliveryLocation === 'albishiri' ? 'albishiri_kpakungu' : deliveryLocation === 'bosso' ? 'bosso' : 'minna_town') : undefined,
        deliveryAddress: deliveryOption === 'delivery' ? customerInfo.address : undefined,
        customerName: customerInfo.name.trim(),
        customerEmail: customerInfo.email.trim(),
        customerPhone: customerInfo.phone.trim(),
      };

      const result = await createOrder(orderPayload);
      
      if (!result || !result.order) {
        throw new Error('Failed to create order - no order returned');
      }

      const { order, guestAccessToken } = result;

      const paymentResult = await initiatePayment({
        orderId: order._id,
        guestAccessToken: guestAccessToken || undefined,
      });
      
      if (!paymentResult) {
        throw new Error('Failed to initiate payment - no payment result returned');
      }

      if (onOrderSuccess) {
        onOrderSuccess();
      }

      const pendingOrder = {
        orderId: order._id,
        guestAccessToken,
        items: items.map((item) => ({
          product: item.id,
          name: item.name,
          quantity: item.quantity,
        })),
        totalAmount: order.totalAmount,
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

      try {
        sessionStorage.setItem('pendingOrder', JSON.stringify(pendingOrder));
        localStorage.setItem('pendingOrder', JSON.stringify(pendingOrder));
        localStorage.setItem(`order_${paymentResult.transactionId}`, JSON.stringify(pendingOrder));
      } catch (storageError) {
        console.error('Failed to store pending order:', storageError);
      }

      window.location.href = paymentResult.paymentUrl;
    } catch (error) {
      console.error('Checkout error details:', error);
      setErrorMessage(`Checkout failed: ${getErrorMessage(error, 'An error occurred during checkout')}`);
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
    if (name === 'phone') {
      setPhoneError(value && !NIGERIAN_PHONE_PATTERN.test(value.trim()) ? NIGERIAN_PHONE_MESSAGE : null);
    }
    setErrorMessage(null);
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
      const tempContainer = document.createElement('div');
      tempContainer.style.cssText = `
        position: fixed;
        top: 20px;
        left: 50%;
        transform: translateX(-50%);
        width: 400px;
        background: #faf7f0;
        border-radius: 20px;
        box-shadow: 0 20px 60px rgba(0, 0, 0, 0.2);
        z-index: 99999;
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
        color: #111827;
        overflow: hidden;
        border: 1px solid #ede8da;
      `;
      
      tempContainer.innerHTML = `
        <div style="padding: 24px; background: linear-gradient(135deg, #f58c55, #f47a45); color: white;">
          <div style="display: flex; justify-content: space-between; align-items: center;">
            <h2 style="font-size: 22px; font-weight: bold; margin: 0;">Flamingo Cart Summary</h2>
            <span style="background: rgba(255,255,255,0.2); padding: 4px 10px; border-radius: 20px; font-size: 12px; font-weight: 600;">Minna Marketplace</span>
          </div>
          <div style="margin-top: 8px; font-size: 12px; opacity: 0.9;">
            ${new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
          </div>
        </div>
        
        <div style="padding: 20px;">
          <div style="margin-bottom: 16px;">
            <h3 style="font-size: 14px; font-weight: 700; color: #6b7280; text-transform: uppercase; letter-spacing: 0.05em; margin-bottom: 12px;">
              Items (${items.length})
            </h3>
            ${items.map(item => `
              <div style="display: flex; align-items: center; padding: 12px; background: white; border-radius: 14px; margin-bottom: 10px; border: 1px solid #ede8da;">
                <img src="${item.image}" alt="${item.name}" style="width: 52px; height: 52px; border-radius: 10px; object-fit: cover; margin-right: 12px;" crossOrigin="anonymous" />
                <div style="flex: 1; min-width: 0;">
                  <h4 style="font-weight: 700; color: #111827; font-size: 14px; margin: 0 0 4px 0; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">${item.name}</h4>
                  <div style="display: flex; justify-content: space-between; align-items: center;">
                    <span style="font-[#f47a45]; color: #f47a45; font-weight: 800; font-size: 13px;">₦${(item.price * item.quantity).toLocaleString()}</span>
                    <span style="font-size: 12px; color: #6b7280;">Qty: ${item.quantity}</span>
                  </div>
                </div>
              </div>
            `).join('')}
          </div>
          
          <div style="background: white; border-radius: 14px; padding: 16px; border: 1px solid #ede8da; margin-bottom: 16px;">
            <div style="display: flex; justify-content: space-between; margin-bottom: 8px; font-size: 14px; color: #4b5563;">
              <span>Subtotal:</span>
              <span style="font-weight: 600; color: #111827;">₦${subtotal.toLocaleString()}</span>
            </div>
            <div style="display: flex; justify-content: space-between; margin-bottom: 8px; font-size: 14px; color: #4b5563;">
              <span>Delivery (${deliveryOption}):</span>
              <span style="font-weight: 600; color: #111827;">${deliveryFee > 0 ? `₦${deliveryFee.toLocaleString()}` : 'Free'}</span>
            </div>
            <div style="border-top: 1px border-dashed #e5e7eb; padding-top: 10px; margin-top: 10px; display: flex; justify-content: space-between; align-items: center;">
              <span style="font-size: 16px; font-weight: 800; color: #111827;">Total:</span>
              <span style="font-size: 20px; font-weight: 800; color: #f47a45;">₦${totalWithFees.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
            </div>
          </div>
          
          <div style="text-align: center; font-size: 11px; color: #9ca3af; padding-top: 8px;">
            Flamingo Marketplace Minna • Everything Minna, One Marketplace
          </div>
        </div>
      `;
      
      document.body.appendChild(tempContainer);
      
      const images = tempContainer.querySelectorAll('img');
      const imagePromises = Array.from(images).map(img => {
        if (img.complete) return Promise.resolve();
        return new Promise((resolve) => {
          img.onload = resolve;
          img.onerror = resolve;
        });
      });
      
      await Promise.all(imagePromises);
      await new Promise(resolve => setTimeout(resolve, 200));
      
      const dataUrl = await toPng(tempContainer, {
        backgroundColor: '#faf7f0',
        quality: 1.0,
        pixelRatio: 2,
        cacheBust: true,
      });
      
      document.body.removeChild(tempContainer);
      
      const link = document.createElement('a');
      const timestamp = new Date().toISOString().split('T')[0];
      link.href = dataUrl;
      link.download = `flamingo-cart-${timestamp}.png`;
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
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50"
            onClick={onClose}
          />
          
          <motion.div
            ref={cartContainerRef}
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 220 }}
            className="fixed right-0 top-0 h-screen w-full max-w-md bg-[#faf7f0] dark:bg-gray-900 text-gray-900 dark:text-white z-50 shadow-2xl flex flex-col border-l border-[#ede8da] dark:border-gray-800"
            data-cart-container
          >
            {/* Header matching homepage styling */}
            <div className="shrink-0 flex items-center justify-between px-6 py-5 bg-white dark:bg-gray-800 border-b border-[#ede8da] dark:border-gray-700">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 rounded-full bg-[#f58c55]/10 dark:bg-[#f58c55]/20 flex items-center justify-center">
                  <ShoppingBag className="h-5 w-5 text-[#f47a45]" />
                </div>
                <div>
                  <h2 className="text-lg font-bold tracking-tight text-gray-900 dark:text-white">Your Cart</h2>
                  <p className="text-xs text-gray-500 dark:text-gray-400">Minna Marketplace</p>
                </div>
              </div>
              <div className="flex items-center space-x-1">
                {items.length > 0 && (
                  <button
                    onClick={clearCart}
                    className="p-2 hover:bg-red-50 dark:hover:bg-red-900/20 text-red-500 rounded-xl transition-colors"
                    title="Clear Cart"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                )}
                <button
                  onClick={onClose}
                  className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-500 dark:text-gray-400 rounded-xl transition-colors"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
            </div>

            <div className="flex-1 flex flex-col min-h-0">
              {items.length === 0 ? (
                <div className="flex-1 flex flex-col items-center justify-center p-6 space-y-6">
                  <div className="text-center max-w-xs">
                    <div className="w-20 h-20 mx-auto mb-4 bg-[#f58c55]/10 dark:bg-gray-800 rounded-full flex items-center justify-center">
                      <ShoppingBag className="w-10 h-10 text-[#f47a45]" />
                    </div>
                    <p className="text-gray-900 dark:text-white text-lg mb-1 font-bold">Your cart is empty</p>
                    <p className="text-gray-500 dark:text-gray-400 text-xs mb-6 leading-relaxed">
                      Discover food, drinks, and essential items available across Minna!
                    </p>
                    <button
                      onClick={onClose}
                      className="bg-[#f58c55] hover:bg-[#f47a45] text-white px-7 py-3 rounded-full font-bold text-sm transition-all duration-300 shadow-md hover:shadow-lg"
                    >
                      Explore Marketplace
                    </button>
                  </div>
                  
                  <div className="w-full max-w-sm mt-6">
                    <DistributedAds location="checkout_page" position={0} />
                  </div>
                </div>
              ) : (
                <>
                  {/* Cart Items list */}
                  <div className="flex-1 overflow-y-auto custom-scrollbar p-6 space-y-4">
                    {items.some(i => (i as any).category === 'food' || i.name.toLowerCase().includes('food') || i.name.toLowerCase().includes('rice') || i.name.toLowerCase().includes('meal')) && (
                      <div className="p-3.5 bg-gradient-to-r from-amber-500 to-orange-500 rounded-2xl text-white flex items-center justify-between shadow-sm">
                        <div className="flex items-center space-x-3">
                          <div className="w-8 h-8 bg-white/20 rounded-xl flex items-center justify-center backdrop-blur-md">
                            <Sparkles className="h-4 w-4 text-white animate-pulse" />
                          </div>
                          <div>
                            <p className="font-semibold text-[9px] uppercase tracking-wider opacity-90">Food Order Bonus</p>
                            <p className="font-extrabold text-xs">Complimentary Bottled Water Included!</p>
                          </div>
                        </div>
                        <span className="px-2 py-0.5 bg-white/20 rounded-lg text-[10px] font-extrabold backdrop-blur-md border border-white/30">
                          FREE
                        </span>
                      </div>
                    )}

                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        Order Items
                      </span>
                      <span className="text-xs bg-[#f58c55]/10 dark:bg-gray-800 text-[#f47a45] px-2.5 py-1 rounded-full font-semibold">
                        {items.length} {items.length === 1 ? 'Item' : 'Items'}
                      </span>
                    </div>
                    
                    {items.map((item) => (
                      <motion.div
                        key={item.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="flex items-center space-x-3.5 p-3.5 rounded-2xl bg-white dark:bg-gray-800 border border-[#ede8da] dark:border-gray-700/80 shadow-sm"
                        data-cart-item
                      >
                        <div className="w-16 h-16 rounded-xl overflow-hidden shrink-0 bg-gray-100 dark:bg-gray-700 relative">
                          <img
                            src={item.image}
                            alt={item.name}
                            className="w-full h-full object-cover"
                            crossOrigin="anonymous"
                          />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className="font-bold text-gray-900 dark:text-white text-sm truncate">{item.name}</h3>
                          <p className="text-xs font-extrabold text-[#f47a45] mt-0.5">{formatNaira(item.price)}</p>
                        </div>
                        <div className="bg-[#faf7f0] dark:bg-gray-700/60 rounded-xl p-1 flex items-center space-x-2 border border-[#ede8da] dark:border-gray-600">
                          <button
                            onClick={() => handleQuantityChange(item.id, item.quantity - 1)}
                            className="w-7 h-7 flex items-center justify-center transition-colors text-gray-600 dark:text-gray-300 hover:text-[#f47a45] rounded-lg"
                          >
                            <FaMinus className="text-[10px]" />
                          </button>
                          <span className="font-bold text-gray-900 dark:text-white text-xs min-w-4 text-center">
                            {item.quantity}
                          </span>
                          <button
                            onClick={() => handleQuantityChange(item.id, item.quantity + 1)}
                            className="w-7 h-7 flex items-center justify-center transition-colors text-gray-600 dark:text-gray-300 hover:text-[#f47a45] rounded-lg"
                          >
                            <FaPlus className="text-[10px]" />
                          </button>
                        </div>
                      </motion.div>
                    ))}

                    <div className="py-2">
                      <DistributedAds location="checkout_page" position={0} className="rounded-2xl shadow-sm border border-[#ede8da] dark:border-gray-700" />
                    </div>
                  </div>

                  {/* Service option & Summary Footer */}
                  <div className="shrink-0 p-6 border-t border-[#ede8da] dark:border-gray-800 bg-white dark:bg-gray-800/90 shadow-[0_-10px_30px_rgba(0,0,0,0.03)]">
                    {/* Delivery or Pickup selection */}
                    <div className="mb-5">
                      <div className="flex items-center justify-between mb-2.5">
                        <span className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Fulfillment Method</span>
                      </div>
                      <div className="grid grid-cols-2 gap-2.5">
                        <button
                          type="button"
                          onClick={() => setDeliveryOption('pickup')}
                          className={`flex items-center justify-center space-x-2 py-2.5 px-3 rounded-xl border transition-all duration-200 font-bold text-xs ${
                            deliveryOption === 'pickup'
                              ? 'bg-[#f58c55] border-[#f58c55] text-white shadow-md'
                              : 'bg-[#faf7f0] dark:bg-gray-700/50 border-[#ede8da] dark:border-gray-600 text-gray-700 dark:text-gray-300'
                          }`}
                        >
                          <Store className="h-4 w-4" />
                          <span>Pickup</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => setDeliveryOption('delivery')}
                          className={`flex items-center justify-center space-x-2 py-2.5 px-3 rounded-xl border transition-all duration-200 font-bold text-xs ${
                            deliveryOption === 'delivery'
                              ? 'bg-[#f58c55] border-[#f58c55] text-white shadow-md'
                              : 'bg-[#faf7f0] dark:bg-gray-700/50 border-[#ede8da] dark:border-gray-600 text-gray-700 dark:text-gray-300'
                          }`}
                        >
                          <Truck className="h-4 w-4" />
                          <span>Delivery</span>
                        </button>
                      </div>
                      
                      {deliveryOption === 'delivery' && (
                        <motion.div 
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: 'auto' }}
                          className="mt-3"
                        >
                          <select
                            value={deliveryLocation}
                            onChange={(e) => setDeliveryLocation(e.target.value)}
                            className="w-full px-3.5 py-2.5 border border-[#ede8da] dark:border-gray-600 rounded-xl bg-[#faf7f0] dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-[#f58c55] outline-none transition-all font-medium text-xs"
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

                    {/* Order summary breakdown */}
                    <div className="bg-[#faf7f0] dark:bg-gray-700/40 rounded-xl p-3.5 mb-5 border border-[#ede8da] dark:border-gray-700">
                      <div className="space-y-1.5 text-xs">
                        <div className="flex justify-between text-gray-600 dark:text-gray-400 font-medium">
                          <span>Subtotal</span>
                          <span className="font-semibold text-gray-900 dark:text-gray-200">₦{subtotal.toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between text-gray-600 dark:text-gray-400 font-medium">
                          <span>Delivery Fee</span>
                          <span className="font-semibold text-gray-900 dark:text-gray-200">{deliveryFee > 0 ? `₦${deliveryFee.toLocaleString()}` : 'Free'}</span>
                        </div>
                        <div className="pt-2 mt-1 border-t border-[#ede8da] dark:border-gray-600 flex justify-between items-center">
                          <span className="font-bold text-gray-900 dark:text-white text-sm">Total</span>
                          <span className="font-extrabold text-[#f47a45] text-base">{formatNaira(totalWithFees)}</span>
                        </div>
                      </div>
                    </div>
                    
                    <SafeErrorDisplay error={orderError || paymentError || errorMessage} />
                    
                    <div className="grid grid-cols-5 gap-2.5">
                      <button
                        onClick={handleDownloadCartAsImage}
                        disabled={isDownloading || items.length === 0}
                        className="col-span-1 flex items-center justify-center p-3.5 rounded-xl bg-amber-50 dark:bg-amber-900/20 text-[#f47a45] hover:bg-amber-100 transition-all border border-amber-200 dark:border-amber-900/40 disabled:opacity-50"
                        title="Download Summary"
                      >
                        {isDownloading ? <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current"></div> : <FaDownload className="text-sm" />}
                      </button>
                      
                      <button
                        onClick={handleCheckout}
                        disabled={isLoading || orderLoading || paymentLoading || items.length === 0}
                        className="col-span-4 flex items-center justify-center space-x-2 bg-[#f58c55] hover:bg-[#f47a45] text-white p-3.5 rounded-xl font-bold text-sm transition-all shadow-md hover:shadow-lg disabled:opacity-50"
                      >
                        <FaCreditCard className="text-xs" />
                        <span>{isLoading || orderLoading || paymentLoading ? 'Processing...' : `Checkout • ${formatNaira(totalWithFees)}`}</span>
                      </button>
                    </div>
                  </div>
                </>
              )}

              {showCustomerForm && (
                <div className="fixed inset-0 z-[100000] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="bg-[#faf7f0] dark:bg-gray-800 rounded-3xl shadow-2xl p-6 sm:p-8 w-full max-w-md border border-[#ede8da] dark:border-gray-700"
                  >
                    <div className="text-center mb-6">
                      <div className="w-14 h-14 bg-[#f58c55]/10 rounded-2xl flex items-center justify-center mx-auto mb-3">
                        <FaUser className="text-[#f47a45] text-xl" />
                      </div>
                      <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-1">
                        Delivery Details
                      </h3>
                      <p className="text-gray-500 dark:text-gray-400 text-xs">
                        Enter your contact & delivery info to proceed to payment.
                      </p>
                    </div>

                    <form onSubmit={handleCustomerSubmit} className="space-y-4">
                      <div className="space-y-1.5">
                        <label className="text-[10px] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider ml-1">Full Name</label>
                        <div className="relative">
                          <FaUser className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 text-xs" />
                          <input
                            type="text"
                            name="name"
                            value={customerInfo.name}
                            onChange={handleInputChange}
                            className="w-full pl-10 pr-3.5 py-3 border border-[#ede8da] dark:border-gray-700 rounded-xl bg-white dark:bg-gray-900 text-gray-900 dark:text-white text-xs font-medium focus:ring-2 focus:ring-[#f58c55] outline-none transition-all"
                            placeholder="John Doe"
                            required
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div className="space-y-1.5">
                          <label className="text-[10px] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider ml-1">Email</label>
                          <div className="relative">
                            <FaEnvelope className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 text-xs" />
                            <input
                              type="email"
                              name="email"
                              value={customerInfo.email}
                              onChange={handleInputChange}
                              className="w-full pl-10 pr-3.5 py-3 border border-[#ede8da] dark:border-gray-700 rounded-xl bg-white dark:bg-gray-900 text-gray-900 dark:text-white text-xs font-medium focus:ring-2 focus:ring-[#f58c55] outline-none transition-all"
                              placeholder="john@example.com"
                              required
                            />
                          </div>
                        </div>
                        <div className="space-y-1.5">
                          <label className="text-[10px] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider ml-1">Phone</label>
                          <div className="relative">
                            <FaPhone className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 text-xs" />
                            <input
                              type="tel"
                              name="phone"
                              value={customerInfo.phone}
                              onChange={handleInputChange}
                              pattern="(?:\+234|0)[789][01][0-9]{8}"
                              inputMode="tel"
                              className={`w-full pl-10 pr-3.5 py-3 border rounded-xl bg-white dark:bg-gray-900 text-gray-900 dark:text-white text-xs font-medium focus:ring-2 focus:ring-[#f58c55] outline-none transition-all ${phoneError ? 'border-red-500' : 'border-[#ede8da] dark:border-gray-700'}`}
                              placeholder="08012345678"
                              required
                            />
                          </div>
                          {phoneError && <p className="text-[11px] text-red-600 dark:text-red-400 mt-1">{phoneError}</p>}
                        </div>
                      </div>

                      {deliveryOption === 'delivery' && (
                        <div className="space-y-1.5">
                          <label className="text-[10px] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider ml-1">Delivery Address</label>
                          <div className="relative">
                            <FaTruck className="absolute left-3.5 top-3.5 text-gray-400 text-xs" />
                            <textarea
                              name="address"
                              value={customerInfo.address}
                              onChange={(e) => setCustomerInfo(prev => ({ ...prev, address: e.target.value }))}
                              className="w-full pl-10 pr-3.5 py-3 border border-[#ede8da] dark:border-gray-700 rounded-xl bg-white dark:bg-gray-900 text-gray-900 dark:text-white text-xs font-medium focus:ring-2 focus:ring-[#f58c55] outline-none transition-all resize-none min-h-[80px]"
                              placeholder="Your full lodge or house address in Minna..."
                              required
                            />
                          </div>
                        </div>
                      )}

                      <SafeErrorDisplay error={orderError || paymentError || errorMessage} />

                      <div className="flex gap-3 pt-3">
                        <button
                          type="button"
                          onClick={() => setShowCustomerForm(false)}
                          className="flex-1 px-4 py-3 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-xl text-xs font-bold hover:bg-gray-300 transition-colors"
                        >
                          Back
                        </button>
                        <button
                          type="submit"
                          disabled={isLoading || orderLoading || paymentLoading}
                          className="flex-2 bg-[#f58c55] hover:bg-[#f47a45] text-white px-4 py-3 rounded-xl text-xs font-bold transition-all shadow-md disabled:opacity-50"
                        >
                          {isLoading || orderLoading || paymentLoading ? 'Processing...' : 'Pay Now'}
                        </button>
                      </div>
                    </form>
                  </motion.div>
                </div>
              )}

            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default Cart;
