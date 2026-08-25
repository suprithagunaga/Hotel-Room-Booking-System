import { Router } from 'express';
import { asyncHandler } from '../utils/asyncHandler.js';
import { requireAuth } from '../middleware/authMiddleware.js';
import { registerController, loginController, meController } from '../controllers/authController.js';
const router = Router();
router.post('/register', asyncHandler(registerController));
router.post('/login', asyncHandler(loginController));
router.get('/me', requireAuth, asyncHandler(meController));
export default router;
