'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  UsersIcon,
  CalendarIcon,
  UserPlusIcon,
  ClockIcon,
  CheckBadgeIcon,
  XMarkIcon,
  ChevronLeftIcon,
  ChevronRightIcon
} from '@heroicons/react/24/outline';
import { ArrowTrendingUpIcon } from '@heroicons/react/24/solid';

const todayISO = () => new Date().toISOString().split('T')[0];

export default function ReceptionistDashboard() {
  const [showCalendar, setShowCalendar] = useState(false);
  const [checkInTarget, setCheckInTarget]   = useState(null);
  const [dequeueTarget, setDequeueTarget]   = useState(null);
  const [todayAppointments, setTodayAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [userName, setUserName] = useState('there');

  useEffect(() => {
    try {
      const user = JSON.parse(localStorage.getItem('user') || '{}');
      if (user.fullName) setUserName(user.fullName.split(' ')[0]);
    } catch (_) {}
  }, []);

  const fetchToday = () => {
    setLoading(true);
    fetch(`http://localhost:5230/api/receptionist/appointments?date=${todayISO()}`)
      .then(r => r.json())
      .then(data => setTodayAppointments(Array.isArray(data) ? data : []))
      .catch(console.error)
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchToday(); }, []);

  const currentQueue = todayAppointments.filter(a =>
    a.status === 'Checked-In' || a.status === 'In Consultation'
  ).map(a => ({
    id: a.id,
    name: a.patientName,
    time: a.time,
    status: a.status === 'Checked-In' ? 'Checked In' : 'With Doctor',
    room: '-'
  }));

  const upcomingAppointments = todayAppointments.filter(a =>
    a.status === 'Scheduled'
  ).map(a => ({
    id: a.id,
    name: a.patientName,
    time: a.time,
    type: a.reason || 'Consultation',
    doc: a.doctorName
  }));

  const completedToday = todayAppointments.filter(a => a.status === 'Completed').length;

  const confirmCheckIn = async () => {
    if (!checkInTarget) return;
    await fetch(`http://localhost:5230/api/receptionist/appointments/${checkInTarget.id}/status`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: 'Checked-In' })
    });
    setCheckInTarget(null);
    fetchToday();
  };

  const confirmDequeue = async () => {
    if (!dequeueTarget) return;
    await fetch(`http://localhost:5230/api/receptionist/appointments/${dequeueTarget.id}/status`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: 'Completed' })
    });
    setDequeueTarget(null);
    fetchToday();
  };

  const todayLabel = new Date().toLocaleDateString('en-US', {
    weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
  });

  const greeting = (() => {
    const h = new Date().getHours();
    if (h < 12) return 'Good morning';
    if (h < 17) return 'Good afternoon';
    return 'Good evening';
  })();

  return (
    <div className="p-10 max-w-7xl mx-auto space-y-8">

      {/* Welcome Section */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">{greeting}, {userName} 👋</h1>
          <p className="text-sm text-gray-500 mt-1 font-medium">Here is the clinic's overview for {todayLabel}.</p>
        </div>
        <div className="flex items-center bg-green-50 text-green-700 px-4 py-2 rounded-lg border border-green-200 font-bold text-sm shadow-sm">
          <span className="h-2 w-2 bg-green-500 rounded-full mr-2 animate-pulse"></span>
          Clinic is Open
        </div>
      </div>

      {/* Dashboard Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm relative overflow-hidden group hover:shadow-md transition">
          <div className="flex justify-between items-start mb-4 relative z-10">
            <div>
              <p className="text-gray-500 text-sm font-bold uppercase tracking-wider mb-1">In Clinic</p>
              <h3 className="text-4xl font-black text-gray-900">{loading ? '—' : currentQueue.length}</h3>
            </div>
            <div className="bg-red-50 p-2 rounded-lg text-red-500">
              <UsersIcon className="h-6 w-6" />
            </div>
          </div>
          <div className="text-xs text-gray-500 tracking-wide font-medium relative z-10">
            patients checked in
          </div>
          <UsersIcon className="absolute -bottom-4 -right-4 h-24 w-24 text-gray-50 opacity-50 group-hover:scale-110 transition duration-500" />
        </div>

        <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm relative overflow-hidden group hover:shadow-md transition">
          <div className="flex justify-between items-start mb-4 relative z-10">
            <div>
              <p className="text-gray-500 text-sm font-bold uppercase tracking-wider mb-1">Appts Today</p>
              <h3 className="text-4xl font-black text-gray-900">{loading ? '—' : todayAppointments.length}</h3>
            </div>
            <div className="bg-blue-50 p-2 rounded-lg text-blue-500">
              <CalendarIcon className="h-6 w-6" />
            </div>
          </div>
          <div className="flex items-center text-xs text-gray-500 tracking-wide font-medium relative z-10">
            <span className="text-green-500 font-bold bg-green-50 px-1 rounded mr-1">{completedToday} Done</span>
            | {todayAppointments.length - completedToday} Remaining
          </div>
          <CalendarIcon className="absolute -bottom-4 -right-4 h-24 w-24 text-gray-50 opacity-50 group-hover:scale-110 transition duration-500" />
        </div>

        <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm relative overflow-hidden group hover:shadow-md transition">
          <div className="flex justify-between items-start mb-4 relative z-10">
            <div>
              <p className="text-gray-500 text-sm font-bold uppercase tracking-wider mb-1">Upcoming</p>
              <h3 className="text-4xl font-black text-gray-900">{loading ? '—' : upcomingAppointments.length}</h3>
            </div>
            <div className="bg-purple-50 p-2 rounded-lg text-purple-500">
              <UserPlusIcon className="h-6 w-6" />
            </div>
          </div>
          <div className="flex items-center text-xs text-gray-500 tracking-wide font-medium relative z-10">
            <span className="text-purple-500 flex items-center mr-1">
              <ArrowTrendingUpIcon className="h-3 w-3 mr-1" />
            </span>
            scheduled arrivals
          </div>
          <UserPlusIcon className="absolute -bottom-4 -right-4 h-24 w-24 text-gray-50 opacity-50 group-hover:scale-110 transition duration-500" />
        </div>

        <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm relative overflow-hidden group hover:shadow-md transition">
          <div className="flex justify-between items-start mb-4 relative z-10">
            <div>
              <p className="text-gray-500 text-sm font-bold uppercase tracking-wider mb-1">Completed</p>
              <h3 className="text-4xl font-black text-gray-900">{loading ? '—' : completedToday}</h3>
            </div>
            <div className="bg-orange-50 p-2 rounded-lg text-orange-500">
              <ClockIcon className="h-6 w-6" />
            </div>
          </div>
          <div className="flex items-center text-xs text-green-500 tracking-wide font-medium relative z-10">
            appointments finished today
          </div>
          <ClockIcon className="absolute -bottom-4 -right-4 h-24 w-24 text-gray-50 opacity-50 group-hover:scale-110 transition duration-500" />
        </div>
      </div>

      {/* Live Queue & Upcoming */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">

        {/* Live Queue */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden flex flex-col">
          <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
            <h3 className="text-lg font-bold text-gray-900">Live Check-in Queue</h3>
            <Link href="/receptionist/appointments" className="text-sm font-bold text-red-600 hover:text-red-700">View All</Link>
          </div>
          <div className="flex-1 p-6">
            {loading ? (
              <div className="flex items-center justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-500"></div>
              </div>
            ) : currentQueue.length === 0 ? (
              <p className="text-center text-gray-400 text-sm py-8">No patients checked in yet.</p>
            ) : (
              <div className="space-y-4">
                {currentQueue.map((item) => (
                  <div key={item.id} className="flex items-center justify-between p-4 rounded-xl border border-gray-100 hover:border-red-100 hover:shadow-sm transition bg-white group">
                    <div className="flex items-center">
                      <div className="w-10 h-10 rounded-full bg-red-50 text-red-600 border border-red-100 flex items-center justify-center font-bold text-sm mr-4 group-hover:bg-red-600 group-hover:text-white transition-colors">
                        {item.name.charAt(0)}
                      </div>
                      <div>
                        <p className="font-bold text-gray-900 text-sm group-hover:text-red-700 transition-colors">{item.name}</p>
                        <p className="text-xs text-gray-400 font-mono mt-0.5">{item.time}</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-3">
                      <span className="text-xs font-bold text-gray-600 bg-gray-100 px-2.5 py-1 rounded-md">{item.room}</span>
                      <span className={`text-xs font-bold px-3 py-1 rounded-full border ${item.status === 'Checked In' ? 'bg-orange-50 text-orange-600 border-orange-100' : 'bg-blue-50 text-blue-600 border-blue-100'}`}>
                        {item.status}
                      </span>
                      <button
                        onClick={() => setDequeueTarget(item)}
                        className="p-1.5 rounded-lg text-gray-300 hover:text-red-500 hover:bg-red-50 transition-colors"
                        title="Mark as completed"
                      >
                        <XMarkIcon className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Upcoming Appointments */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden flex flex-col">
          <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
            <h3 className="text-lg font-bold text-gray-900">Upcoming Arrivals</h3>
            <button onClick={() => setShowCalendar(true)} className="text-sm font-bold text-red-600 hover:text-red-700">View Calendar</button>
          </div>
          <div className="flex-1 p-6">
            {loading ? (
              <div className="flex items-center justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-500"></div>
              </div>
            ) : upcomingAppointments.length === 0 ? (
              <p className="text-center text-gray-400 text-sm py-8">No upcoming appointments.</p>
            ) : (
              <div className="space-y-4">
                {upcomingAppointments.map((item) => (
                  <div key={item.id} className="flex items-start p-4 rounded-xl border border-gray-100 hover:border-gray-200 hover:shadow-sm transition bg-white">
                    <div className="flex flex-col items-center mr-4 bg-gray-50 px-3 py-2 rounded-lg border border-gray-100">
                      <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Time</span>
                      <span className="font-black text-gray-900 leading-tight">{item.time.split(' ')[0]}</span>
                      <span className="text-[10px] font-bold text-gray-500">{item.time.split(' ')[1]}</span>
                    </div>
                    <div className="flex-1">
                      <p className="font-bold text-gray-900 text-sm">{item.name}</p>
                      <p className="text-xs font-medium text-gray-500 mt-1 flex items-center">
                        <CheckBadgeIcon className="h-3 w-3 mr-1 text-red-500" />
                        {item.type} with <span className="text-gray-900 font-semibold ml-1">{item.doc}</span>
                      </p>
                    </div>
                    <button
                      onClick={() => setCheckInTarget(item)}
                      className="px-3 py-1.5 bg-white border border-gray-200 text-xs font-bold text-gray-700 hover:bg-red-600 hover:text-white hover:border-red-600 rounded shadow-sm transition-colors"
                    >
                      Check-in
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

      </div>

      {showCalendar && <CalendarModal onClose={() => setShowCalendar(false)} />}

      {/* Dequeue Confirmation Modal */}
      {dequeueTarget && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center" onClick={() => setDequeueTarget(null)}>
          <div className="bg-white rounded-2xl shadow-xl p-6 w-80" onClick={e => e.stopPropagation()}>
            <div className="flex items-center gap-3 mb-4">
              <div className="bg-red-50 p-2 rounded-xl">
                <XMarkIcon className="h-6 w-6 text-red-600" />
              </div>
              <h3 className="text-base font-extrabold text-gray-900">Mark as Completed</h3>
            </div>
            <p className="text-sm text-gray-500 mb-1">You are completing:</p>
            <p className="text-sm font-bold text-gray-900 mb-5">{dequeueTarget.name}</p>
            <div className="flex gap-3">
              <button onClick={() => setDequeueTarget(null)} className="flex-1 py-2.5 text-sm font-bold text-gray-600 border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors">
                Cancel
              </button>
              <button onClick={confirmDequeue} className="flex-1 py-2.5 text-sm font-bold text-white bg-red-600 rounded-xl hover:bg-red-700 transition-colors">
                Confirm
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Check-in Confirmation Modal */}
      {checkInTarget && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center" onClick={() => setCheckInTarget(null)}>
          <div className="bg-white rounded-2xl shadow-xl p-6 w-80" onClick={e => e.stopPropagation()}>
            <div className="flex items-center gap-3 mb-4">
              <div className="bg-green-50 p-2 rounded-xl">
                <CheckBadgeIcon className="h-6 w-6 text-green-600" />
              </div>
              <h3 className="text-base font-extrabold text-gray-900">Confirm Check-in</h3>
            </div>
            <p className="text-sm text-gray-500 mb-1">You are checking in:</p>
            <p className="text-sm font-bold text-gray-900 mb-1">{checkInTarget.name}</p>
            <p className="text-xs text-gray-500 mb-5">
              {checkInTarget.type} · {checkInTarget.doc} · {checkInTarget.time}
            </p>
            <div className="flex gap-3">
              <button onClick={() => setCheckInTarget(null)} className="flex-1 py-2.5 text-sm font-bold text-gray-600 border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors">
                Cancel
              </button>
              <button onClick={confirmCheckIn} className="flex-1 py-2.5 text-sm font-bold text-white bg-red-600 rounded-xl hover:bg-red-700 transition-colors">
                Confirm
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}

const MONTH_NAMES = ['January','February','March','April','May','June','July','August','September','October','November','December'];
const DAY_NAMES = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'];
const WEEK_DAY_NAMES = ['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'];

const dateKey = (d) => d.toISOString().split('T')[0];

function CalendarModal({ onClose }) {
  const today = new Date();
  const [viewDate, setViewDate] = useState(new Date(today.getFullYear(), today.getMonth(), 1));
  const [selectedDate, setSelected] = useState(today);
  const [daySchedule, setDaySchedule] = useState([]);
  const [loadingDay, setLoadingDay] = useState(false);
  const [apptDays, setApptDays] = useState(new Set());

  const year  = viewDate.getFullYear();
  const month = viewDate.getMonth();
  const firstDayOfWeek = new Date(year, month, 1).getDay();
  const daysInMonth    = new Date(year, month + 1, 0).getDate();

  const cells = [
    ...Array(firstDayOfWeek).fill(null),
    ...Array.from({ length: daysInMonth }, (_, i) => i + 1),
  ];

  const fetchDay = (date) => {
    setLoadingDay(true);
    fetch(`http://localhost:5230/api/receptionist/appointments?date=${dateKey(date)}`)
      .then(r => r.json())
      .then(data => {
        const appts = Array.isArray(data) ? data : [];
        setDaySchedule(appts);
        setApptDays(prev => {
          const next = new Set(prev);
          if (appts.length > 0) next.add(date.getDate());
          return next;
        });
      })
      .catch(console.error)
      .finally(() => setLoadingDay(false));
  };

  useEffect(() => { fetchDay(selectedDate); }, []);

  const handleSelectDate = (day) => {
    const date = new Date(year, month, day);
    setSelected(date);
    fetchDay(date);
  };

  const selLabel = `${WEEK_DAY_NAMES[selectedDate.getDay()]}, ${MONTH_NAMES[selectedDate.getMonth()]} ${selectedDate.getDate()}`;

  return (
    <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="relative bg-white rounded-2xl shadow-xl flex overflow-hidden w-full max-w-2xl max-h-[85vh]" onClick={e => e.stopPropagation()}>

        {/* LEFT: Calendar */}
        <div className="p-6 w-72 flex-shrink-0 border-r border-gray-100 flex flex-col">
          <button onClick={onClose} className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors">
            <XMarkIcon className="h-5 w-5" />
          </button>

          <div className="flex justify-between items-center mb-5">
            <button onClick={() => setViewDate(new Date(year, month - 1, 1))} className="p-1 rounded-lg hover:bg-gray-100 transition-colors">
              <ChevronLeftIcon className="h-4 w-4 text-gray-500" />
            </button>
            <span className="text-sm font-extrabold text-gray-900">{MONTH_NAMES[month]} {year}</span>
            <button onClick={() => setViewDate(new Date(year, month + 1, 1))} className="p-1 rounded-lg hover:bg-gray-100 transition-colors">
              <ChevronRightIcon className="h-4 w-4 text-gray-500" />
            </button>
          </div>

          <div className="grid grid-cols-7 mb-1">
            {DAY_NAMES.map(d => (
              <div key={d} className="text-center text-[10px] font-bold text-gray-400">{d}</div>
            ))}
          </div>

          <div className="grid grid-cols-7 gap-y-0.5 flex-1">
            {cells.map((day, i) => {
              if (!day) return <div key={i} />;
              const thisDate   = new Date(year, month, day);
              const isToday    = dateKey(thisDate) === dateKey(today);
              const isSelected = dateKey(thisDate) === dateKey(selectedDate);
              const hasAppt    = apptDays.has(day);
              return (
                <div key={i} className="flex items-center justify-center py-0.5">
                  <button
                    onClick={() => handleSelectDate(day)}
                    className={`relative flex items-center justify-center h-8 w-8 rounded-full text-xs font-semibold transition-colors
                      ${isToday ? 'bg-red-600 text-white' : ''}
                      ${isSelected && !isToday ? 'bg-red-100 text-red-700 ring-1 ring-red-300' : ''}
                      ${!isToday && !isSelected ? 'text-gray-700 hover:bg-gray-100' : ''}`}
                  >
                    {day}
                    {hasAppt && !isToday && (
                      <span className="absolute bottom-0.5 left-1/2 -translate-x-1/2 h-1 w-1 bg-red-400 rounded-full" />
                    )}
                  </button>
                </div>
              );
            })}
          </div>

          <div className="mt-4 pt-4 border-t border-gray-100 flex items-center justify-between">
            <span className="flex items-center gap-1.5 text-[11px] text-gray-400 font-medium">
              <span className="h-1.5 w-1.5 bg-red-400 rounded-full" /> Has appt.
            </span>
            <Link href="/receptionist/appointments" onClick={onClose} className="text-xs font-bold text-red-600 hover:text-red-700 transition-colors">
              Full Schedule →
            </Link>
          </div>
        </div>

        {/* RIGHT: Day Schedule */}
        <div className="flex-1 flex flex-col bg-gray-50 overflow-hidden">
          <div className="px-6 py-5 border-b border-gray-100 bg-white">
            <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Schedule</p>
            <h4 className="text-base font-extrabold text-gray-900 mt-0.5">{selLabel}</h4>
          </div>

          <div className="flex-1 overflow-y-auto p-5">
            {loadingDay ? (
              <div className="flex items-center justify-center h-full">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-500"></div>
              </div>
            ) : daySchedule.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-gray-400 space-y-2">
                <CalendarIcon className="h-9 w-9 text-gray-200" />
                <p className="text-sm font-medium text-gray-400">No appointments this day</p>
              </div>
            ) : (
              <div className="space-y-3">
                {daySchedule.map((appt) => (
                  <div key={appt.id} className="bg-white rounded-xl border border-gray-100 px-4 py-3 shadow-sm flex items-start gap-3">
                    <div className="text-xs font-black text-red-600 w-20 shrink-0 pt-0.5">{appt.time}</div>
                    <div>
                      <p className="text-sm font-bold text-gray-900 leading-tight">{appt.patientName}</p>
                      <p className="text-xs text-gray-400 mt-0.5">{appt.reason || 'Consultation'} · {appt.doctorName}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}
