'use client';

import { useState, useEffect } from 'react';
import { BASEURL } from '@/config/api/contants';

interface FoodProduct {
  _id: string;
  name: string;
  description: string;
  price: number;
  category: string;
  images: string[];
}

export const usePublicProducts = (categoryId?: string) => {
  const [products, setProducts] = useState<FoodProduct[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const url = categoryId && categoryId !== 'All' 
        ? `${BASEURL}/products/category/${categoryId}`
        : `${BASEURL}/products`;
      const response = await fetch(url);
      if (!response.ok) {
        if (response.status === 404) {
          throw new Error(`No products found for category ID: ${categoryId || 'All'}`);
        }
        throw new Error('Failed to fetch products');
      }
      const data = await response.json();
      setProducts(data);
      setError(null);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch products';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const fetchProductsByCategory = async (categoryId: string) => {
    try {
      const response = await fetch(`${BASEURL}/products/category/${categoryId}`);
      if (!response.ok) {
        if (response.status === 404) {
          throw new Error(`No products found for category ID: ${categoryId}`);
        }
        throw new Error('Failed to fetch products by category');
      }
      const data = await response.json();
      return data;
    } catch (err) {
      throw new Error(err instanceof Error ? err.message : 'Failed to fetch products by category');
    }
  };

  const searchProducts = async (query: string) => {
    try {
      const response = await fetch(`${BASEURL}/products?search=${encodeURIComponent(query)}`);
      if (!response.ok) {
        throw new Error('Failed to search products');
      }
      const data = await response.json();
      return data;
    } catch (err) {
      throw new Error(err instanceof Error ? err.message : 'Failed to search products');
    }
  };

  useEffect(() => {
    fetchProducts();
  }, [categoryId]);

  return { 
    products, 
    loading, 
    error, 
    fetchProductsByCategory, 
    searchProducts,
    refetch: fetchProducts 
  };
};