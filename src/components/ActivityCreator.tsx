import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  X, 
  Save, 
  Plus, 
  Trash2, 
  Upload, 
  Target, 
  Camera, 
  Music, 
  Brain, 
  Users,
  Clock,
  Star,
  BookOpen,
  Palette,
  Lightbulb,
  CheckCircle
} from 'lucide-react';
import { Activity, useActivityStore } from '../store/activityStore';
import toast from 'react-hot-toast';

interface ActivityCreatorProps {
  activity?: Activity | null;
  onClose: () => void;
  onSave: () => void;
}

const ActivityCreator: React.FC<ActivityCreatorProps> = ({ activity, onClose, onSave }) => {
  const { addActivity, updateActivity } = useActivityStore();
  const [currentStep, setCurrentStep] = useState(0);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    methodologies: [] as string[],
    ageRange: [3, 5] as [number, number],
    duration: 30,
    materials: [''],
    instructions: [''],
    learningObjectives: [''],
    developmentalAreas: [] as string[],
    speechTargets: [''],
    otTargets: [''],
    difficulty: 2 as 1 | 2 | 3 | 4 | 5,
    category: '',
    tags: [''],
    adaptations: {
      sensory: [''],
      motor: [''],
      cognitive: ['']
    },
    assessment: {
      observationPoints: [''],
      milestones: ['']
    }
  });

  useEffect(() => {
    if (activity) {
      setFormData({
        title: activity.title,
        description: activity.description,
        methodologies: activity.methodologies,
        ageRange: activity.ageRange,
        duration: activity.duration,
        materials: activity.materials,
        instructions: activity.instructions,
        learningObjectives: activity.learningObjectives,
        developmentalAreas: activity.developmentalAreas,
        speechTargets: activity.speechTargets || [''],
        otTargets: activity.otTargets || [''],
        difficulty: activity.difficulty,
        category: activity.category,
        tags: activity.tags,
        adaptations: activity.adaptations,
        assessment: activity.assessment
      });
    }
  }, [activity]);

  const steps = [
    { title: 'Basic Info', icon: BookOpen },
    { title: 'Methodologies', icon: Target },
    { title: 'Materials & Instructions', icon: Palette },
    { title: 'Learning Goals', icon: Lightbulb },
    { title: 'Adaptations', icon: Users },
    { title: 'Review', icon: CheckCircle }
  ];

  const methodologies = [
    { id: 'montessori', name: 'Montessori', icon: Target, color: 'from-blue-500 to-blue-600' },
    { id: 'reggio', name: 'Reggio Emilia', icon: Camera, color: 'from-green-500 to-green-600' },
    { id: 'waldorf', name: 'Waldorf', icon: Music, color: 'from-purple-500 to-purple-600' },
    { id: 'highscope', name: 'HighScope', icon: Brain, color: 'from-orange-500 to-orange-600' },
    { id: 'bankstreet', name: 'Bank Street', icon: Users, color: 'from-pink-500 to-pink-600' }
  ];

  const categories = [
    'Math & Logic',
    'Language & Literacy',
    'Science & Nature',
    'Art & Creativity',
    'Music & Movement',
    'Social Skills',
    'Life Skills',
    'Sensory Play'
  ];

  const developmentalAreas = [
    'Cognitive',
    'Language',
    'Physical',
    'Social',
    'Creative',
    'Emotional'
  ];

  const updateFormData = (key: string, value: any) => {
    setFormData(prev => ({ ...prev, [key]: value }));
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

  const toggleMethodology = (methodId: string) => {
    const newMethodologies = formData.methodologies.includes(methodId)
      ? formData.methodologies.filter(m => m !== methodId)
      : [...formData.methodologies, methodId];
    updateFormData('methodologies', newMethodologies);
  };

  const toggleDevelopmentalArea = (area: string) => {
    const newAreas = formData.developmentalAreas.includes(area)
      ? formData.developmentalAreas.filter(a => a !== area)
      : [...formData.developmentalAreas, area];
    updateFormData('developmentalAreas', newAreas);
  };

  const handleSave = async () => {
    if (!formData.title.trim()) {
      toast.error('Please enter a title');
      return;
    }
    if (!formData.category || formData.category.trim() === '') {
      toast.error('Please select a category');
      return;
    }
    if (formData.methodologies.length === 0) {
      toast.error('Please select at least one methodology');
      return;
    }
    
    // Validate materials and instructions have at least one non-empty item
    const filteredMaterials = formData.materials.filter(m => m.trim());
    const filteredInstructions = formData.instructions.filter(i => i.trim());
    
    if (filteredMaterials.length === 0) {
      toast.error('Please add at least one material');
      return;
    }
    if (filteredInstructions.length === 0) {
      toast.error('Please add at least one instruction');
      return;
    }

    const activityData = {
      ...formData,
      materials: filteredMaterials,
      instructions: filteredInstructions,
      learningObjectives: formData.learningObjectives.filter(o => o.trim()),
      speechTargets: formData.speechTargets.filter(t => t.trim()),
      otTargets: formData.otTargets.filter(t => t.trim()),
      tags: formData.tags.filter(t => t.trim()),
      adaptations: {
        sensory: formData.adaptations.sensory.filter(a => a.trim()),
        motor: formData.adaptations.motor.filter(a => a.trim()),
        cognitive: formData.adaptations.cognitive.filter(a => a.trim())
      },
      assessment: {
        observationPoints: formData.assessment.observationPoints.filter(p => p.trim()),
        milestones: formData.assessment.milestones.filter(m => m.trim())
      },
      media: { images: [], videos: [], audio: [] },
      parentGuidance: activity?.parentGuidance || {
        setupTips: [],
        encouragementPhrases: [],
        extensionIdeas: [],
        troubleshooting: []
      },
      createdBy: 'Current User',
      rating: 0,
      reviews: 0,
      price: 0
    };

    try {
      if (activity) {
        await updateActivity(activity.id, activityData);
      } else {
        await addActivity(activityData);
      }
      onSave();
    } catch (error: any) {
      console.error('Error saving activity:', error);
      toast.error(error?.message || 'Failed to save activity. Please try again.');
      // Don't call onSave() if there's an error
    }
  };

  const renderStep = () => {
    switch (currentStep) {
      case 0:
        return (
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Activity Title *</label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => updateFormData('title', e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Enter a descriptive title for your activity"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
              <textarea
                value={formData.description}
                onChange={(e) => updateFormData('description', e.target.value)}
                rows={4}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Describe what children will do and learn in this activity"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Category *</label>
                <select
                  value={formData.category}
                  onChange={(e) => updateFormData('category', e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                >
                  <option value="">Select a category</option>
                  {categories.map(category => (
                    <option key={category} value={category}>{category}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Difficulty Level</label>
                <select
                  value={formData.difficulty}
                  onChange={(e) => updateFormData('difficulty', parseInt(e.target.value))}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value={1}>1 - Beginner</option>
                  <option value={2}>2 - Easy</option>
                  <option value={3}>3 - Medium</option>
                  <option value={4}>4 - Hard</option>
                  <option value={5}>5 - Expert</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Age Range: {formData.ageRange[0]} - {formData.ageRange[1]} years
                </label>
                <div className="space-y-2">
                  <input
                    type="range"
                    min="2"
                    max="8"
                    value={formData.ageRange[0]}
                    onChange={(e) => updateFormData('ageRange', [parseInt(e.target.value), formData.ageRange[1]])}
                    className="w-full"
                  />
                  <input
                    type="range"
                    min="2"
                    max="8"
                    value={formData.ageRange[1]}
                    onChange={(e) => updateFormData('ageRange', [formData.ageRange[0], parseInt(e.target.value)])}
                    className="w-full"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Duration: {formData.duration} minutes
                </label>
                <input
                  type="range"
                  min="5"
                  max="120"
                  step="5"
                  value={formData.duration}
                  onChange={(e) => updateFormData('duration', parseInt(e.target.value))}
                  className="w-full"
                />
              </div>
            </div>
          </div>
        );

      case 1:
        return (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Select Educational Methodologies *
              </h3>
              <p className="text-gray-600 mb-6">
                Choose which educational approaches this activity incorporates. You can select multiple methodologies.
              </p>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {methodologies.map((method) => {
                  const Icon = method.icon;
                  const isSelected = formData.methodologies.includes(method.id);
                  
                  return (
                    <motion.button
                      key={method.id}
                      onClick={() => toggleMethodology(method.id)}
                      className={`p-6 rounded-xl border-2 transition-all duration-300 text-left ${
                        isSelected
                          ? `bg-gradient-to-r ${method.color} text-white border-transparent shadow-lg`
                          : 'bg-white border-gray-200 hover:border-gray-300'
                      }`}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      <div className="flex items-center gap-3 mb-2">
                        <Icon className="w-6 h-6" />
                        <span className="font-semibold">{method.name}</span>
                      </div>
                      <p className={`text-sm ${isSelected ? 'text-white/90' : 'text-gray-600'}`}>
                        {method.id === 'montessori' && 'Self-directed learning with structured materials'}
                        {method.id === 'reggio' && 'Project-based exploration and documentation'}
                        {method.id === 'waldorf' && 'Artistic expression and natural rhythms'}
                        {method.id === 'highscope' && 'Plan-do-review active learning'}
                        {method.id === 'bankstreet' && 'Social-emotional development focus'}
                      </p>
                    </motion.button>
                  );
                })}
              </div>
            </div>
          </div>
        );

      case 2:
        return (
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Materials Needed</label>
              {formData.materials.map((material, index) => (
                <div key={index} className="flex gap-2 mb-2">
                  <input
                    type="text"
                    value={material}
                    onChange={(e) => updateArrayField('materials', index, e.target.value)}
                    className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Enter material needed"
                  />
                  {formData.materials.length > 1 && (
                    <button
                      onClick={() => removeArrayField('materials', index)}
                      className="p-2 text-red-500 hover:bg-red-50 rounded-lg"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              ))}
              <button
                onClick={() => addArrayField('materials')}
                className="flex items-center gap-2 text-blue-600 hover:text-blue-700 font-medium"
              >
                <Plus className="w-4 h-4" /> Add Material
              </button>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Step-by-Step Instructions</label>
              {formData.instructions.map((instruction, index) => (
                <div key={index} className="flex gap-2 mb-2">
                  <div className="flex-shrink-0 w-8 h-8 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-sm font-medium mt-1">
                    {index + 1}
                  </div>
                  <textarea
                    value={instruction}
                    onChange={(e) => updateArrayField('instructions', index, e.target.value)}
                    className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Describe this step"
                    rows={2}
                  />
                  {formData.instructions.length > 1 && (
                    <button
                      onClick={() => removeArrayField('instructions', index)}
                      className="p-2 text-red-500 hover:bg-red-50 rounded-lg"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              ))}
              <button
                onClick={() => addArrayField('instructions')}
                className="flex items-center gap-2 text-blue-600 hover:text-blue-700 font-medium"
              >
                <Plus className="w-4 h-4" /> Add Step
              </button>
            </div>
          </div>
        );

      case 3:
        return (
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Learning Objectives</label>
              {formData.learningObjectives.map((objective, index) => (
                <div key={index} className="flex gap-2 mb-2">
                  <input
                    type="text"
                    value={objective}
                    onChange={(e) => updateArrayField('learningObjectives', index, e.target.value)}
                    className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="What will children learn?"
                  />
                  {formData.learningObjectives.length > 1 && (
                    <button
                      onClick={() => removeArrayField('learningObjectives', index)}
                      className="p-2 text-red-500 hover:bg-red-50 rounded-lg"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              ))}
              <button
                onClick={() => addArrayField('learningObjectives')}
                className="flex items-center gap-2 text-blue-600 hover:text-blue-700 font-medium"
              >
                <Plus className="w-4 h-4" /> Add Objective
              </button>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Developmental Areas</label>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {developmentalAreas.map((area) => (
                  <label key={area} className="flex items-center">
                    <input
                      type="checkbox"
                      checked={formData.developmentalAreas.includes(area)}
                      onChange={() => toggleDevelopmentalArea(area)}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                    <span className="ml-2 text-sm text-gray-700">{area}</span>
                  </label>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Speech Therapy Targets</label>
                {formData.speechTargets.map((target, index) => (
                  <div key={index} className="flex gap-2 mb-2">
                    <input
                      type="text"
                      value={target}
                      onChange={(e) => updateArrayField('speechTargets', index, e.target.value)}
                      className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Speech goal or target"
                    />
                    {formData.speechTargets.length > 1 && (
                      <button
                        onClick={() => removeArrayField('speechTargets', index)}
                        className="p-2 text-red-500 hover:bg-red-50 rounded-lg"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                ))}
                <button
                  onClick={() => addArrayField('speechTargets')}
                  className="flex items-center gap-2 text-blue-600 hover:text-blue-700 font-medium text-sm"
                >
                  <Plus className="w-4 h-4" /> Add Speech Target
                </button>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">OT Targets</label>
                {formData.otTargets.map((target, index) => (
                  <div key={index} className="flex gap-2 mb-2">
                    <input
                      type="text"
                      value={target}
                      onChange={(e) => updateArrayField('otTargets', index, e.target.value)}
                      className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="OT goal or target"
                    />
                    {formData.otTargets.length > 1 && (
                      <button
                        onClick={() => removeArrayField('otTargets', index)}
                        className="p-2 text-red-500 hover:bg-red-50 rounded-lg"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                ))}
                <button
                  onClick={() => addArrayField('otTargets')}
                  className="flex items-center gap-2 text-blue-600 hover:text-blue-700 font-medium text-sm"
                >
                  <Plus className="w-4 h-4" /> Add OT Target
                </button>
              </div>
            </div>
          </div>
        );

      case 4:
        return (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Activity Adaptations</h3>
              <p className="text-gray-600 mb-6">
                Provide suggestions for adapting this activity for different needs and abilities.
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Sensory Adaptations</label>
              {formData.adaptations.sensory.map((adaptation, index) => (
                <div key={index} className="flex gap-2 mb-2">
                  <input
                    type="text"
                    value={adaptation}
                    onChange={(e) => {
                      const newAdaptations = { ...formData.adaptations };
                      newAdaptations.sensory[index] = e.target.value;
                      updateFormData('adaptations', newAdaptations);
                    }}
                    className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Sensory adaptation suggestion"
                  />
                  {formData.adaptations.sensory.length > 1 && (
                    <button
                      onClick={() => {
                        const newAdaptations = { ...formData.adaptations };
                        newAdaptations.sensory = newAdaptations.sensory.filter((_, i) => i !== index);
                        updateFormData('adaptations', newAdaptations);
                      }}
                      className="p-2 text-red-500 hover:bg-red-50 rounded-lg"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              ))}
              <button
                onClick={() => {
                  const newAdaptations = { ...formData.adaptations };
                  newAdaptations.sensory.push('');
                  updateFormData('adaptations', newAdaptations);
                }}
                className="flex items-center gap-2 text-blue-600 hover:text-blue-700 font-medium text-sm"
              >
                <Plus className="w-4 h-4" /> Add Sensory Adaptation
              </button>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Motor Adaptations</label>
              {formData.adaptations.motor.map((adaptation, index) => (
                <div key={index} className="flex gap-2 mb-2">
                  <input
                    type="text"
                    value={adaptation}
                    onChange={(e) => {
                      const newAdaptations = { ...formData.adaptations };
                      newAdaptations.motor[index] = e.target.value;
                      updateFormData('adaptations', newAdaptations);
                    }}
                    className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Motor adaptation suggestion"
                  />
                  {formData.adaptations.motor.length > 1 && (
                    <button
                      onClick={() => {
                        const newAdaptations = { ...formData.adaptations };
                        newAdaptations.motor = newAdaptations.motor.filter((_, i) => i !== index);
                        updateFormData('adaptations', newAdaptations);
                      }}
                      className="p-2 text-red-500 hover:bg-red-50 rounded-lg"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              ))}
              <button
                onClick={() => {
                  const newAdaptations = { ...formData.adaptations };
                  newAdaptations.motor.push('');
                  updateFormData('adaptations', newAdaptations);
                }}
                className="flex items-center gap-2 text-blue-600 hover:text-blue-700 font-medium text-sm"
              >
                <Plus className="w-4 h-4" /> Add Motor Adaptation
              </button>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Cognitive Adaptations</label>
              {formData.adaptations.cognitive.map((adaptation, index) => (
                <div key={index} className="flex gap-2 mb-2">
                  <input
                    type="text"
                    value={adaptation}
                    onChange={(e) => {
                      const newAdaptations = { ...formData.adaptations };
                      newAdaptations.cognitive[index] = e.target.value;
                      updateFormData('adaptations', newAdaptations);
                    }}
                    className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Cognitive adaptation suggestion"
                  />
                  {formData.adaptations.cognitive.length > 1 && (
                    <button
                      onClick={() => {
                        const newAdaptations = { ...formData.adaptations };
                        newAdaptations.cognitive = newAdaptations.cognitive.filter((_, i) => i !== index);
                        updateFormData('adaptations', newAdaptations);
                      }}
                      className="p-2 text-red-500 hover:bg-red-50 rounded-lg"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              ))}
              <button
                onClick={() => {
                  const newAdaptations = { ...formData.adaptations };
                  newAdaptations.cognitive.push('');
                  updateFormData('adaptations', newAdaptations);
                }}
                className="flex items-center gap-2 text-blue-600 hover:text-blue-700 font-medium text-sm"
              >
                <Plus className="w-4 h-4" /> Add Cognitive Adaptation
              </button>
            </div>
          </div>
        );

      case 5:
        return (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Review Your Activity</h3>
              <p className="text-gray-600 mb-6">
                Please review all the details before saving your activity.
              </p>
            </div>

            <div className="bg-gray-50 rounded-lg p-6">
              <h4 className="font-semibold text-gray-900 mb-2">{formData.title}</h4>
              <p className="text-gray-600 mb-4">{formData.description}</p>
              
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="font-medium text-gray-700">Category:</span> {formData.category}
                </div>
                <div>
                  <span className="font-medium text-gray-700">Duration:</span> {formData.duration} minutes
                </div>
                <div>
                  <span className="font-medium text-gray-700">Age Range:</span> {formData.ageRange[0]}-{formData.ageRange[1]} years
                </div>
                <div>
                  <span className="font-medium text-gray-700">Difficulty:</span> Level {formData.difficulty}
                </div>
              </div>

              <div className="mt-4">
                <span className="font-medium text-gray-700">Methodologies:</span>
                <div className="flex flex-wrap gap-2 mt-2">
                  {formData.methodologies.map(method => (
                    <span key={method} className="px-2 py-1 bg-blue-100 text-blue-700 rounded-full text-xs capitalize">
                      {method}
                    </span>
                  ))}
                </div>
              </div>

              <div className="mt-4">
                <span className="font-medium text-gray-700">Materials:</span>
                <ul className="list-disc list-inside mt-2 text-sm text-gray-600">
                  {formData.materials.filter(m => m.trim()).map((material, index) => (
                    <li key={index}>{material}</li>
                  ))}
                </ul>
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
              {activity ? 'Edit Activity' : 'Create New Activity'}
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
                Save Activity
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

export default ActivityCreator;