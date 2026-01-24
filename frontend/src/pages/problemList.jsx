import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import problemService from '../services/problemService/problemService';

const ProblemList = () => {
  const [problems, setProblems] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProblems = async () => {
      try {
        const response = await problemService.getAllProblems();
        // Adjust 'response.data.data' based on your actual backend response structure
        setProblems(response.data.data || []); 
      } catch (error) {
        console.error("Failed to fetch problems", error);
      } finally {
        setLoading(false);
      }
    };

    fetchProblems();
  }, []);

  return (
    <div className="min-h-screen bg-gray-900 text-white p-10">
      <div className="max-w-5xl mx-auto">
        
        {/* Header */}
        <h1 className="text-3xl font-bold mb-8">All Problems</h1>

        {/* Table Container */}
        <div className="bg-gray-800 rounded-lg overflow-hidden shadow-lg border border-gray-700">
          
          {/* Table Header */}
          <div className="grid grid-cols-12 gap-4 p-4 border-b border-gray-700 bg-gray-750 font-semibold text-gray-400">
            <div className="col-span-1">#</div>
            <div className="col-span-8">Title</div>
            <div className="col-span-3">Difficulty</div>
          </div>

          {/* Loading State */}
          {loading && (
             <div className="p-8 text-center text-gray-500 animate-pulse">
               Loading challenges...
             </div>
          )}

          {/* Problem Rows */}
          {!loading && problems.map((problem, index) => (
            <div 
              key={problem._id} 
              className="grid grid-cols-12 gap-4 p-4 border-b border-gray-700 hover:bg-gray-750 transition-colors items-center"
            >
              {/* Index */}
              <div className="col-span-1 text-gray-500">{index + 1}</div>
              
              {/* Title (Link) */}
              <div className="col-span-8 font-medium">
                <Link 
                  to={`/problem/${problem.slug}`} 
                  className="hover:text-blue-400 transition-colors"
                >
                  {problem.title}
                </Link>
              </div>
              
              {/* Difficulty Badge */}
              <div className="col-span-3">
                <span className={`px-3 py-1 rounded-full text-xs font-bold
                  ${problem.difficulty === 'easy' ? 'bg-green-900/50 text-green-400' : 
                    problem.difficulty === 'medium' ? 'bg-yellow-900/50 text-yellow-400' : 
                    'bg-red-900/50 text-red-400'
                  }`}>
                  {problem.difficulty.toUpperCase()}
                </span>
              </div>
            </div>
          ))}

          {!loading && problems.length === 0 && (
            <div className="p-8 text-center text-gray-500">
              No problems found.
            </div>
          )}

        </div>
      </div>
    </div>
  );
};

export default ProblemList;