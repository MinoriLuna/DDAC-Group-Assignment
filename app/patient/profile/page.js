'use client';
import { useEffect, useState } from 'react';

export default function ProfilePage() {
  const [profile, setProfile] = useState({ fullName: '', email: '', role: '' });
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Fetch logic would go here (same as before)
    // For now, let's pretend we fetched it
    setTimeout(() => {
      setProfile({ fullName: 'Ashton', email: 'ashton@gmail.com', role: 'Patient' });
      setLoading(false);
    }, 500);
  }, []);

  if (loading) return <p className="p-10 font-bold text-gray-400">Loading profile...</p>;

  return (
    <div className="max-w-2xl bg-white p-10 rounded-3xl shadow-xl border border-gray-100 justify-center mx-auto">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-black text-black">Profile</h1>
          <p className="text-gray-400 text-sm font-semibold uppercase tracking-widest">Manage your personal details</p>
        </div>
        <button 
          onClick={() => setIsEditing(!isEditing)}
          className="text-red-600 font-bold hover:bg-red-50 px-4 py-2 rounded-xl transition-all"
        >
          {isEditing ? 'Cancel' : 'Edit Profile'}
        </button>
      </div>

      {isEditing ? (
        /* --- THE EDIT FORM --- */
        <form className="space-y-6">
          <div className="grid grid-cols-1 gap-6">
            <div>
              <label className="block text-xs font-black text-gray-400 uppercase mb-2">Full Name</label>
              <input 
                type="text" 
                defaultValue={profile.fullName}
                className="w-full bg-gray-50 border border-gray-200 rounded-xl p-4 outline-none focus:ring-2 focus:ring-red-500 text-black font-semibold transition-all"
              />
            </div>

            <div>
              <label className="block text-xs font-black text-gray-400 uppercase mb-2">Email Address</label>
              <input 
                type="email" 
                defaultValue={profile.email}
                className="w-full bg-gray-50 border border-gray-200 rounded-xl p-4 outline-none focus:ring-2 focus:ring-red-500 text-black font-semibold transition-all"
              />
            </div>

            <div>
              <label className="block text-xs font-black text-gray-400 uppercase mb-2">Phone Number (Optional)</label>
              <input 
                type="tel" 
                placeholder="+60 12-345 6789"
                className="w-full bg-gray-50 border border-gray-200 rounded-xl p-4 outline-none focus:ring-2 focus:ring-red-500 text-black font-semibold transition-all"
              />
            </div>

            <div className="opacity-50">
              <label className="block text-xs font-black text-gray-400 uppercase mb-2">User Role (Read Only)</label>
              <input 
                type="text" 
                value={profile.role} 
                disabled
                className="w-full bg-gray-200 border border-gray-300 rounded-xl p-4 text-gray-600 font-bold cursor-not-allowed"
              />
            </div>
          </div>

          <button 
            type="button" 
            className="w-full bg-red-600 text-white font-black py-4 rounded-2xl shadow-lg hover:bg-red-700 transition-all active:scale-95 mt-4"
          >
            Save Changes
          </button>
        </form>
      ) : (
        /* --- THE VIEW MODE --- */
        <div className="space-y-8">
          <InfoItem label="Full Name" value={profile.fullName} />
          <InfoItem label="Email Address" value={profile.email} />
          <InfoItem label="Account Type" value={profile.role} />
          <InfoItem label="Medical ID" value="MED-99234-AX" />
        </div>
      )}
    </div>
  );
}

// Simple component for the View Mode
function InfoItem({ label, value }) {
  return (
    <div className="border-b border-gray-50 pb-4">
      <p className="text-xs font-black text-gray-400 uppercase tracking-tighter mb-1">{label}</p>
      <p className="text-xl font-bold text-gray-900">{value}</p>
    </div>
  );
}