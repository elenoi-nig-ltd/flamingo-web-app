'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FaSearch, FaSpinner, FaCopy, FaCheck } from 'react-icons/fa';
import { toast } from 'sonner';

const BASEURL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:5000';

interface VerificationResult {
  status: string;
  voucherCode?: string;
  plan?: {
    bundle?: string;
    dataAmount?: number;
    duration?: number;
    price?: number;
  };
  message?: string;
  [key: string]: any;
}

const VoucherVerification = () => {
  const [txId, setTxId] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<VerificationResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [copiedField, setCopiedField] = useState<string | null>(null);

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setResult(null);

    if (!txId.trim()) {
      setError('Please provide a transaction ID');
      return;
    }

    setLoading(true);
    try {
      const res = await fetch(
        `${BASEURL}/internet/public/pay/status/${encodeURIComponent(txId.trim())}`
      );
      const data = await res.json();

      if (!res.ok) {
        setError(data.message || data.error || 'Failed to fetch status');
      } else {
        setResult(data);
        toast.success('Transaction verified successfully');
      }
    } catch (err: any) {
      setError(err?.message || 'Network error. Please try again.');
      toast.error('Failed to verify transaction');
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = (text: string, field: string) => {
    try {
      navigator.clipboard.writeText(text);
      setCopiedField(field);
      toast.success('Copied to clipboard');
      setTimeout(() => setCopiedField(null), 2000);
    } catch (err) {
      console.error('copy failed', err);
      toast.error('Failed to copy');
    }
  };

  return (
    <motion.div
      className="min-h-screen bg-gray-50/50 dark:bg-gray-900/50 p-6"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <div className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm rounded-xl shadow-lg p-8 border border-gray-200/50 dark:border-gray-700/50 max-w-4xl mx-auto">
        <h2 className="text-2xl font-semibold bg-gradient-to-r from-[#f58c55] to-[#f47a45] dark:from-[#f7a16b] dark:to-[#f58c55] bg-clip-text text-transparent mb-6">
          Verify Voucher Purchase
        </h2>

        <p className="text-gray-600 dark:text-gray-400 mb-6">
          Enter a transaction ID (Paystack reference) to verify the voucher purchase status and retrieve details.
        </p>

        {/* Verification Form */}
        <form onSubmit={handleVerify} className="mb-8">
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="flex-1 relative">
              <input
                type="text"
                value={txId}
                onChange={(e) => setTxId(e.target.value)}
                placeholder="Enter transaction ID (e.g., ref_xx1x7vf0it)"
                className="w-full px-4 py-3 pl-10 border border-gray-200/50 dark:border-gray-600/50 rounded-lg bg-white/50 dark:bg-gray-700/50 text-gray-900 dark:text-gray-200 placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#f58c55]/50"
              />
              <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            </div>
            <motion.button
              type="submit"
              disabled={loading || !txId.trim()}
              className="px-6 py-3 bg-gradient-to-r from-[#f58c55] to-[#f47a45] dark:from-[#f7a16b] dark:to-[#f58c55] text-white rounded-lg font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 whitespace-nowrap"
              whileHover={{ scale: loading ? 1 : 1.05 }}
              whileTap={{ scale: loading ? 1 : 0.95 }}
            >
              {loading ? (
                <>
                  <FaSpinner className="animate-spin" />
                  Verifying...
                </>
              ) : (
                'Verify'
              )}
            </motion.button>
          </div>
        </form>

        {/* Error Message */}
        {error && (
          <motion.div
            className="mb-6 p-4 bg-red-50/50 dark:bg-red-900/50 border border-red-200/50 dark:border-red-700/50 rounded-lg text-red-600 dark:text-red-300"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
          >
            {error}
          </motion.div>
        )}

        {/* Result Display */}
        {result && (
          <motion.div
            className="space-y-6"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
          >
            {/* Status Badge */}
            <div className="p-4 bg-gradient-to-r from-green-50/50 to-emerald-50/50 dark:from-green-900/30 dark:to-emerald-900/30 border border-green-200/50 dark:border-green-700/50 rounded-lg">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-600 dark:text-gray-300">Status</span>
                <span className="px-3 py-1 bg-green-500/20 dark:bg-green-500/30 text-green-600 dark:text-green-300 rounded-full text-sm font-semibold">
                  {result.status || 'Verified'}
                </span>
              </div>
            </div>

            {/* Voucher Code */}
            {result.voucherCode && (
              <div className="p-4 bg-gray-50/50 dark:bg-gray-700/50 rounded-lg border border-gray-200/50 dark:border-gray-600/50">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Voucher Code</p>
                    <p className="text-lg font-mono font-bold text-gray-900 dark:text-gray-100">
                      {result.voucherCode}
                    </p>
                  </div>
                  <motion.button
                    type="button"
                    onClick={() => result.voucherCode && handleCopy(result.voucherCode, 'voucherCode')}
                    className={`p-2 rounded-lg transition-all ${
                      copiedField === 'voucherCode'
                        ? 'bg-green-500 text-white'
                        : 'bg-gray-200 dark:bg-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-500'
                    }`}
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    {copiedField === 'voucherCode' ? <FaCheck /> : <FaCopy />}
                  </motion.button>
                </div>
              </div>
            )}

            {/* Plan Details */}
            {result.plan && (
              <div className="p-4 bg-gray-50/50 dark:bg-gray-700/50 rounded-lg border border-gray-200/50 dark:border-gray-600/50">
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-3">Plan Details</p>
                <div className="grid grid-cols-2 gap-4">
                  {result.plan.bundle && (
                    <div>
                      <p className="text-xs text-gray-500 dark:text-gray-400">Bundle</p>
                      <p className="font-semibold text-gray-900 dark:text-gray-100">
                        {result.plan.bundle}
                      </p>
                    </div>
                  )}
                  {result.plan.dataAmount && (
                    <div>
                      <p className="text-xs text-gray-500 dark:text-gray-400">Data Amount</p>
                      <p className="font-semibold text-gray-900 dark:text-gray-100">
                        {result.plan.dataAmount} GB
                      </p>
                    </div>
                  )}
                  {result.plan.duration && (
                    <div>
                      <p className="text-xs text-gray-500 dark:text-gray-400">Duration</p>
                      <p className="font-semibold text-gray-900 dark:text-gray-100">
                        {result.plan.duration} days
                      </p>
                    </div>
                  )}
                  {result.plan.price && (
                    <div>
                      <p className="text-xs text-gray-500 dark:text-gray-400">Price</p>
                      <p className="font-semibold text-gray-900 dark:text-gray-100">
                        ₦{result.plan.price.toLocaleString()}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Raw JSON (collapsible) */}
            <details className="p-4 bg-gray-50/50 dark:bg-gray-700/50 rounded-lg border border-gray-200/50 dark:border-gray-600/50 cursor-pointer">
              <summary className="text-sm font-medium text-gray-600 dark:text-gray-400 select-none">
                Full Response Details
              </summary>
              <pre className="mt-3 text-xs text-gray-700 dark:text-gray-300 overflow-auto bg-gray-900/10 dark:bg-gray-900/50 p-3 rounded">
                {JSON.stringify(result, null, 2)}
              </pre>
            </details>
          </motion.div>
        )}
      </div>
    </motion.div>
  );
};

export default VoucherVerification;
