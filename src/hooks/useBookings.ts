import { useState, useCallback } from 'react';
import { useAuth } from './useAuth';
import { BASEURL } from '@/config/api/contants';
import { uploadToCloudinary, CloudinaryUploadResponse } from '@/utils/cloudinary';

export enum BookingStatus {
  PENDING = 'pending',
  CONFIRMED = 'confirmed',
  COMPLETED = 'completed',
  CANCELLED = 'cancelled',
  EXPIRED = 'expired',
}

export enum IdType {
  NATIONAL_ID = 'National ID',
  DRIVERS_LICENSE = "Driver's License",
  PASSPORT = 'Passport',
  VOTERS_CARD = "Voter's Card",
  INTERNATIONAL_PASSPORT = 'International Passport',
}

export interface Booking {
  _id: string;
  propertyId: string;
  userId?: string;
  fullName: string;
  email: string;
  phone: string;
  address: string;
  dateOfBirth: string;
  occupation: string;
  idType: IdType;
  idNumber: string;
  parentName?: string;
  parentPhone?: string;
  parentEmail?: string;
  parentAddress?: string;
  verificationPhoto: string;
  status: BookingStatus;
  bookingDate: string;
  expiryDate: string;
  paymentCompleted: boolean;
  paymentDate?: string;
  paymentReference?: string;
  bookingReference: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateBookingData {
  propertyId: string;
  fullName: string;
  email: string;
  phone: string;
  address: string;
  dateOfBirth: string;
  occupation: string;
  idType: IdType;
  idNumber: string;
  parentName?: string;
  parentPhone?: string;
  parentEmail?: string;
  parentAddress?: string;
  verificationPhoto: File | string;
  idDocumentImage?: File | string;
  notes?: string;
}

export interface PropertyAvailability {
  available: boolean;
  booking?: Booking;
}

export const useBookings = () => {
  const { user } = useAuth();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [currentBooking, setCurrentBooking] = useState<Booking | null>(null);
  const [availability, setAvailability] = useState<PropertyAvailability | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Create a new booking
  const createBooking = useCallback(async (bookingData: CreateBookingData): Promise<Booking | null> => {
    setLoading(true);
    setError(null);

    try {
      // Upload verification photo if it's a File
      let verificationPhotoUrl = bookingData.verificationPhoto;
      let idDocumentImageUrl = bookingData.idDocumentImage;
      
      if (bookingData.verificationPhoto instanceof File) {
        try {
          const uploadResponse: CloudinaryUploadResponse = await uploadToCloudinary(
            bookingData.verificationPhoto,
            {
              folder: 'bookings/verification-photos',
              uploadPreset: process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET,
            }
          );
          verificationPhotoUrl = uploadResponse.secure_url;
        } catch (uploadError) {
          console.error('Verification photo upload failed:', uploadError);
          throw new Error('Failed to upload verification photo. Please try again.');
        }
      }

      // Upload ID document image if provided and it's a File
      if (bookingData.idDocumentImage instanceof File) {
        try {
          const uploadResponse: CloudinaryUploadResponse = await uploadToCloudinary(
            bookingData.idDocumentImage,
            {
              folder: 'bookings/id-documents',
              uploadPreset: process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET,
            }
          );
          idDocumentImageUrl = uploadResponse.secure_url;
        } catch (uploadError) {
          console.error('ID document upload failed:', uploadError);
          throw new Error('Failed to upload ID document image. Please try again.');
        }
      }

      const token = user ? localStorage.getItem('token') : null;
      const headers: HeadersInit = {
        'Content-Type': 'application/json',
      };

      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }

      const payload = {
        ...bookingData,
        verificationPhoto: verificationPhotoUrl,
        idDocumentImage: idDocumentImageUrl,
      };

      const response = await fetch(`${BASEURL}/real-estates/bookings`, {
        method: 'POST',
        headers,
        credentials: 'include',
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        const serverMessage = typeof errorData?.message === 'object'
          ? JSON.stringify(errorData.message)
          : errorData?.message;
        const fallbackMessage = errorData?.error || errorData?.errors || `Failed to create booking: ${response.status} ${response.statusText}`;
        throw new Error(serverMessage || fallbackMessage);
      }

      const data = await response.json();
      const booking = data.booking || data;

      setCurrentBooking(booking);
      return booking;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to create booking';
      setError(errorMessage);
      console.error('Error creating booking:', err);
      return null;
    } finally {
      setLoading(false);
    }
  }, [user]);

  // Check property availability
  const checkAvailability = useCallback(async (propertyId: string): Promise<PropertyAvailability | null> => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`${BASEURL}/real-estates/bookings/check-availability/${propertyId}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`Failed to check availability: ${response.status}`);
      }

      const data: PropertyAvailability = await response.json();
      setAvailability(data);
      return data;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to check availability';
      setError(errorMessage);
      console.error('Error checking availability:', err);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  // Get booking by reference (public - no auth required)
  const getBookingByReference = useCallback(async (reference: string): Promise<Booking | null> => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`${BASEURL}/real-estates/bookings/reference/${reference}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch booking: ${response.status}`);
      }

      const booking: Booking = await response.json();
      setCurrentBooking(booking);
      return booking;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch booking';
      setError(errorMessage);
      console.error('Error fetching booking:', err);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  // Get bookings by email (public - no auth required)
  const getBookingsByEmail = useCallback(async (email: string): Promise<Booking[]> => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`${BASEURL}/real-estates/bookings/search/by-email?email=${encodeURIComponent(email)}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch bookings: ${response.status}`);
      }

      const data: Booking[] = await response.json();
      setBookings(data);
      return data;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch bookings';
      setError(errorMessage);
      console.error('Error fetching bookings:', err);
      return [];
    } finally {
      setLoading(false);
    }
  }, []);

  // Get my bookings (authenticated users only)
  const getMyBookings = useCallback(async (): Promise<Booking[]> => {
    if (!user) {
      setError('You must be logged in to view your bookings');
      return [];
    }

    setLoading(true);
    setError(null);

    try {
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('Authentication token not found');
      }

      const response = await fetch(`${BASEURL}/real-estates/bookings/my-bookings`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        credentials: 'include',
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch bookings: ${response.status}`);
      }

      const data: Booking[] = await response.json();
      setBookings(data);
      return data;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch your bookings';
      setError(errorMessage);
      console.error('Error fetching my bookings:', err);
      return [];
    } finally {
      setLoading(false);
    }
  }, [user]);

  // Cancel booking
  const cancelBooking = useCallback(async (bookingId: string): Promise<boolean> => {
    setLoading(true);
    setError(null);

    try {
      const token = user ? localStorage.getItem('token') : null;
      const headers: HeadersInit = {
        'Content-Type': 'application/json',
      };

      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }

      const response = await fetch(`${BASEURL}/real-estates/bookings/${bookingId}`, {
        method: 'DELETE',
        headers,
        credentials: token ? 'include' : 'same-origin',
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `Failed to cancel booking: ${response.statusText}`);
      }

      // Remove from local state
      setBookings(prev => prev.filter(b => b._id !== bookingId));
      if (currentBooking?._id === bookingId) {
        setCurrentBooking(null);
      }

      return true;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to cancel booking';
      setError(errorMessage);
      console.error('Error cancelling booking:', err);
      return false;
    } finally {
      setLoading(false);
    }
  }, [user, currentBooking]);

  // Get all bookings (Admin/Landlord only)
  const getAllBookings = useCallback(async (filters?: {
    propertyId?: string;
    status?: BookingStatus;
  }): Promise<Booking[]> => {
    if (!user || (user.role !== 'admin' && user.role !== 'landlord')) {
      setError('Unauthorized: Only admins and landlords can view all bookings');
      return [];
    }

    setLoading(true);
    setError(null);

    try {
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('Authentication token not found');
      }

      const queryParams = new URLSearchParams();
      if (filters?.propertyId) queryParams.append('propertyId', filters.propertyId);
      if (filters?.status) queryParams.append('status', filters.status);

      const url = `${BASEURL}/real-estates/bookings${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;

      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        credentials: 'include',
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch bookings: ${response.status}`);
      }

      const data: Booking[] = await response.json();
      setBookings(data);
      return data;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch bookings';
      setError(errorMessage);
      console.error('Error fetching all bookings:', err);
      return [];
    } finally {
      setLoading(false);
    }
  }, [user]);

  return {
    // State
    bookings,
    currentBooking,
    availability,
    loading,
    error,

    // Actions
    createBooking,
    checkAvailability,
    getBookingByReference,
    getBookingsByEmail,
    getMyBookings,
    cancelBooking,
    getAllBookings,
    setCurrentBooking,
    setError,
  };
};
