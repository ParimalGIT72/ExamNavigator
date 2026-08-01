import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(process.cwd(), '.env') });

const nodeEnv = process.env.NODE_ENV || 'development';
const jwtSecret = process.env.JWT_SECRET;
const refreshTokenSecret = process.env.REFRESH_TOKEN_SECRET;

if (nodeEnv === 'production') {
  if (!jwtSecret) {
    throw new Error('FATAL: JWT_SECRET environment variable is missing in production mode.');
  }
  if (!refreshTokenSecret) {
    throw new Error('FATAL: REFRESH_TOKEN_SECRET environment variable is missing in production mode.');
  }
}

export const envConfig = {
  port: parseInt(process.env.PORT || '5000', 10),
  nodeEnv,
  mongoUri: process.env.MONGODB_URI || 'mongodb://localhost:27017/exam_navigator',
  jwtSecret: jwtSecret || 'dev_jwt_secret_change_me_in_prod',
  jwtExpiresIn: process.env.JWT_EXPIRATION_TIME || '1d',
  refreshTokenSecret: refreshTokenSecret || 'dev_refresh_secret_change_me_in_prod',
  corsOrigin: process.env.CORS_ORIGIN || 'http://localhost:3000',
  geminiApiKey: process.env.GEMINI_API_KEY || '',
  googleClientId: process.env.GOOGLE_CLIENT_ID || '',
};
