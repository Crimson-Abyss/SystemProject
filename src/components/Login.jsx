import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useUser } from './UserContext';

const Login = () => {
  const navigate = useNavigate();
  const { setUser } = useUser();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

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
        <Link to="/" className="text-xl font-bold text-emerald-700 dark:text-emerald-500">Loyalty Account</Link>
        <h1 className="mt-6 text-3xl font-bold text-gray-900 dark:text-white">Welcome back</h1>
        <p className="mt-2 text-gray-600 dark:text-gray-300">Sign in to continue to your rewards.</p>

        <form onSubmit={onSubmit} className="mt-8 bg-white dark:bg-gray-800/50 p-6 rounded-xl shadow-sm border border-gray-100 dark:border-gray-800">
          {error && (
            <div className="mb-4 rounded-md bg-rose-50 dark:bg-rose-500/10 border border-rose-200 dark:border-rose-500/20 text-rose-800 dark:text-rose-300 px-3 py-2 text-sm">{error}</div>
          )}

          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Email</label>
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="mt-1 w-full rounded-md border-gray-300 dark:border-gray-700 dark:bg-gray-900 dark:text-white focus:border-emerald-500 focus:ring-emerald-500"
            placeholder="you@example.com"
          />

          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mt-4">Password</label>
          <input
            type="password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="mt-1 w-full rounded-md border-gray-300 dark:border-gray-700 dark:bg-gray-900 dark:text-white focus:border-emerald-500 focus:ring-emerald-500"
            placeholder="••••••••"
          />

          <button
            type="submit"
            disabled={loading}
            className="mt-6 w-full inline-flex items-center justify-center px-4 py-2 rounded-md bg-emerald-600 text-white font-medium hover:bg-emerald-700 disabled:opacity-60"
          >
            {loading ? 'Signing in...' : 'Sign in'}
          </button>
          
          <div className="mt-4 text-sm text-gray-600 dark:text-gray-400">
            Don't have an account?{' '}
            <Link to="/signup" className="text-emerald-700 dark:text-emerald-500 hover:underline">Sign up</Link>
          </div>
        </form>
      </div>
    </main>
  );
};

export default Login;
