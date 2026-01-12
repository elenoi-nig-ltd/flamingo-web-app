// hooks/useNotifications.ts
'use client';

import { useState, useEffect } from 'react';
import axios from 'axios';
import { BASEURL } from '@/config/api/contants';
import { getAuthHeaders } from '@/utils/auth';

interface Notification {
  _id: string;
  title: string;
  message: string;
  type: 'order' | 'payment' | 'user' | 'system' | 'product' | 'inventory' | 'real-estate' | 'internet';
  relatedId?: string;
  relatedModel?: string;
  isRead: boolean;
  priority: 'info' | 'success' | 'warning' | 'error';
  metadata?: Record<string, any>;
  createdAt: string;
  updatedAt: string;
}

interface NotificationFormData {
  title: string;
  message: string;
  type: 'order' | 'payment' | 'user' | 'system' | 'product' | 'inventory' | 'real-estate' | 'internet';
  relatedId?: string;
  relatedModel?: string;
  priority?: 'info' | 'success' | 'warning' | 'error';
  metadata?: Record<string, any>;
}

interface UseNotificationsReturn {
  notifications: Notification[];
  unreadNotifications: Notification[];
  unreadCount: number;
  loading: boolean;
  error: string | null;
  createNotification: (notificationData: NotificationFormData) => Promise<Notification>;
  updateNotification: (id: string, notificationData: Partial<NotificationFormData>) => Promise<Notification>;
  markAsRead: (id: string) => Promise<Notification>;
  markAllAsRead: () => Promise<void>;
  deleteNotification: (id: string) => Promise<void>;
  deleteAllNotifications: () => Promise<void>;
  getNotificationById: (id: string) => Promise<Notification>;
  refetchNotifications: () => Promise<void>;
  refetchUnreadCount: () => Promise<void>;
}

export const useNotifications = (): UseNotificationsReturn => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadNotifications, setUnreadNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchNotifications = async () => {
    setLoading(true);
    try {
      const headers = getAuthHeaders();
      const response = await axios.get(`${BASEURL}/notifications`, { headers });
      const notificationsData = Array.isArray(response.data) ? response.data : [];
      setNotifications(notificationsData);
      setError(null);
    } catch (err: any) {
      console.error('Error fetching notifications:', err);
      setError(err.response?.data?.message || err.message || 'Failed to fetch notifications');
      setNotifications([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchUnreadCount = async () => {
    try {
      const headers = getAuthHeaders();
      const response = await axios.get(`${BASEURL}/notifications/unread/count`, { headers });
      setUnreadCount(response.data.count || 0);
    } catch (err: any) {
      console.error('Error fetching unread count:', err);
      setUnreadCount(0);
    }
  };

  const fetchUnreadNotifications = async () => {
    try {
      const headers = getAuthHeaders();
      const response = await axios.get(`${BASEURL}/notifications/unread`, { headers });
      const unreadData = Array.isArray(response.data) ? response.data : [];
      setUnreadNotifications(unreadData);
    } catch (err: any) {
      console.error('Error fetching unread notifications:', err);
      setUnreadNotifications([]);
    }
  };

  const createNotification = async (notificationData: NotificationFormData): Promise<Notification> => {
    try {
      const headers = getAuthHeaders();
      const response = await axios.post(`${BASEURL}/notifications`, notificationData, { headers });
      setNotifications((prev) => [response.data, ...prev]);
      if (!response.data.isRead) {
        setUnreadCount((prev) => prev + 1);
      }
      return response.data;
    } catch (err: any) {
      console.error('Error creating notification:', err);
      throw new Error(err.response?.data?.message || err.message || 'Failed to create notification');
    }
  };

  const updateNotification = async (id: string, notificationData: Partial<NotificationFormData>): Promise<Notification> => {
    try {
      const headers = getAuthHeaders();
      const response = await axios.put(`${BASEURL}/notifications/${id}`, notificationData, { headers });
      setNotifications((prev) => prev.map((n) => (n._id === id ? response.data : n)));
      return response.data;
    } catch (err: any) {
      console.error('Error updating notification:', err);
      throw new Error(err.response?.data?.message || err.message || 'Failed to update notification');
    }
  };

  const markAsRead = async (id: string): Promise<Notification> => {
    try {
      const headers = getAuthHeaders();
      const response = await axios.patch(`${BASEURL}/notifications/${id}/read`, {}, { headers });
      setNotifications((prev) => prev.map((n) => (n._id === id ? response.data : n)));
      setUnreadNotifications((prev) => prev.filter((n) => n._id !== id));
      setUnreadCount((prev) => Math.max(0, prev - 1));
      return response.data;
    } catch (err: any) {
      console.error('Error marking notification as read:', err);
      throw new Error(err.response?.data?.message || err.message || 'Failed to mark as read');
    }
  };

  const markAllAsRead = async (): Promise<void> => {
    try {
      const headers = getAuthHeaders();
      await axios.patch(`${BASEURL}/notifications/read-all`, {}, { headers });
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
      setUnreadNotifications([]);
      setUnreadCount(0);
    } catch (err: any) {
      console.error('Error marking all as read:', err);
      throw new Error(err.response?.data?.message || err.message || 'Failed to mark all as read');
    }
  };

  const deleteNotification = async (id: string): Promise<void> => {
    try {
      const headers = getAuthHeaders();
      await axios.delete(`${BASEURL}/notifications/${id}`, { headers });
      setNotifications((prev) => prev.filter((n) => n._id !== id));
      setUnreadNotifications((prev) => prev.filter((n) => n._id !== id));
      await fetchUnreadCount();
    } catch (err: any) {
      console.error('Error deleting notification:', err);
      throw new Error(err.response?.data?.message || err.message || 'Failed to delete notification');
    }
  };

  const deleteAllNotifications = async (): Promise<void> => {
    try {
      const headers = getAuthHeaders();
      await axios.delete(`${BASEURL}/notifications`, { headers });
      setNotifications([]);
      setUnreadNotifications([]);
      setUnreadCount(0);
    } catch (err: any) {
      console.error('Error deleting all notifications:', err);
      throw new Error(err.response?.data?.message || err.message || 'Failed to delete all notifications');
    }
  };

  const getNotificationById = async (id: string): Promise<Notification> => {
    try {
      const headers = getAuthHeaders();
      const response = await axios.get(`${BASEURL}/notifications/${id}`, { headers });
      return response.data;
    } catch (err: any) {
      console.error('Error fetching notification by ID:', err);
      throw new Error(err.response?.data?.message || err.message || 'Failed to fetch notification');
    }
  };

  const refetchNotifications = async () => {
    await fetchNotifications();
    await fetchUnreadCount();
    await fetchUnreadNotifications();
  };

  const refetchUnreadCount = async () => {
    await fetchUnreadCount();
  };

  useEffect(() => {
    fetchNotifications();
    fetchUnreadCount();
    fetchUnreadNotifications();

    // Poll for new notifications every 30 seconds
    const interval = setInterval(() => {
      fetchUnreadCount();
      fetchUnreadNotifications();
    }, 30000);

    return () => clearInterval(interval);
  }, []);

  return {
    notifications,
    unreadNotifications,
    unreadCount,
    loading,
    error,
    createNotification,
    updateNotification,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    deleteAllNotifications,
    getNotificationById,
    refetchNotifications,
    refetchUnreadCount,
  };
};
