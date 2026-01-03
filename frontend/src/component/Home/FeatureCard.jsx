// FeatureCard.jsx
import React from "react";
import { ChevronRight } from "lucide-react";

/**
 * FeatureCard (Enhanced)
 * Matches "The Void 2.1" aesthetic with HUD-like markings and deep glass effects
 */
const FeatureCard = ({ icon: Icon, title, description, delay }) => (
  <div className={`group relative p-8 rounded-2xl bg-white/[0.02] border border-white/5 hover:bg-white/[0.04] transition-all duration-500 hover:-translate-y-1 reveal-text ${delay}`}>
    
    {/* Tech Accents - HUD Corners */}
    <div className="absolute top-0 left-0 w-2 h-2 border-l border-t border-white/10 group-hover:border-blue-500/50 transition-colors duration-500" />
    <div className="absolute top-0 right-0 w-2 h-2 border-r border-t border-white/10 group-hover:border-purple-500/50 transition-colors duration-500" />
    <div className="absolute bottom-0 left-0 w-2 h-2 border-l border-b border-white/10 group-hover:border-purple-500/50 transition-colors duration-500" />
    <div className="absolute bottom-0 right-0 w-2 h-2 border-r border-b border-white/10 group-hover:border-blue-500/50 transition-colors duration-500" />

    {/* Hover Glow Gradient */}
    <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 via-transparent to-purple-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-2xl" />

    <div className="relative z-10">
      <div className="w-12 h-12 rounded-lg bg-white/5 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-500 border border-white/10 group-hover:border-blue-500/30 group-hover:shadow-[0_0_20px_rgba(59,130,246,0.2)]">
        <Icon className="w-6 h-6 text-gray-400 group-hover:text-white transition-colors duration-300" />
      </div>
      
      <h3 className="text-xl font-bold text-white mb-3 group-hover:text-blue-400 transition-colors font-mono tracking-tight">
        {title}
      </h3>
      
      <p className="text-sm text-gray-500 leading-relaxed group-hover:text-gray-400 transition-colors">
        {description}
      </p>

      {/* Learn More Link (appears on hover) */}
      <div className="mt-6 flex items-center gap-2 text-xs font-mono text-blue-400 opacity-0 transform translate-x-[-10px] group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-300">
        <span className="uppercase tracking-widest">Explore</span>
        <ChevronRight className="w-3 h-3" />
      </div>
    </div>
  </div>
);

export default FeatureCard;