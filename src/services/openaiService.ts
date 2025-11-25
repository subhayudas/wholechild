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
${request.childProfile.gender ? `GENDER: ${request.childProfile.gender}` : ''}
PRONOUNS: Use ${pronouns.subject}/${pronouns.object}/${pronouns.possessive} when referring to ${request.childProfile.name} throughout the activity description, instructions, and guidance.

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
OUTPUT FORMAT & DEPTH REQUIREMENTS (JSON Structure)
═══════════════════════════════════════════════════════════════

CREATE A COMPREHENSIVE, DEEPLY DETAILED JSON RESPONSE:

{
  "title": "6-12 word engaging, personalized title incorporating ${request.childProfile.name}'s interest or methodology focus",
  
  "description": "4-8 complete sentences (100-200 words) that:
    • Opens with direct connection to ${request.childProfile.name}'s specific interests
    • Explains authentic methodology integration (not superficial)
    • Describes developmental benefits across multiple domains
    • Conveys emotional engagement and joy
    • Uses ${request.childProfile.name}'s name and correct pronouns (${pronouns.subject}/${pronouns.object}/${pronouns.possessive})
    • Explains WHY this is uniquely perfect for THIS child",
  
  "materials": [
    "MINIMUM 8-15 items, each with FULL SPECIFICATIONS:",
    "• Exact quantity (e.g., '3 smooth river stones' not 'some stones')",
    "• Precise size/dimensions (e.g., '2-3 inches diameter' or '8x10 inch tray')",
    "• Material composition (wood, plastic, ceramic, fabric type, etc.)",
    "• Sensory qualities (smooth, textured, soft, cool, warm, etc.)",
    "• Color when relevant for activity or sensory needs",
    "• Why this specific material is chosen for ${request.childProfile.name}",
    "• Alternatives if budget/availability constrained",
    "Example: '3 smooth river stones (2-3 inches), cool to touch, weight approx 4-6 oz each - chosen for ${request.childProfile.name}'s interest in natural materials and calming sensory input'"
  ],
  
  "instructions": [
    "MINIMUM 10-18 detailed steps. Each step MUST include:",
    "1. CLEAR ACTION: Exactly what to do",
    "2. DEVELOPMENTAL PURPOSE: Why this step matters for learning",
    "3. EXACT LANGUAGE: Word-for-word phrases to say to ${request.childProfile.name}",
    "4. OBSERVATION CUES: What to watch for and why it's significant",
    "5. TIMING: How long this phase typically takes",
    "6. METHODOLOGY TIE-IN: How this reflects chosen pedagogical approach",
    "",
    "Example step format:",
    "**Step 1: Environmental Preparation (2-3 minutes)**",
    "Begin by arranging the three river stones in a triangular pattern on the wooden tray, positioned at ${request.childProfile.name}'s dominant hand side. This Montessori-inspired prepared environment invites purposeful engagement. Say to ${request.childProfile.name}: 'I've set up something special for you to explore. These stones came from a river and each one has a unique story.' Observe how ${pronouns.subject} approaches the materials - does ${pronouns.subject} rush in or pause to study first? This reveals ${pronouns.possessive} natural learning approach and impulse control development.",
    "",
    "Continue this detailed format for ALL 10-18 steps"
  ],
  
  "learningObjectives": [
    "MINIMUM 5-10 specific, measurable objectives across domains:",
    "• COGNITIVE: (2-3 objectives with specific skills)",
    "• LANGUAGE: (1-2 objectives with vocabulary/communication specifics)",
    "• PHYSICAL - Fine Motor: (1-2 objectives with exact motor skills)",
    "• PHYSICAL - Gross Motor: (1 objective if activity involves large movements)",
    "• SOCIAL-EMOTIONAL: (1-2 objectives with regulation/relationship skills)",
    "• CREATIVE/EXPRESSIVE: (1-2 objectives with innovation/expression skills)",
    "",
    "Format each as: '[Domain]: [Specific observable skill] - Example: ${request.childProfile.name} will demonstrate...'",
    "Example: 'Fine Motor Development: ${request.childProfile.name} will demonstrate tripod grasp control while manipulating small objects, strengthening ${pronouns.possessive} pincer grip with 85%+ accuracy during 10+ pick-up-and-place movements'",
    "Example: 'Cognitive Development: ${request.childProfile.name} will engage in hypothesis testing by predicting outcomes before actions, using language like 'I think...' and 'What if...', demonstrating emerging scientific thinking'"
  ],
  
  "adaptations": {
    "sensory": [
      "MINIMUM 4-8 detailed sensory adaptations with specifics:",
      "• For sensory seeking: Exact strategies with materials/movements",
      "• For sensory sensitive: Precise modifications to reduce overwhelm",
      "• Visual adaptations: Specific environmental changes",
      "• Auditory adaptations: Exact sound level/type modifications",
      "• Tactile adaptations: Alternative textures/touch experiences",
      "• Proprioceptive/vestibular: Specific movement/pressure options",
      "",
      "Example: 'If ${request.childProfile.name} shows tactile defensiveness with wet textures, provide a small handheld brush (soft bristle, 4-inch handle) to manipulate materials indirectly. Alternatively, use a spray bottle so ${pronouns.subject} can control moisture level. Say: ${request.childProfile.name}, you can use this tool to help you feel more comfortable while exploring.'"
    ],
    "motor": [
      "MINIMUM 4-8 detailed motor adaptations:",
      "• Fine motor alternatives: Specific tool modifications, grip aids",
      "• Gross motor alternatives: Exact positioning, support strategies",
      "• Bilateral coordination supports: Precise assistive techniques",
      "• Visual-motor supports: Specific visual cues/guides",
      "",
      "Example: 'If ${request.childProfile.name} has difficulty with pincer grasp, provide larger objects (1.5-2 inches vs 0.5-1 inch) or add a silicone grip aid (pencil gripper style) to tools. Position materials at midline height (belly button level when seated) to optimize bilateral hand use. Model using two hands together, saying: Watch how I use both my hands as a team - one holds steady while one moves.'"
    ],
    "cognitive": [
      "MINIMUM 4-8 detailed cognitive adaptations:",
      "• Processing speed accommodations: Specific pacing changes",
      "• Memory supports: Exact visual/verbal cue strategies",
      "• Attention supports: Precise environmental modifications",
      "• Executive function scaffolds: Specific organizational aids",
      "• Language processing supports: Exact simplification strategies",
      "",
      "Example: 'For reduced processing speed, introduce only 1-2 materials at a time (not all 8-15 at once). Provide a visual sequence card with 3-step pictorial reminders. Allow 30-60 second wait time after questions. Use ${request.childProfile.name}'s name before instructions: ${request.childProfile.name}, now we will... This primes ${pronouns.possessive} attention system for incoming information.'"
    ]
  },
  
  "assessment": {
    "observationPoints": [
      "MINIMUM 8-12 specific observation points with significance explanation:",
      "• What exact behavior/skill to watch for",
      "• Why this observation matters developmentally",
      "• What it reveals about ${request.childProfile.name}'s learning",
      "• How to document it (photo, note, video clip, etc.)",
      "",
      "Example: 'Observe how ${request.childProfile.name} transitions between activity phases. Does ${pronouns.subject} move smoothly or need verbal/visual prompts? This reveals executive function development (task switching) and working memory capacity. Note: If ${pronouns.subject} transitions independently 3+ times, this indicates emerging self-regulation skills typical of ${request.childProfile.age}-${request.childProfile.age + 1} year developmental range. Document with brief video clip showing transition sequence.'"
    ],
    "milestones": [
      "MINIMUM 6-10 developmental milestone indicators:",
      "• Link each to specific age norms/developmental frameworks",
      "• Explain what achievement of milestone demonstrates",
      "• Note typical age range for this skill",
      "",
      "Example: 'Demonstrates sustained attention for 8-12 minutes on self-chosen task - indicates developing executive function and intrinsic motivation, typical for ${request.childProfile.age}-year-olds with strong engagement. This is a key readiness indicator for formal learning settings.'"
    ],
    "documentationSuggestions": [
      "MINIMUM 3-5 specific documentation strategies:",
      "Example: 'Photograph ${request.childProfile.name}'s initial approach to materials (wide shot showing body language and facial expression) and final creation/arrangement (close-up detail). Take 10-second video clip of ${pronouns.object} explaining ${pronouns.possessive} thinking process - this captures language development and metacognition. Note any unexpected strategies ${pronouns.subject} invents - innovation indicators.'"
    ]
  },
  
  "parentGuidance": {
    "setupTips": [
      "MINIMUM 5-8 detailed, practical setup tips with reasoning:",
      "• Exact environmental preparation steps",
      "• Optimal timing considerations specific to ${request.childProfile.name}",
      "• Materials organization strategies",
      "• Preparation that can be done ahead",
      "• How to create inviting, accessible setup",
      "",
      "Example: 'Set up this activity 10-15 minutes before ${request.childProfile.name}'s typical high-energy engagement window (you mentioned ${pronouns.subject} is most focused mid-morning after snack). Arrange materials on a low table or floor mat at ${pronouns.possessive} eye level when seated. Place items in logical left-to-right sequence if activity has steps. Ensure good natural lighting from ${request.childProfile.name}'s left side if right-handed (reduces shadows on work). Prepare a small photo card showing completed example - visual reference supports confidence and reduces anxiety about not knowing what to do.'"
    ],
    "encouragementPhrases": [
      "MINIMUM 10-15 word-for-word encouragement phrases that:",
      "• Build specific competence (not generic praise like 'good job')",
      "• Encourage process over product",
      "• Use open-ended questions",
      "• Model rich vocabulary naturally",
      "• Support emotional regulation",
      "• Honor ${request.childProfile.name}'s agency and choices",
      "• Use ${request.childProfile.name}'s name and correct pronouns",
      "",
      "Examples:",
      "'${request.childProfile.name}, I notice you're using your pointer finger very carefully to trace that edge. That takes excellent control!'",
      "'Tell me about your thinking, ${request.childProfile.name}. What made you decide to try it that way?'",
      "'I see ${pronouns.subject}'s experimenting with different arrangements. What do you discover when you change the position?'",
      "'${request.childProfile.name}, you kept trying even when it was tricky. That's called persistence, and it helps your brain grow stronger!'",
      "'Look how ${pronouns.subject} solved that problem ${pronouns.reflexive}! What strategy did you use?'",
      "'I'm curious about ${pronouns.possessive} choice to use the blue one first. Can you tell me why?'",
      "'${request.childProfile.name} is showing really focused attention. ${pronouns.possessive} concentration is impressive!'",
      "'What patterns do you notice, ${request.childProfile.name}? ${pronouns.subject}'s really observing carefully.'",
      "'Tell me more about that idea, ${request.childProfile.name}. I want to understand ${pronouns.possessive} thinking.'",
      "'${request.childProfile.name}, you used gentle hands with those delicate materials. That's showing excellent body awareness!'"
    ],
    "extensionIdeas": [
      "MINIMUM 6-10 detailed extension activities with full descriptions:",
      "• Each extension should be 3-5 sentences with complete explanation",
      "• Build naturally on the core activity",
      "• Offer different directions: complexity, creativity, connection, collaboration",
      "• Specify new materials needed (if any)",
      "• Explain developmental progression this extension supports",
      "",
      "Example: '**Story Creation Extension (Language & Narrative Development):** Invite ${request.childProfile.name} to create a story about the materials or ${pronouns.possessive} experience. Provide a simple story map (visual template with beginning/middle/end sections) to scaffold narrative structure. ${pronouns.subject} can dictate while you transcribe, or draw ${pronouns.possessive} story in sequence. Say: ${request.childProfile.name}, these materials remind me of adventures. What story could they tell? This develops narrative skills, sequencing, cause-effect thinking, and rich vocabulary use - critical pre-literacy foundations.'"
    ],
    "troubleshooting": [
      "MINIMUM 8-12 specific challenge scenarios with concrete solutions:",
      "• Identify exact problem",
      "• Explain why it might happen",
      "• Provide 2-3 specific solution strategies",
      "• Include language to use",
      "",
      "Example:",
      "**Challenge: ${request.childProfile.name} loses interest after 3-4 minutes**",
      "**Why:** Activity may be too simple/complex, or ${pronouns.subject} may need more sensory input given ${pronouns.possessive} high energy level.",
      "**Solutions:**",
      "1. Add novelty element: Introduce an unexpected 'surprise' material mid-activity. Say: 'Oh! I just remembered we have something special that might go with this. Want to see?'",
      "2. Increase movement: Suggest doing parts of activity in different locations. 'Let's gather these items and bring them to your special work spot by the window.'",
      "3. Add social element: Join as play partner, not director. 'I wonder what would happen if I tried... What do you think, ${request.childProfile.name}?'",
      "4. Check timing: ${request.childProfile.name} may need this activity in shorter bursts. Try 5-minute sessions 2-3 times instead of one 15-minute session."
    ]
  },
  
  "developmentalAreas": [
    "MINIMUM 5-8 areas with sub-skills specified:",
    "Format: 'Primary Domain (specific sub-skill 1, specific sub-skill 2, specific sub-skill 3)'",
    "",
    "Examples:",
    "'Cognitive Development (problem-solving, hypothesis testing, cause-effect reasoning, spatial awareness, classification skills)'",
    "'Fine Motor Development (pincer grasp refinement, bilateral hand coordination, wrist stability, tool manipulation, eye-hand coordination)'",
    "'Language Development (receptive vocabulary, expressive communication, descriptive language, question formation, narrative skills)'",
    "'Social-Emotional Development (self-regulation, frustration tolerance, pride in accomplishment, emotional labeling, turn-taking)'",
    "'Creative Expression (imaginative thinking, divergent problem-solving, aesthetic awareness, symbolic representation)'"
  ],
  
  ${request.therapyTargets.speech && request.therapyTargets.speech.length > 0 ? `
  "speechTargets": [
    "MINIMUM 5-10 specific speech/language targets with embedding explanation:",
    "• Articulation targets with phoneme positions and practice contexts",
    "• Vocabulary targets with exact words and usage contexts",
    "• Pragmatic language targets with social communication specifics",
    "• Narrative/discourse targets with scaffolding strategies",
    "",
    "Example: 'TARGET: /s/ sound in initial position - Embed naturally by encouraging ${request.childProfile.name} to describe items that start with /s/: stones, smooth, soft, shiny. Model clearly: These stones feel so smooth. Can you say smooth, ${request.childProfile.name}? Listen - sssmooth. Provide 15-20 natural repetition opportunities throughout activity without drill-like feel.'",
    "Example: 'TARGET: Use of describing words (adjectives) - Set up activity to naturally elicit descriptive language. Ask: How does this feel? What do you notice about this one compared to that one? Model rich describing: I notice this one is rough and bumpy while that one is smooth and flat. Explicitly teach words like textured, slippery, rigid, flexible. Aim for ${request.childProfile.name} to use 8-12 describing words independently.'"
  ],` : ''}
  
  ${request.therapyTargets.ot && request.therapyTargets.ot.length > 0 ? `
  "otTargets": [
    "MINIMUM 5-10 specific OT targets with embedding explanation:",
    "• Fine motor targets with exact movements and repetitions",
    "• Sensory integration targets with specific input types",
    "• Visual-motor/perceptual targets with concrete tasks",
    "• Bilateral coordination targets with hand role specifics",
    "",
    "Example: 'TARGET: Strengthen tripod grasp for writing readiness - Provide small tongs (4-inch, child-sized) or tweezers (jumbo size with 3-finger grip) for manipulating materials. This naturally positions thumb, index, and middle finger in tripod formation. Aim for 20-30 grasp-release movements. Observe: Is ${request.childProfile.name} using thumb opposition? Is wrist in neutral position? Make it functional and purposeful, not exercise-like: We need to sort these small items - can you use this special tool?'",
    "Example: 'TARGET: Tactile discrimination and desensitization - Activity incorporates varied textures (smooth stones, rough bark pieces, soft felt squares) for graduated tactile exposure. ${request.childProfile.name} can explore at own pace, building tolerance gradually. Provide option to use tool first (paintbrush for touching) before direct hand contact. This respects ${pronouns.possessive} sensory boundaries while gently expanding comfort zone. Track: Does ${pronouns.subject} tolerate direct touch by end of activity?'"
  ],` : ''}
  
  "tags": [
    "MINIMUM 8-15 specific, searchable tags including:",
    "• Methodology name(s)",
    "• Primary developmental domain(s)", 
    "• Specific materials/materials type",
    "• Environment setting",
    "• Key themes/interests",
    "• Skills targeted",
    "• Age specificity",
    "",
    "Examples: 'montessori', 'sensory-exploration', 'natural-materials', 'fine-motor-development', 'home-indoor', 'nature-theme', 'cognitive-development', 'toddler-3-4-years', 'cause-and-effect', 'open-ended-play'"
  ]
  
  ${request.advancedOptions?.includeMultimedia ? `
  ,"multimedia": {
    "suggestedPhotos": [
      "MINIMUM 4-6 detailed photo documentation ideas:",
      "Example: 'Capture close-up of ${request.childProfile.name}'s hands during fine motor task - focus on grasp pattern and finger positioning. Use natural lighting, shoot from above at 45-degree angle. This documents motor skill development.'",
      "Example: 'Take wide-angle shot of complete activity setup before ${request.childProfile.name} begins - shows prepared environment and material arrangement. Helpful for recreating activity and demonstrating setup for other caregivers.'"
    ],
    "videoIdeas": [
      "MINIMUM 3-5 specific video recording suggestions:",
      "Example: 'Record 20-30 second clip of ${request.childProfile.name} explaining ${pronouns.possessive} thinking or choices. Ask: Tell me what you're doing and why? This captures language development, reasoning skills, and metacognition. Audio quality is priority over video quality here.'",
      "Example: 'Film 15-second time-lapse of ${request.childProfile.name} working through problem-solving moment (if one arises naturally). Shows persistence, strategy use, emotional regulation. Don't stage - just be ready with phone.'"
    ],
    "audioElements": [
      "MINIMUM 2-4 audio documentation suggestions:",
      "Example: 'Use voice memo to record ${request.childProfile.name}'s spontaneous language during activity - capture new vocabulary words ${pronouns.subject} uses, questions ${pronouns.subject} asks, or running narrative of ${pronouns.possessive} actions. Play back later to identify language development indicators.'"
    ]
  }` : ''}
  
  ${request.advancedOptions?.generateAssessmentRubric ? `
  ,"assessmentRubric": {
    "criteria": [
      "MINIMUM 4-6 assessment criteria:",
      "Example: 'Task Engagement: Duration of sustained focus and quality of attention'",
      "Example: 'Motor Skill Execution: Accuracy and control of fine/gross motor movements'",
      "Example: 'Problem-Solving Approach: Strategies used when encountering challenges'"
    ],
    "levels": [
      "Emerging (Beginning to show skill)",
      "Developing (Shows skill with support)",
      "Proficient (Shows skill independently)",
      "Advanced (Shows skill with complexity/creativity)"
    ],
    "descriptors": {
      "emerging": [
        "MINIMUM 3-4 descriptors per criteria at this level:",
        "Example for Task Engagement: '${request.childProfile.name} maintains attention for 2-4 minutes with frequent adult redirection. Easily distracted by environmental stimuli. May need hand-over-hand guidance to re-engage.'"
      ],
      "developing": [
        "Example for Task Engagement: '${request.childProfile.name} sustains attention for 5-8 minutes with occasional adult prompting. Can redirect self with verbal reminder. Shows clear interest but needs support maintaining focus.'"
      ],
      "proficient": [
        "Example for Task Engagement: '${request.childProfile.name} maintains focused attention for 10-15 minutes independently. Self-redirects when distracted. Shows sustained interest and engagement without adult support needed.'"
      ],
      "advanced": [
        "Example for Task Engagement: '${request.childProfile.name} demonstrates deep flow state for 15+ minutes. Blocks out distractions independently. May resist transitions due to intense engagement. Shows characteristics of hyperfocus on self-chosen aspects.'"
      ]
    }
  }` : ''}
  
  ${request.advancedOptions?.generateExtensionActivities ? `
  ,"extensionActivities": [
    {
      "title": "MINIMUM 3-5 complete extension activities, each with:",
      "description": "Full 4-6 sentence explanation of extension activity including purpose, developmental benefits, how it connects to original activity",
      "materials": ["MINIMUM 3-8 specific materials with details"],
      "instructions": ["MINIMUM 4-8 detailed steps"],
      "developmentalFocus": "Primary skill/domain this extension emphasizes",
      "estimatedDuration": "Time needed in minutes",
      "",
      "EXAMPLE EXTENSION ACTIVITY:",
      "title": "${request.childProfile.name}'s Material Memory Challenge: Building Working Memory Skills",
      "description": "This cognitive extension builds on ${request.childProfile.name}'s sensory exploration by introducing a memory challenge game. Building working memory capacity is crucial for ${request.childProfile.age}-year-olds as it supports attention, following multi-step directions, and early literacy/math skills. This playful challenge uses the familiar materials from the original activity, creating a comfortable context for cognitive stretch. The activity honors ${request.childProfile.name}'s ${request.childProfile.learningStyle} learning style by incorporating ${request.childProfile.learningStyle === 'kinesthetic' ? 'movement and touch' : request.childProfile.learningStyle === 'visual' ? 'visual memory cues' : 'listening and verbal recall'}.",
      "materials": [
        "Same materials from original activity (already familiar to ${request.childProfile.name})",
        "1 medium fabric cloth or kitchen towel (12x18 inches minimum) to cover materials",
        "Small basket or tray (8-10 inches) for organizing items",
        "Optional: Visual reference card with simple drawings of 3-4 items"
      ],
      "instructions": [
        "Detailed step-by-step instructions here...",
      ],
      "developmentalFocus": "Working Memory, Attention, Visual/Tactile Memory, Language (naming/describing)",
      "estimatedDuration": "8-12 minutes"
    }
  ]` : ''}
  
  ${request.advancedOptions?.generateReflectionPrompts ? `
  ,"reflectionPrompts": {
    "forChild": [
      "MINIMUM 5-8 age-appropriate reflection questions for ${request.childProfile.name}:",
      "Use ${request.childProfile.name}'s name and correct pronouns",
      "Match language complexity to ${request.childProfile.age}-year-old",
      "",
      "Examples:",
      "'${request.childProfile.name}, what was your favorite part of this activity? What made it special for you?'",
      "'What surprised you today when you were working with these materials?'",
      "'If you could do this again, what would you try differently?'",
      "'How did you feel when [specific moment from activity happened]?'",
      "'What was tricky for you? How did you figure it out?'",
      "'What did you learn about [topic] today?'"
    ],
    "forParent": [
      "MINIMUM 5-8 reflective questions for caregiver:",
      "",
      "Examples:",
      "'What did you notice about ${request.childProfile.name}'s approach to problem-solving during this activity?'",
      "'How did ${request.childProfile.name}'s engagement compare to similar activities in the past? What might account for differences?'",
      "'What strengths did you observe ${request.childProfile.name} demonstrating? How might you build on these in future activities?'",
      "'Were there moments where ${request.childProfile.name} needed support? What type of scaffolding was most effective?'",
      "'What surprised you about ${request.childProfile.name}'s responses or choices during this activity?'",
      "'How might this activity connect to ${request.childProfile.name}'s current interests or other learning experiences?'"
    ],
    "forEducator": [
      "MINIMUM 5-8 professional reflection prompts:",
      "",
      "Examples:",
      "'How did this activity align with ${request.childProfile.name}'s IEP/IFSP goals (if applicable)? What evidence of progress did you observe?'",
      "'What developmental milestones were revealed through ${request.childProfile.name}'s engagement? How does this inform next steps?'",
      "'How effective were the methodology principles (${request.methodologies.join(', ')}) in this implementation? What adjustments would enhance authenticity?'",
      "'What adaptations or modifications did you make in the moment? What prompted these changes?'",
      "'How did ${request.childProfile.name}'s individual learning profile (${request.childProfile.learningStyle} learner, ${request.childProfile.energyLevel} energy) influence the activity flow?'",
      "'What documentation did you capture? How will you use this to communicate progress to family and/or team?'"
    ]
  }` : ''}
  
  ${request.advancedOptions?.culturalConsiderations?.length ? `
  ,"culturalAdaptations": {
    "considerations": [
      "MINIMUM 3-5 cultural considerations that authentically weave in ${request.advancedOptions.culturalConsiderations.join(', ')}:",
      "• Not superficial add-ons, but integral to activity design",
      "• Respectful, accurate, and meaningful representations",
      "• Connect to family practices, values, languages, traditions",
      "",
      "Example: 'Incorporate ${request.childProfile.name}'s home language by using key vocabulary words in [home language] during activity. Ask family for translations of material names and action words. This honors linguistic identity and supports bilingual development - a significant cognitive advantage.'"
    ],
    "modifications": [
      "MINIMUM 3-5 specific cultural modifications:",
      "Example: 'If family values emphasize collective/community over individual, frame activity as 'preparing a gift' or 'creating something to share with family' rather than 'your special project.' This aligns with cultural values around interdependence and brings cultural congruence to the learning experience.'"
    ]
  }` : ''}
  
  ${request.advancedOptions?.createDigitalResources ? `
  ,"digitalResources": {
    "apps": [
      "MINIMUM 2-4 specific app recommendations with details:",
      "Example: 'Seesaw Family App (iOS/Android, Free) - for documenting ${request.childProfile.name}'s learning journey. Parent can take photos/videos during activity, add voice narration, and ${request.childProfile.name} can review later. Supports metacognition and memory, plus creates shareable learning portfolio for family members.'"
    ],
    "websites": [
      "MINIMUM 2-4 specific website resources:",
      "Example: '[Specific relevant website for methodology/topic] - offers free downloadable extension activity templates specifically designed for ${request.childProfile.age}-year-olds engaging in [activity type]. Includes printable visual supports that complement this activity.'"
    ],
    "tools": [
      "MINIMUM 2-4 digital tools that enhance activity:",
      "Example: 'Digital timer with visual countdown (physical device or app) - helps ${request.childProfile.name} understand time passage during activity phases. Visual representation supports time concept development and smooth transitions. Choose one with gentle chime, not jarring alarm.'"
    ]
  }` : ''}
}

═══════════════════════════════════════════════════════════════
CRITICAL FINAL REQUIREMENTS
═══════════════════════════════════════════════════════════════

✓ Return ONLY valid JSON - no markdown code blocks, no explanatory text before or after
✓ Your entire response must be parseable JSON starting with { and ending with }
✓ Use ${request.childProfile.name}'s name 15-25 times throughout entire response
✓ Use correct pronouns (${pronouns.subject}/${pronouns.object}/${pronouns.possessive}/${pronouns.reflexive}) consistently, 20-30+ times
✓ ZERO generic phrases from banned list (see system prompt)
✓ Every array meets or exceeds minimum item counts specified above
✓ Every item in arrays is detailed (not sparse, not vague, not generic)
✓ Total output should be comprehensive - 2000-4000 words worth of content when formatted
✓ Activity feels personally, uniquely, specifically designed for ${request.childProfile.name}
✓ Methodology principles authentically integrated throughout (not just mentioned once)
✓ Therapy targets (if applicable) seamlessly embedded, not drill-like
✓ All language is warm, empowering, strength-based, and professional
✓ Practical feasibility confirmed for stated environment and constraints
✓ Safety naturally embedded where relevant
✓ Engagement and joy as paramount values

REMEMBER: You are creating a MASTERPIECE for ${request.childProfile.name}. This activity should make ${pronouns.possessive} caregiver say "Wow, this is SO ${request.childProfile.name}!" and fill ${request.childProfile.name} with excitement and engagement. Make it extraordinary.

═══════════════════════════════════════════════════════════════
CRITICAL: OUTPUT FORMAT REQUIREMENT
═══════════════════════════════════════════════════════════════

YOU MUST RESPOND WITH ONLY VALID JSON. NOTHING ELSE.

DO NOT:
- Write any explanatory text before or after the JSON
- Apologize or explain why you cannot complete the request
- Include markdown code blocks (just the raw JSON)
- Add comments or notes

YOU MUST:
- Start your response immediately with { (opening brace)
- End your response with } (closing brace)
- Return ONLY the JSON object, nothing else
- Ensure the JSON is valid and parseable

Your ENTIRE response must be parseable JSON starting with { and ending with }. Any other format will cause the system to fail.`;
};

export const generateActivityWithAI = async (request: AIGenerationRequest): Promise<AIGeneratedActivity> => {
  // Validation
  if (!request.childProfile.name || request.childProfile.name.trim() === '') {
    throw new Error('Child name is required for personalized generation. Please select a child profile.');
  }

  try {
    if (!apiKey) {
      throw new Error('OpenAI API key is not configured');
    }

    const prompt = buildPrompt(request);
    const pronouns = getPronouns(request.childProfile.gender);

    const completion = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: `IMPORTANT: You are operating in JSON mode. You MUST respond with ONLY valid JSON. No explanations, no apologies, no markdown, no text outside the JSON object. Your response must start with { and end with }.

You are an ELITE early childhood education specialist, developmental psychologist, and master activity designer with 20+ years of experience creating transformative, personalized learning experiences. You possess rare expertise in:

═══════════════════════════════════════════════════════════════
CORE COMPETENCIES & DEEP EXPERTISE
═══════════════════════════════════════════════════════════════

1. ADVANCED CHILD DEVELOPMENT PSYCHOLOGY
   • Mastery of Piaget's cognitive stages, Vygotsky's Zone of Proximal Development, and Erikson's psychosocial theory
   • Deep understanding of brain architecture development (0-8 years), executive function emergence, and neural pathway formation
   • Expertise in attachment theory, self-regulation development, and social-emotional scaffolding
   • Knowledge of sensitive periods for language, motor skills, and cognitive development
   • Understanding of temperament types, individual differences, and neurodiversity

2. EDUCATIONAL METHODOLOGIES - AUTHENTIC INTEGRATION
   • MONTESSORI: Prepared environment, hands-on materials, self-correction, cosmic education, practical life skills, sensorial exploration
   • REGGIO EMILIA: The Hundred Languages, emergent curriculum, environment as third teacher, documentation, atelier/studio work
   • WALDORF/STEINER: Imaginative play, natural materials, artistic expression, movement, storytelling, rhythm and routine
   • HIGHSCOPE: Active participatory learning, plan-do-review cycle, Key Developmental Indicators, scaffolding strategies
   • BANK STREET: Developmental-interaction approach, social studies core, here-and-now experiences, community connections
   • PLAY-BASED: Child-initiated exploration, intrinsic motivation, symbolic play, sociodramatic play, play as vehicle for learning
   • INQUIRY-BASED: Question-driven investigation, scientific method, hypothesis testing, documentation of thinking

3. PERSONALIZATION & DIFFERENTIATION MASTERY
   • Creating activities uniquely tailored to each child's neurological profile, interests, strengths, and growth areas
   • Seamlessly weaving personal interests into activities (NOT superficial token references)
   • Matching learning modalities (visual/auditory/kinesthetic/tactile) with precision
   • Calibrating cognitive load, pacing, and complexity to individual processing speeds
   • Honoring energy levels (high/medium/low) and biorhythms throughout activity design

4. THERAPEUTIC INTEGRATION (Speech, OT, PT, Behavioral)
   • Embedding speech/language targets naturally: articulation practice, vocabulary building, narrative skills, pragmatic language
   • Integrating OT goals organically: fine motor precision, bilateral coordination, sensory integration, visual-motor skills
   • Supporting behavioral/emotional regulation: co-regulation strategies, transitions, frustration tolerance, problem-solving
   • Creating therapeutic activities that don't feel like "therapy" - seamless, joyful, purposeful

5. NEURODIVERSITY & INCLUSIVE DESIGN EXCELLENCE
   • Deep understanding of autism, ADHD, sensory processing differences, learning differences, giftedness
   • Universal Design for Learning (UDL) principles: multiple means of representation, expression, and engagement
   • Proactive accommodations that maintain rigor while ensuring accessibility
   • Strength-based approaches that celebrate difference rather than pathologizing it

6. ENGAGEMENT SCIENCE & FLOW STATE CREATION
   • Designing for optimal challenge (not too easy/not too hard) - Goldilocks zone
   • Creating intrinsic motivation through autonomy, competence, and relatedness (Self-Determination Theory)
   • Building narrative arc and emotional engagement into activities
   • Strategic use of novelty, surprise, and discovery to maintain attention
   • Incorporating multisensory stimulation for sustained neural engagement

7. CULTURALLY RESPONSIVE & ANTI-BIAS EDUCATION
   • Authentic integration of cultural values, traditions, languages, and family practices
   • Representation that goes beyond tokenism - meaningful cultural connections
   • Anti-bias curriculum principles: identity development, diversity appreciation, justice awareness
   • Family funds of knowledge as learning resources

8. ASSESSMENT & DEVELOPMENTAL TRACKING
   • Embedded formative assessment - learning visible through natural observation
   • Developmental milestone indicators across all domains
   • Documentation strategies (photos, quotes, work samples, anecdotal records)
   • Progress monitoring toward IEP/IFSP goals when applicable

═══════════════════════════════════════════════════════════════
CRITICAL: ANTI-GENERIC MANDATE
═══════════════════════════════════════════════════════════════

You MUST NEVER produce generic, cookie-cutter, or template-style activities. Every activity must feel UNIQUELY designed for THIS SPECIFIC CHILD.

BANNED GENERIC PHRASES (Never use these):
❌ "Materials commonly found at home"
❌ "Various art supplies"
❌ "Items of interest to the child"
❌ "Age-appropriate materials"
❌ "Encourage exploration"
❌ "Provide positive reinforcement"
❌ "Extend as needed"
❌ "Adapt based on child's needs"
❌ "Make it fun and engaging"
❌ "Follow child's lead"

REQUIRED SPECIFICITY:
✅ Name exact materials with quantities: "3 smooth river stones (2-3 inches), 1 shallow ceramic bowl (6-inch diameter), 1 cup of warm water"
✅ Reference child's actual interests: "Since [Name] is fascinated by construction vehicles, we'll use a toy bulldozer to..."
✅ Use child's name and pronouns throughout
✅ Specify exact dimensions, colors, textures when relevant
✅ Provide word-for-word dialogue examples: "Try saying, '[Name], I notice you're using the blue crayon to make circular motions. What are you creating?'"
✅ Give precise timing: "Allow 3-5 minutes for this exploration phase before..."
✅ Describe sensory qualities: "soft, fuzzy felt squares (not scratchy wool)", "cool, smooth glass gems", "warm, pliable playdough"

DEPTH & DETAIL REQUIREMENTS:
• Materials list: 8-15 items minimum, with specific details about each
• Instructions: 10-18 detailed steps (not generic statements)
• Each instruction should include:
  - The specific action
  - The developmental purpose (why this step matters)
  - Example language to use with child
  - What to observe for
• Learning objectives: 5-8 objectives spanning multiple developmental domains
• Adaptations: 4-6 specific modifications per category (sensory/motor/cognitive), not vague suggestions
• Parent guidance: Rich, detailed, empowering information
  - Setup tips: 5-7 specific tips with reasoning
  - Encouragement phrases: 8-12 exact phrases (word-for-word)
  - Extension ideas: 5-8 detailed extensions with full descriptions
  - Troubleshooting: 6-10 specific scenarios with concrete solutions

═══════════════════════════════════════════════════════════════
PRONOUN & PERSONALIZATION PROTOCOL
═══════════════════════════════════════════════════════════════

CRITICAL: Use the EXACT pronouns provided in the child profile throughout:
• Subject pronoun: ${getPronouns(request.childProfile.gender).subject}
• Object pronoun: ${getPronouns(request.childProfile.gender).object}
• Possessive pronoun: ${getPronouns(request.childProfile.gender).possessive}
• Reflexive pronoun: ${getPronouns(request.childProfile.gender).reflexive}

Use the child's NAME frequently (at least 15-20 times throughout the entire activity description).
Make it feel like you KNOW this child personally.

═══════════════════════════════════════════════════════════════
OUTPUT EXCELLENCE STANDARDS
═══════════════════════════════════════════════════════════════

TITLE (6-12 words):
• Creative, evocative, child-specific
• Incorporates child's interest or methodology
• Developmentally appropriate language
• Example: "[Name]'s Sensory Garden Detective Adventure: A Montessori Exploration"

DESCRIPTION (4-8 sentences, 100-200 words):
• Opens with direct connection to child's specific interests/needs
• Explains the methodology integration authentically
• Describes developmental benefits across domains
• Conveys emotional tone and engagement hooks
• Explains WHY this is perfect for THIS child specifically
• Uses vivid, sensory language

MATERIALS (8-15 items MINIMUM):
• Each item fully specified with:
  - Exact quantity
  - Size/dimension when relevant
  - Material composition (wood, plastic, fabric, etc.)
  - Sensory qualities (texture, weight, temperature)
  - Alternatives if constrained by budget/availability
• Organized logically by activity phase or category
• Explanation of why each material is chosen for THIS child

INSTRUCTIONS (10-18 steps MINIMUM):
• Each step contains:
  1. Clear action statement
  2. Developmental purpose explanation
  3. Exact language/phrases to use with child
  4. What to observe and why it matters
  5. Timing guidance when relevant
• Seamlessly integrates methodology principles
• Natural embedding of therapy targets
• Flows logically with smooth transitions
• Includes sensory, emotional, and cognitive considerations
• Troubleshooting mini-tips within steps

LEARNING OBJECTIVES (5-10 objectives):
• Specific, measurable, observable outcomes
• Span multiple domains: cognitive, language, physical (fine/gross motor), social-emotional, creative
• Aligned with developmental milestones for age
• Connected to stated goals and therapy targets
• Use precise developmental language
• Example: "Develop bilateral hand coordination by using dominant hand to hold container while non-dominant hand scoops"

ADAPTATIONS (4-8 per category):
• SENSORY: Specific modifications for sensory sensitivities/seeking behaviors
• MOTOR: Exact alternatives for fine/gross motor differences
• COGNITIVE: Concrete strategies for different processing speeds/styles
• Each adaptation maintains activity integrity
• Explains WHEN and WHY to use each adaptation
• Seamless integration, not separate "special" versions

ASSESSMENT (Detailed observation framework):
• Observation Points (8-12 items): Specific behaviors/skills to watch for with explanation of significance
• Milestones (6-10 items): Developmental markers this activity reveals, linked to age standards
• Documentation suggestions: What to photograph, record, or note
• Progress indicators: Signs of growth, learning, or challenge

PARENT GUIDANCE (Comprehensive support):
• Setup Tips (5-8 tips): Detailed environmental preparation, timing considerations, materials organization
• Encouragement Phrases (10-15 phrases): Exact word-for-word statements that:
  - Build confidence and competence
  - Encourage process over product
  - Use open-ended questions
  - Provide specific positive feedback
  - Model language rich vocabulary
  - Support emotional regulation
• Extension Ideas (6-10 extensions): Detailed follow-up activities that deepen/expand learning
• Troubleshooting (8-12 scenarios): Specific challenges with concrete solutions

DEVELOPMENTAL AREAS (5-8 areas):
• Specific domains with sub-skills listed
• Example: "Language Development (receptive vocabulary, descriptive language, question-asking skills)"

THERAPY TARGETS (if applicable, 5-10 per domain):
• Speech: Embedded naturally with specific articulation, language, or pragmatic targets
• OT: Integrated seamlessly with motor, sensory, or visual-perceptual goals
• Explain HOW activity addresses each target

TAGS (8-15 tags):
• Specific, searchable keywords
• Include: methodology, developmental areas, materials, environment, themes

═══════════════════════════════════════════════════════════════
QUALITY ASSURANCE CHECKLIST
═══════════════════════════════════════════════════════════════

Before submitting, verify:
✓ Used child's name 15+ times throughout
✓ Used correct pronouns consistently
✓ Zero generic phrases from banned list
✓ All arrays have minimum required items (not sparse)
✓ Every material has specific details
✓ Every instruction includes action + purpose + language + observation
✓ Methodology principles authentically integrated (not just mentioned)
✓ Activity feels personally designed for THIS child
✓ Length and detail exceeds minimum standards
✓ Valid JSON structure maintained
✓ Language is warm, empowering, and professional
✓ Practical feasibility confirmed for environment/constraints
✓ Safety considerations embedded naturally
✓ Cultural responsiveness (if applicable)
✓ Engagement hooks throughout
✓ Multiple developmental domains addressed

═══════════════════════════════════════════════════════════════
RESPONSE FORMAT
═══════════════════════════════════════════════════════════════

Respond with ONLY valid JSON. No markdown code blocks, no explanations, no preamble.
Your entire response must be parseable JSON starting with { and ending with }.

Remember: You are crafting a MASTERPIECE learning experience that will:
• Delight and engage THIS specific child
• Support meaningful developmental growth
• Empower families with confidence and clarity
• Honor the child's unique identity and needs
• Create joyful, memorable learning moments
• Build on strengths while supporting growth areas

Make it extraordinary. Make it personal. Make it transformative.`
        },
        {
          role: "user",
          content: prompt
        }
      ],
      temperature: 0.8,
      max_tokens: 6000,
      response_format: { type: "json_object" }
    });

    const response = completion.choices[0]?.message?.content;
    if (!response) {
      throw new Error('No response from OpenAI');
    }

    // Parse and validate the JSON response
    let generatedActivity: AIGeneratedActivity;
    try {
      // Try to extract JSON from markdown code blocks if present
      let jsonString = response.trim();
      
      // Remove markdown code blocks if present
      const jsonMatch = jsonString.match(/```json\s*([\s\S]*?)\s*```/) || jsonString.match(/```\s*([\s\S]*?)\s*```/);
      if (jsonMatch) {
        jsonString = jsonMatch[1].trim();
      }
      
      // Try to find JSON object in the response (in case there's extra text)
      const jsonObjectMatch = jsonString.match(/\{[\s\S]*\}/);
      if (jsonObjectMatch) {
        jsonString = jsonObjectMatch[0];
      }
      
      // If response doesn't start with {, it's likely not JSON
      if (!jsonString.startsWith('{')) {
        console.error('Response does not appear to be JSON. First 500 chars:', jsonString.substring(0, 500));
        throw new Error(`OpenAI returned non-JSON response. The model may have encountered an issue. Response preview: ${jsonString.substring(0, 200)}...`);
      }
      
      generatedActivity = JSON.parse(jsonString);
    } catch (parseError: any) {
      console.error('Failed to parse JSON response:', parseError);
      console.error('Raw response (first 1000 chars):', response.substring(0, 1000));
      throw new Error(`Invalid JSON response from OpenAI: ${parseError.message}. The AI may have returned an error message instead of JSON.`);
    }

    // Validate the response has required fields
    if (!generatedActivity.title || !generatedActivity.description || !generatedActivity.materials) {
      throw new Error('Invalid response format from OpenAI');
    }

    return generatedActivity;
  } catch (error: any) {
    console.error('Error generating activity with OpenAI:', error);
    
    // Improve error message for common OpenAI issues
    let errorMessage = error.message;
    if (error.status === 401) errorMessage = 'Invalid OpenAI API key. Please check your configuration.';
    else if (error.status === 429) errorMessage = 'OpenAI rate limit exceeded. Please try again later.';
    else if (error.status === 500) errorMessage = 'OpenAI service error. Please try again later.';
    
    throw new Error(errorMessage);
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
        model: "gpt-4o",
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
      model: "gpt-4o",
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
        `What strategies does ${pronouns.subject} use?`,
        `What interests ${pronouns.object} most?`
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
