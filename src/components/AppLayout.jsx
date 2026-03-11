import React from 'react';
import { Outlet, Link, useLocation, Navigate } from 'react-router-dom';
import Sidebar from './Sidebar.jsx';
import { FiShoppingBag } from 'react-icons/fi';
import { useCart } from './CartContext.jsx';
import { useUser } from './UserContext.jsx';

const AppLayout = () => {
  const { cartItemCount, notification } = useCart();
  const { user } = useUser();
  const location = useLocation();
  const showCartButton = location.pathname !== '/app/cart';

  // Redirect admin to admin dashboard if they try to access the app
  if (user && user.role === 'admin') {
    return <Navigate to="/admin" replace />;
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-[#0a0e18] transition-colors duration-300">
      <Sidebar />
      <div className="pt-16">
        <Outlet />
      </div>

      {/* Global Notification */}
      {notification && (
        <div className="fixed top-20 left-1/2 -translate-x-1/2 z-50 glass dark:glass bg-emerald-500/90 dark:bg-emerald-600/90 text-white px-6 py-3 rounded-full shadow-lg shadow-emerald-500/20 animate-fade-in-down font-medium">
          {notification}
        </div>
      )}

      {/* Floating Action Button for Cart */}
      {showCartButton && (
        <Link
          to="/app/cart"
          className={`fixed bottom-6 right-6 sm:bottom-8 sm:right-8 z-50 flex h-14 w-14 items-center justify-center rounded-full bg-linear-to-br from-emerald-500 to-teal-500 text-white shadow-lg shadow-emerald-500/30 transition-all duration-300 hover:scale-110 hover:shadow-xl hover:shadow-emerald-500/40 ${cartItemCount > 0 ? 'animate-pulse-glow' : ''}`}
          aria-label={`View cart with ${cartItemCount} items`}
        >
          <FiShoppingBag className="h-6 w-6" />
          {cartItemCount > 0 && (
            <span className="absolute -top-1 -right-1 flex h-6 w-6 items-center justify-center rounded-full bg-rose-500 text-xs font-bold shadow-md animate-scale-in">{cartItemCount}</span>
          )}
        </Link>
      )}
    </div>
  );
};

export default AppLayout;