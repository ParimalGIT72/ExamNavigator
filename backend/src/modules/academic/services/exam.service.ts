import { examRepository, ExamRepository, IExamPaginationOptions } from '../repositories/exam.repository';
import { IExamDocument } from '../models/exam.model';
import { SubjectModel } from '../models/subject.model';
import { AppError } from '../../../utils/app-error';
import { FilterQuery } from 'mongoose';

export interface IPaginatedExamsResult {
  items: IExamDocument[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export class ExamService {
  constructor(private examRepo: ExamRepository = examRepository) {}

  public async createExam(data: Partial<IExamDocument>): Promise<IExamDocument> {
    if (!data.code) {
      throw new AppError('Exam code is required.', 400, 'MISSING_EXAM_CODE');
    }

    const uppercaseCode = data.code.toUpperCase().trim();
    const existing = await this.examRepo.findByCode(uppercaseCode);
    if (existing) {
      throw new AppError(`Exam with code '${uppercaseCode}' already exists.`, 409, 'EXAM_CODE_EXISTS');
    }

    return await this.examRepo.create({
      ...data,
      code: uppercaseCode,
    });
  }

  public async getExamById(id: string): Promise<IExamDocument> {
    const exam = await this.examRepo.findById(id);
    if (!exam) {
      throw new AppError(`Exam not found with id '${id}'.`, 404, 'EXAM_NOT_FOUND');
    }
    return exam;
  }

  public async getExamByCode(code: string): Promise<IExamDocument> {
    const uppercaseCode = code.toUpperCase().trim();
    const exam = await this.examRepo.findByCode(uppercaseCode);
    if (!exam || !exam.isActive) {
      throw new AppError(`Active exam not found for code '${uppercaseCode}'.`, 404, 'EXAM_NOT_FOUND');
    }
    return exam;
  }

  public async getExams(
    query: {
      isActive?: boolean;
      category?: string;
    } & IExamPaginationOptions
  ): Promise<IPaginatedExamsResult> {
    const { page = 1, limit = 50, sort = 'order', order = 'asc', search, isActive, category } = query;
    const filter: FilterQuery<IExamDocument> = {};

    if (isActive !== undefined) {
      filter.isActive = isActive;
    }
    if (category) {
      filter.category = category;
    }

    const items = await this.examRepo.find(filter, { page, limit, sort, order, search });
    const total = await this.examRepo.count(filter, search);
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

  public async updateExam(id: string, updateData: Partial<IExamDocument>): Promise<IExamDocument> {
    const existing = await this.examRepo.findById(id);
    if (!existing) {
      throw new AppError(`Exam not found with id '${id}'.`, 404, 'EXAM_NOT_FOUND');
    }

    if (updateData.code && updateData.code.toUpperCase().trim() !== existing.code) {
      const uppercaseCode = updateData.code.toUpperCase().trim();
      const duplicate = await this.examRepo.findByCode(uppercaseCode);
      if (duplicate) {
        throw new AppError(`Exam with code '${uppercaseCode}' already exists.`, 409, 'EXAM_CODE_EXISTS');
      }
      updateData.code = uppercaseCode;
    }

    const updated = await this.examRepo.updateById(id, updateData);
    if (!updated) {
      throw new AppError('Failed to update exam.', 500, 'UPDATE_FAILED');
    }
    return updated;
  }

  public async deleteExam(id: string): Promise<boolean> {
    const existing = await this.examRepo.findById(id);
    if (!existing) {
      throw new AppError(`Exam not found with id '${id}'.`, 404, 'EXAM_NOT_FOUND');
    }

    const attachedSubjects = await SubjectModel.countDocuments({
      $or: [{ examId: id }, { examType: existing.code }],
    }).exec();

    if (attachedSubjects > 0) {
      throw new AppError(
        `Cannot delete exam '${existing.code}' because ${attachedSubjects} subjects are attached to it.`,
        400,
        'EXAM_HAS_SUBJECTS'
      );
    }

    return await this.examRepo.deleteById(id);
  }
}

export const examService = new ExamService();
