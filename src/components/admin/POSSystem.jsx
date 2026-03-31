import React, { useState, useEffect, useMemo } from 'react';
import { FaShoppingBag, FaTrash, FaPlus, FaMinus, FaCoffee, FaCheck, FaSearch } from 'react-icons/fa';
import ReceiptModal from './ReceiptModal';

const POSSystem = () => {
    const [menuItems, setMenuItems] = useState([]);
    const [cart, setCart] = useState([]);
    const [isProcessing, setIsProcessing] = useState(false);
    const [completedOrder, setCompletedOrder] = useState(null);
    const [activeCategory, setActiveCategory] = useState('All');
    const [searchQuery, setSearchQuery] = useState('');
    const [sizePickerItem, setSizePickerItem] = useState(null);

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

    const categories = useMemo(() => {
        const cats = ['All', ...new Set(menuItems.map(i => i.category).filter(Boolean))];
        return cats;
    }, [menuItems]);

    const filteredItems = useMemo(() => {
        let items = menuItems;
        if (activeCategory !== 'All') {
            items = items.filter(i => i.category === activeCategory);
        }
        if (searchQuery.trim()) {
            const q = searchQuery.toLowerCase();
            items = items.filter(i => i.name.toLowerCase().includes(q));
        }
        return items;
    }, [menuItems, activeCategory, searchQuery]);

    const addToCart = (item, selectedSize = null) => {
        const price = selectedSize && item.sizes ? item.sizes[selectedSize] : item.price;
        const cartId = selectedSize ? `${item.id}-${selectedSize}` : `${item.id}`;

        setCart(prev => {
            const existing = prev.find(i => i.cartId === cartId);
            if (existing) {
                return prev.map(i => i.cartId === cartId ? { ...i, quantity: i.quantity + 1 } : i);
            }
            return [...prev, {
                ...item,
                cartId,
                price: typeof price === 'number' ? price : Number(price),
                quantity: 1,
                selectedSize,
                cartName: selectedSize ? `${item.name} (${selectedSize})` : item.name,
            }];
        });
        setSizePickerItem(null);
    };

    const handleItemClick = (item) => {
        if (item.sizes && Object.keys(item.sizes).length > 1) {
            setSizePickerItem(item);
        } else if (item.sizes && Object.keys(item.sizes).length === 1) {
            const sizeKey = Object.keys(item.sizes)[0];
            addToCart(item, sizeKey);
        } else {
            addToCart(item);
        }
    };

    const removeFromCart = (cartId) => {
        setCart(prev => prev.filter(i => i.cartId !== cartId));
    };

    const updateQuantity = (cartId, delta) => {
        setCart(prev => prev.map(i => {
            if (i.cartId === cartId) {
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
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[calc(100vh-120px)] animate-fade-in-up">
            {/* Menu Section */}
            <div className="lg:col-span-2 glass-dark bg-white/ rounded-2xl shadow-xl border border-white/ p-4 sm:p-6 overflow-y-auto flex flex-col items-start w-full">
                {/* Header */}
                <div className="flex items-center justify-between w-full mb-4">
                    <h2 className="text-xl font-bold text-white flex items-center gap-2 font-['Outfit']">
                        <div className="p-2 rounded-lg bg-emerald-500/20 text-emerald-400">
                            <FaCoffee />
                        </div>
                        Quick Add Menu
                    </h2>
                    <div className="bg-white/5 px-3 py-1 rounded-full text-xs font-semibold text-gray-400 border border-white/10">
                        {filteredItems.length} items
                    </div>
                </div>

                {/* Search */}
                <div className="relative w-full mb-4">
                    <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 w-3.5 h-3.5" />
                    <input
                        type="search"
                        placeholder="Search menu..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full pl-9 pr-4 py-2 rounded-xl bg-white/5 border border-white/10 text-sm text-white placeholder:text-gray-500 focus:ring-emerald-500 focus:border-emerald-500 transition-all"
                    />
                </div>

                {/* Category Tabs */}
                <div className="flex items-center gap-2 mb-6 w-full overflow-x-auto pb-4 pt-2 px-1 shrink-0 custom-scrollbar">
                    {categories.map(cat => (
                        <button
                            key={cat}
                            onClick={() => setActiveCategory(cat)}
                            className={`px-5 py-2 text-sm shrink-0 rounded-xl font-bold whitespace-nowrap transition-all ${
                                activeCategory === cat
                                    ? 'bg-emerald-500 text-white shadow-[0_4px_12px_rgba(16,185,129,0.4)]'
                                    : 'bg-white/5 text-gray-400 hover:bg-white/10 hover:text-white border border-white/10'
                            }`}
                        >
                            {cat}
                        </button>
                    ))}
                </div>

                {/* Items Grid */}
                <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-3 w-full">
                    {filteredItems.map(item => (
                        <button
                            key={item.id}
                            onClick={() => handleItemClick(item)}
                            className="flex flex-col items-start p-3 rounded-xl border border-white/ bg-white/ hover:border-emerald-500/30 hover:bg-emerald-500/10 hover:shadow-[0_0_15px_rgba(16,185,129,0.1)] transition-all group text-left w-full hover-lift"
                        >
                            <div className="w-full aspect-square bg-linear-to-br from-white/5 to-white/ rounded-lg mb-2 flex items-center justify-center text-3xl group-hover:scale-105 transition-transform overflow-hidden relative">
                                {item.image ? <img src={item.image} alt={item.name} className="w-full h-full object-cover" /> : '🧋'}
                                {item.badge && <span className="absolute top-1 left-1 bg-emerald-500 text-white text-[8px] font-bold px-1.5 py-0.5 rounded uppercase">{item.badge}</span>}
                            </div>
                            <h3 className="font-semibold text-gray-200 text-xs leading-tight mb-1 truncate w-full">{item.name}</h3>
                            <div className="flex items-center justify-between w-full">
                                <p className="text-emerald-400 font-bold text-xs">₱{Number(item.price).toFixed(2)}</p>
                                {item.subcategory && <p className="text-[9px] text-gray-500 truncate ml-1">{item.subcategory}</p>}
                            </div>
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
                            <div key={item.cartId} className="flex flex-col p-3 bg-white/ border border-white/ rounded-xl hover:bg-white/ transition-colors animate-fade-in">
                                <div className="flex justify-between items-start mb-2">
                                    <div>
                                        <h4 className="font-medium text-gray-200 text-sm truncate pr-2">{item.cartName || item.name}</h4>
                                        {item.selectedSize && (
                                            <span className="text-[10px] text-emerald-400 font-medium">{item.selectedSize}</span>
                                        )}
                                    </div>
                                    <button onClick={() => removeFromCart(item.cartId)} className="text-gray-500 hover:text-rose-400 p-1 transition-colors">
                                        <FaTrash size={12} />
                                    </button>
                                </div>
                                <div className="flex items-center justify-between">
                                    <p className="text-sm font-bold text-emerald-400">₱{(item.price * item.quantity).toFixed(2)}</p>
                                    <div className="flex items-center bg-black/40 rounded-lg border border-white/10 p-0.5">
                                        <button onClick={() => updateQuantity(item.cartId, -1)} className="p-1.5 hover:bg-white/10 rounded-md text-gray-400 hover:text-white transition-colors"><FaMinus size={10} /></button>
                                        <span className="w-8 text-center text-sm font-bold text-white">{item.quantity}</span>
                                        <button onClick={() => updateQuantity(item.cartId, 1)} className="p-1.5 hover:bg-white/10 rounded-md text-gray-400 hover:text-white transition-colors"><FaPlus size={10} /></button>
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

            {/* Size Picker Modal */}
            {sizePickerItem && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm animate-fade-in" onClick={() => setSizePickerItem(null)}>
                    <div className="bg-[#0f1629] rounded-2xl p-6 border border-white/10 shadow-2xl max-w-sm w-full mx-4 animate-fade-in-up" onClick={e => e.stopPropagation()}>
                        <div className="flex items-center gap-3 mb-5">
                            <div className="w-16 h-16 rounded-xl overflow-hidden bg-white/5 shrink-0">
                                {sizePickerItem.image ? <img src={sizePickerItem.image} alt={sizePickerItem.name} className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center text-2xl">🧋</div>}
                            </div>
                            <div>
                                <h3 className="text-white font-bold">{sizePickerItem.name}</h3>
                                <p className="text-xs text-gray-400">{sizePickerItem.subcategory}</p>
                            </div>
                        </div>
                        <p className="text-sm text-gray-400 mb-3 font-medium">Select Size</p>
                        <div className="grid grid-cols-2 gap-3">
                            {Object.entries(sizePickerItem.sizes).map(([size, price]) => (
                                <button
                                    key={size}
                                    onClick={() => addToCart(sizePickerItem, size)}
                                    className="p-3 rounded-xl border border-white/10 bg-white/5 hover:border-emerald-500/30 hover:bg-emerald-500/10 transition-all text-left group"
                                >
                                    <p className="text-sm font-bold text-white group-hover:text-emerald-400 transition-colors">{size}</p>
                                    <p className="text-emerald-400 font-bold text-lg mt-1">₱{price}</p>
                                </button>
                            ))}
                        </div>
                        <button onClick={() => setSizePickerItem(null)} className="w-full mt-4 py-2 text-sm text-gray-400 hover:text-white transition-colors">
                            Cancel
                        </button>
                    </div>
                </div>
            )}

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
