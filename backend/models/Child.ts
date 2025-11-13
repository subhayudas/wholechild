import mongoose from 'mongoose';

const activityHistorySchema = new mongoose.Schema({
  activityId: {
    type: String,
    required: true
  },
  completedAt: {
    type: Date,
    required: true,
    default: Date.now
  },
  duration: {
    type: Number,
    required: true
  },
  notes: {
    type: String,
    default: ''
  },
  photos: [{
    type: String
  }],
  observations: [{
    type: String
  }]
}, { _id: false });

const achievementSchema = new mongoose.Schema({
  id: {
    type: String,
    required: true
  },
  title: {
    type: String,
    required: true
  },
  description: {
    type: String,
    required: true
  },
  unlockedAt: {
    type: Date,
    required: true,
    default: Date.now
  },
  category: {
    type: String,
    enum: ['milestone', 'streak', 'skill', 'creativity'],
    required: true
  }
}, { _id: false });

const childSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  name: {
    type: String,
    required: true
  },
  age: {
    type: Number,
    required: true
  },
  avatar: {
    type: String,
    default: ''
  },
  interests: [{
    type: String
  }],
  sensoryNeeds: [{
    type: String
  }],
  speechGoals: [{
    type: String
  }],
  otGoals: [{
    type: String
  }],
  developmentalProfile: {
    cognitive: {
      type: Number,
      default: 0
    },
    language: {
      type: Number,
      default: 0
    },
    social: {
      type: Number,
      default: 0
    },
    physical: {
      type: Number,
      default: 0
    },
    creative: {
      type: Number,
      default: 0
    }
  },
  currentLevel: {
    math: {
      type: Number,
      default: 0
    },
    reading: {
      type: Number,
      default: 0
    },
    writing: {
      type: Number,
      default: 0
    },
    science: {
      type: Number,
      default: 0
    }
  },
  preferences: {
    learningStyle: {
      type: String,
      enum: ['visual', 'auditory', 'kinesthetic', 'mixed'],
      default: 'visual'
    },
    energyLevel: {
      type: String,
      enum: ['low', 'medium', 'high'],
      default: 'medium'
    },
    socialPreference: {
      type: String,
      enum: ['independent', 'small-group', 'large-group'],
      default: 'small-group'
    }
  },
  activityHistory: [activityHistorySchema],
  achievements: [achievementSchema],
  totalPoints: {
    type: Number,
    default: 0
  },
  currentStreak: {
    type: Number,
    default: 0
  }
}, { timestamps: true });

export default mongoose.model('Child', childSchema);










