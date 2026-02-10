import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { FiCheckCircle, FiCircle, FiTag } from 'react-icons/fi'; // Icons
import problemService from '../services/problemService/problemService';

const ProblemList = () => {
  const [problems, setProblems] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProblems = async () => {
      try {
        const response = await problemService.getAllProblems();
        setProblems(response.data.data || []); 
      } catch (error) {
        console.error("Failed to fetch problems", error);
      } finally {
        setLoading(false);
      }
    };

    fetchProblems();
  }, []);

  // Helper for Difficulty Colors
  const getDifficultyColor = (diff) => {
    switch (diff?.toLowerCase()) {
      case 'beginner':
      case 'easy':
        return 'bg-green-900/40 text-green-400 border-green-700/50';
      case 'intermediate':
      case 'medium':
        return 'bg-yellow-900/40 text-yellow-400 border-yellow-700/50';
      case 'advanced':
      case 'hard':
        return 'bg-red-900/40 text-red-400 border-red-700/50';
      default:
        return 'bg-gray-800 text-gray-400';
    }
  };

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white p-6 md:p-10 font-sans">
      <div className="max-w-6xl mx-auto">
        
        {/* Header */}
        <div className="mb-8 flex justify-between items-end">
          <div>
            <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-emerald-400">
              Problems
            </h1>
            <p className="text-gray-400 mt-2 text-sm">
              Master algorithms and data structures with our curated list of challenges.
            </p>
          </div>
        </div>

        {/* Table Container */}
        <div className="bg-[#161616] rounded-xl overflow-hidden border border-gray-800 shadow-2xl">
          
          {/* Table Header */}
          <div className="grid grid-cols-12 gap-4 p-4 border-b border-gray-800 bg-[#1e1e1e] text-xs font-bold text-gray-500 uppercase tracking-wider">
            <div className="col-span-1 text-center">Status</div>
            <div className="col-span-6">Title</div>
            <div className="col-span-2">Difficulty</div>
            <div className="col-span-3">Tags</div>
          </div>

          {/* Loading State */}
          {loading && (
             <div className="space-y-4 p-6 animate-pulse">
               {[1, 2, 3].map(i => (
                 <div key={i} className="h-12 bg-gray-800/50 rounded-lg"></div>
               ))}
             </div>
          )}

          {/* Problem Rows */}
          {!loading && problems.map((problem) => (
            <div 
              key={problem._id} 
              className="grid grid-cols-12 gap-4 p-4 border-b border-gray-800/50 hover:bg-[#1f1f1f] transition-all duration-200 items-center group"
            >
              
              {/* Status Icon */}
              <div className="col-span-1 flex justify-center">
                {problem.isSolved ? (
                  <FiCheckCircle className="text-green-500 text-lg" title="Solved" />
                ) : (
                  <FiCircle className="text-gray-600 text-lg group-hover:text-gray-400" title="Unsolved" />
                )}
              </div>
              
              {/* Title (Link) */}
              <div className="col-span-6">
                <Link 
                  to={`/problem/${problem.slug}`} 
                  className="font-medium text-gray-200 hover:text-blue-400 transition-colors text-base block truncate"
                >
                  {problem.title}
                </Link>
              </div>
              
              {/* Difficulty Badge */}
              <div className="col-span-2">
                <span className={`px-2.5 py-1 rounded-md text-xs font-medium border ${getDifficultyColor(problem.difficulty)}`}>
                  {(problem.difficulty || 'Unknown').charAt(0).toUpperCase() + (problem.difficulty || '').slice(1)}
                </span>
              </div>

              {/* Tags */}
              <div className="col-span-3 flex flex-wrap gap-2">
                {problem.tags && problem.tags.slice(0, 2).map((tag, idx) => (
                   <span key={idx} className="flex items-center text-xs text-gray-500 bg-gray-800 px-2 py-0.5 rounded-full">
                     <FiTag size={10} className="mr-1" /> {tag}
                   </span>
                ))}
              </div>

            </div>
          ))}

          {/* Empty State */}
          {!loading && problems.length === 0 && (
            <div className="p-12 text-center text-gray-500">
              <div className="text-xl font-bold mb-2">No problems found</div>
              <p>Check back later for new challenges.</p>
            </div>
          )}

        </div>
      </div>
    </div>
  );
};

export default ProblemList;