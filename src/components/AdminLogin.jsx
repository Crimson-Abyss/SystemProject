import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import logo from '../assets/logo.jpg';
import { useUser } from './UserContext';
import { FiMail, FiLock, FiEye, FiEyeOff, FiShield } from 'react-icons/fi';

const AdminLogin = () => {
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

                // Check if user is admin
                if (profile.role !== 'admin') {
                    setError('Access denied. You do not have admin privileges.');
                    setLoading(false);
                    return;
                }

                const { fullName: name, points, avatarUrl, role } = profile;
                const initial = name ? name.charAt(0).toUpperCase() : 'A';

                setUser({ name, initial, points, avatarUrl, role });
                localStorage.setItem('userProfile', JSON.stringify(profile));
                localStorage.setItem('token', data.token);

                navigate('/admin');
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
        <main className="min-h-screen bg-slate-50 dark:bg-slate-900 flex items-center justify-center">
            <div className="w-full max-w-md px-6 py-12">
                <div className="bg-white dark:bg-slate-800 p-8 rounded-xl shadow-xl border border-slate-200 dark:border-slate-700">
                    <div className="flex flex-col items-center justify-center mb-8">
                        <img src={logo} alt="InsteaG Logo" className="h-12 w-auto mb-4 dark:mix-blend-screen" />
                        <div className="flex items-center space-x-2 text-slate-900 dark:text-white">
                            <FiShield className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />
                            <h1 className="text-2xl font-bold">Admin Portal</h1>
                        </div>
                        <p className="mt-2 text-slate-600 dark:text-slate-400 text-sm">Restricted access for authorized personnel only.</p>
                    </div>

                    <form onSubmit={onSubmit} noValidate>
                        {error && (
                            <div className="mb-6 rounded-md bg-rose-50 dark:bg-rose-500/10 border border-rose-200 dark:border-rose-500/20 text-rose-800 dark:text-rose-300 px-4 py-3 text-sm flex items-start">
                                <span className="font-medium mr-1">Error:</span> {error}
                            </div>
                        )}
                        <div className="space-y-5">
                            <div className="relative">
                                <label htmlFor="email" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Email Address</label>
                                <div className="relative">
                                    <FiMail className="pointer-events-none absolute left-3 top-3 h-5 w-5 text-slate-400" />
                                    <input
                                        id="email"
                                        type="email"
                                        required
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        className="w-full pl-10 pr-3 py-2.5 rounded-lg border-slate-300 dark:border-slate-600 dark:bg-slate-900 dark:text-white focus:border-indigo-500 focus:ring-indigo-500 transition-colors"
                                        placeholder="admin@insteag.com"
                                    />
                                </div>
                            </div>

                            <div className="relative">
                                <label htmlFor="password" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Password</label>
                                <div className="relative">
                                    <FiLock className="pointer-events-none absolute left-3 top-3 h-5 w-5 text-slate-400" />
                                    <input
                                        id="password"
                                        type={showPassword ? 'text' : 'password'}
                                        required
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        className="w-full pl-10 pr-10 py-2.5 rounded-lg border-slate-300 dark:border-slate-600 dark:bg-slate-900 dark:text-white focus:border-indigo-500 focus:ring-indigo-500 transition-colors"
                                        placeholder="••••••••"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword(!showPassword)}
                                        className="absolute top-0 right-0 h-full px-3 flex items-center text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                                    >
                                        {showPassword ? <FiEyeOff /> : <FiEye />}
                                    </button>
                                </div>
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="mt-8 w-full inline-flex items-center justify-center px-4 py-3 rounded-lg bg-indigo-600 text-white font-medium hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-60 disabled:cursor-not-allowed transition-all shadow-md hover:shadow-lg"
                        >
                            {loading ? 'Authenticating...' : 'Access Dashboard'}
                        </button>

                        <div className="mt-8 text-center">
                            <Link to="/" className="text-sm text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 transition-colors">
                                ← Return to Home
                            </Link>
                        </div>
                    </form>
                </div>
            </div>
        </main>
    );
};

export default AdminLogin;
