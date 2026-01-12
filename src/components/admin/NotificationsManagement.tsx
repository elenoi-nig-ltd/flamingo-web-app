'use client';

import { useState } from 'react';
import { useNotifications } from '@/hooks/useNotifications';
import { useAuth } from '@/hooks/useAuth';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FaBell,
  FaCheck,
  FaCheckDouble,
  FaTrash,
  FaTimes,
  FaInfoCircle,
  FaExclamationTriangle,
  FaExclamationCircle,
  FaCheckCircle,
  FaShoppingCart,
  FaCreditCard,
  FaUser,
  FaCog,
  FaBox,
  FaWarehouse,
  FaHome,
  FaWifi,
} from 'react-icons/fa';
import { DashboardSkeleton } from '../ui/SkeletonLoader';

const NotificationsManagement = () => {
  const { user, loading: authLoading } = useAuth();
  const {
    notifications,
    unreadCount,
    loading: notificationsLoading,
    error: notificationsError,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    deleteAllNotifications,
    refetchNotifications,
  } = useNotifications();

  const [showDeleteModal, setShowDeleteModal] = useState<boolean>(false);
  const [notificationToDelete, setNotificationToDelete] = useState<string | null>(null);
  const [showDeleteAllModal, setShowDeleteAllModal] = useState<boolean>(false);
  const [filterType, setFilterType] = useState<string>('all');
  const [filterRead, setFilterRead] = useState<string>('all');

  const getTypeIcon = (type: string) => {
    const iconMap: Record<string, React.ReactElement> = {
      order: <FaShoppingCart />,
      payment: <FaCreditCard />,
      user: <FaUser />,
      system: <FaCog />,
      product: <FaBox />,
      inventory: <FaWarehouse />,
      'real-estate': <FaHome />,
      internet: <FaWifi />,
    };
    return iconMap[type] || <FaBell />;
  };

  const getPriorityIcon = (priority: string) => {
    const iconMap: Record<string, React.ReactElement> = {
      info: <FaInfoCircle className="text-blue-500" />,
      success: <FaCheckCircle className="text-green-500" />,
      warning: <FaExclamationTriangle className="text-yellow-500" />,
      error: <FaExclamationCircle className="text-red-500" />,
    };
    return iconMap[priority] || iconMap.info;
  };

  const getPriorityColor = (priority: string) => {
    const colorMap: Record<string, string> = {
      info: 'bg-blue-50 border-blue-200',
      success: 'bg-green-50 border-green-200',
      warning: 'bg-yellow-50 border-yellow-200',
      error: 'bg-red-50 border-red-200',
    };
    return colorMap[priority] || colorMap.info;
  };

  const handleMarkAsRead = async (id: string) => {
    try {
      await markAsRead(id);
    } catch (error: any) {
      alert('Failed to mark as read: ' + error.message);
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      await markAllAsRead();
    } catch (error: any) {
      alert('Failed to mark all as read: ' + error.message);
    }
  };

  const handleDelete = (id: string) => {
    setNotificationToDelete(id);
    setShowDeleteModal(true);
  };

  const confirmDelete = async () => {
    if (!notificationToDelete) return;

    try {
      await deleteNotification(notificationToDelete);
      setShowDeleteModal(false);
      setNotificationToDelete(null);
    } catch (error: any) {
      alert('Failed to delete notification: ' + error.message);
    }
  };

  const handleDeleteAll = () => {
    setShowDeleteAllModal(true);
  };

  const confirmDeleteAll = async () => {
    try {
      await deleteAllNotifications();
      setShowDeleteAllModal(false);
    } catch (error: any) {
      alert('Failed to delete all notifications: ' + error.message);
    }
  };

  const filteredNotifications = notifications.filter((notif) => {
    if (filterType !== 'all' && notif.type !== filterType) return false;
    if (filterRead === 'read' && !notif.isRead) return false;
    if (filterRead === 'unread' && notif.isRead) return false;
    return true;
  });

  if (authLoading || notificationsLoading) {
    return <DashboardSkeleton />;
  }

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Authentication Required</h2>
          <p className="text-gray-600">Please log in to access notifications.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex justify-between items-start mb-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">Notifications</h1>
              <p className="text-gray-600">
                {unreadCount > 0 ? (
                  <span className="text-orange-600 font-semibold">{unreadCount} unread notification{unreadCount > 1 ? 's' : ''}</span>
                ) : (
                  'All caught up!'
                )}
              </p>
            </div>
            <div className="flex space-x-2">
              {unreadCount > 0 && (
                <button
                  onClick={handleMarkAllAsRead}
                  className="flex items-center px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
                >
                  <FaCheckDouble className="mr-2" />
                  Mark All Read
                </button>
              )}
              {notifications.length > 0 && (
                <button
                  onClick={handleDeleteAll}
                  className="flex items-center px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
                >
                  <FaTrash className="mr-2" />
                  Clear All
                </button>
              )}
            </div>
          </div>

          {/* Filters */}
          <div className="flex flex-wrap gap-4 bg-white p-4 rounded-lg shadow-sm">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Filter by Type</label>
              <select
                value={filterType}
                onChange={(e) => setFilterType(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
              >
                <option value="all">All Types</option>
                <option value="order">Orders</option>
                <option value="payment">Payments</option>
                <option value="user">Users</option>
                <option value="product">Products</option>
                <option value="inventory">Inventory</option>
                <option value="real-estate">Real Estate</option>
                <option value="internet">Internet</option>
                <option value="system">System</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Filter by Status</label>
              <select
                value={filterRead}
                onChange={(e) => setFilterRead(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
              >
                <option value="all">All</option>
                <option value="unread">Unread Only</option>
                <option value="read">Read Only</option>
              </select>
            </div>
          </div>
        </div>

        {/* Notifications List */}
        <div className="space-y-4">
          {notificationsError && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
              {notificationsError}
            </div>
          )}

          {filteredNotifications.length === 0 ? (
            <div className="bg-white rounded-lg shadow-sm p-12 text-center">
              <FaBell className="mx-auto text-6xl text-gray-300 mb-4" />
              <p className="text-gray-500 text-lg">No notifications to display</p>
            </div>
          ) : (
            filteredNotifications.map((notification) => (
              <motion.div
                key={notification._id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className={`border rounded-lg p-4 hover:shadow-md transition-shadow ${
                  !notification.isRead ? 'bg-orange-50 border-orange-200' : getPriorityColor(notification.priority)
                }`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-start space-x-4 flex-1">
                    <div className="text-3xl mt-1">
                      {getTypeIcon(notification.type)}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-1">
                        <h3 className="text-lg font-semibold text-gray-900">{notification.title}</h3>
                        {getPriorityIcon(notification.priority)}
                        <span className="px-2 py-1 text-xs font-medium bg-gray-200 text-gray-700 rounded">
                          {notification.type}
                        </span>
                        {!notification.isRead && (
                          <span className="px-2 py-1 text-xs font-medium bg-orange-500 text-white rounded">
                            NEW
                          </span>
                        )}
                      </div>
                      <p className="text-gray-700 mb-2">{notification.message}</p>
                      {notification.metadata && Object.keys(notification.metadata).length > 0 && (
                        <div className="bg-white rounded p-3 mt-2 text-sm">
                          <p className="font-semibold text-gray-700 mb-2">Details:</p>
                          <dl className="grid grid-cols-2 gap-2">
                            {Object.entries(notification.metadata).map(([key, value]) => (
                              <div key={key}>
                                <dt className="text-gray-600 font-medium">{key}:</dt>
                                <dd className="text-gray-900">{String(value)}</dd>
                              </div>
                            ))}
                          </dl>
                        </div>
                      )}
                      <p className="text-sm text-gray-500 mt-2">
                        {new Date(notification.createdAt).toLocaleString()}
                      </p>
                    </div>
                  </div>

                  <div className="flex space-x-2 ml-4">
                    {!notification.isRead && (
                      <button
                        onClick={() => handleMarkAsRead(notification._id)}
                        className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                        title="Mark as read"
                      >
                        <FaCheck />
                      </button>
                    )}
                    <button
                      onClick={() => handleDelete(notification._id)}
                      className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                      title="Delete"
                    >
                      <FaTrash />
                    </button>
                  </div>
                </div>
              </motion.div>
            ))
          )}
        </div>

        {/* Delete Confirmation Modal */}
        <AnimatePresence>
          {showDeleteModal && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
              onClick={() => setShowDeleteModal(false)}
            >
              <motion.div
                initial={{ scale: 0.9 }}
                animate={{ scale: 1 }}
                exit={{ scale: 0.9 }}
                className="bg-white rounded-lg p-6 max-w-md w-full"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-xl font-bold text-gray-900">Delete Notification</h3>
                  <button onClick={() => setShowDeleteModal(false)} className="text-gray-400 hover:text-gray-600">
                    <FaTimes />
                  </button>
                </div>
                <p className="text-gray-600 mb-6">
                  Are you sure you want to delete this notification? This action cannot be undone.
                </p>
                <div className="flex space-x-3">
                  <button
                    onClick={confirmDelete}
                    className="flex-1 bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600 transition-colors"
                  >
                    Delete
                  </button>
                  <button
                    onClick={() => setShowDeleteModal(false)}
                    className="flex-1 border border-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Delete All Confirmation Modal */}
        <AnimatePresence>
          {showDeleteAllModal && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
              onClick={() => setShowDeleteAllModal(false)}
            >
              <motion.div
                initial={{ scale: 0.9 }}
                animate={{ scale: 1 }}
                exit={{ scale: 0.9 }}
                className="bg-white rounded-lg p-6 max-w-md w-full"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-xl font-bold text-gray-900">Clear All Notifications</h3>
                  <button onClick={() => setShowDeleteAllModal(false)} className="text-gray-400 hover:text-gray-600">
                    <FaTimes />
                  </button>
                </div>
                <p className="text-gray-600 mb-6">
                  Are you sure you want to delete ALL notifications? This action cannot be undone.
                </p>
                <div className="flex space-x-3">
                  <button
                    onClick={confirmDeleteAll}
                    className="flex-1 bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600 transition-colors"
                  >
                    Delete All
                  </button>
                  <button
                    onClick={() => setShowDeleteAllModal(false)}
                    className="flex-1 border border-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default NotificationsManagement;
