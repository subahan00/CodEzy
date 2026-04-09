import React, { useState } from 'react';
import ReactMarkdown from 'react-markdown';
import rehypeHighlight from 'rehype-highlight';
import 'highlight.js/styles/atom-one-dark.css';
import { FiTag, FiCpu, FiCheckCircle, FiCopy, FiCheck, FiTerminal, FiDatabase, FiLayers } from 'react-icons/fi';
import toast from 'react-hot-toast';
import AiMentorTab from './AiMentor'; 

// Ambient Grid for unified aesthetic
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

// UX Enhancement: Copy Button Component
const CopyButton = ({ text }) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    toast.success("Copied to clipboard", {
      style: { background: '#0d0f1a', color: '#a5b4fc', border: '1px solid rgba(99,102,241,0.3)', fontSize: '12px', fontFamily: "'JetBrains Mono', monospace" },
      duration: 1500
    });
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <button 
      onClick={handleCopy}
      className="p-1.5 rounded-md hover:bg-white/10 transition-colors text-gray-500 hover:text-indigo-300"
      title="Copy to clipboard"
    >
      {copied ? <FiCheck size={14} className="text-emerald-400" /> : <FiCopy size={14} />}
    </button>
  );
};

const ProblemDescription = ({ problem, currentCode, language, executionResult }) => {
  const [activeTab, setActiveTab] = useState('description');

  if (!problem) return null;

  const getDifficultyStyles = (diff) => {
    switch (diff?.toLowerCase()) {
      case 'easy': 
        return { color: '#34d399', bg: 'rgba(16, 185, 129, 0.1)', border: 'rgba(16, 185, 129, 0.3)' };
      case 'medium': 
        return { color: '#fbbf24', bg: 'rgba(245, 158, 11, 0.1)', border: 'rgba(245, 158, 11, 0.3)' };
      case 'hard': 
        return { color: '#fb7185', bg: 'rgba(225, 29, 72, 0.1)', border: 'rgba(225, 29, 72, 0.3)' };
      default: 
        return { color: '#9ca3af', bg: 'rgba(156, 163, 175, 0.1)', border: 'rgba(156, 163, 175, 0.3)' };
    }
  };

  const diffStyles = getDifficultyStyles(problem.difficulty);

  return (
    <div 
      className="flex flex-col h-full relative overflow-hidden text-gray-300"
      style={{
        background: 'linear-gradient(110deg, #0d0f1a 0%, #0f0d1f 50%, #0d0f1a 100%)',
      }}
    >
      <AmbientGrid />

      {/* --- TABS --- */}
      <div 
        className="relative z-10 flex border-b"
        style={{ 
          borderColor: 'rgba(99,102,241,0.15)',
          background: 'rgba(13, 15, 26, 0.6)',
          backdropFilter: 'blur(8px)'
        }}
      >
        {[
          { id: 'description', label: 'Briefing', icon: FiLayers },
          { id: 'submissions', label: 'Telemetry', icon: FiDatabase },
          { id: 'mentor', label: 'AI Mentor', icon: FiCpu, isSpecial: true }
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`px-5 py-3.5 text-[11px] font-bold uppercase tracking-widest border-b-2 transition-all flex items-center gap-2 ${
              activeTab === tab.id
                ? tab.isSpecial 
                  ? 'border-fuchsia-500 text-fuchsia-400 bg-fuchsia-500/5'
                  : 'border-indigo-500 text-indigo-300 bg-indigo-500/5'
                : 'border-transparent text-gray-500 hover:text-gray-300 hover:bg-white/5'
            }`}
            style={{ fontFamily: "'JetBrains Mono', monospace" }}
          >
            <tab.icon size={14} className={activeTab === tab.id && tab.isSpecial ? "animate-pulse" : ""} />
            {tab.label}
          </button>
        ))}
      </div>

      {/* --- CONTENT AREA --- */}
      <div className="flex-1 relative z-10 overflow-y-auto p-6 scrollbar-thin scrollbar-thumb-white/10 scrollbar-track-transparent">

        {activeTab === 'description' && (
          <div className="space-y-8 max-w-4xl">

            {/* Header */}
            <div>
              <h1 className="text-3xl font-bold text-white mb-4 tracking-tight drop-shadow-md">
                {problem.title}
              </h1>
              <div className="flex items-center gap-4">
                <span 
                  className="px-3 py-1 rounded border text-[11px] font-bold uppercase tracking-widest"
                  style={{
                    color: diffStyles.color,
                    background: diffStyles.bg,
                    borderColor: diffStyles.border,
                    fontFamily: "'JetBrains Mono', monospace",
                    boxShadow: `0 0 10px ${diffStyles.bg}`
                  }}
                >
                  {problem.difficulty}
                </span>

                <div className="flex items-center gap-2 text-xs text-indigo-300/70 font-mono">
                  <FiCheckCircle size={14} className="text-emerald-500/70" /> 
                  {problem.stats?.acceptanceRate || 'N/A'}% System Acceptance
                </div>
              </div>
            </div>

            {/* Markdown Description */}
            <div className="prose prose-invert prose-indigo max-w-none text-indigo-100/80 leading-relaxed text-[15px]">
              <ReactMarkdown rehypePlugins={[rehypeHighlight]}>
                {problem.description}
              </ReactMarkdown>
            </div>

            {/* Examples */}
            {problem.examples && problem.examples.length > 0 && (
              <div className="mt-8 space-y-6">
                <h3 className="text-[10px] uppercase font-bold tracking-widest text-gray-500 border-b border-white/10 pb-2">
                  Test Vectors
                </h3>
                {problem.examples.map((ex, index) => (
                  <div 
                    key={index} 
                    className="rounded-lg border overflow-hidden"
                    style={{
                      background: 'rgba(13, 15, 26, 0.4)',
                      borderColor: 'rgba(99,102,241,0.2)'
                    }}
                  >
                    <div className="bg-indigo-900/20 px-4 py-2 border-b border-indigo-500/20 flex justify-between items-center">
                      <span className="text-[11px] font-bold text-indigo-300 font-mono">EXAMPLE {index + 1}</span>
                      <FiTerminal size={12} className="text-indigo-400/50" />
                    </div>

                    <div className="p-4 space-y-4 text-sm font-mono">
                      <div>
                        <div className="flex justify-between items-end mb-1.5">
                           <span className="text-[10px] text-gray-500 uppercase tracking-widest font-semibold">Input</span>
                           <CopyButton text={ex.input} />
                        </div>
                        <div className="bg-[#05050a] p-3 rounded border border-white/5 text-indigo-200 break-all">
                          {ex.input}
                        </div>
                      </div>
                      
                      <div>
                        <div className="flex justify-between items-end mb-1.5">
                           <span className="text-[10px] text-gray-500 uppercase tracking-widest font-semibold">Output</span>
                           <CopyButton text={ex.output} />
                        </div>
                        <div className="bg-[#05050a] p-3 rounded border border-white/5 text-emerald-300 break-all">
                          {ex.output}
                        </div>
                      </div>

                      {ex.explanation && (
                        <div>
                          <span className="text-[10px] text-gray-500 uppercase tracking-widest font-semibold block mb-1.5">Explanation</span>
                          <div className="text-gray-400 text-xs leading-relaxed border-l-2 border-indigo-500/30 pl-3 py-1">
                            {ex.explanation}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Constraints */}
            <div className="mt-8">
              <h3 className="text-[10px] uppercase font-bold tracking-widest text-gray-500 border-b border-white/10 pb-2 mb-4">
                System Constraints
              </h3>
              <ul className="space-y-2 text-xs font-mono">
                {(problem.constraints || ['Time Limit: 2000ms', 'Memory Limit: 256MB']).map((c, i) => (
                  <li key={i} className="flex items-start gap-2">
                    <span className="text-indigo-500 mt-0.5">▹</span>
                    <span className="bg-indigo-500/10 text-indigo-200 px-2 py-0.5 rounded border border-indigo-500/20">{c}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Tags */}
            {problem.tags && problem.tags.length > 0 && (
              <div className="mt-8 pt-6 border-t border-white/10">
                <div className="flex flex-wrap gap-2">
                  {problem.tags.map((tag) => (
                    <span 
                      key={tag} 
                      className="px-2.5 py-1 text-[10px] uppercase font-bold tracking-wider rounded flex items-center gap-1.5 transition-colors cursor-default"
                      style={{
                        background: 'rgba(99,102,241,0.1)',
                        border: '1px solid rgba(99,102,241,0.2)',
                        color: '#a5b4fc',
                      }}
                    >
                      <FiTag size={10} /> {tag}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {activeTab === 'submissions' && (
          <div className="h-full flex flex-col items-center justify-center text-indigo-300/50 space-y-3">
            <FiDatabase size={32} className="opacity-50" />
            <p className="font-mono text-xs uppercase tracking-widest">Awaiting local telemetry data...</p>
          </div>
        )}
        
        {activeTab === 'mentor' && (
          <div className="h-full pb-4">
            <AiMentorTab 
               currentCode={currentCode} 
               language={language}
               problem={problem}
               executionResult={executionResult}
            />
          </div>
        )}

      </div>
    </div>
  );
};

export default ProblemDescription;