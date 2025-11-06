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
  Activity as ActivityIcon,
  MoreHorizontal,
  ChevronUp,
  ChevronDown
} from 'lucide-react';
import { 
  LineChart, 
  Line, 
  AreaChart, 
  Area, 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend
} from 'recharts';
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
  const [hoveredMetric, setHoveredMetric] = useState<string | null>(null);
  const [selectedTimeRange, setSelectedTimeRange] = useState<'week' | 'month' | 'year'>('week');
  
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

  // Sample data for charts
  const weeklyProgressData = [
    { day: 'Mon', activities: 4, time: 45 },
    { day: 'Tue', activities: 6, time: 60 },
    { day: 'Wed', activities: 3, time: 35 },
    { day: 'Thu', activities: 8, time: 75 },
    { day: 'Fri', activities: 5, time: 50 },
    { day: 'Sat', activities: 7, time: 65 },
    { day: 'Sun', activities: 4, time: 40 }
  ];

  const developmentalData = activeChild ? [
    { area: 'Cognitive', progress: activeChild.developmentalProfile.cognitive },
    { area: 'Language', progress: activeChild.developmentalProfile.language },
    { area: 'Social', progress: activeChild.developmentalProfile.social },
    { area: 'Physical', progress: activeChild.developmentalProfile.physical },
    { area: 'Creative', progress: activeChild.developmentalProfile.creative }
  ] : [];

  const activityDistribution = [
    { name: 'Cognitive', value: 35, color: '#6366f1' },
    { name: 'Language', value: 25, color: '#10b981' },
    { name: 'Social', value: 20, color: '#f59e0b' },
    { name: 'Physical', value: 20, color: '#ef4444' }
  ];

  const getActivityStats = () => {
    if (!activeChild) return { completed: 0, totalTime: 0, streak: 0 };
    
    return {
      completed: activeChild.activityHistory.length,
      totalTime: activeChild.activityHistory.reduce((sum, activity) => sum + activity.duration, 0),
      streak: activeChild.currentStreak
    };
  };

  const stats = getActivityStats();

  // Custom tooltip components
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-3 border border-gray-200 rounded-lg shadow-lg">
          <p className="text-sm font-medium text-gray-900">{`${label}`}</p>
          <p className="text-sm text-gray-600">
            {`Activities: ${payload[0].value}`}
          </p>
        </div>
      );
    }
    return null;
  };

  const PieTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-3 border border-gray-200 rounded-lg shadow-lg">
          <p className="text-sm font-medium text-gray-900">{payload[0].name}</p>
          <p className="text-sm text-gray-600">
            {`${payload[0].value}% of activities`}
          </p>
        </div>
      );
    }
    return null;
  };

  const BarTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-3 border border-gray-200 rounded-lg shadow-lg">
          <p className="text-sm font-medium text-gray-900">{label}</p>
          <p className="text-sm text-gray-600">
            {`Progress: ${payload[0].value}%`}
          </p>
        </div>
      );
    }
    return null;
  };

  // Time range data
  const getTimeRangeData = () => {
    switch (selectedTimeRange) {
      case 'month':
        return [
          { day: 'Week 1', activities: 28, time: 320 },
          { day: 'Week 2', activities: 35, time: 410 },
          { day: 'Week 3', activities: 22, time: 280 },
          { day: 'Week 4', activities: 41, time: 520 }
        ];
      case 'year':
        return [
          { day: 'Jan', activities: 120, time: 1400 },
          { day: 'Feb', activities: 98, time: 1200 },
          { day: 'Mar', activities: 145, time: 1650 },
          { day: 'Apr', activities: 132, time: 1580 },
          { day: 'May', activities: 167, time: 1890 },
          { day: 'Jun', activities: 154, time: 1720 }
        ];
      default:
        return weeklyProgressData;
    }
  };

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-7xl mx-auto">
        {/* Header Section */}
        <motion.div
          className="px-6 py-4 border-b border-gray-100"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-semibold text-gray-900">
                {greeting}, {user?.name}
              </h1>
              <p className="text-sm text-gray-500 mt-1">
                {new Date().toLocaleDateString('en-US', { 
                  weekday: 'long', 
                  year: 'numeric', 
                  month: 'long', 
                  day: 'numeric' 
                })}
              </p>
            </div>
            {activeChild && (
              <div className="flex items-center gap-3">
                {activeChild.avatar && (
                  <img 
                    src={activeChild.avatar} 
                    alt={activeChild.name}
                    className="w-10 h-10 rounded-full object-cover"
                  />
                )}
                <div>
                  <p className="text-sm font-medium text-gray-900">{activeChild.name}</p>
                  <p className="text-xs text-gray-500">{activeChild.age} years old</p>
                </div>
                <MoreHorizontal className="w-4 h-4 text-gray-400" />
              </div>
            )}
          </div>
        </motion.div>

        {/* Child Selector */}
        {children.length > 1 && (
          <motion.div
            className="px-6 py-3 border-b border-gray-100"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
          >
            <div className="flex gap-2 overflow-x-auto">
              {children.map((child) => (
                <button
                  key={child.id}
                  onClick={() => setActiveChild(child)}
                  className={`flex items-center gap-2 px-3 py-2 text-sm transition-all duration-200 whitespace-nowrap ${
                    activeChild?.id === child.id
                      ? 'text-gray-900 border-b-2 border-gray-900'
                      : 'text-gray-500 hover:text-gray-700'
                  }`}
                >
                  {child.avatar && (
                    <img 
                      src={child.avatar} 
                      alt={child.name}
                      className="w-6 h-6 rounded-full object-cover"
                    />
                  )}
                  <span>{child.name}</span>
                </button>
              ))}
            </div>
          </motion.div>
        )}

        {/* Main Dashboard Content */}
        <div className="px-6 py-6">
          {/* Key Metrics Row */}
          {activeChild && (
            <motion.div
              className="grid grid-cols-4 gap-6 mb-8"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              <motion.div 
                className="text-center p-4 rounded-lg cursor-pointer transition-all duration-200"
                onMouseEnter={() => setHoveredMetric('completed')}
                onMouseLeave={() => setHoveredMetric(null)}
                whileHover={{ scale: 1.02, backgroundColor: '#f9fafb' }}
                whileTap={{ scale: 0.98 }}
              >
                <motion.div 
                  className="text-2xl font-semibold text-gray-900"
                  animate={{ 
                    scale: hoveredMetric === 'completed' ? 1.1 : 1,
                    color: hoveredMetric === 'completed' ? '#059669' : '#111827'
                  }}
                >
                  {stats.completed}
                </motion.div>
                <div className="text-sm text-gray-500">Activities Completed</div>
                <motion.div 
                  className="flex items-center justify-center mt-1"
                  animate={{ y: hoveredMetric === 'completed' ? -2 : 0 }}
                >
                  <ChevronUp className="w-4 h-4 text-green-500" />
                  <span className="text-xs text-green-500">+12%</span>
                </motion.div>
                {hoveredMetric === 'completed' && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-xs text-gray-400 mt-1"
                  >
                    Click for details
                  </motion.div>
                )}
              </motion.div>
              
              <motion.div 
                className="text-center p-4 rounded-lg cursor-pointer transition-all duration-200"
                onMouseEnter={() => setHoveredMetric('time')}
                onMouseLeave={() => setHoveredMetric(null)}
                whileHover={{ scale: 1.02, backgroundColor: '#f9fafb' }}
                whileTap={{ scale: 0.98 }}
              >
                <motion.div 
                  className="text-2xl font-semibold text-gray-900"
                  animate={{ 
                    scale: hoveredMetric === 'time' ? 1.1 : 1,
                    color: hoveredMetric === 'time' ? '#2563eb' : '#111827'
                  }}
                >
                  {stats.totalTime}h
                </motion.div>
                <div className="text-sm text-gray-500">Learning Time</div>
                <motion.div 
                  className="flex items-center justify-center mt-1"
                  animate={{ y: hoveredMetric === 'time' ? -2 : 0 }}
                >
                  <ChevronUp className="w-4 h-4 text-green-500" />
                  <span className="text-xs text-green-500">+8%</span>
                </motion.div>
                {hoveredMetric === 'time' && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-xs text-gray-400 mt-1"
                  >
                    Click for breakdown
                  </motion.div>
                )}
              </motion.div>
              
              <motion.div 
                className="text-center p-4 rounded-lg cursor-pointer transition-all duration-200"
                onMouseEnter={() => setHoveredMetric('efficiency')}
                onMouseLeave={() => setHoveredMetric(null)}
                whileHover={{ scale: 1.02, backgroundColor: '#f9fafb' }}
                whileTap={{ scale: 0.98 }}
              >
                <motion.div 
                  className="text-2xl font-semibold text-gray-900"
                  animate={{ 
                    scale: hoveredMetric === 'efficiency' ? 1.1 : 1,
                    color: hoveredMetric === 'efficiency' ? '#7c3aed' : '#111827'
                  }}
                >
                  93%
                </motion.div>
                <div className="text-sm text-gray-500">Efficiency</div>
                <motion.div 
                  className="flex items-center justify-center mt-1"
                  animate={{ y: hoveredMetric === 'efficiency' ? -2 : 0 }}
                >
                  <ChevronUp className="w-4 h-4 text-green-500" />
                  <span className="text-xs text-green-500">+2%</span>
                </motion.div>
                {hoveredMetric === 'efficiency' && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-xs text-gray-400 mt-1"
                  >
                    View trends
                  </motion.div>
                )}
              </motion.div>
              
              <motion.div 
                className="text-center p-4 rounded-lg cursor-pointer transition-all duration-200"
                onMouseEnter={() => setHoveredMetric('points')}
                onMouseLeave={() => setHoveredMetric(null)}
                whileHover={{ scale: 1.02, backgroundColor: '#f9fafb' }}
                whileTap={{ scale: 0.98 }}
              >
                <motion.div 
                  className="text-2xl font-semibold text-gray-900"
                  animate={{ 
                    scale: hoveredMetric === 'points' ? 1.1 : 1,
                    color: hoveredMetric === 'points' ? '#f59e0b' : '#111827'
                  }}
                >
                  {activeChild.totalPoints}
                </motion.div>
                <div className="text-sm text-gray-500">Learning Points</div>
                <motion.div 
                  className="flex items-center justify-center mt-1"
                  animate={{ y: hoveredMetric === 'points' ? -2 : 0 }}
                >
                  <ChevronUp className="w-4 h-4 text-green-500" />
                  <span className="text-xs text-green-500">+15%</span>
                </motion.div>
                {hoveredMetric === 'points' && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-xs text-gray-400 mt-1"
                  >
                    Earn more points
                  </motion.div>
                )}
              </motion.div>
            </motion.div>
          )}

          {/* Charts Section */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
            {/* Weekly Progress Chart */}
            <motion.div
              className="border-b border-gray-100 pb-6"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-medium text-gray-900">Learning Progress</h3>
                <div className="flex items-center gap-2">
                  {(['week', 'month', 'year'] as const).map((range) => (
                    <button
                      key={range}
                      onClick={() => setSelectedTimeRange(range)}
                      className={`px-3 py-1 text-sm rounded-md transition-all duration-200 ${
                        selectedTimeRange === range
                          ? 'bg-gray-900 text-white'
                          : 'text-gray-500 hover:text-gray-700 hover:bg-gray-100'
                      }`}
                    >
                      {range.charAt(0).toUpperCase() + range.slice(1)}
                    </button>
                  ))}
                </div>
              </div>
              <motion.div 
                className="h-64"
                key={selectedTimeRange}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.3 }}
              >
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={getTimeRangeData()}>
                    <defs>
                      <linearGradient id="colorActivities" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#111827" stopOpacity={0.1}/>
                        <stop offset="95%" stopColor="#111827" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <XAxis 
                      dataKey="day" 
                      axisLine={false}
                      tickLine={false}
                      tick={{ fontSize: 12, fill: '#6b7280' }}
                    />
                    <YAxis 
                      axisLine={false}
                      tickLine={false}
                      tick={{ fontSize: 12, fill: '#6b7280' }}
                    />
                    <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
                    <Tooltip content={<CustomTooltip />} />
                    <Area
                      type="monotone"
                      dataKey="activities"
                      stroke="#111827"
                      strokeWidth={2}
                      fillOpacity={1}
                      fill="url(#colorActivities)"
                      dot={{ fill: '#111827', strokeWidth: 2, r: 4 }}
                      activeDot={{ r: 6, stroke: '#111827', strokeWidth: 2, fill: '#fff' }}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </motion.div>
            </motion.div>

            {/* Activity Distribution */}
            <motion.div
              className="border-b border-gray-100 pb-6"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-medium text-gray-900">Activity Distribution</h3>
                <div className="text-xs text-gray-500">This month</div>
              </div>
              <div className="flex items-center gap-8">
                <div className="h-48 w-48">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={activityDistribution}
                        cx="50%"
                        cy="50%"
                        innerRadius={40}
                        outerRadius={80}
                        paddingAngle={2}
                        dataKey="value"
                      >
                        {activityDistribution.map((entry, index) => (
                          <Cell 
                            key={`cell-${index}`} 
                            fill={entry.color}
                            stroke="#fff"
                            strokeWidth={2}
                          />
                        ))}
                      </Pie>
                      <Tooltip content={<PieTooltip />} />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                <div className="space-y-3">
                  {activityDistribution.map((item, index) => (
                    <motion.div 
                      key={item.name} 
                      className="flex items-center gap-3 p-2 rounded-lg cursor-pointer transition-all duration-200"
                      whileHover={{ backgroundColor: '#f9fafb', x: 4 }}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.1 }}
                    >
                      <motion.div 
                        className="w-3 h-3 rounded-full" 
                        style={{ backgroundColor: item.color }}
                        whileHover={{ scale: 1.2 }}
                      ></motion.div>
                      <span className="text-sm text-gray-600 flex-1">{item.name}</span>
                      <span className="text-sm font-medium text-gray-900">{item.value}%</span>
                    </motion.div>
                  ))}
                </div>
              </div>
            </motion.div>
          </div>

          {/* Development Progress */}
          {activeChild && (
            <motion.div
              className="border-b border-gray-100 pb-6 mb-8"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.5 }}
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-medium text-gray-900">Development Overview</h3>
                <div className="text-xs text-gray-500">Current progress levels</div>
              </div>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={developmentalData} layout="horizontal">
                    <XAxis 
                      type="number" 
                      domain={[0, 100]} 
                      axisLine={false} 
                      tickLine={false} 
                      tick={{ fontSize: 12, fill: '#6b7280' }} 
                    />
                    <YAxis 
                      type="category" 
                      dataKey="area" 
                      axisLine={false} 
                      tickLine={false} 
                      tick={{ fontSize: 12, fill: '#6b7280' }} 
                      width={80} 
                    />
                    <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
                    <Tooltip content={<BarTooltip />} />
                    <Bar 
                      dataKey="progress" 
                      fill="#111827" 
                      radius={[0, 4, 4, 0]}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </motion.div>
          )}

          {/* Quick Actions */}
          <motion.div
            className="border-b border-gray-100 pb-6 mb-8"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.6 }}
          >
            <h3 className="text-lg font-medium text-gray-900 mb-4">Quick Actions</h3>
            <div className="grid grid-cols-3 gap-4">
              <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                <Link
                  to="/activity-builder"
                  className="flex items-center gap-3 p-4 hover:bg-gray-50 transition-all duration-200 rounded-lg group"
                >
                  <motion.div 
                    className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center group-hover:bg-blue-100 transition-colors"
                    whileHover={{ rotate: 5 }}
                  >
                    <User className="w-5 h-5 text-gray-600 group-hover:text-blue-600 transition-colors" />
                  </motion.div>
                  <div>
                    <p className="font-medium text-gray-900 group-hover:text-blue-900 transition-colors">Start Parent Guide</p>
                    <p className="text-sm text-gray-500">Begin guided learning</p>
                  </div>
                  <ArrowRight className="w-4 h-4 text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity ml-auto" />
                </Link>
              </motion.div>
              
              <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                <Link
                  to="/learning-stories"
                  className="flex items-center gap-3 p-4 hover:bg-gray-50 transition-all duration-200 rounded-lg group"
                >
                  <motion.div 
                    className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center group-hover:bg-green-100 transition-colors"
                    whileHover={{ rotate: 5 }}
                  >
                    <Camera className="w-5 h-5 text-gray-600 group-hover:text-green-600 transition-colors" />
                  </motion.div>
                  <div>
                    <p className="font-medium text-gray-900 group-hover:text-green-900 transition-colors">Capture Moment</p>
                    <p className="text-sm text-gray-500">Document learning</p>
                  </div>
                  <ArrowRight className="w-4 h-4 text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity ml-auto" />
                </Link>
              </motion.div>
              
              <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                <Link
                  to="/therapy"
                  className="flex items-center gap-3 p-4 hover:bg-gray-50 transition-all duration-200 rounded-lg group"
                >
                  <motion.div 
                    className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center group-hover:bg-purple-100 transition-colors"
                    whileHover={{ rotate: 5 }}
                  >
                    <Target className="w-5 h-5 text-gray-600 group-hover:text-purple-600 transition-colors" />
                  </motion.div>
                  <div>
                    <p className="font-medium text-gray-900 group-hover:text-purple-900 transition-colors">Therapy Session</p>
                    <p className="text-sm text-gray-500">Start session</p>
                  </div>
                  <ArrowRight className="w-4 h-4 text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity ml-auto" />
                </Link>
              </motion.div>
            </div>
          </motion.div>

          {/* Recent Activities */}
          <motion.div
            className="border-b border-gray-100 pb-6 mb-8"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.7 }}
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-medium text-gray-900">Recommended Activities</h3>
              <Link 
                to="/activity-builder"
                className="text-sm text-gray-500 hover:text-gray-700 flex items-center gap-1"
              >
                View All <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
            
            <div className="space-y-3">
              {todaysActivities.slice(0, 3).map((activity, index) => (
                <motion.div 
                  key={activity.id} 
                  className="flex items-center justify-between py-3 px-4 rounded-lg hover:bg-gray-50 transition-all duration-200 group cursor-pointer"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                  whileHover={{ x: 4 }}
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h4 className="font-medium text-gray-900 group-hover:text-gray-700 transition-colors">{activity.title}</h4>
                      <div className="flex gap-1">
                        {activity.methodologies.slice(0, 2).map((method: string) => (
                          <motion.span
                            key={method}
                            className="px-2 py-1 text-xs bg-gray-100 text-gray-600 rounded-full capitalize"
                            whileHover={{ scale: 1.05 }}
                          >
                            {method}
                          </motion.span>
                        ))}
                      </div>
                    </div>
                    <div className="flex items-center gap-4 text-sm text-gray-500">
                      <div className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        <span>{activity.duration} min</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Target className="w-3 h-3" />
                        <span>Level {activity.difficulty}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Star className="w-3 h-3 text-yellow-500" />
                        {activity.rating}
                      </div>
                    </div>
                  </div>
                  <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                    <Link
                      to="/activity-builder"
                      className="px-4 py-2 text-sm bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition-colors flex items-center gap-2"
                    >
                      Start
                      <ArrowRight className="w-3 h-3" />
                    </Link>
                  </motion.div>
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* Recent Learning Stories */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.8 }}
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-medium text-gray-900">Recent Learning Stories</h3>
              <Link 
                to="/learning-stories"
                className="text-sm text-gray-500 hover:text-gray-700 flex items-center gap-1"
              >
                View All <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
            
            <div className="space-y-3">
              {recentStories.length > 0 ? (
                recentStories.map((story, index) => (
                  <motion.div 
                    key={story.id} 
                    className="flex items-start gap-4 py-3 px-4 rounded-lg hover:bg-gray-50 transition-all duration-200 group cursor-pointer"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    whileHover={{ x: 4 }}
                  >
                    {story.media.photos.length > 0 && (
                      <motion.img 
                        src={story.media.photos[0]} 
                        alt={story.title}
                        className="w-12 h-12 rounded-lg object-cover"
                        whileHover={{ scale: 1.1 }}
                        transition={{ type: "spring", stiffness: 300 }}
                      />
                    )}
                    <div className="flex-1">
                      <h4 className="font-medium text-gray-900 mb-1 group-hover:text-gray-700 transition-colors">{story.title}</h4>
                      <p className="text-sm text-gray-600 mb-2 line-clamp-2">{story.description}</p>
                      <div className="flex items-center gap-4 text-xs text-gray-500">
                        <span>{new Date(story.date).toLocaleDateString()}</span>
                        <motion.div 
                          className="flex items-center gap-1"
                          whileHover={{ scale: 1.1 }}
                        >
                          <Heart className="w-3 h-3 text-red-500" />
                          {story.reactions.hearts}
                        </motion.div>
                      </div>
                    </div>
                    <ArrowRight className="w-4 h-4 text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity" />
                  </motion.div>
                ))
              ) : (
                <motion.div 
                  className="text-center py-8"
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.5 }}
                >
                  <motion.div
                    animate={{ 
                      y: [0, -10, 0],
                    }}
                    transition={{ 
                      duration: 2,
                      repeat: Infinity,
                      ease: "easeInOut"
                    }}
                  >
                    <BookOpen className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                  </motion.div>
                  <h4 className="text-lg font-medium text-gray-900 mb-2">No Learning Stories Yet</h4>
                  <p className="text-gray-600 mb-4">Start documenting your child's learning journey</p>
                  <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                    <Link
                      to="/learning-stories"
                      className="inline-flex items-center gap-2 bg-gray-900 text-white px-4 py-2 rounded-lg hover:bg-gray-800 transition-colors"
                    >
                      <Camera className="w-4 h-4" />
                      Create First Story
                    </Link>
                  </motion.div>
                </motion.div>
              )}
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;