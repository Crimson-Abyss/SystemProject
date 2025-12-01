import React from 'react';
import { FiMapPin, FiClock, FiPhone, FiMail, FiNavigation } from 'react-icons/fi';
import interiorImage from '../assets/interior.jpg'; // Assuming the image is in src/assets

const Locations = () => {
  const address = "0015 P. Oliveros Street, Antipolo, 1870 Rizal";
  const googleMapsUrl = `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(address)}`;

  return (
    <main className="flex-1 p-10 overflow-y-auto bg-white dark:bg-gray-950">
      <div className="max-w-6xl mx-auto text-gray-900 dark:text-gray-100">
        {/* Hero Image Section */}
        <img src={interiorImage} alt="InsteaG Shop Interior" className="w-full h-64 rounded-xl object-cover mb-8" />

        <div className="text-center mb-10">
          <h1 className="text-4xl font-bold mb-2">Visit Our Cozy Spot</h1>
          <p className="text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
            We're open every day to serve you the finest coffee and pastries in the heart of the city.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Left Column: Info */}
          <div className="space-y-8">
            <div className="flex items-start gap-4">
              <FiMapPin className="w-6 h-6 text-emerald-500 mt-1 shrink-0" />
              <div>
                <h2 className="text-xl font-semibold">Address</h2>
                <p className="text-gray-700 dark:text-gray-300">{address}</p>
                <a href={googleMapsUrl} target="_blank" rel="noopener noreferrer" className="mt-2 inline-flex items-center gap-2 px-4 py-2 rounded-md bg-emerald-600 text-white text-sm font-medium hover:bg-emerald-700">
                  <FiNavigation className="w-4 h-4" />
                  Get Directions
                </a>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <FiClock className="w-6 h-6 text-emerald-500 mt-1 shrink-0" />
              <div>
                <h2 className="text-xl font-semibold">Opening Hours</h2>
                <p className="text-gray-700 dark:text-gray-300">Open 24 Hours, 7 Days a Week</p>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <FiPhone className="w-6 h-6 text-emerald-500 mt-1 shrink-0" />
              <div>
                <h2 className="text-xl font-semibold">Contact</h2>
                <a href="tel:09354190625" className="text-gray-700 dark:text-gray-300 hover:underline">0935 419 0625</a>
                <p><a href="mailto:hello@insteag.com" className="text-gray-700 dark:text-gray-300 hover:underline">hello@insteag.com</a></p>
              </div>
            </div>
          </div>

          {/* Right Column: Map */}
          <div className="w-full min-h-[400px] lg:h-full rounded-xl overflow-hidden border border-gray-200 dark:border-slate-700">
            <iframe src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3860.570743981031!2d121.1753443153569!3d14.62359598978853!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3397b8d73a96a66d%3A0x4a4d55a452384ea3!2sP.%20Oliveros%20St%2C%20Antipolo%2C%201870%20Rizal%2C%20Philippines!5e0!3m2!1sen!2sus!4v1671234567891!5m2!1sen!2sus" width="100%" height="100%" style={{border:0}} allowFullScreen="" loading="lazy" referrerPolicy="no-referrer-when-downgrade"></iframe>
          </div>
        </div>
      </div>
    </main>
  );
};

export default Locations;
