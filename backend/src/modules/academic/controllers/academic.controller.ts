import { Request, Response, NextFunction } from 'express';
import {
  subjectService,
  chapterService,
  topicService,
  learningResourceService,
  SubjectService,
  ChapterService,
  TopicService,
  LearningResourceService,
  IUserContext,
} from '../services/academic.service';
import { ApiResponse } from '../../../utils/api-response';

const getUserContext = (req: Request): IUserContext | undefined => {
  const user = (req as any).user;
  if (!user || !user.userId) return undefined;
  return {
    userId: user.userId,
    role: user.role || 'Student',
  };
};

export class SubjectController {
  constructor(private subjectSvc: SubjectService = subjectService) {}

  public getSubjects = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const userContext = getUserContext(req);
      const result = await this.subjectSvc.getSubjects(req.query as any, userContext);
      ApiResponse.success(res, 'Subjects retrieved successfully.', result);
    } catch (error) {
      next(error);
    }
  };

  public getSubjectById = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const id = req.params.id || req.params.subjectId;
      const userContext = getUserContext(req);
      const subject = await this.subjectSvc.getSubjectById(id, userContext);
      ApiResponse.success(res, 'Subject retrieved successfully.', subject);
    } catch (error) {
      next(error);
    }
  };

  public createSubject = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const subject = await this.subjectSvc.createSubject(req.body);
      ApiResponse.success(res, 'Subject created successfully.', subject, 201);
    } catch (error) {
      next(error);
    }
  };

  public updateSubject = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const id = req.params.id || req.params.subjectId;
      const subject = await this.subjectSvc.updateSubject(id, req.body);
      ApiResponse.success(res, 'Subject updated successfully.', subject);
    } catch (error) {
      next(error);
    }
  };

  public deleteSubject = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const id = req.params.id || req.params.subjectId;
      await this.subjectSvc.deleteSubject(id);
      ApiResponse.success(res, 'Subject deleted successfully.');
    } catch (error) {
      next(error);
    }
  };
}

export class ChapterController {
  constructor(private chapterSvc: ChapterService = chapterService) {}

  public getChapters = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const queryParams = { ...req.query };
      if (req.params.subjectId) {
        queryParams.subjectId = req.params.subjectId;
      }
      const userContext = getUserContext(req);
      const result = await this.chapterSvc.getChapters(queryParams as any, userContext);
      ApiResponse.success(res, 'Chapters retrieved successfully.', result);
    } catch (error) {
      next(error);
    }
  };

  public getChapterById = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const id = req.params.id || req.params.chapterId;
      const userContext = getUserContext(req);
      const chapter = await this.chapterSvc.getChapterById(id, userContext);
      ApiResponse.success(res, 'Chapter retrieved successfully.', chapter);
    } catch (error) {
      next(error);
    }
  };

  public createChapter = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const chapter = await this.chapterSvc.createChapter(req.body);
      ApiResponse.success(res, 'Chapter created successfully.', chapter, 201);
    } catch (error) {
      next(error);
    }
  };

  public updateChapter = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const id = req.params.id || req.params.chapterId;
      const chapter = await this.chapterSvc.updateChapter(id, req.body);
      ApiResponse.success(res, 'Chapter updated successfully.', chapter);
    } catch (error) {
      next(error);
    }
  };

  public deleteChapter = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const id = req.params.id || req.params.chapterId;
      await this.chapterSvc.deleteChapter(id);
      ApiResponse.success(res, 'Chapter deleted successfully.');
    } catch (error) {
      next(error);
    }
  };
}

export class TopicController {
  constructor(private topicSvc: TopicService = topicService) {}

  public getTopics = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const queryParams = { ...req.query };
      if (req.params.chapterId) {
        queryParams.chapterId = req.params.chapterId;
      }
      const userContext = getUserContext(req);
      const result = await this.topicSvc.getTopics(queryParams as any, userContext);
      ApiResponse.success(res, 'Topics retrieved successfully.', result);
    } catch (error) {
      next(error);
    }
  };

  public getTopicById = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const id = req.params.id || req.params.topicId;
      const userContext = getUserContext(req);
      const topic = await this.topicSvc.getTopicById(id, userContext);
      ApiResponse.success(res, 'Topic retrieved successfully.', topic);
    } catch (error) {
      next(error);
    }
  };

  public createTopic = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const topic = await this.topicSvc.createTopic(req.body);
      ApiResponse.success(res, 'Topic created successfully.', topic, 201);
    } catch (error) {
      next(error);
    }
  };

  public updateTopic = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const id = req.params.id || req.params.topicId;
      const topic = await this.topicSvc.updateTopic(id, req.body);
      ApiResponse.success(res, 'Topic updated successfully.', topic);
    } catch (error) {
      next(error);
    }
  };

  public deleteTopic = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const id = req.params.id || req.params.topicId;
      await this.topicSvc.deleteTopic(id);
      ApiResponse.success(res, 'Topic deleted successfully.');
    } catch (error) {
      next(error);
    }
  };
}

export class LearningResourceController {
  constructor(private resourceSvc: LearningResourceService = learningResourceService) {}

  public getResources = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const queryParams = { ...req.query };
      if (req.params.topicId) {
        queryParams.topicId = req.params.topicId;
      }
      const userContext = getUserContext(req);
      const result = await this.resourceSvc.getResources(queryParams as any, userContext);
      ApiResponse.success(res, 'Learning resources retrieved successfully.', result);
    } catch (error) {
      next(error);
    }
  };

  public getResourceById = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const id = req.params.id || req.params.resourceId;
      const userContext = getUserContext(req);
      const resource = await this.resourceSvc.getResourceById(id, userContext);
      ApiResponse.success(res, 'Learning resource retrieved successfully.', resource);
    } catch (error) {
      next(error);
    }
  };

  public createResource = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const resource = await this.resourceSvc.createResource(req.body);
      ApiResponse.success(res, 'Learning resource created successfully.', resource, 201);
    } catch (error) {
      next(error);
    }
  };

  public updateResource = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const id = req.params.id || req.params.resourceId;
      const resource = await this.resourceSvc.updateResource(id, req.body);
      ApiResponse.success(res, 'Learning resource updated successfully.', resource);
    } catch (error) {
      next(error);
    }
  };

  public deleteResource = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const id = req.params.id || req.params.resourceId;
      await this.resourceSvc.deleteResource(id);
      ApiResponse.success(res, 'Learning resource deleted successfully.');
    } catch (error) {
      next(error);
    }
  };
}

export const subjectController = new SubjectController();
export const chapterController = new ChapterController();
export const topicController = new TopicController();
export const learningResourceController = new LearningResourceController();
