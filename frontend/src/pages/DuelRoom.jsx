import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { io } from 'socket.io-client';
import submissionService from '../services/submissionService/submissionService';

const SUPPORTED_LANGUAGES = ['javascript', 'python'];

const formatTime = (ms) => {
  if (ms <= 0) return '00:00';
  const s = Math.floor(ms / 1000);
  return `${String(Math.floor(s / 60)).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}`;
};

let _socket = null;
const getSocket = () => {
  if (!_socket) _socket = io(import.meta.env.VITE_BACKEND_URL, { reconnection: true, reconnectionDelay: 1000 });
  return _socket;
};

const KillFeed = ({ events }) => (
  <div style={{ position:'fixed', top:80, right:20, zIndex:100, display:'flex', flexDirection:'column', gap:6, pointerEvents:'none', width:280 }}>
    {events.map(e => (
      <div key={e.id} style={{
        background:'rgba(7,11,15,0.92)', border:`1px solid ${e.color}44`, color:e.color,
        padding:'5px 12px', fontSize:11, fontFamily:'JetBrains Mono,monospace',
        fontWeight:700, letterSpacing:1,
        animation:'kfIn 0.2s ease, kfOut 0.4s ease 2.6s forwards',
        backdropFilter:'blur(8px)', borderRadius:2,
      }}>{e.msg}</div>
    ))}
  </div>
);

const FloatText = ({ items }) => (
  <>
    {items.map(item => (
      <div key={item.id} style={{
        position:'fixed', left:`calc(50% + ${item.dx}px)`, top:`calc(50% + ${item.dy}px)`,
        transform:'translateX(-50%)', zIndex:300, pointerEvents:'none',
        color:item.color, fontFamily:"'Bebas Neue','Impact',sans-serif",
        fontSize:item.sz || 32, fontWeight:900, letterSpacing:2, whiteSpace:'nowrap',
        textShadow:`0 0 24px ${item.color}88`,
        animation:'floatUp 1.1s ease forwards',
      }}>{item.text}</div>
    ))}
  </>
);

export default function DuelRoom() {
  const { roomId } = useParams();
  const navigate   = useNavigate();
  const user = JSON.parse(localStorage.getItem('user')) || { username: 'Guest' };

  const [code, setCode]         = useState('');
  const [language, setLanguage] = useState('javascript');
  const langRef                 = useRef('javascript');

  const [problem, setProblem]   = useState(null);
  const [loading, setLoading]   = useState(true);

  const [myPct, setMyPct]       = useState(0);
  const [oppPct, setOppPct]     = useState(0);
  const [oppName, setOppName]   = useState('???');
  const [myTests, setMyTests]   = useState({ passed:0, total:0 });

  const [isRunning, setIsRunning]   = useState(false);
  const [runError, setRunError]     = useState(null);
  const [lastResult, setLastResult] = useState(null);

  const [timeLeft, setTimeLeft] = useState(30 * 60 * 1000);
  const timerRef                = useRef(null);

  const [streak, setStreak]   = useState(0);
  const streakRef             = useRef(0);
  const [totalXP, setTotalXP] = useState(0);
  const prevPctRef            = useRef(0);

  const [gameResult, setGameResult] = useState(null);
  const [oppDisc, setOppDisc]       = useState(false);
  const [graceLeft, setGraceLeft]   = useState(null);
  const graceRef                    = useRef(null);

  const [feed, setFeed]         = useState([]);
  const [floats, setFloats]     = useState([]);
  const [flash, setFlash]       = useState(null);

  const feedId  = useRef(0);
  const floatId = useRef(0);

  const addFeed = useCallback((msg, color = '#00ff88') => {
    const id = feedId.current++;
    setFeed(p => [...p.slice(-4), { id, msg, color }]);
    setTimeout(() => setFeed(p => p.filter(e => e.id !== id)), 3000);
  }, []);

  const addFloat = useCallback((text, color, dx = 0, dy = -80, sz = 32) => {
    const id = floatId.current++;
    setFloats(p => [...p, { id, text, color, dx, dy, sz }]);
    setTimeout(() => setFloats(p => p.filter(f => f.id !== id)), 1200);
  }, []);

  const triggerFlash = useCallback((type) => {
    setFlash(type);
    setTimeout(() => setFlash(null), 300);
  }, []);

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
    ['duel_started','opponent_progress','game_over','duel_error','opponent_disconnected'].forEach(e => sock.off(e));

    sock.on('duel_started', (d) => {
      setProblem(d.problem);
      setLoading(false);
      const opp = d.player1.username === user.username ? d.player2 : d.player1;
      setOppName(opp.username);
      const starter = d.problem?.starterCode?.find(s => s.language === langRef.current);
      if (starter) setCode(starter.code);
      if (d.isRejoin) { setMyPct(d.myProgress ?? 0); setOppPct(d.opponentProgress ?? 0); }
      startTimer(d.durationMs, d.startTime ?? Date.now());
      addFeed('⚔  DUEL STARTED — CODE OR DIE', '#ff4444');
    });

    sock.on('opponent_progress', ({ progress }) => {
      setOppPct(prev => {
        if (progress > prev) { addFeed(`${oppName.toUpperCase()} +${progress - prev}%`, '#ff6b6b'); triggerFlash('damage'); }
        return progress;
      });
    });

    sock.on('game_over', (data) => {
      setGameResult(data);
      if (timerRef.current) clearInterval(timerRef.current);
      if (graceRef.current) clearInterval(graceRef.current);
      setOppDisc(false);
    });

    sock.on('opponent_disconnected', ({ gracePeriodMs }) => {
      setOppDisc(true); setGraceLeft(gracePeriodMs);
      addFeed('⚡ OPPONENT DISCONNECTED', '#facc15');
      const start = Date.now();
      if (graceRef.current) clearInterval(graceRef.current);
      graceRef.current = setInterval(() => {
        const left = gracePeriodMs - (Date.now() - start);
        if (left <= 0) { clearInterval(graceRef.current); setGraceLeft(0); }
        else setGraceLeft(left);
      }, 500);
    });

    sock.on('duel_error', ({ message }) => alert(message));
    sock.emit('rejoin_room', { roomId, username: user.username });

    return () => {
      ['duel_started','opponent_progress','game_over','duel_error','opponent_disconnected'].forEach(e => sock.off(e));
      if (timerRef.current) clearInterval(timerRef.current);
      if (graceRef.current) clearInterval(graceRef.current);
    };
  }, [roomId, startTimer, addFeed, triggerFlash]);

  useEffect(() => { langRef.current = language; }, [language]);

  const handleRun = async () => {
    if (gameResult || isRunning || !problem?._id || loading) return;
    setIsRunning(true); setRunError(null);
    try {
      const res = await submissionService.runCode(language, code, problem._id);
      const { passedTests, totalTests } = res.data.data;
      const pct = totalTests > 0 ? Math.round((passedTests / totalTests) * 100) : 0;
      setMyTests({ passed: passedTests, total: totalTests });
      const prev = prevPctRef.current;
      const gain = pct - prev;
      const currentStreak = streakRef.current;

      if (passedTests === totalTests && totalTests > 0) {
        setLastResult('pass');
        const ns = currentStreak + 1;
        streakRef.current = ns;
        setStreak(ns);
        const xp = 500 + ns * 100;
        setTotalXP(t => t + xp);
        addFloat(`+${xp} XP`, '#00ff88', 0, -90, 42);
        if (ns > 1) addFloat(`🔥 ${ns}x STREAK`, '#ff9900', 0, -140, 26);
        addFeed(`✓ ALL ${totalTests} TESTS PASS  +${xp}XP`, '#00ff88');
        triggerFlash('crit');
      } else if (gain > 0) {
        setLastResult('partial');
        streakRef.current = 0; setStreak(0);
        const xp = gain * 10;
        setTotalXP(t => t + xp);
        addFloat(`+${xp} XP`, '#60a5fa', 0, -80, 26);
        addFeed(`↑ ${passedTests}/${totalTests} PASSING (+${gain}%)`, '#60a5fa');
        triggerFlash('hit');
      } else if (gain < 0) {
        setLastResult('fail');
        streakRef.current = 0; setStreak(0);
        addFloat('REGRESSION', '#ff4444', 0, -80, 22);
        addFeed(`✗ DROPPED TO ${passedTests}/${totalTests}`, '#ff4444');
        triggerFlash('damage');
      } else {
        setLastResult('fail');
        streakRef.current = 0; setStreak(0);
        addFeed(`✗ ${passedTests}/${totalTests} — FIX YOUR CODE`, '#ff6b6b');
      }

      prevPctRef.current = pct;
      setMyPct(pct);
      getSocket().emit('update_progress', { roomId, progress: pct, username: user.username });
    } catch (err) {
      setRunError(err.response?.data?.message || 'Execution error.');
      addFeed('⚠ EXECUTION ERROR', '#ef4444');
    } finally {
      setIsRunning(false);
    }
  };

  const handleLangChange = (e) => {
    const l = e.target.value;
    setLanguage(l);
    if (problem?.starterCode) {
      const s = problem.starterCode.find(x => x.language === l);
      if (s) setCode(s.code);
    }
  };

  const urgent   = timeLeft < 5 * 60 * 1000;
  const critical = timeLeft < 60 * 1000;
  const myLead   = myPct > oppPct;

  const myElo = gameResult?.eloChange
    ? (gameResult.winner === user.username ? gameResult.eloChange.winnerDelta : gameResult.eloChange.loserDelta)
    : null;

  const flashShadow = flash === 'crit'   ? 'inset 0 0 120px 40px rgba(0,255,136,0.2)'
                    : flash === 'hit'    ? 'inset 0 0 80px 20px rgba(96,165,250,0.18)'
                    : flash === 'damage' ? 'inset 0 0 120px 40px rgba(255,68,68,0.22)'
                    : 'none';

  const gameOver = !!gameResult;

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Bebas+Neue&family=JetBrains+Mono:wght@400;700&family=Syne:wght@400;700;800&display=swap');
        *{box-sizing:border-box;margin:0;padding:0;}
        :root{
          --bg0:#070b0f; --bg1:#0d1117; --bg2:#111820; --bg3:#1a2233;
          --accent:#00ff88; --blue:#0ea5e9; --danger:#ff4444; --warn:#facc15;
          --t1:#e2e8f0; --t2:#64748b; --t3:#1e293b;
          --fhud:'Bebas Neue','Impact',sans-serif;
          --fmono:'JetBrains Mono',monospace;
          --fui:'Syne',sans-serif;
        }
        @keyframes kfIn{from{opacity:0;transform:translateX(16px)}to{opacity:1;transform:translateX(0)}}
        @keyframes kfOut{from{opacity:1}to{opacity:0;transform:translateX(16px)}}
        @keyframes floatUp{from{opacity:1;transform:translateX(-50%) translateY(0) scale(1)}to{opacity:0;transform:translateX(-50%) translateY(-72px) scale(1.15)}}
        @keyframes spin{to{transform:rotate(360deg)}}
        @keyframes blink{0%,100%{opacity:1}50%{opacity:0.15}}
        @keyframes slideUp{from{opacity:0;transform:translateY(24px)}to{opacity:1;transform:translateY(0)}}
        @keyframes glowPulse{0%,100%{box-shadow:0 0 10px var(--accent)}50%{box-shadow:0 0 28px var(--accent),0 0 56px rgba(0,255,136,0.3)}}
        @keyframes victoryShine{0%{background-position:200% center}100%{background-position:-200% center}}
        body{background:var(--bg0);}
        .dr{min-height:100vh;background:var(--bg0);color:var(--t1);font-family:var(--fui);position:relative;overflow:hidden;}
        .dr::before{content:'';position:fixed;inset:0;background:repeating-linear-gradient(0deg,transparent,transparent 2px,rgba(0,0,0,0.025) 2px,rgba(0,0,0,0.025) 4px);pointer-events:none;z-index:999;}
        .gridbg{position:fixed;inset:0;background-image:linear-gradient(rgba(0,255,136,0.028) 1px,transparent 1px),linear-gradient(90deg,rgba(0,255,136,0.028) 1px,transparent 1px);background-size:64px 64px;pointer-events:none;z-index:0;}

        /* HUD */
        .hud{position:sticky;top:0;z-index:50;background:rgba(7,11,15,0.96);border-bottom:1px solid rgba(0,255,136,0.1);backdrop-filter:blur(24px);}
        .hud-in{max-width:1400px;margin:0 auto;display:grid;grid-template-columns:1fr 180px 1fr;align-items:center;height:68px;padding:0 24px;gap:12px;}

        /* Player block */
        .pb{display:flex;flex-direction:column;gap:7px;}
        .pb.r{align-items:flex-end;}
        .pname{font-family:var(--fhud);font-size:17px;letter-spacing:2px;display:flex;align-items:center;gap:8px;}
        .pname.r{flex-direction:row-reverse;}
        .you-tag{font-family:var(--fui);font-size:9px;font-weight:700;letter-spacing:2px;padding:2px 6px;border:1px solid var(--accent);color:var(--accent);border-radius:2px;}
        .offline-tag{font-family:var(--fui);font-size:9px;font-weight:700;letter-spacing:2px;padding:2px 6px;border:1px solid var(--warn);color:var(--warn);border-radius:2px;}

        .hprow{display:flex;align-items:center;gap:8px;}
        .hprow.r{flex-direction:row-reverse;}
        .hptrack{height:8px;width:260px;background:var(--bg3);border-radius:1px;overflow:hidden;position:relative;}
        .hptrack::after{content:'';position:absolute;inset:0;background:repeating-linear-gradient(90deg,rgba(255,255,255,0.04) 0,rgba(255,255,255,0.04) 1px,transparent 1px,transparent 20px);}
        .hpfill{height:100%;border-radius:1px;transition:width 0.55s cubic-bezier(0.34,1.56,0.64,1);}
        .hpfill.me{background:linear-gradient(90deg,#009955,#00ff88);}
        .hpfill.me.lead{animation:glowPulse 2s ease infinite;}
        .hpfill.opp{background:linear-gradient(90deg,#aa1111,#ff4444);}
        .hppct{font-family:var(--fhud);font-size:14px;letter-spacing:1px;min-width:36px;}
        .hppct.me{color:var(--accent);}
        .hppct.opp{color:var(--danger);text-align:right;}

        /* Clock */
        .clock-wrap{display:flex;flex-direction:column;align-items:center;gap:0;}
        .clockval{font-family:var(--fhud);font-size:40px;letter-spacing:4px;line-height:1;transition:color 0.4s;}
        .clockval.safe{color:var(--accent);}
        .clockval.warn{color:var(--warn);}
        .clockval.crit{color:var(--danger);animation:blink 0.7s ease infinite;}
        .vs{font-family:var(--fhud);font-size:10px;letter-spacing:5px;color:var(--t2);}

        /* Disc banner */
        .disc{background:rgba(250,204,21,0.07);border-top:1px solid rgba(250,204,21,0.2);padding:5px 24px;font-family:var(--fmono);font-size:11px;color:var(--warn);letter-spacing:1px;display:flex;justify-content:space-between;align-items:center;}

        /* Flash */
        .flash-overlay{position:fixed;inset:0;pointer-events:none;z-index:998;transition:box-shadow 0.08s;}

        /* Game over */
        .go-backdrop{position:fixed;inset:0;z-index:200;display:flex;align-items:center;justify-content:center;background:rgba(0,0,0,0.9);backdrop-filter:blur(16px);}
        .go-card{background:var(--bg1);border:1px solid rgba(255,255,255,0.08);border-radius:3px;padding:48px 52px;text-align:center;max-width:440px;width:90%;animation:slideUp 0.35s ease;position:relative;overflow:hidden;}
        .go-card.win{border-color:rgba(0,255,136,0.25);}
        .go-card.lose{border-color:rgba(255,68,68,0.2);}
        .go-card.win::after{content:'';position:absolute;top:0;left:0;right:0;height:2px;background:linear-gradient(90deg,transparent,var(--accent),transparent);animation:victoryShine 2s linear infinite;background-size:200% auto;}
        .go-label{font-family:var(--fhud);font-size:72px;letter-spacing:6px;line-height:1;margin-bottom:4px;}
        .go-label.win{color:var(--accent);text-shadow:0 0 48px rgba(0,255,136,0.5);}
        .go-label.lose{color:var(--danger);text-shadow:0 0 40px rgba(255,68,68,0.4);}
        .go-label.draw{color:var(--warn);text-shadow:0 0 40px rgba(250,204,21,0.4);}
        .go-sub{color:var(--t2);font-size:13px;margin-bottom:24px;line-height:1.7;}
        .go-elo{font-family:var(--fhud);font-size:36px;letter-spacing:3px;margin-bottom:28px;padding:10px 24px;display:inline-block;border-radius:2px;}
        .go-elo.pos{color:var(--accent);border:1px solid rgba(0,255,136,0.25);}
        .go-elo.neg{color:var(--danger);border:1px solid rgba(255,68,68,0.2);}
        .go-stats{display:grid;grid-template-columns:1fr 1fr 1fr;gap:16px;margin-bottom:28px;}
        .go-sv{font-family:var(--fhud);font-size:30px;letter-spacing:2px;color:var(--t1);}
        .go-sl{font-size:9px;letter-spacing:2px;color:var(--t2);text-transform:uppercase;margin-top:2px;}
        .go-btn{width:100%;padding:13px;background:transparent;color:var(--t1);border:1px solid var(--t3);border-radius:2px;font-family:var(--fhud);font-size:17px;letter-spacing:3px;cursor:pointer;transition:all 0.15s;}
        .go-btn:hover{background:var(--bg3);border-color:var(--t2);}

        /* Workspace */
        .ws{display:grid;grid-template-columns:1fr 1fr;height:calc(100vh - 68px);position:relative;z-index:1;}

        /* Problem panel */
        .pp{padding:28px 32px;overflow-y:auto;border-right:1px solid rgba(255,255,255,0.05);scrollbar-width:thin;scrollbar-color:var(--bg3) transparent;}
        .pmeta{display:flex;gap:10px;align-items:center;margin-bottom:18px;}
        .dbadge{font-family:var(--fmono);font-size:10px;letter-spacing:2px;padding:3px 8px;border-radius:2px;font-weight:700;}
        .dbadge.easy{background:rgba(0,255,136,0.08);color:var(--accent);border:1px solid rgba(0,255,136,0.25);}
        .dbadge.medium{background:rgba(250,204,21,0.08);color:var(--warn);border:1px solid rgba(250,204,21,0.25);}
        .dbadge.hard{background:rgba(255,68,68,0.08);color:var(--danger);border:1px solid rgba(255,68,68,0.25);}
        .ptitle{font-family:var(--fhud);font-size:28px;letter-spacing:2px;color:var(--t1);margin-bottom:14px;line-height:1.2;}
        .pbody{font-size:14px;line-height:1.8;color:#94a3b8;white-space:pre-wrap;}
        .exlabel{font-family:var(--fmono);font-size:10px;letter-spacing:3px;color:var(--t2);text-transform:uppercase;margin:22px 0 10px;padding-bottom:8px;border-bottom:1px solid var(--t3);}
        .exblock{background:var(--bg0);border:1px solid var(--t3);border-radius:2px;padding:12px 16px;font-family:var(--fmono);font-size:12px;color:#94a3b8;margin-bottom:8px;}
        .exkey{color:var(--t2);margin-right:8px;}

        /* Editor panel */
        .ep{display:flex;flex-direction:column;background:var(--bg1);}
        .etbar{display:flex;align-items:center;justify-content:space-between;padding:8px 18px;background:var(--bg2);border-bottom:1px solid rgba(255,255,255,0.04);}
        .lang-sel{background:var(--bg0);color:var(--t1);border:1px solid var(--t3);border-radius:2px;padding:4px 10px;font-family:var(--fmono);font-size:11px;cursor:pointer;outline:none;}
        .lang-sel:focus{border-color:var(--accent);}
        .testdots{display:flex;gap:4px;align-items:center;}
        .tdot{width:7px;height:7px;border-radius:50%;transition:all 0.3s;}
        .tdot.pass{background:var(--accent);box-shadow:0 0 5px var(--accent);}
        .tdot.fail{background:var(--t3);}
        .tdot.spin{background:#60a5fa;border-radius:0;animation:spin 0.7s linear infinite;}
        .tlabel{font-family:var(--fmono);font-size:10px;color:var(--t2);margin-left:6px;}
        .statrow{display:flex;gap:14px;align-items:center;}
        .streak{font-family:var(--fhud);font-size:15px;letter-spacing:1px;color:#ff9900;}
        .xplabel{font-family:var(--fhud);font-size:13px;letter-spacing:1px;color:var(--t2);}
        .xplabel span{color:var(--accent);}

        .code-area{flex:1;overflow:hidden;}
        .codetx{width:100%;height:100%;background:var(--bg1);color:#e2e8f0;border:none;outline:none;resize:none;font-family:var(--fmono);font-size:13.5px;line-height:1.75;padding:20px;tab-size:2;}

        .efooter{padding:10px 18px;background:var(--bg2);border-top:1px solid rgba(255,255,255,0.04);display:flex;align-items:center;justify-content:space-between;gap:12px;}
        .status-txt{font-family:var(--fmono);font-size:11px;color:var(--t2);flex:1;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;}
        .err-txt{font-family:var(--fmono);font-size:11px;color:var(--danger);flex:1;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;}

        .runbtn{display:flex;align-items:center;gap:7px;padding:9px 24px;border:none;border-radius:2px;font-family:var(--fhud);font-size:17px;letter-spacing:3px;cursor:pointer;transition:all 0.12s;flex-shrink:0;background:var(--accent);color:#000;}
        .runbtn:hover:not(:disabled){background:#00e077;transform:translateY(-1px);box-shadow:0 6px 20px rgba(0,255,136,0.3);}
        .runbtn:active:not(:disabled){transform:translateY(0);}
        .runbtn:disabled{background:var(--t3);color:var(--t2);cursor:not-allowed;}
        .runbtn.running{background:#0ea5e9;color:#000;}
        .runbtn .sp{width:13px;height:13px;border:2px solid rgba(0,0,0,0.25);border-top-color:#000;border-radius:50%;animation:spin 0.55s linear infinite;}

        .loading-scr{display:flex;flex-direction:column;align-items:center;justify-content:center;height:100%;gap:14px;color:var(--t2);}
        .ldr{width:36px;height:36px;border:2px solid var(--t3);border-top-color:var(--accent);border-radius:50%;animation:spin 0.7s linear infinite;}
        .ldr-lbl{font-family:var(--fmono);font-size:11px;letter-spacing:3px;}
        ::-webkit-scrollbar{width:3px;} ::-webkit-scrollbar-track{background:transparent;} ::-webkit-scrollbar-thumb{background:var(--t3);border-radius:2px;}
        @media(max-width:880px){.ws{grid-template-columns:1fr}.pp{max-height:38vh;border-right:none;border-bottom:1px solid rgba(255,255,255,0.05)}.hptrack{width:160px}.clockval{font-size:28px}}
      `}</style>

      <div className="dr">
        <div className="gridbg" />
        <div className="flash-overlay" style={{ boxShadow: flashShadow }} />

        <KillFeed events={feed} />
        <FloatText items={floats} />

        {/* HUD */}
        <header className="hud">
          <div className="hud-in">
            <div className="pb">
              <div className="pname" style={{ color:'var(--accent)' }}>
                {user.username.toUpperCase()}
                <span className="you-tag">YOU</span>
              </div>
              <div className="hprow">
                <div className="hptrack">
                  <div className={`hpfill me ${myLead ? 'lead' : ''}`} style={{ width:`${myPct}%` }} />
                </div>
                <span className="hppct me">{myPct}%</span>
              </div>
            </div>

            <div className="clock-wrap">
              <div className={`clockval ${critical ? 'crit' : urgent ? 'warn' : 'safe'}`}>{formatTime(timeLeft)}</div>
              <div className="vs">VS</div>
            </div>

            <div className="pb r">
              <div className="pname r" style={{ color:'var(--danger)' }}>
                {oppName.toUpperCase()}
                {oppDisc && <span className="offline-tag">OFFLINE</span>}
              </div>
              <div className="hprow r">
                <span className="hppct opp">{oppPct}%</span>
                <div className="hptrack">
                  <div className="hpfill opp" style={{ width:`${oppPct}%` }} />
                </div>
              </div>
            </div>
          </div>
        </header>

        {oppDisc && !gameOver && (
          <div className="disc">
            <span>⚡ {oppName.toUpperCase()} DISCONNECTED — GRACE PERIOD ACTIVE</span>
            {graceLeft !== null && (
              <span style={{ color: graceLeft < 15000 ? 'var(--danger)' : 'var(--warn)', fontWeight:700 }}>
                AUTO-FORFEIT IN {Math.ceil(graceLeft / 1000)}s
              </span>
            )}
          </div>
        )}

        {/* Game over */}
        {gameOver && (
          <div className="go-backdrop">
            <div className={`go-card ${gameResult.isDraw ? '' : gameResult.winner === user.username ? 'win' : 'lose'}`}>
              {gameResult.isDraw ? (
                <><div className="go-label draw">DRAW</div><div className="go-sub">Time's up — equal progress. No Elo change.</div></>
              ) : gameResult.winner === user.username ? (
                <><div className="go-label win">VICTORY</div>
                  <div className="go-sub">{gameResult.reason === 'opponent_disconnected' ? 'Opponent forfeited.' : gameResult.reason === 'time_up' ? "Time's up. You had more tests passing." : 'All tests passed first.'}</div>
                </>
              ) : (
                <><div className="go-label lose">DEFEAT</div>
                  <div className="go-sub">{gameResult.reason === 'time_up' ? "Time's up. Opponent edged you out." : `${gameResult.winner} finished first.`}</div>
                </>
              )}
              {!gameResult.isDraw && myElo !== null && (
                <div className={`go-elo ${myElo >= 0 ? 'pos' : 'neg'}`}>{myElo >= 0 ? `+${myElo}` : myElo} ELO</div>
              )}
              <div className="go-stats">
                <div><div className="go-sv">{myPct}%</div><div className="go-sl">Progress</div></div>
                <div><div className="go-sv">{totalXP}</div><div className="go-sl">XP Earned</div></div>
                <div><div className="go-sv">{myTests.passed}/{myTests.total}</div><div className="go-sl">Tests</div></div>
              </div>
              <button className="go-btn" onClick={() => navigate('/dashboard')}>BACK TO DASHBOARD</button>
            </div>
          </div>
        )}

        {/* Workspace */}
        <div className="ws">
          <div className="pp">
            {loading ? (
              <div className="loading-scr"><div className="ldr" /><div className="ldr-lbl">LOADING PROBLEM...</div></div>
            ) : (
              <>
                <div className="pmeta">
                  <span className={`dbadge ${problem?.difficulty || 'medium'}`}>{(problem?.difficulty || 'MEDIUM').toUpperCase()}</span>
                </div>
                <h1 className="ptitle">{problem?.title}</h1>
                <p className="pbody">{problem?.problemStatement}</p>
                {problem?.examples?.length > 0 && (
                  <>
                    <div className="exlabel">Examples</div>
                    {problem.examples.map((ex, i) => (
                      <div key={i} className="exblock">
                        <div><span className="exkey">Input:</span>{ex.input}</div>
                        <div><span className="exkey">Output:</span>{ex.output}</div>
                        {ex.explanation && <div><span className="exkey">Why:</span>{ex.explanation}</div>}
                      </div>
                    ))}
                  </>
                )}
              </>
            )}
          </div>

          <div className="ep">
            <div className="etbar">
              <div style={{ display:'flex', alignItems:'center', gap:14 }}>
                <select className="lang-sel" value={language} onChange={handleLangChange} disabled={gameOver}>
                  {SUPPORTED_LANGUAGES.map(l => <option key={l} value={l}>{l.charAt(0).toUpperCase()+l.slice(1)}</option>)}
                </select>
                <div className="testdots">
                  {myTests.total > 0
                    ? Array.from({ length: myTests.total }, (_, i) => (
                        <div key={i} className={`tdot ${i < myTests.passed ? 'pass' : 'fail'}`} />
                      ))
                    : Array.from({ length: 5 }, (_, i) => <div key={i} className={`tdot ${isRunning ? 'spin' : 'fail'}`} />)
                  }
                  {myTests.total > 0 && <span className="tlabel">{myTests.passed}/{myTests.total}</span>}
                </div>
              </div>
              <div className="statrow">
                {streak > 1 && <span className="streak">🔥 {streak}x</span>}
                <span className="xplabel">XP <span>{totalXP}</span></span>
              </div>
            </div>

            <div className="code-area">
              <textarea
                className="codetx"
                value={code}
                onChange={e => setCode(e.target.value)}
                disabled={gameOver}
                spellCheck={false}
                onKeyDown={e => {
                  if (e.key === 'Tab') {
                    e.preventDefault();
                    const s = e.target.selectionStart;
                    setCode(v => v.slice(0, s) + '  ' + v.slice(e.target.selectionEnd));
                    setTimeout(() => { e.target.selectionStart = e.target.selectionEnd = s + 2; }, 0);
                  }
                }}
              />
            </div>

            <div className="efooter">
              {runError
                ? <span className="err-txt">⚠ {runError}</span>
                : <span className="status-txt">
                    {lastResult === 'pass' ? '✓ ALL TESTS PASSING'
                     : lastResult === 'partial' ? `↑ ${myTests.passed}/${myTests.total} tests passing`
                     : lastResult === 'fail' ? `✗ ${myTests.passed}/${myTests.total} — keep going`
                     : 'Write your solution and run tests'}
                  </span>
              }
              <button className={`runbtn ${isRunning ? 'running' : ''}`} onClick={handleRun} disabled={gameOver || loading}>
                {isRunning ? <><div className="sp" /> RUNNING</> : '▶ RUN TESTS'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}