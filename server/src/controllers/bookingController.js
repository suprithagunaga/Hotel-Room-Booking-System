import { bookingSchema } from '../validators/bookingValidator.js';
import { createBooking, myBookings, getBooking } from '../services/bookingService.js';
import { ApiError } from '../utils/ApiError.js';
export async function create(req, res) { const parsed = bookingSchema.safeParse(req.body); if (!parsed.success) throw new ApiError(400, parsed.error.issues[0].message); res.status(201).json({ booking: await createBooking({ userId: req.user.id, userName: req.user.name, ...parsed.data }) }); }
export async function mine(req, res) { res.json({ bookings: await myBookings(req.user.id, Math.max(1, Number(req.query.page) || 1)) }); }
export async function detail(req, res) { res.json({ booking: await getBooking(req.user.id, req.params.id) }); }
