'use client';
import { useState, useEffect } from 'react';
import { usePublicInternet } from '@/hooks/usePublicInternet';
import { useAuth } from '@/hooks/useAuth';
import { BASEURL } from '@/config/api/contants';
import Header from '@/components/Header';
import {
  MdLocationOn,
  MdEmail,
  MdPhone,
  MdWifi,
  MdCheckCircle,
  MdError,
  MdStar,
  MdAccessTime,
  MdStorage,
  MdPerson,
  MdArrowForward
} from 'react-icons/md';
import { motion, AnimatePresence } from 'framer-motion';

// Plan Card component for e-store display
const PlanCard = ({ plan, onPurchase, selectedPlanId, index }: {
  plan: any;
  onPurchase: (planId: string) => void;
  selectedPlanId: string;
  index: number;
}) => (
  <motion.div
    initial={{ opacity: 0, y: 50 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay: index * 0.1, duration: 0.6 }}
    whileHover={{ y: -10, scale: 1.02 }}
    onClick={(e) => e.stopPropagation()}
    className="group bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm rounded-3xl p-6 shadow-2xl border border-[#f58c55]/20 dark:border-[#f58c55]/30 hover:shadow-[#f58c55]/10 hover:border-[#f58c55]/40 dark:hover:border-[#f58c55]/50 overflow-hidden relative"
  >
    <div className={`absolute top-4 right-4 px-3 py-1 rounded-full text-xs font-bold ${
      plan.hasAvailableVouchers 
        ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' 
        : 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
    }`}>
      {plan.hasAvailableVouchers ? 'Available' : 'Sold Out'}
    </div>

    <div className="flex items-start justify-between mb-4">
      <div className="flex items-center gap-3">
        <div className="p-2 bg-gradient-to-br from-[#f58c55] to-[#f47a45] rounded-2xl">
          <MdWifi className="text-white text-2xl" />
        </div>
        <div>
          <h3 className="text-xl font-bold text-gray-800 dark:text-white group-hover:text-[#f58c55] dark:group-hover:text-[#f7a16b] transition-colors">
            {plan.bundle}
          </h3>
          <div className="flex items-center gap-1 text-[#f58c55]/70 dark:text-[#f7a16b]/70">
            <MdStar />
            <MdStar />
            <MdStar />
            <MdStar />
            <MdStar />
          </div>
        </div>
      </div>
      {plan.hasAvailableVouchers ? (
        <MdCheckCircle className="text-green-500 text-3xl" />
      ) : (
        <MdError className="text-red-500 text-3xl" />
      )}
    </div>

    <div className="space-y-4 mb-6">
      <div className="flex items-center gap-3 p-3 bg-[#f58c55]/10 dark:bg-[#f58c55]/20 rounded-xl">
        <MdStorage className="text-[#f58c55] text-xl" />
        <div>
          <p className="text-sm font-medium text-gray-600 dark:text-gray-300">Data Volume</p>
          <p className="text-2xl font-bold text-gray-800 dark:text-white">{plan.dataAmount}GB</p>
        </div>
      </div>
      
      <div className="flex items-center gap-3 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-xl">
        <MdAccessTime className="text-blue-500 text-xl" />
        <div>
          <p className="text-sm font-medium text-gray-600 dark:text-gray-300">Validity</p>
          <p className="text-lg font-semibold text-gray-800 dark:text-white">{plan.duration} days</p>
        </div>
      </div>
      
      <div className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-700/20 rounded-xl">
        <MdLocationOn className="text-gray-500 text-xl" />
        <p className="text-gray-600 dark:text-gray-300">{plan.location.name}</p>
      </div>
    </div>

    <div className="flex items-center justify-between mb-6">
      <div className="text-3xl font-bold bg-gradient-to-r from-[#f58c55] to-[#f47a45] bg-clip-text text-transparent">
        ₦{plan.price}
      </div>
      <div className="text-sm text-gray-500 dark:text-gray-400">
        Per plan
      </div>
    </div>

    {plan.hasAvailableVouchers && (
      <motion.button
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        onClick={(e) => {
          e.stopPropagation();
          console.log('Buy Now clicked for plan:', plan._id);
          onPurchase(plan._id);
        }}
        disabled={selectedPlanId === plan._id}
        className={`relative z-10 w-full py-4 bg-gradient-to-r from-[#f58c55] to-[#f47a45] text-white rounded-2xl font-bold text-lg shadow-lg hover:from-[#f47a45] hover:to-[#e66a3d] transition-all duration-300 flex items-center justify-center gap-2 ${
          selectedPlanId === plan._id ? 'opacity-50 cursor-not-allowed' : 'hover:shadow-[#f58c55]/30'
        }`}
      >
        {selectedPlanId === plan._id ? (
          <>
            <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
            Processing...
          </>
        ) : (
          <>
            Buy Now
            <MdArrowForward className="text-xl" />
          </>
        )}
      </motion.button>
    )}

    <div className="absolute inset-0 bg-gradient-to-t from-[#f58c55]/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
  </motion.div>
);

// Setup Form Component
const SetupForm = ({ 
  locations, 
  selectedLocation, 
  setSelectedLocation, 
  email, 
  setEmail, 
  phoneNumber, 
  setPhoneNumber, 
  onContinue,
  loading,
  user 
}: {
  locations: any[];
  selectedLocation: string;
  setSelectedLocation: (location: string) => void;
  email: string;
  setEmail: (email: string) => void;
  phoneNumber: string;
  setPhoneNumber: (phone: string) => void;
  onContinue: () => void;
  loading: boolean;
  user: any;
}) => {
  const [formErrors, setFormErrors] = useState<{location?: string; email?: string; phone?: string}>({});

  const validateForm = () => {
    const errors: {location?: string; email?: string; phone?: string} = {};
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const phoneRegex = /^\+?[\d\s\-()]{10,}$/;

    if (!selectedLocation) {
      errors.location = 'Please select a location';
    }
    if (!email.trim()) {
      errors.email = 'Email address is required';
    } else if (!emailRegex.test(email.trim())) {
      errors.email = 'Please enter a valid email address';
    }
    if (!phoneNumber.trim()) {
      errors.phone = 'Phone number is required';
    } else if (!phoneRegex.test(phoneNumber.trim())) {
      errors.phone = 'Please enter a valid phone number';
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleContinue = () => {
    if (validateForm()) {
      onContinue();
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-md mx-auto bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm rounded-3xl p-8 shadow-2xl border border-gray-200 dark:border-gray-700"
    >
      <div className="text-center mb-8">
        <div className="w-16 h-16 bg-gradient-to-br from-[#f58c55] to-[#f47a45] rounded-2xl flex items-center justify-center mx-auto mb-4">
          <MdWifi className="text-white text-2xl" />
        </div>
        <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-2">
          Get Started
        </h2>
        <p className="text-gray-600 dark:text-gray-300">
          Please provide your details to view available data plans
        </p>
      </div>

      <div className="mb-6">
        <label className="flex items-center gap-2 text-gray-700 dark:text-gray-300 font-semibold mb-3">
          <MdLocationOn className="text-[#f58c55]" />
          Select Location *
        </label>
        <select
          value={selectedLocation}
          onChange={(e) => {
            setSelectedLocation(e.target.value);
            setFormErrors(prev => ({ ...prev, location: undefined }));
          }}
          className={`w-full p-4 bg-white/50 dark:bg-gray-700/50 backdrop-blur-sm border rounded-2xl focus:outline-none focus:ring-2 focus:ring-[#f58c55] transition-all duration-300 ${
            formErrors.location 
              ? 'border-red-300 dark:border-red-700' 
              : 'border-gray-200 dark:border-gray-600'
          }`}
        >
          <option value="">Choose a location</option>
          {locations.map((location) => (
            <option key={location._id} value={location._id}>
              {location.name} - {location.address}
            </option>
          ))}
        </select>
        {formErrors.location && (
          <p className="text-red-500 text-sm mt-2 flex items-center gap-1">
            <MdError size={16} />
            {formErrors.location}
          </p>
        )}
      </div>

      <div className="mb-6">
        <label className="flex items-center gap-2 text-gray-700 dark:text-gray-300 font-semibold mb-3">
          <MdEmail className="text-[#f58c55]" />
          Email Address *
        </label>
        <div className="relative">
          <input
            type="email"
            value={email}
            onChange={(e) => {
              setEmail(e.target.value);
              setFormErrors(prev => ({ ...prev, email: undefined }));
            }}
            className={`w-full p-4 pl-12 bg-white/50 dark:bg-gray-700/50 backdrop-blur-sm border rounded-2xl focus:outline-none focus:ring-2 focus:ring-[#f58c55] transition-all duration-300 ${
              formErrors.email 
                ? 'border-red-300 dark:border-red-700' 
                : 'border-gray-200 dark:border-gray-600'
            }`}
            placeholder="Enter your email address"
          />
          {user && (
            <motion.div
              initial={{ opacity: 0, scale: 0 }}
              animate={{ opacity: 1, scale: 1 }}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-[#f58c55] text-sm"
            >
              <MdPerson size={18} />
            </motion.div>
          )}
        </div>
        {formErrors.email && (
          <p className="text-red-500 text-sm mt-2 flex items-center gap-1">
            <MdError size={16} />
            {formErrors.email}
          </p>
        )}
        {user && (
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
            Pre-filled from your account. You can change it if needed.
          </p>
        )}
      </div>

      <div className="mb-8">
        <label className="flex items-center gap-2 text-gray-700 dark:text-gray-300 font-semibold mb-3">
          <MdPhone className="text-[#f58c55]" />
          Phone Number *
        </label>
        <input
          type="tel"
          value={phoneNumber}
          onChange={(e) => {
            setPhoneNumber(e.target.value);
            setFormErrors(prev => ({ ...prev, phone: undefined }));
          }}
          className={`w-full p-4 bg-white/50 dark:bg-gray-700/50 backdrop-blur-sm border rounded-2xl focus:outline-none focus:ring-2 focus:ring-[#f58c55] transition-all duration-300 ${
            formErrors.phone 
              ? 'border-red-300 dark:border-red-700' 
              : 'border-gray-200 dark:border-gray-600'
          }`}
          placeholder="+2341234567890"
        />
        {formErrors.phone && (
          <p className="text-red-500 text-sm mt-2 flex items-center gap-1">
            <MdError size={16} />
            {formErrors.phone}
          </p>
        )}
      </div>

      <motion.button
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        onClick={handleContinue}
        disabled={loading}
        className="w-full py-4 bg-gradient-to-r from-[#f58c55] to-[#f47a45] text-white rounded-2xl font-bold text-lg shadow-lg hover:from-[#f47a45] hover:to-[#e66a3d] transition-all duration-300 flex items-center justify-center gap-2"
      >
        {loading ? (
          <>
            <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
            Loading Plans...
          </>
        ) : (
          <>
            View Available Plans
            <MdArrowForward className="text-xl" />
          </>
        )}
      </motion.button>
    </motion.div>
  );
};

export default function Internet() {
  const { locations, plans, loading, error, setError, paymentResponse, fetchPlans, fetchPlansByLocation, initiatePayment } = usePublicInternet();
  const { user } = useAuth();
  const [selectedLocation, setSelectedLocation] = useState('');
  const [email, setEmail] = useState(user?.email || '');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [selectedPlanId, setSelectedPlanId] = useState('');
  const [paymentStatus, setPaymentStatus] = useState<{ success: boolean; voucherCode?: string } | null>(null);
  const [paymentUrl, setPaymentUrl] = useState<string | null>(null);
  const [showPlans, setShowPlans] = useState(false);

  useEffect(() => {
    if (user && user.email) {
      setEmail(user.email);
    }
  }, [user]);

  useEffect(() => {
    fetchPlans();
  }, []);

  // Handle payment callback on page load
  useEffect(() => {
    const handlePaymentCallback = async () => {
      // Check if the URL contains Flutterwave callback parameters
      const urlParams = new URLSearchParams(window.location.search);
      const status = urlParams.get('status');
      const transactionId = urlParams.get('transaction_id') || urlParams.get('tx_ref');

      // Clear query parameters from URL to prevent re-processing
      if (status || transactionId) {
        window.history.replaceState({}, document.title, window.location.pathname);
      }

      if (status && transactionId) {
        console.log(`Handling payment callback: status=${status}, transactionId=${transactionId}`);
        
        try {
          // Fetch payment status
          const res = await fetch(`${BASEURL}/internet/public/pay/status/${transactionId}`, {
            method: 'GET',
            headers: { 'Content-Type': 'application/json' },
          });

          if (res.ok) {
            const data = await res.json();
            console.log('Payment status response:', data);

            if (data.status === 'success' && data.voucherCode) {
              setPaymentStatus({ success: true, voucherCode: data.voucherCode });
              setSelectedPlanId('');
              setError(null);
              // Clear stored payment data
              localStorage.removeItem('pendingOrder');
            } else if (data.status === 'failed') {
              setError('Payment failed. Please try again or contact support.');
              setSelectedPlanId('');
              localStorage.removeItem('pendingOrder');
            }
          } else {
            console.error('Payment status check failed with status:', res.status);
            setError('Error checking payment status. Please try again or contact support.');
            setSelectedPlanId('');
            localStorage.removeItem('pendingOrder');
          }
        } catch (err) {
          console.error('Payment status check error:', err);
          setError('Error checking payment status. Please try again or contact support.');
          setSelectedPlanId('');
          localStorage.removeItem('pendingOrder');
        }
      } else {
        // Restore state from localStorage if available
        const pendingOrder = localStorage.getItem('pendingOrder');
        if (pendingOrder) {
          const parsedOrder = JSON.parse(pendingOrder);
          setSelectedPlanId(parsedOrder.plan?.id || '');
          setEmail(parsedOrder.customerInfo.email);
          setPhoneNumber(parsedOrder.customerInfo.phone);
        }
      }
    };

    handlePaymentCallback();
  }, []);

  const handleContinue = () => {
    if (selectedLocation) {
      fetchPlansByLocation(selectedLocation);
      setShowPlans(true);
    }
  };

  const handleBackToSetup = () => {
    setShowPlans(false);
    setSelectedPlanId('');
    setPaymentStatus(null);
    setPaymentUrl(null);
    setError(null);
  };

  const validateInputs = () => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const phoneRegex = /^\+?[\d\s\-()]{10,}$/;
    
    if (!email.trim()) {
      setError('Email address is required');
      setTimeout(() => setError(null), 5000);
      return false;
    }
    if (!emailRegex.test(email.trim())) {
      setError('Please enter a valid email address (e.g., example@domain.com)');
      setTimeout(() => setError(null), 5000);
      return false;
    }
    if (!phoneNumber.trim()) {
      setError('Phone number is required');
      setTimeout(() => setError(null), 5000);
      return false;
    }
    if (!phoneRegex.test(phoneNumber.trim())) {
      setError('Please enter a valid phone number (e.g., +2341234567890 or 08012345678)');
      setTimeout(() => setError(null), 5000);
      return false;
    }
    return true;
  };

const handlePurchase = async (planId: string) => {
  console.log(`Initiating purchase for plan: ${planId}`);
  if (!validateInputs()) {
    console.log('Validation failed');
    return;
  }

  setSelectedPlanId(planId);
  setError(null);
  setPaymentUrl(null);

  try {
    console.log('Calling initiatePayment with:', { email: email.trim(), phoneNumber: phoneNumber.trim(), planId });
    const response = await initiatePayment(email.trim(), phoneNumber.trim(), planId);
    console.log('Payment initiation response:', response);

    if (response && response.paymentUrl) {
      // Find the selected plan to store its details
      const selectedPlan = plans.find(plan => plan._id === planId);
      if (!selectedPlan) {
        throw new Error('Selected plan not found');
      }

      // Create pendingOrder object - USE transactionId from response
      const pendingOrder = {
        orderId: response.transactionId, // Use the transactionId from payment response
        plan: {
          id: selectedPlan._id,
          bundle: selectedPlan.bundle,
          dataAmount: selectedPlan.dataAmount,
          duration: selectedPlan.duration,
          location: selectedPlan.location.name
        },
        totalAmount: selectedPlan.price,
        status: 'pending',
        customerInfo: {
          name: user?.name || 'Customer',
          email: email.trim(),
          phone: phoneNumber.trim(),
        },
        orderType: 'internet',
        redirectUrl: '/internet',
        tx_ref: response.transactionId, // Use the same transactionId
        // Store voucher code if provided
        voucherCode: response.voucherCode || null
      };

      // Store pendingOrder with transactionId as key
      try {
        localStorage.setItem('pendingOrder', JSON.stringify(pendingOrder));
        localStorage.setItem(`pendingOrder_${response.transactionId}`, JSON.stringify(pendingOrder));
        console.log('Pending order stored:', pendingOrder);
      } catch (storageError) {
        console.error('Failed to store pending order:', storageError);
      }

      // Redirect to payment URL
      window.location.href = response.paymentUrl;
    } else {
      console.error('No paymentUrl in response');
      setError('Failed to initiate payment. Please try again or contact support.');
      setSelectedPlanId('');
    }
  } catch (err) {
    console.error('Payment initiation error:', err);
    setError('An error occurred during payment initiation. Please try again or contact support.');
    setSelectedPlanId('');
  }
};
  return (
    <div className="min-h-screen pt-24 bg-gradient-to-br from-[#f58c55]/10 via-orange-50 to-yellow-50/50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      <Header />
      
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-7xl mx-auto p-4 py-12"
      >
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <h1 className="text-5xl font-bold mb-4 bg-gradient-to-r from-[#f58c55] via-[#f47a45] to-[#f58c55] bg-clip-text text-transparent">
            Data Plans Store
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
            Discover high-speed internet plans with flexible data packages tailored for your needs
          </p>
        </motion.div>

        <AnimatePresence>
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="bg-red-100 dark:bg-red-900/20 border border-red-300 dark:border-red-700 text-red-700 dark:text-red-300 p-6 rounded-2xl mb-8 max-w-4xl mx-auto"
            >
              <div className="flex items-start gap-3">
                <MdError size={24} className="flex-shrink-0 mt-1" />
                <div className="flex-1">
                  <p className="font-semibold mb-2">{error}</p>
                  {paymentUrl && (
                    <div className="mt-4 p-4 bg-white/50 dark:bg-gray-800/50 rounded-xl border border-red-200 dark:border-red-600">
                      <p className="text-sm text-gray-600 dark:text-gray-300 mb-3">
                        Click the button below to complete your payment:
                      </p>
                      <a
                        href={paymentUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-[#f58c55] to-[#f47a45] text-white rounded-xl hover:from-[#f47a45] hover:to-[#e66a3d] transition-all duration-300 font-semibold shadow-lg hover:shadow-[#f58c55]/25"
                      >
                        <MdArrowForward size={20} />
                        Proceed to Payment
                      </a>
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          )}
          {paymentStatus?.success && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-green-100 dark:bg-green-900/20 border border-green-300 dark:border-green-700 text-green-700 dark:text-green-300 p-8 rounded-2xl mb-8 text-center max-w-4xl mx-auto"
            >
              <MdCheckCircle className="text-6xl mx-auto mb-4 text-green-500" />
              <h3 className="text-2xl font-bold mb-4">Payment Successful!</h3>
              <p className="text-lg font-mono">Voucher Code: <strong>{paymentStatus.voucherCode}</strong></p>
              <div className="flex gap-4 justify-center mt-6">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  onClick={() => {
                    setPaymentStatus(null);
                    setSelectedPlanId('');
                  }}
                  className="px-6 py-2 bg-[#f58c55] text-white rounded-xl hover:bg-[#f47a45] transition-colors"
                >
                  Purchase Another Plan
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  onClick={handleBackToSetup}
                  className="px-6 py-2 bg-gray-500 text-white rounded-xl hover:bg-gray-600 transition-colors"
                >
                  Change Location
                </motion.button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {!showPlans ? (
          <SetupForm
            locations={locations}
            selectedLocation={selectedLocation}
            setSelectedLocation={setSelectedLocation}
            email={email}
            setEmail={setEmail}
            phoneNumber={phoneNumber}
            setPhoneNumber={setPhoneNumber}
            onContinue={handleContinue}
            loading={loading}
            user={user}
          />
        ) : (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="max-w-7xl mx-auto"
          >
            <div className="flex items-center justify-between mb-8">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleBackToSetup}
                className="flex items-center gap-2 px-4 py-2 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-xl border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-300 hover:bg-[#f58c55]/5 dark:hover:bg-[#f58c55]/10 transition-colors"
              >
                ← Back to Setup
              </motion.button>
              
              <div className="text-center">
                <h2 className="text-3xl font-bold text-gray-800 dark:text-white flex items-center gap-3 justify-center">
                  <MdWifi className="text-[#f58c55] text-3xl" />
                  Available Data Plans
                </h2>
                <p className="text-gray-600 dark:text-gray-300 mt-2">
                  Location: {locations.find(loc => loc._id === selectedLocation)?.name}
                </p>
              </div>

              <div className="w-24"></div>
            </div>

            {loading ? (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                {[...Array(6)].map((_, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-3xl p-6 animate-pulse"
                  >
                    <div className="h-4 bg-gray-300 dark:bg-gray-600 rounded mb-4 w-3/4"></div>
                    <div className="h-32 bg-gray-300 dark:bg-gray-600 rounded-xl mb-4"></div>
                    <div className="space-y-2">
                      <div className="h-4 bg-gray-300 dark:bg-gray-600 rounded w-1/2"></div>
                      <div className="h-4 bg-gray-300 dark:bg-gray-600 rounded w-2/3"></div>
                    </div>
                    <div className="h-10 bg-gray-300 dark:bg-gray-600 rounded-xl mt-4"></div>
                  </motion.div>
                ))}
              </div>
            ) : plans.length === 0 ? (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="text-center py-16 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-3xl"
              >
                <MdWifi className="text-6xl text-gray-300 dark:text-gray-600 mx-auto mb-4" />
                <h3 className="text-2xl font-bold text-gray-600 dark:text-gray-300 mb-2">
                  No Plans Available
                </h3>
                <p className="text-gray-500 dark:text-gray-400 mb-6">
                  There are no data plans available for the selected location.
                </p>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  onClick={handleBackToSetup}
                  className="px-6 py-2 bg-[#f58c55] text-white rounded-xl hover:bg-[#f47a45] transition-colors"
                >
                  Choose Different Location
                </motion.button>
              </motion.div>
            ) : (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                {plans.map((plan, index) => (
                  <PlanCard
                    key={plan._id}
                    plan={plan}
                    onPurchase={handlePurchase}
                    selectedPlanId={selectedPlanId}
                    index={index}
                  />
                ))}
              </div>
            )}
          </motion.div>
        )}
      </motion.div>
    </div>
  );
}