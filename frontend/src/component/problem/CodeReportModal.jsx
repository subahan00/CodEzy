import React from 'react';
import { FiX, FiActivity, FiClock, FiDatabase, FiCheckCircle, FiAlertCircle } from 'react-icons/fi';

const CodeReportModal = ({ isOpen, onClose, reportData, isLoading }) => {
  if (!isOpen) return null;

  // Determine score color
  const getScoreColor = (score) => {
    if (score >= 90) return 'text-green-400 drop-shadow-[0_0_10px_rgba(74,222,128,0.5)]';
    if (score >= 70) return 'text-yellow-400 drop-shadow-[0_0_10px_rgba(250,204,21,0.5)]';
    return 'text-red-400 drop-shadow-[0_0_10px_rgba(248,113,113,0.5)]';
  };

  const getStatusIcon = (status) => {
    if (status?.toLowerCase() === 'excellent') return <FiCheckCircle className="text-green-400" />;
    if (status?.toLowerCase() === 'good') return <FiCheckCircle className="text-blue-400" />;
    return <FiAlertCircle className="text-yellow-400" />;
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center backdrop-blur-sm bg-black/60 p-4">
      <div 
        className="w-full max-w-2xl rounded-xl overflow-hidden flex flex-col animate-fade-in-up"
        style={{
          background: '#06040f',
          border: '1px solid rgba(147, 197, 253, 0.2)', // Neon cyan accent for grading
          boxShadow: '0 20px 50px rgba(0,0,0,0.8), 0 0 20px rgba(147, 197, 253, 0.1)'
        }}
      >
        {/* HEADER */}
        <div className="flex justify-between items-center px-6 py-4" style={{ borderBottom: '1px solid rgba(147, 197, 253, 0.1)', background: 'rgba(147, 197, 253, 0.03)' }}>
          <div className="flex items-center gap-2">
            <FiActivity className="text-blue-400 text-xl" />
            <h2 className="text-lg font-bold text-white tracking-wide" style={{ fontFamily: "'JetBrains Mono', monospace" }}>
              AI CODE ANALYSIS
            </h2>
          </div>
          <button onClick={onClose} className="text-gray-500 hover:text-white transition-colors">
            <FiX size={20} />
          </button>
        </div>

        {/* BODY */}
        <div className="p-6 overflow-y-auto max-h-[75vh]">
          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-12 gap-4">
              <div className="w-10 h-10 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
              <p className="text-blue-400 font-mono text-sm animate-pulse">Running static analysis & complexity checks...</p>
            </div>
          ) : reportData ? (
            <div className="flex flex-col gap-6">
              
              {/* Score & Complexity Row */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="flex flex-col items-center justify-center p-4 rounded-lg bg-[#0a0a14] border border-gray-800">
                  <span className="text-xs text-gray-500 font-bold uppercase tracking-widest mb-1">Overall Score</span>
                  <span className={`text-4xl font-black font-mono ${getScoreColor(reportData.overallScore)}`}>
                    {reportData.overallScore}<span className="text-lg text-gray-600">/100</span>
                  </span>
                </div>
                
                <div className="flex flex-col items-center justify-center p-4 rounded-lg bg-[#0a0a14] border border-gray-800">
                  <span className="text-xs text-gray-500 font-bold uppercase tracking-widest mb-1 flex items-center gap-1"><FiClock/> Time</span>
                  <span className="text-2xl font-black text-cyan-400 font-mono">{reportData.timeComplexity}</span>
                </div>

                <div className="flex flex-col items-center justify-center p-4 rounded-lg bg-[#0a0a14] border border-gray-800">
                  <span className="text-xs text-gray-500 font-bold uppercase tracking-widest mb-1 flex items-center gap-1"><FiDatabase/> Space</span>
                  <span className="text-2xl font-black text-cyan-400 font-mono">{reportData.spaceComplexity}</span>
                </div>
              </div>

              {/* Readability & Efficiency */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 rounded-lg bg-[#0a0a14] border border-gray-800">
                  <div className="flex items-center gap-2 mb-2">
                    {getStatusIcon(reportData.efficiency?.status)}
                    <h3 className="font-bold text-gray-200">Efficiency</h3>
                  </div>
                  <p className="text-sm text-gray-400 leading-relaxed">{reportData.efficiency?.feedback}</p>
                </div>

                <div className="p-4 rounded-lg bg-[#0a0a14] border border-gray-800">
                  <div className="flex items-center gap-2 mb-2">
                    {getStatusIcon(reportData.readability?.status)}
                    <h3 className="font-bold text-gray-200">Readability</h3>
                  </div>
                  <p className="text-sm text-gray-400 leading-relaxed">{reportData.readability?.feedback}</p>
                </div>
              </div>

              {/* Actionable Suggestions */}
              {reportData.suggestions && reportData.suggestions.length > 0 && (
                <div className="p-4 rounded-lg bg-[#0a0a14] border border-blue-900/30">
                  <h3 className="font-bold text-blue-400 mb-3 text-sm uppercase tracking-widest font-mono">Optimization Tips</h3>
                  <ul className="space-y-2">
                    {reportData.suggestions.map((tip, index) => (
                      <li key={index} className="text-sm text-gray-300 flex items-start gap-2">
                        <span className="text-blue-500 mt-0.5">▹</span> {tip}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

            </div>
          ) : (
            <div className="text-center py-8 text-red-400">Failed to generate report.</div>
          )}
        </div>
        
        {/* FOOTER */}
        {!isLoading && (
          <div className="px-6 py-4 flex justify-end" style={{ borderTop: '1px solid rgba(147, 197, 253, 0.1)', background: 'rgba(147, 197, 253, 0.02)' }}>
            <button 
              onClick={onClose}
              className="px-6 py-2 rounded font-bold text-sm transition-all hover:bg-blue-900/20"
              style={{ color: '#93c5fd', border: '1px solid rgba(147, 197, 253, 0.3)' }}
            >
              Continue
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default CodeReportModal;