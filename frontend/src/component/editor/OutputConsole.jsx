import React from 'react';

const OutputConsole = ({ status, result, error }) => {
  if (status === 'idle') {
    return (
      <div className="h-full flex items-center justify-center text-gray-500 text-sm">
        Run your code to see results here.
      </div>
    );
  }

  if (status === 'error') {
    return (
      <div className="p-4 text-red-400 font-mono text-sm">
        Error: {error}
      </div>
    );
  }

  if (status === 'running' || status === 'pending') {
    return (
      <div className="p-4 text-yellow-400 font-mono text-sm animate-pulse">
         Compiling and Executing...
      </div>
    );
  }

  // If we have a result (Completed)
  if (!result) return null;

  const isAccepted = result.status === 'accepted';

  return (
    <div className="h-full overflow-y-auto p-4 font-mono text-sm">
      
      {/* Verdict Header */}
      <div className={`mb-2 font-bold text-lg ${isAccepted ? 'text-green-400' : 'text-red-400'}`}>
        Verdict: {result.status.toUpperCase()}
      </div>

      {/* Stats */}
      {result.executionStats && (
         <div className="text-gray-400 text-xs mb-4">
           Passed: {result.executionStats.passed}/{result.executionStats.total} cases
         </div>
      )}

      {/* Test Case Details (The Diff) */}
      <div className="space-y-3">
        {result.testResults && result.testResults.map((test, index) => (
          <div key={index} className={`p-2 rounded border ${test.passed ? 'border-green-900 bg-green-900/20' : 'border-red-900 bg-red-900/20'}`}>
            <div className="flex justify-between mb-1">
              <span className="font-bold text-gray-300">Case {index + 1}</span>
              <span className={test.passed ? "text-green-500" : "text-red-500"}>
                {test.passed ? "PASSED" : "FAILED"}
              </span>
            </div>

            {/* If Failed, Show Diff */}
            {!test.passed && (
              <div className="mt-2 bg-black/50 p-2 rounded text-xs">
                <div className="mb-1">
                  <span className="text-gray-500">Expected:</span> 
                  <span className="text-green-300 ml-2">{test.expectedOutput}</span>
                </div>
                <div>
                  <span className="text-gray-500">Actual:</span> 
                  <span className="text-red-300 ml-2">{test.output}</span>
                </div>
              </div>
            )}
            
            {/* Show error message if runtime error */}
            {test.errorMessage && (
               <div className="mt-1 text-red-400 text-xs">{test.errorMessage}</div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default OutputConsole;