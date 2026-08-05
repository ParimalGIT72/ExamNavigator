import { z } from 'zod';
import { Request, Response, NextFunction } from 'express';
import { AppError } from '../../../utils/app-error';

const objectIdRegex = /^[0-9a-fA-F]{24}$/;
export const objectIdSchema = z.string().regex(objectIdRegex, 'Invalid MongoDB ObjectId format');

export const questionIdParamSchema = z.object({
  questionId: objectIdSchema,
});

export const mockTestIdParamSchema = z.object({
  mockTestId: objectIdSchema,
});

export const attemptIdParamSchema = z.object({
  attemptId: objectIdSchema,
});

// Common pagination and filter query schema
export const paginationQuerySchema = z.object({
  page: z.string().optional().transform((val) => (val ? Math.max(1, parseInt(val, 10)) : 1)),
  limit: z.string().optional().transform((val) => (val ? Math.min(100, Math.max(1, parseInt(val, 10))) : 20)),
  sort: z.string().optional(),
  order: z.enum(['asc', 'desc']).optional().default('desc'),
  search: z.string().optional(),
});

// Question Option Schema
const questionOptionSchema = z.object({
  optionId: z.string().min(1, 'Option ID is required'),
  optionText: z.string().min(1, 'Option text is required'),
  isCorrect: z.boolean().default(false),
  explanation: z.string().optional().default(''),
});

// Question Bank Zod Schemas
export const createQuestionSchema = z.object({
  subjectId: objectIdSchema,
  chapterId: objectIdSchema,
  topicId: objectIdSchema,
  questionText: z.string().min(1, 'Question text is required').trim(),
  options: z.array(questionOptionSchema).min(2, 'Question must have at least 2 options'),
  correctOptionId: z.string().optional().default(''),
  explanation: z.string().optional().default(''),
  difficultyLevel: z.enum(['Easy', 'Medium', 'Hard']).default('Medium'),
  questionType: z.enum(['SingleChoice', 'MultipleChoice', 'Numerical', 'AssertionReason']).default('SingleChoice'),
  examType: z.enum(['JEE', 'NEET', 'MHT-CET', 'University', 'Other']).default('JEE'),
  previousYearExam: z.string().optional().default(''),
  previousYear: z.number().int().optional(),
  marks: z.number().positive().default(4),
  negativeMarks: z.number().nonnegative().default(1),
  tags: z.array(z.string()).optional().default([]),
});

export const updateQuestionSchema = createQuestionSchema.partial();

export const questionQuerySchema = paginationQuerySchema.extend({
  subjectId: objectIdSchema.optional(),
  chapterId: objectIdSchema.optional(),
  topicId: objectIdSchema.optional(),
  difficultyLevel: z.enum(['Easy', 'Medium', 'Hard']).optional(),
  questionType: z.enum(['SingleChoice', 'MultipleChoice', 'Numerical', 'AssertionReason']).optional(),
  examType: z.enum(['JEE', 'NEET', 'MHT-CET', 'University', 'Other']).optional(),
});

// Mock Test Question Item Schema
const mockTestQuestionItemSchema = z.object({
  questionId: objectIdSchema,
  section: z.string().default('General'),
  marks: z.number().positive().default(4),
  negativeMarks: z.number().nonnegative().default(1),
  order: z.number().int().default(0),
});

// Mock Test Zod Schemas
export const createMockTestSchema = z.object({
  title: z.string().min(1, 'Mock test title is required').trim(),
  description: z.string().optional().default(''),
  examType: z.enum(['JEE', 'NEET', 'MHT-CET', 'University', 'Other']).default('JEE'),
  totalDurationMinutes: z.number().int().positive().default(180),
  totalMarks: z.number().positive().default(300),
  passingMarks: z.number().positive().default(120),
  questions: z.array(mockTestQuestionItemSchema).default([]),
  isPublished: z.boolean().optional().default(false),
  scheduledStartTime: z.string().datetime().or(z.date()).optional(),
  scheduledEndTime: z.string().datetime().or(z.date()).optional(),
});

export const updateMockTestSchema = createMockTestSchema.partial();

export const mockTestQuerySchema = paginationQuerySchema.extend({
  examType: z.enum(['JEE', 'NEET', 'MHT-CET', 'University', 'Other']).optional(),
  isPublished: z
    .string()
    .optional()
    .transform((val) => (val === undefined ? undefined : val === 'true')),
});

// Test Response Zod Schema
const testQuestionResponseSchema = z.object({
  questionId: objectIdSchema,
  selectedOptionId: z.string().optional().default(''),
  selectedOption: z.string().optional(), // API_SPEC alias
  numericalAnswer: z.number().optional(),
  timeSpentSeconds: z.number().nonnegative().optional().default(0),
  status: z
    .enum(['Answered', 'Unanswered', 'Marked_For_Review', 'Answered_And_Marked_For_Review'])
    .optional()
    .default('Answered'),
});

// Test Attempt Save & Submit Schemas
export const saveDraftAttemptSchema = z.object({
  durationSpentSeconds: z.number().nonnegative().optional().default(0),
  responses: z.array(testQuestionResponseSchema).optional().default([]),
});

export const submitTestSchema = z.object({
  durationSpentSeconds: z.number().nonnegative().optional().default(0),
  answers: z.array(testQuestionResponseSchema).optional(),
  responses: z.array(testQuestionResponseSchema).optional(),
});

export const attemptQuerySchema = paginationQuerySchema.extend({
  mockTestId: objectIdSchema.optional(),
  status: z.enum(['In_Progress', 'Submitted', 'Timed_Out', 'Abandoned']).optional(),
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
