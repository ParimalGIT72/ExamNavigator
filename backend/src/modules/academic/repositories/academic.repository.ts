import { SubjectModel, ISubjectDocument } from '../models/subject.model';
import { ChapterModel, IChapterDocument } from '../models/chapter.model';
import { TopicModel, ITopicDocument } from '../models/topic.model';
import { LearningResourceModel, ILearningResourceDocument } from '../models/learning-resource.model';
import { FilterQuery, UpdateQuery } from 'mongoose';

export class SubjectRepository {
  public async create(data: Partial<ISubjectDocument>): Promise<ISubjectDocument> {
    const subject = new SubjectModel(data);
    return await subject.save();
  }

  public async findById(id: string): Promise<ISubjectDocument | null> {
    return await SubjectModel.findById(id).exec();
  }

  public async find(filter: FilterQuery<ISubjectDocument> = {}): Promise<ISubjectDocument[]> {
    return await SubjectModel.find(filter).sort({ order: 1 }).exec();
  }

  public async updateById(id: string, updateData: UpdateQuery<ISubjectDocument>): Promise<ISubjectDocument | null> {
    return await SubjectModel.findByIdAndUpdate(id, updateData, { new: true }).exec();
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

  public async findBySubjectId(subjectId: string): Promise<IChapterDocument[]> {
    return await ChapterModel.find({ subjectId, isActive: true }).sort({ chapterNumber: 1 }).exec();
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

  public async findByChapterId(chapterId: string): Promise<ITopicDocument[]> {
    return await TopicModel.find({ chapterId }).sort({ topicNumber: 1 }).exec();
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
}

export const subjectRepository = new SubjectRepository();
export const chapterRepository = new ChapterRepository();
export const topicRepository = new TopicRepository();
export const learningResourceRepository = new LearningResourceRepository();
