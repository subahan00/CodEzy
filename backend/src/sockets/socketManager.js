import { fetchRandomProblem } from '../controllers/learner/problem.controller.js';
import { updateEloAfterDuel } from '../services/eloService/eloService.js';
import {
  saveDuel, getDuel, deleteDuel, updateDuel,
  getAllActiveDuels, addToQueue, popFromQueue,
  getQueueLength, removeFromQueue, isUserInQueue
} from '../services/eloService/duelStateService.js';

const DUEL_DURATION_MS = 30 * 60 * 1000; // 30 minutes

// In-memory timer map — timers can't be stored in Redis
// On restart these are rebuilt from Redis duel data
const duelTimers = {};

// ==========================================
// --- TIMER LOGIC ---
// ==========================================
const startDuelTimer = (io, roomId, duelData) => {
  // Clear any existing timer for this room
  if (duelTimers[roomId]) clearTimeout(duelTimers[roomId]);

  const elapsed = Date.now() - duelData.startTime;
  const remaining = DUEL_DURATION_MS - elapsed;

  // Duel already expired (e.g. server restarted after 30 mins)
  if (remaining <= 0) {
    handleTimerExpiry(io, roomId);
    return;
  }

  duelTimers[roomId] = setTimeout(() => {
    handleTimerExpiry(io, roomId);
  }, remaining);
};

const handleTimerExpiry = async (io, roomId) => {
  const duel = await getDuel(roomId);
  if (!duel) return;
  if (duel.winner) return; // Already resolved

  const p1Progress = duel.player1.progress || 0;
  const p2Progress = duel.player2.progress || 0;

  let winner = null;
  let loser = null;
  let reason = 'time_up';

  if (p1Progress > p2Progress) {
    winner = duel.player1.username;
    loser = duel.player2.username;
  } else if (p2Progress > p1Progress) {
    winner = duel.player2.username;
    loser = duel.player1.username;
  }
  // Equal progress = draw, winner stays null

  console.log(`⏰ Timer expired in ${roomId}. Winner: ${winner || 'Draw'}`);

  io.to(roomId).emit('game_over', {
    winner,
    reason,
    isDraw: winner === null
  });

  // Update Elo only if there's a clear winner
  if (winner && loser) {
    await updateEloAfterDuel(winner, loser);
  }

  await deleteDuel(roomId);
  delete duelTimers[roomId];
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

  // Recover duels on startup
  recoverActiveDuels(io);

  io.on('connection', (socket) => {
    console.log('⚡ Connected:', socket.id);

    socket.on('send_message', (data) => {
      io.emit('receive_message', data);
    });

    // ==========================================
    // --- MATCHMAKING ---
    // ==========================================
    socket.on('join_queue', async (userData) => {
      console.log(`🎮 ${userData.username} joined the queue.`);

      // #10 — Prevent queuing if already in queue
      const alreadyQueued = await isUserInQueue(userData.username);
      if (alreadyQueued) {
        socket.emit('waiting_for_match');
        return;
      }

      // #10 — Prevent queuing if already in active duel
      const activeDuels = await getAllActiveDuels();
      const alreadyInDuel = Object.values(activeDuels).some(
        d => d.player1.username === userData.username ||
          d.player2.username === userData.username
      );
      if (alreadyInDuel) {
        socket.emit('already_in_duel');
        return;
      }

      const queueLength = await getQueueLength();

      if (queueLength > 0) {
        const opponent = await popFromQueue();
        if (!opponent) {
          // Race condition safety — queue was emptied between check and pop
          await addToQueue({ ...userData, socketId: socket.id });
          socket.emit('waiting_for_match');
          return;
        }

        const roomId = `duel_${opponent.socketId}_${socket.id}`;

        socket.join(roomId);
        const opponentSocket = io.sockets.sockets.get(opponent.socketId);
        if (opponentSocket) opponentSocket.join(roomId);

        let problem;
        try {
          problem = await fetchRandomProblem();
        } catch (err) {
          console.error('Failed to fetch problem:', err);
          socket.emit('duel_error', { message: 'Failed to load problem. Please try again.' });
          opponentSocket?.emit('duel_error', { message: 'Failed to load problem. Please try again.' });
          await addToQueue(opponent); // Put opponent back
          return;
        }

        const duelData = {
          player1: { ...opponent, progress: 0 },
          player2: { ...userData, socketId: socket.id, progress: 0 },
          roomId,
          problem,
          winner: null,
          startTime: Date.now()
        };

        // #11 — Persist to Redis
        await saveDuel(roomId, duelData);

        // #8 — Start server-side timer
        startDuelTimer(io, roomId, duelData);

        io.to(roomId).emit('duel_started', {
          ...duelData,
          durationMs: DUEL_DURATION_MS
        });

        console.log(`⚔️ Duel started: ${roomId}`);

      } else {
        await addToQueue({ ...userData, socketId: socket.id });
        socket.emit('waiting_for_match');
      }
    });

    // ==========================================
    // --- PROGRESS UPDATE ---
    // ==========================================
    socket.on('update_progress', async ({ roomId, progress, username }) => {
      const duel = await getDuel(roomId);
      if (!duel || duel.winner) return;

      const isPlayer1 = duel.player1.username === username;
      await updateDuel(roomId, {
        player1: isPlayer1 ? { ...duel.player1, progress } : duel.player1,
        player2: !isPlayer1 ? { ...duel.player2, progress } : duel.player2
      });

      socket.to(roomId).emit('opponent_progress', { username, progress });

      // ✅ Server evaluates win — client never announces its own victory
      if (progress === 100) {
        const loserName = isPlayer1 ? duel.player2.username : duel.player1.username;
        const eloDelta = await updateEloAfterDuel(username, loserName);

        await updateDuel(roomId, { winner: username });
        console.log(`🏆 ${username} won in ${roomId}`);

        io.to(roomId).emit('game_over', { winner: username, eloChange: eloDelta });

        await deleteDuel(roomId);
        if (duelTimers[roomId]) {
          clearTimeout(duelTimers[roomId]);
          delete duelTimers[roomId];
        }
      }
    });


    // ==========================================
    // --- REJOIN ---
    // ==========================================
    socket.on('rejoin_room', async ({ roomId, username }) => {
      const duel = await getDuel(roomId);
      if (!duel) {
        console.log(`[Rejoin] Room ${roomId} not found`);
        return;
      }

      const isPlayer1 = duel.player1.username === username;
      const isPlayer2 = duel.player2.username === username;

      if (isPlayer1 || isPlayer2) {
        // Update socket ID to their new one
        const updatedDuel = await updateDuel(roomId, {
          player1: isPlayer1
            ? { ...duel.player1, socketId: socket.id }
            : duel.player1,
          player2: isPlayer2
            ? { ...duel.player2, socketId: socket.id }
            : duel.player2
        });

        socket.join(roomId);
        socket.emit('duel_started', {
          ...updatedDuel,
          durationMs: DUEL_DURATION_MS
        });

        console.log(`🔄 ${username} rejoined ${roomId}`);
      }
    });

    // ==========================================
    // --- DISCONNECT ---
    // ==========================================
    socket.on('disconnect', async () => {
      console.log('❌ Disconnected:', socket.id);

      await removeFromQueue(socket.id);

      const activeDuels = await getAllActiveDuels();
      for (const roomId in activeDuels) {
        const duel = activeDuels[roomId];

        if (
          duel.player1.socketId === socket.id ||
          duel.player2.socketId === socket.id
        ) {
          if (duel.winner) break;

          const winnerName = duel.player1.socketId === socket.id
            ? duel.player2.username
            : duel.player1.username;

          const loserName = duel.player1.socketId === socket.id
            ? duel.player1.username
            : duel.player2.username;

          console.log(`🏃 Rage quit in ${roomId}. ${winnerName} wins!`);

          // #9 — Elo update on disconnect win too
          const eloDelta = await updateEloAfterDuel(winnerName, loserName);

          io.to(roomId).emit('game_over', {
            winner: winnerName,
            reason: 'opponent_disconnected',
            eloChange: eloDelta
          });

          await deleteDuel(roomId);
          if (duelTimers[roomId]) {
            clearTimeout(duelTimers[roomId]);
            delete duelTimers[roomId];
          }
          break;
        }
      }
    });
  });
};