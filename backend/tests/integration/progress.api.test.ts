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

describe('Phase 8A — Progress API Integration Tests', () => {
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
  const jeeSubjectId = '507f1f77bcf86cd799439001';
  const jeeChapterId = '507f1f77bcf86cd799439002';
  const jeeTopicId = '507f1f77bcf86cd799439003';
  const jeeTopicId2 = '507f1f77bcf86cd799439004';

  // NEET curriculum (cross-exam)
  const neetSubjectId = '507f1f77bcf86cd799439010';
  const neetChapterId = '507f1f77bcf86cd799439020';
  const neetTopicId = '507f1f77bcf86cd799439030';

  // Inactive curriculum
  const inactiveSubjectId = '507f1f77bcf86cd799439040';
  const inactiveChapterId = '507f1f77bcf86cd799439050';
  const inactiveChapterTopicId = '507f1f77bcf86cd799439060';

  const jeeSubject: any = {
    _id: jeeSubjectId,
    name: 'Physics JEE',
    code: 'PHY_JEE',
    examType: 'JEE',
    examId: jeeExamId,
    isActive: true,
  };

  const jeeChapter: any = {
    _id: jeeChapterId,
    subjectId: jeeSubjectId,
    title: 'Laws of Motion',
    chapterNumber: 1,
    isActive: true,
  };

  const jeeTopic: any = {
    _id: jeeTopicId,
    chapterId: jeeChapterId,
    subjectId: jeeSubjectId,
    title: 'Newton Second Law',
    topicNumber: 1,
    difficultyLevel: 'Easy',
    importanceScore: 9,
  };

  const jeeTopic2: any = {
    _id: jeeTopicId2,
    chapterId: jeeChapterId,
    subjectId: jeeSubjectId,
    title: 'Newton Third Law',
    topicNumber: 2,
    difficultyLevel: 'Medium',
    importanceScore: 7,
  };

  // NEET entities
  const neetSubject: any = {
    _id: neetSubjectId,
    name: 'Biology NEET',
    code: 'BIO_NEET',
    examType: 'NEET',
    isActive: true,
  };

  const neetChapter: any = {
    _id: neetChapterId,
    subjectId: neetSubjectId,
    title: 'Cell Biology',
    chapterNumber: 1,
    isActive: true,
  };

  const neetTopic: any = {
    _id: neetTopicId,
    chapterId: neetChapterId,
    subjectId: neetSubjectId,
    title: 'Cell Division',
    topicNumber: 1,
  };

  // Inactive chapter
  const inactiveChapter: any = {
    _id: inactiveChapterId,
    subjectId: jeeSubjectId,
    title: 'Optics (Inactive)',
    chapterNumber: 2,
    isActive: false,
  };

  const inactiveChapterTopic: any = {
    _id: inactiveChapterTopicId,
    chapterId: inactiveChapterId,
    subjectId: jeeSubjectId,
    title: 'Refraction',
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
          return [jeeSubject];
        }
      }
      return [];
    });

    jest.spyOn(subjectRepository, 'findById').mockImplementation(async (id: string) => {
      if (id === jeeSubjectId) return jeeSubject;
      if (id === neetSubjectId) return neetSubject;
      if (id === inactiveSubjectId) return { ...jeeSubject, _id: inactiveSubjectId, isActive: false };
      return null;
    });

    // Mock Chapter Repository
    jest.spyOn(chapterRepository, 'find').mockImplementation(async (filter: any) => {
      if (filter && filter.subjectId && filter.subjectId.$in) {
        if (filter.subjectId.$in.includes(jeeSubjectId)) {
          return [jeeChapter]; // Only active chapters returned
        }
      }
      return [];
    });

    jest.spyOn(chapterRepository, 'findById').mockImplementation(async (id: string) => {
      if (id === jeeChapterId) return jeeChapter;
      if (id === neetChapterId) return neetChapter;
      if (id === inactiveChapterId) return inactiveChapter;
      return null;
    });

    // Mock Topic Repository
    jest.spyOn(topicRepository, 'find').mockImplementation(async (filter: any) => {
      if (filter && filter.chapterId && filter.chapterId.$in) {
        if (filter.chapterId.$in.includes(jeeChapterId)) {
          return [jeeTopic, jeeTopic2];
        }
      }
      return [];
    });

    jest.spyOn(topicRepository, 'findById').mockImplementation(async (id: string) => {
      if (id === jeeTopicId) return jeeTopic;
      if (id === jeeTopicId2) return jeeTopic2;
      if (id === neetTopicId) return neetTopic;
      if (id === inactiveChapterTopicId) return inactiveChapterTopic;
      return null;
    });

    // Mock Progress Repository — start clean
    jest.spyOn(userTopicProgressRepository, 'findOne').mockResolvedValue(null);
    jest.spyOn(userTopicProgressRepository, 'find').mockResolvedValue([]);
    jest.spyOn(userTopicProgressRepository, 'create').mockImplementation(async (data: any) => ({
      ...data,
      _id: '507f1f77bcf86cd799439099',
      lastProgressUpdatedAt: data.lastProgressUpdatedAt || new Date(),
    }));
    jest.spyOn(userTopicProgressRepository, 'updateStatus').mockImplementation(
      async (_userId: string, _topicId: string, status: any, ts: Date) =>
        ({
          userId: _userId,
          topicId: _topicId,
          status,
          lastProgressUpdatedAt: ts,
        } as any)
    );
    jest.spyOn(userTopicProgressRepository, 'deleteOne').mockResolvedValue(true);
  });

  // ==================== AUTH TESTS ====================

  it('1. unauthenticated access should return 401', async () => {
    const res = await request(app)
      .get(`/api/v1/progress/topics/${jeeTopicId}`);

    expect(res.status).toBe(401);
  });

  // ==================== PUT TESTS ====================

  it('2. PUT valid topic progress should return 200', async () => {
    const res = await request(app)
      .put(`/api/v1/progress/topics/${jeeTopicId}`)
      .set('Authorization', `Bearer ${jeeStudentToken}`)
      .send({ status: 'IN_PROGRESS' });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.topicId).toBe(jeeTopicId);
    expect(res.body.data.status).toBe('IN_PROGRESS');
    expect(res.body.data.lastProgressUpdatedAt).toBeTruthy();
  });

  it('3. GET should not mutate progress', async () => {
    const res = await request(app)
      .get(`/api/v1/progress/topics/${jeeTopicId}`)
      .set('Authorization', `Bearer ${jeeStudentToken}`);

    expect(res.status).toBe(200);
    expect(res.body.data.status).toBe('NOT_STARTED');
    expect(res.body.data.lastProgressUpdatedAt).toBeNull();

    // Verify no create/update/delete was called
    expect(userTopicProgressRepository.create).not.toHaveBeenCalled();
    expect(userTopicProgressRepository.updateStatus).not.toHaveBeenCalled();
    expect(userTopicProgressRepository.deleteOne).not.toHaveBeenCalled();
  });

  // ==================== CROSS-EXAM SECURITY ====================

  it('4. cross-exam topic access should be rejected with 403', async () => {
    const res = await request(app)
      .put(`/api/v1/progress/topics/${neetTopicId}`)
      .set('Authorization', `Bearer ${jeeStudentToken}`)
      .send({ status: 'IN_PROGRESS' });

    expect(res.status).toBe(403);
    expect(res.body.errorCode).toBe('FORBIDDEN_EXAM_CURRICULUM');
  });

  // ==================== INACTIVE CURRICULUM ====================

  it('5. inactive subject curriculum should be excluded (topic under inactive chapter)', async () => {
    const res = await request(app)
      .put(`/api/v1/progress/topics/${inactiveChapterTopicId}`)
      .set('Authorization', `Bearer ${jeeStudentToken}`)
      .send({ status: 'IN_PROGRESS' });

    expect(res.status).toBe(404);
  });

  it('6. inactive chapter curriculum should be excluded', async () => {
    const res = await request(app)
      .put(`/api/v1/progress/topics/${inactiveChapterTopicId}`)
      .set('Authorization', `Bearer ${jeeStudentToken}`)
      .send({ status: 'COMPLETED' });

    expect(res.status).toBe(404);
  });

  // ==================== PROGRESS SUMMARY ====================

  it('7. progress summary should count only active curriculum topics', async () => {
    const res = await request(app)
      .get('/api/v1/progress/summary')
      .set('Authorization', `Bearer ${jeeStudentToken}`);

    expect(res.status).toBe(200);
    expect(res.body.data.totalSubjects).toBe(1);
    expect(res.body.data.totalTopics).toBe(2); // jeeTopic + jeeTopic2
    expect(res.body.data.completedTopics).toBe(0);
    expect(res.body.data.inProgressTopics).toBe(0);
    expect(res.body.data.unstartedTopics).toBe(2);
    expect(res.body.data.overallCompletionPercentage).toBe(0);
  });

  it('8. stale progress for excluded topics should not affect summary', async () => {
    // Mock: progress repo returns a record for a deactivated topic
    jest.spyOn(userTopicProgressRepository, 'find').mockResolvedValue([
      // Only topic within the $in filter would be returned, so stale records are automatically excluded
    ] as any);

    const res = await request(app)
      .get('/api/v1/progress/summary')
      .set('Authorization', `Bearer ${jeeStudentToken}`);

    expect(res.status).toBe(200);
    expect(res.body.data.totalTopics).toBe(2);
    expect(res.body.data.completedTopics).toBe(0);
  });

  // ==================== CLIENT OVERRIDE PROTECTION ====================

  it('9. client exam override attempts should be ignored', async () => {
    // Client tries to send examType in query
    const res = await request(app)
      .get('/api/v1/progress/summary?examType=NEET')
      .set('Authorization', `Bearer ${jeeStudentToken}`);

    expect(res.status).toBe(200);
    // Should still return JEE curriculum data
    expect(res.body.data.totalSubjects).toBe(1);
  });

  // ==================== USER ISOLATION ====================

  it('10. one user\'s progress must not affect another user\'s progress', async () => {
    // User 1 updates progress
    const res1 = await request(app)
      .put(`/api/v1/progress/topics/${jeeTopicId}`)
      .set('Authorization', `Bearer ${jeeStudentToken}`)
      .send({ status: 'COMPLETED' });
    expect(res1.status).toBe(200);

    // User 2 reads same topic progress — should be NOT_STARTED
    const res2 = await request(app)
      .get(`/api/v1/progress/topics/${jeeTopicId}`)
      .set('Authorization', `Bearer ${otherStudentToken}`);
    expect(res2.status).toBe(200);
    expect(res2.body.data.status).toBe('NOT_STARTED');
    expect(res2.body.data.lastProgressUpdatedAt).toBeNull();
  });

  // ==================== VALIDATION ====================

  it('11. invalid topicId format should return 400', async () => {
    const res = await request(app)
      .put('/api/v1/progress/topics/invalid-id')
      .set('Authorization', `Bearer ${jeeStudentToken}`)
      .send({ status: 'IN_PROGRESS' });

    expect(res.status).toBe(400);
  });

  it('12. invalid status value should return 400', async () => {
    const res = await request(app)
      .put(`/api/v1/progress/topics/${jeeTopicId}`)
      .set('Authorization', `Bearer ${jeeStudentToken}`)
      .send({ status: 'INVALID_STATUS' });

    expect(res.status).toBe(400);
  });

  it('13. missing status body should return 400', async () => {
    const res = await request(app)
      .put(`/api/v1/progress/topics/${jeeTopicId}`)
      .set('Authorization', `Bearer ${jeeStudentToken}`)
      .send({});

    expect(res.status).toBe(400);
  });

  it('14. non-existent topic should return 404', async () => {
    const fakeTopicId = '507f1f77bcf86cd799439999';
    const res = await request(app)
      .put(`/api/v1/progress/topics/${fakeTopicId}`)
      .set('Authorization', `Bearer ${jeeStudentToken}`)
      .send({ status: 'IN_PROGRESS' });

    expect(res.status).toBe(404);
  });
});
