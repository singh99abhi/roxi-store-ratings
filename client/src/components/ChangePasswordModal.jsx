import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { X, KeyRound, Check, AlertCircle } from 'lucide-react';

export default function ChangePasswordModal({ onClose }) {
  const { updatePassword } = useAuth();
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Password rule tests
  const lengthValid = newPassword.length >= 8 && newPassword.length <= 16;
  const uppercaseValid = /[A-Z]/.test(newPassword);
  const specialValid = /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?~`]/.test(newPassword);
  const matchValid = newPassword && newPassword === confirmPassword;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!lengthValid || !uppercaseValid || !specialValid) {
      setError('Please satisfy all password criteria listed below.');
      return;
    }

    if (!matchValid) {
      setError('New passwords do not match.');
      return;
    }

    setLoading(true);
    try {
      await updatePassword(oldPassword, newPassword);
      setSuccess('Password updated successfully! You can continue using your account.');
      setTimeout(() => {
        onClose();
      }, 1500);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update password. Check your current password.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl border border-slate-200 w-full max-w-md overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50">
          <div className="flex items-center space-x-2">
            <KeyRound size={20} className="text-emerald-600" />
            <h3 className="font-semibold text-slate-800">Update Password</h3>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 p-1 rounded-lg hover:bg-slate-200/50 transition"
          >
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="p-3 rounded-lg bg-rose-50 border border-rose-200 text-rose-700 text-sm flex items-start space-x-2">
              <AlertCircle size={18} className="shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}
          {success && (
            <div className="p-3 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-700 text-sm flex items-start space-x-2">
              <Check size={18} className="shrink-0 mt-0.5" />
              <span>{success}</span>
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1">
              Current Password
            </label>
            <input
              type="password"
              required
              value={oldPassword}
              onChange={(e) => setOldPassword(e.target.value)}
              placeholder="Enter your current password"
              className="w-full px-3.5 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1">
              New Password
            </label>
            <input
              type="password"
              required
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder="8-16 characters"
              className="w-full px-3.5 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-none"
            />
          </div>

          {/* Validation Checklist */}
          <div className="p-3 rounded-lg bg-slate-50 border border-slate-200 text-xs space-y-1.5">
            <div className="font-medium text-slate-600 mb-1">Password Requirements:</div>
            <div className={`flex items-center space-x-2 ${lengthValid ? 'text-emerald-700' : 'text-slate-500'}`}>
              <span className={`w-4 h-4 rounded-full flex items-center justify-center text-[10px] ${lengthValid ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-200 text-slate-600'}`}>
                {lengthValid ? '✓' : '•'}
              </span>
              <span>8 to 16 characters in length</span>
            </div>
            <div className={`flex items-center space-x-2 ${uppercaseValid ? 'text-emerald-700' : 'text-slate-500'}`}>
              <span className={`w-4 h-4 rounded-full flex items-center justify-center text-[10px] ${uppercaseValid ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-200 text-slate-600'}`}>
                {uppercaseValid ? '✓' : '•'}
              </span>
              <span>At least 1 uppercase letter (A-Z)</span>
            </div>
            <div className={`flex items-center space-x-2 ${specialValid ? 'text-emerald-700' : 'text-slate-500'}`}>
              <span className={`w-4 h-4 rounded-full flex items-center justify-center text-[10px] ${specialValid ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-200 text-slate-600'}`}>
                {specialValid ? '✓' : '•'}
              </span>
              <span>At least 1 special character (!@#$%^&*...)</span>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1">
              Confirm New Password
            </label>
            <input
              type="password"
              required
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Re-type new password"
              className="w-full px-3.5 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-none"
            />
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
              disabled={loading || !lengthValid || !uppercaseValid || !specialValid || !matchValid}
              className="px-5 py-2 text-sm font-medium text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg shadow-sm disabled:opacity-50 disabled:cursor-not-allowed transition"
            >
              {loading ? 'Updating...' : 'Update Password'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
