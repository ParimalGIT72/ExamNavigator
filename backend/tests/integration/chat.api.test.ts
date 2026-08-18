import request from 'supertest';
import jwt from 'jsonwebtoken';
import app from '../../src/app';
import { envConfig } from '../../src/config/env.config';
import { aiLogRepository, chatSessionRepository, chatMessageRepository, embeddingRepository } from '../../src/modules/ai/repositories/ai.repository';

describe('Phase 6C - Chat Memory & Session API Integration Tests', () => {
  const studentUser1 = {
    userId: '507f1f77bcf86cd799439011',
    email: 'student1@examnavigator.com',
    role: 'Student' as const,
  };

  const tokenUser1 = jwt.sign(studentUser1, envConfig.jwtSecret);

  beforeEach(() => {
    jest.spyOn(aiLogRepository, 'getDailyTokenUsage').mockResolvedValue(500);
    jest.spyOn(aiLogRepository, 'getDailyRequestCount').mockResolvedValue(2);
    jest.spyOn(aiLogRepository, 'create').mockResolvedValue({} as any);
    jest.spyOn(embeddingRepository, 'findCandidatesByMetadata').mockResolvedValue([]);
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe('POST /api/v1/ai/chat (Start New Session)', () => {
    it('should reject unauthenticated requests with 401 Unauthorized', async () => {
      const res = await request(app).post('/api/v1/ai/chat').send({
        message: 'Explain Newton laws of motion',
      });

      expect(res.status).toBe(401);
    });

    it('should reject invalid message with 400 Bad Request', async () => {
      const res = await request(app)
        .post('/api/v1/ai/chat')
        .set('Authorization', `Bearer ${tokenUser1}`)
        .send({
          message: 'hi', // too short (< 3 chars)
        });

      expect(res.status).toBe(400);
    });

    it('should return 429 Too Many Requests when daily AI quota is exceeded', async () => {
      jest.spyOn(aiLogRepository, 'getDailyRequestCount').mockResolvedValue(55); // exceeds 50/day

      const res = await request(app)
        .post('/api/v1/ai/chat')
        .set('Authorization', `Bearer ${tokenUser1}`)
        .send({
          message: 'Explain quantum entanglement in simple terms',
        });

      expect(res.status).toBe(429);
      expect(res.body.errorCode).toBe('TOO_MANY_REQUESTS');
    });

    it('should create new session and return AI response with citations and token usage', async () => {
      const mockSession = {
        _id: '507f1f77bcf86cd799439001',
        userId: studentUser1.userId,
        title: 'Explain Newton third law',
        messageCount: 2,
        status: 'Active',
      };

      jest.spyOn(chatSessionRepository, 'create').mockResolvedValue(mockSession as any);
      jest.spyOn(chatSessionRepository, 'findById').mockResolvedValue(mockSession as any);
      jest.spyOn(chatMessageRepository, 'create').mockResolvedValue({} as any);
      jest.spyOn(chatMessageRepository, 'findWindowMessages').mockResolvedValue([]);
      jest.spyOn(chatMessageRepository, 'countOutsideWindowUnsummarized').mockResolvedValue(0);
      jest.spyOn(chatSessionRepository, 'update').mockResolvedValue(mockSession as any);

      const res = await request(app)
        .post('/api/v1/ai/chat')
        .set('Authorization', `Bearer ${tokenUser1}`)
        .send({
          message: 'Explain Newton third law of motion',
        });

      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty('success', true);
      expect(res.body.data).toHaveProperty('sessionId');
      expect(res.body.data).toHaveProperty('answer');
      expect(res.body.data).toHaveProperty('citations');
      expect(res.body.data).toHaveProperty('tokensUsed');
      expect(res.body.data).toHaveProperty('modelUsed');
    });
  });

  describe('POST /api/v1/ai/chat/:sessionId (Continue Existing Session)', () => {
    it('should return 404 NOT_FOUND when continuing a non-existent session', async () => {
      jest.spyOn(chatSessionRepository, 'findByIdAndUserId').mockResolvedValue(null);

      const res = await request(app)
        .post('/api/v1/ai/chat/507f1f77bcf86cd799439999')
        .set('Authorization', `Bearer ${tokenUser1}`)
        .send({
          message: 'Continue our discussion about thermodynamics',
        });

      expect(res.status).toBe(404);
      expect(res.body.errorCode).toBe('NOT_FOUND');
    });

    it('should return strict 404 NOT_FOUND when attempting to continue another user session', async () => {
      // Session owned by studentUser2, requested by studentUser1 -> findByIdAndUserId returns null
      jest.spyOn(chatSessionRepository, 'findByIdAndUserId').mockResolvedValue(null);

      const res = await request(app)
        .post('/api/v1/ai/chat/507f1f77bcf86cd799439002')
        .set('Authorization', `Bearer ${tokenUser1}`)
        .send({
          message: 'Can I access this session?',
        });

      // MUST be 404 (NOT 403) to prevent session enumeration
      expect(res.status).toBe(404);
      expect(res.body.errorCode).toBe('NOT_FOUND');
    });

    it('should successfully continue chat turn when user owns the session', async () => {
      const mockSession = {
        _id: '507f1f77bcf86cd799439001',
        userId: studentUser1.userId,
        title: 'Physics Chat',
        messageCount: 4,
        status: 'Active',
      };

      jest.spyOn(chatSessionRepository, 'findByIdAndUserId').mockResolvedValue(mockSession as any);
      jest.spyOn(chatSessionRepository, 'findById').mockResolvedValue(mockSession as any);
      jest.spyOn(chatMessageRepository, 'create').mockResolvedValue({} as any);
      jest.spyOn(chatMessageRepository, 'findWindowMessages').mockResolvedValue([
        { sender: 'User', content: 'What is acceleration?', createdAt: new Date(1000) } as any,
        { sender: 'Assistant', content: 'Acceleration is rate of velocity change.', createdAt: new Date(2000) } as any,
      ]);
      jest.spyOn(chatMessageRepository, 'countOutsideWindowUnsummarized').mockResolvedValue(0);
      jest.spyOn(chatSessionRepository, 'update').mockResolvedValue(mockSession as any);

      const res = await request(app)
        .post('/api/v1/ai/chat/507f1f77bcf86cd799439001')
        .set('Authorization', `Bearer ${tokenUser1}`)
        .send({
          message: 'Give me a numerical example for acceleration',
        });

      expect(res.status).toBe(200);
      expect(res.body.data.sessionId).toBe('507f1f77bcf86cd799439001');
      expect(res.body.data).toHaveProperty('answer');
    });
  });

  describe('GET /api/v1/ai/chat/sessions (List User Sessions)', () => {
    it('should return paginated user chat sessions', async () => {
      const mockSessions = [
        { _id: '507f1f77bcf86cd799439001', title: 'Session A', status: 'Active' },
      ];

      jest.spyOn(chatSessionRepository, 'getPaginatedByUserId').mockResolvedValue({
        sessions: mockSessions as any,
        total: 1,
      });

      const res = await request(app)
        .get('/api/v1/ai/chat/sessions?page=1&limit=10')
        .set('Authorization', `Bearer ${tokenUser1}`);

      expect(res.status).toBe(200);
      expect(res.body.data).toHaveProperty('sessions');
      expect(res.body.data.total).toBe(1);
    });
  });

  describe('GET /api/v1/ai/chat/:sessionId/messages (Get Session Messages)', () => {
    it('should return 404 NOT_FOUND when accessing messages of session owned by another user', async () => {
      jest.spyOn(chatSessionRepository, 'findByIdAndUserId').mockResolvedValue(null);

      const res = await request(app)
        .get('/api/v1/ai/chat/507f1f77bcf86cd799439002/messages')
        .set('Authorization', `Bearer ${tokenUser1}`);

      expect(res.status).toBe(404);
      expect(res.body.errorCode).toBe('NOT_FOUND');
    });

    it('should return paginated session messages when authorized', async () => {
      const mockSession = { _id: '507f1f77bcf86cd799439001', userId: studentUser1.userId };
      const mockMessages = [
        { _id: 'm1', sender: 'User', content: 'Hello' },
        { _id: 'm2', sender: 'Assistant', content: 'Hi there!' },
      ];

      jest.spyOn(chatSessionRepository, 'findByIdAndUserId').mockResolvedValue(mockSession as any);
      jest.spyOn(chatMessageRepository, 'findBySessionId').mockResolvedValue(mockMessages as any);

      const res = await request(app)
        .get('/api/v1/ai/chat/507f1f77bcf86cd799439001/messages')
        .set('Authorization', `Bearer ${tokenUser1}`);

      expect(res.status).toBe(200);
      expect(res.body.data.messages.length).toBe(2);
    });
  });

  describe('DELETE /api/v1/ai/chat/:sessionId (Delete Session)', () => {
    it('should return 404 NOT_FOUND when deleting non-existent or unowned session', async () => {
      jest.spyOn(chatSessionRepository, 'findByIdAndUserId').mockResolvedValue(null);

      const res = await request(app)
        .delete('/api/v1/ai/chat/507f1f77bcf86cd799439002')
        .set('Authorization', `Bearer ${tokenUser1}`);

      expect(res.status).toBe(404);
      expect(res.body.errorCode).toBe('NOT_FOUND');
    });

    it('should successfully delete session and associated messages when authorized', async () => {
      const mockSession = { _id: '507f1f77bcf86cd799439001', userId: studentUser1.userId };
      jest.spyOn(chatSessionRepository, 'findByIdAndUserId').mockResolvedValue(mockSession as any);
      jest.spyOn(chatMessageRepository, 'deleteBySessionId').mockResolvedValue(3);
      jest.spyOn(chatSessionRepository, 'deleteSession').mockResolvedValue(true);

      const res = await request(app)
        .delete('/api/v1/ai/chat/507f1f77bcf86cd799439001')
        .set('Authorization', `Bearer ${tokenUser1}`);

      expect(res.status).toBe(200);
      expect(res.body.message).toContain('deleted');
      expect(res.body.data).toEqual({ sessionId: '507f1f77bcf86cd799439001' });
    });
  });

  describe('Phase 6A & 6B Regression Checks', () => {
    it('POST /api/v1/ai/chat/direct (Phase 6A) still works', async () => {
      const res = await request(app)
        .post('/api/v1/ai/chat/direct')
        .set('Authorization', `Bearer ${tokenUser1}`)
        .send({
          prompt: 'What is kinetic energy formula?',
        });

      expect(res.status).toBe(200);
      expect(res.body.data).toHaveProperty('answer');
    });

    it('POST /api/v1/ai/rag/query (Phase 6B) still works', async () => {
      const res = await request(app)
        .post('/api/v1/ai/rag/query')
        .set('Authorization', `Bearer ${tokenUser1}`)
        .send({
          query: 'Explain thermodynamics first law',
        });

      expect(res.status).toBe(200);
      expect(res.body.data).toHaveProperty('answer');
      expect(res.body.data).toHaveProperty('citations');
    });
  });
});
