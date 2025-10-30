
import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from './useAuth';
import { BASEURL } from '@/config/api/contants';
import { uploadImageToCloudinary, CloudinaryUploadResponse } from '@/utils/cloudinary';

interface LandlordVerification {
  landlordId: string;
  fullName: string;
  photoUrl: string;
  homeAddress: string;
  phoneNumber: string;
  phoneNumber2?: string;
  email: string;
  documentType: string;
  documentNumber: string;
  status: 'pending' | 'verified' | 'rejected' | 'not_submitted';
  rejectionReason?: string;
  submittedAt: string;
}
export const useLandlord = () => {
  const { user } = useAuth();
  const router = useRouter();
  const [verificationStatus, setVerificationStatus] = useState<LandlordVerification | null>(null);
  const [verifications, setVerifications] = useState<LandlordVerification[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Memoize checkVerificationStatus
  const checkVerificationStatus = useCallback(async () => {
    if (!user || user.role !== 'landlord') return;

    setLoading(true);
    try {
      const response = await fetch(`${BASEURL}/landlord/verification-status`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch verification status');
      }

      const data = await response.json();
      setVerificationStatus(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  }, [user]); // Add user as dependency

  // Memoize getAllVerifications
  const getAllVerifications = useCallback(async () => {
    if (!user || user.role !== 'admin') return;

    setLoading(true);
    try {
      const response = await fetch(`${BASEURL}/landlord/verifications`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch verifications');
      }

      const data = await response.json();
      setVerifications(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  }, [user]); // Add user as dependency

  // Memoize submitVerification
  const submitVerification = useCallback(async (verificationData: {
    fullName: string;
    photo: File;
    homeAddress: string;
    phoneNumber: string;
    phoneNumber2?: string;
    email: string;
  }) => {
    setLoading(true);
    setError(null);

    try {
      const cloudinaryResponse: CloudinaryUploadResponse = await uploadImageToCloudinary(verificationData.photo, {
        folder: 'landlord_verifications',
        uploadPreset: process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET,
      });

      const verificationPayload = {
        fullName: verificationData.fullName,
        photoUrl: cloudinaryResponse.secure_url,
        homeAddress: verificationData.homeAddress,
        phoneNumber: verificationData.phoneNumber,
        phoneNumber2: verificationData.phoneNumber2,
        email: verificationData.email,
      };

      const response = await fetch(`${BASEURL}/landlord/verify-landlord`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify(verificationPayload),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to submit verification');
      }

      await checkVerificationStatus();
      router.push('/landlord/profile');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  }, [checkVerificationStatus, router]);

  // Memoize updateVerification
  const updateVerification = useCallback(async (landlordId: string, status: 'verified' | 'rejected', rejectionReason?: string) => {
    if (!user || user.role !== 'admin') return;

    setLoading(true);
    setError(null);

    try {
      const payload: { status: string; rejectionReason?: string } = { status };
      if (status === 'rejected' && rejectionReason) {
        payload.rejectionReason = rejectionReason;
      }

      const response = await fetch(`${BASEURL}/landlord/verify-landlord/${landlordId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        throw new Error('Failed to update verification status');
      }

      await getAllVerifications();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  }, [user, getAllVerifications]);

  // Fixed useEffect
  useEffect(() => {
    if (user && user.role === 'landlord') {
      checkVerificationStatus();
    } else if (user && user.role === 'admin') {
      getAllVerifications();
    }
  }, [user, checkVerificationStatus, getAllVerifications]); // Add the memoized functions

  return { 
    verificationStatus, 
    verifications, 
    loading, 
    error, 
    setError, 
    submitVerification, 
    checkVerificationStatus, 
    getAllVerifications, 
    updateVerification 
  };
};