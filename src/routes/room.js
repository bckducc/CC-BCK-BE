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

// All routes require authentication
router.use(authMiddleware);

// Get all rooms
router.get('/', getAllRooms);

// Get specific room
router.get('/:id', getRoom);

// Create new room
router.post('/', addRoom);

// Update room
router.put('/:id', modifyRoom);

// Delete room
router.delete('/:id', removeRoom);

export default router;
