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
  Music,
  MoreHorizontal,
  ChevronUp,
  ChevronDown,
  CheckCircle,
  Clock,
  Zap
} from 'lucide-react';
import { 
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  ComposedChart,
  Area,
  ScatterChart,
  Scatter,
  ReferenceLine
} from 'recharts';
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
    { 
      key: 'cognitive', 
      label: 'Cognitive', 
      icon: Brain, 
      color: '#3b82f6',
      progress: activeChild?.developmentalProfile.cognitive || 0,
      target: 85,
      description: 'Problem solving & memory'
    },
    { 
      key: 'language', 
      label: 'Language', 
      icon: Music, 
      color: '#10b981',
      progress: activeChild?.developmentalProfile.language || 0,
      target: 90,
      description: 'Communication & vocabulary'
    },
    { 
      key: 'social', 
      label: 'Social', 
      icon: Users, 
      color: '#8b5cf6',
      progress: activeChild?.developmentalProfile.social || 0,
      target: 80,
      description: 'Interaction & cooperation'
    },
    { 
      key: 'physical', 
      label: 'Physical', 
      icon: Target, 
      color: '#f59e0b',
      progress: activeChild?.developmentalProfile.physical || 0,
      target: 88,
      description: 'Motor skills & coordination'
    },
    { 
      key: 'creative', 
      label: 'Creative', 
      icon: Palette, 
      color: '#ef4444',
      progress: activeChild?.developmentalProfile.creative || 0,
      target: 82,
      description: 'Art & imagination'
    }
  ];

  // Sample data for charts
  const progressData = [
    { month: 'Jan', cognitive: 65, language: 70, social: 60, physical: 75, creative: 55 },
    { month: 'Feb', cognitive: 68, language: 72, social: 62, physical: 77, creative: 58 },
    { month: 'Mar', cognitive: 72, language: 75, social: 65, physical: 80, creative: 62 },
    { month: 'Apr', cognitive: 75, language: 78, social: 68, physical: 82, creative: 65 },
    { month: 'May', cognitive: 78, language: 82, social: 70, physical: 85, creative: 68 },
    { month: 'Jun', cognitive: 82, language: 85, social: 73, physical: 88, creative: 72 }
  ];

  const activityData = [
    { name: 'Cognitive', value: 35, color: '#3b82f6' },
    { name: 'Language', value: 25, color: '#10b981' },
    { name: 'Social', value: 20, color: '#8b5cf6' },
    { name: 'Physical', value: 20, color: '#f59e0b' }
  ];

  // Radar chart data for development overview
  const radarData = developmentalAreas.map(area => ({
    area: area.label,
    current: area.progress,
    target: area.target,
    fullMark: 100
  }));

  // Scatter plot data for skill correlation
  const scatterData = [
    { x: 75, y: 82, name: 'Reading', size: 120 },
    { x: 68, y: 78, name: 'Writing', size: 100 },
    { x: 85, y: 88, name: 'Math', size: 140 },
    { x: 72, y: 75, name: 'Science', size: 110 },
    { x: 90, y: 85, name: 'Art', size: 95 },
    { x: 78, y: 80, name: 'Music', size: 105 },
    { x: 82, y: 84, name: 'Sports', size: 130 }
  ];

  // Composed chart data for progress vs engagement
  const composedData = [
    { month: 'Jan', progress: 65, engagement: 70, activities: 12 },
    { month: 'Feb', progress: 68, engagement: 75, activities: 15 },
    { month: 'Mar', progress: 72, engagement: 72, activities: 18 },
    { month: 'Apr', progress: 75, engagement: 80, activities: 20 },
    { month: 'May', progress: 78, engagement: 85, activities: 22 },
    { month: 'Jun', progress: 82, engagement: 88, activities: 25 }
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
      <div className="min-h-screen bg-gray-50">
        <div className="w-full px-4">
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
    <div className="min-h-screen bg-white">
      <div className="w-full">
        {/* Header Section */}
        <motion.div
          className="py-4 border-b border-gray-100"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <div className="flex items-center justify-between px-4">
            <div>
              <h1 className="text-2xl font-semibold text-gray-900">
                {activeChild ? `${activeChild.name}'s Profile` : 'Child Profiles'}
              </h1>
              <p className="text-sm text-gray-500 mt-1">
                {activeChild ? 'Comprehensive learning and development overview' : 'Manage and track each child\'s unique learning journey'}
              </p>
            </div>
            <motion.button
              onClick={handleCreateProfile}
              className="px-4 py-2 bg-gray-900 text-white hover:bg-gray-800 transition-colors flex items-center gap-2"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <Plus className="w-4 h-4" />
              Add Profile
            </motion.button>
          </div>
        </motion.div>

        {/* Child Selector */}
        {children.length > 1 && (
          <motion.div
            className="py-3 border-b border-gray-100"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
          >
            <div className="flex gap-2 overflow-x-auto px-4">
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

        {activeChild && (
          <div>
            {/* Enhanced Grid Layout with Better Separations */}
            <div className="grid grid-cols-12 h-full">
              
              {/* Profile Header - Full Width with Grid Lines */}
              <motion.div
                className="col-span-12 border-b border-gray-200 p-4 bg-gray-50/30"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.1 }}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="relative">
                      {activeChild.avatar ? (
                        <img 
                          src={activeChild.avatar} 
                          alt={activeChild.name}
                          className="w-16 h-16 object-cover"
                        />
                      ) : (
                        <div className="w-16 h-16 bg-gray-100 flex items-center justify-center">
                          <User className="w-8 h-8 text-gray-400" />
                        </div>
                      )}
                      <button className="absolute -bottom-1 -right-1 w-6 h-6 bg-gray-900 text-white flex items-center justify-center hover:bg-gray-800 transition-colors">
                        <Camera className="w-3 h-3" />
                      </button>
                    </div>
                    
                    <div>
                      <h2 className="text-xl font-semibold text-gray-900">{activeChild.name}</h2>
                      <div className="flex items-center gap-4 text-sm text-gray-500 mt-1">
                        <div className="flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          <span>{activeChild.age} years old</span>
                        </div>
                        <div className="w-px h-4 bg-gray-300"></div>
                        <div className="flex items-center gap-1">
                          <BookOpen className="w-3 h-3" />
                          <span className="capitalize">{activeChild.preferences.learningStyle} learner</span>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleEditProfile(activeChild)}
                      className="p-2 text-gray-400 hover:text-gray-600 transition-colors hover:bg-white"
                    >
                      <Edit3 className="w-4 h-4" />
                    </button>
                    <div className="w-px h-6 bg-gray-300"></div>
                    <button
                      onClick={() => handleDeleteProfile(activeChild.id)}
                      className="p-2 text-gray-400 hover:text-red-600 transition-colors hover:bg-white"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                    <div className="w-px h-6 bg-gray-300"></div>
                    <MoreHorizontal className="w-4 h-4 text-gray-400" />
                  </div>
                </div>
              </motion.div>

              {/* Key Metrics - 4 columns with Grid Separators */}
              <motion.div
                className="col-span-12 grid grid-cols-4"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.2 }}
              >
                <div className="text-center p-4 border-r border-b border-gray-200 bg-gray-50/30">
                  <div className="text-2xl font-semibold text-gray-900">{childStories.length}</div>
                  <div className="text-sm text-gray-500">Learning Stories</div>
                  <div className="flex items-center justify-center mt-1">
                    <ChevronUp className="w-4 h-4 text-green-500" />
                    <span className="text-xs text-green-500">+3</span>
                  </div>
                </div>
                <div className="text-center p-4 border-r border-b border-gray-200 bg-gray-50/30">
                  <div className="text-2xl font-semibold text-gray-900">24</div>
                  <div className="text-sm text-gray-500">Activities Done</div>
                  <div className="flex items-center justify-center mt-1">
                    <ChevronUp className="w-4 h-4 text-green-500" />
                    <span className="text-xs text-green-500">+5</span>
                  </div>
                </div>
                <div className="text-center p-4 border-r border-b border-gray-200 bg-gray-50/30">
                  <div className="text-2xl font-semibold text-gray-900">87%</div>
                  <div className="text-sm text-gray-500">Progress Rate</div>
                  <div className="flex items-center justify-center mt-1">
                    <ChevronUp className="w-4 h-4 text-green-500" />
                    <span className="text-xs text-green-500">+2%</span>
                  </div>
                </div>
                <div className="text-center p-4 border-b border-gray-200 bg-gray-50/30">
                  <div className="text-2xl font-semibold text-gray-900">12</div>
                  <div className="text-sm text-gray-500">Milestones</div>
                  <div className="flex items-center justify-center mt-1">
                    <ChevronUp className="w-4 h-4 text-green-500" />
                    <span className="text-xs text-green-500">+1</span>
                  </div>
                </div>
              </motion.div>

              {/* Development Radar Chart - 8 columns */}
              <motion.div
                className="col-span-8 border-r border-b border-gray-200 p-4 bg-gray-50/30"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.3 }}
              >
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-medium text-gray-900">Development Overview</h3>
                  <div className="text-xs text-gray-500">Current vs Target</div>
                </div>
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <RadarChart data={radarData}>
                      <PolarGrid stroke="#e5e7eb" />
                      <PolarAngleAxis 
                        dataKey="area" 
                        tick={{ fontSize: 12, fill: '#6b7280' }}
                      />
                      <PolarRadiusAxis 
                        domain={[0, 100]} 
                        tick={{ fontSize: 10, fill: '#9ca3af' }}
                        tickCount={5}
                      />
                      <Radar
                        name="Current"
                        dataKey="current"
                        stroke="#3b82f6"
                        fill="#3b82f6"
                        fillOpacity={0.2}
                        strokeWidth={2}
                      />
                      <Radar
                        name="Target"
                        dataKey="target"
                        stroke="#10b981"
                        fill="#10b981"
                        fillOpacity={0.1}
                        strokeWidth={2}
                        strokeDasharray="5 5"
                      />
                      <Tooltip 
                        contentStyle={{
                          backgroundColor: 'white',
                          border: '1px solid #e5e7eb',
                          borderRadius: '8px',
                          boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                        }}
                      />
                    </RadarChart>
                  </ResponsiveContainer>
                </div>
                <div className="flex justify-center gap-6 mt-4">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                    <span className="text-sm text-gray-600">Current Progress</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 border-2 border-green-500 rounded-full bg-green-100"></div>
                    <span className="text-sm text-gray-600">Target Goals</span>
                  </div>
                </div>
              </motion.div>

              {/* Skills Correlation Scatter Plot - 4 columns */}
              <motion.div
                className="col-span-4 border-b border-gray-200 p-4 bg-gray-50/30"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.4 }}
              >
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-medium text-gray-900">Skills Correlation</h3>
                  <div className="text-xs text-gray-500">Performance vs Interest</div>
                </div>
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <ScatterChart>
                      <XAxis 
                        type="number" 
                        dataKey="x" 
                        name="Performance"
                        domain={[60, 95]}
                        axisLine={false}
                        tickLine={false}
                        tick={{ fontSize: 10, fill: '#6b7280' }}
                      />
                      <YAxis 
                        type="number" 
                        dataKey="y" 
                        name="Interest"
                        domain={[70, 95]}
                        axisLine={false}
                        tickLine={false}
                        tick={{ fontSize: 10, fill: '#6b7280' }}
                      />
                      <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
                      <ReferenceLine x={80} stroke="#e5e7eb" strokeDasharray="2 2" />
                      <ReferenceLine y={80} stroke="#e5e7eb" strokeDasharray="2 2" />
                      <Tooltip 
                        cursor={{ strokeDasharray: '3 3' }}
                        content={({ active, payload }) => {
                          if (active && payload && payload.length) {
                            const data = payload[0].payload;
                            return (
                              <div className="bg-white p-3 border border-gray-200 rounded-lg shadow-lg">
                                <p className="text-sm font-medium text-gray-900">{data.name}</p>
                                <p className="text-xs text-gray-600">Performance: {data.x}%</p>
                                <p className="text-xs text-gray-600">Interest: {data.y}%</p>
                              </div>
                            );
                          }
                          return null;
                        }}
                      />
                      <Scatter 
                        data={scatterData} 
                        fill="#8b5cf6"
                        stroke="#7c3aed"
                        strokeWidth={2}
                      />
                    </ScatterChart>
                  </ResponsiveContainer>
                </div>
              </motion.div>

              {/* Progress vs Engagement Composed Chart - 6 columns */}
              <motion.div
                className="col-span-6 border-r border-b border-gray-200 p-4 bg-gray-50/30"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.5 }}
              >
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-medium text-gray-900">Progress & Engagement</h3>
                  <div className="text-xs text-gray-500">Combined metrics</div>
                </div>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <ComposedChart data={composedData}>
                      <XAxis 
                        dataKey="month" 
                        axisLine={false}
                        tickLine={false}
                        tick={{ fontSize: 12, fill: '#6b7280' }}
                      />
                      <YAxis 
                        yAxisId="left"
                        domain={[60, 100]}
                        axisLine={false}
                        tickLine={false}
                        tick={{ fontSize: 10, fill: '#6b7280' }}
                      />
                      <YAxis 
                        yAxisId="right"
                        orientation="right"
                        domain={[10, 30]}
                        axisLine={false}
                        tickLine={false}
                        tick={{ fontSize: 10, fill: '#6b7280' }}
                      />
                      <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
                      <Tooltip 
                        contentStyle={{
                          backgroundColor: 'white',
                          border: '1px solid #e5e7eb',
                          borderRadius: '8px',
                          boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                        }}
                      />
                      <Area
                        yAxisId="left"
                        type="monotone"
                        dataKey="engagement"
                        fill="#3b82f6"
                        fillOpacity={0.2}
                        stroke="#3b82f6"
                        strokeWidth={2}
                      />
                      <Line
                        yAxisId="left"
                        type="monotone"
                        dataKey="progress"
                        stroke="#10b981"
                        strokeWidth={3}
                        dot={{ fill: '#10b981', strokeWidth: 2, r: 4 }}
                      />
                      <Bar
                        yAxisId="right"
                        dataKey="activities"
                        fill="#f59e0b"
                        opacity={0.7}
                        radius={[2, 2, 0, 0]}
                      />
                    </ComposedChart>
                  </ResponsiveContainer>
                </div>
                <div className="flex justify-center gap-4 mt-4">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-blue-500 rounded-full opacity-50"></div>
                    <span className="text-xs text-gray-600">Engagement</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                    <span className="text-xs text-gray-600">Progress</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-yellow-500 rounded-sm"></div>
                    <span className="text-xs text-gray-600">Activities</span>
                  </div>
                </div>
              </motion.div>

              {/* Development Areas - 6 columns */}
              <motion.div
                className="col-span-6 border-b border-gray-200 p-4 bg-gray-50/30"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.6 }}
              >
                <h3 className="text-lg font-medium text-gray-900 mb-4">Development Areas</h3>
                <div className="space-y-0">
                  {developmentalAreas.map((area, index) => {
                    const Icon = area.icon;
                    const progressPercentage = Math.min((area.progress / area.target) * 100, 100);
                    
                    return (
                      <div key={area.key} className="flex items-center gap-4 p-3 border-b border-gray-100 bg-white">
                        <div 
                          className="w-8 h-8 flex items-center justify-center flex-shrink-0"
                          style={{ backgroundColor: `${area.color}15` }}
                        >
                          <Icon className="w-4 h-4" style={{ color: area.color }} />
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center justify-between mb-1">
                            <span className="font-medium text-gray-900 text-sm">{area.label}</span>
                            <span className="text-sm text-gray-600">{area.progress}%</span>
                          </div>
                          <div className="w-full bg-gray-200 h-1.5">
                            <motion.div
                              className="h-1.5"
                              style={{ backgroundColor: area.color }}
                              initial={{ width: 0 }}
                              animate={{ width: `${progressPercentage}%` }}
                              transition={{ duration: 0.8, delay: index * 0.1 }}
                            />
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </motion.div>

              {/* Learning Preferences - 3 columns */}
              <motion.div
                className="col-span-3 border-r border-b border-gray-200 p-4 bg-gray-50/30"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.7 }}
              >
                <h3 className="text-lg font-medium text-gray-900 mb-4">Preferences</h3>
                <div className="space-y-0">
                  <div className="p-3 border-b border-gray-100 bg-white">
                    <div className="text-sm text-gray-500 mb-1">Learning Style</div>
                    <div className="text-sm font-medium text-gray-900 capitalize">{activeChild.preferences.learningStyle}</div>
                  </div>
                  <div className="p-3 border-b border-gray-100 bg-white">
                    <div className="text-sm text-gray-500 mb-1">Energy Level</div>
                    <div className="text-sm font-medium text-gray-900 capitalize">{activeChild.preferences.energyLevel}</div>
                  </div>
                  <div className="p-3 bg-white">
                    <div className="text-sm text-gray-500 mb-1">Social Style</div>
                    <div className="text-sm font-medium text-gray-900 capitalize">{activeChild.preferences.socialPreference.replace('-', ' ')}</div>
                  </div>
                </div>
              </motion.div>

              {/* Interests - 3 columns */}
              <motion.div
                className="col-span-3 border-r border-b border-gray-200 p-4 bg-gray-50/30"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.8 }}
              >
                <h3 className="text-lg font-medium text-gray-900 mb-4">Interests</h3>
                <div className="flex flex-wrap gap-1">
                  {activeChild.interests.map((interest, index) => (
                    <span
                      key={interest}
                      className="px-3 py-2 bg-white border border-gray-200 text-gray-700 text-xs hover:bg-gray-50 transition-colors"
                    >
                      {interest}
                    </span>
                  ))}
                </div>
              </motion.div>

              {/* Academic Levels - 3 columns */}
              <motion.div
                className="col-span-3 border-b border-gray-200 p-4 bg-gray-50/30"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.9 }}
              >
                <h3 className="text-lg font-medium text-gray-900 mb-4">Academic Levels</h3>
                <div className="space-y-0">
                  <div className="flex justify-between items-center p-2 border-b border-gray-100 bg-white">
                    <span className="text-sm text-gray-600">Reading</span>
                    <span className="text-sm font-medium text-gray-900">Grade 2</span>
                  </div>
                  <div className="flex justify-between items-center p-2 border-b border-gray-100 bg-white">
                    <span className="text-sm text-gray-600">Math</span>
                    <span className="text-sm font-medium text-gray-900">Grade 1</span>
                  </div>
                  <div className="flex justify-between items-center p-2 bg-white">
                    <span className="text-sm text-gray-600">Writing</span>
                    <span className="text-sm font-medium text-gray-900">Grade 2</span>
                  </div>
                </div>
              </motion.div>

              {/* Goals - 6 columns */}
              <motion.div
                className="col-span-6 border-r border-b border-gray-200 p-4 bg-gray-50/30"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 1.0 }}
              >
                <h3 className="text-lg font-medium text-gray-900 mb-4">Current Goals</h3>
                <div className="grid grid-cols-2">
                  <div className="p-4 border-r border-gray-100 bg-white">
                    <h4 className="font-medium text-gray-900 mb-3 flex items-center gap-2">
                      <Target className="w-4 h-4 text-blue-600" />
                      Speech Goals
                    </h4>
                    <div className="space-y-2">
                      {activeChild.speechGoals.slice(0, 3).map((goal, index) => (
                        <div key={index} className="flex items-center gap-2">
                          <CheckCircle className="w-3 h-3 text-green-500 flex-shrink-0" />
                          <span className="text-sm text-gray-700">{goal}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                  
                  <div className="p-4 bg-white">
                    <h4 className="font-medium text-gray-900 mb-3 flex items-center gap-2">
                      <Heart className="w-4 h-4 text-green-600" />
                      OT Goals
                    </h4>
                    <div className="space-y-2">
                      {activeChild.otGoals.slice(0, 3).map((goal, index) => (
                        <div key={index} className="flex items-center gap-2">
                          <CheckCircle className="w-3 h-3 text-green-500 flex-shrink-0" />
                          <span className="text-sm text-gray-700">{goal}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </motion.div>

              {/* Sensory Needs - 3 columns */}
              <motion.div
                className="col-span-3 border-b border-gray-200 p-4 bg-gray-50/30"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 1.1 }}
              >
                <h3 className="text-lg font-medium text-gray-900 mb-4">Sensory Needs</h3>
                <div className="space-y-0">
                  {activeChild.sensoryNeeds.slice(0, 4).map((need, index) => (
                    <div key={index} className="flex items-center gap-2 p-2 border-b border-gray-100 bg-white last:border-b-0">
                      <Zap className="w-3 h-3 text-purple-500 flex-shrink-0" />
                      <span className="text-sm text-gray-700">{need}</span>
                    </div>
                  ))}
                </div>
              </motion.div>

              {/* Academic Levels - 3 columns */}
              <motion.div
                className="col-span-3 p-4 bg-gray-50/30"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 1.0 }}
              >
                <h3 className="text-lg font-medium text-gray-900 mb-4">Academic Levels</h3>
                <div className="space-y-0">
                  {Object.entries(activeChild.currentLevel).map(([subject, level], index, array) => {
                    const levels = ['Beginner', 'Developing', 'Proficient', 'Advanced', 'Expert'];
                    return (
                      <div key={subject} className={`flex items-center justify-between p-2 bg-white ${index < array.length - 1 ? 'border-b border-gray-100' : ''}`}>
                        <span className="text-sm text-gray-600 capitalize">{subject}</span>
                        <span className="text-sm font-medium text-gray-900">{levels[level - 1]}</span>
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