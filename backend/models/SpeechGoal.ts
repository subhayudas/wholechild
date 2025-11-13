import mongoose from 'mongoose';

const progressEntrySchema = new mongoose.Schema({
  date: {
    type: Date,
    required: true,
    default: Date.now
  },
  level: {
    type: Number,
    required: true
  },
  notes: {
    type: String,
    default: ''
  }
}, { _id: false });

const speechGoalSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  childId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Child',
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
  targetDate: {
    type: Date,
    required: true
  },
  category: {
    type: String,
    enum: ['articulation', 'language', 'fluency', 'voice', 'social'],
    required: true
  },
  currentLevel: {
    type: Number,
    default: 0
  },
  targetLevel: {
    type: Number,
    required: true
  },
  activities: [{
    type: String
  }],
  progress: [progressEntrySchema]
}, { timestamps: true });

export default mongoose.model('SpeechGoal', speechGoalSchema);










