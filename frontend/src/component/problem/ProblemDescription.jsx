import React, { useEffect, useState } from 'react';
import axios from 'axios';
import problemService from '../../services/problemService/problemService';

const ProblemDescription = ({ problem }) => {
        if (!problem) return null;

  return (
    <div className="space-y-4">
      {/* Title & Difficulty */}
      <div className="border-b border-gray-700 pb-4">
        <h1 className="text-2xl font-bold">{problem.title}</h1>
        <div className="flex gap-2 mt-2">
          <span className={`px-2 py-1 rounded text-xs font-bold 
            ${problem.difficulty === 'easy' ? 'bg-green-900 text-green-400' : 
              problem.difficulty === 'medium' ? 'bg-yellow-900 text-yellow-400' : 
              'bg-red-900 text-red-400'}`}>
            {problem.difficulty.toUpperCase()}
          </span>
        </div>
      </div>

      {/* Description Content */}
      <div className="prose prose-invert max-w-none">
        {/* We simply display the text for now. Later we can add a Markdown parser */}
        <p className="whitespace-pre-line text-gray-300">{problem.description}</p>
      </div>

      {/* Examples (If your DB has them) */}
      {/* You can map over problem.examples here later */}
    </div>
  );
};

export default ProblemDescription;