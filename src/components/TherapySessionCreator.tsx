import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  X, 
  Save, 
  Mic, 
  Hand, 
  Calendar, 
  Clock, 
  Target, 
  Plus, 
  Trash2,
  User,
  FileText,
  Settings
} from 'lucide-react';
import { useTherapyStore } from '../store/therapyStore';
import { useChildStore } from '../store/childStore';
import toast from 'react-hot-toast';

interface TherapySessionCreatorProps {
  onClose: () => void;
  onSave: () => void;
}

const TherapySessionCreator: React.FC<TherapySessionCreatorProps> = ({ onClose, onSave }) => {
  const { addSession } = useTherapyStore();
  const { activeChild } = useChildStore();
  const [currentStep, setCurrentStep] = useState(0);
  
  const [formData, setFormData] = useState({
    type: 'speech' as 'speech' | 'ot',
    title: '',
    description: '',
    date: new Date(),
    duration: 30,
    goals: [''],
    activities: [''],
    notes: '',
    therapistId: 'current-user'
  });

  const steps = [
    { title: 'Session Type', icon: Settings },
    { title: 'Basic Info', icon: FileText },
    { title: 'Goals & Activities', icon: Target },
    { title: 'Review', icon: Save }
  ];

  const sessionTypes = [
    {
      id: 'speech',
      title: 'Speech Therapy',
      description: 'Articulation, language, and communication skills',
      icon: <Mic className="w-8 h-8" />,
      color: 'from-blue-500 to-blue-600'
    },
    {
      id: 'ot',
      title: 'Occupational Therapy',
      description: 'Fine motor, sensory, and daily living skills',
      icon: <Hand className="w-8 h-8" />,
      color: 'from-green-500 to-green-600'
    }
  ];

  const speechGoalTemplates = [
    'Improve articulation of specific sounds',
    'Expand vocabulary and word usage',
    'Develop narrative and storytelling skills',
    'Practice social communication',
    'Work on fluency and rhythm'
  ];

  const otGoalTemplates = [
    'Strengthen fine motor skills',
    'Improve bilateral coordination',
    'Develop sensory processing',
    'Practice daily living skills',
    'Enhance visual-motor integration'
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

  const addGoalFromTemplate = (template: string) => {
    const currentGoals = formData.goals.filter(g => g.trim());
    updateFormData('goals', [...currentGoals, template]);
  };

  const handleSave = () => {
    if (!formData.title.trim()) {
      toast.error('Please enter a session title');
      return;
    }
    if (!activeChild) {
      toast.error('No child selected');
      return;
    }

    const sessionData = {
      childId: activeChild.id,
      type: formData.type,
      title: formData.title,
      description: formData.description,
      date: formData.date,
      duration: formData.duration,
      status: 'scheduled' as const,
      goals: formData.goals.filter(g => g.trim()),
      activities: formData.activities.filter(a => a.trim()),
      notes: formData.notes,
      therapistId: formData.therapistId,
      progress: {
        goalsAchieved: 0,
        totalGoals: formData.goals.filter(g => g.trim()).length,
        notes: ''
      }
    };

    addSession(sessionData);
    onSave();
  };

  const renderStep = () => {
    switch (currentStep) {
      case 0:
        return (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Select Session Type</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {sessionTypes.map((type) => (
                  <motion.button
                    key={type.id}
                    onClick={() => updateFormData('type', type.id)}
                    className={`p-6 rounded-xl border-2 transition-all duration-300 text-left ${
                      formData.type === type.id
                        ? `bg-gradient-to-r ${type.color} text-white border-transparent shadow-lg`
                        : 'bg-white border-gray-200 hover:border-gray-300'
                    }`}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <div className="flex items-center gap-3 mb-3">
                      {type.icon}
                      <span className="font-semibold text-xl">{type.title}</span>
                    </div>
                    <p className={`text-sm ${formData.type === type.id ? 'text-white/90' : 'text-gray-600'}`}>
                      {type.description}
                    </p>
                  </motion.button>
                ))}
              </div>
            </div>
          </div>
        );

      case 1:
        return (
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Session Title *</label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => updateFormData('title', e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Enter session title"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
              <textarea
                value={formData.description}
                onChange={(e) => updateFormData('description', e.target.value)}
                rows={3}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Describe the session focus and objectives"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Date & Time</label>
                <input
                  type="datetime-local"
                  value={formData.date.toISOString().slice(0, 16)}
                  onChange={(e) => updateFormData('date', new Date(e.target.value))}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Duration: {formData.duration} minutes
                </label>
                <input
                  type="range"
                  min="15"
                  max="90"
                  step="15"
                  value={formData.duration}
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
              <div className="flex items-center justify-between mb-4">
                <label className="block text-sm font-medium text-gray-700">Session Goals</label>
                <div className="text-sm text-gray-500">
                  Quick add: 
                  {(formData.type === 'speech' ? speechGoalTemplates : otGoalTemplates).slice(0, 2).map((template, index) => (
                    <button
                      key={index}
                      onClick={() => addGoalFromTemplate(template)}
                      className="ml-2 text-blue-600 hover:text-blue-700 underline"
                    >
                      {template.split(' ').slice(0, 2).join(' ')}...
                    </button>
                  ))}
                </div>
              </div>
              
              {formData.goals.map((goal, index) => (
                <div key={index} className="flex gap-2 mb-2">
                  <input
                    type="text"
                    value={goal}
                    onChange={(e) => updateArrayField('goals', index, e.target.value)}
                    className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Enter session goal"
                  />
                  {formData.goals.length > 1 && (
                    <button
                      onClick={() => removeArrayField('goals', index)}
                      className="p-2 text-red-500 hover:bg-red-50 rounded-lg"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              ))}
              <button
                onClick={() => addArrayField('goals')}
                className="flex items-center gap-2 text-blue-600 hover:text-blue-700 font-medium"
              >
                <Plus className="w-4 h-4" /> Add Goal
              </button>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Planned Activities</label>
              {formData.activities.map((activity, index) => (
                <div key={index} className="flex gap-2 mb-2">
                  <input
                    type="text"
                    value={activity}
                    onChange={(e) => updateArrayField('activities', index, e.target.value)}
                    className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Enter planned activity"
                  />
                  {formData.activities.length > 1 && (
                    <button
                      onClick={() => removeArrayField('activities', index)}
                      className="p-2 text-red-500 hover:bg-red-50 rounded-lg"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              ))}
              <button
                onClick={() => addArrayField('activities')}
                className="flex items-center gap-2 text-blue-600 hover:text-blue-700 font-medium"
              >
                <Plus className="w-4 h-4" /> Add Activity
              </button>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Session Notes</label>
              <textarea
                value={formData.notes}
                onChange={(e) => updateFormData('notes', e.target.value)}
                rows={3}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Any additional notes or preparation needed"
              />
            </div>
          </div>
        );

      case 3:
        return (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Session Summary</h3>
              <div className="bg-gray-50 rounded-lg p-6">
                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div>
                    <span className="font-medium text-gray-700">Type:</span>
                    <span className="ml-2 capitalize">{formData.type} Therapy</span>
                  </div>
                  <div>
                    <span className="font-medium text-gray-700">Duration:</span>
                    <span className="ml-2">{formData.duration} minutes</span>
                  </div>
                  <div>
                    <span className="font-medium text-gray-700">Date:</span>
                    <span className="ml-2">{formData.date.toLocaleDateString()}</span>
                  </div>
                  <div>
                    <span className="font-medium text-gray-700">Child:</span>
                    <span className="ml-2">{activeChild?.name}</span>
                  </div>
                </div>

                <div className="mb-4">
                  <h4 className="font-medium text-gray-700 mb-2">Title:</h4>
                  <p className="text-gray-900">{formData.title}</p>
                </div>

                {formData.description && (
                  <div className="mb-4">
                    <h4 className="font-medium text-gray-700 mb-2">Description:</h4>
                    <p className="text-gray-900">{formData.description}</p>
                  </div>
                )}

                <div className="mb-4">
                  <h4 className="font-medium text-gray-700 mb-2">Goals:</h4>
                  <ul className="list-disc list-inside text-gray-900">
                    {formData.goals.filter(g => g.trim()).map((goal, index) => (
                      <li key={index}>{goal}</li>
                    ))}
                  </ul>
                </div>

                <div>
                  <h4 className="font-medium text-gray-700 mb-2">Activities:</h4>
                  <ul className="list-disc list-inside text-gray-900">
                    {formData.activities.filter(a => a.trim()).map((activity, index) => (
                      <li key={index}>{activity}</li>
                    ))}
                  </ul>
                </div>
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
        className="bg-white rounded-2xl max-w-3xl w-full max-h-[90vh] overflow-hidden"
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Create Therapy Session</h2>
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
                Create Session
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

export default TherapySessionCreator;