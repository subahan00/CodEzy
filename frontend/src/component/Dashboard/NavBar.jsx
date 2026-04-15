import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { FiCode, FiBookOpen, FiCalendar, FiGlobe, FiBell, FiMenu, FiX, FiZap } from 'react-icons/fi';

const Navbar = () => {
  const location = useLocation();
  const user = JSON.parse(localStorage.getItem('user')) || { username: 'Guest', totalScore: 0 };
  const [mobileOpen, setMobileOpen] = useState(false);

  const navLinks = [
    { name: 'Explore',   path: '/dashboard', icon: FiGlobe  },
    { name: 'Problems',  path: '/problems',  icon: FiCode   },
    { name: 'Courses',   path: '/courses',   icon: FiBookOpen, badge: 'New' },
    { name: 'Leaderboard',    path: '/leaderboard',    icon: FiCalendar },
    { name: 'World Chat',path: '/chat',      icon: FiGlobe  },
  ];

  const isActive = (path) => location.pathname.includes(path);

  return (
    <>
      <nav
        style={{
          background: 'rgba(10, 11, 16, 0.92)',
          borderBottom: '1px solid rgba(255,255,255,0.06)',
          backdropFilter: 'blur(12px)',
          WebkitBackdropFilter: 'blur(12px)',
          fontFamily: "'JetBrains Mono', 'Fira Code', monospace",
        }}
        className="sticky top-0 z-50"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-14">

            {/* Logo */}
            <div className="flex items-center gap-8">
              <Link
                to="/dashboard"
                className="flex items-center gap-2.5 focus:outline-none group"
              >
                {/* Logo mark: a stylized `</>` terminal icon */}
                <div
                  className="w-7 h-7 rounded-lg flex items-center justify-center text-white font-extrabold text-xs"
                  style={{ background: '#6366f1', boxShadow: '0 0 14px rgba(99,102,241,0.4)' }}
                >
                  {'</>'}
                </div>
                <span
                  className="text-white font-bold text-base tracking-tight group-hover:text-indigo-300 transition-colors"
                  style={{ letterSpacing: '-0.01em' }}
                >
                  Cod<span style={{ color: '#6366f1' }}>Ezy</span>
                </span>
              </Link>

              {/* Desktop nav */}
              <div className="hidden md:flex items-center gap-1">
                {navLinks.map((link) => {
                  const active = isActive(link.path);
                  const Icon = link.icon;
                  return (
                    <Link
                      key={link.name}
                      to={link.path}
                      className="relative px-3 py-1.5 rounded-lg text-xs font-bold tracking-wide transition-all duration-150 flex items-center gap-2 focus:outline-none"
                      style={{
                        color: active ? '#818cf8' : '#52525b',
                        background: active ? 'rgba(99,102,241,0.1)' : 'transparent',
                        border: active ? '1px solid rgba(99,102,241,0.2)' : '1px solid transparent',
                      }}
                      onMouseEnter={e => {
                        if (!active) {
                          e.currentTarget.style.color = '#a1a1aa';
                          e.currentTarget.style.background = 'rgba(255,255,255,0.04)';
                        }
                      }}
                      onMouseLeave={e => {
                        if (!active) {
                          e.currentTarget.style.color = '#52525b';
                          e.currentTarget.style.background = 'transparent';
                        }
                      }}
                    >
                      <Icon size={12} />
                      {link.name}
                      {link.badge && (
                        <span
                          className="absolute -top-1.5 -right-1 text-[8px] px-1 py-0.5 rounded-full font-extrabold uppercase tracking-widest"
                          style={{ background: 'rgba(99,102,241,0.2)', color: '#818cf8', border: '1px solid rgba(99,102,241,0.3)' }}
                        >
                          {link.badge}
                        </span>
                      )}
                    </Link>
                  );
                })}
              </div>
            </div>

            {/* Right controls */}
            <div className="flex items-center gap-2 sm:gap-3">

              {/* Score chip */}
              <div
                className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-lg cursor-default"
                style={{
                  background: 'rgba(245,158,11,0.08)',
                  border: '1px solid rgba(245,158,11,0.15)',
                }}
                title="Your Total Score"
              >
                <FiZap size={11} className="text-amber-400" />
                <span className="text-amber-400 font-extrabold text-xs tracking-wide">
                  {user.totalScore || 0}
                </span>
              </div>

              {/* Notifications */}
              <button
                className="relative p-2 rounded-lg transition-colors focus:outline-none"
                style={{ color: '#52525b', background: 'transparent' }}
                aria-label="Notifications"
                onMouseEnter={e => { e.currentTarget.style.color = '#a1a1aa'; e.currentTarget.style.background = 'rgba(255,255,255,0.04)'; }}
                onMouseLeave={e => { e.currentTarget.style.color = '#52525b'; e.currentTarget.style.background = 'transparent'; }}
              >
                <FiBell size={16} />
                <span
                  className="absolute top-1.5 right-1.5 w-1.5 h-1.5 rounded-full"
                  style={{ background: '#f87171', boxShadow: '0 0 6px rgba(248,113,113,0.6)' }}
                />
              </button>

              {/* Avatar */}
              <Link
                to="/profile"
                className="flex items-center gap-2.5 focus:outline-none group"
                aria-label="Profile"
              >
                <div
                  className="w-8 h-8 rounded-lg flex items-center justify-center text-sm font-bold transition-all"
                  style={{
                    background: 'rgba(99,102,241,0.15)',
                    border: '1px solid rgba(99,102,241,0.25)',
                    color: '#818cf8',
                  }}
                >
                  {user.username?.charAt(0).toUpperCase()}
                </div>
              </Link>

              {/* Mobile hamburger */}
              <button
                className="md:hidden p-2 rounded-lg transition-colors focus:outline-none"
                style={{ color: '#52525b' }}
                onClick={() => setMobileOpen(v => !v)}
                aria-label="Toggle menu"
              >
                {mobileOpen ? <FiX size={18} /> : <FiMenu size={18} />}
              </button>
            </div>

          </div>
        </div>

        {/* Mobile menu */}
        {mobileOpen && (
          <div
            className="md:hidden px-4 pb-4 pt-2 flex flex-col gap-1"
            style={{ borderTop: '1px solid rgba(255,255,255,0.05)' }}
          >
            {navLinks.map(link => {
              const active = isActive(link.path);
              const Icon = link.icon;
              return (
                <Link
                  key={link.name}
                  to={link.path}
                  onClick={() => setMobileOpen(false)}
                  className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-bold tracking-wide transition-colors"
                  style={{
                    color: active ? '#818cf8' : '#52525b',
                    background: active ? 'rgba(99,102,241,0.1)' : 'transparent',
                  }}
                >
                  <Icon size={14} />
                  {link.name}
                  {link.badge && (
                    <span className="ml-auto text-[9px] px-1.5 py-0.5 rounded-full font-extrabold uppercase tracking-widest"
                      style={{ background: 'rgba(99,102,241,0.2)', color: '#818cf8' }}>
                      {link.badge}
                    </span>
                  )}
                </Link>
              );
            })}
          </div>
        )}
      </nav>
    </>
  );
};

export default Navbar;