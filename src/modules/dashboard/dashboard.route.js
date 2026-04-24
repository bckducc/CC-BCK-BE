import express from 'express';
import { getLandlordStats, getTenantStats } from './dashboard.controller.js';
import { authMiddleware, requireRole } from '../../common/middleware/auth.js';

const router = express.Router();

router.use(authMiddleware);
router.get('/landlord', requireRole('landlord'), getLandlordStats);
router.get('/tenant', requireRole('tenant'), getTenantStats);

export default router;
