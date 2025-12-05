// src/hooks/useVoucherStorage.ts
import { useState, useCallback, useEffect } from 'react';

export interface VoucherDetails {
  code: string;
  plan: any;
  orderInfo: {
    orderId: string;
    email: string;
    phone: string;
    timestamp: string;
  };
}

export const useVoucherStorage = () => {
  const [voucherDetails, setVoucherDetails] = useState<VoucherDetails | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Get voucher details from sessionStorage
  const getVoucherDetails = useCallback((): VoucherDetails | null => {
    try {
      if (typeof window === 'undefined') return null;
      
      const stored = sessionStorage.getItem('voucherDetails');
      if (stored) {
        return JSON.parse(stored);
      }
    } catch (error) {
      console.error('Error retrieving voucher from sessionStorage:', error);
    }
    return null;
  }, []);

  // Save voucher details to sessionStorage
  const saveVoucherDetails = useCallback((details: VoucherDetails): boolean => {
    try {
      if (typeof window === 'undefined') return false;
      
      sessionStorage.setItem('voucherDetails', JSON.stringify(details));
      setVoucherDetails(details);
      return true;
    } catch (error) {
      console.error('Error saving voucher to sessionStorage:', error);
      return false;
    }
  }, []);

  // Remove voucher details from sessionStorage
  const clearVoucherDetails = useCallback((): void => {
    try {
      if (typeof window === 'undefined') return;
      
      sessionStorage.removeItem('voucherDetails');
      setVoucherDetails(null);
    } catch (error) {
      console.error('Error clearing voucher from sessionStorage:', error);
    }
  }, []);

  // Load voucher details on mount
  useEffect(() => {
    const details = getVoucherDetails();
    setVoucherDetails(details);
    setIsLoading(false);
  }, [getVoucherDetails]);

  // Listen for storage changes (useful if multiple tabs are open)
  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'voucherDetails') {
        if (e.newValue) {
          try {
            setVoucherDetails(JSON.parse(e.newValue));
          } catch (error) {
            console.error('Error parsing voucher from storage event:', error);
          }
        } else {
          setVoucherDetails(null);
        }
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  return {
    voucherDetails,
    isLoading,
    getVoucherDetails,
    saveVoucherDetails,
    clearVoucherDetails,
  };
};
