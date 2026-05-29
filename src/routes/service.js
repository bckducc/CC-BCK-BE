import express from 'express';
import {
  addService,
  listServices,
  getService,
  editService,
  removeService,
  assignService,
  getRoomServiceList,
  removeServiceFromRoomHandler,
  updateRoomServiceQuantityHandler,
} from '../controllers/serviceController.js';
import { authMiddleware, requireRole } from '../middleware/auth.js';

const router = express.Router();

router.use(authMiddleware);
router.use(requireRole('landlord'));

router.post('/', addService);
router.get('/', listServices);
router.get('/:id', getService);
router.put('/:id', editService);
router.delete('/:id', removeService);

router.post('/room/assign', assignService);
router.get('/room/:room_id', getRoomServiceList);
router.delete('/room/:room_id/:service_id', removeServiceFromRoomHandler);

router.put('/room/:room_id/:service_id/quantity', updateRoomServiceQuantityHandler);

export default router;