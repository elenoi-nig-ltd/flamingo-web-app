// hooks/useMarquee.ts
'use client';

import { useState, useEffect } from 'react';
import axios from 'axios';
import { BASEURL } from '@/config/api/contants';
import { getAuthHeaders } from '@/utils/auth';

interface Marquee {
  _id: string;
  text: string;
  isActive: boolean;
  order: number;
  createdAt?: string;
  updatedAt?: string;
}

interface MarqueeFormData {
  text: string;
  isActive?: boolean;
  order?: number;
}

interface UseMarqueeReturn {
  marquees: Marquee[];
  activeMarquees: Marquee[];
  loading: boolean;
  error: string | null;
  createMarquee: (marqueeData: MarqueeFormData) => Promise<Marquee>;
  updateMarquee: (id: string, marqueeData: MarqueeFormData) => Promise<Marquee>;
  deleteMarquee: (id: string) => Promise<void>;
  getMarqueeById: (id: string) => Promise<Marquee>;
  refetchMarquees: () => Promise<void>;
  refetchActiveMarquees: () => Promise<void>;
}

export const useMarquee = (): UseMarqueeReturn => {
  const [marquees, setMarquees] = useState<Marquee[]>([]);
  const [activeMarquees, setActiveMarquees] = useState<Marquee[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchMarquees = async () => {
    setLoading(true);
    try {
      const headers = getAuthHeaders();
      const response = await axios.get(`${BASEURL}/marquee`, { headers });
      const marqueesData = Array.isArray(response.data) ? response.data : [];
      setMarquees(marqueesData);
      setError(null);
    } catch (err: any) {
      console.error('Error fetching marquees:', err.response?.data || err.message || err);
      
      let errorMessage = 'Failed to fetch marquees';
      
      if (err.response?.status === 401) {
        errorMessage = 'Unauthorized: Please log in';
      } else if (err.response?.status === 403) {
        errorMessage = 'Forbidden: Admin privileges required';
      } else if (err.response?.status === 404) {
        errorMessage = 'Marquees endpoint not found';
      } else if (err.response?.status >= 500) {
        errorMessage = 'Server error: Please try again later';
      } else if (err.response?.data?.message) {
        errorMessage = err.response.data.message;
      } else if (err.message) {
        errorMessage = err.message;
      }
      
      setError(errorMessage);
      setMarquees([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchActiveMarquees = async () => {
    setLoading(true);
    try {
      // Public endpoint - no auth required
      const response = await axios.get(`${BASEURL}/marquee/active`);
      const marqueesData = Array.isArray(response.data) ? response.data : [];
      setActiveMarquees(marqueesData);
      setError(null);
    } catch (err: any) {
      // Silently handle errors for public endpoint to not break the UI
      console.error('Error fetching active marquees:', err);
      
      // Don't set error state for public endpoint to prevent UI disruption
      // The component will simply use default text
      setActiveMarquees([]);
      setError(null);
    } finally {
      setLoading(false);
    }
  };

  const createMarquee = async (marqueeData: MarqueeFormData): Promise<Marquee> => {
    try {
      if (!marqueeData.text || !marqueeData.text.trim()) {
        throw new Error('Marquee text is required');
      }

      const headers = getAuthHeaders();
      const cleanMarqueeData = {
        text: marqueeData.text.trim(),
        isActive: marqueeData.isActive !== undefined ? marqueeData.isActive : true,
        order: marqueeData.order !== undefined ? marqueeData.order : 0,
      };

      const response = await axios.post(
        `${BASEURL}/marquee`, 
        cleanMarqueeData, 
        { headers }
      );
      
      // Update local state with the new marquee
      setMarquees((prev) => [...prev, response.data]);
      if (response.data.isActive) {
        setActiveMarquees((prev) => [...prev, response.data]);
      }
      
      return response.data;
    } catch (err: any) {
      console.error('Error creating marquee:', err.response?.data || err.message || err);
      throw new Error(err.response?.data?.message || err.message || 'Failed to create marquee');
    }
  };

  const updateMarquee = async (id: string, marqueeData: MarqueeFormData): Promise<Marquee> => {
    try {
      if (!id) {
        throw new Error('Marquee ID is required');
      }

      const headers = getAuthHeaders();
      const cleanMarqueeData: any = {};
      
      if (marqueeData.text !== undefined) {
        cleanMarqueeData.text = marqueeData.text.trim();
      }
      if (marqueeData.isActive !== undefined) {
        cleanMarqueeData.isActive = marqueeData.isActive;
      }
      if (marqueeData.order !== undefined) {
        cleanMarqueeData.order = marqueeData.order;
      }

      const response = await axios.put(
        `${BASEURL}/marquee/${id}`, 
        cleanMarqueeData, 
        { headers }
      );
      
      // Update local state
      setMarquees((prev) =>
        prev.map((marquee) => (marquee._id === id ? response.data : marquee))
      );
      setActiveMarquees((prev) =>
        response.data.isActive
          ? prev.map((marquee) => (marquee._id === id ? response.data : marquee))
          : prev.filter((marquee) => marquee._id !== id)
      );
      
      return response.data;
    } catch (err: any) {
      console.error('Error updating marquee:', err.response?.data || err.message || err);
      throw new Error(err.response?.data?.message || err.message || 'Failed to update marquee');
    }
  };

  const deleteMarquee = async (id: string): Promise<void> => {
    try {
      if (!id) {
        throw new Error('Marquee ID is required');
      }

      const headers = getAuthHeaders();
      await axios.delete(`${BASEURL}/marquee/${id}`, { headers });
      
      // Update local state
      setMarquees((prev) => prev.filter((marquee) => marquee._id !== id));
      setActiveMarquees((prev) => prev.filter((marquee) => marquee._id !== id));
    } catch (err: any) {
      console.error('Error deleting marquee:', err.response?.data || err.message || err);
      throw new Error(err.response?.data?.message || err.message || 'Failed to delete marquee');
    }
  };

  const getMarqueeById = async (id: string): Promise<Marquee> => {
    try {
      if (!id) {
        throw new Error('Marquee ID is required');
      }

      const headers = getAuthHeaders();
      const response = await axios.get(`${BASEURL}/marquee/${id}`, { headers });
      return response.data;
    } catch (err: any) {
      console.error('Error fetching marquee by ID:', err.response?.data || err.message || err);
      throw new Error(err.response?.data?.message || err.message || 'Failed to fetch marquee');
    }
  };

  const refetchMarquees = async () => {
    await fetchMarquees();
  };

  const refetchActiveMarquees = async () => {
    await fetchActiveMarquees();
  };

  useEffect(() => {
    // Only fetch if we haven't already
    fetchActiveMarquees().catch(() => {
      // Silently catch any errors
      setLoading(false);
    });
  }, []);

  return {
    marquees,
    activeMarquees,
    loading,
    error,
    createMarquee,
    updateMarquee,
    deleteMarquee,
    getMarqueeById,
    refetchMarquees,
    refetchActiveMarquees,
  };
};
