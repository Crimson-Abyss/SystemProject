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
        // The name is stored as 'fullName' in the profile object
        return { name, initial, avatarUrl, points };
      }
    } catch (error) {
      console.error("Failed to parse user profile from localStorage", error);
    }
    // Default user if nothing is found
    return { name: 'User', initial: 'U', avatarUrl: null, points: 0 };
  });

  return (
    <UserContext.Provider value={{ user, setUser }}>
      {children}
    </UserContext.Provider>
  );
};

UserProvider.propTypes = {
  children: PropTypes.node.isRequired,
};

export const useUser = () => useContext(UserContext);