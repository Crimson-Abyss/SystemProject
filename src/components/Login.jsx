/* eslint-disable no-unused-vars */
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import logo from '../assets/logo.jpg';
import { useUser } from './UserContext';
import { FiMail, FiLock, FiEye, FiEyeOff } from 'react-icons/fi';
import ThemeToggle from './ThemeToggle';

const Login = () => {
  const navigate = useNavigate();
  const { setUser } = useUser();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [showPassword, setShowPassword] = useState(false);

  const onSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const response = await fetch('/api/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (response.ok) {
        const profile = data.user;

        if (profile.role === 'admin') {
          setError('Admin accounts must use the Admin Portal.');
          setLoading(false);
          return;
        }

        const { fullName: name, points, avatarUrl, role } = profile;
        const initial = name ? name.charAt(0).toUpperCase() : 'U';
        setUser({ name, initial, points, avatarUrl, role });
        localStorage.setItem('userProfile', JSON.stringify(profile));
        localStorage.setItem('token', data.token);

        navigate('/app');
      } else {
        setError(data.message || 'Login failed');
      }
    } catch (err) {
      setError(err?.message || 'Login failed');
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
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white font-[Outfit]">Welcome Back</h1>
            <p className="mt-1 text-gray-500 dark:text-gray-400">Sign in to continue.</p>
          </div>

          <div className="mt-6">
            <button className="w-full inline-flex items-center justify-center px-4 py-2.5 rounded-xl bg-white dark:bg-white/5 border border-gray-200 dark:border-white/10 text-gray-700 dark:text-white font-medium hover:bg-gray-50 dark:hover:bg-white/10 transition-all duration-200 hover:shadow-md">
              <svg className="w-5 h-5 mr-2" viewBox="0 0 48 48"><path fill="#FFC107" d="M43.611,20.083H42V20H24v8h11.303c-1.649,4.657-6.08,8-11.303,8c-6.627,0-12-5.373-12-12c0-6.627,5.373-12,12-12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C12.955,4,4,12.955,4,24s8.955,20,20,20s20-8.955,20-20C44,22.659,43.862,21.35,43.611,20.083z"></path><path fill="#FF3D00" d="M6.306,14.691l6.571,4.819C14.655,15.108,18.961,12,24,12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C16.318,4,9.656,8.337,6.306,14.691z"></path><path fill="#4CAF50" d="M24,44c5.166,0,9.86-1.977,13.409-5.192l-6.19-5.238C29.211,35.091,26.715,36,24,36c-5.202,0-9.619-3.317-11.283-7.946l-6.522,5.025C9.505,39.556,16.227,44,24,44z"></path><path fill="#1976D2" d="M43.611,20.083H42V20H24v8h11.303c-0.792,2.237-2.231,4.166-4.087,5.571l6.19,5.238C42.021,35.596,44,30.138,44,24C44,22.659,43.862,21.35,43.611,20.083z"></path></svg>
              Sign in with Google
            </button>
            <div className="my-6 flex items-center text-sm">
              <div className="grow border-t border-gray-200 dark:border-white/10"></div>
              <span className="mx-4 text-gray-400 dark:text-gray-500">OR</span>
              <div className="grow border-t border-gray-200 dark:border-white/10"></div>
            </div>
          </div>

          <form onSubmit={onSubmit} noValidate>
            {error && (
              <div className="mb-4 rounded-xl bg-rose-50 dark:bg-rose-500/10 border border-rose-200 dark:border-rose-500/20 text-rose-800 dark:text-rose-300 px-4 py-3 text-sm animate-fade-in">{error}</div>
            )}
            <div className="space-y-4">
              <div className="relative group">
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Email</label>
                <FiMail className="pointer-events-none absolute left-3.5 top-[2.4rem] h-5 w-5 text-gray-400 dark:text-gray-500 group-focus-within:text-emerald-500 transition-colors" />
                <input id="email" type="email" required value={email} onChange={(e) => setEmail(e.target.value)} className="w-full pl-11 pr-4 py-2.5 rounded-xl border-gray-200 dark:border-white/10 dark:bg-white/5 dark:text-white focus:border-emerald-500 focus:ring-emerald-500/30 transition-all placeholder:text-gray-400 dark:placeholder:text-gray-600" placeholder="you@example.com" />
              </div>

              <div className="relative group">
                <label htmlFor="password" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Password</label>
                <FiLock className="pointer-events-none absolute left-3.5 top-[2.4rem] h-5 w-5 text-gray-400 dark:text-gray-500 group-focus-within:text-emerald-500 transition-colors" />
                <input id="password" type={showPassword ? 'text' : 'password'} required value={password} onChange={(e) => setPassword(e.target.value)} className="w-full pl-11 pr-12 py-2.5 rounded-xl border-gray-200 dark:border-white/10 dark:bg-white/5 dark:text-white focus:border-emerald-500 focus:ring-emerald-500/30 transition-all placeholder:text-gray-400 dark:placeholder:text-gray-600" placeholder="••••••••" />
                <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute top-[2.1rem] right-0 pr-3.5 flex items-center text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 h-10 transition-colors">
                  {showPassword ? <FiEyeOff /> : <FiEye />}
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between mt-4">
              <div className="flex items-center">
                <input id="remember-me" name="remember-me" type="checkbox" className="h-4 w-4 rounded border-gray-300 dark:bg-white/5 dark:border-white/10 text-emerald-600 focus:ring-emerald-500" />
                <label htmlFor="remember-me" className="ml-2 block text-sm text-gray-600 dark:text-gray-400">Remember me</label>
              </div>
              <div className="text-sm">
                <a href="#" className="font-medium text-emerald-600 dark:text-emerald-400 hover:text-emerald-500">Forgot password?</a>
              </div>
            </div>

            <button type="submit" disabled={loading} className="mt-6 w-full btn-primary py-2.5 text-base disabled:opacity-50 disabled:cursor-not-allowed">
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" /></svg>
                  Signing in...
                </span>
              ) : 'Sign in'}
            </button>

            <div className="mt-6 text-center text-sm text-gray-500 dark:text-gray-400">
              Don't have an account?{' '}
              <Link to="/signup" className="text-emerald-600 dark:text-emerald-400 hover:underline font-medium">Sign up</Link>
            </div>
          </form>
        </div>
      </div>
    </main>
  );
};

export default Login;
