import request from 'supertest';
import jwt from 'jsonwebtoken';
import app from '../../src/app';
import { envConfig } from '../../src/config/env.config';
import {
  subjectRepository,
  chapterRepository,
  topicRepository,
} from '../../src/modules/academic/repositories/academic.repository';
import { userProfileRepository } from '../../src/modules/user/repositories/user-profile.repository';
import { ExamModel } from '../../src/modules/academic/models/exam.model';

describe('Phase 7D — Recommendations API & Security Integration Tests', () => {
  const jeeUserId = '507f1f77bcf86cd799439011';
  const jeeStudentToken = jwt.sign(
    { userId: jeeUserId, email: 'student@examnavigator.com', role: 'Student' },
    envConfig.jwtSecret
  );

  const jeeSubjectId = '507f1f77bcf86cd799439001';
  const neetSubjectId = '507f1f77bcf86cd799439009';
  const jeeChapterId = '507f1f77bcf86cd799439002';
  const jeeTopicId = '507f1f77bcf86cd799439003';

  const jeeSubject: any = {
    _id: jeeSubjectId,
    name: 'Physics JEE',
    code: 'PHY_JEE',
    examType: 'JEE',
    isActive: true,
  };

  const jeeChapter: any = {
    _id: jeeChapterId,
    subjectId: jeeSubjectId,
    title: 'Laws of Motion JEE',
    chapterNumber: 1,
    weightage: 10,
    estimatedHours: 8,
    isActive: true,
  };

  const jeeTopic: any = {
    _id: jeeTopicId,
    chapterId: jeeChapterId,
    subjectId: jeeSubjectId,
    title: 'Newton Second Law JEE',
    topicNumber: 1,
    summary: 'F = ma acceleration dynamics',
    difficultyLevel: 'Easy',
    importanceScore: 9,
  };

  beforeEach(() => {
    jest.clearAllMocks();

    // Mock UserProfile lookup
    jest.spyOn(userProfileRepository, 'findByUserId').mockImplementation(async (uid: string) => {
      if (uid === jeeUserId) {
        return {
          userId: jeeUserId,
          targetExam: 'JEE',
        } as any;
      }
      return null;
    });

    // Mock ExamModel.findOne lookup
    jest.spyOn(ExamModel, 'findOne').mockReturnValue({
      exec: jest.fn().mockResolvedValue({
        _id: '507f1f77bcf86cd799439099',
        code: 'JEE',
        name: 'Joint Entrance Exam',
        isActive: true,
      }),
    } as any);

    // Mock Subject Repository
    jest.spyOn(subjectRepository, 'find').mockImplementation(async (filter: any) => {
      if (filter && filter.$or) {
        const isJeeMatch = filter.$or.some((branch: any) => branch.examType === 'JEE');
        if (isJeeMatch) {
          return [jeeSubject];
        }
      }
      return [];
    });

    // Mock Chapter Repository
    jest.spyOn(chapterRepository, 'find').mockImplementation(async (filter: any) => {
      if (filter && filter.subjectId && filter.subjectId.$in) {
        if (filter.subjectId.$in.includes(jeeSubjectId)) {
          return [jeeChapter];
        }
      }
      return [];
    });

    // Mock Topic Repository
    jest.spyOn(topicRepository, 'find').mockImplementation(async (filter: any) => {
      if (filter && filter.chapterId && filter.chapterId.$in) {
        if (filter.chapterId.$in.includes(jeeChapterId)) {
          return [jeeTopic];
        }
      }
      return [];
    });
  });

  it('1. GET /api/v1/recommendations/next-topics should return recommendations for JEE student', async () => {
    const res = await request(app)
      .get('/api/v1/recommendations/next-topics')
      .set('Authorization', `Bearer ${jeeStudentToken}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data).toHaveLength(1);
    expect(res.body.data[0].title).toBe('Newton Second Law JEE');
    expect(res.body.data[0].subjectCode).toBe('PHY_JEE');
    expect(res.body.data[0].priorityLevel).toBe('HIGH');
    expect(res.body.data[0].priorityScore).toBeGreaterThanOrEqual(70);
  });

  it('2. Server must ignore client ?examType=NEET query parameter override', async () => {
    const res = await request(app)
      .get('/api/v1/recommendations/next-topics?examType=NEET')
      .set('Authorization', `Bearer ${jeeStudentToken}`);

    expect(res.status).toBe(200);
    expect(res.body.data).toHaveLength(1);
    expect(res.body.data[0].title).toBe('Newton Second Law JEE');
  });

  it('3. GET /api/v1/recommendations/next-topics?subjectId=jeeSubjectId should filter by valid subject', async () => {
    const res = await request(app)
      .get(`/api/v1/recommendations/next-topics?subjectId=${jeeSubjectId}`)
      .set('Authorization', `Bearer ${jeeStudentToken}`);

    expect(res.status).toBe(200);
    expect(res.body.data).toHaveLength(1);
    expect(res.body.data[0].subjectId).toBe(jeeSubjectId);
  });

  it('4. GET /api/v1/recommendations/next-topics?subjectId=invalid-id should return 400 Bad Request', async () => {
    const res = await request(app)
      .get('/api/v1/recommendations/next-topics?subjectId=invalid-id')
      .set('Authorization', `Bearer ${jeeStudentToken}`);

    expect(res.status).toBe(400);
    expect(res.body.errorCode).toBe('VALIDATION_ERROR');
  });

  it('5. GET /api/v1/recommendations/next-topics?subjectId=neetSubjectId should return 403 FORBIDDEN_EXAM_CURRICULUM', async () => {
    const res = await request(app)
      .get(`/api/v1/recommendations/next-topics?subjectId=${neetSubjectId}`)
      .set('Authorization', `Bearer ${jeeStudentToken}`);

    expect(res.status).toBe(403);
    expect(res.body.errorCode).toBe('FORBIDDEN_EXAM_CURRICULUM');
  });
});
