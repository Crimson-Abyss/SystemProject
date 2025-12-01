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
        <span className="ml-2 md:ml-4 font-medium hidden md:inline">{text}</span>
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
  const [isOpen, setIsOpen] = React.useState(false);

  const toggleMenu = () => setIsOpen(!isOpen);
  const closeMenu = () => setIsOpen(false);

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-white/80 dark:bg-gray-900/80 backdrop-blur-md border-b border-gray-200 dark:border-gray-800">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          {/* Logo / Brand */}
          <div className="flex items-center gap-3">
            <Link to="/app" className="flex items-center gap-3" onClick={closeMenu}>
              <img src={logo} alt="InsteaG Logo" className="h-10 w-auto rounded-lg" />
              <span className="text-neutral-900 dark:text-white text-2xl font-bold tracking-tight">InsteaG</span>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:block">
            <ul className="flex items-center gap-2">
              <NavItem icon={<FiHome />} text="Home" to="/app" end />
              <NavItem icon={<BsQrCode />} text="Scan" to="/app/qr" />
              <NavItem icon={<FiGrid />} text="Menu" to="/app/products" />
              <NavItem icon={<FiMapPin />} text="Locations" to="/app/locations" />
              <NavItem icon={<FiGift />} text="Rewards" to="/app/rewards" />
              <li className="ml-2">
                <NavLink
                  to="/login"
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gray-100 text-gray-900 hover:bg-gray-200 dark:bg-white/10 dark:text-white dark:hover:bg-white/20 transition-colors font-medium"
                >
                  <FiLogOut />
                  <span>Sign Out</span>
                </NavLink>
              </li>
              <li>
                <NavLink
                  to="/app/profile"
                  className={({ isActive }) =>
                    `ml-2 flex h-10 w-10 items-center justify-center rounded-full bg-gray-100 dark:bg-white/10 overflow-hidden transition-all ${isActive ? 'ring-2 ring-emerald-500 ring-offset-2 dark:ring-offset-gray-900' : 'hover:ring-2 hover:ring-gray-300 dark:hover:ring-gray-600'}`
                  }
                  aria-label="Profile"
                >
                  {user.avatarUrl ? (
                    <img src={user.avatarUrl} alt="Avatar" className="w-full h-full object-cover" />
                  ) : (
                    <span className="font-semibold text-gray-700 dark:text-white">{user.initial}</span>
                  )}
                </NavLink>
              </li>
            </ul>
          </nav>

          {/* Mobile Menu Button */}
          <button
            onClick={toggleMenu}
            className="md:hidden p-2 rounded-lg text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
            aria-label="Toggle menu"
          >
            <div className="w-6 h-5 flex flex-col justify-between">
              <span className={`w-full h-0.5 bg-current transform transition-all duration-300 ${isOpen ? 'rotate-45 translate-y-2' : ''}`} />
              <span className={`w-full h-0.5 bg-current transition-opacity duration-300 ${isOpen ? 'opacity-0' : 'opacity-100'}`} />
              <span className={`w-full h-0.5 bg-current transform transition-all duration-300 ${isOpen ? '-rotate-45 -translate-y-2.5' : ''}`} />
            </div>
          </button>
        </div>
      </div>

      {/* Mobile Navigation Dropdown */}
      <div className={`md:hidden absolute top-16 left-0 right-0 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 shadow-lg transition-all duration-300 ease-in-out origin-top ${isOpen ? 'opacity-100 scale-y-100' : 'opacity-0 scale-y-0 pointer-events-none'}`}>
        <nav className="p-4 space-y-2">
          <Link to="/app" onClick={closeMenu} className="flex items-center gap-3 p-3 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-200">
            <FiHome size={20} /> <span className="font-medium">Home</span>
          </Link>
          <Link to="/app/qr" onClick={closeMenu} className="flex items-center gap-3 p-3 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-200">
            <BsQrCode size={20} /> <span className="font-medium">Scan QR</span>
          </Link>
          <Link to="/app/products" onClick={closeMenu} className="flex items-center gap-3 p-3 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-200">
            <FiGrid size={20} /> <span className="font-medium">Menu</span>
          </Link>
          <Link to="/app/locations" onClick={closeMenu} className="flex items-center gap-3 p-3 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-200">
            <FiMapPin size={20} /> <span className="font-medium">Locations</span>
          </Link>
          <Link to="/app/rewards" onClick={closeMenu} className="flex items-center gap-3 p-3 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-200">
            <FiGift size={20} /> <span className="font-medium">Rewards</span>
          </Link>
          <div className="h-px bg-gray-100 dark:bg-gray-800 my-2" />
          <Link to="/app/profile" onClick={closeMenu} className="flex items-center gap-3 p-3 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-200">
            <div className="w-8 h-8 rounded-full bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center text-emerald-700 dark:text-emerald-400 font-bold text-sm">
              {user.initial}
            </div>
            <span className="font-medium">My Profile</span>
          </Link>
          <Link to="/login" onClick={closeMenu} className="flex items-center gap-3 p-3 rounded-xl hover:bg-rose-50 dark:hover:bg-rose-900/20 text-rose-600 dark:text-rose-400">
            <FiLogOut size={20} /> <span className="font-medium">Sign Out</span>
          </Link>
        </nav>
      </div>
    </header>
  );
};

export default Sidebar;