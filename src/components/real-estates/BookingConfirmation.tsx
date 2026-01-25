'use client';

import React, { useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { FaCheckCircle, FaDownload, FaHome, FaExclamationTriangle } from 'react-icons/fa';
import { useRouter } from 'next/navigation';
import { Booking } from '@/hooks/useBookings';
import html2canvas from 'html2canvas';

interface BookingConfirmationProps {
  booking: Booking;
  propertyDetails?: any;
}

const BookingConfirmation: React.FC<BookingConfirmationProps> = ({ booking, propertyDetails }) => {
  const router = useRouter();
  const printRef = useRef<HTMLDivElement>(null);
  const downloadInitiated = useRef(false);

const handleDownloadAsImage = async () => {
  if (!printRef.current) {
    console.warn('There is nothing to download');
    return;
  }

  try {
    const element = printRef.current;
    
    // Create a clone of the element to avoid affecting the original
    const clone = element.cloneNode(true) as HTMLElement;
    
    // Remove any unsupported CSS color functions
    const styleSheets = document.styleSheets;
    clone.style.cssText += ';background-color: white !important; color: black !important;';
    
    // Temporarily hide the clone
    clone.style.position = 'fixed';
    clone.style.left = '-9999px';
    clone.style.top = '0';
    document.body.appendChild(clone);

    const canvas = await html2canvas(clone, {
      scale: 2,
      useCORS: true,
      backgroundColor: '#ffffff',
      logging: true,
      onclone: (clonedDoc, element) => {
        // Clean up any problematic CSS
        const styles = clonedDoc.querySelectorAll('style');
        styles.forEach(style => {
          style.textContent = style.textContent
            ?.replace(/lab\([^)]+\)/g, 'rgb(0, 0, 0)')
            ?.replace(/lch\([^)]+\)/g, 'rgb(0, 0, 0)')
            ?.replace(/oklab\([^)]+\)/g, 'rgb(0, 0, 0)')
            ?.replace(/color-mix\([^)]+\)/g, 'rgb(0, 0, 0)');
        });

        // Force all elements to use simple colors
        const allElements = clonedDoc.querySelectorAll('*');
        allElements.forEach(el => {
          const computedStyle = window.getComputedStyle(el);
          const bgColor = computedStyle.backgroundColor;
          const color = computedStyle.color;
          
          // Replace any complex color functions
          if (bgColor.includes('lab(') || bgColor.includes('lch(') || bgColor.includes('oklab(')) {
            (el as HTMLElement).style.backgroundColor = '#ffffff';
          }
          if (color.includes('lab(') || color.includes('lch(') || color.includes('oklab(')) {
            (el as HTMLElement).style.color = '#000000';
          }
        });
      },
    });

    // Clean up
    document.body.removeChild(clone);

    const imgData = canvas.toDataURL('image/png');
    const link = document.createElement('a');
    link.href = imgData;
    link.download = `Booking-${booking.bookingReference}.png`;
    link.click();
    
  } catch (error) {
    console.error('Error generating image download:', error);
    
    // Fallback: Try with simpler configuration
    try {
      console.log('Attempting fallback download...');
      const element = printRef.current;
      const canvas = await html2canvas(element, {
        scale: 1,
        useCORS: true,
        backgroundColor: '#ffffff',
        ignoreElements: (element) => {
          // Ignore elements that might cause issues
          return element.tagName === 'SVG' || 
                 element.tagName === 'PATH' || 
                 element.classList.contains('no-capture');
        },
        onclone: (clonedDoc) => {
          // Remove problematic styles
          const allElements = clonedDoc.querySelectorAll('*');
          allElements.forEach(el => {
            const elem = el as HTMLElement;
            elem.style.color = '';
            elem.style.backgroundColor = '';
            elem.style.backgroundImage = '';
          });
        }
      });
      
      const imgData = canvas.toDataURL('image/png');
      const link = document.createElement('a');
      link.href = imgData;
      link.download = `Booking-${booking.bookingReference}-fallback.png`;
      link.click();
    } catch (fallbackError) {
      console.error('Fallback also failed:', fallbackError);
      alert('Failed to download booking form. Please try printing the page instead.');
    }
  }
};
  const autoDownload = async () => {
    if (booking && printRef.current && !downloadInitiated.current) {
      downloadInitiated.current = true;

      // Wait briefly for layout to settle then download
      await new Promise(resolve => setTimeout(resolve, 1000));
      await handleDownloadAsImage();
    }
  };

  useEffect(() => {
    autoDownload();
  }, [booking]);

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
        <div className="no-print bg-white dark:bg-gray-800 rounded-lg shadow-lg p-8 mb-6 text-center">
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
            Your property has been successfully reserved. Your booking form is being prepared for download...
          </p>

          {/* Booking Reference */}
          <div className="inline-block bg-orange-100 dark:bg-orange-900 px-6 py-3 rounded-lg mb-6">
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Booking Reference</p>
            <p className="text-2xl font-bold text-orange-600 dark:text-orange-400">
              {booking.bookingReference}
            </p>
          </div>

          {/* Expiry Warning */}
          <div className="mt-6 bg-yellow-50 dark:bg-yellow-900/30 border border-yellow-200 dark:border-yellow-700 rounded-lg p-4 mb-6">
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

          {/* Download Instructions */}
          <div className="bg-blue-50 dark:bg-blue-900/30 border border-blue-200 dark:border-blue-700 rounded-lg p-4 mb-6">
            <p className="text-sm text-blue-800 dark:text-blue-200">
              <strong>Note:</strong> Your booking image download should start automatically. If it doesn't, click the button below to download again.
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-wrap justify-center gap-4">
            <button
              onClick={handleDownloadAsImage}
              className="flex items-center px-6 py-3 bg-[#f47a45] text-white rounded-lg hover:bg-[#f58c55] transition-colors shadow-md"
            >
              <FaDownload className="mr-2" />
              Download Booking Form (Image)
            </button>
            <button
              onClick={() => router.push('/real-estates')}
              className="flex items-center px-6 py-3 border-2 border-[#f47a45] text-[#f47a45] rounded-lg hover:bg-[#f47a45] hover:text-white transition-colors"
            >
              <FaHome className="mr-2" />
              Back to Properties
            </button>
          </div>
        </div>

        {/* Printable Booking Form (This is what gets rendered as image) */}
        <div 
          ref={printRef} 
          style={{
            maxWidth: '794px',
            margin: '0 auto',
            backgroundColor: '#ffffff',
            color: '#000000',
            padding: '32px',
            borderRadius: '8px',
            boxShadow: '0 10px 25px rgba(0, 0, 0, 0.1)',
            fontFamily: 'system-ui, -apple-system, sans-serif',
            lineHeight: '1.6',
          }}
        >
          {/* Header */}
          <div style={{ textAlign: 'center', marginBottom: '32px', paddingBottom: '24px', borderBottom: '1px solid #d1d5db' }}>
            <h2 style={{ fontSize: '28px', fontWeight: 'bold', marginBottom: '8px', color: '#000000' }}>
              Property Booking Form
            </h2>
            <p style={{ color: '#4b5563' }}>
              Flourish Real Estate
            </p>
            <p style={{ fontSize: '12px', color: '#6b7280', marginTop: '8px' }}>
              Generated on {new Date().toLocaleString()}
            </p>
            <div style={{ marginTop: '16px', padding: '8px', backgroundColor: '#f3f4f6', borderRadius: '4px' }}>
              <p style={{ fontSize: '12px', fontWeight: '600', color: '#4b5563' }}>Booking Reference</p>
              <p style={{ fontSize: '20px', fontWeight: 'bold', color: '#f97316', margin: '4px 0 0 0' }}>{booking.bookingReference}</p>
            </div>
          </div>

          {/* Booking Details */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6 page-break">
            <div>
              <h3 className="text-lg font-semibold text-black mb-4 border-b pb-2">
                Booking Information
              </h3>
              <div className="space-y-3">
                <div>
                  <p className="text-sm text-gray-600">Status</p>
                  <span className={`inline-block px-3 py-1 rounded text-sm font-semibold ${
                    booking.status === 'pending' ? 'bg-yellow-100 text-yellow-800 border border-yellow-600' :
                    booking.status === 'confirmed' ? 'bg-blue-100 text-blue-800 border border-blue-600' :
                    booking.status === 'completed' ? 'bg-green-100 text-green-800 border border-green-600' :
                    'bg-gray-100 text-gray-800 border border-gray-600'
                  }`}>
                    {booking.status.toUpperCase()}
                  </span>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Booking Date</p>
                  <p className="font-semibold text-black">
                    {new Date(booking.bookingDate).toLocaleString()}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Expiry Date</p>
                  <p className="font-semibold text-red-700">
                    {new Date(booking.expiryDate).toLocaleString()}
                  </p>
                </div>
              </div>
            </div>

            {propertyDetails && (
              <div>
                <h3 className="text-lg font-semibold text-black mb-4 border-b pb-2">
                  Property Details
                </h3>
                <div className="space-y-3">
                  <div>
                    <p className="text-sm text-gray-600">Property Title</p>
                    <p className="font-semibold text-black">
                      {propertyDetails.title}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Address</p>
                    <p className="font-semibold text-black">
                      {propertyDetails.address}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Price</p>
                    <p className="font-semibold text-black">
                      ₦{propertyDetails.price.toLocaleString()}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Property Type</p>
                    <p className="font-semibold text-black capitalize">
                      {propertyDetails.propertyType}
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Personal Information */}
          <div className="border-t border-gray-300 pt-6 mb-6 page-break">
            <h3 className="text-lg font-semibold text-black mb-4 border-b pb-2">
              Personal Information
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-600">Full Name</p>
                <p className="font-semibold text-black">{booking.fullName}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Email</p>
                <p className="font-semibold text-black">{booking.email}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Phone</p>
                <p className="font-semibold text-black">{booking.phone}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Date of Birth</p>
                <p className="font-semibold text-black">
                  {new Date(booking.dateOfBirth).toLocaleDateString()}
                </p>
              </div>
              <div className="md:col-span-2">
                <p className="text-sm text-gray-600">Address</p>
                <p className="font-semibold text-black">{booking.address}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Occupation</p>
                <p className="font-semibold text-black">{booking.occupation}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">ID Type</p>
                <p className="font-semibold text-black">{booking.idType}</p>
              </div>
              <div className="md:col-span-2">
                <p className="text-sm text-gray-600">ID Number</p>
                <p className="font-semibold text-black">{booking.idNumber}</p>
              </div>
            </div>
          </div>

          {/* Parent/Guardian Information */}
          {(booking.parentName || booking.parentPhone || booking.parentEmail || booking.parentAddress) && (
            <div className="border-t border-gray-300 pt-6 mb-6 page-break">
              <h3 className="text-lg font-semibold text-black mb-4 border-b pb-2">
                Parent/Guardian Information
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {booking.parentName && (
                  <div>
                    <p className="text-sm text-gray-600">Name</p>
                    <p className="font-semibold text-black">{booking.parentName}</p>
                  </div>
                )}
                {booking.parentPhone && (
                  <div>
                    <p className="text-sm text-gray-600">Phone</p>
                    <p className="font-semibold text-black">{booking.parentPhone}</p>
                  </div>
                )}
                {booking.parentEmail && (
                  <div>
                    <p className="text-sm text-gray-600">Email</p>
                    <p className="font-semibold text-black">{booking.parentEmail}</p>
                  </div>
                )}
                {booking.parentAddress && (
                  <div>
                    <p className="text-sm text-gray-600">Address</p>
                    <p className="font-semibold text-black">{booking.parentAddress}</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Additional Notes */}
          {booking.notes && (
            <div className="border-t border-gray-300 pt-6 mb-6 page-break">
              <h3 className="text-lg font-semibold text-black mb-4 border-b pb-2">
                Additional Notes
              </h3>
              <p className="text-black">{booking.notes}</p>
            </div>
          )}

          {/* Payment Instructions */}
          <div className="border-t border-gray-300 pt-6 page-break">
            <h3 className="text-lg font-semibold text-black mb-4 border-b pb-2">
              Next Steps & Important Information
            </h3>
            
            <div className="mb-6 p-4 bg-red-50 border border-red-300 rounded">
              <p className="text-sm font-semibold text-red-700 mb-2">⚠️ IMPORTANT DEADLINE</p>
              <p className="text-black">
                Your booking expires on: <strong className="text-red-700">{expiryDate.toLocaleDateString()}</strong> at{' '}
                <strong className="text-red-700">{expiryDate.toLocaleTimeString()}</strong>
              </p>
              <p className="text-sm text-gray-700 mt-2">
                Please visit our office to complete payment before this date.
              </p>
            </div>
            
            <ol className="list-decimal list-inside space-y-2 text-black mb-6">
              <li>Print or save this booking form for your records</li>
              <li>Visit our office at: <strong>123 Business Avenue, City Center</strong></li>
              <li>Bring this booking form and your original ID for verification</li>
              <li>Complete the payment before the expiry date</li>
              <li>Receive your tenancy agreement and property keys</li>
            </ol>

            <div className="p-4 bg-blue-50 border border-blue-300 rounded">
              <p className="text-sm text-blue-900">
                <strong>Contact Us:</strong> For any questions, please contact us at <strong>+234 123 456 7890</strong> or{' '}
                <strong>info@flourishrealestate.com</strong>. Quote your booking reference: <strong>{booking.bookingReference}</strong>
              </p>
            </div>
          </div>

          {/* Footer */}
          <div className="mt-8 pt-6 border-t border-gray-400 text-center text-sm text-gray-600">
            <p>This is an official booking confirmation from Flourish Real Estate</p>
            <p className="mt-2">Generated: {new Date().toLocaleString()}</p>
            <p className="mt-1">Page 1 of 1</p>
          </div>
        </div>

        {/* Inline CSS for printing */}
        <style jsx global>{`
          @media print {
            body * {
              visibility: hidden;
            }
            .print-content, .print-content * {
              visibility: visible !important;
            }
            .print-content {
              position: absolute;
              left: 0;
              top: 0;
              width: 100%;
              max-width: 100% !important;
              margin: 0 !important;
              padding: 20mm !important;
              box-shadow: none !important;
              background: white !important;
              color: black !important;
            }
            .no-print {
              display: none !important;
            }
            .page-break {
              page-break-inside: avoid;
            }
          }
        `}</style>
      </motion.div>
    </div>
  );
};

export default BookingConfirmation;