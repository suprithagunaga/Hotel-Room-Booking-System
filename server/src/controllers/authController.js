import { registerSchema, loginSchema } from '../validators/authValidator.js';
import { register, login } from '../services/authService.js';
import { pool } from '../config/postgres.js';
import { ApiError } from '../utils/ApiError.js';
export async function registerController(req, res) { const parsed = registerSchema.safeParse(req.body); if (!parsed.success) throw new ApiError(400, parsed.error.issues[0].message); res.status(201).json(await register(parsed.data)); }
export async function loginController(req, res) { const parsed = loginSchema.safeParse(req.body); if (!parsed.success) throw new ApiError(400, parsed.error.issues[0].message); res.json(await login(parsed.data)); }
export async function meController(req, res) { const { rows } = await pool.query('SELECT id, name, email, created_at FROM users WHERE id = $1', [req.user.id]); if (!rows[0]) throw new ApiError(404, 'User not found'); res.json({ user: rows[0] }); }
