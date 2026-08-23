import { Router } from 'express';
import { progressController } from '../controllers/progress.controller';
import { authenticateJwt } from '../../../middleware/auth.middleware';
import { attachAcademicContext } from '../../../middleware/academic-context.middleware';
import {
  validateProgressRequest,
  topicIdParamSchema,
  updateProgressBodySchema,
} from '../validations/progress.validation';

const router = Router();

// GET /api/v1/progress/summary — must be defined before :topicId param route
router.get(
  '/progress/summary',
  authenticateJwt,
  attachAcademicContext,
  progressController.getProgressSummary
);

// GET /api/v1/progress/topics/:topicId
router.get(
  '/progress/topics/:topicId',
  authenticateJwt,
  attachAcademicContext,
  validateProgressRequest({ params: topicIdParamSchema }),
  progressController.getTopicProgress
);

// PUT /api/v1/progress/topics/:topicId
router.put(
  '/progress/topics/:topicId',
  authenticateJwt,
  attachAcademicContext,
  validateProgressRequest({ params: topicIdParamSchema, body: updateProgressBodySchema }),
  progressController.updateTopicProgress
);

export const progressRoutes = router;
