import React from 'react';
import { X, User, Star, MapPin, Mail, Shield, Calendar, Store } from 'lucide-react';
import RatingStars from '../../components/RatingStars';

export default function UserDetailsModal({ user, onClose }) {
  if (!user) return null;

  const isStoreOwner = user.role === 'STORE_OWNER';

  const roleBadgeColor = {
    ADMIN: 'bg-rose-100 text-rose-800 border-rose-200',
    STORE_OWNER: 'bg-amber-100 text-amber-800 border-amber-200',
    USER: 'bg-emerald-100 text-emerald-800 border-emerald-200'
  };

  const roleName = {
    ADMIN: 'System Administrator',
    STORE_OWNER: 'Store Owner',
    USER: 'Normal User'
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl border border-slate-200 w-full max-w-md overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50">
          <div className="flex items-center space-x-2">
            <User size={20} className="text-emerald-600" />
            <h3 className="font-semibold text-slate-800">User Account Details</h3>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 p-1 rounded-lg hover:bg-slate-200/50 transition"
          >
            <X size={18} />
          </button>
        </div>

        <div className="p-6 space-y-4">
          {/* Header User Identity */}
          <div className="flex items-start justify-between">
            <div>
              <h4 className="text-lg font-bold text-slate-900">{user.name}</h4>
              <span
                className={`inline-block text-xs font-semibold px-2.5 py-0.5 rounded-full border mt-1.5 ${
                  roleBadgeColor[user.role] || 'bg-slate-100'
                }`}
              >
                {roleName[user.role] || user.role}
              </span>
            </div>
            <div className="w-12 h-12 rounded-2xl bg-slate-100 text-slate-700 flex items-center justify-center font-bold text-lg">
              {user.name.charAt(0)}
            </div>
          </div>

          <div className="divide-y divide-slate-100 border-t border-b border-slate-100 py-2 space-y-2.5 text-sm">
            <div className="flex items-center space-x-3 pt-2">
              <Mail size={16} className="text-slate-400 shrink-0" />
              <div>
                <div className="text-[11px] font-semibold uppercase text-slate-400">Email</div>
                <div className="text-slate-700 font-mono text-xs">{user.email}</div>
              </div>
            </div>

            <div className="flex items-start space-x-3 pt-2">
              <MapPin size={16} className="text-slate-400 shrink-0 mt-0.5" />
              <div>
                <div className="text-[11px] font-semibold uppercase text-slate-400">Address</div>
                <div className="text-slate-700 text-xs leading-relaxed">{user.address}</div>
              </div>
            </div>

            <div className="flex items-center space-x-3 pt-2">
              <Calendar size={16} className="text-slate-400 shrink-0" />
              <div>
                <div className="text-[11px] font-semibold uppercase text-slate-400">Member Since</div>
                <div className="text-slate-700 text-xs">
                  {user.created_at ? new Date(user.created_at).toLocaleDateString() : 'N/A'}
                </div>
              </div>
            </div>
          </div>

          {/* If the user is a Store Owner, their Rating should also be displayed */}
          {isStoreOwner && (
            <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
              <div className="flex items-center space-x-2 text-amber-900 font-semibold text-xs uppercase tracking-wider mb-2">
                <Store size={16} className="text-amber-700" />
                <span>Store Owner Performance & Rating</span>
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-xs text-amber-800 font-medium">
                    {user.store_name || 'Associated Store'}
                  </div>
                  <div className="text-[11px] text-amber-700">
                    {user.store_rating_count ? `${user.store_rating_count} total review(s)` : 'No ratings yet'}
                  </div>
                </div>
                <div className="text-right">
                  <div className="flex items-center space-x-1.5 justify-end">
                    <span className="text-base font-bold text-amber-950">
                      {user.store_rating ? Number(user.store_rating).toFixed(1) : 'N/A'}
                    </span>
                    <Star size={16} className="text-amber-500 fill-amber-500" />
                  </div>
                  {user.store_rating && (
                    <div className="mt-0.5">
                      <RatingStars rating={Number(user.store_rating)} size={12} />
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          <div className="pt-2 flex justify-end">
            <button
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition"
            >
              Close Details
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
