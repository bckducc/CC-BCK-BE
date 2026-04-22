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
  updateRoomServicePriceHandler,
} from '../controllers/serviceController.js';
import { authMiddleware, requireRole } from '../middleware/auth.js';

const router = express.Router();

// All routes require authentication and landlord role
router.use(authMiddleware);
router.use(requireRole('landlord'));

// Services CRUD
router.post('/', addService);
router.get('/', listServices);
router.get('/:id', getService);
router.put('/:id', editService);
router.delete('/:id', removeService);

// Room Services (assign services to rooms)
router.post('/assign', assignService);
router.get('/room/:room_id', getRoomServiceList);
router.delete('/room/:room_id/:service_id', removeServiceFromRoomHandler);
router.put('/room/:room_id/:service_id/price', updateRoomServicePriceHandler);

export default router;