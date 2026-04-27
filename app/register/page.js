'use client';
import { useState } from 'react';
import Link from 'next/link';

export default function RegisterPage() {
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    password: '',
    role: 'Patient' // Default role
  });

  const handleSubmit = async (e) => {
      e.preventDefault();
      
      // We use fetch to send our JSON data to the C# URL
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL ?? ''}/api/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });

      const data = await response.json();
      alert(data.message); // This will show the message sent from C#!
    };

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center font-sans">
      <div className="bg-white p-10 rounded-xl shadow-lg max-w-md w-full">
        <h1 className="text-3xl font-bold text-red-600 mb-2">MediCare+</h1>
        <h2 className="text-xl font-bold text-black mb-6">Create an Account</h2>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-black mb-1">Full Name</label>
            <input type="text" required
              onChange={(e) => setFormData({...formData, fullName: e.target.value})}
              className="w-full border border-gray-300 rounded-lg p-3 outline-none focus:border-red-500 text-black" />
          </div>
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
          <div>
            <label className="block text-sm font-medium text-black mb-1">I am a...</label>
            <select 
              onChange={(e) => setFormData({...formData, role: e.target.value})}
              className="w-full border border-gray-300 rounded-lg p-3 outline-none focus:border-red-500 text-black">
              <option value="Patient">Patient</option>
              <option value="Doctor">Doctor</option>
              <option value="Receptionist">Receptionist</option>
            </select>
          </div>
          
          <button type="submit" className="w-full bg-red-600 hover:bg-red-700 text-white font-bold py-3 rounded-lg mt-4">
            Register
          </button>
        </form>
        <p className="mt-4 text-center text-sm text-gray-600">
          Already have an account? <Link href="/login" className="text-red-600 hover:underline">Log in</Link>
        </p>
      </div>
    </div>
  );
}