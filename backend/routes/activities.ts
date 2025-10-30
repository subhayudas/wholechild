import express, { Request, Response } from 'express';
const router = express.Router();
import { activityService } from '../services/activityService';
import { auth } from '../middleware/auth';
import { createChildLogger } from '../utils/logger';

// @route   GET /api/activities
// @desc    Get all activities for authenticated user (with optional filters)
// @access  Private
router.get('/', auth, async (req: Request, res: Response) => {
  const logger = req.logger || createChildLogger({ route: 'activities/get-all' });

  try {
    const { category, difficulty, methodologies, search, favorites } = req.query;
    const activities = await activityService.findAll(req.user?.id || '', {
      category: category as string | undefined,
      difficulty: difficulty ? parseInt(difficulty as string) : undefined,
      methodologies: methodologies ? (methodologies as string).split(',') : undefined,
      search: search as string | undefined,
      favorites: favorites === 'true'
    });
    logger.info({ count: activities.length, userId: req.user?.id }, 'Activities retrieved');
    res.json(activities);
  } catch (err) {
    logger.error({ err }, 'Error fetching activities');
    res.status(500).json({ msg: 'Server error' });
  }
});

// @route   GET /api/activities/recommended/:childId
// @desc    Get recommended activities for a child
// @access  Private
router.get('/recommended/:childId', auth, async (req: Request, res: Response) => {
  const logger = req.logger || createChildLogger({ route: 'activities/recommended' });

  try {
    const activities = await activityService.getRecommended(req.user?.id || '', 6);
    logger.debug({ childId: req.params.childId, count: activities.length }, 'Recommended activities retrieved');
    res.json(activities);
  } catch (err) {
    logger.error({ err, childId: req.params.childId }, 'Error fetching recommended activities');
    res.status(500).json({ msg: 'Server error' });
  }
});

// @route   GET /api/activities/:id
// @desc    Get single activity by ID
// @access  Private
router.get('/:id', auth, async (req: Request, res: Response) => {
  const logger = req.logger || createChildLogger({ route: 'activities/get-one' });

  try {
    const activity = await activityService.findById(req.params.id, req.user?.id || '');
    
    if (!activity) {
      logger.warn({ activityId: req.params.id }, 'Activity not found');
      return res.status(404).json({ msg: 'Activity not found' });
    }

    logger.debug({ activityId: req.params.id }, 'Activity retrieved');
    res.json(activity);
  } catch (err) {
    logger.error({ err, activityId: req.params.id }, 'Error fetching activity');
    res.status(500).json({ msg: 'Server error' });
  }
});

// @route   POST /api/activities
// @desc    Create/save activity (from AI or manual)
// @access  Private
router.post('/', auth, async (req: Request, res: Response) => {
  const logger = req.logger || createChildLogger({ route: 'activities/create' });

  try {
    const activityData = {
      ...req.body,
      userId: req.user?.id || '',
      rating: req.body.rating || 0,
      reviews: req.body.reviews || 0,
      isAIGenerated: req.body.isAIGenerated || false,
      isFavorite: req.body.isFavorite || false
    };

    const activity = await activityService.create(activityData);

    logger.info({ activityId: activity.id, userId: req.user?.id }, 'Activity created');
    res.json(activity);
  } catch (err) {
    logger.error({ err }, 'Error creating activity');
    res.status(500).json({ msg: 'Server error' });
  }
});

// @route   PUT /api/activities/:id
// @desc    Update activity
// @access  Private
router.put('/:id', auth, async (req: Request, res: Response) => {
  const logger = req.logger || createChildLogger({ route: 'activities/update' });

  try {
    const activity = await activityService.update(req.params.id, req.user?.id || '', req.body);

    if (!activity) {
      logger.warn({ activityId: req.params.id }, 'Activity not found for update');
      return res.status(404).json({ msg: 'Activity not found' });
    }

    logger.info({ activityId: req.params.id }, 'Activity updated');
    res.json(activity);
  } catch (err) {
    logger.error({ err, activityId: req.params.id }, 'Error updating activity');
    res.status(500).json({ msg: 'Server error' });
  }
});

// @route   DELETE /api/activities/:id
// @desc    Delete activity
// @access  Private
router.delete('/:id', auth, async (req: Request, res: Response) => {
  const logger = req.logger || createChildLogger({ route: 'activities/delete' });

  try {
    await activityService.delete(req.params.id, req.user?.id || '');

    logger.info({ activityId: req.params.id }, 'Activity deleted');
    res.json({ msg: 'Activity deleted successfully' });
  } catch (err) {
    logger.error({ err, activityId: req.params.id }, 'Error deleting activity');
    res.status(500).json({ msg: 'Server error' });
  }
});

// @route   POST /api/activities/:id/favorite
// @desc    Toggle favorite status of activity
// @access  Private
router.post('/:id/favorite', auth, async (req: Request, res: Response) => {
  const logger = req.logger || createChildLogger({ route: 'activities/toggle-favorite' });

  try {
    const activity = await activityService.toggleFavorite(req.params.id, req.user?.id || '');

    logger.info({ activityId: req.params.id, isFavorite: activity.isFavorite }, 'Activity favorite toggled');
    res.json(activity);
  } catch (err) {
    logger.error({ err, activityId: req.params.id }, 'Error toggling favorite');
    res.status(500).json({ msg: 'Server error' });
  }
});

export default router;

