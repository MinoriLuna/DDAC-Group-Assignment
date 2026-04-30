'use client';

import { NotificationProvider } from "@/context/NotificationContext";
import { ConfirmationProvider } from "@/context/ConfirmationContext";
import NotificationModal from "@/components/NotificationModal";
import ConfirmationModal from "@/components/ConfirmationModal";
import AuthGuard from "@/components/AuthGuard";

export default function Providers({ children }) {
  return (
    <NotificationProvider>
      <ConfirmationProvider>
        <AuthGuard>
          {children}
          <NotificationModal />
          <ConfirmationModal />
        </AuthGuard>
      </ConfirmationProvider>
    </NotificationProvider>
  );
}
