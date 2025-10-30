'use client';

import { useState, useEffect } from 'react';
import { BASEURL } from '@/config/api/contants';

interface Category {
  _id: string;
  name: string;
}

interface HomeItem {
  _id: string;
  name: string;
  description: string;
  price: number;
  category: Category;
  stock: number;
  images: string[];
}

interface HomeItemApiPayload {
  name: string;
  description: string;
  price: number;
  category: string;
  stock: number;
  images: string[];
}

interface UseHomeItemsReturn {
  products: HomeItem[];
  loading: boolean;
  error: string | null;
  createHomeItem: (data: HomeItemApiPayload) => Promise<void>;
  updateHomeItem: (id: string, data: Partial<HomeItemApiPayload>) => Promise<void>;
  deleteHomeItem: (id: string) => Promise<HomeItem>;
  fetchHomeItem: (id: string) => Promise<HomeItem>;
  fetchHomeItemsByCategory: (categoryId: string) => Promise<HomeItem[]>;
  refetch: () => Promise<void>;
}

export const useHomeItems = (categoryId?: string | null): UseHomeItemsReturn => {
  const [products, setProducts] = useState<HomeItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchHomeItems = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (categoryId) params.append('categoryId', categoryId);

      const url = `${BASEURL}/home-items${params.toString() ? `?${params}` : ''}`;
      console.log('Fetching home items from:', url);
      
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
      });
      
      console.log('Response status:', response.status);
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('Error response:', errorText);
        throw new Error(errorText || 'Failed to fetch home items');
      }
      
      const data = await response.json();
      console.log('Home items data received:', data);
      
      // Ensure we always set an array, even if data is null/undefined
      setProducts(Array.isArray(data) ? data : []);
      setError(null);
    } catch (err) {
      console.error('Error in fetchHomeItems:', err);
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch home items';
      setError(errorMessage);
      setProducts([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchHomeItemsByCategory = async (categoryId: string): Promise<HomeItem[]> => {
    try {
      const response = await fetch(`${BASEURL}/home-items?categoryId=${encodeURIComponent(categoryId)}`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to fetch home items by category');
      }
      
      const data = await response.json();
      return Array.isArray(data) ? data : [];
    } catch (err) {
      console.error('Error fetching home items by category:', err);
      return [];
    }
  };

  const createHomeItem = async (data: HomeItemApiPayload) => {
    try {
      setLoading(true);
      setError(null);
      console.log('Sending create home item payload:', data);
      const response = await fetch(`${BASEURL}/home-items`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify(data),
      });
      if (!response.ok) {
        const errorData = await response.json();
        console.error('Create home item error response:', errorData);
        const errorMessage = Array.isArray(errorData.message)
          ? errorData.message.join(', ')
          : errorData.message || 'Failed to create home item';
        throw new Error(errorMessage);
      }
      const newItem = await response.json();
      setProducts(prev => [...prev, newItem]);
    } catch (err) {
      console.error('Error in createHomeItem:', err);
      const errorMessage = err instanceof Error ? err.message : 'Failed to create home item';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const updateHomeItem = async (id: string, data: Partial<HomeItemApiPayload>) => {
    try {
      setLoading(true);
      setError(null);
      const response = await fetch(`${BASEURL}/home-items/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify(data),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to update home item');
      }
      
      const updatedItem = await response.json();
      setProducts(prev => prev.map(item => (item._id === id ? updatedItem : item)));
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to update home item';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  };

const deleteHomeItem = async (id: string): Promise<HomeItem> => {
  try {
    setLoading(true);
    setError(null);
    const response = await fetch(`${BASEURL}/home-items/${id}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`,
      },
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Failed to delete home item');
    }
    
    const deletedItem = await response.json();
    setProducts(prev => prev.filter(item => item._id !== id));
    return deletedItem;
  } catch (err) {
    const errorMessage = err instanceof Error ? err.message : 'Failed to delete home item';
    setError(errorMessage);
    throw err;
  } finally {
    setLoading(false);
  }
};
  const fetchHomeItem = async (id: string): Promise<HomeItem> => {
    try {
      setLoading(true);
      setError(null);
      const response = await fetch(`${BASEURL}/home-items/${id}`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to fetch home item');
      }
      
      return await response.json();
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch home item';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHomeItems();
  }, [categoryId]);

  return {
    products,
    loading,
    error,
    createHomeItem,
    updateHomeItem,
    deleteHomeItem,
    fetchHomeItem,
    fetchHomeItemsByCategory,
    refetch: fetchHomeItems,
  };
};