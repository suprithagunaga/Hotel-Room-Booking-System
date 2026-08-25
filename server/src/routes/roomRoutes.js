import { Router } from 'express';
import { asyncHandler } from '../utils/asyncHandler.js';
import { list, detail, availabilityCheck, bookings } from '../controllers/roomController.js';
const router = Router();
router.get('/', asyncHandler(list));
router.get('/:id/availability', asyncHandler(availabilityCheck));
router.get('/:id/bookings', asyncHandler(bookings));
router.get('/:id', asyncHandler(detail));
export default router;
