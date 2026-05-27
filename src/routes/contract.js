import express from 'express';
import {
  addContract,
  listContracts,
  getContract,
  endContract,
  getMyContract,
} from '../controllers/contractController.js';
import { authMiddleware, requireRole } from '../middleware/auth.js';

const router = express.Router();

// All routes require authentication
router.use(authMiddleware);

// ========== Contract Management (Landlord) ==========
// Create contract
router.post('/', requireRole('landlord'), addContract);

// List contracts
router.get('/', requireRole('landlord'), listContracts);

// Get specific contract
router.get('/:id', requireRole('landlord'), getContract);

// Terminate contract
router.put('/:id/terminate', requireRole('landlord'), endContract);

// ========== Tenant View (Own Contract) ==========
router.get('/my/contract', requireRole('tenant'), getMyContract);

export default router;