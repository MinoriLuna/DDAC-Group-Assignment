'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useNotification } from '@/hooks/useNotification';

// SVG Icons
const CalendarIcon = () => <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>;
const ClockIcon = () => <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 2m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>;
const UserIcon = () => <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>;
const FileIcon = () => <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>;
const CheckIcon = () => <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" /></svg>;

export default function BookingPage() {
  const router = useRouter();
  const { showNotification } = useNotification();
  
  // 1. STATE MANAGEMENT
  const [doctors, setDoctors] = useState([]);
  const [loadingDoctors, setLoadingDoctors] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState({});
  
  const [formData, setFormData] = useState({
    doctorId: '',
    date: '',
    time: '',
    reason: ''
  });
  
  // Validation helpers
  const validateForm = () => {
    const newErrors = {};
    if (!formData.doctorId) newErrors.doctorId = 'Please select a doctor';
    if (!formData.date) newErrors.date = 'Please select a date';
    if (!formData.time) newErrors.time = 'Please select a time';
    if (!formData.reason || formData.reason.trim().length < 5) newErrors.reason = 'Please provide at least 5 characters';
    
    const selectedDate = new Date(formData.date);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    if (selectedDate < today) newErrors.date = 'Cannot book appointments in the past';
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  
  const isFormValid = formData.doctorId && formData.date && formData.time && formData.reason?.trim().length >= 5;

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
    
    if (!validateForm()) {
      showNotification("Please check all required fields", "warning");
      return;
    }
    
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
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(payload)
      });

      if (res.ok) {
        showNotification("Booking confirmed. Redirecting to appointments...", "success");
        setTimeout(() => router.push('/patient/appointments'), 1500);
      } else {
        const errorText = await res.text(); 
        let errorMessage = "Booking failed. Please try again.";
        
        try {
           const errorJson = JSON.parse(errorText); 
           errorMessage = errorJson.message || errorJson.error || errorMessage;
        } catch (e) {
           errorMessage = errorText || errorMessage;
        }
        
        showNotification(`${errorMessage}`, "error");
      }
    } catch (err) {
      console.error("Booking error:", err);
      showNotification("Network error. Could not reach the server. Please check your connection.", "error");
    } finally {
      setIsSubmitting(false);
    }
  };
        
  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-10 font-sans">
      <div className="max-w-2xl mx-auto">
        <div className="animate-fade-in">
          <h2 className="text-3xl font-black text-gray-900 tracking-tight mb-2 flex items-center gap-3">
            <div className="p-2 bg-red-100 rounded-xl">
              <CalendarIcon className="w-6 h-6 text-red-600" />
            </div>
            Book an Appointment
          </h2>
          <p className="text-gray-600 font-medium mb-8">Schedule a visit with your preferred specialist.</p>

          <div className="bg-gradient-to-br from-white to-red-50 p-8 rounded-2xl shadow-sm border border-gray-100 hover:shadow-lg transition-all duration-300 animate-slide-up">
            <form onSubmit={handleSubmit} className="space-y-6">
              
              {/* --- DOCTOR SELECTION --- */}
              <div>
                <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 ml-1 flex items-center gap-2">
                  <UserIcon className="w-4 h-4" />
                  Select Doctor <span className="text-red-600">*</span>
                </label>
                <select 
                  name="doctorId"
                  value={formData.doctorId}
                  onChange={(e) => { handleChange(e); setErrors({...errors, doctorId: ''}) }}
                  disabled={loadingDoctors}
                  className={`w-full bg-gray-50 border-2 rounded-xl p-4 text-gray-900 font-bold outline-none focus:ring-2 focus:ring-red-500 transition-all disabled:opacity-50 ${ errors.doctorId ? 'border-red-500' : 'border-gray-200 focus:border-red-500'}`}
                >
                  <option value="">{loadingDoctors ? 'Loading doctors...' : 'Choose a doctor...'}</option>
                {doctors.map(doc => (
                  <option key={doc.doctorId} value={doc.doctorId}>
                    {doc.fullName}
                  </option>
                ))}
              </select>
              {errors.doctorId && <p className="text-red-600 text-xs font-bold mt-1">* {errors.doctorId}</p>}
            </div>

            {/* --- DATE & TIME ROW --- */}
            <div className="grid grid-cols-2 gap-6">
              <div>
                <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 ml-1 flex items-center gap-2">
                  <CalendarIcon className="w-4 h-4" />
                  Date <span className="text-red-600">*</span>
                </label>
                <input 
                  type="date" 
                  name="date"
                  value={formData.date}
                  onChange={(e) => { handleChange(e); setErrors({...errors, date: ''}) }}
                  min={new Date().toISOString().split('T')[0]}
                  className={`w-full bg-gray-50 border-2 rounded-xl p-4 text-gray-900 font-bold outline-none focus:ring-2 focus:ring-red-500 transition-all ${ errors.date ? 'border-red-500' : 'border-gray-200 focus:border-red-500'}`}
                />
                {errors.date && <p className="text-red-600 text-xs font-bold mt-1">* {errors.date}</p>}
              </div>
              <div>
                <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 ml-1 flex items-center gap-2">
                  <ClockIcon className="w-4 h-4" />
                  Time <span className="text-red-600">*</span>
                </label>
                <input 
                  type="time" 
                  name="time"
                  value={formData.time}
                  onChange={(e) => { handleChange(e); setErrors({...errors, time: ''}) }}
                  className={`w-full bg-gray-50 border-2 rounded-xl p-4 text-gray-900 font-bold outline-none focus:ring-2 focus:ring-red-500 transition-all ${ errors.time ? 'border-red-500' : 'border-gray-200 focus:border-red-500'}`}
                />
                {errors.time && <p className="text-red-600 text-xs font-bold mt-1">* {errors.time}</p>}
              </div>
            </div>

            {/* --- REASON FOR VISIT --- */}
            <div>
              <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 ml-1 flex items-center gap-2">
                <FileIcon className="w-4 h-4" />
                Reason for Visit (min 5 chars) <span className="text-red-600">*</span>
              </label>
              <textarea 
                name="reason"
                rows="4" 
                value={formData.reason}
                onChange={(e) => { handleChange(e); setErrors({...errors, reason: ''}) }}
                className={`w-full bg-gray-50 border-2 rounded-xl p-4 text-gray-900 font-medium outline-none focus:ring-2 focus:ring-red-500 transition-all resize-none ${ errors.reason ? 'border-red-500' : 'border-gray-200 focus:border-red-500'}`}
                placeholder="Briefly describe your symptoms or reason for visit..."
              ></textarea>
              
              {/* Character Counter with Progress Bar */}
              <div className="mt-3">
                <div className="flex justify-between items-center mb-1">
                  <span className="text-xs font-bold text-gray-400">CHARACTER COUNT</span>
                  <span className={`text-sm font-bold ${formData.reason.length >= 500 ? 'text-orange-600' : 'text-gray-600'}`}>
                    {formData.reason.length}/500
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className={`h-2 rounded-full transition-all ${
                      formData.reason.length >= 500 
                        ? 'bg-orange-500' 
                        : formData.reason.length >= 250 
                        ? 'bg-yellow-500' 
                        : 'bg-red-600'
                    }`}
                    style={{ width: `${Math.min((formData.reason.length / 500) * 100, 100)}%` }}
                  ></div>
                </div>
              </div>
              
              {errors.reason && <p className="text-red-600 text-xs font-bold mt-2">* {errors.reason}</p>}
            </div>

            {/* --- SUBMIT BUTTON --- */}
            <button 
              type="submit" 
              disabled={isSubmitting || !isFormValid}
              className="w-full bg-gradient-to-r from-red-600 to-red-500 hover:from-red-700 hover:to-red-600 text-white font-black py-4 rounded-xl transition-all shadow-md mt-4 disabled:bg-gray-400 disabled:cursor-not-allowed hover:shadow-lg hover:scale-105 duration-200 active:scale-95 flex items-center justify-center gap-2"
            >
              {isSubmitting ? (
                <>
                  <svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Processing...
                </>
              ) : (
                <>
                  <CheckIcon />
                  Confirm Booking
                </>
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
    </div>
  );
}