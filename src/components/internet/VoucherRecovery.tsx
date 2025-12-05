'use client';

import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import Header from '@/components/Header';
import { useVoucherStorage } from '@/hooks/useVoucherStorage';
import {
  CheckCircle,
  Copy,
  Check,
  Download,
  Share2,
  Calendar,
  Smartphone,
  ArrowLeft,
} from 'lucide-react';
import Link from 'next/link';
import { toPng } from 'html-to-image';
import { useRef } from 'react';

export default function VoucherRecovery() {
  const { voucherDetails, isLoading, clearVoucherDetails } = useVoucherStorage();
  const [copied, setCopied] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [canShare, setCanShare] = useState(false);
  const receiptRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const checkMobile = () => {
      const mobile = window.innerWidth < 768;
      setIsMobile(mobile);
      
      const hasShareAPI = typeof navigator !== 'undefined' && 
                         'share' in navigator && 
                         typeof navigator.share === 'function';
      setCanShare(hasShareAPI);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  const downloadVoucher = async () => {
    if (!receiptRef.current) return;

    setDownloading(true);
    try {
      const dataUrl = await toPng(receiptRef.current, {
        backgroundColor: '#fff8f0',
        quality: 1.0,
        pixelRatio: isMobile ? 2 : 3,
      });

      const link = document.createElement('a');
      link.href = dataUrl;
      link.download = `voucher-${voucherDetails?.code || 'backup'}.png`;
      link.click();
    } catch (error) {
      console.error('Error downloading voucher:', error);
    } finally {
      setDownloading(false);
    }
  };

  const handleShare = async () => {
    if (!voucherDetails) return;
    
    try {
      await navigator.share({
        title: 'My Internet Voucher',
        text: `Voucher Code: ${voucherDetails.code}\nData: ${voucherDetails.plan?.dataAmount}GB\nValidity: ${voucherDetails.plan?.duration} days`,
      });
    } catch (error) {
      console.log('Share cancelled or failed:', error);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-orange-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-[#f58c55] border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-600 dark:text-gray-300">Loading voucher...</p>
        </div>
      </div>
    );
  }

  if (!voucherDetails) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-orange-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
        <Header />
        <div className="flex items-center justify-center min-h-[60vh] px-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white dark:bg-gray-800 p-8 rounded-2xl shadow-xl border border-orange-200 dark:border-orange-700 text-center max-w-md"
          >
            <CheckCircle className="w-16 h-16 mx-auto mb-4 text-gray-400" />
            <h1 className="text-2xl font-bold mb-2 text-gray-800 dark:text-white">
              No Voucher Found
            </h1>
            <p className="text-gray-600 dark:text-gray-300 mb-6">
              It looks like you don't have a saved voucher at the moment. Complete a purchase to get one.
            </p>
            <Link
              href="/internet"
              className="inline-flex items-center gap-2 bg-gradient-to-r from-[#f58c55] to-[#f47a45] text-white px-6 py-3 rounded-xl font-semibold hover:from-[#f47a45] hover:to-[#e66a3d] transition-all"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to Internet Plans
            </Link>
          </motion.div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen mt-10 bg-gradient-to-br from-orange-50 via-white to-orange-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      <Header />
      
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-4xl mx-auto p-4 py-12"
      >
        <div className="grid md:grid-cols-3 gap-6">
          {/* Main Voucher Display */}
          <div className="md:col-span-2">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8 border border-orange-200 dark:border-orange-700"
            >
              <div className="flex items-center gap-3 mb-6">
                <CheckCircle className="w-8 h-8 text-green-500" />
                <h1 className="text-2xl md:text-3xl font-bold text-gray-800 dark:text-white">
                  Your Internet Voucher
                </h1>
              </div>

              {/* Voucher Code Display */}
              <div className="bg-gradient-to-r from-[#f58c55]/10 to-[#f47a45]/10 border-2 border-dashed border-[#f58c55] rounded-xl p-8 mb-8">
                <p className="text-sm font-semibold text-gray-600 dark:text-gray-300 mb-3">
                  Your Voucher Code
                </p>
                <div className="flex items-center justify-between gap-4 bg-white dark:bg-gray-700 p-4 rounded-lg">
                  <code className="text-2xl md:text-3xl font-bold text-[#f58c55] font-mono tracking-widest">
                    {voucherDetails.code}
                  </code>
                  <button
                    onClick={() => copyToClipboard(voucherDetails.code)}
                    className="p-2 hover:bg-gray-100 dark:hover:bg-gray-600 rounded-lg transition-colors"
                  >
                    {copied ? (
                      <Check className="w-5 h-5 text-green-500" />
                    ) : (
                      <Copy className="w-5 h-5 text-gray-600 dark:text-gray-300" />
                    )}
                  </button>
                </div>
                {copied && (
                  <p className="text-xs text-green-600 mt-2">✓ Copied to clipboard</p>
                )}
              </div>

              {/* Plan Details */}
              {voucherDetails.plan && (
                <div className="grid md:grid-cols-2 gap-6 mb-8">
                  <div className="bg-blue-50 dark:bg-blue-900/30 p-4 rounded-lg">
                    <p className="text-sm text-gray-600 dark:text-gray-300 mb-1">Data Volume</p>
                    <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                      {voucherDetails.plan.dataAmount}GB
                    </p>
                  </div>
                  <div className="bg-purple-50 dark:bg-purple-900/30 p-4 rounded-lg">
                    <p className="text-sm text-gray-600 dark:text-gray-300 mb-1">Validity Period</p>
                    <p className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                      {voucherDetails.plan.duration} days
                    </p>
                  </div>
                </div>
              )}

              {/* Order Information */}
              <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg mb-8">
                <p className="text-sm font-semibold text-gray-700 dark:text-gray-200 mb-3">
                  Order Information
                </p>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-300">Order ID:</span>
                    <span className="font-mono font-semibold text-gray-800 dark:text-gray-100">
                      {voucherDetails.orderInfo.orderId}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-300">Email:</span>
                    <span className="font-semibold text-gray-800 dark:text-gray-100">
                      {voucherDetails.orderInfo.email}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-300">Phone:</span>
                    <span className="font-semibold text-gray-800 dark:text-gray-100">
                      {voucherDetails.orderInfo.phone}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-300">Date:</span>
                    <span className="font-semibold text-gray-800 dark:text-gray-100">
                      {new Date(voucherDetails.orderInfo.timestamp).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-3">
                <button
                  onClick={downloadVoucher}
                  disabled={downloading}
                  className="flex items-center justify-center gap-2 bg-gradient-to-r from-[#f58c55] to-[#f47a45] text-white px-6 py-3 rounded-lg font-semibold hover:from-[#f47a45] hover:to-[#e66a3d] transition-all disabled:opacity-50"
                >
                  <Download className="w-4 h-4" />
                  {downloading ? 'Downloading...' : 'Download Voucher'}
                </button>

                {canShare && (
                  <button
                    onClick={handleShare}
                    className="flex items-center justify-center gap-2 bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700 transition-all"
                  >
                    <Share2 className="w-4 h-4" />
                    Share
                  </button>
                )}

                <button
                  onClick={() => clearVoucherDetails()}
                  className="flex items-center justify-center gap-2 bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 px-6 py-3 rounded-lg font-semibold hover:bg-gray-300 dark:hover:bg-gray-600 transition-all"
                >
                  Clear
                </button>
              </div>
            </motion.div>
          </div>

          {/* Sidebar Info */}
          <div className="md:col-span-1">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-6 border border-orange-200 dark:border-orange-700"
            >
              <h2 className="text-lg font-bold text-gray-800 dark:text-white mb-4">
                Quick Tips
              </h2>
              <div className="space-y-4 text-sm">
                <div>
                  <p className="font-semibold text-gray-700 dark:text-gray-200 mb-1">
                    📋 Save Your Code
                  </p>
                  <p className="text-gray-600 dark:text-gray-300">
                    Keep your voucher code safe. You'll need it to activate your plan.
                  </p>
                </div>
                <div>
                  <p className="font-semibold text-gray-700 dark:text-gray-200 mb-1">
                    ⏰ Expiration
                  </p>
                  <p className="text-gray-600 dark:text-gray-300">
                    This voucher expires after {voucherDetails.plan?.duration} days.
                  </p>
                </div>
                <div>
                  <p className="font-semibold text-gray-700 dark:text-gray-200 mb-1">
                    📧 Email Confirmation
                  </p>
                  <p className="text-gray-600 dark:text-gray-300">
                    A confirmation email has been sent to {voucherDetails.orderInfo.email}
                  </p>
                </div>
                <div>
                  <p className="font-semibold text-gray-700 dark:text-gray-200 mb-1">
                    🔄 Back Anytime
                  </p>
                  <p className="text-gray-600 dark:text-gray-300">
                    Your voucher is saved in your browser. Come back anytime to access it.
                  </p>
                </div>
              </div>

              <Link
                href="/internet"
                className="mt-6 w-full flex items-center justify-center gap-2 bg-gradient-to-r from-[#f58c55] to-[#f47a45] text-white px-4 py-3 rounded-lg font-semibold hover:from-[#f47a45] hover:to-[#e66a3d] transition-all"
              >
                <ArrowLeft className="w-4 h-4" />
                Back to Store
              </Link>
            </motion.div>
          </div>
        </div>

        {/* Hidden Receipt for Download */}
        <div
          ref={receiptRef}
          className="fixed left-[-9999px] top-0 w-80 bg-white p-8 rounded-xl overflow-hidden"
        >
          <div className="text-center text-gray-800">
            <h1 className="text-2xl font-bold mb-4 text-[#f58c55]">
              Internet Voucher
            </h1>
            
            <div className="bg-orange-50 border-2 border-dashed border-[#f58c55] p-6 rounded-lg mb-6">
              <p className="text-xs text-gray-600 mb-2">VOUCHER CODE</p>
              <p className="text-3xl font-bold text-[#f58c55] font-mono tracking-widest mb-4">
                {voucherDetails.code}
              </p>
              <p className="text-xs text-gray-500">
                Save this code to activate your plan
              </p>
            </div>

            {voucherDetails.plan && (
              <>
                <div className="bg-gray-50 p-4 rounded-lg mb-6 text-left">
                  <p className="font-bold text-gray-800 mb-3">Plan Details</p>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span>Data:</span>
                      <span className="font-bold">{voucherDetails.plan.dataAmount}GB</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Validity:</span>
                      <span className="font-bold">{voucherDetails.plan.duration} days</span>
                    </div>
                  </div>
                </div>
              </>
            )}

            <p className="text-xs text-gray-600 mt-4">
              Order ID: {voucherDetails.orderInfo.orderId}
            </p>
            <p className="text-xs text-gray-500 mt-2">
              {new Date(voucherDetails.orderInfo.timestamp).toLocaleString()}
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
