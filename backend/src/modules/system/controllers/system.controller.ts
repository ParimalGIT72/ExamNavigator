import { Request, Response } from 'express';
import { ApiResponse } from '../../../utils/api-response';

export class SystemController {
  public getHealth(_req: Request, res: Response): void {
    ApiResponse.success(res, 'ExamNavigator API is healthy', {
      status: 'UP',
      timestamp: new Date().toISOString(),
      service: 'examnavigator-backend',
    });
  }
}

export const systemController = new SystemController();
