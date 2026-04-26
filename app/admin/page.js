'use client';
import { useState, useEffect } from 'react';

export default function AdminDashboard() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const token = localStorage.getItem('token');
        const res = await fetch('http://localhost:5230/api/admin/stats', {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (res.ok) {
          const data = await res.json();
          setStats(data);
        }
      } catch (err) {
        console.error('Failed to fetch admin stats:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  if (loading) return <div className="text-red-600 font-bold">Loading dashboard...</div>;
  if (!stats) return (
    <div className="bg-red-50 border border-red-200 rounded-2xl p-6 text-sm text-red-700">
      <p className="font-bold mb-1">Failed to load dashboard stats.</p>
      <p>Make sure the backend is running: <code className="bg-red-100 px-1 rounded">dotnet run</code> inside the <code className="bg-red-100 px-1 rounded">backend/</code> folder.</p>
    </div>
  );

  return (
    <div className="max-w-7xl mx-auto">

      {/* HEADER */}
      <header className="mb-6 sm:mb-10">
        <h2 className="text-2xl sm:text-4xl font-bold text-gray-800 tracking-tight">Admin Dashboard</h2>
        <p className="text-gray-500 mt-1 text-sm sm:text-base">Clinic overview at a glance.</p>
      </header>

      {/* STAT CARDS */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6 mb-6 sm:mb-10">
        <StatCard label="Total Patients"        value={stats.totalPatients} />
        <StatCard label="Total Doctors"         value={stats.totalDoctors} />
        <StatCard label="Pending"               value={stats.pendingAppointments} highlight />
        <StatCard label="Today's Appointments"  value={stats.todaysAppointments} />
      </div>

      {/* RECENT APPOINTMENTS — table on md+, cards on mobile */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100">
        <div className="p-4 sm:p-6 border-b border-gray-100">
          <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider font-mono">Recent Appointments</h3>
        </div>

        {/* TABLE — hidden on small screens */}
        <div className="hidden md:block overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 text-gray-400 uppercase text-xs font-bold tracking-wider">
              <tr>
                <th className="px-6 py-3 text-left">Patient</th>
                <th className="px-6 py-3 text-left">Doctor</th>
                <th className="px-6 py-3 text-left">Date</th>
                <th className="px-6 py-3 text-left">Reason</th>
                <th className="px-6 py-3 text-left">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {stats.recentAppointments.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-8 text-center text-gray-400 italic">No appointments yet.</td>
                </tr>
              ) : (
                stats.recentAppointments.map((appt) => (
                  <tr key={appt.appointmentId} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 font-semibold text-gray-800">{appt.patientName}</td>
                    <td className="px-6 py-4 text-gray-600">{appt.doctorName}</td>
                    <td className="px-6 py-4 text-gray-600">{appt.appointmentDate}</td>
                    <td className="px-6 py-4 text-gray-600">{appt.reason || '—'}</td>
                    <td className="px-6 py-4"><StatusBadge status={appt.status} /></td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* CARDS — shown on small screens only */}
        <div className="md:hidden divide-y divide-gray-100">
          {stats.recentAppointments.length === 0 ? (
            <p className="px-4 py-8 text-center text-gray-400 italic text-sm">No appointments yet.</p>
          ) : (
            stats.recentAppointments.map((appt) => (
              <div key={appt.appointmentId} className="p-4 space-y-1">
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-gray-800 text-sm">{appt.patientName}</span>
                  <StatusBadge status={appt.status} />
                </div>
                <p className="text-xs text-gray-500">Doctor: {appt.doctorName}</p>
                <p className="text-xs text-gray-500">Date: {appt.appointmentDate}</p>
                {appt.reason && <p className="text-xs text-gray-500">Reason: {appt.reason}</p>}
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}

function StatCard({ label, value, highlight }) {
  return (
    <div className={`bg-white p-4 sm:p-6 rounded-2xl shadow-sm border ${highlight ? 'border-l-4 border-red-500' : 'border-gray-100'}`}>
      <p className="text-xs font-bold text-gray-400 uppercase tracking-wider font-mono leading-tight">{label}</p>
      <p className="text-3xl sm:text-4xl font-black text-gray-800 mt-2">{value}</p>
    </div>
  );
}

function StatusBadge({ status }) {
  const styles = {
    Pending:        'bg-yellow-100 text-yellow-700',
    Confirmed:      'bg-blue-100 text-blue-700',
    InConsultation: 'bg-purple-100 text-purple-700',
    Completed:      'bg-green-100 text-green-700',
    Cancelled:      'bg-red-100 text-red-600',
  };
  return (
    <span className={`px-3 py-1 rounded-full text-xs font-bold ${styles[status] || 'bg-gray-100 text-gray-600'}`}>
      {status}
    </span>
  );
}
