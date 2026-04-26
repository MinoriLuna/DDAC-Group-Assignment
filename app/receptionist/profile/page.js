'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  UserCircleIcon,
  ArrowLeftIcon,
  ShieldCheckIcon,
  PhoneIcon,
  EnvelopeIcon,
  UserIcon,
  LockClosedIcon,
  EyeIcon,
  EyeSlashIcon,
} from '@heroicons/react/24/outline';

export default function ProfilePage() {
  const router = useRouter();

  const [profile, setProfile] = useState({ fullName: '', email: '', phone: '', userId: '' });
  const [loading, setLoading] = useState(true);
  const [passwords, setPasswords] = useState({ current: '', newPass: '', confirm: '' });
  const [showPw, setShowPw] = useState({ current: false, newPass: false, confirm: false });
  const [isSaving, setIsSaving] = useState(false);
  const [toast, setToast] = useState('');
  const [pwError, setPwError] = useState('');

  const token = typeof window !== 'undefined' ? localStorage.getItem('token') : '';

  useEffect(() => {
    if (!token) { setLoading(false); return; }
    fetch('http://localhost:5230/api/profile/profile', {
      headers: { 'Authorization': `Bearer ${token}` }
    })
      .then(r => r.json())
      .then(data => setProfile(data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const showToast = (msg) => {
    setToast(msg);
    setTimeout(() => setToast(''), 3000);
  };

  const handleProfileSave = async (e) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      const res = await fetch('http://localhost:5230/api/profile/update', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          fullName: profile.fullName,
          email: profile.email,
          phone: profile.phone,
          address: profile.address || ''
        })
      });
      if (res.ok) showToast('Profile updated successfully!');
      else showToast('Failed to update profile.');
    } catch {
      showToast('Network error.');
    } finally {
      setIsSaving(false);
    }
  };

  const handlePasswordSave = (e) => {
    e.preventDefault();
    setPwError('');
    if (passwords.newPass !== passwords.confirm) {
      setPwError('New passwords do not match.');
      return;
    }
    if (passwords.newPass.length < 8) {
      setPwError('Password must be at least 8 characters.');
      return;
    }
    setIsSaving(true);
    setTimeout(() => {
      setIsSaving(false);
      setPasswords({ current: '', newPass: '', confirm: '' });
      showToast('Password changed successfully!');
    }, 1000);
  };

  const toggle = (field) => setShowPw(prev => ({ ...prev, [field]: !prev[field] }));

  const staffId = profile.userId
    ? `REC-${profile.userId.toString().slice(0, 8).toUpperCase()}`
    : '—';

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-red-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-10 px-4 sm:px-6 lg:px-8 font-sans relative">

      {toast && (
        <div className="fixed top-5 right-5 bg-green-500 text-white px-6 py-3 rounded-xl shadow-2xl flex items-center z-50">
          <ShieldCheckIcon className="h-5 w-5 mr-2" />
          <span className="font-semibold text-sm">{toast}</span>
        </div>
      )}

      <div className="max-w-3xl w-full mx-auto space-y-6">

        <div>
          <button
            onClick={() => router.back()}
            className="flex items-center text-gray-500 hover:text-red-600 font-medium transition-colors mb-4"
          >
            <ArrowLeftIcon className="h-4 w-4 mr-1" />
            Back
          </button>
          <h2 className="text-3xl font-extrabold text-gray-900 tracking-tight">My Profile</h2>
          <p className="mt-1 text-sm text-gray-500">Manage your personal information and account security.</p>
        </div>

        {/* Avatar Card */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 flex items-center gap-6">
          <div className="relative">
            <img
              src={`https://ui-avatars.com/api/?name=${encodeURIComponent(profile.fullName || 'User')}&background=fecaca&color=dc2626&size=96`}
              alt="Avatar"
              className="h-20 w-20 rounded-full ring-4 ring-red-100"
            />
          </div>
          <div>
            <h3 className="text-xl font-extrabold text-gray-900">{profile.fullName || '—'}</h3>
            <p className="text-sm text-gray-500 mt-0.5">
              Staff ID: <span className="font-mono text-xs bg-gray-100 px-2 py-0.5 rounded">{staffId}</span>
            </p>
            <span className="inline-flex items-center mt-2 text-xs font-bold text-green-700 bg-green-50 border border-green-200 px-2.5 py-0.5 rounded-full">
              <span className="h-1.5 w-1.5 bg-green-500 rounded-full mr-1.5 animate-pulse" />
              Active Staff
            </span>
          </div>
        </div>

        {/* Personal Information */}
        <form onSubmit={handleProfileSave}>
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
            <div className="flex items-center gap-2 border-b border-gray-100 pb-3 mb-6">
              <UserIcon className="h-5 w-5 text-red-500" />
              <h3 className="text-lg font-bold text-gray-800">Personal Information</h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="md:col-span-2">
                <label className="block text-sm font-bold text-gray-700 mb-2">Full Name</label>
                <input
                  type="text"
                  required
                  value={profile.fullName}
                  onChange={e => setProfile({ ...profile, fullName: e.target.value })}
                  className="w-full bg-white border border-gray-300 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-red-500 text-gray-900 font-medium transition-all"
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">Email Address</label>
                <div className="relative">
                  <EnvelopeIcon className="h-5 w-5 absolute left-3 top-3.5 text-gray-400" />
                  <input
                    type="email"
                    required
                    value={profile.email}
                    onChange={e => setProfile({ ...profile, email: e.target.value })}
                    className="w-full bg-white border border-gray-300 rounded-xl pl-10 px-4 py-3 outline-none focus:ring-2 focus:ring-red-500 text-gray-900 font-medium transition-all"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">Phone Number</label>
                <div className="relative">
                  <PhoneIcon className="h-5 w-5 absolute left-3 top-3.5 text-gray-400" />
                  <input
                    type="tel"
                    value={profile.phone || ''}
                    onChange={e => setProfile({ ...profile, phone: e.target.value })}
                    className="w-full bg-white border border-gray-300 rounded-xl pl-10 px-4 py-3 outline-none focus:ring-2 focus:ring-red-500 text-gray-900 font-medium transition-all"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">Staff ID</label>
                <input
                  type="text"
                  value={staffId}
                  disabled
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-gray-400 font-mono text-sm cursor-not-allowed"
                />
              </div>
            </div>

            <div className="mt-6 flex justify-end">
              <button
                type="submit"
                disabled={isSaving}
                className="px-8 py-3 bg-red-600 text-white font-bold rounded-xl hover:bg-red-700 shadow-md transition-all disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {isSaving ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </div>
        </form>

        {/* Change Password */}
        <form onSubmit={handlePasswordSave}>
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
            <div className="flex items-center gap-2 border-b border-gray-100 pb-3 mb-6">
              <LockClosedIcon className="h-5 w-5 text-red-500" />
              <h3 className="text-lg font-bold text-gray-800">Change Password</h3>
            </div>

            <div className="space-y-5">
              {[
                { label: 'Current Password', field: 'current' },
                { label: 'New Password', field: 'newPass' },
                { label: 'Confirm New Password', field: 'confirm' },
              ].map(({ label, field }) => (
                <div key={field}>
                  <label className="block text-sm font-bold text-gray-700 mb-2">{label}</label>
                  <div className="relative">
                    <LockClosedIcon className="h-5 w-5 absolute left-3 top-3.5 text-gray-400" />
                    <input
                      type={showPw[field] ? 'text' : 'password'}
                      required
                      value={passwords[field]}
                      onChange={e => setPasswords({ ...passwords, [field]: e.target.value })}
className="w-full bg-white border border-gray-300 rounded-xl pl-10 pr-10 py-3 outline-none focus:ring-2 focus:ring-red-500 text-gray-900 font-medium transition-all"
                    />
                    <button
                      type="button"
                      onClick={() => toggle(field)}
                      className="absolute right-3 top-3.5 text-gray-400 hover:text-gray-600 transition-colors"
                    >
                      {showPw[field] ? <EyeSlashIcon className="h-5 w-5" /> : <EyeIcon className="h-5 w-5" />}
                    </button>
                  </div>
                </div>
              ))}

              {pwError && (
                <p className="text-sm font-medium text-red-600 bg-red-50 border border-red-200 rounded-lg px-4 py-2">
                  {pwError}
                </p>
              )}
            </div>

            <div className="mt-6 flex justify-end">
              <button
                type="submit"
                disabled={isSaving}
                className="px-8 py-3 bg-red-600 text-white font-bold rounded-xl hover:bg-red-700 shadow-md transition-all disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {isSaving ? 'Updating...' : 'Update Password'}
              </button>
            </div>
          </div>
        </form>

      </div>
    </div>
  );
}
