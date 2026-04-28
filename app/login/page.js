'use client';
import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useNotification } from '@/hooks/useNotification';

export default function LoginPage() {
  const [formData, setFormData] = useState({ email: '', password: '' });
  const router = useRouter();
  const { showNotification } = useNotification();

  const handleLogin = async (e) => {
    e.preventDefault();

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL ?? ''}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });

      // Error check
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ message: "Server error" }));
        showNotification(errorData.message || "Invalid credentials", "error");
        return;
      }
      const data = await response.json();

      // adding JWT into memory (cookies)
      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));

      console.log("---> JWT Saved to LocalStorage");

      // Redirect based on role
      const role = data.user.role;
      if (role === 'Doctor') {
        router.push('/doctor');
      } else if (role === 'Patient') {
        router.push('/patient');
      } else if (role === 'Receptionist') {
        router.push('/receptionist');
      } else if (role === 'Admin') {
        router.push('/admin');
      } else {
        router.push('/'); // Fallback
      }

    } catch (err) {
      console.error("Fetch failed:", err);
      showNotification("Backend is offline. Run 'dotnet run' in your backend folder!", "error");
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 via-white to-blue-50 flex items-center justify-center font-sans relative overflow-hidden">
      {/* Back button */}
      <Link href="/" className="absolute top-6 left-6 flex items-center gap-2 text-gray-600 hover:text-red-600 font-semibold transition-colors z-50">
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
        </svg>
        Back Home
      </Link>

      {/* Animated background elements */}
      <div className="absolute top-0 left-0 w-96 h-96 bg-red-200/20 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2 animate-pulse"></div>
      <div className="absolute bottom-0 right-0 w-96 h-96 bg-blue-200/20 rounded-full blur-3xl translate-x-1/2 translate-y-1/2 animate-pulse" style={{animationDelay: '1s'}}></div>

      <div className="bg-white/90 backdrop-blur-sm p-10 rounded-2xl shadow-2xl max-w-md w-full border border-white/20 relative z-10 transform transition-all hover:shadow-2xl">
        {/* Logo */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-black bg-gradient-to-r from-red-600 to-red-500 bg-clip-text text-transparent mb-2">
            MediCare<span className="text-black">+</span>
          </h1>
          <p className="text-sm text-gray-500 font-medium">Healthcare Management System</p>
        </div>

        {/* Title */}
        <h2 className="text-2xl font-bold text-gray-800 mb-2">Welcome Back</h2>
        <p className="text-gray-500 text-sm mb-8">Sign in to your account to continue</p>

        <form onSubmit={handleLogin} className="space-y-5">
          <div className="space-y-2">
            <label className="block text-sm font-semibold text-gray-700">Email Address</label>
            <div className="relative">
              <input type="email" required
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="w-full border-2 border-gray-200 rounded-xl p-3 outline-none focus:border-red-500 focus:ring-2 focus:ring-red-200 text-black transition-all placeholder-gray-400"
                placeholder="ashton@gmail.com" />
              <svg className="absolute right-3 top-3.5 w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
            </div>
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-semibold text-gray-700">Password</label>
            <div className="relative">
              <input type="password" required
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                className="w-full border-2 border-gray-200 rounded-xl p-3 outline-none focus:border-red-500 focus:ring-2 focus:ring-red-200 text-black transition-all placeholder-gray-400"
                placeholder="••••••••" />
              <svg className="absolute right-3 top-3.5 w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
            </div>
          </div>

          <button type="submit" className="w-full bg-gradient-to-r from-red-600 to-red-500 hover:from-red-700 hover:to-red-600 text-white font-bold py-3 rounded-xl mt-6 transition-all shadow-lg hover:shadow-xl active:scale-95 transform">
            Sign In
          </button>
        </form>

        <p className="mt-8 text-center text-sm text-gray-600">
          Don't have an account?{' '}
          <Link href="/register" className="text-red-600 hover:text-red-700 font-bold transition-colors">
            Sign up here
          </Link>
        </p>
      </div>
    </div>
  );
}