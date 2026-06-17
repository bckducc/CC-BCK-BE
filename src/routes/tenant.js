import express from 'express';
import { getTenantDashboard, updateTenantProfile } from '../controllers/tenantController.js';
import { authMiddleware, requireRole } from '../middleware/auth.js';

const router = express.Router();

router.use(authMiddleware);

router.get('/dashboard', requireRole('tenant'), getTenantDashboard);
router.put('/profile', requireRole('tenant'), updateTenantProfile);

router.post('/', requireRole('landlord'), async (req, res, next) => {
  const { createNewTenant } = await import('../controllers/tenantController.js');
  createNewTenant(req, res, next);
});

router.get('/', requireRole('landlord'), async (req, res, next) => {
  const { listTenants } = await import('../controllers/tenantController.js');
  listTenants(req, res, next);
});

router.get('/:id', requireRole('landlord'), async (req, res, next) => {
  const { getTenant } = await import('../controllers/tenantController.js');
  getTenant(req, res, next);
});

router.put('/:id/status', requireRole('landlord'), async (req, res, next) => {
  const { changeTenantStatus } = await import('../controllers/tenantController.js');
  changeTenantStatus(req, res, next);
});

router.put('/:id', requireRole('landlord'), async (req, res, next) => {
  const { editTenant } = await import('../controllers/tenantController.js');
  editTenant(req, res, next);
});

export default router;
