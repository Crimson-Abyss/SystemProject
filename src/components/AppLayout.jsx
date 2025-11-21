import React from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar.jsx';

const AppLayout = () => {
  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900">
      <Sidebar />
      <div className="pt-16">
        <Outlet /> {/* Child routes will render here */}
      </div>
    </div>
  );
};

export default AppLayout;