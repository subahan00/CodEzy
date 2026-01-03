import React, { useState, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Smartphone, Monitor, Server, Database, Cpu, ShieldCheck,
  Globe, Zap, Layers, Code2, Lock, Box, Terminal,
  Activity, HardDrive
} from "lucide-react";

// --- THEME CONFIG (Aligned with CodEzy Global) ---
const THEME = {
  primary: "from-blue-500 to-cyan-500",
  success: "from-emerald-500 to-green-500",
  accent: "from-purple-500 to-pink-500",
  warn: "from-amber-500 to-orange-500",
  bg: "#030014", // Deep Space Dark
};

// --- DATA STRUCTURE (Preserved) ---
const SYSTEM_DATA = [
  {
    id: "client",
    label: "Client Interface",
    description: "User interaction layer",
    nodes: [
      { id: "web", icon: Monitor, label: "Web Portal", detail: "Next.js 14", status: "online", downstream: ["api-gw"] },
      { id: "mobile", icon: Smartphone, label: "Mobile App", detail: "React Native", status: "online", downstream: ["api-gw"] }
    ]
  },
  {
    id: "gateway",
    label: "Ingress Gateway",
    description: "Security & Routing",
    nodes: [
      { id: "api-gw", icon: ShieldCheck, label: "API Gateway", detail: "Nginx / Lua", status: "high-load", downstream: ["user-svc", "content-svc", "duel-svc", "eval-svc"] }
    ]
  },
  {
    id: "services",
    label: "Service Mesh",
    description: "Business Logic Domain",
    nodes: [
      { id: "user-svc", icon: Lock, label: "Identity Svc", detail: "OAuth2 / JWT", status: "online", downstream: ["db", "cache"] },
      { id: "content-svc", icon: Layers, label: "Content Svc", detail: "CMS Interface", status: "online", downstream: ["db", "cache"] },
      { id: "duel-svc", icon: Zap, label: "Duel Engine", detail: "WebSockets", status: "active", downstream: ["match", "cache"] },
      { id: "eval-svc", icon: Code2, label: "Code Eval", detail: "Submission Queue", status: "processing", downstream: ["sandbox", "ai-mod"] }
    ]
  },
  {
    id: "core",
    label: "Compute Engine",
    description: "Heavy Processing Units",
    nodes: [
      { id: "ai-mod", icon: Cpu, label: "AI Analysis", detail: "LLM Inference", status: "idle", accent: "purple", downstream: ["db"] },
      { id: "sandbox", icon: Box, label: "Execution Sandbox", detail: "Isolated Docker", status: "active", accent: "blue", downstream: ["db"] },
      { id: "match", icon: Globe, label: "Matchmaker", detail: "Elo Algorithm", status: "online", accent: "cyan", downstream: ["db", "cache"] }
    ]
  },
  {
    id: "data",
    label: "Persistence Layer",
    description: "Storage & Caching",
    nodes: [
      { id: "db", icon: Database, label: "Primary DB", detail: "PostgreSQL Cluster", status: "online", downstream: [] },
      { id: "cache", icon: HardDrive, label: "Redis Mesh", detail: "In-Memory Store", status: "online", downstream: [] }
    ]
  }
];

// --- SUB-COMPONENTS ---

const CircuitPattern = () => (
  <div className="absolute inset-0 pointer-events-none opacity-[0.05]" 
    style={{ 
      backgroundImage: `
        linear-gradient(to right, #333 1px, transparent 1px),
        linear-gradient(to bottom, #333 1px, transparent 1px)
      `,
      backgroundSize: '40px 40px',
      maskImage: 'radial-gradient(circle at center, black 40%, transparent 80%)'
    }} 
  />
);

const StatusDot = ({ status }) => {
  const colorClass = status === 'online' ? 'bg-emerald-400 shadow-[0_0_8px_#34d399]' 
    : status === 'high-load' ? 'bg-amber-400 shadow-[0_0_8px_#fbbf24]' 
    : status === 'processing' ? 'bg-blue-400 shadow-[0_0_8px_#60a5fa]' 
    : 'bg-purple-400 shadow-[0_0_8px_#c084fc]';
  
  return (
    <span className="relative flex h-2 w-2">
      <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${colorClass.split(' ')[0]}`}></span>
      <span className={`relative inline-flex rounded-full h-2 w-2 ${colorClass}`}></span>
    </span>
  );
};

const NodeCard = ({ node, isDimmed, isHighlighted, onHover, onLeave }) => {
  return (
    <motion.div
      layout
      onMouseEnter={() => onHover(node.id)}
      onMouseLeave={onLeave}
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ 
        opacity: isDimmed ? 0.3 : 1, 
        scale: isHighlighted ? 1.05 : 1,
        filter: isDimmed ? "grayscale(100%) blur(1px)" : "grayscale(0%) blur(0px)",
        borderColor: isHighlighted ? "rgba(59,130,246,0.5)" : "rgba(255,255,255,0.05)"
      }}
      transition={{ duration: 0.3 }}
      className={`
        relative flex flex-col p-4 rounded-xl border bg-[#030014]/80 backdrop-blur-xl
        group cursor-pointer overflow-hidden transition-all duration-300
        ${isHighlighted ? 'shadow-[0_0_30px_rgba(59,130,246,0.15)] z-20' : 'hover:border-white/20 z-10'}
      `}
    >
      {/* Active Glow Gradient */}
      <div className={`absolute inset-0 bg-gradient-to-br opacity-0 transition-opacity duration-500
        ${isHighlighted ? 'opacity-10' : 'group-hover:opacity-5'}
        ${node.accent === 'purple' ? THEME.accent : 
          node.accent === 'cyan' ? 'from-cyan-500 to-blue-500' : 
          THEME.primary}`} 
      />

      {/* Header */}
      <div className="flex justify-between items-start mb-3 z-10">
        <div className={`p-2 rounded-lg bg-white/5 border border-white/5 transition-colors ${isHighlighted ? 'text-blue-400 bg-blue-500/10' : 'text-gray-400'}`}>
          <node.icon size={18} />
        </div>
        <StatusDot status={node.status} />
      </div>

      {/* Content */}
      <div className="z-10">
        <h4 className={`text-sm font-bold mb-1 transition-colors ${isHighlighted ? 'text-white' : 'text-gray-300'}`}>
          {node.label}
        </h4>
        <p className="text-[10px] text-gray-500 font-mono border-t border-white/5 pt-2 mt-2 truncate">
          {node.detail}
        </p>
      </div>

      {/* Tech Tag Overlay */}
      <AnimatePresence>
        {isHighlighted && (
          <motion.div 
            initial={{ opacity: 0, x: 10 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0 }}
            className="absolute top-2 right-8"
          >
            <Activity size={12} className="text-blue-400 animate-pulse" />
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

const DataHighway = ({ active }) => (
  <div className="relative h-16 w-full flex justify-center items-center overflow-hidden py-2">
    {/* Static Optical Fiber */}
    <div className="absolute h-full w-[1px] bg-white/5 left-[calc(50%-1px)]" />
    <div className="absolute h-full w-[1px] bg-white/5 left-[calc(50%+1px)]" />
    
    {/* Moving Data Packets */}
    <AnimatePresence>
      {active && (
        <>
          <motion.div 
            initial={{ y: -60, opacity: 0 }}
            animate={{ y: 60, opacity: [0, 1, 1, 0] }}
            transition={{ duration: 1.2, repeat: Infinity, ease: "linear" }}
            className="absolute w-[2px] h-8 bg-gradient-to-b from-transparent via-blue-400 to-transparent shadow-[0_0_15px_#3b82f6] z-10"
          />
          <motion.div 
            initial={{ y: -60, opacity: 0 }}
            animate={{ y: 60, opacity: [0, 1, 1, 0] }}
            transition={{ duration: 1.2, repeat: Infinity, delay: 0.6, ease: "linear" }}
            className="absolute w-[2px] h-8 bg-gradient-to-b from-transparent via-purple-400 to-transparent shadow-[0_0_15px_#a855f7] z-10"
          />
        </>
      )}
    </AnimatePresence>
  </div>
);

const TerminalLog = ({ hoveredNode }) => {
  const [logs, setLogs] = useState([
    { time: "INIT", level: "SYS", msg: "Visualizer mounted. Waiting for input..." }
  ]);

  useEffect(() => {
    if (!hoveredNode) return;
    
    const timestamp = new Date().toISOString().split('T')[1].slice(0, 8);
    const newLog = {
      time: timestamp,
      level: "NET",
      msg: `Tracing active route > [${hoveredNode.toUpperCase()}]`
    };
    
    setLogs(prev => [newLog, ...prev].slice(0, 4));
  }, [hoveredNode]);

  return (
    <div className="w-full max-w-2xl mx-auto mt-16 rounded-xl border border-white/10 bg-[#050505] p-1 shadow-2xl relative overflow-hidden group">
      {/* Top Bar */}
      <div className="flex items-center gap-2 px-4 py-2 bg-white/5 border-b border-white/5">
        <div className="flex gap-1.5">
          <div className="w-2.5 h-2.5 rounded-full bg-red-500/20" />
          <div className="w-2.5 h-2.5 rounded-full bg-yellow-500/20" />
          <div className="w-2.5 h-2.5 rounded-full bg-green-500/20" />
        </div>
        <div className="flex-1 text-center">
           <span className="text-[10px] font-mono text-gray-500 flex items-center justify-center gap-2">
             <Terminal size={10} /> SYSTEM_DIAGNOSTICS
           </span>
        </div>
      </div>
      
      {/* Log Content */}
      <div className="p-4 font-mono text-[10px] md:text-xs h-32 overflow-hidden relative">
         {/* Scanline Effect */}
         <div className="absolute inset-0 bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.25)_50%),linear-gradient(90deg,rgba(255,0,0,0.06),rgba(0,255,0,0.02),rgba(0,0,255,0.06))] z-10 pointer-events-none bg-[length:100%_2px,3px_100%] pointer-events-none" />
         
         <div className="flex flex-col gap-1.5 relative z-0">
          {logs.map((log, i) => (
            <motion.div 
              key={i} 
              initial={{ opacity: 0, x: -10 }} 
              animate={{ opacity: 1 - (i * 0.2), x: 0 }}
              className="flex gap-3 items-center"
            >
              <span className="text-gray-600 w-16">{log.time}</span>
              <span className={`w-8 font-bold ${i === 0 ? 'text-blue-400' : 'text-gray-500'}`}>{log.level}</span>
              <span className={`${i === 0 ? 'text-gray-200' : 'text-gray-500'}`}>{log.msg}</span>
              {i === 0 && <span className="w-2 h-4 bg-blue-500 animate-pulse ml-1" />}
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
};

// --- MAIN COMPONENT ---

const ArchitectureDiagram = () => {
  const [hoveredNodeId, setHoveredNodeId] = useState(null);
  
  // Logic to calculate related nodes for highlighting (Preserved)
  const relatedNodeIds = useMemo(() => {
    if (!hoveredNodeId) return new Set();
    
    const related = new Set([hoveredNodeId]);
    
    // 1. Find direct children (downstream)
    const findChildren = (id) => {
      SYSTEM_DATA.forEach(layer => {
        layer.nodes.forEach(node => {
          if (node.id === id && node.downstream) {
            node.downstream.forEach(childId => related.add(childId));
          }
        });
      });
    };

    // 2. Find direct parents (upstream)
    const findParents = (targetId) => {
      SYSTEM_DATA.forEach(layer => {
        layer.nodes.forEach(node => {
          if (node.downstream && node.downstream.includes(targetId)) {
            related.add(node.id);
          }
        });
      });
    };

    findChildren(hoveredNodeId);
    findParents(hoveredNodeId);
    
    return related;
  }, [hoveredNodeId]);

  return (
    <section className="relative w-full py-24 z-10 overflow-hidden bg-[#030014]">
      
      {/* THEME: Circuit Background */}
      <CircuitPattern />
      
      {/* THEME: Global Gradient Overlay */}
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-[#030014] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 md:px-8 relative z-10">
        
        {/* Header Section */}
        <div className="text-center mb-16 space-y-4">
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-blue-500/20 bg-blue-500/5 mb-6 backdrop-blur-md"
          >
            <Zap className="w-3 h-3 text-blue-400 animate-pulse" />
            <span className="text-[10px] font-bold text-blue-200 uppercase tracking-widest font-mono">
              LIVE ARCHITECTURE VIEW
            </span>
          </motion.div>
          
          <motion.h2 
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            className="text-4xl md:text-5xl font-bold text-white mb-6"
          >
            Microservices <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-cyan-400">Topology</span>
          </motion.h2>
          <p className="text-gray-400 max-w-xl mx-auto text-sm md:text-base leading-relaxed">
            Interactive map of the CodEzy ecosystem. Hover over any node to trace the data pipeline and visualize downstream dependencies.
          </p>
        </div>

        {/* Diagram Stack */}
        <div className="flex flex-col items-center">
          {SYSTEM_DATA.map((layer, index) => (
            <React.Fragment key={layer.id}>
              
              {/* Connector (Skip for first) */}
              {index > 0 && <DataHighway active={!hoveredNodeId || relatedNodeIds.size > 1} />}

              {/* Layer Container */}
              <div className="relative w-full flex justify-center group/layer">
                
                {/* Layer Label - Floating Left */}
<div className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-4 hidden xl:flex flex-col items-end w-48 text-right pr-8 border-r border-white/5 py-4">
                  <span className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-1 group-hover/layer:text-blue-400 transition-colors">{layer.label}</span>
                  <span className="block text-[10px] text-gray-600 font-mono">{layer.description}</span>
                </div>

                {/* Nodes Grid */}
                <div className={`
                  grid gap-4 w-full max-w-4xl relative z-20 transition-all duration-500
                  ${layer.id === 'services' ? 'grid-cols-2 md:grid-cols-4' : 
                    layer.id === 'gateway' ? 'grid-cols-1 max-w-[240px]' : 
                    'grid-cols-1 md:grid-cols-2 lg:grid-cols-3'}
                `}>
                  {layer.nodes.map(node => {
                    const isRelated = relatedNodeIds.has(node.id);
                    const isDimmed = hoveredNodeId && !isRelated;
                    const isHighlighted = hoveredNodeId === node.id || (hoveredNodeId && isRelated);

                    return (
                      <NodeCard 
                        key={node.id}
                        node={node}
                        isDimmed={isDimmed}
                        isHighlighted={isHighlighted}
                        onHover={setHoveredNodeId}
                        onLeave={() => setHoveredNodeId(null)}
                      />
                    );
                  })}
                </div>
              </div>

            </React.Fragment>
          ))}
        </div>

        {/* Live Logs Footer */}
        <TerminalLog hoveredNode={hoveredNodeId} />
        
      </div>
    </section>
  );
};

export default ArchitectureDiagram;