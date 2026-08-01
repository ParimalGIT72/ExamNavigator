import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { envConfig } from '../config/env.config';
import { AppError } from '../utils/app-error';

export interface AuthenticatedRequest extends Request {
  user?: {
    userId: string;
    email: string;
    role: 'Student' | 'Admin';
  };
}

export const authenticateJwt = (req: AuthenticatedRequest, _res: Response, next: NextFunction): void => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return next(new AppError('Authentication required. Missing Bearer token.', 401, 'AUTH_REQUIRED'));
  }

  const token = authHeader.split(' ')[1];

  try {
    const decoded = jwt.verify(token, envConfig.jwtSecret) as {
      userId: string;
      email: string;
      role: 'Student' | 'Admin';
    };

    req.user = decoded;
    return next();
  } catch (error: any) {
    if (error.name === 'TokenExpiredError') {
      return next(new AppError('Token has expired. Please refresh your token.', 401, 'AUTH_TOKEN_EXPIRED'));
    }
    return next(new AppError('Invalid authentication token.', 401, 'AUTH_INVALID_TOKEN'));
  }
};
