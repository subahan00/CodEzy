import React, { useEffect, useState } from 'react';
import ReactMarkdown from 'react-markdown';
import rehypeHighlight from 'rehype-highlight';
import 'highlight.js/styles/atom-one-dark.css';
import {
  FiTag, FiCpu, FiCheckCircle, FiCopy, FiCheck, FiTerminal,
  FiDatabase, FiLayers, FiBarChart2, FiBookmark
} from 'react-icons/fi';
import toast from 'react-hot-toast';
import AiMentorTab from './AiMentor';
import submissionService from '../../services/submissionService/submissionService';

// ── Copy Button ───────────────────────────────────────────────────────────
const CopyBtn = ({ text }) => {
  const [done, setDone] = useState(false);
  const copy = () => {
    navigator.clipboard.writeText(text);
    setDone(true);
    toast('Copied', {
      style: { background: '#0a0c17', color: '#818cf8', border: '1px solid rgba(99,102,241,0.2)', fontSize: 11, fontFamily: "'JetBrains Mono', monospace" },
      duration: 1200,
    });
    setTimeout(() => setDone(false), 1800);
  };
  return (
    <button
      onClick={copy}
      className="p-1 rounded transition-all duration-150 hover:bg-white/5"
      style={{ color: done ? '#34d399' : 'rgba(148,163,184,0.3)' }}
    >
      {done ? <FiCheck size={12} /> : <FiCopy size={12} />}
    </button>
  );
};

// ── Difficulty ────────────────────────────────────────────────────────────
const DIFF = {
  easy:   { color: '#34d399', bg: 'rgba(16,185,129,0.08)',  border: 'rgba(16,185,129,0.2)'  },
  medium: { color: '#fbbf24', bg: 'rgba(245,158,11,0.08)',  border: 'rgba(245,158,11,0.2)'  },
  hard:   { color: '#f87171', bg: 'rgba(239,68,68,0.08)',   border: 'rgba(239,68,68,0.2)'   },
};

// ── Tabs ──────────────────────────────────────────────────────────────────
const TABS = [
  { id: 'description', label: 'Problem',     Icon: FiLayers   },
  { id: 'stats',       label: 'Stats',       Icon: FiBarChart2 },
  { id: 'submissions', label: 'History',     Icon: FiDatabase  },
  { id: 'mentor',      label: 'AI Mentor',   Icon: FiCpu,  glow: true },
];

// ── Main Component ────────────────────────────────────────────────────────
const ProblemDescription = ({ problem, currentCode, language, executionResult }) => {
  const [tab, setTab] = useState('description');
  const [submission, setSubmission] = useState(null);
  
  // Note: imported useEffect at the top to fix undefined error
  useEffect(() => {
    if (tab === 'submissions') {
      const fetchSubmission = async () => {
        try {
          console.log('Fetching submission for problem ID:', problem._id);
          const submission = await submissionService.getSubmissionByProblemId(problem._id);
          setSubmission(submission);
        } catch (error) {
          console.error(error);
        }
      };
      fetchSubmission();
    }
  }, [tab, problem]);

  if (!problem) return null;

  const diff = DIFF[problem.difficulty?.toLowerCase()] || DIFF.easy;

  return (
    <div
      className="flex flex-col h-full"
      style={{ background: '#080a12' }}
    >
      {/* ── Tab Bar ── */}
      <div
        className="flex items-end px-1 shrink-0"
        style={{ borderBottom: '1px solid rgba(99,102,241,0.1)', background: '#09091a' }}
      >
        {TABS.map(({ id, label, Icon, glow }) => {
          const active = tab === id;
          return (
            <button
              key={id}
              onClick={() => setTab(id)}
              className="relative flex items-center gap-1.5 px-4 py-3 text-[10px] font-bold uppercase tracking-widest transition-all duration-150"
              style={{
                fontFamily: "'JetBrains Mono', monospace",
                color: active
                  ? (glow ? '#e879f9' : '#818cf8')
                  : 'rgba(148,163,184,0.35)',
                borderBottom: `2px solid ${active ? (glow ? '#d946ef' : '#6366f1') : 'transparent'}`,
                marginBottom: -1,
              }}
            >
              <Icon size={12} className={active && glow ? 'animate-pulse' : ''} />
              {label}
              {id === 'mentor' && (
                <span
                  className="text-[8px] px-1 py-0.5 rounded font-black"
                  style={{ background: 'rgba(217,70,239,0.15)', color: '#e879f9', border: '1px solid rgba(217,70,239,0.25)' }}
                >
                  AI
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* ── Content ── */}
      <div
        className="flex-1 overflow-y-auto"
        style={{ scrollbarWidth: 'thin', scrollbarColor: 'rgba(99,102,241,0.1) transparent' }}
      >

        {/* ───────────── DESCRIPTION TAB ───────────── */}
        {tab === 'description' && (
          <div className="p-6 space-y-7 max-w-3xl">

            {/* Title + meta */}
            <div className="space-y-3">
              <div className="flex items-start justify-between gap-3">
                <h1
                  className="text-xl font-bold leading-tight"
                  style={{ color: '#e2e8f0', letterSpacing: '-0.02em' }}
                >
                  {problem.title}
                </h1>
                <button
                  className="p-1.5 rounded transition-all shrink-0 hover:bg-white/5"
                  style={{ color: 'rgba(148,163,184,0.3)' }}
                  title="Bookmark"
                >
                  <FiBookmark size={14} />
                </button>
              </div>

              <div className="flex items-center gap-3 flex-wrap">
                <span
                  className="px-2.5 py-1 rounded text-[10px] font-bold uppercase tracking-widest"
                  style={{
                    color: diff.color, background: diff.bg,
                    border: `1px solid ${diff.border}`,
                    fontFamily: "'JetBrains Mono', monospace",
                  }}
                >
                  {problem.difficulty}
                </span>
                {problem.stats?.acceptanceRate != null && (
                  <div
                    className="flex items-center gap-1.5 text-xs"
                    style={{ color: 'rgba(148,163,184,0.5)', fontFamily: "'JetBrains Mono', monospace" }}
                  >
                    <FiCheckCircle size={11} style={{ color: '#34d399' }} />
                    {problem.stats.acceptanceRate}% accepted
                  </div>
                )}
              </div>
            </div>

            {/* Description markdown */}
            <div
              className="prose prose-invert max-w-none text-sm leading-relaxed"
              style={{ color: 'rgba(200,210,230,0.75)', fontFamily: "'Inter', sans-serif" }}
            >
              <ReactMarkdown rehypePlugins={[rehypeHighlight]}>
                {problem.description}
              </ReactMarkdown>
            </div>

            {/* Examples */}
            {problem.examples?.length > 0 && (
              <div className="space-y-4">
                <SectionLabel label="Examples" />
                {problem.examples.slice(0,2).map((ex, i) => (
                  <div
                    key={i}
                    className="rounded-lg overflow-hidden"
                    style={{ border: '1px solid rgba(99,102,241,0.12)', background: 'rgba(99,102,241,0.02)' }}
                  >
                    <div
                      className="flex items-center justify-between px-4 py-2"
                      style={{ borderBottom: '1px solid rgba(99,102,241,0.08)', background: 'rgba(99,102,241,0.05)' }}
                    >
                      <span
                        className="text-[10px] font-bold uppercase tracking-widest"
                        style={{ color: '#818cf8', fontFamily: "'JetBrains Mono', monospace" }}
                      >
                        Example {i + 1}
                      </span>
                      <FiTerminal size={11} style={{ color: 'rgba(99,102,241,0.3)' }} />
                    </div>
                    <div className="p-4 space-y-3 font-mono text-xs">
                      <IOBlock label="Input"  value={ex.input}  />
                      <IOBlock label="Output" value={ex.output} accent />
                      {ex.explanation && (
                        <div>
                          <FieldLabel text="Explanation" />
                          <p
                            className="text-xs leading-relaxed pl-3"
                            style={{
                              color: 'rgba(148,163,184,0.65)',
                              borderLeft: '2px solid rgba(99,102,241,0.25)',
                              fontFamily: "'Inter', sans-serif",
                            }}
                          >
                            {ex.explanation}
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Constraints */}
            <div>
              <SectionLabel label="Constraints" />
              <ul className="space-y-2 mt-3">
                {(problem.constraints || ['Time limit: 2000ms', 'Memory limit: 256MB']).map((c, i) => (
                  <li key={i} className="flex items-center gap-2.5">
                    <span style={{ color: 'rgba(99,102,241,0.5)', fontSize: 10 }}>▸</span>
                    <code
                      className="text-xs px-2 py-0.5 rounded"
                      style={{
                        background: 'rgba(99,102,241,0.06)',
                        border: '1px solid rgba(99,102,241,0.12)',
                        color: '#a5b4fc',
                        fontFamily: "'JetBrains Mono', monospace",
                      }}
                    >
                      {c}
                    </code>
                  </li>
                ))}
              </ul>
            </div>

            {/* Tags */}
            {problem.tags?.length > 0 && (
              <div className="pt-4" style={{ borderTop: '1px solid rgba(255,255,255,0.04)' }}>
                <div className="flex flex-wrap gap-2">
                  {problem.tags.map((tag) => (
                    <span
                      key={tag}
                      className="flex items-center gap-1 px-2.5 py-1 rounded text-[10px] font-bold uppercase tracking-wider cursor-default"
                      style={{
                        background: 'rgba(99,102,241,0.06)',
                        border: '1px solid rgba(99,102,241,0.15)',
                        color: '#818cf8',
                        fontFamily: "'JetBrains Mono', monospace",
                      }}
                    >
                      <FiTag size={9} />
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* ───────────── STATS TAB ───────────── */}
        {tab === 'stats' && (
          <div className="p-6 space-y-4">
            <SectionLabel label="Problem Statistics" />
            <div className="grid grid-cols-2 gap-3 mt-4">
              {[
                { label: 'Acceptance Rate', value: `${problem.stats?.acceptanceRate ?? 'N/A'}%`, color: '#34d399' },
                { label: 'Submissions',     value: problem.stats?.totalSubmissions ?? '—',         color: '#818cf8' },
                { label: 'Accepted',        value: problem.stats?.accepted ?? '—',                 color: '#4ade80' },
                { label: 'Difficulty',      value: problem.difficulty,                              color: DIFF[problem.difficulty?.toLowerCase()]?.color ?? '#94a3b8' },
              ].map(({ label, value, color }) => (
                <div
                  key={label}
                  className="p-4 rounded-lg"
                  style={{ background: 'rgba(99,102,241,0.04)', border: '1px solid rgba(99,102,241,0.1)' }}
                >
                  <div
                    className="text-[9px] uppercase tracking-widest font-bold mb-2"
                    style={{ color: 'rgba(148,163,184,0.4)', fontFamily: "'JetBrains Mono', monospace" }}
                  >
                    {label}
                  </div>
                  <div
                    className="text-lg font-bold"
                    style={{ color, fontFamily: "'JetBrains Mono', monospace" }}
                  >
                    {value}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
        {/* ───────────── HISTORY TAB ───────────── */}
        {tab === 'submissions' && (
          <div className="p-6 space-y-4">
            <SectionLabel label="Submission History" />
            <div className="mt-4 space-y-3">
              {!submission ? (
                <div
                  className="p-8 text-center text-[10px] tracking-widest uppercase animate-pulse font-bold"
                  style={{ color: 'rgba(148,163,184,0.4)', fontFamily: "'JetBrains Mono', monospace" }}
                >
                  Loading History...
                </div>
              ) : (() => {
                // Bulletproof extraction: checks multiple layers of nesting
                let subs = [];
                if (Array.isArray(submission)) {
                  subs = submission;
                } else if (submission?.data && Array.isArray(submission.data)) {
                  subs = submission.data;
                } else if (submission?.data?.data && Array.isArray(submission.data.data)) {
                  subs = submission.data.data;
                }
                
                if (subs.length === 0) {
                  return (
                    <div
                      className="p-8 text-center text-[10px] tracking-widest uppercase font-bold"
                      style={{ color: 'rgba(148,163,184,0.4)', fontFamily: "'JetBrains Mono', monospace" }}
                    >
                      No past submissions found.
                    </div>
                  );
                }
                
                return subs.map((sub, i) => {
                  const isAccepted = sub.status === 'Accepted' || sub.status === 'Passed';
                  const isPending = sub.status === 'Pending';
                  
                  const statusColor = isAccepted ? '#34d399' : (isPending ? '#fbbf24' : '#f87171');
                  const statusBg = isAccepted ? 'rgba(16,185,129,0.08)' : (isPending ? 'rgba(245,158,11,0.08)' : 'rgba(239,68,68,0.08)');
                  const statusBorder = isAccepted ? 'rgba(16,185,129,0.2)' : (isPending ? 'rgba(245,158,11,0.2)' : 'rgba(239,68,68,0.2)');

                  return (
                    <div
                      key={sub._id || i}
                      className="p-4 rounded-lg flex flex-wrap gap-4 items-center justify-between transition-colors hover:bg-white/5"
                      style={{ background: 'rgba(99,102,241,0.02)', border: '1px solid rgba(99,102,241,0.08)' }}
                    >
                      {/* Left: Status & Details */}
                      <div className="space-y-2">
                        <div className="flex items-center gap-2.5">
                          <span
                            className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-widest"
                            style={{
                              color: statusColor,
                              background: statusBg,
                              border: `1px solid ${statusBorder}`,
                              fontFamily: "'JetBrains Mono', monospace"
                            }}
                          >
                            {sub.status || 'Unknown'}
                          </span>
                          <span
                            className="text-[11px] uppercase tracking-wider font-bold"
                            style={{ color: 'rgba(148,163,184,0.6)', fontFamily: "'JetBrains Mono', monospace" }}
                          >
                            Attempt #{sub.attemptNumber || subs.length - i}
                          </span>
                        </div>
                        <div
                          className="text-[10px]"
                          style={{ color: 'rgba(148,163,184,0.4)', fontFamily: "'JetBrains Mono', monospace" }}
                        >
                          {new Date(sub.createdAt).toLocaleString(undefined, { 
                            month: 'short', day: 'numeric', year: 'numeric', 
                            hour: '2-digit', minute: '2-digit' 
                          })}
                        </div>
                      </div>
                      
                      {/* Right: Stats */}
                      <div className="flex gap-5 text-right">
                        {sub.executionStats && (
                          <>
                            <div className="space-y-1">
                              <div className="text-[9px] uppercase tracking-widest font-bold" style={{ color: 'rgba(148,163,184,0.4)', fontFamily: "'JetBrains Mono', monospace" }}>Time</div>
                              <div className="text-xs font-bold" style={{ color: '#e2e8f0', fontFamily: "'JetBrains Mono', monospace" }}>{sub.executionStats.time || '—'}</div>
                            </div>
                            <div className="space-y-1">
                              <div className="text-[9px] uppercase tracking-widest font-bold" style={{ color: 'rgba(148,163,184,0.4)', fontFamily: "'JetBrains Mono', monospace" }}>Memory</div>
                              <div className="text-xs font-bold" style={{ color: '#e2e8f0', fontFamily: "'JetBrains Mono', monospace" }}>{sub.executionStats.memory || '—'}</div>
                            </div>
                          </>
                        )}
                        <div className="space-y-1">
                          <div className="text-[9px] uppercase tracking-widest font-bold" style={{ color: 'rgba(148,163,184,0.4)', fontFamily: "'JetBrains Mono', monospace" }}>Score</div>
                          <div className="text-xs font-bold" style={{ color: '#818cf8', fontFamily: "'JetBrains Mono', monospace" }}>{sub.score ?? '—'}</div>
                        </div>
                      </div>
                    </div>
                  );
                });
              })()}
            </div>
          </div>
        )}

        {/* ───────────── MENTOR TAB ───────────── */}
        {tab === 'mentor' && (
          <div className="h-full p-4">
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

// ── Sub-components ────────────────────────────────────────────────────────
const SectionLabel = ({ label }) => (
  <div
    className="text-[9px] uppercase tracking-[0.2em] font-bold"
    style={{ color: 'rgba(148,163,184,0.35)', fontFamily: "'JetBrains Mono', monospace" }}
  >
    {label}
  </div>
);

const FieldLabel = ({ text }) => (
  <div
    className="text-[9px] uppercase tracking-widest font-bold mb-1.5"
    style={{ color: 'rgba(148,163,184,0.4)', fontFamily: "'JetBrains Mono', monospace" }}
  >
    {text}
  </div>
);

const IOBlock = ({ label, value, accent }) => (
  <div>
    <div className="flex items-center justify-between mb-1.5">
      <FieldLabel text={label} />
      <CopyBtn text={value} />
    </div>
    <div
      className="p-2.5 rounded text-xs"
      style={{
        background: '#030408',
        border: `1px solid ${accent ? 'rgba(16,185,129,0.15)' : 'rgba(255,255,255,0.05)'}`,
        color: accent ? 'rgba(110,231,183,0.85)' : 'rgba(165,180,252,0.85)',
        fontFamily: "'JetBrains Mono', monospace",
        whiteSpace: 'pre-wrap',
        wordBreak: 'break-all',
      }}
    >
      {value}
    </div>
  </div>
);

export default ProblemDescription;