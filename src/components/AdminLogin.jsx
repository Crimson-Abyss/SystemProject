import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import logo from '../assets/logo.jpg';
import { useUser } from './UserContext';
import { FiMail, FiLock, FiEye, FiEyeOff, FiShield, FiArrowRight } from 'react-icons/fi';

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
        <main className="min-h-screen bg-[#060810] flex items-center justify-center relative overflow-hidden font-['Inter']">
            {/* Animated Background */}
            <div className="absolute inset-0 z-0">
                <div className="absolute top-1/4 -left-1/4 w-96 h-96 bg-emerald-500/10 rounded-full blur-[100px] animate-float" />
                <div className="absolute bottom-1/4 -right-1/4 w-[500px] h-[500px] bg-indigo-500/10 rounded-full blur-[120px] animate-float delay-700" />
            </div>

            <div className="w-full max-w-md px-6 py-12 relative z-10 animate-fade-in-up">
                <div className="glass-dark bg-[#0a0f1b]/80 p-8 rounded-2xl shadow-2xl border border-white/10">
                    <div className="flex flex-col items-center justify-center mb-8">
                        <div className="w-16 h-16 rounded-2xl bg-linear-to-br from-indigo-500/20 to-purple-500/20 flex items-center justify-center mb-4 ring-1 ring-white/10 shadow-lg shadow-indigo-500/20">
                            <FiShield className="w-8 h-8 text-indigo-400" />
                        </div>
                        <h1 className="text-2xl font-bold text-white font-['Outfit']">Admin Portal</h1>
                        <p className="mt-2 text-gray-400 text-sm">Authorized personnel only</p>
                    </div>

                    <form onSubmit={onSubmit} noValidate>
                        {error && (
                            <div className="mb-6 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-300 px-4 py-3 text-sm flex items-start animate-scale-in">
                                <span className="font-bold mr-2 text-rose-400">Wait:</span> {error}
                            </div>
                        )}
                        <div className="space-y-5">
                            <div className="relative group">
                                <label htmlFor="email" className="block text-sm font-medium text-gray-400 group-focus-within:text-indigo-400 mb-1.5 transition-colors">Admin Email</label>
                                <div className="relative">
                                    <FiMail className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-500 group-focus-within:text-indigo-400 transition-colors" />
                                    <input
                                        id="email"
                                        type="email"
                                        required
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        className="w-full pl-11 pr-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder:text-gray-600 focus:border-indigo-500 focus:ring-indigo-500/30 transition-all shadow-inner"
                                        placeholder="admin@insteag.com"
                                    />
                                </div>
                            </div>

                            <div className="relative group">
                                <label htmlFor="password" className="block text-sm font-medium text-gray-400 group-focus-within:text-indigo-400 mb-1.5 transition-colors">Access Code</label>
                                <div className="relative">
                                    <FiLock className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-500 group-focus-within:text-indigo-400 transition-colors" />
                                    <input
                                        id="password"
                                        type={showPassword ? 'text' : 'password'}
                                        required
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        className="w-full pl-11 pr-11 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder:text-gray-600 focus:border-indigo-500 focus:ring-indigo-500/30 transition-all shadow-inner"
                                        placeholder="••••••••"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword(!showPassword)}
                                        className="absolute top-1/2 right-3 -translate-y-1/2 p-1 text-gray-500 hover:text-white transition-colors"
                                    >
                                        {showPassword ? <FiEyeOff className="w-5 h-5" /> : <FiEye className="w-5 h-5" />}
                                    </button>
                                </div>
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="mt-8 w-full bg-linear-to-r from-indigo-500 to-purple-500 text-white font-bold py-3 px-4 rounded-xl hover:from-indigo-600 hover:to-purple-600 hover:shadow-lg hover:shadow-indigo-500/30 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:ring-offset-2 focus:ring-offset-[#0a0f1b] disabled:opacity-60 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2 group"
                        >
                            {loading ? (
                                <span className="flex items-center gap-2">
                                  <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" /></svg>
                                  Verifying...
                                </span>
                            ) : (
                                <>
                                  Access Dashboard <FiArrowRight className="group-hover:translate-x-1 transition-transform" />
                                </>
                            )}
                        </button>

                        <div className="mt-8 text-center pt-6 border-t border-white/10">
                            <Link to="/" className="text-sm font-medium text-gray-400 hover:text-white transition-colors">
                                Return to Storefront
                            </Link>
                        </div>
                    </form>
                </div>
            </div>
        </main>
    );
};

export default AdminLogin;
