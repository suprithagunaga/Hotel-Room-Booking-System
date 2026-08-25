import { z } from 'zod';
import { listRooms, getRoom, availability, roomBookings } from '../services/roomService.js';
import { availabilitySchema } from '../validators/bookingValidator.js';
import { ApiError } from '../utils/ApiError.js';
const idSchema = z.string().uuid();
function id(req) { const result = idSchema.safeParse(req.params.id); if (!result.success) throw new ApiError(400, 'Invalid room ID'); return req.params.id; }
export async function list(req, res) { const page = Math.max(1, Number(req.query.page) || 1); res.json({ rooms: await listRooms(page) }); }
export async function detail(req, res) { res.json({ room: await getRoom(id(req)) }); }
export async function availabilityCheck(req, res) { const roomId = id(req); const parsed = availabilitySchema.safeParse(req.query); if (!parsed.success) throw new ApiError(400, parsed.error.issues[0].message); res.json(await availability(roomId, parsed.data.checkIn, parsed.data.checkOut)); }
export async function bookings(req, res) { const roomId = id(req); res.json({ bookings: await roomBookings(roomId, Math.max(1, Number(req.query.page) || 1)) }); }
