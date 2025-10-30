import express, { Request, Response } from 'express';
const router = express.Router();
import { therapyService } from '../services/therapyService';
import { auth } from '../middleware/auth';
import { createChildLogger } from '../utils/logger';

// ========================================
// Therapy Sessions Routes
// ========================================

// @route   GET /api/therapy/sessions/:childId
// @desc    Get all therapy sessions for a child
// @access  Private
router.get('/sessions/:childId', auth, async (req: Request, res: Response) => {
  const logger = req.logger || createChildLogger({ route: 'therapy/get-sessions' });

  try {
    const sessions = await therapyService.findAllSessions(req.params.childId, req.user?.id || '');
    logger.info({ count: sessions.length, childId: req.params.childId }, 'Therapy sessions retrieved');
    res.json(sessions);
  } catch (err) {
    logger.error({ err, childId: req.params.childId }, 'Error fetching therapy sessions');
    res.status(500).json({ msg: 'Server error' });
  }
});

// @route   POST /api/therapy/sessions
// @desc    Create therapy session
// @access  Private
router.post('/sessions', auth, async (req: Request, res: Response) => {
  const logger = req.logger || createChildLogger({ route: 'therapy/create-session' });

  try {
    const sessionData = {
      ...req.body,
      userId: req.user?.id,
      goals: req.body.goals || [],
      activities: req.body.activities || [],
      recordings: req.body.recordings || [],
      progress: {
        goalsAchieved: req.body.progress?.goalsAchieved || 0,
        totalGoals: req.body.progress?.totalGoals || 0,
        notes: req.body.progress?.notes || ''
      }
    };

    const session = await therapyService.createSession(sessionData);

    logger.info({ sessionId: session.id, childId: req.body.childId }, 'Therapy session created');
    res.json(session);
  } catch (err) {
    logger.error({ err }, 'Error creating therapy session');
    res.status(500).json({ msg: 'Server error' });
  }
});

// @route   PUT /api/therapy/sessions/:id
// @desc    Update therapy session
// @access  Private
router.put('/sessions/:id', auth, async (req: Request, res: Response) => {
  const logger = req.logger || createChildLogger({ route: 'therapy/update-session' });

  try {
    const session = await therapyService.updateSession(req.params.id, req.user?.id || '', req.body);

    logger.info({ sessionId: req.params.id }, 'Therapy session updated');
    res.json(session);
  } catch (err) {
    logger.error({ err, sessionId: req.params.id }, 'Error updating therapy session');
    res.status(500).json({ msg: 'Server error' });
  }
});

// @route   DELETE /api/therapy/sessions/:id
// @desc    Delete therapy session
// @access  Private
router.delete('/sessions/:id', auth, async (req: Request, res: Response) => {
  const logger = req.logger || createChildLogger({ route: 'therapy/delete-session' });

  try {
    await therapyService.deleteSession(req.params.id, req.user?.id || '');

    logger.info({ sessionId: req.params.id }, 'Therapy session deleted');
    res.json({ msg: 'Therapy session deleted successfully' });
  } catch (err) {
    logger.error({ err, sessionId: req.params.id }, 'Error deleting therapy session');
    res.status(500).json({ msg: 'Server error' });
  }
});

// ========================================
// Therapy Goals Routes
// ========================================

// @route   GET /api/therapy/goals/:childId
// @desc    Get all speech and OT goals for a child
// @access  Private
router.get('/goals/:childId', auth, async (req: Request, res: Response) => {
  const logger = req.logger || createChildLogger({ route: 'therapy/get-goals' });

  try {
    const [speechGoals, otGoals] = await Promise.all([
      therapyService.findAllSpeechGoals(req.params.childId, req.user?.id || ''),
      therapyService.findAllOTGoals(req.params.childId, req.user?.id || '')
    ]);

    logger.info({ 
      speechCount: speechGoals.length, 
      otCount: otGoals.length, 
      childId: req.params.childId 
    }, 'Therapy goals retrieved');

    res.json({
      speech: speechGoals,
      ot: otGoals
    });
  } catch (err) {
    logger.error({ err, childId: req.params.childId }, 'Error fetching therapy goals');
    res.status(500).json({ msg: 'Server error' });
  }
});

// @route   POST /api/therapy/goals/speech
// @desc    Create speech goal
// @access  Private
router.post('/goals/speech', auth, async (req: Request, res: Response) => {
  const logger = req.logger || createChildLogger({ route: 'therapy/create-speech-goal' });

  try {
    const goalData = {
      ...req.body,
      userId: req.user?.id,
      activities: req.body.activities || [],
      progress: req.body.progress || []
    };

    const goal = await therapyService.createSpeechGoal(goalData);

    logger.info({ goalId: goal.id, childId: req.body.childId }, 'Speech goal created');
    res.json(goal);
  } catch (err) {
    logger.error({ err }, 'Error creating speech goal');
    res.status(500).json({ msg: 'Server error' });
  }
});

// @route   POST /api/therapy/goals/ot
// @desc    Create OT goal
// @access  Private
router.post('/goals/ot', auth, async (req: Request, res: Response) => {
  const logger = req.logger || createChildLogger({ route: 'therapy/create-ot-goal' });

  try {
    const goalData = {
      ...req.body,
      userId: req.user?.id,
      activities: req.body.activities || [],
      progress: req.body.progress || []
    };

    const goal = await therapyService.createOTGoal(goalData);

    logger.info({ goalId: goal.id, childId: req.body.childId }, 'OT goal created');
    res.json(goal);
  } catch (err) {
    logger.error({ err }, 'Error creating OT goal');
    res.status(500).json({ msg: 'Server error' });
  }
});

// @route   PUT /api/therapy/goals/speech/:id
// @desc    Update speech goal
// @access  Private
router.put('/goals/speech/:id', auth, async (req: Request, res: Response) => {
  const logger = req.logger || createChildLogger({ route: 'therapy/update-speech-goal' });

  try {
    const goal = await therapyService.updateSpeechGoal(req.params.id, req.user?.id || '', req.body);

    logger.info({ goalId: req.params.id }, 'Speech goal updated');
    res.json(goal);
  } catch (err) {
    logger.error({ err, goalId: req.params.id }, 'Error updating speech goal');
    res.status(500).json({ msg: 'Server error' });
  }
});

// @route   PUT /api/therapy/goals/ot/:id
// @desc    Update OT goal
// @access  Private
router.put('/goals/ot/:id', auth, async (req: Request, res: Response) => {
  const logger = req.logger || createChildLogger({ route: 'therapy/update-ot-goal' });

  try {
    const goal = await therapyService.updateOTGoal(req.params.id, req.user?.id || '', req.body);

    logger.info({ goalId: req.params.id }, 'OT goal updated');
    res.json(goal);
  } catch (err) {
    logger.error({ err, goalId: req.params.id }, 'Error updating OT goal');
    res.status(500).json({ msg: 'Server error' });
  }
});

// @route   DELETE /api/therapy/goals/speech/:id
// @desc    Delete speech goal
// @access  Private
router.delete('/goals/speech/:id', auth, async (req: Request, res: Response) => {
  const logger = req.logger || createChildLogger({ route: 'therapy/delete-speech-goal' });

  try {
    await therapyService.deleteSpeechGoal(req.params.id, req.user?.id || '');

    logger.info({ goalId: req.params.id }, 'Speech goal deleted');
    res.json({ msg: 'Speech goal deleted successfully' });
  } catch (err) {
    logger.error({ err, goalId: req.params.id }, 'Error deleting speech goal');
    res.status(500).json({ msg: 'Server error' });
  }
});

// @route   DELETE /api/therapy/goals/ot/:id
// @desc    Delete OT goal
// @access  Private
router.delete('/goals/ot/:id', auth, async (req: Request, res: Response) => {
  const logger = req.logger || createChildLogger({ route: 'therapy/delete-ot-goal' });

  try {
    await therapyService.deleteOTGoal(req.params.id, req.user?.id || '');

    logger.info({ goalId: req.params.id }, 'OT goal deleted');
    res.json({ msg: 'OT goal deleted successfully' });
  } catch (err) {
    logger.error({ err, goalId: req.params.id }, 'Error deleting OT goal');
    res.status(500).json({ msg: 'Server error' });
  }
});

export default router;

