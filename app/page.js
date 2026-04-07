'use client';
import Link from 'next/link';

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-white font-sans text-black">
      {/* --- NAVIGATION --- */}
      <nav className="flex items-center justify-between px-8 py-6 border-b border-gray-100 sticky top-0 bg-white z-50">
        <div className="text-2xl font-bold text-red-600 tracking-tight">
          MediCare<span className="text-black">+</span>
        </div>
        <div className="space-x-4">
          <Link href="/login" className="text-sm font-semibold hover:text-red-600 transition-colors">
            Log in
          </Link>
          <Link href="/register" className="bg-red-600 text-white px-5 py-2.5 rounded-lg text-sm font-bold hover:bg-red-700 transition-all shadow-md">
            Join Now
          </Link>
        </div>
      </nav>

      {/* --- HERO SECTION --- */}
      <main className="max-w-6xl mx-auto px-8 pt-20 pb-32 flex flex-col items-center text-center">
        <div className="inline-block px-4 py-1.5 mb-6 text-xs font-bold tracking-widest text-red-600 uppercase bg-red-50 rounded-full">
          Trusted by 10,000+ Patients in Malaysia
        </div>
        <h1 className="text-5xl md:text-7xl font-extrabold leading-tight mb-6">
          Healthcare Management <br />
          <span className="text-red-600">Simplified.</span>
        </h1>
        <p className="text-lg text-gray-600 max-w-2xl mb-10 leading-relaxed">
          The all-in-one platform for Patients, Doctors, and Receptionists. 
          Manage appointments, digital records, and prescriptions with a single click.
        </p>
        <div className="flex flex-col sm:flex-row gap-4">
          <Link href="/register" className="bg-red-600 text-white px-10 py-4 rounded-xl text-lg font-bold hover:bg-red-700 transition-all shadow-xl hover:scale-105">
            Get Started Today
          </Link>
          <button className="border-2 border-gray-200 px-10 py-4 rounded-xl text-lg font-bold hover:bg-gray-50 transition-all">
            View Our Services
          </button>
        </div>
      </main>

      {/* --- ROLE SECTION --- */}
      <section className="bg-gray-50 py-24 px-8">
        <div className="max-w-6xl mx-auto grid md:grid-cols-3 gap-8">
          {/* Card 1 */}
          <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
            <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center mb-6">
              <span className="text-2xl text-red-600">👤</span>
            </div>
            <h3 className="text-xl font-bold mb-3">For Patients</h3>
            <p className="text-gray-500 text-sm leading-relaxed">
              Book appointments, view your medical history, and chat with your doctors 24/7.
            </p>
          </div>

          {/* Card 2 */}
          <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
            <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center mb-6">
              <span className="text-2xl text-red-600">🩺</span>
            </div>
            <h3 className="text-xl font-bold mb-3">For Doctors</h3>
            <p className="text-gray-500 text-sm leading-relaxed">
              Streamline your consultations and manage patient records with our AI-powered dashboard.
            </p>
          </div>

          {/* Card 3 */}
          <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
            <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center mb-6">
              <span className="text-2xl text-red-600">🏢</span>
            </div>
            <h3 className="text-xl font-bold mb-3">For Admin</h3>
            <p className="text-gray-500 text-sm leading-relaxed">
              Full control over clinic operations, staff scheduling, and financial reporting.
            </p>
          </div>
        </div>
      </section>

      {/* --- FOOTER --- */}
      <footer className="py-12 border-t border-gray-100 text-center text-sm text-gray-400">
        © 2026 MediCare+ Malaysia. All rights reserved. Built for DDAC Assignment.
      </footer>
    </div>
  );
}