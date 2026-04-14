'use client';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import Link from 'next/link';

export default function PatientLayout({ children }) {
  const router = useRouter();
  const [userName, setUserName] = useState('Patient');

  // When the page loads, grab the user's name from the "Pocket"
  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      const user = JSON.parse(storedUser);
      setUserName(user.fullName || 'Patient');
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
      <aside className="w-72 bg-white shadow-xl flex flex-col border-r border-gray-100">
        <div className="p-8">
          <h1 className="text-2xl font-black text-red-600 tracking-tighter">
            MediCare<span className="text-black">+</span>
          </h1>
          <div className="mt-2 flex items-center gap-2">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
            <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">
              {userName}
            </p>
          </div>
        </div>

        <nav className="flex-1 px-4 space-y-1">
          <SidebarLink href="/patient" label="Dashboard" />
          <SidebarLink href="/patient/booking" label="Book Appointment" />
          <SidebarLink href="/patient/appointments" label="My Appointments" />
          <SidebarLink href="/patient/history" label="Medical History" />
          <SidebarLink href="/patient/documents" label="Medical Vault" />
        </nav>

        {/* --- BOTTOM ACTIONS --- */}
        <div className="p-4 border-t border-gray-100 space-y-2">
          <Link href="/patient/profile" className="flex items-center gap-3 px-4 py-3 text-sm font-bold text-gray-600 hover:bg-gray-50 rounded-xl transition-all">
            Profile Settings
          </Link>
          <button 
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-4 py-3 text-sm font-bold text-red-600 hover:bg-red-50 rounded-xl transition-all"
          >
             Log Out
          </button>
        </div>
      </aside>

      {/* --- CONTENT AREA --- */}
      <main className="flex-1 overflow-y-auto p-10">
        {children}
      </main>

    </div>
  );
}

function SidebarLink({ href, icon, label }) {
  return (
    <Link href={href} className="flex items-center gap-3 px-4 py-3.5 text-gray-600 font-semibold hover:bg-red-50 hover:text-red-600 rounded-xl transition-all group">
      <span className="text-xl group-hover:scale-110 transition-transform">{icon}</span>
      {label}
    </Link>
  );
}