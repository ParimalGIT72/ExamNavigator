import request from 'supertest';
import jwt from 'jsonwebtoken';
import mongoose from 'mongoose';
import app from '../../src/app';
import { envConfig } from '../../src/config/env.config';
import {
  subjectRepository,
  chapterRepository,
  topicRepository,
  learningResourceRepository,
} from '../../src/modules/academic/repositories/academic.repository';

import { userProfileRepository } from '../../src/modules/user/repositories/user-profile.repository';
import { ExamModel } from '../../src/modules/academic/models/exam.model';

mongoose.set('bufferCommands', false);

describe('Academic Module Integration Tests', () => {
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
  const sampleResourceId = '507f1f77bcf86cd799439004';

  const mockSubject: any = {
    _id: sampleSubjectId,
    name: 'Physics',
    code: 'PHY',
    examType: 'JEE',
    description: 'Physics subject',
    icon: 'icon.png',
    order: 1,
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const mockChapter: any = {
    _id: sampleChapterId,
    subjectId: sampleSubjectId,
    title: 'Kinematics',
    chapterNumber: 1,
    description: 'Kinematics chapter',
    weightage: 5,
    estimatedHours: 4,
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const mockTopic: any = {
    _id: sampleTopicId,
    chapterId: sampleChapterId,
    subjectId: sampleSubjectId,
    title: 'Uniform Motion',
    topicNumber: 1,
    summary: 'Topic summary',
    difficultyLevel: 'Medium',
    importanceScore: 5,
    tags: ['motion'],
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const mockResource: any = {
    _id: sampleResourceId,
    topicId: sampleTopicId,
    chapterId: sampleChapterId,
    subjectId: sampleSubjectId,
    title: 'Motion Notes PDF',
    resourceType: 'PDF',
    contentUrl: 'http://example.com/notes.pdf',
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  beforeEach(() => {
    jest.clearAllMocks();

    jest.spyOn(userProfileRepository, 'findByUserId').mockResolvedValue({
      userId: '507f1f77bcf86cd799439011',
      targetExam: 'JEE',
    } as any);

    jest.spyOn(ExamModel, 'findOne').mockReturnValue({
      exec: jest.fn().mockResolvedValue({
        _id: '507f1f77bcf86cd799439099',
        code: 'JEE',
        name: 'Joint Entrance Exam',
        isActive: true,
      }),
    } as any);

    // Subject Repository Spies
    jest.spyOn(subjectRepository, 'findById').mockImplementation(async (id: string) => {
      if (id === sampleSubjectId) return mockSubject;
      return null;
    });
    jest.spyOn(subjectRepository, 'findByName').mockResolvedValue(null);
    jest.spyOn(subjectRepository, 'findByCode').mockResolvedValue(null);
    jest.spyOn(subjectRepository, 'findByNameAndExam').mockResolvedValue(null);
    jest.spyOn(subjectRepository, 'findByCodeAndExam').mockResolvedValue(null);
    jest.spyOn(subjectRepository, 'find').mockResolvedValue([mockSubject]);
    jest.spyOn(subjectRepository, 'count').mockResolvedValue(1);
    jest.spyOn(subjectRepository, 'create').mockImplementation(async (data: any) => ({ ...mockSubject, ...data }));
    jest.spyOn(subjectRepository, 'updateById').mockImplementation(async (_id: string, update: any) => ({ ...mockSubject, ...update }));
    jest.spyOn(subjectRepository, 'deleteById').mockResolvedValue(true);

    // Chapter Repository Spies
    jest.spyOn(chapterRepository, 'findById').mockImplementation(async (id: string) => {
      if (id === sampleChapterId) return mockChapter;
      return null;
    });
    jest.spyOn(chapterRepository, 'findBySubjectIdAndNumber').mockResolvedValue(null);
    jest.spyOn(chapterRepository, 'find').mockResolvedValue([mockChapter]);
    jest.spyOn(chapterRepository, 'count').mockResolvedValue(1);
    jest.spyOn(chapterRepository, 'create').mockImplementation(async (data: any) => ({ ...mockChapter, ...data }));
    jest.spyOn(chapterRepository, 'updateById').mockImplementation(async (_id: string, update: any) => ({ ...mockChapter, ...update }));
    jest.spyOn(chapterRepository, 'deleteById').mockResolvedValue(true);

    // Topic Repository Spies
    jest.spyOn(topicRepository, 'findById').mockImplementation(async (id: string) => {
      if (id === sampleTopicId) return mockTopic;
      return null;
    });
    jest.spyOn(topicRepository, 'findByChapterIdAndNumber').mockResolvedValue(null);
    jest.spyOn(topicRepository, 'find').mockResolvedValue([mockTopic]);
    jest.spyOn(topicRepository, 'count').mockResolvedValue(1);
    jest.spyOn(topicRepository, 'create').mockImplementation(async (data: any) => ({ ...mockTopic, ...data }));
    jest.spyOn(topicRepository, 'updateById').mockImplementation(async (_id: string, update: any) => ({ ...mockTopic, ...update }));
    jest.spyOn(topicRepository, 'deleteById').mockResolvedValue(true);

    // Resource Repository Spies
    jest.spyOn(learningResourceRepository, 'findById').mockImplementation(async (id: string) => {
      if (id === sampleResourceId) return mockResource;
      return null;
    });
    jest.spyOn(learningResourceRepository, 'find').mockResolvedValue([mockResource]);
    jest.spyOn(learningResourceRepository, 'count').mockResolvedValue(1);
    jest.spyOn(learningResourceRepository, 'create').mockImplementation(async (data: any) => ({ ...mockResource, ...data }));
    jest.spyOn(learningResourceRepository, 'updateById').mockImplementation(async (_id: string, update: any) => ({ ...mockResource, ...update }));
    jest.spyOn(learningResourceRepository, 'deleteById').mockResolvedValue(true);
  });

  afterAll(() => {
    jest.restoreAllMocks();
  });

  describe('Authorization & Security Checks', () => {
    it('GET /api/v1/subjects should return 401 when token is missing', async () => {
      const res = await request(app).get('/api/v1/subjects');
      expect(res.status).toBe(401);
      expect(res.body.success).toBe(false);
    });

    it('POST /api/v1/admin/subjects should return 403 when requested by Student role', async () => {
      const res = await request(app)
        .post('/api/v1/admin/subjects')
        .set('Authorization', `Bearer ${studentToken}`)
        .send({ name: 'Chemistry', code: 'CHEM', examType: 'JEE' });

      expect(res.status).toBe(403);
      expect(res.body.success).toBe(false);
      expect(res.body.errorCode).toBe('AUTH_FORBIDDEN');
    });

    it('GET /api/v1/subjects/invalid-id should return 400 for invalid ObjectId format', async () => {
      const res = await request(app)
        .get('/api/v1/subjects/invalid-id')
        .set('Authorization', `Bearer ${studentToken}`);

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
      expect(res.body.errorCode).toBe('VALIDATION_ERROR');
    });
  });

  describe('Subject Endpoints', () => {
    it('GET /api/v1/subjects should return paginated subjects for student', async () => {
      const res = await request(app)
        .get('/api/v1/subjects?page=1&limit=10')
        .set('Authorization', `Bearer ${studentToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.items).toHaveLength(1);
      expect(res.body.data.pagination.total).toBe(1);
    });

    it('GET /api/v1/subjects/:subjectId should return a single subject', async () => {
      const res = await request(app)
        .get(`/api/v1/subjects/${sampleSubjectId}`)
        .set('Authorization', `Bearer ${studentToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.name).toBe('Physics');
    });

    it('POST /api/v1/admin/subjects should create subject for admin', async () => {
      const res = await request(app)
        .post('/api/v1/admin/subjects')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ name: 'Mathematics', code: 'MATH', examType: 'JEE' });

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data.name).toBe('Mathematics');
    });

    it('PATCH /api/v1/admin/subjects/:subjectId should update subject for admin', async () => {
      const res = await request(app)
        .patch(`/api/v1/admin/subjects/${sampleSubjectId}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ description: 'Updated description' });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
    });

    it('DELETE /api/v1/admin/subjects/:subjectId should delete subject for admin', async () => {
      // Return empty array for chapters to allow deletion
      jest.spyOn(chapterRepository, 'find').mockResolvedValue([]);

      const res = await request(app)
        .delete(`/api/v1/admin/subjects/${sampleSubjectId}`)
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
    });
  });

  describe('Chapter Endpoints', () => {
    it('GET /api/v1/subjects/:subjectId/chapters should return chapters', async () => {
      const res = await request(app)
        .get(`/api/v1/subjects/${sampleSubjectId}/chapters`)
        .set('Authorization', `Bearer ${studentToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.items).toHaveLength(1);
    });

    it('POST /api/v1/admin/chapters should create chapter for admin', async () => {
      const res = await request(app)
        .post('/api/v1/admin/chapters')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          subjectId: sampleSubjectId,
          title: 'Dynamics',
          chapterNumber: 2,
        });

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
    });
  });

  describe('Topic Endpoints', () => {
    it('GET /api/v1/chapters/:chapterId/topics should return topics', async () => {
      const res = await request(app)
        .get(`/api/v1/chapters/${sampleChapterId}/topics`)
        .set('Authorization', `Bearer ${studentToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.items).toHaveLength(1);
    });

    it('POST /api/v1/admin/topics should create topic for admin', async () => {
      const res = await request(app)
        .post('/api/v1/admin/topics')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          chapterId: sampleChapterId,
          subjectId: sampleSubjectId,
          title: 'Acceleration',
          topicNumber: 2,
        });

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
    });
  });

  describe('Learning Resource Endpoints', () => {
    it('GET /api/v1/topics/:topicId/resources should return resources', async () => {
      const res = await request(app)
        .get(`/api/v1/topics/${sampleTopicId}/resources`)
        .set('Authorization', `Bearer ${studentToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.items).toHaveLength(1);
    });

    it('POST /api/v1/admin/resources should create learning resource for admin', async () => {
      const res = await request(app)
        .post('/api/v1/admin/resources')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          topicId: sampleTopicId,
          chapterId: sampleChapterId,
          subjectId: sampleSubjectId,
          title: 'Formula Sheet',
          resourceType: 'FormulaSheet',
        });

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
    });
  });
});
