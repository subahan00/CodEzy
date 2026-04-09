import React, { useState, useEffect, useRef } from 'react';
import Editor from '@monaco-editor/react';
import { FiPlay, FiSend, FiCommand, FiLoader } from 'react-icons/fi';
import toast from 'react-hot-toast';
import { usePollSubmission } from '../../hooks/usePollSubmission'; 
import OutputConsole from './OutputConsole'; 
import submissionService from '../../services/submissionService/submissionService';

// Integrated ambient grid generation for the high-tech UI feel
const AmbientGrid = () => (
  <div 
    className="absolute inset-0 pointer-events-none opacity-[0.03] z-0"
    style={{
      backgroundImage: `
        linear-gradient(rgba(99, 102, 241, 0.8) 1px, transparent 1px),
        linear-gradient(90deg, rgba(99, 102, 241, 0.8) 1px, transparent 1px)
      `,
      backgroundSize: '24px 24px',
      backgroundPosition: 'center center'
    }}
  />
);

const CodeEditor = ({ code, setCode, language, setLanguage, problemId }) => {
  const { startPolling, status: submitStatus, result: submitResult, error: submitError } = usePollSubmission();
  const editorRef = useRef(null);
  
  const [runLoading, setRunLoading] = useState(false);
  const [runOutput, setRunOutput] = useState(null);

  useEffect(() => {
    if (submitStatus === 'completed' && submitResult) {
       if (submitResult.status === 'accepted') {
         toast.success("🏆 Accepted! Great work.", {
           style: { background: '#0d0f1a', color: '#22c55e', border: '1px solid rgba(34, 197, 94, 0.3)' }
         });
       } else {
         toast.error(`❌ Verdict: ${submitResult.status}`, {
           style: { background: '#0d0f1a', color: '#ef4444', border: '1px solid rgba(239, 68, 68, 0.3)' }
         });
       }
    }
  }, [submitStatus, submitResult]);

  // 🔥 NEW: Define the custom Cyberpunk theme BEFORE Monaco mounts
  const handleEditorBeforeMount = (monaco) => {
    monaco.editor.defineTheme('cyber-athlete', {
      base: 'vs-dark',
      inherit: true,
      rules: [
        { token: 'comment', foreground: '6366f1', fontStyle: 'italic' }, // Indigo comments
        { token: 'keyword', foreground: 'c084fc' }, // Purple keywords
        { token: 'string', foreground: '34d399' }, // Emerald strings
        { token: 'number', foreground: 'fbbf24' }, // Amber numbers
        { token: 'identifier', foreground: 'e0e7ff' }, // Light indigo variables
        { token: 'function', foreground: '60a5fa' }, // Blue functions
      ],
      colors: {
        'editor.background': '#0d0f1a', // Matches our exact container background
        'editor.foreground': '#c7d2fe', // Soft indigo text
        'editorLineNumber.foreground': '#4f46e550', // Faded indigo line numbers
        'editorLineNumber.activeForeground': '#818cf8', // Bright active line number
        'editorCursor.foreground': '#f472b6', // Neon pink cursor
        'editor.selectionBackground': '#3730a380', // Highlighted text background
        'editor.lineHighlightBackground': '#1e1b4b50', // Current line background
        'editorIndentGuide.background': '#1e1b4b', // Indent lines
        'editorIndentGuide.activeBackground': '#3730a3', // Active indent line
      }
    });
  };

  const handleEditorDidMount = (editor, monaco) => {
    editorRef.current = editor;
  };

  const handleFormatCode = () => {
    if (editorRef.current) {
      editorRef.current.getAction('editor.action.formatDocument').run();
      toast.success("Code formatted", { 
        icon: '✨', 
        style: { background: '#0d0f1a', color: '#a5b4fc', border: '1px solid rgba(99,102,241,0.3)', fontSize: '12px', fontFamily: "'JetBrains Mono', monospace" } 
      });
    }
  };

  const handleEditorChange = (value) => {
    setCode(value);
  };

  const handleRun = async () => {
    if (!problemId) return toast.error("Problem ID missing");
    
    setRunLoading(true);
    setRunOutput(null);
    const loadingToast = toast.loading("Executing logic...", {
      style: { background: '#0d0f1a', color: '#a5b4fc', border: '1px solid rgba(99,102,241,0.3)' }
    });
    
    try {
      const res = await submissionService.runCode(language, code, problemId);
      toast.dismiss(loadingToast);
      toast.success("Execution complete", {
        style: { background: '#0d0f1a', color: '#a5b4fc', border: '1px solid rgba(99,102,241,0.3)' }
      });
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

      toast.success("Code deployed. Awaiting verdict...");
      startPolling(submissionId);

    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.message || "Failed to submit code");
    }
  };

  const displayStatus = runLoading ? 'running' : (runOutput ? 'completed' : submitStatus);
  const displayResult = runOutput || submitResult;
  const displayError = runOutput?.error || submitError;
  const isPending = runLoading || submitStatus === 'running';

  return (
    <div 
      className="flex flex-col h-full relative overflow-hidden"
      style={{
        background: '#0d0f1a', // Set base background strictly to match Monaco
        borderLeft: '1px solid rgba(99,102,241,0.15)',
      }}
    >
      <AmbientGrid />

      {/* Top Action Bar */}
      <div 
        className="relative z-10 flex justify-between items-center px-4 py-3 border-b"
        style={{ 
          borderColor: 'rgba(99,102,241,0.15)',
          background: 'rgba(13, 15, 26, 0.6)',
          backdropFilter: 'blur(8px)'
        }}
      >
        <div className="flex items-center gap-3">
          <select 
            value={language}
            onChange={(e) => setLanguage(e.target.value)}
            className="cursor-pointer outline-none transition-all duration-200"
            style={{
              background: 'rgba(99,102,241,0.05)',
              border: '1px solid rgba(99,102,241,0.2)',
              color: '#a5b4fc',
              padding: '6px 12px',
              borderRadius: '8px',
              fontFamily: "'JetBrains Mono', monospace",
              fontSize: '11px',
              fontWeight: 600,
              textTransform: 'uppercase',
              letterSpacing: '0.05em'
            }}
          >
            <option value="javascript" className="bg-[#0d0f1a]">JavaScript</option>
            <option value="python" className="bg-[#0d0f1a]">Python</option>
            <option value="cpp" className="bg-[#0d0f1a]">C++</option>
          </select>

          <button
            onClick={handleFormatCode}
            title="Format Code"
            className="p-2 rounded-lg transition-all duration-200 text-indigo-400/50 hover:text-indigo-300 hover:bg-indigo-500/10"
          >
            <FiCommand size={14} />
          </button>
        </div>

        <div className="flex gap-3">
           <button
             onClick={handleRun}
             disabled={isPending}
             className="flex items-center gap-2 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
             style={{
               padding: '8px 16px',
               borderRadius: '8px',
               fontSize: '11px',
               fontWeight: 700,
               fontFamily: "'JetBrains Mono', monospace",
               letterSpacing: '0.08em',
               textTransform: 'uppercase',
               background: 'rgba(99,102,241,0.1)',
               border: '1px solid rgba(99,102,241,0.3)',
               color: '#a5b4fc',
             }}
           >
             {runLoading ? <FiLoader className="animate-spin" size={12} /> : <FiPlay size={12} />}
             {runLoading ? 'Compiling' : 'Run'}
           </button>

           <button
             onClick={handleSubmit}
             disabled={isPending}
             className="flex items-center gap-2 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed relative overflow-hidden group"
             style={{
               padding: '8px 16px',
               borderRadius: '8px',
               fontSize: '11px',
               fontWeight: 700,
               fontFamily: "'JetBrains Mono', monospace",
               letterSpacing: '0.08em',
               textTransform: 'uppercase',
               background: submitStatus === 'running' ? 'rgba(34, 197, 94, 0.1)' : 'rgba(34, 197, 94, 0.15)',
               border: `1px solid ${submitStatus === 'running' ? 'rgba(34, 197, 94, 0.3)' : 'rgba(34, 197, 94, 0.5)'}`,
               color: '#4ade80',
             }}
           >
             {submitStatus === 'running' ? (
                <FiLoader className="animate-spin" size={12} />
             ) : (
                <FiSend size={12} className="group-hover:translate-x-0.5 transition-transform" />
             )}
             {submitStatus === 'running' ? 'Evaluating' : 'Submit'}
           </button>
        </div>
      </div>

      {/* Editor */}
      <div className="flex-grow relative z-10 pt-2 bg-[#0d0f1a]">
        <Editor
          height="100%"
          theme="cyber-athlete" // 🔥 Changed from 'vs-dark' to our custom theme
          language={language}
          value={code}
          onChange={handleEditorChange}
          beforeMount={handleEditorBeforeMount} // 🔥 Hook to define the theme
          onMount={handleEditorDidMount}
          options={{
            minimap: { enabled: false },
            fontSize: 14,
            fontFamily: "'JetBrains Mono', monospace",
            fontLigatures: true,
            scrollBeyondLastLine: false,
            automaticLayout: true,
            padding: { top: 16 },
            cursorBlinking: "smooth",
            cursorSmoothCaretAnimation: "on",
            formatOnPaste: true,
            renderLineHighlight: "all",
            lineHeight: 24,
            scrollbar: {
              verticalScrollbarSize: 8,
              horizontalScrollbarSize: 8,
            }
          }}
        />
      </div>

      {/* Console Base */}
      <div 
        className="h-[30%] relative z-10"
        style={{
          borderTop: '1px solid rgba(99,102,241,0.15)',
          background: 'rgba(13, 15, 26, 0.8)',
          backdropFilter: 'blur(12px)'
        }}
      >
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