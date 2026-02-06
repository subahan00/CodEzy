import React, { useState, useEffect } from 'react';
import Editor from '@monaco-editor/react';
import { FiPlay, FiSend } from 'react-icons/fi';
import toast from 'react-hot-toast';
import { usePollSubmission } from '../../hooks/usePollSubmission'; 
import OutputConsole from './OutputConsole'; 
import submissionService from '../../services/submissionService/submissionService';

const CodeEditor = ({ code, setCode, language, setLanguage, problemId }) => {
  const { startPolling, status: submitStatus, result: submitResult, error: submitError } = usePollSubmission();
  
  const [runLoading, setRunLoading] = useState(false);
  const [runOutput, setRunOutput] = useState(null);

  useEffect(() => {
    if (submitStatus === 'completed' && submitResult) {
       if (submitResult.status === 'accepted') {
         toast.success("🏆 Accepted! Great work.");
       } else {
         toast.error(`❌ Verdict: ${submitResult.status}`);
       }
    }
  }, [submitStatus, submitResult]);

  const handleEditorChange = (value) => {
    setCode(value);
  };

  const handleRun = async () => {
    if (!problemId) return toast.error("Problem ID missing");
    
    setRunLoading(true);
    setRunOutput(null);
    const loadingToast = toast.loading("Running sample tests...");
    console.log('run code called')
    console.log(language, code, problemId)
    try {
      const res = await submissionService.runCode(language, code, problemId);

      toast.dismiss(loadingToast);
      toast.success("Run complete");
      
      // 🔥 FIX: Access res.data.data (The inner object with status/results)
      // res.data is the HTTP body, res.data.data is your payload
      setRunOutput(res.data.data); 

    } catch (err) {
      toast.dismiss(loadingToast);
      toast.error(err.response?.data?.message || "Run failed");
      setRunOutput({ error: err.message });
    } finally {
      setRunLoading(false);
    }
  };

  const handleSubmit = async () => {
    if (!problemId) return toast.error("Problem ID missing");
    
    setRunOutput(null); 

    try {
      const response = await submissionService.createSubmission(problemId, language, code);
      const { submissionId } = response.data.data;

      toast.success("Submitted! Polling results...");
      startPolling(submissionId);

    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.message || "Failed to submit code");
    }
  };

  // Logic to switch between Run output and Submit output
  const displayStatus = runLoading ? 'running' : (runOutput ? 'completed' : submitStatus);
  const displayResult = runOutput || submitResult;
  const displayError = runOutput?.error || submitError;

  return (
    <div className="flex flex-col h-full bg-[#1e1e1e] border-l border-gray-700">
      
      {/* Top Bar */}
      <div className="flex justify-between items-center p-2 bg-[#2d2d2d] border-b border-gray-700">
        <select 
          value={language}
          onChange={(e) => setLanguage(e.target.value)}
          className="bg-gray-800 text-white text-xs p-1.5 rounded border border-gray-600 outline-none focus:border-blue-500"
        >
          <option value="javascript">JavaScript</option>
          <option value="python">Python</option>
          <option value="cpp">C++</option>
        </select>

        <div className="flex gap-2">
           <button
             onClick={handleRun}
             disabled={runLoading || submitStatus === 'running'}
             className="flex items-center gap-1 px-3 py-1.5 bg-gray-700 hover:bg-gray-600 text-white text-xs font-medium rounded transition disabled:opacity-50"
           >
             <FiPlay size={12} /> Run
           </button>

           <button
             onClick={handleSubmit}
             disabled={submitStatus === 'running' || runLoading}
             className={`flex items-center gap-1 px-3 py-1.5 text-white text-xs font-bold rounded transition disabled:opacity-50
               ${submitStatus === 'running' ? 'bg-green-800 cursor-wait' : 'bg-green-600 hover:bg-green-500'}`}
           >
             <FiSend size={12} /> {submitStatus === 'running' ? 'Pending...' : 'Submit'}
           </button>
        </div>
      </div>

      {/* Editor */}
      <div className="flex-grow overflow-hidden relative">
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

      {/* Console */}
      <div className="h-1/3 border-t border-gray-700 bg-[#1e1e1e]">
        <OutputConsole 
           status={displayStatus} 
           result={displayResult} 
           error={displayError} 
        />
      </div>
    </div>
  );
};

export default CodeEditor;