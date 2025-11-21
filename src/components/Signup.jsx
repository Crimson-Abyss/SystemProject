import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';

const Signup = () => {
  const navigate = useNavigate();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [dob, setDob] = useState('');
  const [gender, setGender] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

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
        // On successful signup, the server returns the new profile.
        // We save it to localStorage to establish the session.
        const profile = { ...data, fullName: data.fullName, points: 0 }; // Ensure fullName is set and points start at 0
        localStorage.setItem('userProfile', JSON.stringify(profile));
        const initial = profile.fullName ? profile.fullName.charAt(0).toUpperCase() : 'U';
        // We don't need to call setUser here as the page will navigate and UserContext will re-initialize from localStorage
        navigate('/app');
      } else {
        // Display error from the server (e.g., "email already exists")
        setError(data.message || 'Signup failed');
      }
    } catch (err) {
      setError(err?.message || 'Signup failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="max-w-md mx-auto px-6 py-16">
        <Link to="/" className="text-xl font-bold text-emerald-700 dark:text-emerald-500">System</Link>
        <h1 className="mt-6 text-3xl font-bold text-gray-900 dark:text-white">Create your account</h1>
        <p className="mt-2 text-gray-600 dark:text-gray-300">Join and start earning rewards today.</p>

        <form onSubmit={onSubmit} className="mt-8 bg-white dark:bg-gray-800/50 p-6 rounded-xl shadow-sm border border-gray-100 dark:border-gray-800">
          {error && (
            <div className="mb-4 rounded-md bg-rose-50 dark:bg-rose-500/10 border border-rose-200 dark:border-rose-500/20 text-rose-800 dark:text-rose-300 px-3 py-2 text-sm">{error}</div>
          )}

          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Full name</label>
          <input
            type="text"
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="mt-1 w-full rounded-md border-gray-300 dark:border-gray-700 dark:bg-gray-900 dark:text-white focus:border-emerald-500 focus:ring-emerald-500"
            placeholder="Sophia Johnson"
          />

          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mt-4">Email</label>
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="mt-1 w-full rounded-md border-gray-300 dark:border-gray-700 dark:bg-gray-900 dark:text-white focus:border-emerald-500 focus:ring-emerald-500"
            placeholder="you@example.com"
          />

          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mt-4">Phone Number</label>
          <input
            type="tel"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            className="mt-1 w-full rounded-md border-gray-300 dark:border-gray-700 dark:bg-gray-900 dark:text-white focus:border-emerald-500 focus:ring-emerald-500"
            placeholder="+1 555 123 4567"
          />

          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mt-4">Date of Birth</label>
          <input
            type="date"
            value={dob}
            onChange={(e) => setDob(e.target.value)}
            className="mt-1 w-full rounded-md border-gray-300 dark:border-gray-700 dark:bg-gray-900 dark:text-white focus:border-emerald-500 focus:ring-emerald-500"
          />

          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mt-4">Gender</label>
          <select
            value={gender}
            onChange={(e) => setGender(e.target.value)}
            className="mt-1 w-full rounded-md border-gray-300 dark:border-gray-700 dark:bg-gray-900 dark:text-white focus:border-emerald-500 focus:ring-emerald-500"
          >
            <option value="">Select gender</option>
            <option>Female</option>
            <option>Male</option>
            <option>Non-binary</option>
            <option>Prefer not to say</option>
          </select>

          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mt-4">Password</label>
          <input
            type="password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="mt-1 w-full rounded-md border-gray-300 dark:border-gray-700 dark:bg-gray-900 dark:text-white focus:border-emerald-500 focus:ring-emerald-500"
            placeholder="••••••••"
          />

          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mt-4">Confirm password</label>
          <input
            type="password"
            required
            value={confirm}
            onChange={(e) => setConfirm(e.target.value)}
            className="mt-1 w-full rounded-md border-gray-300 dark:border-gray-700 dark:bg-gray-900 dark:text-white focus:border-emerald-500 focus:ring-emerald-500"
            placeholder="••••••••"
          />

          <button
            type="submit"
            disabled={loading}
            className="mt-6 w-full inline-flex items-center justify-center px-4 py-2 rounded-md bg-emerald-600 text-white font-medium hover:bg-emerald-700 disabled:opacity-60"
          >
            {loading ? 'Creating account...' : 'Create account'}
          </button>
          
          <div className="mt-4 text-sm text-gray-600 dark:text-gray-400">
            Already have an account?{' '}
            <Link to="/login" className="text-emerald-700 dark:text-emerald-500 hover:underline">Log in</Link>
          </div>
        </form>
      </div>
    </main>
  );
};

export default Signup;
