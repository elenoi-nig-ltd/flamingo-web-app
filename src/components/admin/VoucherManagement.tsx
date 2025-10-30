'use client';

import { useState, useEffect } from 'react';
import { useInternet } from '@/hooks/useInternet';
import { motion, AnimatePresence } from 'framer-motion';
import { FaTicketAlt, FaPlus, FaEdit, FaTrash, FaSpinner, FaCopy } from 'react-icons/fa';
import { toast } from 'react-toastify';

interface VoucherFormData {
  plan: string;
  code?: string; // For single voucher creation
  codes?: string; // For bulk creation (textarea content)
  mode: 'single' | 'bulk';
}

interface FormErrors {
  [key: string]: string | undefined;
  general?: string;
}

const VoucherManagement = () => {
  const {
    loading,
    error,
    createVoucher,
    createBulkVouchers,
    getVouchers,
    getDataPlans,
    updateVoucher,
    deleteVoucher,
    setError,
  } = useInternet();
  
  const [vouchers, setVouchers] = useState<any[]>([]);
  const [dataPlans, setDataPlans] = useState<any[]>([]);
  const [vouchersLoading, setVouchersLoading] = useState(true);
  const [editingVoucher, setEditingVoucher] = useState<string | null>(null);
  const [voucherForm, setVoucherForm] = useState<VoucherFormData>({
    plan: '',
    mode: 'bulk',
  });
  const [voucherErrors, setVoucherErrors] = useState<FormErrors>({});
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<string | null>(null);
  const [bulkCodes, setBulkCodes] = useState<string[]>([]);

  useEffect(() => {
    const loadData = async () => {
      try {
        setVouchersLoading(true);
        const [voucherRes, planRes] = await Promise.all([getVouchers(), getDataPlans()]);
        setVouchers(voucherRes?.data || []);
        setDataPlans(planRes?.data || []);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load data');
        toast.error('Failed to load data');
      } finally {
        setVouchersLoading(false);
      }
    };
    loadData();
  }, [getVouchers, getDataPlans, setError]);

  const validateVoucher = (): boolean => {
    const errors: FormErrors = {};
    
    if (!voucherForm.plan) {
      errors.plan = 'Data plan is required';
    }
    
    if (voucherForm.mode === 'single' && !editingVoucher) {
      if (!voucherForm.code || voucherForm.code.trim() === '') {
        errors.code = 'Voucher code is required';
      } else if (voucherForm.code.trim().length > 20) {
        errors.code = 'Voucher code must be 20 characters or less';
      }
    }
    
    if (voucherForm.mode === 'bulk' && !editingVoucher) {
      if (!voucherForm.codes || voucherForm.codes.trim() === '') {
        errors.codes = 'Voucher codes are required (one per line)';
      } else {
        const codeLines = voucherForm.codes
          .split('\n')
          .map(line => line.trim())
          .filter(line => line.length > 0);
        
        if (codeLines.length === 0) {
          errors.codes = 'At least one valid voucher code is required';
        } else if (codeLines.length > 1000) {
          errors.codes = 'Maximum 1000 voucher codes allowed';
        } else if (codeLines.some(line => line.length > 20)) {
          errors.codes = 'Each voucher code must be 20 characters or less';
        }
        
        // Check for duplicates
        const uniqueCodes = new Set(codeLines);
        if (uniqueCodes.size !== codeLines.length) {
          errors.codes = 'Duplicate codes found. Each code must be unique';
        }
      }
    }
    
    setVoucherErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleVoucherSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateVoucher()) return;

    try {
      let result;
      if (editingVoucher) {
        result = await updateVoucher(editingVoucher, { plan: voucherForm.plan });
        toast.success('Voucher updated successfully');
      } else if (voucherForm.mode === 'bulk') {
        result = await createBulkVouchers({ codes: voucherForm.codes!, plan: voucherForm.plan });
        setBulkCodes(result.data.map((v: any) => v.code));
        toast.success(`${result.message || 'Bulk vouchers created successfully'}`);
      } else {
        result = await createVoucher({ code: voucherForm.code!.trim(), plan: voucherForm.plan });
        setBulkCodes([result.code]);
        toast.success('Voucher created successfully');
      }
      
      const res = await getVouchers();
      setVouchers(res?.data || []);
      resetVoucherForm();
    } catch (err: any) {
      const errorMsg = err.response?.data?.message || 
                      (err instanceof Error ? err.message : 'Failed to save voucher(s)');
      setVoucherErrors({ general: errorMsg });
      toast.error(errorMsg);
    }
  };

  const resetVoucherForm = () => {
    setVoucherForm({ plan: '', mode: 'bulk', code: undefined, codes: undefined });
    setEditingVoucher(null);
    setVoucherErrors({});
    setBulkCodes([]);
  };

  const handleEditVoucher = (voucher: any) => {
    setEditingVoucher(voucher._id);
    setVoucherForm({
      plan: voucher.plan._id,
      mode: 'single',
      code: voucher.code,
    });
  };

  const handleModeChange = (mode: 'single' | 'bulk') => {
    setVoucherForm(prev => ({ 
      ...prev, 
      mode,
      ...(mode === 'single' ? { codes: undefined } : { code: undefined })
    }));
    setBulkCodes([]);
    setVoucherErrors({});
  };

  const handleCopyCodes = () => {
    const codesText = bulkCodes.join('\n');
    navigator.clipboard.writeText(codesText).then(() => {
      toast.success('Codes copied to clipboard!');
    }).catch(() => {
      toast.error('Failed to copy codes');
    });
  };

  const handleDelete = (id: string) => {
    setItemToDelete(id);
    setShowDeleteModal(true);
  };

  const confirmDelete = async () => {
    try {
      if (itemToDelete) {
        await deleteVoucher(itemToDelete);
        const res = await getVouchers();
        setVouchers(res?.data || []);
        toast.success('Voucher deleted successfully');
      }
    } catch (err: any) {
      const errorMsg = err.response?.data?.message || 
                      (err instanceof Error ? err.message : 'Failed to delete voucher');
      setError(errorMsg);
      toast.error(errorMsg);
    }
    setShowDeleteModal(false);
    setItemToDelete(null);
  };

  const codeCount = voucherForm.codes 
    ? voucherForm.codes.split('\n').filter(line => line.trim()).length 
    : 0;

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
            <FaTicketAlt />
            <span>{editingVoucher ? 'Edit Voucher' : 'Manage Vouchers'}</span>
          </h2>
          {!editingVoucher && (
            <motion.button
              onClick={() => resetVoucherForm()}
              className="bg-gradient-to-r from-[#f58c55] to-[#f47a45] dark:from-[#f7a16b] dark:to-[#f58c55] text-white px-4 py-2 rounded-xl hover:from-[#f47a45] hover:to-[#f58c55] dark:hover:from-[#f58c55] dark:hover:to-[#f7a16b] transition-all duration-300 flex items-center space-x-2"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <FaPlus />
              <span>New Vouchers</span>
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

        {/* Mode Toggle */}
        {!editingVoucher && (
          <div className="mb-6">
            <div className="flex space-x-4">
              <motion.button
                onClick={() => handleModeChange('bulk')}
                className={`px-4 py-2 rounded-xl transition-all duration-300 font-medium ${voucherForm.mode === 'bulk' ? 'bg-gradient-to-r from-[#f58c55] to-[#f47a45] dark:from-[#f7a16b] dark:to-[#f58c55] text-white shadow-md' : 'bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 hover:bg-gray-300 dark:hover:bg-gray-600'}`}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                disabled={loading}
              >
                Bulk Create
              </motion.button>
              <motion.button
                onClick={() => handleModeChange('single')}
                className={`px-4 py-2 rounded-xl transition-all duration-300 font-medium ${voucherForm.mode === 'single' ? 'bg-gradient-to-r from-[#f58c55] to-[#f47a45] dark:from-[#f7a16b] dark:to-[#f58c55] text-white shadow-md' : 'bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 hover:bg-gray-300 dark:hover:bg-gray-600'}`}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                disabled={loading}
              >
                Single Create
              </motion.button>
            </div>
          </div>
        )}

        <form onSubmit={handleVoucherSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          {/* Data Plan Selection */}
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Data Plan *</label>
            <select
              value={voucherForm.plan}
              onChange={(e) => setVoucherForm({ ...voucherForm, plan: e.target.value })}
              className={`w-full p-3 bg-white/50 dark:bg-gray-700/50 backdrop-blur-sm border rounded-xl focus:outline-none focus:ring-2 focus:ring-[#f58c55]/50 dark:focus:ring-[#f7a16b]/50 transition-all duration-300 text-gray-900 dark:text-gray-200 ${voucherErrors?.plan ? 'border-red-500 dark:border-red-400' : 'border-gray-200/50 dark:border-gray-600/50'}`}
              disabled={loading}
            >
              <option value="" className="text-gray-900 dark:text-gray-200">Select data plan</option>
              {dataPlans.map((plan) => (
                <option key={plan._id} value={plan._id} className="text-gray-900 dark:text-gray-200">
                  {plan.location?.name} - {plan.bundle} ({plan.dataAmount}MB, {plan.duration} days) - ₦{plan.price}
                </option>
              ))}
            </select>
            {voucherErrors?.plan && (
              <p className="text-red-500 dark:text-red-400 text-sm mt-1 flex items-center">
                <span className="mr-1">⚠️</span>{voucherErrors.plan}
              </p>
            )}
          </div>

          {/* Single Voucher Code Input */}
          {voucherForm.mode === 'single' && !editingVoucher && (
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Voucher Code * <span className="text-xs text-gray-500 dark:text-gray-400">(max 20 chars)</span>
              </label>
              <input
                type="text"
                value={voucherForm.code || ''}
                onChange={(e) => setVoucherForm({ ...voucherForm, code: e.target.value })}
                className={`w-full p-3 bg-white/50 dark:bg-gray-700/50 backdrop-blur-sm border rounded-xl focus:outline-none focus:ring-2 focus:ring-[#f58c55]/50 dark:focus:ring-[#f7a16b]/50 transition-all duration-300 text-gray-900 dark:text-gray-200 placeholder-gray-500 dark:placeholder-gray-400 ${voucherErrors?.code ? 'border-red-500 dark:border-red-400' : 'border-gray-200/50 dark:border-gray-600/50'}`}
                placeholder="e.g., ABC123XYZ"
                maxLength={20}
                disabled={loading}
              />
              {voucherForm.code && (
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  {voucherForm.code.trim().length}/20 characters
                </p>
              )}
              {voucherErrors?.code && (
                <p className="text-red-500 dark:text-red-400 text-sm mt-1 flex items-center">
                  <span className="mr-1">⚠️</span>{voucherErrors.code}
                </p>
              )}
            </div>
          )}

          {/* Bulk Voucher Codes Input */}
          {voucherForm.mode === 'bulk' && !editingVoucher && (
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Voucher Codes * <span className="text-xs text-gray-500 dark:text-gray-400">(one per line, max 1000)</span>
              </label>
              <textarea
                value={voucherForm.codes || ''}
                onChange={(e) => setVoucherForm({ ...voucherForm, codes: e.target.value })}
                rows={8}
                className={`w-full p-3 bg-white/50 dark:bg-gray-700/50 backdrop-blur-sm border rounded-xl focus:outline-none focus:ring-2 focus:ring-[#f58c55]/50 dark:focus:ring-[#f7a16b]/50 transition-all duration-300 text-gray-900 dark:text-gray-200 placeholder-gray-500 dark:placeholder-gray-400 resize-none ${voucherErrors?.codes ? 'border-red-500 dark:border-red-400' : 'border-gray-200/50 dark:border-gray-600/50'}`}
                placeholder={`ABC123XYZ\nDEF456ABC\nGHI789DEF`}
                disabled={loading}
              />
              {codeCount > 0 && (
                <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">
                  {codeCount} code{codeCount !== 1 ? 's' : ''} entered
                </p>
              )}
              {voucherErrors?.codes && (
                <p className="text-red-500 dark:text-red-400 text-sm mt-1 flex items-center">
                  <span className="mr-1">⚠️</span>{voucherErrors.codes}
                </p>
              )}
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                Enter one unique voucher code per line. Each code must be unique and maximum 20 characters.
              </p>
            </div>
          )}

          {/* Edit Mode Info */}
          {editingVoucher && (
            <div className="md:col-span-2 bg-yellow-50/50 dark:bg-yellow-900/50 border border-yellow-200/50 dark:border-yellow-700/50 rounded-xl p-4">
              <p className="text-sm text-yellow-800 dark:text-yellow-200">
                <strong>Editing existing voucher:</strong> You can only change the data plan. The voucher code cannot be modified.
              </p>
              {voucherForm.code && (
                <p className="text-sm text-yellow-700 dark:text-yellow-300 mt-1">
                  Current code: <code className="bg-yellow-200/50 dark:bg-yellow-700/50 px-2 py-1 rounded text-xs font-mono">{voucherForm.code}</code>
                </p>
              )}
            </div>
          )}

          {/* General Error */}
          {voucherErrors?.general && (
            <p className="md:col-span-2 text-red-500 dark:text-red-400 text-sm bg-red-50/50 dark:bg-red-900/50 p-3 rounded-xl border border-red-200/50 dark:border-red-700/50">
              {voucherErrors.general}
            </p>
          )}

          {/* Form Buttons */}
          <div className="md:col-span-2 flex space-x-4">
            <motion.button
              type="submit"
              className={`flex-1 p-3 bg-gradient-to-r from-[#f58c55] to-[#f47a45] dark:from-[#f7a16b] dark:to-[#f58c55] text-white rounded-xl hover:from-[#f47a45] hover:to-[#f58c55] dark:hover:from-[#f58c55] dark:hover:to-[#f7a16b] transition-all duration-300 disabled:bg-gray-400 disabled:cursor-not-allowed font-medium`}
              whileHover={{ scale: loading ? 1 : 1.05 }}
              whileTap={{ scale: loading ? 1 : 0.95 }}
              disabled={loading || !voucherForm.plan || (voucherForm.mode === 'single' && !editingVoucher && !voucherForm.code?.trim()) || (voucherForm.mode === 'bulk' && !voucherForm.codes?.trim())}
            >
              {loading ? (
                <div className="flex items-center justify-center space-x-2">
                  <FaSpinner className="animate-spin" />
                  <span>Processing...</span>
                </div>
              ) : (
                <>
                  {editingVoucher ? 'Update Voucher' : 
                   voucherForm.mode === 'bulk' ? 'Create Bulk Vouchers' : 'Create Single Voucher'}
                </>
              )}
            </motion.button>
            {editingVoucher && (
              <motion.button
                type="button"
                onClick={resetVoucherForm}
                className="flex-1 p-3 bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 rounded-xl hover:bg-gray-300 dark:hover:bg-gray-600 transition-all duration-300"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                Cancel
              </motion.button>
            )}
          </div>
        </form>

        {/* Success Codes Display */}
        <AnimatePresence>
          {bulkCodes.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.5 }}
              className="mb-6 p-4 bg-green-50/50 dark:bg-green-900/50 border border-green-200/50 dark:border-green-700/50 rounded-xl"
            >
              <div className="flex justify-between items-center mb-3">
                <h3 className="font-semibold text-green-800 dark:text-green-200 flex items-center space-x-2">
                  <FaTicketAlt />
                  <span>Successfully Created Codes ({bulkCodes.length})</span>
                </h3>
                <motion.button
                  onClick={handleCopyCodes}
                  className="bg-gradient-to-r from-[#f58c55] to-[#f47a45] dark:from-[#f7a16b] dark:to-[#f58c55] text-white px-4 py-2 rounded-xl hover:from-[#f47a45] hover:to-[#f58c55] dark:hover:from-[#f58c55] dark:hover:to-[#f7a16b] transition-all duration-300 flex items-center space-x-2 text-sm font-medium"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <FaCopy />
                  <span>Copy All</span>
                </motion.button>
              </div>
              <div className="bg-white/50 dark:bg-gray-700/50 p-3 rounded-xl border border-gray-200/50 dark:border-gray-600/50 max-h-48 overflow-y-auto">
                <code className="text-xs font-mono block whitespace-pre text-green-800 dark:text-green-200">
                  {bulkCodes.join('\n')}
                </code>
              </div>
              <p className="text-xs text-green-700 dark:text-green-300 mt-2">
                These codes have been saved to the database and are ready for use.
              </p>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Vouchers Table */}
        <div className="overflow-x-auto">
          <div className="bg-gray-50/50 dark:bg-gray-700/50 px-4 py-3 rounded-t-xl border-b border-gray-200/50 dark:border-gray-700/50">
            <h3 className="text-lg font-semibold text-gray-700 dark:text-gray-200">Voucher List</h3>
            <p className="text-sm text-gray-500 dark:text-gray-400">Total: {vouchers.length} vouchers</p>
          </div>
          <table className="w-full min-w-full text-sm">
            <thead className="border-b border-gray-200/50 dark:border-gray-700/50 bg-gray-50/50 dark:bg-gray-700/50">
              <tr>
                <th className="py-3 px-4 text-left text-gray-700 dark:text-gray-200 font-semibold">Code</th>
                <th className="py-3 px-4 text-left text-gray-700 dark:text-gray-200 font-semibold">Plan</th>
                <th className="py-3 px-4 text-left text-gray-700 dark:text-gray-200 font-semibold">Status</th>
                <th className="py-3 px-4 text-left text-gray-700 dark:text-gray-200 font-semibold">Expires</th>
                <th className="py-3 px-4 text-left text-gray-700 dark:text-gray-200 font-semibold">Created</th>
                <th className="py-3 px-4 text-right text-gray-700 dark:text-gray-200 font-semibold">Actions</th>
              </tr>
            </thead>
            <tbody>
              {vouchers.length === 0 && !vouchersLoading && (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-gray-500 dark:text-gray-400">
                    <div className="flex flex-col items-center">
                      <FaTicketAlt className="text-gray-400 dark:text-gray-300 text-4xl mb-3" />
                      <p className="text-lg font-medium text-gray-600 dark:text-gray-200">No vouchers found</p>
                      <p className="text-sm text-gray-500 dark:text-gray-400">Create your first voucher above.</p>
                    </div>
                  </td>
                </tr>
              )}
              {vouchers.map((voucher) => (
                <motion.tr
                  key={voucher._id}
                  className="border-b border-gray-200/50 dark:border-gray-700/50 hover:bg-gradient-to-r hover:from-[#f58c55]/5 hover:to-[#f47a45]/5 dark:hover:from-[#f7a16b]/5 dark:hover:to-[#f58c55]/5 transition-all duration-300"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3 }}
                >
                  <td className="py-4 px-4">
                    <code className="bg-gray-100/50 dark:bg-gray-700/50 px-3 py-1 rounded-full text-sm font-mono font-medium text-gray-800 dark:text-gray-200">
                      {voucher.code}
                    </code>
                  </td>
                  <td className="py-4 px-4">
                    <div>
                      <p className="text-sm font-medium text-gray-800 dark:text-gray-200">{voucher.plan?.bundle}</p>
                      <p className="text-xs text-gray-600 dark:text-gray-300">
                        {voucher.plan?.dataAmount}MB / {voucher.plan?.duration} days
                      </p>
                      <p className="text-xs text-gray-600 dark:text-gray-300">
                        {voucher.plan?.location?.name}
                      </p>
                    </div>
                  </td>
                  <td className="py-4 px-4">
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${voucher.used ? 'bg-red-100/50 dark:bg-red-900/50 text-red-800 dark:text-red-200' : voucher.expiresAt && new Date(voucher.expiresAt) < new Date() ? 'bg-yellow-100/50 dark:bg-yellow-900/50 text-yellow-800 dark:text-yellow-200' : 'bg-[#f58c55]/10 dark:bg-[#f7a16b]/10 text-[#f58c55] dark:text-[#f7a16b]'}`}>
                      {voucher.used ? 'Used' : 
                       voucher.expiresAt && new Date(voucher.expiresAt) < new Date() ? 'Expired' : 'Active'}
                    </span>
                  </td>
                  <td className="py-4 px-4 text-sm text-gray-600 dark:text-gray-300">
                    {voucher.expiresAt ? new Date(voucher.expiresAt).toLocaleDateString() : 'N/A'}
                  </td>
                  <td className="py-4 px-4 text-sm text-gray-600 dark:text-gray-300">
                    {new Date(voucher.createdAt).toLocaleDateString()}
                  </td>
                  <td className="py-4 px-4 flex justify-end space-x-2">
                    <motion.button
                      onClick={() => handleEditVoucher(voucher)}
                      className="text-[#f58c55] dark:text-[#f7a16b] hover:text-[#f47a45] dark:hover:text-[#f58c55] hover:bg-[#f58c55]/10 dark:hover:bg-[#f7a16b]/10 rounded-full p-1 transition-all duration-300"
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      title="Edit Plan"
                    >
                      <FaEdit />
                    </motion.button>
                    <motion.button
                      onClick={() => handleDelete(voucher._id)}
                      className="text-red-600 dark:text-red-400 hover:text-red-800 dark:hover:text-red-300 hover:bg-red-600/10 dark:hover:bg-red-400/10 rounded-full p-1 transition-all duration-300"
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      title="Delete"
                    >
                      <FaTrash />
                    </motion.button>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
          {vouchersLoading && !vouchers.length && (
            <div className="text-center py-12">
              <FaSpinner className="animate-spin mx-auto text-[#f58c55] dark:text-[#f7a16b]" size={32} />
              <p className="mt-4 text-gray-500 dark:text-gray-400">Loading vouchers...</p>
            </div>
          )}
        </div>

        {/* Delete Confirmation Modal */}
        <AnimatePresence>
          {showDeleteModal && (
            <motion.div
              className="fixed inset-0 bg-black/50 dark:bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
              onClick={() => setShowDeleteModal(false)}
            >
              <motion.div
                className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm rounded-xl p-6 max-w-md w-full shadow-2xl border border-gray-200/50 dark:border-gray-700/50"
                initial={{ scale: 0.7, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.7, opacity: 0 }}
                transition={{ duration: 0.3 }}
                onClick={(e) => e.stopPropagation()}
              >
                <h3 className="text-xl font-semibold text-red-600 dark:text-red-400 mb-4 flex items-center">
                  <FaTrash className="mr-2" />
                  Confirm Delete
                </h3>
                <p className="text-gray-600 dark:text-gray-300 mb-6">
                  Are you sure you want to delete this voucher? This action cannot be undone and will permanently remove the voucher from the system.
                </p>
                <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200/50 dark:border-gray-700/50">
                  <motion.button
                    onClick={() => setShowDeleteModal(false)}
                    className="px-6 py-2 bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 rounded-xl hover:bg-gray-300 dark:hover:bg-gray-600 transition-all duration-300 font-medium"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    Cancel
                  </motion.button>
                  <motion.button
                    onClick={confirmDelete}
                    className="px-6 py-2 bg-red-600 dark:bg-red-700 text-white rounded-xl hover:bg-red-700 dark:hover:bg-red-600 transition-all duration-300 font-medium"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    Delete Voucher
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

export default VoucherManagement;