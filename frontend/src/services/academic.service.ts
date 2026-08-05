import { ApiClient } from '../lib/api-client';
import {
  IApiResponse,
  IAcademicQueryParams,
  IPaginatedResult,
  ISubject,
  IChapter,
  ITopic,
  ILearningResource,
} from '@/types';

function buildQueryString(params?: IAcademicQueryParams): string {
  if (!params) return '';
  const query = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') {
      query.append(key, String(value));
    }
  });
  const str = query.toString();
  return str ? `?${str}` : '';
}

export class AcademicService {
  // --- Subject Services ---
  public static async getSubjects(params?: IAcademicQueryParams): Promise<IApiResponse<IPaginatedResult<ISubject>>> {
    return ApiClient.get<IPaginatedResult<ISubject>>(`/subjects${buildQueryString(params)}`);
  }

  public static async getSubjectById(subjectId: string): Promise<IApiResponse<{ subject: ISubject }>> {
    return ApiClient.get<{ subject: ISubject }>(`/subjects/${subjectId}`);
  }

  public static async createSubject(data: Partial<ISubject>): Promise<IApiResponse<{ subject: ISubject }>> {
    return ApiClient.post<{ subject: ISubject }>('/admin/subjects', data);
  }

  public static async updateSubject(subjectId: string, data: Partial<ISubject>): Promise<IApiResponse<{ subject: ISubject }>> {
    return ApiClient.patch<{ subject: ISubject }>(`/admin/subjects/${subjectId}`, data);
  }

  public static async deleteSubject(subjectId: string): Promise<IApiResponse> {
    return ApiClient.delete(`/admin/subjects/${subjectId}`);
  }

  // --- Chapter Services ---
  public static async getChapters(subjectId: string, params?: IAcademicQueryParams): Promise<IApiResponse<IPaginatedResult<IChapter>>> {
    return ApiClient.get<IPaginatedResult<IChapter>>(`/subjects/${subjectId}/chapters${buildQueryString(params)}`);
  }

  public static async getChapterById(chapterId: string): Promise<IApiResponse<{ chapter: IChapter }>> {
    return ApiClient.get<{ chapter: IChapter }>(`/chapters/${chapterId}`);
  }

  public static async createChapter(data: Partial<IChapter>): Promise<IApiResponse<{ chapter: IChapter }>> {
    return ApiClient.post<{ chapter: IChapter }>('/admin/chapters', data);
  }

  public static async updateChapter(chapterId: string, data: Partial<IChapter>): Promise<IApiResponse<{ chapter: IChapter }>> {
    return ApiClient.patch<{ chapter: IChapter }>(`/admin/chapters/${chapterId}`, data);
  }

  public static async deleteChapter(chapterId: string): Promise<IApiResponse> {
    return ApiClient.delete(`/admin/chapters/${chapterId}`);
  }

  // --- Topic Services ---
  public static async getTopics(chapterId: string, params?: IAcademicQueryParams): Promise<IApiResponse<IPaginatedResult<ITopic>>> {
    return ApiClient.get<IPaginatedResult<ITopic>>(`/chapters/${chapterId}/topics${buildQueryString(params)}`);
  }

  public static async getTopicById(topicId: string): Promise<IApiResponse<{ topic: ITopic }>> {
    return ApiClient.get<{ topic: ITopic }>(`/topics/${topicId}`);
  }

  public static async createTopic(data: Partial<ITopic>): Promise<IApiResponse<{ topic: ITopic }>> {
    return ApiClient.post<{ topic: ITopic }>('/admin/topics', data);
  }

  public static async updateTopic(topicId: string, data: Partial<ITopic>): Promise<IApiResponse<{ topic: ITopic }>> {
    return ApiClient.patch<{ topic: ITopic }>(`/admin/topics/${topicId}`, data);
  }

  public static async deleteTopic(topicId: string): Promise<IApiResponse> {
    return ApiClient.delete(`/admin/topics/${topicId}`);
  }

  // --- Learning Resource Services ---
  public static async getResources(topicId: string, params?: IAcademicQueryParams): Promise<IApiResponse<IPaginatedResult<ILearningResource>>> {
    return ApiClient.get<IPaginatedResult<ILearningResource>>(`/topics/${topicId}/resources${buildQueryString(params)}`);
  }

  public static async getResourceById(resourceId: string): Promise<IApiResponse<{ resource: ILearningResource }>> {
    return ApiClient.get<{ resource: ILearningResource }>(`/resources/${resourceId}`);
  }

  public static async createResource(data: Partial<ILearningResource>): Promise<IApiResponse<{ resource: ILearningResource }>> {
    return ApiClient.post<{ resource: ILearningResource }>('/admin/resources', data);
  }

  public static async updateResource(resourceId: string, data: Partial<ILearningResource>): Promise<IApiResponse<{ resource: ILearningResource }>> {
    return ApiClient.patch<{ resource: ILearningResource }>(`/admin/resources/${resourceId}`, data);
  }

  public static async deleteResource(resourceId: string): Promise<IApiResponse> {
    return ApiClient.delete(`/admin/resources/${resourceId}`);
  }
}
