import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { 
  FiZap, FiTrendingUp, FiChevronUp, FiChevronDown, 
  FiMinus, FiSearch, FiRefreshCw 
} from 'react-icons/fi';
import { GiCrossedSwords } from 'react-icons/gi';
import Navbar from '../../component/Dashboard/Navbar'; 
import LeaderboardService from '../../services/leaderboardService/leaderboardService';
const CATEGORIES = ['global', 'beginner', 'intermediate', 'advanced'];

const PODIUM_CFG = [
  { rankLabel: '02', barH: 'h-32', borderColor: '#94a3b8', glowColor: 'rgba(148,163,184,0.15)', textColor: '#cbd5e1', bg: 'rgba(148,163,184,0.08)', medal: '🥈' },
  { rankLabel: '01', barH: 'h-48', borderColor: '#eab308', glowColor: 'rgba(234,179,8,0.2)', textColor: '#fde047', bg: 'rgba(234,179,8,0.1)', medal: '🥇' },
  { rankLabel: '03', barH: 'h-24', borderColor: '#b45309', glowColor: 'rgba(180,83,9,0.15)', textColor: '#d97706', bg: 'rgba(180,83,9,0.08)', medal: '🥉' },
];

const ELO_TIER = (elo) => {
  if (elo >= 2000) return { label: 'GRANDMASTER', color: '#e879f9', bg: 'rgba(232,121,249,0.1)' };
  if (elo >= 1800) return { label: 'MASTER',      color: '#f87171', bg: 'rgba(248,113,113,0.1)' };
  if (elo >= 1600) return { label: 'DIAMOND',     color: '#60a5fa', bg: 'rgba(96,165,250,0.1)' };
  if (elo >= 1400) return { label: 'PLATINUM',    color: '#34d399', bg: 'rgba(52,211,153,0.1)' };
  if (elo >= 1200) return { label: 'GOLD',        color: '#fbbf24', bg: 'rgba(251,191,36,0.1)' };
  if (elo >= 1000) return { label: 'SILVER',      color: '#94a3b8', bg: 'rgba(148,163,184,0.1)' };
  return            { label: 'BRONZE',      color: '#d97706', bg: 'rgba(217,119,6,0.1)' };
};


const globalCSS = `
  @import url('https://fonts.googleapis.com/css2?family=Syne+Mono&family=Syne:wght@400;600;700;800;900&display=swap');

  body { background-color: #05050A; } /* Deeper background */

  .glass-panel {
    background: rgba(15, 17, 30, 0.6);
    backdrop-filter: blur(16px);
    -webkit-backdrop-filter: blur(16px);
    border: 1px solid rgba(255, 255, 255, 0.05);
  }

  .lb-row {
    transition: all 0.2s ease;
    animation: rowIn 0.4s ease both;
  }
  .lb-row:hover {
    background: rgba(99, 102, 241, 0.08) !important;
  }
  .lb-row.is-me {
    background: linear-gradient(90deg, rgba(99,102,241,0.15) 0%, rgba(99,102,241,0.05) 100%) !important;
    border-left: 3px solid #818cf8;
  }
  
  .search-input {
    background: rgba(255,255,255,0.03);
    border: 1px solid rgba(255,255,255,0.1);
    transition: all 0.2s ease;
  }
  .search-input:focus {
    background: rgba(255,255,255,0.06);
    border-color: rgba(99,102,241,0.5);
    outline: none;
    box-shadow: 0 0 0 3px rgba(99,102,241,0.1);
  }

  .cat-btn {
    transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
    font-family: 'Syne Mono', monospace;
    font-size: 11px;
    letter-spacing: 0.08em;
    text-transform: uppercase;
    padding: 8px 16px;
    border-radius: 8px;
    font-weight: 600;
    border: 1px solid transparent;
    cursor: pointer;
  }
  .cat-btn.active {
    background: rgba(99,102,241,0.2);
    border-color: rgba(99,102,241,0.5);
    color: #e0e7ff;
    box-shadow: 0 4px 12px rgba(99,102,241,0.15);
  }
  .cat-btn.inactive { background: transparent; color: rgba(148,163,184,0.6); }
  .cat-btn.inactive:hover { color: #f8fafc; background: rgba(255,255,255,0.03); }

  @keyframes rowIn {
    from { opacity: 0; transform: translateY(10px); }
    to   { opacity: 1; transform: translateY(0);    }
  }
  @keyframes spin { 100% { transform: rotate(360deg); } }
  .animate-spin-slow { animation: spin 1s linear infinite; }

  /* Premium thin scrollbar */
  .custom-scrollbar::-webkit-scrollbar { width: 6px; }
  .custom-scrollbar::-webkit-scrollbar-track { background: rgba(0,0,0,0.2); border-radius: 8px; }
  .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(99,102,241,0.3); border-radius: 8px; }
  .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: rgba(99,102,241,0.5); }
`;

const Delta = ({ delta }) => {
  if (!delta) return <FiMinus size={12} style={{ color: 'rgba(148,163,184,0.3)' }} />;
  return (
    <span className="flex items-center gap-0.5" style={{ 
      color: delta > 0 ? '#4ade80' : '#f87171', 
      fontSize: 11, 
      fontFamily: "'Syne Mono', monospace" 
    }}>
      {delta > 0 ? <FiChevronUp size={12}/> : <FiChevronDown size={12}/>}
      {Math.abs(delta)}
    </span>
  );
};

const Avatar = ({ name, size = 40, highlight }) => (
  <div style={{
    width: size, height: size, borderRadius: '12px',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    background: highlight ? 'linear-gradient(135deg, rgba(99,102,241,0.4), rgba(99,102,241,0.1))' : 'rgba(255,255,255,0.03)',
    border: `1px solid ${highlight ? 'rgba(99,102,241,0.5)' : 'rgba(255,255,255,0.08)'}`,
    fontFamily: "'Syne', sans-serif", fontWeight: 800, fontSize: size * 0.4,
    color: highlight ? '#ffffff' : 'rgba(148,163,184,0.8)',
    flexShrink: 0,
  }}>
    {(name || '?').charAt(0).toUpperCase()}
  </div>
);

const TierBadge = ({ elo }) => {
  const tier = ELO_TIER(elo);
  return (
    <span style={{
      fontSize: 10, fontFamily: "'Syne Mono', monospace", fontWeight: 700,
      letterSpacing: '0.1em', color: tier.color, background: tier.bg,
      border: `1px solid ${tier.color}40`, padding: '4px 8px', borderRadius: 6,
    }}>
      {tier.label}
    </span>
  );
};

const PodiumCard = ({ user, cfg, animDelay }) => {
  if (!user) return null;
  const isGold = cfg.rankLabel === '01';

  return (
    <div className="flex flex-col items-center flex-1" style={{ maxWidth: 220, animation: `rowIn 0.6s ${animDelay}s ease both` }}>
      <div className="text-center mb-4 flex flex-col items-center">
        <div style={{
          width: isGold ? 80 : 64, height: isGold ? 80 : 64, borderRadius: '16px',
          margin: '0 auto 12px', display: 'flex', alignItems: 'center', justifyContent: 'center',
          background: cfg.bg, border: `2px solid ${cfg.borderColor}`,
          boxShadow: `0 8px 32px ${cfg.glowColor}, inset 0 2px 10px rgba(255,255,255,0.1)`,
          fontFamily: "'Syne', sans-serif", fontWeight: 900, fontSize: isGold ? 32 : 24, color: cfg.textColor,
        }}>
          {user.username.charAt(0).toUpperCase()}
        </div>
        <div className="font-bold truncate px-2" style={{
          maxWidth: 180, fontFamily: "'Syne', sans-serif", fontSize: isGold ? 16 : 14, color: isGold ? '#ffffff' : '#e2e8f0',
        }}>
          {user.username}
        </div>
        <div style={{ fontFamily: "'Syne Mono', monospace", fontSize: isGold ? 15 : 13, color: cfg.textColor, marginTop: 4 }}>
          {user.elo} <span style={{ fontSize: 10, opacity: 0.7 }}>ELO</span>
        </div>
      </div>

      <div className={`glass-panel w-full flex flex-col items-center justify-between pt-5 pb-4 rounded-t-2xl relative overflow-hidden ${cfg.barH}`}
        style={{ borderTop: `3px solid ${cfg.borderColor}`, borderBottom: 'none' }}>
        <span style={{ fontSize: isGold ? 28 : 22, zIndex: 2, filter: 'drop-shadow(0 4px 6px rgba(0,0,0,0.5))' }}>{cfg.medal}</span>
        <span style={{
          position: 'absolute', bottom: -10, right: 0, fontFamily: "'Syne', sans-serif",
          fontWeight: 900, fontSize: isGold ? 80 : 60, color: `${cfg.borderColor}15`, zIndex: 1, pointerEvents: 'none',
        }}>
          {cfg.rankLabel}
        </span>
      </div>
    </div>
  );
};

const SkeletonRow = ({ delay }) => (
  <tr style={{ animationDelay: `${delay}ms` }} className="lb-row border-b border-white/5">
    {[1, 2, 3, 4, 5].map((i) => (
      <td key={i} className="p-4">
        <div className="animate-pulse bg-white/5 rounded" style={{ height: 16, width: i === 2 ? '60%' : '40%', margin: i===1||i>2 ? '0 auto' : '0' }} />
      </td>
    ))}
  </tr>
);



const LeaderboardPage = () => {
  const [leaderboardData, setLeaderboardData] = useState([]);
  const [isLoading, setIsLoading]             = useState(true);
  const [isRefreshing, setIsRefreshing]       = useState(false);
  const [category, setCategory]               = useState('global');
  const [sortKey, setSortKey]                 = useState('elo');
  const [sortDir, setSortDir]                 = useState('desc');
  const [searchQuery, setSearchQuery]         = useState('');

  const currentUser = (() => {
    try { return JSON.parse(localStorage.getItem('user')) || {}; }
    catch { return {}; }
  })();

 

  const fetchData = async (showRefreshSpin = false) => {
    if (showRefreshSpin) setIsRefreshing(true);
    else setIsLoading(true);
    
    try {
     const res = await LeaderboardService.getLeaderboard(category);
     console.log(res.data.data);
     setLeaderboardData(res.data.data || []);
    } catch (e) {
      console.error('Leaderboard fetch failed:', e);
      setLeaderboardData([]); // Fallback to empty state
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  useEffect(() => { fetchData(); }, [category]);

  // Filter & Sort Pipeline
  const filteredData = leaderboardData.filter(user => 
    user.username.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const sorted = [...filteredData].sort((a, b) => {
    const v = sortDir === 'desc' ? -1 : 1;
    if (sortKey === 'elo')            return (a.elo - b.elo) * v;
    if (sortKey === 'duelsWon')       return ((a.duelsWon ?? 0) - (b.duelsWon ?? 0)) * v;
    if (sortKey === 'problemsSolved') return ((a.problemsSolved ?? 0) - (b.problemsSolved ?? 0)) * v;
    return 0;
  });

  const isSearching = searchQuery.trim().length > 0;
  
  // Only show top 3 podium if we aren't actively searching/filtering out the top guys
  const showPodium = !isSearching && sorted.length >= 3;
  const topThree = showPodium ? sorted.slice(0, 3) : [];
  const theRest  = showPodium ? sorted.slice(3) : sorted;

  const podiumDisplay = topThree.length === 3
    ? [{ user: topThree[1], cfg: PODIUM_CFG[0] }, { user: topThree[0], cfg: PODIUM_CFG[1] }, { user: topThree[2], cfg: PODIUM_CFG[2] }]
    : [];

  const toggleSort = (key) => {
    if (sortKey === key) setSortDir(d => d === 'desc' ? 'asc' : 'desc');
    else { setSortKey(key); setSortDir('desc'); }
  };

  const SortIcon = ({ col }) => {
    if (sortKey !== col) return <FiMinus size={12} className="opacity-30" />;
    return sortDir === 'desc' ? <FiChevronDown size={14} className="text-indigo-400" /> : <FiChevronUp size={14} className="text-indigo-400" />;
  };

  return (
    <>
      <style>{globalCSS}</style>
      <div style={{ minHeight: '100vh', color: '#f8fafc', fontFamily: "'Syne', sans-serif" }}>
        <Navbar />

        {/* ── HEADER ────────────────────────────────────── */}
        <header className="relative border-b border-indigo-500/10 bg-gradient-to-b from-indigo-500/5 to-transparent pt-12 pb-8">
          <div className="max-w-6xl mx-auto px-6">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-8">
              
              {/* Title & Meta */}
              <div>
                <div className="flex items-center gap-3 mb-3">
                  <span className="text-[11px] font-mono tracking-[0.25em] text-indigo-400/80 uppercase">
                    ◈ CodEzy Rankings
                  </span>
                  <button onClick={() => fetchData(true)} disabled={isRefreshing || isLoading}
                    className="p-1.5 rounded-md hover:bg-white/5 text-slate-400 hover:text-white transition-colors disabled:opacity-50">
                    <FiRefreshCw size={12} className={isRefreshing ? 'animate-spin-slow' : ''} />
                  </button>
                </div>
                <h1 className="text-4xl md:text-5xl font-black tracking-tight leading-none mb-3">
                  Global <span className="bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent">Leaderboard</span>
                </h1>
                <p className="text-sm font-mono text-slate-400">
                  {leaderboardData.length} active competitors · Updated in real-time
                </p>
              </div>

              {/* Controls (Filters & Search) */}
              <div className="flex flex-col sm:flex-row gap-4 items-center">
                {/* Search Bar */}
                <div className="relative w-full sm:w-64">
                  <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                  <input 
                    type="text" 
                    placeholder="Search player..." 
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="search-input w-full pl-10 pr-4 py-2.5 rounded-xl text-sm font-mono text-white placeholder-slate-500"
                  />
                </div>

                {/* Category Pills */}
                <div className="flex gap-1 glass-panel rounded-xl p-1.5 w-full sm:w-auto overflow-x-auto custom-scrollbar">
                  {CATEGORIES.map(cat => (
                    <button key={cat} onClick={() => setCategory(cat)}
                      className={`cat-btn whitespace-nowrap ${category === cat ? 'active' : 'inactive'}`}>
                      {cat}
                    </button>
                  ))}
                </div>
              </div>

            </div>
          </div>
        </header>

        <main className="max-w-6xl mx-auto px-6 py-12">
          
          {/* ── PODIUM (Hidden if searching) ──────────────── */}
          {!isLoading && showPodium && (
            <section className="mb-20">
              <div className="flex items-end justify-center gap-4 md:gap-8 px-4">
                {podiumDisplay.map(({ user, cfg }, i) => (
                  <PodiumCard key={user.userId || i} user={user} cfg={cfg} animDelay={0.1 * i} />
                ))}
              </div>
              <div className="h-[1px] w-full bg-gradient-to-r from-transparent via-indigo-500/30 to-transparent mt-0" />
            </section>
          )}

          {/* ── TABLE LIST ─────────────────────────────────── */}
          <section>
            <div className="glass-panel rounded-2xl overflow-hidden shadow-2xl border border-indigo-500/10">
              <div className="max-h-[600px] overflow-y-auto custom-scrollbar">
                <table className="w-full border-collapse relative">
                  <thead className="sticky top-0 z-10 backdrop-blur-xl bg-[#0B0D18]/90 border-b border-indigo-500/10 shadow-sm">
                    <tr>
                      {[
                        { label: 'Rank',      key: null,             style: 'w-20 text-center' },
                        { label: 'Competitor',key: null,             style: 'text-left' },
                        { label: 'Tier',      key: null,             style: 'w-32 text-center hidden md:table-cell' },
                        { label: 'Duels',     key: 'duelsWon',       style: 'w-28 text-center hidden sm:table-cell' },
                        { label: 'Solved',    key: 'problemsSolved', style: 'w-28 text-center hidden sm:table-cell' },
                        { label: 'Rating',    key: 'elo',            style: 'w-32 text-right pr-8' }
                      ].map(({ label, key, style }) => (
                        <th key={label} onClick={() => key && toggleSort(key)}
                          className={`${style} py-4 px-4 text-[10px] font-mono tracking-[0.2em] uppercase transition-colors
                            ${key ? 'cursor-pointer hover:bg-white/5' : ''} 
                            ${sortKey === key ? 'text-indigo-400 font-bold' : 'text-slate-400 font-semibold'}`}>
                          <div className={`flex items-center gap-2 ${style.includes('text-right') ? 'justify-end' : style.includes('text-center') ? 'justify-center' : ''}`}>
                            {label} {key && <SortIcon col={key} />}
                          </div>
                        </th>
                      ))}
                    </tr>
                  </thead>

                  <tbody>
                    {isLoading ? (
                      Array.from({ length: 7 }).map((_, i) => <SkeletonRow key={i} delay={i * 50} />)
                    ) : theRest.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="py-20 text-center">
                          <div className="flex flex-col items-center gap-3 text-slate-500">
                            <GiCrossedSwords size={32} className="opacity-20" />
                            <p className="font-mono text-sm tracking-wide">
                              {isSearching ? `No competitor found for "${searchQuery}"` : "Arena is currently empty."}
                            </p>
                            {isSearching && (
                              <button onClick={() => setSearchQuery('')} className="text-xs text-indigo-400 hover:underline mt-2">
                                Clear search
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ) : (
                      theRest.map((user, idx) => {
                        const isMe = user.username === currentUser?.username;
                        // Calculate actual rank based on search/filters
                        const actualRank = isSearching ? sorted.indexOf(user) + 1 : (showPodium ? idx + 4 : idx + 1);

                        return (
                          <tr key={user.userId || idx} 
                            className={`lb-row border-b border-white/[0.03] ${isMe ? 'is-me' : ''}`}
                            style={{ animationDelay: `${(idx % 10) * 30}ms` }}>
                            
                            {/* Rank */}
                            <td className="py-4 px-4 text-center">
                              <span className="font-mono text-sm font-bold text-slate-500">
                                #{String(actualRank).padStart(2, '0')}
                              </span>
                            </td>

                            {/* Player */}
                            <td className="py-4 px-4">
                              <div className="flex items-center gap-4">
                                <Avatar name={user.username} highlight={isMe} />
                                <div>
                                  <div className="flex items-center gap-2">
                                    <span className={`font-bold text-[15px] ${isMe ? 'text-indigo-300' : 'text-slate-200'}`}>
                                      {user.username}
                                    </span>
                                    {isMe && (
                                      <span className="text-[9px] font-mono font-bold tracking-wider text-indigo-300 bg-indigo-500/20 border border-indigo-500/30 px-2 py-0.5 rounded">
                                        YOU
                                      </span>
                                    )}
                                  </div>
                                  {user.delta != null && <div className="mt-1"><Delta delta={user.delta} /></div>}
                                </div>
                              </div>
                            </td>

                            {/* Tier badge */}
                            <td className="py-4 px-4 text-center hidden md:table-cell">
                              <TierBadge elo={user.elo} />
                            </td>

                            {/* Duels */}
                            <td className="py-4 px-4 text-center hidden sm:table-cell">
                              <span className="inline-flex items-center justify-center gap-1.5 text-sm font-mono text-red-400/80 bg-red-400/10 px-2.5 py-1 rounded-md">
                                <GiCrossedSwords size={12} /> {user.duelsWon ?? '0'}
                              </span>
                            </td>

                            {/* Solved */}
                            <td className="py-4 px-4 text-center hidden sm:table-cell">
                              <span className="inline-flex items-center justify-center gap-1.5 text-sm font-mono text-emerald-400/80 bg-emerald-400/10 px-2.5 py-1 rounded-md">
                                <FiZap size={12} /> {user.problemsSolved ?? '0'}
                              </span>
                            </td>

                            {/* Elo */}
                            <td className="py-4 px-8 text-right">
                              <div className="font-mono text-lg font-bold" style={{ color: ELO_TIER(user.elo).color }}>
                                {user.elo}
                              </div>
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </section>
        </main>
      </div>
    </>
  );
};

export default LeaderboardPage;