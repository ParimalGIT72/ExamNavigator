import {
  questionBankRepository,
  mockTestRepository,
  testAttemptRepository,
  QuestionBankRepository,
  MockTestRepository,
  TestAttemptRepository,
  IPaginationOptions,
} from '../repositories/assessment.repository';
import {
  subjectRepository,
  chapterRepository,
  topicRepository,
  SubjectRepository,
  ChapterRepository,
  TopicRepository,
} from '../../academic/repositories/academic.repository';
import { IQuestionBankDocument } from '../models/question-bank.model';
import { IMockTestDocument } from '../models/mock-test.model';
import { ITestAttemptDocument, ITestQuestionResponse } from '../models/test-attempt.model';
import { AppError } from '../../../utils/app-error';
import { logger } from '../../../utils/logger';
import { FilterQuery } from 'mongoose';

export interface IPaginatedResult<T> {
  items: T[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export class QuestionBankService {
  constructor(
    private questionRepo: QuestionBankRepository = questionBankRepository,
    private subjectRepo: SubjectRepository = subjectRepository,
    private chapterRepo: ChapterRepository = chapterRepository,
    private topicRepo: TopicRepository = topicRepository
  ) {}

  public async createQuestion(data: Partial<IQuestionBankDocument>): Promise<IQuestionBankDocument> {
    if (data.subjectId) {
      const subject = await this.subjectRepo.findById(data.subjectId.toString());
      if (!subject) {
        throw new AppError(`Parent subject not found with id '${data.subjectId}'.`, 404, 'SUBJECT_NOT_FOUND');
      }
    }

    if (data.chapterId) {
      const chapter = await this.chapterRepo.findById(data.chapterId.toString());
      if (!chapter) {
        throw new AppError(`Parent chapter not found with id '${data.chapterId}'.`, 404, 'CHAPTER_NOT_FOUND');
      }
    }

    if (data.topicId) {
      const topic = await this.topicRepo.findById(data.topicId.toString());
      if (!topic) {
        throw new AppError(`Parent topic not found with id '${data.topicId}'.`, 404, 'TOPIC_NOT_FOUND');
      }
    }

    if (data.options && data.options.length > 0) {
      const hasCorrect = data.options.some((opt) => opt.isCorrect || opt.optionId === data.correctOptionId);
      if (!hasCorrect && data.questionType !== 'Numerical') {
        throw new AppError('Question must have at least one correct option.', 400, 'INVALID_QUESTION_OPTIONS');
      }
    }

    return await this.questionRepo.create(data);
  }

  public async getQuestionById(id: string): Promise<IQuestionBankDocument> {
    const question = await this.questionRepo.findById(id);
    if (!question) {
      throw new AppError(`Question not found with id '${id}'.`, 404, 'QUESTION_NOT_FOUND');
    }
    return question;
  }

  public async getQuestions(
    query: {
      subjectId?: string;
      chapterId?: string;
      topicId?: string;
      difficultyLevel?: string;
      questionType?: string;
      examType?: string;
    } & IPaginationOptions
  ): Promise<IPaginatedResult<IQuestionBankDocument>> {
    const { page = 1, limit = 20, sort = 'createdAt', order = 'desc', search, subjectId, chapterId, topicId, difficultyLevel, questionType, examType } = query;
    const filter: FilterQuery<IQuestionBankDocument> = {};

    if (subjectId) filter.subjectId = subjectId;
    if (chapterId) filter.chapterId = chapterId;
    if (topicId) filter.topicId = topicId;
    if (difficultyLevel) filter.difficultyLevel = difficultyLevel;
    if (questionType) filter.questionType = questionType;
    if (examType) filter.examType = examType;

    const items = await this.questionRepo.find(filter, { page, limit, sort, order, search });
    const total = await this.questionRepo.count(filter, search);
    const totalPages = Math.ceil(total / limit) || 1;

    return {
      items,
      pagination: {
        total,
        page,
        limit,
        totalPages,
      },
    };
  }

  public async updateQuestion(id: string, updateData: Partial<IQuestionBankDocument>): Promise<IQuestionBankDocument> {
    const existing = await this.questionRepo.findById(id);
    if (!existing) {
      throw new AppError(`Question not found with id '${id}'.`, 404, 'QUESTION_NOT_FOUND');
    }

    const updated = await this.questionRepo.updateById(id, updateData);
    if (!updated) {
      throw new AppError('Failed to update question.', 500, 'UPDATE_FAILED');
    }
    return updated;
  }

  public async deleteQuestion(id: string): Promise<boolean> {
    const existing = await this.questionRepo.findById(id);
    if (!existing) {
      throw new AppError(`Question not found with id '${id}'.`, 404, 'QUESTION_NOT_FOUND');
    }

    const result = await this.questionRepo.softDelete(id);
    return result !== null;
  }
}

export class MockTestService {
  constructor(
    private mockTestRepo: MockTestRepository = mockTestRepository,
    private questionRepo: QuestionBankRepository = questionBankRepository
  ) {}

  public async createMockTest(data: Partial<IMockTestDocument>): Promise<IMockTestDocument> {
    if (data.questions && data.questions.length > 0) {
      for (const q of data.questions) {
        const questionDoc = await this.questionRepo.findById(q.questionId.toString());
        if (!questionDoc) {
          throw new AppError(`Question with id '${q.questionId}' not found in Question Bank.`, 404, 'QUESTION_NOT_FOUND');
        }
      }
    }

    return await this.mockTestRepo.create(data);
  }

  public async getMockTestById(id: string, populateQuestions: boolean = false): Promise<IMockTestDocument> {
    const mockTest = await this.mockTestRepo.findById(id, populateQuestions);
    if (!mockTest) {
      throw new AppError(`Mock test not found with id '${id}'.`, 404, 'MOCK_TEST_NOT_FOUND');
    }
    return mockTest;
  }

  public async getMockTests(
    query: {
      examType?: string;
      isPublished?: boolean;
    } & IPaginationOptions
  ): Promise<IPaginatedResult<IMockTestDocument>> {
    const { page = 1, limit = 20, sort = 'createdAt', order = 'desc', search, examType, isPublished } = query;
    const filter: FilterQuery<IMockTestDocument> = {};

    if (examType) filter.examType = examType;
    if (isPublished !== undefined) filter.isPublished = isPublished;

    const items = await this.mockTestRepo.find(filter, { page, limit, sort, order, search });
    const total = await this.mockTestRepo.count(filter, search);
    const totalPages = Math.ceil(total / limit) || 1;

    return {
      items,
      pagination: {
        total,
        page,
        limit,
        totalPages,
      },
    };
  }

  public async updateMockTest(id: string, updateData: Partial<IMockTestDocument>): Promise<IMockTestDocument> {
    const existing = await this.mockTestRepo.findById(id);
    if (!existing) {
      throw new AppError(`Mock test not found with id '${id}'.`, 404, 'MOCK_TEST_NOT_FOUND');
    }

    if (updateData.questions && updateData.questions.length > 0) {
      for (const q of updateData.questions) {
        const questionDoc = await this.questionRepo.findById(q.questionId.toString());
        if (!questionDoc) {
          throw new AppError(`Question with id '${q.questionId}' not found in Question Bank.`, 404, 'QUESTION_NOT_FOUND');
        }
      }
    }

    const updated = await this.mockTestRepo.updateById(id, updateData);
    if (!updated) {
      throw new AppError('Failed to update mock test.', 500, 'UPDATE_FAILED');
    }
    return updated;
  }

  public async deleteMockTest(id: string): Promise<boolean> {
    const existing = await this.mockTestRepo.findById(id);
    if (!existing) {
      throw new AppError(`Mock test not found with id '${id}'.`, 404, 'MOCK_TEST_NOT_FOUND');
    }

    const result = await this.mockTestRepo.softDelete(id);
    return result !== null;
  }
}

export class TestAttemptService {
  constructor(
    private attemptRepo: TestAttemptRepository = testAttemptRepository,
    private mockTestRepo: MockTestRepository = mockTestRepository,
    private questionRepo: QuestionBankRepository = questionBankRepository
  ) {}

  public async startTest(userId: string, mockTestId: string): Promise<{ attempt: ITestAttemptDocument; mockTest: IMockTestDocument }> {
    const mockTest = await this.mockTestRepo.findById(mockTestId, true);
    if (!mockTest) {
      throw new AppError(`Mock test not found with id '${mockTestId}'.`, 404, 'MOCK_TEST_NOT_FOUND');
    }

    if (!mockTest.isPublished) {
      throw new AppError('This mock test is not published yet.', 403, 'TEST_NOT_PUBLISHED');
    }

    let existingAttempt = await this.attemptRepo.findOne({ userId, mockTestId, status: 'In_Progress' });
    if (existingAttempt) {
      return { attempt: existingAttempt, mockTest };
    }

    const newAttempt = await this.attemptRepo.create({
      userId: userId as any,
      mockTestId: mockTestId as any,
      status: 'In_Progress',
      startTime: new Date(),
      responses: [],
    });

    return { attempt: newAttempt, mockTest };
  }

  public async saveDraft(
    userId: string,
    mockTestId: string,
    payload: { durationSpentSeconds?: number; responses?: any[] }
  ): Promise<ITestAttemptDocument> {
    const attempt = await this.attemptRepo.findOne({ userId, mockTestId, status: 'In_Progress' });
    if (!attempt) {
      throw new AppError('No active test attempt found for this mock test.', 404, 'NO_ACTIVE_ATTEMPT');
    }

    const updateData: Partial<ITestAttemptDocument> = {};
    if (payload.durationSpentSeconds !== undefined) {
      updateData.durationSpentSeconds = payload.durationSpentSeconds;
    }
    if (payload.responses && Array.isArray(payload.responses)) {
      updateData.responses = payload.responses.map((r) => ({
        questionId: r.questionId,
        selectedOptionId: r.selectedOptionId || r.selectedOption || '',
        numericalAnswer: r.numericalAnswer,
        timeSpentSeconds: r.timeSpentSeconds || 0,
        status: r.status || (r.selectedOptionId || r.selectedOption ? 'Answered' : 'Unanswered'),
        isCorrect: false,
        marksObtained: 0,
      }));
    }

    const updated = await this.attemptRepo.updateById(attempt._id.toString(), updateData);
    if (!updated) {
      throw new AppError('Failed to save draft attempt.', 500, 'SAVE_DRAFT_FAILED');
    }
    return updated;
  }

  public async resumeTest(userId: string, mockTestId: string): Promise<{ attempt: ITestAttemptDocument; mockTest: IMockTestDocument }> {
    const attempt = await this.attemptRepo.findOne({ userId, mockTestId, status: 'In_Progress' });
    if (!attempt) {
      throw new AppError('No saved in-progress draft found for this mock test.', 404, 'NO_SAVED_DRAFT');
    }

    const mockTest = await this.mockTestRepo.findById(mockTestId, true);
    if (!mockTest) {
      throw new AppError(`Mock test not found with id '${mockTestId}'.`, 404, 'MOCK_TEST_NOT_FOUND');
    }

    return { attempt, mockTest };
  }

  public async submitTest(
    userId: string,
    mockTestId: string,
    payload: { durationSpentSeconds?: number; answers?: any[]; responses?: any[] }
  ): Promise<{
    attemptId: string;
    score: number;
    accuracy: number;
    totalCorrect: number;
    totalIncorrect: number;
    totalUnanswered: number;
    durationSpentSeconds: number;
    status: string;
  }> {
    let attempt = await this.attemptRepo.findOne({ userId, mockTestId, status: 'In_Progress' });

    if (!attempt) {
      const submitted = await this.attemptRepo.findOne({ userId, mockTestId, status: 'Submitted' });
      if (submitted) {
        return {
          attemptId: submitted._id.toString(),
          score: submitted.score,
          accuracy: submitted.accuracyPercentage,
          totalCorrect: submitted.totalCorrect,
          totalIncorrect: submitted.totalIncorrect,
          totalUnanswered: submitted.totalUnanswered,
          durationSpentSeconds: submitted.durationSpentSeconds,
          status: submitted.status,
        };
      }
      throw new AppError('No active test attempt found to submit.', 404, 'NO_ACTIVE_ATTEMPT');
    }

    const mockTest = await this.mockTestRepo.findById(mockTestId, true);
    if (!mockTest) {
      throw new AppError(`Mock test not found with id '${mockTestId}'.`, 404, 'MOCK_TEST_NOT_FOUND');
    }

    const submittedResponses = payload.answers || payload.responses || [];
    const responseMap = new Map<string, any>();
    submittedResponses.forEach((resItem) => {
      if (resItem.questionId) {
        responseMap.set(resItem.questionId.toString(), resItem);
      }
    });

    attempt.responses.forEach((draftRes) => {
      const qIdStr = draftRes.questionId.toString();
      if (!responseMap.has(qIdStr)) {
        responseMap.set(qIdStr, draftRes);
      }
    });

    let score = 0;
    let totalCorrect = 0;
    let totalIncorrect = 0;
    let totalUnanswered = 0;
    const finalResponses: ITestQuestionResponse[] = [];

    for (const testQuestionItem of mockTest.questions) {
      const rawQId = (testQuestionItem.questionId as any)._id || testQuestionItem.questionId;
      const questionIdStr = rawQId.toString();
      const userResponse = responseMap.get(questionIdStr);

      let questionDoc: IQuestionBankDocument | null = null;
      if ((testQuestionItem.questionId as any).questionText) {
        questionDoc = testQuestionItem.questionId as unknown as IQuestionBankDocument;
      } else {
        questionDoc = await this.questionRepo.findById(questionIdStr);
      }

      const positiveMarks = testQuestionItem.marks || (questionDoc ? questionDoc.marks : 4);
      const negativeMarks = testQuestionItem.negativeMarks !== undefined ? testQuestionItem.negativeMarks : (questionDoc ? questionDoc.negativeMarks : 1);

      const selectedOptId = userResponse ? (userResponse.selectedOptionId || userResponse.selectedOption || '') : '';
      const numAnswer = userResponse ? userResponse.numericalAnswer : undefined;
      const timeSpent = userResponse ? userResponse.timeSpentSeconds || 0 : 0;

      let isCorrect = false;
      let marksObtained = 0;
      let statusVal: 'Answered' | 'Unanswered' | 'Marked_For_Review' | 'Answered_And_Marked_For_Review' = 'Unanswered';

      const hasAnsweredChoice = selectedOptId && selectedOptId.trim() !== '';
      const hasAnsweredNumerical = numAnswer !== undefined && numAnswer !== null;

      if (hasAnsweredChoice || hasAnsweredNumerical) {
        statusVal = 'Answered';
        if (questionDoc) {
          if (questionDoc.questionType === 'Numerical') {
            isCorrect = numAnswer === Number(questionDoc.correctOptionId);
          } else {
            const correctOpt = questionDoc.options.find((o) => o.isCorrect || o.optionId === questionDoc?.correctOptionId);
            if (correctOpt) {
              isCorrect = selectedOptId === correctOpt.optionId;
            } else if (questionDoc.correctOptionId) {
              isCorrect = selectedOptId === questionDoc.correctOptionId;
            }
          }
        }

        if (isCorrect) {
          marksObtained = positiveMarks;
          score += positiveMarks;
          totalCorrect++;
        } else {
          marksObtained = -negativeMarks;
          score += marksObtained;
          totalIncorrect++;
        }
      } else {
        statusVal = 'Unanswered';
        marksObtained = 0;
        totalUnanswered++;
      }

      finalResponses.push({
        questionId: testQuestionItem.questionId,
        selectedOptionId: selectedOptId,
        numericalAnswer: numAnswer,
        isCorrect,
        marksObtained,
        timeSpentSeconds: timeSpent,
        status: statusVal,
      });
    }

    const totalAttempted = totalCorrect + totalIncorrect;
    const accuracyPercentage = totalAttempted > 0 ? Math.round((totalCorrect / totalAttempted) * 10000) / 100 : 0;
    const endTime = new Date();
    const durationSpentSeconds = payload.durationSpentSeconds || Math.max(1, Math.round((endTime.getTime() - attempt.startTime.getTime()) / 1000));

    const updatedAttempt = await this.attemptRepo.updateById(attempt._id.toString(), {
      status: 'Submitted',
      endTime,
      durationSpentSeconds,
      responses: finalResponses,
      score,
      totalCorrect,
      totalIncorrect,
      totalUnanswered,
      accuracyPercentage,
    });

    if (!updatedAttempt) {
      throw new AppError('Failed to submit test attempt.', 500, 'SUBMIT_FAILED');
    }

    this.triggerAnalyticsGeneration(updatedAttempt);

    return {
      attemptId: updatedAttempt._id.toString(),
      score: updatedAttempt.score,
      accuracy: updatedAttempt.accuracyPercentage,
      totalCorrect: updatedAttempt.totalCorrect,
      totalIncorrect: updatedAttempt.totalIncorrect,
      totalUnanswered: updatedAttempt.totalUnanswered,
      durationSpentSeconds: updatedAttempt.durationSpentSeconds,
      status: updatedAttempt.status,
    };
  }

  public triggerAnalyticsGeneration(attempt: ITestAttemptDocument): void {
    logger.info(`[ANALYTICS TRIGGER] Test attempt ${attempt._id} submitted for user ${attempt.userId}. Async analytics queued.`);
  }

  public async getUserTestAttempts(userId: string, query: IPaginationOptions = {}): Promise<IPaginatedResult<ITestAttemptDocument>> {
    const { page = 1, limit = 20, sort = 'createdAt', order = 'desc' } = query;
    const filter = { userId };
    const items = await this.attemptRepo.find(filter, { page, limit, sort, order });
    const total = await this.attemptRepo.count(filter);
    const totalPages = Math.ceil(total / limit) || 1;

    return {
      items,
      pagination: {
        total,
        page,
        limit,
        totalPages,
      },
    };
  }

  public async getTestAttemptById(userId: string, attemptId: string, userRole: string): Promise<ITestAttemptDocument> {
    const attempt = await this.attemptRepo.findById(attemptId);
    if (!attempt) {
      throw new AppError(`Test attempt not found with id '${attemptId}'.`, 404, 'ATTEMPT_NOT_FOUND');
    }

    if (userRole !== 'Admin' && attempt.userId.toString() !== userId) {
      throw new AppError('Access denied to this test attempt.', 403, 'AUTH_FORBIDDEN');
    }

    return attempt;
  }
}

export const questionBankService = new QuestionBankService();
export const mockTestService = new MockTestService();
export const testAttemptService = new TestAttemptService();
