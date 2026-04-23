'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';

export default function DoctorDashboard() {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [doctorName, setDoctorName] = useState('Doctor');

  useEffect(() => {
    const stored = localStorage.getItem('user');
    if (stored) setDoctorName(JSON.parse(stored).fullName || 'Doctor');
    fetchAppointments();
  }, []);

  const fetchAppointments = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch('http://localhost:5230/api/doctor/appointments', {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) setAppointments(await res.json());
    } catch (err) {
      console.error('Dashboard fetch error:', err);
    } finally {
      setLoading(false);
    }
  };

  const today = new Date().toISOString().split('T')[0];
  const todayList = appointments.filter((a) =>
    String(a.appointmentDate).startsWith(today),
  );
  const upcoming = appointments
    .filter((a) => a.status === 'Pending' || a.status === 'Confirmed')
    .sort((a, b) => new Date(a.appointmentDate) - new Date(b.appointmentDate))
    .slice(0, 5);

  const stats = {
    today: todayList.length,
    pending: appointments.filter((a) => a.status === 'Pending').length,
    completed: appointments.filter((a) => a.status === 'Completed').length,
  };

  const formatDateTime = (dateStr, timeStr) => {
    try {
      return new Date(`${dateStr}T${timeStr}`).toLocaleDateString('en-MY', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
    } catch {
      return `${dateStr} ${timeStr}`;
    }
  };

  if (loading)
    return (
      <div className="p-10 text-center font-bold text-gray-400 animate-pulse">
        Loading dashboard...
      </div>
    );

  return (
    <div className="p-10 max-w-7xl mx-auto">
      {/* HEADER */}
      <header className="mb-10 flex justify-between items-center">
        <div>
          <h2 className="text-4xl font-bold text-gray-800 tracking-tight">
            Welcome, Dr. {doctorName}
          </h2>
          <p className="text-gray-500 mt-1">
            Here is your clinic overview for today.
          </p>
        </div>
        <Link href="/doctor/schedule">
          <button className="bg-red-600 hover:bg-red-700 text-white px-6 py-3 rounded-xl font-bold shadow-sm transition-all active:scale-95">
            View My Schedule
          </button>
        </Link>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* LEFT COLUMN */}
        <div className="lg:col-span-2 space-y-6">
          {/* UPCOMING APPOINTMENTS */}
          <div className="bg-white p-8 rounded-2xl shadow-sm border-l-4 border-red-600">
            <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-4 font-mono">
              UPCOMING APPOINTMENTS
            </h3>
            {upcoming.length === 0 ? (
              <p className="text-gray-400 italic py-4">
                No upcoming appointments.
              </p>
            ) : (
              <div className="space-y-3">
                {upcoming.map((a) => (
                  <Link
                    href={`/doctor/schedule/${a.appointmentId}`}
                    key={a.appointmentId}
                  >
                    <div className="flex justify-between items-center p-4 bg-gray-50 rounded-xl hover:bg-red-50 transition-colors cursor-pointer">
                      <div>
                        <p className="font-bold text-gray-800">
                          {a.patientName || 'Patient'}
                        </p>
                        <p className="text-sm text-gray-500 mt-0.5">
                          {a.reason || 'General Visit'}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-bold text-red-600">
                          {formatDateTime(a.appointmentDate, a.appointmentTime)}
                        </p>
                        <span
                          className={`text-[10px] font-black uppercase px-2 py-0.5 rounded-full ${
                            a.status === 'Confirmed'
                              ? 'bg-green-50 text-green-700'
                              : 'bg-orange-50 text-orange-600'
                          }`}
                        >
                          {a.status}
                        </span>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            )}
            <div className="mt-4">
              <Link
                href="/doctor/schedule"
                className="text-red-600 hover:underline font-bold text-sm"
              >
                View full schedule →
              </Link>
            </div>
          </div>

          {/* QUICK LINKS */}
          <div className="grid grid-cols-2 gap-4">
            <Link href="/doctor/patients">
              <div className="bg-gray-50 p-6 rounded-2xl border border-gray-100 hover:shadow-md transition-shadow cursor-pointer">
                <p className="text-2xl mb-2">👥</p>
                <p className="font-bold text-gray-800">My Patients</p>
                <p className="text-sm text-gray-500 mt-1">
                  View patient records
                </p>
              </div>
            </Link>
            <Link href="/doctor/prescriptions">
              <div className="bg-gray-50 p-6 rounded-2xl border border-gray-100 hover:shadow-md transition-shadow cursor-pointer">
                <p className="text-2xl mb-2">💊</p>
                <p className="font-bold text-gray-800">Prescriptions</p>
                <p className="text-sm text-gray-500 mt-1">
                  View issued prescriptions
                </p>
              </div>
            </Link>
          </div>
        </div>

        {/* RIGHT COLUMN — STATS */}
        <div className="space-y-6">
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-50">
            <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-6 font-mono">
              TODAY'S STATS
            </h3>
            <ul className="space-y-4">
              <StatItem
                label="Today's appointments"
                value={stats.today}
                color="text-red-600"
              />
              <StatItem
                label="Pending"
                value={stats.pending}
                color="text-orange-500"
              />
              <StatItem
                label="Completed"
                value={stats.completed}
                color="text-green-600"
              />
            </ul>
          </div>

          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-50">
            <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-4 font-mono">
              QUICK LINKS
            </h3>
            <nav className="flex flex-col gap-3">
              <Link
                href="/doctor/schedule"
                className="text-gray-600 hover:text-red-600 font-bold text-sm transition-colors"
              >
                My Schedule
              </Link>
              <Link
                href="/doctor/patients"
                className="text-gray-600 hover:text-red-600 font-bold text-sm transition-colors"
              >
                Patient Records
              </Link>
              <Link
                href="/doctor/profile"
                className="text-gray-600 hover:text-red-600 font-bold text-sm transition-colors"
              >
                Edit Profile
              </Link>
            </nav>
          </div>
        </div>
      </div>
    </div>
  );
}

function StatItem({ label, value, color }) {
  return (
    <li className="flex justify-between items-center border-b border-gray-50 pb-2">
      <span className="text-gray-600 text-sm">{label}</span>
      <span className={`${color} font-bold text-lg`}>{value}</span>
    </li>
  );
}
