import { Response, NextFunction } from 'express';
import { AuthenticatedRequest } from '../../../middleware/auth.middleware';
import { userProfileRepository } from '../repositories/user-profile.repository';
import { userRepository } from '../repositories/user.repository';
import { ApiResponse } from '../../../utils/api-response';
import { AppError } from '../../../utils/app-error';

export class UserController {
  public async getProfile(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user?.userId) {
        ApiResponse.error(res, 'Authentication required', 401, 'AUTH_REQUIRED');
        return;
      }

      const user = await userRepository.findById(req.user.userId);
      if (!user) {
        throw new AppError('User not found', 404, 'USER_NOT_FOUND');
      }

      const profile = await userProfileRepository.findByUserId(req.user.userId);

      ApiResponse.success(res, 'Profile retrieved successfully.', {
        user: {
          id: user._id.toString(),
          fullName: user.fullName,
          email: user.email,
          role: user.role,
          accountStatus: user.accountStatus,
          emailVerified: user.emailVerified,
          createdAt: user.createdAt,
        },
        profile: profile || {},
      });
    } catch (error) {
      next(error);
    }
  }

  public async updateProfile(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user?.userId) {
        ApiResponse.error(res, 'Authentication required', 401, 'AUTH_REQUIRED');
        return;
      }

      const { targetExam, targetYear, gender, phoneNumber, preferredSubjects } = req.body;

      const updatedProfile = await userProfileRepository.updateByUserId(req.user.userId, {
        targetExam,
        targetYear,
        gender,
        phoneNumber,
        preferredSubjects,
      });

      ApiResponse.success(res, 'Profile updated successfully.', { profile: updatedProfile });
    } catch (error) {
      next(error);
    }
  }
}

export const userController = new UserController();
