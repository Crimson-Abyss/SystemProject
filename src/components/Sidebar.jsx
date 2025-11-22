import React from 'react';
import { Link, NavLink } from 'react-router-dom';
import PropTypes from 'prop-types';
import { BsQrCode } from "react-icons/bs";
import { FiHome, FiGrid, FiMapPin, FiGift, FiLogOut } from "react-icons/fi";
import logo from '../assets/logo.jpg'; // Assuming logo is in src/assets
import { useUser } from './UserContext';

const NavItem = ({ icon, text, to, end }) => {
  return (
    <li>
      <NavLink
        to={to}
        end={end}
        className={({ isActive }) =>
          [
            'flex items-center px-4 py-2 rounded-full cursor-pointer transition-colors',
            isActive
              ? 'bg-black/10 text-neutral-900 dark:bg-white/10 dark:text-white'
              : 'text-neutral-700 hover:bg-black/5 hover:text-neutral-900 dark:text-white/80 dark:hover:bg-white/10 dark:hover:text-white',
          ].join(' ')
        }
      >
        <span className="text-xl">{icon}</span>
        <span className="ml-4 font-medium">{text}</span>
      </NavLink>
    </li>
  );
};

NavItem.propTypes = {
  icon: PropTypes.element.isRequired,
  text: PropTypes.string.isRequired,
  to: PropTypes.string.isRequired,
  end: PropTypes.bool,
};

const Sidebar = () => {
  const { user } = useUser();

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-transparent backdrop-blur-sm">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          {/* Logo / Brand */}
          <div className="flex items-center gap-3">
            <Link to="/app" className="flex items-center gap-3">
              <img src={logo} alt="InsteaG Logo" className="h-10 w-auto" />
              <span className="text-neutral-900 dark:text-white text-2xl font-semibold">InsteaG</span>
            </Link>
          </div>

          {/* Navigation */}
          <nav className="">
            <ul className="flex items-center gap-2">
              <NavItem icon={<FiHome />} text="Home" to="/app" end />
              <NavItem icon={<BsQrCode />} text="Scan QR" to="/app/qr" />
              <NavItem icon={<FiGrid />} text="Menu" to="/app/products" />
              <NavItem icon={<FiMapPin />} text="Locations" to="/app/locations" />
              <NavItem icon={<FiGift />} text="Rewards" to="/app/rewards" />
              <li className="ml-2">
                <NavLink
                  to="/login"
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-black/5 text-neutral-900 hover:bg-black/10 dark:bg-white/10 dark:text-white dark:hover:bg-white/20 transition-colors"
                >
                  <FiLogOut />
                  <span>Sign Out</span>
                </NavLink>
              </li>
              <li>
                <NavLink
                  to="/app/profile"
                  className={({ isActive }) =>
                    `ml-2 flex h-8 w-8 items-center justify-center rounded-full bg-black/10 dark:bg-white/20 overflow-hidden ${isActive ? 'ring-2 ring-emerald-500' : 'ring-1 ring-black/10 dark:ring-white/20'}`
                  }
                  aria-label="Profile"
                >
                  {user.avatarUrl ? (
                    <img src={user.avatarUrl} alt="Avatar" className="w-full h-full object-cover" />
                  ) : (
                    <span className="font-semibold text-neutral-900 dark:text-white">{user.initial}</span>
                  )}
                </NavLink>
              </li>
            </ul>
          </nav>
        </div>
      </div>
    </header>
  );
};

export default Sidebar;