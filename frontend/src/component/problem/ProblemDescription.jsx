import React, { useState } from 'react';
import ReactMarkdown from 'react-markdown';
import rehypeHighlight from 'rehype-highlight';
import 'highlight.js/styles/atom-one-dark.css'; // Dark theme for code blocks
import { FiTag, FiCpu, FiClock, FiCheckCircle } from 'react-icons/fi';

const ProblemDescription = ({ problem }) => {
  const [activeTab, setActiveTab] = useState('description');

  if (!problem) return null;

  // Difficulty Color Helper
  const getDifficultyColor = (diff) => {
    switch (diff?.toLowerCase()) {
      case 'easy': return 'text-green-400 bg-green-400/10';
      case 'medium': return 'text-yellow-400 bg-yellow-400/10';
      case 'hard': return 'text-red-400 bg-red-400/10';
      default: return 'text-gray-400 bg-gray-400/10';
    }
  };

  return (
    <div className="flex flex-col h-full bg-[#1e1e1e] text-gray-300 font-sans">
      
      {/* --- TABS --- */}
      <div className="flex border-b border-gray-700 bg-[#252526]">
        <button
          onClick={() => setActiveTab('description')}
          className={`px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
            activeTab === 'description' 
              ? 'border-blue-500 text-white' 
              : 'border-transparent text-gray-500 hover:text-gray-300'
          }`}
        >
          Description
        </button>
        <button
          onClick={() => setActiveTab('submissions')}
          className={`px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
            activeTab === 'submissions' 
              ? 'border-blue-500 text-white' 
              : 'border-transparent text-gray-500 hover:text-gray-300'
          }`}
        >
          Submissions
        </button>
      </div>

      {/* --- CONTENT AREA --- */}
      <div className="flex-1 overflow-y-auto p-6 scrollbar-thin scrollbar-thumb-gray-700">
        
        {activeTab === 'description' && (
          <div className="space-y-6">
            
            {/* Header */}
            <div>
              <h1 className="text-2xl font-bold text-white mb-2">{problem.title}</h1>
              <div className="flex items-center gap-3">
                <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${getDifficultyColor(problem.difficulty)}`}>
                  {problem.difficulty}
                </span>
                
                {/* Stats (Optional) */}
                <div className="flex items-center gap-4 text-xs text-gray-500">
                   <span className="flex items-center gap-1"><FiCheckCircle /> {problem.stats?.acceptanceRate || 'N/A'}% Acceptance</span>
                   {/* <span className="flex items-center gap-1"><FiUsers /> {problem.stats?.submissions || 0}</span> */}
                </div>
              </div>
            </div>

            {/* Markdown Description */}
            <div className="prose prose-invert prose-sm max-w-none">
              <ReactMarkdown rehypePlugins={[rehypeHighlight]}>
                {problem.description}
              </ReactMarkdown>
            </div>

            {/* Examples */}
            {problem.examples && problem.examples.length > 0 && (
              <div className="mt-8 space-y-6">
                {problem.examples.map((ex, index) => (
                  <div key={index} className="bg-[#2d2d2d] rounded-lg p-4 border border-gray-700">
                    <h3 className="text-sm font-bold text-white mb-2">Example {index + 1}:</h3>
                    
                    <div className="grid gap-2 text-sm font-mono">
                      <div>
                        <span className="text-gray-500 font-semibold select-none">Input: </span>
                        <span className="text-gray-300">{ex.input}</span>
                      </div>
                      <div>
                        <span className="text-gray-500 font-semibold select-none">Output: </span>
                        <span className="text-gray-300">{ex.output}</span>
                      </div>
                      {ex.explanation && (
                        <div>
                           <span className="text-gray-500 font-semibold select-none">Explanation: </span>
                           <span className="text-gray-400">{ex.explanation}</span>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Constraints */}
            <div className="mt-8">
              <h3 className="text-sm font-bold text-white mb-3">Constraints:</h3>
              <ul className="list-disc list-inside space-y-1 text-sm text-gray-400 marker:text-gray-600 font-mono">
                 {/* If you stored constraints as an array in DB, map them. 
                    If not, you can render them if they are in the markdown description.
                    For now, hardcoded example or check if field exists:
                 */}
                 {problem.constraints ? (
                    problem.constraints.map((c, i) => <li key={i}>{c}</li>)
                 ) : (
                    <>
                      <li>Time Limit: 2000ms</li>
                      <li>Memory Limit: 256MB</li>
                    </>
                 )}
              </ul>
            </div>

            {/* Tags */}
            {problem.tags && problem.tags.length > 0 && (
              <div className="mt-8 pt-6 border-t border-gray-700">
                <div className="flex flex-wrap gap-2">
                  {problem.tags.map((tag) => (
                    <span key={tag} className="px-2 py-1 bg-gray-800 text-gray-400 rounded text-xs flex items-center gap-1">
                      <FiTag /> {tag}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {activeTab === 'submissions' && (
          <div className="text-center py-10 text-gray-500">
            <p>Your past submissions will appear here.</p>
            {/* You can implement a fetch for "getMySubmissions(problemId)" here later */}
          </div>
        )}

      </div>
    </div>
  );
};

export default ProblemDescription;