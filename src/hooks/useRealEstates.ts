import { useState, useEffect, useCallback } from 'react';
import { useAuth } from './useAuth';
import { BASEURL } from '@/config/api/contants';
import { uploadMultipleImagesToCloudinary, CloudinaryUploadResponse } from '@/utils/cloudinary';

interface RealEstate {
  id: string;
  title: string;
  description: string;
  price: number;
  address: string;
  propertyType: string;
  bedrooms: number;
  bathrooms: number;
  area: number;
  images: string[];
  totalRooms?: number;
  roomsBooked?: number;
  roomsAvailable?: number;
  yearBuilt?: number;
  amenities?: string[];
  contactInfo?: {
    name: string;
    phone: string;
    email: string;
  };
  landlordId: string;
  verified: boolean;
  availability?: boolean;
  isBooked?: boolean;
  bookingStatus?: string;
  booking?: any;
}

interface CreateRealEstatePayload {
  title: string;
  description: string;
  price: number;
  address: string;
  propertyType: string;
  bedrooms: number;
  bathrooms: number;
  area: number;
  images: File[] | string[];
  totalRooms?: number;
}
interface UpdateRealEstatePayload {
  title?: string;
  description?: string;
  price?: number;
  address?: string;
  propertyType?: string;
  bedrooms?: number;
  bathrooms?: number;
  area?: number;
  images?: File[] | string[];
  totalRooms?: number;
}

interface UseRealEstatesOptions {
  fetchMode?: 'all' | 'public' | 'landlord' | 'auto';
  enableFilters?: boolean;
}

export const useRealEstates = (options: UseRealEstatesOptions = {}) => {
  const { user, loading: authLoading } = useAuth();
  const { fetchMode = 'auto', enableFilters = true } = options;
  
  const [realEstates, setRealEstates] = useState<RealEstate[]>([]);
  const [propertyDetails, setPropertyDetails] = useState<RealEstate | null>(null);
  const [loading, setLoading] = useState(true);
  const [detailsLoading, setDetailsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [detailsError, setDetailsError] = useState<string | null>(null);
  const [createLoading, setCreateLoading] = useState(false);
  const [createError, setCreateError] = useState<string | null>(null);
  const [updateLoading, setUpdateLoading] = useState(false);
  const [updateError, setUpdateError] = useState<string | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const [priceRange, setPriceRange] = useState({ min: 100000, max: 15000000 });
  const [propertyType, setPropertyType] = useState('');
  const [bedrooms, setBedrooms] = useState('');
  const [bathrooms, setBathrooms] = useState('');
  const [sortBy, setSortBy] = useState('price');

  // Transform backend data to frontend format
  const transformRealEstateData = useCallback((data: any[]): RealEstate[] => {
    return data.map(estate => {
      const totalRooms = typeof estate.totalRooms === 'number' ? estate.totalRooms : undefined;
      const roomsBooked = typeof estate.roomsBooked === 'number' ? estate.roomsBooked : undefined;
      const roomsAvailable = typeof estate.roomsAvailable === 'number' ? estate.roomsAvailable : undefined;
      const isLodge = (estate.propertyType || '').toLowerCase() === 'lodge';

      // Enhanced booking detection logic
      const isBooked = isLodge && typeof roomsAvailable === 'number'
        ? roomsAvailable <= 0
        : estate.bookingStatus === 'confirmed' || 
          estate.bookingStatus === 'booked' ||
          estate.isBooked === true ||
          estate.booked === true ||
          estate.status === 'occupied' ||
          (estate.booking && Object.keys(estate.booking).length > 0) ||
          estate.availability === false;

      const availability = isLodge && typeof roomsAvailable === 'number'
        ? roomsAvailable > 0
        : !isBooked;

      return {
        id: estate._id || estate.id || '',
        title: estate.title || '',
        description: estate.description || '',
        price: estate.price || 0,
        address: estate.address || '',
        propertyType: estate.propertyType || '',
        bedrooms: estate.bedrooms || 0,
        bathrooms: estate.bathrooms || 0,
        area: estate.area || 0,
        images: estate.images || [],
        totalRooms,
        roomsBooked,
        roomsAvailable,
        yearBuilt: estate.yearBuilt,
        amenities: estate.amenities || [],
        contactInfo: estate.contactInfo || {
          name: user?.name || 'Property Owner',
          phone: '+1 (555) 123-4567',
          email: user?.email || 'contact@flourishrealestate.com'
        },
        landlordId: estate.landlordId || '',
        verified: estate.verified || false,
        availability,
        isBooked,
        bookingStatus: estate.bookingStatus || estate.status || (isBooked ? 'booked' : 'available'),
        booking: estate.booking || undefined,
      };
    });
  }, [user]);

  // Apply filters and sorting
  const applyFiltersAndSorting = useCallback((estates: RealEstate[]): RealEstate[] => {
    if (!enableFilters) return estates;

    let filtered = [...estates];

    // Price range filter
    if (priceRange.min || priceRange.max) {
      filtered = filtered.filter(estate =>
        (priceRange.min ? estate.price >= priceRange.min : true) &&
        (priceRange.max ? estate.price <= priceRange.max : true)
      );
    }

    // Property type filter
    if (propertyType) {
      filtered = filtered.filter(estate =>
        estate.propertyType.toLowerCase() === propertyType.toLowerCase()
      );
    }

    // Bedrooms filter
    if (bedrooms) {
      filtered = filtered.filter(estate =>
        estate.bedrooms === parseInt(bedrooms, 10)
      );
    }

    // Bathrooms filter
    if (bathrooms) {
      filtered = filtered.filter(estate =>
        estate.bathrooms === parseInt(bathrooms, 10)
      );
    }

    // Sorting
    filtered.sort((a, b) => {
      if (sortBy === 'price') {
        return a.price - b.price;
      } else if (sortBy === 'area') {
        return a.area - b.area;
      } else if (sortBy === 'title') {
        return a.title.localeCompare(b.title);
      }
      return 0;
    });

    return filtered;
  }, [priceRange, propertyType, bedrooms, bathrooms, sortBy, enableFilters]);

  // Main fetch function with smart endpoint selection
  const fetchRealEstates = useCallback(async () => {
    if (authLoading) return;

    setLoading(true);
    setError(null);

    try {
      const token = user ? localStorage.getItem('token') : null;
      let url: string;
      const headers: HeadersInit = {
        'Content-Type': 'application/json',
      };

      // Determine endpoint based on fetchMode and user context
      if (fetchMode === 'auto') {
        if (user && user.role === 'landlord' && token) {
          // Landlord dashboard - fetch their properties
          url = `${BASEURL}/real-estates/my-properties`;
          headers['Authorization'] = `Bearer ${token}`;
        } else if (user && user.role === 'admin' && token) {
          // Admin dashboard - fetch all properties
          url = `${BASEURL}/real-estates`;
          headers['Authorization'] = `Bearer ${token}`;
        } else {
          // Public access - fetch public properties
          url = `${BASEURL}/real-estates/public`;
        }
      } else if (fetchMode === 'landlord') {
        if (!user || user.role !== 'landlord' || !token) {
          throw new Error('Landlord authentication required');
        }
        url = `${BASEURL}/real-estates/my-properties`;
        headers['Authorization'] = `Bearer ${token}`;
      } else if (fetchMode === 'all') {
        if (!token) {
          throw new Error('Authentication required');
        }
        url = `${BASEURL}/real-estates`;
        headers['Authorization'] = `Bearer ${token}`;
      } else {
        // Public mode
        url = `${BASEURL}/real-estates/public`;
      }

      const response = await fetch(url, {
        headers,
        method: 'GET',
        credentials: 'include',
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch real estates: ${response.status} ${response.statusText}`);
      }

      const data: any[] = await response.json();
      
      // Log booking status for debugging
      const bookedProperties = data.filter(p => p.isBooked === true);
      console.log(`[useRealEstates] API returned ${data.length} properties, ${bookedProperties.length} marked as booked`);
      if (bookedProperties.length > 0) {
        console.log('[useRealEstates] Booked properties:', bookedProperties.map(p => ({
          id: p._id,
          title: p.title,
          isBooked: p.isBooked,
          bookingStatus: p.bookingStatus
        })));
      }
      
      const transformedData = transformRealEstateData(data);
      const filteredData = applyFiltersAndSorting(transformedData);

      setRealEstates(filteredData);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An unknown error occurred';
      setError(errorMessage);
      console.error('Error fetching real estates:', err);
    } finally {
      setLoading(false);
    }
  }, [user, authLoading, fetchMode, transformRealEstateData, applyFiltersAndSorting]);

  // Fetch landlord's properties specifically
  const fetchMyProperties = useCallback(async () => {
    if (!user || user.role !== 'landlord') {
      setError('Only landlords can fetch their properties');
      return [];
    }

    setLoading(true);
    setError(null);

    try {
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('Authentication token not found');
      }

      const response = await fetch(`${BASEURL}/real-estates/my-properties`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        credentials: 'include',
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch your properties: ${response.status} ${response.statusText}`);
      }

      const data: any[] = await response.json();
      const transformedData = transformRealEstateData(data);

      setRealEstates(transformedData);
      return transformedData;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An unknown error occurred';
      setError(errorMessage);
      console.error('Error fetching landlord properties:', err);
      return [];
    } finally {
      setLoading(false);
    }
  }, [user, transformRealEstateData]);

  // Fetch property details by ID
  const fetchPropertyDetails = useCallback(async (id: string) => {
    if (!id) return null;

    setDetailsLoading(true);
    setDetailsError(null);

    try {
      const response = await fetch(`${BASEURL}/real-estates/public/${id}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch property details: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      const transformedData = transformRealEstateData([data])[0];

      setPropertyDetails(transformedData);
      return transformedData;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An unknown error occurred';
      setDetailsError(errorMessage);
      console.error('Error fetching property details:', err);
      return null;
    } finally {
      setDetailsLoading(false);
    }
  }, [transformRealEstateData]);

  // Create real estate
  const createRealEstate = async (payload: CreateRealEstatePayload) => {
    if (!user || (user.role !== 'landlord' && user.role !=='admin')) {
      setCreateError('Only landlords can create real estate listings');
      return false;
    }

    setCreateLoading(true);
    setCreateError(null);

    try {
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('Authentication token not found');
      }

      // Handle images - check if they are Files or URLs
      let imageUrls: string[] = [];
      if (payload.images && payload.images.length > 0) {
        if (typeof payload.images[0] === 'string') {
          // If images are already URLs (string[]), use them directly
          imageUrls = payload.images as string[];
        } else {
          // If images are Files, upload to Cloudinary
          try {
            const uploadResponses: CloudinaryUploadResponse[] = await uploadMultipleImagesToCloudinary(
              payload.images as File[],
              {
                folder: 'real-estates',
                uploadPreset: process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET,
              }
            );
            imageUrls = uploadResponses.map(response => response.secure_url);
          } catch (uploadError) {
            console.error('Image upload failed:', uploadError);
            // Continue without images rather than failing completely
          }
        }
      }

      const backendPayload = {
        title: payload.title,
        description: payload.description,
        price: payload.price,
        address: payload.address,
        propertyType: payload.propertyType,
        bedrooms: payload.bedrooms,
        bathrooms: payload.bathrooms,
        area: payload.area,
        totalRooms: payload.totalRooms,
        images: imageUrls,
      };

      const response = await fetch(`${BASEURL}/real-estates`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        credentials: 'include',
        body: JSON.stringify(backendPayload),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `Failed to create real estate: ${response.statusText}`);
      }

      const newEstate = await response.json();
      const transformedEstate = transformRealEstateData([newEstate])[0];

      setRealEstates(prev => [...prev, transformedEstate]);
      return true;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to create property';
      setCreateError(errorMessage);
      console.error('Error creating real estate:', err);
      return false;
    } finally {
      setCreateLoading(false);
    }
  };

  // Update real estate
  const updateRealEstate = async (id: string, payload: UpdateRealEstatePayload) => {
    if  (!user || (user.role !== 'landlord' && user.role !=='admin'))  {
      setUpdateError('Only landlords can update real estate listings');
      return false;
    }

    setUpdateLoading(true);
    setUpdateError(null);

    try {
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('Authentication token not found');
      }

      // Handle images
      let imageUrls: string[] | undefined;
      if (payload.images) {
        if (Array.isArray(payload.images) && payload.images.length > 0) {
          if (typeof payload.images[0] === 'string') {
            // If images are strings (URLs), use them directly
            imageUrls = payload.images as string[];
          } else if (payload.images[0] instanceof File) {
            // If images are Files, upload to Cloudinary
            try {
              const uploadResponses: CloudinaryUploadResponse[] = await uploadMultipleImagesToCloudinary(
                payload.images as File[],
                {
                  folder: 'real-estates',
                  uploadPreset: process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET,
                }
              );
              imageUrls = uploadResponses.map(response => response.secure_url);
            } catch (uploadError) {
              console.error('Image upload failed:', uploadError);
              // Optionally continue without images
            }
          }
        }
      }

      const backendPayload = {
        ...payload,
        images: imageUrls,
      };

      const response = await fetch(`${BASEURL}/real-estates/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        credentials: 'include',
        body: JSON.stringify(backendPayload),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `Failed to update real estate: ${response.statusText}`);
      }

      const updatedEstate = await response.json();
      const transformedEstate = transformRealEstateData([updatedEstate])[0];

      setRealEstates(prev =>
        prev.map(estate => estate.id === id ? transformedEstate : estate)
      );

      if (propertyDetails && propertyDetails.id === id) {
        setPropertyDetails(transformedEstate);
      }

      return true;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to update property';
      setUpdateError(errorMessage);
      console.error('Error updating real estate:', err);
      return false;
    } finally {
      setUpdateLoading(false);
    }
  };

  // Delete real estate
  const deleteRealEstate = async (id: string) => {
    if  (!user || (user.role !== 'landlord' && user.role !=='admin'))  {
      setDeleteError('Only landlords can delete real estate listings');
      return false;
    }

    setDeleteLoading(true);
    setDeleteError(null);

    try {
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('Authentication token not found');
      }

      const response = await fetch(`${BASEURL}/real-estates/${id}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        credentials: 'include',
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `Failed to delete real estate: ${response.statusText}`);
      }

      setRealEstates(prev => prev.filter(estate => estate.id !== id));

      if (propertyDetails && propertyDetails.id === id) {
        setPropertyDetails(null);
      }

      return true;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to delete property';
      setDeleteError(errorMessage);
      console.error('Error deleting real estate:', err);
      return false;
    } finally {
      setDeleteLoading(false);
    }
  };

  // Refresh data
  const refreshData = useCallback(() => {
    fetchRealEstates();
  }, [fetchRealEstates]);

  // Effect to fetch data on mount and when dependencies change
  useEffect(() => {
    fetchRealEstates();
  }, [fetchRealEstates]);

  // Effect to apply filters when they change
  useEffect(() => {
    if (realEstates.length > 0 && enableFilters) {
      const filteredData = applyFiltersAndSorting(realEstates);
      if (JSON.stringify(filteredData) !== JSON.stringify(realEstates)) {
        setRealEstates(filteredData);
      }
    }
  }, [priceRange, propertyType, bedrooms, bathrooms, sortBy]);

  return {
    // Data
    realEstates,
    propertyDetails,

    // Loading states
    loading,
    detailsLoading,
    createLoading,
    updateLoading,
    deleteLoading,

    // Error states
    error,
    detailsError,
    createError,
    updateError,
    deleteError,

    // Filter states
    priceRange,
    setPriceRange,
    propertyType,
    setPropertyType,
    bedrooms,
    setBedrooms,
    bathrooms,
    setBathrooms,
    sortBy,
    setSortBy,

    // Actions
    fetchPropertyDetails,
    fetchMyProperties,
    createRealEstate,
    updateRealEstate,
    deleteRealEstate,
    refreshData,

    // Computed values
    verifiedPropertiesCount: realEstates.filter(estate => estate.verified).length,
    pendingPropertiesCount: realEstates.filter(estate => !estate.verified).length,
    totalPropertiesCount: realEstates.length,
    bookedPropertiesCount: realEstates.filter(estate => estate.isBooked).length,
    availablePropertiesCount: realEstates.filter(estate => !estate.isBooked).length,
  };
};