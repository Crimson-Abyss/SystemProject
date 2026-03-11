import React from 'react';

// Skeleton building blocks
const SkeletonBox = ({ className = '' }) => (
  <div className={`skeleton ${className}`} />
);

// Card skeleton for products, rewards, etc.
export const CardSkeleton = () => (
  <div className="bg-white dark:bg-slate-800/50 rounded-xl overflow-hidden border border-gray-200 dark:border-white/5">
    <SkeletonBox className="w-full h-40" />
    <div className="p-4 space-y-3">
      <SkeletonBox className="h-5 w-3/4" />
      <SkeletonBox className="h-4 w-full" />
      <div className="flex items-center justify-between pt-2">
        <SkeletonBox className="h-6 w-20" />
        <SkeletonBox className="h-9 w-16 rounded-md" />
      </div>
    </div>
  </div>
);

// Grid of card skeletons
export const ProductGridSkeleton = ({ count = 6 }) => (
  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
    {Array.from({ length: count }).map((_, i) => (
      <CardSkeleton key={i} />
    ))}
  </div>
);

// List skeleton for history, rewards list
export const ListSkeleton = ({ count = 5 }) => (
  <div className="space-y-4">
    {Array.from({ length: count }).map((_, i) => (
      <div key={i} className="flex items-center gap-4">
        <SkeletonBox className="w-10 h-10 rounded-full shrink-0" />
        <div className="flex-1 space-y-2">
          <SkeletonBox className="h-4 w-3/4" />
          <SkeletonBox className="h-3 w-1/2" />
        </div>
        <SkeletonBox className="h-4 w-16" />
      </div>
    ))}
  </div>
);

// Profile skeleton
export const ProfileSkeleton = () => (
  <div className="max-w-4xl mx-auto space-y-8">
    {/* Header */}
    <div className="flex items-center gap-5">
      <SkeletonBox className="w-20 h-20 rounded-full shrink-0" />
      <div className="space-y-3 flex-1">
        <SkeletonBox className="h-7 w-48" />
        <SkeletonBox className="h-5 w-32" />
        <SkeletonBox className="h-2 w-full max-w-xs rounded-full" />
      </div>
    </div>
    {/* Info card */}
    <div className="bg-white dark:bg-gray-800/50 p-8 rounded-xl border border-gray-200 dark:border-gray-800 space-y-6">
      <SkeletonBox className="h-6 w-40" />
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="space-y-2">
            <SkeletonBox className="h-4 w-20" />
            <SkeletonBox className="h-10 w-full rounded-md" />
          </div>
        ))}
      </div>
    </div>
  </div>
);

// Dashboard / Home skeleton
export const DashboardSkeleton = () => (
  <div className="space-y-10">
    {/* Header */}
    <div className="flex flex-col md:flex-row items-start justify-between gap-6">
      <div className="flex items-center gap-4">
        <SkeletonBox className="w-16 h-16 rounded-full shrink-0" />
        <div className="space-y-3">
          <SkeletonBox className="h-8 w-64" />
          <SkeletonBox className="h-4 w-40" />
        </div>
      </div>
      <SkeletonBox className="h-24 w-full md:w-72 rounded-xl" />
    </div>
    {/* Offers */}
    <div className="space-y-4">
      <SkeletonBox className="h-6 w-40" />
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {Array.from({ length: 3 }).map((_, i) => (
          <SkeletonBox key={i} className="h-32 rounded-xl" />
        ))}
      </div>
    </div>
    {/* Products */}
    <div className="space-y-4">
      <SkeletonBox className="h-6 w-48" />
      <ProductGridSkeleton count={3} />
    </div>
  </div>
);

export default SkeletonBox;
