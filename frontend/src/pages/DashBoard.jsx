import React, { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import {
  FiArrowRight,
  FiTrendingUp,
  FiZap,
  FiAward,
  FiChevronRight,
  FiBell,
  FiSearch,
} from "react-icons/fi";
import DailyChallenge from "../component/Dashboard/DailyChallenge";
import UserStatsWidget from "../component/Dashboard/UserStatsWidget";
import DashboardProblemList from "../component/Dashboard/DashboardProblemList";
import StreakCalendar from "../component/Dashboard/StreakCalendar";
import WorldChatWidget from "../component/Dashboard/WorldChatWidget";
import Navbar from "../component/Dashboard/NavBar";

// ─── CSS-in-JS animation keyframes injected once ─────────────────────────────
const GlobalStyles = () => (
  <style>{`
    @import url('https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;500;600;700&display=swap');

    * { box-sizing: border-box; }

    @keyframes shimmer {
      0% { background-position: -200% center; }
      100% { background-position: 200% center; }
    }

    @keyframes pulse-glow {
      0%, 100% { box-shadow: 0 0 0 0 rgba(99,102,241,0); }
      50% { box-shadow: 0 0 20px 2px rgba(99,102,241,0.12); }
    }

    @keyframes fade-in-up {
      from { opacity: 0; transform: translateY(12px); }
      to   { opacity: 1; transform: translateY(0); }
    }

    @keyframes dot-ping {
      0%   { transform: scale(1); opacity: 1; }
      100% { transform: scale(2.4); opacity: 0; }
    }

    .dashboard-card {
      transition: border-color 0.2s ease, transform 0.2s ease;
    }
    .dashboard-card:hover {
      border-color: rgba(99,102,241,0.2) !important;
    }

    .section-animate {
      animation: fade-in-up 0.4s ease both;
    }

    .live-dot::before {
      content: '';
      position: absolute;
      inset: 0;
      border-radius: 50%;
      background: #22c55e;
      animation: dot-ping 1.4s ease-out infinite;
    }

    .leaderboard-banner-btn:hover {
      background: rgba(99,102,241,0.9) !important;
      color: #fff !important;
      transform: translateX(2px);
    }

    .leaderboard-banner-btn {
      transition: all 0.18s ease;
    }

    .problem-list-wrapper {
      transition: all 0.2s ease;
    }

    .stat-chip {
      transition: background 0.15s ease, color 0.15s ease;
    }
    .stat-chip:hover {
      background: rgba(99,102,241,0.15) !important;
      color: #a5b4fc !important;
    }

    .section-label-line::after {
      content: '';
      flex: 1;
      height: 1px;
      background: rgba(255,255,255,0.04);
      margin-left: 12px;
    }

    .shimmer-text {
      background: linear-gradient(
        90deg,
        rgba(99,102,241,0.9) 0%,
        rgba(167,139,250,0.9) 30%,
        rgba(99,102,241,0.9) 60%
      );
      background-size: 200% auto;
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      background-clip: text;
      animation: shimmer 3s linear infinite;
    }

    ::-webkit-scrollbar { width: 4px; }
    ::-webkit-scrollbar-track { background: transparent; }
    ::-webkit-scrollbar-thumb { background: rgba(99,102,241,0.2); border-radius: 2px; }
    ::-webkit-scrollbar-thumb:hover { background: rgba(99,102,241,0.4); }
  `}</style>
);

// ─── Animated background grid ─────────────────────────────────────────────────
const BackgroundGrid = () => (
  <div
    className="pointer-events-none fixed inset-0 z-0"
    style={{
      backgroundImage: `
        linear-gradient(rgba(99,102,241,0.03) 1px, transparent 1px),
        linear-gradient(90deg, rgba(99,102,241,0.03) 1px, transparent 1px)
      `,
      backgroundSize: '48px 48px',
    }}
  />
);

// ─── Radial ambient glows ──────────────────────────────────────────────────────
const AmbientGlows = () => (
  <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden">
    <div
      style={{
        position: 'absolute',
        top: '-10%',
        left: '-5%',
        width: '50vw',
        height: '50vh',
        background: 'radial-gradient(ellipse, rgba(99,102,241,0.04) 0%, transparent 70%)',
      }}
    />
    <div
      style={{
        position: 'absolute',
        bottom: '10%',
        right: '-10%',
        width: '40vw',
        height: '40vh',
        background: 'radial-gradient(ellipse, rgba(139,92,246,0.04) 0%, transparent 70%)',
      }}
    />
  </div>
);

// ─── Quick stat chips in the greeting area ────────────────────────────────────
const QuickStats = () => {
  const stats = [
    { icon: FiZap, label: '12 day streak', color: '#f59e0b' },
    { icon: FiTrendingUp, label: '#47 global', color: '#10b981' },
    { icon: FiAward, label: '84 solved', color: '#6366f1' },
  ];

  return (
    <div className="flex flex-wrap items-center gap-2">
      {stats.map(({ icon: Icon, label, color }) => (
        <div
          key={label}
          className="stat-chip inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg cursor-default"
          style={{
            background: 'rgba(255,255,255,0.03)',
            border: '1px solid rgba(255,255,255,0.06)',
            fontFamily: "'JetBrains Mono', monospace",
            fontSize: '11px',
            color: 'rgba(255,255,255,0.45)',
            letterSpacing: '0.02em',
          }}
        >
          <Icon size={11} style={{ color }} />
          {label}
        </div>
      ))}
    </div>
  );
};

// ─── Page greeting with time-aware message ────────────────────────────────────
const GreetingHeader = () => {
  const hour = new Date().getHours();
  const greeting =
    hour < 12 ? 'good morning' : hour < 17 ? 'good afternoon' : 'good evening';

  return (
    <div
      className="flex flex-col gap-3 section-animate"
      style={{ animationDelay: '0ms' }}
    >
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <p
            style={{
              fontFamily: "'JetBrains Mono', monospace",
              fontSize: '11px',
              letterSpacing: '0.15em',
              color: 'rgba(99,102,241,0.7)',
              textTransform: 'uppercase',
              marginBottom: '4px',
            }}
          >
            // {greeting}
          </p>
          <h1
            style={{
              fontFamily: "'JetBrains Mono', monospace",
              fontSize: '22px',
              fontWeight: 700,
              color: '#fff',
              letterSpacing: '-0.02em',
              lineHeight: 1.2,
            }}
          >
            Ready to{' '}
            <span className="shimmer-text">level up</span>{' '}
            today?
          </h1>
        </div>

        {/* Header action buttons */}
        <div className="flex items-center gap-2">
          <button
            style={{
              background: 'rgba(255,255,255,0.04)',
              border: '1px solid rgba(255,255,255,0.07)',
              borderRadius: '10px',
              width: '36px',
              height: '36px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              color: 'rgba(255,255,255,0.4)',
              transition: 'all 0.15s ease',
            }}
            onMouseEnter={e => {
              e.currentTarget.style.background = 'rgba(99,102,241,0.12)';
              e.currentTarget.style.color = '#a5b4fc';
            }}
            onMouseLeave={e => {
              e.currentTarget.style.background = 'rgba(255,255,255,0.04)';
              e.currentTarget.style.color = 'rgba(255,255,255,0.4)';
            }}
          >
            <FiSearch size={15} />
          </button>
          <button
            style={{
              background: 'rgba(255,255,255,0.04)',
              border: '1px solid rgba(255,255,255,0.07)',
              borderRadius: '10px',
              width: '36px',
              height: '36px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              color: 'rgba(255,255,255,0.4)',
              position: 'relative',
              transition: 'all 0.15s ease',
            }}
            onMouseEnter={e => {
              e.currentTarget.style.background = 'rgba(99,102,241,0.12)';
              e.currentTarget.style.color = '#a5b4fc';
            }}
            onMouseLeave={e => {
              e.currentTarget.style.background = 'rgba(255,255,255,0.04)';
              e.currentTarget.style.color = 'rgba(255,255,255,0.4)';
            }}
          >
            <FiBell size={15} />
            <span
              style={{
                position: 'absolute',
                top: '8px',
                right: '8px',
                width: '6px',
                height: '6px',
                borderRadius: '50%',
                background: '#6366f1',
                border: '1.5px solid #080a0f',
              }}
            />
          </button>
        </div>
      </div>

      <QuickStats />
    </div>
  );
};

// ─── Leaderboard CTA banner ───────────────────────────────────────────────────
const LeaderboardBanner = () => (
  <div
    className="relative overflow-hidden rounded-2xl dashboard-card section-animate"
    style={{
      background: 'linear-gradient(110deg, #0d0f1a 0%, #0f0d1f 50%, #0d0f1a 100%)',
      border: '1px solid rgba(99,102,241,0.15)',
      padding: '20px 24px',
      animationDelay: '80ms',
    }}
  >
    {/* Layered ambient glows */}
    <div
      className="absolute inset-0 pointer-events-none"
      style={{
        background:
          'radial-gradient(ellipse 60% 100% at 90% 50%, rgba(99,102,241,0.08) 0%, transparent 70%)',
      }}
    />
    <div
      className="absolute inset-0 pointer-events-none"
      style={{
        background:
          'radial-gradient(ellipse 30% 60% at 10% 50%, rgba(139,92,246,0.05) 0%, transparent 70%)',
      }}
    />

    {/* Decorative corner accent */}
    <div
      className="absolute top-0 right-0 pointer-events-none"
      style={{
        width: '120px',
        height: '120px',
        background:
          'conic-gradient(from 200deg at 100% 0%, rgba(99,102,241,0.1) 0deg, transparent 60deg)',
      }}
    />

    <div className="relative flex items-center justify-between gap-4">
      <div className="flex flex-col gap-1.5">
        <div className="flex items-center gap-2">
          {/* Live indicator */}
          <span
            className="relative"
            style={{ width: '8px', height: '8px', display: 'inline-block' }}
          >
            <span
              className="live-dot"
              style={{
                position: 'absolute',
                inset: 0,
                borderRadius: '50%',
                background: '#22c55e',
                display: 'block',
              }}
            />
          </span>
          <span
            style={{
              fontFamily: "'JetBrains Mono', monospace",
              fontSize: '10px',
              fontWeight: 700,
              textTransform: 'uppercase',
              letterSpacing: '0.15em',
              color: 'rgba(99,102,241,0.65)',
            }}
          >
            Hall of Champions · Live
          </span>
        </div>

        <h3
          style={{
            fontFamily: "'JetBrains Mono', monospace",
            fontSize: '15px',
            fontWeight: 700,
            color: '#fff',
            lineHeight: 1.3,
            letterSpacing: '-0.01em',
          }}
        >
          Who dominates the global arena?
        </h3>
        <p
          style={{
            fontFamily: "'JetBrains Mono', monospace",
            fontSize: '11px',
            color: 'rgba(255,255,255,0.3)',
            letterSpacing: '0.01em',
          }}
        >
          Rankings update in real-time · logic, speed &amp; precision
        </p>
      </div>

      <Link
        to="/leaderboard"
        className="leaderboard-banner-btn flex-shrink-0 inline-flex items-center gap-2"
        style={{
          padding: '10px 18px',
          borderRadius: '12px',
          fontSize: '11px',
          fontWeight: 700,
          fontFamily: "'JetBrains Mono', monospace",
          letterSpacing: '0.08em',
          textTransform: 'uppercase',
          background: 'rgba(99,102,241,0.12)',
          border: '1px solid rgba(99,102,241,0.3)',
          color: '#a5b4fc',
          textDecoration: 'none',
          whiteSpace: 'nowrap',
        }}
      >
        View Board
        <FiArrowRight size={12} />
      </Link>
    </div>
  </div>
);

// ─── Section heading component ────────────────────────────────────────────────
const SectionHeading = ({ label, action, delay = 0 }) => (
  <div
    className="flex items-center justify-between mb-3 section-label-line section-animate"
    style={{ display: 'flex', animationDelay: `${delay}ms` }}
  >
    <span
      style={{
        fontFamily: "'JetBrains Mono', monospace",
        fontSize: '10px',
        fontWeight: 700,
        textTransform: 'uppercase',
        letterSpacing: '0.15em',
        color: 'rgba(255,255,255,0.22)',
      }}
    >
      {label}
    </span>
    {action && (
      <Link
        to={action.to}
        style={{
          fontFamily: "'JetBrains Mono', monospace",
          fontSize: '10px',
          fontWeight: 700,
          letterSpacing: '0.1em',
          color: 'rgba(255,255,255,0.25)',
          textDecoration: 'none',
          display: 'inline-flex',
          alignItems: 'center',
          gap: '4px',
          transition: 'color 0.15s ease',
          textTransform: 'uppercase',
        }}
        onMouseEnter={e => (e.currentTarget.style.color = '#a5b4fc')}
        onMouseLeave={e => (e.currentTarget.style.color = 'rgba(255,255,255,0.25)')}
      >
        {action.label}
        <FiArrowRight size={10} />
      </Link>
    )}
  </div>
);

// ─── Divider ──────────────────────────────────────────────────────────────────
const Divider = () => (
  <div style={{ height: '1px', background: 'rgba(255,255,255,0.04)', margin: '4px 0' }} />
);

// ─── Main Dashboard ───────────────────────────────────────────────────────────
const Dashboard = () => {
  return (
    <div
      style={{
        minHeight: '100vh',
        background: '#080a0f',
        fontFamily: "'JetBrains Mono', 'Fira Code', monospace",
        position: 'relative',
      }}
    >
      <GlobalStyles />
      <BackgroundGrid />
      <AmbientGlows />

      {/* Subtle noise texture */}
      <div
        className="pointer-events-none fixed inset-0 z-0"
        style={{
          opacity: 0.018,
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")`,
          backgroundSize: '200px 200px',
        }}
      />

      <div
        style={{
          position: 'relative',
          zIndex: 10,
          maxWidth: '1280px',
          margin: '0 auto',
          padding: '0 16px 48px',
        }}
      >
        {/* ── Sticky Navbar ── */}
        <div
          style={{
            position: 'sticky',
            top: 0,
            zIndex: 50,
            backdropFilter: 'blur(20px)',
            WebkitBackdropFilter: 'blur(20px)',
            background: 'rgba(8,10,15,0.85)',
            borderBottom: '1px solid rgba(255,255,255,0.04)',
            marginLeft: '-16px',
            marginRight: '-16px',
            paddingLeft: '16px',
            paddingRight: '16px',
          }}
        >
          <Navbar />
        </div>

        {/* ── Main content ── */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '28px', paddingTop: '28px' }}>

          {/* Greeting */}
          <GreetingHeader />

          {/* ── Row 1: Banner + Challenge | User Stats ── */}
          <div
            className="section-animate"
            style={{
              display: 'grid',
              gridTemplateColumns: 'minmax(0,1fr) 300px',
              gap: '20px',
              animationDelay: '100ms',
            }}
          >
            {/* Left: Banner + Daily Challenge stacked */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              <LeaderboardBanner />

              <div>
                <SectionHeading label="// today's challenge" delay={120} />
                <div
                  className="dashboard-card"
                  style={{
                    borderRadius: '16px',
                    overflow: 'hidden',
                    border: '1px solid rgba(255,255,255,0.06)',
                  }}
                >
                  <DailyChallenge />
                </div>
              </div>
            </div>

            {/* Right: User Stats */}
            <div
              className="section-animate"
              style={{ animationDelay: '140ms' }}
            >
              <div
                className="dashboard-card"
                style={{
                  borderRadius: '16px',
                  overflow: 'hidden',
                  border: '1px solid rgba(255,255,255,0.06)',
                  height: '100%',
                }}
              >
                <UserStatsWidget />
              </div>
            </div>
          </div>

          <Divider />

          {/* ── Row 2: Problems | Streak + Chat ── */}
          <div
            className="section-animate"
            style={{
              display: 'grid',
              gridTemplateColumns: 'minmax(0,1fr) 300px',
              gap: '20px',
              alignItems: 'start',
              animationDelay: '160ms',
            }}
          >
            {/* Left: Problem list */}
            <div>
              <SectionHeading
                label="// problem set"
                action={{ to: '/problems', label: '' }}
                delay={180}
              />
              <div
                className="dashboard-card problem-list-wrapper"
                style={{
                  borderRadius: '16px',
                  overflow: 'hidden',
                  background: '#0c0e15',
                  border: '1px solid rgba(255,255,255,0.06)',
                }}
              >
                <DashboardProblemList />
              </div>
            </div>

            {/* Right: Streak + Chat stacked */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              <div
                className="section-animate"
                style={{ animationDelay: '200ms' }}
              >
                <SectionHeading label="// streak" delay={200} />
                <div
                  className="dashboard-card"
                  style={{
                    borderRadius: '16px',
                    overflow: 'hidden',
                    border: '1px solid rgba(255,255,255,0.06)',
                  }}
                >
                  <StreakCalendar />
                </div>
              </div>

              <div
                className="section-animate"
                style={{ animationDelay: '240ms' }}
              >
                <SectionHeading label="// #world" delay={240} />
                <div
                  className="dashboard-card"
                  style={{
                    borderRadius: '16px',
                    overflow: 'hidden',
                    border: '1px solid rgba(255,255,255,0.06)',
                  }}
                >
                  <WorldChatWidget />
                </div>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default Dashboard;