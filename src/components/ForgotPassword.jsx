import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import logo from '../assets/logo.jpg';
import { FiMail } from 'react-icons/fi';
import ThemeToggle from './ThemeToggle';

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState(null);
  const [error, setError] = useState(null);

  const onSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setMessage(null);

    try {
      const response = await fetch('/api/forgot-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      if (response.ok) {
        setMessage(data.message || 'Check your email for a password reset link.');
        setEmail('');
      } else {
        setError(data.message || 'Failed to send reset email. Please try again.');
      }
    } catch (err) {
      setError(err?.message || 'Something went wrong. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-gray-50 dark:bg-[#060810] relative overflow-hidden flex items-center justify-center">
      {/* Animated background orbs */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-20%] right-[10%] w-[400px] h-[400px] bg-emerald-500/8 dark:bg-emerald-500/5 rounded-full blur-3xl animate-blob" />
        <div className="absolute bottom-[-15%] left-[-5%] w-[500px] h-[500px] bg-teal-500/6 dark:bg-teal-500/5 rounded-full blur-3xl animate-blob-2" />
      </div>

      {/* Theme toggle in corner */}
      <div className="absolute top-4 right-4 z-20">
        <ThemeToggle />
      </div>

      <div className="relative z-10 w-full max-w-md px-4 sm:px-6 py-8 animate-fade-in-up">
        <div className="glass dark:glass-strong bg-white/80 dark:bg-white/5 p-6 sm:p-8 rounded-2xl shadow-xl dark:shadow-emerald-500/5 border border-gray-200/50 dark:border-white/10">
          <Link to="/" className="flex items-center justify-center mb-6 group">
            <img src={logo} alt="InsteaG Logo" className="h-12 w-auto dark:mix-blend-screen transition-transform duration-300 group-hover:scale-105" />
          </Link>
          <div className="text-center">
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white font-[Outfit]">Reset Password</h1>
            <p className="mt-2 text-gray-500 dark:text-gray-400 text-sm">Enter your email and we'll send you a secure link to reset your password.</p>
          </div>

          <form onSubmit={onSubmit} noValidate className="mt-8">
            {error && (
              <div className="mb-4 rounded-xl bg-rose-50 dark:bg-rose-500/10 border border-rose-200 dark:border-rose-500/20 text-rose-800 dark:text-rose-300 px-4 py-3 text-sm animate-fade-in">{error}</div>
            )}
            {message && (
              <div className="mb-4 rounded-xl bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-200 dark:border-emerald-500/20 text-emerald-800 dark:text-emerald-300 px-4 py-3 text-sm animate-fade-in">{message}</div>
            )}
            
            <div className="space-y-4">
              <div className="relative group">
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Email</label>
                <FiMail className="pointer-events-none absolute left-3.5 top-[2.4rem] h-5 w-5 text-gray-400 dark:text-gray-500 group-focus-within:text-emerald-500 transition-colors" />
                <input id="email" type="email" required value={email} onChange={(e) => setEmail(e.target.value)} className="w-full pl-11 pr-4 py-2.5 rounded-xl border-gray-200 dark:border-white/10 dark:bg-white/5 dark:text-white focus:border-emerald-500 focus:ring-emerald-500/30 transition-all placeholder:text-gray-400 dark:placeholder:text-gray-600" placeholder="you@example.com" />
              </div>
            </div>

            <button type="submit" disabled={loading} className="mt-6 w-full btn-primary py-2.5 text-base disabled:opacity-50 disabled:cursor-not-allowed">
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" /></svg>
                  Sending link...
                </span>
              ) : 'Send Reset Link'}
            </button>

            <div className="mt-6 text-center text-sm text-gray-500 dark:text-gray-400">
              Remember your password?{' '}
              <Link to="/login" className="text-emerald-600 dark:text-emerald-400 hover:underline font-medium">Back to login</Link>
            </div>
          </form>
        </div>
      </div>
    </main>
  );
};

export default ForgotPassword;
