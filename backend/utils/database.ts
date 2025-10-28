import mongoose from 'mongoose';
import { createChildLogger } from './logger';

const dbLogger = createChildLogger({ service: 'database' });

// Connection state management
let isConnected = false;
let isConnecting = false;

/**
 * MongoDB connection options
 */
const getConnectionOptions = () => {
  const options: mongoose.ConnectOptions = {
    // Server API version for MongoDB compatibility
    serverApi: { 
      version: '1' as const, 
      strict: true, 
      deprecationErrors: true 
    },
    // Connection pool settings
    maxPoolSize: 10,
    minPoolSize: 2,
    maxIdleTimeMS: 30000,
    serverSelectionTimeoutMS: 5000,
    socketTimeoutMS: 45000,
    // Buffer settings
    bufferCommands: false,
  };

  return options;
};

/**
 * Connect to MongoDB with retry logic
 */
export const connectDatabase = async (retries = 3): Promise<void> => {
  if (isConnected) {
    dbLogger.debug('Database already connected');
    return;
  }

  if (isConnecting) {
    dbLogger.debug('Database connection in progress');
    return;
  }

  const databaseUrl = process.env.DATABASE_URL;
  
  if (!databaseUrl) {
    const error = new Error('DATABASE_URL environment variable is not set');
    dbLogger.error({ error }, 'Database configuration error');
    throw error;
  }

  isConnecting = true;

  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      dbLogger.info({ attempt, maxRetries: retries }, 'Attempting database connection');
      
      const options = getConnectionOptions();
      await mongoose.connect(databaseUrl, options);
      
      isConnected = true;
      isConnecting = false;
      
      dbLogger.info({ 
        host: mongoose.connection.host,
        database: mongoose.connection.name,
        readyState: mongoose.connection.readyState
      }, 'MongoDB connected successfully');
      
      return;
    } catch (error) {
      dbLogger.error({ 
        error, 
        attempt, 
        maxRetries: retries 
      }, `Database connection attempt ${attempt} failed`);
      
      if (attempt === retries) {
        isConnecting = false;
        throw new Error(`Failed to connect to database after ${retries} attempts: ${error}`);
      }
      
      // Wait before retry (exponential backoff)
      const delay = Math.min(1000 * Math.pow(2, attempt - 1), 10000);
      dbLogger.debug({ delay }, `Retrying connection in ${delay}ms`);
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }
};

/**
 * Disconnect from MongoDB
 */
export const disconnectDatabase = async (): Promise<void> => {
  if (!isConnected) {
    dbLogger.debug('Database not connected, skipping disconnect');
    return;
  }

  try {
    dbLogger.info('Disconnecting from database');
    await mongoose.disconnect();
    
    isConnected = false;
    
    dbLogger.info('Database disconnected successfully');
  } catch (error) {
    dbLogger.error({ error }, 'Error disconnecting from database');
    throw error;
  }
};

/**
 * Get database connection status
 */
export const getDatabaseStatus = () => {
  return {
    isConnected,
    isConnecting,
    readyState: mongoose.connection.readyState,
    host: mongoose.connection.host,
    database: mongoose.connection.name,
    // MongoDB connection states: 0 = disconnected, 1 = connected, 2 = connecting, 3 = disconnecting
    readyStateText: ['disconnected', 'connected', 'connecting', 'disconnecting'][mongoose.connection.readyState]
  };
};

/**
 * Setup database event listeners
 */
export const setupDatabaseEventListeners = (): void => {
  // Connection successful
  mongoose.connection.on('connected', () => {
    isConnected = true;
    dbLogger.info('Database connection established');
  });

  // Connection error
  mongoose.connection.on('error', (error) => {
    dbLogger.error({ error }, 'Database connection error');
  });

  // Connection disconnected
  mongoose.connection.on('disconnected', () => {
    isConnected = false;
    dbLogger.warn('Database connection lost');
  });

  // Connection reconnected
  mongoose.connection.on('reconnected', () => {
    isConnected = true;
    dbLogger.info('Database reconnected');
  });

  // MongoDB driver errors
  mongoose.connection.on('reconnectFailed', () => {
    dbLogger.error('Database reconnection failed');
  });

  // Process termination handlers
  process.on('SIGINT', async () => {
    dbLogger.info('Received SIGINT, closing database connection');
    await disconnectDatabase();
    process.exit(0);
  });

  process.on('SIGTERM', async () => {
    dbLogger.info('Received SIGTERM, closing database connection');
    await disconnectDatabase();
    process.exit(0);
  });
};

/**
 * Health check for database connection
 */
export const checkDatabaseHealth = async (): Promise<boolean> => {
  try {
    if (!isConnected) {
      return false;
    }

    // Ping the database
    await mongoose.connection.db?.admin().ping();
    dbLogger.debug('Database health check passed');
    return true;
  } catch (error) {
    dbLogger.error({ error }, 'Database health check failed');
    return false;
  }
};

// Export the mongoose connection for advanced usage
export { mongoose };

// Export connection state for monitoring
export const getConnectionState = () => ({ isConnected, isConnecting });
