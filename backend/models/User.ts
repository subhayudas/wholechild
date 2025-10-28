import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
  },
  password: {
    type: String,
    required: true,
  },
  role: {
    type: String,
    enum: ['parent', 'educator', 'therapist'],
    required: true,
  },
  avatar: {
    type: String,
    default: '',
  }
}, { timestamps: true });

export default mongoose.model('User', userSchema); 