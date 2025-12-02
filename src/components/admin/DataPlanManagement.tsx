'use client';

import { useState, useEffect } from 'react';
import { useInternet } from '@/hooks/useInternet';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FaWifi,
  FaPlus,
  FaEdit,
  FaTrash,
  FaSpinner,
  FaTimesCircle,
  FaChevronLeft,
  FaChevronRight,
  FaSearch,
} from 'react-icons/fa';

interface DataPlanFormData {
  dataAmount: number;
  duration: number;
  location: string;
  bundle: string;
  price: number;
}

interface FormErrors {
  [key: string]: string | undefined;
  general?: string;
}

const DataPlanManagement = () => {
  const {
    loading,
    error,
    createDataPlan,
    getDataPlans,
    getLocations,
    updateDataPlan,
    deleteDataPlan,
    setError,
  } = useInternet();

  const [dataPlans, setDataPlans] = useState<any[]>([]);
  const [locations, setLocations] = useState<any[]>([]);
  const [plansLoading, setPlansLoading] = useState(true);
  const [editingPlan, setEditingPlan] = useState<string | null>(null);
  const [planForm, setPlanForm] = useState<DataPlanFormData>({
    dataAmount: 0,
    duration: 0,
    location: '',
    bundle: '',
    price: 0,
  });
  const [planErrors, setPlanErrors] = useState<FormErrors>({});
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<string | null>(null);

  // Pagination & filtering state
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterLocation, setFilterLocation] = useState('all');

  useEffect(() => {
    const loadData = async () => {
      try {
        setPlansLoading(true);
        const [planRes, locRes] = await Promise.all([getDataPlans(), getLocations()]);
        setDataPlans(planRes?.data || []);
        setLocations(locRes?.data || []);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load data');
      } finally {
        setPlansLoading(false);
      }
    };
    loadData();
  }, [getDataPlans, getLocations, setError]);

  // Reset to first page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, filterLocation, itemsPerPage]);

  // Filtering logic
  const filteredPlans = dataPlans.filter((plan) => {
    const matchesSearch =
      plan.bundle.toLowerCase().includes(searchTerm.toLowerCase()) ||
      plan.dataAmount.toString().includes(searchTerm) ||
      plan.duration.toString().includes(searchTerm) ||
      plan.price.toString().includes(searchTerm);

    const matchesLocation =
      filterLocation === 'all' || plan.location?._id === filterLocation;

    return matchesSearch && matchesLocation;
  });

  // Pagination calculations
  const totalPages = Math.ceil(filteredPlans.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentPlans = filteredPlans.slice(startIndex, endIndex);

  const validatePlan = (): boolean => {
    const errors: FormErrors = {};
    if (planForm.dataAmount <= 0) errors.dataAmount = 'Data amount must be greater than 0';
    if (planForm.duration <= 0) errors.duration = 'Duration must be greater than 0';
    if (!planForm.location) errors.location = 'Location is required';
    if (!planForm.bundle.trim()) errors.bundle = 'Bundle name is required';
    if (planForm.price <= 0) errors.price = 'Price must be greater than 0';
    setPlanErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handlePlanSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validatePlan()) return;

    try {
      if (editingPlan) {
        await updateDataPlan(editingPlan, planForm);
      } else {
        await createDataPlan(planForm);
      }
      const res = await getDataPlans();
      setDataPlans(res?.data || []);
      resetPlanForm();
    } catch (err) {
      setPlanErrors({ general: err instanceof Error ? err.message : 'Failed to save data plan' });
    }
  };

  const resetPlanForm = () => {
    setPlanForm({ dataAmount: 0, duration: 0, location: '', bundle: '', price: 0 });
    setEditingPlan(null);
    setPlanErrors({});
  };

  const handleEditPlan = (plan: any) => {
    if (!plan.location) {
      setPlanErrors({ general: 'Cannot edit plan: Location data is missing' });
      return;
    }
    setEditingPlan(plan._id);
    setPlanForm({
      dataAmount: plan.dataAmount,
      duration: plan.duration,
      location: plan.location._id,
      bundle: plan.bundle,
      price: plan.price,
    });
  };

  const handleDelete = (id: string) => {
    setItemToDelete(id);
    setShowDeleteModal(true);
  };

  const confirmDelete = async () => {
    try {
      if (itemToDelete) {
        await deleteDataPlan(itemToDelete);
        const res = await getDataPlans();
        setDataPlans(res?.data || []);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete data plan');
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
            <FaWifi />
            <span>{editingPlan ? 'Edit Data Plan' : 'Manage Data Plans'}</span>
          </h2>
          {!editingPlan && (
            <motion.button
              onClick={resetPlanForm}
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
              <FaTimesCircle className="text-red-500 dark:text-red-400 text-xl mr-3" />
              <p className="text-red-600 dark:text-red-300">{error}</p>
            </div>
          </motion.div>
        )}

        {/* Form – unchanged */}
        <form onSubmit={handlePlanSubmit} className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {/* ... (all your existing form fields remain exactly the same) ... */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Data Amount (GB)</label>
            <input
              type="number"
              value={planForm.dataAmount}
              onChange={(e) => setPlanForm({ ...planForm, dataAmount: parseInt(e.target.value) || 0 })}
              className={`w-full p-3 bg-white/50 dark:bg-gray-700/50 backdrop-blur-sm border rounded-xl focus:outline-none focus:ring-2 focus:ring-[#f58c55]/50 dark:focus:ring-[#f7a16b]/50 transition-all duration-300 text-gray-900 dark:text-gray-200 placeholder-gray-500 dark:placeholder-gray-400 ${planErrors?.dataAmount ? 'border-red-500 dark:border-red-400' : 'border-gray-200/50 dark:border-gray-600/50'}`}
              placeholder="e.g., 1000"
            />
            {planErrors?.dataAmount && <p className="text-red-500 dark:text-red-400 text-sm mt-1">{planErrors.dataAmount}</p>}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Duration (days)</label>
            <input
              type="number"
              value={planForm.duration}
              onChange={(e) => setPlanForm({ ...planForm, duration: parseInt(e.target.value) || 0 })}
              className={`w-full p-3 bg-white/50 dark:bg-gray-700/50 backdrop-blur-sm border rounded-xl focus:outline-none focus:ring-2 focus:ring-[#f58c55]/50 dark:focus:ring-[#f7a16b]/50 transition-all duration-300 text-gray-900 dark:text-gray-200 placeholder-gray-500 dark:placeholder-gray-400 ${planErrors?.duration ? 'border-red-500 dark:border-red-400' : 'border-gray-200/50 dark:border-gray-600/50'}`}
              placeholder="e.g., 30"
            />
            {planErrors?.duration && <p className="text-red-500 dark:text-red-400 text-sm mt-1">{planErrors.duration}</p>}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Location</label>
            <select
              value={planForm.location}
              onChange={(e) => setPlanForm({ ...planForm, location: e.target.value })}
              className={`w-full p-3 bg-white/50 dark:bg-gray-700/50 backdrop-blur-sm border rounded-xl focus:outline-none focus:ring-2 focus:ring-[#f58c55]/50 dark:focus:ring-[#f7a16b]/50 transition-all duration-300 text-gray-900 dark:text-gray-200 ${planErrors?.location ? 'border-red-500 dark:border-red-400' : 'border-gray-200/50 dark:border-gray-600/50'}`}
            >
              <option value="">Select location</option>
              {locations.map((loc) => (
                <option key={loc._id} value={loc._id}>
                  {loc.name}
                </option>
              ))}
            </select>
            {planErrors?.location && <p className="text-red-500 dark:text-red-400 text-sm mt-1">{planErrors.location}</p>}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Bundle Name</label>
            <input
              type="text"
              value={planForm.bundle}
              onChange={(e) => setPlanForm({ ...planForm, bundle: e.target.value })}
              className={`w-full p-3 bg-white/50 dark:bg-gray-700/50 backdrop-blur-sm border rounded-xl focus:outline-none focus:ring-2 focus:ring-[#f58c55]/50 dark:focus:ring-[#f7a16b]/50 transition-all duration-300 text-gray-900 dark:text-gray-200 placeholder-gray-500 dark:placeholder-gray-400 ${planErrors?.bundle ? 'border-red-500 dark:border-red-400' : 'border-gray-200/50 dark:border-gray-600/50'}`}
              placeholder="e.g., Basic Plan"
            />
            {planErrors?.bundle && <p className="text-red-500 dark:text-red-400 text-sm mt-1">{planErrors.bundle}</p>}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Price (₦)</label>
            <input
              type="number"
              step="0.01"
              value={planForm.price}
              onChange={(e) => setPlanForm({ ...planForm, price: parseFloat(e.target.value) || 0 })}
              className={`w-full p-3 bg-white/50 dark:bg-gray-700/50 backdrop-blur-sm border rounded-xl focus:outline-none focus:ring-2 focus:ring-[#f58c55]/50 dark:focus:ring-[#f7a16b]/50 transition-all duration-300 text-gray-900 dark:text-gray-200 placeholder-gray-500 dark:placeholder-gray-400 ${planErrors?.price ? 'border-red-500 dark:border-red-400' : 'border-gray-200/50 dark:border-gray-600/50'}`}
              placeholder="e.g., 1500"
            />
            {planErrors?.price && <p className="text-red-500 dark:text-red-400 text-sm mt-1">{planErrors.price}</p>}
          </div>

          {planErrors?.general && (
            <div className="md:col-span-3">
              <p className="text-red-500 dark:text-red-400">{planErrors.general}</p>
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
              {loading ? <FaSpinner className="animate-spin" /> : <>{editingPlan ? 'Update' : 'Create'} Data Plan</>}
            </motion.button>
            {editingPlan && (
              <motion.button
                type="button"
                onClick={resetPlanForm}
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
                <h3 className="text-lg font-semibold text-gray-700 dark:text-gray-200">Data Plan List</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Showing {currentPlans.length} of {filteredPlans.length} plans
                </p>
              </div>

              <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
                {/* Search */}
                <div className="relative">
                  <input
                    type="text"
                    placeholder="Search plans..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-[#f58c55]/50 w-full sm:w-64"
                  />
                  <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                </div>

                {/* Location Filter */}
                <select
                  value={filterLocation}
                  onChange={(e) => setFilterLocation(e.target.value)}
                  className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-[#f58c55]/50"
                >
                  <option value="all">All Locations</option>
                  {locations.map((loc) => (
                    <option key={loc._id} value={loc._id}>
                      {loc.name}
                    </option>
                  ))}
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
                <th className="py-3 px-4 text-left font-semibold">Bundle</th>
                <th className="py-3 px-4 text-left font-semibold">Data (GB)</th>
                <th className="py-3 px-4 text-left font-semibold">Duration (days)</th>
                <th className="py-3 px-4 text-left font-semibold">Location</th>
                <th className="py-3 px-4 text-left font-semibold">Price (₦)</th>
                <th className="py-3 px-4 text-left font-semibold">Created</th>
                <th className="py-3 px-4 text-right font-semibold">Actions</th>
              </tr>
            </thead>
            <tbody>
              {plansLoading && (
                <tr>
                  <td colSpan={7} className="text-center py-12">
                    <FaSpinner className="animate-spin mx-auto text-4xl text-[#f58c55]" />
                    <p className="mt-4 text-gray-500">Loading plans...</p>
                  </td>
                </tr>
              )}

              {!plansLoading && currentPlans.length === 0 && (
                <tr>
                  <td colSpan={7} className="text-center py-12 text-gray-500">
                    <FaWifi className="mx-auto text-6xl mb-4 text-gray-400" />
                    <p className="text-lg">No data plans found</p>
                    <p className="text-sm">Try adjusting your filters or create a new plan</p>
                  </td>
                </tr>
              )}

              {currentPlans.map((plan) => (
                <motion.tr
                  key={plan._id}
                  className="border-b hover:bg-orange-50/50 dark:hover:bg-orange-900/20"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                >
                  <td className="py-4 px-4 font-medium">{plan.bundle}</td>
                  <td className="py-4 px-4">{plan.dataAmount}</td>
                  <td className="py-4 px-4">{plan.duration}</td>
                  <td className="py-4 px-4">{plan.location?.name ?? '—'}</td>
                  <td className="py-4 px-4">₦{plan.price.toFixed(2)}</td>
                  <td className="py-4 px-4 text-sm text-gray-600">
                    {new Date(plan.createdAt).toLocaleDateString()}
                  </td>
                  <td className="py-4 px-4 text-right space-x-2">
                    <motion.button
                      onClick={() => handleEditPlan(plan)}
                      className="text-orange-600 hover:text-orange-800 p-2"
                      whileHover={{ scale: 1.2 }}
                      title="Edit"
                    >
                      <FaEdit />
                    </motion.button>
                    <motion.button
                      onClick={() => handleDelete(plan._id)}
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

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="bg-gray-50/50 dark:bg-gray-700/50 px-4 py-3 rounded-b-xl border-t">
              <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
                <div className="text-sm text-gray-600 dark:text-gray-400">
                  Showing {startIndex + 1} to {Math.min(endIndex, filteredPlans.length)} of {filteredPlans.length} entries
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
                    {Array.from(
                      { length: Math.min(5, totalPages) },
                      (_, i) => {
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
                      }
                    )}
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

        {/* Delete Confirmation Modal (unchanged) */}
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
                  Are you sure you want to delete this data plan? This action cannot be undone.
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
                    Delete Plan
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

export default DataPlanManagement;