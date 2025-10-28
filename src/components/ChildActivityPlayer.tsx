import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Play, 
  Pause, 
  RotateCcw, 
  Home, 
  Camera, 
  Star, 
  Heart, 
  Trophy, 
  CheckCircle,
  ArrowRight,
  ArrowLeft,
  Sparkles,
  Target,
  Timer
} from 'lucide-react';
import confetti from 'canvas-confetti';
import toast from 'react-hot-toast';

interface ChildActivityPlayerProps {
  activity: any;
  onComplete: (points: number) => void;
  onExit: () => void;
}

const ChildActivityPlayer: React.FC<ChildActivityPlayerProps> = ({
  activity,
  onComplete,
  onExit
}) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [timeElapsed, setTimeElapsed] = useState(0);
  const [completedSteps, setCompletedSteps] = useState<number[]>([]);
  const [showCelebration, setShowCelebration] = useState(false);
  const [collectedStars, setCollectedStars] = useState(0);
  const [showHint, setShowHint] = useState(false);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isPlaying) {
      interval = setInterval(() => {
        setTimeElapsed(prev => prev + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isPlaying]);

  const handleStepComplete = () => {
    const newCompletedSteps = [...completedSteps, currentStep];
    setCompletedSteps(newCompletedSteps);
    setCollectedStars(prev => prev + 1);
    
    // Celebration for step completion
    confetti({
      particleCount: 50,
      spread: 60,
      origin: { y: 0.7 }
    });

    if (currentStep < activity.instructions.length - 1) {
      setTimeout(() => {
        setCurrentStep(prev => prev + 1);
      }, 1500);
    } else {
      // Activity completed
      setTimeout(() => {
        handleActivityComplete();
      }, 2000);
    }
  };

  const handleActivityComplete = () => {
    setShowCelebration(true);
    const points = activity.difficulty * 10 + (collectedStars * 5);
    
    // Big celebration
    confetti({
      particleCount: 200,
      spread: 100,
      origin: { y: 0.6 }
    });

    setTimeout(() => {
      onComplete(points);
    }, 3000);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const progressPercentage = ((currentStep + 1) / activity.instructions.length) * 100;

  if (showCelebration) {
    return (
      <motion.div
        className="min-h-screen bg-gradient-to-br from-yellow-200 via-pink-200 to-purple-200 flex items-center justify-center p-4"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        <motion.div
          className="bg-white rounded-3xl p-8 shadow-2xl text-center max-w-md"
          initial={{ scale: 0.5, rotate: -10 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ type: "spring", stiffness: 200, damping: 15 }}
        >
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
            className="mb-6"
          >
            <Trophy className="w-24 h-24 text-yellow-500 mx-auto" />
          </motion.div>
          
          <motion.h1
            className="text-4xl font-bold text-gray-800 mb-4"
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.5 }}
          >
            Amazing Work! 🎉
          </motion.h1>
          
          <motion.p
            className="text-xl text-gray-600 mb-6"
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.7 }}
          >
            You completed "{activity.title}"!
          </motion.p>
          
          <motion.div
            className="flex items-center justify-center gap-4 mb-6"
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.9 }}
          >
            <div className="flex items-center gap-2">
              <Star className="w-8 h-8 text-yellow-500" />
              <span className="text-2xl font-bold text-gray-800">+{activity.difficulty * 10}</span>
            </div>
            <div className="flex items-center gap-2">
              <Heart className="w-8 h-8 text-red-500" />
              <span className="text-2xl font-bold text-gray-800">+{collectedStars * 5}</span>
            </div>
          </motion.div>
          
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 1.1, type: "spring", stiffness: 200 }}
          >
            <Sparkles className="w-16 h-16 text-purple-500 mx-auto" />
          </motion.div>
        </motion.div>
      </motion.div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-100 via-purple-50 to-pink-100">
      {/* Header */}
      <motion.div
        className="flex items-center justify-between p-6 bg-white shadow-lg"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <motion.button
          onClick={onExit}
          className="bg-gray-100 p-3 rounded-full hover:bg-gray-200 transition-colors"
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
        >
          <Home className="w-6 h-6 text-gray-600" />
        </motion.button>
        
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-800">{activity.title}</h1>
          <div className="flex items-center gap-4 mt-2">
            <div className="flex items-center gap-1">
              <Timer className="w-4 h-4 text-blue-600" />
              <span className="text-sm text-gray-600">{formatTime(timeElapsed)}</span>
            </div>
            <div className="flex items-center gap-1">
              <Star className="w-4 h-4 text-yellow-500" />
              <span className="text-sm text-gray-600">{collectedStars}</span>
            </div>
          </div>
        </div>
        
        <motion.button
          onClick={() => setShowHint(!showHint)}
          className="bg-yellow-100 p-3 rounded-full hover:bg-yellow-200 transition-colors"
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
        >
          <Sparkles className="w-6 h-6 text-yellow-600" />
        </motion.button>
      </motion.div>

      {/* Progress Bar */}
      <motion.div
        className="bg-white mx-6 mt-4 rounded-full p-2 shadow-lg"
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.6, delay: 0.1 }}
      >
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium text-gray-700">
            Step {currentStep + 1} of {activity.instructions.length}
          </span>
          <span className="text-sm font-medium text-blue-600">
            {Math.round(progressPercentage)}%
          </span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-3">
          <motion.div
            className="bg-gradient-to-r from-blue-500 to-purple-500 h-3 rounded-full"
            initial={{ width: 0 }}
            animate={{ width: `${progressPercentage}%` }}
            transition={{ duration: 0.5 }}
          />
        </div>
      </motion.div>

      {/* Hint Panel */}
      <AnimatePresence>
        {showHint && (
          <motion.div
            className="mx-6 mt-4 bg-yellow-100 border-2 border-yellow-300 rounded-xl p-4"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
          >
            <div className="flex items-center gap-2 mb-2">
              <Sparkles className="w-5 h-5 text-yellow-600" />
              <span className="font-bold text-yellow-800">Helpful Hint!</span>
            </div>
            <p className="text-yellow-700">
              {activity.learningObjectives[0] || "Take your time and have fun exploring!"}
            </p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Content */}
      <div className="p-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Instructions Panel */}
          <motion.div
            className="bg-white rounded-2xl p-6 shadow-lg"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <div className="flex items-center gap-3 mb-4">
              <motion.div
                className={`w-12 h-12 rounded-full flex items-center justify-center text-white font-bold text-xl ${
                  completedSteps.includes(currentStep) 
                    ? 'bg-green-500' 
                    : 'bg-blue-500'
                }`}
                whileHover={{ scale: 1.1 }}
              >
                {completedSteps.includes(currentStep) ? (
                  <CheckCircle className="w-6 h-6" />
                ) : (
                  currentStep + 1
                )}
              </motion.div>
              <h2 className="text-xl font-bold text-gray-800">
                {completedSteps.includes(currentStep) ? 'Great Job!' : 'Your Turn!'}
              </h2>
            </div>
            
            <motion.p
              className="text-lg text-gray-700 leading-relaxed mb-6"
              key={currentStep}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              {activity.instructions[currentStep]}
            </motion.p>
            
            <div className="flex items-center gap-4">
              {currentStep > 0 && (
                <motion.button
                  onClick={() => setCurrentStep(prev => prev - 1)}
                  className="bg-gray-100 text-gray-700 px-4 py-2 rounded-xl font-medium flex items-center gap-2"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <ArrowLeft className="w-4 h-4" />
                  Back
                </motion.button>
              )}
              
              {!completedSteps.includes(currentStep) && (
                <motion.button
                  onClick={handleStepComplete}
                  className="bg-gradient-to-r from-green-500 to-blue-500 text-white px-6 py-3 rounded-xl font-bold flex items-center gap-2 flex-1"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <CheckCircle className="w-5 h-5" />
                  I Did It!
                </motion.button>
              )}
              
              {completedSteps.includes(currentStep) && currentStep < activity.instructions.length - 1 && (
                <motion.button
                  onClick={() => setCurrentStep(prev => prev + 1)}
                  className="bg-gradient-to-r from-purple-500 to-pink-500 text-white px-6 py-3 rounded-xl font-bold flex items-center gap-2 flex-1"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  Next Step
                  <ArrowRight className="w-5 h-5" />
                </motion.button>
              )}
            </div>
          </motion.div>

          {/* Media & Tools Panel */}
          <motion.div
            className="bg-white rounded-2xl p-6 shadow-lg"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
          >
            <h3 className="text-xl font-bold text-gray-800 mb-4">Activity Tools</h3>
            
            {/* Activity Image */}
            {activity.media.images.length > 0 && (
              <motion.div
                className="mb-6"
                whileHover={{ scale: 1.02 }}
              >
                <img 
                  src={activity.media.images[0]} 
                  alt={activity.title}
                  className="w-full h-48 object-cover rounded-xl"
                />
              </motion.div>
            )}
            
            {/* Interactive Tools */}
            <div className="grid grid-cols-2 gap-4 mb-6">
              <motion.button
                className="bg-blue-100 p-4 rounded-xl text-center hover:bg-blue-200 transition-colors"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Camera className="w-8 h-8 text-blue-600 mx-auto mb-2" />
                <span className="text-sm font-medium text-blue-700">Take Photo</span>
              </motion.button>
              
              <motion.button
                className="bg-purple-100 p-4 rounded-xl text-center hover:bg-purple-200 transition-colors"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => toast.success('Great observation! Keep exploring!')}
              >
                <Target className="w-8 h-8 text-purple-600 mx-auto mb-2" />
                <span className="text-sm font-medium text-purple-700">Mark Progress</span>
              </motion.button>
            </div>
            
            {/* Materials Needed */}
            <div>
              <h4 className="font-bold text-gray-800 mb-3">What You Need:</h4>
              <div className="space-y-2">
                {activity.materials.slice(0, 3).map((material: string, index: number) => (
                  <motion.div
                    key={index}
                    className="flex items-center gap-2"
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.5, delay: index * 0.1 }}
                  >
                    <div className="w-2 h-2 bg-green-500 rounded-full" />
                    <span className="text-gray-700">{material}</span>
                  </motion.div>
                ))}
              </div>
            </div>
          </motion.div>
        </div>

        {/* Encouragement Messages */}
        <motion.div
          className="mt-8 bg-gradient-to-r from-pink-200 to-purple-200 rounded-2xl p-6 text-center"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
        >
          <motion.div
            animate={{ rotate: [0, 10, -10, 0] }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            <Heart className="w-12 h-12 text-pink-600 mx-auto mb-3" />
          </motion.div>
          <h3 className="text-xl font-bold text-gray-800 mb-2">You're Doing Great! 🌟</h3>
          <p className="text-gray-700">
            {completedSteps.length === 0 && "Let's start this amazing adventure together!"}
            {completedSteps.length > 0 && completedSteps.length < activity.instructions.length && 
              `Awesome! You've completed ${completedSteps.length} step${completedSteps.length > 1 ? 's' : ''}!`}
            {completedSteps.length === activity.instructions.length && "You're a learning superstar! 🎉"}
          </p>
        </motion.div>
      </div>
    </div>
  );
};

export default ChildActivityPlayer;