import { fetchRandomProblem } from '../controllers/learner/problem.controller.js';
import { updateEloAfterDuel } from '../services/eloService/eloService.js';
import {
  saveDuel, getDuel, deleteDuel, updateDuel,
  getAllActiveDuels, addToQueue, popFromQueue,
  getQueueLength, removeFromQueue, isUserInQueue,
  addSpectator, removeSpectator, getSpectators, deleteSpectators,
  setSocketRoom, getSocketRoom, deleteSocketRoom,
} from '../services/eloService/duelStateService.js';

const DUEL_DURATION_MS = 30 * 60 * 1000;     // 30 minutes
const GRACE_PERIOD_MS  = 60 * 1000;           // 60s before a disconnect counts as a forfeit

// In-memory timer maps — can't live in Redis
const duelTimers        = {};  // roomId → setTimeout handle
const gracePeriodTimers = {};  // socketId → { timeout, roomId } — disconnect grace windows

// ==========================================
// --- HELPERS ---
// ==========================================

/** Clamp progress to [0, 100] and verify it's a number */
const sanitizeProgress = (raw) => {
  const n = Number(raw);
  if (!Number.isFinite(n)) return null;
  return Math.max(0, Math.min(100, Math.round(n)));
};

/** Emit game_over + clean up timers + delete Redis state */
const resolveRoom = async (io, roomId, payload) => {
  io.to(roomId).emit('game_over', payload);

  if (duelTimers[roomId]) {
    clearTimeout(duelTimers[roomId]);
    delete duelTimers[roomId];
  }

  await deleteDuel(roomId);
  await deleteSpectators(roomId);
};

// ==========================================
// --- TIMER LOGIC ---
// ==========================================

const startDuelTimer = (io, roomId, duelData) => {
  if (duelTimers[roomId]) clearTimeout(duelTimers[roomId]);

  const elapsed   = Date.now() - duelData.startTime;
  const remaining = DUEL_DURATION_MS - elapsed;

  if (remaining <= 0) {
    handleTimerExpiry(io, roomId);
    return;
  }

  duelTimers[roomId] = setTimeout(() => handleTimerExpiry(io, roomId), remaining);
};

const handleTimerExpiry = async (io, roomId) => {
  const duel = await getDuel(roomId);
  if (!duel || duel.winner) return;

  const p1 = duel.player1.progress ?? 0;
  const p2 = duel.player2.progress ?? 0;

  let winner = null;
  let loser  = null;

  if      (p1 > p2) { winner = duel.player1.username; loser = duel.player2.username; }
  else if (p2 > p1) { winner = duel.player2.username; loser = duel.player1.username; }

  console.log(`⏰ Timer expired in ${roomId}. Winner: ${winner ?? 'Draw'}`);

  let eloChange = null;
  if (winner && loser) {
    eloChange = await updateEloAfterDuel(winner, loser);
  }

  await resolveRoom(io, roomId, {
    winner,
    reason: 'time_up',
    isDraw: winner === null,
    eloChange,
  });
};

// ==========================================
// --- RESTART RECOVERY ---
// ==========================================

export const recoverActiveDuels = async (io) => {
  const activeDuels = await getAllActiveDuels();
  const count = Object.keys(activeDuels).length;
  if (!count) return;

  console.log(`🔄 Recovering ${count} active duels from Redis...`);
  for (const roomId in activeDuels) {
    startDuelTimer(io, roomId, activeDuels[roomId]);
  }
};

// ==========================================
// --- MAIN SOCKET HANDLER ---
// ==========================================

export const setupSocketHandlers = (io) => {
  recoverActiveDuels(io);

  io.on('connection', (socket) => {
    console.log('⚡ Connected:', socket.id);

    // ==========================================
    // --- MATCHMAKING ---
    // ==========================================

    socket.on('join_queue', async (userData) => {
      if (!userData?.username) return;
      console.log(`🎮 ${userData.username} joined the queue.`);

      const alreadyQueued = await isUserInQueue(userData.username);
      if (alreadyQueued) { socket.emit('waiting_for_match'); return; }

      const activeDuels = await getAllActiveDuels();
      const alreadyInDuel = Object.values(activeDuels).some(
        d => d.player1.username === userData.username ||
             d.player2.username === userData.username
      );
      if (alreadyInDuel) { socket.emit('already_in_duel'); return; }

      const queueLength = await getQueueLength();

      if (queueLength > 0) {
        const opponent = await popFromQueue();

        // Race condition: queue was drained between llen and lpop
        if (!opponent) {
          await addToQueue({ ...userData, socketId: socket.id });
          socket.emit('waiting_for_match');
          return;
        }

        // Opponent's socket may have disconnected while in queue
        const opponentSocket = io.sockets.sockets.get(opponent.socketId);
        if (!opponentSocket) {
          console.log(`👻 Stale queue entry for ${opponent.username}, re-queuing self`);
          await addToQueue({ ...userData, socketId: socket.id });
          socket.emit('waiting_for_match');
          return;
        }

        const roomId = `duel_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;

        socket.join(roomId);
        opponentSocket.join(roomId);

        let problem;
        try {
          problem = await fetchRandomProblem();
        } catch (err) {
          console.error('Failed to fetch problem:', err);
          const msg = { message: 'Failed to load problem. Please try again.' };
          socket.emit('duel_error', msg);
          opponentSocket.emit('duel_error', msg);
          await addToQueue(opponent);
          return;
        }

        const startTime = Date.now();
        const duelData = {
          player1: { ...opponent, progress: 0 },
          player2: { ...userData, socketId: socket.id, progress: 0 },
          roomId,
          problem,
          winner: null,
          startTime,
        };

        await saveDuel(roomId, duelData);

        // Index socket → room for O(1) disconnect lookup
        await setSocketRoom(opponent.socketId, roomId);
        await setSocketRoom(socket.id, roomId);

        startDuelTimer(io, roomId, duelData);

        io.to(roomId).emit('duel_started', {
          ...duelData,
          durationMs: DUEL_DURATION_MS,
        });

        console.log(`⚔️  Duel started: ${roomId}`);

      } else {
        await addToQueue({ ...userData, socketId: socket.id });
        socket.emit('waiting_for_match');
      }
    });

    // ==========================================
    // --- LEAVE QUEUE (cancel matchmaking) ---
    // ==========================================

    socket.on('leave_queue', async () => {
      await removeFromQueue(socket.id);
      socket.emit('left_queue');
      console.log(`🚪 ${socket.id} left the queue.`);
    });

    // ==========================================
    // --- PROGRESS UPDATE ---
    // ==========================================

    socket.on('update_progress', async ({ roomId, progress, username }) => {
      if (!roomId || !username) return;

      const safeProgress = sanitizeProgress(progress);
      if (safeProgress === null) return;

      const duel = await getDuel(roomId);
      if (!duel || duel.winner) return;

      const isPlayer1 = duel.player1.username === username;
      const isPlayer2 = duel.player2.username === username;
      if (!isPlayer1 && !isPlayer2) return; // Reject spoofed progress

      const updatedDuel = await updateDuel(roomId, {
        player1: isPlayer1 ? { ...duel.player1, progress: safeProgress } : duel.player1,
        player2: isPlayer2 ? { ...duel.player2, progress: safeProgress } : duel.player2,
      });

      // Broadcast to opponent AND spectators
      socket.to(roomId).emit('opponent_progress', { username, progress: safeProgress });

      if (safeProgress === 100) {
        const loserName = isPlayer1 ? duel.player2.username : duel.player1.username;
        const eloChange = await updateEloAfterDuel(username, loserName);

        console.log(`🏆 ${username} won in ${roomId}`);

        await resolveRoom(io, roomId, {
          winner: username,
          eloChange: eloChange ?? undefined,
        });

        // Clean up socket-room index
        await deleteSocketRoom(duel.player1.socketId);
        await deleteSocketRoom(duel.player2.socketId);
      }
    });

    // ==========================================
    // --- REJOIN (refresh or hard reload) ---
    // ==========================================

    socket.on('rejoin_room', async ({ roomId, username }) => {
      const duel = await getDuel(roomId);
      if (!duel) {
        socket.emit('duel_not_found');
        console.log(`[Rejoin] Room ${roomId} not found`);
        return;
      }

      const isPlayer1 = duel.player1.username === username;
      const isPlayer2 = duel.player2.username === username;

      if (!isPlayer1 && !isPlayer2) {
        socket.emit('duel_error', { message: 'You are not a participant in this duel.' });
        return;
      }

      // Cancel any pending forfeit grace timer for this player
      const oldSocketId = isPlayer1 ? duel.player1.socketId : duel.player2.socketId;
      if (gracePeriodTimers[oldSocketId]) {
        clearTimeout(gracePeriodTimers[oldSocketId].timeout);
        delete gracePeriodTimers[oldSocketId];
        console.log(`⏱  Grace period cancelled for ${username} (reconnected)`);
      }

      const updatedDuel = await updateDuel(roomId, {
        player1: isPlayer1 ? { ...duel.player1, socketId: socket.id } : duel.player1,
        player2: isPlayer2 ? { ...duel.player2, socketId: socket.id } : duel.player2,
      });

      await setSocketRoom(socket.id, roomId);
      if (oldSocketId !== socket.id) await deleteSocketRoom(oldSocketId);

      socket.join(roomId);

      // Send REMAINING time so the rejoin timer is accurate
      const elapsed   = Date.now() - updatedDuel.startTime;
      const remaining = Math.max(0, DUEL_DURATION_MS - elapsed);

      socket.emit('duel_started', {
        ...updatedDuel,
        durationMs: remaining,      // ← was always DUEL_DURATION_MS (bug fixed)
        startTime: Date.now(),       // Reset the client-side reference point
        isRejoin: true,
        myProgress: isPlayer1 ? updatedDuel.player1.progress : updatedDuel.player2.progress,
        opponentProgress: isPlayer1 ? updatedDuel.player2.progress : updatedDuel.player1.progress,
      });

      console.log(`🔄 ${username} rejoined ${roomId} (${Math.round(remaining / 1000)}s left)`);
    });

    // ==========================================
    // --- SPECTATE ---
    // ==========================================

    socket.on('spectate_room', async ({ roomId, username }) => {
      const duel = await getDuel(roomId);
      if (!duel) {
        socket.emit('duel_error', { message: 'Room not found or duel has ended.' });
        return;
      }

      socket.join(roomId);
      await addSpectator(roomId, username ?? socket.id);

      const elapsed   = Date.now() - duel.startTime;
      const remaining = Math.max(0, DUEL_DURATION_MS - elapsed);

      // Send current state so the spectator sees live progress immediately
      socket.emit('spectate_started', {
        duel,
        durationMs: remaining,
        startTime: Date.now(),
      });

      // Notify players someone is watching
      socket.to(roomId).emit('spectator_joined', { username: username ?? 'Anonymous' });

      console.log(`👁  ${username ?? socket.id} spectating ${roomId}`);
    });

    socket.on('leave_spectate', async ({ roomId, username }) => {
      socket.leave(roomId);
      await removeSpectator(roomId, username ?? socket.id);
      socket.to(roomId).emit('spectator_left', { username: username ?? 'Anonymous' });
    });

    // ==========================================
    // --- LIST LIVE DUELS (lobby) ---
    // ==========================================

    socket.on('get_live_duels', async () => {
      const activeDuels = await getAllActiveDuels();
      const list = Object.values(activeDuels).map(d => ({
        roomId: d.roomId,
        player1: d.player1.username,
        player2: d.player2.username,
        p1Progress: d.player1.progress ?? 0,
        p2Progress: d.player2.progress ?? 0,
        startTime: d.startTime,
      }));
      socket.emit('live_duels', list);
    });

    // ==========================================
    // --- DISCONNECT ---
    // ==========================================

    socket.on('disconnect', async () => {
      console.log('❌ Disconnected:', socket.id);

      // Remove from queue immediately (no grace for queue)
      await removeFromQueue(socket.id);

      // O(1) room lookup via index instead of scanning all duels
      const roomId = await getSocketRoom(socket.id);
      if (!roomId) return;

      const duel = await getDuel(roomId);
      if (!duel || duel.winner) {
        await deleteSocketRoom(socket.id);
        return;
      }

      const isPlayer1 = duel.player1.socketId === socket.id;
      const isPlayer2 = duel.player2.socketId === socket.id;
      if (!isPlayer1 && !isPlayer2) return;

      const disconnectedName = isPlayer1 ? duel.player1.username : duel.player2.username;
      const opponentName     = isPlayer1 ? duel.player2.username : duel.player1.username;

      console.log(`🔌 ${disconnectedName} disconnected from ${roomId}. Starting ${GRACE_PERIOD_MS / 1000}s grace window...`);

      // Notify opponent that the other player lost connection
      socket.to(roomId).emit('opponent_disconnected', {
        username: disconnectedName,
        gracePeriodMs: GRACE_PERIOD_MS,
      });

      // Give the player a grace period to reconnect before forfeiting
      gracePeriodTimers[socket.id] = {
        roomId,
        timeout: setTimeout(async () => {
          delete gracePeriodTimers[socket.id];

          // Re-check — player may have reconnected under a new socket ID
          const freshDuel = await getDuel(roomId);
          if (!freshDuel || freshDuel.winner) return;

          const currentSocketId = isPlayer1
            ? freshDuel.player1.socketId
            : freshDuel.player2.socketId;

          // If socket ID changed, they reconnected — don't forfeit
          if (currentSocketId !== socket.id) return;

          console.log(`🏃 ${disconnectedName} forfeited ${roomId} after grace period.`);

          const eloChange = await updateEloAfterDuel(opponentName, disconnectedName);

          await resolveRoom(io, roomId, {
            winner: opponentName,
            reason: 'opponent_disconnected',
            eloChange: eloChange ?? undefined,
          });

          await deleteSocketRoom(socket.id);
          const opponentSocketId = isPlayer1
            ? freshDuel.player2.socketId
            : freshDuel.player1.socketId;
          await deleteSocketRoom(opponentSocketId);

        }, GRACE_PERIOD_MS),
      };
    });
  });
};