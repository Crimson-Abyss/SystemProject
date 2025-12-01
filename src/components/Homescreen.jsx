import React, { useState, useEffect } from 'react';
import { FiCoffee, FiGift, FiShoppingBag, FiStar } from 'react-icons/fi';
import { Link, NavLink } from 'react-router-dom';
import PropTypes from 'prop-types';
import { useCart } from './CartContext.jsx';
import { useUser } from './UserContext';

// Sub-component for Offer Cards
const OfferCard = ({ title, description,}) => (
  <div className="bg-linear-to-r from-emerald-600 to-teal-600 text-white rounded-lg shadow-md overflow-hidden p-6 h-full flex flex-col justify-between transition-transform duration-200 hover:-translate-y-1">
    <div>
      <h3 className="font-bold text-xl">{title}</h3>
      <p className="text-sm text-emerald-100 mt-1">{description}</p>
    </div>
  </div>
);

OfferCard.propTypes = {
  title: PropTypes.string.isRequired,
  description: PropTypes.string.isRequired,
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
  description: PropTypes.string.isRequired,
  points: PropTypes.number.isRequired,
};

// Redeem Card
const RedeemCard = ({ title, cost, description, userPoints }) => {
  const canRedeem = userPoints >= cost;

  return (
    <div className={`bg-white dark:bg-gray-800 rounded-lg shadow-sm p-4 border border-gray-100 dark:border-gray-700 transition-transform duration-200 ${canRedeem ? 'hover:-translate-y-1 hover:shadow-lg' : 'opacity-60'}`}>
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
const ProductCard = ({ product }) => {
  const { addToCart } = useCart();
  const { name, description, price, imageUrl, badge, rating } = product;

  return (
    <div className="bg-white dark:bg-slate-800 rounded-lg shadow-md overflow-hidden border border-gray-200 dark:border-white/10 transition-transform duration-200 hover:scale-105 hover:-translate-y-1 hover:shadow-xl flex flex-col">
      <div className="relative w-full h-40 bg-gray-200 dark:bg-slate-700">
        {badge && (
          <div className="absolute top-2 left-2 bg-emerald-600 text-white text-xs font-bold px-2 py-1 rounded-full">
            {badge}
          </div>
        )}
        { <img src={imageUrl} alt={name} className="w-full h-full object-cover" /> }
      </div>
      <div className="p-4 flex-1 flex flex-col">
        <div className="flex items-center justify-between">
          <h3 className="font-bold text-lg text-gray-800 dark:text-white truncate">{name}</h3>
          <div className="flex items-center gap-1 text-amber-500">
            <FiStar className="w-4 h-4" />
            <span className="text-sm font-medium text-gray-600 dark:text-gray-300">{rating}</span>
          </div>
        </div>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1 flex-1">{description}</p>
        <div className="mt-4 flex items-center justify-between">
          <span className="text-xl font-bold text-emerald-600 dark:text-emerald-400">{price}</span>
          <button
            type="button"
            onClick={(e) => { e.preventDefault(); addToCart(product); }}
            className="inline-flex items-center justify-center px-4 py-2 rounded-md bg-emerald-600 text-white text-sm font-medium hover:bg-emerald-700"
          >
            <FiShoppingBag className="mr-2 h-4 w-4" /> Add
          </button>
        </div>
      </div>
    </div>
  );
};

ProductCard.propTypes = {
  product: PropTypes.shape({
    name: PropTypes.string.isRequired,
    description: PropTypes.string.isRequired,
    price: PropTypes.string.isRequired,
    imageUrl: PropTypes.string,
    badge: PropTypes.string,
    rating: PropTypes.number,
  }).isRequired,
};

const HomeScreen = () => {
  const { user, refreshUser } = useUser();

  const [featuredRewards, setFeaturedRewards] = useState([]);
  const [history, setHistory] = useState([]);
  
  const products = [
    { id: 1, name: 'House Blend Coffee', description: 'Our signature rich & smooth drip coffee.', price: '₱175.00', rating: 4.5, badge: 'Bestseller' },
    { id: 2, name: 'Matcha Latte', description: 'Ceremonial grade matcha with steamed milk.', price: '₱210.00', rating: 4.8 },
    { id: 3, name: 'Blueberry Muffin', description: 'Freshly baked with wild blueberries.', price: '₱140.00', rating: 4.2, badge: 'New' },
  ];

  // Calculate next reward milestone (every 100 points)
  const nextRewardCost = Math.ceil((user.points + 1) / 100) * 100;
  const progress = (user.points % 100); // Progress towards next 100
  const pointsToNext = nextRewardCost - user.points;

  useEffect(() => {
    refreshUser(); // Refresh user data (points) on mount

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
          const token = localStorage.getItem('token');
          const response = await fetch(`/api/history/${profile.id}?limit=3`, {
            headers: {
              'Authorization': `Bearer ${token}`
            }
          });
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
  }, [refreshUser]);

  return (
    <main className="flex-1 p-10 overflow-y-auto bg-gray-50 dark:bg-slate-900">
      {/* Dashboard Header */}
      <div className="flex flex-col md:flex-row items-start justify-between gap-6 mb-10">
        <div className="flex items-center gap-4">
          <div className="shrink-0 w-16 h-16 rounded-full bg-emerald-100 dark:bg-emerald-900/50 flex items-center justify-center ring-4 ring-white dark:ring-gray-900">
            <span className="text-2xl font-bold text-emerald-700 dark:text-emerald-400">{user.initial}</span>
          </div>
          <div>
            <h1 className="text-3xl font-bold text-gray-800 dark:text-white">Welcome back, {user.name}!</h1>
            <p className="text-gray-600 dark:text-gray-300">Here's what's new for you today.</p>
          </div>
        </div>
        <div className="w-full md:w-auto md:min-w-[280px] bg-white dark:bg-slate-800 p-4 rounded-lg shadow-sm border border-gray-200 dark:border-slate-700">
          <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Your Points</p>
          <p className="text-3xl font-bold text-emerald-600 dark:text-emerald-400">{user.points}</p>
          <div className="w-full bg-gray-200 dark:bg-slate-700 rounded-full h-1.5 mt-2">
            <div className="bg-emerald-500 h-1.5 rounded-full" style={{ width: `${progress}%` }}></div>
          </div>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">{pointsToNext} points to next reward</p>
        </div>
      </div>

      {/* Featured Offers */}
      <div className="mb-10">
        <h2 className="text-2xl font-semibold text-gray-800 dark:text-white mb-4">Featured Offers</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <OfferCard title="New Member Perks" description="Enjoy a free drink on us for signing up." imageUrl="" />
          <OfferCard title="Exclusive 15% Off" description="Valid this weekend only. Show this offer in-store." imageUrl="" />
          <OfferCard title="Refer a Friend" description="Share your code and get 50 points." imageUrl="" />
        </div>
      </div>

      {/* Recent History (Conditional) */}
      {history.length > 0 && (
        <div className="mb-10">
          <h2 className="text-2xl font-semibold text-gray-800 dark:text-white mb-4">Recent History</h2>
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm">
            {history.map((item) => (
              <HistoryItem
                key={item.id}
                icon={<FiGift />}
                description={item.description}
                points={item.pointsChange}
              />
            ))}
          </div>
        </div>
      )}

      {/* Redeem Rewards */}
      <div className="mt-10">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-2xl font-semibold text-gray-800 dark:text-white">Redeem Rewards</h2>
          <a href="/app/rewards" className="text-sm text-emerald-700 dark:text-emerald-400 hover:underline">View all</a>
        </div>
        <div className="flex gap-6 pb-4 -mx-10 px-10 overflow-x-auto">
          {featuredRewards.map((reward) => (
            <div key={reward.id} className="shrink-0 w-full md:w-1/3 lg:w-1/4">
              <RedeemCard title={reward.title} cost={reward.cost} description={reward.description} userPoints={user.points} />
            </div>
          ))}
        </div>
      </div>

      {/* Products to Explore */}
      <div className="mt-10">
        <div className="mb-6">
          <h2 className="text-2xl font-semibold text-gray-800 dark:text-white mb-2">Products to Explore</h2>
          <div className="relative w-full md:max-w-xs">
            <input type="search" placeholder="Search products..." className="w-full pl-4 pr-10 py-2 rounded-lg bg-white dark:bg-slate-800 border border-gray-300 dark:border-slate-700 focus:ring-emerald-500 focus:border-emerald-500" />
          </div>
        </div>

        {/* Category Pills */}
        <div className="flex items-center gap-2 mb-6 border-b border-gray-200 dark:border-slate-700">
          <NavLink to="#" className={({ isActive }) => `px-4 py-2 font-medium text-sm rounded-t-lg ${isActive ? 'bg-emerald-600 text-white' : 'text-gray-500 hover:bg-gray-200 dark:hover:bg-slate-800'}`}>All</NavLink>
          <NavLink to="#" className={({ isActive }) => `px-4 py-2 font-medium text-sm rounded-t-lg ${isActive ? 'bg-emerald-600 text-white' : 'text-gray-500 hover:bg-gray-200 dark:hover:bg-slate-800'}`}>Coffee</NavLink>
          <NavLink to="#" className={({ isActive }) => `px-4 py-2 font-medium text-sm rounded-t-lg ${isActive ? 'bg-emerald-600 text-white' : 'text-gray-500 hover:bg-gray-200 dark:hover:bg-slate-800'}`}>Tea</NavLink>
          <NavLink to="#" className={({ isActive }) => `px-4 py-2 font-medium text-sm rounded-t-lg ${isActive ? 'bg-emerald-600 text-white' : 'text-gray-500 hover:bg-gray-200 dark:hover:bg-slate-800'}`}>Pastries</NavLink>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {products.map(p => (
            <Link to="/app/products" key={p.id}>
              <ProductCard product={p} />
            </Link>
          ))}
        </div>
      </div>
    </main>
  );
};

export default HomeScreen;