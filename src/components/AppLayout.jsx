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
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900">
      <Sidebar />
      <div className="pt-16">
        <Outlet /> {/* Child routes will render here */}
      </div>

      {/* Global Notification */}
      {notification && (
        <div className="fixed top-20 left-1/2 -translate-x-1/2 z-50 bg-emerald-600 text-white px-6 py-3 rounded-full shadow-lg transition-opacity duration-300">
          {notification}
        </div>
      )}

      {/* Floating Action Button for Cart */}
      {showCartButton && (
        <Link
          to="/app/cart"
          className="fixed bottom-8 right-8 z-50 flex h-14 w-14 items-center justify-center rounded-full bg-emerald-600 text-white shadow-lg transition-transform hover:scale-110 hover:bg-emerald-700"
          aria-label={`View cart with ${cartItemCount} items`}
        >
          <FiShoppingBag className="h-6 w-6" />
          {cartItemCount > 0 && (
            <span className="absolute -top-1 -right-1 flex h-6 w-6 items-center justify-center rounded-full bg-rose-500 text-xs font-bold">{cartItemCount}</span>
          )}
        </Link>
      )}
    </div>
  );
};

export default AppLayout;