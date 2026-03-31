import React, { useState } from 'react';
import { FiPlus, FiMinus, FiTrash2, FiCreditCard, FiCoffee, FiArrowLeft, FiShoppingBag, FiZap } from 'react-icons/fi';
import { useCart } from './CartContext.jsx';
import { useUser, TIER_CONFIG } from './UserContext';
import { Link, useNavigate } from 'react-router-dom';

const CartItem = ({ item }) => {
  const { updateQuantity, removeFromCart } = useCart();
  const price = typeof item.price === 'string' ? parseFloat(item.price.replace('₱', '')) : item.price;

  return (
    <div className="flex items-center justify-between py-4 border-b border-gray-100 dark:border-white/10 last:border-b-0 hover:bg-gray-50 dark:hover:bg-white/5 rounded-lg px-2 transition-colors animate-fade-in">
      <div className="flex items-center gap-3 sm:gap-4">
        <div className="w-14 h-14 sm:w-16 sm:h-16 bg-gray-100 dark:bg-white/5 rounded-xl flex items-center justify-center overflow-hidden shrink-0">
          {item.image ? (
            <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
          ) : (
            <FiCoffee className="w-7 h-7 text-gray-400 dark:text-gray-600" />
          )}
        </div>
        <div>
          <h3 className="font-semibold text-gray-800 dark:text-white text-sm sm:text-base">
            {item.cartName || item.name}
          </h3>
          {item.selectedSize && (
            <span className="text-xs text-emerald-600 dark:text-emerald-400 font-medium">{item.selectedSize}</span>
          )}
          <p className="text-sm text-gray-500 dark:text-gray-400">₱{price.toFixed(2)}</p>
        </div>
      </div>
      <div className="flex items-center gap-2 sm:gap-4">
        <div className="flex items-center border border-gray-200 dark:border-white/10 rounded-xl overflow-hidden">
          <button onClick={() => updateQuantity(item.id, -1)} className="p-2 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-white/5 transition-colors">
            <FiMinus className="w-4 h-4" />
          </button>
          <span className="font-medium w-8 text-center text-sm dark:text-white">{item.quantity}</span>
          <button onClick={() => updateQuantity(item.id, 1)} className="p-2 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-white/5 transition-colors">
            <FiPlus className="w-4 h-4" />
          </button>
        </div>
        <span className="font-bold w-16 sm:w-20 text-right text-sm sm:text-base dark:text-white">
          ₱{(price * item.quantity).toFixed(2)}
        </span>
        <button onClick={() => removeFromCart(item.id)} className="text-gray-400 hover:text-rose-500 dark:hover:text-rose-400 transition-colors p-1">
          <FiTrash2 className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
};

const Cart = () => {
  const { cartItems, clearCart } = useCart();
  const { user, refreshUser } = useUser();
  const [isCheckingOut, setIsCheckingOut] = useState(false);
  const [usePoints, setUsePoints] = useState(false);
  const [pointsToUse, setPointsToUse] = useState(0);
  const navigate = useNavigate();

  const subtotal = cartItems.reduce((sum, item) => {
    const price = typeof item.price === 'string' ? parseFloat(item.price.replace('₱', '')) : item.price;
    return sum + price * item.quantity;
  }, 0);

  const tierDiscount = user.tierInfo?.discount || 0;
  const discountAmount = subtotal * (tierDiscount / 100);
  const afterTierDiscount = subtotal - discountAmount;

  const maxPointsUsable = Math.min(user.points || 0, Math.floor(afterTierDiscount));
  const pointsDiscount = usePoints ? Math.min(pointsToUse, maxPointsUsable) : 0;

  const total = Math.max(0, afterTierDiscount - pointsDiscount);

  const handlePointsToggle = () => {
    if (!usePoints) {
      setPointsToUse(maxPointsUsable);
    }
    setUsePoints(!usePoints);
  };

  const handleCheckout = async () => {
    setIsCheckingOut(true);
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        navigate('/login');
        return;
      }

      const response = await fetch('/api/orders', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          items: cartItems,
          totalAmount: afterTierDiscount,
          pointsUsed: pointsDiscount,
          type: 'app'
        })
      });

      if (response.ok) {
        const data = await response.json();
        clearCart();
        setUsePoints(false);
        setPointsToUse(0);
        await refreshUser();
        alert(`Order placed! ${pointsDiscount > 0 ? `${pointsDiscount} points used. ` : ''}You'll earn ${data.pointsAwarded} points once confirmed.`);
        navigate('/app');
      } else {
        const errorData = await response.json().catch(() => ({}));
        alert(errorData.message || 'Failed to place order.');
      }
    } catch (error) {
      console.error('Checkout error:', error);
      alert(`Error processing checkout: ${error.message}`);
    } finally {
      setIsCheckingOut(false);
    }
  };

  const tierConfig = TIER_CONFIG[user.membershipTier || 'Regular'] || TIER_CONFIG.Regular;

  return (
    <main className="flex-1 p-6 sm:p-10 overflow-y-auto bg-gray-50 dark:bg-[#0a0e18]">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center justify-between mb-6 animate-fade-in">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 dark:text-white font-[Outfit]">Your Cart</h1>
          <Link to="/app/products" className="flex items-center gap-2 text-sm text-emerald-600 dark:text-emerald-400 hover:underline font-medium">
            <FiArrowLeft />
            Continue Shopping
          </Link>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 lg:gap-8">
          {/* Cart Items Column */}
          <div className="lg:col-span-2 animate-fade-in-up">
            <div className="glass dark:glass bg-white/80 dark:bg-white/5 p-4 sm:p-6 rounded-2xl border border-gray-200/50 dark:border-white/10">
              {cartItems.length > 0 ? (
                cartItems.map(item => <CartItem key={item.id} item={item} />)
              ) : (
                <div className="py-16 text-center">
                  <div className="w-20 h-20 mx-auto rounded-full bg-gray-100 dark:bg-white/5 flex items-center justify-center mb-4">
                    <FiShoppingBag className="w-10 h-10 text-gray-400 dark:text-gray-600" />
                  </div>
                  <p className="text-gray-600 dark:text-gray-400 font-medium text-lg">Your cart is empty</p>
                  <p className="text-gray-500 dark:text-gray-500 text-sm mt-1">Add some delicious items from our menu!</p>
                  <Link to="/app/products" className="btn-primary inline-flex items-center gap-2 mt-6 text-sm">
                    <FiCoffee /> Browse Menu
                  </Link>
                </div>
              )}
            </div>
          </div>

          {/* Order Summary Column */}
          {cartItems.length > 0 && (
            <div className="lg:col-span-1 mt-6 lg:mt-0 animate-fade-in-up delay-200">
              <div className="glass dark:glass bg-white/80 dark:bg-white/5 p-6 rounded-2xl border border-gray-200/50 dark:border-white/10 sticky top-24">
                <h2 className="text-lg font-bold text-gray-800 dark:text-white mb-4 font-[Outfit]">Order Summary</h2>

                <div className="space-y-3 text-gray-600 dark:text-gray-300 text-sm">
                  <div className="flex justify-between">
                    <span>Subtotal</span>
                    <span className="font-medium">₱{subtotal.toFixed(2)}</span>
                  </div>

                  {/* Tier Discount */}
                  {tierDiscount > 0 && (
                    <div className="flex justify-between text-emerald-600 dark:text-emerald-400">
                      <span className="flex items-center gap-1">
                        <span className="text-sm">{tierConfig.emoji}</span>
                        {user.membershipTier} Discount ({tierDiscount}%)
                      </span>
                      <span className="font-medium">-₱{discountAmount.toFixed(2)}</span>
                    </div>
                  )}

                  {/* Points Redemption */}
                  {(user.points || 0) > 0 && (
                    <div className="pt-3 border-t border-gray-200 dark:border-white/10">
                      <div className="flex items-center justify-between mb-2">
                        <label className="flex items-center gap-2 cursor-pointer text-sm font-medium">
                          <FiZap className="text-amber-500 w-4 h-4" />
                          Use Points
                        </label>
                        <button
                          onClick={handlePointsToggle}
                          className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${usePoints ? 'bg-emerald-500' : 'bg-gray-300 dark:bg-white/10'}`}
                        >
                          <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform shadow ${usePoints ? 'translate-x-6' : 'translate-x-1'}`} />
                        </button>
                      </div>

                      {usePoints && (
                        <div className="space-y-2 animate-fade-in">
                          <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
                            <span>Available: {user.points} pts</span>
                            <span>Max usable: {maxPointsUsable} pts</span>
                          </div>
                          <input
                            type="range"
                            min={0}
                            max={maxPointsUsable}
                            value={pointsToUse}
                            onChange={(e) => setPointsToUse(parseInt(e.target.value))}
                            className="w-full h-2 rounded-full appearance-none bg-gray-200 dark:bg-white/10 accent-emerald-500"
                          />
                          <div className="flex justify-between text-xs">
                            <span className="text-gray-500">0 pts</span>
                            <span className="font-bold text-emerald-600 dark:text-emerald-400">
                              -{pointsDiscount} pts (₱{pointsDiscount.toFixed(2)} off)
                            </span>
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  <div className="flex justify-between text-lg font-bold text-gray-800 dark:text-white pt-3 border-t border-gray-200 dark:border-white/10 mt-3">
                    <span>Total</span>
                    <span>₱{total.toFixed(2)}</span>
                  </div>
                </div>

                <button
                  onClick={handleCheckout}
                  disabled={isCheckingOut}
                  className="mt-6 w-full btn-primary py-3 text-base flex items-center justify-center gap-2 animate-pulse-glow disabled:opacity-50 disabled:animate-none"
                >
                  <FiCreditCard />
                  {isCheckingOut ? (
                    <span className="flex items-center gap-2">
                      <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" /></svg>
                      Processing...
                    </span>
                  ) : 'Proceed to Checkout'}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </main>
  );
};

export default Cart;