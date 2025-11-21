import React from 'react';
import { Link } from 'react-router-dom';

const Landing = () => {
  return (
    <main className="min-h-screen bg-gradient-to-b from-white to-emerald-50 dark:from-gray-900 dark:to-emerald-900/20">
      <header className="max-w-6xl mx-auto flex items-center justify-between px-6 py-5">
        <Link to="/" className="text-xl font-bold text-emerald-700 dark:text-emerald-500">Instea G</Link>
        <nav className="flex items-center gap-4">
          <Link to="/login" className="text-sm text-gray-700 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white">Log in</Link>
          <Link to="/signup" className="inline-flex items-center px-4 py-2 rounded-md bg-emerald-600 text-white text-sm font-medium hover:bg-emerald-700">Sign up</Link>
        </nav>
      </header>

      <section className="max-w-6xl mx-auto px-6 py-16 grid lg:grid-cols-2 gap-10 items-center">
        <div>
          <h1 className="text-4xl md:text-5xl font-extrabold text-gray-900 dark:text-white leading-tight">
            Earn rewards with every visit.
          </h1>
          <p className="mt-4 text-lg text-gray-600 dark:text-gray-300">
            Join our loyalty program and unlock exclusive offers, points, and perks at your favorite spots.
          </p>
          <div className="mt-8 flex gap-3">
            <Link to="/signup" className="inline-flex items-center px-5 py-3 rounded-md bg-emerald-600 text-white font-medium hover:bg-emerald-700">Get started</Link>
            <Link to="/login" className="inline-flex items-center px-5 py-3 rounded-md border border-gray-300 text-gray-800 hover:bg-gray-50 dark:border-gray-700 dark:text-gray-200 dark:hover:bg-gray-800">I have an account</Link>
          </div>
          <p className="mt-6 text-sm text-gray-500 dark:text-gray-400">No credit card required. It only takes a minute.</p>
        </div>
        <div className="bg-white dark:bg-gray-800/50 rounded-2xl shadow-sm p-6 border border-gray-100 dark:border-gray-800">
          <div className="aspect-[4/3] rounded-lg bg-neutral-900 dark:bg-neutral-900/80 flex items-center justify-center text-white text-center">
            <div>
              <div className="text-6xl">🎁</div>
              <div className="mt-3 font-medium">Loyalty made simple</div>
            </div>
          </div>
          <div className="mt-4 grid grid-cols-3 gap-3 text-sm text-gray-700 dark:text-gray-300">
            <div className="p-3 rounded-md bg-emerald-50 dark:bg-emerald-900/30 text-emerald-800 dark:text-emerald-400">Collect points</div>
            <div className="p-3 rounded-md bg-emerald-50 dark:bg-emerald-900/30 text-emerald-800 dark:text-emerald-400">Unlock rewards</div>
            <div className="p-3 rounded-md bg-emerald-50 dark:bg-emerald-900/30 text-emerald-800 dark:text-emerald-400">Exclusive offers</div>
          </div>
        </div>
      </section>
    </main>
  );
};

export default Landing;
