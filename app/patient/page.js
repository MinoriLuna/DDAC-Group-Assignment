import Link from 'next/link';

export default function PatientDashboard() {
  return (
    <div className="min-h-screen bg-gray-100 flex font-sans text-gray-800">
      
      {/* SIDEBAR NAVIGATION */}
      <aside className="w-64 bg-white shadow-md flex flex-col">
        <div className="p-6 border-b border-gray-100">
          <h1 className="text-2xl font-bold text-red-600">MediLab</h1>
          <p className="text-sm text-gray-500">Patient Portal</p>
        </div>
        <nav className="flex-1 p-4 space-y-2">
          <a href="#" className="block px-4 py-3 bg-red-50 text-red-600 rounded-lg font-medium transition-colors">
            Dashboard
          </a>
          <a href="#" className="block px-4 py-3 text-gray-600 hover:bg-gray-50 rounded-lg transition-colors">
            Book Appointment
          </a>
          <a href="#" className="block px-4 py-3 text-gray-600 hover:bg-gray-50 rounded-lg transition-colors">
            My Appointments
          </a>
          <a href="#" className="block px-4 py-3 text-gray-600 hover:bg-gray-50 rounded-lg transition-colors">
            Medical History
          </a>
        </nav>
        <div className="p-4 border-t border-gray-100">
          <button className="w-full py-2 text-left px-4 text-gray-600 hover:text-red-600 transition-colors">
            Log Out
          </button>
        </div>
      </aside>

      {/* MAIN CONTENT AREA */}
      <main className="flex-1 p-10">
        <header className="mb-8 flex justify-between items-center">
          <div>
            <h2 className="text-3xl font-bold text-gray-800">Welcome back, Ashton</h2>
            <p className="text-gray-500 mt-1">Here is a summary of your health journey.</p>
          </div>
          <button className="bg-red-600 hover:bg-red-700 text-white px-6 py-3 rounded-lg font-medium shadow-sm transition-all">
            Book Appointment
          </button>
        </header>

        {/* DASHBOARD GRID */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          
          {/* UPCOMING APPOINTMENT CARD */}
          <div className="bg-white p-6 rounded-xl shadow-sm border-l-4 border-red-600 col-span-2">
            <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-4">Next Appointment</h3>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-2xl font-bold text-gray-800">General Checkup</p>
                <p className="text-gray-600 mt-1">with <span className="font-medium text-gray-800">Dr. Yuhong</span></p>
              </div>
              <div className="text-right">
                <p className="text-xl font-bold text-red-600">Tomorrow</p>
                <p className="text-gray-500">10:00 AM</p>
              </div>
            </div>
            <div className="mt-6 flex gap-3">
              <button className="bg-red-50 text-red-600 hover:bg-red-100 px-4 py-2 rounded-md text-sm font-medium transition-colors">
                Reschedule
              </button>
              <button className="text-gray-500 hover:text-red-600 px-4 py-2 text-sm font-medium transition-colors">
                Cancel
              </button>
            </div>
          </div>

          {/* QUICK STATS CARD */}
          <div className="bg-white p-6 rounded-xl shadow-sm">
             <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-4">Quick Stats</h3>
             <ul className="space-y-4">
               <li className="flex justify-between items-center border-b border-gray-50 pb-2">
                 <span className="text-gray-600">Pending Bookings</span>
                 <span className="bg-red-100 text-red-600 font-bold px-2 py-1 rounded-full text-xs">1</span>
               </li>
               <li className="flex justify-between items-center border-b border-gray-50 pb-2">
                 <span className="text-gray-600">New Lab Results</span>
                 <span className="bg-gray-100 text-gray-600 font-bold px-2 py-1 rounded-full text-xs">0</span>
               </li>
             </ul>
          </div>

        </div>
      </main>
    </div>
  );
}