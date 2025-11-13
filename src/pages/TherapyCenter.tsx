import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Mic, 
  Volume2, 
  Play, 
  Pause, 
  RotateCcw, 
  Target, 
  Brain, 
  Heart, 
  TrendingUp,
  Calendar,
  Clock,
  Star,
  Award,
  Settings,
  Download,
  Share2,
  Plus,
  Eye,
  Headphones,
  Hand,
  Zap,
  Activity,
  BarChart3,
  CheckCircle,
  AlertCircle,
  Sparkles,
  Camera,
  FileText,
  Users
} from 'lucide-react';
import { useChildStore } from '../store/childStore';
import { useTherapyStore } from '../store/therapyStore';
import TherapySessionCreator from '../components/TherapySessionCreator';
import SpeechAssessmentTool from '../components/SpeechAssessmentTool';
import OTAssessmentTool from '../components/OTAssessmentTool';
import TherapyProgressChart from '../components/TherapyProgressChart';
import toast from 'react-hot-toast';

const TherapyCenter = () => {
  const { activeChild } = useChildStore();
  const { 
    sessions, 
    speechGoals, 
    otGoals, 
    assessments,
    getSessionsForChild,
    getProgressData,
    fetchSessions,
    fetchSpeechGoals,
    fetchOTGoals
  } = useTherapyStore();
  
  const [activeTab, setActiveTab] = useState<'overview' | 'speech' | 'ot' | 'sessions' | 'assessments'>('overview');
  const [showSessionCreator, setShowSessionCreator] = useState(false);
  const [showSpeechAssessment, setShowSpeechAssessment] = useState(false);
  const [showOTAssessment, setShowOTAssessment] = useState(false);
  const [selectedSession, setSelectedSession] = useState(null);
  const [progressData, setProgressData] = useState<{ speech: number; ot: number } | null>(null);

  // Fetch data when activeChild changes
  useEffect(() => {
    if (activeChild) {
      fetchSessions(activeChild.id);
      fetchSpeechGoals(activeChild.id);
      fetchOTGoals(activeChild.id);
      getProgressData(activeChild.id).then(setProgressData);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeChild?.id]);

  const childSessions = activeChild ? getSessionsForChild(activeChild.id) : [];
  const childSpeechGoals = activeChild ? speechGoals.filter(g => g.childId === activeChild.id) : [];
  const childOTGoals = activeChild ? otGoals.filter(g => g.childId === activeChild.id) : [];

  const therapyAreas = [
    {
      id: 'speech',
      title: 'Speech Therapy',
      icon: <Mic className="w-8 h-8" />,
      color: 'from-blue-500 to-blue-600',
      description: 'Articulation, language, and communication skills',
      goals: childSpeechGoals.length,
      progress: progressData?.speech || 0,
      sessions: childSessions.filter(s => s.type === 'speech').length
    },
    {
      id: 'ot',
      title: 'Occupational Therapy',
      icon: <Hand className="w-8 h-8" />,
      color: 'from-green-500 to-green-600',
      description: 'Fine motor, sensory, and daily living skills',
      goals: childOTGoals.length,
      progress: progressData?.ot || 0,
      sessions: childSessions.filter(s => s.type === 'ot').length
    }
  ];

  const quickActions = [
    {
      title: 'Start Speech Session',
      description: 'Begin guided speech therapy',
      icon: <Mic className="w-6 h-6" />,
      color: 'from-blue-500 to-blue-600',
      action: () => setShowSessionCreator(true)
    },
    {
      title: 'OT Assessment',
      description: 'Evaluate motor skills',
      icon: <Target className="w-6 h-6" />,
      color: 'from-green-500 to-green-600',
      action: () => setShowOTAssessment(true)
    },
    {
      title: 'Progress Review',
      description: 'View detailed analytics',
      icon: <BarChart3 className="w-6 h-6" />,
      color: 'from-purple-500 to-purple-600',
      action: () => setActiveTab('assessments')
    },
    {
      title: 'Goal Setting',
      description: 'Update therapy goals',
      icon: <Target className="w-6 h-6" />,
      color: 'from-orange-500 to-orange-600',
      action: () => toast.success('Goal setting opened')
    }
  ];

  const recentSessions = childSessions.slice(0, 3);

  const renderOverview = () => (
    <div className="space-y-8">
      {/* Therapy Areas Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {therapyAreas.map((area) => (
          <motion.div
            key={area.id}
            className="bg-white rounded-2xl p-8 shadow-sm border border-gray-100"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            whileHover={{ y: -2 }}
          >
            <div className="flex items-start justify-between mb-6">
              <div className={`w-16 h-16 bg-gradient-to-br ${area.color} rounded-2xl flex items-center justify-center text-white`}>
                {area.icon}
              </div>
              <button
                onClick={() => setActiveTab(area.id as any)}
                className="text-blue-600 hover:text-blue-700 font-medium"
              >
                View Details
              </button>
            </div>
            
            <h3 className="text-xl font-bold text-gray-900 mb-2">{area.title}</h3>
            <p className="text-gray-600 mb-6">{area.description}</p>
            
            <div className="grid grid-cols-3 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-gray-900">{area.goals}</div>
                <div className="text-sm text-gray-600">Active Goals</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-gray-900">{area.progress}%</div>
                <div className="text-sm text-gray-600">Progress</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-gray-900">{area.sessions}</div>
                <div className="text-sm text-gray-600">Sessions</div>
              </div>
            </div>
            
            <div className="mt-6">
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm font-medium text-gray-700">Overall Progress</span>
                <span className="text-sm text-gray-600">{area.progress}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-3">
                <motion.div
                  className={`h-3 rounded-full bg-gradient-to-r ${area.color}`}
                  initial={{ width: 0 }}
                  animate={{ width: `${area.progress}%` }}
                  transition={{ duration: 1, delay: 0.5 }}
                />
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Quick Actions */}
      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-6">Quick Actions</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {quickActions.map((action, index) => (
            <motion.button
              key={action.title}
              onClick={action.action}
              className="bg-white rounded-xl p-6 shadow-sm hover:shadow-lg transition-all duration-300 border border-gray-100 text-left"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              whileHover={{ y: -2 }}
              whileTap={{ scale: 0.98 }}
            >
              <div className={`w-12 h-12 bg-gradient-to-br ${action.color} rounded-lg flex items-center justify-center text-white mb-4`}>
                {action.icon}
              </div>
              <h3 className="font-semibold text-gray-900 mb-1">{action.title}</h3>
              <p className="text-sm text-gray-600">{action.description}</p>
            </motion.button>
          ))}
        </div>
      </div>

      {/* Recent Sessions */}
      <div>
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-gray-900">Recent Sessions</h2>
          <button
            onClick={() => setActiveTab('sessions')}
            className="text-blue-600 hover:text-blue-700 font-medium flex items-center gap-1"
          >
            View All <Eye className="w-4 h-4" />
          </button>
        </div>
        
        <div className="space-y-4">
          {recentSessions.map((session, index) => (
            <motion.div
              key={session.id}
              className="bg-white rounded-xl p-6 shadow-sm border border-gray-100"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
            >
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-4">
                  <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
                    session.type === 'speech' ? 'bg-blue-100 text-blue-600' : 'bg-green-100 text-green-600'
                  }`}>
                    {session.type === 'speech' ? <Mic className="w-6 h-6" /> : <Hand className="w-6 h-6" />}
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">{session.title}</h3>
                    <p className="text-gray-600 text-sm">{session.description}</p>
                    <div className="flex items-center gap-4 mt-2 text-sm text-gray-500">
                      <span>{new Date(session.date).toLocaleDateString()}</span>
                      <span>{session.duration} minutes</span>
                      <span className="capitalize">{session.type} therapy</span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                    session.status === 'completed' 
                      ? 'bg-green-100 text-green-700' 
                      : session.status === 'in-progress'
                        ? 'bg-blue-100 text-blue-700'
                        : 'bg-gray-100 text-gray-700'
                  }`}>
                    {session.status}
                  </span>
                </div>
              </div>
            </motion.div>
          ))}
          
          {recentSessions.length === 0 && (
            <div className="text-center py-8">
              <Sparkles className="w-12 h-12 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">No sessions yet</h3>
              <p className="text-gray-600 mb-4">Start your first therapy session to begin tracking progress</p>
              <button
                onClick={() => setShowSessionCreator(true)}
                className="bg-gradient-to-r from-blue-600 to-green-600 text-white px-6 py-3 rounded-xl font-semibold hover:shadow-lg transition-all duration-300"
              >
                Start First Session
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );

  const renderSpeechTherapy = () => (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Speech Therapy</h2>
          <p className="text-gray-600">Articulation, language development, and communication skills</p>
        </div>
        <button
          onClick={() => setShowSpeechAssessment(true)}
          className="bg-blue-600 text-white px-6 py-3 rounded-xl font-semibold hover:bg-blue-700 transition-colors flex items-center gap-2"
        >
          <Plus className="w-5 h-5" />
          New Assessment
        </button>
      </div>

      {/* Speech Goals */}
      <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
        <h3 className="text-lg font-bold text-gray-900 mb-4">Current Speech Goals</h3>
        <div className="space-y-4">
          {childSpeechGoals.map((goal) => (
            <div key={goal.id} className="flex items-center justify-between p-4 bg-blue-50 rounded-lg">
              <div className="flex items-center gap-3">
                <Target className="w-5 h-5 text-blue-600" />
                <div>
                  <span className="font-medium text-gray-900">{goal.title}</span>
                  <p className="text-xs text-gray-600 mt-1">{goal.description}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-24 bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-blue-600 h-2 rounded-full transition-all duration-500" 
                    style={{ 
                      width: `${goal.targetLevel > 0 ? Math.min((goal.currentLevel / goal.targetLevel) * 100, 100) : 0}%` 
                    }} 
                  />
                </div>
                <span className="text-sm text-gray-600">
                  {goal.targetLevel > 0 ? Math.round((goal.currentLevel / goal.targetLevel) * 100) : 0}%
                </span>
              </div>
            </div>
          ))}
          {childSpeechGoals.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              No speech goals set yet
            </div>
          )}
        </div>
      </div>

      {/* Speech Activities */}
      <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
        <h3 className="text-lg font-bold text-gray-900 mb-4">Recommended Speech Activities</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[
            {
              title: 'Articulation Practice',
              description: 'Target /r/ sounds with fun games',
              duration: '15 min',
              difficulty: 'Medium',
              icon: <Mic className="w-6 h-6" />
            },
            {
              title: 'Vocabulary Building',
              description: 'Learn new words through stories',
              duration: '20 min',
              difficulty: 'Easy',
              icon: <Brain className="w-6 h-6" />
            },
            {
              title: 'Story Retelling',
              description: 'Practice narrative skills',
              duration: '25 min',
              difficulty: 'Hard',
              icon: <FileText className="w-6 h-6" />
            },
            {
              title: 'Social Communication',
              description: 'Turn-taking and conversation',
              duration: '30 min',
              difficulty: 'Medium',
              icon: <Users className="w-6 h-6" />
            }
          ].map((activity, index) => (
            <motion.div
              key={activity.title}
              className="p-4 border border-gray-200 rounded-lg hover:border-blue-300 hover:bg-blue-50 transition-all duration-300 cursor-pointer"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center text-blue-600">
                  {activity.icon}
                </div>
                <div className="flex-1">
                  <h4 className="font-semibold text-gray-900 mb-1">{activity.title}</h4>
                  <p className="text-gray-600 text-sm mb-2">{activity.description}</p>
                  <div className="flex items-center gap-4 text-xs text-gray-500">
                    <span>{activity.duration}</span>
                    <span>{activity.difficulty}</span>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );

  const renderOccupationalTherapy = () => (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Occupational Therapy</h2>
          <p className="text-gray-600">Fine motor skills, sensory processing, and daily living activities</p>
        </div>
        <button
          onClick={() => setShowOTAssessment(true)}
          className="bg-green-600 text-white px-6 py-3 rounded-xl font-semibold hover:bg-green-700 transition-colors flex items-center gap-2"
        >
          <Plus className="w-5 h-5" />
          New Assessment
        </button>
      </div>

      {/* OT Goals */}
      <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
        <h3 className="text-lg font-bold text-gray-900 mb-4">Current OT Goals</h3>
        <div className="space-y-4">
          {childOTGoals.map((goal) => (
            <div key={goal.id} className="flex items-center justify-between p-4 bg-green-50 rounded-lg">
              <div className="flex items-center gap-3">
                <Hand className="w-5 h-5 text-green-600" />
                <div>
                  <span className="font-medium text-gray-900">{goal.title}</span>
                  <p className="text-xs text-gray-600 mt-1">{goal.description}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-24 bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-green-600 h-2 rounded-full transition-all duration-500" 
                    style={{ 
                      width: `${goal.targetLevel > 0 ? Math.min((goal.currentLevel / goal.targetLevel) * 100, 100) : 0}%` 
                    }} 
                  />
                </div>
                <span className="text-sm text-gray-600">
                  {goal.targetLevel > 0 ? Math.round((goal.currentLevel / goal.targetLevel) * 100) : 0}%
                </span>
              </div>
            </div>
          ))}
          {childOTGoals.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              No OT goals set yet
            </div>
          )}
        </div>
      </div>

      {/* Sensory Profile */}
      <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
        <h3 className="text-lg font-bold text-gray-900 mb-4">Sensory Profile</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[
            { area: 'Tactile', level: 'Seeking', color: 'blue' },
            { area: 'Vestibular', level: 'Typical', color: 'green' },
            { area: 'Proprioceptive', level: 'Avoiding', color: 'orange' },
            { area: 'Auditory', level: 'Sensitive', color: 'red' },
            { area: 'Visual', level: 'Typical', color: 'green' },
            { area: 'Oral', level: 'Seeking', color: 'blue' }
          ].map((item) => (
            <div key={item.area} className="text-center">
              <div className={`w-16 h-16 mx-auto mb-3 rounded-full bg-${item.color}-100 flex items-center justify-center`}>
                <Activity className={`w-8 h-8 text-${item.color}-600`} />
              </div>
              <h4 className="font-semibold text-gray-900">{item.area}</h4>
              <p className={`text-sm text-${item.color}-600 font-medium`}>{item.level}</p>
            </div>
          ))}
        </div>
      </div>

      {/* OT Activities */}
      <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
        <h3 className="text-lg font-bold text-gray-900 mb-4">Recommended OT Activities</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[
            {
              title: 'Fine Motor Practice',
              description: 'Pincer grasp and manipulation',
              duration: '15 min',
              difficulty: 'Medium',
              icon: <Hand className="w-6 h-6" />
            },
            {
              title: 'Sensory Bin Play',
              description: 'Tactile exploration and regulation',
              duration: '20 min',
              difficulty: 'Easy',
              icon: <Heart className="w-6 h-6" />
            },
            {
              title: 'Bilateral Coordination',
              description: 'Two-handed activities',
              duration: '25 min',
              difficulty: 'Hard',
              icon: <Zap className="w-6 h-6" />
            },
            {
              title: 'Visual Motor Skills',
              description: 'Hand-eye coordination tasks',
              duration: '30 min',
              difficulty: 'Medium',
              icon: <Eye className="w-6 h-6" />
            }
          ].map((activity, index) => (
            <motion.div
              key={activity.title}
              className="p-4 border border-gray-200 rounded-lg hover:border-green-300 hover:bg-green-50 transition-all duration-300 cursor-pointer"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center text-green-600">
                  {activity.icon}
                </div>
                <div className="flex-1">
                  <h4 className="font-semibold text-gray-900 mb-1">{activity.title}</h4>
                  <p className="text-gray-600 text-sm mb-2">{activity.description}</p>
                  <div className="flex items-center gap-4 text-xs text-gray-500">
                    <span>{activity.duration}</span>
                    <span>{activity.difficulty}</span>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );

  if (!activeChild) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center py-16">
            <Heart className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-gray-900 mb-2">No Child Selected</h2>
            <p className="text-gray-600">
              Please select a child profile to access therapy features.
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
              <h1 className="text-3xl font-bold text-gray-900 mb-2">Therapy Center</h1>
              <p className="text-gray-600">
                Integrated speech and occupational therapy for {activeChild.name}
              </p>
            </div>
            
            <div className="flex items-center gap-3">
              <button
                onClick={() => setShowSessionCreator(true)}
                className="bg-gradient-to-r from-blue-600 to-green-600 text-white px-6 py-3 rounded-xl font-semibold hover:shadow-lg transition-all duration-300 flex items-center gap-2"
              >
                <Plus className="w-5 h-5" />
                New Session
              </button>
            </div>
          </div>
        </motion.div>

        {/* Tab Navigation */}
        <motion.div
          className="mb-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
        >
          <div className="flex space-x-1 bg-white rounded-xl p-1 shadow-sm border border-gray-100">
            {[
              { id: 'overview', label: 'Overview', icon: <BarChart3 className="w-4 h-4" /> },
              { id: 'speech', label: 'Speech Therapy', icon: <Mic className="w-4 h-4" /> },
              { id: 'ot', label: 'Occupational Therapy', icon: <Hand className="w-4 h-4" /> },
              { id: 'sessions', label: 'Sessions', icon: <Calendar className="w-4 h-4" /> },
              { id: 'assessments', label: 'Assessments', icon: <FileText className="w-4 h-4" /> }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center gap-2 px-4 py-3 rounded-lg font-medium transition-all duration-300 ${
                  activeTab === tab.id
                    ? 'bg-blue-100 text-blue-700'
                    : 'text-gray-600 hover:text-blue-600 hover:bg-blue-50'
                }`}
              >
                {tab.icon}
                <span className="hidden sm:inline">{tab.label}</span>
              </button>
            ))}
          </div>
        </motion.div>

        {/* Tab Content */}
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          {activeTab === 'overview' && renderOverview()}
          {activeTab === 'speech' && renderSpeechTherapy()}
          {activeTab === 'ot' && renderOccupationalTherapy()}
          {activeTab === 'sessions' && (
            <div className="text-center py-16">
              <Calendar className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Sessions Management</h3>
              <p className="text-gray-600">Detailed session management coming soon!</p>
            </div>
          )}
          {activeTab === 'assessments' && (
            <div className="text-center py-16">
              <FileText className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Assessment Tools</h3>
              <p className="text-gray-600">Comprehensive assessment tools coming soon!</p>
            </div>
          )}
        </motion.div>

        {/* Modals */}
        <AnimatePresence>
          {showSessionCreator && (
            <TherapySessionCreator
              onClose={() => setShowSessionCreator(false)}
              onSave={() => {
                setShowSessionCreator(false);
                toast.success('Therapy session created successfully!');
              }}
            />
          )}
          
          {showSpeechAssessment && (
            <SpeechAssessmentTool
              onClose={() => setShowSpeechAssessment(false)}
              onSave={() => {
                setShowSpeechAssessment(false);
                toast.success('Speech assessment completed!');
              }}
            />
          )}
          
          {showOTAssessment && (
            <OTAssessmentTool
              onClose={() => setShowOTAssessment(false)}
              onSave={() => {
                setShowOTAssessment(false);
                toast.success('OT assessment completed!');
              }}
            />
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default TherapyCenter;