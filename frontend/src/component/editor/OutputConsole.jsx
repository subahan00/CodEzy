import React, { useState } from 'react';
import { FiTerminal, FiCpu, FiAlertTriangle, FiCheckCircle, FiXCircle, FiChevronDown, FiChevronRight } from 'react-icons/fi';

// Ambient Grid updated to a subtle Cyan to match the hardware terminal theme
const AmbientGrid = () => (
  <div 
    className="absolute inset-0 pointer-events-none opacity-[0.04] z-0"
    style={{
      backgroundImage: `
        linear-gradient(rgba(6, 182, 212, 0.8) 1px, transparent 1px),
        linear-gradient(90deg, rgba(6, 182, 212, 0.8) 1px, transparent 1px)
      `,
      backgroundSize: '24px 24px',
      backgroundPosition: 'center center'
    }}
  />
);

const TestCaseItem = ({ test, index }) => {
  const isPass = test.status === 'ACCEPTED' || test.passed === true;
  const [isOpen, setIsOpen] = useState(!isPass); 

  return (
    <div 
      className="relative z-10 rounded-lg border overflow-hidden transition-all duration-200"
      style={{
        background: isPass ? 'rgba(16, 185, 129, 0.03)' : 'rgba(225, 29, 72, 0.05)',
        borderColor: isPass ? 'rgba(16, 185, 129, 0.2)' : 'rgba(225, 29, 72, 0.3)',
      }}
    >
      {/* Header Toggle */}
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="w-full px-4 py-2.5 flex items-center justify-between hover:bg-white/5 transition-colors"
      >
        <div className="flex items-center gap-3">
          {isPass ? <FiCheckCircle className="text-emerald-500" size={14} /> : <FiXCircle className="text-rose-500" size={14} />}
          <span className="font-bold text-gray-300 text-xs" style={{ fontFamily: "'JetBrains Mono', monospace" }}>
            TEST CASE {index + 1}
          </span>
        </div>
        <div className="flex items-center gap-3">
          <span 
            className="text-[10px] font-bold tracking-widest uppercase"
            style={{ color: isPass ? '#34d399' : '#fb7185' }}
          >
            {isPass ? 'Passed' : 'Failed'}
          </span>
          {isOpen ? <FiChevronDown className="text-gray-500" size={14} /> : <FiChevronRight className="text-gray-500" size={14} />}
        </div>
      </button>

      {/* Collapsible Content */}
      {isOpen && (
        <div className="px-4 pb-4 pt-1 space-y-3 border-t border-white/5">
          {/* Input */}
          <div>
            <div className="text-[10px] uppercase text-gray-500 mb-1.5 tracking-wider font-semibold">Input Data</div>
            <div className="bg-black p-2.5 rounded border border-cyan-900/30 text-cyan-200 font-mono text-xs whitespace-pre-wrap shadow-[inset_0_0_10px_rgba(6,182,212,0.05)]">
              {test.input}
            </div>
          </div>

          {/* Expected vs Actual */}
          <div className="grid grid-cols-2 gap-3">
             <div>
                <div className="text-[10px] uppercase text-gray-500 mb-1.5 tracking-wider font-semibold">Your Output</div>
                <div 
                  className="bg-black p-2.5 rounded border text-xs whitespace-pre-wrap font-mono h-full"
                  style={{ 
                    borderColor: isPass ? 'rgba(16, 185, 129, 0.2)' : 'rgba(225, 29, 72, 0.3)',
                    color: isPass ? '#d4d4d8' : '#fda4af' 
                  }}
                >
                   {test.output}
                </div>
             </div>
             <div>
                <div className="text-[10px] uppercase text-gray-500 mb-1.5 tracking-wider font-semibold">Expected Output</div>
                <div className="bg-black border border-white/10 p-2.5 rounded text-emerald-300 font-mono text-xs whitespace-pre-wrap h-full">
                   {test.expectedOutput}
                </div>
             </div>
          </div>

          {/* Runtime Error Injection */}
          {test.error && (
            <div className="mt-3 text-rose-300 text-xs bg-rose-900/20 p-3 rounded border border-rose-900/50 flex items-start gap-2">
              <FiAlertTriangle className="flex-shrink-0 mt-0.5 text-rose-400" size={14} />
              <span className="font-mono">{test.error}</span>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

const OutputConsole = ({ status, result, error }) => {
  
  // 1. Idle State
  if (status === 'idle' || (!result && !error && status !== 'running')) {
    return (
      <div className="h-full relative overflow-hidden flex items-center justify-center bg-[#09090b]">
        <AmbientGrid />
        <div className="flex items-center gap-2 text-cyan-500/50 font-mono text-xs z-10">
          <FiTerminal size={14} />
          <span>Awaiting execution command... <span className="animate-pulse text-cyan-400">_</span></span>
        </div>
      </div>
    );
  }

  // 2. Loading State
  if (status === 'running' || status === 'pending') {
    return (
      <div className="h-full relative overflow-hidden flex flex-col items-center justify-center bg-[#09090b]">
        <AmbientGrid />
        <div className="z-10 flex flex-col items-center gap-3">
          <FiCpu className="text-cyan-400 animate-pulse" size={24} />
          <span className="text-cyan-300 font-mono text-xs tracking-widest uppercase animate-pulse">
            Compiling Build...
          </span>
        </div>
      </div>
    );
  }

  // 3. System Error State
  if (status === 'error' || error) {
    return (
      <div className="h-full relative overflow-auto bg-[#09090b] p-4">
        <AmbientGrid />
        <div className="relative z-10 border border-rose-900/50 bg-rose-900/10 p-4 rounded-xl flex items-start gap-3">
          <FiAlertTriangle className="text-rose-500 mt-0.5" size={18} />
          <div>
            <h4 className="text-rose-500 font-bold text-xs uppercase tracking-wider mb-1 font-mono">System Exception</h4>
            <div className="text-rose-300/80 font-mono text-xs whitespace-pre-wrap">
              {error?.message || error || "Unknown Error"}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // 4. Result State (Verdict)
  if (!result) return null;

  const verdict = result.status || 'unknown';
  const isAccepted = verdict.toLowerCase() === 'accepted';
  const stats = result.executionStats || { passed: 0, total: 0 };

  return (
    <div className="h-full relative overflow-y-auto bg-[#09090b] scrollbar-thin scrollbar-thumb-white/10 scrollbar-track-transparent">
      <AmbientGrid />
      
      <div className="relative z-10 p-4 space-y-4">
        {/* Telemetry Header */}
        <div 
          className="p-4 rounded-xl border flex justify-between items-center bg-black/40 shadow-sm"
          style={{
            borderColor: isAccepted ? 'rgba(16, 185, 129, 0.2)' : 'rgba(225, 29, 72, 0.2)',
          }}
        >
          <div>
            <div className="text-[10px] text-zinc-500 uppercase tracking-widest font-bold mb-1">
              Final Verdict
            </div>
            <div 
              className="font-bold text-lg uppercase tracking-wider"
              style={{ 
                fontFamily: "'JetBrains Mono', monospace",
                color: isAccepted ? '#34d399' : '#fb7185',
                textShadow: isAccepted ? '0 0 10px rgba(52, 211, 153, 0.3)' : '0 0 10px rgba(251, 113, 133, 0.3)'
              }}
            >
               {verdict.replace(/-/g, ' ')}
            </div>
          </div>

          <div className="text-right">
            <div className="text-[10px] text-zinc-500 uppercase tracking-widest font-bold mb-1">
              Test Cases
            </div>
            <div className="font-mono text-sm">
              <span style={{ color: isAccepted ? '#34d399' : '#fb7185' }}>{stats.passed}</span>
              <span className="text-zinc-600"> / {stats.total}</span>
            </div>
          </div>
        </div>

        {/* Test Cases List */}
        {Array.isArray(result.testResults) && (
          <div className="space-y-3">
            {result.testResults.map((test, index) => (
              <TestCaseItem key={index} test={test} index={index} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default OutputConsole;