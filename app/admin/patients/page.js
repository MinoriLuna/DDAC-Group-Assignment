'use client';
import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { useNotification } from '@/hooks/useNotification';

export default function AdminPatientsPage() {
  const [patients, setPatients]   = useState([]);
  const [loading, setLoading]     = useState(true);
  const [error, setError]         = useState(null);
  const [search, setSearch]       = useState('');
  const [selected, setSelected]   = useState(null);
  const { showNotification } = useNotification();

  useEffect(() => {
    const fetchPatients = async () => {
      try {
        const token = localStorage.getItem('token');
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL ?? ''}/api/admin/patients`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (res.ok) {
          setPatients(await res.json());
          setError(null);
        } else {
          const err = await res.json().catch(() => ({ message: `HTTP ${res.status}` }));
          const errMsg = err.message || `HTTP ${res.status}`;
          setError(errMsg);
          showNotification(`Failed to load patients: ${errMsg}`, "error");
        }
      } catch (err) {
        const errMsg = 'Backend is offline. Run dotnet run in the backend/ folder.';
        setError(errMsg);
        showNotification(errMsg, "error");
      } finally {
        setLoading(false);
      }
    };
    fetchPatients();
  }, [showNotification]);

  const filtered = patients.filter(p =>
    p.fullName?.toLowerCase().includes(search.toLowerCase()) ||
    p.email?.toLowerCase().includes(search.toLowerCase()) ||
    p.phone?.includes(search)
  );

  if (loading) return <div className="text-red-600 font-bold">Loading patients...</div>;
  if (error) return (
    <div className="bg-red-50 border border-red-200 rounded-2xl p-6 text-sm text-red-700">
      <p className="font-bold mb-1">Failed to load patients.</p>
      <p>{error}</p>
    </div>
  );

  return (
    <div className="max-w-7xl mx-auto">

      {/* HEADER */}
      <header className="mb-6">
        <h2 className="text-2xl sm:text-4xl font-bold text-gray-800 tracking-tight">Patients</h2>
        <p className="text-gray-500 mt-1 text-sm">All registered patients.</p>
      </header>

      {/* SEARCH + COUNT */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
        <input
          type="text"
          placeholder="Search by name, email or phone..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="w-full sm:w-80 border border-gray-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-red-400 transition-colors"
        />
        <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">
          {filtered.length} of {patients.length} patients
        </span>
      </div>

      {/* TABLE — desktop */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100">
        <div className="hidden md:block overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 text-gray-400 uppercase text-xs font-bold tracking-wider">
              <tr>
                <th className="px-6 py-3 text-left">Name</th>
                <th className="px-6 py-3 text-left">Email</th>
                <th className="px-6 py-3 text-left">Phone</th>
                <th className="px-6 py-3 text-left">Joined</th>
                <th className="px-6 py-3 text-left">Appointments</th>
                <th className="px-6 py-3 text-left">Details</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-10 text-center text-gray-400 italic">
                    No patients found.
                  </td>
                </tr>
              ) : (
                filtered.map(p => (
                  <tr key={p.userId} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 font-semibold text-gray-800">{p.fullName}</td>
                    <td className="px-6 py-4 text-gray-600">{p.email}</td>
                    <td className="px-6 py-4 text-gray-500">{p.phone || '—'}</td>
                    <td className="px-6 py-4 text-gray-500">{p.joinedAt}</td>
                    <td className="px-6 py-4">
                      <span className="bg-red-50 text-red-600 px-2 py-1 rounded-full text-xs font-bold">
                        {p.totalAppointments} visits
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <button
                        onClick={() => setSelected(p)}
                        className="px-3 py-1.5 bg-gray-50 hover:bg-red-50 text-gray-600 hover:text-red-600 border border-gray-200 hover:border-red-200 rounded-lg text-xs font-bold transition-all"
                      >
                        View
                      </button>
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
            <p className="px-4 py-10 text-center text-gray-400 italic text-sm">No patients found.</p>
          ) : (
            filtered.map(p => (
              <div key={p.userId} className="p-4 space-y-1">
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-gray-800 text-sm">{p.fullName}</span>
                  <button
                    onClick={() => setSelected(p)}
                    className="px-3 py-1 bg-gray-50 hover:bg-red-50 text-gray-600 hover:text-red-600 border border-gray-200 rounded-lg text-xs font-bold transition-all"
                  >
                    View
                  </button>
                </div>
                <p className="text-xs text-gray-500">{p.email}</p>
                <p className="text-xs text-gray-500">{p.phone || 'No phone'} · Joined {p.joinedAt}</p>
                <span className="inline-block bg-red-50 text-red-600 px-2 py-0.5 rounded-full text-xs font-bold">
                  {p.totalAppointments} visits
                </span>
              </div>
            ))
          )}
        </div>
      </div>

      {/* DETAIL MODAL */}
      {selected && (
        <PatientModal patient={selected} onClose={() => setSelected(null)} />
      )}
    </div>
  );
}

function PatientModal({ patient, onClose }) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  if (!mounted) return null;

  return createPortal(
    <div
      style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.4)', zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' }}
      onClick={onClose}
    >
      <div
        className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6 space-y-4"
        style={{ position: 'relative', zIndex: 10000 }}
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-bold text-gray-800">Patient Details</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-xl font-bold">✕</button>
        </div>

        {/* Avatar + name */}
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-full bg-red-100 flex items-center justify-center text-red-600 text-xl font-black">
            {patient.fullName?.[0]?.toUpperCase()}
          </div>
          <div>
            <p className="font-bold text-gray-800 text-lg">{patient.fullName}</p>
            <p className="text-sm text-gray-500">{patient.email}</p>
          </div>
        </div>

        <hr className="border-gray-100" />

        {/* Details */}
        <div className="space-y-3 text-sm">
          <DetailRow label="Phone"            value={patient.phone || 'Not provided'} />
          <DetailRow label="Address"          value={patient.address || 'Not provided'} />
          <DetailRow label="Joined"           value={patient.joinedAt} />
          <DetailRow label="Total Visits"     value={`${patient.totalAppointments} appointments`} />
          <DetailRow label="Last Appointment" value={patient.lastAppointment || 'None'} />
        </div>
      </div>
    </div>,
    document.getElementById('modal-root')
  );
}

function DetailRow({ label, value }) {
  return (
    <div className="flex justify-between gap-4">
      <span className="text-gray-400 font-semibold shrink-0">{label}</span>
      <span className="text-gray-700 text-right">{value}</span>
    </div>
  );
}
