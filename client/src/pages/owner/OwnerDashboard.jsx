import React, { useState, useEffect } from 'react';
import Navbar from '../../components/Navbar';
import RatingStars from '../../components/RatingStars';
import DataTable from '../../components/DataTable';
import api from '../../services/api';
import { Store, Star, Users, MessageSquare, AlertCircle } from 'lucide-react';

export default function OwnerDashboard() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchOwnerDashboard = async () => {
    try {
      setLoading(true);
      setError('');
      const res = await api.get('/stores/owner/dashboard');
      setData(res.data);
    } catch (err) {
      console.error('Failed to load owner dashboard:', err);
      setError(err.response?.data?.message || 'Failed to load store owner dashboard.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOwnerDashboard();
  }, []);

  const raterColumns = [
    {
      key: 'user_name',
      label: 'Customer Name',
      sortable: true,
      render: (val, row) => (
        <div>
          <span className="font-semibold text-slate-800">{val}</span>
          <div className="text-xs text-slate-400">{row.user_address}</div>
        </div>
      )
    },
    {
      key: 'user_email',
      label: 'Email',
      sortable: true,
      render: (val) => <span className="text-slate-600 font-mono text-xs">{val}</span>
    },
    {
      key: 'rating',
      label: 'Submitted Rating',
      sortable: true,
      render: (val) => (
        <div className="flex items-center space-x-2">
          <RatingStars rating={val} size={15} />
          <span className="font-bold text-slate-700 text-xs">({val}/5)</span>
        </div>
      )
    },
    {
      key: 'created_at',
      label: 'Date Submitted',
      sortable: true,
      render: (val) => (
        <span className="text-xs text-slate-500">
          {val ? new Date(val).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }) : '—'}
        </span>
      )
    }
  ];

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <Navbar />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {loading ? (
          <div className="py-24 text-center">
            <div className="inline-block w-8 h-8 border-4 border-amber-500 border-t-transparent rounded-full animate-spin"></div>
            <p className="mt-3 text-sm text-slate-500 font-medium">Loading store dashboard...</p>
          </div>
        ) : error ? (
          <div className="bg-amber-50 border border-amber-200 rounded-2xl p-8 text-center max-w-xl mx-auto my-12">
            <AlertCircle size={36} className="mx-auto text-amber-600 mb-3" />
            <h3 className="text-base font-semibold text-amber-900">Store Association Notice</h3>
            <p className="text-sm text-amber-700 mt-2">{error}</p>
          </div>
        ) : data && (
          <div className="space-y-8">
            {/* Header / Store Overview Card */}
            <div className="bg-gradient-to-r from-amber-600 via-amber-700 to-amber-900 rounded-3xl p-6 sm:p-8 text-white shadow-xl shadow-amber-900/10">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div>
                  <span className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-white/15 text-amber-100 backdrop-blur-xs mb-3">
                    <Store size={14} />
                    <span>Store Owner Management Console</span>
                  </span>
                  <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
                    {data.store.name}
                  </h1>
                  <p className="mt-1.5 text-amber-100 text-sm max-w-xl">
                    {data.store.address}
                  </p>
                  <p className="mt-0.5 text-xs text-amber-200 font-mono">
                    {data.store.email}
                  </p>
                </div>

                {/* Score Stats Badge */}
                <div className="bg-white/10 backdrop-blur-md rounded-2xl p-5 border border-white/20 flex items-center space-x-6">
                  <div className="text-center">
                    <div className="text-xs uppercase font-semibold tracking-wider text-amber-200">
                      Average Rating
                    </div>
                    <div className="flex items-center justify-center space-x-2 mt-1">
                      <span className="text-3xl font-black">{data.store.averageRating || '0.0'}</span>
                      <Star size={24} className="text-amber-300 fill-amber-300" />
                    </div>
                    <div className="mt-1">
                      <RatingStars rating={data.store.averageRating || 0} size={15} />
                    </div>
                  </div>

                  <div className="h-12 w-px bg-white/20"></div>

                  <div className="text-center">
                    <div className="text-xs uppercase font-semibold tracking-wider text-amber-200">
                      Total Reviews
                    </div>
                    <div className="text-3xl font-black mt-1">{data.store.totalRatings}</div>
                    <div className="text-xs text-amber-200 mt-1 flex items-center justify-center space-x-1">
                      <Users size={12} />
                      <span>verified customers</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* List of Users Who Submitted Ratings */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-lg font-bold text-slate-900 tracking-tight flex items-center space-x-2">
                    <MessageSquare size={20} className="text-amber-600" />
                    <span>Customer Ratings & Review History</span>
                  </h2>
                  <p className="text-xs text-slate-500 mt-0.5">
                    View individual users who have submitted ratings for {data.store.name}.
                  </p>
                </div>
                <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-slate-100 text-slate-700 border border-slate-200">
                  {data.raters.length} Reviews
                </span>
              </div>

              <DataTable
                columns={raterColumns}
                data={data.raters}
                searchPlaceholder="Search reviewers by Name, Email, or Address..."
                emptyMessage="No customer ratings submitted for this store yet."
              />
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
