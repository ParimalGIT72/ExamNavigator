import { z } from 'zod';
import { Request, Response, NextFunction } from 'express';
import { AppError } from '../../../utils/app-error';

const objectIdRegex = /^[0-9a-fA-F]{24}$/;
export const objectIdSchema = z.string().regex(objectIdRegex, 'Invalid MongoDB ObjectId format');

export const topicIdParamSchema = z.object({
  topicId: objectIdSchema,
});

export const updateProgressBodySchema = z.object({
  status: z.enum(['NOT_STARTED', 'IN_PROGRESS', 'COMPLETED'], {
    required_error: 'Status is required.',
    invalid_type_error: 'Status must be one of: NOT_STARTED, IN_PROGRESS, COMPLETED.',
  }),
});

/**
 * Reusable validation middleware factory (following existing project convention).
 */
export function validateProgressRequest(schemas: {
  params?: z.ZodSchema;
  body?: z.ZodSchema;
  query?: z.ZodSchema;
}) {
  return (req: Request, _res: Response, next: NextFunction) => {
    try {
      if (schemas.params) {
        req.params = schemas.params.parse(req.params) as any;
      }
      if (schemas.body) {
        req.body = schemas.body.parse(req.body);
      }
      if (schemas.query) {
        req.query = schemas.query.parse(req.query) as any;
      }
      next();
    } catch (error: unknown) {
      if (error instanceof z.ZodError) {
        const messages = error.errors.map((e) => `${e.path.join('.')}: ${e.message}`);
        next(new AppError(`Validation failed: ${messages.join('; ')}`, 400, 'VALIDATION_ERROR', error.errors));
      } else {
        next(error);
      }
    }
  };
}
