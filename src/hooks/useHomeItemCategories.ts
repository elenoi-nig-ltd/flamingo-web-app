// hooks/useHomeItemCategories.ts
'use client';

import { useState, useEffect } from 'react';
import axios from 'axios';
import { BASEURL } from '@/config/api/contants';
import { getAuthHeaders } from '@/utils/auth';

interface HomeItemCategory {
  _id: string;
  name: string;
  description?: string;
  createdAt?: string;
  updatedAt?: string;
}

interface HomeItemCategoryFormData {
  name: string;
  description?: string;
}

interface UseHomeItemCategoriesReturn {
  categories: HomeItemCategory[];
  loading: boolean;
  error: string | null;
  createCategory: (categoryData: HomeItemCategoryFormData) => Promise<HomeItemCategory>;
  updateCategory: (id: string, categoryData: HomeItemCategoryFormData) => Promise<HomeItemCategory>;
  deleteCategory: (id: string) => Promise<void>;
  getCategoryById: (id: string) => Promise<HomeItemCategory>;
  refetchCategories: () => Promise<void>;
}

export const useHomeItemCategories = (): UseHomeItemCategoriesReturn => {
  const [categories, setCategories] = useState<HomeItemCategory[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchCategories = async () => {
    setLoading(true);
    try {
      const response = await axios.get(`${BASEURL}/home-item-categories`);
      console.log('Fetch categories response:', response.data);
      
      // Ensure we're working with an array
      const categoriesData = Array.isArray(response.data) ? response.data : [];
      setCategories(categoriesData);
      setError(null);
    } catch (err: any) {
      console.error('Error fetching home item categories:', err.response?.data || err.message || err);
      
      // More specific error handling
      let errorMessage = 'Failed to fetch home item categories';
      
      if (err.response?.status === 401) {
        errorMessage = 'Unauthorized: Please log in to fetch categories';
      } else if (err.response?.status === 403) {
        errorMessage = 'Forbidden: Admin privileges required';
      } else if (err.response?.status === 404) {
        errorMessage = 'Categories endpoint not found';
      } else if (err.response?.status >= 500) {
        errorMessage = 'Server error: Please try again later';
      } else if (err.response?.data?.message) {
        errorMessage = err.response.data.message;
      } else if (err.message) {
        errorMessage = err.message;
      }
      
      setError(errorMessage);
      setCategories([]);
    } finally {
      setLoading(false);
    }
  };

  const createCategory = async (categoryData: HomeItemCategoryFormData): Promise<HomeItemCategory> => {
    try {
      // Validate input data
      if (!categoryData.name || !categoryData.name.trim()) {
        throw new Error('Category name is required');
      }

      const headers = getAuthHeaders();
      console.log('Headers for createCategory:', headers);
      console.log('Category data being sent:', categoryData);
      
      // Ensure we're sending clean data
      const cleanCategoryData = {
        name: categoryData.name.trim(),
        description: categoryData.description?.trim() || ''
      };

      const response = await axios.post(
        `${BASEURL}/home-item-categories`, 
        cleanCategoryData, 
        { headers }
      );
      
      console.log('Create category response:', response.data);
      
      // Update local state with the new category
      setCategories((prev) => [...prev, response.data]);
      setError(null);
      return response.data;
      
    } catch (err: any) {
      console.error('Error creating category:', err.response?.data || err.message || err);
      
      let errorMessage = 'Failed to create home item category';
      
      if (err.response?.status === 401) {
        errorMessage = 'Unauthorized: Please log in as an admin to create a category';
      } else if (err.response?.status === 403) {
        errorMessage = 'Forbidden: Admin privileges required';
      } else if (err.response?.status === 409) {
        errorMessage = 'Category with this name already exists';
      } else if (err.response?.status === 400) {
        // Handle validation errors
        if (err.response?.data?.message) {
          if (Array.isArray(err.response.data.message)) {
            errorMessage = err.response.data.message.join(', ');
          } else {
            errorMessage = err.response.data.message;
          }
        } else {
          errorMessage = 'Invalid category data provided';
        }
      } else if (err.response?.status >= 500) {
        errorMessage = 'Server error: Please try again later';
      } else if (err.response?.data?.message) {
        errorMessage = err.response.data.message;
      } else if (err.message) {
        errorMessage = err.message;
      }
      
      setError(errorMessage);
      throw new Error(errorMessage);
    }
  };

  const updateCategory = async (id: string, categoryData: HomeItemCategoryFormData): Promise<HomeItemCategory> => {
    try {
      // Validate input data
      if (!id || !id.trim()) {
        throw new Error('Category ID is required');
      }
      
      if (!categoryData.name || !categoryData.name.trim()) {
        throw new Error('Category name is required');
      }

      const headers = getAuthHeaders();
      console.log('Headers for updateCategory:', headers);
      console.log('Update category data being sent:', categoryData);
      
      // Ensure we're sending clean data
      const cleanCategoryData = {
        name: categoryData.name.trim(),
        description: categoryData.description?.trim() || ''
      };

      const response = await axios.put(
        `${BASEURL}/home-item-categories/${id}`, 
        cleanCategoryData, 
        { headers }
      );
      
      console.log('Update category response:', response.data);
      
      // Update local state
      setCategories((prev) =>
        prev.map((category) => (category._id === id ? response.data : category))
      );
      setError(null);
      return response.data;
      
    } catch (err: any) {
      console.error('Error updating category:', err.response?.data || err.message || err);
      
      let errorMessage = 'Failed to update home item category';
      
      if (err.response?.status === 401) {
        errorMessage = 'Unauthorized: Please log in as an admin to update a category';
      } else if (err.response?.status === 403) {
        errorMessage = 'Forbidden: Admin privileges required';
      } else if (err.response?.status === 404) {
        errorMessage = 'Category not found';
      } else if (err.response?.status === 409) {
        errorMessage = 'Category with this name already exists';
      } else if (err.response?.status === 400) {
        if (err.response?.data?.message) {
          if (Array.isArray(err.response.data.message)) {
            errorMessage = err.response.data.message.join(', ');
          } else {
            errorMessage = err.response.data.message;
          }
        } else {
          errorMessage = 'Invalid category data provided';
        }
      } else if (err.response?.status >= 500) {
        errorMessage = 'Server error: Please try again later';
      } else if (err.response?.data?.message) {
        errorMessage = err.response.data.message;
      } else if (err.message) {
        errorMessage = err.message;
      }
      
      setError(errorMessage);
      throw new Error(errorMessage);
    }
  };

  const deleteCategory = async (id: string): Promise<void> => {
    try {
      if (!id || !id.trim()) {
        throw new Error('Category ID is required');
      }

      const headers = getAuthHeaders();
      console.log('Headers for deleteCategory:', headers);
      
      await axios.delete(`${BASEURL}/home-item-categories/${id}`, { headers });
      console.log('Category deleted:', id);
      
      // Update local state
      setCategories((prev) => prev.filter((category) => category._id !== id));
      setError(null);
      
    } catch (err: any) {
      console.error('Error deleting category:', err.response?.data || err.message || err);
      
      let errorMessage = 'Failed to delete home item category';
      
      if (err.response?.status === 401) {
        errorMessage = 'Unauthorized: Please log in as an admin to delete a category';
      } else if (err.response?.status === 403) {
        errorMessage = 'Forbidden: Admin privileges required';
      } else if (err.response?.status === 404) {
        errorMessage = 'Category not found';
      } else if (err.response?.status >= 500) {
        errorMessage = 'Server error: Please try again later';
      } else if (err.response?.data?.message) {
        errorMessage = err.response.data.message;
      } else if (err.message) {
        errorMessage = err.message;
      }
      
      setError(errorMessage);
      throw new Error(errorMessage);
    }
  };

  const getCategoryById = async (id: string): Promise<HomeItemCategory> => {
    try {
      if (!id || !id.trim()) {
        throw new Error('Category ID is required');
      }

      const headers = getAuthHeaders();
      console.log('Headers for getCategoryById:', headers);
      
      const response = await axios.get(`${BASEURL}/home-item-categories/${id}`, { headers });
      console.log('Get category by ID response:', response.data);
      
      setError(null);
      return response.data;
      
    } catch (err: any) {
      console.error('Error fetching category by ID:', err.response?.data || err.message || err);
      
      let errorMessage = 'Failed to fetch home item category';
      
      if (err.response?.status === 401) {
        errorMessage = 'Unauthorized: Please log in as an admin to fetch a category';
      } else if (err.response?.status === 403) {
        errorMessage = 'Forbidden: Admin privileges required';
      } else if (err.response?.status === 404) {
        errorMessage = 'Category not found';
      } else if (err.response?.status >= 500) {
        errorMessage = 'Server error: Please try again later';
      } else if (err.response?.data?.message) {
        errorMessage = err.response.data.message;
      } else if (err.message) {
        errorMessage = err.message;
      }
      
      setError(errorMessage);
      throw new Error(errorMessage);
    }
  };

  const refetchCategories = async () => {
    await fetchCategories();
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  return {
    categories,
    loading,
    error,
    createCategory,
    updateCategory,
    deleteCategory,
    getCategoryById,
    refetchCategories,
  };
};