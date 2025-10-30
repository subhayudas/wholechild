import express, { Request, Response } from 'express';
const router = express.Router();
import { childService } from '../services/childService';
import { auth } from '../middleware/auth';
import { createChildLogger } from '../utils/logger';

// @route   GET /api/children
// @desc    Get all children for authenticated user
// @access  Private
router.get('/', auth, async (req: Request, res: Response) => {
  const logger = req.logger || createChildLogger({ route: 'children/get-all' });

  try {
    const children = await childService.findAll(req.user?.id || '');
    logger.info({ count: children.length, userId: req.user?.id }, 'Children retrieved');
    res.json(children);
  } catch (err) {
    logger.error({ err }, 'Error fetching children');
    res.status(500).json({ msg: 'Server error' });
  }
});

// @route   GET /api/children/:id
// @desc    Get single child by ID
// @access  Private
router.get('/:id', auth, async (req: Request, res: Response) => {
  const logger = req.logger || createChildLogger({ route: 'children/get-one' });

  try {
    const child = await childService.findById(req.params.id, req.user?.id || '');
    
    if (!child) {
      logger.warn({ childId: req.params.id }, 'Child not found');
      return res.status(404).json({ msg: 'Child not found' });
    }

    logger.debug({ childId: req.params.id }, 'Child retrieved');
    res.json(child);
  } catch (err) {
    logger.error({ err, childId: req.params.id }, 'Error fetching child');
    res.status(500).json({ msg: 'Server error' });
  }
});

// @route   POST /api/children
// @desc    Create new child profile
// @access  Private
router.post('/', auth, async (req: Request, res: Response) => {
  const logger = req.logger || createChildLogger({ route: 'children/create' });

  try {
    const childData = {
      ...req.body,
      userId: req.user?.id || '',
      totalPoints: req.body.totalPoints || 0,
      currentStreak: req.body.currentStreak || 0
    };

    const child = await childService.create(childData);

    logger.info({ childId: child.id, userId: req.user?.id }, 'Child created');
    res.json(child);
  } catch (err) {
    logger.error({ err }, 'Error creating child');
    res.status(500).json({ msg: 'Server error' });
  }
});

// @route   PUT /api/children/:id
// @desc    Update child profile
// @access  Private
router.put('/:id', auth, async (req: Request, res: Response) => {
  const logger = req.logger || createChildLogger({ route: 'children/update' });

  try {
    const child = await childService.update(req.params.id, req.user?.id || '', req.body);

    if (!child) {
      logger.warn({ childId: req.params.id }, 'Child not found for update');
      return res.status(404).json({ msg: 'Child not found' });
    }

    logger.info({ childId: req.params.id }, 'Child updated');
    res.json(child);
  } catch (err) {
    logger.error({ err, childId: req.params.id }, 'Error updating child');
    res.status(500).json({ msg: 'Server error' });
  }
});

// @route   DELETE /api/children/:id
// @desc    Delete child profile
// @access  Private
router.delete('/:id', auth, async (req: Request, res: Response) => {
  const logger = req.logger || createChildLogger({ route: 'children/delete' });

  try {
    await childService.delete(req.params.id, req.user?.id || '');

    logger.info({ childId: req.params.id }, 'Child deleted');
    res.json({ msg: 'Child deleted successfully' });
  } catch (err) {
    logger.error({ err, childId: req.params.id }, 'Error deleting child');
    res.status(500).json({ msg: 'Server error' });
  }
});

// @route   POST /api/children/:id/complete-activity
// @desc    Record activity completion
// @access  Private
router.post('/:id/complete-activity', auth, async (req: Request, res: Response) => {
  const logger = req.logger || createChildLogger({ route: 'children/complete-activity' });

  try {
    const { activityId, duration, notes, photos, observations } = req.body;

    await childService.addActivityHistory(
      req.params.id,
      req.user?.id || '',
      {
        activityId,
        completedAt: new Date().toISOString(),
        duration: duration || 0,
        notes: notes || '',
        photos: photos || [],
        observations: observations || []
      }
    );

    const child = await childService.findById(req.params.id, req.user?.id || '');

    logger.info({ childId: req.params.id, activityId }, 'Activity completion recorded');
    res.json(child);
  } catch (err) {
    logger.error({ err, childId: req.params.id }, 'Error recording activity completion');
    res.status(500).json({ msg: 'Server error' });
  }
});

// @route   POST /api/children/:id/achievement
// @desc    Add achievement to child
// @access  Private
router.post('/:id/achievement', auth, async (req: Request, res: Response) => {
  const logger = req.logger || createChildLogger({ route: 'children/add-achievement' });

  try {
    const { id, title, description, category } = req.body;

    await childService.addAchievement(
      req.params.id,
      req.user?.id || '',
      {
        achievementId: id || Date.now().toString(),
        title,
        description,
        category: category as 'milestone' | 'streak' | 'skill' | 'creativity'
      }
    );

    const child = await childService.findById(req.params.id, req.user?.id || '');

    logger.info({ childId: req.params.id, achievementTitle: title }, 'Achievement added');
    res.json(child);
  } catch (err) {
    logger.error({ err, childId: req.params.id }, 'Error adding achievement');
    res.status(500).json({ msg: 'Server error' });
  }
});

export default router;

