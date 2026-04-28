'use client';
import { useEffect, useState } from 'react';
import { APPOINTMENT_STATUS } from '@/utils/constants';
import { useNotification } from '@/hooks/useNotification';
import { useConfirmation } from '@/hooks/useConfirmation';

export default function AppointmentsPage() {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const { showNotification } = useNotification();
  const { showConfirmation } = useConfirmation();
  const [cancelPending, setCancelPending] = useState(null);

  // --- 1. FETCH APPOINTMENTS ON LOAD ---
  useEffect(() => {
    const fetchAppointments = async () => {
      const token = localStorage.getItem('token');
      try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL ?? ''}/api/appointment/mine`, {
          headers: { 'Authorization': `Bearer ${token}` } // Ensure token is sent for authentication
        });
        
        if (res.ok) {
          const data = await res.json();
          setAppointments(data);
        }
      } catch (err) {
        console.error("Failed to fetch appointments:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchAppointments();
  }, []);

// Cancel Appointment
const handleCancel = (id) => {
  showConfirmation(
    "Are you sure you want to cancel this appointment?",
    async () => {
      setCancelPending(id);
      try {
        const token = localStorage.getItem('token');
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL ?? ''}/api/appointment/${id}/cancel`, {
          method: 'PATCH',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });

        if (res.ok) {
          setAppointments(appointments.map(appt =>
            appt.appointmentId === id
              ? { ...appt, status: APPOINTMENT_STATUS.CANCELLED }
              : appt
          ));
          showNotification("Appointment cancelled successfully.", "success");
        } else {
          const errorData = await res.json();
          showNotification(`Error: ${errorData.message}`, "error");
        }
      } catch (error) {
        console.error("Cancel failed:", error);
        showNotification("Could not connect to the server.", "error");
      } finally {
        setCancelPending(null);
      }
    }
  );
};

  if (loading) return <div className="p-10 font-black text-gray-400 animate-pulse text-center">Loading Appointments...</div>;

  // --- 3. FILTER INTO UPCOMING VS PAST ---
  const upcoming = appointments.filter(a => 
    a.status === APPOINTMENT_STATUS.PENDING || 
    a.status === APPOINTMENT_STATUS.CONFIRMED
  );

  const past = appointments.filter(a => 
    a.status === APPOINTMENT_STATUS.COMPLETED || 
    a.status === APPOINTMENT_STATUS.CANCELLED
  );

  // Helper function to format the C# DateOnly and TimeOnly
  const formatDateTime = (dateStr, timeStr) => {
    try {
      // We combine the date and time strings (e.g., "2026-04-15T10:00:00")
      const dateObj = new Date(`${dateStr}T${timeStr}`);
      return dateObj.toLocaleDateString('en-MY', { 
        month: 'short', 
        day: 'numeric', 
        year: 'numeric', 
        hour: '2-digit', 
        minute: '2-digit' 
      });
    } catch (e) {
      return `${dateStr} ${timeStr}`; // Fallback if the date is weird
    }
  };

  return (
    <div className="min-h-screen p-10 font-sans">
      <div className="max-w-4xl mx-auto">
        <h2 className="text-3xl font-black text-gray-900 tracking-tight mb-8">My Appointments</h2>

        {/* --- UPCOMING SECTION --- */}
        <h3 className="text-xs font-black text-gray-400 uppercase tracking-widest mb-4">Upcoming Visits ({upcoming.length})</h3>
        
        {upcoming.length === 0 ? (
          <p className="bg-gray-50 text-gray-500 p-6 rounded-xl border border-gray-100 text-center font-bold mb-10">
            No upcoming appointments scheduled.
          </p>
        ) : (
          <div className="space-y-4 mb-10">
            {upcoming.map(appt => (
              <div key={appt.appointmentId} className="bg-white p-6 rounded-2xl shadow-sm border-l-4 border-red-600 border-l-4 border-l-red-500 flex justify-between items-center transition-all hover:shadow-md">
                <div>
                  <p className="text-xl font-bold text-gray-900">{appt.reason || 'General Visit'}</p>
                  <p className="text-gray-500 font-medium text-sm mt-0.5">
                    {appt.doctorName || 'Doctor: Pending Assignment'}
                  </p>
                  
                  <p className="text-red-600 font-bold mt-3 text-sm tracking-tight">
                    📅 {formatDateTime(appt.appointmentDate, appt.appointmentTime)}
                  </p>
                </div>
                
                <div className="flex flex-col items-end gap-3">
                  <span className="bg-orange-50 text-orange-600 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest">
                    {appt.status}
                  </span>
                  <button
                    onClick={() => handleCancel(appt.appointmentId)}
                    disabled={cancelPending === appt.appointmentId}
                    className="border border-red-100 text-red-500 hover:bg-red-50 hover:border-red-200 px-4 py-2 rounded-xl text-xs font-bold transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {cancelPending === appt.appointmentId ? 'Cancelling...' : 'Cancel Visit'}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* --- PAST SECTION --- */}
        <h3 className="text-xs font-black text-gray-400 uppercase tracking-widest mb-4">Past History ({past.length})</h3>
        
        {past.length === 0 ? (
          <p className="text-gray-400 text-sm font-semibold italic ml-2">No past visits on record.</p>
        ) : (
          <div className="space-y-4">
            {past.map(appt => (
              <div key={appt.appointmentId} className="bg-white p-6 rounded-2xl border border-gray-100 flex justify-between items-center opacity-60 hover:opacity-100 transition-opacity">
                <div>
                  <p className="text-lg font-bold text-gray-800 line-through decoration-gray-300">{appt.reason || 'General Visit'}</p>
                  <p className="text-gray-500 font-medium text-sm mt-0.5">
                    {appt.doctorName || 'Doctor: Not Recorded'}
                  </p>
                  <p className="text-gray-400 font-bold mt-2 text-xs">
                    {formatDateTime(appt.appointmentDate, appt.appointmentTime)}
                  </p>
                </div>
                <span className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest ${
                  appt.status === APPOINTMENT_STATUS.COMPLETED ? 'bg-green-50 text-green-700' : 'bg-gray-100 text-gray-500'
                }`}>
                  {appt.status}
                </span>
              </div>
            ))}
          </div>
        )}

      </div>
    </div>
  );
}