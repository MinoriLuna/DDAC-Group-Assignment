'use client';
import { useRouter, usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { BellAlertIcon, ChatBubbleLeftRightIcon } from '@heroicons/react/24/outline';

export default function ReceptionistLayout({ children }) {
  const router = useRouter();
  const [userName, setUserName] = useState('');

  useEffect(() => {
    const stored = localStorage.getItem('user');
    if (stored) {
      const user = JSON.parse(stored);
      setUserName(user.fullName || '');
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    router.push('/login');
  };

  return (
    <div className="h-screen bg-gray-50 flex font-sans text-gray-800">

      {/* --- SIDEBAR --- */}
      <aside className="w-72 flex-shrink-0 bg-white shadow-xl flex flex-col border-r border-gray-100 z-20">
        <div className="p-8">
          <h1 className="text-2xl font-black text-red-600 tracking-tighter">
            MediCare<span className="text-black">+</span>
          </h1>
          <div className="mt-2 flex items-center gap-2">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
            <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">
              Receptionist
            </p>
          </div>
        </div>

        <nav className="flex-1 px-4 space-y-1">
          <SidebarLink href="/receptionist" label="Dashboard" />
          <SidebarLink href="/receptionist/patients/new" label="Register Patient" />
          <SidebarLink href="/receptionist/patients" label="Search Directory" />
          <SidebarLink href="/receptionist/appointments" label="Manage Appointments" />
          <SidebarLink href="/receptionist/billing" label="Billing & Payments" />
        </nav>

        {/* --- BOTTOM ACTIONS --- */}
        <div className="p-4 border-t border-gray-100 space-y-2">
          {/* Notification & Avatar Area */}
          <div className="flex items-center justify-between px-4 py-3 mb-2">
            <Link href="/receptionist/profile" className="flex items-center gap-3 group">
              <div className="h-10 w-10 rounded-full bg-gray-200 shadow-sm flex items-center justify-center overflow-hidden ring-2 ring-transparent group-hover:ring-red-400 transition-all">
                <img src={`https://ui-avatars.com/api/?name=${encodeURIComponent(userName || 'User')}&background=fecaca&color=dc2626`} alt="Avatar" />
              </div>
              <div>
                <p className="text-sm font-bold text-gray-900 group-hover:text-red-600 transition-colors">{userName}</p>
                <p className="text-xs text-gray-400 font-medium">Edit profile</p>
              </div>
            </Link>
            {/* Action Icons */}
            <div className="flex gap-1">
              <Link href="/receptionist/messages">
                <button className="relative p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-all group" title="Internal Messages">
                  <ChatBubbleLeftRightIcon className="h-6 w-6" />
                </button>
              </Link>
              <Link href="/receptionist/notifications">
                <button className="relative p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all group" title="Upcoming Appointments">
                  <BellAlertIcon className="h-6 w-6" />
                  <span className="absolute top-1.5 right-2 h-2.5 w-2.5 bg-red-600 border-2 border-white rounded-full animate-pulse"></span>
                </button>
              </Link>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="w-full flex items-center justify-center gap-3 px-4 py-3 text-sm font-bold text-red-600 hover:bg-red-50 rounded-xl transition-all"
          >
            Log Out
          </button>
        </div>
      </aside>

      {/* --- CONTENT AREA --- */}
      <main className="flex-1 overflow-y-auto w-full relative h-full min-h-0">
        {children}
      </main>

    </div>
  );
}

// These are standalone action pages — they should only highlight their own link, not a parent section
const EXACT_HREFS = [
  '/receptionist/patients/new',
  '/receptionist/appointments/new',
  '/receptionist/billing/new',
  '/receptionist/profile',
];

function SidebarLink({ href, label }) {
  const rawPathname = usePathname();
  const pathname = rawPathname.length > 1 ? rawPathname.replace(/\/$/, '') : rawPathname;

  let isActive;
  if (href === '/receptionist' || EXACT_HREFS.includes(href)) {
    isActive = pathname === href;
  } else {
    isActive = pathname === href || (pathname.startsWith(href + '/') && !EXACT_HREFS.includes(pathname));
  }

  return (
    <Link
      href={href}
      className={`flex items-center px-4 py-3.5 font-semibold rounded-xl transition-all
        ${isActive
          ? 'bg-red-600 text-white shadow-sm'
          : 'text-gray-600 hover:bg-red-50 hover:text-red-600'
        }`}
    >
      {label}
    </Link>
  );
}
