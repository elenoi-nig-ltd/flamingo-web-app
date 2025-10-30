
// app/payment/callback/page.tsx
import { Suspense } from 'react';
import PaymentCallbackPage from '@/components/PaymentCallbackPage'; // Adjust the import path as needed

export default function PaymentCallback() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-gray-800 mb-4">
              Processing Payment...
            </h1>
            <p className="text-gray-600">
              Please wait while we confirm your payment.
            </p>
          </div>
        </div>
      }
    >
      <PaymentCallbackPage />
    </Suspense>
  );
}
