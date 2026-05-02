'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { APPOINTMENT_STATUS } from '@/utils/constants';

export default function SchedulePage() {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('today');
  const [actionMsg, setActionMsg] = useState('');
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');

  useEffect(() => {
    fetchAppointments();
  }, []);

  const fetchAppointments = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const res = await fetch('http://localhost:5230/api/doctor/appointments', {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) setAppointments(await res.json());
    } catch (err) {
      console.error('Schedule fetch error:', err);
    } finally {
      setLoading(false);
    }
  };

  const today = new Date().toISOString().split('T')[0];

  const applyFilters = (list) => {
    let result = list;
    if (search.trim()) {
      const q = search.toLowerCase();
      result = result.filter(
        (a) =>
          a.patientName?.toLowerCase().includes(q) ||
          a.reason?.toLowerCase().includes(q),
      );
    }
    if (statusFilter !== 'All') {
      result = result.filter((a) => a.status === statusFilter);
    }
    return result;
  };

  const todayList = applyFilters(
    appointments.filter((a) => String(a.appointmentDate).startsWith(today)),
  );
  const upcomingList = applyFilters(
    appointments.filter(
      (a) =>
        !String(a.appointmentDate).startsWith(today) &&
        (a.status === APPOINTMENT_STATUS.PENDING ||
          a.status === APPOINTMENT_STATUS.CONFIRMED),
    ),
  );
  const historyList = applyFilters(
    appointments.filter(
      (a) =>
        a.status === APPOINTMENT_STATUS.COMPLETED ||
        a.status === APPOINTMENT_STATUS.CANCELLED,
    ),
  );

  const handleStatusChange = async (appointmentId, newStatus) => {
    const label = newStatus === 'Completed' ? 'complete' : 'cancel';
    if (!confirm(`Are you sure you want to ${label} this appointment?`)) return;

    try {
      const token = localStorage.getItem('token');
      const res = await fetch(
        `http://localhost:5230/api/doctor/appointments/${appointmentId}/status`,
        {
          method: 'PATCH',
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ status: newStatus }),
        },
      );

      if (res.ok) {
        setActionMsg(
          `Appointment marked as ${newStatus}. Patient has been notified via SMS.`,
        );
        await fetchAppointments();
        setTimeout(() => setActionMsg(''), 4000);
      } else {
        const err = await res.json();
        alert(err.message || 'Failed to update status.');
      }
    } catch (err) {
      console.error('Status update error:', err);
      alert('Could not connect to server.');
    }
  };

  const formatTime = (timeStr) => {
    try {
      return new Date(`2000-01-01T${timeStr}`).toLocaleTimeString('en-MY', {
        hour: '2-digit',
        minute: '2-digit',
      });
    } catch {
      return timeStr;
    }
  };

  const formatDate = (dateStr) => {
    try {
      return new Date(dateStr).toLocaleDateString('en-MY', {
        weekday: 'short',
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      });
    } catch {
      return dateStr;
    }
  };

  if (loading)
    return (
      <div className="p-10 text-center font-bold text-gray-400 animate-pulse">
        Loading schedule...
      </div>
    );

  const tabs = [
    { key: 'today', label: `Today (${todayList.length})` },
    { key: 'upcoming', label: `Upcoming (${upcomingList.length})` },
    { key: 'history', label: `History (${historyList.length})` },
  ];

  const activeList =
    activeTab === 'today'
      ? todayList
      : activeTab === 'upcoming'
        ? upcomingList
        : historyList;

  return (
    <div className="p-10 max-w-4xl mx-auto">
      <h2 className="text-3xl font-black text-gray-900 tracking-tight mb-2">
        My Schedule
      </h2>
      <p className="text-gray-500 font-medium mb-6">
        Manage your appointments and update their status.
      </p>

      {actionMsg && (
        <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-xl text-green-700 font-semibold text-sm">
          ✅ {actionMsg}
        </div>
      )}

      {/* SEARCH + FILTER */}
      <div className="flex gap-3 mb-6">
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search by patient name or reason..."
          className="flex-1 bg-white border border-gray-200 rounded-xl px-4 py-3 text-gray-800 font-medium outline-none focus:ring-2 focus:ring-red-500 transition-all shadow-sm"
        />
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="bg-white border border-gray-200 rounded-xl px-4 py-3 text-gray-700 font-semibold outline-none focus:ring-2 focus:ring-red-500 transition-all shadow-sm"
        >
          {['All', 'Pending', 'Confirmed', 'Completed', 'Cancelled'].map((s) => (
            <option key={s}>{s}</option>
          ))}
        </select>
      </div>

      {/* TABS */}
      <div className="flex gap-2 mb-6">
        {tabs.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`px-5 py-2.5 rounded-xl text-sm font-black uppercase tracking-widest transition-all ${
              activeTab === tab.key
                ? 'bg-red-600 text-white shadow-md'
                : 'bg-white text-gray-500 border border-gray-200 hover:border-red-300'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* LIST */}
      <div className="space-y-4">
        {activeList.length === 0 ? (
          <div className="bg-gray-50 text-gray-400 p-8 rounded-2xl text-center font-bold border border-gray-100">
            {search || statusFilter !== 'All'
              ? 'No appointments match your filters.'
              : `No appointments in this section.`}
          </div>
        ) : (
          activeList.map((a) => (
            <div
              key={a.appointmentId}
              className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow"
            >
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-1">
                    <p className="text-xl font-black text-gray-900">
                      {a.patientName || 'Patient'}
                    </p>
                    <StatusBadge status={a.status} />
                  </div>
                  <p className="text-gray-500 font-medium text-sm">
                    {a.reason || 'General Visit'}
                  </p>
                  <p className="text-red-600 font-bold text-sm mt-2">
                    📅 {formatDate(a.appointmentDate)} · 🕐{' '}
                    {formatTime(a.appointmentTime)}
                  </p>
                  {a.patientPhone && (
                    <p className="text-gray-400 text-xs mt-1">
                      📱 {a.patientPhone}
                    </p>
                  )}
                </div>

                <div className="flex flex-col gap-2 ml-4">
                  <Link href={`/doctor/schedule/detail?id=${a.appointmentId}`}>
                    <button className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl text-xs font-bold transition-colors w-full">
                      View / Notes
                    </button>
                  </Link>
                  {a.status !== APPOINTMENT_STATUS.COMPLETED &&
                    a.status !== APPOINTMENT_STATUS.CANCELLED && (
                      <>
                        <button
                          onClick={() =>
                            handleStatusChange(a.appointmentId, 'Completed')
                          }
                          className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-xl text-xs font-bold transition-colors"
                        >
                          ✓ Complete
                        </button>
                        <button
                          onClick={() =>
                            handleStatusChange(a.appointmentId, 'Cancelled')
                          }
                          className="px-4 py-2 border border-red-200 text-red-500 hover:bg-red-50 rounded-xl text-xs font-bold transition-colors"
                        >
                          ✕ Cancel
                        </button>
                      </>
                    )}
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

function StatusBadge({ status }) {
  const map = {
    Pending: 'bg-orange-50 text-orange-600',
    Confirmed: 'bg-green-50 text-green-700',
    Completed: 'bg-blue-50 text-blue-700',
    Cancelled: 'bg-gray-100 text-gray-500',
  };
  return (
    <span
      className={`text-[10px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full ${map[status] || 'bg-gray-100 text-gray-500'}`}
    >
      {status}
    </span>
  );
}
