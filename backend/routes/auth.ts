import express, { Request, Response } from 'express';
const router = express.Router();
import jwt from 'jsonwebtoken';
import { userService } from '../services/userService';
import { createChildLogger } from '../utils/logger';

// @route   POST /api/auth/register
// @desc    Register a new user
router.post('/register', async (req: Request, res: Response) => {
  const { name, email, password, role } = req.body;
  const logger = req.logger || createChildLogger({ route: 'auth/register' });

  try {
    logger.debug({ email }, 'User registration attempt');
    
    // Check if user already exists
    const existingUser = await userService.findByEmail(email);
    if (existingUser) {
      logger.warn({ email }, 'Registration failed - user already exists');
      return res.status(400).json({ msg: 'User already exists' });
    }

    // Create new user (password will be hashed in service)
    const user = await userService.create({
      name,
      email,
      password,
      role: role as 'parent' | 'educator' | 'therapist'
    });
    logger.info({ email, name, role }, 'User registered successfully');

    // Create and return JWT
    const payload = {
      user: {
        id: user.id
      }
    };

    jwt.sign(
      payload,
      process.env.JWT_SECRET || '',
      { expiresIn: '5h' }, // Token expires in 5 hours
      (err: Error | null, token?: string) => {
        if (err) {
          logger.error({ err }, 'JWT signing failed');
          throw err;
        }
        logger.debug({ userId: user.id }, 'JWT token generated');
        res.json({ 
          token,
          user: {
            id: user.id,
            name: user.name,
            email: user.email,
            role: user.role,
            avatar: user.avatar
          }
        });
      }
    );
  } catch (err) {
    logger.error({ err }, 'Registration error');
    res.status(500).send('Server error');
  }
});

// @route   POST /api/auth/login
// @desc    Authenticate user & get token
router.post('/login', async (req: Request, res: Response) => {
    const { email, password } = req.body;
    const logger = req.logger || createChildLogger({ route: 'auth/login' });

    try {
        logger.debug({ email }, 'User login attempt');
        
        // Check if user exists
        const user = await userService.findByEmail(email);
        if (!user) {
            logger.warn({ email }, 'Login failed - user not found');
            return res.status(400).json({ msg: 'Invalid credentials' });
        }

        // Check password
        const isMatch = await userService.comparePassword(password, user.password);
        if (!isMatch) {
            logger.warn({ email, userId: user.id }, 'Login failed - invalid password');
            return res.status(400).json({ msg: 'Invalid credentials' });
        }

        // Create and return JWT
        const payload = {
            user: {
                id: user.id
            }
        };

        jwt.sign(
            payload,
            process.env.JWT_SECRET || '',
            { expiresIn: '5h' },
            (err: Error | null, token?: string) => {
                if (err) {
                    logger.error({ err }, 'JWT signing failed during login');
                    throw err;
                }
                logger.info({ email, userId: user.id }, 'User logged in successfully');
                res.json({ 
                  token,
                  user: {
                    id: user.id,
                    name: user.name,
                    email: user.email,
                    role: user.role,
                    avatar: user.avatar
                  }
                });
            }
        );
    } catch (err) {
        logger.error({ err }, 'Login error');
        res.status(500).send('Server error');
    }
});

export default router; 