import React, { useState, useRef, useEffect } from "react";
import axios from "axios";
import { FiMessageSquare, FiAlertCircle, FiCheckCircle, FiZap, FiTarget } from "react-icons/fi";

function AiMentor({ 
  // In a real app, pass these down as props from your DuelRoom or Workspace component
  currentCode = "// Write your code here...", 
  problemStatement = "Solve the given algorithmic challenge." 
}) {
  const [prompt, setPrompt] = useState("");
  const [messages, setMessages] = useState([
    { sender: "ai", text: "I'm Gordon, your Senior Dev. Stuck? Need an approach validated? Let's hear it." }
  ]);
  const [mode, setMode] = useState("normal_chat");
  const [hintLevel, setHintLevel] = useState(1);
  const [loading, setLoading] = useState(false);
  const chatEndRef = useRef(null);

  // Auto-scroll to bottom of chat
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleAsk = async (overridePrompt = null, overrideMode = null) => {
    const finalPrompt = overridePrompt || prompt;
    const finalMode = overrideMode || mode;

    if (!finalPrompt.trim()) return;

    // Add user message to UI
    const newMessages = [...messages, { sender: "user", text: finalPrompt }];
    setMessages(newMessages);
    setPrompt(""); // Clear input
    setLoading(true);

    try {
      const token = localStorage.getItem("token");
      
      // Format history for the backend (excluding the very first greeting if needed, but fine to send)
      const historyPayload = newMessages.slice(0, -1).map(m => ({
        role: m.sender === "user" ? "user" : "assistant",
        content: m.text
      }));

      const res = await axios.post(`${import.meta.env.VITE_BACKEND_URL}/api/ai/ask`, {
        prompt: finalPrompt,
        code: currentCode,
        problemStatement: problemStatement,
        mode: finalMode,
        history: historyPayload
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });

      // Add AI response to UI
      setMessages(prev => [...prev, { sender: "ai", text: res.data.answer }]);

    } catch (err) {
      console.error(err);
      setMessages(prev => [...prev, { sender: "ai", text: "Error: Neural link severed. Try again." }]);
    } finally {
      setLoading(false);
    }
  };

  // Quick Action: Progressive Hint System
  const triggerHint = () => {
    handleAsk(`Give me hint level ${hintLevel} for this problem.`, "hint");
    setHintLevel(prev => prev < 3 ? prev + 1 : 3); // Max 3 hints
  };

  // Quick Action: Edge Case Challenger
  const triggerEdgeCases = () => {
    handleAsk("What edge cases am I missing in my current code?", "edge_case");
  };

  return (
    <div className="flex flex-col h-[600px] w-full max-w-md bg-[#0a0a0a] border border-gray-800 rounded-2xl shadow-2xl overflow-hidden font-sans">
      
      {/* Header & Mode Selector */}
      <div className="bg-[#161616] border-b border-gray-800 p-4">
        <h2 className="text-white font-bold text-lg mb-3 flex items-center gap-2">
          <FiZap className="text-blue-500" /> AI Mentor
        </h2>
        <div className="flex flex-wrap gap-2">
          <button onClick={() => setMode("normal_chat")} className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all flex items-center gap-1 ${mode === "normal_chat" ? "bg-blue-600/20 text-blue-400 border border-blue-500/50" : "bg-[#1e1e1e] text-gray-400 border border-transparent hover:text-gray-200"}`}>
            <FiMessageSquare /> Chat
          </button>
          <button onClick={() => setMode("pre_eval")} className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all flex items-center gap-1 ${mode === "pre_eval" ? "bg-purple-600/20 text-purple-400 border border-purple-500/50" : "bg-[#1e1e1e] text-gray-400 border border-transparent hover:text-gray-200"}`}>
            <FiCheckCircle /> Evaluate Approach
          </button>
          <button onClick={() => setMode("error_explanation")} className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all flex items-center gap-1 ${mode === "error_explanation" ? "bg-red-600/20 text-red-400 border border-red-500/50" : "bg-[#1e1e1e] text-gray-400 border border-transparent hover:text-gray-200"}`}>
            <FiAlertCircle /> Fix Error
          </button>
        </div>
      </div>

      {/* Chat History Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-[#0a0a0a]">
        {messages.map((msg, idx) => (
          <div key={idx} className={`flex ${msg.sender === "user" ? "justify-end" : "justify-start"}`}>
            <div className={`max-w-[85%] rounded-2xl px-4 py-3 text-sm whitespace-pre-wrap leading-relaxed shadow-lg ${
              msg.sender === "user" 
                ? "bg-blue-600 text-white rounded-br-none" 
                : "bg-[#1e1e1e] text-gray-300 border border-gray-800 rounded-bl-none"
            }`}>
              {msg.text}
            </div>
          </div>
        ))}
        {loading && (
          <div className="flex justify-start">
             <div className="bg-[#1e1e1e] border border-gray-800 rounded-2xl rounded-bl-none px-4 py-3 text-sm text-gray-500 flex items-center gap-2">
               <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce"></div>
               <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
               <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
             </div>
          </div>
        )}
        <div ref={chatEndRef} />
      </div>

      {/* Quick Actions */}
      <div className="px-4 pt-2 pb-1 flex gap-2 overflow-x-auto bg-[#0a0a0a] border-t border-gray-800/50">
        <button onClick={triggerHint} disabled={loading || hintLevel > 3} className="shrink-0 px-3 py-1 bg-yellow-500/10 text-yellow-500 hover:bg-yellow-500/20 border border-yellow-500/30 rounded-full text-xs font-bold transition disabled:opacity-50">
          💡 Get Hint ({hintLevel}/3)
        </button>
        <button onClick={triggerEdgeCases} disabled={loading} className="shrink-0 px-3 py-1 bg-teal-500/10 text-teal-500 hover:bg-teal-500/20 border border-teal-500/30 rounded-full text-xs font-bold transition flex items-center gap-1 disabled:opacity-50">
          <FiTarget /> Test Edge Cases
        </button>
      </div>

      {/* Input Area */}
      <div className="p-4 bg-[#0a0a0a]">
        <div className="relative">
          <textarea
            className="w-full bg-[#1e1e1e] border border-gray-700 rounded-xl pl-4 pr-12 py-3 text-sm text-gray-200 focus:outline-none focus:border-blue-500 resize-none shadow-inner"
            rows={2}
            placeholder={mode === "error_explanation" ? "Paste your error message here..." : "Ask your question..."}
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleAsk();
              }
            }}
          />
          <button
            onClick={() => handleAsk()}
            disabled={loading || !prompt.trim()}
            className="absolute right-2 bottom-2 p-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg disabled:opacity-50 transition"
          >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 12L3.269 3.126A59.768 59.768 0 0121.485 12 59.77 59.77 0 013.27 20.876L5.999 12zm0 0h7.5" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
}

export default AiMentor;