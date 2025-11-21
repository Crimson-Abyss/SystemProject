import React, { useState, useEffect } from 'react';
import { FiGift } from 'react-icons/fi';
import { useUser } from './UserContext';

const Rewards = () => {
  const { user } = useUser();
  const [rewards, setRewards] = useState([]);

  useEffect(() => {
    const fetchRewards = async () => {
      try {
        const response = await fetch('/api/rewards');
        if (response.ok) {
          const data = await response.json();
          setRewards(data);
        }
      } catch (error) {
        console.error('Failed to fetch rewards:', error);
      }
    };
    fetchRewards();
  }, []);

  return (
    <main className="flex-1 p-10 overflow-y-auto">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-800 dark:text-white">Rewards</h1>
        <div className="text-sm text-gray-500 dark:text-gray-400">
          Your points: <span className="font-bold text-emerald-600 dark:text-emerald-400">{user.points}</span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {rewards.map((r) => {
          const canRedeem = user.points >= r.cost;
          return (
          <div key={r.id} className={`bg-white dark:bg-gray-800 rounded-lg shadow-sm p-4 border border-gray-100 dark:border-gray-700 ${!canRedeem && 'opacity-60'}`}>
            <div className="flex items-start gap-3">
              <div className="p-2 rounded-full bg-emerald-50 dark:bg-emerald-900/50 text-emerald-700 dark:text-emerald-400">
                <FiGift />
              </div>
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <h3 className="font-semibold text-gray-800 dark:text-white">{r.title}</h3>
                  <span className="text-sm text-gray-500 dark:text-gray-400">{r.cost} pts</span>
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">{r.description}</p>
                <button
                  type="button"
                  disabled={!canRedeem}
                  className="mt-3 inline-flex items-center px-3 py-1.5 rounded-md bg-emerald-600 text-white text-sm hover:bg-emerald-700 disabled:bg-gray-400 dark:disabled:bg-gray-600 disabled:cursor-not-allowed"
                >
                  {canRedeem ? 'Redeem' : 'Not enough points'}
                </button>
              </div>
            </div>
          </div>
        )})}
      </div>
    </main>
  );
};

export default Rewards;
