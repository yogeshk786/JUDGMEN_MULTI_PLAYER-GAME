const Redis = require('ioredis');

// 1. Connection
const redisClient = new Redis(process.env.REDIS_URL, {
  retryStrategy: (times) => Math.min(times * 50, 2000)
});

redisClient.on('connect', () => console.log('🟢 Cloud Redis: Connected to Upstash.'));
redisClient.on('error', (err) => console.error('🔴 Cloud Redis Error:', err.message));

// 2. Logic
const redisService = {
  setGameState: async (roomId, gameStateObject) => {
    try {
      const key = `room:${roomId}:state`;
      await redisClient.set(key, JSON.stringify(gameStateObject), 'EX', 86400); 
      return true;
    } catch (error) {
      return false;
    }
  },
  getGameState: async (roomId) => {
    try {
      const key = `room:${roomId}:state`;
      const data = await redisClient.get(key);
      return data ? JSON.parse(data) : null;
    } catch (error) {
      return null;
    }
  }
};

// 3. Export ONLY
module.exports = redisService;