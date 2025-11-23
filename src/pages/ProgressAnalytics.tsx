import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  TrendingUp, 
  Calendar, 
  Target, 
  Star, 
  Brain, 
  Users, 
  Palette, 
  Music,
  BarChart3,
  Download,
  BookOpen
} from 'lucide-react';
import { useChildStore } from '../store/childStore';
import { useActivityStore } from '../store/activityStore';
import { useLearningStoryStore } from '../store/learningStoryStore';
import DevelopmentalRadarChart from '../components/DevelopmentalRadarChart';
import LearningInsights from '../components/LearningInsights';
import ProgressReport from '../components/ProgressReport';
import toast from 'react-hot-toast';

const ProgressAnalytics = () => {
  const { children, activeChild, setActiveChild, fetchChildren } = useChildStore();
  const { activities, fetchActivities } = useActivityStore();
  const { getStoriesForChild, fetchStories } = useLearningStoryStore();
  
  const [selectedTimeframe, setSelectedTimeframe] = useState<'week' | 'month' | 'quarter' | 'year'>('month');
  const [showInsights, setShowInsights] = useState(true);
  const [activeTab, setActiveTab] = useState<'overview' | 'development' | 'reports'>('overview');
  const [showReportModal, setShowReportModal] = useState(false);
  const [analyticsData, setAnalyticsData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  const timeframes = [
    { id: 'week', label: 'This Week', days: 7 },
    { id: 'month', label: 'This Month', days: 30 },
    { id: 'quarter', label: 'Last 3 Months', days: 90 },
    { id: 'year', label: 'This Year', days: 365 }
  ];

  // Developmental areas - using standard areas from child profile structure
  // These match the developmentalProfile keys in the Child interface
  const developmentalAreas = [
    { id: 'cognitive', label: 'Cognitive', icon: Brain, color: 'blue' },
    { id: 'language', label: 'Language', icon: Music, color: 'green' },
    { id: 'social', label: 'Social', icon: Users, color: 'purple' },
    { id: 'physical', label: 'Physical', icon: Target, color: 'orange' },
    { id: 'creative', label: 'Creative', icon: Palette, color: 'pink' }
  ];
  // Note: These are UI configuration for the analytics page, matching the Child.developmentalProfile structure

  // Fetch all data when component mounts
  useEffect(() => {
    const fetchInitialData = async () => {
      setIsLoading(true);
      try {
        await Promise.all([
          fetchChildren(),
          fetchActivities()
        ]);
      } catch (error) {
        console.error('Error fetching analytics data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchInitialData();
  }, [fetchChildren, fetchActivities]);

  // Fetch stories when active child changes
  useEffect(() => {
    if (activeChild) {
      fetchStories(activeChild.id);
    }
  }, [activeChild?.id, fetchStories]);

  // Recalculate analytics when data or timeframe changes
  useEffect(() => {
    const calculateAnalytics = async () => {
      if (!activeChild) {
        setAnalyticsData(null);
        return;
      }

      try {
        const childStories = getStoriesForChild(activeChild.id);
        
        const now = new Date();
        const timeframeDays = timeframes.find(t => t.id === selectedTimeframe)?.days || 30;
        const startDate = new Date(now.getTime() - (timeframeDays * 24 * 60 * 60 * 1000));

        // Filter data by timeframe - ensure activityHistory exists
        const activityHistory = activeChild.activityHistory || [];
        const recentActivities = activityHistory.filter(
          (activity: any) => {
            if (!activity.completedAt) return false;
            try {
              return new Date(activity.completedAt) >= startDate;
            } catch {
              return false;
            }
          }
        );
        const recentStories = childStories.filter(
          (story: any) => {
            if (!story.date) return false;
            try {
              return new Date(story.date) >= startDate;
            } catch {
              return false;
            }
          }
        );

        // Calculate metrics
        const totalActivities = recentActivities.length;
        const totalLearningTime = recentActivities.reduce((sum: number, activity: any) => sum + (activity.duration || 0), 0);
        const averageSessionTime = totalActivities > 0 ? Math.round(totalLearningTime / totalActivities) : 0;
        const storiesCreated = recentStories.length;

        // Calculate progress trends
        const previousPeriodStart = new Date(startDate.getTime() - (timeframeDays * 24 * 60 * 60 * 1000));
        const previousActivities = activityHistory.filter(
          (activity: any) => {
            if (!activity.completedAt) return false;
            try {
              const activityDate = new Date(activity.completedAt);
              return activityDate >= previousPeriodStart && activityDate < startDate;
            } catch {
              return false;
            }
          }
        );
        
        const activityTrend = previousActivities.length > 0 
          ? ((totalActivities - previousActivities.length) / previousActivities.length) * 100 
          : totalActivities > 0 ? 100 : 0;

        // Calculate developmental progress
        const developmentalProgress = developmentalAreas.map(area => ({
          ...area,
          current: activeChild.developmentalProfile?.[area.id as keyof typeof activeChild.developmentalProfile] || 0,
          trend: 0 // Will be calculated from historical data if available
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
        const longestStreak = Math.max(currentStreak, 7); // Could be fetched from achievements if needed

        setAnalyticsData({
          totalActivities,
          totalLearningTime,
          averageSessionTime,
          storiesCreated,
          activityTrend,
          developmentalProgress,
          activityCategories,
          currentStreak,
          longestStreak,
          recentActivities,
          recentStories
        });
      } catch (error) {
        console.error('Error calculating analytics:', error);
        setAnalyticsData(null);
      }
    };

    calculateAnalytics();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeChild, selectedTimeframe, activities.length]);

  const renderOverviewTab = () => {
    if (!analyticsData) return null;

    return (
      <div className="space-y-8">
        {/* Developmental Overview */}
        <div className="grid grid-cols-1 lg:grid-cols-1 gap-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.5 }}
          >
            <DevelopmentalRadarChart 
              data={analyticsData.developmentalProgress}
            />
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

  const renderDevelopmentTab = () => {
    if (!activeChild || !analyticsData) {
      return (
        <div className="text-center py-8">
          <p className="text-gray-600">No data available</p>
        </div>
      );
    }

    return (
      <div className="space-y-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <DevelopmentalRadarChart 
            data={analyticsData.developmentalProgress || []}
          />
          <div className="space-y-6">
            {developmentalAreas.map((area) => {
              const Icon = area.icon;
              const progress = activeChild.developmentalProfile?.[area.id as keyof typeof activeChild.developmentalProfile] || 0;
              
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
  };


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
            <p className="text-gray-600 mb-8">
              Please select a child profile to view their progress analytics.
            </p>
            
            {children.length > 0 ? (
              <div className="flex flex-wrap justify-center gap-4">
                {children.map((child) => (
                  <button
                    key={child.id}
                    onClick={() => setActiveChild(child)}
                    className="flex items-center gap-3 px-6 py-4 bg-white border-2 border-gray-200 rounded-xl hover:border-blue-500 hover:shadow-md transition-all duration-300"
                  >
                    {child.avatar && (
                      <img 
                        src={child.avatar} 
                        alt={child.name}
                        className="w-10 h-10 rounded-full object-cover"
                      />
                    )}
                    <span className="text-lg font-medium text-gray-900">{child.name}</span>
                  </button>
                ))}
              </div>
            ) : (
              <div className="text-center">
                 <p className="text-gray-500 mb-4">No child profiles found.</p>
                 {/* Link to create child would be good here but not strictly asked for */}
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center py-16">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading analytics data...</p>
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