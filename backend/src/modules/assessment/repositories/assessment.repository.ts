import { QuestionBankModel, IQuestionBankDocument } from '../models/question-bank.model';
import { MockTestModel, IMockTestDocument } from '../models/mock-test.model';
import { TestAttemptModel, ITestAttemptDocument } from '../models/test-attempt.model';
import { FilterQuery, UpdateQuery } from 'mongoose';

export interface IPaginationOptions {
  page?: number;
  limit?: number;
  sort?: string;
  order?: 'asc' | 'desc';
  search?: string;
}

export class QuestionBankRepository {
  public async create(data: Partial<IQuestionBankDocument>): Promise<IQuestionBankDocument> {
    const question = new QuestionBankModel(data);
    return await question.save();
  }

  public async findById(id: string): Promise<IQuestionBankDocument | null> {
    return await QuestionBankModel.findOne({ _id: id, isDeleted: { $ne: true } }).exec();
  }

  public async find(filter: FilterQuery<IQuestionBankDocument> = {}, options: IPaginationOptions = {}): Promise<IQuestionBankDocument[]> {
    const { page = 1, limit = 20, sort = 'createdAt', order = 'desc', search } = options;
    const queryFilter: FilterQuery<IQuestionBankDocument> = { ...filter, isDeleted: { $ne: true } };

    if (search) {
      queryFilter.$or = [
        { questionText: { $regex: search, $options: 'i' } },
        { tags: { $regex: search, $options: 'i' } },
        { previousYearExam: { $regex: search, $options: 'i' } },
      ];
    }

    const sortOrder = order === 'desc' ? -1 : 1;
    const skip = (page - 1) * limit;

    return await QuestionBankModel.find(queryFilter)
      .sort({ [sort]: sortOrder })
      .skip(skip)
      .limit(limit)
      .exec();
  }

  public async count(filter: FilterQuery<IQuestionBankDocument> = {}, search?: string): Promise<number> {
    const queryFilter: FilterQuery<IQuestionBankDocument> = { ...filter, isDeleted: { $ne: true } };

    if (search) {
      queryFilter.$or = [
        { questionText: { $regex: search, $options: 'i' } },
        { tags: { $regex: search, $options: 'i' } },
        { previousYearExam: { $regex: search, $options: 'i' } },
      ];
    }

    return await QuestionBankModel.countDocuments(queryFilter).exec();
  }

  public async updateById(id: string, updateData: UpdateQuery<IQuestionBankDocument>): Promise<IQuestionBankDocument | null> {
    return await QuestionBankModel.findOneAndUpdate(
      { _id: id, isDeleted: { $ne: true } },
      updateData,
      { new: true, runValidators: true }
    ).exec();
  }

  public async softDelete(id: string): Promise<IQuestionBankDocument | null> {
    return await QuestionBankModel.findByIdAndUpdate(
      id,
      { isDeleted: true, deletedAt: new Date() },
      { new: true }
    ).exec();
  }
}

export class MockTestRepository {
  public async create(data: Partial<IMockTestDocument>): Promise<IMockTestDocument> {
    const mockTest = new MockTestModel(data);
    return await mockTest.save();
  }

  public async findById(id: string, populateQuestions: boolean = false): Promise<IMockTestDocument | null> {
    const query = MockTestModel.findOne({ _id: id, isDeleted: { $ne: true } });
    if (populateQuestions) {
      query.populate('questions.questionId');
    }
    return await query.exec();
  }

  public async find(filter: FilterQuery<IMockTestDocument> = {}, options: IPaginationOptions = {}): Promise<IMockTestDocument[]> {
    const { page = 1, limit = 20, sort = 'createdAt', order = 'desc', search } = options;
    const queryFilter: FilterQuery<IMockTestDocument> = { ...filter, isDeleted: { $ne: true } };

    if (search) {
      queryFilter.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
      ];
    }

    const sortOrder = order === 'desc' ? -1 : 1;
    const skip = (page - 1) * limit;

    return await MockTestModel.find(queryFilter)
      .sort({ [sort]: sortOrder })
      .skip(skip)
      .limit(limit)
      .exec();
  }

  public async count(filter: FilterQuery<IMockTestDocument> = {}, search?: string): Promise<number> {
    const queryFilter: FilterQuery<IMockTestDocument> = { ...filter, isDeleted: { $ne: true } };

    if (search) {
      queryFilter.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
      ];
    }

    return await MockTestModel.countDocuments(queryFilter).exec();
  }

  public async updateById(id: string, updateData: UpdateQuery<IMockTestDocument>): Promise<IMockTestDocument | null> {
    return await MockTestModel.findOneAndUpdate(
      { _id: id, isDeleted: { $ne: true } },
      updateData,
      { new: true, runValidators: true }
    ).exec();
  }

  public async softDelete(id: string): Promise<IMockTestDocument | null> {
    return await MockTestModel.findByIdAndUpdate(
      id,
      { isDeleted: true, deletedAt: new Date() },
      { new: true }
    ).exec();
  }
}

export class TestAttemptRepository {
  public async create(data: Partial<ITestAttemptDocument>): Promise<ITestAttemptDocument> {
    const attempt = new TestAttemptModel(data);
    return await attempt.save();
  }

  public async findById(id: string): Promise<ITestAttemptDocument | null> {
    return await TestAttemptModel.findById(id).populate('mockTestId').exec();
  }

  public async findOne(filter: FilterQuery<ITestAttemptDocument>): Promise<ITestAttemptDocument | null> {
    return await TestAttemptModel.findOne(filter).exec();
  }

  public async find(filter: FilterQuery<ITestAttemptDocument> = {}, options: IPaginationOptions = {}): Promise<ITestAttemptDocument[]> {
    const { page = 1, limit = 20, sort = 'createdAt', order = 'desc' } = options;
    const sortOrder = order === 'desc' ? -1 : 1;
    const skip = (page - 1) * limit;

    return await TestAttemptModel.find(filter)
      .populate('mockTestId', 'title examType totalDurationMinutes totalMarks')
      .sort({ [sort]: sortOrder })
      .skip(skip)
      .limit(limit)
      .exec();
  }

  public async count(filter: FilterQuery<ITestAttemptDocument> = {}): Promise<number> {
    return await TestAttemptModel.countDocuments(filter).exec();
  }

  public async findByUserId(userId: string): Promise<ITestAttemptDocument[]> {
    return await TestAttemptModel.find({ userId })
      .populate('mockTestId', 'title examType totalDurationMinutes totalMarks')
      .sort({ createdAt: -1 })
      .exec();
  }

  public async updateById(id: string, updateData: UpdateQuery<ITestAttemptDocument>): Promise<ITestAttemptDocument | null> {
    return await TestAttemptModel.findByIdAndUpdate(id, updateData, { new: true, runValidators: true }).exec();
  }
}

export const questionBankRepository = new QuestionBankRepository();
export const mockTestRepository = new MockTestRepository();
export const testAttemptRepository = new TestAttemptRepository();
