import express from 'express';
import { recordReading, getReading, getRoomReadings, listReadings, removeReading, setConfig, getConfig } from './utility.controller.js';
import { authMiddleware, requireRole } from '../../common/middleware/auth.js';

const router = express.Router();

router.use(authMiddleware);

router.post('/config', requireRole('landlord'), setConfig);
router.get('/config', getConfig);

router.post('/', requireRole('landlord'), recordReading);
router.get('/', requireRole('landlord'), listReadings);
router.get('/reading', requireRole('landlord'), getReading);
router.get('/room/:room_id', requireRole('landlord'), getRoomReadings);
router.delete('/', requireRole('landlord'), removeReading);

export default router;
