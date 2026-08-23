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
import { ExamModel } from '../models/exam.model';
import { userProfileRepository } from '../../user/repositories/user-profile.repository';
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

export interface IUserContext {
  userId: string;
  role: string;
  targetExam?: { examId: string; examCode: string };
}

export interface IRecommendedTopicResult {
  topicId: string;
  title: string;
  topicNumber: number;
  summary?: string;
  difficultyLevel: 'Easy' | 'Medium' | 'Hard';
  importanceScore: number;
  chapterId: string;
  chapterTitle: string;
  chapterNumber: number;
  chapterWeightage?: number;
  subjectId: string;
  subjectName: string;
  subjectCode: string;
  priorityScore: number;
  priorityLevel: 'HIGH' | 'MEDIUM' | 'LOW';
  explanation: string[];
}

export class SubjectService {
  constructor(
    private subjectRepo: SubjectRepository = subjectRepository,
    private chapterRepo: ChapterRepository = chapterRepository,
    private topicRepo: TopicRepository = topicRepository
  ) {}

  public async resolveUserTargetExam(userContext?: IUserContext): Promise<{ examId: string; examCode: string } | null> {
    if (!userContext || userContext.role === 'Admin') {
      return null;
    }

    if (userContext.targetExam && userContext.targetExam.examId && userContext.targetExam.examCode) {
      return userContext.targetExam;
    }

    const profile = await userProfileRepository.findByUserId(userContext.userId);
    const targetExamCode = (profile?.targetExam || 'JEE').toUpperCase().trim();

    const exam = await ExamModel.findOne({ code: targetExamCode, isActive: true }).exec();
    if (!exam) {
      throw new AppError(
        `Assigned target exam '${targetExamCode}' is invalid or inactive.`,
        400,
        'INVALID_TARGET_EXAM'
      );
    }

    const resolved = {
      examId: exam._id.toString(),
      examCode: exam.code,
    };

    userContext.targetExam = resolved;
    return resolved;
  }

  public async validateSubjectAccess(subject: ISubjectDocument, userContext?: IUserContext): Promise<void> {
    const targetExam = await this.resolveUserTargetExam(userContext);
    if (!targetExam) return;

    const matchesExamId = subject.examId ? subject.examId.toString() === targetExam.examId : false;
    const matchesExamType = subject.examType ? subject.examType.toUpperCase() === targetExam.examCode : false;

    if (!matchesExamId && !matchesExamType) {
      throw new AppError(
        'Access denied. Subject does not belong to your assigned target exam curriculum.',
        403,
        'FORBIDDEN_EXAM_CURRICULUM'
      );
    }
  }

  public async createSubject(data: Partial<ISubjectDocument>): Promise<ISubjectDocument> {
    const examScope = data.examId ? data.examId.toString() : data.examType;

    if (data.name) {
      const existingName = examScope
        ? await this.subjectRepo.findByNameAndExam(data.name, examScope)
        : await this.subjectRepo.findByName(data.name);
      if (existingName) {
        throw new AppError(`Subject with name '${data.name}' already exists.`, 409, 'SUBJECT_NAME_EXISTS');
      }
    }

    if (data.code) {
      const existingCode = examScope
        ? await this.subjectRepo.findByCodeAndExam(data.code, examScope)
        : await this.subjectRepo.findByCode(data.code);
      if (existingCode) {
        throw new AppError(`Subject with code '${data.code}' already exists.`, 409, 'SUBJECT_CODE_EXISTS');
      }
    }

    return await this.subjectRepo.create(data);
  }

  public async getSubjectById(id: string, userContext?: IUserContext): Promise<ISubjectDocument> {
    const subject = await this.subjectRepo.findById(id);
    if (!subject) {
      throw new AppError(`Subject not found with id '${id}'.`, 404, 'SUBJECT_NOT_FOUND');
    }
    await this.validateSubjectAccess(subject, userContext);
    return subject;
  }

  public async getSubjects(
    query: {
      examType?: string;
      examId?: string;
      isActive?: boolean;
    } & IPaginationOptions,
    userContext?: IUserContext
  ): Promise<IPaginatedResult<ISubjectDocument>> {
    const { page = 1, limit = 20, sort = 'order', order = 'asc', search, examType, examId, isActive } = query;
    const filter: FilterQuery<ISubjectDocument> = {};

    const targetExam = await this.resolveUserTargetExam(userContext);

    if (targetExam) {
      // SECURITY RULE: Student role is strictly scoped to assigned targetExam. Client query overrides are ignored.
      filter.$or = [{ examId: targetExam.examId }, { examType: targetExam.examCode }];
    } else {
      if (examId) {
        filter.examId = examId;
      } else if (examType) {
        filter.examType = examType;
      }
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

    const examScope = updateData.examId
      ? updateData.examId.toString()
      : updateData.examType || existing.examId?.toString() || existing.examType;

    if (updateData.name && updateData.name.toLowerCase() !== existing.name.toLowerCase()) {
      const duplicateName = examScope
        ? await this.subjectRepo.findByNameAndExam(updateData.name, examScope)
        : await this.subjectRepo.findByName(updateData.name);
      if (duplicateName) {
        throw new AppError(`Subject with name '${updateData.name}' already exists.`, 409, 'SUBJECT_NAME_EXISTS');
      }
    }

    if (updateData.code && updateData.code.toUpperCase() !== existing.code.toUpperCase()) {
      const duplicateCode = examScope
        ? await this.subjectRepo.findByCodeAndExam(updateData.code, examScope)
        : await this.subjectRepo.findByCode(updateData.code);
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

  public async getRecommendedNextTopics(
    query: { limit?: number; subjectId?: string },
    userContext?: IUserContext
  ): Promise<IRecommendedTopicResult[]> {
    const targetExam = await this.resolveUserTargetExam(userContext);
    if (!targetExam) {
      return [];
    }

    const limit = Math.min(Math.max(Number(query.limit) || 5, 1), 20);

    // Batch Query 1 — Resolve student target exam subjects
    const allowedSubjects = await this.subjectRepo.find({
      $or: [{ examId: targetExam.examId }, { examType: targetExam.examCode }],
      isActive: true,
    });

    const allowedSubjectMap = new Map<string, ISubjectDocument>();
    allowedSubjects.forEach((s) => allowedSubjectMap.set(s._id.toString(), s));

    // Validate optional subjectId filter
    let filterSubjectIds = Array.from(allowedSubjectMap.keys());
    if (query.subjectId) {
      const isObjectId = /^[0-9a-fA-F]{24}$/.test(query.subjectId);
      if (!isObjectId) {
        throw new AppError('Invalid subjectId format.', 400, 'VALIDATION_ERROR');
      }
      if (!allowedSubjectMap.has(query.subjectId)) {
        throw new AppError(
          'Access denied. Requested subject does not belong to your target exam curriculum.',
          403,
          'FORBIDDEN_EXAM_CURRICULUM'
        );
      }
      filterSubjectIds = [query.subjectId];
    }

    // Batch Query 2 — Load ALL active chapters for student's target exam (for exam-wide maxWeightage baseline)
    const allExamChapters = await this.chapterRepo.find({
      subjectId: { $in: Array.from(allowedSubjectMap.keys()) },
      isActive: true,
    });

    // Calculate exam-wide maxWeightage baseline
    let maxWeightage = 0;
    allExamChapters.forEach((ch) => {
      if (ch.weightage && ch.weightage > maxWeightage) {
        maxWeightage = ch.weightage;
      }
    });

    // Filter chapters matching target subject filter
    const targetChapters = allExamChapters.filter((ch) =>
      filterSubjectIds.includes(ch.subjectId.toString())
    );

    const chapterMap = new Map<string, IChapterDocument>();
    targetChapters.forEach((ch) => chapterMap.set(ch._id.toString(), ch));

    // Batch Query 3 — Load topics belonging to target chapters
    const topics = await this.topicRepo.find({
      chapterId: { $in: Array.from(chapterMap.keys()) },
    });

    // Calculate CPS and build recommended results
    const recommendations: IRecommendedTopicResult[] = topics.map((topic) => {
      const parentChapter = chapterMap.get(topic.chapterId.toString());
      const parentSubject = parentChapter
        ? allowedSubjectMap.get(parentChapter.subjectId.toString())
        : undefined;

      const chapterWeightage = parentChapter?.weightage || 0;
      let importanceScore: number;

      if (topic.importanceScore === undefined || topic.importanceScore === null) {
        importanceScore = 5; // Safe legacy fallback for missing/null metadata
      } else if (
        typeof topic.importanceScore === 'number' &&
        !isNaN(topic.importanceScore) &&
        topic.importanceScore >= 1 &&
        topic.importanceScore <= 10
      ) {
        importanceScore = topic.importanceScore;
      } else {
        throw new AppError(
          `Invalid topic importanceScore '${topic.importanceScore}' in curriculum data. Must be a number between 1 and 10.`,
          400,
          'INVALID_CURRICULUM_DATA'
        );
      }

      // 1. Weightage Component (0 - 50 points)
      let weightageComponent = 0;
      if (maxWeightage > 0 && chapterWeightage > 0) {
        weightageComponent = (chapterWeightage / maxWeightage) * 50;
      }

      // 2. Importance Component (0 - 50 points)
      const importanceComponent = (importanceScore / 10) * 50;

      // 3. Final Score (0 - 100)
      const priorityScore = Math.round(weightageComponent + importanceComponent);

      // 4. Priority Level Thresholds
      let priorityLevel: 'HIGH' | 'MEDIUM' | 'LOW' = 'LOW';
      if (priorityScore >= 70) {
        priorityLevel = 'HIGH';
      } else if (priorityScore >= 45) {
        priorityLevel = 'MEDIUM';
      }

      // 5. Transparent Explanation Generator
      const explanation: string[] = [];
      if (chapterWeightage > 0) {
        explanation.push(
          `High Exam Weightage: Belongs to Chapter '${parentChapter?.title || 'Chapter'}' (${chapterWeightage}% exam weightage).`
        );
      } else {
        explanation.push('Exam Weightage: Not specified for this chapter.');
      }

      if (importanceScore >= 8) {
        explanation.push(`High Curriculum Importance: Rated ${importanceScore}/10 in curriculum importance.`);
      } else if (importanceScore >= 5) {
        explanation.push(`Curriculum Importance: Rated ${importanceScore}/10 in curriculum importance.`);
      } else {
        explanation.push(`Curriculum Importance: Rated ${importanceScore}/10.`);
      }

      const diff = topic.difficultyLevel || 'Medium';
      if (diff === 'Easy') {
        explanation.push('Difficulty Level: Easy — Foundational concept.');
      } else if (diff === 'Medium') {
        explanation.push('Difficulty Level: Medium — Core concept.');
      } else {
        explanation.push('Difficulty Level: Hard — Advanced concept.');
      }

      return {
        topicId: topic._id.toString(),
        title: topic.title,
        topicNumber: topic.topicNumber,
        summary: topic.summary,
        difficultyLevel: diff,
        importanceScore,
        chapterId: parentChapter ? parentChapter._id.toString() : '',
        chapterTitle: parentChapter?.title || '',
        chapterNumber: parentChapter?.chapterNumber || 0,
        chapterWeightage,
        subjectId: parentSubject ? parentSubject._id.toString() : '',
        subjectName: parentSubject?.name || '',
        subjectCode: parentSubject?.code || '',
        priorityScore,
        priorityLevel,
        explanation,
      };
    });

    // Deterministic Tie-Breaking Sort:
    // 1. priorityScore DESC
    // 2. importanceScore DESC
    // 3. chapterNumber ASC
    // 4. topicNumber ASC
    recommendations.sort((a, b) => {
      if (b.priorityScore !== a.priorityScore) {
        return b.priorityScore - a.priorityScore;
      }
      if (b.importanceScore !== a.importanceScore) {
        return b.importanceScore - a.importanceScore;
      }
      if (a.chapterNumber !== b.chapterNumber) {
        return a.chapterNumber - b.chapterNumber;
      }
      return a.topicNumber - b.topicNumber;
    });

    return recommendations.slice(0, limit);
  }
}

export class ChapterService {
  constructor(
    private chapterRepo: ChapterRepository = chapterRepository,
    private subjectRepo: SubjectRepository = subjectRepository,
    private topicRepo: TopicRepository = topicRepository,
    private subjectSvc: SubjectService = new SubjectService()
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

  public async getChapterById(id: string, userContext?: IUserContext): Promise<IChapterDocument> {
    const chapter = await this.chapterRepo.findById(id);
    if (!chapter) {
      throw new AppError(`Chapter not found with id '${id}'.`, 404, 'CHAPTER_NOT_FOUND');
    }

    const subject = await this.subjectRepo.findById(chapter.subjectId.toString());
    if (subject) {
      await this.subjectSvc.validateSubjectAccess(subject, userContext);
    }

    return chapter;
  }

  public async getChapters(
    query: {
      subjectId?: string;
      isActive?: boolean;
    } & IPaginationOptions,
    userContext?: IUserContext
  ): Promise<IPaginatedResult<IChapterDocument>> {
    const { page = 1, limit = 20, sort = 'chapterNumber', order = 'asc', search, subjectId, isActive } = query;
    const filter: FilterQuery<IChapterDocument> = {};

    if (subjectId) {
      const subject = await this.subjectRepo.findById(subjectId);
      if (!subject) {
        throw new AppError(`Parent subject not found with id '${subjectId}'.`, 404, 'SUBJECT_NOT_FOUND');
      }
      await this.subjectSvc.validateSubjectAccess(subject, userContext);
      filter.subjectId = subjectId;
    } else {
      const targetExam = await this.subjectSvc.resolveUserTargetExam(userContext);
      if (targetExam) {
        const allowedSubjects = await this.subjectRepo.find({
          $or: [{ examId: targetExam.examId }, { examType: targetExam.examCode }],
        });
        const allowedSubjectIds = allowedSubjects.map((s) => s._id);
        filter.subjectId = { $in: allowedSubjectIds };
      }
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
    private resourceRepo: LearningResourceRepository = learningResourceRepository,
    private subjectSvc: SubjectService = new SubjectService()
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

  public async getTopicById(id: string, userContext?: IUserContext): Promise<ITopicDocument> {
    const topic = await this.topicRepo.findById(id);
    if (!topic) {
      throw new AppError(`Topic not found with id '${id}'.`, 404, 'TOPIC_NOT_FOUND');
    }

    const subject = await this.subjectRepo.findById(topic.subjectId.toString());
    if (subject) {
      await this.subjectSvc.validateSubjectAccess(subject, userContext);
    }

    return topic;
  }

  public async getTopics(
    query: {
      chapterId?: string;
      subjectId?: string;
      difficultyLevel?: string;
    } & IPaginationOptions,
    userContext?: IUserContext
  ): Promise<IPaginatedResult<ITopicDocument>> {
    const { page = 1, limit = 20, sort = 'topicNumber', order = 'asc', search, chapterId, subjectId, difficultyLevel } = query;
    const filter: FilterQuery<ITopicDocument> = {};

    if (subjectId) {
      const subject = await this.subjectRepo.findById(subjectId);
      if (!subject) {
        throw new AppError(`Parent subject not found with id '${subjectId}'.`, 404, 'SUBJECT_NOT_FOUND');
      }
      await this.subjectSvc.validateSubjectAccess(subject, userContext);
      filter.subjectId = subjectId;
    } else if (chapterId) {
      const chapter = await this.chapterRepo.findById(chapterId);
      if (chapter) {
        const subject = await this.subjectRepo.findById(chapter.subjectId.toString());
        if (subject) {
          await this.subjectSvc.validateSubjectAccess(subject, userContext);
        }
      }
      filter.chapterId = chapterId;
    } else {
      const targetExam = await this.subjectSvc.resolveUserTargetExam(userContext);
      if (targetExam) {
        const allowedSubjects = await this.subjectRepo.find({
          $or: [{ examId: targetExam.examId }, { examType: targetExam.examCode }],
        });
        const allowedSubjectIds = allowedSubjects.map((s) => s._id);
        filter.subjectId = { $in: allowedSubjectIds };
      }
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
    private subjectRepo: SubjectRepository = subjectRepository,
    private subjectSvc: SubjectService = new SubjectService()
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

  public async getResourceById(id: string, userContext?: IUserContext): Promise<ILearningResourceDocument> {
    const resource = await this.resourceRepo.findById(id);
    if (!resource) {
      throw new AppError(`Learning resource not found with id '${id}'.`, 404, 'RESOURCE_NOT_FOUND');
    }

    const subject = await this.subjectRepo.findById(resource.subjectId.toString());
    if (subject) {
      await this.subjectSvc.validateSubjectAccess(subject, userContext);
    }

    return resource;
  }

  public async getResources(
    query: {
      topicId?: string;
      chapterId?: string;
      subjectId?: string;
      resourceType?: string;
      isActive?: boolean;
    } & IPaginationOptions,
    userContext?: IUserContext
  ): Promise<IPaginatedResult<ILearningResourceDocument>> {
    const { page = 1, limit = 20, sort = 'order', order = 'asc', search, topicId, chapterId, subjectId, resourceType, isActive } = query;
    const filter: FilterQuery<ILearningResourceDocument> = {};

    if (subjectId) {
      const subject = await this.subjectRepo.findById(subjectId);
      if (!subject) {
        throw new AppError(`Parent subject not found with id '${subjectId}'.`, 404, 'SUBJECT_NOT_FOUND');
      }
      await this.subjectSvc.validateSubjectAccess(subject, userContext);
      filter.subjectId = subjectId;
    } else {
      const targetExam = await this.subjectSvc.resolveUserTargetExam(userContext);
      if (targetExam) {
        const allowedSubjects = await this.subjectRepo.find({
          $or: [{ examId: targetExam.examId }, { examType: targetExam.examCode }],
        });
        const allowedSubjectIds = allowedSubjects.map((s) => s._id);
        filter.subjectId = { $in: allowedSubjectIds };
      }
    }

    if (topicId) {
      filter.topicId = topicId;
    }
    if (chapterId) {
      filter.chapterId = chapterId;
    }
    if (resourceType) {
      filter.resourceType = resourceType;
    }
    if (isActive !== undefined) {
      filter.isActive = isActive;
    } else if (userContext?.role !== 'Admin') {
      filter.isActive = true;
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
