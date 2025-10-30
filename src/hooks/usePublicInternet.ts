import { useState } from 'react';
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

export const usePublicInternet = () => {
  const [locations, setLocations] = useState<Location[]>([]);
  const [plans, setPlans] = useState<DataPlan[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [paymentResponse, setPaymentResponse] = useState<PaymentResponse | null>(null);

  const fetchPlans = async (query: QueryDto = { page: 1, limit: 10 }) => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`${BASEURL}/internet/public/plans?page=${query.page}&limit=${query.limit}`);
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to fetch data plans');
      }
      const data = await response.json();
      console.log('fetchPlans response:', data);
      const validPlans = Array.isArray(data.data) ? data.data.filter((plan: DataPlan) => plan && plan._id && plan.location && plan.location._id) : [];
      setPlans(validPlans);
      const uniqueLocations = [
        ...new Set(validPlans.map((plan: DataPlan) => JSON.stringify(plan.location))),
      ]
        .map((str) => JSON.parse(str as string) as Location)
        .filter((location: Location) => location && location._id && location.name && location.address);
      setLocations(uniqueLocations);
    } catch (err: any) {
      console.error('fetchPlans error:', err);
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
      const response = await fetch(`${BASEURL}/internet/public/locations/${locationId}/plans?page=${query.page}&limit=${query.limit}`);
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to fetch data plans for location');
      }
      const data = await response.json();
      console.log('fetchPlansByLocation response:', data);
      const validPlans = Array.isArray(data.data) ? data.data.filter((plan: DataPlan) => plan && plan._id && plan.location && plan.location._id) : [];
      setPlans(validPlans);
    } catch (err: any) {
      console.error('fetchPlansByLocation error:', err);
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
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, phoneNumber, planId }),
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to initiate payment');
      }
      const data: PaymentResponse = await response.json();
      console.log('initiatePayment response:', data);
      setPaymentResponse(data);
      return data;
    } catch (err: any) {
      console.error('initiatePayment error:', err);
      setError(err.message || 'An unexpected error occurred');
      return null;
    } finally {
      setLoading(false);
    }
  };

  return { locations, plans, loading, error, setError, paymentResponse, fetchPlans, fetchPlansByLocation, initiatePayment };
};