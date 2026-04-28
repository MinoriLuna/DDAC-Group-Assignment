'use client';

import { useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';

export default function AuthGuard({ children }) {
  const router = useRouter();
  const pathname = usePathname();

  // Pages that don't need authentication
  const publicPages = ['/login', '/register'];
  const isPublicPage = publicPages.includes(pathname);

  useEffect(() => {
    const token = localStorage.getItem('token');
    const userStr = localStorage.getItem('user');

    // If no token, redirect to home (unless already on public page)
    if (!token || !userStr) {
      if (!isPublicPage) {
        router.push('/');
      }
      return;
    }

    // If has token, parse user and redirect if on public page
    try {
      const user = JSON.parse(userStr);
      const role = user.role;

      // If on login/register page with valid token, redirect to dashboard
      if (isPublicPage) {
        if (role === 'Patient') {
          router.push('/patient');
        } else if (role === 'Doctor') {
          router.push('/doctor');
        } else if (role === 'Admin') {
          router.push('/admin');
        } else if (role === 'Receptionist') {
          router.push('/receptionist');
        } else {
          router.push('/');
        }
      }
    } catch (err) {
      console.error('Failed to parse user:', err);
      if (!isPublicPage) {
        router.push('/');
      }
    }
  }, [pathname, isPublicPage, router]);

  return children;
}
