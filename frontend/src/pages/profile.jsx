import React, { useEffect, useState, useMemo } from 'react';
import { 
  FiCheckCircle, FiClock, FiXCircle, FiAward, FiActivity, 
  FiZap, FiCalendar, FiTarget, FiEdit2, FiGithub, FiLinkedin 
} from 'react-icons/fi';
import { Link } from 'react-router-dom';
import profileService from '../services/userService/profileService';
import submissionService from '../services/submissionService/submissionService';
import SubmissionModal from '../component/Profile/SubmissionModal';

// --- HELPER: Heatmap Cell ---
const ActivityCell = ({ date, count }) => {
  let color = 'bg-gray-800';
  if (count > 0) color = 'bg-green-900/40';
  if (count > 2) color = 'bg-green-600/60';
  if (count > 5) color = 'bg-green-500';

  return (
    <div 
      className={`w-3 h-3 rounded-sm ${color} transition-all hover:scale-125`} 
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

  // Activity Heatmap Data
  const [activityData, setActivityData] = useState([]);

  // User Data (Merge LocalStorage with potential API updates later)
  const user = JSON.parse(localStorage.getItem("user")) || {};

  useEffect(() => {
    fetchHistory();
  }, []);

  const fetchHistory = async () => {
    try {
      const res = await profileService.fetchHistory(); // Should return array of submissions
      const subs = Array.isArray(res) ? res : [];
      console.log("Fetched history:", subs);
      setSubmissions(subs);
      calculateStats(subs);
      generateHeatmap(subs);
    } catch (err) {
      console.error("Failed to load profile", err);
    } finally {
      setLoading(false);
    }
  };

  // --- LOGIC: Calculate Stats & Skills ---
  const calculateStats = (subs) => {
    const accepted = subs.filter(s => s.status === 'accepted');
    const uniqueSolved = new Set();
    const tagCounts = {};
    let easy = 0, medium = 0, hard = 0;

    accepted.forEach(sub => {
      // 1. Difficulty Breakdown (Unique)
      if (sub.content && !uniqueSolved.has(sub.content._id)) {
        uniqueSolved.add(sub.content._id);
        const diff = sub.content.difficulty?.toLowerCase();
        if (diff === 'easy' || diff === 'beginner') easy++;
        else if (diff === 'medium' || diff === 'intermediate') medium++;
        else hard++;

        // 2. Skill Extraction (Tags)
        if (sub.content.tags && Array.isArray(sub.content.tags)) {
          sub.content.tags.forEach(tag => {
            tagCounts[tag] = (tagCounts[tag] || 0) + 1;
          });
        }
      }
    });

    // 3. Acceptance Rate
    const totalSubmissions = subs.length;
    const rate = totalSubmissions > 0 
      ? ((accepted.length / totalSubmissions) * 100).toFixed(1) 
      : 0;

    // 4. Sort Top Skills
    const sortedSkills = Object.entries(tagCounts)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 5); // Top 5

    setStats({
      totalSolved: uniqueSolved.size,
      easy, medium, hard,
      acceptanceRate: rate,
      topSkills: sortedSkills
    });
  };

  // --- LOGIC: Generate 365 Day Heatmap ---
  const generateHeatmap = (subs) => {
    const map = {};
    subs.forEach(sub => {
      const date = new Date(sub.createdAt).toISOString().split('T')[0];
      map[date] = (map[date] || 0) + 1;
    });

    // Generate last 60 days for display (Mobile friendly)
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
      setSelectedSubmission(res.data.data);
    } catch (error) {
      console.error("Could not fetch submission details");
    }
  };

  if (loading) return (
    <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center text-gray-500">
      <FiActivity className="animate-spin mr-2" /> Loading Profile...
    </div>
  );

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-gray-200 p-6 md:p-10 font-sans">
      <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-8">

        {/* ================= LEFT COLUMN: IDENTITY (Col-Span 4) ================= */}
        <div className="lg:col-span-4 space-y-6">
          
          {/* 1. Identity Card */}
          <div className="bg-[#161616] p-6 rounded-2xl border border-gray-800 shadow-xl relative overflow-hidden group">
            {/* Background Gradient Effect */}
            <div className="absolute top-0 left-0 w-full h-24 bg-gradient-to-r from-blue-600/20 to-purple-600/20"></div>
            
            <div className="relative">
              <div className="w-28 h-28 bg-[#1e1e1e] border-4 border-[#0a0a0a] rounded-full mx-auto mb-4 flex items-center justify-center text-4xl font-bold text-white shadow-lg">
                {user.avatar ? <img src={user.avatar} className="rounded-full" alt="avatar"/> : user.username?.charAt(0).toUpperCase()}
              </div>
              
              <div className="text-center">
                <h2 className="text-2xl font-bold text-white">{user.username}</h2>
                <p className="text-gray-500 text-sm">Rank: Beginner</p> 
                {/* Future: {user.statistics?.rank || 'Beginner'} */}
                
                <div className="flex justify-center gap-4 mt-4 text-gray-400">
                  <FiGithub className="hover:text-white cursor-pointer transition" />
                  <FiLinkedin className="hover:text-white cursor-pointer transition" />
                </div>

                <button className="mt-6 w-full flex items-center justify-center gap-2 bg-gray-800 hover:bg-gray-700 py-2.5 rounded-lg text-sm font-medium transition-all border border-gray-700">
                  <FiEdit2 size={14} /> Edit Profile
                </button>
              </div>
            </div>
          </div>

          {/* 2. Skills Radar (Text Version for now) */}
          <div className="bg-[#161616] p-6 rounded-2xl border border-gray-800 shadow-xl">
             <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
               <FiZap className="text-yellow-400"/> Top Skills
             </h3>
             <div className="space-y-3">
               {stats.topSkills.length > 0 ? stats.topSkills.map(([skill, count]) => (
                 <div key={skill} className="flex justify-between items-center text-sm">
                   <span className="bg-gray-800 px-2 py-1 rounded text-gray-300 capitalize">{skill}</span>
                   <span className="text-gray-500 font-mono">x{count}</span>
                 </div>
               )) : (
                 <p className="text-gray-500 text-sm italic">Solve problems to unlock skill stats.</p>
               )}
             </div>
          </div>

          {/* 3. Badges Placeholder (Future Proofing) */}
          <div className="bg-[#161616] p-6 rounded-2xl border border-gray-800 shadow-xl">
            <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
              <FiAward className="text-purple-400"/> Achievements
            </h3>
            <div className="grid grid-cols-4 gap-2">
               {/* Placeholders */}
               <div className="aspect-square bg-gray-800 rounded-lg flex items-center justify-center text-gray-600 hover:bg-gray-700 cursor-help" title="Solved 10 Problems">🏆</div>
               <div className="aspect-square bg-gray-800 rounded-lg flex items-center justify-center text-gray-600 hover:bg-gray-700 cursor-help" title="7 Day Streak">🔥</div>
               <div className="aspect-square bg-gray-800/50 rounded-lg flex items-center justify-center text-gray-700 border border-gray-800 border-dashed">?</div>
               <div className="aspect-square bg-gray-800/50 rounded-lg flex items-center justify-center text-gray-700 border border-gray-800 border-dashed">?</div>
            </div>
          </div>

        </div>

        {/* ================= RIGHT COLUMN: STATS & CONTENT (Col-Span 8) ================= */}
        <div className="lg:col-span-8 space-y-6">

          {/* 1. Main Stats Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
             <div className="bg-[#161616] p-4 rounded-xl border border-gray-800">
                <div className="text-gray-500 text-xs uppercase font-bold mb-1">Total Solved</div>
                <div className="text-3xl font-bold text-white">{stats.totalSolved}</div>
             </div>
             <div className="bg-[#161616] p-4 rounded-xl border border-gray-800">
                <div className="text-gray-500 text-xs uppercase font-bold mb-1">Total Score</div>
                <div className="text-3xl font-bold text-yellow-500">{user.statistics?.totalScore || 0}</div>
             </div>
             <div className="bg-[#161616] p-4 rounded-xl border border-gray-800">
                <div className="text-gray-500 text-xs uppercase font-bold mb-1">Acceptance</div>
                <div className="text-3xl font-bold text-blue-400">{stats.acceptanceRate}%</div>
             </div>
             <div className="bg-[#161616] p-4 rounded-xl border border-gray-800">
                <div className="text-gray-500 text-xs uppercase font-bold mb-1">Streak</div>
                <div className="text-3xl font-bold text-green-500 flex items-center gap-2">
                   {user.statistics?.currentStreak || 0} <span className="text-sm text-gray-600">days</span>
                </div>
             </div>
          </div>

          {/* 2. Difficulty Breakdown */}
          <div className="bg-[#161616] p-6 rounded-2xl border border-gray-800">
            <h3 className="text-sm font-bold text-gray-400 uppercase mb-4">Problem Difficulty</h3>
            <div className="space-y-4">
               {/* Easy */}
               <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-green-400 font-medium">Easy</span>
                    <span className="text-gray-400">{stats.easy} solved</span>
                  </div>
                  <div className="w-full bg-gray-800 h-2 rounded-full overflow-hidden">
                    <div className="bg-green-500 h-full transition-all duration-1000" style={{ width: `${(stats.easy / (stats.totalSolved || 1)) * 100}%` }}></div>
                  </div>
               </div>
               {/* Medium */}
               <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-yellow-400 font-medium">Medium</span>
                    <span className="text-gray-400">{stats.medium} solved</span>
                  </div>
                  <div className="w-full bg-gray-800 h-2 rounded-full overflow-hidden">
                    <div className="bg-yellow-500 h-full transition-all duration-1000" style={{ width: `${(stats.medium / (stats.totalSolved || 1)) * 100}%` }}></div>
                  </div>
               </div>
               {/* Hard */}
               <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-red-400 font-medium">Hard</span>
                    <span className="text-gray-400">{stats.hard} solved</span>
                  </div>
                  <div className="w-full bg-gray-800 h-2 rounded-full overflow-hidden">
                    <div className="bg-red-500 h-full transition-all duration-1000" style={{ width: `${(stats.hard / (stats.totalSolved || 1)) * 100}%` }}></div>
                  </div>
               </div>
            </div>
          </div>

          {/* 3. Activity Heatmap (Last 60 Days) */}
          <div className="bg-[#161616] p-6 rounded-2xl border border-gray-800">
            <div className="flex justify-between items-center mb-4">
               <h3 className="text-lg font-bold text-white flex items-center gap-2">
                 <FiCalendar /> Recent Activity
               </h3>
               <span className="text-xs text-gray-500">Last 60 Days</span>
            </div>
            <div className="flex flex-wrap gap-1">
               {activityData.map((day, i) => (
                  <ActivityCell key={i} date={day.date} count={day.count} />
               ))}
            </div>
          </div>

          {/* 4. Submission History Table */}
          <div className="bg-[#161616] rounded-2xl border border-gray-800 overflow-hidden shadow-xl">
            <div className="p-4 border-b border-gray-800 bg-[#1e1e1e] flex justify-between items-center">
              <h3 className="text-lg font-bold text-white">Submission History</h3>
              <Link to="/submissions" className="text-xs text-blue-400 hover:underline">View All</Link>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead className="bg-[#1a1a1a] text-gray-500 text-xs uppercase tracking-wider">
                  <tr>
                    <th className="p-4">Problem</th>
                    <th className="p-4">Verdict</th>
                    <th className="p-4 hidden md:table-cell">Runtime</th>
                    <th className="p-4 hidden sm:table-cell">Date</th>
                    <th className="p-4">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-800 text-sm">
                  {submissions.slice(0, 10).map((sub) => (
                    <tr key={sub._id} className="hover:bg-[#1f1f1f] transition-colors">
                      <td className="p-4 font-medium text-white">
                        <Link to={`/problem/${sub.content?.slug}`} className="hover:text-blue-400 transition">
                          {sub.problemSnapshot?.title || "Unknown Problem"}
                        </Link>
                      </td>
                      <td className="p-4">
                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-bold uppercase
                          ${sub.status === 'accepted' ? 'bg-green-900/30 text-green-400 border border-green-900' : 'bg-red-900/30 text-red-400 border border-red-900'}`}>
                          {sub.status === 'accepted' ? <FiCheckCircle /> : <FiXCircle />}
                          {sub.status?.replace('-', ' ')}
                        </span>
                      </td>
                      <td className="p-4 text-gray-400 font-mono hidden md:table-cell">
                         {/* Placeholder for runtime if you add it to DB later */}
                         100 ms
                      </td>
                      <td className="p-4 text-gray-500 hidden sm:table-cell">
                        {new Date(sub.createdAt).toLocaleDateString()}
                      </td>
                      <td className="p-4">
                        <button
                          onClick={() => handleViewSubmission(sub._id)}
                          className="text-xs bg-gray-800 hover:bg-gray-700 text-white px-3 py-1.5 rounded border border-gray-700 transition"
                        >
                          View Code
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {submissions.length === 0 && (
                <div className="p-12 text-center text-gray-600">
                  <FiTarget className="mx-auto text-4xl mb-3 opacity-50"/>
                  <p>No submissions yet. Start your journey!</p>
                  <Link to="/problems" className="mt-4 inline-block text-blue-400 hover:underline">Go to Problems</Link>
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