'use client';
import { useEffect, useState } from 'react';

const STATUSES = ['All', 'Pending', 'Confirmed', 'CheckedIn', 'InConsultation', 'Completed', 'Cancelled'];

const STATUS_STYLES = {
  Pending:       'bg-yellow-100 text-yellow-700',
  Confirmed:     'bg-blue-100 text-blue-700',
  CheckedIn:     'bg-cyan-100 text-cyan-700',
  InConsultation:'bg-purple-100 text-purple-700',
  Completed:     'bg-green-100 text-green-700',
  Cancelled:     'bg-red-100 text-red-600',
};

export default function AdminAppointmentsPage() {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading]           = useState(true);
  const [error, setError]               = useState(null);
  const [filter, setFilter]             = useState('All');
  const [updating, setUpdating]         = useState(null); // appointmentId being updated

  useEffect(() => {
    fetchAppointments();
  }, []);

  const fetchAppointments = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL ?? ''}/api/admin/appointments`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        setAppointments(await res.json());
      } else {
        const err = await res.json().catch(() => ({ message: `HTTP ${res.status}` }));
        setError(err.message || `HTTP ${res.status}`);
      }
    } catch (err) {
      setError('Backend is offline. Run dotnet run in the backend/ folder.');
    } finally {
      setLoading(false);
    }
  };

  const updateStatus = async (id, newStatus) => {
    setUpdating(id);
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL ?? ''}/api/admin/appointments/${id}/status`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ status: newStatus })
      });
      if (res.ok) {
        setAppointments(prev =>
          prev.map(a => a.appointmentId === id ? { ...a, status: newStatus } : a)
        );
      }
    } catch (err) {
      console.error('Failed to update status:', err);
    } finally {
      setUpdating(null);
    }
  };

  const formatDateTime = (dateStr, timeStr) => {
    try {
      const d = new Date(`${dateStr}T${timeStr}`);
      return d.toLocaleDateString('en-MY', { month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit' });
    } catch { return `${dateStr} ${timeStr}`; }
  };

  const filtered = filter === 'All' ? appointments : appointments.filter(a => a.status === filter);

  const counts = STATUSES.reduce((acc, s) => {
    acc[s] = s === 'All' ? appointments.length : appointments.filter(a => a.status === s).length;
    return acc;
  }, {});

  if (loading) return <div className="text-red-600 font-bold">Loading appointments...</div>;
  if (error) return (
    <div className="bg-red-50 border border-red-200 rounded-2xl p-6 text-sm text-red-700">
      <p className="font-bold mb-1">Failed to load appointments.</p>
      <p>{error}</p>
    </div>
  );

  return (
    <div className="max-w-7xl mx-auto">

      {/* HEADER */}
      <header className="mb-6">
        <h2 className="text-2xl sm:text-4xl font-bold text-gray-800 tracking-tight">Appointments</h2>
        <p className="text-gray-500 mt-1 text-sm">Manage all clinic appointments.</p>
      </header>

      {/* FILTER TABS */}
      <div className="flex gap-2 flex-wrap mb-6">
        {STATUSES.map(s => (
          <button
            key={s}
            onClick={() => setFilter(s)}
            className={`px-4 py-2 rounded-xl text-sm font-bold transition-all ${
              filter === s
                ? 'bg-red-600 text-white shadow-sm'
                : 'bg-white text-gray-500 border border-gray-200 hover:border-red-300 hover:text-red-600'
            }`}
          >
            {s}
            <span className={`ml-2 px-1.5 py-0.5 rounded-full text-xs ${filter === s ? 'bg-red-500' : 'bg-gray-100 text-gray-500'}`}>
              {counts[s]}
            </span>
          </button>
        ))}
      </div>

      {/* TABLE — desktop */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100">
        <div className="hidden md:block overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 text-gray-400 uppercase text-xs font-bold tracking-wider">
              <tr>
                <th className="px-6 py-3 text-left">Patient</th>
                <th className="px-6 py-3 text-left">Doctor</th>
                <th className="px-6 py-3 text-left">Date & Time</th>
                <th className="px-6 py-3 text-left">Reason</th>
                <th className="px-6 py-3 text-left">Status</th>
                <th className="px-6 py-3 text-left">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-10 text-center text-gray-400 italic">
                    No appointments found.
                  </td>
                </tr>
              ) : (
                filtered.map(appt => (
                  <tr key={appt.appointmentId} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 font-semibold text-gray-800">{appt.patientName}</td>
                    <td className="px-6 py-4 text-gray-600">{appt.doctorName}</td>
                    <td className="px-6 py-4 text-gray-600 whitespace-nowrap">
                      {formatDateTime(appt.appointmentDate, appt.appointmentTime)}
                    </td>
                    <td className="px-6 py-4 text-gray-600">{appt.reason || '—'}</td>
                    <td className="px-6 py-4">
                      <span className={`px-3 py-1 rounded-full text-xs font-bold ${STATUS_STYLES[appt.status] || 'bg-gray-100 text-gray-600'}`}>
                        {appt.status}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <ActionButtons
                        appt={appt}
                        updating={updating}
                        onUpdate={updateStatus}
                      />
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* CARDS — mobile */}
        <div className="md:hidden divide-y divide-gray-100">
          {filtered.length === 0 ? (
            <p className="px-4 py-10 text-center text-gray-400 italic text-sm">No appointments found.</p>
          ) : (
            filtered.map(appt => (
              <div key={appt.appointmentId} className="p-4 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-gray-800 text-sm">{appt.patientName}</span>
                  <span className={`px-3 py-1 rounded-full text-xs font-bold ${STATUS_STYLES[appt.status] || 'bg-gray-100 text-gray-600'}`}>
                    {appt.status}
                  </span>
                </div>
                <p className="text-xs text-gray-500">Doctor: {appt.doctorName}</p>
                <p className="text-xs text-gray-500">{formatDateTime(appt.appointmentDate, appt.appointmentTime)}</p>
                {appt.reason && <p className="text-xs text-gray-500">Reason: {appt.reason}</p>}
                <div className="pt-1">
                  <ActionButtons appt={appt} updating={updating} onUpdate={updateStatus} />
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}

function ActionButtons({ appt, updating, onUpdate }) {
  const isUpdating = updating === appt.appointmentId;

  if (appt.status === 'Pending') {
    return (
      <div className="flex gap-2 flex-wrap">
        <ActionBtn onClick={() => onUpdate(appt.appointmentId, 'Confirmed')} disabled={isUpdating} color="blue">
          Confirm
        </ActionBtn>
        <ActionBtn onClick={() => onUpdate(appt.appointmentId, 'Cancelled')} disabled={isUpdating} color="red">
          Cancel
        </ActionBtn>
      </div>
    );
  }
  if (appt.status === 'Confirmed') {
    return (
      <div className="flex gap-2 flex-wrap">
        <ActionBtn onClick={() => onUpdate(appt.appointmentId, 'Completed')} disabled={isUpdating} color="green">
          Complete
        </ActionBtn>
        <ActionBtn onClick={() => onUpdate(appt.appointmentId, 'Cancelled')} disabled={isUpdating} color="red">
          Cancel
        </ActionBtn>
      </div>
    );
  }
  return <span className="text-xs text-gray-400 italic">—</span>;
}

function ActionBtn({ children, onClick, disabled, color }) {
  const colors = {
    blue:  'bg-blue-50 text-blue-700 hover:bg-blue-100',
    green: 'bg-green-50 text-green-700 hover:bg-green-100',
    red:   'bg-red-50 text-red-600 hover:bg-red-100',
  };
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors disabled:opacity-50 ${colors[color]}`}
    >
      {disabled ? '...' : children}
    </button>
  );
}
