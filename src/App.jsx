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
import Signup from './components/Signup.jsx';
import Settings from './components/Settings.jsx';
import Products from './components/Products.jsx';
import Rewards from './components/Rewards.jsx';
import Locations from './components/Locations.jsx';

import { UserProvider } from './components/UserContext';

// Routes
const router = createBrowserRouter([
  // Public
  { path: "/", element: <Landing /> },
  { path: "/login", element: <Login /> },
  { path: "/signup", element: <Signup /> },

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
    ],
  },
]);

function App() {
  return (
    <UserProvider>
      <RouterProvider router={router} />
    </UserProvider>
  );
}

export default App;