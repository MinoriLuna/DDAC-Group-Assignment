'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';

export default function PatientsPage() {
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    const fetchPatients = async () => {
      try {
        const token = localStorage.getItem('token');
        const res = await fetch('http://localhost:5230/api/doctor/patients', {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (res.ok) setPatients(await res.json());
      } catch (err) {
        console.error('Patients fetch error:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchPatients();
  }, []);

  const filtered = patients.filter(
    (p) =>
      p.fullName?.toLowerCase().includes(search.toLowerCase()) ||
      p.email?.toLowerCase().includes(search.toLowerCase()),
  );

  const formatDate = (dateStr) => {
    if (!dateStr) return 'No visits yet';
    try {
      return new Date(dateStr).toLocaleDateString('en-MY', {
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
        Loading patients...
      </div>
    );

  return (
    <div className="p-10 max-w-4xl mx-auto">
      <h2 className="text-3xl font-black text-gray-900 tracking-tight mb-2">
        My Patients
      </h2>
      <p className="text-gray-500 font-medium mb-6">
        Patients who have had appointments with you.
      </p>

      {/* SEARCH */}
      <div className="mb-6">
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search by name or email..."
          className="w-full bg-white border border-gray-200 rounded-xl p-4 text-gray-800 font-medium outline-none focus:ring-2 focus:ring-red-500 transition-all shadow-sm"
        />
      </div>

      {/* PATIENT COUNT */}
      <p className="text-xs font-black text-gray-400 uppercase tracking-widest mb-4">
        {filtered.length} Patient{filtered.length !== 1 ? 's' : ''}
      </p>

      {/* LIST */}
      {filtered.length === 0 ? (
        <div className="bg-gray-50 text-gray-400 p-10 rounded-2xl text-center font-bold border border-gray-100">
          {search ? 'No patients match your search.' : 'No patients found.'}
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((p) => (
            <Link href={`/doctor/patients/${p.patientId}`} key={p.patientId}>
              <div className="bg-white p-6 rounded-2xl border border-gray-100 hover:border-red-200 hover:shadow-md transition-all cursor-pointer flex justify-between items-center">
                <div className="flex items-center gap-4">
                  {/* Avatar initial */}
                  <div className="w-12 h-12 bg-red-50 rounded-full flex items-center justify-center flex-shrink-0">
                    <span className="text-red-600 font-black text-lg">
                      {p.fullName?.charAt(0).toUpperCase() || '?'}
                    </span>
                  </div>
                  <div>
                    <p className="font-bold text-gray-900">{p.fullName}</p>
                    <p className="text-gray-400 text-sm">{p.email}</p>
                    {p.phone && (
                      <p className="text-gray-400 text-xs mt-0.5">
                        📱 {p.phone}
                      </p>
                    )}
                  </div>
                </div>
                <div className="text-right flex-shrink-0 ml-4">
                  <p className="text-xs text-gray-400 font-semibold uppercase tracking-widest">
                    Last visit
                  </p>
                  <p className="text-sm font-bold text-gray-700 mt-0.5">
                    {formatDate(p.lastVisit)}
                  </p>
                  <p className="text-xs text-gray-400 mt-1">
                    {p.totalAppointments} appointment
                    {p.totalAppointments !== 1 ? 's' : ''}
                  </p>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
