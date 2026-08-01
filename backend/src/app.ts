import express, { Application } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import { envConfig } from './config/env.config';
import { healthRoutes } from './routes/health.routes';
import { errorHandler } from './middleware/error.middleware';

const app: Application = express();

// Security headers
app.use(helmet());

// CORS configuration
app.use(
  cors({
    origin: envConfig.corsOrigin,
    credentials: true,
  })
);

// Body parser
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Global rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per windowMs
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: 'Too many requests from this IP, please try again after 15 minutes',
    errorCode: 'TOO_MANY_REQUESTS',
  },
});
app.use('/api', limiter);

// Mount Health Check & Base Route
app.use('/api/v1', healthRoutes);

// Centralized error handler
app.use(errorHandler);

export default app;
