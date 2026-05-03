'use client';
import { useState, useEffect } from 'react';

export default function PrescriptionsPage() {
  const [prescriptions, setPrescriptions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState(null);
  const [editingId, setEditingId] = useState(null);
  const [editForm, setEditForm] = useState({});
  const [saving, setSaving] = useState(false);
  const [saveMsg, setSaveMsg] = useState('');

  useEffect(() => {
    fetchPrescriptions();
  }, []);

  const fetchPrescriptions = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL ?? ''}/api/doctor/prescriptions`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) setPrescriptions(await res.json());
    } catch (err) {
      console.error('Prescriptions fetch error:', err);
    } finally {
      setLoading(false);
    }
  };

  const startEdit = (p) => {
    setEditingId(p.id);
    setEditForm({
      diagnosis: p.diagnosis || '',
      medicines: p.medicines || '',
      instructions: p.instructions || '',
    });
    setExpanded(p.id);
    setSaveMsg('');
  };

  const cancelEdit = () => {
    setEditingId(null);
    setSaveMsg('');
  };

  const saveEdit = async (id) => {
    setSaving(true);
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL ?? ''}/api/doctor/prescriptions/${id}`,
        {
          method: 'PUT',
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(editForm),
        },
      );
      if (res.ok) {
        setSaveMsg('✅ Prescription updated.');
        setEditingId(null);
        await fetchPrescriptions();
        setTimeout(() => setSaveMsg(''), 3000);
      } else {
        const data = await res.json();
        setSaveMsg('❌ ' + (data.message || 'Update failed.'));
      }
    } catch {
      setSaveMsg('❌ Could not connect to server.');
    } finally {
      setSaving(false);
    }
  };

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

  const toggleExpand = (id) => {
    if (editingId === id) return;
    setExpanded(expanded === id ? null : id);
  };

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

      {saveMsg && (
        <div className={`mb-6 p-4 rounded-xl text-sm font-semibold ${saveMsg.startsWith('✅') ? 'bg-green-50 border border-green-200 text-green-700' : 'bg-red-50 border border-red-200 text-red-700'}`}>
          {saveMsg}
        </div>
      )}

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
              {/* ROW */}
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
                <div className="flex items-center gap-3 flex-shrink-0 ml-4">
                  <p className="text-gray-400 text-sm font-semibold">
                    {formatDate(p.createdAt)}
                  </p>
                  <button
                    onClick={(e) => { e.stopPropagation(); startEdit(p); }}
                    className="px-3 py-1.5 bg-gray-100 hover:bg-gray-200 text-gray-600 rounded-lg text-xs font-bold transition-colors"
                  >
                    Edit
                  </button>
                  <span className="text-gray-400 text-sm">
                    {expanded === p.id ? '▲' : '▼'}
                  </span>
                </div>
              </div>

              {/* EXPANDED DETAIL */}
              {expanded === p.id && (
                <div className="px-6 pb-6 border-t border-gray-50 pt-4 space-y-3">
                  {editingId === p.id ? (
                    /* EDIT FORM */
                    <div className="space-y-3">
                      <div>
                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block mb-1">
                          Diagnosis
                        </label>
                        <input
                          value={editForm.diagnosis}
                          onChange={(e) => setEditForm({ ...editForm, diagnosis: e.target.value })}
                          className="w-full bg-gray-50 border border-gray-200 rounded-xl p-3 text-gray-800 font-semibold outline-none focus:ring-2 focus:ring-red-500"
                        />
                      </div>
                      <div>
                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block mb-1">
                          Medicines (comma-separated)
                        </label>
                        <textarea
                          rows={2}
                          value={editForm.medicines}
                          onChange={(e) => setEditForm({ ...editForm, medicines: e.target.value })}
                          className="w-full bg-gray-50 border border-gray-200 rounded-xl p-3 text-gray-800 font-semibold outline-none focus:ring-2 focus:ring-red-500 resize-none"
                        />
                      </div>
                      <div>
                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block mb-1">
                          Instructions
                        </label>
                        <textarea
                          rows={2}
                          value={editForm.instructions}
                          onChange={(e) => setEditForm({ ...editForm, instructions: e.target.value })}
                          className="w-full bg-gray-50 border border-gray-200 rounded-xl p-3 text-gray-800 font-semibold outline-none focus:ring-2 focus:ring-red-500 resize-none"
                        />
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={() => saveEdit(p.id)}
                          disabled={saving}
                          className="flex-1 bg-red-600 hover:bg-red-700 text-white font-black py-2.5 rounded-xl text-sm transition-all disabled:opacity-50"
                        >
                          {saving ? 'Saving...' : 'Save Changes'}
                        </button>
                        <button
                          onClick={cancelEdit}
                          className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-600 font-black py-2.5 rounded-xl text-sm transition-all"
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  ) : (
                    /* VIEW */
                    <>
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
                    </>
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
