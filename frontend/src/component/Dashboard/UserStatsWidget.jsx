import React from 'react';
import { FiTrendingUp, FiAward, FiCheckCircle, FiCode, FiExternalLink } from 'react-icons/fi';
import { Link } from 'react-router-dom';

const UserStatsWidget = () => {
  const user = JSON.parse(localStorage.getItem('user')) || {
    username: 'Guest',
    statistics: { totalScore: 120, problemsSolved: 15 }
  };

  const rank = 'Beginner';
  const solved = user.statistics?.problemsSolved || 0;
  const score = user.statistics?.totalScore || 0;

  // Progress toward next rank (arbitrary example thresholds)
  const nextRankAt = 30;
  const progress = Math.min((solved / nextRankAt) * 100, 100);

  return (
    <div
      style={{
        background: '#0f1117',
        border: '1px solid rgba(255,255,255,0.07)',
        fontFamily: "'JetBrains Mono', 'Fira Code', monospace",
      }}
      className="rounded-2xl p-5 sm:p-6 flex flex-col gap-5"
    >
      {/* Profile Header */}
      <div className="flex items-center gap-4">
        {/* Avatar */}
        <div
          className="relative w-12 h-12 rounded-xl flex items-center justify-center text-lg font-bold flex-shrink-0"
          style={{
            background: 'rgba(99,102,241,0.15)',
            border: '1px solid rgba(99,102,241,0.3)',
            color: '#818cf8',
          }}
        >
          {user.username?.charAt(0).toUpperCase()}
          {/* Online dot */}
          <span
            className="absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full border-2"
            style={{ background: '#34d399', borderColor: '#0f1117' }}
          />
        </div>

        <div className="flex flex-col gap-1 min-w-0">
          <h3 className="text-white font-bold text-base leading-tight truncate">
            {user.username}
          </h3>
          <span
            className="inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-[0.12em] px-2 py-0.5 rounded-md w-fit"
            style={{
              color: '#818cf8',
              background: 'rgba(99,102,241,0.1)',
              border: '1px solid rgba(99,102,241,0.2)',
            }}
          >
            <FiTrendingUp size={9} />
            {rank}
          </span>
        </div>
      </div>

      {/* Divider */}
      <div style={{ borderTop: '1px solid rgba(255,255,255,0.05)' }} />

      {/* Stats */}
      <div className="grid grid-cols-2 gap-3">
        <div
          className="rounded-xl p-3.5 flex flex-col gap-2"
          style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}
        >
          <div className="flex items-center gap-1.5">
            <FiCheckCircle size={11} className="text-emerald-400" />
            <span className="text-[10px] font-bold uppercase tracking-[0.12em] text-zinc-500">Solved</span>
          </div>
          <span className="text-2xl font-extrabold text-white">{solved}</span>
        </div>

        <div
          className="rounded-xl p-3.5 flex flex-col gap-2"
          style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}
        >
          <div className="flex items-center gap-1.5">
            <FiAward size={11} className="text-amber-400" />
            <span className="text-[10px] font-bold uppercase tracking-[0.12em] text-zinc-500">Score</span>
          </div>
          <span className="text-2xl font-extrabold text-amber-400">{score}</span>
        </div>
      </div>

      {/* Rank Progress */}
      <div className="flex flex-col gap-2">
        <div className="flex justify-between items-center">
          <span className="text-[10px] font-bold uppercase tracking-[0.12em] text-zinc-600">
            Progress to Intermediate
          </span>
          <span className="text-[10px] font-bold text-zinc-500">{solved}/{nextRankAt}</span>
        </div>
        <div
          className="w-full h-1.5 rounded-full overflow-hidden"
          style={{ background: 'rgba(255,255,255,0.06)' }}
        >
          <div
            className="h-full rounded-full transition-all duration-700"
            style={{
              width: `${progress}%`,
              background: 'linear-gradient(90deg, #6366f1, #818cf8)',
            }}
          />
        </div>
      </div>

      {/* CTA */}
      <Link
        to="/profile"
        className="flex items-center justify-center gap-2 w-full py-2.5 rounded-xl text-xs font-bold tracking-wide transition-all duration-200 focus:outline-none"
        style={{
          color: '#71717a',
          background: 'rgba(255,255,255,0.03)',
          border: '1px solid rgba(255,255,255,0.06)',
        }}
        onMouseEnter={e => {
          e.currentTarget.style.color = '#818cf8';
          e.currentTarget.style.borderColor = 'rgba(99,102,241,0.3)';
          e.currentTarget.style.background = 'rgba(99,102,241,0.06)';
        }}
        onMouseLeave={e => {
          e.currentTarget.style.color = '#71717a';
          e.currentTarget.style.borderColor = 'rgba(255,255,255,0.06)';
          e.currentTarget.style.background = 'rgba(255,255,255,0.03)';
        }}
      >
        <FiExternalLink size={12} />
        View Full Profile
      </Link>
    </div>
  );
};

export default UserStatsWidget;