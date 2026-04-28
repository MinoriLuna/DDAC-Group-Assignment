'use client';

import { useContext } from 'react';
import { ConfirmationContext } from '@/context/ConfirmationContext';

export default function ConfirmationModal() {
  const { confirmation, isVisible, handleConfirm, handleCancel } = useContext(ConfirmationContext);

  if (!confirmation) return null;

  return (
    <>
      {isVisible && (
        <div className="fixed inset-0 bg-black/30 z-40 transition-opacity duration-300" onClick={handleCancel} />
      )}
      <div
        className={`fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-white rounded-2xl shadow-2xl z-50 max-w-sm w-full transition-all duration-300 transform ${
          isVisible ? 'opacity-100 scale-100' : 'opacity-0 scale-95 pointer-events-none'
        }`}
      >
        <div className="p-6">
          <p className="text-gray-800 font-semibold text-center mb-6">{confirmation.message}</p>
          <div className="flex gap-3 justify-end">
            <button
              onClick={handleCancel}
              className="px-5 py-2.5 rounded-lg border border-gray-200 text-gray-700 font-semibold hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleConfirm}
              className="px-5 py-2.5 rounded-lg bg-red-600 text-white font-semibold hover:bg-red-700 transition-colors"
            >
              Delete
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
