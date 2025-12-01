import React, { useMemo, useState, useRef, useEffect } from 'react';
import PropTypes from 'prop-types';
import { useUser } from './UserContext';
import { FiFileText, FiEdit3 } from 'react-icons/fi';

// Sub-component for Form Inputs
const FormInput = ({ label, id, className = '', ...props }) => (
  <div className={className}>
    <label htmlFor={id} className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
      {label}
    </label>
    <input
      id={id}
      className="block w-full rounded-md border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white shadow-sm focus:border-emerald-500 focus:ring-emerald-500 sm:text-sm disabled:bg-gray-100 disabled:dark:bg-gray-800/50"
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
  const [isEditing, setIsEditing] = useState(false);

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
          const token = localStorage.getItem('token');
          const response = await fetch(`/api/history/${profile.id}`, {
            headers: {
              'Authorization': `Bearer ${token}`
            }
          });
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

  const uid = profile?.uid || '';
  const fullName = profile?.fullName || '';
  const email = profile?.email || '';
  const dob = profile?.dob || '';
  const gender = profile?.gender || '';
  const tier = profile?.membershipTier || 'Member';
  const points = profile?.points || 0;

  const nextTierCost = 1000; // Example: Platinum tier at 1000 points
  const progress = (points / nextTierCost) * 100;

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
            <div className="flex items-center gap-4 mt-1">
              <span className="bg-emerald-500/20 text-emerald-400 border border-emerald-500/50 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider">{tier}</span>
              <span className="font-bold text-emerald-600 dark:text-emerald-400">{points} Points</span>
            </div>
            <div className="w-full max-w-xs bg-gray-200 dark:bg-slate-700 rounded-full h-1.5 mt-3">
              <div className="bg-emerald-500 h-1.5 rounded-full" style={{ width: `${progress}%` }}></div>
            </div>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">{nextTierCost - points} points to Platinum</p>
          </div>
        </div>

        {/* Personal Information */}
        <div className="bg-white dark:bg-gray-800/50 p-8 rounded-lg shadow-sm border border-gray-200 dark:border-gray-800 mb-10">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-semibold text-gray-800 dark:text-white">Personal Information</h3>
            {!isEditing && (
              <button onClick={() => setIsEditing(true)} className="flex items-center gap-2 text-sm font-medium text-emerald-600 hover:text-emerald-500">
                <FiEdit3 /> Edit Profile
              </button>
            )}
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="md:col-span-2">
                <FormInput label="User ID" id="uid" value={uid} disabled={true} className="font-mono text-sm" />
            </div>
            <FormInput label="Name" id="name" value={fullName} disabled={!isEditing} />
            <FormInput label="Email" id="email" type="email" value={email} disabled={!isEditing} />
            <FormInput label="Date of Birth" id="dob" type="text" value={dob} disabled={!isEditing} />
            <FormInput label="Gender" id="gender" type="text" value={gender} disabled={!isEditing} />
          </div>
          {isEditing && (
            <div className="flex justify-end gap-3 mt-6">
              <button onClick={() => setIsEditing(false)} className="px-4 py-2 rounded-md text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700">Cancel</button>
              <button onClick={() => setIsEditing(false)} className="px-4 py-2 rounded-md text-sm font-medium bg-emerald-600 text-white hover:bg-emerald-700">Save Changes</button>
            </div>
          )}
        </div>
        {hiddenFileInput}

        {/* Security Section */}
        <div className="bg-white dark:bg-gray-800/50 p-8 rounded-lg shadow-sm border border-gray-200 dark:border-gray-800 mb-10">
          <h3 className="text-xl font-semibold text-gray-800 dark:text-white mb-6">Security</h3>
          <button className="px-4 py-2 rounded-md text-sm font-medium border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700">
            Change Password
          </button>
        </div>

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
                    <div className="flex flex-col items-center gap-2">
                      <FiFileText className="w-10 h-10 text-gray-400" />
                      <span className="font-medium">No rewards history yet.</span>
                      <p className="text-sm">Start ordering to earn history!</p>
                    </div>
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