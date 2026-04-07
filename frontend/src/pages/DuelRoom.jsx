import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import io from 'socket.io-client';
import { FiPlay, FiAward, FiAlertOctagon, FiLoader, FiClock } from 'react-icons/fi';
import submissionService from '../services/submissionService/submissionService';

const socket = io.connect('http://localhost:9999');
const SUPPORTED_LANGUAGES = ['javascript', 'python'];

// #8 — Format ms to MM:SS
const formatTime = (ms) => {
  if (ms <= 0) return '00:00';
  const totalSeconds = Math.floor(ms / 1000);
  const mins = Math.floor(totalSeconds / 60).toString().padStart(2, '0');
  const secs = (totalSeconds % 60).toString().padStart(2, '0');
  return `${mins}:${secs}`;
};

const DuelRoom = () => {
  const { roomId } = useParams();
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem('user')) || { username: 'Guest' };

  const [isExecuting, setIsExecuting] = useState(false);
  const [runError, setRunError] = useState(null);
  const [code, setCode] = useState('');
  const [language, setLanguage] = useState('javascript');

  const [myProgress, setMyProgress] = useState(0);
  const [opponentProgress, setOpponentProgress] = useState(0);
  const [opponentName, setOpponentName] = useState('Opponent');

  const [winner, setWinner] = useState(null);
  const [winReason, setWinReason] = useState(null);
  const [isDraw, setIsDraw] = useState(false);

  // #9 — Real Elo delta from server
  const [eloChange, setEloChange] = useState(null);

  const [problem, setProblem] = useState(null);
  const [isProblemLoading, setIsProblemLoading] = useState(true);

  // #8 — Timer state
  const [timeLeft, setTimeLeft] = useState(30 * 60 * 1000);
  const timerRef = useRef(null);

  const startLocalTimer = (durationMs, startTime) => {
    if (timerRef.current) clearInterval(timerRef.current);

    const tick = () => {
      const elapsed = Date.now() - startTime;
      const remaining = durationMs - elapsed;
      setTimeLeft(Math.max(0, remaining));
      if (remaining <= 0) clearInterval(timerRef.current);
    };

    tick(); // Run immediately
    timerRef.current = setInterval(tick, 1000);
  };

  useEffect(() => {
    // #12 — Remove any stale listeners before adding new ones
    // Prevents stacking if component remounts
    socket.off('duel_started');
    socket.off('opponent_progress');
    socket.off('game_over');
    socket.off('duel_error');

    socket.on('duel_started', (duelData) => {
      setProblem(duelData.problem);
      setIsProblemLoading(false);

      // #13 — Set opponent name once here only
      const opponent =
        duelData.player1.username === user.username
          ? duelData.player2
          : duelData.player1;
      setOpponentName(opponent.username);

      const starter = duelData.problem?.starterCode?.find(
        (s) => s.language === language
      );
      if (starter) setCode(starter.code);

      // #8 — Start local countdown using server's startTime
      startLocalTimer(duelData.durationMs, duelData.startTime);
    });

    socket.on('opponent_progress', (data) => {
      // #13 — Only update progress, never name
      setOpponentProgress(data.progress);
    });

    socket.on('game_over', (data) => {
      setWinner(data.winner);
      if (data.reason) setWinReason(data.reason);
      if (data.isDraw) setIsDraw(true);
      // #9 — Store real Elo delta from server
      if (data.eloChange) setEloChange(data.eloChange);
      // Stop timer
      if (timerRef.current) clearInterval(timerRef.current);
    });

    socket.on('duel_error', (data) => {
      alert(data.message); // Or replace with a toast
    });

    socket.emit('rejoin_room', {
      roomId,
      username: user.username
    });

    return () => {
      socket.off('duel_started');
      socket.off('opponent_progress');
      socket.off('game_over');
      socket.off('duel_error');
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [roomId]);

  // #14 — Guard: problem._id must exist, problem must be loaded
const handleRunCode = async () => {
  if (winner || isExecuting || !problem?._id || isProblemLoading) return;
  setIsExecuting(true);
  setRunError(null);

  try {
    const res = await submissionService.runCode(language, code, problem._id);

    const passedTests = res.data.data.passedTests;
    const totalTests = res.data.data.totalTests;
    const progressPercent = Math.round((passedTests / totalTests) * 100);

    setMyProgress(progressPercent);

    // ✅ Only report progress — server decides if this is a win
    socket.emit('update_progress', {
      roomId,
      progress: progressPercent,
      username: user.username,
    });

    // ❌ if (progressPercent === 100) socket.emit('duel_won') — removed entirely

  } catch (err) {
    console.error('Run code error:', err);
    setRunError(
      err.response?.data?.message || 'Execution failed. Check your code and try again.'
    );
  } finally {
    setIsExecuting(false);
  }
};

  const handleLanguageChange = (e) => {
    const newLang = e.target.value;
    setLanguage(newLang);
    if (problem?.starterCode) {
      const starter = problem.starterCode.find((s) => s.language === newLang);
      if (starter) setCode(starter.code);
    }
  };

  // #8 — Timer color: green > 10min, yellow > 5min, red <= 5min
  const timerColor =
    timeLeft > 10 * 60 * 1000
      ? 'text-green-400'
      : timeLeft > 5 * 60 * 1000
      ? 'text-yellow-400'
      : 'text-red-400 animate-pulse';

  // #9 — Compute Elo display
  const myEloDelta = eloChange
    ? winner === user.username
      ? eloChange.winnerDelta
      : eloChange.loserDelta
    : null;

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-gray-200 flex flex-col font-sans">

      {/* --- HEADER --- */}
      <header className="bg-[#161616] border-b border-gray-800 p-4 sticky top-0 z-10 shadow-lg">
        <div className="max-w-6xl mx-auto flex justify-between items-center">

          {/* My Progress */}
          <div className="w-1/3">
            <div className="flex justify-between text-xs font-bold mb-1">
              <span className="text-blue-400">{user.username} (You)</span>
              <span>{myProgress}%</span>
            </div>
            <div className="w-full bg-gray-800 rounded-full h-2">
              <div
                className="bg-blue-500 h-2 rounded-full transition-all duration-500"
                style={{ width: `${myProgress}%` }}
              />
            </div>
          </div>

          {/* #8 — Timer in the center */}
          <div className="flex flex-col items-center px-4">
            <FiClock className={`text-lg mb-0.5 ${timerColor}`} />
            <span className={`text-lg font-black font-mono ${timerColor}`}>
              {formatTime(timeLeft)}
            </span>
          </div>

          {/* Opponent Progress */}
          <div className="w-1/3">
            <div className="flex justify-between text-xs font-bold mb-1">
              <span>{opponentProgress}%</span>
              <span className="text-red-400">{opponentName}</span>
            </div>
            <div className="w-full bg-gray-800 rounded-full h-2 flex justify-end">
              <div
                className="bg-red-500 h-2 rounded-full transition-all duration-500"
                style={{ width: `${opponentProgress}%` }}
              />
            </div>
          </div>

        </div>
      </header>

      {/* --- GAME OVER OVERLAY --- */}
      {(winner !== null || isDraw) && (
        <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center backdrop-blur-sm">
          <div className="bg-[#161616] p-10 rounded-2xl border border-gray-700 text-center shadow-2xl max-w-sm w-full">
            {isDraw ? (
              <>
                <div className="text-yellow-400 text-6xl mx-auto mb-4">🤝</div>
                <h2 className="text-3xl font-black text-white mb-2">DRAW!</h2>
                <p className="text-gray-400 mb-6">Time's up — equal progress. No Elo change.</p>
              </>
            ) : winner === user.username ? (
              <>
                <FiAward className="text-yellow-500 text-6xl mx-auto mb-4" />
                <h2 className="text-3xl font-black text-white mb-2">VICTORY!</h2>
                <p className="text-gray-400 mb-6">
                  {winReason === 'opponent_disconnected'
                    ? 'Your opponent cowardly fled the battle!'
                    : winReason === 'time_up'
                    ? "Time's up — you had more tests passing!"
                    : 'You out-coded your opponent.'}
                </p>
                {/* #9 — Real Elo delta */}
                <div className="text-green-400 font-bold mb-6">
                  {myEloDelta !== null ? `+${myEloDelta} Elo Rating` : '+Elo Rating'}
                </div>
              </>
            ) : (
              <>
                <FiAlertOctagon className="text-red-500 text-6xl mx-auto mb-4" />
                <h2 className="text-3xl font-black text-white mb-2">DEFEAT</h2>
                <p className="text-gray-400 mb-6">
                  {winReason === 'time_up'
                    ? "Time's up — opponent had more tests passing."
                    : `${winner} finished before you.`}
                </p>
                {/* #9 — Real Elo delta */}
                <div className="text-red-400 font-bold mb-6">
                  {myEloDelta !== null ? `${myEloDelta} Elo Rating` : '-Elo Rating'}
                </div>
              </>
            )}
            <button
              onClick={() => navigate('/dashboard')}
              className="w-full py-3 bg-gray-700 hover:bg-gray-600 text-white rounded-xl font-bold transition"
            >
              Back to Dashboard
            </button>
          </div>
        </div>
      )}

      {/* --- WORKSPACE --- */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 grid grid-cols-1 lg:grid-cols-2 gap-4 h-[calc(100vh-80px)]">

        {/* Left: Problem */}
        <div className="bg-[#161616] border border-gray-800 rounded-2xl p-6 overflow-y-auto">
          {isProblemLoading ? (
            <div className="flex flex-col items-center justify-center h-full gap-4 text-gray-500">
              <FiLoader className="text-3xl animate-spin" />
              <p>Loading problem...</p>
            </div>
          ) : (
            <>
              <h1 className="text-2xl font-bold text-white mb-4">{problem.title}</h1>
              <p className="text-gray-400 leading-relaxed mb-6">{problem.problemStatement}</p>
              {problem.examples?.length > 0 && (
                <div className="mb-6">
                  <h3 className="text-sm font-bold text-gray-300 mb-2">Examples</h3>
                  {problem.examples.map((ex, i) => (
                    <div
                      key={i}
                      className="bg-[#0a0a0a] p-3 rounded-xl border border-gray-800 font-mono text-sm text-gray-300 mb-2"
                    >
                      <div><span className="text-gray-500">Input:</span> {ex.input}</div>
                      <div><span className="text-gray-500">Output:</span> {ex.output}</div>
                      {ex.explanation && (
                        <div><span className="text-gray-500">Explanation:</span> {ex.explanation}</div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </>
          )}
        </div>

        {/* Right: Editor */}
        <div className="flex flex-col gap-4 h-full">
          <div className="flex items-center gap-3">
            <label className="text-xs text-gray-400 font-bold">Language:</label>
            <select
              value={language}
              onChange={handleLanguageChange}
              disabled={winner !== null}
              className="bg-[#1e1e1e] text-gray-200 border border-gray-700 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:border-blue-500"
            >
              {SUPPORTED_LANGUAGES.map((lang) => (
                <option key={lang} value={lang}>
                  {lang.charAt(0).toUpperCase() + lang.slice(1)}
                </option>
              ))}
            </select>
          </div>

          <textarea
            value={code}
            onChange={(e) => setCode(e.target.value)}
            disabled={winner !== null}
            className="flex-1 bg-[#1e1e1e] text-gray-200 p-4 rounded-2xl border border-gray-800 font-mono text-sm focus:outline-none focus:border-blue-500 resize-none shadow-inner"
            placeholder="// Write your solution here..."
          />

          <div className="flex flex-col gap-2">
            <div className="flex justify-end">
              <button
                onClick={handleRunCode}
                disabled={winner !== null || isExecuting || isProblemLoading}
                className={`bg-green-600 hover:bg-green-500 disabled:opacity-50 disabled:cursor-not-allowed
                  text-white px-8 py-4 rounded-xl font-bold transition flex items-center gap-2 shadow-lg
                  ${isExecuting ? 'cursor-wait' : ''}`}
              >
                {isExecuting
                  ? <><FiLoader className="animate-spin" /> Running...</>
                  : <><FiPlay /> Run Tests</>}
              </button>
            </div>
            {runError && (
              <p className="text-red-400 text-xs text-right font-mono">{runError}</p>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

export default DuelRoom;