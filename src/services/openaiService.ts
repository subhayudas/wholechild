import axios from 'axios';
import type {
  AIGenerationRequest,
  AIGeneratedActivity,
  QualityAnalysis,
  VariationType
} from '../../shared/schemas';

// Base URL for backend API
const API_BASE_URL = 'http://localhost:3001/api';

// Re-export types for backward compatibility
export type {
  AIGenerationRequest,
  AIGeneratedActivity,
  QualityAnalysis,
  VariationType
};


export const generateActivityWithAI = async (request: AIGenerationRequest): Promise<AIGeneratedActivity> => {
  try {
    const response = await axios.post(`${API_BASE_URL}/generate-activity`, request);
    return response.data as AIGeneratedActivity;
  } catch (error) {
    console.error('Error generating activity from backend:', error);
    
    // Fallback to a basic generated activity if backend fails
    return generateFallbackActivity(request);
  }
};

export const generateBulkActivities = async (
  baseRequest: AIGenerationRequest, 
  count: number, 
  variationType: VariationType
): Promise<AIGeneratedActivity[]> => {
  try {
    const response = await axios.post(`${API_BASE_URL}/generate-bulk-activities`, {
      baseRequest,
      count,
      variationType
    });
    return response.data as AIGeneratedActivity[];
  } catch (error) {
    console.error('Error generating bulk activities from backend:', error);
    return [];
  }
};

export const generateActivityVariations = async (
  baseActivity: AIGeneratedActivity, 
  count: number = 3
): Promise<AIGeneratedActivity[]> => {
  try {
    const response = await axios.post(`${API_BASE_URL}/generate-activity-variations`, {
      baseActivity,
      count
    });
    return response.data as AIGeneratedActivity[];
  } catch (error) {
    console.error('Error generating activity variations from backend:', error);
    return [];
  }
};

export const analyzeActivityQuality = async (activity: AIGeneratedActivity): Promise<QualityAnalysis> => {
  try {
    const response = await axios.post(`${API_BASE_URL}/analyze-activity-quality`, {
      activity
    });
    return response.data as QualityAnalysis;
  } catch (error) {
    console.error('Error analyzing activity quality from backend:', error);
    
    // Fallback analysis
    return {
      overallScore: 75,
      engagement: 8,
      educationalValue: 7,
      clarity: 8,
      adaptability: 7,
      suggestions: ['Consider adding more sensory elements', 'Include additional extension activities']
    };
  }
};

const generateFallbackActivity = (request: AIGenerationRequest): AIGeneratedActivity => {
  const childName = request.childProfile.name;
  const activityType = request.activityType;
  const category = request.category;
  
  return {
    title: `${childName}'s ${activityType} Adventure`,
    description: `A personalized ${category.toLowerCase()} activity designed specifically for ${childName}, incorporating their interests in ${request.childProfile.interests.join(' and ')} while supporting their ${request.childProfile.learningStyle} learning style.`,
    materials: [
      "Age-appropriate materials based on activity type",
      "Items that support sensory needs",
      "Tools for documentation"
    ],
    instructions: [
      `Set up the activity in a way that appeals to ${childName}'s ${request.childProfile.learningStyle} learning style`,
      `Incorporate elements related to ${request.childProfile.interests.join(', ')}`,
      "Guide the child through the activity with patience and encouragement",
      "Document observations and progress"
    ],
    learningObjectives: request.learningObjectives,
    adaptations: {
      sensory: [`Adaptations for ${request.childProfile.sensoryNeeds.join(', ')}`],
      motor: ["Provide alternative tools if needed"],
      cognitive: ["Break into smaller steps if necessary"]
    },
    assessment: {
      observationPoints: [
        `How does ${childName} engage with the activity?`,
        "What strategies do they use?",
        "What interests them most?"
      ],
      milestones: [
        "Demonstrates engagement with activity",
        "Shows progress toward learning objectives"
      ]
    },
    parentGuidance: {
      setupTips: [
        "Prepare materials in advance",
        "Choose a time when child is alert and engaged"
      ],
      encouragementPhrases: [
        `"Great job exploring, ${childName}!"`,
        "I notice you're really focused on this!",
        "Tell me what you're thinking about."
      ],
      extensionIdeas: [
        "Extend the activity based on child's interests",
        "Connect to other learning opportunities"
      ],
      troubleshooting: [
        "If child loses interest, try incorporating their favorite topics",
        "Adjust difficulty level as needed"
      ]
    },
    developmentalAreas: request.childProfile.developmentalAreas,
    speechTargets: request.therapyTargets.speech && request.therapyTargets.speech.length > 0 ? request.therapyTargets.speech : [],
    otTargets: request.therapyTargets.ot && request.therapyTargets.ot.length > 0 ? request.therapyTargets.ot : [],
    tags: [activityType.toLowerCase(), category.toLowerCase(), ...request.childProfile.interests.map(i => i.toLowerCase())]
  };
};

// Test function to check if OpenAI is properly configured
export const testOpenAIConnection = async (): Promise<boolean> => {
  try {
    const response = await axios.get(`${API_BASE_URL}/test-openai-connection`);
    return response.data.connected || false;
  } catch (error) {
    console.error('OpenAI connection test failed:', error);
    return false;
  }
};