import React, { useState, useEffect, useRef } from 'react';
import io from 'socket.io-client';
import { FiSend, FiGlobe, FiHash } from 'react-icons/fi';

const socket = io.connect("http://localhost:9999");

const WorldChatWidget = () => {
  const [currentMessage, setCurrentMessage] = useState("");
  const [messageList, setMessageList] = useState([]);
  const chatEndRef = useRef(null);
  const inputRef = useRef(null);

  const user = JSON.parse(localStorage.getItem('user')) || { username: 'Guest' };

  // Assign a deterministic color to each user based on their username
  const getUserColor = (username) => {
    const colors = [
      '#818cf8', '#34d399', '#fbbf24', '#f87171',
      '#a78bfa', '#38bdf8', '#fb923c', '#4ade80',
    ];
    let hash = 0;
    for (let i = 0; i < username.length; i++) hash = username.charCodeAt(i) + ((hash << 5) - hash);
    return colors[Math.abs(hash) % colors.length];
  };

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

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messageList]);

  const isMe = (author) => author === user.username;

  return (
    <div
      style={{
        background: '#0f1117',
        border: '1px solid rgba(255,255,255,0.07)',
        fontFamily: "'JetBrains Mono', 'Fira Code', monospace",
      }}
      className="rounded-2xl flex flex-col overflow-hidden"
      style2={{ height: '480px' }}
    >
      {/* Header — IRC channel style */}
      <div
        className="flex items-center justify-between px-5 py-3.5 flex-shrink-0"
        style={{ borderBottom: '1px solid rgba(255,255,255,0.06)', background: 'rgba(255,255,255,0.02)' }}
      >
        <div className="flex items-center gap-2.5">
          <div
            className="w-6 h-6 rounded-md flex items-center justify-center"
            style={{ background: 'rgba(99,102,241,0.12)', border: '1px solid rgba(99,102,241,0.2)' }}
          >
            <FiHash size={12} style={{ color: '#818cf8' }} />
          </div>
          <span className="text-white font-bold text-sm tracking-wide">world</span>
          <span className="text-zinc-700 text-xs">— global lounge</span>
        </div>

        {/* Live badge */}
        <div className="flex items-center gap-1.5">
          <span
            className="w-1.5 h-1.5 rounded-full"
            style={{ background: '#34d399', boxShadow: '0 0 6px rgba(52,211,153,0.6)', animation: 'pulse 2s infinite' }}
          />
          <span className="text-[10px] font-bold uppercase tracking-[0.12em] text-emerald-500">live</span>
        </div>
      </div>

      {/* Messages */}
      <div
        className="flex-1 px-4 py-4 overflow-y-auto flex flex-col gap-3"
        style={{
          minHeight: 0,
          maxHeight: '340px',
          background: '#0a0b10',
          scrollbarWidth: 'thin',
          scrollbarColor: 'rgba(255,255,255,0.06) transparent',
        }}
      >
        {messageList.length === 0 && (
          <div className="m-auto text-center flex flex-col items-center gap-3 py-8">
            <div
              className="w-10 h-10 rounded-xl flex items-center justify-center text-lg"
              style={{ background: 'rgba(99,102,241,0.1)', border: '1px solid rgba(99,102,241,0.15)' }}
            >
              <FiGlobe size={18} style={{ color: '#6366f1' }} />
            </div>
            <p className="text-zinc-600 text-xs leading-relaxed">
              No messages yet.<br />
              <span style={{ color: '#818cf8' }}>{'>'} </span>
              Be the first to say hi.
            </p>
          </div>
        )}

        {messageList.map((msg, index) => {
          const mine = isMe(msg.author);
          const color = getUserColor(msg.author);
          const prevMsg = messageList[index - 1];
          const isGrouped = prevMsg && prevMsg.author === msg.author;

          return (
            <div key={index} className={`flex flex-col ${mine ? 'items-end' : 'items-start'}`}>
              {/* Author + time — show only if not grouped */}
              {!isGrouped && (
                <div className={`flex items-baseline gap-2 mb-1 px-1 ${mine ? 'flex-row-reverse' : 'flex-row'}`}>
                  <span className="text-[11px] font-bold" style={{ color: mine ? '#818cf8' : color }}>
                    {mine ? 'you' : msg.author}
                  </span>
                  <span className="text-[10px] text-zinc-700">{msg.time}</span>
                </div>
              )}

              {/* Bubble */}
              <div
                className="max-w-[80%] text-xs px-3.5 py-2 rounded-xl break-words leading-relaxed"
                style={
                  mine
                    ? {
                        background: 'rgba(99,102,241,0.18)',
                        border: '1px solid rgba(99,102,241,0.25)',
                        color: '#c7d2fe',
                        borderBottomRightRadius: '4px',
                      }
                    : {
                        background: 'rgba(255,255,255,0.04)',
                        border: '1px solid rgba(255,255,255,0.07)',
                        color: '#a1a1aa',
                        borderBottomLeftRadius: '4px',
                      }
                }
              >
                {msg.message}
              </div>
            </div>
          );
        })}
        <div ref={chatEndRef} />
      </div>

      {/* Input */}
      <div
        className="px-4 py-3 flex-shrink-0"
        style={{ borderTop: '1px solid rgba(255,255,255,0.06)', background: 'rgba(255,255,255,0.01)' }}
      >
        <form onSubmit={sendMessage} className="flex items-center gap-2">
          {/* Prompt indicator */}
          <span className="text-indigo-500/60 text-sm font-bold select-none flex-shrink-0">{'>'}</span>

          <input
            ref={inputRef}
            type="text"
            value={currentMessage}
            onChange={(e) => setCurrentMessage(e.target.value)}
            placeholder="send a message..."
            className="flex-1 bg-transparent text-xs text-zinc-300 placeholder-zinc-700 focus:outline-none tracking-wide"
            style={{ fontFamily: 'inherit' }}
          />

          <button
            type="submit"
            disabled={!currentMessage.trim()}
            className="p-2 rounded-lg transition-all duration-150 flex-shrink-0 focus:outline-none"
            style={{
              background: currentMessage.trim() ? 'rgba(99,102,241,1)' : 'rgba(255,255,255,0.04)',
              color: currentMessage.trim() ? '#fff' : '#3f3f46',
              border: '1px solid transparent',
            }}
            aria-label="Send"
          >
            <FiSend size={13} />
          </button>
        </form>
      </div>
    </div>
  );
};

export default WorldChatWidget;