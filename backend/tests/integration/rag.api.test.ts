import request from 'supertest';
import jwt from 'jsonwebtoken';
import app from '../../src/app';
import { envConfig } from '../../src/config/env.config';
import { aiLogRepository, embeddingRepository } from '../../src/modules/ai/repositories/ai.repository';
import { LearningResourceModel } from '../../src/modules/academic/models/learning-resource.model';

describe('Phase 6B - RAG Module Integration Tests (POST /api/v1/ai/rag/query & /ingest)', () => {
  const studentToken = jwt.sign(
    { userId: '507f1f77bcf86cd799439011', email: 'student@examnavigator.com', role: 'Student' },
    envConfig.jwtSecret
  );

  const adminToken = jwt.sign(
    { userId: '507f1f77bcf86cd799439099', email: 'admin@examnavigator.com', role: 'Admin' },
    envConfig.jwtSecret
  );

  beforeEach(() => {
    jest.spyOn(aiLogRepository, 'getDailyTokenUsage').mockResolvedValue(500);
    jest.spyOn(aiLogRepository, 'getDailyRequestCount').mockResolvedValue(2);
    jest.spyOn(aiLogRepository, 'create').mockResolvedValue({} as any);
    jest.spyOn(embeddingRepository, 'findCandidatesByMetadata').mockResolvedValue([]);
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe('POST /api/v1/ai/rag/query', () => {
    it('should reject unauthenticated requests with 401 Unauthorized', async () => {
      const res = await request(app).post('/api/v1/ai/rag/query').send({
        query: 'Explain quantum mechanics wave-particle duality',
      });

      expect(res.status).toBe(401);
    });

    it('should reject invalid query body with 400 Bad Request', async () => {
      const res = await request(app)
        .post('/api/v1/ai/rag/query')
        .set('Authorization', `Bearer ${studentToken}`)
        .send({
          query: 'hi', // too short (< 3 chars)
        });

      expect(res.status).toBe(400);
    });

    it('should return 429 Too Many Requests when daily AI quota is exceeded', async () => {
      jest.spyOn(aiLogRepository, 'getDailyRequestCount').mockResolvedValue(55); // exceeds limit (50)

      const res = await request(app)
        .post('/api/v1/ai/rag/query')
        .set('Authorization', `Bearer ${studentToken}`)
        .send({
          query: 'Explain organic reaction mechanism in detail',
        });

      expect(res.status).toBe(429);
      expect(res.body).toHaveProperty('success', false);
      expect(res.body.errorCode).toBe('TOO_MANY_REQUESTS');
    });

    it('should successfully execute RAG query and return answer with citations array', async () => {
      jest.spyOn(embeddingRepository, 'findCandidatesByMetadata').mockResolvedValue([
        {
          resourceId: '507f1f77bcf86cd799439001',
          chunkIndex: 0,
          chunkText: 'Newton third law states for every action there is an equal and opposite reaction.',
          vector: new Array(768).fill(0.1),
          metadata: {
            title: 'NCERT Physics Mechanics',
            resourceType: 'PDF',
            subjectId: '507f1f77bcf86cd799439010',
          },
        } as any,
      ]);

      const res = await request(app)
        .post('/api/v1/ai/rag/query')
        .set('Authorization', `Bearer ${studentToken}`)
        .send({
          query: 'Explain Newton third law of motion with citations',
        });

      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty('success', true);
      expect(res.body.data).toHaveProperty('answer');
      expect(res.body.data).toHaveProperty('citations');
      expect(Array.isArray(res.body.data.citations)).toBe(true);
      expect(res.body.data).toHaveProperty('tokensUsed');
      expect(res.body.data).toHaveProperty('modelUsed');
      expect(res.body.data).toHaveProperty('latencyMs');
    });
  });

  describe('POST /api/v1/ai/rag/ingest/:resourceId', () => {
    it('should reject non-admin users with 403 Forbidden', async () => {
      const res = await request(app)
        .post('/api/v1/ai/rag/ingest/507f1f77bcf86cd799439001')
        .set('Authorization', `Bearer ${studentToken}`);

      expect(res.status).toBe(403);
    });

    it('should allow Admin user to ingest learning resource', async () => {
      const mockResource = {
        _id: '507f1f77bcf86cd799439001',
        title: 'JEE Physics Notes',
        resourceType: 'Notes',
        textContent: 'Physics vectors and scalar fields explanation for competitive JEE exam.',
        subjectId: '507f1f77bcf86cd799439010',
        chapterId: '507f1f77bcf86cd799439011',
        topicId: '507f1f77bcf86cd799439012',
      };

      jest.spyOn(LearningResourceModel, 'findById').mockReturnValue({
        exec: jest.fn().mockResolvedValue(mockResource),
      } as any);

      jest.spyOn(LearningResourceModel, 'findByIdAndUpdate').mockReturnValue({
        exec: jest.fn().mockResolvedValue(mockResource),
      } as any);

      jest.spyOn(embeddingRepository, 'deleteByResourceId').mockResolvedValue(0);
      jest.spyOn(embeddingRepository, 'insertMany').mockResolvedValue([] as any);

      const res = await request(app)
        .post('/api/v1/ai/rag/ingest/507f1f77bcf86cd799439001')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty('success', true);
      expect(res.body.data).toHaveProperty('status', 'COMPLETED');
      expect(res.body.data).toHaveProperty('chunkCount');
    });
  });
});
