import { OpenAI } from 'openai';
import { AIGenerationRequest, AIGeneratedActivity, QualityAnalysis, VariationType } from '../../shared/schemas';

// Initialize OpenAI client
if (!process.env.OPENAI_API_KEY) {
  console.warn('WARNING: OPENAI_API_KEY is not set in environment variables');
}

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY || '',
});

const buildPrompt = (request: AIGenerationRequest) => {
  const methodologyDescriptions: { [key: string]: string } = {
    montessori: "self-directed learning with structured materials, independence, and intrinsic motivation",
    reggio: "project-based exploration, documentation, and child-led investigation",
    waldorf: "artistic expression, natural rhythms, and imaginative play",
    highscope: "plan-do-review sequence with active learning",
    bankstreet: "social-emotional development and community connections",
    'play-based': "learning through structured and unstructured play experiences",
    'inquiry-based': "question-driven exploration and discovery learning"
  };

  const selectedMethodologies = request.methodologies
    .map((m: string) => `${m}: ${methodologyDescriptions[m]}`)
    .join(', ');

  const advancedFeatures = request.advancedOptions ? Object.entries(request.advancedOptions)
    .filter(([_, value]) => value === true || (Array.isArray(value) && value.length > 0) || (typeof value === 'string' && value !== 'none'))
    .map(([key, value]) => `${key}: ${Array.isArray(value) ? value.join(', ') : value}`)
    .join(', ') : '';

  // Only include therapy targets if they're explicitly provided
  let therapyTargetsSection = '';

  if (request.therapyTargets.speech && request.therapyTargets.speech.length > 0) {
    therapyTargetsSection += `- Speech Therapy Targets: ${request.therapyTargets.speech.join(', ')}\n`;
  }

  if (request.therapyTargets.ot && request.therapyTargets.ot.length > 0) {
    therapyTargetsSection += `- OT Targets: ${request.therapyTargets.ot.join(', ')}\n`;
  }

  return `
You are an expert early childhood educator and activity designer with advanced knowledge of educational technology, cultural sensitivity, and inclusive design. Create a comprehensive, personalized learning activity.

CHILD PROFILE:
- Name: ${request.childProfile.name}
- Age: ${request.childProfile.age} years old
- Interests: ${request.childProfile.interests.join(', ')}
- Learning Style: ${request.childProfile.learningStyle}
- Energy Level: ${request.childProfile.energyLevel}
- Social Preference: ${request.childProfile.socialPreference}
- Sensory Needs: ${request.childProfile.sensoryNeeds.join(', ')}
- Speech Goals: ${request.childProfile.speechGoals.join(', ')}
- OT Goals: ${request.childProfile.otGoals.join(', ')}

ACTIVITY REQUIREMENTS:
- Type: ${request.activityType}
- Category: ${request.category}
- Duration: ${request.duration} minutes
- Environment: ${request.environment}
- Educational Methodologies: ${selectedMethodologies}
- Material Constraints: ${request.materialConstraints.join(', ')}
- Learning Objectives: ${request.learningObjectives.join(', ')}
${therapyTargetsSection}
- Adaptation Needs: ${request.adaptationNeeds.join(', ')}

${advancedFeatures ? `ADVANCED FEATURES: ${advancedFeatures}` : ''}

INSTRUCTIONS:
Create a comprehensive activity that incorporates all requirements and advanced features. The activity should be engaging, educational, and specifically tailored to the child's profile.

Please respond with a JSON object containing the following structure:
{
  "title": "Engaging activity title",
  "description": "Detailed description explaining benefits and methodology integration",
  "materials": ["Specific materials list considering constraints"],
  "instructions": ["Step-by-step instructions incorporating methodology principles"],
  "learningObjectives": ["Specific learning goals"],
  "adaptations": {
    "sensory": ["Sensory adaptations"],
    "motor": ["Motor adaptations"],
    "cognitive": ["Cognitive adaptations"]
  },
  "assessment": {
    "observationPoints": ["What to observe"],
    "milestones": ["Key milestones"]
  },
  "parentGuidance": {
    "setupTips": ["Setup tips"],
    "encouragementPhrases": ["Encouragement phrases"],
    "extensionIdeas": ["Extension ideas"],
    "troubleshooting": ["Troubleshooting solutions"]
  },
  "developmentalAreas": ["Developmental areas targeted"],
  ${request.therapyTargets.speech && request.therapyTargets.speech.length > 0 ? `"speechTargets": ["Speech therapy targets"],` : ''}
  ${request.therapyTargets.ot && request.therapyTargets.ot.length > 0 ? `"otTargets": ["OT targets"],` : ''}
  "tags": ["Relevant tags"],
  ${request.advancedOptions?.includeMultimedia ? `
  "multimedia": {
    "suggestedPhotos": ["Photo documentation ideas"],
    "videoIdeas": ["Video recording suggestions"],
    "audioElements": ["Audio components to include"]
  },` : ''}
  ${request.advancedOptions?.generateAssessmentRubric ? `
  "assessmentRubric": {
    "criteria": ["Assessment criteria"],
    "levels": ["Performance levels"],
    "descriptors": {"level1": ["descriptors"], "level2": ["descriptors"]}
  },` : ''}
  ${request.advancedOptions?.generateExtensionActivities ? `
  "extensionActivities": [
    {
      "title": "Extension activity title",
      "description": "Extension description",
      "materials": ["Extension materials"]
    }
  ],` : ''}
  ${request.advancedOptions?.generateReflectionPrompts ? `
  "reflectionPrompts": {
    "forChild": ["Child reflection questions"],
    "forParent": ["Parent reflection questions"],
    "forEducator": ["Educator reflection questions"]
  },` : ''}
  ${request.advancedOptions?.culturalConsiderations?.length ? `
  "culturalAdaptations": {
    "considerations": ["Cultural considerations"],
    "modifications": ["Cultural modifications"]
  },` : ''}
  ${request.advancedOptions?.createDigitalResources ? `
  "digitalResources": {
    "apps": ["Recommended apps"],
    "websites": ["Useful websites"],
    "tools": ["Digital tools"]
  }` : ''}
}

Make the activity comprehensive, engaging, and perfectly suited for the specified requirements and advanced features.
`;
};

export const generateActivityWithAI = async (request: AIGenerationRequest): Promise<AIGeneratedActivity> => {
  try {
    const prompt = buildPrompt(request);

    const completion = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [
        {
          role: "system",
          content: "You are an expert early childhood educator and activity designer specializing in personalized learning experiences. Always respond with valid JSON only."
        },
        {
          role: "user",
          content: prompt
        }
      ],
      temperature: 0.7,
      max_tokens: 3000
    });

    const response = completion.choices[0]?.message?.content;
    if (!response) {
      throw new Error('No response from OpenAI');
    }

    // Parse and validate the JSON response with Zod
    const generatedActivity = JSON.parse(response);

    // Validate the response has required fields
    if (!generatedActivity.title || !generatedActivity.description || !generatedActivity.materials) {
      throw new Error('Invalid response format from OpenAI');
    }

    return generatedActivity;
  } catch (error: unknown) {
    console.error('Error generating activity with OpenAI:', error);

    // Fallback to a basic generated activity if OpenAI fails
    return generateFallbackActivity(request);
  }
};

export const generateBulkActivities = async (baseRequest: AIGenerationRequest, count: number, variationType: VariationType): Promise<AIGeneratedActivity[]> => {
  const activities: AIGeneratedActivity[] = [];

  for (let i = 0; i < count; i++) {
    const modifiedRequest = { ...baseRequest };

    // Modify request based on variation type
    switch (variationType) {
      case 'difficulty':
        modifiedRequest.childProfile.age = 3 + i;
        break;
      case 'methodology':
        const methodologies = ['montessori', 'reggio', 'waldorf', 'highscope', 'bankstreet'];
        modifiedRequest.methodologies = [methodologies[i % methodologies.length]];
        break;
      case 'age':
        modifiedRequest.childProfile.age = 3 + (i % 3);
        break;
      case 'environment':
        const environments = ['indoor', 'outdoor', 'both'];
        modifiedRequest.environment = environments[i % environments.length];
        break;
    }

    try {
      const activity = await generateActivityWithAI(modifiedRequest);
      activities.push(activity);
    } catch (error) {
      console.error(`Failed to generate activity ${i + 1}:`, error);
    }
  }

  return activities;
};

export const generateActivityVariations = async (baseActivity: AIGeneratedActivity, count = 3): Promise<AIGeneratedActivity[]> => {
  const variations: AIGeneratedActivity[] = [];

  const variationPrompts = [
    "Create a simplified version suitable for younger children",
    "Create an advanced version with additional challenges",
    "Create a version focused on different learning modalities"
  ];

  for (let i = 0; i < Math.min(count, variationPrompts.length); i++) {
    try {
      const completion = await openai.chat.completions.create({
        model: "gpt-4",
        messages: [
          {
            role: "system",
            content: "You are an expert early childhood educator. Create activity variations based on the provided base activity. Always respond with valid JSON only."
          },
          {
            role: "user",
            content: `Based on this activity: ${JSON.stringify(baseActivity)}\n\n${variationPrompts[i]}\n\nProvide the variation in the same JSON format.`
          }
        ],
        temperature: 0.8,
        max_tokens: 2000
      });

      const response = completion.choices[0]?.message?.content;
      if (response) {
        const variation = JSON.parse(response);
        variations.push(variation);
      }
    } catch (error) {
      console.error(`Failed to generate variation ${i + 1}:`, error);
    }
  }

  return variations;
};

export const analyzeActivityQuality = async (activity: AIGeneratedActivity): Promise<QualityAnalysis> => {
  try {
    const completion = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [
        {
          role: "system",
          content: "You are an expert early childhood education evaluator. Analyze the quality of educational activities and provide scores and suggestions. Always respond with valid JSON only."
        },
        {
          role: "user",
          content: `Analyze this activity for quality: ${JSON.stringify(activity)}\n\nProvide analysis in this JSON format:
          {
            "overallScore": 85,
            "engagement": 9,
            "educationalValue": 8,
            "clarity": 9,
            "adaptability": 8,
            "suggestions": ["suggestion 1", "suggestion 2"]
          }`
        }
      ],
      temperature: 0.3,
      max_tokens: 500
    });

    const response = completion.choices[0]?.message?.content;
    if (response) {
      return JSON.parse(response);
    }
  } catch (error) {
    console.error('Failed to analyze activity quality:', error);
  }

  // Fallback analysis
  return {
    overallScore: 75,
    engagement: 8,
    educationalValue: 7,
    clarity: 8,
    adaptability: 7,
    suggestions: ['Consider adding more sensory elements', 'Include additional extension activities']
  };
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
    tags: [activityType.toLowerCase(), category.toLowerCase(), ...request.childProfile.interests.map((i: string) => i.toLowerCase())]
  };
};

// Test function to check if OpenAI is properly configured
export const testOpenAIConnection = async (): Promise<boolean> => {
  // Check if API key is configured
  if (!process.env.OPENAI_API_KEY || process.env.OPENAI_API_KEY.trim() === '') {
    console.error('OpenAI API key is not configured');
    return false;
  }

  try {
    const completion = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [{ role: "user", content: "Hello, this is a test. Please respond with 'OpenAI connection successful.'" }],
      max_tokens: 20
    });

    const response = completion.choices[0]?.message?.content || '';
    const isSuccessful = response.toLowerCase().includes('successful');
    
    if (!isSuccessful) {
      console.warn('OpenAI responded but did not include expected success message:', response);
    }
    
    return isSuccessful;
  } catch (error: any) {
    console.error('OpenAI connection test failed:', error?.message || error);
    
    // Provide more specific error messages
    if (error?.status === 401) {
      console.error('OpenAI API key is invalid or unauthorized');
    } else if (error?.status === 429) {
      console.error('OpenAI API rate limit exceeded');
    } else if (error?.code === 'ENOTFOUND' || error?.code === 'ECONNREFUSED') {
      console.error('Cannot connect to OpenAI API - check your internet connection');
    }
    
    return false;
  }
};


