import { ApiClient } from '../lib/api-client';
import {
  IApiResponse,
  ITopicProgressResponse,
  IProgressSummary,
  IProgressAnalyticsResponse,
  EffectiveProgressStatus,
} from '@/types';

export class ProgressService {
  public static async getTopicProgress(topicId: string): Promise<IApiResponse<ITopicProgressResponse>> {
    return ApiClient.get<ITopicProgressResponse>(`/progress/topics/${topicId}`);
  }

  public static async updateTopicProgress(
    topicId: string,
    status: EffectiveProgressStatus
  ): Promise<IApiResponse<ITopicProgressResponse>> {
    return ApiClient.put<ITopicProgressResponse>(`/progress/topics/${topicId}`, { status });
  }

  public static async getProgressSummary(): Promise<IApiResponse<IProgressSummary>> {
    return ApiClient.get<IProgressSummary>('/progress/summary');
  }

  public static async getProgressAnalytics(): Promise<IApiResponse<IProgressAnalyticsResponse>> {
    return ApiClient.get<IProgressAnalyticsResponse>('/progress/analytics');
  }
}
