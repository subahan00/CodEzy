import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { FiCheckCircle, FiCircle, FiPlay } from 'react-icons/fi';
import problemService from '../../services/problemService/problemService';

const DashboardProblemList = () => {
  const [problems, setProblems] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProblems = async () => {
      try {
        const response = await problemService.getAllProblems();
        // Grab only the first 5 problems for the dashboard view
        setProblems((response.data.data || []).slice(0, 5)); 
      } catch (error) {
        console.error("Failed to fetch problems", error);
      } finally {
        setLoading(false);
      }
    };

    fetchProblems();
  }, []);

  // Shared utility with the Daily Challenge card
  const getDifficultyColor = (diff) => {
    switch (diff?.toLowerCase()) {
      case 'easy': case 'beginner': 
        return 'bg-emerald-50 text-emerald-700 border-emerald-200';
      case 'medium': case 'intermediate': 
        return 'bg-amber-50 text-amber-700 border-amber-200';
      case 'hard': case 'advanced': 
        return 'bg-rose-50 text-rose-700 border-rose-200';
      default: 
        return 'bg-slate-50 text-slate-700 border-slate-200';
    }
  };

  // Modern Skeleton Loader
  if (loading) {
    return (
      <div className="animate-pulse flex flex-col gap-2 p-2">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="flex items-center justify-between p-4 bg-slate-50 rounded-xl">
            <div className="flex items-center gap-4">
              <div className="w-5 h-5 bg-slate-200 rounded-full"></div>
              <div className="space-y-2">
                <div className="h-4 bg-slate-200 rounded w-48"></div>
                <div className="h-3 bg-slate-200 rounded w-16"></div>
              </div>
            </div>
            <div className="w-8 h-8 bg-slate-200 rounded-lg"></div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <ul className="flex flex-col gap-1 p-1">
      {problems.map((problem) => (
        <li key={problem._id}>
          <div className="p-3 sm:p-4 hover:bg-slate-50 rounded-xl transition-colors flex items-center justify-between group border border-transparent hover:border-slate-100">
            
            <div className="flex items-center gap-4">
              {/* Status Icon */}
              <div className="text-xl flex-shrink-0">
                {problem.isSolved ? (
                  <FiCheckCircle className="text-emerald-500" aria-label="Solved" />
                ) : (
                  <FiCircle className="text-slate-300 group-hover:text-slate-400 transition-colors" aria-label="Unsolved" />
                )}
              </div>

              {/* Title & Difficulty */}
              <div className="flex flex-col gap-1.5">
                <Link 
                  to={`/problem/${problem.slug}`} 
                  className="font-semibold text-slate-800 hover:text-indigo-600 transition-colors line-clamp-1"
                >
                  {problem.title}
                </Link>
                <div>
                  <span className={`px-2 py-0.5 rounded-md text-[11px] font-semibold capitalize border ${getDifficultyColor(problem.difficulty)}`}>
                    {problem.difficulty}
                  </span>
                </div>
              </div>
            </div>

            {/* Action Button - Always visible, pops on hover */}
            <Link 
              to={`/problem/${problem.slug}`}
              className="ml-4 flex-shrink-0 flex items-center justify-center w-9 h-9 text-slate-400 hover:text-indigo-600 bg-slate-50 hover:bg-indigo-50 rounded-lg transition-all focus:ring-2 focus:ring-indigo-100 outline-none"
              aria-label={`Solve ${problem.title}`}
            >
              <FiPlay size={16} className="ml-0.5" fill="currentColor" />
            </Link>

          </div>
        </li>
      ))}

      {problems.length === 0 && (
        <div className="p-10 text-center flex flex-col items-center justify-center bg-slate-50 rounded-2xl border border-dashed border-slate-200">
          <p className="text-slate-500 font-medium">No problems available right now.</p>
          <p className="text-slate-400 text-sm mt-1">Check back later for new challenges!</p>
        </div>
      )}
    </ul>
  );
};

export default DashboardProblemList;