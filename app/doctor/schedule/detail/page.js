'use client';
import { useState, useEffect, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';

const NOTE_TYPES = ['General', 'Diagnosis', 'Referral', 'FollowUp', 'LabResult'];

function AppointmentDetailContent() {
  const searchParams = useSearchParams();
  const id = searchParams.get('id');
  const router = useRouter();

  const [appointment, setAppointment] = useState(null);
  const [loading, setLoading] = useState(true);

  const [doctorNotes, setDoctorNotes] = useState('');
  const [noteType, setNoteType] = useState('General');
  const [noteContent, setNoteContent] = useState('');
  const [notesSaving, setNotesSaving] = useState(false);
  const [notesSaved, setNotesSaved] = useState(false);

  const [showRxForm, setShowRxForm] = useState(false);
  const [diagnosis, setDiagnosis] = useState('');
  const [medicines, setMedicines] = useState('');
  const [instructions, setInstructions] = useState('');
  const [rxSaving, setRxSaving] = useState(false);
  const [rxMsg, setRxMsg] = useState('');

  const getAppointmentDateTime = (appt) => {
    if (!appt?.appointmentDate || !appt?.appointmentTime) return null;
    const dateOnly = String(appt.appointmentDate).split('T')[0];
    const dateTime = new Date(`${dateOnly}T${appt.appointmentTime}`);
    return Number.isNaN(dateTime.getTime()) ? null : dateTime;
  };

  useEffect(() => {
    if (!id) return;
    fetchDetail();
  }, [id]);

  const fetchDetail = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL ?? ''}/api/doctor/appointments`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const all = await res.json();
        const appt = all.find((a) => a.appointmentId === id);
        if (appt) {
          setAppointment(appt);
          setDoctorNotes(appt.doctorNotes || '');
          setNoteType(appt.noteType || 'General');
          setNoteContent(appt.noteContent || '');
        }
      }
    } catch (err) {
      console.error('Appointment detail fetch error:', err);
    } finally {
      setLoading(false);
    }
  };

  const saveNotes = async () => {
    setNotesSaving(true);
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL ?? ''}/api/doctor/appointments/${id}/notes`, {
        method: 'PUT',
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ doctorNotes, noteType, noteContent }),
      });
      if (res.ok) {
        setNotesSaved(true);
        setTimeout(() => setNotesSaved(false), 3000);
      }
    } catch (err) {
      console.error('Save notes error:', err);
    } finally {
      setNotesSaving(false);
    }
  };

  const savePrescription = async (e) => {
    e.preventDefault();
    if (!diagnosis.trim() || !medicines.trim()) {
      alert('Diagnosis and medicines are required.');
      return;
    }
    const appointmentDateTime = getAppointmentDateTime(appointment);
    if (appointmentDateTime && appointmentDateTime > new Date()) {
      alert('You can only issue a prescription after the appointment time starts.');
      return;
    }
    setRxSaving(true);
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL ?? ''}/api/doctor/prescriptions`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({
          appointmentId: id,
          patientId: appointment.patientId,
          diagnosis,
          medicines,
          instructions,
        }),
      });
      if (res.ok) {
        setRxMsg('✅ Prescription saved! Patient has been notified via SMS.');
        setShowRxForm(false);
        setDiagnosis('');
        setMedicines('');
        setInstructions('');
        setTimeout(() => setRxMsg(''), 4000);
      } else {
        const err = await res.json();
        alert(err.message || 'Failed to save prescription.');
      }
    } catch (err) {
      console.error('Prescription save error:', err);
    } finally {
      setRxSaving(false);
    }
  };

  const formatDateTime = (dateStr, timeStr) => {
    try {
      return new Date(`${dateStr}T${timeStr}`).toLocaleDateString('en-MY', {
        weekday: 'long', month: 'long', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit',
      });
    } catch { return `${dateStr} ${timeStr}`; }
  };

  if (loading)
    return <div className="p-10 text-center font-bold text-gray-400 animate-pulse">Loading...</div>;

  if (!appointment)
    return (
      <div className="p-10 text-center">
        <p className="text-gray-500 mb-4">Appointment not found.</p>
        <button onClick={() => router.back()} className="text-red-600 font-bold hover:underline">← Go back</button>
      </div>
    );

  const isDone = appointment.status === 'Completed' || appointment.status === 'Cancelled';
  const appointmentDateTime = getAppointmentDateTime(appointment);
  const canIssuePrescription =
    !isDone && (!appointmentDateTime || appointmentDateTime <= new Date());

  return (
    <div className="p-10 max-w-3xl mx-auto">
      <button
        onClick={() => router.back()}
        className="text-gray-400 hover:text-red-600 font-bold text-sm mb-6 flex items-center gap-1 transition-colors"
      >
        ← Back to Schedule
      </button>

      <div className="bg-white p-8 rounded-2xl shadow-sm border-l-4 border-red-600 mb-6">
        <div className="flex justify-between items-start">
          <div>
            <h2 className="text-2xl font-black text-gray-900">{appointment.patientName || 'Patient'}</h2>
            <p className="text-gray-500 mt-1">{appointment.reason || 'General Visit'}</p>
            <p className="text-red-600 font-bold text-sm mt-2">
              📅 {formatDateTime(appointment.appointmentDate, appointment.appointmentTime)}
            </p>
            {appointment.patientPhone && (
              <p className="text-gray-400 text-xs mt-1">📱 {appointment.patientPhone}</p>
            )}
          </div>
          <span className={`text-[10px] font-black uppercase tracking-widest px-3 py-1.5 rounded-full ${
            appointment.status === 'Completed' ? 'bg-blue-50 text-blue-700'
            : appointment.status === 'Confirmed' ? 'bg-green-50 text-green-700'
            : appointment.status === 'Cancelled' ? 'bg-gray-100 text-gray-500'
            : 'bg-orange-50 text-orange-600'
          }`}>{appointment.status}</span>
        </div>
      </div>

      {rxMsg && (
        <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-xl text-green-700 font-semibold text-sm">{rxMsg}</div>
      )}

      <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 mb-6">
        <h3 className="text-xs font-black text-gray-400 uppercase tracking-widest mb-4">Doctor Notes</h3>
        <textarea rows={4} value={doctorNotes} onChange={(e) => setDoctorNotes(e.target.value)}
          disabled={isDone} placeholder="Write your consultation notes here..."
          className="w-full bg-gray-50 border border-gray-200 rounded-xl p-4 text-gray-800 font-medium outline-none focus:ring-2 focus:ring-red-500 transition-all resize-none disabled:opacity-50" />

        <div className="mt-4 grid grid-cols-2 gap-4">
          <div>
            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block mb-1">Note Type</label>
            <select value={noteType} onChange={(e) => setNoteType(e.target.value)} disabled={isDone}
              className="w-full bg-gray-50 border border-gray-200 rounded-xl p-3 text-gray-800 font-semibold outline-none focus:ring-2 focus:ring-red-500 disabled:opacity-50">
              {NOTE_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
            </select>
          </div>
          <div className="col-span-2">
            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block mb-1">Note Content</label>
            <textarea rows={3} value={noteContent} onChange={(e) => setNoteContent(e.target.value)}
              disabled={isDone} placeholder={`Write ${noteType} note here...`}
              className="w-full bg-gray-50 border border-gray-200 rounded-xl p-4 text-gray-800 font-medium outline-none focus:ring-2 focus:ring-red-500 transition-all resize-none disabled:opacity-50" />
          </div>
        </div>

        {!isDone && (
          <button onClick={saveNotes} disabled={notesSaving}
            className="mt-4 bg-gray-800 hover:bg-gray-900 text-white font-bold py-2.5 px-6 rounded-xl transition-all disabled:opacity-50">
            {notesSaving ? 'Saving...' : notesSaved ? '✅ Saved!' : 'Save Notes'}
          </button>
        )}
      </div>

      {canIssuePrescription && (
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 mb-6">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-xs font-black text-gray-400 uppercase tracking-widest">Write Prescription</h3>
            <button onClick={() => setShowRxForm(!showRxForm)} className="text-red-600 hover:text-red-700 font-bold text-sm">
              {showRxForm ? '✕ Cancel' : '+ New Prescription'}
            </button>
          </div>
          {showRxForm && (
            <form onSubmit={savePrescription} className="space-y-4">
              <div>
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block mb-1">Diagnosis *</label>
                <input type="text" value={diagnosis} onChange={(e) => setDiagnosis(e.target.value)} required
                  placeholder="e.g. Upper respiratory tract infection"
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl p-3 text-gray-800 font-semibold outline-none focus:ring-2 focus:ring-red-500" />
              </div>
              <div>
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block mb-1">Medicines * (comma-separated)</label>
                <textarea rows={3} value={medicines} onChange={(e) => setMedicines(e.target.value)} required
                  placeholder="e.g. Paracetamol 500mg 3x/day 5days, Amoxicillin 250mg 2x/day 7days"
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl p-3 text-gray-800 font-medium outline-none focus:ring-2 focus:ring-red-500 resize-none" />
              </div>
              <div>
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block mb-1">Instructions (optional)</label>
                <textarea rows={2} value={instructions} onChange={(e) => setInstructions(e.target.value)}
                  placeholder="e.g. Take medicines after meals. Drink plenty of water."
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl p-3 text-gray-800 font-medium outline-none focus:ring-2 focus:ring-red-500 resize-none" />
              </div>
              <button type="submit" disabled={rxSaving}
                className="w-full bg-red-600 hover:bg-red-700 text-white font-black py-3 rounded-xl transition-all disabled:opacity-50">
                {rxSaving ? 'Saving...' : 'Issue Prescription & Notify Patient'}
              </button>
            </form>
          )}
        </div>
      )}
    </div>
  );
}

export default function Page() {
  return (
    <Suspense fallback={<div className="p-10 text-center font-bold text-gray-400 animate-pulse">Loading...</div>}>
      <AppointmentDetailContent />
    </Suspense>
  );
}
