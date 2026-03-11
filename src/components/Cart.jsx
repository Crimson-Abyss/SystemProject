import React from 'react';
import { FiPlus, FiMinus, FiTrash2, FiCreditCard, FiCoffee, FiArrowLeft, FiShoppingBag } from 'react-icons/fi';
import { useCart } from './CartContext.jsx';
import { Link, useNavigate } from 'react-router-dom';

const CartItem = ({ item }) => {
  const { updateQuantity, removeFromCart } = useCart();

  return (
    <div className="flex items-center justify-between py-4 border-b border-gray-100 dark:border-white/10 last:border-b-0 hover:bg-gray-50 dark:hover:bg-white/5 rounded-lg px-2 transition-colors animate-fade-in">
      <div className="flex items-center gap-3 sm:gap-4">
        <div className="w-14 h-14 sm:w-16 sm:h-16 bg-gray-100 dark:bg-white/5 rounded-xl flex items-center justify-center text-gray-400 dark:text-gray-600 shrink-0">
          <FiCoffee className="w-7 h-7" />
        </div>
        <div>
          <h3 className="font-semibold text-gray-800 dark:text-white text-sm sm:text-base">{item.name}</h3>
          <p className="text-sm text-gray-500 dark:text-gray-400">{item.price}</p>
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
        <span className="font-bold w-16 sm:w-20 text-right text-sm sm:text-base dark:text-white">{`₱${((typeof item.price === 'string' ? parseFloat(item.price.slice(1)) : item.price) * item.quantity).toFixed(2)}`}</span>
        <button onClick={() => removeFromCart(item.id)} className="text-gray-400 hover:text-rose-500 dark:hover:text-rose-400 transition-colors p-1">
          <FiTrash2 className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
};

const Cart = () => {
  const { cartItems, clearCart } = useCart();
  const [isCheckingOut, setIsCheckingOut] = React.useState(false);
  const navigate = useNavigate();

  const subtotal = cartItems.reduce((sum, item) => {
    const price = typeof item.price === 'string' ? parseFloat(item.price.slice(1)) : item.price;
    return sum + price * item.quantity;
  }, 0);
  const tax = subtotal * 0.08;
  const total = subtotal + tax;

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
          totalAmount: total,
          type: 'app'
        })
      });

      if (response.ok) {
        clearCart();
        alert('Order placed successfully! You will receive points once confirmed.');
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
                  <div className="flex justify-between"><span>Subtotal</span> <span className="font-medium">₱{subtotal.toFixed(2)}</span></div>
                  <div className="flex justify-between"><span>Taxes (8%)</span> <span className="font-medium">₱{tax.toFixed(2)}</span></div>
                  <div className="flex justify-between text-lg font-bold text-gray-800 dark:text-white pt-3 border-t border-gray-200 dark:border-white/10 mt-3"><span>Total</span> <span>₱{total.toFixed(2)}</span></div>
                </div>
                <div className="mt-6">
                  <label className="text-sm font-medium text-gray-600 dark:text-gray-400">Voucher Code</label>
                  <div className="flex gap-2 mt-1.5">
                    <input type="text" placeholder="Enter code" className="w-full rounded-xl border-gray-200 dark:border-white/10 dark:bg-white/5 text-sm dark:text-white py-2" />
                    <button className="px-4 py-2 rounded-xl bg-gray-100 dark:bg-white/5 text-sm font-medium hover:bg-gray-200 dark:hover:bg-white/10 transition-colors dark:text-gray-300">Apply</button>
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