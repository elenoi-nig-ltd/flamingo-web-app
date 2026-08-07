'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  FaTrash, FaMinus, FaPlus, FaUser, FaPhone, 
  FaEnvelope, FaStore, FaTruck, FaDownload, 
  FaShoppingBasket, FaCreditCard, FaReceipt, 
  FaArrowLeft, FaCheckCircle, FaExclamationCircle,
  FaGift, FaClock
} from 'react-icons/fa';
import { useRouter } from 'next/navigation';
import { usePayments } from '@/hooks/usePayments';
import { useOrders, DeliveryZone } from '@/hooks/useOrders';
import { useAuth } from '@/hooks/useAuth';
import { useCart } from '@/hooks/useCart';
import { toPng } from 'html-to-image';
import DistributedAds from '@/components/advertisements/DistributedAds';
import Header from '@/components/Header';
import { getErrorMessage, NIGERIAN_PHONE_MESSAGE, NIGERIAN_PHONE_PATTERN } from '@/utils/checkout';

// Safe error display component
const SafeErrorDisplay = ({ error }: { error: any }) => {
  if (!error) return null;

  const displayText = getErrorMessage(error, 'An error occurred');

  return (
    <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-2xl flex items-center space-x-3 mt-4">
      <FaExclamationCircle className="text-red-500 shrink-0" />
      <p className="text-red-600 dark:text-red-400 text-sm font-medium">{displayText}</p>
    </div>
  );
};

export default function CartPage() {
  const router = useRouter();
  const { displayItems: items, totalPrice, updateQuantity, removeFromCart, clearCart, totalItems, hasFoodItem } = useCart();
  const { initiatePayment, loading: paymentLoading, error: paymentError } = usePayments();
  const { createOrder, fetchDeliveryZones, loading: orderLoading, error: orderError } = useOrders();
  const { user } = useAuth();

  const [checkoutStep, setCheckoutStep] = useState<'review' | 'info'>('review');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [phoneError, setPhoneError] = useState<string | null>(null);
  const [customerInfo, setCustomerInfo] = useState({
    name: '',
    email: '',
    phone: '',
    address: '',
  });
  const [deliveryOption, setDeliveryOption] = useState<'pickup' | 'delivery'>('delivery');
  const [deliveryZones, setDeliveryZones] = useState<DeliveryZone[]>([]);
  const [selectedZoneId, setSelectedZoneId] = useState<string>('gidan_kwano_dama');
  const [isDownloading, setIsDownloading] = useState(false);

  // Fetch Delivery Zones from backend
  useEffect(() => {
    async function loadZones() {
      const zones = await fetchDeliveryZones();
      if (zones && zones.length > 0) {
        setDeliveryZones(zones);
        setSelectedZoneId(zones[0].id);
      }
    }
    loadZones();
  }, []);

  // Pre-fill user info if logged in
  useEffect(() => {
    if (user) {
      setCustomerInfo(prev => ({
        ...prev,
        name: user.name || '',
        email: user.email || '',
      }));
    }
  }, [user]);

  const activeZone = deliveryZones.find(z => z.id === selectedZoneId);
  const subtotal = totalPrice;
  const deliveryFee = deliveryOption === 'delivery' ? (activeZone?.fee || 0) : 0;
  const totalWithFees = subtotal + deliveryFee;

  const handleCustomerSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!customerInfo.name.trim() || !customerInfo.email.trim() || !customerInfo.phone.trim()) {
      setErrorMessage('Please fill in all customer details');
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
        items: items
          .filter(item => !item.isGift)
          .map((item) => ({
            product: item.id,
            productType: (item as any).productType || 'food',
            quantity: item.quantity,
          })),
        deliveryOption: deliveryOption,
        deliveryZoneId: deliveryOption === 'delivery' ? selectedZoneId : undefined,
        deliveryAddress: deliveryOption === 'delivery' ? customerInfo.address : undefined,
        customerName: customerInfo.name.trim(),
        customerEmail: customerInfo.email.trim(),
        customerPhone: customerInfo.phone.trim(),
      };

      const result = await createOrder(orderPayload);
      if (!result || !result.order) throw new Error('Failed to create order');

      const { order, guestAccessToken } = result;

      const paymentResult = await initiatePayment({
        orderId: order._id,
        guestAccessToken: guestAccessToken || undefined,
      });

      if (!paymentResult) throw new Error('Failed to initiate payment');

      const pendingOrder = {
        orderId: order._id,
        guestAccessToken,
        items: orderPayload.items,
        totalAmount: order.totalAmount,
        status: 'pending',
        tx_ref: paymentResult.transactionId,
        customerInfo,
        orderType: 'food',
        redirectUrl: '/food',
      };

      sessionStorage.setItem('pendingOrder', JSON.stringify(pendingOrder));
      localStorage.setItem('pendingOrder', JSON.stringify(pendingOrder));
      window.location.href = paymentResult.paymentUrl;
    } catch (error: any) {
      setErrorMessage(getErrorMessage(error, 'Checkout failed'));
    } finally {
      setIsLoading(false);
    }
  };

  const handleDownloadSummary = async () => {
    if (items.length === 0) return;
    setIsDownloading(true);
    try {
      const container = document.getElementById('cart-summary-capture');
      if (container) {
        const dataUrl = await toPng(container, { backgroundColor: '#ffffff', quality: 1.0 });
        const link = document.createElement('a');
        link.download = `flamingo-order-${Date.now()}.png`;
        link.href = dataUrl;
        link.click();
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsDownloading(false);
    }
  };

  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <Header />
        <div className="pt-24 sm:pt-32 pb-12 px-4 max-w-4xl mx-auto text-center">
          <div className="bg-white dark:bg-gray-800 rounded-3xl p-8 sm:p-12 shadow-xl shadow-gray-200/50 dark:shadow-none border border-gray-100 dark:border-gray-800">
            <div className="w-20 h-20 sm:w-24 sm:h-24 bg-orange-50 dark:bg-orange-900/20 rounded-full flex items-center justify-center mx-auto mb-6">
              <FaShoppingBasket className="text-orange-500 text-3xl sm:text-4xl" />
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 dark:text-white mb-4">Your cart is empty</h1>
            <p className="text-gray-500 dark:text-gray-400 text-base sm:text-lg mb-8 sm:mb-10 max-w-md mx-auto">
              Looks like you haven't added any delicious meals yet. Start exploring our menu to satisfy your cravings!
            </p>
            <button 
              onClick={() => router.push('/food')}
              className="bg-[#f58c55] hover:bg-[#f47a45] text-white px-8 sm:px-10 py-3 sm:py-4 rounded-2xl font-bold transition-all shadow-lg shadow-orange-500/30 text-base sm:text-lg cursor-pointer"
            >
              Browse Menu
            </button>
            
            <div className="mt-12 sm:mt-16 pt-8 sm:pt-12 border-t border-gray-100 dark:border-gray-700">
              <p className="text-xs sm:text-sm font-bold text-gray-400 uppercase tracking-widest mb-6">Featured Deals</p>
              <div className="max-w-md mx-auto">
                <DistributedAds location="checkout_page" position={0} className="rounded-3xl shadow-lg" />
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <Header />
      
      <main className="pt-24 sm:pt-28 pb-12 sm:pb-20 px-3 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        {/* Progress Header */}
        <div className="flex items-center space-x-3 sm:space-x-4 mb-6 sm:mb-8">
          <button 
            onClick={() => checkoutStep === 'info' ? setCheckoutStep('review') : router.back()}
            className="p-2.5 sm:p-3 bg-white dark:bg-gray-800 rounded-xl shadow-sm text-gray-600 dark:text-gray-400 hover:text-orange-500 transition-colors cursor-pointer"
          >
            <FaArrowLeft className="text-sm sm:text-base" />
          </button>
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 dark:text-white leading-tight">Checkout</h1>
            <div className="flex items-center space-x-2 mt-0.5 sm:mt-1">
              <span className={`text-xs sm:text-sm font-bold ${checkoutStep === 'review' ? 'text-orange-500' : 'text-gray-400'}`}>Review Cart</span>
              <span className="w-3 sm:w-4 h-px bg-gray-300 dark:bg-gray-700"></span>
              <span className={`text-xs sm:text-sm font-bold ${checkoutStep === 'info' ? 'text-orange-500' : 'text-gray-400'}`}>Delivery Info</span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 sm:gap-8 items-start">
          {/* Left Column: Cart Items or Info Form */}
          <div className="lg:col-span-2 space-y-4 sm:space-y-6">
            <AnimatePresence mode="wait">
              {checkoutStep === 'review' ? (
                <motion.div 
                  key="review"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  className="space-y-4"
                >
                  <div className="bg-white dark:bg-gray-800 rounded-2xl sm:rounded-3xl shadow-sm border border-gray-100 dark:border-gray-800 overflow-hidden">
                    <div className="p-4 sm:p-6 border-b border-gray-50 dark:border-gray-700 flex justify-between items-center">
                      <h2 className="text-lg sm:text-xl font-bold">Your Selection ({totalItems})</h2>
                      <button onClick={clearCart} className="text-red-500 hover:text-red-600 font-bold text-xs sm:text-sm flex items-center space-x-1.5 sm:space-x-2 cursor-pointer">
                        <FaTrash className="text-[10px] sm:text-xs" />
                        <span>Clear All</span>
                      </button>
                    </div>

                    {hasFoodItem && (
                      <div className="mx-4 sm:mx-6 mt-4 sm:mt-6 p-3.5 sm:p-4 bg-linear-to-r from-blue-500 to-cyan-500 rounded-xl sm:rounded-2xl text-white flex items-center justify-between shadow-lg shadow-blue-500/20">
                        <div className="flex items-center space-x-3 sm:space-x-4">
                          <div className="w-10 h-10 sm:w-12 sm:h-12 bg-white/20 rounded-lg sm:rounded-xl flex items-center justify-center backdrop-blur-md">
                            <FaGift className="text-lg sm:text-xl animate-bounce" />
                          </div>
                          <div>
                            <p className="font-bold text-[10px] sm:text-sm opacity-90 uppercase tracking-wider">Food Order Reward</p>
                            <p className="font-extrabold text-sm sm:text-lg">Free Bottled Water Included!</p>
                          </div>
                        </div>
                        <div className="hidden sm:block px-4 py-2 bg-white/20 rounded-lg text-xs font-bold backdrop-blur-md border border-white/30">
                          ₦0.00
                        </div>
                      </div>
                    )}

                    {hasFoodItem && (
                      <div className="mx-4 sm:mx-6 mt-3 p-3.5 sm:p-4 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-xl sm:rounded-2xl flex items-center space-x-3.5 shadow-sm">
                        <FaClock className="text-amber-500 shrink-0 text-lg sm:text-xl" />
                        <div>
                          <p className="text-amber-800 dark:text-amber-400 text-[10px] sm:text-xs font-bold uppercase tracking-wider">Ordering hours</p>
                          <p className="text-amber-700 dark:text-amber-300 text-xs sm:text-sm font-medium">
                            Online ordering closes at <span className="font-bold">9:30 PM</span> daily. Orders placed after this time will be processed the next morning.
                          </p>
                        </div>
                      </div>
                    )}
                    
                    <div className="divide-y divide-gray-50 dark:divide-gray-700 mt-2 sm:mt-4">
                      {items.map((item) => (
                        <div key={item.id} className={`p-3.5 sm:p-6 flex flex-col sm:flex-row sm:items-center space-y-3 sm:space-y-0 sm:space-x-6 hover:bg-gray-50/50 dark:hover:bg-gray-700/30 transition-colors ${item.isGift ? 'bg-blue-50/30 dark:bg-blue-900/10' : ''}`}>
                          <div className="flex items-center space-x-3 sm:space-x-6 flex-1 min-w-0">
                            <div className="w-16 h-16 sm:w-24 sm:h-24 rounded-xl sm:rounded-2xl overflow-hidden shrink-0 shadow-md">
                              <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center space-x-2 mb-0.5 sm:mb-1">
                                <h3 className="text-base sm:text-xl font-bold text-gray-900 dark:text-white truncate">{item.name}</h3>
                                {item.isGift && (
                                  <span className="shrink-0 bg-blue-500 text-white text-[8px] sm:text-[10px] font-bold px-1.5 sm:px-2 py-0.5 rounded-full flex items-center space-x-1">
                                    <FaGift size={7} className="sm:w-2 sm:h-2" />
                                    <span>FREE</span>
                                  </span>
                                )}
                              </div>
                              <p className={`text-sm sm:text-lg font-extrabold ${item.isGift ? 'text-blue-500' : 'text-[#f58c55]'}`}>
                                {item.isGift ? 'Gift' : `₦${item.price.toLocaleString()}`}
                              </p>
                            </div>
                          </div>
                          
                          <div className="flex items-center justify-between sm:justify-end sm:space-x-8">
                            {item.isGift ? (
                              <div className="text-[10px] sm:text-sm font-bold text-blue-500 flex items-center space-x-2 bg-blue-50 dark:bg-blue-900/30 px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg sm:rounded-xl border border-blue-100 dark:border-blue-800">
                                <span>Complimentary Item</span>
                              </div>
                            ) : (
                              <div className="bg-gray-100 dark:bg-gray-700 rounded-lg sm:rounded-xl p-1 flex items-center space-x-2 sm:space-x-4 border border-gray-200 dark:border-gray-600">
                                <button 
                                  onClick={() => updateQuantity(item.id, item.quantity - 1)}
                                  className="w-7 h-7 sm:w-10 sm:h-10 flex items-center justify-center text-gray-500 hover:text-orange-500 transition-colors bg-white dark:bg-gray-800 rounded-md sm:rounded-lg shadow-sm cursor-pointer"
                                >
                                  <FaMinus className="text-[8px] sm:text-[10px]" />
                                </button>
                                <span className="font-bold text-sm sm:text-lg min-w-4.5 sm:min-w-6 text-center">{item.quantity}</span>
                                <button 
                                  onClick={() => updateQuantity(item.id, item.quantity + 1)}
                                  className="w-7 h-7 sm:w-10 sm:h-10 flex items-center justify-center text-gray-500 hover:text-orange-500 transition-colors bg-white dark:bg-gray-800 rounded-md sm:rounded-lg shadow-sm cursor-pointer"
                                >
                                  <FaPlus className="text-[8px] sm:text-[10px]" />
                                </button>
                              </div>
                            )}
                            <div className="text-right">
                              <p className="font-extrabold text-gray-900 dark:text-white text-base sm:text-lg">
                                {item.isGift ? 'FREE' : `₦${(item.price * item.quantity).toLocaleString()}`}
                              </p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Interleaved Ad */}
                  <div className="py-1 sm:py-2">
                    <DistributedAds location="checkout_page" position={0} className="rounded-2xl sm:rounded-3xl shadow-md border border-gray-100 dark:border-gray-800" />
                  </div>
                </motion.div>
              ) : (
                <motion.div 
                  key="info"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                >
                  <div className="bg-white dark:bg-gray-800 rounded-2xl sm:rounded-3xl shadow-sm border border-gray-100 dark:border-gray-800 p-5 sm:p-8">
                    <h2 className="text-xl sm:text-2xl font-bold mb-6 sm:mb-8">Delivery Details</h2>
                    <form id="customer-info-form" onSubmit={handleCustomerSubmit} className="space-y-5 sm:space-y-6">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-5 sm:gap-6">
                        <div className="space-y-1.5 sm:space-y-2">
                          <label className="text-[10px] sm:text-sm font-bold text-gray-500 ml-1 uppercase tracking-wider">Full Name</label>
                          <div className="relative group">
                            <FaUser className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-orange-500 transition-colors text-sm sm:text-base" />
                            <input
                              type="text"
                              required
                              value={customerInfo.name}
                              onChange={(e) => setCustomerInfo({...customerInfo, name: e.target.value})}
                              className="w-full pl-11 sm:pl-12 pr-4 py-3 sm:py-4 rounded-xl sm:rounded-2xl bg-gray-50 dark:bg-gray-900/50 border border-gray-100 dark:border-gray-700 focus:ring-2 focus:ring-[#f58c55] outline-none font-medium text-sm sm:text-base"
                              placeholder="e.g. John Doe"
                            />
                          </div>
                        </div>
                        <div className="space-y-1.5 sm:space-y-2">
                          <label className="text-[10px] sm:text-sm font-bold text-gray-500 ml-1 uppercase tracking-wider">Phone Number (Nigerian)</label>
                          <div className="relative group">
                            <FaPhone className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-orange-500 transition-colors text-sm sm:text-base" />
                            <input
                              type="tel"
                              required
                              value={customerInfo.phone}
                              onChange={(e) => {
                                const phone = e.target.value;
                                setCustomerInfo({...customerInfo, phone});
                                setPhoneError(phone && !NIGERIAN_PHONE_PATTERN.test(phone.trim()) ? NIGERIAN_PHONE_MESSAGE : null);
                                setErrorMessage(null);
                              }}
                              pattern="(?:\+234|0)[789][01][0-9]{8}"
                              inputMode="tel"
                              aria-invalid={phoneError ? 'true' : 'false'}
                              aria-describedby={phoneError ? 'phone-error' : undefined}
                              className={`w-full pl-11 sm:pl-12 pr-4 py-3 sm:py-4 rounded-xl sm:rounded-2xl bg-gray-50 dark:bg-gray-900/50 border focus:ring-2 focus:ring-[#f58c55] outline-none font-medium text-sm sm:text-base ${phoneError ? 'border-red-500' : 'border-gray-100 dark:border-gray-700'}`}
                              placeholder="e.g. 08012345678"
                            />
                          </div>
                          {phoneError && <p id="phone-error" className="text-sm text-red-600 dark:text-red-400">{phoneError}</p>}
                        </div>
                      </div>

                      <div className="space-y-1.5 sm:space-y-2">
                        <label className="text-[10px] sm:text-sm font-bold text-gray-500 ml-1 uppercase tracking-wider">Email Address</label>
                        <div className="relative group">
                          <FaEnvelope className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-orange-500 transition-colors text-sm sm:text-base" />
                          <input
                            type="email"
                            required
                            value={customerInfo.email}
                            onChange={(e) => setCustomerInfo({...customerInfo, email: e.target.value})}
                            className="w-full pl-11 sm:pl-12 pr-4 py-3 sm:py-4 rounded-xl sm:rounded-2xl bg-gray-50 dark:bg-gray-900/50 border border-gray-100 dark:border-gray-700 focus:ring-2 focus:ring-[#f58c55] outline-none font-medium text-sm sm:text-base"
                            placeholder="e.g. john@example.com"
                          />
                        </div>
                      </div>

                      {deliveryOption === 'delivery' && (
                        <div className="space-y-1.5 sm:space-y-2">
                          <label className="text-[10px] sm:text-sm font-bold text-gray-500 ml-1 uppercase tracking-wider">Delivery Address</label>
                          <div className="relative group">
                            <FaTruck className="absolute left-4 top-4 text-gray-400 group-focus-within:text-orange-500 transition-colors text-sm sm:text-base" />
                            <textarea
                              required
                              value={customerInfo.address}
                              onChange={(e) => setCustomerInfo({...customerInfo, address: e.target.value})}
                              className="w-full pl-11 sm:pl-12 pr-4 py-3 sm:py-4 rounded-xl sm:rounded-2xl bg-gray-50 dark:bg-gray-900/50 border border-gray-100 dark:border-gray-700 focus:ring-2 focus:ring-[#f58c55] outline-none font-medium resize-none min-h-25 sm:min-h-30 text-sm sm:text-base"
                              placeholder="Tell us exactly where to bring your order..."
                            />
                          </div>
                        </div>
                      )}
                    </form>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Right Column: Order Summary & Ads */}
          <div className="space-y-6 lg:sticky lg:top-28">
            <div className="bg-white dark:bg-gray-800 rounded-2xl sm:rounded-3xl shadow-xl border border-gray-100 dark:border-gray-800 overflow-hidden">
              <div className="p-5 sm:p-8 space-y-5 sm:space-y-6">
                <h2 className="text-xl sm:text-2xl font-bold flex items-center space-x-2">
                  <FaReceipt className="text-[#f58c55] text-lg sm:text-xl" />
                  <span>Order Summary</span>
                </h2>

                {/* Service Mode Selection */}
                <div className="space-y-3">
                  <p className="text-[10px] sm:text-sm font-bold text-gray-500 uppercase tracking-widest">Service Mode</p>
                  <div className="grid grid-cols-2 gap-3">
                    <button 
                      onClick={() => setDeliveryOption('pickup')}
                      className={`py-2.5 sm:py-3 rounded-xl border-2 font-bold flex flex-col items-center space-y-1 transition-all cursor-pointer ${deliveryOption === 'pickup' ? 'border-[#f58c55] bg-orange-50 text-[#f58c55] dark:bg-orange-900/20' : 'border-gray-100 dark:border-gray-700 text-gray-500'}`}
                    >
                      <FaStore className="text-sm sm:text-base" />
                      <span className="text-[10px] sm:text-xs">Pickup</span>
                    </button>
                    <button 
                      onClick={() => setDeliveryOption('delivery')}
                      className={`py-2.5 sm:py-3 rounded-xl border-2 font-bold flex flex-col items-center space-y-1 transition-all cursor-pointer ${deliveryOption === 'delivery' ? 'border-[#f58c55] bg-orange-50 text-[#f58c55] dark:bg-orange-900/20' : 'border-gray-100 dark:border-gray-700 text-gray-500'}`}
                    >
                      <FaTruck className="text-sm sm:text-base" />
                      <span className="text-[10px] sm:text-xs">Delivery</span>
                    </button>
                  </div>
                </div>

                {deliveryOption === 'delivery' && (
                  <div className="space-y-2">
                    <p className="text-[10px] sm:text-sm font-bold text-gray-500 uppercase tracking-widest">Delivery Zone</p>
                    <select
                      value={selectedZoneId}
                      onChange={(e) => setSelectedZoneId(e.target.value)}
                      className="w-full px-3 sm:px-4 py-2.5 sm:py-3 rounded-xl bg-gray-50 dark:bg-gray-900/50 border border-gray-100 dark:border-gray-700 font-bold text-xs sm:text-sm outline-none focus:ring-2 focus:ring-[#f58c55]/20 cursor-pointer"
                    >
                      {deliveryZones.map(zone => (
                        <option key={zone.id} value={zone.id}>{zone.name} (+₦{zone.fee.toLocaleString()})</option>
                      ))}
                    </select>
                  </div>
                )}

                <div className="space-y-3 sm:space-y-4 pt-4 border-t border-gray-100 dark:border-gray-700">
                  <div className="flex justify-between text-gray-500 font-medium text-sm sm:text-base">
                    <span>Subtotal</span>
                    <span>₦{subtotal.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between text-gray-500 font-medium text-sm sm:text-base">
                    <span>Delivery Fee</span>
                    <span>{deliveryOption === 'pickup' ? 'Free (Pickup)' : `₦${deliveryFee.toLocaleString()}`}</span>
                  </div>
                  <div className="flex justify-between items-center pt-4 border-t border-gray-100 dark:border-gray-700">
                    <span className="text-lg sm:text-xl font-bold">Total</span>
                    <span className="text-xl sm:text-2xl font-extrabold text-[#f58c55]">₦{totalWithFees.toLocaleString()}</span>
                  </div>
                </div>

                <SafeErrorDisplay error={orderError || paymentError || errorMessage} />

                {checkoutStep === 'review' ? (
                  <button 
                    onClick={() => setCheckoutStep('info')}
                    className="w-full bg-[#f58c55] hover:bg-[#f47a45] text-white py-4 sm:py-5 rounded-2xl font-extrabold text-base sm:text-lg transition-all shadow-lg shadow-orange-500/30 flex items-center justify-center space-x-2 sm:space-x-3 cursor-pointer"
                  >
                    <span>Proceed to Payment</span>
                    <FaCheckCircle className="text-sm sm:text-base" />
                  </button>
                ) : (
                  <button 
                    form="customer-info-form"
                    disabled={isLoading || orderLoading || paymentLoading}
                    className="w-full bg-green-500 hover:bg-green-600 text-white py-4 sm:py-5 rounded-2xl font-extrabold text-base sm:text-lg transition-all shadow-lg shadow-green-500/30 flex items-center justify-center space-x-2 sm:space-x-3 disabled:opacity-50 cursor-pointer disabled:cursor-not-allowed"
                  >
                    <FaCreditCard className="text-sm sm:text-base" />
                    <span>{isLoading || orderLoading || paymentLoading ? 'Processing...' : 'Pay Now'}</span>
                  </button>
                )}

                <button 
                  onClick={handleDownloadSummary}
                  className="w-full bg-purple-50 dark:bg-purple-900/20 text-purple-600 dark:text-purple-400 py-3 sm:py-4 rounded-xl sm:rounded-2xl font-bold text-xs sm:text-sm flex items-center justify-center space-x-2 border border-purple-100 dark:border-purple-800 hover:bg-purple-100 transition-all cursor-pointer"
                >
                  <FaDownload className="text-xs sm:text-sm" />
                  <span>Download Summary (PNG)</span>
                </button>
              </div>
            </div>

            {/* Sidebar Ad (Always Visible on Desktop) */}
            <div className="hidden lg:block bg-white dark:bg-gray-800 rounded-3xl p-2 shadow-sm border border-gray-100 dark:border-gray-800">
              <DistributedAds location="checkout_page" position={0} className="rounded-2xl" />
            </div>
          </div>
        </div>

        {/* Hidden capture area for PNG summary */}
        <div id="cart-summary-capture" className="fixed left-[-9999px] bg-white p-10 w-150 rounded-3xl border">
          <div className="flex justify-between items-center border-b pb-6 mb-6">
            <h1 className="text-3xl font-bold text-orange-500">Flamingo Order</h1>
            <p className="text-gray-400 font-bold">{new Date().toLocaleDateString()}</p>
          </div>
          <div className="space-y-4">
            {items.map(item => (
              <div key={item.id} className="flex justify-between border-b pb-4">
                <span className="font-bold text-lg">{item.name} x{item.quantity} {item.isGift ? '(FREE GIFT)' : ''}</span>
                <span className="font-bold text-lg text-gray-700">₦{(item.price * item.quantity).toLocaleString()}</span>
              </div>
            ))}
          </div>
          <div className="mt-8 pt-6 border-t-2 border-orange-500 space-y-2">
            <div className="flex justify-between text-xl font-extrabold">
              <span>Grand Total</span>
              <span className="text-[#f58c55]">₦{totalWithFees.toLocaleString()}</span>
            </div>
            <p className="text-sm text-gray-400 font-bold uppercase tracking-widest mt-4">Thank you for choosing Flamingo!</p>
          </div>
        </div>
      </main>
    </div>
  );
}
