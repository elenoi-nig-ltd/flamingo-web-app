// hooks/useProducts.ts
'use client';

import { useState, useEffect } from 'react';
import { useAuth } from './useAuth';
import { getCookie } from 'cookies-next';
import { BASEURL } from '@/config/api/contants';

interface Product {
  _id: string;
  name: string;
  description: string;
  price: number;
  category: string;
  stock: number;
  images: string[];
}

interface CreateProductDto {
  name: string;
  description: string;
  price: number;
  category: string;
  stock: number;
  images?: string[];
}

interface UpdateProductDto {
  name?: string;
  description?: string;
  price?: number;
  category?: string;
  stock?: number;
  images?: string[];
}

export const useProducts = () => {
  const { user, loading: authLoading } = useAuth();
  const [products, setProducts] = useState<Product[]>([]);
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

  // Fetch all products
  const fetchProducts = async () => {
    const role = getUserRole();
    if (!role || role !== 'admin') {
      setError('Unauthorized access');
      setLoading(false);
      return;
    }

    setLoading(true);
    try {
      const token = getCookie('token');
      const response = await fetch(`${BASEURL}/products`, {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        credentials: 'include',
      });

      if (!response.ok) {
        throw new Error('Failed to fetch products');
      }

      const data = await response.json();
      setProducts(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  // Create a product
  const createProduct = async (productData: CreateProductDto) => {
    const role = getUserRole();
    if (!role || role !== 'admin') {
      setError('Unauthorized access');
      return;
    }

    setLoading(true);
    try {
      const token = getCookie('token');
      const response = await fetch(`${BASEURL}/products`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(productData),
        credentials: 'include',
      });

      if (!response.ok) {
        throw new Error('Failed to create product');
      }

      const newProduct = await response.json();
      setProducts([...products, newProduct]);
      return newProduct;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  // Update a product
  const updateProduct = async (id: string, productData: UpdateProductDto) => {
    const role = getUserRole();
    if (!role || role !== 'admin') {
      setError('Unauthorized access');
      return;
    }

    setLoading(true);
    try {
      const token = getCookie('token');
      const response = await fetch(`${BASEURL}/products/${id}`, {
        method: 'PUT',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(productData),
        credentials: 'include',
      });

      if (!response.ok) {
        throw new Error('Failed to update product');
      }

      const updatedProduct = await response.json();
      setProducts(products.map((p) => (p._id === id ? updatedProduct : p)));
      return updatedProduct;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  // Delete a product
  const deleteProduct = async (id: string) => {
    const role = getUserRole();
    if (!role || role !== 'admin') {
      setError('Unauthorized access');
      return;
    }

    setLoading(true);
    try {
      const token = getCookie('token');
      const response = await fetch(`${BASEURL}/products/${id}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        credentials: 'include',
      });

      if (!response.ok) {
        throw new Error('Failed to delete product');
      }

      setProducts(products.filter((p) => p._id !== id));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  // Fetch products on mount and when user changes
  useEffect(() => {
    if (!authLoading) {
      const role = getUserRole();
      if (role === 'admin') {
        fetchProducts();
      } else {
        setError('Admin access required');
        setLoading(false);
      }
    }
  }, [user, authLoading]);

  return { products, loading, error, createProduct, updateProduct, deleteProduct };
};