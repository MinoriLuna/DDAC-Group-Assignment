'use client';
import { useEffect, useState } from 'react';

const SENTIMENT_CONFIG = {
  POSITIVE:  { label: 'Positive',  bg: 'bg-green-50',  text: 'text-green-700',  dot: 'bg-green-500' },
  NEGATIVE:  { label: 'Negative',  bg: 'bg-red-50',    text: 'text-red-700',    dot: 'bg-red-500'   },
  NEUTRAL:   { label: 'Neutral',   bg: 'bg-gray-100',  text: 'text-gray-600',   dot: 'bg-gray-400'  },
  MIXED:     { label: 'Mixed',     bg: 'bg-yellow-50', text: 'text-yellow-700', dot: 'bg-yellow-500' },
};

function SentimentBadge({ sentiment }) {
  const cfg = SENTIMENT_CONFIG[sentiment] ?? SENTIMENT_CONFIG.NEUTRAL;
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold ${cfg.bg} ${cfg.text}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${cfg.dot}`} />
      {cfg.label}
    </span>
  );
}

function Stars({ rating }) {
  return (
    <span className="text-yellow-400 text-sm tracking-tight">
      {'★'.repeat(rating)}{'☆'.repeat(5 - rating)}
    </span>
  );
}

export default function AdminFeedbackPage() {
  const [reviews, setReviews]   = useState([]);
  const [loading, setLoading]   = useState(true);
  const [error, setError]       = useState(null);
  const [filter, setFilter]     = useState('ALL');
  const [search, setSearch]     = useState('');

  useEffect(() => {
    const fetchFeedback = async () => {
      try {
        const token = localStorage.getItem('token');
        const res = await fetch('http://localhost:5230/api/admin/feedback', {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (res.ok) {
          setReviews(await res.json());
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
    fetchFeedback();
  }, []);

  const filtered = reviews.filter(r => {
    const matchesSentiment = filter === 'ALL' || r.sentiment === filter;
    const q = search.toLowerCase();
    const matchesSearch = !q ||
      r.patientName?.toLowerCase().includes(q) ||
      r.doctorName?.toLowerCase().includes(q) ||
      r.comment?.toLowerCase().includes(q);
    return matchesSentiment && matchesSearch;
  });

  // Summary counts
  const counts = reviews.reduce((acc, r) => {
    acc[r.sentiment] = (acc[r.sentiment] ?? 0) + 1;
    return acc;
  }, {});

  const avgRating = reviews.length
    ? (reviews.reduce((s, r) => s + r.rating, 0) / reviews.length).toFixed(1)
    : '—';

  if (loading) return <div className="text-red-600 font-bold">Analysing feedback with Amazon Comprehend...</div>;
  if (error) return (
    <div className="bg-red-50 border border-red-200 rounded-2xl p-6 text-sm text-red-700">
      <p className="font-bold mb-1">Failed to load feedback.</p>
      <p>{error}</p>
    </div>
  );

  const FILTER_TABS = ['ALL', 'POSITIVE', 'NEUTRAL', 'MIXED', 'NEGATIVE'];

  return (
    <div className="max-w-7xl mx-auto">

      {/* HEADER */}
      <header className="mb-6">
        <h2 className="text-2xl sm:text-4xl font-bold text-gray-800 tracking-tight">Patient Feedback</h2>
        <p className="text-gray-500 mt-1 text-sm">
          Sentiment analysis powered by <span className="font-semibold text-orange-500">Amazon Comprehend</span>
        </p>
      </header>

      {/* SUMMARY CARDS */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
        <SummaryCard label="Avg Rating"  value={`${avgRating} / 5`}         color="text-yellow-500" />
        <SummaryCard label="Positive"    value={counts.POSITIVE ?? 0}        color="text-green-600"  />
        <SummaryCard label="Negative"    value={counts.NEGATIVE ?? 0}        color="text-red-600"    />
        <SummaryCard label="Total"       value={reviews.length}              color="text-gray-700"   />
      </div>

      {/* FILTER + SEARCH */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
        {/* sentiment tabs */}
        <div className="flex gap-1 flex-wrap">
          {FILTER_TABS.map(tab => (
            <button
              key={tab}
              onClick={() => setFilter(tab)}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all
                ${filter === tab
                  ? 'bg-red-600 text-white shadow-sm'
                  : 'bg-gray-100 text-gray-500 hover:bg-gray-200'}`}
            >
              {tab === 'ALL' ? `All (${reviews.length})` : `${tab[0]}${tab.slice(1).toLowerCase()} (${counts[tab] ?? 0})`}
            </button>
          ))}
        </div>
        <input
          type="text"
          placeholder="Search patient, doctor, or comment..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="w-full sm:w-72 border border-gray-200 rounded-xl px-4 py-2 text-sm outline-none focus:border-red-400 transition-colors"
        />
      </div>

      {/* TABLE — desktop */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100">
        <div className="hidden md:block overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 text-gray-400 uppercase text-xs font-bold tracking-wider">
              <tr>
                <th className="px-6 py-3 text-left">Patient</th>
                <th className="px-6 py-3 text-left">Doctor</th>
                <th className="px-6 py-3 text-left">Rating</th>
                <th className="px-6 py-3 text-left">Comment</th>
                <th className="px-6 py-3 text-left">Sentiment</th>
                <th className="px-6 py-3 text-left">Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-10 text-center text-gray-400 italic">
                    No reviews found.
                  </td>
                </tr>
              ) : (
                filtered.map(r => (
                  <tr key={r.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 font-semibold text-gray-800">{r.patientName}</td>
                    <td className="px-6 py-4 text-gray-600">{r.doctorName}</td>
                    <td className="px-6 py-4"><Stars rating={r.rating} /></td>
                    <td className="px-6 py-4 text-gray-500 max-w-xs truncate" title={r.comment}>
                      {r.comment || <span className="italic text-gray-300">No comment</span>}
                    </td>
                    <td className="px-6 py-4"><SentimentBadge sentiment={r.sentiment} /></td>
                    <td className="px-6 py-4 text-gray-400 text-xs">{r.createdAt}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* CARDS — mobile */}
        <div className="md:hidden divide-y divide-gray-100">
          {filtered.length === 0 ? (
            <p className="px-4 py-10 text-center text-gray-400 italic text-sm">No reviews found.</p>
          ) : (
            filtered.map(r => (
              <div key={r.id} className="p-4 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-gray-800 text-sm">{r.patientName}</span>
                  <SentimentBadge sentiment={r.sentiment} />
                </div>
                <p className="text-xs text-gray-500">Doctor: {r.doctorName}</p>
                <Stars rating={r.rating} />
                {r.comment && (
                  <p className="text-sm text-gray-600 leading-relaxed">{r.comment}</p>
                )}
                <p className="text-xs text-gray-400">{r.createdAt}</p>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}

function SummaryCard({ label, value, color }) {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4">
      <p className="text-xs text-gray-400 font-semibold uppercase tracking-wide mb-1">{label}</p>
      <p className={`text-2xl font-black ${color}`}>{value}</p>
    </div>
  );
}
