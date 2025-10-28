import pino from 'pino';
import { Request } from 'express';

// Environment-based configuration
const isProduction = process.env.NODE_ENV === 'production';
const logLevel = process.env.LOG_LEVEL || (isProduction ? 'info' : 'debug');

// Create transport configuration based on environment
const transport = isProduction ? undefined : {
  target: 'pino-pretty',
  options: {
    colorize: true,
    translateTime: 'yyyy-mm-dd HH:MM:ss.l',
    ignore: 'pid,hostname',
    levelFirst: true,
    messageFormat: '{msg}',
    colorizeObjects: true,
  }
};

// Create logger with minimal configuration
const logger = pino({
  level: logLevel,
  transport,
  // Production settings - structured JSON logs
  ...(isProduction && {
    formatters: {
      level: (label) => ({ level: label }),
    }
  }),
  // Base fields - minimal info only
  base: isProduction ? {
    env: process.env.NODE_ENV
  } : undefined,
});

// Helper function to create child loggers with context
export const createChildLogger = (context: Record<string, unknown>) => {
  return logger.child(context);
};

// Request logger for HTTP middleware
export const createRequestLogger = (req: Request & { id?: string }) => {
  const reqId = req.id || Math.random().toString(36).slice(2, 11);
  return logger.child({
    reqId,
    method: req.method,
    url: req.url,
  });
};

// Export the main logger
export default logger;

// Export types for TypeScript
export type Logger = typeof logger;
