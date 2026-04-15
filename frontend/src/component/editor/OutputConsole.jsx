import React, { useState } from 'react';
import {
  FiTerminal, FiCpu, FiAlertTriangle, FiCheckCircle, FiXCircle,
  FiChevronDown, FiChevronRight, FiClock, FiZap
} from 'react-icons/fi';

// ── Individual test case ─────────────────────────────────────────────────
const TestCaseItem = ({ test, index }) => {
  const isPass = test.status === 'ACCEPTED' || test.passed === true;
  const [open, setOpen] = useState(!isPass);
  console.log('test',test);
  return (
    <div
      className="rounded-lg overflow-hidden transition-all duration-150"
      style={{
        background: isPass ? 'rgba(16,185,129,0.03)' : 'rgba(239,68,68,0.04)',
        border: `1px solid ${isPass ? 'rgba(16,185,129,0.15)' : 'rgba(239,68,68,0.2)'}`,
      }}
    >
      {/* Header */}
      <button
        onClick={() => setOpen(o => !o)}
        className="w-full px-4 py-2.5 flex items-center justify-between hover:bg-white/[0.03] transition-colors"
      >
        <div className="flex items-center gap-2.5">
          {isPass
            ? <FiCheckCircle size={13} style={{ color: '#34d399' }} />
            : <FiXCircle    size={13} style={{ color: '#f87171' }} />
          }
          <span
            className="text-xs font-bold uppercase tracking-wider"
            style={{ color: '#94a3b8', fontFamily: "'JetBrains Mono', monospace" }}
          >
            Case {index + 1}
          </span>
        </div>
        <div className="flex items-center gap-3">
          {test.time && (
            <span
              className="flex items-center gap-1 text-[10px]"
              style={{ color: 'rgba(99,102,241,0.5)', fontFamily: "'JetBrains Mono', monospace" }}
            >
              <FiClock size={9} />
              {test.time}ms
            </span>
          )}
          <span
            className="text-[10px] font-bold uppercase tracking-widest"
            style={{ color: isPass ? '#34d399' : '#f87171', fontFamily: "'JetBrains Mono', monospace" }}
          >
            {isPass ? 'Pass' : 'Fail'}
          </span>
          {open
            ? <FiChevronDown  size={12} style={{ color: 'rgba(148,163,184,0.4)' }} />
            : <FiChevronRight size={12} style={{ color: 'rgba(148,163,184,0.4)' }} />
          }
        </div>
      </button>

      {/* Body */}
      {open && (
        <div
          className="px-4 pb-4 space-y-3"
          style={{ borderTop: '1px solid rgba(255,255,255,0.04)' }}
        >
          <DataBlock label="Input" value={test.input} color="rgba(165,180,252,0.85)" borderColor="rgba(99,102,241,0.2)" />
          <div className="grid grid-cols-2 gap-3">
            <DataBlock
              label="Your output"
              value={test.output}
              color={isPass ? 'rgba(163,230,180,0.85)' : 'rgba(252,165,165,0.85)'}
              borderColor={isPass ? 'rgba(16,185,129,0.2)' : 'rgba(239,68,68,0.25)'}
            />
            <DataBlock
              label="Expected"
              value={test.expectedOutput}
              color="rgba(110,231,183,0.85)"
              borderColor="rgba(16,185,129,0.15)"
            />
          </div>
          {test.error && (
            <div
              className="flex items-start gap-2 p-3 rounded text-xs"
              style={{
                background: 'rgba(239,68,68,0.07)',
                border: '1px solid rgba(239,68,68,0.2)',
                color: '#fca5a5',
                fontFamily: "'JetBrains Mono', monospace",
              }}
            >
              <FiAlertTriangle size={13} className="shrink-0 mt-0.5" style={{ color: '#f87171' }} />
              <span className="whitespace-pre-wrap">{test.error}</span>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

const DataBlock = ({ label, value, color, borderColor }) => (
  <div>
    <div
      className="text-[9px] uppercase tracking-widest font-bold mb-1.5"
      style={{ color: 'rgba(148,163,184,0.5)', fontFamily: "'JetBrains Mono', monospace" }}
    >
      {label}
    </div>
    <div
      className="rounded p-2.5 text-xs whitespace-pre-wrap"
      style={{
        background: '#030409',
        border: `1px solid ${borderColor}`,
        color,
        fontFamily: "'JetBrains Mono', monospace",
        lineHeight: 1.6,
        minHeight: 36,
      }}
    >
      {value ?? <span style={{ opacity: 0.3 }}>—</span>}
    </div>
  </div>
);

// ── Main component ────────────────────────────────────────────────────────
const OutputConsole = ({ status, result, error }) => {
  const isIdle    = status === 'idle' || (!result && !error && status !== 'running' && status !== 'pending');
  const isLoading = status === 'running' || status === 'pending';
  const isError   = status === 'error' || !!error;

  if (isIdle) {
    return (
      <div
        className="h-full flex items-center justify-center"
        style={{ background: '#06080f' }}
      >
        <div
          className="flex items-center gap-2 text-xs"
          style={{ color: 'rgba(99,102,241,0.3)', fontFamily: "'JetBrains Mono', monospace" }}
        >
          <FiTerminal size={13} />
          <span>Run your code to see output</span>
          <span className="animate-pulse" style={{ color: 'rgba(99,102,241,0.5)' }}>_</span>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div
        className="h-full flex flex-col items-center justify-center gap-3"
        style={{ background: '#06080f' }}
      >
        <FiCpu
          size={20}
          className="animate-pulse"
          style={{ color: 'rgba(99,102,241,0.5)' }}
        />
        <span
          className="text-[10px] uppercase tracking-[0.25em] animate-pulse"
          style={{ color: 'rgba(99,102,241,0.4)', fontFamily: "'JetBrains Mono', monospace" }}
        >
          Evaluating...
        </span>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="h-full overflow-auto p-4" style={{ background: '#06080f' }}>
        <div
          className="flex items-start gap-3 p-4 rounded-lg"
          style={{ background: 'rgba(239,68,68,0.05)', border: '1px solid rgba(239,68,68,0.2)' }}
        >
          <FiAlertTriangle size={16} style={{ color: '#f87171', flexShrink: 0, marginTop: 2 }} />
          <div>
            <div
              className="text-[10px] uppercase tracking-widest font-bold mb-2"
              style={{ color: '#f87171', fontFamily: "'JetBrains Mono', monospace" }}
            >
              Runtime Error
            </div>
            <div
              className="text-xs whitespace-pre-wrap"
              style={{ color: 'rgba(252,165,165,0.8)', fontFamily: "'JetBrains Mono', monospace", lineHeight: 1.7 }}
            >
              {error?.message || error || 'Unknown error'}
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!result) return null;

  const verdict    = result.status || 'unknown';
  const accepted   = verdict.toLowerCase() === 'accepted';
  const stats      = result.executionStats || { passed: 0, total: 0 };
  const passRatio  = stats.total > 0 ? (stats.passed / stats.total) : 0;

  return (
    <div
      className="h-full overflow-y-auto"
      style={{ background: '#06080f', scrollbarWidth: 'thin', scrollbarColor: 'rgba(99,102,241,0.15) transparent' }}
    >
      <div className="p-4 space-y-4">

        {/* ── Verdict Banner ─── */}
        <div
          className="p-4 rounded-lg flex items-center justify-between"
          style={{
            background: accepted ? 'rgba(16,185,129,0.04)' : 'rgba(239,68,68,0.05)',
            border: `1px solid ${accepted ? 'rgba(16,185,129,0.15)' : 'rgba(239,68,68,0.2)'}`,
          }}
        >
          <div>
            <div
              className="text-[9px] uppercase tracking-widest font-bold mb-1"
              style={{ color: 'rgba(148,163,184,0.4)', fontFamily: "'JetBrains Mono', monospace" }}
            >
              Verdict
            </div>
            <div
              className="text-base font-bold uppercase tracking-wider"
              style={{
                color: accepted ? '#34d399' : '#f87171',
                fontFamily: "'JetBrains Mono', monospace",
              }}
            >
              {verdict.replace(/-/g, ' ')}
            </div>
          </div>

          {/* Test case progress */}
          <div className="text-right">
            <div
              className="text-[9px] uppercase tracking-widest font-bold mb-1.5"
              style={{ color: 'rgba(148,163,184,0.4)', fontFamily: "'JetBrains Mono', monospace" }}
            >
              Tests
            </div>
            <div className="flex items-center gap-2">
              <div className="w-24 h-1.5 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.06)' }}>
                <div
                  className="h-full rounded-full transition-all duration-500"
                  style={{
                    width: `${passRatio * 100}%`,
                    background: accepted ? '#34d399' : '#f87171',
                  }}
                />
              </div>
              <span
                className="text-xs font-bold"
                style={{ color: accepted ? '#34d399' : '#f87171', fontFamily: "'JetBrains Mono', monospace" }}
              >
                {stats.passed}
                <span style={{ color: 'rgba(148,163,184,0.3)' }}>/{stats.total}</span>
              </span>
            </div>
          </div>

          {/* Runtime stats */}
          {result.runtime && (
            <div className="text-right">
              <div
                className="text-[9px] uppercase tracking-widest font-bold mb-1"
                style={{ color: 'rgba(148,163,184,0.4)', fontFamily: "'JetBrains Mono', monospace" }}
              >
                Runtime
              </div>
              <div
                className="flex items-center gap-1 text-xs font-bold"
                style={{ color: '#fbbf24', fontFamily: "'JetBrains Mono', monospace" }}
              >
                <FiZap size={11} />
                {result.runtime}ms
              </div>
            </div>
          )}
        </div>

        {/* ── Test Case List ─── */}
        {Array.isArray(result.testResults) && result.testResults.length > 0 && (
          <div className="space-y-2">
            <div
              className="text-[9px] uppercase tracking-widest font-bold mb-3"
              style={{ color: 'rgba(148,163,184,0.35)', fontFamily: "'JetBrains Mono', monospace" }}
            >
              Test Cases
            </div>
            {result.testResults.map((test, i) => (
              <TestCaseItem key={i} test={test} index={i} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default OutputConsole;