import React, { useMemo, useState, useRef, useEffect } from 'react';
import PropTypes from 'prop-types';
import { useUser } from './UserContext';

// Sub-component for Form Inputs
const FormInput = ({ label, id, className = '', ...props }) => (
  <div className={className}>
    <label htmlFor={id} className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
      {label}
    </label>
    <input
      id={id}
      className="block w-full rounded-md border-gray-300 dark:border-gray-700 dark:bg-gray-900/50 dark:text-white shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
      {...props}
    />
  </div>
);

FormInput.propTypes = {
  label: PropTypes.string.isRequired,
  id: PropTypes.string.isRequired,
  className: PropTypes.string,
};

// Sub-component for History Rows
const HistoryRow = ({ date, offer, points }) => (
  <tr className="border-b border-gray-100 dark:border-gray-800 last:border-b-0">
    <td className="py-4 pr-4 text-gray-500 dark:text-gray-400">{date}</td>
    <td className="py-4 px-4 text-gray-800 dark:text-gray-200 font-medium">{offer}</td>
    <td className="py-4 pl-4 text-gray-800 dark:text-gray-200 font-medium text-right">{points}</td>
  </tr>
);

HistoryRow.propTypes = {
  date: PropTypes.string.isRequired,
  offer: PropTypes.string.isRequired,
  points: PropTypes.string.isRequired,
};

const ProfileScreen = () => {
  const { user, setUser } = useUser();
  const fileInputRef = useRef(null);
  const [history, setHistory] = useState([]);

  const profile = useMemo(() => {
    try {
      const raw = localStorage.getItem('userProfile');
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  }, []);

  useEffect(() => {
    // Fetch history only if we have a user profile with an ID
    if (profile?.id) {
      const fetchHistory = async () => {
        try {
          const response = await fetch(`/api/history/${profile.id}`);
          if (response.ok) {
            const data = await response.json();
            setHistory(data);
          }
        } catch (error) {
          console.error('Failed to fetch history:', error);
        }
      };
      fetchHistory();
    }
  }, [profile?.id]);

  const [avatar, setAvatar] = useState(profile?.avatarUrl || null);

  const handleAvatarClick = () => {
    fileInputRef.current.click();
  };

  const handleFileChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64String = reader.result;
        setAvatar(base64String);

        // Save the new avatar to localStorage
        const savedProfile = JSON.parse(localStorage.getItem('userProfile')) || {};
        const updatedProfile = { ...savedProfile, avatarUrl: base64String };
        localStorage.setItem('userProfile', JSON.stringify(updatedProfile));

        // Update the user context as well
        setUser({ ...user, avatarUrl: base64String });
      };
      reader.readAsDataURL(file);
    }
  };

  // Hidden file input
  const hiddenFileInput = (
    <input type="file" ref={fileInputRef} onChange={handleFileChange} style={{ display: 'none' }} accept="image/*" />
  );

  const fullName = profile?.fullName || '';
  const email = profile?.email || '';
  const phone = profile?.phone || '';
  const dob = profile?.dob || '';
  const gender = profile?.gender || '';
  const tier = profile?.membershipTier || 'Member';

  return (
    <main className="flex-1 p-10 overflow-y-auto">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-6">Profile</h1>
        
        <div className="flex items-center mb-8 group">
          <div
            className="relative w-20 h-20 bg-gray-300 dark:bg-gray-700 rounded-full mr-5 overflow-hidden cursor-pointer"
            onClick={handleAvatarClick}
          >
            {avatar ? (
              <img src={avatar} alt="User Avatar" className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-emerald-100 dark:bg-emerald-900/50">
                <span className="text-3xl font-bold text-emerald-700 dark:text-emerald-400">{user.initial}</span>
              </div>
            )}
            <div className="absolute inset-0 bg-black/50 flex items-center justify-center text-white text-xs font-semibold opacity-0 group-hover:opacity-100 transition-opacity">Upload</div>
          </div>
          <div>
            <h2 className="text-2xl font-semibold dark:text-white">{fullName || 'Your Name'}</h2>
            <div className="flex items-center gap-4 text-gray-600 dark:text-gray-400">
              <span>{tier}</span>
              <span className="font-bold text-emerald-600 dark:text-emerald-400">{profile?.points || 0} Points</span>
            </div>
          </div>
        </div>

        {/* Personal Information */}
        <div className="bg-white dark:bg-gray-800/50 p-8 rounded-lg shadow-sm border border-gray-200 dark:border-gray-800 mb-10">
          <h3 className="text-xl font-semibold text-gray-800 dark:text-white mb-6">Personal Information</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <FormInput label="Name" id="name" value={fullName} readOnly />
            <FormInput label="Email" id="email" type="email" value={email} readOnly />
            <FormInput label="Phone Number" id="phone" type="tel" value={phone} readOnly />
            <FormInput label="Date of Birth" id="dob" type="text" value={dob} readOnly />
            <FormInput label="Gender" id="gender" type="text" value={gender} readOnly className="md:col-span-2" />
          </div>
        </div>
        {hiddenFileInput}

        {/* Rewards History */}
        <div className="bg-white dark:bg-gray-800/50 p-8 rounded-lg shadow-sm border border-gray-200 dark:border-gray-800">
          <h3 className="text-xl font-semibold text-gray-800 dark:text-white mb-6">Rewards History</h3>
          <table className="w-full text-left">
            <thead className="border-b border-gray-200 dark:border-gray-700">
              <tr>
                <th className="py-3 pr-4 font-medium text-gray-600 dark:text-gray-400">Date</th>
                <th className="py-3 px-4 font-medium text-gray-600 dark:text-gray-400">Description</th>
                <th className="py-3 pl-4 font-medium text-gray-600 dark:text-gray-400 text-right">Points</th>
              </tr>
            </thead>
            <tbody>
              {history.length > 0 ? (
                history.map((item) => (
                  <HistoryRow
                    key={item.id}
                    date={new Date(item.createdAt).toLocaleDateString()}
                    offer={item.description}
                    points={item.pointsChange.toString()}
                  />
                ))
              ) : (
                <tr>
                  <td colSpan="3" className="py-8 text-center text-gray-500 dark:text-gray-400">
                    No rewards history yet.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </main>
  );
};

export default ProfileScreen;