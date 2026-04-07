import Link from 'next/link';

export default function PatientLayout({ children }) {
  return (
    <div className="h-screen bg-gray-100 flex font-sans text-gray-800">
      
      {/* PATIENT SIDEBAR */}
      <aside className="w-64 bg-white shadow-md flex flex-col">
        <div className="p-6 border-b border-gray-100">
          <h1 className="text-2xl font-bold text-red-600">MediCare+</h1>
          <p className="text-sm text-gray-500">Patient Portal</p>
        </div>
        <nav className="flex-1 p-4 space-y-2">
          <Link href="/patient" className="block px-4 py-3 text-gray-600 hover:bg-red-50 hover:text-red-600 rounded-lg transition-colors">
            Dashboard
          </Link>
          <Link href="/patient/booking" className="block px-4 py-3 text-gray-600 hover:bg-red-50 hover:text-red-600 rounded-lg transition-colors">
            Book Appointment
          </Link>
          <Link href="/patient/appointments" className="block px-4 py-3 text-gray-600 hover:bg-red-50 hover:text-red-600 rounded-lg transition-colors">
            My Appointments
          </Link>
          <Link href="/patient/history" className="block px-4 py-3 text-gray-600 hover:bg-red-50 hover:text-red-600 rounded-lg transition-colors">
            Medical History
          </Link>
        </nav>
        <div className="p-4 border-t border-gray-100 justify-between gap-2 flex">
          <Link href="/patient/logout" className="w-full py-2 text-left px-4 text-gray-600 hover:text-red-600 transition-colors">
            Log Out
          </Link>
          <Link href="/patient/profile" className="w-full py-2 text-left px-4 text-gray-600 hover:text-red-600 transition-colors">
            Profile
          </Link>
        </div>
      </aside>

      {/* DYNAMIC PAGE CONTENT */}
      <main className="flex-1 overflow-y-auto">
        {children}
      </main>

    </div>
  );
}