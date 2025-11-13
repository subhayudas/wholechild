import express, { Request, Response } from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import 'dotenv/config';
import openaiRoutes from './routes/openai';
import authRoutes from './routes/auth';
import childrenRoutes from './routes/children';
import activitiesRoutes from './routes/activities';
import learningStoriesRoutes from './routes/learningStories';
import logger from './utils/logger';
import { requestLoggingMiddleware, errorLoggingMiddleware } from './middleware/requestLogger';
import { initSupabase, checkSupabaseHealth } from './utils/supabase';

const app = express();
const PORT = process.env.PORT || 3001;

// Get __dirname equivalent for ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Initialize Supabase connection
try {
  initSupabase();
  logger.info('Supabase initialized');
} catch (err) {
  logger.error({ err }, 'Failed to initialize Supabase');
  process.exit(1);
}


// Middleware
app.use(cors({
  origin: 'http://localhost:5173' // Allow requests from our Vite frontend
}));
app.use(express.json()); // To parse JSON request bodies
app.use(express.urlencoded({ extended: true })); // For file uploads

// Serve static files from uploads directory
app.use('/uploads', express.static(path.join(__dirname, '../public/uploads')));

// Request logging middleware
app.use(requestLoggingMiddleware);

// API Routes
app.use('/api', openaiRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/children', childrenRoutes);
app.use('/api/activities', activitiesRoutes);
app.use('/api/learning-stories', learningStoriesRoutes);

// Health check routes
app.get('/', (req: Request, res: Response) => {
  req.logger.debug('Health check endpoint accessed');
  res.send('Backend server is running!');
});

// Database health check route
app.get('/health/database', async (req: Request, res: Response) => {
  req.logger.debug('Supabase health check requested');
  
  try {
    const isHealthy = await checkSupabaseHealth();
    
    const healthData = {
      healthy: isHealthy,
      timestamp: new Date().toISOString()
    };
    
    req.logger.info({ healthData }, 'Supabase health check completed');
    
    if (isHealthy) {
      res.json(healthData);
    } else {
      res.status(503).json({ ...healthData, error: 'Supabase not healthy' });
    }
  } catch (error) {
    req.logger.error({ error }, 'Supabase health check failed');
    res.status(500).json({ error: 'Health check failed' });
  }
});

// Error handling middleware (should be last)
app.use((err: Error, req: Request, res: Response, next: express.NextFunction) => {
  errorLoggingMiddleware(err, req, res, next);
  
  // Send error response
  res.status(500).json({
    error: 'Internal server error',
    message: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
});

// 404 handler
app.use((req: Request, res: Response) => {
  res.status(404).json({ error: 'Route not found' });
});

app.listen(PORT, () => {
  logger.info({ port: PORT }, `Server is running on http://localhost:${PORT}`);
}); 