import express from 'express';
import * as authController from '../controllers/authController.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

router.post('/register', authController.register);

router.post('/login', authController.login);

router.get('/verify/:token', authController.verifyEmail);

router.post('/resend-verification', authController.resendVerification);

router.get('/me', protect, authController.getMe);

router.put('/profile', protect, authController.updateProfile);

router.put('/password', protect, authController.changePassword);

router.get('/user/:id', authController.getUserById);

export default router;
