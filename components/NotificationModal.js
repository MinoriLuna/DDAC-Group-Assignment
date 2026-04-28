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
    <>
      {isVisible && (
        <div className="fixed inset-0 bg-black/30 z-40 transition-opacity duration-300" onClick={hideNotification} />
      )}
      <div
        className={`fixed top-4 right-4 max-w-sm w-full z-50 transition-all duration-300 transform ${
          isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-4 pointer-events-none'
        }`}
      >
        <div className={`${styles.bg} ${styles.border} border rounded-lg shadow-lg p-4 flex items-start gap-3`}>
          <div className={`flex-shrink-0 w-5 h-5 mt-0.5 rounded-full ${styles.icon} flex items-center justify-center text-white`}>
            {notification.type === 'success' && '✓'}
            {notification.type === 'error' && '!'}
            {notification.type === 'warning' && '⚠'}
            {notification.type === 'info' && 'ℹ'}
          </div>
          <div className="flex-1">
            <p className={`${styles.text} font-medium text-sm`}>{notification.message}</p>
          </div>
          <button
            onClick={hideNotification}
            className={`flex-shrink-0 ${styles.icon} hover:opacity-75 transition-opacity`}
          >
            <XMarkIcon className="w-5 h-5" />
          </button>
        </div>
      </div>
    </>
  );
}
