import { pool } from '../config/postgres.js';
import { safeGet, safeSet } from '../config/redis.js';
import { ApiError } from '../utils/ApiError.js';

export async function listRooms(page = 1, limit = 12) {
  const offset = (page - 1) * limit;
  const { rows } = await pool.query('SELECT id, room_number, room_type, capacity, price_per_night, description, image_url FROM rooms WHERE is_active = true ORDER BY room_number LIMIT $1 OFFSET $2', [limit, offset]);
  return rows;
}
export async function getRoom(id) {
  const { rows } = await pool.query('SELECT id, room_number, room_type, capacity, price_per_night, description, image_url FROM rooms WHERE id = $1 AND is_active = true', [id]);
  if (!rows[0]) throw new ApiError(404, 'Room not found');
  return rows[0];
}
export async function availability(id, checkIn, checkOut) {
  const key = `room:${id}:availability:${checkIn}:${checkOut}`;
  const cached = await safeGet(key);
  if (cached) return JSON.parse(cached);
  await getRoom(id);
  const { rows } = await pool.query("SELECT NOT EXISTS (SELECT 1 FROM bookings WHERE room_id = $1 AND status = 'confirmed' AND check_in_date < $3::date AND check_out_date > $2::date) AS available", [id, checkIn, checkOut]);
  const result = rows[0];
  await safeSet(key, JSON.stringify(result), Number(process.env.AVAILABILITY_CACHE_TTL) || 60);
  return result;
}
export async function roomBookings(id, page = 1, limit = 20) {
  await getRoom(id);
  const { rows } = await pool.query("SELECT id, check_in_date, check_out_date, status, created_at FROM bookings WHERE room_id = $1 AND status = 'confirmed' ORDER BY check_in_date DESC LIMIT $2 OFFSET $3", [id, limit, (page - 1) * limit]);
  return rows;
}
