import { Router } from 'express';
import { userController } from '../controllers/user.controller';
import { authenticateJwt } from '../../../middleware/auth.middleware';

const router = Router();

router.get('/profile', authenticateJwt, (req, res, next) => userController.getProfile(req, res, next));
router.patch('/profile', authenticateJwt, (req, res, next) => userController.updateProfile(req, res, next));

export const userRoutes = router;
