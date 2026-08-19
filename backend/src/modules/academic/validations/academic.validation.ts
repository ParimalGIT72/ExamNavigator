import { z } from 'zod';
import { Request, Response, NextFunction } from 'express';
import { AppError } from '../../../utils/app-error';

const objectIdRegex = /^[0-9a-fA-F]{24}$/;
export const objectIdSchema = z.string().regex(objectIdRegex, 'Invalid MongoDB ObjectId format');

export const mongoIdParamSchema = z.object({
  id: objectIdSchema,
});

export const subjectIdParamSchema = z.object({
  subjectId: objectIdSchema,
});

export const chapterIdParamSchema = z.object({
  chapterId: objectIdSchema,
});

export const topicIdParamSchema = z.object({
  topicId: objectIdSchema,
});

export const resourceIdParamSchema = z.object({
  resourceId: objectIdSchema,
});

// Common pagination and filter query schema
export const paginationQuerySchema = z.object({
  page: z.string().optional().transform((val) => (val ? Math.max(1, parseInt(val, 10)) : 1)),
  limit: z.string().optional().transform((val) => (val ? Math.min(100, Math.max(1, parseInt(val, 10))) : 20)),
  sort: z.string().optional(),
  order: z.enum(['asc', 'desc']).optional().default('asc'),
  search: z.string().optional(),
});

// Subject Zod Schemas
export const createSubjectSchema = z.object({
  name: z.string().min(1, 'Subject name is required').trim(),
  code: z.string().min(1, 'Subject code is required').trim().toUpperCase(),
  examType: z.enum(['JEE', 'NEET', 'MHT-CET', 'University', 'Other']).default('JEE'),
  description: z.string().optional().default(''),
  icon: z.string().optional().default(''),
  order: z.number().int().optional().default(0),
  isActive: z.boolean().optional().default(true),
});

export const updateSubjectSchema = createSubjectSchema.partial();

export const subjectQuerySchema = paginationQuerySchema.extend({
  examType: z.enum(['JEE', 'NEET', 'MHT-CET', 'University', 'Other']).optional(),
  isActive: z
    .string()
    .optional()
    .transform((val) => (val === undefined ? undefined : val === 'true')),
});

// Chapter Zod Schemas
export const createChapterSchema = z.object({
  subjectId: objectIdSchema,
  title: z.string().min(1, 'Chapter title is required').trim(),
  chapterNumber: z.number().int().positive('Chapter number must be positive'),
  description: z.string().optional().default(''),
  weightage: z.number().optional().default(0),
  estimatedHours: z.number().positive().optional().default(1),
  isActive: z.boolean().optional().default(true),
});

export const updateChapterSchema = createChapterSchema.partial();

export const chapterQuerySchema = paginationQuerySchema.extend({
  subjectId: objectIdSchema.optional(),
  isActive: z
    .string()
    .optional()
    .transform((val) => (val === undefined ? undefined : val === 'true')),
});

// Topic Zod Schemas
export const createTopicSchema = z.object({
  chapterId: objectIdSchema,
  subjectId: objectIdSchema,
  title: z.string().min(1, 'Topic title is required').trim(),
  topicNumber: z.number().int().positive('Topic number must be positive'),
  summary: z.string().optional().default(''),
  difficultyLevel: z.enum(['Easy', 'Medium', 'Hard']).default('Medium'),
  importanceScore: z.number().min(1).max(10).optional().default(5),
  tags: z.array(z.string()).optional().default([]),
});

export const updateTopicSchema = createTopicSchema.partial();

export const topicQuerySchema = paginationQuerySchema.extend({
  chapterId: objectIdSchema.optional(),
  subjectId: objectIdSchema.optional(),
  difficultyLevel: z.enum(['Easy', 'Medium', 'Hard']).optional(),
});

// Learning Resource Zod Schemas
export const createLearningResourceSchema = z.object({
  topicId: objectIdSchema,
  chapterId: objectIdSchema,
  subjectId: objectIdSchema,
  title: z.string().min(1, 'Resource title is required').trim(),
  resourceType: z.enum(['PDF', 'Video', 'Text', 'Link', 'FormulaSheet']),
  contentUrl: z.string().optional().default(''),
  textContent: z.string().optional().default(''),
  author: z.string().optional().default(''),
  fileSize: z.number().optional().default(0),
  mimeType: z.string().optional().default(''),
  order: z.number().int().optional().default(1),
  isActive: z.boolean().optional().default(true),
  metadata: z.record(z.unknown()).optional().default({}),
});

export const updateLearningResourceSchema = createLearningResourceSchema.partial();

export const resourceQuerySchema = paginationQuerySchema.extend({
  topicId: objectIdSchema.optional(),
  chapterId: objectIdSchema.optional(),
  subjectId: objectIdSchema.optional(),
  resourceType: z.enum(['PDF', 'Video', 'Text', 'Link', 'FormulaSheet']).optional(),
  isActive: z
    .string()
    .optional()
    .transform((val) => (val === undefined ? undefined : val === 'true')),
});

// Generic Request Validation Middleware
export const validateRequest = (schemas: {
  body?: z.ZodTypeAny;
  query?: z.ZodTypeAny;
  params?: z.ZodTypeAny;
}) => {
  return async (req: Request, _res: Response, next: NextFunction): Promise<void> => {
    try {
      if (schemas.params) {
        req.params = await schemas.params.parseAsync(req.params);
      }
      if (schemas.query) {
        req.query = await schemas.query.parseAsync(req.query);
      }
      if (schemas.body) {
        req.body = await schemas.body.parseAsync(req.body);
      }
      next();
    } catch (error: any) {
      if (error instanceof z.ZodError) {
        const formattedErrors = error.errors.map((err) => ({
          field: err.path.join('.'),
          message: err.message,
        }));
        return next(new AppError('Validation failed.', 400, 'VALIDATION_ERROR', formattedErrors));
      }
      return next(error);
    }
  };
};
