import express from 'express';
import { getTenantDashboard, updateTenantProfile } from '../controllers/tenantController.js';
import { authMiddleware, requireRole } from '../middleware/auth.js';

const router = express.Router();

// All tenant routes require authentication and tenant role
router.use(authMiddleware);

// ========== TENANT MANAGEMENT (Landlord only) ==========
router.post('/', authMiddleware, requireRole('landlord'), async (req, res, next) => {
  const { createNewTenant } = await import('../controllers/tenantController.js');
  createNewTenant(req, res, next);
});

router.get('/', authMiddleware, requireRole('landlord'), async (req, res, next) => {
  const { listTenants } = await import('../controllers/tenantController.js');
  listTenants(req, res, next);
});

router.get('/:id', authMiddleware, requireRole('landlord'), async (req, res, next) => {
  const { getTenant } = await import('../controllers/tenantController.js');
  getTenant(req, res, next);
});

router.put('/:id/status', authMiddleware, requireRole('landlord'), async (req, res, next) => {
  const { changeTenantStatus } = await import('../controllers/tenantController.js');
  changeTenantStatus(req, res, next);
});

router.put('/:id', authMiddleware, requireRole('landlord'), async (req, res, next) => {
  const { editTenant } = await import('../controllers/tenantController.js');
  editTenant(req, res, next);
});

// ========== TENANT PROFILE (Tenant personal) ==========
router.get('/dashboard', authMiddleware, requireRole('tenant'), getTenantDashboard);
router.put('/profile', authMiddleware, updateTenantProfile);

export default router;
