'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useSearchParams } from 'next/navigation';
import {
  UserIcon,
  CalendarDaysIcon,
  ClockIcon,
  ChatBubbleBottomCenterTextIcon,
  CheckCircleIcon,
  MagnifyingGlassIcon,
  ChevronRightIcon
} from '@heroicons/react/24/outline';

const morningSlots = ['09:00 AM', '09:30 AM', '10:00 AM', '10:30 AM', '11:00 AM', '11:30 AM'];
const afternoonSlots = ['01:00 PM', '01:30 PM', '02:00 PM', '02:30 PM', '03:00 PM', '03:30 PM', '04:00 PM'];

export default function BookAppointment() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [patients, setPatients] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [isLoadingData, setIsLoadingData] = useState(true);

  const [formData, setFormData] = useState({
    patientId: '',   // UUID
    doctorId: '',    // UUID
    date: '',
    timeSlot: '',
    notes: ''
  });

  const [patientSearch, setPatientSearch] = useState('');
  const [showPatientDropdown, setShowPatientDropdown] = useState(false);
  const [selectedPatientDisplay, setSelectedPatientDisplay] = useState({ id: '', name: '' });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successStatus, setSuccessStatus] = useState(false);
  const submittingRef = useRef(false);

  // Fetch patients and doctors on mount
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [pRes, dRes] = await Promise.all([
          fetch(`${process.env.NEXT_PUBLIC_API_URL ?? ''}/api/receptionist/patients`),
          fetch(`${process.env.NEXT_PUBLIC_API_URL ?? ''}/api/receptionist/appointments/doctors`)
        ]);
        if (pRes.ok) setPatients(await pRes.json());
        if (dRes.ok) setDoctors(await dRes.json());
      } catch (err) {
        console.error('Failed to load form data:', err);
      } finally {
        setIsLoadingData(false);
      }
    };
    fetchData();
  }, []);

  // Pre-fill patient from URL query params (patientId = UUID, patientName = string)
  useEffect(() => {
    const preId   = searchParams.get('patientId');
    const preName = searchParams.get('patientName');
    if (preId && preName) {
      setFormData(prev => ({ ...prev, patientId: preId }));
      setPatientSearch(preName);
      setSelectedPatientDisplay({ id: '', name: preName });
    }
  }, [searchParams]);

  // Once patients load, enrich the pre-filled display
  useEffect(() => {
    if (formData.patientId && patients.length > 0) {
      const match = patients.find(p => p.realId === formData.patientId);
      if (match) setSelectedPatientDisplay({ id: match.id, name: match.name });
    }
  }, [patients, formData.patientId]);

  const filteredPatients = patients.filter(p =>
    p.name.toLowerCase().includes(patientSearch.toLowerCase()) ||
    p.id.toLowerCase().includes(patientSearch.toLowerCase())
  );

  const handlePatientSelect = (patient) => {
    setFormData({ ...formData, patientId: patient.realId });
    setPatientSearch(patient.name);
    setSelectedPatientDisplay({ id: patient.id, name: patient.name });
    setShowPatientDropdown(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (submittingRef.current) return;
    if (!formData.patientId || !formData.doctorId || !formData.timeSlot) {
      alert('Please select a patient, doctor, and time slot.');
      return;
    }

    submittingRef.current = true;
    setIsSubmitting(true);
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL ?? ''}/api/receptionist/appointments`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          patientId: formData.patientId,
          doctorId: formData.doctorId,
          date: formData.date,
          time: formData.timeSlot,
          reason: formData.notes || null
        })
      });

      if (res.ok) {
        setSuccessStatus(true);
        setTimeout(() => router.push('/receptionist/appointments'), 2000);
      } else {
        const err = await res.json();
        alert(`Failed to book appointment: ${err.details || err.message || 'Please try again.'}`);
      }
    } catch (err) {
      alert('Error connecting to server.');
    } finally {
      submittingRef.current = false;
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-10 px-4 sm:px-6 lg:px-8 font-sans">
      <div className="max-w-5xl mx-auto">

        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center text-sm font-medium text-gray-500 mb-2">
            <Link href="/receptionist/appointments" className="hover:text-red-600 transition-colors">Appointments</Link>
            <ChevronRightIcon className="h-4 w-4 mx-2" />
            <span className="text-gray-900">Book New</span>
          </div>
          <h2 className="text-3xl font-extrabold text-gray-900 tracking-tight">Schedule Appointment</h2>
          <p className="mt-2 text-sm text-gray-500">
            Book a new consultation for a patient by selecting their preferred doctor and time slot.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-8">

          {/* Section 1: Patient Selection */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
            <div className="flex items-center space-x-2 border-b border-gray-100 pb-3 mb-6">
              <UserIcon className="h-6 w-6 text-red-500" />
              <h3 className="text-xl font-bold text-gray-800">1. Patient Details</h3>
            </div>

            <div className="relative">
              <label className="block text-sm font-bold text-gray-700 mb-2">Search & Select Patient</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <MagnifyingGlassIcon className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="text"
                  value={patientSearch}
                  onChange={(e) => {
                    setPatientSearch(e.target.value);
                    setShowPatientDropdown(true);
                    if (formData.patientId) {
                      setFormData({ ...formData, patientId: '' });
                      setSelectedPatientDisplay({ id: '', name: '' });
                    }
                  }}
                  onFocus={() => setShowPatientDropdown(true)}
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl pl-10 px-4 py-3.5 outline-none focus:ring-2 focus:ring-red-500 transition-all font-medium text-gray-900"
                  placeholder="Search by name or ID (e.g. PT-XXXXXXXX)"
                />
              </div>

              {/* Patient Dropdown */}
              {showPatientDropdown && patientSearch && !formData.patientId && (
                <div className="absolute z-20 w-full mt-2 bg-white border border-gray-100 rounded-xl shadow-xl max-h-60 overflow-y-auto">
                  {isLoadingData ? (
                    <div className="p-4 text-center text-sm text-gray-500">Loading patients...</div>
                  ) : filteredPatients.length > 0 ? (
                    filteredPatients.map(p => (
                      <div
                        key={p.realId}
                        onClick={() => handlePatientSelect(p)}
                        className="px-4 py-3 hover:bg-red-50 cursor-pointer border-b border-gray-50 last:border-0 transition-colors flex justify-between items-center group"
                      >
                        <div>
                          <p className="font-bold text-gray-900 group-hover:text-red-700">{p.name}</p>
                          <p className="text-xs text-gray-500 font-mono">{p.id} &bull; {p.icPassport}</p>
                        </div>
                        <button type="button" className="text-xs font-bold text-red-600 bg-red-100 px-3 py-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity">
                          Select
                        </button>
                      </div>
                    ))
                  ) : (
                    <div className="p-4 text-center text-sm text-gray-500">
                      No patients found.{' '}
                      <Link href="/receptionist/patients/new" className="text-red-600 font-bold hover:underline">
                        Register them first
                      </Link>.
                    </div>
                  )}
                </div>
              )}

              {/* Selected State */}
              {formData.patientId && (
                <div className="mt-3 flex items-center text-sm font-bold text-green-600 bg-green-50 p-3 rounded-lg border border-green-100">
                  <CheckCircleIcon className="h-5 w-5 mr-2 shrink-0" />
                  Patient Selected: {selectedPatientDisplay.name}
                  {selectedPatientDisplay.id && <span className="ml-1 font-normal text-green-500">({selectedPatientDisplay.id})</span>}
                </div>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

            {/* Section 2: Doctor & Date */}
            <div className="lg:col-span-1">
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 h-full">
                <div className="flex items-center space-x-2 border-b border-gray-100 pb-3 mb-6">
                  <CalendarDaysIcon className="h-6 w-6 text-red-500" />
                  <h3 className="text-xl font-bold text-gray-800">2. Consultation</h3>
                </div>

                <div className="space-y-5">
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">Doctor</label>
                    <select
                      required
                      value={formData.doctorId}
                      onChange={(e) => setFormData({ ...formData, doctorId: e.target.value })}
                      disabled={isLoadingData}
                      className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3.5 outline-none focus:ring-2 focus:ring-red-500 transition-all font-medium text-gray-900 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                    >
                      <option value="">{isLoadingData ? 'Loading doctors...' : '-- Select Doctor --'}</option>
                      {doctors.map(d => (
                        <option key={d.doctorId} value={d.doctorId}>{d.fullName}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">Date</label>
                    <input
                      type="date"
                      required
                      value={formData.date}
                      onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                      min={new Date().toISOString().split('T')[0]}
                      className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3.5 outline-none focus:ring-2 focus:ring-red-500 transition-all font-medium text-gray-900 cursor-pointer"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Section 3: Time Slots */}
            <div className="lg:col-span-2">
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 h-full flex flex-col">
                <div className="flex items-center space-x-2 border-b border-gray-100 pb-3 mb-6">
                  <ClockIcon className="h-6 w-6 text-red-500" />
                  <h3 className="text-xl font-bold text-gray-800">3. Select Time</h3>
                </div>

                {!formData.date || !formData.doctorId ? (
                  <div className="flex-1 flex flex-col items-center justify-center text-center p-8 border-2 border-dashed border-gray-200 rounded-xl bg-gray-50">
                    <ClockIcon className="h-12 w-12 text-gray-300 mb-3" />
                    <p className="text-gray-500 font-medium">Please select a doctor and date<br/>to view available time slots.</p>
                  </div>
                ) : (
                  <div className="space-y-6">
                    <div>
                      <h4 className="text-sm font-bold text-gray-400 uppercase tracking-widest mb-3">Morning</h4>
                      <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
                        {morningSlots.map(time => (
                          <button key={time} type="button"
                            onClick={() => setFormData({ ...formData, timeSlot: time })}
                            className={`py-2.5 rounded-lg text-sm font-bold transition-all border
                              ${formData.timeSlot === time
                                ? 'bg-red-600 text-white border-red-600 shadow-md transform scale-105'
                                : 'bg-white text-gray-700 border-gray-200 hover:border-red-300 hover:text-red-600 hover:bg-red-50'
                              }`}
                          >
                            {time}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div>
                      <h4 className="text-sm font-bold text-gray-400 uppercase tracking-widest mb-3">Afternoon</h4>
                      <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
                        {afternoonSlots.map(time => (
                          <button key={time} type="button"
                            onClick={() => setFormData({ ...formData, timeSlot: time })}
                            className={`py-2.5 rounded-lg text-sm font-bold transition-all border
                              ${formData.timeSlot === time
                                ? 'bg-red-600 text-white border-red-600 shadow-md transform scale-105'
                                : 'bg-white text-gray-700 border-gray-200 hover:border-red-300 hover:text-red-600 hover:bg-red-50'
                              }`}
                          >
                            {time}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>

          </div>

          {/* Section 4: Notes & Submit */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
            <div className="flex items-center space-x-2 border-b border-gray-100 pb-3 mb-6">
              <ChatBubbleBottomCenterTextIcon className="h-6 w-6 text-red-500" />
              <h3 className="text-xl font-bold text-gray-800">4. Additional Notes</h3>
            </div>

            <textarea
              rows="3"
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              className="w-full bg-gray-50 border border-gray-200 rounded-xl p-4 outline-none focus:ring-2 focus:ring-red-500 transition-all font-medium text-gray-900 resize-none"
              placeholder="Enter reason for visit or any special requests (Optional)..."
            />

            <div className="mt-8 pt-6 border-t border-gray-100 flex justify-end">
              <button
                type="submit"
                disabled={isSubmitting || successStatus}
                className={`flex items-center px-10 py-4 rounded-xl text-white font-bold shadow-lg transition-all duration-300 text-lg
                  ${successStatus
                    ? 'bg-green-500 hover:bg-green-600'
                    : 'bg-red-600 hover:bg-red-700 hover:-translate-y-1'
                  }
                  ${isSubmitting && 'opacity-75 cursor-wait'}
                `}
              >
                {successStatus ? (
                  <>
                    <CheckCircleIcon className="h-6 w-6 mr-2" />
                    Appointment Confirmed!
                  </>
                ) : isSubmitting ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-3"></div>
                    Processing Booking...
                  </>
                ) : (
                  'Confirm Appointment'
                )}
              </button>
            </div>
          </div>

        </form>
      </div>
    </div>
  );
}
