'use client';

import { useState } from 'react';
import { getErrorMessage } from '@/utils/checkout';

export const BASEURL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:6000';

// === Types ===
export interface Payment {
  _id: string;
  orderId: string;
  transactionId: string; // Paystack reference
  status: 'pending' | 'completed' | 'failed';
  amount: number;
  currency: string;
  paymentProvider: 'paystack';
}

export interface InitiatePaymentDto {
  orderId: string;
  guestAccessToken?: string;
  mobileCallbackUrl?: string;
}

export interface InitiatePaymentResponse {
  paymentUrl: string;
  paymentId: string;
  transactionId: string; // Paystack reference
}

// === Hook ===
export const usePayments = () => {
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const handleFetchError = async (response: Response): Promise<never> => {
    let message = 'An unexpected error occurred';
    try {
      const data = await response.json();
      message = getErrorMessage(data, message);
    } catch {
      // Ignore JSON parse error
    }
    throw new Error(`[${response.status}] ${message}`);
  };

  /**
   * Initiate Paystack payment using backend-authoritative order ID
   */
  const initiatePayment = async (
    paymentData: InitiatePaymentDto
  ): Promise<InitiatePaymentResponse | null> => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`${BASEURL}/payments`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(paymentData),
        credentials: 'include',
      });

      if (!response.ok) {
        await handleFetchError(response);
      }

      const result: InitiatePaymentResponse = await response.json();
      console.log('Payment initiated:', result.transactionId);
      return result;
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Failed to initiate payment';
      console.error('initiatePayment error:', msg);
      setError(msg);
      return null;
    } finally {
      setLoading(false);
    }
  };

  /**
   * Verify payment using Paystack reference (transactionId)
   */
  const verifyPayment = async (transactionId: string): Promise<Payment | null> => {
    if (!transactionId) {
      setError('Transaction reference is required');
      return null;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`${BASEURL}/payments/verify/${encodeURIComponent(transactionId)}`, {
        method: 'GET',
        credentials: 'include',
      });

      if (!response.ok) {
        await handleFetchError(response);
      }

      const payment: Payment = await response.json();
      return payment;
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Failed to verify payment';
      console.error('verifyPayment error:', msg);
      setError(msg);
      return null;
    } finally {
      setLoading(false);
    }
  };

  const verifyPaymentByReference = verifyPayment;

  /**
   * Get payment by order ID
   */
  const getPaymentByOrderId = async (orderId: string, guestToken?: string): Promise<Payment | null> => {
    if (!orderId) {
      setError('Order ID is required');
      return null;
    }

    setLoading(true);
    setError(null);

    try {
      const url = guestToken
        ? `${BASEURL}/payments/order/guest/${orderId}`
        : `${BASEURL}/payments/order/${orderId}`;
      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
      };
      if (guestToken) {
        headers['x-guest-token'] = guestToken;
      }

      const response = await fetch(url, {
        method: 'GET',
        headers,
        credentials: 'include',
      });

      if (!response.ok) {
        await handleFetchError(response);
      }

      const payment: Payment = await response.json();
      return payment;
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Failed to fetch payment';
      console.error('getPaymentByOrderId error:', msg);
      setError(msg);
      return null;
    } finally {
      setLoading(false);
    }
  };

  return {
    initiatePayment,
    verifyPayment,
    verifyPaymentByReference,
    getPaymentByOrderId,
    loading,
    error,
    setError,
  };
};
