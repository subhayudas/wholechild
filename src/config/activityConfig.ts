// Centralized configuration for activity-related options
// This can be moved to a database table later if needed

import { 
  Heart, Palette, Music, Zap, Users, Gamepad2, BookOpen, 
  Calculator, TreePine, Utensils, Target, Camera, Brain, Home, Globe 
} from 'lucide-react';

export const activityTypes = [
  { id: 'sensory-play', name: 'Sensory Play', icon: Heart, color: 'from-pink-500 to-rose-500', description: 'Tactile and sensory exploration' },
  { id: 'art-craft', name: 'Art & Craft', icon: Palette, color: 'from-purple-500 to-indigo-500', description: 'Creative expression and fine motor' },
  { id: 'music-movement', name: 'Music & Movement', icon: Music, color: 'from-blue-500 to-cyan-500', description: 'Rhythm, dance, and gross motor' },
  { id: 'science-experiment', name: 'Science Experiment', icon: Zap, color: 'from-yellow-500 to-orange-500', description: 'Discovery and investigation' },
  { id: 'dramatic-play', name: 'Dramatic Play', icon: Users, color: 'from-green-500 to-emerald-500', description: 'Role-playing and social skills' },
  { id: 'building-construction', name: 'Building & Construction', icon: Gamepad2, color: 'from-gray-500 to-slate-500', description: 'Spatial and engineering skills' },
  { id: 'literacy-language', name: 'Literacy & Language', icon: BookOpen, color: 'from-indigo-500 to-blue-500', description: 'Reading, writing, and communication' },
  { id: 'math-logic', name: 'Math & Logic', icon: Calculator, color: 'from-teal-500 to-cyan-500', description: 'Numbers, patterns, and problem-solving' },
  { id: 'nature-outdoor', name: 'Nature & Outdoor', icon: TreePine, color: 'from-green-600 to-emerald-600', description: 'Environmental exploration' },
  { id: 'cooking-nutrition', name: 'Cooking & Nutrition', icon: Utensils, color: 'from-orange-500 to-red-500', description: 'Life skills and healthy habits' }
];

export const categories = [
  'Math & Logic', 
  'Language & Literacy', 
  'Science & Nature', 
  'Art & Creativity',
  'Music & Movement', 
  'Social Skills', 
  'Life Skills', 
  'Sensory Play'
];

export const methodologies = [
  { id: 'montessori', name: 'Montessori', value: 'montessori', label: 'Montessori', description: 'Self-directed learning with structured materials', icon: Target, color: 'blue' },
  { id: 'reggio', name: 'Reggio Emilia', value: 'reggio', label: 'Reggio Emilia', description: 'Project-based exploration and documentation', icon: Camera, color: 'green' },
  { id: 'waldorf', name: 'Waldorf', value: 'waldorf', label: 'Waldorf', description: 'Artistic expression and natural rhythms', icon: Music, color: 'purple' },
  { id: 'highscope', name: 'HighScope', value: 'highscope', label: 'HighScope', description: 'Plan-do-review active learning sequence', icon: Brain, color: 'orange' },
  { id: 'bankstreet', name: 'Bank Street', value: 'bankstreet', label: 'Bank Street', description: 'Social-emotional development focus', icon: Users, color: 'pink' },
  { id: 'play-based', name: 'Play-Based', value: 'play-based', label: 'Play-Based', description: 'Learning through structured play' },
  { id: 'inquiry-based', name: 'Inquiry-Based', value: 'inquiry-based', label: 'Inquiry-Based', description: 'Question-driven exploration' }
];

export const environments = [
  { id: 'indoor', name: 'Indoor', icon: Home },
  { id: 'outdoor', name: 'Outdoor', icon: TreePine },
  { id: 'both', name: 'Both', icon: Globe }
];

export const materialConstraints = [
  'Household items only', 
  'Under $10 budget', 
  'No small parts (choking hazard)',
  'Washable materials', 
  'Natural materials preferred', 
  'Minimal cleanup required',
  'Reusable materials', 
  'No electronics needed'
];

export const developmentalAreas = [
  'Cognitive',
  'Language',
  'Physical',
  'Social',
  'Creative',
  'Emotional',
  'Cultural Understanding'
];

export const shareOptions = [
  'Family Members',
  'Teachers',
  'Therapists',
  'Grandparents',
  'Care Team',
  'Portfolio'
];

export const interestOptions = [
  'Art & Drawing', 
  'Music & Singing', 
  'Building & Construction', 
  'Nature & Animals',
  'Books & Stories', 
  'Puzzles & Games', 
  'Sports & Movement', 
  'Science & Experiments',
  'Cooking & Baking', 
  'Dancing', 
  'Technology', 
  'Dramatic Play'
];

export const sensoryNeedsOptions = [
  'Movement breaks', 
  'Quiet spaces', 
  'Tactile input', 
  'Deep pressure',
  'Visual supports', 
  'Noise reduction', 
  'Fidget tools', 
  'Weighted items',
  'Sensory bins', 
  'Calming music', 
  'Bright lighting', 
  'Dim lighting'
];

// Reward system configuration
export const badgeDefinitions = [
  {
    id: 'first-steps',
    name: 'First Steps',
    description: 'Complete your first activity!',
    requirement: 1,
    requirementType: 'activities'
  },
  {
    id: 'rainbow-badge',
    name: 'Rainbow Explorer',
    description: 'Learn about colors!',
    requirement: 50,
    requirementType: 'points'
  },
  {
    id: 'star-collector',
    name: 'Star Collector',
    description: 'Collect 100 learning stars!',
    requirement: 100,
    requirementType: 'points'
  },
  {
    id: 'super-learner',
    name: 'Super Learner',
    description: 'Reach 200 learning stars!',
    requirement: 200,
    requirementType: 'points'
  },
  {
    id: 'streak-master',
    name: 'Streak Master',
    description: 'Learn for 7 days in a row!',
    requirement: 7,
    requirementType: 'streak'
  },
  {
    id: 'creative-genius',
    name: 'Creative Genius',
    description: 'Complete 5 art activities!',
    requirement: 5,
    requirementType: 'category_activities',
    category: 'Art & Creativity'
  },
  {
    id: 'music-maestro',
    name: 'Music Maestro',
    description: 'Complete 5 music activities!',
    requirement: 5,
    requirementType: 'category_activities',
    category: 'Music & Movement'
  },
  {
    id: 'night-owl',
    name: 'Night Owl',
    description: 'Complete an evening activity!',
    requirement: 1,
    requirementType: 'time_based'
  }
];

export const rewardDefinitions = [
  {
    id: 'unicorn-avatar',
    name: 'Unicorn Avatar',
    description: 'A magical unicorn for your profile!',
    cost: 100
  },
  {
    id: 'rainbow-theme',
    name: 'Rainbow Theme',
    description: 'Make everything colorful!',
    cost: 150
  },
  {
    id: 'star-trail',
    name: 'Star Trail Effect',
    description: 'Leave sparkles wherever you go!',
    cost: 200
  },
  {
    id: 'pet-dragon',
    name: 'Pet Dragon',
    description: 'A friendly dragon companion!',
    cost: 300
  }
];

