
'use client';

import { useState, useEffect } from 'react';
import { useInternet } from '@/hooks/useInternet';
import { motion, AnimatePresence } from 'framer-motion';
import { FaWifi, FaPlus, FaEdit, FaTrash, FaSpinner, FaTimesCircle } from 'react-icons/fa';

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
  const [planForm, setPlanForm] = useState<DataPlanFormData>({ dataAmount: 0, duration: 0, location: '', bundle: '', price: 0 });
  const [planErrors, setPlanErrors] = useState<FormErrors>({});
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<string | null>(null);

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
              onClick={() => resetPlanForm()}
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
              <FaTimesCircle className="text-red-500 dark:text-red-400 text-xl mr-3" />
              <p className="text-red-600 dark:text-red-300">{error}</p>
            </div>
          </motion.div>
        )}

        <form onSubmit={handlePlanSubmit} className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
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
              <option value="" className="text-gray-900 dark:text-gray-200">Select location</option>
              {locations.map((location) => (
                <option key={location._id} value={location._id} className="text-gray-900 dark:text-gray-200">{location.name}</option>
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
              value={planForm.price}
              onChange={(e) => setPlanForm({ ...planForm, price: parseFloat(e.target.value) || 0 })}
              className={`w-full p-3 bg-white/50 dark:bg-gray-700/50 backdrop-blur-sm border rounded-xl focus:outline-none focus:ring-2 focus:ring-[#f58c55]/50 dark:focus:ring-[#f7a16b]/50 transition-all duration-300 text-gray-900 dark:text-gray-200 placeholder-gray-500 dark:placeholder-gray-400 ${planErrors?.price ? 'border-red-500 dark:border-red-400' : 'border-gray-200/50 dark:border-gray-600/50'}`}
              placeholder="e.g., 10.99"
              step="0.01"
            />
            {planErrors?.price && <p className="text-red-500 dark:text-red-400 text-sm mt-1">{planErrors.price}</p>}
          </div>
          {planErrors?.general && (
            <p className="md:col-span-3 text-red-500 dark:text-red-400">{planErrors.general}</p>
          )}
          <div className="md:col-span-3 flex space-x-4">
            <motion.button
              type="submit"
              className={`flex-1 p-3 bg-gradient-to-r from-[#f58c55] to-[#f47a45] dark:from-[#f7a16b] dark:to-[#f58c55] text-white rounded-xl hover:from-[#f47a45] hover:to-[#f58c55] dark:hover:from-[#f58c55] dark:hover:to-[#f7a16b] transition-all duration-300 disabled:bg-gray-400 disabled:cursor-not-allowed`}
              whileHover={{ scale: loading ? 1 : 1.05 }}
              whileTap={{ scale: loading ? 1 : 0.95 }}
              disabled={loading}
            >
              {loading ? <FaSpinner className="animate-spin mx-auto" /> : <>{editingPlan ? 'Update' : 'Create'} Data Plan</>}
            </motion.button>
            {editingPlan && (
              <motion.button
                type="button"
                onClick={resetPlanForm}
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
                <th className="py-3 px-4 text-left text-gray-700 dark:text-gray-200 font-semibold">Bundle</th>
                <th className="py-3 px-4 text-left text-gray-700 dark:text-gray-200 font-semibold">Data (MB)</th>
                <th className="py-3 px-4 text-left text-gray-700 dark:text-gray-200 font-semibold">Duration (days)</th>
                <th className="py-3 px-4 text-left text-gray-700 dark:text-gray-200 font-semibold">Location</th>
                <th className="py-3 px-4 text-left text-gray-700 dark:text-gray-200 font-semibold">Price (₦)</th>
                <th className="py-3 px-4 text-left text-gray-700 dark:text-gray-200 font-semibold">Created</th>
                <th className="py-3 px-4 text-left text-gray-700 dark:text-gray-200 font-semibold">Actions</th>
              </tr>
            </thead>
            <tbody>
              {dataPlans.length === 0 && !plansLoading && (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-gray-500 dark:text-gray-400">
                    <div className="flex flex-col items-center">
                      <FaWifi className="text-gray-400 dark:text-gray-300 text-4xl mb-3" />
                      <p className="text-lg font-medium text-gray-600 dark:text-gray-200">No data plans found</p>
                      <p className="text-sm text-gray-500 dark:text-gray-400">Add a new data plan to get started.</p>
                    </div>
                  </td>
                </tr>
              )}
              {dataPlans.map((plan) => (
                <motion.tr
                  key={plan._id}
                  className="border-b border-gray-200/50 dark:border-gray-700/50 hover:bg-gradient-to-r hover:from-[#f58c55]/5 hover:to-[#f47a45]/5 dark:hover:from-[#f7a16b]/5 dark:hover:to-[#f58c55]/5 transition-all duration-300"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3 }}
                >
                  <td className="py-3 px-4 font-medium text-gray-800 dark:text-gray-200">{plan.bundle}</td>
                  <td className="py-3 px-4 text-gray-600 dark:text-gray-300">{plan.dataAmount}</td>
                  <td className="py-3 px-4 text-gray-600 dark:text-gray-300">{plan.duration}</td>
                  <td className="py-3 px-4 text-gray-600 dark:text-gray-300">{plan.location?.name ?? 'Unknown'}</td>
                  <td className="py-3 px-4 text-gray-600 dark:text-gray-300">₦{plan.price.toFixed(2)}</td>
                  <td className="py-3 px-4 text-gray-600 dark:text-gray-300">
                    {new Date(plan.createdAt).toLocaleDateString()}
                  </td>
                  <td className="py-3 px-4 flex space-x-2">
                    <motion.button
                      onClick={() => handleEditPlan(plan)}
                      className="text-[#f58c55] dark:text-[#f7a16b] hover:text-[#f47a45] dark:hover:text-[#f58c55] hover:bg-[#f58c55]/10 dark:hover:bg-[#f7a16b]/10 rounded-full p-1 transition-all duration-300"
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                    >
                      <FaEdit />
                    </motion.button>
                    <motion.button
                      onClick={() => handleDelete(plan._id)}
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
          {plansLoading && (
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
                  Are you sure you want to delete this data plan? This action cannot be undone.
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

export default DataPlanManagement;
