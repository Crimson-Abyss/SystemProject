import React from 'react';
import { useTheme } from './ThemeContext';
import { FiSun, FiMoon } from 'react-icons/fi';

const ThemeToggle = () => {
  const { isDark, toggleTheme } = useTheme();

  return (
    <button
      onClick={toggleTheme}
      className="relative flex items-center justify-center w-10 h-10 rounded-full transition-all duration-300 hover:scale-110 bg-gray-100 dark:bg-white/10 text-gray-700 dark:text-yellow-300 hover:bg-gray-200 dark:hover:bg-white/20"
      aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
    >
      <span className={`absolute transition-all duration-300 ${isDark ? 'rotate-0 scale-100 opacity-100' : 'rotate-90 scale-0 opacity-0'}`}>
        <FiSun className="w-5 h-5" />
      </span>
      <span className={`absolute transition-all duration-300 ${!isDark ? 'rotate-0 scale-100 opacity-100' : '-rotate-90 scale-0 opacity-0'}`}>
        <FiMoon className="w-5 h-5" />
      </span>
    </button>
  );
};

export default ThemeToggle;
