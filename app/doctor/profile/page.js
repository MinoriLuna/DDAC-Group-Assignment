'use client';
import { useState, useEffect } from 'react';

const DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

export default function DoctorProfilePage() {
  const [profile, setProfile] = useState(null);
  const [editData, setEditData] = useState({});
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [savedMsg, setSavedMsg] = useState('');

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const res = await fetch('http://localhost:5230/api/doctor/profile', {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await res.json();
        setProfile(data);
        setEditData({
          specialization: data.specialization || '',
          licenseNumber: data.licenseNumber || '',
          department: data.department || '',
          phone: data.phone || '',
          isAvailable: data.isAvailable ?? true,
          availableDays: data.availableDays || '',
          availableFrom: data.availableFrom || '09:00',
          availableTo: data.availableTo || '17:00',
        });
      }
    } catch (err) {
      console.error('Profile fetch error:', err);
    } finally {
      setLoading(false);
    }
  };

  const toggleDay = (day) => {
    const current = editData.availableDays
      ? editData.availableDays.split(',').filter(Boolean)
      : [];
    const updated = current.includes(day)
      ? current.filter((d) => d !== day)
      : [...current, day];
    setEditData({ ...editData, availableDays: updated.join(',') });
  };

  const selectedDays = editData.availableDays
    ? editData.availableDays.split(',').filter(Boolean)
    : [];

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const token = localStorage.getItem('token');
      const res = await fetch('http://localhost:5230/api/doctor/profile', {
        method: 'PUT',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(editData),
      });
      if (res.ok) {
        setProfile({ ...profile, ...editData });
        setIsEditing(false);
        setSavedMsg('Profile updated successfully!');
        setTimeout(() => setSavedMsg(''), 3000);
      } else {
        alert('Failed to update profile.');
      }
    } catch (err) {
      console.error('Profile save error:', err);
    } finally {
      setSaving(false);
    }
  };

  if (loading)
    return (
      <div className="p-10 text-center font-bold text-gray-400 animate-pulse">
        Loading...
      </div>
    );

  if (!profile)
    return (
      <div className="p-10 text-center text-gray-500">
        Could not load profile.
      </div>
    );

  const viewDays = profile.availableDays
    ? profile.availableDays.split(',').filter(Boolean)
    : [];

  return (
    <div className="p-10 max-w-2xl mx-auto">
      <div className="bg-white p-10 rounded-2xl shadow-xl border border-gray-100">
        {/* HEADER */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-black text-black">My Profile</h1>
            <p className="text-gray-400 text-sm mt-1">
              Manage your doctor information
            </p>
          </div>
          <button
            onClick={() => {
              setIsEditing(!isEditing);
              setSavedMsg('');
            }}
            className={`px-5 py-2.5 rounded-2xl font-bold transition-all ${
              isEditing
                ? 'bg-gray-100 text-gray-500 hover:bg-gray-200'
                : 'bg-red-50 text-red-600 hover:bg-red-600 hover:text-white shadow-sm'
            }`}
          >
            {isEditing ? 'Cancel' : 'Edit Profile'}
          </button>
        </div>

        {savedMsg && (
          <div className="mb-6 p-3 bg-green-50 border border-green-200 rounded-xl text-green-700 font-semibold text-sm">
            ✅ {savedMsg}
          </div>
        )}

        {isEditing ? (
          /* EDIT MODE */
          <form onSubmit={handleSave} className="space-y-4">
            <InfoStatic label="Full Name" value={profile.fullName} />
            <InfoStatic label="Email" value={profile.email} />

            <InputField
              label="Phone"
              value={editData.phone}
              onChange={(val) => setEditData({ ...editData, phone: val })}
              placeholder="e.g. 012-3456789"
            />
            <InputField
              label="Specialization"
              value={editData.specialization}
              onChange={(val) => setEditData({ ...editData, specialization: val })}
              placeholder="e.g. General Practitioner, Cardiologist"
            />
            <InputField
              label="License Number"
              value={editData.licenseNumber}
              onChange={(val) => setEditData({ ...editData, licenseNumber: val })}
              placeholder="e.g. MMC/2020/12345"
            />
            <InputField
              label="Department"
              value={editData.department}
              onChange={(val) => setEditData({ ...editData, department: val })}
              placeholder="e.g. Outpatient, Emergency"
            />

            {/* AVAILABILITY TOGGLE */}
            <div className="bg-gray-50 p-4 rounded-xl border border-gray-100">
              <div className="flex justify-between items-center">
                <div>
                  <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">
                    Availability
                  </p>
                  <p className="text-sm text-gray-600 mt-0.5 font-medium">
                    {editData.isAvailable
                      ? 'Available for appointments'
                      : 'Not available'}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() =>
                    setEditData({ ...editData, isAvailable: !editData.isAvailable })
                  }
                  className={`w-12 h-6 rounded-full transition-colors relative ${
                    editData.isAvailable ? 'bg-green-500' : 'bg-gray-300'
                  }`}
                >
                  <span
                    className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${
                      editData.isAvailable ? 'translate-x-6' : 'translate-x-0.5'
                    }`}
                  />
                </button>
              </div>
            </div>

            {/* WORKING DAYS */}
            <div className="bg-gray-50 p-4 rounded-xl border border-gray-100">
              <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-3">
                Working Days
              </p>
              <div className="flex gap-2 flex-wrap">
                {DAYS.map((day) => (
                  <button
                    key={day}
                    type="button"
                    onClick={() => toggleDay(day)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-black uppercase tracking-wide transition-all ${
                      selectedDays.includes(day)
                        ? 'bg-red-600 text-white'
                        : 'bg-white border border-gray-200 text-gray-500 hover:border-red-300'
                    }`}
                  >
                    {day}
                  </button>
                ))}
              </div>
            </div>

            {/* WORKING HOURS */}
            <div className="bg-gray-50 p-4 rounded-xl border border-gray-100">
              <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-3">
                Working Hours
              </p>
              <div className="flex items-center gap-3">
                <div className="flex-1">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block mb-1">
                    From
                  </label>
                  <input
                    type="time"
                    value={editData.availableFrom}
                    onChange={(e) =>
                      setEditData({ ...editData, availableFrom: e.target.value })
                    }
                    className="w-full bg-white border border-gray-200 rounded-xl p-3 text-gray-800 font-semibold outline-none focus:ring-2 focus:ring-red-500"
                  />
                </div>
                <span className="text-gray-400 font-bold mt-5">–</span>
                <div className="flex-1">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block mb-1">
                    To
                  </label>
                  <input
                    type="time"
                    value={editData.availableTo}
                    onChange={(e) =>
                      setEditData({ ...editData, availableTo: e.target.value })
                    }
                    className="w-full bg-white border border-gray-200 rounded-xl p-3 text-gray-800 font-semibold outline-none focus:ring-2 focus:ring-red-500"
                  />
                </div>
              </div>
            </div>

            <button
              type="submit"
              disabled={saving}
              className="w-full bg-red-600 text-white font-black py-4 rounded-2xl shadow-lg hover:bg-red-700 transition-all disabled:opacity-50 mt-2"
            >
              {saving ? 'Saving...' : 'Save Changes'}
            </button>
          </form>
        ) : (
          /* VIEW MODE */
          <div className="space-y-4">
            <InfoItem label="Full Name" value={profile.fullName} />
            <InfoItem label="Email" value={profile.email} />
            <InfoItem label="Phone" value={profile.phone || 'Not set'} />
            <InfoItem label="Specialization" value={profile.specialization || 'Not set'} />
            <InfoItem label="License Number" value={profile.licenseNumber || 'Not set'} />
            <InfoItem label="Department" value={profile.department || 'Not set'} />

            <div className="bg-gray-50 p-3 rounded-xl border border-gray-100 flex justify-between items-center">
              <div>
                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">
                  Availability
                </p>
                <p className="font-bold text-gray-900">
                  {profile.isAvailable ? 'Available' : 'Not Available'}
                </p>
              </div>
              <span
                className={`w-3 h-3 rounded-full ${profile.isAvailable ? 'bg-green-500' : 'bg-gray-300'}`}
              />
            </div>

            <div className="bg-gray-50 p-3 rounded-xl border border-gray-100">
              <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">
                Working Days
              </p>
              {viewDays.length > 0 ? (
                <div className="flex gap-2 flex-wrap">
                  {viewDays.map((d) => (
                    <span
                      key={d}
                      className="bg-red-50 text-red-700 px-3 py-1 rounded-lg text-xs font-black uppercase"
                    >
                      {d}
                    </span>
                  ))}
                </div>
              ) : (
                <p className="font-bold text-gray-400">Not set</p>
              )}
            </div>

            <div className="bg-gray-50 p-3 rounded-xl border border-gray-100">
              <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">
                Working Hours
              </p>
              <p className="font-bold text-gray-900">
                {profile.availableFrom && profile.availableTo
                  ? `${profile.availableFrom} – ${profile.availableTo}`
                  : 'Not set'}
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function InfoItem({ label, value }) {
  return (
    <div className="bg-gray-50 p-3 rounded-xl border border-gray-100">
      <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">
        {label}
      </p>
      <p className="font-bold text-gray-900">{value}</p>
    </div>
  );
}

function InfoStatic({ label, value }) {
  return (
    <div className="bg-gray-100 p-3 rounded-xl border border-gray-100 opacity-70">
      <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">
        {label}
      </p>
      <p className="font-bold text-gray-500">{value}</p>
    </div>
  );
}

function InputField({ label, value, onChange, placeholder, type = 'text' }) {
  return (
    <div>
      <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1 block mb-1">
        {label}
      </label>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full bg-gray-50 border border-gray-200 rounded-xl p-4 text-black font-semibold outline-none focus:ring-2 focus:ring-red-500 transition-all"
      />
    </div>
  );
}
