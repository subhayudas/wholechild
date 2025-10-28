import React from 'react';
import { motion } from 'framer-motion';
import { 
  Star, 
  Clock, 
  Users, 
  Target, 
  Heart, 
  Play, 
  Edit3, 
  Trash2, 
  Copy, 
  Share2,
  Eye,
  MoreVertical,
  Camera,
  Music,
  Brain,
  User,
  Lightbulb
} from 'lucide-react';
import { Activity } from '../store/activityStore';

interface ActivityCardProps {
  activity: Activity;
  viewMode: 'grid' | 'list';
  isFavorite: boolean;
  onToggleFavorite: () => void;
  onPreview: () => void;
  onStart: () => void;
  onEdit: () => void;
  onDuplicate: () => void;
  onShare: () => void;
  onDelete: () => void;
}

const ActivityCard: React.FC<ActivityCardProps> = ({
  activity,
  viewMode,
  isFavorite,
  onToggleFavorite,
  onPreview,
  onStart,
  onEdit,
  onDuplicate,
  onShare,
  onDelete
}) => {
  const [showActions, setShowActions] = React.useState(false);

  const methodologyColors = {
    montessori: 'from-blue-500 to-blue-600',
    reggio: 'from-green-500 to-green-600',
    waldorf: 'from-purple-500 to-purple-600',
    highscope: 'from-orange-500 to-orange-600',
    bankstreet: 'from-pink-500 to-pink-600',
    'play-based': 'from-yellow-500 to-orange-600',
    'inquiry-based': 'from-cyan-500 to-blue-600'
  };

  const methodologyIcons = {
    montessori: Target,
    reggio: Camera,
    waldorf: Music,
    highscope: Brain,
    bankstreet: Users,
    'play-based': Play,
    'inquiry-based': Lightbulb
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

  if (viewMode === 'list') {
    return (
      <motion.div
        className="bg-white rounded-xl p-6 shadow-sm hover:shadow-lg transition-all duration-300 border border-gray-100"
        whileHover={{ y: -2 }}
      >
        <div className="flex items-start gap-6">
          {/* Activity Image */}
          <div className="w-24 h-24 rounded-lg overflow-hidden flex-shrink-0">
            {activity.media.images.length > 0 ? (
              <img 
                src={activity.media.images[0]} 
                alt={activity.title}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full bg-gradient-to-br from-blue-100 to-green-100 flex items-center justify-center">
                <User className="w-8 h-8 text-blue-600" />
              </div>
            )}
          </div>

          {/* Content */}
          <div className="flex-1">
            <div className="flex items-start justify-between mb-3">
              <div>
                <h3 className="text-xl font-bold text-gray-900 mb-1">{activity.title}</h3>
                <p className="text-gray-600 line-clamp-2">{activity.description}</p>
              </div>
              
              <div className="flex items-center gap-2">
                <button
                  onClick={onToggleFavorite}
                  className={`p-2 rounded-lg transition-colors ${
                    isFavorite ? 'text-red-500 bg-red-50' : 'text-gray-400 hover:text-red-500'
                  }`}
                >
                  <Heart className={`w-5 h-5 ${isFavorite ? 'fill-current' : ''}`} />
                </button>
                
                <div className="relative">
                  <button
                    onClick={() => setShowActions(!showActions)}
                    className="p-2 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-50"
                  >
                    <MoreVertical className="w-5 h-5" />
                  </button>
                  
                  {showActions && (
                    <div className="absolute right-0 top-full mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-10">
                      <button onClick={onPreview} className="w-full px-4 py-2 text-left hover:bg-gray-50 flex items-center gap-2">
                        <Eye className="w-4 h-4" /> Preview
                      </button>
                      <button onClick={onEdit} className="w-full px-4 py-2 text-left hover:bg-gray-50 flex items-center gap-2">
                        <Edit3 className="w-4 h-4" /> Edit
                      </button>
                      <button onClick={onDuplicate} className="w-full px-4 py-2 text-left hover:bg-gray-50 flex items-center gap-2">
                        <Copy className="w-4 h-4" /> Duplicate
                      </button>
                      <button onClick={onShare} className="w-full px-4 py-2 text-left hover:bg-gray-50 flex items-center gap-2">
                        <Share2 className="w-4 h-4" /> Share
                      </button>
                      <hr className="my-2" />
                      <button onClick={onDelete} className="w-full px-4 py-2 text-left hover:bg-gray-50 flex items-center gap-2 text-red-600">
                        <Trash2 className="w-4 h-4" /> Delete
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Methodologies */}
            <div className="flex flex-wrap gap-2 mb-4">
              {activity.methodologies.map((method) => {
                const Icon = methodologyIcons[method];
                const color = methodologyColors[method];
                return (
                  <div
                    key={method}
                    className={`flex items-center gap-1 px-3 py-1 rounded-full text-white text-sm font-medium bg-gradient-to-r ${color}`}
                  >
                    <Icon className="w-3 h-3" />
                    <span className="capitalize">{method.replace('-', ' ')}</span>
                  </div>
                );
              })}
            </div>

            {/* Meta Info */}
            <div className="flex items-center gap-6 text-sm text-gray-500 mb-4">
              <div className="flex items-center gap-1">
                <Clock className="w-4 h-4" />
                {activity.duration} min
              </div>
              <div className="flex items-center gap-1">
                <Target className="w-4 h-4" />
                Ages {activity.ageRange[0]}-{activity.ageRange[1]}
              </div>
              <div className={`px-2 py-1 rounded-full text-xs font-medium ${getDifficultyColor(activity.difficulty)}`}>
                {getDifficultyText(activity.difficulty)}
              </div>
              <div className="flex items-center gap-1">
                <Star className="w-4 h-4 text-yellow-500" />
                {activity.rating} ({activity.reviews})
              </div>
            </div>

            {/* Action Button */}
            <motion.button
              onClick={onStart}
              className="bg-gradient-to-r from-blue-600 to-green-600 text-white px-6 py-2 rounded-lg font-semibold hover:shadow-lg transition-all duration-300 flex items-center gap-2"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <User className="w-4 h-4" />
              Start Parent Guide
            </motion.button>
          </div>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      className="bg-white rounded-xl shadow-sm hover:shadow-lg transition-all duration-300 border border-gray-100 overflow-hidden"
      whileHover={{ y: -4 }}
    >
      {/* Activity Image */}
      <div className="relative h-48 overflow-hidden">
        {activity.media.images.length > 0 ? (
          <img 
            src={activity.media.images[0]} 
            alt={activity.title}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-blue-100 to-green-100 flex items-center justify-center">
            <User className="w-12 h-12 text-blue-600" />
          </div>
        )}
        
        {/* Overlay Actions */}
        <div className="absolute top-4 right-4 flex gap-2">
          <button
            onClick={onToggleFavorite}
            className={`p-2 rounded-full backdrop-blur-sm transition-colors ${
              isFavorite 
                ? 'bg-red-500 text-white' 
                : 'bg-white/80 text-gray-600 hover:bg-red-500 hover:text-white'
            }`}
          >
            <Heart className={`w-4 h-4 ${isFavorite ? 'fill-current' : ''}`} />
          </button>
          
          <div className="relative">
            <button
              onClick={() => setShowActions(!showActions)}
              className="p-2 rounded-full bg-white/80 text-gray-600 hover:bg-white transition-colors"
            >
              <MoreVertical className="w-4 h-4" />
            </button>
            
            {showActions && (
              <div className="absolute right-0 top-full mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-10">
                <button onClick={onPreview} className="w-full px-4 py-2 text-left hover:bg-gray-50 flex items-center gap-2">
                  <Eye className="w-4 h-4" /> Preview
                </button>
                <button onClick={onEdit} className="w-full px-4 py-2 text-left hover:bg-gray-50 flex items-center gap-2">
                  <Edit3 className="w-4 h-4" /> Edit
                </button>
                <button onClick={onDuplicate} className="w-full px-4 py-2 text-left hover:bg-gray-50 flex items-center gap-2">
                  <Copy className="w-4 h-4" /> Duplicate
                </button>
                <button onClick={onShare} className="w-full px-4 py-2 text-left hover:bg-gray-50 flex items-center gap-2">
                  <Share2 className="w-4 h-4" /> Share
                </button>
                <hr className="my-2" />
                <button onClick={onDelete} className="w-full px-4 py-2 text-left hover:bg-gray-50 flex items-center gap-2 text-red-600">
                  <Trash2 className="w-4 h-4" /> Delete
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Difficulty Badge */}
        <div className={`absolute top-4 left-4 px-2 py-1 rounded-full text-xs font-medium ${getDifficultyColor(activity.difficulty)}`}>
          {getDifficultyText(activity.difficulty)}
        </div>

        {/* Parent Guide Badge */}
        <div className="absolute bottom-4 left-4 px-3 py-1 bg-blue-600 text-white rounded-full text-xs font-medium flex items-center gap-1">
          <User className="w-3 h-3" />
          Parent Guided
        </div>
      </div>

      {/* Content */}
      <div className="p-6">
        <div className="mb-3">
          <h3 className="text-lg font-bold text-gray-900 mb-1">{activity.title}</h3>
          <p className="text-gray-600 text-sm line-clamp-2">{activity.description}</p>
        </div>

        {/* Methodologies */}
        <div className="flex flex-wrap gap-1 mb-4">
          {activity.methodologies.map((method) => {
            const Icon = methodologyIcons[method];
            const color = methodologyColors[method];
            return (
              <div
                key={method}
                className={`flex items-center gap-1 px-2 py-1 rounded-full text-white text-xs font-medium bg-gradient-to-r ${color}`}
              >
                <Icon className="w-3 h-3" />
                <span className="capitalize">{method.replace('-', ' ')}</span>
              </div>
            );
          })}
        </div>

        {/* Meta Info */}
        <div className="flex items-center justify-between text-sm text-gray-500 mb-4">
          <div className="flex items-center gap-1">
            <Clock className="w-4 h-4" />
            {activity.duration}m
          </div>
          <div className="flex items-center gap-1">
            <Target className="w-4 h-4" />
            {activity.ageRange[0]}-{activity.ageRange[1]}y
          </div>
          <div className="flex items-center gap-1">
            <Star className="w-4 h-4 text-yellow-500" />
            {activity.rating}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-2">
          <motion.button
            onClick={onStart}
            className="flex-1 bg-gradient-to-r from-blue-600 to-green-600 text-white py-2 rounded-lg font-semibold hover:shadow-lg transition-all duration-300 flex items-center justify-center gap-2"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <User className="w-4 h-4" />
            Guide
          </motion.button>
          
          <motion.button
            onClick={onPreview}
            className="px-4 py-2 bg-gray-100 text-gray-600 rounded-lg hover:bg-gray-200 transition-colors"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <Eye className="w-4 h-4" />
          </motion.button>
        </div>
      </div>
    </motion.div>
  );
};

export default ActivityCard;