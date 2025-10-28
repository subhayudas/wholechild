import React, { useState, useRef } from 'react';
import { motion } from 'framer-motion';
import { 
  X, 
  Save, 
  Camera, 
  Video, 
  Upload, 
  Plus, 
  Trash2, 
  Eye, 
  Share2,
  Target,
  Brain,
  Heart,
  Users,
  Palette,
  Music,
  BookOpen,
  Star,
  Lightbulb,
  CheckCircle,
  Calendar,
  Clock
} from 'lucide-react';
import { LearningStory, useLearningStoryStore } from '../store/learningStoryStore';
import { useChildStore } from '../store/childStore';
import { useActivityStore } from '../store/activityStore';
import toast from 'react-hot-toast';

interface LearningStoryCreatorProps {
  story?: LearningStory | null;
  onClose: () => void;
  onSave: () => void;
}

const LearningStoryCreator: React.FC<LearningStoryCreatorProps> = ({ story, onClose, onSave }) => {
  const { addStory, updateStory } = useLearningStoryStore();
  const { children, activeChild } = useChildStore();
  const { activities } = useActivityStore();
  const [currentStep, setCurrentStep] = useState(0);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const videoInputRef = useRef<HTMLInputElement>(null);
  
  const [formData, setFormData] = useState({
    childId: activeChild?.id || '',
    title: '',
    description: '',
    date: new Date(),
    activityId: '',
    media: {
      photos: [] as string[],
      videos: [] as string[],
      audio: [] as string[]
    },
    observations: [''],
    milestones: [''],
    nextSteps: [''],
    developmentalAreas: [] as string[],
    methodologyTags: [] as string[],
    sharedWith: [] as string[],
    isPrivate: false,
    learningMoments: [
      {
        timestamp: '',
        description: '',
        significance: '',
        methodology: ''
      }
    ],
    reflections: {
      childVoice: '',
      parentReflection: '',
      educatorInsights: '',
      futureGoals: ''
    }
  });

  const steps = [
    { title: 'Story Details', icon: BookOpen },
    { title: 'Media Capture', icon: Camera },
    { title: 'Observations', icon: Eye },
    { title: 'Learning Analysis', icon: Brain },
    { title: 'Reflections', icon: Heart },
    { title: 'Share & Save', icon: Share2 }
  ];

  const developmentalAreas = [
    'Cognitive Development',
    'Language & Communication',
    'Physical Development',
    'Social-Emotional',
    'Creative Expression',
    'Mathematical Thinking',
    'Scientific Inquiry',
    'Cultural Understanding'
  ];

  const methodologies = [
    { id: 'montessori', name: 'Montessori', icon: Target, color: 'blue' },
    { id: 'reggio', name: 'Reggio Emilia', icon: Camera, color: 'green' },
    { id: 'waldorf', name: 'Waldorf', icon: Music, color: 'purple' },
    { id: 'highscope', name: 'HighScope', icon: Brain, color: 'orange' },
    { id: 'bankstreet', name: 'Bank Street', icon: Users, color: 'pink' }
  ];

  const shareOptions = [
    'Family Members',
    'Teachers',
    'Therapists',
    'Grandparents',
    'Care Team',
    'Portfolio'
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

  const updateArrayField = (key: string, index: number, value: string) => {
    const array = formData[key as keyof typeof formData] as string[];
    const newArray = [...array];
    newArray[index] = value;
    updateFormData(key, newArray);
  };

  const addArrayField = (key: string) => {
    const array = formData[key as keyof typeof formData] as string[];
    updateFormData(key, [...array, '']);
  };

  const removeArrayField = (key: string, index: number) => {
    const array = formData[key as keyof typeof formData] as string[];
    if (array.length > 1) {
      updateFormData(key, array.filter((_, i) => i !== index));
    }
  };

  const toggleDevelopmentalArea = (area: string) => {
    const newAreas = formData.developmentalAreas.includes(area)
      ? formData.developmentalAreas.filter(a => a !== area)
      : [...formData.developmentalAreas, area];
    updateFormData('developmentalAreas', newAreas);
  };

  const toggleMethodology = (methodId: string) => {
    const newMethods = formData.methodologyTags.includes(methodId)
      ? formData.methodologyTags.filter(m => m !== methodId)
      : [...formData.methodologyTags, methodId];
    updateFormData('methodologyTags', newMethods);
  };

  const toggleShareOption = (option: string) => {
    const newShared = formData.sharedWith.includes(option)
      ? formData.sharedWith.filter(s => s !== option)
      : [...formData.sharedWith, option];
    updateFormData('sharedWith', newShared);
  };

  const handleFileUpload = (type: 'photos' | 'videos') => {
    const input = type === 'photos' ? fileInputRef.current : videoInputRef.current;
    if (input) {
      input.click();
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, type: 'photos' | 'videos') => {
    const files = Array.from(e.target.files || []);
    files.forEach(file => {
      const url = URL.createObjectURL(file);
      updateNestedData('media', type, [...formData.media[type], url]);
    });
  };

  const removeMedia = (type: 'photos' | 'videos', index: number) => {
    const newMedia = formData.media[type].filter((_, i) => i !== index);
    updateNestedData('media', type, newMedia);
  };

  const handleSave = () => {
    if (!formData.title.trim()) {
      toast.error('Please enter a story title');
      return;
    }
    if (!formData.childId) {
      toast.error('Please select a child');
      return;
    }

    const storyData = {
      ...formData,
      observations: formData.observations.filter(o => o.trim()),
      milestones: formData.milestones.filter(m => m.trim()),
      nextSteps: formData.nextSteps.filter(n => n.trim()),
      reactions: { hearts: 0, celebrations: 0, insights: 0 }
    };

    if (story) {
      updateStory(story.id, storyData);
      toast.success('Learning story updated successfully!');
    } else {
      addStory(storyData);
      toast.success('Learning story created successfully!');
    }

    onSave();
  };

  const renderStep = () => {
    switch (currentStep) {
      case 0:
        return (
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Story Title *</label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => updateFormData('title', e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Give your learning story a meaningful title"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Child *</label>
              <select
                value={formData.childId}
                onChange={(e) => updateFormData('childId', e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">Select a child</option>
                {children.map(child => (
                  <option key={child.id} value={child.id}>{child.name}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Related Activity (Optional)</label>
              <select
                value={formData.activityId}
                onChange={(e) => updateFormData('activityId', e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">No specific activity</option>
                {activities.map(activity => (
                  <option key={activity.id} value={activity.id}>{activity.title}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Date</label>
              <input
                type="date"
                value={formData.date.toISOString().split('T')[0]}
                onChange={(e) => updateFormData('date', new Date(e.target.value))}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Story Description</label>
              <textarea
                value={formData.description}
                onChange={(e) => updateFormData('description', e.target.value)}
                rows={4}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Describe what happened in this learning moment..."
              />
            </div>
          </div>
        );

      case 1:
        return (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Capture Learning Moments</h3>
              <p className="text-gray-600 mb-6">
                Add photos and videos to document this learning story.
              </p>
            </div>

            {/* Photo Upload */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <h4 className="font-medium text-gray-900">Photos</h4>
                <button
                  onClick={() => handleFileUpload('photos')}
                  className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  <Camera className="w-4 h-4" />
                  Add Photos
                </button>
              </div>
              
              <div className="grid grid-cols-3 md:grid-cols-4 gap-4">
                {formData.media.photos.map((photo, index) => (
                  <div key={index} className="relative group">
                    <img 
                      src={photo} 
                      alt={`Photo ${index + 1}`}
                      className="w-full h-24 object-cover rounded-lg"
                    />
                    <button
                      onClick={() => removeMedia('photos', index)}
                      className="absolute top-2 right-2 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                ))}
                
                <button
                  onClick={() => handleFileUpload('photos')}
                  className="h-24 border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center hover:border-blue-400 hover:bg-blue-50 transition-colors"
                >
                  <Plus className="w-6 h-6 text-gray-400" />
                </button>
              </div>
              
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                multiple
                onChange={(e) => handleFileChange(e, 'photos')}
                className="hidden"
              />
            </div>

            {/* Video Upload */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <h4 className="font-medium text-gray-900">Videos</h4>
                <button
                  onClick={() => handleFileUpload('videos')}
                  className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                >
                  <Video className="w-4 h-4" />
                  Add Videos
                </button>
              </div>
              
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {formData.media.videos.map((video, index) => (
                  <div key={index} className="relative group">
                    <video 
                      src={video}
                      className="w-full h-32 object-cover rounded-lg"
                      controls
                    />
                    <button
                      onClick={() => removeMedia('videos', index)}
                      className="absolute top-2 right-2 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                ))}
              </div>
              
              <input
                ref={videoInputRef}
                type="file"
                accept="video/*"
                multiple
                onChange={(e) => handleFileChange(e, 'videos')}
                className="hidden"
              />
            </div>
          </div>
        );

      case 2:
        return (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Observations & Documentation</h3>
              <p className="text-gray-600 mb-6">
                Record what you observed during this learning moment.
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Key Observations</label>
              {formData.observations.map((observation, index) => (
                <div key={index} className="flex gap-2 mb-2">
                  <textarea
                    value={observation}
                    onChange={(e) => updateArrayField('observations', index, e.target.value)}
                    className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="What did you observe? Be specific and objective..."
                    rows={2}
                  />
                  {formData.observations.length > 1 && (
                    <button
                      onClick={() => removeArrayField('observations', index)}
                      className="p-2 text-red-500 hover:bg-red-50 rounded-lg"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              ))}
              <button
                onClick={() => addArrayField('observations')}
                className="flex items-center gap-2 text-blue-600 hover:text-blue-700 font-medium"
              >
                <Plus className="w-4 h-4" /> Add Observation
              </button>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Milestones Achieved</label>
              {formData.milestones.map((milestone, index) => (
                <div key={index} className="flex gap-2 mb-2">
                  <input
                    type="text"
                    value={milestone}
                    onChange={(e) => updateArrayField('milestones', index, e.target.value)}
                    className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="What milestone or achievement did you notice?"
                  />
                  {formData.milestones.length > 1 && (
                    <button
                      onClick={() => removeArrayField('milestones', index)}
                      className="p-2 text-red-500 hover:bg-red-50 rounded-lg"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              ))}
              <button
                onClick={() => addArrayField('milestones')}
                className="flex items-center gap-2 text-green-600 hover:text-green-700 font-medium"
              >
                <Plus className="w-4 h-4" /> Add Milestone
              </button>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Next Steps</label>
              {formData.nextSteps.map((step, index) => (
                <div key={index} className="flex gap-2 mb-2">
                  <input
                    type="text"
                    value={step}
                    onChange={(e) => updateArrayField('nextSteps', index, e.target.value)}
                    className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="What should we focus on next?"
                  />
                  {formData.nextSteps.length > 1 && (
                    <button
                      onClick={() => removeArrayField('nextSteps', index)}
                      className="p-2 text-red-500 hover:bg-red-50 rounded-lg"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              ))}
              <button
                onClick={() => addArrayField('nextSteps')}
                className="flex items-center gap-2 text-purple-600 hover:text-purple-700 font-medium"
              >
                <Plus className="w-4 h-4" /> Add Next Step
              </button>
            </div>
          </div>
        );

      case 3:
        return (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Learning Analysis</h3>
              <p className="text-gray-600 mb-6">
                Identify the developmental areas and educational approaches evident in this story.
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">Developmental Areas</label>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {developmentalAreas.map((area) => (
                  <motion.button
                    key={area}
                    onClick={() => toggleDevelopmentalArea(area)}
                    className={`p-3 rounded-lg border-2 transition-all duration-300 text-sm ${
                      formData.developmentalAreas.includes(area)
                        ? 'bg-blue-100 border-blue-300 text-blue-700'
                        : 'bg-white border-gray-200 hover:border-blue-200'
                    }`}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    {area}
                  </motion.button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">Educational Methodologies</label>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {methodologies.map((method) => {
                  const Icon = method.icon;
                  const isSelected = formData.methodologyTags.includes(method.id);
                  
                  return (
                    <motion.button
                      key={method.id}
                      onClick={() => toggleMethodology(method.id)}
                      className={`p-4 rounded-lg border-2 transition-all duration-300 ${
                        isSelected
                          ? `bg-${method.color}-100 border-${method.color}-300 text-${method.color}-700`
                          : 'bg-white border-gray-200 hover:border-gray-300'
                      }`}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      <div className="flex items-center gap-2 mb-1">
                        <Icon className="w-5 h-5" />
                        <span className="font-medium">{method.name}</span>
                      </div>
                    </motion.button>
                  );
                })}
              </div>
            </div>
          </div>
        );

      case 4:
        return (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Reflections & Insights</h3>
              <p className="text-gray-600 mb-6">
                Add deeper reflections and insights about this learning moment.
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Child's Voice</label>
              <textarea
                value={formData.reflections.childVoice}
                onChange={(e) => updateNestedData('reflections', 'childVoice', e.target.value)}
                rows={3}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="What did the child say? Include quotes or expressions..."
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Parent Reflection</label>
              <textarea
                value={formData.reflections.parentReflection}
                onChange={(e) => updateNestedData('reflections', 'parentReflection', e.target.value)}
                rows={3}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="What are your thoughts as a parent about this moment?"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Educator Insights</label>
              <textarea
                value={formData.reflections.educatorInsights}
                onChange={(e) => updateNestedData('reflections', 'educatorInsights', e.target.value)}
                rows={3}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Professional insights about the learning that occurred..."
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Future Goals</label>
              <textarea
                value={formData.reflections.futureGoals}
                onChange={(e) => updateNestedData('reflections', 'futureGoals', e.target.value)}
                rows={3}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="What goals or directions does this suggest for future learning?"
              />
            </div>
          </div>
        );

      case 5:
        return (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Share & Privacy Settings</h3>
              <p className="text-gray-600 mb-6">
                Choose who can see this learning story and finalize your documentation.
              </p>
            </div>

            <div>
              <label className="flex items-center mb-4">
                <input
                  type="checkbox"
                  checked={formData.isPrivate}
                  onChange={(e) => updateFormData('isPrivate', e.target.checked)}
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500 mr-3"
                />
                <span className="text-sm font-medium text-gray-700">Keep this story private</span>
              </label>
            </div>

            {!formData.isPrivate && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">Share With</label>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {shareOptions.map((option) => (
                    <motion.button
                      key={option}
                      onClick={() => toggleShareOption(option)}
                      className={`p-3 rounded-lg border-2 transition-all duration-300 text-sm ${
                        formData.sharedWith.includes(option)
                          ? 'bg-green-100 border-green-300 text-green-700'
                          : 'bg-white border-gray-200 hover:border-green-200'
                      }`}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      {option}
                    </motion.button>
                  ))}
                </div>
              </div>
            )}

            <div className="bg-gray-50 rounded-lg p-6">
              <h4 className="font-semibold text-gray-900 mb-3">Story Summary</h4>
              <div className="space-y-2 text-sm">
                <div><span className="font-medium">Title:</span> {formData.title}</div>
                <div><span className="font-medium">Child:</span> {children.find(c => c.id === formData.childId)?.name}</div>
                <div><span className="font-medium">Date:</span> {formData.date.toLocaleDateString()}</div>
                <div><span className="font-medium">Media:</span> {formData.media.photos.length} photos, {formData.media.videos.length} videos</div>
                <div><span className="font-medium">Developmental Areas:</span> {formData.developmentalAreas.length}</div>
                <div><span className="font-medium">Methodologies:</span> {formData.methodologyTags.length}</div>
              </div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <motion.div
      className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <motion.div
        className="bg-white rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden"
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">
              {story ? 'Edit Learning Story' : 'Create Learning Story'}
            </h2>
            <p className="text-gray-600">Step {currentStep + 1} of {steps.length}</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Progress Steps */}
        <div className="px-6 py-4 border-b border-gray-200">
          <div className="flex items-center justify-between">
            {steps.map((step, index) => {
              const Icon = step.icon;
              const isActive = index === currentStep;
              const isCompleted = index < currentStep;
              
              return (
                <div key={index} className="flex items-center">
                  <div className={`flex items-center justify-center w-10 h-10 rounded-full border-2 transition-all duration-300 ${
                    isActive 
                      ? 'bg-blue-600 border-blue-600 text-white' 
                      : isCompleted
                        ? 'bg-green-600 border-green-600 text-white'
                        : 'border-gray-300 text-gray-400'
                  }`}>
                    <Icon className="w-5 h-5" />
                  </div>
                  <span className={`ml-2 text-sm font-medium ${
                    isActive ? 'text-blue-600' : isCompleted ? 'text-green-600' : 'text-gray-400'
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
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[60vh]">
          {renderStep()}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between p-6 border-t border-gray-200">
          <button
            onClick={() => setCurrentStep(Math.max(0, currentStep - 1))}
            disabled={currentStep === 0}
            className="px-6 py-2 text-gray-600 hover:text-gray-800 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Previous
          </button>
          
          <div className="flex gap-3">
            {currentStep === steps.length - 1 ? (
              <motion.button
                onClick={handleSave}
                className="bg-gradient-to-r from-blue-600 to-green-600 text-white px-8 py-2 rounded-lg font-semibold hover:shadow-lg transition-all duration-300 flex items-center gap-2"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <Save className="w-4 h-4" />
                Save Story
              </motion.button>
            ) : (
              <button
                onClick={() => setCurrentStep(Math.min(steps.length - 1, currentStep + 1))}
                className="bg-blue-600 text-white px-6 py-2 rounded-lg font-semibold hover:bg-blue-700 transition-colors"
              >
                Next
              </button>
            )}
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default LearningStoryCreator;