import jwt from 'jsonwebtoken';
import { ApiError } from '../utils/ApiError.js';

export function requireAuth(request, response, next) {
  const token = request.headers.authorization?.replace('Bearer ', '');
  if (!token) return next(new ApiError(401, 'Authentication required'));
  try {
    request.user = jwt.verify(token, process.env.JWT_SECRET);
    next();
  } catch { next(new ApiError(401, 'Invalid or expired token')); }
}
