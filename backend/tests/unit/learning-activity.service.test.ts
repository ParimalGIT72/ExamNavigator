import mongoose from 'mongoose';
import { ProgressService } from '../../src/modules/progress/services/progress.service';
import { IUserContext } from '../../src/modules/academic/services/academic.service';

describe('Phase 8C — Learning Activity & Consistency Unit Tests', () => {
  let progressService: ProgressService;

  let mockProgressRepo: any;
  let mockSubjectRepo: any;
  let mockChapterRepo: any;
  let mockTopicRepo: any;
  let mockEventRepo: any;

  const userId = new mongoose.Types.ObjectId().toString();
  const subjectId = new mongoose.Types.ObjectId().toString();
  const chapterId = new mongoose.Types.ObjectId().toString();
  const topicId = new mongoose.Types.ObjectId().toString();

  const userContext: IUserContext = {
    userId,
    role: 'Student',
    targetExam: {
      examId: new mongoose.Types.ObjectId().toString(),
      examCode: 'JEE',
    },
  };

  beforeEach(() => {
    jest.clearAllMocks();

    mockProgressRepo = {
      findOne: jest.fn(),
      find: jest.fn(),
      create: jest.fn(),
      updateStatus: jest.fn(),
      deleteOne: jest.fn(),
    };

    mockSubjectRepo = {
      findById: jest.fn().mockResolvedValue({
        _id: new mongoose.Types.ObjectId(subjectId),
        name: 'Physics',
        code: 'PHY',
        examType: 'JEE',
        isActive: true,
      }),
      find: jest.fn().mockResolvedValue([
        {
          _id: new mongoose.Types.ObjectId(subjectId),
          name: 'Physics',
          code: 'PHY',
          examType: 'JEE',
          isActive: true,
        },
      ]),
    };

    mockChapterRepo = {
      findById: jest.fn().mockResolvedValue({
        _id: new mongoose.Types.ObjectId(chapterId),
        subjectId: new mongoose.Types.ObjectId(subjectId),
        isActive: true,
      }),
      find: jest.fn().mockResolvedValue([
        {
          _id: new mongoose.Types.ObjectId(chapterId),
          subjectId: new mongoose.Types.ObjectId(subjectId),
          isActive: true,
        },
      ]),
    };

    mockTopicRepo = {
      findById: jest.fn().mockResolvedValue({
        _id: new mongoose.Types.ObjectId(topicId),
        chapterId: new mongoose.Types.ObjectId(chapterId),
        subjectId: new mongoose.Types.ObjectId(subjectId),
        title: 'Kinematics',
        topicNumber: 1,
      }),
      find: jest.fn().mockResolvedValue([
        {
          _id: new mongoose.Types.ObjectId(topicId),
          chapterId: new mongoose.Types.ObjectId(chapterId),
          subjectId: new mongoose.Types.ObjectId(subjectId),
          title: 'Kinematics',
          topicNumber: 1,
        },
      ]),
    };

    mockEventRepo = {
      create: jest.fn().mockResolvedValue({}),
      findRecentByUserId: jest.fn().mockResolvedValue([]),
      findDistinctUtcActivityDatesByUserId: jest.fn().mockResolvedValue([]),
      countByUserId: jest.fn().mockResolvedValue(0),
    };

    progressService = new ProgressService(
      mockProgressRepo,
      mockSubjectRepo,
      mockChapterRepo,
      mockTopicRepo,
      mockEventRepo
    );
  });

  // ==================== STATE TRANSITION TO EVENT MAPPING ====================

  it('1. NOT_STARTED → IN_PROGRESS creates TOPIC_STARTED event', async () => {
    mockProgressRepo.findOne.mockResolvedValue(null);
    mockProgressRepo.create.mockResolvedValue({
      status: 'IN_PROGRESS',
      lastProgressUpdatedAt: new Date(),
    });

    await progressService.updateTopicProgress(topicId, 'IN_PROGRESS', userId, userContext);

    expect(mockEventRepo.create).toHaveBeenCalledTimes(1);
    expect(mockEventRepo.create).toHaveBeenCalledWith(
      expect.objectContaining({
        userId,
        topicId,
        subjectId,
        eventType: 'TOPIC_STARTED',
      })
    );
  });

  it('2. NOT_STARTED → COMPLETED creates TOPIC_COMPLETED event', async () => {
    mockProgressRepo.findOne.mockResolvedValue(null);
    mockProgressRepo.create.mockResolvedValue({
      status: 'COMPLETED',
      lastProgressUpdatedAt: new Date(),
    });

    await progressService.updateTopicProgress(topicId, 'COMPLETED', userId, userContext);

    expect(mockEventRepo.create).toHaveBeenCalledTimes(1);
    expect(mockEventRepo.create).toHaveBeenCalledWith(
      expect.objectContaining({
        userId,
        topicId,
        subjectId,
        eventType: 'TOPIC_COMPLETED',
      })
    );
  });

  it('3. IN_PROGRESS → COMPLETED creates TOPIC_COMPLETED event', async () => {
    mockProgressRepo.findOne.mockResolvedValue({ status: 'IN_PROGRESS' });
    mockProgressRepo.updateStatus.mockResolvedValue({
      status: 'COMPLETED',
      lastProgressUpdatedAt: new Date(),
    });

    await progressService.updateTopicProgress(topicId, 'COMPLETED', userId, userContext);

    expect(mockEventRepo.create).toHaveBeenCalledTimes(1);
    expect(mockEventRepo.create).toHaveBeenCalledWith(
      expect.objectContaining({
        userId,
        topicId,
        subjectId,
        eventType: 'TOPIC_COMPLETED',
      })
    );
  });

  it('4. COMPLETED → IN_PROGRESS creates TOPIC_RESUMED event', async () => {
    mockProgressRepo.findOne.mockResolvedValue({ status: 'COMPLETED' });
    mockProgressRepo.updateStatus.mockResolvedValue({
      status: 'IN_PROGRESS',
      lastProgressUpdatedAt: new Date(),
    });

    await progressService.updateTopicProgress(topicId, 'IN_PROGRESS', userId, userContext);

    expect(mockEventRepo.create).toHaveBeenCalledTimes(1);
    expect(mockEventRepo.create).toHaveBeenCalledWith(
      expect.objectContaining({
        userId,
        topicId,
        subjectId,
        eventType: 'TOPIC_RESUMED',
      })
    );
  });

  it('5. Same-state transition (IN_PROGRESS → IN_PROGRESS) emits 0 events', async () => {
    mockProgressRepo.findOne.mockResolvedValue({
      status: 'IN_PROGRESS',
      lastProgressUpdatedAt: new Date(),
    });

    await progressService.updateTopicProgress(topicId, 'IN_PROGRESS', userId, userContext);

    expect(mockEventRepo.create).not.toHaveBeenCalled();
  });

  it('6. Reset to NOT_STARTED (IN_PROGRESS → NOT_STARTED) emits 0 events', async () => {
    mockProgressRepo.findOne.mockResolvedValue({ status: 'IN_PROGRESS' });
    mockProgressRepo.deleteOne.mockResolvedValue(true);

    await progressService.updateTopicProgress(topicId, 'NOT_STARTED', userId, userContext);

    expect(mockEventRepo.create).not.toHaveBeenCalled();
  });

  // ==================== COMPENSATION ROLLBACK TESTS ====================

  it('6a. Creation compensation: NOT_STARTED → IN_PROGRESS event failure deletes newly created progress', async () => {
    mockProgressRepo.findOne.mockResolvedValue(null);
    mockProgressRepo.create.mockResolvedValue({
      status: 'IN_PROGRESS',
      lastProgressUpdatedAt: new Date(),
    });
    mockEventRepo.create.mockRejectedValue(new Error('Event write failed'));

    await expect(
      progressService.updateTopicProgress(topicId, 'IN_PROGRESS', userId, userContext)
    ).rejects.toThrow('Failed to record activity event');

    // Must trigger compensation: delete the newly created progress record
    expect(mockProgressRepo.deleteOne).toHaveBeenCalledTimes(1);
    expect(mockProgressRepo.deleteOne).toHaveBeenCalledWith(userId, topicId);
  });

  it('6b. Update compensation: IN_PROGRESS → COMPLETED event failure restores original status and timestamp', async () => {
    const originalTimestamp = new Date('2026-08-20T10:00:00.000Z');
    mockProgressRepo.findOne.mockResolvedValue({
      status: 'IN_PROGRESS',
      lastProgressUpdatedAt: originalTimestamp,
    });
    mockProgressRepo.updateStatus.mockResolvedValue({
      status: 'COMPLETED',
      lastProgressUpdatedAt: new Date(),
    });
    mockEventRepo.create.mockRejectedValue(new Error('Event write failed'));

    await expect(
      progressService.updateTopicProgress(topicId, 'COMPLETED', userId, userContext)
    ).rejects.toThrow('Failed to record activity event');

    // Must trigger compensation: updateStatus with originalStatus and originalTimestamp
    expect(mockProgressRepo.updateStatus).toHaveBeenCalledTimes(2);
    expect(mockProgressRepo.updateStatus).toHaveBeenLastCalledWith(
      userId,
      topicId,
      'IN_PROGRESS',
      originalTimestamp
    );
  });

  it('6c. TEST A — Unsupported transaction error triggers fallback to sequential compensation', async () => {
    Object.defineProperty(mongoose.connection, 'readyState', { value: 1, configurable: true, writable: true });

    const dbUtils = require('../../src/utils/db-utils');
    const transactionSpy = jest.spyOn(dbUtils, 'withTransaction').mockRejectedValue(
      new Error('Transaction numbers are only allowed on a replica set member or mongos')
    );

    mockProgressRepo.findOne.mockResolvedValue(null);
    mockProgressRepo.create.mockResolvedValue({
      status: 'IN_PROGRESS',
      lastProgressUpdatedAt: new Date(),
    });

    const res = await progressService.updateTopicProgress(topicId, 'IN_PROGRESS', userId, userContext);

    expect(res.status).toBe('IN_PROGRESS');
    expect(mockProgressRepo.create).toHaveBeenCalledTimes(1);
    expect(mockEventRepo.create).toHaveBeenCalledTimes(1);

    Object.defineProperty(mongoose.connection, 'readyState', { value: 0, configurable: true, writable: true });
    transactionSpy.mockRestore();
  });

  it('6d. TEST B — Genuine MongoServerError in transaction is immediately rethrown and NEVER triggers sequential fallback', async () => {
    Object.defineProperty(mongoose.connection, 'readyState', { value: 1, configurable: true, writable: true });

    const dbUtils = require('../../src/utils/db-utils');
    const mongoServerError = new Error('WriteConflict during transaction commit');
    mongoServerError.name = 'MongoServerError';

    const transactionSpy = jest.spyOn(dbUtils, 'withTransaction').mockRejectedValue(mongoServerError);

    mockProgressRepo.findOne.mockResolvedValue(null);

    await expect(
      progressService.updateTopicProgress(topicId, 'IN_PROGRESS', userId, userContext)
    ).rejects.toThrow('WriteConflict during transaction commit');

    // MUST NOT execute sequential fallback!
    expect(mockProgressRepo.create).not.toHaveBeenCalled();
    expect(mockEventRepo.create).not.toHaveBeenCalled();

    Object.defineProperty(mongoose.connection, 'readyState', { value: 0, configurable: true, writable: true });
    transactionSpy.mockRestore();
  });

  // ==================== STREAK & CONSISTENCY COMPUTATION ====================

  it('7. Multiple events on 1 UTC date count as 1 active day', async () => {
    const todayStr = new Date().toISOString().split('T')[0];

    mockEventRepo.findRecentByUserId.mockResolvedValue([]);
    mockEventRepo.findDistinctUtcActivityDatesByUserId.mockResolvedValue([todayStr]);
    mockEventRepo.countByUserId.mockResolvedValue(4); // 4 events on same day

    const activity = await progressService.getLearningActivity(userId, userContext);

    expect(activity.metrics.totalActiveDays).toBe(1);
    expect(activity.metrics.currentStreak).toBe(1);
    expect(activity.metrics.totalActivityEvents).toBe(4);
  });

  it('8. Consecutive UTC dates calculate correct streak', async () => {
    const now = new Date();
    const todayStr = now.toISOString().split('T')[0];

    const d1 = new Date(now.getTime() - 24 * 60 * 60 * 1000).toISOString().split('T')[0];
    const d2 = new Date(now.getTime() - 2 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];

    mockEventRepo.findDistinctUtcActivityDatesByUserId.mockResolvedValue([todayStr, d1, d2]);
    mockEventRepo.countByUserId.mockResolvedValue(3);

    const activity = await progressService.getLearningActivity(userId, userContext);

    expect(activity.metrics.totalActiveDays).toBe(3);
    expect(activity.metrics.currentStreak).toBe(3);
  });

  it('9. Missing a calendar day breaks the current streak', async () => {
    const now = new Date();
    const todayStr = now.toISOString().split('T')[0];

    // Day before yesterday (yesterday is missing!)
    const d2 = new Date(now.getTime() - 2 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];

    mockEventRepo.findDistinctUtcActivityDatesByUserId.mockResolvedValue([todayStr, d2]);

    const activity = await progressService.getLearningActivity(userId, userContext);

    expect(activity.metrics.totalActiveDays).toBe(2);
    expect(activity.metrics.currentStreak).toBe(1); // Only today's streak
  });

  it('10. Yesterday-based streak continuation works when active yesterday but not yet today', async () => {
    const now = new Date();
    const d1 = new Date(now.getTime() - 24 * 60 * 60 * 1000).toISOString().split('T')[0]; // Yesterday
    const d2 = new Date(now.getTime() - 2 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]; // Day before

    mockEventRepo.findDistinctUtcActivityDatesByUserId.mockResolvedValue([d1, d2]);

    const activity = await progressService.getLearningActivity(userId, userContext);

    expect(activity.metrics.totalActiveDays).toBe(2);
    expect(activity.metrics.currentStreak).toBe(2);
  });

  it('11. No activity returns zero streak and zero active days', async () => {
    mockEventRepo.findDistinctUtcActivityDatesByUserId.mockResolvedValue([]);
    mockEventRepo.countByUserId.mockResolvedValue(0);

    const activity = await progressService.getLearningActivity(userId, userContext);

    expect(activity.metrics.totalActiveDays).toBe(0);
    expect(activity.metrics.currentStreak).toBe(0);
    expect(activity.metrics.totalActivityEvents).toBe(0);
    expect(activity.recentActivity).toEqual([]);
  });
});
