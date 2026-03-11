import React from 'react';

const LoadingScreen = () => {
  return (
    <div className="fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-gray-950 dark:bg-gray-950 transition-opacity duration-500">
      {/* Background gradient orbs */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-emerald-500/10 rounded-full blur-3xl animate-blob" />
        <div className="absolute bottom-1/4 right-1/4 w-48 h-48 bg-teal-500/10 rounded-full blur-3xl animate-blob-2" />
      </div>

      {/* Logo and loading indicator */}
      <div className="relative z-10 flex flex-col items-center gap-6">
        {/* Animated logo circle */}
        <div className="relative">
          <div className="w-20 h-20 rounded-full bg-linear-to-br from-emerald-500 to-teal-500 flex items-center justify-center animate-logo-pulse shadow-lg shadow-emerald-500/30">
            <span className="text-3xl font-bold text-white font-[Outfit]">I</span>
          </div>
          {/* Spinning ring */}
          <div className="absolute inset-[-4px] rounded-full border-2 border-transparent border-t-emerald-400 animate-spin" />
        </div>

        {/* Brand name */}
        <h1 className="text-2xl font-bold text-white font-[Outfit] tracking-tight">
          Instea<span className="text-gradient">G</span>
        </h1>

        {/* Loading dots */}
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-emerald-400 loading-dot" />
          <div className="w-2 h-2 rounded-full bg-emerald-400 loading-dot" />
          <div className="w-2 h-2 rounded-full bg-emerald-400 loading-dot" />
        </div>

        <p className="text-sm text-gray-400 mt-2">Brewing your experience...</p>
      </div>
    </div>
  );
};

export default LoadingScreen;
