import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  X, 
  Save, 
  Upload, 
  Camera, 
  User, 
  Calendar, 
  Heart, 
  Brain, 
  Palette, 
  Music, 
  Users, 
  Target,
  Plus,
  Trash2,
  Edit3,
  Check
} from 'lucide-react';
import { Child, useChildStore } from '../store/childStore';
import toast from 'react-hot-toast';

interface ChildProfileFormProps {
  child?: Child | null;
  onClose: () => void;
  onSave: () => void;
}

const ChildProfileForm: React.FC<ChildProfileFormProps> = ({ child, onClose, onSave }) => {
  const { addChild, updateChild } = useChildStore();
  const [currentStep, setCurrentStep] = useState(0);
  const [formData, setFormData] = useState({
    name: '',
    age: 3,
    avatar: '',
    interests: [''],
    sensoryNeeds: [''],
    speechGoals: [''],
    otGoals: [''],
    developmentalProfile: {
      cognitive: 50,
      language: 50,
      social: 50,
      physical: 50,
      creative: 50
    },
    currentLevel: {
      math: 1,
      reading: 1,
      writing: 1,
      science: 1
    },
    preferences: {
      learningStyle: 'mixed' as 'visual' | 'auditory' | 'kinesthetic' | 'mixed',
      energyLevel: 'medium' as 'low' | 'medium' | 'high',
      socialPreference: 'small-group' as 'independent' | 'small-group' | 'large-group'
    },
    medicalInfo: {
      allergies: [''],
      medications: [''],
      specialNeeds: [''],
      emergencyContact: {
        name: '',
        phone: '',
        relationship: ''
      }
    },
    schoolInfo: {
      schoolName: '',
      teacherName: '',
      grade: '',
      iep: false,
      accommodations: ['']
    }
  });

  useEffect(() => {
    if (child) {
      setFormData({
        name: child.name,
        age: child.age,
        avatar: child.avatar || '',
        interests: child.interests.length ? child.interests : [''],
        sensoryNeeds: child.sensoryNeeds.length ? child.sensoryNeeds : [''],
        speechGoals: child.speechGoals.length ? child.speechGoals : [''],
        otGoals: child.otGoals.length ? child.otGoals : [''],
        developmentalProfile: child.developmentalProfile,
        currentLevel: child.currentLevel,
        preferences: child.preferences,
        medicalInfo: {
          allergies: [''],
          medications: [''],
          specialNeeds: [''],
          emergencyContact: {
            name: '',
            phone: '',
            relationship: ''
          }
        },
        schoolInfo: {
          schoolName: '',
          teacherName: '',
          grade: '',
          iep: false,
          accommodations: ['']
        }
      });
    }
  }, [child]);

  const steps = [
    { title: 'Basic Info', icon: User },
    { title: 'Interests & Needs', icon: Heart },
    { title: 'Development', icon: Brain },
    { title: 'Learning Style', icon: Palette },
    { title: 'Goals & Support', icon: Target },
    { title: 'Review', icon: Check }
  ];

  const interestOptions = [
    'Art & Drawing', 'Music & Singing', 'Building & Construction', 'Nature & Animals',
    'Books & Stories', 'Puzzles & Games', 'Sports & Movement', 'Science & Experiments',
    'Cooking & Baking', 'Dancing', 'Technology', 'Dramatic Play'
  ];

  const sensoryNeedsOptions = [
    'Movement breaks', 'Quiet spaces', 'Tactile input', 'Deep pressure',
    'Visual supports', 'Noise reduction', 'Fidget tools', 'Weighted items',
    'Sensory bins', 'Calming music', 'Bright lighting', 'Dim lighting'
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

  const toggleInterest = (interest: string) => {
    const currentInterests = formData.interests.filter(i => i.trim());
    const newInterests = currentInterests.includes(interest)
      ? currentInterests.filter(i => i !== interest)
      : [...currentInterests, interest];
    updateFormData('interests', newInterests.length ? newInterests : ['']);
  };

  const toggleSensoryNeed = (need: string) => {
    const currentNeeds = formData.sensoryNeeds.filter(n => n.trim());
    const newNeeds = currentNeeds.includes(need)
      ? currentNeeds.filter(n => n !== need)
      : [...currentNeeds, need];
    updateFormData('sensoryNeeds', newNeeds.length ? newNeeds : ['']);
  };

  const handleSave = () => {
    if (!formData.name.trim()) {
      toast.error('Please enter a name');
      return;
    }

    const childData = {
      ...formData,
      interests: formData.interests.filter(i => i.trim()),
      sensoryNeeds: formData.sensoryNeeds.filter(n => n.trim()),
      speechGoals: formData.speechGoals.filter(g => g.trim()),
      otGoals: formData.otGoals.filter(g => g.trim())
    };

    if (child) {
      updateChild(child.id, childData);
      toast.success('Profile updated successfully!');
    } else {
      addChild(childData);
      toast.success('Profile created successfully!');
    }

    onSave();
  };

  const renderStep = () => {
    switch (currentStep) {
      case 0:
        return (
          <div className="space-y-6">
            <div className="text-center">
              <div className="relative w-32 h-32 mx-auto mb-6">
                {formData.avatar ? (
                  <img 
                    src={formData.avatar} 
                    alt="Child avatar"
                    className="w-full h-full rounded-full object-cover border-4 border-blue-100"
                  />
                ) : (
                  <div className="w-full h-full rounded-full bg-gradient-to-br from-blue-100 to-green-100 flex items-center justify-center border-4 border-blue-100">
                    <User className="w-12 h-12 text-blue-600" />
                  </div>
                )}
                <button className="absolute bottom-2 right-2 w-10 h-10 bg-blue-600 text-white rounded-full flex items-center justify-center hover:bg-blue-700 transition-colors">
                  <Camera className="w-5 h-5" />
                </button>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Child's Name *</label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => updateFormData('name', e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Enter child's name"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Age: {formData.age} years old
              </label>
              <input
                type="range"
                min="2"
                max="8"
                value={formData.age}
                onChange={(e) => updateFormData('age', parseInt(e.target.value))}
                className="w-full"
              />
              <div className="flex justify-between text-sm text-gray-500 mt-1">
                <span>2 years</span>
                <span>8 years</span>
              </div>
            </div>
          </div>
        );

      case 1:
        return (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Interests & Hobbies</h3>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {interestOptions.map((interest) => {
                  const isSelected = formData.interests.includes(interest);
                  return (
                    <motion.button
                      key={interest}
                      onClick={() => toggleInterest(interest)}
                      className={`p-3 rounded-lg border-2 transition-all duration-300 text-sm ${
                        isSelected
                          ? 'bg-blue-100 border-blue-300 text-blue-700'
                          : 'bg-white border-gray-200 hover:border-blue-200'
                      }`}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      {interest}
                    </motion.button>
                  );
                })}
              </div>
            </div>

            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Sensory Needs</h3>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {sensoryNeedsOptions.map((need) => {
                  const isSelected = formData.sensoryNeeds.includes(need);
                  return (
                    <motion.button
                      key={need}
                      onClick={() => toggleSensoryNeed(need)}
                      className={`p-3 rounded-lg border-2 transition-all duration-300 text-sm ${
                        isSelected
                          ? 'bg-green-100 border-green-300 text-green-700'
                          : 'bg-white border-gray-200 hover:border-green-200'
                      }`}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      {need}
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
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Developmental Profile</h3>
              <p className="text-gray-600 mb-6">Rate your child's current development in each area (1-100)</p>
              
              <div className="space-y-6">
                {Object.entries(formData.developmentalProfile).map(([area, value]) => {
                  const icons = {
                    cognitive: Brain,
                    language: Music,
                    social: Users,
                    physical: Target,
                    creative: Palette
                  };
                  const Icon = icons[area as keyof typeof icons];
                  
                  return (
                    <div key={area}>
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <Icon className="w-5 h-5 text-blue-600" />
                          <span className="font-medium text-gray-900 capitalize">{area}</span>
                        </div>
                        <span className="text-sm text-gray-600">{value}%</span>
                      </div>
                      <input
                        type="range"
                        min="0"
                        max="100"
                        value={value}
                        onChange={(e) => updateNestedData('developmentalProfile', area, parseInt(e.target.value))}
                        className="w-full"
                      />
                    </div>
                  );
                })}
              </div>
            </div>

            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Current Academic Levels</h3>
              <div className="grid grid-cols-2 gap-4">
                {Object.entries(formData.currentLevel).map(([subject, level]) => (
                  <div key={subject}>
                    <label className="block text-sm font-medium text-gray-700 mb-2 capitalize">
                      {subject}
                    </label>
                    <select
                      value={level}
                      onChange={(e) => updateNestedData('currentLevel', subject, parseInt(e.target.value))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value={1}>Beginner</option>
                      <option value={2}>Developing</option>
                      <option value={3}>Proficient</option>
                      <option value={4}>Advanced</option>
                      <option value={5}>Expert</option>
                    </select>
                  </div>
                ))}
              </div>
            </div>
          </div>
        );

      case 3:
        return (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Learning Preferences</h3>
              
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-3">Learning Style</label>
                  <div className="grid grid-cols-2 gap-3">
                    {[
                      { value: 'visual', label: 'Visual', description: 'Learns through seeing' },
                      { value: 'auditory', label: 'Auditory', description: 'Learns through hearing' },
                      { value: 'kinesthetic', label: 'Kinesthetic', description: 'Learns through movement' },
                      { value: 'mixed', label: 'Mixed', description: 'Combination of styles' }
                    ].map((style) => (
                      <motion.button
                        key={style.value}
                        onClick={() => updateNestedData('preferences', 'learningStyle', style.value)}
                        className={`p-4 rounded-lg border-2 transition-all duration-300 text-left ${
                          formData.preferences.learningStyle === style.value
                            ? 'bg-blue-100 border-blue-300 text-blue-700'
                            : 'bg-white border-gray-200 hover:border-blue-200'
                        }`}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                      >
                        <div className="font-medium">{style.label}</div>
                        <div className="text-sm opacity-75">{style.description}</div>
                      </motion.button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-3">Energy Level</label>
                  <div className="grid grid-cols-3 gap-3">
                    {[
                      { value: 'low', label: 'Calm', description: 'Prefers quiet activities' },
                      { value: 'medium', label: 'Balanced', description: 'Mix of active and calm' },
                      { value: 'high', label: 'Active', description: 'Loves movement and action' }
                    ].map((energy) => (
                      <motion.button
                        key={energy.value}
                        onClick={() => updateNestedData('preferences', 'energyLevel', energy.value)}
                        className={`p-4 rounded-lg border-2 transition-all duration-300 text-center ${
                          formData.preferences.energyLevel === energy.value
                            ? 'bg-green-100 border-green-300 text-green-700'
                            : 'bg-white border-gray-200 hover:border-green-200'
                        }`}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                      >
                        <div className="font-medium">{energy.label}</div>
                        <div className="text-sm opacity-75">{energy.description}</div>
                      </motion.button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-3">Social Preference</label>
                  <div className="grid grid-cols-3 gap-3">
                    {[
                      { value: 'independent', label: 'Solo', description: 'Works best alone' },
                      { value: 'small-group', label: 'Small Group', description: '2-4 children' },
                      { value: 'large-group', label: 'Large Group', description: '5+ children' }
                    ].map((social) => (
                      <motion.button
                        key={social.value}
                        onClick={() => updateNestedData('preferences', 'socialPreference', social.value)}
                        className={`p-4 rounded-lg border-2 transition-all duration-300 text-center ${
                          formData.preferences.socialPreference === social.value
                            ? 'bg-purple-100 border-purple-300 text-purple-700'
                            : 'bg-white border-gray-200 hover:border-purple-200'
                        }`}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                      >
                        <div className="font-medium">{social.label}</div>
                        <div className="text-sm opacity-75">{social.description}</div>
                      </motion.button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        );

      case 4:
        return (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Speech Therapy Goals</h3>
              {formData.speechGoals.map((goal, index) => (
                <div key={index} className="flex gap-2 mb-2">
                  <input
                    type="text"
                    value={goal}
                    onChange={(e) => updateArrayField('speechGoals', index, e.target.value)}
                    className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Enter speech therapy goal"
                  />
                  {formData.speechGoals.length > 1 && (
                    <button
                      onClick={() => removeArrayField('speechGoals', index)}
                      className="p-2 text-red-500 hover:bg-red-50 rounded-lg"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              ))}
              <button
                onClick={() => addArrayField('speechGoals')}
                className="flex items-center gap-2 text-blue-600 hover:text-blue-700 font-medium"
              >
                <Plus className="w-4 h-4" /> Add Speech Goal
              </button>
            </div>

            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Occupational Therapy Goals</h3>
              {formData.otGoals.map((goal, index) => (
                <div key={index} className="flex gap-2 mb-2">
                  <input
                    type="text"
                    value={goal}
                    onChange={(e) => updateArrayField('otGoals', index, e.target.value)}
                    className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Enter OT goal"
                  />
                  {formData.otGoals.length > 1 && (
                    <button
                      onClick={() => removeArrayField('otGoals', index)}
                      className="p-2 text-red-500 hover:bg-red-50 rounded-lg"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              ))}
              <button
                onClick={() => addArrayField('otGoals')}
                className="flex items-center gap-2 text-blue-600 hover:text-blue-700 font-medium"
              >
                <Plus className="w-4 h-4" /> Add OT Goal
              </button>
            </div>
          </div>
        );

      case 5:
        return (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Profile Summary</h3>
              <div className="bg-gray-50 rounded-lg p-6">
                <div className="flex items-center gap-4 mb-4">
                  {formData.avatar ? (
                    <img 
                      src={formData.avatar} 
                      alt={formData.name}
                      className="w-16 h-16 rounded-full object-cover"
                    />
                  ) : (
                    <div className="w-16 h-16 rounded-full bg-gradient-to-br from-blue-100 to-green-100 flex items-center justify-center">
                      <User className="w-8 h-8 text-blue-600" />
                    </div>
                  )}
                  <div>
                    <h4 className="text-xl font-bold text-gray-900">{formData.name}</h4>
                    <p className="text-gray-600">{formData.age} years old</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="font-medium text-gray-700">Learning Style:</span>
                    <span className="ml-2 capitalize">{formData.preferences.learningStyle}</span>
                  </div>
                  <div>
                    <span className="font-medium text-gray-700">Energy Level:</span>
                    <span className="ml-2 capitalize">{formData.preferences.energyLevel}</span>
                  </div>
                  <div>
                    <span className="font-medium text-gray-700">Social Preference:</span>
                    <span className="ml-2 capitalize">{formData.preferences.socialPreference.replace('-', ' ')}</span>
                  </div>
                </div>

                <div className="mt-4">
                  <span className="font-medium text-gray-700">Interests:</span>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {formData.interests.filter(i => i.trim()).map((interest, index) => (
                      <span key={index} className="px-2 py-1 bg-blue-100 text-blue-700 rounded-full text-xs">
                        {interest}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="mt-4">
                  <span className="font-medium text-gray-700">Sensory Needs:</span>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {formData.sensoryNeeds.filter(n => n.trim()).map((need, index) => (
                      <span key={index} className="px-2 py-1 bg-green-100 text-green-700 rounded-full text-xs">
                        {need}
                      </span>
                    ))}
                  </div>
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
        className="bg-white rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden"
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">
              {child ? 'Edit Profile' : 'Create Child Profile'}
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
                Save Profile
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

export default ChildProfileForm;