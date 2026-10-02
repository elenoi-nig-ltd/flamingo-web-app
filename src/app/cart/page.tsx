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
import { ShoppingBag, ArrowRight, ShieldCheck, Sparkles, Truck, Store, X, Trash2, ArrowLeft, Download, CreditCard, Gift, Clock, AlertCircle } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { usePayments } from '@/hooks/usePayments';
import { useOrders, DeliveryZone } from '@/hooks/useOrders';
import { useAuth } from '@/hooks/useAuth';
import { useCart } from '@/hooks/useCart';
import { toPng } from 'html-to-image';
import DistributedAds from '@/components/advertisements/DistributedAds';
import Header from '@/components/Header';
import { getErrorMessage, NIGERIAN_PHONE_MESSAGE, NIGERIAN_PHONE_PATTERN } from '@/utils/checkout';
import { formatNaira } from '@/lib/format';

// Safe error display component
const SafeErrorDisplay = ({ error }: { error: any }) => {
  if (!error) return null;

  const displayText = getErrorMessage(error, 'An error occurred');

  return (
    <div className="p-4 bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 rounded-2xl flex items-center space-x-3 mt-4">
      <AlertCircle className="text-red-500 shrink-0 h-5 w-5" />
      <p className="text-red-600 dark:text-red-300 text-xs sm:text-sm font-medium">{displayText}</p>
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
        const dataUrl = await toPng(container, { backgroundColor: '#faf7f0', quality: 1.0 });
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
      <div className="min-h-screen bg-[#f8f5e6] dark:bg-gray-900 transition-colors duration-300">
        <Header />
        <div className="pt-28 sm:pt-32 pb-16 px-4 max-w-4xl mx-auto text-center">
          <div className="bg-[#faf7f0] dark:bg-gray-800 rounded-3xl p-8 sm:p-14 shadow-lg border border-[#ede8da] dark:border-gray-700">
            <div className="w-20 h-20 sm:w-24 sm:h-24 bg-[#f58c55]/10 dark:bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-6">
              <ShoppingBag className="text-[#f47a45] h-10 w-10 sm:h-12 sm:w-12" />
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 dark:text-white mb-3">Your cart is empty</h1>
            <p className="text-gray-600 dark:text-gray-400 text-sm sm:text-base mb-8 max-w-md mx-auto leading-relaxed">
              Explore food, drinks, home essentials and properties listed across Minna!
            </p>
            <button 
              onClick={() => router.push('/food')}
              className="bg-[#f58c55] hover:bg-[#f47a45] text-white px-8 sm:px-10 py-3.5 rounded-full font-bold transition-all shadow-md hover:shadow-lg text-sm sm:text-base cursor-pointer"
            >
              Browse Food Menu
            </button>
            
            <div className="mt-12 pt-8 border-t border-[#ede8da] dark:border-gray-700">
              <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-6">Featured Partners</p>
              <div className="max-w-md mx-auto">
                <DistributedAds location="checkout_page" position={0} className="rounded-2xl shadow-sm border border-[#ede8da] dark:border-gray-700" />
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f8f5e6] dark:bg-gray-900 transition-colors duration-300">
      <Header />
      
      <main className="pt-24 sm:pt-28 pb-12 sm:pb-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        {/* Progress Header */}
        <div className="flex items-center space-x-3 sm:space-x-4 mb-6 sm:mb-8">
          <button 
            onClick={() => checkoutStep === 'info' ? setCheckoutStep('review') : router.back()}
            className="p-2.5 sm:p-3 bg-[#faf7f0] dark:bg-gray-800 rounded-2xl border border-[#ede8da] dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:text-[#f47a45] transition-colors cursor-pointer shadow-sm"
          >
            <ArrowLeft className="h-4 w-4 sm:h-5 sm:w-5" />
          </button>
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white leading-tight">Checkout</h1>
            <div className="flex items-center space-x-2 mt-0.5">
              <span className={`text-xs font-bold ${checkoutStep === 'review' ? 'text-[#f47a45]' : 'text-gray-400'}`}>1. Review Cart</span>
              <span className="w-3 h-px bg-gray-300 dark:bg-gray-700"></span>
              <span className={`text-xs font-bold ${checkoutStep === 'info' ? 'text-[#f47a45]' : 'text-gray-400'}`}>2. Delivery Info</span>
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
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="space-y-4"
                >
                  <div className="bg-[#faf7f0] dark:bg-gray-800 rounded-3xl border border-[#ede8da] dark:border-gray-700 overflow-hidden shadow-sm">
                    <div className="p-5 sm:p-6 bg-white dark:bg-gray-800/80 border-b border-[#ede8da] dark:border-gray-700 flex justify-between items-center">
                      <h2 className="text-base sm:text-lg font-bold text-gray-900 dark:text-white">Your Selection ({totalItems} items)</h2>
                      <button onClick={clearCart} className="text-red-500 hover:text-red-600 font-semibold text-xs flex items-center space-x-1.5 cursor-pointer">
                        <Trash2 className="h-3.5 w-3.5" />
                        <span>Clear All</span>
                      </button>
                    </div>

                    {hasFoodItem && (
                      <div className="mx-4 sm:mx-6 mt-4 sm:mt-5 p-4 bg-gradient-to-r from-amber-500 to-orange-500 rounded-2xl text-white flex items-center justify-between shadow-md">
                        <div className="flex items-center space-x-3.5">
                          <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center backdrop-blur-md">
                            <Gift className="h-5 w-5 text-white animate-bounce" />
                          </div>
                          <div>
                            <p className="font-semibold text-[10px] uppercase tracking-wider opacity-90">Food Order Bonus</p>
                            <p className="font-extrabold text-sm sm:text-base">Complimentary Bottled Water Included!</p>
                          </div>
                        </div>
                        <div className="hidden sm:block px-3 py-1.5 bg-white/20 rounded-lg text-xs font-bold backdrop-blur-md border border-white/30">
                          FREE
                        </div>
                      </div>
                    )}

                    {hasFoodItem && (
                      <div className="mx-4 sm:mx-6 mt-3 p-3.5 bg-amber-500/10 border border-amber-200 dark:border-amber-900/30 rounded-2xl flex items-center space-x-3">
                        <Clock className="text-[#f47a45] shrink-0 h-5 w-5" />
                        <div>
                          <p className="text-[#f47a45] text-[10px] font-bold uppercase tracking-wider">Ordering Hours</p>
                          <p className="text-gray-700 dark:text-gray-300 text-xs font-medium">
                            Online food orders close at <span className="font-bold text-[#f47a45]">9:30 PM</span> daily.
                          </p>
                        </div>
                      </div>
                    )}
                    
                    <div className="divide-y divide-[#ede8da] dark:divide-gray-700/60 p-4 sm:p-6 space-y-3">
                      {items.map((item) => (
                        <div key={item.id} className={`pt-3 first:pt-0 flex flex-col sm:flex-row sm:items-center justify-between space-y-3 sm:space-y-0 ${item.isGift ? 'bg-amber-50/50 dark:bg-amber-900/10 p-3 rounded-2xl' : ''}`}>
                          <div className="flex items-center space-x-3.5 flex-1 min-w-0">
                            <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-xl overflow-hidden shrink-0 bg-white dark:bg-gray-700 border border-[#ede8da] dark:border-gray-600">
                              <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center space-x-2 mb-0.5">
                                <h3 className="text-sm sm:text-base font-bold text-gray-900 dark:text-white truncate">{item.name}</h3>
                                {item.isGift && (
                                  <span className="shrink-0 bg-[#f58c55] text-white text-[9px] font-bold px-2 py-0.5 rounded-full flex items-center space-x-1">
                                    <Gift className="h-2.5 w-2.5" />
                                    <span>FREE GIFT</span>
                                  </span>
                                )}
                              </div>
                              <p className={`text-xs sm:text-sm font-extrabold ${item.isGift ? 'text-[#f47a45]' : 'text-[#f47a45]'}`}>
                                {item.isGift ? 'Free Gift' : formatNaira(item.price)}
                              </p>
                            </div>
                          </div>
                          
                          <div className="flex items-center justify-between sm:justify-end sm:space-x-6">
                            {item.isGift ? (
                              <div className="text-xs font-bold text-[#f47a45] bg-amber-50 dark:bg-amber-900/30 px-3 py-1.5 rounded-xl border border-amber-200 dark:border-amber-800">
                                Free Reward
                              </div>
                            ) : (
                              <div className="bg-white dark:bg-gray-700 rounded-xl p-1 flex items-center space-x-2 border border-[#ede8da] dark:border-gray-600">
                                <button 
                                  onClick={() => updateQuantity(item.id, item.quantity - 1)}
                                  className="w-7 h-7 flex items-center justify-center text-gray-600 dark:text-gray-300 hover:text-[#f47a45] rounded-lg"
                                >
                                  <FaMinus className="text-[10px]" />
                                </button>
                                <span className="font-bold text-xs sm:text-sm text-gray-900 dark:text-white min-w-4 text-center">{item.quantity}</span>
                                <button 
                                  onClick={() => updateQuantity(item.id, item.quantity + 1)}
                                  className="w-7 h-7 flex items-center justify-center text-gray-600 dark:text-gray-300 hover:text-[#f47a45] rounded-lg"
                                >
                                  <FaPlus className="text-[10px]" />
                                </button>
                              </div>
                            )}
                            <div className="text-right">
                              <p className="font-extrabold text-gray-900 dark:text-white text-sm sm:text-base">
                                {item.isGift ? 'FREE' : formatNaira(item.price * item.quantity)}
                              </p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Interleaved Ad */}
                  <div className="py-1">
                    <DistributedAds location="checkout_page" position={0} className="rounded-2xl shadow-sm border border-[#ede8da] dark:border-gray-700" />
                  </div>
                </motion.div>
              ) : (
                <motion.div 
                  key="info"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                >
                  <div className="bg-[#faf7f0] dark:bg-gray-800 rounded-3xl border border-[#ede8da] dark:border-gray-700 p-5 sm:p-8 shadow-sm">
                    <h2 className="text-lg sm:text-xl font-bold mb-6 text-gray-900 dark:text-white">Delivery Details</h2>
                    <form id="customer-info-form" onSubmit={handleCustomerSubmit} className="space-y-4 sm:space-y-5">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-1.5">
                          <label className="text-[10px] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider ml-1">Full Name</label>
                          <div className="relative">
                            <FaUser className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 text-xs" />
                            <input
                              type="text"
                              required
                              value={customerInfo.name}
                              onChange={(e) => setCustomerInfo({...customerInfo, name: e.target.value})}
                              className="w-full pl-10 pr-3.5 py-3 rounded-xl bg-white dark:bg-gray-900 border border-[#ede8da] dark:border-gray-700 focus:ring-2 focus:ring-[#f58c55] outline-none font-medium text-xs sm:text-sm text-gray-900 dark:text-white"
                              placeholder="e.g. John Doe"
                            />
                          </div>
                        </div>
                        <div className="space-y-1.5">
                          <label className="text-[10px] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider ml-1">Phone Number (Nigerian)</label>
                          <div className="relative">
                            <FaPhone className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 text-xs" />
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
                              className={`w-full pl-10 pr-3.5 py-3 rounded-xl bg-white dark:bg-gray-900 border focus:ring-2 focus:ring-[#f58c55] outline-none font-medium text-xs sm:text-sm text-gray-900 dark:text-white ${phoneError ? 'border-red-500' : 'border-[#ede8da] dark:border-gray-700'}`}
                              placeholder="e.g. 08012345678"
                            />
                          </div>
                          {phoneError && <p id="phone-error" className="text-xs text-red-600 dark:text-red-400 mt-1">{phoneError}</p>}
                        </div>
                      </div>

                      <div className="space-y-1.5">
                        <label className="text-[10px] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider ml-1">Email Address</label>
                        <div className="relative">
                          <FaEnvelope className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 text-xs" />
                          <input
                            type="email"
                            required
                            value={customerInfo.email}
                            onChange={(e) => setCustomerInfo({...customerInfo, email: e.target.value})}
                            className="w-full pl-10 pr-3.5 py-3 rounded-xl bg-white dark:bg-gray-900 border border-[#ede8da] dark:border-gray-700 focus:ring-2 focus:ring-[#f58c55] outline-none font-medium text-xs sm:text-sm text-gray-900 dark:text-white"
                            placeholder="e.g. john@example.com"
                          />
                        </div>
                      </div>

                      {deliveryOption === 'delivery' && (
                        <div className="space-y-1.5">
                          <label className="text-[10px] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider ml-1">Delivery Address</label>
                          <div className="relative">
                            <Truck className="absolute left-3.5 top-3.5 text-gray-400 h-4 w-4" />
                            <textarea
                              required
                              value={customerInfo.address}
                              onChange={(e) => setCustomerInfo({...customerInfo, address: e.target.value})}
                              className="w-full pl-10 pr-3.5 py-3 rounded-xl bg-white dark:bg-gray-900 border border-[#ede8da] dark:border-gray-700 focus:ring-2 focus:ring-[#f58c55] outline-none font-medium resize-none min-h-[90px] text-xs sm:text-sm text-gray-900 dark:text-white"
                              placeholder="Tell us your lodge or home address in Minna..."
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
            <div className="bg-[#faf7f0] dark:bg-gray-800 rounded-3xl border border-[#ede8da] dark:border-gray-700 overflow-hidden shadow-sm p-5 sm:p-6 space-y-5">
              <h2 className="text-base sm:text-lg font-bold flex items-center space-x-2 text-gray-900 dark:text-white">
                <FaReceipt className="text-[#f47a45]" />
                <span>Order Summary</span>
              </h2>

              {/* Service Mode Selection */}
              <div className="space-y-2">
                <p className="text-[10px] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-widest">Fulfillment Method</p>
                <div className="grid grid-cols-2 gap-2.5">
                  <button 
                    onClick={() => setDeliveryOption('pickup')}
                    className={`py-2.5 px-3 rounded-xl border font-bold flex items-center justify-center space-x-2 transition-all cursor-pointer text-xs ${deliveryOption === 'pickup' ? 'border-[#f58c55] bg-[#f58c55] text-white shadow-md' : 'border-[#ede8da] dark:border-gray-700 bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300'}`}
                  >
                    <Store className="h-4 w-4" />
                    <span>Pickup</span>
                  </button>
                  <button 
                    onClick={() => setDeliveryOption('delivery')}
                    className={`py-2.5 px-3 rounded-xl border font-bold flex items-center justify-center space-x-2 transition-all cursor-pointer text-xs ${deliveryOption === 'delivery' ? 'border-[#f58c55] bg-[#f58c55] text-white shadow-md' : 'border-[#ede8da] dark:border-gray-700 bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300'}`}
                  >
                    <Truck className="h-4 w-4" />
                    <span>Delivery</span>
                  </button>
                </div>
              </div>

              {deliveryOption === 'delivery' && (
                <div className="space-y-1.5">
                  <p className="text-[10px] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-widest">Delivery Zone</p>
                  <select
                    value={selectedZoneId}
                    onChange={(e) => setSelectedZoneId(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-white dark:bg-gray-700 border border-[#ede8da] dark:border-gray-600 font-medium text-xs outline-none focus:ring-2 focus:ring-[#f58c55] text-gray-900 dark:text-white cursor-pointer"
                  >
                    {deliveryZones.map(zone => (
                      <option key={zone.id} value={zone.id}>{zone.name} (+₦{zone.fee.toLocaleString()})</option>
                    ))}
                  </select>
                </div>
              )}

              <div className="space-y-2 pt-3 border-t border-[#ede8da] dark:border-gray-700 text-xs">
                <div className="flex justify-between text-gray-600 dark:text-gray-400 font-medium">
                  <span>Subtotal</span>
                  <span className="font-semibold text-gray-900 dark:text-white">₦{subtotal.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-gray-600 dark:text-gray-400 font-medium">
                  <span>Delivery Fee</span>
                  <span className="font-semibold text-gray-900 dark:text-white">{deliveryOption === 'pickup' ? 'Free' : `₦${deliveryFee.toLocaleString()}`}</span>
                </div>
                <div className="flex justify-between items-center pt-3 border-t border-[#ede8da] dark:border-gray-700">
                  <span className="text-sm font-bold text-gray-900 dark:text-white">Total</span>
                  <span className="text-lg font-extrabold text-[#f47a45]">{formatNaira(totalWithFees)}</span>
                </div>
              </div>

              <SafeErrorDisplay error={orderError || paymentError || errorMessage} />

              {checkoutStep === 'review' ? (
                <button 
                  onClick={() => setCheckoutStep('info')}
                  className="w-full bg-[#f58c55] hover:bg-[#f47a45] text-white py-3.5 rounded-xl font-bold text-sm transition-all shadow-md flex items-center justify-center space-x-2 cursor-pointer"
                >
                  <span>Proceed to Delivery Info</span>
                  <ArrowRight className="h-4 w-4" />
                </button>
              ) : (
                <button 
                  form="customer-info-form"
                  disabled={isLoading || orderLoading || paymentLoading}
                  className="w-full bg-[#f58c55] hover:bg-[#f47a45] text-white py-3.5 rounded-xl font-bold text-sm transition-all shadow-md flex items-center justify-center space-x-2 disabled:opacity-50 cursor-pointer"
                >
                  <CreditCard className="h-4 w-4" />
                  <span>{isLoading || orderLoading || paymentLoading ? 'Processing...' : `Pay ${formatNaira(totalWithFees)}`}</span>
                </button>
              )}

              <button 
                onClick={handleDownloadSummary}
                className="w-full bg-amber-50 dark:bg-amber-900/20 text-[#f47a45] py-2.5 rounded-xl font-bold text-xs flex items-center justify-center space-x-2 border border-amber-200 dark:border-amber-900/40 hover:bg-amber-100 transition-all cursor-pointer"
              >
                <Download className="h-3.5 w-3.5" />
                <span>Download Order Summary</span>
              </button>
            </div>

            {/* Sidebar Ad */}
            <div className="hidden lg:block bg-[#faf7f0] dark:bg-gray-800 rounded-3xl p-2 border border-[#ede8da] dark:border-gray-700">
              <DistributedAds location="checkout_page" position={0} className="rounded-2xl" />
            </div>
          </div>
        </div>

        {/* Hidden capture area for PNG summary */}
        <div id="cart-summary-capture" className="fixed left-[-9999px] bg-[#faf7f0] p-8 w-[500px] rounded-3xl border border-[#ede8da]">
          <div className="flex justify-between items-center border-b border-[#ede8da] pb-4 mb-4">
            <h1 className="text-xl font-bold text-[#f47a45]">Flamingo Order</h1>
            <p className="text-xs font-semibold text-gray-500">{new Date().toLocaleDateString()}</p>
          </div>
          <div className="space-y-3">
            {items.map(item => (
              <div key={item.id} className="flex justify-between border-b border-[#ede8da] pb-2 text-sm">
                <span className="font-semibold">{item.name} x{item.quantity} {item.isGift ? '(FREE GIFT)' : ''}</span>
                <span className="font-bold text-gray-800">{formatNaira(item.price * item.quantity)}</span>
              </div>
            ))}
          </div>
          <div className="mt-6 pt-4 border-t-2 border-[#f58c55] space-y-1">
            <div className="flex justify-between text-base font-extrabold">
              <span>Grand Total</span>
              <span className="text-[#f47a45]">{formatNaira(totalWithFees)}</span>
            </div>
            <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mt-2">Flamingo Marketplace Minna</p>
          </div>
        </div>
      </main>
    </div>
  );
}
