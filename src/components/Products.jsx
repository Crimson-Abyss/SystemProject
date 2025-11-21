import React from 'react';
import { FiShoppingBag, FiStar } from 'react-icons/fi';

const Products = () => {
  const items = [
    { id: 1, name: 'House Blend Coffee', price: '$3.50', rating: 4.6 },
    { id: 2, name: 'Matcha Latte', price: '$4.20', rating: 4.8 },
    { id: 3, name: 'Blueberry Muffin', price: '$2.80', rating: 4.4 },
    { id: 4, name: 'Iced Caramel Latte', price: '$4.70', rating: 4.7 },
    { id: 5, name: 'Vegan Brownie', price: '$3.10', rating: 4.5 },
  ];

  return (
    <main className="flex-1 p-10 overflow-y-auto">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-800 dark:text-white">Products</h1>
        <div className="text-sm text-gray-500 dark:text-gray-400">Browse and explore menu items</div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {items.map((p) => (
          <div key={p.id} className="bg-white dark:bg-gray-800 rounded-lg shadow-sm overflow-hidden border border-gray-100 dark:border-gray-700">
            <div className="w-full h-32 bg-gray-200 dark:bg-gray-700" />
            <div className="p-4">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold text-gray-800 dark:text-white">{p.name}</h3>
                <span className="text-sm text-gray-700 dark:text-gray-300">{p.price}</span>
              </div>
              <div className="mt-1 flex items-center text-amber-500 text-sm"><FiStar className="mr-1" /> {p.rating}</div>
              <button className="mt-3 inline-flex items-center px-3 py-1.5 rounded-md border border-gray-300 dark:border-gray-600 text-gray-800 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700 text-sm">
                <FiShoppingBag className="mr-2" /> View Details
              </button>
            </div>
          </div>
        ))}
      </div>
    </main>
  );
};

export default Products;
