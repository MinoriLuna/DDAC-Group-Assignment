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
    

    // --- ADD THIS CHECK HERE ---
    if (!response.ok) {
        const errorText = await response.text(); // Read as text, not JSON
        console.error("Server Error:", errorText);
        alert(`Error ${response.status}: ${errorText || "Something went wrong"}`);
        return;
    }

    const data = await response.json();
    if (response.ok) {
      // --- REDIRECT LOGIC BASED ON ROLE ---
      if (data.user.role === 'Doctor') {
        router.push('/doctor');
      } else if (data.user.role === 'Patient') {
        router.push('/patient');
      } else if (data.user.role === 'Receptionist') {
        router.push('/receptionist');
      } else if (data.user.role === 'Admin') {
        router.push('/admin');
      }
    } else {
      alert(data.message);
    }
    
  } catch (err) {
    console.error("Fetch failed:", err);
    alert("Could not connect to the backend server. Is it running?");
  }
};

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center font-sans">
      <div className="bg-white p-10 rounded-xl shadow-lg max-w-md w-full border border-gray-100">
        <h1 className="text-3xl font-bold text-red-600 mb-2">MediCare+</h1>
        <h2 className="text-xl font-bold text-black mb-6">Log in to your account</h2>
        
        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-black mb-1">Email</label>
            <input type="email" required
              onChange={(e) => setFormData({...formData, email: e.target.value})}
              className="w-full border border-gray-300 rounded-lg p-3 outline-none focus:border-red-500 text-black" />
          </div>
          <div>
            <label className="block text-sm font-medium text-black mb-1">Password</label>
            <input type="password" required
              onChange={(e) => setFormData({...formData, password: e.target.value})}
              className="w-full border border-gray-300 rounded-lg p-3 outline-none focus:border-red-500 text-black" />
          </div>
          
          <button type="submit" className="w-full bg-red-600 hover:bg-red-700 text-white font-bold py-3 rounded-lg mt-4 transition-all shadow-md">
            Log In
          </button>
        </form>
        <p className="mt-6 text-center text-sm text-gray-600">
          Don't have an account? <Link href="/register" className="text-red-600 hover:underline font-bold">Register here</Link>
        </p>
      </div>
    </div>
  );
}