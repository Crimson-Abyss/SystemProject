import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import logo from '../assets/logo.jpg';
import { useUser } from './UserContext';
import { FiMail, FiLock, FiEye, FiEyeOff } from 'react-icons/fi';

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
      const response = await fetch('/api/login', { // Use proxied URL
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (response.ok) {
        // On successful login, update the user context and save to localStorage
        const profile = data.user; // The server sends the full user profile.
        const { fullName: name, points, avatarUrl } = profile;
        const initial = name ? name.charAt(0).toUpperCase() : 'U';
        // Update the global user state
        setUser({ name, initial, points, avatarUrl });
        // Save profile to localStorage so it persists on refresh
        localStorage.setItem('userProfile', JSON.stringify(profile));
        // Save token to localStorage
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
    <main className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="max-w-md mx-auto px-6 py-16">
        <div className="bg-white dark:bg-gray-800/50 p-8 rounded-xl shadow-lg border border-gray-100 dark:border-gray-800">
          <Link to="/" className="flex items-center justify-center mb-6">
            <img src={logo} alt="InsteaG Logo" className="h-10 w-auto dark:mix-blend-screen" />
          </Link>
          <div className="text-center">
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Welcome Back</h1>
            <p className="mt-1 text-gray-600 dark:text-gray-300">Sign in to continue.</p>
          </div>

          <div className="mt-6">
            <button className="w-full inline-flex items-center justify-center px-4 py-2 rounded-md bg-white dark:bg-slate-800 border border-gray-300 dark:border-slate-700 text-gray-700 dark:text-white font-medium hover:bg-gray-50 dark:hover:bg-slate-700">
              <svg className="w-5 h-5 mr-2" viewBox="0 0 48 48"><path fill="#FFC107" d="M43.611,20.083H42V20H24v8h11.303c-1.649,4.657-6.08,8-11.303,8c-6.627,0-12-5.373-12-12c0-6.627,5.373-12,12-12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C12.955,4,4,12.955,4,24s8.955,20,20,20s20-8.955,20-20C44,22.659,43.862,21.35,43.611,20.083z"></path><path fill="#FF3D00" d="M6.306,14.691l6.571,4.819C14.655,15.108,18.961,12,24,12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C16.318,4,9.656,8.337,6.306,14.691z"></path><path fill="#4CAF50" d="M24,44c5.166,0,9.86-1.977,13.409-5.192l-6.19-5.238C29.211,35.091,26.715,36,24,36c-5.202,0-9.619-3.317-11.283-7.946l-6.522,5.025C9.505,39.556,16.227,44,24,44z"></path><path fill="#1976D2" d="M43.611,20.083H42V20H24v8h11.303c-0.792,2.237-2.231,4.166-4.087,5.571l6.19,5.238C42.021,35.596,44,30.138,44,24C44,22.659,43.862,21.35,43.611,20.083z"></path></svg>
              Sign in with Google
            </button>
            <div className="my-6 flex items-center text-sm">
              <div className="flex-grow border-t border-gray-300 dark:border-gray-700"></div>
              <span className="mx-4 text-gray-500">OR</span>
              <div className="flex-grow border-t border-gray-300 dark:border-gray-700"></div>
            </div>
          </div>

          <form onSubmit={onSubmit} noValidate>
            {error && (
              <div className="mb-4 rounded-md bg-rose-50 dark:bg-rose-500/10 border border-rose-200 dark:border-rose-500/20 text-rose-800 dark:text-rose-300 px-3 py-2 text-sm">{error}</div>
            )}
            <div className="space-y-4">
              <div className="relative">
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Email</label>
                <FiMail className="pointer-events-none absolute left-3 top-9 h-5 w-5 text-gray-400" />
                <input id="email" type="email" required value={email} onChange={(e) => setEmail(e.target.value)} className="w-full pl-10 pr-3 py-2 rounded-md border-gray-300 dark:border-gray-700 dark:bg-gray-900 dark:text-white focus:border-emerald-500 focus:ring-emerald-500" placeholder="you@example.com" />
              </div>

              <div className="relative">
                <label htmlFor="password" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Password</label>
                <FiLock className="pointer-events-none absolute left-3 top-9 h-5 w-5 text-gray-400" />
                <input id="password" type={showPassword ? 'text' : 'password'} required value={password} onChange={(e) => setPassword(e.target.value)} className="w-full pl-10 pr-10 py-2 rounded-md border-gray-300 dark:border-gray-700 dark:bg-gray-900 dark:text-white focus:border-emerald-500 focus:ring-emerald-500" placeholder="••••••••" />
                <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute top-7 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 h-10">
                  {showPassword ? <FiEyeOff /> : <FiEye />}
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between mt-4">
              <div className="flex items-center">
                <input id="remember-me" name="remember-me" type="checkbox" className="h-4 w-4 rounded border-gray-300 dark:bg-gray-700 dark:border-gray-600 text-emerald-600 focus:ring-emerald-500" />
                <label htmlFor="remember-me" className="ml-2 block text-sm text-gray-900 dark:text-gray-300">Remember me</label>
              </div>
              <div className="text-sm">
                <a href="#" className="font-medium text-emerald-600 hover:text-emerald-500">Forgot password?</a>
              </div>
            </div>

            <button type="submit" disabled={loading} className="mt-6 w-full inline-flex items-center justify-center px-4 py-2 rounded-md bg-emerald-600 text-white font-medium hover:bg-emerald-700 disabled:opacity-60">
              {loading ? 'Signing in...' : 'Sign in'}
            </button>
            
            <div className="mt-6 text-center text-sm text-gray-600 dark:text-gray-400">
              Don't have an account?{' '}
              <Link to="/signup" className="text-emerald-700 dark:text-emerald-500 hover:underline">Sign up</Link>
            </div>
          </form>
        </div>
      </div>
    </main>
  );
};

export default Login;
