import React, { useState, useRef, useEffect } from 'react';
import axios from 'axios';
import { FiSend, FiCpu, FiUser, FiCode, FiAlertCircle, FiTrendingUp, FiHelpCircle } from 'react-icons/fi';

const AiMentorTab = ({ currentCode, language, problem, executionResult }) => {
  const [prompt, setPrompt] = useState("");
  
  // State for the selected persona (can now be whatever the user types)
  const [persona, setPersona] = useState("an elite, dark-sarcastic, slightly toxic Senior Developer");

  const [chat, setChat] = useState([
    { role: 'ai', text: "I'm monitoring your code. Choose an action below or ask me a specific question!" }
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
      console.log('persona:', persona);
      const res = await axios.post("http://localhost:9999/api/ai/ask", {
        prompt: fullPrompt,
        code: currentCode,
        history,
        persona // <--- WHATEVER THE USER TYPED IS SENT HERE
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });

      setChat(prev => [...prev, { role: 'ai', text: res.data.answer }]);
    } catch (err) {
      console.error(err);
      setChat(prev => [...prev, { role: 'ai', text: "Error: AI Mentor is disconnected." }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-full bg-[#1e1e1e] rounded-lg border border-gray-700 overflow-hidden">

      {/* --- HEADER WITH PERSONA SELECTOR --- */}
      <div className="p-3 bg-[#252526] border-b border-gray-700 flex justify-between items-center">
        <span className="text-sm font-bold text-gray-300">Talk to:</span>
        
        {/* REPLACED SELECT WITH INPUT + DATALIST */}
        <input 
          type="text"
          list="persona-suggestions"
          value={persona} 
          onChange={(e) => setPersona(e.target.value)}
          placeholder="Type a persona..."
          className="bg-[#161616] text-sm text-purple-400 border border-gray-700 rounded-md px-2 py-1 outline-none w-64 truncate focus:border-purple-500 transition"
        />
        <datalist id="persona-suggestions">
          <option value="an elite, dark-sarcastic, slightly toxic Senior Developer" />
          <option value="a kind, patient, and overly encouraging kindergarten teacher" />
          <option value="Yoda from Star Wars" />
          <option value="Batman, speaking in a dark, brooding, and serious tone" />
          <option value="a hyperactive, caffeinated startup bro who uses too much crypto slang" />
          <option value="Gordon Ramsay, screaming about how raw and disgusting the code is" />
        </datalist>
      </div>

      {/* --- QUICK ACTION CARDS --- */}
      <div className="p-4 bg-[#252526] border-b border-gray-700 grid grid-cols-2 gap-2">
        <button
          onClick={() => handleAction('evaluate')}
          className="flex flex-col items-center justify-center p-3 bg-gray-800 hover:bg-gray-700 rounded-lg border border-gray-700 transition text-gray-300 hover:text-blue-400 group"
        >
          <FiCode className="text-xl mb-1 group-hover:scale-110 transition" />
          <span className="text-xs font-bold">Evaluate Code</span>
        </button>

        <button
          onClick={() => handleAction('debug')}
          disabled={!executionResult}
          className="flex flex-col items-center justify-center p-3 bg-gray-800 hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg border border-gray-700 transition text-gray-300 hover:text-red-400 group"
        >
          <FiAlertCircle className="text-xl mb-1 group-hover:scale-110 transition" />
          <span className="text-xs font-bold">Debug Error</span>
        </button>

        <button
          onClick={() => handleAction('hint')}
          className="flex flex-col items-center justify-center p-3 bg-gray-800 hover:bg-gray-700 rounded-lg border border-gray-700 transition text-gray-300 hover:text-yellow-400 group"
        >
          <FiHelpCircle className="text-xl mb-1 group-hover:scale-110 transition" />
          <span className="text-xs font-bold">Give a Hint</span>
        </button>

        <button
          onClick={() => handleAction('complexity')}
          className="flex flex-col items-center justify-center p-3 bg-gray-800 hover:bg-gray-700 rounded-lg border border-gray-700 transition text-gray-300 hover:text-emerald-400 group"
        >
          <FiTrendingUp className="text-xl mb-1 group-hover:scale-110 transition" />
          <span className="text-xs font-bold">Complexity</span>
        </button>
      </div>

      {/* --- CHAT HISTORY --- */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 scrollbar-thin scrollbar-thumb-gray-600">
        {chat.map((msg, idx) => (
          <div key={idx} className={`flex gap-3 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}>
            <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${msg.role === 'user' ? 'bg-blue-600 text-white' : 'bg-purple-900/50 text-purple-400 border border-purple-700'
              }`}>
              {msg.role === 'user' ? <FiUser size={14} /> : <FiCpu size={14} />}
            </div>

            <div className={`p-3 rounded-xl text-sm max-w-[85%] whitespace-pre-wrap ${msg.role === 'user'
                ? 'bg-blue-600 text-white rounded-tr-none'
                : 'bg-[#2d2d2d] text-gray-200 border border-gray-700 rounded-tl-none font-mono leading-relaxed'
              }`}>
              {msg.role === 'user' ? msg.text.split('--- SYSTEM CONTEXT ---')[0].trim() : msg.text}
            </div>
          </div>
        ))}
        {loading && (
          <div className="flex gap-3">
            <div className="w-8 h-8 rounded-full bg-purple-900/50 text-purple-400 border border-purple-700 flex items-center justify-center shrink-0">
              <FiCpu size={14} />
            </div>
            <div className="p-3 bg-[#2d2d2d] rounded-xl rounded-tl-none border border-gray-700 flex items-center gap-1">
              <span className="w-2 h-2 bg-gray-500 rounded-full animate-bounce"></span>
              <span className="w-2 h-2 bg-gray-500 rounded-full animate-bounce delay-100"></span>
              <span className="w-2 h-2 bg-gray-500 rounded-full animate-bounce delay-200"></span>
            </div>
          </div>
        )}
        <div ref={chatEndRef} />
      </div>

      {/* --- MANUAL INPUT BOX --- */}
      <div className="p-3 bg-[#252526] border-t border-gray-700">
        <form onSubmit={(e) => { e.preventDefault(); handleAction('custom', prompt); }} className="flex gap-2">
          <input
            type="text"
            className="flex-1 bg-[#1e1e1e] border border-gray-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-purple-500 transition"
            placeholder="Ask a specific question..."
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            disabled={loading}
          />
          <button
            type="submit"
            disabled={loading || !prompt.trim()}
            className="bg-purple-600 hover:bg-purple-500 text-white px-4 py-2 rounded-lg transition disabled:opacity-50 flex items-center justify-center"
          >
            <FiSend />
          </button>
        </form>
      </div>

    </div>
  );
};

export default AiMentorTab;