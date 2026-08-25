import { createClient } from 'redis';
import 'dotenv/config';

export const redis = createClient({ url: process.env.REDIS_URL, socket: { reconnectStrategy: false } });
redis.on('error', (error) => console.error('Redis unavailable:', error.message));

export async function connectRedis() {
  await redis.connect();
  console.log('Redis connected');
}

export async function safeGet(key) {
  try { return redis.isReady ? await redis.get(key) : null; } catch { return null; }
}
export async function safeSet(key, value, ttl) {
  try { if (redis.isReady) await redis.set(key, value, { EX: ttl }); } catch { /* database remains authoritative */ }
}
export async function safeDelete(key) {
  try { if (redis.isReady) await redis.del(key); } catch { /* cache invalidation is best effort */ }
}
