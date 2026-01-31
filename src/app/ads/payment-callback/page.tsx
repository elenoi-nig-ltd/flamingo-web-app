'use client';

import React, { useEffect, useState, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import axios from 'axios';
import { BASEURL } from '@/config/api/contants';


function AdPaymentCallbackPageInner() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState<{ success: boolean; message: string } | null>(null);

  useEffect(() => {
    const verify = async () => {
      const reference = searchParams.get('reference');
      if (!reference) {
        setStatus({ success: false, message: 'No payment reference found.' });
        setLoading(false);
        return;
      }

      try {
        await axios.get(`${BASEURL}/advertisements/verify-payment/${encodeURIComponent(reference)}`);
        setStatus({ success: true, message: 'Payment verified! Your ad is now live.' });
      } catch (err: any) {
        setStatus({ success: false, message: err.response?.data?.message || 'Payment verification failed.' });
      } finally {
        setLoading(false);
      }
    };

    verify();
  }, [searchParams]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <p className="text-gray-600 dark:text-gray-300">Verifying payment...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 px-6">
      <div className="max-w-md w-full bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 text-center">
        <h1 className={`text-2xl font-bold ${status?.success ? 'text-green-600' : 'text-red-500'}`}>
          {status?.success ? 'Payment Successful' : 'Payment Failed'}
        </h1>
        <p className="text-gray-600 dark:text-gray-400 mt-3">{status?.message}</p>
        <button
          onClick={() => router.push('/my-ads')}
          className="mt-6 px-6 py-2 bg-[#f58c55] text-white rounded-lg hover:bg-[#e67e4a] transition"
        >
          Go to My Ads
        </button>
      </div>
    </div>
  );
}

export default function AdPaymentCallbackPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900"><p className="text-gray-600 dark:text-gray-300">Loading...</p></div>}>
      <AdPaymentCallbackPageInner />
    </Suspense>
  );
}
