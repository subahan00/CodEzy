import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { FiCode, FiBookOpen, FiCalendar, FiGlobe, FiBell, FiUser } from 'react-icons/fi';

const Navbar = () => {
  const location = useLocation();
  const user = JSON.parse(localStorage.getItem('user')) || { username: 'Guest', totalScore: 0 };

  const navLinks = [
    { name: 'Explore', path: '/dashboard', icon: <FiGlobe /> },
    { name: 'Problems', path: '/problems', icon: <FiCode /> },
    { name: 'Courses', path: '/courses', icon: <FiBookOpen />, badge: 'New' },
    { name: 'Events', path: '/events', icon: <FiCalendar /> },
    { name: 'World Chat', path: '/chat', icon: <FiGlobe /> }, // Temporary/Future
  ];

  return (
    <nav className="bg-white border-b border-slate-200 sticky top-0 z-50 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          
          {/* Left: Logo & Brand */}
          <div className="flex items-center gap-8">
            <Link 
              to="/dashboard" 
              className="flex items-center gap-2 focus:outline-none focus:ring-2 focus:ring-indigo-500 rounded-lg rounded-l-none"
            >
              <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center text-white font-bold text-xl shadow-sm">
                C
              </div>
              <span className="text-slate-800 font-bold text-xl tracking-tight">CodEzy</span>
            </Link>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center space-x-2">
              {navLinks.map((link) => {
                const isActive = location.pathname.includes(link.path);
                return (
                  <Link
                    key={link.name}
                    to={link.path}
                    className={`relative px-3 py-2 rounded-lg text-sm font-semibold transition-all flex items-center gap-2 focus:outline-none focus:ring-2 focus:ring-indigo-100
                      ${isActive 
                        ? 'text-indigo-700 bg-indigo-50' 
                        : 'text-slate-500 hover:text-indigo-600 hover:bg-slate-50'
                      }
                    `}
                  >
                    <span className={isActive ? 'text-indigo-600' : 'text-slate-400'}>
                      {link.icon}
                    </span>
                    {link.name}
                    
                    {link.badge && (
                      <span className="absolute -top-1 -right-1 bg-rose-100 text-rose-600 border border-rose-200 text-[9px] px-1.5 py-0.5 rounded-full font-bold uppercase tracking-wider">
                        {link.badge}
                      </span>
                    )}
                  </Link>
                );
              })}
            </div>
          </div>

          {/* Right: Controls & Profile */}
          <div className="flex items-center gap-3 sm:gap-5">
            
            {/* Gamification Snippet */}
            <div className="hidden sm:flex items-center gap-1.5 bg-amber-50 px-3 py-1.5 rounded-full border border-amber-200 cursor-default" title="Your Total Score">
              <span className="text-amber-500 text-sm">⚡</span>
              <span className="text-amber-700 font-bold text-sm tracking-wide">
                {user.totalScore || 0}
              </span>
            </div>

            {/* Notifications */}
            <button 
              className="text-slate-400 hover:text-indigo-600 bg-slate-50 hover:bg-indigo-50 p-2 rounded-full transition-colors relative focus:outline-none focus:ring-2 focus:ring-indigo-100"
              aria-label="View notifications"
            >
              <FiBell size={20} />
              {/* Notification Dot */}
              <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-rose-500 rounded-full border-2 border-white"></span>
            </button>

            {/* Profile Dropdown */}
            <Link 
              to="/profile" 
              className="flex items-center gap-2 group focus:outline-none"
              aria-label="View profile"
            >
              <div className="w-9 h-9 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-700 font-bold border-2 border-transparent group-hover:border-indigo-200 group-focus:border-indigo-300 transition-all shadow-sm">
                {user.username?.charAt(0).toUpperCase() || <FiUser size={18} />}
              </div>
            </Link>
            
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;