import request from 'supertest';
import jwt from 'jsonwebtoken';
import mongoose from 'mongoose';
import app from '../../src/app';
import { envConfig } from '../../src/config/env.config';
import {
  questionBankRepository,
  mockTestRepository,
  testAttemptRepository,
} from '../../src/modules/assessment/repositories/assessment.repository';
import {
  subjectRepository,
  chapterRepository,
  topicRepository,
} from '../../src/modules/academic/repositories/academic.repository';

mongoose.set('bufferCommands', false);

describe('Assessment Module Integration Tests', () => {
  const studentToken = jwt.sign(
    { userId: '507f1f77bcf86cd799439011', email: 'student@examnavigator.com', role: 'Student' },
    envConfig.jwtSecret
  );

  const adminToken = jwt.sign(
    { userId: '507f1f77bcf86cd799439012', email: 'admin@examnavigator.com', role: 'Admin' },
    envConfig.jwtSecret
  );

  const sampleSubjectId = '507f1f77bcf86cd799439001';
  const sampleChapterId = '507f1f77bcf86cd799439002';
  const sampleTopicId = '507f1f77bcf86cd799439003';
  const sampleQuestionId = '507f1f77bcf86cd799439005';
  const sampleMockTestId = '507f1f77bcf86cd799439006';
  const sampleAttemptId = '507f1f77bcf86cd799439007';

  const mockQuestion: any = {
    _id: sampleQuestionId,
    subjectId: sampleSubjectId,
    chapterId: sampleChapterId,
    topicId: sampleTopicId,
    questionText: 'What is work done?',
    options: [
      { optionId: 'A', optionText: 'Force x Displacement', isCorrect: true },
      { optionId: 'B', optionText: 'Mass x Acceleration', isCorrect: false },
    ],
    correctOptionId: 'A',
    difficultyLevel: 'Medium',
    questionType: 'SingleChoice',
    examType: 'JEE',
    marks: 4,
    negativeMarks: 1,
    isDeleted: false,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const mockMockTest: any = {
    _id: sampleMockTestId,
    title: 'Full JEE Physics Mock 1',
    description: 'Practice test for JEE',
    examType: 'JEE',
    totalDurationMinutes: 180,
    totalMarks: 300,
    passingMarks: 120,
    questions: [
      {
        questionId: mockQuestion,
        section: 'Physics',
        marks: 4,
        negativeMarks: 1,
        order: 1,
      },
    ],
    isPublished: true,
    createdBy: '507f1f77bcf86cd799439012',
    isDeleted: false,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const mockAttempt: any = {
    _id: sampleAttemptId,
    userId: '507f1f77bcf86cd799439011',
    mockTestId: sampleMockTestId,
    status: 'In_Progress',
    startTime: new Date(Date.now() - 60000),
    responses: [],
    score: 0,
    totalCorrect: 0,
    totalIncorrect: 0,
    totalUnanswered: 1,
    accuracyPercentage: 0,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  beforeEach(() => {
    jest.clearAllMocks();

    // Academic Repositories
    jest.spyOn(subjectRepository, 'findById').mockResolvedValue({ _id: sampleSubjectId } as any);
    jest.spyOn(chapterRepository, 'findById').mockResolvedValue({ _id: sampleChapterId } as any);
    jest.spyOn(topicRepository, 'findById').mockResolvedValue({ _id: sampleTopicId } as any);

    // Question Bank Spies
    jest.spyOn(questionBankRepository, 'findById').mockImplementation(async (id: string) => {
      if (id === sampleQuestionId) return mockQuestion;
      return null;
    });
    jest.spyOn(questionBankRepository, 'find').mockResolvedValue([mockQuestion]);
    jest.spyOn(questionBankRepository, 'count').mockResolvedValue(1);
    jest.spyOn(questionBankRepository, 'create').mockImplementation(async (data: any) => ({ ...mockQuestion, ...data }));
    jest.spyOn(questionBankRepository, 'updateById').mockImplementation(async (_id: string, update: any) => ({ ...mockQuestion, ...update }));
    jest.spyOn(questionBankRepository, 'softDelete').mockResolvedValue({ ...mockQuestion, isDeleted: true });

    // Mock Test Spies
    jest.spyOn(mockTestRepository, 'findById').mockImplementation(async (id: string) => {
      if (id === sampleMockTestId) return mockMockTest;
      return null;
    });
    jest.spyOn(mockTestRepository, 'find').mockResolvedValue([mockMockTest]);
    jest.spyOn(mockTestRepository, 'count').mockResolvedValue(1);
    jest.spyOn(mockTestRepository, 'create').mockImplementation(async (data: any) => ({ ...mockMockTest, ...data }));
    jest.spyOn(mockTestRepository, 'updateById').mockImplementation(async (_id: string, update: any) => ({ ...mockMockTest, ...update }));
    jest.spyOn(mockTestRepository, 'softDelete').mockResolvedValue({ ...mockMockTest, isDeleted: true });

    // Test Attempt Spies
    jest.spyOn(testAttemptRepository, 'findById').mockImplementation(async (id: string) => {
      if (id === sampleAttemptId) return mockAttempt;
      return null;
    });
    jest.spyOn(testAttemptRepository, 'findOne').mockImplementation(async (filter: any) => {
      if (filter.userId === '507f1f77bcf86cd799439011' && filter.mockTestId === sampleMockTestId) {
        return mockAttempt;
      }
      return null;
    });
    jest.spyOn(testAttemptRepository, 'find').mockResolvedValue([mockAttempt]);
    jest.spyOn(testAttemptRepository, 'count').mockResolvedValue(1);
    jest.spyOn(testAttemptRepository, 'create').mockImplementation(async (data: any) => ({ ...mockAttempt, ...data }));
    jest.spyOn(testAttemptRepository, 'updateById').mockImplementation(async (_id: string, update: any) => ({ ...mockAttempt, ...update }));
  });

  afterAll(() => {
    jest.restoreAllMocks();
  });

  describe('Authorization & Security Checks', () => {
    it('GET /api/v1/mock-tests should return 401 when token is missing', async () => {
      const res = await request(app).get('/api/v1/mock-tests');
      expect(res.status).toBe(401);
      expect(res.body.success).toBe(false);
    });

    it('POST /api/v1/admin/questions should return 403 when requested by Student role', async () => {
      const res = await request(app)
        .post('/api/v1/admin/questions')
        .set('Authorization', `Bearer ${studentToken}`)
        .send({ questionText: 'Sample' });

      expect(res.status).toBe(403);
      expect(res.body.success).toBe(false);
    });

    it('GET /api/v1/mock-tests/invalid-id should return 400 for invalid ObjectId', async () => {
      const res = await request(app)
        .get('/api/v1/mock-tests/invalid-id')
        .set('Authorization', `Bearer ${studentToken}`);

      expect(res.status).toBe(400);
      expect(res.body.errorCode).toBe('VALIDATION_ERROR');
    });
  });

  describe('Mock Test & Question Bank Endpoints', () => {
    it('GET /api/v1/mock-tests should return available mock tests for student', async () => {
      const res = await request(app)
        .get('/api/v1/mock-tests?page=1&limit=10')
        .set('Authorization', `Bearer ${studentToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.items).toHaveLength(1);
    });

    it('GET /api/v1/mock-tests/:mockTestId should return mock test details', async () => {
      const res = await request(app)
        .get(`/api/v1/mock-tests/${sampleMockTestId}`)
        .set('Authorization', `Bearer ${studentToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.title).toBe('Full JEE Physics Mock 1');
    });

    it('POST /api/v1/admin/questions should create a question for admin', async () => {
      const res = await request(app)
        .post('/api/v1/admin/questions')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          subjectId: sampleSubjectId,
          chapterId: sampleChapterId,
          topicId: sampleTopicId,
          questionText: 'What is energy?',
          options: [
            { optionId: 'A', optionText: 'Capacity to do work', isCorrect: true },
            { optionId: 'B', optionText: 'Rate of work', isCorrect: false },
          ],
        });

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
    });

    it('POST /api/v1/admin/mock-tests should create a mock test for admin', async () => {
      const res = await request(app)
        .post('/api/v1/admin/mock-tests')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          title: 'NEET Physics Mock 1',
          examType: 'NEET',
          totalDurationMinutes: 180,
          totalMarks: 720,
          passingMarks: 360,
        });

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
    });
  });

  describe('Mock Test Candidate Workflow', () => {
    it('POST /api/v1/mock-tests/:mockTestId/start should start test attempt', async () => {
      const res = await request(app)
        .post(`/api/v1/mock-tests/${sampleMockTestId}/start`)
        .set('Authorization', `Bearer ${studentToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.attempt.status).toBe('In_Progress');
    });

    it('POST /api/v1/mock-tests/:mockTestId/save should save draft responses', async () => {
      const res = await request(app)
        .post(`/api/v1/mock-tests/${sampleMockTestId}/save`)
        .set('Authorization', `Bearer ${studentToken}`)
        .send({
          durationSpentSeconds: 45,
          responses: [{ questionId: sampleQuestionId, selectedOptionId: 'A' }],
        });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
    });

    it('GET /api/v1/mock-tests/:mockTestId/resume should resume saved draft attempt', async () => {
      const res = await request(app)
        .get(`/api/v1/mock-tests/${sampleMockTestId}/resume`)
        .set('Authorization', `Bearer ${studentToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.attempt._id).toBe(sampleAttemptId);
    });

    it('POST /api/v1/mock-tests/:mockTestId/submit should evaluate answers and return score & accuracy', async () => {
      const res = await request(app)
        .post(`/api/v1/mock-tests/${sampleMockTestId}/submit`)
        .set('Authorization', `Bearer ${studentToken}`)
        .send({
          durationSpentSeconds: 120,
          answers: [{ questionId: sampleQuestionId, selectedOptionId: 'A' }],
        });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.score).toBe(4);
      expect(res.body.data.accuracy).toBe(100);
      expect(res.body.data.status).toBe('Submitted');
    });

    it('GET /api/v1/test-attempts should return student attempt history', async () => {
      const res = await request(app)
        .get('/api/v1/test-attempts')
        .set('Authorization', `Bearer ${studentToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.items).toHaveLength(1);
    });
  });
});
