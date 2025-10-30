'use client';

import { useState } from 'react';
import { getCookie } from 'cookies-next';
import { BASEURL } from '@/config/api/contants';

interface Payment {
  _id: string;
  orderId: string;
  transactionId: string;
  status: 'pending' | 'completed' | 'failed';
  amount: number;
  currency: string;
  paymentProvider: string;
}

interface CreatePaymentDto {
  orderId: string;
  email: string;
  amount: number;
  currency: string;
}

interface InitiatePaymentResponse {
  paymentUrl: string;
  paymentId: string;
  transactionId: string;
}

export const usePayments = () => {
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const initiatePayment = async (paymentData: CreatePaymentDto): Promise<InitiatePaymentResponse | null> => {
    setLoading(true);
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
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to initiate payment');
      }

      const result = await response.json();
      return result;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
      return null;
    } finally {
      setLoading(false);
    }
  };

  const verifyPayment = async (transactionId: string): Promise<Payment | null> => {
    setLoading(true);
    try {

      const response = await fetch(`${BASEURL}/payments/verify/${transactionId}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to verify payment');
      }

      const paymentData = await response.json();
      return paymentData;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
      return null;
    } finally {
      setLoading(false);
    }
  };

  const getPaymentByOrderId = async (orderId: string): Promise<Payment | null> => {
    setLoading(true);
    try {

      const response = await fetch(`${BASEURL}/payments/order/${orderId}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to fetch payment');
      }

      const paymentData = await response.json();
      return paymentData;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
      return null;
    } finally {
      setLoading(false);
    }
  };

  return { initiatePayment, verifyPayment, getPaymentByOrderId, loading, error };
};