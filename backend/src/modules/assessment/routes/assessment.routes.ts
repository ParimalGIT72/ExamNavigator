import { Router } from 'express';
import {
  questionBankController,
  mockTestController,
  testAttemptController,
} from '../controllers/assessment.controller';
import { authenticateJwt } from '../../../middleware/auth.middleware';
import { requireRole } from '../../../middleware/role.middleware';
import {
  validateRequest,
  createQuestionSchema,
  updateQuestionSchema,
  questionQuerySchema,
  questionIdParamSchema,
  createMockTestSchema,
  updateMockTestSchema,
  mockTestQuerySchema,
  mockTestIdParamSchema,
  saveDraftAttemptSchema,
  submitTestSchema,
  attemptQuerySchema,
  attemptIdParamSchema,
} from '../validations/assessment.validation';

const router = Router();

// ==========================================
// Student / General Authenticated Endpoints
// ==========================================

// Mock Tests
router.get(
  '/mock-tests',
  authenticateJwt,
  validateRequest({ query: mockTestQuerySchema }),
  mockTestController.getMockTests
);

router.get(
  '/mock-tests/:mockTestId',
  authenticateJwt,
  validateRequest({ params: mockTestIdParamSchema }),
  mockTestController.getMockTestById
);

// Mock Test Workflow
router.post(
  '/mock-tests/:mockTestId/start',
  authenticateJwt,
  validateRequest({ params: mockTestIdParamSchema }),
  testAttemptController.startTest
);

router.post(
  '/mock-tests/:mockTestId/save',
  authenticateJwt,
  validateRequest({ params: mockTestIdParamSchema, body: saveDraftAttemptSchema }),
  testAttemptController.saveDraft
);

router.get(
  '/mock-tests/:mockTestId/resume',
  authenticateJwt,
  validateRequest({ params: mockTestIdParamSchema }),
  testAttemptController.resumeTest
);

router.post(
  '/mock-tests/:mockTestId/submit',
  authenticateJwt,
  validateRequest({ params: mockTestIdParamSchema, body: submitTestSchema }),
  testAttemptController.submitTest
);

// Test Attempts History
router.get(
  '/test-attempts',
  authenticateJwt,
  validateRequest({ query: attemptQuerySchema }),
  testAttemptController.getUserTestAttempts
);

router.get(
  '/test-attempts/:attemptId',
  authenticateJwt,
  validateRequest({ params: attemptIdParamSchema }),
  testAttemptController.getTestAttemptById
);

// ==========================================
// Administrator Endpoints (Admin Role Only)
// ==========================================

// Admin Question Bank Management
router.get(
  '/admin/questions',
  authenticateJwt,
  requireRole(['Admin']),
  validateRequest({ query: questionQuerySchema }),
  questionBankController.getQuestions
);

router.get(
  '/admin/questions/:questionId',
  authenticateJwt,
  requireRole(['Admin']),
  validateRequest({ params: questionIdParamSchema }),
  questionBankController.getQuestionById
);

router.post(
  '/admin/questions',
  authenticateJwt,
  requireRole(['Admin']),
  validateRequest({ body: createQuestionSchema }),
  questionBankController.createQuestion
);

router.patch(
  '/admin/questions/:questionId',
  authenticateJwt,
  requireRole(['Admin']),
  validateRequest({ params: questionIdParamSchema, body: updateQuestionSchema }),
  questionBankController.updateQuestion
);

router.delete(
  '/admin/questions/:questionId',
  authenticateJwt,
  requireRole(['Admin']),
  validateRequest({ params: questionIdParamSchema }),
  questionBankController.deleteQuestion
);

// Admin Mock Test Management
router.get(
  '/admin/mock-tests',
  authenticateJwt,
  requireRole(['Admin']),
  validateRequest({ query: mockTestQuerySchema }),
  mockTestController.getMockTests
);

router.post(
  '/admin/mock-tests',
  authenticateJwt,
  requireRole(['Admin']),
  validateRequest({ body: createMockTestSchema }),
  mockTestController.createMockTest
);

router.patch(
  '/admin/mock-tests/:mockTestId',
  authenticateJwt,
  requireRole(['Admin']),
  validateRequest({ params: mockTestIdParamSchema, body: updateMockTestSchema }),
  mockTestController.updateMockTest
);

router.delete(
  '/admin/mock-tests/:mockTestId',
  authenticateJwt,
  requireRole(['Admin']),
  validateRequest({ params: mockTestIdParamSchema }),
  mockTestController.deleteMockTest
);

export const assessmentRoutes = router;
