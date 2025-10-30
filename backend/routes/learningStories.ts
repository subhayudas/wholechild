import express, { Request, Response } from 'express';
import multer from 'multer';
import path from 'path';
import { fileURLToPath } from 'url';
import { learningStoryService } from '../services/learningStoryService';
import { auth } from '../middleware/auth';
import { createChildLogger } from '../utils/logger';

const router = express.Router();

// Get __dirname equivalent for ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    // Store files in public/uploads directory
    cb(null, path.join(__dirname, '../../public/uploads/'));
  },
  filename: (req, file, cb) => {
    // Generate unique filename
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 10 * 1024 * 1024 // 10MB limit
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|gif|mp4|mov|mp3|wav/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);

    if (extname && mimetype) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type. Only images, videos, and audio files are allowed.'));
    }
  }
});

// @route   GET /api/learning-stories/:childId
// @desc    Get all learning stories for a child
// @access  Private
router.get('/:childId', auth, async (req: Request, res: Response) => {
  const logger = req.logger || createChildLogger({ route: 'learning-stories/get-all' });

  try {
    const stories = await learningStoryService.findAll(req.params.childId, req.user?.id || '');
    logger.info({ count: stories.length, childId: req.params.childId }, 'Learning stories retrieved');
    res.json(stories);
  } catch (err) {
    logger.error({ err, childId: req.params.childId }, 'Error fetching learning stories');
    res.status(500).json({ msg: 'Server error' });
  }
});

// @route   GET /api/learning-stories/single/:id
// @desc    Get single learning story by ID
// @access  Private
router.get('/single/:id', auth, async (req: Request, res: Response) => {
  const logger = req.logger || createChildLogger({ route: 'learning-stories/get-one' });

  try {
    const story = await learningStoryService.findById(req.params.id, req.user?.id || '');

    if (!story) {
      logger.warn({ storyId: req.params.id }, 'Learning story not found');
      return res.status(404).json({ msg: 'Learning story not found' });
    }

    logger.debug({ storyId: req.params.id }, 'Learning story retrieved');
    res.json(story);
  } catch (err) {
    logger.error({ err, storyId: req.params.id }, 'Error fetching learning story');
    res.status(500).json({ msg: 'Server error' });
  }
});

// @route   POST /api/learning-stories
// @desc    Create learning story with optional file uploads
// @access  Private
router.post('/', auth, upload.fields([
  { name: 'photos', maxCount: 10 },
  { name: 'videos', maxCount: 5 },
  { name: 'audio', maxCount: 5 }
]), async (req: Request, res: Response) => {
  const logger = req.logger || createChildLogger({ route: 'learning-stories/create' });

  try {
    const files = req.files as { [fieldname: string]: Express.Multer.File[] };
    
    // Build media URLs
    const media = {
      photos: [] as string[],
      videos: [] as string[],
      audio: [] as string[]
    };

    if (files.photos) {
      media.photos = files.photos.map(file => `/uploads/${file.filename}`);
    }
    if (files.videos) {
      media.videos = files.videos.map(file => `/uploads/${file.filename}`);
    }
    if (files.audio) {
      media.audio = files.audio.map(file => `/uploads/${file.filename}`);
    }

    // Merge with existing media if provided in body
    const storyData = {
      ...req.body,
      userId: req.user?.id,
      childId: req.body.childId,
      media: {
        photos: [...media.photos, ...(req.body.media?.photos || [])],
        videos: [...media.videos, ...(req.body.media?.videos || [])],
        audio: [...media.audio, ...(req.body.media?.audio || [])]
      },
      observations: req.body.observations || [],
      milestones: req.body.milestones || [],
      nextSteps: req.body.nextSteps || [],
      developmentalAreas: req.body.developmentalAreas || [],
      methodologyTags: req.body.methodologyTags || [],
      sharedWith: req.body.sharedWith || [],
      isPrivate: req.body.isPrivate || false,
      reactions: {
        hearts: req.body.reactions?.hearts || 0,
        celebrations: req.body.reactions?.celebrations || 0,
        insights: req.body.reactions?.insights || 0
      }
    };

    const story = await learningStoryService.create(storyData);

    logger.info({ storyId: story.id, childId: req.body.childId }, 'Learning story created');
    res.json(story);
  } catch (err) {
    logger.error({ err }, 'Error creating learning story');
    res.status(500).json({ msg: 'Server error' });
  }
});

// @route   PUT /api/learning-stories/:id
// @desc    Update learning story
// @access  Private
router.put('/:id', auth, upload.fields([
  { name: 'photos', maxCount: 10 },
  { name: 'videos', maxCount: 5 },
  { name: 'audio', maxCount: 5 }
]), async (req: Request, res: Response) => {
  const logger = req.logger || createChildLogger({ route: 'learning-stories/update' });

  try {
    const story = await learningStoryService.findById(req.params.id, req.user?.id || '');

    if (!story) {
      logger.warn({ storyId: req.params.id }, 'Learning story not found for update');
      return res.status(404).json({ msg: 'Learning story not found' });
    }

    const files = req.files as { [fieldname: string]: Express.Multer.File[] };
    
    // Update media if new files uploaded
    const updateData: any = { ...req.body };
    
    if (files) {
      const media = { ...story.media };
      
      if (files.photos) {
        media.photos = [...(media.photos || []), ...files.photos.map(f => `/uploads/${f.filename}`)];
      }
      if (files.videos) {
        media.videos = [...(media.videos || []), ...files.videos.map(f => `/uploads/${f.filename}`)];
      }
      if (files.audio) {
        media.audio = [...(media.audio || []), ...files.audio.map(f => `/uploads/${f.filename}`)];
      }
      
      updateData.media = media;
    }

    const updatedStory = await learningStoryService.update(req.params.id, req.user?.id || '', updateData);

    logger.info({ storyId: req.params.id }, 'Learning story updated');
    res.json(updatedStory);
  } catch (err) {
    logger.error({ err, storyId: req.params.id }, 'Error updating learning story');
    res.status(500).json({ msg: 'Server error' });
  }
});

// @route   DELETE /api/learning-stories/:id
// @desc    Delete learning story
// @access  Private
router.delete('/:id', auth, async (req: Request, res: Response) => {
  const logger = req.logger || createChildLogger({ route: 'learning-stories/delete' });

  try {
    await learningStoryService.delete(req.params.id, req.user?.id || '');

    logger.info({ storyId: req.params.id }, 'Learning story deleted');
    res.json({ msg: 'Learning story deleted successfully' });
  } catch (err) {
    logger.error({ err, storyId: req.params.id }, 'Error deleting learning story');
    res.status(500).json({ msg: 'Server error' });
  }
});

// @route   POST /api/learning-stories/:id/reaction
// @desc    Add reaction to learning story
// @access  Private
router.post('/:id/reaction', auth, async (req: Request, res: Response) => {
  const logger = req.logger || createChildLogger({ route: 'learning-stories/add-reaction' });

  try {
    const { type } = req.body; // 'hearts', 'celebrations', or 'insights'

    if (type === 'hearts' || type === 'celebrations' || type === 'insights') {
      const story = await learningStoryService.addReaction(req.params.id, req.user?.id || '', type);

      logger.info({ storyId: req.params.id, reactionType: type }, 'Reaction added');
      res.json(story);
    } else {
      res.status(400).json({ msg: 'Invalid reaction type' });
    }
  } catch (err) {
    logger.error({ err, storyId: req.params.id }, 'Error adding reaction');
    res.status(500).json({ msg: 'Server error' });
  }
});

export default router;

