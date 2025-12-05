'use client';

import React, { useEffect, useState, useRef } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { useCart } from '@/hooks/useCart';
import { usePublicInternet } from '@/hooks/usePublicInternet';
import { motion, AnimatePresence } from 'framer-motion';
import Header from '@/components/Header';
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
  Smartphone,
  Share2,
  Copy,
  Check,
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

interface PaymentStatus {
  success: boolean;
  message: string;
  order?: PendingOrder;
  transactionStatus?: TransactionStatus;
}

const PaymentCallbackPage = () => {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { clearCart } = useCart();

  // Use the integrated hook
  const {
    checkTransactionStatus,
    verifyPaymentWithRetry,
    checkForAbandonedTransaction,
    getPendingOrder,
    cleanupPendingOrder,
  } = usePublicInternet();

  const receiptRef = useRef<HTMLDivElement>(null);

  // Component state
  const [paymentStatus, setPaymentStatus] = useState<PaymentStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [downloading, setDownloading] = useState(false);
  const [hasDownloaded, setHasDownloaded] = useState(false);
  const [retryCount, setRetryCount] = useState(0);
  const [isVerifying, setIsVerifying] = useState(false);
  const [lastChecked, setLastChecked] = useState<Date | null>(null);
  const [copied, setCopied] = useState(false);
  const [downloadMethod, setDownloadMethod] = useState<'image' | 'text' | null>(null);
  const [showDownloadOptions, setShowDownloadOptions] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [canShare, setCanShare] = useState(false);

  // If a voucher was previously saved and the user refreshes this page,
  // redirect them to the voucher recovery page so they don't lose access.
  useEffect(() => {
    try {
      if (typeof window === 'undefined') return;
      const stored = sessionStorage.getItem('voucherDetails');
      if (stored) {
        // Replace current history entry so user doesn't loop back here on back
        router.replace('/voucher');
      }
    } catch (err) {
      // ignore storage errors
      console.error('voucher redirect check failed', err);
    }
  }, [router]);

  // Check if mobile and Web Share API support on mount
  useEffect(() => {
    const checkMobile = () => {
      const mobile = window.innerWidth < 768;
      setIsMobile(mobile);
      
      // Check if Web Share API is available
      const hasShareAPI = typeof navigator !== 'undefined' && 
                         'share' in navigator && 
                         typeof navigator.share === 'function';
      setCanShare(hasShareAPI);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Get user-friendly status messages
  const getStatusMessage = (status: string): string => {
    const messages: { [key: string]: string } = {
      success: 'Payment completed successfully! Your order has been processed.',
      failed: 'Payment failed. Please check your payment details and try again.',
      pending: 'Payment is being processed. Please wait for confirmation.',
      abandoned: 'Payment was not completed. You can try again when ready.',
      unknown: 'Unable to determine payment status. Please contact support.',
    };
    return messages[status] || 'Payment status unknown.';
  };

  // Copy text to clipboard
  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  // Helper function for file downloads
  const downloadFile = (content: string, filename: string, type: string, isDataUrl: boolean = false) => {
    let blob;
    if (isDataUrl) {
      // For data URLs
      const arr = content.split(',');
      const mime = arr[0].match(/:(.*?);/)?.[1] || type;
      const bstr = atob(arr[1]);
      let n = bstr.length;
      const u8arr = new Uint8Array(n);
      while (n--) {
        u8arr[n] = bstr.charCodeAt(n);
      }
      blob = new Blob([u8arr], { type: mime });
    } else {
      // For text content
      blob = new Blob([content], { type });
    }
    
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    link.style.display = 'none';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  // Enhanced receipt download with mobile optimization
  const downloadTextReceipt = async () => {
    if (!paymentStatus?.order) return;

    setDownloadMethod('text');
    setDownloading(true);

    try {
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

      // Show loading state briefly for better UX
      await new Promise(resolve => setTimeout(resolve, 500));

      // Check if we can use Web Share API
      if (isMobile && canShare) {
        try {
          const blob = new Blob([orderDetails], { type: 'text/plain' });
          const file = new File([blob], `order-receipt-${order.orderId}.txt`, {
            type: 'text/plain',
          });
          
          // Check if files can be shared
          if (navigator.canShare && navigator.canShare({ files: [file] })) {
            await navigator.share({
              files: [file],
              title: 'Order Receipt',
              text: `Your order receipt for ${order.orderId}`,
            });
            return; // Share successful, don't proceed to download
          }
        } catch (shareError) {
          console.log('Web Share API failed, falling back to download:', shareError);
          // Continue to download fallback
        }
      }
      
      // Fallback to download
      downloadFile(orderDetails, `order-receipt-${order.orderId}.txt`, 'text/plain');
    } catch (error) {
      console.error('Error downloading text receipt:', error);
    } finally {
      setDownloading(false);
      setDownloadMethod(null);
    }
  };

  // Enhanced image receipt download with mobile optimization
  const downloadImageReceipt = async () => {
    if (!paymentStatus?.order || !receiptRef.current) return;

    setDownloadMethod('image');
    setDownloading(true);

    try {
      const receiptElement = receiptRef.current;
      
      // Clone and prepare element for rendering
      const clone = receiptElement.cloneNode(true) as HTMLDivElement;
      clone.style.position = 'fixed';
      clone.style.left = '0';
      clone.style.top = '0';
      clone.style.display = 'block';
      clone.style.opacity = '1';
      clone.style.zIndex = '10000';
      clone.style.background = '#fff8f0';
      clone.style.width = isMobile ? '350px' : '430px';
      clone.style.maxWidth = '90vw';
      clone.style.padding = isMobile ? '16px' : '24px';
      document.body.appendChild(clone);

      // Optimize for mobile screens
      const dataUrl = await toPng(clone, {
        backgroundColor: '#fff8f0',
        quality: 1.0,
        pixelRatio: isMobile ? 2 : 3,
        width: clone.scrollWidth,
        height: clone.scrollHeight,
        style: {
          transform: 'none',
          margin: '0',
          padding: isMobile ? '16px' : '24px',
          boxShadow: 'none',
          border: '1px solid #fed7aa',
          fontSize: isMobile ? '12px' : '14px',
        },
      });

      document.body.removeChild(clone);

      // Show loading state briefly
      await new Promise(resolve => setTimeout(resolve, 500));

      // Check if we can use Web Share API for images
      if (isMobile && canShare) {
        try {
          // Convert data URL to blob for sharing
          const response = await fetch(dataUrl);
          const blob = await response.blob();
          const file = new File([blob], `order-receipt-${paymentStatus.order.orderId}.png`, {
            type: 'image/png',
          });
          
          // Check if files can be shared
          if (navigator.canShare && navigator.canShare({ files: [file] })) {
            await navigator.share({
              files: [file],
              title: 'Order Receipt',
              text: `Your order receipt for ${paymentStatus.order.orderId}`,
            });
            setHasDownloaded(true);
            return; // Share successful, don't proceed to download
          }
        } catch (shareError) {
          console.log('Web Share API failed for image, falling back to download:', shareError);
          // Continue to download fallback
        }
      }
      
      // Fallback to download
      downloadFile(dataUrl, `order-receipt-${paymentStatus.order.orderId}.png`, 'image/png', true);
      setHasDownloaded(true);
    } catch (error) {
      console.error('Error generating image:', error);
      // Fallback to text receipt on error
      downloadTextReceipt();
    } finally {
      setDownloading(false);
      setDownloadMethod(null);
    }
  };

  // Manual verification handler
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
      setLastChecked(new Date());

      const pendingOrder = getPendingOrder();
      
      if (transactionStatus.status === 'success') {
        cleanupPendingOrder();
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
        cleanupPendingOrder();
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
        // Non-internet orders: immediate success
        if (pendingOrder.orderType !== 'internet') {
          clearCart();
          cleanupPendingOrder();
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
          setLastChecked(new Date());

          if (transactionStatus.status === 'success' && transactionStatus.voucherCode) {
            cleanupPendingOrder();
            const successOrder = { ...pendingOrder, voucherCode: transactionStatus.voucherCode };
            
            // Store voucher details in sessionStorage for persistence
            try {
              sessionStorage.setItem(
                'voucherDetails',
                JSON.stringify({
                  code: transactionStatus.voucherCode,
                  plan: transactionStatus.plan,
                  orderInfo: {
                    orderId: pendingOrder.orderId,
                    email: pendingOrder.customerInfo.email,
                    phone: pendingOrder.customerInfo.phone,
                    timestamp: new Date().toISOString(),
                  },
                })
              );
            } catch (error) {
              console.error('Failed to store voucher in sessionStorage:', error);
            }
            
            setPaymentStatus({
              success: true,
              message: transactionStatus.message,
              order: successOrder,
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
        cleanupPendingOrder();
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
        cleanupPendingOrder();
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
          setRetryCount(prev => prev + 1);
          setLastChecked(new Date());
          
          if (transactionStatus.status === 'success') {
            cleanupPendingOrder();
            if (pendingOrder.orderType !== 'internet') {
              clearCart();
            }
            
            const successOrder = { ...pendingOrder, voucherCode: transactionStatus.voucherCode };
            
            // Store voucher details in sessionStorage for persistence
            if (transactionStatus.voucherCode && transactionStatus.plan) {
              try {
                sessionStorage.setItem(
                  'voucherDetails',
                  JSON.stringify({
                    code: transactionStatus.voucherCode,
                    plan: transactionStatus.plan,
                    orderInfo: {
                      orderId: pendingOrder.orderId,
                      email: pendingOrder.customerInfo.email,
                      phone: pendingOrder.customerInfo.phone,
                      timestamp: new Date().toISOString(),
                    },
                  })
                );
              } catch (error) {
                console.error('Failed to store voucher in sessionStorage:', error);
              }
            }
            
            setPaymentStatus({
              success: true,
              message: transactionStatus.message,
              order: successOrder,
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
  }, [searchParams, loading, clearCart, getPendingOrder, cleanupPendingOrder, 
      checkForAbandonedTransaction, verifyPaymentWithRetry]);

  // Auto-download receipt on success (only on desktop)
  useEffect(() => {
    if (!loading && paymentStatus?.success && paymentStatus.order && !hasDownloaded && !isMobile) {
      // Only auto-download on desktop
      downloadImageReceipt();
    }
  }, [loading, paymentStatus, hasDownloaded, isMobile]);

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

  // Handle share action
  const handleShare = async () => {
    if (!paymentStatus?.order) return;
    
    try {
      const shareData = {
        title: 'Order Receipt',
        text: `My order receipt for ${paymentStatus.order.orderId}`,
        url: window.location.href,
      };
      
      await navigator.share(shareData);
    } catch (error) {
      console.log('Share cancelled or failed:', error);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-orange-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 flex items-center justify-center p-3 sm:p-4">
      {/* Hidden Printable Receipt (Optimized for mobile) */}
      <div
        ref={receiptRef}
        className="fixed left-[-9999px] top-0 w-[350px] sm:w-[430px] bg-white p-4 sm:p-8 rounded-xl border border-orange-200 shadow-xl overflow-hidden"
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

            <div className="relative text-gray-800 font-sans text-sm sm:text-base">
              {/* Logo */}
              <div className="flex justify-center mb-4 sm:mb-6">
                <div
                  className="bg-white p-4 sm:p-6 rounded-xl shadow-md border border-orange-200"
                  style={{
                    backgroundImage: `url('/assets/images/logo.png')`,
                    backgroundRepeat: 'no-repeat',
                    backgroundPosition: 'center',
                    backgroundSize: 'contain',
                    width: '100%',
                    maxWidth: '240px sm:280px',
                    height: '120px sm:140px',
                  }}
                />
              </div>

              {/* Header */}
              <div className="text-center mb-4 sm:mb-6 border-b-2 border-[#f58c55] pb-3 sm:pb-4">
                <div className="flex items-center justify-center gap-2 sm:gap-3 mb-2 sm:mb-3">
                  {paymentStatus.success ? (
                    <CheckCircle className="w-8 h-8 sm:w-12 sm:h-12 text-[#f58c55]" />
                  ) : (
                    <XCircle className="w-8 h-8 sm:w-12 sm:h-12 text-red-600" />
                  )}
                  <h1 className="text-lg sm:text-2xl font-bold tracking-wide text-[#f58c55]">
                    {paymentStatus.success ? 'PAYMENT SUCCESSFUL' : 'PAYMENT FAILED'}
                  </h1>
                </div>
                <div className="flex items-center justify-center gap-2 text-gray-600">
                  <Calendar className="w-3 h-3 sm:w-4 sm:h-4 text-[#f58c55]" />
                  <span className="text-xs sm:text-sm font-medium">{new Date().toLocaleString()}</span>
                </div>
              </div>

              {/* Transaction Status */}
              {paymentStatus.transactionStatus && (
                <div className="mb-4 sm:mb-5 p-2 sm:p-3 bg-orange-50 rounded-lg">
                  <div className="flex items-center gap-2 mb-1 sm:mb-2">
                    {getStatusIcon(paymentStatus.transactionStatus.status)}
                    <span className="font-semibold capitalize text-sm sm:text-base">
                      Status: {paymentStatus.transactionStatus.status}
                    </span>
                  </div>
                  <p className="text-xs sm:text-sm text-gray-700">
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
              <div className="mb-4 sm:mb-5">
                <h3 className="font-bold text-base sm:text-lg mb-2 flex items-center gap-2 border-b border-[#f58c55]/30 pb-1 text-[#f58c55]">
                  <User className="w-4 h-4 sm:w-5 sm:h-5 text-[#f58c55]" />
                  CUSTOMER INFORMATION
                </h3>
                <div className="space-y-1 text-xs sm:text-sm">
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
              <div className="mb-4 sm:mb-5">
                <h3 className="font-bold text-base sm:text-lg mb-2 flex items-center gap-2 border-b border-[#f58c55]/30 pb-1 text-[#f58c55]">
                  <ShoppingBag className="w-4 h-4 sm:w-5 sm:h-5 text-[#f58c55]" />
                  ORDER DETAILS
                </h3>
                <div className="space-y-1 text-xs sm:text-sm">
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
                <div className="mb-4 sm:mb-5">
                  <h3 className="font-bold text-base sm:text-lg mb-2 border-b border-[#f58c55]/30 pb-1 text-[#f58c55]">
                    INTERNET PLAN DETAILS
                  </h3>
                  <div className="space-y-1 text-xs sm:text-sm">
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
                        <span className="font-bold text-[#f58c55] bg-white px-2 py-1 rounded text-xs sm:text-sm">
                          {paymentStatus.order.voucherCode}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              ) : (
                <div className="mb-4 sm:mb-5">
                  <h3 className="font-bold text-base sm:text-lg mb-2 border-b border-[#f58c55]/30 pb-1 text-[#f58c55]">
                    ORDER ITEMS
                  </h3>
                  <div className="space-y-2">
                    {paymentStatus.order.items?.map((item, index) => (
                      <div key={index} className="flex justify-between text-xs sm:text-sm bg-orange-50 p-2 rounded">
                        <span className="font-medium">{item.name}</span>
                        <span className="text-[#f58c55] font-semibold">Qty: {item.quantity}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Total */}
              <div className="mt-4 sm:mt-6 pt-3 sm:pt-4 border-t-2 border-[#f58c55] bg-orange-50 p-3 sm:p-4 rounded-lg">
                <div className="flex justify-between items-center">
                  <span className="text-base sm:text-xl font-bold text-[#f58c55]">TOTAL AMOUNT:</span>
                  <span className="text-lg sm:text-2xl font-bold text-[#f58c55]">
                    ₦{paymentStatus.order.totalAmount.toLocaleString()}
                  </span>
                </div>
              </div>

              {/* Footer */}
              <div className="mt-6 sm:mt-8 text-center">
                <div className="flex justify-center mb-3 sm:mb-4">
                  <div
                    className="bg-[#f58c55] p-3 sm:p-4 rounded-full shadow-lg"
                    style={{
                      backgroundImage: `url('/assets/images/logo.png')`,
                      backgroundRepeat: 'no-repeat',
                      backgroundPosition: 'center',
                      backgroundSize: 'contain',
                      width: '80px sm:100px',
                      height: '80px sm:100px',
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

      {/* Main UI - Mobile Optimized */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.3 }}
        className="bg-white/95 dark:bg-gray-800/95 backdrop-blur-lg p-4 sm:p-8 rounded-2xl sm:rounded-3xl shadow-xl sm:shadow-2xl border border-orange-200 dark:border-orange-700 w-full max-w-lg sm:max-w-2xl relative overflow-hidden"
      >
        <div className="absolute inset-0 bg-gradient-to-br from-orange-50/30 via-transparent to-orange-50/30 pointer-events-none"></div>

        {/* Mobile header indicator */}
        {isMobile && (
          <div className="flex items-center justify-center mb-4">
            <Smartphone className="w-4 h-4 text-gray-400 mr-2" />
            
            {canShare && (
              <span className="ml-2 text-xs text-green-600 bg-green-50 px-2 py-1 rounded">
                Share Available
              </span>
            )}
          </div>
        )}

        <h1 className="text-2xl sm:text-4xl font-bold mb-6 text-center text-[#f58c55]">
          Payment Status
        </h1>

        <AnimatePresence>
          {loading || isVerifying ? (
            <motion.div 
              key="loading"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="text-center py-8 sm:py-12"
            >
              <div className="w-10 h-10 sm:w-12 sm:h-12 border-4 border-[#f58c55] border-t-transparent rounded-full animate-spin mx-auto mb-3 sm:mb-4" />
              <p className="text-sm sm:text-lg text-gray-700 dark:text-gray-300">
                {isVerifying ? 'Checking transaction...' : 'Processing payment...'}
              </p>
              {retryCount > 0 && (
                <p className="text-xs sm:text-sm text-gray-500 mt-1 sm:mt-2">
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
              key="status"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className={`rounded-2xl sm:rounded-3xl p-4 sm:p-8 mb-6 border ${
                paymentStatus.success 
                  ? 'bg-gradient-to-br from-green-50 to-white border-green-200' 
                  : 'bg-gradient-to-br from-red-50 to-orange-50 border-red-200'
              }`}
            >
              {/* Transaction Status Banner */}
              {paymentStatus.transactionStatus && (
                <div className={`mb-4 sm:mb-6 p-3 sm:p-4 rounded-xl border ${getStatusColor(paymentStatus.transactionStatus.status)}`}>
                  <div className="flex items-start gap-3">
                    {getStatusIcon(paymentStatus.transactionStatus.status)}
                    <div className="flex-1">
                      <h3 className="font-bold text-base sm:text-lg capitalize">
                        {paymentStatus.transactionStatus.status}
                      </h3>
                      <p className="text-xs sm:text-sm mt-1">{paymentStatus.transactionStatus.message}</p>
                      {paymentStatus.transactionStatus.timestamp && (
                        <p className="text-xs opacity-75 mt-1">
                          Updated: {new Date(paymentStatus.transactionStatus.timestamp).toLocaleTimeString()}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* Status Icon & Title */}
              <div className="flex items-center justify-center gap-3 sm:gap-4 mb-4 sm:mb-6">
                <div className={`w-12 h-12 sm:w-16 sm:h-16 rounded-full flex items-center justify-center shadow-lg ${
                  paymentStatus.success ? 'bg-[#f58c55]' : 'bg-red-500'
                }`}>
                  {paymentStatus.success ? (
                    <CheckCircle className="w-6 h-6 sm:w-8 sm:h-8 text-white" />
                  ) : (
                    <XCircle className="w-6 h-6 sm:w-8 sm:h-8 text-white" />
                  )}
                </div>
                <div>
                  <p className={`text-lg sm:text-2xl font-bold ${
                    paymentStatus.success ? 'text-[#f58c55]' : 'text-red-700'
                  }`}>
                    {paymentStatus.success ? 'Payment Successful!' : 'Payment Issue'}
                  </p>
                  <p className="text-xs sm:text-sm text-gray-600">
                    {paymentStatus.success ? 'Order confirmed' : 'Please check details'}
                  </p>
                </div>
              </div>

              {/* Status Message */}
              <p className="text-center text-sm sm:text-base text-gray-700 dark:text-gray-300 mb-4 sm:mb-6">
                {paymentStatus.message}
              </p>

              {/* Manual verification for non-success states */}
              {!paymentStatus.success && paymentStatus.transactionStatus?.status !== 'success' && (
                <div className="text-center mb-4 sm:mb-6">
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={handleManualVerification}
                    disabled={isVerifying}
                    className="px-4 py-2 sm:px-6 sm:py-3 bg-[#f58c55] hover:bg-orange-600 text-white rounded-xl font-bold transition-all duration-200 flex items-center justify-center gap-2 mx-auto shadow-md disabled:opacity-50 text-sm sm:text-base"
                  >
                    <RefreshCw className={`w-3 h-3 sm:w-4 sm:h-4 ${isVerifying ? 'animate-spin' : ''}`} />
                    {isVerifying ? 'Checking...' : 'Check Status Again'}
                  </motion.button>
                  <p className="text-xs text-gray-500 mt-1 sm:mt-2">
                    Last check: {lastChecked ? lastChecked.toLocaleTimeString() : 'Never'}
                  </p>
                </div>
              )}

              {/* Order Details */}
              {paymentStatus.order && (
                <div className="bg-white dark:bg-gray-800 rounded-xl sm:rounded-2xl border border-orange-100 dark:border-orange-700 p-4 sm:p-6">
                  <div className="flex items-center justify-center mb-4 sm:mb-6">
                    <ShoppingBag className="w-5 h-5 sm:w-6 sm:h-6 text-[#f58c55] mr-2 sm:mr-3" />
                    <h3 className="text-lg sm:text-xl font-bold text-[#f58c55]">
                      {paymentStatus.order.orderType === 'internet' ? 'Plan Details' : 'Order Details'}
                    </h3>
                  </div>

                  {/* Compact order info for mobile */}
                  <div className="space-y-2 sm:space-y-0 sm:grid sm:grid-cols-2 sm:gap-3 text-xs sm:text-sm mb-4">
                    <div className="flex justify-between sm:flex-col sm:justify-start">
                      <span className="text-gray-600">Order ID:</span>
                      <div className="flex items-center gap-1">
                        <span className="font-bold text-[#f58c55] truncate max-w-[120px] sm:max-w-none">
                          {paymentStatus.order.orderId}
                        </span>
                        <button
                          onClick={() => copyToClipboard(paymentStatus.order!.orderId)}
                          className="ml-1 p-1 hover:bg-gray-100 rounded"
                          aria-label="Copy order ID"
                        >
                          {copied ? <Check className="w-3 h-3 text-green-600" /> : <Copy className="w-3 h-3 text-gray-400" />}
                        </button>
                      </div>
                    </div>
                    <div className="flex justify-between sm:flex-col sm:justify-start">
                      <span className="text-gray-600">Customer:</span>
                      <span className="font-bold text-[#f58c55]">{paymentStatus.order.customerInfo.name}</span>
                    </div>
                    <div className="flex justify-between sm:flex-col sm:justify-start">
                      <span className="text-gray-600">Email:</span>
                      <span className="font-medium truncate">{paymentStatus.order.customerInfo.email}</span>
                    </div>
                    <div className="flex justify-between sm:flex-col sm:justify-start">
                      <span className="text-gray-600 font-bold">Total:</span>
                      <span className="font-bold text-lg sm:text-2xl text-[#f58c55]">
                        ₦{paymentStatus.order.totalAmount.toLocaleString()}
                      </span>
                    </div>
                  </div>

                  {/* Internet Plan or Items */}
                  {paymentStatus.order.orderType === 'internet' ? (
                    <div className="mt-3 p-3 sm:p-4 bg-gradient-to-r from-[#f58c55] to-orange-600 text-white rounded-xl">
                      <div className="flex justify-between text-sm sm:text-base">
                        <span>Plan:</span>
                        <span className="font-bold">{paymentStatus.order.plan?.bundle}</span>
                      </div>
                      <div className="flex justify-between text-xs sm:text-sm mt-1">
                        <span>{paymentStatus.order.plan?.dataAmount}GB</span>
                        <span>{paymentStatus.order.plan?.duration} days</span>
                      </div>
                      {paymentStatus.order.voucherCode && (
                        <div className="mt-2 p-2 sm:p-3 bg-white/20 rounded-lg text-center">
                          <span className="text-xs font-bold">Voucher Code:</span>
                          <div className="flex items-center justify-center gap-2 mt-1">
                            <div className="bg-white text-[#f58c55] px-3 py-1 rounded font-mono font-bold text-sm sm:text-base">
                              {paymentStatus.order.voucherCode}
                            </div>
                            <button
                              onClick={() => copyToClipboard(paymentStatus.order!.voucherCode!)}
                              className="p-1 hover:bg-white/20 rounded"
                              aria-label="Copy voucher code"
                            >
                              {copied ? <Check className="w-4 h-4 text-white" /> : <Copy className="w-4 h-4 text-white" />}
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="mt-3 p-2 bg-orange-50 dark:bg-orange-900/20 rounded-lg text-center">
                      <span className="text-[#f58c55] font-bold">{paymentStatus.order.items?.length || 0} item(s)</span>
                    </div>
                  )}

                  {/* Voucher Recovery Link for Internet Orders */}
                  {paymentStatus.success && paymentStatus.order.orderType === 'internet' && paymentStatus.order.voucherCode && (
                    <div className="mt-4 sm:mt-6 p-3 sm:p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-700 rounded-xl">
                      <p className="text-xs sm:text-sm text-green-800 dark:text-green-200 mb-2">
                        💾 Your voucher is saved in your browser. Access it anytime:
                      </p>
                      <a
                        href="/voucher"
                        className="inline-block w-full text-center px-3 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg font-bold transition-all duration-200 text-xs sm:text-sm"
                      >
                        View Saved Voucher
                      </a>
                    </div>
                  )}

                  {/* Download & Share Options */}
                  <div className="mt-4 sm:mt-6">
                    {!showDownloadOptions ? (
                      <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => setShowDownloadOptions(true)}
                        className="w-full px-4 py-3 bg-[#f58c55] hover:bg-orange-600 text-white rounded-xl font-bold transition-all duration-200 flex items-center justify-center gap-2 shadow-md text-sm sm:text-base"
                      >
                        <Download className="w-4 h-4 sm:w-5 sm:h-5" />
                        {paymentStatus.success ? 'Get Receipt' : 'Download Details'}
                      </motion.button>
                    ) : (
                      <div className="space-y-3">
                        <div className="flex gap-2 sm:gap-3">
                          <motion.button
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            onClick={downloadTextReceipt}
                            disabled={downloading && downloadMethod === 'text'}
                            className="flex-1 px-3 py-2 sm:px-4 sm:py-3 bg-gray-600 hover:bg-gray-700 text-white rounded-xl font-bold transition-all duration-200 flex items-center justify-center gap-2 shadow-md disabled:opacity-50 text-xs sm:text-sm"
                          >
                            <Receipt className="w-3 h-3 sm:w-4 sm:h-4" />
                            {downloading && downloadMethod === 'text' ? 'Downloading...' : 'Text File'}
                          </motion.button>

                          <motion.button
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            onClick={downloadImageReceipt}
                            disabled={downloading && downloadMethod === 'image'}
                            className="flex-1 px-3 py-2 sm:px-4 sm:py-3 bg-[#f58c55] hover:bg-orange-600 text-white rounded-xl font-bold transition-all duration-200 flex items-center justify-center gap-2 shadow-md disabled:opacity-50 text-xs sm:text-sm"
                          >
                            <Download className="w-3 h-3 sm:w-4 sm:h-4" />
                            {downloading && downloadMethod === 'image' ? 'Generating...' : 'Image File'}
                          </motion.button>
                        </div>

                        {/* Share option for mobile with Web Share API */}
                        {isMobile && canShare && paymentStatus.success && (
                          <motion.button
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            onClick={handleShare}
                            className="w-full px-3 py-2 bg-green-600 hover:bg-green-700 text-white rounded-xl font-bold transition-all duration-200 flex items-center justify-center gap-2 shadow-md text-xs sm:text-sm"
                          >
                            <Share2 className="w-3 h-3 sm:w-4 sm:h-4" />
                            Share Receipt
                          </motion.button>
                        )}

                        <button
                          onClick={() => setShowDownloadOptions(false)}
                          className="w-full text-xs text-gray-500 hover:text-gray-700 text-center pt-2"
                        >
                          Hide options
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </motion.div>
          ) : (
            <motion.div
              key="error"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="text-center py-8 sm:py-12"
            >
              <AlertCircle className="w-12 h-12 sm:w-16 sm:h-16 text-gray-400 mx-auto mb-3 sm:mb-4" />
              <p className="text-sm sm:text-lg text-gray-700 dark:text-gray-300">
                Unable to load payment status.
              </p>
              <button
                onClick={() => window.location.reload()}
                className="mt-3 sm:mt-4 px-4 py-2 sm:px-6 sm:py-2 bg-[#f58c55] text-white rounded-lg hover:bg-orange-600 transition-colors text-sm sm:text-base"
              >
                Reload Page
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Action Button */}
        <div className="flex justify-center pt-4 sm:pt-6">
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={handleBackToMenu}
            className="px-6 py-3 sm:px-8 sm:py-4 bg-[#f58c55] hover:bg-orange-600 text-white rounded-xl sm:rounded-2xl font-bold shadow-lg transition-all duration-200 flex items-center gap-2 sm:gap-3 text-sm sm:text-lg"
          >
            <ArrowLeft className="w-4 h-4 sm:w-5 sm:h-5" />
            Back to{' '}
            <span className="capitalize">
              {paymentStatus?.order?.orderType === 'internet' ? 'Plans' : 'Menu'}
            </span>
          </motion.button>
        </div>
      </motion.div>
    </div>
  );
};

export default PaymentCallbackPage;