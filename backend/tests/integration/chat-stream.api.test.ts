import request from 'supertest';
import jwt from 'jsonwebtoken';
import app from '../../src/app';
import { envConfig } from '../../src/config/env.config';
import { tokenManagerService } from '../../src/modules/ai/services/token-manager.service';
import { geminiEmbeddingProviderService } from '../../src/modules/ai/services/gemini-embedding-provider.service';
import { aiLogRepository, chatSessionRepository, chatMessageRepository, embeddingRepository } from '../../src/modules/ai/repositories/ai.repository';

describe('Phase 6E - SSE Streaming API Integration Tests (POST /api/v1/ai/chat/stream)', () => {
  const studentUser = {
    userId: '507f1f77bcf86cd799439011',
    email: 'student@examnavigator.com',
    role: 'Student' as const,
  };

  const validToken = jwt.sign(studentUser, envConfig.jwtSecret);

  beforeEach(() => {
    jest.spyOn(aiLogRepository, 'getDailyTokenUsage').mockResolvedValue(500);
    jest.spyOn(aiLogRepository, 'getDailyRequestCount').mockResolvedValue(2);
    jest.spyOn(aiLogRepository, 'create').mockResolvedValue({} as any);
    jest.spyOn(chatSessionRepository, 'findById').mockResolvedValue({ _id: '507f1f77bcf86cd799439001', userId: studentUser.userId, status: 'Active' } as any);
    jest.spyOn(embeddingRepository, 'findCandidatesByMetadata').mockResolvedValue([]);
    jest.spyOn(geminiEmbeddingProviderService, 'generateEmbedding').mockResolvedValue(new Array(768).fill(0.1));
    jest.spyOn(tokenManagerService, 'checkQuota').mockResolvedValue({
      allowed: true,
      dailyTokensUsed: 500,
      dailyTokensLimit: 100000,
      dailyRequestsUsed: 2,
      dailyRequestsLimit: 50,
    });
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('should reject unauthenticated stream requests with 401 Unauthorized', async () => {
    const res = await request(app).post('/api/v1/ai/chat/stream').send({
      message: 'Hello',
    });

    expect(res.status).toBe(401);
  });

  it('should stream chat response as Server-Sent Events (SSE)', async () => {
    const mockSession = { _id: '507f1f77bcf86cd799439001', userId: studentUser.userId, status: 'Active' };
    const mockMsg = { _id: '507f1f77bcf86cd799439002', sessionId: mockSession._id, sender: 'User', content: 'Explain gravity' };

    jest.spyOn(tokenManagerService, 'checkQuota').mockResolvedValue({
      allowed: true,
      dailyTokensUsed: 500,
      dailyTokensLimit: 100000,
      dailyRequestsUsed: 2,
      dailyRequestsLimit: 50,
    });
    jest.spyOn(chatSessionRepository, 'create').mockResolvedValue(mockSession as any);
    jest.spyOn(chatSessionRepository, 'findByIdAndUserId').mockResolvedValue(mockSession as any);
    jest.spyOn(chatSessionRepository, 'update').mockResolvedValue(mockSession as any);
    jest.spyOn(chatMessageRepository, 'create').mockResolvedValue(mockMsg as any);
    jest.spyOn(chatMessageRepository, 'findWindowMessages').mockResolvedValue([]);
    jest.spyOn(chatMessageRepository, 'countOutsideWindowUnsummarized').mockResolvedValue(0);

    const res = await request(app)
      .post('/api/v1/ai/chat/stream')
      .set('Authorization', `Bearer ${validToken}`)
      .send({
        message: 'Explain gravity',
      });

    expect(res.status).toBe(200);
    expect(res.headers['content-type']).toContain('text/event-stream');
    expect(res.text).toContain('event: token');
    expect(res.text).toContain('event: done');
  });

  it('should return 429 Too Many Requests when daily quota is exceeded', async () => {
    jest.spyOn(tokenManagerService, 'checkQuota').mockImplementation(async () => ({
      allowed: false,
      dailyTokensUsed: 100000,
      dailyTokensLimit: 100000,
      dailyRequestsUsed: 50,
      dailyRequestsLimit: 50,
      reason: 'AI Daily Quota Exceeded',
    }));

    const res = await request(app)
      .post('/api/v1/ai/chat/stream')
      .set('Authorization', `Bearer ${validToken}`)
      .send({
        message: 'Explain gravity',
      });

    expect(res.status).toBe(429);
  });

  it('should not persist assistant message or trigger summarization if generation is cancelled', async () => {
    const mockSession = { _id: '507f1f77bcf86cd799439001', userId: studentUser.userId, status: 'Active' };
    const mockMsg = { _id: '507f1f77bcf86cd799439002', sessionId: mockSession._id, sender: 'User', content: 'Explain gravity' };

    jest.spyOn(chatSessionRepository, 'create').mockResolvedValue(mockSession as any);
    jest.spyOn(chatSessionRepository, 'findByIdAndUserId').mockResolvedValue(mockSession as any);
    jest.spyOn(chatSessionRepository, 'update').mockResolvedValue(mockSession as any);
    const createMsgSpy = jest.spyOn(chatMessageRepository, 'create').mockResolvedValue(mockMsg as any);
    jest.spyOn(chatMessageRepository, 'findWindowMessages').mockResolvedValue([]);
    jest.spyOn(chatMessageRepository, 'countOutsideWindowUnsummarized').mockResolvedValue(0);

    const abortController = new AbortController();
    abortController.abort();

    const { chatSessionService } = require('../../src/modules/ai/services/chat-session.service');

    await expect(
      chatSessionService.processStreamChatTurn(
        { userId: studentUser.userId, message: 'Explain gravity' },
        () => {},
        undefined,
        { signal: abortController.signal }
      )
    ).rejects.toThrow('Generation cancelled by user');

    const assistantMessageCalls = createMsgSpy.mock.calls.filter((call) => call[0].sender === 'Assistant');
    expect(assistantMessageCalls.length).toBe(0);
  });
});
