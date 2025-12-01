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
        localStorage.removeItem('userProfile'); // Consistent with other parts of the app
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

    const NavButton = ({ id, icon: Icon, label, colorClass }) => (
        <button
            onClick={() => setActiveTab(id)}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all font-medium ${activeTab === id
                ? `bg-${colorClass}-50 dark:bg-${colorClass}-900/30 text-${colorClass}-600 dark:text-${colorClass}-400 shadow-sm ring-1 ring-${colorClass}-100 dark:ring-${colorClass}-800`
                : 'text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700 hover:text-gray-900 dark:hover:text-gray-200'
                }`}
        >
            <Icon className="text-lg" />
            {label}
        </button>
    );

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex flex-col transition-colors duration-200">
            {/* Top Navigation Bar */}
            <header className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700 z-10 transition-colors duration-200">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex justify-between items-center">
                    <div className="flex items-center gap-3">
                        <div className="bg-rose-600 text-white p-2 rounded-lg font-bold text-xl">IG</div>
                        <h1 className="text-xl font-bold text-gray-800 dark:text-white tracking-tight">Admin Dashboard</h1>
                    </div>

                    <div className="flex items-center gap-4">
                        <div className="text-sm text-gray-500 dark:text-gray-400 hidden sm:block">
                            Logged in as <span className="font-semibold text-gray-800 dark:text-gray-200">Admin</span>
                        </div>
                        <button
                            onClick={handleLogout}
                            className="flex items-center gap-2 text-gray-600 dark:text-gray-300 hover:text-rose-600 dark:hover:text-rose-400 transition-colors font-medium text-sm"
                        >
                            <FaSignOutAlt /> Logout
                        </button>
                    </div>
                </div>
            </header>

            {/* Main Content Area */}
            <div className="flex-1 flex overflow-hidden">
                {/* Sidebar Navigation */}
                <aside className="w-64 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 hidden md:flex flex-col transition-colors duration-200">
                    <nav className="p-4 space-y-2">
                        <NavButton id="pos" icon={FaCashRegister} label="POS System" colorClass="rose" />
                        <NavButton id="orders" icon={FaClipboardList} label="Orders" colorClass="amber" />
                        <NavButton id="products" icon={FaBoxOpen} label="Products & Rewards" colorClass="emerald" />
                        <NavButton id="users" icon={FaUsers} label="User Management" colorClass="blue" />
                        <NavButton id="analytics" icon={FaChartLine} label="Analytics" colorClass="purple" />
                    </nav>
                </aside>

                {/* Mobile Tab Bar (Visible only on small screens) */}
                <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 flex justify-around p-2 z-20 transition-colors duration-200 overflow-x-auto">
                    {[
                        { id: 'pos', icon: FaCashRegister, label: 'POS' },
                        { id: 'orders', icon: FaClipboardList, label: 'Orders' },
                        { id: 'products', icon: FaBoxOpen, label: 'Products' },
                        { id: 'users', icon: FaUsers, label: 'Users' },
                        { id: 'analytics', icon: FaChartLine, label: 'Stats' },
                    ].map(item => (
                        <button
                            key={item.id}
                            onClick={() => setActiveTab(item.id)}
                            className={`flex flex-col items-center p-2 min-w-[60px] rounded-lg ${activeTab === item.id ? 'text-rose-600 dark:text-rose-400' : 'text-gray-400 dark:text-gray-500'}`}
                        >
                            <item.icon size={20} />
                            <span className="text-xs mt-1 font-medium">{item.label}</span>
                        </button>
                    ))}
                </div>

                {/* Content View */}
                <main className="flex-1 overflow-auto p-4 sm:p-8 pb-24 md:pb-8 bg-gray-50 dark:bg-gray-900 transition-colors duration-200">
                    <div className="max-w-7xl mx-auto h-full">
                        {renderContent()}
                    </div>
                </main>
            </div>
        </div>
    );
};

export default AdminDashboard;
