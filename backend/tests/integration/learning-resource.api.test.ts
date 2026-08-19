import request from 'supertest';
import jwt from 'jsonwebtoken';
import mongoose from 'mongoose';
import app from '../../src/app';
import { envConfig } from '../../src/config/env.config';
import { userProfileRepository } from '../../src/modules/user/repositories/user-profile.repository';
import {
  subjectRepository,
  chapterRepository,
  topicRepository,
  learningResourceRepository,
} from '../../src/modules/academic/repositories/academic.repository';
import { ExamModel } from '../../src/modules/academic/models/exam.model';
import { SubjectModel } from '../../src/modules/academic/models/subject.model';
import { ChapterModel } from '../../src/modules/academic/models/chapter.model';
import { TopicModel } from '../../src/modules/academic/models/topic.model';
import { LearningResourceModel } from '../../src/modules/academic/models/learning-resource.model';

mongoose.set('bufferCommands', false);

describe('Phase 7C.1 — LearningResource API Integration Tests', () => {
  const jeeUserId = '507f1f77bcf86cd799439101';
  const neetUserId = '507f1f77bcf86cd799439102';
  const adminUserId = '507f1f77bcf86cd799439199';

  const jeeToken = jwt.sign(
    { userId: jeeUserId, email: 'jee.res@student.com', role: 'Student' },
    envConfig.jwtSecret
  );

  const adminToken = jwt.sign(
    { userId: adminUserId, email: 'admin.res@examnavigator.com', role: 'Admin' },
    envConfig.jwtSecret
  );

  const jeeExamId = '507f1f77bcf86cd799439201';
  const neetExamId = '507f1f77bcf86cd799439202';

  const jeeSubjectId = '507f1f77bcf86cd799439301';
  const neetSubjectId = '507f1f77bcf86cd799439302';

  const jeeChapterId = '507f1f77bcf86cd799439401';
  const jeeTopicId = '507f1f77bcf86cd799439501';

  const jeeFormulaResourceId = '507f1f77bcf86cd799439601';
  const neetTextResourceId = '507f1f77bcf86cd799439602';

  beforeEach(() => {
    jest.clearAllMocks();

    // User Profile Spies
    jest.spyOn(userProfileRepository, 'findByUserId').mockImplementation(async (userId: string) => {
      if (userId === neetUserId) {
        return { userId, targetExam: 'NEET' } as any;
      }
      return { userId, targetExam: 'JEE' } as any;
    });

    // Exam Model Spies
    jest.spyOn(ExamModel, 'findOne').mockImplementation((filter: any) => {
      const code = filter?.code;
      if (code === 'NEET') {
        return { exec: jest.fn().mockResolvedValue({ _id: neetExamId, code: 'NEET', isActive: true }) } as any;
      }
      return { exec: jest.fn().mockResolvedValue({ _id: jeeExamId, code: 'JEE', isActive: true }) } as any;
    });

    // Subject Spies
    const mockJeeSubject = {
      _id: jeeSubjectId,
      name: 'JEE Physics',
      code: 'JEE_PHY',
      examId: jeeExamId,
      examType: 'JEE',
      isActive: true,
    };

    const mockNeetSubject = {
      _id: neetSubjectId,
      name: 'NEET Biology',
      code: 'NEET_BIO',
      examId: neetExamId,
      examType: 'NEET',
      isActive: true,
    };

    jest.spyOn(subjectRepository, 'findById').mockImplementation(async (id: string) => {
      if (id === jeeSubjectId) return mockJeeSubject as any;
      if (id === neetSubjectId) return mockNeetSubject as any;
      return null;
    });

    jest.spyOn(subjectRepository, 'find').mockImplementation(async () => {
      return [mockJeeSubject] as any;
    });

    jest.spyOn(SubjectModel, 'findById').mockImplementation((id: any) => {
      const idStr = id ? id.toString() : '';
      if (idStr === jeeSubjectId) return Promise.resolve(mockJeeSubject) as any;
      if (idStr === neetSubjectId) return Promise.resolve(mockNeetSubject) as any;
      return Promise.resolve(null) as any;
    });

    // Chapter Spies
    const mockJeeChapter = {
      _id: jeeChapterId,
      subjectId: jeeSubjectId,
      title: 'Electrostatics',
    };

    jest.spyOn(chapterRepository, 'findById').mockImplementation(async (id: string) => {
      if (id === jeeChapterId) return mockJeeChapter as any;
      return null;
    });

    jest.spyOn(ChapterModel, 'findById').mockImplementation((id: any) => {
      if (id?.toString() === jeeChapterId) return Promise.resolve(mockJeeChapter) as any;
      return Promise.resolve(null) as any;
    });

    // Topic Spies
    const mockJeeTopic = {
      _id: jeeTopicId,
      chapterId: jeeChapterId,
      subjectId: jeeSubjectId,
      title: 'Coulomb Law',
    };

    jest.spyOn(topicRepository, 'findById').mockImplementation(async (id: string) => {
      if (id === jeeTopicId) return mockJeeTopic as any;
      return null;
    });

    jest.spyOn(TopicModel, 'findById').mockImplementation((id: any) => {
      if (id?.toString() === jeeTopicId) return Promise.resolve(mockJeeTopic) as any;
      return Promise.resolve(null) as any;
    });

    // Resource Spies
    const mockJeeResource = {
      _id: jeeFormulaResourceId,
      topicId: jeeTopicId,
      chapterId: jeeChapterId,
      subjectId: jeeSubjectId,
      title: 'Coulomb Law Formula Sheet',
      resourceType: 'FormulaSheet',
      textContent: 'F = k * q1 * q2 / r^2',
      order: 1,
      isActive: true,
    };

    const mockNeetResource = {
      _id: neetTextResourceId,
      topicId: '507f1f77bcf86cd799439502',
      chapterId: '507f1f77bcf86cd799439402',
      subjectId: neetSubjectId,
      title: 'NEET Cell Biology Notes',
      resourceType: 'Text',
      order: 1,
      isActive: true,
    };

    jest.spyOn(learningResourceRepository, 'findById').mockImplementation(async (id: string) => {
      if (id === jeeFormulaResourceId) return mockJeeResource as any;
      if (id === neetTextResourceId) return mockNeetResource as any;
      return null;
    });

    jest.spyOn(learningResourceRepository, 'find').mockImplementation(async () => {
      return [mockJeeResource] as any;
    });

    jest.spyOn(learningResourceRepository, 'count').mockImplementation(async () => 1);

    jest.spyOn(learningResourceRepository, 'create').mockImplementation(async (data: any) => ({
      _id: '507f1f77bcf86cd799439699',
      order: 1,
      isActive: true,
      ...data,
    }) as any);

    jest.spyOn(LearningResourceModel, 'findById').mockImplementation((id: any) => {
      const idStr = id ? id.toString() : '';
      if (idStr === jeeFormulaResourceId) return Promise.resolve(mockJeeResource) as any;
      if (idStr === neetTextResourceId) return Promise.resolve(mockNeetResource) as any;
      return Promise.resolve(null) as any;
    });
  });

  describe('GET /api/v1/topics/:topicId/resources', () => {
    it('should return FormulaSheet resources when resourceType=FormulaSheet is passed', async () => {
      const res = await request(app)
        .get(`/api/v1/topics/${jeeTopicId}/resources?resourceType=FormulaSheet`)
        .set('Authorization', `Bearer ${jeeToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.items[0].resourceType).toBe('FormulaSheet');
    });

    it('should reject unauthenticated requests with 401 Unauthorized', async () => {
      const res = await request(app).get(`/api/v1/topics/${jeeTopicId}/resources`);
      expect(res.status).toBe(401);
    });
  });

  describe('GET /api/v1/resources/:resourceId Exam-Scoped Authorization', () => {
    it('JEE student accessing own JEE resource should succeed with 200 OK', async () => {
      const res = await request(app)
        .get(`/api/v1/resources/${jeeFormulaResourceId}`)
        .set('Authorization', `Bearer ${jeeToken}`);

      expect(res.status).toBe(200);
      expect(res.body.data.title).toBe('Coulomb Law Formula Sheet');
    });

    it('DIRECT RESOURCE ACCESS: JEE student accessing NEET resource ID directly MUST receive 403 Forbidden', async () => {
      const res = await request(app)
        .get(`/api/v1/resources/${neetTextResourceId}`)
        .set('Authorization', `Bearer ${jeeToken}`);

      expect(res.status).toBe(403);
      expect(res.body.errorCode).toBe('FORBIDDEN_EXAM_CURRICULUM');
    });
  });

  describe('Admin Resource Management Security', () => {
    it('Student user attempting POST /api/v1/admin/resources must receive 403 Forbidden', async () => {
      const res = await request(app)
        .post('/api/v1/admin/resources')
        .set('Authorization', `Bearer ${jeeToken}`)
        .send({
          topicId: jeeTopicId,
          chapterId: jeeChapterId,
          subjectId: jeeSubjectId,
          title: 'Unauthorized Resource',
          resourceType: 'FormulaSheet',
        });

      expect(res.status).toBe(403);
    });

    it('Admin user POST /api/v1/admin/resources should pass role authorization check', async () => {
      const res = await request(app)
        .post('/api/v1/admin/resources')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          topicId: jeeTopicId,
          chapterId: jeeChapterId,
          subjectId: jeeSubjectId,
          title: 'Admin Created Formula Sheet',
          resourceType: 'FormulaSheet',
        });

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
    });
  });
});
