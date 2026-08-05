import {
  QuestionBankService,
  MockTestService,
  TestAttemptService,
} from '../../src/modules/assessment/services/assessment.service';
import { AppError } from '../../src/utils/app-error';

describe('Assessment Module - Service Unit Tests', () => {
  let mockQuestionRepo: any;
  let mockMockTestRepo: any;
  let mockAttemptRepo: any;
  let mockSubjectRepo: any;
  let mockChapterRepo: any;
  let mockTopicRepo: any;

  let questionService: QuestionBankService;
  let mockTestService: MockTestService;
  let attemptService: TestAttemptService;

  beforeEach(() => {
    mockQuestionRepo = {
      create: jest.fn(),
      findById: jest.fn(),
      find: jest.fn(),
      count: jest.fn(),
      updateById: jest.fn(),
      softDelete: jest.fn(),
    };

    mockMockTestRepo = {
      create: jest.fn(),
      findById: jest.fn(),
      find: jest.fn(),
      count: jest.fn(),
      updateById: jest.fn(),
      softDelete: jest.fn(),
    };

    mockAttemptRepo = {
      create: jest.fn(),
      findById: jest.fn(),
      findOne: jest.fn(),
      find: jest.fn(),
      count: jest.fn(),
      updateById: jest.fn(),
    };

    mockSubjectRepo = { findById: jest.fn() };
    mockChapterRepo = { findById: jest.fn() };
    mockTopicRepo = { findById: jest.fn() };

    questionService = new QuestionBankService(
      mockQuestionRepo,
      mockSubjectRepo,
      mockChapterRepo,
      mockTopicRepo
    );
    mockTestService = new MockTestService(mockMockTestRepo, mockQuestionRepo);
    attemptService = new TestAttemptService(mockAttemptRepo, mockMockTestRepo, mockQuestionRepo);
  });

  describe('QuestionBankService', () => {
    it('should create a question successfully when parent entities exist', async () => {
      mockSubjectRepo.findById.mockResolvedValue({ _id: 'subj1' });
      mockChapterRepo.findById.mockResolvedValue({ _id: 'chap1' });
      mockTopicRepo.findById.mockResolvedValue({ _id: 'top1' });
      mockQuestionRepo.create.mockResolvedValue({ _id: 'q1', questionText: 'What is acceleration?' });

      const result = await questionService.createQuestion({
        subjectId: 'subj1' as any,
        chapterId: 'chap1' as any,
        topicId: 'top1' as any,
        questionText: 'What is acceleration?',
        options: [{ optionId: 'A', optionText: 'Rate of velocity change', isCorrect: true }],
      });

      expect(result.questionText).toBe('What is acceleration?');
    });

    it('should throw 404 when parent subject is not found', async () => {
      mockSubjectRepo.findById.mockResolvedValue(null);
      await expect(
        questionService.createQuestion({
          subjectId: 'subj1' as any,
          questionText: 'Invalid',
        })
      ).rejects.toThrow(AppError);
    });

    it('should soft delete question', async () => {
      mockQuestionRepo.findById.mockResolvedValue({ _id: 'q1' });
      mockQuestionRepo.softDelete.mockResolvedValue({ _id: 'q1', isDeleted: true });

      const result = await questionService.deleteQuestion('q1');
      expect(result).toBe(true);
    });
  });

  describe('MockTestService', () => {
    it('should create mock test after verifying question existence', async () => {
      mockQuestionRepo.findById.mockResolvedValue({ _id: 'q1' });
      mockMockTestRepo.create.mockResolvedValue({ _id: 'test1', title: 'Physics Mock 1' });

      const result = await mockTestService.createMockTest({
        title: 'Physics Mock 1',
        questions: [{ questionId: 'q1' as any, section: 'Physics', marks: 4, negativeMarks: 1, order: 1 }],
      });

      expect(result.title).toBe('Physics Mock 1');
    });

    it('should throw 404 if referenced question does not exist', async () => {
      mockQuestionRepo.findById.mockResolvedValue(null);
      await expect(
        mockTestService.createMockTest({
          title: 'Physics Mock 1',
          questions: [{ questionId: 'invalid' as any, section: 'Physics', marks: 4, negativeMarks: 1, order: 1 }],
        })
      ).rejects.toThrow(AppError);
    });
  });

  describe('TestAttemptService', () => {
    it('should start test by creating attempt if published', async () => {
      mockMockTestRepo.findById.mockResolvedValue({ _id: 'test1', isPublished: true, questions: [] });
      mockAttemptRepo.findOne.mockResolvedValue(null);
      mockAttemptRepo.create.mockResolvedValue({ _id: 'att1', status: 'In_Progress' });

      const result = await attemptService.startTest('user1', 'test1');
      expect(result.attempt.status).toBe('In_Progress');
    });

    it('should throw 403 when starting an unpublished test', async () => {
      mockMockTestRepo.findById.mockResolvedValue({ _id: 'test1', isPublished: false });
      await expect(attemptService.startTest('user1', 'test1')).rejects.toThrow(AppError);
    });

    it('should save draft responses for active attempt', async () => {
      mockAttemptRepo.findOne.mockResolvedValue({ _id: 'att1', status: 'In_Progress' });
      mockAttemptRepo.updateById.mockResolvedValue({ _id: 'att1', durationSpentSeconds: 120 });

      const result = await attemptService.saveDraft('user1', 'test1', {
        durationSpentSeconds: 120,
        responses: [{ questionId: 'q1', selectedOptionId: 'A' }],
      });

      expect(result.durationSpentSeconds).toBe(120);
    });

    it('should submit test, calculate score (+4 correct, -1 incorrect), and calculate accuracy', async () => {
      const mockAttemptDoc: any = {
        _id: 'att1',
        startTime: new Date(Date.now() - 60000),
        status: 'In_Progress',
        responses: [],
      };
      mockAttemptRepo.findOne.mockResolvedValue(mockAttemptDoc);

      const mockQuestionDoc: any = {
        _id: 'q1',
        questionText: 'Q1',
        correctOptionId: 'A',
        options: [{ optionId: 'A', isCorrect: true }, { optionId: 'B', isCorrect: false }],
        marks: 4,
        negativeMarks: 1,
      };

      const mockQuestionDoc2: any = {
        _id: 'q2',
        questionText: 'Q2',
        correctOptionId: 'B',
        options: [{ optionId: 'A', isCorrect: false }, { optionId: 'B', isCorrect: true }],
        marks: 4,
        negativeMarks: 1,
      };

      mockMockTestRepo.findById.mockResolvedValue({
        _id: 'test1',
        questions: [
          { questionId: mockQuestionDoc, marks: 4, negativeMarks: 1, order: 1 },
          { questionId: mockQuestionDoc2, marks: 4, negativeMarks: 1, order: 2 },
        ],
      });

      mockAttemptRepo.updateById.mockImplementation(async (_id: string, update: any) => ({
        ...mockAttemptDoc,
        ...update,
        _id: 'att1',
      }));

      const result = await attemptService.submitTest('user1', 'test1', {
        answers: [
          { questionId: 'q1', selectedOptionId: 'A' }, // Correct -> +4
          { questionId: 'q2', selectedOptionId: 'A' }, // Incorrect -> -1
        ],
      });

      expect(result.score).toBe(3); // 4 - 1 = 3
      expect(result.totalCorrect).toBe(1);
      expect(result.totalIncorrect).toBe(1);
      expect(result.accuracy).toBe(50); // 1 / 2 = 50%
      expect(result.status).toBe('Submitted');
    });
  });
});
