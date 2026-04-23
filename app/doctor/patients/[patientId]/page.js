'use client';
import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';

export default function PatientDetailPage() {
  const { patientId } = useParams();
  const router = useRouter();
  const [patient, setPatient] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('appointments');

  useEffect(() => {
    const fetchPatient = async () => {
      try {
        const token = localStorage.getItem('token');
        const res = await fetch(
          `http://localhost:5230/api/doctor/patients/${patientId}`,
          { headers: { Authorization: `Bearer ${token}` } },
        );
        if (res.ok) setPatient(await res.json());
      } catch (err) {
        console.error('Patient detail fetch error:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchPatient();
  }, [patientId]);

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
        Loading...
      </div>
    );

  if (!patient)
    return (
      <div className="p-10 text-center">
        <p className="text-gray-500 mb-4">
          Patient not found or access denied.
        </p>
        <button
          onClick={() => router.back()}
          className="text-red-600 font-bold hover:underline"
        >
          ← Go back
        </button>
      </div>
    );

  return (
    <div className="p-10 max-w-4xl mx-auto">
      {/* BACK */}
      <button
        onClick={() => router.back()}
        className="text-gray-400 hover:text-red-600 font-bold text-sm mb-6 flex items-center gap-1 transition-colors"
      >
        ← Back to Patients
      </button>

      {/* PATIENT HEADER */}
      <div className="bg-white p-8 rounded-2xl shadow-sm border-l-4 border-red-600 mb-6">
        <div className="flex items-center gap-5">
          <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center flex-shrink-0">
            <span className="text-red-600 font-black text-2xl">
              {patient.fullName?.charAt(0).toUpperCase() || '?'}
            </span>
          </div>
          <div>
            <h2 className="text-2xl font-black text-gray-900">
              {patient.fullName}
            </h2>
            <p className="text-gray-500">{patient.email}</p>
            <div className="flex gap-4 mt-1">
              {patient.phone && (
                <p className="text-gray-400 text-sm">📱 {patient.phone}</p>
              )}
              {patient.address && (
                <p className="text-gray-400 text-sm">📍 {patient.address}</p>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* TABS */}
      <div className="flex gap-2 mb-6">
        {[
          {
            key: 'appointments',
            label: `Appointments (${patient.appointments?.length || 0})`,
          },
          {
            key: 'prescriptions',
            label: `Prescriptions (${patient.prescriptions?.length || 0})`,
          },
        ].map((tab) => (
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

      {/* APPOINTMENTS TAB */}
      {activeTab === 'appointments' && (
        <div className="space-y-4">
          {!patient.appointments?.length ? (
            <div className="bg-gray-50 text-gray-400 p-8 rounded-2xl text-center font-bold border border-gray-100">
              No appointments found.
            </div>
          ) : (
            patient.appointments.map((a) => (
              <div
                key={a.appointmentId}
                className="bg-white p-6 rounded-2xl border border-gray-100"
              >
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <p className="font-bold text-gray-800">
                      {a.reason || 'General Visit'}
                    </p>
                    <p className="text-red-600 font-bold text-sm mt-1">
                      {formatDateTime(a.appointmentDate, a.appointmentTime)}
                    </p>
                  </div>
                  <span
                    className={`text-[10px] font-black uppercase tracking-widest px-2 py-1 rounded-full ${
                      a.status === 'Completed'
                        ? 'bg-blue-50 text-blue-700'
                        : a.status === 'Confirmed'
                          ? 'bg-green-50 text-green-700'
                          : a.status === 'Cancelled'
                            ? 'bg-gray-100 text-gray-500'
                            : 'bg-orange-50 text-orange-600'
                    }`}
                  >
                    {a.status}
                  </span>
                </div>

                {a.doctorNotes && (
                  <div className="mt-2 p-3 bg-gray-50 rounded-lg">
                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">
                      Doctor Notes
                    </p>
                    <p className="text-gray-700 text-sm">{a.doctorNotes}</p>
                  </div>
                )}
                {a.noteContent && (
                  <div className="mt-2 p-3 bg-blue-50 rounded-lg">
                    <p className="text-[10px] font-black text-blue-400 uppercase tracking-widest mb-1">
                      {a.noteType || 'Note'}
                    </p>
                    <p className="text-gray-700 text-sm">{a.noteContent}</p>
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      )}

      {/* PRESCRIPTIONS TAB */}
      {activeTab === 'prescriptions' && (
        <div className="space-y-4">
          {!patient.prescriptions?.length ? (
            <div className="bg-gray-50 text-gray-400 p-8 rounded-2xl text-center font-bold border border-gray-100">
              No prescriptions issued yet.
            </div>
          ) : (
            patient.prescriptions.map((p) => (
              <div
                key={p.id}
                className="bg-white p-6 rounded-2xl border border-gray-100"
              >
                <div className="flex justify-between items-start mb-3">
                  <p className="font-bold text-gray-800">{p.diagnosis}</p>
                  <p className="text-gray-400 text-xs">
                    {formatDate(p.createdAt)}
                  </p>
                </div>
                <div className="p-3 bg-gray-50 rounded-lg">
                  <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">
                    Medicines
                  </p>
                  <div className="flex flex-wrap gap-2 mt-1">
                    {p.medicines?.split(',').map((med, i) => (
                      <span
                        key={i}
                        className="bg-red-50 text-red-700 px-3 py-1 rounded-lg text-xs font-semibold"
                      >
                        {med.trim()}
                      </span>
                    ))}
                  </div>
                </div>
                {p.instructions && (
                  <div className="mt-2 p-3 bg-yellow-50 rounded-lg">
                    <p className="text-[10px] font-black text-yellow-600 uppercase tracking-widest mb-1">
                      Instructions
                    </p>
                    <p className="text-gray-700 text-sm">{p.instructions}</p>
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}
