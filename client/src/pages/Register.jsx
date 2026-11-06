import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Store, UserPlus, AlertCircle, CheckCircle2 } from 'lucide-react';

export default function Register() {
  const { register } = useAuth();
  const navigate = useNavigate();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [address, setAddress] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // Real-time validations
  const isNameValid = name.trim().length >= 20 && name.trim().length <= 60;
  const isAddressValid = address.trim().length > 0 && address.trim().length <= 400;
  const isEmailValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());
  const isPasswordLength = password.length >= 8 && password.length <= 16;
  const hasUppercase = /[A-Z]/.test(password);
  const hasSpecial = /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?~`]/.test(password);
  const isPasswordValid = isPasswordLength && hasUppercase && hasSpecial;

  const isFormValid = isNameValid && isAddressValid && isEmailValid && isPasswordValid;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!isFormValid) {
      setError('Please resolve all validation requirements before submitting.');
      return;
    }

    setLoading(true);
    try {
      await register({
        name: name.trim(),
        email: email.trim(),
        address: address.trim(),
        password
      });
      navigate('/stores');
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-lg">
        <div className="flex justify-center">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-emerald-600 to-teal-500 flex items-center justify-center text-white shadow-lg shadow-emerald-500/25">
            <Store size={32} />
          </div>
        </div>
        <h2 className="mt-4 text-center text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
          Create Normal User Account
        </h2>
        <p className="mt-1 text-center text-sm text-slate-500">
          Sign up to browse registered stores and submit genuine ratings
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-lg px-4 sm:px-0">
        <div className="bg-white py-8 px-6 shadow-xl shadow-slate-200/50 rounded-2xl border border-slate-200 sm:px-10">
          {error && (
            <div className="mb-5 p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-sm flex items-start space-x-2">
              <AlertCircle size={18} className="shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Full Name */}
            <div>
              <div className="flex justify-between items-center mb-1">
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600">
                  Full Name (20 to 60 chars)
                </label>
                <span className={`text-[11px] font-mono ${name.length > 0 && !isNameValid ? 'text-amber-600 font-semibold' : 'text-slate-400'}`}>
                  {name.length}/60
                </span>
              </div>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Normal Customer Alexander Miller"
                className={`w-full px-3.5 py-2.5 bg-slate-50 border rounded-xl text-sm focus:bg-white focus:outline-none transition ${
                  name.length > 0
                    ? isNameValid
                      ? 'border-emerald-500 focus:ring-2 focus:ring-emerald-500'
                      : 'border-amber-400 focus:ring-2 focus:ring-amber-400'
                    : 'border-slate-300 focus:ring-2 focus:ring-emerald-500'
                }`}
              />
              {name.length > 0 && !isNameValid && (
                <p className="mt-1 text-xs text-amber-600">
                  Must be at least 20 and at most 60 characters (currently {name.length}).
                </p>
              )}
            </div>

            {/* Email */}
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1">
                Email Address
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="customer@example.com"
                className={`w-full px-3.5 py-2.5 bg-slate-50 border rounded-xl text-sm focus:bg-white focus:outline-none transition ${
                  email.length > 0
                    ? isEmailValid
                      ? 'border-emerald-500 focus:ring-2 focus:ring-emerald-500'
                      : 'border-amber-400 focus:ring-2 focus:ring-amber-400'
                    : 'border-slate-300 focus:ring-2 focus:ring-emerald-500'
                }`}
              />
            </div>

            {/* Address */}
            <div>
              <div className="flex justify-between items-center mb-1">
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600">
                  Address (max 400 chars)
                </label>
                <span className={`text-[11px] font-mono ${address.length > 400 ? 'text-rose-600 font-bold' : 'text-slate-400'}`}>
                  {address.length}/400
                </span>
              </div>
              <textarea
                required
                rows={2}
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                placeholder="123 Street Name, City, State, ZIP"
                className={`w-full px-3.5 py-2 bg-slate-50 border rounded-xl text-sm focus:bg-white focus:outline-none transition ${
                  address.length > 0
                    ? isAddressValid
                      ? 'border-emerald-500 focus:ring-2 focus:ring-emerald-500'
                      : 'border-rose-400 focus:ring-2 focus:ring-rose-400'
                    : 'border-slate-300 focus:ring-2 focus:ring-emerald-500'
                }`}
              />
            </div>

            {/* Password */}
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1">
                Password
              </label>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="8 to 16 characters"
                className={`w-full px-3.5 py-2.5 bg-slate-50 border rounded-xl text-sm focus:bg-white focus:outline-none transition ${
                  password.length > 0
                    ? isPasswordValid
                      ? 'border-emerald-500 focus:ring-2 focus:ring-emerald-500'
                      : 'border-amber-400 focus:ring-2 focus:ring-amber-400'
                    : 'border-slate-300 focus:ring-2 focus:ring-emerald-500'
                }`}
              />

              {/* Password Requirements Guide */}
              <div className="mt-2 p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-1 text-xs">
                <div className={`flex items-center space-x-1.5 ${isPasswordLength ? 'text-emerald-700' : 'text-slate-500'}`}>
                  <span className={`w-3.5 h-3.5 rounded-full flex items-center justify-center text-[9px] ${isPasswordLength ? 'bg-emerald-100 font-bold' : 'bg-slate-200'}`}>
                    {isPasswordLength ? '✓' : '•'}
                  </span>
                  <span>8 to 16 characters in length</span>
                </div>
                <div className={`flex items-center space-x-1.5 ${hasUppercase ? 'text-emerald-700' : 'text-slate-500'}`}>
                  <span className={`w-3.5 h-3.5 rounded-full flex items-center justify-center text-[9px] ${hasUppercase ? 'bg-emerald-100 font-bold' : 'bg-slate-200'}`}>
                    {hasUppercase ? '✓' : '•'}
                  </span>
                  <span>Includes at least 1 uppercase letter (A-Z)</span>
                </div>
                <div className={`flex items-center space-x-1.5 ${hasSpecial ? 'text-emerald-700' : 'text-slate-500'}`}>
                  <span className={`w-3.5 h-3.5 rounded-full flex items-center justify-center text-[9px] ${hasSpecial ? 'bg-emerald-100 font-bold' : 'bg-slate-200'}`}>
                    {hasSpecial ? '✓' : '•'}
                  </span>
                  <span>Includes at least 1 special character (!@#$%^&*...)</span>
                </div>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading || !isFormValid}
              className="w-full mt-3 py-3 px-4 rounded-xl text-sm font-semibold text-white bg-emerald-600 hover:bg-emerald-700 shadow-md shadow-emerald-600/25 transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Creating Account...' : 'Sign Up as Normal User'}
            </button>
          </form>

          <div className="mt-6 text-center text-sm text-slate-500">
            Already registered?{' '}
            <Link to="/login" className="font-semibold text-emerald-600 hover:text-emerald-700">
              Sign in
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
