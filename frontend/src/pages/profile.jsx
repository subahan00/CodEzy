import React, { useEffect, useState } from 'react';
import {
  FiCheckCircle, FiXCircle, FiAward, FiActivity,
  FiZap, FiCalendar, FiTarget, FiEdit2, FiGithub, FiLinkedin, FiTerminal
} from 'react-icons/fi';
import { Link } from 'react-router-dom';
import profileService from '../services/userService/profileService';
import submissionService from '../services/submissionService/submissionService';
import SubmissionModal from '../component/Profile/SubmissionModal';

// --- HELPER: Futuristic Heatmap Cell ---
const ActivityCell = ({ date, count }) => {
  let color = 'bg-[#1e1e1e] border-gray-800'; // Default empty
  let glow = '';

  if (count > 0) { color = 'bg-blue-900/40 border-blue-900/50'; }
  if (count > 2) { color = 'bg-blue-600/60 border-blue-500/50'; glow = 'hover:shadow-[0_0_8px_rgba(37,99,235,0.6)]'; }
  if (count > 5) { color = 'bg-blue-500 border-blue-400'; glow = 'shadow-[0_0_5px_rgba(59,130,246,0.4)] hover:shadow-[0_0_12px_rgba(59,130,246,0.8)]'; }

  return (
    <div
      className={`w-3.5 h-3.5 rounded-[3px] border ${color} ${glow} transition-all duration-300 hover:scale-125 cursor-crosshair`}
      title={`${date}: ${count} submissions`}
    />
  );
};

const ProfilePage = () => {
  const [submissions, setSubmissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedSubmission, setSelectedSubmission] = useState(null);

  // Stats State
  const [stats, setStats] = useState({
    totalSolved: 0,
    easy: 0, medium: 0, hard: 0,
    acceptanceRate: 0,
    topSkills: []
  });

  const [activityData, setActivityData] = useState([]);
  const user = JSON.parse(localStorage.getItem("user")) || {};

  useEffect(() => {
    fetchHistory();
  }, []);

  const fetchHistory = async () => {
    try {
      const res = await profileService.fetchHistory();
      const subs = Array.isArray(res) ? res : [];
      console.log('subs', res)
      setSubmissions(subs);
      calculateStats(subs);
      generateHeatmap(subs);
    } catch (err) {
      console.error("Failed to load profile", err);
    } finally {
      setLoading(false);
    }
  };

  const calculateStats = (subs) => {
    const accepted = subs.filter(s => s.status === 'accepted');
    const uniqueSolved = new Set();
    const tagCounts = {};
    let easy = 0, medium = 0, hard = 0;

    accepted.forEach(sub => {
      if (sub.content && !uniqueSolved.has(sub.content._id)) {
        uniqueSolved.add(sub.content._id);
        const diff = sub.content.difficulty?.toLowerCase();
        if (diff === 'easy' || diff === 'beginner') easy++;
        else if (diff === 'medium' || diff === 'intermediate') medium++;
        else hard++;

        if (sub.content.tags && Array.isArray(sub.content.tags)) {
          sub.content.tags.forEach(tag => {
            tagCounts[tag] = (tagCounts[tag] || 0) + 1;
          });
        }
      }
    });

    const totalSubmissions = subs.length;
    const rate = totalSubmissions > 0
      ? ((accepted.length / totalSubmissions) * 100).toFixed(1)
      : 0;

    const sortedSkills = Object.entries(tagCounts)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 5);

    setStats({
      totalSolved: uniqueSolved.size,
      easy, medium, hard,
      acceptanceRate: rate,
      topSkills: sortedSkills
    });
  };

  const generateHeatmap = (subs) => {
    const map = {};
    subs.forEach(sub => {
      const date = new Date(sub.createdAt).toISOString().split('T')[0];
      map[date] = (map[date] || 0) + 1;
    });

    const days = [];
    for (let i = 59; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const dateStr = d.toISOString().split('T')[0];
      days.push({ date: dateStr, count: map[dateStr] || 0 });
    }
    setActivityData(days);
  };

  const handleViewSubmission = async (id) => {
    try {
      const res = await submissionService.getSubmissionById(id);
      console.log('res', res)
      setSelectedSubmission(res.data.data);
    } catch (error) {
      console.error("Could not fetch submission details");
    }
  };

  if (loading) return (
    <div className="min-h-screen bg-[#06040f] flex flex-col items-center justify-center text-blue-500 font-mono text-sm tracking-widest uppercase">
      <div className="w-10 h-10 border-2 border-blue-500 border-t-transparent rounded-full animate-spin mb-4"></div>
      Decrypting Profile Data...
    </div>
  );

  return (
    <div className="min-h-screen bg-[#06040f] text-gray-200 p-6 md:p-10 font-sans">
      <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-6">

        {/* ================= LEFT COLUMN: IDENTITY ================= */}
        <div className="lg:col-span-4 space-y-6">

          {/* Identity Card */}
          <div className="bg-[#0b0914] p-6 rounded-xl border border-gray-800/60 shadow-2xl relative overflow-hidden group hover:border-indigo-500/30 transition-colors duration-500">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-indigo-500 to-transparent opacity-50"></div>

            <div className="relative text-center mt-4">
              <div className="w-28 h-28 mx-auto mb-4 relative">
                <div className="absolute inset-0 rounded-full border-2 border-indigo-500/20 animate-[spin_10s_linear_infinite]"></div>
                <div className="w-full h-full bg-[#161423] border border-gray-700 rounded-full flex items-center justify-center text-4xl font-black text-white overflow-hidden shadow-[0_0_30px_rgba(99,102,241,0.1)]">
                  {user.avatar ? <img src={user.avatar} className="object-cover w-full h-full" alt="avatar" /> : user.username?.charAt(0).toUpperCase()}
                </div>
              </div>

              <h2 className="text-2xl font-black text-white tracking-tight">{user.username}</h2>
              <p className="text-indigo-400 text-sm font-mono mt-1 uppercase tracking-widest flex items-center justify-center gap-2">
                <FiTerminal size={12} /> {user.statistics?.rank || 'Beginner'}
              </p>

              <div className="flex justify-center gap-5 mt-6 text-gray-500">
                <FiGithub className="hover:text-white hover:scale-110 cursor-pointer transition-all" size={18} />
                <FiLinkedin className="hover:text-white hover:scale-110 cursor-pointer transition-all" size={18} />
              </div>

              <Link to="/profile/edit" className="mt-8 w-full flex items-center justify-center gap-2 bg-[#161423] hover:bg-indigo-900/20 py-3 rounded-lg text-xs uppercase tracking-widest font-bold transition-all border border-gray-800 hover:border-indigo-500/50 text-gray-400 hover:text-indigo-300">
                <FiEdit2 size={12} /> Edit Configuration
              </Link>
            </div>
          </div>

          {/* Skills Radar */}
          <div className="bg-[#0b0914] p-6 rounded-xl border border-gray-800/60 shadow-xl">
            <h3 className="text-xs uppercase tracking-widest font-bold text-gray-500 mb-5 flex items-center gap-2">
              <FiZap className="text-yellow-500/70" /> System Proficiencies
            </h3>
            <div className="space-y-3">
              {stats.topSkills.length > 0 ? stats.topSkills.map(([skill, count]) => (
                <div key={skill} className="flex justify-between items-center group">
                  <span className="text-sm text-gray-300 capitalize group-hover:text-white transition-colors">{skill}</span>
                  <div className="flex items-center gap-3">
                    <div className="h-[1px] w-12 bg-gray-800 group-hover:bg-gray-600 transition-colors"></div>
                    <span className="text-indigo-400 font-mono text-xs">x{count}</span>
                  </div>
                </div>
              )) : (
                <p className="text-gray-600 text-xs uppercase tracking-wider font-mono">No telemetry data available.</p>
              )}
            </div>
          </div>

          {/* Achievements Grid */}
          <div className="bg-[#0b0914] p-6 rounded-xl border border-gray-800/60 shadow-xl">
            <h3 className="text-xs uppercase tracking-widest font-bold text-gray-500 mb-5 flex items-center gap-2">
              <FiAward className="text-purple-500/70" /> Decrypted Badges
            </h3>
            <div className="grid grid-cols-4 gap-3">
              <div className="aspect-square bg-[#161423] rounded-lg flex items-center justify-center text-xl hover:scale-110 cursor-help transition-transform border border-gray-800 shadow-[0_0_10px_rgba(0,0,0,0.5)]" title="Solved 10 Problems">🏆</div>
              <div className="aspect-square bg-[#161423] rounded-lg flex items-center justify-center text-xl hover:scale-110 cursor-help transition-transform border border-gray-800 shadow-[0_0_10px_rgba(0,0,0,0.5)]" title="7 Day Streak">🔥</div>
              <div className="aspect-square bg-[#06040f] rounded-lg flex items-center justify-center text-gray-800 border border-gray-800/50 border-dashed text-xs font-mono">LOCKED</div>
              <div className="aspect-square bg-[#06040f] rounded-lg flex items-center justify-center text-gray-800 border border-gray-800/50 border-dashed text-xs font-mono">LOCKED</div>
            </div>
          </div>

        </div>

        {/* ================= RIGHT COLUMN: STATS & CONTENT ================= */}
        <div className="lg:col-span-8 space-y-6">

          {/* Main Stats Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-[#0b0914] p-5 rounded-xl border border-gray-800/60 flex flex-col justify-center items-center text-center group hover:border-gray-600 transition-colors">
              <div className="text-gray-500 text-[10px] uppercase tracking-widest font-bold mb-2">Total Solved</div>
              <div className="text-3xl font-black font-mono text-white group-hover:scale-110 transition-transform">{stats.totalSolved}</div>
            </div>
            <div className="bg-[#0b0914] p-5 rounded-xl border border-gray-800/60 flex flex-col justify-center items-center text-center group hover:border-gray-600 transition-colors">
              <div className="text-gray-500 text-[10px] uppercase tracking-widest font-bold mb-2">Total Score</div>
              <div className="text-3xl font-black font-mono text-yellow-500 group-hover:scale-110 transition-transform drop-shadow-[0_0_10px_rgba(234,179,8,0.2)]">{user.statistics?.totalScore || 0}</div>
            </div>
            <div className="bg-[#0b0914] p-5 rounded-xl border border-gray-800/60 flex flex-col justify-center items-center text-center group hover:border-gray-600 transition-colors">
              <div className="text-gray-500 text-[10px] uppercase tracking-widest font-bold mb-2">Accuracy</div>
              <div className="text-3xl font-black font-mono text-cyan-400 group-hover:scale-110 transition-transform">{stats.acceptanceRate}%</div>
            </div>
            <div className="bg-[#0b0914] p-5 rounded-xl border border-gray-800/60 flex flex-col justify-center items-center text-center group hover:border-gray-600 transition-colors">
              <div className="text-gray-500 text-[10px] uppercase tracking-widest font-bold mb-2">Active Streak</div>
              <div className="text-3xl font-black font-mono text-emerald-400 group-hover:scale-110 transition-transform flex items-baseline gap-1">
                {user.statistics?.currentStreak || 0}<span className="text-xs font-sans text-gray-600">d</span>
              </div>
            </div>
          </div>

          {/* Difficulty & Heatmap Row */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

            {/* Difficulty Breakdown */}
            <div className="bg-[#0b0914] p-6 rounded-xl border border-gray-800/60">
              <h3 className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-5">Algorithm Complexity</h3>
              <div className="space-y-5">
                <div>
                  <div className="flex justify-between text-xs font-mono mb-2 uppercase tracking-wider">
                    <span className="text-emerald-400">Easy</span>
                    <span className="text-gray-500">{stats.easy} / {stats.totalSolved}</span>
                  </div>
                  <div className="w-full bg-[#161423] h-1.5 rounded-full overflow-hidden">
                    <div className="bg-emerald-500 h-full shadow-[0_0_10px_rgba(16,185,129,0.5)] transition-all duration-1000" style={{ width: `${(stats.easy / (stats.totalSolved || 1)) * 100}%` }}></div>
                  </div>
                </div>
                <div>
                  <div className="flex justify-between text-xs font-mono mb-2 uppercase tracking-wider">
                    <span className="text-yellow-400">Medium</span>
                    <span className="text-gray-500">{stats.medium} / {stats.totalSolved}</span>
                  </div>
                  <div className="w-full bg-[#161423] h-1.5 rounded-full overflow-hidden">
                    <div className="bg-yellow-500 h-full shadow-[0_0_10px_rgba(234,179,8,0.5)] transition-all duration-1000" style={{ width: `${(stats.medium / (stats.totalSolved || 1)) * 100}%` }}></div>
                  </div>
                </div>
                <div>
                  <div className="flex justify-between text-xs font-mono mb-2 uppercase tracking-wider">
                    <span className="text-red-400">Hard</span>
                    <span className="text-gray-500">{stats.hard} / {stats.totalSolved}</span>
                  </div>
                  <div className="w-full bg-[#161423] h-1.5 rounded-full overflow-hidden">
                    <div className="bg-red-500 h-full shadow-[0_0_10px_rgba(239,68,68,0.5)] transition-all duration-1000" style={{ width: `${(stats.hard / (stats.totalSolved || 1)) * 100}%` }}></div>
                  </div>
                </div>
              </div>
            </div>

            {/* Activity Heatmap (Last 60 Days) */}
            <div className="bg-[#0b0914] p-6 rounded-xl border border-gray-800/60 flex flex-col">
              <div className="flex justify-between items-center mb-5">
                <h3 className="text-xs uppercase tracking-widest font-bold text-gray-500 flex items-center gap-2">
                  <FiCalendar className="text-blue-500/70" /> Execution Matrix
                </h3>
                <span className="text-[10px] uppercase tracking-wider font-mono text-gray-600">T-60 Days</span>
              </div>
              <div className="flex-1 flex items-center justify-center">
                <div className="flex flex-wrap gap-1.5 justify-center">
                  {activityData.map((day, i) => (
                    <ActivityCell key={i} date={day.date} count={day.count} />
                  ))}
                </div>
              </div>
            </div>

          </div>

          {/* Submission History Table */}
          <div className="bg-[#0b0914] rounded-xl border border-gray-800/60 overflow-hidden">
            <div className="p-5 border-b border-gray-800/60 flex justify-between items-center">
              <h3 className="text-xs uppercase tracking-widest font-bold text-gray-500">Execution Logs</h3>
              <Link to="/submissions" className="text-[10px] font-mono text-indigo-400 uppercase tracking-widest hover:text-indigo-300 transition-colors">View Complete Log</Link>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead className="bg-[#06040f] text-gray-600 text-[10px] uppercase tracking-widest font-mono">
                  <tr>
                    <th className="p-4 border-b border-gray-800/50">Target Identifier</th>
                    <th className="p-4 border-b border-gray-800/50">System Verdict</th>
                    <th className="p-4 border-b border-gray-800/50 hidden md:table-cell">Timestamp</th>
                    <th className="p-4 border-b border-gray-800/50 text-right">Payload</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-800/30 text-sm">
                  {submissions.slice(0, 10).map((sub) => (
                    <tr key={sub._id} className="hover:bg-[#161423] transition-colors group">
                      <td className="p-4 font-medium text-gray-300">
                        <Link to={`/problem/${sub.content?.slug}`} className="hover:text-indigo-400 transition-colors flex items-center gap-2">
                          <FiTarget className="text-gray-600 group-hover:text-indigo-500 transition-colors" size={14} />
                          {sub.content?.title || "Unknown Vector"}
                        </Link>
                      </td>
                      <td className="p-4">
                        <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-widest font-mono
                          ${sub.status === 'accepted' ? 'bg-emerald-900/20 text-emerald-400 border border-emerald-900/50 shadow-[0_0_10px_rgba(16,185,129,0.1)]' : 'bg-red-900/20 text-red-400 border border-red-900/50'}`}>
                          {sub.status === 'accepted' ? <FiCheckCircle size={10} /> : <FiXCircle size={10} />}
                          {sub.status?.replace('-', ' ')}
                        </span>
                      </td>
                      <td className="p-4 text-gray-600 font-mono text-[11px] hidden md:table-cell">
                        {new Date(sub.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                      </td>
                      <td className="p-4 text-right">
                        <button
                          onClick={() => handleViewSubmission(sub._id)}
                          className="text-[10px] uppercase tracking-widest font-mono text-gray-400 hover:text-white bg-[#161423] hover:bg-gray-700 px-3 py-1.5 rounded border border-gray-800 hover:border-gray-600 transition-all"
                        >
                          Extract
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {submissions.length === 0 && (
                <div className="p-16 flex flex-col items-center justify-center text-gray-600 border-t border-gray-800/30">
                  <FiTerminal className="text-4xl mb-4 opacity-20" />
                  <p className="text-xs uppercase tracking-widest font-mono mb-4">Awaiting initial execution sequence</p>
                  <Link to="/problems" className="text-xs font-bold bg-indigo-600 hover:bg-indigo-500 text-white px-6 py-2 rounded transition-colors shadow-[0_0_15px_rgba(79,70,229,0.3)]">
                    Initiate Challenge
                  </Link>
                </div>
              )}
            </div>
          </div>

        </div>
      </div>

      {/* MODAL */}
      <SubmissionModal
        submission={selectedSubmission}
        onClose={() => setSelectedSubmission(null)}
      />
    </div>
  );
};

export default ProfilePage;