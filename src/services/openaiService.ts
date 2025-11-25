import { OpenAI } from 'openai';
import type {
  AIGenerationRequest,
  AIGeneratedActivity,
  QualityAnalysis,
  VariationType
} from '../../shared/schemas';
import { methodologies, environments } from '../config/activityConfig';

// Initialize OpenAI client with API key from environment
const apiKey = import.meta.env.VITE_OPENAI_API_KEY;

if (!apiKey) {
  console.warn('WARNING: VITE_OPENAI_API_KEY is not set in environment variables');
}

const openai = new OpenAI({
  apiKey: apiKey || '',
  dangerouslyAllowBrowser: true // Required for browser usage
});

// Re-export types for backward compatibility
export type {
  AIGenerationRequest,
  AIGeneratedActivity,
  QualityAnalysis,
  VariationType
};

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

  // Extract detailed context from adaptationNeeds array
  let childContextSection = '';
  let materialDetailsSection = '';
  let spaceDetailsSection = '';
  let additionalContextText = '';

  if (request.adaptationNeeds && request.adaptationNeeds.length > 0) {
    const contextItems = request.adaptationNeeds.filter(item => item.toLowerCase().includes('current skills') || item.toLowerCase().includes('what works') || item.toLowerCase().includes('challenges') || item.toLowerCase().includes('recent observations'));
    const materialItems = request.adaptationNeeds.filter(item => item.toLowerCase().includes('available materials') || item.toLowerCase().includes('constraints:') || item.toLowerCase().includes('budget notes'));
    const spaceItems = request.adaptationNeeds.filter(item => item.toLowerCase().includes('available space') || item.toLowerCase().includes('space limitations'));
    const additionalItems = request.adaptationNeeds.filter(item => item.toLowerCase().includes('additional context'));
    const actualAdaptationNeeds = request.adaptationNeeds.filter(item => 
      !item.toLowerCase().includes('current skills') && 
      !item.toLowerCase().includes('what works') && 
      !item.toLowerCase().includes('challenges') && 
      !item.toLowerCase().includes('recent observations') &&
      !item.toLowerCase().includes('available materials') &&
      !item.toLowerCase().includes('constraints:') &&
      !item.toLowerCase().includes('budget notes') &&
      !item.toLowerCase().includes('available space') &&
      !item.toLowerCase().includes('space limitations') &&
      !item.toLowerCase().includes('additional context')
    );

    if (contextItems.length > 0) {
      childContextSection = `\nDETAILED CHILD CONTEXT:\n${contextItems.map((item, idx) => `  ${idx + 1}. ${item}`).join('\n')}\n`;
    }

    if (materialItems.length > 0) {
      materialDetailsSection = `\nMATERIAL DETAILS & CONSTRAINTS:\n${materialItems.map((item, idx) => `  ${idx + 1}. ${item}`).join('\n')}\n`;
    }

    if (spaceItems.length > 0) {
      spaceDetailsSection = `\nSPACE CONSIDERATIONS:\n${spaceItems.map((item, idx) => `  ${idx + 1}. ${item}`).join('\n')}\n`;
    }

    if (additionalItems.length > 0) {
      additionalContextText = `\nADDITIONAL CONTEXT & NOTES:\n${additionalItems.map((item, idx) => `  ${idx + 1}. ${item}`).join('\n')}\n`;
    }

    // Update adaptationNeeds to only include actual adaptation needs
    request.adaptationNeeds = actualAdaptationNeeds;
  }

  // Build a richer context section about the child's learning profile
  const learningStyleContext = {
    'visual': 'thrives with visual aids, charts, images, and visual demonstrations',
    'auditory': 'learns best through listening, discussion, music, and verbal instructions',
    'kinesthetic': 'needs hands-on movement, physical engagement, and tactile experiences',
    'mixed': 'benefits from multi-modal approaches combining visual, auditory, and kinesthetic elements'
  };

  const energyLevelGuidance = {
    'low': 'requires low-key, calming activities with minimal stimulation',
    'medium': 'enjoys moderate-paced activities with balance of active and quiet moments',
    'high': 'needs active, energetic activities with movement and dynamic engagement'
  };

  const socialPreferenceGuidance = {
    'individual': 'prefers working alone, needs space and autonomy',
    'small-group': 'enjoys working with 2-4 peers, collaborative but not overwhelming',
    'large-group': 'thrives in group settings with 5+ children, enjoys social interaction'
  };

  return `
TASK: Create a highly personalized, developmentally appropriate early childhood learning activity.

═══════════════════════════════════════════════════════════════
CHILD PROFILE & LEARNING NEEDS
═══════════════════════════════════════════════════════════════
NAME: ${request.childProfile.name}
AGE: ${request.childProfile.age} years old (developmental stage: ${request.childProfile.age < 3 ? 'toddler' : request.childProfile.age < 5 ? 'preschooler' : 'early elementary'})

PERSONAL INTERESTS & PASSIONS:
${request.childProfile.interests.length > 0 ? request.childProfile.interests.map((i, idx) => `  ${idx + 1}. ${i}`).join('\n') : '  (To be discovered/explored through this activity)'}

LEARNING STYLE: ${request.childProfile.learningStyle}
  → ${learningStyleContext[request.childProfile.learningStyle as keyof typeof learningStyleContext] || 'benefits from varied approaches'}

ENERGY LEVEL: ${request.childProfile.energyLevel}
  → ${energyLevelGuidance[request.childProfile.energyLevel as keyof typeof energyLevelGuidance] || 'adaptable to various pacing'}

SOCIAL PREFERENCE: ${request.childProfile.socialPreference}
  → ${socialPreferenceGuidance[request.childProfile.socialPreference as keyof typeof socialPreferenceGuidance] || 'flexible social arrangements'}

SENSORY PROFILE:
${request.childProfile.sensoryNeeds.length > 0 ? request.childProfile.sensoryNeeds.map((need, idx) => `  - ${need}`).join('\n') : '  No specific sensory considerations noted'}

THERAPEUTIC GOALS:
${request.childProfile.speechGoals.length > 0 ? `  Speech & Language: ${request.childProfile.speechGoals.join(', ')}` : '  No specific speech goals noted'}
${request.childProfile.otGoals.length > 0 ? `  Occupational Therapy: ${request.childProfile.otGoals.join(', ')}` : '  No specific OT goals noted'}

${childContextSection}

═══════════════════════════════════════════════════════════════
ACTIVITY SPECIFICATIONS
═══════════════════════════════════════════════════════════════
ACTIVITY TYPE: ${request.activityType}
CATEGORY: ${request.category}
DURATION: ${request.duration} minutes (ensure activity fits naturally within this timeframe)
ENVIRONMENT: ${request.environment} (consider space, safety, and resources available in this setting)

EDUCATIONAL METHODOLOGIES TO INTEGRATE:
${selectedMethodologies || 'Flexible approach - incorporate best practices from multiple methodologies'}

MATERIAL CONSTRAINTS:
${request.materialConstraints.length > 0 ? request.materialConstraints.map((constraint, idx) => `  ${idx + 1}. ${constraint}`).join('\n') : '  No specific constraints - use age-appropriate materials'}

${materialDetailsSection}

${spaceDetailsSection}

LEARNING OBJECTIVES (Target Outcomes):
${request.learningObjectives.length > 0 ? request.learningObjectives.map((obj, idx) => `  ${idx + 1}. ${obj}`).join('\n') : '  Focus on age-appropriate developmental growth across domains'}

${therapyTargetsSection ? `THERAPY TARGETS:\n${therapyTargetsSection}` : ''}

${request.adaptationNeeds.length > 0 ? `ADAPTATION NEEDS:\n${request.adaptationNeeds.map((need, idx) => `  ${idx + 1}. ${need}`).join('\n')}\n` : ''}

${additionalContextText}

${advancedFeatures ? `ADVANCED FEATURES & OPTIMIZATIONS:\n${advancedFeatures.split(', ').map((feature, idx) => `  ${idx + 1}. ${feature}`).join('\n')}\n` : ''}

═══════════════════════════════════════════════════════════════
DESIGN REQUIREMENTS & QUALITY STANDARDS
═══════════════════════════════════════════════════════════════

1. PERSONALIZATION: This activity MUST feel uniquely designed for ${request.childProfile.name}. 
   - Weave their interests naturally throughout (not forced or superficial)
   - Honor their learning style preferences
   - Match their energy level and social needs
   - Respect their sensory profile

2. METHODOLOGY INTEGRITY: If methodologies are specified, authentically incorporate their core principles.
   - Montessori: self-direction, prepared environment, real materials, independence
   - Reggio: project-based, child-led inquiry, documentation, aesthetic awareness
   - Waldorf: rhythm, imagination, natural materials, artistic expression
   - HighScope: plan-do-review, active learning, key developmental indicators
   - Play-based: learning through play, child agency, intrinsic motivation

3. DEVELOPMENTAL ALIGNMENT: Ensure all aspects match ${request.childProfile.age}-year-old capabilities.
   - Cognitive complexity appropriate for age
   - Fine/gross motor demands realistic
   - Attention span considerations
   - Language complexity suitable

4. ENGAGEMENT OPTIMIZATION: Design for sustained, joyful engagement.
   - Clear purpose and relevance
   - Appropriate challenge (not too easy, not frustrating)
   - Intrinsic motivation elements
   - Natural flow and transitions

5. PRACTICAL FEASIBILITY: Ensure the activity is actually doable.
   - Materials are accessible and affordable
   - Setup is reasonable for specified environment
   - Time fits within duration constraint
   - Cleanup is manageable

6. HOLISTIC DEVELOPMENT: Target multiple developmental domains.
   - Cognitive: thinking, problem-solving, memory, attention
   - Physical: fine motor, gross motor, coordination, strength
   - Social-Emotional: self-awareness, relationships, empathy, regulation
   - Language: vocabulary, communication, listening, expression
   - Creative: imagination, self-expression, innovation

7. INCLUSIVE DESIGN: Make adaptations natural and seamless.
   - Not "special" versions, but integrated flexibility
   - Maintains activity integrity while meeting diverse needs
   - Empowers all children to participate meaningfully

8. FAMILY-FRIENDLY: Provide guidance that empowers, not overwhelms.
   - Clear setup steps
   - Specific encouragement language
   - Realistic troubleshooting
   - Meaningful extensions (not just "make it harder")

═══════════════════════════════════════════════════════════════
OUTPUT FORMAT (JSON Structure)
═══════════════════════════════════════════════════════════════

Respond with a well-structured JSON object containing:
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

CRITICAL OUTPUT REQUIREMENTS:
- Return ONLY valid JSON - no markdown formatting, no code blocks, no explanations
- Be comprehensive: fill every field with substantial, thoughtful content (minimum 3-5 items per array)
- Be specific: avoid generic descriptions. Use concrete details, specific materials with quantities when helpful, and detailed steps
- Be personalized: explicitly reference ${request.childProfile.name}'s interests, learning style, and needs throughout
- Be age-appropriate: ensure all language, complexity, and expectations match a ${request.childProfile.age}-year-old's capabilities
- Be actionable: provide clear, sequential steps that a caregiver can follow
- Be authentic: if methodologies are specified, genuinely integrate their principles, don't just mention them
- Be inclusive: if adaptations are needed, make them natural and integrated, not separate or "special"

REMEMBER: This is not just an activity - it's a personalized learning experience designed specifically for ${request.childProfile.name} that respects their agency, honors their interests, supports their growth, and brings joy. Every element should be intentional, meaningful, and aligned with their unique profile.

Return valid JSON only.`;
};

export const generateActivityWithAI = async (request: AIGenerationRequest): Promise<AIGeneratedActivity> => {
  try {
    if (!apiKey) {
      throw new Error('OpenAI API key is not configured');
    }

    const prompt = buildPrompt(request);

    const completion = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [
        {
          role: "system",
          content: `You are an elite early childhood education specialist and activity designer with deep expertise in:
          
1. CHILD DEVELOPMENT PSYCHOLOGY: You understand developmental milestones, cognitive stages (Piaget, Vygotsky), brain development, and how learning occurs in the first 8 years of life.

2. EDUCATIONAL METHODOLOGIES: You're deeply versed in Montessori, Reggio Emilia, Waldorf, HighScope, Bank Street, play-based, and inquiry-based approaches, understanding their core principles and how to authentically integrate them.

3. PERSONALIZATION & DIFFERENTIATION: You excel at creating activities that genuinely match a child's unique profile - their interests, learning style, energy level, sensory needs, and social preferences. Every element is intentionally chosen.

4. INCLUSIVE DESIGN: You create activities that are accessible and adaptable for children with diverse abilities, sensory needs, and learning differences, without making them feel "different" or watered down.

5. ENGAGEMENT OPTIMIZATION: You know how to design activities that capture and maintain attention, incorporate intrinsic motivation, and create "flow states" where children are fully absorbed and learning naturally.

6. MULTI-MODAL LEARNING: You integrate visual, auditory, kinesthetic, and tactile elements strategically to support different learning styles and create richer neural pathways.

7. PROGRESSIVE COMPLEXITY: You design activities with built-in scaffolds, extensions, and challenges that allow natural progression without overwhelming the child.

8. REAL-WORLD CONNECTION: You connect activities to children's lived experiences, making learning meaningful, relevant, and memorable.

9. ASSESSMENT & OBSERVATION: You design activities that naturally reveal what a child knows and can do, with clear observation points and milestone indicators.

10. FAMILY ENGAGEMENT: You create activities that families can easily implement at home, with clear guidance that empowers rather than overwhelms parents.

YOUR APPROACH TO ACTIVITY DESIGN:
- Start with the CHILD first, not the curriculum. Their interests, strengths, and needs drive every decision.
- Make it PLAYFUL but PURPOSEFUL - learning should feel like play, but every element serves a developmental goal.
- Be SPECIFIC and ACTIONABLE - vague ideas don't help. Provide concrete, doable steps with clear materials.
- Think HOLISTICALLY - every activity should touch multiple developmental domains (cognitive, social-emotional, physical, language, creative).
- Consider the ENTIRE EXPERIENCE - setup, engagement, cleanup, reflection, and follow-up extensions.
- Honor DIFFERENCE - celebrate and incorporate cultural backgrounds, family values, and individual preferences authentically.
- Build CONFIDENCE - activities should challenge but not frustrate, allowing children to experience competence and agency.
- Connect to LARGER GOALS - each activity should clearly link to broader learning objectives and developmental outcomes.

OUTPUT REQUIREMENTS:
- Respond ONLY with valid, well-formed JSON - no markdown, no explanations, no additional text.
- Be COMPREHENSIVE - include all requested sections with substantial, thoughtful content (minimum 3-5 items per array when applicable).
- Be SPECIFIC - avoid generic descriptions. Use concrete examples, specific materials with quantities when helpful, and detailed steps.
- Be AGE-APPROPRIATE - ensure all language, concepts, materials, and expectations match the child's developmental stage.
- Be CULTURALLY RESPONSIVE - if cultural considerations are provided, authentically weave them into the activity design, not as an add-on.
- Be THERAPEUTICALLY INTENTIONAL - if therapy targets are specified, integrate them naturally into the activity flow, not as separate exercises.
- Be PRACTICAL - ensure materials are accessible, affordable within constraints, and setup is manageable for the environment specified.
- Be SAFE - consider age-appropriate safety considerations and include them in guidance when relevant.
- Be EXTENSIBLE - provide meaningful extension ideas that build on the core activity rather than just adding complexity.
- Be OBSERVABLE - include specific, measurable observation points that help track progress toward objectives.

QUALITY STANDARDS:
- Title: Creative, engaging, age-appropriate, and descriptive (4-8 words)
- Description: Compelling, clear about benefits, 2-4 sentences explaining why this activity is perfect for THIS child
- Materials: Specific, complete, with quantities when relevant, categorized logically
- Instructions: Step-by-step, sequential, clear, with educator notes where helpful (8-12 steps for complex activities)
- Learning Objectives: Specific, measurable, developmentally appropriate, aligned with stated goals
- Adaptations: Practical, actionable modifications that maintain activity integrity while meeting diverse needs
- Assessment: Meaningful observation points and milestone indicators that naturally emerge from the activity
- Parent Guidance: Empowering, clear, non-judgmental, with specific encouragement language and troubleshooting
- Extensions: Authentic ways to deepen learning, not just "do it again" or "make it harder"

Remember: You are creating a personalized learning experience that respects the child's agency, honors their interests, supports their growth, and brings joy to both child and caregiver. Quality over quantity - every element should be intentional and valuable.

Always respond with valid JSON only.`
        },
        {
          role: "user",
          content: prompt
        }
      ],
      temperature: 0.75,
      max_tokens: 4000
    });

    const response = completion.choices[0]?.message?.content;
    if (!response) {
      throw new Error('No response from OpenAI');
    }

    // Parse and validate the JSON response
    let generatedActivity: AIGeneratedActivity;
    try {
      // Try to extract JSON from markdown code blocks if present
      const jsonMatch = response.match(/```json\s*([\s\S]*?)\s*```/) || response.match(/```\s*([\s\S]*?)\s*```/);
      const jsonString = jsonMatch ? jsonMatch[1] : response;
      generatedActivity = JSON.parse(jsonString);
    } catch (parseError) {
      console.error('Failed to parse JSON response:', parseError);
      throw new Error('Invalid JSON response from OpenAI');
    }

    // Validate the response has required fields
    if (!generatedActivity.title || !generatedActivity.description || !generatedActivity.materials) {
      throw new Error('Invalid response format from OpenAI');
    }

    return generatedActivity;
  } catch (error: any) {
    console.error('Error generating activity with OpenAI:', error);
    
    // Fallback to a basic generated activity if OpenAI fails
    return generateFallbackActivity(request);
  }
};

export const generateBulkActivities = async (
  baseRequest: AIGenerationRequest, 
  count: number, 
  variationType: VariationType
): Promise<AIGeneratedActivity[]> => {
  const activities: AIGeneratedActivity[] = [];

  for (let i = 0; i < count; i++) {
    const modifiedRequest = { ...baseRequest };

    // Modify request based on variation type
    switch (variationType) {
      case 'difficulty':
        modifiedRequest.childProfile.age = 3 + i;
        break;
      case 'methodology':
        // Use methodologies from centralized config
        const methodologyIds = methodologies.map(m => m.id || m.value);
        modifiedRequest.methodologies = [methodologyIds[i % methodologyIds.length]];
        break;
      case 'age':
        modifiedRequest.childProfile.age = 3 + (i % 3);
        break;
      case 'environment':
        // Use environments from centralized config
        const environmentIds = environments.map(e => e.id);
        modifiedRequest.environment = environmentIds[i % environmentIds.length];
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

export const generateActivityVariations = async (
  baseActivity: AIGeneratedActivity, 
  count: number = 3
): Promise<AIGeneratedActivity[]> => {
  const variations: AIGeneratedActivity[] = [];

  if (!apiKey) {
    console.error('OpenAI API key is not configured');
    return variations;
  }

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
            content: `You are an expert early childhood educator specializing in activity adaptation and differentiation. Your role is to create thoughtful variations of activities that maintain their core educational value while meeting different needs.

PRINCIPLES FOR VARIATION CREATION:
1. PRESERVE INTENT: Keep the learning objectives and core educational value intact
2. ADAPT AUTHENTICALLY: Make changes that feel natural, not forced or superficial
3. MAINTAIN QUALITY: Variations should be as well-designed as the original
4. BE SPECIFIC: Provide detailed, concrete modifications, not vague suggestions
5. CONSIDER CONTEXT: Understand why this variation is needed (age, ability, interest, etc.)

When creating variations:
- Simplify by reducing complexity, not removing content - keep it complete
- Enhance by adding depth and challenge, not just difficulty
- Adapt by changing approach/materials/pacing, not core learning goals
- Always ensure age-appropriateness for the target variation
- Maintain the activity's engaging, joyful nature

Respond with valid JSON only - same structure as the base activity, fully populated.`
          },
          {
            role: "user",
            content: `Base Activity (reference this structure and quality):
${JSON.stringify(baseActivity, null, 2)}

Variation Request: ${variationPrompts[i]}

Create a complete, high-quality variation that:
- Maintains the same JSON structure
- Meets the variation request authentically
- Preserves the activity's educational integrity
- Is comprehensive and well-detailed
- Returns valid JSON only (no markdown, no explanations)`
          }
        ],
        temperature: 0.75,
        max_tokens: 3000
      });

      const response = completion.choices[0]?.message?.content;
      if (response) {
        try {
          const jsonMatch = response.match(/```json\s*([\s\S]*?)\s*```/) || response.match(/```\s*([\s\S]*?)\s*```/);
          const jsonString = jsonMatch ? jsonMatch[1] : response;
          const variation = JSON.parse(jsonString);
          variations.push(variation);
        } catch (parseError) {
          console.error(`Failed to parse variation ${i + 1}:`, parseError);
        }
      }
    } catch (error) {
      console.error(`Failed to generate variation ${i + 1}:`, error);
    }
  }

  return variations;
};

export const analyzeActivityQuality = async (activity: AIGeneratedActivity): Promise<QualityAnalysis> => {
  if (!apiKey) {
    console.error('OpenAI API key is not configured');
    // Return fallback analysis
    return {
      overallScore: 75,
      engagement: 8,
      educationalValue: 7,
      clarity: 8,
      adaptability: 7,
      suggestions: ['Consider adding more sensory elements', 'Include additional extension activities']
    };
  }

  try {
    const completion = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [
        {
          role: "system",
          content: `You are an elite early childhood education evaluator with expertise in:
- Developmentally appropriate practice (NAEYC standards)
- Activity design quality and educational effectiveness
- Engagement optimization and child-centered learning
- Inclusive design and accessibility
- Evidence-based early childhood pedagogy

EVALUATION CRITERIA:
1. ENGAGEMENT (1-10): Does the activity capture and maintain attention? Is it intrinsically motivating?
2. EDUCATIONAL VALUE (1-10): Does it clearly support learning objectives? Is it pedagogically sound?
3. CLARITY (1-10): Are instructions clear? Can caregivers easily implement it?
4. ADAPTABILITY (1-10): Can it be modified for different needs while maintaining integrity?

PROVIDE:
- Overall score (0-100): weighted average considering all criteria
- Individual scores for each criterion (1-10)
- Constructive, specific suggestions for improvement (3-5 actionable items)
- Balance praise with areas for growth
- Be specific: "add more visual supports" not "improve materials"
- Consider developmental appropriateness and practical feasibility

Always respond with valid JSON only.`
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
      try {
        const jsonMatch = response.match(/```json\s*([\s\S]*?)\s*```/) || response.match(/```\s*([\s\S]*?)\s*```/);
        const jsonString = jsonMatch ? jsonMatch[1] : response;
        return JSON.parse(jsonString);
      } catch (parseError) {
        console.error('Failed to parse quality analysis:', parseError);
      }
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
    tags: [activityType.toLowerCase(), category.toLowerCase(), ...request.childProfile.interests.map(i => i.toLowerCase())]
  };
};

// Test function to check if OpenAI is properly configured
export const testOpenAIConnection = async (): Promise<boolean> => {
  // Check if API key is configured
  if (!apiKey || apiKey.trim() === '') {
    console.error('OpenAI API key is not configured. Please set VITE_OPENAI_API_KEY in your .env.local file.');
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
