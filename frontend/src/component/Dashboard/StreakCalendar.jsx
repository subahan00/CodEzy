import React, { useState } from 'react';
import { FiChevronLeft, FiChevronRight, FiZap } from 'react-icons/fi';

const StreakCalendar = () => {
  const [currentDate, setCurrentDate] = useState(new Date());

  const solvedDates = new Set([
    '2026-04-01', '2026-04-02', '2026-04-03',
    '2026-03-28', '2026-03-29', '2026-03-31'
  ]);

  const currentStreak = 3;
  const longestStreak = 11; // added for richer UI

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const firstDayOfMonth = new Date(year, month, 1).getDay();

  const prevMonth = () => setCurrentDate(new Date(year, month - 1, 1));
  const nextMonth = () => setCurrentDate(new Date(year, month + 1, 1));

  const formatDate = (d) =>
    `${year}-${String(month + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;

  const isToday = (d) => {
    const today = new Date();
    return today.getDate() === d && today.getMonth() === month && today.getFullYear() === year;
  };

  const isFuture = (d) => {
    const cellDate = new Date(year, month, d);
    return cellDate > new Date();
  };

  const daysOfWeek = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];
  const monthNames = [
    'January','February','March','April','May','June',
    'July','August','September','October','November','December'
  ];

  return (
    <div
      style={{
        background: '#0f1117',
        border: '1px solid rgba(255,255,255,0.07)',
        fontFamily: "'JetBrains Mono', 'Fira Code', monospace",
      }}
      className="rounded-2xl p-5 sm:p-6 flex flex-col gap-5"
    >
      {/* Header */}
      <div className="flex justify-between items-start">
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-2">
            <div
              className="w-7 h-7 rounded-lg flex items-center justify-center"
              style={{ background: 'rgba(245,158,11,0.12)', border: '1px solid rgba(245,158,11,0.2)' }}
            >
              <FiZap size={13} className="text-amber-400" />
            </div>
            <h3 className="text-white font-bold text-sm tracking-wide">Activity Streak</h3>
          </div>
          <p className="text-zinc-600 text-[11px] tracking-wide ml-9">Keep shipping every day</p>
        </div>

        {/* Streak stats inline */}
        <div className="flex items-center gap-3">
          <div className="flex flex-col items-end gap-0.5">
            <span className="text-[10px] font-bold uppercase tracking-[0.12em] text-zinc-600">Current</span>
            <span className="text-xl font-extrabold text-amber-400 leading-none">{currentStreak}
              <span className="text-xs font-bold text-zinc-600 ml-1">d</span>
            </span>
          </div>
          <div style={{ width: '1px', height: '28px', background: 'rgba(255,255,255,0.07)' }} />
          <div className="flex flex-col items-end gap-0.5">
            <span className="text-[10px] font-bold uppercase tracking-[0.12em] text-zinc-600">Best</span>
            <span className="text-xl font-extrabold text-zinc-400 leading-none">{longestStreak}
              <span className="text-xs font-bold text-zinc-600 ml-1">d</span>
            </span>
          </div>
        </div>
      </div>

      {/* Divider */}
      <div style={{ borderTop: '1px solid rgba(255,255,255,0.05)' }} />

      {/* Calendar */}
      <div className="flex flex-col gap-3">

        {/* Month nav */}
        <div className="flex justify-between items-center">
          <button
            onClick={prevMonth}
            className="p-1.5 rounded-lg transition-colors focus:outline-none"
            style={{ color: '#52525b', background: 'transparent' }}
            onMouseEnter={e => { e.currentTarget.style.color = '#a1a1aa'; e.currentTarget.style.background = 'rgba(255,255,255,0.05)'; }}
            onMouseLeave={e => { e.currentTarget.style.color = '#52525b'; e.currentTarget.style.background = 'transparent'; }}
            aria-label="Previous month"
          >
            <FiChevronLeft size={16} />
          </button>

          <span className="text-zinc-300 font-bold text-xs tracking-[0.08em] uppercase">
            {monthNames[month]} {year}
          </span>

          <button
            onClick={nextMonth}
            className="p-1.5 rounded-lg transition-colors focus:outline-none"
            style={{ color: '#52525b', background: 'transparent' }}
            onMouseEnter={e => { e.currentTarget.style.color = '#a1a1aa'; e.currentTarget.style.background = 'rgba(255,255,255,0.05)'; }}
            onMouseLeave={e => { e.currentTarget.style.color = '#52525b'; e.currentTarget.style.background = 'transparent'; }}
            aria-label="Next month"
          >
            <FiChevronRight size={16} />
          </button>
        </div>

        {/* Day headers */}
        <div className="grid grid-cols-7 gap-1">
          {daysOfWeek.map(day => (
            <div
              key={day}
              className="text-center text-[9px] font-bold uppercase tracking-widest"
              style={{ color: '#3f3f46' }}
            >
              {day}
            </div>
          ))}
        </div>

        {/* Calendar grid */}
        <div className="grid grid-cols-7 gap-1">
          {Array.from({ length: firstDayOfMonth }).map((_, i) => (
            <div key={`empty-${i}`} />
          ))}

          {Array.from({ length: daysInMonth }).map((_, i) => {
            const dayNum = i + 1;
            const dateStr = formatDate(dayNum);
            const solved = solvedDates.has(dateStr);
            const today = isToday(dayNum);
            const future = isFuture(dayNum);

            return (
              <div
                key={dayNum}
                className="aspect-square flex items-center justify-center rounded-lg relative text-[11px] font-bold transition-all duration-150"
                title={solved ? '✓ Problem solved' : today ? 'Today' : ''}
                style={{
                  background: solved
                    ? 'rgba(245,158,11,0.18)'
                    : today
                    ? 'rgba(99,102,241,0.12)'
                    : 'rgba(255,255,255,0.025)',
                  border: solved
                    ? '1px solid rgba(245,158,11,0.35)'
                    : today
                    ? '1px solid rgba(99,102,241,0.4)'
                    : '1px solid transparent',
                  color: solved
                    ? '#fbbf24'
                    : today
                    ? '#818cf8'
                    : future
                    ? '#27272a'
                    : '#52525b',
                  cursor: solved ? 'default' : 'default',
                }}
              >
                {dayNum}
                {solved && (
                  <span
                    className="absolute -top-1 -right-1 text-[8px] leading-none"
                    style={{ filter: 'drop-shadow(0 0 3px rgba(245,158,11,0.5))' }}
                  >
                    🔥
                  </span>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Legend */}
      <div className="flex items-center gap-3 pt-1">
        <span className="text-[10px] font-bold uppercase tracking-widest text-zinc-700">Legend</span>
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-3 rounded-sm" style={{ background: 'rgba(245,158,11,0.18)', border: '1px solid rgba(245,158,11,0.35)' }} />
          <span className="text-[10px] text-zinc-600">Solved</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-3 rounded-sm" style={{ background: 'rgba(99,102,241,0.12)', border: '1px solid rgba(99,102,241,0.4)' }} />
          <span className="text-[10px] text-zinc-600">Today</span>
        </div>
      </div>
    </div>
  );
};

export default StreakCalendar;