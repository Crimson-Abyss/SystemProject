import React from 'react';
import { FiPlus, FiMinus, FiTrash2, FiCreditCard, FiCoffee, FiArrowLeft } from 'react-icons/fi';
import { useCart } from './CartContext.jsx';
import { Link } from 'react-router-dom';

const CartItem = ({ item }) => {
  const { updateQuantity, removeFromCart } = useCart();

  return (
    <div className="flex items-center justify-between py-4 border-b border-gray-200 dark:border-gray-700">
      <div className="flex items-center gap-4">
        <div className="w-16 h-16 bg-gray-200 dark:bg-slate-700 rounded-md flex items-center justify-center text-gray-500">
          <FiCoffee className="w-8 h-8" />
        </div>
        <div>
          <h3 className="font-semibold text-gray-800 dark:text-white">{item.name}</h3>
          <p className="text-sm text-gray-500 dark:text-gray-400">{item.price}</p>
          <button className="text-xs text-emerald-600 dark:text-emerald-500 hover:underline mt-1">Add Note</button>
        </div>
      </div>
      <div className="flex items-center gap-4">
        <div className="flex items-center border border-gray-300 dark:border-gray-600 rounded-md">
          <button onClick={() => updateQuantity(item.id, -1)} className="p-2 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-l-md">
            <FiMinus className="w-4 h-4" />
          </button>
          <span className="font-medium w-8 text-center text-sm">{item.quantity}</span>
          <button onClick={() => updateQuantity(item.id, 1)} className="p-2 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-r-md">
            <FiPlus className="w-4 h-4" />
          </button>
        </div>
        <span className="font-bold w-20 text-right">{`₱${(parseFloat(item.price.slice(1)) * item.quantity).toFixed(2)}`}</span>
        <button onClick={() => removeFromCart(item.id)} className="text-gray-500 hover:text-red-500 dark:hover:text-red-400">
          <FiTrash2 className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
};

const Cart = () => {
  const { cartItems } = useCart();

  const subtotal = cartItems.reduce((sum, item) => sum + parseFloat(item.price.slice(1)) * item.quantity, 0);
  const tax = subtotal * 0.08; // 8% tax
  const total = subtotal + tax;

  return (
    <main className="flex-1 p-10 overflow-y-auto bg-gray-50 dark:bg-slate-900">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-3xl font-bold text-gray-800 dark:text-white">Your Cart</h1>
          <Link to="/app/products" className="flex items-center gap-2 text-sm text-emerald-600 dark:text-emerald-500 hover:underline">
            <FiArrowLeft />
            Continue Shopping
          </Link>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 lg:gap-8">
          {/* Cart Items Column */}
          <div className="lg:col-span-2">
            <div className="bg-white dark:bg-slate-800/50 p-6 rounded-lg shadow-sm border border-gray-200 dark:border-slate-800">
              {cartItems.length > 0 ? (
                cartItems.map(item => <CartItem key={item.id} item={item} />)
              ) : (
                <p className="py-8 text-center text-gray-500 dark:text-gray-400">Your cart is empty.</p>
              )}
            </div>
          </div>

          {/* Order Summary Column */}
          {cartItems.length > 0 && (
            <div className="lg:col-span-1 mt-8 lg:mt-0">
              <div className="bg-white dark:bg-slate-800 p-6 rounded-lg shadow-md border border-gray-200 dark:border-slate-700">
                <h2 className="text-xl font-semibold mb-4">Order Summary</h2>
                <div className="space-y-2 text-gray-700 dark:text-gray-300">
                  <div className="flex justify-between"><span>Subtotal</span> <span className="font-medium">₱{subtotal.toFixed(2)}</span></div>
                  <div className="flex justify-between"><span>Taxes (8%)</span> <span className="font-medium">₱{tax.toFixed(2)}</span></div>
                  <div className="flex justify-between text-lg font-bold text-gray-800 dark:text-white pt-2 border-t border-gray-200 dark:border-gray-600 mt-2"><span>Total</span> <span>₱{total.toFixed(2)}</span></div>
                </div>
                <div className="mt-6">
                  <label className="text-sm font-medium">Voucher Code</label>
                  <div className="flex gap-2 mt-1">
                    <input type="text" placeholder="Enter code" className="w-full rounded-md border-gray-300 dark:border-gray-600 dark:bg-slate-700 text-sm" />
                    <button className="px-4 py-2 rounded-md bg-gray-200 dark:bg-slate-600 text-sm font-medium hover:bg-gray-300 dark:hover:bg-slate-500">Apply</button>
                  </div>
                </div>
                <button className="mt-6 w-full inline-flex items-center justify-center px-4 py-3 rounded-md bg-emerald-600 text-white font-medium hover:bg-emerald-700">
                  <FiCreditCard className="mr-2" /> Proceed to Checkout
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