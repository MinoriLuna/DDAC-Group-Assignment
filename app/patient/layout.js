'use client';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import Link from 'next/link';


export default function PatientLayout({ children }) {
  const router = useRouter();
  const [userName, setUserName] = useState('Patient');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(null); // null = not yet mounted

  // When the page loads, grab the user's name from the "Pocket"
  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      const user = JSON.parse(storedUser);
      setUserName(user.fullName || 'Patient');
    }

    // Screen size detection — 1024px is the lg breakpoint
    const mq = window.matchMedia('(max-width: 1023px)');
    setIsMobile(mq.matches);
    const handler = (e) => {
      setIsMobile(e.matches);
      if (!e.matches) setSidebarOpen(false); // close drawer when going desktop
    };
    mq.addEventListener('change', handler);
    return () => mq.removeEventListener('change', handler);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    router.push('/login');
  };

  return (
    <div className="font-sans text-gray-800 h-screen overflow-hidden">

      {/* ── MOBILE OVERLAY ── */}
      {isMobile === true && sidebarOpen && (
        <>
          <div
            className="fixed inset-0 bg-black/40 z-20"
            onClick={() => setSidebarOpen(false)}
          />
          <aside className="fixed inset-y-0 left-0 w-72 bg-white shadow-xl flex flex-col border-r border-gray-100 z-30">
            <SidebarContent
              userName={userName}
              onLogout={handleLogout}
              onClose={() => setSidebarOpen(false)}
              showClose
            />
          </aside>
        </>
      )}

      {/* ── MAIN LAYOUT ── */}
      <div className="flex h-screen bg-gray-50">

        {/* Desktop sidebar */}
        {isMobile === false && (
          <aside className="flex flex-col w-72 flex-shrink-0 bg-white shadow-xl border-r border-gray-100">
            <SidebarContent userName={userName} onLogout={handleLogout} />
          </aside>
        )}

        {/* Right side */}
        <div className="flex flex-col flex-1 min-w-0">

          {/* Mobile top bar */}
          {isMobile === true && (
            <header className="flex items-center justify-between bg-white border-b border-gray-100 px-4 py-3 shadow-sm flex-shrink-0">
              <button
                onClick={() => setSidebarOpen(true)}
                className="p-1 text-gray-600 hover:text-red-600 transition-colors"
                aria-label="Open menu"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              </button>
              <h1 className="text-lg font-black text-red-600 tracking-tighter">
                MediCare<span className="text-black">+</span>
              </h1>
              <span className="text-xs font-bold bg-red-100 text-red-600 px-2 py-0.5 rounded-full">Patient</span>
            </header>
          )}

          <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-10">
            {children}
          </main>

        </div>
      </div>
    </div>
  );
}

function SidebarContent({ userName, onLogout, onClose, showClose }) {
  return (
    <>
      <div className="p-6 lg:p-8">
        <div className="flex items-center justify-between">
          <h1 className="text-xl font-black text-red-600 tracking-tighter">
            MediCare<span className="text-black">+</span>
          </h1>
          {showClose && (
            <button onClick={onClose} className="text-gray-400 hover:text-gray-600" aria-label="Close menu">
              ✕
            </button>
          )}
        </div>
        <div className="mt-3 flex items-center gap-2">
          <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
          <p className="text-xs font-bold text-gray-400 uppercase tracking-widest truncate">{userName}</p>
        </div>
      </div>

      <nav className="flex-1 px-3 space-y-1">
        <SidebarLink href="/patient"              label="Dashboard"        onClick={onClose} />
        <SidebarLink href="/patient/booking"      label="Book Appointment" onClick={onClose} />
        <SidebarLink href="/patient/appointments" label="My Appointments"  onClick={onClose} />
        <SidebarLink href="/patient/history"      label="Medical History"  onClick={onClose} />
        <SidebarLink href="/patient/documents"    label="Medical Vault"    onClick={onClose} />
        <SidebarLink href="/patient/rating"       label="Rate Experience"  onClick={onClose} />
      </nav>

      <div className="p-4 border-t border-gray-100 space-y-2">
        <Link
          href="/patient/profile"
          onClick={onClose}
          className="flex items-center gap-3 px-4 py-3 text-sm font-bold text-gray-600 hover:bg-gray-50 rounded-xl transition-all"
        >
          Profile Settings
        </Link>
        <button
          onClick={onLogout}
          className="w-full flex items-center gap-3 px-4 py-3 text-sm font-bold text-red-600 hover:bg-red-50 rounded-xl transition-all"
        >
          Log Out
        </button>
      </div>
    </>
  );
}

function SidebarLink({ href, label, onClick }) {
  return (
    <Link
      href={href}
      onClick={onClick}
      className="flex items-center px-4 py-3 text-gray-600 font-semibold hover:bg-red-50 hover:text-red-600 rounded-xl transition-all text-sm"
    >
      {label}
    </Link>
  );
}
