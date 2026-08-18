import { SubjectModel, ISubjectDocument } from '../models/subject.model';
import { ChapterModel, IChapterDocument } from '../models/chapter.model';
import { TopicModel, ITopicDocument } from '../models/topic.model';
import { LearningResourceModel, ILearningResourceDocument } from '../models/learning-resource.model';
import { FilterQuery, UpdateQuery } from 'mongoose';

export interface IPaginationOptions {
  page?: number;
  limit?: number;
  sort?: string;
  order?: 'asc' | 'desc';
  search?: string;
}

export class SubjectRepository {
  public async create(data: Partial<ISubjectDocument>): Promise<ISubjectDocument> {
    const subject = new SubjectModel(data);
    return await subject.save();
  }

  public async findById(id: string): Promise<ISubjectDocument | null> {
    return await SubjectModel.findById(id).exec();
  }

  public async findByName(name: string): Promise<ISubjectDocument | null> {
    return await SubjectModel.findOne({ name: { $regex: new RegExp(`^${name}$`, 'i') } }).exec();
  }

  public async findByCode(code: string): Promise<ISubjectDocument | null> {
    return await SubjectModel.findOne({ code: code.toUpperCase() }).exec();
  }

  public async findByNameAndExam(name: string, examIdentifier: string): Promise<ISubjectDocument | null> {
    const isObjectId = /^[0-9a-fA-F]{24}$/.test(examIdentifier);
    const filter = isObjectId
      ? { name: { $regex: new RegExp(`^${name}$`, 'i') }, examId: examIdentifier }
      : { name: { $regex: new RegExp(`^${name}$`, 'i') }, examType: examIdentifier };
    return await SubjectModel.findOne(filter).exec();
  }

  public async findByCodeAndExam(code: string, examIdentifier: string): Promise<ISubjectDocument | null> {
    const isObjectId = /^[0-9a-fA-F]{24}$/.test(examIdentifier);
    const filter = isObjectId
      ? { code: code.toUpperCase(), examId: examIdentifier }
      : { code: code.toUpperCase(), examType: examIdentifier };
    return await SubjectModel.findOne(filter).exec();
  }

  public async find(filter: FilterQuery<ISubjectDocument> = {}, options: IPaginationOptions = {}): Promise<ISubjectDocument[]> {
    const { page = 1, limit = 20, sort = 'order', order = 'asc', search } = options;
    const queryFilter: FilterQuery<ISubjectDocument> = { ...filter };

    if (search) {
      queryFilter.$or = [
        { name: { $regex: search, $options: 'i' } },
        { code: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
      ];
    }

    const sortOrder = order === 'desc' ? -1 : 1;
    const skip = (page - 1) * limit;

    return await SubjectModel.find(queryFilter)
      .sort({ [sort]: sortOrder })
      .skip(skip)
      .limit(limit)
      .exec();
  }

  public async count(filter: FilterQuery<ISubjectDocument> = {}, search?: string): Promise<number> {
    const queryFilter: FilterQuery<ISubjectDocument> = { ...filter };
    if (search) {
      queryFilter.$or = [
        { name: { $regex: search, $options: 'i' } },
        { code: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
      ];
    }
    return await SubjectModel.countDocuments(queryFilter).exec();
  }

  public async updateById(id: string, updateData: UpdateQuery<ISubjectDocument>): Promise<ISubjectDocument | null> {
    return await SubjectModel.findByIdAndUpdate(id, updateData, { new: true, runValidators: true }).exec();
  }

  public async deleteById(id: string): Promise<boolean> {
    const result = await SubjectModel.findByIdAndDelete(id).exec();
    return result !== null;
  }
}

export class ChapterRepository {
  public async create(data: Partial<IChapterDocument>): Promise<IChapterDocument> {
    const chapter = new ChapterModel(data);
    return await chapter.save();
  }

  public async findById(id: string): Promise<IChapterDocument | null> {
    return await ChapterModel.findById(id).exec();
  }

  public async findBySubjectIdAndNumber(subjectId: string, chapterNumber: number): Promise<IChapterDocument | null> {
    return await ChapterModel.findOne({ subjectId, chapterNumber }).exec();
  }

  public async findBySubjectId(subjectId: string): Promise<IChapterDocument[]> {
    return await ChapterModel.find({ subjectId, isActive: true }).sort({ chapterNumber: 1 }).exec();
  }

  public async find(filter: FilterQuery<IChapterDocument> = {}, options: IPaginationOptions = {}): Promise<IChapterDocument[]> {
    const { page = 1, limit = 20, sort = 'chapterNumber', order = 'asc', search } = options;
    const queryFilter: FilterQuery<IChapterDocument> = { ...filter };

    if (search) {
      queryFilter.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
      ];
    }

    const sortOrder = order === 'desc' ? -1 : 1;
    const skip = (page - 1) * limit;

    return await ChapterModel.find(queryFilter)
      .sort({ [sort]: sortOrder })
      .skip(skip)
      .limit(limit)
      .exec();
  }

  public async count(filter: FilterQuery<IChapterDocument> = {}, search?: string): Promise<number> {
    const queryFilter: FilterQuery<IChapterDocument> = { ...filter };
    if (search) {
      queryFilter.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
      ];
    }
    return await ChapterModel.countDocuments(queryFilter).exec();
  }

  public async updateById(id: string, updateData: UpdateQuery<IChapterDocument>): Promise<IChapterDocument | null> {
    return await ChapterModel.findByIdAndUpdate(id, updateData, { new: true, runValidators: true }).exec();
  }

  public async deleteById(id: string): Promise<boolean> {
    const result = await ChapterModel.findByIdAndDelete(id).exec();
    return result !== null;
  }
}

export class TopicRepository {
  public async create(data: Partial<ITopicDocument>): Promise<ITopicDocument> {
    const topic = new TopicModel(data);
    return await topic.save();
  }

  public async findById(id: string): Promise<ITopicDocument | null> {
    return await TopicModel.findById(id).exec();
  }

  public async findByChapterIdAndNumber(chapterId: string, topicNumber: number): Promise<ITopicDocument | null> {
    return await TopicModel.findOne({ chapterId, topicNumber }).exec();
  }

  public async findByChapterId(chapterId: string): Promise<ITopicDocument[]> {
    return await TopicModel.find({ chapterId }).sort({ topicNumber: 1 }).exec();
  }

  public async find(filter: FilterQuery<ITopicDocument> = {}, options: IPaginationOptions = {}): Promise<ITopicDocument[]> {
    const { page = 1, limit = 20, sort = 'topicNumber', order = 'asc', search } = options;
    const queryFilter: FilterQuery<ITopicDocument> = { ...filter };

    if (search) {
      queryFilter.$or = [
        { title: { $regex: search, $options: 'i' } },
        { summary: { $regex: search, $options: 'i' } },
        { tags: { $regex: search, $options: 'i' } },
      ];
    }

    const sortOrder = order === 'desc' ? -1 : 1;
    const skip = (page - 1) * limit;

    return await TopicModel.find(queryFilter)
      .sort({ [sort]: sortOrder })
      .skip(skip)
      .limit(limit)
      .exec();
  }

  public async count(filter: FilterQuery<ITopicDocument> = {}, search?: string): Promise<number> {
    const queryFilter: FilterQuery<ITopicDocument> = { ...filter };
    if (search) {
      queryFilter.$or = [
        { title: { $regex: search, $options: 'i' } },
        { summary: { $regex: search, $options: 'i' } },
        { tags: { $regex: search, $options: 'i' } },
      ];
    }
    return await TopicModel.countDocuments(queryFilter).exec();
  }

  public async updateById(id: string, updateData: UpdateQuery<ITopicDocument>): Promise<ITopicDocument | null> {
    return await TopicModel.findByIdAndUpdate(id, updateData, { new: true, runValidators: true }).exec();
  }

  public async deleteById(id: string): Promise<boolean> {
    const result = await TopicModel.findByIdAndDelete(id).exec();
    return result !== null;
  }
}

export class LearningResourceRepository {
  public async create(data: Partial<ILearningResourceDocument>): Promise<ILearningResourceDocument> {
    const resource = new LearningResourceModel(data);
    return await resource.save();
  }

  public async findById(id: string): Promise<ILearningResourceDocument | null> {
    return await LearningResourceModel.findById(id).exec();
  }

  public async findByTopicId(topicId: string): Promise<ILearningResourceDocument[]> {
    return await LearningResourceModel.find({ topicId }).exec();
  }

  public async find(filter: FilterQuery<ILearningResourceDocument> = {}, options: IPaginationOptions = {}): Promise<ILearningResourceDocument[]> {
    const { page = 1, limit = 20, sort = 'createdAt', order = 'desc', search } = options;
    const queryFilter: FilterQuery<ILearningResourceDocument> = { ...filter };

    if (search) {
      queryFilter.$or = [
        { title: { $regex: search, $options: 'i' } },
        { author: { $regex: search, $options: 'i' } },
        { textContent: { $regex: search, $options: 'i' } },
      ];
    }

    const sortOrder = order === 'desc' ? -1 : 1;
    const skip = (page - 1) * limit;

    return await LearningResourceModel.find(queryFilter)
      .sort({ [sort]: sortOrder })
      .skip(skip)
      .limit(limit)
      .exec();
  }

  public async count(filter: FilterQuery<ILearningResourceDocument> = {}, search?: string): Promise<number> {
    const queryFilter: FilterQuery<ILearningResourceDocument> = { ...filter };
    if (search) {
      queryFilter.$or = [
        { title: { $regex: search, $options: 'i' } },
        { author: { $regex: search, $options: 'i' } },
        { textContent: { $regex: search, $options: 'i' } },
      ];
    }
    return await LearningResourceModel.countDocuments(queryFilter).exec();
  }

  public async updateById(id: string, updateData: UpdateQuery<ILearningResourceDocument>): Promise<ILearningResourceDocument | null> {
    return await LearningResourceModel.findByIdAndUpdate(id, updateData, { new: true, runValidators: true }).exec();
  }

  public async deleteById(id: string): Promise<boolean> {
    const result = await LearningResourceModel.findByIdAndDelete(id).exec();
    return result !== null;
  }
}

export const subjectRepository = new SubjectRepository();
export const chapterRepository = new ChapterRepository();
export const topicRepository = new TopicRepository();
export const learningResourceRepository = new LearningResourceRepository();
