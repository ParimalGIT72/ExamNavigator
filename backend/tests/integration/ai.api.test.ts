import request from 'supertest';
import jwt from 'jsonwebtoken';
import app from '../../src/app';
import { envConfig } from '../../src/config/env.config';
import { aiLogRepository } from '../../src/modules/ai/repositories/ai.repository';

describe('AI Module Integration Tests (Iteration 6A - AI Gateway & Direct Chat)', () => {
  const studentToken = jwt.sign(
    { userId: '507f1f77bcf86cd799439011', email: 'student@examnavigator.com', role: 'Student' },
    envConfig.jwtSecret
  );

  beforeEach(() => {
    jest.spyOn(aiLogRepository, 'getDailyTokenUsage').mockResolvedValue(500);
    jest.spyOn(aiLogRepository, 'getDailyRequestCount').mockResolvedValue(2);
    jest.spyOn(aiLogRepository, 'create').mockResolvedValue({} as any);
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe('POST /api/v1/ai/chat/direct', () => {
    it('should reject unauthenticated requests with 401 Unauthorized', async () => {
      const res = await request(app).post('/api/v1/ai/chat/direct').send({
        prompt: 'Explain organic chemistry reactions',
      });

      expect(res.status).toBe(401);
    });

    it('should reject prompt validation failure with 400 Bad Request', async () => {
      const res = await request(app)
        .post('/api/v1/ai/chat/direct')
        .set('Authorization', `Bearer ${studentToken}`)
        .send({
          prompt: 'hi', // too short (< 3 chars)
        });

      expect(res.status).toBe(400);
    });

    it('should return 429 Too Many Requests when daily quota is exceeded', async () => {
      jest.spyOn(aiLogRepository, 'getDailyRequestCount').mockResolvedValue(55); // exceeds daily limit (50)

      const res = await request(app)
        .post('/api/v1/ai/chat/direct')
        .set('Authorization', `Bearer ${studentToken}`)
        .send({
          prompt: 'Explain organic chemistry substitution reactions',
        });

      expect(res.status).toBe(429);
      expect(res.body).toHaveProperty('success', false);
      expect(res.body.errorCode).toBe('TOO_MANY_REQUESTS');
      expect(res.body.message).toContain('Daily AI request limit reached');
    });

    it('should successfully process a valid AI query and return answer with token usage metrics', async () => {
      const res = await request(app)
        .post('/api/v1/ai/chat/direct')
        .set('Authorization', `Bearer ${studentToken}`)
        .send({
          prompt: 'Explain Newton third law of motion with real-world examples',
        });

      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty('success', true);
      expect(res.body.data).toHaveProperty('answer');
      expect(res.body.data).toHaveProperty('tokensUsed');
      expect(res.body.data.tokensUsed).toHaveProperty('totalTokens');
      expect(res.body.data).toHaveProperty('modelUsed');
      expect(res.body.data).toHaveProperty('latencyMs');
    });
  });
});
