import { createContext, useContext, useState, useEffect } from 'react';
import PropTypes from 'prop-types';

const UserContext = createContext();

export const UserProvider = ({ children }) => {
  // Initialize state from localStorage or with a default value
  const [user, setUser] = useState(() => {
    try {
      const savedProfile = localStorage.getItem('userProfile');
      if (savedProfile) {
        const parsedProfile = JSON.parse(savedProfile);
        const name = parsedProfile.fullName || 'User';
        const initial = name.charAt(0).toUpperCase();
        const points = parsedProfile.points || 0;
        const avatarUrl = parsedProfile.avatarUrl || null;
        const role = parsedProfile.role || 'user';
        // The name is stored as 'fullName' in the profile object
        return { ...parsedProfile, name, initial, avatarUrl, points, role };
      }
    } catch (error) {
      console.error("Failed to parse user profile from localStorage", error);
    }
    // Default user if nothing is found
    return { name: 'User', initial: 'U', avatarUrl: null, points: 0, role: 'user' };
  });

  const refreshUser = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) return;

      const response = await fetch('/api/me', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const profile = await response.json();
        const { fullName: name, points, avatarUrl, role } = profile;
        const initial = name ? name.charAt(0).toUpperCase() : 'U';

        // Update state
        setUser({ name, initial, points, avatarUrl, role });
        // Update localStorage
        localStorage.setItem('userProfile', JSON.stringify(profile));
      }
    } catch (error) {
      console.error("Failed to refresh user", error);
    }
  };

  return (
    <UserContext.Provider value={{ user, setUser, refreshUser }}>
      {children}
    </UserContext.Provider>
  );
};

UserProvider.propTypes = {
  children: PropTypes.node.isRequired,
};

export const useUser = () => useContext(UserContext);