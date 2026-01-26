'use client';

import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FaCheckCircle, FaExclamationCircle, FaInfoCircle, FaTimes } from 'react-icons/fa';

export type NotificationType = 'success' | 'error' | 'info' | 'warning';

export interface Notification {
  id: string;
  type: NotificationType;
  message: string;
  duration?: number; // in milliseconds, 0 means don't auto-close
}

interface NotificationToastProps {
  notification: Notification | null;
  onClose: () => void;
}

const NotificationToast: React.FC<NotificationToastProps> = ({
  notification,
  onClose,
}) => {
  useEffect(() => {
    if (!notification || notification.duration === 0) return;

    const timer = setTimeout(onClose, notification.duration || 4000);
    return () => clearTimeout(timer);
  }, [notification, onClose]);

  if (!notification) return null;

  const typeConfig = {
    success: {
      bg: 'bg-green-50 dark:bg-green-900/30',
      border: 'border-green-200 dark:border-green-800',
      text: 'text-green-800 dark:text-green-200',
      icon: 'text-green-500',
      Icon: FaCheckCircle,
    },
    error: {
      bg: 'bg-red-50 dark:bg-red-900/30',
      border: 'border-red-200 dark:border-red-800',
      text: 'text-red-800 dark:text-red-200',
      icon: 'text-red-500',
      Icon: FaExclamationCircle,
    },
    warning: {
      bg: 'bg-yellow-50 dark:bg-yellow-900/30',
      border: 'border-yellow-200 dark:border-yellow-800',
      text: 'text-yellow-800 dark:text-yellow-200',
      icon: 'text-yellow-500',
      Icon: FaExclamationCircle,
    },
    info: {
      bg: 'bg-blue-50 dark:bg-blue-900/30',
      border: 'border-blue-200 dark:border-blue-800',
      text: 'text-blue-800 dark:text-blue-200',
      icon: 'text-blue-500',
      Icon: FaInfoCircle,
    },
  };

  const config = typeConfig[notification.type];
  const IconComponent = config.Icon;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: -20, x: 20 }}
        animate={{ opacity: 1, y: 0, x: 0 }}
        exit={{ opacity: 0, y: -20, x: 20 }}
        transition={{ duration: 0.3 }}
        className={`fixed top-4 right-4 max-w-md z-[9999] ${config.bg} border ${config.border} rounded-lg p-4 shadow-lg`}
      >
        <div className="flex items-start space-x-3">
          <IconComponent className={`text-xl flex-shrink-0 mt-0.5 ${config.icon}`} />
          <div className="flex-1">
            <p className={`font-semibold ${config.text}`}>{notification.message}</p>
          </div>
          <button
            onClick={onClose}
            className={`flex-shrink-0 ${config.text} hover:opacity-70 transition-opacity`}
          >
            <FaTimes className="text-lg" />
          </button>
        </div>

        {/* Progress bar */}
        {notification.duration && notification.duration > 0 && (
          <motion.div
            initial={{ scaleX: 1 }}
            animate={{ scaleX: 0 }}
            transition={{ duration: notification.duration / 1000, ease: 'linear' }}
            className={`absolute bottom-0 left-0 h-1 origin-left ${
              notification.type === 'success'
                ? 'bg-green-500'
                : notification.type === 'error'
                ? 'bg-red-500'
                : notification.type === 'warning'
                ? 'bg-yellow-500'
                : 'bg-blue-500'
            }`}
          />
        )}
      </motion.div>
    </AnimatePresence>
  );
};

export default NotificationToast;
