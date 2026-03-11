import React from 'react';
import { FiMapPin, FiClock, FiPhone, FiMail, FiNavigation } from 'react-icons/fi';
import interiorImage from '../assets/interior.jpg';

const Locations = () => {
  const address = "0015 P. Oliveros Street, Antipolo, 1870 Rizal";
  const googleMapsUrl = `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(address)}`;

  return (
    <main className="flex-1 p-6 sm:p-10 overflow-y-auto bg-gray-50 dark:bg-[#0a0e18]">
      <div className="max-w-6xl mx-auto text-gray-900 dark:text-gray-100">
        {/* Hero Image Section with overlay */}
        <div className="relative rounded-2xl overflow-hidden mb-8 animate-fade-in group">
          <img src={interiorImage} alt="InsteaG Shop Interior" className="w-full h-48 sm:h-64 object-cover group-hover:scale-105 transition-transform duration-700" />
          <div className="absolute inset-0 bg-linear-to-t from-black/60 via-black/20 to-transparent" />
          <div className="absolute bottom-0 left-0 right-0 p-6 sm:p-8">
            <h1 className="text-3xl sm:text-4xl font-bold text-white font-[Outfit] drop-shadow-lg">Visit Our Cozy Spot</h1>
            <p className="text-white/80 mt-1 max-w-lg text-sm sm:text-base">
              We're open every day to serve you the finest coffee and pastries in the heart of the city.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 sm:gap-12">
          {/* Left Column: Info */}
          <div className="space-y-6 animate-fade-in-left delay-200">
            <div className="glass dark:glass bg-white/80 dark:bg-white/5 rounded-xl p-5 border border-gray-200/50 dark:border-white/10 hover-lift transition-all duration-300 group">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-xl bg-emerald-50 dark:bg-emerald-500/10 flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform">
                  <FiMapPin className="w-6 h-6 text-emerald-600 dark:text-emerald-400" />
                </div>
                <div>
                  <h2 className="text-lg font-semibold">Address</h2>
                  <p className="text-gray-600 dark:text-gray-400 text-sm mt-1">{address}</p>
                  <a href={googleMapsUrl} target="_blank" rel="noopener noreferrer" className="mt-3 btn-primary inline-flex items-center gap-2 text-sm px-4 py-2">
                    <FiNavigation className="w-4 h-4" />
                    Get Directions
                  </a>
                </div>
              </div>
            </div>

            <div className="glass dark:glass bg-white/80 dark:bg-white/5 rounded-xl p-5 border border-gray-200/50 dark:border-white/10 hover-lift transition-all duration-300 group">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-xl bg-amber-50 dark:bg-amber-500/10 flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform">
                  <FiClock className="w-6 h-6 text-amber-600 dark:text-amber-400" />
                </div>
                <div>
                  <h2 className="text-lg font-semibold">Opening Hours</h2>
                  <p className="text-gray-600 dark:text-gray-400 text-sm mt-1">Open 24 Hours, 7 Days a Week</p>
                </div>
              </div>
            </div>

            <div className="glass dark:glass bg-white/80 dark:bg-white/5 rounded-xl p-5 border border-gray-200/50 dark:border-white/10 hover-lift transition-all duration-300 group">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-xl bg-purple-50 dark:bg-purple-500/10 flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform">
                  <FiPhone className="w-6 h-6 text-purple-600 dark:text-purple-400" />
                </div>
                <div>
                  <h2 className="text-lg font-semibold">Contact</h2>
                  <a href="tel:09354190625" className="text-gray-600 dark:text-gray-400 hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors text-sm block mt-1">0935 419 0625</a>
                  <a href="mailto:hello@insteag.com" className="text-gray-600 dark:text-gray-400 hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors text-sm">hello@insteag.com</a>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Map */}
          <div className="w-full min-h-[300px] sm:min-h-[400px] lg:h-full rounded-2xl overflow-hidden border border-gray-200/50 dark:border-white/10 shadow-lg animate-fade-in-right delay-300">
            <iframe src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3860.570743981031!2d121.1753443153569!3d14.62359598978853!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3397b8d73a96a66d%3A0x4a4d55a452384ea3!2sP.%20Oliveros%20St%2C%20Antipolo%2C%201870%20Rizal%2C%20Philippines!5e0!3m2!1sen!2sus!4v1671234567891!5m2!1sen!2sus" width="100%" height="100%" style={{border:0, minHeight: '300px'}} allowFullScreen="" loading="lazy" referrerPolicy="no-referrer-when-downgrade"></iframe>
          </div>
        </div>
      </div>
    </main>
  );
};

export default Locations;
