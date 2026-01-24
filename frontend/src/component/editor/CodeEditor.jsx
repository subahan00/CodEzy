import React, { useState } from 'react';
import Editor from '@monaco-editor/react';
import axios from 'axios';
import { usePollSubmission } from '../../hooks/usePollSubmission'; // The hook we made earlier
import OutputConsole from './OutputConsole'; // We will build this in Step 7
import submissionService from '../../services/submissionService/submissionService';
const CodeEditor = ({ code, setCode, language, setLanguage, problemId }) => {
  const { startPolling, stopPolling, status, result, error } = usePollSubmission();
  
  // Handlers
  const handleEditorChange = (value) => {
    setCode(value);
  };

  const handleSubmit = async () => {
    if (!problemId) return alert("Problem ID missing");

    try {
      // 1. Send Submission to Backend
      // NOTE: Replace with your actual backend URL
      const response = await submissionService.createSubmission(problemId, language, code);
      console.log("res-",response)
      const { submissionId } = response.data.data;

      // 2. Start Polling for results
      startPolling(submissionId);

    } catch (err) {
      console.error(err);
      alert("Failed to submit code: " + (err.response?.data?.message || err.message));
    }
  };

  return (
    <div className="flex flex-col h-full">
      {/* --- TOP BAR: Language & Run Buttons --- */}
      <div className="bg-gray-800 p-2 flex justify-between items-center border-b border-gray-700">
        
        {/* Language Selector */}
        <select 
          value={language}
          onChange={(e) => setLanguage(e.target.value)}
          className="bg-gray-700 text-white px-2 py-1 rounded text-sm focus:outline-none"
        >
          <option value="python">Python</option>
          <option value="javascript">JavaScript</option>
        </select>

        {/* Submit Button */}
        <button
          onClick={handleSubmit}
          disabled={status === 'pending' || status === 'running'}
          className={`px-4 py-1 rounded text-sm font-bold transition-colors
            ${status === 'running' 
              ? 'bg-yellow-600 cursor-wait' 
              : 'bg-green-600 hover:bg-green-500'}`}
        >
          {status === 'running' ? 'Running...' : 'Submit Code'}
        </button>
      </div>

      {/* --- MIDDLE: Monaco Editor --- */}
      <div className="flex-grow overflow-hidden relative">
         {/* Helper Overlay for "Running" state */}
         {status === 'running' && (
           <div className="absolute inset-0 z-10 bg-black/50 flex items-center justify-center backdrop-blur-sm">
             <div className="text-white font-mono animate-pulse">Running Test Cases...</div>
           </div>
         )}

        <Editor
          height="100%"
          theme="vs-dark"
          language={language}
          value={code}
          onChange={handleEditorChange}
          options={{
            minimap: { enabled: false },
            fontSize: 14,
            scrollBeyondLastLine: false,
            automaticLayout: true,
          }}
        />
      </div>
      <div className="h-1/3 border-t border-gray-700 bg-black">
        <OutputConsole status={status} result={result} error={error} />
      </div>
    </div>
  );
};

export default CodeEditor;