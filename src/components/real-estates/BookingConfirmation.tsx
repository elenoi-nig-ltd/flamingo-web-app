'use client';

import React, { useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { FaCheckCircle, FaDownload, FaPrint, FaHome, FaCalendar, FaClock, FaExclamationTriangle } from 'react-icons/fa';
import { useRouter } from 'next/navigation';
import { Booking } from '@/hooks/useBookings';
import { useReactToPrint } from 'react-to-print';

interface BookingConfirmationProps {
  booking: Booking;
  propertyDetails?: any;
}

const BookingConfirmation: React.FC<BookingConfirmationProps> = ({ booking, propertyDetails }) => {
  const router = useRouter();
  const printRef = useRef<HTMLDivElement>(null);

  const handlePrint = useReactToPrint({
    content: () => printRef.current,
    documentTitle: `Booking-${booking.bookingReference}`,
  });

  const handleDownload = () => {
    // For download as PDF, we can use the print dialog and save as PDF
    // Or use a library like jsPDF for more control
    handlePrint();
  };

  const expiryDate = new Date(booking.expiryDate);
  const daysRemaining = Math.ceil((expiryDate.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900 py-12 px-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="max-w-4xl mx-auto"
      >
        {/* Success Message */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-8 mb-6 text-center">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
          >
            <FaCheckCircle className="text-green-500 text-6xl mx-auto mb-4" />
          </motion.div>
          
          <h1 className="text-3xl font-bold text-gray-800 dark:text-white mb-2">
            Booking Confirmed!
          </h1>
          <p className="text-gray-600 dark:text-gray-300 mb-4">
            Your property has been successfully reserved
          </p>

          {/* Booking Reference */}
          <div className="inline-block bg-orange-100 dark:bg-orange-900 px-6 py-3 rounded-lg">
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Booking Reference</p>
            <p className="text-2xl font-bold text-orange-600 dark:text-orange-400">
              {booking.bookingReference}
            </p>
          </div>

          {/* Expiry Warning */}
          <div className="mt-6 bg-yellow-50 dark:bg-yellow-900/30 border border-yellow-200 dark:border-yellow-700 rounded-lg p-4">
            <div className="flex items-start">
              <FaExclamationTriangle className="text-yellow-500 mt-1 mr-3 flex-shrink-0" />
              <div className="text-left">
                <p className="font-semibold text-gray-800 dark:text-white mb-1">
                  Important: Complete Payment Within {daysRemaining} Days
                </p>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Your booking expires on <strong>{expiryDate.toLocaleDateString()}</strong> at{' '}
                  <strong>{expiryDate.toLocaleTimeString()}</strong>. Please visit our office to complete payment before this date.
                </p>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-wrap justify-center gap-4 mt-6">
            <button
              onClick={handlePrint}
              className="flex items-center px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
            >
              <FaPrint className="mr-2" />
              Print Booking Form
            </button>
            <button
              onClick={handleDownload}
              className="flex items-center px-6 py-3 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
            >
              <FaDownload className="mr-2" />
              Download as PDF
            </button>
            <button
              onClick={() => router.push('/real-estates')}
              className="flex items-center px-6 py-3 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors"
            >
              <FaHome className="mr-2" />
              Back to Properties
            </button>
          </div>
        </div>

        {/* Printable Booking Form */}
        <div ref={printRef} className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-8 print:shadow-none">
          {/* Header for Print */}
          <div className="text-center mb-8 border-b pb-6 print:border-gray-400">
            <h2 className="text-3xl font-bold text-gray-800 dark:text-white mb-2 print:text-black">
              Property Booking Form
            </h2>
            <p className="text-gray-600 dark:text-gray-400 print:text-gray-700">
              Flourish Real Estate
            </p>
            <p className="text-sm text-gray-500 print:text-gray-600">
              Generated on {new Date().toLocaleString()}
            </p>
          </div>

          {/* Booking Details */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div>
              <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-4 print:text-black">
                Booking Information
              </h3>
              <div className="space-y-3">
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400 print:text-gray-600">Reference Number</p>
                  <p className="font-semibold text-gray-800 dark:text-white print:text-black">
                    {booking.bookingReference}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400 print:text-gray-600">Status</p>
                  <span className={`inline-block px-3 py-1 rounded-full text-sm font-semibold ${
                    booking.status === 'pending' ? 'bg-yellow-100 text-yellow-800 print:bg-white print:border print:border-yellow-600' :
                    booking.status === 'confirmed' ? 'bg-blue-100 text-blue-800 print:bg-white print:border print:border-blue-600' :
                    booking.status === 'completed' ? 'bg-green-100 text-green-800 print:bg-white print:border print:border-green-600' :
                    'bg-gray-100 text-gray-800 print:bg-white print:border print:border-gray-600'
                  }`}>
                    {booking.status.toUpperCase()}
                  </span>
                </div>
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400 print:text-gray-600">Booking Date</p>
                  <p className="font-semibold text-gray-800 dark:text-white print:text-black">
                    {new Date(booking.bookingDate).toLocaleString()}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400 print:text-gray-600">Expiry Date</p>
                  <p className="font-semibold text-red-600 dark:text-red-400 print:text-red-700">
                    {new Date(booking.expiryDate).toLocaleString()}
                  </p>
                </div>
              </div>
            </div>

            {propertyDetails && (
              <div>
                <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-4 print:text-black">
                  Property Details
                </h3>
                <div className="space-y-3">
                  <div>
                    <p className="text-sm text-gray-500 dark:text-gray-400 print:text-gray-600">Property Title</p>
                    <p className="font-semibold text-gray-800 dark:text-white print:text-black">
                      {propertyDetails.title}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500 dark:text-gray-400 print:text-gray-600">Address</p>
                    <p className="font-semibold text-gray-800 dark:text-white print:text-black">
                      {propertyDetails.address}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500 dark:text-gray-400 print:text-gray-600">Price</p>
                    <p className="font-semibold text-gray-800 dark:text-white print:text-black">
                      ₦{propertyDetails.price.toLocaleString()}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500 dark:text-gray-400 print:text-gray-600">Property Type</p>
                    <p className="font-semibold text-gray-800 dark:text-white print:text-black capitalize">
                      {propertyDetails.propertyType}
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Personal Information */}
          <div className="border-t border-gray-200 dark:border-gray-700 pt-6 mb-6 print:border-gray-400">
            <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-4 print:text-black">
              Personal Information
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400 print:text-gray-600">Full Name</p>
                <p className="font-semibold text-gray-800 dark:text-white print:text-black">{booking.fullName}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400 print:text-gray-600">Email</p>
                <p className="font-semibold text-gray-800 dark:text-white print:text-black">{booking.email}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400 print:text-gray-600">Phone</p>
                <p className="font-semibold text-gray-800 dark:text-white print:text-black">{booking.phone}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400 print:text-gray-600">Date of Birth</p>
                <p className="font-semibold text-gray-800 dark:text-white print:text-black">
                  {new Date(booking.dateOfBirth).toLocaleDateString()}
                </p>
              </div>
              <div className="md:col-span-2">
                <p className="text-sm text-gray-500 dark:text-gray-400 print:text-gray-600">Address</p>
                <p className="font-semibold text-gray-800 dark:text-white print:text-black">{booking.address}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400 print:text-gray-600">Occupation</p>
                <p className="font-semibold text-gray-800 dark:text-white print:text-black">{booking.occupation}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400 print:text-gray-600">ID Type</p>
                <p className="font-semibold text-gray-800 dark:text-white print:text-black">{booking.idType}</p>
              </div>
              <div className="md:col-span-2">
                <p className="text-sm text-gray-500 dark:text-gray-400 print:text-gray-600">ID Number</p>
                <p className="font-semibold text-gray-800 dark:text-white print:text-black">{booking.idNumber}</p>
              </div>
            </div>
          </div>

          {/* Parent/Guardian Information (if provided) */}
          {booking.parentName && (
            <div className="border-t border-gray-200 dark:border-gray-700 pt-6 mb-6 print:border-gray-400">
              <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-4 print:text-black">
                Parent/Guardian Information
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {booking.parentName && (
                  <div>
                    <p className="text-sm text-gray-500 dark:text-gray-400 print:text-gray-600">Name</p>
                    <p className="font-semibold text-gray-800 dark:text-white print:text-black">{booking.parentName}</p>
                  </div>
                )}
                {booking.parentPhone && (
                  <div>
                    <p className="text-sm text-gray-500 dark:text-gray-400 print:text-gray-600">Phone</p>
                    <p className="font-semibold text-gray-800 dark:text-white print:text-black">{booking.parentPhone}</p>
                  </div>
                )}
                {booking.parentEmail && (
                  <div>
                    <p className="text-sm text-gray-500 dark:text-gray-400 print:text-gray-600">Email</p>
                    <p className="font-semibold text-gray-800 dark:text-white print:text-black">{booking.parentEmail}</p>
                  </div>
                )}
                {booking.parentAddress && (
                  <div>
                    <p className="text-sm text-gray-500 dark:text-gray-400 print:text-gray-600">Address</p>
                    <p className="font-semibold text-gray-800 dark:text-white print:text-black">{booking.parentAddress}</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Additional Notes */}
          {booking.notes && (
            <div className="border-t border-gray-200 dark:border-gray-700 pt-6 mb-6 print:border-gray-400">
              <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-4 print:text-black">
                Additional Notes
              </h3>
              <p className="text-gray-700 dark:text-gray-300 print:text-black">{booking.notes}</p>
            </div>
          )}

          {/* Payment Instructions */}
          <div className="border-t border-gray-200 dark:border-gray-700 pt-6 print:border-gray-400">
            <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-4 print:text-black">
              Next Steps
            </h3>
            <ol className="list-decimal list-inside space-y-2 text-gray-700 dark:text-gray-300 print:text-black">
              <li>Print or save this booking form for your records</li>
              <li>Visit our office at: <strong>[Office Address]</strong></li>
              <li>Bring this booking form and your original ID for verification</li>
              <li>Complete the payment before the expiry date: <strong className="text-red-600 print:text-red-700">
                {expiryDate.toLocaleDateString()}
              </strong></li>
              <li>Receive your tenancy agreement and property keys</li>
            </ol>

            <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-900/30 border border-blue-200 dark:border-blue-700 rounded-lg print:bg-white print:border-blue-400">
              <p className="text-sm text-blue-800 dark:text-blue-200 print:text-blue-900">
                <strong>Contact Us:</strong> For any questions, please contact us at <strong>[Phone Number]</strong> or{' '}
                <strong>[Email Address]</strong>. Quote your booking reference: <strong>{booking.bookingReference}</strong>
              </p>
            </div>
          </div>

          {/* Footer for Print */}
          <div className="hidden print:block mt-8 pt-6 border-t border-gray-400 text-center text-sm text-gray-600">
            <p>This is an official booking confirmation from Flourish Real Estate</p>
            <p className="mt-2">Generated: {new Date().toLocaleString()}</p>
          </div>
        </div>
      </motion.div>

      {/* Print Styles */}
      <style jsx global>{`
        @media print {
          body {
            background: white !important;
          }
          .print\\:shadow-none {
            box-shadow: none !important;
          }
          .dark\\:bg-gray-800,
          .dark\\:bg-gray-900 {
            background: white !important;
          }
          .dark\\:text-white,
          .dark\\:text-gray-300 {
            color: black !important;
          }
          .print\\:text-black {
            color: black !important;
          }
          .print\\:text-gray-600 {
            color: #4b5563 !important;
          }
          .print\\:border-gray-400 {
            border-color: #9ca3af !important;
          }
          button {
            display: none !important;
          }
        }
      `}</style>
    </div>
  );
};

export default BookingConfirmation;
