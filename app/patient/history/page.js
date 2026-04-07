'use client';

export default function MedicalHistoryPage() {
  return (
    <div className="min-h-screen bg-gray-100 p-10 font-sans">
      <div className="max-w-4xl mx-auto">
        <h2 className="text-3xl font-bold text-gray-800 mb-2">Medical History</h2>
        <p className="text-gray-500 mb-8">Your past consultation notes and prescriptions.</p>

        <div className="space-y-6">
          
          {/* History Card 1 */}
          <div className="bg-white p-6 rounded-xl shadow-sm">
            <div className="flex justify-between items-start mb-4 border-b border-gray-100 pb-4">
              <div>
                <h3 className="text-xl font-bold text-gray-800">Fever & Cough Consultation</h3>
                <p className="text-gray-500 text-sm">March 15, 2026 • Attended by Dr. Yuhong</p>
              </div>
            </div>
            
            <div className="mb-4">
              <h4 className="text-sm font-bold text-gray-400 uppercase mb-1">Doctor's Notes</h4>
              <p className="text-gray-700 bg-gray-50 p-4 rounded-lg">
                Patient reported a mild fever and persistent dry cough for the last 3 days. Throat shows minor inflammation. No signs of severe respiratory distress. Advised rest and hydration.
              </p>
            </div>

            <div>
              <h4 className="text-sm font-bold text-gray-400 uppercase mb-1">Prescription</h4>
              <div className="flex gap-2">
                <span className="bg-red-50 text-red-700 px-3 py-1 rounded-md text-sm font-medium">Paracetamol 500mg</span>
                <span className="bg-red-50 text-red-700 px-3 py-1 rounded-md text-sm font-medium">Cough Syrup (10ml)</span>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}