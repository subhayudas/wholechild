import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  X, 
  CheckCircle, 
  Camera, 
  Clock, 
  Target, 
  Users, 
  Star, 
  ArrowRight, 
  ArrowLeft,
  Eye,
  Heart,
  Lightbulb,
  AlertCircle,
  Play,
  Pause,
  RotateCcw,
  BookOpen,
  Palette,
  Music,
  Brain,
  User,
  Save,
  MessageCircle,
  Award,
  Timer,
  Sparkles,
  Volume2,
  VolumeX,
  Maximize2,
  Minimize2,
  HelpCircle,
  Mic,
  Video,
  FileText,
  Zap,
  Coffee,
  Sun,
  Moon,
  RefreshCw,
  Settings,
  Share2,
  Download,
  ChevronDown,
  ChevronUp,
  Info,
  Smile,
  Frown,
  Meh
} from 'lucide-react';
import { Activity } from '../store/activityStore';
import { Child, useChildStore } from '../store/childStore';
import confetti from 'canvas-confetti';
import toast from 'react-hot-toast';

interface ParentActivityGuideProps {
  activity: Activity;
  child: Child | null;
  onClose: () => void;
  onComplete: () => void;
}

interface SessionData {
  startTime: Date;
  currentStep: number;
  completedSteps: number[];
  observations: string[];
  photos: string[];
  videos: string[];
  audioNotes: string[];
  sessionNotes: string;
  childMood: 'happy' | 'neutral' | 'frustrated' | null;
  engagementLevel: number;
  difficultyRating: number;
  breaks: { time: Date; reason: string; duration: number }[];
  adaptationsMade: string[];
  extensionsUsed: string[];
}

const ParentActivityGuide: React.FC<ParentActivityGuideProps> = ({
  activity,
  child,
  onClose,
  onComplete
}) => {
  const { completeActivity, addAchievement, updatePoints } = useChildStore();
  
  // Core session state
  const [sessionData, setSessionData] = useState<SessionData>({
    startTime: new Date(),
    currentStep: 0,
    completedSteps: [],
    observations: [],
    photos: [],
    videos: [],
    audioNotes: [],
    sessionNotes: '',
    childMood: null,
    engagementLevel: 5,
    difficultyRating: 3,
    breaks: [],
    adaptationsMade: [],
    extensionsUsed: []
  });

  // UI state
  const [isPlaying, setIsPlaying] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [timeElapsed, setTimeElapsed] = useState(0);
  const [showCompletionModal, setShowCompletionModal] = useState(false);
  const [showObservationTips, setShowObservationTips] = useState(false);
  const [showAdaptations, setShowAdaptations] = useState(false);
  const [showExtensions, setShowExtensions] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [voiceEnabled, setVoiceEnabled] = useState(false);
  const [autoAdvance, setAutoAdvance] = useState(false);
  const [showHints, setShowHints] = useState(true);
  const [currentHint, setCurrentHint] = useState(0);

  // Refs
  const timerRef = useRef<NodeJS.Timeout>();
  const audioRef = useRef<HTMLAudioElement>();
  const videoRef = useRef<HTMLVideoElement>();

  // Timer management
  useEffect(() => {
    if (isPlaying && !isPaused) {
      timerRef.current = setInterval(() => {
        setTimeElapsed(prev => prev + 1);
      }, 1000);
    } else {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    }

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, [isPlaying, isPaused]);

  // Auto-advance hints
  useEffect(() => {
    if (showHints && activity.parentGuidance?.encouragementPhrases) {
      const interval = setInterval(() => {
        setCurrentHint(prev => 
          (prev + 1) % activity.parentGuidance.encouragementPhrases.length
        );
      }, 30000); // Change hint every 30 seconds

      return () => clearInterval(interval);
    }
  }, [showHints, activity.parentGuidance?.encouragementPhrases]);

  const methodologyIcons = {
    montessori: Target,
    reggio: Camera,
    waldorf: Music,
    highscope: Brain,
    bankstreet: Users
  };

  const methodologyColors = {
    montessori: 'from-blue-500 to-blue-600',
    reggio: 'from-green-500 to-green-600',
    waldorf: 'from-purple-500 to-purple-600',
    highscope: 'from-orange-500 to-orange-600',
    bankstreet: 'from-pink-500 to-pink-600'
  };

  const observationPrompts = [
    "How is your child approaching this task?",
    "What strategies are they using?",
    "Are they showing persistence or frustration?",
    "What language are they using?",
    "How are they using their hands/body?",
    "What seems to interest them most?",
    "Are they making connections to other experiences?",
    "What questions are they asking?",
    "How are they problem-solving challenges?",
    "What emotions are they expressing?"
  ];

  const adaptationSuggestions = {
    sensory: [
      "Reduce visual clutter in the workspace",
      "Provide noise-canceling headphones",
      "Use textured materials for tactile input",
      "Adjust lighting for comfort",
      "Offer fidget tools for regulation"
    ],
    motor: [
      "Use adaptive grips on tools",
      "Provide wrist support or stability",
      "Allow alternative positioning",
      "Break into smaller motor tasks",
      "Use hand-over-hand guidance"
    ],
    cognitive: [
      "Break instructions into smaller steps",
      "Use visual supports or picture cards",
      "Provide processing time between steps",
      "Simplify language and vocabulary",
      "Offer choices to increase engagement"
    ]
  };

  const extensionIdeas = [
    "Add counting or math concepts",
    "Incorporate storytelling elements",
    "Create patterns or sequences",
    "Connect to real-world applications",
    "Add artistic or creative elements",
    "Include movement or physical activity",
    "Explore cause and effect relationships",
    "Make predictions and test them"
  ];

  const handleStartSession = () => {
    setIsPlaying(true);
    setSessionData(prev => ({ ...prev, startTime: new Date() }));
    toast.success('Session started! Have fun learning together! 🎉');
  };

  const handlePauseSession = () => {
    setIsPaused(!isPaused);
    if (!isPaused) {
      toast.info('Session paused. Take your time! ⏸️');
    }
  };

  const handleStepComplete = (stepIndex: number) => {
    if (!sessionData.completedSteps.includes(stepIndex)) {
      const newCompletedSteps = [...sessionData.completedSteps, stepIndex];
      setSessionData(prev => ({ ...prev, completedSteps: newCompletedSteps }));
      
      // Celebration for step completion
      confetti({
        particleCount: 50,
        spread: 60,
        origin: { y: 0.7 }
      });

      toast.success('Step completed! Great guidance! 🌟');

      // Auto-advance if enabled
      if (autoAdvance && stepIndex < activity.instructions.length - 1) {
        setTimeout(() => {
          setSessionData(prev => ({ ...prev, currentStep: stepIndex + 1 }));
        }, 2000);
      }
    }
  };

  const handleTakePhoto = async () => {
    try {
      // Try to access device camera
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      const video = document.createElement('video');
      video.srcObject = stream;
      video.play();
      
      // Create canvas to capture photo
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      
      video.addEventListener('loadedmetadata', () => {
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        ctx?.drawImage(video, 0, 0);
        
        // Convert to blob and create object URL
        canvas.toBlob((blob) => {
          if (blob) {
            const photoUrl = URL.createObjectURL(blob);
            setSessionData(prev => ({
              ...prev,
              photos: [...prev.photos, photoUrl]
            }));
            toast.success('Photo captured! 📸');
          }
          
          // Stop camera stream
          stream.getTracks().forEach(track => track.stop());
        }, 'image/jpeg', 0.8);
      });
    } catch (error) {
      // Fallback: use file input if camera access fails
      const input = document.createElement('input');
      input.type = 'file';
      input.accept = 'image/*';
      input.capture = 'environment';
      input.onchange = (e) => {
        const file = (e.target as HTMLInputElement).files?.[0];
        if (file) {
          const photoUrl = URL.createObjectURL(file);
          setSessionData(prev => ({
            ...prev,
            photos: [...prev.photos, photoUrl]
          }));
          toast.success('Photo captured! 📸');
        }
      };
      input.click();
    }
  };

  const handleStartRecording = async () => {
    try {
      setIsRecording(true);
      
      // Request microphone access
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      const audioChunks: Blob[] = [];
      
      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunks.push(event.data);
        }
      };
      
      mediaRecorder.onstop = () => {
        const audioBlob = new Blob(audioChunks, { type: 'audio/webm' });
        const audioUrl = URL.createObjectURL(audioBlob);
        setSessionData(prev => ({
          ...prev,
          audioNotes: [...prev.audioNotes, audioUrl]
        }));
        toast.success('Recording saved! 🎤');
        
        // Stop all tracks
        stream.getTracks().forEach(track => track.stop());
      };
      
      mediaRecorder.start();
      
      // Stop recording after 10 seconds or when user clicks again
      const stopRecording = () => {
        if (mediaRecorder.state !== 'inactive') {
          mediaRecorder.stop();
        }
        setIsRecording(false);
      };
      
      // Store stop function for later use
      (window as any).stopCurrentRecording = stopRecording;
      
      // Auto-stop after 30 seconds
      setTimeout(stopRecording, 30000);
      
    } catch (error) {
      console.error('Error accessing microphone:', error);
      toast.error('Could not access microphone. Please check permissions.');
      setIsRecording(false);
    }
  };
  
  // Add handler to stop recording
  useEffect(() => {
    return () => {
      if ((window as any).stopCurrentRecording) {
        (window as any).stopCurrentRecording();
      }
    };
  }, []);

  const addObservation = (observation: string) => {
    setSessionData(prev => ({
      ...prev,
      observations: [...prev.observations, observation]
    }));
    toast.success('Observation noted! 📝');
  };

  const addBreak = (reason: string) => {
    const breakData = {
      time: new Date(),
      reason,
      duration: 0 // Would be calculated when break ends
    };
    setSessionData(prev => ({
      ...prev,
      breaks: [...prev.breaks, breakData]
    }));
    setIsPaused(true);
    toast.info(`Break time: ${reason} ☕`);
  };

  const addAdaptation = (adaptation: string) => {
    setSessionData(prev => ({
      ...prev,
      adaptationsMade: [...prev.adaptationsMade, adaptation]
    }));
    toast.success('Adaptation noted! 🔧');
  };

  const addExtension = (extension: string) => {
    setSessionData(prev => ({
      ...prev,
      extensionsUsed: [...prev.extensionsUsed, extension]
    }));
    toast.success('Extension added! 🚀');
  };

  const handleComplete = () => {
    if (sessionData.completedSteps.length < activity.instructions.length) {
      toast.error('Please complete all steps before finishing');
      return;
    }
    
    setShowCompletionModal(true);
  };

  const finalizeActivity = () => {
    if (!child) return;

    const endTime = new Date();
    const duration = Math.round((endTime.getTime() - sessionData.startTime.getTime()) / 60000);
    
    // Calculate points based on completion and engagement
    let points = 25; // Base completion points
    if (sessionData.observations.length > 0) points += 10;
    if (sessionData.photos.length > 0) points += 10;
    if (sessionData.sessionNotes.trim()) points += 5;
    if (sessionData.engagementLevel >= 8) points += 15;
    if (sessionData.adaptationsMade.length > 0) points += 10;
    if (sessionData.extensionsUsed.length > 0) points += 10;
    
    // Complete the activity
    completeActivity(child.id, {
      activityId: activity.id,
      duration,
      notes: sessionData.sessionNotes,
      photos: sessionData.photos,
      observations: sessionData.observations
    });

    // Check for achievements
    const activityCount = child.activityHistory.length + 1;
    if (activityCount === 1) {
      addAchievement(child.id, {
        id: 'first-activity',
        title: 'First Steps',
        description: 'Completed your first guided activity!',
        category: 'milestone'
      });
    }

    // Celebration
    confetti({
      particleCount: 100,
      spread: 70,
      origin: { y: 0.6 }
    });

    toast.success(`Amazing work! ${child.name} earned ${points} points! 🌟`);
    
    setTimeout(() => {
      onComplete();
    }, 2000);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const progressPercentage = (sessionData.completedSteps.length / activity.instructions.length) * 100;

  const renderSessionControls = () => (
    <div className="flex items-center gap-4">
      {!isPlaying ? (
        <motion.button
          onClick={handleStartSession}
          className="bg-green-600 text-white px-6 py-3 rounded-xl font-semibold hover:bg-green-700 transition-colors flex items-center gap-2"
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          <Play className="w-5 h-5" />
          Start Session
        </motion.button>
      ) : (
        <motion.button
          onClick={handlePauseSession}
          className={`px-6 py-3 rounded-xl font-semibold transition-colors flex items-center gap-2 ${
            isPaused 
              ? 'bg-green-600 text-white hover:bg-green-700' 
              : 'bg-yellow-600 text-white hover:bg-yellow-700'
          }`}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          {isPaused ? <Play className="w-5 h-5" /> : <Pause className="w-5 h-5" />}
          {isPaused ? 'Resume' : 'Pause'}
        </motion.button>
      )}

      <div className="flex items-center gap-2 text-gray-600">
        <Timer className="w-5 h-5" />
        <span className="font-mono text-lg">{formatTime(timeElapsed)}</span>
      </div>

      <button
        onClick={() => setShowSettings(!showSettings)}
        className="p-3 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
      >
        <Settings className="w-5 h-5" />
      </button>
    </div>
  );

  const renderQuickActions = () => (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
      <motion.button
        onClick={handleTakePhoto}
        className="bg-blue-100 p-4 rounded-xl text-center hover:bg-blue-200 transition-colors"
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
      >
        <Camera className="w-6 h-6 text-blue-600 mx-auto mb-2" />
        <span className="text-sm font-medium text-blue-700">Photo</span>
      </motion.button>
      
      <motion.button
        onClick={() => {
          if (isRecording && (window as any).stopCurrentRecording) {
            (window as any).stopCurrentRecording();
          } else {
            handleStartRecording();
          }
        }}
        className={`p-4 rounded-xl text-center transition-colors ${
          isRecording 
            ? 'bg-red-100 text-red-600' 
            : 'bg-purple-100 hover:bg-purple-200 text-purple-600'
        }`}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
      >
        <Mic className={`w-6 h-6 mx-auto mb-2 ${isRecording ? 'animate-pulse' : ''}`} />
        <span className="text-sm font-medium">
          {isRecording ? 'Stop Recording' : 'Voice Note'}
        </span>
      </motion.button>
      
      <motion.button
        onClick={() => addBreak('Child needs a break')}
        className="bg-orange-100 p-4 rounded-xl text-center hover:bg-orange-200 transition-colors"
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
      >
        <Coffee className="w-6 h-6 text-orange-600 mx-auto mb-2" />
        <span className="text-sm font-medium text-orange-700">Break</span>
      </motion.button>
      
      <motion.button
        onClick={() => setShowObservationTips(!showObservationTips)}
        className="bg-green-100 p-4 rounded-xl text-center hover:bg-green-200 transition-colors"
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
      >
        <Eye className="w-6 h-6 text-green-600 mx-auto mb-2" />
        <span className="text-sm font-medium text-green-700">Observe</span>
      </motion.button>
    </div>
  );

  const renderMoodTracker = () => (
    <div className="bg-white rounded-xl p-4 border border-gray-200">
      <h4 className="font-semibold text-gray-900 mb-3">How is {child?.name} feeling?</h4>
      <div className="flex gap-3">
        {[
          { mood: 'happy', icon: Smile, color: 'text-green-600', bg: 'bg-green-100' },
          { mood: 'neutral', icon: Meh, color: 'text-yellow-600', bg: 'bg-yellow-100' },
          { mood: 'frustrated', icon: Frown, color: 'text-red-600', bg: 'bg-red-100' }
        ].map(({ mood, icon: Icon, color, bg }) => (
          <button
            key={mood}
            onClick={() => setSessionData(prev => ({ ...prev, childMood: mood as any }))}
            className={`p-3 rounded-lg transition-all ${
              sessionData.childMood === mood 
                ? `${bg} ${color} ring-2 ring-current ring-opacity-50` 
                : 'bg-gray-100 text-gray-400 hover:bg-gray-200'
            }`}
          >
            <Icon className="w-6 h-6" />
          </button>
        ))}
      </div>
    </div>
  );

  const renderEngagementSlider = () => (
    <div className="bg-white rounded-xl p-4 border border-gray-200">
      <h4 className="font-semibold text-gray-900 mb-3">Engagement Level</h4>
      <div className="space-y-2">
        <input
          type="range"
          min="1"
          max="10"
          value={sessionData.engagementLevel}
          onChange={(e) => setSessionData(prev => ({ 
            ...prev, 
            engagementLevel: parseInt(e.target.value) 
          }))}
          className="w-full"
        />
        <div className="flex justify-between text-xs text-gray-500">
          <span>Low</span>
          <span className="font-medium text-gray-700">{sessionData.engagementLevel}/10</span>
          <span>High</span>
        </div>
      </div>
    </div>
  );

  return (
    <motion.div
      className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <motion.div
        className={`bg-white rounded-2xl w-full max-h-[95vh] overflow-hidden ${
          isFullscreen ? 'max-w-full h-full' : 'max-w-7xl'
        }`}
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
      >
        {/* Enhanced Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 bg-gradient-to-r from-blue-50 to-green-50">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-gradient-to-r from-blue-600 to-green-600 rounded-xl flex items-center justify-center text-white">
              <User className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-900">Parent Activity Guide</h2>
              <p className="text-gray-600">Guiding {child?.name} through "{activity.title}"</p>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsFullscreen(!isFullscreen)}
              className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
            >
              {isFullscreen ? <Minimize2 className="w-5 h-5" /> : <Maximize2 className="w-5 h-5" />}
            </button>
            <button
              onClick={onClose}
              className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
        </div>

        {/* Enhanced Progress Bar */}
        <div className="px-6 py-4 bg-gray-50 border-b border-gray-200">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-4">
              <span className="text-sm font-medium text-gray-700">
                Progress: {sessionData.completedSteps.length} of {activity.instructions.length} steps
              </span>
              {renderSessionControls()}
            </div>
          </div>
          
          <div className="w-full bg-gray-200 rounded-full h-3 mb-2">
            <motion.div
              className="bg-gradient-to-r from-blue-500 to-green-500 h-3 rounded-full"
              initial={{ width: 0 }}
              animate={{ width: `${progressPercentage}%` }}
              transition={{ duration: 0.5 }}
            />
          </div>
          
          {/* Current Hint */}
          {showHints && activity.parentGuidance?.encouragementPhrases && (
            <motion.div
              className="bg-yellow-100 border border-yellow-300 rounded-lg p-3 mt-3"
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              key={currentHint}
            >
              <div className="flex items-center gap-2">
                <Lightbulb className="w-4 h-4 text-yellow-600" />
                <span className="text-sm font-medium text-yellow-800">Encouragement Tip:</span>
              </div>
              <p className="text-yellow-700 mt-1">
                "{activity.parentGuidance.encouragementPhrases[currentHint]}"
              </p>
            </motion.div>
          )}
        </div>

        <div className="flex h-[calc(95vh-200px)]">
          {/* Enhanced Main Content */}
          <div className="flex-1 p-6 overflow-y-auto">
            {/* Quick Actions */}
            <div className="mb-6">
              <h3 className="font-bold text-gray-900 mb-3">Quick Actions</h3>
              {renderQuickActions()}
            </div>

            {/* Current Step */}
            <div className="mb-6">
              <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
                <div className="flex items-center gap-3 mb-4">
                  <motion.div
                    className={`w-12 h-12 rounded-full flex items-center justify-center text-white font-bold text-xl ${
                      sessionData.completedSteps.includes(sessionData.currentStep)
                        ? 'bg-green-500'
                        : 'bg-blue-500'
                    }`}
                    whileHover={{ scale: 1.1 }}
                  >
                    {sessionData.completedSteps.includes(sessionData.currentStep) ? (
                      <CheckCircle className="w-6 h-6" />
                    ) : (
                      sessionData.currentStep + 1
                    )}
                  </motion.div>
                  <div>
                    <h2 className="text-xl font-bold text-gray-800">
                      {sessionData.completedSteps.includes(sessionData.currentStep) 
                        ? 'Step Completed!' 
                        : `Step ${sessionData.currentStep + 1}`}
                    </h2>
                    <p className="text-gray-600">
                      {sessionData.completedSteps.includes(sessionData.currentStep)
                        ? 'Great job! Ready for the next step?'
                        : 'Follow along with the instructions below'}
                    </p>
                  </div>
                </div>
                
                <motion.div
                  className="bg-blue-50 rounded-lg p-4 mb-4"
                  key={sessionData.currentStep}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5 }}
                >
                  <p className="text-lg text-gray-800 leading-relaxed">
                    {activity.instructions[sessionData.currentStep]}
                  </p>
                </motion.div>
                
                <div className="flex items-center gap-3">
                  {sessionData.currentStep > 0 && (
                    <button
                      onClick={() => setSessionData(prev => ({ 
                        ...prev, 
                        currentStep: prev.currentStep - 1 
                      }))}
                      className="bg-gray-100 text-gray-700 px-4 py-2 rounded-xl font-medium flex items-center gap-2"
                    >
                      <ArrowLeft className="w-4 h-4" />
                      Previous
                    </button>
                  )}
                  
                  {!sessionData.completedSteps.includes(sessionData.currentStep) && (
                    <button
                      onClick={() => handleStepComplete(sessionData.currentStep)}
                      className="bg-green-600 text-white px-6 py-3 rounded-xl font-bold flex items-center gap-2 flex-1"
                    >
                      <CheckCircle className="w-5 h-5" />
                      Mark Complete
                    </button>
                  )}
                  
                  {sessionData.currentStep < activity.instructions.length - 1 && (
                    <button
                      onClick={() => setSessionData(prev => ({ 
                        ...prev, 
                        currentStep: prev.currentStep + 1 
                      }))}
                      className="bg-blue-600 text-white px-4 py-2 rounded-xl font-medium flex items-center gap-2"
                    >
                      Next
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>
            </div>

            {/* Adaptations Panel */}
            <AnimatePresence>
              {showAdaptations && (
                <motion.div
                  className="mb-6 bg-orange-50 border border-orange-200 rounded-xl p-4"
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                >
                  <h4 className="font-bold text-orange-900 mb-3">Need to Adapt?</h4>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {Object.entries(adaptationSuggestions).map(([type, suggestions]) => (
                      <div key={type}>
                        <h5 className="font-medium text-orange-800 mb-2 capitalize">{type}</h5>
                        <div className="space-y-1">
                          {suggestions.map((suggestion, index) => (
                            <button
                              key={index}
                              onClick={() => addAdaptation(suggestion)}
                              className="w-full text-left p-2 text-sm bg-white rounded border hover:bg-orange-50 transition-colors"
                            >
                              {suggestion}
                            </button>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Extensions Panel */}
            <AnimatePresence>
              {showExtensions && (
                <motion.div
                  className="mb-6 bg-purple-50 border border-purple-200 rounded-xl p-4"
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                >
                  <h4 className="font-bold text-purple-900 mb-3">Ready to Extend?</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                    {extensionIdeas.map((idea, index) => (
                      <button
                        key={index}
                        onClick={() => addExtension(idea)}
                        className="text-left p-3 bg-white rounded border hover:bg-purple-50 transition-colors"
                      >
                        <span className="text-sm font-medium text-purple-800">{idea}</span>
                      </button>
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Complete Button */}
            {sessionData.completedSteps.length === activity.instructions.length && (
              <motion.div
                className="text-center"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
              >
                <button
                  onClick={handleComplete}
                  className="bg-gradient-to-r from-green-600 to-blue-600 text-white px-8 py-4 rounded-xl font-bold text-lg hover:shadow-lg transition-all duration-300 flex items-center gap-2 mx-auto"
                >
                  <Star className="w-6 h-6" />
                  Complete Activity
                </button>
              </motion.div>
            )}
          </div>

          {/* Enhanced Sidebar */}
          <div className="w-80 bg-gray-50 border-l border-gray-200 p-6 overflow-y-auto">
            {/* Mood & Engagement Tracking */}
            <div className="space-y-4 mb-6">
              {renderMoodTracker()}
              {renderEngagementSlider()}
            </div>

            {/* Action Buttons */}
            <div className="space-y-3 mb-6">
              <button
                onClick={() => setShowAdaptations(!showAdaptations)}
                className="w-full flex items-center justify-between p-3 bg-orange-100 border border-orange-200 rounded-lg hover:bg-orange-200 transition-colors"
              >
                <div className="flex items-center gap-2">
                  <Settings className="w-5 h-5 text-orange-600" />
                  <span className="font-medium text-orange-800">Adaptations</span>
                </div>
                {showAdaptations ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
              </button>
              
              <button
                onClick={() => setShowExtensions(!showExtensions)}
                className="w-full flex items-center justify-between p-3 bg-purple-100 border border-purple-200 rounded-lg hover:bg-purple-200 transition-colors"
              >
                <div className="flex items-center gap-2">
                  <Zap className="w-5 h-5 text-purple-600" />
                  <span className="font-medium text-purple-800">Extensions</span>
                </div>
                {showExtensions ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
              </button>
            </div>

            {/* Session Notes */}
            <div className="mb-6">
              <h4 className="font-bold text-gray-900 mb-3">Session Notes</h4>
              <textarea
                value={sessionData.sessionNotes}
                onChange={(e) => setSessionData(prev => ({ 
                  ...prev, 
                  sessionNotes: e.target.value 
                }))}
                placeholder="Jot down observations, quotes, or special moments..."
                className="w-full h-24 p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none text-sm"
              />
            </div>

            {/* Media Captured */}
            {(sessionData.photos.length > 0 || sessionData.audioNotes.length > 0) && (
              <div className="mb-6">
                <h4 className="font-bold text-gray-900 mb-3">Captured Media</h4>
                
                {sessionData.photos.length > 0 && (
                  <div className="mb-3">
                    <div className="text-sm text-gray-600 mb-2">Photos ({sessionData.photos.length})</div>
                    <div className="grid grid-cols-2 gap-2">
                      {sessionData.photos.slice(0, 4).map((photo, index) => (
                        <img
                          key={index}
                          src={photo}
                          alt={`Session photo ${index + 1}`}
                          className="w-full h-16 object-cover rounded-lg"
                        />
                      ))}
                    </div>
                  </div>
                )}
                
                {sessionData.audioNotes.length > 0 && (
                  <div>
                    <div className="text-sm text-gray-600 mb-2">Audio Notes ({sessionData.audioNotes.length})</div>
                    <div className="space-y-1">
                      {sessionData.audioNotes.map((note, index) => (
                        <div key={index} className="flex items-center gap-2 p-2 bg-purple-50 rounded text-sm">
                          <Mic className="w-4 h-4 text-purple-600" />
                          <span className="text-purple-800">Voice note {index + 1}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Observations */}
            {sessionData.observations.length > 0 && (
              <div className="mb-6">
                <h4 className="font-bold text-gray-900 mb-3">Observations ({sessionData.observations.length})</h4>
                <div className="space-y-2">
                  {sessionData.observations.map((observation, index) => (
                    <div key={index} className="p-2 bg-green-50 border border-green-200 rounded text-sm text-green-800">
                      {observation}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Quick Observation Prompts */}
            <AnimatePresence>
              {showObservationTips && (
                <motion.div
                  className="mb-6"
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                >
                  <h4 className="font-bold text-gray-900 mb-3">Observation Prompts</h4>
                  <div className="space-y-2">
                    {observationPrompts.slice(0, 5).map((prompt, index) => (
                      <button
                        key={index}
                        onClick={() => addObservation(prompt)}
                        className="w-full text-left p-2 text-sm text-gray-700 hover:bg-green-50 rounded border border-gray-200 transition-colors"
                      >
                        {prompt}
                      </button>
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* Enhanced Completion Modal */}
        <AnimatePresence>
          {showCompletionModal && (
            <motion.div
              className="absolute inset-0 bg-black/50 flex items-center justify-center p-4"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <motion.div
                className="bg-white rounded-2xl p-8 max-w-lg w-full text-center"
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.8, opacity: 0 }}
              >
                <div className="w-16 h-16 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Award className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-2">Activity Complete! 🎉</h3>
                <p className="text-gray-600 mb-6">
                  Wonderful job guiding {child?.name} through this learning experience!
                </p>
                
                <div className="bg-gray-50 rounded-lg p-4 mb-6">
                  <div className="grid grid-cols-2 gap-4 text-center">
                    <div>
                      <div className="text-2xl font-bold text-blue-600">{sessionData.completedSteps.length}</div>
                      <div className="text-xs text-gray-600">Steps Completed</div>
                    </div>
                    <div>
                      <div className="text-2xl font-bold text-green-600">{sessionData.photos.length}</div>
                      <div className="text-xs text-gray-600">Photos Taken</div>
                    </div>
                    <div>
                      <div className="text-2xl font-bold text-purple-600">{sessionData.observations.length}</div>
                      <div className="text-xs text-gray-600">Observations</div>
                    </div>
                    <div>
                      <div className="text-2xl font-bold text-orange-600">{formatTime(timeElapsed)}</div>
                      <div className="text-xs text-gray-600">Time Spent</div>
                    </div>
                  </div>
                  
                  {sessionData.childMood && (
                    <div className="mt-4 pt-4 border-t border-gray-200">
                      <div className="text-sm text-gray-600">Child's mood: 
                        <span className="font-medium capitalize ml-1">{sessionData.childMood}</span>
                      </div>
                      <div className="text-sm text-gray-600">Engagement: 
                        <span className="font-medium ml-1">{sessionData.engagementLevel}/10</span>
                      </div>
                    </div>
                  )}
                </div>

                <div className="flex gap-3">
                  <button
                    onClick={() => setShowCompletionModal(false)}
                    className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    Continue Editing
                  </button>
                  <button
                    onClick={finalizeActivity}
                    className="flex-1 px-4 py-2 bg-gradient-to-r from-blue-600 to-green-600 text-white rounded-lg hover:shadow-lg transition-all duration-300"
                  >
                    Save & Finish
                  </button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </motion.div>
  );
};

export default ParentActivityGuide;