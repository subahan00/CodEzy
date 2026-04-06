import { fetchRandomProblem } from '../controllers/learner/problem.controller.js'; // ✅ Import reusable fn

let waitingQueue = [];
let activeDuels = {};

export const setupSocketHandlers = (io) => {
  io.on('connection', (socket) => {
    console.log('⚡ A user connected via Socket:', socket.id);

    socket.on('send_message', (data) => {
      io.emit('receive_message', data);
    });

    // ==========================================
    // --- MATCHMAKING ---
    // ==========================================
    socket.on('join_queue', async (userData) => {
      console.log(`🎮 ${userData.username} joined the queue.`);

      // ✅ Fix #10 (bonus): Prevent same user from queuing twice
      const alreadyInQueue = waitingQueue.some(u => u.username === userData.username);
      if (alreadyInQueue) {
        socket.emit('waiting_for_match');
        return;
      }

      if (waitingQueue.length > 0) {
        const opponent = waitingQueue.pop();
        const roomId = `duel_${opponent.socketId}_${socket.id}`;

        socket.join(roomId);
        const opponentSocket = io.sockets.sockets.get(opponent.socketId);
        if (opponentSocket) opponentSocket.join(roomId);

        // ✅ Fix #1: Fetch problem ONCE on the server, send to both players
        let problem;
        try {
          problem = await fetchRandomProblem();
        } catch (err) {
          console.error('Failed to fetch problem for duel:', err);
          socket.emit('duel_error', { message: 'Failed to load problem. Please try again.' });
          opponentSocket?.emit('duel_error', { message: 'Failed to load problem. Please try again.' });
          waitingQueue.push(opponent); // put opponent back in queue
          return;
        }

        activeDuels[roomId] = {
          player1: opponent,
          player2: { ...userData, socketId: socket.id },
          roomId,
          problem,          // ✅ Store problem in duel state
          winner: null,     // ✅ Fix #4: Track winner server-side
          startTime: Date.now()
        };

        // Both players receive the same problem in duel_started
        io.to(roomId).emit('duel_started', activeDuels[roomId]);
        console.log(`⚔️ Duel started in room: ${roomId}`);

      } else {
        waitingQueue.push({ ...userData, socketId: socket.id });
        socket.emit('waiting_for_match');
      }
    });


    socket.on('update_progress', ({ roomId, progress, username }) => {
      const duel = activeDuels[roomId];
      if (!duel || duel.winner) return; // Stop if game is already over

      // Broadcast progress to opponent
      socket.to(roomId).emit('opponent_progress', { username, progress });

      // ✅ SERVER evaluates win condition securely
      if (progress === 100) {
        duel.winner = username; 
        console.log(`🏆 Duel in ${roomId} won by ${username}!`);
        
        io.to(roomId).emit('game_over', { winner: username });
        delete activeDuels[roomId];
      }
    });

    // ✅ Fix #4: Server-side win guard — only first winner counts
    socket.on('duel_won', ({ roomId, winnerName }) => {
      const duel = activeDuels[roomId];
      if (!duel) return; // Room already cleaned up

      if (duel.winner) {
        // A winner was already recorded — ignore this duplicate event
        console.log(`⚠️ Duplicate duel_won ignored in ${roomId}`);
        return;
      }

      duel.winner = winnerName; // Lock the winner
      console.log(`🏆 Duel in ${roomId} won by ${winnerName}!`);

      io.to(roomId).emit('game_over', { winner: winnerName });
      delete activeDuels[roomId];
    });

  // ✅ Fix #5: Secure rejoin using username! (This fixes the infinite loading)
    socket.on('rejoin_room', (data) => {
      // Extract data safely
      const roomId = data.roomId;
      const username = data.username;

      const duel = activeDuels[roomId];
      if (!duel) {
        console.log(`[DEBUG] Rejoin failed: Room ${roomId} not found.`);
        return; 
      }

      // Check if the username matches player 1 or player 2
      const isPlayer1 = duel.player1.username === username;
      const isPlayer2 = duel.player2.username === username;

      if (isPlayer1 || isPlayer2) {
        // IMPORTANT: Update the socket ID to their new one!
        if (isPlayer1) duel.player1.socketId = socket.id;
        if (isPlayer2) duel.player2.socketId = socket.id;

        socket.join(roomId);
        // Re-send problem so the rejoining player's UI recovers instantly
        socket.emit('duel_started', duel);
        console.log(`🔄 ${username} successfully rejoined ${roomId}`);
      }
    });
    // ==========================================
    // --- DISCONNECT ---
    // ==========================================
    socket.on('disconnect', () => {
      console.log('❌ User disconnected:', socket.id);

      waitingQueue = waitingQueue.filter(u => u.socketId !== socket.id);

      for (const roomId in activeDuels) {
        const duel = activeDuels[roomId];

        if (duel.player1.socketId === socket.id || duel.player2.socketId === socket.id) {
          if (duel.winner) break; // Game already over, skip

          const winnerName = duel.player1.socketId === socket.id
            ? duel.player2.username
            : duel.player1.username;

          console.log(`🏃 Rage quit in ${roomId}. ${winnerName} wins!`);

          io.to(roomId).emit('game_over', {
            winner: winnerName,
            reason: 'opponent_disconnected'
          });

          delete activeDuels[roomId];
          break;
        }
      }
    });
  });
};