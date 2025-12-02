// src/hooks/usePublicInternet.ts
import { useState, useCallback } from 'react';
import { BASEURL } from '@/config/api/contants';

interface Location {
  _id: string;
  name: string;
  address: string;
  type: string;
}

interface DataPlan {
  _id: string;
  dataAmount: number;
  duration: number;
  location: Location;
  bundle: string;
  price: number;
  hasAvailableVouchers: boolean;
  createdAt: string;
  updatedAt: string;
}

interface PaymentResponse {
  paymentUrl: string;
  transactionId: string;
  voucherCode?: string;
}

interface QueryDto {
  page?: number;
  limit?: number;
}

export interface PendingOrder {
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

export interface TransactionStatus {
  status: 'success' | 'failed' | 'pending' | 'abandoned' | 'unknown';
  message: string;
  voucherCode?: string;
  plan?: any;
  timestamp?: string;
}

export const usePublicInternet = () => {
  /* ---------- State ---------- */
  const [locations, setLocations] = useState<Location[]>([]);
  const [plans, setPlans] = useState<DataPlan[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [paymentResponse, setPaymentResponse] = useState<PaymentResponse | null>(null);

  /* ---------- Core API calls ---------- */
  const fetchPlans = async (query: QueryDto = { page: 1, limit: 10 }) => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`${BASEURL}/internet/public/plans?page=${query.page}&limit=${query.limit}`);
      if (!response.ok) throw new Error((await response.json()).message || 'Failed to fetch plans');
      const { data } = await response.json();

      const validPlans = Array.isArray(data)
        ? data.filter((p: DataPlan) => p?._id && p?.location?._id)
        : [];

      setPlans(validPlans);

      const uniqueLocations = [
        ...new Set(validPlans.map((p: DataPlan) => JSON.stringify(p.location))),
      ]
        .map((s) => JSON.parse(s as string) as Location)
        .filter((l) => l?._id && l?.name && l?.address);

      setLocations(uniqueLocations);
    } catch (err: any) {
      setError(err.message || 'An unexpected error occurred');
      setPlans([]);
      setLocations([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchPlansByLocation = async (locationId: string, query: QueryDto = { page: 1, limit: 10 }) => {
    if (!locationId) {
      setError('Location ID is required');
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(
        `${BASEURL}/internet/public/locations/${locationId}/plans?page=${query.page}&limit=${query.limit}`
      );
      if (!response.ok) throw new Error((await response.json()).message || 'Failed to fetch plans');
      const { data } = await response.json();

      const validPlans = Array.isArray(data)
        ? data.filter((p: DataPlan) => p?._id && p?.location?._id)
        : [];

      setPlans(validPlans);
    } catch (err: any) {
      setError(err.message || 'An unexpected error occurred');
      setPlans([]);
    } finally {
      setLoading(false);
    }
  };

  const initiatePayment = async (email: string, phoneNumber: string, planId: string) => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`${BASEURL}/internet/public/pay`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, phoneNumber, planId }),
      });
      if (!response.ok) throw new Error((await response.json()).message || 'Failed to initiate payment');
      const data: PaymentResponse = await response.json();
      setPaymentResponse(data);
      return data;
    } catch (err: any) {
      setError(err.message || 'An unexpected error occurred');
      return null;
    } finally {
      setLoading(false);
    }
  };

  /* ---------- Transaction status verification (the part that was in the page) ---------- */
  const checkTransactionStatus = async (transactionId: string): Promise<TransactionStatus> => {
    try {
      const res = await fetch(`${BASEURL}/internet/public/pay/status/${transactionId}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Cache-Control': 'no-cache',
        },
      });

      if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);

      const data = await res.json();

      return {
        status: data.status,
        message: data.message || '',
        voucherCode: data.voucherCode,
        plan: data.plan,
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      console.error('checkTransactionStatus error:', error);
      return {
        status: 'unknown',
        message: 'Unable to verify transaction status. Please try again or contact support.',
        timestamp: new Date().toISOString(),
      };
    }
  };

  const verifyPaymentWithRetry = async (
    transactionId: string,
    maxRetries = 8
  ): Promise<TransactionStatus> => {
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      const status = await checkTransactionStatus(transactionId);

      if (status.status === 'success' || status.status === 'failed' || status.status === 'abandoned') {
        return status;
      }

      if (attempt < maxRetries) {
        const delay = Math.min(1000 * Math.pow(2, attempt - 1), 15000);
        await new Promise((resolve) => setTimeout(resolve, delay));
      }
    }

    return {
      status: 'pending',
      message: 'Payment is still being processed. You can check back later or contact support.',
      timestamp: new Date().toISOString(),
    };
  };

  const checkForAbandonedTransaction = (pendingOrder: PendingOrder): boolean => {
    try {
      const ts = parseInt(pendingOrder.orderId.split('-').pop() || '0', 10);
      if (!ts) return false;
      const orderTime = new Date(ts);
      const thirtyMinutesAgo = new Date(Date.now() - 30 * 60 * 1000);
      return orderTime < thirtyMinutesAgo;
    } catch {
      return false;
    }
  };

  const getPendingOrder = useCallback((): PendingOrder | null => {
    try {
      const session = sessionStorage.getItem('pendingOrder');
      if (session) return JSON.parse(session);
      const local = localStorage.getItem('pendingOrder');
      if (local) return JSON.parse(local);
      return null;
    } catch {
      return null;
    }
  }, []);

  const cleanupPendingOrder = useCallback(() => {
    try {
      sessionStorage.removeItem('pendingOrder');
      localStorage.removeItem('pendingOrder');
    } catch {}
  }, []);

  /* ---------- Return everything ---------- */
  return {
    // Data
    locations,
    plans,
    loading,
    error,
    setError,
    paymentResponse,

    // Core actions
    fetchPlans,
    fetchPlansByLocation,
    initiatePayment,

    // Transaction verification utilities
    checkTransactionStatus,
    verifyPaymentWithRetry,
    checkForAbandonedTransaction,
    getPendingOrder,
    cleanupPendingOrder,
  };
};