import express from 'express';
import { login, me, logout, checkUser } from './auth.controller.js';
import { authMiddleware } from '../../common/middleware/auth.js';

const router = express.Router();

router.post('/login', login);
router.get('/me', authMiddleware, me);
router.post('/logout', authMiddleware, logout);
router.get('/check-user', checkUser);

export default router;
