'use client';
import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';

const ROLE_STYLES = {
  Patient: 'bg-blue-50 text-blue-700',
  Doctor:  'bg-green-50 text-green-700',
};

export default function AdminUsersPage() {
  const [users, setUsers]       = useState([]);
  const [loading, setLoading]   = useState(true);
  const [error, setError]       = useState(null);
  const [search, setSearch]     = useState('');
  const [roleFilter, setRole]   = useState('All');
  const [selected, setSelected] = useState(null);
  const [deleting, setDeleting] = useState(null);
  const [confirmId, setConfirmId] = useState(null);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const token = localStorage.getItem('token');
        const res = await fetch('http://localhost:5230/api/admin/users', {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (res.ok) {
          setUsers(await res.json());
        } else {
          const err = await res.json().catch(() => ({ message: `HTTP ${res.status}` }));
          setError(err.message || `HTTP ${res.status}`);
        }
      } catch {
        setError('Backend is offline. Run dotnet run in the backend/ folder.');
      } finally {
        setLoading(false);
      }
    };
    fetchUsers();
  }, []);

  const deleteUser = async (id) => {
    setDeleting(id);
    setConfirmId(null);
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`http://localhost:5230/api/admin/users/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        setUsers(prev => prev.filter(u => u.userId !== id));
        if (selected?.userId === id) setSelected(null);
      }
    } finally {
      setDeleting(null);
    }
  };

  const filtered = users.filter(u => {
    const matchesRole = roleFilter === 'All' || u.role === roleFilter;
    const q = search.toLowerCase();
    const matchesSearch = !q ||
      u.fullName?.toLowerCase().includes(q) ||
      u.email?.toLowerCase().includes(q) ||
      u.phone?.includes(q);
    return matchesRole && matchesSearch;
  });

  const counts = {
    All:     users.length,
    Patient: users.filter(u => u.role === 'Patient').length,
    Doctor:  users.filter(u => u.role === 'Doctor').length,
  };

  if (loading) return <div className="text-red-600 font-bold">Loading users...</div>;
  if (error) return (
    <div className="bg-red-50 border border-red-200 rounded-2xl p-6 text-sm text-red-700">
      <p className="font-bold mb-1">Failed to load users.</p>
      <p>{error}</p>
    </div>
  );

  return (
    <div className="max-w-7xl mx-auto">

      {/* HEADER */}
      <header className="mb-6">
        <h2 className="text-2xl sm:text-4xl font-bold text-gray-800 tracking-tight">Users</h2>
        <p className="text-gray-500 mt-1 text-sm">All registered patients and doctors.</p>
      </header>

      {/* FILTER + SEARCH */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
        <div className="flex gap-2">
          {['All', 'Patient', 'Doctor'].map(r => (
            <button
              key={r}
              onClick={() => setRole(r)}
              className={`px-4 py-2 rounded-xl text-sm font-bold transition-all ${
                roleFilter === r
                  ? 'bg-red-600 text-white shadow-sm'
                  : 'bg-white text-gray-500 border border-gray-200 hover:border-red-300 hover:text-red-600'
              }`}
            >
              {r} <span className={`ml-1 px-1.5 py-0.5 rounded-full text-xs ${roleFilter === r ? 'bg-red-500' : 'bg-gray-100 text-gray-500'}`}>{counts[r]}</span>
            </button>
          ))}
        </div>
        <input
          type="text"
          placeholder="Search by name, email or phone..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="w-full sm:w-80 border border-gray-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-red-400 transition-colors"
        />
      </div>

      {/* TABLE — desktop */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100">
        <div className="hidden md:block overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 text-gray-400 uppercase text-xs font-bold tracking-wider">
              <tr>
                <th className="px-6 py-3 text-left">Name</th>
                <th className="px-6 py-3 text-left">Role</th>
                <th className="px-6 py-3 text-left">Email</th>
                <th className="px-6 py-3 text-left">Phone</th>
                <th className="px-6 py-3 text-left">Joined</th>
                <th className="px-6 py-3 text-left">Appointments</th>
                <th className="px-6 py-3 text-left">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-10 text-center text-gray-400 italic">No users found.</td>
                </tr>
              ) : (
                filtered.map(u => (
                  <tr key={u.userId} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 font-semibold text-gray-800">{u.fullName}</td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-1 rounded-full text-xs font-bold ${ROLE_STYLES[u.role] ?? 'bg-gray-100 text-gray-600'}`}>
                        {u.role}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-gray-600">{u.email}</td>
                    <td className="px-6 py-4 text-gray-500">{u.phone || '—'}</td>
                    <td className="px-6 py-4 text-gray-500">{u.joinedAt}</td>
                    <td className="px-6 py-4">
                      <span className="bg-red-50 text-red-600 px-2 py-1 rounded-full text-xs font-bold">
                        {u.totalAppointments}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex gap-2">
                        <button
                          onClick={() => setSelected(u)}
                          className="px-3 py-1.5 bg-gray-50 hover:bg-gray-100 text-gray-600 border border-gray-200 rounded-lg text-xs font-bold transition-all"
                        >
                          View
                        </button>
                        <button
                          onClick={() => setConfirmId(u.userId)}
                          disabled={deleting === u.userId}
                          className="px-3 py-1.5 bg-red-50 hover:bg-red-100 text-red-600 border border-red-100 rounded-lg text-xs font-bold transition-all disabled:opacity-50"
                        >
                          {deleting === u.userId ? '...' : 'Remove'}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* CARDS — mobile */}
        <div className="md:hidden divide-y divide-gray-100">
          {filtered.length === 0 ? (
            <p className="px-4 py-10 text-center text-gray-400 italic text-sm">No users found.</p>
          ) : (
            filtered.map(u => (
              <div key={u.userId} className="p-4 space-y-1">
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-gray-800 text-sm">{u.fullName}</span>
                  <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${ROLE_STYLES[u.role] ?? 'bg-gray-100 text-gray-600'}`}>
                    {u.role}
                  </span>
                </div>
                <p className="text-xs text-gray-500">{u.email}</p>
                <p className="text-xs text-gray-500">{u.phone || 'No phone'} · Joined {u.joinedAt}</p>
                <div className="flex gap-2 pt-1">
                  <button
                    onClick={() => setSelected(u)}
                    className="px-3 py-1 bg-gray-50 hover:bg-gray-100 text-gray-600 border border-gray-200 rounded-lg text-xs font-bold transition-all"
                  >
                    View
                  </button>
                  <button
                    onClick={() => setConfirmId(u.userId)}
                    disabled={deleting === u.userId}
                    className="px-3 py-1 bg-red-50 hover:bg-red-100 text-red-600 border border-red-100 rounded-lg text-xs font-bold transition-all disabled:opacity-50"
                  >
                    {deleting === u.userId ? '...' : 'Remove'}
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* DETAIL MODAL */}
      {selected && <UserModal user={selected} onClose={() => setSelected(null)} />}

      {/* CONFIRM DELETE MODAL */}
      {confirmId && (
        <ConfirmModal
          user={users.find(u => u.userId === confirmId)}
          onConfirm={() => deleteUser(confirmId)}
          onCancel={() => setConfirmId(null)}
        />
      )}
    </div>
  );
}

function UserModal({ user, onClose }) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  if (!mounted) return null;

  return createPortal(
    <div
      style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.4)', zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' }}
      onClick={onClose}
    >
      <div
        className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6 space-y-4"
        style={{ position: 'relative', zIndex: 10000 }}
        onClick={e => e.stopPropagation()}
      >
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-bold text-gray-800">User Details</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-xl font-bold">✕</button>
        </div>
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-full bg-red-100 flex items-center justify-center text-red-600 text-xl font-black">
            {user.fullName?.[0]?.toUpperCase()}
          </div>
          <div>
            <p className="font-bold text-gray-800 text-lg">{user.fullName}</p>
            <p className="text-sm text-gray-500">{user.email}</p>
          </div>
        </div>
        <hr className="border-gray-100" />
        <div className="space-y-3 text-sm">
          <DetailRow label="Role"         value={user.role} />
          <DetailRow label="Phone"        value={user.phone || 'Not provided'} />
          <DetailRow label="Address"      value={user.address || 'Not provided'} />
          <DetailRow label="Joined"       value={user.joinedAt} />
          <DetailRow label="Appointments" value={`${user.totalAppointments}`} />
        </div>
      </div>
    </div>,
    document.getElementById('modal-root')
  );
}

function ConfirmModal({ user, onConfirm, onCancel }) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  if (!mounted) return null;

  return createPortal(
    <div
      style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.4)', zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' }}
      onClick={onCancel}
    >
      <div
        className="bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6 space-y-4"
        style={{ position: 'relative', zIndex: 10000 }}
        onClick={e => e.stopPropagation()}
      >
        <h3 className="text-lg font-bold text-gray-800">Remove User</h3>
        <p className="text-sm text-gray-600">
          Are you sure you want to remove <span className="font-bold text-gray-800">{user?.fullName}</span>? This cannot be undone.
        </p>
        <div className="flex gap-3 pt-2">
          <button
            onClick={onCancel}
            className="flex-1 px-4 py-2 border border-gray-200 rounded-xl text-sm font-bold text-gray-600 hover:bg-gray-50 transition-all"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className="flex-1 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-xl text-sm font-bold transition-all"
          >
            Remove
          </button>
        </div>
      </div>
    </div>,
    document.getElementById('modal-root')
  );
}

function DetailRow({ label, value }) {
  return (
    <div className="flex justify-between gap-4">
      <span className="text-gray-400 font-semibold shrink-0">{label}</span>
      <span className="text-gray-700 text-right">{value}</span>
    </div>
  );
}
