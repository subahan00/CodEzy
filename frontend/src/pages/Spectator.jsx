import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { io } from 'socket.io-client';
import { FiEye, FiLoader, FiClock } from 'react-icons/fi';

// Reuse the same singleton socket as DuelRoom / Arena
let socket = null;
const getSocket = () => {
  if (!socket) {
    socket = io(import.meta.env.VITE_BACKEND_URL, { reconnection: true });
  }
  return socket;
};

const formatTime = (ms) => {
  if (ms <= 0) return '00:00';
  const s = Math.floor(ms / 1000);
  return `${String(Math.floor(s / 60)).padStart(2,'0')}:${String(s % 60).padStart(2,'0')}`;
};

const Spectator = () => {
  const { roomId }  = useParams();
  const navigate    = useNavigate();
  const user        = JSON.parse(localStorage.getItem('user')) || { username: 'Guest' };

  const [duel, setDuel]             = useState(null);
  const [p1Progress, setP1Progress] = useState(0);
  const [p2Progress, setP2Progress] = useState(0);
  const [timeLeft, setTimeLeft]     = useState(0);
  const [gameOver, setGameOver]     = useState(null);
  const [loading, setLoading]       = useState(true);

  const timerRef = useRef(null);

  const startTimer = useCallback((durationMs, startTime) => {
    if (timerRef.current) clearInterval(timerRef.current);
    const tick = () => {
      const left = durationMs - (Date.now() - startTime);
      setTimeLeft(Math.max(0, left));
      if (left <= 0) clearInterval(timerRef.current);
    };
    tick();
    timerRef.current = setInterval(tick, 1000);
  }, []);

  useEffect(() => {
    const sock = getSocket();

    sock.on('spectate_started', ({ duel: d, durationMs, startTime }) => {
      setDuel(d);
      setP1Progress(d.player1.progress ?? 0);
      setP2Progress(d.player2.progress ?? 0);
      setLoading(false);
      startTimer(durationMs, startTime);
    });

    sock.on('opponent_progress', ({ username, progress }) => {
      if (!duel) return;
      if (username === duel?.player1?.username) setP1Progress(progress);
      else setP2Progress(progress);
    });

    sock.on('game_over', (data) => {
      setGameOver(data);
      if (timerRef.current) clearInterval(timerRef.current);
    });

    sock.on('duel_error', ({ message }) => {
      alert(message);
      navigate('/arena');
    });

    sock.emit('spectate_room', { roomId, username: user.username });

    return () => {
      sock.off('spectate_started');
      sock.off('opponent_progress');
      sock.off('game_over');
      sock.off('duel_error');
      sock.emit('leave_spectate', { roomId, username: user.username });
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [roomId, navigate, startTimer, user.username]);

  // Re-subscribe opponent_progress with latest duel state
  useEffect(() => {
    if (!duel) return;
    const sock = getSocket();
    const handler = ({ username, progress }) => {
      if (username === duel.player1.username) setP1Progress(progress);
      else setP2Progress(progress);
    };
    sock.off('opponent_progress');
    sock.on('opponent_progress', handler);
    return () => sock.off('opponent_progress', handler);
  }, [duel]);

  const timerColor = timeLeft > 10 * 60_000
    ? 'text-green-400'
    : timeLeft > 5 * 60_000
    ? 'text-yellow-400'
    : 'text-red-400 animate-pulse';

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center text-gray-400">
        <FiLoader className="text-4xl animate-spin mr-3" />
        <span>Joining as spectator…</span>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-gray-200 font-sans">

      {/* Header */}
      <header className="bg-[#161616] border-b border-gray-800 p-4 sticky top-0 z-10 shadow-lg">
        <div className="max-w-4xl mx-auto flex justify-between items-center">

          <div className="w-5/12">
            <div className="flex justify-between text-xs font-bold mb-1">
              <span className="text-blue-400">{duel?.player1?.username}</span>
              <span>{p1Progress}%</span>
            </div>
            <div className="w-full bg-gray-800 rounded-full h-2">
              <div className="bg-blue-500 h-2 rounded-full transition-all duration-500"
                   style={{ width: `${p1Progress}%` }} />
            </div>
          </div>

          <div className="flex flex-col items-center">
            <span className="text-xs text-gray-500 flex items-center gap-1 mb-0.5">
              <FiEye /> Spectating
            </span>
            <FiClock className={`text-sm ${timerColor}`} />
            <span className={`text-base font-black font-mono ${timerColor}`}>
              {formatTime(timeLeft)}
            </span>
          </div>

          <div className="w-5/12">
            <div className="flex justify-between text-xs font-bold mb-1">
              <span>{p2Progress}%</span>
              <span className="text-red-400">{duel?.player2?.username}</span>
            </div>
            <div className="w-full bg-gray-800 rounded-full h-2">
              <div className="bg-red-500 h-2 rounded-full transition-all duration-500"
                   style={{ width: `${p2Progress}%` }} />
            </div>
          </div>
        </div>
      </header>

      {/* Game over overlay */}
      {gameOver && (
        <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center backdrop-blur-sm">
          <div className="bg-[#161616] p-10 rounded-2xl border border-gray-700 text-center shadow-2xl max-w-sm w-full">
            {gameOver.isDraw ? (
              <>
                <div className="text-yellow-400 text-5xl mb-4">🤝</div>
                <h2 className="text-3xl font-black text-white mb-2">DRAW!</h2>
                <p className="text-gray-400 mb-6">Time's up — equal progress.</p>
              </>
            ) : (
              <>
                <div className="text-yellow-400 text-5xl mb-4">🏆</div>
                <h2 className="text-3xl font-black text-white mb-2">{gameOver.winner} wins!</h2>
                <p className="text-gray-400 mb-6">
                  {gameOver.reason === 'opponent_disconnected'
                    ? 'Opponent disconnected.'
                    : gameOver.reason === 'time_up'
                    ? "Time's up — winner had more tests passing."
                    : 'All tests passed first.'}
                </p>
              </>
            )}
            <button
              onClick={() => navigate('/arena')}
              className="w-full py-3 bg-gray-700 hover:bg-gray-600 text-white rounded-xl font-bold transition"
            >
              Back to Arena
            </button>
          </div>
        </div>
      )}

      {/* Problem display — read-only */}
      <main className="max-w-3xl mx-auto p-6">
        <div className="bg-[#161616] border border-gray-800 rounded-2xl p-6">
          <h1 className="text-2xl font-bold text-white mb-4">{duel?.problem?.title}</h1>
          <p className="text-gray-400 leading-relaxed mb-6">{duel?.problem?.problemStatement}</p>
          {duel?.problem?.examples?.map((ex, i) => (
            <div key={i}
                 className="bg-[#0a0a0a] p-3 rounded-xl border border-gray-800 font-mono text-sm text-gray-300 mb-2">
              <div><span className="text-gray-500">Input:</span> {ex.input}</div>
              <div><span className="text-gray-500">Output:</span> {ex.output}</div>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
};

export default Spectator;