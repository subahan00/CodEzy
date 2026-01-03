import React, { useRef, useState, useEffect } from "react";
import { motion, useMotionTemplate, useMotionValue, animate } from "framer-motion";
import { 
  BrainCircuit, 
  Swords, 
  ShieldCheck, 
  LineChart, 
  Layers, 
  Zap, 
  Trophy,
  ArrowUpRight,
  Terminal,
  Cpu
} from "lucide-react";

// --- DATA ---
const FEATURES = [
  {
    title: "Real-Time 1v1 Duels",
    description: "Experience the pressure of live contests. Our WebSocket engine synchronizes state sub-50ms, allowing for instant feedback even during active battle.",
    icon: Swords,
    size: "large", 
    accent: "blue"
  },
  {
    title: "Semantic Analysis",
    description: "We don't just check if code runs. Our AI evaluates time complexity, memory usage, and code readability against industry standards.",
    icon: BrainCircuit,
    size: "regular",
    accent: "purple"
  },
  {
    title: "Secure Sandbox",
    description: "Every submission executes in an isolated Docker container, ensuring safety and consistent runtime environments.",
    icon: ShieldCheck,
    size: "regular",
    accent: "emerald"
  },
  {
    title: "Adaptive Learning Paths",
    description: "The platform learns from your mistakes. We generate personalized problem sets to target your specific weak points.",
    icon: Layers,
    size: "regular",
    accent: "orange"
  },
  {
    title: "Performance Analytics",
    description: "Detailed dashboards for educators and learners. Track logic improvement over time, not just pass/fail rates.",
    icon: LineChart,
    size: "large",
    accent: "indigo"
  },
  {
    title: "Gamified Ecosystem",
    description: "Earn ranks, climb global leaderboards, and unlock badges. We turn algorithmic improvement into a competitive sport.",
    icon: Trophy,
    size: "regular",
    accent: "yellow"
  }
];

// --- UTILS ---
const COLORS = {
  blue: "from-blue-500 to-cyan-500",
  purple: "from-purple-500 to-pink-500",
  emerald: "from-emerald-500 to-green-500",
  orange: "from-orange-500 to-red-500",
  indigo: "from-indigo-500 to-blue-500",
  yellow: "from-yellow-500 to-amber-500"
};

const BORDER_COLORS = {
  blue: "group-hover:border-blue-500/50",
  purple: "group-hover:border-purple-500/50",
  emerald: "group-hover:border-emerald-500/50",
  orange: "group-hover:border-orange-500/50",
  indigo: "group-hover:border-indigo-500/50",
  yellow: "group-hover:border-yellow-500/50"
};

// --- SUB-COMPONENTS ---

const CircuitPattern = () => (
  <div className="absolute inset-0 pointer-events-none opacity-[0.05]" 
    style={{ 
      backgroundImage: `
        linear-gradient(to right, #333 1px, transparent 1px),
        linear-gradient(to bottom, #333 1px, transparent 1px)
      `,
      backgroundSize: '40px 40px',
      maskImage: 'radial-gradient(ellipse at center, black 40%, transparent 80%)'
    }} 
  />
);

const FeatureCard = ({ feature, index }) => {
  const ref = useRef(null);
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  
  const handleMouseMove = (e) => {
    if (!ref.current) return;
    const rect = ref.current.getBoundingClientRect();
    x.set(e.clientX - rect.left);
    y.set(e.clientY - rect.top);
  };

  return (
    <motion.div
      ref={ref}
      onMouseMove={handleMouseMove}
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay: index * 0.1, duration: 0.5 }}
      className={`
        relative group rounded-2xl overflow-hidden
        border border-white/5 bg-[#030014]/40 backdrop-blur-md
        transition-colors duration-500
        ${feature.size === "large" ? "md:col-span-2" : "md:col-span-1"}
        ${BORDER_COLORS[feature.accent]}
      `}
    >
      {/* 1. Dynamic Spotlight Background */}
      <motion.div
        className="pointer-events-none absolute -inset-px opacity-0 transition duration-300 group-hover:opacity-100"
        style={{
          background: useMotionTemplate`
            radial-gradient(
              650px circle at ${x}px ${y}px,
              rgba(255, 255, 255, 0.03),
              transparent 40%
            )
          `,
        }}
      />

      {/* 2. Moving Border Gradient on Hover */}
      <motion.div
        className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"
        style={{
          background: useMotionTemplate`
            radial-gradient(
              400px circle at ${x}px ${y}px,
              rgba(255, 255, 255, 0.1),
              transparent 40%
            )
          `,
        }}
      />

      {/* Content */}
      <div className="relative h-full p-8 flex flex-col justify-between z-10">
        <div>
          {/* Icon Box */}
          <div className="mb-6 relative inline-block">
            <div className={`absolute inset-0 bg-gradient-to-br ${COLORS[feature.accent]} blur-xl opacity-20 group-hover:opacity-40 transition-opacity`} />
            <div className={`relative w-12 h-12 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center group-hover:scale-110 transition-transform duration-300`}>
              <feature.icon className="w-6 h-6 text-gray-200" />
            </div>
          </div>

          <h3 className="text-xl md:text-2xl font-bold text-white mb-3 group-hover:text-transparent group-hover:bg-clip-text group-hover:bg-gradient-to-r group-hover:from-white group-hover:to-gray-400 transition-all">
            {feature.title}
          </h3>
          
          <p className="text-gray-400 text-sm md:text-base leading-relaxed font-light">
            {feature.description}
          </p>
        </div>

        {/* Footer Action */}
        <div className="mt-8 flex items-center gap-2 text-xs font-mono text-gray-600 group-hover:text-white/80 transition-colors uppercase tracking-widest">
          <Terminal className="w-3 h-3" />
          <span>System Ready</span>
          <ArrowUpRight className="w-3 h-3 opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-300" />
        </div>
      </div>
    </motion.div>
  );
};

const FeatureGrid = () => {
  return (
    <section className="relative w-full py-32 z-10">
      
      {/* Global Background Integration */}
      {/* We use a gradient to fade from the previous section into this one seamlessly */}
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-[#030014]/50 to-[#030014] pointer-events-none" />
      
      {/* Cyber Grid Pattern */}
      <CircuitPattern />

      <div className="max-w-7xl mx-auto px-4 md:px-8 relative z-10">
        
        {/* Section Header */}
        <div className="mb-24 md:text-center max-w-3xl mx-auto">
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-blue-500/20 bg-blue-500/5 mb-6 backdrop-blur-md md:mx-auto"
          >
            <Cpu className="w-3 h-3 text-blue-400 animate-pulse" />
            <span className="text-[10px] font-bold text-blue-200 uppercase tracking-widest font-mono">
              SYSTEM ARCHITECTURE v2.0
            </span>
          </motion.div>
          
          <motion.h2 
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-4xl md:text-6xl font-bold text-white mb-6 tracking-tight"
          >
            Engineered for <br className="hidden md:block" />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-purple-400 to-cyan-400">
              Algorithmic Dominance
            </span>
          </motion.h2>
          
          <motion.p 
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="text-gray-400 text-lg md:text-xl font-light leading-relaxed"
          >
            A unified ecosystem merging competitive pressure with intelligent, personalized feedback loops.
          </motion.p>
        </div>

        {/* Bento Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {FEATURES.map((feature, index) => (
            <FeatureCard key={index} feature={feature} index={index} />
          ))}
        </div>

      </div>
    </section>
  );
};

export default FeatureGrid;