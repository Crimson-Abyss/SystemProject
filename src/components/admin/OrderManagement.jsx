import React, { useEffect, useState } from 'react';
import { FaCheckCircle, FaClock, FaUser, FaBox, FaReceipt } from 'react-icons/fa';
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

    if (loading) return <div className="p-8 text-center text-gray-500">Loading orders...</div>;

    const pendingOrders = orders.filter(o => o.status === 'pending' && o.type === 'app');
    const completedOrders = orders.filter(o => o.status === 'completed' || o.type === 'instore');

    return (
        <div className="space-y-8">
            {/* Pending Orders Section */}
            <section>
                <h2 className="text-xl font-bold text-gray-800 dark:text-white mb-4 flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-amber-500 animate-pulse" />
                    Pending App Orders
                </h2>

                <div className="grid gap-4">
                    {pendingOrders.length === 0 ? (
                        <div className="p-8 bg-gray-50 dark:bg-gray-800 rounded-xl text-center text-gray-400 dark:text-gray-500 border border-dashed border-gray-200 dark:border-gray-700">
                            No pending orders right now
                        </div>
                    ) : (
                        pendingOrders.map(order => (
                            <div key={order.id} className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-amber-100 dark:border-amber-900/30 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 transition-colors duration-200">
                                <div className="flex-1">
                                    <div className="flex items-center gap-3 mb-2">
                                        <span className="bg-amber-100 dark:bg-amber-900/50 text-amber-700 dark:text-amber-400 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider">
                                            Order #{order.id}
                                        </span>
                                        <span className="text-gray-500 dark:text-gray-400 text-sm flex items-center gap-1">
                                            <FaClock size={12} /> {new Date(order.createdAt).toLocaleTimeString()}
                                        </span>
                                    </div>
                                    <div className="flex items-center gap-2 text-gray-800 dark:text-white font-medium mb-1">
                                        <FaUser className="text-gray-400" /> {order.userName || 'Unknown User'}
                                    </div>
                                    <div className="text-sm text-gray-600 dark:text-gray-300">
                                        {order.items.length} items • Total: ${order.totalAmount.toFixed(2)}
                                    </div>
                                </div>

                                <div className="flex items-center gap-4 w-full md:w-auto">
                                    <div className="flex-1 md:flex-none">
                                        <div className="text-xs text-gray-400 mb-1">Items</div>
                                        <div className="flex gap-2">
                                            {order.items.slice(0, 3).map((item, i) => (
                                                <span key={i} className="bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded text-xs text-gray-600 dark:text-gray-300">
                                                    {item.quantity}x {item.name}
                                                </span>
                                            ))}
                                            {order.items.length > 3 && <span className="text-xs text-gray-400">+{order.items.length - 3} more</span>}
                                        </div>
                                    </div>

                                    <button
                                        onClick={() => handleConfirmOrder(order.id)}
                                        className="bg-green-500 hover:bg-green-600 text-white px-6 py-3 rounded-xl font-bold shadow-lg shadow-green-200 dark:shadow-none transition-all flex items-center gap-2 whitespace-nowrap"
                                    >
                                        <FaCheckCircle /> Confirm & Ready
                                    </button>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </section>

            {/* Recent History Section */}
            <section>
                <h2 className="text-xl font-bold text-gray-800 dark:text-white mb-4 text-opacity-60">Recent History</h2>
                <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden transition-colors duration-200">
                    <table className="w-full text-left">
                        <thead className="bg-gray-50 dark:bg-gray-700/50 text-gray-500 dark:text-gray-400 text-xs uppercase tracking-wider">
                            <tr>
                                <th className="p-4">Order ID</th>
                                <th className="p-4">Type</th>
                                <th className="p-4">Customer</th>
                                <th className="p-4">Amount</th>
                                <th className="p-4">Status</th>
                                <th className="p-4">Time</th>
                                <th className="p-4 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                            {completedOrders.slice(0, 10).map(order => (
                                <tr key={order.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                                    <td className="p-4 font-mono text-sm text-gray-600 dark:text-gray-300">#{order.id}</td>
                                    <td className="p-4">
                                        <span className={`px-2 py-1 rounded text-xs font-medium ${order.type === 'instore' ? 'bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400' : 'bg-purple-50 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400'
                                            }`}>
                                            {order.type === 'instore' ? 'In-Store' : 'App Order'}
                                        </span>
                                    </td>
                                    <td className="p-4 text-sm text-gray-800 dark:text-gray-200">{order.userName || 'Walk-in Customer'}</td>
                                    <td className="p-4 text-sm font-medium text-gray-800 dark:text-gray-200">${order.totalAmount.toFixed(2)}</td>
                                    <td className="p-4">
                                        <span className="flex items-center gap-1 text-green-600 dark:text-green-400 text-xs font-bold uppercase">
                                            <FaCheckCircle /> Completed
                                        </span>
                                    </td>
                                    <td className="p-4 text-sm text-gray-400">{new Date(order.createdAt).toLocaleDateString()}</td>
                                    <td className="p-4 text-right">
                                        <button
                                            onClick={() => setSelectedOrder(order)}
                                            className="text-gray-500 hover:text-rose-600 dark:hover:text-rose-400 transition-colors"
                                            title="View Receipt"
                                        >
                                            <FaReceipt />
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
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
