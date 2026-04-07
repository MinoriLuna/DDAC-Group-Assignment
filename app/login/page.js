'use client';
import { useState } from 'react';
import Link from 'next/link';
// We import the router so we can redirect the user after they log in
import { useRouter } from 'next/navigation'; 

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const router = useRouter();

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log("Attempting login with:", email);
    
    // FAKE LOGIN LOGIC (Until we build the backend)
    // If you type "ashton@example.com", it redirects you to your Patient portal!
    if (email.includes('ashton')) {
      alert("Fake login successful! Redirecting to Patient Portal...");
      router.push('/patient');
    } else {
      alert("Imagine ASP.NET verifying this password right now.");
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center font-sans">
      <div className="bg-white p-10 rounded-xl shadow-lg max-w-md w-full">
        <h1 className="text-3xl font-bold text-red-600 mb-2">MediCare+</h1>
        <h2 className="text-xl font-bold text-gray-800 mb-6">Welcome Back</h2>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
            <input type="email" required
              onChange={(e) => setEmail(e.target.value)}
              className="w-full border border-gray-300 rounded-lg p-3 outline-none focus:border-red-500" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
            <input type="password" required
              onChange={(e) => setPassword(e.target.value)}
              className="w-full border border-gray-300 rounded-lg p-3 outline-none focus:border-red-500" />
          </div>
          
          <button type="submit" className="w-full bg-red-600 hover:bg-red-700 text-white font-bold py-3 rounded-lg mt-4">
            Log In
          </button>
        </form>
        <p className="mt-4 text-center text-sm text-gray-600">
          Need an account? <Link href="/register" className="text-red-600 hover:underline">Register here</Link>
        </p>
      </div>
    </div>
  );
}