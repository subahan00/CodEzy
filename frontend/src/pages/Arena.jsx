import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import io from 'socket.io-client';
import Navbar from '../component/Dashboard/Navbar';
import { FiCrosshair, FiLoader } from 'react-icons/fi';

// Connect to backend
const socket = io.connect("http://localhost:9999");

const Arena = () => {
  const [isSearching, setIsSearching] = useState(false);
  const [matchFound, setMatchFound] = useState(false);
  const [opponentInfo, setOpponentInfo] = useState(null);
  const navigate = useNavigate();

  const user = JSON.parse(localStorage.getItem('user')) || { username: 'Guest' };

  useEffect(() => {
    // 1. Backend confirms we are in the queue
    socket.on('waiting_for_match', () => {
      setIsSearching(true);
    });

    // 2. Backend confirms a match was found!
    socket.on('duel_started', (duelData) => {
      setIsSearching(false);
      setMatchFound(true);
      
      // Figure out who the opponent is
      const opponent = duelData.player1.username === user.username 
        ? duelData.player2 
        : duelData.player1;
        
      setOpponentInfo(opponent);

      // Transition to the actual coding battle UI after a 3-second countdown
      setTimeout(() => {
        // We will pass the roomId in the URL so both players go to the same private arena
        navigate(`/arena/${duelData.roomId}`);
      }, 3000);
    });

    return () => {
      socket.off('waiting_for_match');
      socket.off('duel_started');
    };
  }, [navigate, user.username]);

  const findMatch = () => {
    // Send request to backend with our user data
    socket.emit('join_queue', { username: user.username, rating: user.statistics?.totalScore || 1000 });
  };

  return (
    <div className="min-h-screen bg-[#0a0a0a] font-sans text-gray-200">
      <Navbar />

      <main className="flex items-center justify-center h-[calc(100vh-64px)]">
        <div className="bg-[#161616] p-8 rounded-2xl border border-gray-800 shadow-2xl text-center w-full max-w-md">
          
          <div className="w-20 h-20 bg-red-500/10 rounded-full flex items-center justify-center mx-auto mb-6 border-2 border-red-500 shadow-[0_0_30px_rgba(239,68,68,0.2)]">
            <FiCrosshair className="text-red-500 text-3xl" />
          </div>
          
          <h1 className="text-3xl font-bold text-white mb-2">Coding Arena</h1>
          <p className="text-gray-400 mb-8">Go head-to-head against another developer in real-time. First to pass all test cases wins.</p>

          {!isSearching && !matchFound && (
            <button 
              onClick={findMatch}
              className="w-full py-4 bg-red-600 hover:bg-red-500 text-white rounded-xl font-bold text-lg transition-transform transform hover:scale-105"
            >
              Find Match
            </button>
          )}

          {isSearching && !matchFound && (
            <div className="flex flex-col items-center gap-4 py-4">
              <FiLoader className="text-red-500 text-4xl animate-spin" />
              <p className="text-red-400 font-bold animate-pulse">Searching for opponent...</p>
              <button 
                onClick={() => window.location.reload()} // Quick hack to cancel queue for now
                className="text-sm text-gray-500 hover:text-white mt-2"
              >
                Cancel
              </button>
            </div>
          )}

          {matchFound && opponentInfo && (
            <div className="py-4 animate-bounce">
              <h2 className="text-2xl font-bold text-white">Match Found!</h2>
              <div className="mt-4 flex items-center justify-center gap-4 text-xl">
                <span className="text-blue-400 font-bold">{user.username}</span>
                <span className="text-gray-500">VS</span>
                <span className="text-red-400 font-bold">{opponentInfo.username}</span>
              </div>
              <p className="text-sm text-gray-500 mt-6">Entering arena in 3 seconds...</p>
            </div>
          )}

        </div>
      </main>
    </div>
  );
};

export default Arena;