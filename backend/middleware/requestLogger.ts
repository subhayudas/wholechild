/* eslint-disable @typescript-eslint/no-namespace */
import { Request, Response, NextFunction } from 'express';
import { createRequestLogger } from '../utils/logger';

// Extend Express Request interface to include logger
declare global {
  namespace Express {
    interface Request {
      logger: ReturnType<typeof createRequestLogger>;
      startTime: number;
    }
  }
}

/**
 * HTTP request logging middleware
 * Logs incoming requests and responses with minimal info
 */
export const requestLoggingMiddleware = (req: Request, res: Response, next: NextFunction) => {
  // Add start time for response time calculation
  req.startTime = Date.now();
  
  // Create request-specific logger
  req.logger = createRequestLogger(req);
  
  // Log incoming request - minimal info only
  req.logger.info({
    type: 'http_request',
    method: req.method,
    path: req.path,
    query: Object.keys(req.query).length > 0 ? req.query : undefined,
    ip: req.ip || req.socket.remoteAddress
  }, 'Incoming request');

  // Capture original end function
  const originalEnd = res.end;
  
  // Override end function to log response
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  res.end = function (...args: any[]) {
    const responseTime = Date.now() - req.startTime;
    
    // Log response - minimal info only
    req.logger.info({
      type: 'http_response',
      statusCode: res.statusCode,
      responseTime: `${responseTime}ms`,
      contentLength: res.get('Content-Length')
    }, 'Request completed');
    
    // Call original end function and return its result
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    return originalEnd.apply(this, args);
  };

  next();
};

/**
 * Error logging middleware
 * Should be placed after all other middleware and routes
 */
export const errorLoggingMiddleware = (error: Error, req: Request, res: Response, next: NextFunction) => {
  const logger = req.logger || createRequestLogger(req);
  
  logger.error({
    type: 'http_error',
    error: {
      name: error.name,
      message: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    },
    method: req.method,
    path: req.path,
    statusCode: res.statusCode
  }, 'Request error');

  next(error);
};
