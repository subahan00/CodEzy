import React from 'react';
import Navbar from '../component/HomePage/Navbar';
import DailyChallenge from '../component/HomePage/DailyChallenge';
import StreakCalendar from '../component/HomePage/StreakCalendar';
import UserStatsWidget from '../component/HomePage/UserStatsWidget';
import DashboardProblemList from '../component/HomePage/DashboardProblemList';
import WorldChatWidget from '../component/HomePage/WorldChatWidget';
import { Link } from 'react-router-dom';
import { FiCalendar, FiArrowRight } from 'react-icons/fi';

const Dashboard = () => {
  return (
  
    <div className="min-h-screen bg-slate-50 font-sans text-slate-600">
      <Navbar />

      {/* Main Content Container */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-10">
        
        {/* Page Header (Optional, but good for UX) */}
        <div className="mb-8">
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-800">
            Welcome back! 👋
          </h1>
          <p className="text-slate-500 mt-1 font-medium">
            Here's your progress and what's happening today.
          </p>
        </div>

        {/* Dashboard Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8">
          
          {/* ================= LEFT COLUMN ================= */}
          <div className="lg:col-span-8 space-y-6 lg:space-y-8">
            
            <DailyChallenge />

            {/* Recommended Problems Container */}
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden flex flex-col">
               {/* Header */}
               <div className="p-5 border-b border-slate-100 flex justify-between items-center bg-white">
                  <h3 className="text-lg font-bold text-slate-800">Recommended For You</h3>
                  <Link 
                    to="/problems" 
                    className="group flex items-center gap-1 text-sm font-semibold text-indigo-600 hover:text-indigo-700 transition-colors"
                  >
                    View All 
                    <FiArrowRight className="transition-transform group-hover:translate-x-1" />
                  </Link>
               </div>
               
               {/* Problem List Component */}
               <div className="flex-1 bg-white">
                 <DashboardProblemList />
               </div>
            </div>

          </div>

          {/* ================= RIGHT COLUMN (SIDEBAR) ================= */}
          <div className="lg:col-span-4 space-y-6 lg:space-y-8">
            
            <UserStatsWidget />
            <StreakCalendar />
            <WorldChatWidget />
            {/* Upcoming Events Container */}
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5 sm:p-6">
               <h3 className="text-slate-800 font-bold mb-4 text-lg flex items-center gap-2">
                 <div className="bg-rose-100 p-1.5 rounded-lg text-rose-500">
                   <FiCalendar size={18} />
                 </div>
                 Upcoming Events
               </h3>
               
               <div className="space-y-3">
                 {/* Event Card */}
                 <div className="group bg-slate-50 p-4 rounded-xl border border-slate-100 flex flex-col sm:flex-row justify-between sm:items-center gap-4 hover:border-slate-200 transition-colors">
                    
                    <div>
                      <div className="text-sm font-bold text-slate-800 group-hover:text-indigo-600 transition-colors line-clamp-1">
                        Weekly Contest 124
                      </div>
                      <div className="text-xs font-medium text-slate-500 mt-1">
                        Starts in <span className="text-rose-500 font-bold">2 days</span>
                      </div>
                    </div>

                    <button className="flex-shrink-0 w-full sm:w-auto text-xs font-semibold bg-white border border-slate-200 hover:border-indigo-200 hover:bg-indigo-50 text-slate-600 hover:text-indigo-700 px-4 py-2.5 rounded-lg transition-all focus:outline-none focus:ring-2 focus:ring-indigo-100">
                      Register
                    </button>
                    
                 </div>
               </div>
            </div>

          </div>

        </div>
      </main>
    </div>
  );
};

export default Dashboard;