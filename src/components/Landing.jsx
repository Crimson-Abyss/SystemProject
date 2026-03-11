import React from 'react';
import { Link } from 'react-router-dom';
import logo from '../assets/logo.jpg';
import heroImage from '../assets/milktea-hero.png';
import ThemeToggle from './ThemeToggle';
import { FiCoffee, FiGift, FiStar, FiArrowRight } from 'react-icons/fi';

const Landing = () => {
  return (
    <main className="min-h-screen bg-gray-50 dark:bg-[#060810] relative overflow-hidden">
      {/* Animated background orbs */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] right-[-5%] w-[500px] h-[500px] bg-emerald-500/8 dark:bg-emerald-500/5 rounded-full blur-3xl animate-blob" />
        <div className="absolute bottom-[-10%] left-[-10%] w-[600px] h-[600px] bg-amber-500/6 dark:bg-amber-500/5 rounded-full blur-3xl animate-blob-2" />
        <div className="absolute top-[40%] left-[30%] w-[300px] h-[300px] bg-teal-500/5 dark:bg-teal-500/5 rounded-full blur-3xl animate-float-slow" />
      </div>

      {/* Navbar */}
      <header className="relative z-20 glass dark:glass-dark animate-fade-in-down">
        <div className="max-w-6xl mx-auto flex items-center justify-between px-4 sm:px-6 py-4">
          <Link to="/" className="flex items-center gap-3 group">
            <img src={logo} alt="InsteaG Logo" className="h-10 w-auto rounded-lg dark:mix-blend-screen transition-transform duration-300 group-hover:scale-105" />
            <span className="text-2xl font-bold text-gray-800 dark:text-white font-[Outfit] tracking-tight">InsteaG</span>
          </Link>
          <nav className="flex items-center gap-3 sm:gap-4">
            <ThemeToggle />
            <Link to="/login" className="text-sm text-gray-600 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white transition-colors">Log in</Link>
            <Link to="/signup" className="btn-primary text-sm px-4 py-2">Sign up</Link>
          </nav>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6 py-12 sm:py-16 lg:py-24">
        <div className="grid lg:grid-cols-2 gap-8 lg:gap-12 items-center">
          {/* Left: Text */}
          <div className="animate-fade-in-up">
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-gray-900 dark:text-white leading-[1.1] font-[Outfit]">
              Earn{' '}
              <span className="text-gradient">rewards</span>
              <br />
              with every sip.
            </h1>
            <p className="mt-5 text-base sm:text-lg text-gray-600 dark:text-gray-400 max-w-md leading-relaxed">
              Join InsteaG and collect points with every milktea, coffee, and pastry order. Redeem for freebies!
            </p>
            <div className="mt-8 flex flex-col sm:flex-row gap-3">
              <Link to="/signup" className="btn-primary text-base px-6 py-3 flex items-center justify-center gap-2 animate-pulse-glow">
                Get Started <FiArrowRight className="w-4 h-4" />
              </Link>
              <Link to="/login" className="btn-ghost text-base px-6 py-3 text-center dark:text-gray-300 dark:border-gray-600 text-gray-700 border-gray-300">
                I have an account
              </Link>
            </div>
            <p className="mt-6 text-sm text-gray-500 dark:text-gray-500">No credit card required. It only takes a minute.</p>
          </div>

          {/* Right: Hero Image */}
          <div className="relative flex justify-center lg:justify-end animate-fade-in-right delay-300">
            {/* Glow behind image */}
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <div className="w-72 h-72 sm:w-80 sm:h-80 bg-emerald-500/15 dark:bg-emerald-500/10 rounded-full blur-3xl" />
            </div>
            <img
              src={heroImage}
              alt="Delicious milktea drinks"
              className="relative z-10 w-full max-w-md lg:max-w-lg drop-shadow-2xl animate-float-slow"
            />
            {/* Floating decorative bubbles */}
            <div className="absolute top-10 right-5 w-4 h-4 rounded-full bg-emerald-400/30 dark:bg-emerald-400/20 blur-[1px] animate-float delay-500" />
            <div className="absolute bottom-20 left-10 w-3 h-3 rounded-full bg-amber-400/30 dark:bg-amber-400/20 blur-[1px] animate-float delay-700" />
            <div className="absolute top-1/2 right-0 w-2 h-2 rounded-full bg-teal-400/40 dark:bg-teal-400/30 animate-bounce-subtle delay-1000" />
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 pb-16 sm:pb-24">
        <div className="glass dark:glass rounded-2xl p-6 sm:p-8 animate-fade-in-up delay-500 hover-lift bg-white/60 dark:bg-white/5">
          <h2 className="text-center text-xl sm:text-2xl font-bold text-gray-800 dark:text-white mb-6 sm:mb-8 font-[Outfit]">Your Benefits</h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 sm:gap-8">
            <div className="flex flex-col items-center text-center group">
              <div className="w-14 h-14 rounded-xl bg-emerald-100 dark:bg-emerald-500/10 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform duration-300">
                <FiCoffee className="w-7 h-7 text-emerald-600 dark:text-emerald-400" />
              </div>
              <h3 className="font-semibold text-gray-800 dark:text-white text-sm">Collect Points</h3>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">With every purchase</p>
            </div>
            <div className="flex flex-col items-center text-center group">
              <div className="w-14 h-14 rounded-xl bg-amber-100 dark:bg-amber-500/10 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform duration-300">
                <FiGift className="w-7 h-7 text-amber-600 dark:text-amber-400" />
              </div>
              <h3 className="font-semibold text-gray-800 dark:text-white text-sm">Free Drinks & Pastries</h3>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Unlock tasty rewards</p>
            </div>
            <div className="flex flex-col items-center text-center group">
              <div className="w-14 h-14 rounded-xl bg-purple-100 dark:bg-purple-500/10 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform duration-300">
                <FiStar className="w-7 h-7 text-purple-600 dark:text-purple-400" />
              </div>
              <h3 className="font-semibold text-gray-800 dark:text-white text-sm">Birthday Exclusives</h3>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Special treats on your day</p>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
};

export default Landing;
