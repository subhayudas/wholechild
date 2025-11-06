import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { userService } from '../services/userService';
import { getSupabaseClient } from '../utils/supabase';
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

    let userId: string | null = null;

    // First, try to verify as Supabase JWT token
    // Supabase tokens are JWTs with user ID in the 'sub' claim
    let decoded: any = null;
    try {
      // Decode the token to check its structure (without verification for now)
      decoded = jwt.decode(token) as any;
      
      // Supabase JWT tokens have:
      // - 'sub' claim containing the user ID
      // - 'aud' claim containing the audience (usually the anon key)
      // - 'iss' claim containing the issuer (Supabase URL)
      if (decoded && decoded.sub && (decoded.iss?.includes('supabase') || decoded.aud)) {
        // This looks like a Supabase token
        // Extract user ID from 'sub' claim
        userId = decoded.sub;
        logger.debug({ userId }, 'Authenticated via Supabase token (decoded)');
        
        // Optional: Verify token hasn't expired
        if (decoded.exp && decoded.exp < Date.now() / 1000) {
          logger.warn({ userId }, 'Supabase token has expired');
          userId = null;
        }
      }
    } catch (supabaseError) {
      logger.debug({ error: supabaseError }, 'Token is not a Supabase token, trying custom JWT');
    }

    // If Supabase verification failed, try custom JWT verification
    if (!userId) {
      try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET || '') as { user: { id: string } };
        userId = decoded.user.id;
        logger.debug({ userId }, 'Authenticated via custom JWT token');
      } catch (jwtError) {
        logger.warn({ error: jwtError }, 'Token verification failed');
        return res.status(401).json({ msg: 'Token is not valid' });
      }
    }

    if (!userId) {
      return res.status(401).json({ msg: 'Token is not valid' });
    }

    // Get user from Supabase database
    let user = await userService.findById(userId);
    
    // If user doesn't exist and we have a Supabase token, try to create them
    if (!user && decoded && decoded.sub && (decoded.iss?.includes('supabase') || decoded.aud)) {
      logger.debug({ userId }, 'User not found, attempting to create from Supabase auth');
      
      try {
        // Extract user info from decoded token
        // Note: Supabase JWT tokens may not have email/user_metadata in the token itself
        // We'll try to get it from the token, but if not available, use defaults
        const email = decoded.email || `user_${userId}@placeholder.local`;
        const name = decoded.user_metadata?.full_name || 
                     decoded.user_metadata?.name || 
                     email.split('@')[0] || 
                     'User';
        const role = decoded.user_metadata?.role || 'parent';
        const avatar = decoded.user_metadata?.avatar_url || 
                      decoded.user_metadata?.picture || 
                      '';
        
        // Try to create user with minimal info
        try {
          user = await userService.create({
            name,
            email,
            password: null, // OAuth users don't have passwords (will use dummy hash)
            role: role as 'parent' | 'educator' | 'therapist',
            avatar: avatar || ''
          });
          logger.info({ userId }, 'User created from Supabase auth token');
        } catch (createError: any) {
          // If creation fails due to conflict (user already exists), try to find again
          if (createError.message?.includes('duplicate') || 
              createError.message?.includes('already exists') ||
              createError.message?.includes('unique constraint')) {
            // User was created between check and insert, fetch it now
            user = await userService.findById(userId);
          }
          
          // If still not found, log and return error
          if (!user) {
            logger.warn({ userId, error: createError }, 'Failed to create user from Supabase token');
            return res.status(401).json({ msg: 'User not found and could not be created' });
          }
        }
      } catch (error) {
        logger.error({ userId, error }, 'Error creating user from Supabase token');
        return res.status(401).json({ msg: 'User not found' });
      }
    }
    
    if (!user) {
      logger.warn({ userId }, 'User not found in database');
      return res.status(401).json({ msg: 'User not found' });
    }

    // Add user to request
    req.user = {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role
    };

    logger.debug({ userId: user.id }, 'User authenticated');
    next();
  } catch (err) {
    logger.error({ err }, 'Token verification failed');
    res.status(401).json({ msg: 'Token is not valid' });
  }
};



