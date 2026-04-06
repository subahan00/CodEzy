import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import io from 'socket.io-client';
import { FiPlay, FiAward, FiAlertOctagon, FiLoader } from 'react-icons/fi';
import submissionService from '../services/submissionService/submissionService';

// Socket outside component to avoid reconnects
const socket = io.connect('http://localhost:9999');

// ✅ Fix #6: Supported languages
const SUPPORTED_LANGUAGES = ['javascript', 'python'];

const DuelRoom = () => {
  const { roomId } = useParams();
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem('user')) || { username: 'Guest' };

  const [isExecuting, setIsExecuting] = useState(false);
  const [code, setCode] = useState('');
  const [language, setLanguage] = useState('javascript'); // ✅ Fix #6

  const [myProgress, setMyProgress] = useState(0);
  const [opponentProgress, setOpponentProgress] = useState(0);
  const [opponentName, setOpponentName] = useState('Opponent'); // ✅ Fix #13: set once from duel_started

  const [winner, setWinner] = useState(null);
  const [winReason, setWinReason] = useState(null);

  // ✅ Fix #1 + #7: Problem comes from socket, not a separate fetch
  const [problem, setProblem] = useState(null);
  const [isProblemLoading, setIsProblemLoading] = useState(true);

useEffect(() => {
    // 1. ✅ Register ALL listeners FIRST
    socket.on('duel_started', (duelData) => {
      setProblem(duelData.problem);
      setIsProblemLoading(false);

      const opponent =
        duelData.player1.username === user.username
          ? duelData.player2
          : duelData.player1;
      setOpponentName(opponent.username);

      const starter = duelData.problem?.starterCode?.find(
        (s) => s.language === language
      );
      if (starter) setCode(starter.code);
    });

    socket.on('opponent_progress', (data) => {
      setOpponentProgress(data.progress);
    });

    socket.on('game_over', (data) => {
      setWinner(data.winner);
      if (data.reason) setWinReason(data.reason);
    });

    // 2. ✅ THEN emit the rejoin event WITH the username object
    socket.emit('rejoin_room', { 
        roomId: roomId, 
        username: user.username 
    });

    // 3. Cleanup
    return () => {
      socket.off('duel_started');
      socket.off('opponent_progress');
      socket.off('game_over');
    };
  }, [roomId]); // language dependency is intentionally omitted to prevent re-triggering

  const handleRunCode = async () => {
    // ✅ Fix #7: Guard against running before problem loads
    if (winner || isExecuting || !problem?._id) return;
    setIsExecuting(true);

    try {
      // ✅ Fix #6: Use language state instead of hardcoded 'javascript'
      // ✅ Fix #3: Correct response path — res.data.data.passedTests
      const res = await submissionService.runCode(language, code, problem._id);

      const passedTests = res.data.data.passedTests;
      const totalTests = res.data.data.totalTests;
      const progressPercent = Math.round((passedTests / totalTests) * 100);

      setMyProgress(progressPercent);

      socket.emit('update_progress', {
        roomId,
        progress: progressPercent,
        username: user.username,
      });

      // ✅ Fix #4: Don't set winner locally — let server decide via game_over
      if (progressPercent === 100) {
        socket.emit('duel_won', { roomId, winnerName: user.username });
      }
    } catch (err) {
      console.error('Run code error:', err);
    } finally {
      setIsExecuting(false);
    }
  };

  // ✅ Fix #6: When language changes, update starter code if available
  const handleLanguageChange = (e) => {
    const newLang = e.target.value;
    setLanguage(newLang);
    if (problem?.starterCode) {
      const starter = problem.starterCode.find((s) => s.language === newLang);
      if (starter) setCode(starter.code);
    }
  };

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-gray-200 flex flex-col font-sans">

      {/* --- VS HEADER --- */}
      <header className="bg-[#161616] border-b border-gray-800 p-4 sticky top-0 z-10 shadow-lg">
        <div className="max-w-6xl mx-auto flex justify-between items-center">
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

          <div className="text-xl font-black text-gray-500 italic px-4">VS</div>

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
      {winner && (
        <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center backdrop-blur-sm">
          <div className="bg-[#161616] p-10 rounded-2xl border border-gray-700 text-center shadow-2xl max-w-sm w-full">
            {winner === user.username ? (
              <>
                <FiAward className="text-yellow-500 text-6xl mx-auto mb-4" />
                <h2 className="text-3xl font-black text-white mb-2">VICTORY!</h2>
                <p className="text-gray-400 mb-6">
                  {winReason === 'opponent_disconnected'
                    ? 'Your opponent cowardly fled the battle!'
                    : 'You out-coded your opponent.'}
                </p>
                <div className="text-green-400 font-bold mb-6">+25 Elo Rating</div>
              </>
            ) : (
              <>
                <FiAlertOctagon className="text-red-500 text-6xl mx-auto mb-4" />
                <h2 className="text-3xl font-black text-white mb-2">DEFEAT</h2>
                <p className="text-gray-400 mb-6">{winner} finished before you.</p>
                <div className="text-red-400 font-bold mb-6">-15 Elo Rating</div>
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

        {/* Left: Problem Details */}
        <div className="bg-[#161616] border border-gray-800 rounded-2xl p-6 overflow-y-auto">
          {/* ✅ Fix #7: Loading state */}
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
                    <div key={i} className="bg-[#0a0a0a] p-3 rounded-xl border border-gray-800 font-mono text-sm text-gray-300 mb-2">
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

        {/* Right: Code Editor */}
        <div className="flex flex-col gap-4 h-full">

          {/* ✅ Fix #6: Language selector */}
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

          <div className="flex justify-end">
            {/* ✅ Fix #7: Button disabled while problem loading or _id missing */}
            <button
              onClick={handleRunCode}
              disabled={winner !== null || isExecuting || isProblemLoading}
              className={`bg-green-600 hover:bg-green-500 disabled:opacity-50 disabled:cursor-not-allowed text-white px-8 py-4 rounded-xl font-bold transition flex items-center gap-2 shadow-lg ${isExecuting ? 'cursor-wait' : ''}`}
            >
              {isExecuting
                ? <><FiLoader className="animate-spin" /> Running...</>
                : <><FiPlay /> Run Tests</>}
            </button>
          </div>
        </div>
      </main>
    </div>
  );
};

export default DuelRoom;    