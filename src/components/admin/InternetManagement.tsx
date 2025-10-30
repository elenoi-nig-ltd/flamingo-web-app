'use client';

import { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useInternet } from '@/hooks/useInternet';
import { motion, AnimatePresence } from 'framer-motion';
import { FaMapMarkerAlt, FaWifi, FaTicketAlt } from 'react-icons/fa';
import { DashboardSkeleton } from '../ui/SkeletonLoader';
import { Tab } from '@headlessui/react';
import LocationManagement from './LocationManagement';
import DataPlanManagement from './DataPlanManagement';
import VoucherManagement from './VoucherManagement';

const InternetManagement = () => {
  const { user, loading: authLoading } = useAuth();
  const { loading, error } = useInternet();
  const [activeTab, setActiveTab] = useState(0);

  if (authLoading || loading) {
    return <DashboardSkeleton />;
  }

  if (error || !user || user.role !== 'admin') {
    return (
      <motion.div
        className="flex items-center justify-center min-h-screen bg-gray-50/50 dark:bg-gray-900/50"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        <p className="text-red-600 dark:text-red-400 font-semibold">
          {error || 'Admin access required'}
        </p>
      </motion.div>
    );
  }

  return (
    <div className="container mx-auto p-6 bg-gray-50/50 dark:bg-gray-900/50 min-h-screen">
      <motion.h1
        className="text-4xl font-bold bg-gradient-to-r from-[#f58c55] to-[#f47a45] dark:from-[#f7a16b] dark:to-[#f58c55] bg-clip-text text-transparent mb-8 text-center"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        Internet Management
      </motion.h1>

      <Tab.Group selectedIndex={activeTab} onChange={setActiveTab}>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <Tab.List className="flex space-x-1 bg-gray-200/50 dark:bg-gray-700/50 backdrop-blur-sm p-1 rounded-xl mb-8 max-w-md mx-auto shadow-md border border-gray-200/50 dark:border-gray-700/50">
            {[
              { icon: FaMapMarkerAlt, label: 'Locations' },
              { icon: FaWifi, label: 'Data Plans' },
              { icon: FaTicketAlt, label: 'Vouchers' },
            ].map(({ icon: Icon, label }, idx) => (
              <Tab
                key={idx}
                className={({ selected }) =>
                  `w-full py-2.5 text-sm font-medium rounded-xl transition-all duration-300 flex items-center justify-center space-x-2 ${
                    selected
                      ? 'bg-gradient-to-r from-[#f58c55] to-[#f47a45] dark:from-[#f7a16b] dark:to-[#f58c55] text-white shadow-lg'
                      : 'text-gray-600 dark:text-gray-300 hover:bg-[#f58c55]/10 dark:hover:bg-[#f7a16b]/10 hover:text-[#f47a45] dark:hover:text-[#f58c55]'
                  }`
                }
              >
                <Icon className="w-4 h-4" />
                <span>{label}</span>
              </Tab>
            ))}
          </Tab.List>
        </motion.div>

        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
            className="space-y-8"
          >
            <Tab.Panel>
              <LocationManagement />
            </Tab.Panel>
            <Tab.Panel>
              <DataPlanManagement />
            </Tab.Panel>
            <Tab.Panel>
              <VoucherManagement />
            </Tab.Panel>
          </motion.div>
        </AnimatePresence>
      </Tab.Group>
    </div>
  );
};

export default InternetManagement;