import { useState, useEffect } from 'react';
import axios from 'axios';
import { BASEURL } from '@/config/api/contants';

interface Category {
  _id: string;
  name: string;
  description: string;
  createdAt?: string;
  updatedAt?: string;
}

interface Product {
  _id: string;
  name: string;
  description: string;
  price: number;
  category: string | Category;
  stock: number;
  images?: string[];
  specifications?: Record<string, any>;
  createdAt?: string;
  updatedAt?: string;
}

interface PaginationParams {
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

interface ProductsResponse {
  products: Product[];
  total: number;
  page: number;
  pages: number;
}

interface CategoriesResponse {
  categories: Category[];
  total: number;
}

export const usePublic = () => {
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // Categories methods
  const fetchCategories = async (params?: PaginationParams): Promise<CategoriesResponse> => {
    setLoading(true);
    try {
      const response = await axios.get(`${BASEURL}/categories`, {
        params,
        headers: {
          'Content-Type': 'application/json',
        },
      });
      setError(null);
      return {
        categories: response.data,
        total: response.data.length,
      };
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch categories';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const getCategoryById = async (id: string): Promise<Category> => {
    setLoading(true);
    try {
      const response = await axios.get(`${BASEURL}/categories/${id}`, {
        headers: {
          'Content-Type': 'application/json',
        },
      });
      setError(null);
      return response.data;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch category';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  // Products methods
  const fetchProducts = async (params?: PaginationParams & {
    category?: string;
    minPrice?: number;
    maxPrice?: number;
    search?: string;
  }): Promise<ProductsResponse> => {
    setLoading(true);
    try {
      const response = await axios.get(`${BASEURL}/products`, {
        params,
        headers: {
          'Content-Type': 'application/json',
        },
      });
      setError(null);
      
      return {
        products: response.data,
        total: response.data.length,
        page: params?.page || 1,
        pages: Math.ceil(response.data.length / (params?.limit || 10)),
      };
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch products';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const getProductById = async (id: string): Promise<Product> => {
    setLoading(true);
    try {
      const response = await axios.get(`${BASEURL}/products/${id}`, {
        headers: {
          'Content-Type': 'application/json',
        },
      });
      setError(null);
      return response.data;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch product';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const getProductsByCategory = async (categoryId: string, params?: PaginationParams): Promise<ProductsResponse> => {
    setLoading(true);
    try {
      console.log(`API Call: Fetching products for category ${categoryId}`, params);
      
      const response = await axios.get(`${BASEURL}/products`, {
        params: {
          ...params,
          category: categoryId,
        },
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      console.log(`API Response for category ${categoryId}:`, response.data);
      
      setError(null);
      
      return {
        products: response.data,
        total: response.data.length,
        page: params?.page || 1,
        pages: Math.ceil(response.data.length / (params?.limit || 10)),
      };
    } catch (err) {
      console.error(`API Error for category ${categoryId}:`, err);
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch products by category';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const searchProducts = async (query: string, params?: PaginationParams): Promise<ProductsResponse> => {
    setLoading(true);
    try {
      const response = await axios.get(`${BASEURL}/products`, {
        params: {
          ...params,
          search: query,
        },
        headers: {
          'Content-Type': 'application/json',
        },
      });
      setError(null);
      
      return {
        products: response.data,
        total: response.data.length,
        page: params?.page || 1,
        pages: Math.ceil(response.data.length / (params?.limit || 10)),
      };
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to search products';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return {
    // State
    loading,
    error,
    
    // Categories methods
    fetchCategories,
    getCategoryById,
    
    // Products methods
    fetchProducts,
    getProductById,
    getProductsByCategory,
    searchProducts,
    
    // Utility
    clearError: () => setError(null),
  };
};

// Optional: Create specialized hooks for better separation
export const usePublicCategories = () => {
  const { fetchCategories, getCategoryById, loading, error, clearError } = usePublic();
  
  return {
    loading,
    error,
    clearError,
    fetchCategories,
    getCategoryById,
  };
};

export const usePublicProducts = () => {
  const { 
    fetchProducts, 
    getProductById, 
    getProductsByCategory, 
    searchProducts, 
    loading, 
    error, 
    clearError 
  } = usePublic();
  
  return {
    loading,
    error,
    clearError,
    fetchProducts,
    getProductById,
    getProductsByCategory,
    searchProducts,
  };
};