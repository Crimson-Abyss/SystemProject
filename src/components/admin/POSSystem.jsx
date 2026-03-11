import React, { useState, useEffect } from 'react';
import { FaShoppingBag, FaTrash, FaPlus, FaMinus, FaCoffee, FaCheck } from 'react-icons/fa';
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

    const totalAmount = cart.reduce((sum, item) => sum + ((typeof item.price === 'string' ? parseFloat(item.price.slice(1)) : item.price) * item.quantity), 0);

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
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[calc(100vh-120px)] animate-fade-in-up">
            {/* Menu Section */}
            <div className="lg:col-span-2 glass-dark bg-white/ rounded-2xl shadow-xl border border-white/ p-4 sm:p-6 overflow-y-auto flex flex-col items-start w-full">
                <div className="flex items-center justify-between w-full mb-6">
                    <h2 className="text-xl font-bold text-white flex items-center gap-2 font-['Outfit']">
                        <div className="p-2 rounded-lg bg-emerald-500/20 text-emerald-400">
                            <FaCoffee />
                        </div>
                        Quick Add Menu
                    </h2>
                    <div className="bg-white/5 px-3 py-1 rounded-full text-xs font-semibold text-gray-400 border border-white/10">
                        {menuItems.length} items
                    </div>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4 w-full">
                    {menuItems.map(item => (
                        <button
                            key={item.id}
                            onClick={() => addToCart(item)}
                            className="flex flex-col items-start p-4 rounded-xl border border-white/ bg-white/ hover:border-emerald-500/30 hover:bg-emerald-500/10 hover:shadow-[0_0_15px_rgba(16,185,129,0.1)] transition-all group text-left w-full hover-lift"
                        >
                            <div className="w-full aspect-square bg-linear-to-br from-white/5 to-white/ rounded-lg mb-3 flex items-center justify-center text-4xl group-hover:scale-105 transition-transform overflow-hidden relative">
                                {item.imageUrl ? <img src={item.imageUrl} alt={item.name} className="w-full h-full object-cover" /> : '🧋'}
                                {item.badge && <span className="absolute top-1 left-1 bg-emerald-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded uppercase">{item.badge}</span>}
                            </div>
                            <h3 className="font-semibold text-gray-200 text-sm leading-tight mb-1 truncate w-full">{item.name}</h3>
                            <p className="text-emerald-400 font-bold text-sm">₱{(typeof item.price === 'string' ? parseFloat(item.price.slice(1)) : item.price).toFixed(2)}</p>
                        </button>
                    ))}
                </div>
            </div>

            {/* Cart Section */}
            <div className="glass-dark bg-[#0a0f1b]/80 rounded-2xl shadow-xl border border-white/ flex flex-col h-full w-full">
                <div className="p-5 border-b border-white/ flex items-center justify-between">
                    <h2 className="text-lg font-bold text-white flex items-center gap-2 font-['Outfit']">
                        <FaShoppingBag className="text-emerald-400" /> Current Order
                    </h2>
                    <span className="bg-emerald-500/20 text-emerald-400 text-xs font-bold px-2 py-1 rounded-full">{cart.reduce((s,i)=>s+i.quantity,0)} items</span>
                </div>

                <div className="flex-1 overflow-y-auto p-4 space-y-3 custom-scrollbar">
                    {cart.length === 0 ? (
                        <div className="h-full flex flex-col items-center justify-center text-gray-500">
                            <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center mb-3">
                                <FaShoppingBag className="text-2xl opacity-40" />
                            </div>
                            <p className="font-medium text-sm">Cart is empty</p>
                        </div>
                    ) : (
                        cart.map(item => (
                            <div key={item.id} className="flex flex-col p-3 bg-white/ border border-white/ rounded-xl hover:bg-white/ transition-colors animate-fade-in">
                                <div className="flex justify-between items-start mb-2">
                                    <h4 className="font-medium text-gray-200 text-sm truncate pr-2">{item.name}</h4>
                                    <button onClick={() => removeFromCart(item.id)} className="text-gray-500 hover:text-rose-400 p-1 transition-colors">
                                        <FaTrash size={12} />
                                    </button>
                                </div>
                                <div className="flex items-center justify-between">
                                    <p className="text-sm font-bold text-emerald-400">₱{((typeof item.price === 'string' ? parseFloat(item.price.slice(1)) : item.price) * item.quantity).toFixed(2)}</p>
                                    <div className="flex items-center bg-black/40 rounded-lg border border-white/10 p-0.5">
                                        <button onClick={() => updateQuantity(item.id, -1)} className="p-1.5 hover:bg-white/10 rounded-md text-gray-400 hover:text-white transition-colors"><FaMinus size={10} /></button>
                                        <span className="w-8 text-center text-sm font-bold text-white">{item.quantity}</span>
                                        <button onClick={() => updateQuantity(item.id, 1)} className="p-1.5 hover:bg-white/10 rounded-md text-gray-400 hover:text-white transition-colors"><FaPlus size={10} /></button>
                                    </div>
                                </div>
                            </div>
                        ))
                    )}
                </div>

                <div className="p-5 border-t border-white/ bg-black/20 rounded-b-2xl">
                    <div className="flex justify-between items-center mb-4 text-white">
                        <span className="text-sm text-gray-400 font-medium">Subtotal</span>
                        <span className="text-lg font-bold">₱{totalAmount.toFixed(2)}</span>
                    </div>
                    <button
                        onClick={handleCheckout}
                        disabled={cart.length === 0 || isProcessing}
                        className="w-full py-4 btn-primary rounded-xl font-bold text-base flex items-center justify-center gap-2 group disabled:opacity-50 disabled:animate-none"
                    >
                        {isProcessing ? (
                            <span className="flex items-center gap-2">
                              <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" /></svg>
                              Processing...
                            </span>
                        ) : (
                            <>
                                <FaCheck className="group-hover:scale-125 transition-transform" /> Complete Order
                            </>
                        )}
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
