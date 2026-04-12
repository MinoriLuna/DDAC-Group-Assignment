'use client';
import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function LoginPage() {
  const [formData, setFormData] = useState({ email: '', password: '' });
  const router = useRouter();

  const handleLogin = async (e) => {
    e.preventDefault();

    try {
      const response = await fetch('http://localhost:5230/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });

      // Error check
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ message: "Server error" }));
        alert(errorData.message || "Invalid credentials");
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
      alert("Backend is offline. Run 'dotnet run' in your backend folder!");
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center font-sans">
      <div className="bg-white p-10 rounded-xl shadow-lg max-w-md w-full border border-gray-100">
        <h1 className="text-3xl font-bold text-red-600 mb-2 font-sans tracking-tight">MediCare<span className="text-black">+</span></h1>
        <h2 className="text-xl font-bold text-black mb-6">Log in to your account</h2>

        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-1">Email</label>
            <input type="email" required
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              className="w-full border border-gray-300 rounded-lg p-3 outline-none focus:ring-2 focus:ring-red-500 text-black transition-all" 
              placeholder="e.g. ashton@gmail.com" />
          </div>
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-1">Password</label>
            <input type="password" required
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              className="w-full border border-gray-300 rounded-lg p-3 outline-none focus:ring-2 focus:ring-red-500 text-black transition-all" 
              placeholder="••••••••" />
          </div>

          <button type="submit" className="w-full bg-red-600 hover:bg-red-700 text-white font-bold py-3.5 rounded-lg mt-4 transition-all shadow-md active:scale-95">
            Log In
          </button>
        </form>
        
        <p className="mt-6 text-center text-sm text-gray-500">
          Don't have an account? <Link href="/register" className="text-red-600 hover:underline font-bold">Register here</Link>
        </p>
      </div>
    </div>
  );
}