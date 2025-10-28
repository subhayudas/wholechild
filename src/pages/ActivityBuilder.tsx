import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Plus, 
  Search, 
  Filter, 
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
  BookOpen,
  Palette,
  Music,
  Brain,
  Blocks,
  Camera,
  Sparkles,
  ChevronDown,
  X,
  Save,
  Eye,
  Download,
  Upload,
  User,
  CheckCircle,
  Wand2,
  RefreshCw,
  Sliders
} from 'lucide-react';
import { useActivityStore, Activity } from '../store/activityStore';
import { useChildStore } from '../store/childStore';
import ActivityCreator from '../components/ActivityCreator';
import ActivityCard from '../components/ActivityCard';
import ActivityPreview from '../components/ActivityPreview';
import ParentActivityGuide from '../components/ParentActivityGuide';
import FilterPanel from '../components/FilterPanel';
import toast from 'react-hot-toast';

const ActivityBuilder = () => {
  const { activities, favoriteActivities, toggleFavorite, deleteActivity } = useActivityStore();
  const { activeChild } = useChildStore();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedFilters, setSelectedFilters] = useState({
    methodologies: [] as string[],
    ageRange: [3, 6] as [number, number],
    duration: [0, 120] as [number, number],
    difficulty: [] as number[],
    categories: [] as string[],
    developmentalAreas: [] as string[]
  });
  const [sortBy, setSortBy] = useState<'newest' | 'rating' | 'duration' | 'difficulty' | 'ai-generated'>('newest');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [showFilters, setShowFilters] = useState(false);
  const [showCreator, setShowCreator] = useState(false);
  const [selectedActivity, setSelectedActivity] = useState<Activity | null>(null);
  const [showPreview, setShowPreview] = useState(false);
  const [showParentGuide, setShowParentGuide] = useState(false);
  const [showAIOnly, setShowAIOnly] = useState(false);

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

  // Get AI-generated activities
  const aiGeneratedActivities = activities.filter(activity => 
    activity.tags.includes('ai-generated')
  );

  // Filter and sort activities
  const filteredActivities = activities.filter(activity => {
    // AI-only filter
    if (showAIOnly && !activity.tags.includes('ai-generated')) {
      return false;
    }

    const matchesSearch = activity.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         activity.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         activity.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesMethodologies = selectedFilters.methodologies.length === 0 ||
                                selectedFilters.methodologies.some(method => 
                                  activity.methodologies.includes(method as any));
    
    const matchesAge = activity.ageRange[0] <= selectedFilters.ageRange[1] &&
                      activity.ageRange[1] >= selectedFilters.ageRange[0];
    
    const matchesDuration = activity.duration >= selectedFilters.duration[0] &&
                           activity.duration <= selectedFilters.duration[1];
    
    const matchesDifficulty = selectedFilters.difficulty.length === 0 ||
                             selectedFilters.difficulty.includes(activity.difficulty);
    
    const matchesCategory = selectedFilters.categories.length === 0 ||
                           selectedFilters.categories.includes(activity.category);
    
    const matchesDevelopmental = selectedFilters.developmentalAreas.length === 0 ||
                                selectedFilters.developmentalAreas.some(area =>
                                  activity.developmentalAreas.includes(area));

    return matchesSearch && matchesMethodologies && matchesAge && 
           matchesDuration && matchesDifficulty && matchesCategory && matchesDevelopmental;
  }).sort((a, b) => {
    switch (sortBy) {
      case 'rating':
        return b.rating - a.rating;
      case 'duration':
        return a.duration - b.duration;
      case 'difficulty':
        return a.difficulty - b.difficulty;
      case 'ai-generated':
        const aIsAI = a.tags.includes('ai-generated');
        const bIsAI = b.tags.includes('ai-generated');
        if (aIsAI && !bIsAI) return -1;
        if (!aIsAI && bIsAI) return 1;
        return 0;
      default:
        return 0; // newest - would use actual dates in real app
    }
  });

  const handleDeleteActivity = (id: string) => {
    if (window.confirm('Are you sure you want to delete this activity?')) {
      deleteActivity(id);
      toast.success('Activity deleted successfully');
    }
  };

  const handleDuplicateActivity = (activity: Activity) => {
    // In a real app, this would create a copy with a new ID
    toast.success('Activity duplicated successfully');
  };

  const handleShareActivity = (activity: Activity) => {
    // In a real app, this would generate a shareable link
    navigator.clipboard.writeText(`Check out this activity: ${activity.title}`);
    toast.success('Activity link copied to clipboard');
  };

  const handleStartActivity = (activity: Activity) => {
    if (!activeChild) {
      toast.error('Please select a child first');
      return;
    }
    setSelectedActivity(activity);
    setShowParentGuide(true);
  };

  const refreshActivities = () => {
    // Force a re-render to show any newly saved activities
    window.location.reload();
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto p-6">
        {/* Header */}
        <motion.div
          className="mb-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">Activity Library</h1>
              <p className="text-gray-600">
                Your collection of parent-guided activities including AI-generated ones
              </p>
            </div>
            
            <div className="flex items-center gap-3">
              <motion.button
                onClick={() => window.location.href = '/admin/ai-generator'}
                className="bg-gradient-to-r from-purple-600 to-blue-600 text-white px-6 py-3 rounded-xl font-semibold hover:shadow-lg transition-all duration-300 flex items-center gap-2"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <Wand2 className="w-5 h-5" />
                AI Generator
              </motion.button>
              
              <motion.button
                onClick={() => window.location.href = '/admin/ai-pro-generator'}
                className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-6 py-3 rounded-xl font-semibold hover:shadow-lg transition-all duration-300 flex items-center gap-2"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <Sliders className="w-5 h-5" />
                AI Pro
              </motion.button>

              <motion.button
                onClick={() => setShowCreator(true)}
                className="bg-gradient-to-r from-blue-600 to-green-600 text-white px-6 py-3 rounded-xl font-semibold hover:shadow-lg transition-all duration-300 flex items-center gap-2"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <Plus className="w-5 h-5" />
                Create Activity
              </motion.button>
              
              <button
                onClick={() => setShowFilters(!showFilters)}
                className={`p-3 rounded-xl border-2 transition-all duration-300 ${
                  showFilters 
                    ? 'bg-blue-50 border-blue-300 text-blue-700' 
                    : 'bg-white border-gray-200 text-gray-600 hover:border-blue-200'
                }`}
              >
                <Filter className="w-5 h-5" />
              </button>

              <button
                onClick={refreshActivities}
                className="p-3 rounded-xl border-2 border-gray-200 text-gray-600 hover:border-blue-200 transition-all duration-300"
                title="Refresh activities"
              >
                <RefreshCw className="w-5 h-5" />
              </button>
            </div>
          </div>
        </motion.div>

        {/* AI Activities Highlight */}
        {aiGeneratedActivities.length > 0 && (
          <motion.div
            className="mb-6 bg-gradient-to-r from-purple-50 to-blue-50 border border-purple-200 rounded-xl p-4"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-r from-purple-600 to-blue-600 rounded-lg flex items-center justify-center">
                  <Wand2 className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h3 className="font-semibold text-purple-900">
                    🎉 You have {aiGeneratedActivities.length} AI-generated activit{aiGeneratedActivities.length === 1 ? 'y' : 'ies'}!
                  </h3>
                  <p className="text-purple-700 text-sm">
                    These personalized activities were created just for {activeChild?.name || 'your child'}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowAIOnly(!showAIOnly)}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  showAIOnly 
                    ? 'bg-purple-600 text-white' 
                    : 'bg-white text-purple-600 border border-purple-300'
                }`}
              >
                {showAIOnly ? 'Show All' : 'Show AI Only'}
              </button>
            </div>
          </motion.div>
        )}

        {/* Parent Guide Notice */}
        <motion.div
          className="mb-6 bg-blue-50 border border-blue-200 rounded-xl p-4"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
        >
          <div className="flex items-start gap-3">
            <User className="w-6 h-6 text-blue-600 flex-shrink-0 mt-0.5" />
            <div>
              <h3 className="font-semibold text-blue-900 mb-1">Parent-Guided Activities</h3>
              <p className="text-blue-800 text-sm">
                These activities are designed for you to guide your child through hands-on learning experiences. 
                Click "Start Activity" to open the parent guide with step-by-step instructions, materials list, and observation tips.
              </p>
            </div>
          </div>
        </motion.div>

        {/* Search and Controls */}
        <motion.div
          className="mb-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
        >
          <div className="flex flex-col lg:flex-row gap-4">
            {/* Search */}
            <div className="flex-1 relative">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search activities, tags, or descriptions..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-12 pr-4 py-3 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300"
              />
            </div>
            
            {/* Sort and View Controls */}
            <div className="flex items-center gap-3">
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="px-4 py-3 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="newest">Newest First</option>
                <option value="ai-generated">AI Generated First</option>
                <option value="rating">Highest Rated</option>
                <option value="duration">Shortest Duration</option>
                <option value="difficulty">Easiest First</option>
              </select>
              
              <div className="flex bg-white border border-gray-200 rounded-xl p-1">
                <button
                  onClick={() => setViewMode('grid')}
                  className={`p-2 rounded-lg transition-all duration-300 ${
                    viewMode === 'grid' ? 'bg-blue-100 text-blue-600' : 'text-gray-400'
                  }`}
                >
                  <Blocks className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={`p-2 rounded-lg transition-all duration-300 ${
                    viewMode === 'list' ? 'bg-blue-100 text-blue-600' : 'text-gray-400'
                  }`}
                >
                  <BookOpen className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Methodology Quick Filters */}
        <motion.div
          className="mb-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          <div className="flex flex-wrap gap-3">
            {Object.entries(methodologyColors).map(([method, color]) => {
              const Icon = methodologyIcons[method as keyof typeof methodologyIcons];
              const isSelected = selectedFilters.methodologies.includes(method);
              
              return (
                <motion.button
                  key={method}
                  onClick={() => {
                    setSelectedFilters(prev => ({
                      ...prev,
                      methodologies: isSelected
                        ? prev.methodologies.filter(m => m !== method)
                        : [...prev.methodologies, method]
                    }));
                  }}
                  className={`flex items-center gap-2 px-4 py-2 rounded-full border-2 transition-all duration-300 ${
                    isSelected
                      ? `bg-gradient-to-r ${color} text-white border-transparent shadow-lg`
                      : 'bg-white text-gray-600 border-gray-200 hover:border-gray-300'
                  }`}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Icon className="w-4 h-4" />
                  <span className="capitalize font-medium">{method}</span>
                </motion.button>
              );
            })}
          </div>
        </motion.div>

        <div className="flex gap-6">
          {/* Filters Sidebar */}
          <AnimatePresence>
            {showFilters && (
              <motion.div
                className="w-80 flex-shrink-0"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3 }}
              >
                <FilterPanel
                  filters={selectedFilters}
                  onFiltersChange={setSelectedFilters}
                  onClose={() => setShowFilters(false)}
                />
              </motion.div>
            )}
          </AnimatePresence>

          {/* Activities Grid/List */}
          <div className="flex-1">
            <motion.div
              className="mb-4 flex items-center justify-between"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.6, delay: 0.3 }}
            >
              <div className="flex items-center gap-4">
                <p className="text-gray-600">
                  {filteredActivities.length} activit{filteredActivities.length === 1 ? 'y' : 'ies'} found
                  {activeChild && ` for ${activeChild.name}`}
                </p>
                
                {aiGeneratedActivities.length > 0 && (
                  <div className="flex items-center gap-2 text-sm">
                    <div className="w-3 h-3 bg-gradient-to-r from-purple-500 to-blue-500 rounded-full"></div>
                    <span className="text-gray-600">{aiGeneratedActivities.length} AI-generated</span>
                  </div>
                )}
              </div>
              
              {(selectedFilters.methodologies.length > 0 || showAIOnly) && (
                <button
                  onClick={() => {
                    setSelectedFilters(prev => ({ ...prev, methodologies: [] }));
                    setShowAIOnly(false);
                  }}
                  className="text-blue-600 hover:text-blue-700 font-medium flex items-center gap-1"
                >
                  Clear filters <X className="w-4 h-4" />
                </button>
              )}
            </motion.div>

            <div className={`grid gap-6 ${
              viewMode === 'grid' 
                ? 'grid-cols-1 md:grid-cols-2 xl:grid-cols-3' 
                : 'grid-cols-1'
            }`}>
              {filteredActivities.map((activity, index) => (
                <motion.div
                  key={activity.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                  className="relative"
                >
                  {/* AI Badge */}
                  {activity.tags.includes('ai-generated') && (
                    <div className="absolute top-2 left-2 z-10 bg-gradient-to-r from-purple-600 to-blue-600 text-white px-2 py-1 rounded-full text-xs font-medium flex items-center gap-1">
                      <Wand2 className="w-3 h-3" />
                      AI
                    </div>
                  )}
                  
                  <ActivityCard
                    activity={activity}
                    viewMode={viewMode}
                    isFavorite={favoriteActivities.includes(activity.id)}
                    onToggleFavorite={() => toggleFavorite(activity.id)}
                    onPreview={() => {
                      setSelectedActivity(activity);
                      setShowPreview(true);
                    }}
                    onStart={() => handleStartActivity(activity)}
                    onEdit={() => {
                      setSelectedActivity(activity);
                      setShowCreator(true);
                    }}
                    onDuplicate={() => handleDuplicateActivity(activity)}
                    onShare={() => handleShareActivity(activity)}
                    onDelete={() => handleDeleteActivity(activity.id)}
                  />
                </motion.div>
              ))}
            </div>

            {filteredActivities.length === 0 && (
              <motion.div
                className="text-center py-16"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.6 }}
              >
                <Sparkles className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-900 mb-2">No activities found</h3>
                <p className="text-gray-600 mb-6">
                  {showAIOnly 
                    ? "You haven't generated any AI activities yet. Try the AI Generator!"
                    : "Try adjusting your search terms or filters, or create a new activity."
                  }
                </p>
                <div className="flex gap-3 justify-center">
                  {showAIOnly ? (
                    <motion.button
                      onClick={() => window.location.href = '/admin/ai-generator'}
                      className="bg-gradient-to-r from-purple-600 to-blue-600 text-white px-6 py-3 rounded-xl font-semibold hover:shadow-lg transition-all duration-300 flex items-center gap-2"
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      <Wand2 className="w-5 h-5" />
                      Generate AI Activity
                    </motion.button>
                  ) : (
                    <motion.button
                      onClick={() => setShowCreator(true)}
                      className="bg-gradient-to-r from-blue-600 to-green-600 text-white px-6 py-3 rounded-xl font-semibold hover:shadow-lg transition-all duration-300 flex items-center gap-2"
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      <Plus className="w-5 h-5" />
                      Create Your First Activity
                    </motion.button>
                  )}
                </div>
              </motion.div>
            )}
          </div>
        </div>
      </div>

      {/* Activity Creator Modal */}
      <AnimatePresence>
        {showCreator && (
          <ActivityCreator
            activity={selectedActivity}
            onClose={() => {
              setShowCreator(false);
              setSelectedActivity(null);
            }}
            onSave={() => {
              setShowCreator(false);
              setSelectedActivity(null);
              toast.success('Activity saved successfully!');
            }}
          />
        )}
      </AnimatePresence>

      {/* Activity Preview Modal */}
      <AnimatePresence>
        {showPreview && selectedActivity && (
          <ActivityPreview
            activity={selectedActivity}
            onClose={() => {
              setShowPreview(false);
              setSelectedActivity(null);
            }}
            onStart={() => handleStartActivity(selectedActivity)}
          />
        )}
      </AnimatePresence>

      {/* Parent Activity Guide Modal */}
      <AnimatePresence>
        {showParentGuide && selectedActivity && (
          <ParentActivityGuide
            activity={selectedActivity}
            child={activeChild}
            onClose={() => {
              setShowParentGuide(false);
              setSelectedActivity(null);
            }}
            onComplete={() => {
              setShowParentGuide(false);
              setSelectedActivity(null);
              toast.success('Great job guiding your child through this activity!');
            }}
          />
        )}
      </AnimatePresence>
    </div>
  );
};

export default ActivityBuilder;