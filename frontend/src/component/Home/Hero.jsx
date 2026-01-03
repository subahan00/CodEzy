import React, { useEffect, useState, useRef } from "react";
import { 
  Code2, Swords, BrainCircuit, Zap, ChevronRight, Terminal, 
  Activity, Cpu, Lock, Globe, GitBranch, Sparkles, Layout 
} from "lucide-react";
import { 
  motion, useScroll, useTransform, useSpring, 
  useMotionValue, useMotionTemplate, animate 
} from "framer-motion";

// --- GLOBAL & UTILITY STYLES ---
const GlobalStyles = () => (
  <style>{`
    @import url('https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@300;400;500;600;700&family=JetBrains+Mono:wght@400;500&display=swap');

    :root {
      --bg: #030014;
      --primary: #4f46e5;
      --secondary: #0ea5e9;
    }

    body {
      background-color: var(--bg);
      color: #ededed;
      font-family: 'Space Grotesk', sans-serif;
      overflow-x: hidden;
    }

    .font-mono { font-family: 'JetBrains Mono', monospace; }

    /* ANIMATED GRID BACKGROUND */
    .perspective-grid {
      background-size: 50px 50px;
      background-image:
        linear-gradient(to right, rgba(255, 255, 255, 0.05) 1px, transparent 1px),
        linear-gradient(to bottom, rgba(255, 255, 255, 0.05) 1px, transparent 1px);
      transform: perspective(500px) rotateX(60deg);
      transform-origin: top center;
      animation: gridMove 20s linear infinite;
    }

    @keyframes gridMove {
      0% { transform: perspective(500px) rotateX(60deg) translateY(0); }
      100% { transform: perspective(500px) rotateX(60deg) translateY(50px); }
    }

    /* GLASSMORPHISM UTILS */
    .glass-nav {
      background: rgba(10, 10, 20, 0.6);
      backdrop-filter: blur(12px);
      border: 1px solid rgba(255, 255, 255, 0.08);
      box-shadow: 0 4px 30px rgba(0, 0, 0, 0.1);
    }

    .glass-card {
      background: linear-gradient(180deg, rgba(20, 20, 30, 0.6) 0%, rgba(10, 10, 20, 0.8) 100%);
      backdrop-filter: blur(10px);
      border: 1px solid rgba(255, 255, 255, 0.05);
    }

    /* SCROLLBAR */
    ::-webkit-scrollbar { width: 6px; }
    ::-webkit-scrollbar-track { background: #030014; }
    ::-webkit-scrollbar-thumb { background: #333; border-radius: 3px; }
  `}</style>
);

// --- HOOKS ---
const useMousePosition = () => {
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  useEffect(() => {
    const updateMouse = (e) => {
      mouseX.set(e.clientX);
      mouseY.set(e.clientY);
    };
    window.addEventListener("mousemove", updateMouse);
    return () => window.removeEventListener("mousemove", updateMouse);
  }, [mouseX, mouseY]);

  return { mouseX, mouseY };
};

// --- SUB-COMPONENTS ---

const SpotlightCard = ({ children, className = "" }) => {
  const { mouseX, mouseY } = useMousePosition();

  function onMouseMove({ currentTarget, clientX, clientY }) {
    const { left, top } = currentTarget.getBoundingClientRect();
    mouseX.set(clientX - left);
    mouseY.set(clientY - top);
  }

  return (
    <div 
      className={`group relative border border-white/10 bg-gray-900/50 overflow-hidden ${className}`}
      onMouseMove={onMouseMove}
    >
      <motion.div
        className="pointer-events-none absolute -inset-px rounded-xl opacity-0 transition duration-300 group-hover:opacity-100"
        style={{
          background: useMotionTemplate`
            radial-gradient(
              650px circle at ${mouseX}px ${mouseY}px,
              rgba(59, 130, 246, 0.15),
              transparent 80%
            )
          `,
        }}
      />
      <div className="relative h-full">{children}</div>
    </div>
  );
};

const ScrambleText = ({ text }) => {
  const [display, setDisplay] = useState(text);
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789@#$%&";

  const scramble = () => {
    let i = 0;
    const interval = setInterval(() => {
      setDisplay(
        text.split("").map((letter, index) => {
          if (index < i) return text[index];
          return chars[Math.floor(Math.random() * chars.length)];
        }).join("")
      );
      i += 1/3;
      if (i >= text.length) clearInterval(interval);
    }, 30);
  };

  return (
    <span onMouseEnter={scramble} className="cursor-pointer hover:text-blue-400 transition-colors">
      {display}
    </span>
  );
};

const CodeBlock = () => {
  const codeString = `function optimize(input) {
  // O(1) space complexity
  return input.reduce((acc, x) => {
    return Math.max(acc, x);
  }, 0);
}`;
  const [text, setText] = useState("");

  useEffect(() => {
    let i = 0;
    const timer = setInterval(() => {
      setText(codeString.slice(0, i));
      i++;
      if (i > codeString.length) clearInterval(timer);
    }, 30);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="font-mono text-[10px] md:text-xs leading-relaxed text-blue-100/80">
      <pre>{text}<span className="animate-pulse">_</span></pre>
    </div>
  );
};

// --- MAIN SECTIONS ---

const Navbar = () => (
  <motion.nav 
    initial={{ y: -100 }} animate={{ y: 0 }} transition={{ duration: 0.8 }}
    className="fixed top-0 left-0 right-0 z-50 flex justify-center pt-6 px-4"
  >
    <div className="glass-nav rounded-full px-6 py-3 flex items-center gap-12">
      <div className="flex items-center gap-2 font-bold text-xl tracking-tighter">
        <div className="relative">
          <div className="absolute inset-0 bg-blue-500 blur-lg opacity-40" />
          <Code2 className="w-6 h-6 text-white relative z-10" />
        </div>
        <span className="text-white">CodEzy</span>
      </div>

      <div className="hidden md:flex items-center gap-8 text-sm font-medium text-gray-400">
        {["Arena", "Learning", "Enterprise"].map(item => (
          <a key={item} href="#" className="hover:text-white hover:scale-105 transition-all">{item}</a>
        ))}
      </div>

      <button className="bg-white/10 hover:bg-white/20 text-white px-5 py-2 rounded-full text-sm font-semibold border border-white/10 transition-all backdrop-blur-md">
        Get Started
      </button>
    </div>
  </motion.nav>
);

const TiltContainer = ({ children }) => {
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const rotateX = useTransform(y, [-100, 100], [5, -5]);
  const rotateY = useTransform(x, [-100, 100], [-5, 5]);

  return (
    <motion.div 
      style={{ rotateX, rotateY, perspective: 1000 }}
      onMouseMove={(e) => {
        const rect = e.currentTarget.getBoundingClientRect();
        x.set(e.clientX - rect.left - rect.width / 2);
        y.set(e.clientY - rect.top - rect.height / 2);
      }}
      onMouseLeave={() => { x.set(0); y.set(0); }}
      className="relative z-20 transition-transform duration-200 ease-out"
    >
      {children}
    </motion.div>
  );
};

const DuelVisual = () => (
  <TiltContainer>
    <div className="w-full max-w-5xl mx-auto mt-20 relative group">
      {/* Background Glows */}
      <div className="absolute -inset-1 bg-gradient-to-r from-cyan-500 to-purple-600 rounded-2xl blur-xl opacity-20 group-hover:opacity-40 transition duration-1000" />
      
      <div className="glass-card rounded-xl overflow-hidden border border-white/10 shadow-2xl relative">
        {/* Top Bar */}
        <div className="h-10 border-b border-white/5 bg-black/40 flex items-center justify-between px-4">
          <div className="flex gap-2">
            <div className="w-3 h-3 rounded-full bg-red-500/50" />
            <div className="w-3 h-3 rounded-full bg-yellow-500/50" />
            <div className="w-3 h-3 rounded-full bg-green-500/50" />
          </div>
          <div className="text-[10px] font-mono text-emerald-500 flex items-center gap-2">
            <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
            LIVE CONNECTION ESTABLISHED
          </div>
        </div>

        <div className="grid grid-cols-2 h-[350px]">
          {/* Player 1 */}
          <div className="p-6 border-r border-white/5 bg-black/20 relative">
            <div className="absolute top-4 right-4 text-xs font-mono text-blue-400 bg-blue-400/10 px-2 py-1 rounded">USER_01</div>
            <CodeBlock />
          </div>
          
          {/* Player 2 */}
          <div className="p-6 bg-black/40 relative overflow-hidden">
            <div className="absolute top-4 right-4 text-xs font-mono text-purple-400 bg-purple-400/10 px-2 py-1 rounded">OPPONENT_AI</div>
            <div className="font-mono text-[10px] md:text-xs text-gray-600 blur-[1px] select-none opacity-50">
              {`class NeuralEngine:\n  def evaluate(self, node):\n    return self.traverse(node * 0.99)`}
            </div>
            {/* Simulation of AI Typing */}
            <div className="absolute bottom-10 left-6 flex items-center gap-3">
               <div className="flex space-x-1">
                 <motion.div animate={{ height: [5, 15, 5] }} transition={{ repeat: Infinity, duration: 1 }} className="w-1 bg-purple-500" />
                 <motion.div animate={{ height: [5, 15, 5] }} transition={{ repeat: Infinity, duration: 1, delay: 0.2 }} className="w-1 bg-purple-500" />
                 <motion.div animate={{ height: [5, 15, 5] }} transition={{ repeat: Infinity, duration: 1, delay: 0.4 }} className="w-1 bg-purple-500" />
               </div>
               <span className="text-xs text-purple-400 font-mono">Compiling Logic...</span>
            </div>
          </div>
        </div>

        {/* VS Badge */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-20">
          <div className="relative">
            <div className="absolute inset-0 bg-blue-500 blur-xl opacity-50 animate-pulse" />
            <div className="w-16 h-16 rounded-full bg-black border border-white/20 flex items-center justify-center relative z-10 shadow-lg">
              <span className="font-black italic text-transparent bg-clip-text bg-gradient-to-br from-white to-gray-500 text-xl">VS</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </TiltContainer>
);

const BackgroundEffects = () => (
<div className="absolute inset-0 z-0 pointer-events-none overflow-hidden">
    {/* Animated 3D Grid */}
    <div className="absolute inset-0 top-1/2 opacity-20 perspective-grid mask-linear-gradient" />
    <div className="absolute inset-0 bg-gradient-to-t from-[#030014] via-transparent to-[#030014] z-10" />

    {/* Floating Elements */}
    <motion.div 
      animate={{ y: [0, -20, 0], opacity: [0.3, 0.6, 0.3] }} 
      transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
      className="absolute top-1/4 left-10 text-blue-500/20"
    >
      <BrainCircuit size={100} />
    </motion.div>
    <motion.div 
      animate={{ y: [0, 30, 0], rotate: [0, 45, 0] }} 
      transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
      className="absolute bottom-1/3 right-10 text-purple-500/20"
    >
      <Cpu size={120} />
    </motion.div>
    
    {/* Top Spotlights */}
    <div className="absolute -top-[200px] left-1/2 -translate-x-1/2 w-[1000px] h-[500px] bg-blue-600/20 blur-[120px] rounded-full" />
    <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-purple-600/10 blur-[100px] rounded-full" />
  </div>
);

const Hero = () => {
  return (
    <div className="relative min-h-screen bg-[#030014] selection:bg-blue-500/30">
      <GlobalStyles />
      <BackgroundEffects />
      <Navbar />

      <main className="relative z-10 pt-32 pb-20 px-4 md:px-8 max-w-7xl mx-auto flex flex-col items-center">
        
        {/* Badge */}
        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="flex items-center gap-2 px-4 py-1.5 rounded-full border border-blue-500/30 bg-blue-500/10 mb-8 backdrop-blur-sm"
        >
          <Sparkles className="w-3 h-3 text-blue-400" />
          <span className="text-xs font-medium text-blue-200 tracking-wider">NEXT GEN COMPILER ONLINE</span>
        </motion.div>

        {/* Hero Title */}
        <div className="text-center relative">
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="text-5xl md:text-8xl font-bold tracking-tight text-white mb-6"
          >
            CODE BEYOND <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400">
              <ScrambleText text="BINARY JUDGMENT" />
            </span>
          </motion.h1>

          <motion.p 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.4 }}
            className="max-w-xl mx-auto text-gray-400 text-lg md:text-xl leading-relaxed"
          >
            A semantic evaluation engine that judges logic, not just syntax.
            Compete in a decentralized mesh of algorithmic excellence.
          </motion.p>
        </div>

        {/* CTAs */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.6 }}
          className="flex flex-col md:flex-row gap-5 mt-10"
        >
          <button className="group relative px-8 py-4 bg-white text-black font-bold text-sm rounded-xl overflow-hidden shadow-[0_0_20px_rgba(255,255,255,0.3)] hover:shadow-[0_0_40px_rgba(255,255,255,0.5)] transition-shadow">
            <div className="absolute inset-0 bg-gradient-to-r from-blue-400 via-purple-400 to-blue-400 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            <span className="relative z-10 flex items-center gap-2 group-hover:text-white transition-colors">
              ENTER THE ARENA <Swords className="w-4 h-4" />
            </span>
          </button>
          
          <button className="px-8 py-4 glass-card text-white font-medium text-sm rounded-xl hover:bg-white/5 transition-colors flex items-center gap-2 border border-white/10">
            VIEW DOCS <ChevronRight className="w-4 h-4 text-gray-500" />
          </button>
        </motion.div>

        {/* Main Visual */}
        <DuelVisual />

        {/* Bento Stats/Features */}
        <div className="w-full mt-32">
          <div className="flex items-end justify-between mb-10">
            <h2 className="text-3xl text-white font-bold">System Architecture</h2>
            <div className="h-px bg-white/10 flex-1 ml-8 hidden md:block" />
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <SpotlightCard className="col-span-1 md:col-span-2 rounded-2xl p-8">
              <div className="flex items-start justify-between">
                <div>
                  <div className="w-10 h-10 rounded-lg bg-blue-500/10 flex items-center justify-center mb-4">
                    <Globe className="w-5 h-5 text-blue-400" />
                  </div>
                  <h3 className="text-xl font-bold text-white mb-2">Global Mesh Network</h3>
                  <p className="text-gray-400 max-w-sm">Execution nodes distributed across 40+ regions for sub-50ms latency in competitive duels.</p>
                </div>
                <div className="hidden md:block">
                  <div className="flex gap-2">
                    <div className="px-2 py-1 rounded bg-green-500/10 border border-green-500/20 text-[10px] text-green-400">US-EAST</div>
                    <div className="px-2 py-1 rounded bg-blue-500/10 border border-blue-500/20 text-[10px] text-blue-400">EU-CENTRAL</div>
                  </div>
                </div>
              </div>
            </SpotlightCard>

            <SpotlightCard className="col-span-1 rounded-2xl p-8">
               <div className="w-10 h-10 rounded-lg bg-purple-500/10 flex items-center justify-center mb-4">
                 <BrainCircuit className="w-5 h-5 text-purple-400" />
               </div>
               <h3 className="text-xl font-bold text-white mb-2">Neural Feedback</h3>
               <p className="text-gray-400">Real-time complexity analysis using custom LLM heuristics.</p>
            </SpotlightCard>

            <SpotlightCard className="col-span-1 rounded-2xl p-8">
               <div className="w-10 h-10 rounded-lg bg-amber-500/10 flex items-center justify-center mb-4">
                 <Lock className="w-5 h-5 text-amber-400" />
               </div>
               <h3 className="text-xl font-bold text-white mb-2">Secure Sandbox</h3>
               <p className="text-gray-400">Isolated WASM environments for safe code execution.</p>
            </SpotlightCard>

            <SpotlightCard className="col-span-1 md:col-span-2 rounded-2xl p-8 flex items-center justify-between">
              <div>
                 <h3 className="text-xl font-bold text-white mb-2">Ready to compile?</h3>
                 <p className="text-gray-400">Join 10,000+ developers in the arena.</p>
              </div>
              <button className="w-12 h-12 rounded-full bg-white text-black flex items-center justify-center hover:scale-110 transition-transform">
                <ChevronRight className="w-6 h-6" />
              </button>
            </SpotlightCard>
          </div>
        </div>

      </main>

      
    </div>
  );
};

export default Hero;