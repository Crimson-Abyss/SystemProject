import { createContext, useContext, useState, useCallback } from 'react';
import PropTypes from 'prop-types';

const UserContext = createContext();

// Tier color/icon mapping for frontend display
export const TIER_CONFIG = {
  Regular:  { color: 'from-gray-400 to-gray-500',    textColor: 'text-gray-500 dark:text-gray-400',      bgColor: 'bg-gray-100 dark:bg-gray-500/10',     borderColor: 'border-gray-300 dark:border-gray-600', emoji: '☕' },
  Silver:   { color: 'from-slate-300 to-slate-500',   textColor: 'text-slate-500 dark:text-slate-300',     bgColor: 'bg-slate-100 dark:bg-slate-500/10',    borderColor: 'border-slate-300 dark:border-slate-500', emoji: '🥈' },
  Gold:     { color: 'from-amber-400 to-yellow-500',  textColor: 'text-amber-600 dark:text-amber-400',     bgColor: 'bg-amber-50 dark:bg-amber-500/10',     borderColor: 'border-amber-400 dark:border-amber-500', emoji: '🥇' },
  Platinum: { color: 'from-violet-400 to-purple-600', textColor: 'text-purple-600 dark:text-purple-400',   bgColor: 'bg-purple-50 dark:bg-purple-500/10',   borderColor: 'border-purple-400 dark:border-purple-500', emoji: '💎' },
};

export const UserProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    try {
      const savedProfile = localStorage.getItem('userProfile');
      if (savedProfile) {
        const parsedProfile = JSON.parse(savedProfile);
        const name = parsedProfile.fullName || 'User';
        const initial = name.charAt(0).toUpperCase();
        const points = parsedProfile.points || 0;
        const totalSpent = parsedProfile.totalSpent || 0;
        const avatarUrl = parsedProfile.avatarUrl || null;
        const role = parsedProfile.role || 'user';
        const membershipTier = parsedProfile.membershipTier || 'Regular';
        const tierInfo = parsedProfile.tierInfo || null;
        return { ...parsedProfile, name, initial, avatarUrl, points, totalSpent, role, membershipTier, tierInfo };
      }
    } catch (error) {
      console.error("Failed to parse user profile from localStorage", error);
    }
    return { name: 'User', initial: 'U', avatarUrl: null, points: 0, totalSpent: 0, role: 'user', membershipTier: 'Regular', tierInfo: null };
  });

  const refreshUser = useCallback(async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) return;

      const response = await fetch('/api/me', {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (response.ok) {
        const profile = await response.json();
        const { fullName: name, points, totalSpent, avatarUrl, role, membershipTier, tierInfo } = profile;
        const initial = name ? name.charAt(0).toUpperCase() : 'U';

        setUser({ ...profile, name, initial, points, totalSpent: totalSpent || 0, avatarUrl, role, membershipTier, tierInfo });
        localStorage.setItem('userProfile', JSON.stringify(profile));
      }
    } catch (error) {
      console.error("Failed to refresh user", error);
    }
  }, []);

  return (
    <UserContext.Provider value={{ user, setUser, refreshUser }}>
      {children}
    </UserContext.Provider>
  );
};

UserProvider.propTypes = {
  children: PropTypes.node.isRequired,
};

// eslint-disable-next-line react-refresh/only-export-components
export const useUser = () => useContext(UserContext);