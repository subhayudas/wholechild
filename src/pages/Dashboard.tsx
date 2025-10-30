import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { 
  Calendar, 
  Clock, 
  Star, 
  TrendingUp, 
  Heart, 
  Play, 
  Camera, 
  Target,
  Brain,
  Palette,
  Users,
  ArrowRight,
  CheckCircle,
  AlertCircle,
  User,
  Award,
  BookOpen,
  Activity as ActivityIcon
} from 'lucide-react';
import { useChildStore } from '../store/childStore';
import { useActivityStore } from '../store/activityStore';
import { useLearningStoryStore } from '../store/learningStoryStore';
import { useAuthStore } from '../store/authStore';

const Dashboard = () => {
  const { user } = useAuthStore();
  const { children, activeChild, setActiveChild, fetchChildren, isLoading: childrenLoading } = useChildStore();
  const { activities, fetchActivities, getRecommendedActivities, isLoading: activitiesLoading } = useActivityStore();
  const { stories, getStoriesForChild } = useLearningStoryStore();
  const [todaysActivities, setTodaysActivities] = useState<any[]>([]);
  const [recentStories, setRecentStories] = useState<any[]>([]);
  
  useEffect(() => {
    // Fetch children on mount
    fetchChildren();
    fetchActivities();
  }, [fetchChildren, fetchActivities]);

  useEffect(() => {
    if (children.length > 0 && !activeChild) {
      setActiveChild(children[0]);
    }
  }, [children, activeChild, setActiveChild]);

  useEffect(() => {
    if (activeChild) {
      getRecommendedActivities(activeChild.id).then(setTodaysActivities);
      const childStories = getStoriesForChild(activeChild.id);
      setRecentStories(childStories.slice(0, 3));
    }
  }, [activeChild, getRecommendedActivities, getStoriesForChild]);

  const currentTime = new Date();
  const greeting = currentTime.getHours() < 12 ? 'Good morning' : 
                  currentTime.getHours() < 17 ? 'Good afternoon' : 'Good evening';

  const quickActions = [
    {
      title: 'Start Parent Guide',
      description: 'Begin a guided learning activity',
      icon: <User className="w-6 h-6" />,
      color: 'from-blue-500 to-blue-600',
      link: '/activity-builder'
    },
    {
      title: 'Capture Moment',
      description: 'Document learning in action',
      icon: <Camera className="w-6 h-6" />,
      color: 'from-green-500 to-green-600',
      link: '/learning-stories'
    },
    {
      title: 'Therapy Session',
      description: 'Start speech or OT session',
      icon: <Target className="w-6 h-6" />,
      color: 'from-purple-500 to-purple-600',
      link: '/therapy'
    }
  ];

  const developmentalProgress = activeChild ? [
    { area: 'Cognitive', progress: activeChild.developmentalProfile.cognitive, color: 'blue' },
    { area: 'Language', progress: activeChild.developmentalProfile.language, color: 'green' },
    { area: 'Social', progress: activeChild.developmentalProfile.social, color: 'purple' },
    { area: 'Physical', progress: activeChild.developmentalProfile.physical, color: 'orange' },
    { area: 'Creative', progress: activeChild.developmentalProfile.creative, color: 'pink' }
  ] : [];

  const getRecentAchievements = () => {
    if (!activeChild) return [];
    return activeChild.achievements.slice(-3).reverse();
  };

  const getActivityStats = () => {
    if (!activeChild) return { completed: 0, totalTime: 0, streak: 0 };
    
    return {
      completed: activeChild.activityHistory.length,
      totalTime: activeChild.activityHistory.reduce((sum, activity) => sum + activity.duration, 0),
      streak: activeChild.currentStreak
    };
  };

  const stats = getActivityStats();
  const recentAchievements = getRecentAchievements();

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
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            {greeting}, {user?.name}! 👋
          </h1>
          <p className="text-gray-600">
            {activeChild ? `Let's continue ${activeChild.name}'s learning journey` : 'Welcome to your learning dashboard'}
          </p>
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
                  className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-300 whitespace-nowrap ${
                    activeChild?.id === child.id
                      ? 'bg-blue-100 border-2 border-blue-300 text-blue-700'
                      : 'bg-white border-2 border-gray-200 text-gray-600 hover:border-blue-200'
                  }`}
                >
                  {child.avatar && (
                    <img 
                      src={child.avatar} 
                      alt={child.name}
                      className="w-8 h-8 rounded-full object-cover"
                    />
                  )}
                  <span className="font-medium">{child.name}</span>
                  <span className="text-sm opacity-75">{child.age}y</span>
                </button>
              ))}
            </div>
          </motion.div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Quick Actions */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              <h2 className="text-xl font-bold text-gray-900 mb-4">Quick Actions</h2>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {quickActions.map((action, index) => (
                  <Link
                    key={action.title}
                    to={action.link}
                    className="group"
                  >
                    <motion.div
                      className="bg-white rounded-xl p-6 shadow-sm hover:shadow-lg transition-all duration-300 border border-gray-100"
                      whileHover={{ y: -2 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      <div className={`w-12 h-12 bg-gradient-to-br ${action.color} rounded-lg flex items-center justify-center text-white mb-4`}>
                        {action.icon}
                      </div>
                      <h3 className="font-semibold text-gray-900 mb-1">{action.title}</h3>
                      <p className="text-sm text-gray-600">{action.description}</p>
                    </motion.div>
                  </Link>
                ))}
              </div>
            </motion.div>

            {/* Activity Stats */}
            {activeChild && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.3 }}
              >
                <h2 className="text-xl font-bold text-gray-900 mb-4">Learning Progress</h2>
                <div className="grid grid-cols-3 gap-4">
                  <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
                    <div className="flex items-center gap-3 mb-2">
                      <CheckCircle className="w-8 h-8 text-green-600" />
                      <div>
                        <div className="text-2xl font-bold text-gray-900">{stats.completed}</div>
                        <div className="text-sm text-gray-600">Activities Completed</div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
                    <div className="flex items-center gap-3 mb-2">
                      <Clock className="w-8 h-8 text-blue-600" />
                      <div>
                        <div className="text-2xl font-bold text-gray-900">{stats.totalTime}</div>
                        <div className="text-sm text-gray-600">Minutes Learning</div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
                    <div className="flex items-center gap-3 mb-2">
                      <Star className="w-8 h-8 text-yellow-600" />
                      <div>
                        <div className="text-2xl font-bold text-gray-900">{activeChild.totalPoints}</div>
                        <div className="text-sm text-gray-600">Learning Points</div>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {/* Today's Recommended Activities */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
            >
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold text-gray-900">Recommended Activities</h2>
                <Link 
                  to="/activity-builder"
                  className="text-blue-600 hover:text-blue-700 font-medium flex items-center gap-1"
                >
                  View All <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
              
              <div className="space-y-4">
                {todaysActivities.slice(0, 3).map((activity, index) => (
                  <motion.div
                    key={activity.id}
                    className="bg-white rounded-xl p-6 shadow-sm hover:shadow-lg transition-all duration-300 border border-gray-100"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.6, delay: 0.1 * index }}
                    whileHover={{ x: 4 }}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <h3 className="font-semibold text-gray-900">{activity.title}</h3>
                          <div className="flex gap-1">
                            {activity.methodologies.slice(0, 2).map((method: string) => (
                              <span
                                key={method}
                                className="px-2 py-1 text-xs font-medium bg-blue-100 text-blue-700 rounded-full capitalize"
                              >
                                {method}
                              </span>
                            ))}
                          </div>
                        </div>
                        <p className="text-gray-600 mb-3 line-clamp-2">{activity.description}</p>
                        <div className="flex items-center gap-4 text-sm text-gray-500">
                          <div className="flex items-center gap-1">
                            <Clock className="w-4 h-4" />
                            {activity.duration} min
                          </div>
                          <div className="flex items-center gap-1">
                            <Target className="w-4 h-4" />
                            Level {activity.difficulty}
                          </div>
                          <div className="flex items-center gap-1">
                            <Star className="w-4 h-4 text-yellow-500" />
                            {activity.rating}
                          </div>
                        </div>
                      </div>
                      <Link
                        to={`/activity-builder`}
                        className="ml-4 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
                      >
                        <User className="w-4 h-4" />
                        Guide
                      </Link>
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>

            {/* Recent Learning Stories */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.5 }}
            >
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold text-gray-900">Recent Learning Stories</h2>
                <Link 
                  to="/learning-stories"
                  className="text-blue-600 hover:text-blue-700 font-medium flex items-center gap-1"
                >
                  View All <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
              
              <div className="space-y-4">
                {recentStories.map((story, index) => (
                  <motion.div
                    key={story.id}
                    className="bg-white rounded-xl p-6 shadow-sm hover:shadow-lg transition-all duration-300 border border-gray-100"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.6, delay: 0.1 * index }}
                  >
                    <div className="flex items-start gap-4">
                      {story.media.photos.length > 0 && (
                        <img 
                          src={story.media.photos[0]} 
                          alt={story.title}
                          className="w-16 h-16 rounded-lg object-cover"
                        />
                      )}
                      <div className="flex-1">
                        <h3 className="font-semibold text-gray-900 mb-1">{story.title}</h3>
                        <p className="text-gray-600 mb-2 line-clamp-2">{story.description}</p>
                        <div className="flex items-center gap-4 text-sm text-gray-500">
                          <span>{new Date(story.date).toLocaleDateString()}</span>
                          <div className="flex items-center gap-2">
                            <Heart className="w-4 h-4 text-red-500" />
                            {story.reactions.hearts}
                          </div>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))}
                
                {recentStories.length === 0 && (
                  <div className="bg-white rounded-xl p-8 shadow-sm border border-gray-100 text-center">
                    <BookOpen className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">No Learning Stories Yet</h3>
                    <p className="text-gray-600 mb-4">Start documenting your child's learning journey</p>
                    <Link
                      to="/learning-stories"
                      className="inline-flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                    >
                      <Camera className="w-4 h-4" />
                      Create First Story
                    </Link>
                  </div>
                )}
              </div>
            </motion.div>
          </div>

          {/* Sidebar */}
          <div className="space-y-8">
            {/* Child Profile Card */}
            {activeChild && (
              <motion.div
                className="bg-white rounded-xl p-6 shadow-sm border border-gray-100"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.2 }}
              >
                <div className="text-center mb-6">
                  {activeChild.avatar && (
                    <img 
                      src={activeChild.avatar} 
                      alt={activeChild.name}
                      className="w-20 h-20 rounded-full object-cover mx-auto mb-4"
                    />
                  )}
                  <h3 className="text-xl font-bold text-gray-900">{activeChild.name}</h3>
                  <p className="text-gray-600">{activeChild.age} years old</p>
                </div>

                <div className="space-y-4">
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-2">Recent Achievements</h4>
                    {recentAchievements.length > 0 ? (
                      <div className="space-y-2">
                        {recentAchievements.map((achievement) => (
                          <div key={achievement.id} className="flex items-center gap-2 p-2 bg-yellow-50 rounded-lg">
                            <Award className="w-4 h-4 text-yellow-600" />
                            <div>
                              <div className="font-medium text-gray-900 text-sm">{achievement.title}</div>
                              <div className="text-xs text-gray-600">{achievement.description}</div>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-gray-500 text-sm">Complete activities to earn achievements!</p>
                    )}
                  </div>

                  <div>
                    <h4 className="font-semibold text-gray-900 mb-2">Learning Style</h4>
                    <span className="px-3 py-1 text-sm bg-green-100 text-green-700 rounded-full capitalize">
                      {activeChild.preferences.learningStyle}
                    </span>
                  </div>
                </div>

                <Link
                  to="/child-profile"
                  className="w-full mt-6 bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition-colors text-center block"
                >
                  View Full Profile
                </Link>
              </motion.div>
            )}

            {/* Developmental Progress */}
            {activeChild && (
              <motion.div
                className="bg-white rounded-xl p-6 shadow-sm border border-gray-100"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.3 }}
              >
                <h3 className="text-lg font-bold text-gray-900 mb-4">Development Overview</h3>
                
                <div className="space-y-4">
                  {developmentalProgress.map((area) => (
                    <div key={area.area}>
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-sm font-medium text-gray-700">{area.area}</span>
                        <span className="text-sm text-gray-600">{area.progress}%</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <motion.div
                          className={`h-2 rounded-full bg-${area.color}-500`}
                          initial={{ width: 0 }}
                          animate={{ width: `${area.progress}%` }}
                          transition={{ duration: 1, delay: 0.5 }}
                        />
                      </div>
                    </div>
                  ))}
                </div>

                <Link
                  to="/analytics"
                  className="w-full mt-6 bg-gray-100 text-gray-700 py-2 rounded-lg hover:bg-gray-200 transition-colors text-center block"
                >
                  View Detailed Analytics
                </Link>
              </motion.div>
            )}

            {/* Today's Schedule */}
            <motion.div
              className="bg-white rounded-xl p-6 shadow-sm border border-gray-100"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
            >
              <h3 className="text-lg font-bold text-gray-900 mb-4">Today's Focus</h3>
              
              <div className="space-y-3">
                <div className="flex items-center gap-3 p-3 bg-green-50 rounded-lg">
                  <CheckCircle className="w-5 h-5 text-green-600" />
                  <div>
                    <p className="font-medium text-gray-900">Parent-Guided Learning</p>
                    <p className="text-sm text-gray-600">Ready when you are!</p>
                  </div>
                </div>
                
                <div className="flex items-center gap-3 p-3 bg-blue-50 rounded-lg">
                  <ActivityIcon className="w-5 h-5 text-blue-600" />
                  <div>
                    <p className="font-medium text-gray-900">Explore Activities</p>
                    <p className="text-sm text-gray-600">3 new recommendations</p>
                  </div>
                </div>
                
                <div className="flex items-center gap-3 p-3 bg-purple-50 rounded-lg">
                  <Camera className="w-5 h-5 text-purple-600" />
                  <div>
                    <p className="font-medium text-gray-900">Document Learning</p>
                    <p className="text-sm text-gray-600">Capture special moments</p>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;