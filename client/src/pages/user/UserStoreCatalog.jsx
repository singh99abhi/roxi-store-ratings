import React, { useState, useEffect } from 'react';
import Navbar from '../../components/Navbar';
import RatingStars from '../../components/RatingStars';
import RatingModal from '../../components/RatingModal';
import api from '../../services/api';
import { Search, Store, Star, Edit3, Plus, ArrowUpDown, ArrowUp, ArrowDown } from 'lucide-react';

export default function UserStoreCatalog() {
  const [stores, setStores] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [sortBy, setSortBy] = useState('name');
  const [sortOrder, setSortOrder] = useState('asc');
  const [selectedStoreForRating, setSelectedStoreForRating] = useState(null);

  const fetchStores = async () => {
    try {
      setLoading(true);
      const res = await api.get('/stores', {
        params: {
          search,
          sortBy,
          sortOrder
        }
      });
      setStores(res.data.stores);
    } catch (err) {
      console.error('Failed to load stores:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStores();
  }, [search, sortBy, sortOrder]);

  const handleRatingSaved = ({ storeId, newRating, overallRating, totalRatings }) => {
    setStores((prevStores) =>
      prevStores.map((s) => {
        if (s.id === storeId) {
          return {
            ...s,
            user_submitted_rating: newRating,
            overall_rating: overallRating,
            total_ratings: totalRatings
          };
        }
        return s;
      })
    );
  };

  const toggleSort = (col) => {
    if (sortBy === col) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(col);
      setSortOrder('asc');
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <Navbar />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header Banner */}
        <div className="bg-gradient-to-r from-emerald-700 via-teal-700 to-emerald-900 rounded-3xl p-6 sm:p-8 text-white shadow-xl shadow-emerald-900/10 mb-8">
          <div className="max-w-2xl">
            <span className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-white/15 text-emerald-100 backdrop-blur-xs mb-3">
              <Store size={14} />
              <span>Registered Stores Directory</span>
            </span>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              Browse Stores & Share Your Ratings
            </h1>
            <p className="mt-2 text-emerald-100 text-sm leading-relaxed">
              Find local registered businesses, view community reviews, and submit or update your ratings between 1 and 5 stars.
            </p>
          </div>
        </div>

        {/* Search & Sort Controls */}
        <div className="bg-white rounded-2xl p-4 sm:p-5 shadow-sm border border-slate-200 mb-6 flex flex-col md:flex-row gap-4 items-center justify-between">
          <div className="relative w-full md:w-96">
            <Search size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search stores by Name or Address..."
              className="w-full pl-10 pr-4 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition"
            />
          </div>

          <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Sort by:
            </span>
            <button
              onClick={() => toggleSort('name')}
              className={`px-3 py-1.5 text-xs font-medium rounded-lg border flex items-center space-x-1 transition ${
                sortBy === 'name'
                  ? 'bg-emerald-50 border-emerald-300 text-emerald-800 font-semibold'
                  : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
              }`}
            >
              <span>Store Name</span>
              {sortBy === 'name' && (
                sortOrder === 'asc' ? <ArrowUp size={13} /> : <ArrowDown size={13} />
              )}
            </button>
            <button
              onClick={() => toggleSort('address')}
              className={`px-3 py-1.5 text-xs font-medium rounded-lg border flex items-center space-x-1 transition ${
                sortBy === 'address'
                  ? 'bg-emerald-50 border-emerald-300 text-emerald-800 font-semibold'
                  : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
              }`}
            >
              <span>Address</span>
              {sortBy === 'address' && (
                sortOrder === 'asc' ? <ArrowUp size={13} /> : <ArrowDown size={13} />
              )}
            </button>
            <button
              onClick={() => toggleSort('rating')}
              className={`px-3 py-1.5 text-xs font-medium rounded-lg border flex items-center space-x-1 transition ${
                sortBy === 'rating'
                  ? 'bg-emerald-50 border-emerald-300 text-emerald-800 font-semibold'
                  : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
              }`}
            >
              <span>Overall Rating</span>
              {sortBy === 'rating' && (
                sortOrder === 'asc' ? <ArrowUp size={13} /> : <ArrowDown size={13} />
              )}
            </button>
          </div>
        </div>

        {/* Stores Grid / Listing */}
        {loading ? (
          <div className="py-20 text-center">
            <div className="inline-block w-8 h-8 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin"></div>
            <p className="mt-3 text-sm text-slate-500 font-medium">Loading store listings...</p>
          </div>
        ) : stores.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {stores.map((store) => {
              const hasRated = store.user_submitted_rating !== null && store.user_submitted_rating !== undefined;
              const overallScore = store.overall_rating ? Number(store.overall_rating).toFixed(1) : 'No ratings yet';

              return (
                <div
                  key={store.id}
                  className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200 hover:shadow-md hover:border-emerald-200 transition flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-start justify-between">
                      <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center font-bold text-base mb-3">
                        <Store size={20} />
                      </div>
                      <div className="flex items-center space-x-1 bg-amber-50 text-amber-800 border border-amber-200 px-2.5 py-1 rounded-full text-xs font-semibold">
                        <Star size={13} className="text-amber-500 fill-amber-500" />
                        <span>{overallScore}</span>
                        {store.total_ratings > 0 && (
                          <span className="text-slate-400 font-normal">({store.total_ratings})</span>
                        )}
                      </div>
                    </div>

                    <h3 className="text-lg font-bold text-slate-900 tracking-tight leading-snug">
                      {store.name}
                    </h3>
                    <p className="mt-1.5 text-xs text-slate-500 line-clamp-2 leading-relaxed">
                      {store.address}
                    </p>
                    <p className="mt-1 text-xs text-slate-400">{store.email}</p>

                    <div className="mt-4 pt-4 border-t border-slate-100 flex items-center justify-between">
                      <div>
                        <div className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">
                          Overall Rating
                        </div>
                        <div className="mt-0.5">
                          <RatingStars rating={Number(store.overall_rating) || 0} size={15} />
                        </div>
                      </div>

                      <div className="text-right">
                        <div className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">
                          Your Rating
                        </div>
                        {hasRated ? (
                          <div className="mt-0.5 flex items-center space-x-1 justify-end">
                            <span className="text-xs font-bold text-emerald-700">
                              {store.user_submitted_rating} / 5
                            </span>
                            <RatingStars rating={store.user_submitted_rating} size={13} />
                          </div>
                        ) : (
                          <span className="text-xs text-slate-400 italic">Not rated</span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Rating Action Button */}
                  <div className="mt-5 pt-3">
                    <button
                      onClick={() => setSelectedStoreForRating(store)}
                      className={`w-full py-2.5 px-4 rounded-xl text-xs font-semibold flex items-center justify-center space-x-1.5 transition ${
                        hasRated
                          ? 'bg-slate-100 hover:bg-slate-200 text-slate-800'
                          : 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm'
                      }`}
                    >
                      {hasRated ? (
                        <>
                          <Edit3 size={14} />
                          <span>Modify Your Rating</span>
                        </>
                      ) : (
                        <>
                          <Plus size={14} />
                          <span>Submit a Rating</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="bg-white rounded-2xl p-12 text-center border border-slate-200">
            <Store size={40} className="mx-auto text-slate-300 mb-3" />
            <h3 className="text-base font-semibold text-slate-700">No stores found</h3>
            <p className="text-xs text-slate-400 mt-1">
              Try adjusting your search criteria or clear the search input.
            </p>
          </div>
        )}
      </main>

      {/* Rating Modal */}
      {selectedStoreForRating && (
        <RatingModal
          store={selectedStoreForRating}
          existingRating={selectedStoreForRating.user_submitted_rating}
          onClose={() => setSelectedStoreForRating(null)}
          onRatingSaved={handleRatingSaved}
        />
      )}
    </div>
  );
}
