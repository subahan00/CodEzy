import React from 'react';

const OutputConsole = ({ status, result, error }) => {
  
  // 1. Idle State
  if (status === 'idle' || (!result && !error && status !== 'running')) {
    return (
      <div className="h-full flex items-center justify-center text-gray-500 text-sm font-mono">
        Run your code to see results here.
      </div>
    );
  }

  // 2. Loading State
  if (status === 'running' || status === 'pending') {
    return (
      <div className="h-full flex flex-col items-center justify-center p-4 text-yellow-400 font-mono text-sm animate-pulse">
        <span>Compiling and Executing...</span>
      </div>
    );
  }

  // 3. Error State (System Error)
  if (status === 'error' || error) {
    return (
      <div className="p-4 text-red-400 font-mono text-sm bg-red-900/10 h-full overflow-auto">
        <strong>System Error:</strong> {error?.message || error || "Unknown Error"}
      </div>
    );
  }

  // 4. Result State (Verdict)
  if (!result) return null;

  const verdict = result.status || 'unknown';
  const isAccepted = verdict === 'accepted';
  const stats = result.executionStats || { passed: 0, total: 0 };

  return (
    <div className="h-full overflow-y-auto p-4 font-mono text-sm bg-[#1e1e1e]">

      {/* Header */}
      <div className={`mb-4 pb-2 border-b border-gray-700 flex justify-between items-end ${isAccepted ? 'text-green-400' : 'text-red-400'}`}>
        <div className="font-bold text-lg uppercase">
           {verdict.replace(/-/g, ' ')}
        </div>
        <div className="text-gray-400 text-xs">
          Passed: <span className="text-white">{stats.passed}/{stats.total}</span>
        </div>
      </div>

      {/* Test Cases */}
      {Array.isArray(result.testResults) && (
        <div className="space-y-3">
          {result.testResults.map((test, index) => {
             // Handle case naming differences from backend
             const isPass = test.status === 'ACCEPTED' || test.passed === true;
             
             return (
              <div
                key={index}
                className={`p-3 rounded border border-l-4 ${
                  isPass ? 'border-green-900 border-l-green-500 bg-green-900/10' : 'border-red-900 border-l-red-500 bg-red-900/10'
                }`}
              >
                <div className="flex justify-between mb-2">
                  <span className="font-bold text-gray-300 text-xs">Test Case {index + 1}</span>
                  <span className={`text-xs font-bold ${isPass ? 'text-green-500' : 'text-red-500'}`}>
                    {isPass ? 'PASSED' : 'FAILED'}
                  </span>
                </div>

                {/* Input */}
                <div className="mb-2">
                   <div className="text-[10px] uppercase text-gray-500 mb-1">Input</div>
                   <div className="bg-black/40 p-2 rounded text-gray-300 font-mono text-xs whitespace-pre-wrap">
                      {test.input}
                   </div>
                </div>

                {/* Show Output Diff if Failed (or if it's a dry run you might want to see it always) */}
                <div className="grid grid-cols-2 gap-2">
                   <div>
                      <div className="text-[10px] uppercase text-gray-500 mb-1">Your Output</div>
                      <div className={`${isPass ? 'text-gray-300' : 'text-red-300'} bg-black/40 p-2 rounded text-xs whitespace-pre-wrap`}>
                         {test.output}
                      </div>
                   </div>
                   <div>
                      <div className="text-[10px] uppercase text-gray-500 mb-1">Expected</div>
                      <div className="text-green-300 bg-black/40 p-2 rounded text-xs whitespace-pre-wrap">
                         {test.expectedOutput}
                      </div>
                   </div>
                </div>

                {test.error && (
                  <div className="mt-2 text-red-400 text-xs bg-red-900/20 p-2 rounded border border-red-900/50">
                    {test.error}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default OutputConsole;