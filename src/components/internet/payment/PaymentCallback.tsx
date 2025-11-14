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
  RefreshCw,
  Clock,
  HelpCircle,
} from 'lucide-react';
import { toPng } from 'html-to-image';
import { BASEURL } from '@/config/api/contants';

interface PendingOrder {
  orderId: string;
  items?: Array<{
    product: string;
    name: string;
    quantity: number;
  }>;
  plan?: {
    id: string;
    bundle: string;
    dataAmount: string;
    duration: number;
    location: string;
  };
  totalAmount: number;
  status: string;
  customerInfo: {
    name: string;
    email: string;
    phone: string;
  };
  orderType: string;
  redirectUrl: string;
  tx_ref: string;
  voucherCode?: string;
}

interface TransactionStatus {
  status: 'success' | 'failed' | 'pending' | 'abandoned' | 'unknown';
  message: string;
  voucherCode?: string;
  plan?: any;
  timestamp?: string;
}

const PaymentCallbackPage = () => {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { clearCart } = useCart();
  const receiptRef = useRef<HTMLDivElement>(null);

  const [paymentStatus, setPaymentStatus] = useState<{
    success: boolean;
    message: string;
    order?: PendingOrder;
    transactionStatus?: TransactionStatus;
  } | null>(null);

  const [loading, setLoading] = useState(true);
  const [downloading, setDownloading] = useState(false);
  const [hasDownloaded, setHasDownloaded] = useState(false);
  const [retryCount, setRetryCount] = useState(0);
  const [isVerifying, setIsVerifying] = useState(false);
  const [lastChecked, setLastChecked] = useState<Date | null>(null);

  // Enhanced transaction status checking
  const checkTransactionStatus = async (transactionId: string): Promise<TransactionStatus> => {
    try {
      console.log(`Checking transaction status for:`, transactionId);
      
      const res = await fetch(`${BASEURL}/internet/public/pay/status/${transactionId}`, {
        method: 'GET',
        headers: { 
          'Content-Type': 'application/json',
          'Cache-Control': 'no-cache'
        },
      });

      if (!res.ok) {
        throw new Error(`HTTP error! status: ${res.status}`);
      }

      const data = await res.json();
      console.log('Transaction status response:', data);

      return {
        status: data.status,
        message: data.message || '',
        voucherCode: data.voucherCode,
        plan: data.plan,
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      console.error('Error checking transaction status:', error);
      return {
        status: 'unknown',
        message: 'Unable to verify transaction status. Please try again or contact support.',
        timestamp: new Date().toISOString()
      };
    }
  };

  // Get user-friendly status messages
  const getStatusMessage = (status: string): string => {
    const messages: { [key: string]: string } = {
      success: 'Payment completed successfully! Your order has been processed.',
      failed: 'Payment failed. Please check your payment details and try again.',
      pending: 'Payment is being processed. Please wait for confirmation.',
      abandoned: 'Payment was not completed. You can try again when ready.',
      unknown: 'Unable to determine payment status. Please contact support.'
    };
    return messages[status] || 'Payment status unknown.';
  };

  // Enhanced payment verification with comprehensive status checking
  const verifyPaymentWithRetry = async (transactionId: string, maxRetries = 8): Promise<TransactionStatus> => {
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        console.log(`Payment verification attempt ${attempt} for transaction:`, transactionId);
        
        const status = await checkTransactionStatus(transactionId);
        setLastChecked(new Date());
        
        // If we have a definitive status, return it
        if (status.status === 'success' || status.status === 'failed' || status.status === 'abandoned') {
          return status;
        }
        
        // If pending and we have more retries, wait with exponential backoff
        if (attempt < maxRetries) {
          const delay = Math.min(1000 * Math.pow(2, attempt - 1), 15000); // Max 15 seconds
          console.log(`Payment pending, retrying in ${delay}ms...`);
          await new Promise(resolve => setTimeout(resolve, delay));
        }
      } catch (error) {
        console.error(`Verification attempt ${attempt} failed:`, error);
        if (attempt === maxRetries) {
          return {
            status: 'unknown',
            message: 'Verification failed after multiple attempts. Please contact support.',
            timestamp: new Date().toISOString()
          };
        }
        // Wait before retry on error too
        await new Promise(resolve => setTimeout(resolve, 2000 * attempt));
      }
    }
    
    return {
      status: 'pending',
      message: 'Payment is still being processed. You can check back later or contact support if this persists.',
      timestamp: new Date().toISOString()
    };
  };

  // Check if transaction might be abandoned (no activity for 30 minutes)
  const checkForAbandonedTransaction = (pendingOrder: PendingOrder): boolean => {
    try {
      const orderTimestamp = parseInt(pendingOrder.orderId.split('-').pop() || '0');
      if (orderTimestamp) {
        const orderTime = new Date(orderTimestamp);
        const thirtyMinutesAgo = new Date(Date.now() - 30 * 60 * 1000);
        return orderTime < thirtyMinutesAgo;
      }
    } catch (error) {
      console.error('Error checking transaction age:', error);
    }
    return false;
  };

  const getPendingOrder = (): PendingOrder | null => {
    try {
      const sessionOrder = sessionStorage.getItem('pendingOrder');
      if (sessionOrder) return JSON.parse(sessionOrder);
      const localOrder = localStorage.getItem('pendingOrder');
      if (localOrder) return JSON.parse(localOrder);
      return null;
    } catch (error) {
      console.error('Error retrieving pending order:', error);
      return null;
    }
  };

  const cleanupStorage = () => {
    try {
      sessionStorage.removeItem('pendingOrder');
      localStorage.removeItem('pendingOrder');
    } catch (error) {
      console.error('Error cleaning up storage:', error);
    }
  };

  const downloadTextReceipt = () => {
    if (!paymentStatus?.order) return;

    const order = paymentStatus.order;
    const orderDate = new Date().toLocaleString();
    const status = paymentStatus.transactionStatus?.status || 'unknown';

    const orderDetails = `
Order Receipt
===============================

Order ID: ${order.orderId}
Transaction Reference: ${order.tx_ref}
Order Date: ${orderDate}
Status: ${status.toUpperCase()}
Order Type: ${order.orderType}

CUSTOMER INFORMATION
-------------------
Name: ${order.customerInfo.name}
Email: ${order.customerInfo.email}
Phone: ${order.customerInfo.phone}

${order.orderType === 'internet' ? `
INTERNET PLAN DETAILS
-------------------
Plan: ${order.plan?.bundle}
Data Volume: ${order.plan?.dataAmount}GB
Duration: ${order.plan?.duration} days
Location: ${order.plan?.location}
${order.voucherCode ? `Voucher Code: ${order.voucherCode}` : ''}
` : `
ORDER ITEMS
-----------
${order.items?.map((item, index) => 
  `${index + 1}. Product: ${item.name}, Quantity: ${item.quantity}`
).join('\n')}
`}

TOTAL AMOUNT: ₦${order.totalAmount.toLocaleString()}

STATUS: ${status.toUpperCase()}
${paymentStatus.transactionStatus?.message ? `MESSAGE: ${paymentStatus.transactionStatus.message}` : ''}

Thank you for your order!
For support, please contact us with your Order ID.
    `.trim();

    const blob = new Blob([orderDetails], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `order-receipt-${order.orderId}.txt`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const downloadImageReceipt = async () => {
    if (!paymentStatus?.order || !receiptRef.current) return;

    setDownloading(true);
    try {
      const receiptElement = receiptRef.current;
      
      const clone = receiptElement.cloneNode(true) as HTMLDivElement;
      clone.style.position = 'fixed';
      clone.style.left = '0';
      clone.style.top = '0';
      clone.style.display = 'block';
      clone.style.opacity = '1';
      clone.style.zIndex = '10000';
      clone.style.background = '#fff8f0';
      document.body.appendChild(clone);

      const dataUrl = await toPng(clone, {
        backgroundColor: '#fff8f0',
        quality: 1.0,
        pixelRatio: 2,
        width: clone.scrollWidth,
        height: clone.scrollHeight,
        style: {
          transform: 'none',
          margin: '0',
          padding: '20px',
          boxShadow: 'none',
          border: '1px solid #fed7aa',
        },
      });

      const link = document.createElement('a');
      link.download = `order-receipt-${paymentStatus.order.orderId}.png`;
      link.href = dataUrl;
      link.click();

      document.body.removeChild(clone);
    } catch (error) {
      console.error('Error generating image:', error);
      downloadTextReceipt();
    } finally {
      setDownloading(false);
      setHasDownloaded(true);
    }
  };

  const handleManualVerification = async () => {
    const reference = searchParams.get('reference');
    const trxref = searchParams.get('trxref');
    const transactionId = reference || trxref;
    
    if (!transactionId) {
      setPaymentStatus(prev => prev ? {
        ...prev,
        message: 'No transaction ID found. Please contact support with your order details.'
      } : null);
      return;
    }

    setIsVerifying(true);
    try {
      const transactionStatus = await verifyPaymentWithRetry(transactionId, 3);
      setRetryCount(prev => prev + 1);

      const pendingOrder = getPendingOrder();
      
      if (transactionStatus.status === 'success') {
        cleanupStorage();
        if (pendingOrder?.orderType !== 'internet') {
          clearCart();
        }
        setPaymentStatus({
          success: true,
          message: transactionStatus.message,
          order: pendingOrder ? { 
            ...pendingOrder, 
            voucherCode: transactionStatus.voucherCode 
          } : undefined,
          transactionStatus
        });
      } else {
        setPaymentStatus({
          success: false,
          message: transactionStatus.message,
          order: pendingOrder || undefined,
          transactionStatus
        });
      }
    } catch (error) {
      console.error('Manual verification failed:', error);
      setPaymentStatus(prev => prev ? {
        ...prev,
        message: 'Verification failed. Please contact support with your transaction reference.',
        transactionStatus: {
          status: 'unknown',
          message: 'Verification service unavailable.',
          timestamp: new Date().toISOString()
        }
      } : null);
    } finally {
      setIsVerifying(false);
    }
  };

  // Handle Paystack callback with enhanced status checking
  useEffect(() => {
    const processPaymentCallback = async () => {
      const reference = searchParams.get('reference');
      const trxref = searchParams.get('trxref');
      const status = searchParams.get('status');
      const message = searchParams.get('message');
      
      const transactionId = reference || trxref;
      const pendingOrder = getPendingOrder();

      console.log('Payment callback parameters:', {
        reference,
        trxref,
        status,
        message,
        transactionId,
        hasPendingOrder: !!pendingOrder
      });

      // Validate required data
      if (!transactionId || !pendingOrder) {
        setPaymentStatus({
          success: false,
          message: 'Transaction details not found. Please contact support with your payment information.',
          transactionStatus: {
            status: 'unknown',
            message: 'Missing transaction or order data.',
            timestamp: new Date().toISOString()
          }
        });
        setLoading(false);
        return;
      }

      // Check if transaction might be abandoned
      if (checkForAbandonedTransaction(pendingOrder)) {
        cleanupStorage();
        setPaymentStatus({
          success: false,
          message: 'This transaction appears to have been abandoned. Please start a new payment.',
          order: pendingOrder,
          transactionStatus: {
            status: 'abandoned',
            message: 'Transaction was not completed within expected time.',
            timestamp: new Date().toISOString()
          }
        });
        setLoading(false);
        return;
      }

      // Handle different initial statuses
      if (status === 'success' || status === 'completed') {
        console.log('Payment successful, processing order...');
        
        // Non-internet orders: immediate success
        if (pendingOrder.orderType !== 'internet') {
          clearCart();
          cleanupStorage();
          setPaymentStatus({
            success: true,
            message: 'Your payment has been processed successfully and your order is now being prepared.',
            order: pendingOrder,
            transactionStatus: {
              status: 'success',
              message: 'Payment completed successfully.',
              timestamp: new Date().toISOString()
            }
          });
          setLoading(false);
          return;
        }

        // Internet plan: verify voucher via backend
        try {
          setIsVerifying(true);
          const transactionStatus = await verifyPaymentWithRetry(transactionId);
          setRetryCount(prev => prev + 1);

          if (transactionStatus.status === 'success' && transactionStatus.voucherCode) {
            cleanupStorage();
            setPaymentStatus({
              success: true,
              message: transactionStatus.message,
              order: { ...pendingOrder, voucherCode: transactionStatus.voucherCode },
              transactionStatus
            });
          } else {
            setPaymentStatus({
              success: false,
              message: transactionStatus.message,
              order: pendingOrder,
              transactionStatus
            });
          }
        } catch (err) {
          console.error('Error verifying payment:', err);
          setPaymentStatus({
            success: false,
            message: 'Error verifying payment. Please try manual verification or contact support.',
            order: pendingOrder,
            transactionStatus: {
              status: 'unknown',
              message: 'Verification process failed.',
              timestamp: new Date().toISOString()
            }
          });
        } finally {
          setIsVerifying(false);
          setLoading(false);
        }
      }
      else if (status === 'cancelled') {
        cleanupStorage();
        setPaymentStatus({
          success: false,
          message: "Your payment was cancelled. You can try again whenever you're ready.",
          order: pendingOrder,
          transactionStatus: {
            status: 'failed',
            message: 'Payment was cancelled by user.',
            timestamp: new Date().toISOString()
          }
        });
        setLoading(false);
      } else if (status === 'failed') {
        cleanupStorage();
        setPaymentStatus({
          success: false,
          message: message || 'Payment failed. Please check your payment details and try again.',
          order: pendingOrder,
          transactionStatus: {
            status: 'failed',
            message: 'Payment processing failed.',
            timestamp: new Date().toISOString()
          }
        });
        setLoading(false);
      } else {
        // Unknown status - perform comprehensive verification
        try {
          setIsVerifying(true);
          const transactionStatus = await verifyPaymentWithRetry(transactionId, 4);
          
          if (transactionStatus.status === 'success') {
            cleanupStorage();
            if (pendingOrder.orderType !== 'internet') {
              clearCart();
            }
            setPaymentStatus({
              success: true,
              message: transactionStatus.message,
              order: { ...pendingOrder, voucherCode: transactionStatus.voucherCode },
              transactionStatus
            });
          } else {
            setPaymentStatus({
              success: false,
              message: transactionStatus.message,
              order: pendingOrder,
              transactionStatus
            });
          }
        } catch (error) {
          console.error('Error verifying unknown status:', error);
          setPaymentStatus({
            success: false,
            message: "We're having trouble verifying your payment status. Please try again or contact support.",
            order: pendingOrder,
            transactionStatus: {
              status: 'unknown',
              message: 'Status verification unavailable.',
              timestamp: new Date().toISOString()
            }
          });
        } finally {
          setIsVerifying(false);
          setLoading(false);
        }
      }
    };

    if (loading) {
      processPaymentCallback();
    }
  }, [searchParams, loading, clearCart]);

  useEffect(() => {
    if (!loading && paymentStatus?.success && paymentStatus.order && !hasDownloaded) {
      // Auto-download receipt on success
      downloadImageReceipt();
    }
  }, [loading, paymentStatus, hasDownloaded]);

  const handleBackToMenu = () => {
    const redirectUrl = paymentStatus?.order?.redirectUrl || 
                      (paymentStatus?.order?.orderType === 'internet' ? '/internet' : '/menu');
    router.push(redirectUrl);
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'success':
        return <CheckCircle className="w-6 h-6 text-green-600" />;
      case 'failed':
      case 'abandoned':
        return <XCircle className="w-6 h-6 text-red-600" />;
      case 'pending':
        return <Clock className="w-6 h-6 text-orange-500" />;
      default:
        return <HelpCircle className="w-6 h-6 text-gray-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'success':
        return 'text-green-700 bg-green-50 border-green-200';
      case 'failed':
      case 'abandoned':
        return 'text-red-700 bg-red-50 border-red-200';
      case 'pending':
        return 'text-orange-700 bg-orange-50 border-orange-200';
      default:
        return 'text-gray-700 bg-gray-50 border-gray-200';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-orange-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 flex items-center justify-center p-4">
      {/* Hidden Printable Receipt */}
      <div
        ref={receiptRef}
        className="fixed left-[-9999px] top-0 w-[430px] bg-white p-8 rounded-xl border border-orange-200 shadow-xl overflow-hidden"
        style={{ display: 'none', opacity: 0, zIndex: -1 }}
      >
        {/* Receipt content remains the same */}
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

              {/* Transaction Status */}
              {paymentStatus.transactionStatus && (
                <div className="mb-5 p-3 bg-orange-50 rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    {getStatusIcon(paymentStatus.transactionStatus.status)}
                    <span className="font-semibold capitalize">
                      Status: {paymentStatus.transactionStatus.status}
                    </span>
                  </div>
                  <p className="text-sm text-gray-700">
                    {paymentStatus.transactionStatus.message}
                  </p>
                  {paymentStatus.transactionStatus.timestamp && (
                    <p className="text-xs text-gray-500 mt-1">
                      Last checked: {new Date(paymentStatus.transactionStatus.timestamp).toLocaleString()}
                    </p>
                  )}
                </div>
              )}

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
                    <span className="font-semibold text-xs break-all">{paymentStatus.order.tx_ref}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Order Type:</span>
                    <span className="font-semibold capitalize">{paymentStatus.order.orderType}</span>
                  </div>
                </div>
              </div>

              {/* Internet Plan or Items */}
              {paymentStatus.order.orderType === 'internet' && paymentStatus.order.plan ? (
                <div className="mb-5">
                  <h3 className="font-bold text-lg mb-2 border-b border-[#f58c55]/30 pb-1 text-[#f58c55]">
                    INTERNET PLAN DETAILS
                  </h3>
                  <div className="space-y-1 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Plan:</span>
                      <span className="font-semibold">{paymentStatus.order.plan.bundle}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Data Volume:</span>
                      <span className="font-semibold">{paymentStatus.order.plan.dataAmount}GB</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Duration:</span>
                      <span className="font-semibold">{paymentStatus.order.plan.duration} days</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Location:</span>
                      <span className="font-semibold">{paymentStatus.order.plan.location}</span>
                    </div>
                    {paymentStatus.order.voucherCode && (
                      <div className="flex justify-between bg-orange-50 p-2 rounded mt-2">
                        <span className="text-gray-600 font-medium">Voucher Code:</span>
                        <span className="font-bold text-[#f58c55] bg-white px-3 py-1 rounded">{paymentStatus.order.voucherCode}</span>
                      </div>
                    )}
                  </div>
                </div>
              ) : (
                <div className="mb-5">
                  <h3 className="font-bold text-lg mb-2 border-b border-[#f58c55]/30 pb-1 text-[#f58c55]">
                    ORDER ITEMS
                  </h3>
                  <div className="space-y-2">
                    {paymentStatus.order.items?.map((item, index) => (
                      <div key={index} className="flex justify-between text-sm bg-orange-50 p-2 rounded">
                        <span className="font-medium">{item.name}</span>
                        <span className="text-[#f58c55] font-semibold">Qty: {item.quantity}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

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
              <div className="mt-8 text-center">
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
          Payment Status
        </h1>

        <AnimatePresence>
          {loading || isVerifying ? (
            <motion.div className="text-center py-12">
              <div className="w-12 h-12 border-4 border-[#f58c55] border-t-transparent rounded-full animate-spin mx-auto mb-4" />
              <p className="text-lg text-gray-700 dark:text-gray-300">
                {isVerifying ? 'Checking transaction status...' : 'Processing payment...'}
              </p>
              {retryCount > 0 && (
                <p className="text-sm text-gray-500 mt-2">
                  Verification attempt {retryCount}
                </p>
              )}
              {lastChecked && (
                <p className="text-xs text-gray-400 mt-1">
                  Last checked: {lastChecked.toLocaleTimeString()}
                </p>
              )}
            </motion.div>
          ) : paymentStatus ? (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className={`rounded-3xl p-8 mb-8 border ${
                paymentStatus.success 
                  ? 'bg-gradient-to-br from-green-50 to-white border-green-200' 
                  : 'bg-gradient-to-br from-red-50 to-orange-50 border-red-200'
              }`}
            >
              {/* Transaction Status Banner */}
              {paymentStatus.transactionStatus && (
                <div className={`mb-6 p-4 rounded-xl border ${getStatusColor(paymentStatus.transactionStatus.status)}`}>
                  <div className="flex items-center gap-3">
                    {getStatusIcon(paymentStatus.transactionStatus.status)}
                    <div className="flex-1">
                      <h3 className="font-bold text-lg capitalize">
                        {paymentStatus.transactionStatus.status}
                      </h3>
                      <p className="text-sm mt-1">{paymentStatus.transactionStatus.message}</p>
                      {paymentStatus.transactionStatus.timestamp && (
                        <p className="text-xs opacity-75 mt-1">
                          Last updated: {new Date(paymentStatus.transactionStatus.timestamp).toLocaleString()}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              )}

              <div className="flex items-center justify-center gap-4 mb-6">
                <div className={`w-16 h-16 rounded-full flex items-center justify-center shadow-lg ${
                  paymentStatus.success ? 'bg-[#f58c55]' : 'bg-red-500'
                }`}>
                  {paymentStatus.success ? (
                    <CheckCircle className="w-8 h-8 text-white" />
                  ) : (
                    <XCircle className="w-8 h-8 text-white" />
                  )}
                </div>
                <div>
                  <p className={`text-2xl font-bold ${
                    paymentStatus.success ? 'text-[#f58c55]' : 'text-red-700'
                  }`}>
                    {paymentStatus.success ? 'Payment Successful!' : 'Payment Issue'}
                  </p>
                  <p className="text-sm text-gray-600">
                    {paymentStatus.success ? 'Order confirmed' : 'Please check details'}
                  </p>
                </div>
              </div>

              <p className="text-center text-gray-700 dark:text-gray-300 mb-6">
                {paymentStatus.message}
              </p>

              {/* Manual verification for non-success states */}
              {!paymentStatus.success && paymentStatus.transactionStatus?.status !== 'success' && (
                <div className="text-center mb-6">
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={handleManualVerification}
                    disabled={isVerifying}
                    className="px-6 py-3 bg-[#f58c55] hover:bg-orange-600 text-white rounded-xl font-bold transition-all duration-300 flex items-center justify-center gap-2 mx-auto shadow-md disabled:opacity-50"
                  >
                    <RefreshCw className={`w-4 h-4 ${isVerifying ? 'animate-spin' : ''}`} />
                    {isVerifying ? 'Checking...' : 'Check Status Again'}
                  </motion.button>
                  <p className="text-xs text-gray-500 mt-2">
                    Last check: {lastChecked ? lastChecked.toLocaleTimeString() : 'Never'}
                  </p>
                </div>
              )}

              {paymentStatus.order && (
                <div className="bg-white dark:bg-gray-800 rounded-2xl border border-orange-100 dark:border-orange-700 p-6">
                  <div className="flex items-center justify-center mb-6">
                    <ShoppingBag className="w-6 h-6 text-[#f58c55] mr-3" />
                    <h3 className="text-xl font-bold text-[#f58c55]">
                      {paymentStatus.order.orderType === 'internet' ? 'Plan Details' : 'Order Details'}
                    </h3>
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
                  </div>

                  {paymentStatus.order.orderType === 'internet' ? (
                    <div className="mt-5 p-4 bg-gradient-to-r from-[#f58c55] to-orange-600 text-white rounded-xl">
                      <div className="flex justify-between">
                        <span>Plan:</span>
                        <span className="font-bold">{paymentStatus.order.plan?.bundle}</span>
                      </div>
                      <div className="flex justify-between text-sm mt-1">
                        <span>{paymentStatus.order.plan?.dataAmount}GB</span>
                        <span>{paymentStatus.order.plan?.duration} days</span>
                      </div>
                      {paymentStatus.order.voucherCode && (
                        <div className="mt-3 p-3 bg-white/20 rounded-lg text-center">
                          <span className="text-xs font-bold">Voucher Code:</span>
                          <div className="mt-1 bg-white text-[#f58c55] px-4 py-1 rounded font-mono font-bold">
                            {paymentStatus.order.voucherCode}
                          </div>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="mt-4 p-3 bg-orange-50 dark:bg-orange-900/20 rounded-lg text-center">
                      <span className="text-[#f58c55] font-bold">{paymentStatus.order.items?.length || 0} item(s)</span>
                    </div>
                  )}

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
              className="text-center py-12"
            >
              <AlertCircle className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <p className="text-lg text-gray-700 dark:text-gray-300">
                Unable to load payment status.
              </p>
              <button
                onClick={() => window.location.reload()}
                className="mt-4 px-6 py-2 bg-[#f58c55] text-white rounded-lg hover:bg-orange-600 transition-colors"
              >
                Reload Page
              </button>
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
              {paymentStatus?.order?.orderType === 'internet' ? 'Internet Plans' : 'Menu'}
            </span>
          </motion.button>
        </div>
      </motion.div>
    </div>
  );
};

export default PaymentCallbackPage;