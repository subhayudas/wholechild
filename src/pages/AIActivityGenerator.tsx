import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Wand2, 
  Sparkles, 
  Save, 
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
  Play,
  ArrowRight,
  Lightbulb,
  Palette,
  Music,
  Users,
  Camera,
  BookOpen,
  Zap,
  Home,
  TreePine,
  Gamepad2,
  PaintBucket,
  Volume2,
  Calculator,
  Globe,
  Utensils,
  ChevronRight,
  ChevronLeft,
  CheckCircle2,
  FileText,
  BarChart3
} from 'lucide-react';
import { useChildStore } from '../store/childStore';
import { useActivityStore } from '../store/activityStore';
import { generateActivityWithAI, AIGenerationRequest, AIGeneratedActivity, testOpenAIConnection } from '../services/openaiService';
import toast from 'react-hot-toast';

const AIActivityGenerator = () => {
  const { children, activeChild } = useChildStore();
  const { addActivity } = useActivityStore();
  
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedActivity, setGeneratedActivity] = useState<AIGeneratedActivity | null>(null);
  const [saved, setSaved] = useState(false);
  const [openAIConnected, setOpenAIConnected] = useState<boolean | null>(null);
  const [showAdvancedOptions, setShowAdvancedOptions] = useState(false);
  
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

  // Test OpenAI connection on component mount
  useEffect(() => {
    const checkConnection = async () => {
      const connected = await testOpenAIConnection();
      setOpenAIConnected(connected);
      if (connected) {
        toast.success('OpenAI connected successfully!');
      } else {
        toast.error('OpenAI connection unavailable. Using fallback generation.');
      }
    };
    checkConnection();
  }, []);

  // Update form data when active child changes
  useEffect(() => {
    if (activeChild) {
      setFormData(prev => ({
        ...prev,
        childProfile: {
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
        }
      }));
    }
  }, [activeChild]);

  const activityTypes = [
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

  const categories = [
    'Math & Logic', 'Language & Literacy', 'Science & Nature', 'Art & Creativity',
    'Music & Movement', 'Social Skills', 'Life Skills', 'Sensory Play'
  ];

  const methodologies = [
    { id: 'montessori', name: 'Montessori', description: 'Self-directed learning with structured materials' },
    { id: 'reggio', name: 'Reggio Emilia', description: 'Project-based exploration and documentation' },
    { id: 'waldorf', name: 'Waldorf', description: 'Artistic expression and natural rhythms' },
    { id: 'highscope', name: 'HighScope', description: 'Plan-do-review active learning sequence' },
    { id: 'bankstreet', name: 'Bank Street', description: 'Social-emotional development focus' },
    { id: 'play-based', name: 'Play-Based', description: 'Learning through structured play' },
    { id: 'inquiry-based', name: 'Inquiry-Based', description: 'Question-driven exploration' }
  ];

  const environments = [
    { id: 'indoor', name: 'Indoor', icon: Home },
    { id: 'outdoor', name: 'Outdoor', icon: TreePine },
    { id: 'both', name: 'Both', icon: Globe }
  ];

  const materialConstraints = [
    'Household items only', 'Under $10 budget', 'No small parts (choking hazard)',
    'Washable materials', 'Natural materials preferred', 'Minimal cleanup required',
    'Reusable materials', 'No electronics needed'
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

  const handleGenerate = async () => {
    if (!formData.childProfile || !formData.activityType || !formData.category) {
      toast.error('Please complete all required fields');
      return;
    }

    setIsGenerating(true);
    setSaved(false);
    setGeneratedActivity(null);

    try {
      const request: AIGenerationRequest = {
        childProfile: formData.childProfile as AIGenerationRequest['childProfile'],
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
    } catch (error) {
      console.error('Generation error:', error);
      toast.error('Failed to generate activity. Please try again.');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSaveToLibrary = () => {
    if (!generatedActivity) return;

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
      tags: [...(generatedActivity.tags || []), 'ai-generated'],
      media: { images: [], videos: [], audio: [] },
      createdBy: 'AI Assistant',
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

  if (!activeChild) {
    return (
      <div className="min-h-screen bg-white">
        <div className="w-full px-4">
          <div className="text-center py-16">
            <User className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-gray-900 mb-2">No Child Profile Selected</h2>
            <p className="text-gray-600 mb-6">
              Please select a child profile to generate personalized activities.
            </p>
            <motion.button
              onClick={() => window.location.href = '/child-profile'}
              className="bg-gradient-to-r from-blue-600 to-green-600 text-white px-8 py-3 rounded-xl font-semibold hover:shadow-lg transition-all duration-300 flex items-center gap-2 mx-auto"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <Plus className="w-5 h-5" />
              Create Child Profile
            </motion.button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      <div className="w-full">
        {/* Header Section */}
        <motion.div
          className="py-4 border-b border-gray-100"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <div className="flex items-center justify-between px-4">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-gradient-to-r from-purple-600 to-blue-600 rounded-xl flex items-center justify-center">
                <Wand2 className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-semibold text-gray-900">AI Activity Generator</h1>
                <p className="text-sm text-gray-500 mt-1">
                  Create personalized learning activities powered by AI
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              {openAIConnected === true && (
                <div className="flex items-center gap-2 px-3 py-1.5 bg-green-50 border border-green-200 rounded-lg">
                  <CheckCircle className="w-4 h-4 text-green-600" />
                  <span className="text-sm font-medium text-green-700">AI Connected</span>
                </div>
              )}
              {openAIConnected === false && (
                <div className="flex items-center gap-2 px-3 py-1.5 bg-yellow-50 border border-yellow-200 rounded-lg">
                  <AlertCircle className="w-4 h-4 text-yellow-600" />
                  <span className="text-sm font-medium text-yellow-700">AI Unavailable</span>
                </div>
              )}
            </div>
          </div>
        </motion.div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-12">
          {/* Child Profile Card - 3 columns */}
          <motion.div
            className="col-span-12 md:col-span-3 border-r border-b border-gray-200 p-4 bg-gray-50/30"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
          >
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                <User className="w-5 h-5 text-blue-600" />
              </div>
              <h3 className="text-lg font-medium text-gray-900">Child Profile</h3>
            </div>
            {activeChild && (
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  {activeChild.avatar ? (
                    <img src={activeChild.avatar} alt={activeChild.name} className="w-12 h-12 rounded-full object-cover" />
                  ) : (
                    <div className="w-12 h-12 bg-gray-200 rounded-full flex items-center justify-center">
                      <User className="w-6 h-6 text-gray-400" />
                    </div>
                  )}
                  <div>
                    <h4 className="font-semibold text-gray-900">{activeChild.name}</h4>
                    <p className="text-sm text-gray-500">{activeChild.age} years old</p>
                  </div>
                </div>
                <div className="space-y-2">
                  <div>
                    <p className="text-xs text-gray-500 mb-1">Learning Style</p>
                    <p className="text-sm font-medium text-gray-900 capitalize">{activeChild.preferences.learningStyle}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 mb-1">Interests</p>
                    <div className="flex flex-wrap gap-1">
                      {activeChild.interests.slice(0, 3).map((interest, idx) => (
                        <span key={idx} className="px-2 py-0.5 bg-blue-50 text-blue-700 text-xs rounded">
                          {interest}
                        </span>
                      ))}
                      {activeChild.interests.length > 3 && (
                        <span className="px-2 py-0.5 bg-gray-100 text-gray-600 text-xs rounded">
                          +{activeChild.interests.length - 3}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </motion.div>

          {/* Activity Configuration - 9 columns */}
          <div className="col-span-12 md:col-span-9">
            {!generatedActivity ? (
              <div className="grid grid-cols-12">
                {/* Activity Type Selection - 6 columns */}
                <motion.div
                  className="col-span-12 lg:col-span-6 border-r border-b border-gray-200 p-4 bg-gray-50/30"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.2 }}
                >
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                      <Gamepad2 className="w-5 h-5 text-purple-600" />
                    </div>
                    <h3 className="text-lg font-medium text-gray-900">Activity Type</h3>
                  </div>
                  <div className="grid grid-cols-2 gap-3 mb-4">
                    {activityTypes.slice(0, 6).map(type => {
                      const Icon = type.icon;
                      const isSelected = formData.activityType === type.id;
                      return (
                        <motion.button
                          key={type.id}
                          onClick={() => updateFormData('activityType', type.id)}
                          className={`p-3 rounded-lg border-2 transition-all duration-300 text-left ${
                            isSelected
                              ? 'border-purple-500 bg-purple-50'
                              : 'border-gray-200 hover:border-purple-200 bg-white'
                          }`}
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                        >
                          <div className={`w-8 h-8 rounded-lg bg-gradient-to-r ${type.color} flex items-center justify-center mb-2`}>
                            <Icon className="w-4 h-4 text-white" />
                          </div>
                          <h4 className="font-semibold text-sm text-gray-900 mb-0.5">{type.name}</h4>
                          <p className="text-xs text-gray-500">{type.description}</p>
                        </motion.button>
                      );
                    })}
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    {activityTypes.slice(6).map(type => {
                      const Icon = type.icon;
                      const isSelected = formData.activityType === type.id;
                      return (
                        <motion.button
                          key={type.id}
                          onClick={() => updateFormData('activityType', type.id)}
                          className={`p-3 rounded-lg border-2 transition-all duration-300 text-left ${
                            isSelected
                              ? 'border-purple-500 bg-purple-50'
                              : 'border-gray-200 hover:border-purple-200 bg-white'
                          }`}
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                        >
                          <div className={`w-8 h-8 rounded-lg bg-gradient-to-r ${type.color} flex items-center justify-center mb-2`}>
                            <Icon className="w-4 h-4 text-white" />
                          </div>
                          <h4 className="font-semibold text-sm text-gray-900 mb-0.5">{type.name}</h4>
                          <p className="text-xs text-gray-500">{type.description}</p>
                        </motion.button>
                      );
                    })}
                  </div>
                </motion.div>

                {/* Category & Settings - 6 columns */}
                <motion.div
                  className="col-span-12 lg:col-span-6 border-b border-gray-200 p-4 bg-gray-50/30"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.3 }}
                >
                  <div className="space-y-4">
                    <div>
                      <div className="flex items-center gap-3 mb-3">
                        <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                          <Target className="w-5 h-5 text-green-600" />
                        </div>
                        <h3 className="text-lg font-medium text-gray-900">Category</h3>
                      </div>
                      <select
                        value={formData.category || ''}
                        onChange={(e) => updateFormData('category', e.target.value)}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white"
                      >
                        <option value="">Select a category</option>
                        {categories.map(category => (
                          <option key={category} value={category}>{category}</option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <div className="flex items-center gap-3 mb-3">
                        <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
                          <Clock className="w-5 h-5 text-orange-600" />
                        </div>
                        <h3 className="text-lg font-medium text-gray-900">Duration</h3>
                      </div>
                      <div className="space-y-2">
                        <input
                          type="range"
                          min="15"
                          max="90"
                          step="15"
                          value={formData.duration || 30}
                          onChange={(e) => updateFormData('duration', parseInt(e.target.value))}
                          className="w-full"
                        />
                        <div className="flex justify-between text-xs text-gray-500">
                          <span>15 min</span>
                          <span className="font-semibold text-gray-900">{formData.duration || 30} min</span>
                          <span>90 min</span>
                        </div>
                      </div>
                    </div>

                    <div>
                      <div className="flex items-center gap-3 mb-3">
                        <div className="w-10 h-10 bg-cyan-100 rounded-lg flex items-center justify-center">
                          <Home className="w-5 h-5 text-cyan-600" />
                        </div>
                        <h3 className="text-lg font-medium text-gray-900">Environment</h3>
                      </div>
                      <div className="grid grid-cols-3 gap-2">
                        {environments.map(env => {
                          const Icon = env.icon;
                          return (
                            <motion.button
                              key={env.id}
                              onClick={() => updateFormData('environment', env.id)}
                              className={`p-3 rounded-lg border-2 transition-all duration-300 text-center ${
                                formData.environment === env.id
                                  ? 'border-cyan-500 bg-cyan-50'
                                  : 'border-gray-200 hover:border-cyan-200 bg-white'
                              }`}
                              whileHover={{ scale: 1.02 }}
                              whileTap={{ scale: 0.98 }}
                            >
                              <Icon className="w-5 h-5 mx-auto mb-1" />
                              <span className="text-xs font-medium">{env.name}</span>
                            </motion.button>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                </motion.div>

                {/* Methodologies - 6 columns */}
                <motion.div
                  className="col-span-12 lg:col-span-6 border-r border-b border-gray-200 p-4 bg-gray-50/30"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.4 }}
                >
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 bg-indigo-100 rounded-lg flex items-center justify-center">
                      <Brain className="w-5 h-5 text-indigo-600" />
                    </div>
                    <h3 className="text-lg font-medium text-gray-900">Methodologies</h3>
                  </div>
                  <div className="grid grid-cols-1 gap-2 max-h-64 overflow-y-auto">
                    {methodologies.map(method => (
                      <motion.button
                        key={method.id}
                        onClick={() => toggleArrayItem('methodologies', method.id)}
                        className={`p-3 rounded-lg border-2 transition-all duration-300 text-left ${
                          formData.methodologies?.includes(method.id)
                            ? 'border-indigo-500 bg-indigo-50'
                            : 'border-gray-200 hover:border-indigo-200 bg-white'
                        }`}
                        whileHover={{ scale: 1.01 }}
                        whileTap={{ scale: 0.99 }}
                      >
                        <div className="flex items-center justify-between">
                          <h4 className="font-semibold text-sm text-gray-900">{method.name}</h4>
                          {formData.methodologies?.includes(method.id) && (
                            <CheckCircle2 className="w-4 h-4 text-indigo-600" />
                          )}
                        </div>
                        <p className="text-xs text-gray-500 mt-1">{method.description}</p>
                      </motion.button>
                    ))}
                  </div>
                </motion.div>

                {/* Learning Objectives & Materials - 6 columns */}
                <motion.div
                  className="col-span-12 lg:col-span-6 border-b border-gray-200 p-4 bg-gray-50/30"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.5 }}
                >
                  <div className="space-y-4">
                    <div>
                      <div className="flex items-center gap-3 mb-3">
                        <div className="w-10 h-10 bg-yellow-100 rounded-lg flex items-center justify-center">
                          <Lightbulb className="w-5 h-5 text-yellow-600" />
                        </div>
                        <h3 className="text-lg font-medium text-gray-900">Learning Objectives</h3>
                      </div>
                      <textarea
                        value={formData.learningObjectives?.join('\n') || ''}
                        onChange={(e) => updateFormData('learningObjectives', e.target.value.split('\n').filter(obj => obj.trim()))}
                        rows={4}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white"
                        placeholder="Enter learning objectives (one per line)&#10;Example:&#10;Develop fine motor skills&#10;Practice color recognition&#10;Build concentration"
                      />
                    </div>

                    <div>
                      <div className="flex items-center gap-3 mb-3">
                        <div className="w-10 h-10 bg-pink-100 rounded-lg flex items-center justify-center">
                          <FileText className="w-5 h-5 text-pink-600" />
                        </div>
                        <h3 className="text-lg font-medium text-gray-900">Material Constraints</h3>
                      </div>
                      <div className="grid grid-cols-2 gap-2 max-h-40 overflow-y-auto">
                        {materialConstraints.map(constraint => (
                          <label key={constraint} className="flex items-center p-2 rounded-lg hover:bg-gray-50 cursor-pointer">
                            <input
                              type="checkbox"
                              checked={formData.materialConstraints?.includes(constraint) || false}
                              onChange={() => toggleArrayItem('materialConstraints', constraint)}
                              className="rounded border-gray-300 text-purple-600 focus:ring-purple-500"
                            />
                            <span className="ml-2 text-xs text-gray-700">{constraint}</span>
                          </label>
                        ))}
                      </div>
                    </div>
                  </div>
                </motion.div>

                {/* Advanced Options Toggle - 12 columns */}
                <motion.div
                  className="col-span-12 border-b border-gray-200 p-4 bg-gray-50/30"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.6 }}
                >
                  <button
                    onClick={() => setShowAdvancedOptions(!showAdvancedOptions)}
                    className="flex items-center justify-between w-full p-3 rounded-lg hover:bg-white transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center">
                        <Settings className="w-5 h-5 text-gray-600" />
                      </div>
                      <h3 className="text-lg font-medium text-gray-900">Advanced Options</h3>
                    </div>
                    {showAdvancedOptions ? (
                      <ChevronRight className="w-5 h-5 text-gray-400 rotate-90" />
                    ) : (
                      <ChevronRight className="w-5 h-5 text-gray-400" />
                    )}
                  </button>

                  <AnimatePresence>
                    {showAdvancedOptions && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="overflow-hidden mt-4"
                      >
                        <div className="grid grid-cols-2 gap-4 p-4 bg-white rounded-lg border border-gray-200">
                          {[
                            { key: 'includeMultimedia', label: 'Include multimedia suggestions' },
                            { key: 'generateAssessmentRubric', label: 'Generate assessment rubric' },
                            { key: 'generateExtensionActivities', label: 'Create extension activities' },
                            { key: 'generateReflectionPrompts', label: 'Add reflection prompts' },
                            { key: 'createAdaptationGuide', label: 'Create adaptation guide' },
                            { key: 'includeProgressTracking', label: 'Include progress tracking' }
                          ].map(option => (
                            <label key={option.key} className="flex items-center">
                              <input
                                type="checkbox"
                                checked={formData.advancedOptions?.[option.key as keyof typeof formData.advancedOptions] || false}
                                onChange={(e) => updateNestedData('advancedOptions', option.key, e.target.checked)}
                                className="rounded border-gray-300 text-purple-600 focus:ring-purple-500"
                              />
                              <span className="ml-2 text-sm text-gray-700">{option.label}</span>
                            </label>
                          ))}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>

                {/* Generate Button - 12 columns */}
                <motion.div
                  className="col-span-12 p-6 bg-gradient-to-r from-purple-50 to-blue-50 border-b border-gray-200"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.7 }}
                >
                  <div className="max-w-2xl mx-auto text-center">
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
                      disabled={isGenerating || !formData.activityType || !formData.category}
                      className="bg-gradient-to-r from-purple-600 to-blue-600 text-white px-12 py-4 rounded-xl font-semibold hover:shadow-lg transition-all duration-300 flex items-center gap-3 mx-auto disabled:opacity-50 disabled:cursor-not-allowed"
                      whileHover={{ scale: isGenerating ? 1 : 1.02 }}
                      whileTap={{ scale: isGenerating ? 1 : 0.98 }}
                    >
                      {isGenerating ? (
                        <>
                          <Loader2 className="w-5 h-5 animate-spin" />
                          Generating Activity...
                        </>
                      ) : (
                        <>
                          <Sparkles className="w-5 h-5" />
                          Generate Activity with AI
                        </>
                      )}
                    </motion.button>
                  </div>
                </motion.div>
              </div>
            ) : (
              /* Generated Activity Display */
              <motion.div
                className="col-span-12 p-6"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5 }}
              >
                <div className="max-w-4xl mx-auto">
                  {/* Activity Header */}
                  <div className="bg-gradient-to-r from-green-50 to-blue-50 border border-green-200 rounded-xl p-6 mb-6">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-1">
                        <h2 className="text-3xl font-bold text-gray-900 mb-3">{generatedActivity.title}</h2>
                        <p className="text-gray-700 leading-relaxed">{generatedActivity.description}</p>
                      </div>
                      <div className="flex gap-2 ml-4">
                        {saved ? (
                          <div className="bg-green-100 text-green-700 px-4 py-2 rounded-lg font-medium flex items-center gap-2">
                            <CheckCircle className="w-4 h-4" />
                            Saved
                          </div>
                        ) : (
                          <motion.button
                            onClick={handleSaveToLibrary}
                            className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                          >
                            <Save className="w-4 h-4" />
                            Save to Library
                          </motion.button>
                        )}
                      </div>
                    </div>

                    {/* Quick Stats */}
                    <div className="grid grid-cols-4 gap-4 mt-6">
                      <div className="bg-white rounded-lg p-3 text-center">
                        <Clock className="w-5 h-5 text-blue-600 mx-auto mb-1" />
                        <div className="text-sm text-gray-600">Duration</div>
                        <div className="font-semibold text-gray-900">{formData.duration} min</div>
                      </div>
                      <div className="bg-white rounded-lg p-3 text-center">
                        <Target className="w-5 h-5 text-green-600 mx-auto mb-1" />
                        <div className="text-sm text-gray-600">Materials</div>
                        <div className="font-semibold text-gray-900">{generatedActivity.materials.length}</div>
                      </div>
                      <div className="bg-white rounded-lg p-3 text-center">
                        <BookOpen className="w-5 h-5 text-purple-600 mx-auto mb-1" />
                        <div className="text-sm text-gray-600">Steps</div>
                        <div className="font-semibold text-gray-900">{generatedActivity.instructions.length}</div>
                      </div>
                      <div className="bg-white rounded-lg p-3 text-center">
                        <Lightbulb className="w-5 h-5 text-orange-600 mx-auto mb-1" />
                        <div className="text-sm text-gray-600">Objectives</div>
                        <div className="font-semibold text-gray-900">{generatedActivity.learningObjectives.length}</div>
                      </div>
                    </div>
                  </div>

                  {/* Materials Section */}
                  <div className="bg-white border border-gray-200 rounded-xl p-6 mb-6">
                    <h3 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
                      <FileText className="w-5 h-5 text-purple-600" />
                      Materials Needed
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {generatedActivity.materials.map((material, index) => (
                        <div key={index} className="flex items-center gap-3 bg-gray-50 rounded-lg p-3">
                          <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0" />
                          <span className="text-gray-700">{material}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Instructions Section */}
                  <div className="bg-white border border-gray-200 rounded-xl p-6 mb-6">
                    <h3 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
                      <Play className="w-5 h-5 text-blue-600" />
                      Instructions
                    </h3>
                    <div className="space-y-3">
                      {generatedActivity.instructions.map((instruction, index) => (
                        <div key={index} className="flex gap-4 bg-gray-50 rounded-lg p-4">
                          <div className="w-8 h-8 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-sm font-semibold flex-shrink-0">
                            {index + 1}
                          </div>
                          <p className="text-gray-700 flex-1">{instruction}</p>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Learning Objectives */}
                  {generatedActivity.learningObjectives.length > 0 && (
                    <div className="bg-white border border-gray-200 rounded-xl p-6 mb-6">
                      <h3 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
                        <Target className="w-5 h-5 text-green-600" />
                        Learning Objectives
                      </h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                        {generatedActivity.learningObjectives.map((objective, index) => (
                          <div key={index} className="flex items-center gap-2 bg-green-50 rounded-lg p-3">
                            <CheckCircle className="w-4 h-4 text-green-600 flex-shrink-0" />
                            <span className="text-gray-700 text-sm">{objective}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Action Buttons */}
                  <div className="flex flex-wrap gap-3 justify-center">
                    <motion.button
                      onClick={() => {
                        setGeneratedActivity(null);
                        setSaved(false);
                      }}
                      className="bg-gray-100 text-gray-700 px-6 py-3 rounded-lg hover:bg-gray-200 transition-colors flex items-center gap-2"
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      <RefreshCw className="w-4 h-4" />
                      Generate New
                    </motion.button>
                    
                    {saved && (
                      <motion.button
                        onClick={() => window.location.href = '/activity-builder'}
                        className="bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 transition-colors flex items-center gap-2"
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                      >
                        <Play className="w-4 h-4" />
                        View in Library
                      </motion.button>
                    )}
                    
                    <motion.button
                      onClick={() => toast.success('Activity details copied to clipboard!')}
                      className="bg-purple-600 text-white px-6 py-3 rounded-lg hover:bg-purple-700 transition-colors flex items-center gap-2"
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      <Share2 className="w-4 h-4" />
                      Share
                    </motion.button>
                  </div>
                </div>
              </motion.div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AIActivityGenerator;
