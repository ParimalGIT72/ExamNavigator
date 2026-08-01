import { Response } from 'express';

export interface IApiResponse<T = unknown> {
  success: boolean;
  message: string;
  data?: T;
  errorCode?: string;
  errors?: unknown[];
}

export class ApiResponse {
  public static success<T>(res: Response, message: string, data?: T, statusCode: number = 200): Response {
    const payload: IApiResponse<T> = {
      success: true,
      message,
      data,
    };
    return res.status(statusCode).json(payload);
  }

  public static error(
    res: Response,
    message: string,
    statusCode: number = 500,
    errorCode: string = 'INTERNAL_ERROR',
    errors?: unknown[]
  ): Response {
    const payload: IApiResponse = {
      success: false,
      message,
      errorCode,
      errors: errors || [],
    };
    return res.status(statusCode).json(payload);
  }
}
