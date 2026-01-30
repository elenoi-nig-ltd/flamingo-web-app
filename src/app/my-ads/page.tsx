'use client';

import React, { useState } from 'react';
import axios from 'axios';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { BASEURL } from '@/config/api/contants';
import { FaSpinner, FaCheckCircle, FaClock, FaTimesCircle, FaBan, FaCreditCard, FaExclamationCircle, FaSearch } from 'react-icons/fa';

interface Advertisement {
  _id: string;
  title: string;
  description: string;
  imageUrl: string;
  targetUrl: string;
  companyName: string;
  contactEmail: string;
  contactPhone: string;
  location: string;
  duration: number;
  totalPrice: number;
  status: 'pending' | 'approved' | 'active' | 'rejected' | 'expired' | 'paused';
  paymentCompleted: boolean;
  paymentReference?: string;
  amountPaid?: number;
  adReference: string;
  startDate?: string;
  endDate?: string;
  rejectionReason?: string;
  createdAt: string;
}

export default function MyAdsPage() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');
  const [ad, setAd] = useState<Advertisement | null>(null);
  const [ads, setAds] = useState<Advertisement[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [paymentLoading, setPaymentLoading] = useState<string | null>(null);


  const fetchAdBySearch = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    
    if (!searchQuery.trim()) {
      setError('Please enter your ad reference, email, or company name');
      return;
    }

    try {
      setLoading(true);
      setError('');
      setAd(null);
      setAds([]);
      
      const cleanQuery = searchQuery.trim();
      const url = `${BASEURL}/advertisements/search/${encodeURIComponent(cleanQuery)}`;
      console.log('Searching ads from URL:', url);
      console.log('Search query:', cleanQuery);
      
      const response = await axios.get(url);
      
      console.log('Response:', response.data);
      
      if (response.data) {
        // Check if response is array (multiple results) or single object
        if (Array.isArray(response.data)) {
          setAds(response.data);
        } else {
          setAd(response.data);
        }
      } else {
        setError('No advertisements found');
      }
    } catch (err: any) {
      console.error('Error searching ads:', err);
      console.error('Error response:', err.response);
      const errorMessage = typeof err.response?.data?.message === 'string' 
        ? err.response.data.message 
        : 'No advertisements found. Please check your search criteria.';
      setError(errorMessage);
      setAd(null);
      setAds([]);
    } finally {
      setLoading(false);
    }
  };

  const handlePayNow = async (advertisement: Advertisement) => {
    try {
      setPaymentLoading(advertisement._id);
      setError('');
      const response = await axios.post(`${BASEURL}/advertisements/initiate-payment`, {
        adReference: advertisement.adReference,
        contactEmail: advertisement.contactEmail,
      });
      if (response.data?.paymentUrl) {
        window.location.href = response.data.paymentUrl;
      } else {
        throw new Error('Payment link not returned');
      }
    } catch (err: any) {
      console.error('Error initiating payment:', err);
      const errorMessage = typeof err.response?.data?.message === 'string' 
        ? err.response.data.message 
        : err.message || 'Failed to initiate payment';
      setError(errorMessage);
      setPaymentLoading(null);
    }
  };

  const getStatusInfo = (status: string) => {
    const statusMap = {
      pending: {
        icon: <FaClock className="mr-1.5" />,
        color: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400',
        text: 'Pending Review',
        description: 'Your ad is under review. You\'ll be notified once it\'s approved.',
      },
      approved: {
        icon: <FaCheckCircle className="mr-1.5" />,
        color: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400',
        text: 'Approved - Payment Required',
        description: 'Great news! Your ad has been approved. Complete payment to activate it.',
      },
      active: {
        icon: <FaCheckCircle className="mr-1.5" />,
        color: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400',
        text: 'Active',
        description: 'Your ad is live and visible to customers!',
      },
      rejected: {
        icon: <FaTimesCircle className="mr-1.5" />,
        color: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400',
        text: 'Rejected',
        description: 'Your ad was not approved. Please check the rejection reason below.',
      },
      expired: {
        icon: <FaBan className="mr-1.5" />,
        color: 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400',
        text: 'Expired',
        description: 'This ad campaign has ended.',
      },
      paused: {
        icon: <FaBan className="mr-1.5" />,
        color: 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400',
        text: 'Paused',
        description: 'This ad has been paused by an administrator.',
      },
    };

    return statusMap[status as keyof typeof statusMap] || statusMap.pending;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  if (loading && ad === null && ads.length === 0 && !error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50/50 dark:bg-gray-900/50">
        <div className="text-center">
          <FaSpinner className="animate-spin text-4xl text-[#f58c55] dark:text-[#f7a16b] mx-auto mb-4" />
          <p className="text-gray-600 dark:text-gray-300">Searching for your advertisement...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50/50 dark:bg-gray-900/50 font-sans py-10">
      <div className="container mx-auto px-6 max-w-4xl">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-8 text-center"
        >
          <h1 className="text-3xl font-bold bg-gradient-to-r from-[#f58c55] to-[#f47a45] dark:from-[#f7a16b] dark:to-[#f58c55] bg-clip-text text-transparent mb-2">
            Check Advertisement Status
          </h1>
          <p className="text-gray-600 dark:text-gray-300">
            Search by ad reference, email, or company name to check status and make payment
          </p>
        </motion.div>

        {/* Search Form */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm rounded-xl shadow-lg p-6 mb-6 border border-gray-200/50 dark:border-gray-700/50"
        >
          <form onSubmit={fetchAdBySearch} className="space-y-3">
            <div>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Enter ad reference, email, or company name..."
                className="w-full p-4 bg-white/50 dark:bg-gray-700/50 backdrop-blur-sm border rounded-xl focus:outline-none focus:ring-2 focus:ring-[#f58c55]/50 dark:focus:ring-[#f7a16b]/50 transition-all duration-300 text-gray-900 dark:text-gray-200 placeholder-gray-500 dark:placeholder-gray-400 border-gray-200/50 dark:border-gray-600/50"
              />
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                Examples: AD-ML188RYR-3XWM, permaspeanut@gmail.com, or Permas Peanut
              </p>
            </div>
            <motion.button
              type="submit"
              disabled={loading}
              className="w-full px-6 py-4 bg-gradient-to-r from-[#f58c55] to-[#f47a45] dark:from-[#f7a16b] dark:to-[#f58c55] text-white rounded-xl hover:from-[#f47a45] hover:to-[#f58c55] dark:hover:from-[#f58c55] dark:hover:to-[#f7a16b] transition-all duration-300 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center font-semibold"
              whileHover={{ scale: loading ? 1 : 1.02 }}
              whileTap={{ scale: loading ? 1 : 0.98 }}
            >
              {loading ? (
                <>
                  <FaSpinner className="animate-spin mr-2" />
                  Searching...
                </>
              ) : (
                <>
                  <FaSearch className="mr-2" />
                  Search Advertisement
                </>
              )}
            </motion.button>
          </form>
        </motion.div>

        

        {/* Error Message */}
        {error && typeof error === 'string' && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-red-100 dark:bg-red-900/30 border border-red-400 dark:border-red-700 text-red-700 dark:text-red-400 px-4 py-3 rounded-xl mb-6 flex items-start"
          >
            <FaExclamationCircle className="mt-0.5 mr-3 flex-shrink-0" />
            <span>{error}</span>
          </motion.div>
        )}

        {/* Multiple Advertisements Display */}
        {ads.length > 0 && (
          <div>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-6"
            >
              <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-200">
                Found {ads.length} advertisement{ads.length > 1 ? 's' : ''}
              </h2>
              <p className="text-sm text-gray-600 dark:text-gray-300">
                Click on any advertisement to view details and make payment
              </p>
            </motion.div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {ads.map((advertisement, index) => {
                const statusInfo = getStatusInfo(advertisement.status);
                
                return (
                  <motion.div
                    key={advertisement._id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: index * 0.1 }}
                    className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm rounded-xl shadow-lg overflow-hidden border border-gray-200/50 dark:border-gray-700/50 hover:shadow-xl transition-all duration-300"
                  >
                    {/* Image Section */}
                    <div className="relative h-48 overflow-hidden bg-gray-100 dark:bg-gray-700">
                      <img
                        src={advertisement.imageUrl}
                        alt={advertisement.title}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          const target = e.target as HTMLImageElement;
                          target.src = '/assets/placeholder-ad.png';
                        }}
                      />
                      <div className="absolute top-4 right-4">
                        <span className={`inline-flex items-center px-3 py-1.5 rounded-full text-xs font-semibold backdrop-blur-sm ${statusInfo.color}`}>
                          {statusInfo.icon}
                          {statusInfo.text}
                        </span>
                      </div>
                    </div>

                    {/* Content Section */}
                    <div className="p-5">
                      <div className="mb-3">
                        <h3 className="text-lg font-bold text-gray-800 dark:text-gray-200 mb-1">
                          {advertisement.title}
                        </h3>
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          Ref: {advertisement.adReference}
                        </p>
                      </div>

                      <p className="text-sm text-gray-600 dark:text-gray-300 mb-4 line-clamp-2">
                        {advertisement.description}
                      </p>

                      <div className="space-y-2 mb-4 text-sm">
                        <div className="flex justify-between">
                          <span className="text-gray-500 dark:text-gray-400">Company:</span>
                          <span className="text-gray-800 dark:text-gray-200 font-medium">{advertisement.companyName}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-500 dark:text-gray-400">Duration:</span>
                          <span className="text-gray-800 dark:text-gray-200 font-medium">{advertisement.duration} days</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-500 dark:text-gray-400">Total Price:</span>
                          <span className="text-gray-800 dark:text-gray-200 font-bold">₦{advertisement.totalPrice.toLocaleString()}</span>
                        </div>
                        {advertisement.startDate && advertisement.endDate && (
                          <div className="flex justify-between text-xs">
                            <span className="text-gray-500 dark:text-gray-400">Active Period:</span>
                            <span className="text-gray-800 dark:text-gray-200">
                              {formatDate(advertisement.startDate)} - {formatDate(advertisement.endDate)}
                            </span>
                          </div>
                        )}
                      </div>

                      {/* Status-specific messaging */}
                      <div className="mb-4">
                        {advertisement.status === 'pending' && (
                          <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-3 text-xs">
                            <p className="text-yellow-800 dark:text-yellow-400">
                              {statusInfo.description}
                            </p>
                          </div>
                        )}
                        
                        {advertisement.status === 'approved' && !advertisement.paymentCompleted && (
                          <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-3 text-xs">
                            <p className="text-blue-800 dark:text-blue-400 font-medium mb-2">
                              🎉 {statusInfo.description}
                            </p>
                            <p className="text-blue-700 dark:text-blue-300">
                              Click "Pay Now" to complete payment and activate your ad.
                            </p>
                          </div>
                        )}
                        
                        {advertisement.status === 'active' && (
                          <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-3 text-xs">
                            <p className="text-green-800 dark:text-green-400 font-medium">
                              ✓ {statusInfo.description}
                            </p>
                          </div>
                        )}
                        
                        {advertisement.status === 'rejected' && (
                          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-3 text-xs">
                            <p className="text-red-800 dark:text-red-400 font-medium mb-1">
                              {statusInfo.description}
                            </p>
                            {advertisement.rejectionReason && (
                              <p className="text-red-700 dark:text-red-300">
                                Reason: {advertisement.rejectionReason}
                              </p>
                            )}
                          </div>
                        )}
                        
                        {advertisement.status === 'expired' && (
                          <div className="bg-gray-50 dark:bg-gray-900/20 border border-gray-200 dark:border-gray-800 rounded-lg p-3 text-xs">
                            <p className="text-gray-800 dark:text-gray-400">
                              {statusInfo.description}
                            </p>
                          </div>
                        )}
                      </div>

                      {/* Action Buttons */}
                      {advertisement.status === 'approved' && !advertisement.paymentCompleted && (
                        <motion.button
                          onClick={() => handlePayNow(advertisement)}
                          disabled={paymentLoading === advertisement._id}
                          className="w-full py-3 bg-gradient-to-r from-[#f58c55] to-[#f47a45] dark:from-[#f7a16b] dark:to-[#f58c55] text-white rounded-xl hover:from-[#f47a45] hover:to-[#f58c55] dark:hover:from-[#f58c55] dark:hover:to-[#f7a16b] transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center font-semibold shadow-lg"
                          whileHover={{ scale: paymentLoading === advertisement._id ? 1 : 1.02 }}
                          whileTap={{ scale: paymentLoading === advertisement._id ? 1 : 0.98 }}
                        >
                          {paymentLoading === advertisement._id ? (
                            <>
                              <FaSpinner className="animate-spin mr-2" />
                              Redirecting...
                            </>
                          ) : (
                            <>
                              <FaCreditCard className="mr-2" />
                              Pay Now (₦{advertisement.totalPrice.toLocaleString()})
                            </>
                          )}
                        </motion.button>
                      )}
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </div>
        )}

        {/* Single Advertisement Display */}
        {ad && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm rounded-xl shadow-lg overflow-hidden border border-gray-200/50 dark:border-gray-700/50"
          >
            {/* Image Section */}
            <div className="relative h-64 overflow-hidden bg-gray-100 dark:bg-gray-700">
              <img
                src={ad.imageUrl}
                alt={ad.title}
                className="w-full h-full object-cover"
                onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  target.src = '/assets/placeholder-ad.png';
                }}
              />
              <div className="absolute top-4 right-4">
                <span className={`inline-flex items-center px-4 py-2 rounded-full text-sm font-semibold backdrop-blur-sm ${getStatusInfo(ad.status).color}`}>
                  {getStatusInfo(ad.status).icon}
                  {getStatusInfo(ad.status).text}
                </span>
              </div>
            </div>

            {/* Content Section */}
            <div className="p-8">
              <div className="mb-6">
                <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-200 mb-2">
                  {ad.title}
                </h2>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Reference: {ad.adReference}
                </p>
              </div>

              <p className="text-gray-600 dark:text-gray-300 mb-6">
                {ad.description}
              </p>

              <div className="grid grid-cols-2 gap-4 mb-6">
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Company</p>
                  <p className="text-gray-800 dark:text-gray-200 font-medium">{ad.companyName}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Duration</p>
                  <p className="text-gray-800 dark:text-gray-200 font-medium">{ad.duration} days</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Total Price</p>
                  <p className="text-gray-800 dark:text-gray-200 font-bold text-lg">₦{ad.totalPrice.toLocaleString()}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Created</p>
                  <p className="text-gray-800 dark:text-gray-200 font-medium">{formatDate(ad.createdAt)}</p>
                </div>
              </div>

              {ad.startDate && ad.endDate && (
                <div className="mb-6 p-4 bg-gray-50 dark:bg-gray-900/20 rounded-lg">
                  <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">Active Period</p>
                  <p className="text-gray-800 dark:text-gray-200 font-medium">
                    {formatDate(ad.startDate)} - {formatDate(ad.endDate)}
                  </p>
                </div>
              )}

              {/* Status-specific messaging */}
              <div className="mb-6">
                {ad.status === 'pending' && (
                  <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4">
                    <p className="text-yellow-800 dark:text-yellow-400 font-medium">
                      {getStatusInfo(ad.status).description}
                    </p>
                  </div>
                )}
                
                {ad.status === 'approved' && !ad.paymentCompleted && (
                  <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
                    <p className="text-blue-800 dark:text-blue-400 font-bold text-lg mb-2">
                      🎉 Great News! Your Ad Has Been Approved
                    </p>
                    <p className="text-blue-700 dark:text-blue-300">
                      Click the "Pay Now" button below to complete your payment via Paystack and activate your advertisement.
                    </p>
                  </div>
                )}
                
                {ad.status === 'active' && (
                  <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4">
                    <p className="text-green-800 dark:text-green-400 font-bold text-lg">
                      ✓ {getStatusInfo(ad.status).description}
                    </p>
                  </div>
                )}
                
                {ad.status === 'rejected' && (
                  <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
                    <p className="text-red-800 dark:text-red-400 font-bold mb-2">
                      {getStatusInfo(ad.status).description}
                    </p>
                    {ad.rejectionReason && (
                      <p className="text-red-700 dark:text-red-300">
                        <span className="font-medium">Reason:</span> {ad.rejectionReason}
                      </p>
                    )}
                  </div>
                )}
                
                {ad.status === 'expired' && (
                  <div className="bg-gray-50 dark:bg-gray-900/20 border border-gray-200 dark:border-gray-800 rounded-lg p-4">
                    <p className="text-gray-800 dark:text-gray-400">
                      {getStatusInfo(ad.status).description}
                    </p>
                  </div>
                )}
              </div>

              {/* Action Button */}
              {ad.status === 'approved' && !ad.paymentCompleted && (
                <motion.button
                  onClick={() => handlePayNow(ad)}
                  disabled={paymentLoading === ad._id}
                  className="w-full py-4 bg-gradient-to-r from-[#f58c55] to-[#f47a45] dark:from-[#f7a16b] dark:to-[#f58c55] text-white rounded-xl hover:from-[#f47a45] hover:to-[#f58c55] dark:hover:from-[#f58c55] dark:hover:to-[#f7a16b] transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center font-bold text-lg shadow-lg"
                  whileHover={{ scale: paymentLoading === ad._id ? 1 : 1.02 }}
                  whileTap={{ scale: paymentLoading === ad._id ? 1 : 0.98 }}
                >
                  {paymentLoading === ad._id ? (
                    <>
                      <FaSpinner className="animate-spin mr-2" />
                      Redirecting to Paystack...
                    </>
                  ) : (
                    <>
                      <FaCreditCard className="mr-2" />
                      Pay Now - ₦{ad.totalPrice.toLocaleString()}
                    </>
                  )}
                </motion.button>
              )}
            </div>
          </motion.div>
        )}

        {/* Help Text */}
        {!ad && !error && ads.length === 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="text-center mt-8"
          >
            <p className="text-gray-500 dark:text-gray-400 mb-4">
              Don't have an advertisement yet?
            </p>
            <motion.button
              onClick={() => router.push('/create-ad')}
              className="px-6 py-3 bg-gradient-to-r from-[#f58c55] to-[#f47a45] dark:from-[#f7a16b] dark:to-[#f58c55] text-white rounded-xl hover:from-[#f47a45] hover:to-[#f58c55] dark:hover:from-[#f58c55] dark:hover:to-[#f7a16b] transition-all duration-300"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              Create New Advertisement
            </motion.button>
          </motion.div>
        )}
      </div>
    </div>
  );
}
