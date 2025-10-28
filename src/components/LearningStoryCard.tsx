import React from 'react';
import { motion } from 'framer-motion';
import { 
  Heart, 
  MessageCircle, 
  Share2, 
  Eye, 
  Edit3, 
  Trash2, 
  Camera, 
  Video, 
  Calendar,
  User,
  Star,
  MoreVertical
} from 'lucide-react';
import { LearningStory } from '../store/learningStoryStore';
import { useChildStore } from '../store/childStore';

interface LearningStoryCardProps {
  story: LearningStory;
  onView: () => void;
  onEdit: () => void;
  onDelete: () => void;
  onReact: (type: 'hearts' | 'celebrations' | 'insights') => void;
}

const LearningStoryCard: React.FC<LearningStoryCardProps> = ({
  story,
  onView,
  onEdit,
  onDelete,
  onReact
}) => {
  const { getChildById } = useChildStore();
  const [showActions, setShowActions] = React.useState(false);
  
  const child = getChildById(story.childId);
  const hasMedia = story.media.photos.length > 0 || story.media.videos.length > 0;

  return (
    <motion.div
      className="bg-white rounded-xl shadow-sm hover:shadow-lg transition-all duration-300 border border-gray-100 overflow-hidden"
      whileHover={{ y: -2 }}
    >
      {/* Header */}
      <div className="p-6 pb-4">
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center gap-3">
            {child?.avatar && (
              <img 
                src={child.avatar} 
                alt={child.name}
                className="w-10 h-10 rounded-full object-cover"
              />
            )}
            <div>
              <h3 className="font-bold text-gray-900 text-lg">{story.title}</h3>
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <User className="w-4 h-4" />
                <span>{child?.name}</span>
                <Calendar className="w-4 h-4 ml-2" />
                <span>{new Date(story.date).toLocaleDateString()}</span>
              </div>
            </div>
          </div>
          
          <div className="relative">
            <button
              onClick={() => setShowActions(!showActions)}
              className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-50 rounded-lg transition-colors"
            >
              <MoreVertical className="w-4 h-4" />
            </button>
            
            {showActions && (
              <div className="absolute right-0 top-full mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-10">
                <button 
                  onClick={onView}
                  className="w-full px-4 py-2 text-left hover:bg-gray-50 flex items-center gap-2"
                >
                  <Eye className="w-4 h-4" /> View Story
                </button>
                <button 
                  onClick={onEdit}
                  className="w-full px-4 py-2 text-left hover:bg-gray-50 flex items-center gap-2"
                >
                  <Edit3 className="w-4 h-4" /> Edit
                </button>
                <button 
                  onClick={() => navigator.clipboard.writeText(`Learning Story: ${story.title}`)}
                  className="w-full px-4 py-2 text-left hover:bg-gray-50 flex items-center gap-2"
                >
                  <Share2 className="w-4 h-4" /> Share
                </button>
                <hr className="my-2" />
                <button 
                  onClick={onDelete}
                  className="w-full px-4 py-2 text-left hover:bg-gray-50 flex items-center gap-2 text-red-600"
                >
                  <Trash2 className="w-4 h-4" /> Delete
                </button>
              </div>
            )}
          </div>
        </div>

        <p className="text-gray-600 line-clamp-3 leading-relaxed">{story.description}</p>
      </div>

      {/* Media Preview */}
      {hasMedia && (
        <div className="px-6 pb-4">
          <div className="flex items-center gap-4 text-sm text-gray-500">
            {story.media.photos.length > 0 && (
              <div className="flex items-center gap-1">
                <Camera className="w-4 h-4" />
                <span>{story.media.photos.length} photo{story.media.photos.length !== 1 ? 's' : ''}</span>
              </div>
            )}
            {story.media.videos.length > 0 && (
              <div className="flex items-center gap-1">
                <Video className="w-4 h-4" />
                <span>{story.media.videos.length} video{story.media.videos.length !== 1 ? 's' : ''}</span>
              </div>
            )}
          </div>
          
          {story.media.photos.length > 0 && (
            <div className="mt-3 grid grid-cols-3 gap-2">
              {story.media.photos.slice(0, 3).map((photo, index) => (
                <img 
                  key={index}
                  src={photo} 
                  alt={`Story photo ${index + 1}`}
                  className="w-full h-20 object-cover rounded-lg cursor-pointer hover:opacity-90 transition-opacity"
                  onClick={onView}
                />
              ))}
              {story.media.photos.length > 3 && (
                <div 
                  className="w-full h-20 bg-gray-100 rounded-lg flex items-center justify-center cursor-pointer hover:bg-gray-200 transition-colors"
                  onClick={onView}
                >
                  <span className="text-sm text-gray-600">+{story.media.photos.length - 3} more</span>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* Tags */}
      {(story.developmentalAreas.length > 0 || story.methodologyTags.length > 0) && (
        <div className="px-6 pb-4">
          <div className="flex flex-wrap gap-2">
            {story.developmentalAreas.slice(0, 2).map((area) => (
              <span
                key={area}
                className="px-2 py-1 text-xs font-medium bg-blue-100 text-blue-700 rounded-full"
              >
                {area}
              </span>
            ))}
            {story.methodologyTags.slice(0, 2).map((method) => (
              <span
                key={method}
                className="px-2 py-1 text-xs font-medium bg-green-100 text-green-700 rounded-full capitalize"
              >
                {method}
              </span>
            ))}
            {(story.developmentalAreas.length + story.methodologyTags.length) > 4 && (
              <span className="px-2 py-1 text-xs font-medium bg-gray-100 text-gray-600 rounded-full">
                +{(story.developmentalAreas.length + story.methodologyTags.length) - 4} more
              </span>
            )}
          </div>
        </div>
      )}

      {/* Milestones */}
      {story.milestones.length > 0 && (
        <div className="px-6 pb-4">
          <h4 className="text-sm font-medium text-gray-900 mb-2">Key Milestones</h4>
          <div className="space-y-1">
            {story.milestones.slice(0, 2).map((milestone, index) => (
              <div key={index} className="flex items-center gap-2">
                <Star className="w-3 h-3 text-yellow-500 flex-shrink-0" />
                <span className="text-sm text-gray-700 line-clamp-1">{milestone}</span>
              </div>
            ))}
            {story.milestones.length > 2 && (
              <button 
                onClick={onView}
                className="text-sm text-blue-600 hover:text-blue-700 font-medium"
              >
                +{story.milestones.length - 2} more milestones
              </button>
            )}
          </div>
        </div>
      )}

      {/* Footer */}
      <div className="px-6 py-4 border-t border-gray-100 bg-gray-50">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={() => onReact('hearts')}
              className="flex items-center gap-1 text-gray-600 hover:text-red-500 transition-colors"
            >
              <Heart className="w-4 h-4" />
              <span className="text-sm">{story.reactions.hearts}</span>
            </button>
            
            <button
              onClick={() => onReact('celebrations')}
              className="flex items-center gap-1 text-gray-600 hover:text-yellow-500 transition-colors"
            >
              <Star className="w-4 h-4" />
              <span className="text-sm">{story.reactions.celebrations}</span>
            </button>
            
            <button
              onClick={() => onReact('insights')}
              className="flex items-center gap-1 text-gray-600 hover:text-blue-500 transition-colors"
            >
              <MessageCircle className="w-4 h-4" />
              <span className="text-sm">{story.reactions.insights}</span>
            </button>
          </div>
          
          <motion.button
            onClick={onView}
            className="text-blue-600 hover:text-blue-700 font-medium text-sm"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            Read Full Story
          </motion.button>
        </div>
      </div>
    </motion.div>
  );
};

export default LearningStoryCard;