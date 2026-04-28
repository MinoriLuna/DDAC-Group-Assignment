'use client';

import { useContext } from 'react';
import { ConfirmationContext } from '@/context/ConfirmationContext';

export function useConfirmation() {
  const context = useContext(ConfirmationContext);

  if (!context) {
    throw new Error('useConfirmation must be used within ConfirmationProvider');
  }

  return context;
}
