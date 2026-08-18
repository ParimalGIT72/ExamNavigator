import { Request, Response, NextFunction } from 'express';
import { examService, ExamService } from '../services/exam.service';

export class ExamController {
  constructor(private examSvc: ExamService = examService) {}

  public getExams = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const isStudentRole = (req as any).user?.role === 'Student';
      const result = await this.examSvc.getExams({
        ...req.query,
        // Students only receive active exams by default
        isActive: isStudentRole ? true : (req.query as any).isActive,
      });

      res.status(200).json({
        success: true,
        message: 'Exams retrieved successfully.',
        data: result.items,
        pagination: result.pagination,
      });
    } catch (error) {
      next(error);
    }
  };

  public getExamById = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const exam = await this.examSvc.getExamById(req.params.examId);
      res.status(200).json({
        success: true,
        message: 'Exam retrieved successfully.',
        data: exam,
      });
    } catch (error) {
      next(error);
    }
  };

  public createExam = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const exam = await this.examSvc.createExam(req.body);
      res.status(201).json({
        success: true,
        message: 'Exam created successfully.',
        data: exam,
      });
    } catch (error) {
      next(error);
    }
  };

  public updateExam = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const updated = await this.examSvc.updateExam(req.params.examId, req.body);
      res.status(200).json({
        success: true,
        message: 'Exam updated successfully.',
        data: updated,
      });
    } catch (error) {
      next(error);
    }
  };

  public deleteExam = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      await this.examSvc.deleteExam(req.params.examId);
      res.status(200).json({
        success: true,
        message: 'Exam deleted successfully.',
        data: null,
      });
    } catch (error) {
      next(error);
    }
  };
}

export const examController = new ExamController();
