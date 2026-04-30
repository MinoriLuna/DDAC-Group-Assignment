'use client';
import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useNotification } from '@/hooks/useNotification';

export default function RegisterPage() {
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    password: '',
    role: 'Patient' // Default role
  });
  const router = useRouter();
  const { showNotification } = useNotification();

  const handleSubmit = async (e) => {
      e.preventDefault();

      try {
        // We use fetch to send our JSON data to the C# URL
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL ?? ''}/api/auth/register`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(formData)
        });

        const data = await response.json();

        if (response.ok) {
          showNotification(data.message, 'success');
          // Redirect to login after successful registration
          setTimeout(() => router.push('/login'), 1500);
        } else {
          showNotification(data.message, 'error');
        }
      } catch (err) {
        console.error("Fetch failed:", err);
        showNotification("Backend is offline. Run 'dotnet run' in your backend folder!", "error");
      }
    };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-red-50 flex items-center justify-center font-sans relative overflow-hidden">
      {/* Back button */}
      <Link href="/" className="absolute top-6 left-6 flex items-center gap-2 text-gray-600 hover:text-red-600 font-semibold transition-colors z-50">
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
        </svg>
        Back Home
      </Link>

      {/* Animated background */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-blue-200/20 rounded-full blur-3xl translate-x-1/2 -translate-y-1/2 animate-pulse"></div>
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-red-200/20 rounded-full blur-3xl -translate-x-1/2 translate-y-1/2 animate-pulse" style={{animationDelay: '1s'}}></div>

      <div className="bg-white/90 backdrop-blur-sm p-10 rounded-2xl shadow-2xl max-w-md w-full border border-white/20 relative z-10">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-black bg-gradient-to-r from-red-600 to-red-500 bg-clip-text text-transparent mb-2">
            MediCare<span className="text-black">+</span>
          </h1>
          <p className="text-sm text-gray-500 font-medium">Join our healthcare platform</p>
        </div>

        <h2 className="text-2xl font-bold text-gray-800 mb-2">Create Account</h2>
        <p className="text-gray-500 text-sm mb-8">Sign up to get started</p>
        
        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="space-y-2">
            <label className="block text-sm font-semibold text-gray-700">Full Name</label>
            <input type="text" required
              onChange={(e) => setFormData({...formData, fullName: e.target.value})}
              className="w-full border-2 border-gray-200 rounded-xl p-3 outline-none focus:border-red-500 focus:ring-2 focus:ring-red-200 text-black transition-all"
              placeholder="John Doe" />
          </div>
          <div className="space-y-2">
            <label className="block text-sm font-semibold text-gray-700">Email Address</label>
            <input type="email" required
              onChange={(e) => setFormData({...formData, email: e.target.value})}
              className="w-full border-2 border-gray-200 rounded-xl p-3 outline-none focus:border-red-500 focus:ring-2 focus:ring-red-200 text-black transition-all"
              placeholder="john@example.com" />
          </div>
          <div className="space-y-2">
            <label className="block text-sm font-semibold text-gray-700">Password</label>
            <input type="password" required
              onChange={(e) => setFormData({...formData, password: e.target.value})}
              className="w-full border-2 border-gray-200 rounded-xl p-3 outline-none focus:border-red-500 focus:ring-2 focus:ring-red-200 text-black transition-all"
              placeholder="••••••••" />
          </div>
          <div className="space-y-2">
            <label className="block text-sm font-semibold text-gray-700">Account Type</label>
            <select
              onChange={(e) => setFormData({...formData, role: e.target.value})}
              className="w-full border-2 border-gray-200 rounded-xl p-3 outline-none focus:border-red-500 focus:ring-2 focus:ring-red-200 text-black transition-all">
              <option value="Patient">👤 Patient</option>
              <option value="Doctor">👨‍⚕️ Doctor</option>
              <option value="Receptionist">📱 Receptionist</option>
            </select>
          </div>

          <button type="submit" className="w-full bg-gradient-to-r from-red-600 to-red-500 hover:from-red-700 hover:to-red-600 text-white font-bold py-3 rounded-xl mt-6 transition-all shadow-lg hover:shadow-xl active:scale-95">
            Create Account
          </button>
        </form>
        <p className="mt-8 text-center text-sm text-gray-600">
          Already have an account?{' '}
          <Link href="/login" className="text-red-600 hover:text-red-700 font-bold transition-colors">
            Sign in here
          </Link>
        </p>
      </div>
    </div>
  );
}