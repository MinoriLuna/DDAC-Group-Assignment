'use client';
import { useRouter, usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';
import Link from 'next/link';

export default function DoctorLayout({ children }) {
  const router = useRouter();
  const pathname = usePathname();
  const [doctorName, setDoctorName] = useState('Doctor');

  useEffect(() => {
    const token = localStorage.getItem('token');
    const storedUser = localStorage.getItem('user');

    // No token or no user → back to login
    if (!token || !storedUser) {
      router.push('/login');
      return;
    }

    const user = JSON.parse(storedUser);

    // Wrong role → back to login
    if (user.role !== 'Doctor') {
      router.push('/login');
      return;
    }

    setDoctorName(user.fullName || 'Doctor');
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    router.push('/login');
  };

  return (
    <div className="h-screen bg-gray-50 flex font-sans text-gray-800">
      {/* SIDEBAR */}
      <aside className="w-72 bg-white shadow-xl flex flex-col border-r border-gray-100">
        <div className="p-8">
          <h1 className="text-2xl font-black text-red-600 tracking-tighter">
            MediCare<span className="text-black">+</span>
          </h1>
          <div className="mt-2 flex items-center gap-2">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
            <p className="text-xs font-bold text-gray-400 uppercase tracking-widest truncate">
              {doctorName}
            </p>
          </div>
          <span className="mt-2 inline-block text-[10px] font-black text-red-600 bg-red-50 px-2 py-0.5 rounded-full uppercase tracking-widest">
            Doctor
          </span>
        </div>

        <nav className="flex-1 px-4 space-y-1">
          <SidebarLink
            href="/doctor"
            label="Dashboard"
            pathname={pathname}
            exact
          />
          <SidebarLink
            href="/doctor/schedule"
            label="My Schedule"
            pathname={pathname}
          />
          <SidebarLink
            href="/doctor/patients"
            label="My Patients"
            pathname={pathname}
          />
          <SidebarLink
            href="/doctor/prescriptions"
            label="Prescriptions"
            pathname={pathname}
          />
          <SidebarLink
            href="/doctor/profile"
            label="Profile"
            pathname={pathname}
          />
        </nav>

        <div className="p-4 border-t border-gray-100">
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-4 py-3 text-sm font-bold text-red-600 hover:bg-red-50 rounded-xl transition-all"
          >
            Log Out
          </button>
        </div>
      </aside>

      {/* MAIN CONTENT */}
      <main className="flex-1 overflow-y-auto">{children}</main>
    </div>
  );
}

// Active state: exact match for /doctor, prefix match for all sub-routes
function SidebarLink({ href, label, pathname, exact = false }) {
  const isActive = exact
    ? pathname === href
    : pathname === href || pathname?.startsWith(href + '/');

  return (
    <Link
      href={href}
      className={`flex items-center gap-3 px-4 py-3.5 font-semibold rounded-xl transition-all ${
        isActive
          ? 'bg-red-50 text-red-600'
          : 'text-gray-600 hover:bg-red-50 hover:text-red-600'
      }`}
    >
      {label}
    </Link>
  );
}
