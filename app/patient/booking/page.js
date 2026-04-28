'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useNotification } from '@/hooks/useNotification';

export default function BookingPage() {
  const router = useRouter();
  const { showNotification } = useNotification();
  
  // 1. STATE MANAGEMENT
  const [doctors, setDoctors] = useState([]);
  const [loadingDoctors, setLoadingDoctors] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const [formData, setFormData] = useState({
    doctorId: '',
    date: '',
    time: '',
    reason: ''
  });

  // 2. FETCH REAL DOCTORS ON LOAD
  useEffect(() => {
    const fetchDoctors = async () => {
      const token = localStorage.getItem('token');
      try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL ?? ''}/api/appointment/doctors`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        
        if (res.ok) {
          const data = await res.json();
          setDoctors(data);
        } else {
          console.error("Failed to fetch doctors from backend.");
        }
      } catch (err) {
        console.error("Network error: Is the C# backend running?", err);
      } finally {
        setLoadingDoctors(false);
      }
    };

    fetchDoctors();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    const token = localStorage.getItem('token');

    try {
      const payload = {
        DoctorId: formData.doctorId,
        AppointmentDate: formData.date,
        AppointmentTime: formData.time + ":00", 
        Reason: formData.reason
      };

      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL ?? ''}/api/appointment/book`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json', // Tell backend we're sending JSON
          'Authorization': `Bearer ${token}` // Ensure token is sent for authentication
        },
        body: JSON.stringify(payload)
      });

      if (res.ok) {
        showNotification("Booking Confirmed! Redirecting...", "success");
        router.push('/patient/appointments'); 
      } else {
        const errorText = await res.text(); 
        let errorMessage = errorText;
        
        try {
           const errorJson = JSON.parse(errorText); 
           errorMessage = errorJson.message || JSON.stringify(errorJson);
        } catch (e) {
           if (!errorMessage) errorMessage = "Empty response from server";
        }
        
        console.error("Backend Error Details:", errorMessage);
        showNotification(`Booking Failed (Status ${res.status}): ${errorMessage}`, "error");
      }
    } catch (err) {
      console.error("Booking error:", err);
      showNotification("Network error. Could not reach the server.", "error");
    } finally {
      setIsSubmitting(false);
    }
  };
        
  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  return (
    <div className="p-10 font-sans">
      <div className="max-w-2xl mx-auto">
        <h2 className="text-3xl font-black text-gray-900 tracking-tight mb-2">Book an Appointment</h2>
        <p className="text-gray-500 font-medium mb-8">Schedule a visit with your preferred specialist.</p>

        <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100">
          <form onSubmit={handleSubmit} className="space-y-6">
            
            {/* --- DOCTOR SELECTION --- */}
            <div>
              <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 ml-1">Select Doctor</label>
              <select 
                name="doctorId"
                value={formData.doctorId}
                onChange={handleChange}
                required
                disabled={loadingDoctors}
                className="w-full bg-gray-50 border border-gray-200 rounded-xl p-4 text-gray-900 font-bold outline-none focus:ring-2 focus:ring-red-500 transition-all disabled:opacity-50"
              >
                <option value="">{loadingDoctors ? 'Loading doctors...' : 'Choose a doctor...'}</option>
                {doctors.map(doc => (
                  <option key={doc.doctorId} value={doc.doctorId}>
                    {doc.fullName}
                  </option>
                ))}
              </select>
            </div>

            {/* --- DATE & TIME ROW --- */}
            <div className="grid grid-cols-2 gap-6">
              <div>
                <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 ml-1">Date</label>
                <input 
                  type="date" 
                  name="date"
                  value={formData.date}
                  onChange={handleChange}
                  required
                  min={new Date().toISOString().split('T')[0]} // Prevents booking in the past
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl p-4 text-gray-900 font-bold outline-none focus:ring-2 focus:ring-red-500 transition-all" 
                />
              </div>
              <div>
                <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 ml-1">Time</label>
                <input 
                  type="time" 
                  name="time"
                  value={formData.time}
                  onChange={handleChange}
                  required
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl p-4 text-gray-900 font-bold outline-none focus:ring-2 focus:ring-red-500 transition-all" 
                />
              </div>
            </div>

            {/* --- REASON FOR VISIT --- */}
            <div>
              <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 ml-1">Reason for Visit</label>
              <textarea 
                name="reason"
                rows="4" 
                value={formData.reason}
                onChange={handleChange}
                required
                className="w-full bg-gray-50 border border-gray-200 rounded-xl p-4 text-gray-900 font-medium outline-none focus:ring-2 focus:ring-red-500 transition-all resize-none"
                placeholder="Briefly describe your symptoms..."
              ></textarea>
            </div>

            {/* --- SUBMIT BUTTON --- */}
            <button 
              type="submit" 
              disabled={isSubmitting}
              className="w-full bg-red-600 hover:bg-red-700 text-white font-black py-4 rounded-xl transition-all shadow-md mt-4 disabled:bg-red-400 disabled:cursor-not-allowed"
            >
              {isSubmitting ? 'Processing...' : 'Confirm Booking'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}