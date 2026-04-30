'use client';
import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';

export default function AuthGuard({ children }) {
  const router = useRouter();
  const pathname = usePathname();
  const [status, setStatus] = useState('loading');

  useEffect(() => {
    // 1. Helper to find the token
    const getCookie = (name) => {
      const value = `; ${document.cookie}`;
      const parts = value.split(`; ${name}=`);
      if (parts.length === 2) return parts.pop().split(';').shift();
      return null;
    };

    const token = getCookie('token');
    const userStr = localStorage.getItem('user');

    // 2. NORMALIZE PATHS: Remove all leading/trailing slashes
    // Example: "/patient/" becomes "patient"
    const normalizedPath = pathname.toLowerCase().replace(/^\/|\/$/g, "");
    const publicPages = ["", "login", "register"]; // Normalized public routes
    const isPublic = publicPages.includes(normalizedPath);

    console.log(`[DEBUG] Path: "${normalizedPath}" | Token: ${!!token} | User: ${!!userStr}`);

    if (!token || !userStr) {
      if (!isPublic) {
        console.warn("[DEBUG] No credentials. Kicking to home.");
        router.replace('/');
      } else {
        setStatus('authorized');
      }
      return;
    }

    try {
      const user = JSON.parse(userStr);
      const role = user.role.toLowerCase(); // Ensure "Patient" -> "patient"

      // 3. Handle Root Redirect
      if (normalizedPath === "") {
        router.replace(`/${role}`);
        return;
      }

      // 4. Role Authorization (Case-insensitive)
      if (!isPublic && !normalizedPath.startsWith(role)) {
        console.error(`[DEBUG] Role mismatch. User is ${role}, Path is ${normalizedPath}`);
        router.replace(`/${role}`);
      } else {
        setStatus('authorized');
      }
    } catch (e) {
      console.error("[DEBUG] Session error:", e);
      router.replace('/');
    }
  }, [pathname, router]);

  if (status !== 'authorized') {
    return <div className="h-screen flex items-center justify-center font-bold">MediCare+ Auth Check...</div>;
  }

  return children;
}