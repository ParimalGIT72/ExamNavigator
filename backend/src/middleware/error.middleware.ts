import { Request, Response, NextFunction } from 'express';
import { AppError } from '../utils/app-error';
import { ApiResponse } from '../utils/api-response';
import { logger } from '../utils/logger';
import { envConfig } from '../config/env.config';

export const errorHandler = (
  err: Error | AppError,
  _req: Request,
  res: Response,
  _next: NextFunction
): void => {
  if (err instanceof AppError) {
    logger.warn(`AppError: [${err.errorCode}] ${err.message}`, { statusCode: err.statusCode, errors: err.errors });
    ApiResponse.error(res, err.message, err.statusCode, err.errorCode, err.errors);
    return;
  }

  logger.error('Unhandled Server Error:', err);
  const message = envConfig.nodeEnv === 'production' ? 'Internal server error' : err.message;
  ApiResponse.error(res, message, 500, 'INTERNAL_SERVER_ERROR');
};
