import express from 'express';
import { updateProfile } from './landlord.controller.js';
import { authMiddleware, requireRole } from '../../common/middleware/auth.js';

const router = express.Router();

router.use(authMiddleware);
router.use(requireRole('landlord'));
router.put('/profile', updateProfile);

export default router;
