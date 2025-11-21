import React from 'react';

const Locations = () => {
  return (
    <main className="flex-1 p-10 overflow-y-auto bg-white dark:bg-gray-950">
      <div className="max-w-5xl mx-auto text-gray-900 dark:text-gray-100">
        <h1 className="text-3xl font-bold mb-2">Our Location</h1>
        <p className="text-gray-600 dark:text-gray-300 mb-8">
          Visit us at our cozy spot in the heart of the city. We're open every day to serve you the finest coffee and pastries.
        </p>

        <section className="space-y-6">
          <div>
            <h2 className="text-lg font-semibold mb-1">Address</h2>
            <p className="text-gray-700 dark:text-gray-300">123 Velvet Lane, City Center, 10001</p>
          </div>

          <div>
            <h2 className="text-lg font-semibold mb-1">Opening Hours</h2>
            <p className="text-gray-700 dark:text-gray-300">Monday - Friday: 7AM - 8PM</p>
            <p className="text-gray-700 dark:text-gray-300">Saturday - Sunday: 8AM - 9PM</p>
          </div>

          <div>
            <h2 className="text-lg font-semibold mb-1">Contact</h2>
            <p className="text-gray-700 dark:text-gray-300">+1 (555) 123-4567</p>
            <p className="text-gray-700 dark:text-gray-300">hello@insteag.com</p>
          </div>

          <div>
            <div className="mt-4 w-full h-72 rounded-xl border border-gray-200 dark:border-gray-800 bg-gray-100 dark:bg-gray-900 flex items-center justify-center text-gray-500 dark:text-gray-400">
              Map Placeholder
            </div>
          </div>
        </section>
      </div>
    </main>
  );
};

export default Locations;
