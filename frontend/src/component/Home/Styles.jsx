// Styles.jsx
import React from "react";

const Styles = () => (
  <style>{`
    @import url('https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@300;400;500;600;700&family=JetBrains+Mono:wght@400;500&display=swap');

    :root {
      --bg: #030303;
      --surface: #0a0a0a;
      --accent: #3b82f6;
      --accent-glow: rgba(59, 130, 246, 0.5);
      --text-dim: #888888;
      --font-main: 'Space Grotesk', sans-serif;
      --font-code: 'JetBrains Mono', monospace;
    }

    body {
      background-color: var(--bg);
      color: white;
      font-family: var(--font-main);
      overflow-x: hidden;
      letter-spacing: -0.02em; /* Tighter tracking for that modern feel */
    }

    /* Override Tailwind's default mono for this theme */
    .font-mono {
      font-family: var(--font-code) !important;
    }

    /* Enhanced Grid Background with Parallax */
    .cyber-grid {
      background-size: 50px 50px;
      background-image: 
        linear-gradient(to right, rgba(255,255,255,0.03) 1px, transparent 1px),
        linear-gradient(to bottom, rgba(255,255,255,0.03) 1px, transparent 1px);
      mask-image: radial-gradient(circle at 50% 50%, black 0%, transparent 80%);
      transition: transform 0.1s ease-out;
    }

    /* Text Reveal Animation */
    @keyframes reveal {
      0% { opacity: 0; transform: translateY(10px); filter: blur(4px); }
      100% { opacity: 1; transform: translateY(0); filter: blur(0); }
    }
    .reveal-text {
      animation: reveal 1s cubic-bezier(0.2, 0.8, 0.2, 1) forwards;
      opacity: 0;
    }
    .delay-100 { animation-delay: 0.1s; }
    .delay-200 { animation-delay: 0.2s; }
    .delay-300 { animation-delay: 0.3s; }
    .delay-400 { animation-delay: 0.4s; }
    .delay-500 { animation-delay: 0.5s; }

    /* Enhanced Beam Flow */
    @keyframes beamFlow {
      0% { background-position: 0% 0%; }
      100% { background-position: 200% 0%; }
    }
    .duel-beam {
      background: linear-gradient(90deg, transparent, var(--accent), transparent);
      background-size: 200% 100%;
      animation: beamFlow 3s linear infinite;
    }

    /* Holographic Glass Card */
    .glass-card {
      background: rgba(255, 255, 255, 0.02);
      backdrop-filter: blur(10px);
      border: 1px solid rgba(255, 255, 255, 0.08);
      box-shadow: 0 0 0 1px rgba(0,0,0,0.5), 0 20px 50px -20px rgba(0,0,0,0.7);
      transition: transform 0.3s ease, box-shadow 0.3s ease;
    }
    
    .glass-card:hover {
      transform: translateY(-2px);
      box-shadow: 
        0 0 0 1px rgba(59, 130, 246, 0.3),
        0 0 40px -10px rgba(59, 130, 246, 0.3),
        0 30px 60px -20px rgba(0,0,0,0.9);
    }

    /* Glow Pulse Effect */
    @keyframes glowPulse {
      0%, 100% { opacity: 0.5; transform: scale(1); }
      50% { opacity: 1; transform: scale(1.05); }
    }
    .glow-pulse {
      animation: glowPulse 2s ease-in-out infinite;
    }

    /* Gradient Border Animation */
    @keyframes borderRotate {
      0% { background-position: 0% 50%; }
      50% { background-position: 100% 50%; }
      100% { background-position: 0% 50%; }
    }
    .animated-border {
      background: linear-gradient(90deg, 
        rgba(59, 130, 246, 0.5),
        rgba(168, 85, 247, 0.5),
        rgba(59, 130, 246, 0.5)
      );
      background-size: 200% 100%;
      animation: borderRotate 3s ease infinite;
    }

    /* Typing Cursor */
    @keyframes blink {
      0%, 49% { opacity: 1; }
      50%, 100% { opacity: 0; }
    }
    .typing-cursor {
      display: inline-block;
      width: 2px;
      height: 1em;
      background: var(--accent);
      animation: blink 1s step-end infinite;
      margin-left: 2px;
    }

    /* Shimmer Effect */
    @keyframes shimmer {
      0% { background-position: -1000px 0; }
      100% { background-position: 1000px 0; }
    }
    .shimmer {
      background: linear-gradient(
        90deg,
        transparent,
        rgba(255, 255, 255, 0.1),
        transparent
      );
      background-size: 1000px 100%;
      animation: shimmer 3s infinite;
    }
    
    /* Code Syntax Colors */
    .syntax-kwd { color: #c678dd; }
    .syntax-fn { color: #61afef; }
    .syntax-str { color: #98c379; }
    .syntax-num { color: #d19a66; }
    .syntax-comment { color: #5c6370; font-style: italic; }

    /* Holographic Tilt Effect */
    .holo-card {
      transform-style: preserve-3d;
      transition: transform 0.3s ease;
    }
    .holo-card:hover {
      transform: perspective(1000px) rotateX(2deg) rotateY(-2deg);
    }

    /* Floating Animation */
    @keyframes float {
      0%, 100% { transform: translateY(0px); }
      50% { transform: translateY(-10px); }
    }
    .float {
      animation: float 3s ease-in-out infinite;
    }

    /* Energy Ring */
    @keyframes energyRing {
      0% { transform: scale(1); opacity: 0.5; }
      100% { transform: scale(1.5); opacity: 0; }
    }
    .energy-ring {
      animation: energyRing 2s ease-out infinite;
    }
  `}</style>
);

export default Styles;