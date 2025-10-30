import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import User from '../models/User';
import { createChildLogger } from '../utils/logger';

// Extend Express Request to include user property
declare global {
  namespace Express {
    interface Request {
      user?: {
        id: string;
        email: string;
        name: string;
        role: string;
      };
    }
  }
}

export const auth = async (req: Request, res: Response, next: NextFunction) => {
  const logger = req.logger || createChildLogger({ route: 'auth-middleware' });

  try {
    // Get token from header
    const token = req.header('Authorization')?.replace('Bearer ', '');

    if (!token) {
      logger.warn('No token provided');
      return res.status(401).json({ msg: 'No token, authorization denied' });
    }

    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET || '') as { user: { id: string } };

    // Get user from database
    const user = await User.findById(decoded.user.id).select('-password');
    
    if (!user) {
      logger.warn({ userId: decoded.user.id }, 'User not found');
      return res.status(401).json({ msg: 'Token is not valid' });
    }

    // Add user to request
    req.user = {
      id: user._id.toString(),
      email: user.email,
      name: user.name,
      role: user.role
    };

    logger.debug({ userId: user._id }, 'User authenticated');
    next();
  } catch (err) {
    logger.error({ err }, 'Token verification failed');
    res.status(401).json({ msg: 'Token is not valid' });
  }
};



