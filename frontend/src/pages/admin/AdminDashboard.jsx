import React from 'react';
import { FiUsers, FiCode, FiCheckCircle, FiServer } from 'react-icons/fi';

const StatCard = ({ title, value, icon: Icon, color }) => (
  <div className="bg-gray-800 p-6 rounded-xl border border-gray-700 shadow-lg">
    <div className="flex justify-between items-start">
      <div>
        <p className="text-gray-400 text-sm font-medium">{title}</p>
        <h3 className="text-3xl font-bold text-white mt-1">{value}</h3>
      </div>
      <div className={`p-3 rounded-lg ${color} bg-opacity-20 text-white`}>
        <Icon size={24} />
      </div>
    </div>
  </div>
);

const AdminDashboard = () => {
  // Mock Data (Connect to backend API later)
  const stats = {
    users: 1240,
    problems: 45,
    submissions: 8932,
    activeNow: 12
  };

  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold text-white mb-8">Platform Overview</h1>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatCard title="Total Users" value={stats.users} icon={FiUsers} color="bg-blue-500" />
        <StatCard title="Problems" value={stats.problems} icon={FiCode} color="bg-purple-500" />
        <StatCard title="Submissions" value={stats.submissions} icon={FiCheckCircle} color="bg-green-500" />
        <StatCard title="Server Status" value="Healthy" icon={FiServer} color="bg-emerald-500" />
      </div>

      {/* Recent Activity Section */}
      <div className="bg-gray-800 rounded-xl border border-gray-700 p-6">
        <h2 className="text-xl font-bold text-white mb-4">Recent Activity</h2>
        <div className="text-gray-400 text-sm text-center py-10">
          Chart or Activity Logs will go here...
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;