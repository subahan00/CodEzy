import IORedis from 'ioredis';

const redis = new IORedis({
  host: '127.0.0.1',
  port: 6379,
  maxRetriesPerRequest: null
});

const DUEL_PREFIX = 'duel:';
const QUEUE_KEY = 'waitingQueue';

// ==========================================
// --- ACTIVE DUELS ---
// ==========================================
export const saveDuel = async (roomId, duelData) => {
  // Store duel as JSON, expire after 35 mins (30 min game + 5 min buffer)
  await redis.set(
    `${DUEL_PREFIX}${roomId}`,
    JSON.stringify(duelData),
    'EX', 35 * 60
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
  await saveDuel(roomId, updated);
  return updated;
};

export const getAllActiveDuels = async () => {
  const keys = await redis.keys(`${DUEL_PREFIX}*`);
  if (!keys.length) return {};

  const duels = {};
  for (const key of keys) {
    const data = await redis.get(key);
    if (data) {
      const duel = JSON.parse(data);
      duels[duel.roomId] = duel;
    }
  }
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