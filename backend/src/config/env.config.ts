import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(process.cwd(), '.env') });

export const envConfig = {
  port: parseInt(process.env.PORT || '5000', 10),
  nodeEnv: process.env.NODE_ENV || 'development',
  mongoUri: process.env.MONGODB_URI || 'mongodb://localhost:27017/exam_navigator',
  jwtSecret: process.env.JWT_SECRET || 'default_jwt_secret_dev_only',
  jwtExpiresIn: process.env.JWT_EXPIRATION_TIME || '1d',
  refreshTokenSecret: process.env.REFRESH_TOKEN_SECRET || 'default_refresh_secret_dev_only',
  corsOrigin: process.env.CORS_ORIGIN || 'http://localhost:3000',
  geminiApiKey: process.env.GEMINI_API_KEY || '',
};
