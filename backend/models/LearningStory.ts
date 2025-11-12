import mongoose from 'mongoose';

const learningStorySchema = new mongoose.Schema({
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
  date: {
    type: Date,
    required: true,
    default: Date.now
  },
  activityId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Activity',
    default: null
  },
  media: {
    photos: [{
      type: String
    }],
    videos: [{
      type: String
    }],
    audio: [{
      type: String
    }]
  },
  observations: [{
    type: String
  }],
  milestones: [{
    type: String
  }],
  nextSteps: [{
    type: String
  }],
  developmentalAreas: [{
    type: String
  }],
  methodologyTags: [{
    type: String
  }],
  sharedWith: [{
    type: String
  }],
  isPrivate: {
    type: Boolean,
    default: false
  },
  reactions: {
    hearts: {
      type: Number,
      default: 0
    },
    celebrations: {
      type: Number,
      default: 0
    },
    insights: {
      type: Number,
      default: 0
    }
  }
}, { timestamps: true });

export default mongoose.model('LearningStory', learningStorySchema);









