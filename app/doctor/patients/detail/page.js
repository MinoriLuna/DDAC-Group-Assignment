'use client';
import { useState, useEffect, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';

const NOTE_TYPES = ['General', 'Diagnosis', 'Referral', 'FollowUp', 'LabResult'];

function PatientDetailContent() {
  const searchParams = useSearchParams();
  const patientId = searchParams.get('id');
  const router = useRouter();
  const [patient, setPatient] = useState(null);
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('appointments');

  const [showReferModal, setShowReferModal] = useState(false);
  const [doctors, setDoctors] = useState([]);
  const [referForm, setReferForm] = useState({
    toDoctorId: '',
    appointmentDate: '',
    appointmentTime: '09:00',
    reason: '',
  });
  const [referring, setReferring] = useState(false);
  const [referMsg, setReferMsg] = useState('');

  useEffect(() => {
    const fetchAll = async () => {
      const token = localStorage.getItem('token');
      const headers = { Authorization: `Bearer ${token}` };
      try {
        const [patRes, docRes] = await Promise.all([
          fetch(`http://localhost:5230/api/doctor/patients/${patientId}`, { headers }),
          fetch(`http://localhost:5230/api/doctor/patients/${patientId}/documents`, { headers }),
        ]);
        if (patRes.ok) setPatient(await patRes.json());
        if (docRes.ok) setDocuments(await docRes.json());
      } catch (err) {
        console.error('Patient detail fetch error:', err);
      } finally {
        setLoading(false);
      }
    };
    if (patientId) fetchAll();
  }, [patientId]);

  const openReferModal = async () => {
    setShowReferModal(true);
    setReferMsg('');
    if (doctors.length === 0) {
      try {
        const token = localStorage.getItem('token');
        const res = await fetch('http://localhost:5230/api/appointment/doctors', {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (res.ok) {
          const t = localStorage.getItem('token');
          const currentUserId = JSON.parse(atob(t.split('.')[1])).userId;
          const all = await res.json();
          setDoctors(all.filter(d => d.doctorId !== currentUserId));
        }
      } catch {/* ignore */}
    }
  };

  const handleRefer = async (e) => {
    e.preventDefault();
    setReferring(true);
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`http://localhost:5230/api/doctor/patients/${patientId}/refer`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({
          toDoctorId: referForm.toDoctorId,
          appointmentDate: referForm.appointmentDate,
          appointmentTime: referForm.appointmentTime + ':00',
          reason: referForm.reason,
        }),
      });
      const data = await res.json();
      if (res.ok) {
        setReferMsg('✅ ' + data.message);
        setReferForm({ toDoctorId: '', appointmentDate: '', appointmentTime: '09:00', reason: '' });
      } else {
        setReferMsg('❌ ' + (data.message || 'Referral failed.'));
      }
    } catch {
      setReferMsg('❌ Could not connect to server.');
    } finally {
      setReferring(false);
    }
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return '—';
    try {
      return new Date(dateStr).toLocaleDateString('en-MY', { month: 'short', day: 'numeric', year: 'numeric' });
    } catch { return dateStr; }
  };

  const formatDateTime = (dateStr, timeStr) => {
    try {
      return new Date(`${dateStr}T${timeStr}`).toLocaleDateString('en-MY', {
        month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit',
      });
    } catch { return `${dateStr} ${timeStr}`; }
  };

  if (loading)
    return <div className="p-10 text-center font-bold text-gray-400 animate-pulse">Loading...</div>;

  if (!patient)
    return (
      <div className="p-10 text-center">
        <p className="text-gray-500 mb-4">Patient not found or access denied.</p>
        <button onClick={() => router.back()} className="text-red-600 font-bold hover:underline">← Go back</button>
      </div>
    );

  const tabs = [
    { key: 'appointments', label: `Appointments (${patient.appointments?.length || 0})` },
    { key: 'prescriptions', label: `Prescriptions (${patient.prescriptions?.length || 0})` },
    { key: 'documents', label: `Documents (${documents.length})` },
  ];

  return (
    <div className="p-10 max-w-4xl mx-auto">
      <button
        onClick={() => router.back()}
        className="text-gray-400 hover:text-red-600 font-bold text-sm mb-6 flex items-center gap-1 transition-colors"
      >
        ← Back to Patients
      </button>

      <div className="bg-white p-8 rounded-2xl shadow-sm border-l-4 border-red-600 mb-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-5">
            <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center flex-shrink-0">
              <span className="text-red-600 font-black text-2xl">{patient.fullName?.charAt(0).toUpperCase() || '?'}</span>
            </div>
            <div>
              <h2 className="text-2xl font-black text-gray-900">{patient.fullName}</h2>
              <p className="text-gray-500">{patient.email}</p>
              <div className="flex gap-4 mt-1">
                {patient.phone && <p className="text-gray-400 text-sm">📱 {patient.phone}</p>}
                {patient.address && <p className="text-gray-400 text-sm">📍 {patient.address}</p>}
              </div>
            </div>
          </div>
          <button
            onClick={openReferModal}
            className="px-5 py-2.5 bg-red-600 hover:bg-red-700 text-white rounded-xl font-bold text-sm transition-colors shadow-sm"
          >
            Refer Patient
          </button>
        </div>
      </div>

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

      {activeTab === 'appointments' && (
        <div className="space-y-4">
          {!patient.appointments?.length ? (
            <div className="bg-gray-50 text-gray-400 p-8 rounded-2xl text-center font-bold border border-gray-100">No appointments found.</div>
          ) : (
            patient.appointments.map((a) => (
              <div key={a.appointmentId} className="bg-white p-6 rounded-2xl border border-gray-100">
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <p className="font-bold text-gray-800">{a.reason || 'General Visit'}</p>
                    <p className="text-red-600 font-bold text-sm mt-1">{formatDateTime(a.appointmentDate, a.appointmentTime)}</p>
                  </div>
                  <span className={`text-[10px] font-black uppercase tracking-widest px-2 py-1 rounded-full ${
                    a.status === 'Completed' ? 'bg-blue-50 text-blue-700'
                    : a.status === 'Confirmed' ? 'bg-green-50 text-green-700'
                    : a.status === 'Cancelled' ? 'bg-gray-100 text-gray-500'
                    : 'bg-orange-50 text-orange-600'
                  }`}>{a.status}</span>
                </div>
                {a.doctorNotes && (
                  <div className="mt-2 p-3 bg-gray-50 rounded-lg">
                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Doctor Notes</p>
                    <p className="text-gray-700 text-sm">{a.doctorNotes}</p>
                  </div>
                )}
                {a.noteContent && (
                  <div className="mt-2 p-3 bg-blue-50 rounded-lg">
                    <p className="text-[10px] font-black text-blue-400 uppercase tracking-widest mb-1">{a.noteType || 'Note'}</p>
                    <p className="text-gray-700 text-sm">{a.noteContent}</p>
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      )}

      {activeTab === 'prescriptions' && (
        <div className="space-y-4">
          {!patient.prescriptions?.length ? (
            <div className="bg-gray-50 text-gray-400 p-8 rounded-2xl text-center font-bold border border-gray-100">No prescriptions issued yet.</div>
          ) : (
            patient.prescriptions.map((p) => (
              <div key={p.id} className="bg-white p-6 rounded-2xl border border-gray-100">
                <div className="flex justify-between items-start mb-3">
                  <p className="font-bold text-gray-800">{p.diagnosis}</p>
                  <p className="text-gray-400 text-xs">{formatDate(p.createdAt)}</p>
                </div>
                <div className="p-3 bg-gray-50 rounded-lg">
                  <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Medicines</p>
                  <div className="flex flex-wrap gap-2 mt-1">
                    {p.medicines?.split(',').map((med, i) => (
                      <span key={i} className="bg-red-50 text-red-700 px-3 py-1 rounded-lg text-xs font-semibold">{med.trim()}</span>
                    ))}
                  </div>
                </div>
                {p.instructions && (
                  <div className="mt-2 p-3 bg-yellow-50 rounded-lg">
                    <p className="text-[10px] font-black text-yellow-600 uppercase tracking-widest mb-1">Instructions</p>
                    <p className="text-gray-700 text-sm">{p.instructions}</p>
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      )}

      {activeTab === 'documents' && (
        <div className="space-y-3">
          {documents.length === 0 ? (
            <div className="bg-gray-50 text-gray-400 p-8 rounded-2xl text-center font-bold border border-gray-100">No documents uploaded by this patient.</div>
          ) : (
            documents.map((d) => (
              <div key={d.id} className="bg-white p-5 rounded-2xl border border-gray-100 flex justify-between items-center">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center flex-shrink-0">
                    <span className="text-blue-600 font-black text-sm">📄</span>
                  </div>
                  <div>
                    <p className="font-bold text-gray-900 text-sm">{d.name}</p>
                    <p className="text-gray-400 text-xs mt-0.5">{d.documentType} · {d.fileSize} · {d.uploadDate}</p>
                  </div>
                </div>
                <a href={d.url} target="_blank" rel="noopener noreferrer"
                  className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl text-xs font-bold transition-colors">
                  View
                </a>
              </div>
            ))
          )}
        </div>
      )}

      {showReferModal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-8">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-black text-gray-900">Refer Patient</h3>
              <button onClick={() => { setShowReferModal(false); setReferMsg(''); }}
                className="text-gray-400 hover:text-gray-700 font-bold text-xl">✕</button>
            </div>
            {referMsg && (
              <div className={`mb-4 p-3 rounded-xl text-sm font-semibold ${referMsg.startsWith('✅') ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>
                {referMsg}
              </div>
            )}
            <form onSubmit={handleRefer} className="space-y-4">
              <div>
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block mb-1">Refer to Doctor</label>
                <select required value={referForm.toDoctorId}
                  onChange={(e) => setReferForm({ ...referForm, toDoctorId: e.target.value })}
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl p-3 text-gray-800 font-semibold outline-none focus:ring-2 focus:ring-red-500">
                  <option value="">Select a doctor…</option>
                  {doctors.map((d) => (
                    <option key={d.doctorId} value={d.doctorId}>Dr. {d.fullName}</option>
                  ))}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block mb-1">Date</label>
                  <input type="date" required value={referForm.appointmentDate}
                    onChange={(e) => setReferForm({ ...referForm, appointmentDate: e.target.value })}
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl p-3 text-gray-800 font-semibold outline-none focus:ring-2 focus:ring-red-500" />
                </div>
                <div>
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block mb-1">Time</label>
                  <input type="time" required value={referForm.appointmentTime}
                    onChange={(e) => setReferForm({ ...referForm, appointmentTime: e.target.value })}
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl p-3 text-gray-800 font-semibold outline-none focus:ring-2 focus:ring-red-500" />
                </div>
              </div>
              <div>
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block mb-1">Reason for Referral</label>
                <textarea required rows={3} value={referForm.reason}
                  onChange={(e) => setReferForm({ ...referForm, reason: e.target.value })}
                  placeholder="e.g. Specialist consultation for cardiac symptoms"
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl p-3 text-gray-800 font-semibold outline-none focus:ring-2 focus:ring-red-500 resize-none" />
              </div>
              <button type="submit" disabled={referring}
                className="w-full bg-red-600 hover:bg-red-700 text-white font-black py-3 rounded-xl transition-all disabled:opacity-50">
                {referring ? 'Sending Referral...' : 'Confirm Referral & Notify Patient'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default function Page() {
  return (
    <Suspense fallback={<div className="p-10 text-center font-bold text-gray-400 animate-pulse">Loading...</div>}>
      <PatientDetailContent />
    </Suspense>
  );
}
