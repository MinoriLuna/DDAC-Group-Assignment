'use client';
import { useState } from 'react';

export default function ProfilePage() {
  // State for updating contact details
  const [contactData, setContactData] = useState({
    phone: '+60 12-345-6789',
    address: '123 Jalan Ampang, Kuala Lumpur'
  });

  // State for password changes
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  const handleContactSubmit = (e) => {
    e.preventDefault();
    console.log("Saving new contact info:", contactData);
    alert("Profile details updated successfully!");
  };

  const handlePasswordSubmit = (e) => {
    e.preventDefault();
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      alert("Passwords do not match!");
      return;
    }
    console.log("Sending password change request...", passwordData);
    alert("Password changed successfully!");
  };

  return (
    <div className="p-10 font-sans">
      <div className="max-w-3xl mx-auto">
        <h2 className="text-3xl font-bold text-gray-800 mb-2">Profile Settings</h2>
        <p className="text-gray-500 mb-8">Manage your personal information and security.</p>

        <div className="space-y-6">
          
          {/* Read-Only Account Info Card */}
          <div className="bg-white p-8 rounded-xl shadow-sm border border-gray-100 flex items-center gap-6">
            <div className="h-20 w-20 bg-red-100 text-red-600 flex items-center justify-center rounded-full text-3xl font-bold">
              A
            </div>
            <div>
              <h3 className="text-2xl font-bold text-gray-800">Ashton</h3>
              <p className="text-gray-500">Patient ID: PAT-84729</p>
              <span className="inline-block mt-2 bg-gray-100 text-gray-600 px-3 py-1 rounded-full text-xs font-bold">
                ashton.patient@example.com
              </span>
            </div>
          </div>

          {/* Update Details Form */}
          <div className="bg-white p-8 rounded-xl shadow-sm border border-gray-100">
            <h3 className="text-xl font-bold text-gray-800 mb-4">Contact Details</h3>
            <form onSubmit={handleContactSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number</label>
                <input 
                  type="text" 
                  value={contactData.phone}
                  onChange={(e) => setContactData({ ...contactData, phone: e.target.value })}
                  className="w-full border border-gray-300 rounded-lg p-3 text-gray-700 focus:ring-red-500 focus:border-red-500 outline-none" 
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Home Address</label>
                <input 
                  type="text" 
                  value={contactData.address}
                  onChange={(e) => setContactData({ ...contactData, address: e.target.value })}
                  className="w-full border border-gray-300 rounded-lg p-3 text-gray-700 focus:ring-red-500 focus:border-red-500 outline-none" 
                />
              </div>
              <button type="submit" className="bg-gray-100 hover:bg-gray-200 text-gray-800 font-bold py-2 px-6 rounded-lg transition-colors text-sm">
                Save Changes
              </button>
            </form>
          </div>

          {/* Change Password Form */}
          <div className="bg-white p-8 rounded-xl shadow-sm border border-gray-100 border-t-4 border-t-red-600">
            <h3 className="text-xl font-bold text-gray-800 mb-4">Security</h3>
            <form onSubmit={handlePasswordSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Current Password</label>
                <input 
                  type="password" 
                  value={passwordData.currentPassword}
                  onChange={(e) => setPasswordData({ ...passwordData, currentPassword: e.target.value })}
                  className="w-full border border-gray-300 rounded-lg p-3 text-gray-700 focus:ring-red-500 focus:border-red-500 outline-none" 
                  required
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">New Password</label>
                  <input 
                    type="password" 
                    value={passwordData.newPassword}
                    onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                    className="w-full border border-gray-300 rounded-lg p-3 text-gray-700 focus:ring-red-500 focus:border-red-500 outline-none" 
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Confirm New Password</label>
                  <input 
                    type="password" 
                    value={passwordData.confirmPassword}
                    onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
                    className="w-full border border-gray-300 rounded-lg p-3 text-gray-700 focus:ring-red-500 focus:border-red-500 outline-none" 
                    required
                  />
                </div>
              </div>
              <button type="submit" className="bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-6 rounded-lg transition-colors text-sm">
                Update Password
              </button>
            </form>
          </div>

        </div>
      </div>
    </div>
  );
}