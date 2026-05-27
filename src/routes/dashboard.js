import express from 'express';
import { getLandlordStats, getTenantStats } from '../controllers/dashboardController.js';
import { authMiddleware, requireRole } from '../middleware/auth.js';

const router = express.Router();

router.use(authMiddleware);

router.get('/landlord', requireRole('landlord'), getLandlordStats);
router.get('/tenant', requireRole('tenant'), getTenantStats);

export default router;