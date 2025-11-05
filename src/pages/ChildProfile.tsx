import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Plus, 
  Edit3, 
  Trash2, 
  User, 
  Calendar, 
  Heart, 
  Brain, 
  Target, 
  Star, 
  TrendingUp,
  Camera,
  Settings,
  Award,
  Activity,
  BookOpen,
  Users,
  Palette,
  Music
} from 'lucide-react';
import { useChildStore } from '../store/childStore';
import { useLearningStoryStore } from '../store/learningStoryStore';
import { useActivityStore } from '../store/activityStore';
import { useAuthStore } from '../store/authStore';
import ChildProfileForm from '../components/ChildProfileForm';
import toast from 'react-hot-toast';

const ChildProfile = () => {
  const { children, activeChild, setActiveChild, fetchChildren } = useChildStore();
  const { getStoriesForChild } = useLearningStoryStore();
  const { activities } = useActivityStore();
  const { isAuthenticated } = useAuthStore();
  const [showProfileForm, setShowProfileForm] = useState(false);
  const [editingChild, setEditingChild] = useState(null);

  // Fetch children when component mounts and user is authenticated
  useEffect(() => {
    if (isAuthenticated) {
      fetchChildren();
    }
  }, [isAuthenticated, fetchChildren]);

  const childStories = activeChild ? getStoriesForChild(activeChild.id) : [];
  const recentActivities = activities.slice(0, 5); // Mock recent activities

  const developmentalAreas = [
    { key: 'cognitive', label: 'Cognitive', icon: Brain, color: 'blue' },
    { key: 'language', label: 'Language', icon: Music, color: 'green' },
    { key: 'social', label: 'Social', icon: Users, color: 'purple' },
    { key: 'physical', label: 'Physical', icon: Target, color: 'orange' },
    { key: 'creative', label: 'Creative', icon: Palette, color: 'pink' }
  ];

  const handleCreateProfile = () => {
    setEditingChild(null);
    setShowProfileForm(true);
  };

  const handleEditProfile = (child: any) => {
    setEditingChild(child);
    setShowProfileForm(true);
  };

  const handleDeleteProfile = async (childId: string) => {
    if (window.confirm('Are you sure you want to delete this profile?')) {
      try {
        const { deleteChild } = useChildStore.getState();
        await deleteChild(childId);
        toast.success('Profile deleted successfully');
      } catch (error) {
        // Error already shown by deleteChild
      }
    }
  };

  if (!activeChild && children.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center py-16">
            <User className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-gray-900 mb-2">No Child Profiles Yet</h2>
            <p className="text-gray-600 mb-8">
              Create your first child profile to start tracking learning and development.
            </p>
            <motion.button
              onClick={handleCreateProfile}
              className="bg-gradient-to-r from-blue-600 to-green-600 text-white px-8 py-3 rounded-xl font-semibold hover:shadow-lg transition-all duration-300 flex items-center gap-2 mx-auto"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <Plus className="w-5 h-5" />
              Create First Profile
            </motion.button>
          </div>
        </div>

        <AnimatePresence>
          {showProfileForm && (
            <ChildProfileForm
              child={editingChild}
              onClose={() => setShowProfileForm(false)}
              onSave={async () => {
                setShowProfileForm(false);
                // Refresh children list after saving
                await fetchChildren();
              }}
            />
          )}
        </AnimatePresence>
      </div>
    );
  }

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
              <h1 className="text-3xl font-bold text-gray-900 mb-2">Child Profiles</h1>
              <p className="text-gray-600">
                Manage and track each child's unique learning journey
              </p>
            </div>
            
            <motion.button
              onClick={handleCreateProfile}
              className="bg-gradient-to-r from-blue-600 to-green-600 text-white px-6 py-3 rounded-xl font-semibold hover:shadow-lg transition-all duration-300 flex items-center gap-2"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <Plus className="w-5 h-5" />
              Add Child Profile
            </motion.button>
          </div>
        </motion.div>

        {/* Child Selector */}
        {children.length > 1 && (
          <motion.div
            className="mb-8"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
          >
            <div className="flex gap-4 overflow-x-auto pb-2">
              {children.map((child) => (
                <button
                  key={child.id}
                  onClick={() => setActiveChild(child)}
                  className={`flex items-center gap-3 px-6 py-4 rounded-xl transition-all duration-300 whitespace-nowrap ${
                    activeChild?.id === child.id
                      ? 'bg-blue-100 border-2 border-blue-300 text-blue-700'
                      : 'bg-white border-2 border-gray-200 text-gray-600 hover:border-blue-200'
                  }`}
                >
                  {child.avatar && (
                    <img 
                      src={child.avatar} 
                      alt={child.name}
                      className="w-10 h-10 rounded-full object-cover"
                    />
                  )}
                  <div className="text-left">
                    <div className="font-semibold">{child.name}</div>
                    <div className="text-sm opacity-75">{child.age} years old</div>
                  </div>
                </button>
              ))}
            </div>
          </motion.div>
        )}

        {activeChild && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Main Profile Card */}
            <div className="lg:col-span-2 space-y-8">
              {/* Profile Overview */}
              <motion.div
                className="bg-white rounded-xl p-8 shadow-sm border border-gray-100"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.2 }}
              >
                <div className="flex items-start justify-between mb-6">
                  <div className="flex items-center gap-6">
                    <div className="relative">
                      {activeChild.avatar ? (
                        <img 
                          src={activeChild.avatar} 
                          alt={activeChild.name}
                          className="w-24 h-24 rounded-full object-cover border-4 border-blue-100"
                        />
                      ) : (
                        <div className="w-24 h-24 rounded-full bg-gradient-to-br from-blue-100 to-green-100 flex items-center justify-center border-4 border-blue-100">
                          <User className="w-12 h-12 text-blue-600" />
                        </div>
                      )}
                      <button className="absolute bottom-0 right-0 w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center hover:bg-blue-700 transition-colors">
                        <Camera className="w-4 h-4" />
                      </button>
                    </div>
                    
                    <div>
                      <h2 className="text-2xl font-bold text-gray-900 mb-1">{activeChild.name}</h2>
                      <div className="flex items-center gap-4 text-gray-600 mb-3">
                        <div className="flex items-center gap-1">
                          <Calendar className="w-4 h-4" />
                          <span>{activeChild.age} years old</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <BookOpen className="w-4 h-4" />
                          <span className="capitalize">{activeChild.preferences.learningStyle} learner</span>
                        </div>
                      </div>
                      
                      <div className="flex flex-wrap gap-2">
                        {activeChild.interests.slice(0, 3).map((interest) => (
                          <span
                            key={interest}
                            className="px-3 py-1 text-sm bg-blue-100 text-blue-700 rounded-full"
                          >
                            {interest}
                          </span>
                        ))}
                        {activeChild.interests.length > 3 && (
                          <span className="px-3 py-1 text-sm bg-gray-100 text-gray-600 rounded-full">
                            +{activeChild.interests.length - 3} more
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleEditProfile(activeChild)}
                      className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                    >
                      <Edit3 className="w-5 h-5" />
                    </button>
                    <button
                      onClick={() => handleDeleteProfile(activeChild.id)}
                      className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </div>
                </div>

                {/* Quick Stats */}
                <div className="grid grid-cols-3 gap-6 mb-6">
                  <div className="text-center">
                    <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-2">
                      <BookOpen className="w-6 h-6 text-blue-600" />
                    </div>
                    <div className="text-2xl font-bold text-gray-900">{childStories.length}</div>
                    <div className="text-sm text-gray-600">Learning Stories</div>
                  </div>
                  
                  <div className="text-center">
                    <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-2">
                      <Activity className="w-6 h-6 text-green-600" />
                    </div>
                    <div className="text-2xl font-bold text-gray-900">24</div>
                    <div className="text-sm text-gray-600">Activities Completed</div>
                  </div>
                  
                  <div className="text-center">
                    <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-2">
                      <Award className="w-6 h-6 text-purple-600" />
                    </div>
                    <div className="text-2xl font-bold text-gray-900">12</div>
                    <div className="text-sm text-gray-600">Milestones Reached</div>
                  </div>
                </div>

                {/* Learning Preferences */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Learning Preferences</h3>
                  <div className="grid grid-cols-3 gap-4">
                    <div className="bg-gray-50 rounded-lg p-4 text-center">
                      <div className="text-sm text-gray-600 mb-1">Learning Style</div>
                      <div className="font-semibold text-gray-900 capitalize">{activeChild.preferences.learningStyle}</div>
                    </div>
                    <div className="bg-gray-50 rounded-lg p-4 text-center">
                      <div className="text-sm text-gray-600 mb-1">Energy Level</div>
                      <div className="font-semibold text-gray-900 capitalize">{activeChild.preferences.energyLevel}</div>
                    </div>
                    <div className="bg-gray-50 rounded-lg p-4 text-center">
                      <div className="text-sm text-gray-600 mb-1">Social Preference</div>
                      <div className="font-semibold text-gray-900 capitalize">{activeChild.preferences.socialPreference.replace('-', ' ')}</div>
                    </div>
                  </div>
                </div>
              </motion.div>

              {/* Developmental Progress */}
              <motion.div
                className="bg-white rounded-xl p-8 shadow-sm border border-gray-100"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.3 }}
              >
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-xl font-bold text-gray-900">Developmental Progress</h3>
                  <button className="text-blue-600 hover:text-blue-700 font-medium flex items-center gap-1">
                    <TrendingUp className="w-4 h-4" />
                    View Details
                  </button>
                </div>
                
                <div className="space-y-6">
                  {developmentalAreas.map((area) => {
                    const Icon = area.icon;
                    const progress = activeChild.developmentalProfile[area.key as keyof typeof activeChild.developmentalProfile];
                    
                    return (
                      <div key={area.key}>
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-2">
                            <Icon className={`w-5 h-5 text-${area.color}-600`} />
                            <span className="font-medium text-gray-900">{area.label}</span>
                          </div>
                          <span className="text-sm text-gray-600">{progress}%</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-3">
                          <motion.div
                            className={`h-3 rounded-full bg-${area.color}-500`}
                            initial={{ width: 0 }}
                            animate={{ width: `${progress}%` }}
                            transition={{ duration: 1, delay: 0.5 }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </motion.div>

              {/* Goals & Targets */}
              <motion.div
                className="bg-white rounded-xl p-8 shadow-sm border border-gray-100"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.4 }}
              >
                <h3 className="text-xl font-bold text-gray-900 mb-6">Current Goals & Targets</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                      <Target className="w-5 h-5 text-blue-600" />
                      Speech Therapy Goals
                    </h4>
                    <div className="space-y-2">
                      {activeChild.speechGoals.map((goal, index) => (
                        <div key={index} className="flex items-center gap-2">
                          <div className="w-2 h-2 bg-blue-500 rounded-full" />
                          <span className="text-gray-700 text-sm">{goal}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                  
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                      <Heart className="w-5 h-5 text-green-600" />
                      OT Goals
                    </h4>
                    <div className="space-y-2">
                      {activeChild.otGoals.map((goal, index) => (
                        <div key={index} className="flex items-center gap-2">
                          <div className="w-2 h-2 bg-green-500 rounded-full" />
                          <span className="text-gray-700 text-sm">{goal}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </motion.div>
            </div>

            {/* Sidebar */}
            <div className="space-y-8">
              {/* Sensory Needs */}
              <motion.div
                className="bg-white rounded-xl p-6 shadow-sm border border-gray-100"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.2 }}
              >
                <h3 className="text-lg font-bold text-gray-900 mb-4">Sensory Needs</h3>
                <div className="space-y-2">
                  {activeChild.sensoryNeeds.map((need, index) => (
                    <div key={index} className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-purple-500 rounded-full" />
                      <span className="text-gray-700 text-sm">{need}</span>
                    </div>
                  ))}
                </div>
              </motion.div>

              {/* Recent Learning Stories */}
              <motion.div
                className="bg-white rounded-xl p-6 shadow-sm border border-gray-100"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.3 }}
              >
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-bold text-gray-900">Recent Stories</h3>
                  <button className="text-blue-600 hover:text-blue-700 text-sm font-medium">
                    View All
                  </button>
                </div>
                
                <div className="space-y-3">
                  {childStories.slice(0, 3).map((story) => (
                    <div key={story.id} className="p-3 bg-gray-50 rounded-lg">
                      <h4 className="font-medium text-gray-900 text-sm mb-1">{story.title}</h4>
                      <p className="text-gray-600 text-xs line-clamp-2">{story.description}</p>
                      <div className="flex items-center gap-2 mt-2">
                        <Heart className="w-3 h-3 text-red-500" />
                        <span className="text-xs text-gray-500">{story.reactions.hearts}</span>
                      </div>
                    </div>
                  ))}
                  
                  {childStories.length === 0 && (
                    <p className="text-gray-500 text-sm text-center py-4">
                      No learning stories yet
                    </p>
                  )}
                </div>
              </motion.div>

              {/* Academic Levels */}
              <motion.div
                className="bg-white rounded-xl p-6 shadow-sm border border-gray-100"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.4 }}
              >
                <h3 className="text-lg font-bold text-gray-900 mb-4">Academic Levels</h3>
                
                <div className="space-y-3">
                  {Object.entries(activeChild.currentLevel).map(([subject, level]) => {
                    const levels = ['Beginner', 'Developing', 'Proficient', 'Advanced', 'Expert'];
                    return (
                      <div key={subject} className="flex items-center justify-between">
                        <span className="text-sm font-medium text-gray-700 capitalize">{subject}</span>
                        <span className="text-sm text-gray-600">{levels[level - 1]}</span>
                      </div>
                    );
                  })}
                </div>
              </motion.div>
            </div>
          </div>
        )}

        {/* Profile Form Modal */}
        <AnimatePresence>
          {showProfileForm && (
            <ChildProfileForm
              child={editingChild}
              onClose={() => setShowProfileForm(false)}
              onSave={async () => {
                setShowProfileForm(false);
                // Refresh children list after saving
                await fetchChildren();
              }}
            />
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default ChildProfile;