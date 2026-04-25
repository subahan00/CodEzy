import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { FiAward, FiTrendingUp, FiCrosshair, FiUser } from 'react-icons/fi';
import Navbar from '../Dashboard/NavBar'; // Adjust path

const Leaderboard = () => {
  const [leaderboardData, setLeaderboardData] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [category, setCategory] = useState('global');

  const currentUser = JSON.parse(localStorage.getItem('user')) || { username: 'Guest' };

  useEffect(() => {
    const fetchLeaderboard = async () => {
      setIsLoading(true);
      try {
        const token = localStorage.getItem("token");
        // Replace with your actual backend URL
        const res = await axios.get(`${import.meta.env.VITE_BACKEND_URL}/api/leaderboard?category=${category}`, {
            headers: { Authorization: `Bearer ${token}` }
        });
        setLeaderboardData(res.data.data);
      } catch (error) {
        console.error("Failed to load leaderboard:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchLeaderboard();
  }, [category]);

  // Helper to separate Top 3 from the rest
  const topThree = leaderboardData.slice(0, 3);
  const theRest = leaderboardData.slice(3);

  // Styling helpers for the podium
  const podiumStyles = [
    { height: 'h-48', color: 'border-yellow-500', glow: 'shadow-[0_0_30px_rgba(234,179,8,0.3)]', rank: '1st' }, // Gold
    { height: 'h-40', color: 'border-gray-400', glow: 'shadow-[0_0_20px_rgba(156,163,175,0.2)]', rank: '2nd' }, // Silver
    { height: 'h-32', color: 'border-amber-700', glow: 'shadow-[0_0_20px_rgba(180,83,9,0.2)]', rank: '3rd' }   // Bronze
  ];

  // Reorder top 3 for visual rendering (Silver, Gold, Bronze left-to-right)
  const displayOrder = topThree.length === 3 ? [topThree[1], topThree[0], topThree[2]] : topThree;
  const styleOrder = topThree.length === 3 ? [podiumStyles[1], podiumStyles[0], podiumStyles[2]] : podiumStyles;

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-gray-200 font-sans">
      <Navbar />

      <main className="max-w-5xl mx-auto px-4 py-8">
        
        {/* Header Section */}
        <div className="flex flex-col md:flex-row justify-between items-center mb-12">
          <div>
            <h1 className="text-4xl font-black text-white mb-2 tracking-tight">Global Rankings</h1>
            <p className="text-gray-400">Compete, climb the ranks, and prove your skills.</p>
          </div>
          
          {/* Category Filters */}
          <div className="flex bg-[#161616] p-1 rounded-xl border border-gray-800 mt-4 md:mt-0">
            {['global', 'beginner', 'intermediate', 'advanced'].map((cat) => (
              <button
                key={cat}
                onClick={() => setCategory(cat)}
                className={`px-4 py-2 rounded-lg text-sm font-bold capitalize transition-all ${
                  category === cat 
                    ? 'bg-blue-600 text-white shadow-lg' 
                    : 'text-gray-500 hover:text-gray-300'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {isLoading ? (
          <div className="flex justify-center items-center h-64">
             <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
          </div>
        ) : (
          <>
            {/* THE PODIUM (Top 3) */}
            {topThree.length > 0 && (
              <div className="flex justify-center items-end gap-2 md:gap-6 mb-16 h-64">
                {displayOrder.map((user, idx) => {
                  if (!user) return null;
                  const style = styleOrder[idx];
                  
                  return (
                    <div key={user.userId} className="flex flex-col items-center flex-1 max-w-[200px]">
                      {/* Avatar / Name */}
                      <div className="mb-4 text-center z-10">
                        <div className={`w-16 h-16 md:w-20 md:h-20 mx-auto bg-[#1e1e1e] rounded-full border-2 ${style.color} flex items-center justify-center mb-2 ${style.glow}`}>
                          <FiUser className="text-2xl text-gray-400" />
                        </div>
                        <h3 className="font-bold text-white truncate max-w-[120px]">{user.username}</h3>
                        <p className="text-blue-400 font-mono text-sm">{user.elo} Elo</p>
                      </div>

                      {/* The Pillar */}
                      <div className={`w-full bg-[#161616] border-t-4 ${style.color} rounded-t-xl flex flex-col items-center justify-start pt-4 transition-all duration-500 hover:-translate-y-2 relative overflow-hidden ${style.height}`}>
                        <span className="text-2xl md:text-4xl font-black text-gray-800 absolute bottom-[-10px] right-[-5px] opacity-50 select-none">
                          {user.rank}
                        </span>
                        <FiAward className={`text-2xl ${style.color.replace('border-', 'text-')}`} />
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {/* THE LIST (Ranks 4-50) */}
            <div className="bg-[#161616] rounded-2xl border border-gray-800 overflow-hidden shadow-2xl">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-[#0a0a0a] text-gray-500 text-xs uppercase tracking-wider border-b border-gray-800">
                    <th className="p-4 font-semibold text-center w-16">Rank</th>
                    <th className="p-4 font-semibold">Developer</th>
                    <th className="p-4 font-semibold hidden md:table-cell text-center">Duels Won</th>
                    <th className="p-4 font-semibold hidden md:table-cell text-center">Problems Solved</th>
                    <th className="p-4 font-semibold text-right">Elo Rating</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-800/50">
                  {theRest.map((user) => {
                    const isMe = user.username === currentUser.username;
                    return (
                      <tr 
                        key={user.userId} 
                        className={`transition hover:bg-[#1e1e1e] ${isMe ? 'bg-blue-900/10' : ''}`}
                      >
                        <td className="p-4 text-center text-gray-500 font-mono">#{user.rank}</td>
                        <td className="p-4 font-bold flex items-center gap-3">
                          <div className={`w-8 h-8 rounded-full flex items-center justify-center ${isMe ? 'bg-blue-600 text-white' : 'bg-gray-800 text-gray-400'}`}>
                            {user.username.charAt(0).toUpperCase()}
                          </div>
                          <span className={isMe ? 'text-blue-400' : 'text-gray-200'}>
                            {user.username} {isMe && <span className="text-xs bg-blue-600/20 text-blue-400 px-2 py-0.5 rounded ml-2">YOU</span>}
                          </span>
                        </td>
                        <td className="p-4 text-center text-gray-400 hidden md:table-cell">
                          <span className="flex items-center justify-center gap-1"><FiCrosshair className="text-red-500/70"/> {user.duelsWon}</span>
                        </td>
                        <td className="p-4 text-center text-gray-400 hidden md:table-cell">
                          <span className="flex items-center justify-center gap-1"><FiTrendingUp className="text-green-500/70"/> {user.problemsSolved}</span>
                        </td>
                        <td className="p-4 text-right font-mono font-bold text-blue-400">
                          {user.elo}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
              {leaderboardData.length === 0 && (
                <div className="p-8 text-center text-gray-500">
                  No competitors found for this category yet.
                </div>
              )}
            </div>
          </>
        )}
      </main>
    </div>
  );
};

export default Leaderboard;