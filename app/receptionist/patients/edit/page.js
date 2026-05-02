'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import {
  UserIcon,
  MapPinIcon,
  PhoneIcon,
  EnvelopeIcon,
  ShieldCheckIcon,
  DocumentTextIcon,
  ArrowLeftIcon
} from '@heroicons/react/24/outline';

function EditPatientContent() {
  const searchParams = useSearchParams();
  const patientId = searchParams.get('id');
  const router = useRouter();

  const [formData, setFormData] = useState({
    fullName: '', dob: '', gender: 'Male',
    phone: '', email: '', address: '',
    emergencyName: '', emergencyPhone: '', emergencyRelation: '',
    insuranceProvider: '', policyNumber: '', coverageType: 'N/A'
  });

  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [toastMessage, setToastMessage] = useState('');

  const token = typeof window !== 'undefined' ? localStorage.getItem('token') : '';

  useEffect(() => {
    if (!patientId) return;
    fetch(`http://localhost:5230/api/receptionist/patients/${patientId}`, {
      headers: { 'Authorization': `Bearer ${token}` }
    })
      .then(r => r.json())
      .then(data => {
        setFormData(prev => ({
          ...prev,
          fullName:          data.fullName || '',
          dob:               data.dateOfBirth || '',
          gender:            data.gender || 'Male',
          phone:             data.phone || '',
          email:             data.email || '',
          address:           data.address || '',
          emergencyName:     data.emergencyContactName || '',
          emergencyPhone:    data.emergencyContactPhone || '',
          emergencyRelation: data.emergencyContactRelation || ''
        }));
      })
      .catch(console.error)
      .finally(() => setIsLoading(false));
  }, [patientId]);

  const handleSave = async (e) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      const res = await fetch(`http://localhost:5230/api/receptionist/patients/${patientId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({
          fullName:          formData.fullName,
          dob:               formData.dob,
          gender:            formData.gender,
          phone:             formData.phone,
          email:             formData.email,
          address:           formData.address,
          emergencyName:     formData.emergencyName,
          emergencyPhone:    formData.emergencyPhone,
          emergencyRelation: formData.emergencyRelation
        })
      });
      if (res.ok) {
        setToastMessage('Profile updated successfully!');
        setTimeout(() => setToastMessage(''), 3000);
      } else {
        alert('Failed to update patient profile.');
      }
    } catch {
      alert('Network error. Could not reach the server.');
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="flex flex-col items-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600 mb-4"></div>
          <p className="text-gray-500 font-medium tracking-wide">Loading patient profile...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-10 px-4 sm:px-6 lg:px-8 font-sans relative">
      {toastMessage && (
        <div className="fixed top-5 right-5 bg-green-500 text-white px-6 py-3 rounded-lg shadow-2xl flex items-center z-50 animate-bounce">
          <ShieldCheckIcon className="h-6 w-6 mr-2" />
          <span className="font-medium">{toastMessage}</span>
        </div>
      )}

      <div className="max-w-4xl w-full mx-auto">
        <div className="mb-6">
          <button type="button" onClick={() => router.push('/receptionist/patients')}
            className="flex items-center text-gray-500 hover:text-red-600 font-medium transition-colors duration-200 mb-4">
            <ArrowLeftIcon className="h-4 w-4 mr-1" />
            Back to Patients List
          </button>
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-3xl font-extrabold text-gray-900 tracking-tight">Update Patient Profile</h2>
              <p className="mt-1 text-sm text-gray-500">
                Patient ID: <span className="font-mono bg-gray-200 px-2 py-1 rounded text-gray-700 ml-1">{patientId}</span>
              </p>
            </div>
            <div className="bg-green-100 border border-green-200 text-green-700 px-4 py-2 rounded-full text-sm font-bold flex items-center shadow-sm">
              <span className="w-2 h-2 bg-green-500 rounded-full mr-2 animate-pulse"></span>
              Active Patient
            </div>
          </div>
        </div>

        <form onSubmit={handleSave} className="space-y-6">
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 hover:shadow-md transition-shadow">
            <div className="flex items-center space-x-2 border-b border-gray-100 pb-3 mb-6">
              <UserIcon className="h-6 w-6 text-red-500" />
              <h3 className="text-xl font-bold text-gray-800">Demographics</h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="md:col-span-2">
                <label className="block text-sm font-bold text-gray-700 mb-2">Full Name</label>
                <input type="text" required value={formData.fullName}
                  onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                  className="w-full bg-white border border-gray-300 rounded-lg px-4 py-3 outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all shadow-sm text-gray-900 font-medium" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">Date of Birth</label>
                  <input type="date" value={formData.dob}
                    onChange={(e) => setFormData({ ...formData, dob: e.target.value })}
                    className="w-full bg-white border border-gray-300 rounded-lg px-4 py-3 outline-none focus:ring-2 focus:ring-red-500 transition-all shadow-sm text-gray-900 font-medium" />
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">Gender</label>
                  <select value={formData.gender} onChange={(e) => setFormData({ ...formData, gender: e.target.value })}
                    className="w-full bg-white border border-gray-300 rounded-lg px-4 py-3 outline-none focus:ring-2 focus:ring-red-500 transition-all shadow-sm text-gray-900 font-medium">
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 hover:shadow-md transition-shadow">
            <div className="flex items-center space-x-2 border-b border-gray-100 pb-3 mb-6">
              <PhoneIcon className="h-6 w-6 text-red-500" />
              <h3 className="text-xl font-bold text-gray-800">Contact Information</h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">Phone Number</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <PhoneIcon className="h-5 w-5 text-gray-400" />
                  </div>
                  <input type="tel" value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full bg-white border border-gray-300 rounded-lg pl-10 px-4 py-3 outline-none focus:ring-2 focus:ring-red-500 transition-all shadow-sm text-gray-900 font-medium" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">Email Address</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <EnvelopeIcon className="h-5 w-5 text-gray-400" />
                  </div>
                  <input type="email" value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full bg-white border border-gray-300 rounded-lg pl-10 px-4 py-3 outline-none focus:ring-2 focus:ring-red-500 transition-all shadow-sm text-gray-900 font-medium" />
                </div>
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-bold text-gray-700 mb-2">Current Address</label>
                <div className="relative">
                  <div className="top-3 left-3 absolute pointer-events-none">
                    <MapPinIcon className="h-5 w-5 text-gray-400" />
                  </div>
                  <textarea value={formData.address} rows="3"
                    onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                    className="w-full bg-white border border-gray-300 rounded-lg pl-10 px-4 py-3 outline-none focus:ring-2 focus:ring-red-500 transition-all shadow-sm text-gray-900 resize-none font-medium" />
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 hover:shadow-md transition-shadow">
            <div className="flex items-center space-x-2 border-b border-gray-100 pb-3 mb-6">
              <PhoneIcon className="h-6 w-6 text-red-500" />
              <h3 className="text-xl font-bold text-gray-800">Emergency Contact</h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">Contact Name</label>
                <input type="text" value={formData.emergencyName}
                  onChange={(e) => setFormData({ ...formData, emergencyName: e.target.value })}
                  placeholder="e.g. Jane Smith"
                  className="w-full bg-white border border-gray-300 rounded-lg px-4 py-3 outline-none focus:ring-2 focus:ring-red-500 transition-all shadow-sm text-gray-900 font-medium" />
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">Relationship</label>
                <input type="text" value={formData.emergencyRelation}
                  onChange={(e) => setFormData({ ...formData, emergencyRelation: e.target.value })}
                  placeholder="e.g. Spouse, Parent"
                  className="w-full bg-white border border-gray-300 rounded-lg px-4 py-3 outline-none focus:ring-2 focus:ring-red-500 transition-all shadow-sm text-gray-900 font-medium" />
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">Emergency Phone</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <PhoneIcon className="h-5 w-5 text-gray-400" />
                  </div>
                  <input type="tel" value={formData.emergencyPhone}
                    onChange={(e) => setFormData({ ...formData, emergencyPhone: e.target.value })}
                    placeholder="e.g. 012-3456789"
                    className="w-full bg-white border border-gray-300 rounded-lg pl-10 px-4 py-3 outline-none focus:ring-2 focus:ring-red-500 transition-all shadow-sm text-gray-900 font-medium" />
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 hover:shadow-md transition-shadow relative overflow-hidden">
            <div className="absolute -right-10 -top-10 text-red-50 opacity-50 pointer-events-none">
              <ShieldCheckIcon className="h-48 w-48" />
            </div>
            <div className="flex items-center space-x-2 border-b border-gray-100 pb-3 mb-6 relative z-10">
              <DocumentTextIcon className="h-6 w-6 text-red-500" />
              <h3 className="text-xl font-bold text-gray-800">Medical Insurance Details</h3>
              <span className="text-xs text-gray-400 font-normal ml-2">(informational only)</span>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 relative z-10">
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">Insurance Provider</label>
                <select value={formData.insuranceProvider}
                  onChange={(e) => setFormData({ ...formData, insuranceProvider: e.target.value })}
                  className="w-full bg-white border border-gray-300 rounded-lg px-4 py-3 outline-none focus:ring-2 focus:ring-red-500 transition-all shadow-sm text-gray-900 font-medium">
                  <option value="">-- No Insurance (Self Pay) --</option>
                  <option value="AIA Public Takaful">AIA Public Takaful</option>
                  <option value="Prudential BSN">Prudential BSN</option>
                  <option value="Great Eastern Life">Great Eastern Life</option>
                  <option value="Allianz Malaysia">Allianz Malaysia</option>
                  <option value="Etiqa">Etiqa</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">Policy / Member Number</label>
                <input type="text" value={formData.policyNumber}
                  onChange={(e) => setFormData({ ...formData, policyNumber: e.target.value })}
                  placeholder="e.g. POL-123456"
                  className="w-full bg-white border border-gray-300 rounded-lg px-4 py-3 outline-none focus:ring-2 focus:ring-red-500 transition-all shadow-sm text-gray-900 font-medium" />
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">Coverage Type</label>
                <select value={formData.coverageType}
                  onChange={(e) => setFormData({ ...formData, coverageType: e.target.value })}
                  className="w-full bg-white border border-gray-300 rounded-lg px-4 py-3 outline-none focus:ring-2 focus:ring-red-500 transition-all shadow-sm text-gray-900 font-medium">
                  <option value="Full Coverage">Full Coverage (In-patient & Out-patient)</option>
                  <option value="In-patient Only">In-patient Only</option>
                  <option value="Co-pay 20%">Co-pay 20%</option>
                  <option value="Dental/Vision Only">Dental / Vision Only</option>
                  <option value="N/A">Not Applicable</option>
                </select>
              </div>
            </div>
          </div>

          <div className="flex justify-end">
            <button type="submit" disabled={isSaving}
              className={`flex items-center px-8 py-3 rounded-lg text-white font-bold shadow-md transition-all duration-200 ${
                isSaving ? 'bg-red-400 cursor-not-allowed' : 'bg-red-600 hover:bg-red-700 hover:shadow-lg hover:-translate-y-0.5'
              }`}>
              {isSaving ? (
                <>
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Saving Changes...
                </>
              ) : 'Save Updated Profile'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function Page() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600"></div>
      </div>
    }>
      <EditPatientContent />
    </Suspense>
  );
}
