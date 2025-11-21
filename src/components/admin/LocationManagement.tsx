'use client';

import { useState, useEffect } from 'react';
import { useInternet } from '@/hooks/useInternet';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FaMapMarkerAlt,
  FaPlus,
  FaEdit,
  FaTrash,
  FaSpinner,
  FaChevronLeft,
  FaChevronRight,
  FaSearch,
} from 'react-icons/fa';

interface LocationFormData {
  name: string;
  type: 'lodge' | 'hotel' | 'resort' | '';
  address: string;
}

interface FormErrors {
  [key: string]: string | undefined;
  general?: string;
}

const LocationManagement = () => {
  const {
    loading,
    error,
    createLocation,
    getLocations,
    updateLocation,
    deleteLocation,
    setError,
  } = useInternet();

  const [locations, setLocations] = useState<any[]>([]);
  const [locationsLoading, setLocationsLoading] = useState(true);
  const [editingLocation, setEditingLocation] = useState<string | null>(null);
  const [locationForm, setLocationForm] = useState<LocationFormData>({ name: '', type: '', address: '' });
  const [locationErrors, setLocationErrors] = useState<FormErrors>({});
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<string | null>(null);

  // Pagination & Filtering State
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<'all' | 'lodge' | 'hotel' | 'resort'>('all');

  useEffect(() => {
    const loadData = async () => {
      try {
        setLocationsLoading(true);
        const locRes = await getLocations();
        setLocations(locRes?.data || []);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load locations');
      } finally {
        setLocationsLoading(false);
      }
    };
    loadData();
  }, [getLocations, setError]);

  // Reset page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, filterType, itemsPerPage]);

  // Filtering
  const filteredLocations = locations.filter((loc) => {
    const matchesSearch =
      loc.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      loc.address.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesType = filterType === 'all' || loc.type === filterType;

    return matchesSearch && matchesType;
  });

  // Pagination
  const totalPages = Math.ceil(filteredLocations.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentLocations = filteredLocations.slice(startIndex, endIndex);

  const validateLocation = (): boolean => {
    const errors: FormErrors = {};
    if (!locationForm.name.trim()) errors.name = 'Location name is required';
    if (!locationForm.type) errors.type = 'Location type is required';
    if (!locationForm.address.trim()) errors.address = 'Address is required';
    setLocationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleLocationSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateLocation()) return;

    try {
      if (editingLocation) {
        await updateLocation(editingLocation, locationForm);
      } else {
        await createLocation(locationForm);
      }
      const res = await getLocations();
      setLocations(res?.data || []);
      resetLocationForm();
    } catch (err) {
      setLocationErrors({ general: err instanceof Error ? err.message : 'Failed to save location' });
    }
  };

  const resetLocationForm = () => {
    setLocationForm({ name: '', type: '', address: '' });
    setEditingLocation(null);
    setLocationErrors({});
  };

  const handleEditLocation = (location: any) => {
    setEditingLocation(location._id);
    setLocationForm({
      name: location.name,
      type: location.type,
      address: location.address,
    });
  };

  const handleDelete = (id: string) => {
    setItemToDelete(id);
    setShowDeleteModal(true);
  };

  const confirmDelete = async () => {
    try {
      if (itemToDelete) {
        await deleteLocation(itemToDelete);
        const res = await getLocations();
        setLocations(res?.data || []);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete location');
    }
    setShowDeleteModal(false);
    setItemToDelete(null);
  };

  // Pagination helpers
  const goToPage = (page: number) => setCurrentPage(page);
  const goToPrevPage = () => currentPage > 1 && setCurrentPage(currentPage - 1);
  const goToNextPage = () => currentPage < totalPages && setCurrentPage(currentPage + 1);

  return (
    <div className="min-h-screen bg-gray-50/50 dark:bg-gray-900/50 p-6">
      <motion.div
        className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm rounded-xl shadow-lg p-8 border border-gray-200/50 dark:border-gray-700/50"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-semibold bg-gradient-to-r from-[#f58c55] to-[#f47a45] dark:from-[#f7a16b] dark:to-[#f58c55] bg-clip-text text-transparent flex items-center space-x-2">
            <FaMapMarkerAlt />
            <span>{editingLocation ? 'Edit Location' : 'Manage Locations'}</span>
          </h2>
          {!editingLocation && (
            <motion.button
              onClick={resetLocationForm}
              className="bg-gradient-to-r from-[#f58c55] to-[#f47a45] dark:from-[#f7a16b] dark:to-[#f58c55] text-white px-4 py-2 rounded-xl hover:from-[#f47a45] hover:to-[#f58c55] dark:hover:from-[#f58c55] dark:hover:to-[#f7a16b] transition-all duration-300 flex items-center space-x-2"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <FaPlus />
              <span>Add New</span>
            </motion.button>
          )}
        </div>

        {error && (
          <motion.div
            className="bg-red-50/50 dark:bg-red-900/50 border-l-4 border-red-500 dark:border-red-400 p-4 rounded-xl mb-6"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <div className="flex items-center">
              <FaTrash className="text-red-500 dark:text-red-400 text-xl mr-3" />
              <p className="text-red-600 dark:text-red-300">{error}</p>
            </div>
          </motion.div>
        )}

        {/* Form – unchanged */}
        <form onSubmit={handleLocationSubmit} className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Name</label>
            <input
              type="text"
              value={locationForm.name}
              onChange={(e) => setLocationForm({ ...locationForm, name: e.target.value })}
              className={`w-full p-3 bg-white/50 dark:bg-gray-700/50 backdrop-blur-sm border rounded-xl focus:outline-none focus:ring-2 focus:ring-[#f58c55]/50 dark:focus:ring-[#f7a16b]/50 transition-all duration-300 text-gray-900 dark:text-gray-200 placeholder-gray-500 dark:placeholder-gray-400 ${
                locationErrors?.name ? 'border-red-500 dark:border-red-400' : 'border-gray-200/50 dark:border-gray-600/50'
              }`}
              placeholder="e.g., Sunset Lodge"
            />
            {locationErrors?.name && <p className="text-red-500 dark:text-red-400 text-sm mt-1">{locationErrors.name}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Type</label>
            <select
              value={locationForm.type}
              onChange={(e) => setLocationForm({ ...locationForm, type: e.target.value as any })}
              className={`w-full p-3 bg-white/50 dark:bg-gray-700/50 backdrop-blur-sm border rounded-xl focus:outline-none focus:ring-2 focus:ring-[#f58c55]/50 dark:focus:ring-[#f7a16b]/50 transition-all duration-300 text-gray-900 dark:text-gray-200 ${
                locationErrors?.type ? 'border-red-500 dark:border-red-400' : 'border-gray-200/50 dark:border-gray-600/50'
              }`}
            >
              <option value="">Select type</option>
              <option value="lodge">Lodge</option>
              <option value="hotel">Hotel</option>
              <option value="resort">Resort</option>
            </select>
            {locationErrors?.type && <p className="text-red-500 dark:text-red-400 text-sm mt-1">{locationErrors.type}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Address</label>
            <input
              type="text"
              value={locationForm.address}
              onChange={(e) => setLocationForm({ ...locationForm, address: e.target.value })}
              className={`w-full p-3 bg-white/50 dark:bg-gray-700/50 backdrop-blur-sm border rounded-xl focus:outline-none focus:ring-2 focus:ring-[#f58c55]/50 dark:focus:ring-[#f7a16b]/50 transition-all duration-300 text-gray-900 dark:text-gray-200 placeholder-gray-500 dark:placeholder-gray-400 ${
                locationErrors?.address ? 'border-red-500 dark:border-red-400' : 'border-gray-200/50 dark:border-gray-600/50'
              }`}
              placeholder="123 Main St, Lagos"
            />
            {locationErrors?.address && <p className="text-red-500 dark:text-red-400 text-sm mt-1">{locationErrors.address}</p>}
          </div>

          {locationErrors?.general && (
            <div className="md:col-span-3">
              <p className="text-red-500 dark:text-red-400">{locationErrors.general}</p>
            </div>
          )}

          <div className="md:col-span-3 flex space-x-4">
            <motion.button
              type="submit"
              disabled={loading}
              className="flex-1 p-4 bg-gradient-to-r from-[#f58c55] to-[#f47a45] dark:from-[#f7a16b] dark:to-[#f58c55] text-white rounded-xl font-medium disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
              whileHover={{ scale: loading ? 1 : 1.05 }}
              whileTap={{ scale: loading ? 1 : 0.95 }}
            >
              {loading ? <FaSpinner className="animate-spin" /> : <>{editingLocation ? 'Update' : 'Create'} Location</>}
            </motion.button>
            {editingLocation && (
              <motion.button
                type="button"
                onClick={resetLocationForm}
                className="flex-1 p-4 bg-gray-300 dark:bg-gray-700 text-gray-800 dark:text-gray-200 rounded-xl font-medium"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                Cancel
              </motion.button>
            )}
          </div>
        </form>

        {/* Table Header with Filters */}
        <div className="overflow-x-auto">
          <div className="bg-gray-50/50 dark:bg-gray-700/50 px-4 py-3 rounded-t-xl border-b">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
              <div>
                <h3 className="text-lg font-semibold text-gray-700 dark:text-gray-200">Location List</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Showing {currentLocations.length} of {filteredLocations.length} locations
                  {filterType !== 'all' && ` (filtered by ${filterType})`}
                </p>
              </div>

              <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
                {/* Search */}
                <div className="relative">
                  <input
                    type="text"
                    placeholder="Search name or address..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-[#f58c55]/50 w-full sm:w-64"
                  />
                  <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                </div>

                {/* Type Filter */}
                <select
                  value={filterType}
                  onChange={(e) => setFilterType(e.target.value as any)}
                  className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-[#f58c55]/50"
                >
                  <option value="all">All Types</option>
                  <option value="lodge">Lodge</option>
                  <option value="hotel">Hotel</option>
                  <option value="resort">Resort</option>
                </select>

                {/* Items per page */}
                <select
                  value={itemsPerPage}
                  onChange={(e) => setItemsPerPage(Number(e.target.value))}
                  className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-[#f58c55]/50"
                >
                  <option value={10}>10 per page</option>
                  <option value={25}>25 per page</option>
                  <option value={50}>50 per page</option>
                  <option value={100}>100 per page</option>
                </select>
              </div>
            </div>
          </div>

          <table className="w-full text-sm">
            <thead className="bg-gray-50/50 dark:bg-gray-700/50">
              <tr>
                <th className="py-3 px-4 text-left font-semibold">Name</th>
                <th className="py-3 px-4 text-left font-semibold">Type</th>
                <th className="py-3 px-4 text-left font-semibold">Address</th>
                <th className="py-3 px-4 text-left font-semibold">Created</th>
                <th className="py-3 px-4 text-right font-semibold">Actions</th>
              </tr>
            </thead>
            <tbody>
              {locationsLoading && (
                <tr>
                  <td colSpan={5} className="text-center py-12">
                    <FaSpinner className="animate-spin mx-auto text-4xl text-[#f58c55]" />
                    <p className="mt-4 text-gray-500">Loading locations...</p>
                  </td>
                </tr>
              )}

              {!locationsLoading && currentLocations.length === 0 && (
                <tr>
                  <td colSpan={5} className="text-center py-12 text-gray-500">
                    <FaMapMarkerAlt className="mx-auto text-6xl mb-4 text-gray-400" />
                    <p className="text-lg">No locations found</p>
                    <p className="text-sm">Try adjusting your filters or add a new location</p>
                  </td>
                </tr>
              )}

              {currentLocations.map((location) => (
                <motion.tr
                  key={location._id}
                  className="border-b hover:bg-orange-50/50 dark:hover:bg-orange-900/20"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                >
                  <td className="py-4 px-4 font-medium">{location.name}</td>
                  <td className="py-4 px-4">
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                      location.type === 'lodge' ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/50 dark:text-blue-200' :
                      location.type === 'hotel' ? 'bg-purple-100 text-purple-800 dark:bg-purple-900/50 dark:text-purple-200' :
                      'bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-200'
                    }`}>
                      {location.type.charAt(0).toUpperCase() + location.type.slice(1)}
                    </span>
                  </td>
                  <td className="py-4 px-4 text-gray-600 dark:text-gray-300">{location.address}</td>
                  <td className="py-4 px-4 text-sm text-gray-600">
                    {new Date(location.createdAt).toLocaleDateString()}
                  </td>
                  <td className="py-4 px-4 text-right space-x-2">
                    <motion.button
                      onClick={() => handleEditLocation(location)}
                      className="text-orange-600 hover:text-orange-800 p-2"
                      whileHover={{ scale: 1.2 }}
                      title="Edit"
                    >
                      <FaEdit />
                    </motion.button>
                    <motion.button
                      onClick={() => handleDelete(location._id)}
                      className="text-red-600 hover:text-red-800 p-2"
                      whileHover={{ scale: 1.2 }}
                      title="Delete"
                    >
                      <FaTrash />
                    </motion.button>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>

          {/* Pagination Controls */}
          {totalPages > 1 && (
            <div className="bg-gray-50/50 dark:bg-gray-700/50 px-4 py-3 rounded-b-xl border-t">
              <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
                <div className="text-sm text-gray-600 dark:text-gray-400">
                  Showing {startIndex + 1} to {Math.min(endIndex, filteredLocations.length)} of {filteredLocations.length} entries
                </div>

                <div className="flex items-center space-x-2">
                  <motion.button
                    onClick={goToPrevPage}
                    disabled={currentPage === 1}
                    className="p-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
                    whileHover={{ scale: currentPage === 1 ? 1 : 1.05 }}
                    whileTap={{ scale: currentPage === 1 ? 1 : 0.95 }}
                  >
                    <FaChevronLeft className="text-gray-600 dark:text-gray-400" />
                  </motion.button>

                  <div className="flex space-x-1">
                    {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                      let pageNum;
                      if (totalPages <= 5) pageNum = i + 1;
                      else if (currentPage <= 3) pageNum = i + 1;
                      else if (currentPage >= totalPages - 2) pageNum = totalPages - 4 + i;
                      else pageNum = currentPage - 2 + i;

                      return (
                        <motion.button
                          key={pageNum}
                          onClick={() => goToPage(pageNum)}
                          className={`px-3 py-1 rounded-lg text-sm font-medium ${
                            currentPage === pageNum
                              ? 'bg-[#f58c55] text-white'
                              : 'bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-600'
                          }`}
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                        >
                          {pageNum}
                        </motion.button>
                      );
                    })}
                  </div>

                  <motion.button
                    onClick={goToNextPage}
                    disabled={currentPage === totalPages}
                    className="p-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
                    whileHover={{ scale: currentPage === totalPages ? 1 : 1.05 }}
                    whileTap={{ scale: currentPage === totalPages ? 1 : 0.95 }}
                  >
                    <FaChevronRight className="text-gray-600 dark:text-gray-400" />
                  </motion.button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Delete Modal – unchanged */}
        <AnimatePresence>
          {showDeleteModal && (
            <motion.div
              className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowDeleteModal(false)}
            >
              <motion.div
                className="bg-white dark:bg-gray-800 rounded-xl p-6 max-w-md w-full shadow-2xl"
                initial={{ scale: 0.8 }}
                animate={{ scale: 1 }}
                exit={{ scale: 0.8 }}
                onClick={(e) => e.stopPropagation()}
              >
                <h3 className="text-xl font-bold text-red-600 dark:text-red-400 mb-4 flex items-center gap-2">
                  <FaTrash /> Confirm Delete
                </h3>
                <p className="text-gray-700 dark:text-gray-300 mb-6">
                  Are you sure you want to delete this location? This action cannot be undone.
                </p>
                <div className="flex justify-end gap-3">
                  <button
                    onClick={() => setShowDeleteModal(false)}
                    className="px-6 py-2 bg-gray-300 dark:bg-gray-700 rounded-lg hover:bg-gray-400 dark:hover:bg-gray-600"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={confirmDelete}
                    className="px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
                  >
                    Delete Location
                  </button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
};

export default LocationManagement;