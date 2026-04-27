'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

export default function PatientDashboard() {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);

  // 1. Fetch live data from your existing endpoint
  useEffect(() => {
    const fetchAppointments = async () => {
      try {
        const token = localStorage.getItem('token');
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL ?? ''}/api/appointment/mine`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (res.ok) {
          const data = await res.json();
          setAppointments(data);
        }
      } catch (err) {
        console.error("Dashboard fetch error:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchAppointments();
  }, []);

  // 2. Logic to find the "Next" appointment (Closest Pending one)
  const nextAppt = appointments
    .filter(a => a.status === 'Pending')
    .sort((a, b) => new Date(a.appointmentDate) - new Date(b.appointmentDate))[0];

  // 3. Logic for the Quick Stats
  const stats = {
    pending: appointments.filter(a => a.status === 'Pending').length,
    completed: appointments.filter(a => a.status === 'Completed').length,
    cancelled: appointments.filter(a => a.status === 'Cancelled').length,
  };

  if (loading) return <div className="p-10 text-red-600 font-bold">Loading your health journey...</div>;

  return (
    <div className="p-10 max-w-7xl mx-auto">
      {/* HEADER */}
      <header className="mb-10 flex justify-between items-center">
        <div>
          <h2 className="text-4xl font-bold text-gray-800 tracking-tight">Welcome back, Ashton</h2>
          <p className="text-gray-500 mt-1">Here is a summary of your health journey.</p>
        </div>
        <Link href="/patient/booking">
          <button className="bg-red-600 hover:bg-red-700 text-white px-6 py-3 rounded-lg font-bold shadow-sm transition-all active:scale-95">
            + Book Appointment
          </button>
        </Link>
      </header>

      {/* DASHBOARD GRID*/}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* LEFT COLUMN */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* NEXT APPOINTMENT CARD */}
          <div className="bg-white p-8 rounded-2xl shadow-sm border-l-4 border-red-600 ">
            <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-4 font-mono">NEXT APPOINTMENT</h3>
            
            {nextAppt ? (
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-3xl font-bold text-gray-800">{nextAppt.reason}</p>
                  <p className="text-gray-600 mt-1">with <span className="font-semibold text-gray-800">{nextAppt.doctorName}</span></p>
                </div>
                <div className="text-right">
                  <p className="text-2xl font-bold text-red-600 tracking-tight">{nextAppt.appointmentDate}</p>
                  <p className="text-gray-400 text-sm">
                    {new Date(`2000-01-01T${nextAppt.appointmentTime}`).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })}</p>
                </div>
              </div>
            ) : (
              <p className="text-gray-400 py-4 italic">No upcoming appointments scheduled.</p>
            )}

            <div className="py-4 flex gap-4">
              <Link href="/patient/appointments" className="bg-red-50 text-red-600 hover:bg-red-100 px-5 py-2 rounded-lg text-sm font-bold transition-colors">
                View All History
              </Link>
              {nextAppt && (
                <button className="text-gray-400 hover:text-red-600 px-4 py-2 text-sm font-bold transition-colors">
                  Cancel
                </button>
              )}
            </div>
          </div>

          {/* MEDICAL VAULT CARD */}
          <div className="bg-gray-50 p-6 rounded-2xl shadow-sm border border-gray-100 flex justify-between items-center">
            <div>
              <h3 className="font-bold text-gray-800 text-lg">Medical Document Vault</h3>
              <p className="text-gray-500 mt-1 text-sm">Securely store and manage your S3 medical records.</p>
            </div>
            <Link href="/patient/documents">
                <button className="bg-white border border-gray-200 hover:border-red-600 text-gray-700 hover:text-red-600 px-6 py-2 rounded-lg text-sm font-bold transition-all shadow-sm">
                Manage Docs
                </button>
            </Link>
          </div>
        </div>

        {/* RIGHT COLUMN (Takes up 1/3 of the screen) */}
        <div className="grid grid-cols-2 gap-6">
          
          {/* QUICK STATS */}
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-50">
            <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-6 font-mono">QUICK STATS</h3>
            <ul className="space-y-4">
              <StatItem label="Pending Bookings" value={stats.pending} />
              <StatItem label="Completed" value={stats.completed} />
              <StatItem label="Cancelled" value={stats.cancelled} isCritical />
            </ul>
          </div>

          {/* QUICK LINKS */}
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-50">
            <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-6 font-mono">QUICK LINKS</h3>
            <nav className="flex flex-col gap-3">
              <Link href="/patient/profile" className="text-gray-600 hover:text-red-600 font-bold text-sm transition-colors">My Profile</Link>
              <Link href="/patient/history" className="text-gray-600 hover:text-red-600 font-bold text-sm transition-colors">Lab Results</Link>
              <button className="text-left text-red-600 hover:underline font-black text-sm">Log Out</button>
            </nav>
          </div>

        </div>
      </div>
    </div>
  );
}

// Small helper for the stat list items
function StatItem({ label, value, color }) {
  return (
    <li className="flex justify-between items-center border-b border-gray-50 pb-2">
      <span className="text-gray-600">{label}</span>
      <span className={`${color} font-bold px-2 py-1 rounded-full text-xs`}>
        {value}
      </span>
    </li>
  );
}