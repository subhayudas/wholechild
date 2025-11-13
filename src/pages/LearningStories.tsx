import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Plus, 
  Search, 
  Filter, 
  Calendar, 
  User, 
  Camera, 
  Video, 
  Mic, 
  Heart, 
  Star, 
  MessageCircle,
  Grid,
  List,
  BookOpen,
  Eye,
  Share2,
  Download,
  Sparkles,
  Loader2
} from 'lucide-react';
import { useLearningStoryStore, LearningStory } from '../store/learningStoryStore';
import { useChildStore } from '../store/childStore';
import LearningStoryCreator from '../components/LearningStoryCreator';
import LearningStoryCard from '../components/LearningStoryCard';
import toast from 'react-hot-toast';

const LearningStories = () => {
  const { stories, isLoading, fetchAllStories, addReaction, deleteStory } = useLearningStoryStore();
  const { children, activeChild, fetchChildren } = useChildStore();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedChild, setSelectedChild] = useState('all');
  const [selectedTimeframe, setSelectedTimeframe] = useState('all');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [showCreator, setShowCreator] = useState(false);
  const [editingStory, setEditingStory] = useState<LearningStory | null>(null);
  const [showFilters, setShowFilters] = useState(false);

  // Fetch children and stories on mount
  useEffect(() => {
    const loadData = async () => {
      if (children.length === 0) {
        await fetchChildren();
      }
      
      if (children.length > 0) {
        const childIds = children.map(c => c.id);
        await fetchAllStories(childIds);
      }
    };
    
    loadData();
  }, []);

  // Refetch stories when children change
  useEffect(() => {
    if (children.length > 0) {
      const childIds = children.map(c => c.id);
      fetchAllStories(childIds);
    }
  }, [children.length]);

  // Filter stories
  const filteredStories = stories.filter(story => {
    const matchesSearch = story.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         story.description.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesChild = selectedChild === 'all' || story.childId === selectedChild;
    
    const matchesTimeframe = selectedTimeframe === 'all' || (() => {
      const storyDate = new Date(story.date);
      const now = new Date();
      const daysDiff = Math.floor((now.getTime() - storyDate.getTime()) / (1000 * 60 * 60 * 24));
      
      switch (selectedTimeframe) {
        case 'week': return daysDiff <= 7;
        case 'month': return daysDiff <= 30;
        case 'quarter': return daysDiff <= 90;
        default: return true;
      }
    })();

    return matchesSearch && matchesChild && matchesTimeframe;
  }).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  const handleCreateStory = () => {
    setEditingStory(null);
    setShowCreator(true);
  };

  const handleEditStory = (story: LearningStory) => {
    setEditingStory(story);
    setShowCreator(true);
  };

  const handleDeleteStory = async (storyId: string) => {
    if (window.confirm('Are you sure you want to delete this learning story?')) {
      try {
        await deleteStory(storyId);
      } catch (error) {
        // Error already handled in store
      }
    }
  };

  const handleViewStory = (story: LearningStory) => {
    // In a real app, this would open a detailed view modal
    toast.success(`Viewing "${story.title}"`);
  };

  const handleReaction = async (storyId: string, type: 'hearts' | 'celebrations' | 'insights') => {
    try {
      await addReaction(storyId, type);
    } catch (error) {
      // Error already handled in store
    }
  };

  const getStoryStats = () => {
    const totalStories = filteredStories.length;
    const totalPhotos = filteredStories.reduce((sum, story) => sum + story.media.photos.length, 0);
    const totalVideos = filteredStories.reduce((sum, story) => sum + story.media.videos.length, 0);
    const totalReactions = filteredStories.reduce((sum, story) => 
      sum + story.reactions.hearts + story.reactions.celebrations + story.reactions.insights, 0);
    
    return { totalStories, totalPhotos, totalVideos, totalReactions };
  };

  const stats = getStoryStats();

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <motion.div
          className="mb-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">Learning Stories</h1>
              <p className="text-gray-600">
                Document and celebrate meaningful learning moments
              </p>
            </div>
            
            <motion.button
              onClick={handleCreateStory}
              className="bg-gradient-to-r from-blue-600 to-green-600 text-white px-6 py-3 rounded-xl font-semibold hover:shadow-lg transition-all duration-300 flex items-center gap-2"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <Plus className="w-5 h-5" />
              Create Story
            </motion.button>
          </div>
        </motion.div>

        {/* Stats Overview */}
        <motion.div
          className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
        >
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
            <div className="flex items-center gap-3 mb-2">
              <BookOpen className="w-8 h-8 text-blue-600" />
              <div>
                <div className="text-2xl font-bold text-gray-900">{stats.totalStories}</div>
                <div className="text-sm text-gray-600">Stories</div>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
            <div className="flex items-center gap-3 mb-2">
              <Camera className="w-8 h-8 text-green-600" />
              <div>
                <div className="text-2xl font-bold text-gray-900">{stats.totalPhotos}</div>
                <div className="text-sm text-gray-600">Photos</div>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
            <div className="flex items-center gap-3 mb-2">
              <Video className="w-8 h-8 text-purple-600" />
              <div>
                <div className="text-2xl font-bold text-gray-900">{stats.totalVideos}</div>
                <div className="text-sm text-gray-600">Videos</div>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
            <div className="flex items-center gap-3 mb-2">
              <Heart className="w-8 h-8 text-red-600" />
              <div>
                <div className="text-2xl font-bold text-gray-900">{stats.totalReactions}</div>
                <div className="text-sm text-gray-600">Reactions</div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Search and Filters */}
        <motion.div
          className="mb-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          <div className="flex flex-col lg:flex-row gap-4">
            {/* Search */}
            <div className="flex-1 relative">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search learning stories..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-12 pr-4 py-3 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300"
              />
            </div>
            
            {/* Filters */}
            <div className="flex items-center gap-3">
              <select
                value={selectedChild}
                onChange={(e) => setSelectedChild(e.target.value)}
                className="px-4 py-3 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="all">All Children</option>
                {children.map(child => (
                  <option key={child.id} value={child.id}>{child.name}</option>
                ))}
              </select>
              
              <select
                value={selectedTimeframe}
                onChange={(e) => setSelectedTimeframe(e.target.value)}
                className="px-4 py-3 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="all">All Time</option>
                <option value="week">This Week</option>
                <option value="month">This Month</option>
                <option value="quarter">Last 3 Months</option>
              </select>
              
              <div className="flex bg-white border border-gray-200 rounded-xl p-1">
                <button
                  onClick={() => setViewMode('grid')}
                  className={`p-2 rounded-lg transition-all duration-300 ${
                    viewMode === 'grid' ? 'bg-blue-100 text-blue-600' : 'text-gray-400'
                  }`}
                >
                  <Grid className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={`p-2 rounded-lg transition-all duration-300 ${
                    viewMode === 'list' ? 'bg-blue-100 text-blue-600' : 'text-gray-400'
                  }`}
                >
                  <List className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Stories Grid/List */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.3 }}
        >
          {isLoading ? (
            <div className="flex items-center justify-center py-16">
              <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
              <span className="ml-3 text-gray-600">Loading learning stories...</span>
            </div>
          ) : filteredStories.length > 0 ? (
            <div className={`grid gap-6 ${
              viewMode === 'grid' 
                ? 'grid-cols-1 md:grid-cols-2 xl:grid-cols-3' 
                : 'grid-cols-1'
            }`}>
              {filteredStories.map((story, index) => (
                <motion.div
                  key={story.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                >
                  <LearningStoryCard
                    story={story}
                    onView={() => handleViewStory(story)}
                    onEdit={() => handleEditStory(story)}
                    onDelete={() => handleDeleteStory(story.id)}
                    onReact={(type) => handleReaction(story.id, type)}
                  />
                </motion.div>
              ))}
            </div>
          ) : (
            <motion.div
              className="text-center py-16"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.6 }}
            >
              <Sparkles className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 mb-2">No learning stories found</h3>
              <p className="text-gray-600 mb-6">
                {searchTerm || selectedChild !== 'all' || selectedTimeframe !== 'all'
                  ? 'Try adjusting your search or filters'
                  : 'Start documenting meaningful learning moments'}
              </p>
              <motion.button
                onClick={handleCreateStory}
                className="bg-gradient-to-r from-blue-600 to-green-600 text-white px-6 py-3 rounded-xl font-semibold hover:shadow-lg transition-all duration-300 flex items-center gap-2 mx-auto"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <Plus className="w-5 h-5" />
                Create Your First Story
              </motion.button>
            </motion.div>
          )}
        </motion.div>

        {/* Learning Story Creator Modal */}
        <AnimatePresence>
          {showCreator && (
            <LearningStoryCreator
              story={editingStory}
              onClose={() => {
                setShowCreator(false);
                setEditingStory(null);
              }}
              onSave={() => {
                setShowCreator(false);
                setEditingStory(null);
              }}
            />
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default LearningStories;