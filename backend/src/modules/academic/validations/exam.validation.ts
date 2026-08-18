import { z } from 'zod';

export const createExamSchema = z.object({
  code: z
    .string()
    .min(2, 'Exam code must be at least 2 characters')
    .max(20, 'Exam code cannot exceed 20 characters')
    .toUpperCase(),
  name: z.string().min(2, 'Exam name must be at least 2 characters').max(100, 'Exam name cannot exceed 100 characters'),
  category: z.enum(['Engineering', 'Medical', 'Management', 'General']),
  description: z.string().optional(),
  icon: z.string().optional(),
  order: z.number().int().min(0).optional().default(0),
  isActive: z.boolean().optional().default(true),
});

export const updateExamSchema = z.object({
  code: z
    .string()
    .min(2, 'Exam code must be at least 2 characters')
    .max(20, 'Exam code cannot exceed 20 characters')
    .toUpperCase()
    .optional(),
  name: z.string().min(2, 'Exam name must be at least 2 characters').max(100, 'Exam name cannot exceed 100 characters').optional(),
  category: z.enum(['Engineering', 'Medical', 'Management', 'General']).optional(),
  description: z.string().optional(),
  icon: z.string().optional(),
  order: z.number().int().min(0).optional(),
  isActive: z.boolean().optional(),
});

export const examQuerySchema = z.object({
  page: z.coerce.number().int().positive().optional().default(1),
  limit: z.coerce.number().int().positive().max(100).optional().default(50),
  sort: z.string().optional().default('order'),
  order: z.enum(['asc', 'desc']).optional().default('asc'),
  search: z.string().optional(),
  isActive: z
    .string()
    .transform((val) => val === 'true')
    .optional(),
  category: z.string().optional(),
});

export const examIdParamSchema = z.object({
  examId: z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid Exam ID format'),
});
