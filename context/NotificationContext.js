'use client';

import { createContext, useState, useCallback } from 'react';

export const NotificationContext = createContext();

export function NotificationProvider({ children }) {
  const [notification, setNotification] = useState(null);
  const [isVisible, setIsVisible] = useState(false);

  const showNotification = useCallback((message, type = 'info') => {
    setNotification({ message, type });
    setIsVisible(true);
  }, []);

  const hideNotification = useCallback(() => {
    setIsVisible(false);
    // Wait for animation to complete before clearing
    setTimeout(() => setNotification(null), 300);
  }, []);

  return (
    <NotificationContext.Provider value={{ showNotification, hideNotification, notification, isVisible }}>
      {children}
    </NotificationContext.Provider>
  );
}
