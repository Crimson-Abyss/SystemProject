/* eslint-disable no-unused-vars */
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import logo from '../assets/logo.jpg';
import { useUser } from './UserContext';
import { FiEye, FiEyeOff } from 'react-icons/fi';
import ThemeToggle from './ThemeToggle';
import { GoogleLogin } from '@react-oauth/google';

const Signup = () => {
  const navigate = useNavigate();
  const { setUser } = useUser();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [dob, setDob] = useState('');
  const [gender, setGender] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [showPassword, setShowPassword] = useState(false);

  const onSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    if (password !== confirm) {
      setError('Passwords do not match');
      setLoading(false);
      return;
    }

    try {
      const response = await fetch('/api/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, phone, dob, gender, password }),
      });

      const data = await response.json();

      if (response.ok) {
        const profile = data.user;
        localStorage.setItem('userProfile', JSON.stringify(profile));
        localStorage.setItem('token', data.token);

        const { fullName: name, points, avatarUrl } = profile;
        const initial = name ? name.charAt(0).toUpperCase() : 'U';
        setUser({ name, initial, points, avatarUrl });

        navigate('/app');
      } else {
        setError(data.message || 'Signup failed');
      }
    } catch (err) {
      setError(err?.message || 'Signup failed');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSuccess = async (credentialResponse) => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch('/api/auth/google', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ credential: credentialResponse.credential }),
      });
      const data = await response.json();
      if (response.ok) {
        const profile = data.user;
        localStorage.setItem('userProfile', JSON.stringify(profile));
        localStorage.setItem('token', data.token);

        const { fullName: name, points, avatarUrl } = profile;
        const initial = name ? name.charAt(0).toUpperCase() : 'U';
        setUser({ name, initial, points, avatarUrl });
        navigate('/app');
      } else {
        setError(data.message || 'Google signup failed');
      }
    } catch (err) {
      setError(err?.message || 'Google signup failed');
    } finally {
      setLoading(false);
    }
  };

  const inputClass = "mt-1 w-full rounded-xl border-gray-200 dark:border-white/10 dark:bg-white/5 dark:text-white focus:border-emerald-500 focus:ring-emerald-500/30 transition-all placeholder:text-gray-400 dark:placeholder:text-gray-600 py-2.5";

  return (
    <main className="min-h-screen bg-gray-50 dark:bg-[#060810] relative overflow-hidden flex items-center justify-center">
      {/* Animated background orbs */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[10%] left-[-10%] w-[400px] h-[400px] bg-emerald-500/8 dark:bg-emerald-500/5 rounded-full blur-3xl animate-blob" />
        <div className="absolute bottom-[-10%] right-[0%] w-[500px] h-[500px] bg-teal-500/6 dark:bg-teal-500/5 rounded-full blur-3xl animate-blob-2" />
      </div>

      {/* Theme toggle in corner */}
      <div className="absolute top-4 right-4 z-20">
        <ThemeToggle />
      </div>

      <div className="relative z-10 w-full max-w-md px-4 sm:px-6 py-8 animate-fade-in-up">
        <Link to="/" className="flex items-center justify-center mb-6 group">
          <img src={logo} alt="InsteaG Logo" className="h-12 w-auto dark:mix-blend-screen transition-transform duration-300 group-hover:scale-105" />
        </Link>
        <div className="text-center mb-6">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white font-[Outfit]">Join InsteaG Rewards</h1>
          <p className="mt-2 text-gray-500 dark:text-gray-400">Sign up today and get your first coffee free.</p>
        </div>

        <div>
          <div className="flex justify-center w-full">
            <GoogleLogin
              onSuccess={handleGoogleSuccess}
              onError={() => setError('Google signup failed. Please try again.')}
              useOneTap
              theme="filled_black"
              size="large"
              shape="rectangular"
              text="signup_with"
              width="350"
            />
          </div>
          <div className="my-6 flex items-center text-sm">
            <div className="flex-grow border-t border-gray-200 dark:border-white/10"></div>
            <span className="mx-4 text-gray-400 dark:text-gray-500">OR</span>
            <div className="flex-grow border-t border-gray-200 dark:border-white/10"></div>
          </div>
        </div>

        <form onSubmit={onSubmit} className="glass dark:glass-strong bg-white/80 dark:bg-white/5 p-5 sm:p-6 rounded-2xl shadow-xl dark:shadow-emerald-500/5 border border-gray-200/50 dark:border-white/10">
          {error && (
            <div className="mb-4 rounded-xl bg-rose-50 dark:bg-rose-500/10 border border-rose-200 dark:border-rose-500/20 text-rose-800 dark:text-rose-300 px-4 py-3 text-sm animate-fade-in">{error}</div>
          )}

          <div className="grid grid-cols-1 gap-y-4">
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Full name</label>
              <input id="name" type="text" required value={name} onChange={(e) => setName(e.target.value)} className={inputClass} placeholder="Sophia Johnson" />
            </div>

            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Email</label>
              <input id="email" type="email" required value={email} onChange={(e) => setEmail(e.target.value)} className={inputClass} placeholder="you@example.com" />
            </div>

            <div className="grid grid-cols-2 gap-x-4">
              <div>
                <label htmlFor="dob" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Date of Birth</label>
                <input id="dob" type="date" value={dob} onChange={(e) => setDob(e.target.value)} className={inputClass} />
              </div>
              <div>
                <label htmlFor="gender" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Gender</label>
                <select id="gender" value={gender} onChange={(e) => setGender(e.target.value)} className={inputClass}>
                  <option value="">Select...</option>
                  <option>Female</option>
                  <option>Male</option>
                  <option>Non-binary</option>
                  <option>Prefer not to say</option>
                </select>
              </div>
            </div>

            <div className="relative">
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Password</label>
              <input id="password" type={showPassword ? 'text' : 'password'} required value={password} onChange={(e) => setPassword(e.target.value)} className={inputClass} placeholder="••••••••" />
              <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute inset-y-0 right-0 top-6 pr-3 flex items-center text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors">
                {showPassword ? <FiEyeOff /> : <FiEye />}
              </button>
            </div>

            <div className="relative">
              <label htmlFor="confirm" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Confirm password</label>
              <input id="confirm" type={showPassword ? 'text' : 'password'} required value={confirm} onChange={(e) => setConfirm(e.target.value)} className={inputClass} placeholder="••••••••" />
            </div>
          </div>
          
          <button type="submit" disabled={loading} className="mt-6 w-full btn-primary py-2.5 text-base disabled:opacity-50 disabled:cursor-not-allowed">
            {loading ? (
              <span className="flex items-center justify-center gap-2">
                <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" /></svg>
                Creating account...
              </span>
            ) : 'Create Account'}
          </button>

          <div className="mt-4 text-sm text-gray-500 dark:text-gray-400">
            Already have an account?{' '}
            <Link to="/login" className="text-emerald-600 dark:text-emerald-400 hover:underline font-medium">Log in</Link>
          </div>
        </form>
      </div>
    </main>
  );
};

export default Signup;
