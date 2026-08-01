import { Router, Request, Response } from 'express';
import { ApiResponse } from '../utils/api-response';

const router = Router();

router.get('/health', (_req: Request, res: Response) => {
  ApiResponse.success(res, 'ExamNavigator API is healthy', {
    status: 'UP',
    timestamp: new Date().toISOString(),
    service: 'examnavigator-backend',
  });
});

export const healthRoutes = router;
