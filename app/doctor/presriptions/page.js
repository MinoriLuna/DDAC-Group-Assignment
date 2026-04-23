'use client';
import { useState, useEffect } from 'react';

export default function PrescriptionsPage() {
  const [prescriptions, setPrescriptions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState(null);

  useEffect(() => {
    const fetchPrescriptions = async () => {
      try {
        const token = localStorage.getItem('token');
        const res = await fetch(
          'http://localhost:5230/api/doctor/prescriptions',
          {
            headers: { Authorization: `Bearer ${token}` },
          },
        );
        if (res.ok) setPrescriptions(await res.json());
      } catch (err) {
        console.error('Prescriptions fetch error:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchPrescriptions();
  }, []);

  const formatDate = (dateStr) => {
    if (!dateStr) return '—';
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

  const toggleExpand = (id) => setExpanded(expanded === id ? null : id);

  if (loading)
    return (
      <div className="p-10 text-center font-bold text-gray-400 animate-pulse">
        Loading prescriptions...
      </div>
    );

  return (
    <div className="p-10 max-w-4xl mx-auto">
      <h2 className="text-3xl font-black text-gray-900 tracking-tight mb-2">
        Prescriptions
      </h2>
      <p className="text-gray-500 font-medium mb-6">
        All prescriptions you have issued to patients.
      </p>

      <p className="text-xs font-black text-gray-400 uppercase tracking-widest mb-4">
        {prescriptions.length} Prescription
        {prescriptions.length !== 1 ? 's' : ''}
      </p>

      {prescriptions.length === 0 ? (
        <div className="bg-gray-50 text-gray-400 p-10 rounded-2xl text-center font-bold border border-gray-100">
          No prescriptions issued yet.
        </div>
      ) : (
        <div className="space-y-3">
          {prescriptions.map((p) => (
            <div
              key={p.id}
              className="bg-white rounded-2xl border border-gray-100 overflow-hidden shadow-sm"
            >
              {/* ROW — click to expand */}
              <div
                className="p-6 flex justify-between items-center cursor-pointer hover:bg-gray-50 transition-colors"
                onClick={() => toggleExpand(p.id)}
              >
                <div className="flex items-center gap-4 flex-1">
                  <div className="w-10 h-10 bg-red-50 rounded-full flex items-center justify-center flex-shrink-0">
                    <span className="text-red-600 font-black text-sm">
                      {p.patientName?.charAt(0).toUpperCase() || '?'}
                    </span>
                  </div>
                  <div>
                    <p className="font-bold text-gray-900">
                      {p.patientName || 'Patient'}
                    </p>
                    <p className="text-gray-500 text-sm">{p.diagnosis}</p>
                  </div>
                </div>
                <div className="flex items-center gap-4 flex-shrink-0 ml-4">
                  <p className="text-gray-400 text-sm font-semibold">
                    {formatDate(p.createdAt)}
                  </p>
                  <span className="text-gray-400 text-sm">
                    {expanded === p.id ? '▲' : '▼'}
                  </span>
                </div>
              </div>

              {/* EXPANDED DETAIL */}
              {expanded === p.id && (
                <div className="px-6 pb-6 border-t border-gray-50 pt-4 space-y-3">
                  <div className="p-4 bg-gray-50 rounded-xl">
                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">
                      Medicines
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {p.medicines?.split(',').map((med, i) => (
                        <span
                          key={i}
                          className="bg-red-50 text-red-700 px-3 py-1.5 rounded-lg text-xs font-semibold"
                        >
                          {med.trim()}
                        </span>
                      ))}
                    </div>
                  </div>
                  {p.instructions && (
                    <div className="p-4 bg-yellow-50 rounded-xl">
                      <p className="text-[10px] font-black text-yellow-600 uppercase tracking-widest mb-1">
                        Instructions
                      </p>
                      <p className="text-gray-700 text-sm">{p.instructions}</p>
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
