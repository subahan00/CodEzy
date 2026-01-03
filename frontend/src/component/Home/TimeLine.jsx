import React, { useRef } from "react";
import {
  motion,
  useScroll,
  useSpring
} from "framer-motion";
import {
  GitBranch,
  Shield,
  Cpu,
  Globe,
  Zap,
  CheckCircle2
} from "lucide-react";

/* ===================== DATA ===================== */

const MILESTONES = [
  {
    id: 1,
    title: "Foundation Layer",
    date: "Q1 2025",
    status: "completed",
    icon: Shield,
    description:
      "Core architecture deployment. Established Docker-based secure sandbox environments and low-latency API gateways.",
    tags: ["Docker", "Microservices", "Security"]
  },
  {
    id: 2,
    title: "Neural Integration",
    date: "Q2 2025",
    status: "active",
    icon: Cpu,
    description:
      "AI Feedback Module launch. Semantic reasoning, logic detection, and automated complexity scoring.",
    tags: ["LLM Heuristics", "AST Parsing", "Semantic Analysis"]
  },
  {
    id: 3,
    title: "The Arena (Beta)",
    date: "Q3 2025",
    status: "upcoming",
    icon: Zap,
    description:
      "Real-time 1v1 duels, matchmaking engine, and Redis-backed state sync under 50ms.",
    tags: ["WebSockets", "Redis", "Realtime"]
  },
  {
    id: 4,
    title: "Global Mesh & Scale",
    date: "Q4 2025",
    status: "upcoming",
    icon: Globe,
    description:
      "Expansion to 40+ edge regions with enterprise and academic API access.",
    tags: ["Edge Computing", "Enterprise API", "Scaling"]
  }
];

/* ===================== STATUS STYLES ===================== */

const STATUS_STYLES = {
  completed: {
    dot: "bg-emerald-400 shadow-[0_0_12px_rgba(52,211,153,0.9)]",
    badge: "bg-emerald-500/15 text-emerald-300 border-emerald-500/40",
    glow: "hover:shadow-[0_0_40px_rgba(52,211,153,0.15)]"
  },
  active: {
    dot: "bg-blue-400 shadow-[0_0_16px_rgba(59,130,246,1)] animate-pulse",
    badge: "bg-blue-500/20 text-blue-300 border-blue-500/50",
    glow: "hover:shadow-[0_0_50px_rgba(59,130,246,0.2)]"
  },
  upcoming: {
    dot: "bg-gray-600",
    badge: "bg-white/5 text-gray-400 border-white/10",
    glow: "hover:shadow-[0_0_30px_rgba(255,255,255,0.06)]"
  }
};

/* ===================== CARD ===================== */

const TimelineCard = ({ item, index }) => {
  const isEven = index % 2 === 0;
  const Icon = item.icon;

  return (
    <motion.div
      initial={{ opacity: 0, y: 60 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-120px" }}
      transition={{ duration: 0.7, delay: index * 0.15 }}
      className={`relative flex w-full mb-16 md:mb-28 ${
        isEven ? "md:flex-row-reverse" : "md:flex-row"
      }`}
    >
      {/* Spacer */}
      <div className="hidden md:block w-5/12" />

      {/* Center Node */}
      <div className="absolute left-4 md:left-1/2 -translate-x-1/2 z-20">
        <div className="relative w-9 h-9 rounded-full bg-black border border-white/20 flex items-center justify-center">
          <div
            className={`absolute inset-0 rounded-full blur-md opacity-40 ${STATUS_STYLES[item.status].dot}`}
          />
          {item.status === "completed" ? (
            <CheckCircle2 className="w-4 h-4 text-emerald-400 relative z-10" />
          ) : (
            <div
              className={`w-2.5 h-2.5 rounded-full relative z-10 ${STATUS_STYLES[item.status].dot}`}
            />
          )}
        </div>
      </div>

      {/* Card */}
      <div className="w-[calc(100%-3rem)] ml-12 md:ml-0 md:w-5/12">
        <motion.div
          whileHover={{ y: -6 }}
          transition={{ type: "spring", stiffness: 200, damping: 20 }}
          className={`
            relative p-6 rounded-2xl
            border border-white/10
            bg-gradient-to-b from-[#0c0c14]/90 to-[#08080d]/90
            backdrop-blur-md
            transition-all duration-300
            ${STATUS_STYLES[item.status].glow}
          `}
        >
          {/* Connector */}
          <div
            className={`hidden md:block absolute top-1/2 -translate-y-1/2 w-8 h-px bg-blue-500/30 ${
              isEven ? "right-[-2rem]" : "left-[-2rem]"
            }`}
          />

          {/* Header */}
          <div className="flex items-center justify-between mb-4">
            <span
              className={`text-xs font-bold px-2 py-1 rounded border ${STATUS_STYLES[item.status].badge}`}
            >
              {item.date}
            </span>
            <Icon className="w-5 h-5 text-gray-500" />
          </div>

          {/* Content */}
          <h3 className="text-xl font-bold text-white mb-2">
            {item.title}
          </h3>
          <p className="text-sm text-gray-400 leading-relaxed mb-4">
            {item.description}
          </p>

          {/* Tags */}
          <div className="flex flex-wrap gap-2">
            {item.tags.map(tag => (
              <span
                key={tag}
                className="text-[10px] font-mono uppercase tracking-wider
                text-gray-500 bg-black/40 border border-white/5
                px-2 py-1 rounded-md"
              >
                {tag}
              </span>
            ))}
          </div>

          {/* Active Badge */}
          {item.status === "active" && (
            <div className="absolute -top-2 -right-2 px-2 py-0.5
              text-[10px] font-bold uppercase tracking-wider
              bg-blue-500 text-black rounded">
              LIVE
            </div>
          )}
        </motion.div>
      </div>
    </motion.div>
  );
};

/* ===================== TIMELINE ===================== */

const Timeline = () => {
  const containerRef = useRef(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start end", "end start"]
  });

  const scaleY = useSpring(scrollYProgress, {
    stiffness: 100,
    damping: 30
  });

  return (
    <section ref={containerRef} className="relative w-full py-32 overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 md:px-8">

        {/* Header */}
        <div className="text-center mb-24">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full
            border border-purple-500/30 bg-purple-900/10 mb-6 backdrop-blur-md">
            <GitBranch className="w-3 h-3 text-purple-400" />
            <span className="text-[10px] font-bold text-purple-200 uppercase tracking-widest">
              System Evolution
            </span>
          </div>

          <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
            Development Roadmap
          </h2>
          <p className="text-gray-400 max-w-2xl mx-auto">
            Tracing CodEzy’s execution path from core infrastructure to global scale.
          </p>
        </div>

        {/* Timeline */}
        <div className="relative">
          {/* Base Line */}
          <div className="absolute left-4 md:left-1/2 top-0 bottom-0 w-px bg-white/5 -translate-x-1/2" />

          {/* Animated Line */}
          <motion.div
            style={{ scaleY, originY: 0 }}
            className="absolute left-4 md:left-1/2 top-0 bottom-0
              w-[2px] bg-gradient-to-b
              from-blue-500 via-purple-500 to-transparent
              -translate-x-1/2
              shadow-[0_0_30px_rgba(99,102,241,0.6)]"
          />

          {/* Cards */}
          {MILESTONES.map((item, index) => (
            <TimelineCard key={item.id} item={item} index={index} />
          ))}
        </div>
      </div>
    </section>
  );
};

export default Timeline;
