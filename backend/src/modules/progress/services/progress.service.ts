import {
  UserTopicProgressRepository,
  userTopicProgressRepository,
} from '../repositories/progress.repository';
import { TopicProgressStatus } from '../models/user-topic-progress.model';
import {
  SubjectRepository,
  ChapterRepository,
  TopicRepository,
  subjectRepository,
  chapterRepository,
  topicRepository,
} from '../../academic/repositories/academic.repository';
import { IUserContext } from '../../academic/services/academic.service';
import { AppError } from '../../../utils/app-error';

/** Effective status including the virtual NOT_STARTED state */
export type EffectiveProgressStatus = 'NOT_STARTED' | 'IN_PROGRESS' | 'COMPLETED';

export interface ITopicProgressResponse {
  topicId: string;
  status: EffectiveProgressStatus;
  lastProgressUpdatedAt: string | null;
}

export interface IProgressSummary {
  totalSubjects: number;
  totalTopics: number;
  completedTopics: number;
  inProgressTopics: number;
  unstartedTopics: number;
  overallCompletionPercentage: number;
}

export interface ISubjectProgressAnalytics {
  subjectId: string;
  subjectName: string;
  subjectCode: string;
  totalTopics: number;
  completedTopics: number;
  inProgressTopics: number;
  unstartedTopics: number;
  completionPercentage: number;
}

export interface IProgressAnalyticsResponse {
  overall: IProgressSummary;
  bySubject: ISubjectProgressAnalytics[];
}

export class ProgressService {
  constructor(
    private progressRepo: UserTopicProgressRepository = userTopicProgressRepository,
    private subjectRepo: SubjectRepository = subjectRepository,
    private chapterRepo: ChapterRepository = chapterRepository,
    private topicRepo: TopicRepository = topicRepository
  ) {}

  /**
   * Validates that a topic belongs to the user's target exam active curriculum.
   * Returns the validated topic document.
   */
  private async validateTopicCurriculumAccess(
    topicId: string,
    userContext: IUserContext
  ): Promise<{ topicId: string; subjectId: string }> {
    const targetExam = userContext.targetExam;
    if (!targetExam) {
      throw new AppError(
        'Target exam context is required for progress operations.',
        400,
        'MISSING_TARGET_EXAM'
      );
    }

    // Validate topicId format
    const isObjectId = /^[0-9a-fA-F]{24}$/.test(topicId);
    if (!isObjectId) {
      throw new AppError('Invalid topicId format.', 400, 'VALIDATION_ERROR');
    }

    // Fetch the topic
    const topic = await this.topicRepo.findById(topicId);
    if (!topic) {
      throw new AppError('Topic not found.', 404, 'TOPIC_NOT_FOUND');
    }

    // Fetch the parent chapter — must be active
    const chapter = await this.chapterRepo.findById(topic.chapterId.toString());
    if (!chapter || !chapter.isActive) {
      throw new AppError(
        'Topic belongs to an inactive or missing chapter.',
        404,
        'CHAPTER_NOT_FOUND'
      );
    }

    // Fetch the parent subject — must be active
    const subject = await this.subjectRepo.findById(chapter.subjectId.toString());
    if (!subject || !subject.isActive) {
      throw new AppError(
        'Topic belongs to an inactive or missing subject.',
        404,
        'SUBJECT_NOT_FOUND'
      );
    }

    // Validate subject belongs to user's target exam
    const matchesExamId = subject.examId
      ? subject.examId.toString() === targetExam.examId
      : false;
    const matchesExamType = subject.examType
      ? subject.examType.toUpperCase() === targetExam.examCode
      : false;

    if (!matchesExamId && !matchesExamType) {
      throw new AppError(
        'Access denied. Topic does not belong to your target exam curriculum.',
        403,
        'FORBIDDEN_EXAM_CURRICULUM'
      );
    }

    return {
      topicId: topic._id.toString(),
      subjectId: subject._id.toString(),
    };
  }

  /**
   * Shared Primitive: Loads active target exam curriculum and user progress records.
   * Executes 4 batch queries total.
   */
  private async loadActiveProgressContext(
    userId: string,
    userContext: IUserContext
  ) {
    const targetExam = userContext.targetExam;
    if (!targetExam) {
      throw new AppError(
        'Target exam context is required for progress operations.',
        400,
        'MISSING_TARGET_EXAM'
      );
    }

    // Batch Query 1 — Active subjects scoped to student's target exam
    const allowedSubjects = await this.subjectRepo.find({
      $or: [{ examId: targetExam.examId }, { examType: targetExam.examCode }],
      isActive: true,
    });

    const allowedSubjectIds = allowedSubjects.map((s) => s._id.toString());

    if (allowedSubjectIds.length === 0) {
      return {
        allowedSubjects: [],
        activeChapters: [],
        activeTopics: [],
        progressDocs: [],
      };
    }

    // Batch Query 2 — Active chapters belonging to those subjects
    const activeChapters = await this.chapterRepo.find({
      subjectId: { $in: allowedSubjectIds },
      isActive: true,
    });

    const activeChapterIds = activeChapters.map((ch) => ch._id.toString());

    if (activeChapterIds.length === 0) {
      return {
        allowedSubjects,
        activeChapters: [],
        activeTopics: [],
        progressDocs: [],
      };
    }

    // Batch Query 3 — Topics belonging to active chapters
    // (No isActive filter — TopicModel has no isActive field)
    const activeTopics = await this.topicRepo.find({
      chapterId: { $in: activeChapterIds },
    });

    const activeTopicIds = activeTopics.map((t) => t._id.toString());

    if (activeTopicIds.length === 0) {
      return {
        allowedSubjects,
        activeChapters,
        activeTopics: [],
        progressDocs: [],
      };
    }

    // Batch Query 4 — User progress records for active topics only
    const progressDocs = await this.progressRepo.find({
      userId,
      topicId: { $in: activeTopicIds },
    });

    return {
      allowedSubjects,
      activeChapters,
      activeTopics,
      progressDocs,
    };
  }

  /**
   * PUT /api/v1/progress/topics/:topicId
   * Implements strict state-transition semantics.
   */
  public async updateTopicProgress(
    topicId: string,
    requestedStatus: EffectiveProgressStatus,
    userId: string,
    userContext: IUserContext
  ): Promise<ITopicProgressResponse> {
    // Validate curriculum access
    const validated = await this.validateTopicCurriculumAccess(topicId, userContext);

    // Fetch current progress document
    const existing = await this.progressRepo.findOne({
      userId,
      topicId: validated.topicId,
    });

    const currentStatus: EffectiveProgressStatus = existing ? existing.status : 'NOT_STARTED';

    // Same-state request → true no-op
    if (currentStatus === requestedStatus) {
      return {
        topicId: validated.topicId,
        status: currentStatus,
        lastProgressUpdatedAt: existing ? existing.lastProgressUpdatedAt.toISOString() : null,
      };
    }

    const now = new Date();

    // Transition to NOT_STARTED → delete document
    if (requestedStatus === 'NOT_STARTED') {
      if (existing) {
        await this.progressRepo.deleteOne(userId, validated.topicId);
      }
      return {
        topicId: validated.topicId,
        status: 'NOT_STARTED',
        lastProgressUpdatedAt: null,
      };
    }

    // Transition from NOT_STARTED → create document
    if (!existing) {
      const created = await this.progressRepo.create({
        userId,
        topicId: validated.topicId,
        subjectId: validated.subjectId,
        status: requestedStatus as TopicProgressStatus,
        lastProgressUpdatedAt: now,
      });
      return {
        topicId: validated.topicId,
        status: created.status,
        lastProgressUpdatedAt: created.lastProgressUpdatedAt.toISOString(),
      };
    }

    // Transition between IN_PROGRESS ↔ COMPLETED → update document
    const updated = await this.progressRepo.updateStatus(
      userId,
      validated.topicId,
      requestedStatus as TopicProgressStatus,
      now
    );

    if (!updated) {
      throw new AppError('Failed to update progress.', 500, 'UPDATE_FAILED');
    }

    return {
      topicId: validated.topicId,
      status: updated.status,
      lastProgressUpdatedAt: updated.lastProgressUpdatedAt.toISOString(),
    };
  }

  /**
   * GET /api/v1/progress/topics/:topicId
   * Returns the current effective status (including virtual NOT_STARTED).
   */
  public async getTopicProgress(
    topicId: string,
    userId: string,
    userContext: IUserContext
  ): Promise<ITopicProgressResponse> {
    const validated = await this.validateTopicCurriculumAccess(topicId, userContext);

    const existing = await this.progressRepo.findOne({
      userId,
      topicId: validated.topicId,
    });

    if (!existing) {
      return {
        topicId: validated.topicId,
        status: 'NOT_STARTED',
        lastProgressUpdatedAt: null,
      };
    }

    return {
      topicId: validated.topicId,
      status: existing.status,
      lastProgressUpdatedAt: existing.lastProgressUpdatedAt.toISOString(),
    };
  }

  /**
   * GET /api/v1/progress/analytics
   * Computes overall and per-subject progress analytics using shared 4-batch context.
   */
  public async getProgressAnalytics(
    userId: string,
    userContext: IUserContext
  ): Promise<IProgressAnalyticsResponse> {
    const { allowedSubjects, activeChapters, activeTopics, progressDocs } =
      await this.loadActiveProgressContext(userId, userContext);

    // Build lookup maps for fast in-memory aggregation
    const progressMap = new Map<string, TopicProgressStatus>();
    progressDocs.forEach((p) => progressMap.set(p.topicId.toString(), p.status));

    // Chapter ID -> Subject ID string map
    const chapterToSubjectMap = new Map<string, string>();
    activeChapters.forEach((ch) => {
      if (ch._id) {
        const subId = ch.subjectId
          ? ch.subjectId.toString()
          : allowedSubjects.length === 1
          ? allowedSubjects[0]._id.toString()
          : '';
        if (subId) {
          chapterToSubjectMap.set(ch._id.toString(), subId);
        }
      }
    });

    // Subject ID -> Array of Topic documents map
    const subjectTopicsMap = new Map<string, any[]>();
    allowedSubjects.forEach((s) => subjectTopicsMap.set(s._id.toString(), []));

    activeTopics.forEach((t) => {
      const subjectIdStr = t.subjectId
        ? t.subjectId.toString()
        : t.chapterId
        ? chapterToSubjectMap.get(t.chapterId.toString())
        : allowedSubjects.length === 1
        ? allowedSubjects[0]._id.toString()
        : undefined;

      if (subjectIdStr && subjectTopicsMap.has(subjectIdStr)) {
        subjectTopicsMap.get(subjectIdStr)!.push(t);
      }
    });

    let overallCompleted = 0;
    let overallInProgress = 0;
    const totalActiveTopicsCount = activeTopics.length;

    const bySubject: ISubjectProgressAnalytics[] = allowedSubjects.map((subject) => {
      const subjectIdStr = subject._id.toString();
      const topics = subjectTopicsMap.get(subjectIdStr) || [];
      const totalTopics = topics.length;

      let completedTopics = 0;
      let inProgressTopics = 0;

      topics.forEach((t) => {
        const st = progressMap.get(t._id.toString());
        if (st === 'COMPLETED') {
          completedTopics++;
        } else if (st === 'IN_PROGRESS') {
          inProgressTopics++;
        }
      });

      overallCompleted += completedTopics;
      overallInProgress += inProgressTopics;

      const unstartedTopics = totalTopics - completedTopics - inProgressTopics;
      const completionPercentage =
        totalTopics > 0 ? Math.round((completedTopics / totalTopics) * 100) : 0;

      return {
        subjectId: subjectIdStr,
        subjectName: subject.name,
        subjectCode: subject.code,
        totalTopics,
        completedTopics,
        inProgressTopics,
        unstartedTopics,
        completionPercentage,
      };
    });

    const overallUnstarted = totalActiveTopicsCount - overallCompleted - overallInProgress;
    const overallCompletionPercentage =
      totalActiveTopicsCount > 0
        ? Math.round((overallCompleted / totalActiveTopicsCount) * 100)
        : 0;

    const overall: IProgressSummary = {
      totalSubjects: allowedSubjects.length,
      totalTopics: totalActiveTopicsCount,
      completedTopics: overallCompleted,
      inProgressTopics: overallInProgress,
      unstartedTopics: overallUnstarted,
      overallCompletionPercentage,
    };

    return {
      overall,
      bySubject,
    };
  }

  /**
   * GET /api/v1/progress/summary
   * Preserves Phase 8A compatibility by delegating to getProgressAnalytics.
   */
  public async getProgressSummary(
    userId: string,
    userContext: IUserContext
  ): Promise<IProgressSummary> {
    const analytics = await this.getProgressAnalytics(userId, userContext);
    return analytics.overall;
  }
}

export const progressService = new ProgressService();
