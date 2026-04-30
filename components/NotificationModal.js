'use client';

import { useContext, useEffect } from 'react';
import { NotificationContext } from '@/context/NotificationContext';
import { XMarkIcon } from '@heroicons/react/24/outline';

const typeStyles = {
  success: {
    bg: 'bg-green-50',
    border: 'border-green-200',
    text: 'text-green-800',
    icon: 'text-green-600',
  },
  error: {
    bg: 'bg-red-50',
    border: 'border-red-200',
    text: 'text-red-800',
    icon: 'text-red-600',
  },
  warning: {
    bg: 'bg-yellow-50',
    border: 'border-yellow-200',
    text: 'text-yellow-800',
    icon: 'text-yellow-600',
  },
  info: {
    bg: 'bg-blue-50',
    border: 'border-blue-200',
    text: 'text-blue-800',
    icon: 'text-blue-600',
  },
};

export default function NotificationModal() {
  const { notification, isVisible, hideNotification } = useContext(NotificationContext);

  useEffect(() => {
    if (isVisible) {
      const timer = setTimeout(() => {
        hideNotification();
      }, 4000);
      return () => clearTimeout(timer);
    }
  }, [isVisible, hideNotification]);

  if (!notification) return null;

  const styles = typeStyles[notification.type] || typeStyles.info;

  return (
    <div className="fixed inset-0 pointer-events-none z-50">
      <div
        className={`fixed top-4 right-4 max-w-sm w-full pointer-events-auto transition-all duration-300 transform ${
          isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-4'
        }`}
      >
        <div className={`${styles.bg} ${styles.border} border rounded-lg shadow-2xl p-4 flex items-start gap-3`}>
          <div className={`flex-shrink-0 w-5 h-5 mt-0.5 rounded-full ${styles.icon} flex items-center justify-center text-white font-bold`}>
            {notification.type === 'success' && '✓'}
            {notification.type === 'error' && '!'}
            {notification.type === 'warning' && '⚠'}
            {notification.type === 'info' && 'ℹ'}
          </div>
          <div className="flex-1">
            <p className={`${styles.text} font-medium`}>{notification.message}</p>
          </div>
          <button
            onClick={hideNotification}
            className={`flex-shrink-0 ${styles.icon} hover:opacity-75 transition-opacity`}
          >
            <XMarkIcon className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
}
