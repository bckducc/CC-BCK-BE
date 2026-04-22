import express from 'express';
import {
  listNotifications,
  markNotificationRead,
  markAllNotificationsRead,
  removeNotification,
} from '../controllers/notificationController.js';
import { authMiddleware } from '../middleware/auth.js';

const router = express.Router();

router.use(authMiddleware);

router.get('/', listNotifications);
router.put('/:id/read', markNotificationRead);
router.put('/read-all', markAllNotificationsRead);
router.delete('/:id', removeNotification);

export default router;