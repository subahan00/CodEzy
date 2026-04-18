import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  FiArrowLeft, FiActivity, FiTarget, FiZap,
  FiCalendar, FiCode, FiAward, FiTrendingUp,
  FiCpu
} from 'react-icons/fi';

import profileService from '../services/userService/profileService';
import SkillMasteryPanel from '../component/Analytics/SkillMasteryPanel';
import WeaknessPanel from '../component/Analytics/WeaknessPanel';
import RecommendationCard from '../component/Analytics/RecommendationCard';
import { JourneyChart, VelocityChart } from '../component/Analytics/ProgressCharts';

/* ─── Primitive tokens ─────────────────────────────────────────────────── */

const DIFF = {
  beginner:     { color: 'text-emerald-400', bar: 'bg-emerald-500', ring: 'ring-emerald-900/40' },
  intermediate: { color: 'text-amber-400',   bar: 'bg-amber-500',   ring: 'ring-amber-900/40'  },
  advanced:     { color: 'text-rose-400',    bar: 'bg-rose-500',    ring: 'ring-rose-900/40'   },
};

/* ─── Micro components ─────────────────────────────────────────────────── */

const Label = ({ children }) => (
  <span className="text-[10px] font-mono uppercase tracking-[0.18em] text-gray-500 font-semibold">
    {children}
  </span>
);

const Divider = () => (
  <div className="h-px w-full bg-gradient-to-r from-transparent via-gray-800 to-transparent" />
);

/* A number + label stacked — used in several places */
const Metric = ({ value, label, color = 'text-white', size = 'text-4xl', sub }) => (
  <div className="flex flex-col gap-0.5">
    <Label>{label}</Label>
    <span className={`font-black font-mono leading-none ${size} ${color}`}>{value}</span>
    {sub && <span className="text-xs font-mono text-gray-600 mt-0.5">{sub}</span>}
  </div>
);

/* ─── Stat strip ───────────────────────────────────────────────────────── */

const StatStrip = ({ stats }) => (
  <div className="grid grid-cols-2 md:grid-cols-4 gap-px bg-gray-800/50 rounded-2xl overflow-hidden border border-gray-800/60">
    {stats.map(({ label, value, color, sub }, i) => (
      <div
        key={i}
        className="bg-[#080611] px-6 py-5 flex flex-col gap-1 hover:bg-[#0c0919] transition-colors"
      >
        <Label>{label}</Label>
        <span className={`text-3xl font-black font-mono leading-none ${color}`}>{value}</span>
        {sub && <span className="text-xs font-mono text-gray-600">{sub}</span>}
      </div>
    ))}
  </div>
);

/* ─── Section wrapper ──────────────────────────────────────────────────── */

const Section = ({ icon: Icon, iconColor, label, children }) => (
  <div>
    {label && (
      <div className={`flex items-center gap-2 mb-5`}>
        {Icon && <Icon size={12} className={iconColor} />}
        <Label>{label}</Label>
      </div>
    )}
    {children}
  </div>
);

/* ─── Difficulty card ──────────────────────────────────────────────────── */

const DifficultyCard = ({ label, count, total, variant }) => {
  const t = DIFF[variant] || DIFF.beginner;
  const pct = total ? Math.round((count / total) * 100) : 0;
  return (
    <div className={`relative flex flex-col gap-3 bg-[#08060f] rounded-xl p-5 ring-1 ${t.ring}`}>
      <div className={`text-5xl font-black font-mono ${t.color}`}>{count}</div>
      <div className="flex flex-col gap-2">
        <Label>{label}</Label>
        <div className="w-full h-0.5 bg-gray-800/80 rounded-full overflow-hidden">
          <div className={`${t.bar} h-full rounded-full`} style={{ width: `${pct}%` }} />
        </div>
        <span className="text-[11px] font-mono text-gray-600">{pct}% of total</span>
      </div>
    </div>
  );
};

/* ─── Language pill ────────────────────────────────────────────────────── */

const LangPill = ({ lang, count, pct }) => (
  <div className="flex items-center justify-between gap-4 py-3 border-b border-gray-800/50 last:border-0">
    <div className="flex items-center gap-3">
      <div className="w-1.5 h-1.5 rounded-full bg-violet-500" />
      <span className="text-sm font-mono font-semibold text-gray-300">{lang}</span>
    </div>
    <div className="flex items-center gap-4">
      <div className="w-28 h-px bg-gray-800 relative">
        <div className="absolute inset-y-0 left-0 h-px bg-violet-500/70" style={{ width: `${pct}%` }} />
      </div>
      <span className="text-xs font-mono text-gray-500 w-12 text-right">{count} runs</span>
    </div>
  </div>
);

/* ─── Streak cell ──────────────────────────────────────────────────────── */

const StreakCell = ({ value, label, color }) => (
  <div className="text-center">
    <div className={`text-3xl font-black font-mono ${color}`}>{value}</div>
    <Label>{label}</Label>
  </div>
);

/* ══════════════════════════════════════════════════════════════════════════
   PAGE
══════════════════════════════════════════════════════════════════════════ */

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
    <div className="min-h-screen bg-[#06040f] flex flex-col items-center justify-center text-indigo-400 font-mono text-xs tracking-[0.2em] uppercase gap-3">
      <div className="w-8 h-8 border border-indigo-500 border-t-transparent rounded-full animate-spin" />
      Compiling stats
    </div>
  );

  if (error) return (
    <div className="min-h-screen bg-[#06040f] flex items-center justify-center text-red-400 font-mono text-sm">
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

  const sortedLangs = Object.entries(languageBreakdown || {}).sort((a, b) => b[1] - a[1]);
  const topLang = sortedLangs[0];

  return (
    <div className="min-h-screen bg-[#06040f] text-gray-200 font-sans">

      {/* ── Top bar ───────────────────────────────────────────────────── */}
      <div className="border-b border-gray-800/60 bg-[#07050e]/90 backdrop-blur sticky top-0 z-10">
        <div className="max-w-5xl mx-auto px-6 md:px-10 py-4 flex items-center justify-between">
          <Link
            to="/profile"
            className="flex items-center gap-2 text-gray-500 hover:text-white text-xs font-mono uppercase tracking-widest transition-colors"
          >
            <FiArrowLeft size={11} /> Profile
          </Link>
          <span className="text-[10px] font-mono text-gray-600 uppercase tracking-widest hidden md:block">
            Learning Intelligence Report
          </span>
          <div className="flex items-center gap-2">
            <FiAward size={13} className="text-amber-400" />
            <span className="text-lg font-black font-mono text-amber-400">{totalScore}</span>
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-6 md:px-10 py-12 space-y-16">

        {/* ── Header ────────────────────────────────────────────────── */}
        <div className="space-y-1">
          <h1 className="text-3xl font-black tracking-tight text-white">Analytics & Insights</h1>
          <p className="text-gray-500 text-sm">Full breakdown of your problem-solving progress</p>
        </div>

        {/* ── AI Recommendation ─────────────────────────────────────── */}
        <RecommendationCard recommendation={recommendation} />

        {/* ── Key metrics ───────────────────────────────────────────── */}
        <div className="space-y-4">
          <StatStrip stats={[
            { label: 'Problems Solved',  value: totalSolved,          color: 'text-white'       },
            { label: 'Acceptance Rate',  value: `${acceptanceRate}%`, color: 'text-sky-400',    sub: `${totalAccepted} accepted` },
            { label: 'Current Streak',   value: currentStreak,        color: 'text-emerald-400',sub: `Best: ${longestStreak} days` },
            { label: 'Active / 30 days', value: activeDaysLast30,     color: 'text-indigo-400', sub: 'days active'               },
          ]} />
          <StatStrip stats={[
            { label: 'Total Submissions', value: totalSubmissions, color: 'text-gray-300'  },
            { label: 'Accepted',          value: totalAccepted,    color: 'text-emerald-400' },
            { label: 'Failed',            value: totalFailed,      color: 'text-rose-400'   },
            { label: 'Top Language',      value: topLang?.[0] ?? '—', color: 'text-violet-400', sub: topLang ? `${topLang[1]} submissions` : '' },
          ]} />
        </div>

        <Divider />

        {/* ── Difficulty breakdown ───────────────────────────────────── */}
        <Section icon={FiTarget} iconColor="text-amber-400" label="Difficulty Breakdown">
          <div className="grid grid-cols-3 gap-4">
            <DifficultyCard label="Beginner"     count={solvedByDifficulty.beginner}     total={totalSolved} variant="beginner"     />
            <DifficultyCard label="Intermediate" count={solvedByDifficulty.intermediate} total={totalSolved} variant="intermediate" />
            <DifficultyCard label="Advanced"     count={solvedByDifficulty.advanced}     total={totalSolved} variant="advanced"     />
          </div>

          {hardestSolved && (
            <div className="mt-5 flex items-center gap-4 px-5 py-4 bg-[#08060f] rounded-xl ring-1 ring-gray-800/60">
              <FiAward className="text-amber-400 shrink-0" size={16} />
              <div className="flex-1 min-w-0">
                <Label>Hardest problem solved</Label>
                <Link
                  to={`/problem/${hardestSolved.slug}`}
                  className="block text-white font-bold hover:text-indigo-400 transition-colors text-sm mt-0.5 truncate"
                >
                  {hardestSolved.title}
                </Link>
              </div>
              <span className="text-[10px] font-mono font-bold text-rose-400 uppercase tracking-wider border border-rose-900/50 bg-rose-900/20 px-2.5 py-1 rounded-md shrink-0">
                {hardestSolved.difficulty}
              </span>
            </div>
          )}
        </Section>

        <Divider />

        {/* ── Charts ────────────────────────────────────────────────── */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <Section icon={FiTrendingUp} iconColor="text-indigo-400" label="Problem Solving Journey">
            <JourneyChart data={cumulativeJourney} />
          </Section>
          <Section icon={FiActivity} iconColor="text-sky-400" label="Weekly Velocity">
            <VelocityChart data={weeklyVelocity} />
          </Section>
        </div>

        <Divider />

        {/* ── Skill mastery + Weakness ───────────────────────────────── */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
          <Section icon={FiZap} iconColor="text-amber-400" label="Skill Mastery">
            <SkillMasteryPanel skillMastery={skillMastery} nearUnlock={nearUnlock} />
          </Section>
          <Section icon={FiTarget} iconColor="text-rose-400" label="Weakness Analysis">
            <WeaknessPanel failureProfile={failureProfile} />
          </Section>
        </div>

        <Divider />

        {/* ── Language distribution ──────────────────────────────────── */}
        <Section icon={FiCode} iconColor="text-violet-400" label="Language Distribution">
          {sortedLangs.length > 0 ? (
            <div className="divide-y divide-gray-800/50">
              {sortedLangs.map(([lang, count]) => (
                <LangPill
                  key={lang}
                  lang={lang}
                  count={count}
                  pct={Math.round((count / totalSubmissions) * 100)}
                />
              ))}
            </div>
          ) : (
            <p className="text-gray-600 text-xs font-mono uppercase tracking-widest">No submissions yet.</p>
          )}
        </Section>

        <Divider />

        {/* ── Consistency ───────────────────────────────────────────── */}
        <Section icon={FiCalendar} iconColor="text-blue-400" label="Consistency">
          <div className="flex items-start justify-between gap-8 flex-wrap">
            <StreakCell value={activeDaysLast30} label="Active days / 30" color="text-blue-400" />
            <StreakCell value={currentStreak}    label="Current streak"   color="text-emerald-400" />
            <StreakCell value={longestStreak}    label="Best streak"      color="text-amber-400" />
            <div className="text-center">
              <div className="text-3xl leading-none">
                {activeDaysLast30 >= 20 ? '🔥' : activeDaysLast30 >= 10 ? '📈' : '💤'}
              </div>
              <Label>
                {activeDaysLast30 >= 20 ? 'On fire' : activeDaysLast30 >= 10 ? 'Building up' : 'Needs consistency'}
              </Label>
            </div>
          </div>

          {/* Mini progress bar for 30-day consistency */}
          <div className="mt-6 space-y-2">
            <div className="flex justify-between">
              <Label>30-day activity</Label>
              <Label>{activeDaysLast30} / 30 days</Label>
            </div>
            <div className="w-full h-1 bg-gray-800 rounded-full overflow-hidden">
              <div
                className="h-full rounded-full bg-gradient-to-r from-blue-700 to-blue-400 transition-all duration-700"
                style={{ width: `${(activeDaysLast30 / 30) * 100}%` }}
              />
            </div>
          </div>
        </Section>

        {/* ── Footer spacer ─────────────────────────────────────────── */}
        <div className="pb-8" />

      </div>
    </div>
  );
};

export default AnalyticsPage;