import { Router } from 'express';
import { systemController } from '../controllers/system.controller';

const router = Router();

router.get('/health', (req, res) => systemController.getHealth(req, res));

export const systemRoutes = router;
