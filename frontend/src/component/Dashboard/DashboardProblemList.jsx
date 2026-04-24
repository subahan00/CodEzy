import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { FiCheckCircle, FiCircle, FiPlay } from 'react-icons/fi';
import problemService from '../../services/problemService/problemService';

const DashboardProblemList = () => {
  const [problems, setProblems] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProblems = async () => {
      try {
        const response = await problemService.getAllProblems();
        setProblems((response.data.data || []));
      } catch (error) {
        console.error("Failed to fetch problems", error);
      } finally {
        setLoading(false);
      }
    };
    fetchProblems();
  }, []);

  const getDifficultyConfig = (diff) => {
    switch (diff?.toLowerCase()) {
      case 'easy':   case 'beginner':
        return { color: 'text-emerald-400', bg: 'rgba(52,211,153,0.08)', border: 'rgba(52,211,153,0.2)', dot: '#34d399' };
      case 'medium': case 'intermediate':
        return { color: 'text-amber-400',   bg: 'rgba(251,191,36,0.08)', border: 'rgba(251,191,36,0.2)', dot: '#fbbf24' };
      case 'hard':   case 'advanced':
        return { color: 'text-rose-400',    bg: 'rgba(248,113,113,0.08)',border: 'rgba(248,113,113,0.2)',dot: '#f87171' };
      default:
        return { color: 'text-zinc-400',    bg: 'rgba(113,113,122,0.08)',border: 'rgba(113,113,122,0.2)',dot: '#71717a' };
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col divide-y" style={{ divideColor: 'rgba(255,255,255,0.04)' }}>
        {[...Array(5)].map((_, i) => (
          <div key={i} className="flex items-center gap-4 px-5 py-4 animate-pulse">
            <div className="w-4 h-4 rounded-full bg-zinc-800 flex-shrink-0" />
            <div className="flex-1 space-y-2">
              <div className="h-3 bg-zinc-800 rounded w-2/3" />
              <div className="h-2.5 bg-zinc-800/60 rounded w-16" />
            </div>
            <div className="w-7 h-7 rounded-lg bg-zinc-800 flex-shrink-0" />
          </div>
        ))}
      </div>
    );
  }

  if (problems.length === 0) {
    return (
      <div
        className="py-14 flex flex-col items-center gap-3 text-center px-6"
        style={{ fontFamily: "'JetBrains Mono', monospace" }}
      >
        <span
          className="text-2xl w-10 h-10 rounded-xl flex items-center justify-center"
          style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)' }}
        >
          {'{}'}
        </span>
        <p className="text-zinc-500 text-xs font-bold tracking-wide">No problems yet.</p>
        <p className="text-zinc-700 text-[11px]">Check back later for new challenges.</p>
      </div>
    );
  }

  return (
    <ul
      className="flex flex-col"
      style={{ fontFamily: "'JetBrains Mono', 'Fira Code', monospace" }}
    >
      {problems.map((problem, idx) => {
        const diff = getDifficultyConfig(problem.difficulty);
        return (
          <li
            key={problem._id}
            style={{ borderBottom: idx < problems.length - 1 ? '1px solid rgba(255,255,255,0.04)' : 'none' }}
          >
            <div
              className="group flex items-center justify-between px-5 py-4 transition-all duration-150"
              style={{ background: 'transparent' }}
              onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.025)'}
              onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
            >
              <div className="flex items-center gap-4 min-w-0">
                {/* Index number */}
                <span
                  className="text-[11px] font-bold w-5 text-right flex-shrink-0"
                  style={{ color: '#3f3f46' }}
                >
                  {String(idx + 1).padStart(2, '0')}
                </span>

                {/* Status icon */}
                <div className="flex-shrink-0">
                  {problem.isSolved ? (
                    <FiCheckCircle size={14} className="text-emerald-400" />
                  ) : (
                    <FiCircle size={14} style={{ color: '#3f3f46' }} className="group-hover:text-zinc-600 transition-colors" />
                  )}
                </div>

                {/* Title + difficulty */}
                <div className="flex flex-col gap-1.5 min-w-0">
                  <Link
                    to={`/problem/${problem.slug}`}
                    className="text-xs font-bold text-zinc-300 hover:text-white transition-colors truncate block"
                  >
                    {problem.title}
                  </Link>
                  <span
                    className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-md w-fit capitalize"
                    style={{
                      color: diff.color.replace('text-', '').includes('-') ? undefined : diff.color,
                      background: diff.bg,
                      border: `1px solid ${diff.border}`,
                      // tailwind color classes handled separately
                    }}
                  >
                    <span
                      className="w-1 h-1 rounded-full flex-shrink-0"
                      style={{ background: diff.dot }}
                    />
                    <span className={diff.color}>{problem.difficulty}</span>
                  </span>
                </div>
              </div>

              {/* Play button */}
              <Link
                to={`/problem/${problem.slug}`}
                className="flex-shrink-0 ml-4 w-8 h-8 rounded-lg flex items-center justify-center transition-all duration-150 focus:outline-none"
                style={{ color: '#3f3f46', background: 'transparent', border: '1px solid transparent' }}
                onMouseEnter={e => {
                  e.currentTarget.style.color = '#818cf8';
                  e.currentTarget.style.background = 'rgba(99,102,241,0.1)';
                  e.currentTarget.style.borderColor = 'rgba(99,102,241,0.2)';
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.color = '#3f3f46';
                  e.currentTarget.style.background = 'transparent';
                  e.currentTarget.style.borderColor = 'transparent';
                }}
                aria-label={`Solve ${problem.title}`}
              >
                <FiPlay size={12} fill="currentColor" className="ml-px" />
              </Link>
            </div>
          </li>
        );
      })}
    </ul>
  );
};

export default DashboardProblemList;