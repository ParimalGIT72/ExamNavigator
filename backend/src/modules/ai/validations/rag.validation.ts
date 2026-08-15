import { z } from 'zod';

export const ragQuerySchema = z.object({
  query: z
    .string({ required_error: 'Query string is required' })
    .min(3, 'Query must be at least 3 characters')
    .max(4000, 'Query must not exceed 4000 characters'),
  subjectId: z.string().optional(),
  chapterId: z.string().optional(),
  topicId: z.string().optional(),
  topK: z.number().int().min(1).max(10).optional(),
  minScore: z.number().min(0).max(1).optional(),
});

export const ingestResourceSchema = z.object({
  resourceId: z.string({ required_error: 'Resource ID is required' }).min(1, 'Resource ID cannot be empty'),
});

export type RagQueryInput = z.infer<typeof ragQuerySchema>;
export type IngestResourceInput = z.infer<typeof ingestResourceSchema>;
