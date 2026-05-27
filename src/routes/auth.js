import express from 'express';
import { login, me, logout, checkUser } from '../controllers/authController.js';
import { authMiddleware } from '../middleware/auth.js';

const router = express.Router();

// Public routes
router.post('/login', login);

// Protected routes
router.get('/me', authMiddleware, me);
router.post('/logout', authMiddleware, logout);
router.get('/check-user', checkUser);

export default router;
