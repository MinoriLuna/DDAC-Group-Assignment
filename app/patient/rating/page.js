'use client';
import { useState, useEffect } from 'react';
import { StarIcon } from '@heroicons/react/24/solid';

export default function RateDoctorPage() {
  const [doctors, setDoctors] = useState([]);
  const [selectedDoctor, setSelectedDoctor] = useState("");
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");
  const [loading, setLoading] = useState(false);

  // 1. Fetch doctor list from your C# backend
  useEffect(() => {
    const fetchDoctors = async () => {
      try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL ?? ''}/api/appointment/doctors`);
        if (res.ok) {
          const data = await res.json();
          setDoctors(data);
        }
      } catch (err) {
        console.error("Fetch error:", err);
      }
    };
    fetchDoctors();
  }, []);

  // 2. Submit review logic
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedDoctor) return alert("Pick a doctor first!");

    setLoading(true);
    const token = localStorage.getItem('token');

    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL ?? ''}/api/reviews/submit`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          doctorId: selectedDoctor,
          rating,
          comment
        })
      });

      if (res.ok) {
        alert("Review saved and logged to CloudWatch!");
        setComment("");
        setRating(5);
        setSelectedDoctor("");
      }
    } catch (err) {
      alert("Server connection failed.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-10 font-sans">
      <div className="max-w-5xl mx-auto bg-white p-10 rounded-2xl shadow-sm border border-gray-100">
        
        <h2 className="text-3xl font-black text-gray-900 tracking-tight mb-2">Rate Your Doctor</h2>
        <p className="text-xs font-black text-gray-400 uppercase tracking-widest mb-8">
          Simple Patient Feedback System
        </p>

        <form onSubmit={handleSubmit} className="space-y-6">
          
          {/* SELECT DOCTOR */}
          <div>
            <label className="text-[10px] font-black uppercase text-gray-400 tracking-widest ml-1">Choose Medical Professional</label>
            <select 
              className="w-full mt-2 bg-gray-50 border-none rounded-xl p-4 font-bold text-gray-800 focus:ring-2 focus:ring-red-500 appearance-none"
              value={selectedDoctor}
              onChange={(e) => setSelectedDoctor(e.target.value)}
              required
            >
              <option value="">-- Select Doctor --</option>
              {doctors.map(doc => (
                <option key={doc.doctorId} value={doc.doctorId}>{doc.fullName}</option>
              ))}
            </select>
          </div>

        {/* STAR RATING */}
        <div className="flex justify-center gap-4 py-6 relative z-50">
        {[1, 2, 3, 4, 5].map((num) => (
            <button
            key={num}
            type="button"
            onClick={(e) => {
                e.preventDefault(); // Stops any weird form behavior
                console.log("Star clicked:", num); // CHECK YOUR BROWSER CONSOLE FOR THIS
                setRating(num);
            }}
            className={`h-12 w-12 rounded-full focus:outline-none transition-all active:scale-75 ${
                rating >= num ? 'text-yellow-400' : 'text-gray-200 hover:text-gray-300'
            }`}
            >
            {/* pointer-events-none is the magic word here */}
            <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="currentColor"
                className="w-full h-full pointer-events-none"
            >
                <path fillRule="evenodd" d="M10.788 3.21c.448-1.077 1.976-1.077 2.424 0l2.082 5.007 5.404.433c1.164.093 1.636 1.545.749 2.305l-4.117 3.527 1.257 5.273c.271 1.136-.964 2.033-1.96 1.425L12 18.354 7.373 21.18c-.996.608-2.231-.29-1.96-1.425l1.257-5.273-4.117-3.527c-.887-.76-.415-2.212.749-2.305l5.404-.433 2.082-5.006z" clipRule="evenodd" />
            </svg>
            </button>
        ))}
        </div>

        {/* COMMENT BOX */}
        <div>
        <label className="text-[10px] font-black uppercase text-gray-400 tracking-widest ml-1">Your Comments</label>
        <textarea 
            className="w-full mt-2 bg-gray-50 border-2 border-transparent rounded-3xl p-5 text-sm font-bold text-gray-700 focus:outline-none focus:bg-white focus:border-red-500 focus:ring-4 focus:ring-red-500/20 transition-all"
            placeholder="How was your visit?"
            rows="5"
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            required
            />
        </div>

          {/* SUBMIT */}
          <button 
            type="submit"
            disabled={loading}
            className="w-full bg-red-600 text-white py-5 rounded-[30px] font-black uppercase text-xs tracking-widest shadow-xl shadow-red-100 hover:bg-red-700 transition-all active:scale-95 disabled:opacity-50"
          >
            {loading ? "Logging Event..." : "Submit Review"}
          </button>

        </form>
      </div>
    </div>
  );
}