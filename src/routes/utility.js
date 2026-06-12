import express from 'express';
import {
  recordReading,
  getReading,
  getContractReadings,
  getRoomReadings,
  listReadings,
  removeReading,
} from '../controllers/utilityController.js';

import { authMiddleware, requireRole } from '../middleware/auth.js';

const router = express.Router();

router.use(authMiddleware);

router.post('/', requireRole('landlord'), recordReading);
router.get('/', requireRole('landlord'), listReadings);
router.get('/reading', requireRole('landlord'), getReading);
router.get('/contract/:contract_id', requireRole('landlord'), getContractReadings);
router.get('/room/:room_id', requireRole('landlord'), getRoomReadings);
router.delete('/', requireRole('landlord'), removeReading);

export default router;
