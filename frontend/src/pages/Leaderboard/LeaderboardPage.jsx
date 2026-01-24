import React from 'react';
import { Trophy } from 'lucide-react';
import { motion } from 'framer-motion'; 
import Leaderboard from '../../component/Leaderboard/Leaderboard.jsx';
const LeaderboardPage = () => {
  return (
    <div className="relative min-h-screen bg-[#030014] text-white overflow-hidden">

      {/* Background Glows */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[900px] h-[400px] bg-blue-600/20 blur-[140px] rounded-full" />
      <div className="absolute bottom-0 right-0 w-[500px] h-[500px] bg-purple-600/10 blur-[120px] rounded-full" />

      {/* --- CINEMATIC INTRO SECTION --- */}
      <section className="relative z-10 pt-40 pb-28 px-6 text-center border-b border-white/5">
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7 }}
          className="max-w-3xl mx-auto"
        >
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-yellow-500/30 bg-yellow-500/10 mb-6 backdrop-blur-sm">
            <Trophy className="w-4 h-4 text-yellow-400" />
            <span className="text-xs font-medium tracking-widest text-yellow-200">
              HALL OF CHAMPIONS
            </span>
          </div>

          <h1 className="text-5xl md:text-6xl font-bold tracking-tight mb-6">
            Global <span className="text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-orange-500">Leaderboard</span>
          </h1>

          <p className="text-gray-400 text-lg leading-relaxed max-w-xl mx-auto mb-10">
            The strongest minds in the CodEzy arena.  
            Ranked by precision, speed, and algorithmic dominance.
          </p>

          <a
            href="/problems"
            className="inline-flex items-center gap-3 px-8 py-4 rounded-xl bg-white text-black font-bold text-sm
                       hover:scale-105 transition-all shadow-[0_0_30px_rgba(255,255,255,0.3)]"
          >
            ENTER THE ARENA
          </a>
        </motion.div>
      </section>

      {/* --- LEADERBOARD TABLE SECTION --- */}
      <main className="relative z-10 py-24 px-6 max-w-5xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          <Leaderboard />
        </motion.div>
      </main>
    </div>
  );
};

export default LeaderboardPage;
