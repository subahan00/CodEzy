import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { FiCheckCircle, FiClock, FiXCircle } from 'react-icons/fi';
import { Link } from 'react-router-dom';
import profileService from '../services/userService/profileService';
import LeaderboardTable from '../component/Leaderboard/Leaderboard';
import SubmissionModal from '../component/Profile/SubmissionModal';
import submissionService from '../services/submissionService/submissionService';
const ProfilePage = () => {
  const [submissions, setSubmissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalSolved: 0,
    easy: 0,
    medium: 0,
    hard: 0
  });
  useEffect(() => {
    fetchHistory();
  }, []);
  const [selectedSubmission, setSelectedSubmission] = useState(null);
  const user = JSON.parse(localStorage.getItem("user"));
  console.log('user-', user);

  const fetchHistory = async () => {
    try {
      // We need to attach the token!
      const res = await profileService.fetchHistory();
      console.log('res-', res)


      const subs = res;
      setSubmissions(subs);
      calculateStats(subs);
    } catch (err) {
      console.error("Failed to load profile", err);
    } finally {
      setLoading(false);
    }
  };

  const calculateStats = (subs) => {
    // 1. Filter only ACCEPTED submissions
    const accepted = subs.filter(s => s.status === 'accepted');

    // 2. Get Unique Problems Solved (using a Set of Content IDs)
    const uniqueSolved = new Set();
    let easy = 0, medium = 0, hard = 0;

    accepted.forEach(sub => {
      if (!uniqueSolved.has(sub.content._id)) {
        uniqueSolved.add(sub.content._id);
        const diff = sub.content.difficulty;
        if (diff === 'easy') easy++;
        else if (diff === 'medium') medium++;
        else hard++;
      }
    });

    setStats({
      totalSolved: uniqueSolved.size,
      easy,
      medium,
      hard
    });
  };
  const handleViewSubmission = async (id) => {
    try {
      const res = await submissionService.getSubmissionById(id);
      console.log('resssssssss-', res)  
      setSelectedSubmission(res.data.data);
    } catch (error) {
      console.error("Could not fetch submission details");
    }
  };
  if (loading) return <div className="text-white p-10">Loading Profile...</div>;

  return (
    <div className="min-h-screen bg-gray-900 text-white p-10">
      <div className="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8">

        {/* LEFT COLUMN: User Info & Stats */}
        <div className="md:col-span-1 space-y-6">

          {/* User Card */}
          <div className="bg-gray-800 p-6 rounded-lg border border-gray-700 shadow-lg text-center">
            <div className="w-24 h-24 bg-gradient-to-tr from-green-400 to-blue-500 rounded-full mx-auto mb-4 flex items-center justify-center text-3xl font-bold">
              {user.username}
            </div>
            <h2 className="text-xl font-bold">{user.username}</h2>
            <p className="text-gray-400 text-sm">{user.email}</p>
            <button className="mt-4 w-full bg-gray-700 hover:bg-gray-600 py-2 rounded text-sm transition">
              Edit Profile
            </button>
          </div>

          {/* Stats Card */}
          <div className="bg-gray-800 p-6 rounded-lg border border-gray-700 shadow-lg">
            <h3 className="text-lg font-bold mb-4 border-b border-gray-700 pb-2">Problems Solved</h3>

            <div className="text-4xl font-bold text-center mb-6 text-white">
              {stats.totalSolved}
            </div>

            <div className="space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-green-400">Easy</span>
                <span className="font-bold">{stats.easy}</span>
              </div>
              <div className="w-full bg-gray-700 h-2 rounded-full overflow-hidden">
                <div className="bg-green-500 h-full" style={{ width: `${(stats.easy / (stats.totalSolved || 1)) * 100}%` }}></div>
              </div>

              <div className="flex justify-between text-sm">
                <span className="text-yellow-400">Medium</span>
                <span className="font-bold">{stats.medium}</span>
              </div>
              <div className="w-full bg-gray-700 h-2 rounded-full overflow-hidden">
                <div className="bg-yellow-500 h-full" style={{ width: `${(stats.medium / (stats.totalSolved || 1)) * 100}%` }}></div>
              </div>

              <div className="flex justify-between text-sm">
                <span className="text-red-400">Hard</span>
                <span className="font-bold">{stats.hard}</span>
              </div>
              <div className="w-full bg-gray-700 h-2 rounded-full overflow-hidden">
                <div className="bg-red-500 h-full" style={{ width: `${(stats.hard / (stats.totalSolved || 1)) * 100}%` }}></div>
              </div>
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: Recent Submissions */}
        <div className="md:col-span-2">
          <div className="bg-gray-800 rounded-lg border border-gray-700 shadow-lg overflow-hidden">
            <div className="p-4 border-b border-gray-700">
              <h3 className="text-lg font-bold">Recent Submissions</h3>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead className="bg-gray-750 text-gray-400 text-sm">
                  <tr>
                    <th className="p-4">Problem</th>
                    <th className="p-4">Status</th>
                    <th className="p-4">Time</th>
                    <th className="p-4">Date</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-700 text-sm">
                  {submissions.map((sub) => (
                    <tr key={sub._id} className="hover:bg-gray-700 transition">
                      <td className="p-4 font-medium">
                        <Link to={`/problems/${sub.content.slug}`} className="hover:text-blue-400">
                          {sub.content.title}
                        </Link>
                      </td>
                      <td className="p-4">
                        <span className={`inline-flex items-center gap-2 px-2 py-1 rounded-full text-xs font-bold uppercase
                          ${sub.status === 'accepted' ? 'bg-green-900/50 text-green-400' : 'bg-red-900/50 text-red-400'}`}>
                          {sub.status === 'accepted' ? <FiCheckCircle /> : <FiXCircle />}
                          {sub.status.replace('-', ' ')}
                        </span>
                      </td>
                      <td className="p-4 text-gray-400 font-mono">
                        {/* Assuming stats has passed count, or calculate runtime if available */}
                        {sub.executionStats?.passed || 0} passed
                      </td>
                      <td className="p-4 text-gray-500">
                        <div className="flex items-center gap-1">
                          <FiClock size={14} />
                          {new Date(sub.createdAt).toLocaleDateString()}
                        </div>
                      </td>
                      <td className="p-4 text-right">
                        <button
                          onClick={() => handleViewSubmission(sub._id)}
                          className="text-sm text-blue-400 hover:text-blue-300 underline"
                        >
                          View Code
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {submissions.length === 0 && (
                <div className="p-8 text-center text-gray-500">
                  No submissions yet. Go solve some problems!
                </div>
              )}
            </div>
          </div>
        </div>

      </div>
      <SubmissionModal 
   submission={selectedSubmission} 
   onClose={() => setSelectedSubmission(null)} 
/>
    </div>
  );
};

export default ProfilePage;