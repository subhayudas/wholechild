import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Wand2, 
  Sparkles, 
  Save, 
  Download, 
  Share2, 
  RefreshCw, 
  Settings, 
  User, 
  Brain, 
  Heart, 
  Target, 
  Clock, 
  Star, 
  CheckCircle, 
  AlertCircle, 
  Loader2,
  Plus,
  X,
  Eye,
  Play,
  ArrowRight,
  ArrowLeft,
  Lightbulb,
  Palette,
  Music,
  Users,
  Camera,
  BookOpen,
  Zap,
  Home,
  School,
  TreePine,
  Gamepad2,
  Scissors,
  PaintBucket,
  Volume2,
  Calculator,
  Globe,
  Utensils,
  Baby,
  Hand,
  Sliders,
  Layers,
  FileText,
  Calendar,
  Leaf,
  Sun,
  Snowflake,
  Umbrella,
  Gift,
  Flag,
  Languages,
  Laptop,
  Smartphone,
  Tablet,
  Printer,
  Gauge,
  Milestone,
  Microscope,
  Ruler,
  Puzzle,
  Shapes,
  Stethoscope,
  Dumbbell,
  Pencil,
  Brush,
  Headphones,
  Mic,
  Video,
  MessageCircle,
  Copy,
  Code,
  Maximize2,
  Minimize2,
  ChevronDown,
  ChevronUp,
  BarChart,
  PieChart,
  Clipboard,
  Trash2
} from 'lucide-react';
import { useChildStore } from '../store/childStore';
import { useActivityStore } from '../store/activityStore';
import { generateActivityWithAI, AIGenerationRequest, AIGeneratedActivity, testOpenAIConnection } from '../services/openaiService';
import toast from 'react-hot-toast';

const AIProGenerator = () => {
  const { children, activeChild } = useChildStore();
  const { addActivity } = useActivityStore();
  
  const [currentStep, setCurrentStep] = useState(0);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedActivity, setGeneratedActivity] = useState<AIGeneratedActivity | null>(null);
  const [saved, setSaved] = useState(false);
  const [openAIConnected, setOpenAIConnected] = useState<boolean | null>(null);
  const [isChildAgnostic, setIsChildAgnostic] = useState(false);
  const [showAdvancedOptions, setShowAdvancedOptions] = useState(false);
  const [expandedSection, setExpandedSection] = useState<string | null>(null);
  const [isFullscreen, setIsFullscreen] = useState(false);
  
  const [formData, setFormData] = useState<Partial<AIGenerationRequest>>({
    childProfile: activeChild ? {
      name: activeChild.name,
      age: activeChild.age,
      interests: activeChild.interests,
      learningStyle: activeChild.preferences.learningStyle,
      energyLevel: activeChild.preferences.energyLevel,
      socialPreference: activeChild.preferences.socialPreference,
      sensoryNeeds: activeChild.sensoryNeeds,
      speechGoals: activeChild.speechGoals,
      otGoals: activeChild.otGoals,
      developmentalAreas: []
    } : {
      name: '',
      age: 4,
      interests: [],
      learningStyle: 'mixed',
      energyLevel: 'medium',
      socialPreference: 'small-group',
      sensoryNeeds: [],
      speechGoals: [],
      otGoals: [],
      developmentalAreas: []
    },
    activityType: '',
    category: '',
    methodologies: [],
    duration: 30,
    environment: 'indoor',
    materialConstraints: [],
    learningObjectives: [],
    therapyTargets: {
      speech: [],
      ot: []
    },
    adaptationNeeds: [],
    advancedOptions: {
      includeMultimedia: false,
      generateAssessmentRubric: false,
      includeParentNewsletter: false,
      generateExtensionActivities: false,
      createDigitalResources: false,
      includeProgressTracking: false,
      generateReflectionPrompts: false,
      createAdaptationGuide: false,
      culturalConsiderations: [],
      languageSupport: [],
      seasonalThemes: [],
      technologyIntegration: 'none',
      assessmentType: 'observational',
      budgetRange: 'low'
    }
  });

  // Refs for scrolling
  const resultRef = useRef<HTMLDivElement>(null);

  // Test OpenAI connection on component mount
  useEffect(() => {
    const checkConnection = async () => {
      const connected = await testOpenAIConnection();
      setOpenAIConnected(connected);
      if (!connected) {
        toast.error('OpenAI connection not available. Using fallback generation.');
      }
    };
    checkConnection();
  }, []);

  const steps = [
    { title: 'Child Profile', icon: User },
    { title: 'Activity Type', icon: Gamepad2 },
    { title: 'Learning Goals', icon: Target },
    { title: 'Environment & Materials', icon: Home },
    { title: 'Therapy Integration', icon: Stethoscope },
    { title: 'Cultural & Seasonal', icon: Globe },
    { title: 'Advanced Options', icon: Settings },
    { title: 'Generate & Review', icon: Sparkles }
  ];

  const activityTypes = [
    { id: 'sensory-play', name: 'Sensory Play', icon: Heart, description: 'Tactile and sensory exploration' },
    { id: 'art-craft', name: 'Art & Craft', icon: Palette, description: 'Creative expression and fine motor' },
    { id: 'music-movement', name: 'Music & Movement', icon: Music, description: 'Rhythm, dance, and gross motor' },
    { id: 'science-experiment', name: 'Science Experiment', icon: Zap, description: 'Discovery and investigation' },
    { id: 'dramatic-play', name: 'Dramatic Play', icon: Users, description: 'Role-playing and social skills' },
    { id: 'building-construction', name: 'Building & Construction', icon: Gamepad2, description: 'Spatial and engineering skills' },
    { id: 'literacy-language', name: 'Literacy & Language', icon: BookOpen, description: 'Reading, writing, and communication' },
    { id: 'math-logic', name: 'Math & Logic', icon: Calculator, description: 'Numbers, patterns, and problem-solving' },
    { id: 'nature-outdoor', name: 'Nature & Outdoor', icon: TreePine, description: 'Environmental exploration' },
    { id: 'cooking-nutrition', name: 'Cooking & Nutrition', icon: Utensils, description: 'Life skills and healthy habits' },
    { id: 'fine-motor', name: 'Fine Motor', icon: Hand, description: 'Precision and dexterity development' },
    { id: 'gross-motor', name: 'Gross Motor', icon: Dumbbell, description: 'Large movement and coordination' }
  ];

  const categories = [
    'Math & Logic', 'Language & Literacy', 'Science & Nature', 'Art & Creativity',
    'Music & Movement', 'Social Skills', 'Life Skills', 'Sensory Play',
    'Physical Development', 'Emotional Regulation', 'Cognitive Skills', 'Problem Solving'
  ];

  const methodologies = [
    { id: 'montessori', name: 'Montessori', description: 'Self-directed learning with structured materials' },
    { id: 'reggio', name: 'Reggio Emilia', description: 'Project-based exploration and documentation' },
    { id: 'waldorf', name: 'Waldorf', description: 'Artistic expression and natural rhythms' },
    { id: 'highscope', name: 'HighScope', description: 'Plan-do-review active learning sequence' },
    { id: 'bankstreet', name: 'Bank Street', description: 'Social-emotional development focus' },
    { id: 'play-based', name: 'Play-Based', description: 'Learning through structured play' },
    { id: 'inquiry-based', name: 'Inquiry-Based', description: 'Question-driven exploration' },
    { id: 'project-based', name: 'Project-Based', description: 'Extended investigation and creation' },
    { id: 'steam', name: 'STEAM', description: 'Science, Technology, Engineering, Arts, Math integration' }
  ];

  const environments = [
    { id: 'indoor', name: 'Indoor', icon: Home },
    { id: 'outdoor', name: 'Outdoor', icon: TreePine },
    { id: 'both', name: 'Both Indoor & Outdoor', icon: Globe },
    { id: 'classroom', name: 'Classroom', icon: School },
    { id: 'water', name: 'Water-based', icon: Umbrella }
  ];

  const materialConstraints = [
    'Household items only', 'Under $10 budget', 'No small parts (choking hazard)',
    'Washable materials', 'Natural materials preferred', 'Minimal cleanup required',
    'Reusable materials', 'No electronics needed', 'Eco-friendly materials',
    'Quiet materials', 'Non-toxic', 'Allergy-friendly (no common allergens)'
  ];

  const developmentalAreas = [
    'Cognitive Development', 'Language & Communication', 'Physical Development',
    'Social-Emotional', 'Creative Expression', 'Mathematical Thinking',
    'Scientific Inquiry', 'Cultural Understanding', 'Executive Function',
    'Self-Regulation', 'Literacy', 'Spatial Awareness'
  ];

  const speechTherapyTargets = [
    'Articulation', 'Phonological Awareness', 'Expressive Language',
    'Receptive Language', 'Pragmatic/Social Language', 'Fluency',
    'Voice Quality', 'Oral Motor Skills', 'Auditory Processing',
    'Narrative Skills', 'Vocabulary Development', 'Following Directions'
  ];

  const otTherapyTargets = [
    'Fine Motor', 'Gross Motor', 'Visual Motor', 'Visual Perception',
    'Sensory Processing', 'Bilateral Coordination', 'Motor Planning',
    'Self-Care Skills', 'Handwriting', 'Postural Control',
    'Strength & Endurance', 'Proprioception'
  ];

  const culturalConsiderations = [
    'Multicultural Perspectives', 'Diverse Family Structures', 'Gender Inclusivity',
    'Neurodiversity Celebration', 'Global Awareness', 'Indigenous Knowledge',
    'Multilingual Support', 'Disability Representation', 'Religious Sensitivity',
    'Socioeconomic Awareness'
  ];

  const seasonalThemes = [
    'Spring Growth', 'Summer Adventure', 'Fall Harvest', 'Winter Wonder',
    'Holidays & Celebrations', 'Weather Changes', 'Animal Migrations',
    'Plant Life Cycles', 'Seasonal Foods', 'Cultural Festivals'
  ];

  const languageSupports = [
    'Spanish', 'French', 'Mandarin', 'Arabic', 'Hindi',
    'ASL (American Sign Language)', 'Visual Supports', 'Simplified Language',
    'Key Vocabulary Focus', 'Bilingual Materials'
  ];

  const updateFormData = (key: string, value: any) => {
    setFormData(prev => ({ ...prev, [key]: value }));
  };

  const updateNestedData = (section: string, key: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [section]: { ...prev[section as keyof typeof prev], [key]: value }
    }));
  };

  const toggleArrayItem = (key: string, item: string) => {
    const currentArray = formData[key as keyof typeof formData] as string[] || [];
    const newArray = currentArray.includes(item)
      ? currentArray.filter(i => i !== item)
      : [...currentArray, item];
    updateFormData(key, newArray);
  };

  const toggleNestedArrayItem = (section: string, key: string, item: string) => {
    const currentArray = formData[section as keyof typeof formData]?.[key as any] as string[] || [];
    const newArray = currentArray.includes(item)
      ? currentArray.filter(i => i !== item)
      : [...currentArray, item];
    updateNestedData(section, key, newArray);
  };

  const handleGenerate = async () => {
    if (!isChildAgnostic && !formData.childProfile?.name) {
      toast.error('Please select a child or enable child-agnostic mode');
      return;
    }

    if (!formData.activityType || !formData.category) {
      toast.error('Please complete all required fields');
      return;
    }

    setIsGenerating(true);
    setSaved(false);

    try {
      // Create a request object, handling child-agnostic mode
      const request: AIGenerationRequest = {
        childProfile: isChildAgnostic 
          ? {
              name: 'Child',
              age: formData.childProfile?.age || 4,
              interests: formData.childProfile?.interests || [],
              learningStyle: formData.childProfile?.learningStyle || 'mixed',
              energyLevel: formData.childProfile?.energyLevel || 'medium',
              socialPreference: formData.childProfile?.socialPreference || 'small-group',
              sensoryNeeds: formData.childProfile?.sensoryNeeds || [],
              speechGoals: formData.childProfile?.speechGoals || [],
              otGoals: formData.childProfile?.otGoals || [],
              developmentalAreas: formData.childProfile?.developmentalAreas || []
            }
          : formData.childProfile as AIGenerationRequest['childProfile'],
        activityType: formData.activityType!,
        category: formData.category!,
        methodologies: formData.methodologies || [],
        duration: formData.duration || 30,
        environment: formData.environment || 'indoor',
        materialConstraints: formData.materialConstraints || [],
        learningObjectives: formData.learningObjectives || [],
        therapyTargets: formData.therapyTargets || { speech: [], ot: [] },
        adaptationNeeds: formData.adaptationNeeds || [],
        advancedOptions: formData.advancedOptions
      };

      const activity = await generateActivityWithAI(request);
      setGeneratedActivity(activity);
      toast.success('Activity generated successfully!');
      
      // Scroll to results after a short delay
      setTimeout(() => {
        resultRef.current?.scrollIntoView({ behavior: 'smooth' });
      }, 500);
    } catch (error) {
      console.error('Generation error:', error);
      toast.error('Failed to generate activity. Please try again.');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSaveToLibrary = () => {
    if (!generatedActivity) return;

    // Add AI-generated tag and metadata
    const activityToSave = {
      title: generatedActivity.title,
      description: generatedActivity.description,
      methodologies: formData.methodologies as any || [],
      ageRange: [formData.childProfile?.age || 3, (formData.childProfile?.age || 3) + 1] as [number, number],
      duration: formData.duration || 30,
      materials: generatedActivity.materials,
      instructions: generatedActivity.instructions,
      learningObjectives: generatedActivity.learningObjectives,
      developmentalAreas: generatedActivity.developmentalAreas || [],
      speechTargets: generatedActivity.speechTargets || [],
      otTargets: generatedActivity.otTargets || [],
      difficulty: 2 as const,
      category: formData.category || 'General',
      tags: [...(generatedActivity.tags || []), 'ai-generated', 'ai-pro'],
      media: { images: [], videos: [], audio: [] },
      createdBy: 'AI Pro Generator',
      rating: 0,
      reviews: 0,
      price: 0,
      adaptations: generatedActivity.adaptations || {
        sensory: [],
        motor: [],
        cognitive: []
      },
      assessment: generatedActivity.assessment || {
        observationPoints: [],
        milestones: []
      },
      parentGuidance: generatedActivity.parentGuidance || {
        setupTips: [],
        encouragementPhrases: [],
        extensionIdeas: [],
        troubleshooting: []
      }
    };

    addActivity(activityToSave);
    setSaved(true);
    toast.success('Activity saved to your library! 🎉');
  };

  const toggleExpandSection = (section: string) => {
    if (expandedSection === section) {
      setExpandedSection(null);
    } else {
      setExpandedSection(section);
    }
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 0:
        return (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Child Information</h3>
              
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="child-agnostic"
                    checked={isChildAgnostic}
                    onChange={(e) => setIsChildAgnostic(e.target.checked)}
                    className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                  />
                  <label htmlFor="child-agnostic" className="text-sm font-medium text-gray-700">
                    Child-agnostic mode (create activities for any child)
                  </label>
                </div>
                
                {!isChildAgnostic && !activeChild && (
                  <button
                    onClick={() => window.location.href = '/child-profile'}
                    className="text-sm text-indigo-600 hover:text-indigo-700 font-medium"
                  >
                    Create Child Profile
                  </button>
                )}
              </div>
              
              {!isChildAgnostic && activeChild ? (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
                  <div className="flex items-center gap-3">
                    {activeChild.avatar && (
                      <img src={activeChild.avatar} alt={activeChild.name} className="w-12 h-12 rounded-full" />
                    )}
                    <div>
                      <h4 className="font-semibold text-blue-900">{activeChild.name}</h4>
                      <p className="text-blue-700">{activeChild.age} years old • {activeChild.preferences.learningStyle} learner</p>
                    </div>
                  </div>
                  <p className="text-blue-600 text-sm mt-2">
                    Using {activeChild.name}'s profile for personalized activity generation
                  </p>
                </div>
              ) : (
                <div className={`${isChildAgnostic ? 'bg-green-50 border-green-200' : 'bg-yellow-50 border-yellow-200'} border rounded-lg p-4 mb-4`}>
                  <p className={isChildAgnostic ? 'text-green-800' : 'text-yellow-800'}>
                    {isChildAgnostic 
                      ? 'Child-agnostic mode enabled. You can create activities for any child.' 
                      : 'No child profile selected. Please select a child or enable child-agnostic mode.'}
                  </p>
                </div>
              )}
            </div>

            {(isChildAgnostic || !activeChild) && (
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Target Age</label>
                  <select
                    value={formData.childProfile?.age || 4}
                    onChange={(e) => updateNestedData('childProfile', 'age', parseInt(e.target.value))}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  >
                    {[2, 3, 4, 5, 6, 7, 8].map(age => (
                      <option key={age} value={age}>{age} years old</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Learning Style</label>
                  <select
                    value={formData.childProfile?.learningStyle || 'mixed'}
                    onChange={(e) => updateNestedData('childProfile', 'learningStyle', e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  >
                    <option value="visual">Visual</option>
                    <option value="auditory">Auditory</option>
                    <option value="kinesthetic">Kinesthetic</option>
                    <option value="mixed">Mixed/Balanced</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Energy Level</label>
                  <select
                    value={formData.childProfile?.energyLevel || 'medium'}
                    onChange={(e) => updateNestedData('childProfile', 'energyLevel', e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  >
                    <option value="low">Low (Calm activities)</option>
                    <option value="medium">Medium (Balanced energy)</option>
                    <option value="high">High (Active engagement)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Interests (Optional)</label>
                  <textarea
                    value={formData.childProfile?.interests?.join(', ') || ''}
                    onChange={(e) => updateNestedData('childProfile', 'interests', e.target.value.split(', ').filter(i => i.trim()))}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    placeholder="Enter interests separated by commas (e.g., animals, music, space)"
                    rows={2}
                  />
                </div>
              </div>
            )}

            {activeChild && !isChildAgnostic && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-medium text-gray-900 mb-2">Interests</h4>
                  <div className="flex flex-wrap gap-2">
                    {activeChild.interests.map(interest => (
                      <span key={interest} className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm">
                        {interest}
                      </span>
                    ))}
                  </div>
                </div>

                <div>
                  <h4 className="font-medium text-gray-900 mb-2">Learning Preferences</h4>
                  <div className="space-y-1 text-sm text-gray-600">
                    <p>Style: <span className="font-medium capitalize">{activeChild.preferences.learningStyle}</span></p>
                    <p>Energy: <span className="font-medium capitalize">{activeChild.preferences.energyLevel}</span></p>
                    <p>Social: <span className="font-medium capitalize">{activeChild.preferences.socialPreference.replace('-', ' ')}</span></p>
                  </div>
                </div>

                <div>
                  <h4 className="font-medium text-gray-900 mb-2">Sensory Needs</h4>
                  <div className="flex flex-wrap gap-2">
                    {activeChild.sensoryNeeds.map(need => (
                      <span key={need} className="px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-sm">
                        {need}
                      </span>
                    ))}
                  </div>
                </div>

                <div>
                  <h4 className="font-medium text-gray-900 mb-2">Therapy Goals</h4>
                  <div className="space-y-2">
                    {activeChild.speechGoals.length > 0 && (
                      <div>
                        <p className="text-sm font-medium text-blue-600">Speech: {activeChild.speechGoals.length} goals</p>
                      </div>
                    )}
                    {activeChild.otGoals.length > 0 && (
                      <div>
                        <p className="text-sm font-medium text-green-600">OT: {activeChild.otGoals.length} goals</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Developmental Areas (Optional)</label>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {developmentalAreas.map((area) => (
                  <label key={area} className="flex items-center">
                    <input
                      type="checkbox"
                      checked={formData.childProfile?.developmentalAreas?.includes(area) || false}
                      onChange={() => {
                        const currentAreas = formData.childProfile?.developmentalAreas || [];
                        const newAreas = currentAreas.includes(area)
                          ? currentAreas.filter(a => a !== area)
                          : [...currentAreas, area];
                        updateNestedData('childProfile', 'developmentalAreas', newAreas);
                      }}
                      className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                    />
                    <span className="ml-2 text-sm text-gray-700">{area}</span>
                  </label>
                ))}
              </div>
            </div>
          </div>
        );

      case 1:
        return (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Activity Type & Category</h3>
              
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-3">Activity Type *</label>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {activityTypes.map(type => {
                    const Icon = type.icon;
                    return (
                      <motion.button
                        key={type.id}
                        onClick={() => updateFormData('activityType', type.id)}
                        className={`p-4 rounded-lg border-2 transition-all duration-300 text-left ${
                          formData.activityType === type.id
                            ? 'border-indigo-300 bg-indigo-50 text-indigo-700'
                            : 'border-gray-200 hover:border-indigo-200'
                        }`}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                      >
                        <Icon className="w-6 h-6 mb-2" />
                        <h4 className="font-semibold mb-1">{type.name}</h4>
                        <p className="text-sm opacity-75">{type.description}</p>
                      </motion.button>
                    );
                  })}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">Category *</label>
                <select
                  value={formData.category || ''}
                  onChange={(e) => updateFormData('category', e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                >
                  <option value="">Select a category</option>
                  {categories.map(category => (
                    <option key={category} value={category}>{category}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Duration: {formData.duration} minutes
                </label>
                <input
                  type="range"
                  min="15"
                  max="90"
                  step="15"
                  value={formData.duration || 30}
                  onChange={(e) => updateFormData('duration', parseInt(e.target.value))}
                  className="w-full"
                />
                <div className="flex justify-between text-sm text-gray-500 mt-1">
                  <span>15 min</span>
                  <span>30 min</span>
                  <span>45 min</span>
                  <span>60 min</span>
                  <span>75 min</span>
                  <span>90 min</span>
                </div>
              </div>
            </div>
          </div>
        );

      case 2:
        return (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Educational Methodologies</h3>
              <p className="text-gray-600 mb-4">Select which educational approaches to incorporate:</p>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {methodologies.map(method => (
                  <motion.button
                    key={method.id}
                    onClick={() => toggleArrayItem('methodologies', method.id)}
                    className={`p-4 rounded-lg border-2 transition-all duration-300 text-left ${
                      formData.methodologies?.includes(method.id)
                        ? 'border-green-300 bg-green-50 text-green-700'
                        : 'border-gray-200 hover:border-green-200'
                    }`}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <h4 className="font-semibold mb-1">{method.name}</h4>
                    <p className="text-sm opacity-75">{method.description}</p>
                  </motion.button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">Learning Objectives</label>
              <textarea
                value={formData.learningObjectives?.join('\n') || ''}
                onChange={(e) => updateFormData('learningObjectives', e.target.value.split('\n').filter(obj => obj.trim()))}
                rows={4}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                placeholder="Enter learning objectives (one per line)&#10;Example:&#10;Develop fine motor skills&#10;Practice color recognition&#10;Build concentration"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">Developmental Areas</label>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {developmentalAreas.map((area) => (
                  <label key={area} className="flex items-center">
                    <input
                      type="checkbox"
                      checked={formData.childProfile?.developmentalAreas?.includes(area) || false}
                      onChange={() => {
                        const currentAreas = formData.childProfile?.developmentalAreas || [];
                        const newAreas = currentAreas.includes(area)
                          ? currentAreas.filter(a => a !== area)
                          : [...currentAreas, area];
                        updateNestedData('childProfile', 'developmentalAreas', newAreas);
                      }}
                      className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                    />
                    <span className="ml-2 text-sm text-gray-700">{area}</span>
                  </label>
                ))}
              </div>
            </div>
          </div>
        );

      case 3:
        return (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Environment & Materials</h3>
              
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-3">Environment</label>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
                  {environments.map(env => {
                    const Icon = env.icon;
                    return (
                      <motion.button
                        key={env.id}
                        onClick={() => updateFormData('environment', env.id)}
                        className={`p-4 rounded-lg border-2 transition-all duration-300 text-center ${
                          formData.environment === env.id
                            ? 'border-blue-300 bg-blue-50 text-blue-700'
                            : 'border-gray-200 hover:border-blue-200'
                        }`}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                      >
                        <Icon className="w-6 h-6 mx-auto mb-2" />
                        <span className="font-medium">{env.name}</span>
                      </motion.button>
                    );
                  })}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">Material Constraints</label>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  {materialConstraints.map(constraint => (
                    <label key={constraint} className="flex items-center">
                      <input
                        type="checkbox"
                        checked={formData.materialConstraints?.includes(constraint) || false}
                        onChange={() => toggleArrayItem('materialConstraints', constraint)}
                        className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                      />
                      <span className="ml-2 text-sm text-gray-700">{constraint}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div className="mt-6">
                <label className="block text-sm font-medium text-gray-700 mb-3">Adaptation Needs</label>
                <textarea
                  value={formData.adaptationNeeds?.join('\n') || ''}
                  onChange={(e) => updateFormData('adaptationNeeds', e.target.value.split('\n').filter(need => need.trim()))}
                  rows={3}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  placeholder="Enter specific adaptation needs (one per line)&#10;Example:&#10;Sensory-friendly options&#10;Simplified instructions&#10;Alternative tools for fine motor challenges"
                />
              </div>
            </div>
          </div>
        );

      case 4:
        return (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Therapy Integration</h3>
              <p className="text-gray-600 mb-6">
                Integrate speech and occupational therapy targets into the activity
              </p>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div>
                  <h4 className="font-medium text-gray-900 mb-3">Speech Therapy Targets</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {speechTherapyTargets.map((target) => (
                      <label key={target} className="flex items-center">
                        <input
                          type="checkbox"
                          checked={formData.therapyTargets?.speech?.includes(target) || false}
                          onChange={() => toggleNestedArrayItem('therapyTargets', 'speech', target)}
                          className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                        />
                        <span className="ml-2 text-sm text-gray-700">{target}</span>
                      </label>
                    ))}
                  </div>
                  
                  <div className="mt-4">
                    <label className="block text-sm font-medium text-gray-700 mb-2">Custom Speech Targets</label>
                    <textarea
                      value={formData.therapyTargets?.speech?.filter(t => !speechTherapyTargets.includes(t)).join('\n') || ''}
                      onChange={(e) => {
                        const customTargets = e.target.value.split('\n').filter(t => t.trim());
                        const standardTargets = formData.therapyTargets?.speech?.filter(t => speechTherapyTargets.includes(t)) || [];
                        updateNestedData('therapyTargets', 'speech', [...standardTargets, ...customTargets]);
                      }}
                      rows={2}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Enter custom speech targets (one per line)"
                    />
                  </div>
                </div>
                
                <div>
                  <h4 className="font-medium text-gray-900 mb-3">Occupational Therapy Targets</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {otTherapyTargets.map((target) => (
                      <label key={target} className="flex items-center">
                        <input
                          type="checkbox"
                          checked={formData.therapyTargets?.ot?.includes(target) || false}
                          onChange={() => toggleNestedArrayItem('therapyTargets', 'ot', target)}
                          className="rounded border-gray-300 text-green-600 focus:ring-green-500"
                        />
                        <span className="ml-2 text-sm text-gray-700">{target}</span>
                      </label>
                    ))}
                  </div>
                  
                  <div className="mt-4">
                    <label className="block text-sm font-medium text-gray-700 mb-2">Custom OT Targets</label>
                    <textarea
                      value={formData.therapyTargets?.ot?.filter(t => !otTherapyTargets.includes(t)).join('\n') || ''}
                      onChange={(e) => {
                        const customTargets = e.target.value.split('\n').filter(t => t.trim());
                        const standardTargets = formData.therapyTargets?.ot?.filter(t => otTherapyTargets.includes(t)) || [];
                        updateNestedData('therapyTargets', 'ot', [...standardTargets, ...customTargets]);
                      }}
                      rows={2}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                      placeholder="Enter custom OT targets (one per line)"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        );

      case 5:
        return (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Cultural & Seasonal Considerations</h3>
              <p className="text-gray-600 mb-6">
                Enhance the activity with cultural awareness and seasonal relevance
              </p>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div>
                  <h4 className="font-medium text-gray-900 mb-3">Cultural Considerations</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {culturalConsiderations.map((consideration) => (
                      <label key={consideration} className="flex items-center">
                        <input
                          type="checkbox"
                          checked={formData.advancedOptions?.culturalConsiderations?.includes(consideration) || false}
                          onChange={() => toggleNestedArrayItem('advancedOptions', 'culturalConsiderations', consideration)}
                          className="rounded border-gray-300 text-purple-600 focus:ring-purple-500"
                        />
                        <span className="ml-2 text-sm text-gray-700">{consideration}</span>
                      </label>
                    ))}
                  </div>
                </div>
                
                <div>
                  <h4 className="font-medium text-gray-900 mb-3">Seasonal Themes</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {seasonalThemes.map((theme) => (
                      <label key={theme} className="flex items-center">
                        <input
                          type="checkbox"
                          checked={formData.advancedOptions?.seasonalThemes?.includes(theme) || false}
                          onChange={() => toggleNestedArrayItem('advancedOptions', 'seasonalThemes', theme)}
                          className="rounded border-gray-300 text-orange-600 focus:ring-orange-500"
                        />
                        <span className="ml-2 text-sm text-gray-700">{theme}</span>
                      </label>
                    ))}
                  </div>
                </div>
              </div>
              
              <div className="mt-6">
                <h4 className="font-medium text-gray-900 mb-3">Language Support</h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  {languageSupports.map((language) => (
                    <label key={language} className="flex items-center">
                      <input
                        type="checkbox"
                        checked={formData.advancedOptions?.languageSupport?.includes(language) || false}
                        onChange={() => toggleNestedArrayItem('advancedOptions', 'languageSupport', language)}
                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                      <span className="ml-2 text-sm text-gray-700">{language}</span>
                    </label>
                  ))}
                </div>
              </div>
            </div>
          </div>
        );

      case 6:
        return (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Advanced Options</h3>
              <p className="text-gray-600 mb-6">Enhance your activity with additional professional features:</p>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <h4 className="font-medium text-gray-900">Content Enhancement</h4>
                  {[
                    { key: 'includeMultimedia', label: 'Include multimedia suggestions' },
                    { key: 'generateAssessmentRubric', label: 'Generate assessment rubric' },
                    { key: 'generateExtensionActivities', label: 'Create extension activities' },
                    { key: 'generateReflectionPrompts', label: 'Add reflection prompts' },
                    { key: 'includeParentNewsletter', label: 'Generate parent newsletter' }
                  ].map(option => (
                    <label key={option.key} className="flex items-center">
                      <input
                        type="checkbox"
                        checked={formData.advancedOptions?.[option.key as keyof typeof formData.advancedOptions] || false}
                        onChange={(e) => updateNestedData('advancedOptions', option.key, e.target.checked)}
                        className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                      />
                      <span className="ml-2 text-sm text-gray-700">{option.label}</span>
                    </label>
                  ))}
                </div>

                <div className="space-y-4">
                  <h4 className="font-medium text-gray-900">Accessibility & Support</h4>
                  {[
                    { key: 'createAdaptationGuide', label: 'Create adaptation guide' },
                    { key: 'includeProgressTracking', label: 'Include progress tracking' },
                    { key: 'createDigitalResources', label: 'Suggest digital resources' }
                  ].map(option => (
                    <label key={option.key} className="flex items-center">
                      <input
                        type="checkbox"
                        checked={formData.advancedOptions?.[option.key as keyof typeof formData.advancedOptions] || false}
                        onChange={(e) => updateNestedData('advancedOptions', option.key, e.target.checked)}
                        className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                      />
                      <span className="ml-2 text-sm text-gray-700">{option.label}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Budget Range</label>
                  <select
                    value={formData.advancedOptions?.budgetRange || 'low'}
                    onChange={(e) => updateNestedData('advancedOptions', 'budgetRange', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  >
                    <option value="low">Low ($0-$10)</option>
                    <option value="medium">Medium ($10-$25)</option>
                    <option value="high">High ($25+)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Technology Integration</label>
                  <select
                    value={formData.advancedOptions?.technologyIntegration || 'none'}
                    onChange={(e) => updateNestedData('advancedOptions', 'technologyIntegration', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  >
                    <option value="none">No technology</option>
                    <option value="minimal">Minimal (camera/recording)</option>
                    <option value="moderate">Moderate (apps/tablets)</option>
                    <option value="high">High (interactive tech)</option>
                  </select>
                </div>
              </div>

              <div className="mt-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">Assessment Type</label>
                <select
                  value={formData.advancedOptions?.assessmentType || 'observational'}
                  onChange={(e) => updateNestedData('advancedOptions', 'assessmentType', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                >
                  <option value="observational">Observational</option>
                  <option value="portfolio">Portfolio-based</option>
                  <option value="performance">Performance-based</option>
                  <option value="rubric">Rubric-based</option>
                  <option value="narrative">Narrative</option>
                </select>
              </div>
            </div>
          </div>
        );

      case 7:
        return (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Generate Your Activity</h3>
              
              {!generatedActivity ? (
                <div className="text-center py-12">
                  <div className="w-20 h-20 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full flex items-center justify-center mx-auto mb-6">
                    <Wand2 className="w-10 h-10 text-white" />
                  </div>
                  <h4 className="text-xl font-semibold text-gray-900 mb-2">Ready to Generate!</h4>
                  <p className="text-gray-600 mb-8">
                    Click the button below to create a personalized activity 
                    {!isChildAgnostic && activeChild ? ` for ${activeChild.name}` : ''}.
                  </p>
                  
                  {openAIConnected === false && (
                    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6 text-left">
                      <div className="flex items-center gap-2 mb-2">
                        <AlertCircle className="w-5 h-5 text-yellow-600" />
                        <span className="font-medium text-yellow-800">OpenAI Connection Unavailable</span>
                      </div>
                      <p className="text-yellow-700 text-sm">
                        The AI service is not connected. A basic activity template will be generated instead.
                      </p>
                    </div>
                  )}
                  
                  <motion.button
                    onClick={handleGenerate}
                    disabled={isGenerating}
                    className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-8 py-4 rounded-xl font-semibold hover:shadow-lg transition-all duration-300 flex items-center gap-2 mx-auto disabled:opacity-50"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    {isGenerating ? (
                      <>
                        <Loader2 className="w-5 h-5 animate-spin" />
                        Generating Activity...
                      </>
                    ) : (
                      <>
                        <Sparkles className="w-5 h-5" />
                        Generate Activity
                      </>
                    )}
                  </motion.button>
                </div>
              ) : (
                <div ref={resultRef} className="space-y-6">
                  {/* Generated Activity Display */}
                  <div className="bg-gradient-to-r from-indigo-50 to-purple-50 border border-indigo-200 rounded-xl p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <h4 className="text-2xl font-bold text-gray-900">{generatedActivity.title}</h4>
                          <div className="px-3 py-1 bg-indigo-100 text-indigo-700 rounded-full text-xs font-medium">
                            AI Generated
                          </div>
                        </div>
                        <p className="text-gray-700 leading-relaxed">{generatedActivity.description}</p>
                      </div>
                      <div className="flex gap-2 ml-4">
                        {saved ? (
                          <div className="bg-green-100 text-green-700 px-4 py-2 rounded-lg font-medium flex items-center gap-2">
                            <CheckCircle className="w-4 h-4" />
                            Saved ✓
                          </div>
                        ) : (
                          <motion.button
                            onClick={handleSaveToLibrary}
                            className="bg-indigo-600 text-white px-6 py-2 rounded-lg hover:bg-indigo-700 transition-colors flex items-center gap-2"
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                          >
                            <Save className="w-4 h-4" />
                            Save to Library
                          </motion.button>
                        )}
                        <button
                          onClick={() => setIsFullscreen(!isFullscreen)}
                          className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
                        >
                          {isFullscreen ? <Minimize2 className="w-5 h-5" /> : <Maximize2 className="w-5 h-5" />}
                        </button>
                      </div>
                    </div>

                    {/* Quick Stats */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                      <div className="bg-white rounded-lg p-3 text-center">
                        <Clock className="w-5 h-5 text-indigo-600 mx-auto mb-1" />
                        <div className="text-sm text-gray-600">Duration</div>
                        <div className="font-semibold">{formData.duration} min</div>
                      </div>
                      <div className="bg-white rounded-lg p-3 text-center">
                        <Target className="w-5 h-5 text-green-600 mx-auto mb-1" />
                        <div className="text-sm text-gray-600">Materials</div>
                        <div className="font-semibold">{generatedActivity.materials.length}</div>
                      </div>
                      <div className="bg-white rounded-lg p-3 text-center">
                        <BookOpen className="w-5 h-5 text-purple-600 mx-auto mb-1" />
                        <div className="text-sm text-gray-600">Steps</div>
                        <div className="font-semibold">{generatedActivity.instructions.length}</div>
                      </div>
                      <div className="bg-white rounded-lg p-3 text-center">
                        <Lightbulb className="w-5 h-5 text-orange-600 mx-auto mb-1" />
                        <div className="text-sm text-gray-600">Objectives</div>
                        <div className="font-semibold">{generatedActivity.learningObjectives.length}</div>
                      </div>
                    </div>

                    {/* Collapsible Sections */}
                    <div className="space-y-4">
                      {/* Materials */}
                      <div className="border border-gray-200 rounded-lg overflow-hidden">
                        <button
                          onClick={() => toggleExpandSection('materials')}
                          className="w-full flex items-center justify-between p-4 bg-white hover:bg-gray-50 transition-colors"
                        >
                          <div className="flex items-center gap-2">
                            <Layers className="w-5 h-5 text-indigo-600" />
                            <h5 className="font-semibold text-gray-900">Materials Needed</h5>
                          </div>
                          {expandedSection === 'materials' ? (
                            <ChevronUp className="w-5 h-5 text-gray-500" />
                          ) : (
                            <ChevronDown className="w-5 h-5 text-gray-500" />
                          )}
                        </button>
                        
                        {expandedSection === 'materials' && (
                          <div className="p-4 bg-white border-t border-gray-200">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                              {generatedActivity.materials.map((material, index) => (
                                <div key={index} className="flex items-center gap-2 bg-gray-50 rounded-lg p-2">
                                  <CheckCircle className="w-4 h-4 text-green-600 flex-shrink-0" />
                                  <span className="text-gray-700">{material}</span>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>

                      {/* Instructions */}
                      <div className="border border-gray-200 rounded-lg overflow-hidden">
                        <button
                          onClick={() => toggleExpandSection('instructions')}
                          className="w-full flex items-center justify-between p-4 bg-white hover:bg-gray-50 transition-colors"
                        >
                          <div className="flex items-center gap-2">
                            <FileText className="w-5 h-5 text-blue-600" />
                            <h5 className="font-semibold text-gray-900">Step-by-Step Instructions</h5>
                          </div>
                          {expandedSection === 'instructions' ? (
                            <ChevronUp className="w-5 h-5 text-gray-500" />
                          ) : (
                            <ChevronDown className="w-5 h-5 text-gray-500" />
                          )}
                        </button>
                        
                        {expandedSection === 'instructions' && (
                          <div className="p-4 bg-white border-t border-gray-200">
                            <div className="space-y-3">
                              {generatedActivity.instructions.map((instruction, index) => (
                                <div key={index} className="flex gap-3 bg-gray-50 rounded-lg p-3">
                                  <div className="w-6 h-6 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-sm font-semibold flex-shrink-0">
                                    {index + 1}
                                  </div>
                                  <p className="text-gray-700">{instruction}</p>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>

                      {/* Learning Objectives */}
                      <div className="border border-gray-200 rounded-lg overflow-hidden">
                        <button
                          onClick={() => toggleExpandSection('objectives')}
                          className="w-full flex items-center justify-between p-4 bg-white hover:bg-gray-50 transition-colors"
                        >
                          <div className="flex items-center gap-2">
                            <Target className="w-5 h-5 text-green-600" />
                            <h5 className="font-semibold text-gray-900">Learning Objectives</h5>
                          </div>
                          {expandedSection === 'objectives' ? (
                            <ChevronUp className="w-5 h-5 text-gray-500" />
                          ) : (
                            <ChevronDown className="w-5 h-5 text-gray-500" />
                          )}
                        </button>
                        
                        {expandedSection === 'objectives' && (
                          <div className="p-4 bg-white border-t border-gray-200">
                            <div className="space-y-2">
                              {generatedActivity.learningObjectives.map((objective, index) => (
                                <div key={index} className="flex items-center gap-2">
                                  <Lightbulb className="w-4 h-4 text-yellow-600 flex-shrink-0" />
                                  <span className="text-gray-700">{objective}</span>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>

                      {/* Adaptations */}
                      <div className="border border-gray-200 rounded-lg overflow-hidden">
                        <button
                          onClick={() => toggleExpandSection('adaptations')}
                          className="w-full flex items-center justify-between p-4 bg-white hover:bg-gray-50 transition-colors"
                        >
                          <div className="flex items-center gap-2">
                            <Settings className="w-5 h-5 text-orange-600" />
                            <h5 className="font-semibold text-gray-900">Adaptations</h5>
                          </div>
                          {expandedSection === 'adaptations' ? (
                            <ChevronUp className="w-5 h-5 text-gray-500" />
                          ) : (
                            <ChevronDown className="w-5 h-5 text-gray-500" />
                          )}
                        </button>
                        
                        {expandedSection === 'adaptations' && (
                          <div className="p-4 bg-white border-t border-gray-200">
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                              <div className="bg-blue-50 rounded-lg p-4">
                                <h6 className="font-medium text-blue-900 mb-2">Sensory</h6>
                                <div className="space-y-1">
                                  {generatedActivity.adaptations.sensory.map((adaptation, index) => (
                                    <p key={index} className="text-blue-800 text-sm">{adaptation}</p>
                                  ))}
                                </div>
                              </div>
                              
                              <div className="bg-green-50 rounded-lg p-4">
                                <h6 className="font-medium text-green-900 mb-2">Motor</h6>
                                <div className="space-y-1">
                                  {generatedActivity.adaptations.motor.map((adaptation, index) => (
                                    <p key={index} className="text-green-800 text-sm">{adaptation}</p>
                                  ))}
                                </div>
                              </div>
                              
                              <div className="bg-purple-50 rounded-lg p-4">
                                <h6 className="font-medium text-purple-900 mb-2">Cognitive</h6>
                                <div className="space-y-1">
                                  {generatedActivity.adaptations.cognitive.map((adaptation, index) => (
                                    <p key={index} className="text-purple-800 text-sm">{adaptation}</p>
                                  ))}
                                </div>
                              </div>
                            </div>
                          </div>
                        )}
                      </div>

                      {/* Parent Guidance */}
                      <div className="border border-gray-200 rounded-lg overflow-hidden">
                        <button
                          onClick={() => toggleExpandSection('guidance')}
                          className="w-full flex items-center justify-between p-4 bg-white hover:bg-gray-50 transition-colors"
                        >
                          <div className="flex items-center gap-2">
                            <User className="w-5 h-5 text-purple-600" />
                            <h5 className="font-semibold text-gray-900">Parent Guidance</h5>
                          </div>
                          {expandedSection === 'guidance' ? (
                            <ChevronUp className="w-5 h-5 text-gray-500" />
                          ) : (
                            <ChevronDown className="w-5 h-5 text-gray-500" />
                          )}
                        </button>
                        
                        {expandedSection === 'guidance' && (
                          <div className="p-4 bg-white border-t border-gray-200">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              <div>
                                <h6 className="font-medium text-gray-900 mb-2">Setup Tips</h6>
                                <ul className="space-y-1 list-disc list-inside text-sm text-gray-700">
                                  {generatedActivity.parentGuidance.setupTips.map((tip, index) => (
                                    <li key={index}>{tip}</li>
                                  ))}
                                </ul>
                              </div>
                              
                              <div>
                                <h6 className="font-medium text-gray-900 mb-2">Encouragement Phrases</h6>
                                <ul className="space-y-1 list-disc list-inside text-sm text-gray-700">
                                  {generatedActivity.parentGuidance.encouragementPhrases.map((phrase, index) => (
                                    <li key={index}>{phrase}</li>
                                  ))}
                                </ul>
                              </div>
                              
                              <div>
                                <h6 className="font-medium text-gray-900 mb-2">Extension Ideas</h6>
                                <ul className="space-y-1 list-disc list-inside text-sm text-gray-700">
                                  {generatedActivity.parentGuidance.extensionIdeas.map((idea, index) => (
                                    <li key={index}>{idea}</li>
                                  ))}
                                </ul>
                              </div>
                              
                              <div>
                                <h6 className="font-medium text-gray-900 mb-2">Troubleshooting</h6>
                                <ul className="space-y-1 list-disc list-inside text-sm text-gray-700">
                                  {generatedActivity.parentGuidance.troubleshooting.map((tip, index) => (
                                    <li key={index}>{tip}</li>
                                  ))}
                                </ul>
                              </div>
                            </div>
                          </div>
                        )}
                      </div>

                      {/* Assessment */}
                      <div className="border border-gray-200 rounded-lg overflow-hidden">
                        <button
                          onClick={() => toggleExpandSection('assessment')}
                          className="w-full flex items-center justify-between p-4 bg-white hover:bg-gray-50 transition-colors"
                        >
                          <div className="flex items-center gap-2">
                            <Clipboard className="w-5 h-5 text-teal-600" />
                            <h5 className="font-semibold text-gray-900">Assessment & Observation</h5>
                          </div>
                          {expandedSection === 'assessment' ? (
                            <ChevronUp className="w-5 h-5 text-gray-500" />
                          ) : (
                            <ChevronDown className="w-5 h-5 text-gray-500" />
                          )}
                        </button>
                        
                        {expandedSection === 'assessment' && (
                          <div className="p-4 bg-white border-t border-gray-200">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              <div>
                                <h6 className="font-medium text-gray-900 mb-2">Observation Points</h6>
                                <ul className="space-y-1 list-disc list-inside text-sm text-gray-700">
                                  {generatedActivity.assessment.observationPoints.map((point, index) => (
                                    <li key={index}>{point}</li>
                                  ))}
                                </ul>
                              </div>
                              
                              <div>
                                <h6 className="font-medium text-gray-900 mb-2">Milestones</h6>
                                <ul className="space-y-1 list-disc list-inside text-sm text-gray-700">
                                  {generatedActivity.assessment.milestones.map((milestone, index) => (
                                    <li key={index}>{milestone}</li>
                                  ))}
                                </ul>
                              </div>
                            </div>
                          </div>
                        )}
                      </div>

                      {/* Therapy Targets */}
                      {(generatedActivity.speechTargets?.length > 0 || generatedActivity.otTargets?.length > 0) && (
                        <div className="border border-gray-200 rounded-lg overflow-hidden">
                          <button
                            onClick={() => toggleExpandSection('therapy')}
                            className="w-full flex items-center justify-between p-4 bg-white hover:bg-gray-50 transition-colors"
                          >
                            <div className="flex items-center gap-2">
                              <Stethoscope className="w-5 h-5 text-red-600" />
                              <h5 className="font-semibold text-gray-900">Therapy Targets</h5>
                            </div>
                            {expandedSection === 'therapy' ? (
                              <ChevronUp className="w-5 h-5 text-gray-500" />
                            ) : (
                              <ChevronDown className="w-5 h-5 text-gray-500" />
                            )}
                          </button>
                          
                          {expandedSection === 'therapy' && (
                            <div className="p-4 bg-white border-t border-gray-200">
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {generatedActivity.speechTargets?.length > 0 && (
                                  <div>
                                    <h6 className="font-medium text-gray-900 mb-2">Speech Therapy</h6>
                                    <ul className="space-y-1 list-disc list-inside text-sm text-gray-700">
                                      {generatedActivity.speechTargets.map((target, index) => (
                                        <li key={index}>{target}</li>
                                      ))}
                                    </ul>
                                  </div>
                                )}
                                
                                {generatedActivity.otTargets?.length > 0 && (
                                  <div>
                                    <h6 className="font-medium text-gray-900 mb-2">Occupational Therapy</h6>
                                    <ul className="space-y-1 list-disc list-inside text-sm text-gray-700">
                                      {generatedActivity.otTargets.map((target, index) => (
                                        <li key={index}>{target}</li>
                                      ))}
                                    </ul>
                                  </div>
                                )}
                              </div>
                            </div>
                          )}
                        </div>
                      )}

                      {/* Advanced Features */}
                      {(generatedActivity.multimedia || 
                        generatedActivity.assessmentRubric || 
                        generatedActivity.extensionActivities || 
                        generatedActivity.reflectionPrompts || 
                        generatedActivity.culturalAdaptations || 
                        generatedActivity.digitalResources) && (
                        <div className="border border-gray-200 rounded-lg overflow-hidden">
                          <button
                            onClick={() => toggleExpandSection('advanced')}
                            className="w-full flex items-center justify-between p-4 bg-white hover:bg-gray-50 transition-colors"
                          >
                            <div className="flex items-center gap-2">
                              <Sliders className="w-5 h-5 text-indigo-600" />
                              <h5 className="font-semibold text-gray-900">Advanced Features</h5>
                            </div>
                            {expandedSection === 'advanced' ? (
                              <ChevronUp className="w-5 h-5 text-gray-500" />
                            ) : (
                              <ChevronDown className="w-5 h-5 text-gray-500" />
                            )}
                          </button>
                          
                          {expandedSection === 'advanced' && (
                            <div className="p-4 bg-white border-t border-gray-200">
                              <div className="space-y-6">
                                {/* Multimedia */}
                                {generatedActivity.multimedia && (
                                  <div>
                                    <h6 className="font-medium text-gray-900 mb-2">Multimedia Suggestions</h6>
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                      {generatedActivity.multimedia.suggestedPhotos && (
                                        <div className="bg-blue-50 rounded-lg p-3">
                                          <h6 className="font-medium text-blue-900 mb-2 flex items-center gap-2">
                                            <Camera className="w-4 h-4" /> Photo Ideas
                                          </h6>
                                          <ul className="space-y-1 list-disc list-inside text-sm text-blue-800">
                                            {generatedActivity.multimedia.suggestedPhotos.map((item, index) => (
                                              <li key={index}>{item}</li>
                                            ))}
                                          </ul>
                                        </div>
                                      )}
                                      
                                      {generatedActivity.multimedia.videoIdeas && (
                                        <div className="bg-red-50 rounded-lg p-3">
                                          <h6 className="font-medium text-red-900 mb-2 flex items-center gap-2">
                                            <Video className="w-4 h-4" /> Video Ideas
                                          </h6>
                                          <ul className="space-y-1 list-disc list-inside text-sm text-red-800">
                                            {generatedActivity.multimedia.videoIdeas.map((item, index) => (
                                              <li key={index}>{item}</li>
                                            ))}
                                          </ul>
                                        </div>
                                      )}
                                      
                                      {generatedActivity.multimedia.audioElements && (
                                        <div className="bg-purple-50 rounded-lg p-3">
                                          <h6 className="font-medium text-purple-900 mb-2 flex items-center gap-2">
                                            <Headphones className="w-4 h-4" /> Audio Elements
                                          </h6>
                                          <ul className="space-y-1 list-disc list-inside text-sm text-purple-800">
                                            {generatedActivity.multimedia.audioElements.map((item, index) => (
                                              <li key={index}>{item}</li>
                                            ))}
                                          </ul>
                                        </div>
                                      )}
                                    </div>
                                  </div>
                                )}

                                {/* Assessment Rubric */}
                                {generatedActivity.assessmentRubric && (
                                  <div>
                                    <h6 className="font-medium text-gray-900 mb-2">Assessment Rubric</h6>
                                    <div className="bg-gray-50 rounded-lg p-4">
                                      <div className="mb-3">
                                        <h6 className="font-medium text-gray-800 mb-1">Criteria:</h6>
                                        <div className="flex flex-wrap gap-2">
                                          {generatedActivity.assessmentRubric.criteria.map((criterion, index) => (
                                            <span key={index} className="px-2 py-1 bg-blue-100 text-blue-700 rounded-full text-xs">
                                              {criterion}
                                            </span>
                                          ))}
                                        </div>
                                      </div>
                                      
                                      <div>
                                        <h6 className="font-medium text-gray-800 mb-1">Performance Levels:</h6>
                                        <div className="flex flex-wrap gap-2">
                                          {generatedActivity.assessmentRubric.levels.map((level, index) => (
                                            <span key={index} className="px-2 py-1 bg-green-100 text-green-700 rounded-full text-xs">
                                              {level}
                                            </span>
                                          ))}
                                        </div>
                                      </div>
                                    </div>
                                  </div>
                                )}

                                {/* Extension Activities */}
                                {generatedActivity.extensionActivities && (
                                  <div>
                                    <h6 className="font-medium text-gray-900 mb-2">Extension Activities</h6>
                                    <div className="space-y-3">
                                      {generatedActivity.extensionActivities.map((activity, index) => (
                                        <div key={index} className="bg-green-50 rounded-lg p-3">
                                          <h6 className="font-medium text-green-900 mb-1">{activity.title}</h6>
                                          <p className="text-sm text-green-800 mb-2">{activity.description}</p>
                                          {activity.materials && activity.materials.length > 0 && (
                                            <div>
                                              <span className="text-xs font-medium text-green-700">Materials: </span>
                                              <span className="text-xs text-green-700">{activity.materials.join(', ')}</span>
                                            </div>
                                          )}
                                        </div>
                                      ))}
                                    </div>
                                  </div>
                                )}

                                {/* Reflection Prompts */}
                                {generatedActivity.reflectionPrompts && (
                                  <div>
                                    <h6 className="font-medium text-gray-900 mb-2">Reflection Prompts</h6>
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                      {generatedActivity.reflectionPrompts.forChild && (
                                        <div className="bg-yellow-50 rounded-lg p-3">
                                          <h6 className="font-medium text-yellow-900 mb-2">For Child</h6>
                                          <ul className="space-y-1 list-disc list-inside text-sm text-yellow-800">
                                            {generatedActivity.reflectionPrompts.forChild.map((prompt, index) => (
                                              <li key={index}>{prompt}</li>
                                            ))}
                                          </ul>
                                        </div>
                                      )}
                                      
                                      {generatedActivity.reflectionPrompts.forParent && (
                                        <div className="bg-blue-50 rounded-lg p-3">
                                          <h6 className="font-medium text-blue-900 mb-2">For Parent</h6>
                                          <ul className="space-y-1 list-disc list-inside text-sm text-blue-800">
                                            {generatedActivity.reflectionPrompts.forParent.map((prompt, index) => (
                                              <li key={index}>{prompt}</li>
                                            ))}
                                          </ul>
                                        </div>
                                      )}
                                      
                                      {generatedActivity.reflectionPrompts.forEducator && (
                                        <div className="bg-purple-50 rounded-lg p-3">
                                          <h6 className="font-medium text-purple-900 mb-2">For Educator</h6>
                                          <ul className="space-y-1 list-disc list-inside text-sm text-purple-800">
                                            {generatedActivity.reflectionPrompts.forEducator.map((prompt, index) => (
                                              <li key={index}>{prompt}</li>
                                            ))}
                                          </ul>
                                        </div>
                                      )}
                                    </div>
                                  </div>
                                )}

                                {/* Cultural Adaptations */}
                                {generatedActivity.culturalAdaptations && (
                                  <div>
                                    <h6 className="font-medium text-gray-900 mb-2">Cultural Adaptations</h6>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                      {generatedActivity.culturalAdaptations.considerations && (
                                        <div className="bg-orange-50 rounded-lg p-3">
                                          <h6 className="font-medium text-orange-900 mb-2">Considerations</h6>
                                          <ul className="space-y-1 list-disc list-inside text-sm text-orange-800">
                                            {generatedActivity.culturalAdaptations.considerations.map((item, index) => (
                                              <li key={index}>{item}</li>
                                            ))}
                                          </ul>
                                        </div>
                                      )}
                                      
                                      {generatedActivity.culturalAdaptations.modifications && (
                                        <div className="bg-teal-50 rounded-lg p-3">
                                          <h6 className="font-medium text-teal-900 mb-2">Modifications</h6>
                                          <ul className="space-y-1 list-disc list-inside text-sm text-teal-800">
                                            {generatedActivity.culturalAdaptations.modifications.map((item, index) => (
                                              <li key={index}>{item}</li>
                                            ))}
                                          </ul>
                                        </div>
                                      )}
                                    </div>
                                  </div>
                                )}

                                {/* Digital Resources */}
                                {generatedActivity.digitalResources && (
                                  <div>
                                    <h6 className="font-medium text-gray-900 mb-2">Digital Resources</h6>
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                      {generatedActivity.digitalResources.apps && (
                                        <div className="bg-indigo-50 rounded-lg p-3">
                                          <h6 className="font-medium text-indigo-900 mb-2 flex items-center gap-2">
                                            <Smartphone className="w-4 h-4" /> Recommended Apps
                                          </h6>
                                          <ul className="space-y-1 list-disc list-inside text-sm text-indigo-800">
                                            {generatedActivity.digitalResources.apps.map((app, index) => (
                                              <li key={index}>{app}</li>
                                            ))}
                                          </ul>
                                        </div>
                                      )}
                                      
                                      {generatedActivity.digitalResources.websites && (
                                        <div className="bg-cyan-50 rounded-lg p-3">
                                          <h6 className="font-medium text-cyan-900 mb-2 flex items-center gap-2">
                                            <Globe className="w-4 h-4" /> Useful Websites
                                          </h6>
                                          <ul className="space-y-1 list-disc list-inside text-sm text-cyan-800">
                                            {generatedActivity.digitalResources.websites.map((website, index) => (
                                              <li key={index}>{website}</li>
                                            ))}
                                          </ul>
                                        </div>
                                      )}
                                      
                                      {generatedActivity.digitalResources.tools && (
                                        <div className="bg-violet-50 rounded-lg p-3">
                                          <h6 className="font-medium text-violet-900 mb-2 flex items-center gap-2">
                                            <Laptop className="w-4 h-4" /> Digital Tools
                                          </h6>
                                          <ul className="space-y-1 list-disc list-inside text-sm text-violet-800">
                                            {generatedActivity.digitalResources.tools.map((tool, index) => (
                                              <li key={index}>{tool}</li>
                                            ))}
                                          </ul>
                                        </div>
                                      )}
                                    </div>
                                  </div>
                                )}
                              </div>
                            </div>
                          )}
                        </div>
                      )}
                    </div>

                    {/* Action Buttons */}
                    <div className="flex flex-wrap gap-3 mt-6">
                      <motion.button
                        onClick={() => {
                          setGeneratedActivity(null);
                          setCurrentStep(0);
                        }}
                        className="bg-gray-100 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-200 transition-colors flex items-center gap-2"
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                      >
                        <RefreshCw className="w-4 h-4" />
                        Start Over
                      </motion.button>
                      
                      <motion.button
                        onClick={handleGenerate}
                        className="bg-indigo-100 text-indigo-700 px-4 py-2 rounded-lg hover:bg-indigo-200 transition-colors flex items-center gap-2"
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                      >
                        <Wand2 className="w-4 h-4" />
                        Regenerate
                      </motion.button>
                      
                      {saved && (
                        <motion.button
                          onClick={() => window.location.href = '/activity-builder'}
                          className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors flex items-center gap-2"
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                        >
                          <Play className="w-4 h-4" />
                          View in Library
                        </motion.button>
                      )}
                      
                      <motion.button
                        onClick={() => {
                          navigator.clipboard.writeText(JSON.stringify(generatedActivity, null, 2));
                          toast.success('Activity JSON copied to clipboard!');
                        }}
                        className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition-colors flex items-center gap-2"
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                      >
                        <Copy className="w-4 h-4" />
                        Copy JSON
                      </motion.button>
                      
                      <motion.button
                        onClick={() => {
                          const blob = new Blob([JSON.stringify(generatedActivity, null, 2)], { type: 'application/json' });
                          const url = URL.createObjectURL(blob);
                          const a = document.createElement('a');
                          a.href = url;
                          a.download = `${generatedActivity.title.replace(/\s+/g, '-').toLowerCase()}.json`;
                          document.body.appendChild(a);
                          a.click();
                          document.body.removeChild(a);
                          URL.revokeObjectURL(url);
                          toast.success('Activity JSON downloaded!');
                        }}
                        className="bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700 transition-colors flex items-center gap-2"
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                      >
                        <Download className="w-4 h-4" />
                        Download
                      </motion.button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <motion.div
          className="mb-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <div className="flex items-center gap-4 mb-4">
            <div className="w-12 h-12 bg-gradient-to-r from-indigo-600 to-purple-600 rounded-xl flex items-center justify-center">
              <Sliders className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">AI Pro Generator</h1>
              <p className="text-gray-600">Advanced AI-powered activity generation with professional features</p>
            </div>
          </div>
        </motion.div>

        {/* Progress Steps */}
        <motion.div
          className="mb-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
        >
          <div className="flex items-center justify-between bg-white rounded-xl p-4 shadow-sm overflow-x-auto">
            {steps.map((step, index) => {
              const Icon = step.icon;
              const isActive = index === currentStep;
              const isCompleted = index < currentStep;
              
              return (
                <div key={index} className="flex items-center">
                  <div className={`flex items-center justify-center w-10 h-10 rounded-full border-2 transition-all duration-300 ${
                    isActive 
                      ? 'bg-indigo-600 border-indigo-600 text-white' 
                      : isCompleted
                        ? 'bg-green-600 border-green-600 text-white'
                        : 'border-gray-300 text-gray-400'
                  }`}>
                    <Icon className="w-5 h-5" />
                  </div>
                  <span className={`ml-2 text-sm font-medium hidden sm:inline ${
                    isActive ? 'text-indigo-600' : isCompleted ? 'text-green-600' : 'text-gray-400'
                  }`}>
                    {step.title}
                  </span>
                  {index < steps.length - 1 && (
                    <div className={`w-8 h-0.5 mx-4 ${
                      isCompleted ? 'bg-green-600' : 'bg-gray-300'
                    }`} />
                  )}
                </div>
              );
            })}
          </div>
        </motion.div>

        {/* Main Content */}
        <motion.div
          className="bg-white rounded-xl p-8 shadow-sm"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          {renderStepContent()}
        </motion.div>

        {/* Navigation */}
        <motion.div
          className="flex items-center justify-between mt-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
        >
          <button
            onClick={() => setCurrentStep(Math.max(0, currentStep - 1))}
            disabled={currentStep === 0}
            className="px-6 py-3 text-gray-600 hover:text-gray-800 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            Previous
          </button>
          
          {currentStep < steps.length - 1 && (
            <button
              onClick={() => setCurrentStep(Math.min(steps.length - 1, currentStep + 1))}
              className="bg-indigo-600 text-white px-6 py-3 rounded-xl font-semibold hover:bg-indigo-700 transition-colors flex items-center gap-2"
            >
              Next
              <ArrowRight className="w-4 h-4" />
            </button>
          )}
        </motion.div>
      </div>
    </div>
  );
};

export default AIProGenerator;