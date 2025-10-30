import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { FaFileUpload, FaCheckCircle } from 'react-icons/fa';
import { useAuth } from '@/hooks/useAuth';
import { useRouter } from 'next/navigation';
import Header from '../Header';

const PropertyVerification = () => {
  const { user } = useAuth();
  const router = useRouter();
  const [files, setFiles] = useState<File[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [propertyId, setPropertyId] = useState('');

  // if (!user || user.role !== 'landlord') {
  //   router.push('/landlord/login');
  //   return null;
  // }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setFiles(Array.from(e.target.files));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const formData = new FormData();
      files.forEach((file) => formData.append('documents', file));
      formData.append('propertyId', propertyId);

      const response = await fetch('/api/landlord/verify-property', {
        method: 'POST',
        body: formData,
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to submit verification documents');
      }

      router.push('/landlord/dashboard');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 font-sans">
      <Header />
      <motion.div
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="container mx-auto px-6 py-16 flex justify-center"
      >
        <div className="w-full max-w-md bg-white p-8 rounded-lg shadow-lg">
          <h2 className="text-2xl font-bold text-gray-800 mb-6 text-center">Verify Your Property</h2>
          {error && <p className="text-red-500 mb-4 text-center">{error}</p>}
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-gray-700 mb-2">Property ID</label>
              <input
                type="text"
                value={propertyId}
                onChange={(e) => setPropertyId(e.target.value)}
                placeholder="Enter Property ID"
                className="w-full p-3 border rounded focus:outline-none focus:ring-2 focus:ring-orange-500"
                required
              />
            </div>
            <div>
              <label className="block text-gray-700 mb-2">Upload Documents</label>
              <div className="relative">
                <FaFileUpload className="absolute top-3 left-3 text-green-600" />
                <input
                  type="file"
                  multiple
                  onChange={handleFileChange}
                  className="w-full pl-10 p-3 border rounded focus:outline-none focus:ring-2 focus:ring-orange-500"
                />
              </div>
            </div>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              type="submit"
              disabled={loading || !files.length || !propertyId}
              className="w-full py-3 bg-orange-500 text-white rounded-full font-semibold shadow-lg disabled:opacity-50"
            >
              {loading ? 'Submitting...' : 'Submit for Verification'}
            </motion.button>
          </form>
        </div>
      </motion.div>
    </div>
  );
};

export default PropertyVerification;