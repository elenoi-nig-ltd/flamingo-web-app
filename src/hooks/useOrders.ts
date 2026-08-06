'use client';

import { useState, useEffect } from 'react';
import { useAuth } from './useAuth';
import { getCookie } from 'cookies-next';
import { BASEURL } from '@/config/api/contants';

export interface OrderItem {
  product: string;
  productType: 'food' | 'goods';
  quantity: number;
}

export interface CreateOrderDto {
  items: OrderItem[];
  deliveryOption: 'pickup' | 'delivery';
  deliveryZoneId?: string;
  deliveryAddress?: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
}

export interface OrderCreatedResponse {
  order: {
    _id: string;
    subtotal: number;
    deliveryFee: number;
    totalAmount: number;
    status: string;
    customerEmail: string;
    customerName: string;
    customerPhone: string;
    deliveryOption: string;
    deliveryAddress?: string;
  };
  guestAccessToken?: string;
}

export interface DeliveryZone {
  id: string;
  name: string;
  fee: number;
}

export const useOrders = () => {
  const { user, loading: authLoading } = useAuth();
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const getUserRole = (): string | null => {
    if (typeof window === 'undefined') return null;
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      try {
        const parsedUser = JSON.parse(storedUser);
        return parsedUser.role || null;
      } catch (err) {
        return null;
      }
    }
    return user?.role || null;
  };

  const fetchDeliveryZones = async (): Promise<DeliveryZone[]> => {
    try {
      const response = await fetch(`${BASEURL}/orders/delivery-zones`);
      if (!response.ok) return [];
      return await response.json();
    } catch {
      return [];
    }
  };

  const fetchOrders = async () => {
    const role = getUserRole();
    if (!role || role !== 'admin') {
      setError('Unauthorized access');
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const token = getCookie('token');
      const response = await fetch(`${BASEURL}/orders`, {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        credentials: 'include',
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `Failed to fetch orders: ${response.status}`);
      }

      const data = await response.json();
      setOrders(data);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An error occurred while fetching orders';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const createOrder = async (orderData: CreateOrderDto): Promise<OrderCreatedResponse | null> => {
    setLoading(true);
    setError(null);
    try {
      const token = getCookie('token');
      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
      };
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }

      const response = await fetch(`${BASEURL}/orders`, {
        method: 'POST',
        headers,
        body: JSON.stringify(orderData),
        credentials: 'include',
      });

      const responseData = await response.json();

      if (!response.ok || !responseData) {
        throw new Error(responseData?.message || `Failed to create order: ${response.status}`);
      }

      return responseData;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An error occurred while creating order';
      setError(errorMessage);
      console.error('Create order error:', err);
      return null;
    } finally {
      setLoading(false);
    }
  };

  const clearError = () => {
    setError(null);
  };

  useEffect(() => {
    if (!authLoading) {
      const role = getUserRole();
      if (role === 'admin') {
        fetchOrders();
      } else {
        setLoading(false);
      }
    }
  }, [user, authLoading]);

  return {
    orders,
    loading,
    error,
    createOrder,
    fetchDeliveryZones,
    fetchOrders,
    clearError,
  };
};