import React, { useEffect, useState } from 'react';
import { FaCheckCircle, FaClock, FaUser, FaReceipt } from 'react-icons/fa';
import ReceiptModal from './ReceiptModal';

const OrderManagement = () => {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedOrder, setSelectedOrder] = useState(null);

    const fetchOrders = async () => {
        try {
            const token = localStorage.getItem('token');
            const response = await fetch('/api/orders', {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (response.ok) {
                const data = await response.json();
                setOrders(data);
            }
        } catch (error) {
            console.error('Error fetching orders:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchOrders();
        const interval = setInterval(fetchOrders, 10000); // Poll every 10s
        return () => clearInterval(interval);
    }, []);

    const handleConfirmOrder = async (orderId) => {
        try {
            const token = localStorage.getItem('token');
            const response = await fetch(`/api/orders/${orderId}/confirm`, {
                method: 'PUT',
                headers: { 'Authorization': `Bearer ${token}` }
            });

            if (response.ok) {
                setOrders(prev => prev.map(o =>
                    o.id === orderId ? { ...o, status: 'completed' } : o
                ));
            }
        } catch (error) {
            console.error('Error confirming order:', error);
            alert('Failed to confirm order');
        }
    };

    if (loading) return (
        <div className="flex flex-col items-center justify-center p-12 text-gray-500 animate-pulse">
            <div className="w-12 h-12 border-4 border-emerald-500/20 border-t-emerald-500 rounded-full animate-spin mb-4" />
            <p className="font-medium text-sm">Loading orders...</p>
        </div>
    );

    const pendingOrders = orders.filter(o => o.status === 'pending' && o.type === 'app');
    const completedOrders = orders.filter(o => o.status === 'completed' || o.type === 'instore');

    return (
        <div className="space-y-8 animate-fade-in-up">
            {/* Pending Orders Section */}
            <section>
                <div className="flex items-center gap-3 mb-5">
                    <div className="flex h-3 w-3 relative">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-3 w-3 bg-amber-500"></span>
                    </div>
                    <h2 className="text-xl font-bold text-white font-['Outfit']">Pending App Orders</h2>
                    <span className="bg-amber-500/20 text-amber-400 text-xs font-bold px-2 py-0.5 rounded-full border border-amber-500/30">
                        {pendingOrders.length}
                    </span>
                </div>

                <div className="grid gap-4">
                    {pendingOrders.length === 0 ? (
                        <div className="p-8 glass-dark bg-white/ rounded-2xl text-center text-gray-500 border border-dashed border-white/10 flex flex-col items-center justify-center">
                            <FaCheckCircle className="text-3xl mb-3 opacity-20" />
                            <p className="font-medium">All caught up! No pending orders right now.</p>
                        </div>
                    ) : (
                        pendingOrders.map(order => (
                            <div key={order.id} className="glass-dark bg-amber-500/ p-5 sm:p-6 rounded-2xl shadow-xl border border-amber-500/20 flex flex-col lg:flex-row justify-between items-start lg:items-center gap-5 transition-all hover:bg-amber-500/">
                                <div className="flex-1">
                                    <div className="flex flex-wrap items-center gap-3 mb-3">
                                        <span className="bg-amber-500/20 text-amber-400 border border-amber-500/30 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider shadow-[0_0_10px_rgba(245,158,11,0.2)]">
                                            Order #{order.id}
                                        </span>
                                        <span className="text-gray-400 text-sm flex items-center gap-1.5 font-medium">
                                            <FaClock className="text-gray-500" /> {new Date(order.createdAt).toLocaleTimeString()}
                                        </span>
                                    </div>
                                    <div className="flex items-center gap-2 text-gray-200 font-bold text-lg mb-1">
                                        <div className="w-6 h-6 rounded-full bg-white/10 flex items-center justify-center">
                                            <FaUser className="text-xs text-white" />
                                        </div>
                                        {order.userName || 'Unknown User'}
                                    </div>
                                    <div className="text-sm text-gray-400 font-medium">
                                        {order.items.length} items • <span className="text-emerald-400 font-bold">₱{order.totalAmount.toFixed(2)}</span>
                                    </div>
                                </div>

                                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 sm:gap-6 w-full lg:w-auto">
                                    <div className="flex-1 sm:flex-none">
                                        <div className="text-xs font-semibold text-gray-500 mb-2 uppercase tracking-wider">Order Items</div>
                                        <div className="flex flex-wrap gap-2">
                                            {order.items.slice(0, 3).map((item, i) => (
                                                <span key={i} className="bg-white/5 border border-white/10 px-2.5 py-1 rounded-lg text-xs font-medium text-gray-300">
                                                    <span className="text-amber-400 mr-1">{item.quantity}x</span> {item.name}
                                                </span>
                                            ))}
                                            {order.items.length > 3 && <span className="text-xs text-gray-500 px-2 py-1 flex items-center bg-white/5 rounded-lg border border-white/5 disabled select-none">+{order.items.length - 3} more</span>}
                                        </div>
                                    </div>

                                    <button
                                        onClick={() => handleConfirmOrder(order.id)}
                                        className="w-full sm:w-auto bg-linear-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-white px-6 py-3 rounded-xl font-bold shadow-lg shadow-emerald-500/20 transition-all flex items-center justify-center gap-2 whitespace-nowrap group"
                                    >
                                        <FaCheckCircle className="group-hover:scale-110 transition-transform" /> Confirm & Ready
                                    </button>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </section>

            {/* Recent History Section */}
            <section className="pt-4">
                <h2 className="text-xl font-bold text-white mb-5 font-['Outfit'] flex items-center gap-2">
                    Recent History
                </h2>
                <div className="glass-dark bg-white/ rounded-2xl shadow-xl border border-white/ overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead className="bg-black/40 border-b border-white/ text-gray-400 text-xs uppercase tracking-wider font-bold">
                                <tr>
                                    <th className="p-4 whitespace-nowrap">Order ID</th>
                                    <th className="p-4 whitespace-nowrap">Type</th>
                                    <th className="p-4 whitespace-nowrap">Customer</th>
                                    <th className="p-4 whitespace-nowrap">Amount</th>
                                    <th className="p-4 whitespace-nowrap">Status</th>
                                    <th className="p-4 whitespace-nowrap">Time</th>
                                    <th className="p-4 text-right whitespace-nowrap">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-white/">
                                {completedOrders.length > 0 ? completedOrders.slice(0, 10).map(order => (
                                    <tr key={order.id} className="hover:bg-white/ transition-colors group">
                                        <td className="p-4 font-mono text-sm text-gray-400">#{order.id}</td>
                                        <td className="p-4">
                                            <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider border ${order.type === 'instore' ? 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20' : 'bg-purple-500/10 text-purple-400 border-purple-500/20'}`}>
                                                {order.type === 'instore' ? 'In-Store' : 'App Order'}
                                            </span>
                                        </td>
                                        <td className="p-4 text-sm font-medium text-gray-200">{order.userName || 'Walk-in Customer'}</td>
                                        <td className="p-4 text-sm font-bold text-emerald-400">₱{order.totalAmount.toFixed(2)}</td>
                                        <td className="p-4">
                                            <span className="flex items-center gap-1.5 text-emerald-400 text-[10px] font-bold uppercase tracking-wider">
                                                <FaCheckCircle /> Completed
                                            </span>
                                        </td>
                                        <td className="p-4 text-sm font-medium text-gray-500">{new Date(order.createdAt).toLocaleDateString()}</td>
                                        <td className="p-4 text-right">
                                            <button
                                                onClick={() => setSelectedOrder(order)}
                                                className="p-2 rounded-lg text-gray-400 hover:text-emerald-400 hover:bg-emerald-500/10 transition-colors"
                                                title="View Receipt"
                                            >
                                                <FaReceipt className="w-4 h-4" />
                                            </button>
                                        </td>
                                    </tr>
                                )) : (
                                    <tr>
                                        <td colSpan="7" className="p-8 text-center text-gray-500 text-sm font-medium">No completed orders yet.</td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </section>

            {selectedOrder && (
                <ReceiptModal
                    order={selectedOrder}
                    onClose={() => setSelectedOrder(null)}
                />
            )}
        </div>
    );
};

export default OrderManagement;
