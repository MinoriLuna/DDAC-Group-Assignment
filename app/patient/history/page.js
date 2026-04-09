'use client';
import { useEffect, useState } from 'react';
import { APPOINTMENT_STATUS } from '@/utils/constants';

export default function MedicalHistoryPage() {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchHistory = async () => {
      const token = localStorage.getItem('token');
      try {
        const res = await fetch('http://localhost:5230/api/appointment/mine', {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        
        if (res.ok) {
          const data = await res.json();
          console.log("RAW DATA FROM DB:", data);
          // Only show visits that the doctor has finalized
          const completed = data.filter(a => a.status === APPOINTMENT_STATUS.COMPLETED);
          setHistory(completed);
        }
      } catch (err) {
        console.error("Failed to fetch medical history:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchHistory();
  }, []);

  if (loading) return <div className="p-10 text-center font-bold text-gray-400 animate-pulse">Loading History...</div>;

  return (
    <div className="min-h-screen p-10 font-sans">
      <div className="max-w-4xl mx-auto">
        <h2 className="text-3xl font-bold text-gray-800 mb-2">Medical History</h2>
        <p className="text-gray-500 mb-8">Your past consultation notes and prescriptions.</p>

        <div className="space-y-6">
          {history.length === 0 ? (
            <p className="text-gray-400 italic">No past medical records found.</p>
          ) : (
            history.map((record) => (
              <div key={record.appointmentId} className="bg-white p-6 rounded-xl shadow-sm">
                <div className="flex justify-between items-start mb-4 border-b border-gray-100 pb-4">
                  <div>
                    <h3 className="text-xl font-bold text-gray-800">{record.reason || 'General Consultation'}</h3>
                    <p className="text-gray-500 text-sm">
                      {new Date(record.appointmentDate).toLocaleDateString('en-MY', { month: 'long', day: 'numeric', year: 'numeric' })} • Attended by {record.doctorName || 'Doctor'}
                    </p>
                  </div>
                </div>
                
                <div className="mb-4">
                  <h4 className="text-sm font-bold text-gray-400 uppercase mb-1">Doctor's Notes</h4>
                  <p className="text-gray-700 bg-gray-50 p-4 rounded-lg">
                    {record.doctorNotes || 'No notes provided for this visit.'}
                  </p>
                </div>

                <div>
                  <h4 className="text-sm font-bold text-gray-400 uppercase mb-1">Prescription</h4>
                  <div className="flex flex-wrap gap-2">
                    {record.prescription ? (
                      record.prescription.split(',').map((med, index) => (
                        <span key={index} className="bg-red-50 text-red-700 px-3 py-1 rounded-md text-sm font-medium">
                          {med.trim()}
                        </span>
                      ))
                    ) : (
                      <span className="text-gray-400 text-sm italic">No medication prescribed.</span>
                    )}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}