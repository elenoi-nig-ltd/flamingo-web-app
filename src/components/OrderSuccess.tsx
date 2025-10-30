// components/OrderSuccess.tsx
'use client';

import React, { useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import html2canvas from 'html2canvas';

interface Product {
  _id: string;
  name: string;
  price: number;
  images?: string[];
}

interface OrderItem {
  product: Product | string;
  quantity: number;
  _id?: string;
}

interface Order {
  _id: string;
  userId: string;
  items: OrderItem[];
  totalAmount: number;
  status: string;
  orderDate: string;
  transactionId?: string;
  txRef?: string;
  createdAt?: string;
}

interface OrderSuccessProps {
  order: Order;
}

const OrderSuccess: React.FC<OrderSuccessProps> = ({ order }) => {
  const router = useRouter();
  const orderRef = useRef<HTMLDivElement>(null);
  const [isDownloading, setIsDownloading] = useState(false);

  const downloadOrderAsImage = async () => {
    if (!orderRef.current) return;

    setIsDownloading(true);
    try {
      const canvas = await html2canvas(orderRef.current, {
        backgroundColor: '#ffffff',
        scale: 2,
        useCORS: true,
        logging: false,
      });

      const image = canvas.toDataURL('image/png', 1.0);
      const link = document.createElement('a');
      link.download = `order-receipt-${order._id.slice(-8)}.png`;
      link.href = image;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (error) {
      console.error('Error downloading order as image:', error);
      alert('Failed to download order details. Please try again.');
    } finally {
      setIsDownloading(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getProductName = (item: OrderItem): string => {
    return typeof item.product === 'string' ? 'Product' : item.product.name;
  };

  const getProductPrice = (item: OrderItem): number => {
    return typeof item.product === 'string' ? 0 : item.product.price;
  };

  const calculateItemTotal = (item: OrderItem): number => {
    return getProductPrice(item) * item.quantity;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 py-8 px-4">
      <div className="max-w-2xl mx-auto">
        {/* Order Summary Card - This will be captured as image */}
        <div
          ref={orderRef}
          className="bg-white rounded-xl shadow-lg p-6 mb-6 border border-green-200"
        >
          {/* Header */}
          <div className="text-center mb-6">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h1 className="text-3xl font-bold text-green-600 mb-2">Order Successful!</h1>
            <p className="text-gray-600">Thank you for your order. We're preparing it for you.</p>
          </div>

          {/* Order Details */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6 text-sm">
            <div>
              <span className="font-semibold text-gray-600">Order ID:</span>
              <p className="text-gray-800 font-mono">{order._id}</p>
            </div>
            <div>
              <span className="font-semibold text-gray-600">Order Date:</span>
              <p className="text-gray-800">{formatDate(order.orderDate)}</p>
            </div>
            {order.transactionId && (
              <div>
                <span className="font-semibold text-gray-600">Transaction ID:</span>
                <p className="text-gray-800 font-mono">{order.transactionId}</p>
              </div>
            )}
            {order.txRef && (
              <div>
                <span className="font-semibold text-gray-600">Reference:</span>
                <p className="text-gray-800 font-mono">{order.txRef}</p>
              </div>
            )}
            <div>
              <span className="font-semibold text-gray-600">Status:</span>
              <p className="text-gray-800 capitalize">{order.status}</p>
            </div>
          </div>

          {/* Order Items */}
          <div className="border-t border-b border-gray-200 py-4 mb-4">
            <h2 className="text-lg font-semibold text-gray-800 mb-3">Order Items</h2>
            <div className="space-y-3">
              {order.items.map((item, index) => (
                <div key={index} className="flex justify-between items-center">
                  <div className="flex-1">
                    <p className="font-medium text-gray-800">{getProductName(item)}</p>
                    <p className="text-sm text-gray-600">Qty: {item.quantity} × ${getProductPrice(item).toFixed(2)}</p>
                  </div>
                  <p className="font-medium text-gray-800">
                    ${calculateItemTotal(item).toFixed(2)}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Total */}
          <div className="flex justify-between items-center text-lg font-semibold pt-4 border-t border-gray-200">
            <span className="text-gray-700">Total Amount:</span>
            <span className="text-green-600">${order.totalAmount.toFixed(2)}</span>
          </div>

          {/* Footer Note */}
          <div className="mt-6 pt-4 border-t border-gray-200">
            <p className="text-sm text-gray-600 text-center">
              Please keep this receipt for your records. We'll notify you when your order is ready.
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <button
            onClick={downloadOrderAsImage}
            disabled={isDownloading}
            className="flex items-center justify-center gap-2 bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {isDownloading ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                Downloading...
              </>
            ) : (
              <>
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                Download Receipt
              </>
            )}
          </button>

          <button
            onClick={() => router.push('/food')}
            className="bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 transition-colors"
          >
            Order Again
          </button>

          <button
            onClick={() => router.push('/orders')}
            className="bg-gray-600 text-white px-6 py-3 rounded-lg hover:bg-gray-700 transition-colors"
          >
            View My Orders
          </button>
        </div>

        {/* Additional Info */}
        <div className="mt-8 text-center">
          <p className="text-gray-600 text-sm">
            Need help? <a href="/contact" className="text-blue-600 hover:underline">Contact support</a>
          </p>
        </div>
      </div>
    </div>
  );
};

export default OrderSuccess;