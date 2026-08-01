import app from './app';
import { envConfig } from './config/env.config';
import { connectDatabase, disconnectDatabase } from './config/db.config';
import { logger } from './utils/logger';

const startServer = async (): Promise<void> => {
  await connectDatabase();

  const server = app.listen(envConfig.port, () => {
    logger.info(`Server running in ${envConfig.nodeEnv} mode on port ${envConfig.port}`);
  });

  const gracefulShutdown = async (signal: string) => {
    logger.info(`Received ${signal}. Shutting down gracefully...`);
    server.close(async () => {
      await disconnectDatabase();
      logger.info('HTTP server closed.');
      process.exit(0);
    });
  };

  process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
  process.on('SIGINT', () => gracefulShutdown('SIGINT'));
};

if (process.env.NODE_ENV !== 'test') {
  startServer();
}
