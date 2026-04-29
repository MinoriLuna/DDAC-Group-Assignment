'use client';

import { createContext, useState, useCallback } from 'react';

export const ConfirmationContext = createContext();

export function ConfirmationProvider({ children }) {
  const [confirmation, setConfirmation] = useState(null);
  const [isVisible, setIsVisible] = useState(false);

  const showConfirmation = useCallback((message, onConfirm, onCancel) => {
    setConfirmation({ message, onConfirm, onCancel });
    setIsVisible(true);
  }, []);

  const handleConfirm = useCallback(() => {
    if (confirmation?.onConfirm) {
      confirmation.onConfirm();
    }
    setIsVisible(false);
    setTimeout(() => setConfirmation(null), 300);
  }, [confirmation]);

  const handleCancel = useCallback(() => {
    if (confirmation?.onCancel) {
      confirmation.onCancel();
    }
    setIsVisible(false);
    setTimeout(() => setConfirmation(null), 300);
  }, [confirmation]);

  return (
    <ConfirmationContext.Provider value={{ showConfirmation, handleConfirm, handleCancel, confirmation, isVisible }}>
      {children}
    </ConfirmationContext.Provider>
  );
}
