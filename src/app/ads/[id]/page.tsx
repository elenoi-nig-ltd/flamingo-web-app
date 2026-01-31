'use client';

import React, { useEffect, useState, Suspense } from 'react';
import { useParams, useRouter } from 'next/navigation';
import axios from 'axios';
import { BASEURL } from '@/config/api/contants';
import Image from 'next/image';
import { FaArrowLeft, FaPhone, FaEnvelope, FaMapMarkerAlt, FaSpinner, FaExternalLinkAlt } from 'react-icons/fa';
import { motion } from 'framer-motion';

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

export default function AdDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const adId = params.id as string;
  
  const [ad, setAd] = useState<Advertisement | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchAdDetails();
  }, [adId]);

  const fetchAdDetails = async () => {
    try {
      setLoading(true);
      setError('');
      const response = await axios.get(`${BASEURL}/advertisements/${adId}`);
      setAd(response.data);
      
      // Track ad view
      try {
        await axios.post(`${BASEURL}/advertisements/${adId}/click`);
      } catch (err) {
        console.error('Failed to track click:', err);
      }
    } catch (err: any) {
      console.error('Error fetching ad details:', err);
      setError('Failed to load advertisement details. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleVisitWebsite = () => {
    if (ad?.targetUrl) {
      window.open(ad.targetUrl, '_blank', 'noopener,noreferrer');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center">
        <div className="text-center">
          <FaSpinner className="animate-spin text-[#f58c55] text-4xl mb-4 mx-auto" />
          <p className="text-gray-600 dark:text-gray-300 text-lg">Loading advertisement...</p>
        </div>
      </div>
    );
  }

  if (error || !ad) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
        <div className="container mx-auto px-4 py-8">
          <button
            onClick={() => router.back()}
            className="flex items-center gap-2 text-[#f58c55] hover:text-[#e67e4a] mb-6 font-semibold transition-colors"
          >
            <FaArrowLeft size={20} />
            Go Back
          </button>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-8 text-center"
          >
            <p className="text-gray-600 dark:text-gray-300 text-lg mb-4">
              {error || 'Advertisement not found'}
            </p>
            <button
              onClick={() => router.back()}
              className="bg-[#f58c55] text-white px-8 py-3 rounded-lg font-semibold hover:bg-[#e67e4a] transition-colors"
            >
              Go Back
            </button>
          </motion.div>
        </div>
      </div>
    );
  }

  return (
    <Suspense>
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 py-8">
      <div className="container mx-auto px-4 max-w-4xl">
        {/* Back Button */}
        <button
          onClick={() => router.back()}
          className="flex items-center gap-2 text-[#f58c55] hover:text-[#e67e4a] mb-8 font-semibold transition-colors"
        >
          <FaArrowLeft size={20} />
          Go Back
        </button>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="bg-white dark:bg-gray-800 rounded-xl shadow-xl overflow-hidden"
        >
          {/* Ad Image */}
          <div className="relative w-full h-96 bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-700 dark:to-gray-600">
            <Image
              src={ad.imageUrl}
              alt={ad.title}
              fill
              className="object-contain p-6"
              priority
              onError={(e) => {
                const img = e.target as HTMLImageElement;
                img.src = '/assets/placeholder-ad.png';
              }}
            />
          </div>

          {/* Content */}
          <div className="p-6 md:p-8">
            {/* Title */}
            <h1 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-2">
              {ad.title}
            </h1>
            <p className="text-[#f58c55] font-semibold mb-6">by {ad.companyName}</p>

            {/* Description */}
            <div className="mb-8">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">
                About This Advertisement
              </h2>
              <p className="text-gray-700 dark:text-gray-300 leading-relaxed text-lg">
                {ad.description}
              </p>
            </div>

            {/* Info Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8 p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
              {/* Contact Email */}
              <div className="flex items-start gap-4">
                <FaEnvelope className="text-[#f58c55] mt-1 flex-shrink-0" size={20} />
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400 font-semibold">Email</p>
                  <a
                    href={`mailto:${ad.contactEmail}`}
                    className="text-[#f58c55] hover:text-[#e67e4a] font-medium break-all"
                  >
                    {ad.contactEmail}
                  </a>
                </div>
              </div>

              {/* Contact Phone */}
              <div className="flex items-start gap-4">
                <FaPhone className="text-[#f58c55] mt-1 flex-shrink-0" size={20} />
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400 font-semibold">Phone</p>
                  <a
                    href={`tel:${ad.contactPhone}`}
                    className="text-[#f58c55] hover:text-[#e67e4a] font-medium"
                  >
                    {ad.contactPhone}
                  </a>
                </div>
              </div>

              {/* Location */}
              {ad.location && (
                <div className="flex items-start gap-4">
                  <FaMapMarkerAlt className="text-[#f58c55] mt-1 flex-shrink-0" size={20} />
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400 font-semibold">Location</p>
                    <p className="text-gray-900 dark:text-white font-medium">{ad.location}</p>
                  </div>
                </div>
              )}

              {/* Duration */}
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400 font-semibold mb-1">
                  Duration
                </p>
                <p className="text-gray-900 dark:text-white font-medium">
                  {ad.duration} {ad.duration === 1 ? 'day' : 'days'}
                </p>
              </div>
            </div>

            {/* Additional Info */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
              <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
                <p className="text-sm text-gray-600 dark:text-gray-400 font-semibold mb-1">
                  Ad Reference
                </p>
                <p className="text-lg font-bold text-blue-600 dark:text-blue-400">{ad.adReference}</p>
              </div>

              <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800">
                <p className="text-sm text-gray-600 dark:text-gray-400 font-semibold mb-1">
                  Price
                </p>
                <p className="text-lg font-bold text-green-600 dark:text-green-400">
                  ₦{ad.totalPrice?.toLocaleString()}
                </p>
              </div>

              <div className="p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg border border-purple-200 dark:border-purple-800">
                <p className="text-sm text-gray-600 dark:text-gray-400 font-semibold mb-1">
                  Status
                </p>
                <p className="text-lg font-bold text-purple-600 dark:text-purple-400 capitalize">
                  {ad.status}
                </p>
              </div>
            </div>

            {/* CTA Button */}
            <motion.button
              onClick={handleVisitWebsite}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="w-full bg-gradient-to-r from-[#f58c55] to-[#ff9a6d] text-white py-4 px-6 rounded-lg font-bold text-lg flex items-center justify-center gap-2 hover:shadow-lg transition-all duration-300"
            >
              Visit Website <FaExternalLinkAlt size={18} />
            </motion.button>

            {/* Ad Reference Info */}
            <p className="text-center text-sm text-gray-500 dark:text-gray-400 mt-6">
              Ad Reference: <span className="font-mono font-semibold">{ad.adReference}</span>
            </p>
          </div>
        </motion.div>
      </div>
    </div>
    </Suspense>
  );
}
