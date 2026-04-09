import React from 'react';
import { FiPlay, FiClock, FiCalendar, FiTerminal } from 'react-icons/fi';
import { Link } from 'react-router-dom';

const DailyChallenge = () => {
  const dailyProblem = {
    title: "Reverse a Linked List",
    difficulty: "Medium",
    slug: "reverse-a-linked-list",
    tags: ["Linked List", "Recursion"]
  };

  const getDifficultyConfig = (diff) => {
    switch (diff.toLowerCase()) {
      case 'easy':   return { color: 'text-emerald-400', bg: 'bg-emerald-400/10', border: 'border-emerald-400/20', dot: 'bg-emerald-400' };
      case 'medium': return { color: 'text-amber-400',   bg: 'bg-amber-400/10',   border: 'border-amber-400/20',   dot: 'bg-amber-400'   };
      case 'hard':   return { color: 'text-rose-400',    bg: 'bg-rose-400/10',    border: 'border-rose-400/20',    dot: 'bg-rose-400'    };
      default:       return { color: 'text-zinc-400',    bg: 'bg-zinc-400/10',    border: 'border-zinc-400/20',    dot: 'bg-zinc-400'    };
    }
  };

  const diff = getDifficultyConfig(dailyProblem.difficulty);

  return (
    <div
      style={{
        background: 'linear-gradient(135deg, #0f1117 0%, #141720 100%)',
        borderColor: 'rgba(255,255,255,0.07)',
        fontFamily: "'JetBrains Mono', 'Fira Code', monospace",
      }}
      className="relative overflow-hidden border rounded-2xl p-6 sm:p-7 group transition-all duration-300 hover:border-indigo-500/30"
    >
      {/* Subtle grid texture */}
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.025]"
        style={{
          backgroundImage: 'linear-gradient(rgba(255,255,255,.5) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.5) 1px, transparent 1px)',
          backgroundSize: '32px 32px',
        }}
      />

      {/* Indigo accent line on left */}
      <div className="absolute left-0 top-6 bottom-6 w-[2px] rounded-full bg-indigo-500/60" />

      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6 relative">

        {/* Left */}
        <div className="flex-1 min-w-0">

          {/* Top metadata */}
          <div className="flex items-center gap-3 mb-4">
            <span
              className="inline-flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-[0.15em] px-2.5 py-1.5 rounded-md border"
              style={{ color: '#818cf8', background: 'rgba(99,102,241,0.1)', borderColor: 'rgba(99,102,241,0.2)' }}
            >
              <FiCalendar size={10} />
              Daily Challenge
            </span>
            <span className="text-zinc-500 text-xs flex items-center gap-1.5 font-medium tracking-wide">
              <FiClock size={11} className="text-zinc-600" />
              14h 22m left
            </span>
          </div>

          {/* Title */}
          <h2
            style={{ fontFamily: "'DM Mono', 'JetBrains Mono', monospace" }}
            className="text-xl sm:text-2xl font-bold text-white mb-4 leading-snug hover:text-indigo-300 transition-colors"
          >
            <Link to={`/problem/${dailyProblem.slug}`}>
              <span className="text-indigo-500/60 mr-2 text-lg font-normal select-none">{'>'}</span>
              {dailyProblem.title}
            </Link>
          </h2>

          {/* Tags */}
          <div className="flex flex-wrap items-center gap-2">
            {/* Difficulty */}
            <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[11px] font-bold border ${diff.bg} ${diff.color} ${diff.border}`}>
              <span className={`w-1.5 h-1.5 rounded-full ${diff.dot}`} />
              {dailyProblem.difficulty}
            </span>

            <span className="text-zinc-700 text-xs select-none">/</span>

            {dailyProblem.tags.map(tag => (
              <span
                key={tag}
                className="px-2.5 py-1 rounded-md text-[11px] font-medium tracking-wide cursor-default transition-colors"
                style={{ background: 'rgba(255,255,255,0.04)', color: '#71717a', border: '1px solid rgba(255,255,255,0.07)' }}
              >
                {tag}
              </span>
            ))}
          </div>
        </div>

        {/* Right: CTA */}
        <div className="w-full sm:w-auto flex-shrink-0">
          <Link
            to={`/problem/${dailyProblem.slug}`}
            className="group/btn w-full sm:w-auto inline-flex items-center justify-center gap-2.5 px-6 py-3 rounded-xl font-bold text-sm tracking-wide transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/40"
            style={{
              background: 'rgba(99,102,241,1)',
              color: '#fff',
              boxShadow: '0 0 20px rgba(99,102,241,0.25)',
            }}
            onMouseEnter={e => e.currentTarget.style.boxShadow = '0 0 30px rgba(99,102,241,0.4)'}
            onMouseLeave={e => e.currentTarget.style.boxShadow = '0 0 20px rgba(99,102,241,0.25)'}
          >
            <FiPlay size={14} className="fill-current" />
            Solve Now
          </Link>
        </div>

      </div>
    </div>
  );
};

export default DailyChallenge;