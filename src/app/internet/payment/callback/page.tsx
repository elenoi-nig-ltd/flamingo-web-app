'use client';

import React, { Suspense } from 'react';
import PaymentCallback from '@/components/internet/payment/PaymentCallback';

// Skeleton Loader Component
const SkeletonLoader = () => {
  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
      <div className="bg-white p-8 rounded-lg shadow-lg w-full max-w-2xl">
        {/* Title Placeholder */}
        <div
          className="skeleton-title"
          style={{
            width: '60%',
            height: '32px',
            background: '#e0e0e0',
            borderRadius: '4px',
            margin: '0 auto 1.5rem',
            animation: 'pulse 1.5s infinite',
          }}
        ></div>
        {/* Message Placeholder */}
        <div
          className="skeleton-message"
          style={{
            width: '100%',
            height: '80px',
            background: '#e0e0e0',
            borderRadius: '8px',
            marginBottom: '1rem',
            animation: 'pulse 1.5s infinite',
          }}
        ></div>
        {/* Button Placeholder */}
        <div
          className="skeleton-button"
          style={{
            width: '150px',
            height: '40px',
            background: '#e0e0e0',
            borderRadius: '4px',
            margin: '0 auto',
            animation: 'pulse 1.5s infinite',
          }}
        ></div>
      </div>
    </div>
  );
};

// CSS for skeleton animation
const skeletonCSS = `
  @keyframes pulse {
    0% {
      opacity: 1;
    }
    50% {
      opacity: 0.5;
    }
    100% {
      opacity: 1;
    }
  }
`;

// Inject skeleton CSS into the document
if (typeof document !== 'undefined') {
  const styleSheet = document.createElement('style');
  styleSheet.textContent = skeletonCSS;
  document.head.appendChild(styleSheet);
}

export const dynamic = 'force-dynamic'; // Opt out of static rendering

const PaymentCallbackPage = () => {
  return (
    <div>
      <Suspense fallback={<SkeletonLoader />}>
        <PaymentCallback />
      </Suspense>
    </div>
  );
};

export default PaymentCallbackPage;

