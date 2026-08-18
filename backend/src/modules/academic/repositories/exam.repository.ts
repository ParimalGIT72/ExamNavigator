import { ExamModel, IExamDocument } from '../models/exam.model';
import { FilterQuery, UpdateQuery } from 'mongoose';

export interface IExamPaginationOptions {
  page?: number;
  limit?: number;
  sort?: string;
  order?: 'asc' | 'desc';
  search?: string;
}

export class ExamRepository {
  public async create(data: Partial<IExamDocument>): Promise<IExamDocument> {
    const exam = new ExamModel(data);
    return await exam.save();
  }

  public async findById(id: string): Promise<IExamDocument | null> {
    return await ExamModel.findById(id).exec();
  }

  public async findByCode(code: string): Promise<IExamDocument | null> {
    return await ExamModel.findOne({ code: code.toUpperCase() }).exec();
  }

  public async find(filter: FilterQuery<IExamDocument> = {}, options: IExamPaginationOptions = {}): Promise<IExamDocument[]> {
    const { page = 1, limit = 50, sort = 'order', order = 'asc', search } = options;
    const queryFilter: FilterQuery<IExamDocument> = { ...filter };

    if (search) {
      queryFilter.$or = [
        { name: { $regex: search, $options: 'i' } },
        { code: { $regex: search, $options: 'i' } },
        { category: { $regex: search, $options: 'i' } },
      ];
    }

    const sortOrder = order === 'desc' ? -1 : 1;
    const skip = (page - 1) * limit;

    return await ExamModel.find(queryFilter)
      .sort({ [sort]: sortOrder })
      .skip(skip)
      .limit(limit)
      .exec();
  }

  public async count(filter: FilterQuery<IExamDocument> = {}, search?: string): Promise<number> {
    const queryFilter: FilterQuery<IExamDocument> = { ...filter };
    if (search) {
      queryFilter.$or = [
        { name: { $regex: search, $options: 'i' } },
        { code: { $regex: search, $options: 'i' } },
        { category: { $regex: search, $options: 'i' } },
      ];
    }
    return await ExamModel.countDocuments(queryFilter).exec();
  }

  public async updateById(id: string, updateData: UpdateQuery<IExamDocument>): Promise<IExamDocument | null> {
    return await ExamModel.findByIdAndUpdate(id, updateData, { new: true, runValidators: true }).exec();
  }

  public async deleteById(id: string): Promise<boolean> {
    const result = await ExamModel.findByIdAndDelete(id).exec();
    return result !== null;
  }
}

export const examRepository = new ExamRepository();
