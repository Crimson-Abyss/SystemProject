import React, { useState, useEffect } from 'react';
import { FiGift, FiLock, FiCoffee } from 'react-icons/fi';
import { useUser } from './UserContext';
import { Link } from 'react-router-dom';

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

  // Find the next reward the user is closest to achieving
  const sortedRewards = [...rewards].sort((a, b) => a.cost - b.cost);
  const nextReward = sortedRewards.find(r => r.cost > user.points);
  const progress = nextReward ? (user.points / nextReward.cost) * 100 : 100;

  return (
    <main className="flex-1 p-10 overflow-y-auto">
      {/* Hero Section */}
      <div className="bg-white dark:bg-slate-800/50 p-8 rounded-lg shadow-sm border border-gray-200 dark:border-slate-800 mb-8">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
          <div className="text-center md:text-left">
            <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Bronze Member</p>
            <p className="text-6xl font-bold text-emerald-600 dark:text-emerald-400">{user.points}</p>
            <p className="text-gray-600 dark:text-gray-300">Points</p>
          </div>
          <div className="flex-1 max-w-md text-center md:text-left">
            <div className="flex justify-between text-sm font-medium text-gray-600 dark:text-gray-300 mb-1">
              <span>Your Progress</span>
              <span>{nextReward ? `${nextReward.cost} pts` : 'Max level!'}</span>
            </div>
            <div className="w-full bg-gray-200 dark:bg-slate-700 rounded-full h-2.5">
              <div className="bg-emerald-500 h-2.5 rounded-full" style={{ width: `${progress}%` }}></div>
            </div>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
              {nextReward ? `${nextReward.cost - user.points} points away from a ${nextReward.title}` : 'You have unlocked all rewards!'}
            </p>
          </div>
          <div className="text-center md:text-right">
            <p className="font-medium text-gray-700 dark:text-gray-200">Earn 10 points for every ₱50 spent!</p>
            <Link to="/app/products" className="mt-2 inline-flex items-center px-4 py-2 rounded-md bg-emerald-600 text-white font-medium hover:bg-emerald-700">
              Order Now to Earn Points
            </Link>
          </div>
        </div>
      </div>

      <h1 className="text-2xl font-bold text-gray-800 dark:text-white mb-6">Available Rewards</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {rewards.map((r) => {
          const canRedeem = user.points >= r.cost;
          const isNextGoal = r.id === nextReward?.id;
          return (
          <div key={r.id} className={`bg-white dark:bg-gray-800 rounded-lg shadow-sm p-4 border border-gray-100 dark:border-gray-700 transition-all ${!canRedeem && 'opacity-70'} ${isNextGoal && 'ring-2 ring-emerald-500 shadow-lg'}`}>
            <div className="flex items-start gap-3">
              <div className="w-12 h-12 flex-shrink-0 bg-gray-200 dark:bg-slate-700 rounded-md flex items-center justify-center text-gray-500">
                <FiCoffee className="w-6 h-6" />
              </div>
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <h3 className="font-semibold text-gray-800 dark:text-white">{r.title}</h3>
                  <span className="flex items-center gap-1 text-sm font-medium text-gray-500 dark:text-gray-400">
                    {!canRedeem && <FiLock className="w-3 h-3" />}
                    {r.cost} pts
                  </span>
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">{r.description}</p>
                <button
                  type="button"
                  disabled={!canRedeem}
                  className="mt-3 inline-flex items-center px-3 py-1.5 rounded-md bg-emerald-600 text-white text-sm font-medium hover:bg-emerald-700 disabled:bg-gray-400 dark:disabled:bg-gray-600 disabled:cursor-not-allowed"
                >
                  Redeem
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
