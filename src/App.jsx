import React from 'react';
import {
  createBrowserRouter,
  RouterProvider,
} from "react-router-dom";

// App layout screens
import AppLayout from './components/AppLayout.jsx';
import HomeScreen from './components/Homescreen.jsx';
import ProfileScreen from './components/Profilescreen.jsx';
import QRScreen from './components/QRScreen.jsx';

// Public screens
import Landing from './components/Landing.jsx';
import Login from './components/Login.jsx';
import AdminLogin from './components/AdminLogin.jsx'; // Added AdminLogin import
import Signup from './components/Signup.jsx';
import Settings from './components/Settings.jsx';
import Products from './components/Products.jsx';
import Rewards from './components/Rewards.jsx';
import Locations from './components/Locations.jsx';
import Cart from './components/Cart.jsx';
import ClaimPoints from './components/ClaimPoints.jsx'; // Added ClaimPoints import
import AdminDashboard from './pages/AdminDashboard.jsx'; // Added AdminDashboard import

import { UserProvider } from './components/UserContext.jsx';
import { CartProvider } from './components/CartContext.jsx';

import { useUser } from './components/UserContext.jsx';
import { Navigate } from 'react-router-dom';

const ProtectedAdminRoute = ({ children }) => {
  const { user } = useUser();
  // Check if user is logged in and has admin role
  if (!user || user.role !== 'admin') {
    return <Navigate to="/admin/login" replace />;
  }
  return children;
};

// Routes
const router = createBrowserRouter([
  // Public
  { path: "/", element: <Landing /> },
  { path: "/login", element: <Login /> },
  { path: "/admin/login", element: <AdminLogin /> }, // Added AdminLogin route
  { path: "/signup", element: <Signup /> },
  {
    path: "/admin",
    element: (
      <ProtectedAdminRoute>
        <AdminDashboard />
      </ProtectedAdminRoute>
    )
  },

  // Application (with sidebar)
  {
    path: "/app",
    element: <AppLayout />,
    children: [
      { index: true, element: <HomeScreen /> },
      { path: "profile", element: <ProfileScreen /> },
      { path: "qr", element: <QRScreen /> },
      { path: "settings", element: <Settings /> },
      { path: "products", element: <Products /> },
      { path: "rewards", element: <Rewards /> },
      { path: "locations", element: <Locations /> },
      { path: "cart", element: <Cart /> },
      { path: "claim/:code", element: <ClaimPoints /> }, // Added ClaimPoints route
    ],
  },
]);

function App() {
  return (
    <UserProvider>
      <CartProvider>
        <RouterProvider router={router} />
      </CartProvider>
    </UserProvider>
  );
}

export default App;