'use client';

import { useState, useEffect } from 'react';
import { useInternet } from '@/hooks/useInternet';
import { motion, AnimatePresence } from 'framer-motion';
import { FaMapMarkerAlt, FaPlus, FaEdit, FaTrash, FaSpinner } from 'react-icons/fa';

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
              onClick={() => resetLocationForm()}
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
            transition={{ duration: 0.5 }}
          >
            <div className="flex items-center">
              <FaTrash className="text-red-500 dark:text-red-400 text-xl mr-3" />
              <p className="text-red-600 dark:text-red-300">{error}</p>
            </div>
          </motion.div>
        )}

        <form onSubmit={handleLocationSubmit} className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Name</label>
            <input
              type="text"
              value={locationForm.name}
              onChange={(e) => setLocationForm({ ...locationForm, name: e.target.value })}
              className={`w-full p-3 bg-white/50 dark:bg-gray-700/50 backdrop-blur-sm border rounded-xl focus:outline-none focus:ring-2 focus:ring-[#f58c55]/50 dark:focus:ring-[#f7a16b]/50 transition-all duration-300 text-gray-900 dark:text-gray-200 placeholder-gray-500 dark:placeholder-gray-400 ${locationErrors?.name ? 'border-red-500 dark:border-red-400' : 'border-gray-200/50 dark:border-gray-600/50'}`}
              placeholder="e.g., Sunset Lodge"
            />
            {locationErrors?.name && <p className="text-red-500 dark:text-red-400 text-sm mt-1">{locationErrors.name}</p>}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Type</label>
            <select
              value={locationForm.type}
              onChange={(e) => setLocationForm({ ...locationForm, type: e.target.value as any })}
              className={`w-full p-3 bg-white/50 dark:bg-gray-700/50 backdrop-blur-sm border rounded-xl focus:outline-none focus:ring-2 focus:ring-[#f58c55]/50 dark:focus:ring-[#f7a16b]/50 transition-all duration-300 text-gray-900 dark:text-gray-200 ${locationErrors?.type ? 'border-red-500 dark:border-red-400' : 'border-gray-200/50 dark:border-gray-600/50'}`}
            >
              <option value="" className="text-gray-900 dark:text-gray-200">Select type</option>
              <option value="lodge" className="text-gray-900 dark:text-gray-200">Lodge</option>
              <option value="hotel" className="text-gray-900 dark:text-gray-200">Hotel</option>
              <option value="resort" className="text-gray-900 dark:text-gray-200">Resort</option>
            </select>
            {locationErrors?.type && <p className="text-red-500 dark:text-red-400 text-sm mt-1">{locationErrors.type}</p>}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Address</label>
            <input
              type="text"
              value={locationForm.address}
              onChange={(e) => setLocationForm({ ...locationForm, address: e.target.value })}
              className={`w-full p-3 bg-white/50 dark:bg-gray-700/50 backdrop-blur-sm border rounded-xl focus:outline-none focus:ring-2 focus:ring-[#f58c55]/50 dark:focus:ring-[#f7a16b]/50 transition-all duration-300 text-gray-900 dark:text-gray-200 placeholder-gray-500 dark:placeholder-gray-400 ${locationErrors?.address ? 'border-red-500 dark:border-red-400' : 'border-gray-200/50 dark:border-gray-600/50'}`}
              placeholder="123 Main St, Lagos"
            />
            {locationErrors?.address && <p className="text-red-500 dark:text-red-400 text-sm mt-1">{locationErrors.address}</p>}
          </div>
          {locationErrors?.general && (
            <p className="md:col-span-3 text-red-500 dark:text-red-400">{locationErrors.general}</p>
          )}
          <div className="md:col-span-3 flex space-x-4">
            <motion.button
              type="submit"
              className={`flex-1 p-3 bg-gradient-to-r from-[#f58c55] to-[#f47a45] dark:from-[#f7a16b] dark:to-[#f58c55] text-white rounded-xl hover:from-[#f47a45] hover:to-[#f58c55] dark:hover:from-[#f58c55] dark:hover:to-[#f7a16b] transition-all duration-300 disabled:bg-gray-400 disabled:cursor-not-allowed`}
              whileHover={{ scale: loading ? 1 : 1.05 }}
              whileTap={{ scale: loading ? 1 : 0.95 }}
              disabled={loading}
            >
              {loading ? <FaSpinner className="animate-spin mx-auto" /> : <>{editingLocation ? 'Update' : 'Create'} Location</>}
            </motion.button>
            {editingLocation && (
              <motion.button
                type="button"
                onClick={resetLocationForm}
                className="flex-1 p-3 bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 rounded-xl hover:bg-gray-300 dark:hover:bg-gray-600 transition-all duration-300"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                Cancel
              </motion.button>
            )}
          </div>
        </form>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-200/50 dark:border-gray-700/50 bg-gray-50/50 dark:bg-gray-700/50">
                <th className="py-3 px-4 text-left text-gray-700 dark:text-gray-200 font-semibold">Name</th>
                <th className="py-3 px-4 text-left text-gray-700 dark:text-gray-200 font-semibold">Type</th>
                <th className="py-3 px-4 text-left text-gray-700 dark:text-gray-200 font-semibold">Address</th>
                <th className="py-3 px-4 text-left text-gray-700 dark:text-gray-200 font-semibold">Created</th>
                <th className="py-3 px-4 text-left text-gray-700 dark:text-gray-200 font-semibold">Actions</th>
              </tr>
            </thead>
            <tbody>
              {locations.length === 0 && !locationsLoading && (
                <tr>
                  <td colSpan={5} className="py-8 text-center text-gray-500 dark:text-gray-400">
                    <div className="flex flex-col items-center">
                      <FaMapMarkerAlt className="text-gray-400 dark:text-gray-300 text-4xl mb-3" />
                      <p className="text-lg font-medium text-gray-600 dark:text-gray-200">No locations found</p>
                      <p className="text-sm text-gray-500 dark:text-gray-400">Add a new location to get started.</p>
                    </div>
                  </td>
                </tr>
              )}
              {locations.map((location) => (
                <motion.tr
                  key={location._id}
                  className="border-b border-gray-200/50 dark:border-gray-700/50 hover:bg-gradient-to-r hover:from-[#f58c55]/5 hover:to-[#f47a45]/5 dark:hover:from-[#f7a16b]/5 dark:hover:to-[#f58c55]/5 transition-all duration-300"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3 }}
                >
                  <td className="py-3 px-4 font-medium text-gray-800 dark:text-gray-200">{location.name}</td>
                  <td className="py-3 px-4">
                    <span className="px-2 py-1 bg-[#f58c55]/10 dark:bg-[#f7a16b]/10 text-[#f58c55] dark:text-[#f7a16b] rounded-full text-sm">
                      {location.type}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-gray-600 dark:text-gray-300">{location.address}</td>
                  <td className="py-3 px-4 text-gray-600 dark:text-gray-300">
                    {new Date(location.createdAt).toLocaleDateString()}
                  </td>
                  <td className="py-3 px-4 flex space-x-2">
                    <motion.button
                      onClick={() => handleEditLocation(location)}
                      className="text-[#f58c55] dark:text-[#f7a16b] hover:text-[#f47a45] dark:hover:text-[#f58c55] hover:bg-[#f58c55]/10 dark:hover:bg-[#f7a16b]/10 rounded-full p-1 transition-all duration-300"
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                    >
                      <FaEdit />
                    </motion.button>
                    <motion.button
                      onClick={() => handleDelete(location._id)}
                      className="text-red-600 dark:text-red-400 hover:text-red-800 dark:hover:text-red-300 hover:bg-red-600/10 dark:hover:bg-red-400/10 rounded-full p-1 transition-all duration-300"
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                    >
                      <FaTrash />
                    </motion.button>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
          {locationsLoading && (
            <div className="text-center py-4">
              <FaSpinner className="animate-spin mx-auto text-[#f58c55] dark:text-[#f7a16b]" />
            </div>
          )}
        </div>

        <AnimatePresence>
          {showDeleteModal && (
            <motion.div
              className="fixed inset-0 bg-black/50 dark:bg-black/60 backdrop-blur-sm flex items-center justify-center z-50"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
            >
              <motion.div
                className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm rounded-xl p-6 max-w-md w-full mx-4 shadow-2xl border border-gray-200/50 dark:border-gray-700/50"
                initial={{ scale: 0.7, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.7, opacity: 0 }}
                transition={{ duration: 0.3 }}
              >
                <h3 className="text-xl font-semibold text-gray-800 dark:text-gray-200 mb-4">Confirm Delete</h3>
                <p className="text-gray-600 dark:text-gray-300 mb-6">
                  Are you sure you want to delete this location? This action cannot be undone.
                </p>
                <div className="flex justify-end space-x-3">
                  <motion.button
                    onClick={() => setShowDeleteModal(false)}
                    className="px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 rounded-xl hover:bg-gray-300 dark:hover:bg-gray-600 transition-all duration-300"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    Cancel
                  </motion.button>
                  <motion.button
                    onClick={confirmDelete}
                    className="px-4 py-2 bg-red-600 dark:bg-red-700 text-white rounded-xl hover:bg-red-700 dark:hover:bg-red-600 transition-all duration-300"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    Delete
                  </motion.button>
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