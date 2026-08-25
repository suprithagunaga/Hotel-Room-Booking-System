import 'dotenv/config';
import { app } from './app.js';
import { connectMongo } from './config/mongo.js';
import { connectRedis } from './config/redis.js';
import { pool } from './config/postgres.js';

const port = Number(process.env.PORT) || 4000;
app.listen(port, () => console.log(`API listening on http://localhost:${port}`));

try {
  await pool.query('SELECT 1');
  console.log('PostgreSQL connected');
} catch (error) {
  console.error('PostgreSQL unavailable; database routes will return an error:', error.message);
}

try {
  await connectMongo();
} catch (error) {
  console.error('MongoDB unavailable; activity logging is disabled:', error.message);
}

try {
  await connectRedis();
} catch (error) {
  console.warn('Redis disabled; using database fallback:', error.message);
}
