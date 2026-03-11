import React, { useState, useEffect, useCallback } from 'react';
import { FaEdit, FaTrash, FaPlus, FaBox, FaGift, FaSearch } from 'react-icons/fa';

const AdminProducts = () => {
  const [activeTab, setActiveTab] = useState('products');
  const [items, setItems] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [formData, setFormData] = useState({});
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);

  const fetchItems = useCallback(async () => {
    setLoading(true);
    try {
      const endpoint = activeTab === 'products' ? '/api/products' : '/api/rewards';
      const response = await fetch(endpoint);
      if (response.ok) {
        const data = await response.json();
        setItems(data);
      }
    } catch (error) {
      console.error('Error fetching items:', error);
    } finally {
      setLoading(false);
    }
  }, [activeTab]);

  useEffect(() => {
    fetchItems();
  }, [fetchItems]);

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this item?')) return;
    const token = localStorage.getItem('token');

    if (!token){
      alert("You are not logged in")
      return;
    }
    
    try {
      const endpoint = activeTab === 'products' ? `/api/products/${id}` : `/api/rewards/${id}`;
      const response = await fetch(endpoint, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (response.ok) {
        fetchItems();
      }
    } catch (error) {
      console.error('Error deleting item:', error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem('token');

    if (!token){
      alert("You are not logged in")
      return;
    }
    try {
      const endpoint = activeTab === 'products' ? '/api/products' : '/api/rewards';
      const url = editingItem ? `${endpoint}/${editingItem.id}` : endpoint;
      const method = editingItem ? 'PUT' : 'POST';
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(formData)
      });

      if (response.ok) {
        setIsModalOpen(false);
        setEditingItem(null);
        setFormData({});
        fetchItems();
      }
    } catch (error) {
      console.error('Error saving item:', error);
    }
  };

  const openModal = (item = null) => {
    setEditingItem(item);
    setFormData(item || {});
    setIsModalOpen(true);
  };

  const filteredItems = items.filter(item => {
    const searchString = (item.name || item.title || '').toLowerCase() + ' ' + (item.description || '').toLowerCase();
    return searchString.includes(searchQuery.toLowerCase());
  });

  return (
    <div className="space-y-6 animate-fade-in-up">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-white font-['Outfit'] mb-1">
            Catalog Management
          </h2>
          <p className="text-gray-400 text-sm">Manage your store's products and loyalty rewards.</p>
        </div>
        <button
          onClick={() => openModal()}
          className="w-full sm:w-auto flex items-center justify-center px-4 py-2.5 bg-emerald-500 hover:bg-emerald-400 text-white rounded-xl font-bold transition-all shadow-lg shadow-emerald-500/20 group"
        >
          <FaPlus className="mr-2 group-hover:rotate-90 transition-transform" /> Add New Item
        </button>
      </div>

      <div className="glass-dark bg-[#0a0f1b]/80 rounded-2xl shadow-xl border border-white/ overflow-hidden">
        {/* Tabs and Search */}
        <div className="p-4 sm:p-6 border-b border-white/ flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="flex w-full md:w-auto bg-black/40 rounded-xl p-1 border border-white/5">
            <button
              onClick={() => setActiveTab('products')}
              className={`flex-1 md:flex-none flex items-center justify-center gap-2 px-6 py-2 rounded-lg font-bold text-sm transition-all ${
                activeTab === 'products'
                  ? 'bg-emerald-500/20 text-emerald-400 shadow-[inset_0_1px_1px_rgba(255,255,255,0.05)] ring-1 ring-emerald-500/30'
                  : 'text-gray-400 hover:text-white hover:bg-white/5'
              }`}
            >
              <FaBox /> Products
            </button>
            <button
              onClick={() => setActiveTab('rewards')}
              className={`flex-1 md:flex-none flex items-center justify-center gap-2 px-6 py-2 rounded-lg font-bold text-sm transition-all ${
                activeTab === 'rewards'
                  ? 'bg-amber-500/20 text-amber-400 shadow-[inset_0_1px_1px_rgba(255,255,255,0.05)] ring-1 ring-amber-500/30'
                  : 'text-gray-400 hover:text-white hover:bg-white/5'
              }`}
            >
              <FaGift /> Rewards
            </button>
          </div>

          <div className="relative w-full md:w-auto">
            <FaSearch className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-500" />
            <input
              type="text"
              placeholder={`Search ${activeTab}...`}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full md:w-64 pl-10 pr-4 py-2 bg-black/40 border border-white/10 rounded-xl text-white placeholder:text-gray-600 focus:border-emerald-500 focus:ring-emerald-500/30 transition-all text-sm"
            />
          </div>
        </div>

        {/* Desktop Table View */}
        <div className="hidden md:block overflow-x-auto">
          {loading ? (
             <div className="flex flex-col items-center justify-center p-12 text-gray-500 animate-pulse">
                <div className="w-8 h-8 border-4 border-emerald-500/20 border-t-emerald-500 rounded-full animate-spin mb-4" />
                <p>Loading items...</p>
             </div>
          ) : (
             <table className="w-full text-left border-collapse">
                <thead className="bg-black/40 border-b border-white/ text-gray-400 text-xs uppercase tracking-wider font-bold">
                  <tr>
                    <th className="px-6 py-4">Item Details</th>
                    <th className="px-6 py-4">Description</th>
                    <th className="px-6 py-4">
                      {activeTab === 'products' ? 'Price' : 'Cost'}
                    </th>
                    <th className="px-6 py-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/">
                  {filteredItems.length > 0 ? filteredItems.map((item) => (
                    <tr key={item.id} className="hover:bg-white/ transition-colors group">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                           <div className="w-10 h-10 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center text-xl overflow-hidden shadow-inner">
                              {item.imageUrl ? <img src={item.imageUrl} alt={item.name} className="w-full h-full object-cover" /> : (activeTab === 'products' ? '🧋' : '🎁')}
                           </div>
                           <div>
                              <div className="font-bold text-white text-sm">{item.name || item.title}</div>
                              {item.category && <div className="text-xs text-gray-500 mt-0.5">{item.category}</div>}
                           </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-400 max-w-xs truncate">
                        {item.description}
                      </td>
                      <td className="px-6 py-4">
                         <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold border ${
                            activeTab === 'products' 
                               ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' 
                               : 'bg-amber-500/10 text-amber-400 border-amber-500/20'
                         }`}>
                           {activeTab === 'products' ? `₱${parseFloat(typeof item.price === 'string' ? item.price.replace('₱','') : item.price).toFixed(2)}` : `${item.cost} pts`}
                         </span>
                      </td>
                      <td className="px-6 py-4">
                         <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                            <button onClick={() => openModal(item)} className="p-2 text-gray-400 hover:text-emerald-400 hover:bg-emerald-500/10 rounded-lg transition-colors" title="Edit Item">
                              <FaEdit />
                            </button>
                            <button onClick={() => handleDelete(item.id)} className="p-2 text-gray-400 hover:text-rose-400 hover:bg-rose-500/10 rounded-lg transition-colors" title="Delete Item">
                              <FaTrash />
                            </button>
                         </div>
                      </td>
                    </tr>
                  )) : (
                     <tr>
                        <td colSpan="4" className="px-6 py-12 text-center text-gray-500">
                           No items found matching your search.
                        </td>
                     </tr>
                  )}
                </tbody>
             </table>
          )}
        </div>

        {/* Mobile Card View */}
        <div className="md:hidden p-4 space-y-4">
            {loading ? (
                 <div className="flex justify-center p-8"><div className="w-8 h-8 border-4 border-emerald-500/20 border-t-emerald-500 rounded-full animate-spin" /></div>
            ) : filteredItems.length > 0 ? filteredItems.map((item) => (
                <div key={item.id} className="bg-white/ border border-white/ rounded-xl p-4 flex flex-col gap-3">
                    <div className="flex items-center gap-3">
                         <div className="w-12 h-12 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center text-xl overflow-hidden shadow-inner flex-shrink-0">
                            {item.imageUrl ? <img src={item.imageUrl} alt={item.name} className="w-full h-full object-cover" /> : (activeTab === 'products' ? '🧋' : '🎁')}
                         </div>
                         <div className="flex-1">
                             <div className="font-bold text-white">{item.name || item.title}</div>
                             <div className={`mt-1 inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold border ${
                            activeTab === 'products' 
                               ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' 
                               : 'bg-amber-500/10 text-amber-400 border-amber-500/20'
                         }`}>
                           {activeTab === 'products' ? `₱${typeof item.price === 'string' ? parseFloat(item.price.replace('₱','')).toFixed(2) : item.price?.toFixed(2)}` : `${item.cost} pts`}
                         </div>
                         </div>
                    </div>
                    <p className="text-sm text-gray-400 line-clamp-2">{item.description}</p>
                    <div className="flex justify-end gap-2 pt-2 border-t border-white/">
                         <button onClick={() => openModal(item)} className="p-2 text-emerald-400 bg-emerald-500/10 hover:bg-emerald-500/20 rounded-lg transition-colors text-sm font-medium flex items-center gap-1">
                              <FaEdit /> Edit
                            </button>
                            <button onClick={() => handleDelete(item.id)} className="p-2 text-rose-400 bg-rose-500/10 hover:bg-rose-500/20 rounded-lg transition-colors text-sm font-medium flex items-center gap-1">
                              <FaTrash /> Delete
                            </button>
                    </div>
                </div>
            )) : (
                 <div className="text-center p-8 text-gray-500">No items found.</div>
            )}
        </div>
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-[#060810]/80 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fade-in">
          <div className="glass-dark bg-[#0a0f1b] rounded-2xl max-w-lg w-full p-6 sm:p-8 shadow-2xl border border-white/10 transform transition-all shadow-emerald-500/10">
            <h3 className="text-xl font-bold mb-6 text-white font-['Outfit'] flex items-center gap-2">
              <div className="p-2 bg-emerald-500/20 text-emerald-400 rounded-lg">
                 {activeTab === 'products' ? <FaBox size={16} /> : <FaGift size={16} />}
              </div>
              {editingItem ? 'Edit' : 'Add New'} {activeTab === 'products' ? 'Product' : 'Reward'}
            </h3>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1">Name / Title</label>
                <input
                  type="text"
                  required
                  className="w-full px-4 py-2.5 rounded-xl bg-black/40 border border-white/10 text-white focus:border-emerald-500 focus:ring-emerald-500/30 transition-all text-sm"
                  value={formData.name || formData.title || ''}
                  onChange={(e) => setFormData({ ...formData, [activeTab === 'products' ? 'name' : 'title']: e.target.value })}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1">Description</label>
                <textarea
                  required
                  rows={3}
                  className="w-full px-4 py-2.5 rounded-xl bg-black/40 border border-white/10 text-white focus:border-emerald-500 focus:ring-emerald-500/30 transition-all text-sm resize-none custom-scrollbar"
                  value={formData.description || ''}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-400 mb-1">
                      {activeTab === 'products' ? 'Price (₱)' : 'Cost (Points)'}
                    </label>
                    <input
                      type="number"
                      step={activeTab === 'products' ? "0.01" : "1"}
                      required
                      className="w-full px-4 py-2.5 rounded-xl bg-black/40 border border-white/10 text-white focus:border-emerald-500 focus:ring-emerald-500/30 transition-all text-sm"
                      value={formData.price || formData.cost || ''}
                      onChange={(e) => setFormData({ ...formData, [activeTab === 'products' ? 'price' : 'cost']: e.target.value ? parseFloat(e.target.value) : '' })}
                    />
                  </div>
                  {activeTab === 'products' && (
                    <div>
                        <label className="block text-sm font-medium text-gray-400 mb-1">Category</label>
                        <input
                          type="text"
                          className="w-full px-4 py-2.5 rounded-xl bg-black/40 border border-white/10 text-white focus:border-emerald-500 focus:ring-emerald-500/30 transition-all text-sm"
                          value={formData.category || ''}
                          onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                          placeholder="e.g., Milk Tea"
                        />
                      </div>
                  )}
              </div>
              {activeTab === 'products' && (
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-400 mb-1">Rating</label>
                    <input
                      type="number"
                      step="0.1"
                      min="0"
                      max="5"
                      className="w-full px-4 py-2.5 rounded-xl bg-black/40 border border-white/10 text-white focus:border-emerald-500 focus:ring-emerald-500/30 transition-all text-sm"
                      value={formData.rating || ''}
                      onChange={(e) => setFormData({ ...formData, rating: e.target.value ? parseFloat(e.target.value) : '' })}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-400 mb-1">Badge (Optional)</label>
                    <input
                      type="text"
                      className="w-full px-4 py-2.5 rounded-xl bg-black/40 border border-white/10 text-white focus:border-emerald-500 focus:ring-emerald-500/30 transition-all text-sm"
                      value={formData.badge || ''}
                      onChange={(e) => setFormData({ ...formData, badge: e.target.value })}
                      placeholder="e.g., Bestseller"
                    />
                  </div>
                </div>
              )}
              <div className="flex justify-end gap-3 pt-4 border-t border-white/5 mt-6">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-5 py-2.5 text-sm font-bold text-gray-400 bg-white/5 hover:bg-white/10 hover:text-white rounded-xl transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 text-sm font-bold text-white bg-emerald-500 hover:bg-emerald-400 rounded-xl shadow-lg shadow-emerald-500/20 transition-all"
                >
                  {editingItem ? 'Save Changes' : 'Create Item'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminProducts;
