import { Response, NextFunction } from 'express';
import { AuthenticatedRequest } from '../../../middleware/auth.middleware';
import {
  questionBankService,
  mockTestService,
  testAttemptService,
  QuestionBankService,
  MockTestService,
  TestAttemptService,
} from '../services/assessment.service';
import { ApiResponse } from '../../../utils/api-response';

export class QuestionBankController {
  constructor(private questionSvc: QuestionBankService = questionBankService) {}

  public getQuestions = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const result = await this.questionSvc.getQuestions(req.query as any);
      ApiResponse.success(res, 'Questions retrieved successfully.', result);
    } catch (error) {
      next(error);
    }
  };

  public getQuestionById = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const question = await this.questionSvc.getQuestionById(req.params.questionId);
      ApiResponse.success(res, 'Question retrieved successfully.', question);
    } catch (error) {
      next(error);
    }
  };

  public createQuestion = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const question = await this.questionSvc.createQuestion(req.body);
      ApiResponse.success(res, 'Question created successfully.', question, 201);
    } catch (error) {
      next(error);
    }
  };

  public updateQuestion = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const question = await this.questionSvc.updateQuestion(req.params.questionId, req.body);
      ApiResponse.success(res, 'Question updated successfully.', question);
    } catch (error) {
      next(error);
    }
  };

  public deleteQuestion = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      await this.questionSvc.deleteQuestion(req.params.questionId);
      ApiResponse.success(res, 'Question deleted successfully.');
    } catch (error) {
      next(error);
    }
  };
}

export class MockTestController {
  constructor(private mockTestSvc: MockTestService = mockTestService) {}

  public getMockTests = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const queryParams = { ...req.query };
      if (req.user?.role !== 'Admin') {
        queryParams.isPublished = 'true' as any;
      }
      const result = await this.mockTestSvc.getMockTests(queryParams as any);
      ApiResponse.success(res, 'Mock tests retrieved successfully.', result);
    } catch (error) {
      next(error);
    }
  };

  public getMockTestById = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const mockTest = await this.mockTestSvc.getMockTestById(req.params.mockTestId, true);
      ApiResponse.success(res, 'Mock test retrieved successfully.', mockTest);
    } catch (error) {
      next(error);
    }
  };

  public createMockTest = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const payload = {
        ...req.body,
        createdBy: req.user?.userId,
      };
      const mockTest = await this.mockTestSvc.createMockTest(payload);
      ApiResponse.success(res, 'Mock test created successfully.', mockTest, 201);
    } catch (error) {
      next(error);
    }
  };

  public updateMockTest = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const mockTest = await this.mockTestSvc.updateMockTest(req.params.mockTestId, req.body);
      ApiResponse.success(res, 'Mock test updated successfully.', mockTest);
    } catch (error) {
      next(error);
    }
  };

  public deleteMockTest = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      await this.mockTestSvc.deleteMockTest(req.params.mockTestId);
      ApiResponse.success(res, 'Mock test deleted successfully.');
    } catch (error) {
      next(error);
    }
  };
}

export class TestAttemptController {
  constructor(private attemptSvc: TestAttemptService = testAttemptService) {}

  public startTest = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const userId = req.user!.userId;
      const mockTestId = req.params.mockTestId;
      const result = await this.attemptSvc.startTest(userId, mockTestId);
      ApiResponse.success(res, 'Test started successfully.', result);
    } catch (error) {
      next(error);
    }
  };

  public saveDraft = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const userId = req.user!.userId;
      const mockTestId = req.params.mockTestId;
      const updatedAttempt = await this.attemptSvc.saveDraft(userId, mockTestId, req.body);
      ApiResponse.success(res, 'Draft saved successfully.', updatedAttempt);
    } catch (error) {
      next(error);
    }
  };

  public resumeTest = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const userId = req.user!.userId;
      const mockTestId = req.params.mockTestId;
      const result = await this.attemptSvc.resumeTest(userId, mockTestId);
      ApiResponse.success(res, 'Test attempt resumed successfully.', result);
    } catch (error) {
      next(error);
    }
  };

  public submitTest = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const userId = req.user!.userId;
      const mockTestId = req.params.mockTestId;
      const result = await this.attemptSvc.submitTest(userId, mockTestId, req.body);
      ApiResponse.success(res, 'Test submitted successfully.', result);
    } catch (error) {
      next(error);
    }
  };

  public getUserTestAttempts = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const userId = req.user!.userId;
      const result = await this.attemptSvc.getUserTestAttempts(userId, req.query as any);
      ApiResponse.success(res, 'Test attempts retrieved successfully.', result);
    } catch (error) {
      next(error);
    }
  };

  public getTestAttemptById = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const userId = req.user!.userId;
      const userRole = req.user!.role;
      const attempt = await this.attemptSvc.getTestAttemptById(userId, req.params.attemptId, userRole);
      ApiResponse.success(res, 'Test attempt details retrieved successfully.', attempt);
    } catch (error) {
      next(error);
    }
  };
}

export const questionBankController = new QuestionBankController();
export const mockTestController = new MockTestController();
export const testAttemptController = new TestAttemptController();
