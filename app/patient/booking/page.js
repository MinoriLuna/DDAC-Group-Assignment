'use client';

import { useState } from 'react';

export default function BookingPage() {
  // 1. The Brain: Setup state to hold what the user types
  const [formData, setFormData] = useState({
    doctorId: '',
    date: '',
    time: '',
    reason: ''
  });

  // 2. The Action: What happens when they click Submit
  const handleSubmit = (e) => {
    e.preventDefault(); // Stops the page from refreshing
    
    // Right now, we just print it to the browser console to prove it works. 
    // Later, this is where we write the 'fetch()' call to your ASP.NET backend!
    console.log("Ready to send to backend:", formData);
    alert("Booking data captured! Press F12 to check your browser console.");
  };

  // 3. The Helper: Updates state when they type
  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  return (
    <div className="p-10 font-sans">
      <div className="max-w-2xl mx-auto">
        <h2 className="text-3xl font-bold text-gray-800 mb-2">Book an Appointment</h2>
        <p className="text-gray-500 mb-8">Schedule a visit with your preferred doctor.</p>

        <div className="bg-white p-8 rounded-xl shadow-sm border border-gray-100">
          
          {/* We added the onSubmit handler to the form tag */}
          <form onSubmit={handleSubmit} className="space-y-6">
            
            {/* Doctor Selection */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Select Doctor</label>
              <select 
                name="doctorId"
                value={formData.doctorId}
                onChange={handleChange}
                required
                className="w-full border border-gray-300 rounded-lg p-3 text-gray-700 focus:ring-red-500 focus:border-red-500 outline-none"
              >
                <option value="">Choose a doctor...</option>
                <option value="yuhong">Dr. Yuhong (General Practice)</option>
                <option value="other">Dr. Smith (Cardiology)</option>
              </select>
            </div>

            {/* Date and Time Row */}
            <div className="grid grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Date</label>
                <input 
                  type="date" 
                  name="date"
                  value={formData.date}
                  onChange={handleChange}
                  required
                  className="w-full border border-gray-300 rounded-lg p-3 text-gray-700 focus:ring-red-500 outline-none" 
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Time</label>
                <input 
                  type="time" 
                  name="time"
                  value={formData.time}
                  onChange={handleChange}
                  required
                  className="w-full border border-gray-300 rounded-lg p-3 text-gray-700 focus:ring-red-500 outline-none" 
                />
              </div>
            </div>

            {/* Reason for Visit */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Reason for Visit</label>
              <textarea 
                name="reason"
                rows="4" 
                value={formData.reason}
                onChange={handleChange}
                required
                className="w-full border border-gray-300 rounded-lg p-3 text-gray-700 focus:ring-red-500 outline-none"
                placeholder="Briefly describe your symptoms or reason for visit..."
              ></textarea>
            </div>

            {/* Submit Button */}
            <button 
              type="submit" 
              className="w-full bg-red-600 hover:bg-red-700 text-white font-bold py-3 px-4 rounded-lg transition-colors shadow-sm"
            >
              Confirm Booking
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}