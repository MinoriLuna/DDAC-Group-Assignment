'use client';

export default function AppointmentsPage() {
  return (
    <div className="min-h-screen p-10 font-sans">
      <div className="max-w-4xl mx-auto">
        <h2 className="text-3xl font-bold text-gray-800 mb-8">My Appointments</h2>

        {/* Upcoming Section */}
        <h3 className="text-lg font-bold text-gray-500 uppercase tracking-wider mb-4">Upcoming</h3>
        <div className="bg-white p-6 rounded-xl shadow-sm border-l-4 border-red-600 mb-10 flex justify-between items-center">
          <div>
            <p className="text-xl font-bold text-gray-800">General Checkup</p>
            <p className="text-gray-600">Dr. Yuhong</p>
            <p className="text-red-600 font-medium mt-2">Tomorrow • 10:00 AM</p>
          </div>
          <button className="border border-red-200 text-red-600 hover:bg-red-50 px-4 py-2 rounded-lg text-sm font-medium transition-colors">
            Cancel Visit
          </button>
        </div>

        {/* Past Section */}
        <h3 className="text-lg font-bold text-gray-500 uppercase tracking-wider mb-4">Past Visits</h3>
        <div className="space-y-4">
          
          <div className="bg-white p-6 rounded-xl shadow-sm flex justify-between items-center opacity-75">
            <div>
              <p className="text-lg font-bold text-gray-800">Blood Test Results</p>
              <p className="text-gray-600">Dr. Yuhong</p>
              <p className="text-gray-500 text-sm mt-1">March 15, 2026 • 09:30 AM</p>
            </div>
            <span className="bg-gray-100 text-gray-600 px-3 py-1 rounded-full text-xs font-bold">
              Completed
            </span>
          </div>

        </div>
      </div>
    </div>
  );
}