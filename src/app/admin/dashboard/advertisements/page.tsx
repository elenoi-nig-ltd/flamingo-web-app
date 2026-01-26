'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FaAd,
  FaCheckCircle,
  FaClock,
  FaBan,
  FaMoneyBillWave,
  FaSearch,
  FaEye,
  FaEdit,
  FaTimes,
  FaTrash,
  FaPause,
  FaPlay,
  FaChartLine,
} from 'react-icons/fa';
import axios from 'axios';
import { BASEURL } from '@/config/api/contants';
import Image from 'next/image';
import NotificationToast from '@/components/common/NotificationToast';
import { useNotification } from '@/hooks/useNotification';

interface Advertisement {
  _id: string;
  title: string;
  description: string;
  imageUrl: string;
  targetUrl: string;
  companyName: string;
  contactEmail: string;
  contactPhone: string;
  location: string;
  duration: number;
  totalPrice: number;
  status: string;
  paymentCompleted: boolean;
  paymentReference?: string;
  amountPaid?: number;
  startDate?: string;
  endDate?: string;
  adReference: string;
  impressions: number;
  clicks: number;
  adminNotes?: string;
  rejectionReason?: string;
  createdAt: string;
}

export default function AdminAdvertisements() {
  const {
    notification,
    showSuccess,
    showError,
    closeNotification,
  } = useNotification();
  const [advertisements, setAdvertisements] = useState<Advertisement[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  const [stats, setStats] = useState({
    totalAds: 0,
    activeAds: 0,
    pendingAds: 0,
    expiredAds: 0,
    totalRevenue: 0,
  });

  const [filters, setFilters] = useState({
    page: 1,
    limit: 10,
    search: '',
    status: '',
    location: '',
    paymentCompleted: undefined as boolean | undefined,
  });

  const [pagination, setPagination] = useState({
    total: 0,
    page: 1,
    limit: 10,
    totalPages: 0,
  });

  const [selectedAd, setSelectedAd] = useState<Advertisement | null>(null);
  const [showViewModal, setShowViewModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showConfirmPaymentModal, setShowConfirmPaymentModal] = useState(false);

  const [editData, setEditData] = useState({
    status: '',
    adminNotes: '',
    rejectionReason: '',
  });

  const [paymentData, setPaymentData] = useState({
    paymentReference: '',
    amountPaid: 0,
    paymentMethod: 'bank_transfer',
  });

  useEffect(() => {
    fetchAdvertisements();
    fetchStats();
  }, [filters]);

  const fetchAdvertisements = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');

      const params: any = {
        page: filters.page,
        limit: filters.limit,
      };

      if (filters.search) params.search = filters.search;
      if (filters.status) params.status = filters.status;
      if (filters.location) params.location = filters.location;
      if (filters.paymentCompleted !== undefined) params.paymentCompleted = filters.paymentCompleted;

      const response = await axios.get(`${BASEURL}/admin/advertisements`, {
        params,
        headers: { Authorization: `Bearer ${token}` },
      });

      setAdvertisements(response.data.advertisements);
      setPagination(response.data.pagination);
      setError('');
    } catch (err: any) {
      console.error('Error fetching advertisements:', err);
      setError(err.response?.data?.message || 'Failed to fetch advertisements');
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${BASEURL}/admin/advertisements/stats`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setStats(response.data);
    } catch (err) {
      console.error('Error fetching stats:', err);
    }
  };

  const handleApprove = async (id: string) => {
    if (!confirm('Approve this advertisement?')) return;

    try {
      const token = localStorage.getItem('token');
      await axios.put(
        `${BASEURL}/admin/advertisements/${id}/approve`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      fetchAdvertisements();
      fetchStats();
      showSuccess('Advertisement approved successfully');
    } catch (err: any) {
      showError(err.response?.data?.message || 'Failed to approve advertisement');
    }
  };

  const handleReject = async (id: string, reason: string) => {
    try {
      const token = localStorage.getItem('token');
      await axios.put(
        `${BASEURL}/admin/advertisements/${id}/reject`,
        { rejectionReason: reason },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      fetchAdvertisements();
      fetchStats();
      showSuccess('Advertisement rejected successfully');
    } catch (err: any) {
      showError(err.response?.data?.message || 'Failed to reject advertisement');
    }
  };

  const handlePause = async (id: string) => {
    try {
      const token = localStorage.getItem('token');
      await axios.put(
        `${BASEURL}/admin/advertisements/${id}/pause`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      fetchAdvertisements();
      showSuccess('Advertisement paused successfully');
    } catch (err: any) {
      showError(err.response?.data?.message || 'Failed to pause advertisement');
    }
  };

  const handleResume = async (id: string) => {
    try {
      const token = localStorage.getItem('token');
      await axios.put(
        `${BASEURL}/admin/advertisements/${id}/resume`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      fetchAdvertisements();
      showSuccess('Advertisement resumed successfully');
    } catch (err: any) {
      showError(err.response?.data?.message || 'Failed to resume advertisement');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this advertisement?')) return;

    try {
      const token = localStorage.getItem('token');
      await axios.delete(`${BASEURL}/admin/advertisements/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      fetchAdvertisements();
      fetchStats();
      showSuccess('Advertisement deleted successfully');
    } catch (err: any) {
      showError(err.response?.data?.message || 'Failed to delete advertisement');
    }
  };

  const handleConfirmPayment = async () => {
    if (!selectedAd) return;

    try {
      const token = localStorage.getItem('token');
      await axios.put(
        `${BASEURL}/admin/advertisements/${selectedAd._id}/confirm-payment`,
        paymentData,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      fetchAdvertisements();
      fetchStats();
      setShowConfirmPaymentModal(false);
      showSuccess('Payment confirmed successfully');
    } catch (err: any) {
      showError(err.response?.data?.message || 'Failed to confirm payment');
    }
  };

  const handleUpdate = async () => {
    if (!selectedAd) return;

    try {
      const token = localStorage.getItem('token');
      await axios.put(
        `${BASEURL}/admin/advertisements/${selectedAd._id}`,
        editData,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      fetchAdvertisements();
      setShowEditModal(false);
      showSuccess('Advertisement updated successfully');
    } catch (err: any) {
      showError(err.response?.data?.message || 'Failed to update advertisement');
    }
  };

  const getStatusBadge = (status: string) => {
    const statusStyles: any = {
      pending: 'bg-yellow-100 text-yellow-800',
      approved: 'bg-blue-100 text-blue-800',
      active: 'bg-green-100 text-green-800',
      rejected: 'bg-red-100 text-red-800',
      expired: 'bg-gray-100 text-gray-800',
      paused: 'bg-orange-100 text-orange-800',
    };

    return (
      <span
        className={`px-3 py-1 rounded-full text-xs font-semibold ${
          statusStyles[status] || 'bg-gray-100 text-gray-800'
        }`}
      >
        {status.toUpperCase()}
      </span>
    );
  };

  const statsCards = [
    {
      title: 'Total Ads',
      value: stats.totalAds,
      icon: <FaAd />,
      color: 'blue',
    },
    {
      title: 'Active Ads',
      value: stats.activeAds,
      icon: <FaCheckCircle />,
      color: 'green',
    },
    {
      title: 'Pending',
      value: stats.pendingAds,
      icon: <FaClock />,
      color: 'yellow',
    },
    {
      title: 'Expired',
      value: stats.expiredAds,
      icon: <FaBan />,
      color: 'gray',
    },
    {
      title: 'Total Revenue',
      value: `₦${stats.totalRevenue.toLocaleString()}`,
      icon: <FaMoneyBillWave />,
      color: 'purple',
    },
  ];

  return (
    <div className="p-6 dark:bg-gray-900 dark:text-white min-h-screen">
      {/* Notification Toast */}
      <NotificationToast notification={notification} onClose={closeNotification} />

      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-800 dark:text-white mb-2">
          Advertisement Management
        </h1>
        <p className="text-gray-600 dark:text-gray-400">Manage and monitor all advertisements</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
        {statsCards.map((stat, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className={`bg-white dark:bg-gray-800 p-6 rounded-xl shadow-md border-l-4 border-${stat.color}-500`}
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 dark:text-gray-400 text-sm mb-1">{stat.title}</p>
                <p className="text-2xl font-bold text-gray-800 dark:text-white">{stat.value}</p>
              </div>
              <div className={`text-3xl text-${stat.color}-500`}>
                {stat.icon}
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Filters */}
      <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-md mb-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="relative">
            <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search ads..."
              value={filters.search}
              onChange={(e) =>
                setFilters({ ...filters, search: e.target.value, page: 1 })
              }
              className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg focus:ring-2 focus:ring-[#f58c55] focus:border-transparent"
            />
          </div>

          <select
            value={filters.status}
            onChange={(e) =>
              setFilters({ ...filters, status: e.target.value, page: 1 })
            }
            className="px-4 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg focus:ring-2 focus:ring-[#f58c55] focus:border-transparent"
          >
            <option value="">All Statuses</option>
            <option value="pending">Pending</option>
            <option value="approved">Approved</option>
            <option value="active">Active</option>
            <option value="paused">Paused</option>
            <option value="rejected">Rejected</option>
            <option value="expired">Expired</option>
          </select>

          <select
            value={filters.location}
            onChange={(e) =>
              setFilters({ ...filters, location: e.target.value, page: 1 })
            }
            className="px-4 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg focus:ring-2 focus:ring-[#f58c55] focus:border-transparent"
          >
            <option value="">All Locations</option>
            <option value="landing_page_hero">Landing Page Featured</option>
            <option value="product_listings">Product Listings</option>
            <option value="property_listings">Property Listings</option>
            <option value="checkout_page">Checkout Page</option>
          </select>

          <select
            value={
              filters.paymentCompleted === undefined
                ? ''
                : filters.paymentCompleted.toString()
            }
            onChange={(e) =>
              setFilters({
                ...filters,
                paymentCompleted:
                  e.target.value === '' ? undefined : e.target.value === 'true',
                page: 1,
              })
            }
            className="px-4 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg focus:ring-2 focus:ring-[#f58c55] focus:border-transparent"
          >
            <option value="">All Payments</option>
            <option value="true">Paid</option>
            <option value="false">Unpaid</option>
          </select>
        </div>
      </div>

      {/* Error Display */}
      {error && (
        <div className="bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 p-4 rounded-lg mb-6">
          {error}
        </div>
      )}

      {/* Loading */}
      {loading ? (
        <div className="bg-white dark:bg-gray-800 p-12 rounded-xl shadow-md text-center">
          <div className="animate-spin text-4xl mb-4">⏳</div>
          <p className="text-gray-600 dark:text-gray-400">Loading advertisements...</p>
        </div>
      ) : advertisements.length === 0 ? (
        <div className="bg-white dark:bg-gray-800 p-12 rounded-xl shadow-md text-center">
          <FaAd className="text-6xl text-gray-300 dark:text-gray-700 mx-auto mb-4" />
          <p className="text-gray-600 dark:text-gray-400">No advertisements found</p>
        </div>
      ) : (
        <>
          {/* Advertisements Table */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 dark:bg-gray-700">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase">
                      Ad
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase">
                      Company
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase">
                      Location
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase">
                      Duration
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase">
                      Price
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase">
                      Payment
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase">
                      Analytics
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                  {advertisements.map((ad) => (
                    <tr key={ad._id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                      <td className="px-6 py-4">
                        <div className="flex items-center space-x-3">
                          <div className="relative w-16 h-16 rounded-lg overflow-hidden">
                            <Image
                              src={ad.imageUrl}
                              alt={ad.title}
                              fill
                              className="object-cover"
                            />
                          </div>
                          <div>
                            <p className="font-semibold text-gray-800 dark:text-white">
                              {ad.title}
                            </p>
                            <p className="text-xs text-gray-500 dark:text-gray-400">
                              {ad.adReference}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <p className="font-medium text-gray-800 dark:text-white">
                          {ad.companyName}
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">{ad.contactEmail}</p>
                      </td>
                      <td className="px-6 py-4">
                        <p className="text-sm text-gray-800 dark:text-gray-200">
                          {ad.location.replace(/_/g, ' ').toUpperCase()}
                        </p>
                      </td>
                      <td className="px-6 py-4">
                        <p className="text-sm text-gray-800 dark:text-gray-200">
                          {ad.duration} days
                        </p>
                      </td>
                      <td className="px-6 py-4">
                        <p className="font-semibold text-gray-800 dark:text-white">
                          ₦{ad.totalPrice.toLocaleString()}
                        </p>
                      </td>
                      <td className="px-6 py-4">{getStatusBadge(ad.status)}</td>
                      <td className="px-6 py-4">
                        {ad.paymentCompleted ? (
                          <span className="text-green-600 dark:text-green-400 font-semibold text-sm">
                            ✓ Paid
                          </span>
                        ) : (
                          <button
                            onClick={() => {
                              setSelectedAd(ad);
                              setPaymentData({
                                paymentReference: '',
                                amountPaid: ad.totalPrice,
                                paymentMethod: 'bank_transfer',
                              });
                              setShowConfirmPaymentModal(true);
                            }}
                            className="text-orange-600 dark:text-orange-400 hover:text-orange-700 dark:hover:text-orange-300 font-semibold text-sm"
                          >
                            Confirm Payment
                          </button>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-xs text-gray-600 dark:text-gray-400">
                          <div>👁️ {ad.impressions}</div>
                          <div>🖱️ {ad.clicks}</div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center justify-end space-x-2">
                          <button
                            onClick={() => {
                              setSelectedAd(ad);
                              setShowViewModal(true);
                            }}
                            className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg"
                            title="View"
                          >
                            <FaEye />
                          </button>
                          <button
                            onClick={() => {
                              setSelectedAd(ad);
                              setEditData({
                                status: ad.status,
                                adminNotes: ad.adminNotes || '',
                                rejectionReason: ad.rejectionReason || '',
                              });
                              setShowEditModal(true);
                            }}
                            className="p-2 text-green-600 hover:bg-green-50 rounded-lg"
                            title="Edit"
                          >
                            <FaEdit />
                          </button>
                          {ad.status === 'pending' &&
                            ad.paymentCompleted && (
                              <button
                                onClick={() => handleApprove(ad._id)}
                                className="p-2 text-green-600 hover:bg-green-50 rounded-lg"
                                title="Approve"
                              >
                                <FaCheckCircle />
                              </button>
                            )}
                          {ad.status === 'active' && (
                            <button
                              onClick={() => handlePause(ad._id)}
                              className="p-2 text-orange-600 hover:bg-orange-50 rounded-lg"
                              title="Pause"
                            >
                              <FaPause />
                            </button>
                          )}
                          {ad.status === 'paused' && (
                            <button
                              onClick={() => handleResume(ad._id)}
                              className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg"
                              title="Resume"
                            >
                              <FaPlay />
                            </button>
                          )}
                          <button
                            onClick={() => handleDelete(ad._id)}
                            className="p-2 text-red-600 hover:bg-red-50 rounded-lg"
                            title="Delete"
                          >
                            <FaTrash />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Pagination */}
          <div className="mt-6 flex items-center justify-between">
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Showing {(pagination.page - 1) * pagination.limit + 1} to{' '}
              {Math.min(pagination.page * pagination.limit, pagination.total)} of{' '}
              {pagination.total} advertisements
            </p>
            <div className="flex space-x-2">
              <button
                onClick={() =>
                  setFilters({ ...filters, page: Math.max(1, filters.page - 1) })
                }
                disabled={pagination.page === 1}
                className="px-4 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg hover:bg-gray-50 dark:hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Previous
              </button>
              <button
                onClick={() =>
                  setFilters({
                    ...filters,
                    page: Math.min(pagination.totalPages, filters.page + 1),
                  })
                }
                disabled={pagination.page === pagination.totalPages}
                className="px-4 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg hover:bg-gray-50 dark:hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Next
              </button>
            </div>
          </div>
        </>
      )}

      {/* View Modal */}
      <AnimatePresence>
        {showViewModal && selectedAd && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
            onClick={() => setShowViewModal(false)}
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto"
            >
              <div className="p-6">
                <div className="flex justify-between items-center mb-6">
                  <h3 className="text-2xl font-bold text-gray-800 dark:text-white">
                    Advertisement Details
                  </h3>
                  <button
                    onClick={() => setShowViewModal(false)}
                    className="text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-400"
                  >
                    <FaTimes className="text-2xl" />
                  </button>
                </div>

                <div className="space-y-6">
                  <div className="relative w-full h-64 rounded-lg overflow-hidden">
                    <Image
                      src={selectedAd.imageUrl}
                      alt={selectedAd.title}
                      fill
                      className="object-cover"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-gray-600 dark:text-gray-400">Reference</p>
                      <p className="font-semibold dark:text-white">{selectedAd.adReference}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600 dark:text-gray-400">Status</p>
                      {getStatusBadge(selectedAd.status)}
                    </div>
                    <div>
                      <p className="text-sm text-gray-600 dark:text-gray-400">Company</p>
                      <p className="font-semibold dark:text-white">{selectedAd.companyName}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600 dark:text-gray-400">Contact</p>
                      <p className="text-sm dark:text-gray-300">{selectedAd.contactEmail}</p>
                      <p className="text-sm dark:text-gray-300">{selectedAd.contactPhone}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600 dark:text-gray-400">Total Price</p>
                      <p className="font-semibold text-lg text-[#f58c55]">
                        ₦{selectedAd.totalPrice.toLocaleString()}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600 dark:text-gray-400">Payment Status</p>
                      <p
                        className={
                          selectedAd.paymentCompleted
                            ? 'text-green-600 dark:text-green-400 font-semibold'
                            : 'text-red-600 dark:text-red-400 font-semibold'
                        }
                      >
                        {selectedAd.paymentCompleted ? 'Paid' : 'Unpaid'}
                      </p>
                    </div>
                  </div>

                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">Title</p>
                    <p className="font-semibold dark:text-white">{selectedAd.title}</p>
                  </div>

                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">Description</p>
                    <p className="text-gray-700 dark:text-gray-300">{selectedAd.description}</p>
                  </div>

                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">Target URL</p>
                    <a
                      href={selectedAd.targetUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 dark:text-blue-400 hover:underline"
                    >
                      {selectedAd.targetUrl}
                    </a>
                  </div>

                  {selectedAd.adminNotes && (
                    <div className="bg-yellow-50 dark:bg-yellow-900/30 p-4 rounded-lg">
                      <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">Admin Notes</p>
                      <p className="text-gray-700 dark:text-gray-300">{selectedAd.adminNotes}</p>
                    </div>
                  )}

                  {selectedAd.rejectionReason && (
                    <div className="bg-red-50 dark:bg-red-900/30 p-4 rounded-lg">
                      <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                        Rejection Reason
                      </p>
                      <p className="text-gray-700 dark:text-gray-300">
                        {selectedAd.rejectionReason}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Edit Modal */}
      <AnimatePresence>
        {showEditModal && selectedAd && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
            onClick={() => setShowEditModal(false)}
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-lg w-full p-6"
            >
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-2xl font-bold text-gray-800 dark:text-white">
                  Edit Advertisement
                </h3>
                <button
                  onClick={() => setShowEditModal(false)}
                  className="text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-400"
                >
                  <FaTimes className="text-2xl" />
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                    Status
                  </label>
                  <select
                    value={editData.status}
                    onChange={(e) =>
                      setEditData({ ...editData, status: e.target.value })
                    }
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg focus:ring-2 focus:ring-[#f58c55]"
                  >
                    <option value="pending">Pending</option>
                    <option value="approved">Approved</option>
                    <option value="active">Active</option>
                    <option value="paused">Paused</option>
                    <option value="rejected">Rejected</option>
                    <option value="expired">Expired</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                    Admin Notes
                  </label>
                  <textarea
                    value={editData.adminNotes}
                    onChange={(e) =>
                      setEditData({ ...editData, adminNotes: e.target.value })
                    }
                    rows={3}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg focus:ring-2 focus:ring-[#f58c55] resize-none"
                  />
                </div>

                {editData.status === 'rejected' && (
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                      Rejection Reason
                    </label>
                    <textarea
                      value={editData.rejectionReason}
                      onChange={(e) =>
                        setEditData({
                          ...editData,
                          rejectionReason: e.target.value,
                        })
                      }
                      rows={3}
                      className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg focus:ring-2 focus:ring-[#f58c55] resize-none"
                    />
                  </div>
                )}

                <div className="flex space-x-3 pt-4">
                  <button
                    onClick={handleUpdate}
                    className="flex-1 bg-[#f58c55] text-white py-3 rounded-lg hover:bg-[#e67e4a] font-semibold"
                  >
                    Update
                  </button>
                  <button
                    onClick={() => setShowEditModal(false)}
                    className="flex-1 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-white py-3 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 font-semibold"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Confirm Payment Modal */}
      <AnimatePresence>
        {showConfirmPaymentModal && selectedAd && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
            onClick={() => setShowConfirmPaymentModal(false)}
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-md w-full p-6"
            >
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-2xl font-bold text-gray-800 dark:text-white">
                  Confirm Payment
                </h3>
                <button
                  onClick={() => setShowConfirmPaymentModal(false)}
                  className="text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-400"
                >
                  <FaTimes className="text-2xl" />
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                    Payment Reference
                  </label>
                  <input
                    type="text"
                    value={paymentData.paymentReference}
                    onChange={(e) =>
                      setPaymentData({
                        ...paymentData,
                        paymentReference: e.target.value,
                      })
                    }
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg focus:ring-2 focus:ring-[#f58c55]"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                    Amount Paid (₦)
                  </label>
                  <input
                    type="number"
                    value={paymentData.amountPaid}
                    onChange={(e) =>
                      setPaymentData({
                        ...paymentData,
                        amountPaid: Number(e.target.value),
                      })
                    }
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg focus:ring-2 focus:ring-[#f58c55]"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                    Payment Method
                  </label>
                  <select
                    value={paymentData.paymentMethod}
                    onChange={(e) =>
                      setPaymentData({
                        ...paymentData,
                        paymentMethod: e.target.value,
                      })
                    }
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg focus:ring-2 focus:ring-[#f58c55]"
                  >
                    <option value="bank_transfer">Bank Transfer</option>
                    <option value="cash">Cash</option>
                    <option value="card">Card</option>
                    <option value="other">Other</option>
                  </select>
                </div>

                <div className="flex space-x-3 pt-4">
                  <button
                    onClick={handleConfirmPayment}
                    className="flex-1 bg-green-500 text-white py-3 rounded-lg hover:bg-green-600 font-semibold"
                  >
                    Confirm Payment
                  </button>
                  <button
                    onClick={() => setShowConfirmPaymentModal(false)}
                    className="flex-1 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-white py-3 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 font-semibold"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
