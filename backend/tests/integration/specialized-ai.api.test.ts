import request from 'supertest';
import jwt from 'jsonwebtoken';
import app from '../../src/app';
import { envConfig } from '../../src/config/env.config';
import { TopicModel } from '../../src/modules/academic/models/topic.model';
import { aiLogRepository, aiNoteRepository, flashcardRepository, embeddingRepository, chatSessionRepository, chatMessageRepository } from '../../src/modules/ai/repositories/ai.repository';

describe('Phase 6D - Specialized AI Services API Integration Tests', () => {
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

  describe('POST /api/v1/ai/notes (Generate AI Notes)', () => {
    it('should reject unauthenticated requests with 401 Unauthorized', async () => {
      const res = await request(app).post('/api/v1/ai/notes').send({
        topicId: '507f1f77bcf86cd799439011',
      });

      expect(res.status).toBe(401);
    });

    it('should reject invalid topicId with 404 NOT_FOUND', async () => {
      jest.spyOn(TopicModel, 'findById').mockReturnValue({ exec: jest.fn().mockResolvedValue(null) } as any);

      const res = await request(app)
        .post('/api/v1/ai/notes')
        .set('Authorization', `Bearer ${tokenUser1}`)
        .send({
          topicId: '507f1f77bcf86cd799439999',
        });

      expect(res.status).toBe(404);
      expect(res.body.errorCode).toBe('NOT_FOUND');
    });

    it('should successfully generate and return AI study note', async () => {
      const mockTopic = { _id: '507f1f77bcf86cd799439011', title: 'Electromagnetism' };
      const mockNote = {
        _id: '507f1f77bcf86cd799439099',
        topicId: '507f1f77bcf86cd799439011',
        title: 'Electromagnetism - Study Notes',
        content: '# Electromagnetism Notes',
        summary: 'Summary of electromagnetism',
        keyTakeaways: ['Faraday Law'],
        tags: ['Electromagnetism'],
        createdAt: new Date(),
      };

      jest.spyOn(TopicModel, 'findById').mockReturnValue({ exec: jest.fn().mockResolvedValue(mockTopic) } as any);
      jest.spyOn(aiNoteRepository, 'create').mockResolvedValue(mockNote as any);

      const res = await request(app)
        .post('/api/v1/ai/notes')
        .set('Authorization', `Bearer ${tokenUser1}`)
        .send({
          topicId: '507f1f77bcf86cd799439011',
          customPrompt: 'Include diagrams',
        });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data).toHaveProperty('noteId');
      expect(res.body.data).toHaveProperty('title');
      expect(res.body.data).toHaveProperty('tokensUsed');
    });
  });

  describe('GET /api/v1/ai/notes & CRUD Endpoints', () => {
    it('GET /api/v1/ai/notes should return user notes list', async () => {
      const mockNotes = [{ _id: 'n1', title: 'Note 1' }];
      jest.spyOn(aiNoteRepository, 'getPaginatedByUserId').mockResolvedValue({
        notes: mockNotes as any,
        total: 1,
      });

      const res = await request(app)
        .get('/api/v1/ai/notes')
        .set('Authorization', `Bearer ${tokenUser1}`);

      expect(res.status).toBe(200);
      expect(res.body.data.notes.length).toBe(1);
    });

    it('GET /api/v1/ai/notes/:noteId should return 404 for unowned note', async () => {
      jest.spyOn(aiNoteRepository, 'findByIdAndUserId').mockResolvedValue(null);

      const res = await request(app)
        .get('/api/v1/ai/notes/507f1f77bcf86cd799439099')
        .set('Authorization', `Bearer ${tokenUser1}`);

      expect(res.status).toBe(404);
      expect(res.body.errorCode).toBe('NOT_FOUND');
    });

    it('DELETE /api/v1/ai/notes/:noteId should soft delete note', async () => {
      jest.spyOn(aiNoteRepository, 'softDelete').mockResolvedValue({ _id: 'n1' } as any);

      const res = await request(app)
        .delete('/api/v1/ai/notes/507f1f77bcf86cd799439099')
        .set('Authorization', `Bearer ${tokenUser1}`);

      expect(res.status).toBe(200);
      expect(res.body.message).toContain('deleted');
    });
  });

  describe('POST /api/v1/ai/flashcards (Generate Flashcards)', () => {
    it('should generate and return flashcards array', async () => {
      const mockTopic = { _id: '507f1f77bcf86cd799439011', title: 'Organic Chemistry' };
      const mockSavedCards = [
        {
          _id: 'c1',
          front: 'What is a nucleophile?',
          back: 'An electron pair donor.',
          masteryState: 'New',
          nextReviewDate: new Date(),
        },
      ];

      jest.spyOn(TopicModel, 'findById').mockReturnValue({ exec: jest.fn().mockResolvedValue(mockTopic) } as any);
      jest.spyOn(flashcardRepository, 'insertMany').mockResolvedValue(mockSavedCards as any);

      const res = await request(app)
        .post('/api/v1/ai/flashcards')
        .set('Authorization', `Bearer ${tokenUser1}`)
        .send({
          topicId: '507f1f77bcf86cd799439011',
          count: 1,
        });

      expect(res.status).toBe(200);
      expect(res.body.data.count).toBe(1);
      expect(res.body.data.flashcards[0].front).toBe('What is a nucleophile?');
    });
  });

  describe('POST /api/v1/ai/topic-detect (Topic Detection)', () => {
    it('should detect topic from input text', async () => {
      const mockTopic = {
        _id: '507f1f77bcf86cd799439011',
        title: 'Photosynthesis',
        subjectId: '507f1f77bcf86cd799439001',
      };
      jest.spyOn(TopicModel, 'find').mockReturnValue({
        limit: () => ({ exec: jest.fn().mockResolvedValue([mockTopic]) }),
      } as any);

      const res = await request(app)
        .post('/api/v1/ai/topic-detect')
        .set('Authorization', `Bearer ${tokenUser1}`)
        .send({
          text: 'Explain light-dependent reactions in Photosynthesis',
        });

      expect(res.status).toBe(200);
      expect(res.body.data.topicName).toBe('Photosynthesis');
      expect(res.body.data.confidenceScore).toBe(0.95);
    });
  });

  describe('Phases 6A, 6B, 6C Regression Checks', () => {
    it('Phase 6A: POST /api/v1/ai/chat/direct works', async () => {
      const res = await request(app)
        .post('/api/v1/ai/chat/direct')
        .set('Authorization', `Bearer ${tokenUser1}`)
        .send({
          prompt: 'What is acceleration due to gravity?',
        });

      expect(res.status).toBe(200);
      expect(res.body.data).toHaveProperty('answer');
    });

    it('Phase 6B: POST /api/v1/ai/rag/query works', async () => {
      const res = await request(app)
        .post('/api/v1/ai/rag/query')
        .set('Authorization', `Bearer ${tokenUser1}`)
        .send({
          query: 'Explain Ohm Law',
        });

      expect(res.status).toBe(200);
      expect(res.body.data).toHaveProperty('citations');
    });

    it('Phase 6C: POST /api/v1/ai/chat works', async () => {
      const mockSession = { _id: '507f1f77bcf86cd799439001', userId: studentUser1.userId };
      const mockMsg = { _id: '507f1f77bcf86cd799439002', sessionId: mockSession._id, sender: 'User', content: 'Can you summarize Newton laws?' };
      jest.spyOn(chatSessionRepository, 'create').mockResolvedValue(mockSession as any);
      jest.spyOn(chatSessionRepository, 'findById').mockResolvedValue(mockSession as any);
      jest.spyOn(chatSessionRepository, 'update').mockResolvedValue(mockSession as any);
      jest.spyOn(chatMessageRepository, 'create').mockResolvedValue(mockMsg as any);
      jest.spyOn(chatMessageRepository, 'findWindowMessages').mockResolvedValue([]);
      jest.spyOn(chatMessageRepository, 'countOutsideWindowUnsummarized').mockResolvedValue(0);

      const res = await request(app)
        .post('/api/v1/ai/chat')
        .set('Authorization', `Bearer ${tokenUser1}`)
        .send({
          message: 'Can you summarize Newton laws?',
        });

      expect(res.status).toBe(200);
      expect(res.body.data).toHaveProperty('answer');
    });
  });
});
