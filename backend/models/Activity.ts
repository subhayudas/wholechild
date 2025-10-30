import mongoose from 'mongoose';

const activitySchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
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
  methodologies: [{
    type: String,
    enum: ['montessori', 'reggio', 'waldorf', 'highscope', 'bankstreet', 'play-based', 'inquiry-based']
  }],
  ageRange: {
    type: [Number],
    required: true,
    validate: {
      validator: function(v: number[]) {
        return v.length === 2 && v[0] < v[1];
      },
      message: 'Age range must have 2 numbers where first < second'
    }
  },
  duration: {
    type: Number,
    required: true
  },
  materials: [{
    type: String
  }],
  instructions: [{
    type: String
  }],
  learningObjectives: [{
    type: String
  }],
  developmentalAreas: [{
    type: String
  }],
  speechTargets: [{
    type: String
  }],
  otTargets: [{
    type: String
  }],
  difficulty: {
    type: Number,
    enum: [1, 2, 3, 4, 5],
    default: 3
  },
  category: {
    type: String,
    required: true
  },
  tags: [{
    type: String
  }],
  media: {
    images: [{
      type: String
    }],
    videos: [{
      type: String
    }],
    audio: [{
      type: String
    }]
  },
  adaptations: {
    sensory: [{
      type: String
    }],
    motor: [{
      type: String
    }],
    cognitive: [{
      type: String
    }]
  },
  assessment: {
    observationPoints: [{
      type: String
    }],
    milestones: [{
      type: String
    }]
  },
  createdBy: {
    type: String,
    required: true
  },
  rating: {
    type: Number,
    default: 0,
    min: 0,
    max: 5
  },
  reviews: {
    type: Number,
    default: 0
  },
  price: {
    type: Number,
    default: 0
  },
  parentGuidance: {
    setupTips: [{
      type: String
    }],
    encouragementPhrases: [{
      type: String
    }],
    extensionIdeas: [{
      type: String
    }],
    troubleshooting: [{
      type: String
    }]
  },
  isAIGenerated: {
    type: Boolean,
    default: false
  },
  isFavorite: {
    type: Boolean,
    default: false
  }
}, { timestamps: true });

export default mongoose.model('Activity', activitySchema);



