import { Router } from 'express';
import { authController } from '../controllers/auth.controller';
import { authenticateJwt } from '../../../middleware/auth.middleware';

const router = Router();

// Public Authentication Endpoints
router.post('/register', (req, res, next) => authController.register(req, res, next));
router.post('/login', (req, res, next) => authController.login(req, res, next));
router.post('/refresh-token', (req, res, next) => authController.refreshToken(req, res, next));
router.post('/forgot-password', (req, res, next) => authController.forgotPassword(req, res, next));
router.post('/reset-password', (req, res, next) => authController.resetPassword(req, res, next));
router.post('/verify-email', (req, res, next) => authController.verifyEmail(req, res, next));
router.post('/google', (req, res, next) => authController.googleAuth(req, res, next));

// Protected Authentication Endpoints
router.post('/logout', authenticateJwt, (req, res, next) => authController.logout(req, res, next));
router.get('/me', authenticateJwt, (req, res, next) => authController.getCurrentUser(req, res, next));
router.patch('/change-password', authenticateJwt, (req, res, next) => authController.changePassword(req, res, next));

export const authRoutes = router;
