import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  FiArrowLeft, FiActivity, FiTarget, FiZap,
  FiCalendar, FiCode, FiAward, FiTrendingUp
} from 'react-icons/fi';

import profileService from '../services/userService/profileService';
import StatCard from '../component/Analytics/StatCard';
import SkillMasteryPanel from '../component/Analytics/SkillMasteryPanel';
import WeaknessPanel from '../component/Analytics/WeaknessPanel';
import RecommendationCard from '../component/Analytics/RecommendationCard';
import { JourneyChart, VelocityChart } from '../component/Analytics/ProgressCharts';

const SectionCard = ({ title, icon: Icon, iconColor = 'text-indigo-400', children }) => (
  <div className="bg-[#0b0914] border border-gray-800/60 rounded-xl p-6">
    <h3 className="text-xs uppercase tracking-widest font-bold text-gray-500 mb-5 flex items-center gap-2">
      <Icon size={13} className={iconColor} /> {title}
    </h3>
    {children}
  </div>
);

const AnalyticsPage = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    profileService.fetchAnalytics()
      .then(setData)
      .catch(() => setError('Failed to load analytics.'))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return (
    <div className="min-h-screen bg-[#06040f] flex flex-col items-center justify-center text-indigo-400 font-mono text-sm tracking-widest uppercase">
      <div className="w-10 h-10 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin mb-4" />
      Compiling your stats...
    </div>
  );

  if (error) return (
    <div className="min-h-screen bg-[#06040f] flex items-center justify-center text-red-400 font-mono">
      {error}
    </div>
  );

  const {
    totalSubmissions, totalAccepted, totalFailed, acceptanceRate, totalSolved,
    solvedByDifficulty, cumulativeJourney, weeklyVelocity,
    skillMastery, nearUnlock, failureProfile, languageBreakdown,
    hardestSolved, activeDaysLast30, currentStreak, longestStreak,
    totalScore, recommendation
  } = data;

  const topLang = Object.entries(languageBreakdown || {}).sort((a, b) => b[1] - a[1])[0];

  return (
    <div className="min-h-screen bg-[#06040f] text-gray-200 p-6 md:p-10 font-sans">
      <div className="max-w-6xl mx-auto space-y-6">

        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <Link to="/profile" className="flex items-center gap-2 text-gray-500 hover:text-white text-xs font-mono uppercase tracking-widest transition-colors mb-3">
              <FiArrowLeft size={12} /> Back to Profile
            </Link>
            <h1 className="text-2xl font-black text-white tracking-tight">Analytics & Insights</h1>
            <p className="text-gray-500 text-sm mt-1">Your full learning intelligence report</p>
          </div>
          <div className="text-right hidden md:block">
            <div className="text-3xl font-black font-mono text-yellow-400">{totalScore}</div>
            <div className="text-[10px] uppercase tracking-widest text-gray-600 font-mono">Total Score</div>
          </div>
        </div>

        {/* AI Recommendation — prominent at top */}
        <RecommendationCard recommendation={recommendation} />

        {/* Top stat row */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <StatCard label="Problems Solved" value={totalSolved} color="text-white" />
          <StatCard label="Acceptance Rate" value={`${acceptanceRate}%`} color="text-cyan-400" sub={`${totalAccepted} accepted`} />
          <StatCard label="Current Streak" value={currentStreak} color="text-emerald-400" sub={`Best: ${longestStreak} days`} />
          <StatCard label="Active Days (30d)" value={activeDaysLast30} color="text-indigo-400" sub="out of 30" />
        </div>

        {/* Submission breakdown */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <StatCard label="Total Submissions" value={totalSubmissions} color="text-white" />
          <StatCard label="Accepted" value={totalAccepted} color="text-emerald-400" />
          <StatCard label="Failed" value={totalFailed} color="text-red-400" />
          <StatCard label="Preferred Language" value={topLang ? topLang[0] : '—'} color="text-purple-400" sub={topLang ? `${topLang[1]} submissions` : ''} />
        </div>

        {/* Difficulty breakdown */}
        <SectionCard title="Difficulty Breakdown" icon={FiTarget} iconColor="text-yellow-400">
          <div className="grid grid-cols-3 gap-4 text-center">
            {[
              { label: 'Beginner', key: 'beginner', color: 'text-emerald-400' },
              { label: 'Intermediate', key: 'intermediate', color: 'text-yellow-400' },
              { label: 'Advanced', key: 'advanced', color: 'text-red-400' },
            ].map(({ label, key, color }) => (
              <div key={key} className="bg-[#0d0b18] rounded-lg p-4 border border-gray-800/40">
                <div className={`text-3xl font-black font-mono ${color}`}>{solvedByDifficulty[key]}</div>
                <div className="text-[10px] uppercase tracking-widest text-gray-600 mt-1 font-mono">{label}</div>
                <div className="w-full bg-[#161423] h-1 rounded-full mt-3 overflow-hidden">
                  <div
                    className={`h-full rounded-full ${color.replace('text-', 'bg-')}`}
                    style={{ width: `${totalSolved ? (solvedByDifficulty[key] / totalSolved) * 100 : 0}%` }}
                  />
                </div>
              </div>
            ))}
          </div>

          {hardestSolved && (
            <div className="mt-4 flex items-center gap-3 bg-[#0d0b18] rounded-lg border border-gray-800/40 p-4">
              <FiAward className="text-yellow-400 shrink-0" size={18} />
              <div>
                <p className="text-[10px] text-gray-500 uppercase tracking-widest font-mono">Hardest problem solved</p>
                <Link to={`/problem/${hardestSolved.slug}`} className="text-white font-bold hover:text-indigo-400 transition-colors text-sm">
                  {hardestSolved.title}
                </Link>
              </div>
              <span className="ml-auto text-[10px] font-mono text-red-400 uppercase border border-red-900/50 bg-red-900/20 px-2 py-0.5 rounded">
                {hardestSolved.difficulty}
              </span>
            </div>
          )}
        </SectionCard>

        {/* Charts row */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <SectionCard title="Problem Solving Journey" icon={FiTrendingUp} iconColor="text-indigo-400">
            <JourneyChart data={cumulativeJourney} />
          </SectionCard>
          <SectionCard title="Weekly Velocity" icon={FiActivity} iconColor="text-cyan-400">
            <VelocityChart data={weeklyVelocity} />
          </SectionCard>
        </div>

        {/* Skill mastery + Weakness side by side */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <SectionCard title="Skill Mastery" icon={FiZap} iconColor="text-yellow-400">
            <SkillMasteryPanel skillMastery={skillMastery} nearUnlock={nearUnlock} />
          </SectionCard>
          <SectionCard title="Weakness Analysis" icon={FiTarget} iconColor="text-red-400">
            <WeaknessPanel failureProfile={failureProfile} />
          </SectionCard>
        </div>

        {/* Language breakdown */}
        <SectionCard title="Language Distribution" icon={FiCode} iconColor="text-purple-400">
          <div className="flex flex-wrap gap-3">
            {Object.entries(languageBreakdown || {}).sort((a, b) => b[1] - a[1]).map(([lang, count]) => {
              const pct = Math.round((count / totalSubmissions) * 100);
              return (
                <div key={lang} className="flex-1 min-w-[120px] bg-[#0d0b18] border border-gray-800/40 rounded-lg p-4">
                  <div className="text-xs font-mono font-bold text-purple-400 uppercase tracking-widest mb-1">{lang}</div>
                  <div className="text-2xl font-black font-mono text-white">{count}</div>
                  <div className="text-[10px] text-gray-600 font-mono">{pct}% of submissions</div>
                  <div className="w-full bg-[#161423] h-1 rounded-full mt-2 overflow-hidden">
                    <div className="bg-purple-500 h-full rounded-full" style={{ width: `${pct}%` }} />
                  </div>
                </div>
              );
            })}
            {!Object.keys(languageBreakdown || {}).length && (
              <p className="text-gray-600 text-xs font-mono uppercase tracking-wider">No submission data yet.</p>
            )}
          </div>
        </SectionCard>

        {/* Calendar activity hint */}
        <SectionCard title="Consistency" icon={FiCalendar} iconColor="text-blue-400">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
            <div className="bg-[#0d0b18] rounded-lg p-4 border border-gray-800/40">
              <div className="text-3xl font-black font-mono text-blue-400">{activeDaysLast30}</div>
              <div className="text-[10px] uppercase tracking-widest text-gray-600 mt-1 font-mono">Active days (30d)</div>
            </div>
            <div className="bg-[#0d0b18] rounded-lg p-4 border border-gray-800/40">
              <div className="text-3xl font-black font-mono text-emerald-400">{currentStreak}</div>
              <div className="text-[10px] uppercase tracking-widest text-gray-600 mt-1 font-mono">Current streak</div>
            </div>
            <div className="bg-[#0d0b18] rounded-lg p-4 border border-gray-800/40">
              <div className="text-3xl font-black font-mono text-yellow-400">{longestStreak}</div>
              <div className="text-[10px] uppercase tracking-widest text-gray-600 mt-1 font-mono">Best streak</div>
            </div>
            <div className="bg-[#0d0b18] rounded-lg p-4 border border-gray-800/40">
              <div className="text-3xl font-black font-mono text-purple-400">
                {activeDaysLast30 >= 20 ? '🔥' : activeDaysLast30 >= 10 ? '📈' : '💤'}
              </div>
              <div className="text-[10px] uppercase tracking-widest text-gray-600 mt-1 font-mono">
                {activeDaysLast30 >= 20 ? 'On fire' : activeDaysLast30 >= 10 ? 'Building up' : 'Needs consistency'}
              </div>
            </div>
          </div>
        </SectionCard>

      </div>
    </div>
  );
};

export default AnalyticsPage;