import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Store, LogOut, KeyRound, User } from 'lucide-react';
import ChangePasswordModal from './ChangePasswordModal';

export default function Navbar() {
  const { user, logout } = useAuth();
  const [showPasswordModal, setShowPasswordModal] = useState(false);

  const roleBadgeColor = {
    ADMIN: 'bg-rose-100 text-rose-800 border-rose-200',
    STORE_OWNER: 'bg-amber-100 text-amber-800 border-amber-200',
    USER: 'bg-emerald-100 text-emerald-800 border-emerald-200'
  };

  const roleDisplay = {
    ADMIN: 'System Administrator',
    STORE_OWNER: 'Store Owner',
    USER: 'Normal User'
  };

  return (
    <>
      <header className="bg-white border-b border-slate-200 sticky top-0 z-40 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          {/* Logo & Brand */}
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-500 flex items-center justify-center text-white shadow-md shadow-emerald-500/20">
              <Store size={22} />
            </div>
            <div>
              <span className="font-bold text-lg tracking-tight text-slate-900">
                Store<span className="text-emerald-600">Hub</span>
              </span>
              <span className="block text-xs text-slate-400 font-medium">Ratings & Store Platform</span>
            </div>
          </div>

          {/* User Controls */}
          {user && (
            <div className="flex items-center space-x-3 sm:space-x-4">
              <div className="hidden sm:flex flex-col items-end">
                <span className="text-sm font-semibold text-slate-800 leading-tight">
                  {user.name}
                </span>
                <span
                  className={`text-[11px] font-medium px-2 py-0.5 rounded-full border mt-0.5 ${
                    roleBadgeColor[user.role] || 'bg-slate-100 text-slate-700'
                  }`}
                >
                  {roleDisplay[user.role] || user.role}
                </span>
              </div>

              {/* Update Password */}
              <button
                onClick={() => setShowPasswordModal(true)}
                title="Update Password"
                className="flex items-center space-x-1.5 px-3 py-1.5 text-xs font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition"
              >
                <KeyRound size={15} />
                <span className="hidden md:inline">Change Password</span>
              </button>

              {/* Log out */}
              <button
                onClick={logout}
                title="Log Out"
                className="flex items-center space-x-1.5 px-3 py-1.5 text-xs font-medium text-rose-700 bg-rose-50 hover:bg-rose-100 rounded-lg border border-rose-200/60 transition"
              >
                <LogOut size={15} />
                <span className="hidden md:inline">Log Out</span>
              </button>
            </div>
          )}
        </div>
      </header>

      {showPasswordModal && (
        <ChangePasswordModal onClose={() => setShowPasswordModal(false)} />
      )}
    </>
  );
}
