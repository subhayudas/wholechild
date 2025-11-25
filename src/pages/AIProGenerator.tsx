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
  ChevronDown,
  ChevronUp,
  BarChart,
  PieChart,
  Clipboard,
  Trash2,
  Edit3,
  Copy,
  Maximize2,
  Minimize2
} from 'lucide-react';
import { useChildStore } from '../store/childStore';
import { useActivityStore } from '../store/activityStore';
import { generateActivityWithAI, AIGenerationRequest, AIGeneratedActivity, testOpenAIConnection } from '../services/openaiService';
import { categories, methodologies } from '../config/activityConfig';
import toast from 'react-hot-toast';

const AIProGenerator = () => {
  const { children, activeChild } = useChildStore();
  const { addActivity } = useActivityStore();
  
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedActivity, setGeneratedActivity] = useState<AIGeneratedActivity | null>(null);
  const [saved, setSaved] = useState(false);
  const [openAIConnected, setOpenAIConnected] = useState<boolean | null>(null);
  const [expandedSection, setExpandedSection] = useState<string | null>(null);
  const [showAdvancedOptions, setShowAdvancedOptions] = useState(false);
  
  // Additional detailed input states
  const [detailedLearningObjectives, setDetailedLearningObjectives] = useState<Array<{objective: string, description: string}>>([{objective: '', description: ''}]);
  const [childContext, setChildContext] = useState({
    currentSkills: '',
    whatWorks: '',
    challenges: '',
    recentObservations: ''
  });
  const [materialDetails, setMaterialDetails] = useState({
    availableMaterials: '',
    materialConstraints: '',
    budgetNotes: ''
  });
  const [spaceConstraints, setSpaceConstraints] = useState({
    availableSpace: '',
    spaceLimitations: ''
  });
  const [therapyDetails, setTherapyDetails] = useState({
    speechDetails: '',
    otDetails: ''
  });
  const [additionalContext, setAdditionalContext] = useState('');
  
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
      culturalConsiderations: [],
      technologyIntegration: 'none',
      assessmentType: 'observational',
      parentInvolvement: 'moderate',
      groupSize: 'small',
      difficultyLevel: 'age-appropriate',
      timeOfDay: 'any',
      weatherConsiderations: 'any',
      budgetConstraint: 'low',
      safetyLevel: 'high'
    }
  });

  // Test OpenAI connection on component mount
  useEffect(() => {
    const testConnection = async () => {
      try {
        const connected = await testOpenAIConnection();
        setOpenAIConnected(connected);
      } catch (error: any) {
        console.error('Failed to test OpenAI connection:', error);
        setOpenAIConnected(false);
      }
    };
    testConnection();
  }, []);

  const handleGenerate = async () => {
    if (!formData.activityType || !formData.category) {
      toast.error('Please select activity type and category');
      return;
    }

    setIsGenerating(true);
    try {
      // Build enhanced request with detailed inputs
      const enhancedRequest: AIGenerationRequest = {
        ...formData as AIGenerationRequest,
        // Include detailed learning objectives
        learningObjectives: detailedLearningObjectives
          .filter(obj => obj.objective.trim() !== '')
          .map(obj => obj.description.trim() !== '' 
            ? `${obj.objective}: ${obj.description}` 
            : obj.objective),
        // Add detailed context to material constraints
        materialConstraints: [
          ...(formData.materialConstraints || []),
          ...(materialDetails.availableMaterials.trim() ? [`Available materials: ${materialDetails.availableMaterials}`] : []),
          ...(materialDetails.materialConstraints.trim() ? [`Constraints: ${materialDetails.materialConstraints}`] : []),
          ...(materialDetails.budgetNotes.trim() ? [`Budget notes: ${materialDetails.budgetNotes}`] : []),
          ...(spaceConstraints.availableSpace.trim() ? [`Available space: ${spaceConstraints.availableSpace}`] : []),
          ...(spaceConstraints.spaceLimitations.trim() ? [`Space limitations: ${spaceConstraints.spaceLimitations}`] : [])
        ],
        // Add detailed therapy targets
        therapyTargets: {
          speech: [
            ...(formData.therapyTargets?.speech || []),
            ...(therapyDetails.speechDetails.trim() ? [therapyDetails.speechDetails] : [])
          ],
          ot: [
            ...(formData.therapyTargets?.ot || []),
            ...(therapyDetails.otDetails.trim() ? [therapyDetails.otDetails] : [])
          ]
        },
        // Add child context to adaptation needs
        adaptationNeeds: [
          ...(formData.adaptationNeeds || []),
          ...(childContext.currentSkills.trim() ? [`Current skills: ${childContext.currentSkills}`] : []),
          ...(childContext.whatWorks.trim() ? [`What works well: ${childContext.whatWorks}`] : []),
          ...(childContext.challenges.trim() ? [`Challenges: ${childContext.challenges}`] : []),
          ...(childContext.recentObservations.trim() ? [`Recent observations: ${childContext.recentObservations}`] : []),
          ...(additionalContext.trim() ? [`Additional context: ${additionalContext}`] : [])
        ]
      };

      const activity = await generateActivityWithAI(enhancedRequest);
      setGeneratedActivity(activity);
      toast.success('Activity generated successfully!');
    } catch (error) {
      console.error('Error generating activity:', error);
      toast.error('Failed to generate activity. Please try again.');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSaveToLibrary = async () => {
    if (!generatedActivity) return;
    
    // Validate category is selected
    if (!formData.category || formData.category.trim() === '') {
      toast.error('Please select a category before saving');
      return;
    }
    
    try {
      await addActivity({
        title: generatedActivity.title,
        description: generatedActivity.description,
        methodologies: formData.methodologies as any || [],
        ageRange: [formData.childProfile?.age || 3, (formData.childProfile?.age || 3) + 2] as [number, number],
        duration: formData.duration || 30,
        materials: generatedActivity.materials,
        instructions: generatedActivity.instructions,
        learningObjectives: generatedActivity.learningObjectives,
        developmentalAreas: generatedActivity.developmentalAreas || [],
        speechTargets: generatedActivity.speechTargets || [],
        otTargets: generatedActivity.otTargets || [],
        difficulty: 3 as const,
        category: formData.category,
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
      });
      setSaved(true);
      toast.success('Activity saved to library!');
    } catch (error: any) {
      console.error('Error saving activity:', error);
      toast.error(error?.message || 'Failed to save activity');
    }
  };

  const toggleExpandSection = (section: string) => {
    setExpandedSection(expandedSection === section ? null : section);
  };

  const activityTypes = [
    { value: 'creative', label: 'Creative Arts', icon: Palette, color: 'from-pink-500 to-rose-500' },
    { value: 'stem', label: 'STEM Learning', icon: Calculator, color: 'from-blue-500 to-indigo-500' },
    { value: 'physical', label: 'Physical Activity', icon: Zap, color: 'from-green-500 to-emerald-500' },
    { value: 'social', label: 'Social Skills', icon: Users, color: 'from-purple-500 to-violet-500' },
    { value: 'language', label: 'Language Development', icon: BookOpen, color: 'from-orange-500 to-amber-500' },
    { value: 'sensory', label: 'Sensory Play', icon: Hand, color: 'from-teal-500 to-cyan-500' }
  ];

  // Categories and methodologies imported from centralized config

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
              <div className="w-12 h-12 bg-gradient-to-r from-indigo-600 to-purple-600 rounded-xl flex items-center justify-center">
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
              {openAIConnected !== null && (
                <div className={`flex items-center gap-2 px-3 py-1 rounded-full text-xs font-medium ${
                  openAIConnected 
                    ? 'bg-green-100 text-green-700' 
                    : 'bg-red-100 text-red-700'
                }`}>
                  <div className={`w-2 h-2 rounded-full ${
                    openAIConnected ? 'bg-green-500' : 'bg-red-500'
                  }`}></div>
                  {openAIConnected ? 'AI Connected' : 'AI Disconnected'}
                </div>
              )}
              
              <motion.button
                onClick={() => setShowAdvancedOptions(!showAdvancedOptions)}
                className="px-4 py-2 bg-gray-100 text-gray-700 hover:bg-gray-200 transition-colors flex items-center gap-2"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <Settings className="w-4 h-4" />
                Advanced
              </motion.button>
            </div>
          </div>
        </motion.div>

        {/* Child Selector */}
        {children.length > 0 && (
          <motion.div
            className="py-3 border-b border-gray-100"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
          >
            <div className="flex gap-2 overflow-x-auto px-4">
              {children.map((child) => (
                <button
                  key={child.id}
                  onClick={() => {
                    setFormData(prev => ({
                      ...prev,
                      childProfile: {
                        name: child.name,
                        age: child.age,
                        interests: child.interests,
                        learningStyle: child.preferences.learningStyle,
                        energyLevel: child.preferences.energyLevel,
                        socialPreference: child.preferences.socialPreference,
                        sensoryNeeds: child.sensoryNeeds,
                        speechGoals: child.speechGoals,
                        otGoals: child.otGoals,
                        developmentalAreas: []
                      }
                    }));
                  }}
                  className={`flex items-center gap-2 px-3 py-2 text-sm transition-all duration-200 whitespace-nowrap ${
                    formData.childProfile?.name === child.name
                      ? 'text-gray-900 border-b-2 border-gray-900'
                      : 'text-gray-500 hover:text-gray-700'
                  }`}
                >
                  {child.avatar && (
                    <img 
                      src={child.avatar} 
                      alt={child.name}
                      className="w-6 h-6 rounded-full object-cover"
                    />
                  )}
                  <span>{child.name}</span>
                </button>
              ))}
            </div>
          </motion.div>
        )}

        {/* Main Content Grid */}
        <div className="grid grid-cols-12 h-full">
          
          {/* Configuration Panel - Left Side */}
          <motion.div
            className="col-span-5 border-r border-gray-200 p-4 bg-gray-50/30 overflow-y-auto"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            style={{ maxHeight: 'calc(100vh - 120px)' }}
          >
            <div className="space-y-6">
              
              {/* Activity Type Selection */}
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-4">Activity Type</h3>
                <div className="grid grid-cols-2 gap-3">
                  {activityTypes.map((type) => {
                    const IconComponent = type.icon;
                    return (
                      <motion.button
                        key={type.value}
                        onClick={() => setFormData(prev => ({ ...prev, activityType: type.value }))}
                        className={`p-4 rounded-lg border-2 transition-all duration-200 ${
                          formData.activityType === type.value
                            ? 'border-indigo-500 bg-indigo-50'
                            : 'border-gray-200 hover:border-gray-300 bg-white'
                        }`}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                      >
                        <div className={`w-8 h-8 rounded-lg bg-gradient-to-r ${type.color} flex items-center justify-center mb-2 mx-auto`}>
                          <IconComponent className="w-4 h-4 text-white" />
                        </div>
                        <div className="text-sm font-medium text-gray-900">{type.label}</div>
                      </motion.button>
                    );
                  })}
                </div>
              </div>

              {/* Category Selection */}
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-4">Category</h3>
                <select
                  value={formData.category || ''}
                  onChange={(e) => setFormData(prev => ({ ...prev, category: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                >
                  <option value="">Select a category</option>
                  {categories.map((category) => (
                    <option key={category} value={category}>{category}</option>
                  ))}
                </select>
              </div>

              {/* Duration */}
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-4">Duration</h3>
                <div className="flex items-center gap-4">
                  <input
                    type="range"
                    min="15"
                    max="120"
                    step="15"
                    value={formData.duration || 30}
                    onChange={(e) => setFormData(prev => ({ ...prev, duration: parseInt(e.target.value) }))}
                    className="flex-1"
                  />
                  <div className="bg-indigo-100 text-indigo-700 px-3 py-1 rounded-lg font-medium min-w-[80px] text-center">
                    {formData.duration || 30} min
                  </div>
                </div>
              </div>

              {/* Environment */}
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-4">Environment</h3>
                <div className="grid grid-cols-3 gap-2">
                  {['indoor', 'outdoor', 'both'].map((env) => (
                    <button
                      key={env}
                      onClick={() => setFormData(prev => ({ ...prev, environment: env }))}
                      className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                        formData.environment === env
                          ? 'bg-indigo-600 text-white'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      {env.charAt(0).toUpperCase() + env.slice(1)}
                    </button>
                  ))}
                </div>
              </div>

              {/* Methodologies */}
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-4">Teaching Methodologies</h3>
                <div className="space-y-2">
                  {methodologies.map((method) => (
                    <label key={method.value} className="flex items-start gap-3 p-3 bg-white rounded-lg border border-gray-200 hover:border-gray-300 transition-colors cursor-pointer">
                      <input
                        type="checkbox"
                        checked={formData.methodologies?.includes(method.value) || false}
                        onChange={(e) => {
                          const methodologies = formData.methodologies || [];
                          if (e.target.checked) {
                            setFormData(prev => ({
                              ...prev,
                              methodologies: [...methodologies, method.value]
                            }));
                          } else {
                            setFormData(prev => ({
                              ...prev,
                              methodologies: methodologies.filter(m => m !== method.value)
                            }));
                          }
                        }}
                        className="mt-1 text-indigo-600 focus:ring-indigo-500"
                      />
                      <div>
                        <div className="font-medium text-gray-900">{method.label}</div>
                        <div className="text-sm text-gray-500">{method.description}</div>
                      </div>
                    </label>
                  ))}
                </div>
              </div>

              {/* Detailed Learning Objectives */}
              <div className="border-t border-gray-200 pt-6">
                <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center gap-2">
                  <Target className="w-5 h-5 text-indigo-600" />
                  Learning Objectives
                </h3>
                <p className="text-sm text-gray-600 mb-4">Specify what you want the child to learn or achieve through this activity</p>
                <div className="space-y-3">
                  {detailedLearningObjectives.map((obj, index) => (
                    <div key={index} className="bg-white rounded-lg border border-gray-200 p-3 space-y-2">
                      <input
                        type="text"
                        placeholder="Learning objective (e.g., 'Develop fine motor skills')"
                        value={obj.objective}
                        onChange={(e) => {
                          const updated = [...detailedLearningObjectives];
                          updated[index].objective = e.target.value;
                          setDetailedLearningObjectives(updated);
                        }}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-sm"
                      />
                      <textarea
                        placeholder="Describe in detail what this means and why it's important..."
                        value={obj.description}
                        onChange={(e) => {
                          const updated = [...detailedLearningObjectives];
                          updated[index].description = e.target.value;
                          setDetailedLearningObjectives(updated);
                        }}
                        rows={2}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-sm"
                      />
                      {detailedLearningObjectives.length > 1 && (
                        <button
                          onClick={() => setDetailedLearningObjectives(detailedLearningObjectives.filter((_, i) => i !== index))}
                          className="text-red-600 hover:text-red-700 text-sm flex items-center gap-1"
                        >
                          <X className="w-4 h-4" />
                          Remove
                        </button>
                      )}
                    </div>
                  ))}
                  <button
                    onClick={() => setDetailedLearningObjectives([...detailedLearningObjectives, {objective: '', description: ''}])}
                    className="w-full py-2 border-2 border-dashed border-gray-300 rounded-lg text-gray-600 hover:border-indigo-500 hover:text-indigo-600 transition-colors flex items-center justify-center gap-2 text-sm"
                  >
                    <Plus className="w-4 h-4" />
                    Add Another Objective
                  </button>
                </div>
              </div>

              {/* Child Context */}
              <div className="border-t border-gray-200 pt-6">
                <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center gap-2">
                  <User className="w-5 h-5 text-indigo-600" />
                  Child Context & Background
                </h3>
                <p className="text-sm text-gray-600 mb-4">Provide details about the child's current abilities, preferences, and experiences</p>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Current Skills & Abilities</label>
                    <textarea
                      placeholder="What can the child currently do? What skills have they mastered? (e.g., 'Can count to 20, recognizes letters A-F, enjoys building with blocks')"
                      value={childContext.currentSkills}
                      onChange={(e) => setChildContext(prev => ({ ...prev, currentSkills: e.target.value }))}
                      rows={3}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">What Works Well</label>
                    <textarea
                      placeholder="What activities, approaches, or strategies have been successful with this child? (e.g., 'Responds well to visual schedules, loves hands-on activities, needs movement breaks')"
                      value={childContext.whatWorks}
                      onChange={(e) => setChildContext(prev => ({ ...prev, whatWorks: e.target.value }))}
                      rows={3}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Current Challenges</label>
                    <textarea
                      placeholder="What areas need support? What difficulties has the child been experiencing? (e.g., 'Struggles with transitions, difficulty with fine motor tasks, needs support with social interactions')"
                      value={childContext.challenges}
                      onChange={(e) => setChildContext(prev => ({ ...prev, challenges: e.target.value }))}
                      rows={3}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Recent Observations</label>
                    <textarea
                      placeholder="Any recent observations or notes about the child's behavior, interests, or development? (e.g., 'Recently showed interest in dinosaurs, has been more verbal this week, enjoys helping with tasks')"
                      value={childContext.recentObservations}
                      onChange={(e) => setChildContext(prev => ({ ...prev, recentObservations: e.target.value }))}
                      rows={3}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-sm"
                    />
                  </div>
                </div>
              </div>

              {/* Materials & Constraints */}
              <div className="border-t border-gray-200 pt-6">
                <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center gap-2">
                  <Layers className="w-5 h-5 text-indigo-600" />
                  Materials & Constraints
                </h3>
                <p className="text-sm text-gray-600 mb-4">Specify available materials, constraints, and space considerations</p>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Available Materials</label>
                    <textarea
                      placeholder="What materials do you have available? Be specific. (e.g., 'Construction paper, markers, glue, scissors, cardboard boxes, playdough, wooden blocks')"
                      value={materialDetails.availableMaterials}
                      onChange={(e) => setMaterialDetails(prev => ({ ...prev, availableMaterials: e.target.value }))}
                      rows={3}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Material Constraints</label>
                    <textarea
                      placeholder="Any limitations or restrictions? (e.g., 'No access to printer, prefer reusable materials, need items that are easy to clean')"
                      value={materialDetails.materialConstraints}
                      onChange={(e) => setMaterialDetails(prev => ({ ...prev, materialConstraints: e.target.value }))}
                      rows={2}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Budget Notes</label>
                    <textarea
                      placeholder="Budget considerations or preferences (e.g., 'Prefer low-cost options, can spend up to $20, need free alternatives')"
                      value={materialDetails.budgetNotes}
                      onChange={(e) => setMaterialDetails(prev => ({ ...prev, budgetNotes: e.target.value }))}
                      rows={2}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Available Space</label>
                    <textarea
                      placeholder="Describe the space where the activity will take place (e.g., 'Small living room, kitchen table, outdoor patio, classroom with 4 tables')"
                      value={spaceConstraints.availableSpace}
                      onChange={(e) => setSpaceConstraints(prev => ({ ...prev, availableSpace: e.target.value }))}
                      rows={2}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Space Limitations</label>
                    <textarea
                      placeholder="Any space-related constraints? (e.g., 'Limited floor space, need quiet activity, must be contained to table')"
                      value={spaceConstraints.spaceLimitations}
                      onChange={(e) => setSpaceConstraints(prev => ({ ...prev, spaceLimitations: e.target.value }))}
                      rows={2}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-sm"
                    />
                  </div>
                </div>
              </div>

              {/* Therapy Details */}
              {(formData.childProfile?.speechGoals?.length > 0 || formData.childProfile?.otGoals?.length > 0 || formData.therapyTargets?.speech?.length > 0 || formData.therapyTargets?.ot?.length > 0) && (
                <div className="border-t border-gray-200 pt-6">
                  <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center gap-2">
                    <Heart className="w-5 h-5 text-indigo-600" />
                    Therapy Goals & Details
                  </h3>
                  <p className="text-sm text-gray-600 mb-4">Provide specific details about therapy targets and goals</p>
                  <div className="space-y-4">
                    {(formData.childProfile?.speechGoals?.length > 0 || formData.therapyTargets?.speech?.length > 0) && (
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Speech & Language Details</label>
                        <textarea
                          placeholder="Provide specific details about speech/language goals, current abilities, and what you'd like to target (e.g., 'Working on /s/ sound in initial position, expanding vocabulary with action words, improving sentence length to 4-5 words')"
                          value={therapyDetails.speechDetails}
                          onChange={(e) => setTherapyDetails(prev => ({ ...prev, speechDetails: e.target.value }))}
                          rows={3}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-sm"
                        />
                      </div>
                    )}
                    {(formData.childProfile?.otGoals?.length > 0 || formData.therapyTargets?.ot?.length > 0) && (
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Occupational Therapy Details</label>
                        <textarea
                          placeholder="Provide specific details about OT goals, current abilities, and what you'd like to target (e.g., 'Improving pencil grip, working on bilateral coordination, developing hand strength, sensory regulation strategies')"
                          value={therapyDetails.otDetails}
                          onChange={(e) => setTherapyDetails(prev => ({ ...prev, otDetails: e.target.value }))}
                          rows={3}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-sm"
                        />
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Additional Context */}
              <div className="border-t border-gray-200 pt-6">
                <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center gap-2">
                  <FileText className="w-5 h-5 text-indigo-600" />
                  Additional Context & Notes
                </h3>
                <p className="text-sm text-gray-600 mb-4">Any other important information, preferences, or context that would help create a better activity</p>
                <textarea
                  placeholder="Add any additional context, special considerations, cultural preferences, family values, or other details that would help personalize this activity..."
                  value={additionalContext}
                  onChange={(e) => setAdditionalContext(e.target.value)}
                  rows={4}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-sm"
                />
              </div>

              {/* Advanced Options */}
              <AnimatePresence>
                {showAdvancedOptions && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="space-y-4"
                  >
                    <h3 className="text-lg font-medium text-gray-900">Advanced Options</h3>
                    
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Group Size</label>
                        <select
                          value={formData.advancedOptions?.groupSize || 'small'}
                          onChange={(e) => setFormData(prev => ({
                            ...prev,
                            advancedOptions: { ...prev.advancedOptions, groupSize: e.target.value }
                          }))}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                        >
                          <option value="individual">Individual</option>
                          <option value="small">Small Group (2-4)</option>
                          <option value="medium">Medium Group (5-8)</option>
                          <option value="large">Large Group (9+)</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Difficulty Level</label>
                        <select
                          value={formData.advancedOptions?.difficultyLevel || 'age-appropriate'}
                          onChange={(e) => setFormData(prev => ({
                            ...prev,
                            advancedOptions: { ...prev.advancedOptions, difficultyLevel: e.target.value }
                          }))}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                        >
                          <option value="below-age">Below Age Level</option>
                          <option value="age-appropriate">Age Appropriate</option>
                          <option value="above-age">Above Age Level</option>
                          <option value="adaptive">Adaptive</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Time of Day</label>
                        <select
                          value={formData.advancedOptions?.timeOfDay || 'any'}
                          onChange={(e) => setFormData(prev => ({
                            ...prev,
                            advancedOptions: { ...prev.advancedOptions, timeOfDay: e.target.value }
                          }))}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                        >
                          <option value="any">Any Time</option>
                          <option value="morning">Morning</option>
                          <option value="afternoon">Afternoon</option>
                          <option value="evening">Evening</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Parent Involvement</label>
                        <select
                          value={formData.advancedOptions?.parentInvolvement || 'moderate'}
                          onChange={(e) => setFormData(prev => ({
                            ...prev,
                            advancedOptions: { ...prev.advancedOptions, parentInvolvement: e.target.value }
                          }))}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                        >
                          <option value="minimal">Minimal (Child-led)</option>
                          <option value="moderate">Moderate (Guided)</option>
                          <option value="high">High (Collaborative)</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Technology Integration</label>
                        <select
                          value={formData.advancedOptions?.technologyIntegration || 'none'}
                          onChange={(e) => setFormData(prev => ({
                            ...prev,
                            advancedOptions: { ...prev.advancedOptions, technologyIntegration: e.target.value }
                          }))}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                        >
                          <option value="none">None</option>
                          <option value="optional">Optional</option>
                          <option value="integrated">Integrated</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Assessment Type</label>
                        <select
                          value={formData.advancedOptions?.assessmentType || 'observational'}
                          onChange={(e) => setFormData(prev => ({
                            ...prev,
                            advancedOptions: { ...prev.advancedOptions, assessmentType: e.target.value }
                          }))}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                        >
                          <option value="observational">Observational</option>
                          <option value="checklist">Checklist</option>
                          <option value="rubric">Rubric</option>
                          <option value="portfolio">Portfolio</option>
                        </select>
                      </div>
                    </div>

                    <div className="pt-4 border-t border-gray-200">
                      <h4 className="text-sm font-medium text-gray-900 mb-3">Additional Options</h4>
                      <div className="space-y-2">
                        <label className="flex items-start gap-3 p-3 bg-white rounded-lg border border-gray-200 hover:border-gray-300 transition-colors cursor-pointer">
                          <input
                            type="checkbox"
                            checked={formData.advancedOptions?.generateExtensionActivities || false}
                            onChange={(e) => setFormData(prev => ({
                              ...prev,
                              advancedOptions: { ...prev.advancedOptions, generateExtensionActivities: e.target.checked }
                            }))}
                            className="mt-1 text-indigo-600 focus:ring-indigo-500"
                          />
                          <div>
                            <div className="font-medium text-gray-900 text-sm">Generate Extension Activities</div>
                            <div className="text-xs text-gray-500">Create follow-up activities that build on this one</div>
                          </div>
                        </label>
                        <label className="flex items-start gap-3 p-3 bg-white rounded-lg border border-gray-200 hover:border-gray-300 transition-colors cursor-pointer">
                          <input
                            type="checkbox"
                            checked={formData.advancedOptions?.generateAssessmentRubric || false}
                            onChange={(e) => setFormData(prev => ({
                              ...prev,
                              advancedOptions: { ...prev.advancedOptions, generateAssessmentRubric: e.target.checked }
                            }))}
                            className="mt-1 text-indigo-600 focus:ring-indigo-500"
                          />
                          <div>
                            <div className="font-medium text-gray-900 text-sm">Generate Assessment Rubric</div>
                            <div className="text-xs text-gray-500">Create a detailed rubric for evaluating progress</div>
                          </div>
                        </label>
                        <label className="flex items-start gap-3 p-3 bg-white rounded-lg border border-gray-200 hover:border-gray-300 transition-colors cursor-pointer">
                          <input
                            type="checkbox"
                            checked={formData.advancedOptions?.generateReflectionPrompts || false}
                            onChange={(e) => setFormData(prev => ({
                              ...prev,
                              advancedOptions: { ...prev.advancedOptions, generateReflectionPrompts: e.target.checked }
                            }))}
                            className="mt-1 text-indigo-600 focus:ring-indigo-500"
                          />
                          <div>
                            <div className="font-medium text-gray-900 text-sm">Generate Reflection Prompts</div>
                            <div className="text-xs text-gray-500">Include questions for child, parent, and educator reflection</div>
                          </div>
                        </label>
                        <label className="flex items-start gap-3 p-3 bg-white rounded-lg border border-gray-200 hover:border-gray-300 transition-colors cursor-pointer">
                          <input
                            type="checkbox"
                            checked={formData.advancedOptions?.includeMultimedia || false}
                            onChange={(e) => setFormData(prev => ({
                              ...prev,
                              advancedOptions: { ...prev.advancedOptions, includeMultimedia: e.target.checked }
                            }))}
                            className="mt-1 text-indigo-600 focus:ring-indigo-500"
                          />
                          <div>
                            <div className="font-medium text-gray-900 text-sm">Include Multimedia Suggestions</div>
                            <div className="text-xs text-gray-500">Suggest photos, videos, and audio elements</div>
                          </div>
                        </label>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Generate Button */}
              <motion.button
                onClick={handleGenerate}
                disabled={isGenerating || !formData.activityType || !formData.category}
                className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 text-white py-4 rounded-xl font-semibold hover:shadow-lg transition-all duration-300 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
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
          </motion.div>

          {/* Results Panel - Right Side */}
          <motion.div
            className="col-span-7 p-4 overflow-y-auto"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            style={{ maxHeight: 'calc(100vh - 120px)' }}
          >
            {isGenerating ? (
              <div className="flex items-center justify-center h-full">
                <div className="text-center">
                  <motion.div
                    className="w-24 h-24 bg-gradient-to-r from-indigo-100 to-purple-100 rounded-full flex items-center justify-center mx-auto mb-6"
                    animate={{ rotate: 360 }}
                    transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                  >
                    <Loader2 className="w-12 h-12 text-indigo-600 animate-spin" />
                  </motion.div>
                  <motion.h3
                    className="text-xl font-semibold text-gray-900 mb-2"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.5 }}
                  >
                    Generating Your Activity...
                  </motion.h3>
                  <motion.p
                    className="text-gray-600 max-w-md"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.5, delay: 0.2 }}
                  >
                    Our AI is crafting a personalized learning experience tailored to your child's needs and preferences.
                  </motion.p>
                  <motion.div
                    className="mt-6 flex items-center justify-center gap-2"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.5, delay: 0.4 }}
                  >
                    <div className="flex gap-1">
                      <motion.div
                        className="w-2 h-2 bg-indigo-600 rounded-full"
                        animate={{ y: [0, -8, 0] }}
                        transition={{ duration: 0.6, repeat: Infinity, delay: 0 }}
                      />
                      <motion.div
                        className="w-2 h-2 bg-purple-600 rounded-full"
                        animate={{ y: [0, -8, 0] }}
                        transition={{ duration: 0.6, repeat: Infinity, delay: 0.2 }}
                      />
                      <motion.div
                        className="w-2 h-2 bg-indigo-600 rounded-full"
                        animate={{ y: [0, -8, 0] }}
                        transition={{ duration: 0.6, repeat: Infinity, delay: 0.4 }}
                      />
                    </div>
                  </motion.div>
                </div>
              </div>
            ) : !generatedActivity ? (
              <div className="flex items-center justify-center h-full">
                <div className="text-center">
                  <div className="w-24 h-24 bg-gradient-to-r from-indigo-100 to-purple-100 rounded-full flex items-center justify-center mx-auto mb-6">
                    <Wand2 className="w-12 h-12 text-indigo-500" />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">Ready to Create Magic!</h3>
                  <p className="text-gray-600 max-w-md">
                    Configure your activity preferences on the left and click "Generate Activity" to create a personalized learning experience.
                  </p>
                  
                  {openAIConnected === false && (
                    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mt-6 text-left max-w-md mx-auto">
                      <div className="flex items-center gap-2 mb-2">
                        <AlertCircle className="w-5 h-5 text-yellow-600" />
                        <span className="font-medium text-yellow-800">AI Service Unavailable</span>
                      </div>
                      <p className="text-yellow-700 text-sm">
                        The AI service is not connected. A basic activity template will be generated instead.
                      </p>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="space-y-6">
                {/* Activity Header */}
                <div className="bg-gradient-to-r from-indigo-50 to-purple-50 border border-indigo-200 rounded-xl p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <h2 className="text-2xl font-bold text-gray-900">{generatedActivity.title}</h2>
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
                          Save
                        </motion.button>
                      )}
                    </div>
                  </div>

                  {/* Quick Stats */}
                  <div className="grid grid-cols-4 gap-4">
                    <div className="bg-white rounded-lg p-3 text-center">
                      <Clock className="w-5 h-5 text-indigo-600 mx-auto mb-1" />
                      <div className="text-sm text-gray-600">Duration</div>
                      <div className="font-semibold">{formData.duration} min</div>
                    </div>
                    <div className="bg-white rounded-lg p-3 text-center">
                      <Layers className="w-5 h-5 text-green-600 mx-auto mb-1" />
                      <div className="text-sm text-gray-600">Materials</div>
                      <div className="font-semibold">{generatedActivity.materials?.length || 0}</div>
                    </div>
                    <div className="bg-white rounded-lg p-3 text-center">
                      <FileText className="w-5 h-5 text-purple-600 mx-auto mb-1" />
                      <div className="text-sm text-gray-600">Steps</div>
                      <div className="font-semibold">{generatedActivity.instructions?.length || 0}</div>
                    </div>
                    <div className="bg-white rounded-lg p-3 text-center">
                      <Target className="w-5 h-5 text-orange-600 mx-auto mb-1" />
                      <div className="text-sm text-gray-600">Objectives</div>
                      <div className="font-semibold">{generatedActivity.learningObjectives?.length || 0}</div>
                    </div>
                  </div>
                </div>

                {/* Expandable Sections */}
                <div className="space-y-4">
                  
                  {/* Materials */}
                  {generatedActivity.materials && generatedActivity.materials.length > 0 && (
                    <div className="border border-gray-200 rounded-lg overflow-hidden">
                      <button
                        onClick={() => toggleExpandSection('materials')}
                        className="w-full flex items-center justify-between p-4 bg-white hover:bg-gray-50 transition-colors"
                      >
                        <div className="flex items-center gap-2">
                          <Layers className="w-5 h-5 text-indigo-600" />
                          <h3 className="font-semibold text-gray-900">Materials Needed</h3>
                        </div>
                        {expandedSection === 'materials' ? (
                          <ChevronUp className="w-5 h-5 text-gray-500" />
                        ) : (
                          <ChevronDown className="w-5 h-5 text-gray-500" />
                        )}
                      </button>
                      
                      <AnimatePresence>
                        {expandedSection === 'materials' && (
                          <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            exit={{ opacity: 0, height: 0 }}
                            className="p-4 bg-white border-t border-gray-200"
                          >
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                              {generatedActivity.materials.map((material, index) => (
                                <div key={index} className="flex items-center gap-2 bg-gray-50 rounded-lg p-2">
                                  <CheckCircle className="w-4 h-4 text-green-600 flex-shrink-0" />
                                  <span className="text-gray-700">{material}</span>
                                </div>
                              ))}
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  )}

                  {/* Instructions */}
                  {generatedActivity.instructions && generatedActivity.instructions.length > 0 && (
                    <div className="border border-gray-200 rounded-lg overflow-hidden">
                      <button
                        onClick={() => toggleExpandSection('instructions')}
                        className="w-full flex items-center justify-between p-4 bg-white hover:bg-gray-50 transition-colors"
                      >
                        <div className="flex items-center gap-2">
                          <FileText className="w-5 h-5 text-blue-600" />
                          <h3 className="font-semibold text-gray-900">Step-by-Step Instructions</h3>
                        </div>
                        {expandedSection === 'instructions' ? (
                          <ChevronUp className="w-5 h-5 text-gray-500" />
                        ) : (
                          <ChevronDown className="w-5 h-5 text-gray-500" />
                        )}
                      </button>
                      
                      <AnimatePresence>
                        {expandedSection === 'instructions' && (
                          <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            exit={{ opacity: 0, height: 0 }}
                            className="p-4 bg-white border-t border-gray-200"
                          >
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
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  )}

                  {/* Learning Objectives */}
                  {generatedActivity.learningObjectives && generatedActivity.learningObjectives.length > 0 && (
                    <div className="border border-gray-200 rounded-lg overflow-hidden">
                      <button
                        onClick={() => toggleExpandSection('objectives')}
                        className="w-full flex items-center justify-between p-4 bg-white hover:bg-gray-50 transition-colors"
                      >
                        <div className="flex items-center gap-2">
                          <Target className="w-5 h-5 text-green-600" />
                          <h3 className="font-semibold text-gray-900">Learning Objectives</h3>
                        </div>
                        {expandedSection === 'objectives' ? (
                          <ChevronUp className="w-5 h-5 text-gray-500" />
                        ) : (
                          <ChevronDown className="w-5 h-5 text-gray-500" />
                        )}
                      </button>
                      
                      <AnimatePresence>
                        {expandedSection === 'objectives' && (
                          <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            exit={{ opacity: 0, height: 0 }}
                            className="p-4 bg-white border-t border-gray-200"
                          >
                            <div className="space-y-2">
                              {generatedActivity.learningObjectives.map((objective, index) => (
                                <div key={index} className="flex items-center gap-2">
                                  <Lightbulb className="w-4 h-4 text-yellow-600 flex-shrink-0" />
                                  <span className="text-gray-700">{objective}</span>
                                </div>
                              ))}
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  )}

                  {/* Adaptations */}
                  {generatedActivity.adaptations && (
                    <div className="border border-gray-200 rounded-lg overflow-hidden">
                      <button
                        onClick={() => toggleExpandSection('adaptations')}
                        className="w-full flex items-center justify-between p-4 bg-white hover:bg-gray-50 transition-colors"
                      >
                        <div className="flex items-center gap-2">
                          <Settings className="w-5 h-5 text-orange-600" />
                          <h3 className="font-semibold text-gray-900">Adaptations</h3>
                        </div>
                        {expandedSection === 'adaptations' ? (
                          <ChevronUp className="w-5 h-5 text-gray-500" />
                        ) : (
                          <ChevronDown className="w-5 h-5 text-gray-500" />
                        )}
                      </button>
                      
                      <AnimatePresence>
                        {expandedSection === 'adaptations' && (
                          <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            exit={{ opacity: 0, height: 0 }}
                            className="p-4 bg-white border-t border-gray-200"
                          >
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                              {generatedActivity.adaptations.sensory && generatedActivity.adaptations.sensory.length > 0 && (
                                <div className="bg-blue-50 rounded-lg p-4">
                                  <h4 className="font-medium text-blue-900 mb-2">Sensory</h4>
                                  <div className="space-y-1">
                                    {generatedActivity.adaptations.sensory.map((adaptation, index) => (
                                      <p key={index} className="text-blue-800 text-sm">{adaptation}</p>
                                    ))}
                                  </div>
                                </div>
                              )}
                              
                              {generatedActivity.adaptations.motor && generatedActivity.adaptations.motor.length > 0 && (
                                <div className="bg-green-50 rounded-lg p-4">
                                  <h4 className="font-medium text-green-900 mb-2">Motor</h4>
                                  <div className="space-y-1">
                                    {generatedActivity.adaptations.motor.map((adaptation, index) => (
                                      <p key={index} className="text-green-800 text-sm">{adaptation}</p>
                                    ))}
                                  </div>
                                </div>
                              )}
                              
                              {generatedActivity.adaptations.cognitive && generatedActivity.adaptations.cognitive.length > 0 && (
                                <div className="bg-purple-50 rounded-lg p-4">
                                  <h4 className="font-medium text-purple-900 mb-2">Cognitive</h4>
                                  <div className="space-y-1">
                                    {generatedActivity.adaptations.cognitive.map((adaptation, index) => (
                                      <p key={index} className="text-purple-800 text-sm">{adaptation}</p>
                                    ))}
                                  </div>
                                </div>
                              )}
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  )}
                </div>

                {/* Action Buttons */}
                <div className="flex flex-wrap gap-3 pt-6 border-t border-gray-200">
                  <motion.button
                    onClick={() => {
                      setGeneratedActivity(null);
                      setSaved(false);
                    }}
                    className="bg-gray-100 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-200 transition-colors flex items-center gap-2"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <RefreshCw className="w-4 h-4" />
                    Generate New
                  </motion.button>
                  
                  <motion.button
                    onClick={() => {
                      navigator.clipboard.writeText(JSON.stringify(generatedActivity, null, 2));
                      toast.success('Activity copied to clipboard!');
                    }}
                    className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition-colors flex items-center gap-2"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <Copy className="w-4 h-4" />
                    Copy
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
                      toast.success('Activity downloaded!');
                    }}
                    className="bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700 transition-colors flex items-center gap-2"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <Download className="w-4 h-4" />
                    Download
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
                </div>
              </div>
            )}
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default AIProGenerator;