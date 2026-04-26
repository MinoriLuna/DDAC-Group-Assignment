'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { 
  UserIcon, 
  IdentificationIcon, 
  MapPinIcon, 
  PhoneIcon, 
  EnvelopeIcon, 
  UserGroupIcon,
  HeartIcon,
  CheckCircleIcon
} from '@heroicons/react/24/outline';

export default function RegisterPatient() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    fullName: '',
    icPassport: '',
    dob: '',
    gender: 'Male',
    phone: '',
    email: '',
    address: '',
    emergencyName: '',
    emergencyRelation: '',
    emergencyPhone: ''
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successStatus, setSuccessStatus] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      const response = await fetch('http://localhost:5230/api/receptionist/patients', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });

      if (response.ok) {
        setSuccessStatus(true);
        setTimeout(() => {
          router.push('/receptionist/patients');
        }, 1500);
      } else {
        const err = await response.json().catch(() => ({}));
        console.error("Failed to register patient:", err);
        alert(`Failed to register patient: ${err.message || response.status}`);
      }
    } catch (error) {
      console.error("Error registering patient:", error);
      alert("Error connecting to server.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex py-12 px-4 sm:px-6 lg:px-8 font-sans">
      <div className="max-w-4xl w-full mx-auto">
        
        {/* Header Section */}
        <div className="mb-8">
          <h2 className="text-3xl font-extrabold text-gray-900 tracking-tight">
            Register New Patient
          </h2>
          <p className="mt-2 text-sm text-gray-500">
            Enter the patient's personal, contact, and emergency details to create a new medical record.
          </p>
        </div>

        {/* Main Form Card */}
        <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
          <form onSubmit={handleSubmit} className="p-8 space-y-10">
            
            {/* Section 1: Personal Information */}
            <div>
              <div className="flex items-center space-x-2 border-b border-gray-100 pb-3 mb-6">
                <UserIcon className="h-6 w-6 text-red-500" />
                <h3 className="text-xl font-semibold text-gray-800">Personal Information</h3>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Full Name (as per IC/Passport)</label>
                  <input type="text" required
                    value={formData.fullName}
                    onChange={(e) => setFormData({...formData, fullName: e.target.value})}
                    className="w-full bg-gray-50 border border-gray-200 rounded-lg px-4 py-3 outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all duration-200 text-gray-900" 
                    placeholder="e.g. John Doe" />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">IC / Passport Number</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <IdentificationIcon className="h-5 w-5 text-gray-400" />
                    </div>
                    <input type="text" required
                      value={formData.icPassport}
                      onChange={(e) => setFormData({...formData, icPassport: e.target.value})}
                      className="w-full bg-gray-50 border border-gray-200 rounded-lg pl-10 px-4 py-3 outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all duration-200 text-gray-900" 
                      placeholder="e.g. 901231-10-5341" />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Date of Birth</label>
                    <input type="date" required
                      value={formData.dob}
                      onChange={(e) => setFormData({...formData, dob: e.target.value})}
                      className="w-full bg-gray-50 border border-gray-200 rounded-lg px-4 py-3 outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all duration-200 text-gray-900" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Gender</label>
                    <select 
                      value={formData.gender}
                      onChange={(e) => setFormData({...formData, gender: e.target.value})}
                      className="w-full bg-gray-50 border border-gray-200 rounded-lg px-4 py-3 outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all duration-200 text-gray-900">
                      <option value="Male">Male</option>
                      <option value="Female">Female</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>
                </div>
              </div>
            </div>

            {/* Section 2: Contact Details */}
            <div>
              <div className="flex items-center space-x-2 border-b border-gray-100 pb-3 mb-6">
                <MapPinIcon className="h-6 w-6 text-red-500" />
                <h3 className="text-xl font-semibold text-gray-800">Contact Details</h3>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Phone Number</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <PhoneIcon className="h-5 w-5 text-gray-400" />
                    </div>
                    <input type="tel" required
                      value={formData.phone}
                      onChange={(e) => setFormData({...formData, phone: e.target.value})}
                      className="w-full bg-gray-50 border border-gray-200 rounded-lg pl-10 px-4 py-3 outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all duration-200 text-gray-900" 
                      placeholder="+60 12-345 6789" />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Email Address (Optional)</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <EnvelopeIcon className="h-5 w-5 text-gray-400" />
                    </div>
                    <input type="email"
                      value={formData.email}
                      onChange={(e) => setFormData({...formData, email: e.target.value})}
                      className="w-full bg-gray-50 border border-gray-200 rounded-lg pl-10 px-4 py-3 outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all duration-200 text-gray-900" 
                      placeholder="john@example.com" />
                  </div>
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Home Address</label>
                  <div className="relative">
                    <div className="absolute top-3 left-3 pointer-events-none">
                       <MapPinIcon className="h-5 w-5 text-gray-400" />
                    </div>
                    <textarea required
                      value={formData.address}
                      rows="3"
                      onChange={(e) => setFormData({...formData, address: e.target.value})}
                      className="w-full bg-gray-50 border border-gray-200 rounded-lg pl-10 px-4 py-3 outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all duration-200 text-gray-900 resize-none" 
                      placeholder="Enter full home address" />
                  </div>
                </div>
              </div>
            </div>

            {/* Section 3: Emergency Contact */}
            <div>
              <div className="flex items-center space-x-2 border-b border-gray-100 pb-3 mb-6">
                <HeartIcon className="h-6 w-6 text-red-500" />
                <h3 className="text-xl font-semibold text-gray-800">Emergency Contact</h3>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Contact Name</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <UserGroupIcon className="h-5 w-5 text-gray-400" />
                    </div>
                    <input type="text" required
                      value={formData.emergencyName}
                      onChange={(e) => setFormData({...formData, emergencyName: e.target.value})}
                      className="w-full bg-gray-50 border border-gray-200 rounded-lg pl-10 px-4 py-3 outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all duration-200 text-gray-900" 
                      placeholder="e.g. Jane Doe" />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Relationship</label>
                  <input type="text" required
                    value={formData.emergencyRelation}
                    onChange={(e) => setFormData({...formData, emergencyRelation: e.target.value})}
                    className="w-full bg-gray-50 border border-gray-200 rounded-lg px-4 py-3 outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all duration-200 text-gray-900" 
                    placeholder="e.g. Spouse / Sibling" />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Emergency Phone</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <PhoneIcon className="h-5 w-5 text-gray-400" />
                    </div>
                    <input type="tel" required
                      value={formData.emergencyPhone}
                      onChange={(e) => setFormData({...formData, emergencyPhone: e.target.value})}
                      className="w-full bg-gray-50 border border-gray-200 rounded-lg pl-10 px-4 py-3 outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all duration-200 text-gray-900" 
                      placeholder="+60 12-345 6789" />
                  </div>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="pt-6 border-t border-gray-100 flex items-center justify-end space-x-4">
              <button type="button" 
                onClick={() => setFormData({
                  fullName: '', icPassport: '', dob: '', gender: 'Male',
                  phone: '', email: '', address: '', emergencyName: '',
                  emergencyRelation: '', emergencyPhone: ''
                })}
                className="px-6 py-3 text-gray-600 font-medium hover:text-gray-900 hover:bg-gray-50 rounded-lg transition-colors duration-200">
                Clear Form
              </button>
              
              <button type="submit" disabled={isSubmitting || successStatus}
                className={`flex items-center px-8 py-3 rounded-lg text-white font-medium shadow-md transition-all duration-200 
                  ${successStatus 
                    ? 'bg-green-500 hover:bg-green-600' 
                    : 'bg-red-600 hover:bg-red-700 hover:shadow-lg'
                  }
                  ${isSubmitting && 'opacity-75 cursor-not-allowed'}
                `}>
                {successStatus ? (
                  <>
                    <CheckCircleIcon className="h-5 w-5 mr-2" />
                    Registered Successfully
                  </>
                ) : isSubmitting ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Processing...
                  </>
                ) : (
                  'Register Patient'
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
