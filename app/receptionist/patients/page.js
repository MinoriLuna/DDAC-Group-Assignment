'use client';

import { useState, useMemo, useEffect } from 'react';
import Link from 'next/link';
import {
  MagnifyingGlassIcon,
  UserIcon,
  CalendarDaysIcon,
  PhoneIcon,
  PencilSquareIcon,
  PlusCircleIcon,
  ChevronRightIcon
} from '@heroicons/react/24/outline';

// We now fetch patients from the C# Backend API
export default function SearchPatients() {
  const [patients, setPatients] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  // Fetch from live API
  useEffect(() => {
    const fetchPatients = async () => {
      try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL ?? ''}/api/receptionist/patients`);
        if (response.ok) {
          const data = await response.json();
          setPatients(data);
        }
      } catch (error) {
        console.error("Failed to fetch patients:", error);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchPatients();
  }, []);

  // Filter patients by name only
  const filteredPatients = useMemo(() => {
    const trimmed = searchTerm.trim();
    if (!trimmed) return patients;
    return patients.filter(p =>
      p.name.toLowerCase().includes(trimmed.toLowerCase())
    );
  }, [patients, searchTerm]);

  return (
    <div className="min-h-screen bg-gray-50 py-10 px-4 sm:px-6 lg:px-8 font-sans">
      <div className="max-w-6xl w-full mx-auto space-y-8">
        
        {/* Page Header & Top Actions */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h2 className="text-3xl font-extrabold text-gray-900 tracking-tight">
              Patient Directory
            </h2>
            <p className="mt-1 text-sm text-gray-500">
              Search for patients to view records, update profiles, or book appointments.
            </p>
          </div>
          <Link href="/receptionist/patients/new">
            <button className="flex items-center px-5 py-2.5 bg-red-600 text-white font-medium rounded-lg shadow hover:bg-red-700 transition-colors">
              <PlusCircleIcon className="h-5 w-5 mr-2" />
              Register New Patient
            </button>
          </Link>
        </div>

        {/* Search Box */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 relative z-20">
          <label className="block text-sm font-bold text-gray-700 mb-3">Quick Search</label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
              <MagnifyingGlassIcon className={`h-6 w-6 transition-colors duration-300 ${searchTerm ? 'text-red-500' : 'text-gray-400'}`} />
            </div>
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search by patient name..."
              className="w-full pl-12 pr-4 py-4 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 outline-none focus:ring-2 focus:ring-red-500 focus:bg-white transition-all text-lg shadow-inner"
            />
          </div>
        </div>

        {/* Results Section */}
        <div>
           <h3 className="text-lg font-bold text-gray-700 mb-4 flex items-center">
             Results <span className="ml-2 bg-gray-200 text-gray-800 py-0.5 px-2.5 rounded-full text-sm">{filteredPatients.length} found</span>
           </h3>

           {isLoading ? (
             <div className="bg-white rounded-2xl p-12 text-center border border-gray-100 flex flex-col items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-500 mb-4"></div>
                <h4 className="text-xl font-bold text-gray-600">Loading directory...</h4>
                <p className="text-gray-400 mt-2">Connecting to database</p>
             </div>
           ) : filteredPatients.length === 0 ? (
             <div className="bg-white rounded-2xl p-12 text-center border border-gray-100 border-dashed">
                <UserIcon className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                <h4 className="text-xl font-bold text-gray-600">No patients found</h4>
                <p className="text-gray-400 mt-2">We couldn't find anyone matching "{searchTerm}"</p>
             </div>
           ) : (
             <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-6">
                {filteredPatients.map(patient => (
                  <div key={patient.id} className="bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-lg transition-all duration-300 overflow-hidden flex flex-col group">
                    
                    {/* Card Header */}
                    <div className="p-6 pb-2 flex justify-between items-start">
                      <div className="flex items-center space-x-4">
                        <div className="h-12 w-12 bg-red-50 rounded-full flex items-center justify-center text-red-600 font-bold text-lg group-hover:bg-red-600 group-hover:text-white transition-colors">
                           {patient.name.charAt(0)}
                        </div>
                        <div>
                          <h4 className="text-lg font-bold text-gray-900 group-hover:text-red-700 transition-colors">{patient.name}</h4>
                          <p className="text-sm text-gray-500 font-mono mt-0.5">{patient.id} &bull; {patient.icPassport}</p>
                        </div>
                      </div>
                      <span className={`px-3 py-1 rounded-full text-xs font-bold ${patient.status === 'Active' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'}`}>
                        {patient.status}
                      </span>
                    </div>

                    {/* Card Body - Details */}
                    <div className="p-6 pt-3 space-y-3 flex-grow">
                      <div className="flex items-center text-sm text-gray-600">
                        <PhoneIcon className="h-4 w-4 mr-2 text-gray-400" />
                        {patient.phone}
                      </div>
                      <div className="flex flex-col text-sm text-gray-600 bg-gray-50 rounded-lg p-3 border border-gray-100">
                         <div className="flex items-center mb-1">
                           <CalendarDaysIcon className="h-4 w-4 mr-2 text-red-400" />
                           <span className="font-medium text-gray-700">Appointments</span>
                         </div>
                         <p className="pl-6 text-xs text-gray-500"><span className="font-semibold text-gray-700">Upcoming:</span> {patient.upcomingAppointment}</p>
                         <p className="pl-6 text-xs text-gray-500 mt-1"><span className="font-semibold text-gray-700">Last visit:</span> {patient.lastVisit}</p>
                      </div>
                    </div>

                    {/* Card Footer - Actions */}
                    <div className="bg-gray-50 border-t border-gray-100 p-4 flex justify-between items-center sm:px-6">
                      <Link href={`/receptionist/patients/edit?id=${patient.realId}`} className="flex-1">
                        <button className="flex items-center justify-center w-full py-2 text-sm font-medium text-gray-700 hover:text-red-600 hover:bg-red-50 rounded-md transition-colors">
                          <PencilSquareIcon className="h-4 w-4 mr-1.5" />
                          Edit Profile
                        </button>
                      </Link>
                      <div className="w-px h-6 bg-gray-200 mx-2"></div>
                      <Link
                        href={`/receptionist/appointments/new?patientId=${patient.realId}&patientName=${encodeURIComponent(patient.name)}`}
                        className="flex items-center justify-center flex-1 py-2 text-sm font-medium text-gray-700 hover:text-red-600 hover:bg-red-50 rounded-md transition-colors"
                      >
                        Book Appt
                        <ChevronRightIcon className="h-4 w-4 ml-1" />
                      </Link>
                    </div>
                  </div>
                ))}
             </div>
           )}
        </div>
      </div>
    </div>
  );
}
