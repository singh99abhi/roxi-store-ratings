import React, { useState } from 'react';
import { X, Star, AlertCircle } from 'lucide-react';
import RatingStars from './RatingStars';
import api from '../services/api';

export default function RatingModal({ store, existingRating, onClose, onRatingSaved }) {
  const [selectedRating, setSelectedRating] = useState(existingRating || 5);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const isEditing = Boolean(existingRating);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedRating || selectedRating < 1 || selectedRating > 5) {
      setError('Please select a star rating between 1 and 5.');
      return;
    }

    setLoading(true);
    setError('');
    try {
      const res = await api.post('/ratings', {
        storeId: store.id,
        rating: selectedRating
      });
      onRatingSaved({
        storeId: store.id,
        newRating: selectedRating,
        overallRating: res.data.overallRating,
        totalRatings: res.data.totalRatings
      });
      onClose();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to submit rating. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const ratingDescriptions = {
    1: '1 Star — Poor experience',
    2: '2 Stars — Fair, needs improvement',
    3: '3 Stars — Average quality',
    4: '4 Stars — Very good store',
    5: '5 Stars — Excellent store & service!'
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl border border-slate-200 w-full max-w-md overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50">
          <div>
            <h3 className="font-semibold text-slate-800">
              {isEditing ? 'Modify Your Store Rating' : 'Submit Store Rating'}
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">{store.name}</p>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 p-1 rounded-lg hover:bg-slate-200/50 transition"
          >
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {error && (
            <div className="p-3 rounded-lg bg-rose-50 border border-rose-200 text-rose-700 text-sm flex items-start space-x-2">
              <AlertCircle size={18} className="shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          <div className="bg-slate-50 border border-slate-200 rounded-xl p-3.5 text-xs text-slate-600 space-y-1">
            <div className="font-semibold text-slate-800">{store.name}</div>
            <div>{store.address}</div>
          </div>

          <div className="text-center py-3">
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-2">
              Click Stars to Rate (1 to 5)
            </label>
            <div className="flex justify-center my-2">
              <RatingStars
                rating={selectedRating}
                interactive={true}
                size={34}
                onChange={(newVal) => setSelectedRating(newVal)}
              />
            </div>
            <div className="text-sm font-semibold text-emerald-700 mt-2">
              {ratingDescriptions[selectedRating]}
            </div>
          </div>

          <div className="pt-2 flex items-center justify-end space-x-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-slate-600 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-5 py-2 text-sm font-medium text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg shadow-sm disabled:opacity-50 transition"
            >
              {loading ? 'Saving...' : isEditing ? 'Update Rating' : 'Submit Rating'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
