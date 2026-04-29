'use client';
import { useEffect, useState } from 'react';
import { APPOINTMENT_STATUS } from '@/utils/constants';
import { useNotification } from '@/hooks/useNotification';
import { useConfirmation } from '@/hooks/useConfirmation';

// SVG Icons
const SearchIcon = () => <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>;
const PrintIcon = () => <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4H9a2 2 0 00-2 2v2a2 2 0 002 2h6a2 2 0 002-2v-2a2 2 0 00-2-2m-6-4V9a2 2 0 012-2h2a2 2 0 012 2v4m-6 4h6" /></svg>;
const CalendarIcon = () => <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>;
const CheckIcon = () => <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" /></svg>;
const XIcon = () => <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" /></svg>;
const ClockIcon = () => <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 2m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>;
const UserIcon = () => <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>;

export default function AppointmentsPage() {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentUpcomingPage, setCurrentUpcomingPage] = useState(1);
  const [currentPastPage, setCurrentPastPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('date-asc');
  const [filterStatus, setFilterStatus] = useState('all');
  const itemsPerPage = 5;
  const { showNotification } = useNotification();
  const { showConfirmation } = useConfirmation();
  const [cancelPending, setCancelPending] = useState(null);

  useEffect(() => {
    const fetchAppointments = async () => {
      const token = localStorage.getItem('token');
      try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL ?? ''}/api/appointment/mine`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        
        if (res.ok) {
          const data = await res.json();
          setAppointments(data);
        } else {
          showNotification('Failed to load appointments', 'error');
        }
      } catch (err) {
        console.error("Failed to fetch appointments:", err);
        showNotification('Network error loading appointments', 'error');
      } finally {
        setLoading(false);
      }
    };

    fetchAppointments();
  }, []);

  const handleCancel = (id) => {
    showConfirmation(
      "Are you sure you want to cancel this appointment?",
      async () => {
        setCancelPending(id);
        try {
          const token = localStorage.getItem('token');
          const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL ?? ''}/api/appointment/${id}/cancel`, {
            method: 'PATCH',
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json'
            }
          });

          if (res.ok) {
            setAppointments(appointments.map(appt =>
              appt.appointmentId === id
                ? { ...appt, status: APPOINTMENT_STATUS.CANCELLED }
                : appt
            ));
            showNotification("Appointment cancelled successfully", "success");
          } else {
            const errorData = await res.json().catch(() => ({}));
            showNotification(`Error: ${errorData.message || 'Could not cancel'}`, "error");
          }
        } catch (error) {
          console.error("Cancel failed:", error);
          showNotification("Network error. Could not cancel appointment", "error");
        } finally {
          setCancelPending(null);
        }
      }
    );
  };

  const printAppointment = (appt) => {
    const printContent = `
      <html>
        <head>
          <title>Appointment Details - ${appt.doctorName}</title>
          <style>
            body { font-family: Arial, sans-serif; padding: 40px; line-height: 1.6; color: #333; }
            .header { text-align: center; margin-bottom: 30px; border-bottom: 3px solid #dc2626; padding-bottom: 20px; }
            .header h1 { margin: 0; color: #dc2626; font-size: 28px; }
            .section { margin: 20px 0; }
            .label { font-weight: bold; color: #666; font-size: 12px; text-transform: uppercase; letter-spacing: 0.5px; }
            .value { font-size: 16px; color: #000; margin-top: 5px; }
            .status { display: inline-block; padding: 8px 12px; border-radius: 20px; font-weight: bold; font-size: 12px; margin-top: 10px; }
            .status.pending { background: #fef3c7; color: #b45309; }
            .status.confirmed { background: #dbeafe; color: #1e40af; }
            .status.completed { background: #dcfce7; color: #166534; }
            .status.cancelled { background: #fee2e2; color: #991b1b; }
            .footer { margin-top: 40px; padding-top: 20px; border-top: 1px solid #e5e7eb; font-size: 12px; color: #999; text-align: center; }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>Appointment Details</h1>
          </div>
          
          <div class="section">
            <div class="label">Doctor</div>
            <div class="value">${appt.doctorName || 'Not Assigned'}</div>
          </div>
          
          <div class="section">
            <div class="label">Appointment Date & Time</div>
            <div class="value">${formatDateTime(appt.appointmentDate, appt.appointmentTime)}</div>
          </div>
          
          <div class="section">
            <div class="label">Reason for Visit</div>
            <div class="value">${appt.reason || 'General Check-up'}</div>
          </div>
          
          <div class="section">
            <div class="label">Status</div>
            <div class="status ${appt.status.toLowerCase()}">${appt.status}</div>
          </div>
          
          <div class="footer">
            <p>This appointment details were generated on ${new Date().toLocaleDateString()}</p>
            <p>Please arrive 10 minutes early to your appointment.</p>
          </div>
        </body>
      </html>
    `;
    
    const newWindow = window.open('', '', 'width=800,height=600');
    newWindow.document.write(printContent);
    newWindow.document.close();
    setTimeout(() => newWindow.print(), 250);
  };

  const StatusBadge = ({ status }) => {
    const configs = {
      'Pending': { bg: 'bg-orange-50', text: 'text-orange-700', icon: ClockIcon, label: 'Pending' },
      'Confirmed': { bg: 'bg-blue-50', text: 'text-blue-700', icon: CheckIcon, label: 'Confirmed' },
      'Completed': { bg: 'bg-green-50', text: 'text-green-700', icon: CheckIcon, label: 'Completed' },
      'Cancelled': { bg: 'bg-red-50', text: 'text-red-700', icon: XIcon, label: 'Cancelled' }
    };
    
    const config = configs[status] || configs['Pending'];
    const Icon = config.icon;
    
    return (
      <div className={`${config.bg} ${config.text} px-4 py-2 rounded-full text-xs font-bold uppercase tracking-wider flex items-center gap-2 whitespace-nowrap`}>
        <Icon />
        {config.label}
      </div>
    );
  };

  if (loading) return <div className="p-10 font-black text-gray-400 animate-pulse text-center">Loading your appointments...</div>;

  // Apply search filter
  const filteredAppointments = appointments.filter(a => {
    const matchesSearch = a.doctorName?.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          a.reason?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === 'all' || a.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  // Apply sorting
  const sortedAppointments = [...filteredAppointments].sort((a, b) => {
    if (sortBy === 'date-asc') {
      return new Date(`${a.appointmentDate}T${a.appointmentTime}`) - new Date(`${b.appointmentDate}T${b.appointmentTime}`);
    } else if (sortBy === 'date-desc') {
      return new Date(`${b.appointmentDate}T${b.appointmentTime}`) - new Date(`${a.appointmentDate}T${a.appointmentTime}`);
    } else if (sortBy === 'status') {
      return a.status.localeCompare(b.status);
    }
    return 0;
  });

  const upcoming = sortedAppointments.filter(a => 
    a.status === APPOINTMENT_STATUS.PENDING || 
    a.status === APPOINTMENT_STATUS.CONFIRMED
  );

  const past = sortedAppointments.filter(a => 
    a.status === APPOINTMENT_STATUS.COMPLETED || 
    a.status === APPOINTMENT_STATUS.CANCELLED
  );

  const upcomingPaginated = upcoming.slice(
    (currentUpcomingPage - 1) * itemsPerPage,
    currentUpcomingPage * itemsPerPage
  );
  const pastPaginated = past.slice(
    (currentPastPage - 1) * itemsPerPage,
    currentPastPage * itemsPerPage
  );
  const totalUpcomingPages = Math.ceil(upcoming.length / itemsPerPage);
  const totalPastPages = Math.ceil(past.length / itemsPerPage);

  const formatDateTime = (dateStr, timeStr) => {
    try {
      const dateObj = new Date(`${dateStr}T${timeStr}`);
      return dateObj.toLocaleDateString('en-MY', { 
        month: 'short', 
        day: 'numeric', 
        year: 'numeric', 
        hour: '2-digit', 
        minute: '2-digit' 
      });
    } catch (e) {
      return `${dateStr} ${timeStr}`;
    }
  };

  return (
    <div className="min-h-screen p-10 font-sans bg-gradient-to-br from-gray-50 to-gray-100">
      <div className="max-w-4xl mx-auto">
        <div className="animate-fade-in">
          <h2 className="text-3xl font-black text-gray-900 tracking-tight mb-8 flex items-center gap-3">
            <div className="p-2 bg-red-100 rounded-xl">
              <CalendarIcon />
            </div>
            My Appointments
          </h2>

          {/* SEARCH & FILTER CONTROLS */}
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 mb-8 hover:shadow-md transition-all duration-300 animate-slide-in">
            <div className="space-y-4">
              <div className="relative flex items-center">
                <div className="absolute left-4 text-gray-400 pointer-events-none">
                  <SearchIcon />
                </div>
                <input 
                  type="text" 
                  placeholder="Search by doctor name or reason..." 
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full bg-gray-50 border-2 border-gray-200 rounded-xl p-3 pl-12 text-gray-900 font-medium outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-all duration-200"
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-bold text-gray-400 uppercase tracking-wider block mb-2">Sort By</label>
                  <select 
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                    className="w-full bg-gray-50 border-2 border-gray-200 rounded-xl p-3 text-gray-900 font-medium outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-all text-sm"
                  >
                    <option value="date-asc">Date (Earliest First)</option>
                    <option value="date-desc">Date (Latest First)</option>
                    <option value="status">Status</option>
                  </select>
                </div>
                <div>
                  <label className="text-xs font-bold text-gray-400 uppercase tracking-wider block mb-2">Filter Status</label>
                  <select 
                    value={filterStatus}
                    onChange={(e) => setFilterStatus(e.target.value)}
                    className="w-full bg-gray-50 border-2 border-gray-200 rounded-xl p-3 text-gray-900 font-medium outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-all text-sm"
                  >
                    <option value="all">All Appointments</option>
                    <option value="Pending">Pending</option>
                    <option value="Confirmed">Confirmed</option>
                    <option value="Completed">Completed</option>
                    <option value="Cancelled">Cancelled</option>
                  </select>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="mb-12 animate-fade-in" style={{animationDelay: '0.2s'}}>
          <h3 className="text-xs font-black text-gray-400 uppercase tracking-widest mb-4 flex items-center gap-2">
            Upcoming Visits ({upcoming.length})
          </h3>
          
          {upcoming.length === 0 ? (
            <p className="bg-gradient-to-r from-gray-50 to-gray-100 text-gray-500 p-6 rounded-xl border border-gray-200 text-center font-bold">
              No upcoming appointments scheduled.
            </p>
          ) : (
            <>
              <div className="space-y-4 mb-6">
                {upcomingPaginated.map((appt, idx) => (
                  <div key={appt.appointmentId} className="bg-gradient-to-r from-white to-red-50 p-6 rounded-2xl shadow-sm border-l-4 border-red-600 flex justify-between items-start transition-all hover:shadow-lg hover:scale-105 gap-4 duration-300" style={{animationDelay: `${idx * 0.05}s`}}>
                    <div className="flex-1">
                      <div className="flex items-start gap-3">
                        <div className="p-2 bg-red-100 rounded-lg mt-1">
                          <UserIcon />
                        </div>
                        <div>
                          <p className="text-xl font-bold text-gray-900">{appt.reason || 'General Visit'}</p>
                          <p className="text-gray-500 font-medium text-sm mt-1 flex items-center gap-2">
                            <UserIcon className="w-3 h-3" />
                            {appt.doctorName || 'Doctor: Pending Assignment'}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 mt-3 text-red-600 font-bold text-sm">
                        <CalendarIcon />
                        {formatDateTime(appt.appointmentDate, appt.appointmentTime)}
                      </div>
                    </div>
                    
                    <div className="flex flex-col items-end gap-3">
                      <StatusBadge status={appt.status} />
                      <div className="flex gap-2">
                        <button
                          onClick={() => printAppointment(appt)}
                          className="border border-blue-100 text-blue-600 hover:bg-blue-50 hover:border-blue-200 px-4 py-2 rounded-xl text-xs font-bold transition-all duration-200 hover:scale-105 flex items-center gap-2"
                        >
                          <PrintIcon />
                          Print
                        </button>
                        <button
                          onClick={() => handleCancel(appt.appointmentId)}
                          disabled={cancelPending === appt.appointmentId}
                          className="border border-red-100 text-red-500 hover:bg-red-50 hover:border-red-200 px-4 py-2 rounded-xl text-xs font-bold transition-all duration-200 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
                        >
                          {cancelPending === appt.appointmentId ? 'Cancelling...' : 'Cancel'}
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {totalUpcomingPages > 1 && (
                <div className="flex justify-center gap-2">
                  <button
                    onClick={() => setCurrentUpcomingPage(Math.max(1, currentUpcomingPage - 1))}
                    disabled={currentUpcomingPage === 1}
                    className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg font-bold disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-200 transition-colors text-sm"
                  >
                    Previous
                  </button>
                  <span className="px-4 py-2 text-gray-600 font-bold text-sm">
                    Page {currentUpcomingPage} / {totalUpcomingPages}
                  </span>
                  <button
                    onClick={() => setCurrentUpcomingPage(Math.min(totalUpcomingPages, currentUpcomingPage + 1))}
                    disabled={currentUpcomingPage === totalUpcomingPages}
                    className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg font-bold disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-200 transition-colors text-sm"
                  >
                    Next
                  </button>
                </div>
              )}
            </>
          )}
        </div>

        <div className="animate-fade-in" style={{animationDelay: '0.4s'}}>
          <h3 className="text-xs font-black text-gray-400 uppercase tracking-widest mb-4">
            Past History ({past.length})
          </h3>
          
          {past.length === 0 ? (
            <p className="text-gray-400 text-sm font-semibold italic ml-2">No past visits on record.</p>
          ) : (
            <>
              <div className="space-y-4 mb-6">
                {pastPaginated.map((appt, idx) => (
                  <div key={appt.appointmentId} className="bg-white p-6 rounded-2xl border border-gray-100 flex justify-between items-start opacity-70 hover:opacity-100 transition-all duration-300 hover:shadow-md hover:scale-105 gap-4" style={{animationDelay: `${idx * 0.05}s`}}>
                    <div className="flex-1">
                      <p className="text-lg font-bold text-gray-800 line-through decoration-gray-300">{appt.reason || 'General Visit'}</p>
                      <p className="text-gray-500 font-medium text-sm mt-1 flex items-center gap-2">
                        <UserIcon className="w-3 h-3" />
                        {appt.doctorName || 'Doctor: Not Recorded'}
                      </p>
                      <p className="text-gray-400 font-bold mt-2 text-xs flex items-center gap-2">
                        <CalendarIcon />
                        {formatDateTime(appt.appointmentDate, appt.appointmentTime)}
                      </p>
                    </div>
                    <StatusBadge status={appt.status} />
                  </div>
                ))}
              </div>

              {totalPastPages > 1 && (
                <div className="flex justify-center gap-2">
                  <button
                    onClick={() => setCurrentPastPage(Math.max(1, currentPastPage - 1))}
                    disabled={currentPastPage === 1}
                    className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg font-bold disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-200 transition-colors text-sm"
                  >
                    Previous
                  </button>
                  <span className="px-4 py-2 text-gray-600 font-bold text-sm">
                    Page {currentPastPage} / {totalPastPages}
                  </span>
                  <button
                    onClick={() => setCurrentPastPage(Math.min(totalPastPages, currentPastPage + 1))}
                    disabled={currentPastPage === totalPastPages}
                    className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg font-bold disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-200 transition-colors text-sm"
                  >
                    Next
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}