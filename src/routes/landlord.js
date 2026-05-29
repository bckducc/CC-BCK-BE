import express from 'express';
import { updateProfile } from '../controllers/landlordController.js';
import { authMiddleware, requireRole } from '../middleware/auth.js';

const router = express.Router();

router.use(authMiddleware);
router.use(requireRole('landlord'));
router.put('/profile', updateProfile);

export default router;
