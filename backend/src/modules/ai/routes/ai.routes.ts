import { Router } from 'express';
import rateLimit from 'express-rate-limit';
import { aiController } from '../controllers/ai.controller';
import { ragController } from '../controllers/rag.controller';
import { chatController } from '../controllers/chat.controller';
import { specializedAiController } from '../controllers/specialized-ai.controller';
import { authenticateJwt } from '../../../middleware/auth.middleware';
import { requireRole } from '../../../middleware/role.middleware';

// Dedicated per-minute rate limiter for AI subsystem
export const aiRateLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 15, // Max 15 requests per minute
  keyGenerator: (req) => (req as any).user?.userId || req.ip,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: 'AI request rate limit exceeded. Please wait a minute before sending more requests.',
    errorCode: 'TOO_MANY_REQUESTS',
  },
});

const router = Router();

router.use(aiRateLimiter);

// 1. Protected AI Gateway Direct Query Endpoint (Phase 6A)
router.post('/chat/direct', authenticateJwt, aiController.directChat.bind(aiController));

router.post('/chat/stream', authenticateJwt, chatController.streamChat.bind(chatController));
router.get('/chat/sessions', authenticateJwt, chatController.getSessions.bind(chatController));
router.post('/chat', authenticateJwt, chatController.startChat.bind(chatController));
router.post('/chat/:sessionId', authenticateJwt, chatController.continueChat.bind(chatController));
router.get('/chat/:sessionId/messages', authenticateJwt, chatController.getSessionMessages.bind(chatController));
router.delete('/chat/:sessionId', authenticateJwt, chatController.deleteSession.bind(chatController));

// 3. Protected RAG Retrieval & Ingestion Endpoints (Phase 6B)
router.post('/rag/query', authenticateJwt, ragController.query.bind(ragController));
router.post('/rag/ingest/:resourceId', authenticateJwt, requireRole(['Admin']), ragController.ingest.bind(ragController));

// 4. Protected Specialized AI Service Endpoints (Phase 6D)
router.post('/notes', authenticateJwt, specializedAiController.generateNotes.bind(specializedAiController));
router.get('/notes', authenticateJwt, specializedAiController.getUserNotes.bind(specializedAiController));
router.get('/notes/:noteId', authenticateJwt, specializedAiController.getNoteById.bind(specializedAiController));
router.patch('/notes/:noteId', authenticateJwt, specializedAiController.updateNote.bind(specializedAiController));
router.delete('/notes/:noteId', authenticateJwt, specializedAiController.deleteNote.bind(specializedAiController));

router.post('/flashcards', authenticateJwt, specializedAiController.generateFlashcards.bind(specializedAiController));
router.get('/flashcards', authenticateJwt, specializedAiController.getFlashcards.bind(specializedAiController));
router.delete('/flashcards/:cardId', authenticateJwt, specializedAiController.deleteFlashcard.bind(specializedAiController));

router.post('/topic-detect', authenticateJwt, specializedAiController.detectTopic.bind(specializedAiController));

export const aiRoutes = router;
