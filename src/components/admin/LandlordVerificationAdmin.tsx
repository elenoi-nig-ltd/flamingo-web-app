'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FaCheckCircle, FaTimesCircle, FaEye, FaSpinner } from 'react-icons/fa';
import { useAuth } from '@/hooks/useAuth';
import { useLandlord } from '@/hooks/useLandlord';

interface LandlordVerification {
  landlordId: string;
  fullName: string;
  photoUrl: string;
  homeAddress: string;
  phoneNumber: string;
  phoneNumber2?: string;
  email: string;
  documentType?: string;
  documentNumber: string;
  status?: 'pending' | 'verified' | 'rejected' | 'not_submitted';
  rejectionReason?: string;
  submittedAt: string;
}

// Skeleton component for table rows
const VerificationSkeleton = () => (
  <tr className="border-b border-gray-200/50 dark:border-gray-700/50">
    {[...Array(6)].map((_, i) => (
      <td key={i} className="py-4 px-4">
        <div className="h-4 bg-gray-200/50 dark:bg-gray-700/50 rounded w-3/4 animate-pulse"></div>
      </td>
    ))}
  </tr>
);

const LandlordVerificationAdmin = () => {
  const { user } = useAuth();
  const { verifications, loading, error, updateVerification } = useLandlord();
  const [selectedVerification, setSelectedVerification] = useState<LandlordVerification | null>(null);
  const [rejectionReason, setRejectionReason] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [updating, setUpdating] = useState<string | null>(null);

  const handleUpdateVerification = async (landlordId: string, status: 'verified' | 'rejected') => {
    setUpdating(landlordId);
    try {
      await updateVerification(landlordId, status, status === 'rejected' ? rejectionReason : undefined);
      setShowModal(false);
      setRejectionReason('');
    } finally {
      setUpdating(null);
    }
  };

  if (!user || user.role !== 'admin') {
    return (
      <motion.div
        className="p-6 text-red-600 dark:text-red-400 text-center"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        Access denied. Admin role required.
      </motion.div>
    );
  }

  return (
    <div className="flex flex-col p-6 min-h-screen bg-gray-50/50 dark:bg-gray-900/50">
      <motion.h1
        className="text-3xl font-bold bg-gradient-to-r from-[#f58c55] to-[#f47a45] dark:from-[#f7a16b] dark:to-[#f58c55] bg-clip-text text-transparent mb-6"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        Landlord Verification Management
      </motion.h1>

      {loading ? (
        <motion.div
          className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm rounded-xl shadow-lg overflow-x-auto border border-gray-200/50 dark:border-gray-700/50"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-200/50 dark:border-gray-700/50 bg-gray-50/50 dark:bg-gray-700/50">
                <th className="py-3 px-4 text-left text-gray-700 dark:text-gray-200 font-semibold">Full Name</th>
                <th className="py-3 px-4 text-left text-gray-700 dark:text-gray-200 font-semibold">Email</th>
                <th className="py-3 px-4 text-left text-gray-700 dark:text-gray-200 font-semibold">Document Type</th>
                <th className="py-3 px-4 text-left text-gray-700 dark:text-gray-200 font-semibold">Status</th>
                <th className="py-3 px-4 text-left text-gray-700 dark:text-gray-200 font-semibold">Submitted At</th>
                <th className="py-3 px-4 text-left text-gray-700 dark:text-gray-200 font-semibold">Actions</th>
              </tr>
            </thead>
            <tbody>
              {[...Array(5)].map((_, i) => (
                <VerificationSkeleton key={i} />
              ))}
            </tbody>
          </table>
        </motion.div>
      ) : error ? (
        <motion.div
          className="bg-red-50/50 dark:bg-red-900/50 border-l-4 border-red-500 dark:border-red-400 p-4 rounded-xl"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="flex items-center">
            <FaTimesCircle className="text-red-500 dark:text-red-400 text-xl mr-3" />
            <div>
              <h3 className="text-lg font-semibold text-red-800 dark:text-red-200">Error</h3>
              <p className="text-red-600 dark:text-red-300">{error}</p>
              <motion.button
                onClick={() => window.location.reload()}
                className="mt-3 inline-flex items-center px-4 py-2 bg-red-600 dark:bg-red-700 text-white rounded-xl hover:bg-red-700 dark:hover:bg-red-600 transition-all duration-300"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                Retry
              </motion.button>
            </div>
          </div>
        </motion.div>
      ) : (
        <motion.div
          className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm rounded-xl shadow-lg overflow-x-auto border border-gray-200/50 dark:border-gray-700/50"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-200">
                Verification Requests ({verifications.length})
              </h2>
              <div className="flex space-x-3">
                <span className="px-3 py-1 bg-gray-100 dark:bg-gray-700/50 text-gray-700 dark:text-gray-200 text-sm rounded-full font-medium">
                  Total: {verifications.length}
                </span>
                {verifications.some((v) => v.status === 'pending') && (
                  <span className="px-3 py-1 bg-yellow-100 dark:bg-yellow-900/50 text-yellow-800 dark:text-yellow-200 text-sm rounded-full font-medium">
                    Pending: {verifications.filter((v) => v.status === 'pending').length}
                  </span>
                )}
                {verifications.some((v) => v.status === 'verified') && (
                  <span className="px-3 py-1 bg-green-100 dark:bg-green-900/50 text-green-800 dark:text-green-200 text-sm rounded-full font-medium">
                    Verified: {verifications.filter((v) => v.status === 'verified').length}
                  </span>
                )}
              </div>
            </div>
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-200/50 dark:border-gray-700/50 bg-gray-50/50 dark:bg-gray-700/50">
                  <th className="py-3 px-4 text-left text-gray-700 dark:text-gray-200 font-semibold">Full Name</th>
                  <th className="py-3 px-4 text-left text-gray-700 dark:text-gray-200 font-semibold">Email</th>
                  <th className="py-3 px-4 text-left text-gray-700 dark:text-gray-200 font-semibold">Document Type</th>
                  <th className="py-3 px-4 text-left text-gray-700 dark:text-gray-200 font-semibold">Status</th>
                  <th className="py-3 px-4 text-left text-gray-700 dark:text-gray-200 font-semibold">Submitted At</th>
                  <th className="py-3 px-4 text-left text-gray-700 dark:text-gray-200 font-semibold">Actions</th>
                </tr>
              </thead>
              <tbody>
                {verifications.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-8 text-center text-gray-500 dark:text-gray-400">
                      <div className="flex flex-col items-center">
                        <FaCheckCircle className="text-gray-400 dark:text-gray-300 text-4xl mb-3" />
                        <p className="text-lg font-medium text-gray-600 dark:text-gray-200">
                          No verification requests found
                        </p>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          All landlords are verified or no requests are pending.
                        </p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  verifications.map((verification) => (
                    <motion.tr
                      key={verification.landlordId}
                      className="border-b border-gray-200/50 dark:border-gray-700/50 hover:bg-gradient-to-r hover:from-[#f58c55]/5 hover:to-[#f47a45]/5 dark:hover:from-[#f7a16b]/5 dark:hover:to-[#f58c55]/5 transition-all duration-300"
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.3 }}
                    >
                      <td className="py-3 px-4 text-gray-600 dark:text-gray-300">{verification.fullName || 'N/A'}</td>
                      <td className="py-3 px-4 text-gray-600 dark:text-gray-300">{verification.email || 'N/A'}</td>
                      <td className="py-3 px-4 text-gray-600 dark:text-gray-300 capitalize">
                        {verification.documentType ? verification.documentType.replace('_', ' ') : 'N/A'}
                      </td>
                      <td className="py-3 px-4">
                        <span
                          className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
                            verification.status === 'verified'
                              ? 'bg-green-100 dark:bg-green-900/50 text-green-800 dark:text-green-200'
                              : verification.status === 'rejected'
                              ? 'bg-red-100 dark:bg-red-900/50 text-red-800 dark:text-red-200'
                              : verification.status === 'pending'
                              ? 'bg-yellow-100 dark:bg-yellow-900/50 text-yellow-800 dark:text-yellow-200'
                              : 'bg-gray-100 dark:bg-gray-700/50 text-gray-800 dark:text-gray-200'
                          }`}
                        >
                          {verification.status ? verification.status.replace('_', ' ') : 'Unknown'}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-gray-600 dark:text-gray-300">
                        {verification.submittedAt
                          ? new Date(verification.submittedAt).toLocaleDateString()
                          : 'N/A'}
                      </td>
                      <td className="py-3 px-4">
                        <motion.button
                          onClick={() => {
                            setSelectedVerification(verification);
                            setShowModal(true);
                            setRejectionReason('');
                          }}
                          className="text-[#f58c55] dark:text-[#f7a16b] hover:text-[#f47a45] dark:hover:text-[#f58c55] p-1 rounded-full hover:bg-[#f58c55]/10 dark:hover:bg-[#f7a16b]/10 transition-all duration-300"
                          title="View Details"
                          disabled={updating === verification.landlordId}
                          whileHover={{ scale: updating === verification.landlordId ? 1 : 1.1 }}
                          whileTap={{ scale: updating === verification.landlordId ? 1 : 0.9 }}
                        >
                          {updating === verification.landlordId ? (
                            <FaSpinner className="animate-spin text-lg" />
                          ) : (
                            <FaEye className="text-lg" />
                          )}
                        </motion.button>
                      </td>
                    </motion.tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </motion.div>
      )}

      {/* Modal for Verification Details */}
      <AnimatePresence>
        {showModal && selectedVerification && (
          <motion.div
            className="fixed inset-0 bg-black/50 dark:bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            onClick={() => setShowModal(false)}
          >
            <motion.div
              className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm rounded-xl p-6 max-w-lg w-full shadow-2xl border border-gray-200/50 dark:border-gray-700/50"
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              transition={{ duration: 0.3 }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-200">Verification Details</h2>
                <motion.button
                  onClick={() => {
                    setShowModal(false);
                    setRejectionReason('');
                  }}
                  className="text-gray-500 dark:text-gray-300 hover:text-gray-700 dark:hover:text-gray-200"
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                >
                  <FaTimesCircle className="text-xl" />
                </motion.button>
              </div>
              <div className="space-y-3 text-gray-600 dark:text-gray-300 text-sm">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  <div>
                    <span className="font-medium">Full Name:</span> {selectedVerification.fullName || 'N/A'}
                  </div>
                  <div>
                    <span className="font-medium">Email:</span> {selectedVerification.email || 'N/A'}
                  </div>
                  <div>
                    <span className="font-medium">Home Address:</span> {selectedVerification.homeAddress || 'N/A'}
                  </div>
                  <div>
                    <span className="font-medium">Phone Number:</span> {selectedVerification.phoneNumber || 'N/A'}
                  </div>
                  {selectedVerification.phoneNumber2 && (
                    <div>
                      <span className="font-medium">Secondary Phone:</span> {selectedVerification.phoneNumber2}
                    </div>
                  )}
                  <div>
                    <span className="font-medium">Document Type:</span>{' '}
                    {selectedVerification.documentType
                      ? selectedVerification.documentType.replace('_', ' ')
                      : 'N/A'}
                  </div>
                  <div>
                    <span className="font-medium">Document Number:</span> {selectedVerification.documentNumber || 'N/A'}
                  </div>
                  <div>
                    <span className="font-medium">Submitted:</span>{' '}
                    {selectedVerification.submittedAt
                      ? new Date(selectedVerification.submittedAt).toLocaleString()
                      : 'N/A'}
                  </div>
                </div>
                <div>
                  <span className="font-medium">Photo:</span>{' '}
                  {selectedVerification.photoUrl ? (
                    <a
                      href={selectedVerification.photoUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-[#f58c55] dark:text-[#f7a16b] hover:underline"
                    >
                      View Photo
                    </a>
                  ) : (
                    'N/A'
                  )}
                </div>
                {selectedVerification.rejectionReason && (
                  <div>
                    <span className="font-medium">Rejection Reason:</span>{' '}
                    <span className="text-red-600 dark:text-red-400">{selectedVerification.rejectionReason}</span>
                  </div>
                )}
              </div>

              {selectedVerification.status === 'pending' && (
                <div className="mt-6 border-t border-gray-200/50 dark:border-gray-700/50 pt-4">
                  <label className="block text-gray-700 dark:text-gray-300 font-medium mb-2">
                    Rejection Reason (if rejecting):
                  </label>
                  <textarea
                    value={rejectionReason}
                    onChange={(e) => setRejectionReason(e.target.value)}
                    className="w-full p-3 bg-white/50 dark:bg-gray-700/50 backdrop-blur-sm border rounded-xl focus:outline-none focus:ring-2 focus:ring-[#f58c55]/50 dark:focus:ring-[#f7a16b]/50 transition-all duration-300 text-gray-900 dark:text-gray-200 placeholder-gray-500 dark:placeholder-gray-400 border-gray-200/50 dark:border-gray-600/50"
                    placeholder="Enter reason for rejection (optional)"
                    rows={4}
                  />
                  <div className="flex justify-end space-x-3 mt-4">
                    <motion.button
                      onClick={() => handleUpdateVerification(selectedVerification.landlordId, 'verified')}
                      disabled={updating === selectedVerification.landlordId}
                      className="flex items-center px-4 py-2 bg-gradient-to-r from-[#f58c55] to-[#f47a45] dark:from-[#f7a16b] dark:to-[#f58c55] text-white rounded-xl hover:from-[#f47a45] hover:to-[#f58c55] dark:hover:from-[#f58c55] dark:hover:to-[#f7a16b] transition-all duration-300 disabled:bg-gray-400 disabled:cursor-not-allowed"
                      whileHover={{ scale: updating === selectedVerification.landlordId ? 1 : 1.05 }}
                      whileTap={{ scale: updating === selectedVerification.landlordId ? 1 : 0.95 }}
                    >
                      {updating === selectedVerification.landlordId && status === 'verified' ? (
                        <FaSpinner className="animate-spin mr-2" />
                      ) : (
                        <FaCheckCircle className="mr-2" />
                      )}
                      Approve
                    </motion.button>
                    <motion.button
                      onClick={() => handleUpdateVerification(selectedVerification.landlordId, 'rejected')}
                      disabled={updating === selectedVerification.landlordId || rejectionReason.trim() === ''}
                      className="flex items-center px-4 py-2 bg-red-600 dark:bg-red-700 text-white rounded-xl hover:bg-red-700 dark:hover:bg-red-600 transition-all duration-300 disabled:bg-gray-400 disabled:cursor-not-allowed"
                      whileHover={{ scale: updating === selectedVerification.landlordId || rejectionReason.trim() === '' ? 1 : 1.05 }}
                      whileTap={{ scale: updating === selectedVerification.landlordId || rejectionReason.trim() === '' ? 1 : 0.95 }}
                    >
                      {updating === selectedVerification.landlordId && status === 'rejected' ? (
                        <FaSpinner className="animate-spin mr-2" />
                      ) : (
                        <FaTimesCircle className="mr-2" />
                      )}
                      Reject
                    </motion.button>
                    <motion.button
                      onClick={() => {
                        setShowModal(false);
                        setRejectionReason('');
                      }}
                      className="px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 rounded-xl hover:bg-gray-300 dark:hover:bg-gray-600 transition-all duration-300"
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      Close
                    </motion.button>
                  </div>
                </div>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default LandlordVerificationAdmin;