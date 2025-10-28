import React from 'react';
import { motion } from 'framer-motion';
import { 
  X, 
  Play, 
  Clock, 
  Users, 
  Target, 
  Star, 
  Heart, 
  Share2,
  Download,
  Camera,
  Music,
  Brain,
  CheckCircle,
  AlertCircle,
  Lightbulb
} from 'lucide-react';
import { Activity } from '../store/activityStore';

interface ActivityPreviewProps {
  activity: Activity;
  onClose: () => void;
  onStart: () => void;
}

const ActivityPreview: React.FC<ActivityPreviewProps> = ({ activity, onClose, onStart }) => {
  const methodologyColors = {
    montessori: 'from-blue-500 to-blue-600',
    reggio: 'from-green-500 to-green-600',
    waldorf: 'from-purple-500 to-purple-600',
    highscope: 'from-orange-500 to-orange-600',
    bankstreet: 'from-pink-500 to-pink-600'
  };

  const methodologyIcons = {
    montessori: Target,
    reggio: Camera,
    waldorf: Music,
    highscope: Brain,
    bankstreet: Users
  };

  const getDifficultyColor = (difficulty: number) => {
    switch (difficulty) {
      case 1: return 'text-green-600 bg-green-100';
      case 2: return 'text-blue-600 bg-blue-100';
      case 3: return 'text-yellow-600 bg-yellow-100';
      case 4: return 'text-orange-600 bg-orange-100';
      case 5: return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getDifficultyText = (difficulty: number) => {
    switch (difficulty) {
      case 1: return 'Beginner';
      case 2: return 'Easy';
      case 3: return 'Medium';
      case 4: return 'Hard';
      case 5: return 'Expert';
      default: return 'Unknown';
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
        <div className="relative">
          {activity.media.images.length > 0 ? (
            <div className="h-64 overflow-hidden">
              <img 
                src={activity.media.images[0]} 
                alt={activity.title}
                className="w-full h-full object-cover"
              />
            </div>
          ) : (
            <div className="h-64 bg-gradient-to-br from-blue-100 to-green-100 flex items-center justify-center">
              <Play className="w-16 h-16 text-blue-600" />
            </div>
          )}
          
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 bg-white/90 rounded-full text-gray-600 hover:text-gray-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>

          <div className={`absolute top-4 left-4 px-3 py-1 rounded-full text-sm font-medium ${getDifficultyColor(activity.difficulty)}`}>
            {getDifficultyText(activity.difficulty)}
          </div>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[60vh]">
          <div className="mb-6">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">{activity.title}</h1>
            <p className="text-gray-600 text-lg leading-relaxed">{activity.description}</p>
          </div>

          {/* Meta Information */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            <div className="bg-gray-50 rounded-lg p-4 text-center">
              <Clock className="w-6 h-6 text-blue-600 mx-auto mb-2" />
              <div className="text-sm text-gray-600">Duration</div>
              <div className="font-semibold text-gray-900">{activity.duration} min</div>
            </div>
            
            <div className="bg-gray-50 rounded-lg p-4 text-center">
              <Target className="w-6 h-6 text-green-600 mx-auto mb-2" />
              <div className="text-sm text-gray-600">Age Range</div>
              <div className="font-semibold text-gray-900">{activity.ageRange[0]}-{activity.ageRange[1]} years</div>
            </div>
            
            <div className="bg-gray-50 rounded-lg p-4 text-center">
              <Star className="w-6 h-6 text-yellow-600 mx-auto mb-2" />
              <div className="text-sm text-gray-600">Rating</div>
              <div className="font-semibold text-gray-900">{activity.rating} ({activity.reviews})</div>
            </div>
            
            <div className="bg-gray-50 rounded-lg p-4 text-center">
              <Users className="w-6 h-6 text-purple-600 mx-auto mb-2" />
              <div className="text-sm text-gray-600">Category</div>
              <div className="font-semibold text-gray-900">{activity.category}</div>
            </div>
          </div>

          {/* Methodologies */}
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-3">Educational Approaches</h3>
            <div className="flex flex-wrap gap-3">
              {activity.methodologies.map((method) => {
                const Icon = methodologyIcons[method];
                const color = methodologyColors[method];
                return (
                  <div
                    key={method}
                    className={`flex items-center gap-2 px-4 py-2 rounded-full text-white font-medium bg-gradient-to-r ${color}`}
                  >
                    <Icon className="w-4 h-4" />
                    <span className="capitalize">{method}</span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Materials */}
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-3">Materials Needed</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
              {activity.materials.map((material, index) => (
                <div key={index} className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-green-600 flex-shrink-0" />
                  <span className="text-gray-700">{material}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Instructions */}
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-3">Step-by-Step Instructions</h3>
            <div className="space-y-4">
              {activity.instructions.map((instruction, index) => (
                <div key={index} className="flex gap-4">
                  <div className="flex-shrink-0 w-8 h-8 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-sm font-semibold">
                    {index + 1}
                  </div>
                  <p className="text-gray-700 pt-1">{instruction}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Learning Objectives */}
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-3">Learning Objectives</h3>
            <div className="space-y-2">
              {activity.learningObjectives.map((objective, index) => (
                <div key={index} className="flex items-center gap-2">
                  <Lightbulb className="w-4 h-4 text-yellow-600 flex-shrink-0" />
                  <span className="text-gray-700">{objective}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Developmental Areas */}
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-3">Developmental Areas</h3>
            <div className="flex flex-wrap gap-2">
              {activity.developmentalAreas.map((area) => (
                <span
                  key={area}
                  className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm font-medium"
                >
                  {area}
                </span>
              ))}
            </div>
          </div>

          {/* Therapy Targets */}
          {(activity.speechTargets?.length || activity.otTargets?.length) && (
            <div className="mb-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-3">Therapy Integration</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {activity.speechTargets && activity.speechTargets.length > 0 && (
                  <div>
                    <h4 className="font-medium text-gray-900 mb-2">Speech Therapy Targets</h4>
                    <div className="space-y-1">
                      {activity.speechTargets.map((target, index) => (
                        <div key={index} className="flex items-center gap-2">
                          <div className="w-2 h-2 bg-green-500 rounded-full" />
                          <span className="text-gray-700 text-sm">{target}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                
                {activity.otTargets && activity.otTargets.length > 0 && (
                  <div>
                    <h4 className="font-medium text-gray-900 mb-2">OT Targets</h4>
                    <div className="space-y-1">
                      {activity.otTargets.map((target, index) => (
                        <div key={index} className="flex items-center gap-2">
                          <div className="w-2 h-2 bg-purple-500 rounded-full" />
                          <span className="text-gray-700 text-sm">{target}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Adaptations */}
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-3">Adaptations</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-blue-50 rounded-lg p-4">
                <h4 className="font-medium text-blue-900 mb-2">Sensory</h4>
                <div className="space-y-1">
                  {activity.adaptations.sensory.map((adaptation, index) => (
                    <p key={index} className="text-blue-800 text-sm">{adaptation}</p>
                  ))}
                </div>
              </div>
              
              <div className="bg-green-50 rounded-lg p-4">
                <h4 className="font-medium text-green-900 mb-2">Motor</h4>
                <div className="space-y-1">
                  {activity.adaptations.motor.map((adaptation, index) => (
                    <p key={index} className="text-green-800 text-sm">{adaptation}</p>
                  ))}
                </div>
              </div>
              
              <div className="bg-purple-50 rounded-lg p-4">
                <h4 className="font-medium text-purple-900 mb-2">Cognitive</h4>
                <div className="space-y-1">
                  {activity.adaptations.cognitive.map((adaptation, index) => (
                    <p key={index} className="text-purple-800 text-sm">{adaptation}</p>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Assessment */}
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-3">Assessment & Observation</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h4 className="font-medium text-gray-900 mb-2">Observation Points</h4>
                <div className="space-y-2">
                  {activity.assessment.observationPoints.map((point, index) => (
                    <div key={index} className="flex items-start gap-2">
                      <AlertCircle className="w-4 h-4 text-orange-600 flex-shrink-0 mt-0.5" />
                      <span className="text-gray-700 text-sm">{point}</span>
                    </div>
                  ))}
                </div>
              </div>
              
              <div>
                <h4 className="font-medium text-gray-900 mb-2">Milestones</h4>
                <div className="space-y-2">
                  {activity.assessment.milestones.map((milestone, index) => (
                    <div key={index} className="flex items-start gap-2">
                      <Star className="w-4 h-4 text-yellow-600 flex-shrink-0 mt-0.5" />
                      <span className="text-gray-700 text-sm">{milestone}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between p-6 border-t border-gray-200">
          <div className="flex items-center gap-4">
            <button className="flex items-center gap-2 text-gray-600 hover:text-red-500 transition-colors">
              <Heart className="w-5 h-5" />
              <span>Save</span>
            </button>
            <button className="flex items-center gap-2 text-gray-600 hover:text-blue-500 transition-colors">
              <Share2 className="w-5 h-5" />
              <span>Share</span>
            </button>
            <button className="flex items-center gap-2 text-gray-600 hover:text-green-500 transition-colors">
              <Download className="w-5 h-5" />
              <span>Download</span>
            </button>
          </div>
          
          <motion.button
            onClick={onStart}
            className="bg-gradient-to-r from-blue-600 to-green-600 text-white px-8 py-3 rounded-xl font-semibold hover:shadow-lg transition-all duration-300 flex items-center gap-2"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <Play className="w-5 h-5" />
            Start Activity
          </motion.button>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default ActivityPreview;