'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { FaUser, FaEnvelope, FaPhone, FaMapMarkerAlt, FaBriefcase, FaIdCard, FaCamera, FaCalendar, FaUsers } from 'react-icons/fa';
import { useBookings, IdType, CreateBookingData } from '@/hooks/useBookings';
import { useRealEstates } from '@/hooks/useRealEstates';

interface BookingFormProps {
  propertyId: string;
  onSuccess?: (booking: any) => void;
  onCancel?: () => void;
}

const BookingForm: React.FC<BookingFormProps> = ({ propertyId, onSuccess, onCancel }) => {
  const router = useRouter();
  const { createBooking, checkAvailability, availability, loading, error } = useBookings();
  const { fetchPropertyDetails, propertyDetails } = useRealEstates();

  const [formData, setFormData] = useState<CreateBookingData>({
    propertyId,
    fullName: '',
    email: '',
    phone: '',
    address: '',
    dateOfBirth: '',
    occupation: '',
    idType: IdType.NATIONAL_ID,
    idNumber: '',
    parentName: '',
    parentPhone: '',
    parentEmail: '',
    parentAddress: '',
    verificationPhoto: '' as any,
    idDocumentImage: '' as any,
    notes: '',
  });

  const [photoPreview, setPhotoPreview] = useState<string>('');
  const [docPreview, setDocPreview] = useState<string>('');
  const [currentStep, setCurrentStep] = useState<number>(1); // 1: Personal, 2: Verification, 3: Parent, 4: Preview
  const [showParentSection, setShowParentSection] = useState(false);
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [uploadingPhotos, setUploadingPhotos] = useState(false);

  const verificationPreview = photoPreview || (typeof formData.verificationPhoto === 'string' ? formData.verificationPhoto : '');
  const idDocumentPreview = docPreview || (typeof formData.idDocumentImage === 'string' ? formData.idDocumentImage : '');

  useEffect(() => {
    // Fetch property details
    fetchPropertyDetails(propertyId);
    
    // Check availability
    checkAvailability(propertyId);
  }, [propertyId]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
    // Clear error for this field
    if (formErrors[name]) {
      setFormErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        setFormErrors(prev => ({ ...prev, verificationPhoto: 'Please select a valid image file' }));
        return;
      }

      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        setFormErrors(prev => ({ ...prev, verificationPhoto: 'Image size should not exceed 5MB' }));
        return;
      }

      setFormData(prev => ({ ...prev, verificationPhoto: file }));
      
      // Create preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setPhotoPreview(reader.result as string);
      };
      reader.readAsDataURL(file);

      // Clear error
      if (formErrors.verificationPhoto) {
        setFormErrors(prev => {
          const newErrors = { ...prev };
          delete newErrors.verificationPhoto;
          return newErrors;
        });
      }
    }
  };

  const handleDocChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (!file.type.startsWith('image/')) {
        setFormErrors(prev => ({ ...prev, idDocumentImage: 'Please select a valid image file' }));
        return;
      }
      if (file.size > 5 * 1024 * 1024) {
        setFormErrors(prev => ({ ...prev, idDocumentImage: 'Image size should not exceed 5MB' }));
        return;
      }
      setFormData(prev => ({ ...prev, idDocumentImage: file } as any));
      const reader = new FileReader();
      reader.onloadend = () => setDocPreview(reader.result as string);
      reader.readAsDataURL(file);
      if (formErrors.idDocumentImage) {
        setFormErrors(prev => { const n = { ...prev }; delete n.idDocumentImage; return n; });
      }
    }
  };

  const validateStep = (step: number): boolean => {
    const errors: Record<string, string> = {};
    if (step === 1) {
      if (!formData.fullName.trim() || formData.fullName.length < 2) {
        errors.fullName = 'Full name is required (minimum 2 characters)';
      }
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(formData.email)) {
        errors.email = 'Please enter a valid email address';
      }
      const phoneRegex = /^[\d\s\+\-\(\)]+$/;
      if (!phoneRegex.test(formData.phone) || formData.phone.length < 10) {
        errors.phone = 'Please enter a valid phone number';
      }
      if (!formData.address.trim() || formData.address.length < 10) {
        errors.address = 'Please enter a valid address (minimum 10 characters)';
      }
      if (!formData.dateOfBirth) {
        errors.dateOfBirth = 'Date of birth is required';
      } else {
        const age = new Date().getFullYear() - new Date(formData.dateOfBirth).getFullYear();
        if (age < 18) {
          errors.dateOfBirth = 'You must be at least 18 years old to book';
        }
      }
      if (!formData.occupation.trim()) {
        errors.occupation = 'Occupation is required';
      }
    } else if (step === 2) {
      if (!formData.idNumber.trim()) {
        errors.idNumber = 'ID number is required';
      }
      if (!formData.verificationPhoto) {
        errors.verificationPhoto = 'Verification photo is required';
      }
      if (!formData.idDocumentImage) {
        errors.idDocumentImage = 'Upload your selected ID document image';
      }
    } else if (step === 3) {
      if (showParentSection) {
        if (!formData.parentName?.trim()) errors.parentName = 'Parent name is required';
        if (!formData.parentPhone?.trim()) errors.parentPhone = 'Parent phone is required';
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (formData.parentEmail && !emailRegex.test(formData.parentEmail)) errors.parentEmail = 'Invalid parent email';
        if (!formData.parentAddress?.trim()) errors.parentAddress = 'Parent address is required';
      }
    }
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateStep(4)) {
      return;
    }

    setIsSubmitting(true);
    setUploadingPhotos(true);

    try {
      const booking = await createBooking(formData);

      if (booking) {
        // Success! Redirect to booking confirmation
        if (onSuccess) {
          onSuccess(booking);
        } else {
          router.push(`/bookings/confirmation?reference=${booking.bookingReference}`);
        }
      }
    } catch (err) {
      console.error('Booking submission error:', err);
    } finally {
      setIsSubmitting(false);
      setUploadingPhotos(false);
    }
  };

  // Check if property is available
  if (availability && !availability.available) {
    return (
      <div className="max-w-2xl mx-auto p-6 bg-white dark:bg-gray-800 rounded-lg shadow-lg">
        <div className="text-center">
          <div className="mb-4 text-red-500 text-6xl">⚠️</div>
          <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-4">
            Property Not Available
          </h2>
          <p className="text-gray-600 dark:text-gray-300 mb-6">
            This property is currently booked by another user. The booking expires on{' '}
            {availability.booking?.expiryDate && new Date(availability.booking.expiryDate).toLocaleDateString()}.
          </p>
          <button
            onClick={() => router.back()}
            className="px-6 py-3 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors"
          >
            Back to Properties
          </button>
        </div>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="max-w-4xl mx-auto p-6 bg-white dark:bg-gray-800 rounded-lg shadow-lg"
    >
      {/* Step Indicator */}
      <div className="mb-8 px-4 py-5 rounded-xl border dark:border-gray-600" style={{ backgroundColor: 'rgba(245, 140, 85, 0.05)', borderColor: 'rgba(245, 140, 85, 0.2)' }}>
        <div className="flex items-start justify-between">
          {[
            { num: 1, label: 'Personal', icon: FaUser },
            { num: 2, label: 'Verification', icon: FaIdCard },
            { num: 3, label: 'Parent Info', icon: FaUsers },
            { num: 4, label: 'Preview', icon: FaCamera }
          ].map((step, idx) => {
            const IconComponent = step.icon;
            const isActive = currentStep === step.num;
            const isCompleted = currentStep > step.num;
            
            return (
              <div key={step.num} className="flex-1 flex flex-col items-center">
                <div className="flex flex-col items-center w-full">
                  {/* Step Circle */}
                  <motion.div
                    animate={{
                      scale: isActive ? 1.1 : 1,
                      boxShadow: isActive ? '0 0 20px rgba(249, 115, 22, 0.4)' : 'none'
                    }}
                    transition={{ duration: 0.3 }}
                    className={`w-14 h-14 rounded-full flex items-center justify-center font-bold text-white transition-all duration-300 ${
                      isCompleted
                        ? 'bg-gradient-to-br from-green-500 to-emerald-600 shadow-lg'
                        : isActive
                        ? 'shadow-lg scale-105'
                        : 'bg-gray-200 dark:bg-gray-600 text-gray-600 dark:text-gray-300'
                    }`}
                    style={isActive ? { backgroundColor: '#f58c55' } : {}}
                  >
                    {isCompleted ? (
                      <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    ) : (
                      <span>{step.num}</span>
                    )}
                  </motion.div>
                  
                  {/* Step Label */}
                  <p className={`mt-3 text-sm font-semibold text-center transition-colors duration-300 ${
                    isCompleted
                      ? 'text-green-600 dark:text-green-400'
                      : 'text-gray-600 dark:text-gray-400'
                  }`}
                  style={isActive ? { color: '#f58c55' } : {}}>
                    {step.label}
                  </p>
                </div>
                
                {/* Connector Line */}
                {step.num < 4 && (
                  <motion.div
                    animate={{
                      backgroundColor: isCompleted ? '#10b981' : currentStep > step.num ? '#f58c55' : '#d1d5db'
                    }}
                    transition={{ duration: 0.3 }}
                    className="flex-1 h-1 mx-2 mt-4 rounded-full min-h-1"
                    style={{ width: 'calc(100% + 8px)' }}
                  />
                )}
              </div>
            );
          })}
        </div>
      </div>
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-800 dark:text-white mb-2">
          Book Your Property
        </h1>
        {propertyDetails && (
          <p className="text-gray-600 dark:text-gray-300">
            {propertyDetails.title} - ₦{propertyDetails.price.toLocaleString()}
          </p>
        )}
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
          Please fill in your details to reserve this property. You have 7 days to complete payment.
        </p>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-red-100 dark:bg-red-900 border border-red-400 dark:border-red-600 text-red-700 dark:text-red-200 rounded-lg">
          {error}
        </div>
      )}

      <form
        onSubmit={handleSubmit}
        className="space-y-6"
        onKeyDown={(e) => {
          if (e.key === 'Enter' && (e.target as HTMLElement).tagName !== 'TEXTAREA') {
            e.preventDefault();
          }
        }}
      >
        {/* Personal Information */}
        {currentStep === 1 && (
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          transition={{ duration: 0.4 }}
          className="border-b border-gray-200 dark:border-gray-700 pb-6">
          <h2 className="text-xl font-semibold text-gray-800 dark:text-white mb-4 flex items-center">
            <FaUser className="mr-2" style={{ color: '#f58c55' }} />
            Personal Information
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Full Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="fullName"
                value={formData.fullName}
                onChange={handleInputChange}
                className={`w-full px-4 py-2 border ${formErrors.fullName ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'} rounded-lg focus:ring-2 dark:bg-gray-700 dark:text-white`}
                style={{ '--tw-ring-color': '#f58c55' } as any}
                placeholder="John Doe"
              />
              {formErrors.fullName && (
                <p className="mt-1 text-sm text-red-500">{formErrors.fullName}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Email Address <span className="text-red-500">*</span>
              </label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                className={`w-full px-4 py-2 border ${formErrors.email ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'} rounded-lg focus:ring-2 dark:bg-gray-700 dark:text-white`}
                style={{ '--tw-ring-color': '#f58c55' } as any}
                placeholder="john@example.com"
              />
              {formErrors.email && (
                <p className="mt-1 text-sm text-red-500">{formErrors.email}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Phone Number <span className="text-red-500">*</span>
              </label>
              <input
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={handleInputChange}
                className={`w-full px-4 py-2 border ${formErrors.phone ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'} rounded-lg focus:ring-2 dark:bg-gray-700 dark:text-white`}
                style={{ '--tw-ring-color': '#f58c55' } as any}
                placeholder="+234 801 234 5678"
              />
              {formErrors.phone && (
                <p className="mt-1 text-sm text-red-500">{formErrors.phone}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Date of Birth <span className="text-red-500">*</span>
              </label>
              <input
                type="date"
                name="dateOfBirth"
                value={formData.dateOfBirth}
                onChange={handleInputChange}
                max={new Date(new Date().setFullYear(new Date().getFullYear() - 18)).toISOString().split('T')[0]}
                className={`w-full px-4 py-2 border ${formErrors.dateOfBirth ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'} rounded-lg focus:ring-2 dark:bg-gray-700 dark:text-white`}
                style={{ '--tw-ring-color': '#f58c55' } as any}
              />
              {formErrors.dateOfBirth && (
                <p className="mt-1 text-sm text-red-500">{formErrors.dateOfBirth}</p>
              )}
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Residential Address <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="address"
                value={formData.address}
                onChange={handleInputChange}
                className={`w-full px-4 py-2 border ${formErrors.address ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'} rounded-lg focus:ring-2 dark:bg-gray-700 dark:text-white`}
                style={{ '--tw-ring-color': '#f58c55' } as any}
                placeholder="123 Main Street, Lagos"
              />
              {formErrors.address && (
                <p className="mt-1 text-sm text-red-500">{formErrors.address}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Occupation <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="occupation"
                value={formData.occupation}
                onChange={handleInputChange}
                className={`w-full px-4 py-2 border ${formErrors.occupation ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'} rounded-lg focus:ring-2 dark:bg-gray-700 dark:text-white`}
                style={{ '--tw-ring-color': '#f58c55' } as any}
                placeholder="Software Engineer"
              />
              {formErrors.occupation && (
                <p className="mt-1 text-sm text-red-500">{formErrors.occupation}</p>
              )}
            </div>
          </div>
        </motion.div>
        )}

        {/* Verification & ID Information */}
        {currentStep === 2 && (
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          transition={{ duration: 0.4 }}
          className="space-y-6">
        {/* ID Information */}
        <div className="border-b border-gray-200 dark:border-gray-700 pb-6">
          <h2 className="text-xl font-semibold text-gray-800 dark:text-white mb-4 flex items-center">
            <FaIdCard className="mr-2" style={{ color: '#f58c55' }} />
            ID Information
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                ID Type <span className="text-red-500">*</span>
              </label>
              <select
                name="idType"
                value={formData.idType}
                onChange={handleInputChange}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 dark:bg-gray-700 dark:text-white"
                style={{ '--tw-ring-color': '#f58c55' } as any}
              >
                {Object.values(IdType).map(type => (
                  <option key={type} value={type}>{type}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                ID Number <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="idNumber"
                value={formData.idNumber}
                onChange={handleInputChange}
                className={`w-full px-4 py-2 border ${formErrors.idNumber ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'} rounded-lg focus:ring-2 dark:bg-gray-700 dark:text-white`}
                style={{ '--tw-ring-color': '#f58c55' } as any}
                placeholder="Enter your ID number"
              />
              {formErrors.idNumber && (
                <p className="mt-1 text-sm text-red-500">{formErrors.idNumber}</p>
              )}
            </div>
          </div>
        </div>

        {/* Verification Photo */}
        <div className="border-b border-gray-200 dark:border-gray-700 pb-6">
          <h2 className="text-xl font-semibold text-gray-800 dark:text-white mb-4 flex items-center">
            <FaCamera className="mr-2" style={{ color: '#f58c55' }} />
            Verification Photo
          </h2>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Upload a clear photo of yourself <span className="text-red-500">*</span>
            </label>
            <p className="text-xs text-gray-500 dark:text-gray-400 mb-3">
              This photo will be used for verification purposes. Maximum file size: 5MB
            </p>
            <div className="flex items-center space-x-4">
              <label className="cursor-pointer">
                <input type="file" accept="image/*" onChange={handlePhotoChange} className="hidden" />
                <div className="px-4 py-2 text-white rounded-lg transition-colors" style={{ backgroundColor: '#f58c55' }} onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#e67a42'} onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#f58c55'}>
                  Choose Photo
                </div>
              </label>
              {photoPreview && (
                <div className="relative w-24 h-24 rounded-lg overflow-hidden border-2 border-gray-300 dark:border-gray-600">
                  <img src={photoPreview} className="w-full h-full object-cover" alt="Verification preview" />
                </div>
              )}
            </div>
            {formErrors.verificationPhoto && (
              <p className="mt-2 text-sm text-red-500">{formErrors.verificationPhoto}</p>
            )}

            {/* ID Document Image */}
            <div className="mt-6">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Upload your {formData.idType} image <span className="text-red-500">*</span>
              </label>
              <p className="text-xs text-gray-500 dark:text-gray-400 mb-3">Ensure the document is clear and readable. Maximum size: 5MB</p>
              <div className="flex items-center space-x-4">
                <label className="cursor-pointer">
                  <input type="file" accept="image/*" onChange={handleDocChange} className="hidden" />
                  <div className="px-4 py-2 text-white rounded-lg transition-colors" style={{ backgroundColor: '#f58c55' }} onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#e67a42'} onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#f58c55'}>
                    Choose Document
                  </div>
                </label>
                {docPreview && (
                  <div className="relative w-24 h-24 rounded-lg overflow-hidden border-2 border-gray-300 dark:border-gray-600">
                    <img src={docPreview} className="w-full h-full object-cover" alt="ID document preview" />
                  </div>
                )}
              </div>
              {formErrors.idDocumentImage && (
                <p className="mt-2 text-sm text-red-500">{formErrors.idDocumentImage}</p>
              )}
            </div>
          </div>
        </div>
        </motion.div>
        )}
        {/* Parent Information */}
        {currentStep === 3 && (
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          transition={{ duration: 0.4 }}
          className="border-b border-gray-200 dark:border-gray-700 pb-6">
          <h2 className="text-xl font-semibold text-gray-800 dark:text-white mb-4 flex items-center">
            <FaUsers className="mr-2" style={{ color: '#f58c55' }} />
            Parent/Guardian Information (Optional)
          </h2>
          <div className="flex items-center mb-4">
            <input
              type="checkbox"
              checked={showParentSection}
              onChange={(e) => setShowParentSection(e.target.checked)}
              className="mr-2"
            />
            <span className="text-sm text-gray-700 dark:text-gray-300">Provide parent/guardian details</span>
          </div>

          {showParentSection && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Parent/Guardian Name</label>
                <input type="text" name="parentName" value={formData.parentName} onChange={handleInputChange} className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 dark:bg-gray-700 dark:text-white" placeholder="Jane Doe" style={{ '--tw-ring-color': '#f58c55' } as any} />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Parent/Guardian Phone</label>
                <input type="tel" name="parentPhone" value={formData.parentPhone} onChange={handleInputChange} className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 dark:bg-gray-700 dark:text-white" placeholder="+234 802 345 6789" style={{ '--tw-ring-color': '#f58c55' } as any} />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Parent/Guardian Email</label>
                <input type="email" name="parentEmail" value={formData.parentEmail} onChange={handleInputChange} className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 dark:bg-gray-700 dark:text-white" placeholder="jane@example.com" style={{ '--tw-ring-color': '#f58c55' } as any} />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Parent/Guardian Address</label>
                <input type="text" name="parentAddress" value={formData.parentAddress} onChange={handleInputChange} className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 dark:bg-gray-700 dark:text-white" placeholder="456 Oak Avenue, Lagos" style={{ '--tw-ring-color': '#f58c55' } as any} />
              </div>
            </div>
          )}

          {/* Additional Notes */}
          <div className="mt-6">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Additional Notes (Optional)</label>
            <textarea name="notes" value={formData.notes} onChange={handleInputChange} rows={4} className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 dark:bg-gray-700 dark:text-white" placeholder="Any additional information you'd like to provide..." maxLength={500} style={{ '--tw-ring-color': '#f58c55' } as any} />
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">{formData.notes?.length || 0}/500 characters</p>
          </div>
        </motion.div>
        )}

        {/* Navigation */}
        <div className="flex justify-between items-center">
          <button 
            type="button" 
            onClick={() => setCurrentStep(prev => Math.max(1, prev - 1))} 
            disabled={isSubmitting || uploadingPhotos}
            className="px-5 py-2 bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors disabled:opacity-50"
          >
            Back
          </button>
          {currentStep < 4 ? (
            <button 
              type="button" 
              onClick={() => { if (validateStep(currentStep)) setCurrentStep(prev => Math.min(4, prev + 1)); }} 
              disabled={isSubmitting || uploadingPhotos}
              className="px-6 py-2 text-white rounded-lg font-semibold transition-colors disabled:opacity-50"
              style={{ backgroundColor: '#f58c55' }}
              onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#e67a42'}
              onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#f58c55'}
            >
              Next
            </button>
          ) : (
            <button 
              type="submit" 
              disabled={isSubmitting || uploadingPhotos} 
              className="px-6 py-2 text-white rounded-lg font-semibold transition-colors disabled:opacity-50 flex items-center space-x-2"
              style={{ backgroundColor: '#f58c55' }}
              onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#e67a42'}
              onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#f58c55'}
            >
              {uploadingPhotos ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  <span>Uploading & Submitting...</span>
                </>
              ) : isSubmitting ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  <span>Submitting...</span>
                </>
              ) : (
                'Submit Booking'
              )}
            </button>
          )}
        </div>

        {/* Preview */}
        {currentStep === 4 && (
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          transition={{ duration: 0.4 }}
          className="border-b border-gray-200 dark:border-gray-700 pb-6">
          <h2 className="text-xl font-semibold text-gray-800 dark:text-white mb-4 flex items-center">
            <FaIdCard className="mr-2" style={{ color: '#f58c55' }} />
            Preview & Confirm
          </h2>
          <div className="space-y-4 text-sm text-gray-700 dark:text-gray-300">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p className="font-semibold">Full Name</p>
                <p>{formData.fullName}</p>
              </div>
              <div>
                <p className="font-semibold">Email</p>
                <p>{formData.email}</p>
              </div>
              <div>
                <p className="font-semibold">Phone</p>
                <p>{formData.phone}</p>
              </div>
              <div>
                <p className="font-semibold">Date of Birth</p>
                <p>{formData.dateOfBirth}</p>
              </div>
              <div className="md:col-span-2">
                <p className="font-semibold">Address</p>
                <p>{formData.address}</p>
              </div>
              <div>
                <p className="font-semibold">Occupation</p>
                <p>{formData.occupation}</p>
              </div>
              <div>
                <p className="font-semibold">ID Type</p>
                <p>{formData.idType}</p>
              </div>
              <div>
                <p className="font-semibold">ID Number</p>
                <p>{formData.idNumber}</p>
              </div>
            </div>
            {showParentSection && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p className="font-semibold">Parent Name</p>
                  <p>{formData.parentName}</p>
                </div>
                <div>
                  <p className="font-semibold">Parent Phone</p>
                  <p>{formData.parentPhone}</p>
                </div>
                <div>
                  <p className="font-semibold">Parent Email</p>
                  <p>{formData.parentEmail}</p>
                </div>
                <div className="md:col-span-2">
                  <p className="font-semibold">Parent Address</p>
                  <p>{formData.parentAddress}</p>
                </div>
              </div>
            )}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p className="font-semibold">Verification Photo</p>
                {verificationPreview ? (
                  <div className="mt-2 w-28 h-28 rounded-lg overflow-hidden border border-gray-200 dark:border-gray-700">
                    <img src={verificationPreview} alt="Verification" className="w-full h-full object-cover" />
                  </div>
                ) : (
                  <p className="text-gray-500 dark:text-gray-400">No verification photo uploaded</p>
                )}
              </div>
              <div>
                <p className="font-semibold">ID Document Image</p>
                {idDocumentPreview ? (
                  <div className="mt-2 w-28 h-28 rounded-lg overflow-hidden border border-gray-200 dark:border-gray-700">
                    <img src={idDocumentPreview} alt="ID document" className="w-full h-full object-cover" />
                  </div>
                ) : (
                  <p className="text-gray-500 dark:text-gray-400">No ID document uploaded</p>
                )}
              </div>
            </div>
            <div>
              <p className="font-semibold">Additional Notes</p>
              <p>{formData.notes?.trim() ? formData.notes : 'No additional notes provided'}</p>
            </div>
          </div>
        </motion.div>
        )}
      </form>
    </motion.div>
  );
};

export default BookingForm;
