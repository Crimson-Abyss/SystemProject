import React, { useMemo, useState, useRef, useEffect } from 'react';
import PropTypes from 'prop-types';
import { useUser } from './UserContext';
import { FiFileText, FiEdit3, FiCamera, FiShield } from 'react-icons/fi';
import { ProfileSkeleton } from './SkeletonLoader.jsx';

// Sub-component for Form Inputs
const FormInput = ({ label, id, className = '', ...props }) => (
  <div className={className}>
    <label htmlFor={id} className="block text-sm font-medium text-gray-600 dark:text-gray-400 mb-1.5">
      {label}
    </label>
    <input
      id={id}
      className="block w-full rounded-xl border-gray-200 dark:border-white/10 bg-white dark:bg-white/5 text-gray-900 dark:text-white shadow-sm focus:border-emerald-500 focus:ring-emerald-500/30 sm:text-sm disabled:bg-gray-50 disabled:dark:bg-white/5 disabled:text-gray-500 dark:disabled:text-gray-500 transition-all py-2.5"
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
  <tr className="border-b border-gray-100 dark:border-white/10 last:border-b-0 hover:bg-gray-50 dark:hover:bg-white/5 transition-colors">
    <td className="py-4 pr-4 text-gray-500 dark:text-gray-400 text-sm">{date}</td>
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
  const [isLoading, setIsLoading] = useState(true);

  const profile = useMemo(() => {
    try {
      const raw = localStorage.getItem('userProfile');
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  }, []);

  useEffect(() => {
    if (profile?.id) {
      const fetchHistory = async () => {
        setIsLoading(true);
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
        } finally {
          setIsLoading(false);
        }
      };
      fetchHistory();
    } else {
      setIsLoading(false);
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

        const savedProfile = JSON.parse(localStorage.getItem('userProfile')) || {};
        const updatedProfile = { ...savedProfile, avatarUrl: base64String };
        localStorage.setItem('userProfile', JSON.stringify(updatedProfile));

        setUser({ ...user, avatarUrl: base64String });
      };
      reader.readAsDataURL(file);
    }
  };

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

  const nextTierCost = 1000;
  const progress = (points / nextTierCost) * 100;

  if (isLoading) {
    return (
      <main className="flex-1 p-6 sm:p-10 overflow-y-auto bg-gray-50 dark:bg-[#0a0e18]">
        <ProfileSkeleton />
      </main>
    );
  }

  return (
    <main className="flex-1 p-6 sm:p-10 overflow-y-auto bg-gray-50 dark:bg-[#0a0e18]">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white mb-6 font-[Outfit] animate-fade-in">Profile</h1>
        
        {/* Profile Header */}
        <div className="flex flex-col sm:flex-row items-center sm:items-start gap-5 mb-8 animate-fade-in-up">
          <div
            className="relative w-20 h-20 rounded-full overflow-hidden cursor-pointer group shrink-0"
            onClick={handleAvatarClick}
          >
            {/* Rotating gradient ring */}
            <div className="absolute inset-[-3px] rounded-full bg-linear-to-r from-emerald-400 via-teal-400 to-emerald-400 animate-spin-slow opacity-80" />
            <div className="absolute inset-[2px] rounded-full overflow-hidden bg-gray-100 dark:bg-gray-800 z-10">
              {avatar ? (
                <img src={avatar} alt="User Avatar" className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-linear-to-br from-emerald-100 to-teal-100 dark:from-emerald-900/50 dark:to-teal-900/50">
                  <span className="text-3xl font-bold text-emerald-700 dark:text-emerald-400">{user.initial}</span>
                </div>
              )}
            </div>
            <div className="absolute inset-[2px] rounded-full bg-black/50 flex items-center justify-center text-white text-xs font-semibold opacity-0 group-hover:opacity-100 transition-opacity z-20">
              <FiCamera className="w-5 h-5" />
            </div>
          </div>
          <div className="text-center sm:text-left">
            <h2 className="text-xl sm:text-2xl font-bold dark:text-white">{fullName || 'Your Name'}</h2>
            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-3 mt-2">
              <span className="bg-linear-to-r from-emerald-500/20 to-teal-500/20 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider">
                {tier}
              </span>
              <span className="font-bold text-gradient text-lg">{points} Points</span>
            </div>
            <div className="w-full max-w-xs bg-gray-200 dark:bg-white/10 rounded-full h-2 mt-3 overflow-hidden">
              <div className="bg-linear-to-r from-emerald-500 to-teal-400 h-2 rounded-full transition-all duration-1000 relative" style={{ width: `${progress}%` }}>
                <div className="absolute inset-0 bg-white/20 animate-shimmer" />
              </div>
            </div>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">{nextTierCost - points} points to Platinum</p>
          </div>
        </div>

        {/* Personal Information */}
        <div className="glass dark:glass bg-white/80 dark:bg-white/5 p-6 sm:p-8 rounded-2xl border border-gray-200/50 dark:border-white/10 mb-8 animate-fade-in-up delay-200">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-gray-800 dark:text-white">Personal Information</h3>
            {!isEditing && (
              <button onClick={() => setIsEditing(true)} className="flex items-center gap-2 text-sm font-medium text-emerald-600 dark:text-emerald-400 hover:text-emerald-500 transition-colors">
                <FiEdit3 /> Edit Profile
              </button>
            )}
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
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
              <button onClick={() => setIsEditing(false)} className="px-4 py-2 rounded-xl text-sm font-medium text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-white/5 transition-colors">Cancel</button>
              <button onClick={() => setIsEditing(false)} className="btn-primary text-sm px-4 py-2">Save Changes</button>
            </div>
          )}
        </div>
        {hiddenFileInput}

        {/* Security Section */}
        <div className="glass dark:glass bg-white/80 dark:bg-white/5 p-6 sm:p-8 rounded-2xl border border-gray-200/50 dark:border-white/10 mb-8 animate-fade-in-up delay-300">
          <div className="flex items-center gap-3 mb-4">
            <FiShield className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
            <h3 className="text-lg font-semibold text-gray-800 dark:text-white">Security</h3>
          </div>
          <button className="btn-ghost text-sm dark:text-gray-300 dark:border-gray-600 text-gray-700 border-gray-300">
            Change Password
          </button>
        </div>

        {/* Rewards History */}
        <div className="glass dark:glass bg-white/80 dark:bg-white/5 p-6 sm:p-8 rounded-2xl border border-gray-200/50 dark:border-white/10 animate-fade-in-up delay-400">
          <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-6">Rewards History</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="border-b border-gray-200 dark:border-white/10">
                <tr>
                  <th className="py-3 pr-4 font-medium text-gray-500 dark:text-gray-400 text-sm">Date</th>
                  <th className="py-3 px-4 font-medium text-gray-500 dark:text-gray-400 text-sm">Description</th>
                  <th className="py-3 pl-4 font-medium text-gray-500 dark:text-gray-400 text-sm text-right">Points</th>
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
                    <td colSpan="3" className="py-12 text-center text-gray-500 dark:text-gray-400">
                      <div className="flex flex-col items-center gap-3">
                        <div className="w-16 h-16 rounded-full bg-gray-100 dark:bg-white/5 flex items-center justify-center">
                          <FiFileText className="w-8 h-8 text-gray-400 dark:text-gray-600" />
                        </div>
                        <span className="font-medium text-gray-600 dark:text-gray-400">No rewards history yet.</span>
                        <p className="text-sm">Start ordering to earn history!</p>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </main>
  );
};

export default ProfileScreen;