import React, { useState, useEffect } from 'react';
import { FiGift, FiLock, FiCoffee, FiArrowRight, FiStar, FiAward, FiTrendingUp, FiZap } from 'react-icons/fi';
import { useUser, TIER_CONFIG } from './UserContext';
import { Link } from 'react-router-dom';
import { ListSkeleton } from './SkeletonLoader.jsx';

const TIERS_FALLBACK = [
  { name: 'Regular',  threshold: 0,     multiplier: 1,   discount: 0,  birthdayBonus: 0   },
  { name: 'Silver',   threshold: 2000,  multiplier: 1.5, discount: 5,  birthdayBonus: 50  },
  { name: 'Gold',     threshold: 5000,  multiplier: 2,   discount: 10, birthdayBonus: 100 },
  { name: 'Platinum', threshold: 15000, multiplier: 3,   discount: 15, birthdayBonus: 200 },
];

const Rewards = () => {
  const { user } = useUser();
  const [rewards, setRewards] = useState([]);
  const [tiers, setTiers] = useState(TIERS_FALLBACK);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        const [rewardsRes, tiersRes] = await Promise.allSettled([
          fetch('/api/rewards'),
          fetch('/api/tiers'),
        ]);
        if (rewardsRes.status === 'fulfilled' && rewardsRes.value.ok) setRewards(await rewardsRes.value.json());
        if (tiersRes.status === 'fulfilled' && tiersRes.value.ok) setTiers(await tiersRes.value.json());
      } catch (error) {
        console.error('Failed to fetch data:', error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, []);

  const currentTier = user.membershipTier || 'Regular';
  const totalSpent = user.totalSpent || 0;
  const tierInfo = user.tierInfo || {};
  const currentTierIndex = tiers.findIndex(t => t.name === currentTier);
  const currentTierData = tiers[currentTierIndex] || tiers[0];
  const nextTierData = currentTierIndex < tiers.length - 1 ? tiers[currentTierIndex + 1] : null;
  const tierConfig = TIER_CONFIG[currentTier] || TIER_CONFIG.Regular;

  const progress = nextTierData
    ? ((totalSpent - currentTierData.threshold) / (nextTierData.threshold - currentTierData.threshold)) * 100
    : 100;
  const amountToNext = nextTierData ? nextTierData.threshold - totalSpent : 0;

  return (
    <main className="flex-1 p-6 sm:p-10 overflow-y-auto bg-gray-50 dark:bg-[#0a0e18]">
      {/* Tier Hero Section */}
      <div className="relative overflow-hidden rounded-2xl mb-8 animate-fade-in">
        <div className={`absolute inset-0 bg-linear-to-br ${tierConfig.color} opacity-10`} />
        <div className="relative glass dark:glass bg-white/80 dark:bg-white/5 p-6 sm:p-8 border border-gray-200/50 dark:border-white/10 rounded-2xl">
          <div className="absolute -top-16 -right-16 w-48 h-48 bg-emerald-400/5 rounded-full blur-3xl" />
          <div className="absolute -bottom-12 -left-12 w-36 h-36 bg-teal-400/5 rounded-full blur-3xl" />

          <div className="relative z-10 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-8">
            {/* Left: Tier Badge + Points */}
            <div className="text-center lg:text-left">
              <div className="inline-flex items-center gap-2 mb-3">
                <span className="text-3xl">{tierConfig.emoji}</span>
                <span className={`text-sm font-bold uppercase tracking-widest ${tierConfig.textColor}`}>{currentTier} Member</span>
              </div>
              <p className="text-5xl sm:text-6xl font-bold text-gradient">{user.points}</p>
              <p className="text-gray-500 dark:text-gray-400 font-medium mt-1">Available Points</p>
              <p className="text-xs text-gray-400 dark:text-gray-500 mt-2">
                1 point = ₱1 discount at checkout
              </p>
            </div>

            {/* Right: Tier Progress */}
            <div className="flex-1 max-w-md">
              {nextTierData ? (
                <>
                  <div className="flex items-center justify-between text-sm font-medium mb-2">
                    <span className="text-gray-600 dark:text-gray-300">{currentTier}</span>
                    <span className="text-gray-600 dark:text-gray-300">{nextTierData.name}</span>
                  </div>
                  <div className="w-full bg-gray-200 dark:bg-white/10 rounded-full h-3 overflow-hidden">
                    <div
                      className={`bg-linear-to-r ${tierConfig.color} h-3 rounded-full transition-all duration-1000 ease-out relative`}
                      style={{ width: `${Math.min(progress, 100)}%` }}
                    >
                      <div className="absolute inset-0 bg-white/20 animate-shimmer" />
                    </div>
                  </div>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                    Spend <span className="font-bold text-emerald-600 dark:text-emerald-400">₱{amountToNext.toLocaleString()}</span> more to reach {nextTierData.name}
                  </p>
                  <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
                    Total spent: ₱{totalSpent.toLocaleString()}
                  </p>
                </>
              ) : (
                <div className="text-center lg:text-left">
                  <p className="text-lg font-bold text-gradient">🎉 Maximum Tier Reached!</p>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">You're enjoying the best benefits. Total spent: ₱{totalSpent.toLocaleString()}</p>
                </div>
              )}
            </div>

            {/* CTA */}
            <div className="text-center lg:text-right shrink-0">
              <p className="font-medium text-gray-700 dark:text-gray-300 text-sm mb-2">
                Earn <span className="font-bold text-emerald-600 dark:text-emerald-400">{currentTierData.multiplier}× points</span> per order!
              </p>
              <Link to="/app/products" className="btn-primary inline-flex items-center gap-2 text-sm">
                Order Now <FiArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Current Tier Benefits */}
      <div className="mb-10 animate-fade-in-up delay-200">
        <h2 className="text-xl font-bold text-gray-800 dark:text-white mb-4 font-[Outfit]">Your Benefits</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <BenefitCard icon={<FiZap />} title="Points Multiplier" value={`${currentTierData.multiplier}×`} description="Points earned per order" color="emerald" />
          <BenefitCard icon={<FiStar />} title="Tier Discount" value={currentTierData.discount > 0 ? `${currentTierData.discount}%` : '—'} description={currentTierData.discount > 0 ? 'Off all orders' : 'Unlock at Silver'} color="amber" />
          <BenefitCard icon={<FiGift />} title="Birthday Bonus" value={currentTierData.birthdayBonus > 0 ? `${currentTierData.birthdayBonus} pts` : '—'} description={currentTierData.birthdayBonus > 0 ? 'Free points on your birthday' : 'Unlock at Silver'} color="violet" />
          <BenefitCard icon={<FiAward />} title="Points Value" value="₱1 / pt" description="Use points as discount at checkout" color="rose" />
        </div>
      </div>

      {/* All Tiers Overview */}
      <div className="mb-10 animate-fade-in-up delay-300">
        <h2 className="text-xl font-bold text-gray-800 dark:text-white mb-4 font-[Outfit]">All Membership Tiers</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {tiers.map((tier, i) => {
            const tc = TIER_CONFIG[tier.name] || TIER_CONFIG.Regular;
            const isCurrentTier = tier.name === currentTier;
            const isUnlocked = totalSpent >= tier.threshold;

            return (
              <div
                key={tier.name}
                className={`relative glass dark:glass rounded-xl p-5 border-2 transition-all duration-300 ${
                  isCurrentTier
                    ? `${tc.borderColor} shadow-lg`
                    : isUnlocked
                    ? 'border-gray-200 dark:border-white/10'
                    : 'border-gray-100 dark:border-white/5 opacity-60'
                }`}
              >
                {isCurrentTier && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-linear-to-r from-emerald-500 to-teal-500 text-white text-[10px] font-bold px-3 py-1 rounded-full shadow-md uppercase tracking-wider">
                    Current
                  </div>
                )}
                <div className="text-center">
                  <span className="text-3xl">{tc.emoji}</span>
                  <h3 className={`text-lg font-bold mt-2 ${tc.textColor}`}>{tier.name}</h3>
                  <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
                    {tier.threshold === 0 ? 'Starting tier' : `₱${tier.threshold.toLocaleString()} spent`}
                  </p>
                </div>
                <div className="mt-4 space-y-2 text-xs text-gray-600 dark:text-gray-300">
                  <div className="flex justify-between"><span>Points</span><span className="font-bold">{tier.multiplier}×</span></div>
                  <div className="flex justify-between"><span>Discount</span><span className="font-bold">{tier.discount > 0 ? `${tier.discount}%` : '—'}</span></div>
                  <div className="flex justify-between"><span>Birthday</span><span className="font-bold">{tier.birthdayBonus > 0 ? `${tier.birthdayBonus} pts` : '—'}</span></div>
                </div>
                {!isUnlocked && (
                  <div className="mt-3 flex items-center justify-center gap-1 text-xs text-gray-400">
                    <FiLock className="w-3 h-3" /> Locked
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Redeemable Rewards */}
      <div className="animate-fade-in-up delay-400">
        <h2 className="text-xl font-bold text-gray-800 dark:text-white mb-4 font-[Outfit]">Redeem with Points</h2>
        {isLoading ? (
          <ListSkeleton count={4} />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {rewards.map((r, i) => {
              const canRedeem = user.points >= r.cost;
              return (
                <div key={r.id} className={`glass dark:glass bg-white/80 dark:bg-white/5 rounded-xl p-4 border transition-all duration-300 animate-fade-in-up card-shine ${
                  canRedeem ? 'border-gray-200/50 dark:border-white/10 hover-lift' : 'border-gray-100 dark:border-white/5 opacity-60'
                }`} style={{ animationDelay: `${i * 80}ms` }}>
                  <div className="flex items-start gap-3">
                    <div className="w-11 h-11 shrink-0 bg-emerald-50 dark:bg-emerald-500/10 rounded-xl flex items-center justify-center text-emerald-600 dark:text-emerald-400">
                      <FiCoffee className="w-5 h-5" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <h3 className="font-semibold text-gray-800 dark:text-white text-sm">{r.title}</h3>
                        <span className="flex items-center gap-1 text-xs font-bold text-gray-500 dark:text-gray-400">
                          {!canRedeem && <FiLock className="w-3 h-3" />}
                          {r.cost} pts
                        </span>
                      </div>
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">{r.description}</p>
                      <button
                        type="button"
                        disabled={!canRedeem}
                        className="mt-3 btn-primary text-xs px-3 py-1.5 disabled:opacity-40 disabled:cursor-not-allowed disabled:bg-gray-400 disabled:shadow-none"
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
      </div>
    </main>
  );
};

const BenefitCard = ({ icon, title, value, description, color }) => {
  const colorMap = {
    emerald: 'bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400',
    amber: 'bg-amber-50 dark:bg-amber-500/10 text-amber-600 dark:text-amber-400',
    violet: 'bg-violet-50 dark:bg-violet-500/10 text-violet-600 dark:text-violet-400',
    rose: 'bg-rose-50 dark:bg-rose-500/10 text-rose-600 dark:text-rose-400',
  };

  return (
    <div className="glass dark:glass bg-white/80 dark:bg-white/5 rounded-xl p-5 border border-gray-200/50 dark:border-white/10 hover-lift transition-all">
      <div className={`w-10 h-10 rounded-xl ${colorMap[color]} flex items-center justify-center mb-3`}>
        {React.cloneElement(icon, { className: 'w-5 h-5' })}
      </div>
      <p className="text-2xl font-bold text-gray-800 dark:text-white">{value}</p>
      <p className="text-sm font-semibold text-gray-700 dark:text-gray-200 mt-1">{title}</p>
      <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">{description}</p>
    </div>
  );
};

export default Rewards;
