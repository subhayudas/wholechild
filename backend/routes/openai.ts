import express, { Request, Response } from 'express';
const router = express.Router();
import {
  generateActivityWithAI,
  generateBulkActivities,
  generateActivityVariations,
  analyzeActivityQuality,
  testOpenAIConnection
} from '../services/openaiService';
import { createChildLogger } from '../utils/logger';

// ========================================
// SINGLE POINT OF VALIDATION
// All Zod schema validation happens here in the routes layer
// Services and frontend do NOT validate - only this layer does
// ========================================

// Load Zod schemas
import {
  AIGenerationRequestSchema,
  GenerateBulkActivitiesRequestSchema,
  GenerateActivityVariationsRequestSchema,
  AnalyzeActivityQualityRequestSchema
} from '../../shared/schemas';

// POST /api/generate-activity
// Generates a single activity based on the provided request
router.post('/generate-activity', async (req: Request, res: Response) => {
  const logger = req.logger || createChildLogger({ route: 'openai/generate-activity' });
  
  try {
    logger.debug('Activity generation request received');
    // Validate request with Zod - SINGLE POINT OF VALIDATION
    const validatedRequest = AIGenerationRequestSchema.parse(req.body);
    
    logger.debug({ activityType: validatedRequest.activityType }, 'Generating activity with AI');
    const generatedActivity = await generateActivityWithAI(validatedRequest);
    
    logger.debug('Activity generated successfully');
    res.json(generatedActivity);
  } catch (error) {
    logger.error({ error }, 'Error generating activity');
    res.status(500).json({ error: 'Failed to generate activity' });
  }
});

// POST /api/generate-bulk-activities
// Generates multiple activities with variations
router.post('/generate-bulk-activities', async (req: Request, res: Response) => {
  const logger = req.logger || createChildLogger({ route: 'openai/generate-bulk-activities' });
  
  try {
    logger.debug('Bulk activity generation request received');
    // Validate request with Zod - SINGLE POINT OF VALIDATION
    const { baseRequest, count, variationType } = GenerateBulkActivitiesRequestSchema.parse(req.body);

    logger.debug({ count, variationType }, 'Generating bulk activities');
    const activities = await generateBulkActivities(baseRequest, count, variationType);
    
    logger.debug({ activityCount: activities.length }, 'Bulk activities generated successfully');
    res.json(activities);
  } catch (error) {
    logger.error({ error }, 'Error generating bulk activities');
    res.status(500).json({ error: 'Failed to generate bulk activities' });
  }
});

// POST /api/generate-activity-variations
// Generates variations of an existing activity
router.post('/generate-activity-variations', async (req: Request, res: Response) => {
  const logger = req.logger || createChildLogger({ route: 'openai/generate-activity-variations' });
  
  try {
    logger.debug('Activity variations generation request received');
    // Validate request with Zod - SINGLE POINT OF VALIDATION
    const { baseActivity, count } = GenerateActivityVariationsRequestSchema.parse(req.body);

    logger.debug({ count, baseActivityTitle: baseActivity.title }, 'Generating activity variations');
    const variations = await generateActivityVariations(baseActivity, count);
    
    logger.debug({ variationCount: variations.length }, 'Activity variations generated successfully');
    res.json(variations);
  } catch (error) {
    logger.error({ error }, 'Error generating activity variations');
    res.status(500).json({ error: 'Failed to generate activity variations' });
  }
});

// POST /api/analyze-activity-quality
// Analyzes the quality of an activity and provides suggestions
router.post('/analyze-activity-quality', async (req: Request, res: Response) => {
  const logger = req.logger || createChildLogger({ route: 'openai/analyze-activity-quality' });
  
  try {
    logger.debug('Activity quality analysis request received');
    // Validate request with Zod - SINGLE POINT OF VALIDATION
    const { activity } = AnalyzeActivityQualityRequestSchema.parse(req.body);

    logger.debug({ activityTitle: activity.title }, 'Analyzing activity quality');
    const qualityAnalysis = await analyzeActivityQuality(activity);
    
    logger.debug('Activity quality analysis completed');
    res.json(qualityAnalysis);
  } catch (error) {
    logger.error({ error }, 'Error analyzing activity quality');
    res.status(500).json({ error: 'Failed to analyze activity quality' });
  }
});

// GET /api/test-openai-connection
// Tests the OpenAI connection
router.get('/test-openai-connection', async (req: Request, res: Response) => {
  const logger = req.logger || createChildLogger({ route: 'openai/test-connection' });
  
  try {
    logger.debug('Testing OpenAI connection');
    
    // Check if API key is configured
    if (!process.env.OPENAI_API_KEY || process.env.OPENAI_API_KEY.trim() === '') {
      logger.warn('OpenAI API key is not configured');
      return res.status(400).json({
        connected: false,
        error: 'OpenAI API key is not configured. Please set OPENAI_API_KEY in your .env file.'
      });
    }
    
    const isConnected = await testOpenAIConnection();
    
    if (isConnected) {
      logger.debug('OpenAI connection test successful');
      return res.json({
        connected: true,
        message: 'OpenAI connection successful'
      });
    } else {
      logger.warn('OpenAI connection test failed');
      return res.status(500).json({
        connected: false,
        error: 'OpenAI connection test failed. Please check your API key and internet connection.'
      });
    }
  } catch (error: any) {
    logger.error({ error }, 'Error testing OpenAI connection');
    res.status(500).json({
      connected: false,
      error: error?.message || 'Failed to test OpenAI connection'
    });
  }
});

export default router; 