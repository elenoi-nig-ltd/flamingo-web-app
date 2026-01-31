'use client';

import React, { useState, useEffect, useRef } from 'react';
import Modal from '../Modal';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { FaUser, FaEnvelope, FaPhone, FaMapMarkerAlt, FaBriefcase, FaIdCard, FaCamera, FaCalendar, FaUsers } from 'react-icons/fa';
import { useBookings, IdType, CreateBookingData } from '@/hooks/useBookings';
import { useRealEstates } from '@/hooks/useRealEstates';
import {BASEURL} from '@/config/api/contants';

interface BookingFormProps {
  propertyId: string;
  onSuccess?: (booking: any) => void;
  onCancel?: () => void;
}

const BookingForm: React.FC<BookingFormProps> = ({ propertyId, onSuccess, onCancel }) => {
    const [modalOpen, setModalOpen] = useState(false);
    const [modalMessage, setModalMessage] = useState<string | null>(null);
    const [bookingSlip, setBookingSlip] = useState<any>(null);
  const router = useRouter();
  const { createBooking, checkAvailability, availability, loading, error } = useBookings();
  const { fetchPropertyDetails, propertyDetails } = useRealEstates();

  const [formData, setFormData] = useState<CreateBookingData & {
    isStudent?: boolean;
    studentIdCard?: File | string;
    matricNumber?: string;
    department?: string;
  }>({
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
    isStudent: false,
    studentIdCard: '' as any,
    matricNumber: '',
    department: '',
  });
  const [studentIdPreview, setStudentIdPreview] = useState<string>('');
  const handleStudentIdChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (!file.type.startsWith('image/')) {
        setFormErrors(prev => ({ ...prev, studentIdCard: 'Please select a valid image file' }));
        return null;
      }
      if (file.size > 5 * 1024 * 1024) {
        setFormErrors(prev => ({ ...prev, studentIdCard: 'Image size should not exceed 5MB' }));
        return null;
      }
      setFormData(prev => ({ ...prev, studentIdCard: file }));
      const reader = new FileReader();
      reader.onloadend = () => setStudentIdPreview(reader.result as string);
      reader.readAsDataURL(file);
      if (formErrors.studentIdCard) {
        setFormErrors(prev => { const n = { ...prev }; delete n.studentIdCard; return n; });
      }
    }
  };

  const [photoPreview, setPhotoPreview] = useState<string>('');
  const [docPreview, setDocPreview] = useState<string>('');
  const [currentStep, setCurrentStep] = useState<number>(1); // 1: Personal, 2: Verification, 3: Parent, 4: Preview
  const [showParentSection, setShowParentSection] = useState(false);
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [uploadingPhotos, setUploadingPhotos] = useState(false);
  const [emailExists, setEmailExists] = useState<boolean>(false);
  const [checkingEmail, setCheckingEmail] = useState<boolean>(false);
  const [confirmInfo, setConfirmInfo] = useState<boolean>(false);
  const emailCheckTimeout = useRef<NodeJS.Timeout | null>(null);

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
    
    // Clear field-specific error
    if (formErrors[name]) {
      setFormErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
    
    // Email validation and duplicate check
    if (name === 'email' && value) {
      // Clear previous timeout
      if (emailCheckTimeout.current) {
        clearTimeout(emailCheckTimeout.current);
      }
      
      // Set checking state
      setCheckingEmail(true);
      
      // Debounce email check
      emailCheckTimeout.current = setTimeout(async () => {
        try {
          const res = await fetch(`${BASEURL}/bookings/check-email?email=${encodeURIComponent(value)}&propertyId=${propertyId}`);
          if (!res.ok) throw new Error('Email check failed');
          const data = await res.json();
          if (Array.isArray(data) && data.length > 0) {
            setEmailExists(true);
            setFormErrors(prev => ({ ...prev, email: 'This email has already been used to book a room.' }));
          } else {
            setEmailExists(false);
            setFormErrors(prev => {
              const newErrors = { ...prev };
              delete newErrors.email;
              return newErrors;
            });
          }
        } catch (err) {
          // Ignore network errors for now
        } finally {
          setCheckingEmail(false);
        }
      }, 600);
    }
  };

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        setFormErrors(prev => ({ ...prev, verificationPhoto: 'Please select a valid image file' }));
        return null;
      }

      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        setFormErrors(prev => ({ ...prev, verificationPhoto: 'Image size should not exceed 5MB' }));
        return null;
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
        return null;
      }
      if (file.size > 5 * 1024 * 1024) {
        setFormErrors(prev => ({ ...prev, idDocumentImage: 'Image size should not exceed 5MB' }));
        return null;
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
      if (formData.isStudent) {
        if (!formData.studentIdCard) {
          errors.studentIdCard = 'Student ID card is required';
        }
        if (!formData.matricNumber?.trim()) {
          errors.matricNumber = 'Matric number is required';
        }
        if (!formData.department?.trim()) {
          errors.department = 'Department is required';
        }
      } else {
        if (!formData.idNumber.trim()) {
          errors.idNumber = 'ID number is required';
        }
        if (!formData.idDocumentImage) {
          errors.idDocumentImage = 'Upload your selected ID document image';
        }
      }
      if (!formData.verificationPhoto) {
        errors.verificationPhoto = 'Verification photo is required';
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
    if (!validateStep(4) || emailExists || !confirmInfo) {
      return null;
    }
    setIsSubmitting(true);
    setUploadingPhotos(true);
    try {
      const booking = await createBooking(formData);
      if (booking) {
        // Redirect to booking slip page
        router.push(`/bookings/${booking._id}`);
        if (onSuccess) onSuccess(booking);
      }
    } catch (err) {
      let msg = 'An error occurred during booking.';
      if (err && typeof err === 'object') {
        if ('message' in err && typeof (err as any).message === 'string') msg = (err as any).message;
        else if (typeof err.toString === 'function') msg = err.toString();
      }
      setModalMessage(msg);
      setModalOpen(true);
    } finally {
      setIsSubmitting(false);
      setUploadingPhotos(false);
    }
  };

  // Check if property is available
  if (loading) {
    return (
      <div className="flex justify-center items-center p-8">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500"></div>
      </div>
    );
  }

  // Property not available
  if (availability && !availability.available) {
    return (
      <div className="max-w-2xl mx-auto p-6 bg-white dark:bg-gray-800 rounded-lg shadow-lg">
        <div className="text-center">
          <div className="mb-4 text-red-500 text-6xl">⚠️</div>
          <h2 className="text-2xl font-bold text-[#f58c55] dark:text-[#f58c55] mb-4">
            Property Not Available
          </h2>
          <p className="text-[#f58c55] dark:text-[#f58c55] mb-6">
            This property is currently booked by another user. The booking expires on{' '}
            {availability.booking?.expiryDate && new Date(availability.booking.expiryDate).toLocaleDateString()}.
          </p>
          {availability.propertyType === 'lodge' && (
            <p className="text-sm text-[#f58c55] dark:text-[#f58c55] mb-6">
              Rooms: {availability.roomsBooked ?? 0} booked • {availability.roomsAvailable ?? 0} available • {availability.totalRooms ?? 0} total
            </p>
          )}
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
      className="max-w-4xl mx-auto p-6 bg-white dark:bg-gray-900 rounded-3xl shadow-2xl"
    >
      {/* Property Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-[#f58c55] dark:text-[#f58c55] mb-2">
          Book Your Property
        </h1>
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <p className="text-[#f58c55] dark:text-[#f58c55]">
            <span className="font-semibold">{propertyDetails?.title || 'JJK Lodge'}</span> - 
            <span className="text-orange-500 font-bold ml-2">₦{propertyDetails?.price?.toLocaleString() || '350,000'}</span>
          </p>
          <div className="text-sm text-gray-500 dark:text-gray-400">
            {availability?.propertyType === 'lodge' && (
              <p>
                Rooms available: {availability.roomsAvailable ?? 0} • 
                Rooms booked: {availability.roomsBooked ?? 0} • 
                Total rooms: {availability.totalRooms ?? 0}
              </p>
            )}
          </div>
        </div>
        <p className="mt-4 text-gray-600 dark:text-gray-400">
          Please fill in your details to reserve this property. You have 7 days to complete payment.
        </p>
      </div>

      {/* Progress Steps */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          {[1, 2, 3, 4].map((step) => (
            <React.Fragment key={step}>
              <div className="flex flex-col items-center">
                <div 
                  className={`w-10 h-10 rounded-full flex items-center justify-center font-bold transition-all duration-300 ${
                    currentStep >= step 
                      ? 'bg-[#f58c55] text-white shadow-lg' 
                      : 'bg-[#f58c55]/20 dark:bg-[#f58c55]/30 text-[#f58c55] border border-[#f58c55] dark:border-[#f58c55]'
                  }`}
                >
                  {step}
                </div>
                <span className="mt-2 text-sm font-medium text-[#f58c55] dark:text-[#f58c55]">
                  {step === 1 ? 'Personal' : step === 2 ? 'Verification' : step === 3 ? 'Parent Info' : 'Preview'}
                </span>
              </div>
              {step < 4 && (
                <div className={`flex-1 h-1 mx-4 ${
                  currentStep > step ? 'bg-[#f58c55]' : 'bg-[#f58c55]/20 dark:bg-[#f58c55]/30'
                }`} />
              )}
            </React.Fragment>
          ))}
        </div>
      </div>

      {/* Modal for backend messages and booking success */}
      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title={bookingSlip ? 'Booking Successful' : 'Message'}>
        <div className="text-center">
          <p className="mb-4 text-[#f58c55] font-semibold">{modalMessage}</p>
          {bookingSlip && (
            <div className="bg-[#f58c55]/10 rounded-xl p-4 mt-2 text-left">
              <h4 className="font-bold mb-2 text-[#f58c55]">Booking Slip</h4>
              <div className="space-y-1 text-sm">
                <div><span className="font-semibold">Name:</span> {bookingSlip.fullName}</div>
                <div><span className="font-semibold">Email:</span> {bookingSlip.email}</div>
                <div><span className="font-semibold">Phone:</span> {bookingSlip.phone}</div>
                <div><span className="font-semibold">Property:</span> {bookingSlip.propertyTitle || propertyDetails?.title}</div>
                <div><span className="font-semibold">Amount:</span> ₦{bookingSlip.amount?.toLocaleString() || propertyDetails?.price?.toLocaleString()}</div>
                <div><span className="font-semibold">Booking ID:</span> {bookingSlip._id}</div>
                <div><span className="font-semibold">Date:</span> {bookingSlip.createdAt ? new Date(bookingSlip.createdAt).toLocaleString() : ''}</div>
              </div>
            </div>
          )}
        </div>
      </Modal>

      <form onSubmit={handleSubmit}>
        {/* Personal Information */}
        {currentStep === 1 && (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.4 }}
            className="space-y-6"
          >
            <h2 className="text-xl font-semibold text-gray-800 dark:text-white mb-4 flex items-center">
              <FaUser className="mr-2" style={{ color: '#f58c55' }} />
              Personal Information
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1, duration: 0.3 }}
                className="relative group"
              >
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2 transition-colors group-focus-within:text-orange-500">
                  Full Name <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <FaUser className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-orange-500 transition-colors" />
                  <input
                    type="text"
                    name="fullName"
                    value={formData.fullName}
                    onChange={handleInputChange}
                    className={`w-full pl-10 pr-4 py-3 ${
                      formErrors.fullName 
                        ? 'bg-red-50 dark:bg-red-900/20 ring-2 ring-red-500' 
                        : 'bg-white dark:bg-gray-700'
                    } rounded-xl focus:ring-4 focus:ring-orange-500/30 focus:scale-[1.02] dark:text-white transition-all duration-300 shadow-sm hover:shadow-md focus:shadow-xl placeholder:text-gray-400`}
                    placeholder="John Doe"
                  />
                </div>
                {formErrors.fullName && (
                  <motion.p 
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mt-2 text-sm text-red-500 flex items-center gap-1"
                  >
                    <span>⚠</span> {formErrors.fullName}
                  </motion.p>
                )}
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.15, duration: 0.3 }}
                className="relative group"
              >
                <label className="block text-sm font-semibold text-[#f58c55] dark:text-[#f58c55] mb-2 transition-colors group-focus-within:text-[#f58c55]">
                  Email Address <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <FaEnvelope className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-orange-500 transition-colors" />
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    className={`w-full pl-10 pr-4 py-3 ${
                      formErrors.email 
                        ? 'bg-red-50 dark:bg-red-900/20 ring-2 ring-red-500' 
                        : 'bg-white dark:bg-gray-700'
                    } rounded-xl focus:ring-4 focus:ring-orange-500/30 focus:scale-[1.02] dark:text-white transition-all duration-300 shadow-sm hover:shadow-md focus:shadow-xl placeholder:text-gray-400`}
                    placeholder="john@example.com"
                  />
                </div>
                {formErrors.email && (
                  <motion.p 
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mt-2 text-sm text-red-500 flex items-center gap-1"
                  >
                    <span>⚠</span> {formErrors.email}
                  </motion.p>
                )}
                {checkingEmail && (
                  <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">Checking email availability...</p>
                )}
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2, duration: 0.3 }}
                className="relative group"
              >
                <label className="block text-sm font-semibold text-[#f58c55] dark:text-[#f58c55] mb-2 transition-colors group-focus-within:text-[#f58c55]">
                  Phone Number <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <FaPhone className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-orange-500 transition-colors" />
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleInputChange}
                    className={`w-full pl-10 pr-4 py-3 ${
                      formErrors.phone 
                        ? 'bg-red-50 dark:bg-red-900/20 ring-2 ring-red-500' 
                        : 'bg-white dark:bg-gray-700'
                    } rounded-xl focus:ring-4 focus:ring-orange-500/30 focus:scale-[1.02] dark:text-white transition-all duration-300 shadow-sm hover:shadow-md focus:shadow-xl placeholder:text-gray-400`}
                    placeholder="+234 801 234 5678"
                  />
                </div>
                {formErrors.phone && (
                  <motion.p 
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mt-2 text-sm text-red-500 flex items-center gap-1"
                  >
                    <span>⚠</span> {formErrors.phone}
                  </motion.p>
                )}
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.25, duration: 0.3 }}
                className="relative group"
              >
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2 transition-colors group-focus-within:text-orange-500">
                  Date of Birth <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <FaCalendar className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-orange-500 transition-colors pointer-events-none" />
                  <input
                    type="date"
                    name="dateOfBirth"
                    value={formData.dateOfBirth}
                    onChange={handleInputChange}
                    max={new Date(new Date().setFullYear(new Date().getFullYear() - 18)).toISOString().split('T')[0]}
                    className={`w-full pl-10 pr-4 py-3 ${
                      formErrors.dateOfBirth 
                        ? 'bg-red-50 dark:bg-red-900/20 ring-2 ring-red-500' 
                        : 'bg-white dark:bg-gray-700'
                    } rounded-xl focus:ring-4 focus:ring-orange-500/30 focus:scale-[1.02] dark:text-white transition-all duration-300 shadow-sm hover:shadow-md focus:shadow-xl`}
                  />
                </div>
                {formErrors.dateOfBirth && (
                  <motion.p 
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mt-2 text-sm text-red-500 flex items-center gap-1"
                  >
                    <span>⚠</span> {formErrors.dateOfBirth}
                  </motion.p>
                )}
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3, duration: 0.3 }}
                className="md:col-span-2 relative group"
              >
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2 transition-colors group-focus-within:text-orange-500">
                  Residential Address <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <FaMapMarkerAlt className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-orange-500 transition-colors" />
                  <input
                    type="text"
                    name="address"
                    value={formData.address}
                    onChange={handleInputChange}
                    className={`w-full pl-10 pr-4 py-3 ${
                      formErrors.address 
                        ? 'bg-red-50 dark:bg-red-900/20 ring-2 ring-red-500' 
                        : 'bg-white dark:bg-gray-700'
                    } rounded-xl focus:ring-4 focus:ring-orange-500/30 focus:scale-[1.02] dark:text-white transition-all duration-300 shadow-sm hover:shadow-md focus:shadow-xl placeholder:text-gray-400`}
                    placeholder="123 Main Street, Lagos"
                  />
                </div>
                {formErrors.address && (
                  <motion.p 
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mt-2 text-sm text-red-500 flex items-center gap-1"
                  >
                    <span>⚠</span> {formErrors.address}
                  </motion.p>
                )}
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.35, duration: 0.3 }}
                className="relative group"
              >
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2 transition-colors group-focus-within:text-orange-500">
                  Occupation <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <FaBriefcase className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-orange-500 transition-colors" />
                  <input
                    type="text"
                    name="occupation"
                    value={formData.occupation}
                    onChange={handleInputChange}
                    className={`w-full pl-10 pr-4 py-3 ${
                      formErrors.occupation 
                        ? 'bg-red-50 dark:bg-red-900/20 ring-2 ring-red-500' 
                        : 'bg-white dark:bg-gray-700'
                    } rounded-xl focus:ring-4 focus:ring-orange-500/30 focus:scale-[1.02] dark:text-white transition-all duration-300 shadow-sm hover:shadow-md focus:shadow-xl placeholder:text-gray-400`}
                    placeholder="Software Engineer"
                  />
                </div>
                {formErrors.occupation && (
                  <motion.p 
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mt-2 text-sm text-red-500 flex items-center gap-1"
                  >
                    <span>⚠</span> {formErrors.occupation}
                  </motion.p>
                )}
              </motion.div>
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
            className="space-y-6"
          >
            {/* ID Information */}
            <div className="border-b border-gray-200 dark:border-gray-700 pb-6">
              <h2 className="text-xl font-semibold text-gray-800 dark:text-white mb-4 flex items-center">
                <FaIdCard className="mr-2" style={{ color: '#f58c55' }} />
                ID Information
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1, duration: 0.3 }}
                  className="relative group"
                >
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2 transition-colors group-focus-within:text-orange-500">
                    ID Type <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <FaIdCard className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-orange-500 transition-colors pointer-events-none z-10" />
                    <select
                      name="idType"
                      value={formData.idType}
                      onChange={handleInputChange}
                      className="w-full pl-10 pr-4 py-3 bg-white dark:bg-gray-700 rounded-xl focus:ring-4 focus:ring-orange-500/30 focus:scale-[1.02] dark:text-white transition-all duration-300 shadow-sm hover:shadow-md focus:shadow-xl appearance-none cursor-pointer"
                    >
                      {Object.values(IdType).map(type => (
                        <option key={type} value={type}>{type}</option>
                      ))}
                    </select>
                    <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400">
                      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                      </svg>
                    </div>
                  </div>
                </motion.div>
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.15, duration: 0.3 }}
                  className="relative group"
                >
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2 transition-colors group-focus-within:text-orange-500">
                    ID Number <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-orange-500 transition-colors font-mono">#</span>
                    <input
                      type="text"
                      name="idNumber"
                      value={formData.idNumber}
                      onChange={handleInputChange}
                      className={`w-full pl-10 pr-4 py-3 ${
                        formErrors.idNumber 
                          ? 'bg-red-50 dark:bg-red-900/20 ring-2 ring-red-500' 
                          : 'bg-white dark:bg-gray-700'
                      } rounded-xl focus:ring-4 focus:ring-orange-500/30 focus:scale-[1.02] dark:text-white transition-all duration-300 shadow-sm hover:shadow-md focus:shadow-xl placeholder:text-gray-400`}
                      placeholder="Enter your ID number"
                    />
                  </div>
                  {formErrors.idNumber && (
                    <motion.p 
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="mt-2 text-sm text-red-500 flex items-center gap-1"
                    >
                      <span>⚠</span> {formErrors.idNumber}
                    </motion.p>
                  )}
                </motion.div>
              </div>
            </div>

            {/* Verification Photo */}
            <div className="border-b border-gray-200 dark:border-gray-700 pb-6">
              <h2 className="text-xl font-semibold text-gray-800 dark:text-white mb-4 flex items-center">
                <FaCamera className="mr-2" style={{ color: '#f58c55' }} />
                Verification Photo
              </h2>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2, duration: 0.3 }}
              >
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                  Upload a clear photo of yourself <span className="text-red-500">*</span>
                </label>
                <p className="text-xs text-gray-500 dark:text-gray-400 mb-3">
                  This photo will be used for verification purposes. Maximum file size: 5MB
                </p>
                <div className="flex items-center space-x-4">
                  <label className="cursor-pointer group">
                    <input type="file" accept="image/*" onChange={handlePhotoChange} className="hidden" />
                    <motion.div 
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      className="px-6 py-3 text-white rounded-xl font-medium transition-all duration-300 shadow-md hover:shadow-xl flex items-center gap-2"
                      style={{ backgroundColor: '#f58c55' }}
                      onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#e67a42'}
                      onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#f58c55'}
                    >
                      <FaCamera className="text-lg" />
                      Choose Photo
                    </motion.div>
                  </label>
                  {photoPreview && (
                    <motion.div 
                      initial={{ scale: 0, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      transition={{ type: "spring", stiffness: 200, damping: 15 }}
                      className="relative group"
                    >
                      <div 
                        className="w-28 h-28 rounded-2xl overflow-hidden border-4 shadow-lg transition-all duration-300" 
                        style={{ borderColor: 'rgba(245, 140, 85, 0.3)' }}
                        onMouseEnter={(e) => e.currentTarget.style.borderColor = '#f58c55'}
                        onMouseLeave={(e) => e.currentTarget.style.borderColor = 'rgba(245, 140, 85, 0.3)'}
                      >
                        <img src={photoPreview} className="w-full h-full object-cover" alt="Verification preview" />
                      </div>
                      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-2xl flex items-center justify-center">
                        <span className="text-white text-xs font-semibold">Preview</span>
                      </div>
                    </motion.div>
                  )}
                </div>
                {formErrors.verificationPhoto && (
                  <motion.p 
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mt-3 text-sm text-red-500 flex items-center gap-1"
                  >
                    <span>⚠</span> {formErrors.verificationPhoto}
                  </motion.p>
                )}

                {/* Student Verification */}
                <div className="mt-6">
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                    Are you a student?
                  </label>
                  <div className="flex gap-6 items-center mb-2">
                    <label className="flex items-center gap-2">
                      <input
                        type="radio"
                        name="isStudent"
                        checked={!!formData.isStudent}
                        onChange={() => setFormData(prev => ({ ...prev, isStudent: true }))}
                      />
                      Yes
                    </label>
                    <label className="flex items-center gap-2">
                      <input
                        type="radio"
                        name="isStudent"
                        checked={!formData.isStudent}
                        onChange={() => setFormData(prev => ({ ...prev, isStudent: false, studentIdCard: '', matricNumber: '', department: '' }))}
                      />
                      No
                    </label>
                  </div>
                </div>

                {/* If student, show extra fields */}
                {formData.isStudent && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2, duration: 0.3 }}
                    className="mt-6"
                  >
                    <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                      Upload your Student ID Card <span className="text-red-500">*</span>
                    </label>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mb-3">Maximum size: 5MB</p>
                    <div className="flex items-center space-x-4">
                      <label className="cursor-pointer group">
                        <input type="file" accept="image/*" onChange={handleStudentIdChange} className="hidden" />
                        <motion.div 
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          className="px-6 py-3 text-white rounded-xl font-medium transition-all duration-300 shadow-md hover:shadow-xl flex items-center gap-2"
                          style={{ backgroundColor: '#f58c55' }}
                          onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#e67a42'}
                          onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#f58c55'}
                        >
                          <FaIdCard className="text-lg" />
                          Choose Student ID
                        </motion.div>
                      </label>
                      {studentIdPreview && (
                        <motion.div 
                          initial={{ scale: 0, opacity: 0 }}
                          animate={{ scale: 1, opacity: 1 }}
                          transition={{ type: "spring", stiffness: 200, damping: 15 }}
                          className="relative group"
                        >
                          <div 
                            className="w-28 h-28 rounded-2xl overflow-hidden border-4 shadow-lg transition-all duration-300" 
                            style={{ borderColor: 'rgba(245, 140, 85, 0.3)' }}
                            onMouseEnter={(e) => e.currentTarget.style.borderColor = '#f58c55'}
                            onMouseLeave={(e) => e.currentTarget.style.borderColor = 'rgba(245, 140, 85, 0.3)'}
                          >
                            <img src={studentIdPreview} className="w-full h-full object-cover" alt="Student ID preview" />
                          </div>
                          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-2xl flex items-center justify-center">
                            <span className="text-white text-xs font-semibold">Preview</span>
                          </div>
                        </motion.div>
                      )}
                    </div>
                    {formErrors.studentIdCard && (
                      <motion.p 
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="mt-3 text-sm text-red-500 flex items-center gap-1"
                      >
                        <span>⚠</span> {formErrors.studentIdCard}
                      </motion.p>
                    )}
                    <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                          Matric Number <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="text"
                          name="matricNumber"
                          value={formData.matricNumber || ''}
                          onChange={handleInputChange}
                          className={`w-full px-4 py-3 rounded-xl bg-white dark:bg-gray-700 focus:ring-4 focus:ring-orange-500/30 focus:scale-[1.02] dark:text-white transition-all duration-300 shadow-sm hover:shadow-md focus:shadow-xl placeholder:text-gray-400 ${formErrors.matricNumber ? 'ring-2 ring-red-500' : ''}`}
                          placeholder="e.g. 2021/123456"
                        />
                        {formErrors.matricNumber && (
                          <motion.p 
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="mt-2 text-sm text-red-500 flex items-center gap-1"
                          >
                            <span>⚠</span> {formErrors.matricNumber}
                          </motion.p>
                        )}
                      </div>
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                          Department <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="text"
                          name="department"
                          value={formData.department || ''}
                          onChange={handleInputChange}
                          className={`w-full px-4 py-3 rounded-xl bg-white dark:bg-gray-700 focus:ring-4 focus:ring-orange-500/30 focus:scale-[1.02] dark:text-white transition-all duration-300 shadow-sm hover:shadow-md focus:shadow-xl placeholder:text-gray-400 ${formErrors.department ? 'ring-2 ring-red-500' : ''}`}
                          placeholder="e.g. Computer Science"
                        />
                        {formErrors.department && (
                          <motion.p 
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="mt-2 text-sm text-red-500 flex items-center gap-1"
                          >
                            <span>⚠</span> {formErrors.department}
                          </motion.p>
                        )}
                      </div>
                    </div>
                  </motion.div>
                )}

                {/* ID Document Image */}
                <motion.div 
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3, duration: 0.3 }}
                  className="mt-6"
                >
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                    Upload your {formData.idType} image <span className="text-red-500">*</span>
                  </label>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mb-3">Ensure the document is clear and readable. Maximum size: 5MB</p>
                  <div className="flex items-center space-x-4">
                    <label className="cursor-pointer group">
                      <input type="file" accept="image/*" onChange={handleDocChange} className="hidden" />
                      <motion.div 
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        className="px-6 py-3 text-white rounded-xl font-medium transition-all duration-300 shadow-md hover:shadow-xl flex items-center gap-2"
                        style={{ backgroundColor: '#f58c55' }}
                        onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#e67a42'}
                        onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#f58c55'}
                      >
                        <FaIdCard className="text-lg" />
                        Choose Document
                      </motion.div>
                    </label>
                    {docPreview && (
                      <motion.div 
                        initial={{ scale: 0, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        transition={{ type: "spring", stiffness: 200, damping: 15 }}
                        className="relative group"
                      >
                        <div 
                          className="w-28 h-28 rounded-2xl overflow-hidden border-4 shadow-lg transition-all duration-300" 
                          style={{ borderColor: 'rgba(245, 140, 85, 0.3)' }}
                          onMouseEnter={(e) => e.currentTarget.style.borderColor = '#f58c55'}
                          onMouseLeave={(e) => e.currentTarget.style.borderColor = 'rgba(245, 140, 85, 0.3)'}
                        >
                          <img src={docPreview} className="w-full h-full object-cover" alt="ID document preview" />
                        </div>
                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-2xl flex items-center justify-center">
                          <span className="text-white text-xs font-semibold">Preview</span>
                        </div>
                      </motion.div>
                    )}
                  </div>
                  {formErrors.idDocumentImage && (
                    <motion.p 
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="mt-3 text-sm text-red-500 flex items-center gap-1"
                    >
                      <span>⚠</span> {formErrors.idDocumentImage}
                    </motion.p>
                  )}
                </motion.div>
              </motion.div>
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
            className="border-b border-gray-200 dark:border-gray-700 pb-6"
          >
            <h2 className="text-xl font-semibold text-gray-800 dark:text-white mb-4 flex items-center">
              <FaUsers className="mr-2" style={{ color: '#f58c55' }} />
              Parent/Guardian Information (Optional)
            </h2>
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.1, duration: 0.3 }}
              className="flex items-center mb-6 p-4 bg-gradient-to-r from-orange-50 to-orange-100/50 dark:from-gray-800 dark:to-gray-700 rounded-xl border-2 border-orange-200 dark:border-gray-600"
            >
              <label className="flex items-center cursor-pointer group">
                <div className="relative">
                  <input
                    type="checkbox"
                    checked={showParentSection}
                    onChange={(e) => {
                      const checked = e.target.checked;
                      setShowParentSection(checked);
                      // Clear parent fields when unchecking
                      if (!checked) {
                        setFormData(prev => ({
                          ...prev,
                          parentName: '',
                          parentPhone: '',
                          parentEmail: '',
                          parentAddress: '',
                        }));
                        // Clear parent field errors
                        setFormErrors(prev => {
                          const newErrors = { ...prev };
                          delete newErrors.parentName;
                          delete newErrors.parentPhone;
                          delete newErrors.parentEmail;
                          delete newErrors.parentAddress;
                          return newErrors;
                        });
                      }
                    }}
                    className="sr-only peer"
                  />
                  <div className="w-6 h-6 border-2 border-gray-300 rounded-md peer-checked:bg-orange-500 peer-checked:border-orange-500 transition-all duration-300 flex items-center justify-center">
                    {showParentSection && (
                      <motion.svg 
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        className="w-4 h-4 text-white" 
                        fill="currentColor" 
                        viewBox="0 0 20 20"
                      >
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </motion.svg>
                    )}
                  </div>
                </div>
                <span className="ml-3 text-sm font-semibold text-gray-700 dark:text-gray-300 group-hover:text-orange-600 dark:group-hover:text-orange-400 transition-colors">
                  Provide parent/guardian details
                </span>
              </label>
            </motion.div>

            {showParentSection && (
              <motion.div 
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.4 }}
                className="grid grid-cols-1 md:grid-cols-2 gap-6"
              >
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.1, duration: 0.3 }}
                  className="relative group"
                >
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2 transition-colors group-focus-within:text-orange-500">
                    Parent/Guardian Name <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <FaUser className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-orange-500 transition-colors" />
                    <input 
                      type="text" 
                      name="parentName" 
                      value={formData.parentName} 
                      onChange={handleInputChange} 
                      className={`w-full pl-10 pr-4 py-3 ${
                        formErrors.parentName 
                          ? 'bg-red-50 dark:bg-red-900/20 ring-2 ring-red-500' 
                          : 'bg-white dark:bg-gray-700'
                      } rounded-xl focus:ring-4 focus:ring-orange-500/30 focus:scale-[1.02] dark:text-white transition-all duration-300 shadow-sm hover:shadow-md focus:shadow-xl placeholder:text-gray-400`}
                      placeholder="Jane Doe" 
                    />
                  </div>
                  {formErrors.parentName && (
                    <motion.p 
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="mt-2 text-sm text-red-500 flex items-center gap-1"
                    >
                      <span>⚠</span> {formErrors.parentName}
                    </motion.p>
                  )}
                </motion.div>
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.15, duration: 0.3 }}
                  className="relative group"
                >
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2 transition-colors group-focus-within:text-orange-500">
                    Parent/Guardian Phone <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <FaPhone className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-orange-500 transition-colors" />
                    <input 
                      type="tel" 
                      name="parentPhone" 
                      value={formData.parentPhone} 
                      onChange={handleInputChange} 
                      className={`w-full pl-10 pr-4 py-3 ${
                        formErrors.parentPhone 
                          ? 'bg-red-50 dark:bg-red-900/20 ring-2 ring-red-500' 
                          : 'bg-white dark:bg-gray-700'
                      } rounded-xl focus:ring-4 focus:ring-orange-500/30 focus:scale-[1.02] dark:text-white transition-all duration-300 shadow-sm hover:shadow-md focus:shadow-xl placeholder:text-gray-400`}
                      placeholder="+234 802 345 6789" 
                    />
                  </div>
                  {formErrors.parentPhone && (
                    <motion.p 
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="mt-2 text-sm text-red-500 flex items-center gap-1"
                    >
                      <span>⚠</span> {formErrors.parentPhone}
                    </motion.p>
                  )}
                </motion.div>
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.2, duration: 0.3 }}
                  className="relative group"
                >
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2 transition-colors group-focus-within:text-orange-500">
                    Parent/Guardian Email (Optional)
                  </label>
                  <div className="relative">
                    <FaEnvelope className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-orange-500 transition-colors" />
                    <input 
                      type="email" 
                      name="parentEmail" 
                      value={formData.parentEmail} 
                      onChange={handleInputChange} 
                      className={`w-full pl-10 pr-4 py-3 ${
                        formErrors.parentEmail 
                          ? 'bg-red-50 dark:bg-red-900/20 ring-2 ring-red-500' 
                          : 'bg-white dark:bg-gray-700'
                      } rounded-xl focus:ring-4 focus:ring-orange-500/30 focus:scale-[1.02] dark:text-white transition-all duration-300 shadow-sm hover:shadow-md focus:shadow-xl placeholder:text-gray-400`}
                      placeholder="jane@example.com" 
                    />
                  </div>
                  {formErrors.parentEmail && (
                    <motion.p 
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="mt-2 text-sm text-red-500 flex items-center gap-1"
                    >
                      <span>⚠</span> {formErrors.parentEmail}
                    </motion.p>
                  )}
                </motion.div>
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.25, duration: 0.3 }}
                  className="relative group"
                >
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2 transition-colors group-focus-within:text-orange-500">
                    Parent/Guardian Address <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <FaMapMarkerAlt className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-orange-500 transition-colors" />
                    <input 
                      type="text" 
                      name="parentAddress" 
                      value={formData.parentAddress} 
                      onChange={handleInputChange} 
                      className={`w-full pl-10 pr-4 py-3 ${
                        formErrors.parentAddress 
                          ? 'bg-red-50 dark:bg-red-900/20 ring-2 ring-red-500' 
                          : 'bg-white dark:bg-gray-700'
                      } rounded-xl focus:ring-4 focus:ring-orange-500/30 focus:scale-[1.02] dark:text-white transition-all duration-300 shadow-sm hover:shadow-md focus:shadow-xl placeholder:text-gray-400`}
                      placeholder="456 Oak Avenue, Lagos" 
                    />
                  </div>
                  {formErrors.parentAddress && (
                    <motion.p 
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="mt-2 text-sm text-red-500 flex items-center gap-1"
                    >
                      <span>⚠</span> {formErrors.parentAddress}
                    </motion.p>
                  )}
                </motion.div>
              </motion.div>
            )}

            {/* Additional Notes */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: showParentSection ? 0.3 : 0.1, duration: 0.3 }}
              className="mt-6 relative group"
            >
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2 transition-colors group-focus-within:text-orange-500">
                Additional Notes (Optional)
              </label>
              <textarea 
                name="notes" 
                value={formData.notes} 
                onChange={handleInputChange} 
                rows={4} 
                className="w-full px-4 py-3 bg-white dark:bg-gray-700 rounded-xl focus:ring-4 focus:ring-orange-500/30 focus:scale-[1.01] dark:text-white transition-all duration-300 shadow-sm hover:shadow-md focus:shadow-xl placeholder:text-gray-400 resize-none" 
                placeholder="Any additional information you'd like to provide..." 
                maxLength={500}
              />
              <div className="flex justify-between items-center mt-2">
                <p className="text-xs text-gray-500 dark:text-gray-400">Maximum 500 characters</p>
                <p className={`text-xs font-semibold ${
                  (formData.notes?.length || 0) > 450 ? 'text-orange-500' : 'text-gray-500 dark:text-gray-400'
                }`}>
                  {formData.notes?.length || 0}/500
                </p>
              </div>
            </motion.div>
          </motion.div>
        )}

        {/* Preview */}
        {currentStep === 4 && (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.4 }}
            className="border-b border-gray-200 dark:border-gray-700 pb-6"
          >
            <h2 className="text-xl font-semibold text-[#f58c55] dark:text-[#f58c55] mb-4 flex items-center">
              <FaIdCard className="mr-2" style={{ color: '#f58c55' }} />
              Preview & Confirm
            </h2>
            <div className="space-y-4 text-sm text-gray-700 dark:text-gray-300">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="break-words min-w-0">
                  <p className="font-semibold">Full Name</p>
                  <p>{formData.fullName}</p>
                </div>
                <div className="break-words min-w-0">
                  <p className="font-semibold">Email</p>
                  <p>{formData.email}</p>
                </div>
                <div className="break-words min-w-0">
                  <p className="font-semibold">Phone</p>
                  <p>{formData.phone}</p>
                </div>
                <div className="break-words min-w-0">
                  <p className="font-semibold">Date of Birth</p>
                  <p>{formData.dateOfBirth}</p>
                </div>
                <div className="sm:col-span-2 break-words min-w-0">
                  <p className="font-semibold">Address</p>
                  <p>{formData.address}</p>
                </div>
                <div className="break-words min-w-0">
                  <p className="font-semibold">Occupation</p>
                  <p>{formData.occupation}</p>
                </div>
                <div className="break-words min-w-0">
                  <p className="font-semibold">ID Type</p>
                  <p>{formData.idType}</p>
                </div>
                <div className="break-words min-w-0">
                  <p className="font-semibold">ID Number</p>
                  <p>{formData.idNumber}</p>
                </div>
              </div>
              {formData.isStudent && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="break-words min-w-0">
                    <p className="font-semibold">Matric Number</p>
                    <p>{formData.matricNumber}</p>
                  </div>
                  <div className="break-words min-w-0">
                    <p className="font-semibold">Department</p>
                    <p>{formData.department}</p>
                  </div>
                </div>
              )}
              {showParentSection && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="break-words min-w-0">
                    <p className="font-semibold">Parent Name</p>
                    <p>{formData.parentName}</p>
                  </div>
                  <div className="break-words min-w-0">
                    <p className="font-semibold">Parent Phone</p>
                    <p>{formData.parentPhone}</p>
                  </div>
                  <div className="break-words min-w-0">
                    <p className="font-semibold">Parent Email</p>
                    <p>{formData.parentEmail || 'Not provided'}</p>
                  </div>
                  <div className="sm:col-span-2 break-words min-w-0">
                    <p className="font-semibold">Parent Address</p>
                    <p>{formData.parentAddress}</p>
                  </div>
                </div>
              )}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="break-words min-w-0">
                  <p className="font-semibold">Verification Photo</p>
                  {verificationPreview ? (
                    <div className="mt-2 w-full max-w-[120px] h-auto aspect-square rounded-lg overflow-hidden border border-gray-200 dark:border-gray-700 mx-auto">
                      <img src={verificationPreview} alt="Verification" className="w-full h-full object-cover" />
                    </div>
                  ) : (
                    <p className="text-gray-500 dark:text-gray-400">No verification photo uploaded</p>
                  )}
                </div>
                <div className="break-words min-w-0">
                  <p className="font-semibold">ID Document Image</p>
                  {idDocumentPreview ? (
                    <div className="mt-2 w-full max-w-[120px] h-auto aspect-square rounded-lg overflow-hidden border border-gray-200 dark:border-gray-700 mx-auto">
                      <img src={idDocumentPreview} alt="ID document" className="w-full h-full object-cover" />
                    </div>
                  ) : (
                    <p className="text-gray-500 dark:text-gray-400">No ID document uploaded</p>
                  )}
                </div>
                {formData.isStudent && studentIdPreview && (
                  <div className="break-words min-w-0">
                    <p className="font-semibold">Student ID Card</p>
                    <div className="mt-2 w-full max-w-[120px] h-auto aspect-square rounded-lg overflow-hidden border border-gray-200 dark:border-gray-700 mx-auto">
                      <img src={studentIdPreview} alt="Student ID" className="w-full h-full object-cover" />
                    </div>
                  </div>
                )}
              </div>
              <div className="break-words min-w-0">
                <p className="font-semibold">Additional Notes</p>
                <p>{formData.notes?.trim() ? formData.notes : 'No additional notes provided'}</p>
              </div>
            </div>
          </motion.div>
        )}

        {/* Navigation */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 0.3 }}
          className="flex justify-between items-center pt-6 border-t border-gray-200 dark:border-gray-700"
        >
          <motion.button 
            whileHover={{ scale: 1.02, x: -5 }}
            whileTap={{ scale: 0.98 }}
            type="button" 
            onClick={() => setCurrentStep(prev => Math.max(1, prev - 1))} 
            disabled={isSubmitting || uploadingPhotos || currentStep === 1}
            className="px-6 py-3 bg-gradient-to-r from-gray-100 to-gray-200 dark:from-gray-700 dark:to-gray-600 text-gray-900 dark:text-white rounded-xl font-medium hover:from-gray-200 hover:to-gray-300 dark:hover:from-gray-600 dark:hover:to-gray-500 transition-all duration-300 shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          >
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" />
            </svg>
            Back
          </motion.button>
          {currentStep < 4 ? (
            <motion.button 
              whileHover={{ scale: 1.02, x: 5 }}
              whileTap={{ scale: 0.98 }}
              type="button" 
              onClick={() => { if (validateStep(currentStep)) setCurrentStep(prev => Math.min(4, prev + 1)); }} 
              disabled={isSubmitting || uploadingPhotos || emailExists}
              className="px-6 py-3 text-white rounded-xl font-semibold transition-all duration-300 shadow-md hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              style={{ backgroundColor: '#f58c55' }}
              onMouseEnter={(e) => !isSubmitting && !uploadingPhotos && (e.currentTarget.style.backgroundColor = '#e67a42')}
              onMouseLeave={(e) => !isSubmitting && !uploadingPhotos && (e.currentTarget.style.backgroundColor = '#f58c55')}
            >
              Next
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
              </svg>
            </motion.button>
          ) : (
            <div className="flex flex-col gap-3 w-full">
              <label className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300 mb-2">
                <input
                  type="checkbox"
                  checked={confirmInfo}
                  onChange={e => setConfirmInfo(e.target.checked)}
                  className="accent-orange-500 w-5 h-5 rounded"
                  disabled={isSubmitting || uploadingPhotos}
                />
                I confirm that the information provided is true and correct.
              </label>
              <motion.button 
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                type="submit" 
                disabled={isSubmitting || uploadingPhotos || !confirmInfo || emailExists} 
                className="px-8 py-3 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-xl font-semibold hover:from-green-600 hover:to-emerald-700 transition-all duration-300 shadow-md hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                {uploadingPhotos ? (
                  <>
                    <div className="w-5 h-5 border-3 border-white border-t-transparent rounded-full animate-spin"></div>
                    <span>Uploading & Submitting...</span>
                  </>
                ) : isSubmitting ? (
                  <>
                    <div className="w-5 h-5 border-3 border-white border-t-transparent rounded-full animate-spin"></div>
                    <span>Submitting...</span>
                  </>
                ) : (
                  <>
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                    Submit Booking
                  </>
                )}
              </motion.button>
              {emailExists && (
                <p className="text-red-500 text-sm mt-2">This email has already been used to book a room. Please use a different email.</p>
              )}
            </div>
          )}
        </motion.div>
      </form>
    </motion.div>
  );
};

export default BookingForm;