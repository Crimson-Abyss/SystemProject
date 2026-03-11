import React, { Suspense, lazy } from 'react';
import {
  createBrowserRouter,
  RouterProvider,
} from "react-router-dom";

// Eagerly loaded (needed immediately)
import { UserProvider } from './components/UserContext.jsx';
import { CartProvider } from './components/CartContext.jsx';
import { ThemeProvider } from './components/ThemeContext.jsx';
import LoadingScreen from './components/LoadingScreen.jsx';

import { useUser } from './components/UserContext.jsx';
import { Navigate } from 'react-router-dom';

// Lazy loaded pages
const AppLayout = lazy(() => import('./components/AppLayout.jsx'));
const HomeScreen = lazy(() => import('./components/Homescreen.jsx'));
const ProfileScreen = lazy(() => import('./components/Profilescreen.jsx'));
const QRScreen = lazy(() => import('./components/QRScreen.jsx'));
const Landing = lazy(() => import('./components/Landing.jsx'));
const Login = lazy(() => import('./components/Login.jsx'));
const AdminLogin = lazy(() => import('./components/AdminLogin.jsx'));
const Signup = lazy(() => import('./components/Signup.jsx'));
const Settings = lazy(() => import('./components/Settings.jsx'));
const Products = lazy(() => import('./components/Products.jsx'));
const Rewards = lazy(() => import('./components/Rewards.jsx'));
const Locations = lazy(() => import('./components/Locations.jsx'));
const Cart = lazy(() => import('./components/Cart.jsx'));
const ClaimPoints = lazy(() => import('./components/ClaimPoints.jsx'));
const AdminDashboard = lazy(() => import('./pages/AdminDashboard.jsx'));

const ProtectedAdminRoute = ({ children }) => {
  const { user } = useUser();
  if (!user || user.role !== 'admin') {
    return <Navigate to="/admin/login" replace />;
  }
  return children;
};

// Suspense wrapper
const SuspensePage = ({ children }) => (
  <Suspense fallback={<LoadingScreen />}>
    {children}
  </Suspense>
);

// Routes
const router = createBrowserRouter([
  // Public
  { path: "/", element: <SuspensePage><Landing /></SuspensePage> },
  { path: "/login", element: <SuspensePage><Login /></SuspensePage> },
  { path: "/admin/login", element: <SuspensePage><AdminLogin /></SuspensePage> },
  { path: "/signup", element: <SuspensePage><Signup /></SuspensePage> },
  {
    path: "/admin",
    element: (
      <SuspensePage>
        <ProtectedAdminRoute>
          <AdminDashboard />
        </ProtectedAdminRoute>
      </SuspensePage>
    )
  },

  // Application (with sidebar)
  {
    path: "/app",
    element: <SuspensePage><AppLayout /></SuspensePage>,
    children: [
      { index: true, element: <SuspensePage><HomeScreen /></SuspensePage> },
      { path: "profile", element: <SuspensePage><ProfileScreen /></SuspensePage> },
      { path: "qr", element: <SuspensePage><QRScreen /></SuspensePage> },
      { path: "settings", element: <SuspensePage><Settings /></SuspensePage> },
      { path: "products", element: <SuspensePage><Products /></SuspensePage> },
      { path: "rewards", element: <SuspensePage><Rewards /></SuspensePage> },
      { path: "locations", element: <SuspensePage><Locations /></SuspensePage> },
      { path: "cart", element: <SuspensePage><Cart /></SuspensePage> },
      { path: "claim/:code", element: <SuspensePage><ClaimPoints /></SuspensePage> },
    ],
  },
]);

function App() {
  return (
    <ThemeProvider>
      <UserProvider>
        <CartProvider>
          <RouterProvider router={router} />
        </CartProvider>
      </UserProvider>
    </ThemeProvider>
  );
}

export default App;