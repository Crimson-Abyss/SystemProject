import React, { useState, useEffect, useMemo } from 'react';
import { FiShoppingBag, FiStar, FiCoffee, FiSearch, FiDroplet } from 'react-icons/fi';
import { useCart } from './CartContext.jsx';
import { ProductGridSkeleton } from './SkeletonLoader.jsx';

const Products = () => {
  const [items, setItems] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState('Milktea');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSize, setSelectedSize] = useState({});
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

  const categories = ['Milktea', 'Coffee', 'Add-ons'];
  const categoryIcons = { Milktea: '🧋', Coffee: '☕', 'Add-ons': '✨' };

  const filteredItems = useMemo(() => {
    let filtered = items.filter(p => p.category === activeCategory);
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      filtered = filtered.filter(p => p.name.toLowerCase().includes(q) || (p.description && p.description.toLowerCase().includes(q)));
    }
    return filtered;
  }, [items, activeCategory, searchQuery]);

  // Group by subcategory
  const grouped = useMemo(() => {
    const groups = {};
    filteredItems.forEach(item => {
      const sub = item.subcategory || 'Other';
      if (!groups[sub]) groups[sub] = [];
      groups[sub].push(item);
    });
    return groups;
  }, [filteredItems]);

  const handleAddToCart = (product) => {
    const sizeKey = selectedSize[product.id];
    let price = product.price;
    let sizeName = null;

    if (sizeKey && product.sizes) {
      price = product.sizes[sizeKey];
      sizeName = sizeKey;
    }

    addToCart({
      ...product,
      price,
      selectedSize: sizeName,
      cartName: sizeName ? `${product.name} (${sizeName})` : product.name,
    });
  };

  const handleSizeSelect = (productId, sizeKey) => {
    setSelectedSize(prev => ({ ...prev, [productId]: sizeKey }));
  };

  return (
    <main className="flex-1 p-6 sm:p-10 overflow-y-auto bg-gray-50 dark:bg-[#0a0e18]">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6 gap-4 animate-fade-in">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 dark:text-white font-[Outfit]">Our Menu</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{filteredItems.length} items available</p>
        </div>
        {/* Search Bar */}
        <div className="relative w-full md:w-72">
          <FiSearch className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-500 w-4 h-4" />
          <input
            type="search"
            placeholder="Search menu..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-white dark:bg-white/5 border border-gray-200 dark:border-white/10 focus:ring-emerald-500 focus:border-emerald-500 transition-all dark:text-white dark:placeholder:text-gray-600"
          />
        </div>
      </div>

      {/* Category Tabs */}
      <div className="flex items-center gap-2 mb-8 overflow-x-auto pb-2">
        {categories.map(cat => (
          <button
            key={cat}
            onClick={() => { setActiveCategory(cat); setSearchQuery(''); }}
            className={`px-5 py-2.5 text-sm rounded-xl whitespace-nowrap transition-all duration-300 font-semibold flex items-center gap-2 ${
              activeCategory === cat
                ? 'bg-linear-to-r from-emerald-500 to-teal-500 text-white shadow-lg shadow-emerald-500/25 scale-105'
                : 'bg-white dark:bg-white/5 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-white/10 border border-gray-200 dark:border-white/10'
            }`}
          >
            <span className="text-lg">{categoryIcons[cat]}</span>
            {cat}
          </button>
        ))}
      </div>

      {/* Products Grid */}
      {isLoading ? (
        <ProductGridSkeleton count={8} />
      ) : (
        <div className="space-y-10">
          {Object.entries(grouped).map(([subcategory, products], groupIndex) => (
            <div key={subcategory} className="animate-fade-in-up" style={{ animationDelay: `${groupIndex * 100}ms` }}>
              {/* Subcategory Header */}
              <div className="flex items-center gap-3 mb-5">
                <div className="h-8 w-1 rounded-full bg-linear-to-b from-emerald-500 to-teal-500" />
                <h2 className="text-lg font-bold text-gray-800 dark:text-white font-[Outfit]">{subcategory}</h2>
                <span className="text-xs text-gray-400 dark:text-gray-500 bg-gray-100 dark:bg-white/5 px-2 py-0.5 rounded-full">{products.length}</span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {products.map((p, i) => (
                  <div
                    key={p.id}
                    className="bg-white dark:bg-white/5 rounded-xl shadow-md overflow-hidden border border-gray-200/50 dark:border-white/10 transition-all duration-300 hover-lift card-shine flex flex-col group animate-fade-in-up"
                    style={{ animationDelay: `${i * 50}ms` }}
                  >
                    {/* Image */}
                    <div className="relative w-full h-36 bg-gray-100 dark:bg-white/5 overflow-hidden">
                      {p.badge && (
                        <div className="absolute top-2 left-2 z-10 bg-linear-to-r from-emerald-500 to-teal-500 text-white text-[10px] font-bold px-2.5 py-1 rounded-full shadow-md uppercase tracking-wider">
                          {p.badge}
                        </div>
                      )}
                      {p.image ? (
                        <img src={p.image} alt={p.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" loading="lazy" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          {activeCategory === 'Coffee' ? <FiCoffee className="w-10 h-10 text-gray-300 dark:text-gray-700" /> : <FiDroplet className="w-10 h-10 text-gray-300 dark:text-gray-700" />}
                        </div>
                      )}
                    </div>

                    {/* Content */}
                    <div className="p-4 flex-1 flex flex-col">
                      <div className="flex items-start justify-between gap-2">
                        <h3 className="font-bold text-sm text-gray-800 dark:text-white leading-snug">{p.name}</h3>
                        {p.rating && (
                          <div className="flex items-center gap-0.5 text-amber-500 shrink-0">
                            <FiStar className="w-3 h-3 fill-current" />
                            <span className="text-xs font-medium text-gray-500 dark:text-gray-400">{p.rating}</span>
                          </div>
                        )}
                      </div>
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 flex-1 line-clamp-2">{p.description}</p>

                      {/* Size Options */}
                      {p.sizes && Object.keys(p.sizes).length > 0 && (
                        <div className="flex flex-wrap gap-1.5 mt-3">
                          {Object.entries(p.sizes).map(([size, sizePrice]) => (
                            <button
                              key={size}
                              onClick={() => handleSizeSelect(p.id, size)}
                              className={`text-[10px] font-semibold px-2 py-1 rounded-lg transition-all ${
                                selectedSize[p.id] === size
                                  ? 'bg-emerald-500 text-white shadow-sm'
                                  : 'bg-gray-100 dark:bg-white/5 text-gray-600 dark:text-gray-400 hover:bg-emerald-50 dark:hover:bg-emerald-500/10'
                              }`}
                            >
                              {size} ₱{sizePrice}
                            </button>
                          ))}
                        </div>
                      )}

                      {/* Price + Add */}
                      <div className="mt-3 flex items-center justify-between">
                        <span className="text-lg font-bold text-emerald-600 dark:text-emerald-400">
                          ₱{(selectedSize[p.id] && p.sizes ? p.sizes[selectedSize[p.id]] : p.price).toFixed ? (selectedSize[p.id] && p.sizes ? p.sizes[selectedSize[p.id]] : p.price).toFixed(2) : (selectedSize[p.id] && p.sizes ? p.sizes[selectedSize[p.id]] : p.price)}
                        </span>
                        <button
                          onClick={() => handleAddToCart(p)}
                          className="btn-primary text-xs px-3 py-2 flex items-center gap-1"
                        >
                          <FiShoppingBag className="h-3.5 w-3.5" /> Add
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}

          {filteredItems.length === 0 && (
            <div className="flex flex-col items-center justify-center py-20 text-gray-400 dark:text-gray-500">
              <FiSearch className="w-12 h-12 mb-4 opacity-50" />
              <p className="text-lg font-medium">No items found</p>
              <p className="text-sm mt-1">Try a different search or category</p>
            </div>
          )}
        </div>
      )}
    </main>
  );
};

export default Products;
