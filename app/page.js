'use client';
import Link from 'next/link';

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-white font-sans text-black">
      {/* --- NAVIGATION --- */}
      <nav className="flex items-center justify-between px-8 py-6 border-b border-gray-100 sticky top-0 bg-white/95 backdrop-blur-sm z-50 shadow-sm">
        <Link href="/" className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-red-600 to-red-500 flex items-center justify-center text-white font-bold">
            M+
          </div>
          <span className="text-2xl font-black text-gray-900">MediCare<span className="text-red-600">+</span></span>
        </Link>
        <div className="flex items-center gap-4">
          <Link href="/login" className="text-sm font-semibold text-gray-600 hover:text-red-600 transition-colors px-4 py-2 rounded-lg hover:bg-gray-50">
            Log in
          </Link>
          <Link href="/register" className="bg-gradient-to-r from-red-600 to-red-500 hover:from-red-700 hover:to-red-600 text-white px-6 py-2.5 rounded-xl text-sm font-bold transition-all shadow-lg hover:shadow-xl">
            Join Now
          </Link>
        </div>
      </nav>

      {/* --- HERO SECTION --- */}
      <main className="relative overflow-hidden">
        {/* Background gradient */}
        <div className="absolute inset-0 bg-gradient-to-br from-red-50 via-white to-blue-50 -z-10"></div>
        <div className="absolute top-10 left-10 w-72 h-72 bg-red-200/20 rounded-full blur-3xl -z-10 animate-pulse-slow"></div>
        <div className="absolute bottom-10 right-10 w-72 h-72 bg-blue-200/20 rounded-full blur-3xl -z-10 animate-pulse-slow" style={{animationDelay: '1s'}}></div>

        <div className="max-w-7xl mx-auto px-8 pt-24 pb-32 flex flex-col items-center text-center animate-fade-in">
          <div className="inline-block px-4 py-2 mb-8 text-xs font-bold tracking-widest text-red-600 uppercase bg-red-100 rounded-full border border-red-200">
            🚀 Trusted by 10,000+ Healthcare Professionals
          </div>

          <h1 className="text-6xl md:text-7xl font-black leading-tight mb-8 text-gray-900">
            Healthcare Management <br />
            <span className="bg-gradient-to-r from-red-600 to-red-500 bg-clip-text text-transparent">Simplified.</span>
          </h1>

          <p className="text-xl text-gray-600 max-w-3xl mb-12 leading-relaxed">
            MediCare+ is an all-in-one platform for <span className="font-bold text-gray-900">Patients</span>, <span className="font-bold text-gray-900">Doctors</span>, and <span className="font-bold text-gray-900">Receptionists</span>.
            Manage appointments, digital records, prescriptions, and more—all in one place.
          </p>

          <div className="flex flex-col sm:flex-row gap-5 justify-center mb-16">
            <Link href="/register" className="group">
              <button className="bg-gradient-to-r from-red-600 to-red-500 hover:from-red-700 hover:to-red-600 text-white px-12 py-5 rounded-2xl text-lg font-bold shadow-2xl hover:shadow-3xl transition-all active:scale-95 transform group-hover:scale-105">
                Get Started Free
              </button>
            </Link>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-8 pt-8 border-t border-gray-200">
            <div className="text-center">
              <p className="text-4xl font-black text-red-600">10K+</p>
              <p className="text-sm text-gray-600 mt-1">Active Users</p>
            </div>
            <div className="text-center">
              <p className="text-4xl font-black text-red-600">50K+</p>
              <p className="text-sm text-gray-600 mt-1">Appointments</p>
            </div>
            <div className="text-center">
              <p className="text-4xl font-black text-red-600">99.9%</p>
              <p className="text-sm text-gray-600 mt-1">Uptime</p>
            </div>
          </div>
        </div>
      </main>

      {/* --- FEATURES SECTION --- */}
      <section className="py-32 px-8 bg-gray-50 border-t border-gray-200">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-20">
            <h2 className="text-5xl font-black text-gray-900 mb-4">Powerful Features</h2>
            <p className="text-xl text-gray-600">Everything you need to manage healthcare efficiently</p>
          </div>

          <div className="grid md:grid-cols-2 gap-8 mb-8">
            {/* Feature Card 1 */}
            <div className="bg-white p-10 rounded-2xl shadow-lg hover:shadow-2xl transition-all border border-gray-100 group">
              <div className="w-14 h-14 bg-gradient-to-br from-red-600 to-red-500 rounded-xl flex items-center justify-center text-white text-2xl mb-6 group-hover:scale-110 transition-transform">
                📅
              </div>
              <h3 className="text-2xl font-bold mb-3 text-gray-900">Appointment Management</h3>
              <p className="text-gray-600 leading-relaxed">
                Smart scheduling system that reduces no-shows and optimizes doctor availability across multiple specialties.
              </p>
              <ul className="mt-5 space-y-2 text-sm text-gray-600">
                <li>✓ Real-time booking</li>
                <li>✓ Automated reminders</li>
                <li>✓ Rescheduling tools</li>
              </ul>
            </div>

            {/* Feature Card 2 */}
            <div className="bg-white p-10 rounded-2xl shadow-lg hover:shadow-2xl transition-all border border-gray-100 group">
              <div className="w-14 h-14 bg-gradient-to-br from-blue-600 to-blue-500 rounded-xl flex items-center justify-center text-white text-2xl mb-6 group-hover:scale-110 transition-transform">
                🔒
              </div>
              <h3 className="text-2xl font-bold mb-3 text-gray-900">Secure Medical Records</h3>
              <p className="text-gray-600 leading-relaxed">
                HIPAA-compliant storage with end-to-end encryption for all patient data and medical documents.
              </p>
              <ul className="mt-5 space-y-2 text-sm text-gray-600">
                <li>✓ AWS S3 encryption</li>
                <li>✓ Access controls</li>
                <li>✓ Audit logs</li>
              </ul>
            </div>

            {/* Feature Card 3 */}
            <div className="bg-white p-10 rounded-2xl shadow-lg hover:shadow-2xl transition-all border border-gray-100 group">
              <div className="w-14 h-14 bg-gradient-to-br from-green-600 to-green-500 rounded-xl flex items-center justify-center text-white text-2xl mb-6 group-hover:scale-110 transition-transform">
                💬
              </div>
              <h3 className="text-2xl font-bold mb-3 text-gray-900">Patient-Doctor Chat</h3>
              <p className="text-gray-600 leading-relaxed">
                Real-time messaging system for follow-ups, prescription queries, and general healthcare support.
              </p>
              <ul className="mt-5 space-y-2 text-sm text-gray-600">
                <li>✓ Instant messaging</li>
                <li>✓ File sharing</li>
                <li>✓ Read receipts</li>
              </ul>
            </div>

            {/* Feature Card 4 */}
            <div className="bg-white p-10 rounded-2xl shadow-lg hover:shadow-2xl transition-all border border-gray-100 group">
              <div className="w-14 h-14 bg-gradient-to-br from-purple-600 to-purple-500 rounded-xl flex items-center justify-center text-white text-2xl mb-6 group-hover:scale-110 transition-transform">
                📊
              </div>
              <h3 className="text-2xl font-bold mb-3 text-gray-900">Analytics & Insights</h3>
              <p className="text-gray-600 leading-relaxed">
                Comprehensive dashboards with AI-powered insights for clinic management and patient health trends.
              </p>
              <ul className="mt-5 space-y-2 text-sm text-gray-600">
                <li>✓ Real-time metrics</li>
                <li>✓ AI analysis</li>
                <li>✓ Reports</li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* --- ROLE SECTION --- */}
      <section className="py-32 px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-5xl font-black text-gray-900 mb-4">Built for Everyone</h2>
            <p className="text-xl text-gray-600">Tailored experiences for each user role</p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {/* Patients */}
            <div className="bg-white p-8 rounded-2xl shadow-lg hover:shadow-2xl hover:-translate-y-2 transition-all border border-gray-100 group">
              <div className="w-16 h-16 bg-gradient-to-br from-blue-600 to-blue-500 rounded-2xl flex items-center justify-center text-white text-4xl mb-6 group-hover:scale-110 transition-transform">
                👤
              </div>
              <h3 className="text-2xl font-bold mb-3">For Patients</h3>
              <p className="text-gray-600 mb-6">
                Easy access to healthcare with appointment booking, medical history, and doctor consultations.
              </p>
              <ul className="space-y-2 text-sm text-gray-600">
                <li className="flex items-center gap-2"><span className="text-red-600">✓</span> Book appointments instantly</li>
                <li className="flex items-center gap-2"><span className="text-red-600">✓</span> View medical history</li>
                <li className="flex items-center gap-2"><span className="text-red-600">✓</span> Chat with doctors</li>
                <li className="flex items-center gap-2"><span className="text-red-600">✓</span> Digital prescriptions</li>
              </ul>
            </div>

            {/* Doctors */}
            <div className="bg-white p-8 rounded-2xl shadow-lg hover:shadow-2xl hover:-translate-y-2 transition-all border border-gray-100 group">
              <div className="w-16 h-16 bg-gradient-to-br from-green-600 to-green-500 rounded-2xl flex items-center justify-center text-white text-4xl mb-6 group-hover:scale-110 transition-transform">
                🩺
              </div>
              <h3 className="text-2xl font-bold mb-3">For Doctors</h3>
              <p className="text-gray-600 mb-6">
                Streamline consultations and access patient records with our AI-powered healthcare dashboard.
              </p>
              <ul className="space-y-2 text-sm text-gray-600">
                <li className="flex items-center gap-2"><span className="text-red-600">✓</span> View patient records</li>
                <li className="flex items-center gap-2"><span className="text-red-600">✓</span> Schedule consultations</li>
                <li className="flex items-center gap-2"><span className="text-red-600">✓</span> Issue prescriptions</li>
                <li className="flex items-center gap-2"><span className="text-red-600">✓</span> Patient analytics</li>
              </ul>
            </div>

            {/* Receptionists */}
            <div className="bg-white p-8 rounded-2xl shadow-lg hover:shadow-2xl hover:-translate-y-2 transition-all border border-gray-100 group">
              <div className="w-16 h-16 bg-gradient-to-br from-red-600 to-red-500 rounded-2xl flex items-center justify-center text-white text-4xl mb-6 group-hover:scale-110 transition-transform">
                📋
              </div>
              <h3 className="text-2xl font-bold mb-3">For Receptionists</h3>
              <p className="text-gray-600 mb-6">
                Manage live check-in queues, register new patients, and oversee daily clinic schedules.
              </p>
              <ul className="space-y-2 text-sm text-gray-600">
                <li className="flex items-center gap-2"><span className="text-red-600">✓</span> Patient check-in</li>
                <li className="flex items-center gap-2"><span className="text-red-600">✓</span> Queue management</li>
                <li className="flex items-center gap-2"><span className="text-red-600">✓</span> Register patients</li>
                <li className="flex items-center gap-2"><span className="text-red-600">✓</span> Daily schedules</li>
              </ul>
            </div>

            {/* Admin */}
            <div className="bg-white p-8 rounded-2xl shadow-lg hover:shadow-2xl hover:-translate-y-2 transition-all border border-gray-100 group">
              <div className="w-16 h-16 bg-gradient-to-br from-purple-600 to-purple-500 rounded-2xl flex items-center justify-center text-white text-4xl mb-6 group-hover:scale-110 transition-transform">
                🏢
              </div>
              <h3 className="text-2xl font-bold mb-3">For Admins</h3>
              <p className="text-gray-600 mb-6">
                Full control over clinic operations, staff management, and financial reporting with insights.
              </p>
              <ul className="space-y-2 text-sm text-gray-600">
                <li className="flex items-center gap-2"><span className="text-red-600">✓</span> Clinic management</li>
                <li className="flex items-center gap-2"><span className="text-red-600">✓</span> Staff scheduling</li>
                <li className="flex items-center gap-2"><span className="text-red-600">✓</span> Finance reports</li>
                <li className="flex items-center gap-2"><span className="text-red-600">✓</span> User management</li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* --- CTA SECTION --- */}
      <section className="py-32 px-8 bg-gradient-to-r from-red-600 to-red-500 text-white">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-5xl font-black mb-6">Ready to Transform Your Healthcare?</h2>
          <p className="text-xl mb-12 text-red-100">
            Join thousands of healthcare professionals already using MediCare+ to deliver better patient care.
          </p>
          <div className="flex flex-col sm:flex-row gap-5 justify-center">
            <Link href="/register">
              <button className="bg-white text-red-600 hover:bg-gray-100 px-12 py-5 rounded-2xl text-lg font-bold transition-all shadow-xl hover:shadow-2xl active:scale-95">
                Get Started Free
              </button>
            </Link>
          </div>
        </div>
      </section>

      {/* --- FOOTER --- */}
      <footer className="py-12 border-t border-gray-200 text-center text-sm text-gray-600 bg-white">
        <div className="max-w-6xl mx-auto px-8">
          <p className="mb-6">© 2026 MediCare+ Malaysia. All rights reserved.</p>
          <div className="flex flex-col sm:flex-row gap-8 justify-center text-gray-500 text-xs">
          </div>
        </div>
      </footer>
    </div>
  );
}