import React, { useState, useEffect } from 'react';
import { FiCoffee, FiGift, FiShoppingBag, FiStar, FiTrendingUp } from 'react-icons/fi';
import { Link } from 'react-router-dom';
import PropTypes from 'prop-types';
import { useCart } from './CartContext.jsx';
import { useUser, TIER_CONFIG } from './UserContext';
import { DashboardSkeleton } from './SkeletonLoader.jsx';

// Sub-component for Offer Cards
const OfferCard = ({ title, description, index }) => (
  <div className={`relative overflow-hidden rounded-xl p-6 h-full flex flex-col justify-between transition-all duration-300 hover-lift card-shine group animate-fade-in-up ${
    index === 0 ? 'bg-linear-to-br from-emerald-600 to-teal-600 dark:from-emerald-600 dark:to-teal-700' :
    index === 1 ? 'bg-linear-to-br from-violet-600 to-purple-600 dark:from-violet-600 dark:to-purple-700' :
    'bg-linear-to-br from-amber-500 to-orange-500 dark:from-amber-600 dark:to-orange-600'
  }`} style={{ animationDelay: `${(index + 1) * 150}ms` }}>
    <div className="relative z-10">
      <h3 className="font-bold text-xl text-white">{title}</h3>
      <p className="text-sm text-white/80 mt-1">{description}</p>
    </div>
    <div className="absolute -bottom-6 -right-6 w-24 h-24 rounded-full bg-white/10 group-hover:scale-125 transition-transform duration-500" />
  </div>
);

OfferCard.propTypes = {
  title: PropTypes.string.isRequired,
  description: PropTypes.string.isRequired,
  index: PropTypes.number,
};

// Sub-component for History Items
const HistoryItem = ({ icon, description, points, index }) => (
  <div className="flex items-center justify-between py-3 border-b border-gray-100 dark:border-white/10 last:border-b-0 animate-fade-in-left hover:bg-gray-50 dark:hover:bg-white/5 rounded-lg px-2 transition-colors" style={{ animationDelay: `${index * 100}ms` }}>
    <div className="flex items-center">
      <div className="p-2 bg-emerald-50 dark:bg-emerald-500/10 rounded-full text-emerald-600 dark:text-emerald-400">
        {icon}
      </div>
      <span className="ml-4 font-medium text-gray-700 dark:text-gray-200 text-sm">{description}</span>
    </div>
    <span className={`text-sm font-bold ${points > 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-500 dark:text-rose-400'}`}>{points > 0 ? `+${points}` : points} pts</span>
  </div>
);

HistoryItem.propTypes = {
  icon: PropTypes.element.isRequired,
  description: PropTypes.string.isRequired,
  points: PropTypes.number.isRequired,
  index: PropTypes.number,
};

// Redeem Card
const RedeemCard = ({ title, cost, description, userPoints }) => {
  const canRedeem = userPoints >= cost;

  return (
    <div className={`glass dark:glass bg-white/80 dark:bg-white/5 rounded-xl shadow-sm p-4 border border-gray-200/50 dark:border-white/10 transition-all duration-300 ${canRedeem ? 'hover-lift hover-glow' : 'opacity-50'}`}>
      <div className="flex items-start gap-3">
        <div className="p-2 rounded-full bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
          <FiGift />
        </div>
        <div className="flex-1">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold text-gray-800 dark:text-white text-sm">{title}</h3>
            <span className="text-xs text-gray-500 dark:text-gray-400 font-bold">{cost} pts</span>
          </div>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">{description}</p>
          <button
            type="button"
            disabled={!canRedeem}
            className="mt-3 btn-primary text-xs px-3 py-1.5 disabled:opacity-40 disabled:cursor-not-allowed disabled:bg-gray-400 disabled:shadow-none"
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
  const { name, description, price, image, badge, rating } = product;
  const numPrice = typeof price === 'number' ? price : parseFloat(String(price).replace('₱', ''));

  return (
    <div className="bg-white dark:bg-white/5 rounded-xl shadow-md overflow-hidden border border-gray-200/50 dark:border-white/10 transition-all duration-300 hover-lift card-shine flex flex-col group">
      <div className="relative w-full h-36 bg-gray-100 dark:bg-white/5 overflow-hidden">
        {badge && (
          <div className="absolute top-2 left-2 z-10 bg-linear-to-r from-emerald-500 to-teal-500 text-white text-[10px] font-bold px-2.5 py-1 rounded-full shadow-md uppercase">
            {badge}
          </div>
        )}
        {image ? (
          <img src={image} alt={name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" loading="lazy" />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <FiCoffee className="w-10 h-10 text-gray-300 dark:text-gray-600" />
          </div>
        )}
      </div>
      <div className="p-4 flex-1 flex flex-col">
        <div className="flex items-center justify-between">
          <h3 className="font-bold text-sm text-gray-800 dark:text-white truncate">{name}</h3>
          {rating && (
            <div className="flex items-center gap-0.5 text-amber-500 shrink-0">
              <FiStar className="w-3 h-3 fill-current" />
              <span className="text-xs font-medium text-gray-600 dark:text-gray-300">{rating}</span>
            </div>
          )}
        </div>
        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 flex-1 line-clamp-2">{description}</p>
        <div className="mt-3 flex items-center justify-between">
          <span className="text-lg font-bold text-emerald-600 dark:text-emerald-400">₱{numPrice.toFixed(2)}</span>
          <button
            type="button"
            onClick={(e) => { e.preventDefault(); addToCart(product); }}
            className="btn-primary text-xs px-3 py-2 flex items-center gap-1 group/btn"
          >
            <FiShoppingBag className="h-3.5 w-3.5" /> Add
          </button>
        </div>
      </div>
    </div>
  );
};

ProductCard.propTypes = {
  product: PropTypes.object.isRequired,
};

const HomeScreen = () => {
  const { user, refreshUser } = useUser();
  const [featuredRewards, setFeaturedRewards] = useState([]);
  const [featuredProducts, setFeaturedProducts] = useState([]);
  const [history, setHistory] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  const tierConfig = TIER_CONFIG[user.membershipTier || 'Regular'] || TIER_CONFIG.Regular;
  const tierInfo = user.tierInfo || {};

  useEffect(() => {
    refreshUser();

    const fetchData = async () => {
      setIsLoading(true);
      try {
        const [rewardsRes, historyRes, productsRes] = await Promise.allSettled([
          fetch('/api/rewards?limit=3'),
          (() => {
            const rawProfile = localStorage.getItem('userProfile');
            const profile = rawProfile ? JSON.parse(rawProfile) : null;
            if (profile?.id) {
              const token = localStorage.getItem('token');
              return fetch(`/api/history/${profile.id}?limit=3`, {
                headers: { 'Authorization': `Bearer ${token}` }
              });
            }
            return Promise.resolve(null);
          })(),
          fetch('/api/products'),
        ]);

        if (rewardsRes.status === 'fulfilled' && rewardsRes.value?.ok) {
          setFeaturedRewards(await rewardsRes.value.json());
        }
        if (historyRes.status === 'fulfilled' && historyRes.value?.ok) {
          setHistory(await historyRes.value.json());
        }
        if (productsRes.status === 'fulfilled' && productsRes.value?.ok) {
          const allProducts = await productsRes.value.json();
          // Pick 3 featured products (bestsellers or popular items)
          const featured = allProducts
            .filter(p => p.badge && p.category !== 'Add-ons')
            .slice(0, 3);
          setFeaturedProducts(featured.length > 0 ? featured : allProducts.filter(p => p.category !== 'Add-ons').slice(0, 3));
        }
      } catch (error) {
        console.error('Failed to fetch data:', error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, [refreshUser]);

  if (isLoading) {
    return (
      <main className="flex-1 p-6 sm:p-10 overflow-y-auto bg-gray-50 dark:bg-[#0a0e18]">
        <DashboardSkeleton />
      </main>
    );
  }

  return (
    <main className="flex-1 p-6 sm:p-10 overflow-y-auto bg-gray-50 dark:bg-[#0a0e18]">
      {/* Dashboard Header */}
      <div className="flex flex-col md:flex-row items-start justify-between gap-6 mb-10 animate-fade-in">
        <div className="flex items-center gap-4">
          <div className="shrink-0 w-14 h-14 sm:w-16 sm:h-16 rounded-full bg-linear-to-br from-emerald-400 to-teal-500 flex items-center justify-center ring-4 ring-white dark:ring-[#0a0e18] shadow-lg shadow-emerald-500/20">
            <span className="text-xl sm:text-2xl font-bold text-white">{user.initial}</span>
          </div>
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 dark:text-white font-[Outfit]">Welcome back, {user.name}!</h1>
            <div className="flex items-center gap-2 mt-1">
              <span className="text-lg">{tierConfig.emoji}</span>
              <span className={`text-sm font-bold ${tierConfig.textColor}`}>{user.membershipTier || 'Regular'} Member</span>
              <span className="text-gray-300 dark:text-gray-600">•</span>
              <span className="text-sm text-gray-500 dark:text-gray-400">{tierInfo.multiplier || 1}× points</span>
            </div>
          </div>
        </div>

        {/* Points Card */}
        <div className="w-full md:w-auto md:min-w-[300px] glass dark:glass bg-white/80 dark:bg-white/5 p-4 rounded-xl border border-gray-200/50 dark:border-white/10 shadow-sm">
          <div className="flex items-center justify-between mb-1">
            <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Your Points</p>
            <Link to="/app/rewards" className="text-xs text-emerald-600 dark:text-emerald-400 hover:underline font-medium flex items-center gap-1">
              <FiTrendingUp className="w-3 h-3" /> View Tier
            </Link>
          </div>
          <p className="text-3xl font-bold text-gradient animate-count-up">{user.points}</p>
          {tierInfo.nextTier && (
            <>
              <div className="w-full bg-gray-200 dark:bg-white/10 rounded-full h-2 mt-2 overflow-hidden">
                <div className={`bg-linear-to-r ${tierConfig.color} h-2 rounded-full transition-all duration-1000 ease-out relative`} style={{ width: `${tierInfo.progress || 0}%` }}>
                  <div className="absolute inset-0 bg-white/20 animate-shimmer" />
                </div>
              </div>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                ₱{((tierInfo.nextTierThreshold || 0) - (user.totalSpent || 0)).toLocaleString()} to {tierInfo.nextTier}
              </p>
            </>
          )}
        </div>
      </div>

      {/* Featured Offers */}
      <div className="mb-10">
        <h2 className="text-xl sm:text-2xl font-bold text-gray-800 dark:text-white mb-4 font-[Outfit]">Featured Offers</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
          <OfferCard title="Earn More Points" description={`As a ${user.membershipTier || 'Regular'} member, earn ${tierInfo.multiplier || 1}× points on every order.`} index={0} />
          <OfferCard title="Points = Savings" description="Use your points as ₱1 each to save on your next order." index={1} />
          <OfferCard title="Rank Up Rewards" description="Spend more to unlock Silver, Gold, and Platinum tiers with exclusive perks." index={2} />
        </div>
      </div>

      {/* Recent History */}
      {history.length > 0 && (
        <div className="mb-10 animate-fade-in-up delay-300">
          <h2 className="text-xl sm:text-2xl font-bold text-gray-800 dark:text-white mb-4 font-[Outfit]">Recent History</h2>
          <div className="glass dark:glass bg-white/80 dark:bg-white/5 p-4 sm:p-6 rounded-xl border border-gray-200/50 dark:border-white/10">
            {history.map((item, i) => (
              <HistoryItem
                key={item.id}
                icon={<FiGift />}
                description={item.description}
                points={item.pointsChange}
                index={i}
              />
            ))}
          </div>
        </div>
      )}

      {/* Redeem Rewards */}
      <div className="mt-10 animate-fade-in-up delay-400">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl sm:text-2xl font-bold text-gray-800 dark:text-white font-[Outfit]">Redeem Rewards</h2>
          <Link to="/app/rewards" className="text-sm text-emerald-600 dark:text-emerald-400 hover:underline font-medium">View all</Link>
        </div>
        <div className="flex gap-4 sm:gap-6 pb-4 -mx-6 sm:-mx-10 px-6 sm:px-10 overflow-x-auto">
          {featuredRewards.map((reward) => (
            <div key={reward.id} className="shrink-0 w-[280px] sm:w-full md:w-1/3 lg:w-1/4">
              <RedeemCard title={reward.title} cost={reward.cost} description={reward.description} userPoints={user.points} />
            </div>
          ))}
        </div>
      </div>

      {/* Featured Products */}
      <div className="mt-10 animate-fade-in-up delay-500">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl sm:text-2xl font-bold text-gray-800 dark:text-white font-[Outfit]">Popular Drinks</h2>
          <Link to="/app/products" className="text-sm text-emerald-600 dark:text-emerald-400 hover:underline font-medium">View Menu</Link>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
          {featuredProducts.map(p => (
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