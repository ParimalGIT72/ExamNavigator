import { z } from 'zod';

export const directChatSchema = z.object({
  prompt: z
    .string({ required_error: 'Prompt is required' })
    .min(3, 'Prompt must be at least 3 characters')
    .max(4000, 'Prompt must not exceed 4000 characters'),
  subjectId: z.string().optional(),
  topicId: z.string().optional(),
  maxTokens: z.number().int().min(100).max(4096).optional(),
});

export type DirectChatInput = z.infer<typeof directChatSchema>;
