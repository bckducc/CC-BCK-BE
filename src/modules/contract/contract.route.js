import express from 'express';
import { addContract, listContracts, getContract, endContract, getMyContract } from './contract.controller.js';
import { authMiddleware, requireRole } from '../../common/middleware/auth.js';

const router = express.Router();

router.use(authMiddleware);

router.post('/', requireRole('landlord'), addContract);
router.get('/', requireRole('landlord'), listContracts);
router.get('/:id', requireRole('landlord'), getContract);
router.put('/:id/terminate', requireRole('landlord'), endContract);
router.get('/my/contract', requireRole('tenant'), getMyContract);

export default router;
