import React, { useState, useEffect, useRef, useCallback } from 'react';
import Editor from '@monaco-editor/react';
import {
  FiPlay, FiSend, FiCommand, FiLoader, FiChevronUp, FiChevronDown,
  FiMaximize2, FiMinimize2, FiRotateCcw, FiClock
} from 'react-icons/fi';
import toast from 'react-hot-toast';
import { usePollSubmission } from '../../hooks/usePollSubmission';
import OutputConsole from './OutputConsole';
import submissionService from '../../services/submissionService/submissionService';

// ── Theme Definition ──────────────────────────────────────────────────────
const defineEditorTheme = (monaco) => {
  monaco.editor.defineTheme('codEzy', {
    base: 'vs-dark',
    inherit: true,
    rules: [
      { token: 'comment',    foreground: '4a5578', fontStyle: 'italic' },
      { token: 'keyword',    foreground: 'c084fc' },
      { token: 'string',     foreground: '6ee7b7' },
      { token: 'number',     foreground: 'fcd34d' },
      { token: 'identifier', foreground: 'c7d2fe' },
      { token: 'function',   foreground: '93c5fd' },
      { token: 'type',       foreground: 'f9a8d4' },
      { token: 'operator',   foreground: '818cf8' },
    ],
    colors: {
      'editor.background':                  '#080a12',
      'editor.foreground':                  '#c7d2fe',
      'editorLineNumber.foreground':        '#2d3155',
      'editorLineNumber.activeForeground':  '#6366f1',
      'editorCursor.foreground':            '#818cf8',
      'editor.selectionBackground':         '#312e8150',
      'editor.lineHighlightBackground':     '#0f1125',
      'editorIndentGuide.background':       '#1a1d35',
      'editorIndentGuide.activeBackground': '#3730a3',
      'editorGutter.background':            '#080a12',
      'scrollbar.shadow':                   '#00000000',
      'scrollbarSlider.background':         '#1e2040',
      'scrollbarSlider.hoverBackground':    '#3730a360',
      'scrollbarSlider.activeBackground':   '#4f46e560',
      'editorWidget.background':            '#0d1020',
      'editorSuggestWidget.background':     '#0d1020',
      'editorSuggestWidget.border':         '#1e2348',
      'editorSuggestWidget.selectedBackground': '#1e2a5c',
    },
  });
};

// ── Language Config ───────────────────────────────────────────────────────
const LANGUAGES = [
  { value: 'python',     label: 'Python',     ext: '.py'  },
  { value: 'javascript', label: 'JavaScript', ext: '.js'  },
  { value: 'cpp',        label: 'C++',        ext: '.cpp' },
  { value: 'java',       label: 'Java',       ext: '.java'},
];

// ── Console heights ───────────────────────────────────────────────────────
const CONSOLE_HEIGHTS = { collapsed: '38px', normal: '34%', expanded: '60%' };

const CodeEditor = ({ code, setCode, language, setLanguage, problemId, onExecutionResult, onSubmissionAccepted }) => {
  const { startPolling, status: submitStatus, result: submitResult, error: submitError } = usePollSubmission();
  const editorRef      = useRef(null);
  const monacoRef      = useRef(null);
  const startTimeRef   = useRef(null);

  const [runLoading, setRunLoading]       = useState(false);
  const [runOutput,  setRunOutput]        = useState(null);
  const [consoleMode, setConsoleMode]     = useState('normal');  // 'collapsed' | 'normal' | 'expanded'
  const [elapsedTime, setElapsedTime]     = useState(null);
  const [lineCount,   setLineCount]       = useState(0);

  // ── Submission result toasts ──────────────────────────────────────────
  useEffect(() => {
    if (submitStatus === 'completed' && submitResult) {
      const accepted = submitResult.status === 'accepted';
      (accepted ? toast.success : toast.error)(
        accepted ? '🏆 Accepted! Great work.' : `❌ Verdict: ${submitResult.status}`,
        {
          style: {
            background: '#080a12',
            color:  accepted ? '#4ade80' : '#f87171',
            border: `1px solid ${accepted ? 'rgba(74,222,128,0.2)' : 'rgba(248,113,113,0.2)'}`,
            fontFamily: "'JetBrains Mono', monospace",
            fontSize: '12px',
          },
          duration: 4000,
        }
      );
      if (onExecutionResult) onExecutionResult(submitResult);
      if (accepted && onSubmissionAccepted) onSubmissionAccepted();
    }
  }, [submitStatus, submitResult]);

  // ── Keyboard shortcuts ────────────────────────────────────────────────
  useEffect(() => {
    const handler = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
        e.preventDefault();
        if (!isPending) handleRun();
      }
      if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key === 'Enter') {
        e.preventDefault();
        if (!isPending) handleSubmit();
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [code, language, problemId]);

  const handleBeforeMount = (monaco) => {
    monacoRef.current = monaco;
    defineEditorTheme(monaco);
  };

  const handleEditorMount = (editor) => {
    editorRef.current = editor;
    setLineCount(editor.getModel()?.getLineCount() || 0);
    editor.onDidChangeModelContent(() => {
      setLineCount(editor.getModel()?.getLineCount() || 0);
    });
  };

  const handleFormat = useCallback(() => {
    editorRef.current?.getAction('editor.action.formatDocument')?.run();
    toast('✨ Formatted', {
      style: { background: '#080a12', color: '#818cf8', border: '1px solid rgba(99,102,241,0.2)', fontSize: '11px', fontFamily: "'JetBrains Mono', monospace" },
      duration: 1500,
    });
  }, []);

  const handleReset = useCallback(() => {
    if (!confirm('Reset code to starter template?')) return;
    setCode('');
    toast('Code reset', { style: { background: '#080a12', color: '#94a3b8', fontSize: '11px', fontFamily: "'JetBrains Mono', monospace" } });
  }, []);

  const handleRun = async () => {
    if (!problemId) return toast.error('Problem ID missing');
    setRunLoading(true);
    setRunOutput(null);
    startTimeRef.current = Date.now();
    setElapsedTime(null);
    const tid = toast.loading('Executing...', {
      style: { background: '#080a12', color: '#818cf8', border: '1px solid rgba(99,102,241,0.2)', fontFamily: "'JetBrains Mono', monospace", fontSize: '11px' },
    });
    try {
      const res = await submissionService.runCode(language, code, problemId);
      const elapsed = ((Date.now() - startTimeRef.current) / 1000).toFixed(2);
      setElapsedTime(elapsed);
      toast.dismiss(tid);
      toast.success(`Done in ${elapsed}s`, {
        style: { background: '#080a12', color: '#818cf8', border: '1px solid rgba(99,102,241,0.2)', fontFamily: "'JetBrains Mono', monospace", fontSize: '11px' },
      });
      setRunOutput(res.data.data);
      if (onExecutionResult) onExecutionResult(res.data.data);
      if (consoleMode === 'collapsed') setConsoleMode('normal');
    } catch (err) {
      toast.dismiss(tid);
      toast.error(err.response?.data?.message || 'Run failed');
      setRunOutput({ error: err.message });
      if (consoleMode === 'collapsed') setConsoleMode('normal');
    } finally {
      setRunLoading(false);
    }
  };

  const handleSubmit = async () => {
    if (!problemId) return toast.error('Problem ID missing');
    setRunOutput(null);
    try {
      const response = await submissionService.createSubmission(problemId, language, code);
      const { submissionId } = response.data.data;
      toast('🚀 Submitted. Awaiting verdict...', {
        style: { background: '#080a12', color: '#818cf8', border: '1px solid rgba(99,102,241,0.2)', fontFamily: "'JetBrains Mono', monospace", fontSize: '11px' },
      });
      startPolling(submissionId);
      if (consoleMode === 'collapsed') setConsoleMode('normal');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Submission failed');
    }
  };

  const isPending   = runLoading || submitStatus === 'running';
  const displayStatus  = runLoading ? 'running' : (runOutput ? 'completed' : submitStatus);
  const displayResult  = runOutput || submitResult;
  const displayError   = runOutput?.error || submitError;

  const consolePanelHeight = CONSOLE_HEIGHTS[consoleMode];

  return (
    <div
      className="flex flex-col h-full"
      style={{ background: '#080a12' }}
    >

      {/* ── TOOLBAR ─────────────────────────────────────────────────────── */}
      <div
        className="flex items-center justify-between px-4 py-2 shrink-0"
        style={{ borderBottom: '1px solid rgba(99,102,241,0.1)', background: '#09091a' }}
      >
        {/* Language selector */}
        <div className="flex items-center gap-2">
          <div className="relative">
            <select
              value={language}
              onChange={(e) => setLanguage(e.target.value)}
              className="appearance-none cursor-pointer outline-none pr-7 pl-3 py-1.5 text-[11px] font-bold uppercase tracking-widest transition-colors"
              style={{
                background: 'rgba(99,102,241,0.07)',
                border: '1px solid rgba(99,102,241,0.18)',
                color: '#a5b4fc',
                borderRadius: 8,
                fontFamily: "'JetBrains Mono', monospace",
              }}
            >
              {LANGUAGES.map(l => (
                <option key={l.value} value={l.value} style={{ background: '#0d1020' }}>
                  {l.label}
                </option>
              ))}
            </select>
            <FiChevronDown
              size={11}
              className="absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none"
              style={{ color: '#6366f1' }}
            />
          </div>

          {/* Utility buttons */}
          <Btn title="Format  (Ctrl+Shift+F)" onClick={handleFormat}>
            <FiCommand size={13} />
          </Btn>
          <Btn title="Reset code" onClick={handleReset}>
            <FiRotateCcw size={13} />
          </Btn>
        </div>

        {/* Status info */}
        <div className="flex items-center gap-3">
          {elapsedTime && !isPending && (
            <span
              className="flex items-center gap-1 text-[10px]"
              style={{ color: 'rgba(99,102,241,0.5)', fontFamily: "'JetBrains Mono', monospace" }}
            >
              <FiClock size={10} />
              {elapsedTime}s
            </span>
          )}
          <span
            className="text-[10px]"
            style={{ color: 'rgba(99,102,241,0.35)', fontFamily: "'JetBrains Mono', monospace" }}
          >
            {lineCount}L
          </span>
        </div>

        {/* Action buttons */}
        <div className="flex gap-2">
          <button
            onClick={handleRun}
            disabled={isPending}
            title="Run  (Ctrl+Enter)"
            className="flex items-center gap-1.5 transition-all duration-200 disabled:opacity-40 disabled:cursor-not-allowed hover:brightness-125 active:scale-[0.97]"
            style={{
              padding: '6px 14px',
              borderRadius: 8,
              fontSize: 11,
              fontWeight: 700,
              fontFamily: "'JetBrains Mono', monospace",
              letterSpacing: '0.07em',
              textTransform: 'uppercase',
              background: 'rgba(99,102,241,0.09)',
              border: '1px solid rgba(99,102,241,0.25)',
              color: '#a5b4fc',
            }}
          >
            {runLoading
              ? <FiLoader size={11} className="animate-spin" />
              : <FiPlay size={11} />
            }
            {runLoading ? 'Running' : 'Run'}
          </button>

          <button
            onClick={handleSubmit}
            disabled={isPending}
            title="Submit  (Ctrl+Shift+Enter)"
            className="flex items-center gap-1.5 transition-all duration-200 disabled:opacity-40 disabled:cursor-not-allowed hover:brightness-125 active:scale-[0.97]"
            style={{
              padding: '6px 14px',
              borderRadius: 8,
              fontSize: 11,
              fontWeight: 700,
              fontFamily: "'JetBrains Mono', monospace",
              letterSpacing: '0.07em',
              textTransform: 'uppercase',
              background: submitStatus === 'running' ? 'rgba(34,197,94,0.08)' : 'rgba(34,197,94,0.12)',
              border: `1px solid ${submitStatus === 'running' ? 'rgba(34,197,94,0.25)' : 'rgba(34,197,94,0.4)'}`,
              color: '#4ade80',
            }}
          >
            {submitStatus === 'running'
              ? <FiLoader size={11} className="animate-spin" />
              : <FiSend size={11} />
            }
            {submitStatus === 'running' ? 'Judging' : 'Submit'}
          </button>
        </div>
      </div>

      {/* ── EDITOR ──────────────────────────────────────────────────────── */}
      <div className="flex-1 overflow-hidden" style={{ background: '#080a12' }}>
        <Editor
          height="100%"
          theme="codEzy"
          language={language}
          value={code}
          onChange={(v) => setCode(v || '')}
          beforeMount={handleBeforeMount}
          onMount={handleEditorMount}
          options={{
            minimap: { enabled: false },
            fontSize: 13.5,
            fontFamily: "'JetBrains Mono', 'Fira Code', monospace",
            fontLigatures: true,
            lineHeight: 23,
            scrollBeyondLastLine: false,
            automaticLayout: true,
            padding: { top: 20, bottom: 20 },
            cursorBlinking: 'smooth',
            cursorSmoothCaretAnimation: 'on',
            renderLineHighlight: 'line',
            bracketPairColorization: { enabled: true },
            smoothScrolling: true,
            wordWrap: 'off',
            scrollbar: {
              verticalScrollbarSize: 5,
              horizontalScrollbarSize: 5,
              useShadows: false,
            },
            overviewRulerLanes: 0,
            hideCursorInOverviewRuler: true,
            overviewRulerBorder: false,
          }}
        />
      </div>

      {/* ── CONSOLE ─────────────────────────────────────────────────────── */}
      <div
        className="shrink-0 flex flex-col transition-all duration-250 ease-in-out"
        style={{
          height: consolePanelHeight,
          borderTop: '1px solid rgba(99,102,241,0.1)',
          background: '#06080f',
        }}
      >
        {/* Console header */}
        <div
          className="flex items-center justify-between px-4 py-2 shrink-0 cursor-pointer select-none"
          style={{ borderBottom: '1px solid rgba(99,102,241,0.07)' }}
          onClick={() => setConsoleMode(c => c === 'collapsed' ? 'normal' : c === 'normal' ? 'expanded' : 'collapsed')}
        >
          <div className="flex items-center gap-2">
            <span
              className="w-1.5 h-1.5 rounded-full"
              style={{
                background: isPending ? '#fbbf24' : (displayResult ? (displayResult.status === 'accepted' ? '#4ade80' : '#f87171') : 'rgba(99,102,241,0.4)'),
                boxShadow: isPending ? '0 0 6px rgba(251,191,36,0.6)' : 'none',
              }}
            />
            <span
              className="text-[10px] font-bold uppercase tracking-widest"
              style={{ color: 'rgba(99,102,241,0.5)', fontFamily: "'JetBrains Mono', monospace" }}
            >
              Console
            </span>
            {displayStatus === 'completed' && displayResult && (
              <span
                className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded"
                style={{
                  color: displayResult.status === 'accepted' ? '#4ade80' : '#f87171',
                  background: displayResult.status === 'accepted' ? 'rgba(74,222,128,0.08)' : 'rgba(248,113,113,0.08)',
                  fontFamily: "'JetBrains Mono', monospace",
                }}
              >
                {displayResult.status}
              </span>
            )}
          </div>
          <div className="flex items-center gap-1">
            <span className="text-[9px] uppercase tracking-widest" style={{ color: 'rgba(99,102,241,0.3)', fontFamily: "'JetBrains Mono', monospace" }}>
              {consoleMode === 'collapsed' ? 'expand' : consoleMode === 'normal' ? 'fullscreen' : 'collapse'}
            </span>
            {consoleMode === 'collapsed'
              ? <FiChevronUp size={12} style={{ color: 'rgba(99,102,241,0.4)' }} />
              : consoleMode === 'normal'
              ? <FiMaximize2 size={11} style={{ color: 'rgba(99,102,241,0.4)' }} />
              : <FiMinimize2 size={11} style={{ color: 'rgba(99,102,241,0.4)' }} />
            }
          </div>
        </div>

        {/* Console body */}
        {consoleMode !== 'collapsed' && (
          <div className="flex-1 overflow-hidden">
            <OutputConsole
              status={displayStatus}
              result={displayResult}
              error={displayError}
            />
          </div>
        )}
      </div>
    </div>
  );
};

// ── Utility: icon button ──────────────────────────────────────────────────
const Btn = ({ children, onClick, title }) => (
  <button
    title={title}
    onClick={onClick}
    className="p-1.5 rounded transition-all duration-150 hover:bg-indigo-500/10 active:scale-95"
    style={{ color: 'rgba(99,102,241,0.4)', border: '1px solid transparent' }}
    onMouseEnter={(e) => e.currentTarget.style.color = '#818cf8'}
    onMouseLeave={(e) => e.currentTarget.style.color = 'rgba(99,102,241,0.4)'}
  >
    {children}
  </button>
);

export default CodeEditor;