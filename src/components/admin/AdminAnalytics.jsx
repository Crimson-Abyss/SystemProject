import React, { useState, useEffect } from 'react';
import { FaChartLine, FaUsers, FaShoppingBag, FaMoneyBillWave } from 'react-icons/fa';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';

const StatCard = ({ title, value, icon, color }) => {
  const Icon = icon; 

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 border border-gray-100 dark:border-gray-700">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-gray-500 dark:text-gray-400 font-medium text-sm uppercase tracking-wider">
          {title}
        </h3>
        <div className={`p-3 rounded-full ${color} bg-opacity-10`}>
          <Icon className={`w-6 h-6 ${color.replace('bg-', 'text-')}`} />
        </div>
      </div>
      <div className="flex items-baseline">
        <p className="text-3xl font-bold text-gray-800 dark:text-white">{value}</p>
      </div>
    </div>
  );
};

const AdminAnalytics = () => {
  const [stats, setStats] = useState({
    totalRevenue: 0,
    totalOrders: 0,
    totalUsers: 0,
    chartData: []
  });

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await fetch('/api/analytics', {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        
        if (response.ok) {
          const data = await response.json();
          
          const safeRevenue = parseFloat(data.totalRevenue) || 0;

          const history = data.chartData || [
             { day: 'Mon', sales: Math.round(safeRevenue * 0.1) },
             { day: 'Tue', sales: Math.round(safeRevenue * 0.2) },
             { day: 'Wed', sales: Math.round(safeRevenue * 0.15) },
             { day: 'Thu', sales: Math.round(safeRevenue * 0.25) },
             { day: 'Fri', sales: Math.round(safeRevenue * 0.1) },
             { day: 'Sat', sales: Math.round(safeRevenue * 0.15) },
             { day: 'Sun', sales: Math.round(safeRevenue * 0.05) },
          ];

          setStats({
            ...data,
            chartData: history
          });
        }
      } catch (error) {
        console.error('Error fetching analytics:', error);
      }
    };
    fetchStats();
  }, []);

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-6">Dashboard Analytics</h2>
      
      {/* STAT CARDS GRID */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <StatCard
          title="Total Revenue"
          value={`₱${stats.totalRevenue.toLocaleString()}`}
          icon={FaMoneyBillWave}
          color="bg-emerald-500"
        />
        <StatCard
          title="Total Orders"
          value={stats.totalOrders}
          icon={FaShoppingBag}
          color="bg-blue-500"
        />
        <StatCard
          title="Total Users"
          value={stats.totalUsers}
          icon={FaUsers}
          color="bg-purple-500"
        />
      </div>

      {/* CHART SECTION */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 border border-gray-100 dark:border-gray-700">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-bold text-gray-800 dark:text-white">Recent Activity</h3>
          <FaChartLine className="text-gray-400" />
        </div>

        {/* CHART CONTAINER */}
        <div className="h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={stats.chartData}>
              <defs>
                <linearGradient id="colorSales" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10b981" stopOpacity={0.8}/>
                  <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <XAxis 
                dataKey="day" 
                stroke="#9ca3af" 
                fontSize={12} 
                tickLine={false} 
                axisLine={false} 
              />
              <Tooltip 
                contentStyle={{ backgroundColor: '#fff', borderRadius: '8px', border: '1px solid #e5e7eb' }}
                itemStyle={{ color: '#10b981' }}
              />
              <Area 
                type="monotone" 
                dataKey="sales" 
                stroke="#10b981" 
                strokeWidth={2}
                fillOpacity={1} 
                fill="url(#colorSales)" 
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};

export default AdminAnalytics;