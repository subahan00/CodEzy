import React, { useState, useRef, useEffect } from 'react';
import axios from 'axios';
import { FiSend, FiCpu, FiTerminal, FiCode, FiAlertCircle, FiTrendingUp, FiHelpCircle, FiRadio } from 'react-icons/fi';

// Ambient Grid to tie into the global platform aesthetic
const AmbientGrid = () => (
  <div 
    className="absolute inset-0 pointer-events-none opacity-[0.03] z-0"
    style={{
      backgroundImage: `
        linear-gradient(rgba(217, 70, 239, 0.8) 1px, transparent 1px),
        linear-gradient(90deg, rgba(217, 70, 239, 0.8) 1px, transparent 1px)
      `,
      backgroundSize: '24px 24px',
      backgroundPosition: 'center center'
    }}
  />
);

const AiMentorTab = ({ currentCode, language, problem, executionResult }) => {
  const [prompt, setPrompt] = useState("");
  const [persona, setPersona] = useState("an elite, dark-sarcastic, slightly toxic Senior Developer");

  const [chat, setChat] = useState([
    { role: 'ai', text: "Neural Link established. Monitoring logic streams. Select a diagnostic protocol or input a direct query." }
  ]);
  const [loading, setLoading] = useState(false);
  const chatEndRef = useRef(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chat]);

  // --- AUTO-CONTEXT GENERATOR ---
  const generateContext = () => {
    let context = `\n\n--- SYSTEM CONTEXT ---\nProblem: ${problem?.title}\nLanguage: ${language}\nCurrent Code:\n${currentCode || 'No code written yet.'}`;
    if (executionResult) {
      context += `\n\nLast Execution Status: ${executionResult.status}`;
      if (executionResult.error) context += `\nError Output: ${executionResult.error}`;
      if (executionResult.expectedOutput) context += `\nExpected: ${executionResult.expectedOutput}\nActual: ${executionResult.output}`;
    }
    return context;
  };

  // --- ACTION HANDLER ---
  const handleAction = async (actionType, customText = "") => {
    let userIntent = customText;

    if (actionType === 'hint') {
      userIntent = "Analyze my code and give me a small hint for the next step. DO NOT give the full solution.";
    } else if (actionType === 'debug') {
      userIntent = "My code is failing or has an error. Look at my execution results and explain why it's failing and where to look.";
    } else if (actionType === 'evaluate') {
      userIntent = "Review my current code. Evaluate my approach, point out bad practices, and roast me mildly.";
    } else if (actionType === 'complexity') {
      userIntent = "Calculate the exact Time (Big O) and Space complexity of my current code and explain why.";
    }

    if (!userIntent.trim()) return;

    const history = chat.slice(1).map(msg => ({
      role: msg.role === 'ai' ? 'assistant' : 'user',
      content: msg.text
    }));
    
    setChat(prev => [...prev, { role: 'user', text: userIntent }]);
    setPrompt("");
    setLoading(true);

    try {
      const token = localStorage.getItem("token");
      const fullPrompt = `${userIntent} ${generateContext()}`;
      
      const res = await axios.post("http://localhost:9999/api/ai/ask", {
        prompt: fullPrompt,
        code: currentCode,
        history,
        persona 
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });

      setChat(prev => [...prev, { role: 'ai', text: res.data.answer }]);
    } catch (err) {
      console.error(err);
      setChat(prev => [...prev, { role: 'ai', text: "Exception: Neural Core connection severed. Please try again." }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div 
      className="flex flex-col h-full relative overflow-hidden text-gray-300 rounded-lg"
      style={{
        background: 'linear-gradient(110deg, #0d0f1a 0%, #170d1f 50%, #0d0f1a 100%)',
        border: '1px solid rgba(217, 70, 239, 0.15)'
      }}
    >
      <AmbientGrid />

      {/* --- HEADER WITH PERSONA SELECTOR --- */}
      <div 
        className="relative z-10 p-3 flex justify-between items-center border-b"
        style={{
          borderColor: 'rgba(217, 70, 239, 0.2)',
          background: 'rgba(13, 15, 26, 0.8)',
          backdropFilter: 'blur(8px)'
        }}
      >
        <div className="flex items-center gap-2">
           <FiRadio className="text-fuchsia-500 animate-pulse" size={14} />
           <span 
             className="text-[10px] font-bold uppercase tracking-widest text-fuchsia-400"
             style={{ fontFamily: "'JetBrains Mono', monospace" }}
           >
             System Persona
           </span>
        </div>
        
        <input 
          type="text"
          list="persona-suggestions"
          value={persona} 
          onChange={(e) => setPersona(e.target.value)}
          placeholder="Override core personality..."
          className="bg-[#05050a] text-[11px] font-mono text-fuchsia-300 border border-fuchsia-500/30 rounded px-2 py-1.5 outline-none w-64 truncate focus:border-fuchsia-400 focus:bg-fuchsia-900/10 transition-all shadow-[inset_0_0_10px_rgba(0,0,0,0.5)]"
        />
        <datalist id="persona-suggestions">
          <option value="an elite, dark-sarcastic, slightly toxic Senior Developer" />
          <option value="a precise, robotic system intelligence with no emotions" />
          <option value="Yoda from Star Wars" />
          <option value="Batman, speaking in a dark, brooding, and serious tone" />
          <option value="a hyperactive, caffeinated startup bro who uses too much crypto slang" />
          <option value="Gordon Ramsay, screaming about how raw and disgusting the code is" />
        </datalist>
      </div>

      {/* --- QUICK ACTION CARDS --- */}
      <div 
        className="relative z-10 p-3 grid grid-cols-2 gap-2 border-b"
        style={{
          borderColor: 'rgba(217, 70, 239, 0.15)',
          background: 'rgba(13, 15, 26, 0.6)'
        }}
      >
        {[
          { id: 'evaluate', icon: FiCode, label: 'Evaluate Logic', color: 'text-blue-400' },
          { id: 'debug', icon: FiAlertCircle, label: 'Debug Trace', color: 'text-rose-400', disabled: !executionResult },
          { id: 'hint', icon: FiHelpCircle, label: 'Request Intel', color: 'text-amber-400' },
          { id: 'complexity', icon: FiTrendingUp, label: 'Complexity Scan', color: 'text-emerald-400' }
        ].map((action) => (
          <button
            key={action.id}
            onClick={() => handleAction(action.id)}
            disabled={action.disabled || loading}
            className={`flex items-center gap-2.5 p-2.5 rounded border transition-all group ${
              action.disabled || loading
                ? 'opacity-30 cursor-not-allowed bg-black/20 border-white/5'
                : 'bg-fuchsia-900/10 border-fuchsia-500/20 hover:bg-fuchsia-900/30 hover:border-fuchsia-400/50 hover:shadow-[0_0_10px_rgba(217,70,239,0.1)]'
            }`}
          >
            <action.icon className={`${action.color} shrink-0`} size={14} />
            <span 
              className="text-[10px] font-bold uppercase tracking-wider text-gray-300 group-hover:text-white"
              style={{ fontFamily: "'JetBrains Mono', monospace" }}
            >
              {action.label}
            </span>
          </button>
        ))}
      </div>

      {/* --- TELEMETRY LOG (CHAT HISTORY) --- */}
      <div className="flex-1 relative z-10 overflow-y-auto p-4 space-y-4 scrollbar-thin scrollbar-thumb-fuchsia-900/50 scrollbar-track-transparent">
        {chat.map((msg, idx) => (
          <div key={idx} className="flex flex-col gap-1">
            <div 
              className={`flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-widest ${
                msg.role === 'user' ? 'justify-end text-indigo-400' : 'justify-start text-fuchsia-400'
              }`}
              style={{ fontFamily: "'JetBrains Mono', monospace" }}
            >
              {msg.role === 'user' ? (
                 <><FiTerminal size={10} /> <span>Client_TX</span></>
              ) : (
                 <><FiCpu size={10} /> <span>Neural_RX</span></>
              )}
            </div>

            <div className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div 
                className={`p-3 text-[13px] font-mono leading-relaxed max-w-[90%] whitespace-pre-wrap border ${
                  msg.role === 'user'
                    ? 'bg-indigo-900/20 border-indigo-500/30 text-indigo-100 rounded-l-lg rounded-br-lg shadow-[inset_2px_0_10px_rgba(99,102,241,0.05)]'
                    : 'bg-[#05050a] border-fuchsia-500/30 text-fuchsia-100/90 rounded-r-lg rounded-bl-lg shadow-[inset_-2px_0_10px_rgba(217,70,239,0.05)]'
                }`}
              >
                {msg.role === 'user' ? msg.text.split('--- SYSTEM CONTEXT ---')[0].trim() : msg.text}
              </div>
            </div>
          </div>
        ))}
        
        {loading && (
          <div className="flex flex-col gap-1 justify-start">
            <div className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-widest text-fuchsia-400 font-mono">
               <FiCpu size={10} className="animate-spin-slow" /> <span>Neural_RX</span>
            </div>
            <div className="bg-[#05050a] border border-fuchsia-500/30 text-fuchsia-400 p-3 rounded-r-lg rounded-bl-lg max-w-[200px] flex items-center gap-2">
              <span className="text-[11px] font-mono uppercase tracking-widest">Processing</span>
              <span className="flex gap-1">
                <span className="w-1 h-3 bg-fuchsia-500/50 animate-pulse"></span>
                <span className="w-1 h-3 bg-fuchsia-500/50 animate-pulse delay-75"></span>
                <span className="w-1 h-3 bg-fuchsia-500/50 animate-pulse delay-150"></span>
              </span>
            </div>
          </div>
        )}
        <div ref={chatEndRef} />
      </div>

      {/* --- MANUAL INPUT COMMAND LINE --- */}
      <div 
        className="relative z-10 p-3 border-t"
        style={{
          borderColor: 'rgba(217, 70, 239, 0.2)',
          background: 'rgba(13, 15, 26, 0.8)',
          backdropFilter: 'blur(8px)'
        }}
      >
        <form onSubmit={(e) => { e.preventDefault(); handleAction('custom', prompt); }} className="flex gap-2">
          <div className="relative flex-1">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-fuchsia-500 font-mono text-sm font-bold">
              {'>'}
            </span>
            <input
              type="text"
              className="w-full bg-[#05050a] border border-fuchsia-500/30 rounded text-xs text-fuchsia-100 focus:outline-none focus:border-fuchsia-400 transition-colors pl-7 pr-3 py-2.5 font-mono shadow-[inset_0_0_10px_rgba(0,0,0,0.5)]"
              placeholder="Execute manual query..."
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              disabled={loading}
            />
          </div>
          <button
            type="submit"
            disabled={loading || !prompt.trim()}
            className="px-4 rounded transition-all disabled:opacity-50 flex items-center justify-center border group disabled:cursor-not-allowed"
            style={{
              background: 'rgba(217, 70, 239, 0.15)',
              borderColor: 'rgba(217, 70, 239, 0.4)',
              color: '#f0abfc'
            }}
          >
            <FiSend size={14} className="group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
          </button>
        </form>
      </div>

    </div>
  );
};

export default AiMentorTab;