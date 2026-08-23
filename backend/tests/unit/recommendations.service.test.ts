import mongoose from 'mongoose';
import { SubjectService } from '../../src/modules/academic/services/academic.service';

describe('Phase 7D — Curriculum Intelligence & Recommendation Scoring Unit Tests', () => {
  let mockSubjectRepo: any;
  let mockChapterRepo: any;
  let mockTopicRepo: any;
  let subjectService: SubjectService;

  const dummyExamId = new mongoose.Types.ObjectId().toString();
  const dummyExamCode = 'JEE';
  const userContext = {
    userId: new mongoose.Types.ObjectId().toString(),
    role: 'Student',
    targetExam: { examId: dummyExamId, examCode: dummyExamCode },
  };

  const dummySubjectId = new mongoose.Types.ObjectId().toString();
  const dummySubject = {
    _id: new mongoose.Types.ObjectId(dummySubjectId),
    name: 'Physics',
    code: 'PHY',
    examType: 'JEE',
  } as any;

  beforeEach(() => {
    mockSubjectRepo = {
      find: jest.fn(),
      findById: jest.fn(),
      findByCode: jest.fn(),
      findByCodeAndExam: jest.fn(),
      create: jest.fn(),
      updateById: jest.fn(),
      deleteById: jest.fn(),
      count: jest.fn(),
    };

    mockChapterRepo = {
      find: jest.fn(),
      findById: jest.fn(),
      findBySubjectAndNumber: jest.fn(),
      create: jest.fn(),
      updateById: jest.fn(),
      deleteById: jest.fn(),
      count: jest.fn(),
    };

    mockTopicRepo = {
      find: jest.fn(),
      findById: jest.fn(),
      findByChapterAndNumber: jest.fn(),
      create: jest.fn(),
      updateById: jest.fn(),
      deleteById: jest.fn(),
      count: jest.fn(),
    };

    subjectService = new SubjectService(mockSubjectRepo, mockChapterRepo, mockTopicRepo);
  });

  it('1. should calculate dataset-driven normalized CPS score and set priorityLevel HIGH', async () => {
    const chapter1 = {
      _id: new mongoose.Types.ObjectId(),
      subjectId: new mongoose.Types.ObjectId(dummySubjectId),
      title: 'Laws of Motion',
      chapterNumber: 1,
      weightage: 10,
    } as any;

    const chapter2 = {
      _id: new mongoose.Types.ObjectId(),
      subjectId: new mongoose.Types.ObjectId(dummySubjectId),
      title: 'Thermodynamics',
      chapterNumber: 2,
      weightage: 20, // maxWeightage = 20
    } as any;

    // For topic under Chapter 2: weightageComponent = (20/20)*50 = 50. importanceScore = 8 => (8/10)*50 = 40. CPS = 90 (HIGH)
    const topic1 = {
      _id: new mongoose.Types.ObjectId(),
      chapterId: chapter2._id,
      subjectId: new mongoose.Types.ObjectId(dummySubjectId),
      title: 'First Law of Thermodynamics',
      topicNumber: 1,
      difficultyLevel: 'Easy',
      importanceScore: 8,
    } as any;

    mockSubjectRepo.find.mockResolvedValue([dummySubject]);
    mockChapterRepo.find.mockResolvedValue([chapter1, chapter2]);
    mockTopicRepo.find.mockResolvedValue([topic1]);

    const results = await subjectService.getRecommendedNextTopics({}, userContext);

    expect(results).toHaveLength(1);
    expect(results[0].priorityScore).toBe(90); // 50 + 40
    expect(results[0].priorityLevel).toBe('HIGH');
    expect(results[0].explanation).toContain('High Exam Weightage: Belongs to Chapter \'Thermodynamics\' (20% exam weightage).');
    expect(results[0].explanation).toContain('High Curriculum Importance: Rated 8/10 in curriculum importance.');
  });

  it('2. should set weightageComponent = 0 when chapter weightage is 0 or missing', async () => {
    const chapterZero = {
      _id: new mongoose.Types.ObjectId(),
      subjectId: new mongoose.Types.ObjectId(dummySubjectId),
      title: 'Introductory Concepts',
      chapterNumber: 1,
      weightage: 0,
    } as any;

    const topicZero = {
      _id: new mongoose.Types.ObjectId(),
      chapterId: chapterZero._id,
      subjectId: new mongoose.Types.ObjectId(dummySubjectId),
      title: 'Units and Dimensions',
      topicNumber: 1,
      difficultyLevel: 'Medium',
      importanceScore: 6, // (6/10)*50 = 30 points -> CPS = 30 (LOW)
    } as any;

    mockSubjectRepo.find.mockResolvedValue([dummySubject]);
    mockChapterRepo.find.mockResolvedValue([chapterZero]);
    mockTopicRepo.find.mockResolvedValue([topicZero]);

    const results = await subjectService.getRecommendedNextTopics({}, userContext);

    expect(results[0].priorityScore).toBe(30);
    expect(results[0].priorityLevel).toBe('LOW');
    expect(results[0].explanation).toContain('Exam Weightage: Not specified for this chapter.');
  });

  it('3. should fall back to importanceScore = 5 when missing or null', async () => {
    const chapter = {
      _id: new mongoose.Types.ObjectId(),
      subjectId: new mongoose.Types.ObjectId(dummySubjectId),
      title: 'Kinematics',
      chapterNumber: 1,
      weightage: 10,
    } as any;

    const topicNoImportance = {
      _id: new mongoose.Types.ObjectId(),
      chapterId: chapter._id,
      subjectId: new mongoose.Types.ObjectId(dummySubjectId),
      title: 'Motion in 1D',
      topicNumber: 1,
      difficultyLevel: 'Easy',
      importanceScore: undefined, // Should fallback to 5 => (5/10)*50 = 25. maxWeightage = 10 => (10/10)*50 = 50. Total = 75 (HIGH)
    } as any;

    mockSubjectRepo.find.mockResolvedValue([dummySubject]);
    mockChapterRepo.find.mockResolvedValue([chapter]);
    mockTopicRepo.find.mockResolvedValue([topicNoImportance]);

    const results = await subjectService.getRecommendedNextTopics({}, userContext);

    expect(results[0].importanceScore).toBe(5);
    expect(results[0].priorityScore).toBe(75);
    expect(results[0].priorityLevel).toBe('HIGH');
  });

  it('4. should throw AppError 400 when topic importanceScore is invalid or out of range', async () => {
    const chapter = {
      _id: new mongoose.Types.ObjectId(),
      subjectId: new mongoose.Types.ObjectId(dummySubjectId),
      title: 'Optics',
      chapterNumber: 1,
      weightage: 10,
    } as any;

    const topicInvalid = {
      _id: new mongoose.Types.ObjectId(),
      chapterId: chapter._id,
      subjectId: new mongoose.Types.ObjectId(dummySubjectId),
      title: 'Ray Optics',
      topicNumber: 1,
      difficultyLevel: 'Medium',
      importanceScore: 15, // Invalid score > 10
    } as any;

    mockSubjectRepo.find.mockResolvedValue([dummySubject]);
    mockChapterRepo.find.mockResolvedValue([chapter]);
    mockTopicRepo.find.mockResolvedValue([topicInvalid]);

    await expect(subjectService.getRecommendedNextTopics({}, userContext)).rejects.toThrow(
      'Invalid topic importanceScore \'15\' in curriculum data.'
    );
  });

  it('4. should apply deterministic tie-breaking rules', async () => {
    const chapterA = {
      _id: new mongoose.Types.ObjectId(),
      subjectId: new mongoose.Types.ObjectId(dummySubjectId),
      title: 'Chapter A',
      chapterNumber: 1,
      weightage: 10,
    } as any;

    const chapterB = {
      _id: new mongoose.Types.ObjectId(),
      subjectId: new mongoose.Types.ObjectId(dummySubjectId),
      title: 'Chapter B',
      chapterNumber: 2,
      weightage: 10,
    } as any;

    // Create 3 topics with identical priorityScore (50)
    const topic1 = {
      _id: new mongoose.Types.ObjectId(),
      chapterId: chapterB._id,
      subjectId: new mongoose.Types.ObjectId(dummySubjectId),
      title: 'Topic B2',
      topicNumber: 2,
      importanceScore: 5,
    } as any;

    const topic2 = {
      _id: new mongoose.Types.ObjectId(),
      chapterId: chapterA._id,
      subjectId: new mongoose.Types.ObjectId(dummySubjectId),
      title: 'Topic A1',
      topicNumber: 1,
      importanceScore: 5,
    } as any;

    const topic3 = {
      _id: new mongoose.Types.ObjectId(),
      chapterId: chapterA._id,
      subjectId: new mongoose.Types.ObjectId(dummySubjectId),
      title: 'Topic A-HighImportance',
      topicNumber: 3,
      importanceScore: 8, // Higher importanceScore => comes first
    } as any;

    mockSubjectRepo.find.mockResolvedValue([dummySubject]);
    mockChapterRepo.find.mockResolvedValue([chapterA, chapterB]);
    mockTopicRepo.find.mockResolvedValue([topic1, topic2, topic3]);

    const results = await subjectService.getRecommendedNextTopics({}, userContext);

    // Topic 3 has highest importanceScore (8), so it ranks #1
    expect(results[0].title).toBe('Topic A-HighImportance');
    // Topic 2 (Chapter 1, Topic 1) ranks before Topic 1 (Chapter 2, Topic 2) by chapterNumber ASC
    expect(results[1].title).toBe('Topic A1');
    expect(results[2].title).toBe('Topic B2');
  });
});
