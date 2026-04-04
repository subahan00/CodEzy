import React from 'react';
import { FiTrendingUp, FiAward, FiCheckCircle } from 'react-icons/fi';
import { Link } from 'react-router-dom';

const UserStatsWidget = () => {
  // In reality, you'd fetch this from your backend/context
  const user = JSON.parse(localStorage.getItem('user')) || { 
    username: 'Guest', 
    statistics: { totalScore: 120, problemsSolved: 15 } 
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5 sm:p-6">
      
      {/* Profile Header */}
      <div className="flex items-center gap-4 mb-6">
        {/* Avatar */}
        <div className="w-14 h-14 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-700 text-2xl font-bold shadow-sm flex-shrink-0">
          {user.username?.charAt(0).toUpperCase()}
        </div>
        
        {/* Name & Rank */}
        <div className="flex flex-col gap-1">
          <h3 className="text-slate-800 font-bold text-lg leading-tight line-clamp-1">
            {user.username}
          </h3>
          <div className="flex items-center">
            <span className="inline-flex items-center gap-1 bg-indigo-50 text-indigo-600 text-[11px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider border border-indigo-100">
              <FiTrendingUp size={12} />
              Beginner
            </span>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 gap-3 mb-5">
        
        {/* Solved Stat */}
        <div className="bg-slate-50 p-3 sm:p-4 rounded-xl border border-slate-100 flex flex-col justify-center transition-colors hover:bg-slate-100">
          <div className="text-slate-500 text-[11px] uppercase font-bold flex items-center gap-1.5 mb-1.5 tracking-wide">
            <FiCheckCircle className="text-emerald-500" size={14} /> 
            Solved
          </div>
          <div className="text-2xl font-extrabold text-slate-800">
            {user.statistics?.problemsSolved || 0}
          </div>
        </div>

        {/* Score Stat */}
        <div className="bg-slate-50 p-3 sm:p-4 rounded-xl border border-slate-100 flex flex-col justify-center transition-colors hover:bg-slate-100">
          <div className="text-slate-500 text-[11px] uppercase font-bold flex items-center gap-1.5 mb-1.5 tracking-wide">
            <FiAward className="text-amber-500" size={14} /> 
            Score
          </div>
          <div className="text-2xl font-extrabold text-amber-600">
            {user.statistics?.totalScore || 0}
          </div>
        </div>

      </div>

      {/* Action Button */}
      <Link 
        to="/profile" 
        className="flex items-center justify-center w-full py-2.5 bg-slate-50 hover:bg-indigo-50 text-sm font-semibold text-slate-600 hover:text-indigo-600 border border-slate-200 hover:border-indigo-100 rounded-xl transition-all focus:outline-none focus:ring-2 focus:ring-indigo-100"
      >
        View Full Profile
      </Link>
      
    </div>
  );
};

export default UserStatsWidget;