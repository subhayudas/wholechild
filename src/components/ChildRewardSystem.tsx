import React from 'react';
import { motion } from 'framer-motion';
import { 
  Trophy, 
  Star, 
  Heart, 
  Crown, 
  Gift, 
  Sparkles, 
  Target, 
  Zap, 
  Rainbow,
  Sun,
  Moon,
  Flower,
  ArrowLeft,
  Lock
} from 'lucide-react';
import { badgeDefinitions, rewardDefinitions } from '../config/activityConfig';

interface ChildRewardSystemProps {
  points: number;
  unlockedRewards: string[];
  streak: number;
  onClose: () => void;
}

const ChildRewardSystem: React.FC<ChildRewardSystemProps> = ({
  points,
  unlockedRewards,
  streak,
  onClose
}) => {
  // Map badge definitions to component format with icons
  const iconMap: Record<string, React.ReactNode> = {
    'first-steps': <Star className="w-8 h-8" />,
    'rainbow-badge': <Rainbow className="w-8 h-8" />,
    'star-collector': <Sparkles className="w-8 h-8" />,
    'super-learner': <Crown className="w-8 h-8" />,
    'streak-master': <Zap className="w-8 h-8" />,
    'creative-genius': <Flower className="w-8 h-8" />,
    'music-maestro': <Sun className="w-8 h-8" />,
    'night-owl': <Moon className="w-8 h-8" />
  };

  const colorMap: Record<string, string> = {
    'first-steps': 'from-yellow-400 to-orange-500',
    'rainbow-badge': 'from-pink-400 to-purple-500',
    'star-collector': 'from-blue-400 to-cyan-500',
    'super-learner': 'from-purple-500 to-pink-500',
    'streak-master': 'from-green-400 to-blue-500',
    'creative-genius': 'from-pink-500 to-red-500',
    'music-maestro': 'from-yellow-500 to-orange-500',
    'night-owl': 'from-indigo-500 to-purple-500'
  };

  const badges = badgeDefinitions.map(badge => ({
    ...badge,
    icon: iconMap[badge.id] || <Star className="w-8 h-8" />,
    color: colorMap[badge.id] || 'from-gray-400 to-gray-500',
    unlocked: badge.requirementType === 'streak' 
      ? streak >= badge.requirement
      : unlockedRewards.includes(badge.id)
  }));

  const rewards = rewardDefinitions.map(reward => ({
    ...reward,
    unlocked: points >= reward.cost
  }));

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-100 via-pink-100 to-yellow-100 p-4">
      {/* Header */}
      <motion.div
        className="flex items-center justify-between mb-8"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <motion.button
          onClick={onClose}
          className="bg-white p-3 rounded-full shadow-lg"
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
        >
          <ArrowLeft className="w-6 h-6 text-gray-600" />
        </motion.button>
        
        <h1 className="text-3xl font-bold text-gray-800 flex items-center gap-2">
          <Trophy className="w-8 h-8 text-yellow-500" />
          My Rewards! 🎉
        </h1>
        
        <div className="w-12" /> {/* Spacer */}
      </motion.div>

      {/* Stats Overview */}
      <motion.div
        className="grid grid-cols-3 gap-4 mb-8"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.1 }}
      >
        <div className="bg-white rounded-2xl p-6 shadow-lg text-center">
          <Star className="w-12 h-12 text-yellow-500 mx-auto mb-2" />
          <div className="text-3xl font-bold text-gray-800">{points}</div>
          <div className="text-sm text-gray-600">Learning Stars</div>
        </div>
        
        <div className="bg-white rounded-2xl p-6 shadow-lg text-center">
          <Zap className="w-12 h-12 text-blue-500 mx-auto mb-2" />
          <div className="text-3xl font-bold text-gray-800">{streak}</div>
          <div className="text-sm text-gray-600">Day Streak</div>
        </div>
        
        <div className="bg-white rounded-2xl p-6 shadow-lg text-center">
          <Crown className="w-12 h-12 text-purple-500 mx-auto mb-2" />
          <div className="text-3xl font-bold text-gray-800">{unlockedRewards.length}</div>
          <div className="text-sm text-gray-600">Badges Earned</div>
        </div>
      </motion.div>

      {/* Badges Section */}
      <motion.div
        className="mb-8"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.2 }}
      >
        <h2 className="text-2xl font-bold text-gray-800 mb-4 flex items-center gap-2">
          <Sparkles className="w-6 h-6 text-purple-500" />
          Achievement Badges
        </h2>
        
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {badges.map((badge, index) => (
            <motion.div
              key={badge.id}
              className={`bg-white rounded-2xl p-6 shadow-lg text-center relative overflow-hidden ${
                badge.unlocked ? '' : 'opacity-60'
              }`}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.6, delay: 0.1 * index }}
              whileHover={{ scale: badge.unlocked ? 1.05 : 1 }}
            >
              {!badge.unlocked && (
                <div className="absolute top-2 right-2">
                  <Lock className="w-5 h-5 text-gray-400" />
                </div>
              )}
              
              <motion.div
                className={`w-16 h-16 rounded-full bg-gradient-to-br ${badge.color} flex items-center justify-center text-white mx-auto mb-3`}
                animate={badge.unlocked ? { rotate: [0, 5, -5, 0] } : {}}
                transition={{ duration: 2, repeat: Infinity }}
              >
                {badge.icon}
              </motion.div>
              
              <h3 className="font-bold text-gray-800 mb-1">{badge.name}</h3>
              <p className="text-xs text-gray-600 mb-2">{badge.description}</p>
              
              {badge.unlocked ? (
                <motion.div
                  className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-xs font-medium"
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: "spring", stiffness: 200 }}
                >
                  ✓ Earned!
                </motion.div>
              ) : (
                <div className="bg-gray-100 text-gray-500 px-3 py-1 rounded-full text-xs">
                  {badge.requirement} needed
                </div>
              )}
            </motion.div>
          ))}
        </div>
      </motion.div>

      {/* Rewards Shop */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.3 }}
      >
        <h2 className="text-2xl font-bold text-gray-800 mb-4 flex items-center gap-2">
          <Gift className="w-6 h-6 text-pink-500" />
          Reward Shop
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {rewards.map((reward, index) => (
            <motion.div
              key={reward.id}
              className={`bg-white rounded-2xl p-6 shadow-lg ${
                reward.unlocked ? 'border-2 border-green-300' : 'opacity-60'
              }`}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.1 * index }}
              whileHover={{ scale: reward.unlocked ? 1.02 : 1 }}
            >
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-lg font-bold text-gray-800">{reward.name}</h3>
                  <p className="text-sm text-gray-600">{reward.description}</p>
                </div>
                
                <div className="text-right">
                  <div className="flex items-center gap-1 mb-1">
                    <Star className="w-4 h-4 text-yellow-500" />
                    <span className="font-bold text-gray-800">{reward.cost}</span>
                  </div>
                  {reward.unlocked ? (
                    <motion.button
                      className="bg-gradient-to-r from-green-500 to-blue-500 text-white px-4 py-2 rounded-lg font-medium text-sm"
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      Unlock!
                    </motion.button>
                  ) : (
                    <div className="bg-gray-100 text-gray-500 px-4 py-2 rounded-lg text-sm">
                      Need {reward.cost - points} more
                    </div>
                  )}
                </div>
              </div>
              
              <div className="w-full bg-gray-200 rounded-full h-2">
                <motion.div
                  className="bg-gradient-to-r from-blue-500 to-purple-500 h-2 rounded-full"
                  initial={{ width: 0 }}
                  animate={{ width: `${Math.min((points / reward.cost) * 100, 100)}%` }}
                  transition={{ duration: 1, delay: 0.5 }}
                />
              </div>
            </motion.div>
          ))}
        </div>
      </motion.div>

      {/* Motivational Message */}
      <motion.div
        className="mt-8 bg-gradient-to-r from-yellow-200 to-pink-200 rounded-2xl p-6 text-center"
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
        <h3 className="text-xl font-bold text-gray-800 mb-2">Keep Learning! 🌟</h3>
        <p className="text-gray-700">
          Every activity you complete brings you closer to amazing rewards!
        </p>
      </motion.div>
    </div>
  );
};

export default ChildRewardSystem;