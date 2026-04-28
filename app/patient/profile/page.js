'use client';
import { useEffect, useState } from 'react';
import { useNotification } from '@/hooks/useNotification';

export default function ProfilePage() {
  const [profile, setProfile] = useState({ fullName: '', email: '', role: '', phone: '', address: '', createdAt: '' });
  const [editData, setEditData] = useState({ fullName: '', email: '', phone: '', address: '' });
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const { showNotification } = useNotification();

  useEffect(() => {
    const fetchProfile = async () => {
      const token = localStorage.getItem('token');
      try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL ?? ''}/api/profile/profile`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (res.ok) {
          const data = await res.json();
          setProfile(data);
          setEditData({ fullName: data.fullName, email: data.email, phone: data.phone || '', address: data.address || '' });
        }
      } catch (err) { console.error(err); } finally { setLoading(false); }
    };
    fetchProfile();
  }, []);

  const handleUpdate = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem('token');
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL ?? ''}/api/profile/update`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify(editData)
      });
      if (res.ok) {
        setProfile({ ...profile, ...editData });
        setIsEditing(false);
        showNotification("Profile saved!", "success");
      }
    } catch (err) { console.error(err); }
  };

  const handlePhoneFormat = (val) => {
  // 1. Delete everything that is NOT a number
  let num = val.replace(/\D/g, '');
  
  // 2. Limit to 11 digits max
  num = num.substring(0, 11);

  // 3. Auto-format as they type
  if (num.length > 7) {
    if (num.startsWith('011')) {
      return `${num.slice(0,3)}-${num.slice(3,7)} ${num.slice(7)}`; // 011 format
    }
    return `${num.slice(0,3)}-${num.slice(3,6)} ${num.slice(6)}`; // Standard format
  } else if (num.length > 3) {
    return `${num.slice(0,3)}-${num.slice(3)}`;
  }
  return num;
};

  if (loading) return <p className="p-10 font-bold text-gray-400">Loading...</p>;

  return (
    <div className="max-w-2xl bg-white p-10 rounded-2xl shadow-xl border border-gray-100 mx-auto mt-10">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-black text-black">Profile</h1>
        <button 
          onClick={() => setIsEditing(!isEditing)} 
          className={`px-5 py-2.5 rounded-2xl font-bold transition-all ${
            isEditing 
            ? 'bg-gray-100 text-gray-500 hover:bg-gray-200' 
            : 'bg-red-50 text-red-600 hover:bg-red-600 hover:text-white shadow-sm'
          }`}
        >
          {isEditing ? 'Cancel' : 'Edit Profile'}
        </button>
      </div>

      {isEditing ? (
        <form onSubmit={handleUpdate} className="space-y-4">
          <InputField label="Full Name" value={editData.fullName} onChange={(val) => setEditData({...editData, fullName: val})} />
          <InputField label="Email" value={editData.email} type="email" onChange={(val) => setEditData({...editData, email: val})} />
          <InputField label="Phone" value={editData.phone} type="phone" onChange={(val) => setEditData({...editData, phone: handlePhoneFormat(val)})} />
          
          <div>
            <label className="text-[10px] font-black text-gray-400 uppercase ml-1">Home Address</label>
            <textarea 
              value={editData.address} 
              onChange={(e) => setEditData({...editData, address: e.target.value})}
              className="w-full bg-gray-50 border border-gray-200 rounded-xl p-4 text-black font-semibold mt-1 h-24 outline-none focus:ring-2 focus:ring-red-500"
            />
          </div>

          <button type="submit" className="w-full bg-red-600 text-white font-black py-4 rounded-2xl shadow-lg hover:bg-red-700 transition-all">
            Save Changes
          </button>
        </form>
      ) : (
        <div className="space-y-4">
          <InfoItem label="Full Name" value={profile.fullName} />
          <InfoItem label="Email" value={profile.email} />
          <InfoItem label="Phone Number" value={profile.phone || 'No phone set'} />
          <InfoItem label="Address" value={profile.address || 'No address set'} />
          <InfoItem label="Account Created" value={new Date(profile.createdAt).toLocaleString()} />
        </div>
      )}
    </div>
  );
}

// Small helpers to keep the file clean
function InputField({ label, value, onChange, type = "text" }) {
  return (
    <div>
      <label className="text-[10px] font-black text-gray-400 uppercase ml-1">{label}</label>
      <input type={type} value={value} onChange={(e) => onChange(e.target.value)} 
        className="w-full bg-gray-50 border border-gray-200 rounded-xl p-4 text-black font-semibold mt-1 outline-none" />
    </div>
  );
}

function InfoItem({ label, value }) {
  return (
    <div className="bg-gray-50 p-3 rounded-xl border border-gray-100">
      <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">{label}</p>
      <p className="font-bold text-gray-900">{value}</p>
    </div>
  );
}