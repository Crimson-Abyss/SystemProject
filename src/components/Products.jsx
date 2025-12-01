import React, { useState, useEffect } from 'react';
import { FiShoppingBag, FiStar } from 'react-icons/fi';
import { useCart } from './CartContext.jsx';

const Products = () => {
  const [items, setItems] = useState([]);
  const { addToCart } = useCart();

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await fetch('/api/products');
        if (response.ok) {
          const data = await response.json();
          setItems(data);
        }
      } catch (error) {
        console.error('Failed to fetch products:', error);
      }
    };
    fetchProducts();
  }, []);

  return (
    <main className="flex-1 p-10 overflow-y-auto bg-gray-50 dark:bg-slate-900">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6 gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-800 dark:text-white">Our Menu</h1>
          {/* Category Chips */}
          <div className="flex items-center gap-2 mt-2">
            <button className="px-3 py-1 text-sm rounded-full bg-emerald-600 text-white">All</button>
            <button className="px-3 py-1 text-sm rounded-full bg-gray-200 dark:bg-slate-700 text-gray-700 dark:text-gray-300">Coffee</button>
            <button className="px-3 py-1 text-sm rounded-full bg-gray-200 dark:bg-slate-700 text-gray-700 dark:text-gray-300">Tea</button>
            <button className="px-3 py-1 text-sm rounded-full bg-gray-200 dark:bg-slate-700 text-gray-700 dark:text-gray-300">Pastries</button>
          </div>
        </div>
        {/* Search Bar */}
        <div className="relative w-full md:w-64">
          <input type="search" placeholder="Search products..." className="w-full pl-4 pr-10 py-2 rounded-lg bg-white dark:bg-slate-800 border border-gray-300 dark:border-slate-700 focus:ring-emerald-500 focus:border-emerald-500" />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {items.map((p) => (
          <div key={p.id} className="bg-white dark:bg-slate-800 rounded-lg shadow-md overflow-hidden border border-gray-200 dark:border-white/10 transition-transform duration-200 hover:scale-105 hover:shadow-xl flex flex-col">
            <div className="relative w-full h-40 bg-gray-200 dark:bg-slate-700">
              {p.badge && (
                <div className="absolute top-2 left-2 bg-emerald-600 text-white text-xs font-bold px-2 py-1 rounded-full">
                  {p.badge}
                </div>
              )}
              {/* <img src={p.imageUrl} alt={p.name} className="w-full h-full object-cover" /> */}
            </div>
            <div className="p-4 flex-1 flex flex-col">
              <div className="flex items-center justify-between">
                <h3 className="font-bold text-lg text-gray-800 dark:text-white truncate">{p.name}</h3>
                <div className="flex items-center gap-1 text-amber-500">
                  <FiStar className="w-4 h-4" />
                  <span className="text-sm font-medium text-gray-600 dark:text-gray-300">{p.rating}</span>
                </div>
              </div>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1 flex-1">{p.description}</p>
              <div className="mt-4 flex items-center justify-between">
                <span className="text-xl font-bold text-emerald-600 dark:text-emerald-400">₱{p.price.toFixed(2)}</span>
                <button
                  onClick={() => addToCart(p)}
                  className="inline-flex items-center justify-center px-4 py-2 rounded-md bg-emerald-600 text-white text-sm font-medium hover:bg-emerald-700"
                >
                  <FiShoppingBag className="mr-2 h-4 w-4" /> Add
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </main>
  );
};

export default Products;
