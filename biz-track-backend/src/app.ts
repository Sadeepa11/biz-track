import express, { Application, Request, Response } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import { config } from './config/env';
import apiRoutes from './routes';
import { notFoundHandler } from './middleware/notFound.middleware';
import { errorHandler } from './middleware/error.middleware';

const app: Application = express();

// Security & utility middleware
app.use(helmet());
app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (like mobile apps, curl, Postman)
      if (!origin) return callback(null, true);
      if (config.corsOrigins.includes('*') || config.corsOrigins.includes(origin)) {
        return callback(null, true);
      }
      return callback(null, true); // Allow dev origins by default
    },
    credentials: true,
  })
);
app.use(express.json({ limit: '25mb' }));
app.use(express.urlencoded({ extended: true, limit: '25mb' }));
app.use(morgan(config.nodeEnv === 'development' ? 'dev' : 'combined'));

// Static serving for local uploads fallback
app.use('/uploads', express.static('public/uploads'));

// Welcome root endpoint
app.get('/', (_req: Request, res: Response) => {
  res.status(200).json({
    name: 'BizDesk Backend API',
    version: '1.0.0',
    status: 'online',
    endpoints: {
      health: '/api/health',
      overview: '/api/overview',
      metrics: '/api/overview/metrics',
      orders: '/api/overview/orders',
      revenue: '/api/overview/revenue',
    },
  });
});

// Prevent browser 304 / stale caching on dynamic API routes
app.use('/api', (_req, res, next) => {
  res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
  res.setHeader('Pragma', 'no-cache');
  res.setHeader('Expires', '0');
  next();
});

// Mount API routes
app.use('/api', apiRoutes);

// 404 & Error Handling
app.use(notFoundHandler);
app.use(errorHandler);

export default app;
