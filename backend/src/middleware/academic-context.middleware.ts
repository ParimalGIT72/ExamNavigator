import { Request, Response, NextFunction } from 'express';
import { subjectService } from '../modules/academic/services/academic.service';

export interface AcademicRequest extends Request {
  academicContext?: {
    targetExam?: {
      examId: string;
      examCode: string;
    };
  };
}

export const attachAcademicContext = async (req: AcademicRequest, _res: Response, next: NextFunction): Promise<void> => {
  try {
    const user = (req as any).user;
    if (user && user.userId && user.role !== 'Admin') {
      const userContext = { userId: user.userId, role: user.role || 'Student' };
      const targetExam = await subjectService.resolveUserTargetExam(userContext);
      if (targetExam) {
        req.academicContext = { targetExam };
      }
    }
    next();
  } catch (error) {
    next(error);
  }
};
