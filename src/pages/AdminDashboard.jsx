import React, { useState } from 'react';
import { FaCashRegister, FaClipboardList, FaSignOutAlt, FaBoxOpen, FaUsers, FaChartLine } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import POSSystem from '../components/admin/POSSystem';
import OrderManagement from '../components/admin/OrderManagement';
import AdminProducts from '../components/admin/AdminProducts';
import AdminUsers from '../components/admin/AdminUsers';
import AdminAnalytics from '../components/admin/AdminAnalytics';

const AdminDashboard = () => {
    const [activeTab, setActiveTab] = useState('pos');
    const navigate = useNavigate();

    const handleLogout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('userProfile');
        navigate('/admin/login');
    };

    const renderContent = () => {
        switch (activeTab) {
            case 'pos': return <POSSystem />;
            case 'orders': return <OrderManagement />;
            case 'products': return <AdminProducts />;
            case 'users': return <AdminUsers />;
            case 'analytics': return <AdminAnalytics />;
            default: return <POSSystem />;
        }
    };

    const NavButton = ({ id, icon: Icon, label }) => {
        const isActive = activeTab === id;
        return (
            <button
                onClick={() => setActiveTab(id)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-300 font-medium ${
                    isActive
                    ? 'bg-gradient-to-r from-emerald-500/10 to-teal-500/10 text-emerald-400 shadow-[inset_0_1px_1px_rgba(255,255,255,0.05)] ring-1 ring-emerald-500/30 glow-emerald'
                    : 'text-gray-400 hover:bg-white/5 hover:text-gray-200'
                }`}
            >
                <Icon className={`text-lg transition-transform ${isActive ? 'scale-110' : ''}`} />
                {label}
            </button>
        );
    };

    return (
        <div className="min-h-screen bg-[#0a0e18] flex flex-col font-['Inter'] relative overflow-hidden">
            {/* Ambient Background Glow */}
            <div className="absolute top-0 left-0 w-full h-[300px] bg-emerald-500/5 blur-[120px] pointer-events-none" />

            {/* Top Navigation Bar */}
            <header className="glass-dark bg-[#0a0e18]/80 shadow-md border-b border-white/10 z-20 sticky top-0">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex justify-between items-center">
                    <div className="flex items-center gap-3">
                        <div className="bg-gradient-to-br from-emerald-400 to-teal-500 text-white w-9 h-9 rounded-lg flex items-center justify-center font-bold text-lg shadow-lg shadow-emerald-500/20">
                            IG
                        </div>
                        <h1 className="text-xl font-bold text-white tracking-tight font-['Outfit']">Admin Portal</h1>
                    </div>

                    <div className="flex items-center gap-4">
                        <div className="text-sm text-gray-400 hidden sm:block">
                            Logged in as <span className="font-semibold text-white">Administrator</span>
                        </div>
                        <div className="h-6 w-px bg-white/10 hidden sm:block" />
                        <button
                            onClick={handleLogout}
                            className="flex items-center gap-2 text-gray-400 hover:text-rose-400 transition-colors font-medium text-sm group"
                        >
                            <FaSignOutAlt className="group-hover:-translate-x-1 transition-transform" /> Logout
                        </button>
                    </div>
                </div>
            </header>

            {/* Main Content Area */}
            <div className="flex-1 flex overflow-hidden relative z-10 w-full max-w-7xl mx-auto">
                {/* Sidebar Navigation */}
                <aside className="w-64 border-r border-white/10 hidden md:flex flex-col relative">
                    <nav className="p-4 space-y-2.5 w-full">
                        <div className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-4 px-4">Menu</div>
                        <NavButton id="pos" icon={FaCashRegister} label="POS System" />
                        <NavButton id="orders" icon={FaClipboardList} label="Orders" />
                        <NavButton id="products" icon={FaBoxOpen} label="Products & Rewards" />
                        <NavButton id="users" icon={FaUsers} label="User Management" />
                        <NavButton id="analytics" icon={FaChartLine} label="Analytics" />
                    </nav>
                </aside>

                {/* Mobile Tab Bar */}
                <div className="md:hidden fixed bottom-0 left-0 right-0 glass-dark bg-[#0a0e18]/90 border-t border-white/10 flex justify-around p-2 z-30 pb-safe">
                    {[
                        { id: 'pos', icon: FaCashRegister, label: 'POS' },
                        { id: 'orders', icon: FaClipboardList, label: 'Orders' },
                        { id: 'products', icon: FaBoxOpen, label: 'Products' },
                        { id: 'users', icon: FaUsers, label: 'Users' },
                        { id: 'analytics', icon: FaChartLine, label: 'Stats' },
                    ].map(item => {
                        const isActive = activeTab === item.id;
                        return (
                            <button
                                key={item.id}
                                onClick={() => setActiveTab(item.id)}
                                className={`flex flex-col items-center p-2 min-w-[60px] rounded-xl transition-all ${
                                    isActive 
                                    ? 'text-emerald-400 bg-white/5 shadow-[inset_0_1px_1px_rgba(255,255,255,0.05)]' 
                                    : 'text-gray-500 hover:text-gray-300'
                                }`}
                            >
                                <item.icon size={20} className={isActive ? 'animate-bounce-subtle' : ''} />
                                <span className={`text-[10px] mt-1.5 font-bold tracking-wide uppercase ${isActive ? 'text-emerald-400' : ''}`}>{item.label}</span>
                            </button>
                        );
                    })}
                </div>

                {/* Content View */}
                <main className="flex-1 overflow-auto p-4 sm:p-6 lg:p-8 pb-24 md:pb-8 flex flex-col">
                    <div className="animate-fade-in flex-1">
                        {renderContent()}
                    </div>
                </main>
            </div>
        </div>
    );
};

export default AdminDashboard;
