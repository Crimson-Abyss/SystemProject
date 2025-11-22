import React from 'react';
import { Link } from 'react-router-dom';
import logo from '../assets/logo.jpg';

const Landing = () => {
  return (
    <main className="min-h-screen bg-gradient-to-b from-white to-emerald-50 dark:from-gray-900 dark:to-emerald-900/20">
      <header className="max-w-6xl mx-auto flex items-center justify-between px-6 py-5">
        <Link to="/" className="flex items-center gap-3">
          <img src={logo} alt="InsteaG Logo" className="h-10 w-auto dark:mix-blend-screen" />
          <span className="text-2xl font-bold text-emerald-700 dark:text-white">InsteaG</span>
        </Link>
        <nav className="flex items-center gap-4">
          <Link to="/login" className="text-sm text-gray-700 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white">Log in</Link>
          <Link to="/signup" className="inline-flex items-center px-4 py-2 rounded-md bg-emerald-600 text-white text-sm font-medium hover:bg-emerald-700">Sign up</Link>
        </nav>
      </header>

      <section className="max-w-6xl mx-auto px-6 py-16 grid lg:grid-cols-2 gap-10 items-center">
        <div>
          <h1 className="text-4xl md:text-5xl font-extrabold text-gray-900 dark:text-white leading-tight">
            Earn <span className="bg-gradient-to-r from-green-400 via-teal-400 to-emerald-400 bg-clip-text text-transparent">rewards</span> with every visit.
          </h1>
          <p className="mt-4 text-lg text-gray-600 dark:text-gray-300">
            Join our loyalty program and unlock exclusive offers, points, and perks at your favorite spots.
          </p>
          <div className="mt-8 flex gap-3">
            <Link to="/signup" className="inline-flex items-center px-5 py-3 rounded-md bg-emerald-600 text-white font-medium hover:bg-emerald-700">Get started</Link>
            <Link to="/login" className="inline-flex items-center px-5 py-3 rounded-lg font-medium border border-slate-600 text-slate-300 hover:text-white hover:border-white transition-colors">I have an account</Link>
          </div>
          <p className="mt-6 text-sm text-gray-600 dark:text-slate-400">No credit card required. It only takes a minute.</p>
        </div>
        <div className="bg-white dark:bg-slate-800/50 rounded-2xl shadow-lg p-4 border border-gray-100 dark:border-slate-800">
          {/* Add overflow-hidden to the phone frame */}
          <div className="w-full max-w-sm mx-auto bg-slate-900 rounded-3xl shadow-2xl p-3 border-4 border-slate-700 overflow-hidden h-auto pb-8">
            <div className="bg-emerald-500 text-white text-center p-4">
              {/* Updated points display */}
              <h2 className="text-5xl font-bold text-white drop-shadow-md">1,250</h2>
              <p className="text-emerald-100 text-sm">Points</p>
            </div>
            <div className="p-4 mt-4">
              <h3 className="font-semibold text-white mb-3">Your Benefits</h3>
              <ul className="space-y-3 text-sm text-slate-300">
                <li className="flex items-center gap-2">✅ <span className="font-medium text-white">Collect points</span> with every purchase</li>
                <li className="flex items-center gap-2">✅ <span className="font-medium text-white">Unlock rewards</span> like free drinks</li>
                <li className="flex items-center gap-2">✅ Get <span className="font-medium text-white">exclusive offers</span> on your birthday</li>
              </ul>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
};

export default Landing;
