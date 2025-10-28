import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  TrendingUp, 
  Calendar, 
  Target, 
  Star, 
  Brain, 
  Heart, 
  Users, 
  Palette, 
  Music,
  BarChart3,
  PieChart,
  Activity,
  Clock,
  Award,
  Download,
  Share2,
  Filter,
  ChevronDown,
  ChevronUp,
  Eye,
  BookOpen,
  Zap,
  Sparkles,
  ArrowUp,
  ArrowDown,
  Minus,
  CheckCircle,
  AlertCircle,
  Info
} from 'lucide-react';
import { useChildStore } from '../store/childStore';
import { useActivityStore } from '../store/activityStore';
import { useLearningStoryStore } from '../store/learningStoryStore';
import { useTherapyStore } from '../store/therapyStore';
import ProgressChart from '../components/ProgressChart';
import DevelopmentalRadarChart from '../components/DevelopmentalRadarChart';
import ActivityHeatmap from '../components/ActivityHeatmap';
import MilestoneTracker from '../components/MilestoneTracker';
import LearningInsights from '../components/LearningInsights';
import ProgressReport from '../components/ProgressReport';
import toast from 'react-hot-toast';

const ProgressAnalytics = () => {
  const { children, activeChild, setActiveChild } = useChildStore();
  const { activities } = useActivityStore();
  const { getStoriesForChild } = useLearningStoryStore();
  const { getSessionsForChild, getProgressData } = useTherapyStore();
  
  const [selectedTimeframe, setSelectedTimeframe] = useState<'week' | 'month' | 'quarter' | 'year'>('month');
  const [selectedMetrics, setSelectedMetrics] = useState<string[]>(['cognitive', 'language', 'social', 'physical', 'creative']);
  const [showInsights, setShowInsights] = useState(true);
  const [activeTab, setActiveTab] = useState<'overview' | 'development' | 'activities' | 'therapy' | 'milestones' | 'reports'>('overview');
  const [showReportModal, setShowReportModal] = useState(false);

  const timeframes = [
    { id: 'week', label: 'This Week', days: 7 },
    { id: 'month', label: 'This Month', days: 30 },
    { id: 'quarter', label: 'Last 3 Months', days: 90 },
    { id: 'year', label: 'This Year', days: 365 }
  ];

  const developmentalAreas = [
    { id: 'cognitive', label: 'Cognitive', icon: Brain, color: 'blue' },
    { id: 'language', label: 'Language', icon: Music, color: 'green' },
    { id: 'social', label: 'Social', icon: Users, color: 'purple' },
    { id: 'physical', label: 'Physical', icon: Target, color: 'orange' },
    { id: 'creative', label: 'Creative', icon: Palette, color: 'pink' }
  ];

  // Calculate analytics data
  const getAnalyticsData = () => {
    if (!activeChild) return null;

    const childStories = getStoriesForChild(activeChild.id);
    const therapySessions = getSessionsForChild(activeChild.id);
    const therapyProgress = getProgressData(activeChild.id);
    
    const now = new Date();
    const timeframeDays = timeframes.find(t => t.id === selectedTimeframe)?.days || 30;
    const startDate = new Date(now.getTime() - (timeframeDays * 24 * 60 * 60 * 1000));

    // Filter data by timeframe
    const recentActivities = activeChild.activityHistory.filter(
      activity => new Date(activity.completedAt) >= startDate
    );
    const recentStories = childStories.filter(
      story => new Date(story.date) >= startDate
    );
    const recentSessions = therapySessions.filter(
      session => new Date(session.date) >= startDate
    );

    // Calculate metrics
    const totalActivities = recentActivities.length;
    const totalLearningTime = recentActivities.reduce((sum, activity) => sum + activity.duration, 0);
    const averageSessionTime = totalActivities > 0 ? Math.round(totalLearningTime / totalActivities) : 0;
    const storiesCreated = recentStories.length;
    const therapySessionsCompleted = recentSessions.filter(s => s.status === 'completed').length;

    // Calculate progress trends
    const previousPeriodStart = new Date(startDate.getTime() - (timeframeDays * 24 * 60 * 60 * 1000));
    const previousActivities = activeChild.activityHistory.filter(
      activity => new Date(activity.completedAt) >= previousPeriodStart && new Date(activity.completedAt) < startDate
    );
    
    const activityTrend = previousActivities.length > 0 
      ? ((totalActivities - previousActivities.length) / previousActivities.length) * 100 
      : totalActivities > 0 ? 100 : 0;

    // Calculate developmental progress
    const developmentalProgress = developmentalAreas.map(area => ({
      ...area,
      current: activeChild.developmentalProfile[area.id as keyof typeof activeChild.developmentalProfile],
      trend: Math.random() * 10 - 5 // Mock trend data
    }));

    // Activity distribution by category
    const activityCategories = recentActivities.reduce((acc, activity) => {
      const activityData = activities.find(a => a.id === activity.activityId);
      if (activityData) {
        acc[activityData.category] = (acc[activityData.category] || 0) + 1;
      }
      return acc;
    }, {} as Record<string, number>);

    // Learning streaks
    const currentStreak = activeChild.currentStreak;
    const longestStreak = Math.max(currentStreak, 7); // Mock data

    return {
      totalActivities,
      totalLearningTime,
      averageSessionTime,
      storiesCreated,
      therapySessionsCompleted,
      activityTrend,
      developmentalProgress,
      activityCategories,
      currentStreak,
      longestStreak,
      therapyProgress,
      recentActivities,
      recentStories,
      recentSessions
    };
  };

  const analyticsData = getAnalyticsData();

  const renderOverviewTab = () => {
    if (!analyticsData) return null;

    return (
      <div className="space-y-8">
        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <motion.div
            className="bg-white rounded-xl p-6 shadow-sm border border-gray-100"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <Activity className="w-6 h-6 text-blue-600" />
              </div>
              <div className={`flex items-center gap-1 text-sm font-medium ${
                analyticsData.activityTrend > 0 ? 'text-green-600' : 
                analyticsData.activityTrend < 0 ? 'text-red-600' : 'text-gray-600'
              }`}>
                {analyticsData.activityTrend > 0 ? <ArrowUp className="w-4 h-4" /> :
                 analyticsData.activityTrend < 0 ? <ArrowDown className="w-4 h-4" /> :
                 <Minus className="w-4 h-4" />}
                {Math.abs(analyticsData.activityTrend).toFixed(1)}%
              </div>
            </div>
            <div className="text-3xl font-bold text-gray-900 mb-1">{analyticsData.totalActivities}</div>
            <div className="text-sm text-gray-600">Activities Completed</div>
          </motion.div>

          <motion.div
            className="bg-white rounded-xl p-6 shadow-sm border border-gray-100"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
          >
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                <Clock className="w-6 h-6 text-green-600" />
              </div>
            </div>
            <div className="text-3xl font-bold text-gray-900 mb-1">{analyticsData.totalLearningTime}</div>
            <div className="text-sm text-gray-600">Minutes Learning</div>
          </motion.div>

          <motion.div
            className="bg-white rounded-xl p-6 shadow-sm border border-gray-100"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                <BookOpen className="w-6 h-6 text-purple-600" />
              </div>
            </div>
            <div className="text-3xl font-bold text-gray-900 mb-1">{analyticsData.storiesCreated}</div>
            <div className="text-sm text-gray-600">Learning Stories</div>
          </motion.div>

          <motion.div
            className="bg-white rounded-xl p-6 shadow-sm border border-gray-100"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
          >
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
                <Zap className="w-6 h-6 text-orange-600" />
              </div>
            </div>
            <div className="text-3xl font-bold text-gray-900 mb-1">{analyticsData.currentStreak}</div>
            <div className="text-sm text-gray-600">Day Streak</div>
          </motion.div>
        </div>

        {/* Progress Chart */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
        >
          <ProgressChart 
            data={{
              activities: analyticsData.recentActivities,
              timeframe: selectedTimeframe
            }}
          />
        </motion.div>

        {/* Developmental Overview */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.5 }}
          >
            <DevelopmentalRadarChart 
              data={analyticsData.developmentalProgress}
            />
          </motion.div>

          <motion.div
            className="bg-white rounded-xl p-6 shadow-sm border border-gray-100"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.6 }}
          >
            <h3 className="text-lg font-bold text-gray-900 mb-4">Activity Distribution</h3>
            <div className="space-y-4">
              {Object.entries(analyticsData.activityCategories).map(([category, count]) => {
                const total = Object.values(analyticsData.activityCategories).reduce((sum, c) => sum + c, 0);
                const percentage = total > 0 ? (count / total) * 100 : 0;
                
                return (
                  <div key={category}>
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm font-medium text-gray-700">{category}</span>
                      <span className="text-sm text-gray-600">{count} ({percentage.toFixed(1)}%)</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <motion.div
                        className="bg-blue-500 h-2 rounded-full"
                        initial={{ width: 0 }}
                        animate={{ width: `${percentage}%` }}
                        transition={{ duration: 1, delay: 0.5 }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </motion.div>
        </div>

        {/* Learning Insights */}
        {showInsights && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.7 }}
          >
            <LearningInsights 
              child={activeChild}
              analyticsData={analyticsData}
            />
          </motion.div>
        )}
      </div>
    );
  };

  const renderDevelopmentTab = () => (
    <div className="space-y-8">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <DevelopmentalRadarChart 
          data={analyticsData?.developmentalProgress || []}
        />
        <div className="space-y-6">
          {developmentalAreas.map((area) => {
            const Icon = area.icon;
            const progress = activeChild?.developmentalProfile[area.id as keyof typeof activeChild.developmentalProfile] || 0;
            
            return (
              <div key={area.id} className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 bg-${area.color}-100 rounded-lg flex items-center justify-center`}>
                      <Icon className={`w-5 h-5 text-${area.color}-600`} />
                    </div>
                    <span className="font-semibold text-gray-900">{area.label}</span>
                  </div>
                  <span className="text-2xl font-bold text-gray-900">{progress}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-3">
                  <motion.div
                    className={`h-3 rounded-full bg-${area.color}-500`}
                    initial={{ width: 0 }}
                    animate={{ width: `${progress}%` }}
                    transition={{ duration: 1, delay: 0.2 }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );

  const renderActivitiesTab = () => (
    <div className="space-y-8">
      <ActivityHeatmap 
        activities={analyticsData?.recentActivities || []}
        timeframe={selectedTimeframe}
      />
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <h3 className="text-lg font-bold text-gray-900 mb-4">Recent Activities</h3>
          <div className="space-y-4">
            {analyticsData?.recentActivities.slice(0, 5).map((activity, index) => {
              const activityData = activities.find(a => a.id === activity.activityId);
              return (
                <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div>
                    <div className="font-medium text-gray-900">{activityData?.title || 'Unknown Activity'}</div>
                    <div className="text-sm text-gray-600">{new Date(activity.completedAt).toLocaleDateString()}</div>
                  </div>
                  <div className="text-sm text-gray-600">{activity.duration} min</div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <h3 className="text-lg font-bold text-gray-900 mb-4">Learning Preferences</h3>
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-gray-700">Learning Style</span>
              <span className="font-medium text-gray-900 capitalize">{activeChild?.preferences.learningStyle}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-700">Energy Level</span>
              <span className="font-medium text-gray-900 capitalize">{activeChild?.preferences.energyLevel}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-700">Social Preference</span>
              <span className="font-medium text-gray-900 capitalize">{activeChild?.preferences.socialPreference.replace('-', ' ')}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-700">Average Session</span>
              <span className="font-medium text-gray-900">{analyticsData?.averageSessionTime} min</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const renderTherapyTab = () => (
    <div className="space-y-8">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <h3 className="text-lg font-bold text-gray-900 mb-4">Speech Therapy Progress</h3>
          <div className="text-center mb-4">
            <div className="text-4xl font-bold text-blue-600">{analyticsData?.therapyProgress?.speech || 0}%</div>
            <div className="text-sm text-gray-600">Overall Progress</div>
          </div>
          <div className="space-y-3">
            {activeChild?.speechGoals.map((goal, index) => (
              <div key={index} className="p-3 bg-blue-50 rounded-lg">
                <div className="font-medium text-blue-900 text-sm">{goal}</div>
                <div className="w-full bg-blue-200 rounded-full h-2 mt-2">
                  <div 
                    className="bg-blue-600 h-2 rounded-full" 
                    style={{ width: `${Math.random() * 100}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <h3 className="text-lg font-bold text-gray-900 mb-4">OT Progress</h3>
          <div className="text-center mb-4">
            <div className="text-4xl font-bold text-green-600">{analyticsData?.therapyProgress?.ot || 0}%</div>
            <div className="text-sm text-gray-600">Overall Progress</div>
          </div>
          <div className="space-y-3">
            {activeChild?.otGoals.map((goal, index) => (
              <div key={index} className="p-3 bg-green-50 rounded-lg">
                <div className="font-medium text-green-900 text-sm">{goal}</div>
                <div className="w-full bg-green-200 rounded-full h-2 mt-2">
                  <div 
                    className="bg-green-600 h-2 rounded-full" 
                    style={{ width: `${Math.random() * 100}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
        <h3 className="text-lg font-bold text-gray-900 mb-4">Recent Therapy Sessions</h3>
        <div className="space-y-4">
          {analyticsData?.recentSessions.map((session, index) => (
            <div key={index} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
              <div className="flex items-center gap-4">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                  session.type === 'speech' ? 'bg-blue-100 text-blue-600' : 'bg-green-100 text-green-600'
                }`}>
                  {session.type === 'speech' ? '🗣️' : '✋'}
                </div>
                <div>
                  <div className="font-medium text-gray-900">{session.title}</div>
                  <div className="text-sm text-gray-600">{new Date(session.date).toLocaleDateString()}</div>
                </div>
              </div>
              <div className={`px-3 py-1 rounded-full text-sm font-medium ${
                session.status === 'completed' 
                  ? 'bg-green-100 text-green-700' 
                  : 'bg-yellow-100 text-yellow-700'
              }`}>
                {session.status}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  const renderMilestonesTab = () => (
    <div className="space-y-8">
      <MilestoneTracker 
        child={activeChild}
        developmentalAreas={developmentalAreas}
      />
    </div>
  );

  const renderReportsTab = () => (
    <div className="space-y-8">
      <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-bold text-gray-900">Generate Reports</h3>
          <button
            onClick={() => setShowReportModal(true)}
            className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
          >
            <Download className="w-5 h-5" />
            Generate Report
          </button>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[
            {
              title: 'Weekly Summary',
              description: 'Overview of this week\'s activities and progress',
              icon: Calendar,
              color: 'blue'
            },
            {
              title: 'Developmental Report',
              description: 'Comprehensive developmental assessment',
              icon: TrendingUp,
              color: 'green'
            },
            {
              title: 'Therapy Progress',
              description: 'Speech and OT progress summary',
              icon: Target,
              color: 'purple'
            },
            {
              title: 'Learning Stories',
              description: 'Collection of documented learning moments',
              icon: BookOpen,
              color: 'orange'
            },
            {
              title: 'Activity Analysis',
              description: 'Detailed breakdown of completed activities',
              icon: BarChart3,
              color: 'pink'
            },
            {
              title: 'Custom Report',
              description: 'Create a personalized report',
              icon: Star,
              color: 'yellow'
            }
          ].map((report, index) => {
            const Icon = report.icon;
            return (
              <motion.div
                key={report.title}
                className="border border-gray-200 rounded-lg p-6 hover:border-blue-300 hover:bg-blue-50 transition-all duration-300 cursor-pointer"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                whileHover={{ y: -2 }}
                onClick={() => toast.success(`Generating ${report.title}...`)}
              >
                <div className={`w-12 h-12 bg-${report.color}-100 rounded-lg flex items-center justify-center mb-4`}>
                  <Icon className={`w-6 h-6 text-${report.color}-600`} />
                </div>
                <h4 className="font-semibold text-gray-900 mb-2">{report.title}</h4>
                <p className="text-sm text-gray-600">{report.description}</p>
              </motion.div>
            );
          })}
        </div>
      </div>
    </div>
  );

  if (!activeChild) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center py-16">
            <BarChart3 className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-gray-900 mb-2">No Child Selected</h2>
            <p className="text-gray-600">
              Please select a child profile to view their progress analytics.
            </p>
          </div>
        </div>
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
              <h1 className="text-3xl font-bold text-gray-900 mb-2">Progress Analytics</h1>
              <p className="text-gray-600">
                Comprehensive insights into {activeChild.name}'s learning journey
              </p>
            </div>
            
            <div className="flex items-center gap-4">
              <select
                value={selectedTimeframe}
                onChange={(e) => setSelectedTimeframe(e.target.value as any)}
                className="px-4 py-2 bg-white border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                {timeframes.map(timeframe => (
                  <option key={timeframe.id} value={timeframe.id}>{timeframe.label}</option>
                ))}
              </select>
              
              <button
                onClick={() => setShowReportModal(true)}
                className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
              >
                <Download className="w-4 h-4" />
                Export
              </button>
            </div>
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
                </button>
              ))}
            </div>
          </motion.div>
        )}

        {/* Tab Navigation */}
        <motion.div
          className="mb-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          <div className="flex space-x-1 bg-white rounded-xl p-1 shadow-sm border border-gray-100 overflow-x-auto">
            {[
              { id: 'overview', label: 'Overview', icon: BarChart3 },
              { id: 'development', label: 'Development', icon: TrendingUp },
              { id: 'activities', label: 'Activities', icon: Activity },
              { id: 'therapy', label: 'Therapy', icon: Target },
              { id: 'milestones', label: 'Milestones', icon: Award },
              { id: 'reports', label: 'Reports', icon: Download }
            ].map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`flex items-center gap-2 px-4 py-3 rounded-lg font-medium transition-all duration-300 whitespace-nowrap ${
                    activeTab === tab.id
                      ? 'bg-blue-100 text-blue-700'
                      : 'text-gray-600 hover:text-blue-600 hover:bg-blue-50'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span className="hidden sm:inline">{tab.label}</span>
                </button>
              );
            })}
          </div>
        </motion.div>

        {/* Tab Content */}
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          {activeTab === 'overview' && renderOverviewTab()}
          {activeTab === 'development' && renderDevelopmentTab()}
          {activeTab === 'activities' && renderActivitiesTab()}
          {activeTab === 'therapy' && renderTherapyTab()}
          {activeTab === 'milestones' && renderMilestonesTab()}
          {activeTab === 'reports' && renderReportsTab()}
        </motion.div>

        {/* Report Modal */}
        <AnimatePresence>
          {showReportModal && (
            <ProgressReport
              child={activeChild}
              analyticsData={analyticsData}
              onClose={() => setShowReportModal(false)}
            />
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default ProgressAnalytics;