import request from 'supertest';
import jwt from 'jsonwebtoken';
import app from '../../src/app';
import { envConfig } from '../../src/config/env.config';
import {
  subjectRepository,
  chapterRepository,
  topicRepository,
} from '../../src/modules/academic/repositories/academic.repository';
import { userTopicProgressRepository } from '../../src/modules/progress/repositories/progress.repository';
import { userProfileRepository } from '../../src/modules/user/repositories/user-profile.repository';
import { ExamModel } from '../../src/modules/academic/models/exam.model';

describe('Phase 8B — Progress Analytics API Integration Tests', () => {
  const jeeUserId = '507f1f77bcf86cd799439011';
  const otherUserId = '507f1f77bcf86cd799439022';
  const jeeStudentToken = jwt.sign(
    { userId: jeeUserId, email: 'student@examnavigator.com', role: 'Student' },
    envConfig.jwtSecret
  );
  const otherStudentToken = jwt.sign(
    { userId: otherUserId, email: 'other@examnavigator.com', role: 'Student' },
    envConfig.jwtSecret
  );

  const jeeExamId = '507f1f77bcf86cd799439099';
  const jeeSubject1Id = '507f1f77bcf86cd799439001';
  const jeeSubject2Id = '507f1f77bcf86cd799439002';
  const jeeChapter1Id = '507f1f77bcf86cd799439003';
  const jeeChapter2Id = '507f1f77bcf86cd799439004';
  const jeeTopic1Id = '507f1f77bcf86cd799439005';
  const jeeTopic2Id = '507f1f77bcf86cd799439006';

  const jeeSubject1: any = {
    _id: jeeSubject1Id,
    name: 'Physics JEE',
    code: 'PHY',
    examType: 'JEE',
    examId: jeeExamId,
    isActive: true,
  };

  const jeeSubject2: any = {
    _id: jeeSubject2Id,
    name: 'Chemistry JEE',
    code: 'CHEM',
    examType: 'JEE',
    examId: jeeExamId,
    isActive: true,
  };

  const jeeChapter1: any = {
    _id: jeeChapter1Id,
    subjectId: jeeSubject1Id,
    title: 'Kinematics',
    chapterNumber: 1,
    isActive: true,
  };

  const jeeChapter2: any = {
    _id: jeeChapter2Id,
    subjectId: jeeSubject2Id,
    title: 'Atomic Structure',
    chapterNumber: 1,
    isActive: true,
  };

  const jeeTopic1: any = {
    _id: jeeTopic1Id,
    chapterId: jeeChapter1Id,
    subjectId: jeeSubject1Id,
    title: 'Motion in 1D',
    topicNumber: 1,
  };

  const jeeTopic2: any = {
    _id: jeeTopic2Id,
    chapterId: jeeChapter2Id,
    subjectId: jeeSubject2Id,
    title: 'Bohr Model',
    topicNumber: 1,
  };

  beforeEach(() => {
    jest.clearAllMocks();

    // Mock UserProfile
    jest.spyOn(userProfileRepository, 'findByUserId').mockImplementation(async (uid: string) => {
      if (uid === jeeUserId || uid === otherUserId) {
        return { userId: uid, targetExam: 'JEE' } as any;
      }
      return null;
    });

    // Mock ExamModel
    jest.spyOn(ExamModel, 'findOne').mockReturnValue({
      exec: jest.fn().mockResolvedValue({
        _id: jeeExamId,
        code: 'JEE',
        name: 'Joint Entrance Exam',
        isActive: true,
      }),
    } as any);

    // Mock Subject Repository
    jest.spyOn(subjectRepository, 'find').mockImplementation(async (filter: any) => {
      if (filter && filter.$or) {
        const isJeeMatch = filter.$or.some(
          (branch: any) => branch.examType === 'JEE' || branch.examId === jeeExamId
        );
        if (isJeeMatch) {
          return [jeeSubject1, jeeSubject2];
        }
      }
      return [];
    });

    // Mock Chapter Repository
    jest.spyOn(chapterRepository, 'find').mockImplementation(async (filter: any) => {
      if (filter && filter.subjectId && filter.subjectId.$in) {
        return [jeeChapter1, jeeChapter2];
      }
      return [];
    });

    // Mock Topic Repository
    jest.spyOn(topicRepository, 'find').mockImplementation(async (filter: any) => {
      if (filter && filter.chapterId && filter.chapterId.$in) {
        return [jeeTopic1, jeeTopic2];
      }
      return [];
    });

    // Mock User Progress Repository
    jest.spyOn(userTopicProgressRepository, 'find').mockImplementation(async (filter: any) => {
      if (filter.userId === jeeUserId) {
        return [{ topicId: jeeTopic1Id, status: 'COMPLETED' }] as any;
      }
      return [];
    });
  });

  // ==================== AUTH & SECURITY TESTS ====================

  it('1. GET /api/v1/progress/analytics should return 401 unauthenticated', async () => {
    const res = await request(app).get('/api/v1/progress/analytics');

    expect(res.status).toBe(401);
  });

  it('2. GET /api/v1/progress/analytics should return analytics payload for authenticated student', async () => {
    const res = await request(app)
      .get('/api/v1/progress/analytics')
      .set('Authorization', `Bearer ${jeeStudentToken}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.overall).toBeDefined();
    expect(res.body.data.overall.totalSubjects).toBe(2);
    expect(res.body.data.overall.totalTopics).toBe(2);
    expect(res.body.data.overall.completedTopics).toBe(1);
    expect(res.body.data.overall.overallCompletionPercentage).toBe(50);

    expect(res.body.data.bySubject).toHaveLength(2);
    const phy = res.body.data.bySubject.find((s: any) => s.subjectCode === 'PHY');
    expect(phy.completedTopics).toBe(1);
    expect(phy.completionPercentage).toBe(100);
  });

  it('3. User isolation: student B should not see student A progress analytics', async () => {
    const res = await request(app)
      .get('/api/v1/progress/analytics')
      .set('Authorization', `Bearer ${otherStudentToken}`);

    expect(res.status).toBe(200);
    expect(res.body.data.overall.completedTopics).toBe(0);
    expect(res.body.data.overall.overallCompletionPercentage).toBe(0);
  });

  it('4. Exam isolation: client ?examType=NEET override query parameter must be ignored', async () => {
    const res = await request(app)
      .get('/api/v1/progress/analytics?examType=NEET')
      .set('Authorization', `Bearer ${jeeStudentToken}`);

    expect(res.status).toBe(200);
    // Should still return JEE subjects
    expect(res.body.data.overall.totalSubjects).toBe(2);
  });

  it('5. Phase 8A /progress/summary regression endpoint continues working', async () => {
    const res = await request(app)
      .get('/api/v1/progress/summary')
      .set('Authorization', `Bearer ${jeeStudentToken}`);

    expect(res.status).toBe(200);
    expect(res.body.data.totalSubjects).toBe(2);
    expect(res.body.data.completedTopics).toBe(1);
    expect(res.body.data.overallCompletionPercentage).toBe(50);
  });
});
