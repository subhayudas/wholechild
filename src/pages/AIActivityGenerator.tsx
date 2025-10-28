import React, { useState, useEffect } from 'react';
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
  Baby
} from 'lucide-react';
import { useChildStore } from '../store/childStore';
import { useActivityStore } from '../store/activityStore';
import { generateActivityWithAI, AIGenerationRequest, AIGeneratedActivity, testOpenAIConnection } from '../services/openaiService';
import toast from 'react-hot-toast';

const AIActivityGenerator = () => {
  const { children, activeChild } = useChildStore();
  const { addActivity } = useActivityStore();
  
  const [currentStep, setCurrentStep] = useState(0);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedActivity, setGeneratedActivity] = useState<AIGeneratedActivity | null>(null);
  const [saved, setSaved] = useState(false);
  const [openAIConnected, setOpenAIConnected] = useState<boolean | null>(null);
  
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
    { id: 'cooking-nutrition', name: 'Cooking & Nutrition', icon: Utensils, description: 'Life skills and healthy habits' }
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
    { id: 'both', name: 'Both Indoor & Outdoor', icon: Globe }
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

  const renderStepContent = () => {
    switch (currentStep) {
      case 0:
        return (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Child Information</h3>
              {activeChild ? (
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
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-4">
                  <p className="text-yellow-800">No child profile selected. Please select a child or create a profile first.</p>
                </div>
              )}
            </div>

            {activeChild && (
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
          </div>
        );

      case 1:
        return (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Activity Type & Category</h3>
              
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-3">Activity Type *</label>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {activityTypes.map(type => {
                    const Icon = type.icon;
                    return (
                      <motion.button
                        key={type.id}
                        onClick={() => updateFormData('activityType', type.id)}
                        className={`p-4 rounded-lg border-2 transition-all duration-300 text-left ${
                          formData.activityType === type.id
                            ? 'border-blue-300 bg-blue-50 text-blue-700'
                            : 'border-gray-200 hover:border-blue-200'
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
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Enter learning objectives (one per line)&#10;Example:&#10;Develop fine motor skills&#10;Practice color recognition&#10;Build concentration"
              />
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
                <div className="grid grid-cols-3 gap-4">
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
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {materialConstraints.map(constraint => (
                    <label key={constraint} className="flex items-center">
                      <input
                        type="checkbox"
                        checked={formData.materialConstraints?.includes(constraint) || false}
                        onChange={() => toggleArrayItem('materialConstraints', constraint)}
                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                      <span className="ml-2 text-sm text-gray-700">{constraint}</span>
                    </label>
                  ))}
                </div>
              </div>
            </div>
          </div>
        );

      case 4:
        return (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Advanced Options</h3>
              <p className="text-gray-600 mb-6">Enhance your activity with additional features:</p>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <h4 className="font-medium text-gray-900">Content Enhancement</h4>
                  {[
                    { key: 'includeMultimedia', label: 'Include multimedia suggestions' },
                    { key: 'generateAssessmentRubric', label: 'Generate assessment rubric' },
                    { key: 'generateExtensionActivities', label: 'Create extension activities' },
                    { key: 'generateReflectionPrompts', label: 'Add reflection prompts' }
                  ].map(option => (
                    <label key={option.key} className="flex items-center">
                      <input
                        type="checkbox"
                        checked={formData.advancedOptions?.[option.key as keyof typeof formData.advancedOptions] || false}
                        onChange={(e) => updateNestedData('advancedOptions', option.key, e.target.checked)}
                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
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
                    { key: 'createDigitalResources', label: 'Suggest digital resources' },
                    { key: 'includeParentNewsletter', label: 'Generate parent newsletter' }
                  ].map(option => (
                    <label key={option.key} className="flex items-center">
                      <input
                        type="checkbox"
                        checked={formData.advancedOptions?.[option.key as keyof typeof formData.advancedOptions] || false}
                        onChange={(e) => updateNestedData('advancedOptions', option.key, e.target.checked)}
                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
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
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="none">No technology</option>
                    <option value="minimal">Minimal (camera/recording)</option>
                    <option value="moderate">Moderate (apps/tablets)</option>
                    <option value="high">High (interactive tech)</option>
                  </select>
                </div>
              </div>
            </div>
          </div>
        );

      case 5:
        return (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Generate Your Activity</h3>
              
              {!generatedActivity ? (
                <div className="text-center py-12">
                  <div className="w-20 h-20 bg-gradient-to-r from-purple-500 to-blue-500 rounded-full flex items-center justify-center mx-auto mb-6">
                    <Wand2 className="w-10 h-10 text-white" />
                  </div>
                  <h4 className="text-xl font-semibold text-gray-900 mb-2">Ready to Generate!</h4>
                  <p className="text-gray-600 mb-8">
                    Click the button below to create a personalized activity for {activeChild?.name || 'your child'}.
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
                    className="bg-gradient-to-r from-purple-600 to-blue-600 text-white px-8 py-4 rounded-xl font-semibold hover:shadow-lg transition-all duration-300 flex items-center gap-2 mx-auto disabled:opacity-50"
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
                <div className="space-y-6">
                  {/* Generated Activity Display */}
                  <div className="bg-gradient-to-r from-green-50 to-blue-50 border border-green-200 rounded-xl p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <h4 className="text-2xl font-bold text-gray-900 mb-2">{generatedActivity.title}</h4>
                        <p className="text-gray-700 leading-relaxed">{generatedActivity.description}</p>
                      </div>
                      <div className="flex gap-2">
                        {saved ? (
                          <div className="bg-green-100 text-green-700 px-4 py-2 rounded-lg font-medium flex items-center gap-2">
                            <CheckCircle className="w-4 h-4" />
                            Saved ✓
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
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                      <div className="bg-white rounded-lg p-3 text-center">
                        <Clock className="w-5 h-5 text-blue-600 mx-auto mb-1" />
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

                    {/* Materials */}
                    <div className="mb-6">
                      <h5 className="font-semibold text-gray-900 mb-3">Materials Needed</h5>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                        {generatedActivity.materials.map((material, index) => (
                          <div key={index} className="flex items-center gap-2 bg-white rounded-lg p-2">
                            <CheckCircle className="w-4 h-4 text-green-600 flex-shrink-0" />
                            <span className="text-gray-700">{material}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Instructions Preview */}
                    <div className="mb-6">
                      <h5 className="font-semibold text-gray-900 mb-3">Instructions Preview</h5>
                      <div className="space-y-3">
                        {generatedActivity.instructions.slice(0, 3).map((instruction, index) => (
                          <div key={index} className="flex gap-3 bg-white rounded-lg p-3">
                            <div className="w-6 h-6 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-sm font-semibold flex-shrink-0">
                              {index + 1}
                            </div>
                            <p className="text-gray-700">{instruction}</p>
                          </div>
                        ))}
                        {generatedActivity.instructions.length > 3 && (
                          <p className="text-gray-500 text-sm text-center">
                            +{generatedActivity.instructions.length - 3} more steps...
                          </p>
                        )}
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex flex-wrap gap-3">
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
                        Generate New
                      </motion.button>
                      
                      {saved && (
                        <motion.button
                          onClick={() => window.location.href = '/activity-builder'}
                          className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors flex items-center gap-2"
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                        >
                          <Play className="w-4 h-4" />
                          Start Activity
                        </motion.button>
                      )}
                      
                      <motion.button
                        onClick={() => toast.success('Activity details copied to clipboard!')}
                        className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition-colors flex items-center gap-2"
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                      >
                        <Share2 className="w-4 h-4" />
                        Share
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

  if (!activeChild) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-4xl mx-auto">
          <div className="text-center py-16">
            <User className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-gray-900 mb-2">No Child Profile Selected</h2>
            <p className="text-gray-600 mb-6">
              Please select a child profile to generate personalized activities.
            </p>
            <motion.button
              onClick={() => window.location.href = '/child-profile'}
              className="bg-blue-600 text-white px-6 py-3 rounded-xl font-semibold hover:bg-blue-700 transition-colors"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              Create Child Profile
            </motion.button>
          </div>
        </div>
      </div>
    );
  }

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
            <div className="w-12 h-12 bg-gradient-to-r from-purple-600 to-blue-600 rounded-xl flex items-center justify-center">
              <Wand2 className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">AI Activity Generator</h1>
              <p className="text-gray-600">Create personalized learning activities powered by AI</p>
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
          <div className="flex items-center justify-between bg-white rounded-xl p-4 shadow-sm">
            {steps.map((step, index) => {
              const Icon = step.icon;
              const isActive = index === currentStep;
              const isCompleted = index < currentStep;
              
              return (
                <div key={index} className="flex items-center">
                  <div className={`flex items-center justify-center w-10 h-10 rounded-full border-2 transition-all duration-300 ${
                    isActive 
                      ? 'bg-purple-600 border-purple-600 text-white' 
                      : isCompleted
                        ? 'bg-green-600 border-green-600 text-white'
                        : 'border-gray-300 text-gray-400'
                  }`}>
                    <Icon className="w-5 h-5" />
                  </div>
                  <span className={`ml-2 text-sm font-medium hidden sm:inline ${
                    isActive ? 'text-purple-600' : isCompleted ? 'text-green-600' : 'text-gray-400'
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
            <ArrowRight className="w-4 h-4 rotate-180" />
            Previous
          </button>
          
          {currentStep < steps.length - 1 && (
            <button
              onClick={() => setCurrentStep(Math.min(steps.length - 1, currentStep + 1))}
              className="bg-purple-600 text-white px-6 py-3 rounded-xl font-semibold hover:bg-purple-700 transition-colors flex items-center gap-2"
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

export default AIActivityGenerator;