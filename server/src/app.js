import express from 'express';
import cors from 'cors';
import authRoutes from './routes/authRoutes.js';
import roomRoutes from './routes/roomRoutes.js';
import bookingRoutes from './routes/bookingRoutes.js';
import { notFound, errorHandler } from './middleware/errorMiddleware.js';

export const app = express();
const allowedOrigins = [/^http:\/\/localhost:\d+$/, process.env.CLIENT_ORIGIN].filter(Boolean);
app.use(cors({ origin: allowedOrigins }));
app.use(express.json({ limit: '20kb' }));
app.get('/api/health', (req, res) => res.json({ status: 'ok' }));
app.use('/api/auth', authRoutes);
app.use('/api/rooms', roomRoutes);
app.use('/api/bookings', bookingRoutes);
app.use(notFound);
app.use(errorHandler);
