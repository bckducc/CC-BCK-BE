import express from 'express';
import {
  getAllRooms,
  getRoom,
  addRoom,
  modifyRoom,
  removeRoom,
} from '../controllers/roomController.js';
import { authMiddleware } from '../middleware/auth.js';

const router = express.Router();

router.use(authMiddleware);
router.get('/', getAllRooms);
router.get('/:id', getRoom);
router.post('/', addRoom);
router.put('/:id', modifyRoom);
router.delete('/:id', removeRoom);

export default router;
