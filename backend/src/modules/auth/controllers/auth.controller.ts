import { Request, Response, NextFunction } from 'express';
import { authService, AuthService } from '../services/auth.service';
import { ApiResponse } from '../../../utils/api-response';
import { AuthenticatedRequest } from '../../../middleware/auth.middleware';
import {
  registerSchema,
  loginSchema,
  refreshTokenSchema,
  forgotPasswordSchema,
  resetPasswordSchema,
  verifyEmailSchema,
  googleAuthSchema,
  changePasswordSchema,
} from '../validations/auth.validation';

export class AuthController {
  private service: AuthService;

  constructor(service = authService) {
    this.service = service;
  }

  public async register(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const validated = registerSchema.parse(req.body);
      const result = await this.service.register(validated);
      ApiResponse.success(res, result.message, { userId: result.userId }, 201);
    } catch (error) {
      next(error);
    }
  }

  public async login(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const validated = loginSchema.parse(req.body);
      const result = await this.service.login(validated);

      res.cookie('refreshToken', result.refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
      });

      ApiResponse.success(res, 'Login successful.', {
        token: result.accessToken,
        refreshToken: result.refreshToken,
        user: result.user,
      });
    } catch (error) {
      next(error);
    }
  }

  public async refreshToken(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const refreshTokenInput = req.cookies?.refreshToken || req.body?.refreshToken;
      const validated = refreshTokenSchema.parse({ refreshToken: refreshTokenInput });

      if (!validated.refreshToken) {
        ApiResponse.error(res, 'Refresh token is required', 400, 'AUTH_REFRESH_TOKEN_REQUIRED');
        return;
      }

      const result = await this.service.refreshAccessToken(validated.refreshToken);

      res.cookie('refreshToken', result.refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 7 * 24 * 60 * 60 * 1000,
      });

      ApiResponse.success(res, 'Token refreshed successfully.', { token: result.accessToken });
    } catch (error) {
      next(error);
    }
  }

  public async logout(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      if (req.user?.userId) {
        await this.service.logout(req.user.userId);
      }
      res.clearCookie('refreshToken');
      ApiResponse.success(res, 'Logged out successfully.');
    } catch (error) {
      next(error);
    }
  }

  public async getCurrentUser(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user?.userId) {
        ApiResponse.error(res, 'Authentication required', 401, 'AUTH_REQUIRED');
        return;
      }
      const user = await this.service.getCurrentUser(req.user.userId);
      ApiResponse.success(res, 'User profile retrieved.', { user });
    } catch (error) {
      next(error);
    }
  }

  public async forgotPassword(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const validated = forgotPasswordSchema.parse(req.body);
      const result = await this.service.forgotPassword(validated.email);
      ApiResponse.success(res, 'Password reset instructions sent.', { resetToken: result.resetToken });
    } catch (error) {
      next(error);
    }
  }

  public async resetPassword(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const validated = resetPasswordSchema.parse(req.body);
      await this.service.resetPassword(validated.token, validated.newPassword);
      ApiResponse.success(res, 'Password reset successful. You can now login with your new password.');
    } catch (error) {
      next(error);
    }
  }

  public async verifyEmail(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const validated = verifyEmailSchema.parse(req.body);
      await this.service.verifyEmail(validated.token);
      ApiResponse.success(res, 'Email verified successfully.');
    } catch (error) {
      next(error);
    }
  }

  public async googleAuth(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const validated = googleAuthSchema.parse(req.body);
      const result = await this.service.googleAuth(validated.googleToken);

      res.cookie('refreshToken', result.refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 7 * 24 * 60 * 60 * 1000,
      });

      ApiResponse.success(res, 'Google authentication successful.', {
        token: result.accessToken,
        refreshToken: result.refreshToken,
        user: result.user,
      });
    } catch (error) {
      next(error);
    }
  }

  public async changePassword(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user?.userId) {
        ApiResponse.error(res, 'Authentication required', 401, 'AUTH_REQUIRED');
        return;
      }
      const validated = changePasswordSchema.parse(req.body);
      await this.service.changePassword(req.user.userId, validated.currentPassword, validated.newPassword);
      ApiResponse.success(res, 'Password updated successfully.');
    } catch (error) {
      next(error);
    }
  }
}

export const authController = new AuthController();
