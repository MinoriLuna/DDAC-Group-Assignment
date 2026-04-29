'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

// SVG Icons
const CalendarIcon = () => <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>;
const CheckIcon = () => <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" /></svg>;
const VaultIcon = () => <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg>;
const ArrowIcon = () => <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>;
const HistoryIcon = () => <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 2m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>;
const BookIcon = () => <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C6.5 6.253 2 10.998 2 16.5S6.5 26.747 12 26.747s10-4.745 10-10.247S17.5 6.253 12 6.253z" /></svg>;

export default function PatientDashboard() {
  const [appointments, setAppointments] = useState([]);
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [userName, setUserName] = useState('Patient');

  // Get user name from localStorage
  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      const user = JSON.parse(storedUser);
      setUserName(user.fullName || 'Patient');
    }
  }, []);

  // Fetch appointments
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

  // Fetch documents count - disabled until endpoint is fixed
  // useEffect(() => {
  //   const fetchDocuments = async () => {
  //     try {
  //       const token = localStorage.getItem('token');
  //       const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL ?? ''}/api/medicaldocument/mine`, {
  //         headers: { 'Authorization': `Bearer ${token}` }
  //       });
  //       if (res.ok) {
  //         try {
  //           const data = await res.json();
  //           setDocuments(data || []);
  //         } catch (parseErr) {
  //           setDocuments([]);
  //         }
  //       } else {
  //         setDocuments([]);
  //       }
  //     } catch (err) {
  //       setDocuments([]);
  //     }
  //   };
  //   fetchDocuments();
  // }, []);

  // Get next appointment
  const nextAppt = appointments
    .filter(a => a.status === 'Pending')
    .sort((a, b) => new Date(a.appointmentDate) - new Date(b.appointmentDate))[0];

  // Get stats
  const stats = {
    pending: appointments.filter(a => a.status === 'Pending').length,
    completed: appointments.filter(a => a.status === 'Completed').length,
    cancelled: appointments.filter(a => a.status === 'Cancelled').length,
    total: appointments.length,
    documents: documents.length,
  };

  if (loading) return <div className="p-10 text-center"><div className="inline-block animate-pulse text-gray-500 font-bold">Loading your dashboard...</div></div>;

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100">
      <div className="max-w-7xl mx-auto p-10">
        {/* HEADER */}
        <header className="mb-10 flex justify-between items-center flex-col md:flex-row gap-6 animate-fade-in">
          <div className="flex-1">
            <h2 className="text-4xl font-black text-gray-900 tracking-tight mb-2">
              Welcome back, <span className="bg-gradient-to-r from-red-600 to-red-500 bg-clip-text text-transparent">{userName}</span>
            </h2>
            <p className="text-gray-600 text-lg">Here's your health dashboard at a glance</p>
          </div>
          <Link href="/patient/booking">
            <button className="bg-gradient-to-r from-red-600 to-red-500 hover:from-red-700 hover:to-red-600 text-white px-8 py-4 rounded-xl font-bold shadow-lg hover:shadow-xl transition-all active:scale-95 transform whitespace-nowrap flex items-center gap-2 animate-slide-up">
              <CalendarIcon />
              Book Appointment
            </button>
          </Link>
        </header>

        {/* STATS GRID */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* LEFT COLUMN */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* NEXT APPOINTMENT CARD */}
          <div className="bg-gradient-to-br from-white to-red-50 p-8 rounded-2xl shadow-sm border-l-4 border-red-600 hover:shadow-lg transition-all duration-300 animate-fade-in" style={{animationDelay: '0.1s'}}>
            <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-4 font-mono flex items-center gap-2">
              <div className="p-1.5 bg-red-100 rounded-lg">
                <CalendarIcon className="w-4 h-4 text-red-600" />
              </div>
              NEXT APPOINTMENT
            </h3>
            
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
              <Link href="/patient/appointments" className="bg-red-50 text-red-600 hover:bg-red-100 px-5 py-2 rounded-lg text-sm font-bold transition-all duration-200 hover:scale-105 flex items-center gap-2">
                <HistoryIcon className="w-4 h-4" />
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
          <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-6 rounded-2xl shadow-sm border border-blue-200 flex justify-between items-center hover:shadow-lg transition-all duration-300 hover:scale-105 animate-fade-in" style={{animationDelay: '0.2s'}}>
            <div>
              <div className="flex items-center gap-3 mb-2">
                <div className="p-2 bg-blue-200 rounded-lg">
                  <VaultIcon className="w-5 h-5 text-blue-600" />
                </div>
                <h3 className="font-bold text-gray-800 text-lg">Medical Document Vault</h3>
              </div>
              <p className="text-gray-600 mt-1 text-sm">Securely store and manage your S3 medical records.</p>
            </div>
            <Link href="/patient/documents">
                <button className="bg-white border border-blue-200 hover:border-blue-400 text-blue-600 hover:text-blue-700 px-6 py-2 rounded-lg text-sm font-bold transition-all shadow-sm hover:shadow-md flex items-center gap-2">
                Manage
                <ArrowIcon />
                </button>
            </Link>
          </div>
        </div>
        </div>
        {/* RIGHT COLUMN (Takes up 1/3 of the screen) */}
        <div className="grid grid-cols-2 gap-6 mt-4">
          
          {/* QUICK STATS */}
          <div className="bg-gradient-to-br from-white to-purple-50 p-6 rounded-2xl shadow-sm border border-purple-100 hover:shadow-lg transition-all duration-300 animate-fade-in" style={{animationDelay: '0.3s'}}>
            <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-6 font-mono flex items-center gap-2">
              <div className="p-1.5 bg-purple-100 rounded-lg">
                <CheckIcon className="w-4 h-4 text-purple-600" />
              </div>
              QUICK STATS
            </h3>
            <ul className="space-y-4">
              <StatItem label="Total Appointments" value={stats.total} color="bg-purple-100 text-purple-600" />
              <StatItem label="Pending Bookings" value={stats.pending} color="bg-orange-100 text-orange-600" />
              <StatItem label="Completed" value={stats.completed} color="bg-green-100 text-green-600" />
            </ul>
          </div>

          {/* DOCUMENT & MORE STATS */}
          <div className="bg-gradient-to-br from-white to-blue-50 p-6 rounded-2xl shadow-sm border border-blue-100 hover:shadow-lg transition-all duration-300 animate-fade-in" style={{animationDelay: '0.4s'}}>
            <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-6 font-mono flex items-center gap-2">
              <div className="p-1.5 bg-blue-100 rounded-lg">
                <VaultIcon className="w-4 h-4 text-blue-600" />
              </div>
              VAULT & ACTIVITY
            </h3>
            <ul className="space-y-4">
              <StatItem label="Documents Uploaded" value={stats.documents} color="bg-blue-100 text-blue-600" />
              <StatItem label="Cancelled Appointments" value={stats.cancelled} color="bg-red-100 text-red-600" isCritical />
              <li className="border-b border-gray-50 pb-2 pt-2">
                <Link href="/patient/rating" className="text-red-600 hover:text-red-700 text-sm font-bold transition-colors flex items-center gap-2 duration-200">
                  Leave a Review
                  <ArrowIcon />
                </Link>
              </li>
            </ul>
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