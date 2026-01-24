import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Crown, Zap } from 'lucide-react';
import leaderboardService from '../../services/leaderboardService/leaderboardService';

const LeaderboardTable = ({ limit, compact = false }) => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchLeaderboard = async () => {
      try {
        const res = await leaderboardService.getLeaderboard();
        let data = res.data.data;
        if (limit) data = data.slice(0, limit);
        setUsers(data);
      } catch (err) {
        console.error("Failed to fetch leaderboard", err);
      } finally {
        setLoading(false);
      }
    };
    fetchLeaderboard();
  }, [limit]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 40 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      className="glass-card rounded-2xl border border-white/10 overflow-hidden shadow-2xl"
    >
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-white/5 bg-black/40">
        <h3 className="text-white font-bold tracking-wide flex items-center gap-2">
          <Zap className="w-4 h-4 text-blue-400" />
          ARENA LEADERBOARD
        </h3>
        <span className="text-xs font-mono text-blue-400">TOP CODERS</span>
      </div>

      {/* Table */}
      <div className="divide-y divide-white/5">
        {loading ? (
          <div className="p-6 text-center text-gray-500 font-mono animate-pulse">
            Syncing Rankings...
          </div>
        ) : (
          users.map((user, index) => {
            const isTop = index === 0;
            const glow =
              index === 0 ? 'from-yellow-400/30 to-orange-500/10' :
              index === 1 ? 'from-gray-400/20 to-gray-600/5' :
              index === 2 ? 'from-amber-500/20 to-amber-700/5' :
              'from-blue-500/10 to-transparent';

            return (
              <motion.div
                key={index}
                whileHover={{ scale: 1.02 }}
                className={`relative flex items-center justify-between px-6 py-4 bg-gradient-to-r ${glow} hover:bg-white/5 transition`}
              >
                {/* Rank */}
                <div className="flex items-center gap-3">
                  <div className="w-8 text-center font-mono text-sm text-blue-400">
                    {isTop ? <Crown className="w-4 h-4 text-yellow-400" /> : `#${index + 1}`}
                  </div>

                  {/* Avatar */}
                  {!compact && (
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center text-xs font-bold text-black shadow-lg">
                      {user.username?.[0].toUpperCase()}
                    </div>
                  )}

                  {/* Name */}
                  <span className={`font-medium tracking-wide ${
                    isTop ? 'text-yellow-300' : 'text-white'
                  }`}>
                    {user.username}
                  </span>
                </div>

                {/* Score */}
                <div className="font-mono text-green-400 text-sm">
                  {user.solvedCount} pts
                </div>

                {/* Neon Glow for #1 */}
                {isTop && (
                  <div className="absolute inset-0 bg-yellow-400/10 blur-xl opacity-50 pointer-events-none" />
                )}
              </motion.div>
            );
          })
        )}
      </div>

      {!loading && users.length === 0 && (
        <div className="p-4 text-center text-gray-500 text-xs font-mono">
          NO SIGNAL FROM ARENA
        </div>
      )}
    </motion.div>
  );
};

export default LeaderboardTable;
