import { z } from 'zod';

export const generateNotesSchema = z.object({
  topicId: z.string({ required_error: 'topicId is required' }).min(1, 'topicId cannot be empty'),
  customPrompt: z.string().max(1000).optional(),
  maxTokens: z.number().int().min(100).max(4096).optional(),
});

export const updateNoteSchema = z.object({
  title: z.string().min(1).max(200).optional(),
  content: z.string().min(1).optional(),
  summary: z.string().optional(),
  isPinned: z.boolean().optional(),
  isArchived: z.boolean().optional(),
});

export const generateFlashcardsSchema = z.object({
  topicId: z.string({ required_error: 'topicId is required' }).min(1, 'topicId cannot be empty'),
  count: z.number().int().min(1).max(20).optional().default(5),
});

export const detectTopicSchema = z.object({
  text: z.string({ required_error: 'text is required' }).min(3, 'text must be at least 3 characters').max(2000),
  subjectId: z.string().optional(),
});

export const getNotesQuerySchema = z.object({
  page: z.coerce.number().int().min(1).optional().default(1),
  limit: z.coerce.number().int().min(1).max(100).optional().default(20),
  topicId: z.string().optional(),
});

export const getFlashcardsQuerySchema = z.object({
  page: z.coerce.number().int().min(1).optional().default(1),
  limit: z.coerce.number().int().min(1).max(100).optional().default(20),
  topicId: z.string().optional(),
  dueOnly: z.coerce.boolean().optional(),
});

export type GenerateNotesInput = z.infer<typeof generateNotesSchema>;
export type UpdateNoteInput = z.infer<typeof updateNoteSchema>;
export type GenerateFlashcardsInput = z.infer<typeof generateFlashcardsSchema>;
export type DetectTopicInput = z.infer<typeof detectTopicSchema>;
