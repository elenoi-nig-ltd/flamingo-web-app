'use client';
import { useState, useEffect, useRef } from 'react';
import { useInternet } from '@/hooks/useInternet';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  FaTicketAlt, 
  FaPlus, 
  FaEdit, 
  FaTrash, 
  FaSpinner, 
  FaCopy, 
  FaFilePdf, 
  FaUpload,
  FaCheckCircle,
  FaChevronLeft,
  FaChevronRight,
  FaFilter
} from 'react-icons/fa';
import { toast } from 'react-toastify';

interface VoucherFormData {
  plan: string;
  code?: string;
  codes?: string;
  mode: 'single' | 'bulk' | 'pdf';
  pdfFile?: File | null;
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
    pdfFile: null,
  });
  const [voucherErrors, setVoucherErrors] = useState<FormErrors>({});
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<string | null>(null);
  const [bulkCodes, setBulkCodes] = useState<string[]>([]);
  const [uploadingPdf, setUploadingPdf] = useState(false);
  const [pdfUploadResult, setPdfUploadResult] = useState<any>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState<string>('');

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

  // Filter and paginate vouchers
  const filteredVouchers = vouchers.filter(voucher => {
    const matchesSearch = voucher.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         voucher.plan?.bundle?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = filterStatus === 'all' ||
               (filterStatus === 'active' && !voucher.used) ||
               (filterStatus === 'used' && voucher.used);
    
    return matchesSearch && matchesStatus;
  });

  // Pagination calculations
  const totalPages = Math.ceil(filteredVouchers.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentVouchers = filteredVouchers.slice(startIndex, endIndex);

  // Reset to first page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [filterStatus, searchTerm, itemsPerPage]);

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

        const uniqueCodes = new Set(codeLines);
        if (uniqueCodes.size !== codeLines.length) {
          errors.codes = 'Duplicate codes found. Each code must be unique';
        }
      }
    }

    if (voucherForm.mode === 'pdf' && !editingVoucher) {
      if (!voucherForm.pdfFile) {
        errors.pdfFile = 'Please select a PDF file to upload';
      } else if (!voucherForm.pdfFile.name.toLowerCase().endsWith('.pdf')) {
        errors.pdfFile = 'Only PDF files are allowed';
      } else if (voucherForm.pdfFile.size > 10 * 1024 * 1024) {
        errors.pdfFile = 'File size must be less than 10MB';
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
      } 
      else if (voucherForm.mode === 'bulk') {
        result = await createBulkVouchers({ codes: voucherForm.codes!, plan: voucherForm.plan });
        setBulkCodes(result.data.map((v: any) => v.code));
        toast.success(`${result.message || 'Bulk vouchers created successfully'}`);
      } 
      else if (voucherForm.mode === 'single') {
        result = await createVoucher({ code: voucherForm.code!.trim(), plan: voucherForm.plan });
        setBulkCodes([result.code]);
        toast.success('Voucher created successfully');
      }
      else if (voucherForm.mode === 'pdf') {
        await handlePdfUpload();
        return;
      }

      const res = await getVouchers();
      setVouchers(res?.data || []);
      if (!editingVoucher) resetVoucherForm();
    } catch (err: any) {
      const errorMsg = err.response?.data?.message ||
                      (err instanceof Error ? err.message : 'Failed to save voucher(s)');
      setVoucherErrors({ general: errorMsg });
      toast.error(errorMsg);
    }
  };

  const handlePdfUpload = async () => {
    if (!voucherForm.pdfFile || !voucherForm.plan) return;

    setUploadingPdf(true);
    setVoucherErrors({});

    const formData = new FormData();
    formData.append('pdfFile', voucherForm.pdfFile);
    formData.append('plan', voucherForm.plan);

    const token = localStorage.getItem('token');

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL_II}/upload-pdf`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
        body: formData,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || data.message || 'Upload failed');
      }

      setPdfUploadResult(data);
      setBulkCodes(data.codes || []);
      toast.success(`Successfully extracted and created ${data.total_codes} vouchers from PDF!`);

      const res = await getVouchers();
      setVouchers(res?.data || []);
      resetVoucherForm();
    } catch (err: any) {
      const errorMsg = err.message || 'Failed to upload and process PDF';
      setVoucherErrors({ general: errorMsg });
      toast.error(errorMsg);
    } finally {
      setUploadingPdf(false);
    }
  };

  const resetVoucherForm = () => {
    setVoucherForm({ plan: '', mode: 'bulk', code: undefined, codes: undefined, pdfFile: null });
    setEditingVoucher(null);
    setVoucherErrors({});
    setBulkCodes([]);
    setPdfUploadResult(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleEditVoucher = (voucher: any) => {
    setEditingVoucher(voucher._id);
    setVoucherForm({
      plan: voucher.plan._id,
      mode: 'single',
      code: voucher.code,
    });
  };

  const handleModeChange = (mode: 'single' | 'bulk' | 'pdf') => {
    setVoucherForm(prev => ({
      ...prev,
      mode,
      ...(mode === 'single' ? { codes: undefined, pdfFile: null } :
          mode === 'bulk' ? { code: undefined, pdfFile: null } :
          { code: undefined, codes: undefined })
    }));
    setBulkCodes([]);
    setVoucherErrors({});
    setPdfUploadResult(null);
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

  // Pagination handlers
  const goToPage = (page: number) => {
    setCurrentPage(page);
  };

  const goToNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
    }
  };

  const goToPrevPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
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
          >
            <div className="flex items-center">
              <FaTrash className="text-red-500 dark:text-red-400 text-xl mr-3" />
              <p className="text-red-600 dark:text-red-300">{error}</p>
            </div>
          </motion.div>
        )}

        {/* Mode Toggle */}
        {!editingVoucher && (
          <div className="mb-8">
            <div className="flex flex-wrap gap-4">
              <motion.button
                onClick={() => handleModeChange('bulk')}
                className={`px-6 py-3 rounded-xl transition-all duration-300 font-medium flex items-center space-x-2 ${
                  voucherForm.mode === 'bulk'
                    ? 'bg-gradient-to-r from-[#f58c55] to-[#f47a45] dark:from-[#f7a16b] dark:to-[#f58c55] text-white shadow-lg'
                    : 'bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 hover:bg-gray-300 dark:hover:bg-gray-600'
                }`}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <FaTicketAlt />
                <span>Bulk Create</span>
              </motion.button>

              <motion.button
                onClick={() => handleModeChange('single')}
                className={`px-6 py-3 rounded-xl transition-all duration-300 font-medium ${
                  voucherForm.mode === 'single'
                    ? 'bg-gradient-to-r from-[#f58c55] to-[#f47a45] dark:from-[#f7a16b] dark:to-[#f58c55] text-white shadow-lg'
                    : 'bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 hover:bg-gray-300 dark:hover:bg-gray-600'
                }`}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                Single Create
              </motion.button>

              <motion.button
                onClick={() => handleModeChange('pdf')}
                className={`px-6 py-3 rounded-xl transition-all duration-300 font-medium flex items-center space-x-2 ${
                  voucherForm.mode === 'pdf'
                    ? 'bg-gradient-to-r from-red-500 to-pink-600 text-white shadow-lg'
                    : 'bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 hover:bg-gray-300 dark:hover:bg-gray-600'
                }`}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <FaFilePdf className="text-xl" />
                <span>Upload PDF</span>
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
              className={`w-full p-3 bg-white/50 dark:bg-gray-700/50 backdrop-blur-sm border rounded-xl focus:outline-none focus:ring-2 focus:ring-[#f58c55]/50 dark:focus:ring-[#f7a16b]/50 transition-all duration-300 text-gray-900 dark:text-gray-200 ${
                voucherErrors?.plan ? 'border-red-500 dark:border-red-400' : 'border-gray-200/50 dark:border-gray-600/50'
              }`}
              disabled={loading || uploadingPdf}
            >
              <option value="">Select data plan</option>
              {dataPlans.map((plan) => (
                <option key={plan._id} value={plan._id} className="text-gray-900 dark:text-gray-200">
                  {plan.location?.name} - {plan.bundle} ({plan.dataAmount}GB, {plan.duration} days) - ₦{plan.price}
                </option>
              ))}
            </select>
            {voucherErrors?.plan && (
              <p className="text-red-500 dark:text-red-400 text-sm mt-1 flex items-center">
                <span className="mr-1">Warning:</span> {voucherErrors.plan}
              </p>
            )}
          </div>

          {/* PDF Upload Mode */}
          {voucherForm.mode === 'pdf' && !editingVoucher && (
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Upload Voucher PDF *
              </label>
              <div className="relative">
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".pdf"
                  onChange={(e) => {
                    const file = e.target.files?.[0] || null;
                    setVoucherForm({ ...voucherForm, pdfFile: file });
                  }}
                  className="hidden"
                />
                <motion.div
                  onClick={() => fileInputRef.current?.click()}
                  className={`border-2 border-dashed rounded-xl p-10 text-center cursor-pointer transition-all duration-300 ${
                    voucherForm.pdfFile
                      ? 'border-green-500 bg-green-50/30 dark:bg-green-900/20'
                      : 'border-gray-300 dark:border-gray-600 hover:border-[#f58c55] dark:hover:border-[#f7a16b]'
                  }`}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  {voucherForm.pdfFile ? (
                    <div className="flex flex-col items-center">
                      <FaCheckCircle className="text-6xl text-green-500 mb-4" />
                      <p className="text-xl font-semibold text-green-700 dark:text-green-300">
                        {voucherForm.pdfFile.name}
                      </p>
                      <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">
                        {(voucherForm.pdfFile.size / 1024 / 1024).toFixed(2)} MB
                      </p>
                    </div>
                  ) : (
                    <>
                      <FaFilePdf className="mx-auto text-6xl text-red-500 mb-4" />
                      <p className="text-lg font-medium text-gray-700 dark:text-gray-300">
                        Click to upload PDF file
                      </p>
                      <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
                        Supports PDF files up to 10MB
                      </p>
                    </>
                  )}
                </motion.div>
              </div>
              {voucherErrors?.pdfFile && (
                <p className="text-red-500 dark:text-red-400 text-sm mt-2 flex items-center">
                  <span className="mr-1">Warning:</span> {voucherErrors.pdfFile}
                </p>
              )}
            </div>
          )}

          {/* Single Voucher Input */}
          {voucherForm.mode === 'single' && !editingVoucher && (
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Voucher Code * <span className="text-xs text-gray-500">(max 20 chars)</span>
              </label>
              <input
                type="text"
                value={voucherForm.code || ''}
                onChange={(e) => setVoucherForm({ ...voucherForm, code: e.target.value })}
                className={`w-full p-3 bg-white/50 dark:bg-gray-700/50 backdrop-blur-sm border rounded-xl focus:outline-none focus:ring-2 focus:ring-[#f58c55]/50 dark:focus:ring-[#f7a16b]/50 transition-all duration-300 ${
                  voucherErrors?.code ? 'border-red-500' : 'border-gray-200/50 dark:border-gray-600/50'
                }`}
                placeholder="e.g., 768473"
                maxLength={20}
                disabled={loading}
              />
              {voucherForm.code && (
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  {voucherForm.code.trim().length}/20 characters
                </p>
              )}
              {voucherErrors?.code && (
                <p className="text-red-500 dark:text-red-400 text-sm mt-1">Warning: {voucherErrors.code}</p>
              )}
            </div>
          )}

          {/* Bulk Voucher Input */}
          {voucherForm.mode === 'bulk' && !editingVoucher && (
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Voucher Codes * <span className="text-xs text-gray-500">(one per line, max 1000)</span>
              </label>
              <textarea
                value={voucherForm.codes || ''}
                onChange={(e) => setVoucherForm({ ...voucherForm, codes: e.target.value })}
                rows={8}
                className={`w-full p-3 bg-white/50 dark:bg-gray-700/50 backdrop-blur-sm border rounded-xl focus:outline-none focus:ring-2 focus:ring-[#f58c55]/50 dark:focus:ring-[#f7a16b]/50 transition-all duration-300 resize-none ${
                  voucherErrors?.codes ? 'border-red-500' : 'border-gray-200/50 dark:border-gray-600/50'
                }`}
                placeholder={`558693\n338573\n557683`}
                disabled={loading}
              />
              {codeCount > 0 && (
                <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">
                  {codeCount} code{codeCount !== 1 ? 's' : ''} entered
                </p>
              )}
              {voucherErrors?.codes && (
                <p className="text-red-500 dark:text-red-400 text-sm mt-1">Warning: {voucherErrors.codes}</p>
              )}
            </div>
          )}

          {/* Edit Mode Info */}
          {editingVoucher && (
            <div className="md:col-span-2 bg-yellow-50/50 dark:bg-yellow-900/50 border border-yellow-200/50 dark:border-yellow-700/50 rounded-xl p-4">
              <p className="text-sm text-yellow-800 dark:text-yellow-200">
                <strong>Editing existing voucher:</strong> You can only change the data plan.
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
            <div className="md:col-span-2">
              <p className="text-red-500 dark:text-red-400 text-sm bg-red-50/50 dark:bg-red-900/50 p-4 rounded-xl border border-red-200/50">
                {voucherErrors.general}
              </p>
            </div>
          )}

          {/* Submit Button */}
          <div className="md:col-span-2 flex space-x-4">
            <motion.button
              type="submit"
              disabled={loading || uploadingPdf || !voucherForm.plan || 
                (voucherForm.mode === 'single' && !voucherForm.code?.trim()) ||
                (voucherForm.mode === 'bulk' && !voucherForm.codes?.trim()) ||
                (voucherForm.mode === 'pdf' && !voucherForm.pdfFile)}
              className="flex-1 p-4 bg-gradient-to-r from-[#f58c55] to-[#f47a45] dark:from-[#f7a16b] dark:to-[#f58c55] text-white rounded-xl font-medium disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center space-x-3"
              whileHover={{ scale: loading || uploadingPdf ? 1 : 1.05 }}
              whileTap={{ scale: loading || uploadingPdf ? 1 : 0.95 }}
            >
              {(loading || uploadingPdf) ? (
                <>
                  <FaSpinner className="animate-spin" />
                  <span>{uploadingPdf ? 'Uploading & Processing PDF...' : 'Processing...'}</span>
                </>
              ) : (
                <>
                  <FaUpload />
                  <span>
                    {editingVoucher ? 'Update Voucher' :
                     voucherForm.mode === 'pdf' ? 'Upload PDF & Create Vouchers' :
                     voucherForm.mode === 'bulk' ? 'Create Bulk Vouchers' : 'Create Single Voucher'}
                  </span>
                </>
              )}
            </motion.button>

            {editingVoucher && (
              <motion.button
                type="button"
                onClick={resetVoucherForm}
                className="flex-1 p-4 bg-gray-300 dark:bg-gray-700 text-gray-800 dark:text-gray-200 rounded-xl font-medium"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                Cancel
              </motion.button>
            )}
          </div>
        </form>

        {/* PDF Upload Success Message */}
        <AnimatePresence>
          {pdfUploadResult && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="mb-8 p-6 bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/30 dark:to-emerald-900/30 border border-green-300 dark:border-green-700 rounded-xl"
            >
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="text-xl font-bold text-green-800 dark:text-green-200 flex items-center gap-3">
                    <FaCheckCircle className="text-2xl" />
                    PDF Upload Successful!
                  </h3>
                  <div className="mt-3 space-y-1 text-green-700 dark:text-green-300">
                    <p>Extracted <strong>{pdfUploadResult.total_codes}</strong> voucher codes</p>
                    <p>File: <strong>{pdfUploadResult.filename}</strong></p>
                    <p>Plan: <strong>{pdfUploadResult.plan_details?.bundle}</strong> ({pdfUploadResult.plan_details?.dataAmount}GB)</p>
                  </div>
                </div>
                <motion.button
                  onClick={handleCopyCodes}
                  className="bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-xl flex items-center gap-2 font-medium"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <FaCopy />
                  Copy All Codes
                </motion.button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Success Codes Display (Bulk or PDF) */}
        <AnimatePresence>
          {bulkCodes.length > 0 && !pdfUploadResult && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="mb-6 p-4 bg-green-50/50 dark:bg-green-900/50 border border-green-200/50 dark:border-green-700/50 rounded-xl"
            >
              <div className="flex justify-between items-center mb-3">
                <h3 className="font-semibold text-green-800 dark:text-green-200 flex items-center space-x-2">
                  <FaTicketAlt />
                  <span>Successfully Created Codes ({bulkCodes.length})</span>
                </h3>
                <motion.button
                  onClick={handleCopyCodes}
                  className="bg-gradient-to-r from-[#f58c55] to-[#f47a45] text-white px-4 py-2 rounded-xl flex items-center space-x-2 text-sm font-medium"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <FaCopy />
                  <span>Copy All</span>
                </motion.button>
              </div>
              <div className="bg-white/50 dark:bg-gray-700/50 p-3 rounded-xl border max-h-48 overflow-y-auto">
                <code className="text-xs font-mono block whitespace-pre text-green-800 dark:text-green-200">
                  {bulkCodes.join('\n')}
                </code>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Vouchers Table with Filters and Pagination */}
        <div className="overflow-x-auto">
          <div className="bg-gray-50/50 dark:bg-gray-700/50 px-4 py-3 rounded-t-xl border-b">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
              <div>
                <h3 className="text-lg font-semibold text-gray-700 dark:text-gray-200">Voucher List</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Showing {currentVouchers.length} of {filteredVouchers.length} vouchers
                  {filterStatus !== 'all' && ` (filtered by ${filterStatus})`}
                </p>
              </div>
              
              {/* Filters */}
              <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
                {/* Search Input */}
                <div className="relative">
                  <input
                    type="text"
                    placeholder="Search vouchers..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-[#f58c55]/50 w-full sm:w-64"
                  />
                  <FaFilter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                </div>

                {/* Status Filter */}
                <select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                  className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-[#f58c55]/50"
                >
                  <option value="all">All Status</option>
                  <option value="active">Active</option>
                  <option value="used">Used</option>
                </select>

                {/* Items Per Page */}
                <select
                  value={itemsPerPage}
                  onChange={(e) => setItemsPerPage(Number(e.target.value))}
                  className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-[#f58c55]/50"
                >
                  <option value="10">10 per page</option>
                  <option value="25">25 per page</option>
                  <option value="50">50 per page</option>
                  <option value="100">100 per page</option>
                </select>
              </div>
            </div>
          </div>

          <table className="w-full text-sm">
            <thead className="bg-gray-50/50 dark:bg-gray-700/50">
              <tr>
                <th className="py-3 px-4 text-left font-semibold">Code</th>
                <th className="py-3 px-4 text-left font-semibold">Plan</th>
                <th className="py-3 px-4 text-left font-semibold">Status</th>
                <th className="py-3 px-4 text-left font-semibold">Created</th>
                <th className="py-3 px-4 text-right font-semibold">Actions</th>
              </tr>
            </thead>
            <tbody>
              {vouchersLoading && vouchers.length === 0 && (
                <tr>
                  <td colSpan={6} className="text-center py-12">
                    <FaSpinner className="animate-spin mx-auto text-4xl text-[#f58c55]" />
                    <p className="mt-4 text-gray-500">Loading vouchers...</p>
                  </td>
                </tr>
              )}
              {currentVouchers.length === 0 && !vouchersLoading && (
                <tr>
                  <td colSpan={6} className="text-center py-12 text-gray-500">
                    <FaTicketAlt className="mx-auto text-6xl mb-4 text-gray-400" />
                    <p className="text-lg">No vouchers found</p>
                    <p className="text-sm">Try adjusting your filters or create new vouchers</p>
                  </td>
                </tr>
              )}
              {currentVouchers.map((voucher) => (
                <motion.tr
                  key={voucher._id}
                  className="border-b hover:bg-orange-50/50 dark:hover:bg-orange-900/20"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                >
                  <td className="py-4 px-4">
                    <code className="bg-gray-100 dark:bg-gray-800 px-3 py-1 rounded-full font-mono">
                      {voucher.code}
                    </code>
                  </td>
                  <td className="py-4 px-4">
                    <div>
                      <p className="font-medium">{voucher.plan?.bundle}</p>
                      <p className="text-xs text-gray-600 dark:text-gray-400">
                        {voucher.plan?.dataAmount}GB / {voucher.plan?.duration} days
                      </p>
                      <p className="text-xs text-gray-500">{voucher.plan?.location?.name}</p>
                    </div>
                  </td>
                  <td className="py-4 px-4">
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                      voucher.used 
                        ? 'bg-red-100 text-red-800 dark:bg-red-900/50 dark:text-red-200'
                        : 'bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-200'
                    }`}>
                      {voucher.used ? 'Used' : 'Active'}
                    </span>
                  </td>
                 
                  <td className="py-4 px-4 text-sm text-gray-600">
                    {new Date(voucher.createdAt).toLocaleDateString()}
                  </td>
                  <td className="py-4 px-4 text-right space-x-2">
                    <motion.button
                      onClick={() => handleEditVoucher(voucher)}
                      className="text-orange-600 hover:text-orange-800 p-2"
                      whileHover={{ scale: 1.2 }}
                      title="Edit Plan"
                    >
                      <FaEdit />
                    </motion.button>
                    <motion.button
                      onClick={() => handleDelete(voucher._id)}
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
                  Showing {startIndex + 1} to {Math.min(endIndex, filteredVouchers.length)} of {filteredVouchers.length} entries
                </div>
                
                <div className="flex items-center space-x-2">
                  {/* Previous Button */}
                  <motion.button
                    onClick={goToPrevPage}
                    disabled={currentPage === 1}
                    className="p-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
                    whileHover={{ scale: currentPage === 1 ? 1 : 1.05 }}
                    whileTap={{ scale: currentPage === 1 ? 1 : 0.95 }}
                  >
                    <FaChevronLeft className="text-gray-600 dark:text-gray-400" />
                  </motion.button>

                  {/* Page Numbers */}
                  <div className="flex space-x-1">
                    {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                      let pageNum;
                      if (totalPages <= 5) {
                        pageNum = i + 1;
                      } else if (currentPage <= 3) {
                        pageNum = i + 1;
                      } else if (currentPage >= totalPages - 2) {
                        pageNum = totalPages - 4 + i;
                      } else {
                        pageNum = currentPage - 2 + i;
                      }

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

                  {/* Next Button */}
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

        {/* Delete Confirmation Modal */}
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
                  Are you sure you want to delete this voucher? This action cannot be undone.
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
                    Delete Voucher
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

export default VoucherManagement;