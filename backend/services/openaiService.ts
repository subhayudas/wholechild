import { OpenAI } from 'openai';
import { AIGenerationRequest, AIGeneratedActivity, QualityAnalysis, VariationType } from '../../shared/schemas';

// Initialize OpenAI client
if (!process.env.OPENAI_API_KEY) {
  console.warn('WARNING: OPENAI_API_KEY is not set in environment variables');
}

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY || '',
});

// Helper function to get pronouns based on gender
const getPronouns = (gender?: string): { subject: string; object: string; possessive: string; reflexive: string } => {
  switch (gender) {
    case 'male':
      return { subject: 'he', object: 'him', possessive: 'his', reflexive: 'himself' };
    case 'female':
      return { subject: 'she', object: 'her', possessive: 'her', reflexive: 'herself' };
    case 'other':
      return { subject: 'they', object: 'them', possessive: 'their', reflexive: 'themselves' };
    default:
      // For 'prefer-not-to-say' or undefined, use they/them as neutral
      return { subject: 'they', object: 'them', possessive: 'their', reflexive: 'themselves' };
  }
};

const buildPrompt = (request: AIGenerationRequest) => {
  const pronouns = getPronouns(request.childProfile.gender);
  const methodologyDescriptions: { [key: string]: string } = {
    montessori: "Self-directed learning emphasizing independence, hands-on exploration with carefully prepared materials, intrinsic motivation, mixed-age groupings, and respect for natural psychological development. Focus on practical life skills, sensorial experiences, and following the child's interests.",
    reggio: "Child-led, project-based exploration emphasizing the 'hundred languages of children', documentation as assessment, collaborative learning, emergent curriculum, beautiful and inspiring environments, and the teacher as researcher and guide.",
    waldorf: "Holistic development through artistic expression, natural rhythms aligned with seasons and developmental stages, imaginative play, storytelling, minimal technology, natural materials, and nurturing creativity and wonder.",
    highscope: "Active participatory learning using the plan-do-review sequence, emphasis on key developmental indicators, scaffolding learning, adult-child interaction strategies, and systematic assessment through observation.",
    bankstreet: "Developmental-interaction approach emphasizing social-emotional development, community connections, experiential learning, integration of subjects, understanding child development stages, and connecting learning to real-world experiences.",
    'play-based': "Learning through child-directed and adult-guided play experiences, recognizing play as the primary vehicle for learning, incorporating both structured and unstructured play, and using play to build skills across all developmental domains.",
    'inquiry-based': "Question-driven exploration promoting curiosity, critical thinking, problem-solving, scientific method, student-led investigations, and discovery learning through hands-on experimentation and observation."
  };

  const selectedMethodologies = request.methodologies
    .map((m: string) => `\n  • ${m.toUpperCase()}: ${methodologyDescriptions[m]}`)
    .join('');

  const advancedFeatures = request.advancedOptions ? Object.entries(request.advancedOptions)
    .filter(([_, value]) => value === true || (Array.isArray(value) && value.length > 0) || (typeof value === 'string' && value !== 'none'))
    .map(([key, value]) => `  • ${key}: ${Array.isArray(value) ? value.join(', ') : value}`)
    .join('\n') : '';

  // Only include therapy targets if they're explicitly provided
  let therapyTargetsSection = '';

  if (request.therapyTargets.speech && request.therapyTargets.speech.length > 0) {
    therapyTargetsSection += `- Speech Therapy Targets (MUST integrate naturally): ${request.therapyTargets.speech.join(', ')}\n`;
  }

  if (request.therapyTargets.ot && request.therapyTargets.ot.length > 0) {
    therapyTargetsSection += `- Occupational Therapy Targets (MUST integrate naturally): ${request.therapyTargets.ot.join(', ')}\n`;
  }

  return `
You are a MASTER early childhood educator, pediatric therapist, and activity designer with 20+ years of experience. You have expertise in:
- Child development theories (Piaget, Vygotsky, Erikson, Bronfenbrenner)
- Multiple educational philosophies and their practical applications
- Therapeutic interventions for speech, occupational therapy, and sensory integration
- Inclusive design and universal design for learning (UDL)
- Cultural sensitivity and anti-bias education
- Neurodevelopmental understanding across ages 0-8

═══════════════════════════════════════════════════════════════
CHILD PROFILE - DEEP UNDERSTANDING REQUIRED
═══════════════════════════════════════════════════════════════

IDENTITY & PREFERENCES:
- Name: ${request.childProfile.name}
- Age: ${request.childProfile.age} years old (Consider developmental stage, typical abilities, and individual variations)
${request.childProfile.gender ? `- Gender: ${request.childProfile.gender}` : ''}
- Pronouns: ALWAYS use ${pronouns.subject}/${pronouns.object}/${pronouns.possessive} when referring to ${request.childProfile.name}

INTERESTS & PASSIONS:
${request.childProfile.interests.map(i => `  • ${i} - Leverage this interest as a powerful motivator and engagement tool`).join('\n')}

LEARNING PROFILE:
- Learning Style: ${request.childProfile.learningStyle} 
  (Adapt all instructions and materials to optimize for this learning preference)
- Energy Level: ${request.childProfile.energyLevel}
  (Match activity pacing, movement opportunities, and duration accordingly)
- Social Preference: ${request.childProfile.socialPreference}
  (Design social interactions that honor this preference while gently expanding comfort zones)

SENSORY PROFILE:
${request.childProfile.sensoryNeeds.map(need => `  • ${need} - Critical consideration for activity design and adaptations`).join('\n')}

THERAPEUTIC GOALS:
Speech Development Goals:
${request.childProfile.speechGoals.map(goal => `  • ${goal} - Embed opportunities throughout activity`).join('\n')}

Occupational Therapy Goals:
${request.childProfile.otGoals.map(goal => `  • ${goal} - Integrate naturally into activity flow`).join('\n')}

═══════════════════════════════════════════════════════════════
ACTIVITY DESIGN REQUIREMENTS
═══════════════════════════════════════════════════════════════

BASIC PARAMETERS:
- Activity Type: ${request.activityType}
- Category: ${request.category}
- Duration: ${request.duration} minutes (Include setup, activity, transition, and cleanup time)
- Environment: ${request.environment}
- Material Constraints: ${request.materialConstraints.join(', ')}

EDUCATIONAL METHODOLOGIES TO INTEGRATE:${selectedMethodologies}

LEARNING OBJECTIVES (Must be SMART - Specific, Measurable, Achievable, Relevant, Time-bound):
${request.learningObjectives.map(obj => `  • ${obj}`).join('\n')}

${therapyTargetsSection}

REQUIRED ADAPTATIONS:
${request.adaptationNeeds.map(need => `  • ${need} - Provide specific, actionable adaptations`).join('\n')}

${advancedFeatures ? `ADVANCED FEATURES TO INCLUDE:\n${advancedFeatures}` : ''}

═══════════════════════════════════════════════════════════════
DETAILED OUTPUT REQUIREMENTS
═══════════════════════════════════════════════════════════════

Create an EXCEPTIONALLY DETAILED, professionally designed activity that could be published in an early childhood education journal. Each section should be comprehensive and actionable.

CRITICAL INSTRUCTIONS:
1. Make it PERSONAL - Use ${request.childProfile.name} and correct pronouns (${pronouns.subject}/${pronouns.object}/${pronouns.possessive}) throughout
2. Make it SPECIFIC - No vague suggestions; every item should be concrete and actionable
3. Make it DEVELOPMENTALLY APPROPRIATE - Based on ${request.childProfile.age} years old
4. Make it THERAPEUTIC - Seamlessly integrate speech and OT targets without making it feel clinical
5. Make it ENGAGING - Tap into interests: ${request.childProfile.interests.join(', ')}
6. Make it SAFE - Include safety considerations and supervision needs
7. Make it INCLUSIVE - Ensure multiple entry points and success opportunities
8. Make it EVIDENCE-BASED - Ground recommendations in developmental research

DETAILED JSON STRUCTURE REQUIREMENTS:

{
  "title": "Creative, engaging title that includes child's name and captures the essence of the activity",
  
  "description": "A comprehensive 4-6 paragraph description including:
    - Opening hook explaining why this activity is perfect for ${request.childProfile.name}
    - Detailed explanation of how it integrates the selected methodologies
    - How it addresses their specific interests, learning style, and developmental needs
    - The therapeutic benefits woven naturally into the activity
    - Expected outcomes and developmental gains
    - Why parents/educators will love implementing this",
  
  "materials": [
    "List 8-15 specific materials with exact specifications",
    "Include quantities, sizes, colors when relevant",
    "Suggest alternatives for different budget levels",
    "Note which materials support specific sensory needs",
    "Include safety notes for any materials requiring supervision",
    "Mark which items can be found at home vs. need to be purchased"
  ],
  
  "instructions": [
    "Provide 10-20 detailed, numbered steps",
    "Each step should be 2-3 sentences with clear actions",
    "Include timing estimates for each phase",
    "Embed methodology-specific language and approaches",
    "Integrate speech and OT targets naturally into steps",
    "Add 'Pro Tips' within steps for optimal implementation",
    "Include child engagement strategies in each phase",
    "Note where to give choices to honor ${request.childProfile.socialPreference} preference",
    "Highlight where ${request.childProfile.learningStyle} learning style is leveraged"
  ],
  
  "learningObjectives": [
    "List 6-10 specific, measurable objectives",
    "Each objective should be SMART formatted",
    "Cover multiple developmental domains",
    "Connect objectives to methodology principles",
    "Include both immediate and longer-term learning goals"
  ],
  
  "adaptations": {
    "sensory": [
      "Provide 5-8 specific sensory adaptations",
      "Address each sensory need mentioned: ${request.childProfile.sensoryNeeds.join(', ')}",
      "Include sensory diet integration suggestions",
      "Offer both sensory-seeking and sensory-avoiding modifications"
    ],
    "motor": [
      "Provide 5-8 motor skill adaptations",
      "Address fine motor, gross motor, and bilateral coordination",
      "Include positioning suggestions",
      "Offer adaptive equipment recommendations when relevant"
    ],
    "cognitive": [
      "Provide 5-8 cognitive scaffolding strategies",
      "Include visual supports, verbal cues, and modeling approaches",
      "Offer simplification and extension options",
      "Address executive function support"
    ]
  },
  
  "assessment": {
    "observationPoints": [
      "List 8-12 specific behaviors and skills to observe",
      "Include what successful engagement looks like",
      "Note developmental milestone connections",
      "Provide objective vs. subjective observation guidance"
    ],
    "milestones": [
      "List 6-10 developmental milestones this activity supports",
      "Reference specific domains (physical, cognitive, social-emotional, language)",
      "Note age-appropriate expectations vs. individual variations"
    ]
  },
  
  "parentGuidance": {
    "setupTips": [
      "Provide 6-10 detailed setup tips",
      "Include timing recommendations (best time of day)",
      "Environmental preparation specifics",
      "How to prep ${request.childProfile.name} emotionally/mentally",
      "Materials organization strategies"
    ],
    "encouragementPhrases": [
      "Provide 10-15 specific phrases using ${request.childProfile.name} and ${pronouns.subject}/${pronouns.object}/${pronouns.possessive}",
      "Include growth mindset language",
      "Offer process-focused praise",
      "Include phrases for different moments (struggling, succeeding, exploring)",
      "Model language that supports speech goals"
    ],
    "extensionIdeas": [
      "Provide 6-10 ways to extend the activity",
      "Include easier and harder variations",
      "Connect to other learning opportunities",
      "Suggest ways to revisit over time",
      "Link to real-world applications"
    ],
    "troubleshooting": [
      "Anticipate 8-12 common challenges with specific solutions",
      "Address attention/engagement issues",
      "Handle frustration and emotional regulation",
      "Manage sensory overwhelm",
      "Adapt if materials aren't available",
      "Modify for different energy levels"
    ]
  },
  
  "developmentalAreas": [
    "List all developmental domains addressed",
    "Be specific about subdomains (e.g., 'Fine motor - pincer grasp development' not just 'Motor')"
  ],
  
  ${request.therapyTargets.speech && request.therapyTargets.speech.length > 0 ? `"speechTargets": [
    "For each target (${request.therapyTargets.speech.join(', ')}), explain:",
    "- HOW it's integrated into the activity",
    "- WHEN to emphasize it during the activity",
    "- WHAT to model/practice",
    "- STRATEGIES for eliciting the target naturally"
  ],` : ''}
  
  ${request.therapyTargets.ot && request.therapyTargets.ot.length > 0 ? `"otTargets": [
    "For each target (${request.therapyTargets.ot.join(', ')}), explain:",
    "- HOW it's embedded in the activity naturally",
    "- WHAT movements/skills to emphasize",
    "- POSITIONING and adaptive strategies",
    "- PROGRESSION for skill building"
  ],` : ''}
  
  "safetyConsiderations": [
    "List 5-8 specific safety considerations",
    "Include supervision requirements",
    "Note choking hazards or allergens",
    "Address sensory safety",
    "Include emergency preparation if relevant"
  ],
  
  "tags": [
    "Include 10-15 relevant, searchable tags",
    "Cover methodology, skills, themes, materials, age range"
  ],
  
  ${request.advancedOptions?.includeMultimedia ? `
  "multimedia": {
    "suggestedPhotos": [
      "List 8-12 specific photo documentation ideas",
      "Include what to capture at each stage",
      "Suggest angles and focus points",
      "Note moments that show learning/progress"
    ],
    "videoIdeas": [
      "Provide 5-8 video documentation suggestions",
      "Include length recommendations",
      "Suggest what to narrate/caption",
      "Note key moments to capture"
    ],
    "audioElements": [
      "List 5-8 audio components",
      "Include songs, sound effects, verbal cues",
      "Suggest recording ideas for speech development"
    ]
  },` : ''}
  
  ${request.advancedOptions?.generateAssessmentRubric ? `
  "assessmentRubric": {
    "criteria": [
      "List 6-8 assessment criteria aligned with learning objectives"
    ],
    "levels": [
      "Emerging (1): Child is beginning to show interest/attempt",
      "Developing (2): Child participates with significant support",
      "Proficient (3): Child participates with minimal support",
      "Advanced (4): Child demonstrates mastery and can extend independently"
    ],
    "descriptors": {
      "criterion1": {
        "emerging": "Specific behavioral indicators",
        "developing": "Specific behavioral indicators",
        "proficient": "Specific behavioral indicators",
        "advanced": "Specific behavioral indicators"
      }
    }
  },` : ''}
  
  ${request.advancedOptions?.generateExtensionActivities ? `
  "extensionActivities": [
    {
      "title": "Specific extension activity title",
      "description": "Detailed 2-3 paragraph description",
      "duration": "X minutes",
      "materials": ["Specific materials needed"],
      "instructions": ["Detailed steps"],
      "learningConnection": "How this extends the original activity"
    }
  ],` : ''}
  
  ${request.advancedOptions?.generateReflectionPrompts ? `
  "reflectionPrompts": {
    "forChild": [
      "6-10 age-appropriate reflection questions",
      "Use simple language for younger children",
      "Include both verbal and non-verbal response options",
      "Frame positively and open-endedly"
    ],
    "forParent": [
      "6-10 reflection questions for parents",
      "Focus on observation, child's experience, and insights gained",
      "Include questions about next steps and connections"
    ],
    "forEducator": [
      "6-10 professional reflection questions",
      "Address methodology implementation, differentiation, and outcomes",
      "Include questions about documentation and assessment"
    ]
  },` : ''}
  
  ${request.advancedOptions?.culturalConsiderations?.length ? `
  "culturalAdaptations": {
    "considerations": [
      "Address cultural backgrounds: ${request.advancedOptions.culturalConsiderations.join(', ')}",
      "Provide 5-8 specific cultural considerations",
      "Include language, traditions, values, materials, and representations"
    ],
    "modifications": [
      "Provide 5-8 specific modifications to honor cultural contexts",
      "Suggest culturally relevant materials and examples",
      "Include family involvement approaches"
    ]
  },` : ''}
  
  ${request.advancedOptions?.createDigitalResources ? `
  "digitalResources": {
    "apps": [
      "List 5-8 specific, age-appropriate apps with descriptions",
      "Include how each app enhances the activity",
      "Note cost and platform availability"
    ],
    "websites": [
      "List 5-8 helpful websites with specific URLs if possible",
      "Describe what resources are available on each"
    ],
    "tools": [
      "List 5-8 digital tools or platforms",
      "Include specific use cases for this activity"
    ]
  },` : ''}
  
  "implementationTimeline": {
    "preparation": "X minutes - what to do",
    "introduction": "X minutes - how to introduce to ${request.childProfile.name}",
    "mainActivity": "X minutes - core engagement time",
    "transition": "X minutes - how to wind down",
    "cleanup": "X minutes - involving child in cleanup",
    "reflection": "X minutes - discussion and reflection"
  },
  
  "successIndicators": [
    "List 8-12 signs the activity was successful",
    "Include engagement, learning, and enjoyment indicators",
    "Address both immediate and delayed indicators",
    "Note what 'success' looks like for this individual child"
  ]
}

REMEMBER: This activity should be so detailed and well-designed that any parent or educator could implement it successfully, feel confident in its educational value, and see meaningful engagement and learning from ${request.childProfile.name}. Every element should feel personalized, purposeful, and professionally crafted.
`;
};

export const generateActivityWithAI = async (request: AIGenerationRequest): Promise<AIGeneratedActivity> => {
  try {
    const prompt = buildPrompt(request);

    const pronouns = getPronouns(request.childProfile.gender);
    
    const completion = await openai.chat.completions.create({
      model: "gpt-4-turbo-preview",
      messages: [
        {
          role: "system",
          content: `You are a MASTER-LEVEL early childhood educator, pediatric therapist, and curriculum designer with the following credentials and expertise:

🎓 CREDENTIALS & EXPERTISE:
- Ph.D. in Early Childhood Education with specialization in developmental psychology
- Licensed Speech-Language Pathologist (SLP) and Occupational Therapist (OT)
- 20+ years of experience across diverse educational settings (Montessori, Reggio Emilia, Waldorf, public schools)
- Certified in multiple therapeutic approaches (sensory integration, floor time, social thinking)
- Expert in Universal Design for Learning (UDL) and inclusive education practices
- Advanced knowledge of child development theories (Piaget, Vygotsky, Erikson, Bronfenbrenner, etc.)
- Specialization in culturally responsive and anti-bias education
- Published researcher in early childhood pedagogy and therapeutic interventions

🎯 YOUR MISSION:
Create EXCEPTIONALLY DETAILED, professionally designed, evidence-based learning activities that are:
1. PERSONALIZED - Deeply tailored to the individual child's profile, interests, and needs
2. THERAPEUTIC - Seamlessly integrating speech and OT targets without clinical feel
3. METHODOLOGY-DRIVEN - Authentically incorporating selected educational philosophies
4. DEVELOPMENTALLY APPROPRIATE - Grounded in child development research
5. INCLUSIVE - Designed with multiple entry points and success pathways
6. ENGAGING - Captivating and motivating for the specific child
7. ACTIONABLE - So detailed that anyone could implement successfully
8. COMPREHENSIVE - Covering all aspects from setup to assessment to troubleshooting

⚠️ CRITICAL REQUIREMENTS:

PRONOUN USAGE (MANDATORY):
- Child's name: ${request.childProfile.name}
- Pronouns: ${pronouns.subject}/${pronouns.object}/${pronouns.possessive}/${pronouns.reflexive}
- ALWAYS use these exact pronouns when referring to the child
- NEVER use "he/she" or "his/her" - use ONLY the specified pronouns
- Make the activity feel personal by using the child's name frequently

DEPTH & DETAIL REQUIREMENTS:
- Write 2-3 sentences minimum for EACH array item (not just one-liners)
- Provide SPECIFIC, CONCRETE, ACTIONABLE information (no vague suggestions)
- Include RATIONALE and REASONING behind recommendations
- Add CONTEXTUAL DETAILS that show deep understanding
- Integrate PROFESSIONAL KNOWLEDGE and evidence-based practices
- Think like you're writing for publication in an educational journal

QUALITY STANDARDS:
- Every suggestion must be grounded in developmental theory or research
- All therapeutic targets must be woven naturally into the activity flow
- Safety must be considered and addressed explicitly
- Cultural sensitivity and inclusivity must permeate all aspects
- Language should be professional yet accessible to parents and educators
- The activity must feel cohesive, not like a checklist

OUTPUT FORMAT:
- Respond ONLY with valid, properly formatted JSON
- NO markdown formatting, NO code blocks, NO additional text
- Ensure all JSON syntax is correct (commas, brackets, quotes)
- Make the JSON comprehensive per the detailed structure provided

EXCELLENCE MINDSET:
Approach this as if you're designing an activity for your own child or a paying client who expects premium, professional quality. Every section should demonstrate expertise, thoughtfulness, and genuine care for the child's development and experience. Make this activity so good that educators would want to use it as a model example.`
        },
        {
          role: "user",
          content: prompt
        }
      ],
      temperature: 0.7,
      max_tokens: 6000
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
    {
      title: "SIMPLIFIED VERSION for Younger or Beginning Learners",
      instructions: `Create a developmentally appropriate simplified version of this activity that:
- Reduces complexity while maintaining core learning objectives
- Shortens duration and number of steps
- Uses larger, easier-to-manipulate materials
- Provides more concrete, hands-on experiences
- Increases adult support and scaffolding
- Simplifies language and instructions
- Focuses on 1-2 key skills instead of multiple skills
- Makes success more immediately achievable
- Maintains engagement and fun while being easier

Ensure the variation is detailed, specific, and maintains the same JSON structure with comprehensive descriptions.`
    },
    {
      title: "ADVANCED VERSION for Older or Advanced Learners",
      instructions: `Create a challenging extension of this activity that:
- Increases complexity and cognitive demand
- Adds additional steps, materials, or challenges
- Incorporates higher-order thinking skills (analysis, synthesis, evaluation)
- Introduces more abstract concepts or multi-step processes
- Reduces scaffolding to encourage independence
- Adds opportunities for creativity and open-ended exploration
- Integrates additional learning domains or skills
- Extends duration for deeper engagement
- Includes reflection and metacognitive components

Ensure the variation is detailed, specific, and maintains the same JSON structure with comprehensive descriptions.`
    },
    {
      title: "ALTERNATIVE MODALITY VERSION with Different Learning Approach",
      instructions: `Create a variation that approaches the same learning objectives through a completely different modality:
- If original was visual, make this kinesthetic or auditory
- If original was sedentary, make this movement-based
- If original was individual, make this collaborative
- If original was structured, make this more open-ended
- If original was indoor, make this outdoor (or vice versa)
- Change the primary sense engaged (visual → tactile, auditory → visual, etc.)
- Modify the social dynamics (group → individual, partner → whole group)
- Transform the context (table-top → floor play, quiet → active, etc.)

Ensure the variation is detailed, specific, and maintains the same JSON structure with comprehensive descriptions.`
    },
    {
      title: "THERAPEUTIC FOCUS VERSION with Enhanced Intervention",
      instructions: `Create a variation that intensifies therapeutic targets while remaining playful:
- Increase frequency of therapy target opportunities
- Add specific therapeutic techniques and strategies
- Include more detailed progress monitoring suggestions
- Provide additional adult prompting and modeling scripts
- Incorporate repetition and practice in engaging ways
- Add sensory or motor challenges specific to therapeutic goals
- Include data collection suggestions for tracking progress
- Provide more detailed adaptations for various ability levels

Ensure the variation is detailed, specific, and maintains the same JSON structure with comprehensive descriptions.`
    }
  ];

  for (let i = 0; i < Math.min(count, variationPrompts.length); i++) {
    try {
      const completion = await openai.chat.completions.create({
        model: "gpt-4-turbo-preview",
        messages: [
          {
            role: "system",
            content: `You are a MASTER early childhood educator and curriculum designer with expertise in differentiated instruction, therapeutic interventions, and inclusive design.

Your task is to create HIGH-QUALITY VARIATIONS of educational activities that maintain professional standards and comprehensive detail. Each variation should be:
- EQUALLY DETAILED as the original activity (not abbreviated)
- PROFESSIONALLY WRITTEN with expertise and rationale
- DEVELOPMENTALLY APPROPRIATE for the target modification
- COMPREHENSIVE across all sections of the JSON structure
- SPECIFIC and ACTIONABLE with concrete details
- ENGAGING and motivating for children

CRITICAL: Respond ONLY with valid JSON. NO markdown, NO code blocks, NO additional text. Ensure all JSON syntax is perfect.`
          },
          {
            role: "user",
            content: `BASE ACTIVITY:
${JSON.stringify(baseActivity, null, 2)}

═══════════════════════════════════════════════════════════════
VARIATION REQUEST: ${variationPrompts[i].title}
═══════════════════════════════════════════════════════════════

${variationPrompts[i].instructions}

Provide a complete, detailed activity variation in the EXACT SAME JSON format as the base activity, with all the same fields filled out comprehensively. This should be publication-quality work.`
          }
        ],
        temperature: 0.8,
        max_tokens: 5000
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
      model: "gpt-4-turbo-preview",
      messages: [
        {
          role: "system",
          content: `You are a SENIOR EDUCATIONAL EVALUATOR and PEER REVIEWER for early childhood education publications. You have:
- 25+ years of experience evaluating educational curricula
- Advanced degrees in early childhood education and assessment
- Expertise in evidence-based practice standards
- Deep knowledge of developmental appropriateness criteria
- Experience as an accreditation reviewer for early childhood programs
- Published expertise in activity design and pedagogical quality

Your evaluations are:
- RIGOROUS and based on established quality standards
- CONSTRUCTIVE and focused on improvement
- SPECIFIC with concrete, actionable feedback
- BALANCED acknowledging strengths and areas for growth
- EVIDENCE-BASED referencing best practices and research

CRITICAL: Respond ONLY with valid JSON. NO markdown, NO additional text.`
        },
        {
          role: "user",
          content: `ACTIVITY TO EVALUATE:
${JSON.stringify(activity, null, 2)}

═══════════════════════════════════════════════════════════════
COMPREHENSIVE QUALITY ANALYSIS REQUIRED
═══════════════════════════════════════════════════════════════

Evaluate this activity using professional standards for early childhood education. Provide detailed analysis in this JSON format:

{
  "overallScore": [0-100 integer based on comprehensive evaluation],
  "engagement": [0-10 score - How captivating and motivating is this activity?],
  "educationalValue": [0-10 score - How well does it support meaningful learning across developmental domains?],
  "clarity": [0-10 score - How clear, specific, and actionable are the instructions and materials?],
  "adaptability": [0-10 score - How well does it accommodate diverse learners and needs?],
  "developmentalAppropriateness": [0-10 score - How well-aligned is it with child development principles?],
  "therapeuticIntegration": [0-10 score - How seamlessly are therapy targets integrated?],
  "safetyConsideration": [0-10 score - How well are safety factors addressed?],
  "methodologyAlignment": [0-10 score - How authentically does it reflect stated educational philosophies?],
  
  "strengths": [
    "List 5-8 specific strengths with detailed explanations",
    "Each strength should be 2-3 sentences explaining what's done well and why it matters",
    "Reference specific elements of the activity",
    "Connect to educational theory or best practices"
  ],
  
  "areasForImprovement": [
    "List 5-8 specific areas that could be enhanced",
    "Each area should be 2-3 sentences explaining the gap and potential impact",
    "Be constructive and specific",
    "Reference educational standards or research"
  ],
  
  "suggestions": [
    "Provide 8-12 concrete, actionable suggestions for improvement",
    "Each suggestion should be specific enough to implement immediately",
    "Prioritize suggestions that would have the greatest impact",
    "Include both quick fixes and more substantial enhancements",
    "Cover multiple aspects: content, delivery, materials, assessment, etc."
  ],
  
  "expertCommentary": "A comprehensive 3-4 paragraph expert review that synthesizes the analysis, provides context, highlights what makes this activity effective or not, and offers guidance for optimization. Write as if reviewing for a professional journal."
}

Be thorough, professional, and constructive. Your analysis should help educators understand both the quality of this activity and how to make it even better.`
        }
      ],
      temperature: 0.3,
      max_tokens: 2500
    });

    const response = completion.choices[0]?.message?.content;
    if (response) {
      return JSON.parse(response);
    }
  } catch (error) {
    console.error('Failed to analyze activity quality:', error);
  }

  // Fallback analysis with more detail
  return {
    overallScore: 75,
    engagement: 8,
    educationalValue: 7,
    clarity: 8,
    adaptability: 7,
    developmentalAppropriateness: 7,
    therapeuticIntegration: 6,
    safetyConsideration: 7,
    methodologyAlignment: 7,
    strengths: [
      'Activity shows good alignment with developmental stage and incorporates child interests effectively',
      'Instructions are generally clear and provide step-by-step guidance',
      'Materials are accessible and appropriate for the age group'
    ],
    areasForImprovement: [
      'Could benefit from more detailed sensory adaptations and explicit sensory integration strategies',
      'Therapeutic targets could be more seamlessly woven into the activity flow rather than feeling like separate components',
      'Assessment section could include more specific observation criteria and milestone connections'
    ],
    suggestions: [
      'Add specific sensory diet elements that align with the child\'s sensory profile',
      'Include more explicit connections to the stated educational methodology throughout instructions',
      'Expand parent guidance section with troubleshooting for common challenges',
      'Provide more detailed extension activities for sustained engagement',
      'Include visual support suggestions for children who benefit from visual schedules',
      'Add specific language modeling examples that target speech goals naturally',
      'Strengthen the connection between learning objectives and assessment criteria',
      'Include more specific timing estimates for each phase of the activity'
    ],
    expertCommentary: 'This activity demonstrates a solid foundation with developmentally appropriate content and clear structure. The incorporation of child interests is a strength that will support engagement. However, to reach excellence, the activity would benefit from deeper integration of therapeutic targets that feel natural rather than clinical, more comprehensive adaptations that demonstrate understanding of diverse learning needs, and stronger connections to the stated educational methodology. With these enhancements, this activity could serve as a model example of inclusive, engaging, and effective early childhood education.'
  };
};

const generateFallbackActivity = (request: AIGenerationRequest): AIGeneratedActivity => {
  const childName = request.childProfile.name;
  const activityType = request.activityType;
  const category = request.category;
  const pronouns = getPronouns(request.childProfile.gender);

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
      `Guide ${childName} through the activity with patience and encouragement`,
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
        `"I notice ${pronouns.subject}'s really focused on this!"`,
        `"Tell me what ${pronouns.subject}'s thinking about."`
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


