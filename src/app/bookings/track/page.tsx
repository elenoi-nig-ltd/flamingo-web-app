'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useBookings, Booking } from '@/hooks/useBookings';
import Header from '@/components/Header';
import { motion } from 'framer-motion';

const TrackBookingPage = () => {
  const router = useRouter();
  const { getBookingByReference, getBookingsByEmail, loading, error } = useBookings();
  const [searchType, setSearchType] = useState<'reference' | 'email'>('reference');
  const [searchValue, setSearchValue] = useState('');
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [singleBooking, setSingleBooking] = useState<Booking | null>(null);
  const [searched, setSearched] = useState(false);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    setSearched(true);
    setBookings([]);
    setSingleBooking(null);

    if (searchType === 'reference') {
      const booking = await getBookingByReference(searchValue);
      if (booking) {
        setSingleBooking(booking);
      }
    } else {
      const results = await getBookingsByEmail(searchValue);
      setBookings(results);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300 border-yellow-300 dark:border-yellow-700';
      case 'confirmed':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300 border-blue-300 dark:border-blue-700';
      case 'completed':
        return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300 border-green-300 dark:border-green-700';
      case 'cancelled':
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-300 border-gray-300 dark:border-gray-700';
      case 'expired':
        return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300 border-red-300 dark:border-red-700';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-300 border-gray-300 dark:border-gray-700';
    }
  };

  const BookingCard = ({ booking }: { booking: Booking }) => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 mb-4 border border-gray-200 dark:border-gray-700"
    >
      <div className="flex justify-between items-start mb-4">
        <div>
          <h3 className="text-xl font-bold text-gray-800 dark:text-white mb-2">
            Booking: {booking.bookingReference}
          </h3>
          <span className={`inline-block px-3 py-1 rounded-full text-sm font-semibold border ${getStatusColor(booking.status)}`}>
            {booking.status.toUpperCase()}
          </span>
        </div>
        <button
          onClick={() => router.push(`/bookings/confirmation?reference=${booking.bookingReference}`)}
          className="px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition text-sm"
        >
          View Details
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
        <div>
          <p className="text-gray-500 dark:text-gray-400">Full Name</p>
          <p className="font-semibold text-gray-800 dark:text-white">{booking.fullName}</p>
        </div>
        <div>
          <p className="text-gray-500 dark:text-gray-400">Email</p>
          <p className="font-semibold text-gray-800 dark:text-white">{booking.email}</p>
        </div>
        <div>
          <p className="text-gray-500 dark:text-gray-400">Booking Date</p>
          <p className="font-semibold text-gray-800 dark:text-white">
            {new Date(booking.bookingDate).toLocaleDateString()}
          </p>
        </div>
        <div>
          <p className="text-gray-500 dark:text-gray-400">Expiry Date</p>
          <p className="font-semibold text-red-600 dark:text-red-400">
            {new Date(booking.expiryDate).toLocaleDateString()}
          </p>
        </div>
        {booking.paymentCompleted && (
          <div className="md:col-span-2">
            <p className="text-gray-500 dark:text-gray-400">Payment Status</p>
            <p className="font-semibold text-green-600 dark:text-green-400">
              ✓ Payment Completed on {booking.paymentDate ? new Date(booking.paymentDate).toLocaleDateString() : 'N/A'}
            </p>
          </div>
        )}
      </div>
    </motion.div>
  );

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900">
      <Header />
      
      <div className="container mx-auto px-6 py-12">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-4xl mx-auto"
        >
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-gray-800 dark:text-white mb-4">
              Track Your Booking
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              Search for your booking using your booking reference or email address
            </p>
          </div>

          {/* Search Form */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 mb-8">
            <div className="flex justify-center space-x-4 mb-6">
              <button
                onClick={() => setSearchType('reference')}
                className={`px-6 py-2 rounded-lg font-semibold transition ${
                  searchType === 'reference'
                    ? 'bg-orange-500 text-white'
                    : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600'
                }`}
              >
                By Reference
              </button>
              <button
                onClick={() => setSearchType('email')}
                className={`px-6 py-2 rounded-lg font-semibold transition ${
                  searchType === 'email'
                    ? 'bg-orange-500 text-white'
                    : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600'
                }`}
              >
                By Email
              </button>
            </div>

            <form onSubmit={handleSearch} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  {searchType === 'reference' ? 'Booking Reference' : 'Email Address'}
                </label>
                <input
                  type={searchType === 'email' ? 'email' : 'text'}
                  value={searchValue}
                  onChange={(e) => setSearchValue(e.target.value)}
                  placeholder={searchType === 'reference' ? 'e.g., BK-ABC123-XYZ' : 'e.g., john@example.com'}
                  required
                  className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-orange-500 dark:bg-gray-700 dark:text-white"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full px-6 py-3 bg-gradient-to-r from-orange-500 to-amber-500 text-white rounded-lg font-semibold hover:from-orange-600 hover:to-amber-600 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
              >
                {loading ? (
                  <>
                    <svg className="animate-spin h-5 w-5 mr-2" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                    Searching...
                  </>
                ) : (
                  <>
                    <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                    Search
                  </>
                )}
              </button>
            </form>
          </div>

          {/* Error Message */}
          {error && searched && (
            <div className="bg-red-100 dark:bg-red-900/30 border border-red-300 dark:border-red-700 rounded-lg p-4 mb-8">
              <p className="text-red-700 dark:text-red-300">{error}</p>
            </div>
          )}

          {/* Results */}
          {searched && !loading && !error && (
            <>
              {singleBooking && <BookingCard booking={singleBooking} />}
              
              {bookings.length > 0 && (
                <div>
                  <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-4">
                    Found {bookings.length} booking{bookings.length !== 1 ? 's' : ''}
                  </h2>
                  {bookings.map((booking) => (
                    <BookingCard key={booking._id} booking={booking} />
                  ))}
                </div>
              )}

              {!singleBooking && bookings.length === 0 && (
                <div className="text-center py-12">
                  <div className="text-gray-400 text-6xl mb-4">🔍</div>
                  <h3 className="text-xl font-semibold text-gray-800 dark:text-white mb-2">
                    No Bookings Found
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400">
                    {searchType === 'reference'
                      ? 'The booking reference you entered could not be found.'
                      : 'No bookings found for this email address.'}
                  </p>
                </div>
              )}
            </>
          )}

          {/* Help Section */}
          <div className="mt-8 bg-blue-50 dark:bg-blue-900/30 border border-blue-200 dark:border-blue-700 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-3">
              Need Help?
            </h3>
            <ul className="space-y-2 text-sm text-gray-700 dark:text-gray-300">
              <li>• Your booking reference was sent to your email after booking</li>
              <li>• Check your spam folder if you can't find the email</li>
              <li>• Contact support if you need assistance: support@flourishrealestate.com</li>
            </ul>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default TrackBookingPage;
