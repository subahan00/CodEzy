import React from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';
import { FiGrid, FiList, FiPlusSquare, FiUsers, FiActivity, FiLogOut } from 'react-icons/fi';

const AdminLayout = () => {
  const location = useLocation();

  const isActive = (path) => location.pathname === path 
    ? "bg-blue-600 text-white" 
    : "text-gray-400 hover:bg-gray-800 hover:text-white";

  return (
    <div className="min-h-screen bg-gray-900 flex font-sans text-gray-100">
      
      {/* --- SIDEBAR --- */}
      <aside className="w-64 bg-gray-950 border-r border-gray-800 flex flex-col">
        <div className="h-16 flex items-center px-6 border-b border-gray-800">
          <span className="text-xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-emerald-400">
            CodEzy Admin
          </span>
        </div>

        <nav className="flex-1 p-4 space-y-2">
          <p className="px-4 text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
            Overview
          </p>
          
          <Link to="/admin/dashboard" className={`flex items-center gap-3 px-4 py-3 rounded-lg transition ${isActive('/admin/dashboard')}`}>
            <FiGrid /> Dashboard
          </Link>

          <Link to="/admin/analytics" className={`flex items-center gap-3 px-4 py-3 rounded-lg transition ${isActive('/admin/analytics')}`}>
            <FiActivity /> Analytics
          </Link>

          <p className="px-4 text-xs font-semibold text-gray-500 uppercase tracking-wider mt-6 mb-2">
            Management
          </p>

          <Link to="/admin/manage-problems" className={`flex items-center gap-3 px-4 py-3 rounded-lg transition ${isActive('/admin/manage-problems')}`}>
            <FiList /> All Problems
          </Link>

          <Link to="/admin/add-problem" className={`flex items-center gap-3 px-4 py-3 rounded-lg transition ${isActive('/admin/add-problem')}`}>
            <FiPlusSquare /> Add New Problem
          </Link>

          <Link to="/admin/users" className={`flex items-center gap-3 px-4 py-3 rounded-lg transition ${isActive('/admin/users')}`}>
            <FiUsers /> Users
          </Link>
        </nav>

        <div className="p-4 border-t border-gray-800">
          <button className="flex items-center gap-3 w-full px-4 py-3 text-red-400 hover:bg-red-900/20 rounded-lg transition">
            <FiLogOut /> Logout
          </button>
        </div>
      </aside>

      {/* --- MAIN CONTENT AREA --- */}
      <main className="flex-1 overflow-auto">
        {/* Renders the child route (Dashboard, AddProblem, etc.) */}
        <Outlet />
      </main>
    </div>
  );
};

export default AdminLayout;