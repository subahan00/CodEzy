import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { FiUsers, FiCode, FiCheckCircle, FiActivity } from 'react-icons/fi';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import toast from 'react-hot-toast';

const StatCard = ({ title, value, icon: Icon, color }) => (
  <div className="bg-gray-800 p-6 rounded-xl border border-gray-700 shadow-lg hover:border-gray-500 transition-colors">
    <div className="flex justify-between items-start">
      <div>
        <p className="text-gray-400 text-sm font-medium uppercase tracking-widest">{title}</p>
        <h3 className="text-3xl font-black text-white mt-2 font-mono">{value}</h3>
      </div>
      <div className={`p-4 rounded-xl ${color} bg-opacity-20 text-white shadow-[0_0_15px_rgba(0,0,0,0.2)]`}>
        <Icon size={24} className={color.replace('bg-', 'text-').replace('-500', '-400')} />
      </div>
    </div>
  </div>
);

const AdminDashboard = () => {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    users: 0,
    problems: 0,
    submissions: 0,
    serverStatus: 'Checking...',
    chartData: []
  });

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const token = localStorage.getItem('token');
        const res = await axios.get(`${import.meta.env.VITE_BACKEND_URL}/api/admin/stats`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setStats(res.data.data);
      } catch (error) {
        console.error("Failed to load stats", error);
        toast.error("Failed to connect to monitoring server");
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen p-8 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-8 bg-gray-900">
      <div className="max-w-7xl mx-auto">
        
        <div className="mb-8 border-b border-gray-800 pb-4">
          <h1 className="text-3xl font-bold text-white tracking-tight">Platform Command Center</h1>
          <p className="text-gray-400 mt-1">Real-time telemetry and system monitoring.</p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <StatCard title="Total Users" value={stats.users} icon={FiUsers} color="bg-blue-500" />
          <StatCard title="Problems" value={stats.problems} icon={FiCode} color="bg-purple-500" />
          <StatCard title="Submissions" value={stats.submissions.toLocaleString()} icon={FiCheckCircle} color="bg-green-500" />
          <StatCard title="System Health" value={stats.serverStatus} icon={FiActivity} color="bg-emerald-500" />
        </div>

        {/* Traffic Chart Section */}
        <div className="bg-gray-800 rounded-xl border border-gray-700 p-6 shadow-xl">
          <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
            <FiActivity className="text-purple-400"/> 7-Day Platform Traffic
          </h2>
          
          <div className="h-[400px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={stats.chartData} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" vertical={false} />
                <XAxis 
                  dataKey="day" 
                  stroke="#9ca3af" 
                  tick={{fill: '#9ca3af', fontSize: 12}}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis 
                  stroke="#9ca3af" 
                  tick={{fill: '#9ca3af', fontSize: 12}}
                  axisLine={false}
                  tickLine={false}
                />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#1f2937', border: '1px solid #374151', borderRadius: '8px', color: '#fff' }}
                  itemStyle={{ color: '#e5e7eb' }}
                />
                <Legend iconType="circle" wrapperStyle={{ paddingTop: '20px' }}/>
                
                {/* Blue Line for Submissions */}
                <Line 
                  type="monotone" 
                  name="Code Submissions"
                  dataKey="submissions" 
                  stroke="#3b82f6" 
                  strokeWidth={3}
                  dot={{ fill: '#3b82f6', strokeWidth: 2, r: 4 }}
                  activeDot={{ r: 6, strokeWidth: 0 }}
                />
                
                {/* Purple Line for Duels */}
                <Line 
                  type="monotone" 
                  name="Live Duels"
                  dataKey="duels" 
                  stroke="#a855f7" 
                  strokeWidth={3}
                  dot={{ fill: '#a855f7', strokeWidth: 2, r: 4 }}
                  activeDot={{ r: 6, strokeWidth: 0 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

      </div>
    </div>
  );
};

export default AdminDashboard;