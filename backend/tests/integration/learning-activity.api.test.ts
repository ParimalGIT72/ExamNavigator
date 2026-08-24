import request from 'supertest';
import jwt from 'jsonwebtoken';
import mongoose from 'mongoose';
import app from '../../src/app';
import { envConfig } from '../../src/config/env.config';
import { learningActivityEventRepository } from '../../src/modules/progress/repositories/learning-activity-event.repository';
import { userTopicProgressRepository } from '../../src/modules/progress/repositories/progress.repository';
import { subjectRepository, chapterRepository, topicRepository } from '../../src/modules/academic/repositories/academic.repository';
import { userProfileRepository } from '../../src/modules/user/repositories/user-profile.repository';
import { ExamModel } from '../../src/modules/academic/models/exam.model';

describe('Phase 8C — Learning Activity & Consistency API Integration Tests', () => {
  const studentUser = {
    userId: new mongoose.Types.ObjectId().toString(),
    email: 'activitystudent@examnavigator.com',
    role: 'Student',
  };

  const studentBUser = {
    userId: new mongoose.Types.ObjectId().toString(),
    email: 'activitystudentb@examnavigator.com',
    role: 'Student',
  };

  let studentToken: string;
  let studentBToken: string;

  const jeeSubjectId = new mongoose.Types.ObjectId().toString();
  const jeeChapterId = new mongoose.Types.ObjectId().toString();
  const jeeTopicId = new mongoose.Types.ObjectId().toString();

  beforeAll(() => {
    studentToken = jwt.sign(studentUser, envConfig.jwtSecret);
    studentBToken = jwt.sign(studentBUser, envConfig.jwtSecret);
  });

  beforeEach(() => {
    jest.restoreAllMocks();

    // Mock ExamModel
    jest.spyOn(ExamModel, 'findOne').mockReturnValue({
      exec: jest.fn().mockResolvedValue({
        _id: new mongoose.Types.ObjectId(),
        code: 'JEE',
        name: 'Joint Entrance Exam',
        isActive: true,
      }),
    } as any);

    // Default mock: UserProfile for targetExam = JEE
    jest.spyOn(userProfileRepository, 'findByUserId').mockImplementation(async (uid: string) => ({
      _id: new mongoose.Types.ObjectId(),
      userId: new mongoose.Types.ObjectId(uid),
      targetExam: 'JEE',
      targetYear: 2026,
    } as any));

    // Default mock: JEE Subject, Chapter, Topic
    jest.spyOn(subjectRepository, 'findById').mockResolvedValue({
      _id: new mongoose.Types.ObjectId(jeeSubjectId),
      name: 'Physics',
      code: 'PHY',
      examType: 'JEE',
      isActive: true,
    } as any);

    jest.spyOn(subjectRepository, 'find').mockResolvedValue([
      {
        _id: new mongoose.Types.ObjectId(jeeSubjectId),
        name: 'Physics',
        code: 'PHY',
        examType: 'JEE',
        isActive: true,
      },
    ] as any);

    jest.spyOn(chapterRepository, 'findById').mockResolvedValue({
      _id: new mongoose.Types.ObjectId(jeeChapterId),
      subjectId: new mongoose.Types.ObjectId(jeeSubjectId),
      isActive: true,
    } as any);

    jest.spyOn(chapterRepository, 'find').mockResolvedValue([
      {
        _id: new mongoose.Types.ObjectId(jeeChapterId),
        subjectId: new mongoose.Types.ObjectId(jeeSubjectId),
        isActive: true,
      },
    ] as any);

    jest.spyOn(topicRepository, 'findById').mockResolvedValue({
      _id: new mongoose.Types.ObjectId(jeeTopicId),
      chapterId: new mongoose.Types.ObjectId(jeeChapterId),
      subjectId: new mongoose.Types.ObjectId(jeeSubjectId),
      title: 'Kinematics',
      topicNumber: 1,
    } as any);

    jest.spyOn(topicRepository, 'find').mockResolvedValue([
      {
        _id: new mongoose.Types.ObjectId(jeeTopicId),
        chapterId: new mongoose.Types.ObjectId(jeeChapterId),
        subjectId: new mongoose.Types.ObjectId(jeeSubjectId),
        title: 'Kinematics',
        topicNumber: 1,
      },
    ] as any);
  });

  it('1. GET /api/v1/progress/activity should return 401 unauthenticated', async () => {
    const res = await request(app).get('/api/v1/progress/activity');
    expect(res.status).toBe(401);
  });

  it('2. GET /api/v1/progress/activity should return activity payload for authenticated student', async () => {
    const todayStr = new Date().toISOString().split('T')[0];

    jest.spyOn(learningActivityEventRepository, 'findRecentByUserId').mockResolvedValue([
      {
        _id: new mongoose.Types.ObjectId(),
        userId: new mongoose.Types.ObjectId(studentUser.userId),
        topicId: {
          _id: new mongoose.Types.ObjectId(jeeTopicId),
          title: 'Kinematics',
          topicNumber: 1,
        },
        subjectId: {
          _id: new mongoose.Types.ObjectId(jeeSubjectId),
          name: 'Physics',
          code: 'PHY',
        },
        eventType: 'TOPIC_STARTED',
        occurredAt: new Date(),
      } as any,
    ]);

    jest.spyOn(learningActivityEventRepository, 'findDistinctUtcActivityDatesByUserId').mockResolvedValue([todayStr]);
    jest.spyOn(learningActivityEventRepository, 'countByUserId').mockResolvedValue(1);

    const res = await request(app)
      .get('/api/v1/progress/activity')
      .set('Authorization', `Bearer ${studentToken}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.metrics).toBeDefined();
    expect(res.body.data.metrics.currentStreak).toBe(1);
    expect(res.body.data.metrics.totalActiveDays).toBe(1);
    expect(res.body.data.metrics.totalActivityEvents).toBe(1);
    expect(res.body.data.recentActivity).toHaveLength(1);
    expect(res.body.data.recentActivity[0].topicTitle).toBe('Kinematics');
  });

  it('3. User isolation: student B should not see student A progress activity events', async () => {
    const spyRecent = jest.spyOn(learningActivityEventRepository, 'findRecentByUserId').mockResolvedValue([]);
    jest.spyOn(learningActivityEventRepository, 'findDistinctUtcActivityDatesByUserId').mockResolvedValue([]);
    jest.spyOn(learningActivityEventRepository, 'countByUserId').mockResolvedValue(0);

    const res = await request(app)
      .get('/api/v1/progress/activity')
      .set('Authorization', `Bearer ${studentBToken}`);

    expect(res.status).toBe(200);
    expect(spyRecent).toHaveBeenCalledWith(studentBUser.userId, 10);
    expect(res.body.data.metrics.currentStreak).toBe(0);
    expect(res.body.data.recentActivity).toHaveLength(0);
  });

  it('4. Malicious ?userId query override parameter is ignored', async () => {
    const spyRecent = jest.spyOn(learningActivityEventRepository, 'findRecentByUserId').mockResolvedValue([]);
    jest.spyOn(learningActivityEventRepository, 'findDistinctUtcActivityDatesByUserId').mockResolvedValue([]);
    jest.spyOn(learningActivityEventRepository, 'countByUserId').mockResolvedValue(0);

    const res = await request(app)
      .get(`/api/v1/progress/activity?userId=${studentUser.userId}`)
      .set('Authorization', `Bearer ${studentBToken}`);

    expect(res.status).toBe(200);
    // Must be called with studentBUser.userId from JWT, NOT studentUser.userId
    expect(spyRecent).toHaveBeenCalledWith(studentBUser.userId, 10);
  });

  it('5. PUT valid topic progress emits event on genuine state transition', async () => {
    jest.spyOn(userTopicProgressRepository, 'findOne').mockResolvedValue(null);
    jest.spyOn(userTopicProgressRepository, 'create').mockResolvedValue({
      status: 'IN_PROGRESS',
      lastProgressUpdatedAt: new Date(),
    } as any);

    const spyCreateEvent = jest.spyOn(learningActivityEventRepository, 'create').mockResolvedValue({} as any);

    const res = await request(app)
      .put(`/api/v1/progress/topics/${jeeTopicId}`)
      .set('Authorization', `Bearer ${studentToken}`)
      .send({ status: 'IN_PROGRESS' });

    expect(res.status).toBe(200);
    expect(spyCreateEvent).toHaveBeenCalledTimes(1);
    expect(spyCreateEvent).toHaveBeenCalledWith(
      expect.objectContaining({
        userId: studentUser.userId,
        topicId: jeeTopicId,
        subjectId: jeeSubjectId,
        eventType: 'TOPIC_STARTED',
      })
    );
  });

  it('6. GET topic progress emits 0 activity events', async () => {
    jest.spyOn(userTopicProgressRepository, 'findOne').mockResolvedValue(null);
    const spyCreateEvent = jest.spyOn(learningActivityEventRepository, 'create');

    const res = await request(app)
      .get(`/api/v1/progress/topics/${jeeTopicId}`)
      .set('Authorization', `Bearer ${studentToken}`);

    expect(res.status).toBe(200);
    expect(spyCreateEvent).not.toHaveBeenCalled();
  });

  it('7. PUT topic progress returns 500 and compensates when event creation fails', async () => {
    jest.spyOn(userTopicProgressRepository, 'findOne').mockResolvedValue(null);
    jest.spyOn(userTopicProgressRepository, 'create').mockResolvedValue({
      status: 'IN_PROGRESS',
      lastProgressUpdatedAt: new Date(),
    } as any);

    const spyDeleteOne = jest.spyOn(userTopicProgressRepository, 'deleteOne').mockResolvedValue(true);
    jest.spyOn(learningActivityEventRepository, 'create').mockRejectedValue(new Error('DB write error'));

    const res = await request(app)
      .put(`/api/v1/progress/topics/${jeeTopicId}`)
      .set('Authorization', `Bearer ${studentToken}`)
      .send({ status: 'IN_PROGRESS' });

    expect(res.status).toBe(500);
    expect(res.body.success).toBe(false);
    expect(spyDeleteOne).toHaveBeenCalledTimes(1);
  });
});
