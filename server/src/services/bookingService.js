import { pool } from '../config/postgres.js';
import { safeDelete } from '../config/redis.js';
import { ApiError } from '../utils/ApiError.js';
import { logActivity } from './activityLogService.js';

export async function createBooking({ userId, userName, roomId, checkIn, checkOut }) {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    const room = await client.query('SELECT id, room_number, room_type, price_per_night FROM rooms WHERE id = $1 AND is_active = true FOR UPDATE', [roomId]);
    if (!room.rows[0]) throw new ApiError(404, 'Room not found');
    const conflict = await client.query("SELECT id FROM bookings WHERE room_id = $1 AND status = 'confirmed' AND check_in_date < $3::date AND check_out_date > $2::date LIMIT 1", [roomId, checkIn, checkOut]);
    if (conflict.rows[0]) {
      await client.query('ROLLBACK');
      await logActivity({ userId, roomId, action: 'BOOKING_CONFLICT', metadata: { checkIn, checkOut } });
      throw new ApiError(409, 'Room is already booked for those dates');
    }
    const nights = Math.round((Date.parse(`${checkOut}T00:00:00Z`) - Date.parse(`${checkIn}T00:00:00Z`)) / 86400000);
    const totalAmount = nights * Number(room.rows[0].price_per_night);
    const { rows } = await client.query("INSERT INTO bookings (user_id, room_id, check_in_date, check_out_date, total_amount) VALUES ($1, $2, $3, $4, $5) RETURNING id, user_id, room_id, check_in_date, check_out_date, total_amount, status, created_at", [userId, roomId, checkIn, checkOut, totalAmount]);
    await client.query('COMMIT');
    const booking = { ...rows[0], guest_name: userName, room: room.rows[0] };
    await safeDelete(`room:${roomId}:availability:${checkIn}:${checkOut}`);
    await logActivity({ userId, roomId, bookingId: booking.id, action: 'BOOKING_CREATED', metadata: { checkIn, checkOut } });
    return booking;
  } catch (error) { try { await client.query('ROLLBACK'); } catch {} throw error; } finally { client.release(); }
}
export async function myBookings(userId, page = 1, limit = 20) {
  const { rows } = await pool.query('SELECT b.id, b.room_id, r.room_number, r.room_type, r.image_url, r.price_per_night, b.check_in_date, b.check_out_date, b.total_amount, b.status, b.created_at FROM bookings b JOIN rooms r ON r.id = b.room_id WHERE b.user_id = $1 ORDER BY b.check_in_date DESC LIMIT $2 OFFSET $3', [userId, limit, (page - 1) * limit]);
  return rows;
}

export async function getBooking(userId, bookingId) {
  const { rows } = await pool.query('SELECT b.id, b.user_id, b.room_id, r.room_number, r.room_type, r.image_url, r.price_per_night, b.check_in_date, b.check_out_date, b.total_amount, b.status, b.created_at FROM bookings b JOIN rooms r ON r.id = b.room_id WHERE b.id = $1 AND b.user_id = $2', [bookingId, userId]);
  if (!rows[0]) throw new ApiError(404, 'Booking not found');
  return rows[0];
}
