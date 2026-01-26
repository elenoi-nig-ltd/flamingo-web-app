'use client';

import { useState, useEffect } from 'react';
import { FaSearch, FaFilter, FaDownload, FaEye, FaEdit, FaTrash, FaCheck, FaTimes, FaCalendar, FaUser, FaHome, FaMoneyBill } from 'react-icons/fa';
import { motion, AnimatePresence } from 'framer-motion';
import axios from 'axios';
import { BASEURL } from '@/config/api/contants';

interface Booking {
  _id: string;
  bookingReference: string;
  fullName: string;
  email: string;
  phone: string;
  address: string;
  dateOfBirth: string;
  occupation: string;
  idType: string;
  idNumber: string;
  verificationPhoto: string;
  propertyId: {
    _id: string;
    title: string;
    address: string;
    price: number;
  };
  status: 'pending' | 'confirmed' | 'completed' | 'cancelled' | 'expired';
  bookingDate: string;
  expiryDate: string;
  paymentCompleted: boolean;
  paymentDate?: string;
  paymentReference?: string;
  amountPaid?: number;
  paymentMethod?: string;
  adminNotes?: string;
  notes?: string;
  parentName?: string;
  parentPhone?: string;
  parentEmail?: string;
  parentAddress?: string;
}

interface BookingStats {
  total: number;
  pending: number;
  confirmed: number;
  completed: number;
  cancelled: number;
  expired: number;
}

const statusColors = {
  pending: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
  confirmed: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
  completed: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
  cancelled: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
  expired: 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200',
};

export default function AdminBookingsPage() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [stats, setStats] = useState<BookingStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);

  // Filters
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [paymentFilter, setPaymentFilter] = useState<string>('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    fetchBookings();
    fetchStats();
  }, [page, statusFilter, paymentFilter, searchTerm]);

  const fetchBookings = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        console.error('No authentication token found');
        setLoading(false);
        return;
      }

      const params: any = { page, limit: 10 };
      
      if (statusFilter) params.status = statusFilter;
      if (paymentFilter) params.paymentCompleted = paymentFilter === 'paid';
      if (searchTerm) params.search = searchTerm;

      console.log('Fetching bookings with params:', params);

      const response = await axios.get(`${BASEURL}/admin/bookings`, {
        headers: { Authorization: `Bearer ${token}` },
        params,
      });

      console.log('Bookings response:', response.data);

      // Handle the response structure
      const responseData = response.data.data || response.data;
      
      if (responseData.bookings && Array.isArray(responseData.bookings)) {
        setBookings(responseData.bookings);
        setTotalPages(responseData.totalPages || 1);
      } else {
        console.warn('Unexpected response structure:', responseData);
        setBookings([]);
      }
      setError(null);
      setLoading(false);
    } catch (error: any) {
      console.error('Error fetching bookings:', error);
      let errorMsg = 'Failed to load bookings';
      
      if (error.response?.status === 401) {
        errorMsg = 'Unauthorized: Please check your authentication token';
      } else if (error.response?.status === 403) {
        errorMsg = 'Forbidden: You do not have permission to view bookings';
      } else if (error.response?.data?.message) {
        errorMsg = error.response.data.message;
      }
      
      if (error.response) {
        console.error('Response status:', error.response.status);
        console.error('Response data:', error.response.data);
      }
      
      setError(errorMsg);
      setBookings([]);
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        console.error('No authentication token found for stats');
        return;
      }

      console.log('Fetching booking stats...');

      const response = await axios.get(`${BASEURL}/admin/bookings/stats`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      console.log('Stats response:', response.data);

      const responseData = response.data.data || response.data;
      setStats(responseData);
    } catch (error: any) {
      console.error('Error fetching stats:', error);
      if (error.response) {
        console.error('Response status:', error.response.status);
        console.error('Response data:', error.response.data);
      }
    }
  };

  const handleApprove = async (id: string) => {
    try {
      const token = localStorage.getItem('token');
      await axios.put(
        `${BASEURL}/admin/bookings/${id}/approve`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      fetchBookings();
      fetchStats();
    } catch (error) {
      console.error('Error approving booking:', error);
    }
  };

  const handleReject = async (id: string) => {
    const reason = prompt('Enter rejection reason (optional):');
    try {
      const token = localStorage.getItem('token');
      await axios.put(
        `${BASEURL}/admin/bookings/${id}/reject`,
        { reason },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      fetchBookings();
      fetchStats();
    } catch (error) {
      console.error('Error rejecting booking:', error);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this booking? This action cannot be undone.')) {
      return;
    }

    try {
      const token = localStorage.getItem('token');
      await axios.delete(`${BASEURL}/admin/bookings/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      fetchBookings();
      fetchStats();
    } catch (error) {
      console.error('Error deleting booking:', error);
    }
  };

  const viewBookingDetails = (booking: Booking) => {
    setSelectedBooking(booking);
    setShowModal(true);
  };

  const editBooking = (booking: Booking) => {
    setSelectedBooking(booking);
    setShowEditModal(true);
  };

  const handleUpdateBooking = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!selectedBooking) return;

    const formData = new FormData(e.currentTarget);
    const updateData: any = {
      status: formData.get('status'),
      paymentCompleted: formData.get('paymentCompleted') === 'true',
      amountPaid: parseFloat(formData.get('amountPaid') as string) || undefined,
      paymentMethod: formData.get('paymentMethod') || undefined,
      paymentReference: formData.get('paymentReference') || undefined,
      adminNotes: formData.get('adminNotes') || undefined,
    };

    // Remove undefined values
    Object.keys(updateData).forEach(key => updateData[key] === undefined && delete updateData[key]);

    try {
      const token = localStorage.getItem('token');
      await axios.put(
        `${BASEURL}/admin/bookings/${selectedBooking._id}`,
        updateData,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setShowEditModal(false);
      fetchBookings();
      fetchStats();
    } catch (error) {
      console.error('Error updating booking:', error);
      alert('Failed to update booking');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#f58c55]"></div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-gray-800 dark:text-white">Manage Bookings</h1>
        <button
          onClick={() => fetchBookings()}
          className="px-4 py-2 bg-[#f58c55] text-white rounded-lg hover:bg-[#e67a42] transition-colors"
        >
          Refresh
        </button>
      </div>

      {/* Error Alert */}
      {error && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          className="bg-red-100 dark:bg-red-900 border border-red-400 dark:border-red-700 text-red-800 dark:text-red-200 px-4 py-3 rounded relative"
          role="alert"
        >
          <strong className="font-bold">Error!</strong>
          <span className="block sm:inline ml-2">{error}</span>
          <button
            onClick={() => setError(null)}
            className="absolute top-0 bottom-0 right-0 px-4 py-3"
          >
            <span className="text-2xl">&times;</span>
          </button>
        </motion.div>
      )}

      {/* Stats Cards */}
      {stats && (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          <StatsCard title="Total" count={stats.total} icon={<FaHome />} color="blue" />
          <StatsCard title="Pending" count={stats.pending} icon={<FaCalendar />} color="yellow" />
          <StatsCard title="Confirmed" count={stats.confirmed} icon={<FaCheck />} color="blue" />
          <StatsCard title="Completed" count={stats.completed} icon={<FaMoneyBill />} color="green" />
          <StatsCard title="Cancelled" count={stats.cancelled} icon={<FaTimes />} color="red" />
          <StatsCard title="Expired" count={stats.expired} icon={<FaCalendar />} color="gray" />
        </div>
      )}

      {/* Filters */}
      <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-md space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Search
            </label>
            <div className="relative">
              <FaSearch className="absolute left-3 top-3 text-gray-400" />
              <input
                type="text"
                placeholder="Name, email, reference..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-[#f58c55] dark:bg-gray-700 dark:text-white"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Status
            </label>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-[#f58c55] dark:bg-gray-700 dark:text-white"
            >
              <option value="">All Status</option>
              <option value="pending">Pending</option>
              <option value="confirmed">Confirmed</option>
              <option value="completed">Completed</option>
              <option value="cancelled">Cancelled</option>
              <option value="expired">Expired</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Payment
            </label>
            <select
              value={paymentFilter}
              onChange={(e) => setPaymentFilter(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-[#f58c55] dark:bg-gray-700 dark:text-white"
            >
              <option value="">All Payments</option>
              <option value="paid">Paid</option>
              <option value="unpaid">Unpaid</option>
            </select>
          </div>

          <div className="flex items-end">
            <button
              onClick={() => {
                setSearchTerm('');
                setStatusFilter('');
                setPaymentFilter('');
                setPage(1);
              }}
              className="w-full px-4 py-2 bg-gray-200 dark:bg-gray-600 text-gray-700 dark:text-white rounded-lg hover:bg-gray-300 dark:hover:bg-gray-500 transition-colors"
            >
              Clear Filters
            </button>
          </div>
        </div>
      </div>

      {/* Bookings Table */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden">
        <div className="overflow-x-auto">
          {bookings.length === 0 ? (
            <div className="p-8 text-center">
              <p className="text-gray-500 dark:text-gray-400 mb-4">No bookings found</p>
              <button
                onClick={() => fetchBookings()}
                className="px-4 py-2 bg-[#f58c55] text-white rounded-lg hover:bg-[#e67a42] transition-colors"
              >
                Try Again
              </button>
            </div>
          ) : (
            <table className="w-full">
              <thead className="bg-gray-50 dark:bg-gray-700">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Reference
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Client
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Property
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Payment
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Date
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-600">
                {bookings.map((booking) => (
                  <tr key={booking._id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                      {booking.bookingReference}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900 dark:text-white">{booking.fullName}</div>
                      <div className="text-sm text-gray-500 dark:text-gray-400">{booking.email}</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-900 dark:text-white">{booking.propertyId?.title || 'N/A'}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${statusColors[booking.status]}`}>
                        {booking.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {booking.paymentCompleted ? (
                        <span className="text-green-600 dark:text-green-400 font-semibold">✓ Paid</span>
                      ) : (
                        <span className="text-red-600 dark:text-red-400">Unpaid</span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                      {new Date(booking.bookingDate).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                      <button
                        onClick={() => viewBookingDetails(booking)}
                        className="text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300"
                        title="View Details"
                      >
                        <FaEye className="inline" />
                      </button>
                      <button
                        onClick={() => editBooking(booking)}
                        className="text-yellow-600 hover:text-yellow-900 dark:text-yellow-400 dark:hover:text-yellow-300"
                        title="Edit"
                      >
                        <FaEdit className="inline" />
                      </button>
                      {booking.status === 'pending' && (
                        <>
                          <button
                            onClick={() => handleApprove(booking._id)}
                            className="text-green-600 hover:text-green-900 dark:text-green-400 dark:hover:text-green-300"
                            title="Approve"
                          >
                            <FaCheck className="inline" />
                          </button>
                          <button
                            onClick={() => handleReject(booking._id)}
                            className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300"
                            title="Reject"
                          >
                            <FaTimes className="inline" />
                          </button>
                        </>
                      )}
                      <button
                        onClick={() => handleDelete(booking._id)}
                        className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300"
                        title="Delete"
                      >
                        <FaTrash className="inline" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {/* Pagination */}
        <div className="bg-gray-50 dark:bg-gray-700 px-4 py-3 flex items-center justify-between border-t border-gray-200 dark:border-gray-600">
          <div className="flex-1 flex justify-between sm:hidden">
            <button
              onClick={() => setPage(page - 1)}
              disabled={page === 1}
              className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
            >
              Previous
            </button>
            <button
              onClick={() => setPage(page + 1)}
              disabled={page === totalPages}
              className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
            >
              Next
            </button>
          </div>
          <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
            <div>
              <p className="text-sm text-gray-700 dark:text-gray-300">
                Page <span className="font-medium">{page}</span> of <span className="font-medium">{totalPages}</span>
              </p>
            </div>
            <div>
              <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px">
                <button
                  onClick={() => setPage(page - 1)}
                  disabled={page === 1}
                  className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-sm font-medium text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50"
                >
                  Previous
                </button>
                <button
                  onClick={() => setPage(page + 1)}
                  disabled={page === totalPages}
                  className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-sm font-medium text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50"
                >
                  Next
                </button>
              </nav>
            </div>
          </div>
        </div>
      </div>

      {/* View Details Modal */}
      <AnimatePresence>
        {showModal && selectedBooking && (
          <BookingDetailsModal
            booking={selectedBooking}
            onClose={() => {
              setShowModal(false);
              setSelectedBooking(null);
            }}
          />
        )}
      </AnimatePresence>

      {/* Edit Modal */}
      <AnimatePresence>
        {showEditModal && selectedBooking && (
          <EditBookingModal
            booking={selectedBooking}
            onClose={() => {
              setShowEditModal(false);
              setSelectedBooking(null);
            }}
            onSubmit={handleUpdateBooking}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

// Stats Card Component
function StatsCard({ title, count, icon, color }: { title: string; count: number; icon: React.ReactNode; color: string }) {
  const colorClasses: any = {
    blue: 'bg-blue-100 text-blue-600 dark:bg-blue-900 dark:text-blue-300',
    yellow: 'bg-yellow-100 text-yellow-600 dark:bg-yellow-900 dark:text-yellow-300',
    green: 'bg-green-100 text-green-600 dark:bg-green-900 dark:text-green-300',
    red: 'bg-red-100 text-red-600 dark:bg-red-900 dark:text-red-300',
    gray: 'bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-300',
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-md"
    >
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-gray-600 dark:text-gray-400">{title}</p>
          <p className="text-2xl font-bold text-gray-800 dark:text-white">{count}</p>
        </div>
        <div className={`p-3 rounded-full ${colorClasses[color]}`}>
          {icon}
        </div>
      </div>
    </motion.div>
  );
}

// Booking Details Modal Component
function BookingDetailsModal({ booking, onClose }: { booking: Booking; onClose: () => void }) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.9 }}
        animate={{ scale: 1 }}
        exit={{ scale: 0.9 }}
        className="bg-white dark:bg-gray-800 rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-gray-800 dark:text-white">Booking Details</h2>
            <button onClick={onClose} className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200">
              <FaTimes size={24} />
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Personal Information */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-800 dark:text-white border-b pb-2">Personal Information</h3>
              <DetailRow label="Reference" value={booking.bookingReference} />
              <DetailRow label="Full Name" value={booking.fullName} />
              <DetailRow label="Email" value={booking.email} />
              <DetailRow label="Phone" value={booking.phone} />
              <DetailRow label="Address" value={booking.address} />
              <DetailRow label="Date of Birth" value={new Date(booking.dateOfBirth).toLocaleDateString()} />
              <DetailRow label="Occupation" value={booking.occupation} />
              <DetailRow label="ID Type" value={booking.idType} />
              <DetailRow label="ID Number" value={booking.idNumber} />
            </div>

            {/* Booking Information */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-800 dark:text-white border-b pb-2">Booking Information</h3>
              <DetailRow label="Property" value={booking.propertyId?.title || 'N/A'} />
              <DetailRow label="Status" value={booking.status} />
              <DetailRow label="Booking Date" value={new Date(booking.bookingDate).toLocaleString()} />
              <DetailRow label="Expiry Date" value={new Date(booking.expiryDate).toLocaleString()} />
              <DetailRow label="Payment Status" value={booking.paymentCompleted ? 'Paid' : 'Unpaid'} />
              {booking.paymentCompleted && (
                <>
                  {booking.amountPaid && <DetailRow label="Amount Paid" value={`₦${booking.amountPaid.toLocaleString()}`} />}
                  {booking.paymentMethod && <DetailRow label="Payment Method" value={booking.paymentMethod} />}
                  {booking.paymentReference && <DetailRow label="Payment Reference" value={booking.paymentReference} />}
                  {booking.paymentDate && <DetailRow label="Payment Date" value={new Date(booking.paymentDate).toLocaleString()} />}
                </>
              )}
            </div>

            {/* Parent/Guardian Information */}
            {booking.parentName && (
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-800 dark:text-white border-b pb-2">Parent/Guardian Information</h3>
                <DetailRow label="Name" value={booking.parentName} />
                {booking.parentPhone && <DetailRow label="Phone" value={booking.parentPhone} />}
                {booking.parentEmail && <DetailRow label="Email" value={booking.parentEmail} />}
                {booking.parentAddress && <DetailRow label="Address" value={booking.parentAddress} />}
              </div>
            )}

            {/* Verification Photo */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-800 dark:text-white border-b pb-2">Verification Photo</h3>
              <img src={booking.verificationPhoto} alt="Verification" className="w-full h-64 object-cover rounded-lg" />
            </div>

            {/* Notes */}
            {(booking.notes || booking.adminNotes) && (
              <div className="md:col-span-2 space-y-4">
                <h3 className="text-lg font-semibold text-gray-800 dark:text-white border-b pb-2">Notes</h3>
                {booking.notes && <DetailRow label="Client Notes" value={booking.notes} />}
                {booking.adminNotes && <DetailRow label="Admin Notes" value={booking.adminNotes} />}
              </div>
            )}
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}

// Edit Booking Modal Component
function EditBookingModal({ booking, onClose, onSubmit }: { booking: Booking; onClose: () => void; onSubmit: (e: React.FormEvent<HTMLFormElement>) => void }) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.9 }}
        animate={{ scale: 1 }}
        exit={{ scale: 0.9 }}
        className="bg-white dark:bg-gray-800 rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <form onSubmit={onSubmit} className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-gray-800 dark:text-white">Edit Booking</h2>
            <button type="button" onClick={onClose} className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200">
              <FaTimes size={24} />
            </button>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Status</label>
              <select
                name="status"
                defaultValue={booking.status}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-[#f58c55] dark:bg-gray-700 dark:text-white"
              >
                <option value="pending">Pending</option>
                <option value="confirmed">Confirmed</option>
                <option value="completed">Completed</option>
                <option value="cancelled">Cancelled</option>
                <option value="expired">Expired</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Payment Status</label>
              <select
                name="paymentCompleted"
                defaultValue={booking.paymentCompleted ? 'true' : 'false'}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-[#f58c55] dark:bg-gray-700 dark:text-white"
              >
                <option value="false">Unpaid</option>
                <option value="true">Paid</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Amount Paid</label>
              <input
                type="number"
                name="amountPaid"
                defaultValue={booking.amountPaid}
                placeholder="Enter amount"
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-[#f58c55] dark:bg-gray-700 dark:text-white"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Payment Method</label>
              <input
                type="text"
                name="paymentMethod"
                defaultValue={booking.paymentMethod}
                placeholder="e.g., Cash, Bank Transfer, Card"
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-[#f58c55] dark:bg-gray-700 dark:text-white"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Payment Reference</label>
              <input
                type="text"
                name="paymentReference"
                defaultValue={booking.paymentReference}
                placeholder="Enter payment reference"
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-[#f58c55] dark:bg-gray-700 dark:text-white"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Admin Notes</label>
              <textarea
                name="adminNotes"
                defaultValue={booking.adminNotes}
                rows={4}
                placeholder="Add internal notes..."
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-[#f58c55] dark:bg-gray-700 dark:text-white"
              />
            </div>
          </div>

          <div className="mt-6 flex justify-end space-x-4">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-6 py-2 bg-[#f58c55] text-white rounded-lg hover:bg-[#e67a42] transition-colors"
            >
              Save Changes
            </button>
          </div>
        </form>
      </motion.div>
    </motion.div>
  );
}

// Detail Row Component
function DetailRow({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-sm text-gray-500 dark:text-gray-400">{label}</p>
      <p className="text-gray-800 dark:text-white">{value}</p>
    </div>
  );
}
