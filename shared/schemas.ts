import { z } from 'zod';

// Child Profile Schema
export const ChildProfileSchema = z.object({
  name: z.string(),
  age: z.number(),
  gender: z.enum(['male', 'female', 'other', 'prefer-not-to-say']).optional(),
  interests: z.array(z.string()),
  learningStyle: z.string(),
  energyLevel: z.string(),
  socialPreference: z.string(),
  sensoryNeeds: z.array(z.string()),
  speechGoals: z.array(z.string()),
  otGoals: z.array(z.string()),
  developmentalAreas: z.array(z.string())
});

// Therapy Targets Schema
export const TherapyTargetsSchema = z.object({
  speech: z.array(z.string()),
  ot: z.array(z.string())
});

// Advanced Options Schema
export const AdvancedOptionsSchema = z.object({
  includeMultimedia: z.boolean().optional(),
  generateAssessmentRubric: z.boolean().optional(),
  includeParentNewsletter: z.boolean().optional(),
  generateExtensionActivities: z.boolean().optional(),
  createDigitalResources: z.boolean().optional(),
  includeProgressTracking: z.boolean().optional(),
  generateReflectionPrompts: z.boolean().optional(),
  createAdaptationGuide: z.boolean().optional(),
  culturalConsiderations: z.array(z.string()).optional(),
  languageSupport: z.array(z.string()).optional(),
  seasonalThemes: z.array(z.string()).optional(),
  technologyIntegration: z.string().optional(),
  assessmentType: z.string().optional(),
  budgetRange: z.string().optional(),
  parentInvolvement: z.string().optional(),
  groupSize: z.string().optional(),
  difficultyLevel: z.string().optional(),
  timeOfDay: z.string().optional(),
  weatherConsiderations: z.string().optional(),
  budgetConstraint: z.string().optional(),
  safetyLevel: z.string().optional()
}).optional();

// AI Generation Request Schema
export const AIGenerationRequestSchema = z.object({
  childProfile: ChildProfileSchema,
  activityType: z.string(),
  category: z.string(),
  methodologies: z.array(z.string()),
  duration: z.number(),
  environment: z.string(),
  materialConstraints: z.array(z.string()),
  learningObjectives: z.array(z.string()),
  therapyTargets: TherapyTargetsSchema,
  adaptationNeeds: z.array(z.string()),
  advancedOptions: AdvancedOptionsSchema
});

// Adaptations Schema
export const AdaptationsSchema = z.object({
  sensory: z.array(z.string()),
  motor: z.array(z.string()),
  cognitive: z.array(z.string())
});

// Assessment Schema
export const AssessmentSchema = z.object({
  observationPoints: z.array(z.string()),
  milestones: z.array(z.string())
});

// Parent Guidance Schema
export const ParentGuidanceSchema = z.object({
  setupTips: z.array(z.string()),
  encouragementPhrases: z.array(z.string()),
  extensionIdeas: z.array(z.string()),
  troubleshooting: z.array(z.string())
});

// Multimedia Schema
export const MultimediaSchema = z.object({
  suggestedPhotos: z.array(z.string()).optional(),
  videoIdeas: z.array(z.string()).optional(),
  audioElements: z.array(z.string()).optional()
}).optional();

// Assessment Rubric Schema
export const AssessmentRubricSchema = z.object({
  criteria: z.array(z.string()),
  levels: z.array(z.string()),
  descriptors: z.record(z.array(z.string()))
}).optional();

// Extension Activity Schema
export const ExtensionActivitySchema = z.object({
  title: z.string(),
  description: z.string(),
  materials: z.array(z.string())
});

// Reflection Prompts Schema
export const ReflectionPromptsSchema = z.object({
  forChild: z.array(z.string()),
  forParent: z.array(z.string()),
  forEducator: z.array(z.string())
}).optional();

// Cultural Adaptations Schema
export const CulturalAdaptationsSchema = z.object({
  considerations: z.array(z.string()),
  modifications: z.array(z.string())
}).optional();

// Digital Resources Schema
export const DigitalResourcesSchema = z.object({
  apps: z.array(z.string()),
  websites: z.array(z.string()),
  tools: z.array(z.string())
}).optional();

// AI Generated Activity Schema
export const AIGeneratedActivitySchema = z.object({
  title: z.string(),
  description: z.string(),
  materials: z.array(z.string()),
  instructions: z.array(z.string()),
  learningObjectives: z.array(z.string()),
  adaptations: AdaptationsSchema,
  assessment: AssessmentSchema,
  parentGuidance: ParentGuidanceSchema,
  developmentalAreas: z.array(z.string()),
  speechTargets: z.array(z.string()),
  otTargets: z.array(z.string()),
  tags: z.array(z.string()),
  // Enhanced fields
  multimedia: MultimediaSchema,
  assessmentRubric: AssessmentRubricSchema,
  extensionActivities: z.array(ExtensionActivitySchema).optional(),
  reflectionPrompts: ReflectionPromptsSchema,
  culturalAdaptations: CulturalAdaptationsSchema,
  digitalResources: DigitalResourcesSchema
});

// Quality Analysis Schema (Enhanced)
export const QualityAnalysisSchema = z.object({
  overallScore: z.number(),
  engagement: z.number(),
  educationalValue: z.number(),
  clarity: z.number(),
  adaptability: z.number(),
  developmentalAppropriateness: z.number(),
  therapeuticIntegration: z.number(),
  safetyConsideration: z.number(),
  methodologyAlignment: z.number(),
  strengths: z.array(z.string()),
  areasForImprovement: z.array(z.string()),
  suggestions: z.array(z.string()),
  expertCommentary: z.string()
});

// Variation Type Schema
export const VariationTypeSchema = z.enum(['difficulty', 'methodology', 'age', 'environment']);

// API Request/Response Schemas
export const GenerateBulkActivitiesRequestSchema = z.object({
  baseRequest: AIGenerationRequestSchema,
  count: z.number(),
  variationType: VariationTypeSchema
});

export const GenerateActivityVariationsRequestSchema = z.object({
  baseActivity: AIGeneratedActivitySchema,
  count: z.number().default(3)
});

export const AnalyzeActivityQualityRequestSchema = z.object({
  activity: AIGeneratedActivitySchema
});

// Export TypeScript types derived from Zod schemas
export type AIGenerationRequest = z.infer<typeof AIGenerationRequestSchema>;
export type AIGeneratedActivity = z.infer<typeof AIGeneratedActivitySchema>;
export type QualityAnalysis = z.infer<typeof QualityAnalysisSchema>;
export type VariationType = z.infer<typeof VariationTypeSchema>;
export type GenerateBulkActivitiesRequest = z.infer<typeof GenerateBulkActivitiesRequestSchema>;
export type GenerateActivityVariationsRequest = z.infer<typeof GenerateActivityVariationsRequestSchema>;
export type AnalyzeActivityQualityRequest = z.infer<typeof AnalyzeActivityQualityRequestSchema>;
