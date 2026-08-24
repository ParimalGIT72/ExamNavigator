import { Request, Response, NextFunction } from 'express';
import { progressService, ProgressService } from '../services/progress.service';
import { IUserContext } from '../../academic/services/academic.service';
import { ApiResponse } from '../../../utils/api-response';
import { AppError } from '../../../utils/app-error';

const getUserContext = (req: Request): IUserContext => {
  const user = (req as any).user;
  if (!user || !user.userId) {
    throw new AppError('Authentication required.', 401, 'UNAUTHORIZED');
  }
  return {
    userId: user.userId,
    role: user.role || 'Student',
    targetExam: (req as any).academicContext?.targetExam,
  };
};

export class ProgressController {
  constructor(private progressSvc: ProgressService = progressService) {}

  /**
   * PUT /api/v1/progress/topics/:topicId
   */
  public updateTopicProgress = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const userContext = getUserContext(req);
      const { topicId } = req.params;
      const { status } = req.body;

      const result = await this.progressSvc.updateTopicProgress(
        topicId,
        status,
        userContext.userId,
        userContext
      );

      ApiResponse.success(res, 'Topic progress updated.', result);
    } catch (error) {
      next(error);
    }
  };

  /**
   * GET /api/v1/progress/topics/:topicId
   */
  public getTopicProgress = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const userContext = getUserContext(req);
      const { topicId } = req.params;

      const result = await this.progressSvc.getTopicProgress(
        topicId,
        userContext.userId,
        userContext
      );

      ApiResponse.success(res, 'Topic progress retrieved.', result);
    } catch (error) {
      next(error);
    }
  };

  /**
   * GET /api/v1/progress/summary
   */
  public getProgressSummary = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const userContext = getUserContext(req);

      const result = await this.progressSvc.getProgressSummary(
        userContext.userId,
        userContext
      );

      ApiResponse.success(res, 'Progress summary retrieved.', result);
    } catch (error) {
      next(error);
    }
  };

  /**
   * GET /api/v1/progress/analytics
   */
  public getProgressAnalytics = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const userContext = getUserContext(req);

      const result = await this.progressSvc.getProgressAnalytics(
        userContext.userId,
        userContext
      );

      ApiResponse.success(res, 'Progress analytics retrieved successfully.', result);
    } catch (error) {
      next(error);
    }
  };

  /**
   * GET /api/v1/progress/activity
   */
  public getLearningActivity = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const userContext = getUserContext(req);

      const result = await this.progressSvc.getLearningActivity(
        userContext.userId,
        userContext
      );

      ApiResponse.success(res, 'Learning activity and consistency retrieved successfully.', result);
    } catch (error) {
      next(error);
    }
  };
}

export const progressController = new ProgressController();
