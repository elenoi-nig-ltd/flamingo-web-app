'use client';

import { useState, useEffect } from 'react';
import { useAuth } from './useAuth';
import { getCookie } from 'cookies-next';
import { BASEURL } from '@/config/api/contants';

interface Inventory {
  _id: string;
  product: { _id: string; name: string } | null;
  quantity: number;
  status: 'in_stock' | 'low_stock' | 'out_of_stock';
  lastUpdated: string;
}

interface CreateInventoryDto {
  product: string;
  quantity: number;
  status: 'in_stock' | 'low_stock' | 'out_of_stock';
}

interface UpdateInventoryDto {
  quantity?: number;
  status?: 'in_stock' | 'low_stock' | 'out_of_stock';
}

export const useInventory = () => {
  const { user, loading: authLoading } = useAuth();
  const [inventory, setInventory] = useState<Inventory[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Helper function to get user role from localStorage
  const getUserRole = (): string | null => {
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

  // Fetch all inventory entries
  const fetchInventory = async () => {
    const role = getUserRole();
    if (!role || role !== 'admin') {
      setError('Unauthorized access');
      setLoading(false);
      return;
    }

    setLoading(true);
    try {
      const token = getCookie('token');
      const response = await fetch(`${BASEURL}/inventory`, {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        credentials: 'include',
      });

      if (!response.ok) {
        throw new Error('Failed to fetch inventory');
      }

      const data = await response.json();
      // Validate and filter the data to ensure it matches the Inventory interface
      const validInventory = data.filter((item: Inventory) =>
        item &&
        item._id &&
        (!item.product || (typeof item.product === 'object' && item.product._id && item.product.name)) &&
        typeof item.quantity === 'number' &&
        ['in_stock', 'low_stock', 'out_of_stock'].includes(item.status)
      );
      setInventory(validInventory);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  // Create an inventory entry
  const createInventory = async (inventoryData: CreateInventoryDto) => {
    const role = getUserRole();
    if (!role || role !== 'admin') {
      setError('Unauthorized access');
      return;
    }

    setLoading(true);
    try {
      const token = getCookie('token');
      const response = await fetch(`${BASEURL}/inventory`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(inventoryData),
        credentials: 'include',
      });

      if (!response.ok) {
        throw new Error('Failed to create inventory');
      }

      const newInventory = await response.json();
      setInventory([...inventory, newInventory]);
      return newInventory;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  // Update an inventory entry
  const updateInventory = async (id: string, inventoryData: UpdateInventoryDto) => {
    const role = getUserRole();
    if (!role || role !== 'admin') {
      setError('Unauthorized access');
      return;
    }

    setLoading(true);
    try {
      const token = getCookie('token');
      const response = await fetch(`${BASEURL}/inventory/${id}`, {
        method: 'PUT',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(inventoryData),
        credentials: 'include',
      });

      if (!response.ok) {
        throw new Error('Failed to update inventory');
      }

      const updatedInventory = await response.json();
      setInventory(inventory.map((item) => (item._id === id ? updatedInventory : item)));
      return updatedInventory;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  // Delete an inventory entry
  const deleteInventory = async (id: string) => {
    const role = getUserRole();
    if (!role || role !== 'admin') {
      setError('Unauthorized access');
      return;
    }

    setLoading(true);
    try {
      const token = getCookie('token');
      const response = await fetch(`${BASEURL}/inventory/${id}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        credentials: 'include',
      });

      if (!response.ok) {
        throw new Error('Failed to delete inventory');
      }

      setInventory(inventory.filter((item) => item._id !== id));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  // Fetch inventory on mount and when user changes
  useEffect(() => {
    if (!authLoading) {
      const role = getUserRole();
      if (role === 'admin') {
        fetchInventory();
      } else {
        setError('Admin access required');
        setLoading(false);
      }
    }
  }, [user, authLoading]);

  return { inventory, loading, error, createInventory, updateInventory, deleteInventory };
};