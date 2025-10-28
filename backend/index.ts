import express, { Request, Response } from 'express';
import cors from 'cors';
import 'dotenv/config';
import openaiRoutes from './routes/openai';
import authRoutes from './routes/auth';
import logger from './utils/logger';
import { requestLoggingMiddleware, errorLoggingMiddleware } from './middleware/requestLogger';
import { connectDatabase, setupDatabaseEventListeners, getDatabaseStatus, checkDatabaseHealth } from './utils/database';

const app = express();
const PORT = process.env.PORT || 3001;

// Database Connection and Event Listeners
setupDatabaseEventListeners();

// Initialize database connection
connectDatabase()
  .catch(err => {
    logger.error({ err }, 'Failed to connect to database');
    process.exit(1);
  });


// Middleware
app.use(cors({
  origin: 'http://localhost:5173' // Allow requests from our Vite frontend
}));
app.use(express.json()); // To parse JSON request bodies

// Request logging middleware
app.use(requestLoggingMiddleware);

app.use('/api', openaiRoutes);
app.use('/api/auth', authRoutes);

// Health check routes
app.get('/', (req: Request, res: Response) => {
  req.logger.debug('Health check endpoint accessed');
  res.send('Backend server is running!');
});

// Database health check route
app.get('/health/database', async (req: Request, res: Response) => {
  req.logger.debug('Database health check requested');
  
  try {
    const status = getDatabaseStatus();
    const isHealthy = await checkDatabaseHealth();
    
    const healthData = {
      ...status,
      healthy: isHealthy,
      timestamp: new Date().toISOString()
    };
    
    req.logger.info({ healthData }, 'Database health check completed');
    
    if (isHealthy) {
      res.json(healthData);
    } else {
      res.status(503).json({ ...healthData, error: 'Database not healthy' });
    }
  } catch (error) {
    req.logger.error({ error }, 'Database health check failed');
    res.status(500).json({ error: 'Health check failed' });
  }
});

// Error logging middleware (should be last)
app.use(errorLoggingMiddleware);

app.listen(PORT, () => {
  logger.info({ port: PORT }, `Server is running on http://localhost:${PORT}`);
}); 