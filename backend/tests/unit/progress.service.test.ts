import mongoose from 'mongoose';
import { ProgressService } from '../../src/modules/progress/services/progress.service';

describe('Phase 8A — ProgressService Unit Tests', () => {
  let mockProgressRepo: any;
  let mockSubjectRepo: any;
  let mockChapterRepo: any;
  let mockTopicRepo: any;
  let mockEventRepo: any;
  let progressService: ProgressService;

  const userId = new mongoose.Types.ObjectId().toString();
  const dummyExamId = new mongoose.Types.ObjectId().toString();
  const dummyExamCode = 'JEE';
  const userContext = {
    userId,
    role: 'Student',
    targetExam: { examId: dummyExamId, examCode: dummyExamCode },
  };

  const subjectId = new mongoose.Types.ObjectId().toString();
  const chapterId = new mongoose.Types.ObjectId().toString();
  const topicId = new mongoose.Types.ObjectId().toString();

  const dummyTopic = {
    _id: new mongoose.Types.ObjectId(topicId),
    chapterId: new mongoose.Types.ObjectId(chapterId),
    subjectId: new mongoose.Types.ObjectId(subjectId),
    title: 'Kinematics',
    topicNumber: 1,
  } as any;

  const dummyChapter = {
    _id: new mongoose.Types.ObjectId(chapterId),
    subjectId: new mongoose.Types.ObjectId(subjectId),
    title: 'Laws of Motion',
    chapterNumber: 1,
    isActive: true,
  } as any;

  const dummySubject = {
    _id: new mongoose.Types.ObjectId(subjectId),
    name: 'Physics',
    code: 'PHY',
    examType: 'JEE',
    examId: new mongoose.Types.ObjectId(dummyExamId),
    isActive: true,
  } as any;

  beforeEach(() => {
    mockProgressRepo = {
      findOne: jest.fn(),
      find: jest.fn(),
      create: jest.fn(),
      updateStatus: jest.fn(),
      deleteOne: jest.fn(),
    };

    mockSubjectRepo = {
      find: jest.fn(),
      findById: jest.fn(),
    };

    mockChapterRepo = {
      find: jest.fn(),
      findById: jest.fn(),
    };

    mockTopicRepo = {
      find: jest.fn(),
      findById: jest.fn(),
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

  // Helper to set up valid curriculum chain
  const setupValidCurriculum = () => {
    mockTopicRepo.findById.mockResolvedValue(dummyTopic);
    mockChapterRepo.findById.mockResolvedValue(dummyChapter);
    mockSubjectRepo.findById.mockResolvedValue(dummySubject);
  };

  // ==================== State Transition Tests ====================

  it('1. NOT_STARTED → IN_PROGRESS: should create progress document', async () => {
    setupValidCurriculum();
    mockProgressRepo.findOne.mockResolvedValue(null);

    const now = new Date();
    const createdDoc = {
      userId,
      topicId,
      subjectId,
      status: 'IN_PROGRESS',
      lastProgressUpdatedAt: now,
    };
    mockProgressRepo.create.mockResolvedValue(createdDoc);

    const result = await progressService.updateTopicProgress(topicId, 'IN_PROGRESS', userId, userContext);

    expect(result.status).toBe('IN_PROGRESS');
    expect(result.topicId).toBe(topicId);
    expect(result.lastProgressUpdatedAt).toBe(now.toISOString());
    expect(mockProgressRepo.create).toHaveBeenCalledTimes(1);
    expect(mockProgressRepo.updateStatus).not.toHaveBeenCalled();
    expect(mockProgressRepo.deleteOne).not.toHaveBeenCalled();
  });

  it('2. NOT_STARTED → COMPLETED: should create progress document', async () => {
    setupValidCurriculum();
    mockProgressRepo.findOne.mockResolvedValue(null);

    const now = new Date();
    const createdDoc = {
      userId,
      topicId,
      subjectId,
      status: 'COMPLETED',
      lastProgressUpdatedAt: now,
    };
    mockProgressRepo.create.mockResolvedValue(createdDoc);

    const result = await progressService.updateTopicProgress(topicId, 'COMPLETED', userId, userContext);

    expect(result.status).toBe('COMPLETED');
    expect(result.lastProgressUpdatedAt).toBe(now.toISOString());
    expect(mockProgressRepo.create).toHaveBeenCalledTimes(1);
  });

  it('3. IN_PROGRESS → COMPLETED: should update progress document', async () => {
    setupValidCurriculum();
    const existingTimestamp = new Date('2026-08-20T10:00:00.000Z');
    mockProgressRepo.findOne.mockResolvedValue({
      userId,
      topicId,
      subjectId,
      status: 'IN_PROGRESS',
      lastProgressUpdatedAt: existingTimestamp,
    });

    const newTimestamp = new Date();
    mockProgressRepo.updateStatus.mockResolvedValue({
      userId,
      topicId,
      subjectId,
      status: 'COMPLETED',
      lastProgressUpdatedAt: newTimestamp,
    });

    const result = await progressService.updateTopicProgress(topicId, 'COMPLETED', userId, userContext);

    expect(result.status).toBe('COMPLETED');
    expect(result.lastProgressUpdatedAt).toBe(newTimestamp.toISOString());
    expect(mockProgressRepo.updateStatus).toHaveBeenCalledTimes(1);
    expect(mockProgressRepo.create).not.toHaveBeenCalled();
  });

  it('4. COMPLETED → IN_PROGRESS: should update progress document', async () => {
    setupValidCurriculum();
    const existingTimestamp = new Date('2026-08-20T10:00:00.000Z');
    mockProgressRepo.findOne.mockResolvedValue({
      userId,
      topicId,
      subjectId,
      status: 'COMPLETED',
      lastProgressUpdatedAt: existingTimestamp,
    });

    const newTimestamp = new Date();
    mockProgressRepo.updateStatus.mockResolvedValue({
      userId,
      topicId,
      subjectId,
      status: 'IN_PROGRESS',
      lastProgressUpdatedAt: newTimestamp,
    });

    const result = await progressService.updateTopicProgress(topicId, 'IN_PROGRESS', userId, userContext);

    expect(result.status).toBe('IN_PROGRESS');
    expect(result.lastProgressUpdatedAt).toBe(newTimestamp.toISOString());
    expect(mockProgressRepo.updateStatus).toHaveBeenCalledTimes(1);
  });

  it('5. IN_PROGRESS → NOT_STARTED: should delete progress document', async () => {
    setupValidCurriculum();
    mockProgressRepo.findOne.mockResolvedValue({
      userId,
      topicId,
      subjectId,
      status: 'IN_PROGRESS',
      lastProgressUpdatedAt: new Date(),
    });
    mockProgressRepo.deleteOne.mockResolvedValue(true);

    const result = await progressService.updateTopicProgress(topicId, 'NOT_STARTED', userId, userContext);

    expect(result.status).toBe('NOT_STARTED');
    expect(result.lastProgressUpdatedAt).toBeNull();
    expect(mockProgressRepo.deleteOne).toHaveBeenCalledWith(userId, topicId);
    expect(mockProgressRepo.create).not.toHaveBeenCalled();
    expect(mockProgressRepo.updateStatus).not.toHaveBeenCalled();
  });

  it('6. COMPLETED → NOT_STARTED: should delete progress document', async () => {
    setupValidCurriculum();
    mockProgressRepo.findOne.mockResolvedValue({
      userId,
      topicId,
      subjectId,
      status: 'COMPLETED',
      lastProgressUpdatedAt: new Date(),
    });
    mockProgressRepo.deleteOne.mockResolvedValue(true);

    const result = await progressService.updateTopicProgress(topicId, 'NOT_STARTED', userId, userContext);

    expect(result.status).toBe('NOT_STARTED');
    expect(result.lastProgressUpdatedAt).toBeNull();
    expect(mockProgressRepo.deleteOne).toHaveBeenCalledWith(userId, topicId);
  });

  // ==================== Same-Status No-Op Tests ====================

  it('7. IN_PROGRESS → IN_PROGRESS: no database mutation', async () => {
    setupValidCurriculum();
    const timestamp = new Date('2026-08-20T10:00:00.000Z');
    mockProgressRepo.findOne.mockResolvedValue({
      userId,
      topicId,
      subjectId,
      status: 'IN_PROGRESS',
      lastProgressUpdatedAt: timestamp,
    });

    const result = await progressService.updateTopicProgress(topicId, 'IN_PROGRESS', userId, userContext);

    expect(result.status).toBe('IN_PROGRESS');
    expect(result.lastProgressUpdatedAt).toBe(timestamp.toISOString());
    expect(mockProgressRepo.create).not.toHaveBeenCalled();
    expect(mockProgressRepo.updateStatus).not.toHaveBeenCalled();
    expect(mockProgressRepo.deleteOne).not.toHaveBeenCalled();
  });

  it('8. COMPLETED → COMPLETED: no database mutation', async () => {
    setupValidCurriculum();
    const timestamp = new Date('2026-08-20T12:00:00.000Z');
    mockProgressRepo.findOne.mockResolvedValue({
      userId,
      topicId,
      subjectId,
      status: 'COMPLETED',
      lastProgressUpdatedAt: timestamp,
    });

    const result = await progressService.updateTopicProgress(topicId, 'COMPLETED', userId, userContext);

    expect(result.status).toBe('COMPLETED');
    expect(result.lastProgressUpdatedAt).toBe(timestamp.toISOString());
    expect(mockProgressRepo.create).not.toHaveBeenCalled();
    expect(mockProgressRepo.updateStatus).not.toHaveBeenCalled();
    expect(mockProgressRepo.deleteOne).not.toHaveBeenCalled();
  });

  it('9. NOT_STARTED → NOT_STARTED: no database mutation', async () => {
    setupValidCurriculum();
    mockProgressRepo.findOne.mockResolvedValue(null);

    const result = await progressService.updateTopicProgress(topicId, 'NOT_STARTED', userId, userContext);

    expect(result.status).toBe('NOT_STARTED');
    expect(result.lastProgressUpdatedAt).toBeNull();
    expect(mockProgressRepo.create).not.toHaveBeenCalled();
    expect(mockProgressRepo.updateStatus).not.toHaveBeenCalled();
    expect(mockProgressRepo.deleteOne).not.toHaveBeenCalled();
  });

  // ==================== Timestamp Semantics ====================

  it('10. timestamp changes only on genuine transitions', async () => {
    setupValidCurriculum();
    const originalTimestamp = new Date('2026-08-20T10:00:00.000Z');
    mockProgressRepo.findOne.mockResolvedValue({
      userId,
      topicId,
      subjectId,
      status: 'IN_PROGRESS',
      lastProgressUpdatedAt: originalTimestamp,
    });

    // Same-status: timestamp should NOT change
    const noOpResult = await progressService.updateTopicProgress(topicId, 'IN_PROGRESS', userId, userContext);
    expect(noOpResult.lastProgressUpdatedAt).toBe(originalTimestamp.toISOString());

    // Genuine transition: timestamp SHOULD change
    const newTimestamp = new Date('2026-08-23T14:00:00.000Z');
    mockProgressRepo.updateStatus.mockResolvedValue({
      status: 'COMPLETED',
      lastProgressUpdatedAt: newTimestamp,
    });
    const transitionResult = await progressService.updateTopicProgress(topicId, 'COMPLETED', userId, userContext);
    expect(transitionResult.lastProgressUpdatedAt).toBe(newTimestamp.toISOString());
    expect(transitionResult.lastProgressUpdatedAt).not.toBe(originalTimestamp.toISOString());
  });

  it('11. NOT_STARTED response timestamp is null', async () => {
    setupValidCurriculum();
    mockProgressRepo.findOne.mockResolvedValue(null);

    const result = await progressService.getTopicProgress(topicId, userId, userContext);

    expect(result.status).toBe('NOT_STARTED');
    expect(result.lastProgressUpdatedAt).toBeNull();
  });

  it('12. deletion is scoped by userId + topicId', async () => {
    setupValidCurriculum();
    mockProgressRepo.findOne.mockResolvedValue({
      userId,
      topicId,
      subjectId,
      status: 'COMPLETED',
      lastProgressUpdatedAt: new Date(),
    });
    mockProgressRepo.deleteOne.mockResolvedValue(true);

    await progressService.updateTopicProgress(topicId, 'NOT_STARTED', userId, userContext);

    expect(mockProgressRepo.deleteOne).toHaveBeenCalledWith(userId, topicId);
  });

  // ==================== Cross-Exam Security ====================

  it('13. should reject topic from different exam curriculum', async () => {
    mockTopicRepo.findById.mockResolvedValue(dummyTopic);
    mockChapterRepo.findById.mockResolvedValue(dummyChapter);

    // Subject belongs to a DIFFERENT exam
    const otherExamSubject = {
      ...dummySubject,
      examId: new mongoose.Types.ObjectId(),
      examType: 'NEET',
      isActive: true,
    };
    mockSubjectRepo.findById.mockResolvedValue(otherExamSubject);

    await expect(
      progressService.updateTopicProgress(topicId, 'IN_PROGRESS', userId, userContext)
    ).rejects.toThrow('Access denied');
  });

  it('14. should reject topic with inactive chapter', async () => {
    mockTopicRepo.findById.mockResolvedValue(dummyTopic);
    mockChapterRepo.findById.mockResolvedValue({
      ...dummyChapter,
      isActive: false,
    });

    await expect(
      progressService.updateTopicProgress(topicId, 'IN_PROGRESS', userId, userContext)
    ).rejects.toThrow('inactive or missing chapter');
  });

  it('15. should reject topic with inactive subject', async () => {
    mockTopicRepo.findById.mockResolvedValue(dummyTopic);
    mockChapterRepo.findById.mockResolvedValue(dummyChapter);
    mockSubjectRepo.findById.mockResolvedValue({
      ...dummySubject,
      isActive: false,
    });

    await expect(
      progressService.updateTopicProgress(topicId, 'IN_PROGRESS', userId, userContext)
    ).rejects.toThrow('inactive or missing subject');
  });

  it('16. should reject non-existent topic', async () => {
    mockTopicRepo.findById.mockResolvedValue(null);

    await expect(
      progressService.updateTopicProgress(topicId, 'IN_PROGRESS', userId, userContext)
    ).rejects.toThrow('Topic not found');
  });

  it('17. should reject missing target exam context', async () => {
    const noExamContext = { userId, role: 'Student' };

    await expect(
      progressService.updateTopicProgress(topicId, 'IN_PROGRESS', userId, noExamContext)
    ).rejects.toThrow('Target exam context is required');
  });

  // ==================== Progress Summary Tests ====================

  it('18. should compute correct progress summary with active curriculum', async () => {
    const subject1Id = new mongoose.Types.ObjectId().toString();
    const chapter1Id = new mongoose.Types.ObjectId().toString();
    const topic1Id = new mongoose.Types.ObjectId().toString();
    const topic2Id = new mongoose.Types.ObjectId().toString();
    const topic3Id = new mongoose.Types.ObjectId().toString();

    mockSubjectRepo.find.mockResolvedValue([
      { _id: new mongoose.Types.ObjectId(subject1Id), isActive: true },
    ]);

    mockChapterRepo.find.mockResolvedValue([
      { _id: new mongoose.Types.ObjectId(chapter1Id), subjectId: new mongoose.Types.ObjectId(subject1Id), isActive: true },
    ]);

    mockTopicRepo.find.mockResolvedValue([
      { _id: new mongoose.Types.ObjectId(topic1Id), chapterId: new mongoose.Types.ObjectId(chapter1Id), subjectId: new mongoose.Types.ObjectId(subject1Id) },
      { _id: new mongoose.Types.ObjectId(topic2Id), chapterId: new mongoose.Types.ObjectId(chapter1Id), subjectId: new mongoose.Types.ObjectId(subject1Id) },
      { _id: new mongoose.Types.ObjectId(topic3Id), chapterId: new mongoose.Types.ObjectId(chapter1Id), subjectId: new mongoose.Types.ObjectId(subject1Id) },
    ]);

    mockProgressRepo.find.mockResolvedValue([
      { topicId: topic1Id, status: 'COMPLETED' },
      { topicId: topic2Id, status: 'IN_PROGRESS' },
    ]);

    const summary = await progressService.getProgressSummary(userId, userContext);

    expect(summary.totalSubjects).toBe(1);
    expect(summary.totalTopics).toBe(3);
    expect(summary.completedTopics).toBe(1);
    expect(summary.inProgressTopics).toBe(1);
    expect(summary.unstartedTopics).toBe(1);
    expect(summary.overallCompletionPercentage).toBe(33); // Math.round(1/3 * 100)
  });

  it('19. should return zero summary when no active subjects', async () => {
    mockSubjectRepo.find.mockResolvedValue([]);

    const summary = await progressService.getProgressSummary(userId, userContext);

    expect(summary.totalSubjects).toBe(0);
    expect(summary.totalTopics).toBe(0);
    expect(summary.completedTopics).toBe(0);
    expect(summary.overallCompletionPercentage).toBe(0);
  });

  it('20. stale progress records for deactivated chapters should not affect summary', async () => {
    const subject1Id = new mongoose.Types.ObjectId().toString();
    const activeChapterId = new mongoose.Types.ObjectId().toString();
    const activeTopic1Id = new mongoose.Types.ObjectId().toString();

    mockSubjectRepo.find.mockResolvedValue([
      { _id: new mongoose.Types.ObjectId(subject1Id), isActive: true },
    ]);

    // Only one active chapter (the deactivated chapter is NOT returned)
    mockChapterRepo.find.mockResolvedValue([
      { _id: new mongoose.Types.ObjectId(activeChapterId), subjectId: new mongoose.Types.ObjectId(subject1Id), isActive: true },
    ]);

    // Only topics from active chapters
    mockTopicRepo.find.mockResolvedValue([
      { _id: new mongoose.Types.ObjectId(activeTopic1Id), chapterId: new mongoose.Types.ObjectId(activeChapterId), subjectId: new mongoose.Types.ObjectId(subject1Id) },
    ]);

    // Progress filter $in only contains active topic IDs, so stale records are excluded
    mockProgressRepo.find.mockResolvedValue([
      { topicId: activeTopic1Id, status: 'COMPLETED' },
    ]);

    const summary = await progressService.getProgressSummary(userId, userContext);

    expect(summary.totalTopics).toBe(1);
    expect(summary.completedTopics).toBe(1);
    expect(summary.overallCompletionPercentage).toBe(100);
  });

  // ==================== GET Topic Progress ====================

  it('21. GET topic progress for existing IN_PROGRESS document', async () => {
    setupValidCurriculum();
    const timestamp = new Date('2026-08-20T10:00:00.000Z');
    mockProgressRepo.findOne.mockResolvedValue({
      userId,
      topicId,
      subjectId,
      status: 'IN_PROGRESS',
      lastProgressUpdatedAt: timestamp,
    });

    const result = await progressService.getTopicProgress(topicId, userId, userContext);

    expect(result.status).toBe('IN_PROGRESS');
    expect(result.lastProgressUpdatedAt).toBe(timestamp.toISOString());
  });

  it('22. GET topic progress for non-existent document returns NOT_STARTED', async () => {
    setupValidCurriculum();
    mockProgressRepo.findOne.mockResolvedValue(null);

    const result = await progressService.getTopicProgress(topicId, userId, userContext);

    expect(result.status).toBe('NOT_STARTED');
    expect(result.lastProgressUpdatedAt).toBeNull();
  });
});
