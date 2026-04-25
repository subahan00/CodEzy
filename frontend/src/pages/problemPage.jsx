import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios'; // 👈 Added for AI API call
import CodeEditor from '../component/editor/CodeEditor';
import ProblemDescription from '../component/problem/ProblemDescription';
import CodeReportModal from '../component/problem/CodeReportModal'; // 👈 Import the new modal
import problemService from '../services/problemService/problemService';
import { FiCode, FiMaximize2, FiMinimize2, FiLayout } from 'react-icons/fi';

const ProblemPage = () => {
  const { slug } = useParams();
  const [problem, setProblem] = useState(null);
  const [language, setLanguage] = useState('python');
  const [code, setCode] = useState('');
  const [lastExecutionResult, setLastExecutionResult] = useState(null);

  // Layout modes: 'split' | 'editor-focus' | 'desc-focus'
  const [layoutMode, setLayoutMode] = useState('split');

  // ── AI Report Modal State ───────────────────────────────────────────────
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);
  const [isGeneratingReport, setIsGeneratingReport] = useState(false);
  const [reportData, setReportData] = useState(null);

  useEffect(() => {
    const fetchProblemDetails = async () => {
      try {
        const response = await problemService.getProblemBySlug(slug);
        const problemData = response.data.data;
        setProblem(problemData);
        const starter = problemData.starterCode?.find(sc => sc.language === language);
        setCode(starter ? starter.code : '# Write your solution here\n');
      } catch (error) {
        console.error('Failed to fetch problem:', error);
        setCode('# Error loading problem code.');
      }
    };
    fetchProblemDetails();
  }, [slug]);

  const handleLanguageChange = (newLang) => {
    setLanguage(newLang);
    if (problem?.starterCode) {
      const template = problem.starterCode.find(sc => sc.language === newLang);
      setCode(template ? template.code : '# No starter code for this language.\n');
    }
  };

  // ── AI Report Trigger ───────────────────────────────────────────────────
  const handleSubmissionAccepted = async () => {
    setIsReportModalOpen(true);
    setIsGeneratingReport(true);
    setReportData(null); // Reset previous report

    try {
      const token = localStorage.getItem('token');
      // Call the backend AI evaluation route
      const res = await axios.post(`${import.meta.env.VITE_BACKEND_URL}/api/ai/evaluate`, {
        code: code,
        language: language,
        problemId: problem._id
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      setReportData(res.data.data);
    } catch (error) {
      console.error("AI Evaluation failed", error);
      setReportData(null); // The modal will handle the null state by showing an error message
    } finally {
      setIsGeneratingReport(false);
    }
  };

  const layoutStyles = {
    split: { left: 'w-[45%]', right: 'w-[55%]' },
    'editor-focus': { left: 'w-[30%]', right: 'w-[70%]' },
    'desc-focus': { left: 'w-[60%]', right: 'w-[40%]' },
  };

  if (!problem) {
    return (
      <div className="flex items-center justify-center h-screen" style={{ background: '#080a12' }}>
        <div className="flex flex-col items-center gap-4">
          <div
            className="w-8 h-8 rounded-full border-2 border-t-transparent animate-spin"
            style={{ borderColor: 'rgba(139,92,246,0.6)', borderTopColor: 'transparent' }}
          />
          <span
            className="text-xs uppercase tracking-[0.3em] font-semibold"
            style={{ color: 'rgba(139,92,246,0.6)', fontFamily: "'JetBrains Mono', monospace" }}
          >
            Loading Challenge
          </span>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen overflow-hidden" style={{ background: '#080a12' }}>

      {/* ── TOP CHROME BAR ── */}
      <header
        className="flex items-center justify-between px-5 py-2.5 shrink-0 z-20"
        style={{
          background: 'rgba(8,10,18,0.95)',
          borderBottom: '1px solid rgba(99,102,241,0.1)',
          backdropFilter: 'blur(12px)',
        }}
      >
        {/* Left: Platform identity */}
        <div className="flex items-center gap-3">
          <div
            className="flex items-center gap-2 text-xs font-bold tracking-widest uppercase"
            style={{ color: '#6366f1', fontFamily: "'JetBrains Mono', monospace" }}
          >
            <FiCode size={14} />
            <span>CodEzy</span>
          </div>
          <span style={{ color: 'rgba(255,255,255,0.1)', fontSize: 12 }}>/</span>
          <span
            className="text-xs font-semibold truncate max-w-[260px]"
            style={{ color: 'rgba(200,200,230,0.7)', fontFamily: "'JetBrains Mono', monospace" }}
          >
            {problem.title}
          </span>
        </div>

        {/* Center: Difficulty badge */}
        <DifficultyBadge difficulty={problem.difficulty} />

        {/* Right: Layout switcher */}
        <div className="flex items-center gap-1">
          {[
            { id: 'desc-focus', icon: FiLayout, title: 'Description focus' },
            { id: 'split', icon: FiMinimize2, title: 'Split 50/50' },
            { id: 'editor-focus', icon: FiMaximize2, title: 'Editor focus' },
          ].map(({ id, icon: Icon, title }) => (
            <button
              key={id}
              title={title}
              onClick={() => setLayoutMode(id)}
              className="p-2 rounded transition-all duration-200"
              style={{
                background: layoutMode === id ? 'rgba(99,102,241,0.15)' : 'transparent',
                border: `1px solid ${layoutMode === id ? 'rgba(99,102,241,0.35)' : 'transparent'}`,
                color: layoutMode === id ? '#818cf8' : 'rgba(255,255,255,0.25)',
              }}
            >
              <Icon size={13} />
            </button>
          ))}
        </div>
      </header>

      {/* ── MAIN SPLIT CONTENT ── */}
      <main className="flex flex-1 overflow-hidden">

        {/* LEFT PANEL */}
        <div
          className={`${layoutStyles[layoutMode].left} h-full overflow-hidden transition-all duration-300 ease-in-out shrink-0`}
          style={{ borderRight: '1px solid rgba(99,102,241,0.08)' }}
        >
          <ProblemDescription
            problem={problem}
            currentCode={code}
            language={language}
            executionResult={lastExecutionResult}
          />
        </div>

        {/* RIGHT PANEL */}
        <div className={`${layoutStyles[layoutMode].right} h-full overflow-hidden transition-all duration-300 ease-in-out`}>
          <CodeEditor
            code={code}
            setCode={setCode}
            language={language}
            setLanguage={handleLanguageChange}
            problemId={problem._id}
            onExecutionResult={setLastExecutionResult}
            onSubmissionAccepted={handleSubmissionAccepted} // 👈 Passed trigger down
          />
        </div>
      </main>

      {/* ── AI CODE REPORT MODAL ── */}
      <CodeReportModal 
        isOpen={isReportModalOpen} 
        onClose={() => setIsReportModalOpen(false)} 
        reportData={reportData} 
        isLoading={isGeneratingReport} 
      />
    </div>
  );
};

const DifficultyBadge = ({ difficulty }) => {
  const styles = {
    easy: { color: '#34d399', bg: 'rgba(16,185,129,0.08)', border: 'rgba(16,185,129,0.25)' },
    medium: { color: '#fbbf24', bg: 'rgba(245,158,11,0.08)', border: 'rgba(245,158,11,0.25)' },
    hard: { color: '#f87171', bg: 'rgba(239,68,68,0.08)', border: 'rgba(239,68,68,0.25)' },
  };
  const s = styles[difficulty?.toLowerCase()] || styles.easy;
  return (
    <span
      className="px-2.5 py-1 rounded text-[10px] font-bold uppercase tracking-widest"
      style={{
        color: s.color,
        background: s.bg,
        border: `1px solid ${s.border}`,
        fontFamily: "'JetBrains Mono', monospace",
      }}
    >
      {difficulty}
    </span>
  );
};

export default ProblemPage;