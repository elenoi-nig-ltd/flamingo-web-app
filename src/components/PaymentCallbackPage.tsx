'use client';

import React, { useEffect, useState, useRef } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { useCart } from '@/hooks/useCart';
import { motion, AnimatePresence } from 'framer-motion';
import {
  CheckCircle,
  XCircle,
  AlertCircle,
  Download,
  ArrowLeft,
  ShoppingBag,
  Calendar,
  User,
  Receipt,
} from 'lucide-react';
import { toPng } from 'html-to-image';
import axios from 'axios';
import { BASEURL } from '@/config/api/contants';
interface PendingOrder {
  orderId: string;
  items: Array<{
    product: string;
    name: string;
    quantity: number;
  }>;
  totalAmount: number;
  status: string;
  customerInfo: {
    name: string;
    email: string;
    phone: string;
  };
  orderType: string;
  redirectUrl: string;
  reference: string;               // Paystack reference (formerly tx_ref)
  deliveryOption?: 'pickup' | 'delivery';
  deliveryAddress?: string;
}

const PaymentCallbackPage = () => {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { clearCart } = useCart();
  const receiptRef = useRef<HTMLDivElement>(null);

const [paymentStatus, setPaymentStatus] = useState<{
  success: boolean;
  message: string;
  order?: PendingOrder | null;
} | null>(null);

  const [loading, setLoading] = useState(true);
  const [downloading, setDownloading] = useState(false);

  // --------------------------------------------------------------
  // 1. Retrieve pending order from storage
  // --------------------------------------------------------------
  const getPendingOrder = (): PendingOrder | null => {
    try {
      const session = sessionStorage.getItem('pendingOrder');
      if (session) return JSON.parse(session);
      const local = localStorage.getItem('pendingOrder');
      if (local) return JSON.parse(local);
      return null;
    } catch (e) {
      console.error('Parse pending order failed', e);
      return null;
    }
  };

  // --------------------------------------------------------------
  // 2. Cleanup storage (including order_{reference} key)
  // --------------------------------------------------------------
  const cleanupStorage = (reference?: string) => {
    try {
      sessionStorage.removeItem('pendingOrder');
      localStorage.removeItem('pendingOrder');
      if (reference) {
        localStorage.removeItem(`order_${reference}`);
      }
    } catch (e) {
      console.error('Cleanup error', e);
    }
  };

  // --------------------------------------------------------------
  // 3. Verify payment with backend (Paystack reference)
  // --------------------------------------------------------------
  const verifyPayment = async (reference: string): Promise<boolean> => {
    try {
      const response = await axios.get(`${BASEURL}/payments/verify/${encodeURIComponent(reference)}`);
      return response.data?.status === 'completed';
    } catch (err) {
      console.error('Backend verification failed', err);
      return false;
    }
  };

  // --------------------------------------------------------------
  // 4. Text & Image Receipt (unchanged)
  // --------------------------------------------------------------
  const downloadTextReceipt = () => {
    if (!paymentStatus?.order) return;
    const o = paymentStatus.order;
    const date = new Date().toLocaleString();

    const txt = `
Order Receipt
===============================
Order ID: ${o.orderId}
Transaction Ref: ${o.reference}
Date: ${date}
Status: ${o.status.toUpperCase()}
Type: ${o.orderType}

Customer
--------
Name: ${o.customerInfo.name}
Email: ${o.customerInfo.email}
Phone: ${o.customerInfo.phone}

Items
-----
${o.items.map((i, idx) => `${idx + 1}. ${i.name} × ${i.quantity}`).join('\n')}

TOTAL: ₦${o.totalAmount.toLocaleString()}
    `.trim();

    const blob = new Blob([txt], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `receipt-${o.orderId}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const downloadImageReceipt = async () => {
    if (!receiptRef.current || !paymentStatus?.order) return;
    setDownloading(true);
    try {
      const el = receiptRef.current;
      el.style.position = 'absolute';
      el.style.left = '0';
      el.style.top = '0';
      el.style.display = 'block';
      el.style.opacity = '1';
      el.style.zIndex = '10000';
      await new Promise(r => setTimeout(r, 50));

      const dataUrl = await toPng(el, {
        backgroundColor: '#fff8f0',
        quality: 1,
        pixelRatio: 2,
        style: { margin: '0', padding: '20px', boxShadow: 'none', border: '1px solid #fed7aa' },
      });

      const a = document.createElement('a');
      a.href = dataUrl;
      a.download = `receipt-${paymentStatus.order.orderId}.png`;
      a.click();

      el.style.display = 'none';
    } catch (e) {
      console.error(e);
      downloadTextReceipt();
    } finally {
      setDownloading(false);
    }
  };

  // --------------------------------------------------------------
  // 5. Main effect – Paystack callback logic
  // --------------------------------------------------------------
  useEffect(() => {
    const run = async () => {
      // Paystack redirects with ?reference=xxxxx
      const reference = searchParams.get('reference');
      const pending = getPendingOrder();

      if (!reference) {
        setPaymentStatus({ success: false, message: 'No payment reference found.' });
        setLoading(false);
        return;
      }

      const verified = await verifyPayment(reference);

      if (verified) {
        // SUCCESS
        if (pending) {
          clearCart();
          cleanupStorage(reference);
          setPaymentStatus({
            success: true,
            message: 'Payment successful! Your order is being prepared.',
            order: { ...pending, reference, status: 'completed' },
          });
        } else {
          setPaymentStatus({ success: true, message: 'Payment verified, but order details missing.' });
        }
      } else {
        // FAILURE
        cleanupStorage(reference);
        setPaymentStatus({
          success: false,
          message: 'Payment failed. Please try again.',
          order: pending,
        });
      }

      setLoading(false);
    };

    if (loading) run();
  }, [searchParams, loading, clearCart]);

  const handleBackToMenu = () => {
    const url = paymentStatus?.order?.redirectUrl || '/food';
    router.push(url);
  };

  // --------------------------------------------------------------
  // 6. Render
  // --------------------------------------------------------------
  return (
    <div className="min-h-screen mt-20 bg-gradient-to-br from-orange-50 via-white to-orange-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 flex items-center justify-center p-4">
      {/* Hidden Printable Receipt */}
      <div
        ref={receiptRef}
        className="fixed left-[-9999px] top-0 w-[430px] bg-white p-8 rounded-xl border border-orange-200 shadow-xl overflow-hidden"
        style={{ display: 'none', opacity: 0, zIndex: -1 }}
      >
        {paymentStatus?.order && (
          <>
            <div className="absolute inset-0 pointer-events-none opacity-5">
              <div
                className="absolute inset-0"
                style={{
                  backgroundImage: `url('/assets/images/logo.png')`,
                  backgroundRepeat: 'repeat',
                  backgroundSize: '70px',
                }}
              />
            </div>

            <div className="relative text-gray-800 font-sans">
              {/* Logo */}
              <div className="flex justify-center mb-6">
                <div
                  className="bg-white p-6 rounded-xl shadow-md border border-orange-200"
                  style={{
                    backgroundImage: `url('/assets/images/logo.png')`,
                    backgroundRepeat: 'no-repeat',
                    backgroundPosition: 'center',
                    backgroundSize: 'contain',
                    width: '100%',
                    maxWidth: '280px',
                    height: '140px',
                  }}
                />
              </div>

              {/* Header */}
              <div className="text-center mb-6 border-b-2 border-[#f58c55] pb-4">
                <div className="flex items-center justify-center gap-3 mb-3">
                  {paymentStatus.success ? (
                    <CheckCircle className="w-12 h-12 text-[#f58c55]" />
                  ) : (
                    <XCircle className="w-12 h-12 text-red-600" />
                  )}
                  <h1 className="text-2xl font-bold tracking-wide text-[#f58c55]">
                    {paymentStatus.success ? 'PAYMENT SUCCESSFUL' : 'PAYMENT FAILED'}
                  </h1>
                </div>
                <div className="flex items-center justify-center gap-2 text-gray-600">
                  <Calendar className="w-4 h-4 text-[#f58c55]" />
                  <span className="text-sm font-medium">{new Date().toLocaleString()}</span>
                </div>
              </div>

              {/* Customer Info */}
              <div className="mb-5">
                <h3 className="font-bold text-lg mb-2 flex items-center gap-2 border-b border-[#f58c55]/30 pb-1 text-[#f58c55]">
                  <User className="w-5 h-5 text-[#f58c55]" />
                  CUSTOMER INFORMATION
                </h3>
                <div className="space-y-1 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Name:</span>
                    <span className="font-semibold">{paymentStatus.order.customerInfo.name}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Email:</span>
                    <span className="font-semibold">{paymentStatus.order.customerInfo.email}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Phone:</span>
                    <span className="font-semibold">{paymentStatus.order.customerInfo.phone}</span>
                  </div>
                  {paymentStatus.order.deliveryOption === 'delivery' && paymentStatus.order.deliveryAddress && (
                    <div className="pt-2 border-t border-gray-200">
                      <span className="text-gray-600 block mb-1">Delivery Address:</span>
                      <span className="font-semibold block">{paymentStatus.order.deliveryAddress}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Order Details */}
              <div className="mb-5">
                <h3 className="font-bold text-lg mb-2 flex items-center gap-2 border-b border-[#f58c55]/30 pb-1 text-[#f58c55]">
                  <ShoppingBag className="w-5 h-5 text-[#f58c55]" />
                  ORDER DETAILS
                </h3>
                <div className="space-y-1 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Order ID:</span>
                    <span className="font-semibold">{paymentStatus.order.orderId}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Transaction Ref:</span>
                    <span className="font-semibold text-xs break-all">
                      {paymentStatus.order.reference}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Order Type:</span>
                    <span className="font-semibold capitalize">{paymentStatus.order.orderType}</span>
                  </div>
                  {paymentStatus.order.deliveryOption && (
                    <div className="flex justify-between">
                      <span className="text-gray-600">Delivery:</span>
                      <span className="font-semibold capitalize">{paymentStatus.order.deliveryOption}</span>
                    </div>
                  )}
                  <div className="flex justify-between">
                    <span className="text-gray-600">Items Count:</span>
                    <span className="font-semibold">{paymentStatus.order.items.length} item(s)</span>
                  </div>
                </div>
              </div>

              {/* Items List */}
              <div className="mb-5">
                <h3 className="font-bold text-lg mb-2 border-b border-[#f58c55]/30 pb-1 text-[#f58c55]">
                  ORDER ITEMS
                </h3>
                <div className="space-y-2">
                  {paymentStatus.order.items.map((item, index) => (
                    <div key={index} className="flex justify-between text-sm bg-orange-50 p-2 rounded">
                      <span className="font-medium">{item.name}</span>
                      <span className="text-[#f58c55] font-semibold">Qty: {item.quantity}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Total */}
              <div className="mt-6 pt-4 border-t-2 border-[#f58c55] bg-orange-50 p-4 rounded-lg">
                <div className="flex justify-between items-center">
                  <span className="text-xl font-bold text-[#f58c55]">TOTAL AMOUNT:</span>
                  <span className="text-2xl font-bold text-[#f58c55]">
                    ₦{paymentStatus.order.totalAmount.toLocaleString()}
                  </span>
                </div>
              </div>

              {/* Footer */}
              <div className="mt- alternate text-center">
                <div className="flex justify-center mb-4">
                  <div
                    className="bg-[#f58c55] p-4 rounded-full shadow-lg"
                    style={{
                      backgroundImage: `url('/assets/images/logo.png')`,
                      backgroundRepeat: 'no-repeat',
                      backgroundPosition: 'center',
                      backgroundSize: 'contain',
                      width: '100px',
                      height: '100px',
                    }}
                  />
                </div>
                <p className="text-sm font-bold text-[#f58c55]">
                  Thank you for your {paymentStatus.success ? 'order' : 'patience'}!
                </p>
                <p className="text-xs text-gray-600 mt-1">
                  Support: Order ID <span className="font-bold text-[#f58c55]">{paymentStatus.order.orderId}</span>
                </p>
              </div>
            </div>
          </>
        )}
      </div>

      {/* Main UI */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="bg-white/95 dark:bg-gray-800/95 backdrop-blur-lg p-8 rounded-3xl shadow-2xl border border-orange-200 dark:border-orange-700 w-full max-w-2xl relative overflow-hidden"
      >
        <div className="absolute inset-0 bg-gradient-to-br from-orange-50/30 via-transparent to-orange-50/30 pointer-events-none"></div>

        <h1 className="text-4xl font-bold mb-8 text-center text-[#f58c55]">
          Order Status
        </h1>

        <AnimatePresence>
          {loading ? (
            <motion.div className="text-center py-12">
              <div className="w-12 h-12 border-4 border-[#f58c55] border-t-transparent rounded-full animate-spin mx-auto mb-4" />
              <p className="text-lg text-gray-700 dark:text-gray-300">Verifying payment...</p>
            </motion.div>
          ) : paymentStatus?.success ? (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-gradient-to-br from-orange-50 to-white dark:from-orange-900/10 dark:to-gray-800 border border-orange-200 dark:border-orange-700 rounded-3xl p-8 mb-8"
            >
              <div className="flex items-center justify-center gap-4 mb-6">
                <div className="w-16 h-16 bg-[#f58c55] rounded-full flex items-center justify-center shadow-lg">
                  <CheckCircle className="w-8 h-8 text-white" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-[#f58c55]">Payment Successful!</p>
                  <p className="text-sm text-gray-600">Order confirmed</p>
                </div>
              </div>
              <p className="text-center text-gray-700 dark:text-gray-300 mb-6">{paymentStatus.message}</p>

              {paymentStatus.order && (
                <div className="bg-white dark:bg-gray-800 rounded-2xl border border-orange-100 dark:border-orange-700 p-6">
                  <div className="flex items-center justify-center mb-6">
                    <ShoppingBag className="w-6 h-6 text-[#f58c55] mr-3" />
                    <h3 className="text-xl font-bold text-[#f58c55]">Order Details</h3>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                    <div className="p-3 bg-orange-50 dark:bg-orange-900/20 rounded-lg">
                      <span className="text-gray-600 block">Order ID:</span>
                      <span className="font-bold text-[#f58c55]">{paymentStatus.order.orderId}</span>
                    </div>
                    <div className="p-3 bg-orange-50 dark:bg-orange-900/20 rounded-lg">
                      <span className="text-gray-600 block">Customer:</span>
                      <span className="font-bold text-[#f58c55]">{paymentStatus.order.customerInfo.name}</span>
                    </div>
                    <div className="p-3 bg-orange-50 dark:bg-orange-900/20 rounded-lg">
                      <span className="text-gray-600 block">Email:</span>
                      <span className="font-medium">{paymentStatus.order.customerInfo.email}</span>
                    </div>
                    <div className="p-3 bg-orange-100 dark:bg-orange-800/40 rounded-lg">
                      <span className="text-gray-600 block font-bold">Total:</span>
                      <span className="font-bold text-2xl text-[#f58c55]">
                        ₦{paymentStatus.order.totalAmount.toLocaleString()}
                      </span>
                    </div>
                    {paymentStatus.order.deliveryOption && (
                      <div className="p-3 bg-orange-50 dark:bg-orange-900/20 rounded-lg">
                        <span className="text-gray-600 block">Delivery:</span>
                        <span className="font-bold text-[#f58c55] capitalize">{paymentStatus.order.deliveryOption}</span>
                      </div>
                    )}
                    {paymentStatus.order.deliveryOption === 'delivery' && paymentStatus.order.deliveryAddress && (
                      <div className="p-3 bg-orange-50 dark:bg-orange-900/20 rounded-lg md:col-span-2">
                        <span className="text-gray-600 block mb-1">Delivery Address:</span>
                        <span className="font-medium text-gray-800 dark:text-gray-200">{paymentStatus.order.deliveryAddress}</span>
                      </div>
                    )}
                  </div>

                  <div className="mt-5 p-4 bg-orange-50 dark:bg-orange-900/20 rounded-xl">
                    <p className="text-sm font-semibold text-[#f58c55] mb-2">Items Ordered</p>
                    <div className="space-y-2">
                      {paymentStatus.order.items.map((item, i) => (
                        <div key={i} className="flex justify-between text-sm">
                          <span>{item.name}</span>
                          <span className="font-medium text-[#f58c55]">Qty: {item.quantity}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="flex gap-3 mt-6">
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={downloadTextReceipt}
                      className="flex-1 px-6 py-3 bg-gray-600 hover:bg-gray-700 text-white rounded-xl font-bold transition-all duration-300 flex items-center justify-center gap-2 shadow-md"
                    >
                      <Download className="w-4 h-4" />
                      Text Receipt
                    </motion.button>

                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={downloadImageReceipt}
                      disabled={downloading}
                      className="flex-1 px-6 py-3 bg-[#f58c55] hover:bg-orange-600 text-white rounded-xl font-bold transition-all duration-300 flex items-center justify-center gap-2 shadow-md disabled:opacity-50"
                    >
                      <Receipt className="w-4 h-4" />
                      {downloading ? 'Generating...' : 'Image Receipt'}
                    </motion.button>
                  </div>
                </div>
              )}
            </motion.div>
          ) : (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-gradient-to-br from-red-50 to-orange-50 dark:from-red-900/20 dark:to-orange-900/20 border border-red-200 dark:border-red-700 rounded-3xl p-8 mb-8"
            >
              <div className="flex items-center justify-center gap-4 mb-6">
                <div className="w-16 h-16 bg-red-500 rounded-full flex items-center justify-center shadow-lg">
                  <XCircle className="w-8 h-8 text-white" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-red-700">Payment Failed</p>
                  <p className="text-sm text-red-600">Please try again</p>
                </div>
              </div>
              <p className="text-center text-gray-700 dark:text-gray-300 mb-6">{paymentStatus?.message}</p>

              {paymentStatus?.order && (
                <div className="bg-white dark:bg-gray-800 rounded-2xl border border-red-100 p-6">
                  <div className="flex items-center justify-center mb-6">
                    <AlertCircle className="w-6 h-6 text-red-500 mr-3" />
                    <h3 className="text-xl font-bold text-red-700">Order Reference</h3>
                  </div>
                  <div className="grid grid-cols-2 gap-4 mb-6">
                    <div className="p-3 bg-red-50 rounded-lg">
                      <span className="text-sm text-gray-600 block">Order ID:</span>
                      <span className="font-bold text-red-700">{paymentStatus.order.orderId}</span>
                    </div>
                    <div className="p-3 bg-red-50 rounded-lg">
                      <span className="text-sm text-gray-600 block">Transaction:</span>
                      <span className="font-bold text-red-700 text-xs break-all">
                        {paymentStatus.order.reference}
                      </span>
                    </div>
                  </div>

                  <div className="flex gap-3">
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={downloadTextReceipt}
                      className="flex-1 px-6 py-3 bg-gray-600 hover:bg-gray-700 text-white rounded-xl font-bold transition-all duration-300 flex items-center justify-center gap-2 shadow-md"
                    >
                      <Download className="w-4 h-4" />
                      Text Receipt
                    </motion.button>

                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={downloadImageReceipt}
                      disabled={downloading}
                      className="flex-1 px-6 py-3 bg-[#f58c55] hover:bg-orange-600 text-white rounded-xl font-bold transition-all duration-300 flex items-center justify-center gap-2 shadow-md disabled:opacity-50"
                    >
                      <Receipt className="w-4 h-4" />
                      {downloading ? 'Generating...' : 'Image Receipt'}
                    </motion.button>
                  </div>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>

        <div className="flex justify-center pt-6">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleBackToMenu}
            className="px-8 py-4 bg-[#f58c55] hover:bg-orange-600 text-white rounded-2xl font-bold shadow-lg transition-all duration-300 flex items-center gap-3 text-lg"
          >
            <ArrowLeft className="w-5 h-5" />
            Back to{' '}
            <span className="capitalize">
              {paymentStatus?.order?.orderType === 'home-items' ? 'Home Items' : 'Menu'}
            </span>
          </motion.button>
        </div>
      </motion.div>
    </div>
  );
};

export default PaymentCallbackPage;
