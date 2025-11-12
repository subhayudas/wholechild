import mongoose from 'mongoose';

const therapySessionSchema = new mongoose.Schema({
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
  type: {
    type: String,
    enum: ['speech', 'ot'],
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
  date: {
    type: Date,
    required: true,
    default: Date.now
  },
  duration: {
    type: Number,
    required: true
  },
  status: {
    type: String,
    enum: ['scheduled', 'in-progress', 'completed', 'cancelled'],
    default: 'scheduled'
  },
  goals: [{
    type: String
  }],
  activities: [{
    type: String
  }],
  notes: {
    type: String,
    default: ''
  },
  recordings: [{
    type: String
  }],
  assessmentData: {
    type: mongoose.Schema.Types.Mixed,
    default: null
  },
  therapistId: {
    type: String,
    required: true
  },
  progress: {
    goalsAchieved: {
      type: Number,
      default: 0
    },
    totalGoals: {
      type: Number,
      default: 0
    },
    notes: {
      type: String,
      default: ''
    }
  }
}, { timestamps: true });

export default mongoose.model('TherapySession', therapySessionSchema);









