import mongoose from 'mongoose';
import { envConfig } from './env.config';
import { logger } from '../utils/logger';

const MAX_RETRIES = 5;
const RETRY_INTERVAL_MS = 3000;

export const connectDatabase = async (retries = MAX_RETRIES): Promise<void> => {
  let attempt = 0;
  while (attempt < retries) {
    try {
      attempt++;
      const conn = await mongoose.connect(envConfig.mongoUri);
      logger.info(`MongoDB Connected: ${conn.connection.host}`);
      return;
    } catch (error) {
      logger.error(`Database connection attempt ${attempt} of ${retries} failed`, error);
      if (attempt >= retries) {
        logger.error('Max database connection retries reached. Unable to establish database connection.');
        if (envConfig.nodeEnv === 'production') {
          throw error;
        } else {
          return;
        }
      }
      logger.info(`Retrying database connection in ${RETRY_INTERVAL_MS / 1000} seconds...`);
      await new Promise((resolve) => setTimeout(resolve, RETRY_INTERVAL_MS));
    }
  }
};

export const disconnectDatabase = async (): Promise<void> => {
  try {
    await mongoose.disconnect();
    logger.info('MongoDB Disconnected');
  } catch (error) {
    logger.error('Database disconnection error', error);
  }
};
