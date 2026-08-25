import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { pool } from '../config/postgres.js';
import { ApiError } from '../utils/ApiError.js';
import { logActivity } from './activityLogService.js';

function tokenFor(user) { return jwt.sign({ id: user.id, email: user.email, name: user.name }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }); }
export async function register({ name, email, password }) {
  const hash = await bcrypt.hash(password, 12);
  try {
    const { rows } = await pool.query('INSERT INTO users (name, email, password_hash) VALUES ($1, $2, $3) RETURNING id, name, email, created_at', [name, email, hash]);
    const user = rows[0];
    await logActivity({ userId: user.id, action: 'USER_REGISTERED' });
    return { user, token: tokenFor(user) };
  } catch (error) { if (error.code === '23505') throw new ApiError(409, 'An account with that email already exists'); throw error; }
}
export async function login({ email, password }) {
  const { rows } = await pool.query('SELECT id, name, email, password_hash, created_at FROM users WHERE email = $1', [email]);
  const user = rows[0];
  if (!user || !(await bcrypt.compare(password, user.password_hash))) throw new ApiError(401, 'Invalid email or password');
  delete user.password_hash;
  await logActivity({ userId: user.id, action: 'USER_LOGGED_IN' });
  return { user, token: tokenFor(user) };
}
