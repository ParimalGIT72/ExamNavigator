import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import { OAuth2Client } from 'google-auth-library';
import { userRepository, UserRepository } from '../../user/repositories/user.repository';
import { userProfileRepository, UserProfileRepository } from '../../user/repositories/user-profile.repository';
import { envConfig } from '../../../config/env.config';
import { AppError } from '../../../utils/app-error';
import { emailService, EmailService } from '../../../utils/email.service';

export interface ITokenPayload {
  userId: string;
  email: string;
  role: 'Student' | 'Admin';
}

export interface IAuthResult {
  accessToken: string;
  refreshToken: string;
  user: {
    id: string;
    fullName: string;
    email: string;
    role: 'Student' | 'Admin';
    accountStatus: string;
    emailVerified: boolean;
    targetExam?: string;
  };
}

export class AuthService {
  private userRepo: UserRepository;
  private profileRepo: UserProfileRepository;
  private mailService: EmailService;
  private googleClient: OAuth2Client;

  constructor(
    userRepo = userRepository,
    profileRepo = userProfileRepository,
    mailService = emailService
  ) {
    this.userRepo = userRepo;
    this.profileRepo = profileRepo;
    this.mailService = mailService;
    this.googleClient = new OAuth2Client(envConfig.googleClientId);
  }

  public generateAccessToken(payload: ITokenPayload): string {
    return jwt.sign(payload, envConfig.jwtSecret, {
      expiresIn: envConfig.jwtExpiresIn as any,
    });
  }

  public generateRefreshToken(payload: ITokenPayload): string {
    return jwt.sign(payload, envConfig.refreshTokenSecret, {
      expiresIn: '7d',
    });
  }

  public async register(dto: {
    fullName: string;
    email: string;
    password: string;
    targetExam?: string;
  }): Promise<{ message: string; userId: string }> {
    const existingUser = await this.userRepo.findByEmail(dto.email);
    if (existingUser) {
      throw new AppError('Email address is already registered', 409, 'AUTH_EMAIL_EXISTS');
    }

    const hashedPassword = await bcrypt.hash(dto.password, 10);
    const verificationToken = crypto.randomBytes(32).toString('hex');

    const newUser = await this.userRepo.create({
      fullName: dto.fullName,
      email: dto.email.toLowerCase(),
      password: hashedPassword,
      role: 'Student',
      accountStatus: 'Active',
      emailVerified: false,
      verificationToken,
    });

    const newProfile = await this.profileRepo.create({
      userId: newUser._id,
      targetExam: (dto.targetExam as any) || 'JEE',
    });

    await this.userRepo.updateById(newUser._id.toString(), { profileId: newProfile._id });

    // Send verification email via email service stub
    await this.mailService.sendVerificationEmail(newUser.email, verificationToken);

    return {
      message: 'Registration successful. Please verify your email.',
      userId: newUser._id.toString(),
    };
  }

  public async login(dto: { email: string; password: string }): Promise<IAuthResult> {
    const user = await this.userRepo.findByEmail(dto.email, true);
    if (!user || !user.password) {
      throw new AppError('Invalid email or password', 401, 'AUTH_INVALID_CREDENTIALS');
    }

    const isMatch = await bcrypt.compare(dto.password, user.password);
    if (!isMatch) {
      throw new AppError('Invalid email or password', 401, 'AUTH_INVALID_CREDENTIALS');
    }

    if (user.accountStatus === 'Suspended') {
      throw new AppError('Your account has been suspended. Please contact support.', 403, 'AUTH_ACCOUNT_SUSPENDED');
    }

    const tokenPayload: ITokenPayload = {
      userId: user._id.toString(),
      email: user.email,
      role: user.role,
    };

    const accessToken = this.generateAccessToken(tokenPayload);
    const refreshToken = this.generateRefreshToken(tokenPayload);

    const hashedRefreshToken = await bcrypt.hash(refreshToken, 10);
    await this.userRepo.updateById(user._id.toString(), { refreshToken: hashedRefreshToken });

    const profile = await this.profileRepo.findByUserId(user._id.toString());

    return {
      accessToken,
      refreshToken,
      user: {
        id: user._id.toString(),
        fullName: user.fullName,
        email: user.email,
        role: user.role,
        accountStatus: user.accountStatus,
        emailVerified: user.emailVerified,
        targetExam: profile?.targetExam || 'JEE',
      },
    };
  }

  public async refreshAccessToken(refreshTokenInput: string): Promise<{ accessToken: string; refreshToken: string }> {
    try {
      const decoded = jwt.verify(refreshTokenInput, envConfig.refreshTokenSecret) as ITokenPayload;
      const user = await this.userRepo.findById(decoded.userId);

      if (!user || !user.refreshToken) {
        throw new AppError('Invalid refresh token', 401, 'AUTH_INVALID_REFRESH_TOKEN');
      }

      const isMatch = await bcrypt.compare(refreshTokenInput, user.refreshToken);
      if (!isMatch) {
        // Token reuse / compromise detected: invalidate stored refresh token
        await this.userRepo.updateById(user._id.toString(), { refreshToken: '' });
        throw new AppError('Invalid refresh token. Security compromise alert.', 401, 'AUTH_INVALID_REFRESH_TOKEN');
      }

      // True Refresh Token Rotation: Generate brand new access and refresh tokens
      const tokenPayload: ITokenPayload = {
        userId: user._id.toString(),
        email: user.email,
        role: user.role,
      };

      const newAccessToken = this.generateAccessToken(tokenPayload);
      const newRefreshToken = this.generateRefreshToken(tokenPayload);

      // Invalidate old token by replacing stored hash with new token hash
      const newHashedRefreshToken = await bcrypt.hash(newRefreshToken, 10);
      await this.userRepo.updateById(user._id.toString(), { refreshToken: newHashedRefreshToken });

      return {
        accessToken: newAccessToken,
        refreshToken: newRefreshToken,
      };
    } catch (err: any) {
      if (err instanceof AppError) throw err;
      throw new AppError('Invalid or expired refresh token', 401, 'AUTH_EXPIRED_REFRESH_TOKEN');
    }
  }

  public async logout(userId: string): Promise<void> {
    await this.userRepo.updateById(userId, { refreshToken: '' });
  }

  public async getCurrentUser(userId: string): Promise<IAuthResult['user']> {
    const user = await this.userRepo.findById(userId);
    if (!user) {
      throw new AppError('User not found', 404, 'USER_NOT_FOUND');
    }
    const profile = await this.profileRepo.findByUserId(user._id.toString());

    return {
      id: user._id.toString(),
      fullName: user.fullName,
      email: user.email,
      role: user.role,
      accountStatus: user.accountStatus,
      emailVerified: user.emailVerified,
      targetExam: profile?.targetExam || 'JEE',
    };
  }

  public async forgotPassword(email: string): Promise<{ resetToken: string }> {
    const user = await this.userRepo.findByEmail(email);
    if (!user) {
      return { resetToken: 'instructions_sent' };
    }

    const resetToken = crypto.randomBytes(32).toString('hex');
    const resetPasswordExpires = new Date(Date.now() + 3600000); // 1 hour

    await this.userRepo.updateById(user._id.toString(), {
      resetPasswordToken: resetToken,
      resetPasswordExpires,
    });

    // Log reset URL via email service stub
    await this.mailService.sendPasswordResetEmail(user.email, resetToken);

    return { resetToken };
  }

  public async resetPassword(token: string, newPassword: string): Promise<void> {
    const user = await this.userRepo.findByResetToken(token);
    if (!user) {
      throw new AppError('Invalid or expired password reset token', 400, 'AUTH_INVALID_RESET_TOKEN');
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    await this.userRepo.updateById(user._id.toString(), {
      password: hashedPassword,
      resetPasswordToken: undefined,
      resetPasswordExpires: undefined,
    });
  }

  public async verifyEmail(token: string): Promise<void> {
    const user = await this.userRepo.findByVerificationToken(token);
    if (!user) {
      throw new AppError('Invalid or expired email verification token', 400, 'AUTH_INVALID_VERIFY_TOKEN');
    }

    await this.userRepo.updateById(user._id.toString(), {
      emailVerified: true,
      verificationToken: undefined,
    });
  }

  public async googleAuth(googleToken: string): Promise<IAuthResult> {
    let email: string;
    let name: string;
    let sub: string;

    if (envConfig.googleClientId) {
      try {
        const ticket = await this.googleClient.verifyIdToken({
          idToken: googleToken,
          audience: envConfig.googleClientId,
        });
        const payload = ticket.getPayload();
        if (!payload || !payload.email) {
          throw new AppError('Invalid Google ID Token payload', 400, 'AUTH_GOOGLE_INVALID_TOKEN');
        }
        email = payload.email.toLowerCase();
        name = payload.name || 'Google User';
        sub = payload.sub;
      } catch (err: any) {
        if (err instanceof AppError) throw err;
        throw new AppError('Google token verification failed', 400, 'AUTH_GOOGLE_VERIFICATION_FAILED');
      }
    } else {
      // In development/testing when googleClientId is unset, simulate parsed payload securely
      sub = crypto.createHash('sha256').update(googleToken).digest('hex').substring(0, 16);
      email = `google_user_${sub}@gmail.com`;
      name = 'Google User';
    }

    let user = await this.userRepo.findByEmail(email, true);

    if (!user) {
      user = await this.userRepo.create({
        fullName: name,
        email,
        role: 'Student',
        accountStatus: 'Active',
        emailVerified: true,
        googleId: sub,
      });

      const newProfile = await this.profileRepo.create({
        userId: user._id,
        targetExam: 'JEE',
      });

      await this.userRepo.updateById(user._id.toString(), { profileId: newProfile._id });
    }

    const tokenPayload: ITokenPayload = {
      userId: user._id.toString(),
      email: user.email,
      role: user.role,
    };

    const accessToken = this.generateAccessToken(tokenPayload);
    const refreshToken = this.generateRefreshToken(tokenPayload);

    const hashedRefreshToken = await bcrypt.hash(refreshToken, 10);
    await this.userRepo.updateById(user._id.toString(), { refreshToken: hashedRefreshToken });

    const profile = await this.profileRepo.findByUserId(user._id.toString());

    return {
      accessToken,
      refreshToken,
      user: {
        id: user._id.toString(),
        fullName: user.fullName,
        email: user.email,
        role: user.role,
        accountStatus: user.accountStatus,
        emailVerified: user.emailVerified,
        targetExam: profile?.targetExam || 'JEE',
      },
    };
  }

  public async changePassword(userId: string, currentPassword: string, newPassword: string): Promise<void> {
    const user = await this.userRepo.findById(userId);
    if (!user || !user.password) {
      throw new AppError('User not found', 404, 'USER_NOT_FOUND');
    }

    const isMatch = await bcrypt.compare(currentPassword, user.password);
    if (!isMatch) {
      throw new AppError('Current password is incorrect', 400, 'AUTH_INVALID_CURRENT_PASSWORD');
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    await this.userRepo.updateById(userId, { password: hashedPassword });
  }
}

export const authService = new AuthService();
