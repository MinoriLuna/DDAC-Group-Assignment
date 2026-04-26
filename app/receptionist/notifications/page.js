'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  BellAlertIcon,
  CheckCircleIcon,
  ClockIcon,
  CalendarIcon,
  InformationCircleIcon
} from '@heroicons/react/24/outline';

const getNotifStyle = (type) => {
  switch (type) {
    case 'appointment':
      return { Icon: ClockIcon, color: 'text-orange-600', bg: 'bg-orange-50', link: '/receptionist/appointments' };
    case 'cancellation':
      return { Icon: CalendarIcon, color: 'text-red-600', bg: 'bg-red-50', link: '/receptionist/appointments' };
    case 'info':
      return { Icon: InformationCircleIcon, color: 'text-blue-600', bg: 'bg-blue-50', link: '/receptionist' };
    default:
      return { Icon: CheckCircleIcon, color: 'text-green-600', bg: 'bg-green-50', link: '/receptionist/patients' };
  }
};

const timeAgo = (dateStr) => {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 60) return `${mins} min${mins !== 1 ? 's' : ''} ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs} hour${hrs !== 1 ? 's' : ''} ago`;
  return `${Math.floor(hrs / 24)} day${Math.floor(hrs / 24) !== 1 ? 's' : ''} ago`;
};

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  const token = typeof window !== 'undefined' ? localStorage.getItem('token') : '';

  const fetchNotifications = () => {
    if (!token) { setLoading(false); return; }
    fetch('http://localhost:5230/api/receptionist/notifications', {
      headers: { 'Authorization': `Bearer ${token}` }
    })
      .then(r => r.json())
      .then(data => setNotifications(Array.isArray(data) ? data : []))
      .catch(console.error)
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchNotifications(); }, []);

  const markAllAsRead = async () => {
    await fetch('http://localhost:5230/api/receptionist/notifications/read-all', {
      method: 'PATCH',
      headers: { 'Authorization': `Bearer ${token}` }
    });
    setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
  };

  const markAsRead = async (id) => {
    await fetch(`http://localhost:5230/api/receptionist/notifications/${id}/read`, {
      method: 'PATCH',
      headers: { 'Authorization': `Bearer ${token}` }
    });
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, isRead: true } : n));
  };

  return (
    <div className="min-h-screen bg-gray-50 py-10 px-4 sm:px-6 lg:px-8 font-sans">
      <div className="max-w-4xl mx-auto space-y-8">

        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h2 className="text-3xl font-extrabold text-gray-900 tracking-tight flex items-center">
              <BellAlertIcon className="h-8 w-8 mr-3 text-red-600" />
              Notifications Center
            </h2>
            <p className="mt-2 text-sm text-gray-500">
              Stay updated on upcoming appointments, patient activities, and system alerts.
            </p>
          </div>
          {notifications.some(n => !n.isRead) && (
            <button
              onClick={markAllAsRead}
              className="text-sm font-bold text-gray-500 hover:text-red-600 transition-colors"
            >
              Mark all as read
            </button>
          )}
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          {loading ? (
            <div className="p-12 text-center">
              <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-red-500 mx-auto mb-3"></div>
              <p className="text-gray-500 font-medium">Loading notifications...</p>
            </div>
          ) : notifications.length === 0 ? (
            <div className="p-12 text-center">
              <BellAlertIcon className="h-12 w-12 text-gray-200 mx-auto mb-3" />
              <p className="text-gray-500 font-medium">No notifications yet.</p>
            </div>
          ) : (
            <div className="divide-y divide-gray-100 flex flex-col">
              {notifications.map((notif) => {
                const { Icon, color, bg, link } = getNotifStyle(notif.type);
                return (
                  <Link
                    href={link}
                    key={notif.id}
                    onClick={() => markAsRead(notif.id)}
                    className="w-full"
                  >
                    <div className={`p-6 flex items-start gap-4 transition-colors hover:bg-gray-50 cursor-pointer ${!notif.isRead ? 'bg-red-50/30' : 'bg-white'}`}>
                      <div className={`shrink-0 p-3 rounded-xl ${bg}`}>
                        <Icon className={`h-6 w-6 ${color}`} />
                      </div>
                      <div className="flex-1">
                        <div className="flex justify-between items-start mb-1">
                          <h3 className={`text-base font-bold ${!notif.isRead ? 'text-gray-900' : 'text-gray-700'}`}>
                            {notif.title}
                          </h3>
                          <span className="text-xs font-bold text-gray-400 whitespace-nowrap ml-4">
                            {timeAgo(notif.createdAt)}
                          </span>
                        </div>
                        <p className="text-sm text-gray-500 leading-relaxed max-w-2xl">
                          {notif.message}
                        </p>
                      </div>
                      {!notif.isRead && (
                        <div className="shrink-0 mt-2">
                          <span className="block h-2.5 w-2.5 bg-red-600 rounded-full shadow-sm"></span>
                        </div>
                      )}
                    </div>
                  </Link>
                );
              })}
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
