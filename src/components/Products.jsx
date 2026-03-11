import React, { useState, useEffect } from 'react';
import { FiShoppingBag, FiStar, FiCoffee, FiSearch } from 'react-icons/fi';
import { useCart } from './CartContext.jsx';
import { ProductGridSkeleton } from './SkeletonLoader.jsx';

const Products = () => {
  const [items, setItems] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const { addToCart } = useCart();

  useEffect(() => {
    const fetchProducts = async () => {
      setIsLoading(true);
      try {
        const response = await fetch('/api/products');
        if (response.ok) {
          const data = await response.json();
          setItems(data);
        }
      } catch (error) {
        console.error('Failed to fetch products:', error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchProducts();
  }, []);

  return (
    <main className="flex-1 p-6 sm:p-10 overflow-y-auto bg-gray-50 dark:bg-[#0a0e18]">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6 gap-4 animate-fade-in">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 dark:text-white font-[Outfit]">Our Menu</h1>
          {/* Category Chips */}
          <div className="flex items-center gap-2 mt-3 overflow-x-auto pb-1">
            {['All', 'Coffee', 'Tea', 'Pastries'].map((cat, i) => (
              <button key={cat} className={`px-4 py-1.5 text-sm rounded-full whitespace-nowrap transition-all duration-200 font-medium ${i === 0 ? 'bg-linear-to-r from-emerald-500 to-teal-500 text-white shadow-md shadow-emerald-500/20' : 'bg-gray-100 dark:bg-white/5 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-white/10'}`}>
                {cat}
              </button>
            ))}
          </div>
        </div>
        {/* Search Bar */}
        <div className="relative w-full md:w-64">
          <FiSearch className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-500 w-4 h-4" />
          <input type="search" placeholder="Search products..." className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-white dark:bg-white/5 border border-gray-200 dark:border-white/10 focus:ring-emerald-500 focus:border-emerald-500 transition-all dark:text-white dark:placeholder:text-gray-600" />
        </div>
      </div>

      {isLoading ? (
        <ProductGridSkeleton count={6} />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
          {items.map((p, i) => (
            <div key={p.id} className="bg-white dark:bg-white/5 rounded-xl shadow-md overflow-hidden border border-gray-200/50 dark:border-white/10 transition-all duration-300 hover-lift card-shine flex flex-col group animate-fade-in-up" style={{ animationDelay: `${i * 80}ms` }}>
              <div className="relative w-full h-40 bg-gray-100 dark:bg-white/5 overflow-hidden">
                {p.badge && (
                  <div className="absolute top-2 left-2 z-10 bg-linear-to-r from-emerald-500 to-teal-500 text-white text-xs font-bold px-2.5 py-1 rounded-full shadow-md">
                    {p.badge}
                  </div>
                )}
                {p.imageUrl ? (
                  <img src={p.imageUrl} alt={p.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <FiCoffee className="w-12 h-12 text-gray-300 dark:text-gray-700" />
                  </div>
                )}
              </div>
              <div className="p-4 flex-1 flex flex-col">
                <div className="flex items-center justify-between">
                  <h3 className="font-bold text-lg text-gray-800 dark:text-white truncate">{p.name}</h3>
                  <div className="flex items-center gap-1 text-amber-500">
                    <FiStar className="w-4 h-4 fill-current" />
                    <span className="text-sm font-medium text-gray-600 dark:text-gray-300">{p.rating}</span>
                  </div>
                </div>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1 flex-1">{p.description}</p>
                <div className="mt-4 flex items-center justify-between">
                  <span className="text-xl font-bold text-emerald-600 dark:text-emerald-400">₱{p.price.toFixed(2)}</span>
                  <button
                    onClick={() => addToCart(p)}
                    className="btn-primary text-sm px-3 py-2 flex items-center gap-1.5"
                  >
                    <FiShoppingBag className="h-4 w-4" /> Add
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </main>
  );
};

export default Products;
