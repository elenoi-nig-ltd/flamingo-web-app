'use client';

import { useState, useEffect } from 'react';
import { useAuth } from './useAuth';
import { getCookie } from 'cookies-next';
import { BASEURL } from '@/config/api/contants';

interface Order {
  _id: string;
  items: { product: { _id: string; name: string }; quantity: number }[];
  totalAmount: number;
  status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled';

}

interface CreateOrderDto {
  items: { product: string; quantity: number }[];
  totalAmount: number;
  status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
}

interface UpdateOrderDto {
  status?: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
}

export const useOrders = () => {
  const { user, loading: authLoading } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Helper function to get user role from localStorage
  const getUserRole = (): string | null => {
    if (typeof window === 'undefined') return null;
    
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      try {
        const parsedUser = JSON.parse(storedUser);
        return parsedUser.role || null;
      } catch (err) {
        console.error('Error parsing stored user:', err);
        return null;
      }
    }
    return user?.role || null;
  };

  // Fetch all orders (admin only)
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
      console.error('Fetch orders error:', err);
    } finally {
      setLoading(false);
    }
  };

const createOrder = async (orderData: CreateOrderDto) => {
  setLoading(true);
  setError(null);
  try {
    console.log('Sending order creation request:', orderData);
    const response = await fetch(`${BASEURL}/orders`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(orderData),
      credentials: 'include',
    });

    const responseData = await response.json();
    console.log('Response status:', response.status);
    console.log('Response data:', responseData);

    if (!response.ok || !responseData) {
      throw new Error(responseData?.message || `Failed to create order: ${response.status}`);
    }

    console.log('Order creation response:', responseData);
    const newOrder = responseData;
    setOrders(prev => [...prev, newOrder]);
    return newOrder;
  } catch (err) {
    const errorMessage = err instanceof Error ? err.message : 'An error occurred while creating order';
    setError(errorMessage);
    console.error('Create order error:', err);
    return null;
  } finally {
    setLoading(false);
  }
};

  // Update an order (admin only)
  const updateOrder = async (id: string, orderData: UpdateOrderDto) => {
    const role = getUserRole();
    if (!role || role !== 'admin') {
      setError('Unauthorized access');
      return null;
    }

    setLoading(true);
    setError(null);
    try {
      const token = getCookie('token');
      const response = await fetch(`${BASEURL}/orders/${id}`, {
        method: 'PUT',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(orderData),
        credentials: 'include',
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `Failed to update order: ${response.status}`);
      }

      const updatedOrder = await response.json();
      setOrders(orders.map((o) => (o._id === id ? updatedOrder : o)));
      return updatedOrder;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An error occurred while updating order';
      setError(errorMessage);
      console.error('Update order error:', err);
      return null;
    } finally {
      setLoading(false);
    }
  };

  // Delete an order (admin only)
  const deleteOrder = async (id: string) => {
    const role = getUserRole();
    if (!role || role !== 'admin') {
      setError('Unauthorized access');
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const token = getCookie('token');
      const response = await fetch(`${BASEURL}/orders/${id}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        credentials: 'include',
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `Failed to delete order: ${response.status}`);
      }

      setOrders(orders.filter((o) => o._id !== id));
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An error occurred while deleting order';
      setError(errorMessage);
      console.error('Delete order error:', err);
    } finally {
      setLoading(false);
    }
  };

  // Clear error
  const clearError = () => {
    setError(null);
  };

  // Fetch orders on mount and when user changes (admin only)
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
    updateOrder, 
    deleteOrder, 
    fetchOrders,
    clearError 
  };
}; 