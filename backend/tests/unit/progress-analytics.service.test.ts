import mongoose from 'mongoose';
import { ProgressService } from '../../src/modules/progress/services/progress.service';

describe('Phase 8B — Progress Analytics Unit Tests', () => {
  let mockProgressRepo: any;
  let mockSubjectRepo: any;
  let mockChapterRepo: any;
  let mockTopicRepo: any;
  let progressService: ProgressService;

  const userId = new mongoose.Types.ObjectId().toString();
  const dummyExamId = new mongoose.Types.ObjectId().toString();
  const dummyExamCode = 'JEE';
  const userContext = {
    userId,
    role: 'Student',
    targetExam: { examId: dummyExamId, examCode: dummyExamCode },
  };

  const subject1Id = new mongoose.Types.ObjectId().toString();
  const subject2Id = new mongoose.Types.ObjectId().toString();
  const chapter1Id = new mongoose.Types.ObjectId().toString();
  const chapter2Id = new mongoose.Types.ObjectId().toString();
  const topic1Id = new mongoose.Types.ObjectId().toString();
  const topic2Id = new mongoose.Types.ObjectId().toString();
  const topic3Id = new mongoose.Types.ObjectId().toString();

  const subject1 = {
    _id: new mongoose.Types.ObjectId(subject1Id),
    name: 'Physics',
    code: 'PHY',
    examType: 'JEE',
    examId: new mongoose.Types.ObjectId(dummyExamId),
    isActive: true,
  } as any;

  const subject2 = {
    _id: new mongoose.Types.ObjectId(subject2Id),
    name: 'Chemistry',
    code: 'CHEM',
    examType: 'JEE',
    examId: new mongoose.Types.ObjectId(dummyExamId),
    isActive: true,
  } as any;

  const chapter1 = {
    _id: new mongoose.Types.ObjectId(chapter1Id),
    subjectId: new mongoose.Types.ObjectId(subject1Id),
    title: 'Mechanics',
    chapterNumber: 1,
    isActive: true,
  } as any;

  const chapter2 = {
    _id: new mongoose.Types.ObjectId(chapter2Id),
    subjectId: new mongoose.Types.ObjectId(subject2Id),
    title: 'Organic Chemistry',
    chapterNumber: 1,
    isActive: true,
  } as any;

  const topic1 = {
    _id: new mongoose.Types.ObjectId(topic1Id),
    chapterId: new mongoose.Types.ObjectId(chapter1Id),
    subjectId: new mongoose.Types.ObjectId(subject1Id),
    title: 'Kinematics',
    topicNumber: 1,
  } as any;

  const topic2 = {
    _id: new mongoose.Types.ObjectId(topic2Id),
    chapterId: new mongoose.Types.ObjectId(chapter1Id),
    subjectId: new mongoose.Types.ObjectId(subject1Id),
    title: 'Dynamics',
    topicNumber: 2,
  } as any;

  const topic3 = {
    _id: new mongoose.Types.ObjectId(topic3Id),
    chapterId: new mongoose.Types.ObjectId(chapter2Id),
    subjectId: new mongoose.Types.ObjectId(subject2Id),
    title: 'Hydrocarbons',
    topicNumber: 1,
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

    progressService = new ProgressService(
      mockProgressRepo,
      mockSubjectRepo,
      mockChapterRepo,
      mockTopicRepo
    );

    mockSubjectRepo.find.mockResolvedValue([subject1, subject2]);
    mockChapterRepo.find.mockResolvedValue([chapter1, chapter2]);
    mockTopicRepo.find.mockResolvedValue([topic1, topic2, topic3]);
  });

  it('1. should compute correct overall analytics and per-subject breakdown', async () => {
    mockProgressRepo.find.mockResolvedValue([
      { topicId: topic1Id, status: 'COMPLETED' },
      { topicId: topic2Id, status: 'IN_PROGRESS' },
    ]);

    const result = await progressService.getProgressAnalytics(userId, userContext);

    // Overall metrics
    expect(result.overall.totalSubjects).toBe(2);
    expect(result.overall.totalTopics).toBe(3);
    expect(result.overall.completedTopics).toBe(1);
    expect(result.overall.inProgressTopics).toBe(1);
    expect(result.overall.unstartedTopics).toBe(1);
    expect(result.overall.overallCompletionPercentage).toBe(33);

    // Subject 1 (Physics): 2 topics (1 COMPLETED, 1 IN_PROGRESS => 50%)
    const phy = result.bySubject.find((s) => s.subjectCode === 'PHY');
    expect(phy).toBeDefined();
    expect(phy?.totalTopics).toBe(2);
    expect(phy?.completedTopics).toBe(1);
    expect(phy?.inProgressTopics).toBe(1);
    expect(phy?.unstartedTopics).toBe(0);
    expect(phy?.completionPercentage).toBe(50);

    // Subject 2 (Chemistry): 1 topic (0 COMPLETED, 0 IN_PROGRESS => 0%)
    const chem = result.bySubject.find((s) => s.subjectCode === 'CHEM');
    expect(chem).toBeDefined();
    expect(chem?.totalTopics).toBe(1);
    expect(chem?.completedTopics).toBe(0);
    expect(chem?.inProgressTopics).toBe(0);
    expect(chem?.unstartedTopics).toBe(1);
    expect(chem?.completionPercentage).toBe(0);
  });

  it('2. should handle user with no progress records (all NOT_STARTED)', async () => {
    mockProgressRepo.find.mockResolvedValue([]);

    const result = await progressService.getProgressAnalytics(userId, userContext);

    expect(result.overall.completedTopics).toBe(0);
    expect(result.overall.inProgressTopics).toBe(0);
    expect(result.overall.unstartedTopics).toBe(3);
    expect(result.overall.overallCompletionPercentage).toBe(0);
  });

  it('3. should handle completed-only user', async () => {
    mockProgressRepo.find.mockResolvedValue([
      { topicId: topic1Id, status: 'COMPLETED' },
      { topicId: topic2Id, status: 'COMPLETED' },
      { topicId: topic3Id, status: 'COMPLETED' },
    ]);

    const result = await progressService.getProgressAnalytics(userId, userContext);

    expect(result.overall.completedTopics).toBe(3);
    expect(result.overall.inProgressTopics).toBe(0);
    expect(result.overall.unstartedTopics).toBe(0);
    expect(result.overall.overallCompletionPercentage).toBe(100);
  });

  it('4. should handle in-progress-only user', async () => {
    mockProgressRepo.find.mockResolvedValue([
      { topicId: topic1Id, status: 'IN_PROGRESS' },
      { topicId: topic2Id, status: 'IN_PROGRESS' },
    ]);

    const result = await progressService.getProgressAnalytics(userId, userContext);

    expect(result.overall.completedTopics).toBe(0);
    expect(result.overall.inProgressTopics).toBe(2);
    expect(result.overall.unstartedTopics).toBe(1);
    expect(result.overall.overallCompletionPercentage).toBe(0);
  });

  it('5. should handle empty curriculum gracefully (no active subjects)', async () => {
    mockSubjectRepo.find.mockResolvedValue([]);

    const result = await progressService.getProgressAnalytics(userId, userContext);

    expect(result.overall.totalSubjects).toBe(0);
    expect(result.overall.totalTopics).toBe(0);
    expect(result.overall.overallCompletionPercentage).toBe(0);
    expect(result.bySubject).toHaveLength(0);
  });

  it('6. should handle active subject with zero topics', async () => {
    const subjectNoTopics = {
      _id: new mongoose.Types.ObjectId(),
      name: 'Maths',
      code: 'MATH',
      examType: 'JEE',
      isActive: true,
    } as any;

    mockSubjectRepo.find.mockResolvedValue([subjectNoTopics]);
    mockChapterRepo.find.mockResolvedValue([]);
    mockTopicRepo.find.mockResolvedValue([]);
    mockProgressRepo.find.mockResolvedValue([]);

    const result = await progressService.getProgressAnalytics(userId, userContext);

    expect(result.overall.totalSubjects).toBe(1);
    expect(result.overall.totalTopics).toBe(0);
    expect(result.bySubject).toHaveLength(1);
    expect(result.bySubject[0].totalTopics).toBe(0);
    expect(result.bySubject[0].completionPercentage).toBe(0);
  });

  it('7. should exclude inactive subjects and chapters', async () => {
    // mockSubjectRepo find filters isActive: true natively
    mockSubjectRepo.find.mockResolvedValue([subject1]); // subject2 excluded
    mockChapterRepo.find.mockResolvedValue([chapter1]); // chapter2 excluded
    mockTopicRepo.find.mockResolvedValue([topic1, topic2]);

    mockProgressRepo.find.mockResolvedValue([{ topicId: topic1Id, status: 'COMPLETED' }]);

    const result = await progressService.getProgressAnalytics(userId, userContext);

    expect(result.overall.totalSubjects).toBe(1);
    expect(result.bySubject).toHaveLength(1);
    expect(result.bySubject[0].subjectCode).toBe('PHY');
  });

  it('8. should exclude stale progress records for deactivated topics', async () => {
    const staleTopicId = new mongoose.Types.ObjectId().toString();

    // Query 4 progressRepo find is restricted by $in: activeTopicIds
    mockProgressRepo.find.mockImplementation(async (filter: any) => {
      // simulate DB filter topicId: { $in: activeTopicIds }
      const activeIds = filter.topicId.$in;
      const allDocs = [
        { topicId: topic1Id, status: 'COMPLETED' },
        { topicId: staleTopicId, status: 'COMPLETED' }, // Stale record
      ];
      return allDocs.filter((d) => activeIds.includes(d.topicId));
    });

    const result = await progressService.getProgressAnalytics(userId, userContext);

    expect(result.overall.completedTopics).toBe(1); // Stale topic ignored
  });

  it('9. Phase 8A getProgressSummary must remain consistent with Phase 8B overall metrics', async () => {
    mockProgressRepo.find.mockResolvedValue([{ topicId: topic1Id, status: 'COMPLETED' }]);

    const summary = await progressService.getProgressSummary(userId, userContext);
    const analytics = await progressService.getProgressAnalytics(userId, userContext);

    expect(summary).toEqual(analytics.overall);
  });
});
