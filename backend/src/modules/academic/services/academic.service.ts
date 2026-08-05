import {
  subjectRepository,
  chapterRepository,
  topicRepository,
  learningResourceRepository,
  SubjectRepository,
  ChapterRepository,
  TopicRepository,
  LearningResourceRepository,
  IPaginationOptions,
} from '../repositories/academic.repository';
import { ISubjectDocument } from '../models/subject.model';
import { IChapterDocument } from '../models/chapter.model';
import { ITopicDocument } from '../models/topic.model';
import { ILearningResourceDocument } from '../models/learning-resource.model';
import { AppError } from '../../../utils/app-error';
import { FilterQuery } from 'mongoose';

export interface IPaginatedResult<T> {
  items: T[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export class SubjectService {
  constructor(
    private subjectRepo: SubjectRepository = subjectRepository,
    private chapterRepo: ChapterRepository = chapterRepository
  ) {}

  public async createSubject(data: Partial<ISubjectDocument>): Promise<ISubjectDocument> {
    if (data.name) {
      const existingName = await this.subjectRepo.findByName(data.name);
      if (existingName) {
        throw new AppError(`Subject with name '${data.name}' already exists.`, 409, 'SUBJECT_NAME_EXISTS');
      }
    }

    if (data.code) {
      const existingCode = await this.subjectRepo.findByCode(data.code);
      if (existingCode) {
        throw new AppError(`Subject with code '${data.code}' already exists.`, 409, 'SUBJECT_CODE_EXISTS');
      }
    }

    return await this.subjectRepo.create(data);
  }

  public async getSubjectById(id: string): Promise<ISubjectDocument> {
    const subject = await this.subjectRepo.findById(id);
    if (!subject) {
      throw new AppError(`Subject not found with id '${id}'.`, 404, 'SUBJECT_NOT_FOUND');
    }
    return subject;
  }

  public async getSubjects(
    query: {
      examType?: string;
      isActive?: boolean;
    } & IPaginationOptions
  ): Promise<IPaginatedResult<ISubjectDocument>> {
    const { page = 1, limit = 20, sort = 'order', order = 'asc', search, examType, isActive } = query;
    const filter: FilterQuery<ISubjectDocument> = {};

    if (examType) {
      filter.examType = examType;
    }
    if (isActive !== undefined) {
      filter.isActive = isActive;
    }

    const items = await this.subjectRepo.find(filter, { page, limit, sort, order, search });
    const total = await this.subjectRepo.count(filter, search);
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

  public async updateSubject(id: string, updateData: Partial<ISubjectDocument>): Promise<ISubjectDocument> {
    const existing = await this.subjectRepo.findById(id);
    if (!existing) {
      throw new AppError(`Subject not found with id '${id}'.`, 404, 'SUBJECT_NOT_FOUND');
    }

    if (updateData.name && updateData.name.toLowerCase() !== existing.name.toLowerCase()) {
      const duplicateName = await this.subjectRepo.findByName(updateData.name);
      if (duplicateName) {
        throw new AppError(`Subject with name '${updateData.name}' already exists.`, 409, 'SUBJECT_NAME_EXISTS');
      }
    }

    if (updateData.code && updateData.code.toUpperCase() !== existing.code.toUpperCase()) {
      const duplicateCode = await this.subjectRepo.findByCode(updateData.code);
      if (duplicateCode) {
        throw new AppError(`Subject with code '${updateData.code}' already exists.`, 409, 'SUBJECT_CODE_EXISTS');
      }
    }

    const updated = await this.subjectRepo.updateById(id, updateData);
    if (!updated) {
      throw new AppError('Failed to update subject.', 500, 'UPDATE_FAILED');
    }
    return updated;
  }

  public async deleteSubject(id: string): Promise<boolean> {
    const existing = await this.subjectRepo.findById(id);
    if (!existing) {
      throw new AppError(`Subject not found with id '${id}'.`, 404, 'SUBJECT_NOT_FOUND');
    }

    const chapters = await this.chapterRepo.find({ subjectId: id }, { limit: 1 });
    if (chapters.length > 0) {
      throw new AppError('Cannot delete subject with existing chapters.', 400, 'SUBJECT_HAS_CHAPTERS');
    }

    return await this.subjectRepo.deleteById(id);
  }
}

export class ChapterService {
  constructor(
    private chapterRepo: ChapterRepository = chapterRepository,
    private subjectRepo: SubjectRepository = subjectRepository,
    private topicRepo: TopicRepository = topicRepository
  ) {}

  public async createChapter(data: Partial<IChapterDocument>): Promise<IChapterDocument> {
    if (!data.subjectId) {
      throw new AppError('subjectId is required to create a chapter.', 400, 'MISSING_SUBJECT_ID');
    }

    const subject = await this.subjectRepo.findById(data.subjectId.toString());
    if (!subject) {
      throw new AppError(`Parent subject not found with id '${data.subjectId}'.`, 404, 'SUBJECT_NOT_FOUND');
    }

    if (data.chapterNumber !== undefined) {
      const existing = await this.chapterRepo.findBySubjectIdAndNumber(data.subjectId.toString(), data.chapterNumber);
      if (existing) {
        throw new AppError(
          `Chapter number ${data.chapterNumber} already exists under this subject.`,
          409,
          'CHAPTER_NUMBER_EXISTS'
        );
      }
    }

    return await this.chapterRepo.create(data);
  }

  public async getChapterById(id: string): Promise<IChapterDocument> {
    const chapter = await this.chapterRepo.findById(id);
    if (!chapter) {
      throw new AppError(`Chapter not found with id '${id}'.`, 404, 'CHAPTER_NOT_FOUND');
    }
    return chapter;
  }

  public async getChapters(
    query: {
      subjectId?: string;
      isActive?: boolean;
    } & IPaginationOptions
  ): Promise<IPaginatedResult<IChapterDocument>> {
    const { page = 1, limit = 20, sort = 'chapterNumber', order = 'asc', search, subjectId, isActive } = query;
    const filter: FilterQuery<IChapterDocument> = {};

    if (subjectId) {
      filter.subjectId = subjectId;
    }
    if (isActive !== undefined) {
      filter.isActive = isActive;
    }

    const items = await this.chapterRepo.find(filter, { page, limit, sort, order, search });
    const total = await this.chapterRepo.count(filter, search);
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

  public async updateChapter(id: string, updateData: Partial<IChapterDocument>): Promise<IChapterDocument> {
    const existing = await this.chapterRepo.findById(id);
    if (!existing) {
      throw new AppError(`Chapter not found with id '${id}'.`, 404, 'CHAPTER_NOT_FOUND');
    }

    const targetSubjectId = updateData.subjectId ? updateData.subjectId.toString() : existing.subjectId.toString();
    const targetChapterNumber = updateData.chapterNumber !== undefined ? updateData.chapterNumber : existing.chapterNumber;

    if (updateData.subjectId) {
      const subject = await this.subjectRepo.findById(targetSubjectId);
      if (!subject) {
        throw new AppError(`Parent subject not found with id '${targetSubjectId}'.`, 404, 'SUBJECT_NOT_FOUND');
      }
    }

    if (targetSubjectId !== existing.subjectId.toString() || targetChapterNumber !== existing.chapterNumber) {
      const duplicate = await this.chapterRepo.findBySubjectIdAndNumber(targetSubjectId, targetChapterNumber);
      if (duplicate && duplicate._id.toString() !== id) {
        throw new AppError(
          `Chapter number ${targetChapterNumber} already exists under target subject.`,
          409,
          'CHAPTER_NUMBER_EXISTS'
        );
      }
    }

    const updated = await this.chapterRepo.updateById(id, updateData);
    if (!updated) {
      throw new AppError('Failed to update chapter.', 500, 'UPDATE_FAILED');
    }
    return updated;
  }

  public async deleteChapter(id: string): Promise<boolean> {
    const existing = await this.chapterRepo.findById(id);
    if (!existing) {
      throw new AppError(`Chapter not found with id '${id}'.`, 404, 'CHAPTER_NOT_FOUND');
    }

    const topics = await this.topicRepo.find({ chapterId: id }, { limit: 1 });
    if (topics.length > 0) {
      throw new AppError('Cannot delete chapter with existing topics.', 400, 'CHAPTER_HAS_TOPICS');
    }

    return await this.chapterRepo.deleteById(id);
  }
}

export class TopicService {
  constructor(
    private topicRepo: TopicRepository = topicRepository,
    private chapterRepo: ChapterRepository = chapterRepository,
    private subjectRepo: SubjectRepository = subjectRepository,
    private resourceRepo: LearningResourceRepository = learningResourceRepository
  ) {}

  public async createTopic(data: Partial<ITopicDocument>): Promise<ITopicDocument> {
    if (!data.chapterId || !data.subjectId) {
      throw new AppError('Both chapterId and subjectId are required to create a topic.', 400, 'MISSING_REQUIRED_FIELDS');
    }

    const chapter = await this.chapterRepo.findById(data.chapterId.toString());
    if (!chapter) {
      throw new AppError(`Parent chapter not found with id '${data.chapterId}'.`, 404, 'CHAPTER_NOT_FOUND');
    }

    const subject = await this.subjectRepo.findById(data.subjectId.toString());
    if (!subject) {
      throw new AppError(`Parent subject not found with id '${data.subjectId}'.`, 404, 'SUBJECT_NOT_FOUND');
    }

    if (data.topicNumber !== undefined) {
      const existing = await this.topicRepo.findByChapterIdAndNumber(data.chapterId.toString(), data.topicNumber);
      if (existing) {
        throw new AppError(
          `Topic number ${data.topicNumber} already exists in this chapter.`,
          409,
          'TOPIC_NUMBER_EXISTS'
        );
      }
    }

    return await this.topicRepo.create(data);
  }

  public async getTopicById(id: string): Promise<ITopicDocument> {
    const topic = await this.topicRepo.findById(id);
    if (!topic) {
      throw new AppError(`Topic not found with id '${id}'.`, 404, 'TOPIC_NOT_FOUND');
    }
    return topic;
  }

  public async getTopics(
    query: {
      chapterId?: string;
      subjectId?: string;
      difficultyLevel?: string;
    } & IPaginationOptions
  ): Promise<IPaginatedResult<ITopicDocument>> {
    const { page = 1, limit = 20, sort = 'topicNumber', order = 'asc', search, chapterId, subjectId, difficultyLevel } = query;
    const filter: FilterQuery<ITopicDocument> = {};

    if (chapterId) {
      filter.chapterId = chapterId;
    }
    if (subjectId) {
      filter.subjectId = subjectId;
    }
    if (difficultyLevel) {
      filter.difficultyLevel = difficultyLevel;
    }

    const items = await this.topicRepo.find(filter, { page, limit, sort, order, search });
    const total = await this.topicRepo.count(filter, search);
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

  public async updateTopic(id: string, updateData: Partial<ITopicDocument>): Promise<ITopicDocument> {
    const existing = await this.topicRepo.findById(id);
    if (!existing) {
      throw new AppError(`Topic not found with id '${id}'.`, 404, 'TOPIC_NOT_FOUND');
    }

    const targetChapterId = updateData.chapterId ? updateData.chapterId.toString() : existing.chapterId.toString();
    const targetTopicNumber = updateData.topicNumber !== undefined ? updateData.topicNumber : existing.topicNumber;

    if (updateData.chapterId) {
      const chapter = await this.chapterRepo.findById(targetChapterId);
      if (!chapter) {
        throw new AppError(`Parent chapter not found with id '${targetChapterId}'.`, 404, 'CHAPTER_NOT_FOUND');
      }
    }

    if (updateData.subjectId) {
      const subject = await this.subjectRepo.findById(updateData.subjectId.toString());
      if (!subject) {
        throw new AppError(`Parent subject not found with id '${updateData.subjectId}'.`, 404, 'SUBJECT_NOT_FOUND');
      }
    }

    if (targetChapterId !== existing.chapterId.toString() || targetTopicNumber !== existing.topicNumber) {
      const duplicate = await this.topicRepo.findByChapterIdAndNumber(targetChapterId, targetTopicNumber);
      if (duplicate && duplicate._id.toString() !== id) {
        throw new AppError(
          `Topic number ${targetTopicNumber} already exists in target chapter.`,
          409,
          'TOPIC_NUMBER_EXISTS'
        );
      }
    }

    const updated = await this.topicRepo.updateById(id, updateData);
    if (!updated) {
      throw new AppError('Failed to update topic.', 500, 'UPDATE_FAILED');
    }
    return updated;
  }

  public async deleteTopic(id: string): Promise<boolean> {
    const existing = await this.topicRepo.findById(id);
    if (!existing) {
      throw new AppError(`Topic not found with id '${id}'.`, 404, 'TOPIC_NOT_FOUND');
    }

    const resources = await this.resourceRepo.find({ topicId: id }, { limit: 1 });
    if (resources.length > 0) {
      throw new AppError('Cannot delete topic with existing learning resources.', 400, 'TOPIC_HAS_RESOURCES');
    }

    return await this.topicRepo.deleteById(id);
  }
}

export class LearningResourceService {
  constructor(
    private resourceRepo: LearningResourceRepository = learningResourceRepository,
    private topicRepo: TopicRepository = topicRepository,
    private chapterRepo: ChapterRepository = chapterRepository,
    private subjectRepo: SubjectRepository = subjectRepository
  ) {}

  public async createResource(data: Partial<ILearningResourceDocument>): Promise<ILearningResourceDocument> {
    if (!data.topicId || !data.chapterId || !data.subjectId) {
      throw new AppError('topicId, chapterId, and subjectId are required.', 400, 'MISSING_REQUIRED_FIELDS');
    }

    const topic = await this.topicRepo.findById(data.topicId.toString());
    if (!topic) {
      throw new AppError(`Parent topic not found with id '${data.topicId}'.`, 404, 'TOPIC_NOT_FOUND');
    }

    const chapter = await this.chapterRepo.findById(data.chapterId.toString());
    if (!chapter) {
      throw new AppError(`Parent chapter not found with id '${data.chapterId}'.`, 404, 'CHAPTER_NOT_FOUND');
    }

    const subject = await this.subjectRepo.findById(data.subjectId.toString());
    if (!subject) {
      throw new AppError(`Parent subject not found with id '${data.subjectId}'.`, 404, 'SUBJECT_NOT_FOUND');
    }

    return await this.resourceRepo.create(data);
  }

  public async getResourceById(id: string): Promise<ILearningResourceDocument> {
    const resource = await this.resourceRepo.findById(id);
    if (!resource) {
      throw new AppError(`Learning resource not found with id '${id}'.`, 404, 'RESOURCE_NOT_FOUND');
    }
    return resource;
  }

  public async getResources(
    query: {
      topicId?: string;
      chapterId?: string;
      subjectId?: string;
      resourceType?: string;
    } & IPaginationOptions
  ): Promise<IPaginatedResult<ILearningResourceDocument>> {
    const { page = 1, limit = 20, sort = 'createdAt', order = 'desc', search, topicId, chapterId, subjectId, resourceType } = query;
    const filter: FilterQuery<ILearningResourceDocument> = {};

    if (topicId) {
      filter.topicId = topicId;
    }
    if (chapterId) {
      filter.chapterId = chapterId;
    }
    if (subjectId) {
      filter.subjectId = subjectId;
    }
    if (resourceType) {
      filter.resourceType = resourceType;
    }

    const items = await this.resourceRepo.find(filter, { page, limit, sort, order, search });
    const total = await this.resourceRepo.count(filter, search);
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

  public async updateResource(
    id: string,
    updateData: Partial<ILearningResourceDocument>
  ): Promise<ILearningResourceDocument> {
    const existing = await this.resourceRepo.findById(id);
    if (!existing) {
      throw new AppError(`Learning resource not found with id '${id}'.`, 404, 'RESOURCE_NOT_FOUND');
    }

    if (updateData.topicId) {
      const topic = await this.topicRepo.findById(updateData.topicId.toString());
      if (!topic) {
        throw new AppError(`Parent topic not found with id '${updateData.topicId}'.`, 404, 'TOPIC_NOT_FOUND');
      }
    }
    if (updateData.chapterId) {
      const chapter = await this.chapterRepo.findById(updateData.chapterId.toString());
      if (!chapter) {
        throw new AppError(`Parent chapter not found with id '${updateData.chapterId}'.`, 404, 'CHAPTER_NOT_FOUND');
      }
    }
    if (updateData.subjectId) {
      const subject = await this.subjectRepo.findById(updateData.subjectId.toString());
      if (!subject) {
        throw new AppError(`Parent subject not found with id '${updateData.subjectId}'.`, 404, 'SUBJECT_NOT_FOUND');
      }
    }

    const updated = await this.resourceRepo.updateById(id, updateData);
    if (!updated) {
      throw new AppError('Failed to update learning resource.', 500, 'UPDATE_FAILED');
    }
    return updated;
  }

  public async deleteResource(id: string): Promise<boolean> {
    const existing = await this.resourceRepo.findById(id);
    if (!existing) {
      throw new AppError(`Learning resource not found with id '${id}'.`, 404, 'RESOURCE_NOT_FOUND');
    }

    return await this.resourceRepo.deleteById(id);
  }
}

export const subjectService = new SubjectService();
export const chapterService = new ChapterService();
export const topicService = new TopicService();
export const learningResourceService = new LearningResourceService();
