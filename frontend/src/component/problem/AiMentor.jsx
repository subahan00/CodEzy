import React, { useState, useRef, useEffect, useCallback } from 'react';
import axios from 'axios';
import ReactMarkdown from 'react-markdown';
import rehypeHighlight from 'rehype-highlight';
import {
  FiSend, FiCpu, FiCode, FiAlertCircle, FiTrendingUp,
  FiHelpCircle, FiUser, FiSliders, FiChevronDown, FiX
} from 'react-icons/fi';

// ── Persona presets ───────────────────────────────────────────────────────
const PERSONAS = [
  { label: 'Toxic Senior Dev',  value: 'an elite, dark-sarcastic, slightly toxic Senior Developer'         },
  { label: 'Robotic AI',        value: 'a precise, robotic system intelligence with no emotions'            },
  { label: 'Yoda',              value: 'Yoda from Star Wars'                                                },
  { label: 'Gordon Ramsay',     value: 'Gordon Ramsay who roasts bad code like raw food'                    },
  { label: 'Hype Bro',          value: 'a hyperactive caffeinated startup bro using too much crypto slang'  },
  { label: 'Batman',            value: 'Batman, dark, brooding, and serious at all times'                   },
];

// ── Quick actions ─────────────────────────────────────────────────────────
const ACTIONS = [
  { id: 'evaluate',   Icon: FiCode,        label: 'Review code',     color: '#93c5fd', prompt: "Review my code, evaluate the approach, and roast me mildly if it's bad. Don't give the full solution." },
  { id: 'debug',      Icon: FiAlertCircle, label: 'Debug errors',    color: '#fca5a5', prompt: "Analyze my execution results and explain exactly why the code is failing.", needsResult: true },
  { id: 'hint',       Icon: FiHelpCircle,  label: 'Give a hint',     color: '#fcd34d', prompt: "Give me one small, cryptic hint for the next step. DO NOT give the solution away." },
  { id: 'complexity', Icon: FiTrendingUp,  label: 'Complexity',      color: '#6ee7b7', prompt: "Calculate the exact Big-O Time and Space complexity of my current code and explain each part." },
];

// ── Message bubble ────────────────────────────────────────────────────────
const Bubble = ({ msg }) => {
  const isUser = msg.role === 'user';
  return (
    <div className={`flex flex-col gap-1 ${isUser ? 'items-end' : 'items-start'}`}>
      <div
        className="flex items-center gap-1.5 text-[9px] font-bold uppercase tracking-widest"
        style={{ color: isUser ? 'rgba(129,140,248,0.5)' : 'rgba(217,70,239,0.5)', fontFamily: "'JetBrains Mono', monospace" }}
      >
        {isUser
          ? <><FiUser size={9}/> You</>
          : <><FiCpu  size={9}/> Mentor</>
        }
      </div>
      <div
        className="max-w-[95%] p-3 rounded-lg text-xs leading-relaxed"
        style={{
          background: isUser ? 'rgba(99,102,241,0.1)' : 'rgba(217,70,239,0.06)',
          border: `1px solid ${isUser ? 'rgba(99,102,241,0.2)' : 'rgba(217,70,239,0.15)'}`,
          color: isUser ? '#c7d2fe' : '#f0d9ff',
          fontFamily: isUser ? "'JetBrains Mono', monospace" : "'Inter', sans-serif",
        }}
      >
        {isUser ? (
          <span>{msg.text.split('--- SYSTEM CONTEXT ---')[0].trim()}</span>
        ) : (
          <div className="prose prose-invert max-w-none text-xs [&_code]:text-purple-300 [&_pre]:bg-black/40 [&_pre]:p-2 [&_pre]:rounded [&_pre]:text-xs">
            <ReactMarkdown rehypePlugins={[rehypeHighlight]}>
              {msg.text}
            </ReactMarkdown>
          </div>
        )}
      </div>
    </div>
  );
};

// ── Typing indicator ──────────────────────────────────────────────────────
const Typing = () => (
  <div className="flex flex-col gap-1 items-start">
    <div
      className="flex items-center gap-1.5 text-[9px] font-bold uppercase tracking-widest"
      style={{ color: 'rgba(217,70,239,0.5)', fontFamily: "'JetBrains Mono', monospace" }}
    >
      <FiCpu size={9}/> Mentor
    </div>
    <div
      className="px-4 py-2.5 rounded-lg flex items-center gap-1"
      style={{ background: 'rgba(217,70,239,0.06)', border: '1px solid rgba(217,70,239,0.15)' }}
    >
      {[0, 150, 300].map(d => (
        <span
          key={d}
          className="w-1.5 h-1.5 rounded-full animate-bounce"
          style={{ background: 'rgba(217,70,239,0.6)', animationDelay: `${d}ms` }}
        />
      ))}
    </div>
  </div>
);

// ── Main component ────────────────────────────────────────────────────────
const AiMentorTab = ({ currentCode, language, problem, executionResult }) => {
  const [prompt,       setPrompt]       = useState('');
  const [persona,      setPersona]      = useState(PERSONAS[0].value);
  const [showPersona,  setShowPersona]  = useState(false);
  const [chat,         setChat]         = useState([
    { role: 'ai', text: "Neural link established. I'm watching your code. Select a protocol or ask me anything." }
  ]);
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef(null);
  const inputRef  = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chat, loading]);

  const buildContext = useCallback(() => {
    let ctx = `\n\n--- SYSTEM CONTEXT ---\nProblem: ${problem?.title}\nLanguage: ${language}\nCode:\n${currentCode || 'No code yet.'}`;
    if (executionResult) {
      ctx += `\nLast run status: ${executionResult.status}`;
      if (executionResult.error)          ctx += `\nError: ${executionResult.error}`;
      if (executionResult.expectedOutput) ctx += `\nExpected: ${executionResult.expectedOutput}\nActual: ${executionResult.output}`;
    }
    return ctx;
  }, [problem, language, currentCode, executionResult]);

  const send = useCallback(async (userText) => {
    if (!userText.trim() || loading) return;

    const history = chat.slice(1).map(m => ({
      role: m.role === 'ai' ? 'assistant' : 'user',
      content: m.text,
    }));

    setChat(prev => [...prev, { role: 'user', text: userText }]);
    setPrompt('');
    setLoading(true);

    try {
      const token = localStorage.getItem('token');
      const res = await axios.post('http://localhost:9999/api/ai/ask', {
        prompt: `${userText} ${buildContext()}`,
        code: currentCode,
        history,
        persona,
      }, { headers: { Authorization: `Bearer ${token}` } });

      setChat(prev => [...prev, { role: 'ai', text: res.data.answer }]);
    } catch {
      setChat(prev => [...prev, { role: 'ai', text: 'Connection lost. Please try again.' }]);
    } finally {
      setLoading(false);
    }
  }, [chat, loading, buildContext, currentCode, persona]);

  return (
    <div
      className="flex flex-col rounded-lg overflow-hidden"
      style={{
        height: '100%',
        background: '#06040f',
        border: '1px solid rgba(217,70,239,0.12)',
      }}
    >
      {/* ── Persona bar ── */}
      <div
        className="shrink-0 px-3 py-2 flex items-center justify-between"
        style={{ borderBottom: '1px solid rgba(217,70,239,0.1)', background: 'rgba(217,70,239,0.03)' }}
      >
        <div
          className="flex items-center gap-1.5 text-[9px] font-bold uppercase tracking-widest"
          style={{ color: 'rgba(217,70,239,0.5)', fontFamily: "'JetBrains Mono', monospace" }}
        >
          <FiSliders size={10} />
          Persona
        </div>
        <div className="relative">
          <button
            onClick={() => setShowPersona(v => !v)}
            className="flex items-center gap-1.5 px-2.5 py-1 rounded text-[10px] font-semibold transition-all"
            style={{
              background: 'rgba(217,70,239,0.08)',
              border: '1px solid rgba(217,70,239,0.2)',
              color: '#f0abfc',
              fontFamily: "'JetBrains Mono', monospace",
              maxWidth: 180,
            }}
          >
            <span className="truncate">{PERSONAS.find(p => p.value === persona)?.label ?? 'Custom'}</span>
            <FiChevronDown size={10} />
          </button>

          {showPersona && (
            <div
              className="absolute right-0 top-full mt-1 rounded-lg overflow-hidden z-50 w-52"
              style={{ background: '#100820', border: '1px solid rgba(217,70,239,0.2)', boxShadow: '0 8px 32px rgba(0,0,0,0.6)' }}
            >
              <div className="flex items-center justify-between px-3 py-2" style={{ borderBottom: '1px solid rgba(217,70,239,0.1)' }}>
                <span className="text-[9px] uppercase tracking-widest font-bold" style={{ color: 'rgba(217,70,239,0.5)', fontFamily: "'JetBrains Mono', monospace" }}>
                  Select Persona
                </span>
                <button onClick={() => setShowPersona(false)} style={{ color: 'rgba(217,70,239,0.4)' }}>
                  <FiX size={11} />
                </button>
              </div>
              {PERSONAS.map(p => (
                <button
                  key={p.value}
                  onClick={() => { setPersona(p.value); setShowPersona(false); }}
                  className="w-full text-left px-3 py-2 text-xs transition-colors hover:bg-fuchsia-900/20"
                  style={{
                    color: persona === p.value ? '#f0abfc' : 'rgba(200,180,220,0.6)',
                    fontFamily: "'JetBrains Mono', monospace",
                    background: persona === p.value ? 'rgba(217,70,239,0.08)' : 'transparent',
                  }}
                >
                  {p.label}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* ── Action cards ── */}
      <div
        className="shrink-0 p-2.5 grid grid-cols-2 gap-1.5"
        style={{ borderBottom: '1px solid rgba(217,70,239,0.08)' }}
      >
        {ACTIONS.map(({ id, Icon, label, color, prompt: p, needsResult }) => {
          const disabled = loading || (needsResult && !executionResult);
          return (
            <button
              key={id}
              onClick={() => send(p)}
              disabled={disabled}
              className="flex items-center gap-2 px-3 py-2 rounded transition-all text-left"
              style={{
                background: disabled ? 'rgba(255,255,255,0.02)' : 'rgba(217,70,239,0.05)',
                border: `1px solid ${disabled ? 'rgba(255,255,255,0.04)' : 'rgba(217,70,239,0.12)'}`,
                opacity: disabled ? 0.4 : 1,
                cursor: disabled ? 'not-allowed' : 'pointer',
              }}
              onMouseEnter={e => !disabled && (e.currentTarget.style.background = 'rgba(217,70,239,0.1)')}
              onMouseLeave={e => !disabled && (e.currentTarget.style.background = 'rgba(217,70,239,0.05)')}
            >
              <Icon size={12} style={{ color, flexShrink: 0 }} />
              <span
                className="text-[10px] font-bold uppercase tracking-wider"
                style={{ color: 'rgba(220,200,235,0.7)', fontFamily: "'JetBrains Mono', monospace" }}
              >
                {label}
              </span>
            </button>
          );
        })}
      </div>

      {/* ── Chat log ── */}
      <div
        className="flex-1 overflow-y-auto p-4 space-y-4"
        style={{ scrollbarWidth: 'thin', scrollbarColor: 'rgba(217,70,239,0.1) transparent' }}
      >
        {chat.map((msg, i) => <Bubble key={i} msg={msg} />)}
        {loading && <Typing />}
        <div ref={bottomRef} />
      </div>

      {/* ── Input ── */}
      <div
        className="shrink-0 p-3"
        style={{ borderTop: '1px solid rgba(217,70,239,0.1)', background: 'rgba(217,70,239,0.02)' }}
      >
        <div className="flex gap-2">
          <div className="flex-1 relative">
            <span
              className="absolute left-3 top-1/2 -translate-y-1/2 font-bold text-sm pointer-events-none"
              style={{ color: 'rgba(217,70,239,0.5)', fontFamily: "'JetBrains Mono', monospace" }}
            >
              &gt;
            </span>
            <input
              ref={inputRef}
              value={prompt}
              onChange={e => setPrompt(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && !e.shiftKey && (e.preventDefault(), send(prompt))}
              placeholder="Ask anything..."
              disabled={loading}
              className="w-full pl-8 pr-3 py-2.5 text-xs rounded outline-none transition-all"
              style={{
                background: '#03020a',
                border: '1px solid rgba(217,70,239,0.2)',
                color: '#f0d9ff',
                fontFamily: "'JetBrains Mono', monospace",
              }}
              onFocus={e => e.target.style.borderColor = 'rgba(217,70,239,0.45)'}
              onBlur={e => e.target.style.borderColor  = 'rgba(217,70,239,0.2)'}
            />
          </div>
          <button
            onClick={() => send(prompt)}
            disabled={loading || !prompt.trim()}
            className="px-3 rounded transition-all disabled:opacity-30"
            style={{
              background: 'rgba(217,70,239,0.12)',
              border: '1px solid rgba(217,70,239,0.3)',
              color: '#f0abfc',
            }}
          >
            <FiSend size={13} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default AiMentorTab;