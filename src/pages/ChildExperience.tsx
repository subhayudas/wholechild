import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Star, 
  Heart, 
  Trophy, 
  Gift, 
  Sparkles, 
  Home,
  ArrowLeft,
  Camera,
  Palette,
  Music,
  BookOpen,
  Target,
  Smile,
  Sun,
  Moon,
  Cloud,
  Rainbow,
  Eye,
  Users,
  Calendar
} from 'lucide-react';
import { useChildStore } from '../store/childStore';
import { useLearningStoryStore } from '../store/learningStoryStore';
import ChildRewardSystem from '../components/ChildRewardSystem';
import toast from 'react-hot-toast';

const ChildExperience = () => {
  const { activeChild } = useChildStore();
  const { getStoriesForChild } = useLearningStoryStore();
  const [currentView, setCurrentView] = useState<'home' | 'stories' | 'rewards'>('home');
  const [childPoints, setChildPoints] = useState(150);
  const [unlockedRewards, setUnlockedRewards] = useState(['rainbow-badge', 'star-collector']);
  const [currentStreak, setCurrentStreak] = useState(3);
  const [timeOfDay, setTimeOfDay] = useState<'morning' | 'afternoon' | 'evening'>('morning');

  useEffect(() => {
    const hour = new Date().getHours();
    if (hour < 12) setTimeOfDay('morning');
    else if (hour < 17) setTimeOfDay('afternoon');
    else setTimeOfDay('evening');
  }, []);

  const childStories = activeChild ? getStoriesForChild(activeChild.id) : [];

  const greetingMessages = {
    morning: [
      "Good morning, sunshine! ☀️",
      "Rise and shine! Ready to see your amazing work?",
      "What a beautiful morning to celebrate learning!"
    ],
    afternoon: [
      "Good afternoon, explorer! 🌤️",
      "Hope you're having a wonderful day!",
      "Ready to see all your achievements?"
    ],
    evening: [
      "Good evening, star! 🌙",
      "What a lovely evening to look at your progress!",
      "Time to celebrate today's learning!"
    ]
  };

  const WeatherIcon = () => {
    const icons = [Sun, Cloud, Rainbow];
    const Icon = icons[Math.floor(Math.random() * icons.length)];
    return <Icon className="w-6 h-6 text-yellow-400" />;
  };

  const renderHomeView = () => (
    <div className="min-h-screen bg-gradient-to-br from-blue-100 via-purple-50 to-pink-100 p-4">
      {/* Header */}
      <motion.div
        className="flex items-center justify-between mb-8"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <div className="flex items-center gap-4">
          {activeChild?.avatar && (
            <motion.img 
              src={activeChild.avatar} 
              alt={activeChild.name}
              className="w-16 h-16 rounded-full border-4 border-white shadow-lg"
              whileHover={{ scale: 1.1 }}
            />
          )}
          <div>
            <motion.h1 
              className="text-3xl font-bold text-gray-800"
              initial={{ scale: 0.8 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", stiffness: 200 }}
            >
              {greetingMessages[timeOfDay][Math.floor(Math.random() * greetingMessages[timeOfDay].length)]}
            </motion.h1>
            <p className="text-xl text-gray-600">Hi {activeChild?.name}! 👋</p>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <WeatherIcon />
          <motion.button
            onClick={() => window.history.back()}
            className="bg-gray-100 p-3 rounded-full hover:bg-gray-200 transition-colors"
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
          >
            <Home className="w-6 h-6 text-gray-600" />
          </motion.button>
        </div>
      </motion.div>

      {/* Celebration Mode Notice */}
      <motion.div
        className="mb-8 bg-gradient-to-r from-purple-200 to-pink-200 rounded-2xl p-6 text-center"
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.6, delay: 0.1 }}
      >
        <Sparkles className="w-12 h-12 text-purple-600 mx-auto mb-3" />
        <h2 className="text-2xl font-bold text-gray-800 mb-2">Celebration Mode! 🎉</h2>
        <p className="text-gray-700">
          This special space is for celebrating your amazing learning journey with a grown-up!
        </p>
      </motion.div>

      {/* Progress & Rewards Bar */}
      <motion.div
        className="bg-white rounded-2xl p-6 mb-8 shadow-lg"
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.6, delay: 0.2 }}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-6">
            <div className="text-center">
              <div className="flex items-center gap-2 mb-1">
                <Star className="w-6 h-6 text-yellow-500" />
                <span className="text-2xl font-bold text-gray-800">{childPoints}</span>
              </div>
              <p className="text-sm text-gray-600">Learning Stars</p>
            </div>
            
            <div className="text-center">
              <div className="flex items-center gap-2 mb-1">
                <Trophy className="w-6 h-6 text-orange-500" />
                <span className="text-2xl font-bold text-gray-800">{currentStreak}</span>
              </div>
              <p className="text-sm text-gray-600">Day Streak</p>
            </div>
            
            <div className="text-center">
              <div className="flex items-center gap-2 mb-1">
                <Heart className="w-6 h-6 text-red-500" />
                <span className="text-2xl font-bold text-gray-800">{unlockedRewards.length}</span>
              </div>
              <p className="text-sm text-gray-600">Badges</p>
            </div>
          </div>

          <motion.button
            onClick={() => setCurrentView('rewards')}
            className="bg-gradient-to-r from-purple-500 to-pink-500 text-white px-6 py-3 rounded-xl font-bold text-lg shadow-lg flex items-center gap-2"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <Gift className="w-6 h-6" />
            My Rewards
          </motion.button>
        </div>
      </motion.div>

      {/* Learning Stories */}
      <motion.div
        className="mb-8"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.3 }}
      >
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
            <BookOpen className="w-8 h-8 text-blue-500" />
            My Learning Stories
          </h2>
          {childStories.length > 3 && (
            <button
              onClick={() => setCurrentView('stories')}
              className="text-blue-600 hover:text-blue-700 font-medium"
            >
              See All Stories
            </button>
          )}
        </div>
        
        {childStories.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {childStories.slice(0, 3).map((story, index) => (
              <motion.div
                key={story.id}
                className="bg-white rounded-2xl p-6 shadow-lg cursor-pointer overflow-hidden"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.1 * index }}
                whileHover={{ scale: 1.02, y: -5 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => toast.success(`Ask a grown-up to read "${story.title}" with you!`)}
              >
                {story.media.photos.length > 0 && (
                  <img 
                    src={story.media.photos[0]} 
                    alt={story.title}
                    className="w-full h-32 object-cover rounded-xl mb-4"
                  />
                )}
                
                <h3 className="text-lg font-bold text-gray-800 mb-2">{story.title}</h3>
                <p className="text-gray-600 text-sm mb-3 line-clamp-2">{story.description}</p>
                
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Heart className="w-4 h-4 text-red-500" />
                    <span className="text-sm font-medium text-gray-700">{story.reactions.hearts}</span>
                  </div>
                  <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded-full">
                    {new Date(story.date).toLocaleDateString()}
                  </span>
                </div>
              </motion.div>
            ))}
          </div>
        ) : (
          <motion.div
            className="bg-white rounded-2xl p-8 shadow-lg text-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6 }}
          >
            <Camera className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-gray-800 mb-2">No Stories Yet</h3>
            <p className="text-gray-600">
              Ask a grown-up to help create your first learning story!
            </p>
          </motion.div>
        )}
      </motion.div>

      {/* Fun Facts */}
      <motion.div
        className="bg-gradient-to-r from-yellow-400 to-orange-500 rounded-2xl p-6 text-white shadow-lg"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.4 }}
      >
        <div className="flex items-center gap-4">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
          >
            <Sun className="w-12 h-12" />
          </motion.div>
          <div>
            <h3 className="text-xl font-bold mb-1">Did You Know? 🤔</h3>
            <p className="text-lg">
              Every time you learn something new, your brain grows stronger! Keep exploring! 🧠✨
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  );

  const renderStoriesView = () => (
    <div className="min-h-screen bg-gradient-to-br from-green-100 via-blue-50 to-purple-100 p-4">
      {/* Header */}
      <motion.div
        className="flex items-center justify-between mb-8"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <motion.button
          onClick={() => setCurrentView('home')}
          className="bg-white p-3 rounded-full shadow-lg"
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
        >
          <ArrowLeft className="w-6 h-6 text-gray-600" />
        </motion.button>
        
        <h1 className="text-3xl font-bold text-gray-800">My Learning Stories! 📚</h1>
        
        <motion.button
          onClick={() => setCurrentView('home')}
          className="bg-white p-3 rounded-full shadow-lg"
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
        >
          <Home className="w-6 h-6 text-gray-600" />
        </motion.button>
      </motion.div>

      {/* Stories Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {childStories.map((story, index) => (
          <motion.div
            key={story.id}
            className="bg-white rounded-2xl p-6 shadow-lg cursor-pointer"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 * index }}
            whileHover={{ scale: 1.02, y: -5 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => toast.success(`Ask a grown-up to read "${story.title}" with you!`)}
          >
            {story.media.photos.length > 0 && (
              <img 
                src={story.media.photos[0]} 
                alt={story.title}
                className="w-full h-40 object-cover rounded-xl mb-4"
              />
            )}
            
            <h3 className="text-xl font-bold text-gray-800 mb-2">{story.title}</h3>
            <p className="text-gray-600 mb-4 line-clamp-3">{story.description}</p>
            
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Heart className="w-5 h-5 text-red-500" />
                <span className="font-bold text-gray-700">{story.reactions.hearts}</span>
              </div>
              <span className="bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-sm font-medium">
                {new Date(story.date).toLocaleDateString()}
              </span>
            </div>
          </motion.div>
        ))}
      </div>

      {childStories.length === 0 && (
        <motion.div
          className="text-center py-16"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6 }}
        >
          <BookOpen className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-2xl font-bold text-gray-800 mb-2">No Stories Yet</h3>
          <p className="text-gray-600 text-lg">
            Ask a grown-up to help create your first learning story!
          </p>
        </motion.div>
      )}
    </div>
  );

  if (!activeChild) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-100 to-purple-100 flex items-center justify-center p-4">
        <motion.div
          className="bg-white rounded-2xl p-8 shadow-lg text-center max-w-md"
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6 }}
        >
          <Smile className="w-16 h-16 text-blue-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Welcome to Celebration Mode! 🎉</h2>
          <p className="text-gray-600 mb-6">
            Ask a grown-up to select your profile so we can celebrate your learning together!
          </p>
          <motion.button
            onClick={() => window.history.back()}
            className="bg-gradient-to-r from-blue-500 to-purple-500 text-white px-6 py-3 rounded-xl font-bold"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            Go Back
          </motion.button>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="relative">
      <AnimatePresence mode="wait">
        {currentView === 'home' && (
          <motion.div
            key="home"
            initial={{ opacity: 0, x: -100 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 100 }}
            transition={{ duration: 0.3 }}
          >
            {renderHomeView()}
          </motion.div>
        )}
        
        {currentView === 'stories' && (
          <motion.div
            key="stories"
            initial={{ opacity: 0, x: -100 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 100 }}
            transition={{ duration: 0.3 }}
          >
            {renderStoriesView()}
          </motion.div>
        )}
        
        {currentView === 'rewards' && (
          <motion.div
            key="rewards"
            initial={{ opacity: 0, y: 100 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 100 }}
            transition={{ duration: 0.3 }}
          >
            <ChildRewardSystem
              points={childPoints}
              unlockedRewards={unlockedRewards}
              streak={currentStreak}
              onClose={() => setCurrentView('home')}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default ChildExperience;