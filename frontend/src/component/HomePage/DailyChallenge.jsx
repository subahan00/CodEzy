import React from 'react';
import { FiPlay, FiClock, FiCalendar } from 'react-icons/fi';
import { Link } from 'react-router-dom';

const DailyChallenge = () => {
  // Placeholder for the "Problem of the Day"
  const dailyProblem = {
    title: "Reverse a Linked List",
    difficulty: "Medium",
    slug: "reverse-a-linked-list",
    tags: ["Linked List", "Recursion"]
  };

  // Helper function to set difficulty colors dynamically
  const getDifficultyColor = (diff) => {
    switch (diff.toLowerCase()) {
      case 'easy': return 'bg-emerald-50 text-emerald-700 border-emerald-200';
      case 'medium': return 'bg-amber-50 text-amber-700 border-amber-200';
      case 'hard': return 'bg-rose-50 text-rose-700 border-rose-200';
      default: return 'bg-slate-50 text-slate-700 border-slate-200';
    }
  };

  return (
    <div className="bg-white border border-slate-200 rounded-2xl p-5 sm:p-6 shadow-sm hover:shadow-md transition-shadow duration-300">
      
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6">
        
        {/* Left Section: Content */}
        <div className="flex-1">
          {/* Top Metadata */}
          <div className="flex items-center gap-3 mb-3">
            <span className="flex items-center gap-1.5 bg-indigo-50 text-indigo-700 text-xs font-bold px-2.5 py-1 rounded-md uppercase tracking-wide">
              <FiCalendar className="text-indigo-500" />
              Daily Challenge
            </span>
            <span className="text-slate-500 text-sm flex items-center gap-1.5 font-medium">
              <FiClock className="text-slate-400" /> 
              14h 22m left
            </span>
          </div>
          
          {/* Title */}
          <h2 className="text-xl sm:text-2xl font-bold text-slate-800 mb-4 hover:text-indigo-600 transition-colors">
            <Link to={`/problem/${dailyProblem.slug}`}>
              {dailyProblem.title}
            </Link>
          </h2>
          
          {/* Tags Section */}
          <div className="flex flex-wrap items-center gap-2">
            <span className={`px-2.5 py-1 rounded-md text-xs font-semibold border ${getDifficultyColor(dailyProblem.difficulty)}`}>
              {dailyProblem.difficulty}
            </span>
            
            {/* Divider dot */}
            <span className="w-1 h-1 rounded-full bg-slate-300 mx-1"></span>

            {dailyProblem.tags.map(tag => (
              <span key={tag} className="px-2.5 py-1 rounded-md text-xs font-medium bg-slate-100 text-slate-600 border border-slate-200 hover:bg-slate-200 transition-colors cursor-default">
                {tag}
              </span>
            ))}
          </div>
        </div>

        {/* Right Section: Action */}
        <div className="w-full sm:w-auto">
          <Link 
            to={`/problem/${dailyProblem.slug}`}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-3 rounded-xl font-semibold transition-colors focus:ring-4 focus:ring-indigo-100 outline-none"
          >
            <FiPlay className="fill-current" /> 
            Solve Now
          </Link>
        </div>
        
      </div>
    </div>
  );
};

export default DailyChallenge;