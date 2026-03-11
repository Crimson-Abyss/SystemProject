import React, { useState, useEffect } from 'react';
import { FaUserShield, FaUserPlus, FaSearch } from 'react-icons/fa';

const AdminUsers = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await fetch('/api/users', {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (response.ok) {
          const data = await response.json();
          setUsers(data);
        }
      } catch (error) {
        console.error('Error fetching users:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchUsers();
  }, []);

  const filteredUsers = users.filter(user => {
    const searchString = `${user.fullName} ${user.email} ${user.role} ${user.membershipTier}`.toLowerCase();
    return searchString.includes(searchQuery.toLowerCase());
  });

  return (
    <div className="space-y-6 animate-fade-in-up">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-white font-['Outfit'] mb-1">
            User Management
          </h2>
          <p className="text-gray-400 text-sm">View and manage customer accounts and administrators.</p>
        </div>
        <button className="w-full sm:w-auto flex items-center justify-center px-4 py-2.5 bg-blue-500 hover:bg-blue-400 text-white rounded-xl font-bold transition-all shadow-lg shadow-blue-500/20 group">
          <FaUserPlus className="mr-2 group-hover:scale-110 transition-transform" /> Add Admin
        </button>
      </div>
      
      <div className="glass-dark bg-[#0a0f1b]/80 rounded-2xl shadow-xl border border-white/ overflow-hidden flex flex-col">
        {/* Search */}
        <div className="p-4 sm:p-6 border-b border-white/ flex items-center justify-between">
           <div className="relative w-full max-w-md">
            <FaSearch className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-500" />
            <input
              type="text"
              placeholder="Search users..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-black/40 border border-white/10 rounded-xl text-white placeholder:text-gray-600 focus:border-blue-500 focus:ring-blue-500/30 transition-all text-sm"
            />
          </div>
          <div className="hidden sm:block text-sm font-semibold text-gray-400 bg-white/5 px-3 py-1 rounded-full border border-white/5">
             Total: {users.length}
          </div>
        </div>

        {/* Desktop Table View */}
        <div className="hidden md:block overflow-x-auto">
          {loading ? (
             <div className="flex flex-col items-center justify-center p-12 text-gray-500 animate-pulse">
                <div className="w-8 h-8 border-4 border-blue-500/20 border-t-blue-500 rounded-full animate-spin mb-4" />
                <p>Loading users...</p>
             </div>
          ) : (
            <table className="min-w-full text-left border-collapse">
            <thead className="bg-black/40 border-b border-white/ text-gray-400 text-xs uppercase tracking-wider font-bold">
              <tr>
                <th className="px-6 py-4">User</th>
                <th className="px-6 py-4">Role</th>
                <th className="px-6 py-4">Points</th>
                <th className="px-6 py-4">Tier</th>
                <th className="px-6 py-4">Joined</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/">
              {filteredUsers.length > 0 ? filteredUsers.map((user) => (
                <tr key={user.id} className="hover:bg-white/ transition-colors group">
                  <td className="px-6 py-4">
                     <div className="flex items-center gap-3">
                         <div className="w-10 h-10 rounded-full bg-linear-to-br from-blue-500/20 to-purple-500/20 border border-white/10 flex items-center justify-center text-white font-bold shadow-inner flex-shrink-0">
                            {user.fullName ? user.fullName.charAt(0).toUpperCase() : '?'}
                         </div>
                         <div>
                            <div className="font-bold text-white text-sm">{user.fullName || 'Anonymous'}</div>
                            <div className="text-xs text-gray-500">{user.email || 'No email'}</div>
                         </div>
                     </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold border ${
                      user.role === 'admin' 
                         ? 'bg-purple-500/10 text-purple-400 border-purple-500/20 shadow-[0_0_10px_rgba(168,85,247,0.1)]' 
                         : 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                    }`}>
                      {user.role === 'admin' && <FaUserShield className="text-[10px]" />}
                      {user.role.toUpperCase()}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-white font-bold text-sm bg-white/5 px-2.5 py-1 rounded-lg border border-white/5">{user.points}</span>
                  </td>
                  <td className="px-6 py-4">
                     <span className={`inline-flex items-center px-2 py-0.5 rounded textxs font-bold ${
                         user.membershipTier === 'Gold' ? 'text-amber-400 bg-amber-500/10' :
                         user.membershipTier === 'Silver' ? 'text-gray-300 bg-gray-500/10' :
                         'text-orange-400 bg-orange-500/10'
                     }`}>
                        {user.membershipTier}
                     </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500 font-medium">
                    {new Date(user.createdAt).toLocaleDateString()}
                  </td>
                </tr>
              )) : (
                 <tr>
                    <td colSpan="5" className="px-6 py-12 text-center text-gray-500">
                       No users found matching your search.
                    </td>
                 </tr>
              )}
            </tbody>
          </table>
          )}
        </div>

        {/* Mobile Card View */}
        <div className="md:hidden p-4 space-y-4 flex-1 overflow-y-auto">
            {loading ? (
                 <div className="flex justify-center p-8"><div className="w-8 h-8 border-4 border-blue-500/20 border-t-blue-500 rounded-full animate-spin" /></div>
            ) : filteredUsers.length > 0 ? filteredUsers.map((user) => (
                <div key={user.id} className="bg-white/ border border-white/ rounded-xl p-4 flex flex-col gap-3 relative overflow-hidden">
                    {user.role === 'admin' && <div className="absolute top-0 right-0 w-16 h-16 bg-linear-to-bl from-purple-500/20 to-transparent pointer-events-none rounded-bl-3xl" />}
                    <div className="flex items-center gap-3">
                         <div className="w-12 h-12 rounded-full bg-linear-to-br from-blue-500/20 to-purple-500/20 border border-white/10 flex items-center justify-center text-white font-bold text-lg shadow-inner flex-shrink-0">
                            {user.fullName ? user.fullName.charAt(0).toUpperCase() : '?'}
                         </div>
                         <div className="flex-1">
                             <div className="font-bold text-white">{user.fullName}</div>
                             <div className="text-xs text-gray-500 mt-0.5">{user.email}</div>
                         </div>
                    </div>
                    <div className="grid grid-cols-2 gap-2 mt-2 pt-3 border-t border-white/">
                         <div>
                            <span className="text-[10px] text-gray-500 uppercase font-bold tracking-wider">Role</span>
                            <div className={`mt-0.5 inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-bold border ${
                              user.role === 'admin' 
                                 ? 'bg-purple-500/10 text-purple-400 border-purple-500/20' 
                                 : 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                            }`}>
                              {user.role === 'admin' && <FaUserShield />}
                              {user.role.toUpperCase()}
                            </div>
                         </div>
                         <div>
                            <span className="text-[10px] text-gray-500 uppercase font-bold tracking-wider">Points / Tier</span>
                            <div className="flex items-center gap-1.5 mt-0.5">
                               <span className="text-white font-bold text-xs">{user.points}</span>
                               <span className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${
                                   user.membershipTier === 'Gold' ? 'text-amber-400 bg-amber-500/10' :
                                   user.membershipTier === 'Silver' ? 'text-gray-300 bg-gray-500/10' :
                                   'text-orange-400 bg-orange-500/10'
                               }`}>
                                  {user.membershipTier}
                               </span>
                            </div>
                         </div>
                         <div className="col-span-2 mt-1">
                            <span className="text-[10px] text-gray-500 uppercase font-bold tracking-wider mr-2">Joined:</span>
                            <span className="text-xs text-gray-400 font-medium">{new Date(user.createdAt).toLocaleDateString()}</span>
                         </div>
                    </div>
                </div>
            )) : (
                 <div className="text-center p-8 text-gray-500 font-medium">No users found.</div>
            )}
        </div>

      </div>
    </div>
  );
};

export default AdminUsers;
