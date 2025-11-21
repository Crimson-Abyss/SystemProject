import React, { useState, useEffect } from 'react';
import { FiCoffee, FiGift, FiShoppingBag } from 'react-icons/fi';
import { Link } from 'react-router-dom';
import PropTypes from 'prop-types';

// Sub-component for Offer Cards
const OfferCard = ({ title, description, imageUrl }) => (
  <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm overflow-hidden">
    <div className="w-full h-32 bg-gray-200 dark:bg-gray-700">
      {/* Replace div with <img src={imageUrl} alt={title} className="w-full h-32 object-cover" /> */}
    </div>
    <div className="p-4">
      <h3 className="font-semibold text-lg text-gray-800 dark:text-white">{title}</h3>
      <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">{description}</p>
    </div>
  </div>
);

OfferCard.propTypes = {
  title: PropTypes.string.isRequired,
  description: PropTypes.string.isRequired,
  imageUrl: PropTypes.string.isRequired,
};

// Sub-component for History Items
const HistoryItem = ({ icon, description, points }) => (
  <div className="flex items-center justify-between py-3 border-b border-gray-100 dark:border-gray-700 last:border-b-0">
    <div className="flex items-center">
      <div className="p-2 bg-gray-100 dark:bg-gray-700 rounded-full text-gray-600 dark:text-gray-300">
        {icon}
      </div>
      <span className="ml-4 font-medium text-gray-700 dark:text-gray-200">{description}</span>
    </div>
    <span className={`text-sm font-medium ${points > 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-gray-500 dark:text-gray-400'}`}>{points > 0 ? `+${points}` : points} pts</span>
  </div>
);

HistoryItem.propTypes = {
  icon: PropTypes.element.isRequired,
  title: PropTypes.string.isRequired,
  points: PropTypes.number.isRequired,
};

// Redeem Card
const RedeemCard = ({ title, cost, description, userPoints }) => {
  const canRedeem = userPoints >= cost;

  return (
  <div className={`bg-white dark:bg-gray-800 rounded-lg shadow-sm p-4 border border-gray-100 dark:border-gray-700 transition-transform duration-200 ${canRedeem ? 'hover:scale-105 hover:shadow-lg' : 'opacity-60'}`}>
    <div className="flex items-start gap-3">
      <div className="p-2 rounded-full bg-emerald-50 dark:bg-emerald-900/50 text-emerald-700 dark:text-emerald-400">
        <FiGift />
      </div>
      <div className="flex-1">
        <div className="flex items-center justify-between">
          <h3 className="font-semibold text-gray-800 dark:text-white">{title}</h3>
          <span className="text-sm text-gray-500 dark:text-gray-400">{cost} pts</span>
        </div>
        <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">{description}</p>
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
  );
};

RedeemCard.propTypes = {
  title: PropTypes.string.isRequired,
  cost: PropTypes.number.isRequired,
  description: PropTypes.string.isRequired,
  userPoints: PropTypes.number.isRequired,
};

// Product Card
const ProductCard = ({ name, price, imageUrl }) => (
  <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm overflow-hidden border border-gray-100 dark:border-gray-700 transition-transform duration-200 hover:scale-105 hover:shadow-lg">
    <div className="w-full h-32 bg-gray-200 dark:bg-gray-700">
      {/* <img src={imageUrl} alt={name} className="w-full h-32 object-cover" /> */}
    </div>
    <div className="p-4">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold text-gray-800 dark:text-white">{name}</h3>
        <span className="text-sm text-gray-700 dark:text-gray-300">{price}</span>
      </div>
      <button
        type="button"
        className="mt-3 inline-flex items-center px-3 py-1.5 rounded-md border border-gray-300 dark:border-gray-600 text-gray-800 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700 text-sm"
      >
        <FiShoppingBag className="mr-2" /> Explore
      </button>
    </div>
  </div>
);

ProductCard.propTypes = {
  name: PropTypes.string.isRequired,
  price: PropTypes.string.isRequired,
  imageUrl: PropTypes.string.isRequired,
};

import { useUser } from './UserContext';

const HomeScreen = () => {
  const { user } = useUser();

  const [featuredRewards, setFeaturedRewards] = useState([]);
  const [history, setHistory] = useState([]);

  useEffect(() => {
    const fetchRewards = async () => {
      try {
        // Fetch the first 3 rewards for the homepage preview
        const response = await fetch('/api/rewards?limit=3');
        if (response.ok) {
          const data = await response.json();
          setFeaturedRewards(data);
        }
      } catch (error) {
        console.error('Failed to fetch rewards:', error);
      }
    };
    fetchRewards();

    const fetchHistory = async () => {
      try {
        // We need the user's ID from localStorage to fetch their history
        const rawProfile = localStorage.getItem('userProfile');
        const profile = rawProfile ? JSON.parse(rawProfile) : null;

        if (profile?.id) {
          // Fetch the first 3 history items for the homepage preview
          const response = await fetch(`/api/history/${profile.id}?limit=3`);
          if (response.ok) {
            const data = await response.json();
            setHistory(data);
          }
        }
      } catch (error) {
        console.error('Failed to fetch history:', error);
      }
    };
    fetchHistory();
  }, []);

  return (
    <main className="flex-1 p-10 overflow-y-auto">
        {/* Welcome Header */}
      <div className="flex items-center gap-4 mb-10">
        <div className="flex-shrink-0 w-16 h-16 rounded-full bg-emerald-100 dark:bg-emerald-900/50 flex items-center justify-center ring-4 ring-white dark:ring-gray-900">
          <span className="text-2xl font-bold text-emerald-700 dark:text-emerald-400">{user.initial}</span>
        </div>
        <div>
            <h1 className="text-3xl font-bold text-gray-800 dark:text-white">Welcome back, {user.name}!</h1>
            <p className="text-gray-600 dark:text-gray-300">
              You have <span className="font-bold text-emerald-600 dark:text-emerald-400">{user.points} points</span>. Explore your offers and rewards.
            </p>
        </div>
      </div>
    
        {/* Featured Offers */}
        <div className="mb-10">
          <h2 className="text-2xl font-semibold text-gray-800 dark:text-white mb-4">Featured Offers</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <OfferCard
              title="New Member Perks"
              description="Enjoy a free drink on us for signing up."
              imageUrl=""
            />
            <OfferCard
              title="Exclusive 15% Off Your Next Visit"
              description="Valid this weekend only. Show this offer in-store."
              imageUrl=""
            />
            <OfferCard
              title="Refer a Friend, Get 50 Points"
              description="Share your referral code and earn rewards."
              imageUrl=""
            />
          </div>
        </div>

        {/* Recent History */}
        <div>
          <h2 className="text-2xl font-semibold text-gray-800 dark:text-white mb-4">Recent History</h2>
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm">
            {history.length > 0 ? (
              history.map((item) => (
                <HistoryItem
                  key={item.id}
                  icon={<FiGift />}
                  description={item.description}
                  points={item.pointsChange}
                />
              ))
            ) : (
              <div className="py-3 text-center text-gray-500 dark:text-gray-400">
                No recent activity.
              </div>
            )}
          </div>
        </div>

        {/* Redeem Rewards */}
        <div className="mt-10">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-2xl font-semibold text-gray-800 dark:text-white">Redeem Rewards</h2>
            <a href="/app/rewards" className="text-sm text-emerald-700 dark:text-emerald-400 hover:underline">View all</a>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {featuredRewards.map((reward) => (
              <Link to="/app/rewards" key={reward.id}>
                <RedeemCard title={reward.title} cost={reward.cost} description={reward.description} userPoints={user.points} />
              </Link>
            ))}
          </div>
        </div>

        {/* Products to Explore */}
        <div className="mt-10">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-2xl font-semibold text-gray-800 dark:text-white">Products to Explore</h2>
            <a href="/app/products" className="text-sm text-emerald-700 dark:text-emerald-400 hover:underline">View all</a>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <Link to="/app/products">
              <ProductCard name="House Blend Coffee" price="$3.50" imageUrl="" />
            </Link>
            <Link to="/app/products">
              <ProductCard name="Matcha Latte" price="$4.20" imageUrl="" />
            </Link>
            <Link to="/app/products">
              <ProductCard name="Blueberry Muffin" price="$2.80" imageUrl="" />
            </Link>
          </div>
        </div>
    </main>
  );
};

export default HomeScreen;