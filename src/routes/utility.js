import express from 'express';
import {
  recordReading,
  getReading,
  getRoomReadings,
  listReadings,
  removeReading,
} from '../controllers/utilityController.js';
import {
  setConfig,
  getConfig,
} from '../controllers/utilityConfigController.js';
import { authMiddleware, requireRole } from '../middleware/auth.js';

const router = express.Router();

// All routes require authentication
router.use(authMiddleware);

// ========== Utility Configuration (Landlord Only) ==========
router.post('/config', requireRole('landlord'), setConfig);
router.get('/config', authMiddleware, getConfig);

// ========== Utility Management (Landlord Only) ==========
router.post('/', requireRole('landlord'), recordReading);
router.get('/', requireRole('landlord'), listReadings);
router.get('/reading', requireRole('landlord'), getReading);
router.get('/room/:room_id', requireRole('landlord'), getRoomReadings);
router.delete('/', requireRole('landlord'), removeReading);

export default router;
