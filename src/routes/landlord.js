import express from 'express';
import { updateProfile } from '../controllers/landlordController.js';
import { authMiddleware, requireRole } from '../middleware/auth.js';

const router = express.Router();

// Apply auth middleware to all routes
router.use(authMiddleware);
router.use(requireRole('landlord'));

// PUT /api/v1/landlord/profile
router.put('/profile', updateProfile);

export default router;
