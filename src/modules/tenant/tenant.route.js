import express from 'express';
import { getTenantDashboard, updateTenantProfile } from './tenant.controller.js';
import { authMiddleware, requireRole } from '../../common/middleware/auth.js';

const router = express.Router();

router.use(authMiddleware);

router.post('/', requireRole('landlord'), async (req, res, next) => {
  const { createNewTenant } = await import('./tenant.controller.js');
  createNewTenant(req, res, next);
});

router.get('/', requireRole('landlord'), async (req, res, next) => {
  const { listTenants } = await import('./tenant.controller.js');
  listTenants(req, res, next);
});

router.get('/:id', requireRole('landlord'), async (req, res, next) => {
  const { getTenant } = await import('./tenant.controller.js');
  getTenant(req, res, next);
});

router.put('/:id/status', requireRole('landlord'), async (req, res, next) => {
  const { changeTenantStatus } = await import('./tenant.controller.js');
  changeTenantStatus(req, res, next);
});

router.put('/:id', requireRole('landlord'), async (req, res, next) => {
  const { editTenant } = await import('./tenant.controller.js');
  editTenant(req, res, next);
});

router.get('/dashboard', requireRole('tenant'), getTenantDashboard);
router.put('/profile', updateTenantProfile);

export default router;
