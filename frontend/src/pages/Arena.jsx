import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { io } from 'socket.io-client';
import Navbar from '../component/Dashboard/Navbar';
import { FiCrosshair, FiLoader, FiEye } from 'react-icons/fi';

// Stable singleton — same fix as DuelRoom so both pages share one connection
let socket = null;
const getSocket = () => {
  if (!socket) {
    socket = io('http://localhost:9999', {
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionAttempts: 10,
    });
  }
  return socket;
};

const Arena = () => {
  const [isSearching, setIsSearching]     = useState(false);
  const [matchFound, setMatchFound]       = useState(false);
  const [opponentInfo, setOpponentInfo]   = useState(null);
  const [liveDuels, setLiveDuels]         = useState([]);
  const [countdown, setCountdown]         = useState(3);
  const navigate = useNavigate();

  const user = JSON.parse(localStorage.getItem('user')) || { username: 'Guest' };

  useEffect(() => {
    const sock = getSocket();

    const onWaiting      = ()      => setIsSearching(true);
    const onAlreadyDuel  = ()      => alert('You are already in an active duel!');
    const onLeftQueue    = ()      => setIsSearching(false);
    const onLiveDuels    = (list)  => setLiveDuels(list);

    const onDuelStarted = (duelData) => {
      setIsSearching(false);
      setMatchFound(true);

      const opponent = duelData.player1.username === user.username
        ? duelData.player2
        : duelData.player1;
      setOpponentInfo(opponent);

      // Countdown then navigate
      let count = 3;
      setCountdown(count);
      const interval = setInterval(() => {
        count -= 1;
        setCountdown(count);
        if (count <= 0) {
          clearInterval(interval);
          navigate(`/arena/${duelData.roomId}`);
        }
      }, 1000);
    };

    sock.on('waiting_for_match', onWaiting);
    sock.on('already_in_duel',   onAlreadyDuel);
    sock.on('duel_started',      onDuelStarted);
    sock.on('left_queue',        onLeftQueue);
    sock.on('live_duels',        onLiveDuels);

    // Fetch live duels for the lobby
    sock.emit('get_live_duels');

    return () => {
      sock.off('waiting_for_match', onWaiting);
      sock.off('already_in_duel',   onAlreadyDuel);
      sock.off('duel_started',      onDuelStarted);
      sock.off('left_queue',        onLeftQueue);
      sock.off('live_duels',        onLiveDuels);
    };
  }, [navigate, user.username]);

  const findMatch = () => {
    getSocket().emit('join_queue', {
      username: user.username,
      rating: user.statistics?.eloRating ?? 1000,
    });
  };

  const cancelSearch = () => {
    // Properly tell the server to remove us from the queue
    getSocket().emit('leave_queue');
    setIsSearching(false);
  };

  const spectate = (roomId) => {
    navigate(`/spectate/${roomId}`);
  };

  return (
    <div className="min-h-screen bg-[#0a0a0a] font-sans text-gray-200">
      <Navbar />

      <main className="max-w-2xl mx-auto px-4 py-12 space-y-8">

        {/* Match card */}
        <div className="bg-[#161616] p-8 rounded-2xl border border-gray-800 shadow-2xl text-center">
          <div className="w-20 h-20 bg-red-500/10 rounded-full flex items-center justify-center mx-auto mb-6
                          border-2 border-red-500 shadow-[0_0_30px_rgba(239,68,68,0.2)]">
            <FiCrosshair className="text-red-500 text-3xl" />
          </div>

          <h1 className="text-3xl font-bold text-white mb-2">Coding Arena</h1>
          <p className="text-gray-400 mb-8">
            Go head-to-head against another developer in real-time.
            First to pass all test cases wins.
          </p>

          {!isSearching && !matchFound && (
            <button
              onClick={findMatch}
              className="w-full py-4 bg-red-600 hover:bg-red-500 text-white rounded-xl font-bold text-lg
                         transition-transform transform hover:scale-105"
            >
              Find Match
            </button>
          )}

          {isSearching && !matchFound && (
            <div className="flex flex-col items-center gap-4 py-4">
              <FiLoader className="text-red-500 text-4xl animate-spin" />
              <p className="text-red-400 font-bold animate-pulse">Searching for opponent…</p>
              <button
                onClick={cancelSearch}
                className="text-sm text-gray-500 hover:text-white mt-2 transition"
              >
                Cancel
              </button>
            </div>
          )}

          {matchFound && opponentInfo && (
            <div className="py-4">
              <h2 className="text-2xl font-bold text-white">Match Found!</h2>
              <div className="mt-4 flex items-center justify-center gap-4 text-xl">
                <span className="text-blue-400 font-bold">{user.username}</span>
                <span className="text-gray-500">VS</span>
                <span className="text-red-400 font-bold">{opponentInfo.username}</span>
              </div>
              <p className="text-sm text-gray-500 mt-6 animate-pulse">
                Entering arena in {countdown}…
              </p>
            </div>
          )}
        </div>

        {/* Live duels lobby */}
        {liveDuels.length > 0 && (
          <div className="bg-[#161616] rounded-2xl border border-gray-800 shadow-xl overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-800 flex items-center gap-2">
              <FiEye className="text-gray-400" />
              <h2 className="text-sm font-bold text-gray-300">Live Duels</h2>
            </div>
            <ul className="divide-y divide-gray-800">
              {liveDuels.map(duel => (
                <li key={duel.roomId}
                    className="px-6 py-4 flex items-center justify-between hover:bg-white/5 transition">
                  <div>
                    <span className="text-blue-400 font-semibold">{duel.player1}</span>
                    <span className="text-gray-500 mx-2">vs</span>
                    <span className="text-red-400 font-semibold">{duel.player2}</span>
                  </div>
                  <div className="flex items-center gap-4">
                    {/* Mini progress bars */}
                    <div className="w-20 space-y-1 text-right">
                      <div className="text-xs text-blue-400">{duel.p1Progress}%</div>
                      <div className="w-full bg-gray-800 rounded-full h-1">
                        <div className="bg-blue-500 h-1 rounded-full" style={{ width: `${duel.p1Progress}%` }} />
                      </div>
                      <div className="text-xs text-red-400">{duel.p2Progress}%</div>
                      <div className="w-full bg-gray-800 rounded-full h-1">
                        <div className="bg-red-500 h-1 rounded-full" style={{ width: `${duel.p2Progress}%` }} />
                      </div>
                    </div>
                    <button
                      onClick={() => spectate(duel.roomId)}
                      className="text-xs bg-gray-700 hover:bg-gray-600 text-white px-3 py-1.5 rounded-lg transition"
                    >
                      Watch
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        )}
      </main>
    </div>
  );
};

export default Arena;