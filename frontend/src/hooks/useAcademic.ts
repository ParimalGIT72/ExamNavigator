import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { AcademicService } from '@/services/academic.service';
import {
  IAcademicQueryParams,
  ISubject,
  IChapter,
  ITopic,
  ILearningResource,
} from '@/types';

// ==================== SUBJECT HOOKS ====================

export const useSubjectsQuery = (params?: IAcademicQueryParams) => {
  return useQuery({
    queryKey: ['subjects', params],
    queryFn: async () => {
      const response = await AcademicService.getSubjects(params);
      if (!response.success || !response.data) {
        throw new Error(response.message || 'Failed to fetch subjects');
      }
      return response.data;
    },
  });
};

export const useSubjectQuery = (subjectId: string) => {
  return useQuery({
    queryKey: ['subject', subjectId],
    queryFn: async () => {
      const response = await AcademicService.getSubjectById(subjectId);
      if (!response.success || !response.data?.subject) {
        throw new Error(response.message || 'Subject not found');
      }
      return response.data.subject;
    },
    enabled: !!subjectId,
  });
};

export const useCreateSubjectMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: Partial<ISubject>) => {
      const response = await AcademicService.createSubject(data);
      if (!response.success || !response.data?.subject) {
        throw new Error(response.message || 'Failed to create subject');
      }
      return response.data.subject;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['subjects'] });
    },
  });
};

export const useUpdateSubjectMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ subjectId, data }: { subjectId: string; data: Partial<ISubject> }) => {
      const response = await AcademicService.updateSubject(subjectId, data);
      if (!response.success || !response.data?.subject) {
        throw new Error(response.message || 'Failed to update subject');
      }
      return response.data.subject;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['subjects'] });
      queryClient.invalidateQueries({ queryKey: ['subject', variables.subjectId] });
    },
  });
};

export const useDeleteSubjectMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (subjectId: string) => {
      const response = await AcademicService.deleteSubject(subjectId);
      if (!response.success) {
        throw new Error(response.message || 'Failed to delete subject');
      }
      return response;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['subjects'] });
    },
  });
};

// ==================== CHAPTER HOOKS ====================

export const useChaptersQuery = (subjectId: string, params?: IAcademicQueryParams) => {
  return useQuery({
    queryKey: ['chapters', subjectId, params],
    queryFn: async () => {
      const response = await AcademicService.getChapters(subjectId, params);
      if (!response.success || !response.data) {
        throw new Error(response.message || 'Failed to fetch chapters');
      }
      return response.data;
    },
    enabled: !!subjectId,
  });
};

export const useChapterQuery = (chapterId: string) => {
  return useQuery({
    queryKey: ['chapter', chapterId],
    queryFn: async () => {
      const response = await AcademicService.getChapterById(chapterId);
      if (!response.success || !response.data?.chapter) {
        throw new Error(response.message || 'Chapter not found');
      }
      return response.data.chapter;
    },
    enabled: !!chapterId,
  });
};

export const useCreateChapterMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: Partial<IChapter>) => {
      const response = await AcademicService.createChapter(data);
      if (!response.success || !response.data?.chapter) {
        throw new Error(response.message || 'Failed to create chapter');
      }
      return response.data.chapter;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['chapters'] });
      if (typeof data.subjectId === 'string') {
        queryClient.invalidateQueries({ queryKey: ['chapters', data.subjectId] });
      }
    },
  });
};

export const useUpdateChapterMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ chapterId, data }: { chapterId: string; data: Partial<IChapter> }) => {
      const response = await AcademicService.updateChapter(chapterId, data);
      if (!response.success || !response.data?.chapter) {
        throw new Error(response.message || 'Failed to update chapter');
      }
      return response.data.chapter;
    },
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['chapters'] });
      queryClient.invalidateQueries({ queryKey: ['chapter', variables.chapterId] });
    },
  });
};

export const useDeleteChapterMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (chapterId: string) => {
      const response = await AcademicService.deleteChapter(chapterId);
      if (!response.success) {
        throw new Error(response.message || 'Failed to delete chapter');
      }
      return response;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['chapters'] });
    },
  });
};

// ==================== TOPIC HOOKS ====================

export const useTopicsQuery = (chapterId: string, params?: IAcademicQueryParams) => {
  return useQuery({
    queryKey: ['topics', chapterId, params],
    queryFn: async () => {
      const response = await AcademicService.getTopics(chapterId, params);
      if (!response.success || !response.data) {
        throw new Error(response.message || 'Failed to fetch topics');
      }
      return response.data;
    },
    enabled: !!chapterId,
  });
};

export const useTopicQuery = (topicId: string) => {
  return useQuery({
    queryKey: ['topic', topicId],
    queryFn: async () => {
      const response = await AcademicService.getTopicById(topicId);
      if (!response.success || !response.data?.topic) {
        throw new Error(response.message || 'Topic not found');
      }
      return response.data.topic;
    },
    enabled: !!topicId,
  });
};

export const useCreateTopicMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: Partial<ITopic>) => {
      const response = await AcademicService.createTopic(data);
      if (!response.success || !response.data?.topic) {
        throw new Error(response.message || 'Failed to create topic');
      }
      return response.data.topic;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['topics'] });
    },
  });
};

export const useUpdateTopicMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ topicId, data }: { topicId: string; data: Partial<ITopic> }) => {
      const response = await AcademicService.updateTopic(topicId, data);
      if (!response.success || !response.data?.topic) {
        throw new Error(response.message || 'Failed to update topic');
      }
      return response.data.topic;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['topics'] });
      queryClient.invalidateQueries({ queryKey: ['topic', variables.topicId] });
    },
  });
};

export const useDeleteTopicMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (topicId: string) => {
      const response = await AcademicService.deleteTopic(topicId);
      if (!response.success) {
        throw new Error(response.message || 'Failed to delete topic');
      }
      return response;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['topics'] });
    },
  });
};

// ==================== LEARNING RESOURCE HOOKS ====================

export const useResourcesQuery = (topicId: string, params?: IAcademicQueryParams) => {
  return useQuery({
    queryKey: ['resources', topicId, params],
    queryFn: async () => {
      const response = await AcademicService.getResources(topicId, params);
      if (!response.success || !response.data) {
        throw new Error(response.message || 'Failed to fetch learning resources');
      }
      return response.data;
    },
    enabled: !!topicId,
  });
};

export const useResourceQuery = (resourceId: string) => {
  return useQuery({
    queryKey: ['resource', resourceId],
    queryFn: async () => {
      const response = await AcademicService.getResourceById(resourceId);
      if (!response.success || !response.data?.resource) {
        throw new Error(response.message || 'Learning resource not found');
      }
      return response.data.resource;
    },
    enabled: !!resourceId,
  });
};

export const useCreateResourceMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: Partial<ILearningResource>) => {
      const response = await AcademicService.createResource(data);
      if (!response.success || !response.data?.resource) {
        throw new Error(response.message || 'Failed to create learning resource');
      }
      return response.data.resource;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['resources'] });
    },
  });
};

export const useUpdateResourceMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ resourceId, data }: { resourceId: string; data: Partial<ILearningResource> }) => {
      const response = await AcademicService.updateResource(resourceId, data);
      if (!response.success || !response.data?.resource) {
        throw new Error(response.message || 'Failed to update learning resource');
      }
      return response.data.resource;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['resources'] });
      queryClient.invalidateQueries({ queryKey: ['resource', variables.resourceId] });
    },
  });
};

export const useDeleteResourceMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (resourceId: string) => {
      const response = await AcademicService.deleteResource(resourceId);
      if (!response.success) {
        throw new Error(response.message || 'Failed to delete learning resource');
      }
      return response;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['resources'] });
    },
  });
};
