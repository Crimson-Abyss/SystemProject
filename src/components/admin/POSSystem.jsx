import React, { useState, useEffect } from 'react';
import { FaShoppingBag, FaTrash, FaPlus, FaMinus, FaCoffee } from 'react-icons/fa';
import ReceiptModal from './ReceiptModal';

const POSSystem = () => {
    const [menuItems, setMenuItems] = useState([]);
    const [cart, setCart] = useState([]);
    const [isProcessing, setIsProcessing] = useState(false);
    const [completedOrder, setCompletedOrder] = useState(null);

    useEffect(() => {
        const fetchProducts = async () => {
            try {
                const response = await fetch('/api/products');
                if (response.ok) {
                    const data = await response.json();
                    setMenuItems(data);
                }
            } catch (error) {
                console.error('Failed to fetch products:', error);
            }
        };
        fetchProducts();
    }, []);

    const addToCart = (item) => {
        setCart(prev => {
            const existing = prev.find(i => i.id === item.id);
            if (existing) {
                return prev.map(i => i.id === item.id ? { ...i, quantity: i.quantity + 1 } : i);
            }
            return [...prev, { ...item, quantity: 1 }];
        });
    };

    const removeFromCart = (itemId) => {
        setCart(prev => prev.filter(i => i.id !== itemId));
    };

    const updateQuantity = (itemId, delta) => {
        setCart(prev => prev.map(i => {
            if (i.id === itemId) {
                const newQty = Math.max(1, i.quantity + delta);
                return { ...i, quantity: newQty };
            }
            return i;
        }));
    };

    const totalAmount = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);

    const handleCheckout = async () => {
        if (cart.length === 0) return;
        setIsProcessing(true);

        try {
            const token = localStorage.getItem('token');
            const response = await fetch('/api/orders', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    items: cart,
                    totalAmount,
                    type: 'instore'
                })
            });

            if (response.ok) {
                const data = await response.json();
                setCompletedOrder({
                    id: data.id,
                    items: cart,
                    totalAmount,
                    pointsAwarded: data.pointsAwarded,
                    redemptionCode: data.redemptionCode
                });
                setCart([]);
            } else {
                alert('Failed to process order');
            }
        } catch (error) {
            console.error('Checkout error:', error);
            alert('Error processing checkout');
        } finally {
            setIsProcessing(false);
        }
    };

    return (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[calc(100vh-100px)]">
            {/* Menu Section */}
            <div className="lg:col-span-2 bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 p-6 overflow-y-auto transition-colors duration-200">
                <h2 className="text-xl font-bold text-gray-800 dark:text-white mb-6 flex items-center gap-2">
                    <FaCoffee className="text-rose-500" /> Menu Items
                </h2>

                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    {menuItems.map(item => (
                        <button
                            key={item.id}
                            onClick={() => addToCart(item)}
                            className="flex flex-col items-start p-4 rounded-xl border border-gray-100 dark:border-gray-700 hover:border-rose-200 dark:hover:border-rose-500/30 hover:bg-rose-50 dark:hover:bg-rose-900/20 transition-all group text-left"
                        >
                            <div className="w-full aspect-square bg-gray-100 dark:bg-gray-700 rounded-lg mb-3 flex items-center justify-center text-4xl group-hover:scale-105 transition-transform">
                                🧋
                            </div>
                            <h3 className="font-semibold text-gray-800 dark:text-gray-200">{item.name}</h3>
                            <p className="text-rose-600 dark:text-rose-400 font-bold mt-1">₱{item.price.toFixed(2)}</p>
                        </button>
                    ))}
                </div>
            </div>

            {/* Cart Section */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 flex flex-col h-full transition-colors duration-200">
                <div className="p-6 border-b border-gray-100 dark:border-gray-700">
                    <h2 className="text-xl font-bold text-gray-800 dark:text-white flex items-center gap-2">
                        <FaShoppingBag className="text-rose-500" /> Current Order
                    </h2>
                </div>

                <div className="flex-1 overflow-y-auto p-4 space-y-3">
                    {cart.length === 0 ? (
                        <div className="h-full flex flex-col items-center justify-center text-gray-400 dark:text-gray-500">
                            <FaShoppingBag className="text-4xl mb-2 opacity-20" />
                            <p>Cart is empty</p>
                        </div>
                    ) : (
                        cart.map(item => (
                            <div key={item.id} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700/50 rounded-xl">
                                <div className="flex-1">
                                    <h4 className="font-medium text-gray-800 dark:text-gray-200">{item.name}</h4>
                                    <p className="text-sm text-gray-500 dark:text-gray-400">${item.price.toFixed(2)}</p>
                                </div>
                                <div className="flex items-center gap-3">
                                    <div className="flex items-center bg-white dark:bg-gray-600 rounded-lg border border-gray-200 dark:border-gray-500">
                                        <button onClick={() => updateQuantity(item.id, -1)} className="p-2 hover:bg-gray-50 dark:hover:bg-gray-500 text-gray-600 dark:text-gray-200"><FaMinus size={10} /></button>
                                        <span className="w-8 text-center text-sm font-medium text-gray-800 dark:text-white">{item.quantity}</span>
                                        <button onClick={() => updateQuantity(item.id, 1)} className="p-2 hover:bg-gray-50 dark:hover:bg-gray-500 text-gray-600 dark:text-gray-200"><FaPlus size={10} /></button>
                                    </div>
                                    <button onClick={() => removeFromCart(item.id)} className="text-red-400 hover:text-red-600 dark:hover:text-red-300 p-2">
                                        <FaTrash />
                                    </button>
                                </div>
                            </div>
                        ))
                    )}
                </div>

                <div className="p-6 border-t border-gray-100 dark:border-gray-700 bg-gray-50 dark:bg-gray-700/30 rounded-b-2xl">
                    <div className="flex justify-between items-center mb-4 text-lg font-bold text-gray-800 dark:text-white">
                        <span>Total</span>
                        <span>${totalAmount.toFixed(2)}</span>
                    </div>
                    <button
                        onClick={handleCheckout}
                        disabled={cart.length === 0 || isProcessing}
                        className="w-full py-4 bg-rose-600 text-white rounded-xl font-bold text-lg hover:bg-rose-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg shadow-rose-200 dark:shadow-none"
                    >
                        {isProcessing ? 'Processing...' : 'Complete Order'}
                    </button>
                </div>
            </div>

            {/* Receipt Modal */}
            {completedOrder && (
                <ReceiptModal
                    order={completedOrder}
                    onClose={() => setCompletedOrder(null)}
                />
            )}
        </div>
    );
};

export default POSSystem;
