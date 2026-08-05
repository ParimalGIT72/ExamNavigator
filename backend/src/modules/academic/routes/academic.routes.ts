import { Router } from 'express';
import {
  subjectController,
  chapterController,
  topicController,
  learningResourceController,
} from '../controllers/academic.controller';
import { authenticateJwt } from '../../../middleware/auth.middleware';
import { requireRole } from '../../../middleware/role.middleware';
import {
  validateRequest,
  createSubjectSchema,
  updateSubjectSchema,
  subjectQuerySchema,
  subjectIdParamSchema,
  createChapterSchema,
  updateChapterSchema,
  chapterQuerySchema,
  chapterIdParamSchema,
  createTopicSchema,
  updateTopicSchema,
  topicQuerySchema,
  topicIdParamSchema,
  createLearningResourceSchema,
  updateLearningResourceSchema,
  resourceQuerySchema,
  resourceIdParamSchema,
} from '../validations/academic.validation';

const router = Router();

// ==========================================
// Student / General Authenticated Endpoints
// ==========================================

// Subjects
router.get(
  '/subjects',
  authenticateJwt,
  validateRequest({ query: subjectQuerySchema }),
  subjectController.getSubjects
);

router.get(
  '/subjects/:subjectId',
  authenticateJwt,
  validateRequest({ params: subjectIdParamSchema }),
  subjectController.getSubjectById
);

// Chapters
router.get(
  '/subjects/:subjectId/chapters',
  authenticateJwt,
  validateRequest({ params: subjectIdParamSchema, query: chapterQuerySchema }),
  chapterController.getChapters
);

router.get(
  '/chapters/:chapterId',
  authenticateJwt,
  validateRequest({ params: chapterIdParamSchema }),
  chapterController.getChapterById
);

// Topics
router.get(
  '/chapters/:chapterId/topics',
  authenticateJwt,
  validateRequest({ params: chapterIdParamSchema, query: topicQuerySchema }),
  topicController.getTopics
);

router.get(
  '/topics/:topicId',
  authenticateJwt,
  validateRequest({ params: topicIdParamSchema }),
  topicController.getTopicById
);

// Learning Resources
router.get(
  '/topics/:topicId/resources',
  authenticateJwt,
  validateRequest({ params: topicIdParamSchema, query: resourceQuerySchema }),
  learningResourceController.getResources
);

router.get(
  '/resources/:resourceId',
  authenticateJwt,
  validateRequest({ params: resourceIdParamSchema }),
  learningResourceController.getResourceById
);

// ==========================================
// Administrator Endpoints (Admin Role Only)
// ==========================================

// Admin Subject Management
router.post(
  '/admin/subjects',
  authenticateJwt,
  requireRole(['Admin']),
  validateRequest({ body: createSubjectSchema }),
  subjectController.createSubject
);

router.patch(
  '/admin/subjects/:subjectId',
  authenticateJwt,
  requireRole(['Admin']),
  validateRequest({ params: subjectIdParamSchema, body: updateSubjectSchema }),
  subjectController.updateSubject
);

router.delete(
  '/admin/subjects/:subjectId',
  authenticateJwt,
  requireRole(['Admin']),
  validateRequest({ params: subjectIdParamSchema }),
  subjectController.deleteSubject
);

// Admin Chapter Management
router.post(
  '/admin/chapters',
  authenticateJwt,
  requireRole(['Admin']),
  validateRequest({ body: createChapterSchema }),
  chapterController.createChapter
);

router.patch(
  '/admin/chapters/:chapterId',
  authenticateJwt,
  requireRole(['Admin']),
  validateRequest({ params: chapterIdParamSchema, body: updateChapterSchema }),
  chapterController.updateChapter
);

router.delete(
  '/admin/chapters/:chapterId',
  authenticateJwt,
  requireRole(['Admin']),
  validateRequest({ params: chapterIdParamSchema }),
  chapterController.deleteChapter
);

// Admin Topic Management
router.post(
  '/admin/topics',
  authenticateJwt,
  requireRole(['Admin']),
  validateRequest({ body: createTopicSchema }),
  topicController.createTopic
);

router.patch(
  '/admin/topics/:topicId',
  authenticateJwt,
  requireRole(['Admin']),
  validateRequest({ params: topicIdParamSchema, body: updateTopicSchema }),
  topicController.updateTopic
);

router.delete(
  '/admin/topics/:topicId',
  authenticateJwt,
  requireRole(['Admin']),
  validateRequest({ params: topicIdParamSchema }),
  topicController.deleteTopic
);

// Admin Resource Management
router.post(
  '/admin/resources',
  authenticateJwt,
  requireRole(['Admin']),
  validateRequest({ body: createLearningResourceSchema }),
  learningResourceController.createResource
);

router.patch(
  '/admin/resources/:resourceId',
  authenticateJwt,
  requireRole(['Admin']),
  validateRequest({ params: resourceIdParamSchema, body: updateLearningResourceSchema }),
  learningResourceController.updateResource
);

router.delete(
  '/admin/resources/:resourceId',
  authenticateJwt,
  requireRole(['Admin']),
  validateRequest({ params: resourceIdParamSchema }),
  learningResourceController.deleteResource
);

export const academicRoutes = router;
