import React, { useState, useEffect, useRef } from 'react';
import io from 'socket.io-client';
import { FiSend, FiGlobe, FiMessageSquare } from 'react-icons/fi';

// Connect to backend outside the component to prevent multiple connections on re-render
const socket = io.connect("http://localhost:9999");

const WorldChatWidget = () => {
  const [currentMessage, setCurrentMessage] = useState("");
  const [messageList, setMessageList] = useState([]);
  const chatEndRef = useRef(null);
  
  const user = JSON.parse(localStorage.getItem('user')) || { username: 'Guest' };

  const sendMessage = async (e) => {
    e.preventDefault();
    if (currentMessage.trim() !== "") {
      const messageData = {
        author: user.username,
        message: currentMessage,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      await socket.emit("send_message", messageData);
      setCurrentMessage("");
    }
  };

  useEffect(() => {
    const handleReceive = (data) => setMessageList((list) => [...list, data]);
    socket.on("receive_message", handleReceive);
    return () => socket.off("receive_message", handleReceive);
  }, []);

  // Auto-scroll to bottom when a new message arrives
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messageList]);

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm flex flex-col h-[500px] overflow-hidden">
      
      {/* Header */}
      <div className="bg-white p-4 border-b border-slate-100 flex justify-between items-center z-10 shadow-sm">
        <div className="flex items-center gap-2.5">
          <div className="bg-indigo-100 p-1.5 rounded-lg text-indigo-600">
            <FiGlobe size={18} />
          </div>
          <h3 className="font-bold text-slate-800">World Chat</h3>
          <span className="flex items-center gap-1.5 ml-2 text-[10px] text-emerald-700 bg-emerald-50 px-2 py-1 rounded-full border border-emerald-200 font-bold uppercase tracking-wider">
             <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse"></span> 
             Live
          </span>
        </div>
        <FiMessageSquare className="text-slate-300" size={18} />
      </div>

      {/* Chat Body */}
      <div className="flex-1 p-4 overflow-y-auto bg-slate-50 flex flex-col gap-4">
        {messageList.length === 0 && (
          <div className="text-center text-sm text-slate-400 font-medium my-auto flex flex-col items-center gap-2">
            <span className="text-3xl">👋</span>
            Welcome to the global lounge.<br/>Say hi to the world!
          </div>
        )}

        {messageList.map((msg, index) => {
          const isMe = msg.author === user.username;
          return (
            <div key={index} className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}>
              
              {/* Author & Time */}
              <div className="flex items-baseline gap-2 mb-1.5 px-1">
                <span className={`text-[11px] font-bold ${isMe ? 'text-indigo-600' : 'text-slate-600'}`}>
                  {isMe ? 'You' : msg.author}
                </span>
                <span className="text-[10px] font-medium text-slate-400">{msg.time}</span>
              </div>
              
              {/* Message Bubble */}
              <div className={`px-4 py-2.5 max-w-[85%] break-words text-sm shadow-sm
                ${isMe 
                  ? 'bg-indigo-600 text-white rounded-2xl rounded-tr-sm' 
                  : 'bg-white text-slate-700 border border-slate-200 rounded-2xl rounded-tl-sm'
                }`}
              >
                {msg.message}
              </div>
              
            </div>
          );
        })}
        {/* Invisible div to target for auto-scrolling */}
        <div ref={chatEndRef} />
      </div>

      {/* Input Area */}
      <div className="p-4 bg-white border-t border-slate-100 z-10">
        <form onSubmit={sendMessage} className="flex gap-2">
          <input
            type="text"
            value={currentMessage}
            onChange={(e) => setCurrentMessage(e.target.value)}
            placeholder="Type your message..."
            className="flex-1 bg-slate-50 text-sm text-slate-800 px-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:border-indigo-400 focus:ring-4 focus:ring-indigo-50 transition-all placeholder:text-slate-400"
          />
          <button
            type="submit"
            disabled={!currentMessage.trim()}
            className="bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 disabled:hover:bg-indigo-600 text-white p-3 rounded-xl transition-all flex items-center justify-center focus:outline-none focus:ring-4 focus:ring-indigo-100"
            aria-label="Send message"
          >
            <FiSend size={16} className={currentMessage.trim() ? "translate-x-0.5 -translate-y-0.5 transition-transform" : ""} />
          </button>
        </form>
      </div>
      
    </div>
  );
};

export default WorldChatWidget;