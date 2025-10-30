
'use client';

import { useState, useEffect } from 'react';
import { FaUsers, FaBox, FaShoppingCart, FaWarehouse } from 'react-icons/fa';
import { useAuth } from '@/hooks/useAuth';
import { useProducts } from '@/hooks/useProducts';
import { useOrders } from '@/hooks/useOrders';
import { useUsers } from '@/hooks/useUsers';
import { useInventory } from '@/hooks/useInventory';
import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { DashboardSkeleton } from '../ui/SkeletonLoader';

const AdminDashboard = () => {
  const { user, loading } = useAuth();
  const { products, loading: productsLoading } = useProducts();
  const { orders, loading: ordersLoading } = useOrders();
  const { users, loading: usersLoading } = useUsers();
  const { inventory, loading: inventoryLoading } = useInventory();

  const productsCount = products.length;
  const ordersCount = orders.length;
  const usersCount = users.length;
  const inventoryCount = inventory.length;

  const dataLoading = productsLoading || ordersLoading || usersLoading || inventoryLoading;

  if (loading || dataLoading) {
    return <DashboardSkeleton />;
  }

  return (
    <div className="flex flex-col p-6 bg-gray-50/50 dark:bg-gray-900/50 min-h-screen">
      <motion.h1 
        className="text-3xl font-bold bg-gradient-to-r from-[#f58c55] to-[#f47a45] bg-clip-text text-transparent mb-8"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        Dashboard Overview
      </motion.h1>

      <motion.div 
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
      >
        <motion.div
          className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm p-6 rounded-2xl shadow-lg border border-gray-200/50 dark:border-gray-700/50 flex items-center justify-between"
          whileHover={{ scale: 1.05, boxShadow: '0 10px 20px rgba(245, 140, 85, 0.2)' }}
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.3, delay: 0.3 }}
        >
          <div>
            <p className="text-gray-600 dark:text-gray-300 text-sm font-medium">Users</p>
            <p className="text-2xl font-semibold text-gray-800 dark:text-white">{usersCount.toLocaleString()}</p>
          </div>
          <FaUsers className="text-[#f58c55] dark:text-[#f7a16b] text-4xl" />
        </motion.div>

        <motion.div
          className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm p-6 rounded-2xl shadow-lg border border-gray-200/50 dark:border-gray-700/50 flex items-center justify-between"
          whileHover={{ scale: 1.05, boxShadow: '0 10px 20px rgba(245, 140, 85, 0.2)' }}
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.3, delay: 0.4 }}
        >
          <div>
            <p className="text-gray-600 dark:text-gray-300 text-sm font-medium">Products</p>
            <p className="text-2xl font-semibold text-gray-800 dark:text-white">{productsCount.toLocaleString()}</p>
          </div>
          <FaBox className="text-[#f58c55] dark:text-[#f7a16b] text-4xl" />
        </motion.div>

        <motion.div
          className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm p-6 rounded-2xl shadow-lg border border-gray-200/50 dark:border-gray-700/50 flex items-center justify-between"
          whileHover={{ scale: 1.05, boxShadow: '0 10px 20px rgba(245, 140, 85, 0.2)' }}
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.3, delay: 0.5 }}
        >
          <div>
            <p className="text-gray-600 dark:text-gray-300 text-sm font-medium">Orders</p>
            <p className="text-2xl font-semibold text-gray-800 dark:text-white">{ordersCount.toLocaleString()}</p>
          </div>
          <FaShoppingCart className="text-[#f58c55] dark:text-[#f7a16b] text-4xl" />
        </motion.div>

        <motion.div
          className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm p-6 rounded-2xl shadow-lg border border-gray-200/50 dark:border-gray-700/50 flex items-center justify-between"
          whileHover={{ scale: 1.05, boxShadow: '0 10px 20px rgba(245, 140, 85, 0.2)' }}
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.3, delay: 0.6 }}
        >
          <div>
            <p className="text-gray-600 dark:text-gray-300 text-sm font-medium">Inventory</p>
            <p className="text-2xl font-semibold text-gray-800 dark:text-white">{inventoryCount.toLocaleString()}</p>
          </div>
          <FaWarehouse className="text-[#f58c55] dark:text-[#f7a16b] text-4xl" />
        </motion.div>
      </motion.div>

      <motion.div 
        className="grid grid-cols-1 lg:grid-cols-2 gap-6"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.4 }}
      >
        <motion.div 
          className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm p-6 rounded-2xl shadow-lg border border-gray-200/50 dark:border-gray-700/50"
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.3, delay: 0.7 }}
        >
          <h2 className="text-xl font-semibold text-gray-800 dark:text-white mb-4">Sales Analytics</h2>
          <div className="h-[300px] bg-gradient-to-br from-[#f58c55]/10 to-[#f47a45]/10 dark:from-[#f7a16b]/10 dark:to-[#f58c55]/10 rounded-xl flex items-center justify-center">
            <p className="text-gray-600 dark:text-gray-300 font-medium">Chart Coming Soon</p>
          </div>
        </motion.div>

        <motion.div 
          className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm p-6 rounded-2xl shadow-lg border border-gray-200/50 dark:border-gray-700/50"
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.3, delay: 0.8 }}
        >
          <h2 className="text-xl font-semibold text-gray-800 dark:text-white mb-4">Recent Orders</h2>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-200/50 dark:border-gray-700/50">
                  <th className="py-3 text-left text-gray-800 dark:text-gray-200 font-semibold">Order ID</th>
                  <th className="py-3 text-left text-gray-800 dark:text-gray-200 font-semibold">Customer</th>
                  <th className="py-3 text-left text-gray-800 dark:text-gray-200 font-semibold">Amount</th>
                  <th className="py-3 text-left text-gray-800 dark:text-gray-200 font-semibold">Status</th>
                </tr>
              </thead>
              <tbody>
                {orders.slice(0, 4).map((order, index) => (
                  <tr key={order._id} className="border-b border-gray-200/50 dark:border-gray-700/50 hover:bg-gradient-to-r hover:from-[#f58c55]/5 hover:to-[#f47a45]/5 dark:hover:from-[#f7a16b]/5 dark:hover:to-[#f58c55]/5 transition-all duration-300">
                    <td className="py-3 font-medium text-gray-600 dark:text-gray-300">#{order._id.slice(-3)}</td>
                    <td className="py-3 text-gray-600 dark:text-gray-300">₦{order.totalAmount?.toLocaleString() || '0'}</td>
                    <td className="py-3 text-gray-600 dark:text-gray-300">
                      <span className={`px-3 py-1 text-xs rounded-full font-medium ${
                        order.status === 'delivered' ? 'bg-green-100/80 dark:bg-green-900/30 text-green-800 dark:text-green-300' :
                        order.status === 'pending' ? 'bg-yellow-100/80 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-300' :
                        'bg-blue-100/80 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300'
                      }`}>
                        {order.status || 'Processing'}
                      </span>
                    </td>
                  </tr>
                ))}
                {orders.length === 0 && (
                  <tr>
                    <td colSpan={4} className="py-4 text-center text-gray-600 dark:text-gray-300">
                      No orders found
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </motion.div>
      </motion.div>
    </div>
  );
};

export default AdminDashboard;
