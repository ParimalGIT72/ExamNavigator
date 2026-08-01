import { QuestionBankModel, IQuestionBankDocument } from '../models/question-bank.model';
import { MockTestModel, IMockTestDocument } from '../models/mock-test.model';
import { TestAttemptModel, ITestAttemptDocument } from '../models/test-attempt.model';
import { FilterQuery, UpdateQuery } from 'mongoose';

export class QuestionBankRepository {
  public async create(data: Partial<IQuestionBankDocument>): Promise<IQuestionBankDocument> {
    const question = new QuestionBankModel(data);
    return await question.save();
  }

  public async findById(id: string): Promise<IQuestionBankDocument | null> {
    return await QuestionBankModel.findOne({ _id: id, isDeleted: { $ne: true } }).exec();
  }

  public async find(filter: FilterQuery<IQuestionBankDocument> = {}): Promise<IQuestionBankDocument[]> {
    const queryFilter = { ...filter, isDeleted: { $ne: true } };
    return await QuestionBankModel.find(queryFilter).exec();
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

  public async findById(id: string): Promise<IMockTestDocument | null> {
    return await MockTestModel.findOne({ _id: id, isDeleted: { $ne: true } })
      .populate('questions.questionId')
      .exec();
  }

  public async findPublished(examType?: string): Promise<IMockTestDocument[]> {
    const filter: FilterQuery<IMockTestDocument> = { isPublished: true, isDeleted: { $ne: true } };
    if (examType) filter.examType = examType as any;
    return await MockTestModel.find(filter).sort({ createdAt: -1 }).exec();
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
    return await TestAttemptModel.findById(id).exec();
  }

  public async findByUserId(userId: string): Promise<ITestAttemptDocument[]> {
    return await TestAttemptModel.find({ userId }).sort({ createdAt: -1 }).exec();
  }

  public async updateById(id: string, updateData: UpdateQuery<ITestAttemptDocument>): Promise<ITestAttemptDocument | null> {
    return await TestAttemptModel.findByIdAndUpdate(id, updateData, { new: true }).exec();
  }
}

export const questionBankRepository = new QuestionBankRepository();
export const mockTestRepository = new MockTestRepository();
export const testAttemptRepository = new TestAttemptRepository();
