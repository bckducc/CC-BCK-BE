import express from 'express';
import { getTenantDashboard, updateTenantProfile } from '../controllers/tenantController.js';
import { authMiddleware, requireRole } from '../middleware/auth.js';

const router = express.Router();

// All tenant routes require authentication and tenant role
router.use(authMiddleware);
router.use(requireRole('tenant'));

// Tenant dashboard
router.get('/dashboard', getTenantDashboard);

// Update tenant profile
router.put('/profile', updateTenantProfile);

export default router;
