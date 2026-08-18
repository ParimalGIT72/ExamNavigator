export type ExamType = 'JEE' | 'NEET' | 'MHT-CET' | 'GATE' | 'CAT' | 'University' | 'Other' | string;
export type DifficultyLevel = 'Easy' | 'Medium' | 'Hard';
export type ResourceType = 'PDF' | 'Video' | 'Notes' | 'FormulaSheet' | 'Other';

export interface IExam {
  _id: string;
  code: string;
  name: string;
  category: 'Engineering' | 'Medical' | 'Management' | 'General' | string;
  description?: string;
  icon?: string;
  order: number;
  isActive: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface ISubject {
  _id: string;
  examId?: string;
  name: string;
  code: string;
  examType: ExamType;
  description?: string;
  icon?: string;
  order: number;
  isActive: boolean;
  chapterCount?: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface IChapter {
  _id: string;
  subjectId: string | ISubject;
  title: string;
  chapterNumber: number;
  description?: string;
  weightage?: number;
  estimatedHours?: number;
  isActive: boolean;
  topicCount?: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface ITopic {
  _id: string;
  chapterId: string | IChapter;
  subjectId: string | ISubject;
  title: string;
  topicNumber: number;
  summary?: string;
  difficultyLevel: DifficultyLevel;
  importanceScore?: number;
  tags?: string[];
  resourceCount?: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface ILearningResource {
  _id: string;
  topicId: string | ITopic;
  chapterId: string | IChapter;
  subjectId: string | ISubject;
  title: string;
  resourceType: ResourceType;
  contentUrl?: string;
  textContent?: string;
  author?: string;
  fileSize?: number;
  mimeType?: string;
  metadata?: Record<string, unknown>;
  createdAt?: string;
  updatedAt?: string;
}

export interface IPaginationMeta {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface IPaginatedResult<T> {
  items: T[];
  pagination: IPaginationMeta;
}

export interface IAcademicQueryParams {
  page?: number;
  limit?: number;
  sort?: string;
  order?: 'asc' | 'desc';
  search?: string;
  examId?: string;
  examType?: ExamType;
  difficultyLevel?: DifficultyLevel;
  resourceType?: ResourceType;
  isActive?: boolean;
}
