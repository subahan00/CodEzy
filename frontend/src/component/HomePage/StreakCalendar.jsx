import React, { useState } from 'react';
import { FiZap, FiChevronLeft, FiChevronRight } from 'react-icons/fi';

const StreakCalendar = () => {
  // Use current date as the starting point
  const [currentDate, setCurrentDate] = useState(new Date());

  // Placeholder data: A Set of date strings (YYYY-MM-DD) that the user solved.
  // Using some dummy dates for demonstration. In reality, fetch this from your API.
  const solvedDates = new Set([
    '2026-04-01', '2026-04-02', '2026-04-03', // Assuming current month is April 2026
    '2026-03-28', '2026-03-29', '2026-03-31'
  ]);

  const currentStreak = 3; // Calculate this from backend data

  // --- Calendar Logic ---
  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  // Get total days in the current month
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  
  // Get the day of the week the month starts on (0 = Sunday, 1 = Monday, etc.)
  const firstDayOfMonth = new Date(year, month, 1).getDay();

  // Navigation handlers
  const prevMonth = () => setCurrentDate(new Date(year, month - 1, 1));
  const nextMonth = () => setCurrentDate(new Date(year, month + 1, 1));

  // Helper to format date as YYYY-MM-DD for checking against our Set
  const formatDate = (d) => {
    const formattedMonth = String(month + 1).padStart(2, '0');
    const formattedDay = String(d).padStart(2, '0');
    return `${year}-${formattedMonth}-${formattedDay}`;
  };

  const daysOfWeek = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];
  const monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

  // Check if a specific date is "Today" just for UI highlighting
  const isToday = (d) => {
    const today = new Date();
    return today.getDate() === d && today.getMonth() === month && today.getFullYear() === year;
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5 sm:p-6">
      
      {/* Header: Streak Info */}
      <div className="flex justify-between items-end mb-6">
        <div>
          <h3 className="text-slate-800 font-bold flex items-center gap-2 text-lg">
            <div className="bg-amber-100 p-1.5 rounded-lg">
              <FiZap className="text-amber-500" />
            </div>
            Current Streak
          </h3>
          <p className="text-slate-500 text-sm mt-1 font-medium">Keep the momentum going!</p>
        </div>
        <div className="flex items-baseline gap-1 text-slate-800">
          <span className="text-3xl font-extrabold">{currentStreak}</span>
          <span className="text-sm font-semibold text-slate-400">days</span>
        </div>
      </div>

      {/* Calendar Section */}
      <div className="bg-slate-50 rounded-xl p-4 border border-slate-100">
        
        {/* Month Navigation */}
        <div className="flex justify-between items-center mb-4">
          <button 
            onClick={prevMonth}
            className="p-1.5 rounded-md text-slate-400 hover:text-slate-700 hover:bg-slate-200 transition-colors focus:outline-none focus:ring-2 focus:ring-slate-300"
            aria-label="Previous month"
          >
            <FiChevronLeft size={20} />
          </button>
          <span className="font-bold text-slate-700 text-sm tracking-wide">
            {monthNames[month]} {year}
          </span>
          <button 
            onClick={nextMonth}
            className="p-1.5 rounded-md text-slate-400 hover:text-slate-700 hover:bg-slate-200 transition-colors focus:outline-none focus:ring-2 focus:ring-slate-300"
            aria-label="Next month"
          >
            <FiChevronRight size={20} />
          </button>
        </div>

        {/* Days of the Week */}
        <div className="grid grid-cols-7 gap-1 mb-2">
          {daysOfWeek.map(day => (
            <div key={day} className="text-center text-[11px] font-bold text-slate-400 uppercase tracking-wider">
              {day}
            </div>
          ))}
        </div>

        {/* Calendar Grid */}
        <div className="grid grid-cols-7 gap-1 sm:gap-2">
          {/* Empty cells for days before the 1st of the month */}
          {Array.from({ length: firstDayOfMonth }).map((_, i) => (
            <div key={`empty-${i}`} className="w-8 h-8 sm:w-10 sm:h-10"></div>
          ))}

          {/* Actual days of the month */}
          {Array.from({ length: daysInMonth }).map((_, i) => {
            const dayNum = i + 1;
            const dateString = formatDate(dayNum);
            const isSolved = solvedDates.has(dateString);
            const todayStatus = isToday(dayNum);

            return (
              <div 
                key={dayNum} 
                className="flex justify-center items-center"
              >
                <div 
                  className={`relative w-8 h-8 sm:w-10 sm:h-10 rounded-xl flex items-center justify-center text-sm font-semibold transition-all
                    ${isSolved 
                      ? 'bg-amber-100 text-amber-700 border border-amber-300 shadow-sm' 
                      : 'text-slate-600 hover:bg-slate-200 border border-transparent'
                    }
                    ${todayStatus && !isSolved ? 'ring-2 ring-indigo-400 ring-offset-1 bg-white' : ''}
                  `}
                  title={isSolved ? 'Problem Solved!' : 'Unsolved'}
                >
                  {dayNum}
                  
                  {/* Tiny fire icon for solved days */}
                  {isSolved && (
                    <span className="absolute -bottom-1.5 -right-1.5 text-[10px]">🔥</span>
                  )}
                </div>
              </div>
            );
          })}
        </div>

      </div>
    </div>
  );
};

export default StreakCalendar;