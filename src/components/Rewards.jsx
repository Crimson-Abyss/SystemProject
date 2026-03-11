import React, { useState, useEffect } from 'react';
import { FiGift, FiLock, FiCoffee, FiArrowRight } from 'react-icons/fi';
import { useUser } from './UserContext';
import { Link } from 'react-router-dom';
import { ListSkeleton } from './SkeletonLoader.jsx';

const Rewards = () => {
  const { user } = useUser();
  const [rewards, setRewards] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchRewards = async () => {
      setIsLoading(true);
      try {
        const response = await fetch('/api/rewards');
        if (response.ok) {
          const data = await response.json();
          setRewards(data);
        }
      } catch (error) {
        console.error('Failed to fetch rewards:', error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchRewards();
  }, []);

  const sortedRewards = [...rewards].sort((a, b) => a.cost - b.cost);
  const nextReward = sortedRewards.find(r => r.cost > user.points);
  const progress = nextReward ? (user.points / nextReward.cost) * 100 : 100;

  return (
    <main className="flex-1 p-6 sm:p-10 overflow-y-auto bg-gray-50 dark:bg-[#0a0e18]">
      {/* Hero Section */}
      <div className="relative overflow-hidden glass dark:glass bg-linear-to-br from-emerald-50 to-teal-50 dark:from-emerald-500/5 dark:to-teal-500/5 p-6 sm:p-8 rounded-2xl border border-emerald-100 dark:border-emerald-500/10 mb-8 animate-fade-in">
        {/* Decorative background */}
        <div className="absolute -top-12 -right-12 w-40 h-40 bg-emerald-400/10 rounded-full blur-2xl" />
        <div className="absolute -bottom-8 -left-8 w-32 h-32 bg-teal-400/10 rounded-full blur-2xl" />
        
        <div className="relative z-10 flex flex-col md:flex-row md:items-center md:justify-between gap-6">
          <div className="text-center md:text-left">
            <p className="text-sm font-semibold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider">Bronze Member</p>
            <p className="text-5xl sm:text-6xl font-bold text-gradient mt-1">{user.points}</p>
            <p className="text-gray-600 dark:text-gray-400 font-medium">Points</p>
          </div>
          <div className="flex-1 max-w-md">
            <div className="flex justify-between text-sm font-medium text-gray-600 dark:text-gray-300 mb-2">
              <span>Your Progress</span>
              <span>{nextReward ? `${nextReward.cost} pts` : 'Max level!'}</span>
            </div>
            <div className="w-full bg-gray-200 dark:bg-white/10 rounded-full h-3 overflow-hidden">
              <div className="bg-linear-to-r from-emerald-500 to-teal-400 h-3 rounded-full transition-all duration-1000 ease-out relative" style={{ width: `${progress}%` }}>
                <div className="absolute inset-0 bg-white/20 animate-shimmer" />
              </div>
            </div>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
              {nextReward ? `${nextReward.cost - user.points} points away from a ${nextReward.title}` : 'You have unlocked all rewards!'}
            </p>
          </div>
          <div className="text-center md:text-right">
            <p className="font-medium text-gray-700 dark:text-gray-200 text-sm">Earn 10 points for every ₱50 spent!</p>
            <Link to="/app/products" className="mt-3 btn-primary inline-flex items-center gap-2 text-sm">
              Order Now to Earn Points <FiArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </div>

      <h1 className="text-xl sm:text-2xl font-bold text-gray-800 dark:text-white mb-6 font-[Outfit]">Available Rewards</h1>
      
      {isLoading ? (
        <ListSkeleton count={6} />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
          {rewards.map((r, i) => {
            const canRedeem = user.points >= r.cost;
            const isNextGoal = r.id === nextReward?.id;
            return (
              <div key={r.id} className={`glass dark:glass bg-white/80 dark:bg-white/5 rounded-xl p-4 border transition-all duration-300 animate-fade-in-up card-shine ${
                isNextGoal ? 'border-emerald-400 dark:border-emerald-500/30 shadow-lg shadow-emerald-500/10 glow-emerald' : 'border-gray-200/50 dark:border-white/10'
              } ${!canRedeem ? 'opacity-60' : 'hover-lift'}`} style={{ animationDelay: `${i * 80}ms` }}>
                <div className="flex items-start gap-3">
                  <div className="w-12 h-12 flex-shrink-0 bg-emerald-50 dark:bg-emerald-500/10 rounded-xl flex items-center justify-center text-emerald-600 dark:text-emerald-400">
                    <FiCoffee className="w-6 h-6" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <h3 className="font-semibold text-gray-800 dark:text-white">{r.title}</h3>
                      <span className="flex items-center gap-1 text-sm font-bold text-gray-500 dark:text-gray-400">
                        {!canRedeem && <FiLock className="w-3 h-3" />}
                        {r.cost} pts
                      </span>
                    </div>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{r.description}</p>
                    <button
                      type="button"
                      disabled={!canRedeem}
                      className="mt-3 btn-primary text-sm px-3 py-1.5 disabled:opacity-40 disabled:cursor-not-allowed disabled:bg-gray-400 disabled:shadow-none"
                    >
                      Redeem
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </main>
  );
};

export default Rewards;
