import { logger } from './logger';
import { envConfig } from '../config/env.config';

export interface IEmailService {
  sendVerificationEmail(email: string, token: string): Promise<void>;
  sendPasswordResetEmail(email: string, token: string): Promise<void>;
}

export class EmailService implements IEmailService {
  public async sendVerificationEmail(email: string, token: string): Promise<void> {
    const verifyUrl = `${envConfig.corsOrigin}/verify-email?token=${token}`;
    logger.info(`[EMAIL SERVICE] Send Verification Email to ${email}`);
    logger.info(`[EMAIL SERVICE] Verification URL: ${verifyUrl}`);
  }

  public async sendPasswordResetEmail(email: string, token: string): Promise<void> {
    const resetUrl = `${envConfig.corsOrigin}/reset-password?token=${token}`;
    logger.info(`[EMAIL SERVICE] Send Password Reset Email to ${email}`);
    logger.info(`[EMAIL SERVICE] Password Reset URL: ${resetUrl}`);
  }
}

export const emailService = new EmailService();
