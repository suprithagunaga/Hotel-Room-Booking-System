import { z } from 'zod';

const date = z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Use YYYY-MM-DD dates').refine((value) => !Number.isNaN(Date.parse(`${value}T00:00:00Z`)), 'Invalid date');
const notPast = (value) => value >= new Date().toISOString().slice(0, 10);
export const bookingSchema = z.object({ roomId: z.string().uuid(), checkIn: date.refine(notPast, 'Check-in date cannot be in the past'), checkOut: date }).refine((data) => data.checkOut > data.checkIn, { message: 'Check-out must be after check-in', path: ['checkOut'] });
export const availabilitySchema = z.object({ checkIn: date.refine(notPast, 'Check-in date cannot be in the past'), checkOut: date }).refine((data) => data.checkOut > data.checkIn, { message: 'Check-out must be after check-in', path: ['checkOut'] });
