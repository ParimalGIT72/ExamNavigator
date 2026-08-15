import { z } from 'zod';

export const startChatSchema = z.object({
  message: z
    .string({ required_error: 'Message is required' })
    .min(3, 'Message must be at least 3 characters')
    .max(4000, 'Message must not exceed 4000 characters'),
  subjectId: z.string().optional(),
  chapterId: z.string().optional(),
  topicId: z.string().optional(),
});

export const continueChatSchema = z.object({
  message: z
    .string({ required_error: 'Message is required' })
    .min(3, 'Message must be at least 3 characters')
    .max(4000, 'Message must not exceed 4000 characters'),
  subjectId: z.string().optional(),
  chapterId: z.string().optional(),
  topicId: z.string().optional(),
});

export const getSessionsQuerySchema = z.object({
  page: z.coerce.number().int().min(1).optional().default(1),
  limit: z.coerce.number().int().min(1).max(100).optional().default(20),
  status: z.enum(['Active', 'Archived']).optional(),
});

export const getMessagesQuerySchema = z.object({
  page: z.coerce.number().int().min(1).optional().default(1),
  limit: z.coerce.number().int().min(1).max(100).optional().default(50),
});

export type StartChatInput = z.infer<typeof startChatSchema>;
export type ContinueChatInput = z.infer<typeof continueChatSchema>;
export type GetSessionsQueryInput = z.infer<typeof getSessionsQuerySchema>;
