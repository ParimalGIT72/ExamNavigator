import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { ProgressService } from '@/services/progress.service';
import { EffectiveProgressStatus } from '@/types';

export const useTopicProgressQuery = (topicId: string) => {
  return useQuery({
    queryKey: ['topic-progress', topicId],
    queryFn: async () => {
      const response = await ProgressService.getTopicProgress(topicId);
      if (!response.success || !response.data) {
        throw new Error(response.message || 'Failed to fetch topic progress');
      }
      return response.data;
    },
    enabled: !!topicId,
  });
};

export const useProgressSummaryQuery = () => {
  return useQuery({
    queryKey: ['progress-summary'],
    queryFn: async () => {
      const response = await ProgressService.getProgressSummary();
      if (!response.success || !response.data) {
        throw new Error(response.message || 'Failed to fetch progress summary');
      }
      return response.data;
    },
  });
};

export const useProgressAnalyticsQuery = () => {
  return useQuery({
    queryKey: ['progress-analytics'],
    queryFn: async () => {
      const response = await ProgressService.getProgressAnalytics();
      if (!response.success || !response.data) {
        throw new Error(response.message || 'Failed to fetch progress analytics');
      }
      return response.data;
    },
    staleTime: 60 * 1000,
  });
};

export const useUpdateTopicProgressMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      topicId,
      status,
    }: {
      topicId: string;
      status: EffectiveProgressStatus;
    }) => {
      const response = await ProgressService.updateTopicProgress(topicId, status);
      if (!response.success || !response.data) {
        throw new Error(response.message || 'Failed to update topic progress');
      }
      return response.data;
    },
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['topic-progress', variables.topicId] });
      queryClient.invalidateQueries({ queryKey: ['progress-summary'] });
      queryClient.invalidateQueries({ queryKey: ['progress-analytics'] });
    },
  });
};
