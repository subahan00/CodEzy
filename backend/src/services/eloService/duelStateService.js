import IORedis from 'ioredis';

const redis = new IORedis({
  host: '127.0.0.1',
  port: 6379,
  maxRetriesPerRequest: null
});

const DUEL_PREFIX = 'duel:';
const QUEUE_KEY = 'waitingQueue';
const DUEL_TTL = 35 * 60; // 35 min in seconds

// ==========================================
// --- ACTIVE DUELS ---
// ==========================================

export const saveDuel = async (roomId, duelData) => {
  await redis.set(
    `${DUEL_PREFIX}${roomId}`,
    JSON.stringify(duelData),
    'EX', DUEL_TTL
  );
};

export const getDuel = async (roomId) => {
  const data = await redis.get(`${DUEL_PREFIX}${roomId}`);
  return data ? JSON.parse(data) : null;
};

export const deleteDuel = async (roomId) => {
  await redis.del(`${DUEL_PREFIX}${roomId}`);
};

export const updateDuel = async (roomId, updates) => {
  const duel = await getDuel(roomId);
  if (!duel) return null;
  const updated = { ...duel, ...updates };
  // Refresh TTL on every update so an active game never expires mid-play
  await saveDuel(roomId, updated);
  return updated;
};

// Use SCAN instead of KEYS — non-blocking in production Redis
export const getAllActiveDuels = async () => {
  const duels = {};
  let cursor = '0';

  do {
    const [nextCursor, keys] = await redis.scan(
      cursor,
      'MATCH', `${DUEL_PREFIX}*`,
      'COUNT', 100
    );
    cursor = nextCursor;

    if (keys.length) {
      // Pipeline reads for performance
      const pipeline = redis.pipeline();
      keys.forEach(k => pipeline.get(k));
      const results = await pipeline.exec();

      results.forEach(([err, data]) => {
        if (!err && data) {
          const duel = JSON.parse(data);
          duels[duel.roomId] = duel;
        }
      });
    }
  } while (cursor !== '0');

  return duels;
};

// ==========================================
// --- WAITING QUEUE ---
// ==========================================

export const addToQueue = async (userData) => {
  await redis.rpush(QUEUE_KEY, JSON.stringify(userData));
};

export const popFromQueue = async () => {
  const data = await redis.lpop(QUEUE_KEY);
  return data ? JSON.parse(data) : null;
};

export const getQueueLength = async () => {
  return await redis.llen(QUEUE_KEY);
};

export const removeFromQueue = async (socketId) => {
  const items = await redis.lrange(QUEUE_KEY, 0, -1);
  for (const item of items) {
    const parsed = JSON.parse(item);
    if (parsed.socketId === socketId) {
      await redis.lrem(QUEUE_KEY, 1, item);
      break;
    }
  }
};

export const isUserInQueue = async (username) => {
  const items = await redis.lrange(QUEUE_KEY, 0, -1);
  return items.some(item => JSON.parse(item).username === username);
};

export const clearQueue = async () => {
  await redis.del(QUEUE_KEY);
};

// ==========================================
// --- SPECTATORS ---
// ==========================================

const SPECTATOR_PREFIX = 'spectators:';

export const addSpectator = async (roomId, username) => {
  await redis.sadd(`${SPECTATOR_PREFIX}${roomId}`, username);
  await redis.expire(`${SPECTATOR_PREFIX}${roomId}`, DUEL_TTL);
};

export const removeSpectator = async (roomId, username) => {
  await redis.srem(`${SPECTATOR_PREFIX}${roomId}`, username);
};

export const getSpectators = async (roomId) => {
  return await redis.smembers(`${SPECTATOR_PREFIX}${roomId}`);
};

export const deleteSpectators = async (roomId) => {
  await redis.del(`${SPECTATOR_PREFIX}${roomId}`);
};

// ==========================================
// --- SOCKET → ROOM INDEX ---
// Lets disconnect handler find the right room in O(1)
// ==========================================

const SOCKET_ROOM_PREFIX = 'socket_room:';

export const setSocketRoom = async (socketId, roomId) => {
  // Expire slightly longer than the duel
  await redis.set(`${SOCKET_ROOM_PREFIX}${socketId}`, roomId, 'EX', DUEL_TTL + 120);
};

export const getSocketRoom = async (socketId) => {
  return await redis.get(`${SOCKET_ROOM_PREFIX}${socketId}`);
};

export const deleteSocketRoom = async (socketId) => {
  await redis.del(`${SOCKET_ROOM_PREFIX}${socketId}`);
};

export default redis;