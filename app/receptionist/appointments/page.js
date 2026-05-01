'use client';

import { useState, useMemo, useEffect, useCallback } from 'react';
import Link from 'next/link';
import {
  PlusCircleIcon,
  CalendarIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  FunnelIcon,
  UserIcon,
  EllipsisVerticalIcon,
  CheckCircleIcon,
  XMarkIcon,
  ClockIcon
} from '@heroicons/react/24/outline';

const API = 'http://localhost:5230/api/receptionist/appointments';

const morningSlots = ['09:00 AM', '09:30 AM', '10:00 AM', '10:30 AM', '11:00 AM', '11:30 AM'];
const afternoonSlots = ['01:00 PM', '01:30 PM', '02:00 PM', '02:30 PM', '03:00 PM', '03:30 PM', '04:00 PM'];

const STATUSES = ['All Statuses', 'Scheduled', 'Checked-In', 'In Consultation', 'Completed', 'Cancelled'];

const getStatusBadge = (status) => {
  switch (status) {
    case 'Completed': return 'bg-gray-100 text-gray-700 border-gray-200';
    case 'In Consultation': return 'bg-blue-100 text-blue-700 border-blue-200';
    case 'Checked-In': return 'bg-orange-100 text-orange-700 border-orange-200 animate-pulse';
    case 'Scheduled': return 'bg-green-100 text-green-700 border-green-200';
    case 'Cancelled': return 'bg-red-50 text-red-600 border-red-200 line-through opacity-70';
    default: return 'bg-gray-100 text-gray-800';
  }
};

export default function AppointmentsDashboard() {
  const [appointments, setAppointments] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDoctor, setSelectedDoctor] = useState('All Doctors');
  const [selectedStatus, setSelectedStatus] = useState('All Statuses');
  const [isRescheduleOpen, setIsRescheduleOpen] = useState(false);
  const [rescheduleData, setRescheduleData] = useState({ id: null, date: '', timeSlot: '' });
  const [toast, setToast] = useState(null);

  const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  const formatDate = (date) => {
    const today = new Date();
    const yesterday = new Date(today); yesterday.setDate(today.getDate() - 1);
    const tomorrow = new Date(today); tomorrow.setDate(today.getDate() + 1);
    const label = `${MONTHS[date.getMonth()]} ${date.getDate()}`;
    if (date.toDateString() === today.toDateString()) return `Today, ${label}`;
    if (date.toDateString() === yesterday.toDateString()) return `Yesterday, ${label}`;
    if (date.toDateString() === tomorrow.toDateString()) return `Tomorrow, ${label}`;
    return `${DAYS[date.getDay()]}, ${label}`;
  };

  const shiftDate = (days) => {
    setCurrentDate(prev => {
      const d = new Date(prev);
      d.setDate(d.getDate() + days);
      return d;
    });
  };

  const dateStr = (d) => d.toISOString().split('T')[0];

  const fetchAppointments = useCallback(async (date) => {
    setIsLoading(true);
    try {
      const res = await fetch(`${API}?date=${dateStr(date)}`);
      if (res.ok) {
        const data = await res.json();
        setAppointments(data);
      }
    } catch (err) {
      console.error('Failed to fetch appointments:', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAppointments(currentDate);
  }, [currentDate, fetchAppointments]);

  // Build doctor list dynamically from loaded appointments
  const doctorList = useMemo(() => {
    const names = [...new Set(appointments.map(a => a.doctorName))].sort();
    return ['All Doctors', ...names];
  }, [appointments]);

  const filteredAppointments = useMemo(() => {
    return appointments.filter(apt => {
      const matchDoctor = selectedDoctor === 'All Doctors' || apt.doctorName === selectedDoctor;
      const matchStatus = selectedStatus === 'All Statuses' || apt.status === selectedStatus;
      return matchDoctor && matchStatus;
    });
  }, [appointments, selectedDoctor, selectedStatus]);

  const totalAppts = filteredAppointments.length;
  const completed = filteredAppointments.filter(a => a.status === 'Completed').length;
  const waiting = filteredAppointments.filter(a => a.status === 'Checked-In').length;

  const handleStatusUpdate = async (id, newStatus) => {
    // Optimistic update
    setAppointments(prev => prev.map(apt => apt.id === id ? { ...apt, status: newStatus } : apt));

    try {
      const res = await fetch(`${API}/${id}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus })
      });
      if (!res.ok) {
        // Revert on failure
        await fetchAppointments(currentDate);
        alert('Failed to update status. Please try again.');
      }
    } catch (err) {
      await fetchAppointments(currentDate);
      alert('Error connecting to server.');
    }
  };

  const handleComplete = async (id) => {
    setAppointments(prev => prev.map(apt => apt.id === id ? { ...apt, status: 'Completed' } : apt));
    try {
      const res = await fetch(`${API}/${id}/complete`, { method: 'POST' });
      if (res.ok) {
        setToast('Appointment completed. Invoice generated and marked as Unpaid.');
        setTimeout(() => setToast(null), 5000);
      } else {
        await fetchAppointments(currentDate);
        alert('Failed to complete appointment. Please try again.');
      }
    } catch (err) {
      await fetchAppointments(currentDate);
      alert('Error connecting to server.');
    }
  };

  const handleCancel = (id) => {
    if (window.confirm('Are you sure you want to cancel this appointment?')) {
      handleStatusUpdate(id, 'Cancelled');
    }
  };

  const openRescheduleModal = (apt) => {
    setRescheduleData({ id: apt.id, date: dateStr(currentDate), timeSlot: apt.time });
    setIsRescheduleOpen(true);
  };


  const handleRescheduleSubmit = async (e) => {
    e.preventDefault();
    if (!rescheduleData.timeSlot) {
      alert('Please select a new time slot.');
      return;
    }

    try {
      const res = await fetch(`${API}/${rescheduleData.id}/reschedule`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ date: rescheduleData.date, time: rescheduleData.timeSlot })
      });
      if (res.ok) {
        setIsRescheduleOpen(false);
        await fetchAppointments(currentDate);
      } else {
        alert('Failed to reschedule. Please try again.');
      }
    } catch (err) {
      alert('Error connecting to server.');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-10 px-4 sm:px-6 lg:px-8 font-sans relative">
      <div className="max-w-7xl w-full mx-auto space-y-8">

        {/* Page Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h2 className="text-3xl font-extrabold text-gray-900 tracking-tight">Daily Schedule</h2>
            <p className="mt-1 text-sm text-gray-500">
              Manage appointments, track patient check-ins, and monitor clinic flow.
            </p>
          </div>
          <Link href="/receptionist/appointments/new">
            <button className="flex items-center px-6 py-3 bg-red-600 text-white font-bold rounded-xl shadow-md hover:bg-red-700 hover:-translate-y-0.5 transition-all">
              <PlusCircleIcon className="h-5 w-5 mr-2" />
              Book Appointment
            </button>
          </Link>
        </div>

        {/* Filters & Date Nav */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 sm:p-6 flex flex-col lg:flex-row gap-6 justify-between items-center z-10 relative">
          <div className="flex items-center space-x-4 bg-gray-50 px-4 py-2 rounded-xl border border-gray-200">
            <button onClick={() => shiftDate(-1)} className="p-2 hover:bg-white rounded-lg transition-colors text-gray-500 hover:text-red-600 shadow-sm border border-transparent hover:border-gray-200">
              <ChevronLeftIcon className="h-5 w-5" />
            </button>
            <div className="flex items-center font-bold text-gray-800 min-w-[160px] justify-center">
              <CalendarIcon className="h-5 w-5 mr-2 text-red-500" />
              {formatDate(currentDate)}
            </div>
            <button onClick={() => shiftDate(1)} className="p-2 hover:bg-white rounded-lg transition-colors text-gray-500 hover:text-red-600 shadow-sm border border-transparent hover:border-gray-200">
              <ChevronRightIcon className="h-5 w-5" />
            </button>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 w-full lg:w-auto">
            <div className="relative flex-1 sm:min-w-[220px]">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <UserIcon className="h-5 w-5 text-gray-400" />
              </div>
              <select
                value={selectedDoctor}
                onChange={(e) => setSelectedDoctor(e.target.value)}
                className="w-full bg-gray-50 border border-gray-200 rounded-xl pl-10 pr-10 py-3 font-medium text-sm text-gray-800 outline-none focus:ring-2 focus:ring-red-500 appearance-none cursor-pointer hover:bg-gray-100 transition-colors"
              >
                {doctorList.map(doc => <option key={doc} value={doc}>{doc}</option>)}
              </select>
            </div>

            <div className="relative flex-1 sm:min-w-[200px]">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <FunnelIcon className="h-5 w-5 text-gray-400" />
              </div>
              <select
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
                className="w-full bg-gray-50 border border-gray-200 rounded-xl pl-10 pr-10 py-3 font-medium text-sm text-gray-800 outline-none focus:ring-2 focus:ring-red-500 appearance-none cursor-pointer hover:bg-gray-100 transition-colors"
              >
                {STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex flex-col lg:flex-row gap-8 items-start">

          {/* Schedule List */}
          <div className="flex-1 w-full bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-100 bg-gray-50 flex justify-between items-center">
              <h3 className="font-bold text-gray-800">Schedule List</h3>
              <span className="text-xs font-bold text-gray-500 bg-gray-200 px-3 py-1 rounded-full">{totalAppts} Results</span>
            </div>

            <div className="divide-y divide-gray-100">
              {isLoading ? (
                <div className="p-16 text-center flex flex-col items-center">
                  <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-red-500 mb-3"></div>
                  <p className="text-gray-500 font-medium">Loading appointments...</p>
                </div>
              ) : filteredAppointments.length === 0 ? (
                <div className="p-16 text-center text-gray-500">
                  <CalendarIcon className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                  <p className="font-medium">No appointments for this date.</p>
                </div>
              ) : (
                filteredAppointments.map((apt) => (
                  <div key={apt.id} className="p-6 hover:bg-gray-50 transition-colors flex flex-col sm:flex-row sm:items-center gap-6 group">

                    {/* Time Block */}
                    <div className="flex flex-col sm:items-end sm:w-24 shrink-0">
                      <span className={`text-lg font-black ${apt.status === 'Cancelled' ? 'text-gray-400 line-through' : 'text-gray-900'}`}>
                        {apt.time.split(' ')[0]}
                      </span>
                      <span className={`text-xs font-bold ${apt.status === 'Cancelled' ? 'text-gray-300' : 'text-gray-400'}`}>
                        {apt.time.split(' ')[1]}
                      </span>
                    </div>

                    <div className="hidden sm:block w-px h-16 bg-gray-200"></div>

                    {/* Patient & Details */}
                    <div className="flex-1">
                      <div className="flex flex-wrap items-center gap-3 mb-1">
                        <h4 className={`text-lg font-bold transition-colors ${apt.status === 'Cancelled' ? 'text-gray-500' : 'text-gray-900 group-hover:text-red-600'}`}>
                          {apt.patientName}
                        </h4>
                        <span className={`px-2.5 py-0.5 rounded text-xs font-bold border ${getStatusBadge(apt.status)}`}>
                          {apt.status}
                        </span>
                      </div>
                      <div className="flex flex-wrap items-center text-sm text-gray-500 gap-x-4 gap-y-1">
                        <span><span className="font-semibold text-gray-400">ID:</span> {apt.icPassport}</span>
                        {apt.reason && <span><span className="font-semibold text-gray-400">Reason:</span> {apt.reason}</span>}
                        <span className={`flex items-center px-2 py-0.5 rounded font-medium text-xs ${apt.status === 'Cancelled' ? 'bg-gray-100 text-gray-500' : 'text-red-600 bg-red-50'}`}>
                          <UserIcon className="h-3 w-3 mr-1" />
                          {apt.doctorName}
                        </span>
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="shrink-0 pt-2 sm:pt-0 flex flex-wrap gap-2">
                      {apt.status === 'Scheduled' && (
                        <>
                          <button onClick={() => openRescheduleModal(apt)} className="px-3 py-2 bg-white border border-gray-200 text-gray-600 text-sm font-bold rounded-lg hover:bg-gray-50 hover:text-gray-900 shadow-sm transition-all">
                            Reschedule
                          </button>
                          <button onClick={() => handleCancel(apt.id)} className="px-3 py-2 bg-white border border-gray-200 text-red-600 text-sm font-bold rounded-lg hover:bg-red-50 hover:border-red-200 shadow-sm transition-all">
                            Cancel
                          </button>
                          <button onClick={() => handleStatusUpdate(apt.id, 'Checked-In')} className="px-5 py-2 bg-red-600 border border-red-600 text-white text-sm font-bold rounded-lg hover:bg-red-700 shadow-sm transition-all">
                            Check-In
                          </button>
                        </>
                      )}

                      {apt.status === 'Cancelled' && (
                        <button onClick={() => openRescheduleModal(apt)} className="px-4 py-2 bg-white border border-gray-200 text-gray-600 text-sm font-bold rounded-lg hover:bg-gray-50 hover:text-gray-900 shadow-sm transition-all">
                          Re-schedule
                        </button>
                      )}

                      {apt.status === 'Checked-In' && (
                        <button onClick={() => handleStatusUpdate(apt.id, 'In Consultation')} className="w-full sm:w-auto px-4 py-2 bg-blue-50 border border-blue-200 text-blue-700 text-sm font-bold rounded-lg hover:bg-blue-600 hover:text-white shadow-sm transition-all">
                          Send to Dr.
                        </button>
                      )}

                      {apt.status === 'In Consultation' && (
                        <button onClick={() => handleComplete(apt.id)} className="w-full sm:w-auto flex items-center justify-center px-4 py-2 bg-green-50 border border-green-200 text-green-700 text-sm font-bold rounded-lg hover:bg-green-600 hover:text-white shadow-sm transition-all">
                          <CheckCircleIcon className="h-4 w-4 mr-1.5" />
                          Complete
                        </button>
                      )}

                      {apt.status === 'Completed' && (
                        <button className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors">
                          <EllipsisVerticalIcon className="h-5 w-5" />
                        </button>
                      )}
                    </div>

                  </div>
                ))
              )}
            </div>
          </div>

          {/* Right Sidebar */}
          <div className="w-full lg:w-80 space-y-6">
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 relative overflow-hidden">
              <h3 className="font-bold text-gray-800 mb-6">Today's Overview</h3>
              <div className="space-y-5 relative z-10">
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-gray-500 font-medium">Total Appointments</span>
                    <span className="font-bold text-gray-900">{totalAppts}</span>
                  </div>
                  <div className="w-full bg-gray-100 rounded-full h-2">
                    <div className="bg-gray-300 h-2 rounded-full w-full"></div>
                  </div>
                </div>
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-gray-500 font-medium">Completed</span>
                    <span className="font-bold text-gray-900">{completed}</span>
                  </div>
                  <div className="w-full bg-gray-100 rounded-full h-2">
                    <div className="bg-green-500 h-2 rounded-full transition-all" style={{ width: `${totalAppts ? (completed / totalAppts) * 100 : 0}%` }}></div>
                  </div>
                </div>
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-gray-500 font-medium">Waiting Room</span>
                    <span className="font-bold text-gray-900">{waiting}</span>
                  </div>
                  <div className="w-full bg-gray-100 rounded-full h-2">
                    <div className="bg-orange-500 h-2 rounded-full transition-all animate-pulse" style={{ width: `${totalAppts ? (waiting / totalAppts) * 100 : 0}%` }}></div>
                  </div>
                </div>
              </div>
              <CalendarIcon className="absolute -bottom-6 -right-6 h-32 w-32 text-gray-50 opacity-50 pointer-events-none" />
            </div>

            <div className="bg-red-50 rounded-2xl border border-red-100 p-6 flex items-start">
              <div className="bg-red-100 p-2 rounded-lg mr-4">
                <EllipsisVerticalIcon className="h-6 w-6 text-red-600" />
              </div>
              <div>
                <h4 className="font-bold text-red-900 mb-1 text-sm">Need Help?</h4>
                <p className="text-xs text-red-700 leading-relaxed">
                  Click "Check-In" when a patient arrives to update their status and notify the doctor.
                </p>
              </div>
            </div>
          </div>

        </div>
      </div>

      {/* Toast Notification */}
      {toast && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center gap-3 bg-green-600 text-white px-5 py-4 rounded-2xl shadow-2xl max-w-sm animate-fade-in">
          <CheckCircleIcon className="h-5 w-5 shrink-0" />
          <p className="text-sm font-bold">{toast}</p>
          <button onClick={() => setToast(null)} className="ml-2 text-white/70 hover:text-white transition-colors">
            <XMarkIcon className="h-4 w-4" />
          </button>
        </div>
      )}

      {/* Reschedule Modal */}
      {isRescheduleOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden">
            <div className="flex justify-between items-center p-6 border-b border-gray-100 bg-gray-50">
              <h3 className="text-xl font-bold text-gray-900 flex items-center">
                <ClockIcon className="h-6 w-6 mr-2 text-red-600" />
                Reschedule Appointment
              </h3>
              <button onClick={() => setIsRescheduleOpen(false)} className="text-gray-400 hover:text-gray-600 hover:bg-gray-200 p-2 rounded-full transition-colors">
                <XMarkIcon className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleRescheduleSubmit} className="p-6 space-y-6">
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">New Date</label>
                <input
                  type="date"
                  required
                  value={rescheduleData.date}
                  onChange={(e) => setRescheduleData({ ...rescheduleData, date: e.target.value })}
                  min={new Date().toISOString().split('T')[0]}
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-red-500 transition-all font-medium text-gray-900"
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-700 mb-3">Available Morning Slots</label>
                <div className="grid grid-cols-3 gap-2">
                  {morningSlots.map(time => (
                    <button key={time} type="button"
                      onClick={() => setRescheduleData({ ...rescheduleData, timeSlot: time })}
                      className={`py-2 rounded-lg text-xs font-bold transition-all border
                        ${rescheduleData.timeSlot === time
                          ? 'bg-red-600 text-white border-red-600 shadow-md'
                          : 'bg-white text-gray-700 border-gray-200 hover:border-red-300 hover:text-red-600'
                        }`}
                    >
                      {time}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-700 mb-3">Available Afternoon Slots</label>
                <div className="grid grid-cols-3 gap-2">
                  {afternoonSlots.map(time => (
                    <button key={time} type="button"
                      onClick={() => setRescheduleData({ ...rescheduleData, timeSlot: time })}
                      className={`py-2 rounded-lg text-xs font-bold transition-all border
                        ${rescheduleData.timeSlot === time
                          ? 'bg-red-600 text-white border-red-600 shadow-md'
                          : 'bg-white text-gray-700 border-gray-200 hover:border-red-300 hover:text-red-600'
                        }`}
                    >
                      {time}
                    </button>
                  ))}
                </div>
              </div>

              <div className="pt-6 border-t border-gray-100 flex justify-end space-x-3">
                <button type="button" onClick={() => setIsRescheduleOpen(false)} className="px-6 py-3 border border-gray-200 text-gray-700 font-bold rounded-xl hover:bg-gray-50 transition-all">
                  Discard
                </button>
                <button type="submit" className="px-6 py-3 bg-red-600 text-white font-bold rounded-xl hover:bg-red-700 shadow-md transition-all">
                  Confirm Reschedule
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
